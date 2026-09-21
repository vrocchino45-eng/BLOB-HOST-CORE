# HC-004C — Grave Visual Composer Support

## Summary

HC-004C adds visual composer support for the Grave Memory / Residue-Scar route recipes created in HC-004B.

The pass is intentionally visual-only. It does not activate the route.

## Environment Recipe Support

```text
grave_memory_residue_bed_surface_v01
silhouette: low_settling_residue_basin_with_half_buried_core_shells
composer: EnvironmentVisualComposer.composeGraveMemoryResidueBedSurface
```

Purpose:

```text
readable low basin
half-buried old core shells
non-gate scar boundary
settling residue surface
```

```text
grave_memory_silt_haze_v01
silhouette: wide_soft_ash_haze_with_threadlike_signal_flickers
composer: EnvironmentVisualComposer.composeGraveMemorySiltHaze
```

Purpose:

```text
soft ash haze
signal flicker threads
memory motes
not a poison cloud
not an exit marker
```

## Chem Object Recipe Support

```text
old_core_husk_memory_v01
silhouette: collapsed_seed_core_shell_with_missing_inner_ring
composer: ChemObjectVisualComposer.composeOldCoreHuskMemory
```

```text
residue_silt_cloud_v01
silhouette: soft_irregular_silt_cloud_with_threaded_voids
composer: ChemObjectVisualComposer.composeResidueSiltCloud
```

```text
scar_lock_plate_v01
silhouette: interlocking_dark_plate_with_rounded_guard_edges
composer: ChemObjectVisualComposer.composeScarLockPlate
```

```text
inheritance_seed_remnant_v01
silhouette: small_seed_pod_nested_inside_residue_ring
composer: ChemObjectVisualComposer.composeInheritanceSeedRemnant
```

## Design Intent

The Grave route should read as memory and remains before it reads as food. These visuals are not rewards, gates, enemies, or teleporters. They are authored objects for a future read-before-absorb loop.

## Runtime Status

```text
not reachable
not morphed
not spawned
not target focused
not interactable
not a route activation
```
