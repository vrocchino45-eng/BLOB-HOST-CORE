import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => fs.readFileSync(p, 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert = (ok, msg) => { if (!ok) throw new Error(`[HC031T5] ${msg}`); };

const ridge = read('src/fields/MembraneRidgeGameplaySystem.js');
const adjacent = read('src/fields/ApertureAdjacentTerritorySystem.js');
const arrival = read('src/fields/ApertureFieldsArrivalSystem.js');
const runtime = read('src/core/GameRuntime.js');
const telemetry = read('src/core/SessionTelemetrySystem.js');
const guide = read('src/guide/GuidePromptSystem.js');
const hud = read('src/ui/PlaytestHudSystem.js');
const main = read('src/main.js');
const pkg = JSON.parse(read('package.json'));

assert(main.includes('buildId: "HC-031T5"'), 'main build ID must be HC-031T5');
assert(main.includes('buildLabel: "Ridge Trace + Canonical Gathering Ground Lock"'), 'main label must identify the T5 lock');
assert(pkg.version === '0.31.46', 'package version must be 0.31.46');
assert(telemetry.includes('blob.session.telemetry.v1.46'), 'telemetry schema must be v1.46');

// Ridge correctness: independent reads, physical path length, no frame-rate minimum step.
assert(ridge.includes('contourOrderPolicy: "any_order_all_three_required"'), 'Ridge must explicitly allow any contour order');
assert(ridge.includes('tracingBand.traceDistance += moved'), 'Ridge must accumulate physical path length');
assert(ridge.includes('frameState.input?.moveX'), 'Ridge deliberate movement gate must use canonical InputSystem axes');
assert(ridge.includes('frameState.input?.moveY'), 'Ridge must read vertical movement intent');
assert(ridge.includes('frameState.input?.moveZ'), 'Ridge must read depth movement intent');
assert(!ridge.includes('moved >= 0.012'), 'old frame-dependent minimum displacement gate must be removed');
assert(ridge.includes('this.bands.filter((band) => band.read).length'), 'completion must derive from all three independently read contours');
assert(ridge.includes('readSequence += 1'), 'each contour read must expose a sequence for telemetry');

// Canonical Gathering Ground: the pre-existing visible landmark is the only semantic root.
assert(arrival.includes('{ id: "gathering_ground_cluster", p: [3.5, 8.5, -56.0]'), 'original visible Gathering Ground landmark must remain at z=-56');
assert(arrival.includes('getLandmarkMesh(id)'), 'Arrival owner must expose canonical landmark lookup');
assert(arrival.includes('mesh.userData.canonicalGatheringGround = true'), 'visible landmark must be marked canonical');
assert(adjacent.includes('this.territoryLocal = new THREE.Vector3(3.5, 8.5, -56.0)'), 'adjacent system must share the canonical z=-56 center');
assert(adjacent.includes('this.apertureFieldsArrivalSystem.getLandmarkMesh(TERRITORY_ID)'), 'adjacent system must resolve the existing visible landmark');
assert(adjacent.includes('root: this.canonicalLandmark'), 'world attention candidate must root on the canonical visible landmark');
assert(!adjacent.includes('gathering_ground_adjacent_ghost_body'), 'duplicate Gathering Ground ghost body must be deleted');
assert(!adjacent.includes('new THREE.Vector3(3.5, 8.5, -62.0)'), 'old duplicate z=-62 gameplay center must be deleted');
assert(runtime.includes('apertureFieldsArrivalSystem: this.apertureFieldsArrivalSystem'), 'runtime must inject the canonical landmark owner');

// Debug/telemetry truth must no longer require inference from screenshots.
assert(telemetry.includes('world.membrane_ridge.contour_read'), 'telemetry must record each contour read');
assert(telemetry.includes('world.membrane_ridge.completed'), 'telemetry must record Ridge completion');
assert(telemetry.includes('membraneRidgeContourReads'), 'summary must expose Ridge contour-read count');
assert(telemetry.includes('ridgeState: {'), 'movement samples must carry Ridge state');
assert(telemetry.includes('adjacentTerritoryState: {'), 'movement samples must carry adjacent territory state');
assert(hud.includes('RIDGE ${membraneRidgeGameplay.readCount ?? 0}/${membraneRidgeGameplay.contourCount ?? 3}'), 'HUD must expose explicit Ridge read count');
assert(guide.includes('order does not matter'), 'Guide must tell the player contour order is not hidden');

const locked = {
  'src/player/PlayerMovementController.js': '9c0542b4606fdfa3e9ef35e4bb8b6eafb4b1c86845a3ed594caed629fc913f4b',
  'src/fields/SignalPlainEcologySystem.js': '27d2d083fa76939192030026db8eeb05227696c4f3762074bb36256e702a0783',
  'src/targeting/TargetingSystem.js': '79471a29027a34ffebce629019753ef301717b27838693859eaa249ff632f0b3',
  'src/targeting/TargetFocusRegistry.js': 'aa77f0274aedebbcaeb664ddceec2365e88d93f3cf42672cab33c41240050e73',
  'src/input/InputSystem.js': '5117dc831d6dcc5be0fd9f38fc58c6a8eb125dd6f30a34c910d6ea07e669c0f1',
  'src/chemistry/ChemObjectSystem.js': '36b50b3cbd7137fc6d7d6686795cec279e69b7200504f2bf040fe73a00a21e04',
  'src/systems/ObjectiveSystem.js': 'b1a51a0bcbbecd17d77597f0a0673fabba7b2c101aaf2b04b2d03b7814c44b29'
};

for (const [path, expected] of Object.entries(locked)) {
  assert(fs.existsSync(path), `locked owner missing: ${path}`);
  assert(sha(path) === expected, `locked owner changed unexpectedly: ${path}`);
}

console.log('[HC031T5] PASS — Ridge reads physical path length in any order and Gathering Ground has one canonical visible/attention identity.');
