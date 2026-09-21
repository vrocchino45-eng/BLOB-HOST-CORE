import fs from 'node:fs';
import assert from 'node:assert/strict';

const hud = fs.readFileSync(new URL('../src/ui/PlaytestHudSystem.js', import.meta.url), 'utf8');
const jump = fs.readFileSync(new URL('../src/debug/DebugAreaJumpSystem.js', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../src/core/GameRuntime.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(hud, /const inApertureFields = activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001"/);
assert.match(hud, /BLOB \/\/ HOST CORE \/\/ SIGNAL PLAIN/);
assert.match(hud, /BLOB \/\/ HOST CORE \/\/ APERTURE FIELDS/);
assert.match(hud, /BLOB \/\/ HOST CORE \/\/ COMB THRESHOLD/);
assert.match(hud, /Aperture \/ Signal Plain:/);
assert.match(jump, /debug_signal_plain_direct_jump_forced_orbit/);
assert.match(jump, /frameState\.activeCellId = target\.cellId/);
assert.match(jump, /debugSignalPlainJumpRequest = \{ pending: true/);
assert.match(runtime, /inspectionCameraSystem: this\.inspectionCameraSystem/);
assert.match(index, /HC-015F — Player Perception \/ Visual Hierarchy — HOTFIX2/);

console.log('PASS HC-015F HOTFIX2 direct-jump first-frame ownership/HUD regression');
