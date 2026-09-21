import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { CoreEmbodimentSystem } from "../src/player/CoreEmbodimentSystem.js";
import { CoreGrowthSystem } from "../src/player/CoreGrowthSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { GuidePromptSystem } from "../src/guide/GuidePromptSystem.js";
import { RecipeDebugOverlay } from "../src/debug/RecipeDebugOverlay.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const successorCombVisual = ["HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const successorCombPlayable = ["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const successorCombFoundation = ["HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const successorHubConvergence = ["HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const successorSiltReturn = ["HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const successorSiltPlayable = ["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id);
const profile = readJson(manifest.id === "HC-014I" ? "public/data/runtime/act1RuntimeProfile_HC014I.json" : manifest.id === "HC-014G" ? "public/data/runtime/act1RuntimeProfile_HC014G.json" : manifest.id === "HC-014F" ? "public/data/runtime/act1RuntimeProfile_HC014F.json" : manifest.id === "HC-014E" ? "public/data/runtime/act1RuntimeProfile_HC014E.json" : manifest.id === "HC-014D" ? "public/data/runtime/act1RuntimeProfile_HC014D.json" : manifest.id === "HC-014C" ? "public/data/runtime/act1RuntimeProfile_HC014C.json" : manifest.id === "HC-014B" ? "public/data/runtime/act1RuntimeProfile_HC014B.json" : manifest.id === "HC-014A" ? "public/data/runtime/act1RuntimeProfile_HC014A.json" : manifest.id === "HC-013D" ? "public/data/runtime/act1RuntimeProfile_HC013D.json" : manifest.id === "HC-013C" ? "public/data/runtime/act1RuntimeProfile_HC013C.json" : manifest.id === "HC-013B" ? "public/data/runtime/act1RuntimeProfile_HC013B.json" : manifest.id === "HC-013A" ? "public/data/runtime/act1RuntimeProfile_HC013A.json" : manifest.id === "HC-012C" ? "public/data/runtime/act1RuntimeProfile_HC012C.json" : manifest.id === "HC-012B" ? "public/data/runtime/act1RuntimeProfile_HC012B.json" : manifest.id === "HC-012A" ? "public/data/runtime/act1RuntimeProfile_HC012A.json" : manifest.id === "HC-011B" ? "public/data/runtime/act1RuntimeProfile_HC011B.json" : "public/data/runtime/act1RuntimeProfile_HC011A1.json");
const consequence = readJson("public/data/routes/vascularRhythmReturnConsequence_HC011B.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const contract = readJson(successorSiltPlayable
  ? "public/data/routes/act1RouteContracts_HC012A.json"
  : "public/data/routes/act1RouteContracts_HC011A.json");

assert(["HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : successorCombVisual ? "0.0.132" : successorCombPlayable ? "0.0.131" : successorCombFoundation ? "0.0.130" : successorHubConvergence ? "0.0.129" : successorSiltReturn ? "0.0.128" : successorSiltPlayable ? "0.0.127" : "0.0.126");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : manifest.id === "HC-013D" ? "ACT1_RUNTIME_PROFILE_HC013D" : successorCombVisual ? "ACT1_RUNTIME_PROFILE_HC013C" : successorCombPlayable ? "ACT1_RUNTIME_PROFILE_HC013B" : successorCombFoundation ? "ACT1_RUNTIME_PROFILE_HC013A" : successorHubConvergence ? "ACT1_RUNTIME_PROFILE_HC012C" : successorSiltReturn ? "ACT1_RUNTIME_PROFILE_HC012B" : successorSiltPlayable ? "ACT1_RUNTIME_PROFILE_HC012A" : "ACT1_RUNTIME_PROFILE_HC011B");
assert.equal(profile.pass, manifest.id);
assert.equal(consequence.id, "VASCULAR_RHYTHM_RETURN_CONSEQUENCE_HC011B");
assert.equal(consequence.pass, "HC-011B");
assert.equal(consequence.sourceAuthority, "HOST_CORE_Blueprint_v1_reference_docs.zip");
assert.equal(consequence.coreFilament.filamentCount, 3);
assert.equal(consequence.coreFilament.cadenceNodeCount, 3);
assert.equal(consequence.coreFilament.chargeCount, 1);
assert.equal(consequence.hubEcho.filamentCount, 3);
assert.equal(consequence.hubEcho.valveCount, 3);
assert.equal(consequence.hubEcho.chargeCount, 1);
assert.equal(consequence.constraints.newAbilities, 0);
assert.equal(consequence.constraints.newRegisteredSystems, 0);
assert.equal(consequence.constraints.routeMechanicMutation, false);
assert.equal(consequence.constraints.siltGameplayActivated, false);
assert.deepEqual([
  profile.regions.surface_wake.activeUpdateBudget,
  profile.regions.guide_threshold.activeUpdateBudget,
  profile.regions.hub_chamber.activeUpdateBudget,
  profile.regions.grave_memory_route.activeUpdateBudget,
  profile.regions.vascular_route.activeUpdateBudget,
  profile.regions.silt_burrow_route.activeUpdateBudget
], [15, 13, 8, 7, 8, successorSiltPlayable ? 8 : 7]);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const frameState = {
  buildId: manifest.id,
  buildLabel: manifest.label,
  buildManifest: manifest,
  frame: 480,
  runtimeSeconds: 32,
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
  currentMode: { id: "vascular_rhythm_mode", regionId: "vascular_route" },
  input: {
    interactPressed: false,
    interactEventId: 0,
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false,
    boostHeld: false
  },
  playerComposition: { form: 0.34, flux: 0.18, scar: 0.04, seed: 0.4, signal: 0.21 },
  playerKinematics: {
    velocity: { x: 0, y: 0, z: 0 },
    flowVector: { x: 0, y: 0, z: 0 },
    speed: 0,
    pressure: 0.22,
    viscosity: 0.34,
    boundaryPressure: 0
  },
  physicalFeel: {
    viscosity: 0.34,
    pressure: 0.22,
    flowVector: { x: 0, y: 0, z: 0 },
    boundaryBehavior: "vascular_synchronized_return_current"
  },
  pulse: { active: false },
  nurseryCircuit: {
    agencyProven: true,
    resolvedCycleCount: 1,
    successfulCycleCount: 1,
    failedCycleCount: 0,
    tenderFedCount: 1,
    coreNourishedCount: 0,
    tenderTrust: 0.76,
    tenderIntegrity: 0.92,
    scarLoad: 0.08,
    lastOutcome: "player_fed_tender_clean_matter",
    history: [{ sequence: 1, outcome: "player_fed_tender_clean_matter", matterType: "form" }]
  },
  firstSliceObjectives: {
    surface_absorb_first_nutrient: { complete: true },
    guide_stabilize_and_cross: { complete: true },
    hub_read_route_gates: { complete: true },
    grave_memory_read_and_stabilize: { complete: true },
    vascular_route_playable_circuit: { complete: true },
    silt_route_playable_circuit: { complete: false }
  },
  vascularRhythmRoute: {
    active: true,
    completed: true,
    lockedCadenceReads: 3,
    requiredCadenceReads: 3,
    synchronization: 0.84,
    circulationIntegrity: 0.96,
    turbulence: 0,
    desynchronizationRecovered: true,
    currentReversedTowardHub: true,
    currentDirection: "outward",
    returnFoldReady: true
  },
  graveMemoryRoute: {
    completed: true,
    graveMemoryImprintCommitted: true,
    safeMemoryTransferComplete: true,
    memoryThreadRetained: true,
    traceIntegrity: 0.92,
    residueRecoilRecovered: true,
    riskEventCount: 1
  },
  act1RouteHistory: {
    pass: manifest.id,
    snapshotVersion: 1,
    graveEntered: true,
    graveEntryCount: 1,
    graveReturned: true,
    graveReturnCount: 1,
    routeContractsAwake: true,
    graveMemoryImprintCommitted: true,
    safeMemoryTransferComplete: true,
    memoryThreadRetained: true,
    graveTraceIntegrity: 0.92,
    graveResidueRecoilRecovered: true,
    routeStates: {
      grave_memory_route: {
        entered: true,
        returned: true,
        completed: true,
        entryCount: 1,
        returnCount: 1
      },
      vascular_route: {
        entered: true,
        returned: false,
        completed: false,
        entryCount: 1,
        returnCount: 0
      }
    }
  }
};

const gateSystem = new GateSystem({
  gateRegistry,
  frameState,
  regionRegistry,
  runtimeProfile: profile,
  routeContract: contract
});
const returnGate = gateRegistry.find("vascular_route_to_hub_chamber");
const playerReturnPosition = new THREE.Vector3(-4.58, 2.46, -2.68);
const crossing = gateSystem.completeCrossing(
  returnGate,
  "CELL_SIGNAL_CHORUS_NERVE_001",
  "interact_with_vascular_route_return_fold",
  frameState
);
assert.equal(crossing.owner, "GateSystem");
assert.equal(crossing.playerPositionPreserved, true);
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.entered, true);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.returned, true);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.completed, true);
assert.equal(frameState.act1RouteHistory.vascularReturned, true);
assert.equal(frameState.act1RouteHistory.vascularReturnCount, 1);
assert.equal(frameState.act1RouteHistory.vascularCompleted, true);
assert.equal(frameState.act1RouteHistory.vascularCadenceReads, 3);
assert.equal(frameState.act1RouteHistory.vascularSynchronization, 0.84);
assert.equal(frameState.act1RouteHistory.vascularCirculationIntegrity, 0.96);
assert.equal(frameState.act1RouteHistory.vascularDesynchronizationRecovered, true);

const historySnapshot = gateSystem.createHistorySnapshot(frameState);
const restoredFrame = { buildId: manifest.id, buildManifest: manifest };
gateSystem.restoreHistory(JSON.parse(JSON.stringify(historySnapshot)), restoredFrame);
assert.deepEqual(gateSystem.createHistorySnapshot(restoredFrame), historySnapshot);
assert.equal(restoredFrame.act1RouteHistory.vascularReturned, true);
assert.equal(restoredFrame.act1RouteHistory.vascularCadenceReads, 3);
assert.equal(restoredFrame.act1RouteHistory.vascularSynchronization, 0.84);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 100);
camera.position.set(0, 1.55, 5.5);
camera.lookAt(0, 0, -2.5);
camera.updateProjectionMatrix();
camera.updateMatrixWorld(true);
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
playerRoot.position.copy(playerReturnPosition);
scene.add(playerRoot);
new ChemObjectVisualComposer().composePlayerSeedCore(playerRoot);

const guideRoot = new THREE.Group();
guideRoot.name = "guide_orbiter_folded_lantern_001";
guideRoot.position.set(-0.8, 1.6, -0.4);
scene.add(guideRoot);

const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
const growth = new CoreGrowthSystem({
  recipeDataSystem,
  chemObjectSystem: { objects: [] },
  playerRoot,
  frameState,
  embodimentSystem: embodiment
});
growth.init();

for (let index = 0; index < 120; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  growth.update(1 / 60, frameState);
}
assert.equal(frameState.coreGrowth.vascularRhythmRetained, true);
assert.equal(frameState.coreGrowth.vascularCadenceReads, 3);
assert.equal(frameState.coreGrowth.vascularRhythmAbilityUnlocks.length, 0);
assert.equal(frameState.coreGrowth.vascularRhythmPermanentClass, false);
assert.equal(frameState.coreEmbodiment.visibleVascularReturnFilament, true);
assert.equal(frameState.coreEmbodiment.vascularReturnFilamentCount, 3);
assert.equal(frameState.coreEmbodiment.vascularCadenceNodeCount, 3);
assert.equal(frameState.coreEmbodiment.vascularReturnChargeCount, 1);
assert.equal(frameState.coreEmbodiment.vascularReturnObjectDefiningRings, 0);
assert.equal(frameState.coreEmbodiment.vascularReturnPermanentHalos, 0);
assert.equal(scene.getObjectsByProperty("name", "player_vascular_return_filament_root_HC011B").length, 1);

frameState.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
frameState.statusPage = { firstHubUseComplete: true };
frameState.hubInvestigationGameplay = {
  active: true,
  investigationReady: true,
  routeReads: ["vascular_route", "grave_memory_route", "silt_burrow_route"],
  routeReadCount: 3,
  routeCount: 3,
  allRoutesRead: true,
  memoryRead: true,
  returnedToCenter: true,
  nearestRouteId: "vascular_route",
  nearestRouteDistance: 2.2,
  responseRouteId: "none"
};
frameState.firstSliceGates = Object.fromEntries(gates.map((gate) => [gate.id, {
  id: gate.id,
  destinationMounted: true,
  awake: gate.id === "hub_to_silt_burrow_route" || gate.id === "hub_to_vascular_route" || gate.id === "hub_to_grave_memory_route",
  playableReady: gate.playableReady !== false,
  gameplayPending: gate.id === "hub_to_silt_burrow_route" && !successorSiltPlayable,
  crossable: gate.id === "hub_to_vascular_route"
    || gate.id === "hub_to_grave_memory_route"
    || (gate.id === "hub_to_silt_burrow_route" && successorSiltPlayable)
}]));

const hub = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  camera,
  playerRoot,
  frameState
});
hub.init();
hub.spatialTruth = {
  ...hub.createEmptySpatialTruth(),
  verified: true,
  screenTruthLatched: true,
  allRouteCentersInView: true,
  allRouteTerritoriesVisible: true,
  targetStateClear: true,
  minimumScreenSeparation: 0.3,
  maximumScreenOverlapRatio: 0.2,
  routeSpacingPhysical: true
};
hub.active = true;
hub.reveal = 1;
hub.routeIdentityReveal = 1;
hub.setVisible(true);
hub.animate(1 / 60, frameState.runtimeSeconds, true, frameState);
frameState.hubChamberFoundation = hub.createState(true, true);

assert.equal(frameState.hubChamberFoundation.vascularRhythmRetained, true);
assert.equal(frameState.hubChamberFoundation.vascularCoreFilamentVisible, true);
assert.equal(frameState.hubChamberFoundation.vascularHubEchoVisible, true);
assert.equal(frameState.hubChamberFoundation.vascularHubEchoFilamentCount, 3);
assert.equal(frameState.hubChamberFoundation.vascularHubEchoValveCount, 3);
assert.equal(frameState.hubChamberFoundation.vascularHubEchoChargeCount, 1);
assert.equal(frameState.hubChamberFoundation.vascularReturnObjectDefiningRings, 0);
assert.equal(frameState.hubChamberFoundation.vascularReturnTriggerMarkers, 0);
assert.equal(frameState.hubChamberFoundation.activeRouteId, "vascular_route");
assert.equal(scene.getObjectsByProperty("name", "hub_vascular_return_echo_HC011B").length, 1);

const guidePromptSystem = new GuidePromptSystem({ recipeDataSystem, frameState });
const hubPrompt = guidePromptSystem.hubFoundationPrompt(frameState);
assert.equal(hubPrompt.contentOwner, "HubChamberFoundationSystem");
assert(hubPrompt.guideLine.includes("returned as rhythm"));
assert(hubPrompt.objectiveLine.includes("Vascular Rhythm is retained"));
assert(hubPrompt.objectiveLine.includes(successorSiltPlayable ? "Silt Pressure now accepts passage" : "Silt Pressure is awake"));
assert(!hubPrompt.objectiveLine.includes("Vascular Rhythm accepts passage"));
assert(!hubPrompt.guideLine.includes("accepts passage"));

gateSystem.update(0, frameState);
assert.equal(frameState.firstSliceGates.hub_to_vascular_route.crossable, true);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.crossable, successorSiltPlayable);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.gameplayPending, !successorSiltPlayable);
assert.equal(frameState.act1RouteRuntimeContract.gameplayPendingCount, successorSiltPlayable ? 0 : 1);
assert.equal(frameState.act1RouteRuntimeContract.crossableRouteCount, successorSiltPlayable ? 2 : 1);

const diagnostics = new RecipeDebugOverlay({ frameState }).fullText();
assert(diagnostics.includes("Vascular retained:LOCKED"));
assert(diagnostics.includes("Core filament VISIBLE"));
assert(diagnostics.includes("Hub echo:VISIBLE"));
assert(diagnostics.includes("anatomy:3F/3V"));
assert(diagnostics.includes(successorSiltPlayable ? "Silt:playable" : "Silt:closed"));

const coreSource = readText("src/player/CoreEmbodimentSystem.js");
const hubSource = readText("src/hub/HubChamberFoundationSystem.js");
for (const source of [coreSource, hubSource]) {
  assert(!source.includes("newAbilityUnlock"), "Return presentation introduced an ability unlock path.");
  assert(!/frameState\.activeCellId\s*=(?!=)/.test(source), "Return presentation changed active-cell truth.");
  assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(source), "Return presentation changed objective truth.");
}

console.log("HC-011B Vascular Consequence + Hub Return validation passed.");
console.log("History proof: returned/completed/3-read cadence retained and restored through GateSystem.");
console.log("Visual proof: Core 3F/3N/1C and Hub 3F/3V/1C, zero rings or trigger markers.");
console.log(`Scope proof: Vascular replayable, Silt ${successorSiltPlayable ? "independently playable" : "closed"}, no Vascular ability, class, objective, updater, or archived-system mutation.`);
