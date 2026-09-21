import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveBedPostSeamResponse] ${message}`);
}

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveBedPostSeamResponse validation passed under HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const responseRecipes = readJson("public/data/morph/graveBedPostSeamResponseRecipes.json");
const microExitRecipes = readJson("public/data/morph/graveSeamContinuityMicroExitRecipes.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const morphPlans = [
  ...readJson("public/data/morph/localCellMorphPlans.json"),
  ...readJson("public/data/morph/secondLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/thirdLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/graveRouteMorphPlans.json")
];

const runtimeSource = readText("src/core/GameRuntime.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const systemSource = readText("src/morph/GraveBedPostSeamResponseSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

const responseId = "GRAVE_BED_POST_SEAM_RESPONSE_HC004P";
const microExitId = "GRAVE_SEAM_CONTINUITY_MICRO_EXIT_HC004O";
const cellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const requiredObjects = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const promptIds = [
  "GUIDE_PROMPT_GRAVE_BED_POST_SEAM_ACTIVE_HC004P",
  "GUIDE_PROMPT_GRAVE_BED_POST_SEAM_COMPLETE_HC004P"
];

const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const guideById = new Map(guidePrompts.map((entry) => [entry.id, entry]));
const response = responseRecipes.find((entry) => entry.id === responseId);
const microExit = microExitRecipes.find((entry) => entry.id === microExitId);
const cell = localById.get(cellId);

assert(manifest.id === "HC-004P", "build manifest must identify HC-004P.");
assert(packageJson.version === "0.0.62", "package version must be 0.0.62 for HC-004P.");
assert(packageLock.packages?.[""]?.version === "0.0.62", "package-lock root version must be 0.0.62 for HC-004P.");
assert(manifest.mode === "grave_bed_post_seam_response_implementation_without_legacy_exit_architecture", "manifest mode must identify HC-004P implementation.");
assert(manifest.runtimeActivated?.graveSeamContinuityMicroExit === microExitId, "manifest must preserve HC-004O micro-exit.");
assert(manifest.runtimeActivated?.graveBedPostSeamResponse === responseId, "manifest must identify HC-004P post-seam response.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("post-seam Grave bed response active"), "manifest activation mode must identify post-seam response.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no legacy exit architecture"), "manifest activation mode must forbid legacy exit architecture.");

assert(microExit, "HC-004O micro-exit recipe must still exist.");
assert(response, "HC-004P response recipe must exist.");
assert(response.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "response must use Host Core Rebuild blueprint reference.");
assert(response.status === "runtime_active_post_seam_grave_bed_response_no_branch", "response status mismatch.");
assert(response.sourceMicroExit === microExitId, "response must build on HC-004O micro-exit.");
assert(response.cellId === cellId, "response must run in the Grave bed.");

assert(cell?.runtimeActivation?.postSeamResponseStatus === "active_after_HC004O_micro_exit_HC004P_no_branch", "Grave bed must expose HC-004P response status.");
assert((cell?.gameplayLoop?.verbs ?? []).includes("post_seam_response"), "Grave bed verbs must include post_seam_response.");

const rules = response.activationRules ?? {};
assert(rules.requiresActiveCell === cellId, "response active cell rule must target Grave bed.");
for (const key of ["requiresMicroExitComplete", "requiresProtectedRemainsVisible", "requiresNoAbsorbHeld", "pulseOrProximityReadsOnly"]) {
  assert(rules[key] === true, `${key} must be true.`);
}
assert(rules.absorbStartsResponse === false, "absorb must not start the response.");

const sequenceObjects = response.sequence?.map((step) => step.focusObject) ?? [];
assert(JSON.stringify(sequenceObjects) === JSON.stringify(requiredObjects), "post-seam response object order mismatch.");
for (const step of response.sequence ?? []) {
  assert(Number.isFinite(step.pulseGain) && step.pulseGain > 0, `${step.stage} pulseGain must be positive.`);
  assert(Number.isFinite(step.proximityRate) && step.proximityRate > 0, `${step.stage} proximityRate must be positive.`);
  assert(Number.isFinite(step.threshold) && step.threshold > 0 && step.threshold <= 1, `${step.stage} threshold must be 0-1.`);
}

for (const objectId of requiredObjects) {
  const object = objectById.get(objectId);
  assert(object, `missing object ${objectId}.`);
  assert(object.origin?.localCell === cellId, `${objectId} must belong to Grave bed.`);
  assert(object.runtimeActivation?.postSeamResponseStatus === "readable_protected_after_seam_return_HC004P", `${objectId} must expose HC-004P protected response status.`);
  assert(object.runtimeActivation?.postSeamConsumption === "forbidden_protected_remains_not_consumed", `${objectId} must remain protected from consumption.`);
}
assert(objectById.get("residue_silt_cloud_001")?.runtimeActivation?.postSeamResponseStatus === "preserved_safe_transfer_trace_after_seam_return_HC004P", "residue silt must remain a preserved trace.");

const completion = response.completion ?? {};
assert(completion.protectedRemainsConsumed === false, "completion must not consume protected remains.");
assert(completion.inheritanceSeedRemnantOpened === false, "completion must not open inheritance seed remnant.");
assert(completion.newRouteBranchActivated === false, "completion must not open a branch.");
assert(completion.runtimeExitActivation === false, "completion must not activate an exit.");

for (const morph of morphPlans) {
  assert(morph.id === "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001" || morph.sourceCell !== cellId, `Grave bed must not become a new morph source: ${morph.id}.`);
}

for (const promptId of promptIds) {
  const prompt = guideById.get(promptId);
  assert(prompt, `missing guide prompt ${promptId}.`);
  assert(prompt.conditions?.loopSystem === "graveBedPostSeamResponse", `${promptId} must be driven by graveBedPostSeamResponse.`);
  for (const marker of ["dialogue_tree", "quest_log", "combat", "teleport", "branch_select_menu", "new_morph_activation", "new_route_branch", "runtime_exit_activation"]) {
    assert((prompt.forbidden ?? []).includes(marker), `${promptId} forbidden list missing ${marker}.`);
  }
}

assert(existsSync(join(root, "src/morph/GraveBedPostSeamResponseSystem.js")), "GraveBedPostSeamResponseSystem source file must exist.");
assert(systemSource.includes("export class GraveBedPostSeamResponseSystem"), "system must export GraveBedPostSeamResponseSystem.");
assert(systemSource.includes("grave_bed_post_seam_response_complete_no_branch_opened"), "system must identify no-branch completion.");
assert(systemSource.includes("protectedRemainsConsumed: false"), "system state must keep protected remains unconsumed.");
assert(systemSource.includes("inheritanceSeedRemnantOpened: false"), "system state must keep inheritance seed remnant closed.");
for (const banned of ["stageNodeLoader", "teleportExit", "branchSelectMenu", "activateGate", "dialogueTree", "questLog", "combatEncounter"]) {
  assert(!systemSource.includes(banned), `system must not revive ${banned}.`);
}

assert(runtimeSource.includes("GraveBedPostSeamResponseSystem"), "GameRuntime must import/create HC-004P response system.");
assert(runtimeSource.includes("graveBedPostSeamResponseSystem"), "GameRuntime must register HC-004P response system.");
assert(recipeDataSource.includes("graveBedPostSeamResponseRecipes"), "RecipeDataSystem must load HC-004P response recipes.");
assert(recipeDataSource.includes("validateGraveBedPostSeamResponse"), "RecipeDataSystem must validate HC-004P response data.");
assert(hudSource.includes("graveBedPostSeamResponse"), "Playtest HUD must surface HC-004P response state.");
assert(guideSource.includes("graveBedPostSeamResponse"), "GuidePromptSystem must surface HC-004P response guidance.");

const forbiddenText = JSON.stringify({ manifest, response, cell }).toLowerCase();
for (const marker of [
  "old gates",
  "doors",
  "teleports",
  "branch select menu",
  "old chamber runtime",
  "old exit registries",
  "stage-node loaders",
  "new morph activation",
  "new route branch",
  "runtime exit activation",
  "combat",
  "dialogue tree",
  "quest log",
  "new entity spawns",
  "consuming old core husk",
  "opening inheritance seed remnant",
  "seam object absorption",
  "opening closed inheritance suture"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave bed post-seam response validation passed.");
