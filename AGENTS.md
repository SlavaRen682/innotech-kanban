# Project Instructions

## Project

Innotech Workspace Kanban is a Russian-language educational kanban app with a Node.js backend, PostgreSQL persistence, browser SPA, and local server-side file uploads.

## Commands

- `docker compose up -d db` - start PostgreSQL.
- `npm run dev` - start backend on PostgreSQL, default URL `http://localhost:5173`.
- `PORT=5174 npm run dev` - start on an alternate port.
- `npm run dev:json` - fallback local run with JSON storage.
- `npm run lint` - syntax-check server, stores, upload module, client, and tests.
- `npm test` - run Node test suite.
- `npm run build` - run lint and tests.

## Local Data

- PostgreSQL data is stored in Docker volume `kanban-postgres-data`.
- Uploaded files are stored in `uploads/`.
- `data/*.json`, `uploads/`, `videos/`, and screenshots are ignored by git.

## Quality Rules

- Keep the app in Russian.
- Keep production behavior in the backend, not only in presentation UI.
- Do not add email invitations; workspace membership is by login.
- Update README, technical docs, user docs, and `.codex/memory/` when behavior, architecture, commands, or user workflows change.
- Run `npm run build` before reporting completion; when Docker is running, also smoke-test against PostgreSQL.
