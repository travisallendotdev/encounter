# Feature: Transform / Polymorph a Combatant

## Summary

Let the DM transform a combatant into a different stat block (druid Wild
Shape, the polymorph spell, a shapechanger, etc.) during combat, and revert
back to the original form later, preserving the original combatant's data.

## Current behavior (Dice Fight)

- A combatant in `turn_order` is a fixed `{ participant_id, type, name,
initiative, position }` row (`src/db/migrations/001-initial-schema.sql`).
- There is no stat block to swap and no mechanism to substitute one
  creature's stats for another. The combat state
  (`web/src/features/combat/combatReducer.ts`) tracks only round/turn.

## Reference

Shieldmaiden supports transforming a combatant into another creature's stat
block and reverting to the original, keeping the original HP/conditions to
restore on revert.

## Proposed fix

- Prerequisite: stat blocks and combatant HP tracking must exist (see
  related issues).
- Backend: model a combatant's "current form" vs "base form" so a transform
  points at an alternate stat block while retaining the original. Add
  transform/revert handling in `src/routes/encounters.ts` (or the
  combat-state endpoint), storing the temporary form and its own HP pool.
- Frontend: in `web/src/features/combat/`, add a transform action on a
  combatant that lets the DM pick a stat block; render the transformed
  name/stats and a revert action. Persist the transform state alongside
  other combat state.
- On revert, restore the original stat block, name, and pre-transform HP;
  D&D rules: damage overflowing the temporary form carries to the original.

## Acceptance criteria

- [ ] A combatant can be transformed into another stat block mid-combat.
- [ ] The transformed combatant uses the new form's HP/stats/actions.
- [ ] The combatant can be reverted to its original form and HP.
- [ ] Overflow damage past the temporary form's HP applies to the original.
- [ ] Transform state survives reload (persisted with combat state).

## Related

[[monster-stat-blocks]], [[combatant-hp-ac-tracking]],
[[action-spell-rolling]], [[combat-log]]
