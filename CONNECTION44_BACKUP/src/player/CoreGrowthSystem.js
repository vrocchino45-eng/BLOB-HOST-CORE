const RECIPE_ID = "FIRST_VISIBLE_CORE_GROWTH_HC009D";
const SAFE_SEED_ID = "dormant_seed_nutrient_001";

/**
 * Owns the first Core-growth truth.
 *
 * SurfaceWakeGameplaySystem owns nursery outcomes and BondSystem owns the
 * protected-seed absorb. This system observes those established truths,
 * retains their history, resolves one reversible chemistry bias, and publishes
 * the player's bodily stage. CoreEmbodimentSystem remains the body-language
 * collaborator and is updated through this single global registry slot.
 */
export class CoreGrowthSystem {
  constructor({
    recipeDataSystem,
    chemObjectSystem,
    playerRoot,
    frameState,
    embodimentSystem
  }) {
    if (!recipeDataSystem) throw new Error("[CoreGrowthSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[CoreGrowthSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[CoreGrowthSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CoreGrowthSystem] frameState is required.");
    if (!embodimentSystem) throw new Error("[CoreGrowthSystem] embodimentSystem is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.embodimentSystem = embodimentSystem;

    this.recipe = null;
    this.growthProgress = 0;
    this.growthTarget = 0;
    this.bias = 0;
    this.biasTarget = 0;
    this.safeSeedAbsorbed = false;
    this.firstGrowthCommitted = false;
    this.nurseryAgencyProven = false;
    this.guidePressureTested = false;
    this.hubReflectionObserved = false;
    this.resolvedCycleCount = 0;
    this.successfulCycleCount = 0;
    this.failedCycleCount = 0;
    this.filteredCycleCount = 0;
    this.tenderFedCount = 0;
    this.coreNourishedCount = 0;
    this.unsafeAbsorbCount = 0;
    this.tenderTrust = 0.32;
    this.tenderIntegrity = 0.72;
    this.scarLoad = 0.22;
    this.lastNurseryOutcome = "none";
    this.surfaceMemoryMode = "unwritten";
    this.surfaceMemoryCommitted = false;
    this.surfaceMemoryEvent = "none";
    this.graveMemoryImprintCommitted = false;
    this.safeMemoryTransferComplete = false;
    this.graveTraceIntegrity = 0;
    this.graveResidueRecoilRisk = 0;
    this.graveResidueRecoilPeak = 0;
    this.graveResidueRecoilRecovered = false;
    this.graveRiskEventCount = 0;
    this.graveRouteReturned = false;
    this.vascularRhythmRetained = false;
    this.vascularRouteReturned = false;
    this.vascularCadenceReads = 0;
    this.vascularSynchronization = 0;
    this.vascularCirculationIntegrity = 0;
    this.vascularDesynchronizationRecovered = false;
    this.siltPressureRetained = false;
    this.siltRouteReturned = false;
    this.siltPressureRead = false;
    this.siltRibsReleased = false;
    this.siltSafeMatterAbsorbed = false;
    this.siltDenseMatterLeftIntact = false;
    this.siltFailureCount = 0;
    this.siltFailureRecovered = false;
    this.siltSettledCompression = 1;
    this.siltMaxDepthProgress = 0;
    this.observedHistorySequences = new Set();
    this.lastStageId = "seed_core";
    this.lastBiasLabel = "balanced_first_binding";
    this.eventSequence = 0;
    this.lastEvent = "growth_waiting_for_lived_consequence";

    // HC024D0 testbed flag. This never changes the authored Grave/Vascular/Silt
    // completion or retention booleans; CoreEmbodimentSystem may only use it to
    // expose test anatomy for fast Core Work iteration.
    this.debugCoreWorkRetainedAnatomySeeded = false;
    this.debugCoreWorkSeedCount = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.firstVisibleCoreGrowth;
    if (!this.recipe || this.recipe.id !== RECIPE_ID) {
      throw new Error(`[CoreGrowthSystem] Missing ${RECIPE_ID}.`);
    }

    this.embodimentSystem.init();
    this.frameState.coreGrowth = this.createState();
  }

  update(dt, frameState = this.frameState) {
    this.captureNurseryHistory(frameState.nurseryCircuit);
    this.captureGraveMemoryHistory(
      frameState.graveMemoryRoute,
      frameState.act1RouteHistory
    );
    this.captureVascularRhythmHistory(
      frameState.vascularRhythmRoute,
      frameState.act1RouteHistory
    );
    this.captureSiltPressureHistory(
      frameState.siltPressureRoute,
      frameState.act1RouteHistory
    );
    this.safeSeedAbsorbed = this.safeSeedAbsorbed || this.detectProtectedSeedAbsorption(frameState);
    this.guidePressureTested = this.guidePressureTested
      || Boolean(frameState.guideThresholdGameplay?.coreGrowthPressureTested);
    this.hubReflectionObserved = this.hubReflectionObserved
      || Boolean(frameState.hubChamberFoundation?.coreGrowthRecognized);

    this.updateBias(Math.max(0, dt), frameState);
    this.growthTarget = this.resolveGrowthTarget();
    const growthRate = this.recipe.growth?.growthRatePerSecond ?? 0.46;
    this.growthProgress = Math.min(
      this.growthTarget,
      this.growthProgress + Math.max(0, dt) * growthRate
    );

    const commitProgress = this.recipe.growth?.commitProgress ?? 0.85;
    this.firstGrowthCommitted = this.firstGrowthCommitted
      || Boolean(
        this.nurseryAgencyProven
        && this.safeSeedAbsorbed
        && this.successfulCycleCount > 0
        && this.growthProgress >= commitProgress
      );

    const stage = this.resolveStage();
    const biasLabel = this.resolveBiasLabel();
    if (stage.id !== this.lastStageId) {
      this.eventSequence += 1;
      this.lastEvent = `core_stage_changed:${this.lastStageId}->${stage.id}`;
      this.lastStageId = stage.id;
    } else if (biasLabel !== this.lastBiasLabel) {
      this.eventSequence += 1;
      this.lastEvent = `soft_bias_shifted:${this.lastBiasLabel}->${biasLabel}`;
      this.lastBiasLabel = biasLabel;
    }

    frameState.coreGrowth = this.createState(stage, biasLabel);
    this.playerRoot.userData.coreGrowthStage = stage.id;
    this.playerRoot.userData.coreGrowthProgress = this.growthProgress;
    this.playerRoot.userData.coreGrowthBias = biasLabel;
    this.playerRoot.userData.surfaceMemoryMode = this.surfaceMemoryMode;
    this.playerRoot.userData.surfaceMemoryCommitted = this.surfaceMemoryCommitted;
    this.playerRoot.userData.graveMemoryImprintCommitted = this.graveMemoryImprintCommitted;
    this.playerRoot.userData.graveMemoryTraceIntegrity = this.graveTraceIntegrity;
    this.playerRoot.userData.vascularRhythmRetained = this.vascularRhythmRetained;
    this.playerRoot.userData.vascularCadenceReads = this.vascularCadenceReads;
    this.playerRoot.userData.siltPressureRetained = this.siltPressureRetained;
    this.playerRoot.userData.siltSelectiveAppetiteRetained = this.siltSafeMatterAbsorbed && this.siltDenseMatterLeftIntact;
    this.playerRoot.userData.growthOwner = "CoreGrowthSystem";

    this.embodimentSystem.update(dt, frameState);
  }

  seedCoreWorkRetainedAnatomyForDebug() {
    this.debugCoreWorkRetainedAnatomySeeded = true;
    this.debugCoreWorkSeedCount += 1;
    this.eventSequence += 1;
    this.lastEvent = "debug_core_work_retained_anatomy_seeded_without_route_progression";
    this.embodimentSystem?.resetCoreWorkRetainedPlacements?.();
    return {
      seeded: true,
      seedCount: this.debugCoreWorkSeedCount,
      routeProgressionMutated: false,
      retainedRouteFlagsMutated: false
    };
  }

  captureNurseryHistory(circuit = {}) {
    this.nurseryAgencyProven = this.nurseryAgencyProven || Boolean(circuit.agencyProven);
    this.resolvedCycleCount = Math.max(this.resolvedCycleCount, circuit.resolvedCycleCount ?? 0);
    this.successfulCycleCount = Math.max(this.successfulCycleCount, circuit.successfulCycleCount ?? 0);
    this.failedCycleCount = Math.max(this.failedCycleCount, circuit.failedCycleCount ?? 0);
    this.tenderFedCount = Math.max(this.tenderFedCount, circuit.tenderFedCount ?? 0);
    this.coreNourishedCount = Math.max(this.coreNourishedCount, circuit.coreNourishedCount ?? 0);

    if (Number.isFinite(circuit.tenderTrust)) this.tenderTrust = circuit.tenderTrust;
    if (Number.isFinite(circuit.tenderIntegrity)) this.tenderIntegrity = circuit.tenderIntegrity;
    if (Number.isFinite(circuit.scarLoad)) this.scarLoad = circuit.scarLoad;
    if (circuit.lastOutcome && circuit.lastOutcome !== "none") {
      this.lastNurseryOutcome = circuit.lastOutcome;
    }

    for (const entry of circuit.history ?? []) {
      const sequence = entry.sequence ?? `${entry.outcome}:${entry.matterType}`;
      if (this.observedHistorySequences.has(sequence)) continue;
      this.observedHistorySequences.add(sequence);
      if (String(entry.outcome).includes("filtered")) this.filteredCycleCount += 1;
      if (entry.outcome === "core_absorbed_scar_contamination") this.unsafeAbsorbCount += 1;

      if (!this.surfaceMemoryCommitted && entry.playerAuthored) {
        const outcome = String(entry.outcome ?? "");
        if (outcome === "core_absorbed_scar_contamination") {
          this.surfaceMemoryMode = "scar_tolerance_trace";
          this.surfaceMemoryEvent = "accepted_unresolved_contamination";
          this.surfaceMemoryCommitted = true;
        } else if (outcome.includes("filtered")) {
          this.surfaceMemoryMode = "filtering_care_trace";
          this.surfaceMemoryEvent = "made_carried_matter_safe_before_commitment";
          this.surfaceMemoryCommitted = true;
        } else if (
          outcome === "core_absorbed_clean_nourishment"
          || outcome === "tender_fed_clean_matter"
        ) {
          this.surfaceMemoryMode = "nutrient_binding_trace";
          this.surfaceMemoryEvent = "committed_clean_matter_without_filtering";
          this.surfaceMemoryCommitted = true;
        }
        if (this.surfaceMemoryCommitted) {
          this.eventSequence += 1;
          this.lastEvent = `surface_anatomical_memory_committed:${this.surfaceMemoryMode}`;
        }
      }
    }
  }

  captureGraveMemoryHistory(route = {}, routeHistory = {}) {
    const wasCommitted = this.graveMemoryImprintCommitted;
    this.safeMemoryTransferComplete = this.safeMemoryTransferComplete
      || Boolean(route.safeMemoryTransferComplete)
      || Boolean(routeHistory.safeMemoryTransferComplete);
    this.graveMemoryImprintCommitted = this.graveMemoryImprintCommitted
      || Boolean(route.graveMemoryImprintCommitted)
      || Boolean(routeHistory.graveMemoryImprintCommitted);
    this.graveRouteReturned = this.graveRouteReturned
      || Boolean(routeHistory.graveReturned);
    if (
      route.graveMemoryImprintCommitted
      && Number.isFinite(route.traceIntegrity)
    ) {
      this.graveTraceIntegrity = route.traceIntegrity;
    } else if (Number.isFinite(routeHistory.graveTraceIntegrity)) {
      this.graveTraceIntegrity = Math.max(
        this.graveTraceIntegrity,
        routeHistory.graveTraceIntegrity
      );
    }
    if (Number.isFinite(route.residueRecoilRisk)) {
      this.graveResidueRecoilRisk = route.residueRecoilRisk;
      this.graveResidueRecoilPeak = Math.max(
        this.graveResidueRecoilPeak,
        route.residueRecoilRisk
      );
    }
    this.graveRiskEventCount = Math.max(
      this.graveRiskEventCount,
      route.riskEventCount ?? routeHistory.graveRiskEventCount ?? 0
    );
    this.graveResidueRecoilRecovered = this.graveResidueRecoilRecovered
      || Boolean(route.residueRecoilRecovered)
      || Boolean(routeHistory.graveResidueRecoilRecovered);

    if (!wasCommitted && this.graveMemoryImprintCommitted) {
      this.eventSequence += 1;
      this.lastEvent = "grave_memory_imprint_committed:reading_not_remains";
    }
  }

  captureVascularRhythmHistory(route = {}, routeHistory = {}) {
    const routeState = routeHistory.routeStates?.vascular_route ?? {};
    const wasRetained = this.vascularRhythmRetained;
    this.vascularRouteReturned = this.vascularRouteReturned
      || Boolean(routeState.returned)
      || Boolean(routeHistory.vascularReturned);
    this.vascularCadenceReads = Math.max(
      this.vascularCadenceReads,
      route.lockedCadenceReads ?? 0,
      routeHistory.vascularCadenceReads ?? 0
    );
    this.vascularSynchronization = Math.max(
      this.vascularSynchronization,
      route.completed ? route.synchronization ?? 0 : 0,
      routeHistory.vascularSynchronization ?? 0
    );
    this.vascularCirculationIntegrity = Math.max(
      this.vascularCirculationIntegrity,
      route.completed ? route.circulationIntegrity ?? 0 : 0,
      routeHistory.vascularCirculationIntegrity ?? 0
    );
    this.vascularDesynchronizationRecovered = this.vascularDesynchronizationRecovered
      || Boolean(route.desynchronizationRecovered)
      || Boolean(routeHistory.vascularDesynchronizationRecovered);
    this.vascularRhythmRetained = this.vascularRhythmRetained || Boolean(
      this.vascularRouteReturned
      && (routeState.completed || routeHistory.vascularCompleted)
      && this.vascularCadenceReads >= 3
    );

    if (!wasRetained && this.vascularRhythmRetained) {
      this.eventSequence += 1;
      this.lastEvent = "vascular_rhythm_retained:cadence_not_reward";
    }
  }

  captureSiltPressureHistory(route = {}, routeHistory = {}) {
    const routeState = routeHistory.routeStates?.silt_burrow_route ?? {};
    const wasRetained = this.siltPressureRetained;
    this.siltRouteReturned = this.siltRouteReturned
      || Boolean(routeState.returned)
      || Boolean(routeHistory.siltReturned);
    this.siltPressureRead = this.siltPressureRead
      || Boolean(route.pressureRead)
      || Boolean(routeHistory.siltPressureRead);
    this.siltRibsReleased = this.siltRibsReleased
      || Boolean(route.ribsReleased)
      || Boolean(routeHistory.siltRibsReleased);
    this.siltSafeMatterAbsorbed = this.siltSafeMatterAbsorbed
      || Boolean(route.safeMatterAbsorbed)
      || Boolean(routeHistory.siltSafeMatterAbsorbed);
    this.siltDenseMatterLeftIntact = this.siltDenseMatterLeftIntact
      || Boolean(route.denseMatterLeftIntact)
      || Boolean(routeHistory.siltDenseMatterLeftIntact);
    this.siltFailureCount = Math.max(
      this.siltFailureCount,
      route.failureCount ?? 0,
      routeHistory.siltFailureCount ?? 0
    );
    this.siltFailureRecovered = this.siltFailureRecovered
      || Boolean(route.failureRecovered)
      || Boolean(routeHistory.siltFailureRecovered);
    if (Number.isFinite(routeHistory.siltSettledCompression)) {
      this.siltSettledCompression = Math.min(this.siltSettledCompression, routeHistory.siltSettledCompression);
    } else if (route.completed && Number.isFinite(route.compression)) {
      this.siltSettledCompression = Math.min(this.siltSettledCompression, route.compression);
    }
    this.siltMaxDepthProgress = Math.max(
      this.siltMaxDepthProgress,
      route.maxDepthProgress ?? 0,
      routeHistory.siltMaxDepthProgress ?? 0
    );
    this.siltPressureRetained = this.siltPressureRetained || Boolean(
      this.siltRouteReturned
      && (routeState.completed || routeHistory.siltCompleted)
      && this.siltPressureRead
      && this.siltRibsReleased
      && this.siltSafeMatterAbsorbed
      && this.siltDenseMatterLeftIntact
    );

    if (!wasRetained && this.siltPressureRetained) {
      this.eventSequence += 1;
      this.lastEvent = "silt_pressure_retained:selective_appetite_not_reward";
    }
  }

  detectProtectedSeedAbsorption(frameState) {
    const seed = this.chemObjectSystem.objects.find((item) => item.recipe.id === SAFE_SEED_ID);
    return Boolean(
      seed?.absorbed
      || seed?.root?.userData?.absorbed
      || (frameState.playerComposition?.seed ?? 0) >= 0.395
    );
  }

  updateBias(dt, frameState) {
    if (!this.nurseryAgencyProven || this.resolvedCycleCount <= 0) {
      this.biasTarget = 0;
    } else {
      const playerScar = Math.max(0, (frameState.playerComposition?.scar ?? 0) - 0.02);
      const careScore =
        this.successfulCycleCount * 0.22
        + this.filteredCycleCount * 0.28
        + this.tenderFedCount * 0.08
        + this.coreNourishedCount * 0.06
        + this.tenderTrust * 0.18
        + this.tenderIntegrity * 0.14;
      const scarScore =
        this.failedCycleCount * 0.18
        + this.unsafeAbsorbCount * 0.32
        + this.scarLoad * 0.28
        + playerScar * 1.8;
      this.biasTarget = this.clamp((careScore - scarScore) / Math.max(0.2, careScore + scarScore), -1, 1);
    }

    const rate = this.recipe.bias?.blendRatePerSecond ?? 2.4;
    const blend = 1 - Math.exp(-dt * rate);
    this.bias += (this.biasTarget - this.bias) * blend;
  }

  resolveGrowthTarget() {
    const growth = this.recipe.growth ?? {};
    if (!this.nurseryAgencyProven) return 0;
    if (this.resolvedCycleCount <= 0 && !this.safeSeedAbsorbed) return 0;
    if (this.successfulCycleCount <= 0) {
      return this.safeSeedAbsorbed
        ? (growth.protectedSeedWithoutSuccessfulCircuitTarget ?? 0.44)
        : (growth.consequenceBudTarget ?? 0.28);
    }
    return this.safeSeedAbsorbed
      ? (growth.protectedSeedAndSuccessfulCircuitTarget ?? 1)
      : (growth.successfulCircuitTarget ?? 0.64);
  }

  resolveStage() {
    const stages = this.recipe.stages ?? {};
    const boundMinimum = stages.bound?.minimumProgress ?? 0.85;
    const emergingMinimum = stages.emerging?.minimumProgress ?? 0.18;
    if (this.growthProgress >= boundMinimum) return stages.bound ?? { id: "binding_core", displayName: "Binding Core" };
    if (this.growthProgress >= emergingMinimum) {
      return stages.emerging ?? { id: "binding_core_emerging", displayName: "Binding Core — emerging" };
    }
    return stages.seed ?? { id: "seed_core", displayName: "Seed Core" };
  }

  resolveBiasLabel() {
    const bias = this.recipe.bias ?? {};
    if (this.bias >= (bias.careThreshold ?? 0.2)) return bias.careLabel ?? "tender_attuned_binding";
    if (this.bias <= (bias.scarThreshold ?? -0.2)) return bias.scarLabel ?? "scar_tempered_binding";
    return bias.balancedLabel ?? "balanced_first_binding";
  }

  movementModifiers() {
    const tuning = this.recipe.movement ?? {};
    const care = Math.max(0, this.bias);
    const scar = Math.max(0, -this.bias);
    const progress = this.growthProgress;
    return {
      pressureResponseMultiplier: 1 - progress * (
        (tuning.maximumPressureResistance ?? 0.18) * (0.58 + care * 0.42 + scar * 0.28)
      ),
      flowCouplingMultiplier: 1 - progress * (
        (tuning.maximumFlowResistance ?? 0.13) * (0.46 + care * 0.3 + scar * 0.54)
      ),
      accelerationMultiplier: 1 + progress * (
        care * (tuning.maximumCareAccelerationGain ?? 0.03)
        - scar * (tuning.maximumScarAccelerationLoss ?? 0.04)
      ),
      dragMultiplier: 1 + progress * (
        scar * (tuning.maximumScarDragGain ?? 0.08)
        - care * (tuning.maximumCareDragReduction ?? 0.03)
      ),
      stabilizeEfficiencyMultiplier: 1 + progress * (
        (tuning.baseStabilizeEfficiencyGain ?? 0.12)
        + care * (tuning.careStabilizeEfficiencyGain ?? 0.12)
      )
    };
  }

  regionRecognition() {
    const regionId = this.frameState.currentMode?.regionId ?? "surface_wake";
    const crossRoom = this.recipe.crossRoom ?? {};
    if (regionId === "guide_threshold") return crossRoom.guideThreshold ?? "Guide Threshold tests the retained shell.";
    if (regionId === "hub_chamber") {
      return this.siltPressureRetained
        ? "The Core and lower Hub tissue now share a retained brace around selective appetite."
        : this.vascularRhythmRetained
        ? "The Hub and the Core now repeat the same retained Vascular cadence."
        : this.graveMemoryImprintCommitted
        ? "The Hub reflects the returned Grave-memory pearl without opening another route."
        : crossRoom.hubChamber ?? "The Hub reflects the retained shell.";
    }
    if (regionId === "grave_memory_route") {
      return this.graveMemoryImprintCommitted
        ? "A settled memory trace has become attached body."
        : "The Grave is testing whether reading can be carried without taking the remains.";
    }
    return crossRoom.surfaceWake ?? "The nursery consequence is becoming body.";
  }

  createState(stage = this.resolveStage(), biasLabel = this.resolveBiasLabel()) {
    const visual = this.recipe?.visual ?? {};
    const siltPlayable = Boolean(
      this.frameState.firstSliceGates?.hub_to_silt_burrow_route?.awake
      && this.frameState.firstSliceGates?.hub_to_silt_burrow_route?.crossable
    );
    return {
      pass: "HC-021F",
      id: this.recipe?.id ?? RECIPE_ID,
      active: true,
      owner: "CoreGrowthSystem",
      bodyLanguageCollaborator: "CoreEmbodimentSystem",
      debugCoreWorkRetainedAnatomySeeded: this.debugCoreWorkRetainedAnatomySeeded,
      debugCoreWorkSeedCount: this.debugCoreWorkSeedCount,
      stageId: stage.id,
      displayStage: stage.displayName,
      growthProgress: this.growthProgress,
      growthTarget: this.growthTarget,
      firstGrowthCommitted: this.firstGrowthCommitted,
      protectedSeedMassIntegrated: this.safeSeedAbsorbed,
      nurseryAgencyProven: this.nurseryAgencyProven,
      growthRequiresPlayerAuthoredNurserySuccess: true,
      nurseryConsequenceRetained: this.resolvedCycleCount > 0,
      resolvedCycleCount: this.resolvedCycleCount,
      successfulCycleCount: this.successfulCycleCount,
      failedCycleCount: this.failedCycleCount,
      filteredCycleCount: this.filteredCycleCount,
      tenderFedCount: this.tenderFedCount,
      coreNourishedCount: this.coreNourishedCount,
      unsafeAbsorbCount: this.unsafeAbsorbCount,
      tenderTrust: this.tenderTrust,
      tenderIntegrity: this.tenderIntegrity,
      scarLoad: this.scarLoad,
      lastNurseryOutcome: this.lastNurseryOutcome,
      chemistryBias: this.bias,
      chemistryBiasTarget: this.biasTarget,
      biasLabel,
      biasReversible: true,
      permanentClass: false,
      visualPalette: {
        care: visual.careColor ?? "#8ff0c5",
        balanced: visual.balancedColor ?? "#b8e9e2",
        scar: visual.scarColor ?? "#e89268"
      },
      visibleShellRestructuring: this.nurseryAgencyProven,
      anatomicalPhase: !this.nurseryAgencyProven
        ? "primitive"
        : !this.guidePressureTested
          ? "membrane_differentiating"
          : !this.hubReflectionObserved
            ? "internal_axis_emerging"
            : "young_organized_core",
      anatomicalGrammar: {
        primitive: ["membrane", "nucleus"],
        surface: "membrane_differentiation",
        guide: "internal_axis_and_locomotor_organization",
        hub: "young_core_organization",
        grave: "retention_memory",
        vascular: "circulation_transport",
        silt: "filtration_boundary"
      },
      anatomicalMemory: {
        pass: "HC-021E",
        surfaceTrace: this.surfaceMemoryMode,
        surfaceTraceCommitted: this.surfaceMemoryCommitted,
        surfaceTraceCause: this.surfaceMemoryEvent,
        graveTrace: this.graveMemoryImprintCommitted ? "retention_memory" : "unwritten",
        vascularTrace: this.vascularRhythmRetained ? "circulation_transport" : "unwritten",
        siltTrace: this.siltPressureRetained ? "filtration_boundary" : "unwritten",
        retainedTraceCount: [
          this.surfaceMemoryCommitted,
          this.graveMemoryImprintCommitted,
          this.vascularRhythmRetained,
          this.siltPressureRetained
        ].filter(Boolean).length,
        gameplayAuthority: false,
        abilityUnlockAuthority: false,
        memoryRule: "lived choices leave subtle anatomy; route memories later interconnect that anatomy"
      },
      retainedAnatomyCount: [
        this.graveMemoryImprintCommitted,
        this.vascularRhythmRetained,
        this.siltPressureRetained
      ].filter(Boolean).length,
      hubBranchIntegrationComplete: Boolean(
        this.graveMemoryImprintCommitted
        && this.vascularRhythmRetained
        && this.siltPressureRetained
      ),
      regionalRhythm: {
        grave: {
          emphasis: "read_and_retain_what_remains",
          grammar: ["Pulse:read_remnant", "Stabilize:preserve_trace", "Absorb:commit_only_transferable_memory"]
        },
        vascular: {
          emphasis: "read_timing_and_maintain_relationship_in_motion",
          grammar: ["Pulse:read_cadence", "Stabilize:synchronize_flow", "Absorb:commit_only_free_carried_matter"]
        },
        silt: {
          emphasis: "read_pressure_sort_and_commit_selectively",
          grammar: ["Pulse:read_density_pressure", "Stabilize:release_or_settle", "Absorb:commit_safe_matter_leave_dense_structure"]
        }
      },
      anatomicalIntegration: {
        pass: "HC-021F",
        retentionFeedsFromCirculation: Boolean(this.graveMemoryImprintCommitted && this.vascularRhythmRetained),
        circulationFeedsFiltration: Boolean(this.vascularRhythmRetained && this.siltPressureRetained),
        filtrationProtectsRetention: Boolean(this.siltPressureRetained && this.graveMemoryImprintCommitted),
        organismIntegrated: Boolean(
          this.graveMemoryImprintCommitted
          && this.vascularRhythmRetained
          && this.siltPressureRetained
        ),
        integrationRule: "retention, circulation, and filtration visibly couple; they are not independent route badges",
        gameplayAuthority: false
      },
      futureEvolutionPolicy: "modify_and_interconnect_existing_anatomy_before_adding_new_decorative_structure",
      objectDefiningRings: false,
      movementModifiers: this.movementModifiers(),
      activeRegionId: this.frameState.currentMode?.regionId ?? "surface_wake",
      regionRecognition: this.regionRecognition(),
      guidePressureTested: this.guidePressureTested,
      hubReflectionObserved: this.hubReflectionObserved,
      graveMemoryImprintCommitted: this.graveMemoryImprintCommitted,
      safeMemoryTransferComplete: this.safeMemoryTransferComplete,
      graveMemoryTraceIntegrity: this.graveTraceIntegrity,
      graveResidueRecoilRisk: this.graveResidueRecoilRisk,
      graveResidueRecoilPeak: this.graveResidueRecoilPeak,
      graveResidueRecoilRecovered: this.graveResidueRecoilRecovered,
      graveRiskEventCount: this.graveRiskEventCount,
      graveRouteReturned: this.graveRouteReturned,
      visibleGraveMemoryPearl: this.graveMemoryImprintCommitted,
      graveMemoryImprintPermanentClass: false,
      graveMemoryAbilityUnlocks: [],
      vascularRhythmRetained: this.vascularRhythmRetained,
      vascularRouteReturned: this.vascularRouteReturned,
      vascularCadenceReads: this.vascularCadenceReads,
      vascularSynchronization: this.vascularSynchronization,
      vascularCirculationIntegrity: this.vascularCirculationIntegrity,
      vascularDesynchronizationRecovered: this.vascularDesynchronizationRecovered,
      visibleVascularReturnFilament: this.vascularRhythmRetained,
      vascularReturnConsequencePass: "HC-011B",
      siltPressureRetained: this.siltPressureRetained,
      siltRouteReturned: this.siltRouteReturned,
      siltPressureRead: this.siltPressureRead,
      siltRibsReleased: this.siltRibsReleased,
      siltSafeMatterAbsorbed: this.siltSafeMatterAbsorbed,
      siltDenseMatterLeftIntact: this.siltDenseMatterLeftIntact,
      siltFailureCount: this.siltFailureCount,
      siltFailureRecovered: this.siltFailureRecovered,
      siltSettledCompression: this.siltSettledCompression,
      siltMaxDepthProgress: this.siltMaxDepthProgress,
      visibleSiltPressureAdaptation: this.siltPressureRetained,
      siltReturnConsequencePass: "HC-012B",
      siltPressurePermanentClass: false,
      siltPressureAbilityUnlocks: [],
      vascularRhythmPermanentClass: false,
      vascularRhythmAbilityUnlocks: [],
      eventSequence: this.eventSequence,
      lastEvent: this.lastEvent,
      abilityUnlocks: [],
      directTriggerCompletion: false,
      directObjectiveCompletion: false,
      directGateMutation: false,
      destinationChanged: false,
      nextAction: this.siltPressureRetained
        ? "Grave Memory, Vascular Rhythm, and Silt Pressure are retained together; return to the Hub center and observe their separate readings."
        : this.vascularRhythmRetained
        ? siltPlayable
          ? "The shared Vascular cadence is retained; the lower Silt body now accepts a separate pressure reading."
          : "The shared Vascular cadence is retained as body and Hub memory; Silt remains awake but closed."
        : this.graveMemoryImprintCommitted
        ? this.graveRouteReturned
          ? "The Hub can now read the attached Grave-memory pearl; no new route opens from it."
          : "Let the memory pearl settle, then carry it through the existing return fold."
        : this.firstGrowthCommitted
        ? "Carry the retained Binding Core form into the next living system."
        : this.successfulCycleCount > 0 && !this.safeSeedAbsorbed
          ? "Complete the existing Fold lesson and absorb the protected seed so the new shell can bind."
          : this.resolvedCycleCount > 0
            ? "Recover or nourish the nursery; the Core is beginning to answer."
            : "Live through a nursery cycle so the Core has something to become."
    };
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
