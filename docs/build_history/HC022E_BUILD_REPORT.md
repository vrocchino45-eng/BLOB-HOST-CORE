# HC022E — World Response Legibility

## Mode
Feel / readability convergence. No new gameplay authority.

## Purpose
The HC022 interaction rules already existed, but too much of their meaning could live in state/debug text. This pass makes the existing world physically *show* the difference between verbs.

### Existing-field signatures
- Scan / Interact: brief field "breath" — attention/read without displacement.
- Pulse: outward disturbance followed by a visible ringing wake.
- Stabilize: motion damps into calmer, more ordered local behavior.
- Absorb: inward draw leaves a curling/incorporation after-motion.
- Successful two-verb rhythm: a stronger transformed-response beat.

The motion signatures use the same 66 ambient motes and the same PointsMaterial. They do not create objective markers or tell the player the answer.

## Performance
- 66 motes unchanged.
- one existing Points draw call remains the visual field;
- no new geometry;
- no new particle system;
- no extra ecology/array pass;
- world-response emphasis is two scalar material updates (size/opacity) plus small arithmetic inside the existing mote loop.

## Design target
The player should be able to look away from debug information and still distinguish:
**I read it / I disturbed it / I organized it / I pulled it into myself / my second action transformed the first response.**

## Locked
Movement, camera and Y inspection intent, interaction ranges, route progression, objectives, chemistry, Core anatomy, HC022B Scan grammar, HC022C response memory and HC022D rhythm-chain rules.
