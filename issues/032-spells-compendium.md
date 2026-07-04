# Feature: Browsable spells compendium (SRD)

## Summary

Add a browsable compendium of SRD spells with a searchable list and full
detail views (level, school, casting time, range, components, duration,
description). Gives DMs and players an in-app spell reference and backs
[[action-spell-rolling]] and [[custom-spell-creator]].

## Current behavior (Dice Fight)

- No reference content of any kind exists in the app.
- There is no spells table in `src/db/migrations/001-initial-schema.sql`
  and no spell-related routes in `src/routes/`.
- No compendium route in `web/src/routes/router.tsx` and no
  `web/src/features/compendium/` directory.

## Reference

Shieldmaiden includes a searchable spell compendium with full spell
detail pages.

## Proposed fix

- **Backend:** import the SRD spell dataset (CC-licensed 5e SRD /
  Open5e JSON) into a read-only `srd_spells` table via a seed
  script/migration. Add endpoints to `src/routes/compendium.ts`:
  `GET /api/spells` (list; query params for level, school, name) and
  `GET /api/spells/:slug` (full detail).
- **Frontend:** add `/compendium/spells` and
  `/compendium/spells/:slug` routes; add spell list + detail components
  and TanStack Query hooks under `web/src/features/compendium/`, with a
  Zod-typed endpoint module in `web/src/api/`. Reuse the shared
  compendium layout/nav from the monster bestiary.

## Acceptance criteria

- [ ] SRD spells are seeded and served read-only from the API.
- [ ] `/compendium/spells` lists spells and supports name lookup.
- [ ] A detail view renders level, school, casting time, range,
      components, duration, and description.
- [ ] Data is CC/SRD-licensed and attributed where required.

## Related

[[monster-bestiary-compendium]], [[items-compendium]],
[[compendium-search-filter]], [[action-spell-rolling]],
[[custom-spell-creator]]
