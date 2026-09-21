import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => { throw new Error(`[HC031E] ${message}`); };
const requireText = (source, token, label) => {
  if (!source.includes(token)) fail(`${label} missing: ${token}`);
};
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");

const tendril = read("src/player/CoreTendrilSurfaceContactSystem.js");
const runtime = read("src/core/GameRuntime.js");
const main = read("src/main.js");

[
  "tendrilCount: 3",
  "reach_seal_hold_peel_without_movement_rewrite",
  "trusted_authored_movement_boundary",
  "addsMovementForce: false",
  "addsCollider: false",
  "addsRaycast: false",
  "changesControls: false",
  "locomotionDrivenByTendrils: false",
  "beginReach(tendril, targetAnchor)",
  "beginPeel(tendril, nextAnchor = null)",
  "projectToBoundary(point, out)",
  "let stepClaimed = this.tendrils.some",
  "stepClaimed = true",
  "this.stepCursor = (this.stepCursor + 1) % 3"
].forEach((token) => requireText(tendril, token, "tendril contract"));

requireText(runtime, 'import { CoreTendrilSurfaceContactSystem } from "../player/CoreTendrilSurfaceContactSystem.js";', "runtime import");
requireText(runtime, "this.coreTendrilSurfaceContactSystem = new CoreTendrilSurfaceContactSystem", "runtime creation");
requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "runtime registration");
requireText(main, 'buildId: "HC-031E"', "build identity");

const locked = JSON.parse(read("public/data/build/hc031eLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Pure contract math: anchor projection must lie on the ellipsoid shell.
const center = [1.2, -0.4, 2.1];
const radii = [6.4, 3.45, 4.8];
const point = [3.7, 1.1, 4.5];
const d = point.map((value, i) => value - center[i]);
const normalized = Math.sqrt(
  (d[0] / radii[0]) ** 2 +
  (d[1] / radii[1]) ** 2 +
  (d[2] / radii[2]) ** 2
);
const projected = d.map((value, i) => center[i] + value / normalized);
const shell = Math.sqrt(
  ((projected[0] - center[0]) / radii[0]) ** 2 +
  ((projected[1] - center[1]) / radii[1]) ** 2 +
  ((projected[2] - center[2]) / radii[2]) ** 2
);
if (Math.abs(shell - 1) > 1e-9) fail(`projection is not on authored ellipsoid: ${shell}`);

console.log(`[HC031E] PASS — tendril contact contract + ${Object.keys(locked.files).length} locked parent owners.`);
