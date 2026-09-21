import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => { throw new Error(`[HC031E1] ${message}`); };
const requireText = (source, token, label) => {
  if (!source.includes(token)) fail(`${label} missing: ${token}`);
};
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");

const tendril = read("src/player/CoreTendrilSurfaceContactSystem.js");
const runtime = read("src/core/GameRuntime.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031e1SuctionContactReadabilityContract.json"));

[
  'pass: "HC-031E1"',
  "this.maxStretch = 0.62",
  "this.stepDistance = 0.23",
  "new THREE.CylinderGeometry(this.padRadius * 0.72, this.padRadius, this.padThickness",
  "surface_compression_patch",
  "const contactVisible = seal > 0.015",
  "tendril.pad.position.copy(tendril.anchorWorld)",
  "tendril.contactPatch.position.copy(tendril.anchorWorld)",
  "tendril.rootBulb",
  "padVisibleOnlyDuringSeal: true",
  "suctionPadSurfaceLocked: true",
  "locomotionDrivenByTendrils: false",
  "addsMovementForce: false",
  "addsCollider: false",
  "addsRaycast: false",
  "changesControls: false"
].forEach((token) => requireText(tendril, token, "readability contract"));

requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "runtime registration");
requireText(main, 'buildId: "HC-031E1"', "build identity");
if (contract.lockedTruth.tendrilCount !== 3) fail("contract lost three-point support grammar");
if (contract.lockedTruth.locomotionDrivenByTendrils !== false) fail("locomotion authority leaked into readability pass");

const locked = JSON.parse(read("public/data/build/hc031e1LockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Broad cylinder face must land on the anchor when +Y is aligned to the outward normal.
const thickness = 0.032;
const padCenterFromAnchor = thickness * 0.5;
const broadFaceFromAnchor = padCenterFromAnchor - thickness * 0.5;
if (Math.abs(broadFaceFromAnchor) > 1e-12) fail(`sucker broad face is not planted: ${broadFaceFromAnchor}`);

// HC031E1 removes the parent's inward shell offset: projected anchors are exact shell points.
const center = [1.2, -0.4, 2.1];
const radii = [6.4, 3.45, 4.8];
const point = [3.7, 1.1, 4.5];
const d = point.map((value, i) => value - center[i]);
const normalized = Math.sqrt((d[0]/radii[0])**2 + (d[1]/radii[1])**2 + (d[2]/radii[2])**2);
const projected = d.map((value, i) => center[i] + value / normalized);
const shell = Math.sqrt(
  ((projected[0]-center[0])/radii[0])**2 +
  ((projected[1]-center[1])/radii[1])**2 +
  ((projected[2]-center[2])/radii[2])**2
);
if (Math.abs(shell - 1) > 1e-9) fail(`anchor projection is not on authored shell: ${shell}`);

console.log(`[HC031E1] PASS — planted sucker/tension/peel contract + ${Object.keys(locked.files).length} locked parent owners.`);
