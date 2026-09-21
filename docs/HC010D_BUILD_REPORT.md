# HC-010D Build Report

## Outcome

HC-010D repairs the live Grave approach blocker proven after HC-010C. The fourth region was rebased from the Hub Grave threshold while `PlayerMovementController` still clamped all movement to an ellipsoid centered on world origin. Because the threshold sits near the negative-Z edge of that ellipsoid, the first Grave object was spawned outside the reachable movement volume.

## Ownership repair

- `GraveMemoryRouteSystem` publishes one entry-anchored boundary center and authored radii as regional physical tuning.
- `PlayerMovementController` remains the sole collision and boundary-response owner.
- `GateSystem` still preserves player position during entry and return.
- The route system does not clamp, relocate, teleport, or directly mutate progression.
- The shared first-slice boundary returns when Grave unmounts.

## Verified geometry

At the authored Hub Grave gate `[0.12, 0.2, -4.4]`, the old Core husk appears at approximately `[-1.23, 0.05, -6.55]`. That point lies outside the historical origin-centered boundary with Z radius `4.8`. HC-010D centers a `[4.25, 3.1, 6.8]` ellipsoid on the preserved Grave entry position, placing all four objects inside the playable pocket without changing their authored offsets.

The focused simulation used ordinary camera-relative thrust, acceleration, drag, and boundary response. It reached all four object centers to within `0.65–0.67` units with maximum per-frame displacement below `0.045` and then confirmed that Pulse reads were consumed.

## Locked scope

- No interaction range changes.
- No new system, route, cell, ability, entity, objective, or gate.
- No player relocation.
- Region budgets remain `15 → 13 → 8 → 7`.
- All 20 compatibility systems remain dormant.
