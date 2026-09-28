export class ObjectiveSystem {
  constructor({ objectiveRegistry, regionRegistry, frameState }) {
    if (!objectiveRegistry || !regionRegistry || !frameState) {
      throw new Error("[ObjectiveSystem] registries and frameState are required.");
    }
    this.objectiveRegistry = objectiveRegistry;
    this.regionRegistry = regionRegistry;
    this.frameState = frameState;
  }

  update(_dt, frameState) {
    const states = {
      surface_absorb_first_nutrient: this.surfaceWakeState(frameState),
      guide_stabilize_and_cross: this.guideThresholdState(frameState),
      hub_read_route_gates: this.hubProxyState(frameState),
      grave_memory_read_and_stabilize: this.graveMemoryState(frameState),
      vascular_route_playable_circuit: this.vascularRhythmState(frameState),
      silt_route_playable_circuit: this.siltPressureState(frameState),
      comb_threshold_foundation_read: this.combThresholdFoundationState(frameState),
      comb_threshold_playable_synthesis: this.combThresholdPlayableState(frameState),
      aperture_fields_arrival_read: this.apertureFieldsArrivalState(frameState)
    };

    const activeRegion = this.regionRegistry.getByRuntimeCellId(frameState.activeCellId);
    const activeObjective = activeRegion
      ? this.objectiveRegistry.getByRegionId(activeRegion.id)
      : null;

    frameState.firstSliceObjectives = states;
    frameState.objectiveState = activeObjective
      ? {
          ...states[activeObjective.id],
          id: activeObjective.id,
          regionId: activeObjective.regionId,
          displayText: activeObjective.displayText,
          steps: activeObjective.steps,
          onComplete: activeObjective.onComplete,
          owner: "ObjectiveSystem",
          authoredBy: "ObjectiveRegistry"
        }
      : {
          id: "none",
          regionId: "outside_first_slice",
          status: "outside_first_slice",
          progress: 0,
          complete: false,
          owner: "ObjectiveSystem"
        };
  }

  surfaceWakeState(frameState) {
    const lesson = frameState.surfaceWakeLayeredInteraction ?? {};
    const gameplay = frameState.surfaceWakeGameplay ?? {};
    const circuit = frameState.nurseryCircuit ?? {};
    const morph = frameState.localCellMorph ?? {};
    const leftSurface = frameState.activeCellId !== "CELL_MEMBRANE_NURSERY_001";
    const materialPassageOpen = Boolean(
      gameplay.materialPassageOpen
      && circuit.materialPassage?.state === "open"
    );
    const lessonComplete = Boolean(lesson.completed || lesson.stage === "surface_wake_complete_retained");
    const seedUnlocked = Boolean(lesson.safeSeedReadable || !lesson.blocksSafeSeedAbsorb || leftSurface);
    const handoffComplete = Boolean(morph.completed || leftSurface);
    const seedAccepted = Boolean(
      morph.seedAbsorbed
      || frameState.surfaceWakeEcology?.seedAbsorbed
      || leftSurface
    );
    const progress = (Number(lessonComplete) + Number(seedUnlocked) + Number(handoffComplete)) / 3;

    return {
      status: handoffComplete
        ? "complete"
        : seedAccepted
          ? "exit_seam_ready"
          : lessonComplete
            ? "seed_presented_not_yet_accepted"
            : "active",
      progress,
      complete: handoffComplete,
      authority: "observer_only",
      observedWorldState: {
        materialPassageOpen,
        foldInteractionCompleted: lessonComplete,
        seedAccepted,
        handoffComplete
      },
      causality: {
        createsMaterialPassage: false,
        createsFoldAvailability: false,
        createsCrossingPermission: false,
        order: [
          "material_state_changes",
          "membrane_passage_opens",
          "fold_interaction_observes_passage",
          "objective_observes_result",
          "existing_morph_handles_handoff"
        ]
      },
      stepState: {
        surface_wake_lesson_complete: lessonComplete,
        safe_seed_absorb_unlocked: seedUnlocked,
        protected_seed_accepted: seedAccepted,
        surface_to_guide_handoff_complete: handoffComplete
      },
      completionSource: handoffComplete ? "LocalCellMorphSystem compatibility adapter" : "SurfaceWakeLayeredInteractionSystem"
    };
  }

  guideThresholdState(frameState) {
    const guide = frameState.guideThresholdLayeredInteraction ?? {};
    const secondMorph = frameState.secondLocalCellMorph ?? {};
    const reachedHubProxy = frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001";
    const guideComplete = Boolean(guide.completed || guide.stage === "guide_threshold_complete_retained" || reachedHubProxy);
    const handoffComplete = Boolean(secondMorph.completed || reachedHubProxy);
    const progress = handoffComplete ? 1 : Math.max(0, Math.min(1, guide.progress ?? 0));

    return {
      status: handoffComplete ? "complete" : guide.active ? "active" : "pending",
      progress,
      complete: handoffComplete,
      stepState: {
        current_direction_observed: (guide.stageIndex ?? 0) >= 1 || guideComplete,
        movement_aligned: (guide.alignmentProgress ?? 0) >= 1 || guideComplete,
        resonance_sustained: (guide.resonanceHold ?? 0) >= 1 || guideComplete,
        settle_release_accepted: Boolean(guide.settleLatched || guideComplete),
        guide_to_hub_handoff_complete: handoffComplete
      },
      completionSource: handoffComplete ? "SecondLocalCellMorphSystem compatibility adapter" : "GuideThresholdLayeredInteractionSystem"
    };
  }

  hubProxyState(frameState) {
    const inHub = frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001";
    const foundation = frameState.hubChamberFoundation ?? {};
    const investigation = frameState.hubInvestigationGameplay ?? {};
    const junctionReadable = Boolean(foundation.centralAnchorReadable);
    const layoutReadable = Boolean(foundation.threeRouteLayoutReadable);
    const activeRouteRead = Boolean(foundation.activeRouteIdentityDistinguished);
    const memoryReadable = Boolean(foundation.firstMemoryFragmentReadable);
    const investigationReady = Boolean(investigation.investigationReady);
    const routeSelectionReadable = Boolean(
      foundation.completed
      && (foundation.activeRouteCount ?? 0) > 0
    );
    const completedSteps = [junctionReadable, layoutReadable, activeRouteRead, memoryReadable, routeSelectionReadable]
      .filter(Boolean).length;
    const progress = completedSteps / 5;
    const complete = Boolean(inHub && foundation.completed && routeSelectionReadable);

    return {
      status: complete
        ? "hub_first_slice_complete"
        : inHub && foundation.completed && !investigationReady
          ? "hub_foundation_complete_investigation_pending"
          : inHub
            ? foundation.active ? "hub_foundation_active" : "hub_arrival_pending_foundation"
            : "pending",
      progress,
      complete,
      proxyComplete: Boolean(foundation.completed),
      foundationComplete: Boolean(foundation.completed),
      fullHubComplete: complete,
      fullHubPending: !complete,
      stepState: {
        hub_junction_anchor_readable: junctionReadable,
        three_route_gate_layout_readable: layoutReadable,
        active_route_identity_distinguished: activeRouteRead,
        first_memory_fragment_readable: memoryReadable,
        hub_route_selection_readable: routeSelectionReadable,
        optional_hub_world_investigation_complete: investigationReady,
        status_page_is_optional_reference_ui: true
      },
      completionSource: "HubChamberFoundationSystem + HC028F1 deliberate route selection",
      blocker: complete
        ? "none_detected"
        : !inHub
          ? "reach_hub_chamber"
          : !foundation.completed
            ? "hub_foundation_still_revealing"
            : !routeSelectionReadable
              ? "hub_route_selection_not_readable"
              : "none_detected",
      uiProgressionAuthority: false,
      statusPageOptional: true,
      activeRouteId: foundation.activeRouteId ?? "grave_memory_route",
      routeCount: foundation.routeCount ?? 3,
      dormantRouteCount: foundation.dormantRouteCount ?? 2,
      firstMemoryFragmentReadable: memoryReadable,
      firstStatusPageUseComplete: Boolean(frameState.statusPage?.firstHubUseComplete),
      legacySignalChorusObjectiveDependency: false,
      activeRuntimeOwner: "HubMode"
    };
  }

  graveMemoryState(frameState) {
    const route = frameState.graveMemoryRoute ?? {};
    const inRoute = frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
    const protectedIntact = route.protectedObjectsUntouched !== false;
    const consequenceComplete = route.safeTransferRequired
      ? Boolean(
          route.safeMemoryTransferComplete
          && route.graveMemoryImprintCommitted
        )
      : true;
    const complete = Boolean(route.completed && protectedIntact && consequenceComplete);

    return {
      status: complete
        ? inRoute ? "grave_memory_safe_transfer_complete" : "grave_memory_imprint_history_retained"
        : inRoute
          ? route.safeTransferRequired
            ? "grave_memory_risk_recovery_transfer_active"
            : "grave_memory_read_before_absorb_active"
          : "pending",
      progress: complete ? 1 : Math.max(0, Math.min(1, route.progress ?? 0)),
      complete,
      stepState: {
        old_core_husk_pulse_read: Boolean(route.oldCoreRead),
        memory_silt_pulse_read: Boolean(route.memorySiltRead),
        memory_silt_stabilized: Boolean(route.memorySiltStabilized),
        protective_scar_pulse_read: Boolean(route.protectiveScarRead),
        inheritance_seed_pulse_read: Boolean(route.inheritanceSeedRead),
        protected_remains_left_intact: protectedIntact,
        residue_recoil_within_safe_bounds: Boolean(
          !route.safeTransferRequired
          || (route.residueRecoilRisk ?? 0) <= (route.maximumSafeRecoilRisk ?? 0.18)
        ),
        settled_memory_trace_safely_transferred: Boolean(
          !route.safeTransferRequired || route.safeMemoryTransferComplete
        ),
        grave_memory_imprint_committed: Boolean(
          !route.safeTransferRequired || route.graveMemoryImprintCommitted
        )
      },
      completionSource: route.safeTransferRequired
        ? "GraveMemoryRouteSystem HC-010B consequence observed by ObjectiveSystem"
        : "GraveMemoryRouteSystem observed by ObjectiveSystem",
      blocker: complete
        ? "none_detected"
        : !inRoute
          ? "reach_grave_memory_route"
          : route.stage ?? "read_before_absorb_sequence_pending",
      memoryThreadRetained: Boolean(route.memoryThreadRetained),
      safeMemoryTransferComplete: Boolean(route.safeMemoryTransferComplete),
      graveMemoryImprintCommitted: Boolean(route.graveMemoryImprintCommitted),
      failureRecoverable: Boolean(route.failureRecoverable),
      archivedCompatibilityDependency: false
    };
  }

  vascularRhythmState(frameState) {
    const route = frameState.vascularRhythmRoute ?? {};
    const inRoute = frameState.activeCellId === "CELL_VASCULAR_RHYTHM_ROUTE_001";
    const requiredReads = route.requiredRelationshipReads ?? route.requiredCadenceReads ?? 3;
    const currentEntered = Boolean(route.active || route.completed);
    // HC031R: route-local cadence counters remain as a compatibility alias, but
    // the canonical completion meaning is three Stabilize→Pulse current-relationship reads.
    const relationshipRead = (route.relationshipReads ?? route.lockedCadenceReads ?? 0) >= requiredReads;
    const deepValveReached = (route.maxDepthProgress ?? 0) >= 0.78;
    const contractionStabilized = (route.stabilizeSeconds ?? 0) >= 0.8;
    const synchronized = Boolean(route.synchronizationComplete || route.completed);
    const returnCurrentFormed = Boolean(route.returnFoldReady && route.currentReversedTowardHub);
    const complete = Boolean(
      route.completed
      && relationshipRead
      && deepValveReached
      && contractionStabilized
      && synchronized
      && returnCurrentFormed
    );

    return {
      status: complete
        ? inRoute ? "vascular_return_current_ready" : "vascular_synchronization_retained"
        : inRoute
          ? route.desynchronized
            ? "vascular_recoverable_desynchronization_active"
            : "vascular_rhythm_circuit_active"
          : "vascular_route_ready_after_grave_return",
      progress: complete ? 1 : Math.max(0, Math.min(1, route.progress ?? 0)),
      complete,
      stepState: {
        living_current_entered: currentEntered,
        three_current_relationship_reads: relationshipRead,
        three_cadence_windows_pulse_read: relationshipRead,
        deep_valve_reached: deepValveReached,
        contraction_pressure_stabilized: contractionStabilized,
        circulation_synchronized: synchronized,
        return_current_formed: returnCurrentFormed
      },
      completionSource: "HC031R Vascular relationship reads observed from VascularRhythmRouteSystem by ObjectiveSystem",
      blocker: complete
        ? "none_detected"
        : !inRoute
          ? "enter_vascular_rhythm_from_hub"
          : route.nextAction ?? "follow_the_visible_circulation_charge",
      failureRecoverable: route.failureRecoverable !== false,
      riskEventCount: route.riskEventCount ?? 0,
      desynchronizationRecovered: Boolean(route.desynchronizationRecovered),
      directRouteActivation: false,
      directGateMutation: false,
      newAbilityUnlocks: 0
    };
  }

  siltPressureState(frameState) {
    const route = frameState.siltPressureRoute ?? {};
    const inRoute = frameState.activeCellId === "CELL_SILT_PRESSURE_ROUTE_001";
    const pressureRead = Boolean(route.pressureRead);
    const pressureRelationshipRead = Boolean(route.pressureRead && (route.pressureReadSequence ?? 0) > 0);
    const ribsReleased = Boolean(route.ribsReleased);
    const selectiveAbsorb = Boolean(route.safeMatterAbsorbed);
    const packedResidueIntact = route.denseMatterLeftIntact !== false;
    const deepReached = (route.maxDepthProgress ?? 0) >= 0.82;
    const returnBreathFormed = Boolean(route.returnFoldReady && route.completed);
    const complete = Boolean(
      route.completed
      && pressureRead
      && ribsReleased
      && selectiveAbsorb
      && packedResidueIntact
      && deepReached
      && returnBreathFormed
    );

    return {
      status: complete
        ? inRoute ? "silt_return_breath_ready" : "silt_pressure_release_retained"
        : inRoute
          ? route.compressionFailure
            ? "silt_recoverable_compression_failure_active"
            : "silt_pressure_circuit_active"
          : "silt_route_ready_after_grave_return",
      progress: complete ? 1 : Math.max(0, Math.min(1, route.progress ?? 0)),
      complete,
      stepState: {
        pressure_relationship_stabilize_then_pulse_read: pressureRelationshipRead,
        pressure_direction_pulse_read: pressureRead,
        living_ribs_stabilized_open: ribsReleased,
        porous_nutrient_selectively_absorbed: selectiveAbsorb,
        packed_residue_left_intact: packedResidueIntact,
        deep_pressure_organ_reached: deepReached,
        return_breath_formed: returnBreathFormed
      },
      completionSource: "HC031S Silt pressure relationship observed from SiltPressureRouteSystem by ObjectiveSystem",
      blocker: complete
        ? "none_detected"
        : !inRoute
          ? "enter_silt_pressure_from_hub"
          : route.nextAction ?? "read_the_compressed_living_passage",
      failureRecoverable: route.failureRecoverable !== false,
      failureCount: route.failureCount ?? 0,
      failureRecovered: Boolean(route.failureRecovered),
      directRouteActivation: false,
      directGateMutation: false,
      newAbilityUnlocks: 0
    };
  }

  combThresholdFoundationState(frameState) {
    const foundation = frameState.combThresholdFoundation ?? {};
    const inComb = frameState.activeCellId === "CELL_COMB_THRESHOLD_FILTER_001";
    const anatomyReadable = Boolean(foundation.active && (foundation.reveal ?? 0) >= 0.58);
    const imprintsRetained = (foundation.retainedRouteImprintFamilyCount ?? 0) === 3;
    const sealReadable = Boolean(foundation.apertureSealReadable);
    const destinationSealed = foundation.apertureDestinationMounted === false
      && foundation.apertureCrossable === false;
    const completedSteps = [anatomyReadable, imprintsRetained, sealReadable, destinationSealed]
      .filter(Boolean).length;

    return {
      status: !inComb
        ? "comb_threshold_foundation_pending_entry"
        : sealReadable
          ? "comb_foundation_readable_aperture_sealed"
          : anatomyReadable
            ? "comb_filter_anatomy_readable"
            : "comb_threshold_foundation_revealing",
      progress: completedSteps / 4,
      complete: false,
      stepState: {
        comb_filter_anatomy_readable: anatomyReadable,
        three_route_imprints_retained: imprintsRetained,
        aperture_seal_readable: sealReadable,
        aperture_destination_remains_unmounted: destinationSealed
      },
      completionSource: "CombThresholdFoundationSystem observed by ObjectiveSystem",
      blocker: sealReadable
        ? "aperture_fields_runtime_foundation_pending"
        : inComb
          ? "move_deeper_to_read_the_sealed_aperture_membrane"
          : "enter_comb_threshold_after_hub_convergence",
      foundationOnly: true,
      objectiveCompletionIntentionallyDisabled: true,
      apertureDestinationMounted: Boolean(foundation.apertureDestinationMounted),
      apertureCrossable: Boolean(foundation.apertureCrossable),
      newAbilityUnlocks: 0
    };
  }

  apertureFieldsArrivalState(frameState) {
    const arrival = frameState.apertureFieldsArrival ?? {};
    const signalPlain = frameState.signalPlainEcology ?? {};
    const membraneRidge = frameState.membraneRidgeGameplay ?? {};
    const adjacent = frameState.adjacentHostTerritory ?? {};
    const inField = frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001";
    const entered = Boolean(inField || frameState.act1RouteHistory?.apertureFieldsEntered);
    const shelfReadable = Boolean(arrival.reveal >= 0.72 || frameState.act1RouteHistory?.apertureArrivalShelfRead);
    const landmarksReadable = Boolean((arrival.landmarks ?? []).length === 3 && (arrival.landmarks ?? []).every((landmark) => landmark.readable));
    const returnRetained = Boolean(arrival.returnFoldInteractionRange > 0 || frameState.act1RouteHistory?.apertureFieldsReturned);
    const signalPlainComplete = Boolean(signalPlain.completed);
    const membraneRidgeActive = Boolean(membraneRidge.active);
    const membraneRidgeComplete = Boolean(membraneRidge.completed);

    const completedSteps = [
      entered,
      shelfReadable,
      landmarksReadable,
      returnRetained,
      signalPlainComplete
    ].filter(Boolean).length;
    const complete = signalPlainComplete;
    const progress = complete ? 1 : completedSteps / 5;

    return {
      status: !entered
        ? "aperture_arrival_pending_crossing"
        : signalPlainComplete
          ? membraneRidgeComplete
            ? adjacent.enteredTerritory
              ? "aperture_adjacent_gathering_territory_local"
              : adjacent.traversalOpen
                ? "aperture_adjacent_gathering_territory_open"
                : "aperture_signal_plain_complete_membrane_ridge_read"
            : membraneRidgeActive
              ? "aperture_signal_plain_complete_membrane_ridge_active"
              : "aperture_signal_plain_complete_deeper_field_open"
          : shelfReadable
            ? "aperture_arrival_shelf_readable_signal_plain_pending"
            : "aperture_arrival_decompressing",
      progress,
      complete,
      stepState: {
        arrival_boundary_crossed: entered,
        decompression_shelf_entered: shelfReadable,
        three_distant_landmarks_readable: landmarksReadable,
        comb_return_fold_retained: returnRetained,
        signal_plain_local_response_complete: signalPlainComplete,
        membrane_ridge_gameplay_active: membraneRidgeActive,
        membrane_ridge_pressure_read: membraneRidgeComplete,
        adjacent_territory_remotely_observed: (adjacent.observationCount ?? 0) > 0,
        adjacent_territory_relationship_established: Boolean(adjacent.relationshipEstablished),
        adjacent_territory_continuous_traversal_open: Boolean(adjacent.traversalOpen),
        adjacent_territory_entered_without_cell_change: Boolean(adjacent.enteredTerritory)
      },
      completionSource: signalPlainComplete
        ? "SignalPlainEcologySystem completion observed by ObjectiveSystem"
        : "ApertureFieldsArrivalSystem observed by ObjectiveSystem",
      blocker: complete
        ? "none_detected"
        : inField
          ? (signalPlain.nextAction ?? arrival.nextAction ?? "complete_signal_plain")
          : "complete_comb_and_cross_the_open_membrane",
      foundationOnly: false,
      fullEcologyMounted: Boolean(signalPlain.active || signalPlainComplete || membraneRidgeActive || adjacent.active),
      ecologyGameplayReady: Boolean(signalPlain.active || signalPlainComplete),
      continuationOwner: membraneRidgeComplete
        ? "ApertureAdjacentTerritorySystem"
        : signalPlainComplete ? "MembraneRidgeGameplaySystem" : "SignalPlainEcologySystem",
      newAbilityUnlocks: 0
    };
  }

  combThresholdPlayableState(frameState) {
    const foundation = frameState.combThresholdFoundation ?? {};
    const playable = frameState.combThresholdPlayable ?? {};
    const history = frameState.act1RouteHistory ?? {};
    const inComb = frameState.activeCellId === "CELL_COMB_THRESHOLD_FILTER_001";
    const requiredReads = playable.requiredFilterReads ?? 6;
    const readsComplete = (playable.successfulFilterReads ?? 0) >= requiredReads;
    const coherenceHeld = Boolean(playable.coherenceReady || playable.challengeComplete || history.combThresholdPlayableCompleted);
    const finalReadHeld = Boolean(playable.challengeComplete || history.combThresholdPlayableCompleted);
    const revealWitnessed = Boolean(playable.apertureRevealWitnessed || history.apertureFirstFieldRevealWitnessed);
    const destinationSealed = foundation.apertureDestinationMounted === false
      && foundation.apertureCrossable === false
      && playable.apertureDestinationMounted === false
      && playable.apertureCrossable === false;
    const destinationBoundaryMounted = Boolean(foundation.apertureDestinationMounted && foundation.apertureCrossable);
    const destinationResolved = destinationSealed || destinationBoundaryMounted;
    const completedSteps = [readsComplete, coherenceHeld, finalReadHeld, revealWitnessed, destinationResolved]
      .filter(Boolean).length;
    const complete = Boolean(finalReadHeld && revealWitnessed && destinationResolved);

    return {
      status: complete
        ? inComb ? "comb_synthesis_complete_first_field_revealed" : "comb_synthesis_history_retained"
        : !inComb
          ? "comb_threshold_playable_pending_entry"
          : playable.stage ?? "comb_synthesis_active",
      progress: complete ? 1 : completedSteps / 5,
      complete,
      stepState: {
        six_mixed_filter_reads_held: readsComplete,
        combined_coherence_above_final_threshold: coherenceHeld,
        final_pulse_stabilize_read_held: finalReadHeld,
        first_field_reveal_witnessed: revealWitnessed,
        aperture_destination_remains_unmounted: destinationSealed,
        aperture_destination_resolved_for_build: destinationResolved
      },
      completionSource: "CombThresholdPlayableSystem observed by ObjectiveSystem",
      blocker: complete
        ? "none_detected"
        : !inComb
          ? "enter_comb_threshold_after_hub_convergence"
          : playable.nextAction ?? "continue_the_comb_synthesis",
      failureRecoverable: playable.failureRecoverable !== false,
      hardRestart: false,
      apertureDestinationMounted: Boolean(playable.apertureDestinationMounted),
      apertureCrossable: Boolean(playable.apertureCrossable),
      firstFieldRevealOnly: true,
      newAbilityUnlocks: 0
    };
  }

  routeContractState(frameState, routeId) {
    const routeContract = frameState.act1RouteContract ?? {};
    const region = typeof this.regionRegistry.find === "function"
      ? this.regionRegistry.find(routeId)
      : null;
    const inRoute = region?.runtimeCellIds?.includes(frameState.activeCellId) === true;
    const authored = (routeContract.routes ?? []).find((route) => route.id === routeId);
    const destinationMounted = Boolean(authored?.destinationMounted);
    const gameplayReady = Boolean(authored?.gameplayReady);

    return {
      status: gameplayReady
        ? inRoute ? "playable_route_active" : "playable_route_ready"
        : destinationMounted
          ? "destination_mounted_gameplay_pending"
          : "destination_contract_pending",
      progress: (Number(destinationMounted) + Number(gameplayReady)) / 2,
      complete: gameplayReady,
      stepState: {
        destination_mounted: destinationMounted,
        playable_circuit_authored: gameplayReady
      },
      completionSource: "Act1RouteContractSystem observed by ObjectiveSystem",
      blocker: gameplayReady ? "none_detected" : "dedicated_playable_route_pass_pending",
      directRouteActivation: false,
      directGateMutation: false
    };
  }
}
