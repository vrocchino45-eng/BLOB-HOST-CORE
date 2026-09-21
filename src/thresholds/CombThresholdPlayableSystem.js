import * as THREE from "three";

const RECIPE_ID = "COMB_THRESHOLD_PLAYABLE_PROOF_HC013B";
const COMB_CELL_ID = "CELL_COMB_THRESHOLD_FILTER_001";

/**
 * HC-013B owns only the playable synthesis logic inside the mounted Comb organ.
 * PlayerMovementController still owns motion, ObjectiveSystem observes completion,
 * LocalCellBoundaryMorphSystem owns history and crossings, and CombThresholdFoundationSystem owns all
 * threshold anatomy. No hard gate, teleport, new verb, entity, or combat rule is added.
 */
export class CombThresholdPlayableSystem {
  constructor({ recipeDataSystem, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[CombThresholdPlayableSystem] recipeDataSystem is required.");
    if (!playerRoot) throw new Error("[CombThresholdPlayableSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CombThresholdPlayableSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.entryAnchor = new THREE.Vector3();
    this.localPlayer = new THREE.Vector3();
    this.bandCompleted = [];

    this.active = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.coherence = 0;
    this.pathProgress = 0;
    this.maxDepthProgress = 0;
    this.currentBandIndex = 0;
    this.successfulReadCount = 0;
    this.offBeatPulseCount = 0;
    this.unbracedPulseCount = 0;
    this.memoryDriftEvents = 0;
    this.recoverySeconds = 0;
    this.completed = false;
    this.completionFrame = 0;
    this.apertureRevealProgress = 0;
    this.apertureRevealWitnessed = false;
    this.membraneStabilizeProgress = 0;
    this.membraneReady = false;
    this.lastPulseEventId = -1;
    this.lastInteraction = "none";
    this.warning = "none";
  }

  init() {
    this.recipe = this.recipeDataSystem.data.combThresholdPlayable;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[CombThresholdPlayableSystem] Missing ${RECIPE_ID}.`);
    }
    const count = this.recipe.interaction?.requiredFilterReads ?? 6;
    this.bandCompleted = Array.from({ length: count }, () => false);
    this.coherence = this.recipe.interaction?.startingCoherence ?? 0.24;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.publish(frameState, false);
    return {
      status: "comb_threshold_playable_prepared_logic_only",
      activeCellId: frameState.activeCellId,
      mutatesProgression: false,
      createsSceneObjects: 0
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.elapsed = 0;
    const authoredEntry = frameState.combThresholdFoundation?.entryPosition;
    if (authoredEntry) this.entryAnchor.set(authoredEntry.x ?? 0, authoredEntry.y ?? 0, authoredEntry.z ?? 0);
    else this.entryAnchor.copy(this.playerRoot.position);

    const history = frameState.act1RouteHistory ?? {};
    if (history.combThresholdPlayableCompleted) {
      this.completed = true;
      this.bandCompleted.fill(true);
      this.successfulReadCount = this.bandCompleted.length;
      this.coherence = Math.max(
        this.recipe.interaction?.minimumCoherenceForFinalRead ?? 0.7,
        history.combThresholdCoherence ?? 1
      );
      this.apertureRevealProgress = 1;
      this.apertureRevealWitnessed = true;
      this.membraneStabilizeProgress = 1;
      this.membraneReady = true;
      this.completionFrame = history.combThresholdCompletionFrame ?? 0;
      this.lastInteraction = "returned_to_completed_comb_synthesis";
    } else {
      this.lastInteraction = "entered_comb_synthesis_without_forced_relocation";
    }
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.lastInteraction = "comb_synthesis_unmounted";
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== COMB_CELL_ID) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    const safeDt = Math.max(0, dt);
    this.elapsed += safeDt;
    this.samplePlayer();
    this.updateSynthesis(safeDt, frameState);
    this.publish(frameState, true);
  }

  samplePlayer() {
    this.localPlayer.copy(this.playerRoot.position).sub(this.entryAnchor);
    const finalZ = Math.abs(this.recipe.interaction?.finalSealZ ?? -10.25);
    this.pathProgress = THREE.MathUtils.clamp(Math.max(0, -this.localPlayer.z) / Math.max(0.01, finalZ), 0, 1);
    this.maxDepthProgress = Math.max(this.maxDepthProgress, this.pathProgress);

    const bands = this.recipe.interaction?.filterBandZ ?? [];
    // HC-014G: Comb reads are an authored sequence, not a nearest-unfinished hunt.
    // The first incomplete band is the sole gameplay/visual/prompt authority. This
    // prevents a player from skipping an earlier band, earning a later one, then
    // being told (incorrectly) that read-count + 1 is the missing destination.
    const firstIncompleteIndex = this.bandCompleted.findIndex((complete) => !complete);
    this.currentBandIndex = firstIncompleteIndex >= 0
      ? firstIncompleteIndex
      : Math.max(0, bands.length - 1);
  }

  updateSynthesis(dt, frameState) {
    const interaction = this.recipe.interaction ?? {};
    const input = frameState.input ?? {};
    const bands = interaction.filterBandZ ?? [];
    const requiredReads = interaction.requiredFilterReads ?? bands.length;
    const currentBandZ = bands[this.currentBandIndex] ?? -2;
    const bandDistance = Math.abs(this.localPlayer.z - currentBandZ);
    const authoredBandRange = this.currentBandIndex === Math.max(0, requiredReads - 1)
      ? (interaction.finalBandRange ?? interaction.bandRange ?? 0.7)
      : (interaction.bandRange ?? 0.7);
    // HC-014G: an active filter may never overlap the center-domain of an
    // adjacent filter. Cap the authored range to just under half the nearest
    // neighbor spacing so one physical position cannot satisfy two reads.
    const neighborDistances = [];
    if (this.currentBandIndex > 0) neighborDistances.push(Math.abs(currentBandZ - bands[this.currentBandIndex - 1]));
    if (this.currentBandIndex + 1 < bands.length) neighborDistances.push(Math.abs(bands[this.currentBandIndex + 1] - currentBandZ));
    const nearestNeighborSpacing = neighborDistances.length ? Math.min(...neighborDistances) : Number.POSITIVE_INFINITY;
    const nonOverlapRange = Number.isFinite(nearestNeighborSpacing)
      ? Math.max(0.2, nearestNeighborSpacing * 0.5 - 0.02)
      : authoredBandRange;
    const currentBandRange = Math.min(authoredBandRange, nonOverlapRange);
    const inBand = Boolean(
      this.successfulReadCount < requiredReads
      && bandDistance <= currentBandRange
    );
    const radialDistance = Math.hypot(this.localPlayer.x, this.localPlayer.y);
    const memoryCentered = radialDistance <= (interaction.memoryCenterRadius ?? 1.02);
    const stabilizing = Boolean(input.stabilizeHeld);
    const cadencePhase = (this.elapsed % (interaction.cadencePeriodSeconds ?? 1.62))
      / Math.max(0.01, interaction.cadencePeriodSeconds ?? 1.62);
    const cadenceSignal = Math.cos(cadencePhase * Math.PI * 2);
    const cadenceOpen = cadenceSignal >= (interaction.cadenceOpenThreshold ?? 0.46);
    const compression = THREE.MathUtils.clamp((1 - cadenceSignal) * 0.5, 0, 1);
    const pulseEventId = input.pulseEventId ?? (input.pulsePressed ? (frameState.frame ?? 0) : -1);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) this.lastPulseEventId = pulseEventId;

    if (!this.completed && inBand) {
      if (memoryCentered && stabilizing) {
        this.coherence += dt * (interaction.centeredStabilizeRecoveryPerSecond ?? 0.075);
        this.recoverySeconds += dt;
      } else {
        if (!memoryCentered) {
          this.coherence -= dt * (interaction.memoryDriftLossPerSecond ?? 0.045);
        }
        if (!stabilizing && compression > 0.52) {
          this.coherence -= dt * (interaction.unbracedCompressionLossPerSecond ?? 0.055) * compression;
        }
      }
    }

    if (!this.completed && freshPulse && inBand) {
      if (memoryCentered && stabilizing && cadenceOpen) {
        this.bandCompleted[this.currentBandIndex] = true;
        this.successfulReadCount = this.bandCompleted.filter(Boolean).length;
        this.coherence += interaction.successfulReadGain ?? 0.145;
        this.lastInteraction = `mixed_filter_read_${this.currentBandIndex + 1}_held`;
        this.warning = "none";
      } else {
        this.coherence -= interaction.failedPulseLoss ?? 0.07;
        if (!memoryCentered) {
          this.memoryDriftEvents += 1;
          this.warning = "grave_memory_line_drifted_move_toward_center";
        } else if (!stabilizing) {
          this.unbracedPulseCount += 1;
          this.warning = "silt_pressure_unbraced_hold_stabilize";
        } else {
          this.offBeatPulseCount += 1;
          this.warning = "vascular_opening_missed_wait_for_teeth_to_relax";
        }
        this.lastInteraction = "recoverable_mixed_read_miss";
      }
    }

    // HC-014D: the visible Aperture-facing seal is the only synthesis target.
    // CombThresholdFoundationSystem owns its physical position and publishes the
    // true 3D player distance/range; do not maintain a second hidden Z-only zone.
    const foundation = frameState.combThresholdFoundation ?? {};
    const foundationDistanceAvailable = Number.isFinite(foundation.apertureSealDistance);
    const legacySealZ = interaction.finalSealZ ?? -10.25;
    const sealDistance = foundationDistanceAvailable
      ? foundation.apertureSealDistance
      : Math.abs(this.localPlayer.z - legacySealZ);
    const sealRange = foundationDistanceAvailable
      ? (foundation.apertureSealReadRange ?? foundation.apertureSealInteractionRange ?? 2.15)
      : (interaction.finalSealRange ?? 1.15);
    const atFinalSeal = Boolean((foundation.active !== false) && sealDistance <= sealRange);
    const readsComplete = this.successfulReadCount >= requiredReads;
    const minimumFinalCoherence = interaction.minimumCoherenceForFinalRead ?? 0.7;

    // HC-014I: once all six authored reads are earned, the membrane itself must
    // provide the recovery promised by its prompt. HC-014H could deadlock here:
    // coherence softened below the final threshold during earlier recoverable
    // misses, but post-6/6 the player was no longer inside an active filter band,
    // so holding Stabilize at the visible seal could never restore coherence.
    // Recover coherence only while physically inside the foundation-owned seal
    // and holding Stabilize; do not change read order, trigger radius, or crossing.
    const membraneCoherenceRecovering = Boolean(
      !this.completed
      && readsComplete
      && atFinalSeal
      && stabilizing
      && this.coherence < minimumFinalCoherence
    );
    if (membraneCoherenceRecovering) {
      const recoveryPerSecond = interaction.finalMembraneCoherenceRecoveryPerSecond ?? 0.28;
      this.coherence = Math.min(minimumFinalCoherence, this.coherence + dt * recoveryPerSecond);
      this.recoverySeconds += dt;
      this.lastInteraction = "final_membrane_coherence_recovering";
      this.warning = "none";
    }
    const coherenceReady = this.coherence >= minimumFinalCoherence;

    // HC-014E: the six filter reads already prove cadence. The final membrane is
    // a readable physical handshake, not a seventh hidden timing test. Once all
    // reads are earned, entering the visible seal and holding Stabilize settles
    // the membrane; the next fresh Pulse completes synthesis regardless of cadence.
    const handshakeSeconds = interaction.finalMembraneStabilizeSeconds ?? 0.55;
    if (!this.completed && readsComplete && atFinalSeal && stabilizing && coherenceReady) {
      this.membraneStabilizeProgress = Math.min(1, this.membraneStabilizeProgress + dt / Math.max(0.1, handshakeSeconds));
    } else if (!this.completed) {
      this.membraneStabilizeProgress = Math.max(0, this.membraneStabilizeProgress - dt * 0.9);
    }
    this.membraneReady = Boolean(
      !this.completed && readsComplete && atFinalSeal && stabilizing && coherenceReady && this.membraneStabilizeProgress >= 1
    );

    if (!this.completed && freshPulse && readsComplete) {
      if (this.membraneReady) {
        this.completed = true;
        this.completionFrame = frameState.frame ?? 0;
        this.lastInteraction = "final_membrane_handshake_complete_first_field_view_dilating";
        this.warning = "none";
      } else {
        this.lastInteraction = "final_membrane_waiting_for_readable_handshake";
        this.warning = !atFinalSeal
          ? "move_into_visible_aperture_membrane"
          : !coherenceReady
            ? "coherence_softened_hold_center_and_stabilize_to_recover"
            : !stabilizing
              ? "hold_stabilize_to_settle_membrane"
              : "hold_stabilize_until_membrane_ready";
      }
    }

    const minimum = interaction.minimumCoherenceAfterError ?? 0.12;
    this.coherence = THREE.MathUtils.clamp(this.coherence, minimum, 1);

    if (this.completed) {
      this.apertureRevealProgress = Math.min(
        1,
        this.apertureRevealProgress + dt / Math.max(0.1, interaction.finalRevealSeconds ?? 2.2)
      );
      if (this.apertureRevealProgress >= 0.82) this.apertureRevealWitnessed = true;
    }

    this.currentReadState = {
      inBand,
      bandDistance,
      currentBandRange,
      memoryCentered,
      radialDistance,
      stabilizing,
      cadencePhase,
      cadenceSignal,
      cadenceOpen,
      compression,
      atFinalSeal,
      sealDistance,
      sealRange,
      foundationDistanceAvailable,
      readsComplete,
      coherenceReady,
      membraneCoherenceRecovering,
      membraneStabilizeProgress: this.membraneStabilizeProgress,
      membraneReady: this.membraneReady
    };
  }

  publish(frameState, active) {
    const interaction = this.recipe?.interaction ?? {};
    const state = this.currentReadState ?? {};
    const requiredReads = interaction.requiredFilterReads ?? 6;
    const complete = Boolean(this.completed && this.apertureRevealWitnessed);
    const targetBand = Math.min(this.currentBandIndex + 1, requiredReads);
    const targetBandZ = interaction.filterBandZ?.[this.currentBandIndex] ?? null;
    const activeBandDirection = !active || state.readsComplete || targetBandZ == null
      ? "none"
      : this.localPlayer.z < targetBandZ - (state.currentBandRange ?? interaction.bandRange ?? 0.7)
        ? "back"
        : this.localPlayer.z > targetBandZ + (state.currentBandRange ?? interaction.bandRange ?? 0.7)
          ? "deeper"
          : "hold";

    let stage = "comb_threshold_playable_inactive";
    let nextAction = "Enter Comb Threshold after the Hub convergence.";
    if (active) {
      if (complete) {
        stage = "first_field_view_held_aperture_unmounted";
        nextAction = "Witness the first-field view, then use the three-part fold to return to the Hub.";
      } else if (this.completed) {
        stage = "aperture_view_dilating";
        nextAction = "Hold position while the living seal dilates into the first-field view.";
      } else if (state.readsComplete) {
        stage = state.atFinalSeal ? "final_synthesis_read_ready" : "move_to_aperture_seal";
        nextAction = state.atFinalSeal
          ? (state.membraneReady
            ? "Membrane READY. Pulse to complete the synthesis."
            : "Inside the visible membrane: hold Stabilize until the lattice settles and READY appears.")
          : "Carry the held pattern to the Aperture-facing seal.";
      } else if (state.inBand) {
        stage = state.cadenceOpen
          ? "mixed_filter_opening_readable"
          : "mixed_filter_compression_holding";
        nextAction = !state.memoryCentered
          ? "Move toward the center line so the Grave memory remains intact."
          : !state.stabilizing
            ? "Hold Stabilize to brace the Silt pressure."
            : state.cadenceOpen
              ? `Pulse now to hold mixed filter read ${targetBand}/${requiredReads}.`
              : "Keep moving and braced; Pulse when the living teeth relax.";
      } else {
        stage = "move_to_next_mixed_filter_band";
        const direction = activeBandDirection === "back" ? "Move back" : activeBandDirection === "deeper" ? "Move deeper" : "Hold here";
        nextAction = `${direction} to mixed filter band ${targetBand}/${requiredReads}; this is the next incomplete read.`;
      }
    }

    frameState.combThresholdPlayable = {
      pass: "HC-013B",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      mountCount: this.mountCount,
      regionId: "comb_threshold",
      runtimeCellId: COMB_CELL_ID,
      stage,
      status: complete ? "complete" : active ? "active" : "pending",
      progress: complete
        ? 1
        : Math.min(0.99, (this.successfulReadCount / Math.max(1, requiredReads)) * 0.78 + this.apertureRevealProgress * 0.22),
      completed: complete,
      challengeComplete: Boolean(this.completed),
      completionFrame: this.completionFrame,
      gameplayOwner: "CombThresholdPlayableSystem",
      presentationOwner: "CombThresholdFoundationSystem",
      movementOwner: "PlayerMovementController",
      objectiveOwner: "ObjectiveSystem",
      historyOwner: "LocalCellBoundaryMorphSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      pathProgress: this.pathProgress,
      maxDepthProgress: this.maxDepthProgress,
      localPlayerPosition: active ? { x: this.localPlayer.x, y: this.localPlayer.y, z: this.localPlayer.z } : null,
      currentBandIndex: this.currentBandIndex,
      currentBandNumber: Math.min(this.currentBandIndex + 1, requiredReads),
      activeBandZ: targetBandZ,
      activeBandDirection,
      sequentialReadOrderEnforced: true,
      requiredFilterReads: requiredReads,
      successfulFilterReads: this.successfulReadCount,
      completedBands: [...this.bandCompleted],
      completedBandNumbers: this.bandCompleted.map((done, index) => done ? index + 1 : null).filter(Boolean),
      coherence: this.coherence,
      minimumFinalCoherence: interaction.minimumCoherenceForFinalRead ?? 0.7,
      coherenceReady: Boolean(state.coherenceReady),
      membraneCoherenceRecovering: Boolean(state.membraneCoherenceRecovering),
      membraneCoherenceRecoveryRate: interaction.finalMembraneCoherenceRecoveryPerSecond ?? 0.28,
      memoryCentered: Boolean(state.memoryCentered),
      memoryRadialDistance: state.radialDistance ?? Number.POSITIVE_INFINITY,
      stabilizeHeld: Boolean(state.stabilizing),
      cadencePhase: state.cadencePhase ?? 0,
      cadenceSignal: state.cadenceSignal ?? -1,
      cadenceOpen: Boolean(state.cadenceOpen),
      compression: state.compression ?? 0,
      inActiveBand: Boolean(state.inBand),
      activeBandDistance: state.bandDistance ?? Number.POSITIVE_INFINITY,
      activeBandRange: state.currentBandRange ?? (interaction.bandRange ?? 0.7),
      activeBandRangeAuthority: "authored_range_capped_to_non_overlapping_neighbor_midpoint",
      atFinalSeal: Boolean(state.atFinalSeal),
      finalSealDistance: state.sealDistance ?? Number.POSITIVE_INFINITY,
      finalSealRange: state.sealRange ?? interaction.finalSealRange ?? 2.15,
      finalSealInside: Boolean(state.atFinalSeal),
      membraneStabilizeProgress: state.membraneStabilizeProgress ?? 0,
      membraneReady: Boolean(state.membraneReady),
      membraneHandshake: state.membraneReady ? "READY" : state.atFinalSeal ? "SETTLING" : "APPROACH",
      finalCadenceRequired: false,
      finalSealAuthority: state.foundationDistanceAvailable
        ? "CombThresholdFoundationSystem.apertureSealDistance"
        : "legacy_recipe_fallback_for_fixture_only",
      offBeatPulseCount: this.offBeatPulseCount,
      unbracedPulseCount: this.unbracedPulseCount,
      memoryDriftEvents: this.memoryDriftEvents,
      recoverySeconds: this.recoverySeconds,
      failureRecoverable: true,
      hardRestart: false,
      reverseTraversalAllowed: true,
      hardMovementGate: false,
      apertureRevealProgress: this.apertureRevealProgress,
      apertureRevealWitnessed: this.apertureRevealWitnessed,
      apertureDestinationMounted: Boolean(["ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(this.frameState?.firstSliceRuntimeMount?.profileId)),
      apertureGameplayReady: false,
      apertureCrossable: Boolean(this.completed && ["ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(this.frameState?.firstSliceRuntimeMount?.profileId)),
      firstFieldRevealOnly: false,
      returnFoldRemainsAvailable: true,
      guideLine: "Preserve the memory line, brace the pressure, and answer the rhythm as one continuous filter reading.",
      objectiveLine: nextAction,
      nextAction,
      lastInteraction: this.lastInteraction,
      warning: this.warning,
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      forcedPlayerRelocation: false,
      apertureFieldsImplemented: false
    };
  }
}
