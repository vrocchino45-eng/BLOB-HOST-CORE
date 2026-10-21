/** Offline independent fixtures for C0C-TRACE1-A, no gameplay imports. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { resolve } from 'node:path';
import {traceC0CCircuit,auditPresentationSource} from './traceC0CCircuit.mjs';
const receiptId='CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:9';
const baseTime='2026-10-21T00:00:00.000Z';
const ev=(type,ordinal,supp={})=>({type,recorderEventOrdinal:ordinal,time:new Date(Date.parse(baseTime)+ordinal*1000).toISOString(),...supp});
const makeFixture=()=>{
 const events=[
  ev('capture-started',1),
  ev('silt-authoritative-route-decision',2,{decision:{sequence:9,kind:'silt-trajectory',outcome:'released-with-trajectory',unitId:'silt-grain-03',velocity:[1,0,0]}}),
  ev('host-silt-cause-observed',3,{cause:{id:receiptId,sequence:1,sourceReceiptSequence:9,subjectId:'silt-grain-03',sourceCellId:'CELL_SILT_PRESSURE_ROUTE_001',effectType:'observed_only',materialTransfer:false,routeCredit:false}}),
  ev('vascular-silt-signal-received',4,{receiverCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001',receipt:{sequence:1,receiptId,subjectId:'silt-grain-03',loadAfter:.1769}}),
  ev('capture-stopped',5)];
 return {recorderRevision:'C0C-REC1',captureStartedAt:baseTime,captureDurationSeconds:5,events,summary:{captureRetention:{retainedDetails:5,droppedDetails:0},hostConnections:{finalState:{records:[{id:receiptId}]},vascularLocalResponse:{receivedTotal:1,sourceReceiptGaps:0,membraneLoad:.15,directionalFlowScale:1-.15*.085}}}};
};
let n=0;
function check(f){f();n++;}
check(()=>assert.equal(traceC0CCircuit(makeFixture()).result,'OBSERVED_CHAIN'));
check(()=>assert.equal(traceC0CCircuit(makeFixture()).counts.traces,1));
check(()=>assert.equal(traceC0CCircuit(makeFixture()).traces[0].traceStatus,'OBSERVED_AUTHENTICATED_CHAIN'));
check(()=>assert.equal(traceC0CCircuit(makeFixture()).recovery.receded,true));
check(()=>assert.equal(traceC0CCircuit(makeFixture()).visualFeelProof,'NOT_ESTABLISHED_BY_JSON'));
check(()=>assert.equal(traceC0CCircuit(makeFixture()).presentationWiring.status,'NOT_CHECKED'));
check(()=>{const d=makeFixture();d.events[3].receipt.subjectId='silt-grain-04';assert.equal(traceC0CCircuit(d).result,'CONTRADICTION');});
check(()=>{const d=makeFixture();d.events[3].receipt.loadAfter=1.2;assert.equal(traceC0CCircuit(d).result,'CONTRADICTION');});
check(()=>{const d=makeFixture();d.events[2].cause.materialTransfer=true;assert.equal(traceC0CCircuit(d).result,'CONTRADICTION');});
check(()=>{const d=makeFixture();d.events[1].decision.unitId='silt-grain-05';assert.equal(traceC0CCircuit(d).result,'CONTRADICTION');});
check(()=>{const d=makeFixture();d.events.splice(3,1);d.events[3].recorderEventOrdinal=4;d.summary.captureRetention.retainedDetails=4;assert.equal(traceC0CCircuit(d).result,'EVIDENCE_INCOMPLETE');});
check(()=>{const d=makeFixture();d.events[3].recorderEventOrdinal=8;assert.equal(traceC0CCircuit(d).capture.ordinalsConsecutive,false);});
check(()=>{const d=makeFixture();d.summary.hostConnections.vascularLocalResponse.directionalFlowScale=.3;assert.equal(traceC0CCircuit(d).result,'CONTRADICTION');});
check(()=>assert.equal(auditPresentationSource('').status,'NOT_CHECKED'));
check(()=>assert.equal(auditPresentationSource('irrelevant').status,'SOURCE_RECONCILIATION_NEEDED'));
const ref=process.argv.find(x=>x.startsWith('--source='))?.split('=').slice(1).join('=');
if(ref) check(()=>assert.equal(auditPresentationSource(readFileSync(resolve(ref),'utf8')).status,'SOURCE_SIGNALS_FOUND'));
console.log(JSON.stringify({pass:'C0C-TRACE1-A',result:'OFFLINE_READ_ONLY_TRACE_TEST_PASS',assertions:n,sourceSignatureAudit:ref?'PASS':'NOT_REQUESTED',gameplayFilesModified:0},null,2));
