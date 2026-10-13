import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { fileURLToPath } from 'node:url';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { Act1RouteContractSystem } from '../src/routes/Act1RouteContractSystem.js';
import { PlayerMovementController } from '../src/player/PlayerMovementController.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (s) => JSON.parse(fs.readFileSync(path.join(root, s), 'utf8'));
const recipe = read('public/data/routes/siltPressureRouteCircuit_HC012A.json');
const contract = read('public/data/routes/act1RouteContracts_HC012A.json');
const route = contract.routes.find((value) => value.id === 'silt_burrow_route');
const original = contract.routes.find((value) => value.id === 'vascular_route');
assert.equal(recipe.habitatFoundation.pass, 'LS1A');
assert.equal(recipe.habitatFoundation.habitats.length, 3);
assert.deepEqual(recipe.habitatFoundation.habitats.map((item) => item.id), ['reservoir', 'garden', 'veins']);
assert.equal(recipe.habitatFoundation.connections.length, 4);
assert.equal(recipe.habitatFoundation.noRenewableMatterYet, !Boolean(recipe.livingMaterialCycle));
assert.equal(recipe.habitatFoundation.addsContactSurfaces, false);
assert.deepEqual(original.movementBounds.radii, [4.5, 3.2, 22.5]);
const oldSilt = [6.8, 4.25, 21.2];
for (let j=0; j<3; j++) assert(route.movementBounds.radii[j] > oldSilt[j]);
assert.equal(route.movementBounds.mode, 'entry_anchored_ellipsoid');

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
scene.add(playerRoot);
const frame = {
  activeCellId:'CELL_SILT_PRESSURE_ROUTE_001', runtimeSeconds:0, frame:0,
  physicalFeel: {},
  input:{stabilizeHeld:false, absorbHeld:false, pulsePressed:false, pulseEventId:0},
  verbComposition:{chord:'idle', relationshipBound:false, intent:{}},
};
const silt = new SiltPressureRouteSystem({ recipeDataSystem:{data:{siltPressureRouteCircuit:recipe}}, scene, playerRoot, frameState:frame });
const bounds = new Act1RouteContractSystem({contract,playerRoot,frameState:frame});
bounds.init();
silt.init();
const controller = new PlayerMovementController({playerRoot,camera,frameState:frame,localCellRecipe:{physicalFeel:{}}});
function update(dt=0.05) {
  frame.frame++;
  frame.runtimeSeconds += dt;
  scene.updateMatrixWorld(true);
  bounds.update(dt,frame);
  silt.update(dt,frame);
  controller.syncMovementBoundary(frame);
  scene.updateMatrixWorld(true);
}
update();
assert.equal(silt.habitatLobes.length,3);
assert.equal(silt.habitatVeins.length,4);
assert.equal(frame.siltPressureRoute.habitatFoundation.active,true);
assert.equal(frame.siltPressureRoute.habitatFoundation.newMaterialInstances,recipe.livingMaterialCycle?.unitCount ?? 0);
assert.equal(frame.siltPressureRoute.habitatFoundation.renewsMatter,Boolean(recipe.livingMaterialCycle));
assert.deepEqual([controller.boundary.x,controller.boundary.y,controller.boundary.z],route.movementBounds.radii);

function assertInside(point, label, margin=0.92) {
  const b=route.movementBounds.radii;
  const value=Math.hypot(point[0]/b[0],point[1]/b[1],point[2]/b[2]);
  assert(value < margin, `${label}: movement envelope boundary ${value.toFixed(3)} >= ${margin}`);
  return value;
}
const located=[];
for (const habitat of recipe.habitatFoundation.habitats) {
  playerRoot.position.fromArray(habitat.center);
  update();
  assert.equal(frame.siltPressureRoute.habitatFoundation.currentHabitatId,habitat.id);
  assert(frame.siltPressureRoute.habitatFoundation.habitatRelief > .95);
  located.push(`${habitat.id}:${assertInside(habitat.center,habitat.id).toFixed(2)}`);
  // At least three accessible cross-sections well inside the controller shell.
  for (const sign of [-1, 1]) {
    const p=[habitat.center[0]+sign*habitat.radii[0]*0.65,habitat.center[1],habitat.center[2]];
    assertInside(p,`${habitat.id} side ${sign}`);
  }
}
for (const path of recipe.habitatFoundation.connections) {
  for (const [index, point] of [path.from,path.bend,path.to].entries()) {
    assertInside(point,`${path.id} anchor ${index}`);
  }
}
for (const [index, point] of recipe.anatomy.pathPoints.entries()) {
  assertInside(point,`old passage point ${index}`);
}
assertInside(recipe.returnFold.position,'original return fold');

// Original pressure read, rib brace, selective yellow packet and deep release
// must still work on the very same owner and credit fields.
const toPath = (progress) => {
  playerRoot.position.copy(silt.pathCurve.getPointAt(progress));
  update();
};
toPath(.23);
frame.input.stabilizeHeld=true;
for (let i=0;i<5;i++) update(.08);
assert(frame.siltPressureRoute.pressureRelationshipReady,'Stabilize could not establish Silt pressure relationship');
frame.input.pulsePressed=true;
frame.input.pulseEventId=101;
update(.05);
frame.input.pulsePressed=false;
assert(frame.siltPressureRoute.pressureRead,'Pulse through Stabilize did not read Silt pressure');
for (let i=0;i<20;i++) update(.07);
assert(frame.siltPressureRoute.ribsReleased,'Stabilize did not brace passage ribs');
frame.input.stabilizeHeld=false;
const safePosition=new THREE.Vector3();
silt.safePacket.getWorldPosition(safePosition);
playerRoot.position.copy(safePosition);
update();
frame.input.absorbHeld=true;
for (let i=0;i<15;i++) update(.07);
frame.input.absorbHeld=false;
assert(frame.siltPressureRoute.safeMatterAbsorbed,'Existing yellow packet was not absorbed');
assert.equal(frame.siltPressureRoute.appetiteDrawSequence,1);
toPath(.94);
for (let i=0;i<30 && !silt.completed;i++) update(.07);
assert.equal(silt.completed,true,'Existing deep Silt route could not complete');
assert.equal(silt.returnFoldReady,true);
assert.equal(silt.densePackets.length,2);
assert.equal(silt.failureRecoverable ?? true,true);
const completedBefore=silt.completed;
frame.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';
silt.update(.05,frame);
assert.equal(silt.root.visible,false);
frame.activeCellId='CELL_SILT_PRESSURE_ROUTE_001';
playerRoot.position.set(0,0,0);
update();
assert.equal(silt.completed,completedBefore,'Silt route completion lost across remount');
assert.equal(frame.siltPressureRoute.appetiteDrawSequence,1,'Silt route credit was minted on second visit');
assert.equal(silt.root.visible,true);

let addedMeshes=0,triangleCount=0;
silt.habitatAnatomy.traverse((obj)=>{
  if (!obj.isMesh) return;
  addedMeshes++;
  triangleCount += obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3;
  assert(obj.userData.targetingSuppressed===true || obj.parent?.userData?.targetingSuppressed===true,
    `Habitat decoration accidentally targetable: ${obj.name}`);
});
assert(addedMeshes <= 40,`LS1A added ${addedMeshes} meshes; too high`);
assert(triangleCount < 10000,`LS1A added ${triangleCount} triangles; too high`);
console.log(`[LS1A] three habitat anchors + four connectors inside actual controller envelope: ${located.join(' ')}`);
console.log('[LS1A] active controller boundaries, original pressure/absorb/deep completion and return retention PASS');
console.log(`[LS1A] new habitat presentation ${addedMeshes} meshes, ${Math.round(triangleCount)} triangles; no new route credit and LS1B material integration compatible PASS`);
