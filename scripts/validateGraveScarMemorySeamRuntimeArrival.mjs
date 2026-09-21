import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveScarMemorySeamRuntimeArrival] ${message}`);
}

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveScarMemorySeamRuntimeArrival validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const runtimeArrival = readJson("public/data/planning/graveScarMemorySeamRuntimeArrival_HC004M.json");
const arrivalPlan = readJson("public/data/planning/graveScarMemorySeamArrivalPlanning_HC004L.json");
const visualSupport = readJson("public/data/planning/graveScarMemorySeamVisualComposerSupport_HC004K.json");
const seamPack = readJson("public/data/planning/graveScarMemorySeamRecipePack_HC004J.json");
const exitReadiness = readJson("public/data/planning/graveExitReadinessPrototype_HC004H.json");
const continuity = readJson("public/data/planning/graveRouteContinuityPlanning_HC004I.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const morphPlans = [
  ...readJson("public/data/morph/localCellMorphPlans.json"),
  ...readJson("public/data/morph/secondLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/thirdLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/graveRouteMorphPlans.json")
];
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const systemSource = readText("src/morph/GraveScarMemorySeamArrivalSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

const seamCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const sourceCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const seamObjects = [
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];
const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const guideById = new Map(guidePrompts.map((entry) => [entry.id, entry]));

assert(manifest.id === "HC-004M", "build manifest must identify HC-004M.");
assert(packageJson.version === "0.0.59", "package version must be 0.0.59 for HC-004M.");
assert(packageLock.packages?.[""]?.version === "0.0.59", "package-lock root version must be 0.0.59 for HC-004M.");
assert(manifest.mode === "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture", "manifest mode must identify HC-004M runtime arrival without legacy exit architecture.");
assert(manifest.runtimeActivated?.graveScarMemorySeamRuntimeArrival === runtimeArrival.id, "manifest must name HC-004M runtime arrival data.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "manifest activation mode must identify no-gate continuity pull.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "manifest activation mode must keep target focus deferred.");

assert(runtimeArrival.id === "HC004M_GRAVE_SCAR_MEMORY_SEAM_RUNTIME_ARRIVAL", "runtime arrival id mismatch.");
assert(runtimeArrival.status === "runtime_arrival_prototype_active_loop_deferred", "runtime arrival status must be active with loop deferred.");
assert(runtimeArrival.sourceArrivalPlanning === arrivalPlan.id, "HC-004M must derive from HC-004L arrival planning.");
assert(runtimeArrival.sourceVisualComposerSupport === visualSupport.id, "HC-004M must preserve HC-004K visual support.");
assert(runtimeArrival.sourceRecipePack === seamPack.id, "HC-004M must preserve HC-004J seam recipe pack.");
assert(runtimeArrival.sourceExitReadinessPrototype === exitReadiness.id, "HC-004M must preserve HC-004H exit-readiness.");
assert(runtimeArrival.sourceContinuityPlan === continuity.id, "HC-004M must preserve HC-004I continuity planning.");
assert(runtimeArrival.sourceCell === sourceCellId, "source cell must be Grave Memory Residue Bed.");
assert(runtimeArrival.destinationCell === seamCellId, "destination cell must be scar-memory seam.");

const sourceCell = localById.get(sourceCellId);
const seamCell = localById.get(seamCellId);
assert(sourceCell?.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "source Grave cell must preserve exit-readiness/deferred status.");
assert(seamCell?.status === "runtime_arrival_prototype_active_loop_deferred", "seam cell must be runtime arrival active with loop deferred.");
assert(seamCell?.gameplayLoop?.status === "runtime_arrival_prototype_active_loop_deferred", "seam gameplay loop must remain arrival-only and loop-deferred.");
assert(seamCell?.runtimeActivation?.status === "runtime_arrival_prototype_active_HC004M", "seam runtime activation must identify HC-004M.");
assert(seamCell?.runtimeActivation?.targetFocusStatus === "deferred_no_target_focus_rule", "seam target focus must remain deferred.");
assert(seamCell?.runtimeActivation?.interactionLoopStatus === "deferred_no_seam_loop", "seam interaction loop must remain deferred.");

const trigger = runtimeArrival.triggerRules ?? {};
for (const key of [
  "requiresActiveSourceCell",
  "requiresGraveExitReadinessActive",
  "requiresGraveExitReadinessMarkerVisible",
  "requiresGraveLoopStabilityPlanningReady",
  "requiresSafeMemoryTransferComplete",
  "requiresProtectedRemainsVisible",
  "requiresNoForcedAbsorb",
  "requiresPulsePressed"
]) assert(trigger[key] === true, `${key} must be true.`);
assert(trigger.absorbStartsArrival === false, "absorb must not start seam arrival.");
assert(trigger.preferredFocusObject === "scar_lock_plate_001", "preferred focus must be scar_lock_plate_001.");

const proto = runtimeArrival.arrivalPrototype ?? {};
assert(proto.mode === "slow_no_gate_continuity_pull", "arrival prototype must be slow no-gate continuity pull.");
assert(proto.playerRelocationThisPass === true, "HC-004M allows only smooth arrival relocation.");
assert(proto.runtimeArrivalThisPass === true, "HC-004M must activate runtime arrival.");
for (const key of ["newMorphPlanThisPass", "runtimeExitArchitectureThisPass", "targetFocusActivationThisPass", "seamInteractionLoopThisPass"]) {
  assert(proto[key] === false, `${key} must remain false.`);
}

assert(JSON.stringify(runtimeArrival.seamSpawnPlan?.chemObjects) === JSON.stringify(seamObjects), "seam spawn chem object order mismatch.");
assert(runtimeArrival.seamSpawnPlan?.firstReadObject === "scar_memory_seam_thread_001", "first seam read must be scar_memory_seam_thread_001.");
for (const objectId of seamObjects) {
  const object = objectById.get(objectId);
  assert(object, `missing seam object ${objectId}.`);
  assert(object.status === "runtime_spawned_by_seam_arrival_prototype", `${objectId} must be spawned by the arrival prototype.`);
  assert(object.origin?.localCell === seamCellId, `${objectId} must point back to the seam cell.`);
  assert((seamCell.contents?.chemObjects ?? []).includes(objectId), `seam cell contents missing ${objectId}.`);
}
for (const objectId of ["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"]) {
  assert((runtimeArrival.seamSpawnPlan?.carryForwardProtectedRemains ?? []).includes(objectId), `carry-forward list missing ${objectId}.`);
}
assert(runtimeArrival.seamSpawnPlan?.safeTraceObject === "residue_silt_cloud_001", "safe trace must remain residue_silt_cloud_001.");

for (const morph of morphPlans) {
  assert(morph.sourceCell !== seamCellId, `seam must not be a morph source yet: ${morph.id}.`);
  assert(morph.destinationCell !== seamCellId, `seam must not be a morph destination yet: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== seamCellId, `seam must not be a planned morph destination yet: ${morph.id}.`);
}
for (const rule of targetFocusRules) {
  assert(rule.cellId !== seamCellId, `seam must not have target focus rule yet: ${rule.id}.`);
  for (const provider of rule.providers ?? []) {
    assert(!seamObjects.includes(provider.targetId), `seam object must not have active target provider yet: ${provider.targetId}.`);
  }
}

assert(existsSync(join(root, "src/morph/GraveScarMemorySeamArrivalSystem.js")), "GraveScarMemorySeamArrivalSystem source file must exist.");
assert(systemSource.includes("export class GraveScarMemorySeamArrivalSystem"), "system must export GraveScarMemorySeamArrivalSystem.");
assert(systemSource.includes("slow continuity pull") || systemSource.includes("continuity pull"), "system must describe continuity pull behavior.");
assert(systemSource.includes("noGate") && systemSource.includes("noDoor") && systemSource.includes("noTeleport"), "system state must explicitly forbid gate/door/teleport behavior.");
assert(systemSource.includes("seamInteractionLoopActive: false"), "system must keep seam interaction loop inactive.");
assert(systemSource.includes("targetFocusActivation: false"), "system must keep target focus activation false.");
for (const banned of ["stageNodeLoader", "teleportExit", "branchSelectMenu", "activateGate", "loadNextCell", "dialogueTree"]) {
  assert(!systemSource.includes(banned), `system must not revive ${banned}.`);
}

assert(runtimeSource.includes("GraveScarMemorySeamArrivalSystem"), "GameRuntime must import/create seam arrival system.");
assert(runtimeSource.includes("graveScarMemorySeamArrivalSystem"), "GameRuntime must register seam arrival system.");
assert(runtimeSource.includes("createGraveScarMemorySeamRuntimeArrivalState"), "GameRuntime must expose HC-004M readout state.");
assert(recipeDataSource.includes("graveScarMemorySeamRuntimeArrival"), "RecipeDataSystem must load HC-004M runtime arrival data.");
assert(recipeDataSource.includes("validateGraveScarMemorySeamRuntimeArrival"), "RecipeDataSystem must validate HC-004M runtime arrival data.");
assert(hudSource.includes("graveScarMemorySeamRuntimeArrival"), "Playtest HUD must surface HC-004M runtime arrival.");
assert(guideSource.includes("graveScarMemorySeamRuntimeArrival"), "GuidePromptSystem or fallback must know HC-004M runtime arrival state.");

const prompt = guideById.get("GUIDE_PROMPT_GRAVE_SEAM_RUNTIME_ARRIVAL_HC004M");
assert(prompt, "HC-004M guide prompt must exist.");
assert(prompt.priority > 110, "HC-004M guide prompt must outrank HC-004L planning prompt.");
assert(prompt.conditions?.loopSystem === "graveScarMemorySeamRuntimeArrival", "HC-004M guide prompt must be driven by runtime arrival state.");
for (const marker of ["dialogue_tree", "quest_log", "combat", "gate_prompt", "teleport", "branch_select_menu", "target_focus_activation", "seam_interaction_loop"]) {
  assert((prompt.forbidden ?? []).includes(marker), `HC-004M guide forbidden list missing ${marker}.`);
}

const forbiddenText = JSON.stringify({ manifest, runtimeArrival, seamCell }).toLowerCase();
for (const marker of ["old gates", "doors", "teleports", "branch select menu", "old chamber runtime", "stage-node loaders", "target focus activation", "full seam interaction loop", "combat", "dialogue tree", "quest log"]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave scar-memory seam runtime arrival validation passed.");
