import assert from "node:assert/strict";
import fs from "node:fs";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";
import {
  buildBoundedSimulationSteps,
  HC031W2A4_MAX_STEP_SECONDS,
  HC031W2A4_MAX_CATCH_UP_SECONDS,
  HC031W2A4_MAX_SUBSTEPS
} from "../src/core/BoundedSimulationCatchUp.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const tickSource = runtimeSource.slice(runtimeSource.indexOf("  tick() {"), runtimeSource.indexOf("\n  updateCamera(dt) {"));

// A4 clock contract remains unchanged.
assert.equal(HC031W2A4_MAX_STEP_SECONDS, 0.05);
assert.equal(HC031W2A4_MAX_CATCH_UP_SECONDS, 0.15);
assert.equal(HC031W2A4_MAX_SUBSTEPS, 3);
const catchUp = buildBoundedSimulationSteps(0.15);
assert.equal(catchUp.substepCount, 3);
assert.ok(catchUp.steps.every((dt) => dt <= 0.05 + 1e-12));
assert.ok(Math.abs(catchUp.simulatedSeconds - 0.15) < 1e-9);

// Only simulation-critical registry work is allowed inside the substep loop.
const loopStart = tickSource.indexOf("for (let substepIndex = 0; substepIndex < catchUp.steps.length; substepIndex += 1)");
const partitionStart = tickSource.indexOf("// HC-031W2A4.1: simulation-critical registry work owns the bounded substeps.");
assert.ok(loopStart >= 0 && partitionStart > loopStart, "A4.1 partition marker must follow the bounded substep loop");
const substepLoopSource = tickSource.slice(loopStart, partitionStart);
const oncePerCallbackSource = tickSource.slice(partitionStart);
assert.match(substepLoopSource, /this\.registry\.update\(dt, this\.frameState\)/);
assert.doesNotMatch(substepLoopSource, /coreVerbPhysicalizationSystem\?\.update/);
assert.doesNotMatch(substepLoopSource, /visualHierarchyCompressionSystem\?\.update/);
assert.doesNotMatch(substepLoopSource, /this\.updateCamera\(/);
assert.doesNotMatch(substepLoopSource, /firstSliceTransitionCoordinator\?\.update\(/);

assert.equal((oncePerCallbackSource.match(/coreVerbPhysicalizationSystem\?\.update\(/g) ?? []).length, 1);
assert.equal((oncePerCallbackSource.match(/visualHierarchyCompressionSystem\?\.update\(/g) ?? []).length, 1);
assert.equal((oncePerCallbackSource.match(/this\.updateCamera\(/g) ?? []).length, 1);
assert.equal((oncePerCallbackSource.match(/firstSliceTransitionCoordinator\?\.update\(/g) ?? []).length, 1);
assert.equal((tickSource.match(/this\.renderer\.render\(/g) ?? []).length, 1);
assert.match(oncePerCallbackSource, /runtimePresentationDeltaSeconds = catchUp\.simulatedSeconds/);
assert.match(oncePerCallbackSource, /runtimePresentationUpdatesThisCallback = 1/);
assert.match(oncePerCallbackSource, /runtimeCameraUpdatesThisCallback = 1/);

// First-substep profiler evidence must survive later uninstrumented substeps.
assert.match(substepLoopSource, /if \(this\.frameState\.runtimeExecution\?\.timingSampled\)/);
assert.match(tickSource, /registrySample: registrySample \?\? this\.frameState\.runtimeExecution/);

// Frame Truth must expose the partition while retaining the legacy aggregate keys.
let now = 0;
const observer = new FrameTruthObserver({
  now: () => now,
  documentRef: { hidden: false, hasFocus: () => true },
  windowMs: 1
});
now = 100;
observer.beginFrame({
  frame: 1,
  rawDt: 0.1,
  dt: 0.1,
  cellId: "TEST",
  substepCount: 2,
  recoveredBeyondLegacyCapSeconds: 0.05
});
observer.endFrame({
  registryMs: 20,
  presentationUpdateMs: 4,
  cameraUpdateMs: 3,
  transitionUpdateMs: 2,
  renderMs: 10,
  cellId: "TEST",
  registrySample: { timingSampled: true, slowestSampledSystems: [{ id: "testSystem", lastMs: 7.25 }] }
});
let snapshot = observer.snapshot();
assert.ok(["HC-031W2A4.1", "HC-031W2A5", "HC-031W2A5.1"].includes(snapshot.optimizationPass));
assert.equal(snapshot.total.simToWallRatio, 1);
assert.equal(snapshot.windows[0].stageMs.simulationRegistry.p50, 20);
assert.equal(snapshot.windows[0].stageMs.presentationUpdate.p50, 4);
assert.equal(snapshot.windows[0].stageMs.cameraUpdate.p50, 3);
assert.equal(snapshot.windows[0].stageMs.transitionUpdate.p50, 2);
assert.equal(snapshot.windows[0].stageMs.otherUpdateAndCamera.p50, 9);
assert.equal(snapshot.windows[0].lastSlowestSampledSystems[0].id, "testSystem");
assert.match(observerSource, /presentation, camera, transition, and render each run once per callback/);

// Legacy callers that only provide remainingUpdateMs still remain readable.
now = 500;
observer.beginFrame({
  frame: 2,
  rawDt: 0.4,
  dt: 0.15,
  cellId: "TEST",
  substepCount: 3,
  recoveredBeyondLegacyCapSeconds: 0.1
});
observer.endFrame({ registryMs: 30, remainingUpdateMs: 11, renderMs: 12, cellId: "TEST" });
snapshot = observer.snapshot();
assert.ok(snapshot.last40LongGaps.some((gap) => gap.previousCallbackWorkMs?.presentationUpdate === 4));
assert.ok(snapshot.last40LongGaps.some((gap) => gap.previousCallbackWorkMs?.cameraUpdate === 3));
assert.ok(snapshot.last40LongGaps.some((gap) => gap.previousCallbackWorkMs?.transitionUpdate === 2));

console.log("HC031W2A4.1 catch-up work partition PASS");
