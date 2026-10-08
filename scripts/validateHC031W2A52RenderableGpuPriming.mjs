import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const coordinatorSource = read("../src/core/FirstSliceTransitionCoordinator.js");

assert.match(observerSource, /optimizationPass: "HC-031W2A5\.(?:2|3)"/);
assert.match(observerSource, /transitionGpuPrimingRule/);
assert.match(coordinatorSource, /(?:one_shared_renderable_per_idle_slot_offscreen_1x1_draw|early_offscreen_draw_before_shader_warmup_one_shared_renderable_per_idle_slot)/);
assert.match(coordinatorSource, /new THREE\.WebGLRenderTarget\(GPU_PRIME_TARGET_SIZE, GPU_PRIME_TARGET_SIZE/);
assert.match(coordinatorSource, /guide_threshold_layered_interaction_HC006F/);
assert.match(coordinatorSource, /hub_chamber_spatial_authority_HC008G/);
assert.match(coordinatorSource, /primePreparedRenderables\("surface_to_guide"\)/);
assert.match(coordinatorSource, /primePreparedRenderables\("guide_to_hub"\)/);
assert.doesNotMatch(runtimeSource, /\.prepareRenderActivationStaging\(this\.frameState\)/,
  "A5.1 whole-root staging must be retired from the live render path");
assert.doesNotMatch(runtimeSource, /\.restoreRenderActivationStaging\(\)/,
  "A5.1 root visibility restoration must no longer be needed by live rendering");
assert.match(runtimeSource, /transitionGpuPrimingAtFrameStart/);
assert.match(runtimeSource, /transitionGpuPrimingLastRenderableName/);

const scene = new THREE.Scene();
scene.name = "actual_host_scene";
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
const draws = [];
const renderer = {
  getRenderTarget() { return renderTarget; },
  setRenderTarget(target) { renderTarget = target; },
  clear() {},
  render(primeScene) {
    const drawable = primeScene.children.find((child) => child.isMesh || child.isLine || child.isPoints || child.isSprite);
    assert.ok(drawable, "offscreen prime scene must contain exactly the current drawable clone");
    draws.push({
      name: drawable.name,
      geometry: drawable.geometry,
      material: drawable.material,
      targetWidth: renderTarget?.width,
      targetHeight: renderTarget?.height
    });
  }
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

const genericRoot = new THREE.Group();
genericRoot.name = "scar_memory_fleck_001";
genericRoot.visible = false;
const genericMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 4, 3),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
genericMesh.name = "scar_memory_fleck_child";
genericRoot.add(genericMesh);
scene.add(genericRoot);
coordinator.registerPreparedRoot(genericRoot, "surface_to_guide");

const guideRoot = new THREE.Group();
guideRoot.name = "guide_threshold_layered_interaction_HC006F";
guideRoot.visible = false;
const strand = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)), 4, 0.02, 3, false),
  new THREE.MeshBasicMaterial({ color: 0x88ffff, transparent: true, opacity: 0.2 })
);
strand.name = "guide_threshold_current_strand_01";
const rib = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.2, 1),
  new THREE.MeshBasicMaterial({ color: 0xaaffff, transparent: true, opacity: 0.1 })
);
rib.name = "guide_threshold_settling_rib_01";
guideRoot.add(strand, rib);
scene.add(guideRoot);
coordinator.registerPreparedRoot(guideRoot, "surface_to_guide");

const previousIdle = globalThis.requestIdleCallback;
globalThis.requestIdleCallback = (callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1;
};
try {
  const queue = coordinator.collectGpuPrimeRenderables("surface_to_guide");
  assert.equal(queue.length, 3);
  assert.equal(queue[0].root, guideRoot, "known heavy guide root must prime before generic boundary roots");
  assert.equal(queue[1].root, guideRoot, "all children of the priority guide root stay grouped ahead of generic roots");

  const result = await coordinator.primePreparedRenderables("surface_to_guide");
  assert.equal(result.status, "complete_offscreen_gpu_prime");
  assert.equal(result.primedCount, 3);
  assert.equal(draws.length, 3, "each drawable child must traverse its own real render call");
  assert.equal(draws[0].name, "guide_threshold_current_strand_01__gpu_prime_clone");
  assert.equal(draws[0].geometry, strand.geometry, "offscreen clone must share the authored geometry buffer");
  assert.equal(draws[0].material, strand.material, "offscreen clone must share the authored material/textures");
  assert.equal(draws[0].targetWidth, 1);
  assert.equal(draws[0].targetHeight, 1);
  assert.equal(guideRoot.visible, false, "GPU priming must not change authored root visibility");
  assert.equal(genericRoot.visible, false, "GPU priming must not activate generic prepared roots");
  assert.equal(coordinator.gpuPriming.primedRenderableCount, 3);
  assert.equal(coordinator.gpuPriming.failedRenderableCount, 0);
  assert.equal(coordinator.gpuPriming.yieldedIdleSlots, 2);
  assert.equal(coordinator.collectGpuPrimeRenderables("surface_to_guide").length, 0,
    "already primed children must not be submitted again");

  coordinator.publish(frameState, 16);
  assert.match(frameState.transitionContinuity.gpuPrimingPass, /^HC-031W2A5\.(?:2|3)$/);
  assert.match(frameState.transitionContinuity.gpuPrimingPolicy, /offscreen.*draw|draw.*offscreen/);
  assert.equal(frameState.transitionContinuity.gpuPrimingRootLevelStagingRetired, true);
  assert.equal(frameState.transitionContinuity.gpuPrimingPrimedRenderableCount, 3);

  let now = 0;
  const observer = new FrameTruthObserver({
    now: () => now,
    documentRef: { hidden: false, hasFocus: () => true },
    windowMs: 10000
  });
  now = 100;
  observer.beginFrame({ frame: 1, rawDt: 0.04, dt: 0.04, cellId: "CELL_MEMBRANE_NURSERY_001" });
  observer.endFrame({ registryMs: 5, renderMs: 20, cellId: "CELL_MEMBRANE_NURSERY_001" });

  const primingSnapshot = {
    ...coordinator.gpuPrimingSnapshot(),
    sequence: 4,
    lastBoundary: "surface_to_guide",
    lastRootName: "guide_threshold_layered_interaction_HC006F",
    lastRenderableName: "guide_threshold_current_strand_01",
    lastDurationMs: 420,
    lastStatus: "primed_offscreen_draw"
  };
  now = 600;
  observer.beginFrame({
    frame: 2,
    rawDt: 0.5,
    dt: 0.15,
    cellId: "CELL_MEMBRANE_NURSERY_001",
    substepCount: 3,
    transitionGpuPriming: primingSnapshot
  });
  const gap = observer.snapshot().last40LongGaps.at(-1);
  assert.equal(gap.precedingTransitionGpuPrime.rootName, "guide_threshold_layered_interaction_HC006F");
  assert.equal(gap.precedingTransitionGpuPrime.renderableName, "guide_threshold_current_strand_01");
  assert.equal(gap.precedingTransitionGpuPrime.durationMs, 420);
  assert.equal(gap.precedingTransitionGpuPrime.operationsSincePreviousCallback, 4);
  assert.match(observer.snapshot().optimizationPass, /^HC-031W2A5\.(?:2|3)$/);
} finally {
  if (previousIdle === undefined) delete globalThis.requestIdleCallback;
  else globalThis.requestIdleCallback = previousIdle;
}

console.log("HC031W2A5.2 renderable-level offscreen GPU priming + idle-gap child attribution PASS");
