# Feature: PC Combat Stats

## Summary

Player characters in Dice Fight are only a name and a player name. To run combat the DM needs each PC's max HP, AC, and level/class so the turn list can show health and the encounter can be balanced. Without these, HP tracking and difficulty math have no PC-side data to work from.

## Current behavior (Dice Fight)

- `pcs` in `src/db/migrations/001-initial-schema.sql` has only `name`, `player_name`, `campaign_id` — NO stats/HP/AC/class.
- `src/routes/campaigns.ts` create/list PC endpoints handle just those fields.
- PC management UI under `web/src/features/campaigns/` collects name + player name only.

## Reference

Each PC record carries max HP, AC, level, and class (and often passive perception / initiative bonus), so the DM can drop them straight into an encounter with health bars ready.

## Proposed fix

- Backend: add `max_hp`, `armor_class`, `level`, `class` (and optionally `initiative_modifier`, `passive_perception`) to `pcs`; make them nullable so existing rows stay valid. Update PC create/update endpoints in `src/routes/campaigns.ts` and their Zod validation.
- Frontend: extend the PC schema in `web/src/api/schemas.ts` and the PC form/list in `web/src/features/campaigns/`. Surface HP/AC to the combat views so PCs get health bars like monsters.

## Acceptance criteria

- [ ] A PC stores max HP, AC, level, and class.
- [ ] Campaign PC form lets the DM enter/edit these fields.
- [ ] Existing PCs without stats remain valid and editable.
- [ ] Combat/HP views read PC max HP and AC from these fields.

## Related

[[combatant-hp-ac-tracking]], [[encounter-difficulty-xp]], [[monster-stat-blocks]]
