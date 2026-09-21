# HC-005D Acceptance Tests

## Runtime state

- [ ] SignalChorusReturnStateSystem remains the authoritative F1 owner.
- [ ] Active cell remains `CELL_SIGNAL_CHORUS_NERVE_001`.
- [ ] Pressure appears only after the held return state prerequisite.
- [ ] Stage reports `combward_pressure_readable`.
- [ ] Pressure reaches 100% reveal.

## Interaction safety

- [ ] Expected target remains `none`.
- [ ] Actual target remains `none`.
- [ ] No reticle appears on the pressure.
- [ ] A/X/Space do not activate the pressure.
- [ ] Moving into the pressure does not relocate the player or change cells.

## Visual/readability

- [ ] Four directional strands are visible.
- [ ] Five open ribs are visible as cadence/pressure, not a closed portal.
- [ ] Three pulses travel outward.
- [ ] Player and Signal Chorus remain readable.
- [ ] HC-005C haze remains low-opacity and camera-relative movement remains correct.

## Forbidden expansion

- [ ] Comb Threshold remains closed and unimplemented.
- [ ] Aperture Fields remain inactive.
- [ ] No new morph, local cell, gate, door, teleport, or branch menu exists.
- [ ] Grave remains locked and protected remains remain unconsumed.

## Regression

- [ ] Opening slice runs.
- [ ] Bloom-to-Grave route runs.
- [ ] Grave loop, seam, fold-back, route lock, and return run.
- [ ] Signal return state remains durable and no-target.
- [ ] Controller left-stick up remains camera-forward after right-stick orbit.
- [ ] Nonfatal errors remain zero.
