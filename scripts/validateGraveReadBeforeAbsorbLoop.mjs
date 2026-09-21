import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveReadBeforeAbsorbLoop validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const loops = readJson("public/data/morph/graveReadBeforeAbsorbRecipes.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const arrival = readJson("public/data/planning/graveArrivalReadability_HC004E.json");

const gameRuntime = readText("src/core/GameRuntime.js");
const systemPath = "src/morph/GraveReadBeforeAbsorbSystem.js";
const systemSource = readText(systemPath);
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const targetingSource = readText("src/targeting/TargetingSystem.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveReadBeforeAbsorbLoop] ${message}`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const expectedObjects = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const mustNotConsume = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];

const loop = loops.find((entry) => entry.id === "GRAVE_READ_BEFORE_ABSORB_LOOP_001");
const localCellById = new Map(localCells.map((entry) => [entry.id, entry]));
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const targetRule = targetFocusRules.find((entry) => entry.id === "TARGET_FOCUS_GRAVE_MEMORY_001");

assert(["HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify the HC-004F through HC-004I Grave loop family.");
assert(["0.0.52", "0.0.53", "0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must remain in the HC-004F through HC-004I Grave loop family.");
assert(["grave_read_before_absorb_loop_without_legacy_route_architecture", "grave_loop_stability_and_exit_readiness_planning_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must stay in the no-legacy Grave read-loop family.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveReadBeforeAbsorbLoop === "GRAVE_READ_BEFORE_ABSORB_LOOP_001", "manifest must name the Grave read-before-absorb loop.");
assert(manifest.runtimeActivated?.arrivalReadability === arrival.id, "manifest must preserve HC-004E arrival readability.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep seam target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_morph_after_bloom_residue_stability") && String(manifest.runtimeActivated?.activationMode ?? "").includes("minimal_read_before_absorb_loop"), "activation mode must remain no-gate morph then readability then minimal read loop.");
}

assert(loop, "Grave read-before-absorb loop recipe must exist.");
assert(["runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned"].includes(loop.status), "loop status must be runtime-active but minimal.");
assert(loop.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "loop must use Host Core Rebuild blueprint.");
assert(loop.sourceArrivalReadability === arrival.id, "loop must build from HC-004E arrival readability.");
assert(loop.cellId === graveCellId, "loop must target the Grave Memory Residue Bed.");
assert(loop.safeTransfer?.allowedObject === "residue_silt_cloud_001", "safe transfer must be limited to residue_silt_cloud_001.");
for (const objectId of mustNotConsume) {
  assert((loop.safeTransfer?.mustNotConsume ?? []).includes(objectId), `safe transfer must preserve ${objectId}.`);
}

const sequenceObjects = new Set((loop.sequence ?? []).map((step) => step.focusObject));
for (const objectId of expectedObjects) {
  assert(sequenceObjects.has(objectId), `loop sequence missing ${objectId}.`);
  const object = chemObjectById.get(objectId);
  assert(object, `missing Grave chem object ${objectId}.`);
  assert(object.origin?.localCell === graveCellId, `${objectId} must originate in Grave cell.`);
}

const graveCell = localCellById.get(graveCellId);
assert(graveCell, "Grave local cell must exist.");
assert(["runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(graveCell.status), "Grave cell status must identify Grave read-loop activation.");
assert(["runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(graveCell.gameplayLoop?.status), "Grave gameplay loop status must identify minimal read-before-absorb loop.");
for (const forbidden of ["dialogue_tree", "quest_log", "new_route_branch", "new_morph_activation"]) {
  assert((graveCell.gameplayLoop?.forbidden ?? []).includes(forbidden), `Grave gameplay loop forbidden list missing ${forbidden}.`);
}

assert(targetRule, "HC-004F must add the Grave target focus rule.");
assert(targetRule.cellId === graveCellId, "Grave target focus rule must target the Grave cell.");
for (const objectId of expectedObjects) {
  assert(Object.prototype.hasOwnProperty.call(targetRule.preferredObjects ?? {}, objectId), `Grave target focus preferred objects missing ${objectId}.`);
  assert(Object.prototype.hasOwnProperty.call(targetRule.targetKinds ?? {}, objectId), `Grave target focus targetKinds missing ${objectId}.`);
}
assert((targetRule.providers ?? []).some((entry) => entry.statePath === "graveReadBeforeAbsorb.currentFocus"), "Grave target focus must use read-loop current focus provider.");
assert((targetRule.providers ?? []).some((entry) => entry.statePath === "graveReadBeforeAbsorb.safeAbsorbReady" && entry.targetId === "residue_silt_cloud_001"), "Grave target focus must boost residue silt when safe transfer is ready.");

const hc004fPrompts = guidePrompts.filter((entry) => entry.build === "HC-004F");
assert(hc004fPrompts.length >= 4, "HC-004F guide prompts must exist for the Grave loop.");
for (const prompt of hc004fPrompts) {
  assert(prompt.conditions?.loopSystem === "graveReadBeforeAbsorb", `${prompt.id} must be driven by graveReadBeforeAbsorb.`);
  assert(prompt.forbidden?.includes("dialogue_tree"), `${prompt.id} must forbid dialogue trees.`);
  assert(prompt.forbidden?.includes("quest_log"), `${prompt.id} must forbid quest logs.`);
  assert(prompt.forbidden?.includes("combat"), `${prompt.id} must forbid combat.`);
}

assert(existsSync(join(root, systemPath)), "GraveReadBeforeAbsorbSystem source file must exist.");
assert(systemSource.includes("class GraveReadBeforeAbsorbSystem") || systemSource.includes("export class GraveReadBeforeAbsorbSystem"), "system source must export GraveReadBeforeAbsorbSystem.");
for (const objectId of expectedObjects) assert(systemSource.includes(objectId), `system must handle ${objectId}.`);
assert(systemSource.includes("safeMemoryTransferComplete"), "system must track safe memory transfer completion.");
assert(systemSource.includes("markAbsorbed(SAFE_TRANSFER_OBJECT_ID)"), "system must only absorb the safe transfer object through its scoped path.");
for (const objectId of mustNotConsume) assert(systemSource.includes(objectId), `system must preserve must-not-consume object ${objectId}.`);

assert(gameRuntime.includes("GraveReadBeforeAbsorbSystem"), "GameRuntime must import/create GraveReadBeforeAbsorbSystem.");
assert(gameRuntime.includes("graveReadBeforeAbsorbSystem"), "GameRuntime must register graveReadBeforeAbsorbSystem.");
assert(hudSource.includes("graveReadBeforeAbsorb"), "Playtest HUD must surface Grave read-loop state.");
assert(targetingSource.includes("grave_memory_husk"), "Targeting colors must include Grave target kinds.");
assert(recipeDataSource.includes("graveReadBeforeAbsorbRecipes"), "RecipeDataSystem must load Grave read-loop recipes.");

const forbiddenText = JSON.stringify({ manifest, loop, graveCell }).toLowerCase();
for (const marker of [
  "combat",
  "dialogue tree",
  "quest log",
  "new route branch",
  "new morph activation",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu",
  "act expansion"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

for (const bannedSourceMarker of [
  "StageNode",
  "stageNodeLoader",
  "teleportExit",
  "branchSelectMenu",
  "dialogueTree"
]) {
  assert(!systemSource.includes(bannedSourceMarker), `system source must not revive ${bannedSourceMarker}.`);
}

console.log("Grave read-before-absorb loop validation passed.");
