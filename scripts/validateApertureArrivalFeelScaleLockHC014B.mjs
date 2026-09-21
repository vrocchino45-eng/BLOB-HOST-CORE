import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { ApertureFieldsArrivalSystem } from "../src/fields/ApertureFieldsArrivalSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const readText = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson("public/data/runtime/act1RuntimeProfile_HC014B.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visuals = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const cells = readJson("public/data/world/localCellRecipes.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");

assert.ok(["HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : "0.0.135");
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : "ACT1_RUNTIME_PROFILE_HC014B");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : manifest.id === "HC-014G" ? "HC-014G" : "HC-014B");

const apertureRegion = regions.find((x) => x.id === "aperture_fields");
assert(apertureRegion, "Aperture Fields arrival region missing");
assert.deepEqual(apertureRegion.runtimeCellIds, ["CELL_APERTURE_FIELDS_ARRIVAL_001"]);
assert.equal(apertureRegion.movementMode, "aperture_fields_arrival");
assert.equal(apertureRegion.cameraProfile, "camera_aperture_fields_arrival");
assert.equal(apertureRegion.visualLanguage, "aperture_fields_arrival_shelf");
assert.equal(apertureRegion.gameplayReady, true);
assert.equal(apertureRegion.ecologyGameplayReady, false);
assert.equal(apertureRegion.fullRegionPending, true);

const apertureCell = cells.find((x) => x.id === "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert(apertureCell, "Aperture arrival cell recipe missing");
assert.equal(apertureCell.physicalFeel?.gravityMode, "field_arrival_free_3d");
assert.deepEqual(apertureCell.runtime?.systemIds, ["apertureFieldsArrivalSystem"]);
assert(cameras.some((x) => x.id === "camera_aperture_fields_arrival"));
assert(visuals.some((x) => x.id === "aperture_fields_arrival_shelf"));
assert(objectives.some((x) => x.id === "aperture_fields_arrival_read"));

const mount = profile.regions.aperture_fields;
assert.equal(mount.modeId, "aperture_fields_arrival_mode");
assert.deepEqual(mount.systemIds, ["apertureFieldsArrivalSystem"]);
assert.equal(mount.activeUpdateBudget, 7);
assert.equal(mount.fullEcologyMounted, false);
assert.equal(mount.ecologyGameplayReady, false);

const entryGate = gates.find((x) => x.id === "comb_threshold_to_aperture_fields");
const returnGate = gates.find((x) => x.id === "aperture_fields_to_comb_threshold");
assert(entryGate && returnGate, "Aperture boundary gates missing");
assert.equal(entryGate.runtimeTransitionAdapter, "GateSystem");
assert.equal(entryGate.wakeCondition, "combThresholdPlayableCompleted");
assert.equal(entryGate.playableReady, true);
assert.equal(entryGate.runtimeCompatibilityDestination, "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert.equal(returnGate.runtimeTransitionAdapter, "GateSystem");
assert.equal(returnGate.runtimeCompatibilityDestination, "CELL_COMB_THRESHOLD_FILTER_001");
assert.equal(returnGate.playableReady, true);

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visuals);
const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
playerRoot.position.set(3.2, 0.6, -4.4);
const beforeEntry = playerRoot.position.clone();

const frameState = {
  buildId: manifest.id,
  buildManifest: manifest,
  frame: 100,
  runtimeSeconds: 3,
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  currentMode: { id: "comb_threshold_mode", regionId: "comb_threshold" },
  input: { stabilizeHeld: true, pulsePressed: true, pulseEventId: 501, interactPressed: false, interactEventId: 0 },
  physicalFeel: {},
  combThresholdFoundation: {
    active: true,
    apertureViewOpened: true,
    apertureSealDistance: 0.7,
    apertureSealReadRange: 2.15
  },
  combThresholdPlayable: { challengeComplete: true },
  act1RouteHistory: {
    pass: manifest.id,
    snapshotVersion: 1,
    combThresholdPlayableCompleted: true,
    hubThreeRouteConvergenceCompleted: true,
    routeStates: {}
  }
};

const gateSystem = new GateSystem({ gateRegistry, frameState, regionRegistry, runtimeProfile: profile, routeContract: {} });
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "comb_threshold_to_aperture_fields");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert.equal(frameState.act1RouteHistory.apertureFieldsEntered, true);
assert.equal(frameState.act1RouteHistory.apertureFieldsEntryCount, 1);
assert(playerRoot.position.equals(beforeEntry), "Gate crossing must not relocate the Core");

const modeController = new ModeController({ regionRegistry, cameraProfileRegistry: cameraRegistry, visualLanguageRegistry: visualRegistry, frameState, runtimeProfile: profile });
modeController.update(0, frameState);
assert.equal(frameState.currentMode.id, "aperture_fields_arrival_mode");
assert.equal(frameState.currentMode.regionId, "aperture_fields");
assert.deepEqual(frameState.firstSliceRuntimeMount.regionSystemIds, ["apertureFieldsArrivalSystem"]);
assert.equal(frameState.firstSliceRuntimeMount.activeUpdateBudget, 7);

const apertureSystem = new ApertureFieldsArrivalSystem({ scene, playerRoot, frameState });
apertureSystem.init();
apertureSystem.onRuntimeMount(frameState);
for (let i = 0; i < 100; i += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  apertureSystem.update(1 / 60, frameState);
}
assert.equal(frameState.apertureFieldsArrival.active, true);
assert.equal(frameState.apertureFieldsArrival.fieldScaleMovement, true);
assert.equal(frameState.apertureFieldsArrival.fullEcologyMounted, false);
assert.equal(frameState.apertureFieldsArrival.ecologyGameplayReady, false);
assert.equal(frameState.apertureFieldsArrival.landmarkCount, 3);
assert.equal(frameState.physicalFeel.movementBounds.tuningOwner, "ApertureFieldsArrivalSystem");
assert.equal(frameState.physicalFeel.movementBounds.radii.x, 20.0);
assert.equal(frameState.physicalFeel.movementBounds.radii.y, 8.0);
assert.equal(frameState.physicalFeel.movementBounds.radii.z, 28.0);
assert.equal(frameState.apertureFieldsArrival.scaleLock, "field_volume_not_chamber_strip");
assert.equal(frameState.apertureFieldsArrival.sightlineDepth, 53);
const apertureCamera = cameras.find((x) => x.id === "camera_aperture_fields_arrival");
assert.equal(apertureCamera.distance, 14.8);
assert.equal(apertureCamera.fieldOfView, 72);

// Return fold is a real GateSystem exit and does not move the Core itself.
playerRoot.position.copy(apertureSystem.returnFold);
frameState.frame += 1;
apertureSystem.update(1 / 60, frameState);
assert.equal(frameState.apertureFieldsArrival.returnFoldReady, true);
const beforeReturn = playerRoot.position.clone();
frameState.input = { stabilizeHeld: false, pulsePressed: false, pulseEventId: 501, interactPressed: true, interactEventId: 702 };
gateSystem.update(0, frameState);
assert.equal(frameState.gateState.id, "aperture_fields_to_comb_threshold");
assert.equal(frameState.gateState.status, "crossed_this_frame");
assert.equal(frameState.activeCellId, "CELL_COMB_THRESHOLD_FILTER_001");
assert.equal(frameState.act1RouteHistory.apertureFieldsReturned, true);
assert.equal(frameState.act1RouteHistory.apertureFieldsReturnCount, 1);
assert(playerRoot.position.equals(beforeReturn), "Aperture return GateSystem crossing must not relocate the Core");
const snapshot = gateSystem.createHistorySnapshot(frameState);
const restored = { buildId: manifest.id };
gateSystem.restoreHistory(snapshot, restored);
assert.equal(restored.act1RouteHistory.apertureFieldsEntered, true);
assert.equal(restored.act1RouteHistory.apertureFieldsReturned, true);
assert.equal(restored.act1RouteHistory.apertureFieldsEntryCount, 1);
assert.equal(restored.act1RouteHistory.apertureFieldsReturnCount, 1);

const source = readText("src/fields/ApertureFieldsArrivalSystem.js");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(source), "Aperture presentation directly changes active-cell truth");
assert(!/frameState\.firstSliceObjectives\s*=(?!=)/.test(source), "Aperture presentation directly changes objective truth");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(source), "Aperture presentation directly changes route history");
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)/.test(source), "Aperture presentation directly moves the Core");
assert.match(source, /fullEcologyMounted: false/);
assert.match(source, /ecologyGameplayReady: false/);
assert.match(source, /landmarkCount: landmarkStates\.length/);

console.log("HC-014B Aperture Arrival Feel / Scale Lock validation passed.");
