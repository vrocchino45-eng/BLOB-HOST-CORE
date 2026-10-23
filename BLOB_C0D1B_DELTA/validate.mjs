#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { VascularSiltSignalReceiver } from '../src/routes/VascularSiltSignalReceiver.js';
import { createHash } from 'node:crypto';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const manifest = JSON.parse(fs.readFileSync(new URL('./MANIFEST.json', import.meta.url), 'utf8'));
for (const [relative,expected] of Object.entries(manifest.sourceAfterSha256)) {
 const actual = createHash('sha256').update(fs.readFileSync(path.resolve(process.cwd(),relative))).digest('hex');
 assert.equal(actual,expected,`C0D1-B installed ${relative} hash`);
}
const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASC = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const check=(cond, message)=>assert.ok(cond,message);
let assertions = 0;
const test=(condition,message)=>{check(condition,message);assertions++};
const decision=(n,unitId='silt-grain-01')=>({kind:'silt-trajectory',outcome:'released-with-trajectory',reason:'deliberate-release',noMaterialTransfer:true,progressionCredit:false,unitId,sequence:n,position:[0,0,0],velocity:[1,0,0],siltElapsedSeconds:n});
const relay=(h,v)=>{
  const afterSequence=h.vascularEffectSnapshot({withRecords:false}).lastSourceEventSequence;
  for(const e of v.appliedEffectSnapshot({afterSequence}).records)h.observeVascularAppliedEffect(e);
};
const h=new HostConnectionReceiptLedger();
const v=new VascularSiltSignalReceiver();
test(h.snapshot().pass==='LS1E1','Silt snapshot stable');
test(h.snapshot().records.length===0 && h.vascularEffectSnapshot().records.length===0,'zero signal');
test(h.forGrave().graveStateChanged===false,'Grave not mutated');
// A Silt release alone must not be published as a Vascular event.
h.observeSiltRelease(decision(10));
test(h.snapshot().acceptedTotal===1 && h.vascularEffectSnapshot().acceptedTotal===0,'Silt event alone not Vascular effect');
// The mounted receiver observes Silt, then the Host authenticates the real effect.
v.receive(h.snapshot());relay(h,v);
test(h.vascularEffectSnapshot().acceptedTotal===1,'one downstream event');
const receipt=h.vascularEffectSnapshot().records[0];
test(receipt.parentSiltReceiptId===`${SILT}:silt-trajectory:10`,'stable parent ID');
test(receipt.id===`${VASC}:membrane-load-applied:1`,'stable Vascular ID');
test(receipt.appliedDelta>0 && receipt.membraneLoadAfter===v.membraneLoad,'observed load');
test(Object.isFrozen(receipt),'Host receipt immutable');
const siltBefore=JSON.stringify(h.snapshot());
relay(h,v);test(h.vascularEffectSnapshot().acceptedTotal===1,'no duplicate on polling');
test(JSON.stringify(h.snapshot())===siltBefore,'old Silt snapshot untouched');
const dupeBefore=h.vascularEffectSnapshot().duplicateTotal;
test(h.observeVascularAppliedEffect(v.appliedEffectSnapshot().records[0])===null,'duplicate rejected');
test(h.vascularEffectSnapshot().duplicateTotal===dupeBefore+1,'dedupe counter');
// Incompatible upstream, forged origin, altered amount and invalid sequence all fail.
const source=v.appliedEffectSnapshot().records[0];
for(const [name,mut] of [
 ['parent ID',{parentSiltReceiptId:'fake'}],['owner',{sourceCellId:'fake'}],
 ['kind',{kind:'fake'}],['material',{materialTransfer:true}],
 ['NaN',{membraneLoadAfter:NaN}],['delta',{appliedDelta:.18}],
 ['phantom',{sequence:3,id:`${VASC}:membrane-load-applied:3`}],
 ]){
  test(h.observeVascularAppliedEffect({...source,...mut,sequence:2,id:`${VASC}:membrane-load-applied:2`})===null,`reject ${name}`);
}
test(h.vascularEffectSnapshot().acceptedTotal===1,'forgeries not accepted');
// The source suppresses false applied effects at saturation, even when it
// legitimately accepts another Silt disturbance receipt.
let effects=1;
for(let n=11;n<18;n++){
  h.observeSiltRelease(decision(n,'silt-grain-02'));
  v.receive(h.snapshot());relay(h,v);
  const now=v.appliedEffectSnapshot().records.length;
  test(now>=effects,'effect event count nondecreasing');effects=now;
}
test(v.membraneLoad===0.85,'receiver saturates');
test(v.receivedTotal===8,'Silt receptions include saturated');
test(h.vascularEffectSnapshot().acceptedTotal===v.appliedEffectSnapshot().records.length,'no saturation invention');
test(h.vascularEffectSnapshot().acceptedTotal<8,'saturated source events not relayed');
const good=h.vascularEffectSnapshot();
test(good.lastSourceEventSequence===good.acceptedTotal,'source monotonic');
test(h.forGrave().records.length===good.records.length,'downstream view read-only');
test(h.forGrave().inspectedAtCellId==='CELL_GRAVE_MEMORY_RESIDUE_BED_001','actual Grave I cell');
test(h.snapshot().acceptedTotal===8 && h.snapshot().records.every(e=>e.sourceCellId===SILT),'Silt ledger unmodified');
// The second Host ledger channel must prune separately and continue deduping.
const c=new HostConnectionReceiptLedger({limit:2});
for(let i=1;i<=9;i++){
  const parent=c.observeSiltRelease(decision(i));
  const before=0;
  const applied=0.14+0.055*(1/2.5);
  const e={schemaVersion:1,id:`${VASC}:membrane-load-applied:${i}`,sequence:i,kind:'vascular_membrane_load_change_applied',sourceCellId:VASC,sourceSystem:'VascularSiltSignalReceiver',parentSiltReceiptId:parent.id,parentSiltReceiptSequence:parent.sequence,parentSiltDecisionSequence:parent.sourceReceiptSequence,subjectId:parent.subjectId,membraneLoadBefore:before,membraneLoadAfter:applied,appliedDelta:applied,materialTransfer:false,routeCredit:false,offRouteSimulation:false};
  test(c.observeVascularAppliedEffect(e)!==null,'retained parent valid '+i);
  if(i===9){
    test(c.vascularEffectSnapshot().retainedCount===2,'bounded Vascular history');
    test(c.vascularEffectSnapshot().prunedTotal===7,'separate prune count');
    test(c.snapshot().retainedCount===2,'bounded Silt history');
    test(c.snapshot().prunedTotal===7,'separate Silt prune count');
    test(c.observeVascularAppliedEffect({...e,sequence:10,id:`${VASC}:membrane-load-applied:10`})===null,'old parent cannot replay even after channel rollover');
  }
}
// Sequence gaps must not silently create downstream events.
const gap=c.observeSiltRelease(decision(10));
const example=c.vascularEffectSnapshot().records.at(-1);
const beforeGap=c.vascularEffectSnapshot().acceptedTotal;
const bad={...example,sequence:12,id:`${VASC}:membrane-load-applied:12`,parentSiltReceiptId:gap.id,parentSiltReceiptSequence:gap.sequence,parentSiltDecisionSequence:gap.sourceReceiptSequence};
test(c.observeVascularAppliedEffect(bad)===null,'gap rejected');
test(c.vascularEffectSnapshot().gapRejectedTotal===1,'gap counted');
test(c.vascularEffectSnapshot().acceptedTotal===beforeGap,'gap no new event');
const route=fs.readFileSync(new URL('../src/routes/VascularRhythmRouteSystem.js', import.meta.url),'utf8');
test(route.includes('this.siltSignalReceiver.appliedEffectSnapshot({afterSequence: cursor})'),'route reads local effects');
test(route.includes('this.hostConnectionReceiptLedger.observeVascularAppliedEffect(effect)'),'mounted route publishes');
test(route.includes('if (frameState.activeCellId !== ROUTE_CELL_ID)'),'route preserves mount guard');
console.log(JSON.stringify({pass:'C0D1-B',status:'OFFLINE_RELAY_AND_ROUTE_WIRING_PASS',assertions,legacySiltSnapshot:'UNCHANGED',receiptProofs:{accepted:good.acceptedTotal,saturatedVascularLoad:v.membraneLoad},negativeTests:'replay forgery gap saturation and rollover covered',limit:'No browser run, no Grave receiving, no off-route simulation'},null,2));
