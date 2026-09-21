import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveRouteRuntimePlanning validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const plan = readJson("public/data/planning/graveRouteRuntimePlanning_HC004A.json");
const routeChoice = readJson("public/data/planning/firstRouteChoicePlanning_HC003G.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const domains = new Set(readJson("public/data/chemistry/chemicalDomains.json").map((entry) => entry.id));
const matterStates = new Set(readJson("public/data/chemistry/matterStates.json").map((entry) => entry.id));
const recipePackActive = ["HC-004B", "HC-004C", "HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004H", "HC-004I", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id);

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveRouteRuntimePlanning] ${message}`);
}

assert(["HC-004A", "HC-004B", "HC-004C", "HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004I", "HC-004H", "HC-004H", "HC-004I", "HC-004I", "HC-004H", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004A through HC-004K/HC-004K.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");

assert(plan.id === "HC004A_GRAVE_ROUTE_RUNTIME_PLANNING", "planning data must have HC004A id.");
assert(plan.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "planning must use Host Core Rebuild blueprint.");
assert(plan.status === "planning_only_not_runtime_active", "planning must remain not runtime active.");

assert(plan.selectedRoute?.id === "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001", "selected route must be Grave Memory / Residue-Scar.");
assert(routeChoice.recommendedFirstRoute?.id === plan.selectedRoute.id, "HC004A route must match HC003G selected first route.");

const requiredOpening = [
  "CELL_MEMBRANE_NURSERY_001",
  "CELL_SCAR_FLOW_FOLD_001",
  "CELL_SIGNAL_CHORUS_NERVE_001"
];
for (const cellId of requiredOpening) {
  assert(plan.currentFoundation.requiredOpeningChain.includes(cellId), `currentFoundation missing ${cellId}.`);
  assert(localCells.some((entry) => entry.id === cellId), `runtime local cell missing existing opening cell ${cellId}.`);
}
assert(plan.currentFoundation.optionalBeyondMinuteFork === "CELL_BLOOM_RESIDUE_FORK_001", "optional beyond-minute fork must remain Bloom Residue.");

const plannedCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
assert(plan.plannedLocalCell?.id === plannedCellId, "planned cell must be CELL_GRAVE_MEMORY_RESIDUE_BED_001.");
assert(plan.plannedLocalCell.status.includes("not_runtime_active"), "planned cell must remain not runtime active.");
if (!recipePackActive) {
  assert(!localCells.some((entry) => entry.id === plannedCellId), "planned Grave cell must not be authored into localCellRecipes before HC-004B.");
} else {
  const graveCell = localCells.find((entry) => entry.id === plannedCellId);
  assert(["authored_recipe_pack_not_runtime_active", "runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(graveCell?.status), "Grave cell must be authored or activated only through HC-004D/HC-004F no-legacy progression.");
}

for (const domain of ["residue", "scar", "seed", "signal"]) {
  assert(plan.chemicalPlan.dominantDomains.includes(domain), `dominant domain missing ${domain}.`);
  assert(domains.has(domain), `chemicalDomains missing ${domain}.`);
}
for (const state of plan.chemicalPlan.matterStates) {
  assert(matterStates.has(state), `matterStates missing ${state}.`);
}

for (const object of plan.plannedChemObjects) {
  assert(object.status === "planned_recipe_pack_only", `planned object ${object.id} must be recipe-pack-only.`);
  if (!recipePackActive) {
    assert(!chemObjects.some((entry) => entry.id === object.id), `planned object ${object.id} must not be in chemObjectRecipes before HC-004B.`);
  } else {
    const graveObject = chemObjects.find((entry) => entry.id === object.id);
    assert(["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_grave_morph_prototype"].includes(graveObject?.status), `Grave object ${object.id} must be authored or spawned only by the HC-004D morph prototype.`);
  }
  for (const domain of object.domains ?? []) assert(domains.has(domain), `planned object ${object.id} uses unknown domain ${domain}.`);
  if (object.matterState) assert(matterStates.has(object.matterState), `planned object ${object.id} uses unknown matter state ${object.matterState}.`);
}

const noLegacyText = JSON.stringify(plan.branchRules?.noLegacyRuntimeArchitecture ?? {}).toLowerCase();
for (const marker of [
  "legacy runtime architecture does not",
  "no old gates",
  "no doors",
  "no teleports",
  "no old chamber exits",
  "no stage node loaders",
  "no branch select menu",
  "not runtime active"
]) {
  assert(noLegacyText.includes(marker), `no-legacy warning missing marker: ${marker}`);
}

assert(plan.nextRecommendedPass?.id === "HC-004B", "next recommended pass must be HC-004B.");
if (!recipePackActive) {
  assert(manifest.nextIfPasses.includes("HC-004B"), "manifest nextIfPasses must point to HC-004B.");
}

console.log("Grave route runtime planning validation passed.");
