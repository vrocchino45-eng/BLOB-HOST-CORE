# HC-006H — True Source Rebaseline

## Purpose

Reconcile the active HC-006G runtime with `HOST_CORE_Blueprint_v1_reference_docs.zip` before further feature expansion.

## Source authority

```text
Universe: BLOB
Game Line: BLOB: HOST CORE
Blueprint: HOST_CORE_Blueprint_v1
Foundation: BLOB/HOST_CORE_V001_foundation_slice/
```

The copied `reference_docs/` directory is authoritative inside this build.

## Decisions

### Preserved

The working layered interactions, persistent tight camera, camera-relative movement, Signal Chorus/Grave continuity, and diagnostics are valid runtime experiments worth retaining.

### Corrected

1. Physical input ownership is canonical and global.
2. A is interact; it is not a context-dependent pulse/absorb/hold button.
3. X is pulse, RT absorb, LT stabilize, Y Guide focus, R3 recenter/lock.
4. Authored living gates are valid through `GateSystem` and `GateRegistry`.
5. Arbitrary doors, teleports, menus-as-world, renderer-owned transitions, and one-off chamber hacks remain invalid.
6. Signal Chorus is a route-awareness proxy, not a substitute for a completed Hub Chamber architecture.

## Ownership added

```text
InputSystem reads devices
→ ControlMap maps physical controls to actions
→ active mode/system consumes actions
→ GameState/frame state stores truth
→ HUD/debug reads truth
```

No region system is allowed to remap the physical A/X/RT/LT/Y buttons.

## Scope boundary

No new region, route, threshold crossing, ecology, combat, or cinematic was added. The pass is architecture convergence only.
