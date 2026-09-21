import assert from "node:assert/strict";
import fs from "node:fs";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));

const manifest = json("public/data/build/buildManifest.json");
const profile = json(manifest.id === "HC-014I" ? "public/data/runtime/act1RuntimeProfile_HC014I.json" : manifest.id === "HC-014G" ? "public/data/runtime/act1RuntimeProfile_HC014G.json" : manifest.id === "HC-014F" ? "public/data/runtime/act1RuntimeProfile_HC014F.json" : manifest.id === "HC-014E" ? "public/data/runtime/act1RuntimeProfile_HC014E.json" : manifest.id === "HC-014D" ? "public/data/runtime/act1RuntimeProfile_HC014D.json" : manifest.id === "HC-014C" ? "public/data/runtime/act1RuntimeProfile_HC014C.json" : manifest.id === "HC-014B" ? "public/data/runtime/act1RuntimeProfile_HC014B.json" : manifest.id === "HC-014A" ? "public/data/runtime/act1RuntimeProfile_HC014A.json" : "public/data/runtime/act1RuntimeProfile_HC013D.json");
const pkg = json("package.json");
const recipeSource = read("src/data/RecipeDataSystem.js");
const runtimeSource = read("src/core/GameRuntime.js");

assert.ok(["HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : "0.0.133");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : "ACT1_RUNTIME_PROFILE_HC013D");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : manifest.id === "HC-014G" ? "HC-014G" : manifest.id === "HC-014F" ? "HC-014F" : manifest.id === "HC-014E" ? "HC-014E" : manifest.id === "HC-014D" ? "HC-014D" : manifest.id === "HC-014C" ? "HC-014C" : manifest.id === "HC-014B" ? "HC-014B" : manifest.id === "HC-014A" ? "HC-014A" : "HC-013D");
assert.equal(profile.performancePolicy.planningDataAtLiveBoot, "archive_only_not_fetched");
assert.equal(profile.performancePolicy.debugPanels, "deferred_dynamic_import_after_first_render");
assert.equal(profile.performancePolicy.transitionPrewarm, "only_next_reachable_boundary_jobs_are_idle_prepared");

for (const path of [
  "/data/planning/blueprintTranslationLayer_HC003F.json",
  "/data/planning/firstRouteChoicePlanning_HC003G.json",
  "/data/planning/graveRouteRuntimePlanning_HC004A.json",
  "/data/planning/graveRouteRecipePack_HC004B.json",
  "/data/planning/graveRouteMorphPrototype_HC004D.json",
  "/data/planning/graveArrivalReadability_HC004E.json",
  "/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json",
  "/data/planning/graveExitReadinessPrototype_HC004H.json",
  "/data/planning/graveRouteContinuityPlanning_HC004I.json",
  "/data/planning/graveScarMemorySeamRecipePack_HC004J.json",
  "/data/planning/graveScarMemorySeamVisualComposerSupport_HC004K.json",
  "/data/planning/graveScarMemorySeamArrivalPlanning_HC004L.json",
  "/data/planning/graveScarMemorySeamRuntimeArrival_HC004M.json"
]) {
  assert.match(recipeSource, new RegExp(`validationProfile === \\"legacy_archive\\" \\? this\\.loadJson\\(\\"${path.replaceAll("/", "\\/")}\\"\\) : Promise\\.resolve\\(null\\)`));
}

assert.ok(!runtimeSource.includes('import { RecipeDebugOverlay } from "../debug/RecipeDebugOverlay.js"'));
assert.ok(!runtimeSource.includes('import { ChemistryDebugPanel } from "../debug/ChemistryDebugPanel.js"'));
assert.ok(runtimeSource.includes('import("../debug/RecipeDebugOverlay.js")'));
assert.ok(runtimeSource.includes('import("../debug/ChemistryDebugPanel.js")'));
assert.ok(runtimeSource.includes("scheduleDeferredDebugPanels()"));

const frameState = {
  frame: 2,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  firstSliceRuntimeMount: { mountSequence: 0 },
  act1RouteHistory: {}
};
const registry = {
  prepared: new Map(),
  prepareSystem() { return { status: "prepared" }; }
};
const coordinator = new FirstSliceTransitionCoordinator({
  registry,
  scene: { children: [] },
  camera: null,
  renderer: null,
  localCellMorphSystem: { prepareTransitionResources() { return []; } },
  secondLocalCellMorphSystem: { prepareTransitionResources() { return []; } },
  frameState,
  autoSchedule: false
});

assert.deepEqual([...coordinator.eligibleBoundaries(frameState)], ["surface_to_guide"]);
frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
assert.deepEqual([...coordinator.eligibleBoundaries(frameState)], ["guide_to_hub"]);
frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
assert.deepEqual([...coordinator.eligibleBoundaries(frameState)].sort(), ["hub_to_grave", "hub_to_silt", "hub_to_vascular"].sort());
frameState.act1RouteHistory.hubThreeRouteConvergenceCompleted = true;
assert.deepEqual([...coordinator.eligibleBoundaries(frameState)].sort(), ["hub_to_comb", "hub_to_grave", "hub_to_silt", "hub_to_vascular"].sort());
if (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  frameState.activeCellId = "CELL_COMB_THRESHOLD_FILTER_001";
  frameState.act1RouteHistory.combThresholdPlayableCompleted = true;
  assert.deepEqual([...coordinator.eligibleBoundaries(frameState)], ["comb_to_aperture"]);
}

console.log("HC-013D transition/performance consolidation validation passed.");
