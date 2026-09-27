import * as THREE from "three";

export class LocalCellMorphSystem {
  constructor({ recipeDataSystem, visualComposer, chemObjectSystem, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[LocalCellMorphSystem] recipeDataSystem is required.");
    if (!visualComposer) throw new Error("[LocalCellMorphSystem] visualComposer is required.");
    if (!chemObjectSystem) throw new Error("[LocalCellMorphSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[LocalCellMorphSystem] playerRoot is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.visualComposer = visualComposer;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.plan = null;
    this.sourceCell = null;
    this.destinationCell = null;
    this.progress = 0;
    this.phase = "waiting_for_host_language_or_seed_support";
    this.started = false;
    this.completed = false;
    this.progressHold = 0;
    this.lastTriggerConfidence = 0;
    this.lastNextAction = "complete_listening_fold_then_pulse_scar_or_signal";
    this.spawnedDestination = false;
    this.destinationPrepared = false;
    this.destinationActivated = false;
    this.destinationEnvironment = [];
    this.sourceEnvironmentIds = [
      "membrane_pocket_surface_001",
      "nursery_soft_pressure_fog_001"
    ];
    this.sourcePresentationIds = [
      "nursery_membrane_tender_001",
      "membrane_watcher_001",
      "surface_wake_layered_interaction_HC006E",
      "surface_wake_visual_embodiment_HC008C"
    ];
    this.tempColor = new THREE.Color();
  }

  init() {
    this.plan = this.recipeDataSystem.get("morphPlans", "MORPH_MEMBRANE_TO_SCAR_FLOW_001");
    this.sourceCell = this.recipeDataSystem.get("localCellRecipes", this.plan.sourceCell);
    this.destinationCell = this.recipeDataSystem.get("localCellRecipes", this.plan.destinationCell);

    this.frameState.localCellMorph = this.createMorphState({
      phase: this.phase,
      triggerReady: false,
      triggerReason: "waiting_for_host_language_or_seed_support",
      triggerConfidence: 0,
      nextAction: "complete the Listening Fold; the safe seed remains optional chemistry support"
    });
  }

  update(dt, frameState) {
    const trigger = this.evaluateTrigger(frameState);

    if (!this.started && !this.completed) {
      this.phase = trigger.deferredToSurfaceWake
        ? "deferred_to_surface_wake_lesson"
        : trigger.ready
          ? "ready_pulse_scar_or_signal"
          : trigger.reason;

      if (trigger.start) {
        this.startMorph(frameState);
      }
    }

    if (this.started && !this.completed) {
      this.updateMorph(dt, frameState, trigger);
    }

    frameState.localCellMorph = this.createMorphState(trigger);
  }

  evaluateTrigger(frameState) {
    const playerForm = frameState.playerComposition?.form ?? 0;
    const playerSeed = frameState.playerComposition?.seed ?? 0;
    const seedItem = this.chemObjectSystem.objects.find((item) => item.recipe.id === "dormant_seed_nutrient_001");

    const seedAbsorbed = Boolean(
      seedItem?.absorbed ||
      seedItem?.root.userData.absorbed ||
      playerSeed >= 0.395
    );

    // HC-002F fix:
    // HC-002E could stall at 74% because the first seed absorb landed player Form at
    // exactly ~0.34 while the trigger used a strict `> 0.34` check.
    // The morph is now based on a tolerant "composition settled" read, not a brittle
    // exact greater-than comparison.
    const thresholds = {
      form: 0.335,
      seed: 0.395
    };

    const formGrowth = playerForm >= thresholds.form || (seedAbsorbed && playerForm >= 0.33);
    const seedGrowth = playerSeed >= thresholds.seed || seedAbsorbed;
    const compositionSettled = seedAbsorbed && formGrowth && seedGrowth;

    // HC031O ownership convergence:
    // The foundational Surface Wake lesson still owns the opening until it completes.
    // After completion, either the learned Host language or the older seed/composition
    // chemistry may arm the existing no-gate morph. Seed absorption is support, not a gate.
    const surfaceWake = frameState.surfaceWakeLayeredInteraction ?? {};
    const hostContinuation = frameState.surfaceWakeGameplay?.hostContinuationInvitation ?? {};
    const deferredToSurfaceWake = Boolean(
      frameState.activeCellId === (this.sourceCell?.id ?? "CELL_MEMBRANE_NURSERY_001") &&
      surfaceWake.active &&
      !surfaceWake.completed
    );

    if (deferredToSurfaceWake) {
      const nextAction = surfaceWake.nextAction ?? "Complete the Surface Wake listening-fold lesson first.";
      this.lastTriggerConfidence = 0;
      this.lastNextAction = nextAction;
      return {
        ready: false,
        start: false,
        reason: "none",
        nextAction,
        triggerConfidence: 0,
        deferredToSurfaceWake: true,
        seedAbsorbed,
        formGrowth,
        seedGrowth,
        compositionSettled,
        playerForm,
        playerSeed,
        thresholds,
        pressureVisible: false,
        pulseTouchedScarOrSignal: false,
        pulseAttemptedUnderPressure: false,
        playerNearScar: false,
        playerNearSignal: false,
        scarOrSignalTargeted: false
      };
    }

    const hostLanguageReady = Boolean(surfaceWake.completed && hostContinuation.open);
    const chemistryContinuationReady = Boolean(compositionSettled);
    const continuationReady = Boolean(hostLanguageReady || chemistryContinuationReady);

    const affected = frameState.pulse?.affectedObjects ?? [];
    const pulseTouchedScarOrSignal =
      affected.includes("scar_contamination_plate_001") ||
      affected.includes("signal_vapor_thread_001");

    const scarOrSignalTargeted =
      frameState.currentChemTarget === "scar_contamination_plate_001" ||
      frameState.currentChemTarget === "signal_vapor_thread_001";

    const playerNearScar = this.distanceToChemObject("scar_contamination_plate_001") < 4.6;
    const playerNearSignal = this.distanceToChemObject("signal_vapor_thread_001") < 4.6;
    const pressureVisible = playerNearScar || playerNearSignal || scarOrSignalTargeted;
    const pulseAttemptedUnderPressure = Boolean(frameState.input?.pulsePressed) && pressureVisible;

    const ready = continuationReady && pressureVisible;
    const start = ready && (pulseTouchedScarOrSignal || pulseAttemptedUnderPressure);

    let confidence = 0;
    if (hostLanguageReady) confidence += 0.60;
    if (seedAbsorbed) confidence += 0.18;
    if (compositionSettled) confidence += 0.18;
    if (pressureVisible) confidence += 0.26;
    if (pulseTouchedScarOrSignal || pulseAttemptedUnderPressure) confidence += 0.14;
    confidence = Math.max(0, Math.min(1, confidence));

    let reason = "waiting_for_host_language_or_seed_support";
    let nextAction = "complete the Listening Fold, or absorb the safe seed as optional chemistry support";

    if (seedAbsorbed && !compositionSettled && !hostLanguageReady) {
      reason = "composition_settling";
      nextAction = `seed absorbed; Form ${playerForm.toFixed(2)} / Seed ${playerSeed.toFixed(2)} settling`;
    }

    if (hostLanguageReady && !pressureVisible) {
      reason = "host_continuation_revealed_move_near_scar_or_signal";
      nextAction = "follow the revealed scar/signal pressure; the seed is optional nourishment";
    } else if (chemistryContinuationReady && !pressureVisible) {
      reason = "move_near_scar_or_signal";
      nextAction = "move toward scar plate or signal thread";
    }

    if (ready) {
      reason = "ready_pulse_scar_or_signal";
      nextAction = "press Space / X to pulse scar or signal pressure";
    }

    if (start) {
      reason = "pulse_contact_started_no_gate_morph";
      nextAction = "stay in control while the tissue changes";
    }

    if (this.started && !this.completed) {
      reason = "morphing_continuous_control";
      nextAction = "continue moving; pulse scar/signal to stabilize faster";
    }

    if (this.completed) {
      reason = "completed_in_scar_flow_fold";
      nextAction = "test new scar-flow objects and movement feel";
    }

    this.lastTriggerConfidence = confidence;
    this.lastNextAction = nextAction;

    return {
      ready,
      start,
      reason,
      nextAction,
      triggerConfidence: confidence,
      seedAbsorbed,
      formGrowth,
      seedGrowth,
      compositionSettled,
      hostLanguageReady,
      chemistryContinuationReady,
      continuationReady,
      playerForm,
      playerSeed,
      thresholds,
      pressureVisible,
      pulseTouchedScarOrSignal,
      pulseAttemptedUnderPressure,
      playerNearScar,
      playerNearSignal,
      scarOrSignalTargeted
    };
  }

  startMorph(frameState) {
    this.started = true;
    this.phase = "morphing_continuous_control";
    this.progress = Math.max(this.progress, 0.02);
    this.spawnDestinationContent({ dormant: false });
    this.activatePreparedDestination();
    frameState.chemObjectState.pulseResponse = "local_cell_morph_started_without_gate";
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
        objectId: "scar_flow_fold_surface_001",
        visualRecipeId: this.destinationCell.visuals.environmentRecipe,
        position: [0, 0, 0],
        scale: 1
      }),
      this.visualComposer.compose({
        objectId: "scar_pressure_haze_001",
        visualRecipeId: this.destinationCell.visuals.atmosphereRecipe,
        position: [0, 0, 0],
        scale: 1
      })
    ];

    for (const root of this.destinationEnvironment) {
      root.userData.cellId = this.destinationCell.id;
      root.userData.morphRole = "destination_environment";
      root.userData.transitionPrepared = dormant;
      this.setGroupOpacity(root, 0);
      root.visible = !dormant;
    }

    const spawned = this.chemObjectSystem.spawnCellObjects(this.destinationCell, {
      cellId: this.destinationCell.id,
      visible: !dormant,
      opacity: 0,
      avoidExisting: true,
      morphRole: "destination_chem_object"
    });

    for (const item of spawned) {
      item.root.userData.morphRole = "destination_chem_object";
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
    const pulseBoost = trigger.pulseTouchedScarOrSignal || trigger.pulseAttemptedUnderPressure ? 0.08 : 0;
    const targetBoost = trigger.scarOrSignalTargeted ? 0.035 : 0;
    const confidenceBoost = Math.max(0, (trigger.triggerConfidence ?? 0) - 0.6) * 0.055;
    const seedSupportBoost = trigger.seedAbsorbed ? 0.025 : 0;
    const progressRate = 0.20 + pulseBoost + targetBoost + confidenceBoost + seedSupportBoost;
    this.progress = Math.min(1, this.progress + dt * progressRate);
    this.progressHold = progressRate;

    this.applyChemistryBlend(frameState, this.progress);
    this.applyPhysicalBlend(frameState, this.progress);
    this.applyVisualBlend(this.progress, frameState);

    if (this.progress >= 1 && !this.completed) {
      this.completeMorph(frameState);
    }
  }

  applyChemistryBlend(frameState, progress) {
    const from = this.plan.chemistryBlend?.from ?? this.sourceCell.chemistryField;
    const to = this.plan.chemistryBlend?.to ?? this.destinationCell.chemistryField;
    const eased = this.easeInOut(progress);

    frameState.chemistry = {
      ...frameState.chemistry,
      form: this.lerp(from.form, to.form, eased),
      flux: this.lerp(from.flux, to.flux, eased),
      scar: this.lerp(from.scar, to.scar, eased),
      seed: this.lerp(from.seed, to.seed, eased),
      signal: this.lerp(from.signal, to.signal, eased),
      residue: this.lerp(from.residue ?? 0, to.residue ?? 0, eased),
      bloom: this.lerp(from.bloom ?? 0, to.bloom ?? 0, eased),
      inorganic: this.lerp(from.inorganic ?? 0, to.inorganic ?? 0, eased),
      confluence: this.lerp(from.confluence ?? 0, to.confluence ?? 0, eased)
    };
  }

  applyPhysicalBlend(frameState, progress) {
    const from = this.sourceCell.physicalFeel ?? {};
    const to = this.destinationCell.physicalFeel ?? {};
    const eased = this.easeInOut(progress);
    const fromFlow = from.flowVector ?? [0, 0, 0];
    const toFlow = to.flowVector ?? [0, 0, 0];

    frameState.physicalFeel = {
      ...frameState.physicalFeel,
      viscosity: this.lerp(from.viscosity ?? 0.5, to.viscosity ?? 0.5, eased),
      pressure: this.lerp(from.pressure ?? 0, to.pressure ?? 0, eased),
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
    const destinationOpacity = Math.min(1, eased * 1.15);
    // Clear completed nursery bodies early enough that Guide Threshold arrives
    // as a new composition instead of inheriting the entire Surface Wake knot.
    const sourceOpacity = Math.max(0, 1 - Math.min(1, progress * 1.85));

    for (const root of this.destinationEnvironment) {
      this.setGroupOpacity(root, destinationOpacity);
      root.scale.setScalar(0.88 + eased * 0.18 + Math.sin(frameState.runtimeSeconds * 1.1) * 0.01);
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

    for (const objectId of this.sourcePresentationIds) {
      const root = this.visualComposer.scene.getObjectByName(objectId);
      if (root) this.setGroupOpacity(root, sourceOpacity);
    }
  }

  completeMorph(frameState) {
    this.completed = true;
    this.started = false;
    this.phase = "completed_in_scar_flow_fold";
    frameState.activeCellId = this.destinationCell.id;
    frameState.chemObjectState.pulseResponse = "entered_scar_flow_fold_by_morph_not_gate";

    this.chemObjectSystem.setCellObjectVisibility(this.sourceCell.id, false, 0);
    this.chemObjectSystem.setCellObjectVisibility(this.destinationCell.id, true, 1);

    for (const root of this.destinationEnvironment) this.setGroupOpacity(root, 1);
    for (const objectId of this.sourceEnvironmentIds) {
      const entry = this.visualComposer.composedObjects.find((item) => item.root.name === objectId);
      if (entry) this.setGroupOpacity(entry.root, 0.18);
    }
    for (const objectId of this.sourcePresentationIds) {
      const root = this.visualComposer.scene.getObjectByName(objectId);
      if (root) this.setGroupOpacity(root, 0);
    }
  }

  createMorphState(trigger) {
    return {
      planId: this.plan?.id ?? "none",
      sourceCell: this.plan?.sourceCell ?? "none",
      destinationCell: this.plan?.destinationCell ?? "none",
      phase: this.phase,
      progress: this.progress,
      triggerReady: Boolean(trigger.ready),
      triggerReason: trigger.reason ?? "none",
      nextAction: trigger.nextAction ?? this.lastNextAction,
      triggerConfidence: trigger.triggerConfidence ?? this.lastTriggerConfidence,
      deferredToSurfaceWake: Boolean(trigger.deferredToSurfaceWake),
      seedAbsorbed: Boolean(trigger.seedAbsorbed),
      formGrowth: Boolean(trigger.formGrowth),
      seedGrowth: Boolean(trigger.seedGrowth),
      compositionSettled: Boolean(trigger.compositionSettled),
      hostLanguageReady: Boolean(trigger.hostLanguageReady),
      chemistryContinuationReady: Boolean(trigger.chemistryContinuationReady),
      continuationReady: Boolean(trigger.continuationReady),
      seedRouteGateRemoved: true,
      seedSupportActive: Boolean(trigger.seedAbsorbed),
      playerForm: trigger.playerForm ?? 0,
      playerSeed: trigger.playerSeed ?? 0,
      formThreshold: trigger.thresholds?.form ?? 0,
      seedThreshold: trigger.thresholds?.seed ?? 0,
      pressureVisible: Boolean(trigger.pressureVisible),
      pulseTouchedScarOrSignal: Boolean(trigger.pulseTouchedScarOrSignal),
      pulseAttemptedUnderPressure: Boolean(trigger.pulseAttemptedUnderPressure),
      playerNearScar: Boolean(trigger.playerNearScar),
      playerNearSignal: Boolean(trigger.playerNearSignal),
      progressRate: this.progressHold,
      noGate: true,
      continuousControl: true,
      destinationSpawned: this.spawnedDestination,
      destinationPrepared: this.destinationPrepared,
      destinationActivated: this.destinationActivated,
      completed: this.completed,
      transitionContinuityPass: "HC-009F",
      baseProgressRate: 0.20,
      readabilityPass: "HC-008E",
      sourcePresentationFade: "early_decisive_clear_before_guide_threshold"
    };
  }

  distanceToChemObject(id) {
    const item = this.chemObjectSystem.objects.find((candidate) => candidate.recipe.id === id);
    if (!item || item.absorbed || item.root.userData.absorbed) return Number.POSITIVE_INFINITY;
    return this.playerRoot.position.distanceTo(item.root.position);
  }

  setGroupOpacity(root, opacity) {
    root.visible = opacity > 0.01;
    root.traverse((child) => {
      const materials = child.material
        ? Array.isArray(child.material)
          ? child.material
          : [child.material]
        : [];

      for (const material of materials) {
        if (!material) continue;
        if (material.userData.originalOpacity === undefined) {
          material.userData.originalOpacity = material.opacity ?? 1;
        }
        material.transparent = true;
        material.opacity = Math.max(0, Math.min(1, opacity * material.userData.originalOpacity));
        material.needsUpdate = true;
      }
    });
  }

  easeInOut(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
