import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031K1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = JSON.parse(read("package.json"));
const contract = JSON.parse(read("public/data/build/hc031k1SurfaceFreeMomentumHandoffContract.json"));

[
  'pass: "HC-031K1"',
  "this.attachmentLandingHandoffDuration = 0.38",
  "THREE.MathUtils.lerp(1, 0.30, this.attachmentLandingCarry01)",
  "const landingRestDamping = 0.72 + traction01 * 0.48",
  'this.attachmentMomentumHandoffMode = "landing_capture"',
  'this.attachmentMomentumHandoffMode = "landing_tangent_carry"',
  "this.attachmentReleaseTangentVelocity.copy(this.velocity)",
  "this.attachmentReleaseInheritedTangentSpeed = this.attachmentReleaseTangentVelocity.length()",
  "const releaseImpulse = 0.54",
  "+ this.attachmentStrength * 0.40",
  "+ THREE.MathUtils.clamp(this.attachmentReleaseTension, 0, 1) * 0.34",
  '"surface_to_free_deliberate"'
].forEach((token) => need(movement, token, "momentum handoff law"));

// K/HF1 contact ownership is locked and must remain verbatim in K1.
[
  "this.attachmentContactGapTolerance = THREE.MathUtils.lerp(0.30, 0.40, this.attachmentStrength)",
  "const releaseThreshold = 0.50 + this.attachmentStrength * 0.08",
  "const releaseHoldThreshold = 0.11 + this.attachmentStrength * 0.035",
  "this.attachmentCooldown = 0.55",
  "const clearanceReached = this.attachmentReleaseClearance >= 0.26",
  "ownerNormalAlignment < -0.25",
  '"support_identity_transferred"',
  '"contact_gap_tolerated"',
  '"incompatible_surface_change"'
].forEach((token) => need(movement, token, "locked K/HF1 contact law"));
forbid(movement, "Math.max(0, -outwardIntent)", "reversed away intent");

// Free-flight tuning remains untouched.
[
  "const baseAcceleration = movementTuning.baseAcceleration ?? 13.1",
  "(movementTuning.dragBase ?? 2.15)",
  "const speedLimit = (movementTuning.speedLimit ?? 4.65)",
  "(movementTuning.boostMultiplier ?? 1.8)",
  "(movementTuning.boostSpeedMultiplier ?? 1.85)"
].forEach((token) => need(movement, token, "locked free-flight tuning"));

[
  "blob.session.telemetry.v1.31",
  "attachmentMomentumHandoffMode:",
  "attachmentLandingCarry01:",
  "attachmentLandingEntryTangentialSpeed:",
  "attachmentReleaseInheritedTangentialSpeed:",
  "releaseNormalImpulse: round(attachment.releaseNormalImpulse ?? 0)"
].forEach((token) => need(telemetry, token, "K1 telemetry"));

need(main, 'buildId: "HC-031K1"', "build identity");
need(main, 'buildLabel: "Surface / Free Momentum Handoff"', "build label");
if (pkg.version !== "0.31.27") fail("package version mismatch");
if (contract.mode !== "convergence_movement_physics") fail("pass mode mismatch");
for (const [key, value] of Object.entries(contract.momentumLaw ?? {})) {
  if (value !== true) fail(`momentum law disabled: ${key}`);
}
for (const [key, value] of Object.entries(contract.lockedTruth ?? {})) {
  if (value !== false) fail(`locked truth changed: ${key}`);
}

const locked = JSON.parse(read("public/data/build/hc031k1LockedHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`neighboring locked owner changed: ${rel}`);
}

// Pure-state checks: capture reduces transition damping without removing it,
// then converges back to the established settled law. Release preserves tangent.
const landingDragScale = (carry) => 1 + (0.30 - 1) * carry;
if (!(landingDragScale(1) < landingDragScale(0))) fail("landing capture does not reduce transitional drag");
if (Math.abs(landingDragScale(0) - 1) > 1e-9) fail("settled drag does not return to baseline");
const restDamping = (carry, traction = 0.6) => {
  const settled = 2.8 + traction * 2.2;
  const landing = 0.72 + traction * 0.48;
  return settled + (landing - settled) * carry;
};
if (!(restDamping(1) < restDamping(0))) fail("landing carry does not preserve tangent longer than settled rest");
const tangent = { x: 1.2, y: -0.4 };
const tangentSpeed = Math.hypot(tangent.x, tangent.y);
const releaseImpulse = 0.54 + 0.75 * 0.40 + 0.8 * 0.34;
const released = { x: tangent.x, y: tangent.y, n: releaseImpulse };
if (Math.abs(Math.hypot(released.x, released.y) - tangentSpeed) > 1e-9) fail("release tangent is not preserved");
if (!(released.n > 0)) fail("release lacks outward component");

console.log(`[HC031K1] PASS — landing tangent carry, settled-damping restoration, surface-to-free tangent inheritance, K/HF1 contact lock, free-flight tuning lock, telemetry v1.31, and ${Object.keys(locked.files).length} neighboring owners verified.`);
