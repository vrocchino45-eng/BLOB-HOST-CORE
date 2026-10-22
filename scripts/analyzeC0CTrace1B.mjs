#!/usr/bin/env node
// Read-only analyzer: actual applied presentation properties captured by REC1.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
if (!argv[0] || argv.includes('--help')) {
  console.log('Usage: node scripts/analyzeC0CTrace1B.mjs "recording.json" [--out output.json]');
  process.exit(argv.includes('--help') ? 0 : 2);
}
const input = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
const all = input.events ?? [];
const samples = all.filter(e => e.type === 'vascular-presentation-sample' && e.presentation?.revision === 'C0C-TRACE1-B');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const ranges = (keys) => Object.fromEntries(keys.map(key => {
  const v = samples.map(e => key.split('.').reduce((o,k)=>o?.[k],e.presentation)).filter(finite);
  return [key, {min:v.length?Math.min(...v):null,max:v.length?Math.max(...v):null,first:v[0]??null,last:v.at(-1)??null}];
}));
const tracks = [
  'membraneLoad','directionalFlowScale','receiptCount','actualFlowStrength','actualFlowMagnitude',
  'applied.vesselEmissive','applied.vesselOpacity',
  'applied.foldMeanYScaleRatio','applied.foldMeanEmissive','applied.foldMeanOpacity',
  'applied.braidMeanEmissive','applied.moteMeanEmissive','applied.moteMeanOpacity',
  'sourceContribution.foldEmissive','sourceContribution.vesselOpacity',
  'otherDrivers.contraction','otherDrivers.synchronization'
];
const problems=[];
const ordinals = all.map(e => e.recorderEventOrdinal).filter(Number.isSafeInteger);
if (ordinals.length && ordinals.some((n,i)=>n!==i+1)) problems.push('Recorder event ordinals are not continuous');
for (const e of samples) {
  const p=e.presentation;
  if (!(p.membraneLoad>=0 && p.membraneLoad<=0.850001)) problems.push('Membrane load out of bounds');
  if (!(p.directionalFlowScale>=0.92 && p.directionalFlowScale<=1.000001)) problems.push('Directional current scale out of bounds');
  if (!Number.isSafeInteger(p.receiptCount) || p.receiptCount<0) problems.push('Invalid receipt count');
  if (p.applied.foldCount<0 || p.applied.braidCount<0 || p.applied.moteCount<0) problems.push('Invalid mesh count');
}
const loads = samples.map(e=>e.presentation.membraneLoad);
const loadDecreased = loads.some((v,i)=>i>0 && v<loads[i-1]-0.001);
const loadIncreased = loads.some((v,i)=>i>0 && v>loads[i-1]+0.001);
const receiptEvents=all.filter(e=>e.type==='vascular-silt-signal-received');
const hostEvents=all.filter(e=>e.type==='host-silt-cause-observed');
const report = {
  pass: 'C0C-TRACE1-B',
  result: problems.length ? 'INVALID_PRESENTATION_RECORDING'
    : !samples.length ? 'INCOMPLETE_NO_PRESENTATION_SAMPLES'
    : 'PRESENTATION_VALUES_RECORDED_NOT_PERCEPTUAL_PROOF',
  recording: path.basename(argv[0]),
  counts: { totalEvents:all.length, presentationSamples:samples.length,
    siltHostCauses:hostEvents.length, vascularReceiptEvents:receiptEvents.length },
  changes: { loadIncreasedWithinSamples:loadIncreased, loadDecreasedWithinSamples:loadDecreased,
    multipleIndependentVisualDrivers: true },
  range: ranges(tracks),
  issues: [...new Set(problems)],
  limitations: [
    'Observations are sampled every ~500ms only while Vascular is mounted.',
    'Published object parameters are not actual pixel luminance, frame-time visual contrast or player perception.',
    'Host rhythm, cadence, gestures and camera can change presentation independent of Silt.',
    'Silt receipts are provenance signals; no grain transport or progression is implied.'
  ]
};
const i=argv.indexOf('--out');
if(i>=0){if(!argv[i+1])throw new Error('Missing --out filename');fs.writeFileSync(argv[i+1],JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
process.exitCode=problems.length?1:0;
