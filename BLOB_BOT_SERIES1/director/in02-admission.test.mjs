import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {readBuildIdentity} from './build-compatibility.mjs';
import {IN02_SCENARIOS,validateIn02Scenario} from './in02-admission.mjs';
const spec=JSON.parse(readFileSync(new URL('./scenarios/in02-revision-4/admission.json',import.meta.url)));
const approved=process.env.BLOB_DIRECTOR_RUNNER_SHA;
assert.match(approved??'',/^[a-f0-9]{40}$/);
const snapshot=readBuildIdentity(process.cwd(),spec.sources.IN02.commit);
const baseline=readBuildIdentity(process.env.BLOB_DIRECTOR_IN01_ROOT,spec.sources.IN01.commit);
const first=IN02_SCENARIOS.find(x=>x.id==='in02-ordinary');
const read=(scenario,identity=snapshot,tooling=approved)=>validateIn02Scenario(scenario,identity,tooling);

test('all eight pinned cases admit their exact ordinary or combined gameplay sources',()=>{
 for(const entry of IN02_SCENARIOS)assert.equal(read(entry,entry.source==='IN01'?baseline:snapshot).status,'PASS',entry.id);
});
test('earlier and unknown revisions stay outside revision four authority',()=>{
 for(const revision of [2,3,5,999])assert.equal(read({...first,revision}).code,'UNSUPPORTED_SCENARIO_REVISION');
});
test('wrong ancestry and changed gameplay bytes fail before admission',()=>{
 assert.equal(read(first,{...snapshot,gameplayAncestry:false}).code,'BASELINE_ANCESTRY_MISMATCH');
 assert.equal(read(first,{...snapshot,gameplayFingerprint:'a'.repeat(64)}).code,'GAMEPLAY_FINGERPRINT_MISMATCH');
 assert.equal(read(first,{...snapshot,workingGameplayDifferences:['src/main.js']}).code,'MODIFIED_GAMEPLAY_INPUTS');
});
test('unapproved descendants with the same gameplay fingerprint are rejected',()=>{
 assert.equal(read(first,{...snapshot,commit:'e'.repeat(40)}).code,'UNAPPROVED_SOURCE_COMMIT');
});
test('unapproved pairs, modes, outcomes and classifications are rejected',()=>{
 for(const change of [{mode:'elastic'},{pair:['silt-grain-03','silt-grain-04']},{expectedContacts:25},{classification:'human-accepted'}]){
  assert.equal(read({...first,...change}).code,'UNSUPPORTED_EXPERIMENT_CONFIGURATION');
 }
});
