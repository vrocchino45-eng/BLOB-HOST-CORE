import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027J2] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const input = read("src/input/InputSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027J2.json");
const contract = json("public/data/build/hc027j2VerbPowerCostPhysiologyContract.json");

must(main.includes('buildId: "HC-027J2"'), "runtime identity missing");
must(main.includes('buildLabel: "Verb Power / Cost / Physiology Integration"'), "runtime label missing");
must(pkg.version === "0.27.14", "package version mismatch");
must(identity.id === "HC-027J2" && identity.parent === "HC-027J1", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.law === "committed_verb_strength_cost_control_and_recovery_are_continuous_expressions_of_deep_inner_membrane_topology", "J2 law mismatch");

for (const token of [
  'verbModifiers: {', 'pass: "HC-027J2"',
  'pulseChargeRateMultiplier', 'pulseStructuralReachMultiplier', 'pulseRecoveryBurdenMultiplier', 'pulseEchoClutterMultiplier',
  'absorbPowerMultiplier', 'absorbProgressMultiplier', 'absorbMobilityMultiplier',
  'stabilizeCoherenceMultiplier', 'stabilizeMobilityMultiplier',
  'physiologyProfilesAreContinuousBlends: true', 'arbitraryZoneBuffTableAdded: false'
]) must(radial.includes(token), `radial verb integration missing: ${token}`);

for (const token of [
  'pulsePhysiology = frameState.corePerformance?.verbModifiers?.pulse',
  'effectivePulseChargeThresholdSeconds', 'effectivePulseFullChargeSeconds', 'pulseChargeRateMultiplier: chargeRateMultiplier'
]) must(input.includes(token), `Pulse charge physiology missing: ${token}`);

for (const token of [
  'verbCommitmentMovementScale', 'radialPerformance.verbCommitmentMovementMultiplier',
  'radialVerbCommitmentMovementScale: verbCommitmentMovementScale'
]) must(movement.includes(token), `verb mobility commitment missing: ${token}`);

for (const token of [
  'structuralReachMultiplier', 'echoClutterMultiplier', 'deepEchoLimit', 'recoveryBurdenMultiplier'
]) must(sensory.includes(token), `charged Pulse physiology missing: ${token}`);

for (const token of [
  'absorbPhysiology = frameState.corePerformance?.verbModifiers?.absorb',
  'physiologyRate', 'physiologyPull'
]) must(bond.includes(token), `Absorb physiology missing: ${token}`);

for (const token of [
  'absorbAffordancePower', 'stabilizeCoherence',
  'dt * 0.72 * stabilizeCoherence'
]) must(signal.includes(token), `world affordance physiology missing: ${token}`);

for (const token of ['verbPhysiology', 'enduranceReserve01', 'exertion01']) must(embodiment.includes(token), `exertion language missing: ${token}`);

// Foundation locks.
must(sensory.includes('const localActionableRange = 4.25'), "quick/local Pulse radius changed");
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]'), "3→6→12 engine grammar changed");
must(engine.includes('nonTriadicArchitectureEnabled: false'), "non-triadic architecture enabled");
for (const token of ['masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95', 'ambience: 1.35', 'event: 1.40']) {
  must(audio.includes(token), `HC027D1 audio reference drifted: ${token}`);
}

must(profile.build === "HC-027J2", "inspection profile build mismatch");
must(profile.status === "runtime_active_core_inspection_plus_verb_power_cost_physiology", "inspection profile status mismatch");
must(profile.framing?.verbPowerCostPhysiologyPass === "HC-027J2", "profile J2 framing missing");
must(profile.behavior?.verbPhysiologyUsesContinuousBlend === true, "continuous blend not declared");
must(profile.behavior?.verbPhysiologyUsesArbitraryClassBuffs === false, "arbitrary class buffs enabled");
must(profile.behavior?.hc027j2CreatesNextQuestion === false, "J2 incorrectly owns K");
must(contract.pulse.quick.localActionableRange === 4.25 && contract.pulse.quick.rangeChanged === false, "quick Pulse contract drifted");
must(contract.authority.engineArchitectureChanged === false && contract.authority.progressionChanged === false, "authority drifted");

// Dynamic proof directly against the physiology owner.
const radialUrl = pathToFileURL(path.join(root, "src/player/CoreRadialPerformanceSystem.js")).href;
const { CoreRadialPerformanceSystem } = await import(radialUrl);
const makeFrame = (zone) => ({
  spatialCoreChemistry: {
    retainedPieceCount: 3,
    counts: { deep_core: zone === "deep" ? 3 : 0, inner_body: zone === "inner" ? 3 : 0, membrane: zone === "membrane" ? 3 : 0 },
    topology: { complete: true, id: `${zone}_proof`, label: zone, distribution: zone === "deep" ? "3:0:0" : zone === "inner" ? "0:3:0" : "0:0:3", dominantZone: zone === "deep" ? "deep_core" : zone === "inner" ? "inner_body" : "membrane" }
  },
  input: { pulseEventId: 0, pulseReleaseCharge01: 0, absorbHeld: false, stabilizeHeld: false, boostHeld: false }
});
const sample = (zone, verb) => {
  const frame = makeFrame(zone);
  const root = { userData: {} };
  const sys = new CoreRadialPerformanceSystem({ frameState: frame, playerRoot: root });
  sys.init();
  if (verb === "absorb") frame.input.absorbHeld = true;
  if (verb === "stabilize") frame.input.stabilizeHeld = true;
  for (let i = 0; i < 25; i += 1) sys.update(0.08, frame);
  return frame.corePerformance;
};
const deep = sample("deep", "absorb");
const inner = sample("inner", "absorb");
const membrane = sample("membrane", "absorb");
must(deep.endurance.reserve01 > inner.endurance.reserve01 && inner.endurance.reserve01 > membrane.endurance.reserve01, "Absorb reserve ordering is not Deep > Inner > Membrane");
must(membrane.verbModifiers.pulse.chargeRateMultiplier > inner.verbModifiers.pulse.chargeRateMultiplier && inner.verbModifiers.pulse.chargeRateMultiplier > deep.verbModifiers.pulse.chargeRateMultiplier, "Pulse charge rate ordering incorrect");
must(membrane.verbModifiers.absorb.powerMultiplier > inner.verbModifiers.absorb.powerMultiplier && inner.verbModifiers.absorb.powerMultiplier > deep.verbModifiers.absorb.powerMultiplier, "Absorb output ordering incorrect");
const pulseSample = (zone) => {
  const frame = makeFrame(zone);
  const root = { userData: {} };
  const sys = new CoreRadialPerformanceSystem({ frameState: frame, playerRoot: root });
  sys.init();
  frame.input.pulseEventId = 1;
  frame.input.pulseReleaseCharge01 = 1;
  for (let i = 0; i < 8; i += 1) { sys.update(0.08, frame); frame.input.pulseReleaseCharge01 = 0; }
  return frame.corePerformance;
};
const deepPulse = pulseSample("deep");
const innerPulse = pulseSample("inner");
const membranePulse = pulseSample("membrane");
must(deepPulse.endurance.reserve01 > innerPulse.endurance.reserve01 && innerPulse.endurance.reserve01 > membranePulse.endurance.reserve01, "charged Pulse reserve ordering is not Deep > Inner > Membrane");

const deepStab = sample("deep", "stabilize");
const innerStab = sample("inner", "stabilize");
const membraneStab = sample("membrane", "stabilize");
must(deepStab.verbModifiers.stabilize.coherenceMultiplier > innerStab.verbModifiers.stabilize.coherenceMultiplier && innerStab.verbModifiers.stabilize.coherenceMultiplier > membraneStab.verbModifiers.stabilize.coherenceMultiplier, "Stabilize coherence ordering incorrect");
must(deepStab.endurance.reserve01 > innerStab.endurance.reserve01 && innerStab.endurance.reserve01 > membraneStab.endurance.reserve01, "Stabilize reserve ordering is not Deep > Inner > Membrane");

const sourceFiles = [];
const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full); } };
walk(path.join(root, "src"));
must(sourceFiles.length === 92, `expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027J2 Verb Power / Cost / Physiology Integration");
console.log(`  Deep Absorb reserve ${deep.endurance.reservePercent}% > Inner ${inner.endurance.reservePercent}% > Membrane ${membrane.endurance.reservePercent}%`);
console.log(`  Pulse charge rate: Deep x${deep.verbModifiers.pulse.chargeRateMultiplier} / Inner x${inner.verbModifiers.pulse.chargeRateMultiplier} / Membrane x${membrane.verbModifiers.pulse.chargeRateMultiplier}; charged reserve ${deepPulse.endurance.reservePercent}% / ${innerPulse.endurance.reservePercent}% / ${membranePulse.endurance.reservePercent}%`);
console.log(`  Absorb power: Deep x${deep.verbModifiers.absorb.powerMultiplier} / Inner x${inner.verbModifiers.absorb.powerMultiplier} / Membrane x${membrane.verbModifiers.absorb.powerMultiplier}`);
console.log(`  Stabilize coherence: Deep x${deepStab.verbModifiers.stabilize.coherenceMultiplier} / Inner x${innerStab.verbModifiers.stabilize.coherenceMultiplier} / Membrane x${membraneStab.verbModifiers.stabilize.coherenceMultiplier}`);
console.log("  quick Pulse remains 4.25; HC027D1 mix and 3→6→12 remain locked");
