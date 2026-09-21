import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { TightInspectionCameraSystem } from "../src/camera/TightInspectionCameraSystem.js";
import { GameRuntime } from "../src/core/GameRuntime.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusInspectionCameraHC006C] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/camera/signalChorusInspectionCameraRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const inputSource = readText("src/input/InputSystem.js");
const movementSource = readText("src/player/PlayerMovementController.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

assert(manifest.id === "HC-006C", `manifest must identify HC-006C, got ${manifest.id}.`);
assert(manifest.version === "0.0.81", `manifest version must be 0.0.81, got ${manifest.version}.`);
assert(pkg.version === "0.0.81", `package version must be 0.0.81, got ${pkg.version}.`);
assert((mainSource.includes('buildId: "HC-006C"') || mainSource.includes('buildId: "HC-006D"')), "runtime identity must report HC-006C.");
assert(recipe.id === "SIGNAL_CHORUS_TIGHT_INSPECTION_CAMERA_HC006C", "inspection recipe id mismatch.");
assert(recipe.behavior?.optional === true && recipe.behavior?.forced === false, "inspection must be optional and never forced.");
assert(recipe.behavior?.firstPerson === false, "HC-006C must use close third-person rather than forced first-person.");
assert(recipe.behavior?.preserveCameraRelativeMovement === true, "camera-relative movement must remain authored as preserved.");
assert(recipe.behavior?.routeActivated === false && recipe.behavior?.interactionStateChanged === false, "inspection must not change interaction or route state.");
assert(recipe.activation?.controllerButtonIndex === 3 && recipe.activation?.keyboardCode === "KeyV", "Y / V must own the inspection toggle.");
assert(inputSource.includes('event.code === "KeyV"'), "keyboard V toggle must be implemented.");
assert(inputSource.includes("pad.buttons?.[3]"), "controller Y button must be implemented.");
assert(inputSource.includes("toggleInspectionCameraPressed"), "input frame must publish inspection toggle edges.");
assert(runtimeSource.includes("new TightInspectionCameraSystem"), "GameRuntime must construct TightInspectionCameraSystem.");
assert(runtimeSource.includes('register("tightInspectionCameraSystem"'), "GameRuntime must register TightInspectionCameraSystem.");
assert(runtimeSource.indexOf('register("tightInspectionCameraSystem"') > runtimeSource.indexOf('register("signalChorusLayeredInteractionSystem"'), "inspection availability must update after layered interaction state.");
assert(runtimeSource.includes('mode: inspectionActive ? "tight_third_person_inspection" : "player_tethered_orbit"'), "camera runtime must expose reversible modes.");
assert(runtimeSource.includes("alignInspectionCamera(inspection)"), "R3 and activation must support authored inspection reframing.");
assert(runtimeSource.includes("targetBlendTowardFocus"), "tight view must frame between player and interaction focus.");
assert(runtimeSource.includes("inspection.occlusionPullbackScale"), "tight mode must prevent readability pullback from destroying close framing.");
assert(movementSource.includes('movementReference: "camera_relative_free_3d"'), "camera-relative movement implementation must remain intact with explicit vertical traversal.");
assert(movementSource.includes('leftStickUpMeaning: "camera_forward"'), "left-stick up must remain camera-forward.");
assert(hudSource.includes("Y tight view") && hudSource.includes("V tight view"), "HUD must explain both controller and keyboard inspection toggles.");
assert(debugSource.includes("TIGHT INSPECTION CAMERA"), "F1 must expose inspection-camera diagnostics.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.getCounts().signalChorusInspectionCameraRecipes === 1, "exactly one inspection recipe must load.");

const frameState = {
  frame: 100,
  runtimeSeconds: 10,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  signalChorusLayeredInteraction: {
    active: true,
    completed: false,
    stage: "align_with_cadence",
    focusDistance: 2.2
  },
  input: { toggleInspectionCameraPressed: false },
  lockState: {}
};
const system = new TightInspectionCameraSystem({ recipeDataSystem, frameState });
system.init();
system.update(1 / 60, frameState);
assert(frameState.tightInspectionCamera.available, "inspection must become available near the active cadence knot.");
assert(!frameState.tightInspectionCamera.active, "inspection must not enter automatically.");

frameState.input.toggleInspectionCameraPressed = true;
system.update(1 / 60, frameState);
assert(frameState.tightInspectionCamera.active, "one Y/V edge must enter inspection mode.");
assert(frameState.tightInspectionCamera.justActivated, "activation edge must be published for camera alignment.");
assert(frameState.tightInspectionCamera.cameraRelativeMovementPreserved, "active mode must preserve camera-relative movement.");
assert(frameState.tightInspectionCamera.routeActivated === false && frameState.tightInspectionCamera.activeCellChanges === false, "camera toggle must not activate route or cell change.");

frameState.input.toggleInspectionCameraPressed = false;
system.update(1 / 60, frameState);
assert(frameState.tightInspectionCamera.active, "inspection must remain active until explicitly released or auto-exited.");

frameState.input.toggleInspectionCameraPressed = true;
system.update(1 / 60, frameState);
assert(!frameState.tightInspectionCamera.active && frameState.tightInspectionCamera.justDeactivated, "second Y/V edge must return to orbit mode.");

frameState.input.toggleInspectionCameraPressed = false;
frameState.signalChorusLayeredInteraction.focusDistance = 2.0;
system.update(1 / 60, frameState);
frameState.input.toggleInspectionCameraPressed = true;
system.update(1 / 60, frameState);
frameState.input.toggleInspectionCameraPressed = false;
frameState.signalChorusLayeredInteraction.focusDistance = 6.2;
system.update(1 / 60, frameState);
assert(!frameState.tightInspectionCamera.active, "moving beyond auto-exit range must safely release inspection.");
assert(frameState.tightInspectionCamera.lastEvent === "inspection_auto_exit_focus_out_of_range", "auto-exit reason must be visible in diagnostics.");


const runtime = new GameRuntime({ appRoot: {}, buildId: "HC-006C", buildLabel: "validator" });
runtime.playerCore = new THREE.Group();
runtime.playerCore.position.set(0, 0, 0);
runtime.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
runtime.camera.position.set(0, 2.4, 8.4);
runtime.cameraReadabilitySystem = null;
runtime.frameState.runtimeSeconds = 20;
runtime.frameState.input = {
  cameraLookX: 0,
  cameraLookY: 0,
  recenterCameraPressed: false,
  toggleInspectionCameraPressed: false
};
runtime.frameState.controllerOnboarding = {
  tuning: {
    camera: {
      yawSpeed: 2.25,
      pitchSpeed: 1.62,
      pitchMin: -0.34,
      pitchMax: 0.92,
      defaultDistance: 8.35,
      followSmoothing: 6.6,
      manualInputThreshold: 0.035,
      manualOverrideHoldSeconds: 2.2
    }
  }
};
runtime.frameState.playerKinematics = { speed: 0, movementReference: "camera_relative_planar" };
runtime.frameState.tightInspectionCamera = {
  ...frameState.tightInspectionCamera,
  active: true,
  available: true,
  justActivated: true,
  focusPosition: { x: 1.05, y: 0.26, z: -1.92 }
};
for (let index = 0; index < 90; index += 1) {
  runtime.frameState.runtimeSeconds += 1 / 60;
  runtime.frameState.tightInspectionCamera.justActivated = index === 0;
  runtime.updateCamera(1 / 60);
}
assert(runtime.frameState.cameraControl.mode === "tight_third_person_inspection", "GameRuntime must enter tight inspection camera mode.");
assert(runtime.frameState.cameraControl.distance < 4.1, `inspection camera should settle close, got ${runtime.frameState.cameraControl.distance}.`);
assert(runtime.camera.fov < 49, `inspection FOV should tighten below 49 degrees, got ${runtime.camera.fov}.`);
assert(runtime.frameState.cameraControl.cameraRelativeMovementPreserved, "camera control diagnostics must preserve camera-relative movement.");

runtime.frameState.tightInspectionCamera = {
  ...runtime.frameState.tightInspectionCamera,
  active: false,
  available: true,
  justActivated: false,
  justDeactivated: true
};
for (let index = 0; index < 120; index += 1) {
  runtime.frameState.runtimeSeconds += 1 / 60;
  runtime.updateCamera(1 / 60);
}
assert(runtime.frameState.cameraControl.mode === "player_tethered_orbit", "camera must return to orbit mode after inspection release.");
assert(runtime.camera.fov > 58, `orbit FOV should restore toward 60 degrees, got ${runtime.camera.fov}.`);

console.log("validateSignalChorusInspectionCameraHC006C validation passed.");
