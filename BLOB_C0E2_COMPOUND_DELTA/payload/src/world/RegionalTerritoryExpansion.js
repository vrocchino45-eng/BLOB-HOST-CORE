import * as THREE from 'three';
import { c0e2TerritoryPockets } from './RegionalTerritoryVolume.js';
import { territoryDefinition } from './RegionalTerritoryDefinitions.js';
export { territoryDefinition } from './RegionalTerritoryDefinitions.js';

// C0E1: spatial interpretation of existing regional state, not a new Host owner.
// Coordinates are LOCAL to the established region/Hub root. Every site lies
// within the existing authored traversal volume; no crossing or physics changes.
export const territoryClamp01 = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export function territorySignal(kind, state = {}) {
  if (kind === 'silt') return territoryClamp01(Number(state.siltPressureEcho ?? 0) / 0.04);
  if (kind === 'vascular') return territoryClamp01(Number(state.membraneLoad ?? 0) / 0.85);
  if (kind === 'grave') return territoryClamp01(Number(state.memoryPressure ?? 0));
  if (kind === 'hub') return territoryClamp01((Number(state.siltReceived ?? 0) > 0 ? 0.22 : 0) + (Number(state.vascularReceived ?? 0) > 0 ? 0.34 : 0)
      + (Number(state.graveResolved ?? 0) > 0 ? 0.44 : 0));
  return 0;
}

const safeNumber = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const mkMat = (color, opacity, emissive = color) => new THREE.MeshStandardMaterial({
  color, emissive, emissiveIntensity: 0.06,
  roughness: 0.82, metalness: 0.02, transparent: true, opacity,
  depthWrite: false, side: THREE.DoubleSide
});
const suppress = (object, kind) => {
  object.userData.targetingSuppressed = true;
  object.userData.gameplayAuthority = false;
  object.userData.presentationOwner = `${kind}:C0E1`;
  object.traverse?.(child => { child.userData.targetingSuppressed = true; });
  return object;
};

/**
 * One region-owned, mounted-only territory extension. 3 destinations each
 * have 6 counterpart ribs and 12 phase flecks. Nearby verbs produce read-only
 * discoveries but never consume input, choose targets or mint Host receipts.
 */
export class RegionalTerritoryExpansion {
  constructor({ kind, parent, offset = [0, 0, 0] }) {
    const spec = territoryDefinition(kind);
    if (!spec || !parent) throw new Error('C0E1 territory requires an existing regional root');
    this.kind = kind;
    this.spec = spec;
    this.root = new THREE.Group();
    this.root.name = `C0E1_${kind}_continuous_territory`;
    this.root.position.fromArray(offset);
    this.root.userData = {
      regionId: kind, presentationOwner: `${kind}:C0E1`, targetingSuppressed: true,
      passiveExplorationOnly: true, changesPhysics: false, changesProgression: false,
      siteIds: spec.sites.map(site => site.id), grammar: '3_organs_6_counterparts_12_resolutions'
    };
    this.materials = [];
    this.sites = [];
    this.elapsed = 0;
    this.lastPulseEventId = null;
    this.lastLocalExperiment = null;
    this.experiments = [];
    this.experimentSequence = 0;
    this.observationCount = { pulse: 0, stabilize: 0, absorb: 0 };
    this.previousStabilize = false;
    this.previousAbsorb = false;
    this.stabilizeSeconds = 0;
    this.absorbSeconds = 0;
    this.nearestSite = null;
    this.dummy = new THREE.Object3D();
    const commonGeometry = {
      fleck: new THREE.IcosahedronGeometry(0.055, 0),
      rib: new THREE.CapsuleGeometry(0.065, 0.72, 4, 6)
    };
    this.geometries = [commonGeometry.fleck, commonGeometry.rib];

    const origin = new THREE.Vector3(0, 0, 0);
    spec.sites.forEach((site, index) => {
      const point = new THREE.Vector3(...site.point);
      const group = new THREE.Group();
      group.name = site.id;
      group.position.copy(point);
      group.userData = { targetingSuppressed: true, c0e1SiteId: site.id,
        exploratoryOnly: true, noProgressionCredit: true };
      this.root.add(group);
      const baseMaterial = this.register(mkMat(spec.palette[index], kind === 'hub' ? 0.21 : 0.28));
      const accentMaterial = this.register(mkMat(spec.palette[(index + 1) % 3], 0.38));
      const fleckMaterial = this.register(new THREE.MeshBasicMaterial({
        color: spec.palette[(index + 2) % 3], transparent: true, opacity: 0.46, depthWrite: false
      }));
      let body;
      if (kind === 'silt') {
        body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.02, 1), baseMaterial);
        body.scale.set(1.25, 0.29, 1.04);
      } else if (kind === 'vascular') {
        body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), baseMaterial);
        body.scale.set(0.7, 1.05, 1.2);
      } else if (kind === 'grave') {
        body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 1), baseMaterial);
        body.scale.set(1.35, 0.19, 1.10);
      } else {
        body = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 1), baseMaterial);
        body.scale.set(0.8, 1.35, 0.72);
      }
      body.name = `${site.id}_organ_body`;
      group.add(body);
      this.geometries.push(body.geometry);
      const shelves = [];
      for (let phase = 0; phase < 3; phase++) {
        // Three plates describe the root functions at the chamber scale.
        const plate = new THREE.Mesh(new THREE.SphereGeometry(0.78, 10, 7), accentMaterial);
        plate.position.set((phase - 1) * 0.29, (phase - 1) * (kind === 'vascular' ? 0.35 : 0.18),
          (phase - 1) * (kind === 'grave' ? 0.62 : 0.42));
        plate.scale.set(kind === 'vascular' ? 0.28 : 0.92, kind === 'vascular' ? 0.7 : 0.08,
          kind === 'grave' ? 0.75 : 0.85);
        plate.rotation.y = phase * 0.38;
        group.add(plate);
        shelves.push(plate);
        this.geometries.push(plate.geometry);
      }
      // Six paired ribs, instanced (one draw call).
      const ribs = new THREE.InstancedMesh(commonGeometry.rib, accentMaterial, 6);
      ribs.name = `${site.id}_counterpart_six`;
      for (let r = 0; r < 6; r++) {
        const a = r / 6 * Math.PI * 2;
        this.dummy.position.set(Math.cos(a) * 1.23, 0.11 + Math.sin(a * 2) * 0.23,
          Math.sin(a) * 1.0);
        this.dummy.rotation.set(0.22 * Math.sin(a), a + 0.42, Math.sin(a) * 0.42);
        this.dummy.scale.set(1, 0.65 + (r % 3) * 0.26, 1);
        this.dummy.updateMatrix(); ribs.setMatrixAt(r, this.dummy.matrix);
      }
      ribs.instanceMatrix.needsUpdate = true;
      group.add(ribs);
      // Twelve orbiting phase flecks; InstancedMesh avoids per-fleck draw calls.
      const flecks = new THREE.InstancedMesh(commonGeometry.fleck, fleckMaterial, 12);
      flecks.name = `${site.id}_resolution_twelve`;
      for (let p = 0; p < 12; p++) {
        const a = p / 12 * Math.PI * 2;
        this.dummy.position.set(Math.cos(a) * (1.60 + 0.08 * (p % 3)),
          (p % 4 - 1.5) * (kind === 'vascular' ? 0.42 : 0.17),
          Math.sin(a) * 1.32);
        this.dummy.rotation.set(a, a * 0.5, 0);
        this.dummy.scale.setScalar(0.72 + (p % 3) * 0.16);
        this.dummy.updateMatrix(); flecks.setMatrixAt(p, this.dummy.matrix);
      }
      flecks.instanceMatrix.needsUpdate = true;
      group.add(flecks);
      // Each site branches out of the canonical passage, not an invented door.
      const start = kind === 'hub' ? origin.clone()
        : new THREE.Vector3(point.x * 0.25, point.y * 0.5, point.z + 1.2);
      const bend = start.clone().lerp(point, 0.48).add(new THREE.Vector3(0, kind === 'vascular' ? 0.52 : -0.18, 0));
      const nerveGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        start, bend, point.clone()
      ], false, 'centripetal'), 22, kind === 'vascular' ? 0.075 : 0.045, 5, false);
      const nerveMaterial = this.register(mkMat(spec.palette[index], 0.43));
      const nerve = new THREE.Mesh(nerveGeometry, nerveMaterial);
      nerve.name = `${site.id}_connected_tissue`; this.root.add(nerve);
      this.geometries.push(nerveGeometry);
      this.sites.push({ ...site, point, group, body, shelves, ribs, flecks,
        baseMaterial, accentMaterial, fleckMaterial, nerveMaterial, response: 0,
        observations: 0, lastVerb: 'none', imprint: 0, strain: 0, void: 0,
        pocketVisited: false, pocketBody: null, passage: null });
    });
    // C0E2: three REAL movement pockets are supplied by the PlayerMovementController.
    // This geometry describes their approach and anatomy; it is intentionally
    // transparent and non-solid, not a pretend collider or interaction owner.
    const pockets = c0e2TerritoryPockets(spec.cell, {x:0,y:0,z:0});
    for (const [index, pocket] of pockets.entries()) {
      const site = this.sites[index];
      const end = new THREE.Vector3(pocket.center.x - this.root.position.x,
        pocket.center.y - this.root.position.y, pocket.center.z - this.root.position.z);
      const midpoint = site.point.clone().lerp(end, 0.52);
      midpoint.y += kind === 'vascular' ? 0.42 : kind === 'grave' ? 0.55 : -0.22;
      const curve = new THREE.CatmullRomCurve3([site.point.clone(), midpoint, end], false, 'centripetal');
      const connectiveMaterial = this.register(mkMat(spec.palette[index], kind === 'hub' ? 0.18 : 0.24));
      const connective = new THREE.Mesh(new THREE.TubeGeometry(curve, 28,
        kind === 'silt' ? 0.65 : kind === 'vascular' ? 0.48 : 0.53, 8, false), connectiveMaterial);
      connective.name = `${site.id}_c0e2_traversable_tissue_guide`;
      this.root.add(connective);
      this.geometries.push(connective.geometry);
      // Side pocket is a visual chamber within the authored physical union.
      const membraneMaterial = this.register(mkMat(spec.palette[(index + 1) % 3], 0.13));
      const pocketBody = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), membraneMaterial);
      pocketBody.name = `${site.id}_c0e2_distal_pocket`;
      pocketBody.position.copy(end);
      pocketBody.scale.set(pocket.radii.x * 0.72, pocket.radii.y * 0.66, pocket.radii.z * 0.68);
      this.root.add(pocketBody);
      this.geometries.push(pocketBody.geometry);
      const apertureMaterial = this.register(mkMat(spec.palette[index], 0.38));
      const aperture = new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.058, 6, 28), apertureMaterial);
      aperture.name = `${site.id}_c0e2_distal_rim`;
      aperture.position.copy(end);
      aperture.rotation.set(0.2, 0.3, index * 0.8);
      aperture.scale.set(1.3, 0.86, 1);
      this.root.add(aperture);
      this.geometries.push(aperture.geometry);
      site.pocket = pocket;
      site.pocketLocal = end;
      site.pocketBody = pocketBody;
      site.passage = connective;
      site.pocketMaterial = membraneMaterial;
      site.passageMaterial = connectiveMaterial;
      site.apertureMaterial = apertureMaterial;
    }
    suppress(this.root, kind);
    parent.add(this.root);
  }

  register(material) { this.materials.push(material); return material; }

  update({ dt = 0, time = 0, playerPosition = null, input = {}, signal01 = 0,
    circuitStatus = 'local', frameState = null } = {}) {
    const step = Math.max(0, Math.min(0.12, safeNumber(dt)));
    this.elapsed += step;
    const signal = territoryClamp01(signal01);
    // Local coordinates are relative to the entry-anchored parent and our offset.
    const worldPoint = playerPosition?.isVector3 ? playerPosition : null;
    const localPosition = worldPoint ? this.root.worldToLocal(worldPoint.clone()) : null;
    let nearest = null; let nearestDistance = Infinity;
    for (const site of this.sites) {
      const distance = localPosition ? Math.min(site.point.distanceTo(localPosition),
        site.pocketLocal?.distanceTo(localPosition) ?? Infinity) : Infinity;
      if (distance < nearestDistance) { nearest = site; nearestDistance = distance; }
    }
    const eligible = Boolean(nearest && nearestDistance <= 2.4);
    this.nearestSite = eligible ? nearest : null;
    const pulseSequence = safeNumber(input.pulseEventId, 0);
    if (this.lastPulseEventId === null) this.lastPulseEventId = pulseSequence;
    else if (pulseSequence > this.lastPulseEventId) {
      if (eligible) this.observe(nearest, 'pulse', signal, frameState);
      this.lastPulseEventId = pulseSequence;
    }
    const stabilize = input.stabilizeHeld === true;
    const absorb = input.absorbHeld === true;
    this.stabilizeSeconds = stabilize && eligible ? this.stabilizeSeconds + step : 0;
    this.absorbSeconds = absorb && eligible ? this.absorbSeconds + step : 0;
    if (stabilize && this.stabilizeSeconds >= 0.70 && !this.previousStabilize) {
      this.observe(nearest, 'stabilize', signal, frameState);
      this.previousStabilize = true;
    }
    if (absorb && this.absorbSeconds >= 0.70 && !this.previousAbsorb) {
      this.observe(nearest, 'absorb', signal, frameState);
      this.previousAbsorb = true;
    }
    if (!stabilize) this.previousStabilize = false;
    if (!absorb) this.previousAbsorb = false;
    for (const [index, site] of this.sites.entries()) {
      const phase = this.elapsed * (this.kind === 'vascular' ? 1.24 : 0.64) + index * 2.094;
      site.response = Math.max(0, site.response - step * 0.48);
      const nearby = localPosition ? territoryClamp01(1 - Math.min(
        site.point.distanceTo(localPosition), site.pocketLocal?.distanceTo(localPosition) ?? Infinity) / 3.3) : 0;
      const breath = Math.sin(phase) * 0.045;
      site.body.scale.y = (this.kind === 'vascular' ? 1.05 : this.kind === 'hub' ? 1.35 : this.kind === 'grave' ? 0.19 : 0.29)
        * (1 + signal * 0.08 + nearby * 0.07 + breath + site.response * 0.14);
      site.group.rotation.y = Math.sin(phase * 0.34) * 0.045;
      site.baseMaterial.emissiveIntensity = 0.045 + signal * 0.17 + nearby * 0.055 + site.response * 0.32;
      site.accentMaterial.emissiveIntensity = 0.06 + signal * 0.11 + site.response * 0.29;
      site.fleckMaterial.opacity = 0.2 + signal * 0.19 + nearby * 0.13 + site.response * 0.28;
      site.nerveMaterial.opacity = 0.20 + signal * 0.27 + nearby * 0.1;
      // Persist during the session, including return visits. No automatic
      // decay removes a successful local experiment between two encounters.
      site.group.scale.y = 1 + site.imprint * 0.22 - site.strain * 0.11;
      site.group.scale.x = 1 + site.strain * 0.13 - site.void * 0.08;
      site.baseMaterial.emissiveIntensity += site.imprint * 0.13;
      site.pocketMaterial.opacity = 0.10 + site.imprint * 0.10 + site.strain * 0.045;
      site.passageMaterial.opacity = 0.19 + signal * 0.1 + site.imprint * 0.16;
      site.apertureMaterial.emissiveIntensity = 0.08 + site.strain * 0.25 + site.imprint * 0.13;
      const distalDistance = localPosition ? site.pocketLocal.distanceTo(localPosition) : Infinity;
      if (distalDistance <= 2.4 && !site.pocketVisited) {
        site.pocketVisited = true;
        if (frameState) frameState.territoryExplorationLastPocket = {
          kind: 'c0e2_pocket_discovered', region: this.kind, siteId: site.id,
          pocketId: site.id, noProgressionCredit: true, noHostReceipt: true
        };
      }
    }
    if (frameState) frameState.territoryExploration = this.snapshot({signal01: signal, circuitStatus,
      nearestDistance});
  }

  observe(site, verb, signal, frameState) {
    if (!site || !Object.prototype.hasOwnProperty.call(this.observationCount, verb)) return;
    site.observations += 1;
    site.lastVerb = verb;
    site.response = Math.min(1, site.response + (verb === 'pulse' ? 0.8 : 0.5));
    const before = {imprint: site.imprint, strain: site.strain, void: site.void};
    const delta = {
      silt: {pulse: [0, 0.25, 0], stabilize: [0.22, -0.13, 0], absorb: [0, -0.08, 0.15]},
      vascular: {pulse: [0, 0.19, 0], stabilize: [0.19, -0.15, 0], absorb: [0, -0.1, 0.17]},
      grave: {pulse: [0, 0.23, 0], stabilize: [0.25, -0.06, 0], absorb: [0.05, -0.04, 0.15]},
      hub: {pulse: [0, 0.14, 0], stabilize: [0.22, -0.11, 0], absorb: [0, -0.05, 0.18]}
    }[this.kind][verb];
    site.imprint = territoryClamp01(site.imprint + delta[0]);
    site.strain = territoryClamp01(site.strain + delta[1]);
    site.void = territoryClamp01(site.void + delta[2]);
    this.observationCount[verb] += 1;
    const event = {
      kind: 'c0e1_local_exploratory_read', region: this.kind, siteId: site.id,
      verb, localSequence: ++this.experimentSequence, signal01: Number(signal.toFixed(3)),
      question: site.question, noHostReceipt: true, noMatterTransfer: true,
      noProgressionCredit: true, localConsequence: true, retainedDuringSession: true,
      before, after: {imprint: site.imprint, strain: site.strain, void: site.void}
    };
    this.lastLocalExperiment = event;
    this.experiments.push(event);
    if (this.experiments.length > 12) this.experiments.shift();
    if (frameState) frameState.territoryExplorationLastRead = event;
  }

  snapshot({ signal01 = 0, circuitStatus = 'local', nearestDistance = Infinity } = {}) {
    return {
      pass: 'C0E1', owner: `${this.kind}:RegionalTerritoryExpansion`,
      region: this.kind, active: true, circuitStatus, signal01,
      grammar: '3_6_12', structuralSites: 3, counterpartRibsPerSite: 6,
      phaseFlecksPerSite: 12, nearestSiteId: this.nearestSite?.id ?? null,
      nearestSiteDistance: Number.isFinite(nearestDistance) ? Number(nearestDistance.toFixed(2)) : null,
      observations: { ...this.observationCount },
      lastRead: this.lastLocalExperiment,
      siteStates: this.sites.map(site => ({ id: site.id, reads: site.observations,
        lastVerb: site.lastVerb, pocketVisited: site.pocketVisited,
        imprint: Number(site.imprint.toFixed(3)), strain: Number(site.strain.toFixed(3)),
        void: Number(site.void.toFixed(3)) })),
      pocketCount: 3, pocketsVisited: this.sites.filter(site => site.pocketVisited).length,
      localStateRetainedDuringSession: true, c0e2MovementVolumeOwner: 'PlayerMovementController',
      newPhysics: true, movementBoundaryChanged: true, routeProgressionChanged: false,
      hostReceiptChanged: false, materialTransferred: false
    };
  }
}
