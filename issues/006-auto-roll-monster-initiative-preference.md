# Feature: auto-roll monster initiative on the pre-combat screen

## Summary

Add a DM preference (in the new settings view, see
[[dm-settings-view]]) to control whether monster initiative on the
pre-combat setup screen is fully automatic or manually editable.

## Current behavior

`web/src/features/encounters/InitiativePage.tsx` already auto-rolls
monster initiative by default:

- On load (~lines 19-28), each monster's initiative is seeded as
  `rollD20() + monster.initiativeModifier`.
- A manual "Roll for monsters" reroll button exists (~lines 112-119,
  `rerollMonsters` ~lines 33-40).
- Each rolled value is still individually editable (~lines 140-146)
  before starting combat.
- On `POST .../start`, the client submits the resulting `initiatives` map
  plus a `monsterInitiatives: 'manual'` flag; the server computes turn
  order from whatever values it receives — it does not roll anything
  itself.

So automatic rolling already happens; there is no way to *require* it
(i.e. no way to hide/disable the manual override and reroll UI for DMs
who always want a clean auto-rolled order with no fiddling).

## Proposed fix

- Add an `autoRollMonsterInitiative` boolean preference (default: on,
  matching current behavior) to the preferences module from
  [[dm-settings-view]].
- When enabled, keep current behavior (auto-roll + editable + reroll
  button).
- When disabled, hide the manual edit/reroll controls on
  `InitiativePage.tsx` for monster rows and submit the initial rolled
  values as-is to `start`.

## Acceptance criteria

- [ ] Setting is visible and toggleable in `/settings`.
- [ ] With the setting on (default), current auto-roll + editable
      behavior is unchanged.
- [ ] With the setting off, monster initiative rows on the setup screen
      show rolled values without edit/reroll controls.
