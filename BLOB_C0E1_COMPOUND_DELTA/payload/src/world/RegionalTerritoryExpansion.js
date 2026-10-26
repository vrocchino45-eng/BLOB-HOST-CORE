import * as THREE from 'three';

// C0E1: spatial interpretation of existing regional state, not a new Host owner.
// Coordinates are LOCAL to the established region/Hub root. Every site lies
// within the existing authored traversal volume; no crossing or physics changes.
const SPECS = Object.freeze({
  silt: { cell: 'CELL_SILT_PRESSURE_ROUTE_001', palette: [0x8c6943, 0xb68b52, 0xe1b980],
    sites: [
      { id: 'silt_porosity_shelf', name: 'Porosity Shelf', point: [-2.45, -0.72, -5.8], question: 'How does loosened matter settle?' },
      { id: 'silt_catchment_bowl', name: 'Catchment Bowl', point: [2.65, -0.9, -10.45], question: 'Can pressure leave a persistent shape?' },
      { id: 'silt_deep_reservoir', name: 'Deep Reservoir', point: [-2.35, -0.6, -15.35], question: 'Which material returns after release?' }
    ] },
  vascular: { cell: 'CELL_VASCULAR_RHYTHM_ROUTE_001', palette: [0x468db4, 0x6dc2d0, 0xb0d7ef],
    sites: [
      { id: 'vascular_intake_branch', name: 'Intake Branch', point: [2.65, 0.35, -4.7], question: 'What pressure reaches the membrane?' },
      { id: 'vascular_exchange_fork', name: 'Exchange Fork', point: [-2.75, 0.42, -10.35], question: 'How is load redistributed?' },
      { id: 'vascular_return_capillary', name: 'Return Capillary', point: [2.75, -0.38, -17.25], question: 'How does the vessel recover?' }
    ] },
  grave: { cell: 'CELL_GRAVE_MEMORY_RESIDUE_BED_001', palette: [0x875871, 0xb18aa3, 0xd1abb8],
    sites: [
      { id: 'grave_first_imprint', name: 'First Imprint', point: [-3.65, -0.3, -5.15], question: 'Which disturbance is retained?' },
      { id: 'grave_contradiction_terrace', name: 'Contradiction Terrace', point: [3.55, -0.25, -10.75], question: 'Which histories resist alignment?' },
      { id: 'grave_inheritance_vault', name: 'Inheritance Vault', point: [-2.65, 0.26, -15.15], question: 'What persists on return?' }
    ] },
  hub: { cell: 'CELL_SIGNAL_CHORUS_NERVE_001', palette: [0x9c7647, 0x57a9c6, 0xae779d],
    sites: [
      { id: 'hub_silt_root', name: 'Sediment Root', point: [-3.7, -1.15, -5.15], question: 'Where did this material signal originate?' },
      { id: 'hub_vascular_root', name: 'Transmission Root', point: [0.35, 1.75, -7.0], question: 'What was applied, not merely observed?' },
      { id: 'hub_grave_root', name: 'Memory Root', point: [3.55, -0.62, -5.75], question: 'Which consequence can return?' }
    ] }
});

export const territoryDefinition = (kind) => SPECS[kind] ?? null;
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
        observations: 0, lastVerb: 'none' });
    });
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
      const distance = localPosition ? site.point.distanceTo(localPosition) : Infinity;
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
      const nearby = localPosition ? territoryClamp01(1 - site.point.distanceTo(localPosition) / 3.3) : 0;
      const breath = Math.sin(phase) * 0.045;
      site.body.scale.y = (this.kind === 'vascular' ? 1.05 : this.kind === 'hub' ? 1.35 : this.kind === 'grave' ? 0.19 : 0.29)
        * (1 + signal * 0.08 + nearby * 0.07 + breath + site.response * 0.14);
      site.group.rotation.y = Math.sin(phase * 0.34) * 0.045;
      site.baseMaterial.emissiveIntensity = 0.045 + signal * 0.17 + nearby * 0.055 + site.response * 0.32;
      site.accentMaterial.emissiveIntensity = 0.06 + signal * 0.11 + site.response * 0.29;
      site.fleckMaterial.opacity = 0.2 + signal * 0.19 + nearby * 0.13 + site.response * 0.28;
      site.nerveMaterial.opacity = 0.20 + signal * 0.27 + nearby * 0.1;
    }
    if (frameState) frameState.territoryExploration = this.snapshot({signal01: signal, circuitStatus,
      nearestDistance});
  }

  observe(site, verb, signal, frameState) {
    if (!site || !Object.prototype.hasOwnProperty.call(this.observationCount, verb)) return;
    site.observations += 1;
    site.lastVerb = verb;
    site.response = Math.min(1, site.response + (verb === 'pulse' ? 0.8 : 0.5));
    this.observationCount[verb] += 1;
    const event = {
      kind: 'c0e1_local_exploratory_read', region: this.kind, siteId: site.id,
      verb, localSequence: ++this.experimentSequence, signal01: Number(signal.toFixed(3)),
      question: site.question, noHostReceipt: true, noMatterTransfer: true,
      noProgressionCredit: true
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
      siteStates: this.sites.map(site => ({ id: site.id, reads: site.observations, lastVerb: site.lastVerb })),
      newPhysics: false, movementBoundaryChanged: false, routeProgressionChanged: false,
      hostReceiptChanged: false, materialTransferred: false
    };
  }
}
