# Feature: PDF Export of Stat Blocks

## Summary

Export compendium / stat-block entries (monsters, spells, magic items) to a
cleanly formatted PDF so DMs can print handouts or reference sheets for use
at the table.

## Current behavior (Dice Fight)

There is no PDF generation anywhere in the codebase. There is also no
compendium yet (see [[monster-bestiary-compendium]]); the SPA
(`web/src`) renders only campaign/encounter data from
`src/routes/{campaigns,encounters}.ts`, and no route produces printable or
PDF output. DMs have no way to take stat blocks off-screen.

## Reference

Shieldmaiden can export monster/spell/item stat blocks to PDF for printing
and offline reference.

## Proposed fix

- **Dependency:** This builds on the compendium data model introduced in
  [[monster-bestiary-compendium]]; PDF export should target those entries.
- **Backend:** Add `GET /api/compendium/:type/:id/pdf` (and optionally a
  batch endpoint) that renders a stat block to PDF using a server-side
  library, streaming `application/pdf` with a sensible filename. Reuse the
  existing DM-scoped auth middleware.
- **Frontend:** Add an "Export PDF" action on stat-block detail views (and
  multi-select on list views for batch export) in `web/src`, triggering the
  download via the typed API client in `web/src/api/`.
- Layout should be print-friendly (single stat block per page or packed
  reference sheet), matching standard 5e stat-block presentation.

## Acceptance criteria

- [ ] A DM can export a single stat block (monster/spell/item) to PDF.
- [ ] The generated PDF is legibly laid out and print-ready.
- [ ] Batch export of multiple selected entries is supported.
- [ ] Export respects DM ownership/scoping via existing auth middleware.
- [ ] The download has a meaningful filename.

## Related

[[monster-bestiary-compendium]], [[import-export-content]]
