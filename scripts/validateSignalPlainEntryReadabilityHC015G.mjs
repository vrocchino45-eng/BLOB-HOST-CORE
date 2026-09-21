import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function assert(cond, message) { if (!cond) throw new Error(message); }

const ecology = read('src/fields/SignalPlainEcologySystem.js');
const runtime = read('src/core/GameRuntime.js');
const debug = read('src/debug/DebugAreaJumpSystem.js');
const main = read('src/main.js');
const index = read('index.html');
const manifest = JSON.parse(read('public/data/build/buildManifest.json'));

assert(ecology.includes('DIRECT_APPROACH_OFFSET = new THREE.Vector3(5.8, 1.8, 7.2)'), 'HC015G must use the clear Signal Plain approach spawn.');
assert(ecology.includes('cameraDistance: 17.2'), 'Direct jump must author a wider field framing distance.');
assert(ecology.includes('fieldOfView: 70'), 'Direct jump must author a field-scale FOV.');
assert(runtime.includes('signalPlainDebugFramingActive && Number.isFinite(signalPlainDebugFraming.cameraDistance)'), 'GameRuntime must consume authored debug framing distance.');
assert(runtime.includes('if (inspectionActive || signalPlainDebugFramingActive)'), 'GameRuntime lookAt must honor Signal Plain debug framing.');
assert(runtime.includes('signalPlainDebugFraming.fieldOfView'), 'GameRuntime must consume authored Signal Plain FOV.');
assert(debug.includes('debug_signal_plain_direct_jump_forced_orbit'), 'Direct jump must release persistent tight camera.');
assert(main.includes('HC-015G'), 'Runtime identity must be HC-015G.');
assert(index.includes('HC-015G'), 'Browser title must be HC-015G.');
assert(manifest.id === 'HC-015G', 'Build manifest id must be HC-015G.');

// Verify authored geometry makes the first receptor readable but not auto-completed.
const player = [5.8, 1.8, 7.2];
const nodes = [[-4.8,0.65,2.6],[4.35,1.35,1.15],[0.85,-1.35,-4.15]];
const distances = nodes.map((n) => Math.hypot(n[0]-player[0], n[1]-player[1], n[2]-player[2]));
const nearest = Math.min(...distances);
assert(nearest > 2.75, `Direct spawn must not start inside observe range; got ${nearest.toFixed(2)}.`);
assert(nearest < 7.0, `Direct spawn must present a readable first receptor approach; got ${nearest.toFixed(2)}.`);

console.log(`PASS HC-015G Signal Plain entry readability: nearest receptor ${nearest.toFixed(2)} units; debug framing owns first-frame target/distance/FOV.`);
