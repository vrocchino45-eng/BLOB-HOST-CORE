# HC-031W2A5.4 Build Report

## Purpose
Final intended W2A transition-performance closure candidate: prevent large batches of already-primed transition children from entering the real renderer on the same callback.

## Source evidence that justified this pass
A5.3 field telemetry showed:
- Surface→Guide real GPU priming reached 103 primed / 0 queued before Scar entry.
- Scar still produced a 0.551 first window with three >1 second gaps.
- one long render followed 34 newly drawable children, all already primed;
- another followed 28 newly drawable children, all already primed;
- Hub first window was 0.899 and a 1.08 second render followed 79 newly drawable children, 28 unprimed.

This ruled out shader compilation and GPU residency as the remaining primary Scar cause and isolated live draw batching.

## Implementation
`FirstSliceTransitionCoordinator`
- adds HC-031W2A5.4 child-level live admission state;
- keeps A5.3 1x1 offscreen GPU priming and A5 shader warmup;
- essential destination/arrival cues bypass admission throttling;
- secondary primed drawables: max 8 per healthy callback;
- recovery max 3 when previous render >90 ms;
- zero new secondary admission immediately after previous render >=250 ms;
- unprimed secondary drawables remain render-deferred until primed;
- temporary child visibility mutations are restored immediately after render;
- authored root visibility is never serialized.

`GameRuntime`
- applies child admission after existing RenderBudgetSystem decisions and before live-draw attribution;
- restores child visibility in the renderer `finally` path before restoring RenderBudgetSystem state;
- exports admission diagnostics into Frame Truth renderer info.

`FrameTruthObserver`
- `optimizationPass` advances to `HC-031W2A5.4`;
- records the admission rule;
- long-gap entries now carry `previousLiveAdmission` alongside `previousLiveDrawAttribution` and offscreen-prime attribution.

## Focused validation results
PASS:
- W2A Frame Truth
- W2A1 cost reduction
- W2A2 transient render budget
- W2A3 residency/Foundation cadence
- W2A4 bounded catch-up
- W2A4.1 catch-up work partition
- W2A5 live-scene render warmup
- W2A5.1 compatibility / root staging retirement
- W2A5.2 renderable GPU priming
- W2A5.3 early priming + live-draw attribution compatibility
- W2A5.4 primed child live-admission
- HC031W1 stabilized aim + local contact smoke
- HC031W1 HF1 target-clear lifecycle
- HC031T5 Ridge frame-rate smoke
- RecipeData load validation
- undefined `this.method()` audit
- syntax checks for all changed JS/MJS files

## Known inherited checks
`validate:hc031w1` still stops at the historical W1 parent hash for `src/player/CoreSurfaceTruthSystem.js`. That file was intentionally changed by W2A1 and is not modified by A5.4.

`npm run build` still cannot execute in this Linux environment because the supplied Windows dependency archive lacks Rollup's optional `@rollup/rollup-linux-x64-gnu` package. This is unchanged and is not an A5.4 source regression.

## Package discipline
This handoff contains only the A5.4 delta over A5.3 plus apply/build/manifest/diff documentation. It contains no `node_modules`, no full source tree, and no unchanged registries.
