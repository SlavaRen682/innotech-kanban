# Project Instructions

## Project

Innotech Workspace Kanban is a Russian-language educational kanban app with a small Node.js backend and browser SPA.

## Commands

- `npm run dev` - start local server, default URL `http://localhost:5173`.
- `PORT=5174 npm run dev` - start on an alternate port.
- `npm run lint` - syntax-check server, store, client, and tests.
- `npm test` - run Node test suite.
- `npm run build` - run lint and tests.

## Local Data

- Runtime data is stored in `data/db.json`.
- `data/*.json` is ignored by git because it contains local users, sessions, and board data.

## Quality Rules

- Keep the app in Russian.
- Keep the implementation production-shaped for the course scope: no demo-only branches, fake UI controls, or presentation-only shortcuts.
- Update `README.md`, `docs/technical/`, `docs/user/`, and `.codex/memory/` when behavior, architecture, commands, or user workflows change.
- Verify UI changes through a browser smoke test and run `npm run build` before reporting completion.
