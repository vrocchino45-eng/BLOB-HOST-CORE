#!/usr/bin/env node
// Read-only VIS1-A applied-anatomy trace check; no inferred pixel contrast.
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const filename = args.find(arg => !arg.startsWith('--') && args[args.indexOf(arg)-1] !== '--out');
if (!filename) {
  console.error('Usage: node scripts/analyzeC0CVis1A.mjs "ACTUAL_RECORDING.json" [--out VIS1_A_ANALYSIS.json]');
  process.exit(2);
}
const destination = args.includes('--out') ? args[args.indexOf('--out')+1] : null;
const record = JSON.parse(fs.readFileSync(filename,'utf8'));
const retained = record.summary?.captureRetention ?? {};
const presentation = (record.events ?? []).filter(event => event.type==='vascular-presentation-sample').map(event => ({
  time:event.time,
  data:event.presentation
}));
const vis1 = presentation.filter(entry => entry.data?.vis1?.revision==='C0C-VIS1-A');
const finite = nums=>nums.filter(Number.isFinite);
const metric=(rows, read)=> {
  const values=finite(rows.map(read));
  return values.length ? { first:values[0],last:values.at(-1),min:Math.min(...values),max:Math.max(...values)} : null;
};
const errors=[];
for (const entry of vis1) {
  const v=entry.data.vis1;
  if (v.presentationOnly!==true || v.altersCurrentOrProgress!==false) errors.push('Reported VIS1 mode violates presentation-only boundary');
  if (v.peakRadialCompression < 0 || v.peakRadialCompression > .26001) errors.push('Compression outside VIS1 bounded contract');
  if (v.meanYExpansion < 0 || v.meanYExpansion > .33001) errors.push('Expansion outside VIS1 bounded contract');
  if (v.membraneLoad===0 && (v.peakRadialCompression!==0 || v.mode!=='unloaded_no_op')) errors.push('Nonzero deformation at zero authoritative load');
  if (v.membraneLoad>0 && v.foldCount!==9) errors.push('Incomplete fold coverage while loaded');
}
const report={
  pass:'C0C-VIS1-A',
  status:vis1.length ? (errors.length ? 'VIS1_RECORDED_WITH_CONTRACT_ISSUES' : 'VIS1_APPLIED_VALUES_RECORDED_PERCEPTION_OPEN') : 'INCOMPLETE_NO_VIS1_SAMPLES',
  recording:path.basename(filename),
  durationSeconds: record.captureDurationSeconds ?? null,
  recorder: { eventsObserved:retained.totalEventsObserved??null,retainedDetails:retained.retainedDetails??null,droppedDetails:retained.droppedDetails??null },
  circuit: {siltCauses:record.summary?.eventCounts?.['host-silt-cause-observed']??0,
    vascularReceipts:record.summary?.eventCounts?.['vascular-silt-signal-received']??0},
  samples: {presentation:presentation.length,vis1:vis1.length,loaded:vis1.filter(v=>v.data.vis1.membraneLoad>0).length,unloaded:vis1.filter(v=>v.data.vis1.membraneLoad===0).length,
    arrivalWave:vis1.filter(v=>v.data.vis1.receiptArrivalStrength>0).length},
  ranges: {load:metric(vis1,s=>s.data.vis1.membraneLoad),
    compression:metric(vis1,s=>s.data.vis1.meanRadialCompression),
    expansion:metric(vis1,s=>s.data.vis1.meanYExpansion),
    appliedFoldX:metric(vis1,s=>s.data.applied?.foldMeanXScaleRatio),
    appliedFoldY:metric(vis1,s=>s.data.applied?.foldMeanYScaleRatio),
    appliedFoldZ:metric(vis1,s=>s.data.applied?.foldMeanZScaleRatio)},
  errors:[...new Set(errors)],
  limitations:['TRACE1-B samples are scene object parameters, not pixels or verified human perception.',
    'A Silt-no-receipt comparison using similar camera framing is needed for perceptual acceptance.',
    'Host receipts are signals, not physical grain transport or new material.']
};
if(destination) fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length) process.exitCode=1;
