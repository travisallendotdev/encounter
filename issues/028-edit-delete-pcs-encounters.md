# Feature: Edit & Delete PCs and Encounters

## Summary

Allow renaming/editing and deleting player characters and encounters.
Currently both are create-only (aside from removing a monster/PC from a
draft), so mistakes in names cannot be corrected and stale records pile up.

## Current behavior (Dice Fight)

`src/routes/campaigns.ts` adds/lists PCs (`pcs`: `name`, `player_name`,
`campaign_id`); `src/routes/encounters.ts` creates/lists encounters and
shows detail. Neither has update or delete routes for the PC or encounter
itself. `CampaignDetailPage.tsx` (PC roster + encounter list) offers no edit
or delete controls. Only monster/PC-staging removal within a draft exists.

## Reference

Shieldmaiden lets a DM edit and remove players and encounters at any time.

## Proposed fix

- **Backend:** add `PATCH`/`DELETE /api/campaigns/:campaignId/pcs/:pcId`
  (name, player_name) and `PATCH`/`DELETE /api/encounters/:id` (name), all
  owner-checked via `src/middleware/auth.ts`. Encounter delete cascades to
  monsters/encounter_pcs/turn_order.
- **Frontend:** add inline edit + delete-with-confirm to the PC roster panel
  and encounter list in `CampaignDetailPage.tsx`
  (`web/src/features/{campaigns,encounters}`), invalidating the relevant
  queries.

## Acceptance criteria

- [ ] A DM can rename a PC's name and player name.
- [ ] A DM can delete a PC (removing it from encounters it was staged in).
- [ ] A DM can rename and delete an encounter.
- [ ] Encounter delete cascades to monsters, staged PCs, and turn order.
- [ ] Ownership is enforced; non-owners are rejected.
- [ ] Roster and encounter list UI reflect edits/deletes immediately.

## Related

[[campaign-crud-edit-delete]], [[pc-combat-stats]], [[character-sheet-builder]]
