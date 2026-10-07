# HC-031W2A4.1 — Catch-Up Work Partition — Build Report

## Mode
Convergence / performance architecture refinement.

## Purpose
Preserve the successful W2A4 bounded simulation recovery while preventing presentation/camera work from being repeated once per simulation catch-up substep.

## Evidence that motivated the pass
The W2A4 playtest achieved about 0.947 simulation-to-wall and recovered about 55.2 seconds beyond the legacy 50 ms cap, proving the clock correction works. Late Scar Flow/Signal Chorus windows nevertheless showed repeated 2–3-substep callbacks alongside large `otherUpdateAndCamera` and registry costs. The pass therefore keeps the clock and partitions catch-up work rather than reverting recovery.

## Implementation
### Simulation-critical work
`SystemRegistry.update(dt, frameState)` remains inside the W2A4 substep loop and receives each <=50 ms step.

### Once-per-callback work
After all simulation substeps complete, the runtime evaluates these exactly once:
- `CoreVerbPhysicalizationSystem.update(totalBoundedSimDt)`
- `VisualHierarchyCompressionSystem.update(totalBoundedSimDt)`
- `updateCamera(totalBoundedSimDt)`
- `FirstSliceTransitionCoordinator.update(totalBoundedSimDt, ..., rawDt)`
- render-budget preparation
- renderer submission

The total bounded delta is never greater than the existing A4 150 ms callback ceiling.

### Frame Truth
Adds separate window percentiles for:
- `simulationRegistry`
- `presentationUpdate`
- `cameraUpdate`
- `transitionUpdate`
- `render`

Legacy `registry` and `otherUpdateAndCamera` fields remain for comparison with prior exports.

First-substep profiler evidence is preserved across later catch-up substeps so `lastSlowestSampledSystems` can identify a real registry owner again.

## Validation results
PASS:
- HC031W2A Frame Truth observer/export/ownership assertions
- HC031W2A1 cost reduction
- HC031W2A2 transient render budget + owner census
- HC031W2A3 residency + Hub foundation cadence
- HC031W2A4 bounded simulation catch-up
- HC031W2A4.1 catch-up work partition
- HC031W1 stabilized aim + local contact behavioral smoke
- HC031W1 HF1 target-clear lifecycle regression
- HC031T5 Ridge frame-rate smoke
- undefined `this.method()` audit
- RecipeDataSystem load validation
- syntax checks for GameRuntime, FrameTruthObserver, BoundedSimulationCatchUp, SystemRegistry, SessionTelemetrySystem

## Known inherited validation/build limitations
- `validateHC031W1StabilizedAimLocalContact.mjs` still reports `src/player/CoreSurfaceTruthSystem.js` as drifted because W2A1 intentionally introduced the surface broad-phase optimization. This historical locked-parent hash was not rewritten.
- `npm run build` still cannot complete in this Linux environment because the supplied Windows dependency tree lacks `@rollup/rollup-linux-x64-gnu`. No dependency or lock-file changes are included.

## Acceptance for the next telemetry run
- `optimizationPass` is `HC-031W2A4.1`.
- Overall simulation-to-wall remains near the A4 improvement rather than regressing toward the pre-A4 0.82 range.
- `presentationUpdate` and `cameraUpdate` do not scale upward with 2–3 simulation substeps.
- Signal Chorus/Hub callback rate improves relative to the A4 late-run windows.
- Surface attachment/detachment/reacquisition and targeting grammar remain intact.
- Catastrophic >150 ms stalls remain bounded rather than fully caught up.
