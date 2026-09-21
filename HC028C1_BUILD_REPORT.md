# HC028C1 Build Report — Phase Architecture Visual Readability

Parent: **HC028C — Vascular World Rhythm Grammar Prototype**

## Problem observed
The authoritative 3→6→12 engine was cycling correctly with `O`, but its visual presentation was intentionally subtle: small low-opacity nodes were stacked radially. Increasing phase count therefore changed telemetry much more clearly than silhouette.

## Implementation
`CoreEngineSystem` remains the sole sequencing/RPM owner and is byte-locked from HC028C.

`CoreEmbodimentSystem` now presents the same phase data as three unmistakable geometries around the nucleus:
- 3 = triangle,
- 6 = hexagon,
- 12 = dodecagon.

The firing order remains Pulse → Absorb → Stabilize at every resolution. Function colors are unchanged. The active phase is still emphasized.

A single lightweight `LineLoop` outlines the active architecture. Node placement is moved into a camera-readable plane, node radius rises from 0.042 to 0.058, and ordinary-play inactive opacity rises from the former 0.075 baseline to 0.18. Inspection/Core Work retain stronger presentation.

Architecture changes trigger a 0.72-second visual bloom so debug cycling gives immediate feedback.

## Scope locks
Byte-locked from HC028C:
- `CoreEngineSystem.js`
- `InputSystem.js`
- `VascularRhythmRouteSystem.js`
- `PlayerMovementController.js`
- `HostRhythmSystem.js`
- `WorldCompositionRegistry.js`

Therefore this pass changes no engine law, O-key ownership, Vascular rhythm behavior, movement/reachability, or world-composition clock.

## Validation
PASS:
- `validate:hc028c1`
- inherited `validate:hc028c`
- `validate:recipe-data`
- undefined-method audit
- all 94 runtime JS files through `node --check`
- all 353 public JSON files parse

## Environment limitation
The supplied build does not contain a complete local `node_modules`, so a Vite production render was not executed here. The focused live test is specifically visual: cycle `O` at normal camera distance before looking at F1.
