# HC-002O — Acceptance Tests

## Data validation

- [ ] `signalChorusExitReadinessRules.json` loads.
- [ ] `thirdLocalCellMorphPlans.json` loads.
- [ ] `plannedLocalCells_HC002O.json` loads.
- [ ] `SIGNAL_CHORUS_EXIT_READINESS_001` validates against `SIGNAL_CHORUS_LOOP_001`.
- [ ] `MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001` validates.
- [ ] `CELL_BLOOM_RESIDUE_FORK_001` exists as planned-only data.

## Runtime safety

- [ ] The app still boots.
- [ ] Existing chain still works.
- [ ] No third runtime morph triggers yet.
- [ ] No new cell spawns yet.
- [ ] No doors, gates, prompts, teleports, or chamber transitions are added.

## Planning clarity

- [ ] The next pass is clearly a recipe pack, not runtime implementation.
- [ ] The Bloom-Residue Fork explains why bloom follows Signal Chorus.
- [ ] The plan keeps the no-gate morph rule intact.
