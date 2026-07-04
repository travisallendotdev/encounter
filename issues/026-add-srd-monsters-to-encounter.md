# Feature: Add Monsters from Bestiary to Encounter

## Summary

Replace free-text monster entry with a picker that pulls monsters from a
bestiary (SRD + homebrew), copying their stat block into the encounter.
This gives every added monster real CR/XP/HP data instead of just a name.

## Current behavior (Dice Fight)

Monsters are added to a draft encounter as free text: the MonsterPanel in
`EncounterSetupPage.tsx` posts a `name`, quantity, and
`initiative_modifier`, stored in the `monsters` table
(`src/db/migrations/001-initial-schema.sql`) with no CR, XP, or HP. Add/remove
monster endpoints live in `src/routes/encounters.ts` and are draft-only.

## Reference

Shieldmaiden adds combatants by searching a monster compendium and dropping
the chosen creature (with its full stat block) into the encounter.

## Proposed fix

- **Backend:** depends on the bestiary from [[monster-bestiary-compendium]]
  and stat blocks from [[monster-stat-blocks]]. Add
  `POST /api/encounters/:id/monsters` variant that takes a `bestiary_id` +
  quantity and snapshots the stat block into the encounter's monster rows;
  keep free-text add as a fallback.
- **Frontend:** replace/augment the MonsterPanel form with a searchable
  bestiary picker (`web/src/features/encounters`), showing CR and XP in
  results; selecting adds the monster with its stats.

## Acceptance criteria

- [ ] Monsters can be added by selecting from the bestiary, not just typing.
- [ ] Added monsters carry CR/XP/HP snapshotted from the bestiary entry.
- [ ] Bestiary picker is searchable and shows CR/XP.
- [ ] Free-text add still works for quick/homebrew entries.
- [ ] Adding remains draft-only, matching current monster rules.

## Related

[[monster-bestiary-compendium]], [[monster-stat-blocks]], [[encounter-difficulty-xp]]
