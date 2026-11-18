import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {VascularRhythmRouteSystem as Route} from './src/routes/VascularRhythmRouteSystem.js';
import {HostConnectionReceiptLedger as Ledger} from './src/core/HostConnectionReceiptLedger.js';
const recipe=JSON.parse(fs.readFileSync(new URL('./public/data/routes/vascularRhythmRouteCircuit_HC011A1.json',import.meta.url)));
const checks=[];
function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack)});}}
function fixture(){
 const frame={activeCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001',activeHostId:'HOST_ALPHA_WOUNDED_NURSERY',runtimeSeconds:2,frame:1,input:{}};
 const ledger=new Ledger(),r=new Route({recipeDataSystem:{get:()=>recipe,data:{vascularRhythmRouteCircuit:recipe}},scene:new THREE.Scene(),playerRoot:new THREE.Object3D(),frameState:frame,hostConnectionReceiptLedger:ledger});
 r.init();r.hostConnectionReceiptLedger=ledger;r.onRuntimeMount(frame);return {r,frame,ledger};
}
function cause(i){return {kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',noMaterialTransfer:true,progressionCredit:false,unitId:'silt-grain-01',sequence:i,position:[0,0,0],velocity:[0,0,2],siltElapsedSeconds:i};}
function tick(x,dt=.05){x.frame.runtimeSeconds+=dt;x.r.update(dt,x.frame);}
check('Confirmed positive tissue change starts the existing fold wave and matches audio identity',()=>{
 const x=fixture();x.ledger.observeSiltRelease(cause(1));tick(x);
 const v=x.r.vis1Applied,w=x.frame.vascularRhythmRoute.siltArrivalPresentation;
 assert.ok(v.receiptArrivalStrength>0);assert.equal(v.arrivalReceiptId,w.receiptId);assert.equal(v.arrivalParentSiltReceiptId,w.parentSiltReceiptId);assert.equal(v.arrivalFrontFold,x.r.wallFolds[0].name);assert.equal(v.receiptWaveAgeSeconds,.05);
});
check('Raw receipt count without a Host confirmation cannot start an arrival',()=>{
 const x=fixture();x.r.hostConnectionReceiptLedger=null;x.r.siltSignalReceiver.receivedTotal=3;x.r.siltSignalReceiver.membraneLoad=.5;tick(x);assert.equal(x.r.vis1Applied.receiptArrivalStrength,0);assert.equal(x.r.vis1Applied.arrivalReceiptId,null);
});
check('Saturated signal is received but creates no false arrival',()=>{
 const x=fixture();x.r.siltSignalReceiver.membraneLoad=.85;x.ledger.observeSiltRelease(cause(1));tick(x,0);assert.equal(x.r.siltSignalReceiver.receivedTotal,1);assert.equal(x.ledger.vascularEffectSnapshot().acceptedTotal,0);assert.equal(x.r.vis1Applied.receiptArrivalStrength,0);
});
check('Arrival travels from entry fold into deeper existing tissue and expires',()=>{
 const x=fixture();x.ledger.observeSiltRelease(cause(1));tick(x);const first=x.r.vis1Applied.arrivalFrontFold;
 for(let i=0;i<40;i++)tick(x);assert.notEqual(x.r.vis1Applied.arrivalFrontFold,first);assert.equal(x.r.vis1Applied.arrivalFrontFold,x.r.wallFolds[4].name);
 for(let i=0;i<61;i++)tick(x);assert.equal(x.r.vis1Applied.arrivalReceiptId,null);assert.equal(x.r.vis1Applied.receiptArrivalStrength,0);
});
check('Warm onset is distinguishable from ordinary circulation at matched load/time',()=>{
 const x=fixture();x.ledger.observeSiltRelease(cause(1));tick(x);const fold=x.r.wallFolds[0],arrival=fold.material.emissive.clone();
 x.r.vis1WaveAge=30;x.r.applySiltPressureAnatomy();const ordinary=fold.material.emissive;
 assert.ok(arrival.r>ordinary.r);assert.ok(arrival.b<ordinary.b);assert.ok(fold.material.opacity<=.83);assert.ok(fold.material.emissiveIntensity<=1.15);
});
check('Unmount retires the visual wave instead of replaying it on a revisit',()=>{
 const x=fixture();x.ledger.observeSiltRelease(cause(1));tick(x);x.frame.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';tick(x);x.frame.activeCellId='CELL_VASCULAR_RHYTHM_ROUTE_001';tick(x);assert.equal(x.r.vis1Applied.receiptArrivalStrength,0);assert.equal(x.r.vis1Applied.arrivalReceiptId,null);
});
check('Presentation alone cannot change receipts, load, current, credit or geometry ownership',()=>{
 const x=fixture();x.ledger.observeSiltRelease(cause(1));tick(x);const before=JSON.stringify({ledger:x.ledger.snapshot(),effects:x.ledger.vascularEffectSnapshot(),receiver:x.r.siltSignalReceiver.snapshot(),physical:x.frame.physicalFeel,credit:x.frame.returnRegionEngine}),ids=x.r.wallFolds.map(f=>[f.uuid,f.geometry.uuid,f.material.uuid]);
 for(let i=0;i<10;i++)x.r.applySiltPressureAnatomy();assert.equal(JSON.stringify({ledger:x.ledger.snapshot(),effects:x.ledger.vascularEffectSnapshot(),receiver:x.r.siltSignalReceiver.snapshot(),physical:x.frame.physicalFeel,credit:x.frame.returnRegionEngine}),before);assert.deepEqual(x.r.wallFolds.map(f=>[f.uuid,f.geometry.uuid,f.material.uuid]),ids);
});
check('Zero load remains a strict resting state',()=>{
 const x=fixture();tick(x);assert.equal(x.r.vis1Applied.tissueState,'resting');assert.equal(x.r.vis1Applied.foldCount,0);assert.equal(x.r.vis1Applied.receiptArrivalStrength,0);
});
const report={case:'V01',scope:'Actual route, Host and receiver owners with declared Silt release-decision fixtures; no physical input or human readability claim.',summary:{passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length},checks};
fs.writeFileSync(process.env.BLOB_BOT_REPORT??'CONNECTION23_VISUAL_CHECK.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.summary.failed)process.exitCode=1;
