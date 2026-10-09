# HC-031W2B1.1 — Camera-Relative Hierarchy Balance

## Mode
Visual-language convergence only.

## Purpose
Correct the two visual imbalances found in the W2B1 video review without reopening renderer architecture or gameplay: Guide/Scar became too sparse between interaction beats, while Hub could still be veiled by large near-camera cyan tissue.

## Changes
- Guide gameplay-fill full-path strand multiplier: `0.58 → 0.68`.
- Guide gameplay-fill mote multiplier: `0.72 → 0.80`.
- Guide layered strand multiplier: `0.56 → 0.66`.
- Guide layered mote multiplier: `0.72 → 0.80`.
- Guide local point-light multiplier: `0.62 → 0.70`.
- Local pressure bodies, settling ribs, focus marker, Core, and Guide priority remain unchanged.
- Hub depth tissue now receives camera-relative attenuation based on `worldRadius / cameraDistance`, independent of authored foreground/background label.
- Attenuation begins at apparent-size ratio `0.16`, reaches full fade at `0.48`, and bottoms at `0.24 ×` the already-authored depth opacity.
- Surface Wake remains unchanged.
- Visual-state metadata advances to `HC-031W2B1.1` for the three tuned presentation systems.

## Locks / forbidden scope
No geometry additions/removals, no global exposure/fog, no camera behavior changes, no movement/input/controller changes, no targeting/verb/chemistry/progression changes, and no W2A timing architecture changes.

## Validation
PASS:
- `validateHC031W2B11CameraRelativeHierarchyBalance.mjs`
- `validateHC031W2A54PrimedChildLiveAdmission.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs` (includes LT+RS redirect path)
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- JS syntax checks for all three changed source files

Inherited validation caveat:
- `validateHC031W1StabilizedAimLocalContact.mjs` stops on the previously documented W2A1 parent-hash drift in `src/player/CoreSurfaceTruthSystem.js`; B1.1 does not touch that file.

Environment build caveat:
- `npm run build` reaches the same inherited Rollup failure because the supplied Windows `node_modules` archive does not contain `@rollup/rollup-linux-x64-gnu`. This is not a B1.1 regression and is not counted as a production build pass.

## Acceptance
Primary evidence is video. Lock B1.1 if Guide/Scar regains enough continuous Host context without cyan wash and Hub large near-camera tissue fades into a frame rather than a veil. Then stop static opacity tuning and move to W2B2 Pulse/Sonar Spatial Reveal.
