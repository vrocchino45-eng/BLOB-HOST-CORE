# HC-002I — Acceptance Tests

## Setup

1. Run the build.
2. Absorb the safe seed nutrient.
3. Move near scar/signal and pulse to complete the first local-cell morph.
4. Confirm active cell becomes `CELL_SCAR_FLOW_FOLD_001`.

## Interaction Loop

- [ ] Morph panel changes from arrival text to scar-flow stabilization text.
- [ ] Debug shows `Scar-Flow Interaction` active.
- [ ] Stage begins at `memory_read`.
- [ ] Pulsing `scar_memory_fleck_001` advances memory read.
- [ ] Stage advances to `path_aligned`.
- [ ] Pulsing `resonant_path_thread_001` advances path alignment.
- [ ] Stage advances to `pressure_relieved`.
- [ ] Moving through or pulsing `pressure_fold_current_001` relieves pressure.
- [ ] Stage advances to `clot_respected`.
- [ ] Holding absorb on `scar_flow_clot_001` increases warning / does not behave like a pickup.
- [ ] Pulsing/respecting clot after path/pressure advances the loop.
- [ ] Loop reaches `scar_flow_stable` or prepared state.

## Regression Checks

- [ ] Seed absorb still works before morph.
- [ ] No nursery source object steals target focus after arrival.
- [ ] Controller still works.
- [ ] Target halo follows scar-flow interaction focus.
- [ ] No hard gate, door, or transition returns.
