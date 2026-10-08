# HC-031W2A5.2 Build Report — Renderable-Level GPU Priming

## Mode

**CONVERGENCE / performance.** No new gameplay.

## Evidence driving the pass

Two A5.1 telemetry runs reproduced the same transition pattern: ordinary Scar Flow and Signal Chorus steady state returned to ~0.99–1.00 sim/wall, while first-draw transition windows collapsed. A5.1 attribution identified `guide_threshold_layered_interaction_HC006F` as a repeat offender (about 7.84 s in one run and 1.30 s in another), and the longer run also attributed about 5.47 s to `hub_chamber_spatial_authority_HC008G`. This demonstrated that staging whole roots was too coarse and could concentrate first-draw upload work into a single frame.

A5 had already proven shader/bounds warmup completed successfully, so A5.2 keeps that work and targets the remaining real draw/upload path instead.

## Purpose

Prime actual drawable children before authored transition visibility, one child per idle slot, while preserving the successful A4/A4.1 timing architecture and all gameplay authority.

## Implementation

### FirstSliceTransitionCoordinator

- A5.1 root-level live-render staging is retired and retained only as a no-op compatibility surface for old telemetry/readers.
- Adds `surface_to_guide_gpu_renderables` and `guide_to_hub_gpu_renderables` preparation jobs after each boundary's A5 shader warmup.
- Collects Mesh/Line/Points/Sprite drawable descendants from prepared roots.
- Prioritizes the two reproduced heavy roots plus `scar_memory_fleck_001`.
- Creates a 1×1 `WebGLRenderTarget` and an isolated offscreen scene/camera.
- Clones one drawable at a time **without cloning geometry/material**, so the offscreen draw uses the authored geometry/material references.
- Runs one real renderer draw per child, then yields to the next browser idle slot.
- Never changes the authored root's live visibility while priming.
- Tracks queued/primed/failed children, last and peak child/root/duration, and a monotonic priming sequence.

### GameRuntime

- Removes A5.1 live calls that serialized root visibility before `renderer.render()`.
- Keeps A4 bounded catch-up and A4.1 presentation partition unchanged.
- Passes the current idle GPU-prime snapshot into Frame Truth at callback start.
- Exposes A5.2 priming state in `lastRendererInfo`.

### FrameTruthObserver

- Marker advances to `HC-031W2A5.2`.
- Documents that root staging is retired and offscreen child priming owns first-draw preparation.
- Detects GPU-prime sequence changes that occurred between animation callbacks.
- Every >250 ms long-gap can now carry `precedingTransitionGpuPrime` with exact child renderable, parent root, boundary, duration, status, and operation count.
- Retains A5.1 `previousTransitionActivation` fields so older A5.1 telemetry remains comparable.

## Locked systems preserved

- HC-031W1 controls and targeting grammar.
- Pulse / Absorb / Stabilize behavior and 3→6→12 grammar.
- Surface contact, release, gap tolerance, support transfer, and reacquisition.
- Region/morph/route progression and chemistry authority.
- W2A1 contour/surface broad phase.
- W2A2 transient render budgets/census.
- W2A3 residency + Hub foundation cadence.
- W2A4 <=50 ms simulation substeps, 150 ms per-callback ceiling, max 3 substeps.
- W2A4.1 simulation-vs-presentation work partition.
- W2A5 live-scene shader compilation and geometry-bounds preparation.

## Validation

PASS:

- `validateHC031W2AFrameTruth.mjs`
- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `validateHC031W2A4BoundedCatchUp.mjs`
- `validateHC031W2A41CatchUpWorkPartition.mjs`
- `validateHC031W2A5TransitionRenderWarmup.mjs`
- `validateHC031W2A51FirstDrawActivationStaging.mjs` — forward-compatible attribution + A5.2 staging-retirement check
- `validateHC031W2A52RenderableGpuPriming.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- `node --check` on modified runtime/coordinator/observer/A5.2 validator

The A5.2 validator proves that each child receives its own offscreen draw, the draw uses the same geometry/material references as the authored child, the target is 1×1, authored root visibility is unchanged, already-primed children are not resubmitted, known heavy roots are prioritized, and long-gap attribution names the exact idle-prime child.

## Expected inherited limitations

- `npm run validate:hc031w1` still stops at the historical HC-031W1 locked-parent hash because W2A1 intentionally changed `src/player/CoreSurfaceTruthSystem.js`. A5.2 does not modify that file and the W1 behavioral smoke passes.
- `npm run build` still cannot execute in this Linux environment because the supplied Windows-origin `node_modules` lacks `@rollup/rollup-linux-x64-gnu`. No dependency or package-lock files were changed.

## Next evidence required

A 90–120 s telemetry-only run through Surface Wake → Scar Flow → Signal Chorus/Hub. First inspect whether the priming queues completed and whether `precedingTransitionGpuPrime` identifies any expensive child. Then compare the first Scar/Hub transition windows and live render gaps against A5.1 before making any further renderer changes.
