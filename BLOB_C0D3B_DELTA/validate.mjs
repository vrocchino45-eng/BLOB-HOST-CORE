import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url)),root=resolve(base,'..');
const m=JSON.parse(readFileSync(resolve(base,'MANIFEST.json'),'utf8'));
const sum=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
for (const rel of m.changedGameplayFiles){assert.equal(sum(resolve(root,rel)),m.expectedFiles[rel].afterSha256,'C0D3-B not installed: '+rel);}

import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { GraveResonanceGameplaySystem } from '../src/routes/GraveResonanceGameplaySystem.js';
import { ReturnRegionEngineSystem } from '../src/routes/ReturnRegionEngineSystem.js';
let assertions=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m); assertions++};
const good=(v,m)=>{assert.ok(v,m); assertions++};
const SILT='CELL_SILT_PRESSURE_ROUTE_001', VASC='CELL_VASCULAR_RHYTHM_ROUTE_001', GRAVE='CELL_GRAVE_MEMORY_RESIDUE_BED_001';
function make({validReturn=true, upstream=false}={}) {
 const host = new HostConnectionReceiptLedger({limit:2});
 const state = {
  frame: 100, activeCellId: GRAVE, runtimeSeconds: 5,
  act1RouteHistory: {graveReturned:validReturn, graveEntryCount:validReturn?2:1,
   routeStates: {grave_memory_route: {entryCount:validReturn?2:1, returned:validReturn}}},
  graveReturnRegion: {active:validReturn, octave: {resonance01:0.5}},
  returnRegionEngine: {graveLayout: {inputs: {c0d3GraveIIHostMemory: {applied: false}}}},
  input: {}, targeting: {}, verbComposition: {}, reactiveStateGrammar: {},
 };
 if(upstream){
  const grain=host.observeSiltRelease({kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',noMaterialTransfer:true,progressionCredit:false,unitId:'silt-grain-01',sequence:1,position:[0,0,0],velocity:[1,0,0],siltElapsedSeconds:0.2});
  good(grain,'silt accepted');
  const delta=0.14+0.055*(1/2.5);
  const e=host.observeVascularAppliedEffect({schemaVersion:1,kind:'vascular_membrane_load_change_applied',sourceCellId:VASC,sourceSystem:'VascularSiltSignalReceiver',id:`${VASC}:membrane-load-applied:1`,sequence:1,materialTransfer:false,routeCredit:false,offRouteSimulation:false,parentSiltReceiptSequence:grain.sequence,parentSiltReceiptId:grain.id,parentSiltDecisionSequence:1,subjectId:'silt-grain-01',membraneLoadBefore:0,membraneLoadAfter:delta,appliedDelta:delta});
  good(e,'vascular applied effect accepted');
  state.graveVascularEffectMemory = {active:true,owner:'GraveMemoryRouteSystem',cellId:GRAVE,receivedTotal:1,memoryPressure:delta,lastVascularEffectId:e.id};
  state.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory.applied=true;
 }
 const graveReturn={frameState:state,active:validReturn,knots:new Map(),strata:[]};
 const source=new GraveResonanceGameplaySystem({frameState:state,chemObjectSystem:{objects:[]},graveReturnRegionSystem:graveReturn,hostConnectionReceiptLedger:host});
 source.init();
 source.update(0.08,state);
 // Mimics a player reaching one of the three pre-existing valid resolution bands
 // after affecting at least two distinct landmarks through existing verbs.
 source.interactionCount=3;
 source.touchedNodes.add('retainedDraw'); source.touchedNodes.add('coherentPush');
 for(const node of source.nodes.values()) node.level01=0.55;
 return {host,state,source,graveReturn};
}
// Actual owner update must generate the completion, not an injected frame object.
for(const upstream of [false,true]){
 const {host,state,source,graveReturn}=make({upstream});
 const oldSilt=JSON.stringify(host.snapshot()), oldVascular=JSON.stringify(host.vascularEffectSnapshot());
 for(let i=0;i<30 && !source.completed;i++){state.frame++;source.update(0.08,state)}
 good(source.completed,'real Grave II resolution achieved');
 eq(state.returnRegionCompletionEvent.key,'grave:phase_2');
 eq(state.returnRegionCompletionEvent.resolutionId,'shared_memory');
 const view=host.graveIIResolutionSnapshot(); eq(view.acceptedTotal,1);
 eq(view.records[0].sourceSystem,'GraveResonanceGameplaySystem');
 eq(view.records[0].inheritedVascularMemory,upstream);
 eq(view.records[0].parentVascularEffectId,upstream?`${VASC}:membrane-load-applied:1`:null);
 eq(view.records[0].routeCredit,false);eq(view.records[0].materialTransfer,false);eq(view.records[0].offRouteSimulation,false);
 eq(JSON.stringify(host.snapshot()),oldSilt,'old Silt snapshot unchanged');
 eq(JSON.stringify(host.vascularEffectSnapshot()),oldVascular,'old Vascular snapshot unchanged');
 const returnEngine=new ReturnRegionEngineSystem({frameState:state});
 returnEngine.consumeCompletionEvent(state.returnRegionCompletionEvent);
 eq(returnEngine.secondPhaseCompleted.grave,true,'existing credit path still owns credits');
 eq(host.graveIIResolutionSnapshot().records.length,1);
 eq(host.observeGraveIIResolution(state.returnRegionCompletionEvent,{source,frameState:state}),null,'duplicate refused');
 eq(host.graveIIResolutionSnapshot().acceptedTotal,1);
 eq(host.graveIIResolutionSnapshot({afterSequence:1}).records.length,0);
 // No repeat on a subsequent frame / region remount
 state.frame++; source.update(0.08,state);
 eq(host.graveIIResolutionSnapshot().acceptedTotal,1);
 state.activeCellId='CELL_SILT_PRESSURE_ROUTE_001';graveReturn.active=false;state.graveReturnRegion.active=false;
 state.frame++;source.update(0.08,state);eq(host.graveIIResolutionSnapshot().acceptedTotal,1);
}
// A fake event without Grave II owner's actual resolved state must be rejected.
{
 const {host,state,source}=make();
 state.returnRegionCompletionEvent={pass:'HC-031B',sequence:1,key:'grave:phase_2',routeKey:'grave',phase:2,resolutionId:'shared_memory',source:'GraveResonanceGameplaySystem',frame:100};
 eq(host.observeGraveIIResolution(state.returnRegionCompletionEvent,{source,frameState:state}),null,'forged completion rejected');
 eq(host.graveIIResolutionSnapshot().acceptedTotal,0);
}
// Returning geometry by itself is not completion.
{
 const {host,state,source}=make({validReturn:true});
 eq(host.graveIIResolutionSnapshot().acceptedTotal,0);
 eq(state.graveReturnRegion.active,true);
}
// First visit and off-route cannot issue Host outcome, even if owner is faked complete.
for(const scenario of ['firstVisit','offRoute','wrongPhase','wrongSequence','wrongFrame','wrongSource','wrongOwner','shortHold']){
 const {host,state,source,graveReturn}=make({validReturn:true});
 source.completed=true;source.completionSequence=1;source.resolutionId='shared_memory';source.resolutionHold=1.7;
 source.interactionCount=3;source.touchedNodes.add('retainedDraw');source.touchedNodes.add('coherentPush');
 state.returnRegionCompletionEvent={pass:'HC-031B',sequence:1,key:'grave:phase_2',routeKey:'grave',phase:2,resolutionId:'shared_memory',source:'GraveResonanceGameplaySystem',frame:state.frame};
 if(scenario==='firstVisit'){state.act1RouteHistory.graveEntryCount=1;state.act1RouteHistory.routeStates.grave_memory_route.entryCount=1;}
 if(scenario==='offRoute') state.activeCellId='CELL_SILT_PRESSURE_ROUTE_001';
 if(scenario==='wrongPhase') state.returnRegionCompletionEvent.phase=3;
 if(scenario==='wrongSequence') state.returnRegionCompletionEvent.sequence=2;
 if(scenario==='wrongFrame') state.returnRegionCompletionEvent.frame=99;
 if(scenario==='wrongSource') state.returnRegionCompletionEvent.source='fake';
 if(scenario==='wrongOwner') graveReturn.active=false;
 if(scenario==='shortHold') source.resolutionHold=0.3;
 eq(host.observeGraveIIResolution(state.returnRegionCompletionEvent,{source,frameState:state}),null,`${scenario} rejected`);
 eq(host.graveIIResolutionSnapshot().acceptedTotal,0);
}
// Gap and buffer protections for ledger without touching legacy channels.
{
 const host=new HostConnectionReceiptLedger({limit:1});
 eq(host.graveIIResolutionSnapshot().retainedCount,0);eq(host.graveIIResolutionSnapshot().persistsAcrossReload,false);
}
console.log(JSON.stringify({pass:'C0D3-B',status:'OFFLINE_GRAVE_II_COMPLETION_RELAY_PASS',assertions, upstreamScenarios:2,invalidScenarios:8},null,2));
