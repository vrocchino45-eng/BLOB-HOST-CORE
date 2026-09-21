# HC-004G — Grave Loop Stability and Exit-Readiness Planning

## Purpose

HC-004G stabilizes the Grave read-before-absorb loop before any exit prototype is allowed.

This pass answers one question:

```text
After the settled silt trace transfers, does the Grave pocket remain readable and structurally safe enough to plan a later exit-readiness prototype?
```

It does not answer this by opening a route.

## Added runtime support

```text
GraveLoopStabilitySystem
```

The system activates only when:

```text
activeCellId === CELL_GRAVE_MEMORY_RESIDUE_BED_001
graveReadBeforeAbsorb.active === true
graveReadBeforeAbsorb.loopId === GRAVE_READ_BEFORE_ABSORB_LOOP_001
```

It then checks:

```text
safeMemoryTransferComplete
protected remains visible and unconsumed
recoil risk settled
player is not forcing absorb after transfer
post-transfer stable seconds reached
```

## Planning-ready output

When all criteria are met, the system may report:

```text
planning_ready_no_exit_activation
```

This is intentionally not an exit.

## Protected remains

The following objects must remain visible and unconsumed:

```text
old_core_husk_memory_001
scar_lock_plate_001
inheritance_seed_remnant_001
```

## Tuned values

```text
safeAbsorbHoldSeconds: 1.45
minimumStableSecondsAfterSafeTransfer: 3.5
maximumAllowedRecoilRisk: 0.32
```

## Forbidden scope

```text
full Grave route branch
new morph activation
runtime exit activation
combat
dialogue tree
quest log
gates
doors
teleports
old chamber runtime
stage-node loaders
branch select menu
Act expansion
consuming the old core husk
opening the inheritance seed remnant
```

## Lock condition

HC-004G is successful only if the Grave loop can complete the safe silt trace transfer, preserve the remains, and surface exit-readiness as planning-only state.
