# Feature: Custom Timed Effects

## Summary

Beyond the standard conditions, DMs constantly track ad-hoc, time-limited effects — "bless for 3 rounds", "concentration on hold person", "burning for 2 turns". Dice Fight has no way to attach a custom effect that automatically counts down as combat advances, so DMs must track durations on paper.

## Current behavior (Dice Fight)

- No effect/duration model exists anywhere in `src/db/migrations/001-initial-schema.sql`.
- Round/turn progression is client-side only in `web/src/features/combat/combatReducer.ts` and sessionStorage (`combatStorage.ts`); nothing decrements against it.

## Reference

The DM adds a named effect to a combatant with a duration in rounds (or turns); each time the round/turn advances the remaining duration ticks down, and the effect auto-expires at zero with a visible notice.

## Proposed fix

- Backend: add a `combatant_effects` table (`encounter_id`, `participant_id`, `type`, `label`, `description`, `duration_rounds`, `remaining`, `anchor` turn/round). Add CRUD endpoints under `src/routes/encounters.ts`. Because round/turn lives client-side, either persist combat progress server-side or decrement `remaining` client-side and PATCH on advance.
- Frontend: add an "add effect" affordance and effect chips (with remaining count) per row in `web/src/features/combat/CombatPage.tsx`. Have the reducer's advance-turn/advance-round actions decrement effect timers and flag expirations. Extend `web/src/api/schemas.ts`/`endpoints.ts`.

## Acceptance criteria

- [ ] DM can add a named custom effect with a round/turn duration to a combatant.
- [ ] Effect remaining duration decrements as combat advances and auto-expires at zero.
- [ ] Effects render on the combatant row and persist across reload.
- [ ] Expiry produces a visible notice to the DM.

## Related

[[conditions-status-effects]], [[combat-reminders]], [[persist-combat-session-across-devices]]
