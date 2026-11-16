import * as THREE from "three";

/**
 * HC-017B
 * Physical language for the three existing Core verbs plus bounded material response.
 * Gameplay truth remains in ChemObjectSystem, BondSystem and authored route systems.
 */
export class CoreVerbPhysicalizationSystem {
  constructor({ scene, playerRoot, chemObjectSystem, frameState }) {
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.chemObjectSystem = chemObjectSystem;
    this.frameState = frameState;

    this.group = new THREE.Group();
    this.group.name = "core_verb_physicalization_hc017a";
    this.group.userData.targetingSuppressed = true;
    this.scene.add(this.group);

    this.lastPulseEventId = 0;
    this.pulseFronts = [];
    this.pulseContours = [];
    // HC-031W2A1: keep pulse contour language, but cap transient line cost.
    // Reduced contour geometry is cached by source geometry and reused between pulses.
    this.pulseContourGeometryCache = new WeakMap();
    this.maxPulseContours = 3;
    this.maxPulseContourMeshes = 4;
    this.maxPulseContourSegmentsPerMesh = 180;
    // HC-031W2A2: bound repeated transient renderables and share their geometry so
    // rapid Pulse input cannot continuously allocate/upload new wireframe buffers.
    this.maxPulseFronts = 3;
    this.maxContactFlashes = 12;
    this.maxPulseReturnMotes = 10;
    this.sharedPulseFrontQuickGeometry = this.makeSharedTransientGeometry(
      new THREE.SphereGeometry(0.30, 10, 6), "pulse_front_quick"
    );
    this.sharedPulseFrontFocusedGeometry = this.makeSharedTransientGeometry(
      new THREE.SphereGeometry(0.30, 14, 8), "pulse_front_focused"
    );
    this.sharedPulseFrontChargedGeometry = this.makeSharedTransientGeometry(
      new THREE.SphereGeometry(0.38, 14, 8), "pulse_front_charged"
    );
    this.sharedPulseReturnLocalGeometry = this.makeSharedTransientGeometry(
      new THREE.IcosahedronGeometry(0.045, 1), "pulse_return_local"
    );
    this.sharedPulseReturnDeepGeometry = this.makeSharedTransientGeometry(
      new THREE.IcosahedronGeometry(0.075, 1), "pulse_return_deep"
    );
    this.sharedContactFlashGeometry = this.makeSharedTransientGeometry(
      new THREE.TorusGeometry(0.11, 0.012, 6, 20), "pulse_contact_flash"
    );
    this.contactFlashes = [];
    this.pulseReturnMotes = [];
    this.absorbMotes = [];
    this.absorbCommitment = 0;
    this.absorbVisualTargetId = "none";
    this.absorbVisualState = "inactive";
    this.previousAbsorbVisualProgress = 0;
    this.absorbWasPreview = false;
    this.absorbFlowSeconds = 0;
    this.absorbCoreWorldPosition = new THREE.Vector3();
    this.stabilizeProgress = 0;
    this.stabilizeAlignment01 = 0;
    this.stabilizeCondition01 = null;
    this.stabilizeTargetId = "none";
    this.temp = new THREE.Vector3();
    this.tempB = new THREE.Vector3();
    this.tempC = new THREE.Vector3();
    this.tempD = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);
    this.worldRight = new THREE.Vector3(1, 0, 0);
    this.worldForward = new THREE.Vector3(0, 0, 1);

    this.stabilizeField = this.makeStabilizeField();
    this.stabilizeLine = this.makeStabilizeLine();
    this.absorbLine = this.makeAbsorbLine();
    this.absorbFunnel = this.makeAbsorbFunnel();
    this.absorbFilaments = this.makeAbsorbFilaments();
    this.pulseChargeShell = this.makePulseChargeShell();
  }


  makeSharedTransientGeometry(geometry, owner) {
    geometry.userData.hc031w2a2SharedTransientGeometry = true;
    geometry.userData.hc031w2a2RenderOwner = owner;
    return geometry;
  }

  makePulseChargeShell() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xa9f2ff, transparent: true, opacity: 0, wireframe: true, depthWrite: false
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 8), material);
    shell.name = "pulse_commitment_charge_shell";
    shell.visible = false;
    shell.userData.targetingSuppressed = true;
    this.group.add(shell);
    return shell;
  }

  makeAbsorbFunnel() {
    const group = new THREE.Group();
    group.name = "absorb_commitment_funnel";
    group.visible = false;
    group.userData.targetingSuppressed = true;
    for (let i = 0; i < 3; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffc98e, transparent: true, opacity: 0, depthWrite: false
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16 + i * 0.035, 0.008, 5, 28), material);
      ring.userData.funnelIndex = i;
      group.add(ring);
    }
    this.group.add(group);
    return group;
  }
  makeStabilizeField() {
    const group = new THREE.Group();
    group.name = "stabilize_gyroscopic_coherence_field";
    group.visible = false;
    group.userData.targetingSuppressed = true;

    const ringSpecs = [
      { radius: 0.205, tube: 0.009, baseRotation: { x: Math.PI / 2, y: 0, z: 0 }, phase: 0.0 },
      { radius: 0.252, tube: 0.007, baseRotation: { x: 0, y: Math.PI / 2, z: 0 }, phase: 2.15 },
      { radius: 0.298, tube: 0.0055, baseRotation: { x: 0, y: 0, z: Math.PI / 2 }, phase: 4.30 }
    ];

    for (let index = 0; index < ringSpecs.length; index += 1) {
      const spec = ringSpecs[index];
      const material = new THREE.MeshBasicMaterial({
        color: 0x9fffd8,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, spec.tube, 6, 36), material);
      ring.name = `stabilize_gyro_band_${index + 1}`;
      ring.userData.gyroBandIndex = index;
      ring.userData.baseRotation = spec.baseRotation;
      ring.userData.phase = spec.phase;
      ring.rotation.set(spec.baseRotation.x, spec.baseRotation.y, spec.baseRotation.z);
      group.add(ring);
    }

    this.group.add(group);
    return group;
  }

  makeStabilizeLine() {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0x9fffd8,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const line = new THREE.Line(geometry, material);
    line.name = "stabilize_regulation_tether";
    line.visible = false;
    line.userData.targetingSuppressed = true;
    this.group.add(line);
    return line;
  }

  makeAbsorbLine() {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xffd0a2, transparent: true, opacity: 0, depthWrite: false
    });
    const line = new THREE.Line(geometry, material);
    line.name = "absorb_metabolic_stream_axis";
    line.visible = false;
    line.userData.targetingSuppressed = true;
    this.group.add(line);
    return line;
  }


  makeAbsorbFilaments() {
    const group = new THREE.Group();
    group.name = "absorb_helical_transfer_filaments";
    group.visible = false;
    group.userData.targetingSuppressed = true;
    const sampleCount = 18;
    for (let index = 0; index < 3; index += 1) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sampleCount * 3), 3));
      const material = new THREE.LineBasicMaterial({
        color: 0xffc98e,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const line = new THREE.Line(geometry, material);
      line.name = `absorb_transfer_filament_${index + 1}`;
      line.userData.filamentIndex = index;
      line.userData.sampleCount = sampleCount;
      line.userData.targetingSuppressed = true;
      group.add(line);
    }
    this.group.add(group);
    return group;
  }

  setStabilizeFieldOpacity(opacity) {
    for (const child of this.stabilizeField.children) {
      if (child.material) child.material.opacity = opacity;
    }
  }

  getTargetVisualRadius(target) {
    const item = target?.object ?? this.findObject(target?.id);
    if (!item?.root) return 0.32;

    const box = new THREE.Box3().setFromObject(item.root);
    if (box.isEmpty()) return 0.32;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    return Math.max(0.18, Math.min(0.62, sphere.radius * 1.08));
  }

  update(dt, frameState) {
    this.frameState = frameState;
    this.updatePulse(dt, frameState);
    this.updateAbsorb(dt, frameState);
    this.updateStabilize(dt, frameState);

    const composition = frameState.interactionComposition ?? {};
    const effectSuppression = Math.min(0.42, Math.max(0, composition.effectSuppression ?? 0));
    if (effectSuppression > 0) {
      for (const front of this.pulseFronts) front.root.material.opacity *= (1 - effectSuppression);
      for (const contour of this.pulseContours) {
        for (const material of contour.materials ?? []) material.opacity *= (1 - effectSuppression);
      }
      for (const flash of this.contactFlashes) flash.root.material.opacity *= (1 - effectSuppression);
    }

    const visualGrip = this.getCommittedSiltVisualTarget(frameState);
    frameState.verbVisualTargetAuthority = {
      targetId: visualGrip?.id ?? "none",
      pulse: visualGrip ? "silt-committed-direction-and-contact-preview" : "legacy",
      absorb: visualGrip && frameState.input?.absorbHeld ? "silt-committed-priority-preview-no-transfer" : "legacy",
      stabilize: visualGrip ? "silt-committed" : "legacy",
      gameplayAuthorityChanged: false
    };
    frameState.verbPhysicalization = {
      pass: "HC-028G",
      pulseFronts: this.pulseFronts.length,
      pulseFrontBudget: this.maxPulseFronts,
      pulseContours: this.pulseContours.length,
      pulseContourSegments: this.pulseContours.reduce((sum, contour) => sum + (contour.segmentCount ?? 0), 0),
      pulseContourBudget: {
        maxConcurrent: this.maxPulseContours,
        maxMeshesPerContour: this.maxPulseContourMeshes,
        maxSegmentsPerMesh: this.maxPulseContourSegmentsPerMesh
      },
      pulseReturnMotes: this.pulseReturnMotes.length,
      pulseReturnMoteBudget: this.maxPulseReturnMotes,
      pulseSpatialRevealPass: "HC-031W2B2",
      pulseSpatialRevealLaw: "outgoing_wave_yields_to_distance_tiered_contact_contour_then_directional_return",
      pulseContourTiers: this.pulseContours.reduce((counts, contour) => {
        const tier = contour.spatialTier ?? "legacy";
        counts[tier] = (counts[tier] ?? 0) + 1;
        return counts;
      }, {}),
      repeatedPulseRevealLaw: "first_presence_fragment_second_layering_third_structural_relationship_more_structure_not_more_brightness",
      contactFlashes: this.contactFlashes.length,
      contactFlashBudget: this.maxContactFlashes,
      sharedTransientGeometryPolicy: "shared_geometry_bounded_instances_hc031w2a2",
      absorbMotes: this.absorbMotes.length,
      absorbFilaments: this.absorbFilaments?.children?.length ?? 0,
      stabilizeProgress: this.stabilizeProgress,
      stabilizeTargetId: this.stabilizeTargetId,
      stabilizeGyroLock01: this.stabilizeAlignment01,
      stabilizeCondition01: this.stabilizeCondition01,
      stabilizeConditionSource: this.stabilizeCondition01 === null ? "visual_alignment_only" : "ReactiveStateGrammarSystem_current_target",
      stabilizeProgressMeaning: "current_target_visual_alignment_not_gameplay_completion",
      relationshipTargetId: frameState.targeting?.relationshipTargetId ?? "none",
      pulseFocusedObject: frameState.pulse?.focusedObject ?? "none",
      pulseAmbientObjects: frameState.pulse?.ambientObjects?.length ?? 0,
      pulseEffectOwnership: frameState.pulse?.effectOwnership ?? "none",
      stabilizedProjectionMode: frameState.stabilizedProjection?.mode ?? "inactive",
      stabilizedProjectionFocus01: frameState.stabilizedProjection?.focus01 ?? 0,
      stabilizedProjectionRequiresAnchor: false,
      absorbEffectOwnership: this.absorbVisualState === "silt_grip_preview"
        ? "silt_committed_visual_only" : this.absorbVisualState !== "inactive" ? "focused_relationship" : "none",
      absorbVisualTargetId: this.absorbVisualTargetId,
      absorbVisualState: this.absorbVisualState,
      absorbFlowMeaning: "published_bond_progress_advanced_not_completion_or_material_receipt",
      stabilizeEffectOwnership: this.stabilizeTargetId !== "none"
        && this.stabilizeTargetId === (frameState.targeting?.relationshipTargetId ?? "none")
          ? "focused_relationship"
          : this.stabilizeTargetId !== "none" ? "ambient_host_or_route" : "none",
      compositionChord: frameState.verbComposition?.chord ?? "idle",
      compositionMode: frameState.verbComposition?.mode ?? "idle",
      compositionTension01: frameState.verbComposition?.effects?.tension01 ?? 0,
      compositionEquilibrium01: frameState.verbComposition?.effects?.equilibrium01 ?? 0,
      pulseResponseObjects: frameState.pulse?.affectedObjects?.length ?? 0,
      pulseCommitment: frameState.input?.pulseCommitment ?? "idle",
      pulseCharge01: frameState.input?.pulseCharge01 ?? 0,
      pulseReleaseKind: frameState.input?.pulseReleaseKind ?? "none",
      pulseReachClass: frameState.coreSensoryResponse?.pulseMode === "charged" ? "deep_structural_capable" : "local_actionable",
      absorbCommitment: this.absorbCommitment,
      absorbResponseObject: frameState.bondState?.objectId ?? "none",
      sensoryExpressionPass: "HC-027D",
      sonarEmitContactReturn: true,
      sonarPendingEchoes: frameState.coreSensoryResponse?.pendingEchoCount ?? 0,
      sonarReturnCount: frameState.coreSensoryResponse?.returnCount ?? 0,
      sonarResolutionStage: frameState.coreSensoryResponse?.nearestAnswerMemory?.resolutionStage ?? 0,
      repeatedSonarVisualLaw: "repeat_reads_expand_structural_volume_not_target_brightness",
      verbVisualGrammar: "pulse_contour_propagation_absorb_helical_transfer_stabilize_gyroscopic_lock",
      topologyVerbCharacterMode: frameState.coreTopologyVerbCharacter?.mode ?? "forming",
      topologyVerbCharacterPass: frameState.coreTopologyVerbCharacter?.pass ?? "none",
      rule: "presentation pivots may react; sonar timing may answer; gameplay roots, ranges and progression remain authoritative"
    };
  }

  updatePulse(dt, frameState) {
    const eventId = frameState.input?.pulseEventId ?? 0;
    const sensory = frameState.coreSensoryResponse ?? {};
    const input = frameState.input ?? {};
    const charge01 = THREE.MathUtils.clamp(input.pulseCharge01 ?? 0, 0, 1);
    const pulseResponseStrength = THREE.MathUtils.clamp(frameState.corePerformance?.verbModifiers?.pulse?.responseStrengthMultiplier ?? 1, 0.76, 1.30);
    const pulseHeld = Boolean(input.pulseHeld);
    const pulseCharacter = frameState.coreTopologyVerbCharacter?.pulse ?? {};
    const stabilizedProjection = frameState.stabilizedProjection ?? {};
    const committedSiltPulse = this.getCommittedSiltVisualTarget(frameState);
    const focusedProjection = Boolean(stabilizedProjection.active && stabilizedProjection.chord === "cohere_project");
    const focus01 = THREE.MathUtils.clamp(stabilizedProjection.focus01 ?? 0, 0, 1);
    if (this.pulseChargeShell) {
      this.pulseChargeShell.visible = pulseHeld;
      this.pulseChargeShell.position.copy(this.playerRoot.position);
      if (focusedProjection || committedSiltPulse) {
        const dir = stabilizedProjection.direction ?? { x: 0, y: 0, z: -1 };
        this.temp.set(dir.x ?? 0, dir.y ?? 0, dir.z ?? -1);
        if (committedSiltPulse) this.temp.copy(committedSiltPulse.position).sub(this.playerRoot.position);
        if (this.temp.lengthSq() < 0.0001) this.temp.set(0, 0, -1);
        this.temp.normalize();
        this.pulseChargeShell.quaternion.setFromUnitVectors(this.worldForward, this.temp);
        const base = (1.02 - charge01 * 0.22) * (pulseCharacter.chargeCompressionScale ?? 1);
        this.pulseChargeShell.scale.set(base * (0.72 - focus01 * 0.16), base * (0.72 - focus01 * 0.16), base * (1.18 + focus01 * 0.42));
        this.pulseChargeShell.material.opacity = pulseHeld ? (0.08 + charge01 * 0.37 + focus01 * 0.05) * (0.88 + pulseResponseStrength * 0.12) : 0;
      } else {
        this.pulseChargeShell.rotation.y += dt * (0.7 + charge01 * 2.4);
        this.pulseChargeShell.rotation.z -= dt * (0.4 + charge01 * 1.6);
        this.pulseChargeShell.scale.setScalar((1.08 - charge01 * 0.28) * (pulseCharacter.chargeCompressionScale ?? 1));
        this.pulseChargeShell.material.opacity = pulseHeld ? (0.055 + charge01 * 0.34) * (0.88 + pulseResponseStrength * 0.12) : 0;
      }
    }
    if (frameState.input?.pulsePressed && eventId !== this.lastPulseEventId) {
      this.lastPulseEventId = eventId;
      this.spawnPulseFront(sensory, frameState);
      // Focused feedback belongs at the committed material, not the Guide-era fallback.
      if (committedSiltPulse) this.spawnContactFlash(committedSiltPulse.position, 0xb8ffe8, 0.30, 0.38, 0.20, 0.28);
    }

    // HC027D: the wave no longer makes targets flash immediately. Contact occurs
    // when the outgoing front reaches material; a visible answer then travels back.
    for (const contact of sensory.newContacts ?? []) {
      const position = new THREE.Vector3(contact.position?.x ?? 0, contact.position?.y ?? 0, contact.position?.z ?? 0);
      const color = this.colorForPulseResponse(contact.responseClass);
      const deep = contact.reachClass === "deep_structural";
      const resolutionStage = Math.max(1, Math.min(3, contact.resolutionStage ?? 1));
      if (deep) {
        // HC027L1 — repeated deep reads resolve a larger structural volume instead of
        // making the same target-like ping brighter. Stage 2 exposes layering; stage 3
        // reads as a broad relationship through intervening Host material.
        const stageLift = resolutionStage - 1;
        this.spawnContactFlash(
          position,
          color,
          0.62 + stageLift * 0.18,
          1.65 + stageLift * 0.42,
          1.05 + stageLift * 0.22,
          0.22 + stageLift * 0.025
        );
        if (resolutionStage >= 2) {
          this.spawnContactFlash(
            position,
            color,
            0.94 + stageLift * 0.20,
            2.05 + stageLift * 0.46,
            1.38 + stageLift * 0.22,
            0.11 + stageLift * 0.015
          );
        }
      } else {
        this.spawnContactFlash(position, color, 0.30, 0.86, 0.48, 0.46);
      }
      this.spawnPulseContour(contact, color, frameState);
      this.spawnPulseReturnMote(contact, color, frameState);
    }
    for (const returned of sensory.newReturns ?? []) {
      this.spawnContactFlash(this.playerRoot.position, this.colorForPulseResponse(returned.responseClass), returned.reachClass === "deep_structural" ? 0.36 : 0.20, returned.reachClass === "deep_structural" ? 0.72 : 0.28, 0.34, returned.reachClass === "deep_structural" ? 0.24 : 0.42);
    }

    for (const front of this.pulseFronts) {
      front.age += dt;
      const radius = Math.min(front.maxRange, front.age * front.waveSpeed);
      const t = Math.min(radius / front.maxRange, 1);
      const radialScale = Math.max(0.5, radius / (front.baseRadius ?? 0.30));
      if (front.focused) {
        front.root.position.copy(front.origin).addScaledVector(front.direction, radius * 0.42);
        front.root.scale.set(
          radialScale * front.radialScale,
          radialScale * front.radialScale,
          radialScale * front.axialScale
        );
      } else {
        front.root.position.copy(front.origin);
        front.root.scale.setScalar(radialScale);
      }
      front.root.material.opacity = (1 - t * (front.charged ? 0.58 : 0.72)) * front.baseOpacity;
      if (front.charged) front.root.rotation.y += dt * (0.35 + front.charge01 * 0.55);
    }
    this.pulseFronts = this.pulseFronts.filter((front) => {
      if (front.age < front.life) return true;
      this.disposeMesh(front.root);
      return false;
    });

    this.updatePulseContours(dt);

    for (const mote of this.pulseReturnMotes) {
      mote.age += dt;
      const t = Math.min(mote.age / mote.life, 1);
      mote.root.position.lerpVectors(mote.start, this.playerRoot.position, t);
      const resolutionLift = mote.deep ? Math.max(0, (mote.resolutionStage ?? 1) - 1) : 0;
      mote.root.scale.setScalar((mote.deep ? 1.05 + resolutionLift * 0.16 : 0.75) + (1 - t) * (mote.deep ? 0.85 + resolutionLift * 0.12 : 0.55));
      const arrivalLift = THREE.MathUtils.smoothstep(t, 0.04, 0.76);
      const arrivalFade = 1 - THREE.MathUtils.smoothstep(t, 0.84, 1.0);
      mote.root.material.opacity = THREE.MathUtils.lerp(mote.startOpacity ?? 0.34, mote.peakOpacity ?? 0.72, arrivalLift) * arrivalFade;
    }
    this.pulseReturnMotes = this.pulseReturnMotes.filter((mote) => {
      if (mote.age < mote.life) return true;
      this.disposeMesh(mote.root);
      return false;
    });

    for (const flash of this.contactFlashes) {
      flash.age += dt;
      const t = Math.min(flash.age / flash.life, 1);
      flash.root.scale.setScalar((flash.baseScale ?? 0.34) + t * (flash.growth ?? 1.0));
      flash.root.material.opacity = (1 - t) * (flash.baseOpacity ?? 0.34);
    }
    this.contactFlashes = this.contactFlashes.filter((flash) => {
      if (flash.age < flash.life) return true;
      this.disposeMesh(flash.root);
      return false;
    });
  }

  spawnPulseFront(sensory = {}, frameState = this.frameState) {
    const charged = sensory.pulseMode === "charged";
    const charge01 = THREE.MathUtils.clamp(sensory.charge01 ?? 0, 0, 1);
    const projection = frameState.stabilizedProjection ?? {};
    const committedSilt = this.getCommittedSiltVisualTarget(frameState);
    const focused = Boolean(committedSilt || (projection.active && projection.chord === "cohere_project"));
    const focus01 = focused ? THREE.MathUtils.clamp(projection.focus01 ?? 0.7, 0, 1) : 0;
    const material = new THREE.MeshBasicMaterial({
      color: focused ? 0xb8ffe8 : charged ? 0xb8f5ff : 0x9fe8ff,
      transparent: true,
      opacity: committedSilt ? 0.045 : focused ? 0.18 : charged ? 0.18 : 0.10,
      wireframe: true,
      depthWrite: false
    });
    const baseRadius = charged ? 0.38 : 0.30;
    const frontGeometry = charged
      ? this.sharedPulseFrontChargedGeometry
      : focused
        ? this.sharedPulseFrontFocusedGeometry
        : this.sharedPulseFrontQuickGeometry;
    while (this.pulseFronts.length >= this.maxPulseFronts) {
      const oldest = this.pulseFronts.shift();
      this.disposeMesh(oldest?.root);
    }
    const root = new THREE.Mesh(frontGeometry, material);
    root.name = focused
      ? "pulse_stabilized_projection_front"
      : charged ? "pulse_sonar_committed_front" : "pulse_sonar_outgoing_front";
    root.position.copy(this.playerRoot.position);
    root.userData.targetingSuppressed = true;
    this.group.add(root);
    const waveSpeed = Math.max(4.5, sensory.waveSpeed ?? 6.6);
    const maxRange = Math.max(1, sensory.maxRange ?? 4.25);
    const directionData = projection.direction ?? frameState.playerKinematics?.cameraRelativeForward ?? { x: 0, y: 0, z: -1 };
    const direction = committedSilt
      ? committedSilt.position.clone().sub(this.playerRoot.position)
      : new THREE.Vector3(directionData.x ?? 0, directionData.y ?? 0, directionData.z ?? -1);
    if (direction.lengthSq() < 0.0001) direction.set(0, 0, -1);
    direction.normalize();
    if (focused) root.quaternion.setFromUnitVectors(this.worldForward, direction);
    this.pulseFronts.push({
      root,
      origin: this.playerRoot.position.clone(),
      direction,
      focused,
      focus01,
      age: 0,
      waveSpeed,
      maxRange,
      life: maxRange / waveSpeed + 0.08,
      baseRadius,
      baseOpacity: committedSilt ? 0.035 : focused ? 0.13 + focus01 * 0.06 : charged ? 0.14 + charge01 * 0.045 : 0.075,
      radialScale: focused ? THREE.MathUtils.lerp(0.62, 0.42, focus01) : 1,
      axialScale: focused ? THREE.MathUtils.lerp(1.34, 1.82, focus01) : 1,
      charged,
      charge01,
      projectionMode: focused ? (projection.mode ?? "self_braced") : "inactive"
    });
  }

  getReducedPulseContourGeometry(sourceGeometry) {
    if (!sourceGeometry?.attributes?.position) return null;
    const cached = this.pulseContourGeometryCache.get(sourceGeometry);
    if (cached) return cached;

    const wireGeometry = new THREE.WireframeGeometry(sourceGeometry);
    const positions = wireGeometry.attributes?.position;
    const totalSegments = Math.floor((positions?.count ?? 0) / 2);
    if (totalSegments <= 0) {
      wireGeometry.dispose();
      return null;
    }

    if (totalSegments <= this.maxPulseContourSegmentsPerMesh) {
      wireGeometry.userData.hc031w2a1SharedPulseContourGeometry = true;
      this.pulseContourGeometryCache.set(sourceGeometry, wireGeometry);
      return wireGeometry;
    }

    const keptSegments = this.maxPulseContourSegmentsPerMesh;
    const sampled = new Float32Array(keptSegments * 6);
    const stride = totalSegments / keptSegments;
    for (let index = 0; index < keptSegments; index += 1) {
      const segmentIndex = Math.min(totalSegments - 1, Math.floor(index * stride));
      const sourceOffset = segmentIndex * 2;
      const targetOffset = index * 6;
      sampled[targetOffset] = positions.getX(sourceOffset);
      sampled[targetOffset + 1] = positions.getY(sourceOffset);
      sampled[targetOffset + 2] = positions.getZ(sourceOffset);
      sampled[targetOffset + 3] = positions.getX(sourceOffset + 1);
      sampled[targetOffset + 4] = positions.getY(sourceOffset + 1);
      sampled[targetOffset + 5] = positions.getZ(sourceOffset + 1);
    }
    wireGeometry.dispose();

    const reducedGeometry = new THREE.BufferGeometry();
    reducedGeometry.setAttribute("position", new THREE.BufferAttribute(sampled, 3));
    reducedGeometry.computeBoundingSphere();
    reducedGeometry.userData.hc031w2a1SharedPulseContourGeometry = true;
    this.pulseContourGeometryCache.set(sourceGeometry, reducedGeometry);
    return reducedGeometry;
  }

  resolvePulseSpatialReveal(contact, frameState = this.frameState) {
    const distance = Math.max(0, Number.isFinite(contact?.distance) ? contact.distance : 0);
    const maxRange = Math.max(1, Number.isFinite(frameState.coreSensoryResponse?.maxRange)
      ? frameState.coreSensoryResponse.maxRange
      : 4.25);
    const distance01 = THREE.MathUtils.clamp(distance / maxRange, 0, 1);
    const deep = contact?.reachClass === "deep_structural";
    const resolutionStage = Math.max(1, Math.min(3, contact?.resolutionStage ?? 1));

    // W2B2: sonar should reveal relationships in layers rather than repainting the
    // whole target as one bright cage. Near/local answers resolve more completely;
    // distant structural answers begin as fragments and gain structure on repeat reads.
    const meshLimit = deep
      ? [1, 2, 3][resolutionStage - 1]
      : [2, 3, 4][resolutionStage - 1];
    const spatialTier = deep
      ? ["deep_fragment", "deep_layer", "deep_relation"][resolutionStage - 1]
      : distance01 < 0.35
        ? "local_near"
        : distance01 < 0.72 ? "local_mid" : "local_far";
    const baseOpacity = deep
      ? THREE.MathUtils.lerp(0.18, 0.105, distance01) + (resolutionStage - 1) * 0.012
      : THREE.MathUtils.lerp(0.34, 0.215, distance01) + (resolutionStage - 1) * 0.015;
    const life = deep
      ? 0.74 + (resolutionStage - 1) * 0.16 + distance01 * 0.16
      : 0.52 + (resolutionStage - 1) * 0.07 + distance01 * 0.06;

    return {
      deep,
      distance01,
      resolutionStage,
      meshLimit: Math.min(this.maxPulseContourMeshes, meshLimit),
      spatialTier,
      baseOpacity,
      life,
      propagationSpan: deep ? 0.34 : 0.24
    };
  }

  spawnPulseContour(contact, color, frameState = this.frameState) {
    const target = this.findObject(contact?.id);
    if (!target?.root?.visible) return;

    // Repeated sonar on the same noun refreshes its contour instead of stacking
    // duplicate cages over identical geometry.
    for (let index = this.pulseContours.length - 1; index >= 0; index -= 1) {
      if (this.pulseContours[index]?.targetId !== contact?.id) continue;
      const duplicate = this.pulseContours.splice(index, 1)[0];
      this.disposeContour(duplicate);
    }

    target.root.updateWorldMatrix?.(true, true);
    const box = new THREE.Box3().setFromObject(target.root);
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const center = sphere.center.clone();
    const contourRoot = new THREE.Group();
    contourRoot.name = `pulse_surface_contour_${contact?.id ?? "material"}`;
    contourRoot.position.copy(center);
    contourRoot.userData.targetingSuppressed = true;
    const reveal = this.resolvePulseSpatialReveal(contact, frameState);
    const materials = [];
    const materialPhases = [];
    let meshCount = 0;
    let segmentCount = 0;

    target.root.traverse((child) => {
      if (meshCount >= reveal.meshLimit || !child?.isMesh || !child.geometry?.attributes?.position) return;
      const vertexCount = child.geometry.attributes.position.count ?? 0;
      if (vertexCount <= 0 || vertexCount > 1800) return;
      const contourGeometry = this.getReducedPulseContourGeometry(child.geometry);
      const wireCount = contourGeometry?.attributes?.position?.count ?? 0;
      if (wireCount <= 0) return;

      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const wire = new THREE.LineSegments(contourGeometry, material);
      wire.userData.targetingSuppressed = true;
      wire.userData.hc031w2a1SharedPulseContourGeometry = true;
      const relativeMatrix = new THREE.Matrix4()
        .makeTranslation(-center.x, -center.y, -center.z)
        .multiply(child.matrixWorld);
      wire.matrixAutoUpdate = false;
      wire.matrix.copy(relativeMatrix);
      contourRoot.add(wire);
      materials.push(material);
      materialPhases.push(reveal.meshLimit > 1 ? meshCount / (reveal.meshLimit - 1) : 0);
      segmentCount += Math.floor(wireCount / 2);
      meshCount += 1;
    });

    if (!meshCount) return;
    this.group.add(contourRoot);
    const pulseCharacter = frameState.coreTopologyVerbCharacter?.pulse ?? {};
    this.pulseContours.push({
      targetId: contact?.id ?? "material",
      root: contourRoot,
      materials,
      materialPhases,
      segmentCount,
      age: 0,
      life: reveal.life * (pulseCharacter.contourPersistenceScale ?? 1),
      baseOpacity: reveal.baseOpacity,
      expansionScale: pulseCharacter.contourExpansionScale ?? 1,
      resolutionStage: reveal.resolutionStage,
      spatialTier: reveal.spatialTier,
      distance01: reveal.distance01,
      propagationSpan: reveal.propagationSpan
    });

    while (this.pulseContours.length > this.maxPulseContours) {
      const oldest = this.pulseContours.shift();
      this.disposeContour(oldest);
    }
  }

  updatePulseContours(dt) {
    for (const contour of this.pulseContours) {
      contour.age += dt;
      const t = THREE.MathUtils.clamp(contour.age / contour.life, 0, 1);
      const stage = Math.max(1, contour.resolutionStage ?? 1);
      const scale = 0.94 + t * (0.08 + (stage - 1) * 0.025) * (contour.expansionScale ?? 1);
      contour.root.scale.setScalar(scale);
      contour.root.rotation.y += dt * 0.10 * (stage - 1);
      const fade = 1 - THREE.MathUtils.clamp((t - 0.56) / 0.44, 0, 1);
      const propagationSpan = contour.propagationSpan ?? 0.24;
      for (let index = 0; index < contour.materials.length; index += 1) {
        const phase = (contour.materialPhases?.[index] ?? 0) * propagationSpan;
        const localT = THREE.MathUtils.clamp((t - phase) / Math.max(0.01, 1 - phase), 0, 1);
        const attack = THREE.MathUtils.clamp(localT / 0.14, 0, 1);
        const phaseFalloff = 1 - (contour.materialPhases?.[index] ?? 0) * 0.16;
        contour.materials[index].opacity = contour.baseOpacity * attack * fade * phaseFalloff;
      }
    }
    this.pulseContours = this.pulseContours.filter((contour) => {
      if (contour.age < contour.life) return true;
      this.disposeContour(contour);
      return false;
    });
  }

  disposeContour(contour) {
    if (!contour?.root) return;
    this.group.remove(contour.root);
    contour.root.traverse((child) => {
      if (!child.userData?.hc031w2a1SharedPulseContourGeometry) child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }

  spawnPulseReturnMote(contact, color, frameState = this.frameState) {
    while (this.pulseReturnMotes.length >= this.maxPulseReturnMotes) {
      const oldest = this.pulseReturnMotes.shift();
      this.disposeMesh(oldest?.root);
    }
    const start = new THREE.Vector3(contact.position?.x ?? 0, contact.position?.y ?? 0, contact.position?.z ?? 0);
    const deep = contact.reachClass === "deep_structural";
    const material = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: deep ? 0.42 : 0.82, depthWrite: false
    });
    const root = new THREE.Mesh(
      deep ? this.sharedPulseReturnDeepGeometry : this.sharedPulseReturnLocalGeometry,
      material
    );
    root.name = `pulse_sonar_return_${contact.responseClass ?? "material"}`;
    root.position.copy(start);
    root.userData.targetingSuppressed = true;
    this.group.add(root);
    const pulseCharacter = frameState.coreTopologyVerbCharacter?.pulse ?? {};
    const maxRange = Math.max(1, frameState.coreSensoryResponse?.maxRange ?? 4.25);
    const distance01 = THREE.MathUtils.clamp((contact.distance ?? 0) / maxRange, 0, 1);
    this.pulseReturnMotes.push({
      root,
      start,
      age: 0,
      life: Math.max(0.08, contact.returnTravelSeconds ?? 0.28) * (pulseCharacter.returnTrailScale ?? 1),
      deep,
      distance01,
      resolutionStage: Math.max(1, Math.min(3, contact.resolutionStage ?? 1)),
      startOpacity: deep ? 0.18 : THREE.MathUtils.lerp(0.44, 0.30, distance01),
      peakOpacity: deep ? 0.48 : THREE.MathUtils.lerp(0.78, 0.62, distance01)
    });
  }

  colorForPulseResponse(responseClass) {
    if (responseClass === "scar_memory") return 0xc7a5ff;
    if (responseClass === "living_seed") return 0xd8ffae;
    if (responseClass === "signal_resonant") return 0xa9f6ff;
    if (responseClass === "fluid_current") return 0x87cfff;
    if (responseClass === "dense_structure") return 0xf7dfba;
    if (responseClass === "host_membrane") return 0xd0a7ff;
    return 0x9fe8ff;
  }

  spawnContactFlash(position, color, baseScale = 0.34, growth = 1.0, life = 0.30, opacity = 0.48) {
    while (this.contactFlashes.length >= this.maxContactFlashes) {
      const oldest = this.contactFlashes.shift();
      this.disposeMesh(oldest?.root);
    }
    const material = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, depthWrite: false
    });
    const root = new THREE.Mesh(this.sharedContactFlashGeometry, material);
    root.name = "verb_material_contact_flash";
    root.position.copy(position);
    root.rotation.x = Math.PI / 2;
    root.userData.targetingSuppressed = true;
    this.group.add(root);
    this.contactFlashes.push({ root, age: 0, life, baseScale, growth, baseOpacity: opacity });
  }

  updateAbsorb(dt, frameState) {
    const held = Boolean(frameState.input?.absorbHeld);
    const targetId = frameState.bondState?.objectId ?? "none";
    const target = this.findObject(targetId);
    const committedSilt = this.getCommittedSiltVisualTarget(frameState);
    // Presentation only: do not infer a bond, progress, or material transfer from grip.
    const siltPreview = Boolean(held && committedSilt); // Explicit A commitment outranks a stale legacy bond for presentation.
    const visualPosition = siltPreview ? committedSilt.position : target?.root?.getWorldPosition(new THREE.Vector3());
    const publishedProgress = frameState.bondState?.absorbProgress;
    const progressValid = Number.isFinite(publishedProgress) && publishedProgress >= 0 && publishedProgress <= 1;
    const progress = progressValid ? publishedProgress : 0;
    const absorbPower = THREE.MathUtils.clamp(frameState.corePerformance?.verbModifiers?.absorb?.powerMultiplier ?? 1, 0.72, 1.42);
    const strength = frameState.bondState?.strength ?? 0;
    let targetVisible = Boolean(target?.root && !target.absorbed && !target.root.userData?.absorbed);
    for (let node = target?.root; targetVisible && node; node = node.parent) {
      if (!node.visible) targetVisible = false;
    }
    const active = Boolean(siltPreview || (held && targetVisible && frameState.bondState?.active === true));
    const visualId = active ? (siltPreview ? committedSilt.id : targetId) : "none";
    const changedContact = visualId !== this.absorbVisualTargetId || siltPreview !== this.absorbWasPreview;
    if (changedContact) {
      this.absorbCommitment = 0;
      this.previousAbsorbVisualProgress = progressValid ? progress : null;
      this.absorbFlowSeconds = 0;
    }
    const progressing = active && !siltPreview && !changedContact
      && frameState.bondState?.active === true
      && frameState.bondState?.compatibility === "compatible"
      && progressValid && Number.isFinite(this.previousAbsorbVisualProgress)
      && progress > this.previousAbsorbVisualProgress;
    this.absorbVisualTargetId = visualId;
    this.absorbWasPreview = siltPreview;
    this.previousAbsorbVisualProgress = progressValid ? progress : null;
    this.absorbVisualState = siltPreview ? "silt_grip_preview"
      : progressing ? "bond_progress" : active ? "bond_contact" : "inactive";
    if (progressing) this.absorbFlowSeconds += dt;
    // A held grain is not an absorption receipt. Remove old visual fragments
    // when preview takes ownership so a stale legacy stream cannot imply intake.
    if (siltPreview) {
      for (const mote of this.absorbMotes) this.disposeMesh(mote.root);
      this.absorbMotes = [];
    }
    const targetCommitment = active && !siltPreview ? 1 : 0;
    const absorbCharacter = frameState.coreTopologyVerbCharacter?.absorb ?? {};
    const composition = frameState.verbComposition ?? {};
    const compositionOwnsTarget = Boolean(composition.relationshipBound && composition.targetId === targetId);
    const compositionEffects = compositionOwnsTarget ? (composition.effects ?? {}) : {};
    const compositionSpin = THREE.MathUtils.clamp(compositionEffects.absorbSpinMultiplier ?? 1, 0.1, 1.2);
    const compositionTension = THREE.MathUtils.clamp(compositionEffects.tension01 ?? 0, 0, 1);
    this.absorbCommitment += (targetCommitment - this.absorbCommitment) * (1 - Math.exp(-dt * (active ? 2.4 : 4.8)));

    this.absorbLine.visible = Boolean(active);
    this.absorbFunnel.visible = Boolean(active);
    this.absorbFilaments.visible = Boolean(active);
    if (!active) {
      this.absorbLine.material.opacity = 0;
      for (const ring of this.absorbFunnel.children) ring.material.opacity = 0;
      for (const filament of this.absorbFilaments.children) filament.material.opacity = 0;
      this.updateAbsorbMotes(dt);
      return;
    }

    const pos = this.absorbLine.geometry.attributes.position.array;
    this.playerRoot.getWorldPosition(this.absorbCoreWorldPosition);
    pos[0] = visualPosition.x; pos[1] = visualPosition.y; pos[2] = visualPosition.z;
    pos[3] = this.absorbCoreWorldPosition.x; pos[4] = this.absorbCoreWorldPosition.y; pos[5] = this.absorbCoreWorldPosition.z;
    this.absorbLine.geometry.attributes.position.needsUpdate = true;
    this.absorbLine.material.opacity = Math.min(0.74, (0.12 + strength * 0.26 + progress * 0.18 + this.absorbCommitment * 0.18) * (0.86 + absorbPower * 0.14));

    const now = frameState.runtimeSeconds ?? 0;
    for (const ring of this.absorbFunnel.children) {
      const index = ring.userData.funnelIndex ?? 0;
      const along = 0.20 + index * 0.23;
      ring.position.lerpVectors(visualPosition, this.absorbCoreWorldPosition, along);
      ring.lookAt(this.absorbCoreWorldPosition);
      ring.rotation.z += (progressing ? dt : 0)
        * (0.85 + index * 0.32 + this.absorbCommitment * 1.45)
        * (absorbCharacter.helixRateScale ?? 1)
        * compositionSpin;
      const breathe = 1 + Math.sin(now * 5.8 - index * 0.92) * 0.07;
      const collapse = 1 - along * 0.18;
      ring.scale.setScalar((0.74 + index * 0.12 + this.absorbCommitment * 0.20) * breathe * collapse * (absorbCharacter.convergenceFocusScale ?? 1));
      ring.material.opacity = 0.10 + this.absorbCommitment * (0.16 + index * 0.04) + compositionTension * 0.035;
    }
    this.updateAbsorbFilaments(visualPosition, siltPreview ? 0 : progress, this.absorbFlowSeconds, absorbCharacter, compositionSpin, compositionTension);

    const spawnChance = Math.min(0.88, dt * (12 + progress * 20 + this.absorbCommitment * 22));
    if (progressing && Math.random() < spawnChance) this.spawnAbsorbMote(visualPosition, progress, absorbCharacter);
    if (siltPreview) {
      this.absorbLine.material.opacity = Math.min(this.absorbLine.material.opacity, 0.20);
      for (const ring of this.absorbFunnel.children) ring.material.opacity = Math.min(ring.material.opacity, 0.11);
      for (const filament of this.absorbFilaments.children) filament.material.opacity = Math.min(filament.material.opacity, 0.10);
    } else if (!progressing) {
      this.absorbLine.material.opacity = Math.min(this.absorbLine.material.opacity, 0.14);
      for (const ring of this.absorbFunnel.children) ring.material.opacity = Math.min(ring.material.opacity, 0.07);
      for (const filament of this.absorbFilaments.children) filament.material.opacity = Math.min(filament.material.opacity, 0.06);
    }
    this.updateAbsorbMotes(dt);
  }

  updateAbsorbFilaments(targetPosition, progress, now, absorbCharacter = {}, compositionSpin = 1, compositionTension = 0) {
    this.playerRoot.getWorldPosition(this.absorbCoreWorldPosition);
    this.tempB.copy(this.absorbCoreWorldPosition).sub(targetPosition);
    const length = this.tempB.length();
    if (length < 0.001) return;
    this.tempB.multiplyScalar(1 / length);
    this.tempC.crossVectors(this.tempB, this.worldUp);
    if (this.tempC.lengthSq() < 0.001) this.tempC.crossVectors(this.tempB, this.worldRight);
    this.tempC.normalize();
    this.tempD.crossVectors(this.tempB, this.tempC).normalize();

    for (const filament of this.absorbFilaments.children) {
      const index = filament.userData.filamentIndex ?? 0;
      const sampleCount = filament.userData.sampleCount ?? 18;
      const positions = filament.geometry.attributes.position.array;
      for (let sample = 0; sample < sampleCount; sample += 1) {
        const along = sample / Math.max(1, sampleCount - 1);
        this.temp.lerpVectors(targetPosition, this.absorbCoreWorldPosition, along);
        const phase = now
          * (4.2 + index * 0.28)
          * (absorbCharacter.helixRateScale ?? 1)
          * compositionSpin
          + index * 2.094
          + along * Math.PI * (4.0 + progress * 1.5);
        const radius = (1 - along)
          * (0.15 + index * 0.018)
          * (0.68 + this.absorbCommitment * 0.38)
          * (absorbCharacter.helixRadiusScale ?? 1)
          * (1 - compositionTension * 0.24);
        this.temp.addScaledVector(this.tempC, Math.cos(phase) * radius);
        this.temp.addScaledVector(this.tempD, Math.sin(phase) * radius);
        const k = sample * 3;
        positions[k] = this.temp.x;
        positions[k + 1] = this.temp.y;
        positions[k + 2] = this.temp.z;
      }
      filament.geometry.attributes.position.needsUpdate = true;
      filament.material.opacity = 0.10 + this.absorbCommitment * (0.20 + index * 0.035) + progress * 0.08;
    }
  }

  spawnAbsorbMote(position, progress, absorbCharacter = {}) {
    if (this.absorbMotes.length >= 20) return;
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd0a2, transparent: true, opacity: 0.7, depthWrite: false
    });
    const root = new THREE.Mesh(new THREE.SphereGeometry(0.024 + progress * 0.018, 5, 4), material);
    root.name = "absorb_material_fragment";
    root.position.copy(position);
    root.position.x += (Math.random() - 0.5) * 0.22;
    root.position.y += (Math.random() - 0.5) * 0.22;
    root.position.z += (Math.random() - 0.5) * 0.22;
    root.userData.targetingSuppressed = true;
    this.group.add(root);
    this.absorbMotes.push({
      root,
      start: root.position.clone(),
      phase: Math.random() * Math.PI * 2,
      spiralRadius: 0.08 + Math.random() * 0.12,
      age: 0,
      life: (0.58 + Math.random() * 0.28) * (absorbCharacter.fragmentLifeScale ?? 1)
    });
  }

  updateAbsorbMotes(dt) {
    this.playerRoot.getWorldPosition(this.absorbCoreWorldPosition);
    for (const mote of this.absorbMotes) {
      mote.age += dt;
      const t = Math.min(mote.age / mote.life, 1);
      this.tempB.copy(this.absorbCoreWorldPosition).sub(mote.start);
      if (this.tempB.lengthSq() > 0.0001) this.tempB.normalize();
      else this.tempB.set(0, 0, -1);
      this.tempC.crossVectors(this.tempB, this.worldUp);
      if (this.tempC.lengthSq() < 0.001) this.tempC.crossVectors(this.tempB, this.worldRight);
      this.tempC.normalize();
      this.tempD.crossVectors(this.tempB, this.tempC).normalize();
      this.temp.lerpVectors(mote.start, this.absorbCoreWorldPosition, t);
      const phase = mote.phase + t * Math.PI * 5.5;
      const radius = mote.spiralRadius * (1 - t) * (0.55 + this.absorbCommitment * 0.45);
      this.temp.addScaledVector(this.tempC, Math.cos(phase) * radius);
      this.temp.addScaledVector(this.tempD, Math.sin(phase) * radius);
      mote.root.position.copy(this.temp);
      mote.root.scale.setScalar(Math.max(0.08, 1 - t * 0.78));
      mote.root.material.opacity = Math.max(0, 0.72 * (1 - t * 0.7));
    }
    this.absorbMotes = this.absorbMotes.filter((mote) => {
      if (mote.age < mote.life) return true;
      this.disposeMesh(mote.root);
      return false;
    });
  }

  updateStabilize(dt, frameState) {
    const held = Boolean(frameState.input?.stabilizeHeld || frameState.input?.resonanceHeld);
    const target = this.getStabilizeTarget(frameState);
    const active = held && target;

    if (!active) {
      this.stabilizeProgress = Math.max(0, this.stabilizeProgress - dt * 2.4);
      this.stabilizeTargetId = "none";
      this.stabilizeAlignment01 = 0;
      this.stabilizeCondition01 = null;
      this.stabilizeField.visible = false;
      this.stabilizeLine.visible = false;
      this.setStabilizeFieldOpacity(0);
      return;
    }

    const stabilizeCoherence = THREE.MathUtils.clamp(frameState.corePerformance?.verbModifiers?.stabilize?.coherenceMultiplier ?? 1, 0.66, 1.48);
    const stabilizeCharacter = frameState.coreTopologyVerbCharacter?.stabilize ?? {};
    const composition = frameState.verbComposition ?? {};
    const compositionOwnsTarget = Boolean(composition.relationshipBound && composition.targetId === target.id);
    const compositionEffects = compositionOwnsTarget ? (composition.effects ?? {}) : {};
    const stabilizeRateMultiplier = THREE.MathUtils.clamp(compositionEffects.stabilizeRateMultiplier ?? 1, 0.6, 1.3);
    const stabilizeWobbleMultiplier = THREE.MathUtils.clamp(compositionEffects.stabilizeWobbleMultiplier ?? 1, 0.1, 1.2);
    const stabilizeLineOpacityMultiplier = THREE.MathUtils.clamp(compositionEffects.stabilizeLineOpacityMultiplier ?? 1, 0.8, 1.3);
    // CONNECTION18: alignment belongs to this contact, never the previous one.
    if (this.stabilizeTargetId !== target.id) this.stabilizeProgress = 0;
    this.stabilizeProgress = Math.min(1, this.stabilizeProgress + dt * 1.45 * stabilizeCoherence * stabilizeRateMultiplier);
    const condition = target.object?.recipe?.id === target.id
      ? frameState.reactiveStateGrammar?.objects?.[target.id]?.condition01 : undefined;
    this.stabilizeCondition01 = Number.isFinite(condition) ? THREE.MathUtils.clamp(condition, 0, 1) : null;
    // Material condition is read-only. A coherent body (<=0.30 in the existing
    // grammar) can align fully; unstable tissue retains visible disagreement.
    const conditionStress = this.stabilizeCondition01 === null ? 0
      : THREE.MathUtils.clamp((this.stabilizeCondition01 - 0.30) / 0.70, 0, 1);
    this.stabilizeAlignment01 = this.stabilizeProgress * (1 - conditionStress);
    const alignment = this.stabilizeAlignment01;
    this.stabilizeTargetId = target.id;
    this.stabilizeField.visible = true;
    this.stabilizeField.position.copy(target.position);

    // HC028G: Stabilize reads as gyroscopic capture -> alignment -> hold.
    // The target is organized by three counter-oriented bands whose wobble and
    // precession visibly collapse as coherence rises; no movement/verb authority changes.
    const targetRadius = this.getTargetVisualRadius(target);
    const latticeScale = (targetRadius / 0.252) * (0.90 + this.stabilizeProgress * 0.15);
    this.stabilizeField.scale.setScalar(Math.max(0.72, Math.min(2.65, latticeScale)));
    this.stabilizeField.rotation.set(0, 0, 0);
    const now = frameState.runtimeSeconds ?? 0;
    const wobble = ((1 - alignment) * 0.34 + 0.018)
      * (stabilizeCharacter.wobbleScale ?? 1)
      * stabilizeWobbleMultiplier;
    for (const ring of this.stabilizeField.children) {
      const index = ring.userData.gyroBandIndex ?? 0;
      const base = ring.userData.baseRotation ?? { x: 0, y: 0, z: 0 };
      const phase = ring.userData.phase ?? 0;
      const counter = index % 2 === 0 ? 1 : -1;
      const precession = now * counter * (0.86 - alignment * 0.62) * (stabilizeCharacter.precessionRateScale ?? 1);
      ring.rotation.set(
        base.x + Math.sin(now * 2.15 + phase) * wobble * 0.55,
        base.y + Math.cos(now * 1.73 + phase) * wobble * 0.48,
        base.z + precession + Math.sin(now * 1.31 + phase) * wobble * 0.32
      );
      const settlePulse = 1 + Math.sin(now * (2.1 + index * 0.14) + phase) * (1 - alignment) * 0.045 * (stabilizeCharacter.settlePulseScale ?? 1);
      ring.scale.setScalar(settlePulse);
    }
    const guideFieldSuppression = Math.min(
      0.8,
      Math.max(0, frameState.guideThresholdGameplay?.sharedStabilizeFieldSuppression ?? 0)
    );
    this.setStabilizeFieldOpacity(
      (0.08 + this.stabilizeProgress * 0.40) * (1 - guideFieldSuppression) * (stabilizeCharacter.bandOpacityScale ?? 1)
    );

    const positions = this.stabilizeLine.geometry.attributes.position.array;
    this.playerRoot.getWorldPosition(this.temp);
    positions[0] = this.temp.x;
    positions[1] = this.temp.y;
    positions[2] = this.temp.z;
    positions[3] = target.position.x;
    positions[4] = target.position.y;
    positions[5] = target.position.z;
    this.stabilizeLine.geometry.attributes.position.needsUpdate = true;
    this.stabilizeLine.visible = true;
    this.stabilizeLine.material.opacity = Math.min(
      0.92,
      (0.14 + this.stabilizeProgress * 0.58) * stabilizeLineOpacityMultiplier
    );

    if (Math.random() < dt * 1.25) this.spawnContactFlash(target.position, 0x9fffd8, 0.22, 0.46, 0.34, 0.22);
  }

  // LS1D1D2C1: presentation-only committed Silt destination. A grip snapshot
  // is not a material transaction and must never authorize absorb or fracture.
  getCommittedSiltVisualTarget(frameState) {
    const grip = frameState.siltPressureRoute?.siltGrip;
    if (!grip || grip.status !== "gripping" || !grip.heldId) return null;
    const position = grip.position;
    if (!Array.isArray(position) || position.length < 3 ||
        !position.slice(0, 3).every(Number.isFinite)) return null;
    return {
      id: grip.heldId,
      position: new THREE.Vector3(position[0], position[1], position[2]),
      ownership: "silt_committed_visual_only"
    };
  }

  getStabilizeTarget(frameState) {
    const committedSilt = this.getCommittedSiltVisualTarget(frameState);
    if (committedSilt) return committedSilt;
    // HC029B: when Stabilize has established a retained relationship, that object
    // owns the focused coherence field. Route/Host fallbacks remain available only
    // when no valid relationship object exists.
    const relationshipTargetId = frameState.targeting?.relationshipActive
      ? (frameState.targeting?.relationshipTargetId ?? "none")
      : "none";
    if (relationshipTargetId !== "none") {
      const object = this.findObject(relationshipTargetId);
      if (object?.root?.visible && !object.absorbed && !object.root.userData?.absorbed) {
        return {
          id: relationshipTargetId,
          object,
          position: object.root.getWorldPosition(new THREE.Vector3()),
          ownership: "focused_relationship"
        };
      }
    }

    const assist = frameState.interactionAssist;
    if (assist?.active && assist.position) {
      const object = this.findObject(assist.objectId);
      return {
        id: assist.objectId ?? "interaction_target",
        object,
        position: object?.root?.getWorldPosition?.(new THREE.Vector3())
          ?? new THREE.Vector3(assist.position.x, assist.position.y, assist.position.z)
      };
    }

    const routeIds = [
      ["grave_memory_route", frameState.graveMemoryRoute],
      ["vascular_route", frameState.vascularRhythmRoute],
      ["silt_burrow_route", frameState.siltPressureRoute]
    ];
    for (const [id, state] of routeIds) {
      if (!state) continue;
      const nearest = this.chemObjectSystem?.findNearestObject?.();
      if (nearest && nearest.distance <= 3.4) {
        return { id: nearest.recipe.id, object: nearest, position: nearest.root.getWorldPosition(new THREE.Vector3()) };
      }
      if (frameState.activeCellId?.includes(id.split("_")[0].toUpperCase())) {
        return { id, position: this.playerRoot.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, -1.25)) };
      }
    }
    return {
      id: frameState.currentChemTarget ?? "local_host_field",
      position: this.playerRoot.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, -1.1))
    };
  }

  findObject(id) {
    if (!id || id === "none") return null;
    return this.chemObjectSystem?.objects?.find((item) => item.recipe.id === id) ?? null;
  }

  disposeMesh(root) {
    if (!root) return;
    this.group.remove(root);
    if (!root.geometry?.userData?.hc031w2a2SharedTransientGeometry) root.geometry?.dispose?.();
    root.material?.dispose?.();
  }
}
