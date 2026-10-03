#!/usr/bin/env node
// BLOB HC-031W2 - standalone read-only JSON evidence extractor.
// Usage: node hc031w2_audit.mjs path/to/BLOB_*.json > W2_check.md
// No dependencies, no edits to the running game, no gameplay authority.
import fs from 'node:fs';
import path from 'node:path';
const input = process.argv[2];
if (!input || !fs.existsSync(input)) {
  console.error('Usage: node hc031w2_audit.mjs <session-telemetry.json>');
  process.exit(2);
}
let d;
try { d = JSON.parse(fs.readFileSync(input,'utf8')); }
catch (e) { console.error('Invalid JSON:',e.message); process.exit(2); }
const events = Array.isArray(d.events) ? d.events : [];
const samples = Array.isArray(d.movementSamples) ? d.movementSamples : [];
const s = d.summary || {};
const count = (type)=> events.filter(e => e.type === type).length;
const all = (p)=>samples.filter(p);
const num = v => typeof v === 'number' ? v : 0;
const fmt = v => v == null ? '?' : String(v);
const target = events.filter(e => e.type === 'control.targeting_audit.changed');
const validCandidate = e=> ['local_object','local_entity'].includes(e?.developer?.candidateScope);
const inRange = e=>num(e?.percept?.candidateDistance) <= num(e?.developer?.assistRange);
const steering = e => !!e?.percept?.stabilizeHeld && !!e?.percept?.steeringIntentActive;
const steeringLocal = target.filter(e=>steering(e)&&validCandidate(e));
const steeringLocalNear = steeringLocal.filter(inRange);
const evidence = target.filter(e=>e?.developer?.redirectEvidencePresent);
const surface = m=>m?.surfaceCapabilityAuditState || {};
const force = m=>m?.movementForces || {};
const eligible=all(m=>!!surface(m).nearestMechanicalEligible);
const eligibleStab=eligible.filter(m=>!!m?.input?.stabilizeHeld);
const eligibleAbsorb=eligible.filter(m=>!!m?.input?.absorbHeld);
const eligibleMove=eligible.filter(m=>Object.values(m?.input?.move||{}).some(v=>Math.abs(num(v))>.1));
const active = all(m=>!!force(m).attachmentActive);
const attachedStates=new Set(samples.map(m=>fmt(force(m).attachmentState)));
const nearest = (m) => `${Number(num(m.t)).toFixed(2)}s ${fmt(surface(m).nearestProfileId)} d=${fmt(surface(m).nearestDistance)} stabilize=${!!m.input?.stabilizeHeld} absorb=${!!m.input?.absorbHeld} attach=${fmt(force(m).attachmentState)}`;
const pick = (lo,hi) => samples.filter(m=> num(m.t)>=lo && num(m.t)<=hi && !!surface(m).nearestMechanicalEligible).slice(0,4);
const countSummary=(key,evt)=>s[key] ?? count(evt);
let lines = [
'# BLOB HC-031W2 telemetry evidence check',
'',
`Source: ${path.basename(input)}`,
`Build: ${fmt(d.session?.buildId)} / ${fmt(d.session?.buildLabel)}`,
`Authority: ${fmt(d.session?.telemetryAuthority)}; gameplayAuthority=${fmt(d.session?.gameplayAuthority)}`,
`Duration: ${fmt(d.session?.wallDurationSeconds)} seconds; events=${events.length}; movementSamples=${samples.length}`,
'',
'## Targeting',
`- Stabilize+right-stick audit observations: ${target.filter(steering).length}`,
`- Of those, local candidate observed: ${steeringLocal.length}; candidate within reported assist range: ${steeringLocalNear.length}`,
`- Explicit redirectEvidencePresent audits: ${evidence.length}`,
`- Successful redirect count: ${countSummary('controllerTargetingStabilizeSteerRedirects','control.stabilize_steer.redirect')}`,
`- Redirect blocks: ${countSummary('controllerTargetingStabilizeRedirectBlocks','control.stabilize_steer.redirect_blocked')}`,
`- Macro/local suppressions: ${countSummary('controllerTargetingMacroRelationshipSuppressions','control.macro_relationship.suppressed')}`,
'',
'### Local candidate while Stabilize+steering',
...steeringLocalNear.slice(0,12).map(e=>`- t=${num(e.t).toFixed(2)}s; finding=${fmt(e.percept?.finding)}; candidate=${fmt(e.developer?.candidateId)}; attention=${fmt(e.developer?.attentionTargetId)}; relationship=${fmt(e.developer?.relationshipTargetId)}; candidateDistance=${fmt(e.percept?.candidateDistance)}; stick=${fmt(e.developer?.rightStickMagnitude)}; dwellAge=${fmt(e.developer?.stabilizeSteerDwellAge)}; redirectEvidencePresent=${fmt(e.developer?.redirectEvidencePresent)}`),
'',
'## Surface and movement',
`- Authoritative movement samples near mechanically eligible authored surfaces: ${eligible.length}`,
`- Among those: stabilizeHeld=${eligibleStab.length}; absorbHeld=${eligibleAbsorb.length}; nontrivial movement input=${eligibleMove.length}`,
`- Attachment-active samples: ${active.length}; attachment states=${Array.from(attachedStates).join(', ')}`,
`- Surface attachment events: ${countSummary('surfaceAttachments','movement.surface.attached')}`,
`- Surface detachment events: ${countSummary('surfaceDetachments','movement.surface.detached')}`,
`- Deliberate detachments: ${countSummary('deliberateSurfaceDetachments','movement.surface.deliberately_detached')}`,
`- Reacquire unblocks: ${countSummary('surfaceReacquireUnblocks','movement.surface.reacquire_unblocked')}`,
`- Maximum authoredSuctionSupportCount: ${Math.max(0,...samples.map(m=>num(force(m).authoredSuctionSupportCount)))}`,
'',
'### Reproduction windows (mechanical eligibility is not actual contact)',
...[[418,422],[599,604],[666,670],[676,681]].flatMap(([lo,hi])=>[
`- ${lo}–${hi}s:`,...pick(lo,hi).map(m=>`  - ${nearest(m)}`)
]),
'',
'## Continuity regression markers',
`- Ridge completion=${countSummary('membraneRidgeCompletions','world.membrane_ridge.completed')}; territory openings=${countSummary('adjacentTerritoryTraversalOpenings','world.adjacent_territory.traversal_opened')}; territory entries=${countSummary('adjacentTerritoryEntries','world.adjacent_territory.entered')}`,
`- Gathering Ground completions=${countSummary('gatheringGroundEncounterCompletions','ecology.gathering_ground.encounter.completed')}; ongoing response cycles=${countSummary('gatheringGroundOngoingResponseCycles','ecology.gathering_ground.encounter.ongoing_response_cycle')}`,
'',
'## Evidence interpretation',
'- Zero redirect/attachment in telemetry means NOT PROVEN. Whether this represents an algorithm failure, an unmet precondition, or missing runtime-authority wiring requires reason-coded instrumentation and a controlled playtest.',
'- A mechanically eligible capability sample is only a diagnostic opportunity; do not count it as a successful physical seal.',
'- A single nearby local candidate during steering does not by itself prove enough valid dwell or an eligible existing relationship.',
];
console.log(lines.join('\n'));
