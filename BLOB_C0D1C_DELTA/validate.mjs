#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { VascularSiltSignalReceiver } from '../src/routes/VascularSiltSignalReceiver.js';
import { GraveVascularEffectMemory } from '../src/routes/GraveVascularEffectMemory.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(new URL('./MANIFEST.json', import.meta.url),'utf8'));
const digest=buf=>createHash('sha256').update(buf).digest('hex');
for(const [rel,expected] of Object.entries(manifest.afterSha256)) {
 assert.equal(digest(fs.readFileSync(path.join(root,rel))),expected,`exact C0D1-C installed ${rel}`);
}
for(const [rel,expected] of Object.entries(manifest.lockedDependencySha256)) {
 assert.equal(digest(fs.readFileSync(path.join(root,rel))),expected,`locked existing ${rel}`);
}
let count=0;
function test(cond,msg){assert.ok(cond,msg);count++;}
function same(a,b,msg){assert.deepEqual(a,b,msg);count++;}
const SILT='CELL_SILT_PRESSURE_ROUTE_001';
const VASC='CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE='CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const cause=(n,unit='silt-grain-03')=>({kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',noMaterialTransfer:true,progressionCredit:false,unitId:unit,sequence:n,position:[0,0,-1],velocity:[1,0,0],siltElapsedSeconds:n});
const relay=(h,v)=>{
 v.receive(h.snapshot());
 const cursor=h.vascularEffectSnapshot({withRecords:false}).lastSourceEventSequence;
 for (const event of v.appliedEffectSnapshot({afterSequence:cursor}).records) h.observeVascularAppliedEffect(event);
};
const h=new HostConnectionReceiptLedger(),v=new VascularSiltSignalReceiver();
const grave=new GraveVascularEffectMemory();
test(grave.receiveFromHost(h)===0,'empty Grave no incoming signal');
test(grave.snapshot().receivedTotal===0 && grave.memoryPressure===0,'no Silt cause no Grave memory');
h.observeSiltRelease(cause(10));
test(grave.receiveFromHost(h)===0,'Silt release alone cannot affect Grave');
test(h.vascularEffectSnapshot().acceptedTotal===0,'Host no premature effect');
relay(h,v);
test(h.vascularEffectSnapshot().acceptedTotal===1,'real Vascular applied effect relayed');
test(grave.receivedTotal===0,'unmounted Grave remains dormant');
test(grave.receiveFromHost(h)===1,'mounted Grave accepts verified Vascular effect');
test(grave.receivedTotal===1 && grave.memoryPressure>0,'local Grave memory pressure stored');
test(grave.snapshot().lastParentSiltReceiptId===`${SILT}:silt-trajectory:10`,'unbroken Silt lineage');
test(grave.snapshot().lastVascularEffectId===`${VASC}:membrane-load-applied:1`,'unbroken Vascular identity');
test(grave.snapshot().lastSubjectId==='silt-grain-03','Grave subject retains cause identity');
test(grave.snapshot().gameplayConsequenceApplied===false,'no premature Grave behavior');
test(grave.snapshot().materialTransfer===false,'no matter transfer');
const originalPressure=grave.memoryPressure;
test(grave.receiveFromHost(h)===0 && grave.memoryPressure===originalPressure,'repeat entry must not add pressure');
test(grave.replayedTotal===1,'replay counter observed');
h.observeSiltRelease(cause(11));relay(h,v);
test(grave.receiveFromHost(h)===1,'later new authenticated Vascular effect applied once');
test(grave.receivedTotal===2 && grave.memoryPressure>originalPressure,'different upstream history means different retained Grave memory');
test(grave.lastHostSequence===2,'Host cursor monotonic');
const siltStable=JSON.stringify(h.snapshot()), vascularStable=JSON.stringify(h.vascularEffectSnapshot());
grave.receiveFromHost(h);
test(JSON.stringify(h.snapshot())===siltStable && JSON.stringify(h.vascularEffectSnapshot())===vascularStable,'Grave read cannot change Host channels');
// Validate all history channels maintain bounded, immutable independent state.
const low=new GraveVascularEffectMemory({limit:2});
test(low.receiveFromHost(h)===2,'new Grave instance processes two retained effects');
test(low.records.length===2 && low.prunedTotal===0,'initial bounded history');
h.observeSiltRelease(cause(12));relay(h,v);low.receiveFromHost(h);
test(low.records.length===2 && low.prunedTotal===1,'Grave history capped independent of Host');
test(Object.isFrozen(low.records[0]) && Object.isFrozen(low.records[1]),'Grave receipts immutable');
const before=low.snapshot();
const validRecord=h.vascularEffectSnapshot().records.at(-1);
for(const [name,mut] of [
 ['owner',{sourceCellId:'FORGED'}],['kind',{kind:'wrong'}],['material',{materialTransfer:true}],
 ['parent',{parentSiltReceiptId:'forged'}],['amount',{appliedDelta:999}],
 ['nan',{membraneLoadAfter:NaN}],['negative',{appliedDelta:-1}],
 ['future',{sequence:999}]
]){
 const r={...validRecord,sequence:low.lastHostSequence+1,id:`${VASC}:membrane-load-applied:${validRecord.sourceEventSequence}`,...mut};
 test(low.receiveRecord(r)===null,`reject ${name}`);
}
test(low.memoryPressure===before.memoryPressure && low.receivedTotal===before.receivedTotal,'invalid cannot alter memory');
test(low.gapRejectedTotal===1,'missing Host sequence recognized');
const forgedView={forGrave:()=>({...h.forGrave(),mode:'unverified'})};
test(low.receiveFromHost(forgedView)===0,'reject unauthenticated channel');
test(low.receivedTotal===before.receivedTotal,'no forged channel update');
// Test actual Grave route source without installed Three dependency: isolate its
// class code and provide a minimal Vector3 for its constructor only. This is
// an owner-isolation smoke, NOT a 3D production browser test.
const graveSource=fs.readFileSync(path.join(root,'src/routes/GraveMemoryRouteSystem.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'src/core/GameRuntime.js'),'utf8');
test(runtime.includes('this.graveMemoryRouteSystem = new GraveMemoryRouteSystem({\n      hostConnectionReceiptLedger: this.hostConnectionReceiptLedger,'),'runtime injects authentic Host owner');
test(graveSource.includes('this.vascularEffectMemory.receiveFromHost(this.hostConnectionReceiptLedger);'),'mounted Grave updates its own memory');
test(graveSource.indexOf('if (!active) {\n      if (this.active) this.onRuntimeUnmount(frameState);\n      return;')<graveSource.indexOf('this.vascularEffectMemory.receiveFromHost(this.hostConnectionReceiptLedger);'),'off-route gate occurs before receive');
test(!graveSource.includes('this.hostConnectionReceiptLedger.observe'),'Grave never writes Host ledger');
const src=graveSource.replace(/^import.*$/gm,'').replace('export class GraveMemoryRouteSystem','class GraveMemoryRouteSystem')+'\nthis.GraveMemoryRouteSystem=GraveMemoryRouteSystem;';
class Vector3 { constructor(){this.x=0;this.y=0;this.z=0;} lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;} copy(p){this.x=p.x;this.y=p.y;this.z=p.z;return this;} distanceTo(){return 0;} }
const sandbox={THREE:{Vector3},GraveVascularEffectMemory};
vm.runInNewContext(src,sandbox,{filename:'GraveMemoryRouteSystem.js',timeout:1500});
const frame={activeCellId:GRAVE,physicalFeel:{}};
const route=new sandbox.GraveMemoryRouteSystem({recipeDataSystem:{},chemObjectSystem:{},scene:{},playerRoot:{position:new Vector3()},frameState:frame,hostConnectionReceiptLedger:h});
route.active=true;
route.applyPhysicalFeel=()=>{};
route.updateInteractions=()=>{};
route.updateVisualResponse=()=>{};
route.applyHostRhythmVisual=()=>{};
route.update(0.016,frame);
test(frame.graveVascularEffectMemory.receivedTotal===3,'actual Grave route mounted update consumes effects');
test(frame.graveVascularEffectMemory.active===true,'active snapshot exposed');
test(frame.graveMemoryRoute?.objectiveId==='grave_memory_read_and_stabilize','legacy objective remains');
test(frame.graveMemoryRoute?.progress===0 && frame.graveMemoryRoute?.completed===false,'legacy Grave not auto-completed');
const retained=frame.graveVascularEffectMemory.memoryPressure;
frame.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';
route.onRuntimeUnmount=(f)=>{route.active=false;route.publish(f,false);};
route.update(0.016,frame);
test(frame.graveVascularEffectMemory.active===false,'unmounted Grave snapshot is inactive');
h.observeSiltRelease(cause(13));relay(h,v);
route.update(0.016,frame);
test(route.vascularEffectMemory.receivedTotal===3,'off-route never consumes fresh effects');
frame.activeCellId=GRAVE;
route.onRuntimeMount=()=>{route.active=true;};
route.update(0.016,frame);
test(frame.graveVascularEffectMemory.receivedTotal===4,'reenter Grave receives only new effect');
test(frame.graveVascularEffectMemory.memoryPressure>=retained,'memory retained across remount');
test(frame.graveVascularEffectMemory.receivedTotal===route.vascularEffectMemory.lastHostSequence,'no duplicate remount');
test(frame.graveMemoryRoute?.returnFoldReady===false,'Grave fold remains controlled by existing owner');
const zeroFrame={activeCellId:GRAVE,physicalFeel:{}};
const empty=new sandbox.GraveMemoryRouteSystem({recipeDataSystem:{},chemObjectSystem:{},scene:{},playerRoot:{position:new Vector3()},frameState:zeroFrame,hostConnectionReceiptLedger:new HostConnectionReceiptLedger()});
empty.active=true;empty.applyPhysicalFeel=()=>{};empty.updateInteractions=()=>{};empty.updateVisualResponse=()=>{};empty.applyHostRhythmVisual=()=>{};
empty.update(0.016,zeroFrame);
test(zeroFrame.graveVascularEffectMemory.receivedTotal===0 && zeroFrame.graveMemoryRoute.completed===false,'clean path no ghost memories or completion');
console.log(JSON.stringify({pass:'C0D1-C',result:'OFFLINE_GRAVE_HOST_CHAIN_AND_MOUNT_GUARD_PASS',assertions:count,chain:'Silt -> Vascular applied effect -> Host authenticated relay -> Grave I memory',cleanGraveReceived:0,withCauseReceived:route.vascularEffectMemory.receivedTotal,offRouteConsumes:false,graveObjectivesChanged:false,limit:'No production Three.js/browser/camera verification; Grave II unmodified'},null,2));
