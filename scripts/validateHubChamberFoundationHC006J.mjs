import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHubChamberFoundationHC006J] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/hub/hubChamberFoundation_HC006J.json")[0];
const gatesData = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectiveData = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const regionData = readJson("public/data/world/firstSliceRegions_HC006I.json");
const cameraData = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visualData = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const runtimeSource = readText("src/core/GameRuntime.js");
const hubSource = readText("src/hub/HubChamberFoundationSystem.js");

assert([["HC-006J", "0.0.92"], ["HC-006JA", "0.0.93"], ["HC-006K", "0.0.94"], ["HC-006KA", "0.0.95"], ["HC-006KB", "0.0.96"], ["HC-006KC", "0.0.97"], ["HC-006KD", "0.0.98"], ["HC-007A", "0.0.99"], ["HC-007B", "0.0.100"], ["HC-007C", "0.0.101"], ["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"]].some(([id, version]) => manifest.id === id && manifest.version === version), "manifest identity mismatch.");
assert(["0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package version mismatch.");
assert(recipe.id === "HUB_CHAMBER_FOUNDATION_HC006J", "authored Hub recipe is missing.");
assert(recipe.sourceAuthority === "HOST_CORE_Blueprint_v1_reference_docs.zip", "Hub recipe must name the authoritative source.");
assert(recipe.routes?.length === 3, "Hub foundation must author exactly three route identities.");
assert(recipe.routes.filter((route) => route.status === "active_route").length === 1, "Hub foundation must have exactly one active route.");
assert(recipe.routes.filter((route) => route.status === "dormant_route").length === 2, "Hub foundation must have exactly two dormant routes.");
assert(recipe.forbidden.includes("teleport") && recipe.forbidden.includes("branch menu"), "Hub foundation must prohibit arbitrary transition shortcuts.");
assert(gatesData.some((gate) => gate.id === "hub_to_grave_memory_route" && gate.authoredStatus === "active_route"), "active Hub gate data missing.");
assert(gatesData.filter((gate) => gate.authoredStatus === "dormant_route").length === 2, "dormant Hub gate data missing.");
assert(objectiveData.find((objective) => objective.id === "hub_read_route_gates")?.steps?.length >= 4, "Hub objective must require all four readability steps.");
assert(runtimeSource.includes('this.registry.register("hubChamberFoundationSystem"'), "GameRuntime must register the Hub foundation.");
assert(runtimeSource.indexOf('this.registry.register("hubChamberFoundationSystem"') < runtimeSource.indexOf('this.registry.register("modeController"'), "Hub presentation must publish before mode/objective/gate read ownership state.");
assert(hubSource.includes("targetingSuppressed: true") && hubSource.includes("noTeleport: true") && hubSource.includes("newRouteContentActivated: false"), "Hub foundation must remain non-targeting and non-transitional.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();
assert(recipeDataSystem.data.hubChamberFoundationRecipes.size >= 2, "Hub foundation and presentation-lock recipes must load through RecipeDataSystem.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.2, -0.22, -1.4);
scene.add(playerRoot);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  signalChorusLayeredInteraction: { active: true, completed: false, stage: "observe_cadence", progress: 0.2 },
  graveRouteLock: { routeLocked: false },
  interactionInspectionFocus: {},
  promptStack: {},
  nonFatalSystemErrors: []
};
const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
hub.init();

const stepHub = (count = 1) => {
  for (let i = 0; i < count; i += 1) {
    frameState.frame += 1;
    frameState.runtimeSeconds += 1 / 60;
    hub.update(1 / 60, frameState);
  }
};

stepHub(120);
let state = frameState.hubChamberFoundation;
assert(state.active && state.routeCount === 3 && state.activeRouteCount === 1 && state.dormantRouteCount === 2, "Hub route layout must exist before layered interaction completion.");
if (["HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id)) {
  assert(state.completed && state.activeRouteIdentityDistinguished, "HC-006KC+ first-Hub route identity must be owned by HubMode and must not wait for the later post-Grave layered interaction.");
} else {
  assert(!state.completed && !state.activeRouteIdentityDistinguished, "route identity must not complete before the Signal reading completes.");
}
assert(state.targetRequired === false && state.inputRequired === false && state.routeActivated === false, "Hub foundation must not require input or activate a route.");
assert(scene.getObjectByName("hub_junction_anchor_001"), "central Hub junction anchor is missing.");
assert(scene.getObjectByName("hub_first_memory_fragment_001"), "first memory fragment is missing.");
assert(scene.getObjectByName("hub_route_gate_grave_memory_route"), "active route gate visual is missing.");
assert(scene.getObjectByName("hub_route_gate_vascular_route") && scene.getObjectByName("hub_route_gate_silt_burrow_route"), "dormant route gate visuals are missing.");

frameState.signalChorusLayeredInteraction = { active: true, completed: true, stage: "layered_interaction_complete", progress: 1 };
stepHub(150);
state = frameState.hubChamberFoundation;
assert(state.completed && state.progress >= 0.99, "Hub foundation must complete after the layered Signal reading and authored reveal.");
assert(state.centralAnchorReadable && state.threeRouteLayoutReadable && state.activeRouteIdentityDistinguished && state.firstMemoryFragmentReadable, "all Hub readability conditions must complete.");
assert(frameState.interactionInspectionFocus?.providerId === "HubChamberFoundationSystem" && frameState.interactionInspectionFocus.active, "Hub must publish its authored inspection focus.");
assert(frameState.hubReadability?.falseTargetsSuppressed, "Hub clutter/readability state must suppress false targets.");

const regionRegistry = new RegionRegistry(regionData);
const gateRegistry = new GateRegistry(gatesData);
const objectiveRegistry = new ObjectiveRegistry(objectiveData);
const cameraRegistry = new CameraProfileRegistry(cameraData);
const visualRegistry = new VisualLanguageRegistry(visualData);
const mode = new ModeController({ regionRegistry, cameraProfileRegistry: cameraRegistry, visualLanguageRegistry: visualRegistry, frameState });
const objective = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const gate = new GateSystem({ gateRegistry, frameState });
mode.update(1 / 60, frameState);
objective.update(1 / 60, frameState);
gate.update(1 / 60, frameState);

assert(frameState.currentMode.id === "hub_mode" && frameState.currentMode.regionId === "hub_chamber", "HubMode must own the foundation cell.");
assert(frameState.objectiveState.id === "hub_read_route_gates", "Hub objective id mismatch.");
if (["HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id)) {
  assert(frameState.objectiveState.complete === false && frameState.objectiveState.progress === 0.8, "HC-006K Hub objective must wait at 80% for first Status Page use.");
  assert(frameState.objectiveState.blocker === "open_status_page_with_view_select_or_tab", "HC-006K Hub objective must identify Status Page as the remaining blocker.");
} else {
  assert(frameState.objectiveState.complete, "Hub objective must complete only from foundation readability in HC-006J/JA.");
}
assert(frameState.objectiveState.stepState.hub_junction_anchor_readable && frameState.objectiveState.stepState.three_route_gate_layout_readable && frameState.objectiveState.stepState.active_route_identity_distinguished && frameState.objectiveState.stepState.first_memory_fragment_readable, "Hub objective steps must reflect authored readability state.");
if (["HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id)) {
  assert(frameState.firstSliceGates.hub_to_grave_memory_route.status === "readable", "HC-006KA Grave Memory route must remain readable but non-crossable before first Hub Status Page use.");
  assert(frameState.firstSliceGates.hub_to_grave_memory_route.crossable === false, "HC-006KA Grave Memory route crossed prerequisite too early.");
} else {
  assert(frameState.firstSliceGates.hub_to_grave_memory_route.status === "available", "existing active Grave-memory compatibility route must be available.");
}
assert(frameState.firstSliceGates.hub_to_vascular_route.status === "locked" && frameState.firstSliceGates.hub_to_silt_burrow_route.status === "locked", "dormant routes must remain locked.");
assert(frameState.firstSliceGates.hub_to_vascular_route.dormant && frameState.firstSliceGates.hub_to_silt_burrow_route.dormant, "dormant route identity must remain explicit.");
assert(frameState.nonFatalSystemErrors.length === 0, "Hub foundation simulation must remain error free.");

console.log("validateHubChamberFoundationHC006J validation passed.");
