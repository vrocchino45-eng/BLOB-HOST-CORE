import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHubPresentationOwnershipLockHC006JA] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const hubSource = readText("src/hub/HubChamberFoundationSystem.js");

assert(["HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), "manifest identity mismatch.");
assert(["0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package identity mismatch.");
assert(recipe.id === "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA" && recipe.build === "HC-006JA", "presentation-lock recipe missing.");
assert(recipe.routes?.length === 3, "exactly three Hub routes must remain authored.");
assert(recipe.routes.filter((route) => route.status === "active_route").length === 1, "exactly one route must read active.");
assert(recipe.routes.filter((route) => route.status === "dormant_route").length === 2, "exactly two routes must remain dormant.");
assert(recipe.camera.distance >= 8 && recipe.camera.fieldOfView >= 60, "Hub camera must frame the full junction.");
assert(recipe.visual.hubClutterOpacityScale <= 0.2 && recipe.visual.signalHazeOpacityScale <= 0.05, "retained Signal presentation must be quieted.");
assert(Math.abs(recipe.routes[1].position[0] - recipe.routes[2].position[0]) >= 9, "left and right dormant routes need wide physical separation.");
assert(guideSource.indexOf("layeredInteraction ?? hubFoundation") < guideSource.indexOf("hubFoundation ?? nextRoutePressure"), "Hub prompt must precede retained next-route pressure.");
assert(guideSource.includes("if (frameState.hubChamberFoundation?.active) return null;"), "retained Signal prompts must relinquish while Hub owns the scene.");
assert(hudSource.indexOf(": hubFoundation.active") < hudSource.indexOf(": nextRoutePressure.active"), "HUD state priority must favor Hub over retained pressure.");
assert(hubSource.includes('setSceneObjectVisible("signal_chorus_layered_interaction_HC006B", false)') && hubSource.includes('setSceneObjectVisible("signal_chorus_combward_pressure_HC005D", false)'), "legacy Signal presentation must be hidden during Hub ownership.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.data.hubChamberFoundationRecipes.has(recipe.id), "presentation-lock recipe must load through RecipeDataSystem.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.1, -0.2, -1.4);
scene.add(playerRoot);

const makeLegacyRoot = (name, opacity = 0.8) => {
  const rootObject = new THREE.Group();
  rootObject.name = name;
  const material = new THREE.MeshBasicMaterial({ transparent: true, opacity });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), material);
  mesh.name = `${name}_mesh`;
  rootObject.add(mesh);
  scene.add(rootObject);
  return { rootObject, material };
};
const layeredRoot = makeLegacyRoot("signal_chorus_layered_interaction_HC006B");
const pressureRoot = makeLegacyRoot("signal_chorus_combward_pressure_HC005D");
const identityRoot = makeLegacyRoot("signal_chorus_living_tissue_identity_HC006A", 0.7);
const hazeRoot = makeLegacyRoot("signal_chorus_soft_haze_001", 0.5);

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  signalChorusLayeredInteraction: { active: true, completed: true, stage: "layered_interaction_complete", progress: 1 },
  graveRouteLock: { routeLocked: true },
  interactionInspectionFocus: {},
  promptStack: {},
  nonFatalSystemErrors: []
};
const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
hub.init();
for (let i = 0; i < 180; i += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  hub.update(1 / 60, frameState);
}

const state = frameState.hubChamberFoundation;
assert(state.completed && state.presentationOwnershipLocked && state.legacySignalPresentationSuppressed, "Hub must publish a completed presentation ownership lock.");
assert(frameState.hubPresentationOwnership?.hubInstructionsExclusive, "Hub must publish exclusive instruction ownership.");
assert(!layeredRoot.rootObject.visible && !pressureRoot.rootObject.visible, "completed interaction and passive pressure visuals must be hidden.");
assert(identityRoot.material.opacity < 0.2, "retained living identity must become a quiet memory layer.");
assert(hazeRoot.material.opacity <= 0.05, "Hub haze must no longer dominate the frame.");
assert(frameState.interactionInspectionFocus.camera.distance >= 8 && frameState.interactionInspectionFocus.camera.fieldOfView >= 60, "authored Hub inspection focus must frame the junction widely.");
assert(state.routeActivated === false && state.targetRequired === false && state.inputRequired === false, "presentation lock must not change progression.");
assert(frameState.nonFatalSystemErrors.length === 0, "presentation-lock simulation must remain error-free.");

console.log("validateHubPresentationOwnershipLockHC006JA validation passed.");
