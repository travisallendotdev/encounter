# Feature: Freeform Dice Roller

## Summary

Add a freeform dice roller UI that evaluates arbitrary dice expressions
(e.g. `2d6+3`, `1d20+5 advantage`, `4d8+2d6`) from anywhere in the app,
with a running history and support for saving frequently used rolls.

## Current behavior (Dice Fight)

There is no dice roller UI anywhere in the SPA. The only dice logic that
exists is an internal `rollD20()` helper in
`web/src/features/combat/dice.ts`, used solely by combat initiative code.
DMs cannot roll arbitrary expressions, cannot see roll history, and cannot
save presets. The backend exposes no dice endpoint.

## Reference

Shieldmaiden provides a persistent dice roller accessible throughout the
app, with expression parsing, roll history, and saved/favorite rolls.

## Proposed fix

- **Frontend:** Generalize `web/src/features/combat/dice.ts` into a shared
  `web/src/features/dice/` module with an expression parser/evaluator
  (dice count, sides, modifiers, advantage/disadvantage, multiple terms).
  Add a `DiceRoller` component surfaced globally (e.g. a top-bar button /
  popover in the app shell) so it is reachable from any route. Show
  per-die results, totals, and a scrollable history kept in state
  (persist recent rolls to localStorage). Allow naming and saving rolls to
  a favorites list.
- **Backend (optional):** Dice evaluation can stay purely client-side. If
  history/saved rolls should sync across devices, add a `saved_rolls`
  table and `GET/POST/DELETE /api/dice/saved` routes following the
  existing route conventions in `src/routes/`.

## Acceptance criteria

- [ ] A dice roller is reachable from every authenticated route.
- [ ] Arbitrary expressions parse and evaluate (multiple terms, modifiers,
      advantage/disadvantage).
- [ ] Individual die results and the total are displayed.
- [ ] Roll history persists across reloads (localStorage at minimum).
- [ ] DMs can save, name, and re-roll favorite expressions.
- [ ] Combat initiative reuses the shared dice module (no duplicated logic).

## Related

[[combat-log]], [[dm-settings-view]]
