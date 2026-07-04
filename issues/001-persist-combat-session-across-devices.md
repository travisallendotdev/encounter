# Persist combat turn order so a login on another device can resume it

## Summary

Turn order for an active encounter lives only in `sessionStorage` on the
browser that called `POST /api/encounters/:id/start`. If the DM logs in on a
different device (or a different browser/tab whose session storage was
cleared), the combat page has no data to render and falls back to a
"Turn order unavailable" message, even though the encounter is `active` on
the server.

## Current behavior

- `POST /api/encounters/:id/start` returns the turn order once; the client
  never re-fetches it.
- `web/src/features/combat/combatStorage.ts` persists `{ encounterId,
  encounterName, turnOrder, round, turnIndex }` to
  `sessionStorage['dicefight.combat.<encounterId>']` and reads it back on
  page load.
- `sessionStorage` is scoped to a single browser tab/session — it does not
  sync across devices, browsers, or even a closed-and-reopened tab in some
  cases.
- If `loadCombat(encounterId)` returns `null` for an `active` encounter,
  `CombatPage` renders `MissingCombatState`
  (`web/src/features/combat/CombatPage.tsx:181`), telling the user the turn
  order "lives only in the session that started combat."

## Why this matters

DMs commonly switch devices mid-session (laptop to tablet, browser crash,
clearing storage). Losing round/turn/initiative state is disruptive during
a live game and currently unrecoverable without restarting combat.

## Proposed fix

Move combat state ownership from the client to the server so it survives
across devices/sessions:

- Persist `round`, `turnIndex`, and `turnOrder` server-side (e.g. on the
  encounter record) when combat starts and on each turn advance.
- Add a way for the client to re-fetch current combat state for an
  `active` encounter (e.g. `GET /api/encounters/:id/combat`) instead of
  relying solely on local storage.
- Update `combatStorage.ts` / `CombatPage.tsx` to hydrate from the server
  response when local storage is empty, keeping local storage as a fast
  local cache rather than the source of truth.
- Ensure turn advances (`NEXT_TURN`) are written back to the server so
  other devices stay in sync.

## Acceptance criteria

- [ ] Starting combat on device A and logging in as the same DM on device B
      shows the current round, turn index, and initiative order.
- [ ] Advancing a turn on one device is reflected when the encounter is
      reloaded on another device.
- [ ] Clearing `sessionStorage` (or opening a new browser) for an `active`
      encounter no longer triggers "Turn order unavailable."
- [ ] Existing single-device combat flow and e2e tests continue to pass.

## Out of scope

- Real-time multi-device sync (e.g. websockets) — polling/re-fetch on
  navigation is sufficient for v1.
