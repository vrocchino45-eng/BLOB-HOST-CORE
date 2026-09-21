# HC-002C — Acceptance Tests

## Boot

- [ ] Build starts.
- [ ] Debug shows `HC-002C`.
- [ ] Morph Plans count is at least 1.
- [ ] Local Cell Morph panel appears in debug.

## Pre-morph loop

- [ ] Player starts in `CELL_MEMBRANE_NURSERY_001`.
- [ ] Seed nutrient is targetable.
- [ ] Hold `A` or `F` to absorb seed.
- [ ] Player composition increases in Form/Seed.
- [ ] Scar still resists unsafe absorption.

## Morph trigger

- [ ] Move near scar plate or signal thread after seed absorption.
- [ ] Pulse with `Space` or controller `X`.
- [ ] Debug `triggerReady` becomes yes before start or during scar/signal pressure.
- [ ] Debug phase changes to `morphing_continuous_control`.
- [ ] No gate prompt appears.

## During morph

- [ ] Morph progress increases gradually from 0 to 1.
- [ ] Player remains controllable.
- [ ] Chemistry values blend toward scar-flow values.
- [ ] Physical feel pressure increases.
- [ ] Flow vector becomes more directional.
- [ ] Destination visual surface fades in.
- [ ] Destination scar-flow objects appear.

## Completion

- [ ] Active cell changes to `CELL_SCAR_FLOW_FOLD_001`.
- [ ] Destination objects remain visible.
- [ ] Source objects are hidden/faded unless already absorbed.
- [ ] Debug phase becomes `completed_in_scar_flow_fold`.
- [ ] No loading screen, teleport, gate, or chamber code is used.
