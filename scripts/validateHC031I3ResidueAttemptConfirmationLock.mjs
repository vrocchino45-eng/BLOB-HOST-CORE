import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031I3] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const jump = read("src/debug/DebugAreaJumpSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031i3ResidueAttemptConfirmationLockContract.json"));

need(jump, "position: [3.20, -0.40, -0.55]", "accepted membrane-first entry");
[
  "residueA.position.set(1.58, 0.18, -2.92)",
  "residueA.scale.set(1.48, 0.30, 0.88)",
  "residueB.position.set(2.12, 0.14, -3.56)",
  "residueB.scale.set(1.34, 0.28, 0.80)",
  'profileId: "residue_weak"',
  'residueRouteAxis: "positive_x_negative_z_after_scar"',
  'residueAccessibilityPass: "raised_thickened_profile_values_unchanged"'
].forEach((token) => need(shelf, token, "residue route accessibility"));

[
  "new THREE.RingGeometry(0.34, 0.50, 6, 1, 0.28, Math.PI * 1.52)",
  'attempt.userData.residueCuePhase = "attempt"',
  'confirmed.userData.residueCuePhase = "confirmed"',
  'relationship.role === "residue_yield_field" && chord === "cohere" && !relationship.attached',
  'return "residue_coherence_attempting"',
  '"amber_open_hex_attempt"',
  '"amber_residue_proximity"',
  '"amber_hex_coherence"',
  "residueCohereAttemptCount:",
  "residueInteractionStage:"
].forEach((token) => need(ecology, token, "truthful residue visual grammar"));

[
  "hostContactResidueInteractionStage:",
  "hostContactResidueCohereAttemptActive:",
  "hostContactResidueCohereAttemptCount:",
  "hostContactResidueCohereTriggerCount:"
].forEach((token) => need(telemetry, token, "residue stage telemetry"));

forbid(ecology, "frameState.input", "direct input coupling");
forbid(ecology, "playerRoot.position.", "movement ownership");
forbid(ecology, "new THREE.Raycaster", "contact ownership");
forbid(ecology, "frameState.playerAttachment =", "attachment mutation");
forbid(ecology, "frameState.stabilizedProjection =", "projection mutation");
forbid(ecology, "frameState.verbComposition =", "verb mutation");

need(main, 'buildId: "HC-031I3"', "build identity");
if (contract.acceptedEntry?.changed !== false) fail("accepted entry was reopened");
if (contract.residueRoute?.profileValuesChanged !== false) fail("residue profile values changed");
if (contract.visualStages?.attemptGrantsMechanicalSuccess !== false) fail("attempt became mechanical success");
if (contract.visualStages?.confirmedVisualHoldGrantsMechanicalGrace !== false) fail("visual hold became mechanical grace");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031I3] PASS — residue route accessibility and attempt/confirmation grammar verified; ${Object.keys(locked.files).length} parent owners locked.`);
