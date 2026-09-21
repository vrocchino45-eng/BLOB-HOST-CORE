import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { HostRhythmSystem } from "../src/world/HostRhythmSystem.js";
import { WORLD_COMPOSITION_PROFILES } from "../src/world/WorldCompositionRegistry.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const engine = read("src/player/CoreEngineSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const host = read("src/world/HostRhythmSystem.js");
const registry = read("src/world/WorldCompositionRegistry.js");
const vascular = read("src/routes/VascularRhythmRouteSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028C2.json");
const contract = json("public/data/build/hc028c2GyroPhaseAccentGrammarContract.json");
const lockedHashes = json("public/data/build/hc028c2LockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-028C2"/);
assert.match(main, /Gyroscopic Phase Engine \+ Vascular Accent Grammar/);
assert.equal(pkg.version, "0.28.5");
assert.equal(identity.parent, "HC-028C1");
assert.equal(identity.sourceJsCount, 94);

// HC027B engine truth stays authoritative and byte-locked through the hash file.
for (const token of [
  'const FUNCTIONS = ["pulse", "absorb", "stabilize"]',
  'const ARCHITECTURE_ORDER = [3, 6, 12]',
  'one_phase_per_function',
  'paired_counterpart_phases_per_function',
  'four_phase_resolution_per_function',
  'architectureDebugCycleCommand: "O"',
  'gameplayAuthority: false',
  'progressionAuthority: false'
]) assert.ok(engine.includes(token), `locked engine law missing: ${token}`);

// The flat equatorial polygon metaphor is retired from the live Core visual.
for (const forbidden of [
  'triangle_to_hexagon_to_dodecagon',
  '3_triangle_6_hexagon_12_dodecagon',
  'core_engine_architecture_silhouette',
  'coreEngineArchitectureLinePositions'
]) assert.ok(!embodiment.includes(forbidden), `retired flat phase visual still present: ${forbidden}`);

for (const token of [
  'visualGrammar = "spherical_triadic_gyroscope_3_6_12"',
  'hasFixedTopBottom = false',
  'core_engine_gyro_plane_',
  'gyroscopicPlane = true',
  'const phasesPerFunction = Math.max(1, Math.round(phaseCount / 3))',
  'const architectureImpulse = phaseCount === 3 ? 1 : phaseCount === 6 ? 0.62 : 0.34',
  'const architectureWobble = phaseCount === 3 ? 0.15 : phaseCount === 6 ? 0.075 : 0.028',
  'const stabilizeCoherence = THREE.MathUtils.clamp(this.stabilizeVisualCommitment ?? 0, 0, 1)',
  '"tri_axial_single_fire"',
  '"tri_axial_opposed_pairs"',
  '"tri_axial_four_phase_resolution"',
  'coreEngineVisualHasFixedTopBottom = false'
]) assert.ok(embodiment.includes(token), `gyroscopic phase visual law missing: ${token}`);

assert.equal(contract.phaseEngine.orthogonalPlaneCount, 3);
assert.equal(contract.phaseEngine.hasFixedTopBottom, false);
assert.deepEqual(contract.phaseEngine.architectures.map((a) => a.phaseCount), [3, 6, 12]);
assert.deepEqual(contract.phaseEngine.architectures.map((a) => a.phasesPerFunction), [1, 2, 4]);
assert.equal(contract.phaseEngine.gameplayAuthority, false);

// HC028C2 makes perceptual accent stronger without changing the HC028C movement accent/force law.
const profile = WORLD_COMPOSITION_PROFILES.vascular_psa_44_micro;
assert.deepEqual(profile.meter.accentPattern, [1.0, 0.28, 0.64, 0.22]);
assert.deepEqual(profile.meter.movementAccentPattern, [1.0, 0.42, 0.68, 0.46]);
assert.deepEqual(profile.meter.functionPattern, ["pulse", "stabilize", "absorb", "stabilize"]);
assert.deepEqual(profile.meter.accentRolePattern, ["transmit_downbeat", "catch_hold", "receive_draw", "settle_prepare"]);
assert.equal(profile.movement.minimumFlowScale, 0.96);
assert.equal(profile.movement.maximumFlowScale, 1.06);
assert.equal(profile.authority.inputTimingGate, false);
assert.equal(profile.authority.progression, false);
assert.equal(profile.authority.routeCompletion, false);
assert.match(host, /movementAccentStrength/);
assert.match(host, /stronger perceptual accents must not secretly increase traversal/);
assert.match(vascular, /1_transmit_2_catch_3_receive_4_settle/);
assert.match(vascular, /movementAuthorityChanged: false/);
assert.match(audio, /articulation = beatNumber === 1/);
assert.match(audio, /bus: "ambience"/);

const frameState = { activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001", runtimeSeconds: 0 };
const rhythm = new HostRhythmSystem({ frameState });
rhythm.init();
const beatSeconds = 5.8 / 8;
const reads = [];
for (let beat = 0; beat < 4; beat += 1) {
  frameState.runtimeSeconds = beat * beatSeconds + 0.001;
  rhythm.update(beatSeconds, frameState);
  const c = frameState.hostRhythm.composition;
  reads.push({ beat: c.beatNumber, fn: c.currentFunction, role: c.accentRole, perceptual: c.accentStrength, movement: c.movementAccentStrength, flow: c.flowScale });
}
assert.deepEqual(reads.map((r) => r.beat), [1, 2, 3, 4]);
assert.deepEqual(reads.map((r) => r.fn), ["pulse", "stabilize", "absorb", "stabilize"]);
assert.deepEqual(reads.map((r) => r.role), ["transmit_downbeat", "catch_hold", "receive_draw", "settle_prepare"]);
assert.ok(reads[0].perceptual > reads[2].perceptual && reads[2].perceptual > reads[1].perceptual && reads[1].perceptual > reads[3].perceptual);
for (const r of reads) assert.ok(r.flow >= 0.96 && r.flow <= 1.06, `flow escaped HC028C range: ${r.flow}`);

// HC028B1 progression/reachability protections remain present.
assert.match(movement, /resolveConvergenceReachability/);
assert.match(movement, /environmentScale = 1 - envelope01 \* 0\.82/);
assert.match(morph, /completed Vascular\/Silt return folds own their transition/);
assert.match(vascular, /Follow the gold return current into the open entry fold/);

// Locked non-presentation/gameplay owners must remain byte-identical to the parent tree.
for (const [file, expected] of Object.entries(lockedHashes.files)) {
  assert.equal(hash(file), expected, `locked owner drifted after HC028C2 metadata was authored: ${file}`);
}

const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 94, "HC028C2 must not add another runtime source module");

console.log("HC028C2 Gyroscopic Phase Engine + Vascular Accent Grammar: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  phaseRead: contract.phaseEngine.architectures.map((a) => `${a.phaseCount}:${a.motion}`),
  fixedTopBottom: contract.phaseEngine.hasFixedTopBottom,
  vascularMeter: contract.vascularAccentGrammar.meter,
  vascularTempoBpm: contract.vascularAccentGrammar.tempoBpm,
  accentRoles: contract.vascularAccentGrammar.accentRoles,
  perceptualPattern: contract.vascularAccentGrammar.perceptualAccentPattern,
  movementPatternLocked: contract.vascularAccentGrammar.movementAccentPattern,
  flowScaleRange: contract.vascularAccentGrammar.movementFlowScaleRange
}, null, 2));
