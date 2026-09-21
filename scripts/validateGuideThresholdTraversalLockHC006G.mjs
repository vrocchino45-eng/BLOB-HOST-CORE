import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../src/morph/GuideThresholdLayeredInteractionSystem.js";
import { InputSystem } from "../src/input/InputSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGuideThresholdTraversalLockHC006G] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];
const source = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");

assert(["HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id) && ["0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), "manifest must preserve the HC-006G traversal lock through HC-006H.");
assert(["0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package must preserve the HC-006G traversal lock through HC-006H.");
assert(recipe.lockPass === "HC-006G", "Guide Threshold recipe must record the HC-006G lock pass.");
assert(recipe.geometry.corridorRange > 0 && recipe.geometry.assistedCorridorRange > recipe.geometry.corridorRange, "corridor and non-automatic assist ranges are required.");
assert(recipe.geometry.requiredTraversalProgress >= 0.75, "physical traversal must be required.");
assert(source.includes("projectToPath(position)") && source.includes("localPathDirectionDot"), "runtime must use local curved-path direction.");
assert(source.includes("held && moving && aligned && this.withinPathCorridor"), "sustain must require held input, motion, alignment, and corridor presence.");
assert(!source.includes("const travelScale = moving && aligned ? 1 : 0.28"), "time-only off-alignment traversal fallback must be removed.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SCAR_FLOW_FOLD_001",
  localCellMorph: { completed: true },
  secondLocalCellMorph: { started: false, completed: false },
  morphCompletion: { memoryEcho: 0, pathConfidence: 0, pressureRelief: 0, clotWarning: 0.28, stability: 0.2 },
  input: { moveX: 0, moveZ: 0, pulsePressed: false, pulseEventId: 0, pulseSource: "none", absorbHeld: false, resonanceHeld: false },
  inputSource: { contextButtonDown: false },
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
playerRoot.position.copy(system.path.getPoint(0));
system.previousPlayerPosition.copy(playerRoot.position);
const inputSystem = new InputSystem();

function stepAt(position, { hold = false, pulse = false } = {}) {
  const previous = playerRoot.position.clone();
  playerRoot.position.copy(position);
  const displacement = playerRoot.position.clone().sub(previous);
  frameState.playerKinematics.velocity = { x: displacement.x * 60, y: displacement.y * 60, z: displacement.z * 60 };
  frameState.input.moveX = displacement.x === 0 && displacement.z === 0 ? 0 : 0.35;
  frameState.input.moveZ = displacement.x === 0 && displacement.z === 0 ? 0 : -0.75;
  frameState.input.resonanceHeld = hold;
  frameState.input.pulsePressed = pulse;
  if (pulse) {
    frameState.input.pulseEventId += 1;
    frameState.input.pulseSource = "hc006g_validator";
    frameState.inputActionAudit = {
      eventId: frameState.input.pulseEventId,
      producedAtFrame: frameState.frame,
      source: "hc006g_validator",
      consumedBy: "none",
      consumedAtFrame: -1,
      consumedTargetId: "none",
      result: "pulse_produced_waiting_for_consumer"
    };
  }
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  system.update(1 / 60, frameState);
  frameState.input.pulsePressed = false;
}

function holdPosition(frames) {
  for (let i = 0; i < frames; i += 1) stepAt(playerRoot.position.clone());
}

holdPosition(28);
assert(frameState.guideThresholdLayeredInteraction.stage === "observe_current_direction", "approach must reach observation.");
stepAt(playerRoot.position.clone(), { pulse: true });
assert(frameState.guideThresholdLayeredInteraction.stage === "align_movement_with_fold", "one read pulse must reveal local direction.");

// Waiting does not silently complete alignment, even after guidance becomes stronger.
holdPosition(190);
assert(frameState.guideThresholdLayeredInteraction.stage === "align_movement_with_fold", "guidance assist must not auto-complete alignment.");
assert(frameState.guideThresholdLayeredInteraction.guidanceLevel === 1, "readability assist should become visible after a sustained stall.");

// Moving away from the authored current must not advance alignment.
for (let i = 0; i < 45; i += 1) {
  const u = Math.min(0.2, i / 225);
  const tangent = system.path.getTangent(u).setY(0).normalize();
  const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(2.4);
  const offPath = system.path.getPoint(u).add(perpendicular);
  stepAt(offPath);
}
assert(frameState.guideThresholdLayeredInteraction.alignmentProgress < 0.08, "off-corridor movement must not align the threshold.");
assert(frameState.guideThresholdLayeredInteraction.withinPathCorridor === false, "off-path test must be reported outside the corridor.");
assert(buildRuntimeDiagnosticSummary(frameState).blocker === "outside_guide_current_corridor", "F1 diagnostics must expose the actual corridor blocker.");

// Re-enter and move along the local curve, not a global first-to-last vector.
for (let i = 0; i < 75; i += 1) {
  const u = 0.04 + (i / 74) * 0.34;
  stepAt(system.path.getPoint(u));
}
assert(frameState.guideThresholdLayeredInteraction.stage === "sustain_resonance_while_traversing", `local curved movement must align the fold; got ${frameState.guideThresholdLayeredInteraction.stage}.`);
assert(frameState.guideThresholdLayeredInteraction.withinPathCorridor, "aligned traversal must be inside the authored current.");
assert(inputSystem.getPulseContext(frameState) === "resonance_hold", "canonical stabilize action must map to the shared resonance-hold compatibility stage.");

const holdBeforeInvalid = frameState.guideThresholdLayeredInteraction.resonanceHold;
const traverseBeforeInvalid = frameState.guideThresholdLayeredInteraction.traversalProgress;
for (let i = 0; i < 30; i += 1) {
  const u = 0.39 + (i / 29) * 0.06;
  const tangent = system.path.getTangent(u).setY(0).normalize();
  const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(2.4);
  stepAt(system.path.getPoint(u).add(perpendicular), { hold: true });
}
assert(frameState.guideThresholdLayeredInteraction.resonanceHold <= holdBeforeInvalid + 0.01, "held resonance outside the current must not charge.");
assert(frameState.guideThresholdLayeredInteraction.traversalProgress <= traverseBeforeInvalid + 0.01, "off-corridor time must not count as physical traversal.");

let optionalPulseConsumed = false;
for (let i = 0; i < 112 && frameState.guideThresholdLayeredInteraction.stage === "sustain_resonance_while_traversing"; i += 1) {
  const u = 0.38 + (i / 111) * 0.54;
  const pulse = i === 18;
  stepAt(system.path.getPoint(u), { hold: true, pulse });
  if (pulse) optionalPulseConsumed = frameState.inputActionAudit.consumedBy === "GuideThresholdLayeredInteractionSystem";
}
assert(optionalPulseConsumed, "optional traversal pulse must be owned and audited rather than reported unconsumed.");
assert(frameState.guideThresholdLayeredInteraction.stage === "watch_threshold_tissue_answer", `valid held traversal must reach response; got ${frameState.guideThresholdLayeredInteraction.stage}.`);
assert(frameState.guideThresholdLayeredInteraction.traversalProgress >= recipe.geometry.requiredTraversalProgress, "completion must include authored physical path progress.");

holdPosition(50);
assert(frameState.guideThresholdLayeredInteraction.stage === "release_at_settling_point", "visible response must precede release.");
for (let i = 0; i < 60; i += 1) stepAt(system.path.getPoint(1), { hold: false });
const guide = frameState.guideThresholdLayeredInteraction;
assert(guide.completed && guide.transitionReady && guide.progress === 1, "release at the actual endpoint must lock the traversal and handoff.");
assert(guide.foundationalGrammar?.traversalLockedAtHC006G, "shared grammar must record the HC-006G lock.");
assert(["HC-006I", "HC-006J", "HC-006JA"].some((prefix) => String(frameState.lockState.nextIfPasses).startsWith(prefix)), "locked traversal must preserve the first-slice ownership path or its next Hub-readability pass.");
assert(frameState.nonFatalSystemErrors.length === 0, "dynamic lock run must remain error free.");

console.log("validateGuideThresholdTraversalLockHC006G validation passed.");
