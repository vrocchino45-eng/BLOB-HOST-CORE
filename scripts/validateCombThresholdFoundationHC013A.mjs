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
import { CombThresholdFoundationSystem } from "../src/thresholds/CombThresholdFoundationSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readText = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const successor = manifest.id !== "HC-013A";
const profilePath = manifest.id === "HC-014I" ? "public/data/runtime/act1RuntimeProfile_HC014I.json" : manifest.id === "HC-014G" ? "public/data/runtime/act1RuntimeProfile_HC014G.json" : manifest.id === "HC-014F" ? "public/data/runtime/act1RuntimeProfile_HC014F.json" : manifest.id === "HC-014E" ? "public/data/runtime/act1RuntimeProfile_HC014E.json" : manifest.id === "HC-014D" ? "public/data/runtime/act1RuntimeProfile_HC014D.json" : manifest.id === "HC-014C" ? "public/data/runtime/act1RuntimeProfile_HC014C.json" : manifest.id === "HC-014B" ? "public/data/runtime/act1RuntimeProfile_HC014B.json" : manifest.id === "HC-014A" ? "public/data/runtime/act1RuntimeProfile_HC014A.json" : successor ? "public/data/runtime/act1RuntimeProfile_HC013B.json" : "public/data/runtime/act1RuntimeProfile_HC013A.json";
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson(profilePath);
const recipe = readJson("public/data/thresholds/combThresholdFoundation_HC013A.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visuals = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");

assert(["HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014F" ? "ACT1_RUNTIME_PROFILE_HC014F" : manifest.id === "HC-014E" ? "ACT1_RUNTIME_PROFILE_HC014E" : manifest.id === "HC-014D" ? "ACT1_RUNTIME_PROFILE_HC014D" : manifest.id === "HC-014C" ? "ACT1_RUNTIME_PROFILE_HC014C" : manifest.id === "HC-014B" ? "ACT1_RUNTIME_PROFILE_HC014B" : manifest.id === "HC-014A" ? "ACT1_RUNTIME_PROFILE_HC014A" : successor ? "ACT1_RUNTIME_PROFILE_HC013B" : "ACT1_RUNTIME_PROFILE_HC013A");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : manifest.id === "HC-014G" ? "HC-014G" : manifest.id === "HC-014F" ? "HC-014F" : manifest.id === "HC-014E" ? "HC-014E" : manifest.id === "HC-014D" ? "HC-014D" : manifest.id === "HC-014C" ? "HC-014C" : manifest.id === "HC-014B" ? "HC-014B" : manifest.id === "HC-014A" ? "HC-014A" : successor ? "HC-013B" : "HC-013A");
assert.equal(profile.regions.comb_threshold.modeId, "comb_threshold_mode");
assert.deepEqual(profile.regions.comb_threshold.systemIds, successor
  ? ["combThresholdFoundationSystem", "combThresholdPlayableSystem"]
  : ["combThresholdFoundationSystem"]);
assert.equal(profile.regions.comb_threshold.activeUpdateBudget, successor ? 8 : 7);
assert.equal(profile.combThresholdFoundation.recipeId, recipe.id);
assert.equal(recipe.anatomy.toothStationCount, 12);
assert.equal(recipe.anatomy.filterLobeCount, 6);
assert.equal(recipe.anatomy.retainedRouteImprintFamilies.length, 3);
assert.equal(recipe.apertureDestinationContract.destinationMounted, false);
assert.equal(recipe.apertureDestinationContract.gameplayReady, false);
assert.equal(recipe.apertureDestinationContract.crossable, false);
assert.equal(recipe.constraints.newAbilityUnlocks, 0);
assert.equal(recipe.constraints.newEntities, 0);
assert.equal(recipe.constraints.newBaseVerbs, 0);
assert.equal(recipe.constraints.directGateMutation, false);
assert.equal(recipe.constraints.directActiveCellMutation, false);
assert.equal(regions.some((region) => region.id === "aperture_fields"), ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));

const entryGate = gates.find((gate) => gate.id === "hub_to_comb_threshold");
const returnGate = gates.find((gate) => gate.id === "comb_threshold_to_hub_chamber");
const apertureGate = gates.find((gate) => gate.id === "comb_threshold_to_aperture_fields");
assert.equal(entryGate.wakeCondition, "hubThreeRouteConvergenceCompleted");
assert.equal(entryGate.playableReady, true);
assert.equal(returnGate.allowNoRequirements, true);
assert.equal(returnGate.playableReady, true);
assert.equal(apertureGate.playableReady, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(apertureGate.authoredStatus, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id) ? "foundation_bound_threshold" : "sealed_destination_contract");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visuals);
const playerRoot = new THREE.Group();
const scene = new THREE.Scene();
scene.add(playerRoot);
const hubEntry = new THREE.Vector3(1.05, 0.28, -0.06);
playerRoot.position.copy(hubEntry);

const frameState = {
  buildId: manifest.id,
  buildManifest: manifest,
  frame: 100,
  runtimeSeconds: 3,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: { id: "hub_mode", regionId: "hub_chamber" },
  input: { pulsePressed: true, pulseEventId: 501, interactPressed: false, interactEventId: 0 },
  firstSliceObjectives: {},
  physicalFeel: {
    viscosity: 0.3,
    pressure: 0.2,
    flowVector: { x: 0, y: 0, z: 0 },
    boundaryBehavior: "hub_junction"
  },
  hubChamberFoundation: {
    active: true,
    completed: true,
    routes: [],
    thresholds: [{
      id: "comb_threshold",
      gateId: "hub_to_comb_threshold",
      distanceToPlayer: 0.35
    }]
  },
  act1RouteHistory: {
    pass: manifest.id,
    snapshotVersion: 1,
    graveReturned: true,
    routeStates: {
      grave_memory_route: { completed: true, returned: true, lastCrossingFrame: 10 },
      vascular_route: { completed: true, returned: true, lastCrossingFrame: 20 },
      silt_burrow_route: { completed: true, returned: true, lastCrossingFrame: 30 }
    },
    hubThreeRouteConvergenceCompleted: true,
    hubThreeRouteConvergenceFrame: 40,
    hubThreeRouteConvergenceRouteOrder: ["grave_memory_route", "vascular_route", "silt_burrow_route"],
    hubThreeRouteConvergenceMode: "continuous_spiral_weave",
    hubCombwardBodyReadable: true,
    combThresholdCrossable: true
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
  routeContract: recipeDataSystem.data.act1RouteContracts
});
const combSystem = new CombThresholdFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
combSystem.init();

// GateSystem alone crosses from the completed Hub convergence into Comb.
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "hub_to_comb_threshold");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_COMB_THRESHOLD_FILTER_001");
assert.equal(frameState.act1RouteHistory.combEntered, true);
assert.equal(frameState.act1RouteHistory.combEntryCount, 1);
assert(playerRoot.position.equals(hubEntry), "Hub-to-Comb crossing relocated the Core.");
frameState.input.pulsePressed = false;

modeController.update(0, frameState);
assert.equal(frameState.currentMode.id, "comb_threshold_mode");
assert.equal(frameState.currentMode.regionId, "comb_threshold");
assert.deepEqual(frameState.firstSliceRuntimeMount.regionSystemIds, successor
  ? ["combThresholdFoundationSystem", "combThresholdPlayableSystem"]
  : ["combThresholdFoundationSystem"]);
assert.equal(frameState.firstSliceRuntimeMount.activeUpdateBudget, successor ? 8 : 7);

for (let index = 0; index < 100; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  combSystem.update(1 / 60, frameState);
}
scene.updateMatrixWorld(true);
const foundation = frameState.combThresholdFoundation;
assert.equal(foundation.active, true);
assert.equal(foundation.toothStationCount, 12);
assert.equal(foundation.livingToothCount, 24);
assert.equal(foundation.filterLobeCount, 6);
assert.equal(foundation.retainedRouteImprintFamilyCount, 3);
assert.equal(foundation.apertureDestinationMounted, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(foundation.apertureGameplayReady, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(foundation.apertureCrossable, false);
assert.equal(foundation.apertureDestinationContract.previewOnly, !["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(frameState.physicalFeel.movementBounds.owner, "PlayerMovementController");
assert.equal(frameState.physicalFeel.movementBounds.tuningOwner, "CombThresholdFoundationSystem");
assert.equal(combSystem.root.userData.genericRings, 0);
assert.equal(combSystem.root.userData.triggerMarkers, 0);

// Aperture remains blocked until synthesis even when the HC-014A arrival destination is mounted.
frameState.currentMode = { id: "comb_threshold_mode", regionId: "comb_threshold" };
frameState.input = { pulsePressed: false, pulseEventId: 501, interactPressed: false, interactEventId: 0 };
gateSystem.update(0, frameState);
assert.equal(frameState.firstSliceGates.comb_threshold_to_aperture_fields.destinationMounted, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(frameState.firstSliceGates.comb_threshold_to_aperture_fields.playableReady, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(frameState.firstSliceGates.comb_threshold_to_aperture_fields.crossable, false);
assert.equal(frameState.firstSliceGates.comb_threshold_to_aperture_fields.departureBlockedBy, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id) ? "route_activation_condition_pending" : "destination_mount_missing");

// Entry fold remains a real GateSystem return and preserves the Core position.
playerRoot.position.copy(hubEntry).add(new THREE.Vector3(...recipe.returnFold.position));
frameState.frame += 1;
combSystem.update(1 / 60, frameState);
assert.equal(frameState.combThresholdFoundation.returnFoldReady, true);
const beforeReturn = playerRoot.position.clone();
frameState.input = { pulsePressed: false, pulseEventId: 501, interactPressed: true, interactEventId: 701 };
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "comb_threshold_to_hub_chamber");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert.equal(frameState.act1RouteHistory.combReturned, true);
assert.equal(frameState.act1RouteHistory.combReturnCount, 1);
assert(playerRoot.position.equals(beforeReturn), "Comb-to-Hub return relocated the Core.");

const snapshot = gateSystem.createHistorySnapshot(frameState);
const restoredFrame = { buildId: manifest.id };
gateSystem.restoreHistory(snapshot, restoredFrame);
assert.equal(restoredFrame.act1RouteHistory.hubThreeRouteConvergenceCompleted, true);
assert.equal(restoredFrame.act1RouteHistory.combThresholdCrossable, true);
assert.equal(restoredFrame.act1RouteHistory.combEntered, true);
assert.equal(restoredFrame.act1RouteHistory.combReturned, true);

const source = readText("src/thresholds/CombThresholdFoundationSystem.js");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(source), "Comb presentation directly changes active-cell truth.");
assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(source), "Comb presentation directly changes objective truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(source), "Comb presentation directly changes route history.");
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)/.test(source), "Comb presentation directly moves the Core.");
assert.match(source, /apertureFieldsImplemented: false/);
assert.match(source, /genericRings: 0/);
assert.match(source, /triggerMarkers: 0/);

console.log(`HC-013A Comb Threshold foundation validation passed for ${manifest.id}.`);
