# HC-028N Build Report — Ecological Residue / Local Host Memory

## Mode
Bounded ecological world-memory proof.

## Purpose
Extend HC-028M1's readable causal chain by allowing a completed meaningful organism interaction to leave one faint, temporary Host-matter trace at the interaction site for roughly 20–45 seconds.

## Implementation
- Added `EntityEcologicalResidueSystem`.
- Uses the existing entity reciprocal-memory `commitCount` to capture the interaction site and signature.
- Residue does **not** begin while HC-028K/M/M1 immediate ecology is still active.
- Once immediate ecology finishes, a world-space-frozen, cell-scoped residue is activated.
- At most one residue per current authored organism (Tender + Watcher), maximum two total.
- Residues decay continuously, including while another cell is active.
- `AmbientMaterialInteractionSystem` remains the sole owner of the existing 66 Host motes and consumes the residue directive on the following frame.
- Tender/Watcher residue signatures remain role-specific but faint.
- Telemetry advances to `blob.session.telemetry.v1.15` with `ecology.entity_ecological_residue.changed`.

## Runtime files changed from HC-028M1
- `src/core/GameRuntime.js`
- `src/core/SessionTelemetrySystem.js`
- `src/ecology/EntityEcologicalResidueSystem.js` (new)
- `src/main.js`
- `src/world/AmbientMaterialInteractionSystem.js`

## Locked
103 HC-028M1 runtime owners are hash-locked, including:
- `EntitySystem`
- `EntityRelationshipGrammarSystem`
- `EntityReciprocalMemorySystem`
- `EntityReciprocalBehaviorSystem`
- `EntityLocalMatterCouplingSystem`
- `CameraReadabilitySystem`
- `PlayerMovementController`
- `LocalCellBoundaryMorphSystem`
- chemistry, route, Hub, Core-verb and composition owners.

## Explicit non-authority
No residue system authority for save state, affinity, player/entity movement, collision, chemistry, bond, repair, combat, targeting, progression, or routes. No new particle field, geometry, draw call, control, entity type, or objective.

## Validation
See `scripts/validateHC028NEcologicalResidueLocalHostMemory.mjs`. Browser/Vite render is not claimed unless local dependencies are present and executed separately.
