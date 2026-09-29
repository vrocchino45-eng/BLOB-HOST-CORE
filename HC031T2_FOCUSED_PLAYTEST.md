# HC031T2 — Focused Playtest

## Purpose
Verify that Shift+8 no longer shifts Membrane Ridge / Gathering Ground away from the visible Aperture field.

## Test
1. Press **Shift+8**.
2. Complete Signal Plain normally.
3. Move toward Membrane Ridge. The three contours should now occupy the visible Ridge area rather than being displaced farther downfield.
4. Trace contours 1 → 2 → 3. You should not need to force against the outer ellipsoid to find them.
5. Look toward the visible Gathering Ground body/rings and Pulse 1–3 times. The GG debug read should advance to `OBS`.
6. Hold Stabilize while keeping Gathering Ground in view. `REL` should become `Y`.
7. Finish the third Ridge contour. GG should change from `CLOSED` to `OPEN`.
8. Physically approach Gathering Ground. No gate, fade, teleport, or active-cell swap.
9. Export with **Shift+T**.

## Acceptance
- Adjacent observations >= 1
- Adjacent relationship = 1
- Traversal opening = 1
- Physical entry = 1
- The three Ridge contours are visibly/reachably aligned with the existing Aperture composition
- Boundary clamps should no longer form a repeated search pattern caused by displaced contours
- activeCellId remains `CELL_APERTURE_FIELDS_ARRIVAL_001`
