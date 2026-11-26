import test from 'node:test';
import assert from 'node:assert/strict';
import { impact } from './PI06-reference.mjs';

const fixture = { mA: 1, mB: 1, vA: [1, 0.6, 0.2], vB: [0, 0, 0], normal: [1, 0, 0], restitution: 0.5, friction: 0 };
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), String(actual) + ' vs ' + expected);
const sameVector = (actual, expected) => actual.forEach((value, index) => close(value, expected[index]));

test('24 oblique fixtures preserve pair momentum, normal restitution, impulse bounds and passive energy', () => {
  for (const mB of [1, 3]) for (const restitution of [0, 0.5, 1]) for (const friction of [0, 0.1, 0.3, 1]) {
    const state = impact({ ...fixture, mB, restitution, friction });
    assert.ok(state);
    sameVector(state.momentumAfter, state.momentumBefore);
    sameVector(state.onA, state.onB.map(value => -value));
    close(state.normalAfter, restitution);
    close(state.jn, (1 + restitution) / (1 + 1 / mB));
    close(state.jt, Math.min(Math.hypot(0.6, 0.2) / (1 + 1 / mB), friction * state.jn));
    assert.ok(state.dissipated >= 0);
    close(state.before - state.after, state.dissipatedNormal + state.dissipatedTangent);
    const factor = 1 - state.jt / state.removeSliding;
    sameVector(state.tangentAfter, state.tangent.map(value => value * factor));
  }
});
test('frictionless contact reproduces the six PI05 outgoing normal references', () => {
  const expected = [[[0.5, 0.5], [0.25, 0.75], [0, 1]], [[0.25, 0.25], [-0.125, 0.375], [-0.5, 0.5]]];
  for (const [i, mB] of [1, 3].entries()) for (const [j, restitution] of [0, 0.5, 1].entries()) {
    const state = impact({ ...fixture, mB, restitution });
    close(state.outA[0], expected[i][j][0]);
    close(state.outB[0], expected[i][j][1]);
    sameVector(state.tangentAfter, state.tangent);
  }
});
test('sufficient bound eliminates instantaneous slip with no direction reversal', () => {
  const state = impact({ ...fixture, friction: 8 });
  close(state.jt, state.removeSliding);
  sameVector(state.tangentAfter, [0, 0, 0]);
  assert.ok(state.jt < state.frictionLimit);
  assert.ok(state.dissipatedTangent > 0);
});
test('below threshold, low and intermediate friction reduce but never reverse slip', () => {
  const low = impact({ ...fixture, friction: 0.1 });
  const medium = impact({ ...fixture, friction: 0.3 });
  assert.ok(low.jt > 0 && medium.jt > low.jt);
  assert.ok(medium.jt < medium.removeSliding);
  assert.ok(medium.tangentAfter[1] < 0 && medium.tangentAfter[2] < 0);
  assert.ok(medium.dissipatedTangent > low.dissipatedTangent);
});
test('head-on relative motion has no tangential impulse even at a high bound', () => {
  const state = impact({ ...fixture, vA: [1, 0, 0], friction: 1, restitution: 1 });
  close(state.jt, 0);
  close(state.after, state.before);
  close(state.dissipated, 0);
});
test('negating physical orientation and interchanging participants yields identical world impulses', () => {
  const original = impact({ ...fixture, mB: 3, friction: 0.2 });
  const swapped = impact({ ...fixture, mA: 3, mB: 1, vA: fixture.vB, vB: fixture.vA, normal: [-1, 0, 0], friction: 0.2 });
  sameVector(original.outA, swapped.outB);
  sameVector(original.outB, swapped.outA);
  close(original.dissipated, swapped.dissipated);
});
test('an arbitrarily rotated contact normal keeps the response in the original normal and tangent planes', () => {
  const unit = Math.SQRT1_2;
  const state = impact({ ...fixture, normal: [unit, unit, 0], vA: [1, 1, 0.5], friction: 0.2 });
  assert.ok(state);
  close(state.normalAfter, Math.SQRT2 * fixture.restitution);
  close(state.tangentAfter[0] + state.tangentAfter[1], 0);
});
test('near miss, separating and tangential-only inputs cannot commit an impact', () => {
  assert.equal(impact({ ...fixture, ingress: false }), null);
  assert.equal(impact({ ...fixture, vA: [-1, 0.6, 0.2] }), null);
  assert.equal(impact({ ...fixture, vA: [0, 0.6, 0.2] }), null);
});
test('persistent contact remains blocked until an owner supplies new separated ingress', () => {
  assert.ok(impact(fixture));
  assert.equal(impact({ ...fixture, persistent: true }), null);
  assert.equal(impact({ ...fixture, ingress: false }), null);
  assert.ok(impact(fixture));
});
test('nonfinite, active, non-unit and out-of-domain fixtures are rejected', () => {
  for (const patch of [{ mA: 0 }, { mB: -1 }, { mA: Infinity }, { friction: -0.01 }, { friction: Infinity },
    { restitution: 1.001 }, { restitution: NaN }, { normal: [2, 0, 0] }, { vB: [0, Infinity, 0] },
    { vA: [Number.MAX_VALUE, 0, 0] }, { friction: Number.MAX_VALUE, vA: [4, 0.6, 0.2] }]) {
    assert.equal(impact({ ...fixture, ...patch }), null);
  }
});
