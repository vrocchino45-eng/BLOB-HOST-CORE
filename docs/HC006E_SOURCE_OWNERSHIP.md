# HC-006E Source Ownership

## Authored opening content

### `public/data/opening/surfaceWakeLayeredInteractionRecipes.json`
Owns Surface Wake meaning, focus, stage order, timing, visual tuning, prompts, completion, and forbidden scope.

## Runtime owner

### `src/opening/SurfaceWakeLayeredInteractionSystem.js`
Owns Surface Wake state progression, authored visuals, pulse consumption, held resonance, visible response, release/settle, completion, and generic inspection-focus publication.

## Shared runtime foundations

### `src/interaction/LayeredInteractionGrammar.js`
Owns reusable stage vocabulary and diagnostics only.

### `src/camera/InspectionCameraSystem.js`
Owns optional inspection availability, toggle, safe release, and generic framing state.

### `src/camera/InspectionOcclusionSystem.js`
Owns focus marker and sightline softening.

## Handoff owners

### `src/input/InputSystem.js`
Maps contextual A between pulse-read, resonance hold, and absorb.

### `src/targeting/TargetFocusRegistry.js`
Suppresses generic nursery target selection until Surface Wake completion.

### `src/chemistry/BondSystem.js`
Prevents nearest-object fallback absorption while Surface Wake owns the interaction context.

### `src/opening/OpeningPacingSystem.js`
Integrates the lesson into the first-minute flow and releases safe-seed readability afterward.

## Presentation and diagnostics

- `src/guide/GuidePromptSystem.js`
- `src/ui/PlaytestHudSystem.js`
- `src/debug/RuntimeDiagnosticSummary.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/debug/ChemistryDebugPanel.js`

These surfaces report state but do not own interaction progression.
