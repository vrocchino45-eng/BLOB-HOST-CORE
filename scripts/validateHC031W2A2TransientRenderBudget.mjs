import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { CoreVerbPhysicalizationSystem } from "../src/player/CoreVerbPhysicalizationSystem.js";
import { RenderBudgetSystem } from "../src/presentation/RenderBudgetSystem.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const frameTruthSource = read("../src/core/FrameTruthObserver.js");
const verbSource = read("../src/player/CoreVerbPhysicalizationSystem.js");
const composerSource = read("../src/visual/composers/ChemObjectVisualComposer.js");
const renderBudgetSource = read("../src/presentation/RenderBudgetSystem.js");

// W2A2 remains a performance-only pass. Gameplay time authority is still unchanged.
assert.match(frameTruthSource, /optimizationPass: "HC-031W2A(?:[235](?:\.[123])?|4(?:\.1)?)"/);
assert.match(runtimeSource, /buildBoundedSimulationSteps\(rawDt\)/);
assert.match(runtimeSource, /new RenderBudgetSystem\(\{ scene: this\.scene \}\)/);
assert.match(runtimeSource, /renderBudgetSystem\?\.prepare/);
assert.match(runtimeSource, /renderBudgetSystem\?\.restoreAfterRender/);
assert.match(runtimeSource, /renderOwnerCensus:/);
assert.match(frameTruthSource, /lastRenderOwnerCensus:/);

// Rapid Pulse rendering is bounded and uses shared geometry rather than creating
// new sphere/torus buffers for every release/contact/return.
assert.match(verbSource, /this\.maxPulseFronts = 3/);
assert.match(verbSource, /this\.maxContactFlashes = 12/);
assert.match(verbSource, /this\.maxPulseReturnMotes = 10/);
assert.match(verbSource, /hc031w2a2SharedTransientGeometry/);
assert.doesNotMatch(verbSource, /new THREE\.Mesh\(new THREE\.SphereGeometry\(baseRadius/);
assert.doesNotMatch(verbSource, /new THREE\.Mesh\(new THREE\.TorusGeometry\(0\.11, 0\.012, 6, 20\), material\)/);
assert.match(composerSource, /new THREE\.SphereGeometry\(1\.08, 12, 8\)/);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const state = {
  stabilizedProjection: { active: false },
  playerKinematics: { cameraRelativeForward: { x: 0, y: 0, z: -1 } },
  coreTopologyVerbCharacter: { pulse: {} }
};
const verbSystem = new CoreVerbPhysicalizationSystem({
  scene,
  playerRoot,
  chemObjectSystem: { objects: [] },
  frameState: state
});
for (let i = 0; i < 8; i += 1) {
  verbSystem.spawnPulseFront({ pulseMode: "quick", waveSpeed: 6.6, maxRange: 4.25 }, state);
}
assert.equal(verbSystem.pulseFronts.length, 3, "pulse front budget must cap rapid release overlap");
assert.ok(verbSystem.pulseFronts.every((front) => front.root.geometry === verbSystem.sharedPulseFrontQuickGeometry));

for (let i = 0; i < 20; i += 1) {
  verbSystem.spawnContactFlash(new THREE.Vector3(i * 0.01, 0, 0), 0xffffff);
}
assert.equal(verbSystem.contactFlashes.length, 12, "contact flash budget must remain bounded");
assert.ok(verbSystem.contactFlashes.every((flash) => flash.root.geometry === verbSystem.sharedContactFlashGeometry));

for (let i = 0; i < 14; i += 1) {
  verbSystem.spawnPulseReturnMote({
    position: { x: i * 0.01, y: 0, z: -1 },
    reachClass: "local_actionable",
    returnTravelSeconds: 0.25,
    resolutionStage: 1,
    responseClass: "host_membrane"
  }, 0xffffff, state);
}
assert.equal(verbSystem.pulseReturnMotes.length, 10, "return mote budget must remain bounded");
assert.ok(verbSystem.pulseReturnMotes.every((mote) => mote.root.geometry === verbSystem.sharedPulseReturnLocalGeometry));

// Render culling is intentionally narrow: only leaf renderables that are fully
// transparent and depth-write-disabled are hidden, then restored immediately.
const budgetScene = new THREE.Scene();
const owner = new THREE.Group();
owner.name = "owner_test_root";
budgetScene.add(owner);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const invisible = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
const faint = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.02, depthWrite: false }));
const depthWriter = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: true }));
owner.add(invisible, faint, depthWriter);
const renderBudget = new RenderBudgetSystem({ scene: budgetScene, censusIntervalSeconds: 2 });
const prep = renderBudget.prepare({ runtimeSeconds: 0 });
assert.equal(prep.transparentZeroCulled, 1);
assert.equal(invisible.visible, false);
assert.equal(faint.visible, true);
assert.equal(depthWriter.visible, true);
assert.equal(prep.ownerCensus.topOwners[0].owner, "owner_test_root");
assert.equal(prep.ownerCensus.transparentZeroRenderables, 1);
renderBudget.restoreAfterRender();
assert.equal(invisible.visible, true, "render-only cull must restore authored visibility immediately");
assert.match(renderBudgetSource, /depthWrite === false/);
assert.match(renderBudgetSource, /object\.children\?\.length/);

// Frame Truth carries the low-frequency owner census into exports.
let now = 0;
const observer = new FrameTruthObserver({
  now: () => now,
  documentRef: { hidden: false, hasFocus: () => true },
  windowMs: 1
});
now = 16;
observer.beginFrame({ frame: 1, rawDt: 0.016, dt: 0.016, cellId: "TEST" });
observer.endFrame({
  registryMs: 2,
  remainingUpdateMs: 1,
  renderMs: 5,
  cellId: "TEST",
  rendererInfo: { calls: 4 },
  renderOwnerCensus: prep.ownerCensus
});
const snapshot = observer.snapshot();
assert.ok(["HC-031W2A2", "HC-031W2A3", "HC-031W2A4", "HC-031W2A4.1", "HC-031W2A5", "HC-031W2A5.1", "HC-031W2A5.2", "HC-031W2A5.3"].includes(snapshot.optimizationPass));
assert.equal(snapshot.windows[0].lastRenderOwnerCensus.topOwners[0].owner, "owner_test_root");

console.log("HC031W2A2 transient render budget + owner census PASS");
