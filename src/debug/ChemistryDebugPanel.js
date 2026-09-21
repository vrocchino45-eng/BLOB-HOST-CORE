import { selectCurrentMorphState } from "../morph/MorphStateSelector.js";
import { activeFlowMetricLines, buildRuntimeDiagnosticSummary } from "./RuntimeDiagnosticSummary.js";

export class ChemistryDebugPanel {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.el = null;
  }

  init() {
    this.el = document.createElement("div");
    this.el.id = "chemistry-debug-panel";

    Object.assign(this.el.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      padding: "10px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      color: "#fff1dc",
      background: "rgba(10, 7, 4, 0.70)",
      border: "1px solid rgba(255, 210, 150, 0.22)",
      borderRadius: "10px",
      pointerEvents: "none",
      whiteSpace: "pre",
      boxSizing: "border-box",
      overflow: "hidden",
      zIndex: "10"
    });

    document.body.appendChild(this.el);
  }

  update() {
    if (!this.el) return;

    const mode = this.frameState.debugDisplay?.mode ?? "compact";
    this.applyMode(mode);

    if (mode === "hidden") {
      this.el.textContent = "";
      return;
    }

    this.el.textContent = mode === "full" ? this.fullText() : this.compactText();
  }

  applyMode(mode) {
    if (mode === "hidden") {
      this.el.style.display = "none";
      return;
    }

    this.el.style.display = "block";

    if (mode === "full") {
      Object.assign(this.el.style, {
        width: "min(350px, 28vw)",
        maxHeight: "calc(100dvh - 20px)",
        padding: "8px",
        fontSize: "clamp(8px, 0.72vw, 10px)",
        lineHeight: "1.22",
        background: "rgba(10, 7, 4, 0.84)",
        overflow: "hidden"
      });
      return;
    }

    Object.assign(this.el.style, {
      width: "250px",
      maxHeight: "42vh",
      fontSize: "11px",
      lineHeight: "1.32",
      background: "rgba(10, 7, 4, 0.54)",
      overflow: "hidden"
    });
  }

  compactText() {
    const p = this.frameState.playerComposition ?? {};
    const schema = this.frameState.schemaValidationReport ?? {};
    const placeholders = this.frameState.placeholderStatus ?? {};
    const morph = selectCurrentMorphState(this.frameState);
    const camera = this.frameState.cameraControl ?? {};
    const cinematic = this.frameState.awakeningCinematic ?? {};
    const comfort = this.frameState.controllerOnboarding ?? {};
    const core = this.frameState.coreEmbodiment ?? {};
    const coreGrowth = this.frameState.coreGrowth ?? {};
    const graveMemoryRoute = this.frameState.graveMemoryRoute ?? {};
    const vascularRhythmRoute = this.frameState.vascularRhythmRoute ?? {};
    const siltPressureRoute = this.frameState.siltPressureRoute ?? {};
    const orbiter = this.frameState.orbiterState ?? {};

    return [
      "Host Chemistry",
      `Cell: ${this.frameState.activeCellId}`,
      `Mode: ${this.frameState.currentMode?.id ?? "pending"} | Region: ${this.frameState.currentMode?.regionDisplayName ?? "unmapped"}`,
      `Schema: ${schema.status ?? "pending"} | Placeholders: ${this.placeholderSummary(placeholders)}`,
      `Form ${this.formatValue(p.form)}  Seed ${this.formatValue(p.seed)}`,
      `Scar ${this.formatValue(p.scar)}  Signal ${this.formatValue(p.signal)}`,
      "",
      "Chain State",
      this.morphSummary(morph),
      this.chainStableLine(),
      this.blueprintRoleLine(),
      this.routePlanningLine(),
      this.placeholderTriageLine(),
      this.firstMinuteLockLine(),
      this.optionalForkLine(),
      `Cine: ${this.shorten(cinematic.beatLabel ?? cinematic.beat ?? "none", 36)}`,
      "",
      ...this.activeChemistryLines(),
      "",
      "Controller Comfort",
      `${this.shorten(comfort.statusLine ?? "controller tuning ready", 38)}`,
      `Stage: ${comfort.comfortStage ?? "none"}`,
      `Move: ${this.frameState.playerKinematics?.movementReference ?? "camera_relative_free_3d"}`,
      `Body: ${coreGrowth.displayStage ?? (core.active ? "authored Seed Core" : "waiting")} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% | rings:${core.objectDefiningRings ? "CHECK" : "transient-only"}`,
      `Bias: ${coreGrowth.biasLabel ?? "balanced"} | class:${coreGrowth.permanentClass ? "LOCKED" : "none"}`,
      ...(vascularRhythmRoute.active ? [
        `Vascular:${vascularRhythmRoute.lockedCadenceReads ?? 0}/${vascularRhythmRoute.requiredCadenceReads ?? 3} sync:${Math.round((vascularRhythmRoute.synchronization ?? 0) * 100)}% integrity:${Math.round((vascularRhythmRoute.circulationIntegrity ?? 0) * 100)}%`,
        `Flow:${vascularRhythmRoute.currentDirection ?? "inward"} turbulence:${Math.round((vascularRhythmRoute.turbulence ?? 0) * 100)}% return:${vascularRhythmRoute.returnFoldReady ? "ready" : "held"}`,
        `Stabilize:${vascularRhythmRoute.stabilizationInRange ? "in-range" : "move-inward"} d:${this.formatValue(vascularRhythmRoute.pathDistance)} r:${this.formatValue(vascularRhythmRoute.stabilizationRange)} safe-extra-pulses:${vascularRhythmRoute.postReadPulseIgnoredCount ?? 0}`
      ] : []),
      ...(siltPressureRoute.active ? [
        `Silt:${siltPressureRoute.pressureRead ? "read" : "unread"} ribs:${siltPressureRoute.ribsReleased ? "open" : "closed"} safe:${siltPressureRoute.safeMatterAbsorbed ? "taken" : "waiting"} depth:${Math.round((siltPressureRoute.maxDepthProgress ?? 0) * 100)}%`,
        `Compression:${Math.round((siltPressureRoute.compression ?? 0) * 100)}% failure:${siltPressureRoute.compressionFailure ? "ACTIVE" : "no"} recovered:${siltPressureRoute.failureRecovered ? "yes" : "no"} return:${siltPressureRoute.returnFoldReady ? "ready" : "held"}`,
        `Ranges:path ${this.formatValue(siltPressureRoute.pathDistance)} safe ${this.formatValue(siltPressureRoute.safePacketDistance)} dense ${this.formatValue(siltPressureRoute.nearestDenseDistance)} LT:${siltPressureRoute.stabilizing ? "HELD" : "up"} RT:${siltPressureRoute.absorbHeld ? "HELD" : "up"}`
      ] : []),
      "",
      "Camera",
      `Look: RS / Mouse / IJKL`,
      `Core inspect / authored focus: Y / F (V alias) | Recenter: R3 / R`,
      `Mode ${camera.mode ?? "orbit"} Yaw ${this.formatValue(camera.yaw)} Pitch ${this.formatValue(camera.pitch)} FOV ${this.formatValue(camera.fieldOfView)}`
    ].join("\n");
  }

  fullText() {
    const d = buildRuntimeDiagnosticSummary(this.frameState);
    const c = this.frameState.chemistry ?? {};
    const p = this.frameState.playerComposition ?? {};
    const f = this.frameState.physicalFeel ?? {};
    const b = this.frameState.bondState ?? {};
    const morph = d.morph ?? selectCurrentMorphState(this.frameState);
    const schema = this.frameState.schemaValidationReport ?? {};
    const placeholders = this.frameState.placeholderStatus ?? {};
    const camera = this.frameState.cameraControl ?? {};
    const errors = this.frameState.nonFatalSystemErrors ?? [];
    const audit = d.audit ?? {};
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
    const currentMode = this.frameState.currentMode ?? {};
    const objective = this.frameState.objectiveState ?? {};
    const gate = this.frameState.gateState ?? {};
    const statusPage = this.frameState.statusPage ?? {};
    const core = this.frameState.coreEmbodiment ?? {};
    const coreGrowth = this.frameState.coreGrowth ?? {};
    const graveMemoryRoute = this.frameState.graveMemoryRoute ?? {};
    const vascularRhythmRoute = this.frameState.vascularRhythmRoute ?? {};
    const siltPressureRoute = this.frameState.siltPressureRoute ?? {};
    const routeRuntimeContract = this.frameState.act1RouteRuntimeContract ?? {};
    const activeRouteContract = this.frameState.act1RouteContract ?? {};
    const routeHistory = this.frameState.act1RouteHistory ?? {};
    const orbiter = this.frameState.orbiterState ?? {};

    return [
      "SCREENSHOT DIAGNOSIS",
      `Health: ${d.health}`,
      `Owner: ${d.owner}`,
      `Stage: ${this.shorten(d.stage, 36)} | ${Math.round(d.progress * 100)}%`,
      `Ready:${d.ready ? "yes" : "no"} Complete:${d.complete ? "yes" : "no"}`,
      `Focus: ${this.shorten(d.expectedTarget, 42)}`,
      `Actual: ${this.shorten(d.actualTarget, 41)}`,
      `Alignment: ${d.targetAligned ? "OK" : "MISMATCH"}`,
      `BLOCKER: ${this.shorten(d.blocker, 43)}`,
      `NEXT: ${this.shorten(d.nextAction, 47)}`,
      "",
      "FIRST SLICE OWNERSHIP",
      `Region:${currentMode.regionDisplayName ?? currentMode.regionId ?? "unmapped"}`,
      `Mode:${currentMode.id ?? "none"} owner:${this.shorten(currentMode.sceneBehaviorOwner ?? ownership.modeOwner ?? "none", 27)}`,
      `Objective:${this.shorten(objective.id ?? "none", 28)} ${Math.round((objective.progress ?? 0) * 100)}%`,
      `Gate:${this.shorten(gate.id ?? "none", 27)} ${gate.status ?? "pending"}`,
      `Gate readable:${gate.readable ? "yes" : "no"} crossable:${gate.crossable ? "YES" : "no"} blocked:${this.shorten(gate.departureBlockedBy ?? "none", 29)}`,
      `Hub investigate routes:${hubInvestigation.routeReadCount ?? 0}/${hubInvestigation.routeCount ?? 3} memory:${hubInvestigation.memoryRead ? "read" : "pending"} center:${hubInvestigation.returnedToCenter ? "yes" : "no"}`,
      `Core practice ${cohesion.emergingIdentity ?? "forming"} strength R:${this.formatValue(cohesion.practice?.reading)} B:${this.formatValue(cohesion.practice?.binding)} S:${this.formatValue(cohesion.practice?.stabilizing)}`,
      `Practice balance R:${this.formatValue(cohesion.practiceBalance?.reading)} B:${this.formatValue(cohesion.practiceBalance?.binding)} S:${this.formatValue(cohesion.practiceBalance?.stabilizing)} normalized:${cohesion.practiceBalanceNormalized ? "yes" : "no"}`,
      `Retained lessons:${cohesion.retainedLessonCount ?? 0}/3 progress:${Math.round((cohesion.overallProgress ?? 0) * 100)}% ownership:${cohesion.triggerOwnershipPreserved ? "preserved" : "CHECK"}`,
      `Hub proxy:${currentMode.runtimeProxy ?? "none"} pending:${currentMode.fullRegionPending ? "yes" : "no"}`,
      `Hub foundation:${hub.completed ? "complete" : (hub.active ? "forming" : "inactive")} routes:${hub.routeCount ?? 0} active:${hub.activeRouteCount ?? 0} dormant:${hub.dormantRouteCount ?? 0}`,
      `Route contracts: mounted ${routeRuntimeContract.mountedDestinationCount ?? 0}/2 awake:${routeRuntimeContract.awakeRouteCount ?? 0}/2 pending:${routeRuntimeContract.gameplayPendingCount ?? 0} crossable:${routeRuntimeContract.crossableRouteCount ?? 0}`,
      `Route mount:${activeRouteContract.active ? activeRouteContract.regionId : "inactive"} ${activeRouteContract.contractStatus ?? "prepared_inactive"} history:${Object.keys(routeHistory.routeStates ?? {}).length}/3`,
      `Status:${statusPage.open ? "OPEN" : "closed"} tab:${statusPage.activeTab ?? "Core"} hub-use:${statusPage.firstHubUseComplete ? "done" : "pending"}`,
      `Hub-use commit:${statusPage.firstHubUseCommittedOnOpen ? "OPEN_EVENT" : "none"} frame:${statusPage.firstHubUseCommitFrame ?? "-"} mode:${statusPage.firstHubUseCommitMode ?? "none"}`,
      `Hub-use input:#${statusPage.lastToggleEventId ?? 0} ${statusPage.lastToggleSource ?? "none"} intent:${statusPage.hubSelfReadingIntentLatched ? "yes" : "no"} objective:${statusPage.objectiveConsumedCompletion ? "yes" : "no"} gate:${statusPage.gateConsumedCompletion ? "yes" : "no"}`,
      `Grave preview:${graveMemoryRoute.active ? "ACTIVE" : (graveMemoryRoute.completed ? "retained" : "inactive")} ${Math.round((graveMemoryRoute.progress ?? 0) * 100)}% read:${graveMemoryRoute.readCount ?? 0}/${graveMemoryRoute.requiredReadCount ?? 4} protected:${graveMemoryRoute.protectedObjectsUntouched !== false ? "intact" : "CHECK"}`,
      `Grave visual:${graveMemoryRoute.visualConsequencePhase ?? "quiet_read"} recoil:${this.formatValue(graveMemoryRoute.recoilVisualStrength)} recover:${this.formatValue(graveMemoryRoute.stabilizationVisualStrength)} transfer:${this.formatValue(graveMemoryRoute.transferVisualStrength)}`,
      `Grave landmarks:${graveMemoryRoute.landmarkVisualLockComplete ? "LOCKED" : "CHECK"} ${graveMemoryRoute.landmarkVisualCount ?? 0}/4 expired:${graveMemoryRoute.expiredGraveLandmarkPlaceholdersActive ?? 0} owner:${graveMemoryRoute.landmarkMotionOwner ?? "none"}`,
      `Vascular rhythm:${vascularRhythmRoute.active ? "ACTIVE" : (vascularRhythmRoute.completed ? "retained" : "inactive")} reads:${vascularRhythmRoute.lockedCadenceReads ?? 0}/${vascularRhythmRoute.requiredCadenceReads ?? 3} sync:${this.formatValue(vascularRhythmRoute.synchronization)} integrity:${this.formatValue(vascularRhythmRoute.circulationIntegrity)}`,
      `Vascular recovery:turbulence ${this.formatValue(vascularRhythmRoute.turbulence)} risks:${vascularRhythmRoute.desynchronizationCount ?? 0} recovered:${vascularRhythmRoute.recoveryCount ?? 0} return:${vascularRhythmRoute.returnFoldReady ? "ready" : "held"}`,
      `Vascular stabilize:${vascularRhythmRoute.stabilizationInRange ? "IN RANGE" : "move inward"} d:${this.formatValue(vascularRhythmRoute.pathDistance)} r:${this.formatValue(vascularRhythmRoute.stabilizationRange)} LT:${vascularRhythmRoute.stabilizing ? "HELD" : "up"} safe-extra-pulses:${vascularRhythmRoute.postReadPulseIgnoredCount ?? 0}`,
      `Silt pressure:${siltPressureRoute.active ? "ACTIVE" : (siltPressureRoute.completed ? "retained" : "inactive")} read:${siltPressureRoute.pressureRead ? "YES" : "no"} brace:${this.formatValue(siltPressureRoute.braceSeconds)} ribs:${siltPressureRoute.ribsReleased ? "OPEN" : "closed"} depth:${this.formatValue(siltPressureRoute.maxDepthProgress)}`,
      `Silt appetite:safe ${siltPressureRoute.safeMatterAbsorbed ? "TAKEN" : "waiting"} safe-d:${this.formatValue(siltPressureRoute.safePacketDistance)} dense-d:${this.formatValue(siltPressureRoute.nearestDenseDistance)} packed:${siltPressureRoute.denseMatterLeftIntact !== false ? "intact" : "CHECK"}`,
      `Silt recovery:compression ${this.formatValue(siltPressureRoute.compression)} failure:${siltPressureRoute.compressionFailure ? "ACTIVE" : "no"} risks:${siltPressureRoute.failureCount ?? 0} recovered:${siltPressureRoute.failureRecovered ? "YES" : "no"} LT:${siltPressureRoute.stabilizing ? "HELD" : "up"} RT:${siltPressureRoute.absorbHeld ? "HELD" : "up"} return:${siltPressureRoute.returnFoldReady ? "ready" : "held"}`,
      `Core pearl:${core.visibleGraveMemoryPearl ? "VISIBLE" : "hidden"} ligament:${core.memoryImprintLigamentVisible ? "visible" : "hidden"} Hub echo:${hub.graveMemoryTerritoryEchoVisible ? "VISIBLE" : "hidden"}`,
      `Guide lane:${orbiter.silhouetteLane ?? "companion_lane"} gap:${this.formatValue(orbiter.guideDistance)} consequence-perch:${orbiter.visualConsequencePerchActive ? "yes" : "no"}`,
      `Consequence layers:${(hub.postRouteLayerHierarchy ?? []).join(" > ") || "inactive"}`,
      "",
      "LAST INPUT DELIVERY",
      `Pulse #${audit.eventId ?? 0} src:${this.shorten(audit.source ?? d.pulseSource, 29)}`,
      `Produced f${audit.producedAtFrame ?? -1} → consumed f${audit.consumedAtFrame ?? -1}`,
      `Consumer: ${this.shorten(audit.consumedBy ?? "none", 36)}`,
      `Target: ${this.shorten(audit.consumedTargetId ?? "none", 38)}`,
      `Result: ${this.shorten(audit.result ?? "none", 42)}`,
      "",
      "ACTIVE FLOW METRICS",
      ...activeFlowMetricLines(this.frameState, 44),
      ...(surfaceWake.active || surfaceWake.stage ? [
        `Surface Wake:${surfaceWake.active ? this.shorten(surfaceWake.stage ?? "active", 25) : "waiting"} ${Math.round((surfaceWake.progress ?? 0) * 100)}%`,
        `Approach:${this.formatValue(surfaceWake.approachHold)} hold:${this.formatValue(surfaceWake.resonanceHold)} response:${this.formatValue(surfaceWake.tissueResponse)} settle:${this.formatValue(surfaceWake.settleProgress)}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} opening:${grammar.introducedAtSurfaceWake ? "yes" : "no"}`,
        `Safe seed:${surfaceWake.safeSeedReadable ? "readable" : "held"} absorb:${surfaceWake.blocksSafeSeedAbsorb ? "blocked" : "unlocked"}`
      ] : []),
      ...(surfaceEcology.active ? [
        `Ecology:${surfaceEcology.phase ?? "inactive"} ${surfaceEcology.pass ?? "legacy"} embodiment:${surfaceEcology.visualEmbodiment ?? "none"}`,
        `Zones:${surfaceEcology.spatialZones?.length ?? 0} silhouettes:${surfaceEcology.silhouetteClasses?.length ?? 0} permanent-rings:${surfaceEcology.permanentResonanceEffects ? "CHECK" : "no"}`,
        `Vertical:${surfaceEcology.verticalTraversalActive ? "ACTIVE" : "flat"} layers:${surfaceEcology.verticalLayers?.length ?? 0} controls:${this.shorten(surfaceEcology.verticalControls ?? "none", 31)}`,
        `Noticed:${surfaceEcology.noticed ? "yes" : "no"} current:${surfaceEcology.currentPhase ?? "none"}`,
        `Care:${this.shorten(surfaceEcology.careState ?? "none", 27)} sense:${this.shorten(surfaceEcology.sensoryState ?? "none", 27)}`,
        `Action:${this.shorten(surfaceEcology.lastMeaningfulAction ?? "none", 31)} → ${this.shorten(surfaceEcology.lastWorldResponse ?? "none", 34)}`,
        `Seed:${surfaceEcology.seedPresented ? "presented" : "guarded"}/${surfaceEcology.seedAbsorbed ? "absorbed" : "intact"} seam:${surfaceEcology.seamReadable ? "readable" : "held"}`,
        `Departure:${surfaceEcology.departureExpression ?? "unexpressed"} owner:${this.shorten(surfaceEcology.triggerOwner ?? "none", 31)}`
      ] : []),
      ...(nurseryCircuit.active ? [
        `Circuit:${nurseryCircuit.status ?? "inactive"} packet:${this.shorten(nurseryCircuit.matterType ?? "none", 22)} ${Math.round((nurseryCircuit.packetProgress ?? 0) * 100)}%`,
        `Read:${nurseryCircuit.packetIdentified ? "yes" : "no"} purity:${Math.round((nurseryCircuit.packetPurity ?? 0) * 100)}% filter:${nurseryCircuit.stabilizingPacket ? "active" : "idle"} absorb:${nurseryCircuit.absorbReady ? "ready" : "no"}`,
        `Tender:${Math.round((nurseryCircuit.tenderIntegrity ?? 0) * 100)}% trust:${Math.round((nurseryCircuit.tenderTrust ?? 0) * 100)}% fed:${nurseryCircuit.tenderFedCount ?? 0} failures:${nurseryCircuit.failedCycleCount ?? 0}`,
        `Outcome:${this.shorten(nurseryCircuit.lastOutcome ?? "none", 29)} Fold:${nurseryCircuit.foldInvitation ? "invited" : "held"}`
      ] : []),
      `Growth:${coreGrowth.displayStage ?? "Seed Core"} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% target:${Math.round((coreGrowth.growthTarget ?? 0) * 100)}%`,
      `Bias:${coreGrowth.biasLabel ?? "balanced_first_binding"} ${this.formatValue(coreGrowth.chemistryBias)} reversible:${coreGrowth.biasReversible ? "yes" : "CHECK"} class:${coreGrowth.permanentClass ? "LOCKED" : "none"}`,
      `Cross-room Guide:${coreGrowth.guidePressureTested ? "tested" : "pending"} Hub:${coreGrowth.hubReflectionObserved ? "echoed" : "pending"} direct progression:${coreGrowth.directTriggerCompletion || coreGrowth.directObjectiveCompletion || coreGrowth.directGateMutation ? "CHECK" : "none"}`,
      ...(guideThreshold.active || guideThreshold.stage ? [
        `Guide Threshold:${guideThreshold.active ? this.shorten(guideThreshold.stage ?? "active", 24) : "waiting"} ${Math.round((guideThreshold.progress ?? 0) * 100)}%`,
        `Align:${this.formatValue(guideThreshold.alignmentProgress)} path:${this.formatValue(guideThreshold.pathProgress)} local-dot:${this.formatValue(guideThreshold.localPathDirectionDot)}`,
        `Corridor:${this.formatValue(guideThreshold.corridorDistance)}/${this.formatValue(guideThreshold.corridorRange)} inside:${guideThreshold.withinPathCorridor ? "yes" : "no"} assist:${guideThreshold.guidanceLevel ?? 0}`,
        `Hold:${this.formatValue(guideThreshold.resonanceHold)} traverse:${this.formatValue(guideThreshold.traversalProgress)} response:${this.formatValue(guideThreshold.tissueResponse)} settle:${this.formatValue(guideThreshold.settleProgress)} armed:${guideThreshold.settleReleaseArmed ? "yes" : "no"} arm:${guideThreshold.settleArmSource ?? "none"} latch:${guideThreshold.settleLatched ? "yes" : "no"} latchSrc:${guideThreshold.settleLatchSource ?? "none"} zone:${guideThreshold.settleZoneSource ?? "none"}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} movement-led:${grammar.movementLed ? "yes" : "no"}`
      ] : []),
      ...(layered.active || layered.stage ? [
        `Layered:${layered.active ? this.shorten(layered.stage ?? "active", 24) : "waiting"} ${Math.round((layered.progress ?? 0) * 100)}%`,
        `Cadence:${layered.cadenceMatches ?? 0}/${layered.requiredCadenceMatches ?? 2} gold:${layered.cadenceWindowOpen ? "yes" : "no"} miss:${layered.cadenceMisses ?? 0}`,
        `Hold:${this.formatValue(layered.resonanceHold)} response:${this.formatValue(layered.tissueResponse)} settle:${this.formatValue(layered.settleProgress)}`,
        `Grammar:${grammar.grammarStage ?? "unnoticed"} opening-ready:${grammar.reusableFromOpening ? "yes" : "no"}`
      ] : []),
      ...(hub.active || hub.stage ? [
        `Hub:${hub.active ? this.shorten(hub.stage ?? "active", 25) : "waiting"} ${Math.round((hub.progress ?? 0) * 100)}%`,
        `Anchor:${hub.centralAnchorReadable ? "yes" : "no"} layout:${hub.threeRouteLayoutReadable ? "yes" : "no"} memory:${hub.firstMemoryFragmentReadable ? "yes" : "no"}`,
        `Routes:${hub.routeCount ?? 0} active:${hub.activeRouteId ?? "none"} dormant:${hub.dormantRouteCount ?? 0}`,
        `Authority:${hub.spatialAuthorityPass ?? "legacy"} owner:${hub.singleCompositionOwner ? "ONE" : "CHECK"} visuals:${hub.investigationVisualAuthorityDelegated ? "delegated" : "CHECK"}`,
        `Camera:${hub.cameraMode ?? "inactive"} corridors:${hub.routeCorridorCount ?? 0} depth:${hub.depthLayerCount ?? 0} player:${hub.playerBodyFirstIdentity ? "body-first" : "CHECK"}`,
        `Lines:${hub.longConnectorLinesDisabled ? "off" : "CHECK"} rings:${hub.idleGlobalRingsDisabled ? "off" : "CHECK"}`,
        `Gate:${hub.activeRouteGateId ?? "none"} new-content:${hub.newRouteContentActivated ? "YES" : "no"}`
      ] : []),
      ...(inspection.available || inspection.active || inspection.status ? [
        `Tight cam:${inspection.active ? "ACTIVE" : (inspection.available ? "available" : "waiting")} mode:${inspection.mode ?? "orbit"}`,
        `Focus mode:${inspection.focusMode ?? "none"} id:${this.shorten(inspection.focusObjectId ?? "none", 23)} toggle:Y`,
        `Cam event:${this.shorten(inspection.lastEvent ?? "none", 31)} persistent:${inspection.persistentAcrossCells ? "yes" : "NO"}`,
        `Inspect corridor:${inspectionComposition.corridorClear ? "clear" : "softened"} faded:${inspectionComposition.fadedBlockerCount ?? 0}`
      ] : []),
      ...(pressure.active || pressure.stage ? [
        `Comb Pressure:${pressure.active ? "readable" : "waiting"} route:${pressure.routeActivated ? "open" : "closed"}`,
        `Pressure target:${pressure.targetRequired ? "yes" : "none"} input:${pressure.inputRequired ? "yes" : "none"}`
      ] : []),
      ...(identity.active || identity.stage ? [
        `Chorus Identity:${identity.active ? "living/readable" : "waiting"} tissue:${Math.round((identity.progress ?? 0) * 100)}%`,
        `Lobes:${identity.lobeCount ?? 0} filaments:${identity.filamentCount ?? 0} motes:${identity.moteCount ?? 0}`,
        `Combward tissue:${identity.combwardDirectionReinforced ? "reinforced" : "waiting"} route/input:none`
      ] : []),
      "",
      "MORPH / HANDOFF",
      `Plan: ${this.shorten(morph.planId ?? "none", 39)}`,
      `Phase: ${this.shorten(morph.phase ?? "none", 36)}`,
      `Progress:${Math.round((morph.progress ?? 0) * 100)}% Ready:${morph.triggerReady ? "yes" : "no"}`,
      `Req R${this.formatValue(morph.requiredResidue)} D${this.formatValue(morph.requiredSeed)} S≤${this.formatValue(morph.maximumScar)} | now R${this.formatValue(morph.residue)} D${this.formatValue(morph.seed)} S${this.formatValue(morph.scar)}`,
      `Reason: ${this.shorten(morph.triggerReason ?? "none", 39)}`,
      `Dest: ${this.shorten(morph.destinationCell ?? "none", 41)}`,
      `Morph next: ${this.shorten(morph.nextAction ?? "none", 39)}`,
      "CHEMISTRY / BOND",
      `Local F${this.formatValue(c.form)} X${this.formatValue(c.flux)} S${this.formatValue(c.scar)} D${this.formatValue(c.seed)} G${this.formatValue(c.signal)}`,
      `Player F${this.formatValue(p.form)} X${this.formatValue(p.flux)} S${this.formatValue(p.scar)} D${this.formatValue(p.seed)} G${this.formatValue(p.signal)}`,
      `Feel visc:${this.formatValue(f.viscosity)} press:${this.formatValue(f.pressure)}`,
      `Bond: ${this.shorten(this.frameState.currentBond ?? "none", 26)} str:${this.formatValue(b.strength)}`,
      `Absorb:${this.formatValue(b.absorbProgress)} compat:${this.shorten(b.compatibility ?? "none", 18)}`,
      `Bond block: ${this.shorten(b.blockReason ?? "none", 35)}`,
      "",
      "RUNTIME HEALTH",
      `Schema:${schema.status ?? "pending"} warn:${schema.warnings?.length ?? 0}`,
      `Placeholders active:${placeholders.active ?? 0} expired:${placeholders.expired ?? 0}`,
      `Nonfatal system errors:${errors.length}`,
      `Camera:${camera.mode ?? "orbit"} dist:${this.formatValue(camera.distance)} fov:${this.formatValue(camera.fieldOfView)} fade:${this.formatValue(camera.occlusionIntensity)}`,
      `Move ref:${this.frameState.playerKinematics?.movementReference ?? "camera_relative_free_3d"} haze:${this.formatValue(this.frameState.signalChorusReturnReadability?.hazeOpacity)}`,
      `Core:${core.owner ?? "none"} ${coreGrowth.displayStage ?? "Seed Core"} ${Math.round((coreGrowth.growthProgress ?? 0) * 100)}% fins:${core.authoredProxyParts?.fins ?? 0} petals:${core.authoredProxyParts?.growthPetals ?? 0} rings:${core.objectDefiningRings ? "CHECK" : "transient-only"}`,
      `Build lock: ${this.shorten(this.frameState.lockState?.status ?? "none", 34)}`,
      `SNAPSHOT ${this.shorten(d.screenshotCode, 47)}`
    ].join("\n");
  }

  morphSummary(morph) {
    if (morph.completed) {
      return `Morph: complete → ${this.labelCell(morph.destinationCell)} ${Math.round((morph.progress ?? 0) * 100)}%`;
    }
    return `Morph: ${morph.phase ?? "none"} ${Math.round((morph.progress ?? 0) * 100)}% Ready:${morph.triggerReady ? "yes" : "no"}`;
  }

  chainStableLine() {
    const cell = this.frameState.activeCellId;
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    const surfaceWake = this.frameState.surfaceWakeLayeredInteraction ?? {};
    if (cell === "CELL_MEMBRANE_NURSERY_001" && surfaceWake.active && !surfaceWake.completed) return "Chain: Surface Wake / layered listening";
    if (cell === "CELL_MEMBRANE_NURSERY_001" && surfaceWake.completed) return "Chain: Surface Wake language learned";
    if (cell === "CELL_BLOOM_RESIDUE_FORK_001" && this.isBloomEffectivelyStable(bloomLoop)) return "Chain: four-cell stable / lock candidate";
    if (cell === "CELL_BLOOM_RESIDUE_FORK_001") return "Chain: Bloom Residue active";
    if (cell === "CELL_SCAR_FLOW_FOLD_001" && this.frameState.guideThresholdLayeredInteraction?.active) return "Chain: Guide Threshold / movement-led traversal";
    if (cell === "CELL_SIGNAL_CHORUS_NERVE_001" && this.frameState.signalChorusLayeredInteraction?.active) return "Chain: Signal Chorus / layered resonance";
    if (cell === "CELL_SIGNAL_CHORUS_NERVE_001" && this.frameState.signalChorusNextRoutePressure?.active) return "Chain: Signal Chorus / combward pressure readable";
    if (cell === "CELL_SIGNAL_CHORUS_NERVE_001") return "Chain: Signal Chorus active";
    if (cell === "CELL_SCAR_FLOW_FOLD_001") return "Chain: Scar-Flow active";
    return "Chain: Membrane Nursery active";
  }

  activeChemistryLines() {
    const layeredInteraction = this.frameState.signalChorusLayeredInteraction ?? {};
    const nextRoutePressure = this.frameState.signalChorusNextRoutePressure ?? {};
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    const bloomArrival = this.frameState.bloomResidueArrival ?? {};
    const signalLoop = this.frameState.signalChorusInteraction ?? {};
    const signalArrival = this.frameState.signalChorusArrival ?? {};
    const scarLoop = this.frameState.scarFlowInteraction ?? {};
    const scarArrival = this.frameState.scarFlowArrival ?? {};

    if (layeredInteraction.active) {
      return [
        "Layered Chorus Interaction",
        `State: ${layeredInteraction.stage ?? "waiting"} ${Math.round((layeredInteraction.progress ?? 0) * 100)}%`,
        `Cadence ${layeredInteraction.cadenceMatches ?? 0}/${layeredInteraction.requiredCadenceMatches ?? 2} · Hold ${this.formatValue(layeredInteraction.resonanceHold)}`,
        `Response ${this.formatValue(layeredInteraction.tissueResponse)} · Settle ${this.formatValue(layeredInteraction.settleProgress)}`,
        `Next: ${this.shorten(layeredInteraction.nextAction ?? "follow the tissue response", 48)}`
      ];
    }

    if (nextRoutePressure.active) {
      return [
        "Combward Pressure",
        `State: ${nextRoutePressure.stage ?? "waiting"} ${Math.round((nextRoutePressure.progress ?? 0) * 100)}%`,
        `Route closed / target none / input none`,
        `Next: ${this.shorten(nextRoutePressure.nextAction ?? "hold the reading", 48)}`
      ];
    }

    if (bloomLoop.active) {
      const bloomStable = this.isBloomEffectivelyStable(bloomLoop);
      return [
        "Bloom Residue Loop",
        `State: ${bloomStable ? "stable / complete" : bloomLoop.stage} ${bloomStable ? 100 : Math.round((bloomLoop.progress ?? 0) * 100)}%`,
        `Focus: ${bloomLoop.currentFocus ?? "none"}`,
        `Memory ${this.formatValue(bloomLoop.residueMemory)} Bloom ${this.formatValue(bloomLoop.bloomCare)}`,
        `Braid ${this.formatValue(bloomLoop.braidWarmth)} Warning ${this.formatValue(bloomLoop.warningRespect)}`,
        `Risk ${this.formatValue(bloomLoop.overgrowthRisk)} Fork ${this.formatValue(bloomLoop.forkStability)}`,
        `Next: ${this.shorten(this.isBloomEffectivelyStable(bloomLoop) ? "optional Bloom fork stable; first-minute lock remains separate" : bloomLoop.nextAction ?? "none", 48)}`
      ];
    }

    if (bloomArrival.active) {
      return [
        "Bloom Residue Arrival",
        `Focus: ${bloomArrival.focusObjectId ?? "none"}`,
        `Trust ${this.formatValue(bloomArrival.forkTrust)} Memory ${this.formatValue(bloomArrival.residueMemory)}`,
        `Next: ${this.shorten(bloomArrival.nextAction ?? "none", 48)}`
      ];
    }

    if (signalLoop.active) {
      return [
        "Signal Chorus Loop",
        `State: ${signalLoop.stage ?? "inactive"} ${Math.round((signalLoop.progress ?? 0) * 100)}%`,
        `Focus: ${signalLoop.currentFocus ?? "none"}`,
        `Listen ${this.formatValue(signalLoop.listenTrust)} Answer ${this.formatValue(signalLoop.answerStrength)}`,
        `Harmony ${this.formatValue(signalLoop.harmony)} Bridge ${this.formatValue(signalLoop.bridgeWarmth)}`,
        `Next: ${this.shorten(signalLoop.nextAction ?? "none", 48)}`
      ];
    }

    if (signalArrival.active) {
      return [
        "Signal Chorus Arrival",
        `Focus: ${signalArrival.focusObjectId ?? "none"}`,
        `Clarity ${this.formatValue(signalArrival.arrivalClarity)} Listen ${this.formatValue(signalArrival.listeningTrust)}`,
        `Next: ${this.shorten(signalArrival.nextAction ?? "none", 48)}`
      ];
    }

    if (scarLoop.active) {
      return [
        "Scar-Flow Loop",
        `State: ${scarLoop.stage ?? "inactive"} ${Math.round((scarLoop.progress ?? 0) * 100)}%`,
        `Focus: ${scarLoop.currentFocus ?? "none"}`,
        `Next: ${this.shorten(scarLoop.nextAction ?? "none", 48)}`
      ];
    }

    if (scarArrival.active) {
      return [
        "Scar-Flow Arrival",
        `Focus: ${scarArrival.focusObjectId ?? "none"}`,
        `Next: ${this.shorten(scarArrival.nextAction ?? "none", 48)}`
      ];
    }

    return ["Loop: waiting for first seed absorb"];
  }


  blueprintRoleLine() {
    const role = this.activeBlueprintRole();
    return `Blueprint Role: ${role.blueprintRole} / ${role.roleType}`;
  }

  blueprintWarningLine() {
    const translation = this.frameState.blueprintTranslation ?? {};
    return `Translation Rule: ${this.shorten(translation.legacyRuntimeWarning ?? translation.translationRule ?? "no legacy runtime revival", 64)}`;
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
    return `First Minute: ${this.isFirstMinuteComplete() ? "lock candidate complete" : `required chain ${Math.round((this.frameState.openingFlow?.firstMinuteProgress ?? 0) * 100)}%`}`;
  }

  optionalForkLine() {
    const bloomLoop = this.frameState.bloomResidueInteraction ?? {};
    if (this.frameState.activeCellId !== "CELL_BLOOM_RESIDUE_FORK_001") return "Beyond-Minute Fork: optional / not reached";
    return this.isBloomEffectivelyStable(bloomLoop)
      ? "Beyond-Minute Fork: optional stable / complete"
      : "Beyond-Minute Fork: optional active";
  }

  isFirstMinuteComplete() {
    if ((this.frameState.openingFlow?.firstMinuteProgress ?? 0) >= 0.96) return true;
    if (this.frameState.activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") return true;
    const signalLoop = this.frameState.signalChorusInteraction ?? {};
    return this.frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001" && Boolean(signalLoop.preparedForNextBranch);
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
