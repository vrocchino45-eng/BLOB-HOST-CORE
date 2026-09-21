# HC-028L1 — Startup Scope Hotfix — Build Report

## Reported failure

Live browser startup stopped with:

`ReferenceError: recipe is not defined`

Stack owner: `LocalCellBoundaryMorphSystem.publishEarlyReturnTraversal()` called from `LocalCellBoundaryMorphSystem.init()`.

## Root cause

The regression originated in HC028F1. Guided Hub commit diagnostics were added with:

- `samePlayerPositionRetained: !recipe.guidedApproach`
- `deliberateGuidedApproach: Boolean(recipe.guidedApproach)`

Those lines were accidentally written into `publishEarlyReturnTraversal()`, an HC026B first-slice Surface/Guide/Hub return publisher that has no `recipe` parameter or local recipe variable. The method is called during initialization, so a real browser executes the invalid reference before gameplay begins.

## Fix

Restore the first-slice return semantics:

- `samePlayerPositionRetained: true`
- `deliberateGuidedApproach: false`

The real Hub guided-commit path remains in `updateGuidedHubCommitFlight(recipe, state, frameState)` and is untouched.

## Regression protection

`validateHC028L1StartupScopeHotfix.mjs` extracts and executes the exact `publishEarlyReturnTraversal()` method body inside a VM context that deliberately provides no `recipe` variable. This directly guards the reported failure mode in addition to static assertions.

## Runtime scope

Changed runtime files:

1. `src/morph/LocalCellBoundaryMorphSystem.js` — startup scope correction only.
2. `src/main.js` — build identity only.

All other 104 runtime JS owners are hash-locked to HC028L.

## Preserved behavior

- HC028L Tender/Watcher reciprocal behavior.
- HC028K ecological memory.
- HC028J entity relationship grammar.
- HC028I1 Comb re-entry and proximity-return arming.
- Hub deliberate route commit/guided flight.
- Movement, verbs, topology, chemistry, route progression and controls.
- Telemetry schema remains `blob.session.telemetry.v1.12`.

## Validation

See validator output in the packaged source. Full browser/Vite render remains a live-machine check because the package does not include local `node_modules`.
