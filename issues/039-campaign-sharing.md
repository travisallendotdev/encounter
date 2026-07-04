# Feature: Campaign Sharing

## Summary

Allow a DM to share a campaign (and its encounters) with specific other
users, granting them read access so co-DMs or players can view the same
data without owning it.

## Current behavior (Dice Fight)

All data is owned by exactly one DM. `src/middleware/auth.ts` resolves a
single DM from the `X-DM-Username` header, and every query in
`src/routes/campaigns.ts` and `src/routes/encounters.ts` scopes rows to that
DM's id. There is no concept of a second user, no membership table, and no
way to grant another account visibility into a campaign.

## Reference

Shieldmaiden lets a campaign owner invite other users to a campaign with
view (or edit) access.

## Proposed fix

- Backend: introduce user identity beyond the single DM (see
  [[password-authentication]]). Add a `campaign_shares` table
  (`campaign_id`, `user_id`, `role`). Update campaign/encounter queries to
  allow access when the requester is the owner OR has a share row. Add
  `POST /api/campaigns/:id/shares` and `DELETE .../shares/:userId`.
- Frontend: a "Share" panel in the campaign view listing collaborators and
  a form to add a user by username; shared campaigns appear in the invitee's
  campaign list (read-only affordances when role is viewer).

## Acceptance criteria

- [ ] DM can add/remove another user's access to a campaign
- [ ] Shared user sees the campaign and its encounters (read-only)
- [ ] Non-shared users still get 404/403 as today
- [ ] Owner-only actions remain restricted to the owner

## Related

[[follow-user-campaign]], [[live-broadcast-player-view]], [[player-requests]], [[password-authentication]]
