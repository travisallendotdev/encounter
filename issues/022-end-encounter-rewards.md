# Feature: End Encounter with Rewards Summary

## Summary

Give the DM a way to finish a live encounter — transitioning it from
`active` to a new `completed` status — and show an encounter-complete
summary screen with XP and loot rewards. Currently combat can be started
but never formally ended.

## Current behavior (Dice Fight)

- `encounters.status` only supports `draft | active`
  (`src/db/migrations/001-initial-schema.sql`); there is no `completed`
  state.
- `POST /api/encounters/:id/start` flips an encounter to `active` and
  returns turn order, but no endpoint ends combat
  (`src/routes/encounters.ts`).
- The combat page (`web/src/features/combat/CombatPage.tsx`) has no
  "end encounter" action, so an encounter stays `active` indefinitely and
  there is no completion summary.

## Reference

Shieldmaiden lets you end an encounter and presents a wrap-up with XP and
loot awarded to the party.

## Proposed fix

- Backend: extend the `encounters.status` check constraint to include
  `completed` (migration). Add `POST /api/encounters/:id/end` in
  `src/routes/encounters.ts` that sets status to `completed` (and records a
  completion timestamp). Return an encounter summary payload (participants,
  XP, loot).
- Frontend: add an "End encounter" action in `CombatPage.tsx` that calls the
  new endpoint (via `web/src/api/endpoints.ts`), clears client combat state
  in `combatStorage.ts`, and routes to a completion summary showing XP/loot.
  Update `web/src/api/schemas.ts` for the `completed` status.
- Encounter lists should visually distinguish `completed` encounters.

## Acceptance criteria

- [ ] `encounters.status` accepts `completed`.
- [ ] The DM can end an active encounter, moving it to `completed`.
- [ ] Ending combat clears client-side combat state.
- [ ] A completion summary shows XP and loot rewards.
- [ ] Completed encounters are distinguishable in the encounter list and
      cannot be advanced further.

## Related

[[encounter-loot-rewards]], [[damage-meters]], [[combat-log]],
[[edit-combatants-mid-combat]]
