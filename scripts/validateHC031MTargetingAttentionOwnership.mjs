import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as THREE from "three";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031M] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const targeting = read("src/targeting/TargetingSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031mTargetingAttentionOwnershipContract.json");
const locked = json("public/data/build/hc031mLockedHashes.json");

need(main, 'buildId: "HC-031M"', "build identity");
need(main, 'buildLabel: "Targeting / Attention Ownership"', "build label");
if (pkg.version !== "0.31.29") fail("package version mismatch");
if (contract.parent !== "HC-031L") fail("parent mismatch");
if (contract.mode !== "convergence_targeting_attention") fail("mode mismatch");

// Aim owns the noun through an explicit attention state machine.
[
  'pass: "HC-031M"',
  'this.candidateAimThreshold = 0.42',
  'this.attentionEngageAimThreshold = 0.68',
  'this.attentionHoldAimThreshold = 0.24',
  'this.attentionEngageDwellSeconds = 0.10',
  'this.attentionHoldPromoteSeconds = 0.12',
  'this.attentionReleaseGraceSeconds = 0.30',
  'this.attentionReleasePhaseSeconds = 0.12',
  'this.updateAttention(safeDt, frameState, intent)',
  'this.setAttentionTarget(this.candidate, "aim_engaged")',
  'this.attentionPhase = "held"',
  'this.releaseAttention("aim_redirected")',
  'this.releaseAttention("aim_left_hold_cone")',
  'candidateAim - currentAim >= 0.22',
  'aimOwnershipPolicy: "aim_selects_attention_verbs_modify_relationship"',
  'verbRetargetingAllowed: false',
  'handoffPolicy: "release_then_reacquire_by_aim"'
].forEach((token) => need(targeting, token, "attention ownership law"));

// Context may suggest, but camera alignment dominates ownership. Verbs may not
// bias candidate selection or silently hand the relationship to another noun.
[
  'const aimOwnershipScore = aimDot * 12 + boundedPriorityInfluence + boundedDistanceInfluence',
  'Math.max(-2, Math.min(6, priority)) * 0.35',
  'Math.max(0, Math.min(6.8, distanceScore)) * 0.18',
  'snapshot.aimOwnershipScore > best.aimOwnershipScore',
  'this.setRelationshipTarget(this.attentionTarget, "verb_modified_aim_owned_target")'
].forEach((token) => need(targeting, token, "aim-dominant selection"));
forbid(targeting, 'this.frameState.input?.absorbHeld && isAbsorbable', "verb candidate bias");
forbid(targeting, 'this.setRelationshipTarget(this.candidate', "verb-driven target acquisition");
forbid(targeting, 'intentional_camera_handoff', "mid-verb camera handoff");

// The persistent generic lock ring remains retired; aim engagement gets only a
// brief confirmation and relationship glyphs stay verb-scoped.
[
  'attention_engagement_confirmation_hc031m',
  'frameState.targeting?.attentionPhase === "engaged"',
  'this.selectedHalo.material.opacity = 0.14 * (1 - engage01 * 0.45)',
  'frameState.targeting?.relationshipActive && this.relationshipTarget'
].forEach((token) => need(targeting, token, "targeting presentation"));

// Telemetry must distinguish aim ownership from verb relationship ownership.
[
  'blob.session.telemetry.v1.33',
  'attention.owner.changed',
  'attention.phase.changed',
  'attentionOwnerChanges: count("attention.owner.changed")',
  'attentionPhaseChanges: count("attention.phase.changed")',
  'relationshipTargetChanges: count("attention.target.changed")',
  'attentionTarget: this.aliasSource(frameState.targeting?.attentionTargetId ?? "none")',
  'attentionPhase: frameState.targeting?.attentionPhase ?? "none"',
  'relationshipTarget: this.aliasSource(frameState.targeting?.relationshipTargetId ?? "none")',
  'this.frameState.targeting?.pass ?? this.frameState.buildId'
].forEach((token) => need(telemetry, token, "HC031M telemetry"));

// K/K1/L physical laws and all neighboring effect owners remain bit-identical.
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked neighboring owner changed: ${rel}`);
}
need(movement, 'pass: "HC-031L"', "locked HC031L movement grammar");
need(composition, 'pass: "HC-031L"', "locked HC031L verb grammar");
need(composition, 'aimChoosesTargetVerbsModifyRelationship: true', "locked HC031L canonical rule");

for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

// Runtime proof: the centered noun beats an off-axis absorbable noun; a verb
// modifies the aim-owned noun without retargeting; deliberate aim redirect then
// walks through RELEASED -> CANDIDATE -> ENGAGED -> HELD onto the new noun.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -2);
camera.updateMatrixWorld(true);
const playerRoot = new THREE.Object3D();
playerRoot.userData = { objectId: "test_player" };
scene.add(playerRoot);
const makeObject = (id, x, z, absorbable = false) => {
  const rootObject = new THREE.Object3D();
  rootObject.position.set(x, 0, z);
  rootObject.userData = { recipeId: id, absorbed: false };
  scene.add(rootObject);
  return {
    recipe: {
      id,
      chemistry: { domains: [], bondTypes: [] },
      behavior: absorbable ? { onAbsorb: "test" } : {}
    },
    root: rootObject,
    cellId: "CELL_MEMBRANE_NURSERY_001",
    absorbed: false
  };
};
const centered = makeObject("centered_noun", 0, -2, false);
const offAxisAbsorbable = makeObject("off_axis_absorbable", 2, -2, true);
const frameState = {
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  firstSliceRuntimeMount: { mountSequence: 1 },
  targetFocus: { provider: "validator" },
  input: {},
  runtimeSeconds: 0,
  selectedObject: null,
  controllerOnboarding: {
    tuning: {
      targeting: {
        scoreDistanceRange: 6.8,
        lockDistance: 5.8,
        absorbStateDistance: 2.65,
        assistStateDistance: 5.2,
        preferredTargetBoost: 4.15
      }
    }
  }
};
const system = new TargetingSystem({
  scene,
  camera,
  playerRoot,
  chemObjectSystem: { objects: [centered, offAxisAbsorbable] },
  frameState
});
system.init();
const step = (count, dt = 0.05) => {
  for (let i = 0; i < count; i += 1) {
    frameState.runtimeSeconds += dt;
    system.update(dt, frameState);
  }
};

step(6);
if (frameState.targeting.attentionTargetId !== "centered_noun") fail("centered aim did not own noun");
if (frameState.targeting.attentionPhase !== "held") fail("attention did not progress to HELD");
if (frameState.targeting.relationshipTargetId !== "none") fail("relationship activated without a verb");

frameState.input.absorbHeld = true;
step(1);
if (frameState.targeting.relationshipTargetId !== "centered_noun") fail("verb did not modify held attention noun");

camera.lookAt(2, 0, -2);
camera.updateMatrixWorld(true);
step(4);
if (frameState.targeting.candidateId !== "off_axis_absorbable") fail("redirect aim did not update candidate");
if (frameState.targeting.attentionTargetId !== "centered_noun") fail("active verb allowed attention theft");
if (frameState.targeting.relationshipTargetId !== "centered_noun") fail("active verb relationship retargeted");

frameState.input.absorbHeld = false;
step(1);
if (frameState.targeting.attentionPhase !== "released") fail("aim redirect did not enter RELEASED");
if (frameState.targeting.relationshipTargetId !== "none") fail("released attention left stale verb relationship");
step(8);
if (frameState.targeting.attentionTargetId !== "off_axis_absorbable") fail("redirected noun was not reacquired by aim");
if (frameState.targeting.attentionPhase !== "held") fail("redirected noun did not progress to HELD");

console.log(`[HC031M] PASS — aim-owned AVAILABLE/CANDIDATE/ENGAGED/HELD/RELEASED targeting, verb-safe relationship ownership, telemetry v1.33, runtime redirect proof, and ${Object.keys(locked.files).length} neighboring owners verified.`);
