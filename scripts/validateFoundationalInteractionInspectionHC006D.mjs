import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { LayeredInteractionGrammar, FOUNDATIONAL_INTERACTION_STAGE_IDS } from "../src/interaction/LayeredInteractionGrammar.js";
import { InspectionCameraSystem } from "../src/camera/InspectionCameraSystem.js";
import { InspectionOcclusionSystem } from "../src/camera/InspectionOcclusionSystem.js";
import { GameRuntime } from "../src/core/GameRuntime.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFoundationalInteractionInspectionHC006D] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = readJson("public/data/camera/inspectionCameraProfiles.json")[0];
const deprecatedProfile = readJson("public/data/camera/signalChorusInspectionCameraRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const layeredSource = readText("src/morph/SignalChorusLayeredInteractionSystem.js");
const cameraSource = readText("src/camera/InspectionCameraSystem.js");
const occlusionSource = readText("src/camera/InspectionOcclusionSystem.js");
const movementSource = readText("src/player/PlayerMovementController.js");

assert(["HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must preserve HC-006D architecture, got ${manifest.id}.`);
assert(["0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-006D lineage, got ${manifest.version}.`);
assert(["0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-006D lineage, got ${pkg.version}.`);
assert(["HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .some((id) => mainSource.includes(`buildId: "${id}"`)), "runtime identity must report HC-006D or a validated successor.");
assert(profile.id === "FOUNDATIONAL_INSPECTION_CAMERA_HC006D", "foundational inspection profile id mismatch.");
assert(deprecatedProfile.status === "deprecated_compatibility_recipe" && deprecatedProfile.replacedBy === profile.id, "HC-006C camera recipe must be explicitly deprecated and replaced.");
assert(profile.behavior?.reusableFromOpening === true, "inspection profile must be reusable from Surface Wake onward.");
assert(profile.behavior?.persistAcrossCells === true && profile.behavior?.persistWithoutAuthoredFocus === true, "tight view must persist across cells and authored focus loss.");
assert(profile.behavior?.globalToggle === true, "Y/V must be globally available rather than interaction-local.");
assert(profile.behavior?.optional === true && profile.behavior?.forced === false && profile.behavior?.firstPerson === false, "inspection must remain optional close third-person.");
assert(profile.framing?.distance >= 4 && profile.framing?.fieldOfView >= 48, "inspection composition must be pulled back from HC-006C.");
assert(profile.framing?.shoulderOffset > 0 && profile.framing?.maxYawOffset > 0, "over-shoulder framing and orbit constraint must be authored.");
assert(runtimeSource.includes("new InspectionCameraSystem"), "GameRuntime must construct the reusable InspectionCameraSystem.");
assert(runtimeSource.includes("new InspectionOcclusionSystem"), "GameRuntime must construct inspection occlusion support.");
assert(!runtimeSource.includes("new TightInspectionCameraSystem"), "Signal-Chorus-specific camera runtime must no longer own active camera state.");
assert(layeredSource.includes("interactionInspectionFocus"), "Signal Chorus must publish the generic inspection-focus contract.");
assert(layeredSource.includes("new LayeredInteractionGrammar"), "Signal Chorus must use the reusable layered-interaction grammar.");
assert(cameraSource.includes("frameState.interactionInspectionFocus"), "camera availability must read the generic provider contract.");
assert(!cameraSource.includes("signalChorusLayeredInteraction"), "generic camera must not read Signal Chorus state directly.");
assert(occlusionSource.includes("inspection_focus_marker_HC006D") && occlusionSource.includes("inspectionFadeable"), "composition support must include focus marker and fadeable corridor geometry.");
assert(movementSource.includes('movementReference: "camera_relative_free_3d"'), "camera-relative movement must remain intact with explicit vertical traversal.");
assert(movementSource.includes('leftStickUpMeaning: "camera_forward"'), "left-stick up must remain camera-forward.");
assert(FOUNDATIONAL_INTERACTION_STAGE_IDS.join(",") === "unnoticed,approachable,observed,aligned,sustaining,responding,settling,complete", "canonical interaction grammar order changed.");

const grammar = new LayeredInteractionGrammar({
  interactionId: "validator_interaction",
  authoredStages: [
    { id: "approach" },
    { id: "observe" },
    { id: "align" },
    { id: "hold" },
    { id: "settle" },
    { id: "complete" }
  ],
  stageMap: {
    approach: "approachable",
    observe: "observed",
    align: "aligned",
    hold: "sustaining",
    settle: "settling",
    complete: "complete"
  }
});
assert(grammar.current().grammarStage === "approachable", "grammar should begin at the authored approachable stage.");
grammar.advance(1, "observed");
assert(grammar.current().grammarStage === "observed", "grammar advance must preserve authored-to-foundational mapping.");
grammar.setAuthoredIndex(5, 2, "completed");
assert(grammar.snapshot().grammarStage === "complete", "grammar must publish complete state.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.getCounts().inspectionCameraProfiles === 1, "exactly one foundational inspection profile must load.");

const playerRootForCameraSystem = new THREE.Group();
playerRootForCameraSystem.position.set(0, 0, 0);
const frameState = {
  frame: 10,
  runtimeSeconds: 5,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  interactionInspectionFocus: {
    providerId: "validator_provider",
    id: "validator_focus",
    active: true,
    inspectable: true,
    requiredCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    position: { x: 1, y: 0.2, z: -2 },
    distance: 2.2
  },
  input: { toggleInspectionCameraPressed: false },
  lockState: {}
};
const cameraSystem = new InspectionCameraSystem({ recipeDataSystem, frameState, playerRoot: playerRootForCameraSystem });
cameraSystem.init();
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.available && !frameState.inspectionCamera.active, "inspection must be available but never forced.");
frameState.input.toggleInspectionCameraPressed = true;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active && frameState.inspectionCamera.justActivated, "Y/V edge must activate the reusable camera.");
assert(frameState.tightInspectionCamera === frameState.inspectionCamera, "compatibility alias must match foundational camera state.");
frameState.input.toggleInspectionCameraPressed = false;
frameState.interactionInspectionFocus.distance = 7;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active, "leaving authored range must preserve the player-selected tight camera.");
assert(frameState.inspectionCamera.focusMode === "player_forward", "focus loss must fall back to player-forward framing.");
frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active && frameState.inspectionCamera.persistentAcrossCells, "tight camera must persist across active-cell changes.");

const runtime = new GameRuntime({ appRoot: {}, buildId: "HC-006D", buildLabel: "validator" });
runtime.scene = new THREE.Scene();
runtime.playerCore = new THREE.Group();
runtime.playerCore.position.set(0, 0, 0);
runtime.scene.add(runtime.playerCore);
runtime.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
runtime.camera.position.set(0, 2.4, 8.4);
runtime.cameraReadabilitySystem = null;
runtime.inspectionOcclusionSystem = new InspectionOcclusionSystem({ scene: runtime.scene });
runtime.frameState.runtimeSeconds = 20;
runtime.frameState.input = { cameraLookX: 0, cameraLookY: 0, recenterCameraPressed: false, toggleInspectionCameraPressed: false };
runtime.frameState.controllerOnboarding = { tuning: { camera: {
  yawSpeed: 2.25, pitchSpeed: 1.62, pitchMin: -0.34, pitchMax: 0.92,
  defaultDistance: 8.35, followSmoothing: 6.6, manualInputThreshold: 0.035,
  manualOverrideHoldSeconds: 2.2
} } };
runtime.frameState.playerKinematics = { speed: 0, movementReference: "camera_relative_planar" };
runtime.frameState.inspectionCamera = {
  ...frameState.inspectionCamera,
  active: true,
  available: true,
  justActivated: true,
  mode: "foundational_interaction_inspection",
  focusMode: "authored_interaction",
  focusObjectId: "validator_focus",
  focusPosition: { x: 1.05, y: 0.26, z: -1.92 },
  showFocusMarker: true,
  constrainYaw: true,
  distance: 4.55,
  fieldOfView: 52,
  targetBlendTowardFocus: 0.72,
  targetLift: 0.12,
  baseHeight: 0.92,
  pitch: 0.24,
  shoulderOffset: 0.62,
  forwardOffset: 0.18,
  maxYawOffset: 0.58,
  pitchMin: 0.08,
  pitchMax: 0.5,
  blockerOpacity: 0.075,
  ambientDensityScale: 0.36
};
for (let index = 0; index < 120; index += 1) {
  runtime.frameState.runtimeSeconds += 1 / 60;
  runtime.frameState.inspectionCamera.justActivated = index === 0;
  runtime.updateCamera(1 / 60);
}
assert(["foundational_interaction_inspection", "persistent_tight_third_person"].includes(runtime.frameState.cameraControl.mode), "runtime must enter the foundational or persistent tight camera mode.");
assert(runtime.frameState.cameraControl.distance > 3.8 && runtime.frameState.cameraControl.distance < 5.2, `camera distance should settle in the readable tight range, got ${runtime.frameState.cameraControl.distance}.`);
assert(runtime.camera.fov > 49 && runtime.camera.fov < 54, `inspection FOV should settle near 52, got ${runtime.camera.fov}.`);
assert(runtime.cameraPitch >= 0.08 && runtime.cameraPitch <= 0.5, "inspection pitch must remain constrained.");

const focus = new THREE.Vector3(1.05, 0.26, -1.92);
const blockerPosition = runtime.camera.position.clone().lerp(focus, 0.52);
const blockerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7 });
const blocker = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 12), blockerMaterial);
blocker.name = "validator_living_tissue_blocker";
blocker.userData.livingTissue = true;
blocker.userData.inspectionFadeable = true;
blocker.position.copy(blockerPosition);
runtime.scene.add(blocker);
runtime.frameState.runtimeSeconds += 1 / 60;
runtime.updateCamera(1 / 60);
assert(runtime.frameState.inspectionComposition.active, "inspection composition support must activate.");
assert(runtime.frameState.inspectionComposition.focusMarker === "visible_non_targeting", "inspection focus marker must be visible and non-targeting.");
assert(runtime.frameState.inspectionComposition.fadedBlockerCount >= 1, "a corridor blocker must be detected and faded.");
assert(blockerMaterial.opacity <= 0.076, `corridor blocker opacity should be softened, got ${blockerMaterial.opacity}.`);

console.log("validateFoundationalInteractionInspectionHC006D validation passed.");
