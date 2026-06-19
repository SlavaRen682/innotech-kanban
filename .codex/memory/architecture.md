# Architecture

## Current App

Innotech Workspace Kanban is a small full-stack app:

- Node HTTP backend.
- PostgreSQL default persistence.
- Local server-side uploads in `uploads/`.
- Browser SPA.

## Data Flow

```text
Browser -> API -> PostgresStore -> PostgreSQL
Browser file input -> /api/uploads -> uploads/ -> task.materials
```

## Persistence

PostgreSQL tables store users, sessions, workspaces, members, projects, tasks, comments, and history. Tasks keep checklist and materials as JSONB arrays.
