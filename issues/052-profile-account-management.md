# Feature: Profile & Account Management

## Summary

Add a profile page where a DM can view their account, change their
username, and permanently delete their account along with all of their
data.

## Current behavior (Dice Fight)

There is no profile or account page. The SPA (`web/src`) has a login page
(`web/src/features/auth/LoginPage.tsx`) and stores only a username in
localStorage (`web/src/features/auth/session.ts`), but offers no way to
change the username or delete the account. The `dms` table
(`src/db/migrations/001-initial-schema.sql`) is `id` + `username`, and
there is no update or delete route for DM accounts in `src/routes/auth.ts`.

## Reference

Shieldmaiden provides an account/profile area for editing account details
and deleting the account.

## Proposed fix

- **Backend:** Add `PATCH /api/account` (rename, with uniqueness check on
  `username`) and `DELETE /api/account` (cascade-delete the DM's campaigns
  and encounters within a transaction). Scope both to the authenticated DM
  via `src/middleware/auth.ts`. Coordinate with
  [[password-authentication]] so sensitive changes can require credential
  re-entry.
- **Frontend:** Add a Profile page in `web/src` (e.g. under a
  `features/profile/` module) reachable from the top bar / settings, with a
  username edit form (react-hook-form + Zod) and a destructive
  delete-account flow behind a confirmation dialog. Wire endpoints through
  `web/src/api/`. On account deletion, clear the session and redirect to
  `/login`.

## Acceptance criteria

- [ ] A DM can view their profile.
- [ ] A DM can change their username (rejected if already taken).
- [ ] A DM can delete their account behind an explicit confirmation.
- [ ] Deleting the account cascades to all owned campaigns/encounters.
- [ ] After deletion the session is cleared and the user is redirected to
      login.

## Related

[[password-authentication]], [[dm-settings-view]]
