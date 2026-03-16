# TUI Client Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Ink-based TUI client that covers all 16 API endpoints of the D&D 5e encounter tracker.

**Architecture:** Screen-based navigation with a state machine in `<App />`. A single `ApiClient` instance wraps all HTTP calls. Four reusable components (SelectList, Table, Header, TextInput) provide the interaction primitives. Each screen maps to one level of the DM → Campaign → Encounter → Initiative hierarchy.

**Tech Stack:** Ink (React for CLIs), React 18, TypeScript, Node.js fetch API, ink-text-input

**Spec:** `docs/superpowers/specs/2026-03-15-tui-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/tui/tsconfig.json` | Extends root tsconfig, overrides `jsxImportSource` to `react` |
| `src/tui/index.tsx` | Entry point — renders `<App />` with Ink's `render()` |
| `src/tui/types.ts` | Shared types: Screen, AppContext, API response shapes |
| `src/tui/api.ts` | `ApiClient` class — wraps fetch for all 16 endpoints |
| `src/tui/app.tsx` | Top-level component — screen router + state machine |
| `src/tui/components/select-list.tsx` | Arrow-key menu selector |
| `src/tui/components/table.tsx` | Columnar data display |
| `src/tui/components/header.tsx` | Breadcrumb bar |
| `src/tui/components/text-input.tsx` | Labeled text input wrapping ink-text-input |
| `src/tui/ink-text-input.d.ts` | Type declarations for ink-text-input (no bundled types) |
| `src/tui/screens/login.tsx` | Username prompt → POST /api/auth/login |
| `src/tui/screens/campaigns.tsx` | List/create campaigns |
| `src/tui/screens/campaign-detail.tsx` | Manage PCs, list/create encounters |
| `src/tui/screens/encounter-detail.tsx` | Manage monsters & PCs, start encounter |
| `src/tui/screens/initiative.tsx` | Collect initiatives, display turn order |

---

## Chunk 1: Project Setup, Types & API Client

### Task 1: Install dependencies and configure project

**Files:**
- Modify: `package.json` (add deps + tui script)
- Create: `src/tui/tsconfig.json`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add ink react@^18 ink-text-input
pnpm add -D @types/react
```

- [ ] **Step 2: Add tui script to package.json**

Add to `scripts` in `package.json`:
```json
"tui": "tsx --tsconfig src/tui/tsconfig.json src/tui/index.tsx"
```

Note: `tsx` does not auto-discover `tsconfig.json` in subdirectories. The `--tsconfig` flag is required so JSX resolves against `react` instead of `hono/jsx`.

- [ ] **Step 3: Create TUI tsconfig**

Create `src/tui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsxImportSource": "react"
  }
}
```

- [ ] **Step 4: Exclude TUI from root build and verify**

Add `"src/tui"` to the `exclude` array in the root `tsconfig.json` so `pnpm build` doesn't try to compile TUI files with `hono/jsx`:

```json
"exclude": ["node_modules", "src/tui"]
```

Run: `pnpm build`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/tui/tsconfig.json tsconfig.json
git commit -m "chore: add Ink/React deps and TUI tsconfig"
```

---

### Task 2: Define shared types

**Files:**
- Create: `src/tui/types.ts`

- [ ] **Step 1: Create types file**

```typescript
export type Screen = 'login' | 'campaigns' | 'campaign-detail' | 'encounter-detail' | 'initiative'

export type AppContext = {
  username: string | null
  dmId: string | null
  campaign: { id: string; name: string } | null
  encounter: { id: string; name: string } | null
  turnOrder: TurnOrderEntry[] | null
}

export type Campaign = {
  id: string
  name: string
  dmId: string
  createdAt: string
}

export type PC = {
  id: string
  name: string
  playerName: string
  campaignId: string
}

export type Encounter = {
  id: string
  name: string
  campaignId: string
  encounterNumber: number
  status: string
}

export type Monster = {
  id: string
  name: string
  encounterInstanceName: string
  initiativeModifier: number
  encounterId: string
}

export type TurnOrderEntry = {
  participantId: string
  participantType: 'pc' | 'monster'
  name: string
  initiative: number
}

export type StartResult = {
  status: string
  turnOrder: TurnOrderEntry[]
}

export type EncounterDetail = Encounter & {
  monsters: Monster[]
  pcs: PC[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/tui/types.ts
git commit -m "feat(tui): add shared type definitions"
```

---

### Task 3: Implement API client

**Files:**
- Create: `src/tui/api.ts`

The API client wraps all 16 server endpoints. Uses Node's built-in `fetch`. Manages `X-DM-Username` header internally after login. Throws on non-2xx responses with the server's error message.

- [ ] **Step 1: Create API client**

```typescript
import type { Campaign, PC, Encounter, EncounterDetail, Monster, StartResult } from './types.js'

export class ApiClient {
  private baseUrl: string
  private username: string | null = null

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.username) {
      headers['X-DM-Username'] = this.username
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 204) return undefined as T

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? `Request failed: ${res.status}`)
    }

    return data as T
  }

  // Auth
  async login(username: string): Promise<{ id: string; username: string }> {
    const result = await this.request<{ id: string; username: string }>('POST', '/api/auth/login', { username })
    this.username = result.username
    return result
  }

  // Campaigns
  getCampaigns(): Promise<Campaign[]> {
    return this.request('GET', '/api/campaigns')
  }

  createCampaign(name: string): Promise<Campaign> {
    return this.request('POST', '/api/campaigns', { name })
  }

  getCampaign(id: string): Promise<Campaign> {
    return this.request('GET', `/api/campaigns/${id}`)
  }

  // PCs
  getPCs(campaignId: string): Promise<PC[]> {
    return this.request('GET', `/api/campaigns/${campaignId}/pcs`)
  }

  createPC(campaignId: string, name: string, playerName: string): Promise<PC> {
    return this.request('POST', `/api/campaigns/${campaignId}/pcs`, { name, playerName })
  }

  // Encounters
  getEncounters(campaignId: string): Promise<Encounter[]> {
    return this.request('GET', `/api/campaigns/${campaignId}/encounters`)
  }

  getEncounter(id: string): Promise<EncounterDetail> {
    return this.request('GET', `/api/encounters/${id}`)
  }

  createEncounter(campaignId: string, name: string): Promise<Encounter> {
    return this.request('POST', `/api/campaigns/${campaignId}/encounters`, { name })
  }

  // Monsters
  getMonsters(encounterId: string): Promise<Monster[]> {
    return this.request('GET', `/api/encounters/${encounterId}/monsters`)
  }

  addMonsters(encounterId: string, name: string, quantity: number, initiativeModifier: number): Promise<Monster[]> {
    return this.request('POST', `/api/encounters/${encounterId}/monsters`, { name, quantity, initiativeModifier })
  }

  removeMonster(encounterId: string, monsterId: string): Promise<void> {
    return this.request('DELETE', `/api/encounters/${encounterId}/monsters/${monsterId}`)
  }

  // Encounter PCs
  getEncounterPCs(encounterId: string): Promise<PC[]> {
    return this.request('GET', `/api/encounters/${encounterId}/pcs`)
  }

  assignPCs(encounterId: string, pcIds: string[]): Promise<PC[]> {
    return this.request('POST', `/api/encounters/${encounterId}/pcs`, { pcIds })
  }

  removeEncounterPC(encounterId: string, pcId: string): Promise<void> {
    return this.request('DELETE', `/api/encounters/${encounterId}/pcs/${pcId}`)
  }

  // Initiative
  startEncounter(encounterId: string, monsterInitiatives: 'auto' | 'manual', initiatives: Record<string, number>): Promise<StartResult> {
    return this.request('POST', `/api/encounters/${encounterId}/start`, { monsterInitiatives, initiatives })
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tui/api.ts
git commit -m "feat(tui): add API client wrapping all 16 endpoints"
```

---

## Chunk 2: Reusable Components

### Task 4: SelectList component

**Files:**
- Create: `src/tui/components/select-list.tsx`

Arrow-key navigable menu. Highlights current selection with `>`. Enter to confirm. This is the primary interaction pattern.

- [ ] **Step 1: Create SelectList**

```tsx
import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

type SelectListProps = {
  items: { label: string; value: string }[]
  onSelect: (value: string) => void
}

export function SelectList({ items, onSelect }: SelectListProps) {
  const [index, setIndex] = useState(0)

  useInput((input, key) => {
    if (key.upArrow) {
      setIndex(i => (i > 0 ? i - 1 : items.length - 1))
    }
    if (key.downArrow) {
      setIndex(i => (i < items.length - 1 ? i + 1 : 0))
    }
    if (key.return) {
      onSelect(items[index].value)
    }
  })

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Text key={item.value} color={i === index ? 'cyan' : undefined} bold={i === index}>
          {i === index ? '> ' : '  '}{item.label}
        </Text>
      ))}
    </Box>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tui/components/select-list.tsx
git commit -m "feat(tui): add SelectList component"
```

---

### Task 5: Table component

**Files:**
- Create: `src/tui/components/table.tsx`

Renders columnar data with headers. Left-aligns and pads columns to fit.

- [ ] **Step 1: Create Table**

```tsx
import React from 'react'
import { Box, Text } from 'ink'

type TableProps = {
  columns: string[]
  rows: string[][]
}

export function Table({ columns, rows }: TableProps) {
  const widths = columns.map((col, i) => {
    const dataWidths = rows.map(row => (row[i] ?? '').length)
    return Math.max(col.length, ...dataWidths) + 2
  })

  const pad = (str: string, width: number) => str + ' '.repeat(Math.max(0, width - str.length))

  return (
    <Box flexDirection="column">
      <Text bold>
        {columns.map((col, i) => pad(col, widths[i])).join('')}
      </Text>
      <Text dimColor>
        {widths.map(w => '─'.repeat(w)).join('')}
      </Text>
      {rows.map((row, ri) => (
        <Text key={ri}>
          {row.map((cell, ci) => pad(cell, widths[ci])).join('')}
        </Text>
      ))}
    </Box>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tui/components/table.tsx
git commit -m "feat(tui): add Table component"
```

---

### Task 6: Header component

**Files:**
- Create: `src/tui/components/header.tsx`

Breadcrumb bar. Shows `DM: {username} > Campaign: {name} > Encounter: {name}` based on current context.

- [ ] **Step 1: Create Header**

```tsx
import React from 'react'
import { Box, Text } from 'ink'
import type { AppContext } from '../types.js'

type HeaderProps = {
  context: AppContext
}

export function Header({ context }: HeaderProps) {
  const parts: string[] = []

  if (context.username) {
    parts.push(`DM: ${context.username}`)
  }
  if (context.campaign) {
    parts.push(`Campaign: ${context.campaign.name}`)
  }
  if (context.encounter) {
    parts.push(`Encounter: ${context.encounter.name}`)
  }

  if (parts.length === 0) return null

  return (
    <Box marginBottom={1}>
      <Text color="green" bold>{parts.join(' > ')}</Text>
    </Box>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tui/components/header.tsx
git commit -m "feat(tui): add Header breadcrumb component"
```

---

### Task 7: TextInput component

**Files:**
- Create: `src/tui/components/text-input.tsx`

Labeled text input wrapping `ink-text-input`.

- [ ] **Step 1: Create TextInput**

```tsx
import React, { useState } from 'react'
import { Box, Text } from 'ink'
import InkTextInput from 'ink-text-input'

type TextInputProps = {
  label: string
  onSubmit: (value: string) => void
}

export function TextInput({ label, onSubmit }: TextInputProps) {
  const [value, setValue] = useState('')

  return (
    <Box>
      <Text>{label}: </Text>
      <InkTextInput value={value} onChange={setValue} onSubmit={onSubmit} />
    </Box>
  )
}
```

- [ ] **Step 2: Create type declarations for ink-text-input**

`ink-text-input` does not ship bundled types. Create `src/tui/ink-text-input.d.ts`:

```typescript
declare module 'ink-text-input' {
  import type { FC } from 'react'
  interface Props {
    value: string
    onChange: (value: string) => void
    onSubmit?: (value: string) => void
    placeholder?: string
    focus?: boolean
    mask?: string
  }
  const TextInput: FC<Props>
  export default TextInput
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/tui/components/text-input.tsx src/tui/ink-text-input.d.ts
git commit -m "feat(tui): add TextInput component with ink-text-input types"
```

---

## Chunk 3: App Shell, Login & Campaigns

### Task 8: App shell with screen router and entry point

**Files:**
- Create: `src/tui/app.tsx`
- Create: `src/tui/index.tsx`

The `<App />` component manages navigation state. For now, only renders Login. Other screens will be stubs until implemented.

- [ ] **Step 1: Create App component**

```tsx
import React, { useState, useCallback } from 'react'
import { Box, useInput } from 'ink'
import { ApiClient } from './api.js'
import { Header } from './components/header.js'
import { Login } from './screens/login.js'
import { Campaigns } from './screens/campaigns.js'
import type { Screen, AppContext, TurnOrderEntry } from './types.js'

const api = new ApiClient()

const BACK_MAP: Record<Screen, Screen | null> = {
  'login': null,
  'campaigns': null,
  'campaign-detail': 'campaigns',
  'encounter-detail': 'campaign-detail',
  'initiative': 'encounter-detail',
}

export function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [inputActive, setInputActive] = useState(false)
  const [context, setContext] = useState<AppContext>({
    username: null,
    dmId: null,
    campaign: null,
    encounter: null,
    turnOrder: null,
  })

  const navigate = useCallback((target: Screen, updates?: Partial<AppContext>) => {
    if (updates) {
      setContext(prev => ({ ...prev, ...updates }))
    }
    setScreen(target)
  }, [])

  useInput((_input, key) => {
    if (key.escape && !inputActive) {
      const back = BACK_MAP[screen]
      if (back) {
        // Clear context fields when going back
        if (screen === 'encounter-detail' || screen === 'initiative') {
          setContext(prev => ({ ...prev, encounter: null, turnOrder: null }))
        } else if (screen === 'campaign-detail') {
          setContext(prev => ({ ...prev, campaign: null }))
        }
        setScreen(back)
      }
    }
  })

  return (
    <Box flexDirection="column">
      <Header context={context} />
      {screen === 'login' && <Login api={api} navigate={navigate} setInputActive={setInputActive} />}
      {screen === 'campaigns' && <Campaigns api={api} context={context} navigate={navigate} setInputActive={setInputActive} />}
    </Box>
  )
}
```

**Key design decision:** The `inputActive` state flag prevents the App-level Escape handler from firing while the user is typing in a `TextInput`. Each screen receives `setInputActive` as a prop and calls `setInputActive(true)` when entering a text input mode and `setInputActive(false)` when leaving it. This is threaded through to all screens.
```

Note: This imports `Login` and `Campaigns` screens which will be created in the next tasks. The remaining screens will be added in Chunk 4 — for now the component only renders login and campaigns.

- [ ] **Step 2: Create entry point**

```tsx
import React from 'react'
import { render } from 'ink'
import { App } from './app.js'

render(<App />)
```

- [ ] **Step 3: Commit (don't verify yet — screens not created)**

```bash
git add src/tui/app.tsx src/tui/index.tsx
git commit -m "feat(tui): add App shell with navigation and entry point"
```

---

### Task 9: Login screen

**Files:**
- Create: `src/tui/screens/login.tsx`

Text input for username. On submit, calls `POST /api/auth/login`. Sets context and navigates to campaigns.

- [ ] **Step 1: Create Login screen**

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { TextInput } from '../components/text-input.js'
import type { ApiClient } from '../api.js'
import type { Screen, AppContext } from '../types.js'

type LoginProps = {
  api: ApiClient
  navigate: (screen: Screen, updates?: Partial<AppContext>) => void
  setInputActive: (active: boolean) => void
}

export function Login({ api, navigate, setInputActive }: LoginProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInputActive(true)
    return () => setInputActive(false)
  }, [])

  const handleSubmit = async (username: string) => {
    if (!username.trim()) return
    try {
      setInputActive(false)
      const result = await api.login(username.trim())
      navigate('campaigns', { username: result.username, dmId: result.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <Box flexDirection="column">
      <Text bold>D&D Encounter Tracker</Text>
      <Text> </Text>
      <TextInput label="Enter username" onSubmit={handleSubmit} />
      {error && <Text color="red">{error}</Text>}
    </Box>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/tui/screens/login.tsx
git commit -m "feat(tui): add Login screen"
```

---

### Task 10: Campaigns screen

**Files:**
- Create: `src/tui/screens/campaigns.tsx`

Lists campaigns with `[+ New Campaign]` at top. Selecting a campaign navigates to campaign-detail. Selecting new prompts for name, creates campaign, then navigates.

- [ ] **Step 1: Create Campaigns screen**

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { SelectList } from '../components/select-list.js'
import { TextInput } from '../components/text-input.js'
import type { ApiClient } from '../api.js'
import type { Screen, AppContext, Campaign } from '../types.js'

type CampaignsProps = {
  api: ApiClient
  context: AppContext
  navigate: (screen: Screen, updates?: Partial<AppContext>) => void
  setInputActive: (active: boolean) => void
}

export function Campaigns({ api, context, navigate, setInputActive }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.getCampaigns()
      setCampaigns(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSelect = (value: string) => {
    if (value === '__new__') {
      setCreating(true)
      setInputActive(true)
      return
    }
    const campaign = campaigns.find(c => c.id === value)
    if (campaign) {
      navigate('campaign-detail', { campaign: { id: campaign.id, name: campaign.name } })
    }
  }

  const handleCreate = async (name: string) => {
    if (!name.trim()) return
    try {
      setInputActive(false)
      const campaign = await api.createCampaign(name.trim())
      navigate('campaign-detail', { campaign: { id: campaign.id, name: campaign.name } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      setCreating(false)
      setInputActive(false)
    }
  }

  if (loading) return <Text>Loading campaigns...</Text>

  if (creating) {
    return (
      <Box flexDirection="column">
        <TextInput label="Campaign name" onSubmit={handleCreate} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  const items = [
    { label: '[+ New Campaign]', value: '__new__' },
    ...campaigns.map(c => ({ label: c.name, value: c.id })),
  ]

  return (
    <Box flexDirection="column">
      <Text bold>Campaigns</Text>
      <Text> </Text>
      <SelectList items={items} onSelect={handleSelect} />
      {error && <Text color="red">{error}</Text>}
    </Box>
  )
}
```

- [ ] **Step 2: Verify everything compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 3: Manual smoke test**

Start the server in one terminal: `pnpm dev`
In another terminal: `pnpm tui`

Verify:
1. Login screen appears with username prompt
2. Enter a username — navigates to campaigns list
3. `[+ New Campaign]` appears at top
4. Create a campaign — navigates to campaign detail (blank for now, will show nothing beyond header)
5. Escape goes back to campaigns list
6. New campaign appears in list
7. Ctrl+C exits

- [ ] **Step 4: Commit**

```bash
git add src/tui/screens/campaigns.tsx
git commit -m "feat(tui): add Campaigns screen with create flow"
```

---

## Chunk 4: Campaign Detail, Encounter Detail & Initiative

### Task 11: Campaign Detail screen

**Files:**
- Create: `src/tui/screens/campaign-detail.tsx`
- Modify: `src/tui/app.tsx` (add import and render for CampaignDetail)

Shows campaign name. Menu with PCs, Encounters, and Back sections.

- [ ] **Step 1: Create CampaignDetail screen**

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { SelectList } from '../components/select-list.js'
import { TextInput } from '../components/text-input.js'
import { Table } from '../components/table.js'
import type { ApiClient } from '../api.js'
import type { Screen, AppContext, PC, Encounter } from '../types.js'

type CampaignDetailProps = {
  api: ApiClient
  context: AppContext
  navigate: (screen: Screen, updates?: Partial<AppContext>) => void
  setInputActive: (active: boolean) => void
}

type Mode = 'menu' | 'pcs' | 'add-pc-name' | 'add-pc-player' | 'encounters' | 'add-encounter'

export function CampaignDetail({ api, context, navigate, setInputActive }: CampaignDetailProps) {
  const campaignId = context.campaign!.id
  const [mode, setMode] = useState<Mode>('menu')
  const [pcs, setPCs] = useState<PC[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newPCName, setNewPCName] = useState('')

  const loadPCs = async () => {
    try {
      setLoading(true)
      setPCs(await api.getPCs(campaignId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PCs')
    } finally {
      setLoading(false)
    }
  }

  const loadEncounters = async () => {
    try {
      setLoading(true)
      setEncounters(await api.getEncounters(campaignId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load encounters')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'menu') {
    const items = [
      { label: 'Player Characters', value: 'pcs' },
      { label: 'Encounters', value: 'encounters' },
      { label: '← Back', value: 'back' },
    ]

    const handleSelect = (value: string) => {
      if (value === 'back') {
        navigate('campaigns', { campaign: null })
        return
      }
      if (value === 'pcs') {
        loadPCs()
        setMode('pcs')
        return
      }
      if (value === 'encounters') {
        loadEncounters()
        setMode('encounters')
        return
      }
    }

    return (
      <Box flexDirection="column">
        <SelectList items={items} onSelect={handleSelect} />
      </Box>
    )
  }

  if (mode === 'pcs') {
    if (loading) return <Text>Loading PCs...</Text>

    const items = [
      { label: '[+ Add PC]', value: '__add__' },
      { label: '← Back', value: '__back__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Player Characters</Text>
        <Text> </Text>
        {pcs.length > 0 && (
          <Table
            columns={['Name', 'Player']}
            rows={pcs.map(pc => [pc.name, pc.playerName])}
          />
        )}
        {pcs.length === 0 && <Text dimColor>No PCs yet</Text>}
        <Text> </Text>
        <SelectList items={items} onSelect={(v) => {
          if (v === '__add__') setMode('add-pc-name')
          else setMode('menu')
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (mode === 'add-pc-name') {
    setInputActive(true)
    return (
      <Box flexDirection="column">
        <TextInput label="Character name" onSubmit={(name) => {
          if (!name.trim()) return
          setNewPCName(name.trim())
          setMode('add-pc-player')
        }} />
      </Box>
    )
  }

  if (mode === 'add-pc-player') {
    return (
      <Box flexDirection="column">
        <Text>Character: {newPCName}</Text>
        <TextInput key="player-name" label="Player name" onSubmit={async (playerName) => {
          if (!playerName.trim()) return
          try {
            setInputActive(false)
            await api.createPC(campaignId, newPCName, playerName.trim())
            await loadPCs()
            setMode('pcs')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create PC')
            setInputActive(false)
            setMode('pcs')
          }
        }} />
      </Box>
    )
  }

  if (mode === 'encounters') {
    if (loading) return <Text>Loading encounters...</Text>

    const items = [
      { label: '[+ New Encounter]', value: '__new__' },
      ...encounters.map(e => ({
        label: `${e.name} [${e.status}]`,
        value: e.id,
      })),
      { label: '← Back', value: '__back__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Encounters</Text>
        <Text> </Text>
        <SelectList items={items} onSelect={(value) => {
          if (value === '__new__') {
            setMode('add-encounter')
            return
          }
          if (value === '__back__') {
            setMode('menu')
            return
          }
          const encounter = encounters.find(e => e.id === value)
          if (encounter) {
            navigate('encounter-detail', { encounter: { id: encounter.id, name: encounter.name } })
          }
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (mode === 'add-encounter') {
    setInputActive(true)
    return (
      <Box flexDirection="column">
        <TextInput label="Encounter name" onSubmit={async (name) => {
          if (!name.trim()) return
          try {
            setInputActive(false)
            const encounter = await api.createEncounter(campaignId, name.trim())
            navigate('encounter-detail', { encounter: { id: encounter.id, name: encounter.name } })
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create encounter')
            setInputActive(false)
            setMode('encounters')
          }
        }} />
      </Box>
    )
  }

  return null
}
```

- [ ] **Step 2: Update App to render CampaignDetail**

In `src/tui/app.tsx`, add import:
```typescript
import { CampaignDetail } from './screens/campaign-detail.js'
```

Add render line after the campaigns render:
```tsx
{screen === 'campaign-detail' && <CampaignDetail api={api} context={context} navigate={navigate} setInputActive={setInputActive} />}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 4: Manual smoke test**

With server running (`pnpm dev`), run `pnpm tui`:
1. Login, select or create a campaign
2. Menu shows PCs, Encounters, Back
3. PCs: view list, add a PC (two prompts: name, player)
4. Encounters: view list with status badges, create new
5. Back navigation works at all levels

- [ ] **Step 5: Commit**

```bash
git add src/tui/screens/campaign-detail.tsx src/tui/app.tsx
git commit -m "feat(tui): add Campaign Detail screen with PC and encounter management"
```

---

### Task 12: Encounter Detail screen

**Files:**
- Create: `src/tui/screens/encounter-detail.tsx`
- Modify: `src/tui/app.tsx` (add import and render)

Shows encounter info. Draft: manage monsters, PCs, start encounter. Active: show cached turn order.

- [ ] **Step 1: Create EncounterDetail screen**

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { SelectList } from '../components/select-list.js'
import { TextInput } from '../components/text-input.js'
import { Table } from '../components/table.js'
import type { ApiClient } from '../api.js'
import type { Screen, AppContext, Monster, PC, EncounterDetail as EncounterDetailType } from '../types.js'

type EncounterDetailProps = {
  api: ApiClient
  context: AppContext
  navigate: (screen: Screen, updates?: Partial<AppContext>) => void
  setInputActive: (active: boolean) => void
}

type Mode =
  | 'loading'
  | 'menu'
  | 'monsters'
  | 'add-monster-name'
  | 'add-monster-qty'
  | 'add-monster-mod'
  | 'remove-monster'
  | 'pcs'
  | 'assign-pcs'
  | 'remove-pc'
  | 'active'

export function EncounterDetail({ api, context, navigate, setInputActive }: EncounterDetailProps) {
  const encounterId = context.encounter!.id
  const campaignId = context.campaign!.id
  const [encounter, setEncounter] = useState<EncounterDetailType | null>(null)
  const [campaignPCs, setCampaignPCs] = useState<PC[]>([])
  const [mode, setMode] = useState<Mode>('loading')
  const [error, setError] = useState<string | null>(null)

  // Monster creation state
  const [monsterName, setMonsterName] = useState('')
  const [monsterQty, setMonsterQty] = useState('')

  const load = async () => {
    try {
      const data = await api.getEncounter(encounterId)
      setEncounter(data)
      setError(null)
      setMode(data.status === 'active' ? 'active' : 'menu')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load encounter')
      setMode('menu')
    }
  }

  useEffect(() => { load() }, [])

  if (mode === 'loading') return <Text>Loading encounter...</Text>

  if (mode === 'active') {
    return (
      <Box flexDirection="column">
        <Text bold>Encounter: {encounter?.name} [active]</Text>
        <Text> </Text>
        {context.turnOrder ? (
          <Table
            columns={['#', 'Name', 'Type', 'Initiative']}
            rows={context.turnOrder.map((t, i) => [
              String(i + 1),
              t.name,
              t.participantType,
              String(t.initiative),
            ])}
          />
        ) : (
          <Text dimColor>Turn order was set when this encounter started. Re-start the TUI during encounter start to see it.</Text>
        )}
        <Text> </Text>
        <SelectList items={[{ label: '← Back', value: 'back' }]} onSelect={() => {
          navigate('campaign-detail', { encounter: null, turnOrder: null })
        }} />
      </Box>
    )
  }

  if (mode === 'menu') {
    const items = [
      { label: `Monsters (${encounter?.monsters.length ?? 0})`, value: 'monsters' },
      { label: `PCs (${encounter?.pcs.length ?? 0})`, value: 'pcs' },
      { label: 'Start Encounter', value: 'start' },
      { label: '← Back', value: 'back' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Encounter: {encounter?.name} [draft]</Text>
        <Text> </Text>
        <SelectList items={items} onSelect={(value) => {
          if (value === 'back') {
            navigate('campaign-detail', { encounter: null })
            return
          }
          if (value === 'start') {
            navigate('initiative')
            return
          }
          if (value === 'monsters') setMode('monsters')
          if (value === 'pcs') {
            api.getPCs(campaignId).then(setCampaignPCs).catch(() => {})
            setMode('pcs')
          }
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (mode === 'monsters') {
    const monsters = encounter?.monsters ?? []
    const items = [
      { label: '[+ Add Monsters]', value: '__add__' },
      ...(monsters.length > 0 ? [{ label: '[- Remove Monster]', value: '__remove__' }] : []),
      { label: '← Back', value: '__back__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Monsters</Text>
        <Text> </Text>
        {monsters.length > 0 && (
          <Table
            columns={['Name', 'Init Mod']}
            rows={monsters.map(m => [m.encounterInstanceName, String(m.initiativeModifier)])}
          />
        )}
        {monsters.length === 0 && <Text dimColor>No monsters yet</Text>}
        <Text> </Text>
        <SelectList items={items} onSelect={(v) => {
          if (v === '__add__') setMode('add-monster-name')
          else if (v === '__remove__') setMode('remove-monster')
          else { setMode('menu') }
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (mode === 'add-monster-name') {
    setInputActive(true)
    return (
      <TextInput label="Monster name" onSubmit={(name) => {
        if (!name.trim()) return
        setMonsterName(name.trim())
        setMode('add-monster-qty')
      }} />
    )
  }

  if (mode === 'add-monster-qty') {
    return (
      <Box flexDirection="column">
        <Text>Monster: {monsterName}</Text>
        <TextInput key="monster-qty" label="Quantity (default 1)" onSubmit={(qty) => {
          setMonsterQty(qty.trim() || '1')
          setMode('add-monster-mod')
        }} />
      </Box>
    )
  }

  if (mode === 'add-monster-mod') {
    return (
      <Box flexDirection="column">
        <Text>Monster: {monsterName} x{monsterQty}</Text>
        <TextInput key="monster-mod" label="Initiative modifier (default 0)" onSubmit={async (mod) => {
          const quantity = parseInt(monsterQty, 10) || 1
          const initiativeModifier = parseInt(mod.trim() || '0', 10) || 0
          try {
            setInputActive(false)
            await api.addMonsters(encounterId, monsterName, quantity, initiativeModifier)
            await load()
            setMode('monsters')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add monsters')
            setInputActive(false)
            setMode('monsters')
          }
        }} />
      </Box>
    )
  }

  if (mode === 'remove-monster') {
    const monsters = encounter?.monsters ?? []
    const items = [
      ...monsters.map(m => ({ label: m.encounterInstanceName, value: m.id })),
      { label: '← Cancel', value: '__cancel__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Remove which monster?</Text>
        <Text> </Text>
        <SelectList items={items} onSelect={async (value) => {
          if (value === '__cancel__') {
            setMode('monsters')
            return
          }
          try {
            await api.removeMonster(encounterId, value)
            await load()
            setMode('monsters')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove monster')
            setMode('monsters')
          }
        }} />
      </Box>
    )
  }

  if (mode === 'pcs') {
    const assignedPCs = encounter?.pcs ?? []
    const items = [
      { label: '[+ Assign PCs]', value: '__assign__' },
      ...(assignedPCs.length > 0 ? [{ label: '[- Remove PC]', value: '__remove__' }] : []),
      { label: '← Back', value: '__back__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Assigned PCs</Text>
        <Text> </Text>
        {assignedPCs.length > 0 && (
          <Table
            columns={['Character', 'Player']}
            rows={assignedPCs.map(pc => [pc.name, pc.playerName])}
          />
        )}
        {assignedPCs.length === 0 && <Text dimColor>No PCs assigned</Text>}
        <Text> </Text>
        <SelectList items={items} onSelect={(v) => {
          if (v === '__assign__') setMode('assign-pcs')
          else if (v === '__remove__') setMode('remove-pc')
          else setMode('menu')
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  // Note: Spec says "checklist" (multi-select), but we implement single-select
  // for simplicity. The user assigns one PC at a time. The API supports batch
  // assignment, so a multi-select component could be added later.
  if (mode === 'assign-pcs') {
    const assignedIds = new Set((encounter?.pcs ?? []).map(p => p.id))
    const unassigned = campaignPCs.filter(pc => !assignedIds.has(pc.id))

    if (unassigned.length === 0) {
      return (
        <Box flexDirection="column">
          <Text dimColor>All campaign PCs are already assigned.</Text>
          <Text> </Text>
          <SelectList items={[{ label: '← Back', value: 'back' }]} onSelect={() => setMode('pcs')} />
        </Box>
      )
    }

    const items = [
      ...unassigned.map(pc => ({ label: `${pc.name} (${pc.playerName})`, value: pc.id })),
      { label: '← Cancel', value: '__cancel__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Assign PC to encounter</Text>
        <Text> </Text>
        <SelectList items={items} onSelect={async (value) => {
          if (value === '__cancel__') {
            setMode('pcs')
            return
          }
          try {
            await api.assignPCs(encounterId, [value])
            await load()
            setMode('pcs')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign PC')
            setMode('pcs')
          }
        }} />
      </Box>
    )
  }

  if (mode === 'remove-pc') {
    const assignedPCs = encounter?.pcs ?? []
    const items = [
      ...assignedPCs.map(pc => ({ label: `${pc.name} (${pc.playerName})`, value: pc.id })),
      { label: '← Cancel', value: '__cancel__' },
    ]

    return (
      <Box flexDirection="column">
        <Text bold>Remove which PC?</Text>
        <Text> </Text>
        <SelectList items={items} onSelect={async (value) => {
          if (value === '__cancel__') {
            setMode('pcs')
            return
          }
          try {
            await api.removeEncounterPC(encounterId, value)
            await load()
            setMode('pcs')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove PC')
            setMode('pcs')
          }
        }} />
      </Box>
    )
  }

  return null
}
```

- [ ] **Step 2: Update App to render EncounterDetail**

In `src/tui/app.tsx`, add import:
```typescript
import { EncounterDetail } from './screens/encounter-detail.js'
```

Add render line:
```tsx
{screen === 'encounter-detail' && <EncounterDetail api={api} context={context} navigate={navigate} setInputActive={setInputActive} />}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/tui/screens/encounter-detail.tsx src/tui/app.tsx
git commit -m "feat(tui): add Encounter Detail screen with monster and PC management"
```

---

### Task 13: Initiative screen

**Files:**
- Create: `src/tui/screens/initiative.tsx`
- Modify: `src/tui/app.tsx` (add import and render)

Collects PC initiatives one at a time, asks auto/manual for monsters, optionally collects monster initiatives, then starts the encounter and displays turn order.

- [ ] **Step 1: Create Initiative screen**

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { SelectList } from '../components/select-list.js'
import { TextInput } from '../components/text-input.js'
import { Table } from '../components/table.js'
import type { ApiClient } from '../api.js'
import type { Screen, AppContext, PC, Monster, TurnOrderEntry } from '../types.js'

type InitiativeProps = {
  api: ApiClient
  context: AppContext
  navigate: (screen: Screen, updates?: Partial<AppContext>) => void
  setInputActive: (active: boolean) => void
}

type Phase =
  | 'loading'
  | 'pc-initiative'
  | 'monster-mode'
  | 'monster-initiative'
  | 'starting'
  | 'result'

export function Initiative({ api, context, navigate, setInputActive }: InitiativeProps) {
  const encounterId = context.encounter!.id
  const [phase, setPhase] = useState<Phase>('loading')
  const [pcs, setPCs] = useState<PC[]>([])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [initiatives, setInitiatives] = useState<Record<string, number>>({})
  const [currentPCIndex, setCurrentPCIndex] = useState(0)
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0)
  const [monsterMode, setMonsterMode] = useState<'auto' | 'manual'>('auto')
  const [turnOrder, setTurnOrder] = useState<TurnOrderEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const encounter = await api.getEncounter(encounterId)
        setPCs(encounter.pcs)
        setMonsters(encounter.monsters)
        if (encounter.pcs.length === 0 || encounter.monsters.length === 0) {
          setError('Encounter needs at least one PC and one monster to start.')
          setPhase('result')
          return
        }
        setPhase('pc-initiative')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load encounter')
        setPhase('result')
      }
    }
    load()
  }, [])

  const doStartEncounter = async (mode: 'auto' | 'manual', inits: Record<string, number>) => {
    try {
      const result = await api.startEncounter(encounterId, mode, inits)
      setTurnOrder(result.turnOrder)
      setInputActive(false)
      navigate('initiative', { turnOrder: result.turnOrder })
      setPhase('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start encounter')
      setInputActive(false)
      setPhase('result')
    }
  }

  if (phase === 'loading') return <Text>Loading encounter data...</Text>

  if (phase === 'pc-initiative') {
    const pc = pcs[currentPCIndex]
    setInputActive(true)
    return (
      <Box flexDirection="column">
        <Text bold>Enter PC Initiatives ({currentPCIndex + 1}/{pcs.length})</Text>
        <Text> </Text>
        <TextInput key={pc.id} label={`${pc.name} (${pc.playerName})`} onSubmit={(value) => {
          const num = parseInt(value, 10)
          if (isNaN(num)) return
          const updated = { ...initiatives, [pc.id]: num }
          setInitiatives(updated)
          if (currentPCIndex + 1 < pcs.length) {
            setCurrentPCIndex(currentPCIndex + 1)
          } else {
            setPhase('monster-mode')
          }
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (phase === 'monster-mode') {
    return (
      <Box flexDirection="column">
        <Text bold>Monster Initiatives</Text>
        <Text> </Text>
        <SelectList items={[
          { label: 'Auto-roll (1d20 + modifier)', value: 'auto' },
          { label: 'Enter manually', value: 'manual' },
        ]} onSelect={async (value) => {
          const mode = value as 'auto' | 'manual'
          setMonsterMode(mode)
          if (mode === 'manual') {
            setPhase('monster-initiative')
          } else {
            setPhase('starting')
            await doStartEncounter(mode, initiatives)
          }
        }} />
      </Box>
    )
  }

  if (phase === 'monster-initiative') {
    const monster = monsters[currentMonsterIndex]
    setInputActive(true)
    return (
      <Box flexDirection="column">
        <Text bold>Enter Monster Initiatives ({currentMonsterIndex + 1}/{monsters.length})</Text>
        <Text> </Text>
        <TextInput key={monster.id} label={`${monster.encounterInstanceName} (mod: ${monster.initiativeModifier})`} onSubmit={async (value) => {
          const num = parseInt(value, 10)
          if (isNaN(num)) return
          const updated = { ...initiatives, [monster.id]: num }
          setInitiatives(updated)
          if (currentMonsterIndex + 1 < monsters.length) {
            setCurrentMonsterIndex(currentMonsterIndex + 1)
          } else {
            setPhase('starting')
            await doStartEncounter('manual', updated)
          }
        }} />
        {error && <Text color="red">{error}</Text>}
      </Box>
    )
  }

  if (phase === 'starting') return <Text>Starting encounter...</Text>

  if (phase === 'result') {
    return (
      <Box flexDirection="column">
        <Text bold>Initiative Order</Text>
        <Text> </Text>
        {turnOrder.length > 0 ? (
          <Table
            columns={['#', 'Name', 'Type', 'Initiative']}
            rows={turnOrder.map((t, i) => [
              String(i + 1),
              t.name,
              t.participantType,
              String(t.initiative),
            ])}
          />
        ) : (
          error ? null : <Text dimColor>No turn order available.</Text>
        )}
        {error && <Text color="red">{error}</Text>}
        <Text> </Text>
        <SelectList items={[{ label: '← Back to encounter', value: 'back' }]} onSelect={() => {
          navigate('encounter-detail', { turnOrder: turnOrder.length > 0 ? turnOrder : context.turnOrder })
        }} />
      </Box>
    )
  }

  return null
}
```

- [ ] **Step 2: Update App to render Initiative**

In `src/tui/app.tsx`, add import:
```typescript
import { Initiative } from './screens/initiative.js'
```

Add render line:
```tsx
{screen === 'initiative' && <Initiative api={api} context={context} navigate={navigate} setInputActive={setInputActive} />}
```

- [ ] **Step 3: Verify everything compiles**

Run: `npx tsc --project src/tui/tsconfig.json --noEmit`
Expected: No errors.

- [ ] **Step 4: Full end-to-end manual test**

With server running (`pnpm dev`), run `pnpm tui`:

1. **Login** — Enter username, verify navigation to campaigns
2. **Create campaign** — Select `[+ New Campaign]`, enter name
3. **Add PCs** — Navigate to PCs, add 2-3 PCs with character and player names
4. **Create encounter** — Navigate to Encounters, create a new encounter
5. **Add monsters** — Add monsters with name, quantity, initiative modifier
6. **Assign PCs** — Assign PCs from campaign to encounter
7. **Start encounter (auto-roll)** — Enter PC initiatives, select auto-roll, verify turn order table
8. **View active encounter** — Navigate back, verify encounter shows as active with cached turn order
9. **Back navigation** — Escape key works at all levels
10. **Create second encounter** — Verify start with manual monster initiatives works

- [ ] **Step 5: Commit**

```bash
git add src/tui/screens/initiative.tsx src/tui/app.tsx
git commit -m "feat(tui): add Initiative screen and complete all TUI screens"
```
