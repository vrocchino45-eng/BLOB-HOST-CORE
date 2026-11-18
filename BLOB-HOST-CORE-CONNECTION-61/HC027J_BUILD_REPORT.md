# HC027J Build Report — Persistent Local Consequence

## Mode
Bounded feature + convergence.

## Purpose
Prove that a successful embodied experiment can leave a temporary, readable local Host state after the immediate verb acknowledgement ends.

## Pilot scope
Signal Plain only, accessed quickly through **Shift+8**.

## Implemented consequences
| Condition | Experiment | Consequence | Duration |
|---|---|---|---:|
| draw/release | Absorb | redistributed flow | 30 s |
| call/wait | Pulse | coherent answer cadence | 36 s |
| phase-slip | Stabilize | held phase coherence | 34 s |

## Presentation
- Existing receptor meshes shift into an altered state rather than returning immediately to baseline.
- Existing nearby Host motes participate in the local aftermath.
- The World audio bus provides restrained onset/sustained signatures for the changed condition.
- The approved HC027D1 global mix values are unchanged.
- Debug telemetry exposes active consequence id, duration, remaining time, distance, and material behavior without creating player-facing objective authority.

## Authority constraints
The local consequence system cannot mark observation, complete the encounter, create rewards, objectives, waypoints, routes, progression, save state, or a next-question destination. Wrong verbs are harmless.

## Locked systems verified unchanged
Byte-identical to HC027I:
- `src/player/CoreSensoryResponseSystem.js`
- `src/player/CoreEngineSystem.js`
- `src/player/CoreRadialPerformanceSystem.js`
- `src/player/PlayerMovementController.js`

Audio implementation adds HC027J aftermath signatures, while HC027D1 master/bus/spatial/compressor constants remain exactly:
- master 0.82
- Core 1.85
- Verbs 2.15
- World 1.95
- Ambience 1.35
- Event 1.40
- ref distance 4.2
- rolloff 0.42
- target headroom 8 dB

## Scope diff vs HC027I
Active source changes are limited to:
- `src/fields/SignalPlainEcologySystem.js`
- `src/world/AmbientMaterialInteractionSystem.js`
- `src/audio/EventAnchoredHostAudioSystem.js`
- `src/guide/GuidePromptSystem.js`
- `src/ui/PlaytestHudSystem.js`
- `src/data/RecipeDataSystem.js`
- `src/main.js`

Plus build identity, validation/governance data, package metadata, and checkpoint documentation.

## Validation result
PASS:
- HC027J focused contract
- full inherited HC027J → HC023A chain
- RecipeDataSystem
- undefined-method audit
- 92 source JS files syntax
- 324 public JSON files parse

## Build environment note
A Vite production bundle is not claimed because this handoff does not contain the local `node_modules`/Vite executable.
