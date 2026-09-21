import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SignalChorusNextRoutePressureSystem } from "../src/morph/SignalChorusNextRoutePressureSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusNextRoutePressureHC005D] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/signalChorusNextRoutePressureRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const pressureSource = readText("src/morph/SignalChorusNextRoutePressureSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");

assert(["HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-005D or HC-006A successor, got ${manifest.id}.`);
assert(["0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-005D lineage, got ${manifest.version}.`);
assert(["0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-005D lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "SIGNAL_CHORUS_NEXT_ROUTE_PRESSURE_HC005D", "pressure recipe id mismatch.");
assert(recipe.status === "runtime_active_passive_pressure_only", "pressure recipe must remain passive-only.");
assert(recipe.sourceCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "pressure must originate at Signal Chorus.");
assert(recipe.activation?.requiresReturnState === "signal_chorus_return_state_held", "pressure must require the held return state.");
assert(recipe.completion?.pressureReadable === true, "pressure must become readable.");
for (const key of ["routeActivated", "thresholdOpened", "targetActivated", "inputRequired", "activeCellChanges"]) {
  assert(recipe.completion?.[key] === false, `${key} must remain false.`);
}
assert(runtimeSource.includes("new SignalChorusNextRoutePressureSystem"), "GameRuntime must construct the HC-005D pressure system.");
assert(runtimeSource.includes('register("signalChorusNextRoutePressureSystem"'), "GameRuntime must register the HC-005D pressure system.");
assert(runtimeSource.indexOf('register("signalChorusNextRoutePressureSystem"') > runtimeSource.indexOf('register("signalChorusReturnStateSystem"'), "pressure system must update after the stable return owner.");
assert(pressureSource.includes("targetingSuppressed = true"), "pressure VFX must suppress targeting.");
assert(pressureSource.includes("noRouteActivation = true"), "pressure VFX must explicitly forbid route activation.");
assert(guideSource.includes("GUIDE_PROMPT_SIGNAL_CHORUS_NEXT_ROUTE_PRESSURE_HC005D"), "Guide must publish HC-005D pressure language.");
assert(hudSource.includes("nextRoutePressureActive"), "HUD must expose HC-005D pressure state.");
assert(debugSource.includes("NEXT ROUTE PRESSURE"), "F1 must expose HC-005D pressure diagnostics.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const frameState = {
  frame: 7200,
  runtimeSeconds: 240,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  graveRouteLock: { routeLocked: true, completed: true },
  graveReturnContinuity: {
    active: true,
    completed: true,
    routeAwarenessRestored: true,
    destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001"
  },
  signalChorusReturnState: {
    active: true,
    completed: true,
    stage: "signal_chorus_return_state_held",
    status: "signal_chorus_return_state_held",
    progress: 1,
    ready: true,
    targetRequired: false,
    inputRequired: false,
    movementRequired: false,
    heldSeconds: 2.4,
    currentFocus: "none",
    focusObjectId: "none",
    nextAction: "The return handoff is stable."
  },
  signalChorusNextRoutePressure: {},
  targeting: { active: false, targetId: "none", targetKind: "none" },
  targetFocus: { provider: "SignalChorusReturnStateSystem", ruleId: "HC005B_SIGNAL_RETURN_NO_TARGET", preferredTargetId: "none" },
  selectedObject: {},
  promptStack: {},
  input: { pulsePressed: false, absorbHeld: false },
  inputSource: {},
  inputActionAudit: {},
  controllerOnboarding: {},
  nonFatalSystemErrors: [],
  lockState: {}
};

const system = new SignalChorusNextRoutePressureSystem({ recipeDataSystem, scene, frameState });
system.init();
for (let index = 0; index < 90; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  system.update(1 / 60, frameState);
}

const pressure = frameState.signalChorusNextRoutePressure;
assert(pressure.active, "pressure must activate after the held return prerequisite.");
assert(pressure.stage === "combward_pressure_readable", `unexpected pressure stage ${pressure.stage}.`);
assert(pressure.completed, "pressure reveal must complete after the reveal window.");
assert(pressure.pressureReadable, "pressure must publish readable state.");
assert(pressure.routeActivated === false, "pressure must not activate a route.");
assert(pressure.thresholdOpened === false, "pressure must not open Comb Threshold.");
assert(pressure.targetRequired === false && pressure.inputRequired === false && pressure.movementRequired === false, "pressure must require no target, input, or movement.");
assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "pressure must not change the active cell.");
assert(frameState.targeting.targetId === "none", "pressure must not create a target.");
assert(system.root.visible, "pressure visual must be visible when active.");
assert(system.root.userData.targetingSuppressed === true, "pressure root must suppress targeting.");
assert(system.root.userData.noRouteActivation === true, "pressure root must be marked no-route activation.");
assert(system.strands.length >= 4, "pressure visual needs at least four directional strands.");
assert(system.ribs.length >= 5, "pressure visual needs at least five open ribs.");
assert(system.beads.length >= 3, "pressure visual needs at least three directional pulse beads.");
assert(system.strands.every((strand) => strand.material.opacity > 0), "pressure strands must be visibly revealed.");
assert(system.ribs.every((rib) => rib.material.opacity > 0), "pressure ribs must be visibly revealed.");
assert(frameState.promptStack.signalChorusNextRoutePressure === "combward_pressure_readable_passive_only", "prompt stack must identify passive pressure.");
assert(frameState.lockState.nextIfPasses.includes("HC-005E"), "successful pressure seed must point to HC-005E readability lock.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "SignalChorusReturnStateSystem", `stable return owner must remain authoritative, got ${diagnosis.owner}.`);
assert(diagnosis.expectedTarget === "none" && diagnosis.actualTarget === "none", "diagnostics must remain no-target.");
assert(diagnosis.blocker === "none_detected", `pressure seed must not add a blocker, got ${diagnosis.blocker}.`);

frameState.signalChorusReturnState.heldSeconds = 0;
system.update(1 / 60, frameState);
assert(!frameState.signalChorusNextRoutePressure.active, "pressure must hide when its return-state prerequisite is removed.");
assert(!system.root.visible, "pressure visual must hide when inactive.");

console.log("validateSignalChorusNextRoutePressureHC005D validation passed.");
