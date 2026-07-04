# Feature: Encounter Loot & Rewards

## Summary

Let the DM attach loot and reward items (currency, items, XP) to an
encounter during setup, then award them to the party when the encounter is
completed. Turns encounters into a full prep-and-payoff loop.

## Current behavior (Dice Fight)

Encounters (`encounters` in `src/db/migrations/001-initial-schema.sql`) have
`name`, `campaign_id`, `encounter_number`, and `status` (draft|active) only.
There is no loot/reward concept anywhere in the schema, routes
(`src/routes/encounters.ts`), or UI (`EncounterSetupPage.tsx`). Encounters
also cannot be marked completed — status only goes draft -> active.

## Reference

Shieldmaiden lets a DM define loot (coins, items, XP) per encounter and hand
it out to the party when the fight ends.

## Proposed fix

- **Backend:** add an `encounter_rewards` table (id, encounter_id, type
  currency|item|xp, label, amount/quantity, notes). Add
  `POST/GET/DELETE /api/encounters/:id/rewards` in `src/routes/encounters.ts`,
  editable while draft. Awarding on completion is handled by
  [[end-encounter-rewards]].
- **Frontend:** add a RewardsPanel to `EncounterSetupPage.tsx`
  (`web/src/features/encounters`) to add/list/remove reward line items, with
  a query in the encounters feature.

## Acceptance criteria

- [ ] A DM can add currency, item, and XP rewards to a draft encounter.
- [ ] Rewards are listed on the encounter and can be removed while draft.
- [ ] Rewards endpoint enforces campaign ownership via `X-DM-Username`.
- [ ] `EncounterSetupPage` shows a rewards panel.
- [ ] Reward award-on-completion is deferred to [[end-encounter-rewards]].

## Related

[[end-encounter-rewards]], [[encounter-difficulty-xp]]
