# Feature: Action & Spell Rolling from Stat Blocks

## Summary

Roll a monster's or character's actions and spells directly from their stat
block — attack rolls and damage rolls — and apply the results to the
selected target(s) during combat, instead of the DM rolling physical dice
and hand-entering totals. Depends on stat blocks existing first.

## Current behavior (Dice Fight)

- `monsters` (`src/db/migrations/001-initial-schema.sql`) store only `name`
  and `initiative_modifier` — no actions, attacks, or spells.
- `pcs` store `name` and `player_name` only, with no combat stats.
- The combat UI (`web/src/features/combat/CombatPage.tsx`) has no dice
  roller and nothing to roll from; it only tracks turn order and round.

## Reference

Shieldmaiden shows each combatant's actions/attacks with clickable dice —
clicking rolls the attack and damage and can apply the result to the
current target.

## Proposed fix

- Prerequisite: stat blocks with actions/attacks/spells (see
  [[monster-stat-blocks]] and [[pc-combat-stats]]), including dice
  expressions (e.g. `1d20+5` to hit, `2d6+3` slashing).
- Backend: expose the actions/spells as part of the combatant/stat-block
  payload from the encounter/combat endpoints in
  `src/routes/encounters.ts`; optionally add a roll-resolution helper, but
  rolling can be done client-side.
- Frontend: in `web/src/features/combat/`, render each combatant's actions
  and spells with a roll button. Rolling produces an attack total and a
  damage total; wire the damage into the targeting + HP flow so it applies
  to the selected target(s). Add a small dice utility and Zod schemas in
  `web/src/api/schemas.ts` for the stat-block action shape.

## Acceptance criteria

- [ ] Actions and spells appear on a combatant with their dice expressions.
- [ ] Clicking an attack rolls to-hit and damage and shows both results.
- [ ] Rolled damage can be applied to the current target(s).
- [ ] Rolls are visible/recorded (feeds the combat log).
- [ ] Works for both monster and PC stat blocks.

## Related

[[monster-stat-blocks]], [[pc-combat-stats]], [[targeting-system]],
[[combatant-hp-ac-tracking]], [[combat-log]]
