import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const base=new URL('../src', import.meta.url).pathname;
const { SiltTrajectoryFieldProbe }=await import(pathToFileURL(`${base}/contact/SiltTrajectoryFieldProbe.js`).href);
const H=[
 {id:'reservoir',center:[1.1,-0.43,-12.2],radii:[3.35,2,3.4]},
 {id:'garden',center:[-5.35,-0.74,-10.4],radii:[3.15,2.35,3.3]},
 {id:'veins',center:[5.8,-0.62,-16.2],radii:[2.85,2.2,3.25]},
];
let tests=0;
const test=(name,fn)=>{fn();tests++;process.stdout.write(`PASS ${name}\n`)};
const unit=(id,position,nativeError=0)=>({unitId:id,position,velocity:[0,0,0],nativeError});
const step=(p,items,delta=.25)=>p.sample(delta,items,H);
test('existing reservoir is classifiable',()=>assert.equal(new SiltTrajectoryFieldProbe().classify(H[0].center,H),'reservoir'));
test('existing garden is classifiable',()=>assert.equal(new SiltTrajectoryFieldProbe().classify(H[1].center,H),'garden'));
test('existing veins is classifiable',()=>assert.equal(new SiltTrajectoryFieldProbe().classify(H[2].center,H),'veins'));
test('corridor samples are between, not assigned by nearest',()=>assert.equal(new SiltTrajectoryFieldProbe().classify([-1.0,-.7,-18],H),'between'));
test('invalid samples are between',()=>assert.equal(new SiltTrajectoryFieldProbe().classify([NaN,0,0],H),'between'));
test('unknown habitats do not create detection',()=>assert.equal(new SiltTrajectoryFieldProbe().classify([0,0,0],[{id:'x',center:[0,0,0],radii:[0,1,1]}]),'between'));
test('subsampling delays updates until interval',()=>{let p=new SiltTrajectoryFieldProbe();p.sample(.1,[unit('01',H[1].center)],H);assert.equal(p.snapshot().records.length,0);step(p,[unit('01',H[1].center)],.15);assert.equal(p.snapshot().records.length,1)});
test('negative/NaN time ignored',()=>{let p=new SiltTrajectoryFieldProbe();p.sample(-1,[unit('01',H[1].center)],H);p.sample(NaN,[unit('01',H[1].center)],H);assert.equal(p.snapshot().records.length,0)});
test('habitat crossing requires entering a second valid lobe',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);step(p,[unit('01',[-1,-.7,-18])]);assert.equal(p.snapshot().habitatCrossings,0);step(p,[unit('01',H[0].center)]);assert.equal(p.snapshot().habitatCrossings,1);assert.deepEqual(p.snapshot().records[0].visitedHabitats,['garden','reservoir'])});
test('staying in same lobe does not repeatedly count crossing',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);for(let i=0;i<8;i++)step(p,[unit('01',[-4.8,-.7,-10.5])]);assert.equal(p.snapshot().habitatCrossings,0)});
test('passage is not counted as a new habitat',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);step(p,[unit('01',[-1,-.7,-18])]);assert.equal(p.snapshot().records[0].visitedHabitats.length,1);assert.equal(p.snapshot().records[0].currentHabitat,'between')});
test('entering original lobe after passage does not count crossing',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);step(p,[unit('01',[30,0,0])]);step(p,[unit('01',H[1].center)]);assert.equal(p.snapshot().habitatCrossings,0)});
test('return crossing counts as another crossing but no duplicate visited',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);step(p,[unit('01',H[0].center)]);step(p,[unit('01',H[1].center)]);assert.equal(p.snapshot().habitatCrossings,2);assert.deepEqual(p.snapshot().records[0].visitedHabitats,['garden','reservoir'])});
test('3-unit travel threshold counts once per grain history',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);step(p,[unit('01',H[0].center)]);step(p,[unit('01',H[2].center)]);assert.equal(p.snapshot().traveledThreeUnits,1)});
test('native distance records max history without changing motion',()=>{let p=new SiltTrajectoryFieldProbe();let x=unit('01',H[1].center,2.3);const original=[...x.position];step(p,[x]);x.nativeError=1.7;step(p,[x]);assert.equal(p.snapshot().records[0].maximumNativeError,2.3);assert.deepEqual(x.position,original)});
test('eight-unit capacity enforced',()=>{let p=new SiltTrajectoryFieldProbe();for(let i=1;i<=12;i++)step(p,[unit('id'+i,H[1].center)]);assert.equal(p.snapshot().records.length,8)});
test('empty free list does not fabricate records',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[]);assert.equal(p.snapshot().records.length,0)});
test('snapshot is read-only authority flags',()=>{let s=new SiltTrajectoryFieldProbe().snapshot();assert.equal(s.changesPhysics,false);assert.equal(s.changesTraversal,false);assert.equal(s.changesEcology,false);assert.equal(s.offRouteSimulation,false);assert.equal(s.materialTransfer,false);assert.equal(s.progressionCredit,false)});
test('snapshot record arrays are defensive',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);const s=p.snapshot();s.records[0].visitedHabitats.push('bogus');assert.deepEqual(p.snapshot().records[0].visitedHabitats,['garden'])});
test('source integrates probe AFTER native trajectory advance',()=>{let s=fs.readFileSync(`${base}/routes/SiltPressureRouteSystem.js`,'utf8');assert.ok(s.indexOf('this.animateLivingMatter(dt);') < s.indexOf('this.siltTrajectoryField.sample(dt'));assert.ok(s.indexOf('this.siltTrajectoryField.sample(dt')<s.indexOf('this.updateSiltContact(dt, frameState);'))});
test('source telemetry reports existing habitats and new field, not new generated geology',()=>{let s=fs.readFileSync(`${base}/routes/SiltPressureRouteSystem.js`,'utf8');assert.ok(s.includes('this.recipe?.habitatFoundation?.habitats ?? []'));assert.ok(s.includes('siltTrajectoryField: this.siltTrajectoryField.snapshot()'));assert.equal(s.includes('new SiltLivingMaterialCycle('),true)});
test('observation export exposes field state',()=>{let s=fs.readFileSync(`${base}/debug/WorldObjectCensusSystem.js`,'utf8');assert.ok(s.includes('siltTrajectoryField: {'));assert.ok(s.includes('silt-trajectory-field-change'));assert.ok(s.includes('BLOB_LS1E1_OBSERVATION.json'))});
test('seated grain not included in field sampler data',()=>{let s=fs.readFileSync(`${base}/routes/SiltPressureRouteSystem.js`,'utf8');assert.ok(s.includes('this.siltTrajectory.snapshot().units'));assert.ok(s.includes('this.siltTrajectory.cancelHold(held.id)'));assert.ok(s.includes('siltPlateSeat: this.siltPlateSeat.snapshot()'))});
test('historical grain stops reporting currently free after seating/reacquisition',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center)]);assert.equal(p.snapshot().records[0].currentlyFree,true);step(p,[]);assert.equal(p.snapshot().records[0].currentlyFree,false)});
test('finite max distance and max native error',()=>{let p=new SiltTrajectoryFieldProbe();step(p,[unit('01',H[1].center,12)]);step(p,[unit('01',H[2].center,99)]);let x=p.snapshot().records[0];assert.ok(Number.isFinite(x.maximumReleaseDistance));assert.equal(x.maximumNativeError,99)});
console.log(`D2P1 VALIDATION ${tests}/${tests} PASSED`);
