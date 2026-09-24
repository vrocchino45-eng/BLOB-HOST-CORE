import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031J] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031jContactVerbSymbolGrammarLockContract.json"));

[
  'pulse.name = "contact_verb_pulse_outward_triangle"',
  'absorb.name = "contact_verb_absorb_inward_triangle"',
  'stabilize.name = "contact_verb_stabilize_coherence_ring"',
  'new THREE.RingGeometry(0.27, 0.42, 3)',
  'new THREE.RingGeometry(0.29, 0.40, 36)',
  'const pulseActive = Boolean(intent.pulse)',
  'const absorbActive = Boolean(intent.absorb)',
  'const stabilizeActive = Boolean(intent.stabilize)',
  '"pulse_outward_triangle"',
  '"absorb_inward_triangle"',
  '"stabilize_coherence_ring"',
  '"opposed_direction_triangles"',
  '"triune_equilibrium"'
].forEach((token) => need(ecology, token, "contact verb symbol grammar"));

[
  'attachmentSurfaceId === surfaceId',
  'contactVerbSymbolTruth: "reads_HC029C_intent_and_same_surface_attachment_only"',
  'responseShellsAffectContactTruth: false'
].forEach((token) => need(ecology, token, "same-surface presentation truth"));

[
  '"amber_open_hex_attempt"',
  '"amber_residue_proximity"',
  '"amber_hex_coherence"',
  'return "residue_coherence_attempting"'
].forEach((token) => need(ecology, token, "accepted HC031I4 residue grammar"));

[
  "residueA.position.set(1.05, 0.02, -2.72)",
  "residueA.scale.set(1.38, 0.32, 0.95)",
  "residueB.position.set(1.55, 0.02, -3.45)",
  "residueB.scale.set(1.30, 0.28, 0.88)",
  'profileId: "residue_weak"'
].forEach((token) => need(shelf, token, "accepted HC031I4 bridge"));

[
  "hostContactVerbSymbol:",
  "hostContactVerbSymbolIntensity01:",
  "hostContactVerbSymbolSurfaceId:",
  "hostContactAttachmentSurfaceId:"
].forEach((token) => need(telemetry, token, "symbol telemetry"));

forbid(ecology, "frameState.input", "direct input coupling");
forbid(ecology, "playerRoot.position.", "movement ownership");
forbid(ecology, "new THREE.Raycaster", "contact ownership");
forbid(ecology, "frameState.playerAttachment =", "attachment mutation");
forbid(ecology, "frameState.stabilizedProjection =", "projection mutation");
forbid(ecology, "frameState.verbComposition =", "verb mutation");
forbid(ecology, "frameState.targeting =", "targeting mutation");

need(main, 'buildId: "HC-031J"', "build identity");
if (contract.mode !== "visual_lock_convergence") fail("pass mode changed");
if (contract.truth?.attachmentDependentCueRequiresSameSurface !== true) fail("same-surface truth not contracted");
if (contract.truth?.symbolsGrantMechanicalSuccess !== false) fail("symbol grants mechanical success");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031J] PASS — contact verb symbols, same-surface presentation truth, and ${Object.keys(locked.files).length} locked H3 owners verified.`);
