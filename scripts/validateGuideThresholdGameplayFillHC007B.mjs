import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuideThresholdGameplaySystem } from "../src/morph/GuideThresholdGameplaySystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../src/morph/GuideThresholdLayeredInteractionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(`[validateGuideThresholdGameplayFillHC007B] ${message}`); };

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipes = readJson("public/data/morph/guideThresholdGameplayRecipes.json");
const cells = readJson("public/data/world/localCellRecipes.json");
const chem = readJson("public/data/chemistry/chemObjectRecipes.json");
const gameplaySource = readText("src/morph/GuideThresholdGameplaySystem.js");
const layeredSource = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");
const scarSource = readText("src/morph/ScarFlowInteractionSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");

assert(
  (manifest.id === "HC-007B" && manifest.version === "0.0.100")
  || manifest.runtimeActivated?.guideThresholdGameplay === "GUIDE_THRESHOLD_GAMEPLAY_FILL_HC007B",
  "manifest must retain HC-007B gameplay lineage"
);
assert(Number(pkg.version.split(".").at(-1)) >= 100, "package version predates HC-007B");
const recipe = recipes.find((item) => item.id === "GUIDE_THRESHOLD_GAMEPLAY_FILL_HC007B");
assert(recipe, "gameplay recipe missing");
assert(recipe.triggerPolicy?.preserveExistingLayeredCompletionTrigger === true, "existing layered trigger must remain preserved");
assert(recipe.triggerPolicy?.neverDirectlyCompletesGuideThreshold === true, "gameplay fill must not directly complete Guide Threshold");
assert(recipe.optionalRewards?.length === 2, "expected two optional side rewards");

const scarCell = cells.find((item) => item.id === "CELL_SCAR_FLOW_FOLD_001");
assert(scarCell, "Scar Flow cell missing");
for (const id of recipe.optionalRewards) {
  assert(scarCell.contents?.chemObjects?.includes(id), `Scar Flow cell missing ${id}`);
  const object = chem.find((item) => item.id === id);
  assert(object?.behavior?.onAbsorb, `${id} must be absorbable systemic matter`);
  assert(object?.chemistry?.bondTypes?.includes("soft_bond"), `${id} must use normal soft-bond absorption`);
}

assert(runtimeSource.includes("GuideThresholdGameplaySystem"), "runtime must create GuideThresholdGameplaySystem");
assert(runtimeSource.includes('register("guideThresholdGameplaySystem"'), "runtime must update gameplay before the layered trigger");
assert(layeredSource.includes("gameplay?.active && !gameplay.triggerReady"), "layered trigger must wait for systemic gameplay convergence");
assert(scarSource.includes('ownershipDeferredTo: "GuideThresholdGameplaySystem"'), "legacy Scar Flow loop must defer ownership during gameplay fill");
assert(guideSource.includes("guideThresholdGameplayPrompt"), "Guide prompt must understand systemic Guide Threshold play");
assert(gameplaySource.includes("stabilizeHeld"), "LT stabilize must reduce traversal turbulence");
assert(gameplaySource.includes("flowRevealSeconds"), "X pulse must reveal the living current");
assert(gameplaySource.includes("triggerReady"), "systemic play must publish hidden convergence readiness");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const rewardObjects = recipe.optionalRewards.map((id) => ({
  recipe: { id },
  root: new THREE.Group(),
  absorbed: false,
  cellId: "CELL_SCAR_FLOW_FOLD_001"
}));
for (const item of rewardObjects) item.root.visible = true;
const worldReadIds = [recipe.worldReads.memoryFleckId, recipe.worldReads.pressureCurrentId, recipe.worldReads.clotId];
const worldReadObjects = worldReadIds.map((id) => ({
  recipe: { id },
  root: new THREE.Group(),
  absorbed: false,
  cellId: "CELL_SCAR_FLOW_FOLD_001"
}));
worldReadObjects[0].root.position.set(-1.78, 0.22, -1.82);
worldReadObjects[1].root.position.set(0.35, -0.7, -1.25);
worldReadObjects[2].root.position.set(0.8, -0.18, -1.75);
for (const item of worldReadObjects) item.root.visible = true;
const chemObjectSystem = { objects: [...rewardObjects, ...worldReadObjects] };

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SCAR_FLOW_FOLD_001",
  localCellMorph: { completed: true },
  secondLocalCellMorph: { started: false, completed: false },
  physicalFeel: { viscosity: 0.52, pressure: 0.58, flowVector: { x: 0.34, y: 0.04, z: -0.42 } },
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: false },
  playerKinematics: { velocity: { x: 0, y: 0, z: 0 } },
  morphCompletion: { memoryEcho: 0, pathConfidence: 0, pressureRelief: 0, clotWarning: 0.28, stability: 0.2 },
  inspectionCamera: { available: true, active: false },
  promptStack: {},
  lockState: {}
};

const gameplay = new GuideThresholdGameplaySystem({ recipeDataSystem, chemObjectSystem, scene, playerRoot, frameState });
gameplay.init();
const layered = new GuideThresholdLayeredInteractionSystem({ recipeDataSystem, scene, playerRoot, frameState });
layered.init();

function step(position, { pulse = false, stabilize = false } = {}) {
  playerRoot.position.copy(position);
  frameState.input.stabilizeHeld = stabilize;
  frameState.input.pulsePressed = pulse;
  if (pulse) frameState.input.pulseEventId += 1;
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 30;
  gameplay.update(1 / 30, frameState);
  layered.update(1 / 30, frameState);
  frameState.input.pulsePressed = false;
}

// The existing layered trigger must remain hidden at entry.
step(gameplay.path.getPoint(0));
assert(frameState.guideThresholdGameplay.active, "systemic gameplay must activate in Scar Flow");
assert(!frameState.guideThresholdGameplay.triggerReady, "trigger must not be ready on entry");
assert(!frameState.guideThresholdLayeredInteraction.active, "layered trigger must be inactive before systemic convergence");

// Off-current travel should be rougher, and LT should materially damp it.
const onPath = gameplay.path.getPoint(0.18);
step(onPath);
const onCurrentTurbulence = frameState.guideThresholdGameplay.effectiveTurbulence;
const tangent = gameplay.path.getTangent(0.2).setY(0).normalize();
const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(2.0);
const offPath = gameplay.path.getPoint(0.2).add(perpendicular);
step(offPath, { stabilize: false });
const roughTurbulence = frameState.guideThresholdGameplay.effectiveTurbulence;
step(offPath, { stabilize: true });
const stabilizedTurbulence = frameState.guideThresholdGameplay.effectiveTurbulence;
assert(roughTurbulence > onCurrentTurbulence, "off-current detour must increase turbulence");
assert(stabilizedTurbulence < roughTurbulence * 0.5, "LT stabilize must materially damp turbulence");

// Optional reward is real chemistry but not required for convergence.
rewardObjects[0].absorbed = true;
rewardObjects[0].root.userData.absorbed = true;
step(gameplay.path.getPoint(0.28));
assert(frameState.guideThresholdGameplay.optionalRewardCount === 1, "optional absorbed matter must be recorded");

// Pulse reveals the current; movement through the current converges naturally.
step(gameplay.path.getPoint(0.32), { pulse: true });
assert(frameState.guideThresholdGameplay.flowRevealActive, "pulse must reveal the current");
assert(frameState.guideThresholdGameplay.pulseReads >= 1, "pulse read must be counted");
for (let i = 0; i < 120 && !frameState.guideThresholdGameplay.triggerReady; i += 1) {
  const u = 0.32 + (i / 119) * 0.42;
  step(gameplay.path.getPoint(u), { stabilize: i % 4 === 0 });
}
assert(frameState.guideThresholdGameplay.triggerReady, "systemic traversal must eventually expose the existing convergence trigger");
assert(frameState.guideThresholdGameplay.maxPathProgress >= recipe.triggerPolicy.convergencePathProgress, "convergence must require actual travel through the current");
assert(frameState.guideThresholdLayeredInteraction.active, "existing layered trigger must become active after convergence");
assert(!frameState.guideThresholdLayeredInteraction.completed, "gameplay fill must never auto-complete the existing threshold trigger");

console.log("HC-007B Guide Threshold gameplay fill validation passed.");
