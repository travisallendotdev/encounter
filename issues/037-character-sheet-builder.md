# Feature: Multi-step player-character sheet builder

## Summary

Add a full character-sheet builder that guides a player through creating
a PC — race, class, level, ability scores, skills, and starting
equipment — replacing the current name-only PC record. The resulting
combat-relevant stats feed [[pc-combat-stats]].

## Current behavior (Dice Fight)

- PCs are name-only: the `pcs` table
  (`src/db/migrations/001-initial-schema.sql`) stores just `name` and
  `player_name` — no race, class, level, ability scores, HP, AC, or
  equipment.
- `web/src/features/` has no character-sheet feature; PCs are entered as
  plain fields with no builder flow.

## Reference

Shieldmaiden provides a structured character creation/sheet experience
with class, race, abilities, and equipment.

## Proposed fix

- **Backend:** extend the `pcs` schema (or add related tables) to store
  race, class, level, ability scores, proficiencies/skills, HP, AC, and
  equipment. Source race/class/equipment options from the SRD datasets
  (see [[items-compendium]]) rather than hardcoding. Add
  create/update endpoints in `src/routes/campaigns.ts` (or a new
  `pcs.ts`) accepting the fuller PC payload.
- **Frontend:** add a `web/src/features/characters/` feature with a
  multi-step builder (react-hook-form + Zod per step: identity → race →
  class/level → abilities → skills → equipment → review), TanStack Query
  mutations, and a route (e.g. `/campaigns/:id/pcs/new` and an edit
  route) in `web/src/routes/router.tsx`. Derived stats (modifiers,
  proficiency bonus) computed client-side and validated server-side.

## Acceptance criteria

- [ ] A player can build a PC through a multi-step flow (race, class,
      level, abilities, skills, equipment).
- [ ] The full PC record persists and can be edited.
- [ ] Ability modifiers and proficiency bonus are derived correctly.
- [ ] Combat-relevant stats are available for [[pc-combat-stats]].

## Related

[[pc-combat-stats]], [[items-compendium]], [[monster-stat-blocks]]
