# P01 — Shelf targeting and contact readability · WC01 v0.2

Status: unissued. S01 is ready for construction within the view-only specification. S02 and S03 are ready for independent verification. Shelf cue suppression depends on identifying the redundant emitter. Do not issue the full P01 construction order until its included gaps qualify. Execution authorization is separate. [Gate record](../../reference/DESIGN_RFI_REGISTER.md) · [S-DEC-01](../../reference/REGION_BLUEPRINTS/silt_burrow_route.md#s-dec-01). Trade source: [worktree setup after publication](../../operations/ENVIRONMENTS.md#provision-trade-worktrees-after-approval). Baseline: [admitted overlay manifest](../../manifests/working-tree-changes.json).

## Purpose and mode

**Presentation and deterministic regression.** Make the actual selected Shelf, geometric contact, accepted delivery, obstruction and loss readable while the player is moving. Preserve deliberate positioning, normal world controls and the sediment reference.

## Production allowlist

- src/player/CoreFlowSystem.js — render presentation and view-local obstruction projection only. A displayed connector may terminate before a blocker. Preserve the published physical tip, reach and contact pipeline.
- src/targeting/TargetingSystem.js — Shelf-only world glyph visibility or priority inside the presentation path. Keep canonical target, attention/relationship sequences, steering, glyphs outside the Shelf and camera publications intact.
- src/player/CoreVerbPhysicalizationSystem.js — Shelf-only presentation visibility for any duplicate Stabilize world cue confirmed by the evidence. Preserve Core anatomy and all behavioral fields, transforms used by physics, and sediment cues.
- src/world/RegionalTerritoryExpansion.js — Shelf receiver rendering only, if needed to retain one unambiguous patch cue. Preserve readFlowPatch(), acceptFlow(), site definitions and ownership.

## Test allowlist

- scripts/testF1SiltFlow.mjs
- scripts/testWave1TargetLifecycle.mjs — only if necessary to pin unchanged targeting lifecycle during Shelf-specific presentation arbitration

## Authority, locks and exclusions

TargetingSystem selects. CoreFlowSystem tests actual contact using the existing patch. RegionalTerritoryExpansion alone confirms accepted current, pressure and imprint. B5-C2 alone accounts reserve. Mount, attention and action identity and physical tip remain the same for matched inputs.

All packages preserve B5-C2 reserve settlement, B5-B Grave recovery, F1 acceptance, C2 provenance, B1/B3/B4 Silt ecology, Core Work and 3→6→12, movement, camera, controller mapping, crossing and progression, HC027D1 audio, and historical checkpoints. Lock shared producer payloads and scheduler order.

No new system, production file outside the allowlist, deletion, archive revival, or cross-trade write.

## Visual and feel targets

- **Visual.** At normal and Near distances, the patch is the one primary world-space contact cue. A blocked connector must visibly stop short and must not appear to attach to the Shelf. Selection is distinct from touching. Live accents require accepted delivery.
- **Feel.** Deliberate positioning and aiming should feel unchanged. Keep the Core gyro readable as Core anatomy and preserve sediment brackets. Reproduce overlapping cues first, then suppress only the cue identified as redundant in the active Shelf context.

## Acceptance tests

- Blocked and clear matched poses with the same selected Shelf. The blocked connector terminates before the surface or blocker without changing the simulated tip or acceptance. Provide screenshot and obstruction reason.
- LT-only selection, contact without current, accepted RT, failed dwell, release, retarget, unmount, inspection and Core Work. Compare highlights and actual owner fields. Cue suppression must clear on context exit.
- Far/Near held-RT test preserves canonical receiver, attention/action sequences, mount, accepted current and imprint. Normal orbit/recenter and sediment grip/alignment traces remain equal.
- Exactly one primary world-space Shelf alignment or contact cue at a time, checked under LT and LT+RT. No reduction in information for non-Shelf targets or the 3→6→12 Core.

## Regression tests

F1, B5 Flow reserve, Wave 1 targeting and verb, I2-B, current stabilized-aim smoke, Silt held motion and living material, C63, Core Work depth, production build.

## Required handoff

Provide changed-file manifest and SHA-256, commands, pass/fail logs, controller fixtures and paired production-state evidence appropriate to the cases above. Include screenshot or short capture from normal World. Name the actual target, actual recipient and any retained outcome.

## Stop conditions

If the blocked endpoint requires changing simulated geometry or if the duplicate cue needs a global targeting contract change, stop and give the owner and call path. Camera realignment's human-observed cause is still open. A camera change is outside scope.

Stop before editing outside the allowlist, before altering a shared contract, if a baseline mismatch prevents attribution, or if an accepted owner result disagrees with visible cues. Submit evidence and changed-file hashes. Do not integrate or dispatch.

[Flow](../../../../../src/player/CoreFlowSystem.js) · [Targeting glyphs](../../../../../src/targeting/TargetingSystem.js) · [Core Stabilize cues](../../../../../src/player/CoreVerbPhysicalizationSystem.js) · [Receiver](../../../../../src/world/RegionalTerritoryExpansion.js)
