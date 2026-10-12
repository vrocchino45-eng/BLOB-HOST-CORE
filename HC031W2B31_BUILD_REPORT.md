# HC-031W2B3.1 — Directional Relationship Readability Build Report

## Mode
Visual-language convergence / surgical W2B3 correction.

## Purpose
W2B3 proved the noun/verb relationship grammar, but video showed the 3D triangle plane could become ambiguous from oblique camera angles. B3.1 makes direction readable through travel along the retained relationship vector while preserving the triangle symbols and Stabilize condition language.

## Implementation
- Pulse triangle is camera-facing and travels **Core → noun**.
- Absorb triangle is camera-facing and travels **noun → Core**.
- Motion, not 3D-plane orientation, is now the primary push/pull cue.
- The canonical Pulse down-triangle and Absorb up-triangle symbols are retained.
- Stabilize stays anchored to the noun with its existing 4→6→8→12 resolving boundary.
- While Stabilize condition grammar is active, its older tether and gyroscopic support rings are reduced so the condition boundary has visual space.
- Generic relationship trace also yields modestly while Stabilize is active.

## Explicit non-changes
No targeting authority, LT+RS behavior, Pulse/Absorb/Stabilize strength, Pulse range, sonar timing, chemistry, routes, progression, movement, camera controls, B1.1 depth hierarchy, or B2 sonar spatial-reveal logic changed.

## Validation
PASS:
- `validateHC031W2B31DirectionalRelationshipReadability.mjs`
- `validateHC031W2B3VerbTargetRelationshipGrammar.mjs`
- `validateHC031W2B2PulseSonarSpatialReveal.mjs`
- `validateHC031W2B11CameraRelativeHierarchyBalance.mjs`
- `validateHC031W2B1DepthHierarchyFoundation.mjs`
- `validateHC031W2A54PrimedChildLiveAdmission.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs` — includes LT+RS deliberate redirect
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- Node syntax checks for modified runtime/test files

The B3.1 runtime validator additionally confirms under an oblique camera that Pulse advances toward the noun, Absorb advances toward the Core, both triangles remain camera-facing, and Stabilize support rings yield to the coherence boundary.

## Known inherited environment caveats
- `npm run build` cannot complete in this Linux environment because the supplied Windows-origin dependency set lacks optional Rollup binary `@rollup/rollup-linux-x64-gnu`.
- `npm run validate:current` still stops on the inherited HC-031W1 parent-hash lock for `src/player/CoreSurfaceTruthSystem.js`, which was intentionally modified by the W2A performance series.

Neither caveat was introduced by B3.1.
