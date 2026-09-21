import fs from "node:fs";
import assert from "node:assert/strict";
import { HostRhythmSystem } from "../src/world/HostRhythmSystem.js";
import { CoreWorldResonanceSystem } from "../src/world/CoreWorldResonanceSystem.js";
import { WORLD_COMPOSITION_PROFILES } from "../src/world/WorldCompositionRegistry.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const engine = read("src/player/CoreEngineSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const vascular = read("src/routes/VascularRhythmRouteSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC028D.json");
const contract = json("public/data/build/hc028dCoreWorldResonanceContract.json");
const pkg = json("package.json");

assert.match(main, /buildId:\s*"HC-028D"/);
assert.match(main, /Core-World Resonance Foundation/);
assert.equal(pkg.version, "0.28.6");
assert.equal(identity.parent, "HC-028C2");
assert.equal(identity.sourceJsCount, 95);

for (const token of [
  'const FUNCTIONS = ["pulse", "absorb", "stabilize"]',
  'const ARCHITECTURE_ORDER = [3, 6, 12]',
  'architectureDebugCycleCommand: "O"',
  'gameplayAuthority: false',
  'verbAuthority: false',
  'movementAuthority: false'
]) assert.ok(engine.includes(token), `Core engine truth drifted: ${token}`);

for (const token of [
  'CoreWorldResonanceSystem',
  'readOnlyBridge: true',
  'engineRetiming: false',
  'gameplayAdvantage: false',
  'core_and_world_can_visibly_entrain_without_becoming_a_rhythm_gate'
]) assert.ok(read("src/world/CoreWorldResonanceSystem.js").includes(token), `resonance bridge token missing: ${token}`);

assert.match(runtime, /register\("coreEngineSystem"[\s\S]*register\("coreWorldResonanceSystem"[\s\S]*register\("coreGrowthSystem"/);
assert.match(embodiment, /worldResonance/);
assert.match(embodiment, /resonancePrecessionScale/);
assert.match(embodiment, /world_relationship_modulates_gyro_readability_not_engine_truth/);
assert.match(vascular, /worldReplyStrength/);
assert.match(vascular, /presentationOnly: true/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.3/);
assert.match(telemetry, /core\.world_resonance\.changed/);

const profile = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.equal(profile.key.id, "P-S-A");
assert.equal(profile.meter.beatsPerBar, 4);
assert.equal(profile.movement.minimumFlowScale, 0.96);
assert.equal(profile.movement.maximumFlowScale, 1.06);
assert.equal(profile.authority.inputTimingGate, false);
assert.equal(profile.authority.routeCompletion, false);
assert.equal(contract.authority.engineRetiming, false);
assert.equal(contract.authority.movement, false);
assert.equal(contract.authority.gameplayAdvantage, false);

// Dynamic proof: same Vascular composition + synthetic Core engine states must
// produce bounded relationship state without modifying either input object.
const frameState = {
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
  runtimeSeconds: 0,
  coreEngine: { active:true, phaseCount:3, phasesPerFunction:1, architectureId:"triadic_3", cycleProgress01:0, currentPhaseFunction:"pulse" }
};
const rhythm = new HostRhythmSystem({ frameState });
rhythm.init();
const resonance = new CoreWorldResonanceSystem({ frameState });
resonance.init();
for (let i=0;i<120;i+=1) {
  frameState.runtimeSeconds = i / 60;
  rhythm.update(1/60, frameState);
  const c = frameState.coreEngine;
  c.cycleProgress01 = (i / 47) % 1;
  const idx = Math.floor(c.cycleProgress01 * c.phaseCount) % c.phaseCount;
  c.currentPhaseFunction = ["pulse","absorb","stabilize"][idx % 3];
  const engineBefore = JSON.stringify(frameState.coreEngine);
  const compositionBefore = JSON.stringify(frameState.hostRhythm.composition);
  resonance.update(1/60, frameState);
  assert.equal(JSON.stringify(frameState.coreEngine), engineBefore, "resonance bridge must not retime/mutate Core engine");
  assert.equal(JSON.stringify(frameState.hostRhythm.composition), compositionBefore, "resonance bridge must not mutate world composition");
  assert.ok(frameState.coreWorldResonance.coherence01 >= 0 && frameState.coreWorldResonance.coherence01 <= 1);
  assert.equal(frameState.coreWorldResonance.movementAuthority, false);
  assert.equal(frameState.coreWorldResonance.inputTimingGate, false);
}
assert.ok(["aligned","resolving","oscillating","strained","opposed"].includes(frameState.coreWorldResonance.relationshipState));
assert.equal(frameState.coreWorldResonance.worldKeyId, "P-S-A");

// Inherited reachability/transition repair must remain present.
assert.match(movement, /resolveConvergenceReachability/);
assert.match(movement, /environmentScale = 1 - envelope01 \* 0\.82/);
assert.match(morph, /completed Vascular\/Silt return folds own their transition/);
assert.match(vascular, /Follow the gold return current into the open entry fold/);

const jsFiles=[];
const walk=(dir)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=`${dir}/${e.name}`; if(e.isDirectory()) walk(full); else if(e.isFile()&&full.endsWith('.js')) jsFiles.push(full);}};
walk('src');
assert.equal(jsFiles.length,95);

console.log("HC028D Core-World Resonance Foundation: PASS");
console.log(JSON.stringify({ build:identity.id, runtimeSourceCount:jsFiles.length, relationship:frameState.coreWorldResonance.relationshipState, coherence01:frameState.coreWorldResonance.coherence01, worldKey:frameState.coreWorldResonance.worldKeyId, meter:frameState.coreWorldResonance.worldMeter, authority:contract.authority }, null, 2));
