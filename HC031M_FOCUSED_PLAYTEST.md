# HC-031M Focused Playtest — Targeting / Attention Ownership

Run about 4–6 minutes. This is not a route/progression test.

## Test loop
1. At Surface Wake / Host Contact Shelf, aim directly at one readable object **without pressing a verb**. The target should acquire after a tiny dwell; only a brief confirmation should appear, not a persistent lock ring.
2. Keep looking at that noun. Tap/hold Stabilize, then Pulse, then Absorb with small gaps. The noun should remain the attention owner while the active relationship glyph changes with the verbs.
3. While holding Stabilize or Absorb on that noun, deliberately sweep the camera toward a neighboring object. The soft candidate may move, but the active verb relationship should **not jump** to the neighbor.
4. Release the verb, then clearly aim at the neighbor. The old noun should release and the new noun should acquire quickly and intentionally.
5. Aim away into empty space for roughly half a second. Held attention should release instead of sticking indefinitely.
6. Repeat with an absorbable object near a non-absorbable object. Holding Absorb must not make the absorbable object steal ownership when you are clearly aiming at the other noun.
7. Do one short surface attach/crawl/peel/free/re-land loop to confirm K/K1/L movement behavior remains unchanged.

## Feel target
**I point at the noun; the game acknowledges it; my verbs operate on that noun until I intentionally look elsewhere.**

The target should feel stable, not magnetic. Aim correction should be forgiving, but a clear redirect should win.

## Export expectations
The JSON should show:
- `buildId: HC-031M`
- `schemaVersion: blob.session.telemetry.v1.33`
- `implementationPass: HC-031M`
- `attention.owner.changed`
- `attention.phase.changed`
- `attention.target.changed`

Useful success evidence:
- aim owner changes correspond to actual camera redirects, not every button press;
- candidate may change while a verb is held without the attention owner / relationship target changing;
- whenever a verb relationship is active, its target matches the aim-owned attention target;
- `verbRetargetingAllowed` is always false;
- no movement-progress blocks or renewed contact-authority regression.

## Regression watch
Do not tune thresholds from one unusual miss. Flag repeated cases of:
- clearly centered noun fails to acquire;
- target feels excessively sticky after a clear redirect;
- target drops during ordinary camera correction;
- active verb jumps to a neighbor;
- Absorb appears to select a target by itself;
- persistent generic lock ring returns;
- surface movement or L physical grammar changes.
