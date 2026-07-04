# Feature: Import / Export DM Content

## Summary

Let a DM export all of their content (campaigns, encounters, and any
homebrew) to a portable file and import it back, with sensible duplicate
handling so re-importing does not silently clobber or double up data.

## Current behavior (Dice Fight)

There is no import/export capability. Data lives in SQLite
(`src/db/migrations/001-initial-schema.sql`) and is only reachable through
the per-resource JSON routes in `src/routes/{campaigns,encounters}.ts`.
There is no bulk-export endpoint, no bundle format, and no import path in
the SPA (`web/src`). Content cannot be backed up, migrated between
instances, or shared between DMs.

## Reference

Shieldmaiden supports exporting a DM's data to a file and importing it,
including conflict/duplicate resolution on re-import.

## Proposed fix

- **Backend:** Add `GET /api/export` that serializes the authenticated
  DM's campaigns and their nested encounters into a versioned JSON bundle
  (scoped to the DM resolved by `src/middleware/auth.ts`). Add
  `POST /api/import` that accepts the bundle, validates the schema version,
  and inserts records inside a transaction. Support a duplicate strategy
  parameter (`skip` / `rename` / `merge`) keyed off a stable identifier so
  re-imports are idempotent.
- **Frontend:** Add an "Import / Export" surface (e.g. within DM settings)
  in `web/src` with an export-download button and an import file picker
  that shows a summary and duplicate-handling choice before committing.
  Add typed endpoints + Zod schemas in `web/src/api/`.

## Acceptance criteria

- [ ] A DM can download a bundle of all their campaigns and encounters.
- [ ] The bundle is versioned and self-describing.
- [ ] Importing a bundle recreates the content under the current DM.
- [ ] Duplicate handling is selectable (skip / rename / merge) and
      re-importing the same bundle does not create duplicates.
- [ ] Import runs in a transaction and fails cleanly on invalid/old bundles.

## Related

[[pdf-export]], [[monster-bestiary-compendium]], [[dm-settings-view]]
