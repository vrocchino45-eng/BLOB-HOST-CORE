import assert from 'node:assert/strict';
import { previewCoreArrangement } from '../src/ui/CoreArrangementLabels.js';

const cases = [
  ['deep', {deep_core:3, inner_body:0, membrane:0}],
  ['inner', {deep_core:0, inner_body:3, membrane:0}],
  ['membrane', {deep_core:0, inner_body:0, membrane:3}],
  ['balanced', {deep_core:1, inner_body:1, membrane:1}],
];
const results = Object.fromEntries(cases.map(([name, counts]) => {
  const profile = previewCoreArrangement(counts, 1);
  assert.ok(profile, `${name}: profile missing`);
  for (const key of ['charge','reach','absorb','coherence','recovery','endurance']) {
    assert.ok(Number.isFinite(profile[key]) && profile[key] > 0, `${name}: invalid ${key}`);
  }
  return [name, profile];
}));
assert.ok(results.deep.endurance > results.membrane.endurance, 'Deep should have higher endurance than membrane');
assert.ok(results.deep.recovery > results.membrane.recovery, 'Deep should recover faster than membrane');
assert.ok(results.membrane.charge > results.deep.charge, 'Membrane should charge Pulse faster than deep');
assert.equal(previewCoreArrangement({deep_core:4, inner_body:0, membrane:0}), null, 'Invalid placement must be rejected');
console.log('[Wave 1 Core] PASS: radial topology profiles and bounds');
console.table(Object.fromEntries(Object.entries(results).map(([k,v]) => [k, {charge:v.charge, recovery:v.recovery, endurance:v.endurance}])));
