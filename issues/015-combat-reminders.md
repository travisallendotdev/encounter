# Feature: Combat Reminders

## Summary

Many creatures and characters have "at the start/end of your turn" effects — regeneration, ongoing damage saves, recharge abilities. A DM needs the tracker to pop a reminder for a combatant when its turn comes up so these are never forgotten. Dice Fight surfaces nothing on turn change.

## Current behavior (Dice Fight)

- Turn advancement is handled entirely in `web/src/features/combat/combatReducer.ts`; the active combatant changes but no per-combatant note or prompt is shown.
- There is no reminder/note field on any entity in `src/db/migrations/001-initial-schema.sql`.

## Reference

A DM attaches a reminder to a combatant (e.g. "Regeneration: heal 10 unless fire/acid"); when that combatant's turn starts, the reminder is displayed prominently until dismissed.

## Proposed fix

- Backend: add a `combatant_reminders` table (`encounter_id`, `participant_id`, `type`, `text`, `trigger` start|end of turn). CRUD endpoints under `src/routes/encounters.ts`. May reuse the combatant state table pattern.
- Frontend: add a reminder editor per combatant in `web/src/features/combat/`. In `CombatPage.tsx`, when the reducer advances to a combatant with reminders, show a dismissible banner/toast listing them. Extend `web/src/api/schemas.ts`/`endpoints.ts`.

## Acceptance criteria

- [ ] DM can attach one or more reminders to a combatant, keyed to start or end of its turn.
- [ ] The reminder is displayed when that combatant's turn triggers.
- [ ] Reminders persist for the encounter across reload.
- [ ] Reminders can be edited and removed.

## Related

[[custom-timed-effects]], [[conditions-status-effects]], [[action-spell-rolling]]
