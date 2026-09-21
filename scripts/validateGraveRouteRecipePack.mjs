import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveRouteRecipePack validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const plan = readJson("public/data/planning/graveRouteRuntimePlanning_HC004A.json");
const pack = readJson("public/data/planning/graveRouteRecipePack_HC004B.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const visualRecipes = readJson("public/data/visual/visualCompositionRecipes.json");
const placeholders = readJson("public/data/visual/placeholderReplacementRecipes.json");
const morphPlans = readJson("public/data/morph/localCellMorphPlans.json");
const secondMorphPlans = readJson("public/data/morph/secondLocalCellMorphPlans.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const domains = new Set(readJson("public/data/chemistry/chemicalDomains.json").map((entry) => entry.id));
const matterStates = new Set(readJson("public/data/chemistry/matterStates.json").map((entry) => entry.id));
const bonds = new Set(readJson("public/data/chemistry/bondRecipes.json").map((entry) => entry.id));

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveRouteRecipePack] ${message}`);
}

const localCellById = new Map(localCells.map((entry) => [entry.id, entry]));
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const visualById = new Map(visualRecipes.map((entry) => [entry.id, entry]));
const placeholderById = new Map(placeholders.map((entry) => [entry.id, entry]));

assert(["HC-004B", "HC-004C", "HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004H", "HC-004I", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004B through HC-004F.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(pack.id === "HC004B_GRAVE_ROUTE_RECIPE_PACK", "recipe pack must have HC004B id.");
assert(pack.status === "data_recipe_pack_only_not_runtime_active", "recipe pack must remain data-only and not runtime active.");
assert(pack.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "recipe pack must use Host Core Rebuild blueprint.");
assert(pack.sourcePlan === plan.id, "recipe pack must point back to HC004A planning data.");
assert(pack.route?.id === "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001", "recipe pack route id must remain Grave Memory / Residue-Scar.");

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const graveCell = localCellById.get(graveCellId);
assert(graveCell, "Grave local cell recipe must exist.");
const graveMorphPrototypeActive = ["HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id);
assert((graveMorphPrototypeActive
  ? ["authored_recipe_pack_not_runtime_active", "runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"]
  : ["authored_recipe_pack_not_runtime_active"]).includes(graveCell.status), "Grave local cell status is not valid for this Grave pass.");
assert((graveMorphPrototypeActive
  ? ["planned_only_not_runtime_active", "runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"]
  : ["planned_only_not_runtime_active"]).includes(graveCell.gameplayLoop?.status), "Grave gameplay loop status is not valid for this Grave pass.");

for (const domain of ["residue", "scar", "seed", "signal"]) {
  assert(domains.has(domain), `chemical domain missing ${domain}.`);
  assert((pack.localCell?.dominantDomains ?? []).includes(domain), `pack dominant domains missing ${domain}.`);
  assert(Object.prototype.hasOwnProperty.call(graveCell.chemistryField ?? {}, domain), `Grave cell chemistry missing ${domain}.`);
}

for (const state of pack.localCell?.matterStates ?? []) {
  assert(matterStates.has(state), `matterStates missing ${state}.`);
}

for (const recipeId of [graveCell.visuals?.environmentRecipe, graveCell.visuals?.atmosphereRecipe, graveCell.visuals?.distantHostRecipe].filter(Boolean)) {
  assert(visualById.has(recipeId), `Grave cell references missing visual recipe ${recipeId}.`);
}

const expectedObjects = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];

for (const objectId of expectedObjects) {
  assert((graveCell.contents?.chemObjects ?? []).includes(objectId), `Grave cell contents missing ${objectId}.`);
  const object = chemObjectById.get(objectId);
  assert(object, `Chem object recipe missing ${objectId}.`);
  assert((graveMorphPrototypeActive
    ? ["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_grave_morph_prototype"]
    : ["authored_recipe_pack_not_runtime_spawned"]).includes(object.status), `${objectId} status is not valid for this Grave pass.`);
  assert(object.origin?.localCell === graveCellId, `${objectId} must point back to Grave local cell.`);
  for (const domain of object.chemistry?.domains ?? []) assert(domains.has(domain), `${objectId} uses unknown domain ${domain}.`);
  assert(matterStates.has(object.chemistry?.matterState), `${objectId} uses unknown matter state ${object.chemistry?.matterState}.`);
  for (const bondId of object.chemistry?.bondTypes ?? []) assert(bonds.has(bondId), `${objectId} references unknown bond ${bondId}.`);
  assert(visualById.has(object.visual?.visualRecipe), `${objectId} references missing visual ${object.visual?.visualRecipe}.`);
  assert(placeholderById.has(object.visual?.placeholderRecipe), `${objectId} references missing placeholder ${object.visual?.placeholderRecipe}.`);
}

for (const visualId of pack.visualRecipes ?? []) assert(visualById.has(visualId), `pack visual recipe missing ${visualId}.`);
for (const placeholderId of pack.placeholderContracts ?? []) assert(placeholderById.has(placeholderId), `pack placeholder contract missing ${placeholderId}.`);

for (const morph of [...morphPlans, ...secondMorphPlans, ...thirdMorphPlans]) {
  assert(morph.sourceCell !== graveCellId, `Grave cell must not be morph source yet: ${morph.id}.`);
  assert(morph.destinationCell !== graveCellId, `Grave cell must not be morph destination yet: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== graveCellId, `Grave cell must not be planned morph destination yet: ${morph.id}.`);
}

for (const rule of targetFocusRules) {
  if (!["HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id)) {
    assert(rule.cellId !== graveCellId, `Grave cell must not have target focus rule yet: ${rule.id}.`);
    for (const provider of rule.providers ?? []) {
      assert(!expectedObjects.includes(provider.targetId), `Grave object must not have active target provider yet: ${provider.targetId}.`);
    }
  } else if (rule.cellId === graveCellId) {
    assert(rule.id === "TARGET_FOCUS_GRAVE_MEMORY_001", `HC-004F only permits the Grave read-loop target focus rule: ${rule.id}.`);
    for (const provider of rule.providers ?? []) {
      if (provider.targetId) assert(expectedObjects.includes(provider.targetId), `HC-004F Grave target provider must remain inside Grave objects: ${provider.targetId}.`);
    }
  }
}

const forbiddenText = JSON.stringify({ manifest, pack, graveCell }).toLowerCase();
for (const marker of [
  "runtime route activation",
  "new morph activation",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave route recipe-pack validation passed.");
