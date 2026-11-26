import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { buildCompatibility, readBuildIdentity } from './build-compatibility.mjs';

const contract=JSON.parse(readFileSync(new URL('./scenarios/in04-revision-7/admission.json',import.meta.url)));
const calibration=new URL('../../src/contact/siltPairFrictionAdmission.json',import.meta.url);
const predecessor=new URL('./scenarios/in03-revision-6/admission.json',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(readFileSync(predecessor)),contract.previousAdmissionSHA256);
assert.equal(sha(readFileSync(calibration)),contract.calibrationSHA256);

export function readIN04Scenarios(){return structuredClone(contract.scenarios);}

export function validateIN04Scenario(row,identity,toolingCommit){
 if(row?.schema!==contract.schema||row.revision!==contract.revision)return {status:'INVALID_SETUP',code:'UNSUPPORTED_SCENARIO_REVISION'};
 const pinned=contract.scenarios.find(x=>x.id===row.id);
 if(!pinned||!isDeepStrictEqual(row,pinned))return {status:'INVALID_SETUP',code:'UNAPPROVED_TANGENTIAL_FIXTURE'};
 const gate=buildCompatibility(identity,contract.source.commit);
 if(gate.status!=='PASS')return gate;
 if(identity.gameplayFingerprint!==contract.source.fingerprint)return {status:'INCOMPATIBLE_BUILD',code:'UNADMITTED_FINGERPRINT'};
 if(identity.commit!==contract.source.commit&&identity.commit!==toolingCommit)
  return {status:'INCOMPATIBLE_BUILD',code:'UNAPPROVED_SOURCE_COMMIT'};
 return {status:'PASS',code:gate.code,classification:pinned.classification};
}

export function verifyIN04Admission(root,toolingCommit){
 const identity=readBuildIdentity(root,contract.source.commit);
 for(const row of readIN04Scenarios())assert.equal(validateIN04Scenario(row,identity,toolingCommit).status,'PASS',row.id);
 return identity;
}
