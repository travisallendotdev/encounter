# Feature: Conditions & core rules reference

## Summary

Add in-app reference pages for the D&D 5e conditions (blinded, grappled,
prone, etc.) and core combat rules, viewable during play. This is the
content/reference companion to the interactive
[[conditions-status-effects]] feature, which applies conditions to
combatants; this ticket is about the read-only rules text.

## Current behavior (Dice Fight)

- No reference content of any kind exists in the app.
- There is no conditions or rules table in
  `src/db/migrations/001-initial-schema.sql` and no related routes in
  `src/routes/`.
- No reference route exists in `web/src/routes/router.tsx`.

## Reference

Shieldmaiden surfaces conditions and rules text as in-app reference the
DM can read during a session.

## Proposed fix

- **Backend:** seed the SRD conditions (and a curated set of core combat
  rules) into a read-only `srd_conditions` / `srd_rules` table via a
  seed script/migration. Add endpoints to `src/routes/compendium.ts`:
  `GET /api/conditions`, `GET /api/conditions/:slug`, and
  `GET /api/rules` (list + detail).
- **Frontend:** add `/compendium/conditions` (and rules) routes plus
  list/detail components under `web/src/features/compendium/`, with a
  Zod-typed endpoint module in `web/src/api/`. Link condition entries
  from the [[conditions-status-effects]] UI so applying a condition can
  deep-link to its rules text.

## Acceptance criteria

- [ ] All SRD conditions are seeded and served read-only.
- [ ] `/compendium/conditions` lists conditions with detail views
      showing the full rules text.
- [ ] A core-rules reference section is browsable in-app.
- [ ] Data is CC/SRD-licensed and attributed where required.

## Related

[[conditions-status-effects]], [[dm-screen]],
[[compendium-search-filter]]
