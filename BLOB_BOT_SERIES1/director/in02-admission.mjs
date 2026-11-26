import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {buildCompatibility,readBuildIdentity} from './build-compatibility.mjs';

const spec=JSON.parse(readFileSync(new URL('./scenarios/in02-revision-4/admission.json',import.meta.url),'utf8'));
export const IN02_SCENARIOS=Object.freeze(spec.scenarios.map(row=>Object.freeze({...row,pair:Object.freeze(row.pair)})));

export function validateIn02Scenario(scenario,identity,approvedToolingCommit) {
  if (scenario?.schema!==spec.schema||scenario.revision!==spec.revision) {
    return {status:'INVALID_SETUP',code:'UNSUPPORTED_SCENARIO_REVISION'};
  }
  const admitted=IN02_SCENARIOS.find(row=>row.id===scenario.id);
  if (!admitted||!isDeepStrictEqual(scenario,admitted)) {
    return {status:'INVALID_SETUP',code:'UNSUPPORTED_EXPERIMENT_CONFIGURATION'};
  }
  const checkpoint=spec.sources[admitted.source];
  const outcome=buildCompatibility(identity,checkpoint.commit);
  if (outcome.status!=='PASS') return outcome;
  if (identity.gameplayFingerprint!==checkpoint.fingerprint) {
    return {status:'INCOMPATIBLE_BUILD',code:'UNADMITTED_FINGERPRINT'};
  }
  if (identity.commit!==checkpoint.commit
      && !(admitted.source==='IN02'&&identity.commit===approvedToolingCommit)) {
    return {status:'INCOMPATIBLE_BUILD',code:'UNAPPROVED_SOURCE_COMMIT'};
  }
  return {status:'PASS',code:outcome.code,classification:admitted.classification};
}

export function readIn02Scenario(root,id,approvedToolingCommit) {
  const scenario=IN02_SCENARIOS.find(row=>row.id===id);
  if (!scenario) return {status:'INVALID_SETUP',code:'UNSUPPORTED_EXPERIMENT_CONFIGURATION'};
  return validateIn02Scenario(scenario,readBuildIdentity(root,spec.sources[scenario.source].commit),approvedToolingCommit);
}
