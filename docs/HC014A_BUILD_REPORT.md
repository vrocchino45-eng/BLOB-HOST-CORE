# BLOB: HOST CORE — HC-014A Build Report

## Pass
Aperture Fields Arrival Boundary Foundation

## Purpose
Turn the completed Comb synthesis into the first true field-scale crossing without prematurely building Act 2 ecology. HC-014A establishes only the boundary, decompression shelf, field camera/movement grammar, retained return path, and distant ecology readability.

## Implemented

1. **Gate-owned Comb → Aperture crossing**
   - `comb_threshold_to_aperture_fields` is now a mounted `foundation_bound_threshold`.
   - It wakes only after `combThresholdPlayableCompleted`.
   - Crossing requires the existing Stabilize + Pulse posture at the opened Comb seal.
   - `GateSystem` remains the only owner of active-cell mutation and crossing history.

2. **Dedicated Aperture arrival mount**
   - Added `ApertureFieldsArrivalMode`.
   - Added region-scoped `ApertureFieldsArrivalSystem`.
   - Added `CELL_APERTURE_FIELDS_ARRIVAL_001`, camera, visual-language, objective-read, and runtime-profile records.
   - Active update budget is 7 and the arrival mount contains exactly one local region system.

3. **Field-scale decompression grammar**
   - Broad low-detail arrival shelf replaces chamber-strip composition.
   - Movement bounds expand to an entry-anchored ellipsoid with radii 13.5 × 6.0 × 18.0.
   - Camera opens to the HC-014A field-arrival profile (distance 10.8, FOV 66).
   - Seven membrane ridges establish depth and scale without becoming gameplay gates.

4. **Distant ecology promise, not ecology gameplay**
   - Three distant landmarks are visible/readable: Signal Plain beacon, Membrane Ridge arc, and Gathering Ground cluster.
   - `fullEcologyMounted` remains false.
   - `ecologyGameplayReady` remains false.
   - No entities, nutrients, crafting, combat, orbiters-as-gameplay, factions, or new base verbs were added.

5. **Retained return boundary**
   - Added a three-part Aperture return fold.
   - `aperture_fields_to_comb_threshold` is owned by GateSystem and uses the existing interact input.
   - Entry and return preserve Core position; presentation code cannot relocate the player.

6. **Persistent boundary history**
   - Gate history now records Aperture entry/return booleans and counts.
   - These fields survive `createHistorySnapshot()` / `restoreHistory()`.
   - Comb completion history now reflects the active HC-014A runtime profile instead of incorrectly stamping Aperture as unmounted.

7. **Transition preparation**
   - Completed Comb makes `comb_to_aperture` preparation eligible.
   - Aperture arrival geometry can prepare hidden before the crossing without mounting gameplay or changing progression.
   - HC-013D boundary-aware preparation and deferred debug-panel behavior remain intact.

## Locked / unchanged

- Surface Wake → Guide Threshold → Hub first slice.
- Grave Memory route and retained consequence.
- Vascular Rhythm route and retained consequence.
- Silt Pressure route and retained consequence.
- HC-012C three-route Hub convergence.
- HC-013B Comb six-filter synthesis mechanics.
- HC-013C Comb visual/feel hierarchy.
- Canonical controller mapping.
- PlayerMovementController movement ownership.
- ObjectiveSystem observation ownership.
- All 20 compatibility systems remain dormant.

## Explicitly not implemented

- Full Aperture Fields ecology.
- Interactive Signal Plains / Membrane Ridges / Gathering Grounds.
- Act 2 progression completion.
- Field crafting, entities, combat, factions, new nutrients, new orbiters, or a new base verb.
- A new cinematic system or forced camera takeover.

## Validation

- `npm run validate:aperture-fields-arrival` — pass.
- `npm run validate:current` — pass end to end.
- `npm run audit:undefined-methods` — pass as part of current chain.
- Recipe-data and compatibility-archive validation — pass.
- Production `npm run build` — pass.

The HC-014A proof verifies that the boundary is blocked before Comb completion, crosses through GateSystem after synthesis, mounts the dedicated field-arrival mode/system, preserves wide field bounds and three landmarks, keeps full ecology off, returns through GateSystem, and restores Aperture entry/return history from a snapshot.

## Production bundle

Initial entry bundle: **1,470.42 kB minified / 365.51 kB gzip**.

Deferred developer chunks remain separate:
- RuntimeDiagnosticSummary: 10.27 kB / 3.89 kB gzip
- ChemistryDebugPanel: 26.48 kB / 8.34 kB gzip
- RecipeDebugOverlay: 35.68 kB / 11.06 kB gzip

The initial bundle still exceeds Vite's default 500 kB warning threshold. HC-014A adds only a bounded arrival foundation; broader Act 2 ecology should continue to be region-scoped/code-split rather than folded into startup.

## Recommended next pass

**HC-014B — Aperture Arrival Feel / Scale Lock**

Target-device playtest the actual Comb → Aperture transition, open-space camera, movement speed, landmark legibility, return-fold readability, and sense of decompression. Refine those without adding ecology. Only after that feel is locked should the first small ecology circuit be mounted.
