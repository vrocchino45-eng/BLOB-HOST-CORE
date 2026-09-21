# BLOB: HOST CORE — HC-013D Build Report

## Pass
Transition / Performance Consolidation

## Purpose
Remove avoidable boot and background-preparation work before widening into Aperture Fields, while keeping HC-013C gameplay and visual composition locked.

## Implemented

1. **Archive-only planning data at live boot**
   - 13 `/data/planning/` JSON records are now loaded only when `RecipeDataSystem` uses `legacy_archive` validation.
   - Normal `first_slice_runtime` boot resolves those slots to `null` and does not issue the network fetches.
   - Historical files remain in the project and compatibility/archive validation still passes.
   - Removed normal live-boot payload: **63,625 bytes across 13 files**.

2. **Deferred developer diagnostics**
   - Removed static imports for `RecipeDebugOverlay` and `ChemistryDebugPanel` from `GameRuntime`.
   - Both panels are dynamically imported after first render during browser idle time, with a short timeout fallback.
   - Their original registry IDs and update behavior are retained once loaded.

3. **Boundary-eligible transition preparation**
   - Surface Wake prepares only Guide Threshold work.
   - Guide Threshold prepares only Hub work.
   - Hub can prepare Grave, Vascular, and Silt work.
   - Comb preparation is not eligible until `hubThreeRouteConvergenceCompleted` (or the live convergence state) is true.
   - Direct `runNext()` remains deterministic for validators and synchronous fallback remains intact.

4. **Runtime/profile identity**
   - Added `ACT1_RUNTIME_PROFILE_HC013D`.
   - Active region authored data now references the HC-013D profile.
   - Added explicit performance policy metadata to the runtime profile.

## Locked / unchanged

- HC-013C Comb gameplay and six-filter synthesis.
- Comb visual/feel convergence geometry and state hierarchy.
- Grave, Vascular, and Silt route mechanics and retained consequences.
- Hub three-route convergence.
- Controller mappings.
- GateSystem crossing ownership.
- ObjectiveSystem observation ownership.
- Aperture Fields remain unmounted, gameplay-pending, and non-crossable.
- 20 compatibility systems remain dormant.

## Validation

- `npm run validate:transition-performance-consolidation` — pass.
- `npm run validate:current` — pass end to end.
- `npm run audit:undefined-methods` — pass as part of current chain.
- `npm run build` — pass.
- Compatibility archive validation — pass.

## Production bundle

HC-013C entry bundle: **1,527.69 kB minified / 380.74 kB gzip**.

HC-013D initial entry bundle: **1,459.34 kB minified / 363.19 kB gzip**.

Reduction in startup entry JavaScript: **68.35 kB minified / 17.55 kB gzip**.

Deferred chunks:
- RuntimeDiagnosticSummary: 10.27 kB / 3.89 kB gzip
- ChemistryDebugPanel: 26.48 kB / 8.34 kB gzip
- RecipeDebugOverlay: 35.68 kB / 11.06 kB gzip

The entry bundle still exceeds Vite's default 500 kB warning threshold. This remains an architectural warning, but HC-013D establishes the correct direction: move non-critical and region-specific work out of startup rather than deleting systems or flattening content.

## Recommended next pass

**HC-014A — Aperture Fields Arrival Boundary Foundation**

Keep it bounded to the transition/reveal/decompression area: dedicated field mount, scale/camera grammar, safe arrival footing, visible return logic, and distant ecology landmarks. Do not build full field ecology yet.
