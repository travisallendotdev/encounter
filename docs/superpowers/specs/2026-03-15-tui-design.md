# TUI Client Design Spec

A minimal terminal UI for the D&D 5e encounter tracker API, built with Ink (React for CLIs). Covers all 22 API endpoints with a screen-based navigation flow.

## Decisions

- **Framework:** Ink (React-based CLI rendering)
- **Location:** `src/tui/` in the existing package, launched via `pnpm tui`
- **Connection:** HTTP client calling `http://localhost:3000` (server must be running separately)
- **Navigation:** Screen-based state machine matching the hierarchical data model
- **Scope:** Feature-complete (all endpoints), simple UI (menus, text prompts, tables)

## Project Structure

```
src/tui/
  index.tsx            — Entry point, renders <App />
  app.tsx              — Top-level component, manages screen navigation
  api.ts               — HTTP client wrapping all 22 API endpoints
  screens/
    login.tsx          — Username prompt
    campaigns.tsx      — List/create campaigns
    campaign-detail.tsx — Manage PCs, list/create encounters
    encounter-detail.tsx — Manage monsters & PCs, start encounter
    initiative.tsx     — Collect initiatives, display turn order
  components/
    select-list.tsx    — Arrow-key menu selector
    table.tsx          — Columnar data display
    header.tsx         — Context breadcrumb
    text-input.tsx     — Single-line text input
```

**Dependencies to add:** `ink`, `react`, `@types/react`

**New script:** `"tui": "tsx src/tui/index.tsx"`

## Navigation & State

The `<App />` component manages a screen state machine and a context object that accumulates as the user drills down.

### State Shape

```typescript
type Screen = 'login' | 'campaigns' | 'campaign-detail' | 'encounter-detail' | 'initiative'

type AppContext = {
  username: string | null
  dmId: string | null
  campaign: { id: string; name: string } | null
  encounter: { id: string; name: string } | null
}
```

### Navigation Flow

```
login → campaigns → campaign-detail → encounter-detail → initiative
                 ↑         |                  |
                 └─────────┘                  |
                 (back)        ←──────────────┘
                                   (back)
```

- Each screen receives `context` and a `navigate(screen, contextUpdates)` callback.
- Escape key navigates back one level, clearing the relevant context field.
- Login has no back — Ctrl+C to exit.
- `<Header />` renders a breadcrumb: `DM: travis > Campaign: Lost Mines > Encounter: Goblin Ambush`

## Screen Behaviors

### Login

Text input for username. On submit, calls `POST /api/auth/login`. Sets `username` and `dmId` in context, navigates to campaigns.

### Campaigns

Fetches `GET /api/campaigns` on mount. Displays a select list of campaigns plus a `[+ New Campaign]` option at the top. Selecting a campaign navigates to campaign-detail. Selecting new prompts for a name, calls `POST /api/campaigns`, then navigates to the new campaign's detail.

### Campaign Detail

Shows campaign name. Select menu with:

- **PCs** — Lists PCs (`GET /api/campaigns/:id/pcs`). Option to add a new PC (prompts for name + player name, calls `POST`).
- **Encounters** — Lists encounters with status badge (`[draft]` / `[active]`). Option to create new (prompts for name, calls `POST`). Selecting an encounter navigates to encounter-detail.
- **Back** — Returns to campaigns list.

### Encounter Detail

Shows encounter name and status.

**If draft**, shows a select menu:

- **Monsters** — Lists monsters. Options to add (prompts for name, quantity, initiative modifier, calls `POST`) or remove (select from list, calls `DELETE`).
- **PCs** — Lists assigned PCs. Options to assign (shows unassigned PCs from campaign as checklist, calls `POST`) or remove (select from list, calls `DELETE`).
- **Start Encounter** — Navigates to initiative screen.
- **Back** — Returns to campaign-detail.

**If active**, shows the turn order table (read-only) with back option.

### Initiative

Prompts for PC initiatives one at a time (text input for each). Asks whether monster initiatives should be auto-rolled or manual. If manual, prompts for each monster. Calls `POST /api/encounters/:id/start`. On success, displays the turn order table sorted by initiative. Escape goes back to encounter-detail (which now shows the active state).

## API Client

`api.ts` is a class wrapping `fetch` with the base URL and `X-DM-Username` header managed internally.

```typescript
class ApiClient {
  private baseUrl: string
  private username: string | null

  constructor(baseUrl = 'http://localhost:3000')

  // Auth
  login(username: string): Promise<{ id: string; username: string }>

  // Campaigns
  getCampaigns(): Promise<Campaign[]>
  createCampaign(name: string): Promise<Campaign>
  getCampaign(id: string): Promise<Campaign>

  // PCs
  getPCs(campaignId: string): Promise<PC[]>
  createPC(campaignId: string, name: string, playerName: string): Promise<PC>

  // Encounters
  getEncounters(campaignId: string): Promise<Encounter[]>
  getEncounter(id: string): Promise<Encounter>
  createEncounter(campaignId: string, name: string): Promise<Encounter>

  // Monsters
  getMonsters(encounterId: string): Promise<Monster[]>
  addMonsters(encounterId: string, name: string, quantity: number, initiativeModifier: number): Promise<Monster[]>
  removeMonster(encounterId: string, monsterId: string): Promise<void>

  // Encounter PCs
  getEncounterPCs(encounterId: string): Promise<PC[]>
  assignPCs(encounterId: string, pcIds: string[]): Promise<PC[]>
  removeEncounterPC(encounterId: string, pcId: string): Promise<void>

  // Initiative
  startEncounter(encounterId: string, monsterInitiatives: 'auto' | 'manual', initiatives: Record<string, number>): Promise<StartResult>
}
```

A single instance is created at the top level and passed to screens via props. All methods throw on non-2xx responses with the error message from the API's `{ error: string }` body. Screens display errors inline as red text.

## Reusable Components

**`<SelectList />`** — Arrow-key navigable menu. Takes `items: { label: string, value: string }[]`. Highlights the active item. Enter to select. Calls `onSelect(value)`.

**`<Table />`** — Columnar data with headers. Takes `columns: string[]` and `rows: string[][]`. Left-aligns and pads columns.

**`<Header />`** — Breadcrumb bar from app context. Always visible at the top. Shows `DM: {username}`, appending `> {campaign}` and `> {encounter}` as context grows.

**`<TextInput />`** — Single-line text input with a label. Captures keystrokes, displays current value, calls `onSubmit(value)` on Enter.
