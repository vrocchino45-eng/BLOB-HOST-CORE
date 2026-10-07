import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { CoreVerbPhysicalizationSystem } from "../src/player/CoreVerbPhysicalizationSystem.js";
import { CoreSurfaceTruthSystem } from "../src/player/CoreSurfaceTruthSystem.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const telemetrySource = read("../src/core/SessionTelemetrySystem.js");
const frameTruthSource = read("../src/core/FrameTruthObserver.js");
const verbSource = read("../src/player/CoreVerbPhysicalizationSystem.js");
const surfaceSource = read("../src/player/CoreSurfaceTruthSystem.js");

// Gameplay clock and authority stay unchanged in A1.
assert.match(frameTruthSource, /optimizationPass: "HC-031W2A(?:[123]|4(?:\.1)?)"/);
assert.match(runtimeSource, /buildBoundedSimulationSteps\(rawDt\)/);
assert.match(runtimeSource, /pulseContourSegments:/);
assert.match(runtimeSource, /surfaceBroadPhaseCandidates:/);

// Pulse contour cost is bounded and duplicate cages are retired.
assert.match(verbSource, /this\.maxPulseContours = 3/);
assert.match(verbSource, /this\.maxPulseContourMeshes = 4/);
assert.match(verbSource, /this\.maxPulseContourSegmentsPerMesh = 180/);
assert.match(verbSource, /pulseContourGeometryCache = new WeakMap/);
assert.match(verbSource, /targetId: contact\?\.id/);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const sharedGeometry = new THREE.SphereGeometry(0.6, 32, 16);
const makeTarget = (id, x) => {
  const root = new THREE.Group();
  root.position.x = x;
  for (let i = 0; i < 5; i += 1) {
    const mesh = new THREE.Mesh(sharedGeometry, new THREE.MeshBasicMaterial());
    mesh.position.set(i * 0.1, 0, 0);
    root.add(mesh);
  }
  scene.add(root);
  return { recipe: { id }, root };
};
const targets = [makeTarget("a", 0), makeTarget("b", 2), makeTarget("c", 4), makeTarget("d", 6)];
const chemObjectSystem = { objects: targets };
const frameState = { coreTopologyVerbCharacter: { pulse: {} } };
const verbSystem = new CoreVerbPhysicalizationSystem({ scene, playerRoot, chemObjectSystem, frameState });
for (let i = 0; i < 5; i += 1) verbSystem.spawnPulseContour({ id: "a", resolutionStage: 3 }, 0xffffff, frameState);
assert.equal(verbSystem.pulseContours.length, 1, "same target must not stack duplicate pulse cages");
for (const id of ["b", "c", "d"]) verbSystem.spawnPulseContour({ id, resolutionStage: 3 }, 0xffffff, frameState);
assert.equal(verbSystem.pulseContours.length, 3, "concurrent pulse contours must remain capped at three");
for (const contour of verbSystem.pulseContours) {
  assert.ok(contour.segmentCount <= 4 * 180, `contour segment budget exceeded: ${contour.segmentCount}`);
}
assert.ok(
  verbSystem.pulseContours.reduce((sum, contour) => sum + contour.segmentCount, 0) <= 3 * 4 * 180,
  "total active contour line budget exceeded"
);

// Surface broad phase rejects only candidates whose enclosing sphere cannot touch the probe.
assert.match(surfaceSource, /bounding_sphere_reject_before_raycast/);
const surfaceFrameState = { activeCellId: "TEST", playerKinematics: {} };
const surfacePlayer = new THREE.Group();
const surfaceScene = new THREE.Scene();
surfaceScene.add(surfacePlayer);
const surfaceSystem = new CoreSurfaceTruthSystem({ scene: surfaceScene, playerRoot: surfacePlayer, frameState: surfaceFrameState });
surfaceSystem.playerPosition.set(0, 0, 0);
const nearMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial());
nearMesh.position.set(1.0, 0, 0);
nearMesh.updateMatrixWorld(true);
nearMesh.geometry.computeBoundingSphere();
const farMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial());
farMesh.position.set(10, 0, 0);
farMesh.updateMatrixWorld(true);
farMesh.geometry.computeBoundingSphere();
assert.equal(surfaceSystem.candidateWithinProbe({ object: nearMesh, localBoundingSphere: nearMesh.geometry.boundingSphere.clone() }), true);
assert.equal(surfaceSystem.candidateWithinProbe({ object: farMesh, localBoundingSphere: farMesh.geometry.boundingSphere.clone() }), false);

// Live status telemetry summary is throttled, while exportSession still calls buildSummary directly.
assert.match(telemetrySource, /summaryPublishIntervalSeconds = 0\.75/);
assert.match(telemetrySource, /summary: this\.publishedSummary/);
assert.match(telemetrySource, /summary: this\.buildSummary\(\),\n\s+events:/);

// Profiler keeps periodic truth but avoids timing every moderately slow frame.
const registry = new SystemRegistry();
registry.register("noop", { update() {} });
const baseState = {
  firstSliceRuntimeMount: {},
  transitionContinuity: {},
  frame: 1,
  runtimeFrameRawDeltaMs: 80
};
registry.update(0.05, baseState);
assert.equal(baseState.runtimeExecution.timingSampled, false);
baseState.frame = 60;
baseState.runtimeFrameRawDeltaMs = 80;
registry.update(0.05, baseState);
assert.equal(baseState.runtimeExecution.timingSampled, true);
baseState.frame = 61;
baseState.runtimeFrameRawDeltaMs = 150;
registry.update(0.05, baseState);
assert.equal(baseState.runtimeExecution.timingSampled, true);
baseState.frame = 62;
baseState.runtimeFrameRawDeltaMs = 150;
registry.update(0.05, baseState);
assert.equal(baseState.runtimeExecution.timingSampled, false);

console.log("HC031W2A1 cost reduction: contour budget, surface broad phase, telemetry cadence, profiler cooldown PASS");
