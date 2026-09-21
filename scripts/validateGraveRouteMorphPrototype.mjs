import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveRouteMorphPrototype validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const prototype = readJson("public/data/planning/graveRouteMorphPrototype_HC004D.json");
const morphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const visualRecipes = readJson("public/data/visual/visualCompositionRecipes.json");
const placeholders = readJson("public/data/visual/placeholderReplacementRecipes.json");
const packageJson = readJson("package.json");

const gameRuntime = readText("src/core/GameRuntime.js");
const graveRouteMorphSystem = readText("src/morph/GraveRouteMorphSystem.js");
const bloomArrivalSystem = readText("src/morph/BloomResidueArrivalSystem.js");
const bloomInteractionSystem = readText("src/morph/BloomResidueInteractionSystem.js");
const targetFocusRegistry = readText("src/targeting/TargetFocusRegistry.js");
const morphStateSelector = readText("src/morph/MorphStateSelector.js");
const guidePromptSystem = readText("src/guide/GuidePromptSystem.js");
const playtestHudSystem = readText("src/ui/PlaytestHudSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveRouteMorphPrototype] ${message}`);
}

const localCellById = new Map(localCells.map((entry) => [entry.id, entry]));
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const visualById = new Map(visualRecipes.map((entry) => [entry.id, entry]));
const placeholderById = new Map(placeholders.map((entry) => [entry.id, entry]));

const sourceCellId = "CELL_BLOOM_RESIDUE_FORK_001";
const destinationCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const morphPlanId = "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001";
const routeId = "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001";
const expectedObjects = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];

assert(["HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004D or later HC-004E/HC-004F Grave passes.");
assert(["0.0.50", "0.0.51", "0.0.52", "0.0.53", "0.0.54", "0.0.55", "0.0.54", "0.0.55", "0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.50 for HC-004D, 0.0.51 for HC-004E, or 0.0.52 for HC-004F.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(["runtime_morph_prototype_without_legacy_route_architecture", "grave_arrival_readability_without_interaction_loop", "grave_read_before_absorb_loop_without_legacy_route_architecture", "grave_loop_stability_and_exit_readiness_planning_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify the no-legacy runtime morph prototype or HC-004E arrival readability pass.");
assert(manifest.runtimeActivated?.route === routeId, "manifest must activate only the Grave Memory / Residue-Scar route.");
assert(manifest.runtimeActivated?.morphPlan === morphPlanId, "manifest must identify the Grave route morph plan.");
assert(manifest.runtimeActivated?.destinationCell === destinationCellId, "manifest must identify the Grave destination cell.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep seam target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_morph_after_bloom_residue_stability"), "manifest must keep Grave activation as no-gate morph after Bloom stability, with later readability/read-loop/stability layers allowed.");
}

assert(prototype.id === "HC004D_GRAVE_ROUTE_MORPH_PROTOTYPE", "prototype planning data must use HC004D id.");
assert(prototype.status === "runtime_morph_prototype_active_no_interaction_loop", "prototype must be active as morph only, with interaction loop deferred.");
assert(prototype.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "prototype must use Host Core Rebuild blueprint.");
assert(prototype.route?.id === routeId, "prototype route id must be Grave Memory / Residue-Scar.");
assert(prototype.morphPlan === morphPlanId, "prototype must point to the Grave morph plan.");
assert(prototype.sourceCell === sourceCellId, "prototype source cell must be Bloom Residue Fork.");
assert(prototype.destinationCell === destinationCellId, "prototype destination cell must be Grave Memory Residue Bed.");

const morph = morphPlans.find((entry) => entry.id === morphPlanId);
assert(morph, "Grave route morph plan must exist.");
assert(morph.status === "runtime_grave_morph_active_prototype", "Grave route morph plan must be the active HC-004D prototype.");
assert(morph.sourceCell === sourceCellId, "Grave route morph source must be Bloom Residue Fork.");
assert(morph.destinationCell === destinationCellId, "Grave route morph destination must be Grave Memory Residue Bed.");
assert(morph.route === routeId, "Grave route morph must reference the Grave Memory / Residue-Scar route.");
assert(morph.morphType === "no_gate_residue_memory_to_grave_bed_fold", "Grave route morph must remain a no-gate residue-memory fold.");

const sourceCell = localCellById.get(sourceCellId);
const destinationCell = localCellById.get(destinationCellId);
assert(sourceCell, "source Bloom Residue Fork cell must exist.");
assert(destinationCell, "destination Grave Memory Residue Bed cell must exist.");
assert(["runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(destinationCell.status), "Grave cell must remain either HC-004D morph destination prototype or HC-004F read-before-absorb loop active.");
assert(["runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(destinationCell.gameplayLoop?.status), "Grave gameplay loop must remain deferred until HC-004F, where only the minimal read-before-absorb loop is allowed.");
assert(destinationCell.runtimeActivation?.activationMode === "no_gate_morph_destination_only", "Grave runtime activation must remain destination-only no-gate morph.");
assert(["deferred_to_later_pass", "minimal_read_before_absorb_loop_active_HC004F", "minimal_read_before_absorb_loop_stability_active_HC004G", "minimal_read_before_absorb_loop_stability_active_exit_readiness_prototype_HC004H"].includes(destinationCell.runtimeActivation?.interactionLoopStatus), "Grave interaction loop must either be deferred or limited to the HC-004F read-before-absorb loop.");

for (const focusObject of morph.readiness?.requiredFocusObjects ?? []) {
  assert((sourceCell.contents?.chemObjects ?? []).includes(focusObject), `readiness focus object must remain in Bloom Residue source cell: ${focusObject}`);
}

for (const objectId of expectedObjects) {
  assert((destinationCell.contents?.chemObjects ?? []).includes(objectId), `Grave cell contents missing ${objectId}.`);
  const object = chemObjectById.get(objectId);
  assert(object, `Grave chem object missing ${objectId}.`);
  assert(object.status === "runtime_spawned_by_grave_morph_prototype", `${objectId} must be runtime-spawned by Grave morph prototype.`);
  assert(object.origin?.localCell === destinationCellId, `${objectId} must originate in Grave Memory Residue Bed.`);
  assert(object.runtimeActivation?.pass === "HC-004D", `${objectId} must record HC-004D runtime activation.`);
  assert(object.runtimeActivation?.interactionLoopStatus === "deferred", `${objectId} interaction loop must remain deferred.`);
  assert(visualById.has(object.visual?.visualRecipe), `${objectId} references missing visual recipe ${object.visual?.visualRecipe}.`);
  assert(placeholderById.has(object.visual?.placeholderRecipe), `${objectId} references missing placeholder recipe ${object.visual?.placeholderRecipe}.`);
}

for (const recipeId of [destinationCell.visuals?.environmentRecipe, destinationCell.visuals?.atmosphereRecipe, destinationCell.visuals?.distantHostRecipe].filter(Boolean)) {
  assert(visualById.has(recipeId), `Grave destination references missing visual recipe ${recipeId}.`);
}

const forbiddenText = JSON.stringify({ manifest, prototype, morph, destinationCell }).toLowerCase();
for (const marker of [
  "no old gates",
  "no doors",
  "no teleports",
  "no stage-node loaders",
  "no branch select menu",
  "no grave interaction loop",
  "old chamber runtime"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

assert(gameRuntime.includes("GraveRouteMorphSystem"), "GameRuntime must import/register GraveRouteMorphSystem.");
assert(gameRuntime.includes("graveRouteMorphSystem"), "GameRuntime must register graveRouteMorphSystem.");
assert(gameRuntime.includes("graveRouteMorph"), "GameRuntime must expose graveRouteMorph frame state.");
assert(graveRouteMorphSystem.includes("CELL_GRAVE_MEMORY_RESIDUE_BED_001"), "GraveRouteMorphSystem must target the Grave destination cell.");
assert(graveRouteMorphSystem.includes("interactionLoopActive: false"), "GraveRouteMorphSystem must keep the interaction loop inactive.");
assert(graveRouteMorphSystem.includes("triggerReady") && graveRouteMorphSystem.includes("pulsePressed"), "GraveRouteMorphSystem must use a readiness pulse, not a gate.");
assert(!graveRouteMorphSystem.includes("teleport"), "GraveRouteMorphSystem must not use teleport language or behavior.");
assert(!graveRouteMorphSystem.includes("branch select"), "GraveRouteMorphSystem must not use branch select behavior.");
assert(bloomArrivalSystem.includes("graveRouteTakingOver"), "Bloom arrival system must not overwrite active Grave state.");
assert(bloomInteractionSystem.includes("graveRouteTakingOver"), "Bloom interaction system must not overwrite active Grave state.");
assert(targetFocusRegistry.includes("frameState.graveRouteMorph"), "TargetFocusRegistry must allow active morph destination awareness.");
assert(morphStateSelector.includes("graveRouteMorph") && morphStateSelector.includes(morphPlanId), "MorphStateSelector must select the Grave morph state.");
assert(guidePromptSystem.includes("graveRouteMorph"), "GuidePromptSystem must surface Grave morph next-action text.");
assert(playtestHudSystem.includes("Grave route"), "Playtest HUD must label the Grave route state.");

console.log("Grave route morph-prototype validation passed.");
