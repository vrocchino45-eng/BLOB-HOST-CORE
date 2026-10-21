import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(path.join(base, 'src/debug/WorldObjectCensusSystem.js'), 'utf8');
const mod = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const Recorder = mod.WorldObjectCensusSystem;
const results = [];
function test(name, fn) { return Promise.resolve().then(fn).then(() => results.push({name,pass:true})); }

const recorder = new Recorder({scene:{traverse:()=>{}}, frameState:{}});
recorder.authoritySnapshot = () => ({ heldMaterialMotion: { cumulativePullDistance: 0 },
  hostConnections: null, vascularHostObservation: null, vascularSiltSignalResponse: null,
  siltTrajectoryField: {}, siltTrajectory: {}, siltPlateSeat: {}, siltContact: {} });
recorder.snapshot = () => ({testCensus:true});
recorder.captureActive = true;
recorder.captureStartedAt = new Date(Date.now()-12*60*1000).toISOString();
recorder.capturePullBaseline = 0;

await test('full chronology is retained beyond 2500 details (4592 actual-field scale)', () => {
  for(let i=0;i<4592;i++) recorder.recordEvent(i%3===0?'gamepad-axes':'game-pulse-event', {
    pulseEventId: i, heldTargetAtSample:null, extra:i });
  assert.equal(recorder.captureEvents.length,4592);
  assert.equal(recorder.captureAggregate.recordedEvents,4592);
  assert.equal(recorder.captureAggregate.droppedDetails,0);
  assert.equal(recorder.captureEvents[0].extra,0);
  assert.equal(recorder.captureEvents.at(-1).extra,4591);
  assert.equal(recorder.captureEvents[0].recorderEventOrdinal,1);
  assert.equal(recorder.captureEvents.at(-1).recorderEventOrdinal,4592);
});
await test('the current 2500-detail rollover has been removed', () => {
  assert(!source.includes('captureEvents.shift()'));
  assert(!source.includes('if (this.captureEvents.length > 2500)'));
  const summary=recorder.timelineSummary();
  assert.equal(summary.captureRetention.fullSessionRecorderDetailsRetained,true);
  assert.equal(summary.captureRetention.retainedDetails,4592);
  assert.equal(summary.captureRetention.droppedDetails,0);
  assert.equal(summary.captureRetention.detailedListsContainOnlyLast2500,false);
});
await test('material and receiver receipts can be paired across an uninterrupted session', () => {
  const id='CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:141';
  recorder.recordEvent('host-silt-cause-observed', {cause:{id,subjectId:'silt-grain-06',materialTransfer:false}});
  recorder.recordEvent('vascular-silt-signal-received', {receipt:{receiptId:id,loadAfter:0.3722}});
  const src=recorder.captureEvents.find(e=>e.type==='host-silt-cause-observed');
  const dst=recorder.captureEvents.find(e=>e.type==='vascular-silt-signal-received');
  assert.equal(src.cause.id,dst.receipt.receiptId);
  assert(src.recorderEventOrdinal<dst.recorderEventOrdinal);
});
await test('25-minute-scale capture continues without silent truncation or invented source facts', () => {
  for(let i=recorder.captureEvents.length; i<12000; i++) recorder.recordEvent('gamepad-button-edge', {buttonIndex:i%16,pressed:!!(i%2)});
  assert.equal(recorder.captureEvents.length,12000);
  assert.equal(recorder.captureAggregate.droppedDetails,0);
  assert.equal(recorder.timelineSummary().captureRetention.siltSourceTraceGaps,0);
  recorder.recordEvent('silt-decision-trace-gap', {lastRecordedSequence:17,firstAvailableSequence:83});
  assert.equal(recorder.timelineSummary().captureRetention.siltSourceTraceGaps,1);
});
await test('compact export is complete, parseable, and correctly labeled', async () => {
  const origDoc=globalThis.document, origURL=globalThis.URL;
  let savedBlob, filename;
  const urlObj={createObjectURL(blob){savedBlob=blob;return 'blob:test';},revokeObjectURL(){}};
  globalThis.URL = Object.assign(class MockURL {},urlObj);
  globalThis.document={createElement:()=>({click(){},set href(x){},set download(x){filename=x;}})};
  recorder.updateRecordIndicator=()=>{};
  try {
    recorder.captureActive=false;
    recorder.captureStoppedAt=new Date().toISOString();
    recorder.exportTimeline();
    assert(savedBlob);
    const json=await savedBlob.text();
    const parsed=JSON.parse(json);
    assert.equal(filename,'BLOB_LS1E2_C0C_REC1_OBSERVATION.json');
    assert.equal(parsed.recorderSchemaVersion,2);
    assert.equal(parsed.recorderRevision,'C0C-REC1');
    assert.equal(parsed.events.length,12001);
    assert.equal(parsed.events[0].extra,0);
    assert.equal(parsed.events.at(-1).type,'silt-decision-trace-gap');
    assert.equal(parsed.summary.captureRetention.fullSessionRecorderDetailsRetained,true);
    assert.equal(parsed.summary.captureRetention.droppedDetails,0);
    assert(!json.includes('\n  "'));
    assert(parsed.captureDurationSeconds>=0);
  } finally {globalThis.URL=origURL;globalThis.document=origDoc;}
});

const report={pass:'C0C-REC1',baseline:'LS1E2/WorldObjectCensusSystem.js',
  testCount:results.length,passed:results.filter(r=>r.pass).length,tests:results,
  proofLimit:'Offline functional unit checks, not full Vite/browser field playback. The 64-entry Silt source trace and 150ms sampling are unchanged.'};
writeFileSync(path.join(base,'VALIDATION_C0C_REC1.json'),JSON.stringify(report,null,2)+'\n');
console.log(`C0C-REC1: ${report.passed}/${report.testCount} recorder checks passed`);
