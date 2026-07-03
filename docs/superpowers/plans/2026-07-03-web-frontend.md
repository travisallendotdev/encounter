# DiceFight Web Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully implemented React SPA in `web/` consuming the existing Hono JSON API unchanged, with both hand-tuned themes (candlelight, arcane-slate) preserved via CSS-variable tokens.

**Architecture:** Standalone Vite + React SPA in `web/`. Vite dev server proxies `/api/*` → Hono on `:3000`. All server state flows through TanStack Query. Combat turn/round state is client-side (a reducer) because the API exposes turn order only in the `POST /api/encounters/:id/start` response — it is persisted to `sessionStorage` keyed by encounter id so refreshes survive.

**Tech Stack:** Vite, React 18, TypeScript, React Router v7 (declarative), TanStack Query v5, Tailwind v4 (CSS-first `@theme`), Radix UI (dropdown for theme switcher), lucide-react, react-hook-form + Zod, Vitest + React Testing Library, Playwright, Biome.

## Global Constraints

- The Hono API is consumed **unchanged**. No backend edits.
- Auth = `X-DM-Username` header on every request except `POST /api/auth/login`; username stored in `localStorage` key `dicefight.username`. 401 → clear stored username, redirect to `/login`.
- Two themes: `[data-theme="candlelight"]` (default) and `[data-theme="arcane-slate"]`, token values copied **verbatim** from `design/themes/candlelight/css/app.css` and `design/themes/arcane-slate/css/arcane.css`. Theme persisted to `localStorage` key `dicefight.theme`, set on `<html data-theme=…>`.
- Routes: `/login`, `/campaigns`, `/campaigns/:id`, `/campaigns/:id/encounters/:eid/setup`, `/encounters/:eid/initiative`, `/encounters/:eid/combat`.
- TypeScript strict. Zod validates all API responses.
- Package manager: pnpm. `web/` is its own package (not a workspace member).
- Visual source of truth: the HTML mocks in `design/themes/candlelight/*.html` — port structure and class styling from them; arcane-slate reuses the same markup with different token values (the two CSS files share an identical class system).

## API Reference (existing, verified against `src/routes/*.ts`)

| Endpoint | Body | Response |
|---|---|---|
| `POST /api/auth/login` | `{username}` | `{id, username}` (200 existing / 201 created) |
| `GET /api/campaigns` | — | `[{id, name, dmId, createdAt}]` |
| `POST /api/campaigns` | `{name}` | `{id, name, dmId, createdAt}` 201 |
| `GET /api/campaigns/:id` | — | `{id, name, dmId, createdAt}` |
| `GET /api/campaigns/:id/pcs` | — | `[{id, name, playerName, campaignId}]` |
| `POST /api/campaigns/:id/pcs` | `{name, playerName}` | PC 201 |
| `GET /api/campaigns/:id/encounters` | — | `[{id, name, campaignId, encounterNumber, status}]` |
| `POST /api/campaigns/:id/encounters` | `{name}` | Encounter 201 |
| `GET /api/encounters/:id` | — | Encounter + `monsters: [{id, name, encounterInstanceName, initiativeModifier, encounterId}]` + `pcs: PC[]` |
| `POST /api/encounters/:id/monsters` | `{name, quantity, initiativeModifier}` | `Monster[]` 201 (draft only) |
| `DELETE /api/encounters/:id/monsters/:monsterId` | — | 204 (draft only) |
| `POST /api/encounters/:id/pcs` | `{pcIds: string[]}` | `PC[]` (draft only) |
| `DELETE /api/encounters/:id/pcs/:pcId` | — | 204 (draft only) |
| `POST /api/encounters/:id/start` | `{monsterInitiatives: 'auto'\|'manual', initiatives: Record<id,number>}` | `{status:'active', turnOrder: [{participantId, participantType:'pc'\|'monster', name, initiative}]}` |

**Initiative UX decision:** the mock shows monster rolls on screen before combat begins, with override. Server `'auto'` mode rolls server-side (numbers would not match what's displayed), so the frontend always rolls monsters client-side (`d20 + initiativeModifier`, re-rollable, editable) and submits `monsterInitiatives: 'manual'` with every value. Server contract untouched.

**Combat state decision:** `start` response's `turnOrder` is written to `sessionStorage` key `dicefight.combat.<encounterId>` as `{turnOrder, round, turnIndex}`. The combat page reducer advances turns; each state change is persisted back. If a user opens `/encounters/:eid/combat` for an active encounter without stored state, show a notice panel ("Turn order for this encounter isn't available in this browser — it lives only in the session that started combat") with a link back to the campaign.

---

### Task 1: Scaffold `web/` — Vite, Tailwind v4, Biome, theme tokens, ThemeProvider

**Files:**
- Create: `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`, `web/biome.json`, `web/index.html`, `web/src/main.tsx`, `web/src/app.tsx`, `web/src/theme/tokens.css`, `web/src/theme/ThemeProvider.tsx`, `web/src/vite-env.d.ts`
- Modify: `.gitignore` (add `web/node_modules`, `web/dist`, `.e2e-data/`, `web/test-results/`, `web/playwright-report/`)

**Interfaces:**
- Produces: `ThemeProvider` (wraps app, exports `useTheme(): {theme: ThemeName, setTheme(t: ThemeName): void}` with `type ThemeName = 'candlelight' | 'arcane-slate'`), Tailwind tokens `bg-surface`, `bg-surface-2`, `bg-surface-3`, `bg-bg`, `bg-bg-2`, `text-fg`, `text-muted`, `text-faint`, `text-accent` (+ `accent-strong`, `accent-deep`), `text-pc`, `text-monster`, `bg-pc-soft`, `bg-monster-soft`, `text-ok`, `border-line`, `border-line-2`, `rounded-card`, `rounded-el`, `font-display`, `font-body`, `font-mono`.

- [ ] **Step 1: Create package + install deps**

`web/package.json`:
```json
{
  "name": "dicefight-web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "biome check src tests",
    "format": "biome format --write src tests"
  }
}
```

Run from `web/`:
```bash
pnpm add react react-dom react-router @tanstack/react-query zod react-hook-form @hookform/resolvers lucide-react @radix-ui/react-dropdown-menu
pnpm add -D typescript vite @vitejs/plugin-react tailwindcss @tailwindcss/vite @types/react @types/react-dom vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test @biomejs/biome
```

- [ ] **Step 2: Config files**

`web/vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

`web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["vite/client", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests"]
}
```

`web/biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "asNeeded" } },
  "linter": { "enabled": true, "rules": { "recommended": true } }
}
```
(Adjust `$schema` version to the installed Biome version.)

`web/src/test-setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Theme tokens**

`web/src/theme/tokens.css` — token values copied verbatim from the two design CSS files, then mapped into Tailwind via `@theme inline`:
```css
@import 'tailwindcss';

/* ---- candlelight (default) — values from design/themes/candlelight/css/app.css ---- */
:root,
[data-theme='candlelight'] {
  --bg: #0e0c09;
  --bg-2: #141009;
  --surface: #1b1611;
  --surface-2: #221c15;
  --surface-3: #2a2219;
  --border-c: #362d20;
  --border-c2: #463a28;
  --fg: #f1e8d8;
  --muted: #ac9d85;
  --faint: #756950;
  --accent: #e8b15a;
  --accent-strong: #f2c878;
  --accent-deep: #b97d28;
  --accent-glow: rgba(232, 177, 90, 0.16);
  --pc: #62c0d4;
  --pc-soft: rgba(98, 192, 212, 0.12);
  --monster: #df5b4d;
  --monster-soft: rgba(223, 91, 77, 0.12);
  --ok: #7fc77a;
  --radius: 14px;
  --radius-sm: 9px;
  --font-display: 'Cinzel', 'Iowan Old Style', Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
  --body-bg:
    radial-gradient(130% 90% at 50% -15%, #1d160d 0%, transparent 58%),
    radial-gradient(110% 70% at 50% 115%, #170f07 0%, transparent 55%),
    var(--bg);
}

/* ---- arcane slate — values from design/themes/arcane-slate/css/arcane.css ---- */
[data-theme='arcane-slate'] {
  --bg: #0d1016;
  --bg-2: #0f141b;
  --surface: #151b24;
  --surface-2: #1b2330;
  --surface-3: #222c3b;
  --border-c: rgba(255, 255, 255, 0.08);
  --border-c2: rgba(255, 255, 255, 0.14);
  --fg: #e7edf5;
  --muted: #8b99ab;
  --faint: #5d6a7d;
  --accent: #8aa0ff;
  --accent-strong: #a7b6ff;
  --accent-deep: #5f76e6;
  --accent-glow: rgba(138, 160, 255, 0.16);
  --pc: #46d3e4;
  --pc-soft: rgba(70, 211, 228, 0.12);
  --monster: #ff5d8f;
  --monster-soft: rgba(255, 93, 143, 0.12);
  --ok: #59d499;
  --radius: 12px;
  --radius-sm: 9px;
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --shadow: 0 16px 44px rgba(0, 0, 0, 0.5);
  --body-bg:
    radial-gradient(120% 80% at 82% -12%, rgba(138, 160, 255, 0.08), transparent 55%),
    var(--bg);
}

@theme inline {
  --color-bg: var(--bg);
  --color-bg-2: var(--bg-2);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-line: var(--border-c);
  --color-line-2: var(--border-c2);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-faint: var(--faint);
  --color-accent: var(--accent);
  --color-accent-strong: var(--accent-strong);
  --color-accent-deep: var(--accent-deep);
  --color-accent-glow: var(--accent-glow);
  --color-pc: var(--pc);
  --color-pc-soft: var(--pc-soft);
  --color-monster: var(--monster);
  --color-monster-soft: var(--monster-soft);
  --color-ok: var(--ok);
  --radius-card: var(--radius);
  --radius-el: var(--radius-sm);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
  --shadow-panel: var(--shadow);
}

body {
  min-height: 100vh;
  font: 16px/1.55 var(--font-body);
  color: var(--fg);
  background: var(--body-bg);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  letter-spacing: 0.005em;
}
::selection { background: var(--accent-glow); }
```

- [ ] **Step 4: ThemeProvider**

`web/src/theme/ThemeProvider.tsx`:
```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeName = 'candlelight' | 'arcane-slate'
const STORAGE_KEY = 'dicefight.theme'

const ThemeContext = createContext<{ theme: ThemeName; setTheme: (t: ThemeName) => void }>({
  theme: 'candlelight',
  setTheme: () => {},
})

function initialTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'arcane-slate' ? 'arcane-slate' : 'candlelight'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 5: Entry + shell**

`web/index.html` (fonts from the mocks — Cinzel + Space Grotesk + JetBrains Mono):
```html
<!doctype html>
<html lang="en" data-theme="candlelight">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dice Fight</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`web/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/tokens.css'
import { App } from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`web/src/app.tsx` (placeholder until Task 8 wires the router):
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme/ThemeProvider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5_000 } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <h1 className="font-display text-accent p-8">DiceFight</h1>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 6: Verify**

Run: `pnpm --dir web build` → exits 0. Run `pnpm --dir web dev` briefly, `curl -s localhost:5173 | grep root` → serves.

- [ ] **Step 7: Commit** — `git add web .gitignore && git commit -m "feat(web): scaffold Vite React SPA with Tailwind v4 theme tokens"`

---

### Task 2: API layer — Zod schemas, fetch client, typed endpoints (TDD on client)

**Files:**
- Create: `web/src/api/schemas.ts`, `web/src/api/client.ts`, `web/src/api/client.test.ts`, `web/src/api/endpoints.ts`, `web/src/features/auth/session.ts`

**Interfaces:**
- Produces:
  - `session.ts`: `getUsername(): string | null`, `setUsername(u: string): void`, `clearUsername(): void` (localStorage key `dicefight.username`).
  - `client.ts`: `apiFetch<T>(path: string, schema: ZodType<T>, init?: RequestInit): Promise<T>`; throws `ApiError extends Error {status: number}`; on 401 calls `clearUsername()` and dispatches `window.dispatchEvent(new Event('dicefight:unauthorized'))`.
  - `schemas.ts`: `Dm`, `Campaign`, `Pc`, `Encounter`, `Monster`, `EncounterDetail`, `TurnEntry`, `StartResponse` Zod schemas + inferred types.
  - `endpoints.ts`: `login(username)`, `listCampaigns()`, `createCampaign(name)`, `getCampaign(id)`, `listPcs(campaignId)`, `createPc(campaignId, {name, playerName})`, `listEncounters(campaignId)`, `createEncounter(campaignId, name)`, `getEncounter(id)`, `addMonsters(encounterId, {name, quantity, initiativeModifier})`, `removeMonster(encounterId, monsterId)`, `setEncounterPcs(encounterId, pcIds)`, `removeEncounterPc(encounterId, pcId)`, `startEncounter(encounterId, {monsterInitiatives, initiatives})`.

- [ ] **Step 1: Write failing tests** — `web/src/api/client.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError, apiFetch } from './client'
import { setUsername, getUsername } from '../features/auth/session'

const okJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('attaches X-DM-Username header when a session exists', async () => {
    setUsername('aldous')
    const fetchMock = vi.fn().mockResolvedValue(okJson({ a: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/campaigns', z.object({ a: z.number() }))
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(headers.get('X-DM-Username')).toBe('aldous')
  })

  it('parses and validates the response body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ id: 'x', name: 'y' })))
    const result = await apiFetch('/api/thing', z.object({ id: z.string(), name: z.string() }))
    expect(result).toEqual({ id: 'x', name: 'y' })
  })

  it('throws ApiError with the server message on 4xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ error: 'name is required' }, 400)))
    await expect(apiFetch('/api/thing', z.unknown())).rejects.toMatchObject({
      message: 'name is required',
      status: 400,
    })
  })

  it('clears the session and emits an event on 401', async () => {
    setUsername('aldous')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ error: 'Unauthorized' }, 401)))
    const listener = vi.fn()
    window.addEventListener('dicefight:unauthorized', listener)
    await expect(apiFetch('/api/thing', z.unknown())).rejects.toBeInstanceOf(ApiError)
    expect(getUsername()).toBeNull()
    expect(listener).toHaveBeenCalled()
    window.removeEventListener('dicefight:unauthorized', listener)
  })

  it('returns undefined-safe for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    const result = await apiFetch('/api/thing', z.void())
    expect(result).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests, verify failure** — `pnpm --dir web test` → FAIL (modules not found).

- [ ] **Step 3: Implement**

`web/src/features/auth/session.ts`:
```ts
const KEY = 'dicefight.username'
export const getUsername = () => localStorage.getItem(KEY)
export const setUsername = (u: string) => localStorage.setItem(KEY, u)
export const clearUsername = () => localStorage.removeItem(KEY)
```

`web/src/api/client.ts`:
```ts
import type { ZodType } from 'zod'
import { clearUsername, getUsername } from '../features/auth/session'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, schema: ZodType<T>, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const username = getUsername()
  if (username) headers.set('X-DM-Username', username)
  if (init?.body) headers.set('Content-Type', 'application/json')

  const res = await fetch(path, { ...init, headers })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body?.error === 'string') message = body.error
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401) {
      clearUsername()
      window.dispatchEvent(new Event('dicefight:unauthorized'))
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return schema.parse(await res.json())
}
```

`web/src/api/schemas.ts`:
```ts
import { z } from 'zod'

export const dmSchema = z.object({ id: z.string(), username: z.string() })
export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  dmId: z.string(),
  createdAt: z.string(),
})
export const pcSchema = z.object({
  id: z.string(),
  name: z.string(),
  playerName: z.string(),
  campaignId: z.string(),
})
export const encounterSchema = z.object({
  id: z.string(),
  name: z.string(),
  campaignId: z.string(),
  encounterNumber: z.number(),
  status: z.enum(['draft', 'active']),
})
export const monsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  encounterInstanceName: z.string(),
  initiativeModifier: z.number(),
  encounterId: z.string(),
})
export const encounterDetailSchema = encounterSchema.extend({
  monsters: z.array(monsterSchema),
  pcs: z.array(pcSchema),
})
export const turnEntrySchema = z.object({
  participantId: z.string(),
  participantType: z.enum(['pc', 'monster']),
  name: z.string(),
  initiative: z.number(),
})
export const startResponseSchema = z.object({
  status: z.literal('active'),
  turnOrder: z.array(turnEntrySchema),
})

export type Dm = z.infer<typeof dmSchema>
export type Campaign = z.infer<typeof campaignSchema>
export type Pc = z.infer<typeof pcSchema>
export type Encounter = z.infer<typeof encounterSchema>
export type Monster = z.infer<typeof monsterSchema>
export type EncounterDetail = z.infer<typeof encounterDetailSchema>
export type TurnEntry = z.infer<typeof turnEntrySchema>
export type StartResponse = z.infer<typeof startResponseSchema>
```

`web/src/api/endpoints.ts`:
```ts
import { z } from 'zod'
import { apiFetch } from './client'
import {
  campaignSchema, dmSchema, encounterDetailSchema, encounterSchema,
  monsterSchema, pcSchema, startResponseSchema,
} from './schemas'

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const login = (username: string) => apiFetch('/api/auth/login', dmSchema, post({ username }))

export const listCampaigns = () => apiFetch('/api/campaigns', z.array(campaignSchema))
export const createCampaign = (name: string) => apiFetch('/api/campaigns', campaignSchema, post({ name }))
export const getCampaign = (id: string) => apiFetch(`/api/campaigns/${id}`, campaignSchema)

export const listPcs = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/pcs`, z.array(pcSchema))
export const createPc = (campaignId: string, input: { name: string; playerName: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/pcs`, pcSchema, post(input))

export const listEncounters = (campaignId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/encounters`, z.array(encounterSchema))
export const createEncounter = (campaignId: string, name: string) =>
  apiFetch(`/api/campaigns/${campaignId}/encounters`, encounterSchema, post({ name }))
export const getEncounter = (id: string) => apiFetch(`/api/encounters/${id}`, encounterDetailSchema)

export const addMonsters = (encounterId: string, input: { name: string; quantity: number; initiativeModifier: number }) =>
  apiFetch(`/api/encounters/${encounterId}/monsters`, z.array(monsterSchema), post(input))
export const removeMonster = (encounterId: string, monsterId: string) =>
  apiFetch(`/api/encounters/${encounterId}/monsters/${monsterId}`, z.void(), { method: 'DELETE' })

export const setEncounterPcs = (encounterId: string, pcIds: string[]) =>
  apiFetch(`/api/encounters/${encounterId}/pcs`, z.array(pcSchema), post({ pcIds }))
export const removeEncounterPc = (encounterId: string, pcId: string) =>
  apiFetch(`/api/encounters/${encounterId}/pcs/${pcId}`, z.void(), { method: 'DELETE' })

export const startEncounter = (
  encounterId: string,
  input: { monsterInitiatives: 'auto' | 'manual'; initiatives: Record<string, number> },
) => apiFetch(`/api/encounters/${encounterId}/start`, startResponseSchema, post(input))
```

- [ ] **Step 4: Run tests, verify pass** — `pnpm --dir web test` → all client tests PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(web): typed API layer with Zod-validated fetch client"`

---

### Task 3: Shared UI components + auth (login page, route guard)

**Files:**
- Create: `web/src/components/TopBar.tsx`, `web/src/components/Panel.tsx`, `web/src/components/Button.tsx`, `web/src/components/Field.tsx`, `web/src/components/Pill.tsx`, `web/src/components/BrandMark.tsx`
- Create: `web/src/features/auth/LoginPage.tsx`, `web/src/features/auth/RequireAuth.tsx`, `web/src/features/auth/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `login`, `session.ts`, `useTheme`.
- Produces:
  - `Button({variant?: 'primary'|'ghost'|'default'|'icon', size?: 'md'|'lg', ...buttonProps})`
  - `Panel({title, icon?, count?, children, className?})` — the `.panel` card with `.panel-head`/`.panel-title` layout.
  - `Field({label, error?, children})` — label + control + error line.
  - `Pill({kind: 'draft'|'active'})` — status pill with dot for active.
  - `TopBar({crumbs?: {label, to?}[]})` — brand link → `/campaigns`, breadcrumbs, spacer, theme-switcher (Radix DropdownMenu listing both themes), user chip with initial avatar (from `getUsername()`).
  - `RequireAuth` — layout route component: if no username → `<Navigate to="/login" replace/>`; also listens for `dicefight:unauthorized` and navigates to `/login`. Renders `<Outlet/>`.
- Styling: Tailwind utility tokens from Task 1; visual reference `design/themes/candlelight/login.html` (gate card, floating d20 mark, embers background) and the `.topbar`/`.btn`/`.panel`/`.pill` rules in `design/themes/candlelight/css/app.css`. Use `lucide-react` icons (`Dices`, `Users`, `Swords`, `Skull`, `Shield`, `ArrowRight`, `ArrowLeft`, `Plus`, `X`, `Check`, `Palette`, `Zap`) in place of the mocks' inline SVGs.

- [ ] **Step 1: Write failing test** — `web/src/features/auth/LoginPage.test.tsx`:
```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './LoginPage'
import { getUsername } from './session'

vi.mock('../../api/endpoints', () => ({
  login: vi.fn().mockResolvedValue({ id: 'dm-1', username: 'aldous' }),
}))

function renderLogin() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/campaigns" element={<div>campaigns page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear())

  it('logs in and stores the username', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/dungeon master name/i), 'aldous')
    await userEvent.click(screen.getByRole('button', { name: /take your seat/i }))
    expect(await screen.findByText('campaigns page')).toBeInTheDocument()
    expect(getUsername()).toBe('aldous')
  })

  it('requires a name before submitting', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /take your seat/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(getUsername()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test, verify fail** — `pnpm --dir web test` → FAIL (LoginPage missing).

- [ ] **Step 3: Implement components + pages**

`LoginPage` uses react-hook-form + zod resolver (`z.object({ username: z.string().trim().min(1, 'Name is required') })`), a `useMutation` calling `login`, on success `setUsername(dm.username)` then `navigate('/campaigns')`. Markup ports `login.html`'s `.gate` structure: centered column, `Dices` icon mark with `animate-[floaty_6s_ease-in-out_infinite]` (define `@keyframes floaty` in tokens.css), `Dice<b className="text-accent">Fight</b>` display title, tagline, card with label + input + primary lg button + note. Mutation error shown under the input.

`RequireAuth`:
```tsx
import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { getUsername } from './session'

export function RequireAuth() {
  const navigate = useNavigate()
  useEffect(() => {
    const onUnauthorized = () => navigate('/login', { replace: true })
    window.addEventListener('dicefight:unauthorized', onUnauthorized)
    return () => window.removeEventListener('dicefight:unauthorized', onUnauthorized)
  }, [navigate])
  if (!getUsername()) return <Navigate to="/login" replace />
  return <Outlet />
}
```

- [ ] **Step 4: Run tests, verify pass** — `pnpm --dir web test`.
- [ ] **Step 5: Commit** — `git commit -m "feat(web): shared UI kit, login flow, auth route guard"`

---

### Task 4: Campaigns list page

**Files:**
- Create: `web/src/features/campaigns/queries.ts`, `web/src/features/campaigns/CampaignsPage.tsx`

**Interfaces:**
- Consumes: `listCampaigns`, `createCampaign`, `TopBar`, `Button`, `Field`.
- Produces: `queries.ts` exports `campaignKeys = { all: ['campaigns'] as const, detail: (id: string) => ['campaigns', id] as const }`, `useCampaigns()`, `useCreateCampaign()` (invalidates `campaignKeys.all` on success).

- [ ] **Step 1: Implement** — Port `campaigns.html`: `TopBar` (no crumbs), page head ("Your table" eyebrow / "Campaigns" title), responsive card grid (`grid-cols-[repeat(auto-fill,minmax(260px,1fr))]`). Each campaign card links to `/campaigns/:id`, shows name + created date, hover lift + arrow, `Dices` watermark. Last tile = dashed "New campaign" card with inline name input + "Forge it" submit (react-hook-form, min-1 validation), disabled while pending. Loading state: muted "Summoning your campaigns…"; error state: panel with retry button calling `refetch()`. Empty list still shows the New-campaign tile.
- [ ] **Step 2: Verify** — `pnpm --dir web build` passes; with backend + vite running, log in and create/list campaigns manually via `curl` sanity check of proxy: `curl -s -X POST localhost:5173/api/auth/login -H 'Content-Type: application/json' -d '{"username":"plancheck"}'` → JSON.
- [ ] **Step 3: Commit** — `git commit -m "feat(web): campaigns list with create"`

---

### Task 5: Campaign detail page (PCs + encounters)

**Files:**
- Create: `web/src/features/campaigns/CampaignDetailPage.tsx`, `web/src/features/campaigns/pcQueries.ts`, `web/src/features/encounters/queries.ts`

**Interfaces:**
- Consumes: `getCampaign`, `listPcs`, `createPc`, `listEncounters`, `createEncounter`.
- Produces:
  - `pcQueries.ts`: `pcKeys = { list: (campaignId: string) => ['campaigns', campaignId, 'pcs'] as const }`, `usePcs(campaignId)`, `useCreatePc(campaignId)`.
  - `encounters/queries.ts`: `encounterKeys = { list: (campaignId: string) => ['campaigns', campaignId, 'encounters'] as const, detail: (id: string) => ['encounters', id] as const }`, `useEncounters(campaignId)`, `useCreateEncounter(campaignId)`, `useEncounter(id)` (query fn `getEncounter`).

- [ ] **Step 1: Implement** — Port `campaign.html`: TopBar crumbs `Campaigns / <name>`, two-col grid (stacks < 760px). Left panel "Player Characters" (count badge, `.row.is-pc` rows with teal marker + `Shield` icon, name + "played by X" meta, inline add-PC form: Character + Player + "Add PC"). Right panel "Encounters": rows with `#N ENC` number chip, name, status `Pill`; row links to `/campaigns/:id/encounters/:eid/setup` when draft, `/encounters/:eid/combat` when active; add-encounter inline form ("Create encounter") navigates to the new encounter's setup page on success.
- [ ] **Step 2: Verify** — build passes; manual flow: create campaign → add PC → create encounter navigates to setup route (404 page acceptable until Task 6; verify URL).
- [ ] **Step 3: Commit** — `git commit -m "feat(web): campaign detail with PC roster and encounter list"`

---

### Task 6: Encounter setup page

**Files:**
- Create: `web/src/features/encounters/EncounterSetupPage.tsx`, `web/src/features/encounters/mutations.ts`

**Interfaces:**
- Consumes: `useEncounter(eid)`, `usePcs(campaignId)`, `addMonsters`, `removeMonster`, `setEncounterPcs`, `removeEncounterPc`.
- Produces: `mutations.ts` exports `useAddMonsters(eid)`, `useRemoveMonster(eid)`, `useSetEncounterPcs(eid)`, `useRemoveEncounterPc(eid)` — each invalidates `encounterKeys.detail(eid)` on success.

- [ ] **Step 1: Implement** — Port `encounter-setup.html`. Route param `eid` + `id` (campaign). Page head: eyebrow `Encounter #N · Draft`, title, draft pill. Left panel Monsters: one row per monster instance (`encounterInstanceName`, `init +X` chip formatted with `+`/`-` sign, remove icon-button); add-monster inline form (name / qty min 1 / init mod, integers; react-hook-form + zod `z.coerce.number().int()`). Right panel Party: full campaign roster from `usePcs`; each `roster-item` is `on` when the PC id is in `encounterDetail.pcs`; toggle Add → `setEncounterPcs(eid, [pcId])`, Remove → `removeEncounterPc`. Startbar: "N monsters and M heroes staged"; **Start encounter** button navigates to `/encounters/:eid/initiative`, disabled (with hint) unless ≥1 monster and ≥1 PC. If `status === 'active'`, redirect to `/encounters/:eid/combat`.
- [ ] **Step 2: Verify** — build passes; manual: add 2× Goblin (qty 2) → rows "Goblin 1", "Goblin 2"; toggle PC on/off; remove a monster.
- [ ] **Step 3: Commit** — `git commit -m "feat(web): encounter setup with monster staging and party toggles"`

---

### Task 7: Initiative page + combat storage

**Files:**
- Create: `web/src/features/combat/dice.ts`, `web/src/features/combat/combatStorage.ts`, `web/src/features/combat/combatStorage.test.ts`, `web/src/features/encounters/InitiativePage.tsx`

**Interfaces:**
- Consumes: `useEncounter(eid)`, `startEncounter`.
- Produces:
  - `dice.ts`: `rollD20(): number` (1–20).
  - `combatStorage.ts`: `type CombatState = { encounterId: string; encounterName: string; turnOrder: TurnEntry[]; round: number; turnIndex: number }`; `saveCombat(state: CombatState): void`; `loadCombat(encounterId: string): CombatState | null` (sessionStorage key `dicefight.combat.<id>`, JSON, null on parse failure).

- [ ] **Step 1: Write failing storage test** — `combatStorage.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { loadCombat, saveCombat, type CombatState } from './combatStorage'

const state: CombatState = {
  encounterId: 'e1',
  encounterName: 'The Sunken Crypt',
  turnOrder: [{ participantId: 'p1', participantType: 'pc', name: 'Lyra', initiative: 18 }],
  round: 2,
  turnIndex: 0,
}

describe('combatStorage', () => {
  beforeEach(() => sessionStorage.clear())

  it('round-trips combat state', () => {
    saveCombat(state)
    expect(loadCombat('e1')).toEqual(state)
  })

  it('returns null for unknown encounters', () => {
    expect(loadCombat('nope')).toBeNull()
  })

  it('returns null for corrupt payloads', () => {
    sessionStorage.setItem('dicefight.combat.bad', '{not json')
    expect(loadCombat('bad')).toBeNull()
  })
})
```
- [ ] **Step 2: Run, verify fail; implement `combatStorage.ts` + `dice.ts`; run, verify pass.**
- [ ] **Step 3: Implement InitiativePage** — Port `initiative.html`. Two panels: **The Party** — one `init-row` per encounter PC with a big mono number input (react-hook-form field per PC id, required integer). **Monsters** — on mount, seed each monster with `rollD20() + initiativeModifier`; "Roll for monsters" button re-rolls all; each value rendered in an editable mono input (`rolled` styling). Beginbar shows `X of Y initiatives set` (count of filled fields). **Begin combat** disabled until every PC field is filled; on click, `startEncounter(eid, { monsterInitiatives: 'manual', initiatives })` where `initiatives` maps every PC and monster id → number; on success `saveCombat({encounterId, encounterName, turnOrder, round: 1, turnIndex: 0})`, invalidate `encounterKeys.detail(eid)` and `encounterKeys.list(campaignId)`, navigate to `/encounters/:eid/combat`. If encounter already `active`, redirect to combat.
- [ ] **Step 4: Verify** — build + tests pass.
- [ ] **Step 5: Commit** — `git commit -m "feat(web): initiative entry with client-side monster rolls"`

---

### Task 8: Combat reducer (TDD) + combat page + router wiring

**Files:**
- Create: `web/src/features/combat/combatReducer.ts`, `web/src/features/combat/combatReducer.test.ts`, `web/src/features/combat/CombatPage.tsx`, `web/src/routes/router.tsx`
- Modify: `web/src/app.tsx` (mount router)

**Interfaces:**
- Consumes: `CombatState`, `loadCombat`, `saveCombat`, all pages.
- Produces: `combatReducer(state: CombatState, action: {type: 'NEXT_TURN'}): CombatState`; router exporting `<AppRoutes/>`.

- [ ] **Step 1: Write failing reducer tests** — `combatReducer.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { combatReducer } from './combatReducer'
import type { CombatState } from './combatStorage'

const mk = (turnIndex: number, round = 1): CombatState => ({
  encounterId: 'e1',
  encounterName: 'Crypt',
  round,
  turnIndex,
  turnOrder: [
    { participantId: 'a', participantType: 'pc', name: 'A', initiative: 20 },
    { participantId: 'b', participantType: 'monster', name: 'B', initiative: 15 },
    { participantId: 'c', participantType: 'pc', name: 'C', initiative: 10 },
  ],
})

describe('combatReducer', () => {
  it('advances to the next combatant within a round', () => {
    const next = combatReducer(mk(0), { type: 'NEXT_TURN' })
    expect(next.turnIndex).toBe(1)
    expect(next.round).toBe(1)
  })

  it('wraps to the top of the order and increments the round', () => {
    const next = combatReducer(mk(2), { type: 'NEXT_TURN' })
    expect(next.turnIndex).toBe(0)
    expect(next.round).toBe(2)
  })

  it('does not mutate the previous state', () => {
    const prev = mk(0)
    combatReducer(prev, { type: 'NEXT_TURN' })
    expect(prev.turnIndex).toBe(0)
  })
})
```
- [ ] **Step 2: Run, verify fail; implement:**
```ts
import type { CombatState } from './combatStorage'

export type CombatAction = { type: 'NEXT_TURN' }

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  switch (action.type) {
    case 'NEXT_TURN': {
      const last = state.turnIndex >= state.turnOrder.length - 1
      return {
        ...state,
        turnIndex: last ? 0 : state.turnIndex + 1,
        round: last ? state.round + 1 : state.round,
      }
    }
  }
}
```
Run, verify pass.
- [ ] **Step 3: Implement CombatPage** — Port `combat.html`. `useReducer(combatReducer, undefined, () => loadCombat(eid))`; `useEffect` persists via `saveCombat` on every state change. Layout: combat bar (live pill, encounter name from state, "N combatants" sub, round/turn chip `Round R · Turn (i+1)/N`); **Now acting** hero band (big initiative tile, "Now acting" label, name, pc/monster meta, **Next turn** primary button, "On deck · <next name>" hint wrapping to the top of the order); turn order list — rows before `turnIndex` in the current pass get `done` styling (opacity), the current row gets `active` styling with a "Now" badge, later rows normal; pc/monster marker colors. If `loadCombat` returns null: fetch `useEncounter(eid)`; if draft → redirect to setup; else render the missing-state notice panel with a link back to `/campaigns/:id`.
- [ ] **Step 4: Router** — `web/src/routes/router.tsx`:
```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { CampaignsPage } from '../features/campaigns/CampaignsPage'
import { CampaignDetailPage } from '../features/campaigns/CampaignDetailPage'
import { EncounterSetupPage } from '../features/encounters/EncounterSetupPage'
import { InitiativePage } from '../features/encounters/InitiativePage'
import { CombatPage } from '../features/combat/CombatPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:id/encounters/:eid/setup" element={<EncounterSetupPage />} />
          <Route path="/encounters/:eid/initiative" element={<InitiativePage />} />
          <Route path="/encounters/:eid/combat" element={<CombatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/campaigns" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```
Replace the placeholder in `app.tsx` with `<AppRoutes />` inside the providers.
- [ ] **Step 5: Verify** — `pnpm --dir web test` and `pnpm --dir web build` pass.
- [ ] **Step 6: Commit** — `git commit -m "feat(web): combat tracker with client-side turn state and full routing"`

---

### Task 9: Playwright E2E — happy path

**Files:**
- Create: `web/playwright.config.ts`, `web/tests/e2e/happy-path.spec.ts`
- Modify: root `package.json` (add script `e2e:api`)

**Interfaces:**
- Consumes: whole app + real backend on a fresh SQLite DB.

- [ ] **Step 1: Backend-on-fresh-DB script** — root `package.json` scripts:
```json
"e2e:api": "rm -rf .e2e-data && mkdir -p .e2e-data && cd .e2e-data && tsx ../src/index.ts"
```
(DB path `data/encounter.db` is cwd-relative, so this isolates E2E data in `.e2e-data/data/`.)

- [ ] **Step 2: Playwright config** — `web/playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:5173' },
  webServer: [
    {
      command: 'pnpm --dir .. run e2e:api',
      url: 'http://localhost:3000/api/auth/login',
      reuseExistingServer: true,
      // login is POST-only; a GET returns 404/405 which Playwright counts as "up"
      ignoreHTTPSErrors: true,
    },
    { command: 'pnpm dev', url: 'http://localhost:5173', reuseExistingServer: true },
  ],
})
```
Note: Playwright treats any HTTP response (including 4xx? — no, only <400 by default) — use `url: 'http://localhost:3000/'` instead, the Hono root returns 200 "Hello Hono!".

- [ ] **Step 3: Spec** — `web/tests/e2e/happy-path.spec.ts` (unique DM per run so a reused dev server/DB can't collide):
```ts
import { expect, test } from '@playwright/test'

test('login → campaign → encounter → initiative → combat turns', async ({ page }) => {
  const stamp = Date.now()
  const dm = `dm-${stamp}`

  await page.goto('/login')
  await page.getByLabel(/dungeon master name/i).fill(dm)
  await page.getByRole('button', { name: /take your seat/i }).click()
  await expect(page).toHaveURL(/\/campaigns$/)

  // create campaign
  await page.getByPlaceholder(/name your world/i).fill(`Crimson Vault ${stamp}`)
  await page.getByRole('button', { name: /forge it/i }).click()
  await page.getByRole('link', { name: new RegExp(`Crimson Vault ${stamp}`) }).click()
  await expect(page).toHaveURL(/\/campaigns\/[\w-]+$/)

  // add two PCs
  await page.getByPlaceholder(/character name/i).fill('Lyra')
  await page.getByPlaceholder(/player name/i).fill('Elara')
  await page.getByRole('button', { name: /add pc/i }).click()
  await expect(page.getByText('Lyra')).toBeVisible()
  await page.getByPlaceholder(/character name/i).fill('Thorne')
  await page.getByPlaceholder(/player name/i).fill('Marcus')
  await page.getByRole('button', { name: /add pc/i }).click()
  await expect(page.getByText('Thorne')).toBeVisible()

  // create encounter → setup
  await page.getByPlaceholder(/ambush at the bridge/i).fill('Sunken Crypt')
  await page.getByRole('button', { name: /create encounter/i }).click()
  await expect(page).toHaveURL(/\/encounters\/[\w-]+\/setup$/)

  // stage 2 goblins, add both PCs
  await page.getByPlaceholder(/e\.g\. goblin/i).fill('Goblin')
  await page.getByLabel(/qty/i).fill('2')
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByText('Goblin 1')).toBeVisible()
  await expect(page.getByText('Goblin 2')).toBeVisible()
  await page.getByRole('button', { name: /^add$/i, exact: false }).first() // party toggles are labeled Add
  for (const btn of await page.getByRole('button', { name: /^add to party$/i }).all()) await btn.click()

  // start → initiative
  await page.getByRole('link', { name: /start encounter/i }).click()
  await expect(page).toHaveURL(/\/initiative$/)
  const pcInputs = page.getByRole('spinbutton', { name: /initiative/i })
  // fill PC initiatives (monsters pre-rolled)
  await page.getByLabel(/lyra initiative/i).fill('18')
  await page.getByLabel(/thorne initiative/i).fill('12')
  await page.getByRole('button', { name: /begin combat/i }).click()

  // combat
  await expect(page).toHaveURL(/\/combat$/)
  await expect(page.getByText(/round/i)).toBeVisible()
  await expect(page.getByText(/now acting/i)).toBeVisible()

  // advance a full round: 4 combatants → after 4 clicks round increments
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /next turn/i }).click()
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible() // round chip shows 2
})
```
Adjust selectors to the real accessible names/labels implemented in Tasks 3–8 (the implementer must make these match: PC initiative inputs get `aria-label` `<name> initiative`, party toggle buttons accessible name "Add to party" / "Remove from party", the round chip exposes its value). The spec is the contract — fix the components, not the test, where reasonable.

- [ ] **Step 4: Run** — `pnpm --dir web exec playwright install chromium` then `pnpm --dir web e2e` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "test(web): playwright happy-path e2e"`

---

### Task 10: Root wiring + docs + final verification

**Files:**
- Modify: root `package.json` (scripts `dev:web`, `dev:all`), `CLAUDE.md`, `README.md`

- [ ] **Step 1: Root scripts** — add to root `package.json`:
```json
"dev:web": "pnpm --dir web dev",
"e2e:web": "pnpm --dir web e2e"
```
- [ ] **Step 2: Docs** — CLAUDE.md: add a "Web frontend" section (stack, `web/` layout, commands, proxy note, theming note, combat-state-is-client-side note). README: quickstart for running API + web together.
- [ ] **Step 3: Full verification** — `pnpm build` (backend), `pnpm --dir web lint`, `pnpm --dir web test`, `pnpm --dir web build`, `pnpm --dir web e2e` — all green. Manually click through both themes via the TopBar switcher.
- [ ] **Step 4: Commit** — `git commit -m "docs: wire up web frontend scripts and documentation"`

---

## Self-Review Notes

- Spec coverage: architecture (T1), stack (T1–T2), theming (T1 + TopBar switcher T3), all six routes (T3–T8), auth wrapper + redirect (T2–T3), structure (all), reducer tests + E2E (T7–T9). Phase-B readiness: all reads via TanStack Query cache — satisfied by queries.ts files.
- Radix usage is intentionally minimal (theme dropdown) — the mocks contain no dialogs/popovers; YAGNI.
- `setEncounterPcs(eid, [pcId])` per-toggle is correct because the endpoint is additive (`INSERT OR IGNORE`) and removal has its own endpoint.
- E2E selectors are a contract for the page implementations (aria-labels listed in Task 9 Step 3).
