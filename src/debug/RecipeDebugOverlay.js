import { selectCurrentMorphState } from "../morph/MorphStateSelector.js";
import { buildRuntimeDiagnosticSummary } from "./RuntimeDiagnosticSummary.js";

export class RecipeDebugOverlay {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.el = null;
    this.inputEl = null;
    this.lastTraceActionText = "—";
    this.lastTraceActionAt = -Infinity;
    this.traceActionHoldSeconds = 3.0;
  }

  init() {
    this.el = document.createElement("div");
    this.el.id = "recipe-debug-overlay";

    Object.assign(this.el.style, {
      position: "fixed",
      top: "12px",
      left: "12px",
      padding: "10px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      color: "#d8f7ff",
      background: "rgba(5, 8, 14, 0.72)",
      border: "1px solid rgba(160, 230, 255, 0.22)",
      borderRadius: "10px",
      pointerEvents: "none",
      whiteSpace: "pre",
      boxSizing: "border-box",
      overflow: "hidden",
      zIndex: "10"
    });

    document.body.appendChild(this.el);

    // HC027K1 — dedicated live input trace. Keeping this separate from the tall
    // diagnostic column guarantees button use remains visible in screenshots/video
    // even when the legacy full diagnostic text exceeds the viewport.
    this.inputEl = document.createElement("div");
    this.inputEl.id = "playtest-input-telemetry-overlay";
    Object.assign(this.inputEl.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      width: "min(520px, 40vw)",
      padding: "12px 14px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "clamp(11px, 0.92vw, 14px)",
      lineHeight: "1.28",
      color: "#ecfbff",
      background: "rgba(5, 8, 14, 0.80)",
      border: "1px solid rgba(255, 226, 166, 0.52)",
      borderRadius: "10px",
      pointerEvents: "none",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      boxSizing: "border-box",
      zIndex: "12",
      display: "none"
    });
    document.body.appendChild(this.inputEl);
  }

  update() {
    if (!this.el) return;

    const mode = this.frameState.debugDisplay?.mode ?? "compact";
    this.applyMode(mode);

    if (mode === "hidden") {
      this.el.textContent = "";
      if (this.inputEl) {
        this.inputEl.textContent = "";
        this.inputEl.style.display = "none";
      }
      return;
    }

    this.el.textContent = mode === "full"
      ? this.fullText()
      : mode === "trace"
        ? this.traceText()
        : this.compactText();

    if (this.inputEl) {
      const showInputTrace = mode === "trace";
      this.inputEl.style.display = showInputTrace ? "block" : "none";
      if (showInputTrace) this.renderInputTelemetry();
      else this.inputEl.replaceChildren();
    }
  }

  applyMode(mode) {
    if (mode === "hidden") {
      this.el.style.display = "none";
      return;
    }

    this.el.style.display = "block";

    if (mode === "trace") {
      Object.assign(this.el.style, {
        width: "min(330px, 26vw)",
        maxHeight: "30vh",
        padding: "7px 9px",
        fontSize: "clamp(9px, 0.72vw, 11px)",
        lineHeight: "1.26",
        background: "rgba(5, 8, 14, 0.62)",
        overflow: "hidden"
      });
      return;
    }

    if (mode === "full") {
      Object.assign(this.el.style, {
        width: "min(460px, 38vw)",
        maxHeight: "calc(100dvh - 20px)",
        padding: "8px",
        fontSize: "clamp(8px, 0.74vw, 10.5px)",
        lineHeight: "1.22",
        background: "rgba(5, 8, 14, 0.84)",
        overflow: "hidden"
      });
      return;
    }

    Object.assign(this.el.style, {
      width: "270px",
      maxHeight: "44vh",
      fontSize: "11px",
      lineHeight: "1.32",
      background: "rgba(5, 8, 14, 0.58)",
      overflow: "hidden"
    });
  }

  compactText() {
    const selected = this.frameState.selectedObject;
    const targeting = this.frameState.targeting ?? {};
    const targetFocus = this.frameState.targetFocus ?? {};
    const morph = selectCurrentMorphState(this.frameState);
    const schema = this.frameState.schemaValidationReport ?? {};
    const placeholders = this.frameState.placeholderStatus ?? {};
    const debug = this.frameState.debugDisplay ?? {};
    const camera = this.frameState.cameraControl ?? {};
    const guide = this.frameState.guidePrompt ?? {};
    const opening = this.frameState.openingFlow ?? {};
    const cinematic = this.frameState.awakeningCinematic ?? {};
    const comfort = this.frameState.controllerOnboarding ?? {};
    const coreGrowth = this.frameState.coreGrowth ?? {};
    const movementBoundary = this.frameState.playerKinematics?.movementBoundary ?? {};
    const renderTruth = this.frameState.hubRenderTruth ?? {};
    const spatialTruth = renderTruth.spatialTruth ?? {};

    return [
      `BLOB ${this.frameState.buildId}`,
      `${this.frameState.buildLabel}`,
      `Debug: ${debug.mode ?? "compact"} — ${debug.hint ?? "F1/F2/F3"}`,
      "",
      `Device: ${this.frameState.inputSource?.activeDevice ?? "keyboard"}`,
      `Comfort: ${this.shorten(comfort.statusLine ?? "controller tuning ready", 48)}`,
      `Camera: RS orbit | Y Core inspect/focus | R3 reframe | LS up = camera-forward`,
      `Move ref: ${this.frameState.playerKinematics?.movementReference ?? "camera_relative_free_3d"}`,
      `Altitude: ${this.formatValue(this.frameState.playerKinematics?.altitude)} | Vertical: RB/LB · D-Pad ↑↓ · C/Z`,
      `Bounds: ${movementBoundary.regionLocal ? "region-local" : "shared"} ${movementBoundary.regionId ?? "none"} d:${this.formatValue(movementBoundary.normalizedDistance)} p:${this.formatValue(movementBoundary.pressure)}`,
      `Growth: ${coreGrowth.displayStage ?? "Seed Core"} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% | ${coreGrowth.biasLabel ?? "balanced"}`,
      `Cam ${camera.mode ?? "orbit"} Yaw:${this.formatValue(camera.yaw)} Pitch:${this.formatValue(camera.pitch)} FOV:${this.formatValue(camera.fieldOfView)}`,
      `Hub cam:${camera.hubCameraMode ?? "inactive"} authority:${camera.hubSpatialAuthorityPass ?? "inactive"}`,
      `Hub truth:${spatialTruth.verified ? "VERIFIED" : (renderTruth.active ? "CHECK" : "inactive")} leaks:${renderTruth.visibleLeakCount ?? 0} target:${spatialTruth.targetStateClear ? "clear" : "CHECK"}`,
      "",
      `Cell: ${this.frameState.activeCellId}`,
      this.morphStatusLine(morph),
      this.chainStatusLine(),
      this.blueprintRoleLine(),
      this.routePlanningLine(),
      this.placeholderTriageLine(),
      this.firstMinuteLockLine(),
      this.optionalForkLine(),
      `Opening Stage: ${opening.stageLabel ?? opening.stage ?? "none"} ${Math.round((opening.firstMinuteProgress ?? 0) * 100)}%`,
      `Cine: ${this.shorten(cinematic.beatLabel ?? cinematic.beat ?? "none", 46)} ${Math.round((cinematic.progress ?? 0) * 100)}%`,
      `Guide: ${this.shorten(guide.guideLine ?? "none", 46)}`,
      `Do: ${this.shorten(guide.objectiveLine ?? this.activeNextAction(), 46)}`,
      `Next: ${this.shorten(this.activeNextAction(), 46)}`,
      "",
      `Target: ${targeting.targetId ?? "none"}`,
      `Focus: ${targetFocus.ruleId ?? "none"} → ${targetFocus.preferredTargetId ?? "none"}`,
      `Hint: ${targeting.absorbHint ?? "none"}`,
      `Selected: ${selected?.objectId ?? "none"}`,
      `Schema: ${schema.status ?? "pending"}  Placeholders: ${this.placeholderSummary(placeholders)}`,
      "",
      ...this.activeLoopCompactLines()
    ].join("\n");
  }

  traceText() {
    const k = this.frameState.playerKinematics ?? {};
    const perf = this.frameState.corePerformance ?? {};
    const sensory = this.frameState.coreSensoryResponse ?? {};
    const signal = this.frameState.signalPlainEcology ?? {};
    const relationship = signal.consequenceNextQuestion?.primary ?? null;
    const adjacent = this.frameState.adjacentHostTerritory ?? {};
    const macroHostLink = adjacent.relationshipEstablished
      ? "Gathering Ground · relationship"
      : adjacent.relationshipOwned
        ? "Gathering Ground · verb relationship"
        : adjacent.attentionOwned
          ? "Gathering Ground · attention"
          : adjacent.aimed
            ? "Gathering Ground · in view"
            : null;
    const composition = this.frameState.interactionComposition ?? {};
    const rhythmLock = composition.rhythmLock ?? {};
    const errors = this.frameState.nonFatalSystemErrors ?? [];
    const target = this.frameState.targeting ?? {};
    const telemetry = this.frameState.sessionTelemetry ?? {};
    const worldComposition = this.frameState.hostRhythm?.composition ?? {};

    return [
      "PLAYTEST TRACE // HC028C",
      `${this.frameState.buildId} · ${this.shorten(this.frameState.buildLabel, 34)}`,
      `Cell: ${this.shorten(this.frameState.activeCellId ?? "none", 34)}`,
      `Pos: ${this.formatVector(k.position)} · speed ${this.formatValue(k.speed)}`,
      `Drive: ${this.shorten(perf.personality ?? "triadic balance", 25)} · reserve ${Math.round(perf.endurance?.reservePercent ?? 100)}%`,
      `Sonar: ${sensory.pulseMode ?? "idle"} · answers ${sensory.activeReturnCount ?? sensory.echoCount ?? 0} · res ${sensory.resolutionLanguage?.nearestResolutionStage ?? 0}/3 ${this.shorten(sensory.resolutionLanguage?.nearestInterpretation ?? "none", 25)}`,
      `Target: ${this.shorten(target.targetId ?? "none", 30)}`,
      `Host link: ${macroHostLink ?? (relationship ? `${relationship.sourceNodeNumber}→${relationship.targetNodeNumber} ${relationship.relation}` : "none")}`,
      `Rhythm: ${composition.rhythm?.beat ?? "observe"} · gap ${this.formatValue(rhythmLock.meaningfulChangeAge)}s · reorient ${this.formatValue(rhythmLock.reorientationDurationSeconds)}s · ${rhythmLock.deadTimeRisk ? "REVIEW" : rhythmLock.softSpatialSupportActive ? "spatial support" : "steady"}`,
      `World: ${worldComposition.active ? `${worldComposition.keyId} · ${worldComposition.meterLabel} · ${this.formatValue(worldComposition.tempoBpm)} bpm · beat ${worldComposition.beatNumber}/${worldComposition.beatsPerBar} ${worldComposition.currentFunction} · ${worldComposition.octaveLabel}` : "legacy Host breath"}`,
      `Semantic: ${this.formatValue(rhythmLock.semanticChangeAge)}s · repeats ${rhythmLock.semanticRepeatCount ?? 0} · ${rhythmLock.semanticStagnationRisk ? "STAGNANT" : "changing"}`,
      `Grammar: ${this.frameState.vascularRhythmRoute?.grammarReinforcement?.active ? `${this.frameState.vascularRhythmRoute.grammarReinforcement.window}/3 ${this.frameState.vascularRhythmRoute.grammarReinforcement.mode}` : "ambient"}`,
      `Telemetry: ${telemetry.active ? `REC ${telemetry.eventCount ?? 0}e/${telemetry.movementSampleCount ?? 0}s/${telemetry.coreSnapshotCount ?? 0}c · ${telemetry.storageStatus ?? "memory"}` : "inactive"}`,
      `Insight: gain age ${this.formatValue(telemetry.informationGainAge)}s · churn ${telemetry.semanticChurnActive ? `YES ${this.formatValue(telemetry.semanticChurnScore)}` : `no ${this.formatValue(telemetry.semanticChurnScore)}`} · redundant ${telemetry.redundantMaxResolutionReturns ?? 0}`,
      `Clock: wall ${this.formatValue(telemetry.wallDurationSeconds)}s · sim ${this.formatValue(telemetry.simDurationSeconds)}s · drift ${this.formatValue(telemetry.wallMinusSimSeconds)}s`,
      `Errors: ${errors.length}`,
      "F1 TRACE · F2 SYSTEM DEBUG · F3 CLEAN"
    ].join("\n");
  }

  fullText() {
    // HC027K1 HOTFIX1 — keep a local alias for full-debug diagnostic lines.
    // Some K1/J2 telemetry lines intentionally use the concise frameState form.
    const frameState = this.frameState;
    const d = buildRuntimeDiagnosticSummary(frameState);
    const selected = this.frameState.selectedObject ?? {};
    const input = this.frameState.input ?? {};
    const source = this.frameState.inputSource ?? {};
    const audit = d.audit ?? {};
    const targeting = this.frameState.targeting ?? {};
    const focus = this.frameState.targetFocus ?? {};
    const guide = this.frameState.guidePrompt ?? {};
    const hud = this.frameState.playtestHud ?? {};
    const tissue = this.frameState.morphReadabilityDebug ?? {};
    const camera = this.frameState.cameraControl ?? {};
    const k = this.frameState.playerKinematics ?? {};
    const movementBoundary = k.movementBoundary ?? {};
    const core = this.frameState.coreEmbodiment ?? {};
    const coreGrowth = this.frameState.coreGrowth ?? {};
    const errors = this.frameState.nonFatalSystemErrors ?? [];
    const latestError = errors[0];
    const pressure = this.frameState.signalChorusNextRoutePressure ?? {};
    const identity = this.frameState.signalChorusVisualIdentity ?? {};
    const surfaceWake = this.frameState.surfaceWakeLayeredInteraction ?? {};
    const surfaceEcology = this.frameState.surfaceWakeEcology ?? {};
    const nurseryCircuit = this.frameState.nurseryCircuit ?? {};
    const guideThreshold = this.frameState.guideThresholdLayeredInteraction ?? {};
    const layered = this.frameState.signalChorusLayeredInteraction ?? {};
    const hub = this.frameState.hubChamberFoundation ?? {};
    const hubInvestigation = this.frameState.hubInvestigationGameplay ?? {};
    const cohesion = this.frameState.firstSliceCohesion ?? {};
    const inspection = this.frameState.inspectionCamera ?? this.frameState.tightInspectionCamera ?? {};
    const inspectionComposition = this.frameState.inspectionComposition ?? {};
    const grammar = surfaceWake.foundationalGrammar ?? guideThreshold.foundationalGrammar ?? layered.foundationalGrammar ?? {};
    const ownership = this.frameState.firstSliceRuntimeOwnership ?? {};
    const runtimeMount = this.frameState.firstSliceRuntimeMount ?? {};
    const runtimeExecution = this.frameState.runtimeExecution ?? {};
    const compatibilityArchive = this.frameState.compatibilityArchive ?? {};
    const currentMode = this.frameState.currentMode ?? {};
    const objective = this.frameState.objectiveState ?? {};
    const gate = this.frameState.gateState ?? {};
    const statusPage = this.frameState.statusPage ?? {};
    const transitionContinuity = this.frameState.transitionContinuity ?? {};
    const renderTruth = this.frameState.hubRenderTruth ?? {};
    const spatialTruth = renderTruth.spatialTruth ?? {};
    const targetLifecycle = this.frameState.hubTargetLifecycle ?? {};
    const graveMemoryRoute = this.frameState.graveMemoryRoute ?? {};
    const vascularRhythmRoute = this.frameState.vascularRhythmRoute ?? {};
    const siltPressureRoute = this.frameState.siltPressureRoute ?? {};
    const routeHistory = this.frameState.act1RouteHistory ?? {};
    const routeRuntimeContract = this.frameState.act1RouteRuntimeContract ?? {};
    const activeRouteContract = this.frameState.act1RouteContract ?? {};
    const promptLifecycle = this.frameState.promptLifecycle ?? {};
    const combFoundation = this.frameState.combThresholdFoundation ?? {};
    const combPlayable = this.frameState.combThresholdPlayable ?? {};

    return [
      `BLOB ${this.frameState.buildId} | ${this.shorten(this.frameState.buildLabel, 44)}`,
      `Source manifest (compat) ${this.frameState.buildManifest?.id ?? "none"} v${this.frameState.buildManifest?.version ?? "?"}`,
      `Frame ${this.frameState.frame} | Time ${this.formatValue(this.frameState.runtimeSeconds)}s`,
      `Host ${this.shorten(this.frameState.activeHostId, 48)}`,
      `CELL ${this.shorten(this.frameState.activeCellId, 48)}`,
      "",
      "FIRST SLICE MODE / REGISTRY OWNERSHIP",
      `Region: ${currentMode.regionDisplayName ?? currentMode.regionId ?? "unmapped"} | Mode:${currentMode.id ?? "none"}`,
      `Mode owner:${currentMode.sceneBehaviorOwner ?? ownership.modeOwner ?? "none"}`,
      `Mount:${runtimeMount.profileId ?? "none"} #${runtimeMount.mountSequence ?? 0} ${runtimeMount.mountStatus ?? "pending"}`,
      `Authorities G:${runtimeMount.gameplayOwner ?? "none"} P:${runtimeMount.presentationOwner ?? "none"}`,
      `Prompt region:${promptLifecycle.activeRegionId ?? "none"} owner:${promptLifecycle.contentOwner ?? "none"} epoch:${promptLifecycle.regionPromptEpoch ?? 0} atomic:${promptLifecycle.atomicRegionRepublishComplete ? "yes" : "CHECK"}`,
      `Camera owner:${this.shorten(runtimeMount.cameraOwner ?? "none", 52)}`,
      `Region systems:${runtimeExecution.activeRegionSystemCount ?? 0}/${runtimeMount.activeUpdateBudget ?? 0} executed | inactive skipped:${runtimeExecution.skippedRegionSystemCount ?? 0}`,
      `Runtime total:${runtimeExecution.executedSystemCount ?? 0}/${runtimeExecution.updateSystemCount ?? 0} | registered:${runtimeExecution.registeredSystemCount ?? 0}`,
      "",
      "PERFORMANCE / RUNTIME CAPTURE",
      `Route feel:${frameState.playerKinematics?.routeFeelProfile ?? "shared"} speed×${this.formatValue(frameState.playerKinematics?.routeSpeedScale)} accel×${this.formatValue(frameState.playerKinematics?.routeAccelerationScale)} boost×${this.formatValue(frameState.playerKinematics?.routeBoostScale)} flowAlign:${this.formatValue(frameState.playerKinematics?.directionalFlowAlignment)}` ,
      `Sample:${runtimeExecution.timingSampled ? "YES" : "no"} reason:${runtimeExecution.timingSampleReason ?? "none"} frameGap:${this.formatValue(runtimeExecution.rawFrameDeltaMs)}ms`,
      `Updater sample:${this.formatValue(runtimeExecution.sampledUpdateMs)}ms share:${Math.round((runtimeExecution.updateShareOfFrame ?? 0) * 100)}% class:${runtimeExecution.hitchClassification ?? "waiting"}`,
      `Worst updater sample:${this.formatValue(runtimeExecution.worstSampledUpdateMs)}ms @frame ${runtimeExecution.worstSampledFrame ?? -1}`,
      ...((runtimeExecution.slowestSampledSystems ?? []).slice(0, 5).map((item, index) =>
        `#${index + 1} ${this.shorten(item.id, 34)} last:${this.formatValue(item.lastMs)} avg:${this.formatValue(item.averageMs)} max:${this.formatValue(item.maxMs)}ms`
      )),
      `Interpretation:${runtimeExecution.hitchClassification === "update_bound" ? "UPDATER HOTSPOT" : runtimeExecution.hitchClassification === "non_update_bound" ? "LIKELY RENDER / ALLOCATION / GC" : runtimeExecution.hitchClassification === "mixed" ? "MIXED COST" : "collecting"}`,
      "",
      `Transition prep:${transitionContinuity.preparedJobCount ?? 0}/${transitionContinuity.totalJobCount ?? 0} S→G:${transitionContinuity.surfaceToGuideReady ? "ready" : "warming"} G→H:${transitionContinuity.guideToHubReady ? "ready" : "warming"} H→Grave:${transitionContinuity.hubToGraveReady ? "ready" : "warming"} H→V:${transitionContinuity.hubToVascularPlayableReady ? "ready" : "warming"}`,
      `Transition timing:${this.formatValue(transitionContinuity.lastRawDeltaMs)}ms last ${this.formatValue(transitionContinuity.maxObservedFrameGapMs)}ms max gaps>${transitionContinuity.frameGapThresholdMs ?? 80}:${transitionContinuity.frameGapCount ?? 0} stalled:${transitionContinuity.stalled ? "CHECK" : "no"}`,
      `Archive:${compatibilityArchive.dormantSystemCount ?? 0} dormant | registered:${runtimeExecution.dormantCompatibilityRegisteredCount ?? 0} | ${compatibilityArchive.status ?? "pending"}`,
      `Objective:${objective.id ?? "none"} ${Math.round((objective.progress ?? 0) * 100)}% ${objective.status ?? "pending"}`,
      `Gate:${gate.id ?? "none"} ${gate.status ?? "pending"} → ${gate.to ?? "none"}`,
      `Gate readable:${gate.readable ? "yes" : "no"} crossable:${gate.crossable ? "YES" : "no"} blocked:${gate.departureBlockedBy ?? "none"}`,
      `GATE PROXIMITY dist:${this.formatValue(gate.interactionDistance)} range:${this.formatValue(gate.interactionRange)} inside:${gate.interactionReady ? "YES" : "no"} input:${gate.expectedInput ?? "none"}`,
      `Gate eligibility awake:${gate.awake ? "yes" : "no"} mounted:${gate.destinationMounted ? "yes" : "no"} requirements:${gate.requirementsComplete ? "met" : "pending"} playable:${gate.playableReady ? "yes" : "no"}`,
      ...(combFoundation.active ? [
        `COMB READS ${combPlayable.successfulFilterReads ?? 0}/${combPlayable.requiredFilterReads ?? 6} completed:[${(combPlayable.completedBandNumbers ?? []).join(",") || "none"}] sequential:${combPlayable.sequentialReadOrderEnforced ? "YES" : "CHECK"}`,
        `ACTIVE FILTER ${combPlayable.currentBandNumber ?? "?"} z:${this.formatValue(combPlayable.activeBandZ)} dist:${this.formatValue(combPlayable.activeBandDistance)} range:${this.formatValue(combPlayable.activeBandRange)} inside:${combPlayable.inActiveBand ? "YES" : "no"} dir:${combPlayable.activeBandDirection ?? "none"}`,
        `FILTER CONDITIONS center:${combPlayable.memoryCentered ? "YES" : "no"} stabilize:${combPlayable.stabilizeHeld ? "YES" : "no"} cadence:${combPlayable.cadenceOpen ? "OPEN" : "closed"} warning:${combPlayable.warning ?? "none"}`,
        `SYNTHESIS SEAL dist:${this.formatValue(combPlayable.finalSealDistance ?? combFoundation.apertureSealDistance)} range:${this.formatValue(combPlayable.finalSealRange ?? combFoundation.apertureSealReadRange)} inside:${combPlayable.finalSealInside ? "YES" : "no"} authority:${combPlayable.finalSealAuthority ?? "foundation"}`,
        `MEMBRANE HANDSHAKE coherence:${this.formatValue(combPlayable.coherence)} min:${this.formatValue(combPlayable.minimumFinalCoherence)} recovering:${combPlayable.membraneCoherenceRecovering ? "YES" : "no"} settle:${this.formatValue(combPlayable.membraneStabilizeProgress)} ready:${combPlayable.membraneReady ? "YES" : "no"}`,
        `APERTURE GATE reveal:${this.formatValue(combPlayable.apertureRevealProgress)} witnessed:${combPlayable.apertureRevealWitnessed ? "YES" : "no"} complete:${combPlayable.challengeComplete ? "YES" : "no"} crossable:${gate.id === "comb_threshold_to_aperture_fields" && gate.crossable ? "YES" : "no"}`
      ] : []),
      `Registry owners R:${ownership.regionOwner ?? "none"} O:${ownership.objectiveOwner ?? "none"} G:${ownership.gateOwner ?? "none"}`,
      `Hub status:${this.shorten(ownership.signalChorusClassification ?? "not_active", 48)}`,
      `Hub routes:${hub.routeCount ?? 0} active:${hub.activeRouteCount ?? 0} dormant:${hub.dormantRouteCount ?? 0} foundation:${hub.completed ? "complete" : (hub.active ? "forming" : "inactive")}`,
      `Route contracts: mounted ${routeRuntimeContract.mountedDestinationCount ?? 0}/2 awake:${routeRuntimeContract.awakeRouteCount ?? 0}/2 pending:${routeRuntimeContract.gameplayPendingCount ?? 0} crossable:${routeRuntimeContract.crossableRouteCount ?? 0}`,
      `Route mount:${activeRouteContract.active ? activeRouteContract.regionId : "inactive"} ${activeRouteContract.contractStatus ?? "prepared_inactive"} boundary:${activeRouteContract.movementBoundaryMode ?? "inactive"}`,
      `Hub play routes:${hubInvestigation.routeReadCount ?? 0}/${hubInvestigation.routeCount ?? 3} memory:${hubInvestigation.memoryRead ? "read" : "pending"} center:${hubInvestigation.returnedToCenter ? "returned" : "pending"} ready:${hubInvestigation.investigationReady ? "YES" : "no"}`,
      `Hub authority:${hub.spatialAuthorityPass ?? "legacy"} owner:${hub.singleCompositionOwner ? "ONE" : "CHECK"} investigation-visual:${hub.investigationVisualAuthorityDelegated ? "delegated" : "CHECK"}`,
      `Hub space:cam ${hub.cameraMode ?? "inactive"} corridors:${hub.routeCorridorCount ?? 0} depth:${hub.depthLayerCount ?? 0} player:${hub.playerBodyFirstIdentity ? "body-first" : "CHECK"} lines:${hub.longConnectorLinesDisabled ? "off" : "CHECK"}`,
      `Grave preview:${graveMemoryRoute.active ? "ACTIVE" : (graveMemoryRoute.completed ? "retained" : "inactive")} stage:${this.shorten(graveMemoryRoute.stage ?? "none", 26)} read:${graveMemoryRoute.readCount ?? 0}/${graveMemoryRoute.requiredReadCount ?? 4} stable:${graveMemoryRoute.memorySiltStabilized ? "YES" : "no"}`,
      `Grave truth:protected ${graveMemoryRoute.protectedObjectsUntouched !== false ? "intact" : "CHECK"} return:${graveMemoryRoute.returnFoldReady ? "ready" : "pending"} dist:${this.formatValue(graveMemoryRoute.returnFoldDistance)} history E:${routeHistory.graveEntryCount ?? 0} R:${routeHistory.graveReturnCount ?? 0}`,
      `Grave landmarks:${graveMemoryRoute.landmarkVisualLockComplete ? "LOCKED" : "CHECK"} ${graveMemoryRoute.landmarkVisualCount ?? 0}/4 expired:${graveMemoryRoute.expiredGraveLandmarkPlaceholdersActive ?? 0} geometry:${graveMemoryRoute.landmarkGeometryOwner ?? "none"} motion:${graveMemoryRoute.landmarkMotionOwner ?? "none"}`,
      `Vascular rhythm:${vascularRhythmRoute.active ? "ACTIVE" : (vascularRhythmRoute.completed ? "retained" : "inactive")} reads:${vascularRhythmRoute.lockedCadenceReads ?? 0}/${vascularRhythmRoute.requiredCadenceReads ?? 3} sync:${this.formatValue(vascularRhythmRoute.synchronization)} integrity:${this.formatValue(vascularRhythmRoute.circulationIntegrity)}`,
      `Vascular recovery:turbulence ${this.formatValue(vascularRhythmRoute.turbulence)} risks:${vascularRhythmRoute.desynchronizationCount ?? 0} recovered:${vascularRhythmRoute.recoveryCount ?? 0} reverse:${vascularRhythmRoute.currentDirection === "outward" ? "YES" : "no"} return:${vascularRhythmRoute.returnFoldReady ? "ready" : "held"}`,
      `Vascular stabilize:${vascularRhythmRoute.stabilizationInRange ? "IN RANGE" : "move inward"} d:${this.formatValue(vascularRhythmRoute.pathDistance)} r:${this.formatValue(vascularRhythmRoute.stabilizationRange)} LT:${vascularRhythmRoute.stabilizing ? "HELD" : "up"} safe-extra-pulses:${vascularRhythmRoute.postReadPulseIgnoredCount ?? 0}`,
      `Vascular retained:${hub.vascularRhythmRetained ? "LOCKED" : "pending"} history R:${routeHistory.vascularReturnCount ?? 0} reads:${routeHistory.vascularCadenceReads ?? 0}/3 sync:${this.formatValue(routeHistory.vascularSynchronization)} integrity:${this.formatValue(routeHistory.vascularCirculationIntegrity)}`,
      `Vascular consequence:Core filament ${coreGrowth.vascularRhythmRetained && this.frameState.coreEmbodiment?.visibleVascularReturnFilament ? "VISIBLE" : "pending"} Hub echo:${hub.vascularHubEchoVisible ? "VISIBLE" : "pending"} anatomy:${hub.vascularHubEchoFilamentCount ?? 0}F/${hub.vascularHubEchoValveCount ?? 0}V rings:${hub.vascularReturnObjectDefiningRings ?? 0} Silt:${routeRuntimeContract.routeStates?.silt_burrow_route?.crossable ? "playable" : "CHECK"}`,
      `Silt pressure:${siltPressureRoute.active ? "ACTIVE" : (siltPressureRoute.completed ? "retained" : "inactive")} read:${siltPressureRoute.pressureRead ? "YES" : "no"} brace:${this.formatValue(siltPressureRoute.braceSeconds)} ribs:${siltPressureRoute.ribsReleased ? "OPEN" : "closed"} depth:${this.formatValue(siltPressureRoute.maxDepthProgress)}`,
      `Silt appetite:safe ${siltPressureRoute.safeMatterAbsorbed ? "TAKEN" : "waiting"} RT:${siltPressureRoute.absorbHeld ? "HELD" : "up"} safe-d:${this.formatValue(siltPressureRoute.safePacketDistance)} dense-d:${this.formatValue(siltPressureRoute.nearestDenseDistance)} packed:${siltPressureRoute.denseMatterLeftIntact !== false ? "intact" : "CHECK"}`,
      `Silt recovery:compression ${this.formatValue(siltPressureRoute.compression)} failure:${siltPressureRoute.compressionFailure ? "ACTIVE" : "no"} risks:${siltPressureRoute.failureCount ?? 0} recovered:${siltPressureRoute.failureRecovered ? "YES" : "no"} LT:${siltPressureRoute.stabilizing ? "HELD" : "up"} in-range:${siltPressureRoute.stabilizationInRange ? "YES" : "no"} return:${siltPressureRoute.returnFoldReady ? "ready" : "held"}`,
      `Core practice:${cohesion.emergingIdentity ?? "forming"} R:${this.formatValue(cohesion.practice?.reading)} B:${this.formatValue(cohesion.practice?.binding)} S:${this.formatValue(cohesion.practice?.stabilizing)}`,
      `Lessons:${cohesion.retainedLessonCount ?? 0}/3 visited:${cohesion.visitedRegionCount ?? 0}/3 cohesion:${Math.round((cohesion.overallProgress ?? 0) * 100)}% triggers:${cohesion.triggerOwnershipPreserved ? "preserved" : "CHECK"}`,
      `Slice lock:${cohesion.sliceLockReady ? "LOCKED" : "pending"} missing:${this.shorten((cohesion.missingLockCriteria ?? []).join(","), 54) || "none"}`,
      `Status Page:${statusPage.open ? "OPEN" : "closed"} tab:${statusPage.activeTab ?? "Core"} firstHubUse:${statusPage.firstHubUseComplete ? "complete" : "pending"}`,
      `Status commit:${statusPage.firstHubUseCommittedOnOpen ? "open_event" : "none"} frame:${statusPage.firstHubUseCommitFrame ?? "-"} mode:${statusPage.firstHubUseCommitMode ?? "none"}`,
      `Status input:#${statusPage.lastToggleEventId ?? 0} ${statusPage.lastToggleSource ?? "none"} frame:${statusPage.lastToggleFrame ?? "-"}`,
      `Status proof:intent ${statusPage.hubSelfReadingIntentLatched ? "YES" : "no"} ready ${statusPage.hubInvestigationReady ? "YES" : "no"} objective ${statusPage.objectiveConsumedCompletion ? "YES" : "no"} gate ${statusPage.gateConsumedCompletion ? "YES" : "no"}`,
      "",
      "FLOW / OWNERSHIP",
      `Health: ${d.health}`,
      `Owner: ${d.owner}`,
      `Flow: ${d.flowKey} | Stage: ${this.shorten(d.stage, 28)}`,
      `Progress: ${Math.round(d.progress * 100)}% | Ready:${d.ready ? "yes" : "no"} Complete:${d.complete ? "yes" : "no"}`,
      `Expected: ${this.shorten(d.expectedTarget, 46)}`,
      `Target:   ${this.shorten(d.actualTarget, 46)}`,
      `Aligned: ${d.targetAligned ? "YES" : "NO"} | Provider: ${this.shorten(d.targetProvider, 28)}`,
      `Rule: ${this.shorten(d.targetRule, 50)}`,
      `Selected: ${this.shorten(selected.objectId ?? selected.recipeId ?? "none", 46)}`,
      `Target kind:${targeting.targetKind ?? "none"} dist:${this.formatValue(targeting.distance)} lock:${this.formatValue(targeting.lockStrength)}`,
      `Last flow event: ${this.shorten(d.lastInteraction, 44)}`,
      `BLOCKER: ${this.shorten(d.blocker, 50)}`,
      `NEXT: ${this.shorten(d.nextAction, 54)}`,
      "",
      "INPUT / LAST PULSE",
      `Device: ${source.activeDevice ?? "keyboard"} | Pad:${source.gamepadActive ? "yes" : "no"} ${this.shorten(source.gamepadMapping ?? "none", 15)}`,
      `ControlMap: ${source.controlMapId ?? "unknown"} | Expected:${source.expectedAction ?? "none"}`,
      `X[2] pulse ${this.formatValue(source.pulseButtonValue)} ${source.pulseButtonDown ? "DOWN" : "up"} | A[0] interact ${this.formatValue(source.contextButtonValue)} ${source.contextButtonDown ? "DOWN" : "up"}`,
      `RT absorb ${this.formatValue(source.absorbTriggerValue)} ${source.absorbHeld ? "HELD" : "up"} | LT stabilize ${this.formatValue(source.stabilizeTriggerValue)} ${source.stabilizeHeld ? "HELD" : "up"}`,
      `Y[3] Guide/focus ${this.formatValue(source.inspectionCameraButtonValue)} ${source.inspectionCameraButtonDown ? "DOWN" : "up"} | tight toggle:${input.toggleInspectionCameraPressed ? "YES" : "no"}`,
      `Status [8/9/Tab] now:${input.statusPageTogglePressed ? "YES" : "no"} seq:${source.statusPageSequence ?? 0} source:${source.statusPageSource ?? "none"}`,
      `Pulse now:${input.pulsePressed ? "YES" : "no"} seq:${d.pulseSequence} age:${this.formatValue(d.pulseAge)}`,
      `Source: ${this.shorten(d.pulseSource, 46)}`,
      `Produced #${audit.eventId ?? 0} frame:${audit.producedAtFrame ?? -1} cell:${this.shorten(audit.activeCellId ?? "none", 26)}`,
      `At target: ${this.shorten(audit.targetIdAtProduction ?? "none", 42)}`,
      `Consumed: ${this.shorten(audit.consumedBy ?? "none", 39)} frame:${audit.consumedAtFrame ?? -1}`,
      `Consumed target: ${this.shorten(audit.consumedTargetId ?? "none", 40)}`,
      `Result: ${this.shorten(audit.result ?? "none", 52)}`,
      "",
      "VISIBLE INSTRUCTION STATE",
      `HUD objective: ${this.shorten(hud.objective ?? "none", 48)}`,
      `HUD action: ${this.shorten(hud.actionHint ?? "none", 51)}`,
      `Guide: ${this.shorten(guide.guideLine ?? "none", 55)}`,
      `Guide objective: ${this.shorten(guide.objectiveLine ?? "none", 46)}`,
      `Tissue: ${this.shorten(tissue.status ?? "not published", 54)}`,
      `Tissue next: ${this.shorten(tissue.step ?? "not published", 49)}`,
      ...(surfaceWake.active || surfaceWake.stage ? [
        "",
        "SURFACE WAKE LAYERED INTERACTION",
        `Stage: ${this.shorten(surfaceWake.stage ?? "waiting", 34)} | ${Math.round((surfaceWake.progress ?? 0) * 100)}%`,
        `Focus:${this.shorten(surfaceWake.currentFocus ?? "none", 30)} dist:${this.formatValue(surfaceWake.focusDistance)}`,
        `Approach:${this.formatValue(surfaceWake.approachHold)} Hold:${this.formatValue(surfaceWake.resonanceHold)} Response:${this.formatValue(surfaceWake.tissueResponse)} Settle:${this.formatValue(surfaceWake.settleProgress)}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} introduced-at-opening:${grammar.introducedAtSurfaceWake ? "yes" : "no"}`,
        `Seed:${surfaceWake.safeSeedReadable ? "readable" : "held"} Absorb:${surfaceWake.blocksSafeSeedAbsorb ? "blocked by lesson" : "unlocked"} Route:none`
      ] : []),
      ...(surfaceEcology.active ? [
        "",
        `SURFACE WAKE ECOLOGY / ${surfaceEcology.pass ?? "LEGACY"}`,
        `Embodiment:${this.shorten(surfaceEcology.visualEmbodiment ?? "none", 38)} zones:${surfaceEcology.spatialZones?.length ?? 0} silhouettes:${surfaceEcology.silhouetteClasses?.length ?? 0}`,
        `Persistent resonance effects:${surfaceEcology.permanentResonanceEffects ? "CHECK" : "suppressed"}`,
        `Phase:${surfaceEcology.phase ?? "inactive"} condition:${this.shorten(surfaceEcology.worldCondition ?? "none", 42)}`,
        `Care:${this.shorten(surfaceEcology.careState ?? "none", 28)} current:${surfaceEcology.currentPhase ?? "none"}`,
        `Sensory:${this.shorten(surfaceEcology.sensoryState ?? "none", 28)} response-travel:${surfaceEcology.foldResponseTraveling ? "yes" : "no"}`,
        `Last action:${this.shorten(surfaceEcology.lastMeaningfulAction ?? "none", 35)}`,
        `World response:${this.shorten(surfaceEcology.lastWorldResponse ?? "none", 42)}`,
        `Seed presented:${surfaceEcology.seedPresented ? "yes" : "no"} absorbed:${surfaceEcology.seedAbsorbed ? "yes" : "no"} seam:${surfaceEcology.seamReadable ? "readable" : "held"}`,
        `Departure:${surfaceEcology.departureExpression ?? "unexpressed"} echo:${surfaceEcology.persistentEcho ?? "none"}`,
        `Trigger owner:${this.shorten(surfaceEcology.triggerOwner ?? "none", 48)} direct mutations:${surfaceEcology.directTriggerCompletion || surfaceEcology.directGateMutation ? "CHECK" : "none"}`
      ] : []),
      ...(nurseryCircuit.active ? [
        "",
        `LIVING NURSERY CIRCUIT / ${nurseryCircuit.pass ?? "HC-009C"}`,
        `Packet:${nurseryCircuit.packetActive ? this.shorten(nurseryCircuit.matterType ?? "matter", 25) : "between cycles"} ${Math.round((nurseryCircuit.packetProgress ?? 0) * 100)}% read:${nurseryCircuit.packetIdentified ? "yes" : "no"} purity:${Math.round((nurseryCircuit.packetPurity ?? 0) * 100)}%`,
        `Tender food:${nurseryCircuit.tenderFedCount ?? 0} trust:${Math.round((nurseryCircuit.tenderTrust ?? 0) * 100)} integrity:${Math.round((nurseryCircuit.tenderIntegrity ?? 0) * 100)} scar-load:${Math.round((nurseryCircuit.scarLoad ?? 0) * 100)}`,
      `Tender companion:${frameState.tenderCompanion?.bonded ? "BONDED" : "nursery-only"} role:${frameState.tenderCompanion?.role ?? "care"} repair:${frameState.tenderCompanion?.repairBoostActive ? "ACTIVE" : "idle"} recovered:${this.formatValue(frameState.tenderCompanion?.totalScarRecovered)}`,
        `Cycles:${nurseryCircuit.resolvedCycleCount ?? 0} authored:${nurseryCircuit.playerAuthoredCycleCount ?? 0} passive:${nurseryCircuit.passiveCycleCount ?? 0}`,
        `Agency:${nurseryCircuit.agencyProven ? "PROVEN" : "pending"} success:${nurseryCircuit.playerAuthoredSuccessfulCycleCount ?? 0} strain:${nurseryCircuit.playerAuthoredFailedCycleCount ?? 0} Fold:${nurseryCircuit.foldInvitation ? "invited" : "latent"}`,
        `Outcome:${this.shorten(nurseryCircuit.lastOutcome ?? "none", 42)} direct progression:${nurseryCircuit.directTriggerCompletion || nurseryCircuit.directMorphActivation ? "CHECK" : "none"}`
      ] : []),
      "",
      "FIRST VISIBLE CORE GROWTH / HC-009D",
      `Stage:${coreGrowth.displayStage ?? "Seed Core"} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% target:${Math.round((coreGrowth.growthTarget ?? 0) * 100)}% committed:${coreGrowth.firstGrowthCommitted ? "YES" : "no"}`,
      `Bias:${coreGrowth.biasLabel ?? "balanced_first_binding"} value:${this.formatValue(coreGrowth.chemistryBias)} reversible:${coreGrowth.biasReversible ? "yes" : "CHECK"} class:${coreGrowth.permanentClass ? "LOCKED" : "none"}`,
      `Retained cycles:${coreGrowth.resolvedCycleCount ?? 0} success:${coreGrowth.successfulCycleCount ?? 0} filtered:${coreGrowth.filteredCycleCount ?? 0} seed-mass:${coreGrowth.protectedSeedMassIntegrated ? "integrated" : "waiting"}`,
      `Guide pressure:${coreGrowth.guidePressureTested ? "tested" : "pending"} Hub echo:${coreGrowth.hubReflectionObserved ? "observed" : "pending"} abilities:${coreGrowth.abilityUnlocks?.length ?? 0}`,
      `Ownership:${coreGrowth.owner ?? "CoreGrowthSystem"} → ${coreGrowth.bodyLanguageCollaborator ?? "CoreEmbodimentSystem"} direct progression:${coreGrowth.directTriggerCompletion || coreGrowth.directObjectiveCompletion || coreGrowth.directGateMutation ? "CHECK" : "none"}`,
      ...(guideThreshold.active || guideThreshold.stage ? [
        "",
        "GUIDE THRESHOLD LAYERED TRAVERSAL",
        `Stage: ${this.shorten(guideThreshold.stage ?? "waiting", 34)} | ${Math.round((guideThreshold.progress ?? 0) * 100)}%`,
        `Focus:${this.shorten(guideThreshold.currentFocus ?? "none", 30)} dist:${this.formatValue(guideThreshold.focusDistance)}`,
        `Align:${this.formatValue(guideThreshold.alignmentProgress)} move:${this.formatValue(guideThreshold.movementMagnitude)} local dot:${this.formatValue(guideThreshold.localPathDirectionDot)}`,
        `Path:${this.formatValue(guideThreshold.pathProgress)} corridor:${this.formatValue(guideThreshold.corridorDistance)}/${this.formatValue(guideThreshold.corridorRange)} inside:${guideThreshold.withinPathCorridor ? "yes" : "no"} assist:${guideThreshold.guidanceLevel ?? 0}`,
        `Traverse:${this.formatValue(guideThreshold.traversalProgress)} hold:${this.formatValue(guideThreshold.resonanceHold)} response:${this.formatValue(guideThreshold.tissueResponse)} settle:${this.formatValue(guideThreshold.settleProgress)} end:${this.formatValue(guideThreshold.settleDistance)} armed:${guideThreshold.settleReleaseArmed ? "yes" : "no"} arm:${guideThreshold.settleArmSource ?? "none"} latch:${guideThreshold.settleLatched ? "yes" : "no"} latchSrc:${guideThreshold.settleLatchSource ?? "none"} zone:${guideThreshold.settleZoneSource ?? "none"}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} movement-led:${grammar.movementLed ? "yes" : "no"}`,
        `Route:${guideThreshold.routeActivated ? "open" : "closed"} Transition-ready:${guideThreshold.transitionReady ? "yes" : "no"}`
      ] : []),
      ...(layered.active || layered.stage ? [
        "",
        "LAYERED CHORUS INTERACTION",
        `Stage: ${this.shorten(layered.stage ?? "waiting", 34)} | ${Math.round((layered.progress ?? 0) * 100)}%`,
        `Focus:${this.shorten(layered.currentFocus ?? "none", 30)} dist:${this.formatValue(layered.focusDistance)}`,
        `Cadence:${layered.cadenceMatches ?? 0}/${layered.requiredCadenceMatches ?? 2} window:${layered.cadenceWindowOpen ? "GOLD" : "wait"} misses:${layered.cadenceMisses ?? 0}`,
        `Hold:${this.formatValue(layered.resonanceHold)} response:${this.formatValue(layered.tissueResponse)} settle:${this.formatValue(layered.settleProgress)}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} canonical:${grammar.reusableFromOpening ? "opening-ready" : "local"}`,
        `Route:${layered.routeActivated ? "open" : "closed"} Cell change:${layered.activeCellChanges ? "yes" : "no"}`
      ] : []),
      ...(hub.active || hub.stage ? [
        "",
        "HUB CHAMBER FOUNDATION",
        `Stage: ${this.shorten(hub.stage ?? "waiting", 34)} | ${Math.round((hub.progress ?? 0) * 100)}%`,
        `Anchor:${hub.centralAnchorReadable ? "readable" : "forming"} routes:${hub.routeCount ?? 0} active:${hub.activeRouteCount ?? 0} dormant:${hub.dormantRouteCount ?? 0}`,
        `Layout:${hub.threeRouteLayoutReadable ? "readable" : "forming"} memory:${hub.firstMemoryFragmentReadable ? "readable" : "forming"}`,
        `Render truth:${spatialTruth.verified ? "VERIFIED" : "CHECK"} owner:${renderTruth.owner ?? "none"} leaks:${renderTruth.visibleLeakCount ?? 0} target:${spatialTruth.targetStateClear ? "clear" : "CHECK"}`,
        `Spacing:${this.formatValue(spatialTruth.minimumRouteSeparation)} center:${this.formatValue(spatialTruth.minimumCenterClearance)} entry:${this.formatValue(spatialTruth.minimumCorridorStartClearance)} silhouettes:${spatialTruth.silhouetteCount ?? 0}/3`,
        `Screen:${spatialTruth.screenTruthLatched ? "LOCKED" : spatialTruth.screenRoutesReadable ? "sampling" : "CHECK"} centers:${spatialTruth.allRouteCentersInView ? "in" : "out"} territories:${spatialTruth.allRouteTerritoriesVisible ? "visible" : "CHECK"} min-sep:${this.formatValue(spatialTruth.minimumScreenSeparation)} overlap:${this.formatValue(spatialTruth.maximumScreenOverlapRatio)}`,
        `Host projection:${spatialTruth.distantHostProjectionMeasured ? `${this.formatValue((spatialTruth.distantHostViewportCoverage ?? 0) * 100)}% viewport` : "unavailable"} dominance:${spatialTruth.distantHostProjectedDominance ? "CHECK" : "clear"} role:${renderTruth.distantHostMode ?? "none"}`,
        `Target lifecycle:${targetLifecycle.staleTargetDetected ? `STALE ${this.shorten(targetLifecycle.staleTargetId ?? "unknown", 28)}` : "clear"} artifacts:${targetLifecycle.visualArtifactsSuppressed ? "suppressed" : "CHECK"}`,
        `Active route:${hub.activeRouteId ?? "none"} gate:${hub.activeRouteGateId ?? "none"}`,
        `Authority:${hub.spatialAuthorityPass ?? "legacy"} single-owner:${hub.singleCompositionOwner ? "yes" : "CHECK"} investigation visuals:${hub.investigationVisualAuthorityDelegated ? "delegated" : "CHECK"}`,
        `Camera:${hub.cameraMode ?? "inactive"} corridors:${hub.routeCorridorCount ?? 0} depth:${hub.depthLayerCount ?? 0} player:${hub.playerBodyFirstIdentity ? "body-first" : "CHECK"}`,
        `Long lines:${hub.longConnectorLinesDisabled ? "disabled" : "CHECK"} idle rings:${hub.idleGlobalRingsDisabled ? "disabled" : "CHECK"}`,
        `New route content:${hub.newRouteContentActivated ? "YES" : "no"} target/input:${hub.targetRequired ? "target" : "none"}/${hub.inputRequired ? "input" : "none"}`,
        `Vascular return:${hub.vascularRhythmRetained ? "RETAINED" : "pending"} Core filament:${hub.vascularCoreFilamentVisible ? "visible" : "pending"} Hub echo:${hub.vascularHubEchoVisible ? "visible" : "pending"} anatomy:${hub.vascularHubEchoFilamentCount ?? 0}F/${hub.vascularHubEchoValveCount ?? 0}V/${hub.vascularHubEchoChargeCount ?? 0}C`,
        `Status Page:${hub.firstStatusPageUseComplete ? "used" : "pending"} full Hub:${hub.fullHubComplete ? "complete" : "pending"}`
      ] : []),
      ...(inspection.available || inspection.active || inspection.status ? [
        "",
        "PERSISTENT TIGHT / INSPECTION CAMERA",
        `Mode:${inspection.active ? "ACTIVE" : (inspection.available ? "AVAILABLE" : "waiting")} | ${this.shorten(inspection.status ?? "none", 31)}`,
        `Focus mode:${inspection.focusMode ?? "none"} | ${this.shorten(inspection.focusObjectId ?? "none", 28)} dist:${this.formatValue(inspection.focusDistance)}`,
        `Toggle:Y count:${inspection.toggleCount ?? 0} event:${this.shorten(inspection.lastEvent ?? "none", 32)}`,
        `Corridor:${inspectionComposition.corridorClear ? "clear" : "softened"} faded:${inspectionComposition.fadedBlockerCount ?? 0} marker:${inspectionComposition.focusMarker ?? "hidden"}`,
        `Persistent:${inspection.persistentAcrossCells ? "cells+focus-loss" : "NO"} | Camera-relative:${inspection.cameraRelativeMovementPreserved ? "preserved" : "NO"}`
      ] : []),
      ...(pressure.active || pressure.stage ? [
        "",
        "NEXT ROUTE PRESSURE",
        `Pressure: ${pressure.active ? "READABLE / PASSIVE" : "waiting"} | ${this.shorten(pressure.stage ?? "none", 31)}`,
        `Route active:${pressure.routeActivated ? "yes" : "no"} Target:${pressure.targetRequired ? "yes" : "no"} Input:${pressure.inputRequired ? "yes" : "no"}`,
        `Cue: ${this.shorten(pressure.pressureId ?? "none", 44)}`
      ] : []),
      ...(identity.active || identity.stage ? [
        "",
        "SIGNAL CHORUS LIVING TISSUE",
        `Identity: ${identity.active ? "READABLE / LIVING" : "waiting"} | ${this.shorten(identity.stage ?? "none", 31)}`,
        `Lobes:${identity.lobeCount ?? 0} Filaments:${identity.filamentCount ?? 0} Trunks:${identity.combwardTrunkCount ?? 0} Motes:${identity.moteCount ?? 0}`,
        `Combward reinforced:${identity.combwardDirectionReinforced ? "yes" : "no"} | Route/input/target: none`
      ] : []),
      "",
      "PLAYER / CAMERA / ERRORS",
      `Pos ${this.formatVector(k.position)} | Speed ${this.formatValue(k.speed)}`,
      `Move ref:${k.movementReference ?? "camera_relative_free_3d"} | LS up:${k.stickForwardMeaning ?? "camera_forward"}`,
      `Boundary:${movementBoundary.mode ?? "world_origin_ellipsoid"} region:${movementBoundary.regionId ?? "shared_first_slice"} owner:${movementBoundary.owner ?? "PlayerMovementController"}`,
      `Boundary center:${this.formatVector(movementBoundary.center)} radii:${this.formatVector(movementBoundary.radii)} d:${this.formatValue(movementBoundary.normalizedDistance)} pressure:${this.formatValue(movementBoundary.pressure)}`,
      `Core body:${core.active ? "AUTHORED" : "waiting"} owner:${core.owner ?? "none"} fins:${core.authoredProxyParts?.fins ?? 0} veils:${core.authoredProxyParts?.trailingVeils ?? 0}`,
      `Growth anatomy petals:${core.authoredProxyParts?.growthPetals ?? 0} plates:${core.authoredProxyParts?.scarPlates ?? 0} nodes:${core.authoredProxyParts?.connectionNodes ?? 0}`,
      `Fluid slip:${this.formatValue(core.fluidSlip)} bank:${this.formatValue(core.bank)} rings:${core.objectDefiningRings ? "CHECK" : "transient-only"}`,
      `Forward Y:${this.formatValue(k.cameraForwardVerticalContribution)} explicit lift:${this.formatValue(k.verticalInput)} controls:RB/LB+DPad+C/Z`,
      `Cam yaw:${this.formatValue(camera.yaw)} pitch:${this.formatValue(camera.pitch)} dist:${this.formatValue(camera.distance)}`,
      `Occlusion ${this.formatValue(camera.occlusionIntensity)} → ${this.shorten(camera.occludedObjectId ?? "none", 30)}`,
      `Nonfatal errors: ${errors.length}${latestError ? ` | ${this.shorten(`${latestError.id}:${latestError.message}`, 39)}` : ""}`,
      "",
      `SNAPSHOT ${this.shorten(d.screenshotCode, 57)}`,
      "F1 trace | F2 system debug | F3 clean | Back cycles"
    ].join("\n");
  }

  renderInputTelemetry() {
    if (!this.inputEl) return;
    const telemetry = this.frameState.inputTelemetry ?? {};
    const input = this.frameState.input ?? {};
    const source = this.frameState.inputSource ?? {};
    const now = this.frameState.runtimeSeconds ?? 0;
    const physical = telemetry.activePhysical?.length ? telemetry.activePhysical.join(" · ") : "—";
    const currentActions = telemetry.activeActions ?? [];

    if (currentActions.length) {
      this.lastTraceActionText = currentActions.join(" · ");
      this.lastTraceActionAt = now;
    }

    const actionAge = Math.max(0, now - this.lastTraceActionAt);
    const heldRecentAction = currentActions.length
      ? this.lastTraceActionText
      : actionAge <= this.traceActionHoldSeconds
        ? `${this.lastTraceActionText}  [${actionAge.toFixed(1)}s ago]`
        : "—";

    const recent = (telemetry.recentEvents ?? []).slice(0, 5);
    const add = (text, style = {}) => {
      const line = document.createElement("div");
      line.textContent = text;
      Object.assign(line.style, style);
      this.inputEl.appendChild(line);
    };

    this.inputEl.replaceChildren();
    add("INPUT LIVE // PLAYTEST TRACE", {
      fontSize: "clamp(9px, 0.68vw, 11px)", letterSpacing: "0.12em", opacity: "0.78", marginBottom: "5px"
    });
    add(`PHYSICAL  ${this.shorten(physical, 92)}`, {
      fontSize: "clamp(13px, 1.05vw, 16px)", fontWeight: "700", lineHeight: "1.22", marginBottom: "6px"
    });
    add(`ACTION    ${this.shorten(heldRecentAction, 104)}`, {
      fontSize: "clamp(14px, 1.18vw, 18px)", fontWeight: "800", lineHeight: "1.18", marginBottom: "8px"
    });
    add(`PULSE     ${String(input.pulseCommitment ?? "idle").toUpperCase()} · ${Number(input.pulseHoldSeconds ?? 0).toFixed(2)}s · ${Math.round((input.pulseCharge01 ?? input.pulseReleaseCharge01 ?? 0) * 100)}% · ${input.pulseReleaseKind ?? "none"}`, {
      fontSize: "clamp(11px, 0.86vw, 13px)", opacity: "0.90"
    });
    add(`TRIGGERS  RT ${Number(source.absorbTriggerValue ?? 0).toFixed(2)} ${input.absorbHeld ? "ABSORB" : "—"}  ·  LT ${Number(source.stabilizeTriggerValue ?? 0).toFixed(2)} ${input.stabilizeHeld ? "STABILIZE" : "—"}`, {
      fontSize: "clamp(11px, 0.86vw, 13px)", opacity: "0.90", marginBottom: "7px"
    });
    add(`Context: ${telemetry.context ?? input.primaryActionContext ?? "world"} → ${telemetry.expectedAction ?? source.expectedAction ?? "none"}`, {
      fontSize: "clamp(9px, 0.72vw, 11px)", opacity: "0.72", marginBottom: "7px"
    });
    add("RECENT INPUT", { fontSize: "clamp(9px, 0.68vw, 10px)", letterSpacing: "0.10em", opacity: "0.68" });
    if (recent.length) {
      for (const event of recent) {
        add(`${Number(event.ageSeconds ?? 0).toFixed(1)}s  ${event.text}`, { fontSize: "clamp(9px, 0.72vw, 11px)", opacity: "0.78" });
      }
    } else {
      add("— no recent input event", { fontSize: "clamp(9px, 0.72vw, 11px)", opacity: "0.62" });
    }
  }

  inputTelemetryText() {
    // Text fallback retained for static diagnostics/tests; F1 renders the styled trace above.
    const telemetry = this.frameState.inputTelemetry ?? {};
    const input = this.frameState.input ?? {};
    return [
      "INPUT LIVE // PLAYTEST TRACE",
      `PHYSICAL: ${(telemetry.activePhysical ?? []).join(" · ") || "—"}`,
      `ACTION: ${(telemetry.activeActions ?? []).join(" · ") || this.lastTraceActionText || "—"}`,
      `Pulse: ${input.pulseCommitment ?? "idle"} ${Number(input.pulseHoldSeconds ?? 0).toFixed(2)}s ${Math.round((input.pulseCharge01 ?? input.pulseReleaseCharge01 ?? 0) * 100)}%`,
      "Hot-button reference: Status Page → Controls"
    ].join("\n");
  }

  morphStatusLine(morph) {
    if (morph.completed) {
      return `Morph: complete → ${this.labelCell(morph.destinationCell)} ${Math.round((morph.progress ?? 0) * 100)}%`;
    }
    return `Morph: ${morph.phase ?? "none"} ${Math.round((morph.progress ?? 0) * 100)}% Ready:${morph.triggerReady ? "yes" : "no"}`;
  }

  chainStatusLine() {
    const activeCellId = this.frameState.activeCellId;
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    const surfaceWake = this.frameState.surfaceWakeLayeredInteraction ?? {};
    if (activeCellId === "CELL_MEMBRANE_NURSERY_001" && surfaceWake.active && !surfaceWake.completed) return "Chain: Surface Wake / layered listening";
    if (activeCellId === "CELL_MEMBRANE_NURSERY_001" && surfaceWake.completed) return "Chain: Surface Wake language learned / safe seed readable";
    if (activeCellId === "CELL_BLOOM_RESIDUE_FORK_001" && this.isBloomEffectivelyStable(bloomLoop)) {
      return "Chain: four-cell stable / lock candidate";
    }
    if (activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") return "Chain: inside Bloom Residue Fork";
    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001" && this.frameState.signalChorusLayeredInteraction?.active) return "Chain: Signal Chorus / layered resonance";
    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001" && this.frameState.signalChorusNextRoutePressure?.active) return "Chain: Signal Chorus / combward pressure readable";
    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001" && this.frameState.signalChorusReturnState?.active) return "Chain: Signal Chorus return reading held";
    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001") return "Chain: tuning Signal Chorus";
    if (activeCellId === "CELL_SCAR_FLOW_FOLD_001" && this.frameState.guideThresholdLayeredInteraction?.active) return "Chain: Guide Threshold / movement-led traversal";
    if (activeCellId === "CELL_SCAR_FLOW_FOLD_001") return "Chain: stabilizing Scar-Flow";
    return "Chain: awakening in Membrane Nursery";
  }

  activeNextAction() {
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    const bloomArrival = this.frameState.bloomResidueArrival ?? {};
    const signalLoop = this.frameState.signalChorusInteraction ?? {};
    const signalArrival = this.frameState.signalChorusArrival ?? {};
    const scarLoop = this.frameState.scarFlowInteraction ?? {};
    const guideThreshold = this.frameState.guideThresholdLayeredInteraction ?? {};
    const scarArrival = this.frameState.scarFlowArrival ?? {};
    const morph = selectCurrentMorphState(this.frameState);
    const signalReturn = this.frameState.signalChorusReturnState ?? {};
    const nextRoutePressure = this.frameState.signalChorusNextRoutePressure ?? {};
    const layeredInteraction = this.frameState.signalChorusLayeredInteraction ?? {};
    const surfaceWake = this.frameState.surfaceWakeLayeredInteraction ?? {};

    if (surfaceWake.active && !surfaceWake.completed) return surfaceWake.nextAction;
    if (guideThreshold.active) return guideThreshold.nextAction;
    if (layeredInteraction.active) return layeredInteraction.nextAction;
    if (nextRoutePressure.active) return nextRoutePressure.nextAction;
    if (signalReturn.active) return signalReturn.nextAction;
    if (bloomLoop.active) return bloomLoop.preparedForNextBranch ? "four-cell chain stable" : bloomLoop.nextAction;
    if (bloomArrival.active) return bloomArrival.nextAction;
    if (signalLoop.active) return signalLoop.nextAction;
    if (signalArrival.active) return signalArrival.nextAction;
    if (scarLoop.active) return scarLoop.nextAction;
    if (scarArrival.active) return scarArrival.nextAction;
    return morph.nextAction ?? "none";
  }

  activeLoopCompactLines() {
    const surfaceWake = this.frameState.surfaceWakeLayeredInteraction ?? {};
    const guideThreshold = this.frameState.guideThresholdLayeredInteraction ?? {};
    const layeredInteraction = this.frameState.signalChorusLayeredInteraction ?? {};
    const nextRoutePressure = this.frameState.signalChorusNextRoutePressure ?? {};
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    const bloomArrival = this.frameState.bloomResidueArrival ?? {};
    const signalLoop = this.frameState.signalChorusInteraction ?? {};
    const signalArrival = this.frameState.signalChorusArrival ?? {};
    const scarLoop = this.frameState.scarFlowInteraction ?? {};
    const scarArrival = this.frameState.scarFlowArrival ?? {};

    if (surfaceWake.active) {
      return [
        `Surface Wake: ${surfaceWake.stage ?? "waiting"} ${Math.round((surfaceWake.progress ?? 0) * 100)}%`,
        `Approach ${this.formatValue(surfaceWake.approachHold)} · Hold ${this.formatValue(surfaceWake.resonanceHold)} · Settle ${this.formatValue(surfaceWake.settleProgress)}`,
        `Safe seed: ${surfaceWake.safeSeedReadable ? "readable" : "held until lesson completes"}`,
        `Next: ${this.shorten(surfaceWake.nextAction ?? "read the listening fold", 42)}`
      ];
    }


    if (guideThreshold.active) {
      return [
        `Guide Threshold: ${guideThreshold.stage ?? "waiting"} ${Math.round((guideThreshold.progress ?? 0) * 100)}%`,
        `Align ${this.formatValue(guideThreshold.alignmentProgress)} · Path ${this.formatValue(guideThreshold.pathProgress)} · Corridor ${this.formatValue(guideThreshold.corridorDistance)}`,
        `Traverse ${this.formatValue(guideThreshold.traversalProgress)} · Hold ${this.formatValue(guideThreshold.resonanceHold)} · Local dot ${this.formatValue(guideThreshold.localPathDirectionDot)}`,
        `Response ${this.formatValue(guideThreshold.tissueResponse)} · Settle ${this.formatValue(guideThreshold.settleProgress)} · Target none`,
        `Next: ${this.shorten(guideThreshold.nextAction ?? "move with the current", 42)}`
      ];
    }

    if (layeredInteraction.active) {
      return [
        `Layered Resonance: ${layeredInteraction.stage ?? "waiting"} ${Math.round((layeredInteraction.progress ?? 0) * 100)}%`,
        `Cadence ${layeredInteraction.cadenceMatches ?? 0}/${layeredInteraction.requiredCadenceMatches ?? 2} · Hold ${this.formatValue(layeredInteraction.resonanceHold)} · Settle ${this.formatValue(layeredInteraction.settleProgress)}`,
        `Next: ${this.shorten(layeredInteraction.nextAction ?? "follow the tissue response", 42)}`
      ];
    }

    if (nextRoutePressure.active) {
      return [
        `Combward Pressure: ${nextRoutePressure.completed ? "readable" : "forming"} ${Math.round((nextRoutePressure.progress ?? 0) * 100)}%`,
        `Route active: no | Target: none | Input: none`,
        `Next: ${this.shorten(nextRoutePressure.nextAction ?? "hold the reading", 42)}`
      ];
    }

    if (bloomLoop.active) {
      const bloomStable = this.isBloomEffectivelyStable(bloomLoop);
      return [
        `Bloom Loop: ${bloomStable ? "stable / complete" : bloomLoop.stage} ${bloomStable ? 100 : Math.round((bloomLoop.progress ?? 0) * 100)}%`,
        `Focus: ${bloomLoop.currentFocus ?? "none"}`,
        `Memory:${this.formatValue(bloomLoop.residueMemory)} Bloom:${this.formatValue(bloomLoop.bloomCare)} Braid:${this.formatValue(bloomLoop.braidWarmth)}`,
        `Warning:${this.formatValue(bloomLoop.warningRespect)} Risk:${this.formatValue(bloomLoop.overgrowthRisk)}`
      ];
    }

    if (bloomArrival.active) return [`Bloom Arrival: ${bloomArrival.focusObjectId ?? "none"}`, `Next: ${this.shorten(bloomArrival.nextAction ?? "none", 42)}`];
    if (signalLoop.active) return [`Signal Loop: ${signalLoop.stage} ${Math.round((signalLoop.progress ?? 0) * 100)}%`, `Focus: ${signalLoop.currentFocus ?? "none"}`, `Bridge:${this.formatValue(signalLoop.bridgeWarmth)} Harmony:${this.formatValue(signalLoop.harmony)}`];
    if (signalArrival.active) return [`Signal Arrival: ${signalArrival.focusObjectId ?? "none"}`, `Next: ${this.shorten(signalArrival.nextAction ?? "none", 42)}`];
    if (scarLoop.active) return [`Scar Loop: ${scarLoop.stage} ${Math.round((scarLoop.progress ?? 0) * 100)}%`, `Focus: ${scarLoop.currentFocus ?? "none"}`];
    if (scarArrival.active) return [`Scar Arrival: ${scarArrival.focusObjectId ?? "none"}`, `Next: ${this.shorten(scarArrival.nextAction ?? "none", 42)}`];
    return ["Loop: awaiting first seed absorb"];
  }

  activeLoopFullLines() {
    const compact = this.activeLoopCompactLines();
    return [
      ...compact,
      `Lock Status: ${this.frameState.lockState?.status ?? "none"}`,
      `Next If Passes: ${this.frameState.lockState?.nextIfPasses ?? "none"}`
    ];
  }


  blueprintRoleLine() {
    const role = this.activeBlueprintRole();
    return `Blueprint Role: ${role.blueprintRole} / ${role.roleType}`;
  }

  blueprintWarningLine() {
    const translation = this.frameState.blueprintTranslation ?? {};
    return `Translation Rule: ${this.shorten(translation.legacyRuntimeWarning ?? translation.translationRule ?? "no legacy runtime revival", 72)}`;
  }

  activeBlueprintRole() {
    const translation = this.frameState.blueprintTranslation ?? {};
    const mappings = translation.localCellToBlueprintRole ?? [];
    const activeCellId = this.frameState.activeCellId;
    return mappings.find((entry) => entry.cellId === activeCellId) ?? {
      blueprintRole: "unmapped",
      roleType: "not translated",
      cellId: activeCellId
    };
  }

  routePlanningLine() {
    const grave = this.frameState.graveRouteRuntimePlanning ?? {};
    if (grave.active) {
      return `Next Route: ${grave.selectedRouteLabel ?? "Grave route"} → ${grave.plannedCellId ?? "planned cell"} (${grave.plannedCellStatus ?? "planned"})`;
    }
    const plan = this.frameState.firstRouteChoicePlanning ?? {};
    if (!plan.active) return "First Route: planning not loaded";
    return `First Route: ${plan.recommendedRouteLabel ?? "none"} (${plan.routeStatus ?? "planned"})`;
  }

  placeholderTriageLine() {
    const triage = this.frameState.placeholderVisualTriage ?? {};
    if (!triage.active) return "Visual Triage: not loaded";
    const p0Open = triage.visualLockFirst?.filter((entry) => entry.priority === "P0").length ?? 0;
    const p1 = triage.visualLockFirst?.filter((entry) => entry.priority === "P1").length ?? 0;
    const p0Locked = triage.p0LockedCount ?? 0;
    const protoGroups = triage.prototypeAcceptedGroups?.length ?? 0;
    return `Visual Triage: P0 locked:${p0Locked} open:${p0Open} P1:${p1} · ${protoGroups} proto groups`;
  }

  firstMinuteLockLine() {
    const cohesion = this.frameState.firstSliceCohesion ?? {};
    const missing = (cohesion.missingLockCriteria ?? []).slice(0, 2).join(" + ");
    return `First Minute: ${this.isFirstMinuteComplete() ? "Living Core slice locked" : `${Math.round((this.frameState.openingFlow?.firstMinuteProgress ?? 0) * 100)}% · ${missing || "required chain pending"}`}`;
  }

  optionalForkLine() {
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    if (this.frameState.activeCellId !== "CELL_BLOOM_RESIDUE_FORK_001") return "Beyond-Minute Fork: optional / not reached";
    return this.isBloomEffectivelyStable(bloomLoop)
      ? "Beyond-Minute Fork: optional stable / complete"
      : "Beyond-Minute Fork: optional active";
  }

  isFirstMinuteComplete() {
    return Boolean(this.frameState.firstSliceCohesion?.sliceLockReady);
  }

  isBloomEffectivelyStable(bloomLoop) {
    return Boolean(
      bloomLoop?.preparedForNextBranch ||
      (bloomLoop?.stage === "fork_stable" && (bloomLoop?.progress ?? 0) >= 0.95)
    );
  }

  placeholderSummary(placeholders) {
    const triage = this.frameState.placeholderVisualTriage ?? {};
    const expired = placeholders.expired ?? 0;
    const p0Open = triage.visualLockFirst?.filter((entry) => entry.priority === "P0").length ?? 0;
    const p1 = triage.visualLockFirst?.filter((entry) => entry.priority === "P1").length ?? 0;
    const p0Locked = triage.p0LockedCount ?? 0;
    if (triage.active) return `${expired} expired · P0 locked:${p0Locked} open:${p0Open} P1:${p1}`;
    const visualLock = placeholders.replacementRequiredBeforeVisualLock ?? 0;
    const prototypeOk = placeholders.expiredAcceptedForPrototype ?? 0;
    if (!expired) return "ok";
    return `${expired} expired (${visualLock} visual-lock / ${prototypeOk} proto-ok)`;
  }

  labelCell(cellId) {
    if (cellId === "CELL_BLOOM_RESIDUE_FORK_001") return "Bloom Residue Fork";
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001") return "Signal Chorus Nerve";
    if (cellId === "CELL_SCAR_FLOW_FOLD_001") return "Scar-Flow Fold";
    if (cellId === "CELL_MEMBRANE_NURSERY_001") return "Membrane Nursery";
    return cellId ?? "unknown cell";
  }

  formatSelectedObject(selected) {
    return [
      `Object: ${selected.objectId ?? "unknown"}`,
      `Visual Recipe: ${selected.visualRecipe ?? "none"}`,
      `Replacement: ${selected.replacementRecipe ?? "none"}`,
      `Host: ${selected.hostSource ?? "none"}`,
      `Anatomy: ${selected.anatomySource ?? "none"}`,
      `Chemistry: ${(selected.chemistry ?? []).join(" + ")}`,
      `Matter State: ${selected.matterState ?? "none"}`,
      `Function: ${selected.function ?? "none"}`,
      `Silhouette: ${selected.silhouette ?? "none"}`
    ].join("\n");
  }

  formatVector(v) {
    if (!v) return "0.00, 0.00, 0.00";
    return `${this.formatValue(v.x)}, ${this.formatValue(v.y)}, ${this.formatValue(v.z)}`;
  }

  formatValue(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return safeValue.toFixed(2);
  }

  shorten(value, max) {
    const text = String(value ?? "");
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }
}
