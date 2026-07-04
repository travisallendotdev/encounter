# Main icon design improvement

## Summary

The app doesn't have a custom logo/icon — it currently reuses the generic
`lucide-react` `Dices` icon as its brand mark, and has no favicon.

## Current behavior

- `web/src/components/BrandMark.tsx` (used in `TopBar`) and
  `web/src/features/auth/LoginPage.tsx` (~lines 33-35) both render the
  stock `lucide-react` `Dices` icon as the app's "logo" — no custom
  SVG/wordmark asset exists.
- No `web/public/` directory exists, and `web/index.html` has no favicon
  `<link>` — browsers fall back to a default icon.
- `design/themes/{candlelight,arcane-slate}/` (referenced in CLAUDE.md)
  contain theme CSS only; no logo/icon asset lives there either.

## Proposed fix

- Design a custom mark for Dice Fight (distinct from the generic dice
  icon) that works across both themes (`candlelight`, `arcane-slate`).
- Add it as an SVG asset and swap it in for the `Dices` icon in
  `BrandMark.tsx` and `LoginPage.tsx`.
- Generate a favicon from the new mark and wire it into `web/index.html`.

## Acceptance criteria

- [ ] A custom icon/mark replaces the generic dice icon in the top bar
      and login page.
- [ ] The mark reads clearly in both themes.
- [ ] A favicon is present in the browser tab.
