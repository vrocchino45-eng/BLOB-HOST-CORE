import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SignalChorusReturnStateSystem } from "../src/morph/SignalChorusReturnStateSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusReturnStateHC005B] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/signalChorusReturnStateRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const seamSource = readText("src/morph/GraveSeamContinuityMicroExitSystem.js");
const signalArrivalSource = readText("src/morph/SignalChorusArrivalSystem.js");
const signalInteractionSource = readText("src/morph/SignalChorusInteractionSystem.js");
const focusSource = readText("src/targeting/TargetFocusRegistry.js");
const targetingSource = readText("src/targeting/TargetingSystem.js");
const diagnosticSource = readText("src/debug/RuntimeDiagnosticSummary.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");

assert(["HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-005B or HC-005C successor, got ${manifest.id}.`);
assert(["0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-005B lineage, got ${manifest.version}.`);
assert(["0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-005B lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "SIGNAL_CHORUS_RETURN_STATE_HC005B", "return-state recipe id mismatch.");
assert(recipe.sourceHandoff === "GRAVE_RETURN_CONTINUITY_HC005A", "return state must require HC-005A handoff.");
assert(recipe.destinationCell === "CELL_SIGNAL_CHORUS_NERVE_001", "return state must hold Signal Chorus.");
assert(recipe.ownershipRules?.reassertsDestinationCell === true, "return state must reassert destination ownership.");
assert(recipe.ownershipRules?.suppressesOldSignalLoopReplay === true, "return state must suppress old Signal loop replay.");
assert(recipe.ownershipRules?.suppressesStaleGraveTargets === true, "return state must suppress stale Grave targeting.");
assert(recipe.ownershipRules?.opensNewRoute === false, "return state must not open a new route.");
assert(recipe.completion?.protectedRemainsConsumed === false, "protected remains must stay intact.");
assert(recipe.completion?.inheritanceSeedRemnantOpened === false, "inheritance seed must stay closed.");

assert(runtimeSource.includes("new SignalChorusReturnStateSystem"), "GameRuntime must construct the return-state owner.");
assert(runtimeSource.includes('register("signalChorusReturnStateSystem"'), "GameRuntime must register the return-state owner.");
assert(runtimeSource.indexOf('register("signalChorusReturnStateSystem"') > runtimeSource.indexOf('register("graveReturnContinuitySystem"'), "return-state owner must update after HC-005A continuity.");
assert(seamSource.includes("downstreamReturnOwns"), "seam micro-exit must yield to downstream return ownership.");
assert(signalArrivalSource.includes("ownership_relinquished_to_signal_chorus_return_state"), "Signal arrival must relinquish after return.");
assert(signalInteractionSource.includes("ownership_relinquished_to_signal_chorus_return_state"), "Signal interaction must relinquish after return.");
assert(focusSource.includes("HC005B_SIGNAL_RETURN_NO_TARGET"), "target focus must suppress stale return targets.");
assert(targetingSource.includes("focus.suppressTargeting"), "targeting runtime must honor suppression.");
assert(diagnosticSource.includes('{ key: "signalChorusReturnState", owner: "SignalChorusReturnStateSystem" }'), "diagnostics must prioritize the return-state owner.");
assert(guideSource.includes("GUIDE_PROMPT_SIGNAL_CHORUS_RETURN_STATE_HC005B"), "Guide must publish return-state language.");
assert(hudSource.includes("signalChorusReturnStateActive"), "HUD must expose return-state ownership.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

function makeRoot(name) {
  const rootGroup = new THREE.Group();
  rootGroup.name = name;
  rootGroup.userData.absorbed = false;
  rootGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial()));
  return rootGroup;
}

const graveRoot = makeRoot("old_core_husk_memory_001");
const signalRoot = makeRoot("choir_resonance_node_001");
const graveEnvironment = makeRoot("grave_memory_residue_bed_surface_001");
const graveHaze = makeRoot("grave_memory_silt_haze_001");
const signalEnvironment = makeRoot("signal_chorus_nerve_surface_001");
const signalHaze = makeRoot("signal_chorus_soft_haze_001");

const visualComposer = {
  composedObjects: [graveEnvironment, graveHaze, signalEnvironment, signalHaze].map((root) => ({ root }))
};
const chemObjectSystem = {
  objects: [
    { cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001", root: graveRoot, recipe: { id: "old_core_husk_memory_001" } },
    { cellId: "CELL_SIGNAL_CHORUS_NERVE_001", root: signalRoot, recipe: { id: "choir_resonance_node_001" } }
  ],
  setObjectOpacity(root, opacity) {
    root.traverse((child) => {
      if (child.material) child.material.opacity = opacity;
    });
  },
  setCellObjectVisibility(cellId, visible, opacity) {
    for (const item of this.objects) {
      if (item.cellId !== cellId) continue;
      item.root.visible = visible;
      this.setObjectOpacity(item.root, opacity);
    }
  }
};

const frameState = {
  frame: 4101,
  runtimeSeconds: 159.7,
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  graveRouteLock: { routeLocked: true, completed: true },
  graveReturnContinuity: {
    active: true,
    completed: true,
    routeAwarenessRestored: true,
    destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    stage: "signal_chorus_route_awareness_restored",
    progress: 1,
    targetRequired: false,
    inputRequired: false,
    currentFocus: "none",
    nextAction: "Route awareness restored at Signal Chorus."
  },
  signalChorusReturnState: {},
  chemistry: {},
  physicalFeel: {},
  promptStack: {},
  targeting: {
    active: true,
    targetId: "inheritance_seed_remnant_001",
    targetKind: "scar_resists",
    distance: 4.07,
    lockStrength: 0.30
  },
  targetFocus: {
    provider: "TARGET_FOCUS_GRAVE_MEMORY_001",
    preferredTargetId: "inheritance_seed_remnant_001",
    suppressTargeting: true
  },
  selectedObject: { recipeId: "inheritance_seed_remnant_001" },
  input: { pulsePressed: false, absorbHeld: false, pulseEventId: 992 },
  inputActionAudit: { eventId: 992, consumedBy: "none" },
  nonFatalSystemErrors: [],
  lockState: {}
};

const system = new SignalChorusReturnStateSystem({
  recipeDataSystem,
  visualComposer,
  chemObjectSystem,
  frameState
});
system.init();
system.update(1 / 60, frameState);

assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "return state must repair the active cell to Signal Chorus.");
assert(frameState.signalChorusReturnState.active, "return state must become active after verified handoff.");
assert(frameState.signalChorusReturnState.completed, "return state must publish a stable complete handoff.");
assert(frameState.signalChorusReturnState.stage === "signal_chorus_return_state_held", "stable stage mismatch.");
assert(frameState.signalChorusReturnState.activeCellConfirmed, "state must confirm Signal Chorus ownership.");
assert(frameState.signalChorusReturnState.oldGraveOwnersRelinquished, "state must report Grave ownership relinquished.");
assert(frameState.signalChorusReturnState.oldSignalLoopSuppressed, "state must report Signal replay suppression.");
assert(frameState.targeting.targetId === "none", "stale Grave target must be cleared.");
assert(frameState.targeting.focusProvider === "SignalChorusReturnStateSystem", "targeting must report return-state provider.");
assert(Object.keys(frameState.selectedObject).length === 0, "stale selected object must be cleared.");
assert(!graveRoot.visible, "Grave objects must leave active foreground visibility.");
assert(signalRoot.visible, "Signal Chorus objects must remain visible.");
assert(!graveRoot.userData.absorbed, "hidden Grave objects must remain unconsumed.");
assert(frameState.physicalFeel.boundaryBehavior === "signal_chorus_return_reading_held_no_branch", "return-state physical ownership mismatch.");
assert(frameState.lockState.nextIfPasses.includes("HC-005D"), "stable handoff must point to HC-005C planning.");

// Simulate the exact live contradiction recurring one frame later. The owner
// must repair it every frame rather than only during the completion instant.
frameState.activeCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
frameState.targeting.targetId = "inheritance_seed_remnant_001";
frameState.frame += 1;
system.update(1 / 60, frameState);
assert(frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001", "return state must durably reassert Signal Chorus on later frames.");
assert(frameState.targeting.targetId === "none", "return state must durably clear stale targets on later frames.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "SignalChorusReturnStateSystem", `diagnostic owner mismatch: ${diagnosis.owner}`);
assert(diagnosis.stage === "signal_chorus_return_state_held", `diagnostic stage mismatch: ${diagnosis.stage}`);
assert(diagnosis.complete, "diagnostic must report complete handoff.");
assert(diagnosis.progress === 1, "diagnostic must report 100% progress.");
assert(diagnosis.expectedTarget === "none", "return state must expect no target.");
assert(diagnosis.actualTarget === "none", "return state must publish no actual target.");
assert(diagnosis.blocker === "none_detected", `return state must have no blocker, got ${diagnosis.blocker}.`);

console.log("validateSignalChorusReturnStateHC005B validation passed.");
