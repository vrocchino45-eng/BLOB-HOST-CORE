import fs from 'node:fs';
import assert from 'node:assert/strict';
const targeting = fs.readFileSync('src/targeting/TargetingSystem.js','utf8');
const commitment = fs.readFileSync('src/input/DeliberateCommitmentSystem.js','utf8');
for (const token of ['createOpenAimGlyph()', 'updateExplicitAimLock(frameState)', 'frameState.cameraAimLock', 'a_locked_camera_candidate', 'a_released_lock', 'candidate.aimDot']) assert.ok(targeting.includes(token), `missing ${token}`);
assert.ok(commitment.includes('!(input.stabilizeHeld || input.resonanceHeld)'), 'A commitment must be suppressed while aiming');
console.log('LS1D1C static camera-aim contract: PASS (not gameplay proof)');
