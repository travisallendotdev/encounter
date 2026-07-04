# Feature: Player Requests

## Summary

Let players in the live view submit requests — apply damage, heal, or take
an action — that queue for the DM to approve or reject during combat,
keeping the DM as the source of truth.

## Current behavior (Dice Fight)

No player can interact with the app at all. There are no player accounts,
no public write endpoints, and all mutations in `src/routes/encounters.ts`
require the owning DM (`src/middleware/auth.ts`). Combat state changes are
DM-only on a DM-only combat page.

## Reference

Shieldmaiden players can send requests (e.g., "I take 5 damage") that the DM
confirms before they affect the tracked state.

## Proposed fix

- Backend: add a `player_requests` table (`encounter_id`, `combatant_id`,
  `type`, `payload`, `status`, `requested_by`). Public endpoint
  `POST /api/live/:token/requests` (rate-limited, tied to the broadcast
  token) creates pending requests; DM endpoints
  `GET /api/encounters/:id/requests` and
  `POST .../requests/:reqId/{approve,reject}` resolve them, applying HP/turn
  changes on approve. Requires player identity/public tokens from
  [[live-broadcast-player-view]] and [[password-authentication]].
- Frontend: request controls in the live player view; a DM approval queue on
  the combat page with approve/reject buttons and live badge counts.

## Acceptance criteria

- [ ] Player can submit a damage/heal/action request from the live view
- [ ] DM sees a queue of pending requests with source and details
- [ ] Approving applies the change to encounter state; rejecting discards it
- [ ] Requests never mutate state until the DM approves

## Related

[[live-broadcast-player-view]], [[campaign-sharing]], [[combatant-hp-ac-tracking]], [[password-authentication]]
