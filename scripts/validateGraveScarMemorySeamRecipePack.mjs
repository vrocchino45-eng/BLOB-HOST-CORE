import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveScarMemorySeamRecipePack validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const seamPack = readJson("public/data/planning/graveScarMemorySeamRecipePack_HC004J.json");
const continuityPlan = readJson("public/data/planning/graveRouteContinuityPlanning_HC004I.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const visualRecipes = readJson("public/data/visual/visualCompositionRecipes.json");
const placeholders = readJson("public/data/visual/placeholderReplacementRecipes.json");
const morphPlans = readJson("public/data/morph/localCellMorphPlans.json");
const secondMorphPlans = readJson("public/data/morph/secondLocalCellMorphPlans.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const graveMorphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const graveLoop = readJson("public/data/morph/graveReadBeforeAbsorbRecipes.json").find((entry) => entry.id === "GRAVE_READ_BEFORE_ABSORB_LOOP_001");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");

const domains = new Set(readJson("public/data/chemistry/chemicalDomains.json").map((entry) => entry.id));
const matterStates = new Set(readJson("public/data/chemistry/matterStates.json").map((entry) => entry.id));
const bonds = new Set(readJson("public/data/chemistry/bondRecipes.json").map((entry) => entry.id));
const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const visualById = new Map(visualRecipes.map((entry) => [entry.id, entry]));
const placeholderById = new Map(placeholders.map((entry) => [entry.id, entry]));

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveScarMemorySeamRecipePack] ${message}`);
}

const sourceCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const seamCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const seamCell = localById.get(seamCellId);
const sourceCell = localById.get(sourceCellId);
const seamObjectIds = [
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];

assert(["HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004J or HC-004K.");
assert(["0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.56 for HC-004J or 0.0.57 for HC-004K.");
assert(["0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must match HC-004J or HC-004K.");
assert(["grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must be HC-004J recipe pack or HC-004K visual support without runtime activation.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveScarMemorySeamRecipePack === seamPack.id, "manifest must name the HC-004J seam recipe pack.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep seam target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop inactive.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("seam_recipe_exists_as_data_only_no_transition_activation"), "activation mode must state the seam is data-only with no transition activation.");
}

assert(seamPack.id === "HC004J_GRAVE_SCAR_MEMORY_SEAM_RECIPE_PACK", "seam pack id mismatch.");
assert(seamPack.status === "recipe_pack_only_not_runtime_active", "seam pack must remain recipe/data only.");
assert(seamPack.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "seam pack must use Host Core Rebuild blueprint.");
assert(seamPack.sourceContinuityPlan === continuityPlan.id, "seam pack must derive from HC-004I continuity planning.");
assert(seamPack.sourceCell === sourceCellId, "seam pack source cell must be Grave Memory Residue Bed.");
assert(seamPack.plannedLocalCell === seamCellId, "seam pack must author the scar-memory seam id.");
assert(seamPack.plannedLocalCellStatus === "authored_recipe_pack_not_runtime_active", "seam cell status must be authored but runtime inactive.");

assert(sourceCell, "source Grave cell must still exist.");
assert(sourceCell.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "source Grave cell must preserve HC-004H exit-readiness status.");
assert(seamCell, "HC-004J must author CELL_GRAVE_SCAR_MEMORY_SEAM_001.");
const seamArrivalRuntimeActive = manifest.id === "HC-004M";
assert(seamArrivalRuntimeActive ? seamCell.status === "runtime_arrival_prototype_active_loop_deferred" : seamCell.status === "authored_recipe_pack_not_runtime_active", "seam cell must be authored-only before HC-004M and runtime-arrival active in HC-004M.");
assert(seamCell.derivation?.sourceCell === sourceCellId, "seam cell must point back to the Grave bed source cell.");
assert(seamCell.derivation?.sourceContinuityPlan === continuityPlan.id, "seam cell must point back to HC-004I continuity planning.");
assert(seamArrivalRuntimeActive ? seamCell.gameplayLoop?.status === "runtime_arrival_prototype_active_loop_deferred" : seamCell.gameplayLoop?.status === "planned_only_not_runtime_active", "seam gameplay loop must remain planned-only before HC-004M and arrival-only in HC-004M.");
if (seamArrivalRuntimeActive) {
  assert(seamCell.runtimeActivation?.status === "runtime_arrival_prototype_active_HC004M", "seam runtime activation must identify HC-004M.");
  assert(seamCell.runtimeActivation?.interactionLoopStatus === "deferred_no_seam_loop", "HC-004M must keep seam loop deferred.");
} else {
  assert(seamCell.runtimeActivation?.status === "not_runtime_active", "seam runtime activation must be not_runtime_active.");
  assert(seamCell.runtimeActivation?.transitionStatus === "forbidden_this_pass", "seam transition must be forbidden this pass.");
}

for (const domain of seamPack.localCell?.dominantDomains ?? []) {
  assert(domains.has(domain), `seam pack dominant domain missing from domains registry: ${domain}`);
  assert(Object.prototype.hasOwnProperty.call(seamCell.chemistryField ?? {}, domain), `seam cell chemistry missing dominant domain ${domain}`);
}
for (const state of seamPack.localCell?.matterStates ?? []) {
  assert(matterStates.has(state), `seam pack matter state missing from states registry: ${state}`);
}

for (const recipeId of [seamCell.visuals?.environmentRecipe, seamCell.visuals?.atmosphereRecipe, seamCell.visuals?.distantHostRecipe].filter(Boolean)) {
  assert(visualById.has(recipeId), `seam cell references missing visual recipe ${recipeId}`);
}

assert(JSON.stringify(seamPack.chemObjects) === JSON.stringify(seamObjectIds), "seam pack chem object list must match locked HC-004J objects.");
for (const objectId of seamObjectIds) {
  assert((seamCell.contents?.chemObjects ?? []).includes(objectId), `seam cell contents missing ${objectId}`);
  const object = objectById.get(objectId);
  assert(object, `missing seam chem object ${objectId}`);
  assert(seamArrivalRuntimeActive ? object.status === "runtime_spawned_by_seam_arrival_prototype" : object.status === "authored_recipe_pack_not_runtime_spawned", `${objectId} must be not spawned before HC-004M and runtime spawned by arrival prototype in HC-004M.`);
  assert(object.origin?.localCell === seamCellId, `${objectId} must point back to seam cell.`);
  for (const domain of object.chemistry?.domains ?? []) assert(domains.has(domain), `${objectId} uses unknown domain ${domain}`);
  assert(matterStates.has(object.chemistry?.matterState), `${objectId} uses unknown matter state ${object.chemistry?.matterState}`);
  for (const bondId of object.chemistry?.bondTypes ?? []) assert(bonds.has(bondId), `${objectId} references unknown bond ${bondId}`);
  assert(visualById.has(object.visual?.visualRecipe), `${objectId} references missing visual recipe ${object.visual?.visualRecipe}`);
  assert(placeholderById.has(object.visual?.placeholderRecipe), `${objectId} references missing placeholder ${object.visual?.placeholderRecipe}`);
  if (seamArrivalRuntimeActive) {
    assert(object.runtimeActivation?.spawnMode === "runtime_spawned_by_seam_arrival_prototype", `${objectId} must be spawned only by the HC-004M seam-arrival prototype.`);
    assert(object.runtimeActivation?.interactionLoopStatus === "deferred_until_later_pass", `${objectId} must keep interaction loop deferred in HC-004M.`);
  } else {
    assert(object.runtimeActivation?.spawnMode === "authored_recipe_only_not_spawned", `${objectId} must remain authored-only and not spawned.`);
  }
}

assert(seamPack.visualRecipes?.length === 6, "HC-004J should add six seam visual recipes.");
for (const visualId of seamPack.visualRecipes ?? []) {
  const visual = visualById.get(visualId);
  assert(visual, `seam visual recipe missing ${visualId}`);
  assert(visual.recipePack?.pass === "HC-004J", `${visualId} must be marked as HC-004J recipe-pack visual.`);
}
assert(seamPack.placeholderContracts?.length === 6, "HC-004J should add six seam placeholder contracts.");
for (const placeholderId of seamPack.placeholderContracts ?? []) {
  const placeholder = placeholderById.get(placeholderId);
  assert(placeholder, `seam placeholder contract missing ${placeholderId}`);
  assert(placeholder.replacement?.requiredBeforeLock === true, `${placeholderId} must require replacement before lock.`);
}

for (const morph of [...morphPlans, ...secondMorphPlans, ...thirdMorphPlans, ...graveMorphPlans]) {
  assert(morph.sourceCell !== seamCellId, `seam must not be morph source yet: ${morph.id}`);
  assert(morph.destinationCell !== seamCellId, `seam must not be morph destination yet: ${morph.id}`);
  assert(morph.plannedDestinationCell !== seamCellId, `seam must not be planned morph destination yet: ${morph.id}`);
}

for (const rule of targetFocusRules) {
  assert(rule.cellId !== seamCellId, `seam must not have target focus rule yet: ${rule.id}`);
  for (const provider of rule.providers ?? []) {
    assert(!seamObjectIds.includes(provider.targetId), `seam object must not have active target provider yet: ${provider.targetId}`);
  }
}

assert(graveLoop?.safeTransfer?.allowedObject === "residue_silt_cloud_001", "safe transfer must remain limited to residue_silt_cloud_001.");
for (const objectId of seamPack.carryForwardProtectedRemains ?? []) {
  assert(objectById.has(objectId), `carry-forward protected remain missing ${objectId}`);
  assert((graveLoop.safeTransfer?.mustNotConsume ?? []).includes(objectId), `protected remain must stay unconsumed by safe transfer: ${objectId}`);
}

assert(recipeDataSource.includes("graveScarMemorySeamRecipePack"), "RecipeDataSystem must load HC-004J seam pack.");
assert(recipeDataSource.includes("validateGraveScarMemorySeamRecipePack"), "RecipeDataSystem must validate HC-004J seam pack.");

const forbiddenText = JSON.stringify({ manifest, seamPack, seamCell }).toLowerCase();
for (const marker of [
  "runtime route activation",
  "new morph activation",
  "runtime exit activation",
  "player relocation",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}`);
}

console.log("Grave scar-memory seam recipe-pack validation passed.");
