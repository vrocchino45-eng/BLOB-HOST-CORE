import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031I1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const jump = read("src/debug/DebugAreaJumpSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031i1ContactEcologyEntryVisualLockContract.json"));

need(jump, "position: [4.0, -0.40, -0.55]", "contact-range Shift+1 landing");
need(jump, 'entryLockPass: "HC-031I1"', "entry lock identity");
[
  "membraneA.position.set(-0.20, 0.12, -1.36)",
  "membraneB.position.set(0.04, 0.25, -2.18)",
  "scarButtress.position.set(0.94, 0.76, -2.54)",
  "residueA.position.set(-0.78, 0.10, -2.84)",
  "residueB.position.set(-1.18, 0.04, -3.42)",
  'entryForwardAxis: "negative_z_camera_forward"'
].forEach((token) => need(shelf, token, "camera-forward ecology sequence"));

[
  "new THREE.RingGeometry(0.34, 0.50",
  "new THREE.TorusGeometry(0.39, 0.035",
  '"teal_pressure_wave"',
  '"orange_brace_bands"',
  '"amber_hex_coherence"',
  "surfaceContactDisabled = true",
  "targetingSuppressed = true",
  "visualCue01:"
].forEach((token) => need(ecology, token, "visual proof grammar"));

forbid(ecology, "playerRoot.position.", "presentation movement ownership");
forbid(ecology, "frameState.input", "new input coupling");
forbid(ecology, "new THREE.Raycaster", "new contact raycast");

need(telemetry, "hostContactVisualCue01:", "visual strength telemetry");
need(telemetry, "hostContactVisualGrammar:", "visual grammar telemetry");
need(main, 'buildId: "HC-031I1"', "build identity");

if (contract.entry?.withinContactRange !== true) fail("contract does not require contact-range entry");
if (contract.visualGrammar?.telemetryOnlyAcceptance !== false) fail("telemetry-only acceptance is forbidden");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031I1] PASS — contact-range entry, camera-forward ecology sequence, and visible material grammar verified; ${Object.keys(locked.files).length} parent owners locked.`);
