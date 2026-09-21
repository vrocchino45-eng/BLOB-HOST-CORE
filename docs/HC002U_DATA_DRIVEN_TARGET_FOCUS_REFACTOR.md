# HC-002U — Data-Driven Target Focus Refactor

## Purpose

HC-002U removes the growing per-cell targeting priority ladder from `TargetingSystem` and moves those rules into a dedicated target-focus layer.

The goal is to keep the current four-cell chain working while preventing future cells from adding more hardcoded `if` branches to targeting.

## Current Chain

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
→ CELL_BLOOM_RESIDUE_FORK_001
```

## Added

```text
src/targeting/TargetFocusRegistry.js
public/data/targeting/targetFocusRules.json
```

## Refactored

`TargetingSystem` now reads:

```text
frameState.targetFocus.allowedCells
frameState.targetFocus.cellBoosts
frameState.targetFocus.objectBoosts
frameState.targetFocus.targetKinds
frameState.targetFocus.preferredTargetId
```

Instead of directly knowing about every Scar-Flow, Signal-Chorus, and Bloom-Residue interaction state.

## Focus Providers

The new rule file currently defines:

```text
TARGET_FOCUS_NURSERY_001
TARGET_FOCUS_SCAR_FLOW_001
TARGET_FOCUS_SIGNAL_CHORUS_001
TARGET_FOCUS_BLOOM_RESIDUE_001
```

Each rule declares:

```text
cellId
baseCellBoost
preferredObjects
providers
targetKinds
```

## Acceptance Tests

- Nursery seed target still works.
- Scar-Flow loop focus still follows current stage.
- Signal-Chorus loop focus still follows current stage.
- Bloom-Residue loop focus still follows current stage.
- Targeting ignores old-cell objects after active-cell changes.
- Debug panels show focus rule and preferred target.
- `TargetingSystem.js` no longer contains the large per-cell priority ladder.

## No-Scope Confirmation

This pass does not add:

```text
new cells
new morphs
new abilities
combat
new entities
new orbiters
visual redesign
```
