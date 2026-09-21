import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { WORLD_COMPOSITION_PROFILES, resolveWorldCompositionProfile } from "../src/world/WorldCompositionRegistry.js";
import { HostRhythmSystem } from "../src/world/HostRhythmSystem.js";
import { CoreWorldResonanceSystem } from "../src/world/CoreWorldResonanceSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");
const approx = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

const main = read("src/main.js");
const hostSource = read("src/world/HostRhythmSystem.js");
const resonanceSource = read("src/world/CoreWorldResonanceSystem.js");
const audioSource = read("src/audio/EventAnchoredHostAudioSystem.js");
const siltSource = read("src/routes/SiltPressureRouteSystem.js");
const graveSource = read("src/routes/GraveMemoryRouteSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC028E.json");
const contract = json("public/data/build/hc028eRegionalCompositionTriadContract.json");
const locks = json("public/data/build/hc028eLockedOwnerHashes.json");
const pkg = json("package.json");

assert.match(main, /buildId:\s*"HC-028E"/);
assert.match(main, /Regional Composition Triad/);
assert.equal(pkg.version, "0.28.9");
assert.equal(identity.parent, "HC-028D2");
assert.equal(identity.sourceJsCount, 97);
assert.equal(contract.rule, "same_host_clock_different_regional_sentence");
assert.equal(contract.hostCycleSeconds, 5.8);

const expected = {
  vascular: {
    cellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
    profileId: "vascular_psa_44_micro",
    key: "P-S-A",
    beatsPerBar: 4,
    beatUnit: 4,
    barsPerHostCycle: 2,
    tempo: 60 * 8 / 5.8,
    firstFunction: "pulse",
    voice: "transmission_pulse",
    firstFrequency: 108
  },
  silt: {
    cellId: "CELL_SILT_PRESSURE_ROUTE_001",
    profileId: "silt_asp_34_micro",
    key: "A-S-P",
    beatsPerBar: 3,
    beatUnit: 4,
    barsPerHostCycle: 2,
    tempo: 60 * 6 / 5.8,
    firstFunction: "absorb",
    voice: "pressure_bass_triplet",
    firstFrequency: 52
  },
  grave: {
    cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
    profileId: "grave_sap_128_micro",
    key: "S-A-P",
    beatsPerBar: 12,
    beatUnit: 8,
    barsPerHostCycle: 1,
    tempo: 60 * 12 / 5.8,
    firstFunction: "stabilize",
    voice: "compound_memory_bass",
    firstFrequency: 44
  }
};

assert.equal(Object.keys(WORLD_COMPOSITION_PROFILES).length, 3, "HC028E should author exactly the three route profiles in this proof");

for (const [region, spec] of Object.entries(expected)) {
  const profile = resolveWorldCompositionProfile(spec.cellId);
  assert.ok(profile, `${region} profile must resolve by cell`);
  assert.equal(profile.id, spec.profileId);
  assert.equal(profile.key.id, spec.key);
  assert.equal(profile.meter.beatsPerBar, spec.beatsPerBar);
  assert.equal(profile.meter.beatUnit, spec.beatUnit);
  assert.equal(profile.meter.barsPerHostCycle, spec.barsPerHostCycle);
  assert.equal(profile.authority.sharedHostClock, true);
  assert.equal(profile.authority.inputTimingGate, false);
  assert.equal(profile.authority.progression, false);
  assert.equal(profile.authority.objective, false);
  assert.equal(profile.authority.routeCompletion, false);

  const frameState = {
    activeCellId: spec.cellId,
    runtimeSeconds: 0,
    coreEngine: {
      active: true,
      phaseCount: 6,
      architectureId: "paired_6",
      cycleProgress01: 0,
      currentPhaseFunction: spec.firstFunction
    }
  };
  const host = new HostRhythmSystem({ frameState });
  host.init();
  host.update(1 / 60, frameState);
  const composition = frameState.hostRhythm.composition;
  assert.equal(frameState.hostRhythm.cycleSeconds, 5.8);
  assert.equal(composition.active, true);
  assert.equal(composition.profileId, spec.profileId);
  assert.equal(composition.keyId, spec.key);
  assert.equal(composition.meterLabel, `${spec.beatsPerBar}/${spec.beatUnit}`);
  assert.ok(approx(composition.tempoBpm, spec.tempo), `${region} tempo drifted`);
  assert.equal(composition.currentFunction, spec.firstFunction);
  assert.equal(composition.inputTimingGate, false);
  assert.equal(composition.progressionAuthority, false);
  assert.equal(composition.objectiveAuthority, false);
  assert.equal(composition.routeCompletionAuthority, false);
  assert.equal(composition.audioVoice.voice, spec.voice);
  assert.ok(approx(composition.audioVoice.frequencyHz, spec.firstFrequency), `${region} first voice frequency drifted`);

  const resonance = new CoreWorldResonanceSystem({ frameState });
  resonance.init();
  resonance.update(1 / 60, frameState);
  assert.equal(frameState.coreWorldResonance.active, true, `${region} should participate in Core-World resonance`);
  assert.equal(frameState.coreWorldResonance.worldProfileId, spec.profileId);
  assert.equal(frameState.coreWorldResonance.movementAuthority, false);
  assert.equal(frameState.coreWorldResonance.inputTimingGate, false);
  assert.equal(frameState.coreWorldResonance.gameplayAdvantage, false);
}

// Vascular remains the exact proven movement curve; Silt/Grave never gain a
// rhythm-derived traversal multiplier in HC028E.
const vascular = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.equal(vascular.movement.minimumFlowScale, 0.96);
assert.equal(vascular.movement.maximumFlowScale, 1.06);
assert.equal(vascular.movement.minimumMoteSpeedScale, 0.92);
assert.equal(vascular.movement.maximumMoteSpeedScale, 1.10);
for (const profile of [WORLD_COMPOSITION_PROFILES.silt_asp_34_micro, WORLD_COMPOSITION_PROFILES.grave_sap_128_micro]) {
  assert.equal(profile.movement.flowModulationDepth, 0);
  assert.equal(profile.movement.minimumFlowScale, 1);
  assert.equal(profile.movement.maximumFlowScale, 1);
  assert.equal(profile.movement.minimumMoteSpeedScale, 1);
  assert.equal(profile.movement.maximumMoteSpeedScale, 1);
}

// Preserve Vascular's HC028C2 audible articulation exactly while making the
// sound renderer profile-driven for Silt and Grave.
assert.deepEqual([...vascular.audio.gainPattern], [1.0, 0.55, 0.78, 0.40]);
assert.deepEqual([...vascular.audio.durationPattern], [1.08, 0.72, 1.18, 0.64]);
assert.deepEqual([...vascular.audio.glidePattern], [1.05, 0.99, 0.91, 0.98]);
assert.ok(!audioSource.includes('composition.profileId !== "vascular_psa_44_micro"'), "world rhythm audio must no longer be Vascular-hardcoded");
assert.match(audioSource, /composition\.audioVoice/);
assert.match(audioSource, /HC027D1_AUDIO_MIX/);
assert.match(audioSource, /masterGain:\s*0\.82/);

// Silt and Grave read their authored phrase visually and report no gameplay authority.
for (const token of [
  'profileId === "silt_asp_34_micro"',
  'asp_key_34_pressure_appetite_phrase',
  '1_gather_2_brace_3_read_release',
  'gameplayAuthority: false',
  'movementAuthority: false',
  'inputTimingGate: false'
]) assert.ok(siltSource.includes(token), `Silt composition token missing: ${token}`);

for (const token of [
  'profileId === "grave_sap_128_micro"',
  'sap_key_128_compound_memory_phrase',
  'hold_triplet_draw_triplet_return_triplet_settle_triplet',
  'gameplayAuthority: false',
  'movementAuthority: false',
  'inputTimingGate: false'
]) assert.ok(graveSource.includes(token), `Grave composition token missing: ${token}`);

assert.match(hostSource, /audioVoice:/);
assert.ok(!resonanceSource.includes('composition.profileId === "vascular_psa_44_micro"'), "resonance must accept authored regional profiles generally");
assert.match(resonanceSource, /composition\.sharedHostClock !== false/);

// D2 commitment, D1 verb coupling, movement and Vascular gameplay are byte locked.
for (const [rel, expectedHash] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expectedHash, `locked parent owner drifted: ${rel}`);
}

const jsFiles = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 97);

console.log("HC028E Regional Composition Triad: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  hostCycleSeconds: contract.hostCycleSeconds,
  profiles: Object.fromEntries(Object.entries(expected).map(([region, spec]) => [region, {
    profileId: spec.profileId,
    key: spec.key,
    meter: `${spec.beatsPerBar}/${spec.beatUnit}`,
    tempoBpm: Number(spec.tempo.toFixed(3)),
    voice: spec.voice
  }])),
  lockedOwners: Object.keys(locks.files).length
}, null, 2));
