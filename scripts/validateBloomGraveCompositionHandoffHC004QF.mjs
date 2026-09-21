import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { BloomResidueInteractionSystem } from "../src/morph/BloomResidueInteractionSystem.js";
import { GraveRouteMorphSystem } from "../src/morph/GraveRouteMorphSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateBloomGraveCompositionHandoffHC004QF] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const cells = readJson("public/data/world/localCellRecipes.json");
const chem = readJson("public/data/chemistry/chemObjectRecipes.json");
const loops = readJson("public/data/morph/bloomResidueInteractionRecipes.json");
const morphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");

assert(["HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QF or HC-004QG successor.");
assert(["0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), "package must identify 0.0.69 or 0.0.70 successor.");

const bloomCell = cells.find((entry) => entry.id === "CELL_BLOOM_RESIDUE_FORK_001");
const graveCell = cells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
const bloomLoop = loops.find((entry) => entry.id === "BLOOM_RESIDUE_LOOP_001");
const gravePlan = morphPlans.find((entry) => entry.id === "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");
assert(bloomCell && graveCell && bloomLoop && gravePlan, "Bloom/Grave authored data must exist.");
assert(bloomLoop.handoffCompositionFloors?.residue >= 0.24, "Bloom completion must publish the authored residue handoff floor.");
assert(bloomLoop.handoffCompositionFloors?.seed >= 0.34, "Bloom completion must publish the authored seed handoff floor.");

const chemById = new Map(chem.map((entry) => [entry.id, entry]));
const objects = bloomCell.contents.chemObjects.map((id) => {
  const recipe = chemById.get(id);
  assert(recipe, `missing Bloom object ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...recipe.spawn.position);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id };
  return { recipe, root: rootObject, cellId: bloomCell.id, absorbed: false };
});

const frameState = {
  frame: 100,
  runtimeSeconds: 10,
  activeCellId: bloomCell.id,
  bloomResidueArrival: { active: true, readyForBloomLoop: true },
  thirdLocalCellMorph: { completed: true, phase: "completed_in_bloom_residue_fork" },
  graveRouteMorph: { completed: false, progress: 0, phase: "waiting_for_bloom_residue_stability" },
  input: { pulsePressed: false, pulseEventId: 80, pulseSource: "none", absorbHeld: false },
  inputActionAudit: { eventId: 80, consumedBy: "BloomResidueInteractionSystem", result: "seed_choice_braid_warmed_handoff_ready" },
  targeting: { targetId: "seed_choice_braid_001" },
  targetFocus: { preferredTargetId: "seed_choice_braid_001", provider: "BloomResidueInteractionSystem" },
  selectedObject: null,
  lockState: {},
  playerComposition: { form: 0.35, flux: 0.31, residue: 0.13, seed: 0.41, scar: 0.15, signal: 0.20 },
  chemObjectState: {},
  bondState: { blockReason: "target_not_safe_to_absorb" },
  playtestHud: { actionHint: "Pulse the stable residue once more." },
  nonFatalSystemErrors: []
};

const recipeDataSystem = {
  get(type, id) {
    if (type === "bloomResidueInteractionRecipes" && id === bloomLoop.id) return bloomLoop;
    if (type === "graveRouteMorphPlans" && id === gravePlan.id) return gravePlan;
    if (type === "localCellRecipes" && id === bloomCell.id) return bloomCell;
    if (type === "localCellRecipes" && id === graveCell.id) return graveCell;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};

const playerRoot = new THREE.Group();
const scene = new THREE.Scene();
const chemObjectSystem = {
  objects,
  spawnCellObjects() { return []; },
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.opacity = opacity;
  },
  setCellObjectVisibility() {}
};

const bloomSystem = new BloomResidueInteractionSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
bloomSystem.init();
bloomSystem.stageIndex = 4;
bloomSystem.residueMemory = 0.60;
bloomSystem.bloomCare = 0.58;
bloomSystem.braidWarmth = 1.00;
bloomSystem.warningRespect = 0.50;
bloomSystem.forkStability = 1.00;
bloomSystem.overgrowthRisk = 0;
bloomSystem.update(1 / 60, frameState);

assert(frameState.bloomResidueInteraction.preparedForNextBranch, "Bloom loop must remain complete.");
assert(frameState.bloomResidueInteraction.compositionHandoffApplied, "Bloom completion must publish that the handoff floor was committed.");
assert(frameState.playerComposition.residue >= 0.24, `residue floor was not committed (${frameState.playerComposition.residue}).`);
assert(frameState.playerComposition.seed >= 0.34, `seed floor was not committed (${frameState.playerComposition.seed}).`);

const visualComposer = {
  composedObjects: [],
  compose({ objectId }) {
    const rootObject = new THREE.Group();
    rootObject.name = objectId;
    rootObject.visible = true;
    this.composedObjects.push({ root: rootObject });
    return rootObject;
  }
};

const graveSystem = new GraveRouteMorphSystem({
  recipeDataSystem,
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
graveSystem.init();
frameState.bloomResidueInteraction = bloomSystem.createState(true);
frameState.input.pulsePressed = false;
graveSystem.update(1 / 60, frameState);

assert(frameState.graveRouteMorph.compositionReady, "Grave morph must accept the completed Bloom composition handoff.");
assert(frameState.graveRouteMorph.triggerReady, "Grave morph must be ready after the completed Bloom handoff.");
assert(frameState.graveRouteMorph.requiredResidue === 0.20, "runtime residue threshold must remain explicit in diagnostics.");
assert(frameState.graveRouteMorph.residueDeficit === 0, "residue deficit must be zero after handoff floor application.");
assert(!graveSystem.started, "completion frame must not also start the Grave morph.");

frameState.frame += 1;
frameState.input = { ...frameState.input, pulsePressed: true, pulseEventId: 81, pulseSource: "gamepad_x_button_2" };
frameState.inputActionAudit = { eventId: 81, source: "gamepad_x_button_2", producedAtFrame: frameState.frame, consumedBy: "none" };
graveSystem.update(1 / 60, frameState);
assert(graveSystem.started, "a fresh later pulse must start the existing no-gate Grave morph.");
assert(frameState.inputActionAudit.consumedBy === "GraveRouteMorphSystem", "Grave morph must own the fresh handoff pulse.");

const blockedFrame = {
  ...frameState,
  input: { ...frameState.input, pulsePressed: false, absorbHeld: false },
  bloomResidueInteraction: { ...frameState.bloomResidueInteraction, active: true, preparedForNextBranch: true },
  graveRouteMorph: {
    planId: gravePlan.id,
    phase: "composition_not_ready_for_grave_memory",
    progress: 0,
    triggerReady: false,
    triggerReason: "composition_not_ready_for_grave_memory",
    nextAction: "residue 0.13/0.20",
    destinationCell: graveCell.id
  },
  bondState: { blockReason: "target_not_safe_to_absorb" },
  nonFatalSystemErrors: []
};
const diagnosis = buildRuntimeDiagnosticSummary(blockedFrame);
assert(diagnosis.blocker === "morph:composition_not_ready_for_grave_memory", "morph prerequisite must outrank passive bond warnings.");
assert(diagnosis.health === "HANDOFF BLOCKED", "diagnostic health must identify a blocked handoff.");

console.log("[validateBloomGraveCompositionHandoffHC004QF] completed Bloom now reaches the fresh-pulse Grave handoff; blocker priority passed.");
