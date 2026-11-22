import * as THREE from 'three';
import { readLocalChemistryContext } from '../chemistry/LocalChemistryContextSystem.js';
import { clampFlow, contactFlowPatch, inSiltFlowWorld, MAX_FLOW_STEP, readFlowAim, readFlowCoreProfile, readFlowStep } from '../interaction/SiltFlowContract.js';
import { c0e2TerritoryPockets } from './RegionalTerritoryVolume.js';
import { territoryDefinition } from './RegionalTerritoryDefinitions.js';
import { c0e2bApplyLocalCoupling } from './RegionalTerritoryCoupling.js';
import { C0E3_PHYSIOLOGY, c0e3ApplyPressureRelief, c0e3AdvancePacket, c0e3CreatePackets } from './RegionalTerritoryDynamics.js';
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
  constructor({ kind, parent, offset = [0, 0, 0], flowExperiment = false }) {
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
    this.flowPatch = null;
    this.lastFlowResult = null;
    this.elapsed = 0;
    this.lastPulseEventId = null;
    this.lastLocalExperiment = null;
    this.lastLocalCircuit = null;
    this.lastLivingResponse = null;
    this.c0e3WavesCompleted = 0;
    this.c0e3DissipationCount = 0;
    this.c0e3ReliefCount = 0;
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
        c0e3Cooldown:0, c0e3ReliefFlash:0,
        pocketVisited: false, pocketBody: null, passage: null });
    });
    const receiver = flowExperiment && this.sites.find(site => site.flowReceiver);
    if (receiver) this.createFlowPatch(receiver);
    // C0E2-B: three local site pairs, each with two directed tissue strands.
    // The six directions represent bounded local coupling, NOT Host signal flow.
    this.localLinks = [];
    for (let a=0; a<3; a++) for (let b=a+1; b<3; b++) {
      for (const direction of [[a,b],[b,a]]) {
        const from=this.sites[direction[0]].point, to=this.sites[direction[1]].point;
        const bend=from.clone().lerp(to,0.5);
        bend.y += direction[0]<direction[1] ? 0.24 : -0.24;
        const linkMaterial=this.register(mkMat(spec.palette[direction[0]], 0.085));
        const curve=new THREE.CatmullRomCurve3([from.clone(),bend,to.clone()],false,'centripetal');
        const linkGeometry=new THREE.TubeGeometry(curve,24,kind==='vascular'?0.055:kind==='hub'?0.042:0.032,6,false);
        const link=new THREE.Mesh(linkGeometry,linkMaterial);
        link.name=`${this.sites[direction[0]].id}_to_${this.sites[direction[1]].id}_c0e2b_local_link`;
        this.root.add(link);this.geometries.push(linkGeometry);
        // One bounded luminous propagator per directed connection; the mesh
        // is reused, never allocated on each button press. Entirely untargetable.
        const packetMaterial=this.register(new THREE.MeshBasicMaterial({
          color:spec.palette[direction[0]],transparent:true,opacity:0,depthWrite:false}));
        const packetGeometry=new THREE.IcosahedronGeometry(kind==='vascular'?0.17:0.14,1);
        this.geometries.push(packetGeometry);
        const packetMarker=new THREE.Mesh(packetGeometry,packetMaterial);
        packetMarker.name=`${link.name}_c0e3_traveling_response`;
        packetMarker.visible=false;
        this.root.add(packetMarker);
        this.localLinks.push({from:direction[0],to:direction[1],material:linkMaterial,
          response:0,curve,packetMaterial,packetMarker,packet:null});
      }
    }
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

  createFlowPatch(site) {
    const spec = site.flowReceiver;
    const geometry = new THREE.CircleGeometry(spec.radius, 24);
    const uniforms = {
      shelfContact: { value: 0 },
      shelfPressure: { value: 0 },
      shelfDeliveryProgress: { value: 0 }
    };
    const material = this.register(new THREE.MeshBasicMaterial({ color: 0x6dbea9, side: THREE.DoubleSide }));
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = 'varying vec2 vShelfUv;\n' + shader.vertexShader.replace(
        '#include <uv_vertex>', '#include <uv_vertex>\nvShelfUv = uv;'
      );
      shader.fragmentShader = `
        varying vec2 vShelfUv;
        uniform float shelfContact;
        uniform float shelfPressure;
        uniform float shelfDeliveryProgress;
      ` + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        float shelfRadius = length(vShelfUv * 2.0 - 1.0);
        float contactRim = smoothstep(0.73, 0.82, shelfRadius) * (1.0 - smoothstep(0.94, 1.0, shelfRadius));
        float pressure = clamp(shelfPressure / 0.22, 0.0, 1.0);
        float pressureSpot = 1.0 - smoothstep(0.10, 0.50 + pressure * 0.22, shelfRadius);
        float arrival = 0.72 + 0.28 * smoothstep(0.58, 1.0, shelfDeliveryProgress);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 1.0, 0.79), pressureSpot * pressure * arrival);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.83, 0.56), contactRim * shelfContact * 0.68);
      `);
    };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = spec.id;
    mesh.position.copy(site.point).add(new THREE.Vector3(...spec.offset));
    const normal = new THREE.Vector3(...spec.normal).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    // The collar carries the exposed contact face back into the animated shelf.
    const backingDepth = 0.22;
    const backing = new THREE.CylinderGeometry(spec.radius, spec.radius * 0.8, backingDepth, 24, 1, true);
    const collarColor = new THREE.Color(0x46695e);
    const imprintColor = new THREE.Color(0xb2a075);
    const collarMaterial = this.register(new THREE.MeshBasicMaterial({ color: collarColor, side: THREE.DoubleSide }));
    const collar = new THREE.Mesh(backing, collarMaterial);
    collar.name = spec.id + '_mount';
    collar.position.copy(mesh.position).addScaledVector(normal, -backingDepth * 0.5);
    collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    this.root.add(collar, mesh);
    this.geometries.push(geometry, backing);
    this.flowPatch = { site, mesh, uniforms, collarMaterial, collarColor, imprintColor };
  }

  renderFlowFeedback(flow, deliveryProgress) {
    if (!this.flowPatch) return;
    const { site, uniforms, collarMaterial, collarColor, imprintColor } = this.flowPatch;
    const touching = flow?.contactValid && flow.receiverId === site.flowReceiver.id;
    const result = touching && flow.result === this.lastFlowResult && flow.result?.acceptedCurrent01 > 0 ? flow.result : null;
    uniforms.shelfContact.value = touching ? 1 : 0;
    uniforms.shelfPressure.value = result?.pressure01 ?? 0;
    uniforms.shelfDeliveryProgress.value = result ? deliveryProgress : 0;
    collarMaterial.color.copy(collarColor).lerp(imprintColor, 0.72 * Math.sqrt(clampFlow(site.imprint)));
  }

  readFlowPatch(frameState) {
    if (!this.flowPatch || !inSiltFlowWorld(frameState)) return null;
    for (let node = this.flowPatch.mesh; node; node = node.parent) {
      if (!node.visible) return null;
    }
    const { site, mesh } = this.flowPatch;
    const { id, radius, conductivity, resistance } = site.flowReceiver;
    return {
      id, siteId: site.id, radius, conductivity, resistance, root: mesh,
      center: mesh.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()))
    };
  }

  readFlowCandidate(frameState, playerPosition) {
    const patch = this.readFlowPatch(frameState);
    if (!patch || patch.center.distanceTo(playerPosition) > 3.2) return null;
    return { id: patch.siteId, label: this.flowPatch.site.name, cellId: this.spec.cell, root: patch.root,
      attentionScope: 'local_object', targetKind: 'silt_flow_receiver', source: 'silt:RegionalTerritoryExpansion' };
  }

  acceptFlow(request, frameState) {
    const patch = this.readFlowPatch(frameState);
    const step = readFlowStep(frameState);
    const aim = readFlowAim(frameState);
    const profile = readFlowCoreProfile(frameState);
    if (!patch || !step || !aim || request.receiverId !== patch.id
      || Object.keys(step).some(key => request[key] !== step[key])
      || Object.keys(aim).some(key => request[key] !== aim[key])
      || Object.keys(profile).some(key => request.profile?.[key] !== profile[key])
      || !Number.isSafeInteger(request.actionSequence) || request.actionSequence <= 0
      || request.actionSequence !== frameState.input?.flowActionSequence
      || !(request.demand01 > 0 && request.demand01 <= 1) || request.demand01 !== frameState.input.flowDemand01
      || !Number.isFinite(request.dt) || request.dt <= 0 || request.dt > MAX_FLOW_STEP
      || (frameState.runtimeSimulationSubstepSeconds != null && request.dt !== frameState.runtimeSimulationSubstepSeconds)) return null;

    const last = this.lastFlowResult;
    if (last && (request.actionSequence < last.actionSequence || step.frame < last.frame
      || (request.actionSequence === last.actionSequence && (step.mountSequence !== last.mountSequence
        || step.hostId !== last.hostId || aim.attentionSequence !== last.attentionSequence))
      || (step.frame === last.frame && step.substep <= last.substep))) return null;
    const contact = contactFlowPatch(patch, request.origin, request.direction, request.reach);
    if (!contact) return null;

    const site = this.flowPatch.site;
    const before = { imprint: site.imprint, strain: site.strain, void: site.void };
    const resistance01 = clampFlow(patch.resistance + before.imprint * 0.28 + (1 - contact.facing) * 0.28);
    const acceptedCurrent01 = Math.min(0.55, request.demand01, clampFlow(request.requestedCurrent01))
      * patch.conductivity * (1 - resistance01);
    const pressure01 = Math.min(0.22, acceptedCurrent01 * 0.7);
    site.imprint = clampFlow(before.imprint + pressure01 * request.dt * 0.42);
    const after = { ...before, imprint: site.imprint };
    const result = {
      ...step, ...aim, actionSequence: request.actionSequence, receiverId: patch.id, siteId: site.id,
      owner: 'silt:RegionalTerritoryExpansion', conductivity01: patch.conductivity, resistance01,
      profile,
      acceptedCurrent01, pressure01, before, after, retainedDuringSession: true,
      materialTransferred: 0, progressionCredit: false, hostReceipt: false
    };
    this.lastFlowResult = result;
    const snapshot = frameState.territoryExploration;
    if (snapshot?.owner === result.owner && snapshot.active) {
      frameState.territoryExploration = { ...snapshot, lastFlowResult: result,
        siteStates: snapshot.siteStates.map(value => value.id === site.id
          ? { ...value, imprint: Number(site.imprint.toFixed(3)) } : value) };
    }
    return result;
  }

  update({ dt = 0, time = 0, playerPosition = null, input = {}, signal01 = 0,
    circuitStatus = 'local', frameState = null } = {}) {
    const step = Math.max(0, Math.min(0.12, safeNumber(dt)));
    this.elapsed += step;
    const signal = territoryClamp01(signal01);
    const physiology=C0E3_PHYSIOLOGY[this.kind];
    for(const site of this.sites){
      site.c0e3Cooldown=Math.max(0,site.c0e3Cooldown-step);
      site.c0e3ReliefFlash=Math.max(0,site.c0e3ReliefFlash-step*0.9);
    }
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
      // The global counter can advance while this territory is unmounted.
      // Consume that cursor without replaying a release from another region.
      if (eligible && input.pulsePressed === true) this.observe(nearest, 'pulse', signal, frameState);
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
      // C0E3: a distinct physical language for each local physiology.
      // All deformation is presentation-only, with bounded amplitudes.
      const nativeHeight=this.kind === 'vascular' ? 1.05 : this.kind === 'hub' ? 1.35 : this.kind === 'grave' ? 0.19 : 0.29;
      const wave=Math.sin(this.elapsed*physiology.cadence+index*2.094);
      const regionalShape=this.kind==='silt'
        ? -site.strain*0.17+site.imprint*0.08+site.c0e3ReliefFlash*0.14
        : this.kind==='vascular' ? site.strain*0.15+wave*0.095
        : this.kind==='grave' ? site.imprint*0.11-site.void*0.08+site.c0e3ReliefFlash*0.18
        : site.imprint*0.07+wave*0.075+site.c0e3ReliefFlash*0.1;
      site.body.scale.y = nativeHeight * (1 + signal * 0.08 + nearby * 0.07 + breath + site.response * 0.14 + regionalShape);
      if(this.kind==='vascular') site.body.scale.x=0.7*(1+site.strain*0.14+wave*0.04);
      if(this.kind==='grave') site.shelves.forEach((plate,i)=>{plate.position.y=(i-1)*0.18+site.imprint*0.07-site.void*0.08;});
      site.group.rotation.y = Math.sin(phase * 0.34) * 0.045;
      site.baseMaterial.emissiveIntensity = 0.045 + signal * 0.17 + nearby * 0.055 + site.response * 0.32;
      site.accentMaterial.emissiveIntensity = 0.06 + signal * 0.11 + site.response * 0.29;
      site.fleckMaterial.opacity = 0.2 + signal * 0.19 + nearby * 0.13 + site.response * 0.28;
      site.nerveMaterial.opacity = 0.20 + signal * 0.27 + nearby * 0.1;
      // Persist during the session, including return visits. No automatic
      // decay removes a successful local experiment between two encounters.
      site.group.scale.y = 1 + site.imprint * 0.22 - site.strain * 0.11;
      site.group.scale.x = 1 + site.strain * 0.13 - site.void * 0.08;
      site.baseMaterial.emissiveIntensity += site.imprint * 0.13+site.c0e3ReliefFlash*0.37;
      site.pocketMaterial.opacity = 0.10 + site.imprint * 0.10 + site.strain * 0.045;
      site.passageMaterial.opacity = 0.19 + signal * 0.1 + site.imprint * 0.16;
      site.apertureMaterial.emissiveIntensity = 0.08 + site.strain * 0.25 + site.imprint * 0.13;
      // Local response takes its identity from actual retained states, not a timer.
      site.pocketBody.scale.y = site.pocket.radii.y * 0.66 * (1 + site.void*0.07 + site.imprint*0.09);
      const distalDistance = localPosition ? site.pocketLocal.distanceTo(localPosition) : Infinity;
      if (distalDistance <= 2.4 && !site.pocketVisited) {
        site.pocketVisited = true;
        if (frameState) frameState.territoryExplorationLastPocket = {
          kind: 'c0e2_pocket_discovered', region: this.kind, siteId: site.id,
          pocketId: site.id, noProgressionCredit: true, noHostReceipt: true
        };
      }
    }
    for (const link of this.localLinks) {
      link.response = Math.max(0, link.response-step*0.42);
      const source=this.sites[link.from], receiver=this.sites[link.to];
      link.material.opacity=0.085 + Math.min(0.18,(source.strain+receiver.imprint+receiver.void)*0.032) + link.response*0.32;
      link.material.emissiveIntensity=0.07+link.response*0.41+receiver.imprint*0.08;
      if(link.packet){
        const packet=c0e3AdvancePacket(link.packet,step);
        link.packet=packet.complete?null:packet;
        if(packet.complete){
          this.c0e3WavesCompleted++;
          if(packet.delivered) receiver.response=Math.min(1,receiver.response+0.23);
        }
        link.packetMarker.visible=!packet.complete;
        if(!packet.complete){
          link.packetMarker.position.copy(link.curve.getPoint(packet.progress));
          link.packetMarker.scale.setScalar(0.8+packet.intensity*0.5);
          link.packetMaterial.opacity=Math.min(0.93,packet.intensity*0.8);
          link.material.emissiveIntensity+=packet.intensity*0.68;
          link.material.opacity+=packet.intensity*0.14;
        }
      } else link.packetMarker.visible=false;
    }
    if (frameState) frameState.territoryExploration = this.snapshot({signal01: signal, circuitStatus,
      nearestDistance, localPosition});
  }

  observe(site, verb, signal, frameState) {
    if (!site || !Object.prototype.hasOwnProperty.call(this.observationCount, verb)) return;
    site.observations += 1;
    site.lastVerb = verb;
    site.response = Math.min(1, site.response + (verb === 'pulse' ? 0.8 : 0.5));
    const before = {imprint: site.imprint, strain: site.strain, void: site.void};
    const sourceIndex=this.sites.indexOf(site);
    const hostResponse = this.readHostResponse(verb, frameState);
    const result = c0e2bApplyLocalCoupling(this.kind, this.sites, sourceIndex, verb, hostResponse);
    const relief=c0e3ApplyPressureRelief(this.kind,this.sites,sourceIndex,result);
    if(relief.applied) this.c0e3ReliefCount++;
    const packets=c0e3CreatePackets(this.kind,sourceIndex,result);
    for(const packet of packets){
      const link=this.localLinks.find(item=>item.from===packet.from&&item.to===packet.to);
      if(link){
        link.response=Math.min(1,link.response+(packet.kind==='transmission'?0.42:0.24));
        // Rapid consecutive presses must not reset a signal that is already
        // traveling. Keep its leading edge and bound the amplitude; no queue.
        if(!link.packet || (link.packet.kind==='dissipation'&&packet.kind==='transmission')){
          link.packet=packet;
        }else if(link.packet.kind==='transmission'&&packet.kind==='transmission'){
          link.packet.amount=Math.min(1,link.packet.amount+packet.amount);
        }
      }
      if(packet.kind==='dissipation') this.c0e3DissipationCount++;
    }
    this.lastLivingResponse={mode:C0E3_PHYSIOLOGY[this.kind].name,relief,
      emittedPackets:packets.map(({from,to,kind,amount,duration})=>({
        fromSiteId:this.sites[from].id,toSiteId:this.sites[to].id,kind,amount,duration})),
      noHostReceipt:true,noMaterialTransfer:true,noProgressionCredit:true};
    this.lastLocalCircuit=result;
    this.observationCount[verb] += 1;
    const event = {
      kind: 'c0e1_local_exploratory_read', region: this.kind, siteId: site.id,
      verb, localSequence: ++this.experimentSequence, signal01: Number(signal.toFixed(3)),
      question: site.question, noHostReceipt: true, noMatterTransfer: true,
      noProgressionCredit: true, localConsequence: true, retainedDuringSession: true,
      before, after: {imprint: site.imprint, strain: site.strain, void: site.void},
      livingCircuit:this.lastLivingResponse,
      localCircuit: { ...result, siteStates:result.siteStates.map(({index,before})=>({siteId:this.sites[index].id,before,
        after:{imprint:this.sites[index].imprint,strain:this.sites[index].strain,void:this.sites[index].void}})),
        transfer:result.transfer.map(row=>({...row,fromSiteId:this.sites[row.from].id,toSiteId:this.sites[row.to].id})) }
    };
    this.lastLocalExperiment = event;
    this.experiments.push(event);
    if (this.experiments.length > 12) this.experiments.shift();
    if (frameState) frameState.territoryExplorationLastRead = event;
  }

  readHostResponse(verb, frameState) {
    if (this.kind === 'hub' || frameState?.activeCellId !== this.spec.cell) return null;
    const composition = frameState.verbComposition;
    if (composition?.owner !== 'VerbCompositionSystem' || composition.intent?.[verb] !== true) return null;
    const chemistry = readLocalChemistryContext(frameState);
    if (!chemistry) return null;

    // observe() has already accepted the release edge or held verb at a site.
    // Sites are ambient material, so the released Pulse uses its ambient strength.
    const strength01 = verb === 'pulse'
      ? (0.65 + 0.35 * territoryClamp01(frameState.input?.pulseReleaseCharge01))
        * territoryClamp01(composition.effects?.pulseAmbientMultiplier ?? 1)
      : 1;
    return { domains: chemistry.domains, strength01 };
  }

  snapshot({ signal01 = 0, circuitStatus = 'local', nearestDistance = Infinity, localPosition = null } = {}) {
    const remaining=this.sites.filter(site=>!site.pocketVisited && site.pocketLocal);
    const nearestUnvisited=localPosition && remaining.length
      ? remaining.map(site=>({siteId:site.id, distance:site.pocketLocal.distanceTo(localPosition)}))
        .sort((a,b)=>a.distance-b.distance)[0]
      : null;
    return {
      pass: 'C0E1', owner: `${this.kind}:RegionalTerritoryExpansion`,
      region: this.kind, active: true, circuitStatus, signal01,
      grammar: '3_6_12', structuralSites: 3, counterpartRibsPerSite: 6,
      phaseFlecksPerSite: 12, nearestSiteId: this.nearestSite?.id ?? null,
      nearestSiteDistance: Number.isFinite(nearestDistance) ? Number(nearestDistance.toFixed(2)) : null,
      observations: { ...this.observationCount },
      lastRead: this.lastLocalExperiment,
      ...(this.lastFlowResult ? { lastFlowResult: this.lastFlowResult } : {}),
      c0e2b: {pass:'C0E2-B', links:this.localLinks.length, mechanism:'bounded_local_three_node_coupling',
        lastResponse:this.lastLocalCircuit?.localResponse ?? 'none',
        lastTransmitted:this.lastLocalCircuit?.transmitted ?? 0,
        lastDissipated:this.lastLocalCircuit?.dissipated ?? 0,
        noHostReceipt:true, noProgressionCredit:true},
      siteStates: this.sites.map(site => ({ id: site.id, reads: site.observations,
        lastVerb: site.lastVerb, pocketVisited: site.pocketVisited,
        imprint: Number(site.imprint.toFixed(3)), strain: Number(site.strain.toFixed(3)),
        void: Number(site.void.toFixed(3)) })),
      c0e3: {pass:'C0E3',mode:C0E3_PHYSIOLOGY[this.kind].name,
        activeTravelingPackets:this.localLinks.filter(link=>link.packet).length,
        completedWaves:this.c0e3WavesCompleted,
        shortDissipationPackets:this.c0e3DissipationCount,
        deliberateCapacityReliefs:this.c0e3ReliefCount,
        lastLivingResponse:this.lastLivingResponse,
        visualOnly:true,originalHostCircuitUnchanged:true},
      c0e2bNearestUnvisitedPocket: nearestUnvisited
        ? {siteId:nearestUnvisited.siteId,distance:Number(nearestUnvisited.distance.toFixed(2))} : null,
      pocketCount: 3, pocketsVisited: this.sites.filter(site => site.pocketVisited).length,
      localStateRetainedDuringSession: true, c0e2MovementVolumeOwner: 'PlayerMovementController',
      newPhysics: true, movementBoundaryChanged: true, routeProgressionChanged: false,
      hostReceiptChanged: false, materialTransferred: false
    };
  }
}
