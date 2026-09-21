# HC-004QE — Full Debug Screenshot Diagnostics

## Problem verified from playtest

The full-debug left and right panels used `overflow: hidden` with long exhaustive text lists. At a common playtest viewport, both lists extended below the visible browser area. The clipped sections contained target, morph, input, camera, and runtime state needed to diagnose stalls.

## Implemented correction

1. Added `RuntimeDiagnosticSummary.js` as the single debug-owned interpretation layer for active flow ownership, target alignment, pulse consumption, readiness, blockers, health, and screenshot signature.
2. Rebuilt `RecipeDebugOverlay.fullText()` around screenshot-critical state.
3. Rebuilt `ChemistryDebugPanel.fullText()` around diagnosis, active flow metrics, morph handoff, chemistry, and runtime health.
4. Published the currently visible tissue-shift status and next instruction through `frameState.morphReadabilityDebug`.
5. Applied dynamic viewport height, deterministic no-wrap lines, shortened values, and responsive debug font sizing.
6. Added a validator that enforces a 50-line maximum and required diagnostic fields.

## Ownership rule

This pass changes debug presentation only. It reads runtime state but does not write progression, targeting, input mapping, chemistry, or morph state.

## Screenshot acceptance criteria

A full-debug screenshot must show:

- build and active cell
- active runtime owner
- stage and progress
- readiness and completion
- expected and actual targets
- alignment result
- blocker and next action
- pulse source and sequence
- producer and consumer frames
- consumed target and result
- visible HUD, Guide, and tissue messages
- current morph plan, phase, reason, and destination
- active flow metrics
- chemistry and bond state
- schema and non-fatal error count
- compact SNAPSHOT signature
