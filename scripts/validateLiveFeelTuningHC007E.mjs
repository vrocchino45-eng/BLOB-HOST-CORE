import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { FirstSliceCohesionSystem } from "../src/core/FirstSliceCohesionSystem.js";
import { BondSystem } from "../src/chemistry/BondSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(`[validateLiveFeelTuningHC007E] ${message}`); };

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/core/firstSliceCohesion_HC007E.json");
assert(
  (((manifest.id === "HC-007E" && manifest.version === "0.0.103") ||
  (manifest.id === "HC-008B" && manifest.version === "0.0.104") ||
  (manifest.id === "HC-008C" && manifest.version === "0.0.105") ||
  (manifest.id === "HC-008D" && manifest.version === "0.0.106")
  || (manifest.id === "HC-008E" && manifest.version === "0.0.107")
  || (manifest.id === "HC-008F" && manifest.version === "0.0.108")
  || (manifest.id === "HC-008G" && manifest.version === "0.0.109")
  || (manifest.id === "HC-009A" && manifest.version === "0.0.110")
  || (manifest.id === "HC-009B" && manifest.version === "0.0.111")
  || (manifest.id === "HC-009C" && manifest.version === "0.0.112")
  || (manifest.id === "HC-009D" && manifest.version === "0.0.113")
  || (manifest.id === "HC-009E" && manifest.version === "0.0.114")
  || (manifest.id === "HC-009F" && manifest.version === "0.0.115")
  || (manifest.id === "HC-009G" && manifest.version === "0.0.116")
  || (manifest.id === "HC-010A" && manifest.version === "0.0.117")
  || (manifest.id === "HC-010B" && manifest.version === "0.0.118")
  || (manifest.id === "HC-010C" && manifest.version === "0.0.119")
  || (manifest.id === "HC-010D" && manifest.version === "0.0.120")
  || (manifest.id === "HC-010E" && manifest.version === "0.0.121")
  || (manifest.id === "HC-010F" && manifest.version === "0.0.122")
  || (manifest.id === "HC-010G" && manifest.version === "0.0.123")
  || (manifest.id === "HC-011A" && manifest.version === "0.0.124")
  || (manifest.id === "HC-011A1" && manifest.version === "0.0.125")
  || (manifest.id === "HC-011B" && manifest.version === "0.0.126")
  || (manifest.id === "HC-012A" && manifest.version === "0.0.127")
  || (manifest.id === "HC-012B" && manifest.version === "0.0.128")
  || (manifest.id === "HC-012C" && manifest.version === "0.0.129")
  || (manifest.id === "HC-013A" && manifest.version === "0.0.130")
  || (manifest.id === "HC-013B" && manifest.version === "0.0.131")
  || ((manifest.id === "HC-013C" && manifest.version === "0.0.132") || (manifest.id === "HC-013D" && manifest.version === "0.0.133") || (manifest.id === "HC-014A" && manifest.version === "0.0.134") || (manifest.id === "HC-014B" && manifest.version === "0.0.135") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014C" && manifest.version === "0.0.136") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014C" && manifest.version === "0.0.136"))) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(pkg.version === manifest.version, "package identity mismatch");
assert(recipe.id === "FIRST_SLICE_COHESION_HC007E", "tuned cohesion recipe missing");
assert((recipe.visual?.learnedOpacity ?? 1) <= 0.15 && (recipe.visual?.hubDimming ?? 1) < 0.65, "Hub visual crowding was not reduced");
assert(readText("index.html").includes(manifest.id), "browser title is stale");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const playerRoot = new THREE.Group();
const frameState = {
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: false },
  chemObjectState: { absorbedObjects: 0 },
  surfaceWakeGameplay: { active: true, worldReadCount: 2, absorbedMoteCount: 2, stabilizeSeconds: 1.5 },
  guideThresholdGameplay: { active: false },
  hubInvestigationGameplay: { active: false }
};
const cohesionSystem = new FirstSliceCohesionSystem({ recipeDataSystem, playerRoot, frameState });
cohesionSystem.init();

for (let eventId = 1; eventId <= 10; eventId += 1) {
  frameState.input = { pulsePressed: true, pulseEventId: eventId, stabilizeHeld: eventId <= 5 };
  frameState.chemObjectState.absorbedObjects = Math.min(3, Math.ceil(eventId / 3));
  frameState.runtimeSeconds += 1;
  cohesionSystem.update(1, frameState);
}
frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
frameState.surfaceWakeGameplay = { active: false };
frameState.guideThresholdGameplay = { active: true, maxPathProgress: 0.85, familiarity: 0.72, optionalRewardCount: 0 };
frameState.input = { pulsePressed: false, pulseEventId: 10, stabilizeHeld: true };
frameState.runtimeSeconds += 2;
cohesionSystem.update(2, frameState);
frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frameState.guideThresholdGameplay = { active: false };
frameState.hubInvestigationGameplay = { active: true, progress: 1, routeReadCount: 3, investigationReady: true };
frameState.input = { pulsePressed: false, pulseEventId: 10, stabilizeHeld: false };
frameState.runtimeSeconds += 1;
cohesionSystem.update(1, frameState);

const cohesion = frameState.firstSliceCohesion;
const strengths = Object.values(cohesion.practice);
const balanceTotal = Object.values(cohesion.practiceBalance).reduce((sum, value) => sum + value, 0);
assert(strengths.every((value) => value > 0 && value < 0.9), "ordinary play saturated or erased a practice strength");
assert(Math.max(...strengths) - Math.min(...strengths) > 0.04, "practice differentiation was lost");
assert(Math.abs(balanceTotal - 1) < 0.000001 && cohesion.practiceBalanceNormalized, "practice balance is not normalized");
const hubRing = playerRoot.getObjectByName("cohesion_lesson_hub_route_comparison");
assert(hubRing && hubRing.material.opacity < 0.11, "Hub cohesion imprint remains too bright");

const bondFrame = {
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: { absorbHeld: true },
  playerComposition: { scar: 0.02 },
  chemObjectState: { pulseResponse: "none" }
};
const bondSystem = new BondSystem({
  recipeDataSystem: {},
  chemObjectSystem: {},
  playerRoot: new THREE.Group(),
  frameState: bondFrame
});
bondSystem.strength = 1;
const resistant = { recipe: { id: "resistant_test", chemistry: { absorbDifficulty: 0.9 } } };
for (let index = 0; index < 1800; index += 1) {
  bondSystem.applyAbsorbHold(1 / 60, resistant, {}, {
    canAbsorb: false,
    inAbsorbRange: true,
    absorbThreshold: 0.5,
    readiness: 1,
    frameState: bondFrame
  });
}
const scarAfterMistake = bondFrame.playerComposition.scar;
assert(scarAfterMistake > 0.08 && scarAfterMistake < 0.3, "resisted Absorb scar warning is absent or still saturates too quickly");
bondFrame.input.absorbHeld = false;
for (let index = 0; index < 1800; index += 1) bondSystem.recoverFirstSliceScar(1 / 60, bondFrame);
assert(bondFrame.playerComposition.scar < scarAfterMistake, "first-slice scar did not recover after release");

const focusFrame = {
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  statusPage: { firstHubUseComplete: false }
};
const focusRegistry = new TargetFocusRegistry({
  recipeDataSystem: { data: { targetFocusRules: new Map() } },
  frameState: focusFrame
});
focusRegistry.init();
focusRegistry.update(0, focusFrame);
assert(focusFrame.targetFocus.suppressTargeting, "legacy Hub chemistry target remains active during investigation");
assert(focusFrame.targetFocus.provider === "HubInvestigationGameplaySystem", "Hub investigation does not own pending focus");

const statusSource = readText("src/ui/StatusPageSystem.js");
assert(statusSource.includes("Practice strength (independent)"), "independent strength labeling missing");
assert(statusSource.includes("Practice balance (read / bind / stabilize)"), "normalized practice balance labeling missing");
assert(cohesion.directTriggerCompletion === false && cohesion.directObjectiveCompletion === false && cohesion.directGateMutation === false, "tuning layer claimed progression ownership");

console.log("HC-007E live feel, pacing, and readability tuning validation passed.");
