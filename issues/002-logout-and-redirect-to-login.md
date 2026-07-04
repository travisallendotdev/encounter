# As a DM, I can log out of an active session, and redirect to login

## Summary

There is no way for a DM to deliberately log out. The only path back to
`/login` today is an automatic 401 (session invalidated server-side).

## Current behavior

- `web/src/features/auth/session.ts` exposes `getUsername` / `setUsername`
  / `clearUsername`, but `clearUsername` is only ever called from
  `web/src/api/client.ts` in response to a 401, which dispatches a
  `dicefight:unauthorized` event caught by
  `web/src/features/auth/RequireAuth.tsx` to redirect to `/login`.
- `web/src/components/TopBar.tsx` renders the current username as a
  static badge (~lines 51-77) — it has no click handler and no menu.
- There is no user-initiated way to clear the session.

## Proposed fix

- Make the username badge in `TopBar.tsx` interactive — wrap it in a
  `DropdownMenu` (the theme switcher in the same file already uses this
  pattern) with a "Log out" item.
- On click: call `clearUsername()` and navigate to `/login` (either
  directly via `useNavigate`, or by dispatching the existing
  `dicefight:unauthorized` event so the same redirect path is exercised).

## Acceptance criteria

- [ ] A logout control is visible and reachable from the top bar on every
      authenticated page.
- [ ] Clicking it clears the stored username and redirects to `/login`.
- [ ] After logout, navigating back (browser back button) to a protected
      route redirects to `/login` rather than showing stale data.
