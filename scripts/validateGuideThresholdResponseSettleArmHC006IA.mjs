import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../src/morph/GuideThresholdLayeredInteractionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGuideThresholdResponseSettleArmHC006IA] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const source = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");

assert([["HC-006IA", "0.0.91"], ["HC-006J", "0.0.92"], ["HC-006JA", "0.0.93"], ["HC-006K", "0.0.94"], ["HC-006KA", "0.0.95"], ["HC-006KB", "0.0.96"], ["HC-006KC", "0.0.97"], ["HC-006KD", "0.0.98"], ["HC-007A", "0.0.99"], ["HC-007B", "0.0.100"], ["HC-007C", "0.0.101"], ["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"]].some(([id, version]) => manifest.id === id && manifest.version === version), "manifest identity mismatch.");
assert(["0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package version mismatch.");
assert(source.includes("this.settleReleaseArmed"), "runtime must retain earned settle release eligibility.");
assert(source.includes("completed_threshold_response_handoff"), "runtime must identify the natural response handoff arm source.");
assert(source.includes("releaseEligible = this.settleZoneReady || this.settleReleaseArmed"), "release must accept either current rib position or the earned response handoff.");

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

// Reproduce the live regression: the traversal is valid, response stage finishes,
// but ambient current has already displaced the player beyond the visible rib corridor.
{
  const harness = createHarness();
  const endpoint = harness.system.path.getPoint(1);
  const drifted = endpoint.clone().add(new THREE.Vector3(2.84, 0, 0));
  harness.playerRoot.position.copy(drifted);
  harness.system.previousPlayerPosition.copy(drifted);
  harness.system.stageIndex = 4;
  harness.system.responseProgress = 0.995;
  harness.system.tissueResponse = 1;
  harness.system.resonanceHold = 1;
  harness.system.traversalProgress = 1;
  harness.system.pathProgress = 1;
  harness.system.grammar?.setAuthoredIndex(4, 0, "hc006ia_natural_response_stage");

  step(harness, drifted, { held: true });
  let state = harness.frameState.guideThresholdLayeredInteraction;
  assert(state.stage === "release_at_settling_point", `must enter release stage, got ${state.stage}.`);
  assert(state.settleReleaseArmed, "natural completed response must arm the settle release.");
  assert(state.settleArmSource === "completed_threshold_response_handoff", `arm source mismatch: ${state.settleArmSource}.`);
  assert(!state.settleZoneReady, "test must remain outside the current rib zone.");

  step(harness, drifted, { held: false });
  state = harness.frameState.guideThresholdLayeredInteraction;
  assert(state.settleLatched, "releasing LT after an earned response handoff must latch despite drift.");
  assert(state.settleLatchSource === "completed_threshold_response_handoff", `latch source mismatch: ${state.settleLatchSource}.`);
  assert(state.settleProgress > 0, "latched release must begin settle progress.");

  for (let i = 0; i < 75 && !harness.frameState.guideThresholdLayeredInteraction.completed; i += 1) {
    step(harness, drifted, { held: false });
  }
  state = harness.frameState.guideThresholdLayeredInteraction;
  assert(state.completed && state.transitionReady && state.progress === 1, "armed release must complete the Guide Threshold handoff.");
  assert(harness.frameState.nonFatalSystemErrors.length === 0, "simulation must remain error free.");
}

// Safety: an artificially forced release stage with no earned traversal remains blocked.
{
  const harness = createHarness();
  const endpoint = harness.system.path.getPoint(1);
  const far = endpoint.clone().add(new THREE.Vector3(3.2, 0, 0));
  harness.playerRoot.position.copy(far);
  harness.system.previousPlayerPosition.copy(far);
  harness.system.stageIndex = 5;
  harness.system.responseProgress = 1;
  harness.system.tissueResponse = 1;
  harness.system.resonanceHold = 1;
  harness.system.traversalProgress = 1;
  harness.system.grammar?.setAuthoredIndex(5, 0, "hc006ia_forced_unarmed_stage");
  for (let i = 0; i < 10; i += 1) step(harness, far, { held: false });
  const state = harness.frameState.guideThresholdLayeredInteraction;
  assert(!state.settleReleaseArmed && !state.settleLatched && !state.completed, "unearned forced stage must remain blocked outside the ribs.");
}

console.log("validateGuideThresholdResponseSettleArmHC006IA validation passed.");
