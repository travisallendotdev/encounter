# Feature: Follow User / Campaign

## Summary

Provide public follow pages where anyone can watch a DM's live sessions as a
spectator, discovering active broadcasts by following the DM or a specific
campaign.

## Current behavior (Dice Fight)

There is no public presence for a DM or campaign. Every route is behind
`RequireAuth` (`web/src/routes/router.tsx`), the API knows only one owning
DM (`src/middleware/auth.ts`), and there is no notion of other users,
followers, or discoverable public pages. Data is entirely private to the DM.

## Reference

Shieldmaiden has public profile/campaign pages that let users follow a DM
and spectate their live encounters.

## Proposed fix

- Backend: requires multi-user identity and public reads
  ([[password-authentication]]). Add a `follows` table
  (`follower_id`, `dm_id`). Public endpoints `GET /api/users/:username` and
  `GET /api/users/:username/live` list that DM's currently-live encounters
  (built on the broadcast tokens from [[live-broadcast-player-view]]).
- Frontend: public routes (outside `RequireAuth`) for a DM profile page and
  a "watch live" spectator view; a follow button and a "following" feed of
  active sessions for signed-in users.

## Acceptance criteria

- [ ] Public DM profile page lists any live sessions
- [ ] Signed-in user can follow/unfollow a DM
- [ ] Following feed surfaces followed DMs' active broadcasts
- [ ] Spectator view is read-only and shows nothing when the DM is offline

## Related

[[live-broadcast-player-view]], [[campaign-sharing]], [[player-link-qr]], [[password-authentication]]
