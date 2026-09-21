# HC-002A — Next Pass Plan

## HC-002B — First Morph Cell Recipe Pack

Mode: data/content setup

Build:

```text
CELL_SCAR_FLOW_FOLD_001 active recipe
scar_flow_fold_surface_v01
scar_pressure_haze_v01
scar_memory_fleck_001
scar_flow_clot_001
resonant_path_thread_001
pressure_fold_current_001
placeholder contracts for all new objects
```

Acceptance:

```text
all new morph-cell objects have recipes
all placeholders have replacements
source/destination cell data both validate
HC-001N still runs
no runtime morph yet
```

## HC-002C — LocalCellMorphSystem Prototype

Mode: implementation

Build:

```text
LocalCellMorphSystem
ChemistryBlendSystem
MorphDebugPanel
blend value 0..1
visual interpolation from source to destination
```

Acceptance:

```text
player remains in continuous control
no gate prompt
no chamber transition
chemistry values blend visibly
membrane pocket gradually becomes scar-flow fold
```

## HC-002D — Morph Feel Tuning

Mode: convergence

Build:

```text
camera pressure follow
flow pull tuning
scar crack route readability
Guide path interpretation
controller feel pass
```

Acceptance:

```text
morph feels like host tissue changing
not like entering a room
not confusing or too subtle
controller remains usable
```

## HC-002E — Morph Lock Candidate

Mode: lock/regression

Build:

```text
HC002 regression checklist
placeholder report
known issues
lock decision
```

Acceptance:

```text
first local-cell morph is stable
old gate/chamber logic remains absent
second local cell proves the fractal-region approach
```
