# HC018C — Traversal Material Interaction

Derived from the HC017E full-playthrough analysis and the HC018 plan.

## Purpose
Make an existing route react to Core verbs during traversal, not only at discrete trigger objects.

## Implementation: Vascular
Vascular already owns directional current through `frameState.physicalFeel`, which the locked
PlayerMovementController consumes. HC018C extends that existing route-owned material behavior:

- **Pulse**: a short pressure surge strengthens and visually accelerates the current.
- **Absorb**: while held inside the living current, suspended current matter draws toward the Core
  and the local current is modestly sheared/damped.
- **Stabilize**: while already valid/held in the current, lateral turbulence and current force calm,
  producing a more controllable temporary lane.

These responses are bounded and reversible. They do not unlock anything and are not new completion requirements.

## Locked
- PlayerMovementController
- cadence windows/read counts
- synchronization/completion thresholds
- BondSystem/ChemObjectSystem
- chemistry inventory/composition
- Grave and Silt route logic
- camera
- route crossing / active cell / objective truth
- Core scale

## Acceptance target
While simply moving through Vascular, the player should be able to feel and see:
Pulse = surge the current; Absorb = draw/shear local suspended matter; Stabilize = calm the current.
The route must remain completable exactly as before.
