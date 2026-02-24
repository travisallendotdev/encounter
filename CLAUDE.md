# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D&D 5th Edition initiative and combat encounter tracker. Built with Hono (web framework) on Node.js with TypeScript.

## Commands

- `pnpm dev` — start dev server with hot reload (tsx watch, port 3000)
- `pnpm build` — typecheck and compile (`tsc` to `dist/`)
- `pnpm start` — run compiled output (`node dist/index.js`)

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

## Ralph Agent

`scripts/ralph/` contains an autonomous agent loop for iterating on PRD-driven user stories. Run with `./scripts/ralph/ralph.sh [--tool amp|claude] [max_iterations]`. Requires a `prd.json` in the same directory.
