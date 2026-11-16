export class OpeningPacingSystem {
  constructor({ recipeDataSystem, chemObjectSystem, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[OpeningPacingSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[OpeningPacingSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[OpeningPacingSystem] playerRoot is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.config = null;
    this.seedBaseScale = null;
    this.seedPositionApplied = false;
  }

  init() {
    this.config = this.recipeDataSystem.data.openingFlowTuning ?? this.defaultConfig();
    this.frameState.openingFlow = this.createState("initialized");

    const debugDefault = this.config.debugDefaultMode ?? "compact";
    if (this.frameState.debugDisplay && this.frameState.debugDisplay.changedBy === "default") {
      this.frameState.debugDisplay.mode = debugDefault;
      this.frameState.debugDisplay.changedBy = "opening_flow_default";
    }
  }

  update(_dt, frameState) {
    const stage = this.computeStage(frameState);
    const seedState = this.updateSeedReadabilityCue(frameState);
    const progress = this.computeRequiredMinuteProgress(frameState, stage);

    frameState.openingFlow = {
      ...this.createState(stage),
      active: true,
      stage,
      stageLabel: this.stageLabel(stage),
      firstMinuteProgress: progress,
      safeSeedVisible: seedState.visible,
      safeSeedDistance: seedState.distance,
      safeSeedCue: seedState.cue,
      preferredTargetId: stage === "find_safe_seed" ? this.config.safeSeedTuning?.objectId ?? "dormant_seed_nutrient_001" : "none",
      preferredTargetBoost: stage === "find_safe_seed" ? this.config.safeSeedTuning?.focusBoost ?? 12 : 0,
      promptMinHoldSeconds: this.promptHoldSeconds(stage),
      cameraBias: this.cameraBias(frameState, stage),
      worldFacingObjective: stage === "choose_hub_route"
        ? frameState.hubInvestigationGameplay?.nextAction ?? this.objectiveForStage(stage)
        : this.objectiveForStage(stage),
      debugNote: "HC-003F cleans blueprint translation/readouts only; it does not add cells, gates, or new morphs."
    };
  }

  createState(stage) {
    return {
      pass: "HC-003F",
      active: false,
      mode: this.config?.mode ?? "first_playable_minute_trim",
      stage,
      stageLabel: this.stageLabel(stage),
      requiredFirstMinuteCells: this.config?.requiredFirstMinuteCells ?? [],
      beyondMinuteCells: this.config?.beyondMinuteCells ?? [],
      targetDurationSeconds: this.config?.targetDurationSeconds ?? 90,
      firstMinuteBoundary: "Membrane Nursery → Scar-Flow Fold → Signal Chorus Nerve",
      bloomResidueRole: "beyond-minute optional fork",
      promptMinHoldSeconds: this.config?.guidePromptCadence?.minHoldSeconds ?? 2.8,
      preferredTargetId: "none",
      preferredTargetBoost: 0,
      safeSeedVisible: false,
      safeSeedDistance: 0,
      safeSeedCue: "inactive",
      firstMinuteProgress: 0,
      cameraBias: this.config?.openingCamera ?? {},
      worldFacingObjective: "Move, pulse, and listen.",
      noDialogueTree: true,
      noQuestLog: true,
      noGates: true
    };
  }

  computeStage(frameState) {
    const activeCellId = frameState.activeCellId ?? "none";
    const seedAbsorbed = this.isSeedAbsorbed();
    const surfaceWake = frameState.surfaceWakeLayeredInteraction ?? {};
    const surfaceWakeGameplay = frameState.surfaceWakeGameplay ?? {};
    const hostContinuation = surfaceWakeGameplay.hostContinuationInvitation ?? {};
    const nurseryCircuit = frameState.nurseryCircuit ?? {};

    if (
      activeCellId === "CELL_MEMBRANE_NURSERY_001"
      && nurseryCircuit.materialPassage?.state !== "open"
      && !hostContinuation.open
    ) {
      return "live_nursery_cycle";
    }
    if (activeCellId === "CELL_MEMBRANE_NURSERY_001" && !surfaceWake.completed) return "read_surface_wake";
    if (!seedAbsorbed && activeCellId === "CELL_MEMBRANE_NURSERY_001" && !hostContinuation.open) return "find_safe_seed";

    const firstMorph = frameState.localCellMorph ?? {};
    if (activeCellId === "CELL_MEMBRANE_NURSERY_001") {
      if (firstMorph.triggerReady || firstMorph.phase === "waiting_for_pulse" || firstMorph.phase === "ready_for_pulse") {
        return "pulse_first_fold";
      }
      return "read_scar_response";
    }

    if (activeCellId === "CELL_SCAR_FLOW_FOLD_001") return "stabilize_scar_flow";
    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001") {
      return "choose_hub_route";
    }
    if (activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") return "beyond_minute_fork";
    return "unknown";
  }

  updateSeedReadabilityCue(frameState) {
    const seedId = this.config.safeSeedTuning?.objectId ?? "dormant_seed_nutrient_001";
    const seed = this.chemObjectSystem.objects.find((item) => item.recipe.id === seedId);

    if (!seed || seed.absorbed || seed.root.userData.absorbed) {
      return { visible: false, distance: 0, cue: "absorbed_or_missing" };
    }

    if (!this.seedPositionApplied) {
      const position = this.config.safeSeedTuning?.preferredOpeningPosition;
      if (Array.isArray(position) && position.length >= 3) {
        seed.root.position.set(position[0], position[1], position[2]);
      }
      this.seedPositionApplied = true;
    }

    if (!this.seedBaseScale) {
      this.seedBaseScale = seed.root.scale.clone();
    }

    const routeReadable = Boolean(
      frameState.surfaceWakeLayeredInteraction?.completed
      && frameState.surfaceWakeGameplay?.hostContinuationInvitation?.open
    );
    const shouldCue = frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001"
      && Boolean(frameState.surfaceWakeLayeredInteraction?.completed)
      && !this.isSeedAbsorbed()
      && !routeReadable;
    if (shouldCue) {
      const t = frameState.runtimeSeconds ?? 0;
      const pulseScale = this.config.safeSeedTuning?.readabilityPulseScale ?? 0.06;
      const pulse = 1 + Math.sin(t * 3.6) * pulseScale;
      seed.root.scale.copy(this.seedBaseScale).multiplyScalar(pulse);
      seed.root.userData.openingPacingCue = "safe_seed_first_minute";
    } else if (this.seedBaseScale) {
      seed.root.scale.copy(this.seedBaseScale);
      seed.root.userData.openingPacingCue = "inactive";
    }

    const distance = this.playerRoot.position.distanceTo(seed.root.position);
    return {
      visible: seed.root.visible,
      distance,
      cue: shouldCue
        ? "safe_seed_warm_readability_pulse"
        : routeReadable && !this.isSeedAbsorbed()
          ? "optional_seed_available_not_route_gate"
          : "inactive"
    };
  }

  computeRequiredMinuteProgress(frameState, stage) {
    if (stage === "live_nursery_cycle") {
      return 0.02 + Math.min(frameState.nurseryCircuit?.agencyProgress ?? 0, 1) * 0.11;
    }
    if (stage === "read_surface_wake") return 0.14 + Math.min(frameState.surfaceWakeLayeredInteraction?.progress ?? 0, 1) * 0.15;
    if (stage === "find_safe_seed") return 0.3;
    if (stage === "read_scar_response") return 0.36;
    if (stage === "pulse_first_fold") return 0.42;
    if (stage === "stabilize_scar_flow") {
      const guideProgress = Math.max(
        frameState.guideThresholdGameplay?.familiarity ?? 0,
        frameState.guideThresholdLayeredInteraction?.progress ?? 0,
        frameState.secondLocalCellMorph?.progress ?? 0
      );
      return 0.48 + Math.min(guideProgress, 1) * 0.2;
    }
    if (stage === "choose_hub_route") {
      return frameState.firstMinuteExperience?.complete ? 1 : 0.7;
    }
        if (stage === "hold_hub_convergence") return 0.98;
    if (stage === "first_slice_locked") return 1;
    if (stage === "beyond_minute_fork") return 1;
    return 0;
  }

  cameraBias(frameState, stage) {
    const camera = this.config.openingCamera ?? {};
    const manualLook = Math.abs(frameState.input?.cameraLookX ?? 0) + Math.abs(frameState.input?.cameraLookY ?? 0) > 0.01;
    const withinBiasWindow = (frameState.runtimeSeconds ?? 0) <= (camera.autoBiasSeconds ?? 8);

    return {
      ...camera,
      active: (
        stage === "live_nursery_cycle"
        || stage === "read_surface_wake"
        || stage === "find_safe_seed"
      ) && withinBiasWindow && (!manualLook || camera.doNotOverrideManualLook !== true),
      reason: stage === "live_nursery_cycle"
        ? "surface_wake_living_current_composition"
        : stage === "read_surface_wake"
          ? "surface_wake_listening_fold_composition"
          : "first_seed_camera_composition"
    };
  }

  promptHoldSeconds(stage) {
    if (stage === "live_nursery_cycle") return 1.45;
    if (stage === "read_surface_wake") return 2.2;
    if (stage === "find_safe_seed") return this.config.guidePromptCadence?.earlySeedHoldSeconds ?? 3.4;
    return this.config.guidePromptCadence?.minHoldSeconds ?? 2.8;
  }

  objectiveForStage(stage) {
    if (stage === "live_nursery_cycle") return "Read the moving matter and change it until the membrane opens.";
    if (stage === "read_surface_wake") return "Approach the listening fold, pulse-read it, sustain resonance, then release.";
    if (stage === "find_safe_seed") return "Drift to the safe seed and hold absorb.";
    if (stage === "read_scar_response") return "Follow the Host's scar/signal pressure and pulse it; the safe seed is nourishment, not a route gate.";
    if (stage === "pulse_first_fold") return "Pulse when the tissue answers.";
    if (stage === "stabilize_scar_flow") return "Read memory, follow pressure, respect the clot.";
    if (stage === "choose_hub_route") return "Approach an available route body and press A / E to enter. Readings are optional.";
    if (stage === "hold_hub_convergence") return "Hold the completed Hub reading while Grave Memory becomes crossable.";
    if (stage === "first_slice_locked") return "Living Core vertical slice complete. Grave Memory remains the only crossable route; two mounted rhythms wait beyond it.";
    if (stage === "beyond_minute_fork") return "Bloom Residue is beyond the opening minute.";
    return "Move, pulse, and listen.";
  }

  isSeedAbsorbed() {
    const seedId = this.config.safeSeedTuning?.objectId ?? "dormant_seed_nutrient_001";
    const seed = this.chemObjectSystem.objects.find((item) => item.recipe.id === seedId);
    return Boolean(seed?.absorbed || seed?.root.userData.absorbed || (this.frameState.chemObjectState?.absorbedObjects ?? 0) > 0);
  }

  stageLabel(stage) {
    const labels = {
      live_nursery_cycle: "Alter one living nursery cycle",
      read_surface_wake: "Learn the Surface Wake response",
      find_safe_seed: "Find the safe seed",
      read_scar_response: "Read the scar response",
      pulse_first_fold: "Pulse the first tissue fold",
      stabilize_scar_flow: "Stabilize Scar-Flow",
      choose_hub_route: "Choose a Hub destination",
      hold_hub_convergence: "Hold the Hub convergence",
      first_slice_locked: "Living Core vertical slice locked",
      beyond_minute_fork: "Beyond-minute fork",
      initialized: "Opening flow initialized",
      unknown: "Opening flow unknown"
    };
    return labels[stage] ?? stage;
  }

  defaultConfig() {
    return {
      id: "OPENING_FLOW_TUNING_RUNTIME_DEFAULT",
      mode: "first_playable_minute_trim",
      requiredFirstMinuteCells: ["CELL_MEMBRANE_NURSERY_001", "CELL_SCAR_FLOW_FOLD_001", "CELL_SIGNAL_CHORUS_NERVE_001"],
      beyondMinuteCells: ["CELL_BLOOM_RESIDUE_FORK_001"],
      targetDurationSeconds: 90,
      debugDefaultMode: "compact",
      guidePromptCadence: { minHoldSeconds: 2.8, earlySeedHoldSeconds: 3.4 },
      openingCamera: { autoBiasSeconds: 8, yaw: 0.1, pitch: 0.3, distance: 7.75, doNotOverrideManualLook: true },
      safeSeedTuning: { objectId: "dormant_seed_nutrient_001", focusBoost: 12, readabilityPulseScale: 0.06 }
    };
  }
}
