# HC-031W2A1 — Cost Attribution & Reduction

**Mode:** performance convergence / no gameplay expansion

## Evidence basis
HC-031W2A Frame Truth showed the same Surface Wake cell ranging from ~13 callbacks/s with ~0.63 sim/wall to ~33 callbacks/s with ~0.99 sim/wall. The slow window carried far more rendered lines and materially higher render/runtime cost. The runtime still uses the unchanged 50 ms per-callback simulation cap.

## Changes
### Pulse contour renderer
- Reduced/cached pulse contour line geometry.
- Maximum 180 segments per source mesh.
- Maximum 4 meshes per contour.
- Maximum 3 concurrent contours.
- Repeated sonar on the same target replaces the older contour instead of stacking duplicate wire cages.
- Adds read-only `pulseContourSegments` and budget fields to `frameState.verbPhysicalization`.

### Surface truth
- Added a bounding-sphere broad phase before authored-surface raycasts.
- Only candidates whose enclosing sphere can intersect the existing 1.28-unit probe proceed to raycasting.
- The actual raycast, scoring, contact priority, mechanical eligibility threshold, normals, edge grace and attachment authority remain unchanged.
- Adds read-only candidate counts for Frame Truth correlation.

### Telemetry CPU
- Live HUD/status summary is refreshed at most every 0.75 seconds rather than rebuilding the O(events) summary on every dirty frame.
- `exportSession()` still computes the exact current summary at export time.

### W2A profiler overhead
- Per-system timing keeps its 60-frame periodic sample.
- Hitch-triggered per-system timing now requires >=120 ms and is rate-limited to once per 30 frames.
- Frame Truth frame/update/render timing remains active every callback.

### Extra proof fields
Frame Truth `lastRendererInfo` now includes pulse contour and surface broad-phase counts. `FrameTruthObserver.snapshot()` reports `optimizationPass: "HC-031W2A1"`.

## Validation completed
PASS:
- `node scripts/validateHC031W2A1CostReduction.mjs`
- `node scripts/smokeHC031W1StabilizedAimLocalContact.mjs`
- `node scripts/validateHC031W2AFrameTruth.mjs`
- `node scripts/auditUndefinedThisMethods.mjs`
- `node --check` on all modified JS modules

Production `npm run build` was attempted but cannot complete in this Linux packaging environment because the supplied dependency tree does not contain Rollup's Linux native optional binary (`@rollup/rollup-linux-x64-gnu`). Dependencies were not modified.

## Deferred intentionally
- No simulation accumulator/substep change yet.
- No movement-speed changes.
- No visual-language redesign.
- No content expansion.

The bounded accumulator becomes the next timing change only after this patch proves that active-frame cost is under control.
