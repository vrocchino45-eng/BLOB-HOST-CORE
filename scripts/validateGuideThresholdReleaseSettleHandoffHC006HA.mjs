import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../src/morph/GuideThresholdLayeredInteractionSystem.js";
import { InputSystem } from "../src/input/InputSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGuideThresholdReleaseSettleHandoffHC006HA] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];
const source = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");

assert([["HC-006HA", "0.0.89"], ["HC-006I", "0.0.90"], ["HC-006IA", "0.0.91"], ["HC-006J", "0.0.92"], ["HC-006JA", "0.0.93"], ["HC-006K", "0.0.94"], ["HC-006KA", "0.0.95"], ["HC-006KB", "0.0.96"], ["HC-006KC", "0.0.97"], ["HC-006KD", "0.0.98"], ["HC-007A", "0.0.99"], ["HC-007B", "0.0.100"], ["HC-007C", "0.0.101"], ["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"]].some(([id, version]) => manifest.id === id && manifest.version === version), "manifest must preserve the HC-006HA repair through HC-006I.");
assert(["0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package must preserve the HC-006HA repair through 0.0.90.");
assert(["HC-006HA", "HC-006IA", "HC-006J", "HC-006JA"].includes(recipe.completion?.repairPass), "recipe must preserve the HC-006HA repair lineage.");
assert(recipe.geometry?.settlePathProgressMin >= 0.8, "late-path settling-rib acceptance must be authored.");
assert(recipe.geometry?.settleCorridorRange > recipe.geometry?.corridorRange, "settle corridor must be wider than the traversal corridor.");
assert(source.includes("this.settleLatched") && source.includes("guide_threshold_release_latched_tissue_settling"), "runtime must latch a valid release.");
assert(source.includes("late_path_rib_corridor"), "runtime must recognize the visible late-path rib zone.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

function createHarness() {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  scene.add(playerRoot);
  const frameState = {
    frame: 1,
    runtimeSeconds: 0,
    activeCellId: "CELL_SCAR_FLOW_FOLD_001",
    localCellMorph: { completed: true },
    secondLocalCellMorph: { started: false, completed: false },
    morphCompletion: { memoryEcho: 0.3, pathConfidence: 0.5, pressureRelief: 0.5, clotWarning: 0.2, stability: 0.2 },
    input: { moveX: 0, moveY: 0, moveZ: 0, pulsePressed: false, pulseEventId: 0, pulseSource: "none", absorbHeld: false, stabilizeHeld: false, resonanceHeld: false },
    inputSource: {},
    inputActionAudit: {},
    playerKinematics: { velocity: { x: 0, y: 0, z: 0 } },
    targeting: { active: false, targetId: "none", targetKind: "none" },
    targetFocus: { provider: "none", ruleId: "none", preferredTargetId: "none" },
    selectedObject: {},
    promptStack: {},
    playtestHud: {},
    nonFatalSystemErrors: [],
    lockState: {},
    inspectionCamera: { available: true, active: true }
  };
  const system = new GuideThresholdLayeredInteractionSystem({ recipeDataSystem, scene, playerRoot, frameState });
  system.init();
  system.stageIndex = 5;
  system.responseProgress = 1;
  system.tissueResponse = 1;
  system.traversalProgress = 1;
  system.resonanceHold = 1;
  system.grammar?.setAuthoredIndex(5, 0, "hc006ha_test_release_stage");
  return { system, playerRoot, frameState };
}

function step(harness, position, { held = false } = {}) {
  const { system, playerRoot, frameState } = harness;
  const previous = playerRoot.position.clone();
  playerRoot.position.copy(position);
  const displacement = playerRoot.position.clone().sub(previous);
  frameState.playerKinematics.velocity = { x: displacement.x * 60, y: displacement.y * 60, z: displacement.z * 60 };
  frameState.input.moveX = Math.abs(displacement.x) > 0.0001 ? Math.sign(displacement.x) : 0;
  frameState.input.moveZ = Math.abs(displacement.z) > 0.0001 ? Math.sign(displacement.z) : 0;
  frameState.input.stabilizeHeld = held;
  frameState.input.resonanceHeld = held;
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  system.update(1 / 60, frameState);
}

// Releasing outside the visible ribs must not silently complete.
{
  const harness = createHarness();
  const endpoint = harness.system.path.getPoint(1);
  const far = endpoint.clone().add(new THREE.Vector3(3.2, 0, 0));
  harness.playerRoot.position.copy(far);
  harness.system.previousPlayerPosition.copy(far);
  for (let i = 0; i < 75; i += 1) step(harness, far, { held: false });
  const state = harness.frameState.guideThresholdLayeredInteraction;
  assert(!state.settleLatched, "release outside the settling zone must not latch.");
  assert(!state.completed, "release outside the settling zone must not complete.");
  assert(state.blocker === "move_within_visible_settling_ribs", `outside-zone blocker must be explicit, got ${state.blocker}.`);
}

// Holding LT in the valid zone must wait for a deliberate release and report it accurately.
{
  const harness = createHarness();
  const endpoint = harness.system.path.getPoint(1);
  harness.playerRoot.position.copy(endpoint);
  harness.system.previousPlayerPosition.copy(endpoint);
  step(harness, endpoint, { held: true });
  const state = harness.frameState.guideThresholdLayeredInteraction;
  assert(!state.settleLatched, "held stabilize must not latch before release.");
  assert(["release_stabilize_inside_settling_ribs", "release_stabilize_to_complete_settle"].includes(state.blocker), `held-zone blocker mismatch: ${state.blocker}.`);
  const expected = new InputSystem().getExpectedAction(harness.frameState);
  assert(expected === "release_stabilize", `expected action must be release_stabilize, got ${expected}.`);
}

// The valid release latches once; ambient flow drift after that cannot strand the settle at 96%.
{
  const harness = createHarness();
  const endpoint = harness.system.path.getPoint(1);
  harness.playerRoot.position.copy(endpoint);
  harness.system.previousPlayerPosition.copy(endpoint);
  step(harness, endpoint, { held: false });
  let state = harness.frameState.guideThresholdLayeredInteraction;
  assert(state.settleLatched, "valid endpoint release must latch immediately.");
  assert(state.settleProgress > 0, "latched release must begin settling.");

  const drifted = endpoint.clone().add(new THREE.Vector3(2.9, 0, 0));
  for (let i = 0; i < 70 && !harness.frameState.guideThresholdLayeredInteraction.completed; i += 1) {
    step(harness, drifted, { held: false });
  }
  state = harness.frameState.guideThresholdLayeredInteraction;
  assert(state.completed && state.transitionReady && state.progress === 1, "latched release must complete despite later ambient drift.");
  assert(state.stage === "guide_threshold_complete", `completion stage mismatch: ${state.stage}.`);
  assert(harness.frameState.nonFatalSystemErrors.length === 0, "repair simulation must remain error free.");
}

console.log("validateGuideThresholdReleaseSettleHandoffHC006HA validation passed.");
