/** Isolated real Vascular methods, with only external Three.js import mocked.
 * Uses actual source implementation. No full Vite/Three browser runtime claimed.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const path=new URL('../src/routes/VascularRhythmRouteSystem.js',import.meta.url);
const receiverUrl=new URL('../src/routes/VascularSiltSignalReceiver.js',import.meta.url).href;
const source=fs.readFileSync(path,'utf8')
  .replace('import * as THREE from "three";',`const THREE = {MathUtils: {clamp: (n,lo,hi)=>Math.min(hi, Math.max(lo,n))}};`)
  .replace('from "./VascularSiltSignalReceiver.js"',`from "${receiverUrl}"`);
const encoded=`data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
const {VascularRhythmRouteSystem}=await import(encoded);
const {HostConnectionReceiptLedger}=await import(new URL('../src/core/HostConnectionReceiptLedger.js',import.meta.url));
const {VascularSiltSignalReceiver}=await import(new URL('../src/routes/VascularSiltSignalReceiver.js',import.meta.url));
const make=()=>{
 const v=Object.create(VascularRhythmRouteSystem.prototype);
 v.siltSignalReceiver=new VascularSiltSignalReceiver(); v.recipe={movementBounds:{radii:[4.5,3.2,22.5]}, cadence:{requiredReads:3}};
 v.completed=false;v.active=true;v.contractionIntensity=.35;v.synchronization=.15;v.turbulence=0;
 v.traversalPulseWake=0;v.traversalAbsorbShear=0;v.traversalStabilizeCalm=0;
 v.elapsed=10;v.pathProgress=.5;v.pathDistance=.2;v.closestTangent={x:0,y:0,z:1};v.entryAnchor={x:0,y:0,z:0};
 v.retainedSynchronizationStrength=0;v.grammarReinforcementStrength=0;v.grammarReinforcementMode='none';
 v.lockedCadenceReads=0;v.chargeDistance=10;v.cadencePhase=.2;v.stabilizing=false;v.desynchronized=false;
 v.braidTubes=[];v.currentMotes=[];v.valves=[];v.chargeTrail=[];v.returnFold=null;v.chargeRoot=null;
 v.root={userData:{}};v.vesselEnvelope={material:{emissiveIntensity:0,opacity:0}};
 v.wallFolds=[{userData:{baseScale:{x:1,y:1,z:1}},scale:{x:1,y:1,z:1},rotation:{z:0},material:{opacity:0,emissiveIntensity:0}}];
 return v;
};
const seed={sequence:8,kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',unitId:'silt-grain-02',position:[-4,-1,-10],velocity:[1,0,.7],siltElapsedSeconds:22,noMaterialTransfer:true,progressionCredit:false};
const before=make(),after=make();const ledger=new HostConnectionReceiptLedger();ledger.observeSiltRelease(seed);
const input={physicalFeel:{},hostRhythm:{}};const sample={tangent:{x:0,y:0,z:1},progress:.5,distance:.2};
before.applyDynamicCurrent(input,sample);
const beforeFlow=input.physicalFeel.spatialFeel.flowStrength;
assert.equal(beforeFlow, input.physicalFeel.spatialFeel.baseFlowStrength);
assert.equal(before.siltSignalReceiver.flowScale,1);
assert.equal(after.siltSignalReceiver.receive(ledger.snapshot()),1);
const fs1={physicalFeel:{},hostRhythm:{}};after.applyDynamicCurrent(fs1,sample);
const afterFlow=fs1.physicalFeel.spatialFeel.flowStrength;
assert.ok(afterFlow < beforeFlow && afterFlow > beforeFlow*.927);
assert.ok(Math.abs(afterFlow/beforeFlow-after.siltSignalReceiver.flowScale) < 1e-12);
assert.equal(fs1.physicalFeel.spatialFeel.remoteSiltMembraneLoad,after.siltSignalReceiver.membraneLoad);
console.log('PASS actual Vascular applyDynamicCurrent flow changes from verified Silt cause only');
const frameState={runtimeSeconds:30,hostRhythm:{}};
before.animate(.016,frameState,sample);after.animate(.016,frameState,sample);
assert.ok(after.wallFolds[0].scale.y>before.wallFolds[0].scale.y);
assert.ok(after.wallFolds[0].material.emissiveIntensity>before.wallFolds[0].material.emissiveIntensity);
assert.ok(after.vesselEnvelope.material.opacity>before.vesselEnvelope.material.opacity);
assert.equal(after.lockedCadenceReads,before.lockedCadenceReads);
console.log('PASS actual Vascular animate produces membrane swelling & luminescence, no cadence advancement');
const elems=[];globalThis.document={body:{appendChild(node){elems.push(node)}},createElement(){return {setAttribute(){},style:{},textContent:''}}};
after.updateHostCauseNotice(true,ledger.forVascular());
assert.ok(elems[0].textContent.includes('LOCAL RESPONSE'));
assert.ok(elems[0].textContent.includes('No grain arrival'));
assert.equal(elems[0].style.display,'block');
after.updateHostCauseNotice(false,ledger.forVascular());
assert.equal(elems[0].style.display,'none');
console.log('PASS mounted-only receiver notice shows local environmental effect and hides on exit');
console.log('LS1E2 RUNTIME METHOD SMOKE: 3/3 passed');
