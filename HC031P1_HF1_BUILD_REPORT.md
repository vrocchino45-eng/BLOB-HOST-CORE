# BLOB: HOST CORE — HC-031P1-HF1 Destination Commit Latch

## Parent
HC-031P1 — First Destination Commitment Unblock

## Mode
Narrow hotfix / commitment ownership convergence.

## Why this pass exists
HC031P1 proved that Grave can become available before the stricter whole-Hub presentation validator completes. The first destination route now works. The focused telemetry also showed that one physical destination choice could emit several `hub.destination.committed` / `action.deliberate_commitment` events while `LocalCellBoundaryMorphSystem` was still performing the living-tissue handoff.

The progression itself was correct; commitment multiplicity was not. A persistent choice should be accepted once, then owned until the boundary completes or explicitly cancels.

## Locked law
**One deliberate A/E destination choice → one route-commit request → boundary owner carries the choice to completion or cancel.**

While the commitment is pending:
- Hub stops publishing another commitment opportunity.
- repeated A/E presses cannot replace the original request.
- `hubRouteCommit.pending` reports `commit_in_flight`.
- `LocalCellBoundaryMorphSystem` remains the sole crossing/consequence owner.

If the boundary explicitly cancels while the Core is still in the Hub, the latch clears and the destination can be selected again. Normal completion changes cell ownership and clears the Hub latch naturally.

## Scope changed
- `src/hub/HubInvestigationGameplaySystem.js`
  - adds destination commit latch
  - clears Hub commitment opportunity while pending
  - blocks duplicate route requests
  - allows explicit cancel re-arm
- `src/core/SessionTelemetrySystem.js`
  - reports `commit_in_flight`
  - removes stale `grave_already_entered` blocker when a route is actually ready/pending
  - aligns `implementationPass` with the active build identity
- build/package metadata and validator/contract files only

## Explicitly unchanged
- P1 first-Grave availability law
- Hub route order
- Hub route geometry/presentation
- `LocalCellBoundaryMorphSystem`
- `DeliberateCommitmentSystem`
- movement / attachment
- Pulse / Absorb / Stabilize
- targeting
- Grave gameplay and return fold
- later Vascular / Silt / Comb prerequisites

## Validation
`npm run validate:current` passes:
- HC031P1-HF1 targeted runtime validator
- syntax checks
- RecipeDataSystem load validation
- undefined `this.method()` audit

The targeted validator proves:
1. first valid A/E creates one latched request;
2. the commitment opportunity disappears immediately while pending;
3. a second deliberate commitment event cannot replace the original request;
4. boundary in-flight state retains the latch;
5. explicit canceled boundary state can re-arm safely;
6. P1's first-destination permission law remains intact;
7. telemetry reports `commit_in_flight` without contradictory blocker state;
8. 21 neighboring gameplay owners remain hash-locked unchanged.

Production Vite build remains blocked in this Linux verification environment by the existing Rollup optional native-binary mismatch (`@rollup/rollup-linux-x64-gnu`), not by a source validation failure.

## Acceptance
A focused run should show one `hub.destination.committed` and one `action.deliberate_commitment` per actual Hub→Grave crossing, even if A is pressed repeatedly while the morph is visibly carrying the Core. Return-to-Hub and a later Grave re-entry should each be able to create one fresh commitment.
