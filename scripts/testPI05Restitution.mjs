import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { Vector3 } from 'three';
import admission from '../src/contact/siltPairRestitutionAdmission.json' with { type: 'json' };
import { resolveSiltPairImpact, siltPairFixture } from '../src/contact/SiltPairMomentum.js';

const existing = new URL('./testPI04SiltPairMomentum.mjs', import.meta.url);
const original = readFileSync(existing,'utf8');
const end = original.indexOf("\nfor(const mode of ['equal','one-to-three']){");
assert.ok(end>0);
const fixture = original.slice(0,end).replace("import {test} from 'node:test';","const test=()=>{};")
   + '\nexport {stagedMounted,setup,pairEvents,rig,stamp,scope,A,B};';
const hook = registerHooks({load(url,ctx,next) {
 return url===existing.href ? {format:'module',shortCircuit:true,source:fixture} : next(url,ctx);
}});
let pi04;
try { pi04=await import(existing.href); } finally { hook.deregister(); }
const {stagedMounted,setup,pairEvents,rig,A,B,scope}=pi04;
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const subtract=(a,b)=>a.map((x,i)=>x-b[i]);
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12*(1+Math.max(Math.abs(a),Math.abs(b))),a+' vs '+b);
const body=(x,v,m=1)=>({position:[x,0,0],velocity:v,mass:m,radius:.06});
const cases=[
 ['e0-equal',1,0,[.5,.5],.25],
 ['e05-equal',1,.5,[.25,.75],.3125],
 ['e1-equal',1,1,[0,1],.5],
 ['e0-one-to-three',3,0,[.25,.25],.125],
 ['e05-one-to-three',3,.5,[-.125,.375],.21875],
 ['e1-one-to-three',3,1,[-.5,.5],.5]
];
const mounted=[];
function verifyContact(event, coefficient) {
 assert.deepEqual(event.actualRecipientIds,[A,B]);
 assert.equal(event.restitution,coefficient);
 assert.equal(event.restitutionAdmissionRevision,admission.revision);
 assert.equal(event.inventoryTransferred,false);
 assert.equal(event.progressionCredit,false);
 assert.equal(event.hostReceipt,false);
 const [a,b]=event.units, n=event.normal;
 const approach=-dot(subtract(b.incomingVelocity,a.incomingVelocity),n);
 const separation=dot(subtract(b.outgoingVelocity,a.outgoingVelocity),n);
 assert.ok(approach>0);
 close(separation,coefficient*approach);
 close(event.impulse,(1+coefficient)*approach/(1/a.mass+1/b.mass));
 close(event.kineticEnergyLost,(1-coefficient**2)*approach**2/(2*(1/a.mass+1/b.mass)));
 close(event.kineticEnergyBefore-event.kineticEnergyAfter,event.kineticEnergyLost);
 assert.ok(event.kineticEnergyAfter<=event.kineticEnergyBefore+1e-12);
 for(const [i,v] of event.momentumAfter.entries())close(v,event.momentumBefore[i]);
 for(const unit of event.units){
  const dv=subtract(unit.outgoingVelocity,unit.incomingVelocity), normal=dot(dv,n);
  dv.forEach((x,i)=>close(x,normal*n[i]));
 }
 close(new Vector3(...a.contactPosition).distanceTo(new Vector3(...b.contactPosition)),.12);
 const preNativeEnergy=event.units.reduce((sum,u)=>sum+u.mass*dot(u.beforeNativeVelocity,u.beforeNativeVelocity)/2,0);
 const nativeMomentum=event.units.reduce((sum,u)=>sum.map((p,i)=>p+u.mass*(u.incomingVelocity[i]-u.beforeNativeVelocity[i])),[0,0,0]);
 return {approach,separation,externalNativeEnergy:event.kineticEnergyBefore-preNativeEnergy,externalNativeMomentum:nativeMomentum};
}
for (const [id,massB,e,out,energy] of cases) {
 test('analytical '+id,()=>{
  const result=resolveSiltPairImpact(body(0,[1,.2,0]),body(.32,[0,.2,0],massB),.24,e);
  assert.ok(result);
  result.velocities.forEach((v,i)=>{close(v[0],out[i]);close(v[1],.2);close(v[2],0);});
  close(result.energyAfter,energy+(1+massB)*.02);
  close(result.momentumAfter[0],1);
  if(e===0)assert.deepEqual(result,resolveSiltPairImpact(body(0,[1,.2,0]),body(.32,[0,.2,0],massB),.24));
 });
 test('mounted '+id+' records genuine owner response and native retrieval',t=>{
  const m=stagedMounted(t,'pi05:'+id);
  const [hit]=m.evidence.events;
  assert.equal(m.evidence.events.length,1);
  assert.deepEqual(hit.units.map(u=>u.mass),[1,massB]);
  const witness=verifyContact(hit,e);
  const retrievals=[];
  for(const [i,unit] of [m.first,m.second].entries()){
   rig.acquire(m.game,unit);
   assert.equal(m.owner.has(unit.id),false);
   assert.equal(m.route.materialIdentity.get(unit.id).owner,'grip');
   const proof=m.release(i===0?[-1,0,0]:[1,0,0]);
   const release=m.owner.free.get(unit.id).freeContact.releaseSequence;
   assert.notEqual(release,hit.units[i].releaseSequence);
   retrievals.push({id:unit.id,release,proof});
  }
  m.game.mount('CELL_SIGNAL_CHORUS_NERVE_001');m.game.step();
  m.game.mount(scope.cellId);m.game.steps(4);
  assert.equal(pairEvents(m.owner).length,1);
  assert.equal(m.route.materialIdentity.totalMass(),8);
  mounted.push({id,coefficient:e,...m.evidence,witness,retrievals,inventoryQ:8,remountNoNewImpact:true});
 });
}
test('unknown, out-of-range, nonfinite and unapproved restitution inputs reject',()=>{
 const a=body(0,[1,0,0]), b=body(.18,[0,0,0]);
 for(const e of [-.01,1.01,.75,NaN,Infinity,null,'1'])assert.equal(resolveSiltPairImpact(a,b,.2,e),null);
 for(const name of ['e05-equal','pi05:__proto__','pi05:e05-four-to-one','pi05:e2-equal','pi05:v0-e05-equal'])
   assert.equal(siltPairFixture(name),null);
 assert.equal(siltPairFixture('equal').restitution,undefined);
});
test('unsupported elastic speed rejects both trajectory outputs and preserves native velocity',()=>{
 const f=setup('pi05:e1-equal');
 f.seed([0,0,0],[.12,0,0],[2.1,0,0],[0,2.1,0]);
 f.owner.advancePair(.025,f.entries(100),true);
 assert.equal(pairEvents(f.owner).length,0);
 assert.deepEqual([f.owner.get(A).velocity,f.owner.get(B).velocity],[[2.1,0,0],[0,2.1,0]]);
});
test('older mount and wrong generation cannot take an elastic impulse',()=>{
 const f=setup('pi05:e1-equal');f.seed([0,0,0],[.13,0,0]);
 for(const change of [{mountSequence:2},{mountCount:0},{generation:1},{frame:99}]){
  const [a,b]=f.entries(100);Object.assign(b.contact.step,change);
  assert.equal(f.owner.advancePair(.025,[a,b],true),null);
 }
 assert.equal(pairEvents(f.owner).length,0);
});
test('earlier and tied fixed-surface contact still wins against the elastic response',()=>{
 for(const [time,expected] of [[.019,0],[.020005,0],[.02002,1]]){
  const f=setup('pi05:e1-equal');f.seed([0,0,0],[.14,0,0]);
  const surface={id:'fixed-primitive',center:[time+.5,0,0],radii:[.5,.2,.2]};
  f.owner.advancePair(.025,f.entries(100,undefined,surface),true);
  assert.equal(pairEvents(f.owner).length,expected);
  if(!expected)assert.equal(f.owner.snapshot().freeMaterialContacts[0].receiverId,surface.id);
 }
});
test('mounted restitution near miss does not create pair or fixed-surface events',t=>{
 const m=stagedMounted(t,'pi05:e1-one-to-three',true);
 assert.equal(m.evidence.events.length,0);
 assert.equal(m.owner.snapshot().freeMaterialContacts,undefined);
 mounted.push({id:'elastic-near-miss',...m.evidence,inventoryQ:8});
});
test('the owner suppresses persistent contact and rearms only after measured separation',()=>{
 const f=setup('pi05:e0-one-to-three',{spring:.44,drag:.74});f.seed([0,0,0],[.13,0,0]);
 f.owner.advancePair(.05,f.entries(100,[[0,0,0],[.13,0,0]]),true);
 assert.equal(pairEvents(f.owner).length,1);
 for(let frame=101;frame<108;frame++)f.owner.advancePair(.025,f.entries(frame,[[1,0,0],[-1,0,0]]),true);
 assert.equal(pairEvents(f.owner).length,1);
 for(let frame=108;frame<142;frame++)f.owner.advancePair(.025,f.entries(frame,[[-4,0,0],[4,0,0]]),true);
 const gap=f.owner.get(B).position[0]-f.owner.get(A).position[0];assert.ok(gap>.121);
 for(let frame=142;frame<260&&pairEvents(f.owner).length===1;frame++)f.owner.advancePair(.025,f.entries(frame,[[4,0,0],[-4,0,0]]),true);
 const events=pairEvents(f.owner);
 assert.equal(events.length,2);
 assert.notEqual(events[0].id,events[1].id);
 assert.deepEqual(events[0].units.map(u=>u.releaseSequence),events[1].units.map(u=>u.releaseSequence));
 mounted.push({id:'persistent-and-repeat',staging:'Existing trajectory owner with directly staged native attractor inputs after admitted release sources',gap,events});
});
test('mounted intermediate fixture repeats only after measured separation', t => {
 const m=stagedMounted(t,'pi05:e05-one-to-three');
 assert.equal(m.evidence.events.length,1);
 const receipt=rig.receipts(m.game), center=m.owner.get(B).position;
 const original=m.route.copyNativeGrainPosition, targets=new Map();
 const point=x=>[center[0]+x,center[1],center[2]];
 m.route.copyNativeGrainPosition=function(unit,index,out){
  return targets.has(unit.id)?out.fromArray(targets.get(unit.id)):original.call(this,unit,index,out);
 };
 try {
  targets.set(A,point(-1));targets.set(B,point(1));
  for(let i=0;i<48;i++)m.game.step(.025);
  const gap=new Vector3(...m.owner.get(A).position).distanceTo(new Vector3(...m.owner.get(B).position));
  assert.ok(gap>.121);
  assert.equal(pairEvents(m.owner).length,1);
  targets.set(A,point(0));targets.set(B,point(0));
  for(let i=0;i<260&&pairEvents(m.owner).length===1;i++)m.game.step(.025);
  const events=pairEvents(m.owner);
  assert.equal(events.length,2);
  events.forEach(event=>verifyContact(event,.5));
  assert.notEqual(events[0].id,events[1].id);
  assert.deepEqual(events[0].units.map(x=>x.releaseSequence),events[1].units.map(x=>x.releaseSequence));
  assert.deepEqual(rig.receipts(m.game),receipt);
  assert.equal(m.route.materialIdentity.totalMass(),8);
  mounted.push({...m.evidence,id:'mounted-intermediate-repeat',coefficient:.5,gap,events,inventoryQ:8,
   staging:'Native control-based releases, followed by staged inputs to the existing native attraction.'});
 }finally{m.route.copyNativeGrainPosition=original;}
});

test.after(()=>{
 const file=process.env.BLOB_PI05_REPORT;
 if(file)writeFileSync(file,JSON.stringify({schema:'blob.pi05.mounted.v1',
   source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mounted},null,2)+'\n');
});
