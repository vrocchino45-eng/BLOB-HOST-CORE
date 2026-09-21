import * as THREE from "three";

export class SecondLocalCellMorphSystem {
  constructor({ recipeDataSystem, visualComposer, chemObjectSystem, playerRoot, scene, frameState }) {
    if (!recipeDataSystem) throw new Error("[SecondLocalCellMorphSystem] recipeDataSystem is required.");
    if (!visualComposer) throw new Error("[SecondLocalCellMorphSystem] visualComposer is required.");
    if (!chemObjectSystem) throw new Error("[SecondLocalCellMorphSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[SecondLocalCellMorphSystem] playerRoot is required.");
    if (!scene) throw new Error("[SecondLocalCellMorphSystem] scene is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.visualComposer = visualComposer;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.scene = scene;
    this.frameState = frameState;

    this.plan = null;
    this.readinessRules = null;
    this.sourceCell = null;
    this.destinationCell = null;
    this.phase = "waiting_for_scar_flow_stability";
    this.progress = 0;
    this.started = false;
    this.completed = false;
    this.spawnedDestination = false;
    this.destinationPrepared = false;
    this.destinationActivated = false;
    this.destinationEnvironment = [];
    this.sourceCellId = "CELL_SCAR_FLOW_FOLD_001";
    this.destinationCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
    this.sourceEnvironmentIds = ["scar_flow_fold_surface_001", "scar_pressure_haze_001"];
    this.progressRate = 0;
    this.cueRing = null;
    this.innerRing = null;
  }

  init() {
    this.plan = this.recipeDataSystem.get("secondMorphPlans", "MORPH_SCAR_FLOW_TO_SIGNAL_CHORUS_001");
    this.readinessRules = this.recipeDataSystem.get("scarFlowExitReadinessRules", "SCAR_FLOW_EXIT_READINESS_001");
    this.sourceCell = this.recipeDataSystem.get("localCellRecipes", this.plan.sourceCell);
    this.destinationCell = this.recipeDataSystem.get("localCellRecipes", this.plan.destinationCell);
    this.createCueVFX();

    this.frameState.secondLocalCellMorph = this.createState({
      ready: false,
      start: false,
      reason: "complete_scar_flow_interaction_loop",
      nextAction: "stabilize the scar-flow fold first",
      triggerConfidence: 0
    });
  }

  update(dt, frameState) {
    const trigger = this.evaluateTrigger(frameState);

    if (!this.started && !this.completed) {
      this.phase = trigger.ready ? "ready_pulse_listening_thread" : trigger.reason;
      if (trigger.start) this.startMorph(frameState);
    }

    if (this.started && !this.completed) this.updateMorph(dt, frameState, trigger);

    this.updateCue(frameState, trigger);
    frameState.secondLocalCellMorph = this.createState(trigger);
  }

  onRuntimeUnmount(frameState) {
    if (this.cueRing) this.cueRing.visible = false;
    if (this.innerRing) this.innerRing.visible = false;
    frameState.secondLocalCellMorph = {
      ...this.createState({
        ready: false,
        reason: this.completed ? "completed_in_signal_chorus_nerve" : "guide_threshold_mount_released",
        nextAction: this.completed ? "Hub Chamber mount active." : "Return to Guide Threshold to continue.",
        firstMorphComplete: true,
        activeInSource: false
      }),
      active: false,
      runtimeMountReleased: true
    };
  }

  evaluateTrigger(frameState) {
    const firstMorphComplete = Boolean(frameState.localCellMorph?.completed);
    const activeInSource = frameState.activeCellId === this.sourceCellId;
    const interaction = frameState.scarFlowInteraction ?? {};
    const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
    const completion = frameState.morphCompletion ?? {};
    const targeting = frameState.targeting ?? {};
    const required = this.plan.readiness ?? {};
    const requiredComposition = required.requiredPlayerComposition ?? {};
    const player = frameState.playerComposition ?? {};

    const guideThresholdComplete = Boolean(
      guideThreshold.completed ||
      guideThreshold.transitionReady ||
      guideThreshold.stage === "guide_threshold_complete"
    );

    const scarFlowStable = Boolean(
      guideThresholdComplete ||
      interaction.preparedForNextBranch ||
      interaction.stage === (required.requiresScarFlowLoopStage ?? "scar_flow_stable") ||
      interaction.progress >= 0.82
    );

    const stability = completion.stability ?? 0;
    const pathConfidence = completion.pathConfidence ?? 0;
    const pressureRelief = completion.pressureRelief ?? 0;
    const clotWarning = completion.clotWarning ?? 0;
    const signal = player.signal ?? 0;
    const seed = player.seed ?? 0;
    const scar = player.scar ?? 0;

    const stabilityReady = stability >= Math.min(required.minimumStability ?? 0.82, 0.58);
    const pathReady = pathConfidence >= Math.min(required.minimumPathConfidence ?? 0.72, 0.35);
    const pressureReady = pressureRelief >= Math.min(required.minimumPressureRelief ?? 0.66, 0.25);
    const clotReady = clotWarning <= Math.max(required.maximumClotWarning ?? 0.42, 0.58);
    const compositionReady = guideThresholdComplete || (
      signal >= Math.min(requiredComposition.signal ?? 0.1, 0.10) &&
      seed >= Math.min(requiredComposition.seed ?? 0.28, 0.28) &&
      scar <= Math.max(requiredComposition.scarMax ?? 0.2, 0.24)
    );

    // HC-006F: the movement-led Guide Threshold sequence is the primary proof.
    // Legacy metrics remain compatible but may not create a second hidden stall.
    const supportingMetricsReady = guideThresholdComplete || stabilityReady || (pathReady && pressureReady && clotReady);
    const ready = firstMorphComplete && activeInSource && scarFlowStable && supportingMetricsReady && compositionReady;

    const focus = interaction.currentFocus ?? completion.nearestHook ?? targeting.targetId ?? "none";
    const listeningFocus = [
      "resonant_path_thread_001",
      "pressure_fold_current_001",
      "scar_memory_fleck_001"
    ].includes(focus);
    const pulsePressed = Boolean(frameState.input?.pulsePressed);
    const guideTransitionReady = Boolean(guideThresholdComplete && guideThreshold.transitionReady !== false);
    const start = ready && (
      guideTransitionReady ||
      (pulsePressed && (listeningFocus || interaction.stage === "scar_flow_stable" || interaction.preparedForNextBranch))
    );

    let confidence = 0;
    if (firstMorphComplete) confidence += 0.16;
    if (activeInSource) confidence += 0.10;
    if (scarFlowStable) confidence += 0.25;
    if (stabilityReady) confidence += 0.12;
    if (pathReady) confidence += 0.10;
    if (pressureReady) confidence += 0.10;
    if (clotReady) confidence += 0.06;
    if (compositionReady) confidence += 0.08;
    if (pulsePressed && ready) confidence += 0.03;
    confidence = this.clamp01(confidence);

    let reason = "complete_first_morph";
    let nextAction = "complete the first tissue fold into scar-flow";

    if (firstMorphComplete && !activeInSource && !this.completed) {
      reason = "waiting_for_scar_flow_active_cell";
      nextAction = "let scar-flow become the active cell";
    }

    if (firstMorphComplete && activeInSource && !scarFlowStable) {
      reason = "stabilize_scar_flow_loop";
      nextAction = interaction.nextAction ?? "read memory, align path, relieve pressure, respect clot";
    }

    if (scarFlowStable && !supportingMetricsReady) {
      reason = "scar_flow_metrics_settling";
      nextAction = "pulse the path/current once more until the fold loosens";
    }

    if (scarFlowStable && supportingMetricsReady && !compositionReady) {
      reason = "composition_not_ready_for_signal";
      nextAction = `signal ${signal.toFixed(2)} / seed ${seed.toFixed(2)} / scar ${scar.toFixed(2)} settling`;
    }

    if (ready) {
      reason = guideTransitionReady ? "guide_threshold_complete_ready_for_continuous_morph" : "ready_pulse_to_signal_chorus";
      nextAction = guideTransitionReady
        ? "The settled Guide Threshold is becoming Signal Chorus tissue."
        : "Pulse the listening thread and let the fold become signal.";
    }

    if (start) {
      reason = "second_morph_started_no_gate";
      nextAction = "Stay in control while the scar-flow becomes a signal chorus nerve.";
    }

    if (this.started && !this.completed) {
      reason = "morphing_into_signal_chorus";
      nextAction = "Keep moving. Pulse with the answering waves as the nerve becomes readable.";
    }

    if (this.completed) {
      reason = "completed_in_signal_chorus_nerve";
      nextAction = "Listen to the chorus nodes. Pulse before absorbing.";
    }

    return {
      ready,
      start,
      reason,
      nextAction,
      triggerConfidence: confidence,
      firstMorphComplete,
      activeInSource,
      scarFlowStable,
      stability,
      pathConfidence,
      pressureRelief,
      clotWarning,
      signal,
      seed,
      scar,
      stabilityReady,
      pathReady,
      pressureReady,
      clotReady,
      compositionReady,
      supportingMetricsReady,
      focus,
      listeningFocus,
      pulsePressed,
      guideThresholdComplete,
      guideTransitionReady
    };
  }

  startMorph(frameState) {
    this.started = true;
    this.phase = "morphing_into_signal_chorus";
    this.progress = Math.max(this.progress, 0.02);
    this.spawnDestinationContent({ dormant: false });
    this.activatePreparedDestination();
    frameState.chemObjectState.pulseResponse = "second_local_cell_morph_started_without_gate";
  }

  prepareTransitionResources() {
    this.spawnDestinationContent({ dormant: true });
    return [
      ...this.destinationEnvironment,
      ...this.chemObjectSystem.objects
        .filter((item) => item.cellId === this.destinationCell.id)
        .map((item) => item.root)
    ];
  }

  spawnDestinationContent({ dormant = false } = {}) {
    if (this.spawnedDestination) return;

    this.destinationEnvironment = [
      this.visualComposer.compose({
        objectId: "signal_chorus_nerve_surface_001",
        visualRecipeId: this.destinationCell.visuals.environmentRecipe,
        position: [0, 0, -0.35],
        scale: 1
      }),
      this.visualComposer.compose({
        objectId: "signal_chorus_soft_haze_001",
        visualRecipeId: this.destinationCell.visuals.atmosphereRecipe,
        position: [0, 0, -0.35],
        scale: 1
      })
    ];

    for (const root of this.destinationEnvironment) {
      root.userData.cellId = this.destinationCell.id;
      root.userData.morphRole = "second_destination_environment";
      root.userData.transitionPrepared = dormant;
      this.setGroupOpacity(root, 0);
      root.visible = !dormant;
    }

    const spawned = this.chemObjectSystem.spawnCellObjects(this.destinationCell, {
      cellId: this.destinationCell.id,
      visible: !dormant,
      opacity: 0,
      avoidExisting: true,
      morphRole: "second_destination_chem_object"
    });

    for (const item of spawned) {
      item.root.userData.morphRole = "second_destination_chem_object";
      item.root.userData.transitionPrepared = dormant;
    }

    this.spawnedDestination = true;
    this.destinationPrepared = true;
  }

  activatePreparedDestination() {
    if (!this.spawnedDestination || this.destinationActivated) return;

    for (const root of this.destinationEnvironment) {
      root.userData.transitionPrepared = false;
      root.visible = true;
    }

    for (const item of this.chemObjectSystem.objects) {
      if (item.cellId !== this.destinationCell.id || item.absorbed || item.root.userData.absorbed) continue;
      item.root.userData.transitionPrepared = false;
      item.root.visible = true;
    }

    this.destinationActivated = true;
  }

  updateMorph(dt, frameState, trigger) {
    const pulseBoost = trigger.pulsePressed ? 0.06 : 0;
    const focusBoost = trigger.listeningFocus ? 0.04 : 0;
    const confidenceBoost = Math.max(0, (trigger.triggerConfidence ?? 0) - 0.65) * 0.06;
    this.progressRate = 0.20 + pulseBoost + focusBoost + confidenceBoost;
    this.progress = Math.min(1, this.progress + dt * this.progressRate);

    this.applyChemistryBlend(frameState, this.progress);
    this.applyPhysicalBlend(frameState, this.progress);
    this.applyVisualBlend(this.progress, frameState);

    if (this.progress >= 1 && !this.completed) this.completeMorph(frameState);
  }

  applyChemistryBlend(frameState, progress) {
    const from = this.sourceCell.chemistryField ?? {};
    const to = this.destinationCell.chemistryField ?? {};
    const eased = this.easeInOut(progress);
    const keys = ["form", "flux", "scar", "seed", "signal", "residue", "bloom", "inorganic", "confluence"];
    const next = { ...(frameState.chemistry ?? {}) };
    for (const key of keys) next[key] = this.lerp(from[key] ?? 0, to[key] ?? 0, eased);
    frameState.chemistry = next;
  }

  applyPhysicalBlend(frameState, progress) {
    const from = this.sourceCell.physicalFeel ?? {};
    const to = this.destinationCell.physicalFeel ?? {};
    const eased = this.easeInOut(progress);
    const fromFlow = from.flowVector ?? [0, 0, 0];
    const toFlow = to.flowVector ?? [0, 0, 0];

    frameState.physicalFeel = {
      ...frameState.physicalFeel,
      viscosity: this.lerp(from.viscosity ?? 0.52, to.viscosity ?? 0.48, eased),
      pressure: this.lerp(from.pressure ?? 0.58, to.pressure ?? 0.18, eased),
      flowVector: {
        x: this.lerp(fromFlow[0] ?? 0, toFlow[0] ?? 0, eased),
        y: this.lerp(fromFlow[1] ?? 0, toFlow[1] ?? 0, eased),
        z: this.lerp(fromFlow[2] ?? 0, toFlow[2] ?? 0, eased)
      },
      boundaryBehavior: progress >= 0.55 ? to.boundaryBehavior : from.boundaryBehavior
    };
  }

  applyVisualBlend(progress, frameState) {
    const eased = this.easeInOut(progress);
    const destinationOpacity = Math.min(1, eased * 1.12);
    const sourceOpacity = Math.max(0.12, 1 - eased * 0.78);

    for (const root of this.destinationEnvironment) {
      this.setGroupOpacity(root, destinationOpacity);
      root.scale.setScalar(0.9 + eased * 0.16 + Math.sin(frameState.runtimeSeconds * 1.6) * 0.012);
    }

    for (const item of this.chemObjectSystem.objects) {
      if (item.cellId === this.destinationCell.id) {
        item.root.visible = true;
        this.chemObjectSystem.setObjectOpacity(item.root, destinationOpacity);
      }
      if (item.cellId === this.sourceCell.id && !item.root.userData.absorbed) {
        this.chemObjectSystem.setObjectOpacity(item.root, sourceOpacity);
      }
    }

    for (const objectId of this.sourceEnvironmentIds) {
      const entry = this.visualComposer.composedObjects.find((item) => item.root.name === objectId);
      if (entry) this.setGroupOpacity(entry.root, sourceOpacity);
    }
  }

  completeMorph(frameState) {
    this.completed = true;
    this.started = false;
    this.phase = "completed_in_signal_chorus_nerve";
    frameState.activeCellId = this.destinationCell.id;
    frameState.chemObjectState.pulseResponse = "entered_signal_chorus_nerve_by_morph_not_gate";

    this.chemObjectSystem.setCellObjectVisibility(this.sourceCell.id, false, 0);
    this.chemObjectSystem.setCellObjectVisibility(this.destinationCell.id, true, 1);

    for (const root of this.destinationEnvironment) this.setGroupOpacity(root, 1);
    for (const objectId of this.sourceEnvironmentIds) {
      const entry = this.visualComposer.composedObjects.find((item) => item.root.name === objectId);
      if (entry) this.setGroupOpacity(entry.root, 0.08);
    }

    if (frameState.lockState) frameState.lockState.nextIfPasses = "HC-003N Opening Slice Gold Candidate — continue required chain";
  }

  updateCue(frameState, trigger) {
    if (!this.cueRing || !this.innerRing) return;
    const active = trigger.ready || this.started || this.completed;
    this.cueRing.visible = active;
    this.innerRing.visible = active;
    if (!active) return;

    const t = frameState.runtimeSeconds ?? 0;
    this.cueRing.position.copy(this.playerRoot.position);
    this.cueRing.position.y -= 0.11;
    this.innerRing.position.copy(this.cueRing.position);
    this.innerRing.position.y += 0.012;

    const readyScale = 1 + (trigger.triggerConfidence ?? 0) * 0.25 + this.progress * 0.55;
    this.cueRing.scale.setScalar(readyScale * (1 + Math.sin(t * 3.7) * 0.045));
    this.innerRing.scale.setScalar((0.62 + this.progress * 1.0) * (1 + Math.sin(t * 5.8) * 0.04));
    this.cueRing.rotation.z += 0.018 + this.progress * 0.035;
    this.innerRing.rotation.z -= 0.025 + this.progress * 0.045;
    this.cueRing.material.opacity = this.completed ? 0.18 : 0.12 + (trigger.triggerConfidence ?? 0) * 0.25 + this.progress * 0.22;
    this.innerRing.material.opacity = this.completed ? 0.30 : 0.08 + this.progress * 0.48;
  }

  createCueVFX() {
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xaeefff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    this.cueRing = new THREE.Mesh(new THREE.TorusGeometry(1.34, 0.012, 8, 128), ringMat);
    this.cueRing.name = "second_morph_signal_readiness_ring";
    this.cueRing.rotation.x = Math.PI / 2;
    this.cueRing.visible = false;
    this.scene.add(this.cueRing);

    const innerMat = ringMat.clone();
    innerMat.color.set(0xffe4a8);
    this.innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.008, 8, 96), innerMat);
    this.innerRing.name = "second_morph_signal_progress_ring";
    this.innerRing.rotation.x = Math.PI / 2;
    this.innerRing.visible = false;
    this.scene.add(this.innerRing);
  }

  createState(trigger) {
    return {
      planId: this.plan?.id ?? "none",
      sourceCell: this.plan?.sourceCell ?? "none",
      destinationCell: this.plan?.destinationCell ?? "none",
      phase: this.phase,
      progress: this.progress,
      progressRate: this.progressRate,
      triggerReady: Boolean(trigger.ready),
      triggerReason: trigger.reason ?? "none",
      nextAction: trigger.nextAction ?? "none",
      triggerConfidence: trigger.triggerConfidence ?? 0,
      firstMorphComplete: Boolean(trigger.firstMorphComplete),
      activeInSource: Boolean(trigger.activeInSource),
      scarFlowStable: Boolean(trigger.scarFlowStable),
      supportingMetricsReady: Boolean(trigger.supportingMetricsReady),
      compositionReady: Boolean(trigger.compositionReady),
      stability: trigger.stability ?? 0,
      pathConfidence: trigger.pathConfidence ?? 0,
      pressureRelief: trigger.pressureRelief ?? 0,
      clotWarning: trigger.clotWarning ?? 0,
      signal: trigger.signal ?? 0,
      seed: trigger.seed ?? 0,
      scar: trigger.scar ?? 0,
      focus: trigger.focus ?? "none",
      noGate: true,
      continuousControl: true,
      destinationSpawned: this.spawnedDestination,
      destinationPrepared: this.destinationPrepared,
      destinationActivated: this.destinationActivated,
      transitionContinuityPass: "HC-009F",
      baseProgressRate: 0.20,
      completed: this.completed
    };
  }

  setGroupOpacity(root, opacity) {
    root.visible = opacity > 0.01;
    root.traverse((child) => {
      const materials = child.material ? Array.isArray(child.material) ? child.material : [child.material] : [];
      for (const material of materials) {
        if (!material) continue;
        if (material.userData.originalOpacity === undefined) material.userData.originalOpacity = material.opacity ?? 1;
        material.transparent = true;
        material.opacity = Math.max(0, Math.min(1, opacity * material.userData.originalOpacity));
        material.needsUpdate = true;
      }
    });
  }

  easeInOut(value) {
    const t = this.clamp01(value);
    return t * t * (3 - 2 * t);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
