# HC018B — Multi-Verb Material-State Prototype

## Audit result
The pre-pass code audit found that Silt Pressure already contains the gameplay sequence
we planned to prototype: Pulse reads density, Stabilize braces compressed anatomy, and
Absorb distinguishes porous nourishment from packed residue. HC018B therefore does NOT
create a second state machine or duplicate those rules.

## Implementation
HC018B makes the existing Silt material-state sequence physically legible:

1. compressed_unread
2. Pulse -> density_revealed
3. Stabilize -> braced_and_open
4. Absorb safe porous matter -> porous_matter_received
5. released

- Pulse briefly scatters the route's existing suspended silt motes.
- The safe porous packet is compact/dim before the density read, then visibly emerges.
- Stabilize's existing rib-opening behavior remains the state-changing authority.
- Valid safe Absorb now produces a direct material stream from porous packet to Core.
- Packed residue visibly hardens/compresses during unsafe Absorb rather than resembling a reward.
- Completion and all route thresholds are unchanged.

## Locked
No changes to BondSystem, ChemObjectSystem, generic Core verb rules, movement, camera,
Grave, Vascular, route crossing, chemistry inventory, objectives or gate truth.

## Why Silt
This is the cleanest existing proof of the desired BLOB grammar:
observe matter -> infer its state -> apply a verb -> see matter change -> act on the new state.
