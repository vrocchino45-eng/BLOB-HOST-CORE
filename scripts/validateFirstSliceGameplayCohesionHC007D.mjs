import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { FirstSliceCohesionSystem } from "../src/core/FirstSliceCohesionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(`[validateFirstSliceGameplayCohesionHC007D] ${message}`); };

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/core/firstSliceCohesion_HC007E.json");
const source = readText("src/core/FirstSliceCohesionSystem.js");
const statusSource = readText("src/ui/StatusPageSystem.js");

assert(["HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id), "manifest lineage mismatch");
assert(pkg.version === manifest.version, "package version lineage mismatch");
assert(recipe.ownership?.observationalOnly === true, "cohesion must remain observational");
assert(recipe.ownership?.directTriggerCompletion === false, "cohesion may not complete triggers");
assert(recipe.ownership?.directObjectiveCompletion === false, "cohesion may not complete objectives");
assert(recipe.ownership?.directGateMutation === false, "cohesion may not mutate gates");
assert(Object.keys(recipe.regionLessons ?? {}).length === 3, "all three first-slice lessons are required");
assert(source.includes("this.playerRoot.add(this.root)"), "core imprint must follow the player core");
assert(statusSource.includes("Emerging practice"), "Status Page must expose the carried self-reading");

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
  surfaceWakeGameplay: { active: true, worldReadCount: 0, absorbedMoteCount: 0, stabilizeSeconds: 0 },
  guideThresholdGameplay: { active: false },
  hubInvestigationGameplay: { active: false }
};
const system = new FirstSliceCohesionSystem({ recipeDataSystem, playerRoot, frameState });
system.init();

function step(seconds = 1 / 30) {
  frameState.runtimeSeconds += seconds;
  system.update(seconds, frameState);
  frameState.input.pulsePressed = false;
}

frameState.input.pulsePressed = true;
frameState.input.pulseEventId = 1;
frameState.input.stabilizeHeld = true;
frameState.chemObjectState.absorbedObjects = 2;
frameState.surfaceWakeGameplay = { active: true, worldReadCount: 2, absorbedMoteCount: 2, stabilizeSeconds: 1.5 };
step(1.5);
const surfaceScore = frameState.firstSliceCohesion.lessons.find((item) => item.cellId === frameState.activeCellId).score;
assert(surfaceScore >= 0.99, "Surface Wake lesson was not retained");

frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
frameState.input.stabilizeHeld = false;
frameState.surfaceWakeGameplay = { active: false };
frameState.guideThresholdGameplay = { active: true, maxPathProgress: 0.8, familiarity: 0.75, optionalRewardCount: 1 };
step();
assert(frameState.firstSliceCohesion.lessons.find((item) => item.cellId === "CELL_MEMBRANE_NURSERY_001").score === surfaceScore, "Surface lesson was lost after transition");

frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frameState.guideThresholdGameplay = { active: false };
frameState.hubInvestigationGameplay = { active: true, progress: 1, routeReadCount: 3, investigationReady: true };
step();
const cohesion = frameState.firstSliceCohesion;
assert(cohesion.visitedRegionCount === 3, "three visited regions were not retained");
assert(cohesion.retainedLessonCount === 3, "three regional lessons were not retained");
assert(cohesion.practice.reading > 0 && cohesion.practice.binding > 0 && cohesion.practice.stabilizing > 0, "practice axes did not accumulate");
assert(cohesion.identityIsSoft && !cohesion.abilityUnlocks, "practice identity became a hard progression lock");
assert(cohesion.directTriggerCompletion === false && cohesion.directObjectiveCompletion === false && cohesion.directGateMutation === false, "cohesion claimed progression ownership");
assert(playerRoot.getObjectByName("first_slice_cohesion_imprint_HC007E"), "core visual imprint missing");

console.log("HC-007D first-slice gameplay cohesion validation passed.");
