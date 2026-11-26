import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readBuildIdentity } from './build-compatibility.mjs';
import { readIN03Scenarios, validateIN03Scenario } from './in03-admission.mjs';

const contract = JSON.parse(readFileSync(new URL('./scenarios/in03-revision-6/admission.json', import.meta.url)));
const identity = readBuildIdentity(process.cwd(), contract.source.commit);
const pin = process.env.BLOB_DIRECTOR_RUNNER_SHA;
const rows = readIN03Scenarios();
const first = rows[0];
const validate = scenario => validateIN03Scenario(scenario, identity, pin);

test('revision 6 admits six exact scenarios and both pinned source identities', () => {
  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map(row => row.restitution), [0,.5,1,0,.5,1]);
  assert.deepEqual(rows.map(row => row.massFixture), ['equal','equal','equal','one-to-three','one-to-three','one-to-three']);
  for (const row of rows) assert.equal(validate(row).status, 'PASS', row.id);
  assert.equal(validateIN03Scenario(first, {...identity,commit:contract.source.commit}).code, 'EXACT_CHECKPOINT');
});
test('earlier and unknown revisions do not grant combined-source authority', () => {
  for (const revision of [2,3,4,5,7,999]) assert.equal(validate({...first,revision}).code, 'UNSUPPORTED_SCENARIO_REVISION');
});
test('unknown fixture, different model, altered scope and human classification fail closed', () => {
  for (const change of [{id:'unknown'},{restitution:.4},{mode:'ordinary'},{cell:'changed'},{classification:'human-accepted'}])
    assert.equal(validate({...first,...change}).code, 'UNAPPROVED_COMBINED_FIXTURE');
});
test('changed input, starting pose, reserve and clock fail exact admission', () => {
  for (const modify of [
    row => {row.context.padTape='different input';},
    row => {row.initial.positionA[0] += .01;},
    row => {row.context.reserve=0;},
    row => {row.context.clock.step=1/30;},
    row => {row.grainWitnesses[0].scope.generation++;}
  ]) {
    const row = structuredClone(first);
    modify(row);
    assert.equal(validate(row).code, 'UNAPPROVED_COMBINED_FIXTURE');
  }
});
test('dirty gameplay, incompatible fingerprints, and unrelated ancestry fail closed', () => {
  for (const [change,code] of [
    [{workingGameplayDifferences:['src/main.js']},'MODIFIED_GAMEPLAY_INPUTS'],
    [{gameplayFingerprint:'f'.repeat(64)},'GAMEPLAY_FINGERPRINT_MISMATCH'],
    [{gameplayAncestry:false},'BASELINE_ANCESTRY_MISMATCH'],
    [{commit:'f'.repeat(40)},'UNAPPROVED_SOURCE_COMMIT']
  ]) assert.equal(validateIN03Scenario(first,{...identity,...change},pin).code,code);
});
test('caller changes cannot modify the frozen scenario authority', () => {
  const clone = readIN03Scenarios();
  clone[0].context.camera[0]=10000;
  assert.deepEqual(readIN03Scenarios(),rows);
  assert.equal(validate(clone[0]).code, 'UNAPPROVED_COMBINED_FIXTURE');
});
