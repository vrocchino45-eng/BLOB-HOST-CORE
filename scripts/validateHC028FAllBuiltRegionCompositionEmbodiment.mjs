import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { WORLD_COMPOSITION_PROFILES, resolveWorldCompositionProfile } from "../src/world/WorldCompositionRegistry.js";
import { HostRhythmSystem } from "../src/world/HostRhythmSystem.js";
import { CoreWorldResonanceSystem } from "../src/world/CoreWorldResonanceSystem.js";
import { RegionalPhysicalEmbodimentSystem } from "../src/world/RegionalPhysicalEmbodimentSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC028F.json");
const contract = json("public/data/build/hc028fAllBuiltRegionCompositionEmbodimentContract.json");
const locks = json("public/data/build/hc028fLockedOwnerHashes.json");
const firstSliceRegions = json("public/data/world/firstSliceRegions_HC006I.json");
const pkg = json("package.json");

assert.match(main, /buildId:\s*"HC-028F"/);
assert.match(main, /All Built Region Composition Embodiment/);
assert.equal(pkg.version, "0.28.10");
assert.equal(identity.parent, "HC-028E");
assert.equal(identity.sourceJsCount, 98);
assert.equal(contract.rule, "same_host_clock_all_built_regions_speak_through_composition_and_existing_matter");
assert.equal(contract.hostCycleSeconds, 5.8);
assert.equal(contract.activeFirstSliceRegionCount, 8);
assert.equal(contract.compositionProfileCount, 8);
assert.equal(Object.keys(WORLD_COMPOSITION_PROFILES).length, 8);

const activeRegions = firstSliceRegions.filter((region) => String(region.implementationStatus ?? "").length > 0);
assert.equal(activeRegions.length, 8, "active first-slice region registry count changed");
const activeCells = activeRegions.flatMap((region) => region.runtimeCellIds ?? []);
assert.equal(activeCells.length, 8, "HC028F expects one active runtime cell per built region");

for (const spec of contract.builtRegions) {
  const region = activeRegions.find((entry) => entry.id === spec.regionId);
  assert.ok(region, `missing active built region ${spec.regionId}`);
  assert.deepEqual(region.runtimeCellIds, [spec.cellId], `${spec.regionId} runtime cell changed`);

  const profile = resolveWorldCompositionProfile(spec.cellId);
  assert.ok(profile, `${spec.regionId} must resolve a World Composition profile`);
  assert.equal(profile.id, spec.profileId);
  assert.equal(profile.key.id, spec.key);
  assert.equal(`${profile.meter.beatsPerBar}/${profile.meter.beatUnit}`, spec.meter);
  assert.equal(profile.physical.law, spec.physicalLaw);
  assert.equal(profile.authority.sharedHostClock, true);
  assert.equal(profile.authority.inputTimingGate, false);
  assert.equal(profile.authority.progression, false);
  assert.equal(profile.authority.objective, false);
  assert.equal(profile.authority.routeCompletion, false);
  assert.ok(profile.audio?.voice, `${spec.regionId} needs an authored rhythm/bass voice`);

  const frameState = {
    activeCellId: spec.cellId,
    runtimeSeconds: 0,
    coreEngine: {
      active: true,
      phaseCount: 6,
      architectureId: "paired_6",
      cycleProgress01: 0,
      currentPhaseFunction: profile.meter.functionPattern[0]
    }
  };
  const host = new HostRhythmSystem({ frameState });
  host.init();
  host.update(1 / 60, frameState);
  assert.equal(frameState.hostRhythm.cycleSeconds, 5.8);
  assert.equal(frameState.hostRhythm.composition.active, true);
  assert.equal(frameState.hostRhythm.composition.profileId, spec.profileId);
  assert.equal(frameState.hostRhythm.composition.inputTimingGate, false);
  assert.equal(frameState.hostRhythm.composition.progressionAuthority, false);
  assert.equal(frameState.hostRhythm.composition.objectiveAuthority, false);
  assert.equal(frameState.hostRhythm.composition.routeCompletionAuthority, false);

  const physical = new RegionalPhysicalEmbodimentSystem({ frameState });
  physical.init();
  physical.update(1 / 60, frameState);
  const physicalState = frameState.regionalPhysicalEmbodiment;
  assert.equal(physicalState.active, true, `${spec.regionId} physical bridge inactive`);
  assert.equal(physicalState.profileId, spec.profileId);
  assert.equal(physicalState.law, spec.physicalLaw);
  assert.equal(physicalState.movementAuthority, false);
  assert.equal(physicalState.collisionAuthority, false);
  assert.equal(physicalState.verbAuthority, false);
  assert.equal(physicalState.routeAuthority, false);
  assert.equal(physicalState.progressionAuthority, false);
  assert.equal(physicalState.inputTimingGate, false);
  assert.equal(physicalState.addsClock, false);
  assert.ok(physicalState.driftScale >= 0.80 && physicalState.driftScale <= 1.22);
  assert.ok(physicalState.dampingScale >= 0.82 && physicalState.dampingScale <= 1.24);
  assert.ok(Math.abs(physicalState.radialBias) <= 0.065 + 1e-9);
  assert.ok(Math.abs(physicalState.tangentialBias) <= 0.040 + 1e-9);

  const resonance = new CoreWorldResonanceSystem({ frameState });
  resonance.init();
  resonance.update(1 / 60, frameState);
  assert.equal(frameState.coreWorldResonance.active, true, `${spec.regionId} must participate in Core-World resonance`);
  assert.equal(frameState.coreWorldResonance.worldProfileId, spec.profileId);
  assert.equal(frameState.coreWorldResonance.movementAuthority, false);
  assert.equal(frameState.coreWorldResonance.inputTimingGate, false);
  assert.equal(frameState.coreWorldResonance.gameplayAdvantage, false);
}

// Every built runtime cell is composed, and dormant side cells were not silently
// promoted into the active first-slice region grammar.
for (const cellId of activeCells) assert.ok(resolveWorldCompositionProfile(cellId), `uncomposed built cell: ${cellId}`);
assert.equal(resolveWorldCompositionProfile("CELL_BLOOM_RESIDUE_FORK_001"), null);
assert.equal(resolveWorldCompositionProfile("CELL_GRAVE_SCAR_MEMORY_SEAM_001"), null);

// Vascular keeps the only proven rhythm-derived route-flow presentation range;
// all other region profiles remain neutral to player movement/traversal.
const vascular = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.equal(vascular.movement.minimumFlowScale, 0.96);
assert.equal(vascular.movement.maximumFlowScale, 1.06);
assert.equal(vascular.movement.minimumMoteSpeedScale, 0.92);
assert.equal(vascular.movement.maximumMoteSpeedScale, 1.10);
for (const profile of Object.values(WORLD_COMPOSITION_PROFILES)) {
  if (profile.id === vascular.id) continue;
  assert.equal(profile.movement.flowModulationDepth, 0, `${profile.id} gained movement modulation`);
  assert.equal(profile.movement.minimumFlowScale, 1);
  assert.equal(profile.movement.maximumFlowScale, 1);
  assert.equal(profile.movement.minimumMoteSpeedScale, 1);
  assert.equal(profile.movement.maximumMoteSpeedScale, 1);
}

// Runtime order: Host composition -> physical interpretation -> existing Host
// material. No second material field or geometry owner was added.
const hostIndex = runtime.indexOf('register("hostRhythmSystem"');
const physicalIndex = runtime.indexOf('register("regionalPhysicalEmbodimentSystem"');
const ambientIndex = runtime.indexOf('register("ambientMaterialInteractionSystem"');
assert.ok(hostIndex >= 0 && physicalIndex > hostIndex && ambientIndex > physicalIndex, "regional physical bridge must run between Host rhythm and ambient material");
assert.match(ambient, /frameState\.regionalPhysicalEmbodiment/);
assert.match(ambient, /movementAuthority:\s*false/);
assert.match(ambient, /collisionAuthority:\s*false/);
assert.match(ambient, /progressionAuthority:\s*false/);
assert.match(ambient, /CELL_SCAR_FLOW_FOLD_001/);
assert.match(ambient, /CELL_SIGNAL_CHORUS_NERVE_001/);
assert.match(ambient, /CELL_COMB_THRESHOLD_FILTER_001/);
assert.match(ambient, /CELL_APERTURE_FIELDS_ARRIVAL_001/);
assert.match(audio, /composition\.audioVoice/);
assert.match(audio, /HC027D1_AUDIO_MIX/);
assert.match(audio, /masterGain:\s*0\.82/);

// Gameplay/progression owners are byte locked to the working HC028E parent.
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
assert.equal(jsFiles.length, 98);

console.log("HC028F All Built Region Composition Embodiment: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  builtRegions: contract.builtRegions.map((spec) => ({
    region: spec.regionId,
    profile: spec.profileId,
    key: spec.key,
    meter: spec.meter,
    physicalLaw: spec.physicalLaw
  })),
  lockedOwners: Object.keys(locks.files).length
}, null, 2));
