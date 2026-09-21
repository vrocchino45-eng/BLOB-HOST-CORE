import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SurfaceWakeLayeredInteractionSystem } from "../src/opening/SurfaceWakeLayeredInteractionSystem.js";
import { InspectionCameraSystem } from "../src/camera/InspectionCameraSystem.js";
import { InputSystem } from "../src/input/InputSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSurfaceWakeLayeredInteractionHC006E] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/opening/surfaceWakeLayeredInteractionRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const systemSource = readText("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const inputSource = readText("src/input/InputSystem.js");
const targetSource = readText("src/targeting/TargetFocusRegistry.js");
const bondSource = readText("src/chemistry/BondSystem.js");
const pacingSource = readText("src/opening/OpeningPacingSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

if (["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(manifest.version === (manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : manifest.id === "HC-012B" ? "0.0.128" : "0.0.127") && pkg.version === manifest.version, "HC-012A/HC-012B Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-011B") {
  assert(manifest.version === "0.0.126" && pkg.version === manifest.version, "HC-011B Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-011A1") {
  assert(manifest.version === "0.0.125" && pkg.version === manifest.version, "HC-011A1 Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-011A") {
  assert(manifest.version === "0.0.124" && pkg.version === manifest.version, "HC-011A Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010G") {
  assert(manifest.version === "0.0.123" && pkg.version === manifest.version, "HC-010G Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010F") {
  assert(manifest.version === "0.0.122" && pkg.version === manifest.version, "HC-010F Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010E") {
  assert(manifest.version === "0.0.121" && pkg.version === manifest.version, "HC-010E Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010D") {
  assert(manifest.version === "0.0.120" && pkg.version === manifest.version, "HC-010D Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010C") {
  assert(manifest.version === "0.0.119" && pkg.version === manifest.version, "HC-010C Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010B") {
  assert(manifest.version === "0.0.118" && pkg.version === manifest.version, "HC-010B Surface Wake lineage identity mismatch.");
} else if (manifest.id === "HC-010A") {
  assert(manifest.version === "0.0.117" && pkg.version === manifest.version, "HC-010A Surface Wake lineage identity mismatch.");
} else {
assert(["HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G"] .includes(manifest.id) && ["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(manifest.version), "manifest identity must preserve the Surface Wake interaction lineage.");
assert(["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(pkg.version), "package version must preserve the Surface Wake interaction lineage.");
}
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "SURFACE_WAKE_LAYERED_INTERACTION_HC006E", "Surface Wake recipe id mismatch.");
assert(recipe.sourceCellId === "CELL_MEMBRANE_NURSERY_001", "Surface Wake lesson must live in the opening nursery cell.");
assert(recipe.stages.map((stage) => stage.id).join(",") === "approach_listening_fold,observe_first_answer,sustain_first_resonance,watch_tissue_response,release_and_settle,surface_wake_complete", "authored opening stage order changed.");
assert(recipe.activation.targetRequired === false && recipe.completion.routeActivated === false && recipe.completion.activeCellChanges === false, "opening lesson must remain non-targeting and route-neutral.");
assert(runtimeSource.includes("new SurfaceWakeLayeredInteractionSystem") && runtimeSource.includes('register("surfaceWakeLayeredInteractionSystem"'), "GameRuntime must construct and register the Surface Wake system.");
assert(runtimeSource.indexOf('register("surfaceWakeLayeredInteractionSystem"') < runtimeSource.indexOf('register("targetFocusRegistry"'), "Surface Wake must publish ownership before generic targeting.");
assert(systemSource.includes("new LayeredInteractionGrammar") && systemSource.includes("interactionInspectionFocus"), "Surface Wake must use the shared grammar and generic inspection provider.");
assert(inputSource.includes("surfaceWakeLayeredInteraction") && inputSource.includes('return surfaceWakeInteraction.expectsHold ? "stabilize" : "pulse"'), "Input semantics must expose X pulse and LT stabilize during the opening lesson.");
assert(targetSource.includes("surfaceWake.active") && targetSource.includes("!surfaceWake.completed") && targetSource.includes("HC007A_SURFACE_WAKE_SYSTEMIC_PLAY") && targetSource.includes("dormant_seed_nutrient_001"), "HC-007A must allow systemic nursery targeting while excluding the protected safe seed.");
assert(bondSource.includes("safeSeedLocked") && bondSource.includes("dormant_seed_nutrient_001"), "BondSystem must lock only the protected seed while allowing systemic nursery absorption.");
assert(pacingSource.includes("read_surface_wake"), "opening pacing must explicitly wait for the layered lesson.");
assert(guideSource.includes("surfaceWakeInteractionPrompt"), "GuidePromptSystem must expose Surface Wake authored guidance.");
assert(hudSource.includes("SURFACE WAKE") && ["HC-006EB", "HC-006JA", "HC-008E", "HC-008F", "HC-008G", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B"].some((id) => hudSource.includes(id)), "playtest HUD must expose Surface Wake state.");
assert(debugSource.includes("SURFACE WAKE LAYERED INTERACTION"), "F1 must expose Surface Wake diagnostics.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.getCounts().surfaceWakeLayeredInteractionRecipes === 1, "exactly one Surface Wake layered recipe must load.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(...recipe.geometry.anchor);
scene.add(playerRoot);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: { pulsePressed: false, pulseEventId: 0, pulseSource: "none", absorbHeld: false, resonanceHeld: false, toggleInspectionCameraPressed: false },
  inputSource: { contextButtonDown: false },
  inputActionAudit: {},
  targeting: { active: false, targetId: "none", targetKind: "none" },
  targetFocus: { provider: "SurfaceWakeLayeredInteractionSystem", preferredTargetId: "none", ruleId: "HC006E_SURFACE_WAKE_NO_TARGET" },
  selectedObject: {},
  promptStack: {},
  controllerOnboarding: {},
  playtestHud: {},
  nonFatalSystemErrors: [],
  lockState: {},
  inspectionCamera: { available: false, active: false },
  nurseryCircuit: { agencyProven: true, foldInvitation: true }
};
const system = new SurfaceWakeLayeredInteractionSystem({ recipeDataSystem, scene, playerRoot, frameState });
system.init();
const step = (count = 1) => {
  for (let index = 0; index < count; index += 1) {
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
  frameState.inputActionAudit = { eventId: frameState.input.pulseEventId, producedAtFrame: frameState.frame, source: "validator_pulse", activeCellId: frameState.activeCellId, targetIdAtProduction: "none", consumedBy: "none", consumedAtFrame: -1, consumedTargetId: "none", result: "pulse_produced_waiting_for_consumer" };
  step(1);
};

step(30);
assert(frameState.surfaceWakeLayeredInteraction.stage === "observe_first_answer", `approach must advance to observation, got ${frameState.surfaceWakeLayeredInteraction.stage}.`);
assert(frameState.surfaceWakeLayeredInteraction.blocksSafeSeedAbsorb && !frameState.surfaceWakeLayeredInteraction.safeSeedReadable, "safe seed must remain held during the lesson.");
assert(frameState.interactionInspectionFocus.providerId === "SurfaceWakeLayeredInteractionSystem", "Surface Wake must publish the generic inspection provider.");
assert(frameState.targeting.targetId === "none", "the listening fold must not create a target.");

const inputSystem = new InputSystem();
assert(inputSystem.getPulseContext(frameState) === "pulse_listen", "the observation stage must semantically expect pulse.");
pulse();
assert(frameState.surfaceWakeLayeredInteraction.stage === "sustain_first_resonance", "first pulse must reveal the answer and advance to sustain.");
assert(frameState.inputActionAudit.consumedBy === "SurfaceWakeLayeredInteractionSystem", "Surface Wake must consume its observation pulse.");
assert(inputSystem.getPulseContext(frameState) === "resonance_hold", "the sustain stage must semantically expect stabilize/resonance hold.");
frameState.input.resonanceHeld = true;
step(95);
assert(frameState.surfaceWakeLayeredInteraction.stage === "watch_tissue_response", `held resonance must advance to visible response, got ${frameState.surfaceWakeLayeredInteraction.stage}.`);
step(45);
assert(frameState.surfaceWakeLayeredInteraction.stage === "release_and_settle", "visible response must require release before completion.");
step(12);
assert(!frameState.surfaceWakeLayeredInteraction.completed, "remaining held must not complete the release stage.");
frameState.input.resonanceHeld = false;
step(65);
const surface = frameState.surfaceWakeLayeredInteraction;
assert(surface.completed && surface.stage === "surface_wake_complete" && surface.progress === 1, "release and settle must complete the opening lesson.");
assert(surface.safeSeedReadable && surface.safeSeedAbsorbUnlocked && !surface.blocksSafeSeedAbsorb, "completion must unlock safe-seed readability and absorption.");
assert(surface.routeActivated === false && surface.activeCellChanges === false && frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001", "the opening lesson must not change route or cell.");
assert(surface.foundationalGrammar?.grammarStage === "complete" && surface.foundationalGrammar?.introducedAtSurfaceWake === true, "shared grammar must report complete and introduced at Surface Wake.");
assert(inputSystem.getPulseContext(frameState) === "absorb", "the completed lesson must release contextual interaction ownership to normal absorb semantics.");

const cameraSystem = new InspectionCameraSystem({ recipeDataSystem, frameState, playerRoot });
cameraSystem.init();
frameState.interactionInspectionFocus = system.createInspectionFocus(true);
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.available && !frameState.inspectionCamera.active, "inspection must be available but optional near the opening fold.");
frameState.input.toggleInspectionCameraPressed = true;
cameraSystem.update(1 / 60, frameState);
assert(frameState.inspectionCamera.active, "Y/V must activate the generic inspection camera at Surface Wake.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "SurfaceWakeLayeredInteractionSystem", `Surface Wake must own diagnostics, got ${diagnosis.owner}.`);
assert(diagnosis.complete && diagnosis.expectedTarget === "none" && diagnosis.actualTarget === "none", "completed opening lesson must be target-free and complete.");
assert(diagnosis.blocker === "none_detected", `completed opening lesson must have no blocker, got ${diagnosis.blocker}.`);
assert(system.responseRings.length >= 3 && system.tendrils.length >= 7, "the world response needs visible rings and tendrils.");

console.log("validateSurfaceWakeLayeredInteractionHC006E validation passed.");
