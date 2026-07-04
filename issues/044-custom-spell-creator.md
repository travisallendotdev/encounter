# Feature: Custom Spell Creator

## Summary

Let a DM create and edit custom (homebrew) spells with full details — level,
school, casting time, range, components, duration, and description — saved
to a reusable library.

## Current behavior (Dice Fight)

There is no concept of spells anywhere in Dice Fight. The schema
(`src/db/migrations/001-initial-schema.sql`) has only `dms`, `campaigns`,
`pcs`, `encounters`, `monsters`, and `turn_order`; no spells table, routes,
or UI exist. There is no homebrew content creation of any kind.

## Reference

Shieldmaiden provides a homebrew spell creator that stores custom spells for
reuse and reference.

## Proposed fix

- Backend: add a DM-scoped `custom_spells` table (name, level, school,
  casting_time, range, components, duration, description, concentration,
  ritual). CRUD at `/api/spells` following existing route/auth conventions
  in `src/routes/`.
- Frontend: a spells library feature under `web/src/features/` with
  list/create/edit forms (react-hook-form + Zod) and a detail view; later
  referenceable from monster stat blocks ([[custom-monster-creator]]).

## Acceptance criteria

- [ ] DM can create, edit, and delete a homebrew spell
- [ ] Spell fields (level, school, casting time, range, components,
      duration, description) persist
- [ ] Custom spells are scoped to the owning DM
- [ ] Spells list is browsable/searchable in the UI

## Related

[[custom-monster-creator]], [[custom-item-creator]], [[monster-stat-blocks]]
