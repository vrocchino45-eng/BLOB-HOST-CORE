// Offline C0C1 contract sanity check. This DOES NOT execute the game.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(fs.readFileSync(path.join(root, 'C0C1_COMPONENT_INSTANCES.json'), 'utf8'));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const [silt, vascular] = spec.instances;
let passed=0;
const check=(label,fn)=>{fn();passed++;console.log(`PASS ${label}`)};
check('two owner-local instances, not shared state',()=>{assert.equal(spec.instances.length,2);assert.notEqual(silt.owner, vascular.owner);assert.notEqual(silt.cell,vascular.cell);assert.notEqual(silt.stateName,vascular.stateName)});
check('semantic port types cannot be exchanged',()=>{assert.equal(silt.inputType,'local.contact_pulse_accepted');assert.equal(vascular.inputType,'signal.provenance_receipt');assert.notEqual(silt.inputType,vascular.inputType)});
check('distinct bounded capacities',()=>{assert.equal(silt.max,1);assert.equal(vascular.max,.85)});
check('Silt two accepted pulses while braced cause threshold crossing',()=>{
  let value=0;value=clamp(value+silt.incrementPolicy.amount,0,silt.max);assert.equal(value,.42);
  value=clamp(value+silt.incrementPolicy.amount,0,silt.max);assert.equal(value,.84);
  assert.ok(value>=.8)
});
check('Silt press cap and linear recovery when not braced',()=>{
  let value=clamp(.84+.42,0,1);assert.equal(value,1);
  value=clamp(value-Math.min(.05,silt.relaxationPolicy.dtClamp)*.8,0,1);
  assert.ok(Math.abs(value-.96)<1e-12);
});
check('Silt absorb-directed recovery uses 1.4/s',()=>{
  const value=clamp(.42-.1*silt.relaxationPolicy.rateWhileAbsorbing,0,1);
  assert.ok(Math.abs(value-.28)<1e-12)
});
check('Silt release reset is not optional shared-capacitor decay',()=>{assert.equal(silt.resetPolicy,'held_id_changed_resets_immediately')});
check('Vascular speed-zero receipt gives .14 and speed >=2.5 gives .195',()=>{
  const inc=s=>vascular.incrementPolicy.base+vascular.incrementPolicy.gain*clamp(s/2.5,0,1);
  assert.equal(inc(0),.14);assert.ok(Math.abs(inc(2.5)-.195)<1e-12);
  assert.ok(Math.abs(inc(100)-.195)<1e-12)
});
check('Vascular saturation and exponential mounted decay',()=>{
  let load=clamp(.80+.195,0,.85);assert.equal(load,.85);
  load=clamp(load*Math.exp(-Math.min(.1,.25)*.018),0,.85);
  assert.ok(Math.abs(load-(.85*Math.exp(-.0018)))<1e-12)
});
check('Vascular flow scale stays in existing bounded range',()=>{
  assert.ok(Math.abs((1-.85*.085)-.92775)<1e-12);
  assert.equal(1-0*.085,1)
});
check('no implicit material/progression pathway',()=>{
  for(const x of spec.instances)assert.ok(x.notAllowed.some(s=>s.includes('progression_credit')));
  assert.ok(silt.notAllowed.includes('host_event_from_contact_press'));
  assert.ok(vascular.notAllowed.includes('physical_silt_arrival'))
});
check('no executable gameplay registry implied by fixture',()=>{assert.equal(spec.status,'PROPOSAL_OFFLINE_ONLY');assert.ok(spec.proofLimit.includes('not registered'))});
console.log(`C0C1 offline checks: ${passed}/${passed} PASS (math/source-contract illustration, NOT integrated game tests)`);
