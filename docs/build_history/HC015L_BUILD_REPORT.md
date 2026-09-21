# BLOB: HOST CORE — HC015L

## Mode
Convergence / Tight Camera occlusion closeout.

## Purpose
Finish the current Signal Plain refinement campaign, then move development focus onward.

## Locked
Signal Plain receptor gameplay, Stabilize/READY/Pulse completion, HC015K completion response, player movement, Tight Camera distance/selection, routes, gates, progression, debug jumps.

## Change
The inspection occlusion system now protects a small camera-space corridor around both the Core and the active inspection focus instead of casting only two center rays.

- 9 rays around focus + 9 rays around player form the protected corridor.
- Only already-authored inspection-fadeable/living tissue may be softened.
- True ray blockers fade much harder at close distance.
- Eligible anatomy within an extreme near-camera radius receives an additional distance-gated fade.
- Restoration behavior remains smooth when tissue leaves the corridor or Tight Camera closes.
- No global transparency reduction and no camera pullback were added.

## Exit criterion
This is the last planned Signal Plain-specific camera/readability pass for now. After playtest confirmation, development should move to the next broader gameplay-convergence target rather than continue polishing this local slice.
