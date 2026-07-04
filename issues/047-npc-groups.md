# Feature: NPC Groups

## Summary

Let a DM organize custom NPCs/monsters into named groups (e.g., "Goblin
Warband", "Town Guards") so a whole set can be added to an encounter or
reused together in one action.

## Current behavior (Dice Fight)

Monsters are created one-at-a-time and are encounter-bound. The `monsters`
table (`src/db/migrations/001-initial-schema.sql`) stores only name and init
modifier, added individually in `src/routes/encounters.ts`. There is no
reusable monster library and no grouping/collection concept anywhere.

## Reference

Shieldmaiden lets DMs group creatures/NPCs into named collections for quick
bulk reuse.

## Proposed fix

- Backend: build on the custom monster library ([[custom-monster-creator]]).
  Add DM-scoped `npc_groups` and `npc_group_members` tables linking library
  monsters into named groups. CRUD at `/api/npc-groups` per existing route
  conventions; support "add group to encounter" that inserts all members as
  combatants.
- Frontend: a groups view within the monsters library feature
  (`web/src/features/`) to create groups, manage membership, and add a whole
  group to an encounter in one action.

## Acceptance criteria

- [ ] DM can create, rename, and delete a named NPC group
- [ ] DM can add/remove custom monsters as group members
- [ ] Adding a group to an encounter inserts all members as combatants
- [ ] Groups are scoped to the owning DM

## Related

[[custom-monster-creator]], [[monster-bestiary-compendium]], [[monster-stat-blocks]]
