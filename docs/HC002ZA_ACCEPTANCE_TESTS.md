# HC-002ZA — Acceptance Tests

## Boot / Debug

- [ ] Build shows `HC-002ZA`.
- [ ] No console errors on boot.
- [ ] F1 full debug works.
- [ ] F2 compact debug works.
- [ ] F3 hidden debug works.

## Camera

- [ ] Right stick orbits camera around the player core.
- [ ] Right stick vertical tilts camera up/down.
- [ ] R3 recenters camera behind/above the core.
- [ ] I/J/K/L provide keyboard camera look.
- [ ] C recenters camera.
- [ ] Player core remains visually recoverable when tissue masses overlap.

## Four-Cell Chain

- [ ] Seed absorb still works.
- [ ] First morph reaches Scar-Flow.
- [ ] Scar-Flow loop still completes.
- [ ] Second morph reaches Signal Chorus.
- [ ] Signal Chorus loop still completes.
- [ ] Third morph reaches Bloom Residue Fork.
- [ ] Bloom Residue loop still reaches stable/prepared state.

## Readout Cleanup

- [ ] After Bloom Residue completion, compact debug says chain is stable / lock candidate.
- [ ] Compact debug does not foreground stale Signal Chorus inactive text.
- [ ] Compact debug does not foreground stale Scar-Flow hook text.
- [ ] Completed morph readout does not show confusing `Ready: no` language.
