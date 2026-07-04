# Feature: Custom Item Creator

## Summary

Let a DM create and edit custom (homebrew) items — weapons, armor, magic
items, gear — with descriptions and properties, saved to a reusable library.

## Current behavior (Dice Fight)

There is no concept of items in Dice Fight. The schema
(`src/db/migrations/001-initial-schema.sql`) covers only DMs, campaigns,
PCs, encounters, monsters, and turn order. No items table, routes, or UI
exist, and there is no homebrew content creation.

## Reference

Shieldmaiden includes a homebrew item creator storing custom items for reuse
and reference.

## Proposed fix

- Backend: add a DM-scoped `custom_items` table (name, type/category,
  rarity, attunement, properties, description, weight, cost). CRUD at
  `/api/items` following existing route/auth conventions in `src/routes/`.
- Frontend: an items library feature under `web/src/features/` with
  list/create/edit forms (react-hook-form + Zod) and a detail view.

## Acceptance criteria

- [ ] DM can create, edit, and delete a homebrew item
- [ ] Item fields (type, rarity, attunement, properties, description)
      persist
- [ ] Custom items are scoped to the owning DM
- [ ] Items list is browsable/searchable in the UI

## Related

[[custom-monster-creator]], [[custom-spell-creator]]
