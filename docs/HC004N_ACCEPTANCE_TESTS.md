# HC-004N Acceptance Tests

## Playtest path

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
→ CELL_BLOOM_RESIDUE_FORK_001
→ CELL_GRAVE_MEMORY_RESIDUE_BED_001
→ CELL_GRAVE_SCAR_MEMORY_SEAM_001
```

## Expected behavior

- The first playable minute chain still runs.
- Grave Memory Residue Bed still uses the HC-004F/HC-004G/HC-004H read-readiness behavior.
- Pulsing the scar-readiness state can still start the HC-004M continuity pull into the seam.
- Once arrived in the seam, the HUD shows seam first-read progress.
- Guide prompts direct the player through thread, lattice, echo, and closed suture.
- Pulse/proximity advances read progress.
- Absorb is blocked and does not consume seam objects.
- Completion marks the seam read but does not open an exit.

## Regression exclusions

- No old gates.
- No doors.
- No teleports.
- No old exit registry path.
- No branch select menu.
- No combat.
- No dialogue tree.
- No quest log.
- No Act expansion.
