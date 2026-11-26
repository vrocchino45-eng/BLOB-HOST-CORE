import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const approved=read('./NF04-approved-scope.json'),nf=read('./NF02-contract.json'),pair=read('../../../src/contact/siltPairAdmission.json');
const d=nf.dimensionVectors;
const multiply=(a,b)=>a.map((v,i)=>v+b[i]);
const divide=(a,b)=>a.map((v,i)=>v-b[i]);
test('approval is scoped and leaves previous scale factors and Q independent',()=>{
 assert.equal(approved.sourceRevision,nf.revision);
 assert.deepEqual(approved.scope,['Lw','Ts','Mr','Q']);
 assert.equal(approved.siLength,null);assert.equal(approved.siMass,null);
 assert.equal(pair.dimensionalContract.SI.metersPerLw,null);
 assert.equal(pair.dimensionalContract.SI.kilogramsPerMr,null);
 assert.equal(pair.accounting.ledgerUnit,'Q');
 assert.equal(pair.accounting.expectedUnits,8);
});
test('translation, acceleration, momentum and impulse are dimensionally consistent',()=>{
 assert.deepEqual(divide(d.length,d.time),d.velocity);
 assert.deepEqual(divide(d.velocity,d.time),d.acceleration);
 assert.deepEqual(multiply(d.mass,d.acceleration),d.force);
 assert.deepEqual(multiply(d.mass,d.velocity),d.momentum);
 assert.deepEqual(multiply(d.force,d.time),d.impulse);
 assert.deepEqual(d.impulse,d.momentum);
});
test('energy, work, pressure, angular and relaxation relationships use the correct powers',()=>{
 assert.deepEqual(multiply(d.momentum,d.velocity),d.energy);
 assert.deepEqual(multiply(d.force,d.length),d.energy);
 assert.deepEqual(divide(d.energy,d.time),d.power);
 assert.deepEqual(divide(d.force,d.area),d.pressure);
 assert.deepEqual(divide(d.mass,d.volume),d.density);
 assert.deepEqual(multiply(d.length,d.momentum),d.angularMomentum);
 assert.deepEqual(multiply(d.frequency,d.time),[0,0,0]);
 assert.deepEqual(multiply(d.linearDamping,d.time),[0,0,0]);
 assert.deepEqual(divide(d.mass,multiply(d.length,d.time)),d.dynamicViscosity);
});
