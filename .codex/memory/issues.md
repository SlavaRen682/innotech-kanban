# Issues

## 2026-06-09: Switch Click Interception

Observed: Playwright could not check `Режим фокуса` because the hidden checkbox was not a clickable layer and the visual switch/label intercepted pointer events.

Verified fix: `.switch` is now positioned, the input covers the switch as an invisible clickable layer, and the decorative span ignores pointer events. Browser smoke confirms the checkbox can be checked.

## Observed Facts

- 

## Verified Fixes

- 

## Workarounds

- 
