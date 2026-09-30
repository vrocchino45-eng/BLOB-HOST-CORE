import { selectCurrentMorphState } from "../morph/MorphStateSelector.js";

const PROMPT_REGION_BY_CELL = {
  CELL_MEMBRANE_NURSERY_001: "surface_wake",
  CELL_SCAR_FLOW_FOLD_001: "guide_threshold",
  CELL_SIGNAL_CHORUS_NERVE_001: "hub_chamber",
  CELL_GRAVE_MEMORY_RESIDUE_BED_001: "grave_memory_route",
  CELL_VASCULAR_RHYTHM_ROUTE_001: "vascular_route",
  CELL_SILT_PRESSURE_ROUTE_001: "silt_burrow_route",
  CELL_COMB_THRESHOLD_FILTER_001: "comb_threshold",
  CELL_APERTURE_FIELDS_ARRIVAL_001: "aperture_fields"
};

export class GuidePromptSystem {
  constructor({ recipeDataSystem, frameState }) {
    if (!recipeDataSystem) throw new Error("[GuidePromptSystem] recipeDataSystem is required.");
    if (!frameState) throw new Error("[GuidePromptSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
    this.promptEl = null;
    this.titleEl = null;
    this.guideLineEl = null;
    this.objectiveEl = null;
    this.metaEl = null;
    this.activePromptId = "none";
    this.activeSince = 0;
    this.minHoldSeconds = 2.2;
    this.promptLock = null;
    this.lastPromptRegionId = "none";
    this.lastPromptCellId = "none";
    this.lastPromptMountSequence = -1;
    this.promptRegionEpoch = 0;
  }

  init() {
    this.promptLock = this.recipeDataSystem.data.openingObjectivePromptLock ?? null;
    this.createPanel();
    this.frameState.guidePrompt = this.initialState();
  }

  update(_dt, frameState) {
    const activeRegionId = this.resolvePromptRegion(frameState);
    const regionChanged = this.beginRegionPromptCycle(frameState, activeRegionId);
    const prompts = [...this.recipeDataSystem.data.guidePromptRecipes.values()];
    const selected = this.selectPrompt(prompts, frameState);
    const surfaceWakeInteraction = this.surfaceWakeInteractionPrompt(frameState);
    const guideThresholdGameplay = this.guideThresholdGameplayPrompt(frameState);
    const guideThresholdInteraction = this.guideThresholdInteractionPrompt(frameState);
    const layeredInteraction = this.layeredInteractionPrompt(frameState);
    const nextRoutePressure = this.nextRoutePressurePrompt(frameState);
    const hubInvestigation = this.hubInvestigationPrompt(frameState);
    const hubFoundation = this.hubFoundationPrompt(frameState);
    const hubArrival = this.hubArrivalPrompt(frameState);
    const signalReturnState = this.signalReturnStatePrompt(frameState);
    const returnContinuity = this.returnContinuityPrompt(frameState);
    const graveMemoryRoute = this.graveMemoryRoutePrompt(frameState);
    const vascularRhythmRoute = this.vascularRhythmRoutePrompt(frameState);
    const siltPressureRoute = this.siltPressureRoutePrompt(frameState);
    const combThresholdFoundation = this.combThresholdFoundationPrompt(frameState);
    const signalPlainEcology = this.signalPlainEcologyPrompt(frameState);
    const membraneRidgeGameplay = this.membraneRidgeGameplayPrompt(frameState);
    const apertureFieldsArrival = this.apertureFieldsArrivalPrompt(frameState);
    const routeContract = this.routeContractPrompt(frameState);
    const fallback = this.fallbackPrompt(frameState);
    let prompt;

    if (activeRegionId === "surface_wake") {
      prompt = surfaceWakeInteraction ?? selected ?? fallback;
    } else if (activeRegionId === "guide_threshold") {
      prompt = guideThresholdGameplay ?? guideThresholdInteraction ?? selected ?? fallback;
    } else if (activeRegionId === "hub_chamber") {
      prompt = hubInvestigation ?? hubFoundation ?? hubArrival ?? selected ?? fallback;
    } else if (activeRegionId === "grave_memory_route") {
      prompt = graveMemoryRoute ?? selected ?? fallback;
    } else if (activeRegionId === "vascular_route") {
      prompt = vascularRhythmRoute ?? routeContract ?? selected ?? fallback;
    } else if (activeRegionId === "silt_burrow_route") {
      prompt = siltPressureRoute ?? routeContract ?? selected ?? fallback;
    } else if (activeRegionId === "comb_threshold") {
      prompt = combThresholdFoundation ?? selected ?? fallback;
    } else if (activeRegionId === "aperture_fields") {
      prompt = membraneRidgeGameplay ?? signalPlainEcology ?? apertureFieldsArrival ?? selected ?? fallback;
    } else {
      prompt = surfaceWakeInteraction
        ?? guideThresholdGameplay
        ?? guideThresholdInteraction
        ?? layeredInteraction
        ?? hubInvestigation
        ?? hubFoundation
        ?? nextRoutePressure
        ?? signalReturnState
        ?? returnContinuity
        ?? selected
        ?? fallback;
    }

    this.applyPrompt(prompt, frameState);
    this.publishPromptLifecycle(frameState, prompt, activeRegionId, regionChanged);
    this.updatePanel(frameState);
  }

  resolvePromptRegion(frameState) {
    const cellRegionId = PROMPT_REGION_BY_CELL[frameState.activeCellId];
    if (cellRegionId) return cellRegionId;
    const mountedRegionId = frameState.firstSliceRuntimeMount?.activeRegionId;
    if ([
      "surface_wake",
      "guide_threshold",
      "hub_chamber",
      "grave_memory_route",
      "vascular_route",
      "silt_burrow_route",
      "comb_threshold"
    ].includes(mountedRegionId)) {
      return mountedRegionId;
    }
    return "outside_authored_route";
  }

  beginRegionPromptCycle(frameState, activeRegionId) {
    const activeCellId = frameState.activeCellId ?? "none";
    const mountSequence = Number.isFinite(frameState.firstSliceRuntimeMount?.mountSequence)
      ? frameState.firstSliceRuntimeMount.mountSequence
      : this.lastPromptMountSequence;
    const changed = activeRegionId !== this.lastPromptRegionId
      || activeCellId !== this.lastPromptCellId
      || mountSequence !== this.lastPromptMountSequence;

    if (!changed) return false;

    this.promptRegionEpoch += 1;
    this.activePromptId = "none";
    this.activeSince = frameState.runtimeSeconds ?? 0;
    this.lastPromptRegionId = activeRegionId;
    this.lastPromptCellId = activeCellId;
    this.lastPromptMountSequence = mountSequence;
    frameState.guidePrompt = {
      ...this.initialState(),
      activeRegionId,
      contentOwner: "none",
      selectionOwner: "GuidePromptSystem",
      regionPromptEpoch: this.promptRegionEpoch,
      regionChangeClearedAtFrame: frameState.frame ?? 0,
      stalePromptHoldCleared: true,
      atomicRegionRepublishPending: true
    };
    return true;
  }

  publishPromptLifecycle(frameState, prompt, activeRegionId, regionChanged) {
    const contentOwner = prompt.contentOwner ?? "GuidePromptSystem";
    frameState.promptLifecycle = {
      pass: "HC-010C",
      activeRegionId,
      activeCellId: frameState.activeCellId ?? "none",
      mountSequence: frameState.firstSliceRuntimeMount?.mountSequence ?? this.lastPromptMountSequence,
      regionPromptEpoch: this.promptRegionEpoch,
      regionChangedThisFrame: regionChanged,
      stalePromptHoldCleared: regionChanged,
      atomicRegionRepublishComplete: true,
      selectionOwner: "GuidePromptSystem",
      contentOwner,
      promptId: prompt.id,
      publishedAtFrame: frameState.frame ?? 0,
      internalStagePlayerFacing: false
    };
    frameState.promptStack = {
      ...(frameState.promptStack ?? {}),
      activePresentationOwner: contentOwner,
      activePromptRegionId: activeRegionId,
      regionPromptEpoch: this.promptRegionEpoch,
      regionPromptLifecycle: "active_region_owned_atomic_republish"
    };
  }

  createPanel() {
    this.promptEl = document.createElement("div");
    this.promptEl.id = "guide-prompt-panel";

    Object.assign(this.promptEl.style, {
      position: "fixed",
      left: "50%",
      bottom: "104px",
      transform: "translateX(-50%)",
      width: "min(560px, calc(100vw - 40px))",
      padding: "9px 12px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      lineHeight: "1.35",
      color: "#d9fbff",
      background: "rgba(4, 9, 13, 0.58)",
      border: "1px solid rgba(150, 238, 255, 0.24)",
      borderRadius: "12px",
      pointerEvents: "none",
      zIndex: "19",
      boxShadow: "0 0 24px rgba(91, 218, 255, 0.09)",
      transition: "opacity 160ms ease-out, border-color 160ms ease-out"
    });

    this.titleEl = document.createElement("div");
    this.titleEl.textContent = "GUIDE // FOLDED LANTERN";
    Object.assign(this.titleEl.style, {
      fontSize: "10px",
      letterSpacing: "0.11em",
      opacity: "0.72",
      marginBottom: "4px",
      color: "#9fefff"
    });

    this.guideLineEl = document.createElement("div");
    Object.assign(this.guideLineEl.style, {
      color: "#f2feff",
      marginBottom: "3px"
    });

    this.objectiveEl = document.createElement("div");
    Object.assign(this.objectiveEl.style, {
      color: "#ffe3bd"
    });

    this.metaEl = document.createElement("div");
    Object.assign(this.metaEl.style, {
      marginTop: "4px",
      opacity: "0.54",
      fontSize: "10px"
    });

    this.promptEl.append(this.titleEl, this.guideLineEl, this.objectiveEl, this.metaEl);
    document.body.appendChild(this.promptEl);
  }

  selectPrompt(prompts, frameState) {
    this.minHoldSeconds = frameState.openingFlow?.promptMinHoldSeconds ?? this.minHoldSeconds;

    const sorted = prompts
      .filter((prompt) => prompt.id !== "GUIDE_PROMPT_FALLBACK_001")
      .filter((prompt) => this.matchesPrompt(prompt, frameState))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    if (!sorted.length) return null;

    const candidate = sorted[0];
    const now = frameState.runtimeSeconds ?? 0;
    const currentStillValid = sorted.find((prompt) => prompt.id === this.activePromptId);

    if (
      currentStillValid &&
      candidate.id !== this.activePromptId &&
      now - this.activeSince < this.minHoldSeconds
    ) {
      return currentStillValid;
    }

    return candidate;
  }

  matchesPrompt(prompt, frameState) {
    const activeCellId = frameState.activeCellId ?? "none";
    const cellIds = prompt.cellIds ?? [];
    if (!cellIds.includes("*") && !cellIds.includes(activeCellId)) return false;

    const conditions = prompt.conditions ?? {};
    const morph = selectCurrentMorphState(frameState);
    const targetId = frameState.targeting?.targetId ?? "none";
    const selectedId = frameState.selectedObject?.recipeId ?? frameState.selectedObject?.objectId ?? "none";

    if (Array.isArray(conditions.targetIds)) {
      const targetMatches = conditions.targetIds.includes(targetId) || conditions.targetIds.includes(selectedId);
      if (!targetMatches) return false;
    }

    if (Array.isArray(conditions.morphPhases) && !conditions.morphPhases.includes(morph.phase)) {
      return false;
    }

    if (Array.isArray(conditions.openingStages)) {
      const openingStage = frameState.openingFlow?.stage ?? "none";
      if (!conditions.openingStages.includes(openingStage)) return false;
    }

    if (conditions.morphReady === true && !morph.triggerReady) return false;

    if (Array.isArray(conditions.requiresNotAbsorbed)) {
      const absorbedCount = frameState.chemObjectState?.absorbedObjects ?? 0;
      if (absorbedCount > 0) return false;
    }

    if (conditions.arrivalSystem) {
      const arrival = frameState[conditions.arrivalSystem] ?? {};
      if (!arrival.active) return false;
    }

    if (conditions.loopSystem) {
      const loop = frameState[conditions.loopSystem] ?? {};
      if (!loop.active) return false;

      if (Array.isArray(conditions.loopStages) && !conditions.loopStages.includes(loop.stage)) {
        return false;
      }

      if (Array.isArray(conditions.currentFocusIds) && !conditions.currentFocusIds.includes(loop.currentFocus)) {
        return false;
      }
    }

    return true;
  }

  surfaceWakeInteractionPrompt(frameState) {
    const interaction = frameState.surfaceWakeLayeredInteraction ?? {};
    if (!interaction.active) return null;
    const gameplay = frameState.surfaceWakeGameplay ?? {};
    const ecology = frameState.surfaceWakeEcology ?? {};
    const circuit = frameState.nurseryCircuit ?? {};
    const waitingForAgency = interaction.foldAvailable === false && gameplay.active;
    const foldEmerging = interaction.foldAvailable === true
      && interaction.stage === "approach_listening_fold"
      && gameplay.active;
    const systemicOpening = waitingForAgency;
    const ecologyLine = ecology.phase === "awaken"
      ? "Something protective is noticing you. Watch how matter changes when you disturb it."
      : ecology.phase === "observe"
        ? circuit.packetActive
          ? !circuit.packetIdentified
            ? "The carried matter is still ambiguous."
            : circuit.visualReadState === "identified_unsafe"
              ? "The matter has declared its hazard."
              : circuit.visualReadState === "hazard_retracting_under_stabilize"
                ? "The hazardous structure is retracting."
                : circuit.visualReadState === "coherent_safe"
                  ? "The packet has become coherent."
                  : "The Watcher is following the material response."
          : circuit.foldInvitation
            ? "The changed membrane is opening toward the Listening Fold."
            : "The current is carrying another material state into view."
        : ecology.phase === "receive"
          ? "The nursery is offering what it guarded."
          : ecology.phase === "outgrow"
            ? "You no longer fit the old circuit. Scar and signal now describe the same seam."
            : null;
    return {
      id: "GUIDE_PROMPT_SURFACE_WAKE_LAYERED_INTERACTION_HC007A",
      beat: interaction.stage ?? "approach_listening_fold",
      priority: 620,
      guideLine: ecologyLine ?? (
        systemicOpening
          ? gameplay.guideLine
          : interaction.guideLine ?? "The listening fold is breathing."
      ),
      objectiveLine: foldEmerging
        ? "Follow the opening membrane."
        : systemicOpening && ecology.active
          ? circuit.packetActive
            ? circuit.visualReadState === "ambiguous_unread"
              ? "Read what the moving matter is."
              : circuit.visualReadState === "identified_unsafe"
                ? "Change the unsafe material state."
                : circuit.visualReadState === "hazard_retracting_under_stabilize"
                  ? "Hold the change until the matter coheres."
                  : circuit.visualReadState === "coherent_safe"
                    ? "Choose where the safe matter goes."
                    : (ecology.nextAction ?? "Watch what the material does.")
            : circuit.foldInvitation
              ? "Move through the changed passage."
              : "Observe the next matter cycle."
          : systemicOpening
            ? "Read the material response."
            : (interaction.objectiveLine ?? "Approach and read the fold."),
      debugFallback: foldEmerging
        ? "Move to the revealed Fold; its established Pulse / sustain / release sequence is unchanged."
        : ecology.active
          ? (circuit.nextAction ?? ecology.nextAction)
          : systemicOpening
            ? gameplay.nextAction
            : (interaction.nextAction ?? "Follow the Surface Wake response."),
      tone: interaction.completed ? "surface_wake_complete" : systemicOpening ? "surface_wake_systemic_play" : "surface_wake_learning",
      contentOwner: systemicOpening ? "SurfaceWakeGameplaySystem" : "SurfaceWakeLayeredInteractionSystem"
    };
  }


  guideThresholdGameplayPrompt(frameState) {
    const gameplay = frameState.guideThresholdGameplay ?? {};
    if (!gameplay.active || gameplay.triggerReady) return null;
    return {
      id: "GUIDE_PROMPT_GUIDE_THRESHOLD_GAMEPLAY_FILL_HC007B",
      beat: gameplay.status ?? "systemic_guide_threshold_play",
      priority: 615,
      guideLine: gameplay.guideLine ?? "The current is already moving. Learn it by moving with it.",
      objectiveLine: gameplay.objectiveLine ?? "Explore the living current before the threshold converges.",
      debugFallback: gameplay.nextAction ?? "Ride the current, pulse to reveal flow, and stabilize through turbulence.",
      tone: "guide_threshold_systemic_play",
      contentOwner: "GuideThresholdGameplaySystem"
    };
  }


  guideThresholdInteractionPrompt(frameState) {
    const interaction = frameState.guideThresholdLayeredInteraction ?? {};
    if (!interaction.active) return null;
    return {
      id: "GUIDE_PROMPT_GUIDE_THRESHOLD_LAYERED_INTERACTION_HC006F",
      beat: interaction.stage ?? "approach_guiding_current",
      priority: 610,
      guideLine: interaction.guideLine ?? "The scar bends a living current.",
      objectiveLine: interaction.objectiveLine ?? "Approach and move with the current.",
      debugFallback: interaction.nextAction ?? "Follow the movement-led threshold sequence.",
      tone: interaction.completed ? "guide_threshold_complete" : "guide_threshold_traversal",
      contentOwner: "GuideThresholdLayeredInteractionSystem"
    };
  }

  layeredInteractionPrompt(frameState) {
    const interaction = frameState.signalChorusLayeredInteraction ?? {};
    if (!interaction.active) return null;
    if (interaction.completed && frameState.hubChamberFoundation?.active) return null;
    return {
      id: "GUIDE_PROMPT_SIGNAL_CHORUS_LAYERED_INTERACTION_HC006B",
      beat: interaction.stage ?? "approach_cadence_knot",
      priority: 580,
      guideLine: interaction.guideLine ?? "The cadence knot is listening.",
      objectiveLine: interaction.objectiveLine ?? "Approach and read the knot.",
      debugFallback: interaction.nextAction ?? "Follow the layered resonance sequence.",
      tone: interaction.completed ? "layered_resonance_complete" : "layered_resonance",
      contentOwner: "SignalChorusLayeredInteractionSystem"
    };
  }

  hubFoundationPrompt(frameState) {
    const foundation = frameState.hubChamberFoundation ?? {};
    if (!foundation.active) return null;
    return {
      id: "GUIDE_PROMPT_HUB_CHAMBER_PRESENTATION_LOCK_HC006JA",
      beat: foundation.stage ?? "hub_junction_revealing_around_chorus",
      priority: 550,
      guideLine: foundation.guideLine ?? "The Chorus is becoming a junction.",
      objectiveLine: foundation.objectiveLine ?? "Read the three route identities.",
      debugFallback: foundation.nextAction ?? "Read the active route and remember the dormant routes.",
      tone: foundation.completed ? "hub_foundation_complete" : "hub_foundation_revealing",
      completed: Boolean(foundation.completed),
      contentOwner: "HubChamberFoundationSystem"
    };
  }

  hubInvestigationPrompt(frameState) {
    const gameplay = frameState.hubInvestigationGameplay ?? {};
    if (!gameplay.active || gameplay.investigationReady) return null;
    return {
      id: "GUIDE_PROMPT_HUB_INVESTIGATION_GAMEPLAY_HC007C",
      beat: gameplay.status ?? "hub_systemic_investigation",
      priority: 565,
      guideLine: gameplay.guideLine ?? "The routes must be compared from within the junction.",
      objectiveLine: gameplay.objectiveLine ?? "Approach an awake route body; press A when it brightens.",
      debugFallback: gameplay.nextAction ?? "Choose an awake destination body in the Hub.",
      tone: "hub_investigation_gameplay",
      contentOwner: "HubInvestigationGameplaySystem"
    };
  }

  hubArrivalPrompt(frameState) {
    if (frameState.activeCellId !== "CELL_SIGNAL_CHORUS_NERVE_001") return null;
    if (frameState.hubChamberFoundation?.active || frameState.hubInvestigationGameplay?.active) return null;
    return {
      id: "GUIDE_PROMPT_HUB_ARRIVAL_HANDOFF_HC010C",
      beat: "hub_chamber_arrival",
      priority: 570,
      guideLine: "The junction is taking ownership of the crossing.",
      objectiveLine: "Hold the center while the three route bodies separate into view.",
      debugFallback: "awaiting HubChamberFoundationSystem mount after LocalCellBoundaryMorphSystem crossing",
      tone: "hub_foundation_revealing",
      contentOwner: "HubChamberFoundationSystem",
      source: "activeRegionHandoff"
    };
  }

  graveMemoryRoutePrompt(frameState) {
    const route = frameState.graveMemoryRoute ?? {};
    if (frameState.activeCellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") return null;

    if (!route.active) {
      return {
        id: "GUIDE_PROMPT_GRAVE_MEMORY_ROUTE_ARRIVAL_HC010C",
        beat: "grave_memory_route_arrival",
        priority: 700,
        guideLine: "The residue bed is taking ownership of the crossing.",
        objectiveLine: "Let the Grave settle around the Core, then Pulse what remains before trying to take it.",
        debugFallback: "awaiting GraveMemoryRouteSystem mount after LocalCellBoundaryMorphSystem crossing",
        tone: "grave",
        contentOwner: "GraveMemoryRouteSystem",
        source: "activeRegionHandoff"
      };
    }

    const recovering = route.stage === "recover_memory_trace";
    const transferring = ["accept_memory_trace", "memory_trace_entering"].includes(route.stage);
    const returnReady = Boolean(route.returnFoldReady);
    return {
      id: "GUIDE_PROMPT_GRAVE_MEMORY_ROUTE_HC010C",
      beat: "grave_memory_route_active",
      priority: 700,
      guideLine: route.guideLine ?? "Memory answers Pulse before it accepts any other action.",
      objectiveLine: route.nextAction ?? route.objectiveLine ?? "Read what remains before trying to take it.",
      debugFallback: `${route.stage ?? "route_active"}: ${route.nextAction ?? "follow the Grave reading"}`,
      tone: returnReady
        ? "grave_route_locked"
        : recovering
          ? "cautious"
          : transferring
            ? "grave_return_current"
            : "grave",
      contentOwner: "GraveMemoryRouteSystem",
      source: "activeRegionState"
    };
  }

  routeContractPrompt(frameState) {
    const route = frameState.act1RouteContract ?? {};
    const contractCell = [
      "CELL_VASCULAR_RHYTHM_ROUTE_001",
      "CELL_SILT_PRESSURE_ROUTE_001"
    ].includes(frameState.activeCellId);
    if (!contractCell) return null;

    return {
      id: "GUIDE_PROMPT_ACT1_ROUTE_CONTRACT_HC010G",
      beat: route.contractStatus ?? "route_contract_mounting",
      priority: 700,
      guideLine: route.guideLine ?? "The route foundation is taking ownership of the crossing.",
      objectiveLine: route.nextAction ?? "Return through the preserved entry fold.",
      debugFallback: `${route.regionId ?? "route_contract"}: ${route.contractStatus ?? "mount_pending"}`,
      tone: "route_contract",
      contentOwner: "Act1RouteContractSystem",
      source: route.active ? "activeRegionState" : "activeRegionHandoff"
    };
  }

  vascularRhythmRoutePrompt(frameState) {
    if (frameState.activeCellId !== "CELL_VASCULAR_RHYTHM_ROUTE_001") return null;
    const route = frameState.vascularRhythmRoute ?? {};
    if (!route.active) {
      return {
        id: "GUIDE_PROMPT_VASCULAR_RHYTHM_ARRIVAL_HC011A",
        beat: "vascular_rhythm_arrival",
        priority: 710,
        guideLine: "The living vessel is taking ownership of the crossing.",
        objectiveLine: "Let the moving charge become visible, then travel with its current.",
        debugFallback: "awaiting VascularRhythmRouteSystem mount after LocalCellBoundaryMorphSystem crossing",
        tone: "vascular",
        contentOwner: "VascularRhythmRouteSystem",
        source: "activeRegionHandoff"
      };
    }

    return {
      id: "GUIDE_PROMPT_VASCULAR_RHYTHM_HC011A",
      beat: route.stage ?? "vascular_rhythm_active",
      priority: 710,
      guideLine: route.guideLine ?? "Move with the charge and listen for the vessel's answer.",
      objectiveLine: route.nextAction ?? "Follow the moving charge through the living vessel.",
      debugFallback: `${route.stage ?? "route_active"}: ${route.lastInteraction ?? "follow_the_current"}`,
      tone: route.completed
        ? "vascular_return"
        : route.desynchronized
          ? "cautious"
          : route.pulseWindowOpen
            ? "vascular_ready"
            : "vascular",
      contentOwner: "VascularRhythmRouteSystem",
      source: "activeRegionState"
    };
  }

  siltPressureRoutePrompt(frameState) {
    if (frameState.activeCellId !== "CELL_SILT_PRESSURE_ROUTE_001") return null;
    const route = frameState.siltPressureRoute ?? {};
    if (!route.active) {
      return {
        id: "GUIDE_PROMPT_SILT_PRESSURE_ARRIVAL_HC012A",
        beat: "silt_pressure_arrival",
        priority: 710,
        guideLine: "The compressed living passage is taking ownership of the crossing.",
        objectiveLine: "Move inside the low ribs and Pulse once to read their pressure.",
        debugFallback: "awaiting SiltPressureRouteSystem mount after LocalCellBoundaryMorphSystem crossing",
        tone: "silt",
        contentOwner: "SiltPressureRouteSystem",
        source: "activeRegionHandoff"
      };
    }

    return {
      id: "GUIDE_PROMPT_SILT_PRESSURE_HC012A",
      beat: route.stage ?? "silt_pressure_active",
      priority: 710,
      guideLine: route.guideLine ?? "Read what compresses, brace what moves, and take only what yields.",
      objectiveLine: route.nextAction ?? "Move through the compressed living passage.",
      debugFallback: `${route.stage ?? "route_active"}: ${route.lastInteraction ?? "read_the_pressure"}`,
      tone: route.completed
        ? "silt_return"
        : route.compressionFailure
          ? "cautious"
          : route.absorbHeld
            ? "silt_appetite"
            : "silt",
      contentOwner: "SiltPressureRouteSystem",
      source: "activeRegionState"
    };
  }

  combThresholdFoundationPrompt(frameState) {
    if (frameState.activeCellId !== "CELL_COMB_THRESHOLD_FILTER_001") return null;
    const foundation = frameState.combThresholdFoundation ?? {};
    const playable = frameState.combThresholdPlayable ?? {};
    if (!foundation.active) {
      return {
        id: "GUIDE_PROMPT_COMB_THRESHOLD_ARRIVAL_HC013B",
        beat: "comb_threshold_playable_arrival",
        priority: 720,
        guideLine: "The living filter is taking ownership of the crossing.",
        objectiveLine: "Let the repeated teeth and three retained route traces become visible.",
        debugFallback: "awaiting CombThresholdFoundationSystem and CombThresholdPlayableSystem mount after LocalCellBoundaryMorphSystem crossing",
        tone: "combward_pressure",
        contentOwner: "CombThresholdFoundationSystem + CombThresholdPlayableSystem",
        source: "activeRegionHandoff"
      };
    }

    return {
      id: "GUIDE_PROMPT_COMB_THRESHOLD_PLAYABLE_HC013B",
      beat: playable.stage ?? (foundation.apertureSealReadable
        ? "comb_aperture_seal_readable"
        : "comb_filter_anatomy_readable"),
      priority: 720,
      guideLine: playable.guideLine
        ?? foundation.guideLine
        ?? "Memory, rhythm, and pressure pass through one filter without becoming the same thing.",
      objectiveLine: playable.nextAction
        ?? foundation.nextAction
        ?? "Move through the living teeth, read the Aperture membrane, or return through the three-part fold.",
      debugFallback: `reads ${playable.successfulFilterReads ?? 0}/${playable.requiredFilterReads ?? 6} completed [${(playable.completedBandNumbers ?? []).join(",") || "none"}] | active ${playable.currentBandNumber ?? "?"} dist ${Number.isFinite(playable.activeBandDistance) ? playable.activeBandDistance.toFixed(2) : "?"}/${Number.isFinite(playable.activeBandRange) ? playable.activeBandRange.toFixed(2) : "?"} ${playable.activeBandDirection ?? "none"} | coherence ${Math.round((playable.coherence ?? 0) * 100)}% | cadence ${playable.cadenceOpen ? "open" : "closed"}`,
      tone: playable.completed
        ? "first_field_reveal"
        : playable.warning && playable.warning !== "none"
          ? "cautious"
          : playable.cadenceOpen && playable.stabilizeHeld
            ? "comb_synthesis_ready"
            : "combward_pressure",
      contentOwner: "CombThresholdPlayableSystem",
      source: "activeRegionState"
    };
  }


  signalPlainEcologyPrompt(frameState) {
    if (frameState.activeCellId !== "CELL_APERTURE_FIELDS_ARRIVAL_001") return null;
    const ecology = frameState.signalPlainEcology ?? {};
    if (!ecology.active || !ecology.encounterAwake || ecology.completed) return null;
    const observed = ecology.observedCount ?? 0;
    const required = ecology.requiredObservations ?? 3;
    const intention = ecology.traversalIntention ?? {};
    const nearestCandidate = (intention.candidates ?? []).find((candidate) => candidate.nodeNumber === ecology.nearestNodeNumber);
    const nearCondition = Number.isFinite(ecology.nearestNodeDistance) && ecology.nearestNodeDistance <= 4.2
      ? nearestCandidate?.conditionId ?? null
      : null;
    const conditionLine = nearCondition === "draw_release"
      ? "Up close, this rhythm draws inward and releases before anything can settle."
      : nearCondition === "call_wait"
        ? "Up close, it calls twice, then leaves a quiet gap as if waiting for an answer."
        : nearCondition === "phase_slip"
          ? "Up close, its layers keep sliding out of phase and cannot hold alignment."
          : null;
    const localConsequence = ecology.persistentLocalConsequence ?? {};
    const nearestChanged = localConsequence.nearestActive;
    const changedNearby = Boolean(nearestChanged?.active && (nearestChanged.playerDistance ?? Infinity) <= 4.4);
    const consequenceLine = !changedNearby
      ? null
      : nearestChanged.consequenceId === "redistributed_flow"
        ? "That local draw is no longer snapping back; the flow is still carrying the change."
        : nearestChanged.consequenceId === "coherent_answer_cadence"
          ? "That call is still answering in a coherent cadence."
          : nearestChanged.consequenceId === "held_phase_coherence"
            ? "Those layers are still holding together instead of slipping apart."
            : "The local Host is still holding the change.";
    return {
      id: "GUIDE_PROMPT_SIGNAL_PLAIN_FIRST_ECOLOGY_HC015B",
      beat: ecology.stage ?? "signal_plain_ecology",
      priority: 760,
      // HC027I: Guide may describe the physical condition the player has approached,
      // but it still does not name a verb/button or prescribe a correct receptor.
      guideLine: ecology.completed
        ? "The field answered."
        : ecology.ready
          ? "The center is coherent."
          : consequenceLine
            ? consequenceLine
            : conditionLine
              ? conditionLine
              : observed >= required
              ? "The three readings now agree around the center."
              : observed > 0
                ? "One local rhythm is retained. The others are still different."
                : "Three local rhythms are holding different patterns.",
      objectiveLine: ecology.completed
        ? "The changed field is carrying the result."
        : ecology.ready
          ? "The coherent center is waiting."
          : observed >= required
            ? "The receptive center has become the strongest disturbance."
            : observed > 0
              ? "No order is prescribed."
              : "Listen to the differences.",
      debugFallback: `ecology ${observed}/${required} | node ${ecology.nearestNodeNumber ?? "?"} dist ${Number.isFinite(ecology.nearestNodeDistance) ? ecology.nearestNodeDistance.toFixed(2) : "?"}/${ecology.observationRange ?? "?"} | center ${Number.isFinite(ecology.centerDistance) ? ecology.centerDistance.toFixed(2) : "?"}/${ecology.centerRange ?? "?"} | stabilize ${Math.round((ecology.stabilizeCharge ?? 0) * 100)}% | ready ${Boolean(ecology.ready)} | complete ${Boolean(ecology.completed)}`,
      tone: ecology.completed ? "field_response" : ecology.ready ? "ecology_ready" : "ecology_observation",
      contentOwner: "SignalPlainEcologySystem",
      source: "activeRegionState"
    };
  }

  membraneRidgeGameplayPrompt(frameState) {
    if (frameState.activeCellId !== "CELL_APERTURE_FIELDS_ARRIVAL_001") return null;
    const ridge = frameState.membraneRidgeGameplay ?? {};
    if (!ridge.active && !ridge.completed) return null;

    const adjacent = frameState.adjacentHostTerritory ?? {};
    const alive = frameState.gatheringGroundAlive ?? {};
    const attentionOwned = Boolean(adjacent.attentionOwned || frameState.targeting?.attentionTargetId === "gathering_ground_cluster");
    const relationshipOwned = Boolean(adjacent.relationshipOwned || frameState.targeting?.relationshipTargetId === "gathering_ground_cluster");
    const observationCount = adjacent.observationCount ?? 0;

    return {
      id: "GUIDE_PROMPT_MEMBRANE_RIDGE_HC031T5",
      beat: ridge.completed
        ? adjacent.enteredTerritory
          ? "gathering_ground_local"
          : adjacent.relationshipEstablished
            ? "gathering_ground_relationship"
            : observationCount > 0
              ? "gathering_ground_observed"
              : attentionOwned
                ? "gathering_ground_attention_owned"
                : "gathering_ground_attention_handoff"
        : ridge.tracing
          ? "membrane_ridge_trace"
          : "membrane_ridge_read",
      priority: 805,
      guideLine: ridge.completed
        ? adjacent.enteredTerritory
          ? alive.active
            ? (alive.completedCount ?? 0) >= (alive.encounterCount ?? 6)
              ? (alive.ongoingResponseCycles ?? 0) > 0
                ? `Gathering Ground remembers the pressure you bring. Its current read is ${alive.memory?.mode ?? "quiet_observer"}, and understood relationships are answering again.`
                : "Gathering Ground is still alive after the first six reads. Release, move, and return to the Watcher or relays; understood relationships can answer again."
              : "Gathering Ground is not a destination object anymore. Watch what the local organisms and Host matter do before deciding how to answer."
            : "You are inside the larger Host body now. The released ridge remains behind you as part of the same space."
          : adjacent.relationshipEstablished
            ? "The larger body is answering before you reach it. The living connection now has a readable relationship."
            : observationCount > 0
              ? "Gathering Ground has answered your Pulse. Hold Stabilize toward the same body to establish the relationship."
              : attentionOwned
                ? "Your attention has found Gathering Ground. Pulse the large body itself; the whole territory is the target."
                : "The ridge has released. Look toward the large living body beyond it until your attention settles there."
        : ridge.tracing
          ? `The membrane is reading your path. ${ridge.readCount ?? 0}/${ridge.contourCount ?? 3} contours have answered.`
          : `The ridge is carrying three living pressure contours. ${ridge.readCount ?? 0}/${ridge.contourCount ?? 3} have answered.`,
      objectiveLine: ridge.completed
        ? adjacent.enteredTerritory
          ? alive.active
            ? (alive.family?.ambient?.completed ?? 0) < 2
              ? "Watch the perimeter Watcher and the relay exchange long enough to read their ambient behavior."
              : (alive.family?.reactive?.completed ?? 0) < 2
                ? "Try Stabilize + Pulse near the Watcher, then Stabilize + Absorb near a relay."
                : (alive.family?.cross_territory?.completed ?? 0) < 2
                  ? "Watch the local answers travel back toward Membrane Ridge."
                  : (alive.ongoingResponseCycles ?? 0) > 0
                    ? "Keep wandering and revisit the Watcher or relays; compare how the same relationships answer under the ecology's retained memory."
                    : "Release the relationship, move away, and return later to see whether the understood ecology answers again."
            : "Explore Gathering Ground and look back across the continuous Aperture space."
          : adjacent.traversalOpen && observationCount > 0
            ? "Follow the bright living connection into Gathering Ground."
            : relationshipOwned || adjacent.relationshipEstablished
              ? "Keep the larger body in view, then follow the opened living connection."
              : attentionOwned
                ? "Pulse Gathering Ground while it owns your attention."
                : "Look toward Gathering Ground; no hidden point is required."
        : ridge.tracing
          ? "Keep moving through this bright contour until it settles."
          : "Enter any unread bright contour and move through it; order does not matter.",
      debugFallback: `ridge reads ${ridge.readCount ?? 0}/${ridge.contourCount ?? 3} | active ${ridge.contourIndex ?? 1} | progress ${Math.round((ridge.activeContourProgress ?? 0) * 100)}% | tracing ${Boolean(ridge.tracing)} | complete ${Boolean(ridge.completed)} | GG attention ${attentionOwned ? "YES" : "no"} | OBS ${observationCount} | REL ${adjacent.relationshipEstablished ? "Y" : "N"} | ${adjacent.traversalOpen ? "OPEN" : "CLOSED"}`,
      tone: ridge.completed
        ? attentionOwned
          ? "gathering_ground_attention_owned"
          : "gathering_ground_attention_handoff"
        : ridge.tracing ? "membrane_ridge_motion" : "membrane_ridge_approach",
      contentOwner: "MembraneRidgeGameplaySystem + ApertureAdjacentTerritorySystem",
      source: "activeRegionState"
    };
  }

  apertureFieldsArrivalPrompt(frameState) {
    if (frameState.activeCellId !== "CELL_APERTURE_FIELDS_ARRIVAL_001") return null;
    const arrival = frameState.apertureFieldsArrival ?? {};
    return {
      id: "GUIDE_PROMPT_APERTURE_FIELDS_ARRIVAL_HC014J",
      beat: arrival.stage ?? "first_field_arrival",
      priority: 730,
      guideLine: arrival.signalPlainCompleted
        ? "The Signal Plain has answered. The field is carrying that change deeper."
        : "The chamber grammar has opened. Let one distant signal orient the field before you read its ecology.",
      objectiveLine: arrival.nextAction ?? (arrival.signalPlainCompleted
        ? "Move deeper toward Membrane Ridge."
        : "Cross the Arrival Shelf toward the Signal Plain landmark."),
      debugFallback: `arrival reveal ${Math.round((arrival.reveal ?? 0) * 100)}% | primary ${arrival.primaryLandmarkId ?? "none"} dist ${Number.isFinite(arrival.primaryLandmarkDistance) ? arrival.primaryLandmarkDistance.toFixed(1) : "?"} | guide ${arrival.guideSightlineActive ? "ON" : "off"} | ecology mounted ${Boolean(arrival.fullEcologyMounted)}`,
      tone: "first_field_arrival",
      contentOwner: "ApertureFieldsArrivalSystem",
      source: "activeRegionState"
    };
  }

  nextRoutePressurePrompt(frameState) {
    if (frameState.hubChamberFoundation?.active) return null;
    const pressure = frameState.signalChorusNextRoutePressure ?? {};
    if (!pressure.active) return null;
    return {
      id: "GUIDE_PROMPT_SIGNAL_CHORUS_NEXT_ROUTE_PRESSURE_HC005D",
      beat: pressure.stage ?? "combward_pressure_readable",
      priority: 540,
      guideLine: pressure.guideLine ?? "A combed cadence gathers beyond the Chorus.",
      objectiveLine: pressure.objectiveLine ?? "Observe the pressure. It is not open.",
      debugFallback: pressure.nextAction ?? "Learn the direction. No route input is accepted.",
      tone: "combward_pressure"
    };
  }

  signalReturnStatePrompt(frameState) {
    if (frameState.hubChamberFoundation?.active) return null;
    const returnState = frameState.signalChorusReturnState ?? {};
    if (!returnState.active) return null;
    return {
      id: "GUIDE_PROMPT_SIGNAL_CHORUS_RETURN_STATE_HC005B",
      beat: returnState.stage ?? "signal_chorus_return_state_held",
      priority: 520,
      guideLine: returnState.guideLine ?? "The Chorus holds the Grave reading.",
      objectiveLine: returnState.objectiveLine ?? "No new route is active in this pass.",
      debugFallback: returnState.nextAction ?? "Hold the returned reading.",
      tone: "signal_return_state_held"
    };
  }

  returnContinuityPrompt(frameState) {
    const continuity = frameState.graveReturnContinuity ?? {};
    if (!continuity.active) return null;
    return {
      id: "GUIDE_PROMPT_GRAVE_RETURN_CONTINUITY_HC005A",
      beat: continuity.stage ?? "grave_return_continuity",
      priority: 500,
      guideLine: continuity.guideLine ?? "Follow the remembered current.",
      objectiveLine: continuity.objectiveLine ?? continuity.nextAction ?? "Move into the remembered current.",
      debugFallback: continuity.nextAction ?? "Move into the remembered current.",
      tone: continuity.completed ? "signal_return_complete" : "grave_return_current"
    };
  }

  fallbackPrompt(frameState) {
    const fallbackRecipe = this.recipeDataSystem.data.guidePromptRecipes.get("GUIDE_PROMPT_FALLBACK_001");
    const morph = selectCurrentMorphState(frameState);
    const activeNext = frameState.openingFlow?.worldFacingObjective
      || this.activeNextAction(frameState)
      || morph.nextAction
      || "Move, pulse, and absorb only when the bond feels safe.";

    return {
      id: fallbackRecipe?.id ?? "GUIDE_PROMPT_RUNTIME_FALLBACK",
      beat: fallbackRecipe?.beat ?? "fallback",
      priority: fallbackRecipe?.priority ?? 1,
      guideLine: fallbackRecipe?.guideLine ?? "Stay close to what answers.",
      objectiveLine: activeNext,
      debugFallback: activeNext,
      tone: fallbackRecipe?.tone ?? "fallback"
    };
  }

  applyPrompt(prompt, frameState) {
    const now = frameState.runtimeSeconds ?? 0;
    if (prompt.id !== this.activePromptId) {
      this.activePromptId = prompt.id;
      this.activeSince = now;
    }

    const objectiveLine = this.resolveObjectiveLine(prompt, frameState);

    frameState.guidePrompt = {
      active: true,
      id: prompt.id,
      beat: prompt.beat ?? "unknown",
      tone: prompt.tone ?? "neutral",
      guideLine: prompt.guideLine ?? "Stay close to what answers.",
      objectiveLine,
      debugFallback: prompt.debugFallback ?? "no debug fallback supplied",
      priority: prompt.priority ?? 0,
      age: now - this.activeSince,
      source: prompt.source ?? "guidePromptRecipes",
      activeRegionId: this.lastPromptRegionId,
      regionPromptEpoch: this.promptRegionEpoch,
      contentOwner: prompt.contentOwner ?? "GuidePromptSystem",
      selectionOwner: "GuidePromptSystem",
      internalStagePlayerFacing: false,
      primaryInstructionLayer: true,
      noDialogueTree: true,
      noQuestLog: true
    };
  }

  updatePanel(frameState) {
    if (!this.promptEl) return;

    const prompt = frameState.guidePrompt ?? this.initialState();
    const debugMode = frameState.debugDisplay?.mode ?? "compact";
    const showMeta = debugMode === "full";

    this.guideLineEl.textContent = prompt.guideLine ?? "Stay close to what answers.";
    this.objectiveEl.textContent = prompt.objectiveLine ?? "Move, pulse, and listen.";
    this.metaEl.textContent = showMeta
      ? `${prompt.id ?? "none"} // ${prompt.beat ?? "unknown"} // ${prompt.tone ?? "neutral"}`
      : "";

    const stack = frameState.promptStack ?? {};
    const guidePrimary = stack.guidePrimary !== false;
    const debugHidden = debugMode === "hidden";
    const delegatedToPlaytestHud = debugHidden;

    frameState.guidePrompt.panelVisible = !delegatedToPlaytestHud;
    frameState.guidePrompt.presentationDelegatedTo = delegatedToPlaytestHud
      ? "PlaytestHudSystem"
      : "GuidePromptSystem";
    frameState.guidePrompt.primaryInstructionLayer = !delegatedToPlaytestHud;

    this.promptEl.style.display = delegatedToPlaytestHud ? "none" : "block";
    this.promptEl.style.opacity = prompt.active ? "1" : "0.68";
    // Keep the Guide panel in a dedicated lower lane. The playtest HUD remains
    // top-left and context/action prompts remain below this panel.
    this.promptEl.style.bottom = debugHidden ? "92px" : guidePrimary ? "96px" : "112px";
    this.promptEl.style.maxHeight = "min(168px, calc(100vh - 220px))";
    this.promptEl.style.overflow = "hidden";
    this.promptEl.style.width = debugHidden
      ? "min(620px, calc(100vw - 36px))"
      : "min(560px, calc(100vw - 40px))";
    this.promptEl.style.background = debugHidden
      ? "rgba(4, 9, 13, 0.70)"
      : "rgba(4, 9, 13, 0.58)";
    this.promptEl.style.borderColor = this.borderForTone(prompt.tone);
    this.promptEl.style.boxShadow = guidePrimary
      ? "0 0 28px rgba(91, 218, 255, 0.12)"
      : "0 0 24px rgba(91, 218, 255, 0.09)";
  }

  initialState() {
    return {
      active: false,
      id: "none",
      beat: "none",
      tone: "neutral",
      guideLine: "The lantern is waiting.",
      objectiveLine: "Move, pulse, and listen.",
      debugFallback: "none",
      priority: 0,
      age: 0,
      source: "not_initialized",
      primaryInstructionLayer: true,
      noDialogueTree: true,
      noQuestLog: true
    };
  }

  activeNextAction(frameState) {
    const graveExit = frameState.graveExitReadiness ?? {};
    const graveContinuity = frameState.graveRouteContinuityPlanning ?? {};
    const seamArrivalPlan = frameState.graveScarMemorySeamArrivalPlanning ?? {};
    const seamRuntimeArrival = frameState.graveScarMemorySeamRuntimeArrival ?? {};
    const seamFirstRead = frameState.graveScarMemorySeamFirstRead ?? {};
    const seamMicroExit = frameState.graveSeamContinuityMicroExit ?? {};
    const graveReturn = frameState.graveReturnContinuity ?? {};
    const graveRouteLock = frameState.graveRouteLock ?? {};
    const gravePostSeam = frameState.graveBedPostSeamResponse ?? {};
    const graveStability = frameState.graveLoopStability ?? {};
    const graveLoop = frameState.graveReadBeforeAbsorb ?? {};
    const graveMorph = frameState.graveRouteMorph ?? {};
    const graveArrival = frameState.graveArrivalReadability ?? {};
    const bloomLoop = frameState.bloomResidueInteraction ?? {};
    const bloomArrival = frameState.bloomResidueArrival ?? {};
    const signalLoop = frameState.signalChorusInteraction ?? {};
    const signalArrival = frameState.signalChorusArrival ?? {};
    const scarLoop = frameState.scarFlowInteraction ?? {};
    const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
    const scarArrival = frameState.scarFlowArrival ?? {};
    const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};
    const nextRoutePressure = frameState.signalChorusNextRoutePressure ?? {};

    if (guideThreshold.active) return guideThreshold.nextAction ?? "Follow the movement-led Guide Threshold sequence.";
    if (layeredInteraction.active) return layeredInteraction.nextAction ?? "Follow the layered resonance sequence.";
    if (nextRoutePressure.active) return nextRoutePressure.nextAction ?? "Observe the combward pressure; no route input is accepted.";
    if (graveReturn.active) return graveReturn.nextAction ?? "Follow the remembered return current.";
    if (graveRouteLock.active) return graveRouteLock.nextAction ?? "The Grave memory loop is complete.";
    if (gravePostSeam.active) return gravePostSeam.nextAction ?? "Read the Grave bed after returning from the seam; do not absorb.";
    if (seamMicroExit.active) return seamMicroExit.nextAction ?? "Pulse the closed suture to fold back; do not absorb.";
    if (seamFirstRead.active) return seamFirstRead.nextAction ?? "Pulse and read the seam; do not absorb.";
    if (seamRuntimeArrival.active) return seamRuntimeArrival.nextAction ?? "Stay with the seam arrival. The loop is deferred.";
    if (graveExit.active && graveContinuity.active && seamArrivalPlan.active) return seamArrivalPlan.nextAction ?? "The seam arrival is planned, not active.";
    if (graveExit.active && graveContinuity.active) return graveContinuity.nextAction ?? "The scar lock points toward a later seam, not a doorway in this pass.";
    if (graveExit.active) return graveExit.nextAction ?? "The scar lock is readable, but no exit activates yet.";
    if (graveStability.active) return graveStability.nextAction ?? "Let the Grave settle; exit readiness is planning-only.";
    if (graveLoop.active) return graveLoop.nextAction ?? "Read the Grave remains in order; receive only the settled silt trace.";
    if (graveArrival.active) return graveArrival.nextAction ?? "Read before you consume. Leave what is not ready.";
    if (graveMorph.completed || graveMorph.phase === "completed_in_grave_memory_residue_bed") return graveMorph.nextAction ?? "Read before you consume. Leave what is not ready.";
    if ((graveMorph.progress ?? 0) > 0 || graveMorph.triggerReady) return graveMorph.nextAction;
    if (bloomLoop.active) return bloomLoop.preparedForNextBranch ? (graveMorph.nextAction ?? "Pulse the stable residue toward the Grave route") : bloomLoop.nextAction;
    if (bloomArrival.active) return bloomArrival.nextAction;
    if (signalLoop.active) return signalLoop.nextAction;
    if (signalArrival.active) return signalArrival.nextAction;
    if (scarLoop.active) return scarLoop.nextAction;
    if (scarArrival.active) return scarArrival.nextAction;
    return null;
  }

  resolveObjectiveLine(prompt, frameState) {
    const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
    if (guideThreshold.active) {
      return guideThreshold.objectiveLine ?? "Move with the Guide Threshold current.";
    }

    const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};
    if (layeredInteraction.active) {
      return layeredInteraction.objectiveLine ?? "Follow the layered resonance sequence.";
    }

    const nextRoutePressure = frameState.signalChorusNextRoutePressure ?? {};
    if (nextRoutePressure.active) {
      return nextRoutePressure.objectiveLine ?? "Observe the combward pressure. It is readable, but it is not open.";
    }

    const graveReturn = frameState.graveReturnContinuity ?? {};
    if (graveReturn.active) {
      return graveReturn.objectiveLine ?? graveReturn.nextAction ?? "Follow the remembered return current.";
    }

    const graveRouteLock = frameState.graveRouteLock ?? {};
    if (graveRouteLock.active) {
      return graveRouteLock.objectiveLine ?? "Hold the reading. The protected remains stay intact.";
    }

    const gravePostSeam = frameState.graveBedPostSeamResponse ?? {};
    if (
      frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001" &&
      gravePostSeam.active &&
      !gravePostSeam.completed
    ) {
      const focus = gravePostSeam.currentFocus ?? "none";
      const next = gravePostSeam.nextAction ?? "Pulse-read the protected Grave remains. Do not absorb.";
      return focus !== "none" ? `${next} Target: ${focus}.` : next;
    }

    const bloomLoop = frameState.bloomResidueInteraction ?? {};
    if (
      frameState.activeCellId === "CELL_BLOOM_RESIDUE_FORK_001" &&
      bloomLoop.active
    ) {
      const focus = bloomLoop.currentFocus ?? "none";
      const graveMorph = frameState.graveRouteMorph ?? {};
      const next = bloomLoop.preparedForNextBranch
        ? (graveMorph.nextAction ?? "Release pulse, then pulse the stable residue once more to form the Grave bed.")
        : (bloomLoop.nextAction ?? "Pulse the highlighted Bloom object.");
      return focus !== "none" ? `${next} Target: ${focus}.` : next;
    }

    return prompt.objectiveLine ?? "Move, pulse, and listen.";
  }

  borderForTone(tone) {
    if (tone === "protective") return "rgba(146, 244, 255, 0.32)";
    if (tone === "cautious") return "rgba(255, 188, 116, 0.40)";
    if (tone === "threshold") return "rgba(255, 218, 154, 0.42)";
    if (tone === "wonder") return "rgba(185, 194, 255, 0.38)";
    if (tone === "afterfork") return "rgba(255, 172, 211, 0.34)";
    if (tone === "lock") return "rgba(198, 255, 210, 0.42)";
    if (tone === "grave_return_current") return "rgba(189, 239, 255, 0.92)";
    if (tone === "signal_return_complete") return "rgba(255, 240, 184, 0.94)";
    if (tone === "combward_pressure") return "rgba(255, 235, 166, 0.96)";
    if (tone === "grave_route_locked") return "rgba(205, 255, 218, 0.92)";
    if (tone === "grave_post_seam_complete") return "rgba(255, 226, 184, 0.90)";
    if (tone === "grave_post_seam") return "rgba(255, 218, 176, 0.82)";
    if (tone === "grave_seam_micro_exit") return "rgba(255, 230, 188, 0.86)";
    if (tone === "grave_seam_first_read") return "rgba(255, 224, 196, 0.78)";
    if (tone === "grave_seam_complete") return "rgba(255, 242, 205, 0.82)";
    if (tone === "grave_seam_arrival") return "rgba(255, 242, 205, 0.72)";
    if (tone === "grave_continuity") return "rgba(255, 235, 190, 0.64)";
    if (tone === "grave_exit_readiness") return "rgba(255, 225, 178, 0.58)";
    if (tone === "grave_stability") return "rgba(255, 210, 168, 0.48)";
    if (tone === "grave") return "rgba(216, 177, 162, 0.42)";
    return "rgba(150, 238, 255, 0.24)";
  }
}
