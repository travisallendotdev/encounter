# Feature: Combatant HP & AC Tracking

## Summary

During combat a DM needs to see and change each combatant's current hit points, temporary hit points, and armor class at a glance. Dice Fight has no notion of HP or AC anywhere, so the combat page is just a turn list with no way to record damage, healing, or who is bloodied/down. This is the single most-requested core combat feature.

## Current behavior (Dice Fight)

- No HP/AC columns exist in the schema. `turn_order` (`src/db/migrations/001-initial-schema.sql`) only stores `participant_id`, `type`, `name`, `initiative`, `position`. `monsters` and `pcs` carry no combat stats either.
- `web/src/features/combat/CombatPage.tsx` renders the turn list from client-side reducer state (`combatReducer.ts`) with no health data.
- There is no endpoint to mutate a combatant's state mid-combat; `POST /api/encounters/:id/start` returns turn order once and nothing else.

## Reference

Each combatant row shows a colored HP bar with current/max/temp HP and AC; the DM types a number and clicks damage or heal to apply it instantly, and the bar reflects bloodied/downed states.

## Proposed fix

- Backend: add `max_hp`, `current_hp`, `temp_hp`, `armor_class` to combatant state. Since combat state is otherwise client-side, add a persisted `combatant_state` table keyed by `(encounter_id, participant_id, type)` OR extend `turn_order`. Add `PATCH /api/encounters/:id/combatants/:participantId` (routes in `src/routes/encounters.ts`) to apply damage/heal/set-hp deltas. Max HP / AC seed from the stat sources (see related issues).
- Frontend: extend the Zod schemas in `web/src/api/schemas.ts` and endpoints in `web/src/api/endpoints.ts`; add a `useApplyDamage`/`useHeal` mutation. In `web/src/features/combat/` add an `HpBar` component and quick damage/heal input per row in `CombatPage.tsx`. Persist optimistic state through the existing combat reducer/sessionStorage.

## Acceptance criteria

- [ ] Each combatant row shows current/max HP, temp HP, and AC.
- [ ] DM can apply a damage or heal amount that updates current HP (temp HP absorbed first).
- [ ] HP at or below 0 visibly marks the combatant as down; bloodied (<=50%) is visually distinct.
- [ ] Changes persist across reload for the encounter.
- [ ] HP/AC values seed from monster stat blocks and PC combat stats.

## Related

[[monster-stat-blocks]], [[pc-combat-stats]], [[death-saves-tracking]], [[damage-multipliers-defenses]], [[persist-combat-session-across-devices]]
