# BLOB: HOST CORE — HC016L

## Mode
R1 ACTIVE-CELL OWNERSHIP AUDIT + DEAD SOURCE REMOVAL.

## Result
The remaining legacy transition debt was traced from the actual source tree.

Eight direct-mutation systems were no longer imported or registered by the live runtime and have been deleted:
- ThirdLocalCellMorphSystem
- GraveRouteMorphSystem
- SignalChorusReturnStateSystem
- GraveSeamContinuityMicroExitSystem
- BloomResidueArrivalSystem
- SignalChorusArrivalSystem
- GraveScarMemorySeamArrivalSystem
- GraveReturnContinuitySystem

One stale TargetFocusRegistry branch still named SignalChorusReturnStateSystem / GraveReturnContinuitySystem. It was dead compatibility logic rather than an import, and has also been removed.

`ScarFlowArrivalSystem` remains live because it still performs arrival presentation/staging. Its active-cell write was redundant: the system only runs when LocalCellMorphSystem has already completed and Scar Flow is already active. That write is removed.

## Remaining direct activeCell owners
Only six true mutation sites remain, all classified:
- LocalCellMorphSystem — authoritative Surface -> Guide morph
- SecondLocalCellMorphSystem — authoritative Guide -> Hub morph
- LocalCellBoundaryMorphSystem — authoritative recipe-driven later boundaries
- GameRuntime — initial boot cell
- FirstSliceTransitionCoordinator — safety rollback against illegal dormant preparation mutation
- DebugAreaJumpSystem — explicit developer bypass

Unclassified gameplay writers: **0**.

## Measured cleanup
- deleted legacy files: 8
- deleted legacy lines: 3403
- deleted legacy bytes: 142146
- JS files: 106 -> 98
- JS source bytes: 2032235 -> 1889468
- JS source lines: 47232 -> 43812
- direct activeCell mutation sites: 18 -> 6

## R1 direction
Transition ownership is now converged enough that the next likely source of hitching is not competing transition authority but **registered systems continuing to update outside their local scope**.

## Next
HC016M should audit all 47 current runtime registrations, determine which execute every frame versus region-scoped/dormant, and introduce update-budget telemetry plus safe inactive-system suppression where the existing SystemRegistry architecture permits it. No new gameplay should be added.
