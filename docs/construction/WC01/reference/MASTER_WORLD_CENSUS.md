# MASTER_WORLD_CENSUS — WC01 v0.2

Status: as-built admission. Source: feature/f1-flow-silt-circuit at d7517ee78361bed2c50dc726472b9a2aa099331a plus the working-tree manifest. Host: `HOST_ALPHA_WOUNDED_NURSERY`. See [baseline identity](../manifests/baseline.json) and [snapshot fingerprint](../manifests/snapshot-digest.json).

Runtime source: [cell registry](../../../../public/data/world/localCellRecipes.json), [mode registry](../../../../src/modes/ModeController.js), [live boundaries](../../../../src/morph/LocalCellBoundaryMorphSystem.js). Use runtime behavior for implementation claims. Historical recipe flags can differ from live readiness.

| Region ID and status | Cell ID | Subareas, landmarks and native ownership |
|---|---|---|
| surface_wake · implemented | CELL_MEMBRANE_NURSERY_001 | Nursery, seed, scar plate, living packet/current ribbon, signal thread, membrane motes, Tender, Watcher, Guide, Listening Fold. Surface Wake gameplay/ecology and LocalCellMorphSystem. |
| guide_threshold · implemented | CELL_SCAR_FLOW_FOLD_001 | Scar Fold, memory fleck, clot, resonant thread, current and ribs, Guide, Hub fold and Surface return seam. ScarFlowInteractionSystem, GuideThresholdGameplaySystem and SecondLocalCellMorphSystem. |
| hub_chamber · implemented | CELL_SIGNAL_CHORUS_NERVE_001 | Junction and cradle, memory fragment, comparison leaves, returned echoes, three territory roots, three regional mouths, Comb threshold, Guide seam. Core Work is a context. Hub Foundation and Investigation own local presentation. The boundary owner controls access. |
| silt_burrow_route · implemented | CELL_SILT_PRESSURE_ROUTE_001 | Reservoir, Veins, Garden, throats, Porosity Shelf, Catchment Bowl, Deep Reservoir, Relay, eight grains, return fold. Silt Pressure owns native ecology and revisit seating. Territory owns Shelf imprint. B3 ships opt-in. |
| vascular_route · implemented | CELL_VASCULAR_RHYTHM_ROUTE_001 | Charge, valve lane, Intake Branch, Exchange Fork, Return Capillary, three Relays, return fold and paired Vascular II handoff. Vascular Rhythm owns current, cadence, recovery and route progression. |
| grave_memory_route · implemented | CELL_GRAVE_MEMORY_RESIDUE_BED_001 | Grave I trace, Husk, Scar Lock Plate, Seed Remnant, First Imprint, Contradiction Terrace, Inheritance Vault, Watcher and return fold. Grave II resonance and rupture use the same cell. Grave Memory, Grave Return, Resonance and Rupture owners. |
| comb_threshold · implemented | CELL_COMB_THRESHOLD_FILTER_001 | Living filter, teeth and channels, memory lobes, terminal membrane, seal, Watcher, Relay, Hub return. Comb Foundation and Playable owners. Current end-to-end human coverage is partial. |
| aperture_fields · implemented locally / partial wider ecology | CELL_APERTURE_FIELDS_ARRIVAL_001 | Arrival Shelf, Signal Plain, Membrane Ridge, Gathering Ground, Comb return. Aperture Arrival, Signal Plain, Ridge, Adjacent Territory and Gathering Ground owners. |
| Bloom Fork · dormant | CELL_BLOOM_RESIDUE_FORK_001 | Authored landmarks without a live mount. Legacy Bloom and Signal Chorus handoffs are historical. |
| Grave Scar-Memory Seam · dormant | CELL_GRAVE_SCAR_MEMORY_SEAM_001 | Authored seam landmarks without a live mount. Legacy first-read and seam handoff owners are historical. |
| Later v1 areas · absent | No live cell IDs | Wider Host Ecology, Strand B and Host-scale plans have no live mounts here. |

## Transitions

| Edge / recipe ID | Permission and owner |
|---|---|
| Surface → Scar | Opening nutrient and living-membrane interaction lead to the Listening Fold. LocalCellMorphSystem. |
| Scar → Surface · guide_surface_memory_seam | Established early return seam. LocalCellBoundaryMorphSystem. |
| Scar → Hub | Native threshold readiness and SecondLocalCellMorphSystem. |
| Hub → Scar · hub_guide_memory_seam | Established early return seam. LocalCellBoundaryMorphSystem. |
| hub_to_grave, hub_to_vascular, hub_to_silt | Direct, individually prepared route within commit range. Existing A/E. No Grave-first or optional Hub investigation requirement. |
| grave_to_hub | Ready after Grave I imprint and route readiness, subject to fold proximity and arming. Grave II resolution is optional for exit. |
| vascular_to_hub, silt_to_hub | Each native objective and ready fold, subject to fold proximity and arming. |
| hub_to_comb, comb_to_hub | Three first returns or equivalent convergence unlock prepared entry in range. Comb has its own return rule. |
| comb_to_aperture, aperture_to_comb | Comb challenge and open, prepared seal. Aperture has a return near its entry fold. |
| Local revisit and subarea steps | Grave II, Vascular II, Silt II and Gathering Ground retain their parent cell ID. Debug jumps do not verify normal access. |

[Boundary recipes](../../../../src/morph/LocalCellBoundaryRecipeRegistry.js) · [Entity and landmark schedule](ENTITY_AND_LANDMARK_SCHEDULE.md) · [Region sheets](REGION_BLUEPRINTS/README.md)

## Gap assessment handoff

Use the [Design/RFI Register](DESIGN_RFI_REGISTER.md) to move each gap into the [Design and Canon Review](DESIGN_AND_CANON_REVIEW.md) before preparing a construction release. This step preserves the differences between as-built observations, historic intent, approved specifications and proposed meaning.
