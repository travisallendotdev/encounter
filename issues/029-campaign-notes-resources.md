# Feature: Campaign Notes & Resource Pages

## Summary

Give each campaign a space for freeform DM notes, cheat sheets, and resource
pages (NPCs, plot threads, house rules). Keeps session prep and reference
material attached to the campaign it belongs to.

## Current behavior (Dice Fight)

Campaigns (`campaigns` in `src/db/migrations/001-initial-schema.sql`) store
only `name` and `dm_id`. There is no notes/resource storage in the schema,
`src/routes/campaigns.ts`, or `CampaignDetailPage.tsx`, which shows only the
PC roster panel and encounter list.

## Reference

Shieldmaiden provides per-campaign notes and resource/reference pages the DM
can maintain alongside encounters.

## Proposed fix

- **Backend:** add a `campaign_notes` table (id, campaign_id, title, body,
  updated_at) and CRUD routes under
  `/api/campaigns/:id/notes` in `src/routes/campaigns.ts`, owner-checked via
  `src/middleware/auth.ts`.
- **Frontend:** add a Notes tab/panel to `CampaignDetailPage.tsx`
  (`web/src/features/campaigns`) listing note pages with create/edit/delete,
  using a markdown or plain-text editor and a notes query.

## Acceptance criteria

- [ ] A DM can create multiple note/resource pages under a campaign.
- [ ] Notes have a title and body and can be edited and deleted.
- [ ] Notes are scoped to the owning DM's campaign.
- [ ] `CampaignDetailPage` surfaces the notes alongside PCs and encounters.
- [ ] Note edits persist and reload correctly.

## Related

[[campaign-crud-edit-delete]], [[dm-settings-view]]
