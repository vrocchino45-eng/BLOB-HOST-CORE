import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";
import { GraveMemoryRouteSystem } from "../src/routes/GraveMemoryRouteSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const supportedBuilds = new Map([
  ["HC-010D", { version: "0.0.120", profile: "act1RuntimeProfile_HC010D.json" }],
  ["HC-010E", { version: "0.0.121", profile: "act1RuntimeProfile_HC010E.json" }],
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
assert(build, `HC-010D boundary proof does not recognize successor ${manifest.id}.`);
const profile = readJson(`public/data/runtime/${build.profile}`);
const routeRecipe = readJson("public/data/routes/graveMemoryRouteCircuit_HC010B.json");
const hubRecipe = readJson("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const localCells = readJson("public/data/world/localCellRecipes.json");
const graveCell = localCells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
const graveGate = hubRecipe.routes.find((entry) => entry.id === "grave_memory_route");

assert.equal(manifest.version, build.version);
assert.equal(pkg.version, manifest.version);
assert.equal(profile.id, build.profileId ?? `ACT1_RUNTIME_PROFILE_${manifest.id.replace("-", "")}`);
assert.equal(profile.pass, manifest.id);
assert.equal(profile.movementBoundaryRepair.pass, "HC-010D");
assert.equal(profile.movementBoundaryRepair.collisionOwner, "PlayerMovementController");
assert.equal(profile.movementBoundaryRepair.regionTuningOwner, "GraveMemoryRouteSystem");
assert.equal(profile.movementBoundaryRepair.newRegisteredSystemCount, 0);
assert.equal(profile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.deepEqual(profile.regions.grave_memory_route.systemIds, ["graveMemoryRouteSystem"]);
assert.equal(profile.dormantCompatibilitySystemIds.length, 20);

assert.deepEqual(graveGate.position, [0.12, 0.2, -4.4]);
assert.equal(routeRecipe.movementBounds.mode, "entry_anchored_ellipsoid");
assert.equal(routeRecipe.movementBounds.centerSource, "preserved_gate_entry_position");
assert.equal(routeRecipe.movementBounds.collisionOwner, "PlayerMovementController");
assert.equal(routeRecipe.movementBounds.tuningOwner, "GraveMemoryRouteSystem");
assert.equal(routeRecipe.movementBounds.restoresPriorBoundaryOnExit, true);
assert.deepEqual(routeRecipe.movementBounds.radii, [4.25, 3.1, 6.8]);

// The live issue must be repaired through movement volume, not hidden by
// enlarging the interaction verbs.
assert.equal(routeRecipe.interaction.pulseRange, 2.2);
assert.equal(routeRecipe.interaction.stabilizeRange, 1.8);
assert.equal(routeRecipe.interaction.safeTransferRange, 1.8);

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
playerRoot.position.fromArray(graveGate.position);
scene.add(playerRoot);

const camera = new THREE.PerspectiveCamera(57, 16 / 9, 0.1, 100);
scene.add(camera);

const fakeChemObjectSystem = {
  objects: [],
  spawnCellObjects(cellRecipe) {
    return cellRecipe.contents.chemObjects.map((id) => {
      const rootObject = new THREE.Group();
      rootObject.name = id;
      rootObject.userData = { objectId: id, absorbed: false };
      rootObject.scale.setScalar(1);
      scene.add(rootObject);
      const item = {
        root: rootObject,
        recipe: { id },
        absorbed: false,
        cellId: cellRecipe.id
      };
      this.objects.push(item);
      return item;
    });
  },
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.testOpacity = opacity;
  }
};

const hubPhysicalFeel = {
  viscosity: 0.42,
  pressure: 0.24,
  flowVector: { x: 0, y: 0, z: 0 },
  boundaryBehavior: "hub_junction"
};

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: graveCell.id,
  currentMode: { id: "memory_route_mode", regionId: "grave_memory_route" },
  physicalFeel: { ...hubPhysicalFeel, flowVector: { ...hubPhysicalFeel.flowVector } },
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
  controllerOnboarding: {
    tuning: {
      movement: {
        verticalScale: 0.8,
        boostMultiplier: 1.75,
        baseAcceleration: 10.8,
        dragBase: 2.15,
        dragViscosityMultiplier: 4.1,
        flowPressureMultiplier: 0.75,
        speedLimit: 3.75,
        movementFeel: "embodied_viscous_current_swim"
      }
    }
  },
  inputSource: {},
  playerComposition: { form: 0.42, flux: 0.18, scar: 0.08, seed: 0.4, signal: 0.16 },
  coreGrowth: {
    stageId: "binding_core",
    biasLabel: "balanced_first_binding",
    movementModifiers: {
      accelerationMultiplier: 1,
      dragMultiplier: 1,
      flowCouplingMultiplier: 1,
      pressureResponseMultiplier: 1,
      stabilizeEfficiencyMultiplier: 1
    }
  },
  pulse: { active: false },
  promptStack: {},
  interactionInspectionFocus: {},
  targetFocus: { suppressTargeting: true },
  targeting: { targetId: "none" }
};

const routeSystem = new GraveMemoryRouteSystem({
  recipeDataSystem,
  chemObjectSystem: fakeChemObjectSystem,
  scene,
  playerRoot,
  frameState
});
routeSystem.init();

const movementController = new PlayerMovementController({
  playerRoot,
  camera,
  frameState,
  localCellRecipe: graveCell
});

const entryPosition = playerRoot.position.clone();
routeSystem.onRuntimeMount(frameState);
assert(playerRoot.position.equals(entryPosition), "Grave mount must preserve the Hub gate position.");
assert.deepEqual(frameState.physicalFeel.movementBounds.center, {
  x: entryPosition.x,
  y: entryPosition.y,
  z: entryPosition.z
});

movementController.update(0, frameState);
assert.equal(frameState.playerKinematics.movementBoundary.regionLocal, true);
assert.equal(frameState.playerKinematics.movementBoundary.owner, "PlayerMovementController");
assert.equal(frameState.playerKinematics.movementBoundary.tuningOwner, "GraveMemoryRouteSystem");
assert.deepEqual(frameState.playerKinematics.movementBoundary.radii, {
  x: 4.25,
  y: 3.1,
  z: 6.8
});

const legacyBoundary = { x: 6.4, y: 3.45, z: 4.8 };
const firstHusk = routeSystem.objectItems.get("old_core_husk_memory_001").root.position;
const legacyHuskDistance = Math.sqrt(
  (firstHusk.x / legacyBoundary.x) ** 2
  + (firstHusk.y / legacyBoundary.y) ** 2
  + (firstHusk.z / legacyBoundary.z) ** 2
);
assert(
  legacyHuskDistance > 1,
  "The adversarial setup must reproduce the old world-origin boundary placing the first husk outside the playable volume."
);

for (const entry of routeRecipe.objects) {
  const item = routeSystem.objectItems.get(entry.id);
  const local = item.root.position.clone().sub(entryPosition);
  const [radiusX, radiusY, radiusZ] = routeRecipe.movementBounds.radii;
  const normalized = Math.sqrt(
    (local.x / radiusX) ** 2
    + (local.y / radiusY) ** 2
    + (local.z / radiusZ) ** 2
  );
  assert(normalized < 1, `${entry.id} must lie inside the entry-anchored playable volume.`);
}

const approachResults = [];
let pulseSequence = 0;

function tick(dt = 1 / 60) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  routeSystem.update(dt, frameState);
  movementController.update(dt, frameState);
}

function moveNaturallyWithinRange(id, interactionRange) {
  const target = routeSystem.objectItems.get(id).root.position;
  const desiredDistance = Math.min(0.72, interactionRange * 0.4);
  let frames = 0;
  let maxFrameDisplacement = 0;

  while (playerRoot.position.distanceTo(target) > desiredDistance && frames < 900) {
    const before = playerRoot.position.clone();
    camera.position.copy(playerRoot.position);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    frameState.input.moveX = 0;
    frameState.input.moveY = 0;
    frameState.input.moveZ = -1;
    tick();
    maxFrameDisplacement = Math.max(maxFrameDisplacement, playerRoot.position.distanceTo(before));
    frames += 1;
  }

  frameState.input.moveZ = 0;
  tick();
  const distance = playerRoot.position.distanceTo(target);
  assert(frames < 900, `${id} was not naturally reachable before the simulation timeout.`);
  assert(distance <= interactionRange, `${id} remained outside its unchanged interaction range.`);
  assert(maxFrameDisplacement < 0.18, `${id} approach used a teleport-sized movement step.`);

  pulseSequence += 1;
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId = pulseSequence;
  tick();
  frameState.input.pulsePressed = false;
  tick();
  assert(routeSystem.readObjects.has(id), `${id} was reachable but did not receive its Pulse read.`);

  approachResults.push({ id, frames, distance, maxFrameDisplacement });
}

for (const entry of routeRecipe.objects) {
  moveNaturallyWithinRange(entry.id, routeRecipe.interaction.pulseRange);
}

assert.equal(routeSystem.readObjects.size, 4);
assert.equal(frameState.graveMemoryRoute.readCount, 4);
assert.equal(frameState.graveMemoryRoute.forcedRelocation, false);
assert.equal(frameState.graveMemoryRoute.movementBoundaryRegionLocal, true);
assert.equal(frameState.graveMemoryRoute.movementBoundaryOwner, "PlayerMovementController");

// The route returns the player to its entry fold before GateSystem changes the
// cell. Positioning the simulation there models that earned traversal, not a
// runtime relocation performed by the route system.
playerRoot.position.copy(routeSystem.returnPosition);
frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frameState.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
routeSystem.onRuntimeUnmount(frameState);
assert.equal(frameState.physicalFeel.boundaryBehavior, hubPhysicalFeel.boundaryBehavior);
assert.equal(frameState.physicalFeel.movementBounds, undefined);
movementController.update(0, frameState);
assert.equal(frameState.playerKinematics.movementBoundary.regionLocal, false);
assert.deepEqual(frameState.playerKinematics.movementBoundary.center, { x: 0, y: 0, z: 0 });
assert.deepEqual(frameState.playerKinematics.movementBoundary.radii, legacyBoundary);

console.log("HC-010D Grave Approach Boundary Repair validation passed.");
for (const result of approachResults) {
  console.log(
    `  ${result.id}: ${result.distance.toFixed(3)} from center after ${result.frames} movement frames; max step ${result.maxFrameDisplacement.toFixed(3)}`
  );
}
