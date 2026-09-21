import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { SignalChorusArrivalSystem } from "../src/morph/SignalChorusArrivalSystem.js";
import { SignalChorusInteractionSystem } from "../src/morph/SignalChorusInteractionSystem.js";
import { ThirdLocalCellMorphSystem } from "../src/morph/ThirdLocalCellMorphSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusRuntimeHandoff] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const packageJson = readJson("package.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemRecipes = readJson("public/data/chemistry/chemObjectRecipes.json");
const signalLoops = readJson("public/data/morph/signalChorusInteractionRecipes.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const targetRules = readJson("public/data/targeting/targetFocusRules.json");
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const orbiterSource = readText("src/ecology/OrbiterSystem.js");

assert(["HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QA or its HC-004QB successor.");
assert(["0.0.64", "0.0.65", "0.0.66", "0.0.67", "0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(packageJson.version), "package version must preserve HC-004QA or HC-004QB lineage.");
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must report the current manifest id.");
assert(mainSource.includes("buildLabel:"), "runtime entry must expose a build label.");

const signalCell = localCells.find((entry) => entry.id === "CELL_SIGNAL_CHORUS_NERVE_001");
const loop = signalLoops.find((entry) => entry.id === "SIGNAL_CHORUS_LOOP_001");
const thirdPlan = thirdMorphPlans.find((entry) => entry.id === "MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001");
assert(signalCell && loop && thirdPlan, "authored Signal Chorus cell/loop/third morph plan must exist.");

const recipeById = new Map(chemRecipes.map((entry) => [entry.id, entry]));
const objects = signalCell.contents.chemObjects.map((id) => {
  const recipe = recipeById.get(id);
  assert(recipe, `missing authored chem object ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...recipe.spawn.position);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id };
  return {
    recipe,
    root: rootObject,
    cellId: signalCell.id,
    absorbed: false,
    pulseAge: 999
  };
});

const playerRoot = new THREE.Group();
playerRoot.position.set(0, 0, 0);
const scene = new THREE.Scene();
const visualComposer = { composedObjects: [] };
const chemObjectSystem = { objects };
const recipeDataSystem = {
  get(type, id) {
    if (type === "signalChorusInteractionRecipes" && id === loop.id) return loop;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};

const frameState = {
  runtimeSeconds: 0,
  secondLocalCellMorph: { completed: true },
  activeCellId: signalCell.id,
  input: { pulsePressed: false, absorbHeld: false },
  targeting: { targetId: "choir_resonance_node_001" },
  selectedObject: null,
  lockState: {},
  playerComposition: { signal: 0.20, seed: 0.40, scar: 0.10 },
  chemistry: {},
  physicalFeel: {},
  chemObjectState: { pulseResponse: "none" }
};

const arrival = new SignalChorusArrivalSystem({
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
const interaction = new SignalChorusInteractionSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
arrival.init();
interaction.init();

function tick(pulsePressed = false, dt = 1 / 60) {
  frameState.runtimeSeconds += dt;
  frameState.input.pulsePressed = pulsePressed;
  arrival.update(dt, frameState);
  interaction.update(dt, frameState);
}

// The key regression: no hidden arrival metric gate before the first loop pulse.
tick(false);
assert(frameState.signalChorusArrival.active, "arrival must be active in Signal Chorus.");
assert(frameState.signalChorusInteraction.active, "interaction must activate immediately from arrival.active.");
assert(frameState.signalChorusInteraction.currentFocus === "choir_resonance_node_001", "initial interaction focus must be choir node.");
assert(frameState.signalChorusArrival.readyForSignalLoop === false, "test precondition: old hidden arrival metrics are still below readiness.");

// The actual authored four-pulse sequence must execute one step per pulse.
tick(true);
assert(frameState.signalChorusInteraction.stageIndex === 1, "one choir pulse must advance to stage 1.");
assert(frameState.signalChorusInteraction.currentFocus === "listening_pore_membrane_001", "one choir pulse must hand focus to listening pore.");

tick(false);
assert(frameState.signalChorusArrival.interactionOwnsFocus === true, "arrival must relinquish focus after interaction activates.");
assert(frameState.signalChorusArrival.focusOwner === "signal_chorus_interaction", "arrival state must report interaction focus ownership.");
assert(frameState.signalChorusArrival.focusObjectId === "listening_pore_membrane_001", "arrival readout must mirror interaction focus, not choose a competing target.");

tick(true);
assert(frameState.signalChorusInteraction.stageIndex === 2, "one listening-pore pulse must advance to stage 2.");
assert(frameState.signalChorusInteraction.currentFocus === "harmonic_wave_thread_001", "listening-pore pulse must hand focus to harmonic wave.");

tick(true);
assert(frameState.signalChorusInteraction.stageIndex === 3, "one harmonic pulse must advance to stage 3.");
assert(frameState.signalChorusInteraction.currentFocus === "seed_signal_bridge_001", "harmonic pulse must hand focus to seed bridge.");

tick(true);
assert(frameState.signalChorusInteraction.stage === "signal_chorus_tuned", "one bridge pulse must tune the Signal Chorus.");
assert(frameState.signalChorusInteraction.preparedForNextBranch === true, "bridge pulse must prepare the existing Bloom morph.");

// The bridge-completion pulse may not also start the morph. A fresh pulse is required.
const thirdMorph = new ThirdLocalCellMorphSystem({
  recipeDataSystem: {},
  visualComposer: {},
  chemObjectSystem: {},
  playerRoot,
  scene,
  frameState
});
thirdMorph.plan = thirdPlan;
thirdMorph.readinessLatched = false;
frameState.input.pulsePressed = true;
frameState.targeting.targetId = "seed_signal_bridge_001";
let trigger = thirdMorph.evaluateTrigger(frameState);
assert(trigger.ready === true, "third morph must be ready after tuning.");
assert(trigger.start === false, "the bridge-completion pulse must not also start the third morph.");
assert(trigger.freshPulseRequired === true, "third morph must explicitly require a fresh pulse.");
thirdMorph.readinessLatched = true;
trigger = thirdMorph.evaluateTrigger(frameState);
assert(trigger.start === true, "a fresh later bridge pulse must start the existing no-gate morph.");

// Targeting and guide ownership must no longer include the independent arrival focus.
const signalTargetRule = targetRules.find((entry) => entry.id === "TARGET_FOCUS_SIGNAL_CHORUS_001");
assert(signalTargetRule, "Signal Chorus target focus rule must exist.");
assert(
  !(signalTargetRule.providers ?? []).some((provider) => provider.statePath === "signalChorusArrival.focusObjectId"),
  "Signal Chorus targeting must not retain competing arrival-focus ownership."
);
assert(
  (signalTargetRule.providers ?? []).some((provider) => provider.statePath === "signalChorusInteraction.currentFocus"),
  "Signal Chorus targeting must follow interaction currentFocus."
);
assert(orbiterSource.includes("signalLoop.currentFocus"), "Guide orbiter must follow the interaction focus.");

const signalRegistration = runtimeSource.indexOf('register("signalChorusInteractionSystem"');
const orbiterRegistration = runtimeSource.indexOf('register("orbiterSystem"');
const guideRegistration = runtimeSource.indexOf('register("guidePromptSystem"');
assert(signalRegistration >= 0 && orbiterRegistration > signalRegistration, "Guide orbiter must update after Signal Chorus gameplay state.");
assert(guideRegistration > signalRegistration, "Guide prompts must update after Signal Chorus gameplay state.");

console.log("[validateSignalChorusRuntimeHandoff] Runtime sequence passed: choir -> pore -> wave -> bridge -> fresh-pulse morph latch.");
