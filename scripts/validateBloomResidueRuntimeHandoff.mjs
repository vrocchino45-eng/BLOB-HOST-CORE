import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { BloomResidueArrivalSystem } from "../src/morph/BloomResidueArrivalSystem.js";
import { BloomResidueInteractionSystem } from "../src/morph/BloomResidueInteractionSystem.js";
import { GraveRouteMorphSystem } from "../src/morph/GraveRouteMorphSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateBloomResidueRuntimeHandoff] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const packageJson = readJson("package.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemRecipes = readJson("public/data/chemistry/chemObjectRecipes.json");
const bloomLoops = readJson("public/data/morph/bloomResidueInteractionRecipes.json");
const gravePlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const targetRules = readJson("public/data/targeting/targetFocusRules.json");
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const orbiterSource = readText("src/ecology/OrbiterSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

assert(["HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QB or HC-004QC successor.");
assert(["0.0.65", "0.0.66", "0.0.67", "0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(packageJson.version), "package version must preserve HC-004QB or HC-004QC lineage.");
assert(mainSource.includes('buildId: "HC-004QB"') || mainSource.includes('buildId: "HC-004QC"') || mainSource.includes('buildId: "HC-004QD"') || mainSource.includes('buildId: "HC-004QE"') || mainSource.includes('buildId: "HC-004QF"') || mainSource.includes('buildId: "HC-004QG"') || mainSource.includes('buildId: "HC-004QH"') || mainSource.includes('buildId: "HC-004QI"') || mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"'), "runtime entry must report HC-004QB or HC-004QC successor.");
assert(mainSource.includes('buildLabel: "Bloom Residue Runtime Ownership Fix"') || mainSource.includes('buildLabel: "Controller Pulse Input Reliability Fix"') || mainSource.includes('buildLabel: "Bloom Runtime Readout and Pulse Consumption Fix"') || mainSource.includes('buildLabel: "Full Debug Screenshot Diagnostics Pass"') || mainSource.includes('buildLabel: "Bloom-to-Grave Composition Handoff Fix"') || mainSource.includes('buildLabel: "Grave Post-Seam Runtime Ownership Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Phase Ownership Repair"') || mainSource.includes('buildLabel: "Grave Initial Loop Ownership and Instruction Handoff Fix"') || mainSource.includes('buildLabel: "Grave Context Button Transfer Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Lock and Completion Handoff"') || mainSource.includes('buildLabel: "First Route Return Continuity Prototype"') || mainSource.includes('buildLabel: "Signal Chorus Return-State Convergence"') || mainSource.includes('buildLabel: "Signal Chorus Return Readability + Camera-Relative Movement Lock"') || mainSource.includes('buildLabel: "Signal Chorus Combward Pressure Seed"'), "runtime label must match HC-004QB or HC-004QC successor.");

const bloomCell = localCells.find((entry) => entry.id === "CELL_BLOOM_RESIDUE_FORK_001");
const loop = bloomLoops.find((entry) => entry.id === "BLOOM_RESIDUE_LOOP_001");
const gravePlan = gravePlans.find((entry) => entry.id === "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");
assert(bloomCell && loop && gravePlan, "authored Bloom cell/loop/Grave morph plan must exist.");

const recipeById = new Map(chemRecipes.map((entry) => [entry.id, entry]));
const objects = bloomCell.contents.chemObjects.map((id) => {
  const recipe = recipeById.get(id);
  assert(recipe, `missing authored chem object ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...recipe.spawn.position);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id };
  return {
    recipe,
    root: rootObject,
    cellId: bloomCell.id,
    absorbed: false,
    pulseAge: 999
  };
});

const playerRoot = new THREE.Group();
playerRoot.position.set(0, 0, 0);
const scene = new THREE.Scene();
const visualComposer = { composedObjects: [] };
const chemObjectSystem = { objects };
const bloomRule = targetRules.find((entry) => entry.id === "TARGET_FOCUS_BLOOM_RESIDUE_001");
assert(bloomRule, "Bloom target focus rule must exist.");

const recipeDataSystem = {
  data: {
    targetFocusRules: new Map([[bloomRule.id, bloomRule]])
  },
  get(type, id) {
    if (type === "bloomResidueInteractionRecipes" && id === loop.id) return loop;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};

const frameState = {
  runtimeSeconds: 0,
  thirdLocalCellMorph: { completed: true, phase: "completed_in_bloom_residue_fork" },
  graveRouteMorph: { completed: false, progress: 0, phase: "waiting_for_bloom_residue_stability" },
  activeCellId: bloomCell.id,
  input: { pulsePressed: false, absorbHeld: false },
  targeting: { targetId: "none" },
  targetFocus: {},
  selectedObject: null,
  lockState: {},
  playerComposition: { residue: 0.32, seed: 0.42, scar: 0.18, bloom: 0.30, signal: 0.30 },
  chemistry: {},
  physicalFeel: {},
  chemObjectState: { pulseResponse: "none", absorbedObjects: 1 },
  controllerOnboarding: { tuning: { targeting: {} } }
};

const arrival = new BloomResidueArrivalSystem({
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
const interaction = new BloomResidueInteractionSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
const focusRegistry = new TargetFocusRegistry({ recipeDataSystem, frameState });
const targeting = new TargetingSystem({ scene, playerRoot, chemObjectSystem, frameState });
arrival.init();
interaction.init();
focusRegistry.init();
targeting.init();

function tick(pulsePressed = false, dt = 1 / 60) {
  frameState.runtimeSeconds += dt;
  frameState.input.pulsePressed = pulsePressed;
  arrival.update(dt, frameState);
  interaction.update(dt, frameState);
  focusRegistry.update(dt, frameState);
  targeting.update(dt, frameState);
}

// Initial runtime ownership must point to the authored first object, not the closer braid.
tick(false);
assert(frameState.bloomResidueArrival.active, "Bloom arrival must be active.");
assert(frameState.bloomResidueInteraction.active, "Bloom interaction must activate immediately.");
assert(frameState.bloomResidueArrival.interactionOwnsFocus === true, "arrival must relinquish focus to interaction.");
assert(frameState.bloomResidueArrival.focusOwner === "bloom_residue_interaction", "arrival state must report interaction ownership.");
assert(frameState.bloomResidueInteraction.currentFocus === "residue_memory_silt_001", "initial interaction focus must be residue memory silt.");
assert(frameState.targetFocus.preferredTargetId === "residue_memory_silt_001", "target focus registry must prefer residue memory silt.");
assert(frameState.targeting.targetId === "residue_memory_silt_001", "actual targeting must select residue memory silt, not seed braid.");

// One successful pulse per authored stage, with immediate same-frame focus recompute.
tick(true);
assert(frameState.bloomResidueInteraction.stageIndex === 1, "one residue pulse must advance to bloom stage.");
assert(frameState.bloomResidueInteraction.currentFocus === "bloom_spore_lantern_001", "residue pulse must hand focus to bloom lantern.");
assert(frameState.targeting.targetId === "bloom_spore_lantern_001", "targeting must follow bloom lantern on the same frame.");

tick(true);
assert(frameState.bloomResidueInteraction.stageIndex === 2, "one bloom pulse must advance to braid stage.");
assert(frameState.bloomResidueInteraction.currentFocus === "seed_choice_braid_001", "bloom pulse must hand focus to seed braid.");
assert(frameState.targeting.targetId === "seed_choice_braid_001", "targeting must follow seed braid on the same frame.");

tick(true);
assert(frameState.bloomResidueInteraction.stageIndex === 3, "one braid pulse must advance to warning stage.");
assert(frameState.bloomResidueInteraction.currentFocus === "overgrowth_warning_tendril_001", "braid pulse must hand focus to warning tendril.");
assert(frameState.targeting.targetId === "overgrowth_warning_tendril_001", "targeting must follow warning tendril on the same frame.");

tick(true);
assert(frameState.bloomResidueInteraction.stage === "fork_stable", "one warning pulse must stabilize the fork.");
assert(frameState.bloomResidueInteraction.preparedForNextBranch === true, "warning pulse must prepare the existing Grave morph.");
assert(frameState.bloomResidueInteraction.currentFocus === "seed_choice_braid_001", "stable fork must return focus to the authored braid hold point.");
assert(frameState.targeting.targetId === "seed_choice_braid_001", "targeting must return to the stable braid hold point.");

// The completion pulse may not also start Grave. A fresh later pulse is required.
const graveMorph = new GraveRouteMorphSystem({
  recipeDataSystem: {},
  visualComposer: {},
  chemObjectSystem: {},
  playerRoot,
  scene,
  frameState
});
graveMorph.plan = gravePlan;
graveMorph.readinessLatched = false;
frameState.input.pulsePressed = true;
let trigger = graveMorph.evaluateTrigger(frameState);
assert(trigger.ready === true, "Grave morph must be ready after Bloom stabilization.");
assert(trigger.start === false, "the warning-completion pulse must not also start the Grave morph.");
assert(trigger.freshPulseRequired === true, "Grave morph must report that a fresh pulse is required.");
graveMorph.readinessLatched = true;
trigger = graveMorph.evaluateTrigger(frameState);
assert(trigger.start === true, "a fresh later pulse on stable Bloom focus must start the existing Grave morph.");

// Data/source ownership checks protect against reintroducing the conflict.
assert(
  !(bloomRule.providers ?? []).some((provider) => provider.statePath === "bloomResidueArrival.focusObjectId"),
  "Bloom targeting must not retain competing arrival-focus ownership."
);
assert(
  (bloomRule.providers ?? []).some((provider) => provider.statePath === "bloomResidueInteraction.currentFocus"),
  "Bloom targeting must follow interaction currentFocus."
);
assert(bloomRule.handoffOwnership === "bloomResidueInteraction.currentFocus", "Bloom target rule must document the sole handoff owner.");
assert(orbiterSource.includes("following_bloom_residue_interaction_focus"), "Guide orbiter must follow Bloom interaction focus.");
assert(guideSource.includes("resolveObjectiveLine"), "Guide prompt must resolve a live Bloom objective.");
assert(guideSource.includes("Target: ${focus}."), "Guide objective must expose the exact current Bloom target.");

const bloomRegistration = runtimeSource.indexOf('register("bloomResidueInteractionSystem"');
const targetRegistration = runtimeSource.indexOf('register("targetFocusRegistry"');
const orbiterRegistration = runtimeSource.indexOf('register("orbiterSystem"');
const guideRegistration = runtimeSource.indexOf('register("guidePromptSystem"');
assert(bloomRegistration >= 0 && targetRegistration > bloomRegistration, "target focus must update after Bloom gameplay state.");
assert(orbiterRegistration > targetRegistration, "Guide orbiter must update after Bloom target focus is resolved.");
assert(guideRegistration > bloomRegistration, "Guide prompts must update after Bloom gameplay state.");

console.log("[validateBloomResidueRuntimeHandoff] Runtime sequence passed: residue -> bloom -> braid -> warning -> fresh-pulse Grave latch.");
