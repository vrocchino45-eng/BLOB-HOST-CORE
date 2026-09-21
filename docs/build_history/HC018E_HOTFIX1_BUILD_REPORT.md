# HC018E HOTFIX1 — Build Identity + Return-Fold Guard

## Evidence from the current video
The recorded run is the HC018E folder/build, but the browser tab still says HC017A and the runtime/debug identity is still inherited from HC015N. The video also shows the Vascular segment returning to Hub immediately after reaching the return-fold area, making that endpoint too easy to trigger accidentally.

## Fix 1 — Active build identity
- Browser title: HC-018E — Gameplay Rhythm Convergence
- GameRuntime boot buildId: HC-018E
- buildLabel: Gameplay Rhythm Convergence
- package description updated
- debug overlay now labels the old HC015N manifest as `Source manifest (compat)` instead of implying it is the current build
- `PERFORMANCE CAPTURE HC016N` heading renamed to neutral runtime/performance wording

The underlying HC015N buildManifest ID is deliberately NOT rewritten. RecipeDataSystem still uses legacy manifest IDs as compatibility/data-activation switches, so replacing that ID would be a risky semantic change rather than a label cleanup.

## Fix 2 — Explicit return-fold arming
For interact-driven route returns (Grave/Vascular/Silt and other generic return recipes), return now requires:
1. return readiness to remain valid for 0.38 s,
2. at least one frame with Interact released,
3. then a fresh A/E press.

This prevents the same interaction press used at the end of route gameplay from also being interpreted as an immediate Hub-return command.

## Locked
No route completion thresholds, verb rules, movement, camera, chemistry, return-fold positions, interaction ranges, or active-cell ownership changed.
