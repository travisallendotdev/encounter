# Feature: Live Broadcast Player View

## Summary

Let a DM "go live" during combat so players can open a read-only shared
view showing the initiative order, whose turn it is, and each combatant's
HP status. The view updates as the DM advances turns and applies changes.

## Current behavior (Dice Fight)

There is no player-facing surface at all. Every route in
`web/src/routes/router.tsx` sits behind `RequireAuth`, and the API auth
model (`src/middleware/auth.ts`) recognizes only a single owning DM via the
`X-DM-Username` header — there are no player accounts and no public reads.
All data (`encounters`, `turn_order`, `monsters`, `pcs`) is scoped to the
owning DM, so nothing can be broadcast to a non-DM audience today.

## Reference

Shieldmaiden offers a live "player view" that mirrors the active encounter
(turn order, current actor, HP bars) in real time to a shared screen.

## Proposed fix

- Backend: add a public read token per encounter (new column or
  `broadcast_sessions` table) minted by `POST /api/encounters/:id/broadcast`.
  Add an unauthenticated `GET /api/live/:token` returning a sanitized turn
  order (names, current actor, HP as coarse status buckets — not raw
  numbers unless the DM opts in). This introduces public read access, which
  depends on the identity/token work in [[password-authentication]].
- Frontend: DM "Go Live" toggle on the combat page; a new public route
  (outside `RequireAuth`) rendering the read-only list, polling (or SSE)
  for updates.

## Acceptance criteria

- [ ] DM can start/stop a live broadcast for an active encounter
- [ ] Public route renders turn order, current actor, and HP status without auth
- [ ] View updates as the DM advances turns or edits HP
- [ ] Stopping the broadcast invalidates the token / returns 404

## Related

[[campaign-sharing]], [[player-link-qr]], [[follow-user-campaign]], [[combatant-hp-ac-tracking]], [[conditions-status-effects]], [[password-authentication]]
