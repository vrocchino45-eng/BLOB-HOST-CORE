# HC018D — Persistent Local Consequences

## Audit finding
The route objects already retain their gameplay state across runtime unmount/remount.
Grave is already the strongest example: its memory imprint/thread is explicitly retained.
HC018D therefore does not add a new save/progression layer.

## Implementation
HC018D makes two other routes visibly remember what the player changed.

### Silt
- Once the safe porous packet is absorbed, the nearby appetite pocket remains visibly depleted.
- Nearby residue banks stay slightly reduced/opened rather than visually resetting.
- This is driven only by the already-retained `safeMatterAbsorbed` truth.

### Vascular
- Successful cadence reads leave progressively calmer/opened tissue through the vessel.
- After completion, valves remain visibly relaxed/open rather than reverting to pre-read motion.
- The synchronized return-current consequence remains readable after remount.
- This is driven only by `lockedCadenceReads` and `completed`.

### Grave
- Left unchanged because it already has retained-memory consequence presentation.

## Locked
No new persistence database, route requirement, objective, chemistry mutation, movement rule,
camera rule, gate/crossing rule, Core verb rule, or completion threshold was introduced.

## Acceptance target
After changing a route, turning around or revisiting it should show evidence that the Core has
already been there and changed the local anatomy.
