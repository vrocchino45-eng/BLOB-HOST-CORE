# HC031T6 Focused Playtest

## Goal
Prove that the already-built Gathering Ground system is now actually mounted after the Ridge completes.

## Run
1. Start HC031T6.
2. Press `Shift+8` for Open Inquiry / Signal Plain.
3. Complete Signal Plain normally.
4. Trace the three Membrane Ridge contours in any order. Confirm `RIDGE 3/3 COMPLETE`.
5. At the third read, stop briefly. The route should now report/open Gathering Ground because the adjacent-territory owner is active.
6. Look toward the canonical visible Gathering Ground body. `Target` should resolve to `gathering_ground_cluster` / GG should show attention.
7. Pulse it deliberately. Confirm `OBS1 -> OBS2 -> OBS3`.
8. Hold Stabilize on the same body for about one second. Confirm `REL Y`.
9. Physically continue into Gathering Ground without teleport, fade, gate, or active-cell swap.
10. Press `Shift+T` and upload the JSON.

## Acceptance
- `membraneRidgeContourReads = 3`
- `membraneRidgeCompletions = 1`
- `adjacentTerritoryTraversalOpenings = 1`
- `adjacentTerritoryObservations >= 1` (target 3)
- `adjacentTerritoryRelationships = 1`
- `adjacentTerritoryEntries = 1`
- same active Aperture cell during neighboring-territory entry
- no teleport/gate transition

If `RIDGE 3/3 COMPLETE` occurs but `adjacentTerritoryTraversalOpenings` remains zero, export immediately; that would indicate a different runtime execution defect beyond the fixed mount list.
