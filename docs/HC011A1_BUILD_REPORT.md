# HC-011A1 Build Report

## Outcome

HC-011A1 repairs the exact live state photographed in HC-011A: Vascular showed `3/3` reads while repeated Pulse input had driven synchronization and integrity down, turbulence to maximum, and the return into a held state.

## Root causes

1. The route continued treating Pulse as an off-beat risk after all three cadence reads were already earned.
2. Post-read Stabilize used the narrow pre-completion centerline range and recovery rate, taking about 14.2 seconds even at the ideal position.
3. The third valve was authored at curve progress `0.82`, while the piecewise player-path estimator measured the same point near `0.752`; completion secretly required `0.78`.
4. F1 prioritized retained opening flow instead of the active Vascular route.

## Repair

- Locked every successful cadence read irreversibly.
- Ignored extra Pulse events after `3/3` without changing risk, synchronization, integrity, or turbulence.
- Added a contained post-read Stabilize lane and bounded recovery multiplier using the existing input and route owner.
- Credited each successful valve's authored curve progress to canonical route depth.
- Published explicit stop-Pulsing, hold-Stabilize, range, and recovery feedback.
- Added Vascular to active-flow diagnostic ownership.

## Focused proof

- Completed all three cadence reads through the real route simulation.
- Applied 178 additional Pulse events after `3/3`; all route health values remained unchanged and all events were recorded as harmless.
- Forced `sync:0`, `integrity:0`, and `turbulence:1`, then recovered while stationary with `LT` in 1.95 seconds.
- Verified canonical depth, current reversal, objective completion, Gate-owned return, and Silt isolation.
- Verified F1 selects Vascular and exposes the new recovery evidence.

## Scope

No new route, ability, entity, combat rule, input, cell, progression reward, or updater was added. HC-011B remains the planned Vascular consequence pass.

## Verification

- Complete uninterrupted inherited validation chain: passed.
- Production compile: passed.
- Served production index and exact hashed asset: passed.
- Production asset: `assets/index-BxqM7t0X.js` (`1,401,846` bytes).
- Served markers: `HC-011A1`, `ACT1_RUNTIME_PROFILE_HC011A1`, and `VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A1`.
- Complete source/build archive: `2,341` entries, with every entry and embedded identity verified.
- Only build note: the retained non-blocking Vite chunk-size warning.
