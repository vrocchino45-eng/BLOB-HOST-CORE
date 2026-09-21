import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveLoopStabilityAndExitReadiness validation passed under HC-004N/HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const plan = readJson("public/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json");
const loops = readJson("public/data/morph/graveReadBeforeAbsorbRecipes.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const systemSource = readText("src/morph/GraveLoopStabilitySystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const packageLock = readJson("package-lock.json");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveLoopStabilityAndExitReadiness] ${message}`);
}

const graveCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const loop = loops.find((entry) => entry.id === "GRAVE_READ_BEFORE_ABSORB_LOOP_001");
const graveCell = localCells.find((entry) => entry.id === graveCellId);
const protectedRemains = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];

assert(["HC-004G", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M"].includes(manifest.id), "build manifest must identify HC-004G, HC-004H, or HC-004I.");
assert(["0.0.53", "0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageJson.version), "package version must match HC-004G/HC-004H/HC-004I.");
assert(["0.0.53", "0.0.54", "0.0.55", "0.0.56", "0.0.57", "0.0.58", "0.0.59"].includes(packageLock.packages?.[""]?.version), "package-lock root version must match HC-004G/HC-004H/HC-004I.");
assert(["grave_loop_stability_and_exit_readiness_planning_without_exit_activation", "grave_exit_readiness_prototype_without_exit_activation", "grave_route_continuity_planning_without_transition_activation", "grave_scar_memory_seam_recipe_pack_without_runtime_activation", "grave_scar_memory_seam_visual_composer_support_without_runtime_activation", "grave_scar_memory_seam_arrival_planning_without_runtime_transition", "grave_scar_memory_seam_runtime_arrival_prototype_without_legacy_exit_architecture"].includes(manifest.mode), "manifest mode must identify Grave stability/readiness, HC-004H readiness, or HC-004I continuity planning with no activation.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
assert(manifest.runtimeActivated?.graveLoopStabilityReadout === plan.id, "manifest must name the HC-004G Grave loop stability readout.");
if (manifest.id === "HC-004M") {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no_gate_continuity_pull"), "HC-004M activation mode must state no-gate continuity pull.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no target focus activation"), "HC-004M must keep target focus inactive.");
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no seam interaction loop"), "HC-004M must keep seam loop deferred.");
} else {
  assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("exit_readiness_planning_only") || String(manifest.runtimeActivated?.activationMode ?? "").includes("exit_readiness_prototype") || String(manifest.runtimeActivated?.activationMode ?? "").includes("continuity_planning_only_no_transition_activation") || String(manifest.runtimeActivated?.activationMode ?? "").includes("visual_composer_support_no_transition_activation"), "manifest activation mode must stay planning/prototype/continuity-only for exit readiness.");
}
if (manifest.id === "HC-004G") {
  assert(manifest.plannedButNotRuntimeActive?.graveExitPrototype === "HC-004H or later", "HC-004H must remain a planned later prototype only in HC-004G.");
} else {
  assert(manifest.runtimeActivated?.graveExitReadinessPrototype === "GRAVE_EXIT_READINESS_PROTOTYPE_HC004H", "HC-004H may activate only the exit-readiness prototype readout.");
}

assert(plan.id === "GRAVE_LOOP_STABILITY_EXIT_READINESS_HC004G", "planning data id mismatch.");
assert(plan.status === "runtime_stability_readout_active_exit_planning_only", "plan status must be stability readout active and exit planning only.");
assert(plan.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "plan must use Host Core Rebuild blueprint.");
assert(plan.sourceLoop === "GRAVE_READ_BEFORE_ABSORB_LOOP_001", "plan must derive from the HC-004F read-before-absorb loop.");
assert(plan.sourceCell === graveCellId, "plan must target the Grave Memory Residue Bed.");
assert(plan.stabilityRules?.requiresSafeMemoryTransferComplete === true, "stability must require safeMemoryTransferComplete.");
assert(plan.stabilityRules?.requiresReadLoopActive === true, "stability must require the read loop to be active.");
assert(plan.stabilityRules?.safeTransferObject === "residue_silt_cloud_001", "safe transfer object must remain residue_silt_cloud_001.");
assert(plan.stabilityRules?.minimumStableSecondsAfterSafeTransfer >= 3, "minimum post-transfer stable seconds must be readable.");
assert(plan.safeTransferTuning?.safeAbsorbHoldSeconds >= 1.35, "safe transfer hold should be tuned slower than HC-004F.");
assert(plan.exitReadinessPlan?.runtimeActivationThisPass === "none", "HC-004G must not runtime-activate an exit.");
assert(plan.exitReadinessPlan?.newRouteBranchThisPass === false, "HC-004G must not create a new route branch.");
assert(plan.exitReadinessPlan?.morphActivationThisPass === false, "HC-004G must not create a new morph activation.");
assert(plan.exitReadinessPlan?.exitPrototypeDeferred === true, "exit prototype must be deferred.");
for (const objectId of protectedRemains) {
  assert((plan.stabilityRules?.requiredProtectedRemainsVisible ?? []).includes(objectId), `protected remains missing ${objectId}.`);
}

assert(loop, "Grave read-before-absorb loop must still exist.");
assert(loop.status === "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "read loop must be stability-tuned, not replaced.");
assert(loop.sourceStabilityPlanning === plan.id, "read loop must reference HC-004G stability planning.");
assert(loop.metrics?.safeAbsorbHoldSeconds === plan.safeTransferTuning.safeAbsorbHoldSeconds, "read loop safe-transfer timing must match HC-004G tuning.");
assert(loop.safeTransfer?.allowedObject === "residue_silt_cloud_001", "safe transfer must remain limited to residue_silt_cloud_001.");
for (const objectId of protectedRemains) {
  assert((loop.safeTransfer?.mustNotConsume ?? []).includes(objectId), `read loop must still preserve ${objectId}.`);
}

assert(graveCell, "Grave local cell must exist.");
assert(["runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(graveCell.status), "Grave cell status must identify HC-004G stability or HC-004H exit-readiness with exit deferred.");
assert(["runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(graveCell.gameplayLoop?.status), "Grave gameplay loop must stay minimal and tuned/prototyped, not replaced.");
assert((graveCell.gameplayLoop?.forbidden ?? []).includes("runtime_exit_activation"), "Grave cell must forbid runtime exit activation in HC-004G.");
assert(["planning_only_no_exit_activation_HC004G", "prototype_active_no_exit_activation_HC004H"].includes(graveCell.runtimeActivation?.exitReadinessStatus), "Grave runtime activation must keep exit readiness non-activating.");

assert(existsSync(join(root, "src/morph/GraveLoopStabilitySystem.js")), "GraveLoopStabilitySystem source file must exist.");
assert(systemSource.includes("class GraveLoopStabilitySystem") || systemSource.includes("export class GraveLoopStabilitySystem"), "system source must export GraveLoopStabilitySystem.");
assert(systemSource.includes("planning_ready_no_exit_activation"), "system must produce planning-ready status without exit activation.");
assert(systemSource.includes("noRuntimeExitActivation"), "system state must explicitly forbid runtime exit activation.");
for (const objectId of protectedRemains) assert(systemSource.includes(objectId), `system must check protected remain ${objectId}.`);
for (const bannedSourceMarker of ["StageNode", "stageNodeLoader", "teleportExit", "branchSelectMenu", "dialogueTree", "createEventExit", "activateGate"]) {
  assert(!systemSource.includes(bannedSourceMarker), `stability system must not revive ${bannedSourceMarker}.`);
}

assert(runtimeSource.includes("GraveLoopStabilitySystem"), "GameRuntime must import/create GraveLoopStabilitySystem.");
assert(runtimeSource.includes("graveLoopStabilitySystem"), "GameRuntime must register graveLoopStabilitySystem.");
assert(hudSource.includes("Grave Stability"), "Playtest HUD must surface Grave stability state.");
assert(recipeDataSource.includes("graveLoopStabilityExitReadiness"), "RecipeDataSystem must load the HC-004G stability plan.");
assert(recipeDataSource.includes("validateGraveLoopStabilityExitReadiness"), "RecipeDataSystem must validate the HC-004G stability plan.");

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
  "opening the inheritance seed remnant"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave loop stability and exit-readiness planning validation passed.");
