# HC-031W2A5.3 Build Report — Early Priming + Live Draw Attribution

## Mode
CONVERGENCE / performance close candidate.

## Purpose
A5.2 proved that individual 1×1 offscreen child draws are cheap (worst observed priming draw ~52 ms) but Surface→Guide and Guide→Hub queues were still incomplete at first visibility. A5.3 changes scheduling, not rendering/gameplay architecture: the real offscreen draw path now runs before shader-only warmup. Passive live-draw attribution is added to identify any remaining live-scene first-visible offender without changing visibility.

## Locked systems
- HC-031W1 gameplay identity and visible build label.
- A4 bounded simulation catch-up: <=50 ms simulation steps, <=150 ms catch-up, max 3 substeps.
- A4.1 simulation/presentation work partition.
- W2A1 surface/contour optimization.
- W2A2 transient render budgets.
- W2A3 residency + Hub foundation cadence.
- A5 live-scene shader/bounds warmup infrastructure.
- A5.2 offscreen 1×1 child GPU priming.
- Movement, controller mapping, Pulse/Absorb/Stabilize behavior, targeting authority, routes, chemistry, audio, contact/release/reacquire, continuous Host transitions.

## Implementation
1. `surface_to_guide_gpu_renderables` now precedes `surface_to_guide_shader_programs`.
2. `guide_to_hub_gpu_renderables` now precedes `guide_to_hub_shader_programs`.
3. GPU priming marker/policy advances to HC-031W2A5.3.
4. Pre-render live draw attribution observes prepared Surface→Guide / Guide→Hub child renderables after render-budget visibility decisions and records:
   - root name
   - child/renderable name
   - primed vs unprimed state
   - boundary
   - newly drawable count / unprimed count
5. The next >250 ms Frame Truth gap carries `previousLiveDrawAttribution` from the immediately preceding rendered callback.
6. A5.1 whole-root staging remains a no-op compatibility surface and is not returned to the live render path.

## Validation — PASS
- `validateHC031W2AFrameTruth.mjs`
- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `validateHC031W2A4BoundedCatchUp.mjs`
- `validateHC031W2A41CatchUpWorkPartition.mjs`
- `validateHC031W2A5TransitionRenderWarmup.mjs`
- `validateHC031W2A51FirstDrawActivationStaging.mjs`
- `validateHC031W2A52RenderableGpuPriming.mjs`
- `validateHC031W2A53EarlyPrimingLiveDrawAttribution.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- Node syntax checks on modified runtime files and the A5.3 validator.

## Known inherited checks — unchanged
`npm run validate:current` stops at the historical HC-031W1 locked-parent hash because W2A1 intentionally modified `src/player/CoreSurfaceTruthSystem.js`. The W1 behavioral smoke passes; A5.3 does not modify CoreSurfaceTruth.

`npm run build` cannot complete in this Linux environment because the supplied Windows-origin dependency archive lacks `@rollup/rollup-linux-x64-gnu`. No dependency or package-lock changes are included in A5.3.

## Expected telemetry marker
`developerTruth.frameTruth.optimizationPass = "HC-031W2A5.3"`

## W2A close decision
If the next focused run reaches the transition acceptance thresholds and no severe regression appears, lock W2A and move to W2B visual hierarchy/readability. If one remaining live child is repeatedly tied to a >500 ms render, allow one surgical A5.4 offender cleanup only; do not reopen the clock architecture.
