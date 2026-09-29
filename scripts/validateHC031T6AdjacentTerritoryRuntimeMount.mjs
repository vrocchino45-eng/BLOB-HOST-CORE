import fs from 'node:fs';
import { ModeController } from '../src/modes/ModeController.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';

const read = (p) => fs.readFileSync(p, 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(`[HC031T6] ${msg}`); };

const profile = JSON.parse(read('public/data/runtime/act1RuntimeProfile_HC016M.json'));
const runtime = read('src/core/GameRuntime.js');
const main = read('src/main.js');
const pkg = JSON.parse(read('package.json'));
const adjacentSource = read('src/fields/ApertureAdjacentTerritorySystem.js');

assert(main.includes('buildId: "HC-031T6"'), 'main build ID must be HC-031T6');
assert(main.includes('buildLabel: "Adjacent Territory Runtime Mount Lock"'), 'main label must identify T6');
assert(pkg.version === '0.31.47', 'package version must be 0.31.47');

const aperture = profile.regions?.aperture_fields;
assert(aperture, 'Aperture runtime profile entry is required');
assert(aperture.systemIds.includes('apertureFieldsArrivalSystem'), 'Arrival owner must remain mounted');
assert(aperture.systemIds.includes('signalPlainEcologySystem'), 'Signal Plain owner must remain mounted');
assert(aperture.systemIds.includes('membraneRidgeGameplaySystem'), 'Membrane Ridge owner must remain mounted');
assert(aperture.systemIds.includes('apertureAdjacentTerritorySystem'), 'Adjacent Territory owner must be mounted');
assert(aperture.systemIds.length === 4, 'Aperture must have exactly four local active-region systems in T6');
assert(aperture.activeUpdateBudget === 10, 'Aperture active update budget must account for 6 shared + 4 local systems');
assert(aperture.adjacentTerritoryMounted === true, 'profile must explicitly declare adjacent territory mounted');
assert(runtime.includes('registry.register("apertureAdjacentTerritorySystem", this.apertureAdjacentTerritorySystem, regionScoped)'), 'GameRuntime must register Adjacent Territory as active_region');
assert(adjacentSource.includes('frameState.worldAttentionCandidates'), 'mounted adjacent territory must publish world attention candidates');

// Exercise the actual ModeController publication path used by SystemRegistry.
const frameState = { activeCellId: 'CELL_APERTURE_FIELDS_ARRIVAL_001', frame: 1 };
const region = {
  id: 'aperture_fields',
  displayName: 'Aperture Fields',
  regionType: 'host_field',
  hostFunction: 'aperture_exchange',
  movementMode: 'aperture_fields_arrival',
  cameraProfile: 'camera_aperture_fields_arrival',
  visualLanguage: 'aperture_fields_visual',
  objective: 'aperture_fields_arrival',
  gateOut: 'none',
  implementationStatus: 'runtime_active'
};
const modeController = new ModeController({
  regionRegistry: { getByRuntimeCellId: (id) => id === frameState.activeCellId ? region : null },
  cameraProfileRegistry: { get: (id) => ({ id, mode: 'field' }) },
  visualLanguageRegistry: { get: (id) => ({ id }) },
  frameState,
  runtimeProfile: profile
});
modeController.update(1 / 60, frameState);

const mount = frameState.firstSliceRuntimeMount;
assert(mount.activeRegionId === 'aperture_fields', 'ModeController must mount Aperture');
assert(mount.regionSystemIds.includes('apertureAdjacentTerritorySystem'), 'published regionSystemIds must include Adjacent Territory');
assert(mount.activeSystemIds.includes('apertureAdjacentTerritorySystem'), 'published activeSystemIds must include Adjacent Territory');
assert(mount.activeSystemCount === 10, `expected 10 active systems, got ${mount.activeSystemCount}`);
assert(mount.activeUpdateBudget === 10, `expected active update budget 10, got ${mount.activeUpdateBudget}`);

// Exercise SystemRegistry's real active_region gate. This is the exact gate that kept T5 dormant.
let mounted = 0;
let updated = 0;
const registry = new SystemRegistry();
registry.register('apertureAdjacentTerritorySystem', {
  onRuntimeMount() { mounted += 1; },
  update() { updated += 1; }
}, { runtimeScope: 'active_region' });
registry.update(1 / 60, frameState);
assert(mounted === 1, 'SystemRegistry must call Adjacent Territory onRuntimeMount');
assert(updated === 1, 'SystemRegistry must execute Adjacent Territory update');
assert(frameState.runtimeExecution.executedSystemIds.includes('apertureAdjacentTerritorySystem'), 'execution truth must include Adjacent Territory');
assert(!frameState.runtimeExecution.skippedRegionSystemIds.includes('apertureAdjacentTerritorySystem'), 'Adjacent Territory must not be skipped as dormant');


// Source-level contract for the real owner: once mounted it must publish both traversal and world-attention state.
assert(adjacentSource.includes('if (ridgeComplete && !this.traversalOpened)'), 'real Adjacent Territory must consume Ridge completion');
assert(adjacentSource.includes('frameState.worldAttentionCandidates = {'), 'real Adjacent Territory must publish attention candidates');
assert(adjacentSource.includes('id: TERRITORY_ID'), 'attention candidate must use the canonical Gathering Ground noun');

console.log('[HC031T6] PASS — Aperture profile publishes Adjacent Territory and SystemRegistry mounts/executes it through the real active_region gate.');
