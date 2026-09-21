# HC-011A Build Report

## Outcome

HC-011A promotes Vascular Rhythm from a verified destination contract into the second playable Hub route. It is a continuous circulation sequence built from existing movement, Pulse, and Stabilize verbs rather than a new ability, combat encounter, or trigger checklist.

## Play circuit

- A visible charge travels inward through authored vascular tissue.
- Three asymmetric valves expose separate cadence windows.
- A well-timed Pulse reads the active valve and advances synchronization.
- An off-beat Pulse or contraction can scatter cadence integrity and raise turbulence.
- Holding Stabilize through the contraction reweaves integrity and restores a readable charge.
- After three reads and deep-route synchronization, the circulation direction reverses.
- The player follows the reversed current back to the remembered entry fold and returns through `GateSystem`.

## Ownership

- `VascularRhythmRouteSystem` owns route-local circulation, cadence, risk, recovery, synchronization, reversal, and visual state.
- `PlayerMovementController` remains the sole movement-boundary response owner.
- `ObjectiveSystem` owns route completion truth.
- `GateSystem` owns entry, return, player-position preservation, and generic route history.
- `Act1RouteContractSystem` retains the shared mounted-destination and remembered-fold foundation.

## Correctness repair

The focused route proof exposed a generic persistence defect: route history was derived from the first entry-gate requirement, which for Vascular is the already-completed Grave objective. `GateSystem` now resolves each route's own objective from the route contract. Vascular therefore remains incomplete on entry and becomes complete only after its circulation proof.

## Scope boundary

Silt Pressure remains mounted and wakes beside Vascular after Grave return, but its `playableReady` state stays false. HC-011A adds no Silt gameplay, new ability, entity, class, combat rule, input, or cell.

## Verification

- Focused forced-failure/recovery Vascular proof: passed.
- Cadence proof: `3/3` reads over ordinary frame-sized movement.
- Gate proof: Hub → Vascular → synchronized return → Hub, with player position preserved.
- Complete inherited Surface, Guide, Hub, Grave, route-contract, controller, recipe, and archive chain: passed.
- Production compile: passed.
- Served browser index and exact hashed asset: passed.
- Production asset: `assets/index-vW4DtkQE.js` (`1,398,123` bytes).
- Served markers: `HC-011A`, `ACT1_RUNTIME_PROFILE_HC011A`, and `VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A`.
- Final archive integrity and embedded-contract verification: passed at release packaging.
- Only build note: the retained non-blocking Vite chunk-size warning.

## Successor

`HC-011B` should add a readable retained Vascular consequence to the existing Core and Hub owners without changing the route circuit or opening Silt.
