import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { InspectionCameraSystem } from "../src/camera/InspectionCameraSystem.js";
import { InspectionOcclusionSystem } from "../src/camera/InspectionOcclusionSystem.js";
import { GameRuntime } from "../src/core/GameRuntime.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validatePersistentTightCameraHC006EB] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = readJson("public/data/camera/inspectionCameraProfiles.json")[0];
const cameraSource = readText("src/camera/InspectionCameraSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const occlusionSource = readText("src/camera/InspectionOcclusionSystem.js");

assert(["HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id) && ["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), "manifest identity mismatch.");
assert(["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package identity mismatch.");
assert(profile.behavior?.globalToggle === true, "profile must enable the global Y/V camera toggle.");
assert(profile.behavior?.persistAcrossCells === true, "profile must persist camera selection across cells.");
assert(profile.behavior?.persistWithoutAuthoredFocus === true, "profile must persist without an authored focus.");
assert(profile.behavior?.autoExitOnFocusLoss === false && profile.behavior?.autoExitOutsideRange === false, "focus loss and range changes must not release tight view.");
assert(cameraSource.includes("createPlayerForwardFocus") && cameraSource.includes("tight_camera_persisted_across_cell_change"), "camera system must provide fallback focus and cell persistence.");
assert(!cameraSource.includes("inspection_auto_exit_focus_unavailable"), "old focus-loss auto exit must be removed.");
assert(runtimeSource.includes("inspection.constrainYaw !== false"), "free tight mode must be able to orbit without the authored-focus yaw clamp.");
assert(occlusionSource.includes("inspection.showFocusMarker !== false"), "focus marker must be optional in free tight mode.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const playerRoot = new THREE.Group();
playerRoot.position.set(0.4, 0.2, -1.1);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  interactionInspectionFocus: {
    providerId: "none",
    id: "none",
    active: false,
    inspectable: false,
    distance: Infinity
  },
  cameraControl: { yaw: 0.4 },
  playerKinematics: { cameraRelativeForward: { x: -Math.sin(0.4), y: 0, z: -Math.cos(0.4) } },
  input: { toggleInspectionCameraPressed: false },
  lockState: {}
};

const cameraSystem = new InspectionCameraSystem({ recipeDataSystem, frameState, playerRoot });
cameraSystem.init();
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.available && !frameState.inspectionCamera.active, "tight camera must be globally available but optional.");
assert(frameState.inspectionCamera.focusMode === "player_forward", "no authored focus should use player-forward framing.");

frameState.input.toggleInspectionCameraPressed = true;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active && frameState.inspectionCamera.justActivated, "Y/V must activate tight view without an authored focus.");
assert(frameState.inspectionCamera.mode === "persistent_tight_third_person", "free mode identity mismatch.");
assert(frameState.inspectionCamera.showFocusMarker === false, "free tight mode must not show a fake interaction marker.");

frameState.input.toggleInspectionCameraPressed = false;
frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
frameState.runtimeSeconds += 1 / 60;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active, "tight view must remain active after Surface Wake cell transition.");
assert(frameState.inspectionCamera.focusMode === "player_forward", "Scar Flow without a provider must retain player-forward framing.");
assert(frameState.inspectionCamera.lastEvent === "tight_camera_persisted_across_cell_change", "cell-persistence event must be visible.");

frameState.interactionInspectionFocus = {
  providerId: "validator_scar_focus",
  id: "scar_memory_fleck_validator",
  label: "Scar memory fleck",
  active: true,
  inspectable: true,
  requiredCellId: "CELL_SCAR_FLOW_FOLD_001",
  position: { x: 1.4, y: 0.25, z: -2.2 },
  distance: 2.4
};
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active && frameState.inspectionCamera.focusMode === "authored_interaction", "nearby authored focus must attach without re-toggling.");
assert(frameState.inspectionCamera.showFocusMarker === true, "authored focus should display the non-targeting marker.");

frameState.interactionInspectionFocus.distance = 9;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active, "moving away from authored focus must not zoom back out.");
assert(frameState.inspectionCamera.focusMode === "player_forward", "out-of-range focus must return to player-forward tight framing.");

frameState.input.toggleInspectionCameraPressed = true;
cameraSystem.update(1 / 60, frameState);
assert(!frameState.inspectionCamera.active && frameState.inspectionCamera.justDeactivated, "Y/V must explicitly return to orbit view.");

const runtime = new GameRuntime({ appRoot: {}, buildId: "HC-006EB", buildLabel: "validator" });
runtime.scene = new THREE.Scene();
runtime.playerCore = playerRoot;
runtime.scene.add(playerRoot);
runtime.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
runtime.camera.position.set(0, 2.4, 8.4);
runtime.cameraReadabilitySystem = null;
runtime.inspectionOcclusionSystem = new InspectionOcclusionSystem({ scene: runtime.scene });
runtime.frameState.runtimeSeconds = 12;
runtime.frameState.input = { cameraLookX: 0, cameraLookY: 0, recenterCameraPressed: false };
runtime.frameState.controllerOnboarding = { tuning: { camera: {
  yawSpeed: 2.25,
  pitchSpeed: 1.62,
  pitchMin: -0.34,
  pitchMax: 0.92,
  defaultDistance: 8.35,
  followSmoothing: 6.6,
  manualInputThreshold: 0.035,
  manualOverrideHoldSeconds: 2.2
} } };
runtime.frameState.playerKinematics = { speed: 0, movementReference: "camera_relative_planar" };
runtime.frameState.inspectionCamera = {
  ...frameState.inspectionCamera,
  active: true,
  available: true,
  justActivated: true,
  justFocusChanged: false,
  mode: "persistent_tight_third_person",
  focusMode: "player_forward",
  focusObjectId: "player_forward_tight_camera",
  focusPosition: { x: 0.4, y: 0.48, z: -3.3 },
  distance: 4.25,
  fieldOfView: 52,
  targetBlendTowardFocus: 0.34,
  targetLift: 0.1,
  baseHeight: 0.78,
  pitch: 0.22,
  shoulderOffset: 0.52,
  forwardOffset: 0.08,
  constrainYaw: false,
  pitchMin: -0.08,
  pitchMax: 0.62,
  blockerOpacity: 0.11,
  ambientDensityScale: 0.72,
  showFocusMarker: false,
  cameraRelativeMovementPreserved: true
};

for (let index = 0; index < 120; index += 1) {
  runtime.frameState.runtimeSeconds += 1 / 60;
  runtime.frameState.inspectionCamera.justActivated = index === 0;
  runtime.updateCamera(1 / 60);
}

assert(runtime.frameState.cameraControl.mode === "persistent_tight_third_person", "runtime must retain persistent tight-camera mode.");
assert(runtime.frameState.cameraControl.distance > 3.8 && runtime.frameState.cameraControl.distance < 4.8, `tight distance must settle near 4.25, got ${runtime.frameState.cameraControl.distance}.`);
assert(runtime.camera.fov > 49 && runtime.camera.fov < 54, `tight FOV must settle near 52, got ${runtime.camera.fov}.`);
assert(runtime.frameState.cameraControl.cameraRelativeMovementPreserved, "camera-relative movement must remain preserved.");
assert(runtime.frameState.inspectionComposition.focusMarker === "hidden", "player-forward mode must hide the interaction marker.");

console.log("validatePersistentTightCameraHC006EB validation passed.");
