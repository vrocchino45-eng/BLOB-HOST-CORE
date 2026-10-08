import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const runtimeSource = fs.readFileSync(path.join(root, "src/core/GameRuntime.js"), "utf8");
const observerSource = fs.readFileSync(path.join(root, "src/core/FrameTruthObserver.js"), "utf8");
const coordinatorSource = fs.readFileSync(path.join(root, "src/core/FirstSliceTransitionCoordinator.js"), "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(`[HC031W2A5] ${message}`);
};

assert(observerSource.includes('optimizationPass: "HC-031W2A5"'), "Frame Truth must expose the A5 marker.");
assert(observerSource.includes("transitionRenderWarmupRule"), "Frame Truth must describe the transition warmup rule.");
assert(runtimeSource.includes("transitionWarmupTargetSceneCompiles"), "Runtime telemetry must expose target-scene compile count.");
assert(runtimeSource.includes("transitionWarmupPendingRoots"), "Runtime telemetry must expose pending warmup roots.");
assert(coordinatorSource.includes("compileAsync(root, this.camera, this.scene)"), "Warmup must compile the actual prepared root against the live Host scene.");
assert(!coordinatorSource.includes("new THREE.AmbientLight"), "A5 must not compile against a synthetic AmbientLight scene.");
assert(coordinatorSource.includes("yieldWarmupIdleSlot"), "Warmup must yield between prepared roots.");
assert(coordinatorSource.includes("prepareGeometryBounds(root)"), "Warmup must precompute geometry bounds before first visibility.");

const makeGeometry = () => ({
  attributes: { position: { count: 3 } },
  boundingSphere: null,
  computeBoundingSphere() { this.boundingSphere = { radius: 1 }; }
});
const makeRoot = (name) => {
  const child = { geometry: makeGeometry() };
  return {
    name,
    type: "Group",
    isObject3D: true,
    userData: { transitionPrepared: true },
    traverse(callback) { callback(this); callback(child); }
  };
};

const compileCalls = [];
const scene = { children: [], traverseVisible() {}, name: "actual_host_scene" };
const camera = { name: "camera" };
const renderer = {
  async compileAsync(rootObject, cameraArg, targetSceneArg) {
    compileCalls.push([rootObject, cameraArg, targetSceneArg]);
  }
};
const registry = {
  prepared: new Map(),
  prepareSystem() { return { status: "already_initialized" }; }
};
const frameState = {
  frame: 10,
  runtimeSeconds: 5,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  firstSliceRuntimeMount: {}
};
const morphStub = { prepareTransitionResources() { return []; }, destinationPrepared: true };
const coordinator = new FirstSliceTransitionCoordinator({
  registry,
  scene,
  camera,
  renderer,
  localCellMorphSystem: morphStub,
  secondLocalCellMorphSystem: morphStub,
  frameState,
  autoSchedule: false
});

const rootA = makeRoot("warm_a");
const rootB = makeRoot("warm_b");
coordinator.preparedRoots.add(rootA);
coordinator.preparedRoots.add(rootB);

const previousIdle = globalThis.requestIdleCallback;
globalThis.requestIdleCallback = (callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1;
};
try {
  const result = await coordinator.warmPreparedShaders();
  assert(result.status === "compiled_target_scene_staged", "Warmup should complete using the target-scene staged path.");
  assert(result.compiledCount === 2, "Both prepared roots should compile.");
  assert(compileCalls.length === 2, "Prepared roots must compile individually, not as one aggregate scene.");
  assert(compileCalls[0][0] === rootA && compileCalls[1][0] === rootB, "Warmup must compile the real prepared root objects.");
  assert(compileCalls.every(([, cameraArg, target]) => cameraArg === camera && target === scene), "Every compile must use the actual camera and Host target scene.");
  assert(rootA.traverse && rootA.userData.transitionPrepared, "Warmup must not replace or activate prepared roots.");
  assert(coordinator.compiledRoots.has(rootA) && coordinator.compiledRoots.has(rootB), "Compiled root tracking must advance.");
  assert(coordinator.shaderWarmup.geometryBoundsPrepared === 2, "Geometry bounding spheres should be prepared once per root geometry.");
  assert(coordinator.shaderWarmup.yieldedIdleSlots === 1, "Two roots should yield exactly once between compile calls.");
  coordinator.publish(frameState, 16);
  assert(frameState.transitionContinuity.shaderWarmupPolicy === "actual_scene_target_incremental_per_root", "Published telemetry must identify A5 policy.");
  assert(frameState.transitionContinuity.shaderWarmupCompiledRootCount === 2, "Published telemetry must expose compiled roots.");
  assert(frameState.transitionContinuity.shaderWarmupPendingRootCount === 0, "Published telemetry must expose zero pending roots after completion.");
  assert(frameState.transitionContinuity.progressionMutation === false, "Warmup remains non-authoritative for progression.");
} finally {
  if (previousIdle === undefined) delete globalThis.requestIdleCallback;
  else globalThis.requestIdleCallback = previousIdle;
}

console.log("HC031W2A5 transition render warmup: target-scene compile, incremental idle staging, geometry bounds, telemetry PASS");
