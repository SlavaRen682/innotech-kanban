# Техническая архитектура

## Стек

- `server.js` - Node.js HTTP backend and static file server.
- `src/server/postgres-store.js` - PostgreSQL persistence for production flow.
- `src/server/schema.sql` - idempotent database schema.
- `src/server/store.js` - memory/JSON store and shared domain helpers for tests/fallback.
- `src/server/uploads.js` - multipart upload handling.
- `src/js/main.js` - browser SPA.
- `src/css/style.css` - UI styles.

## Запуск

```bash
docker compose up -d db
npm run dev
```

Backend uses `DATABASE_URL` or default `postgres://kanban:kanban@127.0.0.1:55432/kanban`.

Fallback without PostgreSQL:

```bash
npm run dev:json
```

## Data Flow

```text
Browser SPA
  -> fetch /api/*
  -> server.js
  -> PostgresStore
  -> PostgreSQL

Browser file input
  -> POST /api/uploads
  -> uploads/<generated-file>
  -> task.materials[] metadata
```

## Database

Tables:

- `users`: login, name, password hash.
- `sessions`: cookie session tokens.
- `workspaces`: owner-owned workspaces.
- `workspace_members`: owner/member membership.
- `projects`: projects inside a workspace.
- `tasks`: task fields, checklist JSONB, materials JSONB, deferred state.
- `comments`: task comments.
- `task_history`: auditable task actions.

## Uploads

`POST /api/uploads` accepts one multipart file up to 10 MB. The backend stores the file in `uploads/` with a generated safe filename and returns:

```json
{
  "name": "brief.pdf",
  "url": "/uploads/...",
  "fileName": "brief.pdf",
  "size": 2048,
  "mimeType": "application/pdf"
}
```

The frontend attaches that object to `task.materials`.

## Business Rules

- User sees only workspaces where they are a member.
- Only workspace owner can add members.
- Email invitations are intentionally not implemented.
- Task cannot move to `Готово` while checklist has incomplete items.
- Deferred tasks are hidden from active board and visible in `Отложено`.
- Comments, checklist updates, moves, defers, restores, creates, and edits write history entries.
