import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {HostConnectionReceiptLedger} from '../src/core/HostConnectionReceiptLedger.js';
import {GraveResonanceGameplaySystem} from '../src/routes/GraveResonanceGameplaySystem.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(resolve(root,'BLOB_C0D3C_DELTA/MANIFEST.json'),'utf8'));
const source=readFileSync(resolve(root,'src/routes/SiltPressureRouteSystem.js'),'utf8');
const sha=x=>createHash('sha256').update(x).digest('hex');
assert.equal(sha(source),manifest.expectedFiles['src/routes/SiltPressureRouteSystem.js'].afterSha256);
// Evaluate the actual class method bodies without requiring the browser's THREE
// renderer. No constructor or scene objects are used in this isolated test.
const stripped=source.replace(/^import\s+.*;\s*$/gm,'').replace('export class SiltPressureRouteSystem','class SiltPressureRouteSystem');
const Silt=new Function(`${stripped}\nreturn SiltPressureRouteSystem;`)();
let count=1, outcomes=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++};
const ok=(a,m)=>{assert.ok(a,m);count++};
const SILT='CELL_SILT_PRESSURE_ROUTE_001',GRAVE='CELL_GRAVE_MEMORY_RESIDUE_BED_001';
function makeResolution(band=0.55,upstream=false){
 const host=new HostConnectionReceiptLedger({limit:64});
 const state={frame:11,activeCellId:GRAVE,act1RouteHistory:{graveReturned:true,graveEntryCount:2,
  routeStates:{grave_memory_route:{entryCount:2,returned:true}}},
  graveReturnRegion:{active:true,octave:{resonance01:0.5}},returnRegionEngine:{graveLayout:{inputs:{c0d3GraveIIHostMemory:{applied:false}}}},
  input:{},targeting:{},verbComposition:{},reactiveStateGrammar:{}};
 if(upstream){
  const s=host.observeSiltRelease({kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',
   noMaterialTransfer:true,progressionCredit:false,unitId:'silt-grain-01',sequence:1,position:[0,0,0],velocity:[1,0,0],siltElapsedSeconds:0.2});
  ok(s,'Silt parent');const d=0.14+0.055/2.5;
  const e=host.observeVascularAppliedEffect({schemaVersion:1,kind:'vascular_membrane_load_change_applied',
   sourceCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001',sourceSystem:'VascularSiltSignalReceiver',
   id:'CELL_VASCULAR_RHYTHM_ROUTE_001:membrane-load-applied:1',sequence:1,materialTransfer:false,routeCredit:false,
   offRouteSimulation:false,parentSiltReceiptSequence:s.sequence,parentSiltReceiptId:s.id,parentSiltDecisionSequence:1,
   subjectId:'silt-grain-01',membraneLoadBefore:0,membraneLoadAfter:d,appliedDelta:d});
  ok(e,'Vascular effect');
  state.graveVascularEffectMemory={active:true,owner:'GraveMemoryRouteSystem',cellId:GRAVE,receivedTotal:1,memoryPressure:d,lastVascularEffectId:e.id};
  state.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory.applied=true;
 }
 const returnOwner={frameState:state,active:true,knots:new Map(),strata:[]};
 const owner=new GraveResonanceGameplaySystem({frameState:state,chemObjectSystem:{objects:[]},graveReturnRegionSystem:returnOwner,hostConnectionReceiptLedger:host});
 owner.init();owner.update(0.08,state);
 owner.interactionCount=3;owner.touchedNodes.add('retainedDraw');owner.touchedNodes.add('coherentPush');
 for(const n of owner.nodes.values())n.level01=band;
 for(let i=0;i<40&&!owner.completed;i++){state.frame++;owner.update(0.08,state)}
 ok(owner.completed,'actual Grave II owner completion');
 const snap=host.graveIIResolutionSnapshot();eq(snap.acceptedTotal,1,'one authentic Host receipt');
 eq(snap.records.length,1,'one retained record');
 return {host,state,owner,snap};
}
function silt(host,active=true){
 const instance=Object.create(Silt.prototype);
 Object.assign(instance,{active,frameState:{activeCellId:active?SILT:GRAVE},hostConnectionReceiptLedger:host,
  graveIIConsumedSequence:0,graveIIReceiptId:null,graveIIResolutionId:null,
  graveIIInheritedVascularMemory:false,graveIIPressureEcho:0,completed:true,ribsReleased:true});
 return instance;
}
// Identity and strict parity with the legacy target when there is no receipt.
{
 const s=silt(new HostConnectionReceiptLedger());
 eq(s.pressureSettlingTarget(),0.1,'no-history completed Silt target');
 s.completed=false;s.ribsReleased=true;eq(s.pressureSettlingTarget(),0.28,'open ribs unchanged');
 s.ribsReleased=false;eq(s.pressureSettlingTarget(),0.62,'compressed ribs unchanged');
 eq(s.receiveGraveIIHostOutcome(),false,'no history creates no effect');
 eq(s.graveIIPressureEcho,0,'no history echo zero');
}
const cases=[['quiet_retention',0.38,0.018],['shared_memory',0.55,0.028],['held_contradiction',0.74,0.04]];
for(const [id,band,weight] of cases){
 const {host,snap}=makeResolution(band,id==='shared_memory');outcomes++;
 eq(snap.records[0].resolutionId,id,'real Grave II completion band');
 const s=silt(host,false);
 eq(s.receiveGraveIIHostOutcome(),false,'no off-route consumption');
 eq(s.graveIIConsumedSequence,0,'cursor remains zero off-route');
 s.active=true;s.frameState.activeCellId=SILT;
 eq(s.receiveGraveIIHostOutcome(),true,'on route consumes actual Host outcome');
 eq(s.graveIIReceiptId,snap.records[0].id,'exact authenticated receipt');
 eq(s.graveIIPressureEcho,weight,'resolution category fixes bounded echo');
 eq(s.pressureSettlingTarget(),0.1-weight,'post-completion compressed passage settles lower');
 ok(s.pressureSettlingTarget()>=0.06,'floor preserved');
 eq(s.graveIIInheritedVascularMemory,id==='shared_memory','optional valid parent accurately represented');
 const oldSeq=s.graveIIConsumedSequence;
 for(let i=0;i<100;i++){eq(s.receiveGraveIIHostOutcome(),false,'no frame recredit');}
 eq(s.graveIIConsumedSequence,oldSeq,'no duplicate sequence');
 eq(s.graveIIPressureEcho,weight,'no runaway');
 // Remount cannot recredit or lose first receipt.
 s.active=false;s.frameState.activeCellId=GRAVE;
 eq(s.receiveGraveIIHostOutcome(),false,'unmounted guard');
 s.active=true;s.frameState.activeCellId=SILT;
 eq(s.receiveGraveIIHostOutcome(),false,'remount guard');
 eq(s.pressureSettlingTarget(),0.1-weight,'remount retains pressure memory');
 s.completed=false;s.ribsReleased=false;eq(s.pressureSettlingTarget(),0.62,'incomplete route still uses original pressure');
 s.ribsReleased=true;eq(s.pressureSettlingTarget(),0.28,'ribs unchanged when incomplete');
}
// Early, forged, and first-visit states must not produce a Host receipt.
{
 const host=new HostConnectionReceiptLedger(); const s=silt(host);
 eq(s.receiveGraveIIHostOutcome(),false,'No actual completion leaves Silt unchanged');
 eq(host.graveIIResolutionSnapshot().acceptedTotal,0,'No fake Host receipt');
}
// The only settling edit is the target; original exponential update remains intact.
ok(source.includes('this.compression += (targetCompression - this.compression) * settleRate;'),'existing smoothing untouched');
ok(source.includes('const settleRate = 1 - Math.exp(-dt * 1.7);'),'existing rate untouched');
console.log(JSON.stringify({pass:'C0D3-C',status:'OFFLINE_GRAVE_II_TO_SILT_PRESSURE_FEEDBACK_PASS',
 assertions:count,actualGraveIIResolutions:outcomes,grantedTwice:0,changedGameplayFiles:1,
 limitation:'Actual browser/Three.js scene and Windows Vite build require user verification'},null,2));
