import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url));
const root=resolve(base,'..');
const m=JSON.parse(readFileSync(resolve(base,'MANIFEST.json'),'utf8'));
const deployed=resolve(root,'src/routes/ReturnRegionEngineSystem.js');
const sum=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(sum(deployed),m.installedSha256,'C0D3-A not installed or file diverged');
const [{ReturnRegionEngineSystem:Current},{ReturnRegionEngineSystem:Prior}]=await Promise.all([
  import(pathToFileURL(deployed).href),
  import(pathToFileURL(resolve(base,'reference/ReturnRegionEngineSystem_before.mjs')).href)
]);
let checks=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};const ok=(a,msg)=>{assert.ok(a,msg);checks++};
const memory=(p=.486)=>({active:true,owner:'GraveMemoryRouteSystem',cellId:'CELL_GRAVE_MEMORY_RESIDUE_BED_001',mode:'bounded_retained_vascular_effect_memory',receivedTotal:3,memoryPressure:p,lastVascularEffectId:'CELL_VASCULAR_RHYTHM_ROUTE_001:membrane-load-applied:3'});
const frame=(entries=2,inGrave=true,returned=true)=>({activeCellId:inGrave?'CELL_GRAVE_MEMORY_RESIDUE_BED_001':'CELL_SILT_PRESSURE_ROUTE_001',act1RouteHistory:{graveReturned:returned,graveMemoryImprintCommitted:returned,routeStates:{grave_memory_route:{entryCount:entries,returned},silt_burrow_route:{entryCount:1,returned:true},vascular_route:{entryCount:1,returned:true}}},corePerformance:{weights:{deep:.333,inner:.334,membrane:.333}},entityReciprocalMemory:{primary:{strength01:.25}},reactiveStateGrammar:{focus:{condition01:.3}},verbComposition:{chord:'idle'},graveVascularEffectMemory:memory()});
const compare=(f,route='grave')=>{const before=new Prior({frameState:f}).layoutFor(route,f),after=new Current({frameState:f}).layoutFor(route,f);const {c0d3GraveIIHostMemory,...inputs}=after.inputs;eq({...after,inputs},before,`unchanged ${route} legacy numeric layout`);eq(c0d3GraveIIHostMemory.applied,false);};
compare(frame(1));compare(frame(2,false));compare(frame(2,true,false));compare(frame(),'silt');compare(frame(),'vascular');
for(const mutate of [m=>{m.active=false},m=>{m.owner='fake'},m=>{m.memoryPressure=NaN},m=>{m.receivedTotal=0},m=>{m.lastVascularEffectId='forged'}]){const f=frame();mutate(f.graveVascularEffectMemory);compare(f);}
for(let i=0;i<=100;i++) {
 const f=frame();f.graveVascularEffectMemory=memory(i/100);
 const p=new Prior({frameState:f}).layoutFor('grave',f),q=new Current({frameState:f}).layoutFor('grave',f);
 eq(q.inputs.c0d3GraveIIHostMemory.applied,true);
 ok(q.outputs.resonance01>=p.outputs.resonance01,'nonnegative coupling');ok(q.outputs.resonance01<=1,'bounded');
 eq(q.octave.octavePhaseCount,p.octave.octavePhaseCount);
 eq(q.octave.octaveRatio,p.octave.octaveRatio);
 eq(q.octave.fundamentalPhaseCount,p.octave.fundamentalPhaseCount);
 eq(q.inputs.c0d3GraveIIHostMemory.resonanceContribution01,Number((i/100*.15).toFixed(3)));
}
const f=frame();const sys=new Current({frameState:f});sys.init();sys.update(.016,f);eq(f.returnRegionEngine.creditCount,1);eq(f.returnRegionEngine.phase2.grave,false);eq(f.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory.inheritedPressure01,.486);
console.log(JSON.stringify({pass:'C0D3-A',result:'GRAVE_II_EXISTING_LAYOUT_MEMORY_COUPLING_PASS',assertions:checks,changedGameplayFiles:1,windowsBuild:'pending',browserAcceptance:'pending'},null,2));
