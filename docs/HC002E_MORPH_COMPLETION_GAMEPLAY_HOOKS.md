# HC-002E — Morph Completion Gameplay Hooks

## Purpose

HC-002E makes the scar-flow destination respond after the no-gate morph completes.

This pass does not add combat, a new cell, a new ability, a gate, or dialogue. It adds post-morph chemistry hooks so the second local cell has a playable reason to exist.

## New System

```text
src/morph/MorphCompletionSystem.js
```

## Hook Objects

```text
scar_memory_fleck_001      -> memory echo / residue reading
resonant_path_thread_001   -> path confidence / signal route
pressure_fold_current_001  -> pressure relief / movement feel
scar_flow_clot_001         -> warning / hardening, not pickup
```

## Main Rule

The player should learn the scar-flow fold by pulsing, reading, and moving through pressure. Nothing should feel like a door or combat arena.

## Expected Feel

- The destination is not just a visual swap.
- Pulse changes scar-flow state.
- Pressure gradually becomes more navigable.
- The clot warns rather than rewards unsafe absorption.
- Hidden nursery objects no longer steal targeting after the morph.
