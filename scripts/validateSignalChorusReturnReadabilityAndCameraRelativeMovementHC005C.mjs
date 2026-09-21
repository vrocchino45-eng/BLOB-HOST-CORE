import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SignalChorusReturnStateSystem } from "../src/morph/SignalChorusReturnStateSystem.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";
import { MotionSignatureSystem } from "../src/visual/MotionSignatureSystem.js";
import { selectCurrentMorphState } from "../src/morph/MorphStateSelector.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusReturnReadabilityAndCameraRelativeMovementHC005C] ${message}`);
};
const near = (a, b, epsilon = 0.001) => Math.abs(a - b) <= epsilon;

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const returnRecipe = readJson("public/data/morph/signalChorusReturnStateRecipes.json")[0];
const controllerTuning = readJson("public/data/input/controllerOnboardingTuning_HC003I.json");
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const movementSource = readText("src/player/PlayerMovementController.js");
const returnSource = readText("src/morph/SignalChorusReturnStateSystem.js");
const morphSelectorSource = readText("src/morph/MorphStateSelector.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

assert(["HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-005C or HC-005D successor, got ${manifest.id}.`);
assert(["0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-005C lineage, got ${manifest.version}.`);
assert(["0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-005C lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(runtimeSource.includes("camera: this.camera"), "GameRuntime must provide the live camera to PlayerMovementController.");
assert(movementSource.includes("buildCameraRelativeIntent"), "movement controller must build camera-relative intent.");
assert(movementSource.includes('movementReference: "camera_relative_free_3d"'), "movement diagnostics must publish camera-relative 3D mode.");
assert(movementSource.includes("this.cameraForward.y = 0"), "camera pitch must be removed from planar movement.");
assert(controllerTuning.movement?.referenceMode === "camera_relative_free_3d", "controller tuning must author camera-relative movement plus explicit vertical traversal.");
assert(controllerTuning.movement?.cameraPitchAffectsPlanarMovement === false, "camera pitch must not control planar movement.");

assert(returnRecipe.readabilityPass === "HC-005C", "return recipe must identify the HC-005C readability pass.");
assert(returnRecipe.readability?.preserveAuthoredOpacity === true, "readability must preserve authored material opacity.");
assert(returnRecipe.readability?.hazeOpacityCap <= 0.022, "Signal haze must have a low opacity cap.");
assert(returnRecipe.readability?.hazeScale?.[1] <= 0.46, "Signal haze must be vertically compacted.");
assert(returnRecipe.readability?.hazeOffset?.[2] <= -1, "Signal haze must be offset into depth.");
assert(returnSource.includes("setGroupOpacityFactor"), "return owner must use authored-opacity factors rather than absolute opacity.");
assert(returnSource.includes("hc005cAuthoredOpacity"), "return owner must preserve authored opacity diagnostics.");
assert(returnSource.includes("visual_anchor_only_no_target"), "return state must tag a visual anchor without activating targeting.");
assert(morphSelectorSource.includes("RETURN_GRAVE_MEMORY_TO_SIGNAL_CHORUS_001"), "morph diagnostics must describe the return handoff instead of stale Grave morph output.");
assert(debugSource.includes("LS up = camera-forward"), "F1/compact diagnostics must state the new controller orientation.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

function makeVisualRoot(name, opacity) {
  const group = new THREE.Group();
  group.name = name;
  const material = new THREE.MeshBasicMaterial({ transparent: true, opacity });
  material.userData.originalOpacity = opacity;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), material);
  mesh.name = `${name}_mesh`;
  group.add(mesh);
  return { group, material };
}

const graveSurface = makeVisualRoot("grave_memory_residue_bed_surface_001", 0.34);
const graveHaze = makeVisualRoot("grave_memory_silt_haze_001", 0.05);
const signalSurface = makeVisualRoot("signal_chorus_nerve_surface_001", 0.36);
const signalHaze = makeVisualRoot("signal_chorus_soft_haze_001", 0.045);
const anchorRoot = makeVisualRoot("choir_resonance_node_001", 0.7).group;
const graveObject = makeVisualRoot("old_core_husk_memory_001", 0.8).group;

const visualComposer = {
  composedObjects: [graveSurface.group, graveHaze.group, signalSurface.group, signalHaze.group].map((rootObject) => ({ root: rootObject }))
};
const chemObjectSystem = {
  objects: [
    { cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001", root: graveObject, recipe: { id: "old_core_husk_memory_001" }, absorbed: false },
    { cellId: "CELL_SIGNAL_CHORUS_NERVE_001", root: anchorRoot, recipe: { id: "choir_resonance_node_001" }, absorbed: false }
  ],
  setObjectOpacity(rootObject, factor) {
    rootObject.traverse((child) => {
      if (!child.material) return;
      if (!Number.isFinite(child.material.userData.originalOpacity)) child.material.userData.originalOpacity = child.material.opacity ?? 1;
      child.material.transparent = true;
      child.material.opacity = child.material.userData.originalOpacity * factor;
    });
  },
  setCellObjectVisibility(cellId, visible, factor) {
    for (const item of this.objects) {
      if (item.cellId !== cellId) continue;
      item.root.visible = visible;
      this.setObjectOpacity(item.root, factor);
    }
  }
};
const frameState = {
  frame: 5000,
  runtimeSeconds: 201,
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  graveRouteLock: { routeLocked: true, completed: true },
  graveReturnContinuity: {
    active: true,
    completed: true,
    routeAwarenessRestored: true,
    destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001"
  },
  signalChorusReturnState: {},
  chemistry: {},
  physicalFeel: {},
  promptStack: {},
  targeting: { targetId: "inheritance_seed_remnant_001" },
  targetFocus: { suppressTargeting: true },
  selectedObject: { objectId: "inheritance_seed_remnant_001" },
  graveRouteMorph: {
    completed: true,
    progress: 1,
    phase: "completed_in_grave_memory_residue_bed",
    destinationCell: "CELL_GRAVE_MEMORY_RESIDUE_BED_001"
  },
  lockState: {}
};

const returnSystem = new SignalChorusReturnStateSystem({ recipeDataSystem, visualComposer, chemObjectSystem, frameState });
returnSystem.init();
returnSystem.update(1 / 60, frameState);

const expectedHazeOpacity = 0.045 * 0.42;
assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "HC-005B active-cell ownership must remain intact.");
assert(frameState.targeting.targetId === "none", "visual anchor must not reactivate targeting.");
assert(near(signalHaze.material.opacity, expectedHazeOpacity), `haze opacity must preserve authored 0.045 x 0.42; got ${signalHaze.material.opacity}.`);
assert(signalHaze.material.opacity <= returnRecipe.readability.hazeOpacityCap, "haze opacity must respect cap.");
assert(signalHaze.material.opacity < 0.03, "haze must not become an opaque full-screen sphere.");
assert(near(signalSurface.material.opacity, 0.36 * 0.82), "surface opacity must preserve the authored 0.36 base.");
assert(near(signalHaze.material.userData.blobBaseOpacity, expectedHazeOpacity), "camera readability base opacity must be reset to the HC-005C target.");
assert(frameState.signalChorusReturnReadability.foregroundMidgroundBackgroundRestored, "return readability state must be active.");
assert(frameState.signalChorusReturnReadability.anchorVisible, "resonance node must remain a visible no-target anchor.");
assert(anchorRoot.userData.targetingSuppressed === true, "visual anchor must explicitly suppress targeting.");
assert(frameState.lockState.nextIfPasses.includes("HC-005D"), "HC-005C completion must point to HC-005D planning.");

const selectedMorph = selectCurrentMorphState(frameState);
assert(selectedMorph.planId === "RETURN_GRAVE_MEMORY_TO_SIGNAL_CHORUS_001", `stale Grave morph diagnostics remain: ${selectedMorph.planId}.`);
assert(selectedMorph.destinationCell === "CELL_SIGNAL_CHORUS_NERVE_001", "return handoff diagnostics must end at Signal Chorus.");
assert(selectedMorph.phase === "returned_grave_reading_held_at_signal_chorus", "return handoff phase mismatch.");

const animatedHazeRoot = new THREE.Group();
animatedHazeRoot.userData.visualRecipe = "signal_chorus_soft_haze_v01";
const animatedHaze = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial());
animatedHaze.name = "signal_chorus_soft_haze";
animatedHazeRoot.add(animatedHaze);
const motion = new MotionSignatureSystem({ visualComposer: { composedObjects: [{ root: animatedHazeRoot }] }, frameState });
motion.update(1 / 60, frameState);
assert(near(animatedHaze.scale.y, returnRecipe.readability.hazeScale[1], 0.02), "post-return haze must use compact Y scale.");
assert(near(animatedHaze.position.z, returnRecipe.readability.hazeOffset[2]), "post-return haze must be offset into the background.");

const playerRoot = new THREE.Group();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
const movement = new PlayerMovementController({
  playerRoot,
  camera,
  frameState: {},
  localCellRecipe: { physicalFeel: { viscosity: 0, pressure: 0, flowVector: [0, 0, 0] } }
});

camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
movement.buildCameraRelativeIntent({ moveX: 0, moveY: 0, moveZ: -1 }, 0.74);
assert(movement.intent.z < -0.98 && Math.abs(movement.intent.x) < 0.02, `default camera forward must be -Z, got ${movement.intent.toArray()}.`);

camera.position.set(10, 2, 0);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
movement.buildCameraRelativeIntent({ moveX: 0, moveY: 0, moveZ: -1 }, 0.74);
assert(movement.intent.x < -0.98 && Math.abs(movement.intent.z) < 0.02, `camera-orbited forward must rotate to -X, got ${movement.intent.toArray()}.`);
movement.buildCameraRelativeIntent({ moveX: 1, moveY: 0, moveZ: 0 }, 0.74);
assert(movement.intent.z < -0.98 && Math.abs(movement.intent.x) < 0.02, `camera-right at +X view must be -Z, got ${movement.intent.toArray()}.`);

camera.position.set(10, 10, 0);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
movement.buildCameraRelativeIntent({ moveX: 0, moveY: 1, moveZ: -1 }, 0.74);
assert(near(movement.intent.y, 0.74), "trigger/shoulder vertical input must remain world Y.");
assert(near(movement.cameraForward.y, 0), "camera pitch must not leak into planar movement forward.");

console.log("validateSignalChorusReturnReadabilityAndCameraRelativeMovementHC005C validation passed.");
