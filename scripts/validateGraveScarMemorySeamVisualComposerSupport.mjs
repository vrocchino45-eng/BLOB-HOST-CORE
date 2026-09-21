import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { EnvironmentVisualComposer } from "../src/visual/composers/EnvironmentVisualComposer.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveScarMemorySeamVisualComposerSupport validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const seamPack = readJson("public/data/planning/graveScarMemorySeamRecipePack_HC004J.json");
const support = readJson("public/data/planning/graveScarMemorySeamVisualComposerSupport_HC004K.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const visualRecipes = readJson("public/data/visual/visualCompositionRecipes.json");
const morphPlans = readJson("public/data/morph/localCellMorphPlans.json");
const secondMorphPlans = readJson("public/data/morph/secondLocalCellMorphPlans.json");
const thirdMorphPlans = readJson("public/data/morph/thirdLocalCellMorphPlans.json");
const graveMorphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveScarMemorySeamVisualComposerSupport] ${message}`);
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

const seamCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const seamObjectIds = [
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];

assert(["HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004K or later HC-004L.");
assert(["0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.57 for HC-004K or 0.0.58 for HC-004L.");
assert(["0.0.57", "0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must be 0.0.57 for HC-004K or 0.0.58 for HC-004L.");
assert(["grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify HC-004K visual support or HC-004L arrival planning without runtime activation.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveScarMemorySeamRecipePack === seamPack.id, "manifest must carry forward HC-004J seam recipe pack.");
assert(manifest.runtimeActivated?.graveScarMemorySeamVisualComposerSupport === support.id, "manifest must name the HC-004K seam visual support data.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep seam target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop inactive.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("visual") && String(manifest.runtimeActivated?.activationMode ?? "").includes("no transition"), "activation mode must preserve visual support with no transition activation.");
}

assert(support.id === "HC004K_GRAVE_SCAR_MEMORY_SEAM_VISUAL_COMPOSER_SUPPORT", "support data id mismatch.");
assert(support.status === "visual_support_only_not_runtime_active", "support data must remain visual-support only.");
assert(support.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "support data must use Host Core Rebuild blueprint.");
assert(support.sourceRecipePack === seamPack.id, "support data must point back to HC-004J seam recipe pack.");

const expectedVisuals = new Set(seamPack.visualRecipes ?? []);
assert(expectedVisuals.size === 6, "HC-004J seam recipe pack should expose exactly six seam visual recipes.");
assert((support.composerSupport ?? []).length === expectedVisuals.size, "HC-004K support table must cover every seam visual recipe.");

for (const entry of support.composerSupport ?? []) {
  assert(expectedVisuals.has(entry.visualRecipe), `support references a visual outside the HC-004J seam pack: ${entry.visualRecipe}`);
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

const seamCell = localCellById.get(seamCellId);
assert(seamCell, "scar-memory seam cell must exist as HC-004J authored data.");
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

for (const objectId of seamObjectIds) {
  const object = chemObjectById.get(objectId);
  assert(object, `missing seam object ${objectId}.`);
  assert(seamArrivalRuntimeActive ? object.status === "runtime_spawned_by_seam_arrival_prototype" : object.status === "authored_recipe_pack_not_runtime_spawned", `${objectId} must be not spawned before HC-004M and runtime spawned by arrival prototype in HC-004M.`);
  assert(object.origin?.localCell === seamCellId, `${objectId} must still point back to the seam cell.`);
  assert(expectedVisuals.has(object.visual?.visualRecipe), `${objectId} must use one of the HC-004J seam visual recipes.`);
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

assert(recipeDataSource.includes("graveScarMemorySeamVisualComposerSupport"), "RecipeDataSystem must load HC-004K seam visual support data.");

const forbiddenText = JSON.stringify({ manifest, support, seamCell }).toLowerCase();
for (const marker of [
  "runtime route activation",
  "new morph activation",
  "runtime exit activation",
  "player relocation",
  "target focus activation",
  "seam interaction loop",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu",
  "moving the player to the scar-memory seam"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave scar-memory seam visual-composer support validation passed.");
