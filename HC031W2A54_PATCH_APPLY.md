# HC-031W2A5.4 — Primed Child Live-Admission

## Parent
Apply this patch over **HC-031W2A5.3 — Early Priming + Live Draw Attribution**.

Visible build identity intentionally remains:
- `HC-031W1`
- `Stabilized Aim + Local Contact Proof`

## Scope
This is the final intended W2A performance/convergence pass. It does not change the A4/A4.1 clock, simulation catch-up, input mapping, movement, targeting authority, chemistry, progression, route authority, or authored visibility state.

A5.3 field evidence showed that Surface→Guide had already reached `103 primed / 0 queued` before Scar entry, but 34 and then 28 already-primed children became drawable in single callbacks and still produced >1 second render stalls. Hub similarly exposed 79 children in one callback, including 28 not yet primed.

A5.4 therefore changes only real-render submission:
- essential destination surface / primary arrival silhouette cues remain immediate;
- up to 8 **primed secondary** children are admitted per healthy callback;
- after a >90 ms previous render, the next callback admits at most 3;
- after a >250 ms previous render, the next callback admits 0 new secondary children;
- unprimed secondary children are render-deferred until their existing 1x1 offscreen A5.3 prime completes;
- every temporary child `.visible` change is restored immediately after the real scene render;
- whole-root A5.1 staging remains retired.

## Apply
Copy the included files into the matching project-relative paths, replacing the A5.3 versions.

No dependency files are included. No data registries are changed.

## Focused validation
Run from the project root:

```text
node scripts/validateHC031W2A54PrimedChildLiveAdmission.mjs
node scripts/validateHC031W2A53EarlyPrimingLiveDrawAttribution.mjs
node scripts/validateHC031W2A52RenderableGpuPriming.mjs
node scripts/validateHC031W2A5TransitionRenderWarmup.mjs
node scripts/validateHC031W2A41CatchUpWorkPartition.mjs
node scripts/smokeHC031W1StabilizedAimLocalContact.mjs
node scripts/validateHC031W1HF1TargetClear.mjs
node scripts/smokeHC031T5RidgeTraceFrameRate.mjs
node scripts/validateRecipeDataLoad.mjs
node scripts/auditUndefinedThisMethods.mjs
```

## Field test
Restart Vite, use a fresh tab/hard refresh, then run roughly 90–120 seconds through:

`Surface Wake → Scar Flow → Signal Chorus / Hub`

Use Pulse/Stabilize, attach/detach/reacquire at least once, and exercise Stabilize+RS redirect if convenient. Export with **Shift+T**.

Expected telemetry marker:

`developerTruth.frameTruth.optimizationPass = "HC-031W2A5.4"`

Key closing criteria:
- first Scar and Hub transition windows >= 0.90 sim/wall, preferably >= 0.95;
- no transition render >500 ms, target <250 ms;
- settled play ~0.98–1.00 sim/wall;
- `transitionLiveAdmissionHiddenThisRender` shows secondary batching during reveal;
- `transitionLiveDrawNewlyDrawableCount` should no longer spike into the old 28–79 range on one callback;
- no movement/targeting/contact/route regression.

If these criteria are broadly met, lock W2A and move to W2B visual hierarchy/readability. There is no planned A5.5 chain.
