# HC-029B Build Report — Relationship Effect Ownership

## Purpose

HC029B keeps HC029A targeting behavior locked and aligns physical consequence with the retained relationship. The target the grammar presents as intentional is now the target that receives the strongest intentional effect.

## Scope

Intentional runtime changes are limited to:

1. `src/main.js` — build identity only.
2. `src/chemistry/ChemObjectSystem.js` — Pulse effect ownership.
3. `src/player/CoreVerbPhysicalizationSystem.js` — Stabilize relationship ownership/readout.
4. `src/world/AmbientMaterialInteractionSystem.js` — weaker ambient Stabilize answer while a focused relationship exists.

`TargetingSystem.js` is byte-locked to HC029A. No target thresholds, camera handoff rules, release grace, controls, route logic, chemistry recipes, ecology, or progression were retuned.

## Pulse

Pulse remains dual-purpose rather than becoming a shooter projectile. `affectedObjects` remains the broad local inquiry set so existing discovery/morph readers keep working. Nearby non-target objects receive a 0.22-strength presentation ripple. The resolved relationship/candidate receives the 1.0 directional response.

Because `ChemObjectSystem` intentionally updates before `TargetingSystem`, an edge-triggered Pulse consumes the already-resolved targeting state from the preceding frame. HC029B does not reorder runtime systems just to create same-frame ownership.

## Absorb

No behavior change. `BondSystem` already consumes `frameState.targeting.targetId`, so Absorb remains the relationship-specific incorporation verb.

## Stabilize

The physical coherence field now checks the retained `relationshipTargetId` before `interactionAssist` or route/Host fallbacks. The surrounding Host field still organizes, but while focused Stabilize exists its ambient presentation amplitude is reduced to 0.38.

This preserves both meanings:

- focused Stabilize = organize **this relationship**
- ambient Stabilize = organize **the surrounding Host**

## Chords

P+A, S+P, S+A and P+A+S now share the same targeting relationship rather than inventing separate target selection rules. Primitive glyph composition remains unchanged from HC029A.

## Validation target

- HC029A targeting thresholds unchanged and hash locked.
- Pulse broad inquiry preserved.
- Focused Pulse stronger than ambient responses.
- Stabilize relationship target precedes assist/route fallbacks.
- Ambient Host stabilization remains present but subordinate during focused Stabilize.
- No new button, target cycle, reticle, camera snap, route gate, progression or ecology content.

## Validation result in this package

- HC029B relationship-effect contract: **PASS**
- RecipeDataSystem load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **110/110 PASS**
- public JSON parse: **431/431 PASS**
- non-scope runtime owners locked to HC029A: **106/106 PASS**
- runtime JS diff vs HC029A: exactly **4** files listed in Scope

## Browser/render boundary

A production Vite bundle was attempted in the build environment. Dependency installation did not complete cleanly before the environment cutoff, leaving an incomplete local Vite package, so no browser/render claim is made from this environment. `node_modules` is intentionally excluded from the deliverable. Run the normal local `npm install` / `npm run dev` path and use the included focused playtest for controller verification.
