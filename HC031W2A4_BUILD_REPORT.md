# HC-031W2A4 — Bounded Simulation Catch-Up — Build Report

## Mode
Convergence / runtime timing correction. No feature expansion.

## Evidence being addressed
W2A3 materially reduced steady-state render and Hub CPU cost, but the unchanged single-step 50 ms clock still discarded ordinary elapsed time whenever an animation callback took longer than 50 ms. The W2A3 focused run produced 104.025 s wall / 85.272 s simulation (0.820 sim/wall). Scar Flow steady state could reach 0.954, while ordinary 50–100 ms callback intervals and several transition-time renderer stalls still caused lost simulation time.

## Timing correction
`GameRuntime.tick()` now plans a bounded simulation budget for each animation callback:

- maximum simulation step: **0.05 s / 50 ms**
- maximum catch-up budget per callback: **0.15 s / 150 ms**
- maximum simulation substeps per callback: **3**
- renderer submission remains **once per animation callback**
- transition coordinator observes the callback **once**, with the real `rawDt`
- there is **no persistent backlog** or unbounded accumulator

Examples:

- 16 ms callback → one 16 ms simulation step
- 100 ms callback → two 50 ms simulation steps; no ordinary time discarded
- 149 ms callback → three ~49.7 ms simulation steps
- 400 ms callback → three 50 ms simulation steps; 250 ms is deliberately dropped
- 1.6 s renderer stall → at most 150 ms is simulated after the stall; the remainder is dropped rather than creating a catch-up spiral

This is the first W2A pass that intentionally changes simulation-time advancement. It does **not** change movement constants, impulses, contact thresholds, controller mapping, verb strength, ecology, chemistry, routes, or progression.

## Input / profiler safety
The existing `InputSystem` is still evaluated inside simulation substeps. A4 regression coverage proves a held controller button does not refire its pressed edge on substep 2 while held durations continue to advance normally.

`SystemRegistry` profiler instrumentation now samples only on substep 0 of a callback, preventing A4 catch-up from multiplying diagnostic overhead.

## Frame Truth
Frame Truth now identifies `optimizationPass: "HC-031W2A4"` and records:

- substep count per measured callback/window
- count of multi-substep callbacks
- time recovered beyond the former single 50 ms cap
- time still dropped above the bounded 150 ms catch-up ceiling
- `simulationSubsteps`, `simulationRecoveredBeyondLegacyCapMs`, and `simulationDroppedMs` alongside renderer information

The visible build/package identity remains HC-031W1 / 0.31.54; A4 identity is diagnostic/runtime-pass metadata only.

## Locked / unchanged
- W2A1 contour budget, surface broad phase, telemetry cadence
- W2A2 transient render budgets, shared transient geometry, zero-alpha culling, render-owner census
- W2A3 previous-cell render residency and Hub foundation cadence/cache
- player acceleration/speed/impulse tuning
- authored contact and suction rules
- controller mapping, targeting grammar, A-button commitment ownership
- Pulse / Absorb / Stabilize meanings and costs
- chemistry, ecology, route ownership, progression, HC027D1 audio reference
- no dependency, lockfile, package-version, or build-ID changes

## Validation
PASS:
- `validateHC031W2AFrameTruth.mjs`
- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `validateHC031W2A4BoundedCatchUp.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- undefined `this.method()` audit
- RecipeData load validation
- syntax checks for all A4 runtime modules and validators

A4's dedicated validator covers 16/100/149/400 ms timing plans, the 150 ms hard ceiling, no direct raw-delta gameplay update, one render/transition observation per callback, Frame Truth recovery accounting, profiler substep gating, and one-shot controller-edge behavior across catch-up substeps.

Known inherited validation limitations:
- `npm run validate:current` stops at canonical `validate:hc031w1` because W2A1 intentionally changed locked-parent `src/player/CoreSurfaceTruthSystem.js`. A4 does not modify that file; the W1 behavioral smoke and HF1 target-clear lifecycle regression both pass. Historical lock hashes were not rewritten.
- `npm run build` remains unavailable in this Linux container because the supplied Windows-origin dependency tree lacks Rollup's `@rollup/rollup-linux-x64-gnu` optional binary. No dependencies or lockfiles were changed.

## Next telemetry acceptance
Run the same focused Surface Wake → Scar Flow → Signal Chorus/Hub path for roughly 90–120 seconds.

A4 is accepted if:
- no simulation substep exceeds 50 ms
- ordinary 50–150 ms callback intervals are represented by 2–3 substeps instead of lost time
- `recoveredBeyondLegacyCapSeconds` is non-zero
- remaining `discardedSeconds` is concentrated around callbacks above the 150 ms ceiling
- steady-state Scar Flow/Hub windows approach **0.97–1.00 sim/wall**
- total focused session ratio materially improves over W2A3's 0.820 (target roughly **0.90+** on the same route, acknowledging the still-known 0.8–1.6 s transition render stalls)
- contact/release/reacquisition, targeting, and route transitions remain behaviorally intact

If those conditions hold, the remaining performance work is the isolated transition-time render stall rather than simulation-time loss.
