# HC-002H — Scar-Flow Cell Arrival Stabilization

## Purpose

HC-002H stabilizes the moment after the first no-gate morph completes.

HC-002C–G proved that the nursery pocket can fold into `CELL_SCAR_FLOW_FOLD_001`. This pass makes the destination cell clearly become the active play space instead of letting the old nursery objects, entities, and guide behavior continue to compete for focus.

## Adds

- `src/morph/ScarFlowArrivalSystem.js`
- scar-flow arrival state in `frameState.scarFlowArrival`
- active-cell focus ring after morph completion
- focus line toward the most relevant scar-flow hook
- source nursery chem-object suppression after arrival
- nursery Tender / Watcher background staging after arrival
- Guide reinterpretation behavior for scar-flow hooks
- debug readouts for scar-flow arrival state
- world-facing completion text that points the player toward scar-flow hooks

## Active Cell Rule

After morph completion:

```text
activeCellId = CELL_SCAR_FLOW_FOLD_001
```

Source nursery chem objects should not steal targeting or selection once the scar-flow fold is active.

## Post-Morph Focus Priority

```text
resonant_path_thread_001    first path read
pressure_fold_current_001   movement / relief read
scar_memory_fleck_001       memory echo read
scar_flow_clot_001          warning / do-not-absorb read
```

## Acceptance Tests

- Complete the morph from nursery to scar-flow fold.
- Confirm active cell reads `CELL_SCAR_FLOW_FOLD_001`.
- Confirm the panel says you are inside the scar-flow fold.
- Confirm selected target prioritizes scar-flow objects.
- Confirm nursery chem objects no longer steal target focus.
- Confirm Tender / Watcher visually recede into support/background roles.
- Confirm Guide points toward scar-flow focus objects instead of the old seed.
- Confirm no gate, door, fade, or teleport is added.

## Next Pass

If HC-002H feels stable, the next useful pass is:

```text
HC-002I — Scar-Flow Hook Interaction Tuning
```

That pass should make the four destination hooks more deliberately playable before planning the next cell.
