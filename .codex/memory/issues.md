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

## 2026-06-09: Native Select Broke The Modal UI

Observed: user screenshot showed the browser-native priority dropdown rendering as a dark system menu over the polished modal.

Verified fix: replaced priority and size `<select>` elements with custom radio-backed segment controls. Playwright confirms `selectCount=0`, form submission preserves `priority=high` and `size=L`, desktop/mobile modal widths have no horizontal overflow, and console has no warnings.

## 2026-06-09: Archive Was A One-Way Action

Observed: the selected-card action grid had an unused sixth slot, while `В архив` only hid cards with no UI to inspect or restore them.

Verified fix: added `restoreCard`, an `Архив` action in the free slot and commandbar, archive modal list, and `Вернуть` controls. Tests cover restoration to the original column. Playwright confirms archive/open/restore flow, selected restored card, desktop/mobile no overflow, and clean console.

## 2026-06-09: Focus Assistant Needed An Explanation

Observed: user noted the `Ассистент фокуса` label needed a nearby popup explaining how recommendations work.

Verified fix: added a `?` help button next to the assistant label and a compact popover explaining age, blocker, WIP, due date, priority, and size signals. Playwright confirms open/close behavior, all signals visible, desktop/mobile no overflow, automatic close before add modal, and clean console.

## Observed Facts

- 

## Verified Fixes

- 

## Workarounds

- 
