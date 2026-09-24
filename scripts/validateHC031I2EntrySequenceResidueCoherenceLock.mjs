import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031I2] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const jump = read("src/debug/DebugAreaJumpSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031i2EntrySequenceResidueCoherenceLockContract.json"));

need(jump, "position: [3.20, -0.40, -0.55]", "membrane-first Shift+1 landing");
need(jump, 'entryLockPass: "HC-031I2"', "entry identity");
need(shelf, 'entryForwardAxis: "observed_positive_x_negative_z_camera_forward"', "observed forward-axis contract");
need(shelf, "testEntryPosition: { x: 3.20, y: -0.40, z: -0.55 }", "published test entry");

[
  "this.residueCohereVisualHoldDuration = 1.2",
  'chord === "cohere" && relationship.attached',
  "this.residueCohereSurfaceId = relationship.surfaceId",
  'return "residue_coherence_afterglow"',
  '"amber_hex_coherence"',
  "residueCohereVisualHold01:",
  "residueCohereTriggerCount:"
].forEach((token) => need(ecology, token, "bounded residue coherence presentation"));

[
  "hostContactVisualCueSurfaceId:",
  "hostContactResidueCohereVisualHold01:",
  "hostContactResidueCohereTriggerCount:"
].forEach((token) => need(telemetry, token, "HC031I2 telemetry proof"));

forbid(ecology, "playerRoot.position.", "presentation movement ownership");
forbid(ecology, "frameState.input", "new input coupling");
forbid(ecology, "new THREE.Raycaster", "new contact raycast");
forbid(ecology, "frameState.playerAttachment =", "attachment mutation");
forbid(ecology, "frameState.stabilizedProjection =", "projection mutation");
forbid(ecology, "frameState.verbComposition =", "verb mutation");

need(main, 'buildId: "HC-031I2"', "build identity");
if (contract.entry?.firstRequiredRole !== "living_membrane_path") fail("membrane-first contract missing");
if (contract.residueCoherencePresentation?.holdSeconds !== 1.2) fail("visual hold is not 1.2 seconds");
if (contract.residueCoherencePresentation?.mechanicalGrace !== false) fail("visual hold became mechanical grace");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031I2] PASS — membrane-first entry and bounded residue coherence presentation verified; ${Object.keys(locked.files).length} parent owners locked.`);
