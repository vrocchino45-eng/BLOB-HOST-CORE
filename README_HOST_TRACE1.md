# BLOB: HOST CORE — HOST-TRACE1

November 9, 2026, America/New_York. Mode: Convergence / read-only playtest evidence. Baseline: ARCHIVE-GRAVE1. One production file changes: src/core/SessionTelemetrySystem.js. Gameplay, Host tuning, controls and HUD remain unchanged.

## Install

After ARCHIVE-GRAVE1, from the BLOB-HOST-CORE project root:

```powershell
Expand-Archive -LiteralPath .\BLOB_HOST_TRACE1_DELTA.zip -DestinationPath . -Force
node .\APPLY_HOST_TRACE1.mjs
```

Reload the game. The installer verifies the exact telemetry baseline, latest validator prerequisite and payload, saves a backup, and refuses later/unknown edits. Repeat application is safe.

```powershell
node .\APPLY_HOST_TRACE1.mjs --check
node .\APPLY_HOST_TRACE1.mjs --restore
```

Restore reinstates the original telemetry file from its verified backup without reverting other patches.

## What changes

The existing Shift+T session JSON export now includes developerTruth.hostCycle. No new export button, key combination or HUD panel is added. The existing browser API and local persistence include the same diagnostic section through their normal export path.

The diagnostic records the authored Host episode/phase and amplitude, its simulation and wall timestamps, current cell/camera mode, and the mounted Vascular response: flow scale/strength, existing pressure, requested fold response, and the separate Silt receipt load. Episode IDs permit cause/response matching without moving authority into telemetry.

Records are sampled at state/mode/episode/mount changes and at two-second simulation intervals during an active mounted episode. The buffer holds at most 512 records and reports prunedCount. It is not an every-frame trace or a guarantee of an entire arbitrarily long session. Hidden Vascular gets no local-response claim; its Host phase can still be recorded as global context. The trace does not reconstruct missed episodes retrospectively.

Requested fold state does not prove rendered visibility, player attention or human readability. playerPerceptionVerified remains false. All new semantic identifiers and diagnostic records live under the existing developerTruth boundary. No new Host events or fields are added to perceptual event payloads, legacy event streams, movement samples, Core snapshots or the existing v1.52 schema identifier. Existing consumers should continue excluding developerTruth from perceptual-only input.

## Why this pass

The new Host cycle and local response were absent from the existing session exporter. A recording alone could show a subtle visual change without a trace of the corresponding episode, mounted state or physical flow. This addition makes a later playtest comparison reviewable while leaving the effect itself untouched.

Host-condition ownership, material/receipt authority, progression and the existing telemetry firewall remain separate. SessionTelemetrySystem observes copied scalar values; it does not write Host state, local flow, visuals, input, materials, reserve or goals.

## Validation

- Ten observer/export checks pass: absent publisher, mounted source/response correlation, source-state non-mutation, sparse sampling, phase/mode changes, hidden local exclusion, missing episode lineage, copied values, capacity/pruning, and unchanged legacy streams/schema.
- Running browser with the actual registry exported through the real Shift+T download. Its JSON contained peak and resting Vascular responses, mounted interval samples and global-only hidden records. Seven diagnostic records were retained in this short fixture; no recorded JavaScript/console errors.
- Browser phase selection used declared monotonic simulation-clock fixtures. No diagnostic records, Host response or gameplay result were forced. This validates export wiring, not a naturally earned journey or human perception.
- Seven guarded installer checks pass: baseline/prerequisite, exact apply/backup, idempotence, restore, later-edit preservation, corrupt payload and missing prerequisite.
- Vite production build passes with the existing large-chunk warning. Exact Three.js 0.179.1 and Vite 7.1.0 remain the exercised local versions; full transitive dependency-lock parity is not newly established.
- All other 165 production JavaScript files and the delivered Host recipe are byte-unchanged. Existing accepted route/material/reserve/Guide/mode behavior and validation evidence remain current. No repeat Silt round trip is requested.

## Pass boundaries

Purpose: match the next Host-cycle observation to actual owner publications. Allowed scope: this one existing observer/exporter and its diagnostics/tests. Locked: gameplay, controls, camera, HUD, audio reference, schema/perceptual streams, Host profile and all prior checkpoint IDs. Delete/disable targets: none. Visual/feel target: retain current behavior. Acceptance: a real exported JSON contains bounded, correctly separated diagnostics and no gameplay mutation. Regression: existing streams, normal boot/download, source identity, installer and build.

Normal-play Host readability remains pending. This patch does not award human acceptance or justify a new region, a stronger effect or another physiology benefit. When useful, a short Vascular observation plus the usual Shift+T JSON is enough; no long recording is required.

Evidence includes tests, the extracted bounded diagnostic trace from the real download, browser harness, build output, installer checks, exact source diff and locked hashes. The complete downloaded session stays internal and is not packaged. No screenshots are included. Test scripts expect the original audit layout and are not normal startup imports.
