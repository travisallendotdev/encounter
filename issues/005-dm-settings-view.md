# Feature: As a DM I can store my preferences within a settings view

## Summary

There is currently no settings/preferences surface in the app. Add a
`/settings` view where a DM can configure app-wide preferences, persisted
per DM. The first preference to live here is auto-rolling monster
initiative (see [[auto-roll-monster-initiative-preference]]).

## Current behavior

- No settings route exists. `web/src/routes/router.tsx` only defines:
  `/login`, `/campaigns`, `/campaigns/:id`,
  `/campaigns/:id/encounters/:eid/setup`, `/encounters/:eid/initiative`,
  `/encounters/:eid/combat`.
- No `web/src/features/settings/` directory exists.
- The only existing "preference"-like persistence is `session.ts`
  (username, localStorage) and `ThemeProvider` (theme choice, its own
  localStorage key) — there's no shared preferences module.

## Proposed fix

- Add a `/settings` route and a `web/src/features/settings/` feature
  directory (component + queries, matching the existing feature layout
  convention).
- Add a `preferences.ts` storage module, localStorage-backed and keyed
  per DM username (mirrors `session.ts`'s pattern), exposing typed
  get/set for individual preferences.
- Add a nav entry to `TopBar.tsx` linking to `/settings`.
- Design the preferences module so additional settings can be added
  without restructuring (a simple key/value record with Zod validation
  per key is sufficient for v1 — no need to over-engineer for unknown
  future settings).

## Acceptance criteria

- [ ] `/settings` is reachable from the top bar when logged in.
- [ ] Preferences persist across reloads for the same DM username.
- [ ] The auto-roll-initiative preference (see linked ticket) is the
      first setting exposed here.
