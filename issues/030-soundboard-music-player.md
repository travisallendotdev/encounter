# Feature: Soundboard & Ambient Music Player

## Summary

Provide an in-app soundboard for one-shot sound effects and an ambient
music/loop player to set the mood while running a session. Lower priority /
nice-to-have that improves the at-the-table experience.

## Current behavior (Dice Fight)

There is no audio functionality anywhere. The schema
(`src/db/migrations/001-initial-schema.sql`), routes
(`src/routes/{auth,campaigns,encounters}.ts`), and the React SPA
(`web/src/features/{campaigns,encounters}`) contain no soundboard, player, or
audio assets.

## Reference

Shieldmaiden includes a soundboard and ambient music player for running
live sessions.

## Proposed fix

- **Backend:** add a `sound_assets` table (id, dm_id or campaign_id, label,
  url, kind sfx|ambient) and CRUD routes so a DM can register audio sources
  (external URLs to start), owner-checked via `src/middleware/auth.ts`.
- **Frontend:** add a soundboard feature (`web/src/features/soundboard`) with
  a global player bar — clip buttons for one-shots and a looping ambient
  track with volume control, accessible during combat. Playback is
  client-side via the HTML audio API.

## Acceptance criteria

- [ ] A DM can register labeled sound effects and ambient tracks.
- [ ] Clicking a soundboard button plays a one-shot effect.
- [ ] An ambient track can loop with volume control and stop/start.
- [ ] The player is reachable while running an encounter.
- [ ] Sound assets are scoped to the owning DM.

## Related

[[dm-settings-view]], [[campaign-notes-resources]]
