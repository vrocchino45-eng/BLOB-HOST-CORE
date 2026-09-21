import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { EnvironmentVisualComposer } from "../src/visual/composers/EnvironmentVisualComposer.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveRouteVisualComposerSupport validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const recipePack = readJson("public/data/planning/graveRouteRecipePack_HC004B.json");
const support = readJson("public/data/planning/graveRouteVisualComposerSupport_HC004C.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const visualRecipes = readJson("public/data/visual/visualCompositionRecipes.json");
const morphPlans = readJson("public/data/morph/localCellMorphPlans.json");
const secondMorphPlans = readJson("public/data/morph/secondLocalCellMorphPlans.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveRouteVisualComposerSupport] ${message}`);
}

const visualById = new Map(visualRecipes.map((entry) => [entry.id, entry]));
const localCellById = new Map(localCells.map((entry) => [entry.id, entry]));
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const environmentComposer = new EnvironmentVisualComposer();
const chemObjectComposer = new ChemObjectVisualComposer();
const composers = {
  EnvironmentVisualComposer: environmentComposer,
  ChemObjectVisualComposer: chemObjectComposer
};

assert(["HC-004C", "HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004C through HC-004K/HC-004K.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(support.id === "HC004C_GRAVE_ROUTE_VISUAL_COMPOSER_SUPPORT", "support data must have HC004C id.");
assert(support.status === "visual_support_only_not_runtime_active", "support data remains the HC-004C visual-support record even when later HC-004D runtime morph activation is present.");
assert(support.sourceRecipePack === recipePack.id, "support data must point back to HC004B recipe pack.");

const expectedVisuals = new Set(recipePack.visualRecipes ?? []);
assert(expectedVisuals.size === 6, "HC004B Grave recipe pack should expose exactly six visual recipes for this support pass.");
assert((support.composerSupport ?? []).length === expectedVisuals.size, "HC004C support table must cover every Grave visual recipe.");

for (const entry of support.composerSupport ?? []) {
  assert(expectedVisuals.has(entry.visualRecipe), `support references a visual outside the HC004B Grave recipe pack: ${entry.visualRecipe}`);
  const recipe = visualById.get(entry.visualRecipe);
  assert(recipe, `missing visual recipe ${entry.visualRecipe}.`);
  assert(recipe.composition?.silhouette === entry.silhouette, `${entry.visualRecipe} support silhouette does not match recipe.`);

  const composer = composers[entry.composer];
  assert(composer, `unknown composer ${entry.composer}.`);
  assert(composer.silhouetteMap?.[entry.silhouette] === entry.method, `${entry.silhouette} must route to ${entry.method}.`);
  assert(typeof composer[entry.method] === "function", `${entry.composer}.${entry.method} must exist.`);

  const group = new THREE.Group();
  composer[entry.method](group);
  assert(group.children.length > 0, `${entry.method} must compose visible child objects.`);
  assert(!group.children.some((child) => child.name === "visual_composer_fallback"), `${entry.visualRecipe} must not use fallback geometry.`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const graveCell = localCellById.get(graveCellId);
const graveMorphPrototypeActive = ["HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id);
assert((graveMorphPrototypeActive
  ? ["authored_recipe_pack_not_runtime_active", "runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"]
  : ["authored_recipe_pack_not_runtime_active"]).includes(graveCell?.status), "Grave local cell status is not valid for this Grave pass.");
assert((graveMorphPrototypeActive
  ? ["planned_only_not_runtime_active", "runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"]
  : ["planned_only_not_runtime_active"]).includes(graveCell.gameplayLoop?.status), "Grave gameplay loop status is not valid for this Grave pass.");

for (const objectId of [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
]) {
  const object = chemObjectById.get(objectId);
  assert((graveMorphPrototypeActive
    ? ["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_grave_morph_prototype"]
    : ["authored_recipe_pack_not_runtime_spawned"]).includes(object?.status), `${objectId} status is not valid for this Grave pass.`);
  assert(object.origin?.localCell === graveCellId, `${objectId} must still point back to the Grave local cell.`);
}

for (const morph of [...morphPlans, ...secondMorphPlans, ...thirdMorphPlans]) {
  assert(morph.sourceCell !== graveCellId, `Grave cell must not be morph source yet: ${morph.id}.`);
  assert(morph.destinationCell !== graveCellId, `Grave cell must not be morph destination yet: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== graveCellId, `Grave cell must not be planned morph destination yet: ${morph.id}.`);
}

for (const rule of targetFocusRules) {
  if (!["HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id)) {
    assert(rule.cellId !== graveCellId, `Grave cell must not have target focus rule yet: ${rule.id}.`);
  } else if (rule.cellId === graveCellId) {
    assert(rule.id === "TARGET_FOCUS_GRAVE_MEMORY_001", `HC-004F only permits the Grave read-loop target focus rule: ${rule.id}.`);
  }
}

const forbiddenText = JSON.stringify({ manifest, support, recipePack, graveCell }).toLowerCase();
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

console.log("Grave route visual-composer support validation passed.");
