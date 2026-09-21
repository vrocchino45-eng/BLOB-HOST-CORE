# BLOB: HOST CORE — HC-014F Build Report

## Pass
Comb Endpoint Separation Fix

## Root cause
The sixth mixed filter and the Aperture membrane occupied overlapping player-readable space. Filter 6 was centered at Z -8.75 with a 0.70 read range while the membrane at Z -10.8 used a 2.15 interaction range. The player could visually arrive at the apparent final doorway while runtime still reported 5/6.

## Fix
- Re-authored filter 6 center to local Z -8.0.
- Added a tighter final-filter read range of 0.55.
- Repositioned the final two tooth stations around the sixth filter at -7.72 and -8.28.
- Repositioned the sixth memory lobe to the same authored final-filter center.
- The Aperture membrane remains visually dormant until all six filter reads are earned.
- HC-014E membrane handshake remains unchanged after 6/6: enter membrane, hold Stabilize until READY, Pulse, witness dilation, then fresh Stabilize + Pulse to cross.
- No new ability, entity, ecology, combat rule, or progression requirement was added.

## Intended endpoint sequence
5/6 -> distinct active sixth filter -> centered + Stabilize + cadence Pulse -> 6/6 -> membrane awakens -> enter membrane -> Stabilize -> READY -> Pulse -> reveal -> fresh Stabilize + Pulse -> Aperture.

## Validation
Passed:
- validate:comb-endpoint-separation
- validate:comb-threshold-playable
- validate:aperture-seal-reachability
- audit:undefined-methods
- production build

The full inherited chain was also run through the transition/Comb/Hub checks. It later stopped at an older Silt-return validator whose runtime-profile file selector is hard-coded to pre-HC-014E successors even though its expected ID logic recognizes HC-014F. This is legacy validator lineage bookkeeping and is not on the modified Comb endpoint runtime path.

## Bundle
Production entry: approximately 1,475.02 kB minified / 366.62 kB gzip. Existing large-bundle warning remains.
