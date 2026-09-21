import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateRenderTruthLivingSliceReadabilityHC009G] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const successorProfiles = new Map([
  ["HC-010A", "act1RuntimeProfile_HC010A.json"],
  ["HC-010B", "act1RuntimeProfile_HC010B.json"],
  ["HC-010C", "act1RuntimeProfile_HC010C.json"],
  ["HC-010D", "act1RuntimeProfile_HC010D.json"],
  ["HC-010E", "act1RuntimeProfile_HC010E.json"],
  ["HC-010F", "act1RuntimeProfile_HC010F.json"],
  ["HC-010G", "act1RuntimeProfile_HC010G.json"],
  ["HC-011A", "act1RuntimeProfile_HC011A.json"],
  ["HC-011A1", "act1RuntimeProfile_HC011A1.json"],
  ["HC-011B", "act1RuntimeProfile_HC011B.json"],
  ["HC-012A", "act1RuntimeProfile_HC012A.json"],
  ["HC-012B", "act1RuntimeProfile_HC012B.json"],
  ["HC-012C", "act1RuntimeProfile_HC012C.json"],
  ["HC-013A", "act1RuntimeProfile_HC013A.json"],
  ["HC-013B", "act1RuntimeProfile_HC013B.json"],
  ["HC-013C", "act1RuntimeProfile_HC013C.json"],
  ["HC-013D", "act1RuntimeProfile_HC013D.json"],
  ["HC-014A", "act1RuntimeProfile_HC014A.json"],
  ["HC-014B", "act1RuntimeProfile_HC014B.json"],
  ["HC-014D", "act1RuntimeProfile_HC014D.json"],
  ["HC-014C", "act1RuntimeProfile_HC014C.json"],
  ["HC-014G", "act1RuntimeProfile_HC014I.json"]
]);
const successorBuild = successorProfiles.has(manifest.id);
const profile = readJson(successorBuild
  ? `public/data/runtime/${successorProfiles.get(manifest.id)}`
  : "public/data/runtime/firstSliceRuntimeProfile_HC009G.json");

assert(
  (manifest.id === "HC-009G" && manifest.version === "0.0.116")
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
  || ((manifest.id === "HC-013C" && manifest.version === "0.0.132") || (manifest.id === "HC-013D" && manifest.version === "0.0.133") || (manifest.id === "HC-014A" && manifest.version === "0.0.134") || (manifest.id === "HC-014B" && manifest.version === "0.0.135") || (manifest.id === "HC-014C" && manifest.version === "0.0.136") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014E" && manifest.version === "0.0.138") || (manifest.id === "HC-014F" && manifest.version === "0.0.139") || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(pkg.version === manifest.version, "package identity mismatch");
assert(
  profile.id === (successorBuild
    ? `ACT1_RUNTIME_PROFILE_${manifest.id.replace("-", "")}`
    : "FIRST_SLICE_RUNTIME_PROFILE_HC009G"),
  "runtime profile identity mismatch"
);
assert(profile.pass === (successorBuild ? manifest.id : "HC-009G"), "runtime profile pass mismatch");
assert(profile.globalSystemIds.length === 15, "global runtime budget changed");
assert(profile.sharedSystemIds.length === 6, "shared first-slice budget changed");
assert(
  profile.firstSlicePath
    .map((regionId) => profile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "first-slice mount budgets changed"
);
assert(profile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");
assert(profile.renderTruth?.owner === "HubChamberFoundationSystem", "render-truth owner changed");
assert(profile.renderTruth?.timerOnlyReadabilityDisabled === true, "timer-only readability was re-enabled");
assert(profile.renderTruth?.playerFacingTechnicalIds === false, "technical IDs were allowed into player-facing UI");
assert(profile.renderTruth?.normalHudPrimaryInstructionCount === 1, "normal HUD instruction count changed");
assert(profile.renderTruth?.mutatesProgression === false, "render truth claims progression ownership");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(readFileSync(join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

// Region ownership must clear stale selection state and all targeting artifacts
// before any destination target can be reacquired.
const targetingScene = new THREE.Scene();
const targetingPlayer = new THREE.Group();
targetingPlayer.userData.objectId = "player_core_001";
targetingScene.add(targetingPlayer);
const oldTargetRoot = new THREE.Group();
oldTargetRoot.visible = true;
oldTargetRoot.position.set(0.5, 0, 0);
targetingScene.add(oldTargetRoot);
const targetingFrame = {
  activeCellId: "CELL_SCAR_FLOW_FOLD_001",
  firstSliceRuntimeMount: { mountSequence: 2 },
  targetFocus: {
    suppressTargeting: false,
    allowedCells: ["CELL_SCAR_FLOW_FOLD_001"],
    excludedObjectIds: [],
    objectBoosts: {},
    cellBoosts: {},
    targetKinds: {},
    provider: "validator"
  },
  selectedObject: oldTargetRoot.userData,
  pulse: { active: false },
  input: {}
};
const targeting = new TargetingSystem({
  scene: targetingScene,
  playerRoot: targetingPlayer,
  chemObjectSystem: {
    objects: [{
      recipe: {
        id: "pressure_fold_current_001",
        chemistry: { domains: ["signal"], bondTypes: [] },
        behavior: {}
      },
      root: oldTargetRoot,
      cellId: "CELL_SCAR_FLOW_FOLD_001",
      absorbed: false
    }]
  },
  frameState: targetingFrame
});
targeting.init();
targeting.update(1 / 60, targetingFrame);
assert(targetingFrame.targeting.targetId === "pressure_fold_current_001", "Guide target setup failed");
targeting.reticle.visible = true;
targeting.pointerLine.visible = true;
targeting.selectedHalo.visible = true;

targetingFrame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
targetingFrame.firstSliceRuntimeMount.mountSequence = 3;
targetingFrame.targetFocus.suppressTargeting = false;
targeting.update(1 / 60, targetingFrame);
assert(targetingFrame.targeting.targetId === "none", "region change retained the stale target");
assert(targetingFrame.targeting.targetCellId === "none", "region change retained the stale target cell");
assert(targetingFrame.targeting.regionClearSequence === 1, "region-clear sequence did not advance");
assert(targetingFrame.targeting.visualArtifactsCleared, "region change did not publish artifact cleanup");
assert(!targeting.reticle.visible && !targeting.pointerLine.visible && !targeting.selectedHalo.visible, "targeting artifacts survived the region change");
targeting.update(1 / 60, targetingFrame);
assert(targetingFrame.targeting.targetId === "none", "Hub reacquired a generic chemistry target");

const focusRegistry = new TargetFocusRegistry({ recipeDataSystem, frameState: targetingFrame });
focusRegistry.init();
targetingFrame.statusPage = { firstHubUseComplete: true };
targetingFrame.hubInvestigationGameplay = { active: true, investigationReady: true };
focusRegistry.update(1 / 60, targetingFrame);
assert(targetingFrame.targetFocus.suppressTargeting, "Hub targeting resumed after first Status use");
assert(targetingFrame.targetFocus.ruleId === "HC009G_HUB_PRESENTATION_NO_GENERIC_TARGET", "Hub render-truth target rule missing");

// Hub presentation must suppress inherited region roots and prove route
// readability through measured geometry, not reveal time.
const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.1, -0.15, -1.25);
scene.add(playerRoot);
const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 100);
camera.position.set(0.25, 1.6, 7.2);
camera.lookAt(0.1, 0, -2.8);
scene.add(camera);

const inheritedRoots = [
  ["membrane_pocket_surface_001", true],
  ["nursery_soft_pressure_fog_001", true],
  ["scar_flow_fold_surface_001", false],
  ["guide_threshold_gameplay_fill_HC007B", true],
  ["guide_path_shimmer_line", true],
  ["target_lock_reticle", true],
  ["selected_object_readability_halo", true],
  ["target_lock_pointer_line", true],
  ["signal_chorus_layered_interaction_HC006B", true],
  ["signal_chorus_combward_pressure_HC005D", true],
  ["signal_chorus_living_tissue_identity_HC006A", true],
  ["membrane_watcher_001", true]
];
for (const [name, visible] of inheritedRoots) {
  const object = new THREE.Group();
  object.name = name;
  object.visible = visible;
  scene.add(object);
}
const distantHost = new THREE.Group();
distantHost.name = "host_alpha_distant_silhouette_001";
scene.add(distantHost);

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  input: { pulsePressed: false, pulseEventId: 0 },
  playerKinematics: {
    position: { x: playerRoot.position.x, y: playerRoot.position.y, z: playerRoot.position.z },
    velocity: { x: 0, y: 0, z: -0.3 },
    speed: 0.3,
    altitude: playerRoot.position.y
  },
  signalChorusLayeredInteraction: { active: true, completed: true },
  hubInvestigationGameplay: {
    active: true,
    investigationReady: false,
    routeReads: [],
    routeReadCount: 0,
    nearestRouteId: "none",
    memoryRead: false,
    returnedToCenter: false
  },
  targeting: { targetId: "none" },
  targetFocus: { suppressTargeting: true },
  statusPage: { firstHubUseComplete: false },
  graveRouteLock: { routeLocked: false },
  firstSliceGates: {
    hub_to_grave_memory_route: { readable: true, crossable: false }
  },
  objectiveState: { id: "objective_sentinel", complete: false },
  gateState: { id: "gate_sentinel", crossable: false },
  physicalFeel: { viscosity: 0.48, pressure: 0.18 },
  promptStack: {},
  interactionInspectionFocus: {}
};
const objectiveBefore = JSON.stringify(frameState.objectiveState);
const gateBefore = JSON.stringify(frameState.gateState);
const foundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  camera,
  playerRoot,
  frameState
});
foundation.init();
for (let index = 0; index < 180; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  foundation.update(1 / 60, frameState);
}

assert(frameState.hubRenderTruth.active, "Hub render-truth state did not activate");
assert(frameState.hubRenderTruth.spatialTruth.verified, "authored Hub spatial truth failed");
assert(frameState.hubChamberFoundation.threeRouteLayoutReadable, "verified Hub layout did not become readable");
assert(frameState.hubRenderTruth.visibleLeakCount === 0, "non-Hub presentation leak remained visible");
assert(frameState.hubRenderTruth.distantHostMode === "background_anatomy_suggestion", "distant Host retained the enclosing-shell role");
assert(distantHost.userData.presentationRole === "background_anatomy_suggestion", "distant Host role was not staged as world meaning");
assert(frameState.hubRenderTruth.spatialTruth.minimumRouteSeparation >= 4.6, "route centers are not physically separated");
assert(frameState.hubRenderTruth.spatialTruth.minimumCenterClearance >= 2.35, "route bodies collapse into the comparison cradle");
assert(frameState.hubRenderTruth.spatialTruth.silhouetteCount === 3, "territory silhouettes are not distinct");
assert(frameState.hubRenderTruth.spatialTruth.altitudeBandCount === 3, "territories lost upper/middle/lower separation");
assert(frameState.hubRenderTruth.spatialTruth.minimumScreenSeparation > 0.25, "route centers overlap in the authored establishing view");
assert(JSON.stringify(frameState.objectiveState) === objectiveBefore, "render truth changed objective state");
assert(JSON.stringify(frameState.gateState) === gateBefore, "render truth changed gate state");
for (const [name] of inheritedRoots) {
  assert(scene.getObjectByName(name)?.visible === false, `${name} remained visible under Hub authority`);
}

const firstRoute = foundation.routeVisuals[0].gate;
const secondRoute = foundation.routeVisuals[1].gate;
secondRoute.position.copy(firstRoute.position);
foundation.update(1 / 60, frameState);
assert(!frameState.hubRenderTruth.spatialTruth.verified, "collapsed route layout still passed spatial truth");
assert(!frameState.hubChamberFoundation.threeRouteLayoutReadable, "reveal time alone claimed a collapsed layout was readable");

foundation.onRuntimeUnmount(frameState);
assert(scene.getObjectByName("membrane_pocket_surface_001").visible, "Hub cleanup did not restore a previously visible environment root");
assert(!scene.getObjectByName("scar_flow_fold_surface_001").visible, "Hub cleanup enabled an environment root that was previously hidden");

const hubSource = readText("src/hub/HubChamberFoundationSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const guidePromptSource = readText("src/guide/GuidePromptSystem.js");
const morphSource = readText("src/morph/MorphReadabilitySystem.js");
const visualSource = readText("src/visual/VisualComposer.js");
assert(hubSource.includes("minimumRouteSeparation"), "physical route-separation proof missing");
assert(hubSource.includes("timerOnlyReadabilityDisabled: true"), "timer-only readability guard missing");
assert(hubSource.includes("suppressedVisibility"), "exact region-visibility restoration missing");
assert(hudSource.includes("onePrimaryInstruction: true"), "single player-facing instruction contract missing");
assert(hudSource.includes("technicalIdsPlayerFacing: false"), "player-facing technical-ID suppression missing");
assert(!hudSource.includes("`Target: ${target.targetId"), "normal HUD still prints raw target IDs");
assert(guidePromptSource.includes('presentationDelegatedTo = delegatedToPlaytestHud'), "normal Guide instruction was not delegated to the single HUD owner");
assert(guidePromptSource.includes('this.promptEl.style.display = delegatedToPlaytestHud ? "none" : "block"'), "duplicate normal Guide panel remains visible");
assert(morphSource.includes("staleTransitionLanguageSuppressed: true"), "stale morph-language cleanup missing");
assert(visualSource.includes('presentationRole = "background_anatomy_suggestion"'), "distant Host background staging missing");

console.log("HC-009G Render Truth + Living-Slice Readability validation passed.");
