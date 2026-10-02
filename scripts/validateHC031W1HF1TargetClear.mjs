import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Executable narrow regression for the W1 ownership-change empty-state path.
// Evaluates the actual TargetingSystem class with geometry constructor stubs;
// no dependency install, browser, or production build is required.
const sourcePath = process.env.TARGETING_SOURCE || new URL("../src/targeting/TargetingSystem.js", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
assert.match(source, /createEmptyTargetingState\(frameState, message = "no_target"\)/);
const transformed = source
  .replace(/^import \* as THREE from "three";\s*/m, "")
  .replace("export class TargetingSystem", "class TargetingSystem") + "\nTargetingSystem;";
class GeometryStateStub {}
const TargetingSystem = vm.runInNewContext(transformed, {
  THREE: { Vector3: GeometryStateStub, Matrix4: GeometryStateStub },
  Float32Array, Math, Number, Map, Set
}, { filename: "TargetingSystem.js" });

const frameState = {
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  firstSliceRuntimeMount: { mountSequence: 1 },
  input: { stabilizeHeld: true, resonanceHeld: false, pulseHeld: false, absorbHeld: false,
    cameraLookX: 0, cameraLookY: 0 },
  inputSource: { stabilizeTriggerValue: 1, rightStickMagnitude: 0 },
  targetFocus: { provider: "none" },
  adjacentHostTerritory: { enteredTerritory: false }
};
const system = new TargetingSystem({
  scene: {}, camera: {}, playerRoot: { userData: { id: "core" } },
  chemObjectSystem: {}, frameState
});

// Reproduce the original screenshot stack path:
// update -> clearForOwnershipChange -> clearTargetState -> createEmptyTargetingState.
system.lastActiveCellId = frameState.activeCellId;
system.lastMountSequence = frameState.firstSliceRuntimeMount.mountSequence;
frameState.activeCellId = "CELL_APERTURE_FIELDS_ARRIVAL_001";
frameState.firstSliceRuntimeMount.mountSequence = 2;
assert.doesNotThrow(() => system.update(1 / 60, frameState), "cell transition must not throw when LT is held");
assert.equal(frameState.targeting.active, false);
assert.equal(frameState.targeting.targetId, "none");
assert.equal(frameState.targeting.verbRetargetingAllowed, true, "empty-state input must still reflect LT intent");
assert.equal(frameState.targeting.regionClearSequence, 1);
assert.equal(frameState.controllerTargetingAudit.stabilizeHeld, true);

// Simulate explicit unmount while LT is released.
frameState.input.stabilizeHeld = false;
assert.doesNotThrow(() => system.onRuntimeUnmount(frameState));
assert.equal(frameState.targeting.verbRetargetingAllowed, false);
assert.equal(frameState.targeting.regionClearSequence, 2);

// No-target HUD/telemetry publication uses the same empty-state function.
frameState.input.stabilizeHeld = true;
assert.doesNotThrow(() => system.updateFrameState(frameState));
assert.equal(frameState.targeting.verbRetargetingAllowed, true);

console.log("HC031W1 HF1 target-clear lifecycle regression PASS");
console.log("- update -> ownership change -> clear target while LT held: PASS");
console.log("- explicit unmount while LT released: PASS");
console.log("- no-target frame-state publication while LT held: PASS");
