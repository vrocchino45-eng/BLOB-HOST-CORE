import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GraveMemoryRouteSystem } from "../src/routes/GraveMemoryRouteSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relative) => JSON.parse(
  fs.readFileSync(path.join(root, relative), "utf8")
);

const routeRecipe = readJson("public/data/routes/graveMemoryRoutePreview_HC010A.json");
const runtimeProfile = readJson("public/data/runtime/act1RuntimeProfile_HC010A.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const graveCell = localCells.find((entry) => entry.id === "CELL_GRAVE_MEMORY_RESIDUE_BED_001");

assert.equal(routeRecipe.id, "GRAVE_MEMORY_ROUTE_PREVIEW_HC010A");
assert.equal(routeRecipe.constraints.archivedCompatibilitySystemsActivated, 0);
assert.equal(routeRecipe.constraints.protectedRemainsConsumable, false);
assert.equal(runtimeProfile.id, "ACT1_RUNTIME_PROFILE_HC010A");
assert.deepEqual(runtimeProfile.firstSlicePath, [
  "surface_wake",
  "guide_threshold",
  "hub_chamber"
]);
assert.deepEqual(runtimeProfile.act1PreviewPath, [
  "surface_wake",
  "guide_threshold",
  "hub_chamber",
  "grave_memory_route"
]);
assert.equal(runtimeProfile.regions.surface_wake.activeUpdateBudget, 15);
assert.equal(runtimeProfile.regions.guide_threshold.activeUpdateBudget, 13);
assert.equal(runtimeProfile.regions.hub_chamber.activeUpdateBudget, 8);
assert.equal(runtimeProfile.regions.grave_memory_route.activeUpdateBudget, 7);
assert.deepEqual(runtimeProfile.regions.grave_memory_route.systemIds, [
  "graveMemoryRouteSystem"
]);
assert.equal(runtimeProfile.dormantCompatibilitySystemIds.length, 20);
assert(!runtimeProfile.dormantCompatibilitySystemIds.includes("graveMemoryRouteSystem"));
for (const mount of Object.values(runtimeProfile.regions)) {
  for (const id of mount.systemIds) {
    assert(!runtimeProfile.dormantCompatibilitySystemIds.includes(id));
  }
}

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.2, 0.1, -4.2);
scene.add(playerRoot);
const objectItems = new Map();

const fakeChemObjectSystem = {
  spawnCellObjects(cellRecipe) {
    return cellRecipe.contents.chemObjects.map((id) => {
      const root = new THREE.Group();
      root.name = id;
      root.userData = {
        objectId: id,
        absorbed: false
      };
      root.scale.setScalar(1);
      scene.add(root);
      const item = {
        root,
        recipe: { id },
        absorbed: false,
        cellId: cellRecipe.id
      };
      objectItems.set(id, item);
      return item;
    });
  },
  setObjectOpacity(root, opacity) {
    root.userData.testOpacity = opacity;
  }
};

const fakeRecipeData = {
  data: {
    graveMemoryRoutePreview: routeRecipe
  },
  get(category, id) {
    if (category === "localCellRecipes" && id === graveCell.id) return graveCell;
    throw new Error(`Unexpected recipe request ${category}:${id}`);
  }
};

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  physicalFeel: {
    viscosity: 0.4,
    pressure: 0.2,
    flowVector: { x: 0, y: 0, z: -0.1 },
    boundaryBehavior: "hub_junction"
  },
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false,
    interactPressed: false,
    interactEventId: 0
  }
};

const routeSystem = new GraveMemoryRouteSystem({
  recipeDataSystem: fakeRecipeData,
  chemObjectSystem: fakeChemObjectSystem,
  scene,
  playerRoot,
  frameState
});

routeSystem.init();
assert.equal(routeSystem.root.visible, false);
assert.equal(frameState.graveMemoryRoute.active, false);
assert.equal(frameState.graveMemoryRoute.oldCompatibilitySystemsActivated, false);

const entryPosition = playerRoot.position.clone();
frameState.activeCellId = graveCell.id;
routeSystem.onRuntimeMount(frameState);
assert.equal(routeSystem.root.visible, true);
assert(playerRoot.position.equals(entryPosition), "Route mount must not relocate the player.");
assert.equal(frameState.graveMemoryRoute.presentationOwner, "GraveMemoryRouteSystem");
assert.equal(frameState.graveMemoryRoute.crossingOwner, "GateSystem");
assert.equal(frameState.graveMemoryRoute.directCellMutation, false);

let pulseSequence = 0;
const tick = (dt = 0.05) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  routeSystem.update(dt, frameState);
};
const pulseObject = (id) => {
  const item = routeSystem.objectItems.get(id);
  playerRoot.position.copy(item.root.position);
  pulseSequence += 1;
  frameState.input = {
    ...frameState.input,
    pulsePressed: true,
    pulseEventId: pulseSequence,
    stabilizeHeld: false,
    absorbHeld: false
  };
  tick();
  frameState.input.pulsePressed = false;
  tick();
};

pulseObject("old_core_husk_memory_001");
pulseObject("residue_silt_cloud_001");
assert.equal(frameState.graveMemoryRoute.oldCoreRead, true);
assert.equal(frameState.graveMemoryRoute.memorySiltRead, true);
assert.equal(frameState.graveMemoryRoute.completed, false);

playerRoot.position.copy(routeSystem.objectItems.get("residue_silt_cloud_001").root.position);
frameState.input.stabilizeHeld = true;
for (let i = 0; i < 14; i += 1) tick(0.1);
frameState.input.stabilizeHeld = false;
tick();
assert.equal(frameState.graveMemoryRoute.memorySiltStabilized, true);

pulseObject("scar_lock_plate_001");
pulseObject("inheritance_seed_remnant_001");
assert.equal(frameState.graveMemoryRoute.completed, true);
assert.equal(frameState.graveMemoryRoute.memoryThreadRetained, true);
assert.equal(frameState.graveMemoryRoute.protectedObjectsUntouched, true);
assert.equal(frameState.graveMemoryRoute.returnFoldReady, true);
for (const id of routeRecipe.interaction.protectedObjects) {
  const item = objectItems.get(id);
  assert.equal(item.absorbed, false);
  assert.equal(item.root.userData.absorbed, false);
}

const regionRegistry = new RegionRegistry(regions);
const objectiveRegistry = new ObjectiveRegistry(objectives);
const gateRegistry = new GateRegistry(gates);
const objectiveSystem = new ObjectiveSystem({
  objectiveRegistry,
  regionRegistry,
  frameState
});
const gateSystem = new GateSystem({
  gateRegistry,
  frameState
});

objectiveSystem.update(0, frameState);
assert.equal(
  frameState.firstSliceObjectives.grave_memory_read_and_stabilize.complete,
  true
);
assert.equal(
  frameState.firstSliceObjectives.grave_memory_read_and_stabilize.completionSource,
  "GraveMemoryRouteSystem observed by ObjectiveSystem"
);

playerRoot.position.copy(routeSystem.returnPosition);
tick();
frameState.currentMode = { regionId: "grave_memory_route" };
objectiveSystem.update(0, frameState);
frameState.input = {
  ...frameState.input,
  interactPressed: true,
  interactEventId: 1
};
const playerBeforeReturn = playerRoot.position.clone();
gateSystem.update(0, frameState);
assert.equal(frameState.activeCellId, "CELL_SIGNAL_CHORUS_NERVE_001");
assert(playerRoot.position.equals(playerBeforeReturn), "Gate-owned return must preserve player position.");
assert.equal(frameState.act1RouteCrossing.owner, "GateSystem");
assert.equal(frameState.act1RouteCrossing.playerRelocated, false);
assert.equal(frameState.act1RouteCrossing.archivedCompatibilityAdapterUsed, false);
assert.equal(frameState.act1RouteHistory.graveReturned, true);
assert.equal(frameState.act1RouteHistory.memoryThreadRetained, true);

frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frameState.currentMode = { regionId: "hub_chamber" };
frameState.hubChamberFoundation = {
  active: true,
  completed: true,
  centralAnchorReadable: true,
  threeRouteLayoutReadable: true,
  activeRouteIdentityDistinguished: true,
  firstMemoryFragmentReadable: true,
  routes: [
    {
      id: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      distanceToPlayer: 0.8
    }
  ]
};
frameState.hubInvestigationGameplay = { investigationReady: true };
frameState.statusPage = { firstHubUseComplete: true };
frameState.input = {
  ...frameState.input,
  interactPressed: false,
  pulsePressed: true,
  pulseEventId: 2
};
objectiveSystem.update(0, frameState);
assert.equal(frameState.firstSliceObjectives.hub_read_route_gates.complete, true);
const playerBeforeEntry = playerRoot.position.clone();
gateSystem.update(0, frameState);
assert.equal(frameState.activeCellId, "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
assert(playerRoot.position.equals(playerBeforeEntry), "Gate-owned entry must preserve player position.");
assert.equal(frameState.act1RouteCrossing.gateId, "hub_to_grave_memory_route");
assert.equal(frameState.act1RouteCrossing.destinationCellId, "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
assert.equal(frameState.act1RouteHistory.graveEntryCount, 1);

console.log("HC-010A Grave Memory route preview + Gate-owned Hub return validation passed.");
