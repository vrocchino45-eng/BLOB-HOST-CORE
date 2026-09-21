# HC-028F Build Report — All Built Region Composition Embodiment

## Parent
HC-028E — Regional Composition Triad

## Purpose
Carry the proven World Composition grammar beyond Vascular/Silt/Grave and make **every runtime-active built region** speak through the same Host clock, Core resonance grammar, restrained rhythm/bass language and existing Host matter field.

## Scope boundary
The active first-slice region registry contains eight built regions, each with one runtime cell:

| Region | Cell | Key | Meter | Physical law |
|---|---|---|---|---|
| Surface Wake | `CELL_MEMBRANE_NURSERY_001` | A-P-S | 6/8 | buoyant nursery exchange |
| Guide Threshold | `CELL_SCAR_FLOW_FOLD_001` | S-P-A | 4/4 | directional threshold alignment |
| Hub Chamber | `CELL_SIGNAL_CHORUS_NERVE_001` | S-P-A | 6/4 | balanced junction orbit |
| Grave Memory | `CELL_GRAVE_MEMORY_RESIDUE_BED_001` | S-A-P | 12/8 | retained memory recoil |
| Vascular Rhythm | `CELL_VASCULAR_RHYTHM_ROUTE_001` | P-S-A | 4/4 | laminar transmission |
| Silt Pressure | `CELL_SILT_PRESSURE_ROUTE_001` | A-S-P | 3/4 | compression / accumulation / release |
| Comb Threshold | `CELL_COMB_THRESHOLD_FILTER_001` | S-A-P | 6/8 | sorting filter bands |
| Aperture Fields arrival | `CELL_APERTURE_FIELDS_ARRIVAL_001` | P-A-S | 12/8 | decompression field exchange |

Dormant/side cells such as Bloom Residue Fork and Grave Scar Memory Seam are **not** promoted into full regions by this pass.

## One clock, eight sentences
All eight profiles resolve from the existing **5.8-second Host cycle**. No second timer is introduced.

The composition profile continues to publish:
- key / function order,
- meter and grouping,
- accent hierarchy,
- octave / scale identity,
- restrained profile-authored rhythm/bass voice,
- zero timing-gate authority.

Vascular keeps the existing HC028C/HC028E movement presentation range of 0.96–1.06 flow scale. Every other region publishes a neutral 1.0 movement scale.

## Regional Physical Embodiment bridge
Added `RegionalPhysicalEmbodimentSystem`.

It reads the active region's authored composition and produces a bounded interpretation for **existing Host material only**:
- radial tendency,
- tangential tendency,
- vertical/flow bias,
- drift/damping scale,
- clustering/settling scale,
- current-rider bias,
- local field-radius expression.

It explicitly publishes:
- `movementAuthority: false`
- `collisionAuthority: false`
- `verbAuthority: false`
- `routeAuthority: false`
- `progressionAuthority: false`
- `inputTimingGate: false`
- `addsClock: false`

## Existing material consumer
`AmbientMaterialInteractionSystem` remains the material owner. Its existing 66-mote Host field now reads `regionalPhysicalEmbodiment` in the same per-mote update loop.

No second particle field, new mesh family, waypoint system, collision volume, route owner or gameplay loop was added.

Base material identity is now authored for all eight regions:
- Surface: living suspension / buoyant nursery behavior
- Guide: pressurized directional current
- Hub: junction chorus / centered orbital behavior
- Grave: residue / settling memory
- Vascular: current-rider suspension
- Silt: dense particulate beds
- Comb: sorting/filter grains
- Aperture: open field suspension

## Audio
`EventAnchoredHostAudioSystem` was already profile-driven in HC028E, so it required no source change. The five newly composed regions now naturally receive their own restrained voices from `WorldCompositionRegistry` while keeping the HC027D1 mix calibration unchanged.

This remains a functional rhythm/bass vocabulary, not imitation of a specific artist or track.

## Locked gameplay truth
The following owners are byte-identical to HC028E:
- Core engine / 3→6→12
- Core verb coupling and physicalization
- Input / control map / D2 commitment
- player movement and convergence
- Host rhythm owner
- Core↔World resonance owner
- audio renderer / HC027D1 mix calibration
- Surface gameplay
- Guide gameplay
- Hub foundation
- Vascular route gameplay
- Silt route gameplay
- Grave route gameplay
- Comb playable threshold
- Aperture Fields arrival gameplay

18 parent-owner hashes are checked by the HC028F validator.

## Runtime diff
Against HC028E before documentation files:
- runtime JS added: **1** (`RegionalPhysicalEmbodimentSystem.js`)
- runtime JS modified: **4** (`WorldCompositionRegistry`, `AmbientMaterialInteractionSystem`, `GameRuntime`, `main.js`)
- runtime JS removed: **0**

Runtime source count: **98**.

## Validation
- `validate:hc028f` — PASS
- recipe-data load — PASS
- undefined `this.method()` audit — PASS
- runtime JS syntax — **98/98 PASS**
- public JSON parse — **371/371 PASS**
- locked parent gameplay owners — **18/18 hash matched**

The handoff tree does not contain installed `node_modules`, so a Vite production render was not executed in this packaging environment.
