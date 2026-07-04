# Feature: Onboarding Tutorial for New DMs

## Summary

Add an interactive, guided onboarding flow that walks a first-time DM
through the core loop — create a campaign, build an encounter, add
combatants, and start combat — so the app is approachable without external
docs.

## Current behavior (Dice Fight)

There is no onboarding of any kind. After the username-only login
(`web/src/features/auth/LoginPage.tsx`), a new DM lands in an empty app
with no guidance, tooltips, sample data, or walkthrough. Nothing
distinguishes a first-time DM from a returning one, and there is no
per-DM flag tracking tutorial/onboarding completion.

## Reference

Shieldmaiden guides new users through setting up their first campaign and
encounter.

## Proposed fix

- **Frontend:** Add a guided tour / coach-mark flow (e.g. a
  `features/onboarding/` module) that triggers on first login and steps a
  DM through: create campaign -> create encounter -> add combatants ->
  start combat. Highlight the relevant UI at each step with a skip option.
  Offer to seed a sample campaign/encounter the DM can safely delete. Track
  completion so it does not re-trigger (localStorage, or a persisted flag —
  see below).
- **Backend (optional):** Add an `onboarded_at` (or similar) column to
  `dms` via a migration plus a small route to mark completion, so
  onboarding state follows the account across devices rather than living
  only in localStorage.

## Acceptance criteria

- [ ] First-time DMs see a guided walkthrough after their first login.
- [ ] The tour covers campaign -> encounter -> combatants -> start combat.
- [ ] The tour can be skipped and can be re-launched on demand.
- [ ] Completion is remembered so it does not repeat every login.
- [ ] Optionally, sample content can be seeded and easily removed.

## Related

[[dm-settings-view]], [[combat-keybindings]]
