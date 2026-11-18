/** Stage 2B: real production GSL4E2B adapter + production OrbiterSystem; no LS1 producer simulation claim. */
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GSL4E2BReadOnlyAdapter } from './GSL4E2B_ReadOnlyAdapter.mjs';
import { OrbiterSystem } from './src/ecology/OrbiterSystem.js';
const checks=[];
function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});}}
const a=(active,detachReason='none')=>({playerAttachment:{active,detachReason}});
function sample(adapter,active,reason,t){const f=a(active,reason),before=JSON.stringify(f);const r=adapter.sample(f,t);assert.equal(JSON.stringify(f),before,'adapter mutated input');return r;}
check('B05 unexpected loss holds concern 1.8s then companion',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',10);assert.equal(sample(x,false,'surface_lost',10.1).mode,'concern');assert.equal(sample(x,false,'surface_lost',11.89).mode,'concern');assert.equal(sample(x,false,'surface_lost',11.9).mode,'companion');});
check('B05 recovery holds support 1.3s then companion',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'surface_lost',10);assert.equal(sample(x,true,'none',10.1).mode,'support');assert.equal(sample(x,true,'none',11.39).mode,'support');assert.equal(sample(x,true,'none',11.4).mode,'companion');});
check('B02 deliberate_away_input suppresses concern',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',10);const r=sample(x,false,'deliberate_away_input',10.1);assert.equal(r.event,'deliberate_release');assert.equal(r.mode,'companion');});
check('B09 rapid loss -> recovery -> loss transitions deterministically',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',1);assert.equal(sample(x,false,'surface_lost',1.1).mode,'concern');assert.equal(sample(x,true,'none',1.2).mode,'support');assert.equal(sample(x,false,'surface_lost',1.3).mode,'concern');assert.equal(sample(x,false,'none',1.4).mode,'concern');});
check('B09 stable attachment does not re-trigger event',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'none',1);assert.equal(sample(x,true,'none',1.1).event,'attachment_recovered');const until=x.supportUntil;for(let i=0;i<20;i++)sample(x,true,'none',1.2+i*.05);assert.equal(x.supportUntil,until);});
check('B09 missing reason never fabricates concern',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',1);const r=sample(x,false,'none',1.1);assert.equal(r.event,'unknown_release');assert.equal(r.mode,'companion');});
check('Adapter never mutates LS1 playerAttachment',()=>{const x=new GSL4E2BReadOnlyAdapter();for(const [v,r,t] of [[true,'none',1],[false,'surface_lost',2],[true,'none',3],[false,'deliberate_away_input',4]])sample(x,v,r,t);});
function fixture(){
 const playerRoot={position:new THREE.Vector3(0,0,0)};
 const frameState={runtimeSeconds:10,activeCellId:'LS1_SILT_TEST',playerAttachment:{active:true,detachReason:'none'},inspectionCamera:{active:false},input:{},cameraControl:{yaw:0},currentChemTarget:null};
 const s=new OrbiterSystem({recipeDataSystem:{},visualComposer:{},playerRoot,chemObjectSystem:{},localCellRecipe:{contents:{orbiters:[]}},frameState});
 s.gsl4e2cEnabled=true;s.findChemObject=()=>null;s.updateGuideFocusReadability=()=>{};s.updateShimmerLine=()=>{};
 const orbiter={recipe:{id:'guide_orbiter_folded_lantern_001'},root:{position:new THREE.Vector3(.8,.7,.5),rotation:{x:0,y:0,z:0},scale:new THREE.Vector3(1,1,1),userData:{}},baseScale:1,state:'idle',guideTarget:'none',pulseAge:999,lastReaction:'none',shimmerActive:false};
 function tick(t,active,reason='none'){frameState.runtimeSeconds=t;frameState.playerAttachment={active,detachReason:reason};frameState.gsl4e2bEnabled=s.gsl4e2cEnabled;s.updateGuide(orbiter,1/60,frameState);return frameState;}
 return {s,orbiter,frameState,tick};
}
const originalInfo=console.info;console.info=()=>{};
try{
 check('Real adapter -> Guide: unexpected loss concern',()=>{const f=fixture();f.tick(10,true);const r=f.tick(10.1,false,'surface_lost');assert.equal(r.guideInterpretation.intention,'concern');assert.equal(r.gsl4e2dDebug.finalOwner,'gsl_response');});
 check('Real adapter -> Guide: recovery support and timeout',()=>{const f=fixture();f.tick(10,false);assert.equal(f.tick(10.1,true).guideInterpretation.intention,'support');assert.equal(f.tick(11.41,true).guideInterpretation.intention,'companion');});
 check('Real adapter -> Guide: deliberate release neutral',()=>{const f=fixture();f.tick(10,true);const r=f.tick(10.1,false,'deliberate_away_input');assert.equal(r.guideInterpretation.event,'deliberate_release');assert.equal(r.guideInterpretation.intention,'companion');});
 check('Real adapter -> Guide: LS1 state not mutated',()=>{const f=fixture();f.tick(10,true);f.frameState.playerAttachment={active:false,detachReason:'surface_lost'};const before=JSON.stringify(f.frameState.playerAttachment);f.frameState.runtimeSeconds=10.1;f.frameState.gsl4e2bEnabled=true;f.s.updateGuide(f.orbiter,1/60,f.frameState);assert.equal(JSON.stringify(f.frameState.playerAttachment),before);});
}finally{console.info=originalInfo;}
const report={pass:'GSL-4E2G-STAGE2B',scope:'real production adapter and Guide consumer, controlled playerAttachment inputs (not LS1 producer)',checks,summary:{passed:checks.filter(x=>x.status==='PASS').length,failed:checks.filter(x=>x.status==='FAIL').length},notVerified:['actual LS1 attachment producer event semantics','browser rendering and human feel','explicit cooldown guarantee (adapter implements timed modes, not a separate cooldown)']};
console.log(JSON.stringify(report,null,2));if(report.summary.failed)process.exitCode=1;
