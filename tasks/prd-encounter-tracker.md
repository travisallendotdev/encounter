# PRD: Encounter — D&D 5e Combat Tracker (Server)

## Introduction

Encounter is a server-side API for tracking Dungeons & Dragons 5th Edition combat encounters. It allows a Dungeon Master (DM) to manage campaigns, player characters, and encounters — including initiative tracking when combat begins. This is a proof-of-concept focused on the REST API only; no frontend is included.

## Goals

- Provide a simple, stateless REST API for managing D&D 5e combat encounters
- Allow DMs to organize PCs and encounters under campaigns
- Support initiative entry (manual) and auto-rolling (for monsters) when starting an encounter
- Keep authentication minimal (username header, no password) for rapid POC iteration
- Use SQLite for lightweight, zero-config persistence

## User Stories

### US-001: DM Login
**Description:** As a DM, I want to identify myself with a username so the server knows who I am.

**Acceptance Criteria:**
- [ ] `POST /api/auth/login` accepts `{ "username": string }` and returns a DM object with an `id` and `username`
- [ ] If the username doesn't exist, a new DM record is created automatically
- [ ] If the username already exists, the existing DM record is returned
- [ ] All subsequent endpoints require an `X-DM-Username` header; requests without it receive `401 Unauthorized`
- [ ] Typecheck passes

### US-002: Create a Campaign
**Description:** As a DM, I want to create a campaign with a name so I can organize my encounters.

**Acceptance Criteria:**
- [ ] `POST /api/campaigns` accepts `{ "name": string }` and returns the created campaign with `id`, `name`, `dmId`, and `createdAt`
- [ ] Campaign names must be non-empty strings
- [ ] The campaign is associated with the authenticated DM
- [ ] `GET /api/campaigns` returns all campaigns belonging to the authenticated DM
- [ ] `GET /api/campaigns/:id` returns a single campaign (404 if not found or not owned by DM)
- [ ] Typecheck passes

### US-003: Add PCs to a Campaign
**Description:** As a DM, I want to add Player Characters to my campaign, along with the player's name, so I can track who is playing.

**Acceptance Criteria:**
- [ ] `POST /api/campaigns/:id/pcs` accepts `{ "name": string, "playerName": string }` and returns the created PC with `id`, `name`, `playerName`, and `campaignId`
- [ ] Both `name` (character name) and `playerName` (human player name) are required, non-empty strings
- [ ] The PC is associated with the specified campaign
- [ ] Returns 404 if the campaign doesn't exist or isn't owned by the DM
- [ ] `GET /api/campaigns/:id/pcs` returns all PCs in a campaign
- [ ] Typecheck passes

### US-004: Create an Encounter
**Description:** As a DM, I want to create an encounter within a campaign so I can set up a combat scenario.

**Acceptance Criteria:**
- [ ] `POST /api/campaigns/:id/encounters` accepts `{ "name": string }` and returns the created encounter with `id`, `name`, `campaignId`, `encounterNumber`, and `status` ("draft")
- [ ] `encounterNumber` auto-increments per campaign (first encounter = 1, second = 2, etc.)
- [ ] The encounter name must be a non-empty string
- [ ] Returns 404 if the campaign doesn't exist or isn't owned by the DM
- [ ] `GET /api/campaigns/:id/encounters` returns all encounters in a campaign
- [ ] `GET /api/encounters/:id` returns a single encounter with its monsters and PCs
- [ ] Typecheck passes

### US-005: Add Monsters to an Encounter
**Description:** As a DM, I want to add one or more monsters to an encounter by name and quantity so I can populate the combat.

**Acceptance Criteria:**
- [ ] `POST /api/encounters/:id/monsters` accepts `{ "name": string, "quantity": number, "initiativeModifier": number }` where quantity >= 1 and initiativeModifier defaults to 0
- [ ] Creates individual monster instances labeled sequentially (e.g., "Goblin 1", "Goblin 2") when quantity > 1
- [ ] Each monster instance gets its own record with `id`, `name`, `encounterInstanceName`, `initiativeModifier`, and `encounterId`
- [ ] Can be called multiple times to add different monster types to the same encounter
- [ ] Returns 404 if the encounter doesn't exist or isn't owned by the DM
- [ ] Encounter must be in "draft" status to add monsters; returns 400 otherwise
- [ ] `GET /api/encounters/:id/monsters` returns all monsters in an encounter
- [ ] `DELETE /api/encounters/:id/monsters/:monsterId` removes a monster from a draft encounter; returns 400 if encounter is not in "draft" status
- [ ] Typecheck passes

### US-006: Assign PCs to an Encounter
**Description:** As a DM, I want to assign PCs from my campaign to an encounter so they participate in combat.

**Acceptance Criteria:**
- [ ] `POST /api/encounters/:id/pcs` accepts `{ "pcIds": string[] }` — an array of PC IDs to assign
- [ ] The PCs must belong to the same campaign as the encounter; returns 400 if any don't match
- [ ] Returns 404 if the encounter doesn't exist or isn't owned by the DM
- [ ] Encounter must be in "draft" status to assign PCs; returns 400 otherwise
- [ ] Duplicate assignments are ignored (idempotent)
- [ ] `GET /api/encounters/:id/pcs` returns all PCs assigned to an encounter
- [ ] `DELETE /api/encounters/:id/pcs/:pcId` removes a PC from a draft encounter; returns 400 if encounter is not in "draft" status
- [ ] Typecheck passes

### US-007: Start an Encounter with Initiative
**Description:** As a DM, I want to start an encounter and enter initiative values so combat can proceed in turn order.

**Acceptance Criteria:**
- [ ] `POST /api/encounters/:id/start` accepts initiative data and transitions the encounter from "draft" to "active"
- [ ] Request body: `{ "monsterInitiatives": "manual" | "auto", "initiatives": { "<participantId>": number }[] }`
- [ ] If `monsterInitiatives` is "auto", the server rolls 1d20 + `initiativeModifier` individually for each monster — any monster values provided in `initiatives` are ignored
- [ ] If `monsterInitiatives` is "manual", initiative values for all monsters must be provided in `initiatives`
- [ ] Initiative values for all assigned PCs must always be provided in `initiatives` (PCs never auto-roll)
- [ ] Returns 400 if required initiative values are missing
- [ ] Returns 400 if encounter has no monsters or no PCs assigned
- [ ] Returns the encounter with all participants sorted by initiative (descending), with ties broken randomly
- [ ] Response includes a `turnOrder` array of `{ participantId, participantType ("pc" | "monster"), name, initiative }` sorted by initiative
- [ ] Encounter status changes to "active"
- [ ] Returns 404 if the encounter doesn't exist or isn't owned by the DM
- [ ] Returns 400 if the encounter is not in "draft" status
- [ ] Typecheck passes

## Functional Requirements

- FR-1: All endpoints return JSON responses with consistent error shapes: `{ "error": string }`
- FR-2: Authentication is via `X-DM-Username` header on all endpoints except `POST /api/auth/login`
- FR-3: SQLite database stores all state, created automatically on first run
- FR-4: Auto-incrementing encounter numbers are scoped per campaign
- FR-5: Monster instances are created as individual records with sequential display names (e.g., "Goblin 1", "Goblin 2")
- FR-6: Auto-rolled initiative uses 1d20 + `initiativeModifier` per individual monster
- FR-7: Initiative ties are broken by random ordering
- FR-8: Encounter status follows the lifecycle: `draft` → `active` (no further transitions in this POC)
- FR-9: Modifications to encounter roster (adding/removing monsters, assigning/removing PCs) are only allowed in "draft" status
- FR-10: Monsters store an `initiativeModifier` (integer, default 0) used for auto-roll calculations
- FR-11: DELETE endpoints exist for removing individual monsters and PCs from draft encounters

## Non-Goals

- No password authentication or token-based auth
- No frontend / UI
- No combat round tracking, HP tracking, or damage/healing
- No monster stat blocks or ability scores beyond initiative modifier
- No encounter status transitions beyond draft → active (no "complete" or "pause")
- No PC ability modifiers affecting initiative (PCs are always manual entry)
- No WebSocket or real-time features
- No multi-DM collaboration on a single campaign
- No deleting or editing campaigns, PCs, or encounters (only removing monsters/PCs from draft encounters)

## Technical Considerations

- **Framework:** Hono on Node.js (already configured in the project)
- **Database:** SQLite via `better-sqlite3` (synchronous API, simple for POC)
- **Schema:** Migrations managed as SQL files, run on server startup
- **Project structure:** Route handlers in `src/routes/`, database logic in `src/db/`, types in `src/types.ts`
- **Validation:** Basic input validation in route handlers (no external validation library needed for POC)
- **IDs:** Use UUIDs (via `crypto.randomUUID()`) for all entity primary keys except `encounterNumber`

## Success Metrics

- All user stories pass their acceptance criteria
- API is testable via curl or any HTTP client without additional setup
- Server starts and auto-creates the database with no manual migration steps
- Typecheck (`pnpm build`) passes with zero errors

## Resolved Questions

- **Monster initiative modifier:** Monsters store an `initiativeModifier` (integer), provided when adding monsters to an encounter. Auto-roll uses 1d20 + modifier.
- **DELETE endpoints:** Yes — monsters and PCs can be removed from draft encounters via DELETE.
- **Audit logging:** Yes, future phases will need encounter history/audit logging. Not in scope for this POC but design should not preclude it.
