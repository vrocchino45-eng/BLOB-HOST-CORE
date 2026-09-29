# HC031T1 — Focused Playtest

## Purpose
Retest only the HC031T failure: reachability around Membrane Ridge / Gathering Ground and truthful tendril detachment.

## Fast entry
Use **Shift+8**. This remains a debug-only Aperture / Signal Plain setup and does not mutate route history.

## Test — about 4–6 minutes
1. Complete Signal Plain normally.
2. Move toward Membrane Ridge. If you touch the outer movement envelope, verify no tendril sucker remains visibly planted unless there is a real authored surface under it.
3. Trace all three Membrane Ridge contours. Pay special attention to contour 3: you should have room to move around/through it instead of feeling pinned against an invisible wall.
4. Before finishing the ridge if convenient, or while working through it, look toward the large Gathering Ground body. The debug HUD shows `GG d… aim… OBS… REL… CLOSED`.
5. Aim at any clearly visible part of the large body/rings until `aim` shows **LOCK**, then Pulse 1–3 times. `OBS` should increment.
6. Keep the body in view and hold Stabilize for about one second. `REL` should become **Y**.
7. Finish the final Membrane Ridge contour. The HUD should change from **CLOSED** to **OPEN** and connective anatomy should become more legible.
8. Travel physically into Gathering Ground. Do not use a gate, fade, or teleport.
9. Turn around and confirm the earlier Aperture space still exists behind you.
10. Export telemetry with **Shift+T**.

## Human feel questions
- Did contour 3 finally have enough maneuvering room?
- Did any tendril look attached when movement felt free?
- Did aiming at the *body/rings* feel like aiming at Gathering Ground, rather than hunting an invisible point?
- Did the world opening after the ridge feel like more Host becoming available rather than a level transition?

## Telemetry acceptance
Expected in the focused run:
- `adjacentTerritoryObservations >= 1`
- `adjacentTerritoryRelationships == 1`
- `adjacentTerritoryTraversalOpenings == 1`
- `adjacentTerritoryEntries == 1`
- active cell remains `CELL_APERTURE_FIELDS_ARRIVAL_001` throughout Gathering Ground entry
- no teleport event
- ideally zero `movement.boundary_clamped` events during the intended ridge path; if one occurs, its mode/position should identify exactly where

HC031S does not need another forced retest unless you want to revisit its feel; the previous telemetry already hit its three mechanical acceptance events.
