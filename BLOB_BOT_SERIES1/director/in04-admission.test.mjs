import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readBuildIdentity} from './build-compatibility.mjs';
import {readIN04Scenarios, validateIN04Scenario} from './in04-admission.mjs';

const contract=JSON.parse(readFileSync(new URL('./scenarios/in04-revision-7/admission.json',import.meta.url)));
const identity=readBuildIdentity(process.cwd(),contract.source.commit), pin=process.env.BLOB_DIRECTOR_RUNNER_SHA;
const rows=readIN04Scenarios(), first=rows[0];
const validate=row=>validateIN04Scenario(row,identity,pin);
test('revision 7 admits eight pinned browser comparisons on the exact source or its tooling descendant',()=>{
 assert.equal(rows.length,8);
 assert.deepEqual(rows.map(x=>x.coefficient),[0,0,.1,.1,.3,.3,1,1]);
 for(const row of rows)assert.equal(validate(row).status,'PASS',row.id);
 assert.equal(validateIN04Scenario(first,{...identity,commit:contract.source.commit}).code,'EXACT_CHECKPOINT');
});
test('every previous and unknown admission revision remains distinct',()=>{
 for(const revision of [2,3,4,5,6,8,900])assert.equal(validate({...first,revision}).code,'UNSUPPORTED_SCENARIO_REVISION');
});
test('unauthorized fixtures, mass and scope mutations fail closed',()=>{
 for(const change of [{id:'other'},{coefficient:.2},{normalFixture:'pi05:e1-equal'},{cell:'unrelated'},{classification:'human-accepted'}])
  assert.equal(validate({...first,...change}).code,'UNAPPROVED_TANGENTIAL_FIXTURE');
});
test('identity, input, starting pose, camera and step fields are exact pinned setup evidence',()=>{
 for(const edit of [
  x=>{x.context.clock.step=1/30;},x=>{x.context.camera[0]+=.01;},x=>{x.context.padTape='changed';},
  x=>{x.incoming[0].velocity[1]+=.05;},x=>{x.incoming[0].stamp.generation++;},x=>{x.context.reserve=0;}
 ]){
  const row=structuredClone(first);edit(row);
  assert.equal(validate(row).code,'UNAPPROVED_TANGENTIAL_FIXTURE');
 }
});
test('dirty input, unrelated source, fingerprint and ancestry each fail closed',()=>{
 for(const [change,code] of [
  [{workingGameplayDifferences:['src/main.js']},'MODIFIED_GAMEPLAY_INPUTS'],
  [{gameplayAncestry:false},'BASELINE_ANCESTRY_MISMATCH'],
  [{gameplayFingerprint:'f'.repeat(64)},'GAMEPLAY_FINGERPRINT_MISMATCH'],
  [{commit:'f'.repeat(40)},'UNAPPROVED_SOURCE_COMMIT']
 ])assert.equal(validateIN04Scenario(first,{...identity,...change},pin).code,code);
});
test('admission readers cannot mutate preserved registry content',()=>{
 const next=readIN04Scenarios();next[0].context.reserve=9;
 assert.deepEqual(readIN04Scenarios(),rows);
 assert.equal(validate(next[0]).code,'UNAPPROVED_TANGENTIAL_FIXTURE');
});
