/**
 * BLOB / C0C-TRACE1-A: Read-only causal chain inspector.
 * Requires a REC1 JSON export. Never mutates gameplay state, and never
 * substitutes signal provenance for transported material or progression.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const finite = x => typeof x === 'number' && Number.isFinite(x);
const near = (a, b, eps=.0002) => finite(a) && finite(b) && Math.abs(a-b) <= eps;
const stamp = x => typeof x === 'string' && !Number.isNaN(Date.parse(x)) ? Date.parse(x) : null;
const secs = (event, zero) => stamp(event?.time) === null || zero === null ? null : Math.round((stamp(event.time)-zero)/10)/100;
const bySeq = (xs, get) => new Map(xs.map(x => [get(x), x]));
const num = x => finite(x) ? x : null;
const fmt = x => finite(x) ? +x.toFixed(4) : null;

const endpoints = [
  { id:'directional-flow', meaning:'Physical current force on Core', signatures:[/applyDynamicCurrent\(frameState, sample\)/, /const flowStrength\s*=\s*baseFlowStrength[\s\S]{0,450}?\*\s*this\.siltSignalReceiver\.flowScale\s*;/] },
  { id:'current-mote-motion', meaning:'Moving visual current-mote speed', signatures:[/const currentSpeed\s*=[\s\S]{0,400}?\*\s*this\.siltSignalReceiver\.flowScale\s*;/] },
  { id:'membrane-emissive', meaning:'Vessel surface emissive intensity', signatures:[/const remoteSiltLoad\s*=\s*this\.siltSignalReceiver\.membraneLoad\s*;/, /vesselEnvelope\.material\.emissiveIntensity[\s\S]{0,230}?remoteSiltLoad\s*\*\s*\(0\.17\s*\+\s*0\.075/] },
  { id:'membrane-opacity', meaning:'Vessel opacity', signatures:[/vesselEnvelope\.material\.opacity\s*=[\s\S]{0,120}?remoteSiltLoad\s*\*\s*0\.048/] },
  { id:'braid-emissive', meaning:'Braid/tube emissive intensity', signatures:[/tube\.material\.emissiveIntensity\s*=[\s\S]{0,210}?remoteSiltLoad\s*\*\s*\(0\.12\s*\+\s*0\.035/] },
  { id:'diagnostic', meaning:'Developer readout; not an in-world presentation', signatures:[/updateHostCauseNotice\(active, cause\)/, /Membrane load:\s*\$\{receiver\.membraneLoad\.toFixed\(3\)\}/] }
];

export function auditPresentationSource(source) {
  if (typeof source !== 'string' || !source.trim()) return { status:'NOT_CHECKED', message:'Source not provided; cannot attest to installed presentation wiring', endpoints:[] };
  const results = endpoints.map(e=>({ id:e.id, meaning:e.meaning, status:e.signatures.every(r=>r.test(source)) ? 'FOUND' : 'NOT_FOUND' }));
  return { status: results.every(e=>e.status==='FOUND') ? 'SOURCE_SIGNALS_FOUND' : 'SOURCE_RECONCILIATION_NEEDED',
    message:'Static source presence only; no browser pixels, camera visibility, sound, or perceived response attested', endpoints:results };
}

export function traceC0CCircuit(data, options={}) {
  if (!data || !Array.isArray(data.events)) throw Error('Expected REC1 export with events array');
  const events=data.events;
  const zero=stamp(data.captureStartedAt);
  const releases=events.filter(e=>e.type==='silt-authoritative-route-decision' && e.decision?.kind==='silt-trajectory' && e.decision?.outcome==='released-with-trajectory');
  const causes=events.filter(e=>e.type==='host-silt-cause-observed');
  const receivers=events.filter(e=>e.type==='vascular-silt-signal-received');
  const releaseMap=bySeq(releases, e=>e.decision.sequence);
  const causeMap=bySeq(causes,e=>e.cause?.id);
  const receiverMap=bySeq(receivers,e=>e.receipt?.receiptId);
  const ids=new Set([...causes.map(e=>e.cause?.id), ...receivers.map(e=>e.receipt?.receiptId)]);
  const ledger=data.summary?.hostConnections?.finalState;
  const state=data.summary?.hostConnections?.vascularLocalResponse ?? data.finalAuthority?.vascularSiltSignalResponse;
  const issues=[];
  if (new Set(causes.map(e=>e.cause?.id)).size !== causes.length) issues.push('Duplicate Host cause event ID');
  if (new Set(receivers.map(e=>e.receipt?.receiptId)).size !== receivers.length) issues.push('Duplicate accepted Vascular receipt event ID');
  const traces=[];
  for (const id of ids) {
    const c=causeMap.get(id), r=receiverMap.get(id), d=releaseMap.get(c?.cause?.sourceReceiptSequence);
    const errors=[];
    if (c && (!d || d.decision.unitId !== c.cause.subjectId)) errors.push('No matching source release in observed session');
    if (c && c.cause.sourceCellId !== SILT) errors.push('Invalid source cell');
    if (c && c.cause.effectType !== 'observed_only') errors.push('Unexpected material effect type');
    if (c && (c.cause.materialTransfer !== false || c.cause.routeCredit !== false)) errors.push('Unsafe material or progress claim');
    if (r && r.receiverCellId !== VASCULAR) errors.push('Invalid receiving cell');
    if (c && r && c.cause.subjectId !== r.receipt.subjectId) errors.push('Grain identity mismatch');
    if (d && c && d.recorderEventOrdinal >= c.recorderEventOrdinal) errors.push('Release not before cause');
    if (c && r && c.recorderEventOrdinal >= r.recorderEventOrdinal) errors.push('Cause not before Vascular acceptance');
    if (r && (!finite(r.receipt.loadAfter) || r.receipt.loadAfter < 0 || r.receipt.loadAfter > 0.85 + .0001)) errors.push('Receiver load out of bounds');
    issues.push(...errors.map(x=>`${id}: ${x}`));
    const t={
      receiptId:id,
      subjectId:c?.cause?.subjectId ?? r?.receipt?.subjectId ?? null,
      sourceReleaseSequence:c?.cause?.sourceReceiptSequence ?? null,
      hostCauseSequence:c?.cause?.sequence ?? null,
      receiverSequence:r?.receipt?.sequence ?? null,
      phases:{
        siltRelease:d ? { atSeconds:secs(d,zero), eventOrdinal:d.recorderEventOrdinal, velocity:d.decision.velocity, unitId:d.decision.unitId } : null,
        hostCause:c ? { atSeconds:secs(c,zero), eventOrdinal:c.recorderEventOrdinal, effectType:c.cause.effectType, materialTransfer:c.cause.materialTransfer, routeCredit:c.cause.routeCredit } : null,
        vascularReceipt:r ? { atSeconds:secs(r,zero), eventOrdinal:r.recorderEventOrdinal, loadAfter:num(r.receipt.loadAfter) } : null,
        // Derived from source formula, not a REC1 per-frame world observation.
        theoreticalCurrentMultiplier:r && finite(r.receipt.loadAfter) ? fmt(1-r.receipt.loadAfter*.085) : null,
        worldPresentationObservation:null
      },
      traceStatus:errors.length ? 'CONTRADICTION' : (!d||!c||!r) ? 'INCOMPLETE' : 'OBSERVED_AUTHENTICATED_CHAIN',
      issues:errors
    };
    traces.push(t);
  }
  traces.sort((a,b)=>(a.hostCauseSequence ?? Infinity)-(b.hostCauseSequence ?? Infinity));
  const ordinalsOk=events.every((e,i)=>e.recorderEventOrdinal===i+1);
  const retention=data.summary?.captureRetention;
  const recorderComplete=data.recorderRevision==='C0C-REC1' && ordinalsOk && retention?.retainedDetails===events.length && retention?.droppedDetails===0;
  if (!ordinalsOk) issues.push('Event ordinals not consecutive');
  if (state && !near(state.directionalFlowScale,1-state.membraneLoad*.085)) issues.push('Vascular final current relationship mismatch');
  if (state && (state.membraneLoad<0||state.membraneLoad>0.8501)) issues.push('Vascular final load out of bounds');
  if (state && state.receivedTotal!==receivers.length) {
    // Source events may predate recording: classify evidence incomplete, not a contradiction.
  }
  if (ledger && Array.isArray(ledger.records)) {
    for (const r of receivers) if (!ledger.records.some(x=>x.id===r.receipt.receiptId)) issues.push(`Final ledger missing ${r.receipt.receiptId}`);
  }
  const lastObservedLoad=receivers.length ? receivers[receivers.length-1].receipt?.loadAfter : null;
  const recover=state && finite(lastObservedLoad) ? {
    latestAcceptedLoad:lastObservedLoad, finalOwnerLoad:num(state.membraneLoad),
    delta:fmt(lastObservedLoad-state.membraneLoad),
    receded:Boolean(state.membraneLoad < lastObservedLoad),
    caveat:'Only point-in-time receipt loads and final owner snapshot; no per-frame decay curve captured.'
  } : null;
  const presentation=auditPresentationSource(options.presentationSource ?? null);
  const incomplete= !recorderComplete || traces.length===0 || traces.some(t=>t.traceStatus==='INCOMPLETE') || !state;
  const result=issues.length ? 'CONTRADICTION' : incomplete ? 'EVIDENCE_INCOMPLETE' : 'OBSERVED_CHAIN';
  return {
    pass:'C0C-TRACE1-A', result, verifiedBy:'REC1 exported observation (not independent simulation)',
    capture:{ durationSeconds:num(data.captureDurationSeconds), totalEvents:events.length, ordinalsConsecutive:ordinalsOk, recorderComplete },
    counts:{siltRelease:releases.length,hostCause:causes.length,vascularReceipt:receivers.length,traces:traces.length},
    ownerFinal:state ? { receivedTotal:state.receivedTotal, sourceReceiptGaps:state.sourceReceiptGaps, membraneLoad:num(state.membraneLoad), directionalFlowScale:num(state.directionalFlowScale), maximumLoad:0.85 } : null,
    recovery:recover,
    traces,
    presentationWiring:presentation,
    visualFeelProof:'NOT_ESTABLISHED_BY_JSON',
    materialTransportProof:'NOT_CLAIMED',
    progressionEffectProof:'NOT_CLAIMED',
    issues,
    nextGate:'TRACE1-B: timestamped authoritative owner state / presentation parameters in runtime; VIS1: player-perceived change'
  };
}

function usage(){return 'Usage: node scripts/traceC0CCircuit.mjs "REC1.json" [--source src/routes/VascularRhythmRouteSystem.js] [--out report.json]';}
async function main() {
  const args=process.argv.slice(2);
  if (!args.length||args.includes('--help')) { console.log(usage());return; }
  const file=args[0];
  const value=(name)=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  const sourcePath=value('--source'), outPath=value('--out');
  if (args.includes('--source')&&!sourcePath || args.includes('--out')&&!outPath) throw Error(usage());
  const data=JSON.parse(readFileSync(resolve(file),'utf8'));
  const source=sourcePath?readFileSync(resolve(sourcePath),'utf8'):null;
  const report=traceC0CCircuit(data,{presentationSource:source});
  if (outPath) writeFileSync(resolve(outPath),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({pass:report.pass,result:report.result,counts:report.counts,recorderComplete:report.capture.recorderComplete,ownerFinal:report.ownerFinal,recovery:report.recovery,presentationWiring:report.presentationWiring.status,visualFeelProof:report.visualFeelProof,issues:report.issues},null,2));
  if(report.result==='CONTRADICTION') process.exitCode=2;
  else if(report.result==='EVIDENCE_INCOMPLETE') process.exitCode=3;
}
if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(err=>{console.error(`TRACE1-A: ${err.message}`); process.exitCode=1;});
}
