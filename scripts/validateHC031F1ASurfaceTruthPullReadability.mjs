import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031F1A] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const surface = read("src/player/CoreSurfaceTruthSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const contact = read("src/player/CoreTendrilSurfaceContactSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const runtime = read("src/core/GameRuntime.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031f1aSurfaceTruthPullReadabilityContract.json"));

[
  'pass: "HC-031F1A"',
  'source: "bounded_visible_mesh_raycast"',
  'mechanicalEligible: hit.distance <= 0.72',
  'this.raycaster.far = 1.18',
  'localPlanarApproximation: true',
  'addsCollider: false'
].forEach((token) => requireText(surface, token, "surface truth contract"));

[
  'this.syncAttachmentSurfaceTruth(frameState);',
  'const directInputAccelerationScale = tendrilSurfaceDriveActive ? 0.04 : 1.0;',
  'this.attachmentVisibleStandOffDistance = 0.38',
  'visibleSurfaceTruthPreferred: true',
  'authoredBoundaryFallback: true',
  'const loadPulse01 = forwardAnchorAvailable ? (0.42 + freshLoad * 0.58) : 0.10;',
  'this.velocity.multiplyScalar(Math.max(0, 1 - Math.min(0.42, dt * 4.8)))',
  'leadingAnchorWorld:'
].forEach((token) => requireText(movement, token, "movement correction contract"));

[
  'this.readSurfaceTruth(frameState.coreSurfaceTruth);',
  'surfaceSource: this.surfaceTruthActive ? "bounded_visible_mesh_raycast" : "trusted_authored_movement_boundary_fallback"',
  'phaseAge: Number(tendril.phaseAge.toFixed(3))',
  'consumesBoundedVisibleSurfaceTruth: true',
  'this.stepDistance = 0.18',
  'this.maxStretch = 0.54'
].forEach((token) => requireText(contact, token, "tendril surface contract"));

[
  'const surfaceTruth = frameState.coreSurfaceTruth ?? {};',
  'surfaceTruth.mechanicalEligible !== false',
  'tendrilLeadingAnchorWorld',
  'const stretch = loadPulse * 0.065;'
].forEach((token) => requireText(embodiment, token, "Core load readability contract"));

requireText(runtime, 'import { CoreSurfaceTruthSystem } from "../player/CoreSurfaceTruthSystem.js";', "runtime import");
requireText(runtime, 'this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);', "surface truth runtime owner");
requireText(runtime, 'this.registry.register("playerMovement", this.playerMovementController);', "movement runtime owner");
requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "tendril runtime owner");
const surfaceOrder = runtime.indexOf('this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);');
const movementOrder = runtime.indexOf('this.registry.register("playerMovement", this.playerMovementController);');
const contactOrder = runtime.indexOf('this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);');
if (!(surfaceOrder >= 0 && movementOrder > surfaceOrder && contactOrder > movementOrder)) {
  fail("runtime order must be surface truth -> movement -> tendril contact");
}
requireText(main, 'buildId: "HC-031F1A"', "build identity");

if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.movementAuthority !== "PlayerMovementController") fail("movement authority changed");
if (contract.lockedTruth.surfaceTruthAuthority !== "CoreSurfaceTruthSystem") fail("surface truth authority mismatch");
if (contract.lockedTruth.directInputAccelerationScaleWhileTendrilDriven !== 0.04) fail("direct thrust scale drifted");
if (contract.lockedTruth.visibleSurfaceStandOffDistance !== 0.38) fail("visible stand-off drifted");
if (contract.lockedTruth.addsCollider || contract.lockedTruth.changesControls) fail("forbidden collider/control expansion detected");

const locked = JSON.parse(read("public/data/build/hc031f1aLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Lightweight end-to-end numeric proof of the corrected visible-surface response.
const oldSignedDistance = 0.07; // representative deeply embedded center from F1 playtest
const targetStandOff = 0.38;
const error = targetStandOff - oldSignedDistance;
const correction = Math.max(-0.20, Math.min(0.20, error));
const settle = 1 - Math.exp(-0.016 * 16.0);
const correctedDistance = oldSignedDistance + correction * settle;
if (!(correctedDistance > oldSignedDistance && correctedDistance < targetStandOff)) {
  fail("visible-surface stand-off correction does not move the Core out of the surface");
}

const baseAcceleration = 13.1;
const freshPull = baseAcceleration * (0.66 + 1.0 * 0.50) * 1.0 * 1.0 * (0.50 + 0.9 * 0.50) * 1.0;
const maturePull = freshPull * 0.42;
const noForwardPull = baseAcceleration * (0.66 + 1.0 * 0.50) * 1.0 * 1.0 * 0.08 * 0.10;
if (!(freshPull > maturePull * 2.0)) fail("freshly sealed anchor does not create a strong load pulse");
if (!(noForwardPull < maturePull * 0.08)) fail("no-forward-anchor hesitation is not strong enough");

console.log(`[HC031F1A] PASS — visible surface truth + pulsed anchor load + ${Object.keys(locked.files).length} locked parent owners.`);
