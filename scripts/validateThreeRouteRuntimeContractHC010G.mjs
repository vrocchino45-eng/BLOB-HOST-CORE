import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { Act1RouteContractSystem } from "../src/routes/Act1RouteContractSystem.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { ChemistryDebugPanel } from "../src/debug/ChemistryDebugPanel.js";
import { RecipeDebugOverlay } from "../src/debug/RecipeDebugOverlay.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const combVisualSuccessor = ["HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const combPlayableSuccessor = ["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const combFoundationSuccessor = ["HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const hubConvergenceSuccessor = ["HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const siltReturnSuccessor = ["HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const siltPlayableSuccessor = ["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
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
    : combVisualSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC013C.json"
    : combPlayableSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC013B.json"
    : combFoundationSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC013A.json"
    : hubConvergenceSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : siltReturnSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : siltPlayableSuccessor
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : "public/data/runtime/act1RuntimeProfile_HC011A1.json"
);
const contract = readJson(siltPlayableSuccessor
  ? "public/data/routes/act1RouteContracts_HC012A.json"
  : "public/data/routes/act1RouteContracts_HC011A.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visualLanguages = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const gateSource = readText("src/systems/GateSystem.js");

assert(["HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : combVisualSuccessor ? "0.0.132" : combPlayableSuccessor ? "0.0.131" : combFoundationSuccessor ? "0.0.130" : hubConvergenceSuccessor ? "0.0.129" : siltReturnSuccessor ? "0.0.128" : siltPlayableSuccessor ? "0.0.127" : manifest.id === "HC-011B" ? "0.0.126" : "0.0.125");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : manifest.id === "HC-013D" ? "ACT1_RUNTIME_PROFILE_HC013D" : combVisualSuccessor ? "ACT1_RUNTIME_PROFILE_HC013C" : combPlayableSuccessor ? "ACT1_RUNTIME_PROFILE_HC013B" : combFoundationSuccessor ? "ACT1_RUNTIME_PROFILE_HC013A" : hubConvergenceSuccessor ? "ACT1_RUNTIME_PROFILE_HC012C" : siltReturnSuccessor ? "ACT1_RUNTIME_PROFILE_HC012B" : siltPlayableSuccessor ? "ACT1_RUNTIME_PROFILE_HC012A" : manifest.id === "HC-011B" ? "ACT1_RUNTIME_PROFILE_HC011B" : "ACT1_RUNTIME_PROFILE_HC011A1");
assert.equal(profile.pass, manifest.id);
assert.equal(contract.id, siltPlayableSuccessor ? "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC012A" : "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC011A");
assert.equal(contract.foundationReference, "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC010G");
assert.equal(profile.sourceAuthority, "HOST_CORE_Blueprint_v1_reference_docs.zip");
assert.deepEqual(profile.firstSlicePath, ["surface_wake", "guide_threshold", "hub_chamber"]);
assert.deepEqual(profile.threeRouteRuntimeContract.mountedContractRouteIds, [
  "vascular_route",
  "silt_burrow_route"
]);
assert.equal(profile.threeRouteRuntimeContract.emptyPlayerFacingCrossings, false);
assert.equal(profile.threeRouteRuntimeContract.foundationRegisteredSystemCount, 1);
assert.equal(profile.threeRouteRuntimeContract.newRegisteredSystemCountThisPass, 1);
assert.equal(profile.threeRouteRuntimeContract.archivedCompatibilitySystemsActivated, 0);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.deepEqual(profile.regions.vascular_route.systemIds, ["act1RouteContractSystem", "vascularRhythmRouteSystem"]);
assert.deepEqual(profile.regions.silt_burrow_route.systemIds, siltPlayableSuccessor
  ? ["act1RouteContractSystem", "siltPressureRouteSystem"]
  : ["act1RouteContractSystem"]);
assert.equal(profile.regions.vascular_route.activeUpdateBudget, 8);
assert.equal(profile.regions.silt_burrow_route.activeUpdateBudget, siltPlayableSuccessor ? 8 : 7);

const vascularGateRecipe = gates.find((gate) => gate.id === "hub_to_vascular_route");
const siltGateRecipe = gates.find((gate) => gate.id === "hub_to_silt_burrow_route");
for (const gate of [vascularGateRecipe, siltGateRecipe]) {
  assert.equal(gate.authoredStatus, "contract_bound_route");
  assert.equal(gate.runtimeTransitionAdapter, "GateSystem");
  assert.equal(gate.wakeCondition, "graveReturned");
  assert.deepEqual(gate.requirements, ["grave_memory_read_and_stabilize"]);
  assert(!gate.requirements.some((id) => id.includes("not_yet_authored")));
}
assert.equal(vascularGateRecipe.playableReady, true);
assert.equal(siltGateRecipe.playableReady, siltPlayableSuccessor);
assert(!gateSource.includes('gate.id === "hub_to_vascular_route" || gate.id === "hub_to_silt_burrow_route"'), "hardcoded false branch survived");
assert(!gateSource.includes("return false;\n    }\n    if (gate.id === \"grave_memory_to_hub_chamber\")"), "old route hard-disable shape survived");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visualLanguages);

const baseObjectives = {
  surface_absorb_first_nutrient: { complete: true },
  guide_stabilize_and_cross: { complete: true },
  hub_read_route_gates: { complete: true },
  grave_memory_read_and_stabilize: { complete: true },
  vascular_route_playable_circuit: { complete: false },
  silt_route_playable_circuit: { complete: false }
};
const baseRoutes = [
  { id: "grave_memory_route", gateId: "hub_to_grave_memory_route", distanceToPlayer: 4.2 },
  { id: "vascular_route", gateId: "hub_to_vascular_route", distanceToPlayer: 0.52 },
  { id: "silt_burrow_route", gateId: "hub_to_silt_burrow_route", distanceToPlayer: 3.8 }
];
const frame = {
  buildId: manifest.id,
  buildManifest: manifest,
  frame: 10,
  runtimeSeconds: 1,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: { id: "hub_mode", regionId: "hub_chamber" },
  hubChamberFoundation: { completed: true, routes: baseRoutes },
  firstSliceObjectives: baseObjectives,
  act1RouteHistory: { graveReturned: false },
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    interactPressed: false,
    interactEventId: 0
  }
};

const gateSystem = new GateSystem({
  gateRegistry,
  frameState: frame,
  regionRegistry,
  runtimeProfile: profile,
  routeContract: contract
});
gateSystem.update(0, frame);
assert.equal(frame.firstSliceGates.hub_to_vascular_route.destinationMounted, true);
assert.equal(frame.firstSliceGates.hub_to_silt_burrow_route.destinationMounted, true);
assert.equal(frame.firstSliceGates.hub_to_vascular_route.awake, false);
assert.equal(frame.firstSliceGates.hub_to_silt_burrow_route.awake, false);
assert.equal(frame.firstSliceGates.hub_to_vascular_route.status, "locked");
assert.equal(frame.firstSliceGates.hub_to_silt_burrow_route.status, "locked");

frame.act1RouteHistory.graveReturned = true;
gateSystem.update(0, frame);
const vascularState = frame.firstSliceGates.hub_to_vascular_route;
assert.equal(vascularState.destinationMounted, true);
assert.equal(vascularState.awake, true);
assert.equal(vascularState.gameplayPending, false);
assert.equal(vascularState.playableReady, true);
assert.equal(vascularState.crossable, true);
assert.equal(vascularState.status, "crossable");
const siltState = frame.firstSliceGates.hub_to_silt_burrow_route;
assert.equal(siltState.destinationMounted, true);
assert.equal(siltState.awake, true);
assert.equal(siltState.gameplayPending, !siltPlayableSuccessor);
assert.equal(siltState.playableReady, siltPlayableSuccessor);
assert.equal(siltState.crossable, siltPlayableSuccessor);
assert.equal(siltState.status, siltPlayableSuccessor ? "crossable" : "awake_gameplay_pending");
assert.equal(siltState.departureBlockedBy, siltPlayableSuccessor ? "none" : "dedicated_playable_route_pass_pending");
assert.equal(frame.act1RouteRuntimeContract.awakeRouteCount, 2);
assert.equal(frame.act1RouteRuntimeContract.crossableRouteCount, siltPlayableSuccessor ? 2 : 1);
assert.equal(frame.act1RouteRuntimeContract.gameplayPendingCount, siltPlayableSuccessor ? 0 : 1);
assert.equal(frame.act1RouteRuntimeContract.emptyPlayerFacingCrossings, false);
assert.equal(frame.gateState.id, "hub_to_vascular_route", "nearest Hub route did not own gate focus");
const chemistryF1 = new ChemistryDebugPanel({ frameState: frame }).fullText();
const recipeF1 = new RecipeDebugOverlay({ frameState: frame }).fullText();
for (const diagnostics of [chemistryF1, recipeF1]) {
  assert(diagnostics.includes(`Route contracts: mounted 2/2 awake:2/2 pending:${siltPlayableSuccessor ? 0 : 1} crossable:${siltPlayableSuccessor ? 2 : 1}`));
}

// An authored gate must not wake when its destination is absent from the
// region registry, even if every progression flag claims it should.
const missingVascularRegistry = new RegionRegistry(regions.filter((region) => region.id !== "vascular_route"));
const missingFrame = {
  ...frame,
  input: { ...frame.input },
  firstSliceObjectives: { ...baseObjectives },
  act1RouteHistory: { graveReturned: true }
};
const missingDestinationGateSystem = new GateSystem({
  gateRegistry,
  frameState: missingFrame,
  regionRegistry: missingVascularRegistry,
  runtimeProfile: profile,
  routeContract: contract
});
missingDestinationGateSystem.update(0, missingFrame);
assert.equal(missingFrame.firstSliceGates.hub_to_vascular_route.destinationMounted, false);
assert.equal(missingFrame.firstSliceGates.hub_to_vascular_route.awake, false);
assert.equal(missingFrame.firstSliceGates.hub_to_vascular_route.crossable, false);
assert.equal(missingFrame.firstSliceGates.hub_to_vascular_route.departureBlockedBy, "destination_mount_missing");

// Before HC-012A, the retained foundation must support a future Silt owner
// without opening an empty route. HC-012A's real route is proved separately.
if (!siltPlayableSuccessor) {
const playableGates = gates.map((gate) => gate.id === "hub_to_silt_burrow_route"
  ? { ...gate, playableReady: true }
  : gate
);
const playableGateRegistry = new GateRegistry(playableGates);
const playerRoot = new THREE.Group();
playerRoot.position.set(1.15, -0.35, -2.6);
const entryPosition = playerRoot.position.clone();
const contractSystem = new Act1RouteContractSystem({
  contract,
  playerRoot,
  frameState: frame
});
contractSystem.init();

const modeController = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: frame,
  runtimeProfile: profile
});
const playableGateSystem = new GateSystem({
  gateRegistry: playableGateRegistry,
  frameState: frame,
  regionRegistry,
  runtimeProfile: profile,
  routeContract: contract
});

function enterAndReturn({ routeId, entryGateId, routeCellId, returnGateId, pulseEventId, interactEventId }) {
  frame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
  frame.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
  frame.hubChamberFoundation = {
    completed: true,
    routes: baseRoutes.map((route) => ({
      ...route,
      distanceToPlayer: route.id === routeId ? 0.4 : 4.5
    }))
  };
  frame.input = {
    pulsePressed: true,
    pulseEventId,
    interactPressed: false,
    interactEventId: 0
  };
  playableGateSystem.update(0, frame);
  assert.equal(frame.gateState.id, entryGateId);
  assert.equal(frame.gateState.status, "crossed_this_frame");
  assert.equal(frame.activeCellId, routeCellId);
  assert(playerRoot.position.equals(entryPosition), `${routeId} entry relocated the player`);

  modeController.update(0, frame);
  assert.equal(frame.currentMode.regionId, routeId);
  assert.deepEqual(frame.firstSliceRuntimeMount.regionSystemIds, ["act1RouteContractSystem"]);
  contractSystem.onRuntimeMount(frame);
  contractSystem.update(0, frame);
  assert.equal(frame.act1RouteContract.active, true);
  assert.equal(frame.act1RouteContract.regionId, routeId);
  assert.equal(frame.act1RouteContract.returnFoldReady, true);
  assert.equal(frame.act1RouteContract.gameplayReady, false, "contract test accidentally authored route gameplay");
  assert(playerRoot.position.equals(entryPosition), `${routeId} mount relocated the player`);

  frame.input = {
    pulsePressed: false,
    pulseEventId,
    interactPressed: true,
    interactEventId
  };
  playableGateSystem.update(0, frame);
  assert.equal(frame.firstSliceGates.guide_to_hub_chamber.crossed, true, `${routeId} lost retained Guide-to-Hub history`);
  assert.equal(frame.gateState.id, returnGateId);
  assert.equal(frame.gateState.status, "crossed_this_frame");
  assert.equal(frame.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
  assert(playerRoot.position.equals(entryPosition), `${routeId} return relocated the player`);
  contractSystem.onRuntimeUnmount(frame);
}

enterAndReturn({
  routeId: "silt_burrow_route",
  entryGateId: "hub_to_silt_burrow_route",
  routeCellId: "CELL_SILT_PRESSURE_ROUTE_001",
  returnGateId: "silt_burrow_route_to_hub_chamber",
  pulseEventId: 32,
  interactEventId: 42
});
assert.equal(frame.act1RouteHistory.routeStates.silt_burrow_route.entryCount, 1);
assert.equal(frame.act1RouteHistory.routeStates.silt_burrow_route.returnCount, 1);

const snapshot = playableGateSystem.createHistorySnapshot(frame);
const restoredFrame = { buildId: manifest.id };
playableGateSystem.restoreHistory(JSON.parse(JSON.stringify(snapshot)), restoredFrame);
assert.deepEqual(playableGateSystem.createHistorySnapshot(restoredFrame), snapshot);
}

// Runtime ownership proof: the shared contract owner executes under exactly
// one route mount at a time and never joins Hub, Grave, or the other route as a
// second updater.
const ownershipFrame = {
  frame: 0,
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001"
};
const ownershipMode = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: ownershipFrame,
  runtimeProfile: profile
});
const executionCounts = new Map();
const probe = (id) => ({
  update() {
    executionCounts.set(id, (executionCounts.get(id) ?? 0) + 1);
  }
});
const registry = new SystemRegistry();
registry.register("modeController", ownershipMode);
for (const id of new Set([
  ...profile.sharedSystemIds,
  ...Object.values(profile.regions).flatMap((mount) => mount.systemIds)
])) {
  registry.register(id, probe(id), {
    runtimeScope: "active_region",
    lazyInit: true,
    settleOnDeactivate: true
  });
}
registry.update(1 / 60, ownershipFrame);
assert.equal(ownershipFrame.firstSliceRuntimeMount.activeRegionId, "vascular_route");
assert.equal(ownershipFrame.runtimeExecution.activeRegionSystemCount, 8);
assert(ownershipFrame.runtimeExecution.executedSystemIds.includes("act1RouteContractSystem"));
assert(ownershipFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));
assert(!ownershipFrame.runtimeExecution.executedSystemIds.includes("graveMemoryRouteSystem"));
ownershipFrame.activeCellId = "CELL_SILT_PRESSURE_ROUTE_001";
registry.update(1 / 60, ownershipFrame);
assert.equal(ownershipFrame.firstSliceRuntimeMount.activeRegionId, "silt_burrow_route");
assert.equal(ownershipFrame.runtimeExecution.activeRegionSystemCount, siltPlayableSuccessor ? 8 : 7);
assert.equal(ownershipFrame.runtimeExecution.executedSystemIds.filter((id) => id === "act1RouteContractSystem").length, 1);
assert.equal(ownershipFrame.runtimeExecution.executedSystemIds.includes("siltPressureRouteSystem"), siltPlayableSuccessor);
assert(!ownershipFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));
ownershipFrame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
registry.update(1 / 60, ownershipFrame);
assert.equal(ownershipFrame.firstSliceRuntimeMount.activeRegionId, "hub_chamber");
assert(!ownershipFrame.runtimeExecution.executedSystemIds.includes("act1RouteContractSystem"));
assert(!ownershipFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));

console.log("HC-010G three-route foundation validation passed under the accepted successor lineage.");
console.log(`Mounted destinations: 2 | woke after Grave: 2 | crossable: ${siltPlayableSuccessor ? 2 : 1} | pending: ${siltPlayableSuccessor ? 0 : 1}`);
console.log(siltPlayableSuccessor
  ? "Retained foundation proof: both dedicated route owners remain independently mounted."
  : "Retained generic contract proof: future Hub → Silt → Hub, position preserved.");
