# HC-031W2A5.1 Build Report — First-Draw Activation Staging

## Mode

**CONVERGENCE / performance.** No new gameplay.

## Evidence driving the pass

HC-031W2A5 proved all 18 prepared Surface→Scar roots had completed live-scene shader warmup, 103 geometry bounds had been prepared, and there were zero warmup failures before Scar Flow. Despite that, transition callbacks still contained ~1.87 s and ~1.71 s `renderer.render()` calls. This rejects shader/bounds preparation as the primary remaining transition hitch and shifts the next test to first-visible/first-draw activation pressure.

## Purpose

Prevent all prepared destination/support visuals from reaching the renderer on one transition callback, while preserving the existing continuous morph and all gameplay authority. Also make any remaining long render stall attributable to the exact root first admitted immediately beforehand.

## Implementation

### FirstSliceTransitionCoordinator

- Tracks each prepared scene root with its preparation boundary/order and a render-stage priority.
- Stages only `surface_to_guide` and `guide_to_hub`; other boundaries are unchanged.
- Uses a 65 ms previous-render budget.
- Admits at most one currently-requested-visible, not-yet-admitted root per renderer callback.
- Priority: destination surface → atmosphere/environment → destination chemistry object → arrival/gameplay/layered support → remaining support.
- If the previous render exceeded budget, the next activation is deferred.
- Suppression is **render-only**. Authored root visibility is restored immediately after the draw.
- Records last/peak activation render time and root identity.

### GameRuntime

- Keeps A4 bounded simulation and A4.1 work partition unchanged.
- Calls transition activation staging after simulation/presentation/camera and before render-budget preparation.
- Restores staged visibility in the renderer `finally` path.
- Reports the actual render cost back to the coordinator.
- Adds first-draw activation fields to Frame Truth renderer info.

### FrameTruthObserver

- Marker advances to `HC-031W2A5.1`.
- Documents the first-draw staging rule.
- Every >250 ms long-gap record now carries `previousTransitionActivation`, including the root name, boundary, activation sequence and render cost from the preceding callback.

## Locked systems preserved

- HC-031W1 control/targeting grammar.
- Pulse / Absorb / Stabilize behavior and 3→6→12 grammar.
- Surface contact, deliberate release, gap tolerance, support transfer and reacquisition.
- Region/morph/route progression and chemistry authority.
- W2A1 contour/surface broad phase.
- W2A2 render budgets/census.
- W2A3 residency + Hub foundation cadence.
- W2A4 <=50 ms substeps / 150 ms per-callback ceiling / max 3 substeps.
- W2A4.1 simulation-vs-presentation work partition.
- W2A5 live-scene shader/bounds warmup.

## Validation

PASS:

- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `validateHC031W2A4BoundedCatchUp.mjs`
- `validateHC031W2A41CatchUpWorkPartition.mjs`
- `validateHC031W2A5TransitionRenderWarmup.mjs`
- `validateHC031W2A51FirstDrawActivationStaging.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- `node --check` on modified runtime/coordinator/observer/new validator

Expected inherited limitations:

- `npm run validate:current` stops at the historical HC-031W1 locked-parent hash because W2A1 intentionally changed `src/player/CoreSurfaceTruthSystem.js`. The canonical lock was not rewritten.
- `npm run build` cannot execute in this Linux environment because the supplied Windows `node_modules` is missing `@rollup/rollup-linux-x64-gnu`. No dependency files were changed by A5.1.

## Next evidence required

A 90–150 s telemetry-only run from Surface Wake through Scar Flow into Signal Chorus/Hub. If a >500 ms render gap remains, inspect `last40LongGaps[].previousTransitionActivation.rootName` before changing any more rendering architecture.
