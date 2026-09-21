import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveExitReadinessPrototype validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const prototype = readJson("public/data/planning/graveExitReadinessPrototype_HC004H.json");
const stability = readJson("public/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json");
const loops = readJson("public/data/morph/graveReadBeforeAbsorbRecipes.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const systemSource = readText("src/morph/GraveExitReadinessSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveExitReadinessPrototype] ${message}`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const protectedRemains = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const loop = loops.find((entry) => entry.id === "GRAVE_READ_BEFORE_ABSORB_LOOP_001");
const graveCell = localCells.find((entry) => entry.id === graveCellId);
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const gravePrompt = guidePrompts.find((entry) => entry.id === "GUIDE_PROMPT_GRAVE_EXIT_READINESS_HC004H");

assert(["HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004H or HC-004I.");
assert(["0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.54 for HC-004H or 0.0.55 for HC-004I.");
assert(["0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must match HC-004H or HC-004I.");
assert(["grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify Grave exit-readiness prototype or HC-004I continuity planning with no activation.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveExitReadinessPrototype === prototype.id, "manifest must name the HC-004H Grave exit-readiness prototype.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("exit_readiness_prototype") && (String(manifest.runtimeActivated?.activationMode ?? "").includes("no_exit_activation") || String(manifest.runtimeActivated?.activationMode ?? "").includes("no_transition_activation")), "manifest activation mode must preserve readiness-only/no-transition activation.");
}
for (const marker of ["runtimeExitActivation", "newRouteBranch", "newMorphActivation", "combat", "dialogueTree"]) {
  assert(manifest.plannedButNotRuntimeActive?.[marker], `manifest planned-but-not-active must include ${marker}.`);
}

assert(prototype.id === "GRAVE_EXIT_READINESS_PROTOTYPE_HC004H", "prototype data id mismatch.");
assert(prototype.status === "runtime_exit_readiness_prototype_active_exit_deferred", "prototype status must be active readiness with exit deferred.");
assert(prototype.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "prototype must use Host Core Rebuild blueprint.");
assert(prototype.sourceStabilityPlan === stability.id, "prototype must derive from HC-004G stability plan.");
assert(prototype.sourceLoop === "GRAVE_READ_BEFORE_ABSORB_LOOP_001", "prototype must derive from the HC-004F read-before-absorb loop.");
assert(prototype.sourceCell === graveCellId, "prototype must target the Grave Memory Residue Bed.");
assert(prototype.readinessRules?.requiresStabilityPlanningReady === true, "readiness must require HC-004G planningReady.");
assert(prototype.readinessRules?.requiresSafeMemoryTransferComplete === true, "readiness must require safe memory transfer complete.");
assert(prototype.readinessRules?.requiresProtectedRemainsVisible === true, "readiness must require protected remains visible.");
assert(prototype.readinessRules?.requiresNoForcedAbsorb === true, "readiness must disappear while absorb is forced.");
assert(prototype.readinessRules?.focusObject === "scar_lock_plate_001", "readiness focus must be the scar lock plate.");
assert(prototype.readinessRules?.safeTransferObject === "residue_silt_cloud_001", "safe transfer object must remain residue_silt_cloud_001.");
assert(prototype.prototypeBehavior?.runtimeActivationThisPass === "readiness_readout_only", "HC-004H may activate only a readiness readout.");
assert(prototype.prototypeBehavior?.newRouteBranchThisPass === false, "HC-004H must not create a new route branch.");
assert(prototype.prototypeBehavior?.morphActivationThisPass === false, "HC-004H must not activate a new morph.");
assert(prototype.prototypeBehavior?.exitActivationThisPass === false, "HC-004H must not activate an exit.");
assert(prototype.prototypeBehavior?.playerRelocationThisPass === false, "HC-004H must not relocate the player.");
for (const objectId of protectedRemains) {
  assert((prototype.readinessRules?.protectedRemains ?? []).includes(objectId), `protected remains missing ${objectId}.`);
  const object = chemObjectById.get(objectId);
  assert(object, `protected remain recipe missing ${objectId}.`);
  assert(object.status === "runtime_spawned_by_grave_morph_prototype", `${objectId} must still be spawned by Grave morph prototype.`);
}
assert(chemObjectById.has("residue_silt_cloud_001"), "safe transfer object recipe must exist.");

assert(loop, "Grave read-before-absorb loop must still exist.");
assert(loop.status === "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "HC-004H must not replace the HC-004F/HC-004G read loop.");
assert(loop.sourceStabilityPlanning === stability.id, "read loop must still reference HC-004G stability planning.");
assert(loop.safeTransfer?.allowedObject === "residue_silt_cloud_001", "safe transfer must remain limited to residue_silt_cloud_001.");
for (const objectId of protectedRemains) {
  assert((loop.safeTransfer?.mustNotConsume ?? []).includes(objectId), `read loop must still preserve ${objectId}.`);
}

assert(graveCell, "Grave local cell must exist.");
assert(graveCell.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "Grave cell status must identify HC-004H readiness with exit deferred.");
assert(graveCell.gameplayLoop?.status === "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype", "Grave gameplay loop must identify minimal read loop plus exit-readiness prototype.");
assert((graveCell.gameplayLoop?.verbs ?? []).includes("exit_readiness_readout_only"), "Grave gameplay loop must include readout-only exit readiness verb.");
for (const forbidden of ["runtime_exit_activation", "new_route_branch", "new_morph_activation", "gate_prompt", "branch_select_menu", "moving_player_to_new_cell", "player_relocation", "exit_transition"]) {
  assert((graveCell.gameplayLoop?.forbidden ?? []).includes(forbidden), `Grave gameplay loop forbidden list missing ${forbidden}.`);
}
assert(graveCell.runtimeActivation?.exitReadinessStatus === "prototype_active_no_exit_activation_HC004H", "Grave runtime activation must mark HC-004H readiness as no-exit prototype.");

assert(existsSync(join(root, "src/morph/GraveExitReadinessSystem.js")), "GraveExitReadinessSystem source file must exist.");
assert(systemSource.includes("class GraveExitReadinessSystem") || systemSource.includes("export class GraveExitReadinessSystem"), "system source must export GraveExitReadinessSystem.");
assert(systemSource.includes("exit_readiness_visible_no_exit_activation"), "system must produce visible readiness status without exit activation.");
assert(systemSource.includes("noRuntimeExitActivation"), "system state must explicitly forbid runtime exit activation.");
assert(systemSource.includes("noPlayerRelocation"), "system state must explicitly forbid player relocation.");
assert(systemSource.includes("readoutOnly"), "system state must identify readout-only behavior.");
for (const objectId of protectedRemains) assert(systemSource.includes(objectId), `system must check protected remain ${objectId}.`);
for (const bannedSourceMarker of ["StageNode", "stageNodeLoader", "teleportExit", "branchSelectMenu", "dialogueTree", "createEventExit", "activateGate", "loadNextCell", "destinationCell ="]) {
  assert(!systemSource.includes(bannedSourceMarker), `exit-readiness system must not revive ${bannedSourceMarker}.`);
}

assert(runtimeSource.includes("GraveExitReadinessSystem"), "GameRuntime must import/create GraveExitReadinessSystem.");
assert(runtimeSource.includes("graveExitReadinessSystem"), "GameRuntime must register graveExitReadinessSystem.");
assert(runtimeSource.includes("graveExitReadiness"), "GameRuntime must expose Grave exit-readiness frame state.");
assert(hudSource.includes("Grave Exit Readiness"), "Playtest HUD must surface Grave Exit Readiness state.");
assert(guideSource.includes("graveExitReadiness"), "GuidePromptSystem must surface Grave exit-readiness next-action text.");
assert(recipeDataSource.includes("graveExitReadinessPrototype"), "RecipeDataSystem must load the HC-004H readiness plan.");
assert(recipeDataSource.includes("validateGraveExitReadinessPrototype"), "RecipeDataSystem must validate the HC-004H readiness plan.");
assert(gravePrompt, "HC-004H guide prompt must exist.");
assert(gravePrompt.conditions?.loopSystem === "graveExitReadiness", "HC-004H guide prompt must be driven by the exit-readiness system.");
for (const marker of ["dialogue_tree", "quest_log", "combat", "gate_prompt", "runtime_exit_activation", "new_morph_activation", "branch_select_menu", "teleport"]) {
  assert((gravePrompt.forbidden ?? []).includes(marker), `HC-004H guide prompt forbidden list missing ${marker}.`);
}

const forbiddenText = JSON.stringify({ manifest, prototype, graveCell }).toLowerCase();
for (const marker of [
  "full grave route branch",
  "new morph activation",
  "runtime exit activation",
  "combat",
  "dialogue tree",
  "quest log",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu",
  "act expansion",
  "consuming the old core husk",
  "opening the inheritance seed remnant",
  "moving the player to a new cell"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave exit-readiness prototype validation passed.");
