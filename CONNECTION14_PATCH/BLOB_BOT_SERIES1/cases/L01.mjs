import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {RegionalTerritoryExpansion as Territory} from '../../src/world/RegionalTerritoryExpansion.js';
const checks=[],check=(name,fn)=>{fn();checks.push({name,status:'PASS'});};
for(const kind of ['silt','vascular','grave','hub']){
 const t=new Territory({kind,parent:new THREE.Group()}),near=t.sites[0].point.clone(),far=new THREE.Vector3(1000,1000,1000);
 const f={hostConnectionReceipts:{records:[]},returnRegionEngine:{creditCount:0},chemObjectState:{absorbedObjects:0}};
 function update(input,playerPosition=near){t.update({dt:.05,playerPosition,input,frameState:f});}
 const signalState=()=>JSON.stringify({sites:t.sites.map(s=>({imprint:s.imprint,strain:s.strain,void:s.void})),experiments:t.experimentSequence,waves:t.c0e3WavesCompleted,relief:t.c0e3ReliefCount});
 check(kind+': initial cursor and ordinary held counter do not create a Pulse',()=>{update({pulseEventId:0,pulsePressed:false});update({pulseEventId:0,pulsePressed:false});assert.equal(t.observationCount.pulse,0);});
 check(kind+': fresh canonical released Pulse is observed exactly once',()=>{update({pulseEventId:1,pulsePressed:true});update({pulseEventId:1,pulsePressed:true});assert.equal(t.observationCount.pulse,1);});
 check(kind+': off-route counter gap without a current event cannot mutate retained tissue',()=>{const before=signalState();update({pulseEventId:4,pulsePressed:false});assert.equal(signalState(),before);assert.equal(t.observationCount.pulse,1);assert.equal(t.lastPulseEventId,4);});
 check(kind+': next deliberate release remains available after consuming the gap',()=>{update({pulseEventId:5,pulsePressed:true});assert.equal(t.observationCount.pulse,2);});
 check(kind+': out-of-range release cannot replay when the player approaches',()=>{update({pulseEventId:6,pulsePressed:true},far);update({pulseEventId:6,pulsePressed:false});assert.equal(t.observationCount.pulse,2);});
 check(kind+': Core Work canonical suppression does not authorize a Pulse',()=>{f.inspectionCamera={active:true,coreWorkActive:true};update({pulseEventId:7,pulsePressed:false});assert.equal(t.observationCount.pulse,2);f.inspectionCamera={active:false,coreWorkActive:false};});
 check(kind+': existing Absorb and Stabilize held reads still latch once until release',()=>{for(let i=0;i<40;i++)update({pulseEventId:7,pulsePressed:false,absorbHeld:true,stabilizeHeld:true});assert.equal(t.observationCount.absorb,1);assert.equal(t.observationCount.stabilize,1);update({pulseEventId:7,pulsePressed:false});for(let i=0;i<16;i++)update({pulseEventId:7,pulsePressed:false,absorbHeld:true,stabilizeHeld:true});assert.equal(t.observationCount.absorb,2);assert.equal(t.observationCount.stabilize,2);});
 check(kind+': local reads do not create Host receipts, material or credits',()=>{assert.deepEqual(f.hostConnectionReceipts,{records:[]});assert.equal(f.returnRegionEngine.creditCount,0);assert.equal(f.chemObjectState.absorbedObjects,0);});
}
const result={case:'L01',status:'PASS',scope:'Actual four-region territory owner with supplied canonical input, target poses and skipped-update counter gaps. Core Work supplies already-suppressed canonical input; no physical controller or natural-navigation claim.',summary:{passed:checks.length,failed:0},checks};fs.writeFileSync(process.env.BLOB_BOT_REPORT,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.summary));
