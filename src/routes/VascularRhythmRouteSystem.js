import * as THREE from "three";

const ROUTE_CELL_ID = "CELL_VASCULAR_RHYTHM_ROUTE_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const RECIPE_ID = "VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A1";

/**
 * HC-011A1 retains the HC-011A Vascular circuit and repairs its post-read
 * recovery contract. Locked cadence reads cannot be erased, extra Pulse input
 * after 3/3 is harmless, and one bounded Stabilize hold can always settle the
 * route. The system still never moves the player, changes activeCellId,
 * completes an objective, or crosses a gate directly.
 */
export class VascularRhythmRouteSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[VascularRhythmRouteSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[VascularRhythmRouteSystem] scene is required.");
    if (!playerRoot) throw new Error("[VascularRhythmRouteSystem] playerRoot is required.");
    if (!frameState) throw new Error("[VascularRhythmRouteSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.root = null;
    this.pathCurve = null;
    this.pathPoints = [];
    this.pathSegmentLengths = [];
    this.pathCumulativeLengths = [0];
    this.pathLength = 0;
    this.vesselEnvelope = null;
    this.braidTubes = [];
    this.wallFolds = [];
    this.valves = [];
    this.currentMotes = [];
    this.chargeRoot = null;
    this.chargeCore = null;
    this.chargeLight = null;
    this.chargeTrail = [];
    this.returnFold = null;
    this.returnFoldLobes = [];
    this.materials = [];

    this.entryAnchor = new THREE.Vector3();
    this.returnPosition = new THREE.Vector3();
    this.localPlayer = new THREE.Vector3();
    this.previousPlayerPosition = new THREE.Vector3();
    this.derivedVelocity = new THREE.Vector3();
    this.closestPoint = new THREE.Vector3();
    this.closestTangent = new THREE.Vector3(0, 0, -1);
    this.segmentVector = new THREE.Vector3();
    this.segmentStartToPlayer = new THREE.Vector3();
    this.tempPoint = new THREE.Vector3();
    this.tempPointB = new THREE.Vector3();
    this.tempColor = new THREE.Color();
    this.chargeWorldPosition = new THREE.Vector3();

    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.beatElapsed = 0;
    this.returnElapsed = 0;
    this.cadencePhase = 0;
    this.chargeProgress = 0.04;
    this.pathProgress = 0;
    this.maxDepthProgress = 0;
    this.pathDistance = 0;
    this.chargeDistance = Number.POSITIVE_INFINITY;
    this.flowAlignment = 0;
    this.contractionIntensity = 0;
    this.synchronization = 0.12;
    this.circulationIntegrity = 1;
    this.turbulence = 0;
    this.stabilizeSeconds = 0;
    this.matchedFlowSeconds = 0;
    this.lockedCadenceReads = 0;
    this.riskEventCount = 0;
    this.offBeatPulseCount = 0;
    this.recoverySeconds = 0;
    this.desynchronizationRecovered = false;
    this.desynchronized = false;
    this.stabilizing = false;
    this.stabilizationInRange = false;
    this.stabilizationRange = 0;
    this.postReadPulseIgnoredCount = 0;
    this.completed = false;
    this.returnFoldReady = false;
    this.lastPulseEventId = 0;
    this.lastInteraction = "none";
    this.warning = "none";
    this.pulseFlashAge = 99;

    // HC018C: traversal-material response. These values never own cadence,
    // completion, targeting, chemistry or route crossing truth.
    this.traversalPulseWake = 0;
    this.traversalAbsorbShear = 0;
    this.traversalStabilizeCalm = 0;
    this.traversalMaterialMode = "ride_current";

    // HC027L1 — three presentation-only reinforcement windows reuse the current,
    // wall folds and contraction field so the long vascular middle repeats the
    // Pulse / Absorb / Stabilize grammar without adding prompts, targets or gates.
    this.grammarReinforcementMode = "none";
    this.grammarReinforcementStrength = 0;
    this.grammarReinforcementMatched = false;
    this.grammarReinforcementWindow = 0;

    // HC018D: retained anatomical consequence presentation only.
    this.retainedSynchronizationStrength = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.vascularRhythmRouteCircuit;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[VascularRhythmRouteSystem] Missing ${RECIPE_ID}.`);
    }
    this.pathPoints = (this.recipe.anatomy?.pathPoints ?? [])
      .map((point) => new THREE.Vector3().fromArray(point));
    if (this.pathPoints.length < 5) {
      throw new Error("[VascularRhythmRouteSystem] Vascular path requires at least five authored points.");
    }
    this.buildPathMetrics();
    this.pathCurve = new THREE.CatmullRomCurve3(this.pathPoints, false, "centripetal", 0.42);
    this.createAnatomy();
    this.setVisible(false);
    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.setVisible(false);
    this.publish(frameState, false);
    return {
      status: "vascular_rhythm_route_prepared_hidden",
      rootCount: 1,
      valveCount: this.valves.length,
      activeCellId: frameState.activeCellId,
      mutatesProgression: false
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.entryAnchor.copy(this.playerRoot.position);
    this.previousPlayerPosition.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);
    const returnOffset = this.recipe.returnFold?.position ?? [0, 0.05, 0.62];
    this.returnPosition.copy(this.entryAnchor).add(this.tempPoint.fromArray(returnOffset));
    this.setVisible(true);
    this.lastInteraction = this.completed
      ? "returned_to_synchronized_circulation"
      : "entered_vascular_current_without_forced_relocation";
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.setVisible(false);
    this.lastInteraction = frameState.activeCellId === HUB_CELL_ID
      ? "returned_to_hub_through_vascular_fold"
      : "vascular_rhythm_route_unmounted";
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== ROUTE_CELL_ID) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    this.elapsed += dt;
    this.pulseFlashAge += dt;
    if (this.completed) this.returnElapsed += dt;
    else this.beatElapsed += dt;

    const sample = this.samplePlayerPath(dt, frameState);
    this.updateCadence(dt, frameState, sample);
    this.updateTraversalMaterialResponse(dt, frameState, sample);
    this.updateGrammarReinforcement(frameState, sample);
    this.applyDynamicCurrent(frameState, sample);
    this.animate(dt, frameState, sample);
    this.applyHostRhythmVisual(frameState);
    this.publish(frameState, true);
  }



  applyHostRhythmVisual(frameState) {
    const host = frameState.hostRhythm ?? {};
    if (!host.active) return;

    const composition = host.composition ?? {};
    const composed = composition.active && composition.profileId === "vascular_psa_44_micro";

    // HC028C2 keeps HC028C's single Host clock and restrained movement force,
    // but makes the meter perceptually legible. 1 transmits, 2 catches/holds,
    // 3 draws inward, 4 settles/prepares. The player never has to hit a beat.
    const phase = composed
      ? ((composition.barPhase ?? 0) + 0.03) % 1
      : ((host.normalizedPhase ?? 0) + 0.03) % 1;
    const wave = Math.sin(phase * Math.PI * 2 - Math.PI * 0.5);
    const surge = 0.5 + 0.5 * wave;
    const beatPulse = composed ? (composition.beatPulse ?? 0) : surge;
    const accent = composed ? (composition.accentStrength ?? 0) : surge;
    const beatNumber = composed ? (composition.beatNumber ?? 1) : 1;
    const currentFunction = composed ? (composition.currentFunction ?? "pulse") : "pulse";
    const pulseAccent = currentFunction === "pulse" ? accent : 0;
    const absorbAccent = currentFunction === "absorb" ? accent : 0;
    const stabilizeAccent = currentFunction === "stabilize" ? accent : 0;
    const catchAccent = beatNumber === 2 ? stabilizeAccent : 0;
    const settleAccent = beatNumber === 4 ? stabilizeAccent : 0;
    const coreWorldResonance = frameState.coreWorldResonance ?? {};
    const resonanceActive = Boolean(coreWorldResonance.active);
    const resonanceReply = resonanceActive
      ? THREE.MathUtils.clamp(coreWorldResonance.presentation?.worldReplyStrength ?? 0, 0, 1)
      : 0;

    if (this.vesselEnvelope?.material) {
      this.vesselEnvelope.material.emissiveIntensity += surge * 0.07
        + pulseAccent * 0.24
        + absorbAccent * 0.11
        + catchAccent * 0.08
        + settleAccent * 0.035
        + resonanceReply * 0.12;
      this.vesselEnvelope.material.opacity = Math.min(
        0.31,
        this.vesselEnvelope.material.opacity
          + surge * 0.022
          + pulseAccent * 0.034
          + absorbAccent * 0.020
          + catchAccent * 0.012
          + resonanceReply * 0.018
      );
    }

    for (const [index, fold] of this.wallFolds.entries()) {
      if (!fold) continue;
      const travel = 0.5 + 0.5 * Math.sin(
        phase * Math.PI * 2 - index * 0.42
      );
      const localBeat = beatPulse * (0.55 + 0.45 * Math.sin(index * 1.27 + (composition.beatInBar ?? 0) * 0.8));
      // Beat 1 sends tissue outward; beat 3 visibly gathers it back inward.
      // Stabilize beats reduce deformation and momentarily read as a held frame.
      const holdReduction = Math.max(0.68, 1 - stabilizeAccent * 0.24);
      fold.scale.x *= (1 + travel * 0.012 + localBeat * 0.010 + pulseAccent * 0.038 - absorbAccent * 0.026) * holdReduction;
      fold.scale.z *= (1 + travel * 0.009 + localBeat * 0.008 + pulseAccent * 0.026 - absorbAccent * 0.018) * holdReduction;
      if (fold.material) {
        fold.material.emissiveIntensity += travel * 0.05
          + localBeat * 0.04
          + pulseAccent * 0.14
          + absorbAccent * 0.08
          + catchAccent * 0.06
          + settleAccent * 0.025
          + resonanceReply * 0.06;
      }
    }

    this.root.userData.hostRhythmInterpretation = {
      pass: composed ? "HC-028C2" : "HC-022G",
      region: "vascular",
      mode: composed ? "psa_key_44_accented_world_phrase" : "directional_traveling_surge",
      phaseLead: 0.03,
      keyId: composed ? composition.keyId : "unassigned",
      meter: composed ? composition.meterLabel : "unassigned",
      tempoBpm: composed ? composition.tempoBpm : 0,
      octave: composed ? composition.octaveLabel : "unassigned",
      beatNumber,
      currentFunction: composed ? composition.currentFunction : "none",
      accentRole: composed ? composition.accentRole : "none",
      accentLaw: composed ? "1_transmit_2_catch_3_receive_4_settle" : "legacy_host_breath",
      movementAuthorityChanged: false,
      visible: true,
      gameplayAuthority: false,
      sharedHostClock: true,
      coreWorldResonance: {
        pass: "HC-028D",
        active: resonanceActive,
        relation: resonanceActive ? coreWorldResonance.relationshipState ?? "oscillating" : "inactive",
        coherence01: resonanceActive ? coreWorldResonance.coherence01 ?? 0 : 0,
        worldReplyStrength: resonanceReply,
        presentationOnly: true
      }
    };
  }

  buildPathMetrics() {
    this.pathSegmentLengths = [];
    this.pathCumulativeLengths = [0];
    this.pathLength = 0;
    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const length = this.pathPoints[index].distanceTo(this.pathPoints[index + 1]);
      this.pathSegmentLengths.push(length);
      this.pathLength += length;
      this.pathCumulativeLengths.push(this.pathLength);
    }
  }

  createAnatomy() {
    this.root = new THREE.Group();
    this.root.name = "vascular_rhythm_route_authority_HC011A1";
    Object.assign(this.root.userData, {
      regionId: "vascular_route",
      gameplayOwner: "VascularRhythmRouteSystem",
      presentationOwner: "VascularRhythmRouteSystem",
      transitionPrepared: true,
      targetingSuppressed: true,
      genericRings: 0,
      triggerMarkers: 0
    });

    const visual = this.recipe.visual ?? {};
    const vesselMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.vesselColor ?? 0x466ff6,
      emissive: visual.deepVesselColor ?? 0x1c2f46,
      emissiveIntensity: 0.18,
      roughness: 0.72,
      metalness: 0.04,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.vesselEnvelope = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.pathCurve,
        96,
        this.recipe.anatomy?.vesselRadius ?? 0.92,
        12,
        false
      ),
      vesselMaterial
    );
    this.vesselEnvelope.name = "vascular_living_vessel_membrane";
    this.vesselEnvelope.userData.targetingSuppressed = true;
    this.root.add(this.vesselEnvelope);

    const braidColors = [0x7c56e8, 0x3cb8d6, 0xa566cf];
    for (let braidIndex = 0; braidIndex < 3; braidIndex += 1) {
      const offsetPoints = this.pathPoints.map((point, pointIndex) => {
        const angle = pointIndex * 1.28 + braidIndex * (Math.PI * 2 / 3);
        const offset = this.recipe.anatomy?.braidOffset ?? 0.58;
        return point.clone().add(new THREE.Vector3(
          Math.cos(angle) * offset,
          Math.sin(angle) * offset * 0.62,
          Math.sin(angle * 0.7) * 0.08
        ));
      });
      const curve = new THREE.CatmullRomCurve3(offsetPoints, false, "centripetal", 0.42);
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: braidColors[braidIndex],
        emissive: braidColors[braidIndex],
        emissiveIntensity: 0.2,
        roughness: 0.46,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      }));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 72, this.recipe.anatomy?.braidRadius ?? 0.105, 8, false),
        material
      );
      tube.name = `vascular_braided_wall_tendon_${braidIndex + 1}`;
      tube.userData.phase = braidIndex * 1.9;
      tube.userData.targetingSuppressed = true;
      this.root.add(tube);
      this.braidTubes.push(tube);
    }

    // HC-016Z: repeated membrane folds make the vessel itself organize the
    // journey. These are presentation-only anatomy; valves retain gameplay.
    for (let index = 0; index < 9; index += 1) {
      const progress = 0.08 + index * 0.095;
      const point = this.pathCurve.getPointAt(progress);
      const tangent = this.pathCurve.getTangentAt(progress).normalize();
      const foldMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x315a72 : 0x433b79,
        emissive: 0x203b55,
        emissiveIntensity: 0.11,
        roughness: 0.68,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      const fold = new THREE.Mesh(new THREE.TorusGeometry(0.78 + (index % 3) * 0.08, 0.055, 6, 28, Math.PI * 1.55), foldMaterial);
      fold.name = `vascular_membrane_fold_${index + 1}`;
      fold.position.copy(point);
      fold.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      fold.rotation.z += index * 0.63;
      fold.scale.y = 0.78 + (index % 2) * 0.14;
      fold.userData.baseScale = fold.scale.clone();
      fold.userData.targetingSuppressed = true;
      this.root.add(fold);
      this.wallFolds.push(fold);
    }

    for (const [index, progress] of (this.recipe.anatomy?.valveProgress ?? []).entries()) {
      this.createValve(index, progress);
    }
    this.createCurrentMotes();
    this.createCharge();
    this.createReturnFold();
    this.scene.add(this.root);
  }

  createValve(index, progress) {
    const group = new THREE.Group();
    group.name = `vascular_asymmetric_valve_${index + 1}`;
    group.position.copy(this.pathCurve.getPointAt(progress));
    const tangent = this.pathCurve.getTangentAt(progress).normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    Object.assign(group.userData, {
      progress,
      phase: index * 1.17,
      targetingSuppressed: true,
      valveRole: index === 0 ? "intake" : index === 1 ? "branch" : "deep_return"
    });

    const colors = [0x6b53ca, 0x4f7bd9, 0x8752b7];
    for (let lobeIndex = 0; lobeIndex < 3; lobeIndex += 1) {
      const side = lobeIndex === 2 ? 0 : lobeIndex === 0 ? -1 : 1;
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        emissive: colors[index % colors.length],
        emissiveIntensity: 0.22,
        roughness: 0.5,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      }));
      const lobe = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18 + lobeIndex * 0.018, 0.82 - lobeIndex * 0.08, 8, 12),
        material
      );
      lobe.name = `vascular_valve_${index + 1}_lobe_${lobeIndex + 1}`;
      lobe.position.set(side * 0.43, lobeIndex === 2 ? 0.08 : -0.04, lobeIndex === 2 ? -0.26 : 0.02);
      lobe.rotation.z = side * (0.48 + index * 0.05);
      lobe.scale.set(lobeIndex === 2 ? 0.72 : 0.82, 1, lobeIndex === 2 ? 0.58 : 0.74);
      Object.assign(lobe.userData, {
        side,
        basePosition: lobe.position.clone(),
        baseScale: lobe.scale.clone(),
        targetingSuppressed: true
      });
      group.add(lobe);
    }
    this.root.add(group);
    this.valves.push(group);
  }

  createCurrentMotes() {
    const count = this.recipe.anatomy?.currentMoteCount ?? 24;
    for (let index = 0; index < count; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 4 === 0 ? 0xb8f3ff : 0x6ca8e8,
        emissive: index % 4 === 0 ? 0x75dfff : 0x355caa,
        emissiveIntensity: 0.34,
        roughness: 0.3,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.035 + (index % 3) * 0.012, 0),
        material
      );
      mote.name = `vascular_current_cell_${index + 1}`;
      Object.assign(mote.userData, {
        baseProgress: index / count,
        lateralPhase: index * 1.73,
        targetingSuppressed: true
      });
      this.root.add(mote);
      this.currentMotes.push(mote);
    }
  }

  createCharge() {
    const visual = this.recipe.visual ?? {};
    this.chargeRoot = new THREE.Group();
    this.chargeRoot.name = "vascular_migrating_charge_body";
    this.chargeRoot.userData.targetingSuppressed = true;

    const coreMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.signalColor ?? 0x78e3ff,
      emissive: visual.signalColor ?? 0x78e3ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    }));
    this.chargeCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 2), coreMaterial);
    this.chargeCore.name = "vascular_charge_nucleus";
    this.chargeRoot.add(this.chargeCore);
    this.chargeLight = new THREE.PointLight(visual.signalColor ?? 0x78e3ff, 0.9, 3.4);
    this.chargeLight.name = "vascular_charge_witness_light";
    this.chargeRoot.add(this.chargeLight);
    this.root.add(this.chargeRoot);

    const trailCount = this.recipe.anatomy?.chargeTrailCount ?? 9;
    for (let index = 0; index < trailCount; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: 0x78d8ff,
        emissive: 0x4389d8,
        emissiveIntensity: 0.34,
        roughness: 0.28,
        transparent: true,
        opacity: Math.max(0.08, 0.48 - index * 0.045),
        depthWrite: false
      }));
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.07 - index * 0.004, 10, 8), material);
      mote.name = `vascular_charge_tail_${index + 1}`;
      mote.userData.lag = (index + 1) * 0.012;
      mote.userData.targetingSuppressed = true;
      this.root.add(mote);
      this.chargeTrail.push(mote);
    }
  }

  createReturnFold() {
    const returnOffset = this.recipe.returnFold?.position ?? [0, 0.05, 0.62];
    this.returnFold = new THREE.Group();
    this.returnFold.name = "vascular_hub_return_fold_body";
    this.returnFold.position.fromArray(returnOffset);
    Object.assign(this.returnFold.userData, {
      targetingSuppressed: true,
      crossingOwner: "LocalCellBoundaryMorphSystem",
      formsAfterSynchronization: true
    });

    for (const side of [-1, 1]) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: 0xd8a66f,
        emissive: 0xffc76d,
        emissiveIntensity: 0.38,
        roughness: 0.42,
        transparent: true,
        opacity: 0.76,
        depthWrite: false
      }));
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.86, 8, 12), material);
      lobe.name = side < 0 ? "vascular_return_fold_left_lobe" : "vascular_return_fold_right_lobe";
      lobe.position.set(side * 0.32, 0, 0);
      lobe.rotation.z = side * 0.56;
      lobe.scale.set(0.78, 1, 0.64);
      lobe.userData.side = side;
      lobe.userData.basePosition = lobe.position.clone();
      lobe.userData.targetingSuppressed = true;
      this.returnFold.add(lobe);
      this.returnFoldLobes.push(lobe);
    }
    const seamMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xffda8a,
      emissive: 0xffb84f,
      emissiveIntensity: 0.72,
      roughness: 0.2,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    }));
    const seam = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.62, 6, 8), seamMaterial);
    seam.name = "vascular_return_fold_living_seam";
    seam.rotation.z = Math.PI / 2;
    seam.userData.targetingSuppressed = true;
    this.returnFold.add(seam);
    this.returnFold.visible = false;
    this.root.add(this.returnFold);
  }

  samplePlayerPath(dt, frameState) {
    this.localPlayer.copy(this.playerRoot.position).sub(this.entryAnchor);
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let bestProgress = 0;
    let bestT = 0;
    let bestIndex = 0;

    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const start = this.pathPoints[index];
      const end = this.pathPoints[index + 1];
      this.segmentVector.copy(end).sub(start);
      const lengthSq = Math.max(0.000001, this.segmentVector.lengthSq());
      this.segmentStartToPlayer.copy(this.localPlayer).sub(start);
      const t = THREE.MathUtils.clamp(
        this.segmentStartToPlayer.dot(this.segmentVector) / lengthSq,
        0,
        1
      );
      this.tempPoint.copy(start).addScaledVector(this.segmentVector, t);
      const distanceSq = this.tempPoint.distanceToSquared(this.localPlayer);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestT = t;
        bestIndex = index;
        bestProgress = (this.pathCumulativeLengths[index] + this.pathSegmentLengths[index] * t)
          / Math.max(0.0001, this.pathLength);
        this.closestPoint.copy(this.tempPoint);
        this.closestTangent.copy(this.segmentVector).normalize();
      }
    }

    this.pathProgress = THREE.MathUtils.clamp(bestProgress, 0, 1);
    this.maxDepthProgress = Math.max(this.maxDepthProgress, this.pathProgress);
    this.pathDistance = Math.sqrt(bestDistanceSq);

    const publishedVelocity = frameState.playerKinematics?.velocity;
    if (publishedVelocity) {
      this.derivedVelocity.set(
        publishedVelocity.x ?? 0,
        publishedVelocity.y ?? 0,
        publishedVelocity.z ?? 0
      );
    } else if (dt > 0) {
      this.derivedVelocity.copy(this.playerRoot.position)
        .sub(this.previousPlayerPosition)
        .multiplyScalar(1 / dt);
    } else {
      this.derivedVelocity.set(0, 0, 0);
    }
    this.previousPlayerPosition.copy(this.playerRoot.position);

    const speed = this.derivedVelocity.length();
    this.flowAlignment = speed > 0.045
      ? this.derivedVelocity.normalize().dot(this.closestTangent)
      : 0;

    return {
      progress: this.pathProgress,
      distance: this.pathDistance,
      tangent: this.closestTangent,
      closestPoint: this.closestPoint,
      segmentIndex: bestIndex,
      segmentT: bestT,
      speed,
      flowAlignment: this.flowAlignment
    };
  }

  updateCadence(dt, frameState, sample) {
    const cadence = this.recipe.cadence ?? {};
    const stabilization = this.recipe.stabilization ?? {};
    const input = frameState.input ?? {};
    const requiredReads = cadence.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    const valveProgress = this.recipe.anatomy?.valveProgress ?? [0.28, 0.55, 0.82];
    const corridorRadius = this.recipe.anatomy?.corridorRadius ?? 1.18;
    // Preserve the last published window for one simulation step. Input is
    // sampled before this updater advances the beat, so a Pulse shown as valid
    // on the preceding rendered frame must not become a false miss at the
    // closing edge solely because one fixed step elapsed.
    const previousPulseWindowOpen = this.pulseWindowOpen();

    if (this.completed) {
      this.cadencePhase = (this.returnElapsed / Math.max(0.2, cadence.secondsPerBeat ?? 2.35)) % 1;
      this.chargeProgress = 1 - this.cadencePhase;
    } else if (this.lockedCadenceReads < requiredReads) {
      const secondsPerBeat = Math.max(0.4, cadence.secondsPerBeat ?? 2.35);
      this.cadencePhase = (this.beatElapsed / secondsPerBeat) % 1;
      const segmentStart = this.lockedCadenceReads === 0
        ? 0.035
        : valveProgress[this.lockedCadenceReads - 1];
      const segmentEnd = valveProgress[this.lockedCadenceReads] ?? 0.84;
      const easedPhase = this.cadencePhase * this.cadencePhase * (3 - 2 * this.cadencePhase);
      this.chargeProgress = THREE.MathUtils.lerp(segmentStart, segmentEnd, easedPhase);
    } else {
      this.cadencePhase = 1;
      this.chargeProgress = valveProgress[valveProgress.length - 1] ?? 0.82;
    }

    this.tempPoint.copy(this.pathCurve.getPointAt(THREE.MathUtils.clamp(this.chargeProgress, 0, 1)));
    this.chargeWorldPosition.copy(this.entryAnchor).add(this.tempPoint);
    this.chargeDistance = this.playerRoot.position.distanceTo(this.chargeWorldPosition);
    const contractionWave = (Math.sin(
      (this.elapsed * (cadence.contractionFrequency ?? 1.45) + this.pathProgress * 1.4) * Math.PI * 2
    ) + 1) * 0.5;
    this.contractionIntensity = THREE.MathUtils.smoothstep(contractionWave, 0.38, 0.92);

    const withinCurrent = sample.distance <= corridorRadius;
    const followingCharge = this.chargeDistance <= (cadence.followRange ?? 1.78);
    const movingWithFlow = sample.flowAlignment > -0.16 || sample.speed < 0.08;
    if (withinCurrent && followingCharge && movingWithFlow && !this.completed) {
      this.matchedFlowSeconds += dt;
      this.synchronization += dt * (cadence.matchedFlowSynchronizationPerSecond ?? 0.035);
    }

    if (!this.completed && sample.distance > corridorRadius * 1.22) {
      this.turbulence += dt * (cadence.driftTurbulencePerSecond ?? 0.07);
    }
    if (
      !this.completed
      && this.contractionIntensity > 0.54
      && sample.speed > 0.14
      && sample.flowAlignment < -0.2
    ) {
      this.turbulence += dt * (cadence.againstFlowTurbulencePerSecond ?? 0.1);
    }

    const normalStabilizationRange = stabilization.rangeFromCenterline ?? 1.36;
    const postReadStabilizationRange = Math.max(
      normalStabilizationRange,
      stabilization.postReadRangeFromCenterline ?? corridorRadius * 1.75
    );
    this.stabilizationRange = readsComplete
      ? postReadStabilizationRange
      : normalStabilizationRange;
    this.stabilizationInRange = sample.distance <= this.stabilizationRange;
    const stabilizing = Boolean(input.stabilizeHeld && this.stabilizationInRange);
    this.stabilizing = stabilizing;
    if (stabilizing && !this.completed) {
      this.stabilizeSeconds += dt;
      if (readsComplete) {
        this.synchronization += dt
          * (stabilization.postReadSynchronizationPerSecond ?? 0.34);
      }
      if (this.turbulence > 0 || this.circulationIntegrity < 1) {
        const recoveryMultiplier = readsComplete
          ? (stabilization.postReadRecoveryMultiplier ?? 2.4)
          : 1;
        this.turbulence = Math.max(
          0,
          this.turbulence
            - dt
            * (stabilization.turbulenceRecoveryPerSecond ?? 0.46)
            * recoveryMultiplier
        );
        this.circulationIntegrity = Math.min(
          1,
          this.circulationIntegrity
            + dt
            * (stabilization.integrityRecoveryPerSecond ?? 0.34)
            * recoveryMultiplier
        );
        this.recoverySeconds += dt;
        this.lastInteraction = "stabilize_reweaving_scattered_circulation";
        this.warning = "recoverable_desynchronization_settling";
      } else if (this.contractionIntensity > 0.38) {
        this.synchronization += dt
          * (stabilization.synchronizationPerSecondDuringContraction ?? 0.055)
          * this.contractionIntensity;
        this.lastInteraction = "stabilize_holding_contraction_cadence";
        this.warning = "none";
      }
    }

    const pulseEventId = input.pulseEventId ?? (frameState.frame ?? 0);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) {
      this.lastPulseEventId = pulseEventId;
      this.pulseFlashAge = 0;
      if (
        !this.completed
        && this.lockedCadenceReads < requiredReads
        && (this.pulseWindowOpen() || previousPulseWindowOpen)
      ) {
        const activeValveProgress = valveProgress[this.lockedCadenceReads] ?? 0.82;
        const approachReady = this.pathProgress >= activeValveProgress
          - (cadence.minimumValveApproachSlack ?? 0.19);
        const pulseRangeReady = this.chargeDistance <= (cadence.pulseRange ?? 1.3);
        if (approachReady && pulseRangeReady && withinCurrent) {
          this.lockedCadenceReads += 1;
          // Valve progress is authored on the Catmull-Rom vessel curve while
          // samplePlayerPath measures the nearest piecewise control segment.
          // Retain the authored valve depth when its cadence is successfully
          // read so the same physical landmark cannot disagree with the deep
          // completion requirement.
          this.maxDepthProgress = Math.max(this.maxDepthProgress, activeValveProgress);
          this.synchronization += cadence.onBeatSynchronizationGain ?? 0.22;
          this.circulationIntegrity += cadence.onBeatIntegrityGain ?? 0.08;
          this.turbulence = Math.max(0, this.turbulence - 0.08);
          this.beatElapsed = 0;
          this.lastInteraction = `cadence_${this.lockedCadenceReads}_recognized_by_pulse`;
          this.warning = "none";
        } else {
          this.registerDesynchronization(cadence, "pulse_missed_moving_charge");
        }
      } else if (!this.completed && this.lockedCadenceReads < requiredReads) {
        this.registerDesynchronization(cadence, "pulse_outside_living_cadence");
      } else if (!this.completed) {
        this.postReadPulseIgnoredCount += 1;
        this.lastInteraction = "three_locked_cadence_reads_retained_extra_pulse_harmless";
        if (!this.desynchronized) this.warning = "three_cadence_reads_locked_hold_stabilize_to_settle";
      } else {
        this.lastInteraction = "pulse_echoed_through_synchronized_return_current";
      }
    }

    this.synchronization = THREE.MathUtils.clamp(this.synchronization, 0, 1);
    this.circulationIntegrity = THREE.MathUtils.clamp(this.circulationIntegrity, 0, 1);
    this.turbulence = THREE.MathUtils.clamp(this.turbulence, 0, 1);
    this.desynchronized = Boolean(
      this.turbulence >= (stabilization.desynchronizationTurbulenceThreshold ?? 0.34)
      || this.circulationIntegrity <= (stabilization.desynchronizationIntegrityThreshold ?? 0.8)
    );
    if (
      this.riskEventCount > 0
      && this.turbulence <= (stabilization.recoveryTurbulenceThreshold ?? 0.13)
      && this.circulationIntegrity >= (stabilization.recoveryIntegrityThreshold ?? 0.92)
    ) {
      this.desynchronizationRecovered = true;
      this.desynchronized = false;
      this.warning = "none";
    }

    const completion = this.recipe.completion ?? {};
    if (
      !this.completed
      && this.lockedCadenceReads >= requiredReads
      && this.maxDepthProgress >= (completion.minimumDeepProgress ?? 0.78)
      && this.synchronization >= (completion.minimumSynchronization ?? 0.74)
      && this.turbulence <= (completion.maximumTurbulence ?? 0.2)
      && this.circulationIntegrity >= (completion.minimumIntegrity ?? 0.82)
      && this.stabilizeSeconds >= (completion.minimumStabilizeSeconds ?? 0.8)
    ) {
      this.completed = true;
      this.returnFoldReady = true;
      this.returnElapsed = 0;
      this.lastInteraction = "circulation_synchronized_current_reversed_toward_hub";
      this.warning = "none";
    }
  }

  registerDesynchronization(cadence, source) {
    this.riskEventCount += 1;
    this.offBeatPulseCount += 1;
    this.turbulence += cadence.offBeatTurbulence ?? 0.27;
    this.circulationIntegrity -= cadence.offBeatIntegrityLoss ?? 0.17;
    const earnedSynchronizationFloor = Math.min(
      cadence.maximumLockedReadSynchronizationFloor ?? 0.54,
      this.lockedCadenceReads * (cadence.lockedReadSynchronizationFloorPerRead ?? 0.18)
    );
    this.synchronization = Math.max(
      earnedSynchronizationFloor,
      this.synchronization - (cadence.offBeatSynchronizationLoss ?? 0.08)
    );
    this.desynchronizationRecovered = false;
    this.lastInteraction = source;
    this.warning = "recoverable_desynchronization_hold_stabilize_in_current";
  }

  updateTraversalMaterialResponse(dt, frameState, sample) {
    const input = frameState.input ?? {};
    const corridorRadius = this.recipe.anatomy?.corridorRadius ?? 1.18;
    const inLivingCurrent = sample.distance <= corridorRadius * 1.08;

    const pulseTarget = this.pulseFlashAge < 0.68
      ? 1 - this.pulseFlashAge / 0.68
      : 0;
    const absorbTarget = Boolean(input.absorbHeld && inLivingCurrent) ? 1 : 0;
    const stabilizeTarget = Boolean(this.stabilizing && inLivingCurrent) ? 1 : 0;

    const blend = (current, target, upRate, downRate) => {
      const rate = target > current ? upRate : downRate;
      return current + (target - current) * (1 - Math.exp(-dt * rate));
    };

    this.traversalPulseWake = blend(this.traversalPulseWake, pulseTarget, 11.0, 5.8);
    this.traversalAbsorbShear = blend(this.traversalAbsorbShear, absorbTarget, 7.4, 5.2);
    this.traversalStabilizeCalm = blend(this.traversalStabilizeCalm, stabilizeTarget, 8.2, 4.8);

    this.traversalMaterialMode = this.traversalStabilizeCalm > 0.12
      ? "stabilized_calm_lane"
      : this.traversalAbsorbShear > 0.12
        ? "absorb_draw_wake"
        : this.traversalPulseWake > 0.12
          ? "pulse_pressure_surge"
          : this.desynchronized
            ? "turbulent_current"
            : "ride_current";
  }


  updateGrammarReinforcement(frameState, sample) {
    if (this.completed || !this.active) {
      this.grammarReinforcementMode = "none";
      this.grammarReinforcementStrength = 0;
      this.grammarReinforcementMatched = false;
      this.grammarReinforcementWindow = 0;
      return;
    }

    const progress = THREE.MathUtils.clamp(sample.progress ?? this.pathProgress, 0, 1);
    const windows = [
      { start: 0.17, end: 0.33, mode: "uncertain_current_probe", impliedVerb: "pulse" },
      { start: 0.42, end: 0.59, mode: "loose_draw_release", impliedVerb: "absorb" },
      { start: 0.67, end: 0.84, mode: "phase_strain_contraction", impliedVerb: "stabilize" }
    ];
    const match = windows.find((window) => progress >= window.start && progress <= window.end);
    if (!match) {
      this.grammarReinforcementMode = "none";
      this.grammarReinforcementStrength = 0;
      this.grammarReinforcementMatched = false;
      this.grammarReinforcementWindow = 0;
      return;
    }

    const center = (match.start + match.end) * 0.5;
    const half = Math.max(0.001, (match.end - match.start) * 0.5);
    const linear = THREE.MathUtils.clamp(1 - Math.abs(progress - center) / half, 0, 1);
    const strength = linear * linear * (3 - 2 * linear);
    const input = frameState.input ?? {};
    const matched = match.impliedVerb === "pulse"
      ? this.pulseFlashAge < 0.68
      : match.impliedVerb === "absorb"
        ? Boolean(input.absorbHeld)
        : Boolean(input.stabilizeHeld || input.resonanceHeld);

    this.grammarReinforcementMode = match.mode;
    this.grammarReinforcementStrength = strength;
    this.grammarReinforcementMatched = matched;
    this.grammarReinforcementWindow = windows.indexOf(match) + 1;
  }

  applyDynamicCurrent(frameState, sample) {
    const contractFeel = frameState.physicalFeel ?? {};
    const direction = this.completed ? -1 : 1;
    // HC-016Y: circulation must matter between valves. The current is stronger
    // than the old presentation-biased drift, while turbulence remains recoverable.
    const baseFlowStrength = 0.56 + this.contractionIntensity * 0.30;
    // Pulse briefly sends a pressure surge down the existing current.
    // Absorb carves a small local draw-wake. Stabilize calms the current while held.
    // None of these modifiers alter cadence windows, completion thresholds or route truth.
    const worldComposition = frameState.hostRhythm?.composition ?? {};
    const worldRhythmFlowScale = worldComposition.active
      && worldComposition.profileId === "vascular_psa_44_micro"
      ? THREE.MathUtils.clamp(worldComposition.flowScale ?? 1, 0.96, 1.06)
      : 1;
    const flowStrength = baseFlowStrength
      * (1 + this.traversalPulseWake * 0.22)
      * (1 - this.traversalAbsorbShear * 0.16)
      * (1 - this.traversalStabilizeCalm * 0.34)
      * worldRhythmFlowScale;
    const swirl = this.turbulence * 0.20
      * (1 + this.traversalPulseWake * 0.28)
      * (1 - this.traversalAbsorbShear * 0.18)
      * (1 - this.traversalStabilizeCalm * 0.68);
    const tangent = sample.tangent ?? this.closestTangent;
    const flowVector = {
      x: tangent.x * flowStrength * direction + Math.sin(this.elapsed * 4.1) * swirl,
      y: tangent.y * flowStrength * direction + Math.cos(this.elapsed * 3.4) * swirl * 0.55,
      z: tangent.z * flowStrength * direction
    };
    const authoredBounds = this.recipe?.movementBounds ?? {};
    const boundaryRadii = authoredBounds.radii ?? [4.5, 3.2, 22.5];
    frameState.physicalFeel = {
      ...contractFeel,
      viscosity: 0.31
        + this.turbulence * 0.24
        + this.traversalAbsorbShear * 0.05
        - this.traversalStabilizeCalm * 0.08,
      pressure: 0.60
        + this.contractionIntensity * 0.24
        + this.turbulence * 0.16
        + this.traversalPulseWake * 0.10
        - this.traversalStabilizeCalm * 0.12,
      flowVector,
      routeFeelProfile: "vascular_directional_circulation_hc018c",
      accelerationScale: 1.04 - this.turbulence * 0.12,
      speedScale: 1.02,
      boostScale: 1.0,
      flowCouplingScale: 1.34,
      withFlowSpeedBonus: 0.24,
      againstFlowSpeedPenalty: 0.20,
      spatialFeel: {
        progress: sample.progress ?? this.pathProgress,
        centerlineDistance: sample.distance ?? this.pathDistance,
        flowStrength,
        baseFlowStrength,
        turbulence: this.turbulence,
        traversalMaterialMode: this.traversalMaterialMode,
        pulseWake: this.traversalPulseWake,
        absorbShear: this.traversalAbsorbShear,
        stabilizeCalm: this.traversalStabilizeCalm,
        worldRhythmFlowScale,
        worldRhythmBeat: worldComposition.active ? worldComposition.beatNumber ?? 0 : 0,
        worldRhythmFunction: worldComposition.active ? worldComposition.currentFunction ?? "none" : "none",
        condition: this.completed
          ? "return_current_carries_core_toward_hub"
          : this.desynchronized
            ? "turbulent_current_fights_clean_alignment"
            : "matched_current_rewards_directional_flow"
      },
      boundaryBehavior: this.completed
        ? "vascular_synchronized_return_current"
        : this.desynchronized
          ? "vascular_recoverable_desynchronization_recoil"
          : "vascular_living_contraction_current",
      movementBounds: {
        active: Boolean(this.active),
        mode: authoredBounds.mode ?? "entry_anchored_ellipsoid",
        center: {
          x: this.entryAnchor.x,
          y: this.entryAnchor.y,
          z: this.entryAnchor.z
        },
        radii: {
          x: boundaryRadii[0] ?? boundaryRadii.x ?? 4.5,
          y: boundaryRadii[1] ?? boundaryRadii.y ?? 3.2,
          z: boundaryRadii[2] ?? boundaryRadii.z ?? 22.5
        },
        owner: authoredBounds.collisionOwner ?? "PlayerMovementController",
        tuningOwner: authoredBounds.tuningOwner ?? "VascularRhythmRouteSystem",
        regionId: "vascular_route",
        centerSource: authoredBounds.centerSource ?? "preserved_gate_entry_position",
        restoresPriorBoundaryOnExit: authoredBounds.restoresPriorBoundaryOnExit !== false
      }
    };
  }

  animate(dt, frameState, sample) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const requiredReadsForMemory = Math.max(1, this.recipe.cadence?.requiredReads ?? 3);
    const retainedTarget = this.completed
      ? 1
      : THREE.MathUtils.clamp(this.lockedCadenceReads / requiredReadsForMemory, 0, 1);
    this.retainedSynchronizationStrength += (retainedTarget - this.retainedSynchronizationStrength)
      * (1 - Math.exp(-dt * 4.2));
    const visual = this.recipe.visual ?? {};
    const ready = this.pulseWindowOpen() && this.chargeDistance <= (this.recipe.cadence?.pulseRange ?? 1.3) * 1.35;
    const chargeColor = this.desynchronized
      ? this.stabilizing
        ? visual.recoveryColor ?? 0x82ffcf
        : visual.desyncColor ?? 0xf95b61
      : this.completed
        ? visual.returnColor ?? 0xffc96d
        : ready
          ? visual.readyColor ?? 0xffd9b8
          : visual.signalColor ?? 0x78e3ff;

    if (this.vesselEnvelope?.material) {
      this.vesselEnvelope.material.emissiveIntensity = 0.12
        + this.contractionIntensity * 0.16
        + this.synchronization * 0.08;
      this.vesselEnvelope.material.opacity = 0.1 + this.synchronization * 0.07;
      if (this.grammarReinforcementStrength > 0.01) {
        this.vesselEnvelope.material.emissiveIntensity += this.grammarReinforcementStrength * 0.08;
        this.vesselEnvelope.material.opacity += this.grammarReinforcementStrength * 0.025;
      }
    }
    for (const [index, tube] of this.braidTubes.entries()) {
      tube.material.emissiveIntensity = 0.16
        + this.contractionIntensity * (0.08 + index * 0.015)
        + this.turbulence * 0.18;
      tube.material.opacity = 0.38 + this.synchronization * 0.2;
    }

    for (const [index, fold] of this.wallFolds.entries()) {
      const baseScale = fold.userData.baseScale;
      if (baseScale) {
        fold.scale.x = baseScale.x;
        fold.scale.y = baseScale.y;
        fold.scale.z = baseScale.z;
      }
      const retained = this.retainedSynchronizationStrength;
      const readCoverage = THREE.MathUtils.clamp(
        (this.lockedCadenceReads - index / 3) / Math.max(1, requiredReadsForMemory),
        0,
        1
      );
      const memory = Math.max(retained * 0.45, readCoverage * 0.65);
      fold.scale.y = (baseScale?.y ?? (0.78 + (index % 2) * 0.14)) * (1 + memory * 0.08);
      fold.rotation.z += Math.sin(index * 1.17) * memory * 0.002;
      if (fold.material) {
        fold.material.opacity = 0.24 + memory * 0.10;
        fold.material.emissiveIntensity = 0.11 + memory * (this.completed ? 0.20 : 0.11);
      }
      if (this.grammarReinforcementMode === "phase_strain_contraction") {
        const unsettled = this.grammarReinforcementStrength * (1 - this.traversalStabilizeCalm * 0.88);
        fold.rotation.z += Math.sin(t * (2.4 + index * 0.17) + index * 1.31) * unsettled * 0.052;
        fold.scale.x *= 1 + Math.sin(t * 3.1 + index * 0.77) * unsettled * 0.055;
        if (fold.material) fold.material.emissiveIntensity += unsettled * 0.11;
      }
      fold.userData.retainedConsequence = memory > 0.08
        ? "cadence_passed_through_this_tissue"
        : "none";
    }

    for (const [index, valve] of this.valves.entries()) {
      const locked = index < this.lockedCadenceReads;
      const activeValve = index === this.lockedCadenceReads && !this.completed;
      const worldComposition = frameState.hostRhythm?.composition ?? {};
      const worldBarPhase = worldComposition.active
        && worldComposition.profileId === "vascular_psa_44_micro"
        ? worldComposition.barPhase ?? 0
        : null;
      const valveBeat = activeValve
        ? this.cadencePhase
        : worldBarPhase === null
          ? (t * 0.17 + index * 0.31) % 1
          : (worldBarPhase + index * 0.19) % 1;
      const opening = this.completed
        ? 0.86
        : activeValve && this.pulseWindowOpen()
          ? 1
          : locked ? 0.72 : 0.18 + (Math.sin(valveBeat * Math.PI * 2) + 1) * 0.12;
      for (const lobe of valve.children) {
        if (!lobe.isMesh) continue;
        const basePosition = lobe.userData.basePosition;
        const baseScale = lobe.userData.baseScale;
        const side = lobe.userData.side ?? 0;
        if (basePosition) {
          lobe.position.copy(basePosition);
          lobe.position.x += side * opening * 0.18;
        }
        if (baseScale) {
          lobe.scale.copy(baseScale);
          lobe.scale.y *= 1 - this.contractionIntensity * (activeValve ? 0.16 : 0.08);
        }
        if (lobe.material) {
          lobe.material.emissiveIntensity = locked ? 0.42 : activeValve ? 0.28 + opening * 0.46 : 0.16;
          lobe.material.opacity = locked ? 0.86 : activeValve ? 0.78 : 0.5;
        }
      }
    }

    if (this.chargeRoot) {
      this.chargeRoot.position.copy(this.pathCurve.getPointAt(THREE.MathUtils.clamp(this.chargeProgress, 0, 1)));
      const jitter = this.desynchronized ? 0.055 + this.turbulence * 0.08 : 0;
      this.chargeRoot.position.x += Math.sin(t * 19.2) * jitter;
      this.chargeRoot.position.y += Math.cos(t * 16.7) * jitter * 0.72;
      const worldBeatPulse = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.beatPulse ?? 0
        : 0;
      const chargePulse = 1
        + Math.sin(t * 7.2) * 0.055
        + worldBeatPulse * 0.07
        + (ready ? 0.22 : 0)
        + (this.pulseFlashAge < 0.25 ? 0.25 : 0);
      this.chargeCore.scale.setScalar(chargePulse);
      this.chargeCore.material.color.setHex(chargeColor);
      this.chargeCore.material.emissive.setHex(chargeColor);
      this.chargeCore.material.emissiveIntensity = ready ? 1.35 : this.desynchronized ? 1.1 : 0.76;
      this.chargeLight.color.setHex(chargeColor);
      this.chargeLight.intensity = ready ? 1.85 : this.desynchronized ? 1.28 : 0.84;
    }

    for (const trail of this.chargeTrail) {
      let progress = this.chargeProgress + (this.completed ? 1 : -1) * (trail.userData.lag ?? 0.01);
      progress = THREE.MathUtils.clamp(progress, 0, 1);
      trail.position.copy(this.pathCurve.getPointAt(progress));
      trail.material.color.setHex(chargeColor);
      trail.material.emissive.setHex(chargeColor);
    }

    const direction = this.completed ? -1 : 1;
    for (const mote of this.currentMotes) {
      const worldMoteSpeedScale = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? THREE.MathUtils.clamp(frameState.hostRhythm.composition.moteSpeedScale ?? 1, 0.92, 1.10)
        : 1;
      const currentSpeed = (0.055 + this.synchronization * 0.025)
        * (1 + this.traversalPulseWake * 0.42)
        * (1 - this.traversalStabilizeCalm * 0.38)
        * worldMoteSpeedScale;
      let progress = (mote.userData.baseProgress + direction * t * currentSpeed) % 1;
      if (progress < 0) progress += 1;
      mote.position.copy(this.pathCurve.getPointAt(progress));
      const tangent = this.pathCurve.getTangentAt(progress).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      let lateral = Math.sin(t * 1.8 + mote.userData.lateralPhase)
        * 0.13
        * (1 + this.traversalPulseWake * 0.55)
        * (1 - this.traversalStabilizeCalm * 0.72);
      const worldRhythmFunction = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.currentFunction ?? "none"
        : "none";
      const worldRhythmAccent = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.accentStrength ?? 0
        : 0;
      // Perceptual accent only: receive/hold beats tighten the visible stream
      // around the authored path but do not add force or timing authority.
      if (worldRhythmFunction === "absorb") lateral *= 1 - worldRhythmAccent * 0.26;
      else if (worldRhythmFunction === "stabilize") lateral *= 1 - worldRhythmAccent * 0.14;
      if (this.grammarReinforcementMode === "uncertain_current_probe") {
        lateral += Math.sin(t * 4.1 + mote.userData.lateralPhase * 1.6)
          * 0.085 * this.grammarReinforcementStrength;
      } else if (this.grammarReinforcementMode === "phase_strain_contraction") {
        const strain = this.grammarReinforcementStrength * (1 - this.traversalStabilizeCalm * 0.9);
        lateral += Math.sin(t * 3.8 + mote.userData.lateralPhase * 2.3)
          * 0.13 * strain;
      }
      mote.position.addScaledVector(side, lateral);

      if (this.grammarReinforcementMode === "loose_draw_release" && this.grammarReinforcementStrength > 0.01) {
        this.tempPointB.copy(this.localPlayer).sub(mote.position);
        const inviteDistance = this.tempPointB.length();
        if (inviteDistance < 3.3 && inviteDistance > 0.001) {
          const drawRelease = 0.5 + 0.5 * Math.sin(t * 1.35 + mote.userData.lateralPhase * 0.35);
          mote.position.addScaledVector(
            this.tempPointB.normalize(),
            this.grammarReinforcementStrength * drawRelease * (1 - inviteDistance / 3.3) * 0.07
          );
        }
      }

      if (this.traversalAbsorbShear > 0.02) {
        this.tempPointB.copy(this.localPlayer).sub(mote.position);
        const localDistance = this.tempPointB.length();
        if (localDistance < 2.45 && localDistance > 0.001) {
          mote.position.addScaledVector(
            this.tempPointB.normalize(),
            this.traversalAbsorbShear * (1 - localDistance / 2.45) * 0.22
          );
        }
      }

      mote.material.opacity = 0.26
        + this.synchronization * 0.3
        + this.traversalPulseWake * 0.14
        - this.traversalStabilizeCalm * 0.08;
      mote.material.emissiveIntensity = 0.22
        + this.contractionIntensity * 0.18
        + this.traversalPulseWake * 0.18
        + this.traversalStabilizeCalm * 0.08
        + this.grammarReinforcementStrength * 0.09;
    }

    if (this.returnFold) {
      this.returnFold.visible = this.returnFoldReady;
      if (this.returnFoldReady) {
        const foldPulse = (Math.sin(t * 2.9) + 1) * 0.5;
        for (const lobe of this.returnFoldLobes) {
          const side = lobe.userData.side ?? 0;
          lobe.position.copy(lobe.userData.basePosition);
          lobe.position.x += side * foldPulse * 0.08;
          lobe.material.emissiveIntensity = 0.32 + foldPulse * 0.42;
        }
      }
    }

    this.root.userData.activePathProgress = sample.progress;
    this.root.userData.circulationDirection = this.completed ? "outward_to_hub" : "inward_to_deep_valve";
    this.root.userData.desynchronized = this.desynchronized;
  }

  pulseWindowOpen() {
    if (this.completed) return false;
    const cadence = this.recipe.cadence ?? {};
    if (this.lockedCadenceReads >= (cadence.requiredReads ?? 3)) return false;
    return this.cadencePhase >= (cadence.pulseWindowStart ?? 0.68)
      && this.cadencePhase <= (cadence.pulseWindowEnd ?? 0.93);
  }

  completionProgress() {
    const requiredReads = Math.max(1, this.recipe.cadence?.requiredReads ?? 3);
    const readPart = Math.min(1, this.lockedCadenceReads / requiredReads) * 0.52;
    const depthPart = Math.min(1, this.maxDepthProgress / Math.max(0.01, this.recipe.completion?.minimumDeepProgress ?? 0.78)) * 0.18;
    const stabilizePart = Math.min(1, this.stabilizeSeconds / Math.max(0.01, this.recipe.completion?.minimumStabilizeSeconds ?? 0.8)) * 0.12;
    const syncPart = Math.min(1, this.synchronization / Math.max(0.01, this.recipe.completion?.minimumSynchronization ?? 0.74)) * 0.18;
    return this.completed ? 1 : THREE.MathUtils.clamp(readPart + depthPart + stabilizePart + syncPart - this.turbulence * 0.12, 0, 0.99);
  }

  stage() {
    if (this.completed) return "return_current";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete && (this.desynchronized || this.warning.includes("desynchronization"))) {
      return "recover_locked_cadences";
    }
    if (readsComplete) return "settle_locked_cadences";
    if (this.desynchronized || this.warning.includes("desynchronization")) return "recover_desynchronization";
    if (this.pulseWindowOpen() && this.chargeDistance <= (this.recipe.cadence?.pulseRange ?? 1.3) * 1.35) {
      return "read_living_cadence";
    }
    return [
      "ride_intake_current",
      "ride_branch_current",
      "ride_deep_current",
      "settle_deep_circulation"
    ][Math.min(this.lockedCadenceReads, 3)];
  }

  guideLine() {
    if (this.completed) return "The vessel has learned your cadence. Its current now carries you back toward the Hub.";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete && (this.desynchronized || this.warning.includes("desynchronization"))) {
      return "All three cadences are retained. Stop pulsing; hold Stabilize while the scattered current turns green and reweaves.";
    }
    if (readsComplete) {
      return "All three cadences are retained. Hold Stabilize for one settling contraction; the return current will turn gold.";
    }
    if (this.desynchronized || this.warning.includes("desynchronization")) {
      return "The rhythm scattered, but it is not lost. Hold Stabilize while you remain inside the living current.";
    }
    if (this.pulseWindowOpen() && this.chargeDistance <= (this.recipe.cadence?.pulseRange ?? 1.3) * 1.35) {
      return "The charge swells as the valve yields. Pulse with it now.";
    }
    return "Move with the bright charge. The walls contract; the current is the path.";
  }

  nextAction() {
    if (this.completed) return "Follow the gold return current into the open entry fold.";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete) {
      return this.stabilizationInRange
        ? "Hold LT until the current turns gold. The three reads are already safe."
        : "Move back inside the braided vessel, then hold LT. Do not Pulse again.";
    }
    if (this.desynchronized || this.warning.includes("desynchronization")) {
      return "Hold LT near the center current until the scattered charge reweaves.";
    }
    if (this.pulseWindowOpen() && this.chargeDistance <= (this.recipe.cadence?.pulseRange ?? 1.3) * 1.35) {
      return "Press X while the charge and valve brighten together.";
    }
    if (this.stabilizeSeconds < (this.recipe.completion?.minimumStabilizeSeconds ?? 0.8)) {
      return "Ride deeper with the charge; hold LT through a strong vessel contraction.";
    }
    return "Stay with the moving charge until the next valve opens.";
  }

  publish(frameState, active) {
    const returnDistance = this.playerRoot.position.distanceTo(this.returnPosition);
    const requiredReads = this.recipe?.cadence?.requiredReads ?? 3;
    const stage = this.stage();
    frameState.vascularRhythmRoute = {
      pass: "HC-018D",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      regionId: "vascular_route",
      runtimeCellId: ROUTE_CELL_ID,
      status: this.completed
        ? active ? "circulation_synchronized_return_current_active" : "circulation_synchronized_retained"
        : active
          ? this.desynchronized ? "recoverable_desynchronization_active" : "vascular_rhythm_playable"
          : "prepared_inactive",
      stage,
      progress: this.completionProgress(),
      completed: this.completed,
      synchronizationComplete: this.completed,
      pathProgress: active ? this.pathProgress : 0,
      maxDepthProgress: this.maxDepthProgress,
      pathDistance: active ? this.pathDistance : 0,
      flowAlignment: active ? this.flowAlignment : 0,
      cadencePhase: active ? this.cadencePhase : 0,
      pulseWindowOpen: Boolean(active && this.pulseWindowOpen()),
      chargeDistance: active && Number.isFinite(this.chargeDistance) ? this.chargeDistance : 0,
      chargePosition: active ? {
        x: this.chargeWorldPosition.x,
        y: this.chargeWorldPosition.y,
        z: this.chargeWorldPosition.z
      } : null,
      lockedCadenceReads: this.lockedCadenceReads,
      requiredCadenceReads: requiredReads,
      synchronization: this.synchronization,
      circulationIntegrity: this.circulationIntegrity,
      turbulence: this.turbulence,
      contractionIntensity: active ? this.contractionIntensity : 0,
      retainedConsequence: {
        pass: "HC-018D",
        active: this.lockedCadenceReads > 0 || this.completed,
        kind: this.completed
          ? "synchronized_return_current_retained"
          : this.lockedCadenceReads > 0
            ? "cadence_reads_retained_in_vessel"
            : "none",
        strength: this.retainedSynchronizationStrength,
        survivesUnmountRemount: true,
        progressionAuthority: false
      },
      traversalMaterial: {
        pass: "HC-018D",
        mode: active ? this.traversalMaterialMode : "inactive",
        pulsePressureSurge: active ? this.traversalPulseWake : 0,
        absorbDrawWake: active ? this.traversalAbsorbShear : 0,
        stabilizeCalmLane: active ? this.traversalStabilizeCalm : 0,
        progressionAuthority: false,
        chemistryAuthority: false,
        routeCrossingAuthority: false
      },
      coreWorldResonance: {
        pass: "HC-028D",
        active: Boolean(frameState.coreWorldResonance?.active),
        relation: frameState.coreWorldResonance?.relationshipState ?? "inactive",
        coherence01: frameState.coreWorldResonance?.coherence01 ?? 0,
        phaseAlignment01: frameState.coreWorldResonance?.phaseAlignment01 ?? 0,
        coreFunction: frameState.coreWorldResonance?.coreFunction ?? "none",
        worldFunction: frameState.coreWorldResonance?.worldFunction ?? "none",
        presentationOnly: true,
        progressionAuthority: false,
        routeCompletionAuthority: false,
        movementAuthority: false
      },
      worldComposition: {
        pass: "HC-028C",
        active: Boolean(frameState.hostRhythm?.composition?.active),
        profileId: frameState.hostRhythm?.composition?.profileId ?? "legacy_host_breath",
        keyId: frameState.hostRhythm?.composition?.keyId ?? "unassigned",
        meter: frameState.hostRhythm?.composition?.meterLabel ?? "unassigned",
        tempoBpm: frameState.hostRhythm?.composition?.tempoBpm ?? 0,
        octave: frameState.hostRhythm?.composition?.octaveLabel ?? "unassigned",
        beatNumber: frameState.hostRhythm?.composition?.beatNumber ?? 0,
        currentFunction: frameState.hostRhythm?.composition?.currentFunction ?? "none",
        accentRole: frameState.hostRhythm?.composition?.accentRole ?? "none",
        accentStrength: frameState.hostRhythm?.composition?.accentStrength ?? 0,
        flowScale: frameState.hostRhythm?.composition?.flowScale ?? 1,
        movementModulationDepth: frameState.hostRhythm?.composition?.flowModulationDepth ?? 0,
        sharedHostClock: true,
        inputTimingGate: false,
        progressionAuthority: false,
        routeCompletionAuthority: false
      },
      grammarReinforcement: {
        pass: "HC-027L1",
        active: Boolean(active && this.grammarReinforcementStrength > 0.01),
        window: active ? this.grammarReinforcementWindow : 0,
        mode: active ? this.grammarReinforcementMode : "none",
        strength: active ? Number(this.grammarReinforcementStrength.toFixed(3)) : 0,
        matchingActionObserved: Boolean(active && this.grammarReinforcementMatched),
        windows: ["uncertain_current_probe", "loose_draw_release", "phase_strain_contraction"],
        impliedVerbDebugOnly: this.grammarReinforcementMode === "uncertain_current_probe"
          ? "pulse"
          : this.grammarReinforcementMode === "loose_draw_release"
            ? "absorb"
            : this.grammarReinforcementMode === "phase_strain_contraction"
              ? "stabilize"
              : "none",
        usesExistingVesselAndMotesOnly: true,
        createsObjective: false,
        createsWaypoint: false,
        changesCompletion: false,
        changesMovement: false
      },
      stabilizeSeconds: this.stabilizeSeconds,
      matchedFlowSeconds: this.matchedFlowSeconds,
      desynchronized: this.desynchronized,
      stabilizing: this.stabilizing,
      stabilizationInRange: this.stabilizationInRange,
      stabilizationRange: this.stabilizationRange,
      riskEventCount: this.riskEventCount,
      desynchronizationCount: this.riskEventCount,
      offBeatPulseCount: this.offBeatPulseCount,
      postReadPulseIgnoredCount: this.postReadPulseIgnoredCount,
      recoverySeconds: this.recoverySeconds,
      recoveryCount: Number(this.desynchronizationRecovered),
      desynchronizationRecovered: this.desynchronizationRecovered,
      failureRecoverable: true,
      returnFoldReady: this.returnFoldReady,
      returnFoldDistance: active ? returnDistance : 0,
      returnFoldInteractionRange: this.recipe?.returnFold?.interactionRange ?? 1.35,
      returnFoldPosition: active ? {
        x: this.returnPosition.x,
        y: this.returnPosition.y,
        z: this.returnPosition.z
      } : null,
      circulationDirection: this.completed ? "outward_to_hub" : "inward_to_deep_valve",
      currentDirection: this.completed ? "outward" : "inward",
      currentReversedTowardHub: this.completed,
      valveSilhouetteCount: this.valves.length,
      movingChargeVisible: Boolean(active && this.chargeRoot?.visible !== false),
      visualMotionLanguages: [...(this.recipe?.visual?.motionLanguages ?? [])],
      genericRingCount: 0,
      triggerMarkerCount: 0,
      lastInteraction: this.lastInteraction,
      warning: this.warning,
      guideLine: this.guideLine(),
      objectiveLine: this.nextAction(),
      nextAction: this.nextAction(),
      gameplayOwner: "VascularRhythmRouteSystem",
      presentationOwner: "VascularRhythmRouteSystem",
      movementOwner: "PlayerMovementController",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      playerPositionPreserved: true,
      forcedRelocation: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      permanentClass: false,
      archivedCompatibilitySystemsActivated: 0,
      mountCount: this.mountCount
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = visible;
    if (this.returnFold) this.returnFold.visible = Boolean(visible && this.returnFoldReady);
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }
}
