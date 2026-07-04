# Feature: Targeting System

## Summary

During combat, let the DM select one or more target combatants for an
attack or effect so that damage and conditions are applied to the chosen
participants instead of being edited by hand on each combatant row.

## Current behavior (Dice Fight)

- The combat page renders the turn order from
  `web/src/features/combat/CombatPage.tsx`, driven entirely by the
  client-side reducer (`combatReducer.ts`) and `combatStorage.ts`.
- Turn order rows come from `turn_order` (`participant_id`, `type`, `name`,
  `initiative`, `position`) returned once by
  `POST /api/encounters/:id/start`.
- There is no concept of a "target"; the DM cannot select a combatant to
  receive damage/healing/conditions. Any change would have to be typed onto
  each row manually.

## Reference

Shieldmaiden lets you click a combatant (or several) to mark them as the
current target(s), then apply damage, healing, or conditions to that
selection in one action.

## Proposed fix

- Frontend: add target selection state to the combat feature — allow
  selecting one or more combatant rows in `CombatPage.tsx` (e.g. a
  `selectedTargetIds` set in `combatReducer.ts`, persisted alongside the
  rest of combat state in `combatStorage.ts`). Provide clear visual
  highlighting for selected targets and a way to clear the selection.
- Provide an "apply to targets" affordance that the HP/condition features
  hook into, so damage, healing, and condition changes route to the
  selected combatants.
- Backend: no new endpoint strictly required for target selection itself
  (selection is transient UI state), but the apply actions should reuse the
  combatant HP/condition endpoints from the related issues.

## Acceptance criteria

- [ ] The DM can select a single combatant as the current target.
- [ ] The DM can select multiple combatants at once (multi-target).
- [ ] Selected targets are visually distinct in the turn order list.
- [ ] Damage/healing/condition actions apply to the current target
      selection.
- [ ] Selection can be cleared, and clears when combat ends.

## Related

[[combatant-hp-ac-tracking]], [[conditions-status-effects]],
[[action-spell-rolling]], [[damage-multipliers-defenses]]
