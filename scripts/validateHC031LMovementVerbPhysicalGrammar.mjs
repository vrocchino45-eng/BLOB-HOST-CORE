import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031L] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031lMovementVerbPhysicalGrammarContract.json");
const locked = json("public/data/build/hc031lLockedHashes.json");

need(main, 'buildId: "HC-031L"', "build identity");
need(main, 'buildLabel: "Movement + Verb Physical Grammar"', "build label");
if (pkg.version !== "0.31.28") fail("package version mismatch");
if (contract.parent !== "HC-031K1") fail("parent mismatch");
if (contract.mode !== "convergence_interaction_physics") fail("mode mismatch");

// Canonical triadic relationship meaning remains in the existing composition owner.
[
  'pass: "HC-031L"',
  'stabilizeRole: "establish_or_regulate_relationship"',
  'pulseRole: "project_outward_through_relationship"',
  'absorbRole: "draw_inward_through_relationship"',
  'pulseStabilize: "cohere_then_project_as_controlled_push"',
  'absorbStabilize: "draw_while_preserving_coherence"',
  'aimChoosesTargetVerbsModifyRelationship: true',
  'surfaceAttachmentOwnedByMovementOnly: true'
].forEach((token) => need(composition, token, "canonical verb law"));

// Body-side interpretation is movement-owned and bounded.
[
  'resolveVerbPhysicalGrammar(frameState)',
  '"surface_brace"',
  '"spatial_hold"',
  '"braced_project"',
  '"controlled_project"',
  '"braced_draw"',
  '"controlled_draw"',
  '"surface_equilibrium"',
  '"push_pull_tension"',
  'const environmentalFlowMultiplier = stabilize',
  '? 0.84',
  '? 0.92',
  'const surfaceTractionMultiplier = stabilize && surfaceBound ? 1.10 : 1',
  'freeInputAccelerationMultiplier: 1',
  'speedLimitMultiplier: 1',
  'attachmentAcquireMultiplier: 1',
  'attachmentReleaseThresholdMultiplier: 1',
  'absorbAttachmentAuthority: false'
].forEach((token) => need(movement, token, "movement physical grammar"));

// Pulse can help only after the existing deliberate peel law has armed release.
[
  'const pulsePeelEligible = Boolean(pulledAway && compositionIntent.pulse)',
  'this.attachmentPulsePeelAssist = pulsePeelEligible',
  '(0.07 + pulseEnvelope * 0.05 + (stabilizedPeel ? 0.04 : 0))',
  '+ this.attachmentPulsePeelAssist'
].forEach((token) => need(movement, token, "pulse peel assist"));

// K/HF1/K1 contact and free-flight locks remain verbatim.
[
  'this.attachmentContactGapTolerance = THREE.MathUtils.lerp(0.30, 0.40, this.attachmentStrength)',
  'const releaseThreshold = 0.50 + this.attachmentStrength * 0.08',
  'const releaseHoldThreshold = 0.11 + this.attachmentStrength * 0.035',
  'this.attachmentCooldown = 0.55',
  'const clearanceReached = this.attachmentReleaseClearance >= 0.26',
  'ownerNormalAlignment < -0.25',
  'this.attachmentLandingHandoffDuration = 0.38',
  'const baseAcceleration = movementTuning.baseAcceleration ?? 13.1',
  '(movementTuning.dragBase ?? 2.15)',
  'const speedLimit = (movementTuning.speedLimit ?? 4.65)',
  '(movementTuning.boostMultiplier ?? 1.8)',
  '(movementTuning.boostSpeedMultiplier ?? 1.85)'
].forEach((token) => need(movement, token, "locked movement/contact law"));
forbid(movement, "Math.max(0, -outwardIntent)", "reversed away intent");

// Telemetry must expose the contextual grammar without becoming gameplay authority.
[
  'blob.session.telemetry.v1.32',
  'movement.verb_physical_grammar.changed',
  'verbPhysicalGrammarMode:',
  'verbPhysicalEnvironmentalFlowMultiplier:',
  'verbPhysicalSurfaceTractionMultiplier:',
  'attachmentPulsePeelAssist:',
  'verbPhysicalGrammarChanges: count("movement.verb_physical_grammar.changed")'
].forEach((token) => need(telemetry, token, "HC031L telemetry"));

// Locked neighboring owners prove this pass did not drift into target effect,
// input, camera, contact ecology, targeting, or radial-performance authority.
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked neighboring owner changed: ${rel}`);
}

// Pure-state bounds: Stabilize resists ambient flow but cannot freeze player input,
// surface brace improves traction modestly, and Pulse peel assist stays sub-launch.
const surfaceFlow = contract.movementEffects.surfaceBraceEnvironmentalFlowMultiplier;
const freeHoldFlow = contract.movementEffects.spatialHoldEnvironmentalFlowMultiplier;
const traction = contract.movementEffects.surfaceBraceTractionMultiplier;
if (!(surfaceFlow < freeHoldFlow && freeHoldFlow < 1 && surfaceFlow >= 0.78)) fail("flow brace bounds invalid");
if (!(traction > 1 && traction <= 1.10)) fail("surface traction bound invalid");
if (contract.movementEffects.freeInputAccelerationMultiplier !== 1) fail("free input acceleration changed");
if (contract.movementEffects.speedLimitMultiplier !== 1) fail("speed limit changed");
if (contract.movementEffects.attachmentAcquireMultiplier !== 1) fail("attachment acquire changed");
if (contract.movementEffects.attachmentReleaseThresholdMultiplier !== 1) fail("attachment release threshold changed");
const maxAssist = contract.movementEffects.pulsePeelAssistBase
  + contract.movementEffects.pulsePeelAssistReleaseEnvelopeGain
  + contract.movementEffects.pulsePeelAssistStabilizeGain;
if (!(maxAssist > 0 && maxAssist <= 0.16)) fail("pulse peel assist exceeds bounded range");

for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

console.log(`[HC031L] PASS — triadic verb law, body-side brace/hold, bounded peel assist, K/K1 movement locks, telemetry v1.32, and ${Object.keys(locked.files).length} neighboring owners verified.`);
