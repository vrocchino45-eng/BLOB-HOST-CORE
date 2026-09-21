import fs from "node:fs";
import assert from "node:assert/strict";
import { CoreVerbEngineCouplingSystem } from "../src/player/CoreVerbEngineCouplingSystem.js";
import { WORLD_COMPOSITION_PROFILES } from "../src/world/WorldCompositionRegistry.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const engine = read("src/player/CoreEngineSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const couplingSource = read("src/player/CoreVerbEngineCouplingSystem.js");
const resonance = read("src/world/CoreWorldResonanceSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const controls = read("src/input/ControlMap.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC028D1.json");
const contract = json("public/data/build/hc028d1VerbEngineCouplingContract.json");
const pkg = json("package.json");

assert.match(main, /buildId:\s*"HC-028D1"/);
assert.match(main, /Verb-Engine Coupling/);
assert.equal(pkg.version, "0.28.7");
assert.equal(identity.parent, "HC-028D");
assert.equal(identity.sourceJsCount, 96);

for (const token of [
  'const FUNCTIONS = ["pulse", "absorb", "stabilize"]',
  'const ARCHITECTURE_ORDER = [3, 6, 12]',
  'architectureDebugCycleCommand: "O"',
  'gameplayAuthority: false',
  'verbAuthority: false',
  'movementAuthority: false'
]) assert.ok(engine.includes(token), `Core engine truth drifted: ${token}`);

for (const token of [
  "CoreVerbEngineCouplingSystem",
  'chord === "full_system"',
  'return "cohere_project"',
  'return "cohere_draw"',
  'return "exchange"',
  'readOnlyBridge: true',
  'verbPowerAuthority: false',
  'controllerMappingAuthority: false',
  'aButtonAuthority: false',
  'verbs_visibly_route_through_core_engine_planes_without_changing_gameplay_strength'
]) assert.ok(couplingSource.includes(token), `coupling contract token missing: ${token}`);

assert.match(runtime, /register\("coreEngineSystem"[\s\S]*register\("coreWorldResonanceSystem"[\s\S]*register\("coreVerbEngineCouplingSystem"[\s\S]*register\("coreGrowthSystem"/);
for (const token of [
  "coreEngineVerbConduits",
  "coreEngineVerbTransitNodes",
  "pulse_outward_absorb_inward_stabilize_coheres_same_gyroscopic_engine",
  "pulseEngineDrive",
  "absorbEngineDrive",
  "stabilizeEngineDrive"
]) assert.ok(embodiment.includes(token), `embodiment coupling token missing: ${token}`);

// HC028D remains presentation-only and must not be absorbed by D1.
for (const token of [
  'readOnlyBridge: true',
  'engineRetiming: false',
  'gameplayAdvantage: false',
  'core_and_world_can_visibly_entrain_without_becoming_a_rhythm_gate'
]) assert.ok(resonance.includes(token), `HC028D resonance truth drifted: ${token}`);

// A remains the existing generic interact owner in D1; deliberate Commit is D2 scope.
assert.match(controls, /interact:\s*"A — interact in World\/Core Inspection; Core Work grab-place"/);
assert.match(controls, /const interact = button\(0\)/);
assert.ok(!couplingSource.includes("interactPressed"), "D1 coupling may not consume A/interact");

// Inherited movement/transition safety stays present.
assert.match(movement, /resolveConvergenceReachability/);
assert.match(movement, /environmentScale = 1 - envelope01 \* 0\.82/);
assert.match(morph, /completed Vascular\/Silt return folds own their transition/);
const profile = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.equal(profile.movement.minimumFlowScale, 0.96);
assert.equal(profile.movement.maximumFlowScale, 1.06);
assert.equal(profile.authority.inputTimingGate, false);
assert.equal(profile.authority.routeCompletion, false);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.4/);
assert.match(telemetry, /core\.verb_engine\.chord_changed/);

// Dynamic proof: coupling observes input + engine without mutating either.
const frameState = {
  input: {
    pulseEventId: 0,
    pulsePressed: false,
    pulseHeld: false,
    pulseCharge01: 0,
    pulseReleaseCharge01: 0,
    pulseReleaseKind: "none",
    absorbHeld: false,
    stabilizeHeld: false,
    resonanceHeld: false
  },
  coreEngine: {
    active: true,
    architectureId: "triadic_3",
    phaseCount: 3,
    currentPhaseFunction: "pulse"
  }
};
const coupling = new CoreVerbEngineCouplingSystem({ frameState });
coupling.init();
const updateAndProtect = () => {
  const inputBefore = JSON.stringify(frameState.input);
  const engineBefore = JSON.stringify(frameState.coreEngine);
  coupling.update(1 / 60, frameState);
  assert.equal(JSON.stringify(frameState.input), inputBefore, "coupling must not mutate input");
  assert.equal(JSON.stringify(frameState.coreEngine), engineBefore, "coupling must not mutate Core engine");
  assert.equal(frameState.coreVerbEngineCoupling.verbPowerAuthority, false);
  assert.equal(frameState.coreVerbEngineCoupling.movementAuthority, false);
  assert.equal(frameState.coreVerbEngineCoupling.aButtonAuthority, false);
};

updateAndProtect();
assert.equal(frameState.coreVerbEngineCoupling.chord, "idle");

frameState.input.pulseEventId = 1;
frameState.input.pulsePressed = true;
frameState.input.pulseReleaseKind = "quick";
updateAndProtect();
assert.equal(frameState.coreVerbEngineCoupling.chord, "project");
assert.ok(frameState.coreVerbEngineCoupling.functionDrive.pulse > frameState.coreVerbEngineCoupling.functionDrive.absorb);

frameState.input.pulsePressed = false;
frameState.input.stabilizeHeld = true;
frameState.input.resonanceHeld = true;
updateAndProtect();
assert.equal(frameState.coreVerbEngineCoupling.chord, "cohere_project");

for (let i = 0; i < 50; i += 1) updateAndProtect();
frameState.input.absorbHeld = true;
updateAndProtect();
assert.equal(frameState.coreVerbEngineCoupling.chord, "cohere_draw");
assert.ok(frameState.coreVerbEngineCoupling.functionDrive.absorb > 0);
assert.ok(frameState.coreVerbEngineCoupling.functionDrive.stabilize > 0);

frameState.input.pulseHeld = true;
frameState.input.pulseCharge01 = 0.8;
updateAndProtect();
assert.equal(frameState.coreVerbEngineCoupling.chord, "full_system");
assert.equal(frameState.coreVerbEngineCoupling.activeFunctionCount, 3);

assert.equal(contract.authority.engineSequencing, false);
assert.equal(contract.authority.verbPower, false);
assert.equal(contract.authority.movement, false);
assert.equal(contract.authority.aButton, false);
assert.equal(contract.authority.presentation, true);

const jsFiles = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 96);

console.log("HC028D1 Verb-Engine Coupling: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  chord: frameState.coreVerbEngineCoupling.chord,
  functionDrive: frameState.coreVerbEngineCoupling.functionDrive,
  authorities: contract.authority
}, null, 2));
