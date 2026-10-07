# HC-031W2A4.1 — Catch-Up Work Partition — Patch Apply

## Parent checkpoint
Apply this patch **on top of HC-031W2A4 — Bounded Simulation Catch-Up**.

## Apply
1. Stop the Vite dev server.
2. Back up the current project or commit/checkpoint it.
3. Extract this ZIP **into the BLOB project root**. The archive starts at `src/...` and `scripts/...`; do not create an extra nested project folder.
4. Allow these files to overwrite their W2A4 versions.
5. Restart with `npm run dev`.
6. Open a fresh game tab and hard refresh once.

## Files changed from W2A4
- `src/core/GameRuntime.js`
- `src/core/FrameTruthObserver.js`
- `scripts/validateHC031W2A1CostReduction.mjs` (future-minor marker compatibility only)
- `scripts/validateHC031W2A2TransientRenderBudget.mjs` (future-minor marker compatibility only)
- `scripts/validateHC031W2A3ResidencyFoundation.mjs` (future-minor marker compatibility only)
- `scripts/validateHC031W2A4BoundedCatchUp.mjs` (accepts A4.1 while preserving the A4 clock assertions)
- `scripts/validateHC031W2A41CatchUpWorkPartition.mjs` (new)

## What changes
- The A4 bounded simulation clock remains unchanged: max 50 ms per simulation step, max 150 ms recovery per renderer callback, max 3 substeps, no persistent backlog.
- `SystemRegistry.update()` remains inside the bounded substep loop.
- Core Verb presentation, visual hierarchy compression, camera update, transition coordination, render-budget preparation, and renderer submission occur once per animation callback.
- Presentation/camera receive the total bounded simulated delta for that callback so visible state follows recovered simulation time without repeating the presentation work 2–3 times.
- Frame Truth now separates `simulationRegistry`, `presentationUpdate`, `cameraUpdate`, `transitionUpdate`, and `render` timing while retaining the older aggregate fields.
- First-substep profiler samples are retained for telemetry instead of being overwritten by later unprofiled catch-up substeps.

## No gameplay tuning in this patch
No movement speed, input mapping, contact thresholds, suction rules, verb balance, ecology, progression, route timing, audio, or render-residency budgets were intentionally changed.

## Focused validation
Run:
```bash
node scripts/validateHC031W2A41CatchUpWorkPartition.mjs
node scripts/validateHC031W2A4BoundedCatchUp.mjs
node scripts/validateHC031W2A3ResidencyFoundation.mjs
node scripts/smokeHC031W1StabilizedAimLocalContact.mjs
node scripts/validateHC031W1HF1TargetClear.mjs
node scripts/smokeHC031T5RidgeTraceFrameRate.mjs
node scripts/auditUndefinedThisMethods.mjs
```

## Playtest
Run roughly 2–4 minutes through Surface Wake → Scar Flow → Signal Chorus/Hub. Use Pulse/Stabilize and at least one surface attach/detach. Export with Shift+T.

Expected telemetry marker:
`developerTruth.frameTruth.optimizationPass = "HC-031W2A4.1"`

Key comparison fields:
- `stageMs.simulationRegistry`
- `stageMs.presentationUpdate`
- `stageMs.cameraUpdate`
- `stageMs.transitionUpdate`
- `stageMs.render`
- `simulationCatchUp`
- `lastSlowestSampledSystems`
