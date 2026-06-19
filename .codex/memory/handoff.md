# Handoff

The authoritative project is the app imported from `/Users/zakhar/Downloads/kanban_fixed 2.zip`, now implemented in `/Users/zakhar/Documents/Kanban`.

Current shape:

- `server.js` serves static files and JSON API routes.
- `src/server/store.js` contains auth, workspace, project, task, comment, checklist, history, and deferred-task business rules.
- `src/js/main.js` is the Russian SPA client.
- `src/css/style.css` styles the board, panels, modal, auth, and responsive views.
- `tests/store.test.mjs` covers the main domain rules.

Local runtime data is stored in `data/db.json` and intentionally ignored by git. Use `npm run build` for lint plus tests and `PORT=5174 npm run dev` for local preview if `5173` is busy.
