# HC031W — Controller / Targeting / Surface Interaction Audit

## Mode
Audit-only convergence pass over accepted HC031V.

## Purpose
Measure the controller → camera aim → candidate → attention → relationship chain before changing controller behavior, and establish the actual authored crawlable-surface coverage of Gathering Ground.

## Locked gameplay
HC031W does **not** change target scoring, target selection, attention ownership, relationship ownership, controller mappings, movement, Gathering Ground ecology, encounter timing, recurrence, or crawlable-surface mechanics.

The validator hash-locks these accepted HC031V behavior methods:
- `TargetingSystem.updateAttention`
- `TargetingSystem.updateRelationship`
- `TargetingSystem.pickTarget`
- `TargetingSystem.scoreCandidate`
- `CoreSurfaceTruthSystem.refreshCandidates`
- `CoreSurfaceTruthSystem.sampleNearestSurface`

It also hash-locks `InputSystem`, `PlayerMovementController`, `GatheringGroundAliveSystem`, and `CrawlableSurfaceRegistry`.

## Controller / targeting audit
`TargetingSystem` now publishes read-only `frameState.controllerTargetingAudit` with:
- LT/Stabilize analog value
- right-stick magnitude and camera look axes
- candidate / attention / relationship IDs, scopes, aim and distances
- whether RS is showing deliberate redirect evidence
- whether Stabilize is protecting an older attention owner while that redirect evidence exists
- whether the held relationship is beyond the existing assist-range reference

No audit result feeds back into target selection.

## Surface capability audit
`CoreSurfaceTruthSystem` now publishes read-only `frameState.surfaceCapabilityAudit` from the same explicit crawlable-surface registry that authorizes tendril contact. It reports:
- authored surface count in the active cell
- profile counts and surface IDs
- nearest authored surface/profile/distance
- whether that surface is mechanically reachable

HC031W authors **zero new surfaces**. Static audit confirms `GatheringGroundAliveSystem` has no crawlable-surface metadata path. The only current `applyCrawlableSurfaceMetadata` author is `HostContactShelfSystem`, whose surfaces belong to `CELL_MEMBRANE_NURSERY_001`.

## HUD
In Aperture/Gathering Ground the playtest HUD adds two audit lines:
- `W CTL ...` — LT/RS + candidate/attention/relationship chain
- `SURF ...` — active-cell authored surface capability

## Telemetry
Schema: `blob.session.telemetry.v1.51`

New read-only events:
- `control.targeting_audit.changed`
- `world.surface_capability.audit_changed`

Movement samples also carry compact controller-targeting and surface-capability audit state.

## Deterministic audit proof
The W smoke establishes target A by camera aim, then holds Stabilize and deliberately turns the camera to target B. The accepted V behavior keeps attention/relationship on A while candidate becomes B, and W correctly flags `stabilize_protects_old_attention_during_rs_redirect`.

The surface smoke proves zero authored surfaces reports `no_authored_crawlable_surfaces_in_active_cell`, then adds a known `membrane_stable` surface and confirms the audit reports it.

## Validation
`npm run validate:current` PASS, including:
- HC031W validator + audit smoke
- HC031V telemetry/readability validation + smoke
- HC031U2.1 intent latch smoke + six bot profiles
- HC031U2/U1/U structural validation
- HC031T5 30/60/120/144 FPS Ridge smoke
- undefined-method audit
- RecipeData load validation

## Decision gate after human run
Use W evidence to choose W1 behavior, rather than guessing. The expected likely next pass is deliberate LT+RS relationship steering plus a separate first 3-role Gathering Ground surface capability proof.
