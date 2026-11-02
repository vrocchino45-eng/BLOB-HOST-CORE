import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  AUTHORED_SURFACE_BRUSH_DISTANCE,
  canBeginAuthoredSurfaceBrush
} from "../src/player/CoreAuthoredContactBootstrap.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const near = {
  valid: true,
  mechanicalEligible: true,
  surfaceId: "SILT_ENTRY_SEDIMENT_SHELF_D11B",
  distance: 0.3394,
  normal: { x: 0.008, y: 0.999, z: -0.027 }
};
const truth = (parts = {}) => ({ ...near, ...parts });
const pass = (t, args = {}) => canBeginAuthoredSurfaceBrush({ surfaceTruth: t, ...args });

assert.equal(AUTHORED_SURFACE_BRUSH_DISTANCE, 0.46);
assert.equal(pass(truth()), true, "D11C controlled Silt pose should permit a first brush");
assert.equal(pass(truth({ distance: 0.455 })), true, "near approach can brush");
assert.equal(pass(truth({ distance: 0.55 })), false, "distant surfaces cannot bootstrap");
assert.equal(pass(truth({ distance: 1.05 })), false, "raycast candidate is not enough");
assert.equal(pass(truth({ distance: -0.1 })), false);
assert.equal(pass(truth({ distance: NaN })), false);
assert.equal(pass(truth({ valid: false })), false);
assert.equal(pass(truth({ mechanicalEligible: false })), false);
assert.equal(pass(truth({ mechanicalEligible: undefined })), false);
assert.equal(pass(truth({ surfaceId: "none" })), false);
assert.equal(pass(truth({ normal: { x: NaN, y: 1, z: 0 } })), false);
assert.equal(pass(truth({ normal: { x: 0, y: 0, z: 0 } })), false);
assert.equal(pass(truth(), { coreWorkActive: true }), false);
assert.equal(pass(truth(), { physicalAttachment: { active: true } }), false);
assert.equal(pass(truth(), { physicalAttachment: { state: "releasing" } }), false);
assert.equal(pass(truth(), { physicalAttachment: { reacquireBlocked: true } }), false);
assert.equal(pass(truth(), { physicalAttachment: { releaseCooldown: 0.2 } }), false);
assert.equal(pass(truth(), { kinematics: { desiredMoveVector: { x: 0, y: 1, z: 0 } } }), false, "intent away cannot seal");
assert.equal(pass(truth(), { kinematics: { desiredMoveVector: { x: 1, y: 0, z: 0 } } }), true, "tangential movement may brush");
assert.equal(pass(truth(), { kinematics: { desiredMoveVector: { x: 0, y: -1, z: 0 } } }), true, "approach may brush");
assert.equal(pass(truth(), { kinematics: { velocity: { x: 0, y: 0.9, z: 0 } } }), false, "fast separating motion cannot bootstrap");
assert.equal(pass(truth(), { kinematics: { velocity: { x: 0, y: 0.1, z: 0 } } }), true);

const embodiment = readFileSync(resolve(root,"src/player/CoreEmbodimentSystem.js"), "utf8");
assert.match(embodiment, /import \{ canBeginAuthoredSurfaceBrush \} from "\.\/CoreAuthoredContactBootstrap\.js";/);
assert.match(embodiment, /else if \(authoredSurfaceBrushReady\) \{[\s\S]{0,230}?nextState = "brushing";/);
assert.match(embodiment, /else if \(physicalAttachmentActive\) \{\s*nextState = "attached";/);
assert.match(embodiment, /else if \(physicalAttachmentReleasing\) \{/);
assert.doesNotMatch(embodiment, /else if \(authoredSurfaceBrushReady\) \{\s*nextState = "attached";/);
console.log("D11D PASS: 22 eligibility/owner invariants + embodiment integration checks");
