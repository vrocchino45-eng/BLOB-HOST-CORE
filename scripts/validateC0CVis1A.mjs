#!/usr/bin/env node
// Offline verification of exact installed VIS1-A owner behavior and isolation.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ownDir = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const routePath = path.join(root, 'src/routes/VascularRhythmRouteSystem.js');
const patch = JSON.parse(fs.readFileSync(path.join(ownDir, '../patches/C0C_VIS1_A_PATCH.json'), 'utf8'));
const assertion = (condition, why) => { count++; if (!condition) throw new Error(why); };
const sha = x => createHash('sha256').update(x).digest('hex');
let count = 0;
const contents = fs.readFileSync(routePath, 'utf8');
assertion(sha(contents) === patch.targets[0].expectedAfterSha256, 'VIS1 source hash differs: do not infer parity');
assertion(patch.targets.length === 1, 'VIS1 unexpectedly modifies multiple owners');
assertion(patch.targets[0].operations.length === 6, 'VIS1 unexpected patch shape');
let reconstructed = contents;
for (const edit of [...patch.targets[0].operations].reverse()) {
  assertion(reconstructed.split(edit.after).length === 2, 'VIS1 cannot reverse original span');
  reconstructed = reconstructed.replace(edit.after, edit.before);
}
assertion(sha(reconstructed) === patch.targets[0].expectedBeforeSha256, 'Source outside explicit VIS1 spans changed');
const loaded = vm.runInNewContext(
  contents.replace(/^import\s+.*;$/gm, '').replace('export class VascularRhythmRouteSystem', 'class VascularRhythmRouteSystem')
    + '\nVascularRhythmRouteSystem;',
  { THREE: { MathUtils: { clamp: (n, min, max) => Math.max(min, Math.min(max, n)) } },
    VascularSiltSignalReceiver: class {} },
  { filename: routePath }
);
const makeScene = (load, elapsed=8.5, age=30) => {
  const obj = Object.create(loaded.prototype);
  obj.siltSignalReceiver = { membraneLoad:load, receivedTotal:load ? 3 : 0,
    snapshot(){return {membraneLoad:this.membraneLoad, receivedTotal:this.receivedTotal, directionalFlowScale:1-this.membraneLoad*.085};} };
  obj.elapsed=elapsed;
  obj.vis1WaveAge=age;
  obj.vis1LastReceiptTotal=0;
  obj.vis1Applied=null;
  obj.wallFolds = Array.from({length:9}, (_,i) => ({
    name:`vascular_membrane_fold_${i+1}`,scale:{x:1,y:1,z:1},
    userData:{baseScale:{x:1,y:1,z:1}},
    material:{opacity:.26,emissiveIntensity:.19}
  }));
  obj.braidTubes = Array.from({length:3},()=>({material:{emissiveIntensity:.22}}));
  obj.vesselEnvelope = {material:{opacity:.14,emissiveIntensity:.2}};
  obj.currentMotes=[];
  obj.contractionIntensity=.5;
  obj.synchronization=.5;
  obj.turbulence=.1;
  obj.traversalPulseWake=0;
  obj.traversalAbsorbShear=0;
  obj.traversalStabilizeCalm=0;
  obj.grammarReinforcementStrength=0;
  return obj;
};
const freezeReceiver = receiver => {
  Object.defineProperty(receiver, 'membraneLoad', {value: receiver.membraneLoad, writable:false});
  Object.defineProperty(receiver, 'receivedTotal', {value: receiver.receivedTotal, writable:false});
};
let unloaded=makeScene(0);
freezeReceiver(unloaded.siltSignalReceiver);
const unloadedBefore=JSON.stringify({folds:unloaded.wallFolds,braids:unloaded.braidTubes,vessel:unloaded.vesselEnvelope});
unloaded.applySiltPressureAnatomy();
assertion(unloaded.vis1Applied.mode==='unloaded_no_op','Zero load should be no-op');
assertion(unloaded.vis1Applied.peakRadialCompression===0,'Zero load produced compression');
assertion(unloadedBefore === JSON.stringify({folds:unloaded.wallFolds,braids:unloaded.braidTubes,vessel:unloaded.vesselEnvelope}), 'Zero load altered scene objects');
let medium=makeScene(.5252);
freezeReceiver(medium.siltSignalReceiver);
medium.applySiltPressureAnatomy();
assertion(medium.vis1Applied.mode==='load_driven_anatomical_pressure', 'Positive load did not activate');
assertion(medium.vis1Applied.foldCount===9,'Existing nine folds were not affected');
assertion(medium.vis1Applied.peakRadialCompression>.05, 'Compression too small in reference scenario');
assertion(medium.wallFolds.every(f=>f.scale.x<1 && f.scale.z<1 && f.scale.y>1), 'No coherent folded anatomy');
assertion(medium.braidTubes.every(b=>b.material.emissiveIntensity>.22), 'Braid not responding');
assertion(medium.vesselEnvelope.material.opacity>.14, 'Vessel opacity not responding');
assertion(medium.siltSignalReceiver.membraneLoad===.5252, 'VIS1 altered authoritative load');
const max=makeScene(.85, 8.5,0.5);
max.applySiltPressureAnatomy();
assertion(max.vis1Applied.peakRadialCompression<=.26,'Compression exceeded cap');
assertion(max.wallFolds.every(f=>f.scale.y<=1.33 && f.material.opacity<=.48),'Unbounded expansion or opacity');
const recovery=makeScene(.1735);
recovery.applySiltPressureAnatomy();
assertion(recovery.vis1Applied.meanRadialCompression<medium.vis1Applied.meanRadialCompression,
  'Recovered load should produce lower mean deformation for identical phase');
const withArrival=makeScene(.5252,0.2,0.1);
withArrival.applySiltPressureAnatomy();
assertion(withArrival.vis1Applied.receiptArrivalStrength>0,'Receipt arrival wave not observed');
assertion(withArrival.vis1Applied.peakRadialCompression>0,'Receipt arrival did not move fold');
const afterArrival=makeScene(.5252,0.2,8);
afterArrival.applySiltPressureAnatomy();
assertion(afterArrival.vis1Applied.receiptArrivalStrength===0,'Receipt wave did not settle');
for(let i=0;i<1000;i++){
  const load=(i%101)/100*.85, elapsed=i*.033, age=i%60*.2;
  const scene=makeScene(load,elapsed,age);
  scene.applySiltPressureAnatomy();
  assertion(Number.isFinite(scene.vis1Applied.meanRadialCompression),'Nonfinite compression in bounded load replay');
  assertion(scene.vis1Applied.peakRadialCompression<=.26,'Exceeded .26 pressure cap during replay');
  assertion(scene.wallFolds.every(f=>f.scale.x>=.74 && f.scale.y<=1.33 && f.scale.z>=.8076),
    'Scene scale bounds exceeded');
}
const t = medium.readPresentationTelemetry({physicalFeel:{},hostRhythm:{active:false}},true);
assertion(t.vis1?.revision === 'C0C-VIS1-A', 'TRACE1-B did not expose VIS1 diagnostic');
assertion(t.applied.foldMeanXScaleRatio<1 && t.applied.foldMeanYScaleRatio>1,
  'Actual object scale was not measured after VIS1');
assertion(t.applied.foldMeanZScaleRatio<1,'Applied Z-scale ratio missing');
assertion(t.measurement==='applied_object_values_after_visual_updates', 'TRACE1-B schema not preserved');
// Simulate the real update method with unrelated owner subsystems stubbed. This
// tests receive-age lifecycle and call ordering, not browser visual output.
const route=makeScene(0);
route.active=true;
route.completed=false;
route.beatElapsed=0;
route.pulseFlashAge=0;
route.hostConnectionReceiptLedger={snapshot:()=>Object.freeze({signalOnly:true})};
route.siltSignalReceiver.receive=function(){this.receivedTotal=3;this.membraneLoad=.5252;};
route.siltSignalReceiver.update=function(){};
let order=[];
route.samplePlayerPath=()=>({});
for(const method of ['updateCadence','updateTraversalMaterialResponse','updateGrammarReinforcement','applyDynamicCurrent','animate','applyHostRhythmVisual']) {
  route[method]=()=>order.push(method);
}
route.publish=()=>{order.push('publish');};
route.applySiltPressureAnatomy=()=>{order.push('VIS1');loaded.prototype.applySiltPressureAnatomy.call(route)};
route.update(.03,{activeCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001'});
assertion(order.indexOf('VIS1')===order.indexOf('applyHostRhythmVisual')+1,
 'VIS1 must run after visual composition');
assertion(order.indexOf('publish')===order.indexOf('VIS1')+1,
 'VIS1 must precede TRACE1-B publication');
assertion(route.vis1WaveAge>=0 && route.vis1WaveAge<.1,'New receipt did not reset wave age');
route.siltSignalReceiver.receive=function(){};
route.update(.2,{activeCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001'});
assertion(route.vis1WaveAge>.2,'Receipt wave age did not advance');
console.log(JSON.stringify({pass:'C0C-VIS1-A',result:'OFFLINE_PRESENTATION_AND_OWNER_ISOLATION_PASS',assertions:count,
  behavior:'Existing folds compress/recover; receipt wave bounded; applied telemetry wired',
  constraints:'Only Vascular owner changed, no gameplay contracts or movement/circuit formula edited',
  limitations:'Node owner-mock tests are not production browser, pixel-contrast, or player-perception proof'},null,2));
