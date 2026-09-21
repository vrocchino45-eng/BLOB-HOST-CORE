# HC-002X — Four-Cell Chain Fix Pass

## Purpose

Fix HC-002W playtest blockers without expanding scope.

## User-Observed Issues

```text
Uncaught ReferenceError: bloomLoop is not defined
at RecipeDebugOverlay.js
```

The screenshot also showed Signal Chorus asking the player to warm the seed-signal bridge while target focus remained on `choir_resonance_node_001`.

## Fixes

### Debug overlay crash

`RecipeDebugOverlay.fullText()` now defines:

```text
bloomLoop = frameState.bloomResidueInteraction ?? {}
```

before rendering the Bloom Residue loop section.

### Chemistry panel crash prevention

`ChemistryDebugPanel.fullText()` received the same guard because it also rendered Bloom Residue loop fields.

### Signal Chorus focus handoff

`SignalChorusInteractionSystem.findFocus()` now hard-hands focus to the current recipe step object. Once the loop reaches the bridge stage, `seed_signal_bridge_001` receives forced focus and no longer loses to nearby choir/listening objects.

### Target focus redundancy

`TargetFocusRegistry` now adds a bridge override when Signal Chorus is at bridge/tuned stage or the third morph is ready.

## Forbidden Scope Respected

No new cell, new morph destination, combat, ability, orbiter, entity, or HC-003 implementation was added.
