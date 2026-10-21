/**
 * Run from the root of the installed BLOB project:
 *   node scripts/validateC0C2Accumulator.mjs
 *
 * Numeric parity is checked against the audited OLD equations, not just
 * self-consistency. Optionally exercises native owners if both audited source
 * files are present; missing live tree leaves that part explicitly UNVERIFIED.
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { boundedAdd, boundedRecovery } from '../src/hostCircuit/BoundedAccumulatorBehavior.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let assertions = 0;
const check = (actual, expected, message) => {
  assertions++;
  assert.ok(Object.is(actual, expected) || Math.abs(actual - expected) < 1e-14,
    `${message}: expected ${expected}, received ${actual}`);
};
const throws = (fn, ctor) => {
  assertions++;
  assert.throws(fn, ctor);
};
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const siltOldAdd = (p, inc) => Math.min(1, p + inc);
const siltOldRecovery = (p, dt, absorbHeld) =>
  Math.max(0, p - (Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0) * (absorbHeld ? 1.4 : 0.8));
const vascularOldAdd = (load, speed) =>
  clamp(load + 0.14 + 0.055 * clamp(speed / 2.5, 0, 1), 0, 0.85);
const vascularOldRecovery = (load, dt) => {
  if (!Number.isFinite(dt) || dt <= 0) return load;
  let next = clamp(load * Math.exp(-Math.min(dt, 0.25) * 0.018), 0, 0.85);
  if (next < 0.0001) next = 0;
  return next;
};
const recoverSilt = (p, dt, absorbHeld) => boundedRecovery(p, {
  dt, rate: absorbHeld ? 1.4 : 0.8, law: 'linear', maxStepSeconds: 0.1,
  lower: 0, upper: 1
});
const recoverVascular = (load, dt) => boundedRecovery(load, {
  dt, rate: 0.018, law: 'exponential', maxStepSeconds: 0.25,
  lower: 0, upper: 0.85, cutoff: 0.0001
});
const accumulateVascular = (load, speed) => boundedAdd(load,
  0.14 + 0.055 * clamp(speed / 2.5, 0, 1), { lower: 0, upper: 0.85 });

// Boundary sequences and crossing the saturation limit.
let pressure = 0;
for (const i of [1, 2, 3, 4]) {
  pressure = boundedAdd(pressure, 0.42);
  check(pressure, [0.42, 0.84, 1, 1][i - 1], `Silt cap after press ${i}`);
}
check(boundedAdd(0, 0.42), 0.42, 'Silt first pressure');
check(boundedAdd(1, 0.42), 1, 'Silt saturated');
check(boundedAdd(0.5, -1), 0, 'lower bound');
for (const dt of [0, 0.001, 0.016, 0.1, 0.15, 0.25, 1, -1, Number.NaN, Infinity]) {
  for (const absorb of [false, true]) {
    for (const p of [0, 0.05, 0.15, 0.42, 0.84, 1]) {
      check(recoverSilt(p, dt, absorb), siltOldRecovery(p, dt, absorb), 'Silt linear recovery');
    }
  }
  for (const load of [0, 0.00005, 0.0001, 0.15, 0.74, 0.85]) {
    check(recoverVascular(load, dt), vascularOldRecovery(load, dt), 'Vascular exponential recovery');
  }
}
for (const speed of [0, 0.5, 1, 2.49, 2.5, 4, 10]) {
  for (const load of [0, 0.15, 0.65, 0.85]) {
    check(accumulateVascular(load, speed), vascularOldAdd(load, speed), 'Vascular amplitude');
  }
}
check(1 - accumulateVascular(0, 2.5) * 0.085, 1 - vascularOldAdd(0, 2.5) * 0.085, 'Vascular output');

// Deterministic varied replay (finite owner-domain values) for exact math parity.
let randomState = 0xC01C02;
const nextRandom = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 2 ** 32;
};
let oldSilt = 0, newSilt = 0, oldVascular = 0, newVascular = 0;
for (let i = 0; i < 12000; i++) {
  const dt = nextRandom() * 0.7;
  const pulse = nextRandom() > 0.82;
  const absorb = nextRandom() > 0.6;
  const reset = nextRandom() > 0.998;
  if (reset) { oldSilt = 0; newSilt = 0; } // Owner's grip-release reset, not kernel.
  if (pulse) {
    oldSilt = siltOldAdd(oldSilt, 0.42);
    newSilt = boundedAdd(newSilt, 0.42);
  }
  if (oldSilt > 0) oldSilt = siltOldRecovery(oldSilt, dt, absorb);
  if (newSilt > 0) newSilt = recoverSilt(newSilt, dt, absorb);
  check(newSilt, oldSilt, `Silt deterministic replay #${i}`);
  if (nextRandom() > 0.93) {
    const speed = nextRandom() * 6;
    oldVascular = vascularOldAdd(oldVascular, speed);
    newVascular = accumulateVascular(newVascular, speed);
  }
  oldVascular = vascularOldRecovery(oldVascular, dt);
  newVascular = recoverVascular(newVascular, dt);
  check(newVascular, oldVascular, `Vascular deterministic replay #${i}`);
}

// Invalid *configuration* is rejected rather than hiding a math fault.
throws(() => boundedAdd(NaN, 0.42), TypeError);
throws(() => boundedAdd(0, Infinity), TypeError);
throws(() => boundedAdd(0, 0.42, { lower: 1, upper: 1 }), RangeError);
throws(() => boundedRecovery(0.5, { dt: 0.1, rate: -1, law: 'linear', maxStepSeconds: 0.1 }), RangeError);
throws(() => boundedRecovery(0.5, { dt: 0.1, rate: 1, law: 'unknown', maxStepSeconds: 0.1 }), RangeError);

// If present in the user's *actual* working tree, exercise owner source as a
// provenance check. C0C2 itself doesn't import the new module into these owners.
const siltFile = resolve(root, 'src/contact/SiltCompressionContact.js');
const vascularFile = resolve(root, 'src/routes/VascularSiltSignalReceiver.js');
let ownerProof = 'UNVERIFIED (install both current owner sources before live-tree claim)';
if (existsSync(siltFile) && existsSync(vascularFile)) {
  const { SiltCompressionContact } = await import(pathToFileURL(siltFile).href);
  const { VascularSiltSignalReceiver } = await import(pathToFileURL(vascularFile).href);
  const contact = new SiltCompressionContact({ position: [0, 0, 0] });
  const heldPosition = [0, 0, 0];
  const corePosition = [0, 0, 0.5];
  for (const p of [0.42, 0.84, 1]) {
    contact.update({ dt: 0, heldId: 'silt-grain-01', heldPosition, corePosition,
      braceHeld: true, pulseApproach: 0.5 });
    check(contact.pressure, p, 'Native Silt owner contact press');
  }
  check(Number(contact.imprinted), 1, 'Native Silt imprint state');
  contact.update({ dt: 0.15, heldId: 'silt-grain-01', heldPosition,
    corePosition, braceHeld: false, pulseApproach: 0 });
  check(contact.pressure, recoverSilt(1, 0.15, false), 'Native Silt owner recovery');
  contact.update({ dt: 0.1, heldId: null });
  check(contact.pressure, 0, 'Native Silt grip release resets locally');

  const receiver = new VascularSiltSignalReceiver();
  const makeReceipt = (sequence, speed) => ({
    sequence, schemaVersion: 1, kind: 'silt_material_disturbance_observed',
    sourceCellId: 'CELL_SILT_PRESSURE_ROUTE_001',
    sourceSystem: 'SiltPressureRouteSystem',
    sourceReceiptSequence: sequence,
    id: `CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:${sequence}`,
    subjectId: 'silt-grain-01', origin: [0, 0, 0],
    releaseVelocity: [speed, 0, 0], effectType: 'observed_only',
    materialTransfer: false, routeCredit: false, worldConsequence: false,
    targetCellId: null
  });
  check(receiver.receive({ pass: 'LS1E1', records: [makeReceipt(1, 0), makeReceipt(2, 2.5)] }), 2,
    'Native Vascular receipt acceptance');
  check(receiver.membraneLoad, accumulateVascular(accumulateVascular(0, 0), 2.5),
    'Native Vascular receipt amplitude');
  check(receiver.receive({ pass: 'LS1E1', records: [makeReceipt(1, 0), makeReceipt(2, 2.5)] }), 0,
    'Native receiver replay deduplication');
  const tampered = { ...makeReceipt(3, 2.5), worldConsequence: true };
  check(receiver.receive({ pass: 'LS1E1', records: [tampered] }), 0,
    'Native Vascular rejects forged world-consequence receipt');
  check(receiver.receivedTotal, 2, 'Native Vascular rejects without new load');
  receiver.update(0.5);
  check(receiver.membraneLoad,
    recoverVascular(accumulateVascular(accumulateVascular(0, 0), 2.5), 0.5),
    'Native Vascular decay');
  check(receiver.flowScale, 1 - receiver.membraneLoad * 0.085, 'Native Vascular flow scale');
  ownerProof = 'PASS — audited Silt and Vascular owner imports and focused behavior';
}

console.log(JSON.stringify({
  pass: 'C0C2', result: 'OFFLINE_NUMERICAL_PASS', assertions,
  kernelUnusedByGameplay: true,
  ownerProof,
  numericalParity: 'PASS — audited original formula references, 12000-step seeded replay',
  limitations: 'C0C2 is a pure utility and does not prove browser behavior or installed baseline completeness'
}, null, 2));
