# HC031T5 — Ridge Trace + Canonical Gathering Ground Lock

Parent: HC031T4 — Gathering Ground Attention Handoff
Version: 0.31.46
Telemetry: blob.session.telemetry.v1.46

## Why this pass exists
The HC031T4 playtest showed the player physically entering all three authored Membrane Ridge contour volumes, using Pulse/Stabilize heavily, and reaching the visible Gathering Ground vicinity, but the Ridge never completed and Gathering Ground never became an adjacent-territory relationship.

The audit found two correctness defects:

1. Membrane Ridge progress was gated by a per-frame displacement minimum (`moved >= 0.012`) and a hidden sequential contour order. Legitimate slow movement or out-of-order tracing could therefore look complete to the player while remaining incomplete in gameplay state.
2. Gathering Ground existed twice: the original visible landmark at local `(3.5, 8.5, -56)` and a second adjacent-territory body centered at `(3.5, 8.5, -62)`. The player could be looking at/reaching one visual noun while attention logic represented another.

## HC031T5 changes
- Membrane Ridge now accumulates deliberate physical path length with no minimum per-frame displacement threshold.
- The three Ridge contours are independent and can be read in any order.
- Each contour exposes persistent progress/read truth; completion requires all three reads.
- HUD exposes `RIDGE n/3` and `RIDGE 3/3 COMPLETE`.
- Telemetry adds:
  - `world.membrane_ridge.contour_read`
  - `world.membrane_ridge.completed`
  - summary counts `membraneRidgeContourReads`, `membraneRidgeCompletions`
  - movement-sample `ridgeState` and `adjacentTerritoryState`
- The original `gathering_ground_cluster` mesh at local `(3.5, 8.5, -56)` is now the canonical visible and attention root.
- The duplicate `gathering_ground_adjacent_ghost_body` runtime mesh is removed.
- T4 world-scale TargetingSystem behavior is retained unchanged.
- T2 canonical Aperture world anchor and T3 world-release response are retained.

## Locked systems
Unchanged and hash-locked in the T5 validator:
- PlayerMovementController
- SignalPlainEcologySystem
- TargetingSystem
- TargetFocusRegistry
- InputSystem
- ChemObjectSystem
- ObjectiveSystem

No new territory, encounter, controller mapping, chemistry rule, or movement retune was added.

## Validation
`npm run validate:current` passes.

Additional T5 smoke validates physical-distance accumulation at 30/60/120/144 FPS at a deliberately slow 0.35 units/sec and verifies non-sequential contour completion semantics.
