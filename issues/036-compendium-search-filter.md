# Feature: Search & filtering across all compendium content

## Summary

Provide unified search and structured filtering across all compendium
content — monsters, spells, and items — so DMs can quickly find entries
by name and narrow by type-specific facets. Ties together
[[monster-bestiary-compendium]], [[spells-compendium]], and
[[items-compendium]].

## Current behavior (Dice Fight)

- No compendium content exists yet, and therefore no search or filtering
  over reference data.
- `src/db/migrations/001-initial-schema.sql` has no reference tables to
  query; `src/routes/` has no compendium endpoints.
- No compendium routes or search UI in `web/src/routes/router.tsx`.

## Reference

Shieldmaiden lets DMs search and filter compendium content across
categories.

## Proposed fix

- **Backend:** add query-param support (name search + facet filters) to
  the compendium list endpoints in `src/routes/compendium.ts`:
  monsters (CR, type, size), spells (level, school, class), items
  (type, rarity). Back name search with SQLite `LIKE` or an FTS5 virtual
  table over the seeded SRD tables for performance. Optionally add a
  unified `GET /api/compendium/search?q=` across all categories.
- **Frontend:** add a shared search/filter bar component under
  `web/src/features/compendium/` used by every compendium list, wiring
  query state to the TanStack Query hooks and reflecting filters in the
  URL search params so views are shareable/bookmarkable.

## Acceptance criteria

- [ ] Each compendium list supports name search.
- [ ] Category-appropriate filters are available (e.g. spell level/
      school, monster CR/type, item rarity).
- [ ] Filter/search state is reflected in the URL.
- [ ] Search returns results quickly over the full seeded dataset.

## Related

[[monster-bestiary-compendium]], [[spells-compendium]],
[[items-compendium]], [[conditions-rules-reference]]
