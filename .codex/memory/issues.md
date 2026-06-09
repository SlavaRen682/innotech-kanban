# Issues

## 2026-06-09: Switch Click Interception

Observed: Playwright could not check `Режим фокуса` because the hidden checkbox was not a clickable layer and the visual switch/label intercepted pointer events.

Verified fix: `.switch` is now positioned, the input covers the switch as an invisible clickable layer, and the decorative span ignores pointer events. Browser smoke confirms the checkbox can be checked.

## 2026-06-09: Board UI Looked Like A Landing Page

Observed: Playwright/self-review and user screenshot showed the board-first refactor was still visually wrong: heavy typography, side rails, detail panel, vertical crowding, and mobile board content too far down.

Verified fix: rebuilt the shell from scratch around commandbar, compact focus dock, selected-card strip, and full-width columns. Playwright checks confirm no `h1`, no visual research panel, no old side rail/detail panel, no horizontal overflow, working clicks, and mobile board starts near the top.

## Observed Facts

- 

## Verified Fixes

- 

## Workarounds

- 
