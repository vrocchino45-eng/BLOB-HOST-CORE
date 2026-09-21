# HC017A HOTFIX2 — Verb Visual Scale Normalization

## Observation
HC017A HOTFIX1 restored runtime execution, but the new verb presentation was much too
large relative to the HC016X 0.52 Core scale.

The Stabilize wireframe enclosure in particular could span most of the visible scene.
Pulse/contact presentation also competed with route anatomy instead of clarifying contact.

## Fix
No gameplay logic changed.

### Stabilize
- giant distance-scaled wireframe enclosure removed;
- compact regulation node retained;
- thin Core→target regulation tether added;
- field size is now clamped and largely independent of target distance;
- contact flashes reduced.

### Pulse
- propagation front radius substantially reduced;
- opacity reduced;
- contact flashes made smaller and shorter-lived.

### Absorb
- material fragments made smaller;
- live fragment cap reduced from 28 to 20.

## Locked
Pulse range, Absorb range, Stabilize gameplay truth, chemistry, route mechanics,
Core scale, movement, camera, progression, anatomy, and objective logic.

## Acceptance
The verbs should be visually readable without obscuring the Core, target, Guide/Tender,
or surrounding Host anatomy.
