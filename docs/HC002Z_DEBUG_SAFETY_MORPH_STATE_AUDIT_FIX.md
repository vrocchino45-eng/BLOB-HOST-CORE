# HC-002Z — Debug Safety + Morph State Ownership Audit Fix

## Purpose

HC-002Z fixes the deeper problem behind the recent screenshot crashes: debug and readability panels were each trying to decide the active morph state independently.

That caused playtest failures to move from one UI file to another:

```text
RecipeDebugOverlay bloomLoop ReferenceError
MorphReadabilitySystem formatBloomStage TypeError
RecipeDebugOverlay currentMorphState TypeError
ChemistryDebugPanel currentMorphState TypeError
```

## Main Fix

A shared selector now owns current morph display resolution:

```text
src/morph/MorphStateSelector.js
```

The selector resolves the visible/current morph in order:

```text
Bloom Residue active/completed
→ third local morph
→ Signal Chorus active/completed
→ second local morph
→ Scar-Flow active/completed
→ first local morph
```

The following panels now read the same selected morph state:

```text
MorphReadabilitySystem
RecipeDebugOverlay
ChemistryDebugPanel
```

## Debug Safety

`SystemRegistry` now supports non-fatal update errors for debug/readability UI systems. This prevents a panel formatting error from stopping camera update or rendering.

Non-fatal systems in this pass:

```text
DebugDisplaySystem
MorphReadabilitySystem
RecipeDebugOverlay
ChemistryDebugPanel
```

Core gameplay systems still throw normally.

## Source-State Cleanup

Runtime lock data now loads:

```text
public/data/lock/hc002FourCellChainLockState.json
```

instead of stale:

```text
public/data/lock/hc001LockState.json
```

Scar-Flow, Signal Chorus, and Bloom Residue local-cell statuses now reflect runtime prototype activity.

## Reward Safety

Signal Chorus and Bloom Residue completion rewards now use one-time guards:

```text
rewardApplied: true / false
```

This prevents prepared loops from changing player composition every frame after completion.
