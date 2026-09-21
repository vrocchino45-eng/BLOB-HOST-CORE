# HC028A Build Report — Structured Session Telemetry Foundation

## Decision

HC027L1 is frozen as **Golden Inquiry Baseline 01**. HC028A begins test infrastructure without changing that gameplay baseline.

## Implementation

Added `SessionTelemetrySystem` as the final read-only runtime observer. It produces `blob.session.telemetry.v1` with:

- sparse meaningful event records;
- 2 Hz movement/context/input samples;
- 10-second and topology-change Core phenotype snapshots;
- anonymous percept payloads separated from developer truth;
- bounded local histories;
- approximately 8-second browser-local autosave plus page-hide save;
- retention of four recent local development sessions;
- Shift+T JSON export;
- Shift+M manual playtest marker;
- Status Page Telemetry readout;
- F1 recorder status;
- `window.BLOB_TELEMETRY` development API.

The summary cache is invalidated only when event/sample/snapshot data changes so telemetry does not rescan the whole session every render frame.

## Validation

- HC028A dynamic telemetry contract: PASS.
- HC027L1 rhythm/repetition regression: PASS.
- HC027L rhythm lock regression: PASS.
- HC027K consequence-chain regression: PASS.
- HC027K1 HOTFIX2 input/HUD regression: PASS.
- F1/F2/F3 runtime DOM smoke: PASS.
- RecipeData load: PASS.
- undefined `this.method()` audit: PASS.
- source syntax: **93 / 93 JS modules PASS**.
- public data parse: **343 / 343 JSON files PASS**.
- Golden Inquiry gameplay-owner hash lock: PASS.

The HC028A synthetic session proof successfully records and distinguishes quick/charged Pulse, local/deep sonar, repeat-resolution increase, sustained Absorb and Stabilize intervals, persistent consequence, K relationship, semantic stagnation, cell transition, and Core topology change. Canonical gameplay input remains unchanged by the observer.

## Production bundle limitation

`npm run build` cannot execute in this handoff because `node_modules/vite` is not present. The failure is `MODULE_NOT_FOUND` for the local Vite executable, matching the established environment limitation from previous checkpoints. No source validation failure was uncovered.

## Next acceptance step

Run one normal 8–10 minute HC028A playtest, export the JSON with Shift+T, and review the JSON alongside its matching video. HC028B (Agent Input Harness) should begin only after the structured session can reconstruct the important playtest story without relying on frame-by-frame HUD reading.
