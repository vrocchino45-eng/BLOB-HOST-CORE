# HC-006G — Guide Threshold Traversal Lock

## Mode
Convergence lock.

## Purpose
Turn the HC-006F prototype into a stable movement-led traversal without changing its authored meaning or destination.

## Ownership

```text
GuideThresholdLayeredInteractionSystem
→ ScarFlowInteractionSystem compatibility state
→ SecondLocalCellMorphSystem continuous handoff
```

The persistent inspection camera may frame the interaction but does not own progression or the milestone handoff.

## Runtime changes

### Local path truth
Player direction is compared with the tangent of the nearest point on the curved current.

### Corridor truth
Alignment and sustain require the player to remain within the authored current corridor.

### Physical traversal truth
Sustain completion requires both:

- sufficient held resonance
- sufficient physical travel along the current

Elapsed time outside the current no longer counts.

### Endpoint truth
Release-and-settle uses distance to the authored endpoint rather than a broad moving focus test.

### Readability assist
After a sustained stall, the current brightens and the corridor tolerance widens modestly. It never advances state by itself.

### Pulse ownership
Optional X pulses during traversal are consumed by the active owner and recorded in the input audit, but they do not complete alignment or traversal.

## Locked systems

- Surface Wake layered lesson
- persistent inspection camera
- camera-relative planar movement
- Signal Chorus layered interaction
- Grave route and return chain
- HC-006F stage order and no-gate outcome

## Forbidden scope

- Hub or Signal Chorus rewrite
- Grave changes
- Comb Threshold
- Aperture Fields
- gate, door, teleport, branch menu
- automatic path completion
- forced camera
