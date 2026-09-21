# HC027L1 Build Report — Rhythm Compression & Grammar Reinforcement

## Mode
Convergence / feel tuning. No new mechanics, abilities, regions, objectives, progression, routes, entities, or control mappings.

## Purpose
Respond to the HC027L 8:26 playtest: repeated sonar could become informationally flat, dense Pulse returns could stack too quickly, the vascular middle had high visual activity but low semantic change, and deep sonar could remain target-like after repeated attempts.

## Implemented

### 1. Repeated sonar increases resolution
`CoreSensoryResponseSystem` now keeps session-local, presentation-only source observation counts. The same source resolves through:
1. presence,
2. layering / intervening volume,
3. structural relationship / not an immediate target.

Quick Pulse remains 4.25 local/actionable range. Repeat resolution does not create target, waypoint, route, objective, chemistry, or progression authority.

`CoreVerbPhysicalizationSystem` and `AmbientMaterialInteractionSystem` express higher deep-resolution stages as broader layered/volumetric behavior rather than a brighter point marker.

### 2. Pulse-return rhythm compression
Several echoes from one Pulse still render and sound independently, but `InteractionCompositionSystem` gives that Pulse burst one consequence turn instead of repeatedly restarting the consequence/reorientation timer.

### 3. Adaptive reorientation
The old HC027L 2.8-second baseline remains the minimum language, but resolved actions now receive different presentation recovery windows:
- local Pulse return: ~3.15 s,
- charged/deep Pulse: ~4.0 s base, +~0.35 s for higher repeat-resolution stages,
- Absorb capture: ~3.55 s,
- Stabilize lock: ~4.05 s.

This changes visual turn-taking only. It is not a cooldown or input lock.

### 4. Vascular grammar reinforcement
The existing Vascular route anatomy now carries three presentation-only reinforcement windows using the vessel, current motes, and wall folds already present:
- progress 0.17–0.33: uncertain current / probe language,
- progress 0.42–0.59: loose draw/release language,
- progress 0.67–0.84: phase-strain / coherence language.

The windows never name the verb to the player. Debug telemetry records the implied verb only for analysis. Route completion, movement current, cadence reads, thresholds, and progression are unchanged.

### 5. Semantic-stagnation telemetry
F1 now distinguishes general rhythm gap from semantic gap. It reports repeat count and flags prolonged movement without new interpreted information. This is read-only groundwork for later AI/session telemetry.

## Source scope
Eight source files differ from HC027L:
- `src/main.js`
- `src/debug/DebugDisplaySystem.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/player/CoreSensoryResponseSystem.js`
- `src/player/CoreVerbPhysicalizationSystem.js`
- `src/presentation/InteractionCompositionSystem.js`
- `src/routes/VascularRhythmRouteSystem.js`
- `src/world/AmbientMaterialInteractionSystem.js`

All other 84 source modules are byte-identical to HC027L.

## Locked foundations
- quick Pulse local/actionable range: 4.25,
- HC027J2 Deep/Inner/Membrane physiology,
- HC027D1 audio reference/bus values,
- InputSystem and controls,
- Bond/Absorb gameplay owner,
- PlayerMovementController,
- Signal Plain gameplay/K relationship owner,
- Core embodiment/anatomy,
- GameRuntime movement/camera authority,
- 3→6→12 Core engine.

## Validation
PASS:
- HC027L1 dynamic contract,
- HC027L predecessor rhythm contract,
- HC027K consequence-next-question contract,
- HC027K1 HOTFIX2 instrumentation contract,
- F1/F2/F3 runtime DOM smoke,
- RecipeDataSystem load,
- undefined-method audit,
- 92/92 source JS syntax,
- 339/339 public JSON parse,
- locked-owner SHA-256 manifest.

Environment limitation: legacy Vascular validators import `three`, but this handoff contains no local `node_modules`; those runtime validators cannot execute here. HC027L1 therefore adds static/contract proof that the Vascular reinforcement touches presentation only, and the authored gameplay methods remain source-locked by scope review. Production Vite remains unavailable for the same missing dependency.
