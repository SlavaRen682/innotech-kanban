# Active Work

## Current State

- App is a Russian-language kanban board with Node backend, PostgreSQL store, file uploads, and browser SPA.
- PostgreSQL is the default storage through `src/server/postgres-store.js`.
- JSON store remains only as `npm run dev:json` fallback and for memory tests.

## Verification State

- `npm run build` passes after Postgres/upload code.
- PostgreSQL runtime smoke depends on Docker daemon being available.

## Next Steps

- If Docker is running, execute `docker compose up -d db`, start `npm run dev`, and smoke-test registration/task/upload.
