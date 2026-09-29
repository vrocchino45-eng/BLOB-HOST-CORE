# HC031T6 — Adjacent Territory Runtime Mount Lock

Parent: HC031T5 — Ridge Trace + Canonical Gathering Ground Lock  
Version: 0.31.47  
Telemetry: `blob.session.telemetry.v1.46` (unchanged schema)

## Why this pass exists
The HC031T5 playtest proved the Ridge correctness repair: telemetry recorded all three Membrane Ridge contour reads and one Ridge completion. However Gathering Ground remained at zero observations, zero relationships, zero traversal openings, and zero entries.

The runtime audit found the ownership defect: `GameRuntime` registered `apertureAdjacentTerritorySystem` with `runtimeScope: active_region`, but the active `act1RuntimeProfile_HC016M.json` Aperture `systemIds` list omitted that system. `SystemRegistry` therefore skipped it every frame because it was absent from `firstSliceRuntimeMount.activeSystemIds`.

## HC031T6 changes
- Add `apertureAdjacentTerritorySystem` to `aperture_fields.systemIds`.
- Raise Aperture `activeUpdateBudget` from 9 to 10 (6 shared + 4 local).
- Update Aperture gameplay/presentation ownership metadata to include `ApertureAdjacentTerritorySystem`.
- Explicitly mark adjacent-territory runtime ownership in the profile.
- Add `validateHC031T6AdjacentTerritoryRuntimeMount.mjs`, which exercises the actual `ModeController` mount publication and `SystemRegistry` active-region gate.
- Make the HC031T5 validator successor-compatible so its Ridge/canonical-Gathering invariants remain enforced under HC031T6.

## Locked
Unchanged in this pass:
- Membrane Ridge gameplay and T5 any-order physical-distance tracing
- Aperture movement bounds
- PlayerMovementController
- TargetingSystem / TargetFocusRegistry
- Signal Plain gameplay
- Gathering Ground geometry and canonical z=-56 identity
- Controller mappings
- Chemistry / Objective ownership
- Session telemetry event/schema structure

## Validation
`npm run validate:current` passes, including:
- HC031T6 runtime mount regression
- HC031T5 Ridge/canonical Gathering regression
- HC031T5 30/60/120/144 FPS trace smoke
- undefined-method audit
- RecipeData load validation
- JS syntax checks for the affected ownership path
