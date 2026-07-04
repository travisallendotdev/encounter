# Feature: Edit & Delete Campaigns

## Summary

Allow a DM to rename and delete campaigns. Today campaigns can only be
created and listed, so a typo in a campaign name is permanent and stale
campaigns cannot be removed.

## Current behavior (Dice Fight)

`src/routes/campaigns.ts` exposes create and list only. The `campaigns`
table (`src/db/migrations/001-initial-schema.sql`) holds `name` and `dm_id`.
`CampaignsPage.tsx` lists campaigns and `CampaignDetailPage.tsx` shows one,
but neither offers rename or delete. There is no `PATCH`/`DELETE` route.

## Reference

Shieldmaiden supports full campaign management including renaming and
deleting campaigns.

## Proposed fix

- **Backend:** add `PATCH /api/campaigns/:id` (rename) and
  `DELETE /api/campaigns/:id` in `src/routes/campaigns.ts`, both guarded by
  the `dm_id`/`X-DM-Username` owner check in `src/middleware/auth.ts`. Delete
  should cascade to PCs, encounters, and their children (via FK or explicit
  cleanup).
- **Frontend:** add rename (inline edit or dialog) and delete-with-confirm
  actions in `CampaignsPage.tsx` / `CampaignDetailPage.tsx`
  (`web/src/features/campaigns`), invalidating the campaigns query.

## Acceptance criteria

- [ ] A DM can rename a campaign they own.
- [ ] A DM can delete a campaign they own, with a confirmation step.
- [ ] Deleting cascades to child PCs/encounters/turn order.
- [ ] Non-owners receive 403/404 for edit and delete.
- [ ] Campaign list/detail UI reflects renames and removals immediately.

## Related

[[edit-delete-pcs-encounters]], [[campaign-notes-resources]]
