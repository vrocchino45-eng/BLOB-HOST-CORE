import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {buildCompatibility,readBuildIdentity} from './build-compatibility.mjs';
const registry=JSON.parse(readFileSync(new URL('./scenarios/pi05-revision-5/admission.json',import.meta.url),'utf8'));
export function readPI05Scenarios() { return structuredClone(registry.scenarios); }
export function validatePI05Scenario(scenario,identity,toolingHead) {
 if(scenario?.schema!==registry.schema||scenario.revision!==registry.revision)
  return {status:'INVALID_SETUP',code:'UNSUPPORTED_SCENARIO_REVISION'};
 const admitted=registry.scenarios.find(row=>row.id===scenario.id);
 if(!admitted||!isDeepStrictEqual(admitted,scenario))
  return {status:'INVALID_SETUP',code:'UNAPPROVED_RESTITUTION_FIXTURE'};
 const result=buildCompatibility(identity,registry.source.commit);
 if(result.status!=='PASS')return result;
 if(identity.gameplayFingerprint!==registry.source.fingerprint)
  return {status:'INCOMPATIBLE_BUILD',code:'UNADMITTED_FINGERPRINT'};
 if(identity.commit!==registry.source.commit&&identity.commit!==toolingHead)
  return {status:'INCOMPATIBLE_BUILD',code:'UNAPPROVED_SOURCE_COMMIT'};
 return {status:'PASS',code:result.code,classification:admitted.classification};
}
export function readPI05Scenario(root,id,toolingHead) {
 return validatePI05Scenario(registry.scenarios.find(row=>row.id===id),readBuildIdentity(root,registry.source.commit),toolingHead);
}
