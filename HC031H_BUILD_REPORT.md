# HC031H Build Report — Planted Contact Support Assimilation

## Mode

Experimental Git-branch locomotion assimilation.

## Parent

HC031G — Stabilized Projection / Focused Pulse V1.

HC031G's verb grammar is locked. This pass does not redesign `Stabilize + Pulse`, targeting, Bond/Absorb, Grave, progression, or surface-ecology meaning.

## Purpose

Reduce blind custom iteration by adapting a small set of proven procedural-locomotion principles to BLOB's existing suction-tendril architecture:

**world-planted contact -> support geometry -> strain-driven replant -> body ride-height/tangent refinement**

The architectural reference is the MIT-licensed `majidmanzarpour/threejs-procedural-spider` project. No source file or verbatim locomotion implementation is copied into BLOB. HC031H independently applies the relevant design pattern to three suction tendrils, authored Host surface truth, and BLOB's existing movement ownership.

## Implemented

### 1. CoreTendrilSupportPlaneSystem

New read-only owner:

- reads sealed world-space suction anchors from the prior frame;
- computes support centroid;
- uses three planted points to derive a bounded support-plane normal when geometry is trustworthy;
- keeps `CoreSurfaceTruthSystem` as the crawlability/surface identity authority;
- publishes support count, quality, span, triangle area, ride height, target ride height, and material identity;
- owns no translation, raycast, collider, input, verb strength, route, or progression state.

### 2. Strain-driven replant selection

HC031G already kept suction anchors planted in world space, but replanting waited for a fixed cursor. HC031H computes per-anchor stride pressure from:

- anchor drift relative to its current stance location;
- tendon stretch relative to maximum ordinary reach.

When no other tendril is already peeling/reaching, the most over-strained sealed support is selected. Tie-breaking remains deterministic by starting from the round-robin cursor.

### 3. Predicted fixed foothold

When a support is selected for a step, its next anchor is predicted slightly ahead in the authored surface tangent frame using current speed and player movement intention. That destination is frozen at peel start and remains world-fixed through the reach.

This prevents the sucker from chasing a target attached to the moving Core.

### 4. Support-plane movement consumption

`PlayerMovementController` remains the sole translation owner. When two or more valid planted supports exist on the current authored surface it can use the support plane to:

- remove into/out-of-plane velocity;
- refine attached tangent motion;
- derive stand-off/ride height from the actual planted supports;
- apply a small bounded traction quality scale.

With insufficient support, HC031G surface-truth behavior remains the fallback.

### 5. Embodiment conformation

`CoreEmbodimentSystem` may use the read-only support-plane normal for existing contact deformation. It does not move `playerRoot`.

### 6. Telemetry proof fields

Movement telemetry now includes:

- attachment surface ID;
- tendril locomotion active state;
- tendril support count;
- support-plane active/quality;
- Stabilized Projection active mode;
- self-braced vs surface-braced state;
- projection brace quality.

This closes the HC031G telemetry gap where video could show contact while exported movement samples only exposed the older attachment flag.

## Deferred intentionally

- `three-mesh-bvh` integration;
- wall/ceiling traversal expansion;
- edge wrapping;
- arbitrary decorative-mesh contact;
- additional tendrils;
- new physics engine;
- IK library dependency;
- material adhesion redesign;
- regional-history synthesis.

Those remain separate variables until this planted-support architecture proves itself.

## Runtime source delta from HC031G

- NEW `src/player/CoreTendrilSupportPlaneSystem.js`
- `src/player/CoreTendrilSurfaceContactSystem.js`
- `src/player/PlayerMovementController.js`
- `src/player/CoreEmbodimentSystem.js`
- `src/core/SessionTelemetrySystem.js`
- `src/core/GameRuntime.js`
- `src/main.js` (identity only)

## Locks

21 HC031G parent owners are SHA-256 locked in `public/data/build/hc031hLockedParentHashes.json`, including:

- InputSystem
- TargetingSystem / TargetFocusRegistry
- BondSystem / ChemObjectSystem
- VerbCompositionSystem
- StabilizedProjectionSystem
- ReactiveStateGrammarSystem
- ResponsePersonalitySystem
- Grave II + rupture systems
- CoreGrowthSystem
- CoreSurfaceTruthSystem
- CrawlableSurfaceRegistry
- HostContactShelfSystem
- CoreVerbPhysicalizationSystem
- VisualHierarchyCompressionSystem
- CoreTendrilVisualLanguage

## Validation

- HC031H contract: PASS
- 129 runtime JS syntax checks: PASS
- 477 JSON parses: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- relative import audit: PASS
- 21 parent-owner hashes: PASS
- no new runtime dependency: PASS

Production Vite rendering is not run in this packaged checkpoint because `node_modules` is excluded.
