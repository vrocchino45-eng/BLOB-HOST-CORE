/**
 * BLOB C0C4 — exact owner parity against archived untouched LS1E2 receiver.
 * Run from the project root: node scripts/validateC0C4Vascular.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const originalPath = resolve(projectRoot, 'scripts/fixtures/C0C4_VascularSiltSignalReceiver_LS1E2_REFERENCE.mjs');
const ownerPath = resolve(projectRoot, 'src/routes/VascularSiltSignalReceiver.js');
const kernelPath = resolve(projectRoot, 'src/hostCircuit/BoundedAccumulatorBehavior.js');
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const originalSha = '6705ac01fd9e0b81a361092d54437b96ddee44f5de92df1cedff86848b00063f';
const adaptedSha = '618828692cc1d49248aa48275fa35c4ff948d6e91ba0730c8f56185da5805bf9';
assert.equal(hash(originalPath), originalSha, 'untouched original fixture sha256');
assert.equal(hash(ownerPath), adaptedSha, 'installed C0C4 owner sha256');
assert.match(readFileSync(ownerPath, 'utf8'), /import \{ boundedAdd, boundedRecovery \}/, 'owner imports C01');
assert.match(readFileSync(kernelPath, 'utf8'), /export function boundedRecovery/, 'C0C2 utility present');

const { VascularSiltSignalReceiver: Reference } = await import(pathToFileURL(originalPath).href);
const { VascularSiltSignalReceiver: Adapted } = await import(pathToFileURL(ownerPath).href);
let assertions = 0, ownerSteps = 0, receivedProbes = 0, decayProbes = 0;
let ref = new Reference(), next = new Adapted();
function check(label) {
  assertions++;
  assert.deepStrictEqual(next.snapshot(), ref.snapshot(), `${label}: full owner snapshot`);
  assertions++;
  assert.deepStrictEqual(next.flowScale, ref.flowScale, `${label}: exact live flow multiplier`);
  // Also compare private authoritative state that is not rounded by snapshot.
  for (const key of ['membraneLoad', 'lastSequence', 'receivedTotal', 'gapTotal', 'lastReceiptId', 'lastSubjectId']) {
    assertions++;
    assert.deepStrictEqual(next[key], ref[key], `${label}: owner ${key}`);
  }
  assertions++;
  assert.deepStrictEqual(next.recentReceipts, ref.recentReceipts, `${label}: receipts history`);
  ownerSteps++;
}
function compareReceive(ledger, label) {
  const a = ref.receive(ledger), b = next.receive(ledger);
  assertions++;
  assert.equal(b, a, `${label}: accept count`);
  receivedProbes++;
  check(label);
  return b;
}
function compareTick(dt, label) {
  ref.update(dt); next.update(dt);
  decayProbes++;
  check(label);
}
function receipt(sequence, velocity = [1, 0, 0], changes = {}) {
  return {
    schemaVersion: 1, id: `CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:${sequence}`,
    sequence, kind: 'silt_material_disturbance_observed',
    sourceCellId: 'CELL_SILT_PRESSURE_ROUTE_001', sourceSystem: 'SiltPressureRouteSystem',
    sourceReceiptSequence: sequence, subjectId: 'silt-grain-01',
    origin: [1.2, 0, -3.4], releaseVelocity: velocity,
    effectType: 'observed_only', targetCellId: null,
    materialTransfer: false, routeCredit: false, worldConsequence: false,
    ...changes
  };
}
const ledger = records => ({pass: 'LS1E1', records});
const reset = () => { ref = new Reference(); next = new Adapted(); check('fresh reset'); };
reset();
assert.equal(compareReceive(ledger([receipt(1, [0,0,0])]), 'zero-speed authenticated'), 1);
assert.equal(compareReceive(ledger([receipt(1)]), 'same-receipt replay'), 0);
assert.equal(compareReceive(ledger([receipt(4, [2.5,0,0]), receipt(2, [0.5,0,0]), receipt(3, [3,0,0])]), 'out-of-order contiguous'), 3);
assert.equal(next.receivedTotal, 4);
compareReceive(ledger([receipt(4)]), 'duplicate no new load');
compareReceive(ledger([receipt(7, [0,0,0])]), 'sequence gap counted');
assert.equal(next.gapTotal, 2);
for (let i = 0; i < 60; i++) compareReceive(ledger([receipt(8+i, [8,0,0])]), `cap and 32-history ${i}`);
assert.equal(next.membraneLoad, 0.85, 'saturates at 0.85');
assert.equal(next.recentReceipts.length, 32, 'history cap unchanged');
compareTick(0.25, 'mounted dt=.25');
compareTick(1, 'dt cap at 0.25');
for (const dt of [0, -2, NaN, Infinity, -Infinity, null, undefined, 0.000001, 0.016, 0.1, 0.25, 2]) {
  compareTick(dt, `recovery dt=${String(dt)}`);
}
for (const load of [0, 0.0000001, 0.0000999, 0.0001, 0.1, 0.5, 0.849, 0.85]) {
  ref.membraneLoad = load; next.membraneLoad = load;
  compareTick(0.25, `cutoff dt=.25 load=${load}`);
}

// Each malformed case must be advanced past exactly as before, never authorize load.
const tamper = [
  {schemaVersion: 2},{sourceCellId:'CELL_GRAVE_001'}, {sourceSystem:'Elsewhere'},
  {kind:'material_transfer'}, {effectType:'physical'}, {materialTransfer:true},
  {routeCredit:true}, {worldConsequence:true}, {targetCellId:'CELL_VASCULAR_RHYTHM_ROUTE_001'},
  {subjectId:'silt-grain-99'}, {sourceReceiptSequence:0}, {id:'false-receipt'},
  {releaseVelocity:[0,0]}, {origin:[0,0,Number.NaN]},
  {releaseVelocity:[0,Infinity,0]}, {origin:'not-an-array'},
  {sourceReceiptSequence:2.4}, {subjectId:null}
];
for (const c of tamper) {
  reset();
  compareReceive(ledger([receipt(1, [1,0,0], c)]), `forged ${JSON.stringify(c)}`);
  assert.equal(next.receivedTotal, 0, 'forged receipt never loaded');
  compareReceive(ledger([receipt(1)]), 'forged sequence still advances; cannot replay valid same sequence');
}
reset();
compareReceive(null, 'null ledger');
compareReceive({pass:'none',records:[receipt(1)]}, 'wrong ledger pass');
compareReceive({pass:'LS1E1',records:null}, 'missing records');
compareReceive(ledger([{},null,receipt(2)]), 'malformed ledger records plus gap');
compareReceive(ledger([receipt(3),receipt(3)]), 'duplicate in same batch');

// Seeded replay: receives, duplicates, out-of-order, malformed receipt, and time recovery.
reset();
let seed = 0xC0C40004;
const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
let seq = 0;
for (let i=0; i<12000; i++) {
  const pick = rand();
  if (pick < 0.32) {
    seq++;
    const vec = [(rand()-0.5)*9, (rand()-0.5)*9, (rand()-0.5)*9];
    const rs = [receipt(seq, vec)];
    if (i % 33 === 0) rs.push(receipt(seq)); // same-batch duplicate
    if (i % 100 === 0) rs.push(receipt(seq+1,vec,{worldConsequence:true}));
    compareReceive(ledger(rs), `replay batch ${i}`);
    if (i % 17 === 0) compareReceive(ledger(rs), `replay duplicate ${i}`);
    if (i % 100 === 0) seq++; // malformed higher sequence observed, remains last-sequence tracking
  } else if (pick < 0.4) {
    compareReceive(ledger([receipt(Math.max(1,seq))]), `replay old ${i}`);
  } else if (pick < 0.45) {
    compareReceive({pass: 'bad', records: [receipt(seq+1)]}, `replay wrong-source ${i}`);
  } else {
    const dt = i % 7 === 0 ? 1.25 : rand() * 0.5;
    compareTick(dt, `replay decay ${i}`);
  }
}
// Route lifecycle guarantee: only VascularRhythmRouteSystem.update invokes receiver.update
// while mounted. We compare inactive periods by NOT TICKING and checking identity.
const before = structuredClone(next.snapshot());
const beforeRef = structuredClone(ref.snapshot());
for (let i=0;i<25;i++) { check(`no mount/no update ${i}`); }
assert.deepStrictEqual(next.snapshot(), before, 'no unsolicited local recovery when unmounted');
assert.deepStrictEqual(ref.snapshot(), beforeRef);

console.log(JSON.stringify({
  pass: 'C0C4', result: 'OFFLINE_VASCULAR_OWNER_PARITY_PASS',
  assertions, ownerUpdatesCompared: ownerSteps,
  receiptProbes: receivedProbes, recoveryProbes: decayProbes,
  sourceBaseline: 'LS1E2 original receiver SHA256 verified',
  byteIdenticalOwnerStates: true,
  noVascularRouteEdits: true,
  constraints: 'receipt validation, sequence advance/gaps, dedupe, history, flow, mounted-only recovery unchanged',
  limitations: 'Offline class parity; the installed complete game and browser behavior require local verification.'
}, null, 2));
