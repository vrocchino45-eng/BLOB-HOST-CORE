# HC-004B — Acceptance Tests

## Required Passing Checks

```bash
npm run validate:grave-route-recipe-pack
npm run validate:grave-route-plan
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```

## Manual Playtest Expectations

The playable flow should remain:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

Optional fork may still be reached:

```text
CELL_BLOOM_RESIDUE_FORK_001
```

The Grave route should **not** appear yet as playable traversal.

## Data Checks

```text
CELL_GRAVE_MEMORY_RESIDUE_BED_001 exists
old_core_husk_memory_001 exists
residue_silt_cloud_001 exists
scar_lock_plate_001 exists
inheritance_seed_remnant_001 exists
all Grave visual recipes exist
all Grave placeholder contracts exist
```

## Runtime Non-Activation Checks

```text
no morph plan points to Grave cell
no target focus rule points to Grave cell
no interaction loop activates Grave cell
no gate/door/teleport/branch menu is added
```
