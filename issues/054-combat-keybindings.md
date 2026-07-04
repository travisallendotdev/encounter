# Feature: Combat Keyboard Shortcuts

## Summary

Add keyboard shortcuts for running combat (advance turn, previous turn,
apply damage/heal to the active combatant, toggle conditions, etc.) so a DM
can drive an encounter without reaching for the mouse. Bindings should be
configurable.

## Current behavior (Dice Fight)

The combat page has no keyboard shortcuts. Combat state is client-side —
the reducer in `web/src/features/combat/combatReducer.ts` tracks round/turn
and persists to sessionStorage — but all interactions (next turn,
damage/heal) are mouse-only via on-screen controls. There is no keydown
handling and no place to view or remap shortcuts.

## Reference

Shieldmaiden supports keyboard shortcuts for fast combat control.

## Proposed fix

- **Frontend:** Add a keyboard-shortcut layer to the combat page that
  dispatches the existing `combatReducer` actions (e.g. next/previous turn,
  focus damage/heal on the active combatant, apply, toggle a condition).
  Register listeners scoped to the combat view and ignore keystrokes while
  typing in inputs. Show a shortcuts help overlay (e.g. `?`).
- Store user-customized bindings and expose remapping through the DM
  settings surface described in [[dm-settings-view]] (persist to
  localStorage, or to the account if/when settings sync server-side).
- Provide sensible defaults so shortcuts work out of the box.

## Acceptance criteria

- [ ] Core combat actions (next/prev turn, damage/heal, condition toggle)
      have default keyboard shortcuts on the combat page.
- [ ] Shortcuts are ignored while the user is typing in a text field.
- [ ] A help overlay lists the active shortcuts.
- [ ] Bindings are configurable and persisted per DM.
- [ ] Shortcuts dispatch through the existing `combatReducer` (no separate
      combat state).

## Related

[[dm-settings-view]], [[combat-log]], [[dice-roller]]
