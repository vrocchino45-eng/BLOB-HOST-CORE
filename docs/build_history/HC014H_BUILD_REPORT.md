# BLOB: HOST CORE — HC-014H Build Report

## Pass
**HC-014H — Comb Terminal Membrane Reachability Fix**

## Problem reproduced
After all six Comb filter reads were complete, screenshot diagnostics showed the Core still outside the synthesis seal:

- Comb reads: **6/6**
- Synthesis seal distance: approximately **3.28**
- Authored seal range: **2.15**
- Result: `inside:no`, so the membrane handshake could never begin.

The trigger, cadence removal, and sequential-read fixes were already functioning. The remaining blocker was physical reachability at the far end of the Comb movement envelope.

## Code assessment
Comb uses an entry-anchored ellipsoid owned by `PlayerMovementController`, tuned by `CombThresholdFoundationSystem`.

Pre-HC-014H filter envelope:

- center offset: `[0, 0, -4.8]`
- radii: `[3.9, 3.1, 6.9]`
- Aperture membrane center: `[0, 0, -10.8]`
- membrane interaction radius: `2.15`

Although the seal center was technically inside the ellipsoid on the exact centerline, the ellipsoid narrows toward its far Z extent. Normal lateral/vertical drift near the endpoint could therefore leave the visible membrane volume partly outside the physically inhabitable region.

## Fix
The filter envelope remains unchanged for reads 1–6.

After **6/6** legitimate reads, `CombThresholdFoundationSystem` publishes a dedicated terminal approach envelope:

- center offset: `[0, 0, -5.8]`
- radii: `[4.4, 3.6, 7.8]`
- owner remains: `PlayerMovementController`
- tuning owner remains: `CombThresholdFoundationSystem`

This opens traversal room around the existing authored membrane instead of increasing the trigger radius.

### Explicitly unchanged
- Aperture seal position: `[0, 0, -10.8]`
- Aperture seal range: `2.15`
- six-filter sequential gameplay
- HC-014E membrane handshake
- GateSystem crossing ownership
- controller mapping
- no teleport / forced relocation
- no new ability, entity, ecology, combat, or progression requirement

## New validation
`validateCombTerminalReachabilityHC014H.mjs` proves:

1. At 5/6 the original Comb movement envelope remains active.
2. At 6/6 the terminal approach envelope becomes active.
3. The authored seal trigger remains exactly `2.15`.
4. The membrane center sits comfortably inside the terminal movement ellipsoid.
5. Principal-axis samples across the full 2.15-unit membrane interaction sphere are physically reachable.
6. Movement ownership remains with `PlayerMovementController`.

## Validation result
- `npm run validate:comb-terminal-reachability` — PASS
- `npm run validate:current` — PASS
- `npm run audit:undefined-methods` — PASS
- production build — PASS

## Test target
Complete Comb to 6/6 and continue moving toward the visible membrane. The Core should now be able to physically enter the membrane until the HUD reports:

`SYNTHESIS SEAL ... inside:YES`

Then hold Stabilize until READY and Pulse to complete the synthesis.
