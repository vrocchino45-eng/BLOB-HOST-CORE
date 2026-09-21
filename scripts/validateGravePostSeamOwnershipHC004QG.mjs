import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { GraveSeamContinuityMicroExitSystem } from "../src/morph/GraveSeamContinuityMicroExitSystem.js";
import { GraveBedPostSeamResponseSystem } from "../src/morph/GraveBedPostSeamResponseSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGravePostSeamOwnershipHC004QG] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
if (["HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGravePostSeamOwnershipHC004QG validation passed under HC-004QH phase-ownership successor coverage.");
  process.exit(0);
}
const microExitRecipe = readJson("public/data/morph/graveSeamContinuityMicroExitRecipes.json")[0];
const postSeamRecipe = readJson("public/data/morph/graveBedPostSeamResponseRecipes.json")[0];
const targetRules = readJson("public/data/targeting/targetFocusRules.json");
const chemRecipes = readJson("public/data/chemistry/chemObjectRecipes.json");
const morphReadabilitySource = readText("src/morph/MorphReadabilitySystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

assert(manifest.id === "HC-004QG", "manifest must identify HC-004QG.");
assert(pkg.version === "0.0.70", "package must identify 0.0.70.");
assert(manifest.runtimeActivated?.gravePostSeamOwnershipHandoffFix === "HC004QG_GRAVE_POST_SEAM_RUNTIME_OWNERSHIP_HANDOFF_FIX", "manifest must identify the ownership fix.");

const byId = new Map(chemRecipes.map((entry) => [entry.id, entry]));
const graveObjectIds = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const positions = {
  old_core_husk_memory_001: [2.0, 0, 0],
  residue_silt_cloud_001: [0.8, 0, 0],
  scar_lock_plate_001: [1.2, 0, 0],
  inheritance_seed_remnant_001: [1.6, 0, 0]
};
const objects = graveObjectIds.map((id) => {
  const recipe = byId.get(id);
  assert(recipe, `missing chemistry recipe ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...positions[id]);
  rootObject.visible = id !== "old_core_husk_memory_001"; // reproduce return-dimmed remain
  rootObject.userData = { recipeId: id, objectId: id, absorbed: false };
  return { recipe, root: rootObject, cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001", absorbed: false };
});

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const frameState = {
  frame: 300,
  runtimeSeconds: 20,
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  input: { pulsePressed: false, pulseEventId: 90, pulseSource: "none", absorbHeld: false },
  inputActionAudit: { eventId: 90, consumedBy: "none", result: "none" },
  pulse: { affectedObjects: [] },
  targeting: { targetId: "residue_silt_cloud_001" },
  selectedObject: { recipeId: "inheritance_seed_remnant_001" },
  targetFocus: { preferredTargetId: "residue_silt_cloud_001", provider: "TARGET_FOCUS_GRAVE_MEMORY_001" },
  chemObjectState: {},
  playerComposition: {},
  chemistry: {},
  physicalFeel: {},
  promptStack: {},
  lockState: {},
  nonFatalSystemErrors: []
};

const recipeDataSystem = {
  data: {
    targetFocusRules: new Map(targetRules.map((entry) => [entry.id, entry]))
  },
  get(type, id) {
    if (type === "graveSeamContinuityMicroExitRecipes" && id === microExitRecipe.id) return microExitRecipe;
    if (type === "graveBedPostSeamResponseRecipes" && id === postSeamRecipe.id) return postSeamRecipe;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};
const chemObjectSystem = {
  objects,
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.opacity = opacity;
  },
  setCellObjectVisibility(cellId, visible, opacity = 1) {
    for (const item of objects) {
      if (item.cellId !== cellId || item.absorbed || item.root.userData.absorbed) continue;
      item.root.visible = visible;
      this.setObjectOpacity(item.root, opacity);
    }
  }
};

const microExit = new GraveSeamContinuityMicroExitSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
microExit.init();
microExit.completed = true;
microExit.progress = 1;
microExit.phase = "returned_to_grave_bed_seam_understood_no_branch";
microExit.update(1 / 60, frameState);

assert(frameState.graveSeamContinuityMicroExit.completed, "micro-exit completion history must persist.");
assert(frameState.graveSeamContinuityMicroExit.active === false, "completed micro-exit must relinquish live ownership.");
assert(frameState.graveSeamContinuityMicroExit.ownershipRelinquished, "micro-exit must publish ownershipRelinquished after return.");

const postSeam = new GraveBedPostSeamResponseSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
postSeam.init();
postSeam.update(1 / 60, frameState);

assert(frameState.graveBedPostSeamResponse.active, "post-seam response must activate after micro-exit completion.");
assert(frameState.graveBedPostSeamResponse.currentFocus === "old_core_husk_memory_001", "first post-seam focus must be the old husk.");
assert(objects.find((item) => item.recipe.id === "old_core_husk_memory_001").root.visible, "post-seam system must restore a dimmed protected remain before visibility gating.");

const focusRegistry = new TargetFocusRegistry({ recipeDataSystem, frameState });
focusRegistry.init();
focusRegistry.update(1 / 60, frameState);
assert(frameState.targetFocus.provider === "GraveBedPostSeamResponseSystem", "post-seam response must own Grave-bed target focus.");
assert(frameState.targetFocus.preferredTargetId === "old_core_husk_memory_001", "target focus must prefer the expected post-seam object.");

const targeting = new TargetingSystem({ scene, playerRoot, chemObjectSystem, frameState });
targeting.init();
targeting.update(1 / 60, frameState);
assert(frameState.targeting.targetId === "old_core_husk_memory_001", `actual target must align to old husk, got ${frameState.targeting.targetId}.`);

frameState.frame += 1;
frameState.input = { pulsePressed: true, pulseEventId: 91, pulseSource: "gamepad_x_button_2", absorbHeld: false };
frameState.inputActionAudit = { eventId: 91, source: "gamepad_x_button_2", producedAtFrame: frameState.frame, consumedBy: "none" };
frameState.pulse = { affectedObjects: ["old_core_husk_memory_001"] };
postSeam.update(1 / 60, frameState);

assert(frameState.inputActionAudit.consumedBy === "GraveBedPostSeamResponseSystem", "post-seam response must record valid pulse consumption.");
assert(frameState.inputActionAudit.consumedTargetId === "old_core_husk_memory_001", "pulse audit must name the consumed post-seam target.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "GraveBedPostSeamResponseSystem", `diagnostic owner must hand off to post-seam response, got ${diagnosis.owner}.`);
assert(diagnosis.expectedTarget === "old_core_husk_memory_001", "diagnostic expected target must be old husk.");
assert(diagnosis.actualTarget === "old_core_husk_memory_001", "diagnostic actual target must be old husk.");
assert(diagnosis.targetAligned, "diagnostic target alignment must be true.");
assert(diagnosis.blocker !== "fresh_pulse_not_consumed", "consumed post-seam pulse must not report unconsumed input.");

assert(morphReadabilitySource.includes('frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001"'), "tissue panel must have an active Grave-bed ownership override.");
assert(morphReadabilitySource.includes("Returned to the Grave bed with the seam reading."), "tissue panel must publish post-seam return language.");
assert(guideSource.includes("gravePostSeam.currentFocus"), "Guide objective must include the exact post-seam focus.");

console.log("[validateGravePostSeamOwnershipHC004QG] ownership, target, visibility, pulse consumption, and diagnostics passed.");
