# Feature: Encounter Difficulty & XP Budget

## Summary

Compute an encounter's difficulty rating (trivial/easy/medium/hard/deadly)
and its total + adjusted XP against the staged party's level and size,
using the 5e encounter-building math. Gives the DM a live read on whether
an encounter is balanced before starting combat.

## Current behavior (Dice Fight)

Encounters carry no difficulty or XP data. `monsters`
(`src/db/migrations/001-initial-schema.sql`) stores only `name` and
`initiative_modifier` — there is no CR, XP, or HP to build a budget from.
`encounter_pcs` stages PCs but `pcs` has no level column, so party level
is unknown. `EncounterSetupPage.tsx` (MonsterPanel + PartyPanel) shows no
difficulty indicator.

## Reference

Shieldmaiden shows a live difficulty meter and XP totals for the encounter,
recalculated as monsters and players are added.

## Proposed fix

- **Backend:** add `level` to `pcs` and CR/XP to monster data (depends on
  [[monster-stat-blocks]]). Add a difficulty calculator that sums monster
  XP, applies the party-size multiplier for the adjusted XP, and compares
  against the party's easy/medium/hard/deadly thresholds. Expose it on the
  encounter detail endpoint (`src/routes/encounters.ts`) as
  `{ totalXp, adjustedXp, difficulty, thresholds }`.
- **Frontend:** add a difficulty badge + XP summary to `EncounterSetupPage.tsx`,
  updating via the encounters query as monsters/PCs change.

## Acceptance criteria

- [ ] `pcs` records a level; monster records expose CR and XP.
- [ ] Encounter detail returns total XP, adjusted XP, and a difficulty tier.
- [ ] Adjusted XP applies the correct multiplier for the number of monsters.
- [ ] Difficulty tier is computed from the summed party thresholds.
- [ ] `EncounterSetupPage` shows a live difficulty badge and XP totals.
- [ ] With no monsters or no staged PCs, difficulty renders as trivial/empty.

## Related

[[monster-stat-blocks]], [[add-srd-monsters-to-encounter]], [[pc-combat-stats]]
