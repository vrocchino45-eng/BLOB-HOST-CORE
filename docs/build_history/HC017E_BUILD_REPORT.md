# HC017E — Environmental Response / Gameplay Density Lock

## Mode
Final pre-playthrough convergence pass.

## Purpose
Give the space between explicit interactions more physical feedback without adding
a new objective, economy, route, gate, or HUD layer.

## Added
- Core proximity wake: nearby ambient material gently gives way as the Core travels.
- Travel carry: close motes receive a small movement-direction influence.
- Existing interaction-assist anchors subtly gather a sparse subset of motes around
  a nearby interactable, producing world-space biological signposting rather than
  an icon or arrow.
- HC017D region material profiles remain active.
- Pulse / Absorb / Stabilize micro-material behavior remains intact.

## Performance
- still exactly 42 ambient motes;
- no new persistent particle population;
- no scene traversal;
- no raycasts;
- no per-particle object allocation in the update loop.

## Locked
Runtime ordering, route systems, BondSystem, ChemObjectSystem, Core verb physicalization,
movement controller, camera, chemistry truth, gates, progression and Core scale.

## Playthrough checkpoint
Do not add another gameplay layer after this pass before the full current playthrough.
The next build decision should come from whole-run pacing/readability analysis.
