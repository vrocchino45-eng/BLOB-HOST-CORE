# HC-031W2A3 — Residency + Foundation — Build Report

## Mode
Convergence / performance correction. No feature expansion.

## Evidence being addressed
The W2A2 telemetry showed Surface Wake settling into materially better windows, but Scar Flow fell back to roughly 0.54–0.64 simulation/wall while old Surface Wake render owners were still present. Signal Chorus/Hub then exposed a separate CPU-side spike where `hubChamberFoundationSystem` sampled at 56.2 ms despite a much lighter rendered scene.

## Changes

### Render residency
Previous-cell detail is culled only for the render call and immediately restored. The first Scar Flow seconds remain visually continuous; full Surface Wake local detail is removed from GPU submission only after the arrival envelope settles. Signal Chorus/Hub removes prior Surface Wake + Scar Flow local detail from the render-resident scene.

### Hub foundation CPU
- named scene roots are cached lazily
- Hub scene-graph enforcement runs at a 0.25 s cadence instead of every frame
- Hub spatial readability proof runs at a 0.12 s cadence instead of every frame
- two whole-scene `scene.updateMatrixWorld(true)` walks are replaced with Hub-root-only world-matrix updates
- animation, route identity, Core mirror state, presentation authority, prompt state, and player-facing Hub state remain per-frame

### Diagnostics
Frame Truth now identifies `HC-031W2A3` and records residency + Hub cadence metadata in normal Shift+T exports.

## Locked / unchanged
- 50 ms `dt = Math.min(rawDt, 0.05)` rule
- player movement and impulse tuning
- controller mapping / targeting grammar
- Pulse / Absorb / Stabilize authority
- W2A1 surface broad phase and telemetry cadence
- W2A2 transient Pulse budgets and zero-alpha culling
- chemistry, ecology, progression, audio, route ownership

## Validation
PASS:
- `validateHC031W2AFrameTruth.mjs` — 25 assertions
- `validateHC031W2A1CostReduction.mjs`
- `validateHC031W2A2TransientRenderBudget.mjs`
- `validateHC031W2A3ResidencyFoundation.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs`
- undefined `this.method()` audit
- RecipeData load validation
- syntax checks for all A3-modified runtime modules and validator

Known inherited validation limitations:
- canonical `validate:hc031w1` still rejects `src/player/CoreSurfaceTruthSystem.js` because W2A1 intentionally changed that locked parent file; W2A3 does not modify it and the W1 behavioral smoke passes.
- several old Hub validators are tied to historical manifest identities / a retired `GateSystem.js` and are not valid against the current HC-031W1/W2A convergence tree. Canonical lock/manifests were not rewritten to manufacture green results.
- `npm run build` remains unavailable in this Linux container because the supplied Windows-origin dependency tree lacks Rollup's `@rollup/rollup-linux-x64-gnu` optional binary. No dependencies or lockfiles were changed.

## Acceptance gate for the next telemetry run
Target remains focused simulation/wall near or above 0.95 through Surface Wake → Scar Flow → Hub, with no persistent previous-cell owner residency and a substantial drop in Hub foundation sampled CPU cost. If A3 reaches that gate, the next step is the bounded accumulator/substep clock correction; if not, Frame Truth should identify the remaining owner before any clock change.
