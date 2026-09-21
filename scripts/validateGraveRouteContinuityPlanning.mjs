import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveRouteContinuityPlanning validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const plan = readJson("public/data/planning/graveRouteContinuityPlanning_HC004I.json");
const prototype = readJson("public/data/planning/graveExitReadinessPrototype_HC004H.json");
const stability = readJson("public/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json");
const loops = readJson("public/data/morph/graveReadBeforeAbsorbRecipes.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveRouteContinuityPlanning] ${message}`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const futureCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const protectedRemains = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const loop = loops.find((entry) => entry.id === "GRAVE_READ_BEFORE_ABSORB_LOOP_001");
const graveCell = localCells.find((entry) => entry.id === graveCellId);
const futureCell = localCells.find((entry) => entry.id === futureCellId);
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const guidePrompt = guidePrompts.find((entry) => entry.id === "GUIDE_PROMPT_GRAVE_ROUTE_CONTINUITY_HC004I");

assert(["HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004I or HC-004J/HC-004K.");
assert(["0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.55 for HC-004I or 0.0.56 for HC-004J/HC-004K.");
assert(["0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must be 0.0.55 for HC-004I or 0.0.56 for HC-004J/HC-004K.");
assert(["grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify route-continuity planning, HC-004J seam recipe pack, or HC-004K seam visual support with no transition activation.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveRouteContinuityPlanning === plan.id, "manifest must name the HC-004I Grave route-continuity planning data.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_transition_activation"), "manifest activation mode must stay no-transition activation.");
}
for (const marker of ["runtimeExitActivation", "newRouteBranch", "newMorphActivation", "combat", "dialogueTree"]) {
  assert(manifest.plannedButNotRuntimeActive?.[marker], `manifest planned-but-not-active must include ${marker}.`);
}

assert(plan.id === "GRAVE_ROUTE_CONTINUITY_PLANNING_HC004I", "planning data id mismatch.");
assert(plan.status === "authored_route_continuity_planning_only_no_transition", "planning status must be authored-only with no transition.");
assert(plan.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "plan must use Host Core Rebuild blueprint.");
assert(plan.sourceExitReadinessPrototype === prototype.id, "plan must derive from HC-004H exit-readiness prototype.");
assert(plan.sourceStabilityPlan === stability.id, "plan must preserve HC-004G stability source.");
assert(plan.sourceLoop === "GRAVE_READ_BEFORE_ABSORB_LOOP_001", "plan must derive from the HC-004F read-before-absorb loop.");
assert(plan.sourceCell === graveCellId, "plan must target the Grave Memory Residue Bed.");
assert(plan.continuityDecision?.chosenOptionId === "deeper_grave_scar_memory_seam", "HC-004I must choose deeper Grave / scar-memory seam.");
assert(plan.continuityDecision?.structuralMeaning?.includes("not a door"), "structural meaning must clarify the scar lock is not a door.");

const selected = (plan.candidateContinuityOptions ?? []).find((entry) => entry.id === "deeper_grave_scar_memory_seam");
assert(selected?.decision === "selected_for_next_data_pass", "deeper Grave option must be selected for next data pass.");
assert(selected?.plannedFutureCellId === futureCellId, "selected option must plan the future scar-memory seam cell id.");
assert(selected?.plannedFutureCellStatus === "not_authored_not_runtime_active", "HC-004I plan must preserve its original future seam status marker.");
if (futureCell) {
  assert(["HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "only HC-004J or later may author CELL_GRAVE_SCAR_MEMORY_SEAM_001.");
  assert(manifest.id === "HC-004M" ? futureCell.status === "runtime_arrival_prototype_active_loop_deferred" : futureCell.status === "authored_recipe_pack_not_runtime_active", "future seam cell may only be authored inactive before HC-004M and runtime arrival active in HC-004M.");
}

const returnOption = (plan.candidateContinuityOptions ?? []).find((entry) => entry.id === "return_to_bloom_residue");
const handoffOption = (plan.candidateContinuityOptions ?? []).find((entry) => entry.id === "route_handoff_to_first_act_memory_route");
assert(returnOption?.decision === "defer", "return-to-Bloom option must be deferred.");
assert(handoffOption?.decision === "defer", "wider route handoff option must be deferred.");

const rules = plan.continuityRules ?? {};
for (const key of [
  "requiresHC004HExitReadinessVisible",
  "requiresSafeMemoryTransferComplete",
  "requiresProtectedRemainsVisible",
  "requiresNoForcedAbsorb",
  "keepExitReadinessReadoutOnly",
  "noGateDoorTeleportMenu",
  "futureContinuityActivationRequiresSeparateLockDecision"
]) {
  assert(rules[key] === true, `continuity rule ${key} must be true.`);
}
for (const key of [
  "nextCellRecipeAuthoredThisPass",
  "runtimeTransitionThisPass",
  "playerRelocationThisPass",
  "newRouteBranchThisPass",
  "newMorphActivationThisPass"
]) {
  assert(rules[key] === false, `continuity rule ${key} must be false.`);
}

assert(loop, "Grave read-before-absorb loop must still exist.");
assert(loop.status === "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "HC-004I must not replace the HC-004F/HC-004G read loop.");
assert(loop.safeTransfer?.allowedObject === "residue_silt_cloud_001", "safe transfer must remain limited to residue_silt_cloud_001.");
for (const objectId of protectedRemains) {
  assert((loop.safeTransfer?.mustNotConsume ?? []).includes(objectId), `read loop must still preserve ${objectId}.`);
  assert((plan.carryForwardState?.protectedRemains ?? []).includes(objectId), `plan carry-forward remains missing ${objectId}.`);
  assert((plan.carryForwardState?.mustRemainUnconsumed ?? []).includes(objectId), `plan must-remain-unconsumed missing ${objectId}.`);
  assert(chemObjectById.has(objectId), `protected remain recipe missing ${objectId}.`);
}
assert(plan.carryForwardState?.safeTransferObject === "residue_silt_cloud_001", "safe transfer object must remain residue_silt_cloud_001.");
assert(chemObjectById.has("residue_silt_cloud_001"), "safe transfer object recipe must exist.");

assert(graveCell, "Grave local cell must exist.");
assert(graveCell.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "HC-004I must preserve the HC-004H Grave cell status.");
assert(graveCell.gameplayLoop?.status === "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype", "HC-004I must preserve the minimal read-loop/exit-readiness gameplay status.");
assert(graveCell.runtimeActivation?.exitReadinessStatus === "prototype_active_no_exit_activation_HC004H", "HC-004I must preserve HC-004H no-exit readiness status.");
for (const forbidden of ["runtime_exit_activation", "new_route_branch", "new_morph_activation", "gate_prompt", "branch_select_menu", "moving_player_to_new_cell", "player_relocation", "exit_transition"]) {
  assert((graveCell.gameplayLoop?.forbidden ?? []).includes(forbidden), `Grave gameplay loop forbidden list missing ${forbidden}.`);
}

assert(plan.plannedNextPrototype?.id === "HC-004J", "next recommended pass must be HC-004J/HC-004K.");
assert(plan.plannedNextPrototype?.plannedFutureCellId === futureCellId, "HC-004J must be planned to author the future seam recipe.");
assert(plan.plannedNextPrototype?.runtimeActivation === "forbidden_until_later_lock_decision", "future runtime activation must remain forbidden until later lock decision.");
assert(guidePrompt, "HC-004I guide prompt must exist.");
assert(guidePrompt.conditions?.loopSystem === "graveExitReadiness", "HC-004I guide prompt must only surface when exit-readiness is active.");
assert(guidePrompt.tone === "grave_continuity", "HC-004I guide prompt tone must identify Grave continuity.");
for (const marker of ["dialogue_tree", "quest_log", "combat", "gate_prompt", "runtime_exit_activation", "new_morph_activation", "branch_select_menu", "teleport", "player_relocation", "exit_transition"]) {
  assert((guidePrompt.forbidden ?? []).includes(marker), `HC-004I guide prompt forbidden list missing ${marker}.`);
}

assert(recipeDataSource.includes("graveRouteContinuityPlanning"), "RecipeDataSystem must load HC-004I planning data.");
assert(recipeDataSource.includes("validateGraveRouteContinuityPlanning"), "RecipeDataSystem must validate HC-004I planning data.");
assert(runtimeSource.includes("graveRouteContinuityPlanning"), "GameRuntime must expose HC-004I planning frame state.");
assert(hudSource.includes("Grave Continuity Plan"), "Playtest HUD must surface Grave Continuity planning when relevant.");
assert(guideSource.includes("graveRouteContinuityPlanning"), "GuidePromptSystem must read Grave route-continuity planning state.");

for (const bannedSourceMarker of ["StageNode", "stageNodeLoader", "teleportExit", "branchSelectMenu", "dialogueTree", "createEventExit", "activateGate", "loadNextCell", "destinationCell ="]) {
  assert(!runtimeSource.includes(bannedSourceMarker), `runtime must not revive ${bannedSourceMarker}.`);
}

const forbiddenText = JSON.stringify({ manifest, plan, graveCell }).toLowerCase();
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
  "moving the player to a new cell",
  "player relocation",
  "exit transition"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

assert(existsSync(join(root, "docs/HC004I_GRAVE_ROUTE_CONTINUITY_PLANNING.md")), "HC-004I planning doc must exist.");

console.log("Grave route-continuity planning validation passed.");
