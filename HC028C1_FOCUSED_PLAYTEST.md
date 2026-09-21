# HC028C1 Focused Playtest — Phase Architecture Visual Readability

## Purpose
Verify that 3→6→12 can be recognized from the Core itself rather than from debug text.

## Test
1. Start in an ordinary playable area with the Core visible at normal camera distance.
2. Do **not** open F1 at first.
3. Press `O` once: 3-phase → 6-phase.
4. Press `O` again: 6-phase → 12-phase.
5. Press `O` again: 12-phase → 3-phase.
6. Repeat once in close inspection/Core Work view.

## Expected visual read
- **3-phase:** three larger functional nodes form a clear triangle.
- **6-phase:** six nodes spread into a hexagon; matching functions oppose each other.
- **12-phase:** twelve nodes form a denser dodecagon with visibly finer phase resolution.
- Every architecture change gets a brief structural bloom; the Core should visibly reconfigure instead of merely adding faint dots.
- The currently firing phase remains the brightest/largest node.

## Acceptance
PASS if, without reading the HUD, the player can correctly identify 3 vs 6 vs 12 after one or two cycles of `O`.

FAIL if:
- 6 looks like "3 plus a few dots",
- 12 looks like undifferentiated sparkle/noise,
- the outline overwhelms the authored Core body,
- the phase change is only obvious in Core Work view.

## Locked behavior check
- O remains debug-only.
- No movement, verb, chemistry, progression, Vascular rhythm or route behavior should change between architectures.
