# HC-005A — First Route Return Continuity Prototype

## Mode

Convergence implementation.

## Purpose

Provide one playable continuation from the locked Grave route back to the Signal Chorus route-awareness function without restoring legacy chamber-exit architecture.

## Allowed scope

- one authored return path
- one generic return-continuity runtime owner
- movement-based activation and progress
- continuous visual, chemistry, and physical-feel blend
- return camera readability
- Guide, HUD, tissue, and debug ownership

## Forbidden scope

- edits to the completed Grave sequence
- gate, door, teleport, or old exit registry
- literal Hub chamber
- pulse or absorb activation
- player transform relocation
- branch selection
- Comb Threshold
- Aperture Fields
- new combat, ecology, dialogue, or quests

## Ownership

```text
GraveRouteLockSystem
→ GraveReturnContinuitySystem
→ Signal Chorus route-awareness restored state
```

The HC-005A owner remains active at the returned Signal Chorus endpoint so stale first-visit branch instructions cannot take over before the next convergence pass.

## Interaction

The current appears only after verified Grave-route lock. Entering its mouth by movement starts the fold. Progress is derived from the nearest authored curve sample while the player remains within the current’s follow radius. No A/X/Space action is required.

## Completion

- active cell becomes `CELL_SIGNAL_CHORUS_NERVE_001`
- player position is not changed by code
- Grave objects are hidden/faded, not consumed
- inheritance seed remains closed
- Grave lock history remains true
- Signal Chorus objects and tissue are restored
