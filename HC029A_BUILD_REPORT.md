# HC-029A Build Report — Relationship Targeting & Intentional Focus

## Purpose

HC029A is the first **Golden Host Slice** convergence pass after HC028R proved the 22-minute duration and distributed ecology. The matching HC028R video + telemetry showed that the next bottleneck was not content quantity but player certainty: in Scar Flow Fold, nearby objects repeatedly traded target ownership, while the retained telemetry window contained 478 analyzed attempts with 460 producing no new information.

This pass addresses that communication/control problem without adding gameplay systems.

## Relationship model

The old `TargetingSystem` selected the highest-scoring object every frame. HC029A separates that into four perceptual phases:

1. **none** — no valid candidate.
2. **candidate** — camera direction, distance and existing authored focus boosts produce a soft possibility.
3. **engaged** — Pulse / Absorb / Stabilize adopts the candidate as a retained relationship.
4. **releasing** — a short 0.28 second grace protects Pulse release/chord transitions from flicker before returning to candidate mode.

A nearby object with a slightly better score cannot steal an engaged relationship. Handoff requires a clear camera redirect away from the current relationship toward a better candidate, or the existing relationship becoming invalid/out of range.

No manual target-cycle button was added.

## Existing authority preserved

`TargetFocusRegistry` remains the world/context authority for allowed cells, exclusions, target kinds and authored preference boosts. HC029A does not rewrite route-specific targeting rules.

`TargetingSystem` now receives the existing camera as a read-only intent signal. It does not rotate the camera or player.

`BondSystem` and existing interaction consumers continue reading `frameState.targeting.targetId`; during P/A/S this resolves to the retained relationship target, while idle candidate behavior remains compatible with prior systems.

## First production symbol grammar

The old generic lock ring is disabled in normal play.

HC029A begins the locked geometry language directly on the active relationship:

- **Pulse** — outward triangle along Core→target.
- **Absorb** — inward/opposed triangle along target→Core.
- **Stabilize** — coherence boundary around the target.
- **P+A** — opposed triangles can compose exchange.
- **S + another verb** — coherence boundary composes with the directional glyph rather than becoming a separate icon.

The Stabilize boundary reads `chemistry.instabilityRisk` only for presentation. Higher instability increases asymmetry/oscillation. This does not alter chemistry, verb strength, target behavior or gameplay outcome.

The fuller native-polygon grammar (circle/square/hexagon/octagon/etc.) is deliberately not claimed yet.

## Telemetry v1.18

HC029A separates:

- `attention.candidate.changed` — soft attention changes; analysis-only and not target-switch effort.
- `attention.target.changed` — retained relationship acquire/handoff/release.

Semantic churn therefore stops treating harmless candidate drift as if the player intentionally switched relationships.

## Runtime diff vs HC-028R

Exactly four runtime JS files differ:

1. `src/main.js`
2. `src/core/GameRuntime.js`
3. `src/core/SessionTelemetrySystem.js`
4. `src/targeting/TargetingSystem.js`

**106 HC028R runtime JS owners are SHA-256 locked**, including `TargetFocusRegistry`, player movement, camera readability, all ecology systems, Host-matter ownership, Hub/Comb traversal, Vascular/Silt routes and the HC028L1 startup-fix owner.

## Validation

- HC029A direct relationship contract: PASS
- small score improvement cannot steal an established relationship: PASS
- deliberate camera redirect can hand off: PASS
- Y/Focus excluded from P/A/S relationship intent: PASS
- Pulse/Absorb/Stabilize primitive glyph ownership: PASS
- telemetry candidate vs relationship separation: PASS
- HC028L1 startup-scope descendant smoke: PASS
- RecipeDataSystem load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: **110/110 PASS**
- public JSON parse: **428/428 PASS**
- HC028R locked runtime owners: **106/106 PASS**

## Browser/render boundary

This package contains no local `node_modules`, so a Vite/browser run was not available in this environment. The live controller test is required to calibrate camera handoff thresholds, candidate predictability and the visual amplitude/placement of the new relationship glyphs.
