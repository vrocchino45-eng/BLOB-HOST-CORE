# HC-031P — First Host Destination Commitment

Parent: **HC-031O1 — Host Continuation Directional Read**

Mode: **convergence / first destination commitment**

## Why this pass

HC031O/O1 made the Surface Wake → Guide Threshold continuation functional and physically readable enough to reach Signal Chorus without the safe seed acting as a hidden gate. HC031O1 telemetry reached Signal Chorus at 203.317 s, proving the downstream Hub mount still exists, but the session ended before the first Hub destination choice was exercised.

The next convergence question is therefore not "add another region." It is whether the player can read Signal Chorus as a Host junction, recognize Grave as the one currently awake destination, deliberately choose it with A/E, and cross through the already-authored boundary morph.

## Locked route law

**Signal Chorus / Hub → Grave Memory**

1. Hub presents one awake first destination: `grave_memory_route`.
2. Existing Grave corridor anatomy carries a center→Grave invitation wave.
3. Pulse/read of the route remains optional context.
4. Physical approach makes the existing destination commitment available.
5. **A / E is the deliberate destination commit.**
6. `HubInvestigationGameplaySystem` owns that commitment request.
7. `LocalCellBoundaryMorphSystem` remains the sole Hub→Grave active-cell transition owner.
8. No automatic crossing, waypoint, objective arrow, teleport, or new gate system is added.

## Changes

### HubChamberFoundationSystem

- Reuses only the existing Grave corridor segments and gate body.
- While Grave is the first awake, mounted, playable destination and has not yet been entered, a low-amplitude traveling wave runs from Hub center toward Grave.
- The cue strengthens existing body opacity/emission/scale modestly; it adds no geometry or particles.
- Publishes read-only `firstDestinationInvitation` state with route, gate, body cue, A/E commitment, and transition-owner truth.
- Route authority remains false in presentation.

### SessionTelemetrySystem

Schema: `blob.session.telemetry.v1.38`

Adds read-only observation of:
- `hub.destination.available`
- `hub.destination.committed`
- Hub→Grave `transition.entered`
- Grave arrival `route.resolved`
- Grave→Hub `transition.entered`

Summary adds:
- `hubDestinationAvailabilityEvents`
- `hubDestinationCommitEvents`

### Identity/tooling

- Build: `HC-031P`
- Label: `First Host Destination Commitment`
- Package: `0.31.35`
- 19 neighboring gameplay owners SHA-256 locked unchanged.

## Forbidden / unchanged scope

Unchanged:
- K→N movement, attachment, verb, and targeting grammar.
- N2 different-surface reacquisition law.
- O/O1 Surface Wake continuation criteria and Fold cue.
- Guide Threshold gameplay and Guide→Signal continuous morph.
- `HubInvestigationGameplaySystem` commitment logic.
- `LocalCellBoundaryMorphSystem` route readiness/transition logic.
- Grave gameplay, return rules, rupture systems, ecology, route order, and region topology.

## Validation

`npm run validate:current` passes:
- HC031P route/telemetry validator.
- JS syntax checks.
- RecipeDataSystem load validation.
- undefined `this.method()` audit.

The HC031P validator performs a synthetic observer proof of:

**destination available → deliberate commit → Hub→Grave transition → Grave arrival resolution**

while verifying A/E commitment and `LocalCellBoundaryMorphSystem` transition ownership remain intact.

Production `npm run build` remains subject to the same uploaded-Windows-`node_modules` / Linux Rollup optional-binary limitation encountered in prior passes; it is not used as source validation here.
