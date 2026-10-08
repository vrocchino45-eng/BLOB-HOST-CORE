import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const coordinatorSource = read("../src/core/FirstSliceTransitionCoordinator.js");

assert.match(observerSource, /optimizationPass: "HC-031W2A5\.4"/);
assert.match(observerSource, /transitionLiveAdmissionRule/);
assert.match(coordinatorSource, /primed_secondary_child_render_admission_authored_visibility_restored_each_callback/);
assert.match(runtimeSource, /prepareLiveChildAdmission/);
assert.match(runtimeSource, /restoreLiveChildAdmission/);
assert.match(runtimeSource, /transitionLiveAdmissionPass/);
assert.doesNotMatch(runtimeSource, /\.prepareRenderActivationStaging\(this\.frameState\)/,
  "A5.1 whole-root staging must remain retired");

const scene = new THREE.Scene();
const registry = { prepared: new Map(), prepareSystem() { return { status: "prepared" }; } };
const frameState = {
  frame: 10,
  runtimeSeconds: 5,
  activeCellId: "CELL_SCAR_FLOW_FOLD_001",
  localCellMorph: { phase: "arrived", completed: true, progress: 1 },
  secondLocalCellMorph: {},
  firstSliceRuntimeMount: {}
};
const morphStub = { prepareTransitionResources() { return []; }, destinationPrepared: true };
let renderTarget = null;
const renderer = {
  getRenderTarget() { return renderTarget; },
  setRenderTarget(target) { renderTarget = target; },
  clear() {},
  render() {}
};
const coordinator = new FirstSliceTransitionCoordinator({
  registry,
  scene,
  camera: new THREE.PerspectiveCamera(60, 1, 0.1, 100),
  renderer,
  localCellMorphSystem: morphStub,
  secondLocalCellMorphSystem: morphStub,
  frameState,
  autoSchedule: false
});

const root = new THREE.Group();
root.name = "guide_threshold_layered_interaction_HC006F";
root.visible = true;
const essential = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial());
essential.name = "scar_flow_arrival_active_cell_ring";
root.add(essential);
const primed = [];
for (let i = 0; i < 12; i += 1) {
  const child = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial());
  child.name = `guide_secondary_${String(i + 1).padStart(2, "0")}`;
  primed.push(child);
  root.add(child);
  coordinator.gpuPrimedRenderables.add(child);
}
const late = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial());
late.name = "guide_secondary_unprimed";
root.add(late);
scene.add(root);
coordinator.registerPreparedRoot(root, "surface_to_guide");

let admission = coordinator.prepareLiveChildAdmission(frameState);
assert.equal(admission.pass, "HC-031W2A5.4");
assert.equal(admission.maxPerFrame, 8);
assert.equal(admission.admittedThisRender, 8, "healthy callback should admit at most eight primed secondary children");
assert.equal(essential.visible, true, "essential arrival cue must remain immediate");
assert.equal(primed.filter((child) => child.visible).length, 8);
assert.equal(late.visible, false, "unprimed child must be deferred from the real draw");
let live = coordinator.captureLiveDrawAttribution(frameState);
assert.equal(live.newlyDrawableCount, 9, "essential cue + eight admitted primed children should become drawable");
assert.equal(live.unprimedNewlyDrawableCount, 1, "essential cue is allowed even if it did not require the offscreen prime");
coordinator.restoreLiveChildAdmission();
assert.equal(root.visible, true, "root authored visibility must never be mutated");
assert.ok(root.children.every((child) => child.visible), "all temporary child hides must be restored after render");

frameState.frame = 11;
admission = coordinator.prepareLiveChildAdmission(frameState);
assert.equal(admission.admittedThisRender, 4, "remaining primed secondary children should enter on the next callback");
live = coordinator.captureLiveDrawAttribution(frameState);
assert.equal(live.newlyDrawableCount, 4);
coordinator.restoreLiveChildAdmission();

coordinator.gpuPrimedRenderables.add(late);
frameState.frame = 12;
admission = coordinator.prepareLiveChildAdmission(frameState);
assert.equal(admission.admittedThisRender, 1, "formerly unprimed child should enter after its offscreen prime completes");
assert.equal(late.visible, true);
live = coordinator.captureLiveDrawAttribution(frameState);
assert.equal(live.newlyDrawableCount, 1);
coordinator.restoreLiveChildAdmission();

// A prior hard render stall pauses new secondary admission for one callback.
const afterStall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial());
afterStall.name = "guide_secondary_after_stall";
root.add(afterStall);
coordinator.gpuPrimedRenderables.add(afterStall);
coordinator.notifyRenderComplete({ renderMs: 300 });
frameState.frame = 13;
admission = coordinator.prepareLiveChildAdmission(frameState);
assert.equal(admission.admittedThisRender, 0);
assert.equal(afterStall.visible, false, "hard-stall recovery callback must not admit another secondary child");
coordinator.restoreLiveChildAdmission();
assert.equal(afterStall.visible, true);

let now = 0;
const observer = new FrameTruthObserver({
  now: () => now,
  documentRef: { hidden: false, hasFocus: () => true },
  windowMs: 10000
});
now = 100;
observer.beginFrame({ frame: 1, rawDt: 0.04, dt: 0.04, cellId: frameState.activeCellId });
observer.endFrame({
  registryMs: 5,
  renderMs: 20,
  cellId: frameState.activeCellId,
  transitionLiveDrawAttribution: live,
  rendererInfo: {
    transitionLiveAdmissionPass: "HC-031W2A5.4",
    transitionLiveAdmissionPolicy: admission.policy,
    transitionLiveAdmissionActiveBoundary: admission.activeBoundary,
    transitionLiveAdmissionSequence: admission.sequence,
    transitionLiveAdmissionAdmittedThisRender: admission.admittedThisRender,
    transitionLiveAdmissionEssentialThisRender: admission.essentialThisRender,
    transitionLiveAdmissionHiddenThisRender: admission.hiddenThisRender,
    transitionLiveAdmissionDeferredPrimedThisRender: admission.deferredPrimedThisRender,
    transitionLiveAdmissionDeferredUnprimedThisRender: admission.deferredUnprimedThisRender,
    transitionLiveAdmissionLastAdmittedRenderableName: admission.lastAdmittedRenderableName,
    transitionLiveAdmissionLastAdmittedRootName: admission.lastAdmittedRootName,
    transitionLiveAdmissionLastAdmittedBoundary: admission.lastAdmittedBoundary,
    transitionLiveAdmissionLastRenderMs: 20
  }
});
now = 700;
observer.beginFrame({ frame: 2, rawDt: 0.6, dt: 0.15, cellId: frameState.activeCellId, substepCount: 3 });
const gap = observer.snapshot().last40LongGaps.at(-1);
assert.equal(gap.previousLiveAdmission.pass, "HC-031W2A5.4");
assert.equal(observer.snapshot().optimizationPass, "HC-031W2A5.4");

console.log("HC031W2A5.4 primed child live-admission + render-only restore PASS");
