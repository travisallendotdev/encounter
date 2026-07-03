# Dice Fight

D&D 5e initiative and combat encounter tracker — Hono JSON API + React SPA.

## Quickstart

```sh
pnpm install
pnpm --dir web install

# terminal 1 — API (port 3000)
pnpm dev

# terminal 2 — web app (port 5173, proxies /api → 3000)
pnpm dev:web
```

Open http://localhost:5173, enter a DM name, and roll for initiative.

## Tests

```sh
pnpm --dir web test   # unit/component tests (Vitest)
pnpm e2e:web          # end-to-end happy path (Playwright, fresh DB in .e2e-data/)
```
