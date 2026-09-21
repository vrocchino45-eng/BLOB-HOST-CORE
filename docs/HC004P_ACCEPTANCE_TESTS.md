# HC-004P Acceptance Tests

## Must pass

- `CELL_MEMBRANE_NURSERY_001 → CELL_SCAR_FLOW_FOLD_001 → CELL_SIGNAL_CHORUS_NERVE_001` remains preserved.
- Grave route to `CELL_GRAVE_MEMORY_RESIDUE_BED_001` remains preserved.
- Scar-memory seam arrival, first-read, and fold-back remain preserved.
- After HC-004O fold-back, Grave bed exposes a post-seam response loop.
- The loop reads `old_core_husk_memory_001`, `scar_lock_plate_001`, then `inheritance_seed_remnant_001`.
- Absorb does not start the response.
- The old core husk is not consumed.
- The inheritance seed remnant is not opened.
- No branch, exit, gate, door, teleport, old chamber runtime, stage-node loader, combat, dialogue tree, or quest log is added.

## Validation commands

```text
npm run validate:grave-bed-post-seam-response
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```
