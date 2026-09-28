# HC031T Focused Playtest — Open Territory / Adjacent Host Proof

## Goal
Prove that the current Aperture map can expand continuously: a distant background body can be observed and interacted with before it becomes reachable, then becomes local space without a teleport or cell swap.

## Setup
Use the normal HC031S -> HC031T lineage.

For a focused test, press **Shift+8** to start at the Aperture / Signal Plain test platform. This is debug-only and does not mutate route progression.

## Test sequence
1. Complete the existing Signal Plain local ecology interaction normally.
2. Move toward Membrane Ridge and begin/complete its three living contours.
3. While Gathering Ground is still visibly distant, deliberately look toward the large cluster farther downfield.
4. Pulse it from distance 1–3 times. The distant body should visibly answer/resolve rather than behaving like inert scenery.
5. Keep the camera aimed at it and hold Stabilize for about one second. Its breathing/response should become more coherent.
6. Optional: while that remote relationship is established, hold Absorb briefly. You should get only a weak inward answer; the giant body must not jump toward the Core.
7. Finish Membrane Ridge if it is not already complete.
8. Watch for connective living strands toward Gathering Ground to become much more readable and for the old ghost boundary to stop containing you.
9. Travel physically downfield. There must be **no teleport, fade, hard gate, or active-cell swap**.
10. Enter the Gathering Ground cluster. Its local anatomy should become substantially more legible.
11. Turn around. The Arrival Shelf / Signal Plain / Membrane Ridge space you came from should still exist behind you as the neighboring/background world.
12. Export telemetry with **Shift+T**.

## Acceptance telemetry
Desired chain:
- one or more `world.adjacent_territory.observed`
- `world.adjacent_territory.relationship_established`
- `world.adjacent_territory.traversal_opened`
- `world.adjacent_territory.entered`

Important invariants:
- `activeCellId` remains `CELL_APERTURE_FIELDS_ARRIVAL_001` through the Gathering Ground approach.
- no movement-progress block should appear from the old Aperture bound once traversal opens.
- no new destination commit / gate interaction is required.
- no player-position teleport occurs.

## Feel questions
The telemetry can prove mechanics, but please judge these directly:
- Did the distant Gathering Ground feel like **real world you could eventually reach**, rather than a prop?
- Could you understand that Pulse was reading something much larger than a local object?
- Did Stabilize feel like establishing a relationship with that larger body rather than simply activating it?
- When the field opened, did the boundary feel like the world becoming available rather than a wall disappearing?
- Once inside Gathering Ground, did looking back make Aperture feel like one continuous place?

If those answers are mostly yes, this becomes the template for converting other ghost/background areas into real neighboring territory.
