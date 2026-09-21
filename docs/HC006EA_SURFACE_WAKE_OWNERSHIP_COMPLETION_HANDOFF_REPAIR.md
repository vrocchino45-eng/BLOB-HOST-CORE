# HC-006EA — Surface Wake Ownership and Completion Handoff Repair

## Mode
Convergence repair.

## Problem
The new Surface Wake interaction and the legacy first morph both published active opening instructions. Diagnostics therefore reported a morph prerequisite even though the authored interaction correctly required a pulse-read. Completion was also hidden after changing cells because inactive Surface Wake state forced progress and complete back to zero/false.

## Resolution
- LocalCellMorphSystem explicitly defers while Surface Wake is active and incomplete.
- Deferred morph state publishes no blocker and mirrors the current Surface Wake next action.
- Runtime diagnostics ignore a deliberately deferred morph prerequisite.
- Surface Wake completion remains persistent after the active cell changes.

## Locked systems
Safe seed behavior after completion, first morph mechanics, Scar-Flow, Signal Chorus, Grave route, inspection camera, and camera-relative movement.
