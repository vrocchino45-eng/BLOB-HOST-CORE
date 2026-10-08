# HC-031W2A5 — Transition Render Warmup — Build Report

## Mode

Performance convergence only. No new gameplay or visual-language feature work.

## Evidence entering the pass

HC-031W2A4.1 successfully partitioned catch-up work. In the 166.653 s focused test, overall simulation/wall was 0.947. Stable Signal Chorus windows reached 0.999 and 0.997 sim/wall with presentation around 0.1 ms p50 and camera around 0.3 ms p50.

The remaining loss was concentrated in first-use rendering around the Surface Wake -> Scar Flow handoff. The first Scar Flow 10 s window was 0.617 sim/wall and contained three >1 s gaps. Recorded previous-callback render work included approximately 1035.3 ms, 1596.1 ms, and 1497.3 ms.

## Source finding

`FirstSliceTransitionCoordinator.warmPreparedShaders()` already attempted transition warmup, but it cloned prepared roots into a temporary `THREE.Scene` containing a synthetic `AmbientLight` and compiled that temporary scene.

Three.js `WebGLRenderer.compile/compileAsync` supports compiling an object for an existing target scene via the third `targetScene` argument. The old temporary-scene path could therefore prepare a shader signature that did not match the actual Host scene lighting/environment, allowing the real transition to pay first-use compilation cost anyway.

## A5 correction

`FirstSliceTransitionCoordinator.js`

- Removes the synthetic temporary-scene/AmbientLight warmup.
- Compiles each **real prepared root** with:
  `renderer.compileAsync(root, camera, this.scene)`
- Uses the actual Host scene as shader target context.
- Compiles one root at a time and yields to a new idle slot between roots.
- Precomputes missing geometry bounding spheres before compilation.
- Does not change root visibility, active cell ownership, progression, transition ownership, or gameplay state.
- Failed warmups remain non-authoritative and retryable; they do not block transition ownership.
- Publishes prepared/compiled/pending root counts, actual-target compile count, geometry-bound count, idle-yield count, failures, and last warmup status.

`GameRuntime.js`

- Adds the A5 transition warmup diagnostics to Frame Truth `lastRendererInfo`.
- No clock or render-loop ownership change.

`FrameTruthObserver.js`

- Sets `optimizationPass` to `HC-031W2A5`.
- Adds the explicit transition-render warmup rule.
- A4/A4.1 timing architecture is unchanged.

Regression validators A1-A4.1 were updated only to recognize A5 as a valid successor marker; their behavioral assertions are unchanged.

## Validation

PASS:

- `validateHC031W2AFrameTruth.mjs`
- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `validateHC031W2A4BoundedCatchUp.mjs`
- `validateHC031W2A41CatchUpWorkPartition.mjs`
- `validateHC031W2A5TransitionRenderWarmup.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- syntax checks for modified source files

Production `npm run build` was attempted and still cannot execute in this Linux container because the supplied Windows dependency tree does not contain Rollup's `@rollup/rollup-linux-x64-gnu` optional native package. No dependencies were changed.

`npm run validate:current` still stops at the inherited W1 locked-parent hash for `src/player/CoreSurfaceTruthSystem.js`, which has intentionally differed since W2A1. A5 does not modify that file or rewrite the historical lock.

## Acceptance test

Run Surface Wake -> Scar Flow -> Signal Chorus/Hub for roughly 90–150 seconds and export Shift+T telemetry. Primary acceptance is that target-scene warmup completes before Scar Flow visibility and the former ~1–1.6 s render spikes are materially reduced without losing A4.1's ~0.99 steady-state Signal Chorus timing.
