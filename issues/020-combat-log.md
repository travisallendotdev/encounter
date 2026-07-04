# Feature: Combat Log

## Summary

Maintain a running, chronological log of what happens during an encounter —
turn/round advances, damage dealt, healing, and condition changes — so the
DM can review and narrate what has occurred.

## Current behavior (Dice Fight)

- Combat state is client-side only: `combatReducer.ts` tracks `round` and
  `turnIndex`, persisted to `sessionStorage` via `combatStorage.ts`
  (`web/src/features/combat/`).
- Nothing records history — advancing a turn simply mutates the current
  index. There is no record of damage, healing, or condition changes
  (those features don't emit events yet).

## Reference

Shieldmaiden keeps a combat log listing each event (attacks, damage,
healing, conditions, turn changes) in order for the current encounter.

## Proposed fix

- Frontend: introduce a log of structured entries (timestamp, round,
  actor, target, event type, detail). Have the reducer append entries when
  turns advance and when damage/healing/condition actions fire, and render
  a scrollable log panel in `CombatPage.tsx`. Persist entries with the rest
  of combat state in `combatStorage.ts`.
- Backend: for cross-device durability (see
  [[persist-combat-session-across-devices]]), persist log entries
  server-side on the encounter and expose them via the combat-state
  endpoint. A dedicated `combat_log` table keyed by encounter is the
  natural home; append on each mutating combat action in
  `src/routes/encounters.ts`.

## Acceptance criteria

- [ ] Turn and round advances are recorded in the log.
- [ ] Damage, healing, and condition changes produce log entries.
- [ ] The log is ordered chronologically and viewable during combat.
- [ ] The log persists across reload (and ideally across devices).
- [ ] The log resets/archives appropriately when an encounter ends.

## Related

[[damage-meters]], [[combatant-hp-ac-tracking]],
[[conditions-status-effects]], [[action-spell-rolling]],
[[persist-combat-session-across-devices]]
