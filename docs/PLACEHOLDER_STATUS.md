# HC-001N — Placeholder Status

## HC-010F Grave landmark lock

The following historical contracts remain in data for auditability but are now inactive and replaced by locked recipe composition:

| Placeholder ID | Locked replacement | Status |
| --- | --- | --- |
| `debug_old_core_husk_memory_001` | `old_core_husk_memory_v01` | replaced in HC-010F |
| `debug_residue_silt_cloud_001` | `residue_silt_cloud_v01` | replaced in HC-010F |
| `debug_scar_lock_plate_001` | `scar_lock_plate_v01` | replaced in HC-010F |
| `debug_inheritance_seed_remnant_001` | `inheritance_seed_remnant_v01` | replaced in HC-010F |

These four records no longer contribute to active or expired placeholder counts.

## Rule

A placeholder is allowed only if it has:

```text
placeholder ID
primitive/current form
replacement visual recipe
allowed-until pass
required visual traits
meaning
```

## Current Placeholder Contracts

| Placeholder ID | Replacement Recipe | Allowed Until | Status |
|---|---|---:|---|
| `debug_player_core_001` | `player_seed_core_stage_01` | `HC_VIS_002` | active prototype placeholder |
| `debug_nutrient_seed_001` | `dormant_seed_nutrient_v01` | `HC_VIS_003` | active prototype placeholder |
| `debug_scar_plate_001` | `scar_contamination_plate_v01` | `HC_VIS_003` | active prototype placeholder |
| `debug_flux_ribbon_001` | `flux_current_ribbon_v01` | `HC_VIS_003` | active prototype placeholder |
| `debug_signal_thread_001` | `signal_vapor_thread_v01` | `HC_VIS_003` | active prototype placeholder |
| `debug_tender_001` | `nursery_membrane_tender_v01` | `HC_VIS_004` | active prototype placeholder |
| `debug_watcher_001` | `membrane_watcher_v01` | `HC_VIS_004` | active prototype placeholder |
| `debug_guide_orbiter_001` | `guide_orbiter_folded_lantern_v01` | `HC_VIS_004` | active prototype placeholder |

## Important Note

Several objects have already moved beyond plain primitives because `VisualComposer` builds multi-part procedural compositions. However, they still count as placeholders until the project chooses to lock them as acceptable prototype visuals or replace them with stronger procedural/authored assets.

## HC-001N Lock Interpretation

For the HC-001N lock candidate, these placeholders are acceptable if:

- each object is visually readable in playtest
- debug overlay shows its recipe and replacement
- no object appears as an unexplained sphere/oval/cube
- the replacement destination remains coded

## Replacement Priority After Lock

### Highest priority

```text
player_seed_core_stage_01
dormant_seed_nutrient_v01
guide_orbiter_folded_lantern_v01
```

### Medium priority

```text
nursery_membrane_tender_v01
membrane_watcher_v01
scar_contamination_plate_v01
```

### Lower priority

```text
flux_current_ribbon_v01
signal_vapor_thread_v01
membrane_pocket_surface_v01
```
