# Feature: Browsable items & equipment compendium (SRD)

## Summary

Add a browsable compendium of SRD items — magic items plus mundane gear,
weapons, and armor — with a searchable list and detail views. Provides an
in-app equipment reference and backs [[custom-item-creator]] and
character equipment selection in [[character-sheet-builder]].

## Current behavior (Dice Fight)

- No reference content of any kind exists in the app.
- There is no items/equipment table in
  `src/db/migrations/001-initial-schema.sql` and no item routes in
  `src/routes/`.
- No compendium route in `web/src/routes/router.tsx` and no
  `web/src/features/compendium/` directory.

## Reference

Shieldmaiden includes a searchable items/equipment compendium covering
gear and magic items with detail pages.

## Proposed fix

- **Backend:** import the SRD item/equipment/magic-item datasets
  (CC-licensed 5e SRD / Open5e JSON) into a read-only `srd_items` table
  via a seed script/migration. Add endpoints to
  `src/routes/compendium.ts`: `GET /api/items` (list; query params for
  type, rarity, name) and `GET /api/items/:slug` (full detail).
- **Frontend:** add `/compendium/items` and `/compendium/items/:slug`
  routes; add item list + detail components and TanStack Query hooks
  under `web/src/features/compendium/`, with a Zod-typed endpoint module
  in `web/src/api/`. Reuse the shared compendium layout/nav.

## Acceptance criteria

- [ ] SRD items are seeded and served read-only from the API.
- [ ] `/compendium/items` lists items and supports name lookup.
- [ ] A detail view renders type, rarity, attunement, cost/weight, and
      description/properties.
- [ ] Data is CC/SRD-licensed and attributed where required.

## Related

[[monster-bestiary-compendium]], [[spells-compendium]],
[[compendium-search-filter]], [[custom-item-creator]],
[[character-sheet-builder]]
