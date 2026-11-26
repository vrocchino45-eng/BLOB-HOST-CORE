import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { buildCompatibility, readBuildIdentity } from './build-compatibility.mjs';

const contract = JSON.parse(readFileSync(new URL('./scenarios/in03-revision-6/admission.json', import.meta.url)));
const admittedOwner = new URL('./scenarios/pi05-revision-5/admission.json', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(digest(readFileSync(admittedOwner)), contract.inheritedAdmission.sha256, 'Revision 5 bytes changed');

export function readIN03Scenarios() {
  return structuredClone(contract.scenarios);
}

export function validateIN03Scenario(scenario, identity, toolingCommit) {
  if (scenario?.schema !== contract.schema || scenario.revision !== contract.revision)
    return {status:'INVALID_SETUP',code:'UNSUPPORTED_SCENARIO_REVISION'};
  const expected = contract.scenarios.find(row => row.id === scenario.id);
  if (!expected || !isDeepStrictEqual(expected, scenario))
    return {status:'INVALID_SETUP',code:'UNAPPROVED_COMBINED_FIXTURE'};
  const identityGate = buildCompatibility(identity, contract.source.commit);
  if (identityGate.status !== 'PASS') return identityGate;
  if (identity.gameplayFingerprint !== contract.source.fingerprint)
    return {status:'INCOMPATIBLE_BUILD',code:'UNADMITTED_FINGERPRINT'};
  if (identity.commit !== contract.source.commit && identity.commit !== toolingCommit)
    return {status:'INCOMPATIBLE_BUILD',code:'UNAPPROVED_SOURCE_COMMIT'};
  return {status:'PASS',code:identityGate.code,classification:expected.classification};
}

export function verifyIN03Admission(root, toolingCommit) {
  const identity = readBuildIdentity(root, contract.source.commit);
  for (const scenario of readIN03Scenarios())
    assert.equal(validateIN03Scenario(scenario, identity, toolingCommit).status, 'PASS', scenario.id);
  return identity;
}
