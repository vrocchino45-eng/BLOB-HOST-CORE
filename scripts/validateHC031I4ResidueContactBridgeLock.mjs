import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031I4] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const jump = read("src/debug/DebugAreaJumpSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031i4ResidueContactBridgeLockContract.json"));

need(jump, "position: [3.20, -0.40, -0.55]", "accepted membrane-first entry");
[
  "scarFoot.position.set(1.18, 0.12, -2.44)",
  "scarFoot.scale.set(1.05, 0.24, 0.72)",
  "residueA.position.set(1.05, 0.02, -2.72)",
  "residueA.scale.set(1.38, 0.32, 0.95)",
  "residueB.position.set(1.55, 0.02, -3.45)",
  "residueB.scale.set(1.30, 0.28, 0.88)",
  'profileId: "residue_weak"',
  'residueAccessibilityPass: "scar_foot_to_residue_overlap_bridge_profile_values_unchanged"',
  "scarToResidueOverlap: true",
  "residueToResidueOverlap: true",
  "matchingSurfaceHeight: true"
].forEach((token) => need(shelf, token, "residue contact bridge"));

[
  "new THREE.RingGeometry(0.34, 0.50, 6, 1, 0.28, Math.PI * 1.52)",
  'attempt.userData.residueCuePhase = "attempt"',
  'confirmed.userData.residueCuePhase = "confirmed"',
  'return "residue_coherence_attempting"',
  '"amber_open_hex_attempt"',
  '"amber_residue_proximity"',
  '"amber_hex_coherence"',
  "residueCohereAttemptCount:",
  "residueInteractionStage:"
].forEach((token) => need(ecology, token, "locked HC031I3 visual grammar"));

forbid(ecology, "frameState.input", "direct input coupling");
forbid(ecology, "playerRoot.position.", "movement ownership");
forbid(ecology, "new THREE.Raycaster", "contact ownership");
forbid(ecology, "frameState.playerAttachment =", "attachment mutation");
forbid(ecology, "frameState.stabilizedProjection =", "projection mutation");
forbid(ecology, "frameState.verbComposition =", "verb mutation");

need(main, 'buildId: "HC-031I4"', "build identity");
if (contract.acceptedEntry?.changed !== false) fail("accepted entry was reopened");
if (contract.contactBridge?.profileValuesChanged !== false) fail("residue profile values changed");
if (contract.contactBridge?.scarToResidueOverlap !== true) fail("scar-to-residue bridge is not contracted");
if (contract.contactBridge?.residueToResidueOverlap !== true) fail("residue-to-residue bridge is not contracted");
if (contract.visualGrammar?.changed !== false) fail("HC031I3 visual grammar was reopened");
if (contract.visualGrammar?.attemptGrantsMechanicalSuccess !== false) fail("attempt became mechanical success");
if (contract.visualGrammar?.confirmedVisualHoldGrantsMechanicalGrace !== false) fail("visual hold became mechanical grace");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031I4] PASS — residue contact bridge and locked I3 visual grammar verified; ${Object.keys(locked.files).length} H3 authority owners locked.`);
