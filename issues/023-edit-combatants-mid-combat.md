# Feature: Edit Combatants Mid-Combat

## Summary

Allow the DM to add, remove, and reorder combatants in the turn order after
combat has started — for reinforcements arriving, creatures dropping out, or
initiative corrections. Today the turn order is fixed once combat begins.

## Current behavior (Dice Fight)

- `turn_order` (`src/db/migrations/001-initial-schema.sql`) is populated by
  `POST /api/encounters/:id/start` and never changed afterward
  (`src/routes/encounters.ts`).
- The client receives turn order once and stores it in `sessionStorage`
  (`combatStorage.ts`); `combatReducer.ts` only advances the turn index.
  There is no action to insert, delete, or move a combatant, so the roster
  is immutable post-start.

## Reference

Shieldmaiden lets you add new combatants, remove defeated/departed ones, and
drag to reorder initiative during an ongoing encounter.

## Proposed fix

- Backend: add endpoints under `src/routes/encounters.ts` to mutate the
  turn order of an `active` encounter — add a combatant (PC or monster) with
  an initiative/position, remove a combatant, and update positions
  (reorder). Recompute `position` values and keep them contiguous.
- Frontend: add controls in `web/src/features/combat/CombatPage.tsx` to add
  a combatant, remove a row, and reorder (drag or up/down). Update the
  reducer/`combatStorage.ts` to reflect roster changes, and take care to
  keep the current turn pointing at the correct combatant after inserts and
  removals.
- Coordinate with server-side combat persistence so changes survive reload
  and sync across devices.

## Acceptance criteria

- [ ] The DM can add a new combatant to an active encounter's turn order.
- [ ] The DM can remove a combatant from an active encounter.
- [ ] The DM can reorder combatants (change initiative/position).
- [ ] The current turn index stays correct after add/remove/reorder.
- [ ] Roster changes persist across reload.

## Related

[[persist-combat-session-across-devices]], [[combatant-hp-ac-tracking]],
[[monster-stat-blocks]], [[end-encounter-rewards]]
