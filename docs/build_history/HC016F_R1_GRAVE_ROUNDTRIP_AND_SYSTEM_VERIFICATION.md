# BLOB: HOST CORE — HC016F

## Mode
R1 ARCHITECTURE MIGRATION + SYSTEM VERIFICATION.

## Grave migration
Hub <-> Grave now uses morph/local-cell transition ownership in both directions. Grave gameplay itself is unchanged.

The return preserves memory thread, safe transfer, imprint, trace integrity, risk count, recoil recovery, Grave return history, and the route-contract wake state.

## Current Hub route ownership
All six route boundaries are now Gate-observer-only:
- Hub -> Grave
- Grave -> Hub
- Hub -> Vascular
- Vascular -> Hub
- Hub -> Silt
- Silt -> Hub

Remaining Gate-owned macro boundaries:
- Hub <-> Comb
- Comb <-> Aperture

## Verification finding: activeCellId has more writers than GateSystem
The audit found legitimate true assignments in several older morph/arrival systems. They are now classified rather than hidden:

### Authoritative/current
LocalCellMorph, SecondLocalCellMorph, and the six temporary Hub-route morph adapters.

### Initialization/safety
GameRuntime initialization and FirstSliceTransitionCoordinator rollback protection.

### Explicit debug bypass
DebugAreaJumpSystem.

### Compatibility
GateSystem, temporarily retained for unmigrated Comb/Aperture boundaries.

### Legacy migration debt discovered
ThirdLocalCellMorphSystem, GraveRouteMorphSystem, SignalChorusReturnStateSystem,
GraveSeamContinuityMicroExitSystem, BloomResidueArrivalSystem, ScarFlowArrivalSystem,
SignalChorusArrivalSystem, GraveScarMemorySeamArrivalSystem, and GraveReturnContinuitySystem.

These are not silently treated as errors because several are existing morph owners, but they must be resolved in the R1 ownership consolidation. This is a new concrete audit result.

## Dependency-limited verification
The source ZIP intentionally does not contain node_modules. Validators importing `three` and `npm run build` cannot execute in this sandbox without installing dependencies. This is recorded as ENVIRONMENT_BLOCKED, not passed or failed.

One older source-ownership validator also encodes the pre-rebuild HC-006I/HC-014A authority expectation. It is now architecturally stale under the locked rebuild authority and must be replaced rather than used as a current acceptance gate.

## Next step
Do not create more route-specific morph classes. Consolidate the six proven Hub-route adapters into one recipe-driven `LocalCellBoundaryMorphSystem`, then retire those six temporary files/registrations. That should produce the first actual reduction in source duplication and active-system count before Comb/Aperture migration.
