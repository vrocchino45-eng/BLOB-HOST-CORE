import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { Act1RouteContractSystem } from "../src/routes/Act1RouteContractSystem.js";
import { SiltPressureRouteSystem } from "../src/routes/SiltPressureRouteSystem.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { ChemistryDebugPanel } from "../src/debug/ChemistryDebugPanel.js";
import { RecipeDebugOverlay } from "../src/debug/RecipeDebugOverlay.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = readJson(manifest.id === "HC-014I" ? "public/data/runtime/act1RuntimeProfile_HC014I.json" : manifest.id === "HC-014G" ? "public/data/runtime/act1RuntimeProfile_HC014G.json" : manifest.id === "HC-014F" ? "public/data/runtime/act1RuntimeProfile_HC014F.json" : manifest.id === "HC-014E" ? "public/data/runtime/act1RuntimeProfile_HC014E.json" : manifest.id === "HC-014D" ? "public/data/runtime/act1RuntimeProfile_HC014D.json" : manifest.id === "HC-014C" ? "public/data/runtime/act1RuntimeProfile_HC014C.json" : manifest.id === "HC-014B" ? "public/data/runtime/act1RuntimeProfile_HC014B.json" : manifest.id === "HC-014A" ? "public/data/runtime/act1RuntimeProfile_HC014A.json" : manifest.id === "HC-013D" ? "public/data/runtime/act1RuntimeProfile_HC013D.json" : manifest.id === "HC-013C" ? "public/data/runtime/act1RuntimeProfile_HC013C.json" : manifest.id === "HC-013B" ? "public/data/runtime/act1RuntimeProfile_HC013B.json" : manifest.id === "HC-013A" ? "public/data/runtime/act1RuntimeProfile_HC013A.json" : manifest.id === "HC-012C" ? "public/data/runtime/act1RuntimeProfile_HC012C.json" : manifest.id === "HC-012B" ? "public/data/runtime/act1RuntimeProfile_HC012B.json" : "public/data/runtime/act1RuntimeProfile_HC012A.json");
const contract = readJson("public/data/routes/act1RouteContracts_HC012A.json");
const routeRecipe = readJson("public/data/routes/siltPressureRouteCircuit_HC012A.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visualLanguages = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const hubPresentation = readJson("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const routeSource = readText("src/routes/SiltPressureRouteSystem.js");

assert(["HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : "0.0.128");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : manifest.id === "HC-013D" ? "ACT1_RUNTIME_PROFILE_HC013D" : manifest.id === "HC-013C" ? "ACT1_RUNTIME_PROFILE_HC013C" : manifest.id === "HC-013B" ? "ACT1_RUNTIME_PROFILE_HC013B" : manifest.id === "HC-013A" ? "ACT1_RUNTIME_PROFILE_HC013A" : manifest.id === "HC-012C" ? "ACT1_RUNTIME_PROFILE_HC012C" : "ACT1_RUNTIME_PROFILE_HC012B");
assert.equal(profile.pass, manifest.id);
assert.equal(profile.sourceAuthority, "HOST_CORE_Blueprint_v1_reference_docs.zip");
assert.equal(contract.id, "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC012A");
assert.equal(contract.foundationReference, "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC010G");
assert.equal(routeRecipe.id, "SILT_PRESSURE_PLAYABLE_CIRCUIT_HC012A");
assert.equal(routeRecipe.pass, "HC-012A");
assert.deepEqual(profile.firstSlicePath, ["surface_wake", "guide_threshold", "hub_chamber"]);
assert.deepEqual(profile.act1PreviewPath.slice(3, 6), ["grave_memory_route", "vascular_route", "silt_burrow_route"]);
assert.equal(profile.regions.surface_wake.activeUpdateBudget, 15);
assert.equal(profile.regions.guide_threshold.activeUpdateBudget, 13);
assert.equal(profile.regions.hub_chamber.activeUpdateBudget, 8);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.equal(profile.regions.vascular_route.activeUpdateBudget, 8);
assert.equal(profile.regions.silt_burrow_route.activeUpdateBudget, 8);
assert.deepEqual(profile.regions.silt_burrow_route.systemIds, [
  "act1RouteContractSystem",
  "siltPressureRouteSystem"
]);
assert.equal(profile.regions.silt_burrow_route.gameplayOwner, "SiltPressureRouteSystem");
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.equal(profile.siltPressurePlayableCircuit.newRegisteredSystemCount, 1);
assert.equal(profile.siltPressurePlayableCircuit.newAbilityUnlocks, 0);
assert.equal(profile.siltPressurePlayableCircuit.newEntities, 0);
assert.equal(profile.siltPressurePlayableCircuit.combat, false);
assert.equal(profile.siltPressurePlayableCircuit.death, false);
assert.equal(profile.siltPressurePlayableCircuit.forcedRestart, false);
assert.equal(routeRecipe.anatomy.ribProgress.length, 5);
assert.equal(routeRecipe.appetite.denseOffsets.length, 2);
assert.equal(routeRecipe.visual.motionLanguages.length, 6);
assert.equal(routeRecipe.visual.genericRings, 0);
assert.equal(routeRecipe.visual.triggerMarkers, 0);
assert.equal(routeRecipe.recovery.failureErasesPressureRead, false);
assert.equal(routeRecipe.recovery.failureErasesBrace, false);
assert.equal(routeRecipe.completion.failureMustRemainRecoverable, true);
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)/.test(routeSource), "Silt system directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(routeSource), "Silt system directly changes active-cell truth.");
assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(routeSource), "Silt system directly changes objective truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(routeSource), "Silt system directly changes route history.");

const vascularEntry = gates.find((gate) => gate.id === "hub_to_vascular_route");
const siltEntry = gates.find((gate) => gate.id === "hub_to_silt_burrow_route");
const siltReturn = gates.find((gate) => gate.id === "silt_burrow_route_to_hub_chamber");
assert.equal(vascularEntry.playableReady, true);
assert.equal(siltEntry.playableReady, true);
assert.equal(siltEntry.wakeCondition, "graveReturned");
assert.equal(siltReturn.allowNoRequirements, undefined);
assert.deepEqual(siltReturn.requirements, ["silt_route_playable_circuit"]);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const objectiveRegistry = new ObjectiveRegistry(objectives);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visualLanguages);
const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
const siltHubBody = hubPresentation.routes.find((route) => route.id === "silt_burrow_route");
playerRoot.position.fromArray(siltHubBody.position);
scene.add(playerRoot);
const entryPosition = playerRoot.position.clone();

const frameState = {
  buildId: manifest.id,
  buildManifest: manifest,
  frame: 20,
  runtimeSeconds: 2,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: { id: "hub_mode", regionId: "hub_chamber" },
  hubChamberFoundation: {
    active: true,
    completed: true,
    routes: [
      { id: "grave_memory_route", gateId: "hub_to_grave_memory_route", distanceToPlayer: 4.4 },
      { id: "vascular_route", gateId: "hub_to_vascular_route", distanceToPlayer: 4.8 },
      { id: "silt_burrow_route", gateId: "hub_to_silt_burrow_route", distanceToPlayer: 0.42 }
    ]
  },
  firstSliceObjectives: {
    surface_absorb_first_nutrient: { complete: true },
    guide_stabilize_and_cross: { complete: true },
    hub_read_route_gates: { complete: true },
    grave_memory_read_and_stabilize: { complete: true },
    vascular_route_playable_circuit: { complete: false },
    silt_route_playable_circuit: { complete: false }
  },
  graveMemoryRoute: {
    completed: true,
    protectedObjectsUntouched: true,
    safeTransferRequired: true,
    safeMemoryTransferComplete: true,
    graveMemoryImprintCommitted: true,
    failureRecoverable: true,
    traceIntegrity: 1,
    riskEventCount: 1,
    residueRecoilRecovered: true,
    memoryThreadRetained: true
  },
  act1RouteHistory: {
    pass: manifest.id,
    snapshotVersion: 1,
    graveEntered: true,
    graveEntryCount: 1,
    graveReturned: true,
    graveReturnCount: 1,
    routeContractsAwake: true,
    memoryThreadRetained: true,
    safeMemoryTransferComplete: true,
    graveMemoryImprintCommitted: true,
    graveTraceIntegrity: 1,
    graveRiskEventCount: 1,
    graveResidueRecoilRecovered: true,
    routeStates: {
      grave_memory_route: { entered: true, returned: true, entryCount: 1, returnCount: 1, completed: true }
    }
  },
  physicalFeel: {
    viscosity: 0.42,
    pressure: 0.24,
    flowVector: { x: 0, y: 0, z: 0 },
    boundaryBehavior: "hub_junction"
  },
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false,
    interactPressed: false,
    interactEventId: 0
  }
};

const modeController = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState,
  runtimeProfile: profile
});
const gateSystem = new GateSystem({ gateRegistry, frameState, regionRegistry, runtimeProfile: profile, routeContract: contract });
const objectiveSystem = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const contractSystem = new Act1RouteContractSystem({ contract, playerRoot, frameState });
contractSystem.init();
const siltSystem = new SiltPressureRouteSystem({ recipeDataSystem, scene, playerRoot, frameState });
siltSystem.init();

gateSystem.update(0, frameState);
assert.equal(frameState.firstSliceGates.hub_to_vascular_route.crossable, true);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.crossable, true);
assert.equal(frameState.act1RouteRuntimeContract.crossableRouteCount, 2);
assert.equal(frameState.act1RouteRuntimeContract.gameplayPendingCount, 0);

frameState.input.pulsePressed = true;
frameState.input.pulseEventId = 71;
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "hub_to_silt_burrow_route");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_SILT_PRESSURE_ROUTE_001");
assert(playerRoot.position.equals(entryPosition), "Hub-to-Silt entry relocated the Core.");
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.completed, false);
frameState.input.pulsePressed = false;

modeController.update(0, frameState);
assert.equal(frameState.currentMode.id, "silt_route_contract_mode");
assert.equal(frameState.currentMode.regionId, "silt_burrow_route");
assert.deepEqual(frameState.firstSliceRuntimeMount.regionSystemIds, ["act1RouteContractSystem", "siltPressureRouteSystem"]);
assert.equal(frameState.firstSliceRuntimeMount.activeUpdateBudget, 8);
contractSystem.onRuntimeMount(frameState);
siltSystem.onRuntimeMount(frameState);
scene.updateMatrixWorld(true);
assert(playerRoot.position.equals(entryPosition), "Silt systems relocated the Core during mount.");
assert.deepEqual(frameState.physicalFeel.movementBounds.center, { x: entryPosition.x, y: entryPosition.y, z: entryPosition.z });
assert.deepEqual(frameState.physicalFeel.movementBounds.radii, { x: 4.45, y: 3.05, z: 6.6 });

let pulseSequence = 100;
let interactSequence = 200;
let maximumMovementStep = 0;
let cumulativeMovement = 0;
function advancePlayerToward(target, maximumStep = 0.052) {
  const before = playerRoot.position.clone();
  const delta = target.clone().sub(playerRoot.position);
  if (delta.length() > maximumStep) delta.setLength(maximumStep);
  playerRoot.position.add(delta);
  const moved = playerRoot.position.distanceTo(before);
  maximumMovementStep = Math.max(maximumMovementStep, moved);
  cumulativeMovement += moved;
}
function tick(dt = 1 / 60) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  contractSystem.update(dt, frameState);
  siltSystem.update(dt, frameState);
  objectiveSystem.update(dt, frameState);
  gateSystem.update(dt, frameState);
}
async function moveTo(target, label, limit = 720) {
  let frames = 0;
  while (playerRoot.position.distanceTo(target) > 0.055 && frames < limit) {
    advancePlayerToward(target);
    tick();
    frames += 1;
  }
  assert(frames < limit, `${label} was not continuously reachable.`);
  return frames;
}

tick();
assert.equal(frameState.siltPressureRoute.active, true);
assert.equal(frameState.act1RouteContract.returnFoldReady, false);
assert.equal(frameState.firstSliceObjectives.silt_route_playable_circuit.complete, false);

const readPoint = siltSystem.pathCurve.getPointAt(0.2).add(entryPosition.clone());
await moveTo(readPoint, "pressure-read rib pocket");
pulseSequence += 1;
frameState.input.pulsePressed = true;
frameState.input.pulseEventId = pulseSequence;
tick();
frameState.input.pulsePressed = false;
tick();
assert.equal(frameState.siltPressureRoute.pressureRead, true);
assert.equal(frameState.siltPressureRoute.pressureReadCount, 1);

frameState.input.stabilizeHeld = true;
let braceFrames = 0;
while (!frameState.siltPressureRoute.ribsReleased && braceFrames < 180) {
  tick();
  braceFrames += 1;
}
frameState.input.stabilizeHeld = false;
assert(braceFrames < 180, "Stabilize did not brace the living ribs.");
assert.equal(frameState.siltPressureRoute.ribsReleased, true);

scene.updateMatrixWorld(true);
const denseTarget = new THREE.Vector3();
siltSystem.densePackets[0].getWorldPosition(denseTarget);
await moveTo(denseTarget, "packed residue body");
frameState.input.absorbHeld = true;
let failureFrames = 0;
while (!frameState.siltPressureRoute.compressionFailure && failureFrames < 120) {
  tick();
  failureFrames += 1;
}
frameState.input.absorbHeld = false;
tick();
assert(failureFrames < 120, "Greedy packed-residue intake did not cause the authored compression failure.");
assert.equal(frameState.siltPressureRoute.failureCount, 1);
assert.equal(frameState.siltPressureRoute.compression, 1);
assert.equal(frameState.siltPressureRoute.pressureRead, true, "Failure erased the earned pressure read.");
assert.equal(frameState.siltPressureRoute.ribsReleased, true, "Failure erased the earned brace.");
assert.equal(frameState.siltPressureRoute.safeMatterAbsorbed, false);
assert.equal(frameState.siltPressureRoute.denseMatterLeftIntact, true);

frameState.input.stabilizeHeld = true;
let recoveryFrames = 0;
while (!frameState.siltPressureRoute.failureRecovered && recoveryFrames < 240) {
  tick();
  recoveryFrames += 1;
}
frameState.input.stabilizeHeld = false;
tick();
const recoverySeconds = recoveryFrames / 60;
assert(recoveryFrames < 240, "Stabilize did not recover the worst Silt compression state.");
assert(recoverySeconds <= routeRecipe.recovery.maximumWorstStateRecoverySeconds);
assert.equal(frameState.siltPressureRoute.compressionFailure, false);
assert.equal(frameState.siltPressureRoute.pressureRead, true);
assert.equal(frameState.siltPressureRoute.ribsReleased, true);

scene.updateMatrixWorld(true);
const safeTarget = new THREE.Vector3();
siltSystem.safePacket.getWorldPosition(safeTarget);
await moveTo(safeTarget, "porous nutrient packet");
frameState.input.absorbHeld = true;
let safeFrames = 0;
while (!frameState.siltPressureRoute.safeMatterAbsorbed && safeFrames < 180) {
  tick();
  safeFrames += 1;
}
frameState.input.absorbHeld = false;
tick();
assert(safeFrames < 180, "Selective Absorb did not take the porous nutrient packet.");
assert.equal(frameState.siltPressureRoute.safeMatterAbsorbed, true);
assert.equal(frameState.siltPressureRoute.packedResidueCount, 2);
assert.equal(frameState.siltPressureRoute.denseMatterLeftIntact, true);

const deepTarget = siltSystem.pathCurve.getPointAt(0.9).add(entryPosition.clone());
await moveTo(deepTarget, "deep pressure organ", 900);
let completionFrames = 0;
while (!frameState.siltPressureRoute.completed && completionFrames < 240) {
  tick();
  completionFrames += 1;
}
assert(completionFrames < 240, "The released deep route did not form its return breath.");
assert(frameState.siltPressureRoute.maxDepthProgress >= routeRecipe.completion.minimumDeepProgress);
assert.equal(frameState.siltPressureRoute.returnFoldReady, true);
assert.equal(frameState.firstSliceObjectives.silt_route_playable_circuit.complete, true);
assert.equal(frameState.firstSliceObjectives.silt_route_playable_circuit.stepState.pressure_direction_pulse_read, true);
assert.equal(frameState.firstSliceObjectives.silt_route_playable_circuit.stepState.packed_residue_left_intact, true);
tick();
assert.equal(frameState.act1RouteContract.returnFoldReady, true);

const routeMeshes = [];
siltSystem.root.traverse((object) => {
  if (object.isMesh) routeMeshes.push(object.name);
});
assert.equal(siltSystem.ribGroups.length, 5);
assert.equal(siltSystem.densePackets.length, 2);
assert.equal(frameState.siltPressureRoute.ribSilhouetteCount, 5);
assert.equal(frameState.siltPressureRoute.visualMotionLanguages.length, 6);
assert.equal(frameState.siltPressureRoute.genericRingCount, 0);
assert.equal(frameState.siltPressureRoute.triggerMarkerCount, 0);
assert(!routeMeshes.some((name) => /generic.*ring|trigger.*marker/i.test(name)));
assert.equal(siltSystem.returnFold.visible, true);

for (const progress of [0.72, 0.54, 0.36, 0.18, 0]) {
  const target = siltSystem.pathCurve.getPointAt(progress).add(entryPosition.clone());
  await moveTo(target, `released return path sample ${progress}`, 720);
}
await moveTo(siltSystem.returnPosition.clone(), "Silt return fold", 300);
tick();
assert(frameState.act1RouteContract.returnFoldDistance <= routeRecipe.returnFold.interactionRange);
assert.equal(frameState.firstSliceGates.silt_burrow_route_to_hub_chamber.crossable, true);
assert.equal(frameState.gateState.id, "silt_burrow_route_to_hub_chamber");
assert.equal(frameState.gateState.interactionReady, true);

const preReturnPosition = playerRoot.position.clone();
interactSequence += 1;
frameState.input.interactPressed = true;
frameState.input.interactEventId = interactSequence;
tick();
frameState.input.interactPressed = false;
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.gateState.id, "silt_burrow_route_to_hub_chamber");
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert(playerRoot.position.equals(preReturnPosition), "Silt-to-Hub return relocated the Core.");
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.entered, true);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.returned, true);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.completed, true);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.entryCount, 1);
assert.equal(frameState.act1RouteHistory.routeStates.silt_burrow_route.returnCount, 1);
assert.equal(frameState.act1RouteCrossing.owner, "GateSystem");
assert(maximumMovementStep <= 0.052001, "Silt proof used a teleport-sized movement step.");
assert(cumulativeMovement > 8, "Silt proof did not traverse a meaningful route distance.");

modeController.update(0, frameState);
siltSystem.onRuntimeUnmount(frameState);
contractSystem.onRuntimeUnmount(frameState);
gateSystem.update(0, frameState);
assert.equal(frameState.currentMode.regionId, "hub_chamber");
assert.equal(frameState.siltPressureRoute.active, false);
assert.equal(frameState.siltPressureRoute.completed, true);
assert.equal(frameState.act1RouteRuntimeContract.crossableRouteCount, 2);
assert.equal(frameState.act1RouteRuntimeContract.gameplayPendingCount, 0);
assert.deepEqual(frameState.act1RouteRuntimeContract.playableRouteIds, ["vascular_route", "silt_burrow_route"]);
assert.deepEqual(frameState.act1RouteRuntimeContract.gameplayPendingRouteIds, []);

const historySnapshot = gateSystem.createHistorySnapshot(frameState);
const restoredFrame = { buildId: manifest.id, buildManifest: manifest };
gateSystem.restoreHistory(JSON.parse(JSON.stringify(historySnapshot)), restoredFrame);
assert.deepEqual(gateSystem.createHistorySnapshot(restoredFrame), historySnapshot);
assert.equal(restoredFrame.act1RouteHistory.graveMemoryImprintCommitted, true);
assert.equal(restoredFrame.act1RouteHistory.routeStates.silt_burrow_route.completed, true);

for (const diagnostics of [
  new ChemistryDebugPanel({ frameState }).fullText(),
  new RecipeDebugOverlay({ frameState }).fullText()
]) {
  assert(diagnostics.includes("Route contracts: mounted 2/2 awake:2/2 pending:0 crossable:2"));
  assert(diagnostics.includes("Silt pressure:retained read:YES"));
  assert(diagnostics.includes("risks:1 recovered:YES"));
  assert(diagnostics.includes("return:ready"));
}

const executionFrame = { frame: 0, activeCellId: "CELL_SILT_PRESSURE_ROUTE_001" };
const executionMode = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: executionFrame,
  runtimeProfile: profile
});
const executionCounts = new Map();
const probe = (id) => ({ update() { executionCounts.set(id, (executionCounts.get(id) ?? 0) + 1); } });
const registry = new SystemRegistry();
registry.register("modeController", executionMode);
for (const id of new Set([
  ...profile.sharedSystemIds,
  ...Object.values(profile.regions).flatMap((mount) => mount.systemIds)
])) {
  registry.register(id, probe(id), { runtimeScope: "active_region", lazyInit: true, settleOnDeactivate: true });
}
registry.update(1 / 60, executionFrame);
assert.equal(executionFrame.runtimeExecution.activeRegionId, "silt_burrow_route");
assert.equal(executionFrame.runtimeExecution.activeRegionSystemCount, 8);
assert(executionFrame.runtimeExecution.executedSystemIds.includes("act1RouteContractSystem"));
assert(executionFrame.runtimeExecution.executedSystemIds.includes("siltPressureRouteSystem"));
assert(!executionFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));
assert(!executionFrame.runtimeExecution.executedSystemIds.includes("graveMemoryRouteSystem"));
for (const id of profile.dormantCompatibilitySystemIds) {
  assert(!registry.has(id), `${id} was registered during the HC-012A playable route proof.`);
}

console.log(`HC-012A Silt Pressure Playable Route regression passed under ${manifest.id}.`);
console.log(`Failure/recovery proof: one greedy compression recovered in ${recoverySeconds.toFixed(2)} seconds.`);
console.log(`Selective appetite proof: porous matter taken; ${siltSystem.densePackets.length} packed residue bodies retained.`);
console.log(`Gate proof: Hub → Silt → released return → Hub; max movement step ${maximumMovementStep.toFixed(3)}.`);
