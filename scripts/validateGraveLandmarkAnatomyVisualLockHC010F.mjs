import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { PlaceholderValidator } from "../src/visual/PlaceholderValidator.js";
import { VisualComposer } from "../src/visual/VisualComposer.js";
import { ChemObjectSystem } from "../src/chemistry/ChemObjectSystem.js";
import { GraveMemoryRouteSystem } from "../src/routes/GraveMemoryRouteSystem.js";
import { ChemistryDebugPanel } from "../src/debug/ChemistryDebugPanel.js";
import { RecipeDebugOverlay } from "../src/debug/RecipeDebugOverlay.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const supportedBuilds = new Map([
  ["HC-010F", { version: "0.0.122", profile: "act1RuntimeProfile_HC010F.json" }],
  ["HC-010G", { version: "0.0.123", profile: "act1RuntimeProfile_HC010G.json" }],
  ["HC-011A", { version: "0.0.124", profile: "act1RuntimeProfile_HC011A.json" }],
  ["HC-011A1", { version: "0.0.125", profile: "act1RuntimeProfile_HC011A1.json" }],
  ["HC-011B", { version: "0.0.126", profile: "act1RuntimeProfile_HC011B.json" }],
  ["HC-012A", { version: "0.0.127", profile: "act1RuntimeProfile_HC012A.json" }],
  ["HC-012B", { version: "0.0.128", profile: "act1RuntimeProfile_HC012B.json" }],
  ["HC-012C", { version: "0.0.129", profile: "act1RuntimeProfile_HC012C.json" }],
  ["HC-013A", { version: "0.0.130", profile: "act1RuntimeProfile_HC013A.json" }],
  ["HC-013B", { version: "0.0.131", profile: "act1RuntimeProfile_HC013B.json" }],
  ["HC-013C", { version: "0.0.132", profile: "act1RuntimeProfile_HC013C.json" }],
  ["HC-013D", { version: "0.0.133", profile: "act1RuntimeProfile_HC013D.json" }],
  ["HC-014A", { version: "0.0.134", profile: "act1RuntimeProfile_HC014A.json" }],
  ["HC-014B", { version: "0.0.135", profile: "act1RuntimeProfile_HC014B.json" }],
  ["HC-014D", { version: "0.0.137", profile: "act1RuntimeProfile_HC014D.json", profileId: "ACT1_RUNTIME_PROFILE_HC014D" }],
  ["HC-014C", { version: "0.0.136", profile: "act1RuntimeProfile_HC014C.json" }],
  ["HC-014G", { version: "0.0.140", profile: "act1RuntimeProfile_HC014G.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }],
  ["HC-014I", { version: "0.0.142", profile: "act1RuntimeProfile_HC014I.json", profileId: "ACT1_RUNTIME_PROFILE_HC014G" }]
]);
const build = supportedBuilds.get(manifest.id);
assert(build, `HC-010F landmark proof does not recognize successor ${manifest.id}.`);
const profile = readJson(`public/data/runtime/${build.profile}`);
const predecessor = readJson("public/data/runtime/act1RuntimeProfile_HC010E.json");
const routeRecipe = readJson("public/data/routes/graveMemoryRouteCircuit_HC010B.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const graveCell = localCells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");

const landmarkIds = [
  "old_core_husk_memory_001",
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const visualRecipeIds = [
  "old_core_husk_memory_v01",
  "residue_silt_cloud_v01",
  "scar_lock_plate_v01",
  "inheritance_seed_remnant_v01"
];
const placeholderIds = [
  "debug_old_core_husk_memory_001",
  "debug_residue_silt_cloud_001",
  "debug_scar_lock_plate_001",
  "debug_inheritance_seed_remnant_001"
];

assert(graveCell, "The Grave Memory runtime cell is missing.");
assert.equal(manifest.version, build.version);
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, build.profileId ?? `ACT1_RUNTIME_PROFILE_${manifest.id.replace("-", "")}`);
assert.equal(profile.pass, manifest.id);
assert.deepEqual(profile.globalSystemIds, predecessor.globalSystemIds);
assert.deepEqual(profile.sharedSystemIds, predecessor.sharedSystemIds);
assert.deepEqual(profile.dormantCompatibilitySystemIds, predecessor.dormantCompatibilitySystemIds);
assert.equal(profile.globalSystemIds.length, 15);
assert.equal(profile.sharedSystemIds.length, 6);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);
assert.deepEqual(
  profile.firstSlicePath.map((regionId) => profile.regions[regionId].activeUpdateBudget),
  [15, 13, 8]
);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.deepEqual(profile.regions.grave_memory_route.systemIds, ["graveMemoryRouteSystem"]);

const contract = profile.graveLandmarkVisualLock;
assert.equal(contract.pass, "HC-010F");
assert.equal(contract.geometryOwner, "ChemObjectVisualComposer");
assert.equal(contract.motionOwner, "GraveMemoryRouteSystem");
assert.deepEqual(contract.landmarkIds, landmarkIds);
assert.deepEqual(contract.replacementRecipeIds, visualRecipeIds);
assert.deepEqual(contract.retiredPlaceholderIds, placeholderIds);
assert.equal(contract.distinctSilhouetteCount, 4);
assert.equal(contract.distinctMotionLanguageCount, 4);
assert.equal(contract.pulseResponseVisible, true);
assert.equal(contract.stabilizeResponseVisible, true);
assert.equal(contract.riskResponseVisible, true);
assert.equal(contract.idleObjectDefiningRings, false);
assert.equal(contract.interactionRangesChanged, false);
assert.equal(contract.objectPositionsChanged, false);
assert.equal(contract.newRegisteredSystemCount, 0);
assert.equal(contract.newAbilityUnlocks, 0);
assert.equal(contract.newRouteContent, false);
assert.equal(contract.mutatesProgression, false);

// Landmark convergence may not quietly widen the already live interaction or
// movement contract.
assert.equal(routeRecipe.interaction.pulseRange, 2.2);
assert.equal(routeRecipe.interaction.stabilizeRange, 1.8);
assert.equal(routeRecipe.interaction.safeTransferRange, 1.8);
assert.deepEqual(routeRecipe.interaction.requiredReadObjects, landmarkIds);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return readJson(path.join("public", relative));
};
await recipeDataSystem.loadAll();

const placeholderValidator = new PlaceholderValidator({
  recipeDataSystem,
  currentPass: manifest.id
});
placeholderValidator.validateAll();
const placeholderReport = placeholderValidator.getStatusReport();
for (const placeholderId of placeholderIds) {
  const source = recipeDataSystem.get("placeholderReplacementRecipes", placeholderId);
  const reportItem = placeholderReport.items.find((entry) => entry.id === placeholderId);
  assert.equal(source.placeholder.active, false, `${placeholderId} remained active.`);
  assert.equal(source.placeholder.severityAfterExpiration, "resolved");
  assert.equal(source.replacement.requiredBeforeLock, false);
  assert.equal(source.visualLock.status, "replaced_by_recipe_composition");
  assert.equal(source.visualLock.pass, "HC-010F");
  assert.equal(reportItem?.status, "inactive");
  assert.equal(reportItem?.active, false);
}
for (const visualRecipeId of visualRecipeIds) {
  const recipe = recipeDataSystem.get("visualCompositionRecipes", visualRecipeId);
  assert.equal(recipe.visualLock.status, "p0_locked_recipe_composition");
  assert.equal(recipe.visualLock.pass, "HC-010F");
  assert.equal(recipe.recipePack.status, "runtime_visual_locked");
  assert.equal(recipe.recipePack.pass, "HC-010F");
  assert(recipe.visualLock.mustReadAs.length >= 3);
  assert(recipe.visualLock.mustNotReadAs.length >= 3);
}

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
playerRoot.position.set(0.12, 0.2, -4.4);
scene.add(playerRoot);

const visualComposer = new VisualComposer({
  scene,
  visualRecipeRegistry: recipeDataSystem.data.visualCompositionRecipes,
  placeholderValidator
});
const frameState = {
  buildId: manifest.id,
  buildLabel: manifest.label,
  buildManifest: manifest,
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: graveCell.id,
  activeHostId: "HOST_ALPHA_WOUNDED_NURSERY",
  currentMode: {
    id: "memory_route_mode",
    regionId: "grave_memory_route",
    regionDisplayName: "Grave Memory",
    sceneBehaviorOwner: "GraveMemoryRouteSystem"
  },
  firstSliceRuntimeMount: {
    profileId: profile.id,
    activeRegionId: "grave_memory_route",
    activeSystemIds: [...profile.sharedSystemIds, "graveMemoryRouteSystem"],
    activeSystemCount: 7,
    activeUpdateBudget: 7,
    dormantCompatibilitySystemIds: [...profile.dormantCompatibilitySystemIds]
  },
  runtimeExecution: {
    executedSystemIds: ["graveMemoryRouteSystem"],
    executedSystemCount: 7,
    updateSystemCount: 7,
    registeredSystemCount: profile.globalSystemIds.length + profile.sharedSystemIds.length + 4,
    dormantCompatibilityRegisteredCount: 0
  },
  compatibilityArchive: {
    dormantSystemCount: 20,
    status: "archived_unregistered"
  },
  physicalFeel: {
    viscosity: 0.4,
    pressure: 0.2,
    flowVector: { x: 0, y: 0, z: -0.1 },
    boundaryBehavior: "hub_junction"
  },
  input: {
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false,
    interactPressed: false,
    interactEventId: 0,
    boostHeld: false
  },
  inputSource: { activeDevice: "keyboard" },
  playerComposition: { form: 0.42, flux: 0.18, scar: 0.08, seed: 0.4, signal: 0.16 },
  playerKinematics: {
    position: { x: playerRoot.position.x, y: playerRoot.position.y, z: playerRoot.position.z },
    velocity: { x: 0, y: 0, z: 0 },
    flowVector: { x: 0.02, y: -0.06, z: -0.1 },
    speed: 0,
    pressure: 0.5,
    viscosity: 0.64,
    boundaryPressure: 0,
    movementReference: "camera_relative_embodied_free_3d"
  },
  pulse: { active: false },
  promptStack: {},
  interactionInspectionFocus: {},
  targetFocus: { suppressTargeting: true },
  targeting: { targetId: "none" },
  objectiveState: {},
  gateState: {},
  nonFatalSystemErrors: [],
  debugDisplay: { mode: "full" }
};

const chemObjectSystem = new ChemObjectSystem({
  recipeDataSystem,
  visualComposer,
  playerRoot,
  localCellRecipe: graveCell,
  frameState
});
const routeSystem = new GraveMemoryRouteSystem({
  recipeDataSystem,
  chemObjectSystem,
  scene,
  playerRoot,
  frameState
});
routeSystem.init();
routeSystem.onRuntimeMount(frameState);

assert.equal(routeSystem.objectItems.size, 4);
assert.equal(frameState.graveMemoryRoute.landmarkVisualLockComplete, true);
assert.equal(frameState.graveMemoryRoute.landmarkVisualCount, 4);
assert.equal(frameState.graveMemoryRoute.expiredGraveLandmarkPlaceholdersActive, 0);
assert.equal(frameState.graveMemoryRoute.landmarkGeometryOwner, "ChemObjectVisualComposer");
assert.equal(frameState.graveMemoryRoute.landmarkMotionOwner, "GraveMemoryRouteSystem");
assert.equal(new Set(frameState.graveMemoryRoute.landmarkVisualRoles.map((entry) => entry.role)).size, 4);
assert.equal(new Set(frameState.graveMemoryRoute.landmarkVisualRoles.map((entry) => entry.silhouette)).size, 4);
assert.equal(new Set(frameState.graveMemoryRoute.landmarkVisualRoles.map((entry) => entry.motion)).size, 4);

const partsFor = (id, role) => routeSystem.landmarkVisuals.get(id)?.parts.get(role) ?? [];
const countParts = (id, role, expected) => {
  assert.equal(partsFor(id, role).length, expected, `${id}/${role} part count drifted.`);
};
countParts("old_core_husk_memory_001", "husk_shell_lobe", 3);
countParts("old_core_husk_memory_001", "husk_torn_plate", 5);
countParts("old_core_husk_memory_001", "husk_scar_crack", 7);
countParts("old_core_husk_memory_001", "husk_memory_echo", 1);
countParts("old_core_husk_memory_001", "husk_transient_warning_halo", 1);
countParts("residue_silt_cloud_001", "silt_cloud_lobe", 6);
countParts("residue_silt_cloud_001", "silt_ash_mote", 22);
countParts("residue_silt_cloud_001", "silt_threaded_void", 5);
countParts("residue_silt_cloud_001", "silt_signal_thread", 9);
countParts("residue_silt_cloud_001", "silt_memory_echo", 1);
countParts("scar_lock_plate_001", "scar_guard_plate", 5);
countParts("scar_lock_plate_001", "scar_guard_rib", 3);
countParts("scar_lock_plate_001", "scar_delayed_crack", 7);
countParts("scar_lock_plate_001", "scar_recoil_tooth", 6);
countParts("inheritance_seed_remnant_001", "seed_residue_nest_petal", 5);
countParts("inheritance_seed_remnant_001", "seed_dim_core", 1);
countParts("inheritance_seed_remnant_001", "seed_gray_memory_skin", 3);
countParts("inheritance_seed_remnant_001", "seed_root_filament", 5);
countParts("inheritance_seed_remnant_001", "seed_future_glow", 1);

// Exactly the four route landmarks are now recipe-composed locked visuals, and
// none relies on a permanent object-defining ring.
for (const id of landmarkIds) {
  const item = routeSystem.objectItems.get(id);
  const entry = routeRecipe.objects.find((candidate) => candidate.id === id);
  assert(item, `Missing live landmark ${id}.`);
  assert.equal(item.root.userData.placeholder, false);
  assert.equal(item.root.userData.visualLockStatus, "replaced_by_recipe_composition");
  assert.equal(item.root.userData.graveLandmarkVisualLock, "HC-010F");
  assert.equal(item.root.userData.graveLandmarkMotionPass, "HC-010F");
  assert.equal(item.root.userData.idleObjectDefiningRing, false);
  const relativePosition = item.root.position.clone().sub(routeSystem.entryAnchor);
  assert(relativePosition.distanceTo(new THREE.Vector3().fromArray(entry.position)) < 1e-6);
  item.root.traverse((child) => {
    if (!child.userData?.graveLandmarkPart) return;
    assert.equal(child.userData.objectDefiningRing, false);
  });
}

const sizeOf = (id) => new THREE.Box3()
  .setFromObject(routeSystem.objectItems.get(id).root)
  .getSize(new THREE.Vector3());
const huskSize = sizeOf("old_core_husk_memory_001");
const siltSize = sizeOf("residue_silt_cloud_001");
const scarSize = sizeOf("scar_lock_plate_001");
const seedSize = sizeOf("inheritance_seed_remnant_001");
assert(huskSize.x > huskSize.y * 1.45, "Husk did not remain visibly collapsed.");
assert(siltSize.x > siltSize.y * 1.35, "Silt did not form a wide settling cloud.");
assert(scarSize.x > scarSize.y * 1.8, "Scar did not form a low guarding plate.");
assert(seedSize.y > seedSize.x * 0.9, "Inheritance seed did not retain an upright silhouette.");

const tickRoute = (dt = 0.1) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  routeSystem.update(dt, frameState);
};
let pulseSequence = 0;
const moveTo = (id) => {
  const item = routeSystem.objectItems.get(id);
  playerRoot.position.copy(item.root.position);
  frameState.playerKinematics.position = {
    x: playerRoot.position.x,
    y: playerRoot.position.y,
    z: playerRoot.position.z
  };
};
const pulseObject = (id) => {
  moveTo(id);
  pulseSequence += 1;
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId = pulseSequence;
  tickRoute();
  frameState.input.pulsePressed = false;
};

assert.equal(partsFor("old_core_husk_memory_001", "husk_memory_echo")[0].visible, false);
assert.equal(partsFor("residue_silt_cloud_001", "silt_memory_echo")[0].visible, false);
assert.equal(partsFor("old_core_husk_memory_001", "husk_transient_warning_halo")[0].visible, false);
assert(partsFor("scar_lock_plate_001", "scar_recoil_tooth").every((part) => !part.visible));

pulseObject("old_core_husk_memory_001");
assert.equal(partsFor("old_core_husk_memory_001", "husk_memory_echo")[0].visible, true);
assert.equal(partsFor("old_core_husk_memory_001", "husk_transient_warning_halo")[0].visible, true);

pulseObject("residue_silt_cloud_001");
assert.equal(partsFor("residue_silt_cloud_001", "silt_memory_echo")[0].visible, true);
const signalThreads = partsFor("residue_silt_cloud_001", "silt_signal_thread");
const unsettledRotations = signalThreads.map((part) => part.rotation.z);
frameState.input.stabilizeHeld = true;
let stabilizeGuard = 0;
while (!routeSystem.siltStabilized && stabilizeGuard < 40) {
  tickRoute();
  stabilizeGuard += 1;
}
assert(stabilizeGuard < 40, "Silt never stabilized.");
frameState.input.stabilizeHeld = false;
tickRoute();
assert(signalThreads.some((part, index) => Math.abs(part.rotation.z - unsettledRotations[index]) > 0.12));
assert(partsFor("residue_silt_cloud_001", "silt_ash_mote").some((part) => {
  const base = part.userData.graveLandmarkBasePosition;
  return base && Math.abs(part.position.y - base.y) > 0.08;
}));

const scarCracks = partsFor("scar_lock_plate_001", "scar_delayed_crack");
const scarIdleOpacity = Math.max(...scarCracks.map((part) => part.material.opacity));
pulseObject("scar_lock_plate_001");
tickRoute(0.18);
assert(Math.max(...scarCracks.map((part) => part.material.opacity)) > scarIdleOpacity + 0.08);

pulseObject("inheritance_seed_remnant_001");
assert(partsFor("inheritance_seed_remnant_001", "seed_dim_core")[0].material.emissiveIntensity > 0.8);
assert.equal(frameState.graveMemoryRoute.readCount, 4);
assert.equal(frameState.graveMemoryRoute.completed, false);

// A greedy action must harden the scar anatomy, while consuming nothing and
// leaving the inherited HC-010B consequence circuit in charge.
moveTo("scar_lock_plate_001");
frameState.input.absorbHeld = true;
tickRoute();
frameState.input.absorbHeld = false;
tickRoute();
assert(frameState.graveMemoryRoute.residueRecoilRisk > 0.18);
assert(partsFor("scar_lock_plate_001", "scar_recoil_tooth").every((part) => part.visible));
assert(partsFor("scar_lock_plate_001", "scar_recoil_tooth").every((part) => part.scale.length() > 0.1));
assert.equal(frameState.graveMemoryRoute.protectedObjectsUntouched, true);
assert.equal(frameState.graveMemoryRoute.completed, false);
assert.equal(frameState.graveMemoryRoute.directObjectiveMutation, false);
assert.equal(frameState.graveMemoryRoute.directGateMutation, false);
assert.equal(frameState.graveMemoryRoute.directCellMutation, false);
assert.equal(frameState.graveMemoryRoute.newAbilityUnlocks, 0);
assert.equal(frameState.graveMemoryRoute.newRouteBranch, false);
assert.equal(frameState.graveMemoryRoute.oldCompatibilitySystemsActivated, false);

const chemistryPanelText = new ChemistryDebugPanel({ frameState }).fullText();
const recipeOverlayText = new RecipeDebugOverlay({ frameState }).fullText();
for (const text of [chemistryPanelText, recipeOverlayText]) {
  assert.match(text, /Grave landmarks:LOCKED 4\/4 expired:0/);
  assert.match(text, /GraveMemoryRouteSystem/);
}
assert.equal(frameState.nonFatalSystemErrors.length, 0);

console.log("HC-010F Grave Landmark Anatomy + Visual Lock validation passed.");
console.log(JSON.stringify({
  build: manifest.id,
  version: manifest.version,
  budgets: [15, 13, 8, 7],
  dormantCompatibilitySystems: profile.dormantCompatibilitySystemIds.length,
  retiredPlaceholders: placeholderIds.length,
  roles: frameState.graveMemoryRoute.landmarkVisualRoles.map((entry) => entry.role),
  parts: Object.fromEntries(
    landmarkIds.map((id) => [id, routeSystem.objectItems.get(id).root.userData.graveLandmarkPartCount])
  ),
  measuredSilhouettes: {
    husk: huskSize.toArray(),
    silt: siltSize.toArray(),
    scar: scarSize.toArray(),
    seed: seedSize.toArray()
  },
  pulseResponse: "husk_and_silt_memory_echoes_visible",
  stabilizeResponse: "silt_threads_align_while_ash_continues_settling",
  riskResponse: "scar_recoil_teeth_visible_without_consumption"
}, null, 2));
