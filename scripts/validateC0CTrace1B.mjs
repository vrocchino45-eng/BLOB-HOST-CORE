#!/usr/bin/env node
// Offline functional instrumentation tests; NO simulated gameplay success claim.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const spec=JSON.parse(fs.readFileSync(path.resolve(here,'../patches/C0C_TRACE1_B_PATCH.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
let assertions=0;
const check=(cond,msg)=>{assert.ok(cond,msg);assertions++;};
const files={};
for(const t of spec.targets){
  const source=fs.readFileSync(path.resolve(process.cwd(),t.path),'utf8');
  check(sha(source)===t.expectedAfterSha256,`Installed file does not match audited TRACE1-B output: ${t.path}`);
  let reverted=source;
  for(const op of [...t.operations].reverse()) {
    check(reverted.includes(op.after),`Reverse patch anchor missing: ${t.path}`);
    reverted=reverted.replace(op.after,op.before);
  }
  check(sha(reverted)===t.expectedBeforeSha256,`Functional owner code changed outside TRACE1-B trace additions: ${t.path}`);
  files[t.path]=source;
}
const owner=files['src/routes/VascularRhythmRouteSystem.js'];
const i=owner.indexOf('  readPresentationTelemetry(frameState, active) {');
const j=owner.indexOf('  publish(frameState, active) {',i);
check(i>=0&&j>i,'Owner measurement function missing');
const read=new Function(`return ({${owner.slice(i,j)}}).readPresentationTelemetry`)();
const mkMat=(emissiveIntensity,opacity)=>({material:{emissiveIntensity,opacity}});
const fakeOwner={
  elapsed:6.128,
  siltSignalReceiver:{snapshot:()=>({receivedTotal:5,membraneLoad:0.85,directionalFlowScale:0.92775})},
  vesselEnvelope:mkMat(0.318,0.152),
  wallFolds:[{...mkMat(0.4,0.5),scale:{x:1,y:1.1,z:1},userData:{baseScale:{y:1}}},
    {...mkMat(0.5,0.6),scale:{x:1,y:1.2,z:1},userData:{baseScale:{y:1}}}],
  braidTubes:[mkMat(0.7,0.4),mkMat(0.8,0.5)],
  currentMotes:[{...mkMat(0.2,0.6),position:{x:1,y:2,z:3}}],
  contractionIntensity:0.3,synchronization:0.5,turbulence:0.2,
  traversalPulseWake:0,traversalAbsorbShear:0,traversalStabilizeCalm:0,grammarReinforcementStrength:0
};
const frame={physicalFeel:{spatialFeel:{flowStrength:0.64},flowVector:{x:0.4,y:0.3,z:0}},hostRhythm:{active:true}};
const beforeOwner=JSON.stringify(fakeOwner,(_,v)=>typeof v==='function'?'function':v);
const beforeFrame=JSON.stringify(frame);
const sample=read.call(fakeOwner,frame,true);
check(sample.revision==='C0C-TRACE1-B','Trace revision');
check(sample.receiptCount===5&&sample.membraneLoad===0.85&&sample.directionalFlowScale===0.92775,'Signal is measured');
check(sample.applied.vesselEmissive===0.318&&sample.applied.vesselOpacity===0.152,'Actual material values');
check(sample.applied.foldMeanYScaleRatio===1.15,'Actual fold scale ratio');
check(sample.applied.braidMeanEmissive===0.75,'Actual braid emission');
check(sample.applied.moteMeanEmissive===0.2,'Actual mote emission');
check(sample.actualFlowStrength===0.64&&sample.actualFlowMagnitude===0.5,'Actual flow measured');
check(sample.sourceContribution.foldEmissive===0.187,'Existing fold emission contribution');
check(sample.sourceContribution.foldScaleYFractionMax===0.09775,'Existing maximum fraction');
check(sample.applied.firstMotePosition.x===1,'Position readout');
check(read.call(fakeOwner,frame,false)===null,'Unmounted gives no presentation values');
check(JSON.stringify(fakeOwner,(_,v)=>typeof v==='function'?'function':v)===beforeOwner,'Reading did not mutate receiver/scene');
check(JSON.stringify(frame)===beforeFrame,'Reading did not mutate frame state');
const census=files['src/debug/WorldObjectCensusSystem.js'];
const ci=census.indexOf('  sampleVascularPresentation() {');
const cj=census.indexOf('  // These are *published game-state outcomes*',ci);
check(ci>=0&&cj>ci,'REC1 sample method missing');
const capture=new Function(`return ({${census.slice(ci,cj)}}).sampleVascularPresentation`)();
const fakeRecorder={frameState:{vascularRhythmRoute:{presentationTrace:sample}},lastVascularPresentationSampleMs:null,
  captured:[],recordEvent(type,data){this.captured.push({type,...data});}};
const originalNow=Date.now;
try{
  Date.now=()=>1000; capture.call(fakeRecorder);
  Date.now=()=>1200; capture.call(fakeRecorder);
  Date.now=()=>1500; capture.call(fakeRecorder);
  check(fakeRecorder.captured.length===2,'500ms throttling');
  check(fakeRecorder.captured.every(x=>x.type==='vascular-presentation-sample'),'Typed events');
  fakeRecorder.frameState.vascularRhythmRoute.presentationTrace=null;
  Date.now=()=>2000; capture.call(fakeRecorder);
  check(fakeRecorder.captured.length===2,'No unmounted capture');
}finally{Date.now=originalNow;}
console.log(JSON.stringify({pass:'C0C-TRACE1-B',result:'OFFLINE_READ_ONLY_PRESENTATION_TRACE_PASS',assertions,
  sourceOwnersUnchangedOutsideInstrumentation:true,visualPerceptionVerified:false,browserBuildVerified:false},null,2));
