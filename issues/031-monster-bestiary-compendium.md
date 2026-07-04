# Feature: Browsable monster bestiary compendium (SRD 5e)

## Summary

Dice Fight has no reference content whatsoever. Add a browsable bestiary
of SRD 5e monsters — searchable list plus full stat-block detail views —
so DMs can look up creatures. This bestiary is the source of truth that
[[add-srd-monsters-to-encounter]] and [[monster-stat-blocks]] draw from.

## Current behavior (Dice Fight)

- No content/reference library exists anywhere in the app.
- Monsters are only free-text: the `monsters` table
  (`src/db/migrations/001-initial-schema.sql`) stores a name and an
  `initiative_modifier` — no CR, HP, AC, abilities, actions, or traits.
- No compendium/bestiary route exists in `web/src/routes/router.tsx`,
  and there is no `web/src/features/compendium/` directory.

## Reference

Shieldmaiden ships a full searchable monster compendium with complete
5e stat blocks that DMs browse and pull creatures from.

## Proposed fix

- **Backend:** import the SRD monster dataset (from the CC-licensed 5e
  SRD / Open5e JSON) into new read-only tables (e.g. `srd_monsters`)
  seeded via a migration/seed script alongside
  `001-initial-schema.sql`. Add read endpoints under a new
  `src/routes/compendium.ts` (or `bestiary.ts`): `GET /api/monsters`
  (list, paginated, name/CR/type query params) and
  `GET /api/monsters/:slug` (full stat block).
- **Frontend:** add `/compendium/monsters` and
  `/compendium/monsters/:slug` routes in `router.tsx`; create
  `web/src/features/compendium/` (list + detail components, TanStack
  Query hooks) with a Zod-typed endpoint module in `web/src/api/`.
  Add a top-bar nav entry to the compendium.

## Acceptance criteria

- [ ] SRD monsters are seeded and served read-only from the API.
- [ ] `/compendium/monsters` lists monsters and supports name lookup.
- [ ] A detail view renders a full stat block (AC, HP, speed, ability
      scores, traits, actions, CR).
- [ ] Data is CC/SRD-licensed and attributed where required.

## Related

[[add-srd-monsters-to-encounter]], [[monster-stat-blocks]],
[[compendium-search-filter]], [[custom-monster-creator]]
