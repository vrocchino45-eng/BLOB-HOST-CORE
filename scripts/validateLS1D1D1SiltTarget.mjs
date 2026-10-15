import assert from 'node:assert/strict';
import fs from 'node:fs';
const route = fs.readFileSync('src/routes/SiltPressureRouteSystem.js', 'utf8');
const runtime = fs.readFileSync('src/core/GameRuntime.js', 'utf8');
for (const token of ['this.camera.getWorldDirection(', 'this.root.localToWorld(', 'if (dot < 0.90) continue;', 'best = { unit, position: localPosition.toArray(), dot }', 'this.siltGrip.tryGrip({ unit: best.unit', 'this.siltAimLockedId = best.unit.id', 'frameState.siltMaterialAim', 'updateSiltAimMarker()', 'this.siltAimMarker.material.color.setHex(']) assert.ok(route.includes(token), token);
assert.ok(!route.includes('closest.unit'), 'nearest-first grip selection must be removed');
assert.ok(runtime.includes('camera: this.camera'), 'route must receive live camera');
console.log('LS1D1D1 Silt target convergence: PASS (static only; gameplay verification required)');
