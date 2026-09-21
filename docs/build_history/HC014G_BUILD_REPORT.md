# BLOB: HOST CORE — HC-014G Build Report

## Pass
HC-014G — Comb Sequential Read Authority Fix

## Problem investigated
A human playthrough could reach a reported 5/6 Comb state while guidance said to move deeper to filter 6, yet the final read would not complete. Previous endpoint passes had already separated the Aperture membrane and simplified its handshake, so this pass audited the six-filter progression code itself rather than moving triggers again.

## Code-derived root cause
`CombThresholdPlayableSystem.samplePlayer()` selected the nearest unfinished filter, allowing later filters to be earned while an earlier filter remained incomplete. Player guidance separately derived the target label from `successfulReadCount + 1`. Those two authorities could diverge. For example, completed bands `[1,2,3,4,6]` produced a read count of 5, so the prompt could say `band 6/6` even though band 5 was the actual unfinished read.

A coupled HC-014F geometry issue was also confirmed: band 5 at Z -7.40 and band 6 at Z -8.00 were only 0.60 units apart while their authored acceptance radii were 0.70 and 0.55. Their read domains therefore overlapped.

## Fix
- Comb now has one authoritative active filter: the first incomplete authored band.
- A later band cannot be earned before earlier bands are complete.
- Prompt/HUD target numbering is derived from `currentBandIndex`, not successful read count.
- Guidance can explicitly direct the player `back`, `deeper`, or `hold` relative to the actual missing filter.
- Debug state publishes completed band numbers, active filter Z, distance, effective range, inside state, direction, centered state, Stabilize state, and cadence state.
- Effective read ranges are capped by neighbor midpoint spacing, preventing adjacent filter activation domains from overlapping.
- Final band is authored at Z -8.25 with final range 0.40, preserving clear separation from band 5 and the final membrane.
- Aperture membrane remains dormant until all six reads are legitimately complete.
- HC-014E membrane handshake and HC-014D shared seal authority remain unchanged.

## Regression proof
New `validate:comb-sequential-read-order` deliberately:
1. attempts band 2 before band 1 and proves it cannot be earned;
2. earns band 1 and proves band 2 becomes authoritative;
3. constructs the prior ambiguous state `[1,2,3,4,6]`;
4. proves the active target is band 5 and guidance says to move back to band 5;
5. completes the missing band and reaches a legitimate 6/6 state.

## Additional integration corrections found during audit
- `src/main.js` still advertised HC-014F; corrected to HC-014G.
- Active region runtime mount metadata still referenced `ACT1_RUNTIME_PROFILE_HC014D`; corrected to HC-014G.
- Build manifest runtime-profile summary was stale at HC-014D; corrected to HC-014G.
- `RecipeDataSystem` successor allowlists were extended to recognize the active HC-014G profile without changing behavioral assertions.
- Legacy validators were updated only for successor identity/profile recognition; their gameplay assertions were preserved.
- `package-lock.json` was synchronized to package version 0.0.140.

## Validation
- `npm run validate:current` — PASS
- `npm run audit:undefined-methods` — PASS (included in current chain)
- `npm run build` — PASS
- Focused sequential-order validator — PASS
- Comb endpoint separation validator — PASS
- Aperture seal reachability validator — PASS
- All inherited Grave / Vascular / Silt / Hub / Comb / controller / data / compatibility validators — PASS

## Production build
Initial entry chunk: 1,476.12 kB minified / 366.95 kB gzip.
Deferred diagnostic chunks remain split. The existing large-bundle warning remains a future architectural concern and is not caused by this fix.

## Player-facing expected sequence
Comb reads are now strictly sequential. If an earlier read is missing, the game identifies that exact band and directs the player back to it. Only after legitimate 6/6 completion does the Aperture membrane awaken and the HC-014E handshake begin.
