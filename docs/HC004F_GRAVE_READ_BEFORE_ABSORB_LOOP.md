# HC-004F — Grave Read-Before-Absorb Loop

## Runtime owner

```text
src/morph/GraveReadBeforeAbsorbSystem.js
```

## Data owner

```text
public/data/morph/graveReadBeforeAbsorbRecipes.json
```

## Target focus owner

```text
public/data/targeting/targetFocusRules.json
TARGET_FOCUS_GRAVE_MEMORY_001
```

## Loop sequence

```text
1. old_core_husk_memory_001        → husk_memory_read
2. residue_silt_cloud_001          → silt_memory_settled
3. scar_lock_plate_001             → scar_lock_understood
4. inheritance_seed_remnant_001    → seed_remnant_warmed
5. residue_silt_cloud_001          → safe_silt_transfer
```

## Interaction rule

```text
Read first.
Absorb only after the Grave loop marks safeAbsorbReady.
Only residue_silt_cloud_001 can complete the safe transfer in HC-004F.
```

## Preserved objects

```text
old_core_husk_memory_001
scar_lock_plate_001
inheritance_seed_remnant_001
```

These objects must remain visible and unconsumed after the safe transfer.

## Forbidden behavior

```text
No combat.
No dialogue tree.
No quest log.
No new route branch.
No new morph activation.
No gates, doors, or teleports.
No old chamber runtime.
No consuming the old core husk.
No opening the inheritance seed remnant.
```

## State outputs

```text
graveReadBeforeAbsorb.active
graveReadBeforeAbsorb.progress
graveReadBeforeAbsorb.currentFocus
graveReadBeforeAbsorb.safeAbsorbReady
graveReadBeforeAbsorb.safeMemoryTransferComplete
graveReadBeforeAbsorb.nextAction
```

## Next pass handoff

```text
HC-004G — Grave Loop Stability and Exit-Readiness Planning
```

HC-004G should test stability, readability, and exit-readiness planning. It should not immediately open a broad route branch unless HC-004F is readable and stable.
