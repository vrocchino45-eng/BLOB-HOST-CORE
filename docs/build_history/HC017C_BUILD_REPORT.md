# HC017C — Ambient Material / Micro-Interaction Baseline

## Mode
Convergence implementation.

## Purpose
Add low-cost material texture to traversal so empty space responds continuously to the Core.

## Added
- 42 recycled host-material motes around the player.
- Pulse scatters nearby motes using the existing 4.25 Pulse radius.
- Absorb attracts a compatible subset inside a restrained 2.4 visual-response radius.
- Compatible motes that reach the Core briefly bank/orbit as visual accumulation only.
- Stabilize organizes nearby motes into a calmer local band.
- Motes recycle around the Core instead of increasing world geometry or persistent object count.

## Explicitly not added
- no new objectives;
- no inventory or chemistry rewards;
- no route/gate conditions;
- no Core growth;
- no new verb authority;
- no world-area expansion.

## Locked
BondSystem, ChemObjectSystem, CoreVerbPhysicalizationSystem, movement, camera,
Grave, Vascular and Silt route systems remain byte-identical to HC017B.

## Acceptance
1. Normal traversal has subtle particulate life without obscuring authored landmarks.
2. Pulse visibly scatters nearby motes.
3. Absorb visibly draws only a subset inward.
4. Stabilize visibly orders nearby motes.
5. No micro-particle interaction can unlock, complete or advance anything.
6. Particle count remains fixed and bounded.
