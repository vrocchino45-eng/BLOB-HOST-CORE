# HC027K1 HOTFIX2 — Playtest HUD Readability Build Report

## Mode
Debug presentation / convergence hotfix.

## Purpose
Make recorded playtests diagnosable without allowing debug telemetry to cover so much of the game that visual hierarchy and player behavior become difficult to judge.

## Implemented
1. Replaced the previous display mapping with a three-level hierarchy: F1 Playtest Trace, F2 System Debug, F3 Clean Play.
2. F1 now renders a small contextual trace on the left and a larger dedicated input/action panel on the right.
3. F2 retains the deep diagnostic overlay but hides the large input panel.
4. F1 input presentation gives PHYSICAL and ACTION the largest type hierarchy, followed by Pulse and analog trigger state, then recent input history.
5. The most recent interpreted action persists for 3.0 seconds after the active frame, allowing quick releases to remain visible in recordings.
6. Status Page → Controls and normal HUD hints now use the new F1/F2/F3 meanings.
7. Added a runtime DOM smoke harness that actually instantiates the debug system/overlay and exercises F1, F2, F3 and a charged Pulse release.

## Scope proof
Exactly seven source JS files differ from HC027K1 HOTFIX1, all presentation/debug/hint owners:
- `src/core/GameRuntime.js`
- `src/debug/DebugAreaJumpSystem.js`
- `src/debug/DebugDisplaySystem.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/main.js`
- `src/ui/PlaytestHudSystem.js`
- `src/ui/StatusPageSystem.js`

The following gameplay owners are byte-for-byte identical to HOTFIX1: InputSystem, BondSystem, CoreSensoryResponseSystem, CoreRadialPerformanceSystem, CoreVerbPhysicalizationSystem, CoreEmbodimentSystem, PlayerMovementController, SignalPlainEcologySystem, AmbientMaterialInteractionSystem, InteractionCompositionSystem, EventAnchoredHostAudioSystem and CoreEngineSystem.

## Validation
HC027K1 HOTFIX2 PASS; runtime DOM smoke PASS; HOTFIX1 runtime-reference PASS; K1 instrumentation PASS; K consequence PASS; RecipeData PASS; undefined-method audit PASS; 92 JS syntax PASS; 334 JSON parse PASS.

Production Vite cannot run in this handoff because `node_modules/vite` is absent. No source failure was found.
