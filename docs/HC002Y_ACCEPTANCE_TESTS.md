# HC-002Y — Acceptance Tests

## Regression Path

- [ ] Absorb safe seed in Membrane Nursery.
- [ ] Trigger first no-gate morph into Scar-Flow.
- [ ] Complete Scar-Flow loop.
- [ ] Trigger second no-gate morph into Signal Chorus.
- [ ] Complete Signal Chorus loop.
- [ ] Trigger third no-gate morph into Bloom Residue Fork.

## Bloom Residue Bug Fix Checks

- [ ] Browser console has no `formatBloomStage is not a function` error.
- [ ] Active cell reads `CELL_BLOOM_RESIDUE_FORK_001`.
- [ ] Morph phase reads `completed_in_bloom_residue_fork` in compact debug.
- [ ] Bloom Residue Arrival becomes active or hands off cleanly to Bloom Loop.
- [ ] Bloom Residue Loop becomes active.
- [ ] Bloom Loop focus starts on `residue_memory_silt_001`.
- [ ] Pulsing `residue_memory_silt_001` advances the Bloom loop.
- [ ] Signal Chorus panel does not block or overwrite Bloom Residue state.

## Forbidden Regression Checks

- [ ] No fifth cell appears.
- [ ] No fourth/fifth morph destination is activated.
- [ ] No gate/door/teleport logic returns.
- [ ] Controller and keyboard still work.
