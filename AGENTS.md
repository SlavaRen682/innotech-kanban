# Project Agent Instructions

## Startup

- Read `.codex/memory/MEMORY.md` before non-trivial work.
- For continuation work, also read `.codex/memory/handoff.md` and `.codex/memory/active.md`.
- Use topic files from `.codex/memory/` only when relevant to the task.
- If this memory bank is missing in another project during non-trivial work, initialize it with `codex-memory-init` unless the user explicitly asked for no file changes.

## Project Commands

- Build:
- Test:
- Lint:
- Typecheck:
- Run:

## Project Rules

- Follow existing architecture and style.
- Keep changes scoped to the requested behavior.
- Work autonomously after architecture is approved: investigate, implement, verify, and update context without waiting for step-by-step direction.
- Ask before architecture or quality-impacting decisions: public APIs, database schema, auth/security model, service/module boundaries, persistence, queues/caches, deployment topology, large dependencies, or framework changes.
- For architecture decisions, present a recommendation, alternatives, tradeoffs, affected files/modules, and the implementation plan after approval.
- Use Playwright MCP for frontend/browser verification when UI behavior changes.
- Local checkpoint commits are allowed during substantial work when they make progress safer. Never push unless the user explicitly asks.
- The agent may move between its own local checkpoint commits when that is the easiest path to the goal, but must not discard user changes.
- Update `.codex/memory/handoff.md` and `.codex/memory/active.md` after non-trivial work.
- Before the final response after non-trivial project work, update `.codex/memory/handoff.md` and `.codex/memory/active.md`; if no update is needed, state why.
