import { territoryDefinition } from './RegionalTerritoryDefinitions.js';

// C0E2: connected movement volumes are authored around the same three C0E1
// sites; PlayerMovementController alone enforces the resulting envelope.
// The legacy region volume always remains part of the union. No gate, collider,
// teleport, Host receipt, material simulation, or route credit is added.
export const C0E2_REGION_CELLS = Object.freeze({
  CELL_SILT_PRESSURE_ROUTE_001: 'silt',
  CELL_VASCULAR_RHYTHM_ROUTE_001: 'vascular',
  CELL_GRAVE_MEMORY_RESIDUE_BED_001: 'grave',
  CELL_SIGNAL_CHORUS_NERVE_001: 'hub'
});
export const C0E2_HUB_JUNCTION_LOCAL = Object.freeze([0.1, -0.15, -1.8]);
const SHIFTS = Object.freeze({
  silt: [[-11.2, -1.4, -0.6], [11.2, -1.8, -1.1], [-10.1, 1.0, -2.6]],
  vascular: [[5.7, 2.5, -1.1], [-5.7, -2.3, -1.1], [5.7, 2.0, -2.0]],
  grave: [[-4.8, 2.2, -1.5], [4.8, -2.1, -1.1], [-4.4, 2.3, -3.0]],
  hub: [[-3.1, -1.8, -1.7], [0.0, 2.6, -2.5], [3.1, -1.1, -1.7]]
});
const RADII = Object.freeze({
  silt: [6.0, 4.0, 5.7], vascular: [4.4, 3.7, 5.2],
  grave: [4.3, 3.2, 5.1], hub: [3.6, 3.0, 4.2]
});
export function c0e2TerritoryPockets(cellId, anchor) {
  const kind = C0E2_REGION_CELLS[cellId];
  if (!kind || !anchor || ![anchor.x, anchor.y, anchor.z].every(Number.isFinite)) return [];
  const definition = territoryDefinition(kind);
  return definition.sites.map((site, index) => {
    const offset = kind === 'hub' ? C0E2_HUB_JUNCTION_LOCAL : [0, 0, 0];
    const point = site.point.map((component, i) => component + offset[i]);
    const center = point.map((component, i) => component + SHIFTS[kind][index][i]);
    // Overlapping bridges prevent an unreachable gap between the original
    // region envelope and the distal anatomical pocket. No forced relocation.
    const bridges = [0.38, 0.70].map((fraction, bridgeIndex) => ({
      id: `${site.id}_bridge_${bridgeIndex + 1}`,
      parentSiteId: site.id, bridge: true,
      center: {
        x: anchor.x + center[0] * fraction,
        y: anchor.y + center[1] * fraction,
        z: anchor.z + center[2] * fraction
      },
      radii: {x: RADII[kind][0], y: RADII[kind][1], z: RADII[kind][2]}
    }));
    return {
      bridges,
      id: site.id, kind, index,
      sitePoint: {x: anchor.x + point[0], y: anchor.y + point[1], z: anchor.z + point[2]},
      center: {x: anchor.x + center[0], y: anchor.y + center[1], z: anchor.z + center[2]},
      radii: {x: RADII[kind][0], y: RADII[kind][1], z: RADII[kind][2]},
      source: 'C0E1_site_connected_side_pocket', noNewProgression: true
    };
  });
}
export function c0e2NormalizedDistance(position, segment) {
  const {center, radii} = segment;
  return Math.hypot((position.x-center.x)/radii.x,
    (position.y-center.y)/radii.y, (position.z-center.z)/radii.z);
}
export function c0e2SelectVolume(position, base, pockets) {
  // Inside ANY volume means physically permitted. Prefer legacy volume while
  // inside it, preventing changes to existing traversal and attachment feel.
  const legacyDistance = c0e2NormalizedDistance(position, base);
  if (legacyDistance <= 1) return {...base, normalizedDistance: legacyDistance, source: 'legacy'};
  let best = {...base, normalizedDistance: legacyDistance, source: 'legacy'};
  for (const pocket of pockets) {
    const normalizedDistance = c0e2NormalizedDistance(position, pocket);
    if (normalizedDistance < best.normalizedDistance) best = {...pocket, normalizedDistance, source: 'pocket'};
  }
  return best;
}
