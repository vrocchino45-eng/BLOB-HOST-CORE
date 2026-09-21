# HC-004H — Grave Exit Readiness Prototype

## Purpose

Prototype a readable Grave exit-readiness state after HC-004G stability without activating an exit.

The player may see the scar lock become meaningfully readable, but the pass must not open a route, move the player, activate a morph, create a branch, or revive old route architecture.

## Added runtime layer

```text
GraveExitReadinessSystem
```

The system activates only when:

```text
activeCellId === CELL_GRAVE_MEMORY_RESIDUE_BED_001
GraveLoopStabilitySystem is active
HC-004G planningReady is true
safeMemoryTransferComplete is true
protected remains are visible
recoil is settled
absorb is not being forced
```

## Readiness output

```text
exit_readiness_visible_no_exit_activation
```

Meaning:

```text
The scar lock is readable as a future way forward.
It is not open.
No transition happens.
No gate exists.
No route branch exists.
No player relocation happens.
```

## Protected remains

```text
old_core_husk_memory_001
scar_lock_plate_001
inheritance_seed_remnant_001
```

These must remain visible and unconsumed.

## Forbidden scope

```text
runtime exit activation
player relocation
new route branch
new morph activation
full Grave route branch
combat
dialogue tree
quest log
gates
doors
teleports
old chamber runtime
old exit registries
stage-node loaders
branch select menu
Act expansion
consuming old core husk
opening inheritance seed remnant
```

## Acceptance

```text
The readiness marker appears only after HC-004G stability.
The scar lock is marked as readable, not open.
HUD and Guide both say no exit activates yet.
Protected remains stay visible and unconsumed.
No old route architecture returns.
The HC-003N first playable minute remains valid.
```
