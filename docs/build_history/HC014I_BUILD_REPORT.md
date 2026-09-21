# BLOB: HOST CORE — HC-014I Build Report

## Pass
Comb Final Membrane Coherence Recovery Fix

## Root cause found from live HC-014H screenshot
The live runtime proved all prior blockers were already cleared:
- Comb reads 6/6 complete and sequential.
- Synthesis seal distance was inside the authored 2.15-unit membrane volume.
- Stabilize input was detected (`stabilize:YES`).
- Aperture crossing had not yet completed.

The remaining deadlock was coherence state. `CombThresholdPlayableSystem` required coherence to be at least 0.70 before the final membrane stabilization charge could begin. Earlier recoverable misses could soften coherence below 0.70. After 6/6, however, the player was no longer inside an active filter band, so the existing Stabilize recovery path no longer ran. The prompt told the player to hold Stabilize, but the state machine supplied no way for that hold to make the membrane ready.

## Fix
- After legitimate 6/6 completion, while the player is physically inside the foundation-owned Aperture seal and holds Stabilize, softened coherence now recovers toward the existing final threshold.
- Recovery uses `finalMembraneCoherenceRecoveryPerSecond: 0.28`.
- Once coherence reaches the existing 0.70 threshold, the existing membrane stabilization charge continues to READY.
- A fresh Pulse at READY completes the existing synthesis handshake.
- Filter sequencing, filter geometry, membrane position, 2.15-unit seal range, movement ownership, and GateSystem crossing ownership are unchanged.
- Added explicit `MEMBRANE HANDSHAKE` debug diagnostics for coherence, minimum coherence, recovery state, settle progress, and READY state.

## Dedicated regression
`validateCombFinalMembraneCoherenceRecoveryHC014I.mjs` recreates the live blocker exactly:
- 6/6 reads complete
- inside visible seal
- Stabilize held
- coherence = 0.50, below required 0.70

It proves Stabilize recovers coherence, the membrane reaches READY, and the next Pulse completes synthesis.

## Validation
- `npm run validate:comb-final-membrane-recovery` — PASS
- Full `npm run validate:current` — PASS
- Compatibility archive — PASS
- Undefined-method audit — PASS
- `npm run build` — PASS

## Production build
Initial entry chunk: approximately 1,477.34 kB minified / 367.21 kB gzip. Existing large-bundle warning remains.

## Test instruction
At the final Comb membrane after 6/6:
1. Enter until `SYNTHESIS SEAL ... inside:YES`.
2. Hold Stabilize.
3. `MEMBRANE HANDSHAKE` should show coherence rising if softened, then settle progress increasing.
4. When `ready:YES`, Pulse once.
5. After the reveal completes, use the existing fresh Stabilize + Pulse crossing into Aperture.
