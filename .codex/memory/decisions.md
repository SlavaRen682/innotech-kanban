# Decisions

## Use Concrete Team Workflow Features Instead Of AI Estimation

- Decision: implement auth, workspace membership, projects, checklists, materials, comments, history, and deferred tasks.
- Reason: the user rejected abstract AI task-size estimation because it needs private project context and duplicates human responsibility. These features change observable workflow behavior and are easier to justify on defense.
- Rejected: AI-based task sizing and context-heavy assistant scoring.

## Keep Persistence Local And Dependency-Free

- Decision: use a JSON file store behind a small Node HTTP API.
- Reason: enough for a course demo, easy to run locally, no database setup, and still supports real auth/session/API behavior.
- Rejected: database service and heavy framework setup for this scope.
