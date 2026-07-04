# Feature: Conditions & Status Effects

## Summary

D&D 5e combat revolves around conditions — poisoned, prone, stunned, grappled, and so on. A DM needs to tag combatants with conditions and see them at a glance in the turn list so they remember the rules those conditions impose. Dice Fight tracks none of this today.

## Current behavior (Dice Fight)

- No condition data exists. `turn_order` (`src/db/migrations/001-initial-schema.sql`) has no status column, and there is no conditions table.
- `web/src/features/combat/CombatPage.tsx` shows only name/initiative; the reducer (`combatReducer.ts`) has no concept of per-combatant status.

## Reference

The DM clicks a combatant and toggles any of the 15 standard 5e conditions from a picker; active conditions appear as labeled icon badges on that combatant's row, with tooltips describing the rules effect.

## Proposed fix

- Backend: add a `combatant_conditions` table keyed by `(encounter_id, participant_id, type, condition)`. Seed a static list of the 5e conditions server-side. Add endpoints under `src/routes/encounters.ts` to add/remove a condition on a combatant (e.g. `POST`/`DELETE /api/encounters/:id/combatants/:participantId/conditions`).
- Frontend: add a conditions picker component in `web/src/features/combat/` and render condition badges on each turn-list row in `CombatPage.tsx`. Extend `web/src/api/schemas.ts`/`endpoints.ts` and wire optimistic updates through the combat reducer/sessionStorage.

## Acceptance criteria

- [ ] DM can apply and remove any of the 15 standard 5e conditions on a combatant.
- [ ] Active conditions render as badges on the combatant's row with a rules tooltip.
- [ ] Conditions persist for the encounter across reload.

## Related

[[custom-timed-effects]], [[combat-reminders]], [[combatant-hp-ac-tracking]], [[live-broadcast-player-view]]
