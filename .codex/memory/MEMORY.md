# Memory Index

This file is the startup index for project memory. Keep it under 200 lines.

## Read First

- `handoff.md`: latest continuation state for a fresh chat.
- `active.md`: current task, branch, assumptions, next steps.
- `commands.md`: commands for build/test/lint/run.

## Topic Files

- `architecture.md`: durable architecture, module map, data flow.
- `decisions.md`: accepted decisions and rejected alternatives.
- `issues.md`: bugs, traps, incompatibilities, verified fixes.
- `progress.md`: durable milestone log.
- `sessions/`: detailed append-only session notes.

## Rules

- Store durable facts, decisions, commands, and verified fixes.
- Do not store secrets, raw transcripts, copied file contents, or temporary tasks.
- Facts may be recorded immediately; fixes are recorded only after verification.
