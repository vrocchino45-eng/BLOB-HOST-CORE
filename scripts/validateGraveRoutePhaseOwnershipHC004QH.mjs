import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { GraveArrivalReadabilitySystem } from "../src/morph/GraveArrivalReadabilitySystem.js";
import { GraveReadBeforeAbsorbSystem } from "../src/morph/GraveReadBeforeAbsorbSystem.js";
import { GraveLoopStabilitySystem } from "../src/morph/GraveLoopStabilitySystem.js";
import { GraveExitReadinessSystem } from "../src/morph/GraveExitReadinessSystem.js";
import { GraveScarMemorySeamArrivalSystem } from "../src/morph/GraveScarMemorySeamArrivalSystem.js";
import { GraveSeamContinuityMicroExitSystem } from "../src/morph/GraveSeamContinuityMicroExitSystem.js";
import { GraveBedPostSeamResponseSystem } from "../src/morph/GraveBedPostSeamResponseSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGraveRoutePhaseOwnershipHC004QH] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const microExitRecipe = readJson("public/data/morph/graveSeamContinuityMicroExitRecipes.json")[0];
const postSeamRecipe = readJson("public/data/morph/graveBedPostSeamResponseRecipes.json")[0];
const seamArrivalPlan = readJson("public/data/planning/graveScarMemorySeamRuntimeArrival_HC004M.json");
const targetRules = readJson("public/data/targeting/targetFocusRules.json");
const chemRecipes = readJson("public/data/chemistry/chemObjectRecipes.json");

assert(["HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QH.");
assert(["0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), "package must identify 0.0.71 or 0.0.72.");
assert(
  manifest.runtimeActivated?.graveRoutePhaseOwnershipRepair === "HC004QH_GRAVE_ROUTE_PHASE_OWNERSHIP_REPAIR",
  "manifest must identify the phase-ownership repair."
);

const GRAVE = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const SEAM = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const objectIds = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001",
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];
const recipeById = new Map(chemRecipes.map((entry) => [entry.id, entry]));
const positions = {
  old_core_husk_memory_001: [1.2, 0, 0],
  residue_silt_cloud_001: [0.6, 0, 0],
  scar_lock_plate_001: [1.6, 0, 0],
  inheritance_seed_remnant_001: [2.0, 0, 0],
  scar_memory_seam_thread_001: [0.7, 0, 0],
  residue_stitch_lattice_001: [1.0, 0, 0],
  echo_husk_imprint_001: [1.3, 0, 0],
  closed_inheritance_suture_001: [1.6, 0, 0]
};
const seamIds = new Set([
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
]);
const objects = objectIds.map((id) => {
  const recipe = recipeById.get(id);
  assert(recipe, `missing chemistry recipe ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...positions[id]);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id, absorbed: false };
  return {
    recipe,
    root: rootObject,
    cellId: seamIds.has(id) ? SEAM : GRAVE,
    absorbed: false
  };
});

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const visualComposer = { composedObjects: [], compose: () => new THREE.Group() };
const recipeDataSystem = {
  data: {
    graveArrivalReadability: {},
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

const baseFrameState = () => ({
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: GRAVE,
  graveRouteMorph: { completed: true, phase: "completed_in_grave_memory_residue_bed" },
  graveScarMemorySeamRuntimeArrival: { active: false, progress: 0, completed: false },
  graveScarMemorySeamFirstRead: { active: false, firstReadComplete: false, currentFocus: "none" },
  graveSeamContinuityMicroExit: { active: false, completed: false, handoffComplete: false },
  graveBedPostSeamResponse: { active: false, completed: false },
  graveArrivalReadability: { active: true, readConfidence: 0.8 },
  graveReadBeforeAbsorb: { active: true, loopId: "GRAVE_READ_BEFORE_ABSORB_LOOP_001" },
  graveLoopStability: { active: true, planningReady: true, sourceLoop: "GRAVE_READ_BEFORE_ABSORB_LOOP_001" },
  graveExitReadiness: { active: true, markerVisible: true, safeMemoryTransferComplete: true },
  graveRouteContinuityPlanning: { active: true, plannedFutureCellId: SEAM },
  graveScarMemorySeamArrivalPlanning: { active: true, plannedArrivalCell: SEAM },
  input: { pulsePressed: false, pulseEventId: 1, pulseSource: "none", absorbHeld: false },
  inputActionAudit: { eventId: 1, consumedBy: "none", result: "none" },
  pulse: { affectedObjects: [] },
  targeting: { targetId: "residue_silt_cloud_001" },
  selectedObject: { recipeId: "residue_silt_cloud_001" },
  targetFocus: { preferredTargetId: "residue_silt_cloud_001", provider: "TARGET_FOCUS_GRAVE_MEMORY_001" },
  chemObjectState: {},
  playerComposition: {},
  chemistry: {},
  physicalFeel: {},
  promptStack: {},
  lockState: {},
  nonFatalSystemErrors: []
});

// 1. Merely standing in the Grave bed must not fabricate a completed return.
const initialState = baseFrameState();
const freshMicroExit = new GraveSeamContinuityMicroExitSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState: initialState
});
freshMicroExit.init();
freshMicroExit.update(1 / 60, initialState);
assert(initialState.graveSeamContinuityMicroExit.active === false, "fresh Grave-bed presence must not activate the seam micro-exit.");
assert(initialState.graveSeamContinuityMicroExit.completed === false, "fresh Grave-bed presence must not publish completed=true.");
assert(initialState.graveSeamContinuityMicroExit.progress === 0, "fresh Grave-bed presence must keep micro-exit progress at zero.");
assert(initialState.graveSeamContinuityMicroExit.stage === "waiting_for_scar_memory_seam_cell", `fresh micro-exit stage must wait for the seam, got ${initialState.graveSeamContinuityMicroExit.stage}.`);

// 2. The original Grave-arrival layer must release ownership when the seam phase owns the route.
const arrivalReadability = new GraveArrivalReadabilitySystem({
  recipeDataSystem,
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState: initialState
});
const seamOwnedState = baseFrameState();
seamOwnedState.activeCellId = SEAM;
seamOwnedState.graveScarMemorySeamRuntimeArrival = { active: true, progress: 1, completed: true };
assert(arrivalReadability.isGraveArrivalActive(seamOwnedState) === false, "initial Grave arrival must not force the Grave bed after seam arrival completion.");

const readLoop = new GraveReadBeforeAbsorbSystem({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState: seamOwnedState });
const stability = new GraveLoopStabilitySystem({ recipeDataSystem, chemObjectSystem, frameState: seamOwnedState });
const exitReadiness = new GraveExitReadinessSystem({ recipeDataSystem, chemObjectSystem, scene, frameState: seamOwnedState });
assert(readLoop.isActive(seamOwnedState) === false, "initial Grave read loop must yield to seam ownership.");
assert(stability.isActive(seamOwnedState) === false, "Grave stability layer must yield to seam ownership.");
assert(exitReadiness.isActive(seamOwnedState) === false, "Grave exit-readiness layer must yield to seam ownership.");

// 3. Completed seam arrival must retain the seam cell until a real fold-back completes.
const seamArrival = new GraveScarMemorySeamArrivalSystem({
  recipeDataSystem,
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState: seamOwnedState
});
seamArrival.plan = seamArrivalPlan;
seamArrival.completed = true;
seamArrival.progress = 1;
seamArrival.phase = "arrived_in_scar_memory_seam_loop_deferred";
seamOwnedState.graveSeamContinuityMicroExit = { active: false, completed: false, handoffComplete: false };
seamArrival.update(1 / 60, seamOwnedState);
assert(seamOwnedState.activeCellId === SEAM, "completed seam arrival must retain the seam cell before fold-back.");
assert(seamOwnedState.graveScarMemorySeamRuntimeArrival.active, "seam arrival must remain the live phase before fold-back.");
assert(!seamOwnedState.graveScarMemorySeamRuntimeArrival.ownershipRelinquished, "seam arrival must not relinquish ownership before fold-back.");

// 4. A real micro-exit completion publishes the durable handoff and returns to the Grave bed.
const foldBackState = seamOwnedState;
foldBackState.frame += 1;
foldBackState.activeCellId = SEAM;
foldBackState.graveScarMemorySeamFirstRead = {
  active: true,
  firstReadComplete: true,
  currentFocus: "closed_inheritance_suture_001",
  nextAction: "Pulse the closed suture."
};
foldBackState.input = { pulsePressed: false, pulseEventId: 2, pulseSource: "none", absorbHeld: false };
foldBackState.targeting = { targetId: "closed_inheritance_suture_001" };
const microExit = new GraveSeamContinuityMicroExitSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState: foldBackState
});
microExit.init();
microExit.started = true;
microExit.active = true;
microExit.phase = "micro_exit_folding_back_to_grave_bed";
microExit.progress = 0.99;
microExit.startPosition.copy(playerRoot.position);
microExit.endPosition.copy(playerRoot.position).add(new THREE.Vector3(0, 0, 1));
microExit.update(1, foldBackState);
assert(foldBackState.activeCellId === GRAVE, "completed fold-back must return the active cell to the Grave bed.");
assert(foldBackState.graveSeamContinuityMicroExit.completed, "real fold-back must publish completed=true.");
assert(foldBackState.graveSeamContinuityMicroExit.handoffComplete, "real fold-back must publish handoffComplete=true.");
assert(foldBackState.graveSeamContinuityMicroExit.active === false, "completed fold-back must relinquish live ownership.");

// 5. The seam arrival yields and the post-seam response takes ownership.
seamArrival.update(1 / 60, foldBackState);
assert(foldBackState.activeCellId === GRAVE, "seam arrival may not overwrite the Grave bed after handoff.");
assert(foldBackState.graveScarMemorySeamRuntimeArrival.active === false, "seam arrival must be inactive after fold-back handoff.");
assert(foldBackState.graveScarMemorySeamRuntimeArrival.ownershipRelinquished, "seam arrival must publish ownershipRelinquished after fold-back.");

const postSeam = new GraveBedPostSeamResponseSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState: foldBackState
});
postSeam.init();
postSeam.update(1 / 60, foldBackState);
assert(foldBackState.graveBedPostSeamResponse.active, "post-seam response must activate from the durable handoff token.");
assert(foldBackState.graveBedPostSeamResponse.currentFocus === "old_core_husk_memory_001", "post-seam response must start on the old husk.");
assert(arrivalReadability.isGraveArrivalActive(foldBackState) === false, "initial Grave arrival must remain inactive after fold-back.");
assert(readLoop.isActive(foldBackState) === false, "initial Grave read loop must remain inactive after fold-back.");
assert(stability.isActive(foldBackState) === false, "initial Grave stability must remain inactive after fold-back.");
assert(exitReadiness.isActive(foldBackState) === false, "initial Grave exit readiness must remain inactive after fold-back.");

const focusRegistry = new TargetFocusRegistry({ recipeDataSystem, frameState: foldBackState });
focusRegistry.init();
focusRegistry.update(1 / 60, foldBackState);
const targeting = new TargetingSystem({ scene, playerRoot, chemObjectSystem, frameState: foldBackState });
targeting.init();
targeting.update(1 / 60, foldBackState);
assert(foldBackState.targetFocus.provider === "GraveBedPostSeamResponseSystem", "post-seam response must own target focus.");
assert(foldBackState.targeting.targetId === "old_core_husk_memory_001", `actual target must be the old husk, got ${foldBackState.targeting.targetId}.`);

const diagnosis = buildRuntimeDiagnosticSummary(foldBackState);
assert(diagnosis.owner === "GraveBedPostSeamResponseSystem", `diagnostic owner must be post-seam response, got ${diagnosis.owner}.`);
assert(diagnosis.expectedTarget === "old_core_husk_memory_001", "diagnostic expected target must be the old husk.");
assert(diagnosis.targetAligned, "post-seam diagnostic target must align.");

console.log("[validateGraveRoutePhaseOwnershipHC004QH] initial Grave, seam retention, real fold-back, old-system release, post-seam ownership, targeting, and diagnostics passed.");
