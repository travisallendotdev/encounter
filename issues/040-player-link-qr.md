# Feature: Player Link + QR Code

## Summary

Generate a shareable link (and matching QR code) that players can open on
their own devices to join the live player view of an encounter — no login
required.

## Current behavior (Dice Fight)

There is no shareable/public URL. All routes in
`web/src/routes/router.tsx` are behind `RequireAuth`, and the API only
authenticates the single owning DM (`src/middleware/auth.ts`). No token,
link, or QR generation exists anywhere in the codebase.

## Reference

Shieldmaiden surfaces a player link and QR code so table players can quickly
open the live view on phones.

## Proposed fix

- Backend: reuse the public broadcast token from
  [[live-broadcast-player-view]] to build a canonical player URL
  (`/live/:token`). Optionally add `GET /api/encounters/:id/player-link`
  returning the URL. This relies on the public-token/identity groundwork in
  [[password-authentication]].
- Frontend: a "Share with players" dialog on the combat page showing the
  copyable link plus an inline QR code (generated client-side from the URL);
  the target `/live/:token` route is the read-only player view.

## Acceptance criteria

- [ ] DM can view/copy a player link for a live encounter
- [ ] A scannable QR code encodes that link
- [ ] Opening the link (or scanning the QR) loads the live view without auth
- [ ] Regenerating/stopping the broadcast invalidates the old link

## Related

[[live-broadcast-player-view]], [[campaign-sharing]], [[follow-user-campaign]], [[password-authentication]]
