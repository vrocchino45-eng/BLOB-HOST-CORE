import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../src/morph/GuideThresholdLayeredInteractionSystem.js";
import { ScarFlowInteractionSystem } from "../src/morph/ScarFlowInteractionSystem.js";
import { InputSystem } from "../src/input/InputSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGuideThresholdLayeredInteractionHC006F] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];
const runtimeSource = readText("src/core/GameRuntime.js");
const oldLoopSource = readText("src/morph/ScarFlowInteractionSystem.js");
const secondMorphSource = readText("src/morph/SecondLocalCellMorphSystem.js");
const targetSource = readText("src/targeting/TargetFocusRegistry.js");
const inputSource = readText("src/input/InputSystem.js");

assert(["HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), "manifest must retain or advance beyond HC-006F.");
assert(["0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package version must retain the HC-006F feature or HC-006G lock.");
assert(recipe.id === "GUIDE_THRESHOLD_LAYERED_INTERACTION_HC006F", "recipe id mismatch.");
assert(recipe.sourceCellId === "CELL_SCAR_FLOW_FOLD_001", "Guide Threshold must map to Scar Flow.");
assert(recipe.stages.map((stage) => stage.id).join(",") === "approach_guiding_current,observe_current_direction,align_movement_with_fold,sustain_resonance_while_traversing,watch_threshold_tissue_answer,release_at_settling_point,guide_threshold_complete", "stage order mismatch.");
assert(recipe.activation.targetRequired === false && recipe.completion.routeActivated === false && recipe.completion.thresholdOpened === false, "interaction must remain target-free and no-gate.");
assert(runtimeSource.includes("new GuideThresholdLayeredInteractionSystem") && runtimeSource.includes('register("guideThresholdLayeredInteractionSystem"'), "GameRuntime must construct/register the system.");
assert(runtimeSource.indexOf('register("guideThresholdLayeredInteractionSystem"') < runtimeSource.indexOf('register("scarFlowInteractionSystem"'), "new owner must publish before compatibility loop.");
assert(oldLoopSource.includes("ownershipDeferredTo") && oldLoopSource.includes("syncFromGuideThreshold"), "legacy Scar Flow loop must defer ownership.");
assert(secondMorphSource.includes("guideTransitionReady") && secondMorphSource.includes("guide_threshold_complete_ready_for_continuous_morph"), "existing second morph must accept the layered completion handoff.");
assert(targetSource.includes("HC006F_GUIDE_THRESHOLD_NO_GENERIC_TARGET"), "generic targeting must be suppressed during the layered traversal.");
assert(inputSource.includes("guideThresholdInteraction.expectsHold") && inputSource.includes("guideThresholdInteraction.expectsRelease") && inputSource.includes('return "release_stabilize"'), "Input semantics must expose X pulse, LT stabilize, and explicit LT release during Guide Threshold traversal.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.getCounts().guideThresholdLayeredInteractionRecipes === 1, "exactly one Guide Threshold layered recipe must load.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(-0.62, 0.18, -1.32);
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
const inputSystem = new InputSystem();
const step = (count = 1, motion = null) => {
  for (let index = 0; index < count; index += 1) {
    if (motion) {
      playerRoot.position.add(motion);
      frameState.playerKinematics.velocity = { x: motion.x * 60, y: motion.y * 60, z: motion.z * 60 };
      frameState.input.moveZ = -0.75;
    } else {
      frameState.playerKinematics.velocity = { x: 0, y: 0, z: 0 };
      frameState.input.moveZ = 0;
    }
    frameState.frame += 1;
    frameState.runtimeSeconds += 1 / 60;
    system.update(1 / 60, frameState);
    frameState.input.pulsePressed = false;
  }
};
const pulse = () => {
  frameState.input.pulseEventId += 1;
  frameState.input.pulsePressed = true;
  frameState.input.pulseSource = "validator_pulse";
  frameState.inputActionAudit = { eventId: frameState.input.pulseEventId, producedAtFrame: frameState.frame, source: "validator_pulse", consumedBy: "none", consumedAtFrame: -1, consumedTargetId: "none", result: "pulse_produced_waiting_for_consumer" };
  step(1);
};

step(28);
assert(frameState.guideThresholdLayeredInteraction.stage === "observe_current_direction", `approach must advance to observation, got ${frameState.guideThresholdLayeredInteraction.stage}.`);
assert(frameState.interactionInspectionFocus.providerId === "GuideThresholdLayeredInteractionSystem", "Guide Threshold must publish an authored camera focus.");
assert(inputSystem.getPulseContext(frameState) === "pulse_listen", "the observation stage must semantically expect pulse.");
pulse();
assert(frameState.guideThresholdLayeredInteraction.stage === "align_movement_with_fold", "pulse must reveal direction and advance to movement alignment.");
assert(frameState.inputActionAudit.consumedBy === "GuideThresholdLayeredInteractionSystem", "new owner must consume the reveal pulse.");

const direction = new THREE.Vector3(1.34, -0.4, -1.1).setY(0).normalize().multiplyScalar(0.018);
step(80, direction);
assert(frameState.guideThresholdLayeredInteraction.stage === "sustain_resonance_while_traversing", `movement must align the fold, got ${frameState.guideThresholdLayeredInteraction.stage}.`);
assert(inputSystem.getPulseContext(frameState) === "resonance_hold", "the moving sustain stage must semantically expect stabilize/resonance hold.");

frameState.input.resonanceHeld = true;
step(110, direction.clone().multiplyScalar(0.65));
assert(frameState.guideThresholdLayeredInteraction.stage === "watch_threshold_tissue_answer", `moving held resonance must produce the tissue response, got ${frameState.guideThresholdLayeredInteraction.stage}.`);
step(50);
assert(frameState.guideThresholdLayeredInteraction.stage === "release_at_settling_point", "response must advance to release-and-settle.");

playerRoot.position.set(0.72, -0.22, -2.42);
frameState.input.resonanceHeld = false;
step(60);
const guide = frameState.guideThresholdLayeredInteraction;
assert(guide.completed && guide.transitionReady && guide.stage === "guide_threshold_complete", "release at the settling point must complete the Guide Threshold.");
assert(guide.progress === 1 && guide.preparedForNextBranch, "completion must publish a full compatibility handoff.");
assert(guide.routeActivated === false && guide.thresholdOpened === false && frameState.activeCellId === "CELL_SCAR_FLOW_FOLD_001", "the interaction itself must not gate or change cells.");
assert(guide.foundationalGrammar?.grammarStage === "complete" && guide.foundationalGrammar?.movementLed, "shared grammar must report movement-led completion.");
assert(frameState.morphCompletion.safeToExpand && frameState.morphCompletion.stability >= 0.64, "completion must publish stable downstream metrics.");

const chemObjectSystem = { objects: [] };
const legacy = new ScarFlowInteractionSystem({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState });
legacy.init();
legacy.update(1 / 60, frameState);
assert(frameState.scarFlowInteraction.compatibilityOnly && frameState.scarFlowInteraction.ownershipDeferredTo === "GuideThresholdLayeredInteractionSystem", "legacy loop must become compatibility-only.");
assert(frameState.scarFlowInteraction.preparedForNextBranch, "legacy compatibility must expose readiness to unchanged downstream code.");

const targetRegistry = new TargetFocusRegistry({ recipeDataSystem, frameState });
targetRegistry.init();
// Test suppression before completion using a state snapshot.
frameState.guideThresholdLayeredInteraction = { ...guide, active: true, completed: false };
targetRegistry.update(1 / 60, frameState);
assert(frameState.targetFocus.suppressTargeting && frameState.targetFocus.provider === "GuideThresholdLayeredInteractionSystem", "generic targets must be hidden during traversal.");
frameState.guideThresholdLayeredInteraction = guide;

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "GuideThresholdLayeredInteractionSystem", `diagnostics must name the new owner, got ${diagnosis.owner}.`);
assert(diagnosis.complete && diagnosis.expectedTarget === "none", "completed traversal must be complete and target-free.");
assert(system.strands.length >= 5 && system.ribs.length >= 6 && system.currentMotes.length >= 12, "Guide Threshold needs a visible current, settling ribs, and moving signal motes.");

console.log("validateGuideThresholdLayeredInteractionHC006F validation passed.");
