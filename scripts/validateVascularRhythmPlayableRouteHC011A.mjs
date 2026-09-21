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
import { VascularRhythmRouteSystem } from "../src/routes/VascularRhythmRouteSystem.js";
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
const profile = readJson("public/data/runtime/act1RuntimeProfile_HC011A.json");
const contract = readJson("public/data/routes/act1RouteContracts_HC011A.json");
const routeRecipe = readJson("public/data/routes/vascularRhythmRouteCircuit_HC011A.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visualLanguages = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const hubPresentation = readJson("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const routeSource = readText("src/routes/VascularRhythmRouteSystem.js");

assert.equal(manifest.id, "HC-011A");
assert.equal(manifest.version, "0.0.124");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, "ACT1_RUNTIME_PROFILE_HC011A");
assert.equal(profile.pass, manifest.id);
assert.equal(profile.sourceAuthority, "HOST_CORE_Blueprint_v1_reference_docs.zip");
assert.equal(contract.id, "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC011A");
assert.equal(contract.foundationReference, "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC010G");
assert.equal(routeRecipe.id, "VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A");
assert.equal(routeRecipe.pass, manifest.id);
assert.deepEqual(profile.firstSlicePath, ["surface_wake", "guide_threshold", "hub_chamber"]);
assert.deepEqual(profile.act1PreviewPath.slice(3, 6), ["grave_memory_route", "vascular_route", "silt_burrow_route"]);
assert.equal(profile.regions.surface_wake.activeUpdateBudget, 15);
assert.equal(profile.regions.guide_threshold.activeUpdateBudget, 13);
assert.equal(profile.regions.hub_chamber.activeUpdateBudget, 8);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.equal(profile.regions.vascular_route.activeUpdateBudget, 8);
assert.equal(profile.regions.silt_burrow_route.activeUpdateBudget, 7);
assert.deepEqual(profile.regions.vascular_route.systemIds, [
  "act1RouteContractSystem",
  "vascularRhythmRouteSystem"
]);
assert.deepEqual(profile.regions.silt_burrow_route.systemIds, ["act1RouteContractSystem"]);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.equal(profile.vascularRhythmPlayableCircuit.newRegisteredSystemCount, 1);
assert.equal(profile.vascularRhythmPlayableCircuit.newAbilityUnlocks, 0);
assert.equal(profile.vascularRhythmPlayableCircuit.newEntities, 0);
assert.equal(profile.vascularRhythmPlayableCircuit.combat, false);
assert.equal(profile.vascularRhythmPlayableCircuit.siltGameplayActivated, false);
assert.equal(routeRecipe.anatomy.valveProgress.length, 3);
assert.equal(routeRecipe.visual.motionLanguages.length, 5);
assert.equal(routeRecipe.visual.genericRings, 0);
assert.equal(routeRecipe.visual.triggerMarkers, 0);
assert.equal(routeRecipe.completion.failureMustRemainRecoverable, true);
assert.equal(routeRecipe.returnFold.currentReversesTowardHub, true);
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)/.test(routeSource), "Vascular route system directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(routeSource), "Vascular route system directly changes active-cell truth.");
assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(routeSource), "Vascular route system directly changes objective truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(routeSource), "Vascular route system directly changes route history.");

const vascularGateRecipe = gates.find((gate) => gate.id === "hub_to_vascular_route");
const siltGateRecipe = gates.find((gate) => gate.id === "hub_to_silt_burrow_route");
const vascularReturnRecipe = gates.find((gate) => gate.id === "vascular_route_to_hub_chamber");
assert.equal(vascularGateRecipe.playableReady, true);
assert.equal(vascularGateRecipe.wakeCondition, "graveReturned");
assert.equal(vascularReturnRecipe.allowNoRequirements, undefined);
assert.deepEqual(vascularReturnRecipe.requirements, ["vascular_route_playable_circuit"]);
assert.equal(siltGateRecipe.playableReady, false);

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
const vascularHubBody = hubPresentation.routes.find((route) => route.id === "vascular_route");
playerRoot.position.fromArray(vascularHubBody.position);
scene.add(playerRoot);
const entryPosition = playerRoot.position.clone();

const baseRoutes = [
  { id: "grave_memory_route", gateId: "hub_to_grave_memory_route", distanceToPlayer: 4.4 },
  { id: "vascular_route", gateId: "hub_to_vascular_route", distanceToPlayer: 0.42 },
  { id: "silt_burrow_route", gateId: "hub_to_silt_burrow_route", distanceToPlayer: 4.8 }
];
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
    routes: baseRoutes
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
      grave_memory_route: {
        entered: true,
        returned: true,
        entryCount: 1,
        returnCount: 1,
        completed: true
      }
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
const gateSystem = new GateSystem({
  gateRegistry,
  frameState,
  regionRegistry,
  runtimeProfile: profile,
  routeContract: contract
});
const objectiveSystem = new ObjectiveSystem({
  objectiveRegistry,
  regionRegistry,
  frameState
});
const contractSystem = new Act1RouteContractSystem({
  contract,
  playerRoot,
  frameState
});
contractSystem.init();
const vascularSystem = new VascularRhythmRouteSystem({
  recipeDataSystem,
  scene,
  playerRoot,
  frameState
});
vascularSystem.init();

// Grave return wakes both destination contracts, but only the completed
// Vascular playable pass may cross from the Hub.
gateSystem.update(0, frameState);
assert.equal(frameState.firstSliceGates.hub_to_vascular_route.awake, true);
assert.equal(frameState.firstSliceGates.hub_to_vascular_route.crossable, true);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.awake, true);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.gameplayPending, true);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.crossable, false);
assert.equal(frameState.act1RouteRuntimeContract.crossableRouteCount, 1);
assert.equal(frameState.act1RouteRuntimeContract.gameplayPendingCount, 1);

frameState.input.pulsePressed = true;
frameState.input.pulseEventId = 71;
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "hub_to_vascular_route");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_VASCULAR_RHYTHM_ROUTE_001");
assert(playerRoot.position.equals(entryPosition), "Hub-to-Vascular entry relocated the Core.");
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.completed, false, "The Grave prerequisite incorrectly completed Vascular on entry.");
frameState.input.pulsePressed = false;

modeController.update(0, frameState);
assert.equal(frameState.currentMode.id, "vascular_rhythm_mode");
assert.equal(frameState.currentMode.regionId, "vascular_route");
assert.deepEqual(frameState.firstSliceRuntimeMount.regionSystemIds, [
  "act1RouteContractSystem",
  "vascularRhythmRouteSystem"
]);
assert.equal(frameState.firstSliceRuntimeMount.activeUpdateBudget, 8);
contractSystem.onRuntimeMount(frameState);
vascularSystem.onRuntimeMount(frameState);
assert(playerRoot.position.equals(entryPosition), "Vascular systems relocated the Core during mount.");
assert.deepEqual(frameState.physicalFeel.movementBounds.center, {
  x: entryPosition.x,
  y: entryPosition.y,
  z: entryPosition.z
});
assert.deepEqual(frameState.physicalFeel.movementBounds.radii, { x: 4.8, y: 3.35, z: 7.2 });

let pulseSequence = 100;
let interactSequence = 200;
let maximumMovementStep = 0;
let cumulativeMovement = 0;

function advancePlayerToward(target, maximumStep = 0.052) {
  const before = playerRoot.position.clone();
  const delta = target.clone().sub(playerRoot.position);
  const distance = delta.length();
  if (distance > maximumStep) delta.setLength(maximumStep);
  playerRoot.position.add(delta);
  const moved = playerRoot.position.distanceTo(before);
  maximumMovementStep = Math.max(maximumMovementStep, moved);
  cumulativeMovement += moved;
}

function tick(dt = 1 / 60) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  contractSystem.update(dt, frameState);
  vascularSystem.update(dt, frameState);
  objectiveSystem.update(dt, frameState);
  gateSystem.update(dt, frameState);
}

tick();
assert.equal(frameState.vascularRhythmRoute.active, true);
assert.equal(frameState.act1RouteContract.returnFoldReady, false, "Vascular return fold opened before synchronization.");
assert.equal(frameState.firstSliceObjectives.vascular_route_playable_circuit.complete, false);

// Two deliberately off-beat Pulse events must produce a visible but fully
// recoverable desynchronization. No player position, objective, or gate truth
// is changed by the Vascular gameplay owner.
for (let index = 0; index < 2; index += 1) {
  pulseSequence += 1;
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId = pulseSequence;
  tick();
  frameState.input.pulsePressed = false;
  tick();
}
assert.equal(frameState.vascularRhythmRoute.riskEventCount, 2);
assert.equal(frameState.vascularRhythmRoute.desynchronized, true);
assert(frameState.vascularRhythmRoute.turbulence >= 0.34);
assert(frameState.vascularRhythmRoute.circulationIntegrity < 0.8);
assert.equal(frameState.vascularRhythmRoute.failureRecoverable, true);
assert.equal(frameState.firstSliceObjectives.vascular_route_playable_circuit.complete, false);
assert.equal(frameState.activeCellId, "CELL_VASCULAR_RHYTHM_ROUTE_001");
assert(playerRoot.position.equals(entryPosition));

frameState.input.stabilizeHeld = true;
let recoveryFrames = 0;
while (!frameState.vascularRhythmRoute.desynchronizationRecovered && recoveryFrames < 360) {
  tick();
  recoveryFrames += 1;
}
assert(recoveryFrames < 360, "Stabilize did not recover the authored desynchronization.");
assert(frameState.vascularRhythmRoute.turbulence <= routeRecipe.stabilization.recoveryTurbulenceThreshold);
assert(frameState.vascularRhythmRoute.circulationIntegrity >= routeRecipe.stabilization.recoveryIntegrityThreshold);
assert(frameState.vascularRhythmRoute.stabilizeSeconds >= routeRecipe.completion.minimumStabilizeSeconds);
assert.equal(frameState.vascularRhythmRoute.desynchronized, false);
frameState.input.stabilizeHeld = false;

// Follow the real moving charge through all three valve windows. The harness
// advances the Core only in ordinary sub-frame-sized increments and lets the
// route system perform every cadence, failure, recovery, and completion state
// transition itself.
let cadenceFrames = 0;
while (frameState.vascularRhythmRoute.lockedCadenceReads < 3 && cadenceFrames < 2400) {
  const charge = frameState.vascularRhythmRoute.chargePosition;
  if (charge) advancePlayerToward(new THREE.Vector3(charge.x, charge.y, charge.z));
  tick();
  const route = frameState.vascularRhythmRoute;
  const nextValve = routeRecipe.anatomy.valveProgress[route.lockedCadenceReads] ?? 0.82;
  const approachReady = route.pathProgress >= nextValve - routeRecipe.cadence.minimumValveApproachSlack;
  if (route.pulseWindowOpen && route.chargeDistance <= routeRecipe.cadence.pulseRange && approachReady) {
    pulseSequence += 1;
    frameState.input.pulsePressed = true;
    frameState.input.pulseEventId = pulseSequence;
    tick();
    frameState.input.pulsePressed = false;
  }
  cadenceFrames += 1;
}
assert(cadenceFrames < 2400, "The moving charge could not be followed through three cadence windows.");
assert.equal(frameState.vascularRhythmRoute.lockedCadenceReads, 3);
assert(maximumMovementStep <= 0.052001, "Cadence proof used a teleport-sized movement step.");
assert(cumulativeMovement > 4.5, "Cadence proof did not traverse a meaningful portion of the vessel.");

let synchronizationFrames = 0;
while (!frameState.vascularRhythmRoute.completed && synchronizationFrames < 720) {
  const charge = frameState.vascularRhythmRoute.chargePosition;
  if (charge) advancePlayerToward(new THREE.Vector3(charge.x, charge.y, charge.z));
  frameState.input.stabilizeHeld = true;
  tick();
  synchronizationFrames += 1;
}
frameState.input.stabilizeHeld = false;
assert(synchronizationFrames < 720, "All earned Vascular conditions did not synchronize circulation.");
assert.equal(frameState.vascularRhythmRoute.completed, true);
assert(frameState.vascularRhythmRoute.maxDepthProgress >= routeRecipe.completion.minimumDeepProgress);
assert.equal(frameState.vascularRhythmRoute.returnFoldReady, true);
assert.equal(frameState.vascularRhythmRoute.currentReversedTowardHub, true);
assert.equal(frameState.vascularRhythmRoute.currentDirection, "outward");
assert.equal(frameState.firstSliceObjectives.vascular_route_playable_circuit.complete, true);
assert.equal(frameState.firstSliceObjectives.vascular_route_playable_circuit.stepState.three_cadence_windows_pulse_read, true);
assert.equal(frameState.firstSliceObjectives.vascular_route_playable_circuit.stepState.return_current_formed, true);
assert.equal(frameState.act1RouteContract.returnFoldReady, false, "Contract observed Vascular completion without its normal one-frame ownership handoff.");
tick();
assert.equal(frameState.act1RouteContract.returnFoldReady, true);

const routeMeshes = [];
vascularSystem.root.traverse((object) => {
  if (object.isMesh) routeMeshes.push(object.name);
});
assert.equal(vascularSystem.valves.length, 3);
assert.equal(frameState.vascularRhythmRoute.valveSilhouetteCount, 3);
assert.equal(frameState.vascularRhythmRoute.visualMotionLanguages.length, 5);
assert.equal(frameState.vascularRhythmRoute.genericRingCount, 0);
assert.equal(frameState.vascularRhythmRoute.triggerMarkerCount, 0);
assert(!routeMeshes.some((name) => /generic.*ring|trigger.*marker/i.test(name)));
assert.equal(vascularSystem.returnFold.visible, true);

// Follow the visibly reversed route back through authored path samples, then
// approach the preserved return fold without a forced relocation.
for (const progress of [0.72, 0.58, 0.44, 0.3, 0.16, 0.04, 0]) {
  const target = vascularSystem.pathCurve.getPointAt(progress).add(entryPosition.clone());
  let approachFrames = 0;
  while (playerRoot.position.distanceTo(target) > 0.055 && approachFrames < 420) {
    advancePlayerToward(target);
    tick();
    approachFrames += 1;
  }
  assert(approachFrames < 420, `Reversed current path sample ${progress} was not continuously reachable.`);
}
let returnApproachFrames = 0;
while (playerRoot.position.distanceTo(vascularSystem.returnPosition) > 0.08 && returnApproachFrames < 240) {
  advancePlayerToward(vascularSystem.returnPosition);
  tick();
  returnApproachFrames += 1;
}
assert(returnApproachFrames < 240, "The preserved Vascular return fold was not continuously reachable.");
tick();
assert(frameState.act1RouteContract.returnFoldDistance <= routeRecipe.returnFold.interactionRange);
assert.equal(frameState.firstSliceGates.vascular_route_to_hub_chamber.crossable, true);
assert.equal(frameState.gateState.id, "vascular_route_to_hub_chamber");
assert.equal(frameState.gateState.interactionReady, true);

const preReturnPosition = playerRoot.position.clone();
interactSequence += 1;
frameState.input.interactPressed = true;
frameState.input.interactEventId = interactSequence;
tick();
frameState.input.interactPressed = false;
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.gateState.id, "vascular_route_to_hub_chamber");
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert(playerRoot.position.equals(preReturnPosition), "Vascular-to-Hub return relocated the Core.");
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.entered, true);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.returned, true);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.completed, true);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.entryCount, 1);
assert.equal(frameState.act1RouteHistory.routeStates.vascular_route.returnCount, 1);
assert.equal(frameState.act1RouteCrossing.owner, "GateSystem");

modeController.update(0, frameState);
vascularSystem.onRuntimeUnmount(frameState);
contractSystem.onRuntimeUnmount(frameState);
gateSystem.update(0, frameState);
assert.equal(frameState.currentMode.regionId, "hub_chamber");
assert.equal(frameState.vascularRhythmRoute.active, false);
assert.equal(frameState.vascularRhythmRoute.completed, true);
assert.equal(frameState.act1RouteRuntimeContract.crossableRouteCount, 1);
assert.equal(frameState.act1RouteRuntimeContract.gameplayPendingCount, 1);
assert.deepEqual(frameState.act1RouteRuntimeContract.playableRouteIds, ["vascular_route"]);
assert.deepEqual(frameState.act1RouteRuntimeContract.gameplayPendingRouteIds, ["silt_burrow_route"]);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.crossable, false);
assert.equal(frameState.firstSliceGates.hub_to_silt_burrow_route.gameplayPending, true);

const historySnapshot = gateSystem.createHistorySnapshot(frameState);
const restoredFrame = { buildId: manifest.id, buildManifest: manifest };
gateSystem.restoreHistory(JSON.parse(JSON.stringify(historySnapshot)), restoredFrame);
assert.deepEqual(gateSystem.createHistorySnapshot(restoredFrame), historySnapshot);
assert.equal(restoredFrame.act1RouteHistory.graveMemoryImprintCommitted, true);
assert.equal(restoredFrame.act1RouteHistory.routeStates.vascular_route.completed, true);

for (const diagnostics of [
  new ChemistryDebugPanel({ frameState }).fullText(),
  new RecipeDebugOverlay({ frameState }).fullText()
]) {
  assert(diagnostics.includes("Route contracts: mounted 2/2 awake:2/2 pending:1 crossable:1"));
  assert(diagnostics.includes("Vascular rhythm:retained reads:3/3"));
  assert(diagnostics.includes("return:ready"));
}

// Active-region isolation: Vascular executes its two route-local owners and
// six shared systems; Silt retains only the shared contract owner. No Grave or
// archived compatibility updater is admitted to either mount.
const executionFrame = {
  frame: 0,
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001"
};
const executionMode = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: executionFrame,
  runtimeProfile: profile
});
const executionCounts = new Map();
const probe = (id) => ({
  update() {
    executionCounts.set(id, (executionCounts.get(id) ?? 0) + 1);
  }
});
const registry = new SystemRegistry();
registry.register("modeController", executionMode);
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
registry.update(1 / 60, executionFrame);
assert.equal(executionFrame.runtimeExecution.activeRegionId, "vascular_route");
assert.equal(executionFrame.runtimeExecution.activeRegionSystemCount, 8);
assert(executionFrame.runtimeExecution.executedSystemIds.includes("act1RouteContractSystem"));
assert(executionFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));
assert(!executionFrame.runtimeExecution.executedSystemIds.includes("graveMemoryRouteSystem"));
for (const id of profile.dormantCompatibilitySystemIds) {
  assert(!registry.has(id), `${id} was registered during the HC-011A playable route proof.`);
}
executionFrame.activeCellId = "CELL_SILT_PRESSURE_ROUTE_001";
registry.update(1 / 60, executionFrame);
assert.equal(executionFrame.runtimeExecution.activeRegionId, "silt_burrow_route");
assert.equal(executionFrame.runtimeExecution.activeRegionSystemCount, 7);
assert(executionFrame.runtimeExecution.executedSystemIds.includes("act1RouteContractSystem"));
assert(!executionFrame.runtimeExecution.executedSystemIds.includes("vascularRhythmRouteSystem"));

console.log("HC-011A Vascular Rhythm Playable Route validation passed.");
console.log(`Recoverable desynchronization: 2 risks rewoven in ${recoveryFrames} frames.`);
console.log(`Cadence proof: 3/3 reads across ${cadenceFrames} frames; max movement step ${maximumMovementStep.toFixed(3)}.`);
console.log("Gate proof: Hub → Vascular → synchronized return → Hub, position preserved; Silt remained closed.");
