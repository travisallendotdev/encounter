# Feature: Damage Meters

## Summary

Track per-combatant damage-dealt and damage-taken statistics for an
encounter, and aggregate them across a campaign, so the DM (and players) can
see who did what — a lightweight "damage meter" view.

## Current behavior (Dice Fight)

- No damage is tracked at all. Combat state (`combatReducer.ts` /
  `combatStorage.ts`) records only round and turn index; `turn_order` rows
  carry no HP or damage totals (`src/db/migrations/001-initial-schema.sql`).
- There is no aggregation of combat outcomes at the encounter or campaign
  level.

## Reference

Shieldmaiden surfaces damage/healing statistics per combatant for the
encounter, giving an at-a-glance meter of contributions.

## Proposed fix

- Prerequisite: damage/healing must be recorded as events (see
  [[combat-log]] and [[combatant-hp-ac-tracking]]). Damage meters are an
  aggregation over those events.
- Backend: accumulate `damage_dealt` / `damage_taken` (and optionally
  `healing_done`) per combatant per encounter, derived from combat-log
  events, in `src/routes/encounters.ts`. Expose an encounter stats endpoint,
  and a campaign-level rollup (sum across the campaign's encounters) under
  `src/routes/campaigns.ts`.
- Frontend: add a damage-meter panel to the combat/encounter view and a
  campaign-level summary, using TanStack Query endpoints in
  `web/src/api/endpoints.ts` with Zod schemas in `web/src/api/schemas.ts`.

## Acceptance criteria

- [ ] Damage dealt and damage taken are tracked per combatant per encounter.
- [ ] An encounter view shows the per-combatant meter.
- [ ] Campaign-level totals aggregate across the campaign's encounters.
- [ ] Values are derived from recorded combat events (consistent with the
      log).

## Related

[[combat-log]], [[combatant-hp-ac-tracking]], [[action-spell-rolling]],
[[end-encounter-rewards]]
