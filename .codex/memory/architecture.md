# Architecture

## Current App

Innotech Workspace Kanban is a small full-stack local app for course demonstration.

## Modules

- `server.js`: Node.js HTTP server, static file serving, cookie-session API routing.
- `src/server/store.js`: JSON-backed store and all business rules.
- `src/js/main.js`: browser SPA, API client, board interactions, modals, detail panel.
- `src/css/style.css`: visual system and responsive layout.
- `tests/store.test.mjs`: domain tests.

## Data Flow

```text
Browser SPA -> fetch /api/* -> server.js -> JsonStore -> data/db.json
```

## Core Entities

- Users with unique login and hashed password.
- Sessions stored by opaque token in an HttpOnly cookie.
- Workspaces with owner/member membership.
- Projects inside a workspace.
- Tasks with status, assignee, priority, due date, tag, checklist, materials, comments, history, and deferred state.

## Important Rules

- Only workspace members can read or mutate workspace data.
- Only owner can add members.
- Done status is blocked while checklist has incomplete items.
- Deferred tasks are removed from active mode and visible in deferred mode.
