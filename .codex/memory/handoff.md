# Handoff

Project lives in `/Users/zakhar/Documents/Kanban`.

Current important files:

- `server.js`: API routes, auth cookie handling, upload route, static serving.
- `src/server/postgres-store.js`: production PostgreSQL store.
- `src/server/schema.sql`: database schema applied on server startup.
- `src/server/uploads.js`: multipart file upload handler.
- `src/server/store.js`: JSON/memory fallback and shared helpers.
- `src/js/main.js`: SPA, including file input upload before task save.

Run:

```bash
docker compose up -d db
npm run dev
```

Fallback:

```bash
npm run dev:json
```
