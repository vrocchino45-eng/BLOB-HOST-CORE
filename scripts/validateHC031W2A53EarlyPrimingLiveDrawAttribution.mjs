import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const coordinatorSource = read("../src/core/FirstSliceTransitionCoordinator.js");

assert.match(observerSource, /optimizationPass: "HC-031W2A5\.3"/);
assert.match(observerSource, /transitionLiveDrawAttributionRule/);
assert.match(coordinatorSource, /early_offscreen_draw_before_shader_warmup_one_shared_renderable_per_idle_slot/);
assert.match(coordinatorSource, /passive_pre_render_newly_drawable_child_attribution_no_visibility_mutation/);
assert.match(runtimeSource, /captureLiveDrawAttribution/);
assert.match(runtimeSource, /transitionLiveDrawAttribution/);
assert.doesNotMatch(runtimeSource, /\.prepareRenderActivationStaging\(this\.frameState\)/,
  "A5.1 live root staging must remain retired");

const surfaceGpuIndex = coordinatorSource.indexOf('id: "surface_to_guide_gpu_renderables"');
const surfaceShaderIndex = coordinatorSource.indexOf('id: "surface_to_guide_shader_programs"');
const hubGpuIndex = coordinatorSource.indexOf('id: "guide_to_hub_gpu_renderables"');
const hubShaderIndex = coordinatorSource.indexOf('id: "guide_to_hub_shader_programs"');
assert.ok(surfaceGpuIndex >= 0 && surfaceGpuIndex < surfaceShaderIndex,
  "Surface→Guide real GPU priming must run before shader-only warmup");
assert.ok(hubGpuIndex >= 0 && hubGpuIndex < hubShaderIndex,
  "Guide→Hub real GPU priming must run before shader-only warmup");

const scene = new THREE.Scene();
const registry = { prepared: new Map(), prepareSystem() { return { status: "prepared" }; } };
const frameState = {
  frame: 10,
  runtimeSeconds: 5,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  localCellMorph: { phase: "waiting", completed: false, progress: 0 },
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

const guideRoot = new THREE.Group();
guideRoot.name = "guide_threshold_layered_interaction_HC006F";
guideRoot.visible = false;
const primedChild = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
primedChild.name = "guide_threshold_live_child_primed";
const unprimedChild = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
unprimedChild.name = "guide_threshold_live_child_unprimed";
guideRoot.add(primedChild, unprimedChild);
scene.add(guideRoot);
coordinator.registerPreparedRoot(guideRoot, "surface_to_guide");
coordinator.gpuPrimedRenderables.add(primedChild);

let snapshot = coordinator.captureLiveDrawAttribution(frameState);
assert.equal(snapshot.newlyDrawableCount, 0, "hidden prepared root must not be attributed as live drawable");

guideRoot.visible = true;
frameState.frame = 11;
snapshot = coordinator.captureLiveDrawAttribution(frameState);
assert.equal(snapshot.pass, "HC-031W2A5.3");
assert.equal(snapshot.newlyDrawableCount, 2);
assert.equal(snapshot.unprimedNewlyDrawableCount, 1);
assert.equal(snapshot.items.length, 2);
assert.equal(snapshot.items.find((item) => item.renderableName === primedChild.name)?.primed, true);
assert.equal(snapshot.items.find((item) => item.renderableName === unprimedChild.name)?.primed, false);
assert.equal(guideRoot.visible, true, "passive attribution must not mutate authored visibility");

const repeated = coordinator.captureLiveDrawAttribution({ ...frameState, frame: 12 });
assert.equal(repeated.newlyDrawableCount, 0, "already drawable children must not be re-attributed every frame");

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
  transitionLiveDrawAttribution: snapshot
});
now = 700;
observer.beginFrame({
  frame: 2,
  rawDt: 0.6,
  dt: 0.15,
  cellId: "CELL_SCAR_FLOW_FOLD_001",
  substepCount: 3
});
const gap = observer.snapshot().last40LongGaps.at(-1);
assert.equal(gap.previousLiveDrawAttribution.newlyDrawableCount, 2);
assert.equal(gap.previousLiveDrawAttribution.unprimedNewlyDrawableCount, 1);
assert.equal(gap.previousLiveDrawAttribution.items[0].rootName, "guide_threshold_layered_interaction_HC006F");
assert.equal(observer.snapshot().optimizationPass, "HC-031W2A5.3");

console.log("HC031W2A5.3 early GPU priming order + passive live-draw child attribution PASS");
