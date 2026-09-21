import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFirstSliceRuntimeRebaselineHC009A] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson(
  manifest.id === "HC-014D"

    ? "public/data/runtime/act1RuntimeProfile_HC014D.json"

    : manifest.id === "HC-014C"

    ? "public/data/runtime/act1RuntimeProfile_HC014C.json"
    : manifest.id === "HC-014B"
    ? "public/data/runtime/act1RuntimeProfile_HC014B.json"
    : manifest.id === "HC-014A"
    ? "public/data/runtime/act1RuntimeProfile_HC014A.json"
    : manifest.id === "HC-013D"
    ? "public/data/runtime/act1RuntimeProfile_HC013D.json"
    : manifest.id === "HC-013C"
      ? "public/data/runtime/act1RuntimeProfile_HC013C.json"
      : ["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)
    ? "public/data/runtime/act1RuntimeProfile_HC013B.json"
    : manifest.id === "HC-013A"
    ? "public/data/runtime/act1RuntimeProfile_HC013A.json"
    : manifest.id === "HC-012C"
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : manifest.id === "HC-012B"
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : manifest.id === "HC-012A"
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : manifest.id === "HC-011A1"
    ? "public/data/runtime/act1RuntimeProfile_HC011A1.json"
    : manifest.id === "HC-011A"
    ? "public/data/runtime/act1RuntimeProfile_HC011A.json"
    : manifest.id === "HC-010G"
    ? "public/data/runtime/act1RuntimeProfile_HC010G.json"
    : manifest.id === "HC-010F"
    ? "public/data/runtime/act1RuntimeProfile_HC010F.json"
    : manifest.id === "HC-010E"
    ? "public/data/runtime/act1RuntimeProfile_HC010E.json"
    : manifest.id === "HC-010D"
    ? "public/data/runtime/act1RuntimeProfile_HC010D.json"
    : manifest.id === "HC-010C"
    ? "public/data/runtime/act1RuntimeProfile_HC010C.json"
    : manifest.id === "HC-010B"
    ? "public/data/runtime/act1RuntimeProfile_HC010B.json"
    : manifest.id === "HC-010A"
    ? "public/data/runtime/act1RuntimeProfile_HC010A.json"
    : manifest.id === "HC-009G"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009G.json"
    : manifest.id === "HC-009F"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009F.json"
    : manifest.id === "HC-009E"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009E.json"
    : manifest.id === "HC-009D"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009D.json"
    : ["HC-009B", "HC-009C"].includes(manifest.id)
      ? "public/data/runtime/firstSliceRuntimeProfile_HC009B.json"
      : "public/data/runtime/firstSliceRuntimeProfile_HC009A.json"
);
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visuals = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const dataSource = readText("src/data/RecipeDataSystem.js");

assert(
  (manifest.id === "HC-009A" && manifest.version === "0.0.110")
  || (manifest.id === "HC-009B" && manifest.version === "0.0.111")
  || (manifest.id === "HC-009C" && manifest.version === "0.0.112")
  || (manifest.id === "HC-009D" && manifest.version === "0.0.113")
  || (manifest.id === "HC-009E" && manifest.version === "0.0.114")
  || (manifest.id === "HC-009F" && manifest.version === "0.0.115")
  || (manifest.id === "HC-009G" && manifest.version === "0.0.116")
  || (manifest.id === "HC-010A" && manifest.version === "0.0.117")
  || (manifest.id === "HC-010B" && manifest.version === "0.0.118")
  || (manifest.id === "HC-010C" && manifest.version === "0.0.119")
  || (manifest.id === "HC-010D" && manifest.version === "0.0.120")
  || (manifest.id === "HC-010E" && manifest.version === "0.0.121")
  || (manifest.id === "HC-010F" && manifest.version === "0.0.122")
  || (manifest.id === "HC-010G" && manifest.version === "0.0.123")
  || (manifest.id === "HC-011A" && manifest.version === "0.0.124")
  || (manifest.id === "HC-011A1" && manifest.version === "0.0.125")
  || (manifest.id === "HC-011B" && manifest.version === "0.0.126")
  || (manifest.id === "HC-012A" && manifest.version === "0.0.127")
  || (manifest.id === "HC-012B" && manifest.version === "0.0.128")
  || (manifest.id === "HC-012C" && manifest.version === "0.0.129")
  || (manifest.id === "HC-013A" && manifest.version === "0.0.130")
  || (["HC-013B"].includes(manifest.id) && manifest.version === "0.0.131")
  || (manifest.id === "HC-013C" && manifest.version === "0.0.132")
  || (manifest.id === "HC-013D" && manifest.version === "0.0.133")
  || (manifest.id === "HC-014A" && manifest.version === "0.0.134")
  || (manifest.id === "HC-014B" && manifest.version === "0.0.135")
  || (manifest.id === "HC-014C" && manifest.version === "0.0.136")
  || (manifest.id === "HC-014D" && manifest.version === "0.0.137")
  || (manifest.id === "HC-014E" && manifest.version === "0.0.138")
  || (manifest.id === "HC-014F" && manifest.version === "0.0.139")
  || (manifest.id === "HC-014G" && manifest.version === "0.0.140")
  || (manifest.id === "HC-014I" && manifest.version === "0.0.142"),
  "manifest identity mismatch"
);
assert(pkg.version === manifest.version, "package identity mismatch");
assert(
  [
    "FIRST_SLICE_RUNTIME_PROFILE_HC009A",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009B",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009D",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009E",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009F",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009G",
    "ACT1_RUNTIME_PROFILE_HC010A",
    "ACT1_RUNTIME_PROFILE_HC010B",
    "ACT1_RUNTIME_PROFILE_HC010C",
    "ACT1_RUNTIME_PROFILE_HC010D",
    "ACT1_RUNTIME_PROFILE_HC010E",
    "ACT1_RUNTIME_PROFILE_HC010F",
    "ACT1_RUNTIME_PROFILE_HC010G",
    "ACT1_RUNTIME_PROFILE_HC011A",
    "ACT1_RUNTIME_PROFILE_HC011A1",
    "ACT1_RUNTIME_PROFILE_HC011B",
    "ACT1_RUNTIME_PROFILE_HC012A",
    "ACT1_RUNTIME_PROFILE_HC012B",
    "ACT1_RUNTIME_PROFILE_HC012C",
    "ACT1_RUNTIME_PROFILE_HC013A",
    "ACT1_RUNTIME_PROFILE_HC013B",
    "ACT1_RUNTIME_PROFILE_HC013C",
    "ACT1_RUNTIME_PROFILE_HC013D",
    "ACT1_RUNTIME_PROFILE_HC014A",
    "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"
  ].includes(profile.id),
  "runtime profile identity mismatch"
);
assert(profile.sourceAuthority === "HOST_CORE_Blueprint_v1_reference_docs.zip", "runtime profile lost blueprint authority");
assert(
  profile.firstSlicePath.join("|") === "surface_wake|guide_threshold|hub_chamber",
  "runtime profile changed the locked first-slice path"
);
assert(
  profile.bootPolicy === (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)
    ? "locked_act1_plus_boundary_eligible_aperture_arrival_foundation"
    : manifest.id === "HC-013D"
    ? "first_slice_plus_three_playable_hub_routes_plus_comb_with_boundary_eligible_prewarm_and_deferred_debug"
    : ["HC-013B", "HC-013C"].includes(manifest.id)
    ? "first_slice_plus_three_playable_hub_routes_plus_comb_threshold_playable_proof"
    : manifest.id === "HC-013A"
    ? "first_slice_plus_three_playable_hub_routes_plus_comb_threshold_foundation"
    : ["HC-012A", "HC-012B", "HC-012C"].includes(manifest.id)
    ? "first_slice_plus_three_playable_hub_routes"
    : ["HC-011A", "HC-011A1", "HC-011B"].includes(manifest.id)
      ? "first_slice_plus_grave_playable_plus_vascular_playable_plus_silt_mounted_contract"
    : manifest.id === "HC-010G"
      ? "first_slice_plus_grave_playable_plus_two_mounted_route_contracts"
    : ["HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F"].includes(manifest.id)
      ? "first_slice_plus_one_authored_route"
      : "first_slice_only"),
  "runtime profile boot policy exceeds the authored milestone"
);

const hubRegion = regions.find((region) => region.id === "hub_chamber");
assert(hubRegion?.runtimeProxy === "none", "Hub must no longer publish Signal Chorus as a parallel region proxy");
assert(hubRegion?.fullRegionPending === false, "Hub must be an active first-slice mount");
assert(
  hubRegion?.legacyRuntimeCellAdapter === "CELL_SIGNAL_CHORUS_NERVE_001",
  "Hub must retain the proven runtime-cell adapter explicitly"
);

const shared = new Set(profile.sharedSystemIds);
const dormant = new Set(profile.dormantCompatibilitySystemIds);
assert(shared.size === profile.sharedSystemIds.length, "shared system list contains duplicates");
assert(dormant.size === profile.dormantCompatibilitySystemIds.length, "dormant system list contains duplicates");
assert(dormant.size === 20, "HC-009A/HC-009B must archive exactly the audited 20 compatibility systems");

for (const [regionId, mount] of Object.entries(profile.regions)) {
  const activeIds = new Set([...profile.sharedSystemIds, ...mount.systemIds]);
  assert(activeIds.size === mount.activeUpdateBudget, `${regionId} active update budget is not authoritative`);
  assert(mount.gameplayOwner && mount.presentationOwner && mount.cameraOwner, `${regionId} lacks one owner per domain`);
  for (const id of activeIds) {
    assert(!dormant.has(id), `${regionId} activates archived compatibility system ${id}`);
  }
}

for (const id of profile.dormantCompatibilitySystemIds) {
  assert(
    !runtimeSource.includes(`this.registry.register("${id}"`),
    `GameRuntime still registers archived compatibility system ${id}`
  );
}
assert(runtimeSource.includes('runtimeScope: "active_region"'), "GameRuntime does not declare region-scoped updates");
assert(runtimeSource.includes("lazyInit: true"), "region systems are not lazy initialized");
assert(runtimeSource.includes("runtimeProfile: this.recipeDataSystem.data.firstSliceRuntimeProfile"), "ModeController does not receive authored runtime profile");
assert(dataSource.includes('validationProfile = "first_slice_runtime"'), "RecipeDataSystem default validation profile is not slice-scoped");
assert(dataSource.includes('this.validationProfile === "legacy_archive"'), "legacy validation is not isolated behind an explicit archive profile");

for (const relativePath of [
  "src/morph/ThirdLocalCellMorphSystem.js",
  "src/morph/BloomResidueInteractionSystem.js",
  "src/morph/GraveRouteMorphSystem.js",
  "src/morph/GraveReturnContinuitySystem.js",
  "public/data/morph/graveRouteMorphPlans.json",
  "public/data/morph/bloomResidueInteractionRecipes.json"
]) {
  assert(existsSync(join(root, relativePath)), `compatibility archive lost ${relativePath}`);
}

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const objectiveRegistry = new ObjectiveRegistry(objectives);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visuals);
const frame = {
  frame: 1,
  activeCellId: "CELL_MEMBRANE_NURSERY_001"
};
const modeController = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: frame,
  runtimeProfile: profile
});

const counters = new Map();
const probeFor = (id) => {
  const counter = { init: 0, update: 0, mount: 0, unmount: 0 };
  counters.set(id, counter);
  return {
    init() {
      counter.init += 1;
    },
    onRuntimeMount() {
      counter.mount += 1;
    },
    update() {
      counter.update += 1;
    },
    onRuntimeUnmount() {
      counter.unmount += 1;
    }
  };
};

const registry = new SystemRegistry();
registry.register("modeController", modeController);
registry.register("globalProbe", probeFor("globalProbe"));

const scopedIds = new Set(profile.sharedSystemIds);
for (const mount of Object.values(profile.regions)) {
  for (const id of mount.systemIds) scopedIds.add(id);
}
for (const id of scopedIds) {
  registry.register(id, probeFor(id), {
    runtimeScope: "active_region",
    lazyInit: true,
    settleOnDeactivate: true
  });
}

const update = () => {
  frame.frame += 1;
  registry.update(1 / 60, frame);
};
const assertMount = (regionId) => {
  const mount = profile.regions[regionId];
  const expected = new Set([...profile.sharedSystemIds, ...mount.systemIds]);
  assert(frame.firstSliceRuntimeMount.activeRegionId === regionId, `${regionId} did not become active mount`);
  assert(frame.firstSliceRuntimeMount.activeSystemCount === expected.size, `${regionId} active system count mismatch`);
  assert(frame.runtimeExecution.activeRegionSystemCount === mount.activeUpdateBudget, `${regionId} executed outside its budget`);
  assert(frame.runtimeExecution.dormantCompatibilityRegisteredCount === 0, `${regionId} registered compatibility systems`);
  for (const id of expected) {
    assert(counters.get(id)?.update > 0, `${regionId} failed to update mounted system ${id}`);
  }
  for (const id of scopedIds) {
    if (expected.has(id)) continue;
    assert(!frame.runtimeExecution.executedSystemIds.includes(id), `${regionId} updated inactive system ${id}`);
  }
};

update();
assertMount("surface_wake");
assert(frame.firstSliceRuntimeMount.gameplayOwner === "LandingMode", "Surface gameplay owner changed");
assert(
  frame.firstSliceRuntimeMount.presentationOwner === "SurfaceWakeEcologicalCausalitySystem",
  "Surface presentation owner changed"
);

const surfaceOnly = profile.regions.surface_wake.systemIds.filter((id) =>
  !shared.has(id) && !profile.regions.guide_threshold.systemIds.includes(id)
);
frame.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
update();
assertMount("guide_threshold");
for (const id of surfaceOnly) {
  assert(counters.get(id).unmount === 1, `Surface system ${id} did not unmount exactly once`);
}
assert(frame.firstSliceRuntimeMount.gameplayOwner === "ThresholdMode", "Guide gameplay owner changed");

const guideOnly = profile.regions.guide_threshold.systemIds.filter((id) =>
  !shared.has(id) && !profile.regions.hub_chamber.systemIds.includes(id)
);
frame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
update();
assertMount("hub_chamber");
for (const id of guideOnly) {
  assert(counters.get(id).unmount === 1, `Guide system ${id} did not unmount exactly once`);
}
assert(frame.firstSliceRuntimeMount.gameplayOwner === "HubMode", "Hub gameplay owner changed");
assert(frame.firstSliceRuntimeMount.presentationOwner === "HubChamberFoundationSystem", "Hub presentation owner changed");
assert(counters.get("globalProbe").update === 3, "global services must persist across all three mounts");

const objective = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState: frame });
const gate = new GateSystem({ gateRegistry, frameState: frame });
frame.hubChamberFoundation = {
  active: true,
  completed: true,
  centralAnchorReadable: true,
  threeRouteLayoutReadable: true,
  activeRouteIdentityDistinguished: true,
  firstMemoryFragmentReadable: true,
  activeRouteId: "grave_memory_route",
  routeCount: 3,
  dormantRouteCount: 2
};
frame.hubInvestigationGameplay = { active: true, investigationReady: true };
frame.statusPage = { firstHubUseComplete: false };
objective.update(1 / 60, frame);
gate.update(1 / 60, frame);
assert(frame.objectiveState.status === "hub_foundation_complete_status_page_pending", "Hub Status prerequisite changed");
assert(frame.gateState.id === "hub_to_grave_memory_route" && frame.gateState.readable, "Grave route identity is not readable");

frame.statusPage.firstHubUseComplete = true;
objective.update(1 / 60, frame);
gate.update(1 / 60, frame);
assert(frame.objectiveState.complete, "Hub objective did not complete without the retired Signal Chorus layer");
assert(frame.firstSliceGates.hub_to_grave_memory_route.crossable, "GateSystem did not consume Hub completion");
assert(!frame.firstSliceGates.hub_to_vascular_route.crossable, "Vascular route left dormancy");
assert(!frame.firstSliceGates.hub_to_silt_burrow_route.crossable, "Silt route left dormancy");

console.log("HC-009A First-Slice Runtime Rebaseline lineage validation passed.");
