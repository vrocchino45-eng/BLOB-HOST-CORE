# HC031E1 Build Report — Suction Contact Readability

## Mode
Visual/contact convergence. No locomotion rewrite.

## Purpose
HC031E proved procedural tendrils could reach, hold, peel and replant from the trusted authored boundary, but playtest screenshots showed the contact end often read as a floating oval or body growth rather than a sucker planted on a surface. HC031E1 converges only that readability problem.

## Runtime changes
Only two runtime JavaScript files differ from HC031E:
- `src/player/CoreTendrilSurfaceContactSystem.js`
- `src/main.js` (build identity only)

`GameRuntime`, `PlayerMovementController`, `CoreEmbodimentSystem`, targeting, Bond/Absorb, Grave octave/resonance, rupture/consequence, route and progression owners remain locked.

## Visual corrections
- suction pad is no longer attached to the travelling reach tip;
- pad exists only once seal begins and is positioned at the authored surface anchor;
- pad changed from a round sphere to a shallow truncated sucker with its broad face planted on the surface;
- added a faint surface compression patch under the sucker, not a ring/cage effect;
- ordinary attachment reach shortened (`maxStretch 0.94 -> 0.62`, `stepDistance 0.34 -> 0.23`);
- tendon base thickened and pad-side tendon tapered more aggressively;
- root bulb elongates under tension to connect the tendon visually back into the Core body;
- peel lifts the tendon away while the sucker remains at the surface until the seal breaks;
- one-at-a-time stepping remains locked so two support contacts stay planted while the third reaches.

## Authority lock
HC031E1 still does **not**:
- translate or rotate the Core;
- add movement force;
- add collider or raycast authority;
- add a tendril button or new control;
- alter attachment physics;
- alter targeting, verbs, Bond/Absorb, rupture, residue consequence, Grave resonance, exits, routes or progression.

## Acceptance target
A still frame should now visually parse as:

**Core body -> tensioned tendril -> flattened sucker -> surface**

without needing debug text to explain that the Core is attached.

## Validation
- 123/123 runtime JS syntax PASS
- 465/465 JSON parse PASS
- HC031E1 planted-sucker contract PASS
- 14/14 locked parent owners PASS
- RecipeData load PASS
- undefined `this.method()` audit PASS
- runtime JS diff from HC031E: exactly 2 files

Production Vite rendering was not run because this package has no `node_modules`.
