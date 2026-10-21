/**
 * C0C3 deterministic original-vs-adapter class parity test.
 * Run: node scripts/validateC0C3Silt.mjs
 * Fixture is the untouched D2M class, test-only (never in src/).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { SiltCompressionContact as Original } from './fixtures/C0C3_SiltCompressionContact_D2M_REFERENCE.mjs';
import { SiltCompressionContact as Integrated } from '../src/contact/SiltCompressionContact.js';
import { boundedAdd, boundedRecovery } from '../src/hostCircuit/BoundedAccumulatorBehavior.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const referenceHash = createHash('sha256')
  .update(readFileSync(resolve(root, 'scripts/fixtures/C0C3_SiltCompressionContact_D2M_REFERENCE.mjs'))).digest('hex');
assert.equal(referenceHash, '416cef704a7727277fa2983fd68bfde47741204e01648a06df6187bdbc7e1be2',
  'Test fixture must remain the untouched D2M reference');
const integratedSource = readFileSync(resolve(root, 'src/contact/SiltCompressionContact.js'), 'utf8');
assert.match(integratedSource, /import\s*\{\s*boundedAdd\s*,\s*boundedRecovery\s*\}\s*from\s*["']\.\.\/hostCircuit\/BoundedAccumulatorBehavior\.js["']/);
assert.match(integratedSource, /this\.pressure\s*=\s*boundedAdd\(/);
assert.match(integratedSource, /this\.pressure\s*=\s*boundedRecovery\(/);
assert.equal(typeof boundedAdd, 'function');
assert.equal(typeof boundedRecovery, 'function');

let assertions=4, updates=0;
const totals = new Map();
const check = (a,b,message) => { assert.deepStrictEqual(a,b,message); assertions++; };
const record = (events) => {
  for(const evt of events) totals.set(evt.outcome,(totals.get(evt.outcome)??0)+1);
};
const configs = [
  { position:[0,0,0] },
  { position:[-3,2,7], horizontalRadius:1.1, minHeight:-0.45, maxHeight:1.0, pressurePerPulse:0.26, imprintThreshold:0.52 },
  { position:[2,-1,-3], horizontalRadius:0.5, pressurePerPulse:0.7, imprintThreshold:0.95 }
];
const tracked = configs.map(options => ({
  legacy:new Original(options), circuit:new Integrated(options), options
}));
const step = (pair, input, context) => {
  const a=pair.legacy.update(input); const b=pair.circuit.update(input);
  check(b,a,`${context}: emitted events`);
  check(pair.circuit.snapshot(),pair.legacy.snapshot(),`${context}: full owned snapshot`);
  check(pair.circuit.pressure,pair.legacy.pressure,`${context}: exact scalar`);
  record(a); updates++;
};
const exercise = (pair, id) => {
  const at=pair.options.position;
  const center=[...at], core=[at[0],at[1],at[2]+0.5];
  const base={heldId:id,heldPosition:center,corePosition:core};
  step(pair,{...base,dt:0,braceHeld:false},'contact acquired');
  step(pair,{...base,dt:0,braceHeld:true},'brace engaged');
  for(let i=0;i<5;i++) step(pair,{...base,dt:0,braceHeld:true,bracedPulse:true,pulseAttempted:true},`braced accepted press ${i}`);
  step(pair,{...base,dt:0.08,braceHeld:true,pulseAttempted:true,absorbHeld:true},'absorb blocked and releases brace');
  for(let i=0;i<35;i++) step(pair,{...base,dt:0.08,braceHeld:false,absorbHeld:i%2===0},`recovery ${i}`);
  step(pair,{...base,dt:0.02,heldPosition:[at[0]+5,at[1],at[2]],pulseAttempted:true,pulseApproach:0.1},'remote press rejected');
  step(pair,{dt:0.1,heldId:null},'owner grip release and reset');
  step(pair,{...base,dt:0.1,pulseApproach:0.3},'reacquisition and accepted press');
  step(pair,{...base,dt:0.2,braceHeld:false,absorbHeld:false},'dt capped recovery');
  step(pair,{dt:NaN,heldId:null},'invalid dt release');
};
tracked.forEach((pair,i) => exercise(pair,`silt-grain-${String(i+1).padStart(2,'0')}`));
// Deterministic long varied stateful replay. Original and C01-integrated class
// experience exactly the same sampled stream, including edge guards and resets.
let seed=0xC0C30001;
const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const pick=items=>items[Math.floor(rng()*items.length)];
for(let i=0;i<12000;i++) {
  const pair=tracked[i%tracked.length],center=pair.options.position;
  const state=pair.legacy;
  const near=rng()>0.19;
  const heldId=rng()>0.075 ? pick(['silt-grain-01','silt-grain-02','silt-grain-06']) : null;
  const at=near ? [center[0]+(rng()-0.5)*0.22,center[1]+(rng()-0.5)*0.12,center[2]+(rng()-0.5)*0.22]
                : [center[0]+(rng()-0.5)*4,center[1]+(rng()-0.5)*2,center[2]+(rng()-0.5)*4];
  const approach=pick([0,0,0,0.03,0.1,0.42]);
  const input={
    dt:pick([0,0.016,0.033,0.1,0.14,0.7,NaN,-1]),
    heldId, heldPosition:rng()>0.03?at:null,
    corePosition:rng()>0.05?[center[0]+(rng()-0.5)*0.2,center[1],center[2]+0.6]:null,
    braceHeld:rng()>0.35, absorbHeld:rng()>0.75,
    pulseApproach:approach, resistedPulseApproach:rng()>0.93?0.15:0,
    pulseAttempted:rng()>0.71, bracedPulse:rng()>0.92
  };
  step(pair,input,`seeded replay iteration ${i}`);
}
const get=name=>totals.get(name)??0;
for(const kind of ['contact-entered','contact-pressed','temporary-imprint-formed','temporary-imprint-relaxed',
  'contact-brace-engaged','contact-brace-released','contact-pulse-not-loaded','contact-released']) {
  assert.ok(get(kind)>0,`Replay did not exercise ${kind}`); assertions++;
}
// Explicit proof: contact press alone creates no Host receipt; class has no
// Host signaling or material transfer surface.
for(const pair of tracked){
  const snapshot=pair.circuit.snapshot();
  check(snapshot.massTransfer,false,'contact cannot transfer mass');
  check(snapshot.progressionCredit,false,'contact cannot award progression');
}
const report={pass:'C0C3',result:'OFFLINE_SILT_OWNER_PARITY_PASS',baseline:'D2M original reference',
  assertions,ownerUpdateCalls:updates,trackedConfigurations:tracked.length,
  eventCoverage:Object.fromEntries([...totals.entries()].sort()),
  constraints:'Owner guards, hysteresis, brace and reset unchanged; no Vascular code modified',
  limitations:'Reference comes from last available D2M overlay, not an independent read of user local tree; browser/regional playtest still required'};
console.log(JSON.stringify(report,null,2));
