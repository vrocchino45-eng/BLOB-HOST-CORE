# HC-004QH — Grave Route Phase Ownership Repair

## Verified screenshot contradiction

The HC-004QG full-debug screenshot reported all of the following at once:

- active cell: `CELL_GRAVE_MEMORY_RESIDUE_BED_001`
- owner: `GraveSeamContinuityMicroExitSystem`
- stage: returned to Grave bed
- progress: `0%`
- complete: `no`
- expected target: `closed_inheritance_suture_001`
- actual target: `residue_silt_cloud_001`

A transition cannot be both returned and never started. This proved a phase-ownership contradiction rather than a controller or targeting failure.

## Root causes

1. `GraveArrivalReadabilitySystem` treated the permanently completed Bloom-to-Grave morph as permission to force `activeCellId` back to the Grave bed every frame.
2. `GraveScarMemorySeamArrivalSystem` did not retain the seam cell after arrival completion.
3. `GraveSeamContinuityMicroExitSystem` treated ordinary presence in its destination cell as proof that the fold-back had completed, even though the Grave bed is also visited before the seam.
4. Earlier Grave read/stability/readiness layers remained eligible after downstream seam ownership began.

## Repair

- Initial Grave arrival owns only the first Grave-bed phase.
- Seam arrival retains `CELL_GRAVE_SCAR_MEMORY_SEAM_001` until a verified micro-exit handoff occurs.
- Destination-cell presence alone no longer activates or completes the micro-exit.
- Only a real completed fold-back publishes `handoffComplete=true`.
- Seam arrival then relinquishes ownership.
- Earlier Grave layers yield after seam ownership begins.
- `GraveBedPostSeamResponseSystem` takes ownership using the durable handoff token.

## Locked scope

No gate, door, teleport, old exit registry, stage-node loader, branch menu, new route, combat, dialogue tree, quest log, or Act expansion was added.
