# HC027F Build Report — Host Answer Memory / Traversal Inquiry

## Build identity
- Build: **HC-027F**
- Version: **0.27.7**
- Parent: **HC-027E**
- Mode: world-response convergence / optional traversal inquiry
- New source modules: **0**
- Active source modules: **92**
- New regions: **0**

## Purpose
Continue the HC027E convergence direction by giving traversal an optional inquiry loop using systems that already exist.

The player can now Pulse, receive a legitimate sonar answer, move toward the place that answered, and optionally read the material response without receiving a waypoint, objective, reward or route correctness signal.

## Modified owners
- `CoreSensoryResponseSystem` — temporary returned-answer memory only
- `AmbientMaterialInteractionSystem` — existing-mote local response + optional read
- `InteractionCompositionSystem` — follow-answer presentation beat
- `PlaytestHudSystem` — debug/playtest telemetry only

No new gameplay owner was introduced.

## Answer-memory law
Only completed HC027D returns can create memory.

| Parameter | Value |
|---|---:|
| Maximum records | 4 |
| Default TTL | 7.2 s |
| Host-boundary TTL | 5.8 s |
| Approach range | 3.6 |
| Read range | 1.65 |

Memories publish position, response class/label, Pulse event, age, remaining time, current distance and approach intensity.

## Host traversal expression
The existing ambient point field locally bends around the nearest answer memory. HC027F adds no geometry and no draw calls.

An optional Scan/Interact read is allowed only when:
1. the remembered answer is within local read range
2. no authored interaction target currently owns the input

The result is material understanding only.

## Locks
Unchanged:
- HC027D1 audio mix
- Pulse range and HC027D return timing
- HC027E consequence holds / hierarchy
- radial physiology
- 3→6→12 engine
- movement / chemistry / targeting / route / objective / progression authority

## Regression proof
PASS:
- HC027F focused validator
- full inherited HC027E → HC023A validator chain
- RecipeDataSystem
- undefined `this.method()` audit

Static integrity:
- 92 JS modules syntax PASS
- 314 public JSON files parse PASS

## Environment limitation
No local `node_modules` installation is included, so Vite production bundling is not claimed in this environment.
