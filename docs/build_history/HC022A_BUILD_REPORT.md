# HC022A — Micro-Play Ecology & Inspection Intent

## Mode
Implementation / convergence.

## Micro-play
The existing 66-point ambient field is reused; mote count is NOT increased and no new particle system or geometry layer is added.

Six reusable optional micro-behavior families now live inside that same field:
1. suspension,
2. current-riders,
3. settling residue,
4. reactive spores,
5. Pulse echo motes,
6. Stabilize sorting grains.

These are toys / learning opportunities, not objectives. Pulse echo motes briefly answer the player after scattering. Sorting grains reveal density bands when Stabilized. Existing regional profiles continue to remix the same families.

## Performance safeguards
- ambient count remains 66;
- no additional renderer/particle system;
- region profile objects are reused instead of allocated each frame;
- interaction-anchor Vector3 allocation removed;
- per-frame Array.from/filter telemetry scans removed;
- ecology counts are precomputed;
- ecology-memory count is collected inside the existing update loop.

## Y inspection fix
Tight inspection no longer automatically locks to any authored object merely because it is nearby.

An authored focus must now either:
- match the currently targeted object, or
- lie inside the player's view-intent cone.

Moving the camera while an authored lock is active immediately releases that lock back to player-forward inspection for a short manual-override window.

Y therefore means **enter inspection mode**, not **accept whichever nearby authored focus currently owns the region**.

## Locked
Movement, verbs, collision, chemistry, route completion, Core anatomy, gates, objectives, region count, and HC021 mechanical composition remain unchanged.
