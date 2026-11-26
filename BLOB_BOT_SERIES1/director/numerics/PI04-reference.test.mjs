import assert from 'node:assert/strict';
import {test} from 'node:test';
import {firstSphereIngress, solveNormalImpulse, within} from './PI04-reference.mjs';

const impulse = {massA:1,massB:1,velocityA:[1,0,0],velocityB:[0,0,0],normal:[1,0,0]};
const sweep = {positionA:[0,0,0],positionB:[0.32,0,0],velocityA:impulse.velocityA,
  velocityB:impulse.velocityB,radiusA:0.06,radiusB:0.06,seconds:0.33};
const verifyConservation = output => {
  for (let i=0; i<3; i++) assert.ok(within(output.momentumBefore[i],output.momentumAfter[i]));
  assert.ok(output.energyAfter <= output.energyBefore);
};
test('equal masses produce 0.5:0.5 and preserve one momentum unit',()=>{
  const out=solveNormalImpulse(impulse);
  assert.deepEqual(out.outgoingA,[.5,0,0]); assert.deepEqual(out.outgoingB,[.5,0,0]);
  assert.deepEqual(out.momentumBefore,[1,0,0]); assert.equal(out.energyBefore,.5); assert.equal(out.energyAfter,.25);
  assert.equal(out.normalImpulse,.5); verifyConservation(out);
});
test('one-to-three masses produce 0.25:0.25 and conserve momentum',()=>{
  const out=solveNormalImpulse({...impulse,massB:3});
  assert.deepEqual(out.outgoingA,[.25,0,0]); assert.deepEqual(out.outgoingB,[.25,0,0]);
  assert.equal(out.normalImpulse,.75); assert.equal(out.energyAfter,.125); verifyConservation(out);
});
test('oblique velocities keep every tangential component',()=>{
  const out=solveNormalImpulse({...impulse,velocityA:[1,.34,-.52],velocityB:[0,.76,1.04]});
  assert.deepEqual(out.outgoingA,[.5,.34,-.52]); assert.deepEqual(out.outgoingB,[.5,.76,1.04]);
  verifyConservation(out);
});
test('reversed participant ordering gives the same solutions and absolute hit time',()=>{
  const ab=solveNormalImpulse({...impulse,massB:3});
  const ba=solveNormalImpulse({massA:3,massB:1,normal:[-1,0,0],velocityA:impulse.velocityB,velocityB:impulse.velocityA});
  assert.deepEqual(ab.outgoingA,ba.outgoingB); assert.deepEqual(ab.outgoingB,ba.outgoingA);
  const first=firstSphereIngress(sweep);
  const reversed=firstSphereIngress({...sweep,positionA:sweep.positionB,positionB:sweep.positionA,velocityA:sweep.velocityB,velocityB:sweep.velocityA});
  assert.ok(within(first.seconds,reversed.seconds)); assert.deepEqual(reversed.normal,[-1,0,0]);
});
test('sweep admits an actual entry at 0.20 seconds and rejects a geometric near miss',()=>{
  const hit=firstSphereIngress(sweep);
  assert.equal(hit.reason,'ingress'); assert.ok(within(hit.seconds,.2));
  assert.deepEqual(hit.normal,[1,0,0]);
  assert.equal(firstSphereIngress({...sweep,positionB:[.32,.14,0]}).reason,'near_miss');
});
test('initial overlap, separating moves, tangency and later intersection are distinct',()=>{
  assert.equal(firstSphereIngress({...sweep,positionB:[.11,0,0]}).reason,'initial_overlap');
  assert.equal(firstSphereIngress({...sweep,velocityA:[-1,0,0]}).reason,'separating_or_stationary');
  assert.equal(firstSphereIngress({...sweep,positionB:[.32,.12,0]}).reason,'tangential');
  assert.equal(firstSphereIngress({...sweep,seconds:.1}).reason,'outside_interval');
  assert.equal(solveNormalImpulse({...impulse,velocityA:[-1,.2,0]}).applied,false);
});
test('split common intervals give the same ingress time for force-free motion',()=>{
  assert.equal(firstSphereIngress({...sweep,seconds:.1}).reason,'outside_interval');
  const split=firstSphereIngress({...sweep,positionA:[.1,0,0],seconds:.23});
  assert.ok(within(.1+split.seconds,firstSphereIngress(sweep).seconds));
});
test('invalid, nonfinite and unrepresentable inputs fail closed',()=>{
  for (const massA of [0,-1,NaN,Infinity]) assert.throws(()=>solveNormalImpulse({...impulse,massA}),RangeError);
  assert.throws(()=>solveNormalImpulse({...impulse,massA:Number.MIN_VALUE,massB:Number.MAX_VALUE}),RangeError);
  assert.throws(()=>solveNormalImpulse({...impulse,velocityB:[0,NaN,0]}),RangeError);
  assert.throws(()=>solveNormalImpulse({...impulse,normal:[2,0,0]}),RangeError);
  assert.throws(()=>firstSphereIngress({...sweep,seconds:Infinity}),RangeError);
  assert.throws(()=>firstSphereIngress({...sweep,radiusA:0}),RangeError);
});
