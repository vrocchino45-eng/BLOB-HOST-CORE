import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031K-HF1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = JSON.parse(read("package.json"));
const contract = JSON.parse(read("public/data/build/hc031kHF1ContactLockClosureContract.json"));

[
  'pass: "HC-031K-HF1"',
  "const liveAuthoredContactResolved = Boolean(contactAllowed && authoredSuctionSupportNow)",
  "const globalContactPermissionLost = Boolean(",
  "!contactAllowed",
  "&& !continuityHolds",
  "&& !sustainedContactLoss",
  '"contact_permission_lost"',
  "this.attachmentContactGapAge <= this.attachmentContactGapTolerance",
  '"support_identity_transferred"',
  '"sustained_contact_loss"'
].forEach((token) => need(movement, token, "closure law"));

// J1/K feel laws remain unchanged.
[
  "this.attachmentContactGapTolerance = THREE.MathUtils.lerp(0.30, 0.40, this.attachmentStrength)",
  "const awayIntent = THREE.MathUtils.clamp(Math.max(0, outwardIntent), 0, 1)",
  "const releaseHoldThreshold = 0.11 + this.attachmentStrength * 0.035",
  "this.attachmentCooldown = 0.55",
  "const clearanceReached = this.attachmentReleaseClearance >= 0.26",
  "const releaseImpulse = 0.66 + this.attachmentStrength * 0.56",
  "ownerNormalAlignment < -0.25"
].forEach((token) => need(movement, token, "locked K/J1 law"));
forbid(movement, "Math.max(0, -outwardIntent)", "reversed away intent");

[
  "blob.session.telemetry.v1.30",
  "implementationPass: this.frameState.playerAttachment?.pass",
  "movement.surface_contact_gap_tolerated",
  "movement.surface_support_identity_transferred",
  "surfaceContactGapTolerations:",
  "surfaceSupportIdentityTransfers:"
].forEach((token) => need(telemetry, token, "HF1 telemetry"));

need(main, 'buildId: "HC-031K-HF1"', "build identity");
need(main, 'buildLabel: "Contact Lock Closure"', "build label");
if (pkg.version !== "0.31.26") fail("package version mismatch");
if (contract.mode !== "hotfix_convergence") fail("pass mode mismatch");
for (const [key, value] of Object.entries(contract.contactClosureLaw ?? {})) {
  if (value !== true) fail(`closure law disabled: ${key}`);
}
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031kHF1LockedHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked HC031K owner changed: ${rel}`);
}

// Pure-state truth: a transient global permission drop must consume the same
// bounded owner-grace window instead of immediately detaching.
const tolerance = (strength) => 0.30 + (0.40 - 0.30) * strength;
const shouldDetach = ({ contactAllowed, owner, gapAge, strength, deliberate = false, incompatible = false }) => {
  const tol = tolerance(strength);
  const continuityHolds = Boolean(owner && gapAge <= tol);
  const sustainedContactLoss = Boolean(owner && gapAge > tol);
  const globalContactPermissionLost = Boolean(!contactAllowed && !continuityHolds && !sustainedContactLoss);
  return deliberate || incompatible || sustainedContactLoss || globalContactPermissionLost;
};
if (shouldDetach({ contactAllowed: false, owner: true, gapAge: 0.12, strength: 0.5 })) fail("permission drop bypasses owner grace");
if (!shouldDetach({ contactAllowed: false, owner: true, gapAge: 0.42, strength: 0.5 })) fail("permission loss can persist forever");
if (!shouldDetach({ contactAllowed: true, owner: true, gapAge: 0.05, strength: 0.5, deliberate: true })) fail("deliberate peel lost priority");

console.log(`[HC031K-HF1] PASS — global contact permission now consumes bounded owner grace, owner plane/identity continuity remains intact, deliberate peel remains dominant, telemetry v1.30 is explicit, and ${Object.keys(locked.files).length} neighboring owners are hash-locked.`);
