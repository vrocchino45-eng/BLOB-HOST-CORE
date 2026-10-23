#!/usr/bin/env node
// Source integrity and bounded Vascular-only presentation regression.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const target=path.join(root,'src/routes/VascularRhythmRouteSystem.js');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'MANIFEST.json'),'utf8'));
const patch=JSON.parse(fs.readFileSync(path.join(dir,'PATCH.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const src=fs.readFileSync(target,'utf8');
let n=0;const check=(cond,msg)=>{n++;if(!cond)throw Error(msg);};
check(sha(src)===manifest.sourceAfterSha256, 'VIS1-B must be installed before validation');
check(src.split(patch.after).length===2, 'VIS1-B method must appear exactly once');
check(sha(src.replace(patch.after,patch.before))===manifest.sourceBeforeSha256,'Unexpected changes outside VIS1-B method');
check(src.includes('applySiltPressureAnatomy();'), 'Causal update still calls presentation');
const C=vm.runInNewContext(src.replace(/^import\s+.*;$/gm,'').replace('export class VascularRhythmRouteSystem','class VascularRhythmRouteSystem')+'\nVascularRhythmRouteSystem;',
  {THREE:{MathUtils:{clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v))}},VascularSiltSignalReceiver:class{}});
const material=(emissiveIntensity=.2,opacity=.26)=>({emissiveIntensity,opacity,emissive:{r:.1255,g:.2314,b:.3333,
  setRGB(r,g,b){this.r=r;this.g=g;this.b=b;},setHex(n){this.r=((n>>16)&255)/255;this.g=((n>>8)&255)/255;this.b=(n&255)/255;}}});
const create=(load,elapsed=4,age=30)=>{
  const route=Object.create(C.prototype);
  route.siltSignalReceiver={membraneLoad:load,receivedTotal:load?9:0,snapshot(){return {membraneLoad:this.membraneLoad,receivedTotal:this.receivedTotal,directionalFlowScale:.96};}};
  route.elapsed=elapsed;route.vis1WaveAge=age;route.vis1Applied=null;
  route.wallFolds=Array.from({length:9},(_,i)=>({name:'vascular_membrane_fold_'+(i+1),scale:{x:1,y:1,z:1},userData:{baseScale:{x:1,y:1,z:1}},material:material()}));
  route.braidTubes=Array.from({length:3},()=>({material:material(.15,.5)}));
  route.vesselEnvelope={material:material(.18,.2)};route.currentMotes=[];
  route.contractionIntensity=.3;route.synchronization=.5;route.turbulence=.1;
  route.traversalPulseWake=0;route.traversalAbsorbShear=0;route.traversalStabilizeCalm=0;route.grammarReinforcementStrength=0;
  return route;
};
const unloaded=create(0);const original=JSON.stringify({folds:unloaded.wallFolds,braids:unloaded.braidTubes,vessel:unloaded.vesselEnvelope});
unloaded.applySiltPressureAnatomy();
check(unloaded.vis1Applied.tissueState==='resting','Zero-load resting classification');
check(original===JSON.stringify({folds:unloaded.wallFolds,braids:unloaded.braidTubes,vessel:unloaded.vesselEnvelope}), 'Zero-load strict no-op');
const medium=create(.5252);medium.applySiltPressureAnatomy();
check(medium.vis1Applied.foldCount===9,'All nine original folds affected');
check(medium.vis1Applied.tissueState==='recovering_pressure','Late lower load is recovery');
check(medium.wallFolds.every(f=>f.scale.x<1 && f.scale.z<1 && f.scale.y>1),'Existing mesh deforms coherently');
check(medium.vesselEnvelope.material.opacity<.2,'Loaded shell should reveal, not obscure');
check(medium.wallFolds.every(f=>f.material.opacity>.26 && f.material.emissiveIntensity>.2),'Loaded fold intensity enhanced');
check(medium.wallFolds.some(f=>f.material.emissive.g>.5),'Tissue hue shifts toward cyan');
check(medium.braidTubes.every(f=>f.material.emissiveIntensity>.15),'Braids accompany loaded tissue');
const pulse=create(.85,1,.2);pulse.applySiltPressureAnatomy();
check(pulse.vis1Applied.tissueState==='receipt_onset','Recent receipt is onset');
check(pulse.vis1Applied.receiptArrivalStrength>0,'Receipt onset wave persists');
const loaded=create(.85,1,30);loaded.applySiltPressureAnatomy();
check(loaded.vis1Applied.tissueState==='loaded_pressure','Held high load is loaded tissue');
check(loaded.vis1Applied.receiptArrivalStrength===0,'No spurious later fresh arrival');
const compressions=loaded.wallFolds.map(f=>1-f.scale.x);
check(Math.max(...compressions)-Math.min(...compressions)>.10,'Travelling band must give spatially distinct compression');
check(loaded.vis1Applied.peakRadialCompression<=.26 && loaded.vis1Applied.meanYExpansion<=.33,'Bounded geometry');
const recovery=create(.10,1,30);recovery.applySiltPressureAnatomy();
check(recovery.vis1Applied.meanRadialCompression<medium.vis1Applied.meanRadialCompression,'Reduced load reduces deformation at same phase');
const returned=create(.13,1,30);returned.applySiltPressureAnatomy();
returned.siltSignalReceiver.membraneLoad=0;returned.applySiltPressureAnatomy();
check(returned.vis1Applied.tissueState==='resting' && returned.wallFolds.every(f=>f.material.emissive.b<.34),'Recovery restores authored hue');
for(let i=0;i<1000;i++){
 const load=.85*(i%101)/100;const route=create(load,i*.041,i%61*.14);route.applySiltPressureAnatomy();
 check(route.vis1Applied.peakRadialCompression<=.260001,'Max compression during bounded replay');
 check(route.vis1Applied.meanYExpansion<=.330001,'Max Y expansion during bounded replay');
 check(route.wallFolds.every(f=>f.scale.x>=.74&&f.scale.y<=1.33&&f.material.opacity<=.83),'Real material/geometry bounds respected');
 check(load===0 || route.vesselEnvelope.material.opacity>=.065,'Silhouette retained');
}
const sample=medium.readPresentationTelemetry({physicalFeel:{},hostRhythm:{active:false}},true);
check(sample.vis1.revision==='C0C-VIS1-B','TRACE1-B reading new VIS1-B state');
check(sample.measurement==='applied_object_values_after_visual_updates','Existing TRACE1-B schema intact');
check(medium.siltSignalReceiver.membraneLoad===.5252,'Receiver unchanged by presentation');
console.log(JSON.stringify({pass:'C0C-VIS1-B',status:'OFFLINE_VISUAL_BOUNDARIES_AND_OWNER_ISOLATION_PASS',assertions:n,
 scope:'One Vascular method; no new meshes/controllers/physics/current changes',
 limits:'Browser visibility and Windows production build not proven by this validator'},null,2));
