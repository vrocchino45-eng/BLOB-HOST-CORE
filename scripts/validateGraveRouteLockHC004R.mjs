import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GraveRouteLockSystem } from "../src/morph/GraveRouteLockSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGraveRouteLockHC004R] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const lockPlan = readJson("public/data/lock/graveRouteLockState_HC004R.json");
const guidePrompts = readJson("public/data/guide/guidePromptRecipes.json");
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const tissueSource = readText("src/morph/MorphReadabilitySystem.js");
const diagnosticSource = readText("src/debug/RuntimeDiagnosticSummary.js");

assert(["HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-004R or HC-005A successor, got ${manifest.id}.`);
assert(["0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve the HC-004R lineage, got ${manifest.version}.`);
assert(["0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve the HC-004R lineage, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(lockPlan.id === "GRAVE_ROUTE_LOCK_HC004R", "lock plan id mismatch.");
assert(lockPlan.lockDecision === "self_contained_memory_loop_locked", "Grave route must lock as a self-contained memory loop.");
assert(lockPlan.runtimeBehavior?.runtimeExitActivation === false, "lock pass must not activate a runtime exit.");
assert(lockPlan.runtimeBehavior?.playerRelocation === false, "lock pass must not relocate the player.");
assert(lockPlan.runtimeBehavior?.newMorphActivation === false, "lock pass must not activate a new morph.");
assert(lockPlan.runtimeBehavior?.newRouteBranch === false, "lock pass must not activate a new branch.");
assert(lockPlan.nextRecommendedPass?.id === "HC-005A", "next pass must be HC-005A return-continuity planning.");

assert(runtimeSource.includes('new GraveRouteLockSystem'), "GameRuntime must construct GraveRouteLockSystem.");
assert(runtimeSource.includes('register("graveRouteLockSystem"'), "GameRuntime must register GraveRouteLockSystem after the post-seam owner.");
assert(diagnosticSource.includes('{ key: "graveRouteLock", owner: "GraveRouteLockSystem" }'), "full-debug diagnostics must recognize the lock owner.");
assert(hudSource.includes("graveRouteLocked"), "playtest HUD must expose the locked state.");
assert(guideSource.includes("graveRouteLock.active"), "Guide must prioritize the locked completion state.");
assert(tissueSource.includes("Grave memory route: complete and locked."), "tissue readout must publish the locked completion state.");
assert(guidePrompts.some((entry) => entry.id === "GUIDE_PROMPT_GRAVE_ROUTE_LOCKED_HC004R"), "Guide lock prompt is missing.");

const frameState = {
  frame: 100,
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  graveBedPostSeamResponse: {
    active: true,
    completed: false,
    responseComplete: false,
    stage: "inheritance_seed_warms_closed"
  },
  promptStack: {},
  physicalFeel: {},
  lockState: {},
  input: { pulsePressed: false, pulseEventId: 0, absorbHeld: false },
  inputActionAudit: { eventId: 0, consumedBy: "none" },
  targeting: { targetId: "inheritance_seed_remnant_001" },
  targetFocus: { preferredTargetId: "inheritance_seed_remnant_001", provider: "GraveBedPostSeamResponseSystem" },
  nonFatalSystemErrors: []
};
const recipeDataSystem = { data: { graveRouteLockState: lockPlan } };
const system = new GraveRouteLockSystem({ recipeDataSystem, frameState });
system.init();
system.update(1 / 60, frameState);

assert(!frameState.graveRouteLock.active, "route lock must not activate before verified completion.");
assert(!frameState.graveRouteLock.completed, "route lock must not report complete early.");

frameState.frame = 101;
frameState.graveBedPostSeamResponse = {
  active: true,
  completed: true,
  responseComplete: true,
  stage: "grave_bed_post_seam_response_complete"
};
system.update(1 / 60, frameState);

assert(frameState.graveRouteLock.active, "route lock must activate after verified completion.");
assert(frameState.graveRouteLock.completed, "route lock must report complete.");
assert(frameState.graveRouteLock.routeLocked, "routeLocked must be true.");
assert(frameState.graveRouteLock.progress === 1, "locked route progress must be 1.");
assert(frameState.graveRouteLock.currentFocus === "none", "locked route must require no target.");
assert(frameState.graveRouteLock.inputRequired === false, "locked route must require no input.");
assert(frameState.graveRouteLock.runtimeExitActivation === false, "locked runtime state must not activate an exit.");
assert(frameState.graveRouteLock.playerRelocation === false, "locked runtime state must not relocate the player.");
assert(frameState.lockState.nextIfPasses === "HC-005A", "lock state must point to HC-005A planning.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "GraveRouteLockSystem", `diagnostic owner must be GraveRouteLockSystem, got ${diagnosis.owner}.`);
assert(diagnosis.complete, "diagnostic must report complete.");
assert(diagnosis.ready, "diagnostic must report ready/settled.");
assert(diagnosis.progress === 1, "diagnostic progress must be 100%.");
assert(diagnosis.expectedTarget === "none", "locked route must have no expected target.");
assert(diagnosis.blocker === "none_detected", `locked route must have no blocker, got ${diagnosis.blocker}.`);

frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
system.update(1 / 60, frameState);
assert(frameState.graveRouteLock.completed, "lock history must persist outside the Grave cell.");
assert(!frameState.graveRouteLock.active, "lock owner must relinquish active UI ownership outside the Grave cell.");

console.log("validateGraveRouteLockHC004R validation passed.");
