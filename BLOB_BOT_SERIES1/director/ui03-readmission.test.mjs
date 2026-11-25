import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {ACTIVE_CHECKPOINT,UI03_CHECKPOINT,loadScenario,validateScenario} from './scenario-contract.mjs';
import {readBuildIdentity} from './build-compatibility.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const identity=readBuildIdentity(root,UI03_CHECKPOINT);
const inherited=readBuildIdentity(root,ACTIVE_CHECKPOINT);
const scenario=(layout,newMode=false)=>new URL('./scenarios/'+(newMode?'ui03-revision-3/':'')+layout+'.json',import.meta.url);
test('revision three retains all three accepted workloads and admits only UI03 fingerprint',async()=>{
  assert.equal(identity.gameplayFingerprint,identity.requiredGameplayFingerprint);
  assert.notEqual(identity.gameplayFingerprint,inherited.requiredGameplayFingerprint);
  for(const layout of ['deep','balanced','membrane']){
    const newSetup=await loadScenario(scenario(layout,true),identity);
    assert.equal(newSetup.status,'PASS');
    const oldSetup=JSON.parse(fs.readFileSync(scenario(layout)));
    assert.deepEqual({...newSetup.scenario,revision:oldSetup.revision,build:oldSetup.build},oldSetup);
  }
});
test('old revision rejects this source and revision three rejects old checkpoint',async()=>{
  const old=await loadScenario(scenario('balanced'),inherited);
  assert.equal(old.code,'GAMEPLAY_FINGERPRINT_MISMATCH');
  const revised=JSON.parse(fs.readFileSync(scenario('balanced',true)));
  assert.equal(validateScenario({...revised,build:{checkpoint:ACTIVE_CHECKPOINT}},identity).code,'UNSUPPORTED_UI03_CHECKPOINT');
  assert.equal(validateScenario({...revised,revision:4},identity).code,'UNSUPPORTED_SCENARIO_REVISION');
});
test('revision three still rejects dirty bytes, fingerprint drift and foreign ancestry',async()=>{
  const revised=JSON.parse(fs.readFileSync(scenario('balanced',true)));
  assert.equal(validateScenario(revised,{...identity,workingGameplayDifferences:['src/ui/PlaytestHudSystem.js']}).code,'MODIFIED_GAMEPLAY_INPUTS');
  assert.equal(validateScenario(revised,{...identity,gameplayFingerprint:inherited.requiredGameplayFingerprint}).code,'GAMEPLAY_FINGERPRINT_MISMATCH');
  assert.equal(validateScenario(revised,{...identity,gameplayAncestry:false}).code,'BASELINE_ANCESTRY_MISMATCH');
});
