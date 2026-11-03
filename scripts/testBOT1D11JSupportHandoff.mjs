// BOT1-D11J owner-level tests. Uses deterministic THREE doubles and the actual owner source.
// Does not simulate full browser physics. Live acceptance remains separate.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(ROOT,'src/player/CoreTendrilSurfaceContactSystem.js');
const raw=fs.readFileSync(source,'utf8');
class Vec{
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  clone(){return new Vec(this.x,this.y,this.z);}
  add(v){return this.set(this.x+v.x,this.y+v.y,this.z+v.z);}
  sub(v){return this.set(this.x-v.x,this.y-v.y,this.z-v.z);}
  multiplyScalar(v){return this.set(this.x*v,this.y*v,this.z*v);}
  addScaledVector(v,s){return this.set(this.x+v.x*s,this.y+v.y*s,this.z+v.z*s);}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
  length(){return Math.hypot(this.x,this.y,this.z);}
  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  normalize(){return this.multiplyScalar(1/(this.length()||1));}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}
}
const THREE={Vector3:Vec,MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),lerp:(a,b,t)=>a+(b-a)*t}};
const stripped=raw.replace(/^import .*?;\s*$/gm,'').replace('export class CoreTendrilSurfaceContactSystem','class CoreTendrilSurfaceContactSystem')+'\nCoreTendrilSurfaceContactSystem;';
const Klass=vm.runInNewContext(stripped,{THREE,CORE_TENDRIL_VISUAL:{}},{filename:source});
let tests=0;
function test(name,fn){fn();console.log('PASS:',name);tests++;}
function leg(index,phase='sealed',valid=true,anchor=new Vec(0,0,0)){
  return {index,phase,phaseAge:.45,anchorWorld:anchor,anchorSurface:{valid,surfaceId:valid?'SILT_ENTRY_SEDIMENT_SHELF_D11B':'none'},
    lastIdealAnchor:new Vec(),stretch:0,anchorDrift:0,stridePressure:0,stepCount:0,
    reachSurface:{valid:false,surfaceId:'none'},pendingSurface:{valid:false,surfaceId:'none'},
    reachTo:new Vec(),reachFrom:new Vec(),pendingAnchorWorld:new Vec(),pendingAnchorValid:false,seal:1,reveal:1};
}
function owner(legs, {truth=true, contact='attached', physical='attached'}={}){
  const o=Object.create(Klass.prototype);
  const frame={playerKinematics:{},coreContactLanguage:{state:contact},playerAttachment:{state:physical,active:physical==='attached'},coreSurfaceTruth:{valid:truth,mechanicalEligible:true}};
  Object.assign(o,{
    root:{},tendrils:legs,frameState:frame,previousContactState:'attached',contactAge:.40,stepCursor:0,stepCandidateIndex:-1,
    playerRoot:{getWorldPosition:out=>out.set(0,.2,0)},playerPosition:new Vec(0,.2,0),
    surfaceTruthActive:truth,normal:new Vec(0,1,0),tangentForward:new Vec(0,0,-1),tangentSide:new Vec(1,0,0),
    tempA:new Vec(),tempB:new Vec(),tempC:new Vec(),tempD:new Vec(),surfacePoint:new Vec(),
    maxStretch:.54,stepDistance:.18,contactAge:.45,stepCursor:0,
    peels:[],reaches:[],
  });
  o.computeStartWorld=(_i,out)=>out.set(0,.32,0);
  o.computeIdealAnchor=(index)=>new Vec(index===0?1.5:0,0,0);
  o.computePredictedStepAnchor=(_index,ideal,out)=>out.copy(ideal);
  o.readBoundary=()=>{};
  o.readSurfaceTruth=()=>{o.surfaceTruthActive=truth;};
  o.readTangentBasis=()=>{};
  o.beginReach=(t)=>{o.reaches.push(t.index);t.phase='reaching';return true;};
  o.beginPeel=(t)=>{o.peels.push(t.index);t.phase='peeling';};
  o.updateTendrilState=()=>{};
  o.renderTendril=()=>{};
  o.publishState=()=>{};
  return o;
}
function drive(o){o.update(.016,o.frameState);return o;}

test('sole sealed Silt support cannot pressure peel, even at high drift',()=>{
 const o=drive(owner([leg(0),leg(1,'retracted',false),leg(2,'retracted',false)]));
 assert.deepEqual(o.peels,[]);assert.equal(o.tendrils[0].phase,'sealed');
});
test('still deploys other tendrils when sole sealed anchor is protected',()=>{
 const o=drive(owner([leg(0),leg(1,'retracted',false),leg(2,'retracted',false)]));
 assert.deepEqual(o.reaches,[1,2]);
});
test('a reaching second tendril does not count as replacement support',()=>{
 const o=drive(owner([leg(0),leg(1,'reaching',true),leg(2,'retracted',false)]));
 assert.deepEqual(o.peels,[]);
});
test('a peeling second tendril does not count as replacement support',()=>{
 const o=drive(owner([leg(0),leg(1,'peeling',true),leg(2,'retracted',false)]));
 assert.deepEqual(o.peels,[]);
});
test('two valid sealed anchors allow ordinary pressure stride',()=>{
 const o=drive(owner([leg(0),leg(1),leg(2,'retracted',false)]));
 assert.deepEqual(o.peels,[0]);assert.equal(o.tendrils[1].phase,'sealed');
});
test('alternate sealed anchor without authored provenance is not sufficient',()=>{
 const o=drive(owner([leg(0),leg(1,'sealed',false),leg(2,'retracted',false)]));
 assert.deepEqual(o.peels,[]);
});
test('alternate sealed anchor outside reach envelope cannot authorize stride',()=>{
 const o=drive(owner([leg(0),leg(1,'sealed',true,new Vec(4,0,0)),leg(2,'retracted',false)]));
 assert.equal(o.hasIndependentSealedSupport(o.tendrils[0]),false);
 assert.equal(o.peels.includes(0),false);
});
test('a non-finite alternate anchor position cannot authorize stride',()=>{
 const o=drive(owner([leg(0),leg(1,'sealed',true,new Vec(NaN,0,0)),leg(2,'retracted',false)]));
 assert.equal(o.hasIndependentSealedSupport(o.tendrils[0]),false);
 assert.equal(o.peels.includes(0),false);
});
test('later sealed second foothold permits handoff in subsequent frame',()=>{
 const o=owner([leg(0),leg(1,'retracted',false),leg(2,'retracted',false)]);
 drive(o);assert.deepEqual(o.peels,[]);
 o.tendrils[1].phase='sealed';o.tendrils[1].anchorSurface={valid:true,surfaceId:'SILT_ENTRY_SEDIMENT_SHELF_D11B'};
 o.tendrils[2].phase='retracted';
 drive(o);assert.deepEqual(o.peels,[0]);
});
test('explicit release still peels every active tendril',()=>{
 const o=owner([leg(0),leg(1),leg(2,'retracted',false)],{contact:'suspended',physical:'releasing'});
 drive(o);assert.deepEqual(o.peels,[0,1]);
});
test('loss of requested contact initiates standard release',()=>{
 const o=owner([leg(0),leg(1,'retracted',false),leg(2,'retracted',false)],{contact:'suspended',physical:'free'});
 drive(o);assert.deepEqual(o.peels,[0]);
});
test('no new ordinary step is proposed without live surface truth',()=>{
 const o=drive(owner([leg(0),leg(1),leg(2,'retracted',false)],{truth:false}));
 assert.equal(o.stepCandidateIndex,-1);assert.deepEqual(o.peels,[]);
});
test('no-truth overextension release is not blocked by D11J',()=>{
 const o=drive(owner([leg(0,'sealed',true,new Vec(3,0,0)),leg(1,'retracted',false),leg(2,'retracted',false)],{truth:false}));
 assert.deepEqual(o.peels,[0]);
});
test('D11G provenance restrictions remain present and no boundary replant restored',()=>{
 assert.match(raw,/if \(contactState === "attached" && this\.surfaceTruthActive && !stepClaimed\)/);
 assert.match(raw,/tendril\.phase === "retracted" && this\.surfaceTruthActive/);
 assert.doesNotMatch(raw,/copySurfaceRelation\(tendril\.reachSurface, tendril\.anchorSurface\)/);
});
test('D11J support gate is scoped to pressure stride not beginGlobalRelease',()=>{
 assert.match(raw,/hasIndependentSealedSupport\(tendril\)/);
 assert.match(raw,/this\.stepCandidateIndex/);
 assert.doesNotMatch(Klass.prototype.beginGlobalRelease.toString(),/hasIndependentSealedSupport/);
});
console.log(`BOT1-D11J: ${tests} deterministic owner-level tests passed (not live gameplay).`);
