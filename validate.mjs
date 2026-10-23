#!/usr/bin/env node
// C0D1-A: new immutable effect stream PLUS reference parity for old outputs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const root=process.cwd();
const manifest=JSON.parse(readFileSync(resolve(dir,'MANIFEST.json'),'utf8'));
const target=resolve(root,'src/routes/VascularSiltSignalReceiver.js');
const fixture=resolve(root,'scripts/fixtures/C0C4_VascularSiltSignalReceiver_LS1E2_REFERENCE.mjs');
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(digest(target),manifest.sourceAfterSha256,'Expected installed C0D1-A owner');
const {VascularSiltSignalReceiver: Owner}=await import(pathToFileURL(target).href);
const {VascularSiltSignalReceiver: Reference}=await import(pathToFileURL(fixture).href);
const SOURCE='CELL_SILT_PRESSURE_ROUTE_001';
const RECEIVER='CELL_VASCULAR_RHYTHM_ROUTE_001';
const receipt=(sequence, velocity=[1,0,0], override={})=>({
  schemaVersion:1, id:`${SOURCE}:silt-trajectory:${sequence}`,
  sequence, kind:'silt_material_disturbance_observed', sourceCellId:SOURCE,
  sourceSystem:'SiltPressureRouteSystem', sourceReceiptSequence:sequence,
  subjectId:'silt-grain-03', releaseVelocity:velocity, origin:[1,2,3],
  effectType:'observed_only', targetCellId:null, materialTransfer:false,
  routeCredit:false, worldConsequence:false,...override
});
const ledger=records=>({pass:'LS1E1',records});
let assertions=0;
const eq=(actual,expected,label)=>{assertions++;assert.deepStrictEqual(actual,expected,label);};
const ok=(truth,label)=>{assertions++;assert.ok(truth,label);};
const o=new Owner(),r=new Reference();
function parity(label){
  eq(o.snapshot(),r.snapshot(),`${label}: unchanged LS1E2 snapshot`);
  eq(o.flowScale,r.flowScale,`${label}: flow parity`);
  for(const prop of ['lastSequence','receivedTotal','gapTotal','membraneLoad','lastReceiptId','lastSubjectId','recentReceipts']) {
    eq(o[prop],r[prop],`${label}: ${prop}`);
  }
}
parity('initial');
let lastSeq=0;
function take(records,label){
  const batch=ledger(records);
  eq(o.receive(batch),r.receive(batch),`${label}: old receive count`);
  parity(label);
  const stream=o.appliedEffectSnapshot();
  eq(stream.pass,'C0D1-A','new stream pass');
  eq(stream.lastAppliedEffectSequence,o.appliedEffectSequence,'monotonic count');
  ok(stream.records.length<=64,'bounded to 64');
  for(const e of stream.records){
    eq(e.sourceCellId,RECEIVER,'Vascular owner');
    eq(e.kind,'vascular_membrane_load_change_applied','effect kind');
    eq(e.id,`${RECEIVER}:membrane-load-applied:${e.sequence}`,'deterministic id');
    ok(Object.isFrozen(e),'event frozen');
    ok(Number.isFinite(e.appliedDelta)&&e.appliedDelta>0,'positive finite applied delta');
    eq(e.membraneLoadAfter-e.membraneLoadBefore,e.appliedDelta,'measured delta exactly matches');
    ok(e.membraneLoadBefore>=0&&e.membraneLoadAfter<=0.85,'bounded load');
    eq(e.materialTransfer,false,'no mass');
    eq(e.routeCredit,false,'no credit');
    eq(e.offRouteSimulation,false,'no remote tick');
  }
  ok(stream.lastAppliedEffectSequence>=lastSeq,'effect sequence non-decreasing');
  lastSeq=stream.lastAppliedEffectSequence;
}
// No event in no-source or malformed-source cases.
take([], 'empty');
take([receipt(1,[1,0,0],{materialTransfer:true})], 'forged material flag');
eq(o.appliedEffectSequence,0,'malformed receipt cannot create effect');
take([receipt(2,[0,0,0])], 'valid first');
eq(o.appliedEffectSequence,1,'first nonzero response');
const first=o.appliedEffectSnapshot().records[0];
eq(first.parentSiltReceiptId,`${SOURCE}:silt-trajectory:2`,'parent ID');
eq(first.parentSiltReceiptSequence,2,'parent host sequence');
eq(first.parentSiltDecisionSequence,2,'parent decision sequence');
eq(o.appliedEffectSnapshot({afterSequence:1}).records.length,0,'cursor excludes previously observed');
take([receipt(2)], 'duplicate');
eq(o.appliedEffectSequence,1,'duplicate creates no effect');
// Reach saturation. Accepted receipts still count, but only actual positive increments emit.
for(let i=3;i<=14;i++) take([receipt(i,[4,0,0])], `saturate ${i}`);
eq(o.membraneLoad,0.85,'saturated max');
const eventsAtCap=o.appliedEffectSequence;
take([receipt(15,[3,0,0])], 'saturated additional acceptance');
eq(o.appliedEffectSequence,eventsAtCap,'saturated receipt creates NO false applied effect');
eq(o.receivedTotal,14,'acceptance counters unchanged');
// Recovery is not a new input event; it changes no event stream.
const beforeRecovery=o.appliedEffectSnapshot();
o.update(0.25);r.update(0.25);parity('mounted recovery');
eq(o.appliedEffectSnapshot(),beforeRecovery,'recovery does not emit effect');
take([receipt(16,[0,1,0])], 'new receipt after recovery');
eq(o.appliedEffectSequence,eventsAtCap+1,'fresh effective receipt after recovery emits');
// No Vascular update during an unmounted span: no drift, no generated event.
const paused=o.snapshot(), pausedEffects=o.appliedEffectSnapshot();
for(let i=0;i<20;i++) {parity(`unmounted ${i}`);}
eq(o.snapshot(),paused,'unmounted state stationary');
eq(o.appliedEffectSnapshot(),pausedEffects,'unmounted effect stream stationary');
// A saturated/bounded stress session; count and lineage cannot be reset by rollover.
for(let i=17;i<=400;i++) {
  o.update(0.25);r.update(0.25);
  take([receipt(i,[1+(i%5),0,0])],`stress ${i}`);
}
const stream=o.appliedEffectSnapshot();
ok(stream.prunedEffects>0,'bounded stream pruning exercised');
eq(stream.prunedEffects+stream.retainedCount,stream.lastAppliedEffectSequence,'pruned + retained = sequence');
eq(o.appliedEffectSnapshot({afterSequence:stream.lastAppliedEffectSequence}).records.length,0,'latest cursor empty');
eq(o.appliedEffectSnapshot({afterSequence:stream.lastAppliedEffectSequence-1}).records.length,1,'latest cursor one');
// An emitted event must not be mutable through a snapshot or a cursor read.
const targetEvent=stream.records.at(-1);
assert.throws(()=>{targetEvent.appliedDelta=999;},TypeError);assertions++;
assert.throws(()=>{targetEvent.parentSiltReceiptId='spoofed';},TypeError);assertions++;
eq(o.appliedEffectSnapshot().records.at(-1),targetEvent,'same immutable record');
// Test strictly separated from old snapshot and remote Host ledger.
ok(!Object.hasOwn(o.snapshot(),'appliedEffects'),'legacy snapshot still exactly old schema');
ok(!Object.hasOwn(o,'hostConnectionReceiptLedger'),'no remote conductor added');
console.log(JSON.stringify({pass:'C0D1-A',result:'OFFLINE_APPLIED_EFFECT_CONTRACT_AND_LEGACY_PARITY_PASS',assertions,
  appliedEffectSequence:stream.lastAppliedEffectSequence,prunedEffects:stream.prunedEffects,
  lastMembraneLoad:o.snapshot().membraneLoad,
  locks:'Vascular flow/recovery and existing snapshot strict parity; Silt/Host/Grave source untouched',
  next:'C0D1-B independent Host-owned authenticated relay (not present here)',
  limitation:'Owner-level offline proof only; application and browser verification require user Windows build.'},null,2));
