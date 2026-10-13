import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { SiltPressureRouteSystem } from "../src/routes/SiltPressureRouteSystem.js";
import { Act1RouteContractSystem } from "../src/routes/Act1RouteContractSystem.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recipe = JSON.parse(fs.readFileSync(path.join(root, "public/data/routes/siltPressureRouteCircuit_HC012A.json"), "utf8"));
const contract = JSON.parse(fs.readFileSync(path.join(root, "public/data/routes/act1RouteContracts_HC012A.json"), "utf8"));
const geology = recipe.geologicMedium;
const habitat = recipe.habitatFoundation;
assert.equal(geology.pass, "LS1A2");
assert.equal(habitat.pass, "LS1A");
assert.equal(geology.addsColliders, false);
assert.equal(geology.addsContactSurfaces, false);
assert.equal(geology.addsMatter, false);
assert.equal(geology.newProgression, false);
assert.equal(geology.collisionAuthority, "unchanged_PlayerMovementController_entry_anchored_ellipsoid");
assert.equal(geology.channelRadii.length, habitat.connections.length);
assert(geology.channelRadii.every((radius) => radius >= 1.2 && radius <= 2));
assert(geology.wallOpacity > 0.3 && geology.wallOpacity < 0.65);
assert(geology.driftGrainCount > 0 && geology.driftGrainCount <= 128);
const movement = contract.routes.find((route) => route.id === "silt_burrow_route");
const vascular = contract.routes.find((route) => route.id === "vascular_route");
assert.deepEqual(movement.movementBounds.radii, [13.8, 6.25, 26.8]);
assert.deepEqual(vascular.movementBounds.radii, [4.5, 3.2, 22.5]);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
scene.add(playerRoot);
const frame = { activeCellId: "CELL_SILT_PRESSURE_ROUTE_001", frame: 0, runtimeSeconds: 0,
  physicalFeel: {}, input: { stabilizeHeld: false, absorbHeld: false, pulsePressed: false, pulseEventId: 0 },
  verbComposition: { chord: "idle", relationshipBound: false, intent: {} } };
const silt = new SiltPressureRouteSystem({ recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } }, scene, playerRoot, frameState: frame });
const owner = new Act1RouteContractSystem({ contract, playerRoot, frameState: frame });
owner.init();
silt.init();
const controller = new PlayerMovementController({ playerRoot, camera, frameState: frame, localCellRecipe: { physicalFeel: {} } });
function tick(dt = 0.05) {
  frame.frame++;
  frame.runtimeSeconds += dt;
  scene.updateMatrixWorld(true);
  owner.update(dt, frame);
  silt.update(dt, frame);
  controller.syncMovementBoundary(frame);
  scene.updateMatrixWorld(true);
}
tick();
assert.equal(frame.siltPressureRoute.habitatFoundation.geologyPass, "LS1A2");
assert.equal(silt.habitatLobes.length, 3);
assert.equal(silt.habitatVeins.length, 4);
assert(silt.habitatAnatomy.getObjectByName("silt_spinal_host_stone_tunnel_LS1A2"));
assert(silt.habitatAnatomy.getObjectByName("silt_visual_seep_grains_fixed_pool_LS1A2"));
assert.equal(silt.habitatDriftSeeds.length, geology.driftGrainCount);
assert.equal(silt.habitatDriftPositions.length, geology.driftGrainCount * 3);
assert.deepEqual([controller.boundary.x, controller.boundary.y, controller.boundary.z], movement.movementBounds.radii);
assert.equal(frame.siltPressureRoute.habitatFoundation.newMaterialInstances, recipe.livingMaterialCycle?.unitCount ?? 0);
assert.equal(frame.siltPressureRoute.habitatFoundation.renewsMatter, Boolean(recipe.livingMaterialCycle));

const bounds = movement.movementBounds.radii;
function inBoundary(position, name) {
  const radial = Math.hypot(position[0] / bounds[0], position[1] / bounds[1], position[2] / bounds[2]);
  assert(radial < 0.94, `${name} outside navigable envelope (${radial})`);
}
for (const h of habitat.habitats) {
  inBoundary(h.center, `${h.id} center`);
  playerRoot.position.fromArray(h.center);
  tick();
  assert.equal(frame.siltPressureRoute.habitatFoundation.currentHabitatId, h.id);
  assert(silt.habitatAnatomy.getObjectByName(`silt_${h.id}_sediment_catchment_bed`));
  for (const sign of [-1, 1]) {
    inBoundary([h.center[0] + sign * h.radii[0] * 0.65, h.center[1], h.center[2]], `${h.id} lateral test`);
  }
}
for (const connection of habitat.connections) {
  assert(silt.habitatAnatomy.getObjectByName(`silt_seep_cavern_${connection.id}`));
  for (const key of ["from", "bend", "to"]) inBoundary(connection[key], `${connection.id}:${key}`);
  // Geologic membranes MUST have real mesh apertures at connected cavities:
  // a player should not see a visual stone plane sealed across a seep throat.
  for (const key of ["from", "to"]) {
    const endpoint = new THREE.Vector3().fromArray(connection[key]);
    const cave = habitat.habitats.find((h) => endpoint.distanceTo(new THREE.Vector3().fromArray(h.center)) < 0.8);
    if (!cave) continue;
    const other = new THREE.Vector3().fromArray(connection[key === "from" ? "to" : "from"]);
    const direction = other.sub(endpoint).normalize();
    const ray = new THREE.Raycaster(endpoint, direction, 0.05, 7);
    scene.updateMatrixWorld(true);
    const wall = silt.habitatAnatomy.getObjectByName(`silt_${cave.id}_irregular_inward_stone_stratum`);
    assert.equal(ray.intersectObject(wall, false).length, 0,
      `LS1A2 has a sealed false stone wall between ${connection.id} and ${cave.id}`);
  }
}
for (const [i, pos] of recipe.anatomy.pathPoints.entries()) inBoundary(pos, `original path ${i}`);
inBoundary(recipe.returnFold.position, "original return position");

let meshCount = 0, triangleCount = 0, pointsCount = 0;
silt.habitatAnatomy.traverse((obj) => {
  assert(obj.userData.targetingSuppressed || obj.parent?.userData?.targetingSuppressed,
    `Geologic node became targetable: ${obj.name}`);
  if (obj.isMesh) {
    meshCount++;
    triangleCount += obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3;
  }
  if (obj.isPoints) pointsCount++;
});
assert(meshCount <= 30, `Unbounded geologic mesh count: ${meshCount}`);
assert(triangleCount <= 9000, `Unbounded geologic triangle count: ${triangleCount}`);
assert.equal(pointsCount, 1, "One pooled visual grain system, not per-grain Mesh draw calls");
const shell = silt.habitatLobes[0].shell;
const startScale = shell.scale.clone();
const bodyCount = silt.habitatAnatomy.children.length;
const originalGeo = silt.habitatDrift.geometry;
const originalArray = silt.habitatDriftPositions;
const originalPointCount = originalGeo.attributes.position.count;
for (let t = 0; t <= 1200; t += 5) {
  frame.runtimeSeconds = t;
  silt.animateHabitatFoundation(frame);
  assert.equal(silt.habitatAnatomy.children.length, bodyCount);
  assert.equal(silt.habitatDrift.geometry, originalGeo);
  assert.equal(silt.habitatDriftPositions, originalArray);
  assert.equal(silt.habitatDrift.geometry.attributes.position.count, originalPointCount);
  assert(shell.material.opacity >= 0.18 && shell.material.opacity <= geology.wallOpacity);
  assert(Math.abs(shell.scale.x / startScale.x - 1) < 0.02, "Shell breathing accumulated instead of resetting");
}

// Activity state, old route authority and retained return were proven by LS1A;
// this verifies those original ownership constraints remain unmodified.
const beforeState = { pressure: silt.pressureRead, absorb: silt.safeMatterAbsorbed };
assert.deepEqual(beforeState, { pressure: false, absorb: false });
frame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
silt.update(0.05, frame);
assert.equal(silt.root.visible, false, "Silt geology persisted visible outside mounted cell");
console.log(`[LS1A2] connected geologic body: ${meshCount} meshes, ${Math.round(triangleCount)} triangles, ${originalPointCount} reused visual grains`);
console.log("[LS1A2] player access, old route assets, no new chemistry/progression, 20-minute stable geometry and region unmount PASS");
