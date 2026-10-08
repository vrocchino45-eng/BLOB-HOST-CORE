import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { RenderBudgetSystem } from "../src/presentation/RenderBudgetSystem.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const frameTruthSource = read("../src/core/FrameTruthObserver.js");
const renderBudgetSource = read("../src/presentation/RenderBudgetSystem.js");
const hubSource = read("../src/hub/HubChamberFoundationSystem.js");
const verbSource = read("../src/player/CoreVerbPhysicalizationSystem.js");

// W2A3 residency/foundation behavior stays locked while W2A4 may own the runtime clock.
assert.match(frameTruthSource, /optimizationPass: "HC-031W2A(?:3|5(?:\.[123])?|4(?:\.1)?)"/);
assert.match(runtimeSource, /buildBoundedSimulationSteps\(rawDt\)/);
assert.match(runtimeSource, /frameState: this\.frameState/);
assert.match(runtimeSource, /residencyRootsCulled:/);
assert.match(verbSource, /this\.maxPulseFronts = 3/);
assert.match(verbSource, /this\.maxContactFlashes = 12/);
assert.match(verbSource, /this\.maxPulseReturnMotes = 10/);

// Local-cell residency is render-only: it must suppress previous-cell roots only for render,
// then restore authored visibility immediately.
assert.match(renderBudgetSource, /scar_flow_after_surface_transition_envelope/);
assert.match(renderBudgetSource, /signal_chorus_hub_local_detail_only/);
assert.match(renderBudgetSource, /surface_wake_visual_embodiment_HC008C/);
assert.match(renderBudgetSource, /host_contact_shelf_HC031I4/);
assert.match(renderBudgetSource, /restoreResidencyRoots/);
assert.match(renderBudgetSource, /entry\.object\.visible = entry\.visible/);

const scene = new THREE.Scene();
const oldSurface = new THREE.Group();
oldSurface.name = "surface_wake_visual_embodiment_HC008C";
oldSurface.add(new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6, depthWrite: false })
));
scene.add(oldSurface);
const oldContact = new THREE.Group();
oldContact.name = "host_contact_shelf_HC031I4";
oldContact.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
scene.add(oldContact);
const scarSurface = new THREE.Group();
scarSurface.name = "scar_flow_fold_surface_001";
scarSurface.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
scene.add(scarSurface);

const budget = new RenderBudgetSystem({ scene, censusIntervalSeconds: 0 });
let prep = budget.prepare({
  runtimeSeconds: 1,
  frameState: {
    activeCellId: "CELL_SCAR_FLOW_FOLD_001",
    scarFlowArrival: { arrivalAge: 1.2, nurseryFade: 0.5 }
  }
});
assert.equal(prep.residencyRootsCulled, 0, "Surface continuity must remain during the transition envelope");
budget.restoreAfterRender();

prep = budget.prepare({
  runtimeSeconds: 3,
  frameState: {
    activeCellId: "CELL_SCAR_FLOW_FOLD_001",
    scarFlowArrival: { arrivalAge: 2.5, nurseryFade: 1 }
  }
});
assert.equal(prep.residencyMode, "scar_flow_after_surface_transition_envelope");
assert.equal(oldSurface.visible, false);
assert.equal(oldContact.visible, false);
assert.equal(scarSurface.visible, true, "Current-cell Scar Flow body must remain visible");
assert.ok(!prep.ownerCensus.topOwners.some((owner) => owner.owner === oldSurface.name), "Census should measure the render-resident scene");
budget.restoreAfterRender();
assert.equal(oldSurface.visible, true);
assert.equal(oldContact.visible, true);

prep = budget.prepare({
  runtimeSeconds: 5,
  frameState: { activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001" }
});
assert.equal(prep.residencyMode, "signal_chorus_hub_local_detail_only");
assert.equal(oldSurface.visible, false);
assert.equal(scarSurface.visible, false);
budget.restoreAfterRender();
assert.equal(oldSurface.visible, true);
assert.equal(scarSurface.visible, true);

// Hub CPU convergence: no whole-scene matrix walk, scene roots are cached, and heavy
// scene-graph/spatial proof work is cadence-bound while per-frame animation remains intact.
assert.doesNotMatch(hubSource, /this\.scene\.updateMatrixWorld\(true\)/);
assert.match(hubSource, /this\.root\.updateWorldMatrix\(true, true\)/);
assert.match(hubSource, /sceneGraphRefreshIntervalSeconds = 0\.25/);
assert.match(hubSource, /spatialReadabilityRefreshIntervalSeconds = 0\.12/);
assert.match(hubSource, /getSceneObject\(name\)/);
assert.match(hubSource, /sceneGraphRefreshedThisFrame/);
assert.match(hubSource, /spatialReadabilityRefreshedThisFrame/);
assert.match(hubSource, /this\.animate\(dt, frameState\.runtimeSeconds/);

// Frame Truth must carry the new optimization pass through ordinary exports.
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
  rendererInfo: { calls: 4, residencyRootsCulled: 2, residencyMode: "test" },
  renderOwnerCensus: prep.ownerCensus
});
const snapshot = observer.snapshot();
assert.ok(["HC-031W2A3", "HC-031W2A4", "HC-031W2A4.1", "HC-031W2A5", "HC-031W2A5.1", "HC-031W2A5.2", "HC-031W2A5.3"].includes(snapshot.optimizationPass));
assert.equal(snapshot.windows[0].lastRendererInfo.residencyRootsCulled, 2);

console.log("HC031W2A3 residency + Hub foundation cadence PASS");
