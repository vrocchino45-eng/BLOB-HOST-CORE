# HC-004QI — Grave Initial Loop Ownership and Instruction Handoff Fix

## Mode
Convergence repair. No route expansion.

## Screenshot-proven failure
The HC-004QH full-debug screenshot showed the initial Grave bed before the safe silt transfer was complete, but the later `GraveLoopStabilitySystem` already owned the screenshot diagnostics and Guide instruction.

The same frame simultaneously reported:

- active owner: `GraveLoopStabilitySystem`
- stage: waiting for safe transfer
- Guide: release absorb and let the Grave settle
- actionable HUD: hold A/F near the settled silt trace
- bond blocker: `target_not_safe_to_absorb`
- pulse produced, but consumer: none

This was not a player-input failure. It was a runtime ownership and reporting conflict.

## Root causes

1. `GraveLoopStabilitySystem.isActive()` required only the read loop to be active. It did not require `safeMemoryTransferComplete`.
2. The Guide and lower tissue panel gave the stability layer priority once it became active.
3. The generic bond layer continued to label the authored safe silt transfer unsafe until absorb was already held.
4. Valid Grave pulses advanced the loop but did not publish an input-consumption audit record.
5. Full-debug readiness did not count `safeAbsorbReady` as a ready-for-input state.

## Repair

### Before safe transfer
`GraveReadBeforeAbsorbSystem` owns:

- screenshot diagnostics
- expected/actual focus
- Guide action
- lower tissue-panel action
- safe-silt bond compatibility
- valid pulse consumption

The player sees one instruction: hold A/F near the settled silt trace when the sequence is ready.

### After safe transfer
Only after `safeMemoryTransferComplete === true` may `GraveLoopStabilitySystem` activate. It then owns the settling instruction and keeps exit activation deferred.

## Preserved systems

- initial Grave object sequence
- protected husk, scar lock, and inheritance seed
- existing stability duration
- existing exit-readiness planning
- scar-memory seam arrival
- seam first-read loop
- verified fold-back
- post-seam Grave response

## Forbidden scope preserved

No gates, doors, teleports, branch menus, stage-node loaders, legacy chamber runtime, combat, dialogue tree, quest log, new route destination, or Act expansion were added.
