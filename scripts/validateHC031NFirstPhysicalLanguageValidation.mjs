import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031N] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031nFirstPhysicalLanguageValidationContract.json");
const locked = json("public/data/build/hc031nLockedHashes.json");

need(main, 'buildId: "HC-031N"', "build identity");
need(main, 'buildLabel: "First Physical-Language Validation"', "build label");
if (pkg.version !== "0.31.30") fail("package version mismatch");
if (contract.parent !== "HC-031M") fail("parent mismatch");
if (contract.mode !== "convergence_full_chain_validation") fail("mode mismatch");
if (contract.probe?.readOnly !== true || contract.probe?.gameplayAuthority !== false) fail("probe authority mismatch");

[
  'blob.session.telemetry.v1.34',
  'pass: "HC-031N"',
  'observePhysicalLanguageValidation(frameState, wallNow)',
  'validation.physical_language.chain_started',
  'validation.physical_language.stage_reached',
  'validation.physical_language.world_answer',
  'validation.physical_language.chain_completed',
  'validation.physical_language.chain_abandoned',
  '"host_anatomy_response"',
  '"surface_amplified_projection"',
  '"community_interpretation"',
  '"target_focused_pulse"',
  'physicalLanguageValidationStage',
  'physicalLanguageChainsCompleted',
  'physicalLanguageHostAnatomyAnswers',
  'physicalLanguageCommunityAnswers',
  'physicalLanguageChosenTargetAnswers',
  'rule: "observe_locked_language_only_no_gameplay_feedback"'
].forEach((token) => need(telemetry, token, "validation probe"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

// Runtime proof: drive only the read-only observer through the entire chain.
let clockMs = 0;
const frameState = {
  buildId: "HC-031N",
  buildLabel: "First Physical-Language Validation",
  runtimeSeconds: 0,
  frame: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
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
    releaseSurfaceId: "none"
  },
  verbComposition: { chord: "idle" },
  verbPhysicalGrammar: { mode: "idle", relationshipSource: "none" },
  reactiveStateGrammar: {},
  pulse: {},
  bondState: {},
  verbPhysicalization: {},
  hostContactEcologyContinuation: {},
  stabilizedProjection: {},
  entityRelationshipGrammar: {},
  entityLocalMatterCoupling: {}
};
const telemetrySystem = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => clockMs });
const probe = () => telemetrySystem.observePhysicalLanguageValidation(frameState, clockMs / 1000);
const step = (dt = 0.05) => {
  clockMs += dt * 1000;
  frameState.runtimeSeconds += dt;
  frameState.frame += 1;
  probe();
};

step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "owned") fail("chain did not start at owned");

frameState.playerAttachment.active = true;
frameState.playerAttachment.ownerSurfaceId = "surface_a";
frameState.playerAttachment.surfaceTangentSpeed = 0.24;
frameState.playerAttachment.tendrilLocomotionActive = true;
step();
step();
step();
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "surface_travel") fail("surface travel was not confirmed");

frameState.targeting.relationshipTargetId = "test_noun";
frameState.verbComposition.chord = "cohere_project";
frameState.verbPhysicalGrammar = { mode: "braced_project", relationshipSource: "surface_plus_retained_target" };
frameState.hostContactEcologyContinuation = {
  active: true,
  responseMode: "membrane_carry",
  contactVerbSymbolIntensity01: 0.42,
  stabilizedProjectionActive: true
};
frameState.stabilizedProjection = { active: true, surfaceBraced: true };
frameState.entityRelationshipGrammar = {
  active: true,
  chord: "cohere_project",
  primary: { entityId: "tender_001" }
};
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "world_answer") fail("world answer was not observed");
const worldAnswer = telemetrySystem.events.find((event) => event.type === "validation.physical_language.world_answer");
if (!worldAnswer?.percept?.answerCategories?.includes("host_anatomy")) fail("Host anatomy answer missing");
if (!worldAnswer?.percept?.answerCategories?.includes("community_ecology")) fail("community ecology answer missing");

frameState.verbComposition.chord = "idle";
frameState.targeting.relationshipTargetId = "none";
frameState.playerAttachment.active = false;
frameState.playerAttachment.detachReason = "deliberate_away_input";
frameState.playerAttachment.releaseSurfaceId = "surface_a";
frameState.playerAttachment.releaseInheritedTangentialSpeed = 0.41;
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "deliberate_release") fail("deliberate release was not observed");

frameState.playerAttachment.active = true;
frameState.playerAttachment.ownerSurfaceId = "surface_b";
frameState.playerAttachment.detachReason = "none";
frameState.playerAttachment.momentumHandoffMode = "landing_tangent_carry";
step();
if (telemetrySystem.physicalLanguageValidation.activeChain?.stage !== "reacquired_contact") fail("contact reacquisition was not observed");

frameState.targeting.relationshipTargetId = "test_noun";
frameState.verbComposition.chord = "cohere_draw";
frameState.verbPhysicalGrammar = { mode: "braced_draw", relationshipSource: "surface_plus_retained_target" };
step();
if (telemetrySystem.physicalLanguageValidation.activeChain !== null) fail("completed chain remained active");
if (telemetrySystem.physicalLanguageValidation.completedCount !== 1) fail("completed chain count mismatch");
if (!telemetrySystem.events.some((event) => event.type === "validation.physical_language.chain_completed")) fail("completion event missing");
if (telemetrySystem.buildSummary().physicalLanguageBestStageIndex !== 9) fail("summary did not preserve full-chain stage");

console.log(`[HC031N] PASS — read-only noticed→owned→contact→travel→verb→world-answer→deliberate-release→reacquire→reinteract chain, telemetry v1.34, Host anatomy/community answer classification, and ${Object.keys(locked.files).length} gameplay owners verified unchanged.`);
