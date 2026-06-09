# Issues

## 2026-06-09: Switch Click Interception

Observed: Playwright could not check `Режим фокуса` because the hidden checkbox was not a clickable layer and the visual switch/label intercepted pointer events.

Verified fix: `.switch` is now positioned, the input covers the switch as an invisible clickable layer, and the decorative span ignores pointer events. Browser smoke confirms the checkbox can be checked.

## 2026-06-09: Board UI Looked Like A Landing Page

Observed: Playwright/self-review and user screenshot showed the board-first refactor was still visually wrong: heavy typography, side rails, detail panel, vertical crowding, and mobile board content too far down.

Verified fix: rebuilt the shell from scratch around commandbar, compact focus dock, selected-card strip, and full-width columns. Playwright checks confirm no `h1`, no visual research panel, no old side rail/detail panel, no horizontal overflow, working clicks, and mobile board starts near the top.

## 2026-06-09: Demo Mode Leaked Into Product Flow

Observed: user rejected the `+1 день` control and mock/demo semantics. Production code still had seed cards, fixed `DEMO_NOW`, reset flow, demo storage key, demo docs, and a Google Fonts import that could fail at runtime.

Verified fix: removed seed exports and fixed date simulation, changed first-run to an empty board, switched to current timestamps and `kanban-flow-board-state-v1`, removed reset/age controls, updated docs/tests, ignored screenshots, and removed external font loading. `npm run build`, `rg` for old strings, Playwright first-run/add/move/mobile smoke, and console check all pass.

## Observed Facts

- 

## Verified Fixes

- 

## Workarounds

- 
