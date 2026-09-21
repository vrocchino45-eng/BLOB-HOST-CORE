import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";
import { GraveMemoryRouteSystem } from "../src/routes/GraveMemoryRouteSystem.js";
import { CoreEmbodimentSystem } from "../src/player/CoreEmbodimentSystem.js";
import { CoreGrowthSystem } from "../src/player/CoreGrowthSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const retainedByBuild = new Map([
  ["HC-010B", { version: "0.0.118", profile: "act1RuntimeProfile_HC010B.json" }],
  ["HC-010C", { version: "0.0.119", profile: "act1RuntimeProfile_HC010C.json" }],
  ["HC-010D", { version: "0.0.120", profile: "act1RuntimeProfile_HC010D.json" }],
  ["HC-010E", { version: "0.0.121", profile: "act1RuntimeProfile_HC010E.json" }],
  ["HC-010F", { version: "0.0.122", profile: "act1RuntimeProfile_HC010F.json" }],
  ["HC-010G", { version: "0.0.123", profile: "act1RuntimeProfile_HC010G.json" }],
  ["HC-011A", { version: "0.0.124", profile: "act1RuntimeProfile_HC011A.json" }],
  ["HC-011A1", { version: "0.0.125", profile: "act1RuntimeProfile_HC011A1.json" }],
  ["HC-011B", { version: "0.0.126", profile: "act1RuntimeProfile_HC011B.json" }],
  ["HC-012A", { version: "0.0.127", profile: "act1RuntimeProfile_HC012A.json" }],
  ["HC-012B", { version: "0.0.128", profile: "act1RuntimeProfile_HC012B.json" }],
  ["HC-012C", { version: "0.0.129", profile: "act1RuntimeProfile_HC012C.json" }],
  ["HC-013A", { version: "0.0.130", profile: "act1RuntimeProfile_HC013A.json" }],
  ["HC-013B", { version: "0.0.131", profile: "act1RuntimeProfile_HC013B.json" }],
  ["HC-013C", { version: "0.0.132", profile: "act1RuntimeProfile_HC013C.json" }],
  ["HC-013D", { version: "0.0.133", profile: "act1RuntimeProfile_HC013D.json" }],
  ["HC-014A", { version: "0.0.134", profile: "act1RuntimeProfile_HC014A.json" }],
  ["HC-014B", { version: "0.0.135", profile: "act1RuntimeProfile_HC014B.json" }],
  ["HC-014D", { version: "0.0.137", profile: "act1RuntimeProfile_HC014D.json", profileId: "ACT1_RUNTIME_PROFILE_HC014D" }],
  ["HC-014C", { version: "0.0.136", profile: "act1RuntimeProfile_HC014C.json" }],
  ["HC-014G", { version: "0.0.140", profile: "act1RuntimeProfile_HC014G.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }],
  ["HC-014I", { version: "0.0.142", profile: "act1RuntimeProfile_HC014I.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }]
]);
const successor = retainedByBuild.get(manifest.id);
assert(successor, `HC-010B consequence proof does not recognize successor ${manifest.id}.`);
const runtimeProfile = readJson(`public/data/runtime/${successor.profile}`);
const routeRecipe = readJson("public/data/routes/graveMemoryRouteCircuit_HC010B.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const graveCell = localCells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");

assert.equal(manifest.version, successor.version);
assert.equal(pkg.version, manifest.version);
assert.equal(runtimeProfile.id, successor.profileId ?? `ACT1_RUNTIME_PROFILE_${manifest.id.replace("-", "")}`);
assert.equal(runtimeProfile.pass, manifest.id);
assert.deepEqual(runtimeProfile.firstSlicePath, [
  "surface_wake",
  "guide_threshold",
  "hub_chamber"
]);
assert.deepEqual(
  runtimeProfile.act1PreviewPath.slice(0, 4),
  ["surface_wake", "guide_threshold", "hub_chamber", "grave_memory_route"]
);
if (["HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert.deepEqual(runtimeProfile.act1PreviewPath.slice(4, 6), ["vascular_route", "silt_burrow_route"]);
}
assert.deepEqual(
  runtimeProfile.firstSlicePath.map(
    (regionId) => runtimeProfile.regions[regionId].activeUpdateBudget
  ),
  [15, 13, 8]
);
assert.equal(runtimeProfile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.deepEqual(runtimeProfile.regions.grave_memory_route.systemIds, [
  "graveMemoryRouteSystem"
]);
assert.equal(runtimeProfile.dormantCompatibilitySystemIds.length, 20);
assert(!runtimeProfile.dormantCompatibilitySystemIds.includes("graveMemoryRouteSystem"));
assert.equal(runtimeProfile.firstRouteCircuit.newRegisteredSystemCount, 0);
assert.equal(runtimeProfile.firstRouteCircuit.archivedCompatibilitySystemsActivated, 0);
assert.equal(runtimeProfile.firstRouteCircuit.newAbilityUnlocks, 0);
assert.equal(runtimeProfile.firstRouteCircuit.permanentClass, false);
assert.equal(routeRecipe.id, "GRAVE_MEMORY_SAFE_TRANSFER_CIRCUIT_HC010B");
assert.equal(routeRecipe.constraints.safeTransferRequired, true);
assert.equal(routeRecipe.constraints.prematureAbsorbHasConsequence, true);
assert.equal(routeRecipe.constraints.failureRecoverable, true);
assert.equal(routeRecipe.constraints.protectedRemainsConsumable, false);
assert.equal(routeRecipe.consequence.newAbilityUnlocks, 0);
assert.equal(routeRecipe.consequence.permanentClass, false);
assert.equal(routeRecipe.consequence.routeBranch, false);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();
assert.equal(recipeDataSystem.data.graveMemoryRouteCircuit.id, routeRecipe.id);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
playerRoot.position.set(0.2, 0.1, -4.2);
scene.add(playerRoot);
new ChemObjectVisualComposer().composePlayerSeedCore(playerRoot);

const objectItems = new Map();
const fakeChemObjectSystem = {
  objects: [],
  spawnCellObjects(cellRecipe) {
    return cellRecipe.contents.chemObjects.map((id) => {
      const rootObject = new THREE.Group();
      rootObject.name = id;
      rootObject.userData = {
        objectId: id,
        absorbed: false
      };
      rootObject.scale.setScalar(1);
      scene.add(rootObject);
      const item = {
        root: rootObject,
        recipe: { id },
        absorbed: false,
        cellId: cellRecipe.id
      };
      objectItems.set(id, item);
      this.objects.push(item);
      return item;
    });
  },
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.testOpacity = opacity;
  }
};

const frameState = {
  buildManifest: manifest,
  buildId: manifest.id,
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: graveCell.id,
  currentMode: { id: "memory_route_mode", regionId: "grave_memory_route" },
  physicalFeel: {
    viscosity: 0.4,
    pressure: 0.2,
    flowVector: { x: 0, y: 0, z: -0.1 },
    boundaryBehavior: "hub_junction"
  },
  input: {
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false,
    interactPressed: false,
    interactEventId: 0,
    boostHeld: false
  },
  playerComposition: {
    form: 0.42,
    flux: 0.18,
    scar: 0.08,
    seed: 0.4,
    signal: 0.16
  },
  playerKinematics: {
    position: { x: playerRoot.position.x, y: playerRoot.position.y, z: playerRoot.position.z },
    velocity: { x: 0, y: 0, z: 0 },
    flowVector: { x: 0.02, y: -0.06, z: -0.1 },
    speed: 0,
    pressure: 0.5,
    viscosity: 0.64,
    boundaryPressure: 0
  },
  nurseryCircuit: {
    agencyProven: true,
    resolvedCycleCount: 1,
    successfulCycleCount: 1,
    failedCycleCount: 0,
    tenderFedCount: 1,
    coreNourishedCount: 0,
    tenderTrust: 0.78,
    tenderIntegrity: 0.92,
    scarLoad: 0.08,
    lastOutcome: "tender_fed_filtered_matter",
    history: [{
      sequence: 1,
      outcome: "tender_fed_filtered_matter",
      matterType: "mixed_membrane_cluster"
    }]
  },
  pulse: { active: false },
  promptStack: {},
  interactionInspectionFocus: {},
  targetFocus: { suppressTargeting: true },
  targeting: { targetId: "none" }
};

const routeSystem = new GraveMemoryRouteSystem({
  recipeDataSystem,
  chemObjectSystem: fakeChemObjectSystem,
  scene,
  playerRoot,
  frameState
});
routeSystem.init();
assert.equal(routeSystem.root.visible, false);
assert.equal(frameState.graveMemoryRoute.active, false);
assert.equal(frameState.graveMemoryRoute.safeTransferRequired, true);
assert.equal(frameState.graveMemoryRoute.oldCompatibilitySystemsActivated, false);

const entryPosition = playerRoot.position.clone();
routeSystem.onRuntimeMount(frameState);
assert.equal(routeSystem.root.visible, true);
assert(playerRoot.position.equals(entryPosition), "Route mount must not relocate the player.");
assert.equal(frameState.graveMemoryRoute.presentationOwner, "GraveMemoryRouteSystem");
assert.equal(frameState.graveMemoryRoute.crossingOwner, "GateSystem");
assert.equal(frameState.graveMemoryRoute.directCellMutation, false);

let pulseSequence = 0;
const tickRoute = (dt = 0.05) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  routeSystem.update(dt, frameState);
};
const pulseObject = (id) => {
  const item = routeSystem.objectItems.get(id);
  assert(item, `Missing authored Grave object ${id}.`);
  playerRoot.position.copy(item.root.position);
  pulseSequence += 1;
  frameState.input = {
    ...frameState.input,
    pulsePressed: true,
    pulseEventId: pulseSequence,
    stabilizeHeld: false,
    absorbHeld: false
  };
  tickRoute();
  frameState.input.pulsePressed = false;
  tickRoute();
};

pulseObject("old_core_husk_memory_001");
pulseObject("residue_silt_cloud_001");
playerRoot.position.copy(routeSystem.objectItems.get("residue_silt_cloud_001").root.position);
frameState.input.stabilizeHeld = true;
for (let index = 0; index < 14; index += 1) tickRoute(0.1);
frameState.input.stabilizeHeld = false;
tickRoute();
assert.equal(frameState.graveMemoryRoute.memorySiltStabilized, true);

pulseObject("scar_lock_plate_001");
pulseObject("inheritance_seed_remnant_001");
assert.equal(frameState.graveMemoryRoute.readCount, 4);
assert.equal(frameState.graveMemoryRoute.safeTransferReady, true);
assert.equal(
  frameState.graveMemoryRoute.completed,
  false,
  "The four retained observations must not complete the consequence circuit."
);
assert.equal(frameState.graveMemoryRoute.returnFoldReady, false);
assert.equal(frameState.graveMemoryRoute.graveMemoryImprintCommitted, false);

const protectedHusk = routeSystem.objectItems.get("old_core_husk_memory_001");
playerRoot.position.copy(protectedHusk.root.position);
frameState.input = {
  ...frameState.input,
  absorbHeld: true,
  stabilizeHeld: false
};
tickRoute(0.1);
frameState.input.absorbHeld = false;
tickRoute(0.1);
assert(frameState.graveMemoryRoute.residueRecoilRisk > 0.18);
assert(frameState.graveMemoryRoute.traceIntegrity < 1);
assert.equal(frameState.graveMemoryRoute.riskEventCount, 1);
assert.equal(frameState.graveMemoryRoute.protectedAbsorbAttemptCount, 1);
assert.equal(frameState.graveMemoryRoute.safeTransferReady, false);
assert.equal(frameState.graveMemoryRoute.failureRecoverable, true);
assert(frameState.physicalFeel.viscosity > graveCell.physicalFeel.viscosity);
assert(frameState.physicalFeel.pressure > graveCell.physicalFeel.pressure);
assert.equal(protectedHusk.absorbed, false);
assert.equal(protectedHusk.root.userData.absorbed, false);

playerRoot.position.copy(routeSystem.objectItems.get("residue_silt_cloud_001").root.position);
frameState.input.stabilizeHeld = true;
for (let index = 0; index < 14; index += 1) tickRoute(0.1);
frameState.input.stabilizeHeld = false;
tickRoute();
assert(
  frameState.graveMemoryRoute.residueRecoilRisk
    <= frameState.graveMemoryRoute.maximumSafeRecoilRisk
);
assert(
  frameState.graveMemoryRoute.traceIntegrity
    >= frameState.graveMemoryRoute.minimumSafeTraceIntegrity
);
assert.equal(frameState.graveMemoryRoute.residueRecoilRecovered, true);
assert.equal(frameState.graveMemoryRoute.safeTransferReady, true);
assert.equal(frameState.graveMemoryRoute.completed, false);

frameState.input.absorbHeld = true;
let safeTransferTicks = 0;
while (!frameState.graveMemoryRoute.safeMemoryTransferComplete && safeTransferTicks < 30) {
  tickRoute(0.1);
  safeTransferTicks += 1;
}
assert(safeTransferTicks < 30, "Safe trace transfer did not complete within its authored duration.");
assert.equal(frameState.graveMemoryRoute.safeMemoryTransferComplete, true);
assert.equal(frameState.graveMemoryRoute.graveMemoryImprintCommitted, true);
assert.equal(frameState.graveMemoryRoute.memoryThreadRetained, true);
assert.equal(frameState.graveMemoryRoute.completed, true);
assert.equal(routeSystem.memoryThreadRoot.visible, true);
assert.equal(routeSystem.memoryThreadMotes.length, 13);
for (const mote of routeSystem.memoryThreadMotes) {
  assert.notEqual(mote.geometry.type, "TorusGeometry");
}
for (const id of routeRecipe.interaction.protectedObjects) {
  const item = objectItems.get(id);
  assert.equal(item.absorbed, false);
  assert.equal(item.root.userData.absorbed, false);
}

frameState.input.absorbHeld = false;
for (let index = 0; index < 10; index += 1) tickRoute(0.1);
assert.equal(frameState.graveMemoryRoute.returnFoldReady, true);
assert.equal(frameState.graveMemoryRoute.returnFoldVisible, true);
assert.equal(frameState.graveMemoryRoute.newAbilityUnlocks, 0);
assert.equal(frameState.graveMemoryRoute.permanentClass, false);
assert.equal(frameState.graveMemoryRoute.newRouteBranch, false);

const objectiveSystem = new ObjectiveSystem({
  objectiveRegistry: new ObjectiveRegistry(objectives),
  regionRegistry: new RegionRegistry(regions),
  frameState
});
const gateSystem = new GateSystem({
  gateRegistry: new GateRegistry(gates),
  frameState
});
objectiveSystem.update(0, frameState);
assert.equal(
  frameState.firstSliceObjectives.grave_memory_read_and_stabilize.complete,
  true
);
assert.equal(
  frameState.firstSliceObjectives.grave_memory_read_and_stabilize
    .stepState.settled_memory_trace_safely_transferred,
  true
);
assert.equal(
  frameState.firstSliceObjectives.grave_memory_read_and_stabilize
    .stepState.grave_memory_imprint_committed,
  true
);

const protectedSeedRoot = new THREE.Group();
protectedSeedRoot.name = "dormant_seed_nutrient_001";
protectedSeedRoot.userData.absorbed = true;
const protectedSeed = {
  recipe: { id: "dormant_seed_nutrient_001" },
  root: protectedSeedRoot,
  absorbed: true,
  cellId: "CELL_MEMBRANE_NURSERY_001"
};
fakeChemObjectSystem.objects.push(protectedSeed);

const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
const growth = new CoreGrowthSystem({
  recipeDataSystem,
  chemObjectSystem: fakeChemObjectSystem,
  playerRoot,
  frameState,
  embodimentSystem: embodiment
});
growth.init();
for (let index = 0; index < 210; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  growth.update(1 / 60, frameState);
}
assert.equal(frameState.coreGrowth.stageId, "binding_core");
assert.equal(frameState.coreGrowth.graveMemoryImprintCommitted, true);
assert.equal(frameState.coreGrowth.safeMemoryTransferComplete, true);
assert.equal(frameState.coreGrowth.visibleGraveMemoryPearl, true);
assert.deepEqual(frameState.coreGrowth.graveMemoryAbilityUnlocks, []);
assert.equal(frameState.coreGrowth.graveMemoryImprintPermanentClass, false);
assert.equal(frameState.coreEmbodiment.authoredProxyParts.graveMemoryPearls, 3);
assert.equal(frameState.coreEmbodiment.visibleGraveMemoryPearl, true);
const memoryPearls = [
  playerRoot.getObjectByName("player_grave_memory_pearl_1"),
  playerRoot.getObjectByName("player_grave_memory_pearl_2"),
  playerRoot.getObjectByName("player_grave_memory_pearl_3")
];
for (const pearl of memoryPearls) {
  assert(pearl?.visible, "The retained Grave-memory pearl is not visible on the Core body.");
  assert.notEqual(pearl.geometry.type, "TorusGeometry");
  assert.equal(pearl.userData.attachedGrowthAnatomy, true);
  assert(pearl.position.x < 0, "The Grave-memory imprint lost its asymmetric body placement.");
}

playerRoot.position.copy(routeSystem.returnPosition);
tickRoute();
frameState.currentMode = { id: "memory_route_mode", regionId: "grave_memory_route" };
objectiveSystem.update(0, frameState);
frameState.input = {
  ...frameState.input,
  interactPressed: true,
  interactEventId: 1,
  pulsePressed: false,
  absorbHeld: false,
  stabilizeHeld: false
};
const playerBeforeReturn = playerRoot.position.clone();
gateSystem.update(0, frameState);
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert(playerRoot.position.equals(playerBeforeReturn), "Gate-owned return must preserve player position.");
assert.equal(frameState.act1RouteCrossing.owner, "GateSystem");
assert.equal(frameState.act1RouteCrossing.pass, manifest.id);
assert.equal(frameState.act1RouteCrossing.playerRelocated, false);
assert.equal(frameState.act1RouteCrossing.archivedCompatibilityAdapterUsed, false);
assert.equal(frameState.act1RouteHistory.graveReturned, true);
assert.equal(frameState.act1RouteHistory.safeMemoryTransferComplete, true);
assert.equal(frameState.act1RouteHistory.graveMemoryImprintCommitted, true);
assert.equal(frameState.act1RouteHistory.graveResidueRecoilRecovered, true);
assert(frameState.act1RouteHistory.graveRiskEventCount >= 1);

frameState.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
growth.update(1 / 60, frameState);
assert.equal(frameState.coreGrowth.graveRouteReturned, true);

const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 100);
camera.position.set(0.25, 1.6, 7.2);
camera.lookAt(0.1, 0, -2.8);
camera.updateMatrixWorld(true);
scene.add(camera);
frameState.hubInvestigationGameplay = {
  active: true,
  investigationReady: true,
  routeReads: [
    "vascular_route",
    "grave_memory_route",
    "silt_burrow_route"
  ],
  routeReadCount: 3,
  allRoutesRead: true,
  nearestRouteId: "grave_memory_route",
  nearestRouteDistance: 1,
  memoryRead: true,
  returnedToCenter: true
};
frameState.statusPage = { firstHubUseComplete: true };
frameState.signalChorusLayeredInteraction = { completed: true };
frameState.graveRouteLock = { routeLocked: false };
frameState.input.interactPressed = false;
frameState.targetFocus = { suppressTargeting: true };
frameState.targeting = { targetId: "none" };

const hubFoundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  camera,
  playerRoot,
  frameState
});
hubFoundation.init();
for (let index = 0; index < 180; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  hubFoundation.update(1 / 60, frameState);
}
const graveLeaf = playerRoot.parent.getObjectByName("hub_comparison_leaf_grave_memory_route");
assert.equal(frameState.hubChamberFoundation.graveMemoryImprintRecognized, true);
assert.equal(frameState.hubChamberFoundation.returnedMemoryEchoedByExistingCradle, true);
assert.equal(
  frameState.hubChamberFoundation.graveMemoryReflectionMechanism,
  "existing_grave_comparison_leaf_pearl_dark_echo"
);
assert.equal(graveLeaf?.userData.graveMemoryImprintHeld, true);
assert(graveLeaf?.userData.graveMemoryTraceIntegrity >= routeRecipe.interaction.minimumSafeTraceIntegrity);
assert.equal(frameState.hubChamberFoundation.newRouteContentActivated, false);
assert.equal(frameState.hubChamberFoundation.routeActivated, false);

console.log(`HC-010B Grave Memory Safe Transfer + Retained Imprint retained by ${manifest.id}.`);
