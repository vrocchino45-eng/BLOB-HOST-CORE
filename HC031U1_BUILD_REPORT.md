# HC031U1 BUILD REPORT — Gathering Ground Alive Startup Lifecycle Hotfix

Parent: HC031U — Gathering Ground Alive Pass 1  
Version: 0.31.49  
Telemetry: `blob.session.telemetry.v1.47` (unchanged)  
Scope: startup lifecycle only

## Failure reproduced

HC031U constructed `GatheringGroundAliveSystem` inside `createEntitySystems()`. At that point `EntitySystem` existed, but `ApertureFieldsArrivalSystem` did not: Aperture owners are created later inside `createFirstSliceArchitecture()`. The Alive constructor correctly rejected the missing dependency and runtime boot stopped on the red error screen.

## Repair

- Removed `GatheringGroundAliveSystem` construction from `createEntitySystems()`.
- Construct it inside `createFirstSliceArchitecture()` immediately after `ApertureAdjacentTerritorySystem`, when both required owners exist.
- Kept the constructor dependency assertion strict; no nullable fallback or delayed hidden mutation was added.
- Added `validateHC031U1StartupLifecycle.mjs` to lock this order.

## Frozen from HC031U / HC031T6

No changes to:
- six Gathering Ground encounters or their timings;
- `GatheringGroundAliveSystem` gameplay behavior;
- PlayerMovementController;
- Aperture bounds / Ridge 3-of-3 law;
- TargetingSystem;
- Signal Plain;
- controls / input;
- Vascular / Silt;
- telemetry schema.

## Validation

`npm run validate:current` PASS:
- HC031U1 lifecycle regression PASS;
- HC031U ecology validation PASS;
- deterministic Gathering Ground encounter smoke PASS — 6/6;
- HC031T5 Ridge trace smoke PASS at 30/60/120/144 FPS;
- undefined-method audit PASS;
- RecipeData load PASS;
- JS syntax checks PASS.

Production Vite bundling is not used as the acceptance gate in this Linux workspace because the recovered Windows `node_modules` lacks Rollup's Linux optional native package. The delta does not include `node_modules` or dependency changes.
