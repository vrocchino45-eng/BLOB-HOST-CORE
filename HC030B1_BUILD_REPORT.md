# HC-030B1 Build Report — Visual Hierarchy Compression

Parent: **HC-030B — Material / Entity Response Personality**

## Mode

Convergence / visual-hierarchy calibration pass.

## Purpose

HC030B1 responds to playtest feedback that the relationship lines, rings and large interaction wireframes are all individually readable but collectively occupy too much screen hierarchy.

The pass answers one question only:

> Can support graphics remain readable while yielding the majority of screen attention to the target's HC030A state change and HC030B material/entity response?

## Locked systems

- HC029A target selection, retention and camera handoff.
- HC029B effect ownership.
- HC029C verb composition meaning and cost.
- HC030A reactive condition state and thresholds.
- HC030B response personality.
- Core verb power/range, Bond progress, routes, progression, camera behavior and controls.

`TargetingSystem.js` and `CoreVerbPhysicalizationSystem.js` are byte-identical to HC030B.

## Allowed runtime scope

Intentional runtime JS diff vs HC030B is exactly:

1. `src/main.js` — build identity only.
2. `src/core/GameRuntime.js` — constructs and runs one post-physicalization presentation owner.
3. `src/presentation/VisualHierarchyCompressionSystem.js` — **new** presentation-only owner.

Exactly **111** parent runtime JS owners are SHA-256 locked.

## Hierarchy rule

1. **Primary:** target material/state deformation and response.
2. **Secondary:** relationship direction and active verb/composition.
3. **Tertiary:** support lines, rings, wireframes and transient cages.

## Visual changes

### Relationship trace

The original hard Core→target axis is not deleted or changed in TargetingSystem. After TargetingSystem updates it, HC030B1 hides that rendered axis and presents a five-segment low-opacity fade instead.

- endpoint segments are faint,
- center segment carries the strongest read,
- new acquisition/handoff briefly increases readability,
- sustained relationships settle quieter,
- unstable/failing target state can restore only a small amount of support emphasis.

### Relationship glyphs

Pulse/Absorb triangles and the Stabilize coherence boundary remain the same geometry and meaning, but sustained opacity is compressed. Acquisition gets a brief readable lift before the glyphs settle.

### Pulse

Large sphere/wireframe and surface contour support is compressed more strongly than travelling return information. Target deformation/personality is untouched.

### Absorb

The straight axis, funnel rings and helical support filaments are compressed. Moving fragments remain comparatively readable so the interaction still has direction and material flow.

### Stabilize

The tether and three gyroscopic bands are compressed. Target settling/coherence change should carry the dominant read.

## Forbidden scope

- no targeting thresholds or candidate scoring changes,
- no target-cycle input,
- no verb power/range/cost changes,
- no state/personality tuning,
- no new gameplay ability,
- no HUD condition meter,
- no route/progression/content expansion,
- no global environment dimmer.

## Acceptance tests

1. HC029A targeting file remains byte-identical.
2. CoreVerbPhysicalization remains byte-identical.
3. HC030A/B state/personality owners remain byte-identical.
4. Relationship direction remains visible without a persistent hard axis dominating the frame.
5. A newly acquired/handoff relationship is easier to notice than a long-held stable relationship.
6. Pulse contours are subordinate to target deformation.
7. Absorb fragments/material movement read above its axis/funnel support.
8. Stabilize target settling reads above its tether/gyro support.
9. No world-wide opacity reduction is introduced.
10. No gameplay outcome changes.

## Validation result

- HC030B1 visual hierarchy contract: **PASS**
- RecipeDataSystem load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **114/114 PASS**
- public JSON parse: **443/443 PASS**
- locked HC030B runtime owners: **111/111 PASS**
- runtime JS diff vs HC030B: exactly **3** files (2 changed + 1 new)
- `TargetingSystem.js`: byte locked
- `CoreVerbPhysicalizationSystem.js`: byte locked
- `ReactiveStateGrammarSystem.js`: byte locked
- `ResponsePersonalitySystem.js`: byte locked

Production Vite render is not claimed because dependencies are not bundled in the handoff package. Browser/controller play remains the authority for final opacity/readability calibration.
