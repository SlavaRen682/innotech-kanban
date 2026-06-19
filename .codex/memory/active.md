# Active Work

## Current Task

- Implement the current `kanban_fixed 2.zip` project as the source of truth, not the older focus-assistant board.
- Build a Russian-language kanban product that supports practical team workflows: auth, workspace membership by login, projects, task attributes, checklist, materials, comments, history, and deferred tasks.

## State

- The old app files were intentionally replaced with the zip project structure while preserving `.git` and `.codex`.
- The app now uses a small Node.js HTTP API, cookie sessions, and local JSON persistence in `data/db.json`.
- Frontend is a browser SPA in `src/js/main.js` with Russian UI and no external runtime dependencies.

## Final Checks Before Handoff

- Run `npm run build`.
- Run a browser smoke test for registration, workspace member add, task creation, comments/history, checklist guard, drag/drop, defer, and restore.
- Confirm console is clean and update screenshots if UI changed.
