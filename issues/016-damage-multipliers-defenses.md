# Feature: Damage Multipliers & Defenses

## Summary

Creatures in 5e have resistances (half damage), vulnerabilities (double), and immunities (none) to specific damage types. When a DM applies damage, the tracker should automatically adjust the amount based on the target's defenses. Dice Fight has no damage application at all, let alone type-aware modifiers.

## Current behavior (Dice Fight)

- No damage application exists (see HP tracking), and no resistance/vulnerability/immunity data is stored in `src/db/migrations/001-initial-schema.sql`.
- Monsters carry no stat block, so damage-type defenses have nowhere to live.

## Reference

Each combatant lists resistances/vulnerabilities/immunities by damage type; when the DM applies typed damage, the app halves, doubles, or zeroes it automatically and shows the adjusted result.

## Proposed fix

- Backend: store `resistances`, `vulnerabilities`, `immunities` (arrays of damage types) on monsters/combatant state — a JSON column on the monster stat block plus overrides in the combatant state table. When the damage-apply endpoint (`src/routes/encounters.ts`, from HP tracking) receives a damage type, compute the modifier server-side before subtracting HP.
- Frontend: extend the damage input in `web/src/features/combat/CombatPage.tsx` to include a damage-type selector; show the applied (post-modifier) amount. Let the DM edit a combatant's defenses. Extend `web/src/api/schemas.ts`/`endpoints.ts`.

## Acceptance criteria

- [ ] A combatant can carry resistances, vulnerabilities, and immunities by damage type.
- [ ] Applying typed damage halves (resist), doubles (vulnerable), or zeroes (immune) it automatically.
- [ ] The DM sees the adjusted amount actually applied.
- [ ] Defenses default to none and seed from the monster stat block.

## Related

[[combatant-hp-ac-tracking]], [[monster-stat-blocks]], [[action-spell-rolling]]
