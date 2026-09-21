import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { CoreTopologyResonanceSystem } from "../src/player/CoreTopologyResonanceSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");
const approx = (a, b, eps = 0.015) => Math.abs(a - b) <= eps;

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028H.json");
const contract = json("public/data/build/hc028hCoreTopologyResonanceContract.json");
const locks = json("public/data/build/hc028hLockedOwnerHashes.json");
const topologyBridge = read("src/player/CoreTopologyResonanceSystem.js");
const worldResonance = read("src/world/CoreWorldResonanceSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");

assert.match(main, /buildId:\s*"HC-028H"/);
assert.match(main, /Core Topology Resonance Integration/);
assert.equal(pkg.version, "0.28.13");
assert.equal(identity.parent, "HC-028G");
assert.equal(contract.topologyStateCount, 10);
assert.equal(contract.existingTopologyAuthority, "CoreRadialPerformanceSystem + CoreEmbodimentSystem spatialCoreChemistry");
assert.equal(contract.presentationOnly, true);
assert.equal(contract.gameplayAuthority, false);
assert.equal(contract.movementAuthority, false);
assert.equal(contract.verbAuthority, false);
assert.equal(contract.engineRetiming, false);
assert.equal(contract.routeAuthority, false);
assert.equal(contract.inputTimingGate, false);

// The bridge must reuse existing traits/exposure laws, not introduce another gameplay table.
assert.match(topologyBridge, /traits\.response/);
assert.match(topologyBridge, /traits\.enduranceCapacity/);
assert.match(topologyBridge, /traits\.stability/);
assert.match(topologyBridge, /deep \* 0\.06 \+ inner \* 0\.28 \+ membrane \* 1\.0/);
assert.match(topologyBridge, /duplicateTopologyEngine:\s*false/);
assert.doesNotMatch(topologyBridge, /movementModifiers\s*:/);
assert.doesNotMatch(topologyBridge, /verbModifiers\s*:/);
assert.doesNotMatch(topologyBridge, /playerRoot\.position|playerRoot\.velocity/);
assert.match(runtime, /new CoreTopologyResonanceSystem/);
assert.match(runtime, /register\("coreTopologyResonanceSystem"/);

// World resonance preserves canonical coherence and only adds embodied/presentation context.
assert.match(worldResonance, /const embodiedCoherence01/);
assert.match(worldResonance, /topologyVisibility01/);
assert.match(worldResonance, /gameplayAdvantage:\s*false/);
assert.match(embodiment, /topologyFiringSharpness/);
assert.match(embodiment, /coreTopologyResonanceMode/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.6/);
assert.match(telemetry, /core\.topology_resonance\.mode_changed/);

const makeFrame = ({ weights, traits, topologyId, personality, dominantZone }) => ({
  corePerformance: {
    active: true,
    topologyId,
    topologyLabel: topologyId,
    distribution: `${Math.round(weights.deep * 3)}:${Math.round(weights.inner * 3)}:${Math.round(weights.membrane * 3)}`,
    personality,
    dominantZone,
    weights,
    traits
  },
  spatialCoreChemistry: { topology: { complete: true, id: topologyId } },
  coreChemistryOutput: {},
  regionalPhysicalEmbodiment: {
    active: true,
    region: "vascular",
    law: "laminar_transmission",
    force: "transmit_catch_receive_settle",
    phraseStrength: 1,
    beatPulse: 0.8
  },
  hostRhythm: { composition: { active: true, profileId: "vascular_psa_44_micro", currentFunction: "pulse", beatPulse: 0.8 } }
});

const run = (frame) => {
  const system = new CoreTopologyResonanceSystem({ frameState: frame });
  system.init();
  system.update(1, frame);
  return frame.coreTopologyResonance;
};

const deep = run(makeFrame({
  weights: { deep: 1, inner: 0, membrane: 0 },
  traits: { response: 0.88, enduranceCapacity: 1.55, stability: 1.30 },
  topologyId: "deep_concentration", personality: "diesel / reserve drive", dominantZone: "deep_core"
}));
const inner = run(makeFrame({
  weights: { deep: 0, inner: 1, membrane: 0 },
  traits: { response: 1.08, enduranceCapacity: 1.05, stability: 1.05 },
  topologyId: "inner_saturation", personality: "transmission / control drive", dominantZone: "inner_body"
}));
const membrane = run(makeFrame({
  weights: { deep: 0, inner: 0, membrane: 1 },
  traits: { response: 1.20, enduranceCapacity: 0.72, stability: 0.70 },
  topologyId: "membrane_saturation", personality: "race / output drive", dominantZone: "membrane"
}));
const balanced = run(makeFrame({
  weights: { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 },
  traits: { response: 1.0533333333, enduranceCapacity: 1.1066666667, stability: 1.0166666667 },
  topologyId: "three_way_balance", personality: "triadic balance", dominantZone: "balanced"
}));

assert.equal(deep.mode, "buffered_long_memory");
assert.equal(inner.mode, "controlled_transmission");
assert.equal(membrane.mode, "exposed_quick_response");
assert.equal(balanced.mode, "triadic_adaptive");
assert(approx(deep.properties.exposure01, 0.06));
assert(approx(inner.properties.exposure01, 0.28));
assert(approx(membrane.properties.exposure01, 1.0));
assert(approx(balanced.properties.exposure01, 0.447));
assert(deep.properties.inertia01 > inner.properties.inertia01 && inner.properties.inertia01 > membrane.properties.inertia01);
assert(membrane.properties.response01 > inner.properties.response01 && inner.properties.response01 > deep.properties.response01);
assert(deep.properties.coherence01 > inner.properties.coherence01 && inner.properties.coherence01 > membrane.properties.coherence01);
assert(membrane.presentation.worldImprint01 > deep.presentation.worldImprint01);
assert.equal(deep.gameplayAuthority, false);
assert.equal(membrane.movementAuthority, false);
assert.equal(inner.verbAuthority, false);

// Parent gameplay owners, including HC027C radial physiology, must remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028G owner drifted: ${rel}`);
}

const sourceJsCount = fs.readdirSync("src", { recursive: true })
  .filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true })
  .filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028H Core Topology Resonance Integration: PASS");
console.log(JSON.stringify({
  build: identity.id,
  deepMode: deep.mode,
  membraneMode: membrane.mode,
  balancedMode: balanced.mode,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount
}, null, 2));
