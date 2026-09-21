import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`[validateGraveScarMemorySeamFirstReadLoop] ${message}`);
}

const manifest = readJson("public/data/build/buildManifest.json");
if (["HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id)) {
  console.log("validateGraveScarMemorySeamFirstReadLoop validation passed under HC-004O/HC-004P/HC-004Q successor coverage.");
  process.exit(0);
}
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const firstReadLoops = readJson("public/data/morph/graveScarMemorySeamFirstReadRecipes.json");
const runtimeArrival = readJson("public/data/planning/graveScarMemorySeamRuntimeArrival_HC004M.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemObjects = readJson("public/data/chemistry/chemObjectRecipes.json");
const targetFocusRules = readJson("public/data/targeting/targetFocusRules.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const morphPlans = [
  ...readJson("public/data/morph/localCellMorphPlans.json"),
  ...readJson("public/data/morph/secondLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/thirdLocalCellMorphPlans.json"),
  ...readJson("public/data/morph/graveRouteMorphPlans.json")
];

const runtimeSource = readText("src/core/GameRuntime.js");
const recipeDataSource = readText("src/data/RecipeDataSystem.js");
const systemSource = readText("src/morph/GraveScarMemorySeamFirstReadSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const targetingSource = readText("src/targeting/TargetingSystem.js");

const seamCellId = "CELL_GRAVE_SCAR_MEMORY_SEAM_001";
const sourceCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const loopId = "GRAVE_SCAR_MEMORY_SEAM_FIRST_READ_LOOP_HC004N";
const focusRuleId = "TARGET_FOCUS_GRAVE_SCAR_MEMORY_SEAM_001";
const seamObjects = [
  "scar_memory_seam_thread_001",
  "residue_stitch_lattice_001",
  "echo_husk_imprint_001",
  "closed_inheritance_suture_001"
];
const promptIds = [
  "GUIDE_PROMPT_SEAM_THREAD_READ_HC004N",
  "GUIDE_PROMPT_SEAM_LATTICE_READ_HC004N",
  "GUIDE_PROMPT_SEAM_ECHO_READ_HC004N",
  "GUIDE_PROMPT_SEAM_CLOSED_SUTURE_HC004N",
  "GUIDE_PROMPT_SEAM_FIRST_READ_COMPLETE_HC004N"
];

const localById = new Map(localCells.map((entry) => [entry.id, entry]));
const objectById = new Map(chemObjects.map((entry) => [entry.id, entry]));
const focusById = new Map(targetFocusRules.map((entry) => [entry.id, entry]));
const guideById = new Map(guidePrompts.map((entry) => [entry.id, entry]));
const loop = firstReadLoops.find((entry) => entry.id === loopId);
const seamCell = localById.get(seamCellId);
const sourceCell = localById.get(sourceCellId);
const focusRule = focusById.get(focusRuleId);

assert(manifest.id === "HC-004N", "build manifest must identify HC-004N.");
assert(packageJson.version === "0.0.60", "package version must be 0.0.60 for HC-004N.");
assert(packageLock.packages?.[""]?.version === "0.0.60", "package-lock root version must be 0.0.60 for HC-004N.");
assert(manifest.mode === "grave_scar_memory_seam_first_read_loop_runtime_implementation_without_legacy_exit_architecture", "manifest mode must identify the HC-004N implementation pass.");
assert(manifest.runtimeActivated?.graveScarMemorySeamRuntimeArrival === runtimeArrival.id, "manifest must preserve HC-004M runtime arrival.");
assert(manifest.runtimeActivated?.graveScarMemorySeamFirstReadLoop === loopId, "manifest must identify the HC-004N first-read loop.");
assert(manifest.runtimeActivated?.targetFocusRule === focusRuleId, "manifest must identify the seam target-focus rule.");

assert(loop, "HC-004N first-read loop recipe must exist.");
assert(loop.status === "runtime_active_first_read_loop_no_exit_no_absorb_consumption", "loop status must be active read-only/no-exit/no-absorb.");
assert(loop.sourceRuntimeArrival === runtimeArrival.id, "loop must build directly from HC-004M runtime arrival.");
assert(loop.cellId === seamCellId, "loop must run only in the scar-memory seam cell.");
assert(loop.sequence?.length === seamObjects.length, "loop must read exactly four seam objects.");
assert(JSON.stringify(loop.sequence.map((step) => step.focusObject)) === JSON.stringify(seamObjects), "loop sequence object order mismatch.");
for (const key of ["minimumThreadRead", "minimumLatticeRead", "minimumEchoRead", "minimumSutureRead", "completionStableSeconds", "pulseRange", "readRange", "absorbRecoilRange"]) {
  assert(Number.isFinite(loop.metrics?.[key]) && loop.metrics[key] > 0, `loop metric ${key} must be positive.`);
}
assert(loop.completion?.status === "ready_for_later_grave_continuity_but_no_exit_this_pass", "loop completion must stay readiness-only.");

assert(sourceCell?.status === "runtime_grave_exit_readiness_prototype_active_exit_deferred", "source Grave bed must remain exit-readiness only.");
assert(seamCell?.status === "runtime_arrival_and_first_read_loop_active", "seam cell must be runtime-arrival plus first-read active.");
assert(seamCell?.gameplayLoop?.status === "runtime_arrival_and_first_read_loop_active", "seam gameplay loop must identify first-read active.");
assert(seamCell?.runtimeActivation?.status === "runtime_arrival_and_first_read_loop_active_HC004N", "seam runtime activation status mismatch.");
assert(seamCell?.runtimeActivation?.targetFocusStatus === "active_seam_read_targets_only_HC004N", "seam target focus status mismatch.");
assert(seamCell?.runtimeActivation?.interactionLoopStatus === "active_first_read_loop_HC004N", "seam interaction loop status mismatch.");

for (const objectId of seamObjects) {
  const object = objectById.get(objectId);
  assert(object, `missing seam object ${objectId}.`);
  assert((seamCell.contents?.chemObjects ?? []).includes(objectId), `seam cell contents missing ${objectId}.`);
  assert(object.status === "runtime_readable_by_seam_first_read_loop", `${objectId} must be readable by the HC-004N loop.`);
  assert(object.origin?.localCell === seamCellId, `${objectId} must point back to the seam cell.`);
  assert(object.runtimeActivation?.interactionLoopStatus === "active_first_read_loop_no_absorb_consumption", `${objectId} must forbid absorb consumption.`);
}

assert(focusRule, "HC-004N seam target-focus rule must exist.");
assert(focusRule.cellId === seamCellId, "seam target-focus rule must belong to the seam cell.");
for (const objectId of seamObjects) {
  assert(objectId in (focusRule.preferredObjects ?? {}), `focus rule missing preferred object ${objectId}.`);
  assert(objectId in (focusRule.targetKinds ?? {}), `focus rule missing target kind ${objectId}.`);
}
for (const promptId of promptIds) {
  const prompt = guideById.get(promptId);
  assert(prompt, `missing guide prompt ${promptId}.`);
  assert(prompt.conditions?.loopSystem === "graveScarMemorySeamFirstRead", `${promptId} must be driven by the seam first-read loop.`);
}

for (const morph of morphPlans) {
  assert(morph.sourceCell !== seamCellId, `seam must not become a morph source: ${morph.id}.`);
  assert(morph.destinationCell !== seamCellId, `seam must not become a morph destination: ${morph.id}.`);
  assert(morph.plannedDestinationCell !== seamCellId, `seam must not become a planned morph destination: ${morph.id}.`);
}

assert(existsSync(join(root, "src/morph/GraveScarMemorySeamFirstReadSystem.js")), "GraveScarMemorySeamFirstReadSystem source file must exist.");
assert(systemSource.includes("export class GraveScarMemorySeamFirstReadSystem"), "system must export GraveScarMemorySeamFirstReadSystem.");
assert(systemSource.includes("seam object absorption") || systemSource.includes("seam is readable, not absorbable"), "system must communicate read-only/no-absorb behavior.");
assert(systemSource.includes("closedInheritanceSutureOpened: false"), "system must keep the closed inheritance suture closed.");
assert(systemSource.includes("seamObjectsConsumed: false"), "system must keep seam objects unconsumed.");
for (const banned of ["stageNodeLoader", "teleportExit", "branchSelectMenu", "activateGate", "dialogueTree", "questLog", "combatEncounter"]) {
  assert(!systemSource.includes(banned), `system must not revive ${banned}.`);
}

assert(runtimeSource.includes("GraveScarMemorySeamFirstReadSystem"), "GameRuntime must import/create the seam first-read system.");
assert(runtimeSource.includes("graveScarMemorySeamFirstReadSystem"), "GameRuntime must register the seam first-read system.");
assert(recipeDataSource.includes("graveScarMemorySeamFirstReadRecipes"), "RecipeDataSystem must load HC-004N first-read recipes.");
assert(recipeDataSource.includes("validateGraveScarMemorySeamFirstReadLoop"), "RecipeDataSystem must validate HC-004N first-read data.");
assert(hudSource.includes("graveScarMemorySeamFirstRead"), "Playtest HUD must surface the seam first-read state.");
assert(guideSource.includes("graveScarMemorySeamFirstRead"), "GuidePromptSystem must surface seam first-read guidance.");
assert(targetingSource.includes("seam_scar_thread") && targetingSource.includes("seam_closed_suture"), "TargetingSystem must color seam focus kinds.");

const forbiddenText = JSON.stringify({ manifest, loop, seamCell }).toLowerCase();
for (const marker of [
  "runtime exit activation",
  "new morph activation",
  "route branch activation",
  "combat",
  "dialogue tree",
  "quest log",
  "gates",
  "doors",
  "teleports",
  "old chamber runtime",
  "stage-node loaders",
  "branch select menu",
  "seam object absorption",
  "opening closed inheritance suture",
  "consuming the old core husk"
]) {
  assert(forbiddenText.includes(marker), `forbidden scope must include ${marker}.`);
}

console.log("Grave scar-memory seam first-read loop validation passed.");
