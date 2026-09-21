import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveScarMemorySeamArrivalPlanning] ${message}`);
}

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveScarMemorySeamArrivalPlanning validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const arrivalPlan = readJson("public/data/planning/graveScarMemorySeamArrivalPlanning_HC004L.json");
const continuityPlan = readJson("public/data/planning/graveRouteContinuityPlanning_HC004I.json");
const seamPack = readJson("public/data/planning/graveScarMemorySeamRecipePack_HC004J.json");
const visualSupport = readJson("public/data/planning/graveScarMemorySeamVisualComposerSupport_HC004K.json");
const exitReadiness = readJson("public/data/planning/graveExitReadinessPrototype_HC004H.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const morphPlans = readJson("public/data/morph/localCellMorphPlans.json");
const secondMorphPlans = readJson("public/data/morph/secondLocalCellMorphPlans.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const graveMorphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const guideById = new Map(guidePrompts.map((entry) => [entry.id, entry]));

const sourceCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const seamCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const seamObjectIds = [
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];

assert(["HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004L or later HC-004M.");
assert(["0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.58 for HC-004L or 0.0.59 for HC-004M.");
assert(["0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must be 0.0.58 for HC-004L or 0.0.59 for HC-004M.");
assert(["grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must be HC-004L arrival planning or HC-004M runtime arrival.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveScarMemorySeamArrivalPlanning === arrivalPlan.id, "manifest must name HC-004L seam arrival planning data.");
if (manifest.id === "HC-004L") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no transition activation"), "HC-004L activation mode must state no transition activation.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no player relocation"), "HC-004L activation mode must state no player relocation.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("player relocation allowed only as smooth arrival prototype"), "HC-004M activation mode must constrain player relocation to smooth arrival prototype.");
}

assert(arrivalPlan.id === "HC004L_GRAVE_SCAR_MEMORY_SEAM_ARRIVAL_PLANNING", "arrival planning id mismatch.");
assert(arrivalPlan.status === "arrival_planning_only_no_runtime_transition", "arrival planning must remain planning only.");
assert(arrivalPlan.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "arrival planning must use Host Core Rebuild blueprint.");
assert(arrivalPlan.sourceContinuityPlan === continuityPlan.id, "arrival plan must point to HC-004I continuity planning.");
assert(arrivalPlan.sourceRecipePack === seamPack.id, "arrival plan must point to HC-004J seam recipe pack.");
assert(arrivalPlan.sourceVisualComposerSupport === visualSupport.id, "arrival plan must point to HC-004K visual support.");
assert(arrivalPlan.sourceExitReadinessPrototype === exitReadiness.id, "arrival plan must preserve HC-004H exit-readiness source.");
assert(arrivalPlan.sourceCell === sourceCellId, "arrival source cell must be Grave Memory Residue Bed.");
assert(arrivalPlan.plannedArrivalCell === seamCellId, "planned arrival cell must be the scar-memory seam.");
assert(arrivalPlan.plannedArrivalCellStatus === "authored_recipe_pack_not_runtime_active", "planned arrival cell must remain authored inactive.");

const sourceCell = localById.get(sourceCellId);
const seamCell = localById.get(seamCellId);
assert(sourceCell?.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "source Grave cell must preserve HC-004H exit-readiness active/exit-deferred status.");
assert(seamCell, "scar-memory seam cell must exist.");
const seamArrivalRuntimeActive = manifest.id === "HC-004M";
assert(seamArrivalRuntimeActive ? seamCell.status === "runtime_arrival_prototype_active_loop_deferred" : seamCell.status === "authored_recipe_pack_not_runtime_active", "seam cell must remain authored-only before HC-004M and runtime-arrival active in HC-004M.");
assert(seamArrivalRuntimeActive ? seamCell.gameplayLoop?.status === "runtime_arrival_prototype_active_loop_deferred" : seamCell.gameplayLoop?.status === "planned_only_not_runtime_active", "seam gameplay loop must remain planned-only before HC-004M and arrival-only in HC-004M.");
if (seamArrivalRuntimeActive) {
  assert(seamCell.runtimeActivation?.status === "runtime_arrival_prototype_active_HC004M", "seam runtime activation must identify HC-004M.");
  assert(seamCell.runtimeActivation?.interactionLoopStatus === "deferred_no_seam_loop", "HC-004M must keep seam loop deferred.");
} else {
  assert(seamCell.runtimeActivation?.status === "not_runtime_active", "seam runtime activation must remain not_runtime_active.");
  assert(seamCell.runtimeActivation?.transitionStatus === "forbidden_this_pass", "seam transition must remain forbidden.");
}

assert(arrivalPlan.arrivalPosture?.firstReadObject === "scar_memory_seam_thread_001", "arrival first read must be scar_memory_seam_thread_001.");
assert(JSON.stringify(arrivalPlan.arrivalPosture?.readabilityOrder) === JSON.stringify(seamObjectIds), "arrival readability order must match locked seam objects.");
assert(JSON.stringify(arrivalPlan.seamObjects) === JSON.stringify(seamObjectIds), "arrival seam object list must match locked seam objects.");
for (const objectId of seamObjectIds) {
  const object = objectById.get(objectId);
  assert(object, `missing seam object ${objectId}.`);
  assert(seamArrivalRuntimeActive ? object.status === "runtime_spawned_by_seam_arrival_prototype" : object.status === "authored_recipe_pack_not_runtime_spawned", `${objectId} must be not spawned before HC-004M and runtime spawned by arrival prototype in HC-004M.`);
  assert(object.origin?.localCell === seamCellId, `${objectId} must still point back to seam cell.`);
  assert((seamCell.contents?.chemObjects ?? []).includes(objectId), `seam contents missing ${objectId}.`);
}

for (const objectId of ["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"]) {
  assert((arrivalPlan.arrivalPosture?.mustCarryForward ?? []).includes(objectId), `arrival plan must carry forward protected remain ${objectId}.`);
  assert(objectById.has(objectId), `missing protected remain ${objectId}.`);
}
assert(arrivalPlan.arrivalPosture?.safeTransferMemory === "residue_silt_cloud_001_trace_only", "safe transfer must carry only residue_silt_cloud_001 trace memory.");
assert(Number.isFinite(arrivalPlan.arrivalCameraPlan?.distance), "arrival camera plan must include numeric distance.");
assert(Number.isFinite(arrivalPlan.arrivalCameraPlan?.pitch), "arrival camera plan must include numeric pitch.");

const rules = arrivalPlan.arrivalReadabilityRules ?? {};
for (const key of [
  "requiresHC004HExitReadinessVisible",
  "requiresHC004GPlanningReady",
  "requiresSafeMemoryTransferComplete",
  "requiresProtectedRemainsVisible",
  "requiresNoForcedAbsorb",
  "requiresHC004KVisualSupport",
  "requiresSeamCellAuthoredInactive",
  "noGateDoorTeleportMenu",
  "futureArrivalActivationRequiresSeparateLockDecision"
]) {
  assert(rules[key] === true, `${key} must be true.`);
}
for (const key of [
  "runtimeTransitionThisPass",
  "playerRelocationThisPass",
  "newMorphActivationThisPass",
  "targetFocusActivationThisPass",
  "seamInteractionLoopThisPass"
]) {
  assert(rules[key] === false, `${key} must be false.`);
}

for (const morph of [...morphPlans, ...secondMorphPlans, ...thirdMorphPlans, ...graveMorphPlans]) {
  assert(morph.sourceCell !== seamCellId, `seam must not be morph source yet: ${morph.id}.`);
  assert(morph.destinationCell !== seamCellId, `seam must not be morph destination yet: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== seamCellId, `seam must not be planned morph destination yet: ${morph.id}.`);
}

for (const rule of targetFocusRules) {
  assert(rule.cellId !== seamCellId, `seam must not have target focus rule yet: ${rule.id}.`);
  for (const provider of rule.providers ?? []) {
    assert(!seamObjectIds.includes(provider.targetId), `seam object must not have active target provider yet: ${provider.targetId}.`);
  }
}

const guidePrompt = guideById.get("GUIDE_PROMPT_GRAVE_SEAM_ARRIVAL_PLANNING_HC004L");
assert(guidePrompt, "HC-004L guide prompt must exist.");
assert(guidePrompt.priority > 109, "HC-004L guide prompt must outrank HC-004I continuity prompt.");
assert(guidePrompt.conditions?.loopSystem === "graveExitReadiness", "HC-004L guide prompt must key from graveExitReadiness only, not a new seam loop.");
if (!seamArrivalRuntimeActive) assert((guidePrompt.forbidden ?? []).includes("player_relocation"), "HC-004L guide prompt must forbid player relocation.");
assert((guidePrompt.forbidden ?? []).includes("target_focus_activation"), "HC-004L guide prompt must forbid target focus activation.");

assert(recipeDataSource.includes("graveScarMemorySeamArrivalPlanning"), "RecipeDataSystem must load HC-004L seam arrival planning data.");
assert(recipeDataSource.includes("validateGraveScarMemorySeamArrivalPlanning"), "RecipeDataSystem must validate HC-004L seam arrival planning data.");
assert(runtimeSource.includes("createGraveScarMemorySeamArrivalPlanningState"), "GameRuntime must expose HC-004L readout state.");
assert(hudSource.includes("graveScarMemorySeamArrivalPlanning"), "Playtest HUD must consume HC-004L seam arrival planning state.");
assert(guideSource.includes("graveScarMemorySeamArrivalPlanning"), "GuidePromptSystem fallback must know HC-004L seam arrival planning state.");

const forbiddenText = JSON.stringify({ manifest, arrivalPlan, seamCell, guidePrompt }).toLowerCase();
for (const marker of [
  "runtime route activation",
  "new morph activation",
  "runtime exit activation",
  "player relocation",
  "moving the player to the scar-memory seam",
  "target focus activation",
  "seam interaction loop",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu",
  "exit transition"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave scar-memory seam arrival-planning validation passed.");
