import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { buildQuickLookSnapshot } from '../src/ui/QuickLookInspectorSystem.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const source = readFileSync(resolve(root, 'src/core/GameRuntime.js'), 'utf8');
const controlMap = readFileSync(resolve(root, 'src/input/ControlMap.js'), 'utf8');
assert.match(source, /import \{ QuickLookInspectorSystem \}/);
assert.match(source, /new QuickLookInspectorSystem\(\{ frameState: this\.frameState \}\)/);
assert.match(source, /registry\.register\("quickLookInspectorSystem", this\.quickLookInspectorSystem/);
assert.match(controlMap, /verticalMove: "RB rise \/ LB descend/);

const first = buildQuickLookSnapshot({
  activeCellId: 'CELL_SILT_PRESSURE_ROUTE_001',
  coreEngine: { phaseCount: 3, currentPhaseFunction: 'pulse', currentPhaseLabel: 'pulse_1', rpm: 3456 },
  targeting: { active: true, targetId: 'silt_safe_packet', targetLabel: 'Warm porous packet', targetKind: 'absorbable' },
  siltPressureRoute: {
    active: true, stage: 'read_compression', pressureRead: false, ribsReleased: false, safeMatterAbsorbed: false,
    habitatFoundation: { currentHabitatId: 'reservoir', active: true },
    livingMaterialCycle: { active: false, conservedMass: 8, initialMass: 8, currentUnitCount: 8,
      counts: { reservoir: 8, veins: 0, garden_transit: 0, settled: 0, growing: 0, mature: 0, returning: 0 },
      releaseCount: 0, regenerationCount: 0, lastEvent: 'dormant' }
  }
});
assert.equal(first.region, 'Silt');
assert.match(first.landmark, /Reservoir/);
assert.equal(first.focus, 'Warm porous packet');
assert.match(first.actions[0], /LT.*X/);
assert.match(first.phaseExplanation, /^3:/);
assert.ok(first.live.some(t => /8 \/ 8 conserved mass/.test(t)));
assert.ok(first.design.some(t => /NOT been built/.test(t)));

const next = buildQuickLookSnapshot({
  activeCellId: 'CELL_SILT_PRESSURE_ROUTE_001',
  coreEngine: { phaseCount: 6, currentPhaseFunction: 'stabilize', currentPhaseLabel: 'stabilize_1', rpm: 4200 },
  siltPressureRoute: {
    completed: true, pressureRead: true, ribsReleased: true, safeMatterAbsorbed: true,
    habitatFoundation: { currentHabitatId: 'garden', active: true },
    livingMaterialCycle: { active: true, conservedMass: 8, initialMass: 8, currentUnitCount: 8,
      counts: { reservoir: 2, veins: 2, garden_transit: 1, settled: 1, growing: 1, mature: 0, returning: 1 },
      releaseCount: 6, regenerationCount: 2, lastEvent: 'growing' }
  }
});
assert.match(next.landmark, /Garden/);
assert.match(next.phaseExplanation, /^6:/);
assert.match(next.status, /active/);
assert.ok(next.live.some(t => /Releases 6.*replenishments 2/.test(t)));

const unknown = buildQuickLookSnapshot({ activeCellId: 'CELL_GRAVE_MEMORY_RESIDUE_BED_001', coreEngine: { phaseCount: 12, rpm: 3010 } });
assert.equal(unknown.region, 'Grave');
assert.match(unknown.phaseExplanation, /^12:/);
assert.equal(unknown.live.length, 0);
assert.ok(!unknown.actions.some(t => /pressure ribs/i.test(t)));

// This is optional, read-only UI: new logic must not mutate runtime truth.
const sourceUi = readFileSync(resolve(root, 'src/ui/QuickLookInspectorSystem.js'), 'utf8');
assert.match(sourceUi, /event\.code === 'F4'/);
assert.match(sourceUi, /pad\?\.buttons\?\.\[4\].*buttons\?\.\[5\]/);
for (const forbidden of ['frameState.activeCellId =', 'frameState.targeting =', 'frameState.input =', 'frameState.siltPressureRoute =']) {
  assert.ok(!sourceUi.includes(forbidden), `QuickLook must not write ${forbidden}`);
}
console.log('[LS1C0] Quick Look runtime/wiring, authored labels, live truth and 3→6→12 audit PASS');
