import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031N1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031n1PhysicalLanguageCausalContinuityContract.json");
const locked = json("public/data/build/hc031n1LockedHashes.json");

need(main, 'buildId: "HC-031N1"', "build identity");
need(main, 'buildLabel: "Physical-Language Causal Continuity"', "build label");
if (pkg.version !== "0.31.31") fail("package version mismatch");
if (contract.parent !== "HC-031N") fail("parent mismatch");
if (contract.mode !== "convergence_validation_lens_repair") fail("mode mismatch");
if (contract.probe?.readOnly !== true || contract.probe?.gameplayAuthority !== false) fail("probe authority mismatch");

[
  'blob.session.telemetry.v1.35',
  'pass: "HC-031N1"',
  'armRule: "aim_owned_noun_plus_live_host_contact"',
  'causalRule: "post_verb_state_change_required"',
  'resolveHostAnatomyIdentity(surfaceId = "none")',
  'host_contact_shared_first_slice',
  'validation.host_anatomy.identity_changed',
  'community_retained_memory',
  'community_reciprocal_behavior',
  'attention_owner_lost_before_verb',
  'observe_locked_language_post_verb_causality_no_gameplay_feedback'
].forEach((token) => need(telemetry, token, "N1 telemetry repair"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

let clockMs = 0;
const frameState = {
  buildId: "HC-031N1",
  buildLabel: "Physical-Language Causal Continuity",
  runtimeSeconds: 0,
  frame: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: { pulseEventId: 0 },
  targeting: {
    pass: "HC-031M",
    candidateId: "test_noun",
    attentionTargetId: "test_noun",
    attentionPhase: "held",
    relationshipTargetId: "none",
    aimOwnershipPolicy: "aim_selects_attention_verbs_modify_relationship"
  },
  playerAttachment: {
    active: false,
    ownerSurfaceId: "none",
    authoredSuctionSupportSurfaceId: "none",
    surfaceTangentSpeed: 0,
    tendrilLocomotionActive: false,
    detachReason: "none",
    releaseSurfaceId: "none",
    authority: "authored_suction_support"
  },
  verbComposition: { chord: "idle" },
  verbPhysicalGrammar: { mode: "idle", relationshipSource: "none" },
  reactiveStateGrammar: { stateChangeCount: 0 },
  pulse: { focusedObject: "none", affectedObjects: [] },
  bondState: { objectId: "none", active: false, absorbProgress: 0 },
  verbPhysicalization: { stabilizeTargetId: "none", stabilizeProgress: 0 },
  hostContactEcologyContinuation: {
    active: true,
    activeSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_01",
    responseMode: "membrane_carry",
    visualGrammar: "inactive",
    contactVerbSymbol: "inactive",
    contactVerbSymbolIntensity01: 0,
    residueInteractionStage: "none",
    residueCohereTriggerCount: 0,
    localImprint: { membraneCarry01: 0.2, scarBrace01: 0, residueYield01: 0, residueCohesion01: 0 }
  },
  stabilizedProjection: { active: false, mode: "inactive", modeChangeCount: 0, surfaceBraced: false, braceQuality01: 0 },
  entityRelationshipGrammar: { active: false, changeCount: 0, chord: "idle", primary: { entityId: "none" } },
  entityReciprocalMemory: { active: false, commitCount: 0, primary: { entityId: "none" } },
  entityReciprocalBehavior: { active: false, changeCount: 0, primary: { entityId: "none" } },
  entityLocalMatterCoupling: { active: false, changeCount: 0, primary: { entityId: "none" } }
};

const telemetrySystem = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => clockMs });
const step = (dt = 0.05) => {
  clockMs += dt * 1000;
  frameState.runtimeSeconds += dt;
  frameState.frame += 1;
  telemetrySystem.observePhysicalLanguageValidation(frameState, clockMs / 1000);
};

// Aim ownership by itself must not start the physical chain.
step();
if (telemetrySystem.physicalLanguageValidation.activeChain) fail("free-space owner incorrectly armed a chain");

// Contact arms the chain and immediately establishes contact stage.
frameState.playerAttachment.active = true;
frameState.playerAttachment.ownerSurfaceId = "HOST_CONTACT_CONTINUATION_MEMBRANE_01";
frameState.playerAttachment.surfaceTangentSpeed = 0.24;
frameState.playerAttachment.tendrilLocomotionActive = true;
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "contact") fail("contact did not arm chain at contact stage");

// A micro support transfer within the same authored anatomy unit must resolve as
// same anatomy / same Host instrument instead of semantic target churn.
frameState.playerAttachment.ownerSurfaceId = "HOST_CONTACT_CONTINUATION_MEMBRANE_02";
frameState.hostContactEcologyContinuation.activeSurfaceId = "HOST_CONTACT_CONTINUATION_MEMBRANE_02";
step();
const identityEvent = telemetrySystem.events.find((event) => event.type === "validation.host_anatomy.identity_changed");
if (!identityEvent?.percept?.sameAnatomyUnit || !identityEvent?.percept?.sameHostInstrument) fail("stable Host anatomy identity did not survive micro support transfer");

step();
step();
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "surface_travel") fail("surface travel was not confirmed");

// Apply a verb while leaving Host/community state unchanged. N1 must stop at
// verb_applied instead of counting pre-existing contact state as a world answer.
frameState.targeting.relationshipTargetId = "test_noun";
frameState.verbComposition.chord = "cohere_project";
frameState.verbPhysicalGrammar = { mode: "braced_project", relationshipSource: "surface_plus_retained_target" };
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "verb_applied") fail("pre-existing Host state incorrectly counted as world answer");

// A real post-verb Host/community change can now advance the chain.
frameState.hostContactEcologyContinuation.visualGrammar = "coherent_outward_triangle";
frameState.hostContactEcologyContinuation.contactVerbSymbol = "pulse_down_triangle";
frameState.hostContactEcologyContinuation.contactVerbSymbolIntensity01 = 0.72;
frameState.hostContactEcologyContinuation.localImprint.membraneCarry01 = 0.28;
frameState.stabilizedProjection = { active: true, mode: "surface_braced", modeChangeCount: 1, surfaceBraced: true, braceQuality01: 0.62 };
frameState.entityRelationshipGrammar = { active: true, changeCount: 1, chord: "cohere_project", primary: { entityId: "tender_001", interpretation: "steady_signal" } };
frameState.entityReciprocalMemory = { active: true, commitCount: 1, primary: { entityId: "tender_001", mode: "steady_signal_retained" } };
frameState.entityReciprocalBehavior = { active: true, changeCount: 1, primary: { entityId: "tender_001", mode: "settle_nearby" } };
frameState.entityLocalMatterCoupling = { active: true, changeCount: 1, primary: { entityId: "tender_001", mode: "coherent_settle", causalStage: "forming" } };
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "world_answer") fail("post-verb world answer was not observed");
const worldAnswer = telemetrySystem.events.find((event) => event.type === "validation.physical_language.world_answer");
if (!worldAnswer?.percept?.answerCategories?.includes("host_anatomy")) fail("Host anatomy post-verb answer missing");
if (!worldAnswer?.percept?.answerCategories?.includes("community_ecology")) fail("community post-verb answer missing");

// Looking away after the committed verb/world answer must preserve the chain.
frameState.targeting.attentionTargetId = "none";
frameState.targeting.attentionPhase = "released";
frameState.targeting.relationshipTargetId = "none";
frameState.verbComposition.chord = "idle";
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "world_answer") fail("attention release erased causal history after world answer");

// Deliberate peel advances the same chain.
frameState.playerAttachment.active = false;
frameState.playerAttachment.detachReason = "deliberate_away_input";
frameState.playerAttachment.releaseSurfaceId = "HOST_CONTACT_CONTINUATION_MEMBRANE_02";
frameState.playerAttachment.releaseInheritedTangentialSpeed = 0.41;
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "deliberate_release") fail("deliberate release was not observed after attention release");

// Re-enter elsewhere on the same Host instrument.
frameState.playerAttachment.active = true;
frameState.playerAttachment.ownerSurfaceId = "HOST_CONTACT_CONTINUATION_RESIDUE_01";
frameState.playerAttachment.detachReason = "none";
frameState.playerAttachment.momentumHandoffMode = "landing_tangent_carry";
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "reacquired_contact") fail("contact reacquisition was not observed");

// A new owned noun / verb relationship after re-entry completes the validation chain.
frameState.targeting.candidateId = "test_noun_2";
frameState.targeting.attentionTargetId = "test_noun_2";
frameState.targeting.attentionPhase = "held";
frameState.targeting.relationshipTargetId = "test_noun_2";
frameState.verbComposition.chord = "cohere_draw";
frameState.verbPhysicalGrammar = { mode: "braced_draw", relationshipSource: "surface_plus_retained_target" };
step();
if (telemetrySystem.physicalLanguageValidation.activeChain !== null) fail("completed chain remained active");
if (telemetrySystem.physicalLanguageValidation.completedCount !== 1) fail("completed chain count mismatch");
if (!telemetrySystem.events.some((event) => event.type === "validation.physical_language.chain_completed")) fail("completion event missing");
if (telemetrySystem.buildSummary().physicalLanguageBestStageIndex !== 9) fail("summary did not preserve full-chain stage");
if (telemetrySystem.exportSession().session.implementationPass !== "HC-031N1") fail("stale implementationPass identity remains");

console.log(`[HC031N1] PASS — contact-armed chain, post-verb causal answer, attention-release continuity, deliberate peel/re-entry completion, stable Host anatomy identity, telemetry v1.35, and ${Object.keys(locked.files).length} gameplay owners verified unchanged.`);
