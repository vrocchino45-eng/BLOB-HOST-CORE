# HC-002C — Runtime Local Cell Morph Prototype

## Purpose

HC-002C turns the authored first morph plan into a live runtime prototype:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
```

This is not a gate, door, threshold, or chamber load. The same local tissue becomes newly readable as the player’s chemistry and pressure relationship change.

## Runtime rule

```text
No gates.
No doors.
No hard transition prompt.
No fade-to-black loading.
Player remains in control.
```

## Trigger prototype

The morph can begin after:

```text
1. dormant_seed_nutrient_001 has been absorbed
2. player has Seed/Form growth
3. player moves near scar or signal pressure
4. player pulses scar_contamination_plate_001 or signal_vapor_thread_001
```

This is a debug prototype trigger, not final progression design.

## Runtime systems added

```text
src/morph/LocalCellMorphSystem.js
```

## What blends during morph

### Chemistry field

The local field blends from nursery chemistry toward scar-flow chemistry:

```text
Form decreases slightly
Flux increases
Scar increases
Residue becomes visible
Signal becomes more route-like
Seed becomes less dominant
```

### Physical feel

```text
viscosity lowers
pressure increases
flow vector becomes more directional
boundary behavior changes from membrane recoil to scar-flow recoil/current pull
```

### Visual field

```text
membrane pocket fades down but does not teleport away
scar-flow surface fades in
scar pressure haze fades in
destination chem objects appear from recipes
source chem objects fade if not already absorbed
```

## Destination content spawned

```text
scar_flow_fold_surface_001
scar_pressure_haze_001
scar_memory_fleck_001
scar_flow_clot_001
resonant_path_thread_001
pressure_fold_current_001
```

## Acceptance

HC-002C passes if:

```text
seed can still be absorbed
pulse near scar/signal after seed absorption starts morph
morph progress moves from 0 to 1
player remains controllable during morph
chemistry values visibly blend in debug
physical feel changes in debug
destination scar-flow objects appear
active cell becomes CELL_SCAR_FLOW_FOLD_001 at completion
no gate prompt appears
no chamber transition code appears
```
