import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { CoreTopologyEnvironmentalHandlingSystem } from "../src/player/CoreTopologyEnvironmentalHandlingSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");
const approx = (a, b, eps = 0.015) => Math.abs(a - b) <= eps;

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028H1.json");
const contract = json("public/data/build/hc028h1TopologyConditionedEnvironmentalHandlingContract.json");
const locks = json("public/data/build/hc028h1LockedOwnerHashes.json");
const bridge = read("src/player/CoreTopologyEnvironmentalHandlingSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const lift = read("src/world/LiftFieldReadabilitySystem.js");

assert.match(main, /buildId:\s*"HC-028H1"/);
assert.match(main, /Topology-Conditioned Environmental Handling/);
assert.equal(pkg.version, "0.28.14");
assert.equal(identity.parent, "HC-028H");
assert.equal(contract.perRegionTable, false);
assert.equal(contract.topologyBuffTable, false);
assert.equal(contract.worldForceGenerationChanged, false);
assert.equal(contract.newThermalPhysics, false);
assert.equal(contract.routeAuthority, false);
assert.equal(contract.inputAuthority, false);
assert.equal(contract.normalInputAccelerationMultiplier, 1);
assert.equal(contract.speedLimitMultiplier, 1);
assert.equal(contract.boostMultiplier, 1);
assert.equal(contract.verbMultiplier, 1);
assert.equal(contract.telemetrySchema, "blob.session.telemetry.v1.7");

// New bridge must derive from HC028H properties with one universal law, not tables.
assert.match(bridge, /properties\.response01/);
assert.match(bridge, /properties\.inertia01/);
assert.match(bridge, /properties\.coherence01/);
assert.match(bridge, /properties\.exposure01/);
assert.match(bridge, /regionTableAdded:\s*false/);
assert.match(bridge, /topologyBuffTableAdded:\s*false/);
assert.doesNotMatch(bridge, /playerRoot\.position|velocity\.add|switch\s*\(.*region/s);

// PlayerMovementController may consume topology only in existing environmental flow
// acceleration and fluid-slip damping. Input acceleration/speed limit remain untouched.
assert.match(movement, /topologyEnvironmentalHandling\.environmentalCouplingMultiplier/);
assert.match(movement, /topologyEnvironmentalHandling\.fluidSlipDampingMultiplier/);
assert.match(movement, /flowCouplingMultiplier\s*\n\s*\* convergenceReachability\.environmentScale\s*\n\s*\* topologyEnvironmentalCouplingScale/);
assert.match(movement, /drag \* coastingDragScale \* topologyFluidSlipDampingScale \* dt/);
assert.match(movement, /topologyHandlingSuppressed = hubGuidedFlightActive \|\| convergenceReachability\.active/);
assert.match(movement, /normalInputAccelerationMultiplier:\s*1/);
assert.match(movement, /speedLimitMultiplier:\s*1/);
const accelerationExpr = movement.match(/const acceleration = ([\s\S]*?);/);
const speedLimitExpr = movement.match(/const speedLimit = ([\s\S]*?);/);
assert(accelerationExpr && !accelerationExpr[1].includes("topology"));
assert(speedLimitExpr && !speedLimitExpr[1].includes("topology"));

// Registration must publish handling before movement consumes it.
const handlingRegister = runtime.indexOf('register("coreTopologyEnvironmentalHandlingSystem"');
const movementRegister = runtime.indexOf('register("playerMovement"');
assert(handlingRegister >= 0 && movementRegister > handlingRegister);
assert.match(runtime, /new CoreTopologyEnvironmentalHandlingSystem/);

// Lift readability remains a consumer of resolved force, not a source of force.
assert.match(lift, /environmentalForceVector/);
assert.doesNotMatch(lift, /playerRoot\.position\.add|velocity\.add|flowStrength\s*=/);

// Telemetry records the handling state but remains observer-only.
assert.match(telemetry, /blob\.session\.telemetry\.v1\.7/);
assert.match(telemetry, /core\.topology_environmental_handling\.mode_changed/);
assert.match(telemetry, /topologyEnvironmentalCouplingMultiplier/);

const makeFrame = ({ topologyMode, personality, response01, inertia01, coherence01, exposure01, balance01 = 0 }) => ({
  corePerformance: { active: true, topologyId: topologyMode, personality },
  coreTopologyResonance: {
    active: true,
    topologyId: topologyMode,
    mode: topologyMode,
    personality,
    properties: { response01, inertia01, coherence01, exposure01, balance01 }
  },
  regionalPhysicalEmbodiment: { active: true, region: "vascular", law: "laminar_transmission", force: "transmit_catch_receive_settle" }
});

const run = (frame) => {
  const system = new CoreTopologyEnvironmentalHandlingSystem({ frameState: frame });
  system.init();
  system.update(1 / 60, frame);
  return frame.coreTopologyEnvironmentalHandling;
};

const deep = run(makeFrame({
  topologyMode: "buffered_long_memory", personality: "diesel / reserve drive",
  response01: 0, inertia01: 1, coherence01: 1, exposure01: 0.06
}));
const inner = run(makeFrame({
  topologyMode: "controlled_transmission", personality: "transmission / control drive",
  response01: 0.625, inertia01: 0.398, coherence01: 0.583, exposure01: 0.28
}));
const membrane = run(makeFrame({
  topologyMode: "exposed_quick_response", personality: "race / output drive",
  response01: 1, inertia01: 0, coherence01: 0, exposure01: 1
}));
const balanced = run(makeFrame({
  topologyMode: "triadic_adaptive", personality: "triadic balance",
  response01: 0.542, inertia01: 0.466, coherence01: 0.528, exposure01: 0.447, balance01: 1
}));

assert.equal(deep.handling.mode, "buffered_inertial");
assert.equal(inner.handling.mode, "controlled_transmission");
assert.equal(membrane.handling.mode, "exposed_coupled");
assert.equal(balanced.handling.mode, "adaptive_neutral");
assert(deep.handling.environmentalCouplingMultiplier < inner.handling.environmentalCouplingMultiplier);
assert(inner.handling.environmentalCouplingMultiplier < membrane.handling.environmentalCouplingMultiplier);
assert(deep.handling.fluidSlipDampingMultiplier < membrane.handling.fluidSlipDampingMultiplier);
assert(approx(balanced.handling.environmentalCouplingMultiplier, 0.995, 0.02));
assert(deep.handling.environmentalCouplingMultiplier >= 0.92);
assert(membrane.handling.environmentalCouplingMultiplier <= 1.09);
assert.equal(deep.handling.normalInputAccelerationMultiplier, 1);
assert.equal(membrane.handling.speedLimitMultiplier, 1);
assert.equal(inner.handling.verbMultiplier, 1);
assert.equal(balanced.movementAuthority, false);

// All owners promised locked to HC028H must remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028H owner drifted: ${rel}`);
}

const sourceJsCount = fs.readdirSync("src", { recursive: true })
  .filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true })
  .filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028H1 Topology-Conditioned Environmental Handling: PASS");
console.log(JSON.stringify({
  build: identity.id,
  deepCoupling: deep.handling.environmentalCouplingMultiplier,
  innerCoupling: inner.handling.environmentalCouplingMultiplier,
  membraneCoupling: membrane.handling.environmentalCouplingMultiplier,
  balancedCoupling: balanced.handling.environmentalCouplingMultiplier,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount
}, null, 2));
