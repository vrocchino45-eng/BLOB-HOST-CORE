# HC031S + HC031T Combined Acceptance Playtest

## Purpose
Confirm the two passes in dependency order before expanding the living Host world.

---

## Pass A — HC031S Silt Pressure Relationship Currentization

### Fast entry
Press **Shift+6**.

### Sequence
1. Enter / reset Silt.
2. Move into the first low-rib pressure-reading band.
3. Pulse alone once; it must **not** award the pressure read.
4. Hold Stabilize briefly.
5. While still holding Stabilize, Pulse once.
6. Keep Stabilize held and confirm the living ribs continue opening from the same relationship.
7. Release Stabilize after the ribs are open.
8. Approach one dark packed-residue body and hold Absorb long enough to trigger one squeeze.
9. Confirm the route compresses without erasing the earlier pressure read / rib brace.
10. Hold Stabilize until the passage recovers.
11. Deliberately move to the warm porous body and hold Absorb.
12. Confirm porous matter is accepted while both dark packed bodies remain.
13. Reach the deep pressure organ and let the route settle into `return_breath`.
14. Follow the return fold toward Hub if convenient.
15. Export telemetry with **Shift+T**.

### S acceptance telemetry
- exactly 1 `silt.pressure_relationship_read`
- `action: stabilize_then_pulse`
- `pulseAloneCanReadPressure: false`
- exactly 1 `silt.selective_draw.completed`
- selection `porous_nutrient`
- packed residue remains intact
- exactly 1 `silt.relationship_route.completed`
- completion retains `pressure_density`
- route resolves to `return_breath`
- zero `movement.progress_blocked` events

### S feel check
The interaction should read as one continuous physical grammar: catch pressure with Stabilize, send Pulse through the relationship, keep that hold to brace, then physically choose what Absorb acts on.

---

## Pass B — HC031T Open Territory / Adjacent Host Proof

### Fast entry
Press **Shift+8**.

### Sequence
1. Complete the existing Signal Plain local ecology interaction.
2. Move toward Membrane Ridge and begin / complete its three living contours.
3. While Gathering Ground is still distant, look toward the large cluster downfield.
4. Pulse it from distance 1–3 times and confirm the body visibly answers / resolves.
5. Keep the camera aimed at it and hold Stabilize for about one second.
6. Optional: while the remote relationship is established, hold Absorb briefly; only a weak inward answer should occur.
7. Finish Membrane Ridge if needed.
8. Confirm connective living strands become clearer and the old ghost boundary no longer contains the player.
9. Travel physically downfield with **no teleport, fade, hard gate, or active-cell swap**.
10. Enter Gathering Ground and confirm its local anatomy becomes substantially more legible.
11. Turn around and verify Arrival Shelf / Signal Plain / Membrane Ridge still exist behind you.
12. Export telemetry with **Shift+T**.

### T acceptance telemetry
Desired chain:
- `world.adjacent_territory.observed`
- `world.adjacent_territory.relationship_established`
- `world.adjacent_territory.traversal_opened`
- `world.adjacent_territory.entered`

Important invariants:
- `activeCellId` remains `CELL_APERTURE_FIELDS_ARRIVAL_001`
- no movement block from the old Aperture bound after traversal opens
- no new destination commit / gate interaction
- no player-position teleport

## Lock decision
If both passes work and feel intentional, treat this package as the clean HC031T checkpoint. The next build phase can then focus on making the continuous Host space feel alive through a bounded first set of encounters before running deterministic testing-bot sessions.
