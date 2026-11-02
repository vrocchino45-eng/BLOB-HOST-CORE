// BOT1-D11G owner-level behavior checks with minimal THREE test doubles.
// No Vite or browser is needed; these tests do not claim runtime gameplay passes.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const owner = path.join(ROOT, 'src/player/CoreTendrilSurfaceContactSystem.js');
const raw = fs.readFileSync(owner, 'utf-8');

class Vec {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  clone(){return new Vec(this.x,this.y,this.z);}
  add(v){return this.set(this.x+v.x,this.y+v.y,this.z+v.z);}
  sub(v){return this.set(this.x-v.x,this.y-v.y,this.z-v.z);}
  multiplyScalar(s){return this.set(this.x*s,this.y*s,this.z*s);}
  addScaledVector(v,s){return this.set(this.x+v.x*s,this.y+v.y*s,this.z+v.z*s);}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  length(){return Math.sqrt(this.lengthSq());}
  normalize(){return this.multiplyScalar(1/(this.length()||1));}
  lerpVectors(a,b,t){return this.copy(a).multiplyScalar(1-t).addScaledVector(b,t);}
}
const THREE = { Vector3: Vec, MathUtils: {
  clamp: (x,a,b)=>Math.min(b,Math.max(a,x)),
  lerp:(a,b,t)=>a+(b-a)*t
}};
const script = raw.replace(/^import .*?;\s*$/gm,'').replace('export class CoreTendrilSurfaceContactSystem','class CoreTendrilSurfaceContactSystem') + '\nCoreTendrilSurfaceContactSystem;';
const Klass = vm.runInNewContext(script, {THREE,CORE_TENDRIL_VISUAL:{}},{filename:owner});
const truth = {
 valid:true,owner:'CoreSurfaceTruthSystem',meshName:'silt_shelf',surfaceId:'SILT_ENTRY_SEDIMENT_SHELF_D11B',
 profileId:'residue_weak',materialFamily:'silt',adhesion:.4,loadTolerance:.4,compliance:.7,
 verbTransmission:{pulse:.4,absorb:.3,stabilize:.6},normal:new Vec(0,1,0)
};
const relation = () => ({valid:false,owner:'none',meshName:'none',surfaceId:'none',profileId:'none',materialFamily:'none',adhesion:.75,loadTolerance:.7,compliance:.5,verbTransmission:{},normal:new Vec(0,1,0)});
const tendon = (phase='sealed') => ({
 index:0, phase,phaseAge:.4, anchorWorld:new Vec(.1,0,0),reachFrom:new Vec(),reachTo:new Vec(),
 pendingAnchorWorld:new Vec(),pendingAnchorValid:false,anchorSurface:relation(),reachSurface:relation(),pendingSurface:relation(),
 seal:1,reveal:1,stepCount:0,stridePressure:0,displayEnd:new Vec(),lastIdealAnchor:new Vec(),stretch:0,anchorDrift:0
});
function newOwner(hasTruth){
 const owner=Object.create(Klass.prototype);
 owner.surfaceTruthActive=hasTruth;
 Object.assign(owner,{
   surfaceTruthOwner:truth.owner,surfaceTruthSurfaceId:truth.surfaceId,surfaceTruthMeshName:truth.meshName,
   surfaceTruthProfileId:truth.profileId,surfaceTruthMaterialFamily:truth.materialFamily,
   surfaceTruthAdhesion:truth.adhesion,surfaceTruthLoadTolerance:truth.loadTolerance,
   surfaceTruthCompliance:truth.compliance,surfaceTruthVerbTransmission:truth.verbTransmission,
   surfacePoint:new Vec(0,0,0),normal:new Vec(0,1,0),tempA:new Vec(),tempB:new Vec(),tempC:new Vec(),tempD:new Vec(),
   reachDuration:.19, peelDuration:.17,maxStretch:.54, contactAge:.4,stepCursor:0,stepCandidateIndex:-1
 });
 owner.computeStartWorld=(_index,out)=>out.copy(new Vec(0,.35,0));
 return owner;
}
function oldId(t){t.anchorSurface.valid=true;t.anchorSurface.surfaceId=truth.surfaceId;}
let tests=0;
function test(name,fn){fn();tests++;console.log('PASS:',name);}

test('new reach without authored truth is rejected even if old surface identity exists',()=>{
 const s=newOwner(false),t=tendon('retracted');oldId(t);
 const ok=s.beginReach(t,new Vec(-5,-5,-14));
 assert.equal(ok,false);assert.equal(t.phase,'retracted');assert.equal(t.reachSurface.valid,false);
});
test('live authored truth authorizes correctly labeled initial reach',()=>{
 const s=newOwner(true),t=tendon('retracted');
 assert.equal(s.beginReach(t,new Vec(0,0,.2)),true);
 assert.equal(t.reachSurface.surfaceId,truth.surfaceId);
 assert.equal(t.reachOrigin,'live_authored_surface_truth');
});
test('surface gap cannot stage distant boundary fallback as a new foothold',()=>{
 const s=newOwner(false),t=tendon();oldId(t);
 s.beginPeel(t,new Vec(-5,-5,-14));
 assert.equal(t.pendingAnchorValid,false);assert.equal(t.pendingSurface.valid,false);
});
test('same-frame authored prediction preserves the proper surface relationship',()=>{
 const s=newOwner(true),t=tendon();oldId(t);
 s.beginPeel(t,new Vec(.25,0,.25));
 assert.equal(t.pendingAnchorValid,true);assert.equal(t.pendingSurface.surfaceId,truth.surfaceId);
 s.surfaceTruthActive=false;
 assert.equal(s.beginReach(t,t.pendingAnchorWorld,true),true);
 assert.equal(t.reachSurface.surfaceId,truth.surfaceId);
 assert.equal(t.reachOrigin,'authored_truth_predicted_step');
});
test('an authored step proposal far outside the bounded local plane is rejected',()=>{
 const s=newOwner(true),t=tendon();oldId(t);
 s.beginPeel(t,new Vec(12,0,12));
 assert.equal(t.pendingAnchorValid,false);
});
test('peel without live/pending truth retracts instead of copying stale identity',()=>{
 const s=newOwner(false),t=tendon('peeling');oldId(t);
 t.phaseAge=.18;t.pendingAnchorValid=false;t.reachFrom.set(0,0,0);t.reachTo.set(0,0,0);
 s.tangentSide=new Vec(1,0,0);
 s.updateTendrilState(t,.01,new Vec(13,0,0),true);
 assert.equal(t.phase,'retracted');assert.equal(t.anchorSurface.valid,false);
});
test('valid pending authorizes replant after a transient raycast gap',()=>{
 const s=newOwner(true),t=tendon();oldId(t);
 s.beginPeel(t,new Vec(.15,0,.25));
 t.phaseAge=.18; s.surfaceTruthActive=false;s.tangentSide=new Vec(1,0,0);
 s.updateTendrilState(t,.02,new Vec(18,0,0),true);
 assert.equal(t.phase,'reaching');assert.equal(t.reachSurface.surfaceId,truth.surfaceId);
 assert.ok(t.reachTo.distanceTo(new Vec(.15,0,.25))<.001);
});
function exerciseUpdate(anchorWorld){
 const s=newOwner(false), t=tendon();oldId(t);t.anchorWorld.copy(anchorWorld);
 const others=[1,2].map(index=>({...tendon('retracted'),index}));
 s.root={};s.tendrils=[t,...others];s.previousContactState='attached';
 s.frameState={playerKinematics:{},coreContactLanguage:{state:'attached'},playerAttachment:{active:true},coreSurfaceTruth:{}};
 s.playerRoot={getWorldPosition:out=>out.set(0,.3,0)};
 s.playerPosition=new Vec();s.readBoundary=()=>{};
 s.readSurfaceTruth=()=>{s.surfaceTruthActive=false};s.readTangentBasis=()=>{};
 s.computeIdealAnchor=()=>new Vec(-4,-4,-14);
 s.updateTendrilState=()=>{};s.renderTendril=()=>{};s.publishState=()=>{};
 s.update(.05,s.frameState);
 return t;
}
test('short missing-raycast gap preserves physically reachable old support',()=>{
 assert.equal(exerciseUpdate(new Vec(.2,0,0)).phase,'sealed');
});
test('physically unreachable old anchor initiates peel, not distant replant',()=>{
 const t=exerciseUpdate(new Vec(2,0,0));
 assert.equal(t.phase,'peeling');assert.equal(t.pendingAnchorValid,false);
});
test('boundary replant bypass is blocked by explicit live-truth guard in update',()=>{
 assert.match(raw,/contactState === "attached" && this\.surfaceTruthActive && !stepClaimed/);
 assert.match(raw,/tendril\.phase === "retracted" && this\.surfaceTruthActive/);
 assert.doesNotMatch(raw,/copySurfaceRelation\(tendril\.reachSurface, tendril\.anchorSurface\)/);
});
console.log(`BOT1-D11G: ${tests} owner-level behavior checks passed (offline only).`);
