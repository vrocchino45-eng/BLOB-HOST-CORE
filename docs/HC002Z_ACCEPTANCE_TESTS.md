# HC-002Z — Acceptance Tests

## Boot / Debug Safety

- [ ] `npm install` completes.
- [ ] `npm run dev` starts.
- [ ] Build shows `HC-002Z`.
- [ ] Starting scene renders normally.
- [ ] Safe seed appears.
- [ ] Console has no `currentMorphState is not a function` error.
- [ ] Console has no `formatBloomStage is not a function` error.
- [ ] F1 full debug works.
- [ ] F2 compact debug works.
- [ ] F3 hidden debug works.
- [ ] A debug/readability UI error, if one appears, does not stop rendering.

## Chain Regression

- [ ] Absorb safe seed.
- [ ] First no-gate morph reaches Scar-Flow.
- [ ] Scar-Flow loop completes.
- [ ] Second no-gate morph reaches Signal Chorus.
- [ ] Signal Chorus loop reaches bridge/tuned state.
- [ ] Third no-gate morph reaches Bloom Residue Fork.
- [ ] Bloom Residue loop activates.
- [ ] Residue memory silt is focus at Bloom loop start.
- [ ] Pulsing residue memory advances Bloom loop.

## State Readout

- [ ] MorphReadabilitySystem shows the same current morph as RecipeDebugOverlay.
- [ ] ChemistryDebugPanel shows the same current morph as RecipeDebugOverlay.
- [ ] Lock state shows HC-002Z / current four-cell chain data.
- [ ] Signal Chorus reward applies once.
- [ ] Bloom Residue reward applies once.

## Forbidden Regressions

- [ ] No fifth cell.
- [ ] No fourth morph destination.
- [ ] No gates.
- [ ] No doors.
- [ ] No teleports.
- [ ] No old chamber transitions.
- [ ] No combat loop.
- [ ] No HC-003 content.
