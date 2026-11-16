import { readHostLanguage } from '../language/HostLanguageGrammar.js';
// CORE-READ1: describe the active architecture separately from its earned ceiling.
// Presentation only; the progression and Core owners retain all authority.
export function describeCoreArchitecture(engine = {}, progression = {}) {
  const phase = engine.phaseCount;
  if (![3, 6, 12].includes(phase)) return 'engine unavailable';
  const unlocked = progression.unlockedPhaseCount ?? engine.progressionUnlockedPhaseCount ?? 3;
  const source = phase !== unlocked ? 'debug preview' : phase === 3 ? 'base' : 'earned';
  const structure = phase === 3 ? 'one per function' : phase === 6 ? 'two per function' : 'four per function';
  return `${phase}-phase · ${structure} · ${source}`;
}

// The reserve owner reports realized savings; previews and idle never light this.
export function describePairedDemand(performance = {}) {
  const c = performance.endurance?.coordination;
  return c?.active && c.reserveSavedThisUpdate > 0 && c.factor < 1
    ? `paired drain −${Math.round((1 - c.factor) * 100)}%` : '';
}

export class PlaytestHudSystem {
  constructor({ recipeDataSystem, frameState }) {
    if (!recipeDataSystem) throw new Error("[PlaytestHudSystem] recipeDataSystem is required.");
    if (!frameState) throw new Error("[PlaytestHudSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
    this.config = null;
    this.el = null;
    this.titleEl = null;
    this.objectiveEl = null;
    this.actionEl = null;
    this.statusEl = null;
    this.auditEl = null;
    this.controlsEl = null;
    this.audioGateEl = null;
  }

  init() {
    this.config = this.recipeDataSystem.data.debugHiddenPlaytestMode ?? null;
    this.createPanel();
    this.frameState.playtestHud = this.initialState();
  }

  update(_dt, frameState) {
    if (!this.el) return;

    const debugMode = frameState.debugDisplay?.mode ?? this.config?.defaultDebugMode ?? "hidden";
    const visible = debugMode === "hidden";
    const state = this.resolveHudState(frameState, visible);

    frameState.playtestHud = state;
    this.applyPanel(state, visible);
  }

  createPanel() {
    this.el = document.createElement("div");
    this.el.id = "playtest-hud-panel";

    Object.assign(this.el.style, {
      position: "fixed",
      left: "14px",
      top: "14px",
      width: "min(360px, calc(100vw - 28px))",
      padding: "10px 12px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      lineHeight: "1.35",
      color: "#e8fbff",
      background: "rgba(3, 8, 12, 0.56)",
      border: "1px solid rgba(140, 230, 255, 0.22)",
      borderRadius: "12px",
      pointerEvents: "none",
      zIndex: "17",
      boxShadow: "0 0 22px rgba(90, 210, 255, 0.08)",
      transition: "opacity 160ms ease-out, transform 160ms ease-out"
    });

    this.titleEl = document.createElement("div");
    Object.assign(this.titleEl.style, {
      fontSize: "10px",
      letterSpacing: "0.11em",
      color: "#9defff",
      opacity: "0.74",
      marginBottom: "5px"
    });

    this.objectiveEl = document.createElement("div");
    Object.assign(this.objectiveEl.style, {
      color: "#fff4d9",
      marginBottom: "5px"
    });

    this.actionEl = document.createElement("div");
    Object.assign(this.actionEl.style, {
      color: "#dffcff",
      marginBottom: "5px"
    });

    this.statusEl = document.createElement("div");
    Object.assign(this.statusEl.style, {
      color: "#c9e8ff",
      opacity: "0.82",
      marginBottom: "6px"
    });

    this.auditEl = document.createElement("div");
    Object.assign(this.auditEl.style, {
      color: "#ffe0a8",
      fontSize: "10px",
      lineHeight: "1.32",
      opacity: "0.86",
      marginBottom: "5px",
      whiteSpace: "pre-wrap"
    });

    this.controlsEl = document.createElement("div");
    Object.assign(this.controlsEl.style, {
      color: "#b8d6df",
      fontSize: "10px",
      opacity: "0.70"
    });

    this.el.append(this.titleEl, this.objectiveEl, this.actionEl, this.statusEl, this.auditEl, this.controlsEl);
    document.body.appendChild(this.el);

    this.audioGateEl = document.createElement("div");
    this.audioGateEl.id = "playtest-audio-unlock-gate";
    this.audioGateEl.setAttribute("role", "button");
    this.audioGateEl.setAttribute("aria-label", "Enable BLOB playtest audio");
    Object.assign(this.audioGateEl.style, {
      position: "fixed",
      left: "50%",
      bottom: "14px",
      transform: "translateX(-50%)",
      width: "min(760px, calc(100vw - 28px))",
      boxSizing: "border-box",
      padding: "10px 14px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.04em",
      textAlign: "center",
      color: "#fff7dc",
      background: "rgba(48, 16, 7, 0.94)",
      border: "2px solid rgba(255, 192, 112, 0.96)",
      borderRadius: "10px",
      pointerEvents: "auto",
      cursor: "pointer",
      zIndex: "60",
      boxShadow: "0 0 28px rgba(255, 150, 72, 0.30)",
      userSelect: "none"
    });
    const requestUnlock = (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.dispatchEvent(new CustomEvent("blob:audio-unlock-request"));
    };
    this.audioGateEl.addEventListener("pointerdown", requestUnlock);
    this.audioGateEl.addEventListener("mousedown", (event) => { event.preventDefault(); event.stopPropagation(); });
    this.audioGateEl.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); });
    document.body.appendChild(this.audioGateEl);
  }

  resolveHudState(frameState, visible) {
    const guide = frameState.guidePrompt ?? {};
    const target = frameState.targeting ?? {};
    const opening = frameState.openingFlow ?? {};
    const promptStack = frameState.promptStack ?? {};
    const activeCellId = frameState.activeCellId ?? "none";
    const inSurfaceWake = activeCellId === "CELL_MEMBRANE_NURSERY_001";
    const inGuideThreshold = activeCellId === "CELL_SCAR_FLOW_FOLD_001";
    const inHub = activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001";
    const inGraveMemory = activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
    const inVascularRhythm = activeCellId === "CELL_VASCULAR_RHYTHM_ROUTE_001";
    const inSiltPressure = activeCellId === "CELL_SILT_PRESSURE_ROUTE_001";
    const inCombThreshold = activeCellId === "CELL_COMB_THRESHOLD_FILTER_001";
    const inApertureFields = activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001";
    const firstMinuteComplete = this.isFirstMinuteComplete(frameState);
    const optionalForkActive = activeCellId === "CELL_BLOOM_RESIDUE_FORK_001";
    const graveArrival = frameState.graveArrivalReadability ?? {};
    const graveLoop = frameState.graveReadBeforeAbsorb ?? {};
    const graveStability = frameState.graveLoopStability ?? {};
    const graveExit = frameState.graveExitReadiness ?? {};
    const graveContinuity = frameState.graveRouteContinuityPlanning ?? {};
    const seamArrivalPlan = frameState.graveScarMemorySeamArrivalPlanning ?? {};
    const seamRuntimeArrival = frameState.graveScarMemorySeamRuntimeArrival ?? {};
    const seamFirstRead = frameState.graveScarMemorySeamFirstRead ?? {};
    const seamMicroExit = frameState.graveSeamContinuityMicroExit ?? {};
    const graveReturn = frameState.graveReturnContinuity ?? {};
    const signalReturnState = frameState.signalChorusReturnState ?? {};
    const surfaceWakeInteraction = frameState.surfaceWakeLayeredInteraction ?? {};
    const surfaceWakeEcology = frameState.surfaceWakeEcology ?? {};
    const nurseryCircuit = frameState.nurseryCircuit ?? {};
    const tenderCompanion = frameState.tenderCompanion ?? {};
    const coreGrowth = frameState.coreGrowth ?? {};
    const surfaceMorph = frameState.localCellMorph ?? {};
    const guideThresholdGameplay = frameState.guideThresholdGameplay ?? {};
    const guideThresholdInteraction = frameState.guideThresholdLayeredInteraction ?? {};
    const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};
    const inspectionCamera = frameState.tightInspectionCamera ?? {};
    const coreWorkManipulation = frameState.coreWorkManipulation ?? {};
    const spatialCoreChemistry = frameState.spatialCoreChemistry ?? {};
    const coreChemistryOutput = frameState.coreChemistryOutput ?? {};
    const coreContactLanguage = frameState.coreContactLanguage ?? {};
    const playerAttachment = frameState.playerAttachment ?? {};
    const nextRoutePressure = frameState.signalChorusNextRoutePressure ?? {};
    const hubFoundation = frameState.hubChamberFoundation ?? {};
    const hubCoreSpatialMirror = frameState.hubCoreSpatialMirror ?? {};
    const returnTraversal = frameState.firstSliceReturnTraversal ?? {};
    const hostAudio = frameState.hostAudio ?? {};
    const coreEngine = frameState.coreEngine ?? {};
    const corePerformance = frameState.corePerformance ?? {};
    const coreSensoryResponse = frameState.coreSensoryResponse ?? {};
    const interactionComposition = frameState.interactionComposition ?? {};
    const testPlatform = frameState.debugTestPlatform ?? {};
    const hubInvestigation = frameState.hubInvestigationGameplay ?? {};
    const graveMemoryRoute = frameState.graveMemoryRoute ?? {};
    const vascularRhythmRoute = frameState.vascularRhythmRoute ?? {};
    const siltPressureRoute = frameState.siltPressureRoute ?? {};
    const combThresholdPlayable = frameState.combThresholdPlayable ?? {};
    const apertureFieldsArrival = frameState.apertureFieldsArrival ?? {};
    const adjacentHostTerritory = frameState.adjacentHostTerritory ?? {};
    const gatheringGroundAlive = frameState.gatheringGroundAlive ?? {};
    const gatheringResponseRead = gatheringGroundAlive.responseRead ?? {};
    const controllerTargetingAudit = frameState.controllerTargetingAudit ?? {};
    const surfaceCapabilityAudit = frameState.surfaceCapabilityAudit ?? {};
    const signalPlainEcology = frameState.signalPlainEcology ?? {};
    const membraneRidgeGameplay = frameState.membraneRidgeGameplay ?? {};
    const graveRouteLock = frameState.graveRouteLock ?? {};
    const gravePostSeam = frameState.graveBedPostSeamResponse ?? {};
    const graveRouteActive = activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001" || Boolean(frameState.graveRouteMorph?.completed);
    const graveRouteMorphing = Boolean((frameState.graveRouteMorph?.progress ?? 0) > 0 && !frameState.graveRouteMorph?.completed);
    const optionalForkComplete = optionalForkActive && this.isBloomForkStable(frameState);
    const auditId = (id = "none") => id === "gathering_ground_cluster"
      ? "GG"
      : id === "none"
        ? "-"
        : this.shorten(id.replace(/^gathering_ground_/, "gg_").replace(/_001$/, ""), 14);
    const auditDistance = (value) => Number.isFinite(value) && value > 0 ? value.toFixed(1) : "-";
    const targetingAuditLine = inApertureFields && ["HC-031W", "HC-031W1"].includes(controllerTargetingAudit.pass)
      ? `W1 CTL LT${Number(controllerTargetingAudit.stabilizeTriggerValue ?? 0).toFixed(2)} RS${Number(controllerTargetingAudit.rightStickMagnitude ?? 0).toFixed(2)} · C ${auditId(controllerTargetingAudit.candidateId)}@${auditDistance(controllerTargetingAudit.candidateDistance)} · A ${auditId(controllerTargetingAudit.attentionTargetId)}@${auditDistance(controllerTargetingAudit.attentionDistance)} · R ${auditId(controllerTargetingAudit.relationshipTargetId)}@${auditDistance(controllerTargetingAudit.relationshipDistance)} · ${controllerTargetingAudit.findingCode ?? "observe_only"}`
      : "";
    const surfaceAuditLine = inApertureFields && surfaceCapabilityAudit.pass === "HC-031W"
      ? `SURF ${surfaceCapabilityAudit.authoredSurfaceCount ?? 0} · ${surfaceCapabilityAudit.nearestValid ? `${surfaceCapabilityAudit.nearestProfileId ?? "unknown"}@${auditDistance(surfaceCapabilityAudit.nearestDistance)}` : "NONE"} · ${surfaceCapabilityAudit.findingCode ?? "audit_pending"}`
      : "";
    const auditLine = [targetingAuditLine, surfaceAuditLine].filter(Boolean).join("\n");
    // One player-facing vocabulary shared across Silt, Vascular, Grave and Hub.
    // This readout does not act as an input owner or progress/receipt signal.
    const languageRead = readHostLanguage(frameState);
    const languageLine = languageRead?.lines?.join("\n") ?? "";

    const selectedChemistry = coreWorkManipulation.selectedChemistry ?? spatialCoreChemistry.selectedPlacement ?? null;
    const topology = coreWorkManipulation.topology ?? spatialCoreChemistry.topology ?? null;
    const cloudPattern = coreWorkManipulation.cloudPattern ?? spatialCoreChemistry.cloudPattern ?? null;
    const cloudRead = cloudPattern && cloudPattern.stablePatternId !== "none"
      ? ` / cloud ${cloudPattern.stablePatternLabel}${cloudPattern.popActive ? " · POP" : ""}`
      : "";
    const engineRead = coreEngine.active
      ? ` / engine ${describeCoreArchitecture(coreEngine, frameState.returnRegionEngine)} · ${Math.round(coreEngine.rpm ?? 3000)} RPM · ${coreEngine.currentPhaseLabel ?? "pulse_1"}`
      : "";
    const activeVerbPhysiology = frameState.input?.pulseHeld || frameState.input?.pulsePressed
      ? `Pulse charge x${corePerformance.verbModifiers?.pulse?.chargeRateMultiplier ?? 1} / cost x${corePerformance.verbModifiers?.pulse?.costMultiplier ?? 1}`
      : frameState.input?.absorbHeld
        ? `Absorb ${Math.round((corePerformance.verbModifiers?.absorb?.commitment01 ?? 0) * 100)}% / power x${corePerformance.verbModifiers?.absorb?.powerMultiplier ?? 1} / move x${corePerformance.verbModifiers?.absorb?.mobilityMultiplier ?? 1}`
        : frameState.input?.stabilizeHeld
          ? `Stabilize ${Math.round((corePerformance.verbModifiers?.stabilize?.commitment01 ?? 0) * 100)}% / coherence x${corePerformance.verbModifiers?.stabilize?.coherenceMultiplier ?? 1} / move x${corePerformance.verbModifiers?.stabilize?.mobilityMultiplier ?? 1}`
          : "";
    const pairedDemandRead = describePairedDemand(corePerformance);
    const performanceRead = corePerformance.active
      ? ` / drive ${corePerformance.personality ?? "triadic balance"} · reserve ${corePerformance.endurance?.reservePercent ?? 100}% · boost x${corePerformance.movementModifiers?.boostSpeedMultiplier ?? 1}${activeVerbPhysiology ? ` · ${activeVerbPhysiology}` : ""}${pairedDemandRead ? ` · ${pairedDemandRead}` : ""}`
      : "";
    const stateLabel = inspectionCamera.coreWorkActive
      ? `Core Work: ${coreWorkManipulation.candidateCount ?? 0} pieces${topology ? ` / ${topology.label} ${topology.distribution}` : ""}${cloudRead}${engineRead}${performanceRead} / ${coreWorkManipulation.held ? "Guide holding" : "selected"} ${coreWorkManipulation.selectedPieceLabel ?? "none"}${selectedChemistry ? ` / ${selectedChemistry.zoneLabel} · ${selectedChemistry.interactionLabel}` : ((coreWorkManipulation.candidateCount ?? 0) > 0 ? ` / depth ${coreWorkManipulation.selectedDepthPercent ?? 0}%` : "")}`
      : inspectionCamera.active
        ? `Core inspection: ${inspectionCamera.focusMode === "authored_interaction" ? `focused / ${inspectionCamera.focusLabel ?? "readable interaction"}` : "self / orbitable"}${engineRead}${performanceRead}`
      : inSurfaceWake && surfaceWakeInteraction.active
      ? surfaceWakeInteraction.completed && !surfaceMorph.seedAbsorbed
        ? "Surface Wake: listening learned / seed presented"
        : surfaceMorph.seedAbsorbed && !surfaceMorph.completed
          ? `Surface Wake: ${coreGrowth.displayStage ?? "Core"} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% / exit seam readable`
          : nurseryCircuit.active
            ? `Surface Wake: ${nurseryCircuit.packetActive ? (nurseryCircuit.packetIdentified ? "matter read" : "matter moving") : (nurseryCircuit.foldInvitation ? "Fold revealed" : "nursery breathing")} / Tender ${Math.round((nurseryCircuit.tenderIntegrity ?? 0) * 100)}%`
            : `${surfaceWakeInteraction.hudStatus ?? "Surface Wake: layered response"} / ${Math.round((surfaceWakeInteraction.progress ?? 0) * 100)}%`
      : inGuideThreshold && guideThresholdGameplay.active && !guideThresholdGameplay.triggerReady
      ? `Guide Threshold: living current / ${Math.round((guideThresholdGameplay.familiarity ?? 0) * 100)}% familiarity`
      : inGuideThreshold && guideThresholdInteraction.active
      ? `${guideThresholdInteraction.hudStatus ?? "Guide Threshold: movement-led reading"} / ${Math.round((guideThresholdInteraction.progress ?? 0) * 100)}%`
      : inHub && layeredInteraction.active && !(layeredInteraction.completed && hubFoundation.active)
      ? `${layeredInteraction.hudStatus ?? "Signal Chorus: layered resonance"} / ${Math.round((layeredInteraction.progress ?? 0) * 100)}%`
      : inHub && hubInvestigation.active && !hubInvestigation.investigationReady
      ? `Hub Investigation: ${hubInvestigation.routeReadCount ?? 0}/${hubInvestigation.routeCount ?? 3} routes / memory ${hubInvestigation.memoryRead ? "read" : "unread"}`
      : inHub && hubFoundation.active
      ? `Hub Junction: ${
          hubFoundation.vascularRhythmRetained
            ? "Vascular cadence retained"
            : hubFoundation.completed ? "three routes readable" : "forming"
        } / ${Math.round((hubFoundation.progress ?? 0) * 100)}%${hubCoreSpatialMirror.active ? ` / mirror ${hubCoreSpatialMirror.topologyLabel ?? "Core"} ${hubCoreSpatialMirror.distribution ?? ""}` : ""}`
      : inGraveMemory && frameState.graveResonanceGameplay?.active
      ? `Grave II: ${frameState.graveResonanceGameplay.guidanceStage ?? "active"} / ${Math.round((frameState.graveResonanceGameplay.regional?.resolutionHold01 ?? 0) * 100)}% settled`
      : inGraveMemory
      ? `Grave Memory: ${
          graveMemoryRoute.graveMemoryImprintCommitted
            ? "memory pearl retained"
            : (graveMemoryRoute.residueRecoilRisk ?? 0) > (graveMemoryRoute.maximumSafeRecoilRisk ?? 0.18)
              ? `residue recoil ${Math.round((graveMemoryRoute.residueRecoilRisk ?? 0) * 100)}%`
              : graveMemoryRoute.safeTransferReady || (graveMemoryRoute.safeTransferProgress ?? 0) > 0
                ? `safe trace ${Math.round((graveMemoryRoute.safeTransferProgress ?? 0) * 100)}%`
                : `${graveMemoryRoute.readCount ?? 0}/${graveMemoryRoute.requiredReadCount ?? 4} read`
        } / ${Math.round((graveMemoryRoute.progress ?? 0) * 100)}%`
      : inVascularRhythm
      ? `Vascular Rhythm: ${
          vascularRhythmRoute.completed
            ? "return current formed"
            : vascularRhythmRoute.desynchronized
              ? `reweaving ${Math.round((1 - (vascularRhythmRoute.turbulence ?? 0)) * 100)}%`
              : `${vascularRhythmRoute.relationshipReads ?? vascularRhythmRoute.lockedCadenceReads ?? 0}/${vascularRhythmRoute.requiredRelationshipReads ?? vascularRhythmRoute.requiredCadenceReads ?? 3} current reads`
        } / ${Math.round((vascularRhythmRoute.progress ?? 0) * 100)}%`
      : inSiltPressure
      ? `Silt Pressure: ${
          siltPressureRoute.completed
            ? "return breath formed"
            : siltPressureRoute.compressionFailure
              ? `reopening ${Math.round((1 - (siltPressureRoute.compression ?? 0)) * 100)}%`
              : siltPressureRoute.safeMatterAbsorbed
                ? "porous matter accepted"
                : siltPressureRoute.ribsReleased
                  ? "appetite pocket open"
                  : siltPressureRoute.pressureRead
                    ? "bracing living ribs"
                    : siltPressureRoute.pressureRelationshipReady
                      ? "pressure relationship ready / Pulse"
                      : siltPressureRoute.pressureRelationshipHeld
                        ? "catching pressure"
                        : "compression unread"
        } / ${Math.round((siltPressureRoute.progress ?? 0) * 100)}%`
      : inCombThreshold
      ? `Comb Threshold: ${combThresholdPlayable.challengeComplete ? "synthesis complete / Aperture readable" : `${combThresholdPlayable.successfulReadCount ?? 0}/${combThresholdPlayable.requiredReadCount ?? 6} filter reads`}`
      : inApertureFields && signalPlainEcology.active
      ? `Aperture / Signal Plain: ${signalPlainEcology.completed
          ? (membraneRidgeGameplay.active
              ? (membraneRidgeGameplay.completed
                  ? "Membrane Ridge: pressure read / CURRENT PLAYABLE ENDPOINT / Gathering Ground landmark visible"
                  : `Membrane Ridge: contour ${membraneRidgeGameplay.contourIndex ?? 1}/${membraneRidgeGameplay.contourCount ?? 3} / ${Math.round((membraneRidgeGameplay.activeContourProgress ?? 0) * 100)}% / ${membraneRidgeGameplay.stage ?? "approach"}`)
              : apertureFieldsArrival.deeperFieldOpened ? "field changed / Membrane Ridge horizon open" : "local response retained")
          : `${signalPlainEcology.observedCount ?? 0}/3 receptors / ${signalPlainEcology.stage ?? "approach"}`}`
      : inApertureFields
      ? `Aperture Fields: ${apertureFieldsArrival.arrivalStage ?? apertureFieldsArrival.stage ?? "arrival shelf"}`
      : nextRoutePressure.active
      ? `${nextRoutePressure.hudStatus ?? "Signal Chorus: combward pressure readable"} / passive`
      : signalReturnState.active
      ? `${signalReturnState.hudStatus ?? "Signal Chorus: Grave reading held"} / stable`
      : graveReturn.active
      ? `${graveReturn.hudStatus ?? "Grave Return: tissue continuity"} / ${Math.round((graveReturn.progress ?? 0) * 100)}%`
      : graveRouteLock.active
      ? `${graveRouteLock.hudStatus ?? "Grave Memory Route: complete"} / locked`
      : gravePostSeam.active
      ? `${gravePostSeam.hudStatus ?? "Grave Bed: post-seam response"} / ${Math.round((gravePostSeam.progress ?? 0) * 100)}%`
      : seamMicroExit.active
      ? `${seamMicroExit.hudStatus ?? "Seam Micro-Exit: active"} / ${Math.round((seamMicroExit.progress ?? 0) * 100)}%`
      : seamFirstRead.active
      ? `Seam First-Read: ${Math.round((seamFirstRead.progress ?? 0) * 100)}% / ${seamFirstRead.firstReadComplete ? "closed and understood" : "pulse-read"}`
      : seamRuntimeArrival.active
      ? `${seamRuntimeArrival.hudStatus ?? "Seam Arrival: runtime / loop deferred"}`
      : graveExit.active && graveContinuity.active && seamArrivalPlan.active
      ? `${seamArrivalPlan.hudStatus ?? "Seam Arrival Plan: readable / no transition"}`
      : graveExit.active && graveContinuity.active
      ? `Grave Continuity Plan: ${graveContinuity.chosenOptionLabel ?? "planned later"} / no transition`
      : graveExit.active
      ? `Grave Exit Readiness: ${graveExit.markerVisible ? "visible / no exit" : "forming / no exit"}`
      : tenderCompanion.bonded && tenderCompanion.repairBoostActive
      ? `Tender: REPAIRING / scar ${Math.round((tenderCompanion.currentScar ?? 0) * 100)}% / ${Math.round((tenderCompanion.repairBoostSeconds ?? 0) * 10) / 10}s`
      : graveStability.active && graveStability.safeMemoryTransferComplete
      ? `Grave Stability: ${Math.round((graveStability.stableSeconds ?? 0) * 10) / 10}s / ${graveStability.planningReady ? "exit-readiness planned" : "settle"}`
      : graveLoop.active
      ? `Grave Loop: read ${Math.round((graveLoop.progress ?? 0) * 100)}% / ${graveLoop.safeAbsorbReady ? "silt transfer ready" : "read first"}`
      : graveArrival.active
      ? `Grave Route: readability ${Math.round((graveArrival.readConfidence ?? 0) * 100)}% / read first`
      : graveRouteActive
      ? "Grave Route: arrival prototype / read first"
      : graveRouteMorphing
        ? "Grave Route: no-gate morph forming"
        : optionalForkComplete
          ? "Bloom Fork: optional stable / complete"
          : optionalForkActive
            ? "Bloom Fork: optional beyond-minute"
            : firstMinuteComplete
          ? "First Minute: complete / lock candidate"
          : promptStack.firstMinuteLockStatus === "lock_candidate_complete"
            ? "First Minute: complete / lock candidate"
            : "First Minute: in progress";

    const targetLabel = target.targetId && target.targetId !== "none"
      ? this.playerFacingLabel(target.targetId)
      : inHub && hubFoundation.active
        ? this.hubReadingLabel(hubFoundation, hubInvestigation)
        : "World";

    const objective = this.cleanLine(
      guide.objectiveLine || opening.worldFacingObjective || this.objectiveFromState(frameState),
      "Move, pulse, and listen."
    );

    const actionHint = this.cleanLine(
      this.actionFromState(frameState) || target.absorbHint || guide.debugFallback,
      "Left Stick/WASD move. RT absorbs only when safe. X pulses when the tissue answers."
    );
    const interactionRhythm = interactionComposition.rhythm ?? {};
    const worldLedBeat = ["consequence", "reorient", "discover", "follow_answer", "quiet"].includes(interactionRhythm.beat);
    const primaryInstruction = actionHint || objective;
    const testPlatformToast = Boolean(testPlatform.active && (testPlatform.elapsedSeconds ?? 999) <= 5.0)
      ? `TEST ${testPlatform.slot ?? "?"}/8 · ${testPlatform.label ?? "platform"} · ~${testPlatform.suggestedSeconds ?? 60}s · next ${testPlatform.nextShortcut ?? "Shift+1"} · `
      : "";
    const gatheringDebug = inApertureFields && adjacentHostTerritory.active
      ? ` · RIDGE ${membraneRidgeGameplay.readCount ?? 0}/${membraneRidgeGameplay.contourCount ?? 3}${membraneRidgeGameplay.completed ? " COMPLETE" : ""} · GG d${Number.isFinite(adjacentHostTerritory.distance) ? adjacentHostTerritory.distance.toFixed(1) : "?"} aim${Number.isFinite(adjacentHostTerritory.aimDot) ? adjacentHostTerritory.aimDot.toFixed(2) : "?"}${adjacentHostTerritory.aimed ? " VIEW" : ""}${adjacentHostTerritory.attentionOwned ? " ATTN" : ""} OBS${adjacentHostTerritory.observationCount ?? 0} REL${adjacentHostTerritory.relationshipEstablished ? "Y" : "N"} ${adjacentHostTerritory.traversalOpen ? "OPEN" : "CLOSED"}`
      : "";
    const watcherIntent = gatheringGroundAlive.encounters?.reactive_watcher_stable_interrogation ?? {};
    const relayIntent = gatheringGroundAlive.encounters?.reactive_relay_held_intake ?? {};
    const intentRead = (entry) => entry.intentLatched
      ? `${Math.round((entry.progress01 ?? 0) * 100)}%`
      : entry.lastIntentBreakReason && entry.lastIntentBreakReason !== "none"
        ? "BRK"
        : "--";
    const responseRead = gatheringResponseRead.readable
      ? `${gatheringResponseRead.responseKind === "known_response" ? "KNOWN" : "NEW"} ${gatheringResponseRead.code ?? "?"}${gatheringResponseRead.cycle > 0 ? gatheringResponseRead.cycle : ""}/${gatheringResponseRead.signature ?? "answer"}`
      : "--";
    const gatheringLifeDebug = inApertureFields && gatheringGroundAlive.active
      ? ` · LIFE ${gatheringGroundAlive.completedCount ?? 0}/${gatheringGroundAlive.encounterCount ?? 6} A${gatheringGroundAlive.family?.ambient?.completed ?? 0}/2 R${gatheringGroundAlive.family?.reactive?.completed ?? 0}/2 X${gatheringGroundAlive.family?.cross_territory?.completed ?? 0}/2 · INT W${intentRead(watcherIntent)} R${intentRead(relayIntent)} · LOOP ${gatheringGroundAlive.ongoingResponseCycles ?? 0} · RESP ${responseRead} · MEM ${gatheringGroundAlive.memory?.mode ?? "quiet_observer"}`
      : "";

    return {
      active: visible,
      pass: "HC-016R",
      mode: "debug_hidden_playtest",
      title: inspectionCamera.coreWorkActive
        ? "BLOB // HOST CORE // CORE WORK"
        : inspectionCamera.active
          ? "BLOB // HOST CORE // CORE INSPECTION"
        : inSurfaceWake && surfaceWakeInteraction.active
        ? "BLOB // HOST CORE // SURFACE WAKE"
        : inGuideThreshold && guideThresholdGameplay.active && !guideThresholdGameplay.triggerReady
        ? "BLOB // HOST CORE // GUIDE THRESHOLD"
        : inGuideThreshold && guideThresholdInteraction.active
        ? "BLOB // HOST CORE // GUIDE THRESHOLD"
        : inHub && hubFoundation.active
        ? "BLOB // HOST CORE // HUB CHAMBER"
        : inGraveMemory && frameState.graveResonanceGameplay?.active
        ? "BLOB // HOST CORE // GRAVE II RESONANCE"
        : inGraveMemory
        ? "BLOB // HOST CORE // GRAVE MEMORY"
        : inVascularRhythm
        ? "BLOB // HOST CORE // VASCULAR RHYTHM"
        : inSiltPressure
        ? "BLOB // HOST CORE // SILT PRESSURE"
        : inCombThreshold
        ? "BLOB // HOST CORE // COMB THRESHOLD"
        : inApertureFields && gatheringGroundAlive.active
        ? "BLOB // HOST CORE // GATHERING GROUND"
        : inApertureFields && signalPlainEcology.active
        ? "BLOB // HOST CORE // SIGNAL PLAIN"
        : inApertureFields
        ? "BLOB // HOST CORE // APERTURE FIELDS"
        : layeredInteraction.active
        ? "BLOB // HOST CORE // LAYERED RESONANCE"
        : nextRoutePressure.active
        ? "BLOB // HOST CORE // COMBWARD PRESSURE"
        : signalReturnState.active
        ? "BLOB // HOST CORE // SIGNAL RETURN"
        : graveReturn.active
          ? "BLOB // HOST CORE // RETURN CURRENT"
          : "BLOB // HOST CORE // GRAVE ROUTE",
      objective,
      actionHint,
      primaryInstruction,
      statusLine: `${testPlatformToast}${stateLabel}${!inspectionCamera.coreWorkActive && coreChemistryOutput.active ? ` · Host chemistry ${coreChemistryOutput.dominantMode ?? "active"}${coreChemistryOutput.cloudPatternId && coreChemistryOutput.cloudPatternId !== "none" ? ` / ${coreChemistryOutput.cloudPatternLabel}` : ""}` : ""}${!inspectionCamera.coreWorkActive && coreContactLanguage.active && coreContactLanguage.state !== "suspended" ? ` · Contact ${coreContactLanguage.state}` : ""}${!inspectionCamera.coreWorkActive && playerAttachment.siltZoneId === "membrane" && ((playerAttachment.boundaryProximity ?? 0) > 0.52 || playerAttachment.active || playerAttachment.state === "releasing") ? ` · adhesion ${Math.round((playerAttachment.adhesionStrength ?? 0) * 100)}% / Silt align ${Math.round((playerAttachment.siltSurfaceAlignment ?? 0) * 100)}% / tangent ${(playerAttachment.surfaceTangentSpeed ?? 0).toFixed?.(2) ?? playerAttachment.surfaceTangentSpeed ?? 0} / surface ${playerAttachment.surfaceCoverageLabel ?? "trusted envelope"}` : ""}${returnTraversal.transitionActive ? ` · Return fold ${Math.round((returnTraversal.transitionProgress ?? 0) * 100)}%` : returnTraversal.active && Number.isFinite(returnTraversal.nearestSeamDistance) && returnTraversal.nearestSeamDistance <= 1.35 ? ` · Return seam ${returnTraversal.nearestSeamArmed ? "remembered" : "unsettled"}${returnTraversal.nearestDestinationSignature?.label ? ` / ${returnTraversal.nearestDestinationSignature.label}` : ""}` : ""}${hostAudio.active && !hostAudio.unlocked ? ` · AUDIO LOCKED (${hostAudio.contextState ?? "not_created"})` : hostAudio.active ? ` · Audio ON x${hostAudio.masterGain ?? 0}` : ""}${corePerformance.active && !inspectionCamera.active ? ` · Drive ${corePerformance.personality ?? "balanced"} ${corePerformance.endurance?.reservePercent ?? 100}%${pairedDemandRead ? ` · ${pairedDemandRead}` : ""}` : ""}${gatheringDebug}${gatheringLifeDebug} · ${this.shorten(coreGrowth.displayStage ?? "Seed Core", 24)} · Reading: ${this.shorten(targetLabel, 28)}`,
      auditLine: [auditLine, languageLine].filter(Boolean).join("\n"),
      languageRead,
      controlLine: testPlatformToast ? `${this.controlLine(frameState)} · Shift+1..8 test platforms` : this.controlLine(frameState),
      technicalIdsPlayerFacing: false,
      onePrimaryInstruction: true,
      worldLedBeat,
      rhythmLock: interactionComposition.rhythmLock ?? null,
      firstMinuteComplete,
      firstMinuteStage: frameState.firstMinuteExperience?.stage ?? "unknown",
      firstMinuteStageLabel: frameState.firstMinuteExperience?.stageLabel ?? "First Minute",
      firstMinuteContinuityLine: frameState.firstMinuteExperience?.continuityLine ?? "",
      optionalForkActive,
      optionalForkComplete,
      graveArrivalActive: Boolean(graveArrival.active),
      graveLoopActive: Boolean(graveLoop.active),
      graveStabilityActive: Boolean(graveStability.active),
      graveExitReadinessActive: Boolean(graveExit.active),
      graveRouteContinuityPlanningActive: Boolean(graveExit.active && graveContinuity.active),
      graveScarMemorySeamArrivalPlanningActive: Boolean(graveExit.active && graveContinuity.active && seamArrivalPlan.active),
      graveScarMemorySeamRuntimeArrivalActive: Boolean(seamRuntimeArrival.active),
      graveScarMemorySeamFirstReadActive: Boolean(seamFirstRead.active),
      graveSeamContinuityMicroExitActive: Boolean(seamMicroExit.active),
      graveBedPostSeamResponseActive: Boolean(gravePostSeam.active),
      graveRouteLocked: Boolean(graveRouteLock.active && graveRouteLock.routeLocked),
      graveReturnContinuityActive: Boolean(graveReturn.active),
      graveReturnContinuityComplete: Boolean(graveReturn.active && graveReturn.completed),
      signalChorusReturnStateActive: Boolean(signalReturnState.active),
      signalChorusReturnStateComplete: Boolean(signalReturnState.active && signalReturnState.completed),
      surfaceWakeInteractionActive: Boolean(inSurfaceWake && surfaceWakeInteraction.active),
      surfaceWakeInteractionComplete: Boolean(inSurfaceWake && surfaceWakeInteraction.active && surfaceWakeInteraction.completed),
      surfaceWakeExperiencePhase: surfaceWakeEcology.phase ?? "inactive",
      guideThresholdGameplayActive: Boolean(inGuideThreshold && guideThresholdGameplay.active),
      guideThresholdGameplayReady: Boolean(guideThresholdGameplay.triggerReady),
      guideThresholdInteractionActive: Boolean(inGuideThreshold && guideThresholdInteraction.active),
      guideThresholdInteractionComplete: Boolean(inGuideThreshold && guideThresholdInteraction.completed),
      layeredInteractionActive: Boolean(inHub && layeredInteraction.active),
      layeredInteractionComplete: Boolean(inHub && layeredInteraction.active && layeredInteraction.completed),
      nextRoutePressureActive: Boolean(inHub && nextRoutePressure.active),
      hubFoundationActive: Boolean(inHub && hubFoundation.active),
      hubFoundationComplete: Boolean(inHub && hubFoundation.completed),
      hubInvestigationActive: Boolean(inHub && hubInvestigation.active),
      hubInvestigationReady: Boolean(inHub && hubInvestigation.investigationReady),
      hubRouteReadCount: hubInvestigation.routeReadCount ?? 0,
      hubMemoryRead: Boolean(hubInvestigation.memoryRead),
      hubReturnedToCenter: Boolean(hubInvestigation.returnedToCenter),
      graveMemoryRouteActive: Boolean(inGraveMemory),
      graveMemoryRouteComplete: Boolean(graveMemoryRoute.completed),
      graveMemoryReadCount: graveMemoryRoute.readCount ?? 0,
      graveMemoryThreadRetained: Boolean(graveMemoryRoute.memoryThreadRetained),
      graveMemorySafeTransferReady: Boolean(graveMemoryRoute.safeTransferReady),
      graveMemorySafeTransferProgress: graveMemoryRoute.safeTransferProgress ?? 0,
      graveMemoryTraceIntegrity: graveMemoryRoute.traceIntegrity ?? 0,
      graveMemoryResidueRecoilRisk: graveMemoryRoute.residueRecoilRisk ?? 0,
      graveMemoryImprintCommitted: Boolean(graveMemoryRoute.graveMemoryImprintCommitted),
      vascularRhythmRouteActive: Boolean(inVascularRhythm),
      vascularRhythmRouteComplete: Boolean(vascularRhythmRoute.completed),
      vascularCadenceReads: vascularRhythmRoute.lockedCadenceReads ?? 0,
      vascularCadenceRequired: vascularRhythmRoute.requiredCadenceReads ?? 3,
      vascularPulseWindowOpen: Boolean(vascularRhythmRoute.pulseWindowOpen),
      vascularDesynchronized: Boolean(vascularRhythmRoute.desynchronized),
      vascularTurbulence: vascularRhythmRoute.turbulence ?? 0,
      vascularIntegrity: vascularRhythmRoute.circulationIntegrity ?? 0,
      vascularReturnFoldReady: Boolean(vascularRhythmRoute.returnFoldReady),
      siltPressureRouteActive: Boolean(inSiltPressure),
      siltPressureRouteComplete: Boolean(siltPressureRoute.completed),
      siltPressureRead: Boolean(siltPressureRoute.pressureRead),
      siltRibsReleased: Boolean(siltPressureRoute.ribsReleased),
      siltSafeMatterAbsorbed: Boolean(siltPressureRoute.safeMatterAbsorbed),
      siltCompressionFailure: Boolean(siltPressureRoute.compressionFailure),
      siltCompression: siltPressureRoute.compression ?? 0,
      siltReturnFoldReady: Boolean(siltPressureRoute.returnFoldReady),
      hubRouteCount: hubFoundation.routeCount ?? 0,
      hubDormantRouteCount: hubFoundation.dormantRouteCount ?? 0,
      inspectionCameraActive: Boolean(inspectionCamera.active),
      inspectionCameraAvailable: Boolean(inspectionCamera.available),
      inspectionCameraMode: inspectionCamera.mode ?? "player_tethered_orbit",
      nextRoutePressureReadable: Boolean(nextRoutePressure.active && nextRoutePressure.pressureReadable),
      debugPanelsHidden: visible,
      noDebugDependency: true,
      coreGrowthStage: coreGrowth.stageId ?? "seed_core",
      coreGrowthProgress: coreGrowth.growthProgress ?? 0,
      coreGrowthBias: coreGrowth.biasLabel ?? "balanced_first_binding",
      coreEngineActive: Boolean(coreEngine.active),
      coreEngineArchitecture: coreEngine.architectureLabel ?? "3-phase",
      coreEnginePhaseCount: coreEngine.phaseCount ?? 3,
      coreEngineRpm: coreEngine.rpm ?? 3000,
      coreEngineCurrentPhase: coreEngine.currentPhaseLabel ?? "pulse_1",
      coreEngineDebugCycleCommand: coreEngine.architectureDebugCycleCommand ?? "O",
      corePerformanceActive: Boolean(corePerformance.active),
      corePerformancePersonality: corePerformance.personality ?? "forming / neutral",
      corePerformanceReservePercent: corePerformance.endurance?.reservePercent ?? 100,
      corePerformanceBoostAccelerationMultiplier: corePerformance.movementModifiers?.boostAccelerationMultiplier ?? 1,
      corePerformanceBoostSpeedMultiplier: corePerformance.movementModifiers?.boostSpeedMultiplier ?? 1,
      coreSensoryActive: Boolean(coreSensoryResponse.active),
      coreSensoryWaveSpeed: coreSensoryResponse.waveSpeed ?? 0,
      coreSensoryPulseMode: coreSensoryResponse.pulseMode ?? "quick",
      coreSensoryMaxRange: coreSensoryResponse.maxRange ?? 4.25,
      coreSensoryLocalActionableRange: coreSensoryResponse.localActionableRange ?? 4.25,
      coreSensorySaturation01: coreSensoryResponse.sensorySaturation01 ?? 0,
      pulseCommitment: frameState.input?.pulseCommitment ?? "idle",
      pulseCharge01: frameState.input?.pulseCharge01 ?? 0,
      pulseReleaseKind: frameState.input?.pulseReleaseKind ?? "none",
      coreSensoryPendingEchoCount: coreSensoryResponse.pendingEchoCount ?? 0,
      coreSensoryReturnCount: coreSensoryResponse.returnCount ?? 0,
      coreSensoryLastReturn: coreSensoryResponse.lastReturn ?? "none",
      coreSensoryAnswerMemoryCount: coreSensoryResponse.answerMemoryCount ?? 0,
      coreSensoryNearestAnswerClass: coreSensoryResponse.nearestAnswerMemory?.responseClass ?? "none",
      coreSensoryNearestAnswerReachClass: coreSensoryResponse.nearestAnswerMemory?.reachClass ?? "none",
      coreSensoryNearestAnswerActionable: Boolean(coreSensoryResponse.nearestAnswerMemory?.actionableNow),
      coreSensoryNearestAnswerDistance: coreSensoryResponse.nearestAnswerMemory?.currentDistance ?? 0,
      coreSensoryNearestAnswerReadReady: Boolean(coreSensoryResponse.nearestAnswerMemory?.readReady),
      sonarInquiryActive: Boolean(frameState.ambientMaterial?.sonarInquiry?.active),
      sonarInquiryReadCount: frameState.ambientMaterial?.sonarInquiry?.readCount ?? 0,
      sonarInquiryLastReadClass: frameState.ambientMaterial?.sonarInquiry?.lastReadClass ?? "none",
      sonarInquiryMaterialReplySignature: frameState.ambientMaterial?.sonarInquiry?.materialReplySignature ?? "none",
      sonarInquiryMaterialReplyGrammarEnabled: Boolean(frameState.ambientMaterial?.sonarInquiry?.materialReplyGrammarEnabled),
      signalPlainAffordanceActive: Boolean(signalPlainEcology.embodiedVerbAffordance?.active),
      signalPlainAffordanceLaw: signalPlainEcology.embodiedVerbAffordance?.law ?? "none",
      signalPlainNearestCondition: signalPlainEcology.traversalIntention?.candidates?.find?.((candidate) => candidate.nodeNumber === signalPlainEcology.nearestNodeNumber)?.conditionId ?? "none",
      signalPlainAffordanceResponses: signalPlainEcology.embodiedVerbAffordance?.responses ?? [],
      signalPlainLocalConsequenceActive: Boolean(signalPlainEcology.persistentLocalConsequence?.active),
      signalPlainLocalConsequenceCount: signalPlainEcology.persistentLocalConsequence?.activeCount ?? 0,
      signalPlainLocalConsequenceNearest: signalPlainEcology.persistentLocalConsequence?.nearestActive ?? null,
      signalPlainLocalConsequenceStates: signalPlainEcology.persistentLocalConsequence?.states ?? [],
      signalPlainNextQuestionActive: Boolean(signalPlainEcology.consequenceNextQuestion?.active),
      signalPlainNextQuestionPrimary: signalPlainEcology.consequenceNextQuestion?.primary ?? null,
      signalPlainNextQuestionLinks: signalPlainEcology.consequenceNextQuestion?.links ?? [],
      interactionRhythmPass: interactionComposition.pass ?? "none",
      interactionVerbHierarchy: interactionComposition.verbHierarchy ?? null,
      interactionRhythmBeat: interactionComposition.rhythm?.beat ?? "observe",
      interactionHierarchy: interactionComposition.hierarchy ?? "none",
      interactionConsequenceKind: interactionComposition.consequence?.kind ?? "none",
      interactionConsequenceActive: Boolean(interactionComposition.consequence?.active),
      interactionConsequenceEventCount: interactionComposition.consequence?.eventCount ?? 0,
      interactionWorldNoticeLift: interactionComposition.worldNoticeLift ?? 0,
      interactionAmbientSuppression: interactionComposition.ambientSuppression ?? 0,
      interactionCoreWorkFocus: interactionComposition.coreWorkFocus ?? null,
      interactionInquiry: interactionComposition.inquiry ?? null,
      hostAudioActive: Boolean(hostAudio.active),
      hostAudioUnlocked: Boolean(hostAudio.unlocked),
      hostAudioContextState: hostAudio.contextState ?? "not_created",
      hostAudioUnlockReason: hostAudio.unlockReason ?? "awaiting_user_gesture",
      hostAudioMasterGain: hostAudio.masterGain ?? 0,
      hostAudioMixRevision: hostAudio.mixRevision ?? "none",
      hostAudioReferenceSystemOutputPercent: hostAudio.referenceSystemOutputPercent ?? "unknown",
      hostAudioTargetHeadroomDb: hostAudio.targetHeadroomDb ?? 0,
      hostAudioBusGains: hostAudio.busGains ?? {},
      hostAudioSafetyCompression: hostAudio.outputSafetyCompression ?? null,
      hostAudioEventCount: hostAudio.eventCount ?? 0,
      hostAudioLastEvent: hostAudio.lastEvent ?? "none",
      hostAudioUnlockConfirmationPlayed: Boolean(hostAudio.unlockConfirmationPlayed),
      hostAudioPlaytestInstruction: hostAudio.playtestInstruction ?? "Click once to enable audio."
    };
  }

  applyPanel(state, visible) {
    this.applyAudioGate(state);
    this.el.style.display = visible ? "block" : "none";
    if (!visible) return;

    this.titleEl.textContent = state.title;
    this.objectiveEl.textContent = state.primaryInstruction ?? state.actionHint ?? state.objective;
    this.objectiveEl.style.opacity = state.worldLedBeat ? "0.50" : "1";
    this.objectiveEl.style.transform = state.worldLedBeat ? "translateY(1px)" : "translateY(0)";
    this.actionEl.textContent = "";
    this.actionEl.style.display = "none";
    this.statusEl.textContent = state.statusLine;
    this.auditEl.textContent = state.auditLine ?? "";
    this.auditEl.style.display = state.auditLine ? "block" : "none";
    this.controlsEl.textContent = state.controlLine;
    this.statusEl.style.opacity = state.worldLedBeat ? "0.68" : "1";
    this.controlsEl.style.opacity = state.worldLedBeat ? "0.42" : "0.78";
    this.el.style.maxHeight = "calc(100vh - 156px)";
    this.el.style.overflow = "hidden";

    this.el.style.borderColor = state.inspectionCameraActive
      ? "rgba(190, 248, 255, 1)"
      : state.surfaceWakeInteractionActive
      ? "rgba(182, 244, 255, 0.96)"
      : state.layeredInteractionActive
      ? "rgba(255, 244, 174, 0.98)"
      : state.nextRoutePressureActive
      ? "rgba(255, 235, 166, 0.98)"
      : state.hubFoundationActive
      ? "rgba(188, 239, 255, 0.94)"
      : state.graveMemoryRouteActive
      ? "rgba(229, 188, 176, 0.94)"
      : state.vascularRhythmRouteActive
      ? state.vascularDesynchronized
        ? "rgba(255, 118, 128, 0.96)"
        : state.vascularPulseWindowOpen
          ? "rgba(255, 224, 172, 0.98)"
          : "rgba(133, 220, 255, 0.94)"
      : state.siltPressureRouteActive
      ? state.siltCompressionFailure
        ? "rgba(255, 126, 104, 0.96)"
        : state.siltSafeMatterAbsorbed
          ? "rgba(225, 179, 102, 0.96)"
          : "rgba(181, 142, 95, 0.94)"
      : state.graveReturnContinuityComplete
      ? "rgba(255, 240, 184, 0.96)"
      : state.graveReturnContinuityActive
      ? "rgba(189, 239, 255, 0.96)"
      : state.graveRouteLocked
      ? "rgba(205, 255, 218, 0.96)"
      : state.graveBedPostSeamResponseActive
      ? "rgba(255, 220, 176, 0.96)"
      : state.graveSeamContinuityMicroExitActive
      ? "rgba(255, 230, 188, 0.94)"
      : state.graveScarMemorySeamFirstReadActive
      ? "rgba(255, 224, 196, 0.90)"
      : state.graveScarMemorySeamRuntimeArrivalActive
      ? "rgba(255, 248, 218, 0.86)"
      : state.graveScarMemorySeamArrivalPlanningActive
      ? "rgba(255, 242, 205, 0.78)"
      : state.graveRouteContinuityPlanningActive
      ? "rgba(255, 235, 190, 0.72)"
      : state.graveExitReadinessActive
      ? "rgba(255, 225, 178, 0.66)"
      : state.graveStabilityActive
      ? "rgba(255, 210, 168, 0.58)"
      : state.graveLoopActive
      ? "rgba(236, 190, 156, 0.52)"
      : state.graveArrivalActive
      ? "rgba(216, 177, 162, 0.44)"
      : state.firstMinuteComplete
        ? "rgba(255, 220, 152, 0.42)"
        : "rgba(140, 230, 255, 0.24)";
    this.el.style.background = state.inspectionCameraActive
      ? "rgba(4, 12, 16, 0.82)"
      : state.surfaceWakeInteractionActive
      ? "rgba(5, 13, 16, 0.72)"
      : state.layeredInteractionActive
      ? "rgba(9, 12, 16, 0.74)"
      : state.hubFoundationActive
      ? "rgba(7, 13, 18, 0.78)"
      : state.graveMemoryRouteActive
      ? "rgba(17, 10, 14, 0.72)"
      : state.vascularRhythmRouteActive
      ? state.vascularDesynchronized
        ? "rgba(24, 8, 13, 0.76)"
        : "rgba(5, 12, 23, 0.76)"
      : state.siltPressureRouteActive
      ? state.siltCompressionFailure
        ? "rgba(26, 9, 7, 0.78)"
        : "rgba(20, 14, 8, 0.76)"
      : state.nextRoutePressureActive
      ? "rgba(12, 14, 10, 0.68)"
      : state.graveReturnContinuityActive
      ? "rgba(5, 13, 17, 0.68)"
      : state.graveRouteLocked || state.statusLine?.includes("Grave Bed") || state.statusLine?.includes("Seam Micro-Exit") || state.statusLine?.includes("Seam First-Read") || state.statusLine?.includes("Seam Arrival") || state.statusLine?.includes("Seam Arrival Plan") || state.statusLine?.includes("Grave Continuity") || state.statusLine?.includes("Grave Exit Readiness") || state.statusLine?.includes("Grave Stability") || state.statusLine?.includes("Grave Loop") || state.statusLine?.includes("Grave Route")
      ? "rgba(15, 10, 10, 0.62)"
      : state.optionalForkActive
        ? "rgba(13, 8, 15, 0.58)"
        : "rgba(3, 8, 12, 0.56)";
  }

  applyAudioGate(state) {
    if (!this.audioGateEl) return;
    const locked = state.hostAudioActive && !state.hostAudioUnlocked;
    this.audioGateEl.style.display = locked ? "block" : "none";
    if (!locked) return;
    const contextRead = state.hostAudioContextState === "not_created"
      ? "context not created"
      : `context ${state.hostAudioContextState}`;
    this.audioGateEl.textContent = `AUDIO LOCKED — CLICK HERE OR PRESS A KEY ONCE · ${contextRead} · controller input alone may not unlock browser audio`;
  }

  objectiveFromState(frameState) {
    if (frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001"
      && frameState.graveResonanceGameplay?.active) {
      return frameState.graveResonanceGameplay.nextAction;
    }
    const returnTraversal = frameState.firstSliceReturnTraversal ?? {};
    const hostAudio = frameState.hostAudio ?? {};
    const coreEngine = frameState.coreEngine ?? {};
    if (returnTraversal.transitionActive) return "Stay with the remembered fold while the same anatomy resolves at the earlier scale.";
    if (returnTraversal.active && Number.isFinite(returnTraversal.nearestSeamDistance) && returnTraversal.nearestSeamDistance <= 1.08) {
      return returnTraversal.nearestSeamArmed
        ? "The remembered fold is physically aligned. Move through it to revisit the connected early anatomy."
        : "This is the arrival fold. Move away, learn the space, then return here when you want to retrace it.";
    }
    if (frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001") {
      const signal = frameState.signalPlainEcology ?? {};
      const ridge = frameState.membraneRidgeGameplay ?? {};
      const arrival = frameState.apertureFieldsArrival ?? {};
      if (signal.completed && ridge.active) {
        return ridge.completed
          ? "Current playable endpoint reached. Gathering Ground is a distant landmark only in this build."
          : ridge.nextAction ?? "Enter the bright Membrane Ridge contour and keep moving.";
      }
      if (signal.active && !signal.completed) return signal.nextAction ?? "Complete Signal Plain.";
      return arrival.nextAction ?? "Read the Aperture field.";
    }
    if (frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001") {
      const surfaceWake = frameState.surfaceWakeLayeredInteraction ?? {};
      const ecology = frameState.surfaceWakeEcology ?? {};
      if (ecology.active && (ecology.phase === "awaken" || ecology.phase === "observe" || ecology.phase === "receive" || ecology.phase === "outgrow")) {
        return ecology.nextAction ?? "Watch how the nursery responds.";
      }
      if (surfaceWake.active) return surfaceWake.objectiveLine ?? "Approach and read the Surface Wake listening fold.";
      return "Find the safe seed and absorb only what welcomes you.";
    }
    if (frameState.activeCellId === "CELL_SCAR_FLOW_FOLD_001") {
      const gameplay = frameState.guideThresholdGameplay ?? {};
      if (gameplay.active && !gameplay.triggerReady) return gameplay.objectiveLine ?? "Explore the living current before the threshold converges.";
      const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
      if (guideThreshold.active) return guideThreshold.objectiveLine ?? "Read the current, align movement, sustain, release, and settle.";
      return "Read the scar-flow; pulse memory, path, pressure, and warning.";
    }
    if (frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001") {
      const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};
      if (layeredInteraction.active && !(layeredInteraction.completed && frameState.hubChamberFoundation?.active)) return layeredInteraction.objectiveLine ?? "Follow the layered resonance sequence.";
      const hubFoundation = frameState.hubChamberFoundation ?? {};
      const hubInvestigation = frameState.hubInvestigationGameplay ?? {};
      if (hubInvestigation.active && !hubInvestigation.investigationReady) return hubInvestigation.objectiveLine ?? "Investigate all three routes and the memory fragment.";
      if (hubFoundation.active) return hubFoundation.objectiveLine ?? "Read one active route and two dormant routes around the junction.";
      const nextRoutePressure = frameState.signalChorusNextRoutePressure ?? {};
      if (nextRoutePressure.active) return nextRoutePressure.objectiveLine ?? "Observe the combward pressure. It is readable, but it is not open.";
      const signalReturnState = frameState.signalChorusReturnState ?? {};
      if (signalReturnState.active) return signalReturnState.objectiveLine ?? "Stay with the returned Grave reading.";
      const graveReturn = frameState.graveReturnContinuity ?? {};
      if (graveReturn.active && graveReturn.completed) return graveReturn.objectiveLine ?? "Route awareness restored at Signal Chorus.";
      return "Let the chorus answer; warm the bridge with pulse.";
    }
    if (frameState.activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") {
      return "Optional fork: stay with memory, bloom, braid, and warning.";
    }
    if (frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      const preview = frameState.graveMemoryRoute ?? {};
      if (preview.active) return preview.objectiveLine ?? preview.nextAction;
      const graveReturn = frameState.graveReturnContinuity ?? {};
      if (graveReturn.active) return graveReturn.objectiveLine ?? graveReturn.nextAction ?? "Move into the remembered return current.";
      const graveRouteLock = frameState.graveRouteLock ?? {};
      const gravePostSeam = frameState.graveBedPostSeamResponse ?? {};
      if (graveRouteLock.active) return graveRouteLock.objectiveLine ?? "The Grave memory route is complete.";
      const seamMicroExit = frameState.graveSeamContinuityMicroExit ?? {};
      if (gravePostSeam.completed) return "Grave bed settled after the seam. No new branch opens yet.";
      if (gravePostSeam.active) return "Grave bed: read the husk, scar lock, and seed remnant after seam return.";
      if (seamMicroExit.completed) return "Returned to the Grave bed. The seam is understood; no new branch opens yet.";
      return "Grave route: read the remains before consuming anything.";
    }
    if (frameState.activeCellId === "CELL_VASCULAR_RHYTHM_ROUTE_001") {
      const route = frameState.vascularRhythmRoute ?? {};
      return route.nextAction ?? "Move with the circulation current, Stabilize the next valve relationship, then Pulse through it.";
    }
    if (frameState.activeCellId === "CELL_SILT_PRESSURE_ROUTE_001") {
      const route = frameState.siltPressureRoute ?? {};
      return route.nextAction ?? "Read the pressure, brace the ribs, and take only porous matter.";
    }
    if (frameState.activeCellId === "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      const seamMicroExit = frameState.graveSeamContinuityMicroExit ?? {};
      if (seamMicroExit.ready || seamMicroExit.started) return "Scar-memory seam: pulse the closed suture to fold back, no gate.";
      return "Scar-memory seam: pulse-read the thread, lattice, echo, and closed suture.";
    }
    return "Move, pulse, and listen.";
  }

  actionFromState(frameState) {
    const targetId = frameState.targeting?.targetId ?? "none";
    const cellId = frameState.activeCellId ?? "none";
    const graveReturn = frameState.graveReturnContinuity ?? {};
    const signalReturnState = frameState.signalChorusReturnState ?? {};
    const surfaceWakeInteraction = frameState.surfaceWakeLayeredInteraction ?? {};
    const surfaceEcology = frameState.surfaceWakeEcology ?? {};
    const guideThresholdGameplay = frameState.guideThresholdGameplay ?? {};
    const guideThresholdInteraction = frameState.guideThresholdLayeredInteraction ?? {};
    const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};
    const inspectionCamera = frameState.tightInspectionCamera ?? {};
    const coreWorkManipulation = frameState.coreWorkManipulation ?? {};
    const spatialCoreChemistry = frameState.spatialCoreChemistry ?? {};

    if (inspectionCamera.coreWorkActive) {
      if ((coreWorkManipulation.candidateCount ?? 0) <= 0) {
        return "Guide is attending the Core, but no retained anatomy is visible yet. Dev quick test: P seeds Grave/Vascular/Silt without route progression. B returns · Y world.";
      }
      const selectedChemistry = coreWorkManipulation.selectedChemistry ?? spatialCoreChemistry.selectedPlacement ?? null;
      const topology = coreWorkManipulation.topology ?? spatialCoreChemistry.topology ?? null;
      const cloudPattern = coreWorkManipulation.cloudPattern ?? spatialCoreChemistry.cloudPattern ?? null;
      if (coreWorkManipulation.held) {
        const depthMotion = coreWorkManipulation.depthDirection === "outward"
          ? "pulling outward"
          : coreWorkManipulation.depthDirection === "inward"
            ? "pushing inward"
            : `depth ${coreWorkManipulation.selectedDepthPercent ?? 0}%`;
        const chemistryRead = selectedChemistry ? ` · ${selectedChemistry.zoneLabel}: ${selectedChemistry.interactionLabel}` : "";
        return `Guide holds ${coreWorkManipulation.selectedPieceLabel ?? "piece"} · ${depthMotion}${chemistryRead}. Left Stick moves · RT outward / LT inward · A places · Right Stick orbits.`;
      }
      const topologyRead = topology ? `${topology.label} ${topology.distribution} · ` : "";
      const chemistryRead = selectedChemistry ? `${selectedChemistry.zoneLabel}: ${selectedChemistry.interactionLabel} · ` : "";
      const cloudRead = cloudPattern && cloudPattern.stablePatternId !== "none"
        ? `Cloud ${cloudPattern.stablePatternLabel}${cloudPattern.popActive ? " POP" : ""} · `
        : "";
      return `${topologyRead}${cloudRead}${chemistryRead}D-Pad Left/Right selects · A grabs ${coreWorkManipulation.selectedPieceLabel ?? "piece"} · RT/LT changes body zone · B returns · Y world.`;
    }
    const returnTraversal = frameState.firstSliceReturnTraversal ?? {};
    const hostAudio = frameState.hostAudio ?? {};
    const coreEngine = frameState.coreEngine ?? {};
    if (returnTraversal.transitionActive) return "Keep moving; the remembered tissue is resolving without a teleport or gate.";
    if (returnTraversal.active && Number.isFinite(returnTraversal.nearestSeamDistance) && returnTraversal.nearestSeamDistance <= 1.08) {
      return returnTraversal.nearestSeamArmed
        ? "Move through the lit tissue crease. No button is required."
        : "Move away from the arrival crease once; returning to it will arm the physical revisit path.";
    }
    if (cellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001" && frameState.graveResonanceGameplay?.active) {
      return frameState.graveResonanceGameplay.nextAction;
    }
    const nextRoutePressure = frameState.signalChorusNextRoutePressure ?? {};
    const hubFoundation = frameState.hubChamberFoundation ?? {};
    const hubInvestigation = frameState.hubInvestigationGameplay ?? {};
    const signalLoop = frameState.signalChorusInteraction ?? {};
    const scarLoop = frameState.scarFlowInteraction ?? {};
    const bloomLoop = frameState.bloomResidueInteraction ?? {};
    const graveMorph = frameState.graveRouteMorph ?? {};
    const graveLoop = frameState.graveReadBeforeAbsorb ?? {};
    const graveStability = frameState.graveLoopStability ?? {};
    const graveExit = frameState.graveExitReadiness ?? {};
    const graveContinuity = frameState.graveRouteContinuityPlanning ?? {};
    const seamArrivalPlan = frameState.graveScarMemorySeamArrivalPlanning ?? {};
    const seamRuntimeArrival = frameState.graveScarMemorySeamRuntimeArrival ?? {};
    const seamFirstRead = frameState.graveScarMemorySeamFirstRead ?? {};
    const seamMicroExit = frameState.graveSeamContinuityMicroExit ?? {};
    const graveRouteLock = frameState.graveRouteLock ?? {};
    const gravePostSeam = frameState.graveBedPostSeamResponse ?? {};
    const graveMemoryRoute = frameState.graveMemoryRoute ?? {};
    const vascularRhythmRoute = frameState.vascularRhythmRoute ?? {};
    const siltPressureRoute = frameState.siltPressureRoute ?? {};
    const combThresholdPlayable = frameState.combThresholdPlayable ?? {};
    const apertureFieldsArrival = frameState.apertureFieldsArrival ?? {};
    const signalPlainEcology = frameState.signalPlainEcology ?? {};
    const membraneRidgeGameplay = frameState.membraneRidgeGameplay ?? {};

    if (cellId === "CELL_MEMBRANE_NURSERY_001" && surfaceWakeInteraction.active) {
      const action = surfaceEcology.active
        ? (surfaceEcology.nextAction ?? surfaceWakeInteraction.nextAction)
        : (surfaceWakeInteraction.nextAction ?? "Follow the Surface Wake response.");
      if (inspectionCamera.active) return inspectionCamera.selfInspection
        ? `${action} A interacts; D-Pad Down enters Core Work; Y returns to world view.`
        : `${action} Y returns to orbit view.`;
      if (inspectionCamera.available) return `${action} Y inspects the Core / readable focus.`;
      return action;
    }
    if (cellId === "CELL_SCAR_FLOW_FOLD_001" && guideThresholdGameplay.active && !guideThresholdGameplay.triggerReady) {
      const action = guideThresholdGameplay.nextAction ?? "Ride the current, pulse to reveal flow, and stabilize through turbulence.";
      if (inspectionCamera.active) return inspectionCamera.selfInspection
        ? `${action} A interacts; D-Pad Down enters Core Work; Y returns to world view.`
        : `${action} Y returns to orbit view.`;
      return action;
    }
    if (cellId === "CELL_SCAR_FLOW_FOLD_001" && guideThresholdInteraction.active) {
      const action = guideThresholdInteraction.nextAction ?? "Follow the movement-led Guide Threshold sequence.";
      if (inspectionCamera.active) return inspectionCamera.selfInspection
        ? `${action} A interacts; D-Pad Down enters Core Work; Y returns to world view.`
        : `${action} Y returns to orbit view.`;
      if (inspectionCamera.available) return `${action} Y inspects the Core / readable focus.`;
      return action;
    }
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && layeredInteraction.active && !(layeredInteraction.completed && hubFoundation.active)) {
      const action = layeredInteraction.nextAction ?? "Follow the layered resonance sequence.";
      if (inspectionCamera.active) return inspectionCamera.selfInspection
        ? `${action} A interacts; D-Pad Down enters Core Work; Y returns to world view.`
        : `${action} Y returns to orbit view.`;
      if (inspectionCamera.available) return `${action} Y inspects the Core / readable focus.`;
      return action;
    }
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && hubInvestigation.active && !hubInvestigation.investigationReady) return hubInvestigation.nextAction ?? "Approach an awake route body and press A to commit.";
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && hubFoundation.active) return hubFoundation.nextAction ?? "Read the active route and remember the two dormant routes.";
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && nextRoutePressure.active) return nextRoutePressure.nextAction ?? "Hold the reading and learn the direction. No route input is accepted.";
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && signalReturnState.active) return signalReturnState.nextAction ?? "Hold the returned Grave reading.";
    if (cellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001" && graveReturn.active) return graveReturn.nextAction ?? "Follow the remembered return current.";
    if (targetId === "dormant_seed_nutrient_001") {
      return "Hold RT near the safe seed until the bond settles.";
    }
    if (cellId === "CELL_MEMBRANE_NURSERY_001") {
      return "RT absorbs the safe seed. X pulses only when tissue answers.";
    }
    if (cellId === "CELL_SCAR_FLOW_FOLD_001" && scarLoop.active) {
      if (scarLoop.currentFocus && scarLoop.currentFocus !== "none") {
        return `Pulse/listen to ${this.labelFromId(scarLoop.currentFocus)}.`;
      }
      return "Pulse scar-flow objects; respect the clot instead of eating it.";
    }
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && signalLoop.active) {
      if (signalLoop.preparedForNextBranch) return "Pulse the warmed seed-signal bridge again to form the Bloom fork.";
      if (signalLoop.currentFocus === "choir_resonance_node_001") return "Press X once on the choir node; the listening pore should take focus.";
      if (signalLoop.currentFocus === "listening_pore_membrane_001") return "Press X once on the listening pore; the harmonic wave should take focus.";
      if (signalLoop.currentFocus === "harmonic_wave_thread_001") return "Press X once on the harmonic wave; the seed-signal bridge should take focus.";
      if (signalLoop.currentFocus === "seed_signal_bridge_001") return "Press X on the seed-signal bridge; do not force absorb.";
      if (signalLoop.currentFocus && signalLoop.currentFocus !== "none") return `Pulse/listen to ${this.labelFromId(signalLoop.currentFocus)}.`;
      return "Listen first; pulse the answering chorus focus.";
    }
    if (cellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      if (graveMemoryRoute.active) return graveMemoryRoute.nextAction;
      if (graveRouteLock.active) return graveRouteLock.nextAction;
      if (gravePostSeam.active) return gravePostSeam.nextAction;
      if (seamRuntimeArrival.active) return seamRuntimeArrival.nextAction;
      if (graveExit.active && graveContinuity.active && seamArrivalPlan.active) return seamArrivalPlan.nextAction;
      if (graveExit.active && graveContinuity.active) return graveContinuity.nextAction;
      if (graveExit.active) return graveExit.nextAction;
      if (graveStability.active && graveLoop.safeMemoryTransferComplete) return graveStability.nextAction;
      return graveLoop.active
        ? graveLoop.nextAction
        : frameState.graveArrivalReadability?.nextAction ?? "Read before absorb. Pulse husk, silt, scar lock, and seed remnant gently.";
    }
    if (cellId === "CELL_VASCULAR_RHYTHM_ROUTE_001") {
      return vascularRhythmRoute.nextAction
        ?? "Move with the charge, press X when the valve brightens, and hold LT through contraction.";
    }
    if (cellId === "CELL_SILT_PRESSURE_ROUTE_001") {
      return siltPressureRoute.nextAction
        ?? "Move inside the low ribs, Pulse once, brace with LT, then hold RT only on the warm porous packet.";
    }
    if (cellId === "CELL_APERTURE_FIELDS_ARRIVAL_001" && signalPlainEcology.active && !signalPlainEcology.completed) {
      const intention = signalPlainEcology.traversalIntention ?? {};
      const observed = signalPlainEcology.observedCount ?? 0;
      if (signalPlainEcology.consequenceNextQuestion?.active) return "The changed Host condition is now affecting another local rhythm. Watch the relationship; no next receptor is prescribed.";
      if (signalPlainEcology.persistentLocalConsequence?.active) return "A local Host condition is still holding your last successful experiment; it will decay naturally.";
      if (observed <= 0) return "Three local rhythms are readable. No receptor is prescribed; investigate whichever catches your attention.";
      if (observed < (signalPlainEcology.requiredObservations ?? 3)) return "Your first reading is retained. Compare, ignore, or approach another rhythm in any order.";
      if (signalPlainEcology.ready) return "The three readings have converged; the center now feels different.";
      return intention.active ? "The three readings point inward without prescribing the next verb." : "Stay with the changed local condition.";
    }
    if (cellId === "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      if (seamMicroExit.active) return seamMicroExit.nextAction;
      if (seamFirstRead.active) return seamFirstRead.nextAction;
      return seamRuntimeArrival.nextAction ?? "Read the seam shape. Pulse, do not absorb.";
    }
    if ((graveMorph.progress ?? 0) > 0 && !graveMorph.completed) {
      return graveMorph.nextAction ?? "Stay in control while the Grave bed forms.";
    }
    if (cellId === "CELL_BLOOM_RESIDUE_FORK_001" && bloomLoop.active) {
      if (this.isBloomForkStable(frameState)) return graveMorph.nextAction ?? "Pulse stable residue to form the Grave route without a gate.";
      if (bloomLoop.currentFocus && bloomLoop.currentFocus !== "none") return `Stay with ${this.labelFromId(bloomLoop.currentFocus)} until it settles.`;
      return "Read memory, bloom, braid, and warning before choosing.";
    }
    return null;
  }

  controlLine(frameState) {
    const device = frameState.inputSource?.activeDevice ?? "keyboard";
    const lines = this.config?.minimalControls ?? [];
    const isGamepad = String(device).includes("gamepad");
    const match = lines.find((entry) => entry.device === (isGamepad ? "controller" : "keyboard"));
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const inspectionText = inspection.coreWorkActive
      ? (isGamepad
          ? "D-Pad piece · A grab/place · LS move · RT/LT depth · RS orbit · B Core view · Y world"
          : "Arrows piece · E grab/place · WASD move piece · Right Mouse/Q depth · IJKL orbit · Esc Core view · F world")
      : inspection.active
        ? (frameState.guideFocus?.honed
            ? (isGamepad ? "GUIDE HONED · A interact · ↓ Core Work · Y world" : "GUIDE HONED · E interact · G Core Work · F world")
            : (isGamepad ? "A interact · ↓ Core Work · center Guide to hone · Y world" : "E interact · G Core Work · center Guide to hone · F world"))
        : inspection.available
          ? (isGamepad ? "Y inspect Core → D-Pad Down Core Work" : "F inspect Core → G Core Work")
          : null;

    if (isGamepad && frameState.statusPage?.firstHubUsePending) {
      return ["View/Select or Menu/Start Status", "LB/RB tabs", "D-Pad navigate", "B back"].join(" · ");
    }
    if (inspection.coreWorkActive) return inspectionText;
    if (isGamepad && frameState.inputSource?.pulseContext === "resonance_hold") {
      return ["Left Stick move", "Right Stick camera", "Hold LT stabilize", "X pulse", inspectionText, "R3 reframe", "View Status"].filter(Boolean).join(" · ");
    }
    if (isGamepad && frameState.inputSource?.pulseContext === "pulse_listen") {
      return ["Left Stick move", "Right Stick camera", "X pulse-listen", inspectionText, "R3 reframe", "Back debug"].filter(Boolean).join(" · ");
    }
    if (!isGamepad && inspectionText) {
      return `WASD move · Mouse/IJKL camera · ${inspectionText} · E interact · Left Mouse/X/Space pulse · Right Mouse absorb · Q stabilize · R reframe`;
    }
    if (isGamepad && inspectionText) {
      return ["Left Stick move", "Right Stick camera", "RT absorb", "X pulse", "LT stabilize", inspectionText, "R3 reframe", "View Status"].join(" · ");
    }
    return match?.line ?? "Left Stick/WASD move · A interact · X pulse · RT absorb · LT stabilize · Y Core inspect · View/Tab Status · F1 trace · F2 systems · F3 clean";
  }

  isFirstMinuteComplete(frameState) {
    return Boolean(
      frameState.firstMinuteExperience?.complete ||
      frameState.firstSliceCohesion?.firstMinute?.complete
    );
  }

  isBloomForkStable(frameState) {
    const bloomLoop = frameState.bloomResidueInteraction ?? {};
    const graveMorph = frameState.graveRouteMorph ?? {};
    return Boolean(
      bloomLoop.preparedForNextBranch ||
      (bloomLoop.stage === "fork_stable" && (bloomLoop.progress ?? 0) >= 0.95)
    );
  }

  cleanLine(value, fallback) {
    const line = String(value ?? "").trim();
    return line || fallback;
  }

  labelFromId(id) {
    return String(id ?? "object").replaceAll("_", " ");
  }

  playerFacingLabel(id) {
    const labels = {
      dormant_seed_nutrient_001: "Safe seed",
      surface_wake_membrane_mote_001: "Clean matter",
      surface_wake_membrane_mote_002: "Dense matter",
      surface_wake_membrane_mote_003: "Scar-touched matter",
      signal_vapor_thread_001: "Listening signal",
      flux_current_ribbon_001: "Living current",
      scar_contamination_plate_001: "Scar contamination",
      scar_memory_fleck_001: "Memory fleck",
      scar_flow_clot_001: "Scar clot",
      resonant_path_thread_001: "Resonant path",
      pressure_fold_current_001: "Pressure current"
    };
    if (labels[id]) return labels[id];
    return String(id ?? "World")
      .replace(/_\d+$/u, "")
      .replaceAll("_", " ")
      .replace(/\b\w/gu, (letter) => letter.toUpperCase());
  }

  hubReadingLabel(hubFoundation, hubInvestigation) {
    if (hubInvestigation.investigationReady) return "Route comparison";
    const nearest = hubInvestigation.nearestRouteId;
    const route = (hubFoundation.routes ?? []).find((entry) => entry.id === nearest);
    if (route?.displayName) return route.displayName;
    return "Hub territories";
  }

  shorten(value, max) {
    const text = String(value ?? "none");
    return text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text;
  }

  initialState() {
    return {
      active: false,
      pass: "HC-004QD",
      mode: "debug_hidden_playtest",
      title: "BLOB // HOST CORE // GRAVE ROUTE",
      objective: "Move, pulse, and listen.",
      actionHint: "RT absorbs only when safe. X pulses when the tissue answers.",
      statusLine: "First Minute: waiting",
      controlLine: "F1 trace / F2 systems / F3 clean",
      firstMinuteComplete: false,
      optionalForkActive: false,
      optionalForkComplete: false,
      graveRouteContinuityPlanningActive: false,
      graveScarMemorySeamArrivalPlanningActive: false,
      graveScarMemorySeamRuntimeArrivalActive: false,
      graveScarMemorySeamFirstReadActive: false,
      graveSeamContinuityMicroExitActive: false,
      graveBedPostSeamResponseActive: false,
      debugPanelsHidden: false,
      noDebugDependency: true
    };
  }
}
