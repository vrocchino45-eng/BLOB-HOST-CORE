import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { BloomResidueInteractionSystem } from "../src/morph/BloomResidueInteractionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateBloomRuntimeReadoutHC004QD] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const cells = readJson("public/data/world/localCellRecipes.json");
const chem = readJson("public/data/chemistry/chemObjectRecipes.json");
const loops = readJson("public/data/morph/bloomResidueInteractionRecipes.json");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const morphReadoutSource = readText("src/morph/MorphReadabilitySystem.js");
const graveMorphSource = readText("src/morph/GraveRouteMorphSystem.js");
const mainSource = readText("src/main.js");

assert(["HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QD or HC-004QE successor.");
assert(["0.0.67", "0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), "package must identify 0.0.67 or 0.0.68 successor.");
assert(mainSource.includes('buildId: "HC-004QD"') || mainSource.includes('buildId: "HC-004QE"') || mainSource.includes('buildId: "HC-004QF"') || mainSource.includes('buildId: "HC-004QG"') || mainSource.includes('buildId: "HC-004QH"') || mainSource.includes('buildId: "HC-004QI"') || mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"'), "runtime build ID must preserve HC-004QD or HC-004QE successor.");
assert(mainSource.includes('buildLabel: "Bloom Runtime Readout and Pulse Consumption Fix"') || mainSource.includes('buildLabel: "Full Debug Screenshot Diagnostics Pass"') || mainSource.includes('buildLabel: "Bloom-to-Grave Composition Handoff Fix"') || mainSource.includes('buildLabel: "Grave Post-Seam Runtime Ownership Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Phase Ownership Repair"') || mainSource.includes('buildLabel: "Grave Initial Loop Ownership and Instruction Handoff Fix"') || mainSource.includes('buildLabel: "Grave Context Button Transfer Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Lock and Completion Handoff"') || mainSource.includes('buildLabel: "First Route Return Continuity Prototype"') || mainSource.includes('buildLabel: "Signal Chorus Return-State Convergence"') || mainSource.includes('buildLabel: "Signal Chorus Return Readability + Camera-Relative Movement Lock"') || mainSource.includes('buildLabel: "Signal Chorus Combward Pressure Seed"'), "runtime label must preserve the Bloom fix or HC-004QE successor.");

const cell = cells.find((entry) => entry.id === "CELL_BLOOM_RESIDUE_FORK_001");
const loop = loops.find((entry) => entry.id === "BLOOM_RESIDUE_LOOP_001");
const byId = new Map(chem.map((entry) => [entry.id, entry]));
assert(cell && loop, "Bloom cell and interaction loop must exist.");

const objects = cell.contents.chemObjects.map((id) => {
  const recipe = byId.get(id);
  assert(recipe, `missing Bloom object ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...recipe.spawn.position);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id };
  return { recipe, root: rootObject, cellId: cell.id, absorbed: false };
});

const playerRoot = new THREE.Group();
const scene = new THREE.Scene();
const frameState = {
  frame: 100,
  runtimeSeconds: 1,
  activeCellId: cell.id,
  bloomResidueArrival: { active: true, readyForBloomLoop: true },
  thirdLocalCellMorph: { completed: true, phase: "completed_in_bloom_residue_fork" },
  graveRouteMorph: { completed: false, progress: 0, phase: "waiting_for_bloom_residue_stability" },
  input: { pulsePressed: true, pulseEventId: 7, pulseSource: "gamepad_x_button_2", absorbHeld: false },
  inputActionAudit: { eventId: 7, source: "gamepad_x_button_2", consumedBy: "none", result: "pulse_produced_waiting_for_consumer" },
  targeting: { targetId: "residue_memory_silt_001" },
  selectedObject: null,
  lockState: {},
  playerComposition: {},
  chemObjectState: {}
};
const recipeDataSystem = {
  get(type, id) {
    if (type === "bloomResidueInteractionRecipes" && id === loop.id) return loop;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};
const system = new BloomResidueInteractionSystem({
  recipeDataSystem,
  chemObjectSystem: { objects },
  playerRoot,
  scene,
  frameState
});
system.init();
system.update(1 / 60, frameState);

assert(frameState.inputActionAudit.consumedBy === "BloomResidueInteractionSystem", "Bloom must record pulse consumption.");
assert(frameState.inputActionAudit.consumedTargetId === "residue_memory_silt_001", "audit must record the authored Bloom target.");
assert(frameState.inputActionAudit.result === "residue_memory_read_handoff_ready", "audit must record the Bloom interaction result.");
assert(frameState.bloomResidueInteraction.currentFocus === "bloom_spore_lantern_001", "successful pulse must advance focus in the same frame.");

assert(morphReadoutSource.includes('frameState.activeCellId === "CELL_BLOOM_RESIDUE_FORK_001"'), "tissue readout must explicitly honor active Bloom cell ownership.");
assert(morphReadoutSource.includes('Bloom Residue Fork: stable — deeper tissue can answer.'), "stable Bloom readout must replace Nursery-era text.");
assert(guideSource.includes('graveMorph.nextAction'), "Guide must hand stable Bloom to the existing Grave morph instruction.");
assert(graveMorphSource.includes('consumedBy: "GraveRouteMorphSystem"'), "Grave morph must take audit ownership when it starts.");

console.log("[validateBloomRuntimeReadoutHC004QD] Bloom pulse consumption and readout ownership passed.");
