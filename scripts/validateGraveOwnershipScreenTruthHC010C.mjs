import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GuidePromptSystem } from "../src/guide/GuidePromptSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { PlaytestHudSystem } from "../src/ui/PlaytestHudSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const supportedBuilds = new Map([
  ["HC-010C", { version: "0.0.119", profile: "act1RuntimeProfile_HC010C.json", profileId: "ACT1_RUNTIME_PROFILE_HC010C" }],
  ["HC-010D", { version: "0.0.120", profile: "act1RuntimeProfile_HC010D.json", profileId: "ACT1_RUNTIME_PROFILE_HC010D" }],
  ["HC-010E", { version: "0.0.121", profile: "act1RuntimeProfile_HC010E.json", profileId: "ACT1_RUNTIME_PROFILE_HC010E" }],
  ["HC-010F", { version: "0.0.122", profile: "act1RuntimeProfile_HC010F.json", profileId: "ACT1_RUNTIME_PROFILE_HC010F" }],
  ["HC-010G", { version: "0.0.123", profile: "act1RuntimeProfile_HC010G.json", profileId: "ACT1_RUNTIME_PROFILE_HC010G" }],
  ["HC-011A", { version: "0.0.124", profile: "act1RuntimeProfile_HC011A.json", profileId: "ACT1_RUNTIME_PROFILE_HC011A" }],
  ["HC-011A1", { version: "0.0.125", profile: "act1RuntimeProfile_HC011A1.json", profileId: "ACT1_RUNTIME_PROFILE_HC011A1" }],
  ["HC-011B", { version: "0.0.126", profile: "act1RuntimeProfile_HC011B.json", profileId: "ACT1_RUNTIME_PROFILE_HC011B" }],
  ["HC-012A", { version: "0.0.127", profile: "act1RuntimeProfile_HC012A.json", profileId: "ACT1_RUNTIME_PROFILE_HC012A" }],
  ["HC-012B", { version: "0.0.128", profile: "act1RuntimeProfile_HC012B.json", profileId: "ACT1_RUNTIME_PROFILE_HC012B" }],
  ["HC-012C", { version: "0.0.129", profile: "act1RuntimeProfile_HC012C.json", profileId: "ACT1_RUNTIME_PROFILE_HC012C" }],
  ["HC-013A", { version: "0.0.130", profile: "act1RuntimeProfile_HC013A.json", profileId: "ACT1_RUNTIME_PROFILE_HC013A" }],
  ["HC-013B", { version: "0.0.131", profile: "act1RuntimeProfile_HC013B.json", profileId: "ACT1_RUNTIME_PROFILE_HC013B" }],
  ["HC-013C", { version: "0.0.132", profile: "act1RuntimeProfile_HC013C.json", profileId: "ACT1_RUNTIME_PROFILE_HC013C" }],
  ["HC-013D", { version: "0.0.133", profile: "act1RuntimeProfile_HC013D.json", profileId: "ACT1_RUNTIME_PROFILE_HC013D" }],
  ["HC-014A", { version: "0.0.134", profile: "act1RuntimeProfile_HC014A.json", profileId: "ACT1_RUNTIME_PROFILE_HC014A" }],
  ["HC-014B", { version: "0.0.135", profile: "act1RuntimeProfile_HC014B.json", profileId: "ACT1_RUNTIME_PROFILE_HC014B" }],
  ["HC-014D", { version: "0.0.137", profile: "act1RuntimeProfile_HC014D.json", profileId: "ACT1_RUNTIME_PROFILE_HC014D" }],
  ["HC-014C", { version: "0.0.136", profile: "act1RuntimeProfile_HC014C.json", profileId: "ACT1_RUNTIME_PROFILE_HC014C" }],
  ["HC-014G", { version: "0.0.140", profile: "act1RuntimeProfile_HC014G.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }],
  ["HC-014I", { version: "0.0.142", profile: "act1RuntimeProfile_HC014I.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }]
]);
const build = supportedBuilds.get(manifest.id);
assert.ok(build, "Grave ownership/screen-truth validation requires HC-010C or a retained successor.");
const profile = readJson(`public/data/runtime/${build.profile}`);

assert.equal(manifest.version, build.version);
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, build.profileId);
assert.equal(profile.pass, manifest.id);
assert.equal(profile.globalSystemIds.length, 15);
assert.equal(profile.sharedSystemIds.length, 6);
assert.equal(
  profile.firstSlicePath.map((regionId) => profile.regions[regionId].activeUpdateBudget).join("|"),
  "15|13|8"
);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.equal(profile.promptOwnership.activeRegionOverridesRetainedGuidance, true);
assert.equal(profile.promptOwnership.atomicClearAndRepublish, true);
assert.equal(profile.renderTruth.screenSpaceRequired, true);
assert.equal(profile.renderTruth.projectedDistantHostMeasurementRequired, true);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return readJson(join("public", relative));
};
await recipeDataSystem.loadAll();

// The active cell is the immediate crossing truth. Deliberately retain stale
// Hub and Guide publishers plus the previous Hub mount label; Grave must still
// own the very same frame's prompt, normal HUD, and F1 flow summary.
const promptFrame = {
  frame: 40,
  runtimeSeconds: 12,
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  firstSliceRuntimeMount: {
    activeRegionId: "hub_chamber",
    presentationOwner: "HubChamberFoundationSystem",
    mountSequence: 3
  },
  hubChamberFoundation: {
    active: true,
    completed: true,
    guideLine: "STALE HUB GUIDE",
    objectiveLine: "STALE HUB OBJECTIVE",
    nextAction: "STALE HUB ACTION",
    routeCount: 3,
    dormantRouteCount: 2
  },
  hubInvestigationGameplay: { active: false, investigationReady: true },
  guideThresholdGameplay: {
    active: true,
    triggerReady: false,
    guideLine: "STALE GUIDE THRESHOLD",
    objectiveLine: "STALE GUIDE THRESHOLD OBJECTIVE"
  },
  guideThresholdLayeredInteraction: { active: true, completed: false },
  surfaceWakeLayeredInteraction: { active: true, completed: true },
  graveMemoryRoute: {
    active: true,
    stage: "read_old_core_husk",
    status: "risk_recovery_safe_transfer_active",
    progress: 0.12,
    readCount: 0,
    requiredReadCount: 4,
    traceIntegrity: 1,
    residueRecoilRisk: 0,
    safeTransferProgress: 0,
    graveMemoryImprintCommitted: false,
    returnFoldReady: false,
    currentFocus: "old_core_husk_memory_001",
    targetRequired: false,
    inputRequired: true,
    movementRequired: true,
    guideLine: "Memory answers Pulse before it accepts any other action.",
    objectiveLine: "Read the husk, settle the silt, and understand what the scar protects.",
    nextAction: "Approach the old Core husk and Pulse to read it.",
    lastInteraction: "entered_grave_memory_without_forced_relocation"
  },
  openingFlow: { promptMinHoldSeconds: 99, worldFacingObjective: "STALE OPENING OBJECTIVE" },
  targeting: { targetId: "none" },
  targetFocus: { provider: "none", ruleId: "none" },
  selectedObject: {},
  input: {},
  inputSource: { activeDevice: "keyboard" },
  debugDisplay: { mode: "hidden" },
  promptStack: { activePresentationOwner: "HubChamberFoundationSystem" },
  firstSliceCohesion: { sliceLockReady: true },
  coreGrowth: { displayStage: "Binding Core", stageId: "binding_core", growthProgress: 1 },
  statusPage: {},
  playtestHud: {}
};
const guidePromptSystem = new GuidePromptSystem({ recipeDataSystem, frameState: promptFrame });
guidePromptSystem.update(0, promptFrame);
assert.equal(promptFrame.guidePrompt.id, "GUIDE_PROMPT_GRAVE_MEMORY_ROUTE_HC010C");
assert.equal(promptFrame.guidePrompt.contentOwner, "GraveMemoryRouteSystem");
assert.equal(promptFrame.guidePrompt.activeRegionId, "grave_memory_route");
assert.equal(promptFrame.promptStack.activePresentationOwner, "GraveMemoryRouteSystem");
assert.equal(promptFrame.promptLifecycle.atomicRegionRepublishComplete, true);
assert.equal(promptFrame.promptLifecycle.stalePromptHoldCleared, true);
assert.equal(promptFrame.promptLifecycle.internalStagePlayerFacing, false);
assert.ok(!promptFrame.guidePrompt.objectiveLine.includes("STALE"));

const graveDiagnostic = buildRuntimeDiagnosticSummary(promptFrame);
assert.equal(graveDiagnostic.flowKey, "graveMemoryRoute");
assert.equal(graveDiagnostic.owner, "GraveMemoryRouteSystem");

const playtestHud = new PlaytestHudSystem({ recipeDataSystem, frameState: promptFrame });
const graveHud = playtestHud.resolveHudState(promptFrame, true);
assert.equal(graveHud.title, "BLOB // HOST CORE // GRAVE MEMORY");
assert.ok(graveHud.primaryInstruction.includes("old Core husk"));
assert.ok(!graveHud.primaryInstruction.includes("STALE"));
assert.equal(graveHud.technicalIdsPlayerFacing, false);

// Return the active cell to Hub while retaining the previous Grave mount label.
// The crossing-frame fallback must already be Hub-owned before the next mount.
promptFrame.frame += 1;
promptFrame.runtimeSeconds += 0.016;
promptFrame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
promptFrame.firstSliceRuntimeMount.activeRegionId = "grave_memory_route";
promptFrame.hubChamberFoundation.active = false;
promptFrame.hubInvestigationGameplay.active = false;
guidePromptSystem.update(0, promptFrame);
assert.equal(promptFrame.guidePrompt.id, "GUIDE_PROMPT_HUB_ARRIVAL_HANDOFF_HC010C");
assert.equal(promptFrame.guidePrompt.contentOwner, "HubChamberFoundationSystem");
assert.equal(promptFrame.promptLifecycle.regionChangedThisFrame, true);
assert.equal(promptFrame.promptLifecycle.regionPromptEpoch, 2);

function createHubFrame(playerRoot) {
  return {
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
    firstSliceGates: { hub_to_grave_memory_route: { readable: true, crossable: false } },
    objectiveState: { id: "objective_sentinel", complete: false },
    gateState: { id: "gate_sentinel", crossable: false },
    physicalFeel: { viscosity: 0.48, pressure: 0.18 },
    promptStack: {},
    interactionInspectionFocus: {}
  };
}

function createHubScene({ cameraLooksAtRoutes = true, dominantHost = false } = {}) {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  playerRoot.position.set(0.1, -0.15, -1.25);
  scene.add(playerRoot);
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 100);
  camera.position.set(0.25, 1.6, 7.2);
  camera.lookAt(cameraLooksAtRoutes ? new THREE.Vector3(0.1, 0, -2.8) : new THREE.Vector3(0, 1.6, 20));
  scene.add(camera);

  let host = null;
  if (dominantHost) {
    host = new THREE.Mesh(
      new THREE.SphereGeometry(4.8, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.2 })
    );
    host.name = "host_alpha_distant_silhouette_001";
    host.position.set(0, 0, -3.4);
    scene.add(host);
  }
  return { scene, playerRoot, camera, host };
}

function tickFoundation(foundation, frameState, count) {
  for (let index = 0; index < count; index += 1) {
    frameState.frame += 1;
    frameState.runtimeSeconds += 1 / 60;
    foundation.update(1 / 60, frameState);
  }
}

// A dominant distant Host blocks the latch despite valid world coordinates.
const dominant = createHubScene({ dominantHost: true });
const dominantFrame = createHubFrame(dominant.playerRoot);
const dominantFoundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene: dominant.scene,
  camera: dominant.camera,
  playerRoot: dominant.playerRoot,
  frameState: dominantFrame
});
dominantFoundation.init();
tickFoundation(dominantFoundation, dominantFrame, 90);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.distantHostProjectionMeasured, true);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.distantHostProjectedDominance, true);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.screenTruthLatched, false);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.verified, false);

// Reframe the same Host as distant background anatomy; sustained valid screen
// samples then make the pre-existing physical Hub eligible to lock.
dominant.host.position.set(-12, 8, -40);
dominant.host.scale.setScalar(0.18);
dominant.host.updateMatrixWorld(true);
tickFoundation(dominantFoundation, dominantFrame, 180);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.distantHostProjectedDominance, false);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.screenRoutesReadable, true);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.screenTruthLatched, true);
assert.equal(dominantFrame.hubRenderTruth.spatialTruth.verified, true);
assert.equal(dominantFrame.hubChamberFoundation.threeRouteLayoutReadable, true);

// A live camera aimed away from the same separated world geometry cannot pass
// merely because the reveal timer elapsed.
const collapsed = createHubScene({ cameraLooksAtRoutes: false });
const collapsedFrame = createHubFrame(collapsed.playerRoot);
const collapsedFoundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene: collapsed.scene,
  camera: collapsed.camera,
  playerRoot: collapsed.playerRoot,
  frameState: collapsedFrame
});
collapsedFoundation.init();
tickFoundation(collapsedFoundation, collapsedFrame, 240);
assert.ok(collapsedFrame.hubRenderTruth.spatialTruth.minimumRouteSeparation >= 4.6);
assert.equal(collapsedFrame.hubRenderTruth.spatialTruth.allRouteCentersInView, false);
assert.equal(collapsedFrame.hubRenderTruth.spatialTruth.screenTruthLatched, false);
assert.equal(collapsedFrame.hubRenderTruth.spatialTruth.verified, false);
assert.equal(collapsedFrame.hubChamberFoundation.threeRouteLayoutReadable, false);

// Explicit runtime unmount must release the stale Hub state that triggered the
// live screenshot failure.
dominantFrame.activeCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
dominantFrame.promptStack.activePresentationOwner = "HubChamberFoundationSystem";
dominantFoundation.onRuntimeUnmount(dominantFrame);
assert.equal(dominantFrame.hubChamberFoundation.active, false);
assert.equal(dominantFrame.hubPresentationOwnership.active, false);
assert.equal(dominantFrame.hubPresentationOwnership.owner, "none");
assert.equal(dominantFrame.promptStack.activePresentationOwner, "none");

const guideSource = readText("src/guide/GuidePromptSystem.js");
const hubSource = readText("src/hub/HubChamberFoundationSystem.js");
const diagnosticSource = readText("src/debug/RuntimeDiagnosticSummary.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
assert.ok(guideSource.includes("activeRegionOverridesRetainedGuidance") || guideSource.includes("beginRegionPromptCycle"));
assert.ok(guideSource.includes("GUIDE_PROMPT_GRAVE_MEMORY_ROUTE_HC010C"));
assert.ok(hubSource.includes("projectObjectCollectionBounds"));
assert.ok(hubSource.includes("distantHostProjectedDominance"));
assert.ok(diagnosticSource.includes("REGION_FLOW_PRIORITY"));
assert.ok(hudSource.includes("inGraveMemory"));

console.log("HC-010C Grave Ownership + Screen-Truth Lock validation passed.");
