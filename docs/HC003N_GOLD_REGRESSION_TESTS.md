# HC-003N — Gold Regression Tests

## Boot / Validation

- [ ] `npm install` completes.
- [ ] `npm run validate:recipe-data` passes.
- [ ] `npm run validate:prompt-lock` passes.
- [ ] `npm run validate:playtest-hud` passes.
- [ ] `npm run validate:first-minute-visual-polish` passes.
- [ ] `npm run validate:gold-candidate` passes.
- [ ] `npm run audit:undefined-methods` passes.
- [ ] `npm run build` passes.
- [ ] Game boots as `HC-003N`.
- [ ] No red startup error screen appears.

## Debug-Hidden Playtest

- [ ] Debug starts hidden.
- [ ] Guide prompt is visible.
- [ ] Playtest HUD is visible.
- [ ] Tissue Shift reads as a small secondary no-gate strip.
- [ ] F1/F2/F3 still reveal/hide debug.

## Required Opening Chain

- [ ] Player core is visible at boot.
- [ ] Safe seed is visually readable and targetable.
- [ ] A/F absorb completes seed absorb.
- [ ] Scar contamination reads unsafe.
- [ ] First morph reaches `CELL_SCAR_FLOW_FOLD_001` without a gate.
- [ ] Scar-Flow loop stabilizes.
- [ ] Second morph reaches `CELL_SIGNAL_CHORUS_NERVE_001` without a gate.
- [ ] Signal Chorus loop completes.
- [ ] First playable minute reads complete.

## Controller

- [ ] Left stick moves comfortably.
- [ ] Right stick camera helps visibility.
- [ ] A absorb feels forgiving.
- [ ] X pulse is readable.
- [ ] R3 recenters camera.
- [ ] Required chain can be completed on controller only.

## Forbidden Regression

- [ ] No gates.
- [ ] No doors.
- [ ] No teleports.
- [ ] No old chamber runtime.
- [ ] No old exit registry behavior.
- [ ] No route runtime.
- [ ] No fifth cell.
- [ ] No combat.
- [ ] No dialogue tree or quest log.
