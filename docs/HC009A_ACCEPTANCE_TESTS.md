# HC-009A Acceptance Tests

HC-009A should look and play like the frozen HC-008G reference. Its visible
proof is that only the active room owns runtime behavior.

## Complete slice

1. Start a fresh run in Surface Wake.
2. Complete the established Fold, protected-seed, and exit-seam sequence.
3. Traverse Guide Threshold through its established response and release.
4. Read all three Hub territories, read Grave Memory, return to center, and open
   Status.
5. Confirm the Hub objective completes and Grave Memory becomes crossable.
6. Confirm Vascular Rhythm and Silt Pressure remain dormant.

## Runtime mount proof

Open F1 in each room and confirm:

| Room | Gameplay owner | Presentation owner | Scoped budget |
|---|---|---|---:|
| Surface Wake | `LandingMode` | `SurfaceWakeEcologicalCausalitySystem` | 15 |
| Guide Threshold | `ThresholdMode` | `GuideThresholdLayeredInteractionSystem` | 13 |
| Hub Chamber | `HubMode` | `HubChamberFoundationSystem` | 8 |

The mount sequence must increase at each room transition. The compatibility
archive must report 20 retained systems and 0 registered systems.

## Inactive-room proof

1. While in Surface Wake, confirm Guide and Hub scoped systems are skipped.
2. On Guide arrival, confirm Surface Wake presentation settles and unmounts.
3. On Hub arrival, confirm Guide presentation settles and unmounts.
4. Confirm global input, Status, Objective, Gate, HUD, and diagnostic systems
   continue across all three rooms.
5. Confirm no Signal Chorus, Bloom, or Grave compatibility system initializes
   or updates during the slice.

## Regression guard

- Vertical traversal and camera-relative movement remain available.
- LT Stabilize and RT Absorb remain unchanged.
- View/Select, Menu/Start, and Tab still open Status.
- Surface Wake does not declare completion before seed absorption.
- Hub investigation does not depend on Signal Chorus runtime state.
- Grave crossability still comes only from ObjectiveSystem and GateSystem.
