import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { SiltLivingMaterialCycle } from "../src/routes/SiltLivingMaterialCycle.js";
import { SiltPressureRouteSystem } from "../src/routes/SiltPressureRouteSystem.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recipe = JSON.parse(fs.readFileSync(path.join(root, "public/data/routes/siltPressureRouteCircuit_HC012A.json"),"utf8"));
const settings = recipe.livingMaterialCycle;
assert.equal(settings.pass, "LS1B");
assert.equal(settings.progressionAuthority, false);
assert.equal(settings.nutrientGrant, false);
assert.equal(settings.targetingAuthority, false);
assert.equal(recipe.geologicMedium.pass, "LS1A2");
const cycle = new SiltLivingMaterialCycle(settings);
const stableIds = cycle.units.map(u=>u.id);
assert.equal(cycle.snapshot().initialMass, settings.unitCount);
assert.equal(cycle.snapshot().active,false);
cycle.update(100, { habitatId:"reservoir" });
assert.equal(cycle.elapsed,0, "Dormant system simulates without first real interaction");
assert.equal(cycle.awakenFromCanonicalAbsorb(),true);
assert.equal(cycle.awakenFromCanonicalAbsorb(),false);
const storedSnapshot = cycle.snapshot();
const routeInput = { habitatId:"reservoir",pulsePressed:false,pulseEventId:0,stabilizeHeld:false };
let seenVeins=false, seenGarden=false, seenGrowing=false, seenMature=false;
for(let n=0;n<24000;n++) {
  if (n===180) Object.assign(routeInput,{habitatId:"veins",pulsePressed:true,pulseEventId:50});
  if (n===181) routeInput.pulsePressed=false;
  if (n===500) Object.assign(routeInput,{habitatId:"garden",stabilizeHeld:true});
  if (n===800) routeInput.stabilizeHeld=false;
  cycle.update(0.05,routeInput);
  const snap=cycle.snapshot();
  assert.equal(snap.conservedMass,settings.unitCount, "Matter conservation failed");
  assert.equal(snap.currentUnitCount,settings.unitCount, "Number of logical pieces changed");
  assert.equal(Object.values(snap.counts).reduce((a,b)=>a+b,0),settings.unitCount);
  assert.deepEqual(cycle.units.map(u=>u.id),stableIds);
  assert(cycle.events.length<=24);
  if(snap.counts.veins>0) seenVeins=true;
  if(snap.counts.settled>0) seenGarden=true;
  if(snap.counts.growing>0) seenGrowing=true;
  if(snap.counts.mature>0) seenMature=true;
}
assert(seenVeins && seenGarden && seenGrowing && seenMature,"Cycle did not reach each meaningful material condition");
assert(cycle.regenerationCount>=1,"No material returned to its original reservoir");
assert(cycle.releaseCount>cycle.unitCount,"Reservoir did not repeat its finite cycle");
assert.equal(cycle.firstAbsorbTriggerCount,1);
assert.equal(cycle.pressureInterventions,1,"Held Pulse repeated trigger");
assert(cycle.gardenInterventions>0,"Stabilize had no effect on garden growth");
const frozen=JSON.stringify(cycle.units);
const frozenElapsed=cycle.elapsed;
cycle.update(0,{habitatId:"garden"});
assert.equal(cycle.elapsed,frozenElapsed);
assert.equal(JSON.stringify(cycle.units),frozen);

// Integrated route mount, old safePacket credit, region-local mesh object pool
// and retained remount state. This has no browser/physical GPU dependency.
const scene=new THREE.Scene(), playerRoot=new THREE.Group();
scene.add(playerRoot);
const frame={activeCellId:"CELL_SILT_PRESSURE_ROUTE_001",frame:0,runtimeSeconds:0,physicalFeel:{},
  input:{stabilizeHeld:false,absorbHeld:false,pulsePressed:false,pulseEventId:0},
  verbComposition:{chord:"idle",relationshipBound:false,intent:{}}};
const silt=new SiltPressureRouteSystem({recipeDataSystem:{data:{siltPressureRouteCircuit:recipe}},scene,playerRoot,frameState:frame});
silt.init();
function tick(dt=0.05) { frame.frame++; frame.runtimeSeconds+=dt;scene.updateMatrixWorld(true);silt.update(dt,frame);scene.updateMatrixWorld(true); }
tick();
assert.equal(silt.livingCycle.active,false,"Cycle started before real safePacket absorption");
assert.equal(silt.livingMatterGroup.visible,false);
assert.equal(silt.livingMatterMeshes.length,settings.unitCount);
for(const mesh of silt.livingMatterMeshes) {
  assert(mesh.body.userData.targetingSuppressed);
  assert.equal(mesh.body.children.length,2);
}
const anchorIds=silt.livingMatterMeshes.map(x=>x.body);
const habitatCenters=recipe.habitatFoundation.habitats;
for(const h of habitatCenters) {
  playerRoot.position.fromArray(h.center);
  tick();
  assert.equal(frame.siltPressureRoute.habitatFoundation.currentHabitatId,h.id);
}
// Repeat canonical LS1A route technique instead of directly setting the flag.
playerRoot.position.copy(silt.pathCurve.getPointAt(.23));tick();
frame.input.stabilizeHeld=true;
for(let i=0;i<5;i++)tick(.08);
frame.input.pulsePressed=true;frame.input.pulseEventId=501;tick();frame.input.pulsePressed=false;
for(let i=0;i<20;i++)tick(.07);
assert(silt.ribsReleased);
frame.input.stabilizeHeld=false;
const world=new THREE.Vector3();silt.safePacket.getWorldPosition(world);
playerRoot.position.copy(world);tick();
frame.input.absorbHeld=true;
for(let i=0;i<15;i++)tick(.07);
frame.input.absorbHeld=false;
assert(silt.safeMatterAbsorbed,"Existing one-time quest packet was not absorbed");
assert.equal(silt.appetiteDrawSequence,1);
assert.equal(silt.livingCycle.active,true);
assert.equal(silt.livingCycle.firstAbsorbTriggerCount,1);
const pieces = silt.livingCycle.units;
for(let i=0;i<500;i++)tick();
assert(silt.livingCycle.releaseCount>=1);
assert.equal(frame.siltPressureRoute.livingMaterialCycle.conservedMass,settings.unitCount);
playerRoot.position.fromArray(habitatCenters.find(x=>x.id==="garden").center);tick();
assert.equal(frame.siltPressureRoute.habitatFoundation.currentHabitatId,"garden");
const oldAge=silt.livingCycle.elapsed;
frame.activeCellId="CELL_SIGNAL_CHORUS_NERVE_001";
silt.update(.05,frame);
assert.equal(silt.root.visible,false);
silt.update(15,frame);
assert.equal(silt.livingCycle.elapsed,oldAge,"Cycle advanced while cell was not mounted");
frame.activeCellId="CELL_SILT_PRESSURE_ROUTE_001";tick();
assert.equal(silt.livingCycle.active,true);
assert.equal(silt.appetiteDrawSequence,1,"Original quest credit duplicated on remount");
assert.deepEqual(silt.livingMatterMeshes.map(x=>x.body),anchorIds,"Material meshes recreated on remount");
assert.equal(silt.safeMatterAbsorbed,true,"Yellow safePacket respawned on return");
assert.equal(silt.livingCycle.snapshot().conservedMass,settings.unitCount);
console.log(`[LS1B] 20-minute conserved cycle: ${cycle.releaseCount} releases, ${cycle.regenerationCount} refills, ${cycle.eventSequence} bounded events; first route absorption triggered once`);
console.log("[LS1B] pulses, garden Stabilize, in-cell-only time, stable instances, no duplicate credits, region mount/unmount PASS");
