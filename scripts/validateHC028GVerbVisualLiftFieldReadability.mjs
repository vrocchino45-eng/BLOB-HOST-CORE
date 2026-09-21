import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028G.json");
const contract = json("public/data/build/hc028gVerbVisualLiftFieldReadabilityContract.json");
const locks = json("public/data/build/hc028gLockedOwnerHashes.json");
const verbs = read("src/player/CoreVerbPhysicalizationSystem.js");
const lift = read("src/world/LiftFieldReadabilitySystem.js");
const runtime = read("src/core/GameRuntime.js");

assert.match(main, /buildId:\s*"HC-028G"/);
assert.match(main, /Verb Visual \+ Lift Field Readability/);
assert.equal(pkg.version, "0.28.12");
assert.equal(identity.parent, "HC-028F1");
assert.equal(contract.rule, "existing_verbs_and_vertical_force_must_explain_themselves_through_world_consequence_not_HUD_or_hidden_trial_and_error");

// Pulse: keep the canonical sensory/gameplay law but make actual answering geometry readable.
assert.equal(contract.pulse.geometryContourResponse, true);
assert.equal(contract.pulse.gameplayRangeChanged, false);
assert.match(verbs, /new THREE\.WireframeGeometry\(child\.geometry\)/);
assert.match(verbs, /pulse_surface_contour_/);
assert.match(verbs, /updatePulseContours/);
assert.match(verbs, /opacity:\s*charged \? 0\.18 : 0\.10/);

// Absorb: controlled target -> Core transfer, not generic suction/disappearance.
assert.equal(contract.absorb.helicalTransferFilaments, 3);
assert.equal(contract.absorb.corkscrewFragments, true);
assert.equal(contract.absorb.powerChanged, false);
assert.match(verbs, /absorb_helical_transfer_filaments/);
assert.match(verbs, /absorb_transfer_filament_/);
assert.match(verbs, /updateAbsorbFilaments/);
assert.match(verbs, /spiralRadius/);

// Stabilize: three moving gimbal bands settle toward coherence.
assert.equal(contract.stabilize.gyroscopicBands, 3);
assert.equal(contract.stabilize.movementChanged, false);
assert.equal(contract.stabilize.coherencePowerChanged, false);
assert.match(verbs, /stabilize_gyroscopic_coherence_field/);
assert.match(verbs, /stabilize_gyro_band_/);
assert.match(verbs, /const wobble = \(1 - this\.stabilizeProgress\)/);
assert.match(verbs, /precession/);

// Lift field: must visualize resolved movement truth, never create physics authority.
assert.equal(contract.liftField.fixedThermalSpotMap, false);
assert.equal(contract.liftField.source, "resolved_PlayerMovementController_environmentalForceVector");
assert.equal(contract.liftField.movementAuthority, false);
assert.equal(contract.liftField.collisionAuthority, false);
assert.equal(contract.liftField.routeAuthority, false);
assert.match(lift, /kinematics\.environmentalForceVector/);
assert.match(lift, /show_actual_vertical_force_and_pressure_consequence_never_invent_fake_lift_physics/);
assert.match(lift, /fixedThermalSpotMap:\s*false/);
assert.doesNotMatch(lift, /playerRoot\.position\.(?:add|set|lerp|copy)\(/);
assert.doesNotMatch(lift, /velocity\.(?:add|set|multiplyScalar)\(/);
assert.match(runtime, /new LiftFieldReadabilitySystem/);
assert.match(runtime, /register\("liftFieldReadabilitySystem"/);

// HC028F1 Hub deliberate commit and all gameplay authorities are byte locked.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028F1 owner drifted: ${rel}`);
}

// Source/public counts are part of the handoff identity.
const sourceJsCount = fs.readdirSync("src", { recursive: true })
  .filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true })
  .filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028G Verb Visual + Lift Field Readability: PASS");
console.log(JSON.stringify({
  build: identity.id,
  pulseContours: contract.pulse.geometryContourResponse,
  absorbFilaments: contract.absorb.helicalTransferFilaments,
  stabilizeBands: contract.stabilize.gyroscopicBands,
  liftSource: contract.liftField.source,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount
}, null, 2));
