import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SignalChorusVisualIdentitySystem } from "../src/visual/SignalChorusVisualIdentitySystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusVisualIdentityHC006A] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/visual/signalChorusVisualIdentity_HC006A.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const identitySource = readText("src/visual/SignalChorusVisualIdentitySystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

assert(["HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-006A or HC-006B successor, got ${manifest.id}.`);
assert(["0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-006A lineage, got ${manifest.version}.`);
assert(["0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-006A lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "SIGNAL_CHORUS_VISUAL_IDENTITY_HC006A", "visual-identity recipe id mismatch.");
assert(recipe.status === "runtime_active_visual_identity_only", "visual identity must remain presentation-only.");
assert(recipe.sourceCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "visual identity must belong to Signal Chorus.");
for (const key of ["visualIdentityReadable", "livingMotionReadable", "combwardDirectionReinforced"]) {
  assert(recipe.completion?.[key] === true, `${key} must be true.`);
}
for (const key of ["routeActivated", "targetActivated", "inputRequired", "activeCellChanges"]) {
  assert(recipe.completion?.[key] === false, `${key} must remain false.`);
}
assert(recipe.futureDepthPlan?.prototypeTarget === "choir_resonance_node_001", "future trigger-depth prototype must remain bound to the Chorus resonance node.");
assert(runtimeSource.includes("new SignalChorusVisualIdentitySystem"), "GameRuntime must construct the HC-006A visual identity system.");
assert(runtimeSource.includes('register("signalChorusVisualIdentitySystem"'), "GameRuntime must register the HC-006A visual identity system.");
assert(runtimeSource.indexOf('register("signalChorusVisualIdentitySystem"') > runtimeSource.indexOf('register("signalChorusNextRoutePressureSystem"'), "visual identity must update after the passive combward pressure state.");
assert(identitySource.includes("targetingSuppressed: true"), "living tissue root must suppress targeting.");
assert(identitySource.includes("noRouteActivation: true"), "living tissue root must forbid route activation.");
assert(debugSource.includes("SIGNAL CHORUS LIVING TISSUE"), "F1 must expose HC-006A tissue diagnostics.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const frameState = {
  frame: 9000,
  runtimeSeconds: 300,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  signalChorusReturnState: {
    active: true,
    completed: true,
    stage: "signal_chorus_return_state_held",
    status: "signal_chorus_return_state_held",
    progress: 1,
    ready: true,
    heldSeconds: 3,
    targetRequired: false,
    inputRequired: false,
    movementRequired: false,
    currentFocus: "none",
    focusObjectId: "none",
    nextAction: "Hold the returned reading."
  },
  signalChorusNextRoutePressure: {
    active: true,
    stage: "combward_pressure_readable",
    routeActivated: false,
    targetRequired: false,
    inputRequired: false
  },
  targeting: { active: false, targetId: "none", targetKind: "none" },
  targetFocus: { provider: "SignalChorusReturnStateSystem", ruleId: "HC005B_SIGNAL_RETURN_NO_TARGET", preferredTargetId: "none" },
  selectedObject: {},
  promptStack: {},
  input: { pulsePressed: false, absorbHeld: false },
  inputSource: {},
  inputActionAudit: {},
  controllerOnboarding: {},
  playtestHud: {},
  nonFatalSystemErrors: [],
  lockState: {}
};

const system = new SignalChorusVisualIdentitySystem({ recipeDataSystem, scene, frameState });
system.init();
for (let index = 0; index < 120; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  system.update(1 / 60, frameState);
}

const identity = frameState.signalChorusVisualIdentity;
assert(identity.active, "living tissue identity must activate in the stable Signal return state.");
assert(identity.completed, "living tissue reveal must complete.");
assert(identity.stage === "signal_chorus_living_tissue_identity_readable", `unexpected identity stage ${identity.stage}.`);
assert(identity.visualIdentityReadable && identity.livingMotionReadable, "identity and living motion must be readable.");
assert(identity.combwardDirectionReinforced, "combward tissue must reinforce the readable pressure.");
assert(identity.routeActivated === false && identity.inputRequired === false && identity.targetRequired === false, "identity must not activate route, input, or target.");
assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "identity must not change the active cell.");
assert(frameState.targeting.targetId === "none", "identity must not create a target.");
assert(system.root.visible, "living tissue visual must be visible when active.");
assert(system.root.userData.targetingSuppressed === true, "living tissue root must suppress targeting.");
assert(system.lobes.length >= 7, "living tissue needs at least seven lobes.");
assert(system.filaments.length >= 12, "living tissue needs at least twelve filaments.");
assert(system.filaments.filter((item) => item.userData.combward).length >= 3, "living tissue needs at least three combward trunks.");
assert(system.motes.length >= 16, "living tissue needs at least sixteen conduction motes.");
assert(system.lobes.every((item) => item.material.opacity > 0), "all tissue lobes must reveal visibly.");
assert(system.filaments.every((item) => item.material.opacity > 0), "all tissue filaments must reveal visibly.");
assert(frameState.promptStack.futureInteractionDepth === "planned_not_active", "deep trigger work must remain planned, not active.");
assert(frameState.promptStack.futureInspectionCamera === "planned_not_active", "inspection camera must remain planned, not active.");
assert(frameState.lockState.nextIfPasses.includes("HC-006B"), "successful visual identity pass must point to HC-006B trigger-depth prototype.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "SignalChorusReturnStateSystem", `stable return owner must remain authoritative, got ${diagnosis.owner}.`);
assert(diagnosis.expectedTarget === "none" && diagnosis.actualTarget === "none", "diagnostics must remain no-target.");
assert(diagnosis.blocker === "none_detected", `visual identity must not add a blocker, got ${diagnosis.blocker}.`);

frameState.signalChorusReturnState.active = false;
system.update(1 / 60, frameState);
assert(!frameState.signalChorusVisualIdentity.active, "visual identity must hide when the Signal return state is removed.");
assert(!system.root.visible, "living tissue visual must hide when inactive.");

console.log("validateSignalChorusVisualIdentityHC006A validation passed.");
