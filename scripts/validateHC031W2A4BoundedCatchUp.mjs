import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildBoundedSimulationSteps,
  HC031W2A4_MAX_STEP_SECONDS,
  HC031W2A4_MAX_CATCH_UP_SECONDS,
  HC031W2A4_MAX_SUBSTEPS
} from "../src/core/BoundedSimulationCatchUp.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { InputSystem } from "../src/input/InputSystem.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const frameTruthSource = read("../src/core/FrameTruthObserver.js");

assert.equal(HC031W2A4_MAX_STEP_SECONDS, 0.05);
assert.equal(HC031W2A4_MAX_CATCH_UP_SECONDS, 0.15);
assert.equal(HC031W2A4_MAX_SUBSTEPS, 3);

let plan = buildBoundedSimulationSteps(0.016);
assert.equal(plan.substepCount, 1);
assert.ok(Math.abs(plan.simulatedSeconds - 0.016) < 1e-9);
assert.equal(plan.droppedSeconds, 0);
assert.ok(plan.steps.every((dt) => dt <= 0.05));

plan = buildBoundedSimulationSteps(0.1);
assert.equal(plan.substepCount, 2);
assert.ok(plan.steps.every((dt) => dt <= 0.05 + 1e-12));
assert.ok(Math.abs(plan.simulatedSeconds - 0.1) < 1e-9);
assert.ok(Math.abs(plan.recoveredBeyondLegacyCapSeconds - 0.05) < 1e-9);
assert.equal(plan.droppedSeconds, 0);

plan = buildBoundedSimulationSteps(0.149);
assert.equal(plan.substepCount, 3);
assert.ok(plan.steps.every((dt) => dt <= 0.05 + 1e-12));
assert.ok(Math.abs(plan.simulatedSeconds - 0.149) < 1e-9);

plan = buildBoundedSimulationSteps(0.4);
assert.equal(plan.substepCount, 3);
assert.ok(Math.abs(plan.simulatedSeconds - 0.15) < 1e-9);
assert.ok(Math.abs(plan.droppedSeconds - 0.25) < 1e-9);
assert.ok(Math.abs(plan.recoveredBeyondLegacyCapSeconds - 0.10) < 1e-9);
assert.equal(plan.catastrophicGap, true);
assert.ok(plan.steps.every((dt) => dt <= 0.05 + 1e-12));

plan = buildBoundedSimulationSteps(Number.NaN);
assert.equal(plan.substepCount, 1);
assert.equal(plan.simulatedSeconds, 0);
assert.equal(plan.droppedSeconds, 0);

// Runtime integration: all simulation work is inside the bounded substep loop,
// while transition coordination and renderer submission remain once per callback.
assert.match(runtimeSource, /const catchUp = buildBoundedSimulationSteps\(rawDt\)/);
assert.match(runtimeSource, /for \(let substepIndex = 0; substepIndex < catchUp\.steps\.length; substepIndex \+= 1\)/);
assert.match(runtimeSource, /runtimeFrameSimulatedDeltaMs = catchUp\.simulatedSeconds \* 1000/);
assert.match(runtimeSource, /runtimeFrameDroppedDeltaMs = catchUp\.droppedSeconds \* 1000/);
assert.match(runtimeSource, /runtimeSimulationSubstepCount = catchUp\.substepCount/);
const tickSource = runtimeSource.slice(runtimeSource.indexOf("  tick() {"), runtimeSource.indexOf("\n  updateCamera(dt) {"));
assert.equal((tickSource.match(/this\.renderer\.render\(/g) ?? []).length, 1, "renderer must submit exactly once per callback");
assert.equal((tickSource.match(/firstSliceTransitionCoordinator\?\.update\(/g) ?? []).length, 1, "transition coordinator must observe once per callback");

// Frame Truth must count recovered ordinary frame time and only mark time above
// the 150ms ceiling as discarded.
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
observer.endFrame({ registryMs: 3, remainingUpdateMs: 1, renderMs: 5, cellId: "TEST" });
let snapshot = observer.snapshot();
assert.ok(["HC-031W2A4", "HC-031W2A4.1", "HC-031W2A5", "HC-031W2A5.1"].includes(snapshot.optimizationPass));
assert.equal(snapshot.total.simToWallRatio, 1);
assert.equal(snapshot.total.discardedSeconds, 0);
assert.equal(snapshot.total.simulationCatchUp.multiSubstepFrames, 1);
assert.equal(snapshot.total.simulationCatchUp.recoveredBeyondLegacyCapSeconds, 0.05);
assert.equal(snapshot.windows[0].simulationCatchUp.maxSubsteps, 2);

now = 500;
observer.beginFrame({
  frame: 2,
  rawDt: 0.4,
  dt: 0.15,
  cellId: "TEST",
  substepCount: 3,
  recoveredBeyondLegacyCapSeconds: 0.1
});
observer.endFrame({ registryMs: 4, remainingUpdateMs: 1, renderMs: 6, cellId: "TEST" });
snapshot = observer.snapshot();
assert.ok(snapshot.total.discardedSeconds >= 0.25);
assert.ok(snapshot.last40LongGaps.some((gap) => gap.substepCount === 3 && gap.recoveredBeyondLegacyCapMs === 100));
assert.match(frameTruthSource, /150ms\/callback catch-up ceiling/);

// Repeated catch-up substeps must not repeat profiler instrumentation inside one callback.
const registry = new SystemRegistry();
registry.register("noop", { update() {} });
const state = {
  frame: 60,
  runtimeFrameRawDeltaMs: 100,
  runtimeSimulationSubstepIndex: 0,
  firstSliceRuntimeMount: {},
  transitionContinuity: {}
};
registry.update(0.05, state);
assert.equal(state.runtimeExecution.timingSampled, true);
state.runtimeSimulationSubstepIndex = 1;
registry.update(0.05, state);
assert.equal(state.runtimeExecution.timingSampled, false);

// Input edge ownership remains one-shot across multiple simulation substeps while held
// input time advances through each substep.
const button = (down = false, value = down ? 1 : 0) => ({ pressed: down, touched: down, value });
const buttons = Array.from({ length: 16 }, () => button(false, 0));
buttons[0] = button(true, 1); // A / Commit edge
buttons[2] = button(true, 1); // X / held Pulse
const pad = { index: 0, id: "A4 test pad", mapping: "standard", axes: [0, 0, 0, 0], buttons };
const priorNavigator = globalThis.navigator;
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { getGamepads: () => [pad] } });
const input = new InputSystem();
const inputState = { frame: 1, runtimeSeconds: 0, controllerOnboarding: {} };
input.update(0.05, inputState);
assert.equal(inputState.input.interactPressed, true);
assert.equal(inputState.input.interactEventId, 1);
assert.ok(inputState.input.pulseHeld);
assert.ok(Math.abs(inputState.input.pulseHoldSeconds - 0.05) < 1e-9);
input.update(0.05, inputState);
assert.equal(inputState.input.interactPressed, false, "held A must not refire on catch-up substep 2");
assert.equal(inputState.input.interactEventId, 1);
assert.ok(Math.abs(inputState.input.pulseHoldSeconds - 0.1) < 1e-9, "held Pulse duration must advance across substeps");
if (priorNavigator === undefined) delete globalThis.navigator;
else Object.defineProperty(globalThis, "navigator", { configurable: true, value: priorNavigator });

console.log("HC031W2A4 bounded simulation catch-up PASS");
