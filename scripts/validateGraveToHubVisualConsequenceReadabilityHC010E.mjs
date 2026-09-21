import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";
import { GraveMemoryRouteSystem } from "../src/routes/GraveMemoryRouteSystem.js";
import { CoreEmbodimentSystem } from "../src/player/CoreEmbodimentSystem.js";
import { OrbiterSystem } from "../src/ecology/OrbiterSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { ChemistryDebugPanel } from "../src/debug/ChemistryDebugPanel.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const supportedBuilds = new Map([
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
const build = supportedBuilds.get(manifest.id);
assert(build, `HC-010E visual-consequence proof does not recognize successor ${manifest.id}.`);
const profile = readJson(`public/data/runtime/${build.profile}`);
const predecessor = readJson("public/data/runtime/act1RuntimeProfile_HC010E.json");
const routeRecipe = readJson("public/data/routes/graveMemoryRouteCircuit_HC010B.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const graveCell = localCells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
const hubCell = localCells.find((entry) => entry.id === "CELL_SIGNAL_CHORUS_NERVE_001");

assert.equal(manifest.version, build.version);
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, build.profileId ?? `ACT1_RUNTIME_PROFILE_${manifest.id.replace("-", "")}`);
assert.equal(profile.pass, manifest.id);
assert.deepEqual(profile.globalSystemIds, predecessor.globalSystemIds);
assert.deepEqual(profile.sharedSystemIds, predecessor.sharedSystemIds);
assert.deepEqual(profile.dormantCompatibilitySystemIds, predecessor.dormantCompatibilitySystemIds);
assert.equal(profile.globalSystemIds.length, 15);
assert.equal(profile.sharedSystemIds.length, 6);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.deepEqual(
  profile.firstSlicePath.map((regionId) => profile.regions[regionId].activeUpdateBudget),
  [15, 13, 8]
);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.deepEqual(profile.regions.grave_memory_route.systemIds, ["graveMemoryRouteSystem"]);
assert.equal(profile.visualConsequenceReadability.newRegisteredSystemCount, 0);
assert.equal(profile.visualConsequenceReadability.newAbilityUnlocks, 0);
assert.equal(profile.visualConsequenceReadability.newRouteContent, false);
assert.equal(profile.visualConsequenceReadability.mutatesProgression, false);
assert.deepEqual(profile.visualConsequenceReadability.phaseOrder, [
  "recoil_scatter",
  "stabilization_reweave",
  "safe_trace_transfer",
  "retained_memory_imprint"
]);
assert.equal(routeRecipe.visualConsequence.recoilShardCount, 9);
assert.equal(routeRecipe.visualConsequence.recoveryStrandCount, 6);
assert.equal(routeRecipe.visualConsequence.transferThreadMoteCount, 13);
assert.equal(routeRecipe.visualConsequence.objectDefiningRings, false);
assert.equal(routeRecipe.hubReturnPresentation.newRouteContent, false);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return readJson(path.join("public", relative));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
playerRoot.position.set(0.12, 0.2, -4.4);
scene.add(playerRoot);
new ChemObjectVisualComposer().composePlayerSeedCore(playerRoot);

const fakeChemObjectSystem = {
  objects: [],
  spawnCellObjects(cellRecipe) {
    return cellRecipe.contents.chemObjects.map((id) => {
      const rootObject = new THREE.Group();
      rootObject.name = id;
      rootObject.userData = { objectId: id, absorbed: false };
      rootObject.scale.setScalar(1);
      scene.add(rootObject);
      const item = {
        root: rootObject,
        recipe: { id },
        absorbed: false,
        cellId: cellRecipe.id
      };
      this.objects.push(item);
      return item;
    });
  },
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.testOpacity = opacity;
  }
};

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: graveCell.id,
  currentMode: {
    id: "memory_route_mode",
    regionId: "grave_memory_route",
    regionDisplayName: "Grave Memory",
    sceneBehaviorOwner: "GraveMemoryRouteSystem"
  },
  firstSliceRuntimeMount: {
    profileId: profile.id,
    activeRegionId: "grave_memory_route",
    activeSystemIds: [...profile.sharedSystemIds, "graveMemoryRouteSystem"],
    activeSystemCount: 7,
    activeUpdateBudget: 7,
    dormantCompatibilitySystemIds: [...profile.dormantCompatibilitySystemIds]
  },
  runtimeExecution: { executedSystemIds: ["graveMemoryRouteSystem"] },
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
  inputSource: { activeDevice: "keyboard" },
  playerComposition: { form: 0.42, flux: 0.18, scar: 0.08, seed: 0.4, signal: 0.16 },
  playerKinematics: {
    position: { x: playerRoot.position.x, y: playerRoot.position.y, z: playerRoot.position.z },
    velocity: { x: 0, y: 0, z: 0 },
    flowVector: { x: 0.02, y: -0.06, z: -0.1 },
    speed: 0,
    pressure: 0.5,
    viscosity: 0.64,
    boundaryPressure: 0,
    movementReference: "camera_relative_embodied_free_3d"
  },
  nurseryCircuit: {
    agencyProven: true,
    resolvedCycleCount: 1,
    successfulCycleCount: 1,
    failedCycleCount: 0,
    tenderFedCount: 1,
    tenderTrust: 0.78,
    tenderIntegrity: 0.92,
    scarLoad: 0.08,
    lastOutcome: "tender_fed_filtered_matter",
    history: []
  },
  pulse: { active: false },
  promptStack: {},
  interactionInspectionFocus: {},
  targetFocus: { suppressTargeting: true },
  targeting: { targetId: "none" },
  nonFatalSystemErrors: [],
  debugDisplay: { mode: "full" }
};

const routeSystem = new GraveMemoryRouteSystem({
  recipeDataSystem,
  chemObjectSystem: fakeChemObjectSystem,
  scene,
  playerRoot,
  frameState
});
routeSystem.init();
routeSystem.onRuntimeMount(frameState);

const tickRoute = (dt = 0.1) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  routeSystem.update(dt, frameState);
};
let pulseSequence = 0;
const pulseObject = (id) => {
  const item = routeSystem.objectItems.get(id);
  assert(item, `Missing Grave object ${id}.`);
  playerRoot.position.copy(item.root.position);
  frameState.playerKinematics.position = {
    x: playerRoot.position.x,
    y: playerRoot.position.y,
    z: playerRoot.position.z
  };
  pulseSequence += 1;
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId = pulseSequence;
  tickRoute();
  frameState.input.pulsePressed = false;
  tickRoute();
};

pulseObject("old_core_husk_memory_001");
pulseObject("residue_silt_cloud_001");
playerRoot.position.copy(routeSystem.objectItems.get("residue_silt_cloud_001").root.position);
frameState.input.stabilizeHeld = true;
while (!routeSystem.siltStabilized) tickRoute();
frameState.input.stabilizeHeld = false;
tickRoute();
pulseObject("scar_lock_plate_001");
pulseObject("inheritance_seed_remnant_001");
assert.equal(frameState.graveMemoryRoute.readCount, 4);
assert.equal(frameState.graveMemoryRoute.completed, false);

// A protected-remains Absorb must create an outward recoil silhouette without
// consuming or completing anything.
playerRoot.position.copy(routeSystem.objectItems.get("old_core_husk_memory_001").root.position);
frameState.input.absorbHeld = true;
tickRoute();
frameState.input.absorbHeld = false;
tickRoute();
assert.equal(frameState.graveMemoryRoute.visualConsequencePhase, "recoil_scatter");
assert.equal(frameState.graveMemoryRoute.recoilVisualReadable, true);
assert.equal(routeSystem.recoilShards.filter((item) => item.visible).length, 9);
assert.equal(frameState.graveMemoryRoute.protectedObjectsUntouched, true);
assert.equal(frameState.graveMemoryRoute.completed, false);

// Stabilize must visibly reweave the scattered trace before safe transfer can
// resume. Capture the phase before the risk falls back below its threshold.
playerRoot.position.copy(routeSystem.objectItems.get("residue_silt_cloud_001").root.position);
frameState.input.stabilizeHeld = true;
tickRoute();
assert.equal(frameState.graveMemoryRoute.visualConsequencePhase, "stabilization_reweave");
assert.equal(frameState.graveMemoryRoute.stabilizationVisualReadable, true);
assert.equal(routeSystem.recoveryStrands.filter((item) => item.visible).length, 6);
let recoveryGuard = 0;
while (!routeSystem.safeTransferReady() && recoveryGuard < 100) {
  tickRoute();
  recoveryGuard += 1;
}
assert(recoveryGuard < 100, "Stabilize did not recover the safe trace.");
frameState.input.stabilizeHeld = false;
tickRoute();
assert.equal(frameState.graveMemoryRoute.residueRecoilRecovered, true);

// Safe transfer must become one coherent visible thread rather than another
// orbital indicator, then settle into retained meaning.
frameState.input.absorbHeld = true;
tickRoute();
tickRoute();
assert.equal(frameState.graveMemoryRoute.visualConsequencePhase, "safe_trace_transfer");
assert.equal(frameState.graveMemoryRoute.safeTransferVisualReadable, true);
assert.equal(routeSystem.memoryThreadRoot.visible, true);
assert.equal(routeSystem.memoryThreadMotes.length, 13);
while (!routeSystem.safeMemoryTransferComplete) tickRoute();
frameState.input.absorbHeld = false;
while (!routeSystem.returnFoldReady) tickRoute();
tickRoute();
assert.equal(frameState.graveMemoryRoute.visualConsequencePhase, "retained_memory_imprint");
assert(frameState.graveMemoryRoute.retentionVisualStrength > 0.2);
assert.equal(frameState.graveMemoryRoute.consequenceUsesObjectDefiningRings, false);
assert.equal(frameState.graveMemoryRoute.graveMemoryImprintCommitted, true);

frameState.coreGrowth = {
  stageId: "binding_core",
  displayStage: "Binding Core",
  growthProgress: 1,
  chemistryBias: 0,
  biasLabel: "balanced_first_binding",
  visibleShellRestructuring: true,
  graveMemoryImprintCommitted: true,
  graveMemoryTraceIntegrity: frameState.graveMemoryRoute.traceIntegrity,
  graveResidueRecoilRecovered: true,
  permanentClass: false
};
const coreEmbodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
coreEmbodiment.init();
for (let index = 0; index < 90; index += 1) {
  frameState.runtimeSeconds += 1 / 30;
  coreEmbodiment.update(1 / 30, frameState);
}
assert.equal(frameState.coreEmbodiment.visibleGraveMemoryPearl, true);
assert.equal(frameState.coreEmbodiment.memoryImprintLigamentVisible, true);
assert.equal(frameState.coreEmbodiment.authoredProxyParts.graveMemoryPearls, 3);
assert.equal(frameState.coreEmbodiment.authoredProxyParts.graveMemoryAttachmentLigaments, 1);
assert.equal(frameState.coreEmbodiment.memoryImprintOrganCount, 1);
assert.equal(frameState.coreEmbodiment.memoryImprintObjectDefiningRing, false);
assert(coreEmbodiment.memoryPearls.every((pearl) => pearl.visible && pearl.position.x < -0.5));

routeSystem.onRuntimeUnmount(frameState);
playerRoot.position.set(0.12, 0.25, -3.68);
frameState.activeCellId = hubCell.id;
frameState.currentMode = {
  id: "hub_mode",
  regionId: "hub_chamber",
  regionDisplayName: "Hub Chamber",
  sceneBehaviorOwner: "HubMode"
};
frameState.firstSliceRuntimeMount = {
  ...frameState.firstSliceRuntimeMount,
  activeRegionId: "hub_chamber",
  activeSystemIds: [...profile.sharedSystemIds, ...profile.regions.hub_chamber.systemIds],
  activeSystemCount: 8,
  activeUpdateBudget: 8
};
frameState.runtimeExecution = { executedSystemIds: ["orbiterSystem", "hubChamberFoundationSystem"] };
frameState.act1RouteHistory = {
  pass: manifest.id,
  graveEntered: true,
  graveReturned: true,
  graveMemoryImprintCommitted: true,
  safeMemoryTransferComplete: true,
  memoryThreadRetained: true,
  graveTraceIntegrity: frameState.graveMemoryRoute.traceIntegrity,
  graveResidueRecoilRecovered: true,
  graveRiskEventCount: frameState.graveMemoryRoute.riskEventCount
};
frameState.signalChorusLayeredInteraction = { active: true, completed: true };
frameState.hubInvestigationGameplay = {
  active: true,
  investigationReady: true,
  routeReads: ["vascular_route", "grave_memory_route", "silt_burrow_route"],
  routeReadCount: 3,
  routeCount: 3,
  nearestRouteId: "grave_memory_route",
  nearestRouteDistance: 1.8,
  memoryRead: true,
  returnedToCenter: true,
  allRoutesRead: true,
  responseRouteId: "grave_memory_route"
};
frameState.firstSliceGates = {
  hub_to_grave_memory_route: { readable: true, crossable: false }
};
frameState.statusPage = { firstHubUseComplete: true };
frameState.graveRouteLock = { routeLocked: true };
frameState.objectiveState = { id: "grave_memory_read_and_stabilize", progress: 1, complete: true };
frameState.gateState = { id: "grave_memory_to_hub_chamber", status: "complete", readable: true, crossable: false };

const camera = new THREE.PerspectiveCamera(56, 16 / 9, 0.1, 100);
camera.position.set(0.25, 1.6, 7.2);
camera.lookAt(new THREE.Vector3(0.1, 0, -2.8));
scene.add(camera);

const fakeVisualComposer = {
  scene,
  compose({ objectId, position = [0, 0, 0], scale = 1 }) {
    const rootObject = new THREE.Group();
    rootObject.name = objectId;
    rootObject.position.fromArray(position);
    rootObject.scale.setScalar(scale);
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: 0xffd89e })
    );
    rootObject.add(body);
    scene.add(rootObject);
    return rootObject;
  }
};
const orbiterSystem = new OrbiterSystem({
  recipeDataSystem,
  visualComposer: fakeVisualComposer,
  playerRoot,
  chemObjectSystem: fakeChemObjectSystem,
  localCellRecipe: hubCell,
  frameState
});
orbiterSystem.init();
const foundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  camera,
  playerRoot,
  frameState
});
foundation.init();

for (let index = 0; index < 360; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  orbiterSystem.update(1 / 60, frameState);
  coreEmbodiment.update(1 / 60, frameState);
  foundation.update(1 / 60, frameState);
}

const layout = frameState.hubChamberFoundation.graveMemoryConsequenceLayout;
const thresholds = routeRecipe.hubReturnPresentation;
assert.equal(frameState.hubChamberFoundation.graveMemoryTerritoryEchoVisible, true);
assert.equal(frameState.hubChamberFoundation.postRouteCentralCradleQuieted, true);
assert.equal(frameState.hubChamberFoundation.postRouteConsequenceSilhouettesReadable, true);
assert.equal(frameState.hubReadability.returnedConsequenceSilhouettesReadable, true);
assert.deepEqual(frameState.hubChamberFoundation.postRouteLayerHierarchy, [
  "immediate_core_and_guide",
  "objective_grave_echo",
  "background_host_anatomy"
]);
assert.equal(layout.corePearlBodyAttached, true);
assert.equal(layout.corePearlVisible, true);
assert.equal(layout.hubEchoVisible, true);
assert.equal(layout.guidePerchPresent, true);
assert.equal(layout.separatedSilhouettesReadable, true);
assert(layout.playerEchoSeparation >= thresholds.minimumPlayerEchoWorldSeparation);
assert(layout.guideEchoSeparation >= thresholds.minimumGuideEchoWorldSeparation);
assert(layout.guidePlayerSeparation >= thresholds.minimumGuidePlayerWorldSeparation);
assert(layout.playerEchoScreenSeparation >= thresholds.minimumPlayerEchoScreenSeparation);
assert(layout.guideEchoScreenSeparation >= thresholds.minimumGuideEchoScreenSeparation);
assert(layout.guidePlayerScreenSeparation >= thresholds.minimumGuidePlayerScreenSeparation);
assert.equal(frameState.orbiterState.silhouetteLane, "upper_interpreter_lane");
assert.equal(frameState.orbiterState.visualConsequencePerchActive, true);
assert(frameState.orbiterState.guideDistance >= thresholds.minimumGuidePlayerWorldSeparation);
assert.equal(frameState.orbiterState.shimmerActive, false);

// Invoke the exact full F1 composition path that previously threw because
// graveMemoryRoute was referenced outside its declared scope.
const panel = new ChemistryDebugPanel({ frameState });
let fullDiagnostic = "";
assert.doesNotThrow(() => {
  fullDiagnostic = panel.fullText();
});
assert(fullDiagnostic.includes("Health:"));
assert(!fullDiagnostic.includes("Health: ERROR"));
assert(fullDiagnostic.includes("Grave visual:retained_memory_imprint"));
assert(fullDiagnostic.includes("Core pearl:VISIBLE"));
assert(fullDiagnostic.includes("Hub echo:VISIBLE"));
assert(fullDiagnostic.includes("Guide lane:upper_interpreter_lane"));
assert(!fullDiagnostic.includes("nonfatal_error:chemistryDebugPanel"));

console.log(`HC-010E Grave-to-Hub Visual Consequence Readability retained by ${manifest.id}.`);
console.log(
  `  consequence separations world P/E ${layout.playerEchoSeparation.toFixed(3)} G/E ${layout.guideEchoSeparation.toFixed(3)} G/P ${layout.guidePlayerSeparation.toFixed(3)}`
);
console.log(
  `  consequence separations screen P/E ${layout.playerEchoScreenSeparation.toFixed(3)} G/E ${layout.guideEchoScreenSeparation.toFixed(3)} G/P ${layout.guidePlayerScreenSeparation.toFixed(3)}`
);
