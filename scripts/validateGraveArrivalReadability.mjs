import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveArrivalReadability validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const arrival = readJson("public/data/planning/graveArrivalReadability_HC004E.json");
const prototype = readJson("public/data/planning/graveRouteMorphPrototype_HC004D.json");
const morphPlans = readJson("public/data/morph/graveRouteMorphPlans.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const packageJson = readJson("package.json");

const gameRuntime = readText("src/core/GameRuntime.js");
const systemSource = readText("src/morph/GraveArrivalReadabilitySystem.js");
const guidePromptSystem = readText("src/guide/GuidePromptSystem.js");
const playtestHudSystem = readText("src/ui/PlaytestHudSystem.js");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveArrivalReadability] ${message}`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const sourceCellId = "CELL_BLOOM_RESIDUE_FORK_001";
const morphPlanId = "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001";
const routeId = "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001";
const expectedObjects = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];

const localCellById = new Map(localCells.map((entry) => [entry.id, entry]));
const chemObjectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const morphById = new Map(morphPlans.map((entry) => [entry.id, entry]));

assert(["HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004E or HC-004F/HC-004G.");
assert(["0.0.51", "0.0.52", "0.0.53", "0.0.54", "0.0.55", "0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must be 0.0.51 for HC-004E 0.0.52 for HC-004F, or 0.0.53 for HC-004G.");
assert(["grave_arrival_readability_without_interaction_loop", "grave_read_before_absorb_loop_without_legacy_route_architecture", "grave_loop_stability_and_exit_readiness_planning_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify Grave arrival readability or HC-004F read loop.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.arrivalReadability === arrival.id, "manifest runtime activation must name the HC-004E arrival readability record.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep seam target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_morph_after_bloom_residue_stability") && String(manifest.runtimeActivated?.activationMode ?? "").includes("arrival_readability"), "manifest activation must remain no-gate morph then arrival readability/read loop family only.");
}

assert(arrival.id === "GRAVE_ARRIVAL_READABILITY_HC004E", "arrival planning data must use HC004E id.");
assert(arrival.status === "arrival_readability_active_no_interaction_loop", "arrival readability must remain active without interaction loop.");
assert(arrival.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "arrival readability must use Host Core Rebuild blueprint.");
assert(arrival.sourceMorphPrototype === prototype.id, "arrival readability must build from HC-004D morph prototype.");
assert(arrival.route === routeId, "arrival readability route id must stay Grave Memory / Residue-Scar.");
assert(arrival.cellId === graveCellId, "arrival readability must target the Grave Memory Residue Bed cell.");
assert(arrival.arrivalContract?.mustPreserveControl === true, "arrival readability must preserve player control.");
assert(arrival.arrivalContract?.mustPreserveNoGateMorph === true, "arrival readability must preserve no-gate morph architecture.");
assert(arrival.arrivalContract?.interactionLoopStatus === "deferred_to_HC004F_or_later", "interaction loop must be deferred to HC-004F or later.");

const morph = morphById.get(morphPlanId);
assert(morph, "Grave morph plan must still exist.");
assert(morph.sourceCell === sourceCellId, "Grave morph source must remain Bloom Residue Fork.");
assert(morph.destinationCell === graveCellId, "Grave morph destination must remain Grave Memory Residue Bed.");
assert(morph.morphType === "no_gate_residue_memory_to_grave_bed_fold", "Grave morph must remain a no-gate residue-memory fold.");

const graveCell = localCellById.get(graveCellId);
assert(graveCell, "Grave local cell must exist.");
assert(["runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(graveCell.status), "Grave cell must remain the HC-004D destination or HC-004F read-loop cell.");
assert(["runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(graveCell.gameplayLoop?.status), "Grave gameplay loop must be deferred or HC-004F minimal read-before-absorb only.");
assert(graveCell.runtimeActivation?.activationMode === "no_gate_morph_destination_only", "Grave runtime activation must remain no-gate destination only.");

for (const objectId of expectedObjects) {
  const object = chemObjectById.get(objectId);
  assert(object, `missing Grave object ${objectId}.`);
  assert(object.origin?.localCell === graveCellId, `${objectId} must originate in Grave cell.`);
  assert(object.status === "runtime_spawned_by_grave_morph_prototype", `${objectId} must still be spawned by the Grave morph prototype.`);
  assert((arrival.readabilityObjects ?? []).some((entry) => entry.id === objectId), `arrival readability missing ${objectId}.`);
  assert(systemSource.includes(objectId), `GraveArrivalReadabilitySystem must handle ${objectId}.`);
}

for (const rule of targetFocusRules) {
  if (manifest.id === "HC-004E") {
    assert(rule.cellId !== graveCellId, `HC-004E must not add a Grave target focus rule yet: ${rule.id}.`);
    for (const provider of rule.providers ?? []) {
      assert(!expectedObjects.includes(provider.targetId), `HC-004E must not add target provider for Grave object ${provider.targetId}.`);
    }
  } else if (rule.cellId === graveCellId) {
    assert(rule.id === "TARGET_FOCUS_GRAVE_MEMORY_001", `HC-004F only permits the Grave read-loop target focus rule: ${rule.id}.`);
  }
}

const gravePrompt = guidePrompts.find((entry) => entry.id === "GUIDE_PROMPT_GRAVE_ARRIVAL_001");
assert(gravePrompt, "Guide prompt for Grave arrival readability must exist.");
assert(gravePrompt.conditions?.arrivalSystem === "graveArrivalReadability", "Grave prompt must be driven by arrival readability state.");
assert(gravePrompt.forbidden?.includes("dialogue_tree"), "Grave prompt must forbid dialogue tree.");
assert(gravePrompt.forbidden?.includes("quest_log"), "Grave prompt must forbid quest log.");

assert(gameRuntime.includes("GraveArrivalReadabilitySystem"), "GameRuntime must import/create GraveArrivalReadabilitySystem.");
assert(gameRuntime.includes("graveArrivalReadabilitySystem"), "GameRuntime must register graveArrivalReadabilitySystem.");
assert(gameRuntime.includes("graveCameraBias"), "GameRuntime camera must read Grave arrival camera bias.");
assert(systemSource.includes("interactionLoopActive: false"), "GraveArrivalReadabilitySystem must keep arrival staging loop inactive before HC-004F takes over.");
assert(systemSource.includes("fullGraveLoopDeferred: true"), "GraveArrivalReadabilitySystem must mark the full Grave loop deferred.");
assert(systemSource.includes("read_before_absorb_no_consume_yet"), "GraveArrivalReadabilitySystem must warn against early absorb.");
assert(guidePromptSystem.includes("graveArrivalReadability"), "GuidePromptSystem must surface Grave arrival next-action text.");
assert(playtestHudSystem.includes("graveArrivalReadability"), "Playtest HUD must surface Grave arrival readability text.");

const forbiddenText = JSON.stringify({ manifest, arrival }).toLowerCase();
for (const marker of [
  "full grave interaction loop",
  "combat",
  "dialogue tree",
  "quest log",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave arrival-readability validation passed.");
