import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

let time = 0;
const doc = { hidden: false, hasFocus: () => true };
const observer = new FrameTruthObserver({ now: () => time, documentRef: doc, windowMs: 1000, maxWindows: 4 });
const step = (frame, rawDt, dt, { hidden = false, focused = true } = {}) => {
  doc.hidden = hidden;
  doc.hasFocus = () => focused;
  time += rawDt * 1000;
  observer.beginFrame({ frame, rawDt, dt, cellId: "CELL_MEMBRANE_NURSERY_001" });
  observer.endFrame({ registryMs: 2, remainingUpdateMs: 1, renderMs: 3,
    cellId: "CELL_MEMBRANE_NURSERY_001", rendererInfo: { calls: 100, triangles: 4000 },
    registrySample: { timingSampled: true, slowestSampledSystems: [{ id: "A", lastMs: 1.25 }] } });
};
step(1, 0.016, 0.016);
step(2, 0.125, 0.05);
step(3, 1.5, 0.05, { hidden: true, focused: false });
const record = observer.snapshot();
assert.equal(record.schemaVersion, "blob.frame_truth.v1");
assert.equal(record.authority, "read_only_observer");
assert.equal(record.total.frames, 3);
assert.equal(record.total.wallSeconds, 1.641);
assert.equal(record.total.simSeconds, 0.116);
assert.equal(record.total.discardedSeconds, 1.525);
assert.equal(record.total.gapCounts.over100ms, 2);
assert.equal(record.total.gapCounts.over1000ms, 1);
assert.equal(record.total.visibility.hiddenFrames, 1);
assert.equal(record.windows.length, 1);
assert.equal(record.windows[0].frameIntervalMs.max, 1500);
assert.equal(record.windows[0].lastSlowestSampledSystems[0].id, "A");
assert.equal(record.last40LongGaps.length, 1);
assert.equal(record.last40LongGaps[0].hidden, true);
assert.equal(record.last40LongGaps[0].previousCallbackWorkMs.render, 3);
assert.equal(record.last40LongGaps[0].discardedMs, 1450);
assert.equal(record.windows[0].stageMs.registry.p95, 2);

const telemetry = new SessionTelemetrySystem({ frameState: {
  buildId: "HC-031W1", buildLabel: "Stabilized Aim + Local Contact Proof", runtimeSeconds: 0
}, monotonicNowMs: () => 0 });
telemetry.frameTruthProvider = () => observer.snapshot();
const exported = telemetry.exportSession();
assert.equal(exported.schemaVersion, "blob.session.telemetry.v1.52");
assert.equal(exported.developerTruth.frameTruth.total.frames, 3);
assert.equal(exported.session.buildId, "HC-031W1");

const runtime = readFileSync(new URL("../src/core/GameRuntime.js", import.meta.url), "utf8");
const registry = readFileSync(new URL("../src/core/SystemRegistry.js", import.meta.url), "utf8");
assert.match(runtime, /const dt = Math\.min\(rawDt, 0\.05\)/, "Gameplay dt cap must remain unchanged");
assert.match(runtime, /frameTruthObserver\.beginFrame\(/);
assert.match(runtime, /frameTruthObserver\.endFrame\(/);
assert.match(registry, /frameState\?\.runtimeFrameRawDeltaMs/, "Registry must sample CURRENT frame raw delta");
assert.doesNotMatch(runtime, /dt\s*=\s*rawDt\s*;/, "Do not uncap runtime dt");
console.log("HC031W2A Frame Truth: 25 observer/export/ownership assertions PASS");
