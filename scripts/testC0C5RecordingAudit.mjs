/** C0C5-A1 test-only synthetic fixtures: fail closed on contradictions. */
import assert from 'node:assert/strict';
import { analyzeC0C5Recording } from './analyzeC0C5Recording.mjs';
const CELL='CELL_SILT_PRESSURE_ROUTE_001';
const id=`${CELL}:silt-trajectory:11`;
const source={schemaVersion:1,id,sequence:1,kind:'silt_material_disturbance_observed',sourceCellId:CELL,
  sourceSystem:'SiltPressureRouteSystem',sourceReceiptSequence:11,subjectId:'silt-grain-01',
  origin:[0,0,0],releaseVelocity:[1,0,0],effectType:'observed_only',targetCellId:null,
  materialTransfer:false,routeCredit:false,worldConsequence:false};
const baseline={type:'authority-baseline',state:{cycleMass:8}};
const release={type:'silt-authoritative-route-decision',decision:{kind:'silt-trajectory',outcome:'released-with-trajectory',sequence:11,unitId:'silt-grain-01'}};
const cause={type:'host-silt-cause-observed',cause:source};
const received={type:'vascular-silt-signal-received',receipt:{sequence:1,receiptId:id,subjectId:'silt-grain-01',loadAfter:.162},receiverCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001'};
function sample() {
  const events=[{type:'capture-started'},baseline,release,cause,received,{type:'capture-stopped'}]
    .map((x,i)=>({...x,recorderEventOrdinal:i+1}));
  return {pass:'synthetic',recorderRevision:'C0C-REC1',recorderSchemaVersion:2,events,
    summary:{captureRetention:{totalEventsObserved:events.length,retainedDetails:events.length,droppedDetails:0,fullSessionRecorderDetailsRetained:true},
      hostConnections:{finalState:{acceptedTotal:1,records:[source],materialTransfer:false,routeCredit:false},
        vascularLocalResponse:{owner:'VascularRhythmRouteSystem',receivedTotal:1,sourceReceiptGaps:0,
          lastReceiptId:id,lastSubjectId:'silt-grain-01',membraneLoad:.125,directionalFlowScale:Number((1-.125*.085).toFixed(4)),
          noMaterialArrival:true,noNewMaterial:true,altersProgression:false,altersCadenceReads:false}}},
    finalAuthority:{cycleMass:8}};
}
const status=(s,n)=>{const a=analyzeC0C5Recording(s);if(n)assert(a.checks.some(x=>x.name===n&&x.status==='FAIL'),JSON.stringify(a.checks));return a;};
const good=status(sample());
assert.equal(good.status,'OBSERVED_CHAIN_WITH_OPEN_GATES');
assert.equal(good.counts.failed,0);
assert(good.checks.find(x=>x.name==='recovery after last receipt observed').status==='PASS');
const duplication=sample(); duplication.events.splice(5,0,{...received});duplication.events=duplication.events.map((x,i)=>({...x,recorderEventOrdinal:i+1}));
const du=status(duplication,'received-event identities unique');assert.equal(du.status,'FAIL');
const forged=sample();forged.summary.hostConnections.finalState.records[0]={...source,materialTransfer:true};
status(forged,'no malformed observed source receipts');
const changed=sample();changed.summary.hostConnections.vascularLocalResponse.directionalFlowScale=.8;
status(changed,'Vascular bounds and current mathematical relation');
const missing=sample();missing.events=missing.events.filter(e=>e.type!=='vascular-silt-signal-received')
  .map((x,i)=>({...x,recorderEventOrdinal:i+1}));missing.summary.captureRetention.totalEventsObserved=missing.events.length;missing.summary.captureRetention.retainedDetails=missing.events.length;
assert.equal(status(missing).status,'INCOMPLETE_FIELD_EVIDENCE');
const dropped=sample();dropped.summary.captureRetention.droppedDetails=1;
status(dropped,'recorder retention exact');
const mass=sample();mass.finalAuthority.cycleMass=9;status(mass,'Silt cycle mass preserved');
const order=sample();order.events.at(-1).recorderEventOrdinal=99;status(order,'recorder consecutive ordinals');
const conflict=sample();conflict.events.find(e=>e.type==='silt-authoritative-route-decision').decision.unitId='silt-grain-04';
status(conflict,'matched Silt release identity not contradicted');
console.log(JSON.stringify({pass:'C0C5-A1',result:'READ_ONLY_AUDIT_SELFTEST_PASS',positiveFixture:'OBSERVED_CHAIN_WITH_OPEN_GATES',negativeCases:8,conformance:'no gameplay imports or state mutation'},null,2));
