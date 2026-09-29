import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => fs.readFileSync(p, 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert = (ok, msg) => { if (!ok) throw new Error(`[HC031T3] ${msg}`); };

const adjacent = read('src/fields/ApertureAdjacentTerritorySystem.js');
const ridge = read('src/fields/MembraneRidgeGameplaySystem.js');
const guide = read('src/guide/GuidePromptSystem.js');
const objective = read('src/systems/ObjectiveSystem.js');
const main = read('src/main.js');
const pkg = JSON.parse(read('package.json'));
const locks = JSON.parse(read('public/data/build/hc031t3LockedHashes.json'));

assert(main.includes('buildId: "HC-031T3"'), 'main build ID must be HC-031T3');
assert(pkg.version === '0.31.44', 'package version must be 0.31.44');
assert(ridge.includes('this.completionBurst = 1'), 'third contour must start a completion burst');
assert(ridge.includes('nextGameplayImplemented: true'), 'Ridge must no longer advertise the continuation as unimplemented');
assert(ridge.includes('adjacent_open_territory_continuation'), 'Ridge must identify Gathering Ground as active continuation');
assert(adjacent.includes('membrane_ridge_completion_release_'), 'release-wave geometry must exist');
assert(adjacent.includes('this.openResponse = 1'), 'traversal opening must start the world release response');
assert(adjacent.includes('worldReleaseReadable: this.traversalOpened'), 'world release state must publish explicitly');
assert(adjacent.includes('ridge_release_wave_connective_flare_gathering_answer'), 'completion reaction must identify the visible causal chain');
assert(guide.includes('The membrane releases. The living connection ahead is now open'), 'Guide must explicitly announce the opened physical connection');
assert(objective.includes('adjacent_territory_world_release_readable'), 'Objective state must expose world-release readability');
assert(objective.includes('world_release_open'), 'Objective continuation state must represent the opened world');

for (const [path, expected] of Object.entries(locks)) {
  assert(fs.existsSync(path), `locked owner missing: ${path}`);
  assert(sha(path) === expected, `locked owner changed unexpectedly: ${path}`);
}

console.log('[HC031T3] PASS — Ridge completion now produces an explicit world release while locked movement/targeting/world-anchor owners remain unchanged.');
