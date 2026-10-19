import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VascularSiltSignalReceiver } from '../src/routes/VascularSiltSignalReceiver.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { WorldObjectCensusSystem } from '../src/debug/WorldObjectCensusSystem.js';

const release = (sequence, overrides={}) => ({
  sequence, kind:'silt-trajectory', outcome:'released-with-trajectory', reason:'deliberate-release',
  noMaterialTransfer: true, progressionCredit: false, unitId:'silt-grain-03',
  siltElapsedSeconds: sequence * .7, position: [-5,-2,-11], velocity:[1.2, 0.4, -0.8], ...overrides
});
let passes = 0;
const test = (name, body) => {body(); passes++; console.log('PASS', name);};
const ledger = () => new HostConnectionReceiptLedger();
const f = path => fs.readFileSync(new URL('../src/'+path,import.meta.url),'utf8');

test('No provenance produces no Vascular local response', () => {
  const r=new VascularSiltSignalReceiver(); assert.equal(r.receive(ledger().snapshot()),0);
  assert.equal(r.snapshot().receivedTotal,0); assert.equal(r.flowScale,1); assert.equal(r.membraneLoad,0);
});
test('Verified one-grain deliberate Silt release triggers one bounded local receiving load',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(5));
  assert.equal(r.receive(l.snapshot()),1); assert.equal(r.receivedTotal,1);
  assert.ok(r.membraneLoad > 0.14 && r.membraneLoad < .21);
  assert.ok(r.flowScale < 1 && r.flowScale >= .92775);
  assert.equal(r.snapshot().lastSubjectId,'silt-grain-03');
});
test('On repeated update/re-entry an old receipt cannot apply again',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(5));r.receive(l.snapshot());
  const prior=r.membraneLoad;for(let i=0;i<150;i++)assert.equal(r.receive(l.snapshot()),0);
  assert.equal(r.membraneLoad,prior); assert.equal(r.receivedTotal,1);
});
test('Second distinct Silt release applies only one additional response',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(5));r.receive(l.snapshot());
  l.observeSiltRelease(release(6,{unitId:'silt-grain-06'}));
  assert.equal(r.receive(l.snapshot()),1); assert.equal(r.receivedTotal,2);
  assert.equal(r.lastSubjectId,'silt-grain-06');assert.equal(r.lastSequence,2);
});
test('Receiving 64 signals respects load ceiling and directional flow cap',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();for(let i=1;i<=64;i++)l.observeSiltRelease(release(i));
  assert.equal(r.receive(l.snapshot()),64); assert.equal(r.receivedTotal,64);
  assert.equal(r.membraneLoad,.85);assert.equal(r.flowScale,1-.85*.085);
  assert.equal(r.snapshot().recentReceipts.length,32);
});
test('Relaxation is bounded, deterministic, and only driven by mounted route updates',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(1));r.receive(l.snapshot());
  const start=r.membraneLoad;r.update(1);assert.ok(r.membraneLoad<start && r.membraneLoad>0);
  assert.equal(r.snapshot().receivedTotal,1);r.update(NaN);assert.ok(Number.isFinite(r.membraneLoad));
  assert.equal(r.receive(l.snapshot()),0);
});
test('Neither the Host receipt nor Vascular response can manufacture matter or route progression',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();const original=l.observeSiltRelease(release(1));r.receive(l.snapshot());
  assert.equal(original.effectType,'observed_only');assert.equal(original.worldConsequence,false);
  assert.equal(original.routeCredit,false);assert.equal(original.materialTransfer,false);
  const s=r.snapshot();assert.equal(s.noMaterialArrival,true);assert.equal(s.noNewMaterial,true);
  assert.equal(s.altersProgression,false);assert.equal(s.altersCadenceReads,false);
});
test('Invalid Silt releases, seated returns, and plain Pulse never deliver signal',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();
  assert.equal(l.observeSiltRelease(release(1,{reason:'region-hidden'})),null);
  assert.equal(l.observeSiltRelease(release(2,{kind:'silt-seat',outcome:'plate-seated'})),null);
  assert.equal(l.observeSiltRelease(release(3,{kind:'pulse-route'})),null);
  assert.equal(r.receive(l.snapshot()),0);
});
test('Malformed ledger records cannot add load despite correct sequence',()=>{
  const r=new VascularSiltSignalReceiver();const l=ledger();l.observeSiltRelease(release(4));
  const changed = {...l.snapshot(),records:[{...l.snapshot().records[0],materialTransfer:true}]};
  assert.equal(r.receive(changed),0);assert.equal(r.membraneLoad,0);
});
test('Pruned Host receipts are counted as missing, never invented',()=>{
  const l=new HostConnectionReceiptLedger({limit:3}),r=new VascularSiltSignalReceiver();
  for(let i=1;i<=9;i++)l.observeSiltRelease(release(i));
  assert.equal(r.receive(l.snapshot()),3); assert.equal(r.snapshot().sourceReceiptGaps,6);
  assert.equal(r.snapshot().receivedTotal,3);
});
test('Incompatible ledger has no authority',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(1));
  assert.equal(r.receive({...l.snapshot(),pass:'UNKNOWN'}),0);
});
test('Vascular owns receiver and reads Host ledger only during its mounted update',()=>{
  const s=f('routes/VascularRhythmRouteSystem.js');
  assert.match(s,/this\.siltSignalReceiver = new VascularSiltSignalReceiver\(\)/);
  const update=s.slice(s.indexOf('  update(dt, frameState) {'),s.indexOf('  applyHostRhythmVisual('));
  assert.ok(update.indexOf('frameState.activeCellId !== ROUTE_CELL_ID')<update.indexOf('siltSignalReceiver.receive'));
  assert.match(update,/siltSignalReceiver\.receive\(this\.hostConnectionReceiptLedger\?\.snapshot\(\)/);
  assert.match(s,/siltSignalResponse: this\.siltSignalReceiver\.snapshot\(\)/);
});
test('Receiver affects directional flow owned by Vascular, not progression',()=>{
  const s=f('routes/VascularRhythmRouteSystem.js');
  const a=s.slice(s.indexOf('  applyDynamicCurrent('),s.indexOf('  animate('));
  const b=s.slice(s.indexOf('  updateCadence('),s.indexOf('  updateTraversalMaterialResponse('));
  assert.match(a,/\* this\.siltSignalReceiver\.flowScale/);
  assert.match(a,/remoteSiltMembraneLoad:/);
  assert.doesNotMatch(b,/siltSignalReceiver/);
});
test('Existing tissue and motes reflect load without adding new mesh, markers or route state',()=>{
  const s=f('routes/VascularRhythmRouteSystem.js');const a=s.slice(s.indexOf('  animate('),s.indexOf('  pulseWindowOpen() {'));
  assert.match(a,/const remoteSiltLoad = this\.siltSignalReceiver\.membraneLoad/);
  assert.match(a,/fold\.scale\.y =/); assert.match(a,/remoteSiltLoad \* 0\.22/);
  assert.match(a,/currentSpeed[\s\S]*?this\.siltSignalReceiver\.flowScale/);
});
test('Old Host provenance remains signal-only even when Vascular has locally responded',()=>{
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(9));r.receive(l.snapshot());
  assert.equal(l.forVascular().signalOnly,true);
  assert.equal(l.forVascular().circulationChanged,false);
  assert.equal(r.snapshot().localResponseApplied,true);
});
test('Camera targeting repair, single ledger, and recorder registration preserved',()=>{
  const s=f('core/GameRuntime.js');
  assert.match(s,/this\.siltPressureRouteSystem = new SiltPressureRouteSystem\(\{[\s\S]*?camera: this\.camera/);
  assert.equal((s.match(/hostConnectionReceiptLedger: this.hostConnectionReceiptLedger/g)??[]).length,2);
  assert.match(s,/new WorldObjectCensusSystem\(/);
});
test('Recorder exports receiver independently with per-receipt events',()=>{
  const fs={input:{},vascularRhythmRoute:{}};const recorder=new WorldObjectCensusSystem({scene:null,frameState:fs});
  recorder.captureActive=true;recorder.lastVascularReceivedSequence=0;
  const l=ledger(),r=new VascularSiltSignalReceiver();l.observeSiltRelease(release(1));l.observeSiltRelease(release(2));
  r.receive(l.snapshot());fs.vascularRhythmRoute.siltSignalResponse=r.snapshot();
  recorder.sampleVascularSiltResponse();recorder.sampleVascularSiltResponse();
  const sum=recorder.timelineSummary();
  assert.equal(sum.eventCounts['vascular-silt-signal-received'],2);
  assert.equal(sum.hostConnections.vascularLocalResponse.receivedTotal,2);
  assert.equal(sum.hostConnections.vascularLocalResponse.noMaterialArrival,true);
});
test('Recorder does not falsely register 2 past receipts on capture start',()=>{
  const fs={input:{},vascularRhythmRoute:{}};const r=new VascularSiltSignalReceiver(),l=ledger();
  l.observeSiltRelease(release(1));l.observeSiltRelease(release(2));r.receive(l.snapshot());
  fs.vascularRhythmRoute.siltSignalResponse=r.snapshot();const c=new WorldObjectCensusSystem({scene:null,frameState:fs});
  c.captureActive=true;c.lastVascularReceivedSequence=2;c.sampleVascularSiltResponse();
  assert.equal(c.timelineSummary().eventCounts['vascular-silt-signal-received']??0,0);
});
test('NOTICE explicitly distinguishes local response from grain arrival',()=>{
  const s=f('routes/VascularRhythmRouteSystem.js');
  assert.match(s,/SILT SIGNAL RECEIVED · LOCAL RESPONSE/);
  assert.match(s,/No grain arrival \/ no progression credit/);
});
console.log(`LS1E2 VALIDATION: ${passes}/${passes} assertions passed`);
