# HC-005B — Signal Chorus Return-State Convergence

## Mode
Convergence repair.

## Live evidence
HC-005A completed its movement path and published `signal_chorus_route_awareness_restored`, but the screenshot still reported `CELL_GRAVE_MEMORY_RESIDUE_BED_001` as the active cell and retained `inheritance_seed_remnant_001` as the target.

## Root cause
`GraveSeamContinuityMicroExitSystem.maintainCompletedState()` continuously reasserted the Grave bed after the later HC-005A return had completed. If Signal Chorus ownership survived, the older arrival and tuning systems could also replay their first-pass logic.

## Repair
1. Add `SignalChorusReturnStateSystem` after `GraveReturnContinuitySystem`.
2. Reassert Signal Chorus cell, chemistry, physical feel, and visibility while the return reading is held.
3. Make the seam micro-exit yield to downstream return ownership.
4. Suppress first-arrival/tuning-loop replay after the return.
5. Suppress stale Grave and old Signal targets.
6. Publish one stable Guide/HUD/debug handoff.

## Acceptance state

```text
owner = SignalChorusReturnStateSystem
stage = signal_chorus_return_state_held
activeCellId = CELL_SIGNAL_CHORUS_NERVE_001
expectedTarget = none
actualTarget = none
progress = 1
complete = true
```

## Forbidden
No route expansion, no new morph, no new Signal puzzle, no gate, no teleport, no Comb Threshold, and no Aperture Fields implementation.
