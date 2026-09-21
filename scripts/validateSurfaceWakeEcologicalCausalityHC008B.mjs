import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SurfaceWakeEcologicalCausalitySystem } from "../src/opening/SurfaceWakeEcologicalCausalitySystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(`[validateSurfaceWakeEcologicalCausalityHC008B] ${message}`); };

const recipe = readJson("public/data/opening/surfaceWakeEcologicalCausality_HC008B.json");
const gameplayRecipe = readJson("public/data/opening/surfaceWakeGameplayRecipes.json")[0];
const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
assert(
  (((manifest.id === "HC-008B" && manifest.version === "0.0.104") ||
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
assert(readText("index.html").includes(manifest.id), "browser title is stale");
assert(recipe.id === "SURFACE_WAKE_ECOLOGICAL_CAUSALITY_HC008B", "causality recipe missing");
assert(Object.keys(recipe.systems ?? {}).length === 4, "care, circulation, wound/sensory, and convergence systems must be mapped");
assert(Object.keys(gameplayRecipe.moteIdentities ?? {}).length === 3, "all three existing motes need distinct identities");
assert(new Set(Object.values(gameplayRecipe.moteIdentities).map((item) => item.role)).size === 3, "mote roles must be distinct");
for (const [key, value] of Object.entries(recipe.triggerPolicy ?? {})) {
  if (key.startsWith("adds") || key.startsWith("changes")) assert(value === false, `${key} must remain false`);
}

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const makeObject = (id, position) => {
  const objectRoot = new THREE.Group();
  objectRoot.position.set(...position);
  return { recipe: { id, spawn: { scale: 1 } }, root: objectRoot, absorbed: false };
};
const objects = [
  makeObject("dormant_seed_nutrient_001", [1.2, 0.1, 1.1]),
  makeObject("signal_vapor_thread_001", [-1.7, 0.2, -1.4]),
  makeObject("flux_current_ribbon_001", [0.1, 0, -0.2]),
  makeObject("scar_contamination_plate_001", [2.1, -0.1, -1.6])
];
const chemObjectSystem = { objects };
const frameState = {
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  runtimeSeconds: 0,
  input: { pulsePressed: false, pulseEventId: 0, absorbHeld: false, stabilizeHeld: false },
  pulse: { affectedObjects: [] },
  surfaceWakeGameplay: { active: true, pressureIntensity: 0.2, worldReads: [], absorbedMoteCount: 0 },
  surfaceWakeLayeredInteraction: { active: true, stage: "approach_listening_fold", stageIndex: 0, completed: false },
  localCellMorph: { progress: 0, phase: "waiting_for_seed_absorb" },
  gateState: { id: "unchanged_gate", status: "pending" }
};
const system = new SurfaceWakeEcologicalCausalitySystem({ recipeDataSystem, chemObjectSystem, scene, playerRoot, frameState });
system.init();

const ownerSnapshots = {
  layered: frameState.surfaceWakeLayeredInteraction,
  morph: frameState.localCellMorph,
  gate: frameState.gateState,
  seedAbsorbed: objects[0].absorbed
};

system.update(0.1, frameState);
assert(frameState.surfaceWakeEcology.phase === "awaken", "opening must begin in awaken phase");
playerRoot.position.x = 0.3;
frameState.runtimeSeconds += 0.2;
system.update(0.2, frameState);
assert(frameState.surfaceWakeEcology.phase === "observe" && frameState.surfaceWakeEcology.noticed, "movement must make the existing nursery notice the player");

frameState.surfaceWakeLayeredInteraction = { active: true, stage: "watch_tissue_response", stageIndex: 3, completed: false };
frameState.runtimeSeconds += 0.2;
system.update(0.2, frameState);
assert(frameState.surfaceWakeEcology.phase === "communicate", "fold interaction must become communicate phase");
assert(frameState.surfaceWakeEcology.foldResponseTraveling, "fold response must visibly travel across the nursery");

frameState.surfaceWakeLayeredInteraction = { active: true, stage: "surface_wake_complete", stageIndex: 5, completed: true };
frameState.runtimeSeconds += 0.2;
system.update(0.2, frameState);
assert(frameState.surfaceWakeEcology.phase === "receive" && frameState.surfaceWakeEcology.seedPresented, "fold completion must present the existing protected seed");

objects[0].absorbed = true;
objects[0].root.userData.absorbed = true;
frameState.runtimeSeconds += 0.2;
system.update(0.2, frameState);
assert(frameState.surfaceWakeEcology.phase === "outgrow" && frameState.surfaceWakeEcology.seamReadable, "seed absorption must make the existing scar/signal seam readable");

frameState.input = { pulsePressed: true, pulseEventId: 1, absorbHeld: false, stabilizeHeld: false };
frameState.pulse = { affectedObjects: ["signal_vapor_thread_001"] };
frameState.runtimeSeconds += 0.1;
system.update(0.1, frameState);
assert(frameState.surfaceWakeEcology.departureExpression === "resonant_offered_seam", "signal departure expression was not retained");
assert(frameState.surfaceWakeEcology.persistentEcho === "listened_for_offered_path", "signal departure echo missing");

frameState.input.pulsePressed = false;
frameState.localCellMorph = { progress: 0.15, phase: "morphing" };
frameState.runtimeSeconds += 0.2;
system.update(0.2, frameState);
assert(frameState.surfaceWakeEcology.phase === "depart", "existing morph progress must cause depart presentation");

const state = frameState.surfaceWakeEcology;
assert(state.directTriggerCompletion === false && state.directSeedAbsorption === false, "causality layer claimed fold or seed ownership");
assert(state.directMorphActivation === false && state.directCellChange === false && state.directGateMutation === false, "causality layer claimed progression ownership");
assert(state.newEntityCount === 0 && state.newRouteCount === 0 && state.newRegionCount === 0, "pass expanded content scope");
assert(ownerSnapshots.seedAbsorbed === false, "test baseline seed ownership malformed");
assert(frameState.gateState === ownerSnapshots.gate && frameState.gateState.status === "pending", "gate state was mutated");

const entitySource = readText("src/ecology/EntitySystem.js");
const orbiterSource = readText("src/ecology/OrbiterSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
assert(entitySource.includes("presenting_protected_seed") && entitySource.includes("recording_departure_expression"), "existing Tender/Watcher identities are not wired to causality");
assert(orbiterSource.includes("!surfaceFold.completed") && orbiterSource.includes("surfaceFold.completed"), "Guide can still point to the seed before it is presented");
assert(runtimeSource.indexOf('register("surfaceWakeEcologicalCausalitySystem"') > runtimeSource.indexOf('register("surfaceWakeLayeredInteractionSystem"'), "causality must observe the existing fold owner after it updates");
assert(runtimeSource.indexOf('register("surfaceWakeEcologicalCausalitySystem"') < runtimeSource.indexOf('register("entitySystem"'), "existing entities must receive causality state in the same frame");

console.log("HC-008B Surface Wake ecological causality validation passed.");
