/** GSL-4E2G Stage 2A-R: deterministic production OrbiterSystem integration checks.
 * Run from BLOB repo root: node ./GSL4E2G_RUNTIME.mjs
 * Requires existing repo dependencies; makes no source changes.
 * Injected adapter responses deliberately isolate Guide integration from LS1 adapter correctness.
 */
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OrbiterSystem } from './src/ecology/OrbiterSystem.js';

const guideId='guide_orbiter_folded_lantern_001';
const cases=[];
function test(name, fn){try{fn();cases.push({name,status:'PASS'});}catch(e){cases.push({name,status:'FAIL',error:e.stack||String(e)});}}
function fixture({enabled=true,mode='companion',event='none',active=true,reason='none',coreWork=false,pulseAge=999,authored=false}={}){
  const playerRoot={position:new THREE.Vector3(0,0,0)};
  const frameState={runtimeSeconds:10,activeCellId:'LS1_SILT_TEST',playerAttachment:{active,detachReason:reason},
    inspectionCamera:coreWork?{active:true,coreWorkActive:true}:{active:false},
    input:{},cameraControl:{yaw:0},currentChemTarget:null};
  const s=new OrbiterSystem({recipeDataSystem:{},visualComposer:{},playerRoot,chemObjectSystem:{},localCellRecipe:{contents:{orbiters:[]}},frameState});
  // The injected adapter is a controlled seam. The real LS1 adapter is NOT under test.
  s.gsl4e2cEnabled=enabled;
  s.gsl4e2b={sample:()=>({mode,event,active,reason})};
  s.findChemObject=()=>null;
  s.updateGuideFocusReadability=()=>{};
  s.updateShimmerLine=()=>{};
  const orbiter={recipe:{id:guideId},root:{position:new THREE.Vector3(0.8,0.7,0.5),rotation:{x:0,y:0,z:0},scale:new THREE.Vector3(1,1,1),userData:{}},baseScale:1,state:'idle',guideTarget:'none',pulseAge,lastReaction:'none',shimmerActive:false};
  if(authored){frameState.activeCellId='CELL_GRAVE_MEMORY_RESIDUE_BED_001';frameState.graveMemoryRoute={active:true,currentFocus:'grave_memory_consequence'};}
  function tick(dt=1/60){frameState.gsl4e2bEnabled=s.gsl4e2cEnabled;s.updateGuide(orbiter,dt,frameState);frameState.runtimeSeconds+=dt;return frameState;}
  return {s,orbiter,frameState,tick};
}
const has=(a,b)=>assert.equal(a,b);

test('B01 attached neutral -> companion, no GSL takeover',()=>{const f=fixture();f.tick();has(f.frameState.guideInterpretation.intention,'companion');has(f.frameState.gsl4e2dDebug.applied,false);});
test('B02 deliberate release -> no fabricated concern',()=>{const f=fixture({event:'deliberate_release',active:false,reason:'deliberate_release'});f.tick();has(f.frameState.guideInterpretation.event,'deliberate_release');has(f.frameState.guideInterpretation.intention,'companion');});
test('B03 unexpected loss -> concern when companion owns movement',()=>{const f=fixture({mode:'concern',event:'unexpected_loss',active:false,reason:'unexpected_loss'});f.tick();has(f.frameState.guideInterpretation.intention,'concern');has(f.frameState.gsl4e2dDebug.applied,true);has(f.frameState.gsl4e2eDebug.expressionMode,'concern');});
test('B04 recovery -> support when companion owns movement',()=>{const f=fixture({mode:'support',event:'attachment_recovered'});f.tick();has(f.frameState.guideInterpretation.intention,'support');has(f.frameState.gsl4e2dDebug.applied,true);has(f.frameState.gsl4e2eDebug.expressionMode,'support');});
test('B06 Core Work -> movement preserved and expression suppressed',()=>{const f=fixture({mode:'concern',event:'unexpected_loss',coreWork:true});f.tick();has(f.frameState.guideInterpretation.expressionAllowed,false);has(f.frameState.guideInterpretation.expressionSuppression,'core_work_protected');has(f.frameState.gsl4e2dDebug.applied,false);has(f.orbiter.state,'guide_attending_core_work');});
test('B07 authored Guide target retains movement',()=>{const f=fixture({mode:'concern',event:'unexpected_loss',authored:true});f.tick();has(f.frameState.gsl4e2dDebug.applied,false);has(f.frameState.gsl4e2dDebug.finalOwner,'authored_guide');has(f.orbiter.state,'interpreting_grave_memory_from_clear_perch');});
test('B07 pulse overrides GSL movement',()=>{const f=fixture({mode:'concern',event:'unexpected_loss',pulseAge:0});f.tick();has(f.frameState.gsl4e2dDebug.applied,false);has(f.frameState.gsl4e2dDebug.finalOwner,'pulse_response');has(f.orbiter.state,'answering_player_pulse');});
test('B08 GSL disabled -> original Guide and no expression',()=>{const f=fixture({enabled:false,mode:'concern',event:'unexpected_loss'});f.tick();has(f.frameState.guideInterpretation.enabled,false);has(f.frameState.guideInterpretation.expressionAllowed,false);has(f.frameState.gsl4e2eDebug.expressionApplied,false);has(f.orbiter.state,'hover_slightly_ahead');});
test('B08 disabled after active expression -> smooth decay',()=>{const f=fixture({mode:'concern',event:'unexpected_loss'});for(let i=0;i<15;i++)f.tick();const before=Math.abs(f.orbiter.gsl4e2eExpression);f.s.gsl4e2cEnabled=false;for(let i=0;i<15;i++)f.tick();assert.ok(Math.abs(f.orbiter.gsl4e2eExpression)<before);has(f.frameState.guideInterpretation.expressionAllowed,false);});
test('B10 repeated identical input -> stable owner and finite expression',()=>{const f=fixture({mode:'support',event:'attachment_recovered'});for(let i=0;i<180;i++){f.tick();has(f.frameState.gsl4e2dDebug.finalOwner,'gsl_response');assert.ok(Number.isFinite(f.orbiter.gsl4e2eExpression));}assert.ok(f.orbiter.gsl4e2eExpression<0);});
test('Guide integration never mutates LS1 attachment',()=>{const f=fixture({mode:'concern',event:'unexpected_loss'});const before=JSON.stringify(f.frameState.playerAttachment);for(let i=0;i<20;i++)f.tick();has(JSON.stringify(f.frameState.playerAttachment),before);});

const report={pass:'GSL-4E2G-STAGE2A-R',scope:'production OrbiterSystem, controlled adapter responses; not production LS1 adapter',checks:cases,summary:{passed:cases.filter(c=>c.status==='PASS').length,failed:cases.filter(c=>c.status==='FAIL').length},notVerified:['B05 real adapter recovery timeout','B09 real adapter rapid-event cooldown','LS1 attachment producer -> real GSL4E2B adapter end-to-end','visual rendering and human feel']};
console.log(JSON.stringify(report,null,2));
if(report.summary.failed)process.exitCode=1;
