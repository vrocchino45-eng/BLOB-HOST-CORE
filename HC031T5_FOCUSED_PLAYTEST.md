# HC031T5 Focused Playtest

## Goal
Prove one continuous Aperture handoff:

Signal Plain → three Membrane Ridge reads → Ridge COMPLETE / OPEN → canonical visible Gathering Ground attention → Pulse observations → Stabilize relationship → physical entry.

## Run
1. Start current HC031T5 build.
2. Press `Shift+8` for Open Inquiry / Signal Plain.
3. Complete Signal Plain normally.
4. Confirm HUD shows `RIDGE 0/3`.
5. Enter any bright Membrane Ridge contour and move through it slowly. Do not worry about speed or order.
6. Confirm HUD becomes `RIDGE 1/3` when that contour settles.
7. Trace either remaining contour next. Confirm `RIDGE 2/3`.
8. Trace the final unread contour. Confirm `RIDGE 3/3 COMPLETE` and `GG ... OPEN`.
9. Stop briefly and watch the Ridge release response/connective anatomy.
10. Look directly at the same visible Gathering Ground body that has always existed beyond the Ridge. `Target` should become `gathering_ground_cluster` / GG should show `ATTN`.
11. Pulse the body deliberately 1–3 times. Confirm `OBS1 → OBS2 → OBS3`.
12. Hold Stabilize on the same body for about one second. Confirm `REL Y`.
13. Physically move down the opened connection and enter Gathering Ground. No teleport, fade, gate, or active-cell swap should occur.
14. Press `Shift+T` and upload the JSON.

## Acceptance
- `membraneRidgeContourReads = 3`
- `membraneRidgeCompletions = 1`
- third read visibly causes `OPEN`
- Gathering Ground attention resolves on the existing visible body
- `adjacentTerritoryObservations >= 1` (target: 3)
- `adjacentTerritoryRelationships = 1`
- `adjacentTerritoryTraversalOpenings = 1`
- `adjacentTerritoryEntries = 1`
- same active Aperture cell throughout the neighboring-territory entry
- no teleport/gate transition

If the HUD reaches `RIDGE 3/3 COMPLETE` but `Target` remains `none` while the visible Gathering Ground body is centered, export immediately with `Shift+T`.
