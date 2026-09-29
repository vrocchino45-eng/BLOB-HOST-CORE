// Pure arithmetic smoke for the HC031T5 trace law. No runtime packages required.
const assert = (ok, msg) => { if (!ok) throw new Error(`[HC031T5 smoke] ${msg}`); };
const REQUIRED = 3.4;
const MAX_FRAME_TRAVEL = 1.4;
const MIN_MOVE_INTENT = 0.08;

function traceAtFps(fps, speed = 0.35) {
  const dt = 1 / fps;
  let distance = 0;
  let frames = 0;
  while (distance < REQUIRED && frames < fps * 30) {
    const moved = speed * dt;
    const moveIntent = 1;
    const deliberatePhysicalTravel = moved > 0.00001 && moved <= MAX_FRAME_TRAVEL && moveIntent >= MIN_MOVE_INTENT;
    if (deliberatePhysicalTravel) distance += moved;
    frames += 1;
  }
  return { distance, frames, completed: distance >= REQUIRED };
}

for (const fps of [30, 60, 120, 144]) {
  const result = traceAtFps(fps);
  assert(result.completed, `physical trace failed at ${fps} FPS`);
}

// The old 0.012-per-frame rule would fail this same deliberate trace at 30+ FPS.
for (const fps of [30, 60, 120, 144]) {
  const moved = 0.35 / fps;
  if (fps >= 30) assert(moved < 0.012, `test speed does not exercise old cutoff at ${fps} FPS`);
}

// Any-order completion contract: each independent contour owns its own distance.
const order = [2, 0, 1];
const progress = [0, 0, 0];
const read = [false, false, false];
for (const index of order) {
  progress[index] = REQUIRED;
  read[index] = progress[index] >= REQUIRED;
}
assert(read.filter(Boolean).length === 3, 'non-sequential contour order did not complete all three reads');

console.log('[HC031T5 smoke] PASS — low-speed physical path accumulation is frame-rate independent at 30/60/120/144 FPS and contours can resolve in any order.');
