import fs from 'node:fs';
import assert from 'node:assert/strict';
import {CoreRadialPerformanceSystem as Radial} from './src/player/CoreRadialPerformanceSystem.js';
import {CoreEmbodimentSystem as Embodiment} from './src/player/CoreEmbodimentSystem.js';
import {buildCoreArrangementLabels as labels, previewCoreArrangement as preview, coreArrangementLabelRows as rows, CORE_LABEL_ZONES as zones} from './src/ui/CoreArrangementLabels.js';
import * as THREE from 'three';
const checks=[];function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e)});}}
const classifier=new Embodiment({scene:new THREE.Scene(),playerRoot:new THREE.Group(),frameState:{}});
const families=['grave_memory_retention','vascular_rhythm_retention','silt_pressure_retention'];
function fixture(layout,reserve=1){
 const counts={deep_core:0,inner_body:0,membrane:0};const placements=layout.map((z,i)=>{counts[z]++;const p=new THREE.Group();p.userData.coreWorkFamily=families[i];const role=classifier.getSpatialChemistryInteraction(p,z);return {pieceId:'piece'+i,family:families[i],zoneId:z,interactionIntent:role.intent};});
 const f={activeCellId:'CELL_SIGNAL_CHORUS_NERVE_001',input:{},spatialCoreChemistry:{counts,placements,retainedPieceCount:3,topology:classifier.getWholeCoreTopology(counts,3)},coreWorkManipulation:{selectedPieceId:'piece0'},inspectionCamera:{active:true,coreWorkActive:true}};
 const owner=new Radial({frameState:f,playerRoot:{userData:{}}});owner.reserve01=reserve;owner.update(0,f);return {f,owner};
}
const layouts=[];for(const a of zones)for(const b of zones)for(const c of zones)layouts.push([a,b,c]);
check('729 counterfactuals: 27 arrangements × 3 selections × 3 destinations × 3 reserves match actual owner',()=>{
 for(const layout of layouts)for(const reserve of [0,.5,1])for(let i=0;i<3;i++){
  const {f}=fixture(layout,reserve);f.coreWorkManipulation.selectedPieceId='piece'+i;const before=JSON.stringify(f),s=labels(f);
  assert.equal(s.previews.length,3);assert.equal(JSON.stringify(f),before);
  for(const p of s.previews){const next=[...layout];next[i]=p.zoneId;const expected=labels(fixture(next,reserve).f).current;for(const key of Object.keys(expected))assert.equal(p[key],expected[key]);}
 }
});
check('Family roles and zones remain distinct from aggregate verb factors',()=>{for(const l of layouts){const {f}=fixture(l);for(let i=0;i<3;i++){f.coreWorkManipulation.selectedPieceId='piece'+i;const s=labels(f);assert.equal(s.pieces.find(x=>x.selected).family,['Grave','Vascular','Silt'][i]);assert.equal(s.pieces.find(x=>x.selected).meaning,f.spatialCoreChemistry.placements[i].interactionIntent);assert.ok(rows(s).some(x=>x.text.includes('Authored role:')));}}});
check('Missing, stale, invalid and incomplete data never invent numbers',()=>{
 const mutations=[f=>delete f.corePerformance,f=>f.corePerformance.owner='other',f=>f.corePerformance.distribution='0:0:3',f=>f.corePerformance.topologyId='stale',f=>f.corePerformance.endurance.reserve01=NaN,f=>f.corePerformance.verbModifiers.absorb.progressMultiplier=Infinity,f=>f.spatialCoreChemistry.retainedPieceCount=2,f=>f.spatialCoreChemistry.placements.pop(),f=>f.spatialCoreChemistry.counts.deep_core=-1];
 for(const mutate of mutations){const {f}=fixture(zones);mutate(f);const s=labels(f);assert.equal(s.current,null);assert.equal(s.previews.length,0);assert.ok(!rows(s).some(x=>x.title==='LIVE VERB FACTORS'));}assert.equal(labels({}).current,null);
});
check('Selection, hold and release update without mutating inputs or placement',()=>{const {f}=fixture(zones);f.coreWorkManipulation.held=true;assert.match(labels(f).guide,/holding/);f.coreWorkManipulation.held=false;f.coreWorkManipulation.selectedPieceId='piece2';assert.match(labels(f).guide,/selecting/);assert.equal(labels(f).selectedId,'piece2');f.coreWorkManipulation.selectedPieceId='missing';assert.equal(labels(f).previews.length,0);});
check('Region/Host handoffs and trial status explain only supported local scope',()=>{for(const cell of ['CELL_VASCULAR_RHYTHM_ROUTE_001','CELL_SILT_PRESSURE_ROUTE_001','CELL_MEMBRANE_NURSERY_001','unknown'])for(const trial of [false,true]){const {f}=fixture(zones);f.activeCellId=cell;f.activeHostId='host-b';f.targeting={targetId:'noun'};f.playerComposition={form:.4};const before=JSON.stringify(f);const s=labels(f,{repairTrialEnabled:trial});assert.equal(s.cellId,cell);assert.equal(JSON.stringify(f),before);if(cell.includes('NURSERY'))assert.match(s.local,trial?/trial ON/:/trial OFF/);if(cell.includes('VASCULAR'))assert.match(s.local,/inside the current/);if(cell.includes('SILT'))assert.match(s.local,/supported surfaces/);}});
check('Inspection/work suspend world repair; world view clears that explanation',()=>{const {f}=fixture(zones);assert.ok(labels(f).suspension);f.inspectionCamera={active:true};assert.ok(labels(f).suspension);f.inspectionCamera={};assert.equal(labels(f).suspension,'');f.tightInspectionCamera={coreWorkActive:true};assert.ok(labels(f).inWork);});
check('Preview validates reserve/counts and never promises completion time',()=>{for(const c of [{deep_core:4,inner_body:0,membrane:0},{deep_core:1.5,inner_body:1.5,membrane:0},{}])assert.equal(preview(c),null);assert.equal(preview({deep_core:3,inner_body:0,membrane:0},-1),null);const s=labels(fixture(zones).f);assert.match(s.previewScope,/does not predict/);assert.match(s.scope,/not completion times/);});
const report={pass:'CONNECTION40',scope:'Read-only labels, 729 counterfactuals against real physiology; explicit topology and region fixtures, no human feel claim.',checks,summary:{passed:checks.filter(x=>x.status==='PASS').length,failed:checks.filter(x=>x.status==='FAIL').length}};
fs.writeFileSync(process.env.BLOB_BOT_REPORT??'CONNECTION40_CORE_LABELS_CHECK.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.summary.failed)process.exitCode=1;
