import assert from "node:assert/strict";
import fs from "node:fs";
import {
  FRAGMENT_FIELD_RULES,
  isFragmentFieldEligible,
  selectFragmentFieldCandidates,
  stylePullMultiplier
} from "../src/combat/FragmentHarvestFieldGrammar.js";

assert.equal(isFragmentFieldEligible({ distance: 2.2, aimDot: 0.72 }), true);
assert.equal(isFragmentFieldEligible({ distance: 6.2, aimDot: 1.0 }), false);
assert.equal(isFragmentFieldEligible({ distance: 0.8, aimDot: -0.7 }), true, "very close debris must remain harvestable without pixel-perfect aim");

const selected = selectFragmentFieldCandidates([
  { fragment: { id: "a" }, distance: 1.8, aimDot: 0.85, age01: 0.2 },
  { fragment: { id: "b" }, distance: 2.4, aimDot: 0.92, age01: 0.1 },
  { fragment: { id: "c" }, distance: 3.7, aimDot: 0.45, age01: 0.1 }
]);
assert.equal(selected.length, FRAGMENT_FIELD_RULES.maxConcurrentPulls);
assert.deepEqual(selected.map((entry) => entry.fragment.id).sort(), ["a", "b"].sort());

// Pure numerical smoke of the field rule: a forward brittle fragment at 2.4m must
// cross the physical capture radius well before its shortest HC031C1 capture window.
let position = { x: 0, y: 0, z: -2.4 };
let velocity = { x: 0, y: 0, z: 0 };
const dt = 1 / 60;
let capturedAt = null;
for (let frame = 0; frame < 240; frame += 1) {
  const dx = -position.x;
  const dy = -position.y;
  const dz = -position.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance <= FRAGMENT_FIELD_RULES.captureRadius) {
    capturedAt = frame * dt;
    break;
  }
  const proximity01 = Math.max(0, Math.min(1, 1 - distance / FRAGMENT_FIELD_RULES.influenceRadius));
  const desiredSpeed = (
    FRAGMENT_FIELD_RULES.basePullSpeed
    + FRAGMENT_FIELD_RULES.nearPullSpeedBonus * proximity01
  ) * stylePullMultiplier("brittle");
  const inv = distance > 0.0001 ? 1 / distance : 0;
  const desired = { x: dx * inv * desiredSpeed, y: dy * inv * desiredSpeed, z: dz * inv * desiredSpeed };
  const steer = 1 - Math.exp(-dt * FRAGMENT_FIELD_RULES.steeringRate);
  velocity.x += (desired.x - velocity.x) * steer;
  velocity.y += (desired.y - velocity.y) * steer;
  velocity.z += (desired.z - velocity.z) * steer;
  position.x += velocity.x * dt;
  position.y += velocity.y * dt;
  position.z += velocity.z * dt;
}
assert.ok(capturedAt !== null, "field pull must reach capture radius");
assert.ok(capturedAt < 2.0, `field pull should visibly capture promptly; got ${capturedAt}`);

const ruptureSource = fs.readFileSync(new URL("../src/combat/GraveRuptureHarvestSystem.js", import.meta.url), "utf8");
const runtimeSource = fs.readFileSync(new URL("../src/core/GameRuntime.js", import.meta.url), "utf8");
assert.match(ruptureSource, /applyFragmentFieldPull\(fragment, dt, frameState\)/);
assert.match(ruptureSource, /collectFragment\(fragment, frameState, "absorb_field_contact"\)/);
assert.match(ruptureSource, /fragmentFieldMaxConcurrentPulls/);
assert.match(runtimeSource, /camera: this\.camera/);

console.log(`HC031C2 fragment field capture PASS (numerical contact at ${capturedAt.toFixed(3)}s)`);
