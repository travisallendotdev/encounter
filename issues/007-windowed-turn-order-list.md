# Problem: monster list gets hard to read on really long initiative lists

## Summary

On the combat page, the full turn order list renders unwindowed. With a
long initiative list (many monsters/PCs), the list becomes hard to scan
and the current turn can end up far from view.

## Current behavior

- `web/src/features/combat/CombatPage.tsx` renders every entry in
  `turnOrder` via a single `.map()` inside a plain scrolling container
  (the block around the turn-order rendering, ~lines 140-176).
- No virtualization, pagination, or "focus around current turn" logic
  exists — list length is unbounded and the DM must scroll to find the
  active turn on long lists.

## Proposed fix

- Default to showing a window centered on the current turn: 3 entries
  before, the active entry, and 3 entries after.
- Add prev/next scroll controls to move the window up/down through the
  full list.
- Fall back to showing the full list as-is when it's short enough to fit
  without scrolling (e.g. ≤ 7 entries), so short encounters are unaffected.

## Acceptance criteria

- [ ] Long turn-order lists show a windowed view (3 before / current / 3
      after) by default.
- [ ] DM can scroll the window forward/backward via buttons to see
      earlier/later entries.
- [ ] Short lists render exactly as they do today (no unnecessary
      windowing chrome).
- [ ] The active turn is always visible without manual scrolling when the
      window resets on turn advance.
