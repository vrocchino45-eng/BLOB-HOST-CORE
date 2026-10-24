#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {graveRecoveryCoupling} from '../src/routes/GraveRecoveryCoupling.js';
import {GraveVascularEffectMemory} from '../src/routes/GraveVascularEffectMemory.js';
import {HostConnectionReceiptLedger} from '../src/core/HostConnectionReceiptLedger.js';
import {VascularSiltSignalReceiver} from '../src/routes/VascularSiltSignalReceiver.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const man=JSON.parse(fs.readFileSync(new URL('./MANIFEST.json',import.meta.url)));
const hash=x=>createHash('sha256').update(x).digest('hex');
let checks=0;
function eq(a,b,label){assert.equal(a,b,label);checks++}
function ok(a,label){assert.ok(a,label);checks++}
function close(a,b,label){assert.ok(Math.abs(a-b)<1e-10,`${label}: ${a} versus ${b}`);checks++}
for (const [rel,expected] of Object.entries({...man.afterSha256,...man.lockedDependencies})) {
 eq(hash(fs.readFileSync(path.join(root,rel))),expected,`file lock ${rel}`);
}
// Mathematical law remains neutral without an actual authenticated Grave memory.
for(const invalid of [null,{}, {receivedTotal:0,memoryPressure:1}, {receivedTotal:1,memoryPressure:NaN}, {receivedTotal:1,memoryPressure:Infinity}, {receivedTotal:1,memoryPressure:-1}]) {
 eq(graveRecoveryCoupling(invalid).multiplier,1,'invalid or empty memory has exact baseline');
}
close(graveRecoveryCoupling({receivedTotal:1,memoryPressure:0.5}).multiplier,1.075,'half memory');
close(graveRecoveryCoupling({receivedTotal:1,memoryPressure:1}).multiplier,1.15,'max memory');
close(graveRecoveryCoupling({receivedTotal:1,memoryPressure:99}).multiplier,1.15,'pressure cannot exceed 15%');
// Generate an authentic Silt -> Vascular -> Host receipt, then let Grave consume it.
const SILT='CELL_SILT_PRESSURE_ROUTE_001', GRAVE='CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const cause=n=>({kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',noMaterialTransfer:true,progressionCredit:false,unitId:'silt-grain-03',sequence:n,position:[0,0,-1],velocity:[1,0,0],siltElapsedSeconds:n});
const host=new HostConnectionReceiptLedger();
const vasc=new VascularSiltSignalReceiver();
const remoteMemory=new GraveVascularEffectMemory();
const stableHost=JSON.stringify(host.snapshot());
const stableVascular=JSON.stringify(vasc.snapshot());
eq(remoteMemory.receiveFromHost(host),0,'no history in unloaded circuit');
for(let n=10;n<=12;n++) {
 host.observeSiltRelease(cause(n));
 vasc.receive(host.snapshot());
 const cursor=host.vascularEffectSnapshot({withRecords:false}).lastSourceEventSequence;
 for(const e of vasc.appliedEffectSnapshot({afterSequence:cursor}).records) host.observeVascularAppliedEffect(e);
}
eq(remoteMemory.receiveFromHost(host),3,'Grave gets only legitimate applied Vascular effects');
ok(remoteMemory.memoryPressure>0 && remoteMemory.memoryPressure<=1,'bounded effects build Grave memory');
const observed=remoteMemory.memoryPressure;
eq(remoteMemory.receiveFromHost(host),0,'re-reading receipts cannot grow memory');
eq(remoteMemory.memoryPressure,observed,'replay is neutral');
ok(JSON.stringify(host.snapshot())!==stableHost && JSON.stringify(vasc.snapshot())!==stableVascular,'actual upstream state changed');
// Evaluate the real Grave I class without Three installed, as in C0D1-C's
// owner-isolation validator. Real updateInteractions, real publish, no fake maths.
const source=fs.readFileSync(path.join(root,'src/routes/GraveMemoryRouteSystem.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'src/core/GameRuntime.js'),'utf8');
ok(runtime.includes('hostConnectionReceiptLedger: this.hostConnectionReceiptLedger'),'runtime injection retained');
ok(source.includes('this.vascularEffectMemory.receiveFromHost(this.hostConnectionReceiptLedger);'),'mounted receive retained');
ok(source.indexOf('if (!active) {\n      if (this.active) this.onRuntimeUnmount(frameState);\n      return;') < source.indexOf('this.vascularEffectMemory.receiveFromHost(this.hostConnectionReceiptLedger);'),'off-route gate before reads');
ok(!source.includes('this.hostConnectionReceiptLedger.observe'),'Grave never writes Host');
class Vector3 {constructor(){this.x=0;this.y=0;this.z=0;} lengthSq(){return 0;} distanceTo(){return 0;}}
const sandbox={THREE:{Vector3},GraveVascularEffectMemory,graveRecoveryCoupling};
vm.runInNewContext(source.replace(/^import.*$/gm,'').replace('export class GraveMemoryRouteSystem','class GraveMemoryRouteSystem')+'\nthis.GraveMemoryRouteSystem=GraveMemoryRouteSystem;',sandbox,{filename:'GraveMemoryRouteSystem.js',timeout:1500});
function init(h) {
 const frame={activeCellId:GRAVE,physicalFeel:{},input:{stabilizeHeld:true}};
 const route=new sandbox.GraveMemoryRouteSystem({recipeDataSystem:{},chemObjectSystem:{},scene:{},playerRoot:{position:new Vector3()},frameState:frame,hostConnectionReceiptLedger:h});
 route.recipe={interaction:{recoveryPerSecond:0.42,traceRecoveryPerSecond:0.30,minimumSafeTraceIntegrity:0.72,maximumSafeRecoilRisk:0.18}};
 route.active=true;route.circuitEnabled=true;route.siltRead=true;route.siltStabilized=true;
 route.residueRecoilRisk=0.5;route.traceIntegrity=0.4;
 route.nearestAuthoredObject=()=>null;route.distanceToObject=()=>0;
 route.applyPhysicalFeel=()=>{};route.updateVisualResponse=()=>{};route.applyHostRhythmVisual=()=>{};
 return {route,frame};
}
const blankHost=new HostConnectionReceiptLedger();
const clean=init(blankHost), loaded=init(host);
// Causality / mounted route flow: memory must be received BEFORE actual recovery.
clean.route.update(0.25,clean.frame);loaded.route.update(0.25,loaded.frame);
eq(clean.frame.graveVascularEffectMemory.receivedTotal,0,'clean Grave receives nothing');
eq(loaded.frame.graveVascularEffectMemory.receivedTotal,3,'loaded Grave receives 3 host effects');
const mult=graveRecoveryCoupling(loaded.route.vascularEffectMemory).multiplier;
close(clean.route.residueRecoilRisk,0.5-0.25*0.42,'legacy recoil recovery exactly retained');
close(clean.route.traceIntegrity,0.4+0.25*0.30,'legacy integrity recovery exactly retained');
close(loaded.route.residueRecoilRisk,0.5-0.25*0.42*mult,'assisted recoil uses real memory');
close(loaded.route.traceIntegrity,0.4+0.25*0.30*mult,'assisted integrity uses real memory');
ok(loaded.route.residueRecoilRisk<clean.route.residueRecoilRisk,'history lowers recoil more');
ok(loaded.route.traceIntegrity>clean.route.traceIntegrity,'history repairs trace faster');
ok(mult>1 && mult<=1.15,'assist bounded by mathematical law');
eq(clean.frame.graveVascularEffectMemory.gameplayConsequenceApplied,false,'clean has no consequence');
eq(loaded.frame.graveVascularEffectMemory.gameplayConsequenceApplied,true,'real assisted Stabilize records consequence');
eq(loaded.frame.graveVascularEffectMemory.recoveryCoupling.assistedRecoveryTicks,1,'one authentic assisted recovery tick');
eq(clean.frame.graveMemoryRoute.objectiveId,loaded.frame.graveMemoryRoute.objectiveId,'same original objective owner');
eq(clean.frame.graveMemoryRoute.completed,false,'clean no auto progression');
eq(loaded.frame.graveMemoryRoute.completed,false,'loaded no auto progression');
eq(loaded.frame.graveVascularEffectMemory.graveObjectivesChanged,false,'no objective mutation');
eq(loaded.frame.graveVascularEffectMemory.materialTransfer,false,'no fake transport');
// No memory effects merely from entering Grave: only an eligible Stabilize action.
const idle=init(host);idle.frame.input.stabilizeHeld=false;idle.route.update(0.25,idle.frame);
close(idle.route.residueRecoilRisk,0.5,'no unrequested recovery');
close(idle.route.traceIntegrity,0.4,'no unrequested integrity gain');
eq(idle.frame.graveVascularEffectMemory.gameplayConsequenceApplied,false,'history alone cannot grant consequence');
const notReady=init(host);notReady.route.siltRead=false;notReady.route.update(0.25,notReady.frame);
eq(notReady.frame.graveVascularEffectMemory.gameplayConsequenceApplied,false,'must read Silt before Stabilize');
// Grave I remains dormant off-route, retaining but not consuming records.
const off=init(host);off.frame.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';off.route.onRuntimeUnmount=f=>{off.route.active=false;off.route.publish(f,false)};
off.route.update(0.25,off.frame);
eq(off.route.vascularEffectMemory.receivedTotal,0,'off-route memory not consumed');
close(off.route.residueRecoilRisk,0.5,'off-route recovery not applied');
// Additional malformed channel may not influence Grave.
const fake=new HostConnectionReceiptLedger();
const forged=init({forGrave:()=>({...fake.forGrave(),mode:'forged'})});forged.route.update(0.25,forged.frame);
eq(forged.route.vascularEffectMemory.receivedTotal,0,'forged Host channel rejected');
close(forged.route.residueRecoilRisk,clean.route.residueRecoilRisk,'forged history does not alter recovery');
console.log(JSON.stringify({pass:'C0D2',result:'OFFLINE_AUTHENTICATED_GRAVE_RECOVERY_COUPLING_PASS',assertions:checks,loadedHostEffects:loaded.frame.graveVascularEffectMemory.receivedTotal,loadedMemoryPressure:observed,loadedMultiplier:mult,unchangedNoHistory: true,scope:'Grave I Stabilize recoil and trace recovery only',limitations:'No browser/Three/Vite build in offline validator; old C0D1-C hash-validator expects pre-C0D2 Grave route'},null,2));
