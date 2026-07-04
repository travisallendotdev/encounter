# Feature: Monster Stat Blocks

## Summary

Monsters in Dice Fight are just a name plus an initiative modifier. A DM running combat needs the full stat block — HP, AC, ability scores, speed, and actions — to actually resolve a fight without a separate rulebook. This is the data-model prerequisite for HP tracking, action rolling, and difficulty math.

## Current behavior (Dice Fight)

- `monsters` in `src/db/migrations/001-initial-schema.sql` has only `name`, `encounter_instance_name`, `initiative_modifier`, `encounter_id`. There is no HP, AC, ability scores, or actions.
- `src/routes/encounters.ts` creates/lists monsters with just those fields.
- The setup UI (`web/src/features/encounters/`) collects name + init modifier only.

## Reference

Monsters carry a complete 5e stat block (HP, AC, STR–CHA, speed, saves, senses, actions/attacks with damage dice), typically populated from a bestiary entry and editable per instance.

## Proposed fix

- Backend: extend `monsters` with `max_hp`, `armor_class`, `str/dex/con/int/wis/cha`, `speed`, and a `stat_block_json` column (or a related `monster_actions` table) for actions/attacks. Update create/update endpoints in `src/routes/encounters.ts` to accept and validate these fields. Consider seeding from a compendium (see related).
- Frontend: extend `web/src/api/schemas.ts` monster schema and the monster add/edit form under `web/src/features/encounters/`. Show a collapsible stat block on the combat/setup views. Keep `initiative_modifier` derived from DEX where possible.

## Acceptance criteria

- [ ] A monster stores HP, AC, six ability scores, speed, and a list of actions.
- [ ] Setup UI lets the DM enter/edit these fields when adding a monster.
- [ ] Existing monsters (name + init only) remain valid via nullable/defaulted columns.
- [ ] Combat and HP-tracking views read max HP and AC from the stat block.

## Related

[[combatant-hp-ac-tracking]], [[action-spell-rolling]], [[monster-bestiary-compendium]], [[encounter-difficulty-xp]]
