import {SiltPressureRouteSystem} from './src/routes/SiltPressureRouteSystem.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SiltGripAuthority} from './src/contact/SiltGripAuthority.js';
import {SiltCompressionContact} from './src/contact/SiltCompressionContact.js';
import {SiltPlateSeat} from './src/contact/SiltPlateSeat.js';
import {SiltTrajectoryMemory} from './src/contact/SiltTrajectoryMemory.js';
import {MaterialIdentityLedger} from './src/ecology/MaterialIdentityLedger.js';
import {HostConnectionReceiptLedger} from './src/core/HostConnectionReceiptLedger.js';
const source=readFileSync(new URL('./src/routes/SiltPressureRouteSystem.js',import.meta.url),'utf8');
const methods={updateSiltGrip:SiltPressureRouteSystem.prototype.updateSiltGrip,
 flushHeldAbsorbMotion:SiltPressureRouteSystem.prototype.flushHeldAbsorbMotion,
 recordSiltDecision:SiltPressureRouteSystem.prototype.recordSiltDecision,
 onRuntimeUnmount:SiltPressureRouteSystem.prototype.onRuntimeUnmount};
const checks=[];function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});}}
function fixture({imprint=false}={}){
 const id='silt-grain-01',unit={id,phase:'settled',mass:1};
 const r={...methods,elapsed:10,transactionSequence:0,transactionTrace:[],siltGrip:new SiltGripAuthority(),
  siltContact:new SiltCompressionContact({position:[0,0,0]}),siltPlateSeat:new SiltPlateSeat(),
  siltTrajectory:new SiltTrajectoryMemory(),hostConnectionReceiptLedger:new HostConnectionReceiptLedger(),
  materialIdentity:new MaterialIdentityLedger({originRegion:'silt',originSignature:'fixture'}),
  livingCycle:{active:true,units:[unit]},camera:null,heldAbsorbReportDistance:0,heldAbsorbReportSeconds:0,
  heldAbsorbId:null,siltAimLockedId:id,heldPulsePending:false,active:true,
  siltSeatVisualStartedAt:null,siltGripLocalOffset:{length:()=>.5},
  setVisible(v){this.fixtureVisible=v;},publish(f,v){this.fixturePublished=v;}};
 r.materialIdentity.register({id,mass:1});r.materialIdentity.transfer(id,'grip','individual');
 assert.equal(r.siltGrip.tryGrip({unit,unitPosition:[.2,.1,0],corePosition:[0,0,0],stabilizeHeld:true,aPressed:true}),true);
 r.siltTrajectory.beginHold(id,r.siltGrip.position);
 if(imprint)for(let i=0;i<2;i++)r.siltContact.update({dt:0,heldId:id,heldPosition:r.siltGrip.position,
  corePosition:[0,0,0],braceHeld:true,bracedPulse:true});
 const f={frame:1,activeCellId:'CELL_SILT_PRESSURE_ROUTE_001',input:{stabilizeHeld:false},
  siltMaterialAim:{candidateId:'silt-grain-02'}};
 return {r,f,id};
}
check('Free deliberate release preserves held ID and creates one Host observation',()=>{
 const {r,f,id}=fixture();r.updateSiltGrip(f,.05);
 assert.equal(r.siltGrip.heldId,null);assert.equal(f.siltMaterialAim.heldId,null);
 assert.ok(r.siltTrajectory.free.has(id));assert.equal(r.hostConnectionReceiptLedger.acceptedTotal,1);
 assert.equal(r.hostConnectionReceiptLedger.records[0].subjectId,id);
 const event=r.transactionTrace.find(e=>e.kind==='silt-trajectory');assert.equal(event.candidateAtFrameStart,'silt-grain-02');assert.equal(event.unitId,id);
 assert.equal(r.materialIdentity.totalMass(),1);
});
check('Repeated release input cannot mint another trajectory or Host observation',()=>{
 const {r,f}=fixture();r.updateSiltGrip(f,.05);r.updateSiltGrip(f,.05);
 assert.equal(r.siltTrajectory.releases,1);assert.equal(r.hostConnectionReceiptLedger.acceptedTotal,1);
});
check('Imprinted braced contact seats the same grain and cancels free trajectory',()=>{
 const {r,f,id}=fixture({imprint:true});assert.equal(r.siltContact.imprinted,true);assert.equal(r.siltContact.braced,true);
 r.updateSiltGrip(f,.05);assert.equal(r.siltPlateSeat.unitId,id);assert.equal(r.siltGrip.heldId,null);
 assert.equal(r.siltTrajectory.held.has(id),false);assert.equal(r.siltTrajectory.free.has(id),false);
 assert.equal(r.hostConnectionReceiptLedger.acceptedTotal,0);
 assert.equal(r.transactionTrace.filter(e=>e.kind==='silt-seat').length,1);
});
check('Absorb withdrawal cannot seat an imprinted grain',()=>{
 const {r,f,id}=fixture({imprint:true});f.input.absorbHeld=true;r.updateSiltGrip(f,.05);
 assert.equal(r.siltPlateSeat.unitId,null);assert.equal(r.siltTrajectory.free.has(id),true);
});
check('Unimprinted contact follows free release rather than seating',()=>{
 const {r,f,id}=fixture();r.siltContact.update({dt:0,heldId:id,heldPosition:r.siltGrip.position,corePosition:[0,0,0],braceHeld:true});
 assert.equal(r.siltContact.imprinted,false);r.updateSiltGrip(f,.05);assert.equal(r.siltPlateSeat.unitId,null);assert.ok(r.siltTrajectory.free.has(id));
});
check('Release flushes pending absorb displacement under original held ID once',()=>{
 const {r,f,id}=fixture();r.heldAbsorbReportDistance=.0123;r.heldAbsorbReportSeconds=.02;r.heldAbsorbId=id;
 r.updateSiltGrip(f,.05);const rows=r.transactionTrace.filter(e=>e.kind==='held-material-motion'&&e.verb==='absorb');
 assert.equal(rows.length,1);assert.equal(rows[0].heldGrainId,id);assert.equal(rows[0].appliedDisplacement,.0123);
 assert.equal(r.heldAbsorbReportDistance,0);r.flushHeldAbsorbMotion(f);assert.equal(r.transactionTrace.filter(e=>e.verb==='absorb').length,1);
});
check('Unmount releases locally, restores ledger ownership and grants no Host disturbance',()=>{
 const {r,f,id}=fixture();r.heldAbsorbReportDistance=.02;f.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';r.onRuntimeUnmount(f);
 assert.equal(r.active,false);assert.equal(r.fixtureVisible,false);assert.equal(r.siltGrip.heldId,null);
 assert.equal(r.materialIdentity.get(id).owner,'environment');assert.equal(r.materialIdentity.totalMass(),1);
 assert.equal(r.siltTrajectory.free.get(id).releaseReason,'region-hidden');assert.equal(r.hostConnectionReceiptLedger.acceptedTotal,0);
 assert.equal(f.siltMaterialAim.state,'hidden');assert.equal(r.siltContact.heldId,null);
});
check('Unmount repairs stale grip ledger owners within the same ledger only',()=>{
 const {r,f}=fixture();r.materialIdentity.register({id:'silt-grain-02',mass:1});r.materialIdentity.transfer('silt-grain-02','grip','individual');
 r.onRuntimeUnmount(f);assert.ok([...r.materialIdentity.records.values()].every(e=>e.owner==='environment'));assert.equal(r.materialIdentity.totalMass(),2);
});
const report={pass:'SILT-RELEASE-INTEGRATION1',scope:'full production route module import and real prototype methods with real helpers; controlled release/unmount fixtures; presentation callbacks stubbed',
 sourceRouteSHA256:createHash('sha256').update(source).digest('hex'),checks,
 summary:{passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length},
 notVerified:['camera-based acquisition or seated extraction','full update scheduling and post-grip ledger reconciliation','actual authored recipe and geometry','live controls, camera, audio, feel','intermittent disappearance']};
console.log(JSON.stringify(report,null,2));if(report.summary.failed)process.exitCode=1;
