import fs from "node:fs";
import assert from "node:assert/strict";
import { HostRhythmSystem } from "../src/world/HostRhythmSystem.js";
import { WORLD_COMPOSITION_PROFILES, resolveWorldCompositionProfile } from "../src/world/WorldCompositionRegistry.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const main = read("src/main.js");
const host = read("src/world/HostRhythmSystem.js");
const registry = read("src/world/WorldCompositionRegistry.js");
const vascular = read("src/routes/VascularRhythmRouteSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const debug = read("src/debug/RecipeDebugOverlay.js");
const movement = read("src/player/PlayerMovementController.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const identity = JSON.parse(read("public/data/build/currentBuildIdentity_HC028C.json"));
const contract = JSON.parse(read("public/data/build/hc028cWorldCompositionGrammarContract.json"));
const packageJson = JSON.parse(read("package.json"));
const successorHC028C1 = main.includes('buildId: "HC-028C1"');
const successorHC028C2 = main.includes('buildId: "HC-028C2"');

assert.ok(main.includes('buildId: "HC-028C"') || successorHC028C1 || successorHC028C2);
assert.ok(main.includes("Vascular World Rhythm Grammar Prototype") || successorHC028C1 || successorHC028C2);
assert.ok(packageJson.version === "0.28.3" || (successorHC028C1 && packageJson.version === "0.28.4") || (successorHC028C2 && packageJson.version === "0.28.5"));
assert.equal(identity.parent, "HC-028B1");
assert.equal(identity.sourceJsCount, 94);
assert.equal(contract.authority.newIndependentTimer, false);
assert.equal(contract.vascularSignature.key, "P-S-A");
assert.equal(contract.vascularSignature.meter, "4/4");
assert.equal(contract.vascularSignature.barsPerHostCycle, 2);
assert.equal(contract.movement.maximumFlowDeviationFromBaseline, 0.06);
assert.equal(contract.movement.inputTimingGate, false);
assert.equal(contract.presentation.newGeometry, false);
assert.equal(contract.presentation.newDrawCalls, 0);
assert.equal(contract.audio.masterMixChanged, false);
assert.equal(contract.audio.busMixChanged, false);

const profile = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.ok(profile);
assert.equal(resolveWorldCompositionProfile("CELL_VASCULAR_RHYTHM_ROUTE_001")?.id, profile.id);
assert.equal(resolveWorldCompositionProfile("CELL_SIGNAL_CHORUS_NERVE_001"), null);
assert.deepEqual(profile.key.order, ["pulse", "stabilize", "absorb"]);
assert.equal(profile.meter.beatsPerBar, 4);
assert.equal(profile.meter.beatUnit, 4);
assert.equal(profile.meter.barsPerHostCycle, 2);
assert.deepEqual(profile.meter.functionPattern, ["pulse", "stabilize", "absorb", "stabilize"]);
assert.equal(profile.movement.flowModulationDepth, 0.06);

const frameState = {
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
  runtimeSeconds: 0
};
const rhythm = new HostRhythmSystem({ frameState });
rhythm.init();
rhythm.update(0, frameState);
let composition = frameState.hostRhythm.composition;
assert.equal(composition.active, true);
assert.equal(composition.keyId, "P-S-A");
assert.equal(composition.meterLabel, "4/4");
assert.equal(composition.beatsPerHostCycle, 8);
assert.ok(Math.abs(composition.tempoBpm - 82.75862068965517) < 0.0001);
assert.equal(composition.octaveLabel, "micro_local");
assert.equal(composition.beatNumber, 1);
assert.equal(composition.currentFunction, "pulse");
assert.ok(composition.flowScale <= 1.06 && composition.flowScale >= 0.96);

frameState.runtimeSeconds = 0.9;
rhythm.update(0.9, frameState);
composition = frameState.hostRhythm.composition;
assert.equal(composition.beatNumber, 2);
assert.equal(composition.currentFunction, "stabilize");

frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
rhythm.update(0.1, frameState);
assert.equal(frameState.hostRhythm.composition.active, false);
assert.equal(frameState.hostRhythm.composition.profileId, "legacy_host_breath");

for (const forbidden of ["setInterval(", "setTimeout(", "Date.now(", "performance.now("]) {
  assert.ok(!host.includes(forbidden), `HostRhythmSystem must not add independent timer: ${forbidden}`);
  assert.ok(!registry.includes(forbidden), `WorldCompositionRegistry must remain timer-free: ${forbidden}`);
}
assert.match(host, /single_host_rhythm_signal/);
assert.match(host, /world_is_the_metronome/);
assert.match(vascular, /worldRhythmFlowScale/);
assert.match(vascular, /0\.96, 1\.06/);
assert.match(vascular, /worldComposition:/);
assert.match(vascular, /inputTimingGate: false/);
assert.match(audio, /playWorldRhythmBeat/);
assert.match(audio, /bus: "ambience"/);
assert.match(audio, /world_rhythm_beat:/);
assert.match(debug, /World: \$\{worldComposition\.active/);

// HC028B1 repairs must remain present in the child build.
assert.match(movement, /resolveConvergenceReachability/);
assert.match(movement, /environmentScale = 1 - envelope01 \* 0\.82/);
assert.match(morph, /completed Vascular\/Silt return folds own their transition/);

const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 94, "HC028C adds only WorldCompositionRegistry to runtime source ownership");

console.log("HC028C Vascular World Rhythm Grammar Prototype: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  key: composition.keyId ?? "legacy after control check",
  vascularKey: profile.key.id,
  meter: `${profile.meter.beatsPerBar}/${profile.meter.beatUnit}`,
  barsPerHostCycle: profile.meter.barsPerHostCycle,
  tempoBpm: Number((60 * profile.meter.beatsPerBar * profile.meter.barsPerHostCycle / 5.8).toFixed(3)),
  flowScaleRange: [profile.movement.minimumFlowScale, profile.movement.maximumFlowScale],
  inputTimingGate: profile.authority.inputTimingGate,
  sharedHostClock: profile.authority.sharedHostClock
}, null, 2));
