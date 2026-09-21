# HC-002ZA — Four-Cell Chain Readability + Camera Control Cleanup

## Purpose

HC-002Z proved the four-cell chain can complete without the earlier debug/readability crashes. HC-002ZA cleans up the remaining playtest confusion and addresses the camera being too fixed.

## Fixed Readability Issues

- Completed morph readouts no longer show misleading `Ready: no` language.
- Compact debug panels stop displaying stale inactive Signal/Scar sections after the player is already inside Bloom Residue Fork.
- Bloom Residue completion now reads as a four-cell lock-candidate state.

## Camera Fix

The camera is now a player-tethered orbit camera:

```text
Right Stick = orbit / tilt around player core
R3 = recenter
I/J/K/L = keyboard camera look
C = keyboard recenter
```

The camera remains tied to the player core. This is not a detached debug camera and does not change gameplay scope.

## Forbidden Scope

- no fifth cell
- no new morph destination
- no HC-003 content
- no dialogue system
- no combat
