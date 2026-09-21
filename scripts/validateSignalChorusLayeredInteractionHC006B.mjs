import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SignalChorusLayeredInteractionSystem } from "../src/morph/SignalChorusLayeredInteractionSystem.js";
import { InputSystem } from "../src/input/InputSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusLayeredInteractionHC006B] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/signalChorusLayeredInteractionRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const systemSource = readText("src/morph/SignalChorusLayeredInteractionSystem.js");
const inputSource = readText("src/input/InputSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

assert(["HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-006B or HC-006C successor, got ${manifest.id}.`);
assert(["0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-006B lineage, got ${manifest.version}.`);
assert(["0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-006B lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "SIGNAL_CHORUS_LAYERED_INTERACTION_HC006B", "layered interaction recipe id mismatch.");
assert(recipe.sourceCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "layered interaction must remain inside Signal Chorus.");
assert(recipe.stages?.map((stage) => stage.id).join(",") === "approach_cadence_knot,observe_read,align_with_cadence,sustain_resonance,release_and_settle,layered_interaction_complete", "authored stage order must remain complete and explicit.");
for (const key of ["routeActivated", "thresholdOpened", "activeCellChanges"]) {
  assert(recipe.completion?.[key] === false, `${key} must remain false.`);
}
assert(runtimeSource.includes("new SignalChorusLayeredInteractionSystem"), "GameRuntime must construct the layered interaction system.");
assert(runtimeSource.includes('register("signalChorusLayeredInteractionSystem"'), "GameRuntime must register the layered interaction system.");
assert(runtimeSource.indexOf('register("signalChorusLayeredInteractionSystem"') > runtimeSource.indexOf('register("signalChorusVisualIdentitySystem"'), "layered interaction must update after the living-tissue identity.");
assert(systemSource.includes("approach_cadence_knot") && systemSource.includes("cadenceWindowOpen") && systemSource.includes("resonanceHold") && systemSource.includes("release_required_before_settle"), "runtime must implement approach, timed alignment, sustain, and release stages.");
assert(inputSource.includes('return layeredInteraction.expectsHold ? "stabilize" : "pulse"') && inputSource.includes('signalChorusLayeredInteraction'), "Signal Chorus sustain must publish canonical LT stabilize semantics.");
assert(inputSource.includes("resonanceHeld"), "input frame must publish held resonance separately from absorb.");
assert(guideSource.includes("GUIDE_PROMPT_SIGNAL_CHORUS_LAYERED_INTERACTION_HC006B"), "Guide must own layered interaction language.");
assert(hudSource.includes("LAYERED RESONANCE"), "playtest HUD must expose layered resonance.");
assert(debugSource.includes("LAYERED CHORUS INTERACTION"), "F1 must expose layered interaction diagnostics.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(1.05, 0.26, -1.92);
scene.add(playerRoot);

const frameState = {
  frame: 10000,
  runtimeSeconds: 400,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  signalChorusReturnState: {
    active: true,
    completed: true,
    stage: "signal_chorus_return_state_held",
    progress: 1,
    ready: true
  },
  signalChorusNextRoutePressure: {
    active: true,
    completed: true,
    stage: "combward_pressure_readable",
    routeActivated: false
  },
  signalChorusVisualIdentity: {
    active: true,
    completed: true,
    stage: "signal_chorus_living_tissue_identity_readable"
  },
  targeting: { active: false, targetId: "none", targetKind: "none" },
  targetFocus: { provider: "SignalChorusReturnStateSystem", ruleId: "HC005B_SIGNAL_RETURN_NO_TARGET", preferredTargetId: "none" },
  selectedObject: {},
  promptStack: {},
  input: { pulsePressed: false, pulseEventId: 0, pulseSource: "none", absorbHeld: false, resonanceHeld: false },
  inputSource: {},
  inputActionAudit: {},
  controllerOnboarding: {},
  playtestHud: {},
  nonFatalSystemErrors: [],
  lockState: {}
};

const system = new SignalChorusLayeredInteractionSystem({ recipeDataSystem, scene, playerRoot, frameState });
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
  frameState.inputActionAudit = {
    eventId: frameState.input.pulseEventId,
    producedAtFrame: frameState.frame,
    source: "validator_pulse",
    activeCellId: frameState.activeCellId,
    targetIdAtProduction: "none",
    consumedBy: "none",
    consumedAtFrame: -1,
    consumedTargetId: "none",
    result: "pulse_produced_waiting_for_consumer"
  };
  step(1);
};
const pulseOnGold = () => {
  let guard = 0;
  while (!frameState.signalChorusLayeredInteraction.cadenceWindowOpen && guard < 240) {
    step(1);
    guard += 1;
  }
  assert(guard < 240, "cadence window must become visible within four seconds.");
  pulse();
};

step(40);
assert(frameState.signalChorusLayeredInteraction.stage === "observe_read", `approach should advance to observe_read, got ${frameState.signalChorusLayeredInteraction.stage}.`);
assert(system.root.visible, "layered interaction visual must reveal when prerequisites are met.");
assert(frameState.targeting.targetId === "none", "visual focus must not create a generic target lock.");

pulse();
assert(frameState.signalChorusLayeredInteraction.stage === "align_with_cadence", "first pulse must reveal the cadence rather than complete the interaction.");
assert(frameState.inputActionAudit.consumedBy === "SignalChorusLayeredInteractionSystem", "observe pulse must be consumed by the layered system.");

pulseOnGold();
assert(frameState.signalChorusLayeredInteraction.cadenceMatches === 1, "first gold pulse must register one cadence match.");
pulseOnGold();
assert(frameState.signalChorusLayeredInteraction.stage === "sustain_resonance", "two cadence matches must advance to sustain resonance.");

const inputSystem = new InputSystem();
assert(inputSystem.getPulseContext(frameState) === "resonance_hold", "shared interaction semantics must report resonance_hold during canonical LT sustain.");
frameState.input.resonanceHeld = true;
step(125);
assert(frameState.signalChorusLayeredInteraction.stage === "release_and_settle", `sustained hold must advance to release, got ${frameState.signalChorusLayeredInteraction.stage}.`);
assert(frameState.signalChorusLayeredInteraction.tissueResponse >= 0.99, "sustained resonance must produce a full visible tissue response.");

step(20);
assert(frameState.signalChorusLayeredInteraction.stage === "release_and_settle", "remaining held must not auto-complete the release stage.");
frameState.input.resonanceHeld = false;
step(80);

const layered = frameState.signalChorusLayeredInteraction;
assert(layered.completed, "release and settle must register layered completion.");
assert(layered.stage === "layered_interaction_complete", `unexpected completion stage ${layered.stage}.`);
assert(layered.progress === 1, "layered completion must report 100% progress.");
assert(layered.routeActivated === false && layered.thresholdOpened === false && layered.activeCellChanges === false, "layered prototype must not open or change the route.");
assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "layered prototype must preserve the Signal Chorus cell.");
assert(frameState.targeting.targetId === "none", "layered completion must remain free of generic target lock.");
assert(frameState.lockState.nextIfPasses.includes("HC-006E"), "foundational successor must point to HC-006E Surface Wake retrofit.");
assert(system.responseRings.length >= 3 && system.tendrils.length >= 6, "visible tissue response needs authored rings and tendrils.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "SignalChorusLayeredInteractionSystem", `layered system must own diagnostics while active, got ${diagnosis.owner}.`);
assert(diagnosis.complete, "diagnostics must report completed handoff.");
assert(diagnosis.expectedTarget === "none" && diagnosis.actualTarget === "none", "custom visual focus must remain outside generic targeting.");
assert(diagnosis.blocker === "none_detected", `layered completion must have no blocker, got ${diagnosis.blocker}.`);

console.log("validateSignalChorusLayeredInteractionHC006B validation passed.");
