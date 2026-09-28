import * as THREE from "three";

const ROUTE_CELL_ID = "CELL_SILT_PRESSURE_ROUTE_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const RECIPE_ID = "SILT_PRESSURE_PLAYABLE_CIRCUIT_HC012A";

/**
 * HC-012A owns Silt Pressure gameplay and presentation while the route is
 * mounted. The route asks the existing verbs to do distinct work: Pulse reads
 * density, Stabilize braces/reopens compressed anatomy, and Absorb must select
 * porous nourishment rather than packed residue. It never translates the
 * player or mutates objective, gate, active-cell, or route-history truth.
 */
export class SiltPressureRouteSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[SiltPressureRouteSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[SiltPressureRouteSystem] scene is required.");
    if (!playerRoot) throw new Error("[SiltPressureRouteSystem] playerRoot is required.");
    if (!frameState) throw new Error("[SiltPressureRouteSystem] frameState is required.");

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
    this.envelope = null;
    this.ribGroups = [];
    this.passageBanks = [];
    this.siltMotes = [];
    this.safePacket = null;
    this.safePacketCore = null;
    this.safeAbsorbStream = null;
    this.safeAbsorbStreamPositions = new Float32Array(6);
    this.densePackets = [];
    this.deepOrgan = null;
    this.returnFold = null;
    this.returnFoldLobes = [];
    this.materials = [];

    this.entryAnchor = new THREE.Vector3();
    this.returnPosition = new THREE.Vector3();
    this.localPlayer = new THREE.Vector3();
    this.closestPoint = new THREE.Vector3();
    this.closestTangent = new THREE.Vector3(0, 0, -1);
    this.segmentVector = new THREE.Vector3();
    this.segmentStartToPlayer = new THREE.Vector3();
    this.tempPoint = new THREE.Vector3();
    this.tempPointB = new THREE.Vector3();
    this.safePacketWorld = new THREE.Vector3();
    this.densePacketWorld = new THREE.Vector3();

    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.pathProgress = 0;
    this.maxDepthProgress = 0;
    this.pathDistance = 0;
    this.pressureRead = false;
    this.pressureReadCount = 0;

    // HC031S — Silt currentization. The compressed passage is treated as an
    // environmental pressure relationship rather than a route-local Pulse flag.
    // Stabilize establishes/holds that relationship; Pulse projects through it
    // to read compression. The retained pressure read then supports the existing
    // rib brace, selective appetite choice, recoverable failure and return breath.
    this.pressureRelationshipHeld = false;
    this.pressureRelationshipReady = false;
    this.pressureRelationshipSeconds = 0;
    this.pressureReadSequence = 0;
    this.lastPressureReadChord = "idle";
    this.unboundPulseCount = 0;
    this.appetiteDrawSequence = 0;
    this.lastAppetiteDrawKind = "none";

    this.braceSeconds = 0;
    this.ribsReleased = false;
    this.safeAbsorbSeconds = 0;
    this.safeMatterAbsorbed = false;
    this.previousAbsorbHeld = false;
    this.greedyAbsorbSeconds = 0;
    this.compression = 0.62;
    this.compressionFailure = false;
    this.failureCount = 0;
    this.failureRecovered = false;
    this.recoverySeconds = 0;
    this.stabilizing = false;
    this.stabilizationInRange = false;
    this.absorbHeld = false;
    this.safePacketDistance = Number.POSITIVE_INFINITY;
    this.nearestDenseDistance = Number.POSITIVE_INFINITY;
    this.completed = false;
    this.returnFoldReady = false;
    this.lastPulseEventId = -1;
    this.lastInteraction = "none";
    this.warning = "none";
    this.pulseFlashAge = 99;
    this.failureFlashAge = 99;

    // HC018D: retained consequence presentation only.
    this.retainedDepletionStrength = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.siltPressureRouteCircuit;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[SiltPressureRouteSystem] Missing ${RECIPE_ID}.`);
    }
    this.pathPoints = (this.recipe.anatomy?.pathPoints ?? [])
      .map((point) => new THREE.Vector3().fromArray(point));
    if (this.pathPoints.length < 5) {
      throw new Error("[SiltPressureRouteSystem] Silt path requires at least five authored points.");
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
      status: "silt_pressure_route_prepared_hidden",
      rootCount: 1,
      ribCount: this.ribGroups.length,
      appetitePacketCount: 1 + this.densePackets.length,
      activeCellId: frameState.activeCellId,
      mutatesProgression: false
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.entryAnchor.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);
    const returnOffset = this.recipe.returnFold?.position ?? [0, -0.04, 0.58];
    this.returnPosition.copy(this.entryAnchor).add(this.tempPoint.fromArray(returnOffset));
    this.setVisible(true);
    this.lastInteraction = this.completed
      ? "returned_to_released_silt_passage"
      : "entered_compressed_silt_without_forced_relocation";
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.setVisible(false);
    this.lastInteraction = frameState.activeCellId === HUB_CELL_ID
      ? "returned_to_hub_through_silt_fold"
      : "silt_pressure_route_unmounted";
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
    this.failureFlashAge += dt;
    const sample = this.samplePlayerPath();
    this.updateDistances();
    this.updatePlay(dt, frameState, sample);
    this.applyDynamicPressure(frameState, sample);
    this.animate(frameState, sample);
    this.applyHostRhythmVisual(frameState);
    this.publish(frameState, true);
  }



  applyHostRhythmVisual(frameState) {
    const host = frameState.hostRhythm ?? {};
    if (!host.active) return;

    const composition = host.composition ?? {};
    const composed = Boolean(
      composition.active
      && composition.profileId === "silt_asp_34_micro"
    );

    if (!composed) {
      // Retained HC022G fallback for non-authored/legacy Host rhythm states.
      const phase = ((host.normalizedPhase ?? 0) - 0.09 + 1) % 1;
      const wave = Math.sin(phase * Math.PI * 2 - Math.PI * 0.5);
      const pressure = 0.5 + 0.5 * wave;

      if (this.envelope?.material) {
        this.envelope.material.opacity = Math.min(
          0.34,
          this.envelope.material.opacity + pressure * 0.045
        );
        this.envelope.material.emissiveIntensity += pressure * 0.10;
      }

      for (const group of this.ribGroups) {
        for (const mesh of group.children) {
          if (!mesh.isMesh) continue;
          mesh.scale.x *= 1 - pressure * 0.028;
          mesh.scale.y *= 1 + pressure * 0.042;
          if (mesh.material) mesh.material.emissiveIntensity += pressure * 0.085;
        }
      }

      if (this.deepOrgan) {
        const organBreath = 1 + wave * 0.035;
        this.deepOrgan.scale.x *= organBreath;
        this.deepOrgan.scale.z *= organBreath;
      }

      this.root.userData.hostRhythmInterpretation = {
        pass: "HC-022G",
        region: "silt",
        mode: "lagged_compression_and_settling",
        phaseLag: 0.09,
        visible: true,
        gameplayAuthority: false
      };
      return;
    }

    // HC028E: Silt interprets the same Host breath as two slow 3/4 bars.
    // Absorb gathers/weights, Stabilize braces, Pulse releases/reads pressure.
    const accent = THREE.MathUtils.clamp(composition.accentStrength ?? 0, 0, 1);
    const beatPulse = THREE.MathUtils.clamp(composition.beatPulse ?? 0, 0, 1);
    const currentFunction = composition.currentFunction ?? "absorb";
    const absorbAccent = currentFunction === "absorb" ? accent : 0;
    const stabilizeAccent = currentFunction === "stabilize" ? accent : 0;
    const pulseAccent = currentFunction === "pulse" ? accent : 0;
    const resonance = frameState.coreWorldResonance ?? {};
    const worldReply = resonance.active
      ? THREE.MathUtils.clamp(resonance.presentation?.worldReplyStrength ?? 0, 0, 1)
      : 0;

    if (this.envelope?.material) {
      this.envelope.material.opacity = Math.min(
        0.36,
        this.envelope.material.opacity + beatPulse * 0.012 + absorbAccent * 0.038
      );
      this.envelope.material.emissiveIntensity +=
        absorbAccent * 0.12 + stabilizeAccent * 0.07 + pulseAccent * 0.10 + worldReply * 0.14;
    }

    for (const [index, group] of this.ribGroups.entries()) {
      const local = 0.78 + 0.22 * Math.sin(index * 1.31 + (composition.beatInBar ?? 0) * 0.9);
      for (const mesh of group.children) {
        if (!mesh.isMesh) continue;
        // Visual-only phrase: gather narrows the passage, brace catches the
        // deformation, and Pulse gives a brief outward/read release.
        mesh.scale.x *= 1 - absorbAccent * 0.040 * local + pulseAccent * 0.018 * local;
        mesh.scale.y *= 1 + absorbAccent * 0.052 * local - stabilizeAccent * 0.018 * local;
        if (mesh.material) {
          mesh.material.emissiveIntensity +=
            absorbAccent * 0.11 + stabilizeAccent * 0.13 + pulseAccent * 0.16 + worldReply * 0.10;
        }
      }
    }

    for (const mote of this.siltMotes) {
      if (!mote.material) continue;
      mote.material.opacity = Math.min(
        0.92,
        mote.material.opacity + absorbAccent * 0.08 + pulseAccent * 0.05 + worldReply * 0.04
      );
    }

    if (this.deepOrgan) {
      const gather = 1 - absorbAccent * 0.025;
      const release = 1 + pulseAccent * 0.048;
      const brace = 1 - stabilizeAccent * 0.012;
      this.deepOrgan.scale.x *= gather * release;
      this.deepOrgan.scale.z *= gather * release;
      this.deepOrgan.scale.y *= brace;
      if (this.deepOrgan.material) this.deepOrgan.material.emissiveIntensity += worldReply * 0.16;
    }

    this.root.userData.hostRhythmInterpretation = {
      pass: "HC-028E",
      region: "silt",
      profileId: composition.profileId,
      keyId: composition.keyId,
      meter: composition.meterLabel,
      grouping: composition.groupingLabel,
      tempoBpm: composition.tempoBpm,
      beatNumber: composition.beatNumber,
      currentFunction,
      accentRole: composition.accentRole,
      mode: "asp_key_34_pressure_appetite_phrase",
      accentLaw: "1_gather_2_brace_3_read_release",
      resonanceReply: worldReply,
      visible: true,
      gameplayAuthority: false,
      movementAuthority: false,
      inputTimingGate: false
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
    this.root.name = "silt_pressure_route_authority_HC012A";
    Object.assign(this.root.userData, {
      regionId: "silt_burrow_route",
      gameplayOwner: "SiltPressureRouteSystem",
      presentationOwner: "SiltPressureRouteSystem",
      transitionPrepared: true,
      targetingSuppressed: true,
      genericRings: 0,
      triggerMarkers: 0
    });

    const visual = this.recipe.visual ?? {};
    const envelopeMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.siltColor ?? 0x57442f,
      emissive: visual.deepColor ?? 0x251d1b,
      emissiveIntensity: 0.16,
      roughness: 0.94,
      metalness: 0.02,
      transparent: true,
      opacity: 0.17,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.envelope = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.pathCurve,
        156,
        this.recipe.anatomy?.passageRadius ?? 1.22,
        12,
        false
      ),
      envelopeMaterial
    );
    this.envelope.name = "silt_compressed_residue_passage";
    this.envelope.userData.targetingSuppressed = true;
    this.root.add(this.envelope);

    // HC-016Z: irregular residue banks occupy the passage edges so the
    // tight/open/tight pressure grammar is visible continuously, not only at ribs.
    for (let index = 0; index < 11; index += 1) {
      const progress = 0.035 + index * 0.088;
      const point = this.pathCurve.getPointAt(Math.min(0.965, progress));
      const tangent = this.pathCurve.getTangentAt(Math.min(0.965, progress)).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const porousRelief = progress > 0.49 && progress < 0.69;
      const bankMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: porousRelief ? 0x725c42 : (index % 2 === 0 ? 0x493729 : 0x5b412d),
        emissive: porousRelief ? 0x3f3425 : 0x2d2019,
        emissiveIntensity: 0.1,
        roughness: 0.96,
        transparent: true,
        opacity: porousRelief ? 0.3 : 0.48,
        depthWrite: false
      }));
      const bank = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), bankMaterial);
      bank.name = `silt_residue_bank_${index + 1}`;
      bank.position.copy(point).addScaledVector(side, (index % 2 ? 1 : -1) * (porousRelief ? 1.18 : 0.88));
      bank.position.y += -0.15 + (index % 3) * 0.18;
      bank.scale.set(porousRelief ? 0.62 : 0.9, porousRelief ? 0.55 : 1.05, 1.35 + (index % 3) * 0.18);
      bank.rotation.set(index * 0.13, index * 0.27, index * 0.09);
      bank.userData.targetingSuppressed = true;
      this.root.add(bank);
      this.passageBanks.push(bank);
    }

    for (const [index, progress] of (this.recipe.anatomy?.ribProgress ?? []).entries()) {
      this.createRib(index, progress);
    }
    this.createSiltMotes();
    this.createAppetitePackets();
    this.createDeepOrgan();
    this.createReturnFold();
    this.scene.add(this.root);
  }

  createRib(index, progress) {
    const group = new THREE.Group();
    group.name = `silt_asymmetric_compression_rib_${index + 1}`;
    group.position.copy(this.pathCurve.getPointAt(progress));
    const tangent = this.pathCurve.getTangentAt(progress).normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    Object.assign(group.userData, { progress, phase: index * 1.31, targetingSuppressed: true });

    const material = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? 0x705034 : 0x60412f,
      emissive: 0x36231c,
      emissiveIntensity: 0.2,
      roughness: 0.88,
      transparent: true,
      opacity: 0.9
    }));
    const pieces = [
      { name: "left", position: [-0.72, 0, 0], rotationZ: -0.12, scale: [0.72, 1, 0.7] },
      { name: "right", position: [0.72, -0.08, 0], rotationZ: 0.18, scale: [0.68, 0.9, 0.72] },
      { name: "crown", position: [0.1, 0.72, -0.04], rotationZ: Math.PI / 2 + 0.12, scale: [0.58, 0.92, 0.62] }
    ];
    for (const piece of pieces) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 1.08, 7, 10),
        material.clone()
      );
      this.materials.push(mesh.material);
      mesh.name = `silt_rib_${index + 1}_${piece.name}`;
      mesh.position.fromArray(piece.position);
      mesh.rotation.z = piece.rotationZ;
      mesh.scale.fromArray(piece.scale);
      Object.assign(mesh.userData, {
        role: piece.name,
        basePosition: mesh.position.clone(),
        baseScale: mesh.scale.clone(),
        targetingSuppressed: true
      });
      group.add(mesh);
    }
    this.root.add(group);
    this.ribGroups.push(group);
  }

  createSiltMotes() {
    const count = this.recipe.anatomy?.siltMoteCount ?? 34;
    const geometry = new THREE.IcosahedronGeometry(0.035, 0);
    for (let index = 0; index < count; index += 1) {
      const progress = (index + 0.5) / count;
      const material = this.trackMaterial(new THREE.MeshBasicMaterial({
        color: index % 5 === 0 ? 0xc29150 : 0x71553c,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(geometry, material);
      mote.name = `silt_shift_mote_${index + 1}`;
      mote.userData.baseProgress = progress;
      mote.userData.phase = index * 0.83;
      mote.userData.radius = 0.18 + (index % 4) * 0.13;
      mote.userData.targetingSuppressed = true;
      this.root.add(mote);
      this.siltMotes.push(mote);
    }
  }

  createAppetitePackets() {
    const appetite = this.recipe.appetite ?? {};
    const progress = appetite.chamberProgress ?? 0.56;
    const base = this.pathCurve.getPointAt(progress);

    this.safePacket = new THREE.Group();
    this.safePacket.name = "silt_porous_nutrient_packet";
    this.safePacket.position.copy(base).add(new THREE.Vector3().fromArray(appetite.safeOffset ?? [0.62, 0.2, 0]));
    this.safePacket.userData.targetingSuppressed = true;
    const safeMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xd29a4b,
      emissive: 0x8a5728,
      emissiveIntensity: 0.6,
      roughness: 0.48,
      transparent: true,
      opacity: 0.96
    }));
    this.safePacketCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), safeMaterial);
    this.safePacketCore.name = "silt_porous_nutrient_core";
    this.safePacket.add(this.safePacketCore);
    for (let index = 0; index < 5; index += 1) {
      const filament = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.026, 0.24 + index * 0.018, 5, 7),
        safeMaterial.clone()
      );
      this.materials.push(filament.material);
      filament.name = `silt_porous_nutrient_filament_${index + 1}`;
      const angle = index * (Math.PI * 2 / 5);
      filament.position.set(Math.cos(angle) * 0.23, Math.sin(angle) * 0.19, 0);
      filament.rotation.z = -angle;
      filament.scale.set(0.72, 1, 0.72);
      this.safePacket.add(filament);
    }
    this.root.add(this.safePacket);

    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.safeAbsorbStreamPositions, 3)
    );
    const streamMaterial = this.trackMaterial(new THREE.LineBasicMaterial({
      color: 0xf0b765,
      transparent: true,
      opacity: 0,
      depthWrite: false
    }));
    this.safeAbsorbStream = new THREE.Line(streamGeometry, streamMaterial);
    this.safeAbsorbStream.name = "silt_safe_matter_absorb_stream";
    this.safeAbsorbStream.visible = false;
    this.safeAbsorbStream.userData.targetingSuppressed = true;
    this.root.add(this.safeAbsorbStream);

    const denseOffsets = appetite.denseOffsets ?? [[-0.62, -0.08, 0.04], [0.04, 0.7, -0.14]];
    for (const [index, offset] of denseOffsets.entries()) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index === 0 ? 0x3b3430 : 0x45332f,
        emissive: 0x241418,
        emissiveIntensity: 0.24,
        roughness: 0.98,
        transparent: true,
        opacity: 0.96
      }));
      const packet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42 + index * 0.07, 0), material);
      packet.name = `silt_packed_residue_decoy_${index + 1}`;
      packet.position.copy(base).add(new THREE.Vector3().fromArray(offset));
      packet.scale.set(1.2, 0.8, 0.92);
      packet.userData.phase = index * 1.7;
      packet.userData.targetingSuppressed = true;
      this.root.add(packet);
      this.densePackets.push(packet);
    }
  }

  createDeepOrgan() {
    const progress = this.recipe.anatomy?.deepOrganProgress ?? 0.88;
    const material = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x6f4c35,
      emissive: 0x3d241d,
      emissiveIntensity: 0.32,
      roughness: 0.82,
      transparent: true,
      opacity: 0.88
    }));
    this.deepOrgan = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), material);
    this.deepOrgan.name = "silt_deep_pressure_release_organ";
    this.deepOrgan.position.copy(this.pathCurve.getPointAt(progress));
    this.deepOrgan.scale.set(1.35, 0.78, 1.02);
    this.deepOrgan.userData.targetingSuppressed = true;
    this.root.add(this.deepOrgan);
  }

  createReturnFold() {
    this.returnFold = new THREE.Group();
    this.returnFold.name = "silt_pressure_return_fold";
    this.returnFold.position.fromArray(this.recipe.returnFold?.position ?? [0, -0.04, 0.58]);
    this.returnFold.userData.targetingSuppressed = true;
    const colors = [0xc99555, 0x8a6240, 0x584038];
    for (let index = 0; index < 3; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: colors[index],
        emissive: colors[index],
        emissiveIntensity: 0.22,
        roughness: 0.6,
        transparent: true,
        opacity: 0.78
      }));
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.76 - index * 0.08, 7, 10), material);
      lobe.name = `silt_return_fold_lobe_${index + 1}`;
      const side = index === 0 ? -1 : index === 1 ? 1 : 0;
      lobe.position.set(side * 0.34, index === 2 ? -0.28 : 0, index === 2 ? -0.12 : 0);
      lobe.rotation.z = side * 0.62 + (index === 2 ? Math.PI / 2 : 0);
      lobe.userData.side = side;
      lobe.userData.basePosition = lobe.position.clone();
      lobe.userData.targetingSuppressed = true;
      this.returnFold.add(lobe);
      this.returnFoldLobes.push(lobe);
    }
    this.returnFold.visible = false;
    this.root.add(this.returnFold);
  }

  samplePlayerPath() {
    this.localPlayer.copy(this.playerRoot.position).sub(this.entryAnchor);
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let bestProgressDistance = 0;

    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const start = this.pathPoints[index];
      const end = this.pathPoints[index + 1];
      this.segmentVector.copy(end).sub(start);
      const lengthSq = Math.max(0.0001, this.segmentVector.lengthSq());
      this.segmentStartToPlayer.copy(this.localPlayer).sub(start);
      const alpha = THREE.MathUtils.clamp(this.segmentStartToPlayer.dot(this.segmentVector) / lengthSq, 0, 1);
      this.tempPoint.copy(start).addScaledVector(this.segmentVector, alpha);
      const distanceSq = this.tempPoint.distanceToSquared(this.localPlayer);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        this.closestPoint.copy(this.tempPoint);
        this.closestTangent.copy(this.segmentVector).normalize();
        bestProgressDistance = this.pathCumulativeLengths[index] + this.pathSegmentLengths[index] * alpha;
      }
    }

    this.pathDistance = Math.sqrt(bestDistanceSq);
    this.pathProgress = THREE.MathUtils.clamp(bestProgressDistance / Math.max(0.001, this.pathLength), 0, 1);
    this.maxDepthProgress = Math.max(this.maxDepthProgress, this.pathProgress);
    return {
      progress: this.pathProgress,
      distance: this.pathDistance,
      tangent: this.closestTangent
    };
  }

  updateDistances() {
    this.safePacketDistance = Number.POSITIVE_INFINITY;
    if (this.safePacket?.visible) {
      this.safePacket.getWorldPosition(this.safePacketWorld);
      this.safePacketDistance = this.playerRoot.position.distanceTo(this.safePacketWorld);
    }
    this.nearestDenseDistance = Number.POSITIVE_INFINITY;
    for (const packet of this.densePackets) {
      packet.getWorldPosition(this.densePacketWorld);
      this.nearestDenseDistance = Math.min(
        this.nearestDenseDistance,
        this.playerRoot.position.distanceTo(this.densePacketWorld)
      );
    }
  }

  updatePlay(dt, frameState, sample) {
    const input = frameState.input ?? {};
    const composition = frameState.verbComposition ?? {};
    const pressure = this.recipe.pressure ?? {};
    const appetite = this.recipe.appetite ?? {};
    const recovery = this.recipe.recovery ?? {};
    const completion = this.recipe.completion ?? {};
    const currentization = this.recipe.currentization ?? {};

    this.stabilizationInRange = sample.distance <= (recovery.stabilizeRangeFromPassage ?? 1.9);
    this.stabilizing = Boolean(input.stabilizeHeld && this.stabilizationInRange);
    this.absorbHeld = Boolean(input.absorbHeld);

    // HC031S: pressure is an environmental relationship. The Core must first
    // occupy the authored rib-reading band and hold Stabilize long enough to
    // establish that relation. Pulse then projects through it. There is no new
    // noun target and no TargetingSystem exception.
    const pressureSpatiallyReady = Boolean(
      sample.progress >= (pressure.readProgressMin ?? 0.08)
      && sample.progress <= (pressure.readProgressMax ?? 0.46)
      && sample.distance <= (pressure.pulseReadRangeFromPassage ?? 1.55)
    );
    this.pressureRelationshipHeld = Boolean(
      !this.completed
      && !this.compressionFailure
      && this.stabilizing
      && pressureSpatiallyReady
    );
    if (this.pressureRelationshipHeld) {
      this.pressureRelationshipSeconds += dt;
    } else {
      const releaseRate = currentization.relationshipReleaseRate ?? 3.6;
      this.pressureRelationshipSeconds = Math.max(
        0,
        this.pressureRelationshipSeconds - dt * releaseRate
      );
    }
    const minimumRelationshipHoldSeconds = currentization.minimumRelationshipHoldSeconds ?? 0.18;
    this.pressureRelationshipReady = Boolean(
      this.pressureRelationshipHeld
      && this.pressureRelationshipSeconds >= minimumRelationshipHoldSeconds
    );

    const pulseEventId = input.pulseEventId ?? (frameState.frame ?? 0);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) {
      this.lastPulseEventId = pulseEventId;
      this.pulseFlashAge = 0;
      if (!this.pressureRead && this.pressureRelationshipReady) {
        this.pressureRead = true;
        this.pressureReadCount += 1;
        this.pressureReadSequence += 1;
        this.lastPressureReadChord = composition.chord ?? "cohere_project";
        this.lastInteraction = "stabilized_pressure_relationship_read_by_pulse";
        this.warning = "keep_stabilize_held_to_brace_living_ribs";
      } else if (this.pressureRead) {
        this.lastPressureReadChord = composition.chord ?? "project";
        this.lastInteraction = "pulse_echoes_through_retained_pressure_relationship";
      } else {
        this.unboundPulseCount += 1;
        this.lastPressureReadChord = composition.chord ?? "project";
        this.lastInteraction = !pressureSpatiallyReady
          ? "pulse_scattered_outside_compressed_rib_relationship"
          : !this.stabilizing
            ? "pulse_without_stabilized_pressure_relationship"
            : "pressure_relationship_not_yet_settled";
        this.warning = "hold_stabilize_then_pulse_to_read_pressure";
      }
    }

    if (this.stabilizing) {
      if (this.compressionFailure) {
        this.compression = Math.max(0, this.compression - dt * (recovery.compressionRecoveryPerSecond ?? 0.5));
        this.recoverySeconds += dt;
        this.lastInteraction = "stabilize_reopening_compressed_passage";
        this.warning = "recoverable_compression_releasing";
        if (this.compression <= (recovery.recoveredCompressionThreshold ?? 0.22)) {
          this.compressionFailure = false;
          this.failureRecovered = true;
          this.greedyAbsorbSeconds = 0;
          this.lastInteraction = "compressed_passage_reopened_without_lost_progress";
          this.warning = "none";
        }
      } else if (!this.pressureRead && this.pressureRelationshipReady) {
        this.lastInteraction = "stabilize_established_compressed_pressure_relationship";
        this.warning = "pulse_through_held_pressure_relationship";
      } else if (this.pressureRead && !this.ribsReleased) {
        this.braceSeconds += dt;
        this.compression = Math.max(0.26, this.compression - dt * (pressure.braceReleasePerSecond ?? 0.28));
        this.lastInteraction = "stabilize_bracing_living_ribs";
        if (this.braceSeconds >= (pressure.requiredBraceSeconds ?? 1.05)) {
          this.ribsReleased = true;
          this.lastInteraction = "living_ribs_held_open_by_stabilized_pressure";
          this.warning = "none";
        }
      }
    }

    const safeRange = appetite.safeAbsorbRange ?? 0.92;
    const denseRange = appetite.denseRiskRange ?? 0.9;
    if (this.absorbHeld && !this.completed) {
      if (this.compressionFailure) {
        this.lastInteraction = "absorb_cannot_pull_through_closed_compression";
      } else if (
        this.pressureRead
        && this.ribsReleased
        && !this.safeMatterAbsorbed
        && this.safePacketDistance <= safeRange
        && this.safePacketDistance + (appetite.selectionDistanceAdvantage ?? 0.08) < this.nearestDenseDistance
      ) {
        this.safeAbsorbSeconds += dt;
        this.lastInteraction = "selective_absorb_drawing_porous_nutrient";
        this.warning = "none";
        if (this.safeAbsorbSeconds >= (appetite.requiredSafeAbsorbSeconds ?? 0.68)) {
          this.safeMatterAbsorbed = true;
          this.appetiteDrawSequence += 1;
          this.lastAppetiteDrawKind = "porous_nutrient";
          this.lastInteraction = "porous_nutrient_accepted_dense_residue_left_intact";
        }
      } else if (this.nearestDenseDistance <= denseRange) {
        this.greedyAbsorbSeconds += dt;
        this.lastInteraction = "greedy_absorb_loading_packed_residue";
        if (this.greedyAbsorbSeconds >= (appetite.greedyFailureSeconds ?? 0.38)) {
          this.lastAppetiteDrawKind = "packed_residue_risk";
          this.registerCompressionFailure();
        }
      } else {
        this.greedyAbsorbSeconds = Math.max(0, this.greedyAbsorbSeconds - dt * 1.5);
        this.lastInteraction = this.ribsReleased
          ? "absorb_reaches_no_selected_spatial_matter"
          : "appetite_waits_for_pressure_relationship_and_brace";
      }
    } else if (!this.absorbHeld) {
      this.greedyAbsorbSeconds = Math.max(0, this.greedyAbsorbSeconds - dt * 2.5);
    }
    this.previousAbsorbHeld = this.absorbHeld;

    const targetCompression = this.completed ? 0.1 : this.ribsReleased ? 0.28 : 0.62;
    if (!this.compressionFailure && !this.stabilizing) {
      const settleRate = 1 - Math.exp(-dt * 1.7);
      this.compression += (targetCompression - this.compression) * settleRate;
    }

    if (
      !this.completed
      && this.pressureRead
      && this.ribsReleased
      && this.safeMatterAbsorbed
      && this.maxDepthProgress >= (completion.minimumDeepProgress ?? 0.82)
      && !this.compressionFailure
      && this.compression <= (completion.maximumSettledCompression ?? 0.34)
    ) {
      this.completed = true;
      this.returnFoldReady = true;
      this.pressureRelationshipHeld = false;
      this.pressureRelationshipReady = false;
      this.lastInteraction = "deep_pressure_relationship_released_silt_route_breathes_toward_hub";
      this.warning = "none";
    }

    this.compression = THREE.MathUtils.clamp(this.compression, 0, 1);
  }

  registerCompressionFailure() {
    if (this.compressionFailure) return;
    this.compressionFailure = true;
    this.failureCount += 1;
    this.failureRecovered = false;
    this.compression = 1;
    this.failureFlashAge = 0;
    this.greedyAbsorbSeconds = 0;
    this.lastInteraction = "packed_residue_triggered_recoverable_compression_failure";
    this.warning = "hold_stabilize_inside_passage_to_reopen_it";
  }

  applyDynamicPressure(frameState, sample) {
    const contractFeel = frameState.physicalFeel ?? {};
    const direction = this.completed ? -1 : 1;
    const tangent = sample.tangent ?? this.closestTangent;
    const progress = sample.progress ?? this.pathProgress;

    // HC-016Y: the expanded route now has enough distance for spatial pressure
    // to be gameplay. The appetite pocket around 60% is deliberately freer;
    // entry/deep sections remain resistant. Completion becomes a clear release.
    const pocketDistance = Math.abs(progress - 0.60);
    const openPocket = THREE.MathUtils.clamp(1 - pocketDistance / 0.16, 0, 1);
    const released = this.completed ? 1 : 0;
    const failureWeight = this.compressionFailure ? 1 : 0;
    const effectiveCompression = THREE.MathUtils.clamp(
      this.compression + failureWeight * 0.18 - openPocket * 0.18 - released * 0.28,
      0,
      1
    );
    const drift = this.completed
      ? 0.22
      : this.compressionFailure
        ? 0.025
        : this.ribsReleased
          ? 0.12 + openPocket * 0.055
          : 0.06 + openPocket * 0.035;
    frameState.physicalFeel = {
      ...contractFeel,
      viscosity: 0.54 + effectiveCompression * 0.34,
      pressure: 0.60 + effectiveCompression * 0.36,
      flowVector: {
        x: tangent.x * drift * direction,
        y: tangent.y * drift * direction - effectiveCompression * 0.035,
        z: tangent.z * drift * direction
      },
      routeFeelProfile: "silt_compression_release_gradient",
      accelerationScale: this.completed
        ? 1.08
        : 0.78 + openPocket * 0.18 + (this.ribsReleased ? 0.06 : 0) - failureWeight * 0.08,
      speedScale: this.completed
        ? 1.10
        : 0.76 + openPocket * 0.18 + (this.ribsReleased ? 0.06 : 0) - failureWeight * 0.07,
      boostScale: this.completed
        ? 1.0
        : 0.60 + openPocket * 0.24 + (this.ribsReleased ? 0.08 : 0) - failureWeight * 0.10,
      flowCouplingScale: this.completed ? 1.24 : 0.82 + openPocket * 0.18,
      withFlowSpeedBonus: this.completed ? 0.18 : 0.04,
      againstFlowSpeedPenalty: this.completed ? 0.08 : 0.10,
      spatialFeel: {
        progress,
        openPocket,
        effectiveCompression,
        condition: this.completed
          ? "released_silt_breath_accelerates_return"
          : this.compressionFailure
            ? "packed_residue_closes_motion"
            : openPocket > 0.55
              ? "porous_choice_pocket_releases_pressure"
              : this.ribsReleased
                ? "braced_passage_allows_controlled_motion"
                : "compressed_ribs_resist_motion"
      },
      boundaryBehavior: this.completed
        ? "silt_released_return_breath"
        : this.compressionFailure
          ? "silt_recoverable_compression_lock"
          : this.ribsReleased
            ? "silt_braced_selective_appetite_passage"
            : "silt_living_rib_pressure",
      movementBounds: contractFeel.movementBounds
    };
  }

  animate(frameState, sample) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const release = this.ribsReleased ? 1 : 0;
    const failure = this.compressionFailure ? 1 : 0;
    const pulseReadResponse = this.pulseFlashAge < 0.72
      ? 1 - this.pulseFlashAge / 0.72
      : 0;
    const materialState = this.completed
      ? "released"
      : this.safeMatterAbsorbed
        ? "porous_matter_received"
        : this.ribsReleased
          ? "braced_and_open"
          : this.pressureRead
            ? "density_revealed"
            : "compressed_unread";
    const close = THREE.MathUtils.clamp(this.compression * 0.74 + failure * 0.24 - release * 0.18, 0.08, 0.92);

    if (this.envelope?.material) {
      this.envelope.material.opacity = 0.12 + this.compression * 0.13;
      this.envelope.material.emissiveIntensity = 0.12 + this.compression * 0.2 + (this.stabilizing ? 0.12 : 0);
    }
    for (const [index, group] of this.ribGroups.entries()) {
      const pulse = (Math.sin(t * 2.2 + index * 1.1) + 1) * 0.5;
      for (const mesh of group.children) {
        const role = mesh.userData.role;
        mesh.position.copy(mesh.userData.basePosition);
        mesh.scale.copy(mesh.userData.baseScale);
        if (role === "left") mesh.position.x += close * 0.34;
        if (role === "right") mesh.position.x -= close * 0.34;
        if (role === "crown") mesh.position.y -= close * 0.3;
        if (this.compressionFailure) {
          mesh.position.x += Math.sin(t * 16 + index) * 0.025;
          mesh.scale.y *= 1 + pulse * 0.08;
        }
        mesh.material.emissiveIntensity = this.stabilizing
          ? 0.38 + pulse * 0.12
          : this.compressionFailure ? 0.42 + pulse * 0.22 : 0.16 + pulse * 0.08;
      }
    }

    const moteDirection = this.completed ? -1 : 1;
    for (const mote of this.siltMotes) {
      let progress = (mote.userData.baseProgress + moteDirection * t * (0.012 + (1 - this.compression) * 0.024)) % 1;
      if (progress < 0) progress += 1;
      mote.position.copy(this.pathCurve.getPointAt(progress));
      const phase = mote.userData.phase;
      const radius = mote.userData.radius;
      const pulseScatter = pulseReadResponse * (0.10 + (mote.userData.baseProgress % 0.18) * 0.42);
      mote.position.x += Math.sin(t * 0.8 + phase) * radius
        + Math.sin(phase * 1.7) * pulseScatter;
      mote.position.y += Math.cos(t * 0.65 + phase) * radius * 0.55
        + Math.cos(phase * 1.3) * pulseScatter * 0.55;
      mote.material.opacity = 0.2 + this.compression * 0.32
        + pulseReadResponse * 0.20
        + (this.failureFlashAge < 0.4 ? 0.18 : 0);
    }

    if (this.safePacket) {
      const absorbed = this.safeMatterAbsorbed ? 1 : THREE.MathUtils.clamp(
        this.safeAbsorbSeconds / Math.max(0.01, this.recipe.appetite?.requiredSafeAbsorbSeconds ?? 0.68),
        0,
        1
      );
      const revealed = this.pressureRead;
      const readable = revealed && this.ribsReleased;
      const revealScale = revealed ? 1 : 0.58;
      const pulse = 1 + Math.sin(t * 4.1) * 0.08 + (readable ? 0.12 : 0);
      this.safePacket.scale.setScalar(
        Math.max(0.08, revealScale * pulse * (1 - absorbed * 0.86))
      );
      this.safePacket.visible = !this.safeMatterAbsorbed || absorbed < 0.98;
      if (this.safePacketCore?.material) {
        this.safePacketCore.material.emissiveIntensity = readable
          ? 0.85 + Math.sin(t * 5.2) * 0.10
          : revealed ? 0.48 : 0.16;
        this.safePacketCore.material.opacity = revealed ? 0.96 : 0.48;
      }

      const safeRange = this.recipe.appetite?.safeAbsorbRange ?? 0.92;
      const safeAbsorbActive = Boolean(
        this.absorbHeld
        && readable
        && !this.safeMatterAbsorbed
        && this.safePacketDistance <= safeRange
      );
      if (this.safeAbsorbStream) {
        this.safeAbsorbStream.visible = safeAbsorbActive;
        this.safeAbsorbStream.material.opacity = safeAbsorbActive
          ? 0.24 + absorbed * 0.48
          : 0;
        if (safeAbsorbActive) {
          this.safePacket.getWorldPosition(this.safePacketWorld);
          this.safeAbsorbStreamPositions[0] = this.safePacketWorld.x;
          this.safeAbsorbStreamPositions[1] = this.safePacketWorld.y;
          this.safeAbsorbStreamPositions[2] = this.safePacketWorld.z;
          this.safeAbsorbStreamPositions[3] = this.playerRoot.position.x;
          this.safeAbsorbStreamPositions[4] = this.playerRoot.position.y;
          this.safeAbsorbStreamPositions[5] = this.playerRoot.position.z;
          this.safeAbsorbStream.geometry.attributes.position.needsUpdate = true;
        }
      }
    }
    for (const packet of this.densePackets) {
      const pulse = 1 + Math.sin(t * 2.7 + packet.userData.phase) * 0.045;
      const denseRiskActive = this.absorbHeld
        && this.nearestDenseDistance <= (this.recipe.appetite?.denseRiskRange ?? 0.9);
      const harden = denseRiskActive ? 1 : 0;
      packet.scale.set(
        1.2 * pulse * (1 + harden * 0.10),
        (0.8 / pulse) * (1 - harden * 0.12),
        0.92 * pulse * (1 + harden * 0.08)
      );
      packet.material.emissiveIntensity = denseRiskActive
        ? 0.58
        : this.pressureRead ? 0.12 + this.compression * 0.08 : 0.18 + this.compression * 0.12;
      packet.material.opacity = this.pressureRead ? 0.78 : 0.96;
    }

    const depletionTarget = this.safeMatterAbsorbed ? 1 : 0;
    this.retainedDepletionStrength += (depletionTarget - this.retainedDepletionStrength)
      * (1 - Math.exp(-0.08 * 5.5));

    if (this.safeMatterAbsorbed) {
      for (const [index, bank] of this.passageBanks.entries()) {
        const nearAppetitePocket = index >= 5 && index <= 7;
        if (!nearAppetitePocket) continue;
        const retained = this.retainedDepletionStrength;
        bank.scale.x *= 1 - retained * 0.12;
        bank.scale.y *= 1 - retained * 0.08;
        bank.position.y -= retained * 0.08;
        if (bank.material) {
          bank.material.opacity = Math.max(0.18, bank.material.opacity - retained * 0.06);
          bank.material.emissiveIntensity = 0.10 + retained * 0.08;
        }
        bank.userData.retainedConsequence = "porous_matter_removed_here";
      }
      this.root.userData.retainedConsequence = "appetite_pocket_remains_depleted";
    }

    if (this.deepOrgan) {
      const ready = this.pressureRead && this.ribsReleased && this.safeMatterAbsorbed;
      const pulse = 1 + Math.sin(t * (ready ? 3.4 : 1.7)) * (ready ? 0.12 : 0.05);
      this.deepOrgan.scale.set(1.35 * pulse, 0.78 / pulse, 1.02 * pulse);
      this.deepOrgan.material.emissiveIntensity = this.completed ? 0.84 : ready ? 0.52 : 0.22;
    }

    if (this.returnFold) {
      this.returnFold.visible = this.returnFoldReady;
      if (this.returnFoldReady) {
        const foldPulse = (Math.sin(t * 2.5) + 1) * 0.5;
        for (const lobe of this.returnFoldLobes) {
          lobe.position.copy(lobe.userData.basePosition);
          lobe.position.x += (lobe.userData.side ?? 0) * foldPulse * 0.07;
          lobe.material.emissiveIntensity = 0.34 + foldPulse * 0.38;
        }
      }
    }

    this.root.userData.activePathProgress = sample.progress;
    this.root.userData.compression = this.compression;
    this.root.userData.compressionFailure = this.compressionFailure;
  }

  completionProgress() {
    const readPart = Number(this.pressureRead) * 0.18;
    const bracePart = Number(this.ribsReleased) * 0.22;
    const appetitePart = Number(this.safeMatterAbsorbed) * 0.3;
    const depthPart = Math.min(1, this.maxDepthProgress / Math.max(0.01, this.recipe.completion?.minimumDeepProgress ?? 0.82)) * 0.22;
    const settlePart = this.compressionFailure ? 0 : Math.max(0, 0.08 - this.compression * 0.04);
    return this.completed ? 1 : THREE.MathUtils.clamp(readPart + bracePart + appetitePart + depthPart + settlePart, 0, 0.99);
  }

  stage() {
    if (this.completed) return "return_breath";
    if (this.compressionFailure) return "recover_compression_failure";
    if (!this.pressureRead) return "read_compression";
    if (!this.ribsReleased) return "brace_living_ribs";
    if (!this.safeMatterAbsorbed) return "select_porous_nutrient";
    if (this.maxDepthProgress < (this.recipe.completion?.minimumDeepProgress ?? 0.82)) return "follow_released_passage_deeper";
    return "settle_deep_pressure";
  }

  guideLine() {
    if (this.completed) return "The silt has stopped closing around appetite. Its released breath now returns to the Hub.";
    if (this.compressionFailure) return "Packed residue compressed the route. Nothing is lost—hold Stabilize until the ribs reopen.";
    if (!this.pressureRead) return "The low ribs close in sequence. Move inside them, hold Stabilize to catch the pressure, then Pulse through that relationship.";
    if (!this.ribsReleased) return "The pressure relationship is retained. Keep Stabilize held and let the ribs move around your brace.";
    if (!this.safeMatterAbsorbed) return "Only the warm porous packet yields. The dark packed clumps will close the passage if you pull them.";
    return "The route has accepted enough. Move through the opened ribs toward the deep pressure organ.";
  }

  nextAction() {
    if (this.completed) return "Follow the amber silt breath into the open entry fold.";
    if (this.compressionFailure) return this.stabilizationInRange
      ? "Hold LT until the compressed ribs reopen. Your earlier progress is safe."
      : "Move back inside the silt passage, then hold LT to reopen it.";
    if (!this.pressureRead) {
      if (this.pressureRelationshipReady) return "Pulse while Stabilize is held to read the compression direction.";
      if (this.pressureRelationshipHeld) return "Keep Stabilize held briefly, then Pulse through the compressed passage.";
      return "Move between the first low ribs and hold Stabilize to establish the pressure relationship.";
    }
    if (!this.ribsReleased) return "Keep LT held inside the passage until the living ribs open and stay open.";
    if (!this.safeMatterAbsorbed) {
      if (this.safePacketDistance <= (this.recipe.appetite?.safeAbsorbRange ?? 0.92)) {
        return "Hold RT on the warm porous packet; leave the dark packed clumps intact.";
      }
      return "Approach the warm porous packet in the appetite pocket, then hold RT.";
    }
    return "Move deeper through the released ribs until the deep organ exhales.";
  }

  publish(frameState, active) {
    const returnDistance = this.playerRoot.position.distanceTo(this.returnPosition);
    frameState.siltPressureRoute = {
      pass: "HC-031S",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      regionId: "silt_burrow_route",
      runtimeCellId: ROUTE_CELL_ID,
      status: this.completed
        ? active ? "silt_pressure_released_return_ready" : "silt_pressure_completion_retained"
        : active
          ? this.compressionFailure ? "recoverable_compression_failure_active" : "silt_pressure_playable"
          : "prepared_inactive",
      stage: this.stage(),
      materialState: this.completed
        ? "released"
        : this.safeMatterAbsorbed
          ? "porous_matter_received"
          : this.ribsReleased
            ? "braced_and_open"
            : this.pressureRead
              ? "density_revealed"
              : "compressed_unread",
      materialStateSequence: [
        "compressed_unread",
        "density_revealed",
        "braced_and_open",
        "porous_matter_received",
        "released"
      ],
      materialStateAuthority: "existing_silt_route_truth",
      retainedConsequence: {
        pass: "HC-018D",
        active: this.safeMatterAbsorbed,
        kind: this.safeMatterAbsorbed ? "appetite_pocket_depleted" : "none",
        survivesUnmountRemount: true,
        progressionAuthority: false
      },
      progress: this.completionProgress(),
      completed: this.completed,
      pressureRead: this.pressureRead,
      pressureReadCount: this.pressureReadCount,
      pressureReadSequence: this.pressureReadSequence,
      pressureRelationshipHeld: Boolean(active && this.pressureRelationshipHeld),
      pressureRelationshipReady: Boolean(active && this.pressureRelationshipReady),
      pressureRelationshipSeconds: active ? this.pressureRelationshipSeconds : 0,
      minimumPressureRelationshipHoldSeconds: this.recipe?.currentization?.minimumRelationshipHoldSeconds ?? 0.18,
      lastPressureReadChord: this.lastPressureReadChord,
      unboundPulseCount: this.unboundPulseCount,
      braceSeconds: this.braceSeconds,
      ribsReleased: this.ribsReleased,
      safeMatterAbsorbed: this.safeMatterAbsorbed,
      appetiteDrawSequence: this.appetiteDrawSequence,
      lastAppetiteDrawKind: this.lastAppetiteDrawKind,
      appetiteSelectionMode: "spatial_body_choice",
      safeAbsorbSeconds: this.safeAbsorbSeconds,
      safeAbsorbRequiredSeconds: this.recipe?.appetite?.requiredSafeAbsorbSeconds ?? 0.68,
      safePacketDistance: active && Number.isFinite(this.safePacketDistance) ? this.safePacketDistance : 0,
      nearestDenseDistance: active && Number.isFinite(this.nearestDenseDistance) ? this.nearestDenseDistance : 0,
      denseMatterLeftIntact: true,
      pathProgress: active ? this.pathProgress : 0,
      maxDepthProgress: this.maxDepthProgress,
      pathDistance: active ? this.pathDistance : 0,
      compression: this.compression,
      compressionFailure: this.compressionFailure,
      failureCount: this.failureCount,
      failureRecovered: this.failureRecovered,
      recoverySeconds: this.recoverySeconds,
      failureRecoverable: true,
      stabilizing: this.stabilizing,
      stabilizationInRange: this.stabilizationInRange,
      stabilizationRange: this.recipe?.recovery?.stabilizeRangeFromPassage ?? 1.9,
      absorbHeld: this.absorbHeld,
      returnFoldReady: this.returnFoldReady,
      returnFoldDistance: active ? returnDistance : 0,
      returnFoldInteractionRange: this.recipe?.returnFold?.interactionRange ?? 1.35,
      returnFoldPosition: active ? {
        x: this.returnPosition.x,
        y: this.returnPosition.y,
        z: this.returnPosition.z
      } : null,
      ribSilhouetteCount: this.ribGroups.length,
      porousNutrientCount: Number(!this.safeMatterAbsorbed),
      packedResidueCount: this.densePackets.length,
      visualMotionLanguages: [...(this.recipe?.visual?.motionLanguages ?? [])],
      genericRingCount: 0,
      triggerMarkerCount: 0,
      lastInteraction: this.lastInteraction,
      warning: this.warning,
      currentization: {
        pass: "HC-031S",
        canonicalPressureRead: "stabilize_establishes_environmental_pressure_relationship_then_pulse_projects_through_it",
        relationshipSource: "environmental_pressure",
        stabilizeEstablishesRelationship: true,
        pulseProjectsThroughRelationship: true,
        pulseAloneCanReadPressure: false,
        appetiteSelectionMode: "spatial_body_choice",
        appetiteSelectionAuthority: "player_spatial_approach",
        absorbDrawsMatterFromChosenSpatialBody: true,
        nounTargetingAuthorityChanged: false,
        aimChoosesTargetForTargetableNouns: true,
        environmentalPressureMayBeRelatedWithoutNounTarget: true,
        packedResidueFailureRecoverable: true,
        progressionAuthority: true,
        crossingAuthority: false
      },
      guideLine: this.guideLine(),
      objectiveLine: this.nextAction(),
      nextAction: this.nextAction(),
      gameplayOwner: "SiltPressureRouteSystem",
      presentationOwner: "SiltPressureRouteSystem",
      movementOwner: "PlayerMovementController",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      playerPositionPreserved: true,
      forcedRelocation: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      directRouteHistoryMutation: false,
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      death: false,
      forcedRestart: false,
      permanentClass: false,
      archivedCompatibilitySystemsActivated: 0,
      mountCount: this.mountCount
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = visible;
    if (this.returnFold) this.returnFold.visible = Boolean(visible && this.returnFoldReady);
    if (this.safeAbsorbStream && !visible) this.safeAbsorbStream.visible = false;
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }
}
