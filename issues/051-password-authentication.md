# Feature: Real Authentication (Password / OAuth)

## Summary

Replace the current trust-the-username-header model with real
authentication: password (or OAuth) sign-up, sign-in, session/token
issuance, and password reset. Today the app has **no authentication at
all** — anyone can act as any DM.

## Current behavior (Dice Fight)

`POST /api/auth/login` (`src/routes/auth.ts`) is username-only:
login-or-create with **no password**. The `dms` table is just `id` +
`username` (`src/db/migrations/001-initial-schema.sql`). Every request is
authorized purely by the `X-DM-Username` header, which
`src/middleware/auth.ts` blindly trusts. The SPA stores the raw username in
localStorage (`web/src/features/auth/session.ts`) and sends it on each
request (`web/src/api/client.ts`).

**Security gap:** because the server trusts `X-DM-Username` with no secret,
anyone can impersonate any DM by simply setting that header to another
DM's username. There is no credential, session, or token — this is not
authentication, only identification.

## Reference

Shieldmaiden uses real account authentication (email/password with reset,
plus OAuth providers) and server-issued sessions/tokens.

## Proposed fix

- **Backend:** Add credential columns to `dms` (hashed password via a
  strong KDF such as argon2/bcrypt, email for reset) in a new migration.
  Change `POST /api/auth/login` to verify a password and add
  `POST /api/auth/register`, `POST /api/auth/logout`,
  `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password`.
  Issue a signed session token (HTTP-only cookie or bearer) and rewrite
  `src/middleware/auth.ts` to validate that token instead of trusting a
  plaintext username header. Optionally add OAuth provider flows.
- **Frontend:** Update `web/src/features/auth/LoginPage.tsx` with password
  fields, add register + forgot/reset password screens, and change
  `session.ts` / `client.ts` to store and send the token rather than the
  raw username. On 401, clear session and redirect to `/login` (existing
  behavior).

## Acceptance criteria

- [ ] Sign-up requires and securely hashes a password (never stored plain).
- [ ] Sign-in verifies credentials and issues a server-side session/token.
- [ ] Requests are authorized by the token, not a trusted username header.
- [ ] `X-DM-Username` impersonation no longer grants access.
- [ ] Password reset flow works end to end.
- [ ] (Optional) At least one OAuth provider is supported.

## Related

[[profile-account-management]], [[dm-settings-view]]
