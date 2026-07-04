# Feature: Reusable Reminders Library

## Summary

Give the DM a library of saved, reusable reminders (e.g., "regeneration 10
HP at start of turn", "concentration check") that can be attached to
combatants quickly instead of being retyped each encounter.

## Current behavior (Dice Fight)

There are no reminders of any kind. The schema
(`src/db/migrations/001-initial-schema.sql`) has no reminder table, and
`src/routes/encounters.ts` / the combat page track only turn order and
initiative — there is nothing to persist a note or trigger against a
combatant, let alone a reusable template.

## Reference

Shieldmaiden lets DMs save reminders and reuse them, attaching them to
creatures with triggers (start/end of turn, rounds).

## Proposed fix

- Backend: add a DM-scoped `reminders` table (title, description, trigger
  type, duration/rounds) as the reusable library, plus a join to attach a
  reminder to a `turn_order` entry (see per-combatant behavior in
  [[combat-reminders]]). CRUD at `/api/reminders` per existing conventions.
- Frontend: a reminders library feature under `web/src/features/` with
  create/edit and an "attach reminder" picker on combatants in the combat
  page.

## Acceptance criteria

- [ ] DM can create, edit, and delete reusable reminder templates
- [ ] Reminders are scoped to the owning DM and persist across encounters
- [ ] A saved reminder can be attached to a combatant from the library
- [ ] Reminder trigger (start/end of turn, rounds) is captured

## Related

[[combat-reminders]], [[conditions-status-effects]]
