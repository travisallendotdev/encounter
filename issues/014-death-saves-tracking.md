# Feature: Death Saves Tracking

## Summary

When a PC drops to 0 HP they roll death saving throws — three successes stabilizes, three failures kills. A DM needs to track these per downed combatant during combat. Dice Fight has no HP, no downed state, and no death-save tracking at all.

## Current behavior (Dice Fight)

- No HP means no downed state; `turn_order` and the combat reducer (`web/src/features/combat/combatReducer.ts`) have no death-save fields.
- Nothing in `src/db/migrations/001-initial-schema.sql` records success/failure counts or a stabilized/dead status.

## Reference

When a combatant hits 0 HP, three success and three failure pips appear on their row; the DM clicks to record each save, the app auto-stabilizes at three successes and marks dead at three failures.

## Proposed fix

- Backend: store per-combatant `death_save_successes`, `death_save_failures`, and `status` (`active|down|stable|dead`) in the combatant state table introduced for HP tracking. Add an endpoint under `src/routes/encounters.ts` to record a success/failure and to reset on heal above 0.
- Frontend: in `web/src/features/combat/CombatPage.tsx`, when a combatant is at 0 HP show three success + three failure toggles; auto-set stable at 3 successes, dead at 3 failures. Reset saves when the combatant is healed above 0. Extend `web/src/api/schemas.ts`/`endpoints.ts` and thread through the reducer.

## Acceptance criteria

- [ ] A combatant reduced to 0 HP shows death-save success/failure trackers.
- [ ] DM can record individual successes and failures.
- [ ] Three successes auto-marks stable; three failures auto-marks dead.
- [ ] Healing above 0 clears the death-save state.

## Related

[[combatant-hp-ac-tracking]], [[conditions-status-effects]]
