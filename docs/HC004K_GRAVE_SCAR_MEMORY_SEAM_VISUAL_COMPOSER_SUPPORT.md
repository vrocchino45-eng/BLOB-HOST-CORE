# HC-004K — Grave Scar-Memory Seam Visual Composer Support

## Mode

Visual composer support only. No runtime activation.

## Goal

Route every HC-004J scar-memory seam visual recipe to a concrete composer method before the seam becomes reachable or interactive.

## Composer coverage

| Visual recipe | Silhouette | Composer method |
|---|---|---|
| `grave_scar_memory_seam_surface_v01` | `closed_scar_memory_seam_basin` | `EnvironmentVisualComposer.composeGraveScarMemorySeamSurface` |
| `grave_scar_memory_seam_haze_v01` | `thin_haze_caught_between_suture_threads` | `EnvironmentVisualComposer.composeGraveScarMemorySeamHaze` |
| `scar_memory_seam_thread_v01` | `thin_suture_thread_with_memory_knots` | `ChemObjectVisualComposer.composeScarMemorySeamThread` |
| `residue_stitch_lattice_v01` | `settled_lattice_of_silt_and_scar_stitches` | `ChemObjectVisualComposer.composeResidueStitchLattice` |
| `echo_husk_imprint_v01` | `transparent_collapsed_core_imprint` | `ChemObjectVisualComposer.composeEchoHuskImprint` |
| `closed_inheritance_suture_v01` | `small_dim_seed_inside_closed_scar_ring` | `ChemObjectVisualComposer.composeClosedInheritanceSuture` |

## Runtime lock

`CELL_GRAVE_SCAR_MEMORY_SEAM_001` remains:

```text
authored_recipe_pack_not_runtime_active
planned_only_not_runtime_active
not_runtime_active
forbidden_this_pass
```

## Forbidden

- no runtime exit activation
- no player relocation
- no route branch
- no morph activation
- no seam target focus rule
- no seam interaction loop
- no gate, door, teleport, branch menu, stage-node loader, or old chamber runtime
