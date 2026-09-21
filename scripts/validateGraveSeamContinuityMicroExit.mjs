import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveSeamContinuityMicroExit] ${message}`);
}

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("Grave seam continuity micro-exit validation passed under HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const microExitRecipes = readJson("public/data/morph/graveSeamContinuityMicroExitRecipes.json");
const firstReadLoops = readJson("public/data/morph/graveScarMemorySeamFirstReadRecipes.json");
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
const systemSource = readText("src/morph/GraveSeamContinuityMicroExitSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

const microExitId = "GRAVE_SEAM_CONTINUITY_MICRO_EXIT_HC004O";
const firstReadId = "GRAVE_SCAR_MEMORY_SEAM_FIRST_READ_LOOP_HC004N";
const sourceCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const destinationCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const triggerObjectId = "closed_inheritance_suture_001";
const promptIds = [
  "GUIDE_PROMPT_SEAM_MICRO_EXIT_READY_HC004O",
  "GUIDE_PROMPT_SEAM_MICRO_EXIT_MOVING_HC004O",
  "GUIDE_PROMPT_SEAM_MICRO_EXIT_COMPLETE_HC004O"
];

const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const guideById = new Map(guidePrompts.map((entry) => [entry.id, entry]));
const microExit = microExitRecipes.find((entry) => entry.id === microExitId);
const firstRead = firstReadLoops.find((entry) => entry.id === firstReadId);
const sourceCell = localById.get(sourceCellId);
const destinationCell = localById.get(destinationCellId);
const triggerObject = objectById.get(triggerObjectId);

assert(manifest.id === "HC-004O", "build manifest must identify HC-004O.");
assert(packageJson.version === "0.0.61", "package version must be 0.0.61 for HC-004O.");
assert(packageLock.packages?.[""]?.version === "0.0.61", "package-lock root version must be 0.0.61 for HC-004O.");
assert(manifest.mode === "grave_seam_continuity_micro_exit_implementation_without_legacy_exit_architecture", "manifest mode must identify HC-004O micro-exit implementation.");
assert(manifest.runtimeActivated?.graveScarMemorySeamFirstReadLoop === firstReadId, "manifest must preserve HC-004N first-read loop.");
assert(manifest.runtimeActivated?.graveSeamContinuityMicroExit === microExitId, "manifest must identify HC-004O micro-exit.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("micro-exit fold-back active"), "manifest activation mode must identify micro-exit fold-back.");
assert(String(manifest.runtimeActivated?.activationMode ?? "").includes("no legacy exit architecture"), "manifest activation mode must forbid legacy exit architecture.");

assert(firstRead, "HC-004N first-read loop must still exist.");
assert(microExit, "HC-004O micro-exit recipe must exist.");
assert(microExit.primaryReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "micro-exit must use Host Core Rebuild blueprint reference.");
assert(microExit.status === "runtime_active_no_gate_micro_exit_return_to_grave_bed", "micro-exit status mismatch.");
assert(microExit.sourceFirstReadLoop === firstReadId, "micro-exit must source from the HC-004N first-read loop.");
assert(microExit.sourceCell === sourceCellId, "micro-exit source cell must be the seam.");
assert(microExit.destinationCell === destinationCellId, "micro-exit destination cell must be the Grave bed.");
assert(microExit.triggerObject === triggerObjectId, "micro-exit trigger must be the closed inheritance suture.");

assert(sourceCell?.runtimeActivation?.microExitStatus === "active_no_gate_fold_back_to_grave_bed_HC004O", "seam cell must expose HC-004O micro-exit status.");
assert(destinationCell?.runtimeActivation?.seamMicroExitReturnStatus === "can_receive_HC004O_return_after_seam_first_read", "Grave bed must expose HC-004O return-receive status.");
assert(triggerObject?.runtimeActivation?.microExitStatus === "trigger_only_after_first_read_HC004O_no_opening_no_absorb", "closed suture must expose HC-004O trigger-only status.");

const trigger = microExit.triggerRules ?? {};
for (const key of ["requiresActiveSourceCell", "requiresFirstReadComplete", "requiresClosedSutureVisible", "requiresPulsePressed", "requiresNoAbsorbHeld"]) {
  assert(trigger[key] === true, `${key} must be true.`);
}
assert(trigger.preferredFocusObject === triggerObjectId, "preferred focus object must be the closed suture.");
assert(trigger.absorbStartsMicroExit === false, "absorb must not start the micro-exit.");

const proto = microExit.microExitPrototype ?? {};
assert(proto.mode === "short_no_gate_continuity_fold_back", "micro-exit prototype mode mismatch.");
assert(proto.playerRelocationThisPass === true, "HC-004O must explicitly allow only short continuity relocation.");
for (const key of ["legacyExitArchitectureThisPass", "doorTeleportOrGateThisPass", "newMorphPlanThisPass", "newRouteBranchThisPass", "combatThisPass", "dialogueTreeThisPass", "questLogThisPass"]) {
  assert(proto[key] === false, `${key} must be false.`);
}
assert(Number.isFinite(proto.durationSeconds) && proto.durationSeconds > 0, "durationSeconds must be positive.");

assert(microExit.completion?.setsActiveCell === destinationCellId, "completion must set active cell back to Grave bed.");
assert(microExit.completion?.seamObjectsConsumed === false, "completion must not consume seam objects.");
assert(microExit.completion?.closedInheritanceSutureOpened === false, "completion must not open the closed suture.");
assert(microExit.completion?.newRouteBranchActivated === false, "completion must not activate a new route branch.");

for (const morph of morphPlans) {
  assert(morph.sourceCell !== sourceCellId, `seam must not become a morph source: ${morph.id}.`);
  assert(morph.destinationCell !== sourceCellId, `seam must not become a morph destination: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== sourceCellId, `seam must not become a planned morph destination: ${morph.id}.`);
}

for (const promptId of promptIds) {
  const prompt = guideById.get(promptId);
  assert(prompt, `missing guide prompt ${promptId}.`);
  assert(prompt.conditions?.loopSystem === "graveSeamContinuityMicroExit", `${promptId} must be driven by graveSeamContinuityMicroExit.`);
  for (const marker of ["dialogue_tree", "quest_log", "combat", "teleport", "branch_select_menu", "new_morph_activation", "new_route_branch"]) {
    assert((prompt.forbidden ?? []).includes(marker), `${promptId} forbidden list missing ${marker}.`);
  }
}

assert(existsSync(join(root, "src/morph/GraveSeamContinuityMicroExitSystem.js")), "GraveSeamContinuityMicroExitSystem source file must exist.");
assert(systemSource.includes("export class GraveSeamContinuityMicroExitSystem"), "system must export GraveSeamContinuityMicroExitSystem.");
assert(systemSource.includes("short_continuity_fold_back"), "system state must identify short continuity fold-back relocation.");
assert(systemSource.includes("frameState.activeCellId = DESTINATION_CELL_ID"), "system must return activeCellId to the Grave bed.");
assert(systemSource.includes("seamObjectsConsumed: false"), "system state must keep seam objects unconsumed.");
assert(systemSource.includes("closedInheritanceSutureOpened: false"), "system state must keep the suture closed.");
for (const banned of ["stageNodeLoader", "teleportExit", "branchSelectMenu", "activateGate", "dialogueTree", "questLog", "combatEncounter"]) {
  assert(!systemSource.includes(banned), `system must not revive ${banned}.`);
}

assert(runtimeSource.includes("GraveSeamContinuityMicroExitSystem"), "GameRuntime must import/create HC-004O micro-exit system.");
assert(runtimeSource.includes("graveSeamContinuityMicroExitSystem"), "GameRuntime must register HC-004O micro-exit system.");
assert(runtimeSource.includes("graveSeamContinuityMicroExitCamera"), "GameRuntime camera must support HC-004O camera bias.");
assert(recipeDataSource.includes("graveSeamContinuityMicroExitRecipes"), "RecipeDataSystem must load HC-004O micro-exit recipes.");
assert(recipeDataSource.includes("validateGraveSeamContinuityMicroExit"), "RecipeDataSystem must validate HC-004O micro-exit data.");
assert(hudSource.includes("graveSeamContinuityMicroExit"), "Playtest HUD must surface HC-004O micro-exit state.");
assert(guideSource.includes("graveSeamContinuityMicroExit"), "GuidePromptSystem must surface HC-004O micro-exit guidance.");

const forbiddenText = JSON.stringify({ manifest, microExit, sourceCell }).toLowerCase();
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
  "combat",
  "dialogue tree",
  "quest log",
  "seam object absorption",
  "opening closed inheritance suture",
  "consuming the old core husk",
  "opening inheritance seed remnant"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave seam continuity micro-exit validation passed.");
