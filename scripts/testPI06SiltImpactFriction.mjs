import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { Vector3 } from 'three';
import frictionAdmission from '../src/contact/siltPairFrictionAdmission.json' with { type: 'json' };
import { resolveSiltPairImpact, siltPairFixture } from '../src/contact/SiltPairMomentum.js';

const originalUrl = new URL('./testPI04SiltPairMomentum.mjs', import.meta.url);
const original = readFileSync(originalUrl, 'utf8');
const end = original.indexOf("\nfor(const mode of ['equal','one-to-three']){");
const corridor = 'const seed=miss?admission.measuredCorridor.miss:admission.measuredCorridor.seed;';
assert.ok(end > 0 && original.includes(corridor));
const fixture = "import frictionAdmission from '../src/contact/siltPairFrictionAdmission.json' with { type: 'json' };\n"
  + original.slice(0, end).replace("import {test} from 'node:test';", 'const test=()=>{};')
    .replace(corridor, 'const seed=miss?frictionAdmission.measuredCorridor.miss:frictionAdmission.measuredCorridor.seed;')
  + '\nexport {stagedMounted,setup,pairEvents,rig,scope,A,B};';
const hook = registerHooks({ load(url, context, next) {
  return url === originalUrl.href ? { format:'module', shortCircuit:true, source:fixture } : next(url, context);
} });
let nativeFixture;
try { nativeFixture = await import(originalUrl.href); } finally { hook.deregister(); }
const { stagedMounted, setup, pairEvents, rig, scope, A, B } = nativeFixture;

const modes = Object.keys(frictionAdmission.fixtures);
const close = (a, b) => assert.ok(Math.abs(a - b) <= 1e-12 * (1 + Math.max(Math.abs(a), Math.abs(b))), a + ' vs ' + b);
const same = (a, b) => a.forEach((v, i) => close(v, b[i]));
const dot = (a, b) => a.reduce((total, value, i) => total + value * b[i], 0);
const scale = (a, factor) => a.map(value => value * factor);
const minus = (a, b) => a.map((value, i) => value - b[i]);
const tangent = (v, n) => minus(v, scale(n, dot(v, n)));
const body = (position, velocity, mass = 1) => ({position, velocity, mass, radius:0.06});
const first = body([0, 0, 0], [1, .6, .2]);
const second = body([.32, .12, .04], [0, 0, 0]);

function verifyResponse({a, b, n, outA, outB, impulse, friction, restitution, before, after}) {
  const inverseMass = 1 / a.mass + 1 / b.mass;
  const incoming = minus(b.velocity, a.velocity);
  const outgoing = minus(outB, outA);
  const approach = -dot(n, incoming);
  assert.ok(approach > 0);
  close(dot(n, outgoing), restitution * approach);
  close(impulse, (1 + restitution) * approach / inverseMass);
  const beforeSlip = tangent(incoming, n), afterSlip = tangent(outgoing, n);
  const slip = Math.hypot(...beforeSlip);
  assert.ok(slip > 1e-6);
  const stop = slip / inverseMass;
  const limit = friction.coefficient * impulse;
  const magnitude = Math.min(stop, limit);
  close(friction.stopImpulse, stop);
  close(friction.limit, limit);
  close(friction.magnitude, magnitude);
  close(friction.slipBefore, slip);
  close(friction.slipAfter, Math.hypot(...afterSlip));
  same(afterSlip, scale(beforeSlip, 1 - magnitude / stop));
  close(dot(n, friction.impulseOnB), 0);
  same(friction.impulseOnB, scale(beforeSlip, -magnitude / slip));
  const changeA = scale(minus(outA, a.velocity), a.mass);
  const changeB = scale(minus(outB, b.velocity), b.mass);
  same(changeA, scale(changeB, -1));
  same(tangent(changeB, n), friction.impulseOnB);
  close(friction.normalEnergyLost, (1 - restitution ** 2) * approach ** 2 / (2 * inverseMass));
  close(friction.tangentialEnergyLost, magnitude * (slip - magnitude * inverseMass / 2));
  close(before - after, friction.normalEnergyLost + friction.tangentialEnergyLost);
  assert.ok(after <= before + 1e-12);
  return {approach, separation:dot(n,outgoing), slipBefore:slip, slipAfter:Math.hypot(...afterSlip),
    regime: magnitude === 0 ? 'zero' : magnitude < stop ? 'sliding' : 'instantaneous-arrest'};
}

test('24 declared oblique fixtures match the reference and preserve normal restitution', () => {
  assert.equal(modes.length, 24);
  for (const mode of modes) {
    const config = siltPairFixture(mode);
    const b = {...second, mass:config.masses[B]};
    const result = resolveSiltPairImpact(first,b,.33,config.restitution,config.friction);
    assert.ok(result,mode);
    const normalOnly = resolveSiltPairImpact(first,b,.33,config.restitution);
    assert.ok(normalOnly);
    assert.deepEqual(result.normal,normalOnly.normal);
    assert.equal(result.time,normalOnly.time);
    assert.equal(result.impulse,normalOnly.impulse);
    if (config.friction === 0) {
      const {friction:metadata,...exact}=result;
      assert.deepEqual(exact,normalOnly);
      assert.equal(metadata.tangentialEnergyLost,0);
    }
    const response = verifyResponse({a:first,b,n:result.normal,outA:result.velocities[0],outB:result.velocities[1],
      impulse:result.impulse,restitution:config.restitution,friction:result.friction,before:result.energyBefore,after:result.energyAfter});
    if (config.friction === 1) assert.equal(response.regime,'instantaneous-arrest');
  }
});

test('invalid admission, nonfinite configuration and degenerate contact fail closed', () => {
  for (const value of [-.1,.11,2,NaN,Infinity,null,'1']) {
    assert.equal(resolveSiltPairImpact(first,second,.33,.5,value),null);
  }
  assert.equal(resolveSiltPairImpact(first,second,.33,undefined,.3),null);
  assert.equal(resolveSiltPairImpact(first,second,.33,.7,.3),null);
  for (const name of ['mu03-e05-equal','pi06:__proto__','pi06:mu11-e05-equal','pi06:mu03-e2-equal','pi06:mu03-e05-unapproved']) {
    assert.equal(siltPairFixture(name),null);
  }
  for (const b of [body([.1,0,0],[0,0,0]),body([.32,.5,0],[0,0,0]),
    body([.32,0,0],[2,.6,.2]),body([.32,.12,0],[0,.6,.2]),
    body([.32,0,0],[NaN,0,0])]) {
    assert.equal(resolveSiltPairImpact(first,b,.33,.5,.3),null);
  }
  assert.equal(siltPairFixture('one-to-three').friction,undefined);
  assert.equal(siltPairFixture('pi05:e05-one-to-three').friction,undefined);
});

test('head-on friction fixture adds no tangential impulse or loss', () => {
  const result = resolveSiltPairImpact(body([0,0,0],[1,0,0]),body([.32,0,0],[0,0,0]),.33,1,1);
  assert.ok(result);
  assert.equal(result.friction.slipBefore,0);
  assert.equal(result.friction.magnitude,0);
  assert.equal(result.friction.tangentialEnergyLost,0);
  assert.equal(result.energyAfter,result.energyBefore);
});

test('joint speed-cap rejection leaves both native velocities untouched', () => {
  const f = setup('pi06:mu01-e1-equal');
  const vA=[2.1,0,0], vB=[0,2.1,0];
  const impact=resolveSiltPairImpact(body([0,0,0],vA),body([.12,0,0],vB),.025,1,.1);
  assert.ok(impact && Math.hypot(...impact.velocities[1]) > 2.1);
  f.seed([0,0,0],[.12,0,0],vA,vB);
  f.owner.advancePair(.025,f.entries(100),true);
  assert.equal(pairEvents(f.owner).length,0);
  assert.deepEqual([f.owner.get(A).velocity,f.owner.get(B).velocity],[vA,vB]);
});

test('invalid step, mount, generation, and fixed surface arbitration retain authority', () => {
  const f=setup('pi06:mu03-e05-equal');
  f.seed([0,0,0],[.14,.012,.004],[1,.6,.2]);
  for (const patch of [{hostId:'unknown'},{cellId:'unknown'},{mountCount:2},{mountSequence:2},{generation:2},{substep:-1},{frame:99}]) {
    const entries=f.entries(100);
    Object.assign(entries[1].contact.step,patch);
    assert.equal(f.owner.advancePair(.025,entries,true),null);
  }
  assert.equal(f.owner.advancePair(.025,f.entries(100),false),null);
  assert.equal(pairEvents(f.owner).length,0);
  for (const [time,expects] of [[.019,0],[.020005,0],[.02002,1]]) {
    const fixture=setup('pi06:mu03-e05-equal');
    fixture.seed([0,0,0],[.14,.012,.004],[1,.6,.2]);
    fixture.owner.advancePair(.025,fixture.entries(100,undefined,{id:'fixed',center:[time+.5,0,0],radii:[.5,80,80]}),true);
    assert.equal(pairEvents(fixture.owner).length,expects,time);
    assert.equal(fixture.owner.snapshot().freeMaterialContacts?.[0]?.receiverId,'fixed');
  }
});

test('disabled and unsupported fixtures publish no pair impulse', () => {
  for (const mode of [null,'pi06:unknown','pi06:mu03-e05-unknown']) {
    const f=setup(mode);
    f.seed();
    assert.equal(f.owner.advancePair(.05,f.entries(100),true),null);
    assert.equal(f.owner.snapshot().materialPairExperiment,undefined);
  }
});

const mounted = [];
function verifyEvent(event, configuration) {
  assert.deepEqual(event.actualRecipientIds,[A,B]);
  assert.equal(event.fixture,configuration.id);
  assert.equal(event.restitution,configuration.restitution);
  assert.equal(event.frictionAdmissionRevision,frictionAdmission.revision);
  assert.equal(event.impactFriction.coefficient,configuration.friction);
  assert.equal(event.inventoryTransferred,false);
  assert.equal(event.progressionCredit,false);
  assert.equal(event.hostReceipt,false);
  const [a,b]=event.units;
  same(event.momentumAfter,event.momentumBefore);
  close(new Vector3(...a.contactPosition).distanceTo(new Vector3(...b.contactPosition)),.12);
  close(event.kineticEnergyLost,event.impactFriction.normalEnergyLost+event.impactFriction.tangentialEnergyLost);
  const result=verifyResponse({a:{mass:a.mass,velocity:a.incomingVelocity},b:{mass:b.mass,velocity:b.incomingVelocity},
    n:event.normal,outA:a.outgoingVelocity,outB:b.outgoingVelocity,restitution:configuration.restitution,
    impulse:event.impulse,friction:event.impactFriction,before:event.kineticEnergyBefore,after:event.kineticEnergyAfter});
  const nativeEnergy=event.units.reduce((total,u)=>total+u.mass*dot(u.beforeNativeVelocity,u.beforeNativeVelocity)/2,0);
  const externalMomentum=event.units.reduce((total,u)=>total.map((v,i)=>v+u.mass*(u.incomingVelocity[i]-u.beforeNativeVelocity[i])),[0,0,0]);
  return {...result,externalNativeEnergy:event.kineticEnergyBefore-nativeEnergy,externalNativeMomentum:externalMomentum};
}
for (const id of [...modes.filter(id=>id.includes('-e05-')), 'pi06:mu03-e0-equal','pi06:mu03-e0-one-to-three',
  'pi06:mu03-e1-equal','pi06:mu03-e1-one-to-three']) {
  test('mounted '+id+' accepts one response and both identities can be retrieved', t=>{
    const configuration=siltPairFixture(id), m=stagedMounted(t,id);
    assert.equal(m.evidence.events.length,1,id);
    const [event]=m.evidence.events;
    const witness=verifyEvent(event,configuration);
    if(configuration.friction===1)assert.equal(witness.regime,'instantaneous-arrest');
    if(configuration.friction===0.1 || configuration.friction===0.3 && configuration.restitution===0.5)
      assert.equal(witness.regime,'sliding');
    const retrievals=[];
    for(const [i,unit] of [m.first,m.second].entries()){
      rig.acquire(m.game,unit);
      assert.equal(m.owner.has(unit.id),false);
      assert.equal(m.route.materialIdentity.get(unit.id).owner,'grip');
      const release=m.release(i===0?[-1,0,0]:[1,0,0]);
      assert.notEqual(m.owner.free.get(unit.id).freeContact.releaseSequence,event.units[i].releaseSequence);
      retrievals.push({id:unit.id,release});
    }
    m.game.mount('CELL_SIGNAL_CHORUS_NERVE_001');m.game.step();
    m.game.mount(scope.cellId);m.game.steps(4);
    assert.equal(pairEvents(m.owner).length,1);
    assert.equal(m.route.materialIdentity.totalMass(),8);
    mounted.push({id,...m.evidence,witness,retrievals,inventoryQ:8,remountNoNewImpact:true});
  });
}
test('native mounted near miss produces no contact or receipt',t=>{
  const m=stagedMounted(t,'pi06:mu1-e1-one-to-three',true);
  assert.equal(m.evidence.events.length,0);
  assert.equal(m.owner.snapshot().freeMaterialContacts,undefined);
  mounted.push({id:'near-miss',...m.evidence,inventoryQ:8});
});
test('the admitted pair rearms only after measured separation with original release identities',()=>{
  const id='pi06:mu03-e05-one-to-three';
  const f=setup(id,{spring:.44,drag:.74});
  f.seed([0,0,0],[.13,.006,.002],[1,.6,.2]);
  const step=(frame,targets,dt=.025)=>f.owner.advancePair(dt,f.entries(frame,targets),true);
  step(100,[[0,0,0],[.13,.006,.002]],.05);
  assert.equal(pairEvents(f.owner).length,1);
  for(let frame=101;frame<108;frame++)step(frame,[[1,0,0],[-1,0,0]]);
  assert.equal(pairEvents(f.owner).length,1);
  for(let frame=108;frame<142;frame++)step(frame,[[-4,0,0],[4,0,0]]);
  const gap=new Vector3(...f.owner.get(A).position).distanceTo(new Vector3(...f.owner.get(B).position));
  assert.ok(gap>.121);
  assert.equal(f.owner.pairLatch.armed,true);
  // Stage a second approaching oblique corridor after measured separation,
  // using the same accepted release records. The owner still resolves ingress.
  const again=f.owner.get(A).position;
  for(const [id,offset,velocity] of [[A,[0,0,0],[1,.6,.2]],[B,[.13,.006,.002],[0,0,0]]]){
    const record=f.owner.free.get(id);
    record.position=again.map((value,index)=>value+offset[index]);
    record.velocity=velocity;
  }
  step(142,[[...again],again.map((value,index)=>value+[.13,.006,.002][index])],.05);
  const events=pairEvents(f.owner);
  assert.equal(events.length,2);
  assert.notEqual(events[0].id,events[1].id);
  assert.deepEqual(events[0].units.map(u=>u.releaseSequence),events[1].units.map(u=>u.releaseSequence));
  mounted.push({id:'owner-repeat-after-separation',gap,events,staging:'Authenticated trajectory fixtures; native attractor inputs staged.'});
});
test.after(()=>{
  if(process.env.BLOB_PI06_REPORT)writeFileSync(process.env.BLOB_PI06_REPORT,JSON.stringify({
    schema:'blob.pi06.mounted.v1',source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mounted
  },null,2)+'\n');
});
