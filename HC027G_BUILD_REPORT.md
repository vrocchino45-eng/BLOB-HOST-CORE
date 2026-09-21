# HC027G Build Report — Host Material Reply Grammar

## Build identity
- Build: **HC-027G**
- Version: **0.27.8**
- Parent: **HC-027F**
- Mode: world-response convergence / material differentiation
- New source modules: **0**
- Active source modules: **92**
- New regions: **0**

## Purpose
HC027F made a legitimate Pulse answer persist at the world-space location that answered. HC027G makes that remembered answer physically distinguishable by material class using the already-existing Host field.

The intended traversal language is:

**probe → answer → approach → observe behavior → infer material → optional confirmation → continue**

## Modified active owners
- `AmbientMaterialInteractionSystem` — material-class-specific motion only
- `PlaytestHudSystem` — diagnostic reply-signature telemetry only
- `main.js` — build identity only
- `RecipeDataSystem` — active successor status allowlist only

## Material reply grammar
| Return class | Motion signature |
|---|---|
| host_membrane | broad tangential enclosure |
| living_seed | cluster and breathe |
| scar_memory | lagged settle and hold |
| signal_resonant | coherent resonant oscillation |
| fluid_current | directional stream through |
| dense_structure | compact damped stillness |
| living_material | soft irregular orbit |

All signatures reuse the existing Host motes. No new geometry or draw calls were introduced.

## Locks
Unchanged:
- HC027F answer-memory law
- Pulse range / sonar timing
- HC027E turn-taking
- HC027D1 audio mix
- radial physiology
- 3→6→12 engine
- movement / chemistry / targeting / route / objective / progression authority

## Regression proof
PASS:
- HC027G focused validator
- inherited HC027F → HC023A validator chain
- RecipeDataSystem
- undefined `this.method()` audit

Static integrity:
- 92 JS source modules syntax PASS
- 316 public JSON files parse PASS
- HC027D1 audio owner SHA-256 unchanged from HC027F

## Environment limitation
`npm run build` cannot execute because the checkpoint does not include `node_modules/vite/bin/vite.js`. No Vite production-bundle claim is made.
