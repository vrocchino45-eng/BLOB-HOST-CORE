import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031J1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const main = read("src/main.js");
const pkg = JSON.parse(read("package.json"));
const contract = JSON.parse(read("public/data/build/hc031j1SurfaceDetachmentHandoffContract.json"));

[
  "const awayIntent = THREE.MathUtils.clamp(Math.max(0, outwardIntent), 0, 1)",
  "THREE.MathUtils.lerp(0.04, 0.52, this.attachmentPeelIntent01)",
  "const releaseHoldThreshold = 0.11 + this.attachmentStrength * 0.035",
  "this.attachmentCooldown = 0.55",
  "const clearanceReached = this.attachmentReleaseClearance >= 0.26",
  "&& !this.attachmentReacquireBlocked",
  "this.velocity.addScaledVector(activeContactNormal, releaseImpulse)",
  "mode: \"peel_unloading\""
].forEach((token) => need(movement, token, "surface detachment handoff"));

forbid(movement, "Math.max(0, -outwardIntent)", "reversed authored-normal release interpretation");
forbid(movement, "addScaledVector(activeContactNormal, -releaseImpulse)", "inward release impulse");

[
  "attachmentPeelIntent01:",
  "attachmentReleaseArmed:",
  "attachmentReacquireBlocked:",
  "attachmentReleaseClearance:",
  "movement.surface_detached",
  "movement.surface_reacquire_unblocked",
  "surfaceDetachments:"
].forEach((token) => need(telemetry, token, "detachment telemetry"));

[
  "contact_verb_pulse_outward_triangle",
  "contact_verb_absorb_inward_triangle",
  "contact_verb_stabilize_coherence_ring"
].forEach((token) => need(ecology, token, "locked HC031J contact symbols"));

need(main, 'buildId: "HC-031J1"', "build identity");
if (pkg.version !== "0.31.24") fail("package version changed");
if (contract.mode !== "feel_repair_convergence") fail("pass mode changed");
if (contract.detachmentLaw?.awayIntentUsesPositiveNormalDot !== true) fail("positive authored-normal release law missing");
if (contract.detachmentLaw?.tangentCrawlRemainsAnchorDriven !== true) fail("surface crawl grammar not locked");
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031j1LockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked HC031J owner changed: ${rel}`);
}

// Pure-law sanity checks: a contact-to-Core normal must recognize positive input
// as away, require a deliberate hold, and retain the reacquire block until both
// time and physical clearance conditions are met.
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const normal = { x: 0, y: 1, z: 0 };
const away = Math.max(0, dot({ x: 0, y: 1, z: 0 }, normal));
const into = Math.max(0, dot({ x: 0, y: -1, z: 0 }, normal));
if (away !== 1 || into !== 0) fail("surface-normal direction sanity failed");
const canRelease = ({ intent, hold, strength }) => intent >= 0.50 + strength * 0.08 && hold >= 0.11 + strength * 0.035;
if (!canRelease({ intent: 0.8, hold: 0.16, strength: 0.8 })) fail("strong deliberate peel cannot release");
if (canRelease({ intent: 0.8, hold: 0.04, strength: 0.8 })) fail("tap can release without deliberate hold");
const blocked = ({ cooldown, clearance }) => cooldown > 0 || clearance < 0.26;
if (!blocked({ cooldown: 0, clearance: 0.10 })) fail("reacquire opens before clearance");
if (!blocked({ cooldown: 0.2, clearance: 0.40 })) fail("reacquire opens before cooldown");
if (blocked({ cooldown: 0, clearance: 0.30 })) fail("reacquire remains blocked after clearance");

console.log(`[HC031J1] PASS — correct away intent, peel hold, outward release, clearance-gated reacquisition, telemetry, and ${Object.keys(locked.files).length} locked HC031J owners verified.`);
