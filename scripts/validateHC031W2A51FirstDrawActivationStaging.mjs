import assert from "node:assert/strict";
import fs from "node:fs";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";
import { FrameTruthObserver } from "../src/core/FrameTruthObserver.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const runtimeSource = read("../src/core/GameRuntime.js");
const observerSource = read("../src/core/FrameTruthObserver.js");
const coordinatorSource = read("../src/core/FirstSliceTransitionCoordinator.js");

assert.match(observerSource, /optimizationPass: "HC-031W2A5\.1"/);
assert.match(observerSource, /transitionFirstDrawStagingRule/);
assert.match(runtimeSource, /prepareRenderActivationStaging/);
assert.match(runtimeSource, /restoreRenderActivationStaging/);
assert.match(runtimeSource, /notifyRenderComplete/);
assert.match(runtimeSource, /transitionActivationRootName/);
assert.match(coordinatorSource, /ACTIVATION_RENDER_BUDGET_MS = 65/);
assert.match(coordinatorSource, /render_only_one_requested_root_per_callback_under_previous_render_budget/);

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
  userData: { morphRole }
});
const surface = makeRoot("scar_flow_fold_surface_001", "destination_environment");
const haze = makeRoot("scar_pressure_haze_001", "destination_environment");
const detail = makeRoot("guide_threshold_gameplay_fill_HC007B", "support_detail");
scene.children.push(surface, haze, detail);
coordinator.registerPreparedRoot(surface, "surface_to_guide");
coordinator.registerPreparedRoot(haze, "surface_to_guide");
coordinator.registerPreparedRoot(detail, "surface_to_guide");

// Previous render is healthy: exactly one requested-visible root may enter the draw.
coordinator.activationStaging.lastRenderMs = 40;
let staging = coordinator.prepareRenderActivationStaging(frameState);
assert.equal(staging.activatedThisCallback, true);
assert.equal(staging.lastActivatedRootName, "scar_flow_fold_surface_001");
assert.equal(staging.activatedRootCount, 1);
assert.equal(staging.pendingRequestedRootCount, 2);
assert.equal(surface.visible, true);
assert.equal(haze.visible, false);
assert.equal(detail.visible, false);
coordinator.restoreRenderActivationStaging();
assert.equal(haze.visible, true, "suppressed render visibility must restore immediately after the draw");
assert.equal(detail.visible, true, "render-only staging must not mutate gameplay/presentation state between callbacks");

// A slow first draw must prevent another new root from entering on the next callback.
coordinator.notifyRenderComplete({ renderMs: 80 });
frameState.frame = 11;
staging = coordinator.prepareRenderActivationStaging(frameState);
assert.equal(staging.activatedThisCallback, false);
assert.equal(staging.activatedRootCount, 1);
assert.equal(staging.deferredByBudgetCount, 1);
assert.equal(haze.visible, false);
assert.equal(detail.visible, false);
coordinator.restoreRenderActivationStaging();

// Once the previous render is healthy again, the next priority root may enter.
coordinator.notifyRenderComplete({ renderMs: 40 });
frameState.frame = 12;
staging = coordinator.prepareRenderActivationStaging(frameState);
assert.equal(staging.activatedThisCallback, true);
assert.equal(staging.lastActivatedRootName, "scar_pressure_haze_001");
assert.equal(staging.activatedRootCount, 2);
assert.equal(detail.visible, false);
coordinator.restoreRenderActivationStaging();

// Long-gap diagnostics must retain the exact transition root activated by the
// callback immediately preceding the gap.
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
    transitionActivationRootName: "scar_pressure_haze_001",
    transitionActivationLastRootName: "scar_pressure_haze_001",
    transitionActivationSequence: 2,
    transitionActivationPendingRequestedRoots: 1,
    transitionActivationDeferredByBudgetCount: 1,
    transitionActivationLastRenderMs: 900,
    transitionActivationPeakRenderMs: 900,
    transitionActivationPeakRootName: "scar_pressure_haze_001"
  }
});
now = 1100;
observer.beginFrame({ frame: 2, rawDt: 1.0, dt: 0.15, cellId: "CELL_SCAR_FLOW_FOLD_001", substepCount: 3 });
const gap = observer.snapshot().last40LongGaps.at(-1);
assert.equal(gap.previousTransitionActivation.rootName, "scar_pressure_haze_001");
assert.equal(gap.previousTransitionActivation.activatedThisCallback, true);
assert.equal(gap.previousTransitionActivation.renderMs, 900);

console.log("HC031W2A5.1 first-draw activation staging + long-gap root attribution PASS");
