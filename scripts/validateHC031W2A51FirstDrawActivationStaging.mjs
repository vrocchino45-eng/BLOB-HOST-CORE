import assert from "node:assert/strict";
import fs from "node:fs";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const coordinatorSource = read("../src/core/FirstSliceTransitionCoordinator.js");

assert.match(observerSource, /optimizationPass: "HC-031W2A5\.[123]"/);
assert.match(observerSource, /transitionFirstDrawStagingRule/);
assert.match(runtimeSource, /transitionActivationRootName/);
assert.match(coordinatorSource, /root_level_first_draw_staging_retired_gpu_priming_prepares_renderables_offscreen/);
assert.doesNotMatch(runtimeSource, /\.prepareRenderActivationStaging\(this\.frameState\)/,
  "A5.2 must retire A5.1 whole-root staging from the live render path");
assert.doesNotMatch(runtimeSource, /\.restoreRenderActivationStaging\(\)/,
  "A5.2 must not require root visibility restoration after live rendering");

const scene = { children: [], name: "test_scene" };
const registry = { prepared: new Map(), prepareSystem() { return { status: "prepared" }; } };
const frameState = {
  frame: 10,
  runtimeSeconds: 5,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  localCellMorph: { phase: "morphing_continuous_control", completed: false, progress: 0.05 },
  secondLocalCellMorph: {},
  firstSliceRuntimeMount: {}
};
const morphStub = { prepareTransitionResources() { return []; }, destinationPrepared: true };
const coordinator = new FirstSliceTransitionCoordinator({
  registry,
  scene,
  camera: {},
  renderer: {},
  localCellMorphSystem: morphStub,
  secondLocalCellMorphSystem: morphStub,
  frameState,
  autoSchedule: false
});

const makeRoot = (name, morphRole) => ({
  name,
  type: "Group",
  isObject3D: true,
  visible: true,
  parent: scene,
  userData: { morphRole },
  traverse(callback) { callback(this); }
});
const surface = makeRoot("scar_flow_fold_surface_001", "destination_environment");
const detail = makeRoot("guide_threshold_layered_interaction_HC006F", "support_detail");
scene.children.push(surface, detail);
coordinator.registerPreparedRoot(surface, "surface_to_guide");
coordinator.registerPreparedRoot(detail, "surface_to_guide");

// A5.2 keeps the legacy API only as a no-op compatibility surface. Authored
// visibility must no longer be serialized or hidden by this path.
const staging = coordinator.prepareRenderActivationStaging(frameState);
assert.equal(staging.pass, "HC-031W2A5.2");
assert.equal(staging.activatedThisCallback, false);
assert.equal(staging.hiddenThisRenderCount, 0);
assert.equal(surface.visible, true);
assert.equal(detail.visible, true);
coordinator.restoreRenderActivationStaging();
assert.equal(surface.visible, true);
assert.equal(detail.visible, true);

// Retain A5.1's historical long-gap root attribution reader so older A5.1 JSON
// remains comparable even though the live staging mechanism is retired.
let now = 0;
const observer = new FrameTruthObserver({
  now: () => now,
  documentRef: { hidden: false, hasFocus: () => true },
  windowMs: 10000
});
now = 100;
observer.beginFrame({ frame: 1, rawDt: 0.04, dt: 0.04, cellId: "CELL_SCAR_FLOW_FOLD_001" });
observer.endFrame({
  registryMs: 10,
  renderMs: 900,
  cellId: "CELL_SCAR_FLOW_FOLD_001",
  rendererInfo: {
    transitionActivationPass: "HC-031W2A5.1",
    transitionActivationBoundary: "surface_to_guide",
    transitionActivationActivatedThisCallback: true,
    transitionActivationRootName: "guide_threshold_layered_interaction_HC006F",
    transitionActivationLastRootName: "guide_threshold_layered_interaction_HC006F",
    transitionActivationSequence: 2,
    transitionActivationPendingRequestedRoots: 0,
    transitionActivationDeferredByBudgetCount: 1,
    transitionActivationLastRenderMs: 900,
    transitionActivationPeakRenderMs: 900,
    transitionActivationPeakRootName: "guide_threshold_layered_interaction_HC006F"
  }
});
now = 1100;
observer.beginFrame({ frame: 2, rawDt: 1.0, dt: 0.15, cellId: "CELL_SCAR_FLOW_FOLD_001", substepCount: 3 });
const gap = observer.snapshot().last40LongGaps.at(-1);
assert.equal(gap.previousTransitionActivation.rootName, "guide_threshold_layered_interaction_HC006F");
assert.equal(gap.previousTransitionActivation.activatedThisCallback, true);
assert.equal(gap.previousTransitionActivation.renderMs, 900);

console.log("HC031W2A5.1 attribution compatibility + A5.2 root-staging retirement PASS");
