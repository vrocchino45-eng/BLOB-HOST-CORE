import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { HubInvestigationGameplaySystem } from "../src/hub/HubInvestigationGameplaySystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(`[validateHubInvestigationGameplayHC007C] ${message}`); };

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipes = readJson("public/data/hub/hubInvestigationGameplay_HC007C.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const statusSource = readText("src/ui/StatusPageSystem.js");
const promptSource = readText("src/guide/GuidePromptSystem.js");

assert(
  (((manifest.id === "HC-007C" && manifest.version === "0.0.101")
  || (manifest.id === "HC-007D" && manifest.version === "0.0.102")
  || (manifest.id === "HC-007E" && manifest.version === "0.0.103")
  || (manifest.id === "HC-008B" && manifest.version === "0.0.104")
  || (manifest.id === "HC-008C" && manifest.version === "0.0.105")
  || (manifest.id === "HC-008D" && manifest.version === "0.0.106")
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
assert(pkg.version === manifest.version, "package version mismatch");
const recipe = recipes.find((item) => item.id === "HUB_INVESTIGATION_GAMEPLAY_HC007C");
assert(recipe?.routes?.length === 3, "three Hub routes are required");
assert(recipe.triggerPolicy?.preserveStatusPageTrigger === true, "Status Page trigger must remain preserved");
assert(recipe.triggerPolicy?.preserveGraveGateTrigger === true, "Grave gate trigger must remain preserved");
assert(recipe.triggerPolicy?.neverOpensDormantRoutes === true, "dormant routes must remain dormant");
assert(runtimeSource.includes('register("hubChamberFoundationSystem"'), "Hub foundation registration missing");
assert(runtimeSource.indexOf('register("hubInvestigationGameplaySystem"') > runtimeSource.indexOf('register("hubChamberFoundationSystem"'), "gameplay investigation must update after Hub presentation");
assert(statusSource.includes("hubInvestigationGameplay.investigationReady"), "Status Page trigger must wait for investigation convergence");
assert(promptSource.includes("hubInvestigationPrompt"), "Guide must explain Hub investigation play");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  hubChamberFoundation: { active: true, completed: true },
  physicalFeel: { viscosity: 0.5, pressure: 0.5 },
  input: { pulsePressed: false, pulseEventId: 0 }
};
const system = new HubInvestigationGameplaySystem({ recipeDataSystem, scene, playerRoot, frameState });
system.init();

function step(position, pulse = false) {
  playerRoot.position.fromArray(position);
  frameState.input.pulsePressed = pulse;
  if (pulse) frameState.input.pulseEventId += 1;
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 30;
  system.update(1 / 30, frameState);
  frameState.input.pulsePressed = false;
}

step(recipe.center.position);
assert(frameState.hubInvestigationGameplay.active, "Hub investigation must activate in Hub");
assert(!frameState.hubInvestigationGameplay.investigationReady, "arrival must not auto-complete investigation");

for (const route of recipe.routes) {
  step(route.position, true);
  assert(frameState.hubInvestigationGameplay.routeReads.includes(route.id), `${route.id} did not answer pulse`);
}
assert(frameState.hubInvestigationGameplay.allRoutesRead, "all three route readings must be retained");
assert(!frameState.hubInvestigationGameplay.investigationReady, "route reads alone must not complete investigation");

step(recipe.memoryFragment.position, true);
assert(frameState.hubInvestigationGameplay.memoryRead, "memory fragment must require and retain a pulse read");
assert(!frameState.hubInvestigationGameplay.investigationReady, "memory read away from center must still require return");

step(recipe.center.position);
assert(frameState.hubInvestigationGameplay.returnedToCenter, "return to center was not detected");
assert(frameState.hubInvestigationGameplay.investigationReady, "route comparison must converge at center");
assert(frameState.hubInvestigationGameplay.directObjectiveCompletion === false, "gameplay layer must not complete ObjectiveSystem directly");
assert(frameState.hubInvestigationGameplay.dormantRoutesOpened === false, "dormant routes were opened");

console.log("HC-007C Hub investigation gameplay validation passed.");
