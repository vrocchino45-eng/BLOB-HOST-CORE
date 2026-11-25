import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {verifyNFContract,convertUnits} from './NF02-verify.mjs';
const source=JSON.parse(fs.readFileSync(new URL('./NF02-contract.json',import.meta.url)));
test('canonical numeric contract is shaped and dimensioned correctly',()=>assert.equal(verifyNFContract(source),true));
test('SI length, mass, and inventory alias cannot be admitted by declaration',()=>{
  const broken=structuredClone(source);broken.SI.metersPerLw=1;assert.throws(()=>verifyNFContract(broken),TypeError);
  const wrong=structuredClone(source);wrong.inventoryUnit='Mr';assert.throws(()=>verifyNFContract(wrong),TypeError);
});
test('confusing momentum, force, and pressure fails validation',()=>{
  const broken=structuredClone(source);broken.dimensionVectors.force=broken.dimensionVectors.momentum;
  assert.throws(()=>verifyNFContract(broken),TypeError);
  const wrong=structuredClone(source);wrong.dimensionVectors.pressure=[0,0,0];assert.throws(()=>verifyNFContract(wrong),TypeError);
});
test('explicit hypothetical scales convert impulse and density with dimensional powers',()=>{
  const scales={metersPerLw:.2,kilogramsPerMr:.5,secondsPerTs:1};
  const {impulse,density,area,angularMomentum}=source.dimensionVectors;
  assert.equal(convertUnits(1,impulse,scales),.1);
  assert.ok(Math.abs(convertUnits(1,density,scales)-62.5)<1e-12);
  assert.ok(Math.abs(convertUnits(.04,area,scales,false)-1)<1e-12);
  assert.ok(Math.abs(convertUnits(1,angularMomentum,scales)-.02)<1e-12);
});
test('missing calibration, implicit defaults and nonfinite conversions fail closed',()=>{
  assert.throws(()=>convertUnits(1,source.dimensionVectors.impulse,source.SI),RangeError);
  assert.throws(()=>convertUnits(1,source.dimensionVectors.length,{...source.SI,metersPerLw:-1}),RangeError);
  assert.throws(()=>convertUnits(NaN,source.dimensionVectors.time,source.SI),TypeError);
  assert.equal(convertUnits(.05,source.dimensionVectors.time,source.SI),.05);
});
