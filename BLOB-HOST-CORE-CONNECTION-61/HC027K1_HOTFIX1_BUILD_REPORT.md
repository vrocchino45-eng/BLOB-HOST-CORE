# HC027K1 HOTFIX1 — Runtime Reference Fix

## Trigger
Browser playtest screenshot exposed two runtime `ReferenceError`s that syntax/static ownership validation did not catch:

1. `RecipeDebugOverlay.fullText()` referenced bare `frameState` without establishing it in method scope.
2. `BondSystem.applyAbsorbHold()` referenced `absorbPhysiology`, which had been declared in `update()` rather than in the called method's scope.

## Changes
- `src/debug/RecipeDebugOverlay.js`
  - Added `const frameState = this.frameState;` at the start of `fullText()`.
  - No diagnostic fields removed or retuned.
- `src/chemistry/BondSystem.js`
  - Resolves `frameState.corePerformance?.verbModifiers?.absorb ?? {}` inside `applyAbsorbHold()` before J2 progress/pull physiology is consumed.
  - Existing J2 multipliers and Absorb behavior remain unchanged.
- Added `scripts/validateHC027K1Hotfix1RuntimeReferences.mjs` plus package script `validate:hc027k1-hotfix1`.

## Scope lock
No control mapping, movement, Pulse range, physiology tuning, Signal Plain consequence relationships, audio reference, 3→6→12 engine behavior, objective/progression, or route behavior changed.

The source diff against HC027K1 contains only:
- `src/chemistry/BondSystem.js`
- `src/debug/RecipeDebugOverlay.js`

## Validation
- HC027K1 HOTFIX1 runtime-reference contract: PASS
- HC027K1 instrumentation validator: PASS
- HC027K consequence validator: PASS
- RecipeData load: PASS
- undefined-this-method audit: PASS
- all 92 source JS files syntax: PASS
- all 332 public JSON files parse: PASS

## Focused browser check
1. Launch the build and press **F1**. The full debug HUD should render without a `frameState is not defined` console error.
2. Move near an absorbable object and hold **RT / Absorb** long enough to engage committed Absorb. `BondSystem.applyAbsorbHold()` should continue updating without an `absorbPhysiology is not defined` error.
3. Confirm the F1 `INPUT LIVE` panel still shows physical input and interpreted actions.
