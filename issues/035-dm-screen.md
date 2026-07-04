# Feature: DM screen — quick rules/reference panel during play

## Summary

Add a "DM screen": a quick-reference panel available during combat that
surfaces the rules and reference material a DM reaches for most (common
conditions, core action/combat rules, common DCs, cover, etc.) without
leaving the encounter view.

## Current behavior (Dice Fight)

- No reference content exists in the app, and no reference/DM-screen
  surface exists in the combat UI.
- The combat page (`web/src/features/combat/`) tracks only turn order
  and combat state (`combatReducer.ts`); there is no side panel or
  overlay for rules lookup.
- No DM-screen route or component exists in `web/src/routes/router.tsx`.

## Reference

Shieldmaiden offers an at-a-glance DM reference surface for rules while
running an encounter.

## Proposed fix

- **Backend:** reuse the compendium reference endpoints
  (conditions/rules, and optionally quick DC/cover tables) rather than
  adding new data — see [[conditions-rules-reference]]. Add a small
  curated `srd_rules` "quick reference" grouping if one doesn't already
  exist.
- **Frontend:** add a collapsible DM-screen panel/drawer accessible from
  the combat view (`web/src/features/combat/`), populated from the
  reference queries. Group content into tabs (Conditions, Actions,
  Environment/Cover, DCs). Keep it a client-side overlay so it doesn't
  disturb combat state in `combatReducer.ts`.

## Acceptance criteria

- [ ] A DM-screen panel is openable from the combat view.
- [ ] It shows common conditions and core combat/action rules pulled
      from the reference endpoints.
- [ ] Opening/closing it does not affect round/turn state.
- [ ] Content is grouped/tabbed for quick scanning during play.

## Related

[[conditions-rules-reference]], [[conditions-status-effects]],
[[compendium-search-filter]]
