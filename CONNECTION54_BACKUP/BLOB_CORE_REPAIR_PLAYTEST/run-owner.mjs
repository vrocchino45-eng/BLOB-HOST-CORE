// CONNECTION45: reviewed earned circulation changes; these prior repair fixtures carry no earned history.
// The same paired repair matrix checks unearned defaults; earned recovery is verified by Y01/T02.
import fs from 'node:fs';
import {ReactiveStateGrammarSystem as Before} from './BASE_CONNECTION36_Reactive.mjs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {sourceIdentity} from '../BLOB_BOT_SERIES1/source-identity.mjs';
import {CoreEmbodimentSystem as Embodiment} from '../src/player/CoreEmbodimentSystem.js';
import {CoreRadialPerformanceSystem as Radial} from '../src/player/CoreRadialPerformanceSystem.js';
import {ReactiveStateGrammarSystem as Reactive} from '../src/interaction/ReactiveStateGrammarSystem.js';
import {CoreVerbPhysicalizationSystem as Rings} from '../src/player/CoreVerbPhysicalizationSystem.js';
import {SURFACE_MATERIAL_RESPONSE_SCOPE as scope} from '../src/interaction/MaterialResponseScope.js';
import {LocalChemistryContextSystem as Context} from '../src/chemistry/LocalChemistryContextSystem.js';
import {SystemRegistry} from '../src/core/SystemRegistry.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const identity=sourceIdentity(root);
assert.equal(identity.fingerprint,'e82c1a36827bf92568c2263f0983015a4a65af98c86f75192469fd3ba1f6d0c7');
const read=p=>JSON.parse(fs.readFileSync(new URL('../public/data/'+p,import.meta.url)));
const recipes=read('chemistry/chemObjectRecipes.json'),cells=read('world/localCellRecipes.json'),host=read('hosts/HOST_ALPHA_WOUNDED_NURSERY.json');
const scene=new THREE.Scene(),body=new THREE.Group();
const classifier=new Embodiment({scene,playerRoot:body,frameState:{}});
const families=['grave_memory_retention','vascular_rhythm_retention','silt_pressure_retention'];
const zones=['deep_core','inner_body','membrane'],depths=[.14,.43,.80];
function layout(indices){
  const counts={deep_core:0,inner_body:0,membrane:0},placements=[];
  indices.forEach((index,i)=>{
    const piece=new THREE.Group();piece.userData.coreWorkAnchorLocal=new THREE.Vector3();
    piece.userData.coreWorkFamily=families[i];
    piece.position.set(classifier.coreWorkMinimumRadius+depths[index]*(classifier.coreWorkMaximumRadius-classifier.coreWorkMinimumRadius),0,0);
    const zone=classifier.getSpatialChemistryZone(piece);
    assert.equal(zone.zoneId,zones[index]);counts[zone.zoneId]++;
    const interaction=classifier.getSpatialChemistryInteraction(piece,zone.zoneId);
    placements.push({family:families[i],zoneId:zone.zoneId,radius:zone.radius,depth01:zone.depth01,interactionId:interaction.id});
  });
  return {placements,counts,retainedPieceCount:indices.length,topology:classifier.getWholeCoreTopology(counts,indices.length)};
}
const layouts=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)layouts.push(layout([a,b,c]));
function fixture(chemistry,reserve,enabled=false,Class=Reactive){
  const scene=new THREE.Scene(),player=new THREE.Group(),target=new THREE.Group();scene.add(player,target);
  const item={recipe:recipes.find(x=>x.id==='scar_contamination_plate_001'),root:target,cellId:scope.cellId,absorbed:false};
  const f={frame:0,runtimeSeconds:0,activeHostId:host.id,activeCellId:scope.cellId,input:{stabilizeHeld:true},
    spatialCoreChemistry:structuredClone(chemistry),returnRegionEngine:{unlockedPhaseCount:3},
    targeting:{relationshipActive:true,relationshipTargetId:item.recipe.id},
    verbComposition:{relationshipBound:true,targetId:item.recipe.id,chord:'cohere',effects:{}},
    firstSliceRuntimeMount:{activeSystemIds:['reactive']},chemObjectState:{},playerComposition:{form:.32,flux:.21,seed:.36}};
  const chem={objects:[item]},data={get:(group,id)=>group==='hosts'?host:cells.find(x=>x.id===id)};
  const context=new Context({recipeDataSystem:data,frameState:f}),radial=new Radial({frameState:f,playerRoot:player});
  const reactive=new Class({frameState:f,chemObjectSystem:chem,scope,repairTrialEnabled:enabled===true}),rings=new Rings({scene,playerRoot:player,chemObjectSystem:chem,frameState:f});
  const registry=new SystemRegistry();registry.register('context',context);
  registry.register('targetingSystem',{update(){}});registry.register('verbCompositionSystem',{update(){}});
  registry.register('reactive',reactive,{runtimeScope:'active_region',lazyInit:true,settleOnDeactivate:true});
  registry.register('radial',radial);radial.reserve01=reserve;
  // Give the first publication its requested reserve without elapsed demand.
  radial.publish(f,radial.resolveProfile(f));
  const tick=dt=>{f.frame++;f.runtimeSeconds+=dt;registry.update(dt,f);rings.updateStabilize(dt,f);};
  tick(0);reactive.states.get(item.recipe.id).condition01=.9;
  return {f,radial,reactive,rings,tick,registry,dispose(){rings.group.traverse(n=>{n.geometry?.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])m?.dispose();});}};
}
const rows=[],oldRandom=Math.random;Math.random=()=>1;
try{
  for(const chemistry of layouts)for(const reserve of [1,.5,.05])for(const dt of [1/60,1/30,.05])for(const enabled of [false,true]){
    const x=fixture(chemistry,reserve,enabled),start=x.f.corePerformance.verbModifiers.stabilize.coherenceMultiplier;
    let elapsed=0,acquisitionAt=null,coherentAt=null;
    while(elapsed<6){
      x.tick(dt);elapsed+=dt;
      if(acquisitionAt===null&&x.rings.stabilizeProgress>=.999999)acquisitionAt=elapsed;
      if(x.f.reactiveStateGrammar.objects.scar_contamination_plate_001.condition01<=.30){coherentAt=elapsed;break;}
    }
    rows.push({enabled,placement:chemistry.placements.map(x=>x.zoneId),distribution:chemistry.topology.distribution,
      initialReserve:reserve,acceptedStepSeconds:dt,startCoherenceMultiplier:start,
      finalCoherenceMultiplier:x.f.corePerformance.verbModifiers.stabilize.coherenceMultiplier,
      ringAcquisitionAtSeconds:acquisitionAt,materialCoherentAtSeconds:coherentAt,
      finalReserve:x.radial.reserve01,materialCondition:x.f.reactiveStateGrammar.focus.condition01,
      ringAlignment:x.rings.stabilizeAlignment01,earnedPhaseCeiling:x.f.returnRegionEngine.unlockedPhaseCount});
    x.dispose();
  }
}finally{Math.random=oldRandom;}
const checks=[],check=(name,fn)=>{try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack)});}};
check('486 runs form 243 completed baseline/candidate pairs',()=>{assert.equal(rows.length,486);assert.ok(rows.every(x=>x.materialCoherentAtSeconds>0));});
check('Production repair stays identical across topology/reserve at each accepted step size',()=>{for(const dt of [1/60,1/30,.05])assert.equal(new Set(rows.filter(x=>!x.enabled&&x.acceptedStepSeconds===dt).map(x=>x.materialCoherentAtSeconds)).size,1);});
check('Candidate deep repair is faster and membrane repair slower at fresh reserve',()=>{for(const dt of [1/60,1/30,.05])for(const [distribution,faster] of [['3:0:0',true],['0:0:3',false]]){const a=rows.find(x=>!x.enabled&&x.distribution===distribution&&x.initialReserve===1&&x.acceptedStepSeconds===dt),b=rows.find(x=>x.enabled&&x.distribution===distribution&&x.initialReserve===1&&x.acceptedStepSeconds===dt);assert.ok(faster?b.materialCoherentAtSeconds<a.materialCoherentAtSeconds:b.materialCoherentAtSeconds>a.materialCoherentAtSeconds);}});
check('Reserve stays bounded and no phase credit is minted',()=>{assert.ok(rows.every(x=>x.finalReserve>=0&&x.finalReserve<=x.initialReserve&&x.earnedPhaseCeiling===3));});
check('Incomplete anatomy gets exact baseline repair',()=>{for(const indices of [[0],[0,2]]){const a=fixture(layout(indices),1),b=fixture(layout(indices),1,true);for(let i=0;i<90;i++){a.tick(1/60);b.tick(1/60);assert.equal(a.reactive.states.get(scope.objectIds[0]).condition01,b.reactive.states.get(scope.objectIds[0]).condition01);}assert.equal(b.reactive.lastRepairFactor,1);a.dispose();b.dispose();}});
check('Default-off candidate preserves the complete existing frame output',()=>{const a=fixture(layout([0,0,0]),1,false,Before),b=fixture(layout([0,0,0]),1);assert.equal(b.reactive.repairTrialEnabled,false);assert.throws(()=>b.reactive.repairTrialEnabled=true);for(let i=0;i<90;i++){a.tick(1/60);b.tick(1/60);const af=structuredClone(a.f),bf=structuredClone(b.f);delete af.runtimeExecution;delete bf.runtimeExecution;assert.deepEqual(af,bf);}a.dispose();b.dispose();});
for(const mode of ['inspection','work','transition','wrong cell'])check('Existing scope suspends candidate under '+mode,()=>{const x=fixture(layout([0,0,0]),1,true),s=x.reactive.states.get(scope.objectIds[0]),start=s.condition01;if(mode==='inspection')x.f.inspectionCamera={active:true};if(mode==='work')x.f.tightInspectionCamera={coreWorkActive:true};if(mode==='transition')x.f.localCellBoundaryMorph={active:true};if(mode==='held placement')x.f.coreWorkManipulation={held:true};if(mode==='wrong cell')x.f.activeCellId='CELL_SCAR_FLOW_FOLD_001';x.tick(1/60);assert.equal(s.condition01,start);assert.equal(x.reactive.lastRepairFactor,1);x.dispose();});
check('Missing/stale capability is neutral without stopping baseline repair',()=>{for(const kind of ['missing','stale','held']){const a=fixture(layout([0,0,0]),1),b=fixture(layout([0,0,0]),1,true);if(kind==='held')b.f.coreWorkManipulation={held:true};else if(kind==='missing')delete b.f.corePerformance.stabilizeSample;else b.f.corePerformance.stabilizeSample={...b.f.corePerformance.stabilizeSample,sampledFrame:-10};a.tick(1/60);b.tick(1/60);assert.equal(a.reactive.states.get(scope.objectIds[0]).condition01,b.reactive.states.get(scope.objectIds[0]).condition01);assert.equal(b.reactive.lastRepairFactor,1);a.dispose();b.dispose();}});
check('Multiplier scales repair once and preserves the separate stress decrement',()=>{for(const chord of ['cohere','cohere_project','cohere_draw','full_system']){const a=fixture(layout([0,0,0]),1),b=fixture(layout([0,0,0]),1,true),idle=fixture(layout([0,0,0]),1);for(const x of [a,b]){x.f.verbComposition.chord=chord;x.reactive.states.get(scope.objectIds[0]).liveStress01=.8;}idle.f.input={};idle.f.targeting.relationshipActive=false;idle.f.verbComposition.relationshipBound=false;a.tick(1/60);b.tick(1/60);idle.tick(1/60);const as=a.reactive.states.get(scope.objectIds[0]),bs=b.reactive.states.get(scope.objectIds[0]),is=idle.reactive.states.get(scope.objectIds[0]);assert.ok(Math.abs((is.condition01-bs.condition01)/(is.condition01-as.condition01)-b.reactive.lastRepairFactor)<1e-9);assert.equal(as.liveStress01,bs.liveStress01);a.dispose();b.dispose();idle.dispose();}});
check('Three catch-up substeps apply repair exactly like three accepted callbacks',()=>{const a=fixture(layout([0,0,0]),1,true),b=fixture(layout([0,0,0]),1,true);for(let i=0;i<3;i++)a.tick(.05);b.f.frame++;b.f.runtimeSimulationSubstepCount=3;for(let i=0;i<3;i++){b.f.runtimeSimulationSubstepIndex=i;b.f.runtimeSeconds+=.05;b.registry.update(.05,b.f);b.rings.updateStabilize(.05,b.f);}assert.ok(Math.abs(a.reactive.states.get(scope.objectIds[0]).condition01-b.reactive.states.get(scope.objectIds[0]).condition01)<1e-12);assert.equal(a.radial.reserve01,b.radial.reserve01);assert.ok(b.reactive.lastRepairFactor>1);a.dispose();b.dispose();});
assert.equal(sourceIdentity(root).fingerprint,identity.fingerprint);
const report={pass:'CONNECTION38',status:checks.every(x=>x.status==='PASS')?'PASS':'FAIL',sourceIdentity:identity,scope:'Actual production owner with opt-in enabled/disabled, compared with saved CONNECTION36 source. Paired actual registry/context/radial/material/ring owners. Exact legal placements, condition 0.9, initial reserve and retained relationships are declared fixtures. No natural campaign, human feel or browser acceptance.',summary:{passed:checks.filter(x=>x.status==='PASS').length,failed:checks.filter(x=>x.status==='FAIL').length},checks,rows};
fs.mkdirSync(new URL('./reports/',import.meta.url),{recursive:true});fs.writeFileSync(process.env.BLOB_BOT_REPORT??new URL('./reports/owner.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({summary:report.summary,failed:checks.filter(x=>x.status==='FAIL'),examples:rows.filter(x=>x.initialReserve===1&&x.acceptedStepSeconds===1/60&&['3:0:0','0:3:0','0:0:3'].includes(x.distribution))}));if(report.status==='FAIL')process.exitCode=1;
