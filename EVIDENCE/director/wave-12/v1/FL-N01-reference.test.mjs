import test from 'node:test';
import assert from 'node:assert/strict';
import { dimensions as d, equivalentResistance, exchange, junctionResidual, linearStorage } from './FL-N01-reference.mjs';

const mul = (a, b) => a.map((v, i) => v + b[i]);
const div = (a, b) => a.map((v, i) => v - b[i]);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), String(actual));
const reference = { sourcePotential: 8, receiverPotential: 2, resistance: 3, dt: 0.25, currentLimit: 4 };

test('candidate dimensions close independently of material inventory Q', () => {
  assert.notDeepEqual(d.flowQuantity, d.materialQ);
  assert.deepEqual(div(d.flowQuantity, d.time), d.current);
  assert.deepEqual(mul(d.potential, d.current), d.power);
  assert.deepEqual(mul(d.power, d.time), d.energy);
  assert.deepEqual(div(d.potential, d.current), d.resistance);
  assert.deepEqual(mul(d.conductance, d.resistance), d.phase);
  assert.deepEqual(div(d.flowQuantity, d.potential), d.capacitance);
  assert.deepEqual(mul(d.resistance, d.time), d.inductance);
  assert.deepEqual(mul(d.frequency, d.time), d.phase);
});
test('equal potentials and an open pathway produce zero transfer', () => {
  for (const changes of [{ receiverPotential: 8 }, { resistance: null }]) {
    assert.deepEqual(exchange({ ...reference, ...changes }), {
      current: 0, signedQuantity: 0, throughput: 0, sourceWork: 0, receiverWork: 0, power: 0, dissipation: 0
    });
  }
});
test('a passive linear pathway balances source work, receiver work and dissipation', () => {
  const result = exchange(reference);
  assert.deepEqual(result, { current: 2, signedQuantity: 0.5, throughput: 0.5, sourceWork: 4, receiverWork: 1, power: 12, dissipation: 3 });
  close(result.sourceWork, result.receiverWork + result.dissipation);
  close(result.power, result.current ** 2 * reference.resistance);
});
test('reversing direction preserves loss and exchanges the source and destination', () => {
  const reverse = exchange({ ...reference, sourcePotential: 2, receiverPotential: 8 });
  assert.equal(reverse.current, -2);
  assert.equal(reverse.signedQuantity, -0.5);
  assert.equal(reverse.throughput, 0.5);
  assert.equal(reverse.receiverWork, -4);
  assert.equal(reverse.dissipation, 3);
  close(reverse.sourceWork, reverse.receiverWork + reverse.dissipation);
});
test('zero-duration observation has power and no transferred quantity or energy', () => {
  const result = exchange({ ...reference, dt: 0 });
  assert.equal(result.current, 2);
  assert.equal(result.power, 12);
  assert.equal(result.throughput, 0);
  assert.equal(result.dissipation, 0);
});
test('admitted intervals integrate piecewise-constant work and quantity consistently', () => {
  const whole = exchange(reference);
  const half = exchange({ ...reference, dt: reference.dt / 2 });
  for (const key of ['signedQuantity', 'throughput', 'sourceWork', 'receiverWork', 'dissipation']) close(whole[key], 2 * half[key]);
});
test('series carries identical current and partitions potential drop', () => {
  const resistance = equivalentResistance([1, 2], 'series');
  const one = exchange({ ...reference, sourcePotential: 8, receiverPotential: 6, resistance: 1 });
  const two = exchange({ ...reference, sourcePotential: 6, receiverPotential: 2, resistance: 2 });
  const total = exchange({ ...reference, resistance });
  assert.equal(one.current, two.current);
  close(one.dissipation + two.dissipation, total.dissipation);
});
test('parallel branches share potential drop and currents sum at a junction', () => {
  const referenceWithBound = { ...reference, currentLimit: 10 };
  const total = exchange({ ...referenceWithBound, resistance: equivalentResistance([2, 3], 'parallel') });
  const branchCurrents = [2, 3].map(resistance => exchange({ ...referenceWithBound, resistance }).current);
  close(junctionResidual([total.current, ...branchCurrents.map(value => -value)]), 0);
});
test('a storage allocation must be accounted for in the junction', () => {
  close(junctionResidual([2, -1.5], 0.5), 0);
  assert.equal(junctionResidual([2, -1.5]), 0.5);
});
test('linear storage stores signed quantity with nonnegative energy and finite capacity', () => {
  const charged = linearStorage({ capacitance: 2, previous: 1, delta: 1, maximum: 2 });
  assert.deepEqual(charged, { quantity: 2, energy: 1, energyChange: 0.75 });
  const discharged = linearStorage({ capacitance: 2, previous: 2, delta: -1, maximum: 2 });
  assert.equal(discharged.energyChange, -charged.energyChange);
  assert.equal(linearStorage({ capacitance: 2, previous: 0, delta: -2, maximum: 2 }).energy, 1);
  assert.throws(() => linearStorage({ capacitance: 2, previous: 2, delta: 0.01, maximum: 2 }), RangeError);
  assert.throws(() => linearStorage({ capacitance: 2, previous: 3, delta: -2, maximum: 2 }), RangeError);
});
test('invalid, nonfinite, active and unlimited pathways fail closed', () => {
  for (const changes of [
    { sourcePotential: NaN }, { receiverPotential: Infinity }, { dt: -0.1 },
    { dt: Number.MAX_VALUE }, { resistance: -1 }, { resistance: 0 }, { resistance: Number.MIN_VALUE },
    { resistance: Infinity }, { currentLimit: Infinity }, { currentLimit: 1 }
  ]) assert.throws(() => exchange({ ...reference, ...changes }), RangeError);
  for (const paths of [[], [0, 2], [Infinity], [-1, 2]]) assert.throws(() => equivalentResistance(paths, 'parallel'), RangeError);
  assert.throws(() => junctionResidual([Infinity]), RangeError);
  assert.throws(() => linearStorage({ capacitance: 0, previous: 0, delta: 1, maximum: 2 }), RangeError);
});
