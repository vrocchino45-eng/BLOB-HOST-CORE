# HC-002D — Acceptance Tests

## Boot

- [ ] Build shows `HC-002D`.
- [ ] Manifest shows `Morph Readability + Stabilization`.
- [ ] No missing recipe errors.

## Morph readability

- [ ] Bottom morph panel appears.
- [ ] Panel starts with seed absorb instruction.
- [ ] After seed absorption, panel asks player to move toward scar/signal.
- [ ] Near scar/signal, panel says morph is armed.
- [ ] World cue ring appears when armed.
- [ ] Pressing Space/X starts the morph.
- [ ] Progress bar moves from 0 to 100.
- [ ] Inner ring indicates progress.

## Stabilization

- [ ] Morph can start even if exact pulse affected list misses by a frame, as long as player pulses under scar/signal pressure.
- [ ] Player control is never removed.
- [ ] No door/gate/teleport prompt appears.
- [ ] Destination scar-flow cell fades in.

## Regression

- [ ] Seed absorb still works.
- [ ] Scar still resists unsafe absorb.
- [ ] Tender/Watcher still spawn.
- [ ] Guide still spawns.
- [ ] Controller still works.
