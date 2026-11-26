import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {readBuildIdentity} from './build-compatibility.mjs';
import {readPI05Scenarios,validatePI05Scenario} from './pi05-admission.mjs';
const contract=JSON.parse(readFileSync(new URL('./scenarios/pi05-revision-5/admission.json',import.meta.url)));
const identity=readBuildIdentity(process.cwd(),contract.source.commit);
const approval=process.env.BLOB_DIRECTOR_RUNNER_SHA;
const rows=readPI05Scenarios(), first=rows[0];
test('revision five admits exactly six frozen development scenarios',()=>{
 assert.equal(rows.length,6);
 for(const row of rows)assert.equal(validatePI05Scenario(row,identity,approval).status,'PASS',row.id);
 assert.equal(validatePI05Scenario(first,{...identity,commit:contract.source.commit}).status,'PASS');
});
test('revisions 2, 3, 4 and unknown revisions do not grant revision five authority',()=>{
 for(const revision of [2,3,4,6,900])assert.equal(validatePI05Scenario({...first,revision},identity,approval).code,'UNSUPPORTED_SCENARIO_REVISION');
});
test('modified input bytes and unrelated ancestry fail closed',()=>{
 assert.equal(validatePI05Scenario(first,{...identity,gameplayAncestry:false},approval).code,'BASELINE_ANCESTRY_MISMATCH');
 assert.equal(validatePI05Scenario(first,{...identity,workingGameplayDifferences:['src/main.js']},approval).code,'MODIFIED_GAMEPLAY_INPUTS');
 assert.equal(validatePI05Scenario(first,{...identity,gameplayFingerprint:'f'.repeat(64)},approval).code,'GAMEPLAY_FINGERPRINT_MISMATCH');
});
test('unapproved descendants and modified fixture content reject',()=>{
 assert.equal(validatePI05Scenario(first,{...identity,commit:'f'.repeat(40)},approval).code,'UNAPPROVED_SOURCE_COMMIT');
 for(const change of [{restitution:.6},{massFixture:'1:4'},{classification:'human-accepted'},{reserve:900},{mode:'ordinary'}])
  assert.equal(validatePI05Scenario({...first,...change},identity,approval).code,'UNAPPROVED_RESTITUTION_FIXTURE');
});
