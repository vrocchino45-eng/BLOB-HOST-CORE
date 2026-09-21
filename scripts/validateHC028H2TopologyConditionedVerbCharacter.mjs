import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { CoreTopologyVerbCharacterSystem } from "../src/player/CoreTopologyVerbCharacterSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028H2.json");
const contract = json("public/data/build/hc028h2TopologyConditionedVerbCharacterContract.json");
const locks = json("public/data/build/hc028h2LockedOwnerHashes.json");
const bridge = read("src/player/CoreTopologyVerbCharacterSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");

assert.match(main, /buildId:\s*"HC-028H2"/);
assert.match(main, /Topology-Conditioned Verb Character/);
assert.equal(pkg.version, "0.28.15");
assert.equal(identity.parent, "HC-028H1");
assert.equal(contract.duplicateVerbPhysiology, false);
assert.equal(contract.topologyBuffTable, false);
assert.equal(contract.verbPowerChanged, false);
assert.equal(contract.verbRangeChanged, false);
assert.equal(contract.verbProgressChanged, false);
assert.equal(contract.verbCostChanged, false);
assert.equal(contract.targetingChanged, false);
assert.equal(contract.movementChanged, false);
assert.equal(contract.environmentalHandlingChanged, false);
assert.equal(contract.routeChanged, false);
assert.equal(contract.inputChanged, false);
assert.equal(contract.engineRetimed, false);
assert.equal(contract.audioReferenceMixChanged, false);
assert.equal(contract.telemetrySchema, "blob.session.telemetry.v1.8");

// New bridge derives character from the existing HC028H interpretation only.
assert.match(bridge, /coreTopologyResonance/);
assert.match(bridge, /properties\.response01/);
assert.match(bridge, /properties\.inertia01/);
assert.match(bridge, /properties\.coherence01/);
assert.match(bridge, /properties\.exposure01/);
assert.match(bridge, /gameplayAuthority:\s*false/);
assert.match(bridge, /verbPowerAuthority:\s*false/);
assert.match(bridge, /verbRangeAuthority:\s*false/);
assert.match(bridge, /verbProgressAuthority:\s*false/);
assert.match(bridge, /costAuthority:\s*false/);
assert.match(bridge, /movementAuthority:\s*false/);
assert.doesNotMatch(bridge, /playerRoot\.position|velocity\.add|absorbProgress\s*=|pulseCharge01\s*=|coherenceMultiplier\s*=/);

// Presentation consumers may read H2 but must remain downstream of canonical gameplay truth.
assert.match(physical, /coreTopologyVerbCharacter\?\.pulse/);
assert.match(physical, /coreTopologyVerbCharacter\?\.absorb/);
assert.match(physical, /coreTopologyVerbCharacter\?\.stabilize/);
assert.match(physical, /contourPersistenceScale/);
assert.match(physical, /helixRateScale/);
assert.match(physical, /wobbleScale/);
assert.match(audio, /coreTopologyVerbCharacter\?\.audio/);
assert.match(audio, /referenceSystemOutputPercent:\s*"60-70"/);
assert.match(audio, /masterGain:\s*0\.82/);
assert.match(audio, /verbs:\s*2\.15/);

const radialRegister = runtime.indexOf('register("coreRadialPerformanceSystem"');
const characterRegister = runtime.indexOf('register("coreTopologyVerbCharacterSystem"');
const audioRegister = runtime.indexOf('register("eventAnchoredHostAudioSystem"');
assert(radialRegister >= 0 && characterRegister > radialRegister && audioRegister > characterRegister);
assert.match(runtime, /new CoreTopologyVerbCharacterSystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.8/);
assert.match(telemetry, /core\.topology_verb_character\.mode_changed/);
assert.match(telemetry, /topologyVerbCharacter/);

const makeFrame = ({ id, mode, personality, response01, inertia01, coherence01, exposure01, balance01 = 0 }) => ({
  corePerformance: { active: true, topologyId: id, topologyLabel: id, personality },
  coreTopologyResonance: {
    active: true,
    topologyId: id,
    topologyLabel: id,
    personality,
    mode,
    properties: { response01, inertia01, coherence01, exposure01, balance01 }
  }
});
const run = (frame) => {
  const system = new CoreTopologyVerbCharacterSystem({ frameState: frame });
  system.init();
  system.update(1 / 60, frame);
  return frame.coreTopologyVerbCharacter;
};

const deep = run(makeFrame({ id: "3:0:0", mode: "buffered_long_memory", personality: "diesel / reserve drive", response01: 0, inertia01: 1, coherence01: 1, exposure01: 0.06 }));
const inner = run(makeFrame({ id: "0:3:0", mode: "controlled_transmission", personality: "transmission / control drive", response01: 0.625, inertia01: 0.398, coherence01: 0.583, exposure01: 0.28 }));
const membrane = run(makeFrame({ id: "0:0:3", mode: "exposed_quick_response", personality: "race / output drive", response01: 1, inertia01: 0, coherence01: 0, exposure01: 1 }));
const balanced = run(makeFrame({ id: "1:1:1", mode: "triadic_adaptive", personality: "triadic balance", response01: 0.542, inertia01: 0.466, coherence01: 0.528, exposure01: 0.447, balance01: 1 }));

assert(deep.pulse.contourPersistenceScale > membrane.pulse.contourPersistenceScale);
assert(deep.pulse.returnTrailScale > membrane.pulse.returnTrailScale);
assert(membrane.absorb.helixRateScale > deep.absorb.helixRateScale);
assert(membrane.stabilize.wobbleScale > deep.stabilize.wobbleScale);
assert(deep.audio.tailScale > membrane.audio.tailScale);
assert(membrane.audio.transientScale > deep.audio.transientScale);
assert(balanced.pulse.contourPersistenceScale > 0.95 && balanced.pulse.contourPersistenceScale < 1.1);
assert(inner.absorb.convergenceFocusScale > 0.98 && inner.absorb.convergenceFocusScale < 1.08);
for (const state of [deep, inner, membrane, balanced]) {
  assert.equal(state.gameplayAuthority, false);
  assert.equal(state.verbPowerAuthority, false);
  assert.equal(state.verbRangeAuthority, false);
  assert.equal(state.verbProgressAuthority, false);
  assert.equal(state.costAuthority, false);
  assert.equal(state.inputAuthority, false);
  assert.equal(state.movementAuthority, false);
  assert.equal(state.topologyBuffTableAdded, false);
}

for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028H1 owner drifted: ${rel}`);
}

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028H2 Topology-Conditioned Verb Character: PASS");
console.log(JSON.stringify({
  build: identity.id,
  deepPulseTail: deep.pulse.contourPersistenceScale,
  membranePulseTail: membrane.pulse.contourPersistenceScale,
  deepAbsorbRate: deep.absorb.helixRateScale,
  membraneAbsorbRate: membrane.absorb.helixRateScale,
  deepAudioTail: deep.audio.tailScale,
  membraneAudioTransient: membrane.audio.transientScale,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount
}, null, 2));
