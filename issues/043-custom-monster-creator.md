# Feature: Custom Monster Creator

## Summary

Let a DM create and edit custom monsters/NPCs with full stat blocks
(homebrew) that are saved to their library and reusable across encounters,
rather than typing ad-hoc combatants each time.

## Current behavior (Dice Fight)

Monsters are minimal and encounter-bound. The `monsters` table
(`src/db/migrations/001-initial-schema.sql`) stores only `name` and an
initiative modifier, created inline under an encounter in
`src/routes/encounters.ts`. There is no reusable monster record, no stat
block (AC, HP, abilities, actions), and no homebrew content library.

## Reference

Shieldmaiden includes a homebrew creature builder with complete stat blocks,
stored for reuse across encounters.

## Proposed fix

- Backend: add a DM-scoped `custom_monsters` table capturing a full stat
  block (AC, max HP, ability scores, speed, actions/traits, CR, init mod).
  CRUD at `/api/monsters` (library) following existing route conventions;
  allow adding an encounter combatant from a library entry (copy stats into
  `turn_order`/monster instance). See [[monster-stat-blocks]].
- Frontend: a monsters library feature (`web/src/features/`) with
  list/create/edit forms (react-hook-form + Zod) and an "add to encounter"
  action from the encounter builder.

## Acceptance criteria

- [ ] DM can create, edit, and delete a custom monster with a full stat block
- [ ] Library monsters persist and are reusable across encounters
- [ ] Adding a library monster to an encounter copies its stats
- [ ] Custom monsters are scoped to the owning DM

## Related

[[monster-stat-blocks]], [[monster-bestiary-compendium]], [[custom-spell-creator]], [[custom-item-creator]], [[npc-groups]]
