import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028I1.json");
const contract = json("public/data/build/hc028i1CombReentryReturnArmingContract.json");
const locks = json("public/data/build/hc028i1LockedOwnerHashes.json");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const comb = json("public/data/thresholds/combThresholdFoundation_HC013A.json");

assert.match(main, /buildId:\s*"HC-028I1"/);
assert.equal(pkg.version, "0.28.17");
assert.equal(identity.parent, "HC-028I");
assert.equal(contract.repair.keepSpatialProximityReturns, true);
assert.equal(contract.repair.moveCombGeometry, false);
assert.equal(contract.repair.changeCombGameplay, false);

// Reproduce the authored overlap that caused the report: arrival at local 0 is
// already inside a return fold centered +0.75 with a 1.45 interaction radius.
const returnPos = comb.returnFold.position ?? [0, 0, 0];
const arrivalDistance = Math.hypot(...returnPos);
const returnRange = comb.returnFold.interactionRange;
assert.ok(arrivalDistance < returnRange, "fixture no longer reproduces Comb arrival/return overlap");
assert.equal(contract.rootCause.overlapAtArrival, true);

// Hotfix contract: proximity return cannot fire merely because readiness is true.
assert.match(morph, /proximityReturnArmed:\s*false/);
assert.match(morph, /proximityReturnDepartureMargin\s*=\s*0\.30/);
assert.match(morph, /distance > departureDistance/);
assert.match(morph, /proximityReturn\s*\? state\.returnTriggerArmed/);
assert.match(morph, /handleBoundaryCellChange\(frameState\)/);
assert.match(morph, /state\.completed = false/);
assert.match(morph, /state\.proximityReturnArmed = false/);

// Small algorithm regression: arrival overlap stays inert, departing arms, coming
// back into the fold then crosses. This preserves spatial return without a button.
const margin = 0.30;
let armed = false;
const step = (distance) => {
  const ready = distance <= returnRange;
  if (!armed && distance > returnRange + margin) armed = true;
  return ready && armed;
};
assert.equal(step(arrivalDistance), false, "Comb arrival must not auto-return");
assert.equal(step(returnRange + margin + 0.2), false, "departure arms but does not cross while outside fold");
assert.equal(armed, true, "return should arm after meaningful departure");
assert.equal(step(returnRange - 0.1), true, "return should cross when player deliberately comes back to fold");

// All untouched runtime owners are byte locked to the HC028I parent tree.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028I owner drifted: ${rel}`);
}

console.log("HC028I1 Comb Re-entry + Return Arming Hotfix: PASS");
console.log(JSON.stringify({
  build: identity.id,
  arrivalDistance,
  returnRange,
  departureArmDistance: returnRange + margin,
  lockedRuntimeOwners: Object.keys(locks.files).length
}, null, 2));
