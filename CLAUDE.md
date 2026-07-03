# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D&D 5th Edition initiative and combat encounter tracker. Built with Hono (web framework) on Node.js with TypeScript.

## Commands

- `pnpm dev` — start dev server with hot reload (tsx watch, port 3000)
- `pnpm build` — typecheck and compile (`tsc` to `dist/`)
- `pnpm start` — run compiled output (`node dist/index.js`)
- `pnpm dev:web` — start the web frontend dev server (Vite, port 5173, proxies `/api` → 3000)
- `pnpm e2e:web` — run Playwright end-to-end tests (starts both servers on a fresh SQLite DB in `.e2e-data/`)

## Tech Stack

- **Runtime:** Node.js with ESM (`"type": "module"`)
- **Framework:** [Hono](https://hono.dev) with `@hono/node-server`
- **Language:** TypeScript (strict mode, ESNext target, NodeNext modules)
- **JSX:** Hono's built-in JSX (`hono/jsx` as jsxImportSource)
- **Package manager:** pnpm
- **Dev tooling:** tsx for development, tsc for production builds

## Architecture

Early-stage project. Single entry point at `src/index.ts` running a Hono server on port 3000.

TypeScript is configured with `verbatimModuleSyntax: true` — use `import type` for type-only imports.

## Web Frontend (`web/`)

Standalone React SPA consuming the Hono JSON API (which stays the sole owner of data and business logic).

- **Stack:** Vite + React + TypeScript, React Router (declarative), TanStack Query, Tailwind v4 (CSS-first `@theme`), Radix UI, lucide-react, react-hook-form + Zod, Vitest + React Testing Library, Playwright, Biome.
- **Layout:** `web/src/api/` (Zod schemas + fetch wrapper + typed endpoints), `web/src/features/` (auth, campaigns, encounters, combat — components and queries co-located), `web/src/components/` (shared UI), `web/src/theme/` (tokens.css + ThemeProvider), `web/src/routes/` (router).
- **Auth:** username stored in localStorage; every request sends `X-DM-Username`; 401 clears the session and redirects to `/login`.
- **Theming:** two themes (`candlelight`, `arcane-slate`) as CSS-variable sets under `[data-theme]` in `web/src/theme/tokens.css`, mapped to Tailwind tokens via `@theme inline`; values come from `design/themes/`. Switch via the palette dropdown in the top bar.
- **Combat state is client-side:** the API returns turn order only from `POST /api/encounters/:id/start`; the combat page's reducer (`web/src/features/combat/combatReducer.ts`) tracks round/turn and persists to sessionStorage (`dicefight.combat.<encounterId>`).
- **Commands (from `web/`):** `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm e2e`, `pnpm lint`.

## Ralph Agent

`scripts/ralph/` contains an autonomous agent loop for iterating on PRD-driven user stories. Run with `./scripts/ralph/ralph.sh [--tool amp|claude] [max_iterations]`. Requires a `prd.json` in the same directory.
