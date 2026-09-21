import * as THREE from "three";

const ROUTE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const TARGETS = {
  retainedDraw: "residue_silt_cloud_001",
  coherentPush: "scar_lock_plate_001",
  heldEquilibrium: "inheritance_seed_remnant_001"
};
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

/**
 * HC031A1 Grave II octave-resonance correction.
 *
 * Grave I remains fully present. This layer appears only on the second entry,
 * deepens the same landmarks, and asks the HC029/030 grammar to resolve three
 * counterpart reads. It cannot target, resolve primitive verbs, or own crossings.
 */
export class GraveReturnRegionSystem {
  constructor({ scene, playerRoot, frameState, graveMemoryRouteSystem }) {
    if (!scene || !playerRoot || !frameState || !graveMemoryRouteSystem) {
      throw new Error("[GraveReturnRegionSystem] scene, playerRoot, frameState and graveMemoryRouteSystem are required.");
    }
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.graveMemoryRouteSystem = graveMemoryRouteSystem;
    this.root = new THREE.Group();
    this.root.name = "grave_return_region_phase_2_HC031A";
    this.root.visible = false;
    this.root.userData.targetingSuppressed = true;
    this.strata = [];
    this.knots = new Map();
    this.progress = { retainedDraw: 0, coherentPush: 0, heldEquilibrium: 0 };
    this.completed = false;
    this.active = false;
    this.wasActive = false;
    this.latchedLayout = null;
    this.completionSequence = 0;
    this.lastEvent = "grave_ii_dormant";
    this.baseAnatomyTransforms = null;
    this.activeAge = 0;
    this.lastLayoutSignature = "none";
    this.materials = [];
  }

  init() {
    this.createVisuals();
    // GraveMemoryRouteSystem is region-lazy; keep the return layer scene-owned
    // and align it to the authored Grave root only while that route is mounted.
    this.scene.add(this.root);
    this.publish(this.frameState);
  }

  createVisuals() {
    const pathMaterial = this.track(new THREE.MeshStandardMaterial({
      color: 0x6f526c,
      emissive: 0x6a415f,
      emissiveIntensity: 0.10,
      roughness: 0.82,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    }));

    const basePoints = [
      new THREE.Vector3(-3.4, -0.1, -5.0),
      new THREE.Vector3(2.9, 0.3, -9.0),
      new THREE.Vector3(3.1, -0.1, -13.2),
      new THREE.Vector3(-2.7, 0.5, -17.0)
    ];
    const curve = new THREE.CatmullRomCurve3(basePoints);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.055, 7, false), pathMaterial);
    tube.name = "grave_ii_remembered_path_thread";
    tube.userData.targetingSuppressed = true;
    this.root.add(tube);

    for (let i = 0; i < 7; i += 1) {
      const material = this.track(pathMaterial.clone());
      material.opacity = 0.055 + (i % 3) * 0.018;
      const shell = new THREE.Mesh(new THREE.TorusGeometry(1.2 + i * 0.08, 0.035, 6, 28), material);
      shell.name = `grave_ii_echo_stratum_${i + 1}`;
      shell.position.set((i % 2 ? 1 : -1) * (1.15 + (i % 3) * 0.4), 0.05 + (i % 2) * 0.36, -5.3 - i * 1.9);
      shell.rotation.set(1.2 + i * 0.06, 0.18 * i, 0.15 * (i % 2 ? 1 : -1));
      shell.userData.basePosition = shell.position.clone();
      shell.userData.baseScale = shell.scale.clone();
      shell.userData.phase = i * 0.71;
      shell.userData.targetingSuppressed = true;
      this.root.add(shell);
      this.strata.push(shell);
    }

    this.createKnot("retainedDraw", new THREE.Vector3(2.9, 0.75, -9.0), 0x9fc7ba);
    this.createKnot("coherentPush", new THREE.Vector3(3.1, 0.15, -13.2), 0xd7a28d);
    this.createKnot("heldEquilibrium", new THREE.Vector3(-2.7, 0.92, -17.0), 0xc2acd8);
  }

  createKnot(id, position, color) {
    const material = this.track(new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.13,
      roughness: 0.46,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    }));
    const knot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), material);
    knot.name = `grave_ii_${id}_witness`;
    knot.position.copy(position);
    knot.userData.basePosition = position.clone();
    knot.userData.targetingSuppressed = true;
    this.root.add(knot);
    this.knots.set(id, knot);
  }

  track(material) {
    this.materials.push(material);
    return material;
  }

  update(dt, frameState = this.frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const graveRouteState = history.routeStates?.grave_memory_route ?? {};
    const authoritativeEntryCount = graveRouteState.entryCount ?? history.graveEntryCount ?? 0;
    const authoritativeReturned = Boolean(graveRouteState.returned || history.graveReturned);
    const secondVisit = authoritativeEntryCount >= 2 && authoritativeReturned;
    const inGrave = frameState.activeCellId === ROUTE_CELL_ID;
    this.active = Boolean(inGrave && secondVisit);
    this.root.visible = this.active;

    if (!this.active) {
      if (this.wasActive) { this.restoreAuthoredObjectPositions(); this.restoreBaseAnatomyTransforms(); }
      this.wasActive = false;
      this.publish(frameState);
      return;
    }

    const graveRoot = this.graveMemoryRouteSystem.root;
    if (graveRoot) this.root.position.copy(graveRoot.position);

    if (!this.wasActive) {
      this.latchedLayout = JSON.parse(JSON.stringify(frameState.returnRegionEngine?.graveLayout ?? {}));
      this.lastLayoutSignature = "none";
      this.captureBaseAnatomyTransforms();
      this.activeAge = 0;
      this.lastEvent = this.completed ? "grave_ii_reentered_resolved" : "grave_ii_octave_2_resonance_activated";
    }
    this.wasActive = true;
    this.activeAge += Math.max(0, Math.min(dt ?? 0, 0.08));
    this.applyLayout(this.latchedLayout);
    // GraveMemoryRouteSystem updates its living anatomy earlier in the frame.
    // Re-apply octave growth every frame so Host rhythm animates *inside* the
    // larger return structure instead of erasing the return growth after one tick.
    this.applyOctaveGrowth(this.latchedLayout);
    this.syncRegionalResolution(frameState);
    this.animate(frameState.runtimeSeconds ?? 0);
    this.publish(frameState);
  }

  applyLayout(layout) {
    const outputs = layout?.outputs ?? {};
    const signature = JSON.stringify(outputs);
    if (signature === this.lastLayoutSignature) return;
    this.lastLayoutSignature = signature;

    const depthScale = Number.isFinite(outputs.depthScale) ? outputs.depthScale : 1;
    const lateralBias = Number.isFinite(outputs.lateralBias) ? outputs.lateralBias : 0;
    const verticalBias = Number.isFinite(outputs.verticalBias) ? outputs.verticalBias : 0;
    const compression = Number.isFinite(outputs.compression) ? outputs.compression : 0.72;
    const twist = Number.isFinite(outputs.twist) ? outputs.twist : 0;

    this.strata.forEach((shell, index) => {
      const base = shell.userData.basePosition;
      shell.position.set(
        base.x + lateralBias * (0.18 + index * 0.025),
        base.y + verticalBias * (index / Math.max(1, this.strata.length - 1)),
        base.z * depthScale
      );
      shell.scale.set(0.92 + compression * 0.18, 0.72 + compression * 0.28, 0.92 + compression * 0.18);
      shell.userData.layoutScale = shell.scale.clone();
      shell.rotation.z = twist * (index % 2 ? -1 : 1);
    });

    this.applyAuthoredObjectLayout({ depthScale, lateralBias, verticalBias });
  }

  applyAuthoredObjectLayout({ depthScale, lateralBias, verticalBias }) {
    const route = this.graveMemoryRouteSystem;
    const entry = route.entryAnchor;
    const ids = [TARGETS.retainedDraw, TARGETS.coherentPush, TARGETS.heldEquilibrium];
    ids.forEach((id, index) => {
      const item = route.objectItems.get(id);
      const base = route.objectOffsets.get(id);
      if (!item || !base) return;
      const t = (index + 1) / ids.length;
      const local = base.clone();
      local.z *= 1 + (depthScale - 1) * (0.48 + t * 0.52);
      local.x += lateralBias * (0.08 + t * 0.10) * (index % 2 ? 1 : -1);
      local.y += verticalBias * (0.10 + t * 0.16);
      item.root.position.copy(entry).add(local);
      const knot = this.knots.get(Object.keys(TARGETS).find((key) => TARGETS[key] === id));
      if (knot) knot.position.copy(local).add(new THREE.Vector3(0, 0.4, 0));
    });
  }

  captureBaseAnatomyTransforms() {
    if (this.baseAnatomyTransforms) return;
    const route = this.graveMemoryRouteSystem;
    this.baseAnatomyTransforms = {
      bed: route.memoryBedBody ? { position: route.memoryBedBody.position.clone(), scale: route.memoryBedBody.scale.clone() } : null,
      ribs: (route.scarRibs ?? []).map((item) => ({ item, position: item.position.clone(), scale: item.scale.clone() })),
      strata: [...(route.anatomyCohesionRoot?.children ?? [])].map((item) => ({ item, position: item.position.clone(), scale: item.scale.clone() })),
      wall: route.root?.getObjectByName?.("grave_memory_distant_marow_wall") ?? null
    };
    if (this.baseAnatomyTransforms.wall) {
      this.baseAnatomyTransforms.wallPosition = this.baseAnatomyTransforms.wall.position.clone();
      this.baseAnatomyTransforms.wallScale = this.baseAnatomyTransforms.wall.scale.clone();
    }
  }

  applyOctaveGrowth(layout) {
    const base = this.baseAnatomyTransforms;
    if (!base) return;
    const octave = layout?.octave ?? {};
    const outputs = layout?.outputs ?? {};
    const targetResonance = clamp01(octave.resonance01 ?? outputs.resonance01 ?? 0.5);
    const revealT = clamp01(this.activeAge / 2.2);
    const reveal = revealT * revealT * (3 - 2 * revealT);
    const resonance = targetResonance * reveal;
    const targetDepthScale = Number.isFinite(outputs.depthScale) ? outputs.depthScale : 1.35;
    const depthScale = 1 + (targetDepthScale - 1) * reveal;
    const spread = Number.isFinite(octave.harmonicSpread) ? octave.harmonicSpread : 1;
    const phase = Number.isFinite(octave.resonancePhase) ? octave.resonancePhase : 0;

    // The original anatomy is the fundamental. Grave II grows that same structure
    // outward/deeper; no replacement room or random shell is generated.
    base.ribs.forEach(({ item, position, scale }, index) => {
      const t = (index + 1) / Math.max(1, base.ribs.length);
      item.position.set(
        position.x * (1 + resonance * 0.14) + Math.sin(phase + index * 0.72) * 0.18 * spread,
        position.y + Math.cos(phase * 0.5 + index) * 0.10 * resonance,
        position.z * (1 + (depthScale - 1) * (0.55 + t * 0.45))
      );
      item.scale.set(scale.x * (1 + resonance * 0.12), scale.y * (1 + resonance * 0.20), scale.z * (1 + resonance * 0.10));
    });

    base.strata.forEach(({ item, position, scale }, index) => {
      const t = (index + 1) / Math.max(1, base.strata.length);
      item.position.set(
        position.x * (1 + resonance * 0.20) + Math.sin(phase + index * 0.9) * 0.22 * spread,
        position.y + Math.sin(phase * 0.7 + index * 0.6) * 0.16 * resonance,
        position.z * (1 + (depthScale - 1) * (0.62 + t * 0.38))
      );
      item.scale.set(scale.x * (1 + resonance * 0.16), scale.y * (1 + resonance * 0.10), scale.z * (1 + resonance * 0.22));
    });

    if (base.wall && base.wallPosition && base.wallScale) {
      base.wall.position.copy(base.wallPosition);
      base.wall.position.z *= depthScale;
      base.wall.scale.set(
        base.wallScale.x * (1 + resonance * 0.18),
        base.wallScale.y * (1 + resonance * 0.12),
        base.wallScale.z
      );
    }

    // Host rhythm continues to animate the bed; this multiplies its post-rhythm
    // frame state just enough to make octave growth perceptible without a giant cage.
    if (this.graveMemoryRouteSystem.memoryBedBody) {
      const bed = this.graveMemoryRouteSystem.memoryBedBody;
      bed.scale.x *= 1 + resonance * 0.10;
      bed.scale.z *= 1 + resonance * 0.18;
      bed.position.z = (base.bed?.position.z ?? bed.position.z) * (1 + (depthScale - 1) * 0.30);
    }
  }

  restoreBaseAnatomyTransforms() {
    const base = this.baseAnatomyTransforms;
    if (!base) return;
    base.ribs.forEach(({ item, position, scale }) => { item.position.copy(position); item.scale.copy(scale); });
    base.strata.forEach(({ item, position, scale }) => { item.position.copy(position); item.scale.copy(scale); });
    if (base.wall && base.wallPosition && base.wallScale) { base.wall.position.copy(base.wallPosition); base.wall.scale.copy(base.wallScale); }
    if (base.bed && this.graveMemoryRouteSystem.memoryBedBody) {
      this.graveMemoryRouteSystem.memoryBedBody.position.copy(base.bed.position);
      this.graveMemoryRouteSystem.memoryBedBody.scale.copy(base.bed.scale);
    }
  }

  restoreAuthoredObjectPositions() {
    const route = this.graveMemoryRouteSystem;
    const entry = route.entryAnchor;
    for (const id of Object.values(TARGETS)) {
      const item = route.objectItems.get(id);
      const base = route.objectOffsets.get(id);
      if (item && base) item.root.position.copy(entry).add(base);
    }
  }

  syncRegionalResolution(frameState) {
    const regional = frameState.graveResonanceGameplay ?? {};
    this.completed = Boolean(this.completed || regional.completed);
    if (regional.completed) this.lastEvent = `grave_ii_${regional.resolutionId ?? "regional_resonance"}_resolved`;
  }

  animate(time) {
    const instability = this.frameState.returnRegionEngine?.graveLayout?.outputs?.instability ?? 0.2;
    const density = this.frameState.returnRegionEngine?.graveLayout?.outputs?.echoDensity ?? 0.4;
    this.strata.forEach((shell, index) => {
      const pulse = Math.sin(time * (0.48 + instability * 0.7) + shell.userData.phase) * (0.018 + instability * 0.035);
      const layoutScale = shell.userData.layoutScale ?? shell.userData.baseScale;
      shell.scale.copy(layoutScale);
      shell.scale.y = layoutScale.y * (1 + pulse);
      shell.material.opacity = 0.045 + density * 0.075 + (index % 2) * 0.008;
    });
    for (const [id, knot] of this.knots.entries()) {
      const progress = this.progress[id] ?? 0;
      const breath = 1 + Math.sin(time * 1.25 + progress * 2.2) * 0.055;
      knot.scale.setScalar(breath * (0.92 + progress * 0.35));
      knot.material.opacity = 0.14 + progress * 0.28;
      knot.material.emissiveIntensity = 0.10 + progress * 0.42;
    }
  }

  publish(frameState) {
    const regional = frameState.graveResonanceGameplay ?? {};
    const nodes = regional.nodes ?? {};
    const total = regional.regional?.resolutionHold01 ?? 0;
    frameState.graveReturnRegion = {
      pass: "HC-031A1",
      active: this.active,
      phase: 2,
      label: "Grave II — Resonant Octave: Retained Consequence",
      baseRegionDNA: "grave_memory_route",
      recognizableLandmarksRetained: true,
      layoutEquationId: this.latchedLayout?.equationId ?? frameState.returnRegionEngine?.graveLayout?.equationId ?? "pending",
      layoutInputs: this.latchedLayout?.inputs ?? null,
      layoutOutputs: this.latchedLayout?.outputs ?? null,
      progress: {
        retainedDraw: Number((nodes.retainedDraw?.level01 ?? 0).toFixed(3)),
        coherentPush: Number((nodes.coherentPush?.level01 ?? 0).toFixed(3)),
        heldEquilibrium: Number((nodes.heldEquilibrium?.level01 ?? 0).toFixed(3)),
        total: Number(total.toFixed(3))
      },
      regionalGameplayOwner: "GraveResonanceGameplaySystem",
      resolutionRule: "sustained_regional_resonance_condition_not_exact_combo",
      completed: this.completed,
      returnBlockedUntilResolved: false,
      exitSafety: "base_grave_return_fold_never_blocked_by_phase_2",
      octave: this.latchedLayout?.octave ?? null,
      octaveReveal01: Number(clamp01(this.activeAge / 2.2).toFixed(3)),
      newAbilityButtons: 0,
      newTargetingAuthority: false,
      routeCrossingAuthority: false,
      gameplayOwner: "GraveReturnRegionSystem",
      lastEvent: this.lastEvent
    };
  }
}
