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
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = readJson(manifest.id === "HC-014I" ? "public/data/runtime/act1RuntimeProfile_HC014I.json" : manifest.id === "HC-014G" ? "public/data/runtime/act1RuntimeProfile_HC014G.json" : manifest.id === "HC-014F" ? "public/data/runtime/act1RuntimeProfile_HC014F.json" : manifest.id === "HC-014E" ? "public/data/runtime/act1RuntimeProfile_HC014E.json" : manifest.id === "HC-014D" ? "public/data/runtime/act1RuntimeProfile_HC014D.json" : manifest.id === "HC-014C" ? "public/data/runtime/act1RuntimeProfile_HC014C.json" : manifest.id === "HC-014B" ? "public/data/runtime/act1RuntimeProfile_HC014B.json" : manifest.id === "HC-014A" ? "public/data/runtime/act1RuntimeProfile_HC014A.json" : manifest.id === "HC-013D" ? "public/data/runtime/act1RuntimeProfile_HC013D.json" : manifest.id === "HC-013C" ? "public/data/runtime/act1RuntimeProfile_HC013C.json" : manifest.id === "HC-013B" ? "public/data/runtime/act1RuntimeProfile_HC013B.json" : manifest.id === "HC-013A" ? "public/data/runtime/act1RuntimeProfile_HC013A.json" : manifest.id === "HC-012C" ? "public/data/runtime/act1RuntimeProfile_HC012C.json" : manifest.id === "HC-012B" ? "public/data/runtime/act1RuntimeProfile_HC012B.json" : "public/data/runtime/act1RuntimeProfile_HC012A.json");
const consequence = readJson("public/data/routes/siltPressureReturnConsequence_HC012B.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const contract = readJson("public/data/routes/act1RouteContracts_HC012A.json");

assert(["HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : "0.0.128");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : manifest.id === "HC-013D" ? "ACT1_RUNTIME_PROFILE_HC013D" : manifest.id === "HC-013C" ? "ACT1_RUNTIME_PROFILE_HC013C" : manifest.id === "HC-013B" ? "ACT1_RUNTIME_PROFILE_HC013B" : manifest.id === "HC-013A" ? "ACT1_RUNTIME_PROFILE_HC013A" : manifest.id === "HC-012C" ? "ACT1_RUNTIME_PROFILE_HC012C" : "ACT1_RUNTIME_PROFILE_HC012B");
assert.equal(profile.pass, manifest.id);
assert.equal(consequence.id, "SILT_PRESSURE_RETURN_CONSEQUENCE_HC012B");
assert.equal(consequence.pass, "HC-012B");
assert.deepEqual(
  [consequence.coreAdaptation.plateCount, consequence.coreAdaptation.porousNodeCount, consequence.coreAdaptation.residueNodeCount],
  [3, 1, 2]
);
assert.deepEqual(
  [consequence.hubEcho.plateCount, consequence.hubEcho.porousNodeCount, consequence.hubEcho.residueNodeCount],
  [3, 1, 2]
);
assert.equal(consequence.constraints.newAbilities, 0);
assert.equal(consequence.constraints.newRegisteredSystems, 0);
assert.equal(consequence.constraints.routeMechanicMutation, false);

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
  buildManifest: manifest,
  frame: 720,
  runtimeSeconds: 48,
  activeCellId: "CELL_SILT_PRESSURE_ROUTE_001",
  currentMode: { id: "silt_route_contract_mode", regionId: "silt_burrow_route" },
  input: { interactPressed: false, interactEventId: 0, pulsePressed: false, pulseEventId: 0, stabilizeHeld: false, absorbHeld: false, boostHeld: false },
  playerComposition: { form: 0.34, flux: 0.18, scar: 0.04, seed: 0.4, signal: 0.21 },
  playerKinematics: { velocity: { x: 0, y: 0, z: 0 }, flowVector: { x: 0, y: 0, z: 0 }, speed: 0, pressure: 0.2, viscosity: 0.4, boundaryPressure: 0 },
  physicalFeel: { viscosity: 0.4, pressure: 0.2, flowVector: { x: 0, y: 0, z: 0 }, boundaryBehavior: "silt_released_return_breath" },
  pulse: { active: false },
  nurseryCircuit: { agencyProven: true, resolvedCycleCount: 1, successfulCycleCount: 1, failedCycleCount: 0, tenderFedCount: 1, coreNourishedCount: 0, tenderTrust: 0.76, tenderIntegrity: 0.92, scarLoad: 0.08, lastOutcome: "player_fed_tender_clean_matter", history: [{ sequence: 1, outcome: "player_fed_tender_clean_matter", matterType: "form" }] },
  firstSliceObjectives: {
    surface_absorb_first_nutrient: { complete: true },
    guide_stabilize_and_cross: { complete: true },
    hub_read_route_gates: { complete: true },
    grave_memory_read_and_stabilize: { complete: true },
    vascular_route_playable_circuit: { complete: true },
    silt_route_playable_circuit: { complete: true }
  },
  graveMemoryRoute: { completed: true, graveMemoryImprintCommitted: true, safeMemoryTransferComplete: true, memoryThreadRetained: true, traceIntegrity: 0.92, residueRecoilRecovered: true, riskEventCount: 1 },
  vascularRhythmRoute: { completed: true, lockedCadenceReads: 3, synchronization: 0.86, circulationIntegrity: 0.95, desynchronizationRecovered: true },
  siltPressureRoute: {
    active: true,
    completed: true,
    pressureRead: true,
    pressureReadCount: 1,
    ribsReleased: true,
    safeMatterAbsorbed: true,
    denseMatterLeftIntact: true,
    failureCount: 1,
    failureRecovered: true,
    compression: 0.18,
    maxDepthProgress: 0.91,
    returnFoldReady: true
  },
  act1RouteHistory: {
    pass: manifest.id,
    snapshotVersion: 1,
    graveEntered: true,
    graveReturned: true,
    graveMemoryImprintCommitted: true,
    safeMemoryTransferComplete: true,
    memoryThreadRetained: true,
    graveTraceIntegrity: 0.92,
    vascularReturned: true,
    vascularCompleted: true,
    vascularCadenceReads: 3,
    vascularSynchronization: 0.86,
    vascularCirculationIntegrity: 0.95,
    vascularDesynchronizationRecovered: true,
    routeStates: {
      grave_memory_route: { entered: true, returned: true, completed: true, entryCount: 1, returnCount: 1 },
      vascular_route: { entered: true, returned: true, completed: true, entryCount: 1, returnCount: 1 },
      silt_burrow_route: { entered: true, returned: false, completed: false, entryCount: 1, returnCount: 0 }
    }
  }
};

const gateSystem = new GateSystem({ gateRegistry, frameState, regionRegistry, runtimeProfile: profile, routeContract: contract });
const returnGate = gateRegistry.find("silt_burrow_route_to_hub_chamber");
const playerReturnPosition = new THREE.Vector3(4.2, -2.1, -2.4);
const crossing = gateSystem.completeCrossing(returnGate, "CELL_SIGNAL_CHORUS_NERVE_001", "interact_with_silt_burrow_route_return_fold", frameState);
assert.equal(crossing.owner, "GateSystem");
assert.equal(crossing.playerPositionPreserved, true);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.returned, true);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.completed, true);
assert.equal(frameState.act1RouteHistory.siltReturned, true);
assert.equal(frameState.act1RouteHistory.siltReturnCount, 1);
assert.equal(frameState.act1RouteHistory.siltCompleted, true);
assert.equal(frameState.act1RouteHistory.siltPressureRead, true);
assert.equal(frameState.act1RouteHistory.siltRibsReleased, true);
assert.equal(frameState.act1RouteHistory.siltSafeMatterAbsorbed, true);
assert.equal(frameState.act1RouteHistory.siltDenseMatterLeftIntact, true);
assert.equal(frameState.act1RouteHistory.siltFailureCount, 1);
assert.equal(frameState.act1RouteHistory.siltFailureRecovered, true);
assert.equal(frameState.act1RouteHistory.siltSettledCompression, 0.18);
assert.equal(frameState.act1RouteHistory.siltMaxDepthProgress, 0.91);

const snapshot = gateSystem.createHistorySnapshot(frameState);
const restoredFrame = { buildId: manifest.id, buildManifest: manifest };
gateSystem.restoreHistory(JSON.parse(JSON.stringify(snapshot)), restoredFrame);
assert.deepEqual(gateSystem.createHistorySnapshot(restoredFrame), snapshot);
assert.equal(restoredFrame.act1RouteHistory.siltSafeMatterAbsorbed, true);
assert.equal(restoredFrame.act1RouteHistory.siltDenseMatterLeftIntact, true);

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
const growth = new CoreGrowthSystem({ recipeDataSystem, chemObjectSystem: { objects: [] }, playerRoot, frameState, embodimentSystem: embodiment });
growth.init();
for (let index = 0; index < 140; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  growth.update(1 / 60, frameState);
}
assert.equal(frameState.coreGrowth.siltPressureRetained, true);
assert.equal(frameState.coreGrowth.siltPressureAbilityUnlocks.length, 0);
assert.equal(frameState.coreGrowth.siltPressurePermanentClass, false);
assert.equal(frameState.coreEmbodiment.visibleSiltPressureAdaptation, true);
assert.equal(frameState.coreEmbodiment.siltBracePlateCount, 3);
assert.equal(frameState.coreEmbodiment.siltPorousNodeCount, 1);
assert.equal(frameState.coreEmbodiment.siltResidueNodeCount, 2);
assert.equal(frameState.coreEmbodiment.siltPressureObjectDefiningRings, 0);
assert.equal(frameState.coreEmbodiment.siltPressurePermanentHalos, 0);
assert.equal(scene.getObjectsByProperty("name", "player_silt_pressure_adaptation_root_HC012B").length, 1);

frameState.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
frameState.statusPage = { firstHubUseComplete: true };
frameState.hubInvestigationGameplay = { active: true, investigationReady: true, routeReads: ["vascular_route", "grave_memory_route", "silt_burrow_route"], routeReadCount: 3, routeCount: 3, allRoutesRead: true, memoryRead: true, returnedToCenter: true, nearestRouteId: "silt_burrow_route", nearestRouteDistance: 2.2, responseRouteId: "none" };
frameState.firstSliceGates = Object.fromEntries(gates.map((gate) => [gate.id, { id: gate.id, destinationMounted: true, awake: true, playableReady: gate.playableReady !== false, gameplayPending: false, crossable: true }]));

const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, camera, playerRoot, frameState });
hub.init();
hub.spatialTruth = { ...hub.createEmptySpatialTruth(), verified: true, screenTruthLatched: true, allRouteCentersInView: true, allRouteTerritoriesVisible: true, targetStateClear: true, minimumScreenSeparation: 0.3, maximumScreenOverlapRatio: 0.2, routeSpacingPhysical: true };
hub.active = true;
hub.reveal = 1;
hub.routeIdentityReveal = 1;
hub.setVisible(true);
hub.animate(1 / 60, frameState.runtimeSeconds, true, frameState);
frameState.hubChamberFoundation = hub.createState(true, true);
assert.equal(frameState.hubChamberFoundation.returnedSiltPressure, true);
assert.equal(frameState.hubChamberFoundation.visibleSiltReturnEcho, true);
assert.equal(frameState.hubChamberFoundation.siltReturnEchoPlateCount, 3);
assert.equal(frameState.hubChamberFoundation.siltReturnEchoPorousNodeCount, 1);
assert.equal(frameState.hubChamberFoundation.siltReturnEchoResidueNodeCount, 2);
assert.equal(frameState.hubChamberFoundation.threeRouteReadingsRetained, true);
assert.equal(scene.getObjectsByProperty("name", "hub_silt_pressure_return_echo_HC012B").length, 1);

const prompt = new GuidePromptSystem({ recipeDataSystem, frameState }).hubFoundationPrompt(frameState);
assert(prompt.guideLine.includes("returned as restraint"));
assert(prompt.objectiveLine.includes("Silt Pressure is retained"));
assert(prompt.objectiveLine.includes("three route readings") || prompt.objectiveLine.includes("Grave Memory"));
assert(!prompt.objectiveLine.includes("Silt Pressure now accepts passage"));
assert(prompt.debugFallback.includes("three retained route readings") || prompt.debugFallback.includes("Combward"));

for (const source of [readText("src/player/CoreEmbodimentSystem.js"), readText("src/hub/HubChamberFoundationSystem.js")]) {
  assert(!/frameState\.activeCellId\s*=(?!=)/.test(source), "Return presentation changed active-cell truth.");
  assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(source), "Return presentation changed objective truth.");
}

console.log(`HC-012B Silt Return Consequence regression passed under ${manifest.id}.`);
console.log("History proof: Silt completion, selective intake, protected residue, recovery, compression, and depth survive GateSystem snapshot restore.");
console.log("Visual proof: Core 3 plates/1 porous/2 residue and Hub 3 plates/1 porous/2 residue, with no rings, halos, triggers, abilities, or new updater.");
