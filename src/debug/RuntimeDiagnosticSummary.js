import { selectCurrentMorphState } from "../morph/MorphStateSelector.js";

const NONE = new Set([undefined, null, "", "none", "inactive", "not_initialized", "not_loaded"]);

const FLOW_DEFINITIONS = [
  { key: "surfaceWakeLayeredInteraction", owner: "SurfaceWakeLayeredInteractionSystem" },
  { key: "surfaceWakeGameplay", owner: "SurfaceWakeGameplaySystem" },
  { key: "nurseryCircuit", owner: "SurfaceWakeGameplaySystem" },
  { key: "guideThresholdGameplay", owner: "GuideThresholdGameplaySystem" },
  { key: "guideThresholdLayeredInteraction", owner: "GuideThresholdLayeredInteractionSystem" },
  { key: "hubInvestigationGameplay", owner: "HubInvestigationGameplaySystem" },
  { key: "hubChamberFoundation", owner: "HubChamberFoundationSystem" },
  { key: "graveMemoryRoute", owner: "GraveMemoryRouteSystem" },
  { key: "vascularRhythmRoute", owner: "VascularRhythmRouteSystem" },
  { key: "siltPressureRoute", owner: "SiltPressureRouteSystem" },
  { key: "secondLocalCellMorph", owner: "SecondLocalCellMorphSystem" },
  { key: "scarFlowInteraction", owner: "ScarFlowInteractionSystem" },
  { key: "scarFlowArrival", owner: "ScarFlowArrivalSystem" },
  { key: "localCellMorph", owner: "LocalCellMorphSystem" }
];

const FLOW_DEFINITION_BY_KEY = new Map(
  FLOW_DEFINITIONS.map((definition) => [definition.key, definition])
);
const REGION_FLOW_PRIORITY = {
  surface_wake: ["surfaceWakeLayeredInteraction", "surfaceWakeGameplay", "nurseryCircuit", "localCellMorph"],
  guide_threshold: ["guideThresholdGameplay", "guideThresholdLayeredInteraction", "secondLocalCellMorph", "scarFlowInteraction", "scarFlowArrival"],
  hub_chamber: ["hubInvestigationGameplay", "hubChamberFoundation"],
  grave_memory_route: ["graveMemoryRoute"],
  vascular_route: ["vascularRhythmRoute"],
  silt_burrow_route: ["siltPressureRoute"]
};
const REGION_BY_CELL = {
  CELL_MEMBRANE_NURSERY_001: "surface_wake",
  CELL_SCAR_FLOW_FOLD_001: "guide_threshold",
  CELL_SIGNAL_CHORUS_NERVE_001: "hub_chamber",
  CELL_GRAVE_MEMORY_RESIDUE_BED_001: "grave_memory_route",
  CELL_VASCULAR_RHYTHM_ROUTE_001: "vascular_route",
  CELL_SILT_PRESSURE_ROUTE_001: "silt_burrow_route"
};

export function buildRuntimeDiagnosticSummary(frameState) {
  const flow = selectActiveFlow(frameState);
  const morph = selectCurrentMorphState(frameState);
  const targeting = frameState.targeting ?? {};
  const focus = frameState.targetFocus ?? {};
  const input = frameState.input ?? {};
  const source = frameState.inputSource ?? {};
  const audit = frameState.inputActionAudit ?? {};
  const comfort = frameState.controllerOnboarding ?? {};
  const latestError = frameState.nonFatalSystemErrors?.[0] ?? null;

  const expectedTarget = flow.targetRequired === false
    ? "none"
    : firstMeaningful(
        flow.currentFocus,
        flow.focusObjectId,
        flow.triggerObject,
        focus.preferredTargetId
      ) ?? "none";
  const actualTarget = targeting.targetId ?? "none";
  const ready = flowReady(flow);
  const complete = flowComplete(flow);
  const targetAligned = complete || expectedTarget === "none" || actualTarget === expectedTarget;
  const pulseEventId = input.pulseEventId ?? audit.eventId ?? 0;
  const pulseProducedThisFrame = Boolean(input.pulsePressed);
  const pulseConsumed = Number(audit.eventId ?? 0) === Number(pulseEventId) && !NONE.has(audit.consumedBy);
  const pulseAge = comfort.actions?.pulseAge ?? 0;
  const blocker = determineBlocker({
    frameState,
    flow,
    morph,
    expectedTarget,
    actualTarget,
    targetAligned,
    pulseProducedThisFrame,
    pulseConsumed,
    latestError
  });
  const health = determineHealth({ flow, morph, complete, ready, blocker, pulseProducedThisFrame, pulseConsumed });

  return {
    health,
    blocker,
    latestError,
    flowKey: flow.__key ?? "none",
    owner: flow.__owner ?? "none",
    stage: flow.stage ?? flow.phase ?? flow.status ?? "none",
    progress: finite(flow.progress),
    ready,
    complete,
    currentFocus: firstMeaningful(flow.currentFocus, flow.focusObjectId, flow.triggerObject) ?? "none",
    expectedTarget,
    actualTarget,
    targetAligned,
    targetProvider: focus.provider ?? "none",
    targetRule: focus.ruleId ?? "none",
    nextAction: flow.nextAction ?? morph.nextAction ?? frameState.playtestHud?.actionHint ?? "none",
    lastInteraction: flow.lastInteraction ?? flow.lastAction ?? flow.triggerReason ?? "none",
    pulseEventId,
    pulseProducedThisFrame,
    pulseConsumed,
    pulseAge: finite(pulseAge),
    pulseSource: input.pulseSource ?? source.lastPulseSource ?? audit.source ?? "none",
    pulseSequence: source.pulseSequence ?? 0,
    audit,
    morph,
    screenshotCode: buildScreenshotCode(frameState, {
      owner: flow.__owner ?? "none",
      stage: flow.stage ?? flow.phase ?? flow.status ?? "none",
      expectedTarget,
      actualTarget,
      audit,
      blocker
    })
  };
}

export function activeFlowMetricLines(frameState, max = 48) {
  const summary = buildRuntimeDiagnosticSummary(frameState);
  const flow = frameState[summary.flowKey] ?? {};
  const metrics = [];

  const candidates = [
    ["Stage Index", flow.stageIndex],
    ["Focus Distance", flow.focusDistance],
    ["Grave Reads", flow.readCount],
    ["Trace Integrity", flow.traceIntegrity],
    ["Residue Recoil", flow.residueRecoilRisk],
    ["Safe Transfer", flow.safeTransferProgress],
    ["Imprint Committed", flow.graveMemoryImprintCommitted],
    ["Return Fold Ready", flow.returnFoldReady],
    ["Cadence Reads", flow.lockedCadenceReads],
    ["Synchronization", flow.synchronization],
    ["Circulation Integrity", flow.circulationIntegrity],
    ["Stabilization In Range", flow.stabilizationInRange],
    ["Stabilization Range", flow.stabilizationRange],
    ["Post-read Pulses Ignored", flow.postReadPulseIgnoredCount],
    ["Gameplay Familiarity", flow.familiarity],
    ["Current Path Progress", flow.maxPathProgress],
    ["Current Turbulence", flow.turbulence],
    ["Effective Turbulence", flow.effectiveTurbulence],
    ["Pulse Reads", flow.pulseReads],
    ["Optional Rewards", flow.optionalRewardCount],
    ["Hub Route Reads", flow.routeReadCount],
    ["Hub Nearest Route", flow.nearestRouteId],
    ["Hub Memory Read", flow.memoryRead],
    ["Hub Returned Center", flow.returnedToCenter],
    ["Hub Investigation Ready", flow.investigationReady],
    ["Approach Hold", flow.approachHold],
    ["Alignment Progress", flow.alignmentProgress],
    ["Traversal Progress", flow.traversalProgress],
    ["Movement Magnitude", flow.movementMagnitude],
    ["Path Direction Dot", flow.pathDirectionDot],
    ["Local Path Dot", flow.localPathDirectionDot],
    ["Path Corridor Distance", flow.corridorDistance],
    ["Path Corridor Range", flow.corridorRange],
    ["Within Path Corridor", flow.withinPathCorridor],
    ["Guidance Level", flow.guidanceLevel],
    ["Settle Distance", flow.settleDistance],
    ["Cadence Matches", flow.cadenceMatches],
    ["Cadence Misses", flow.cadenceMisses],
    ["Cadence Window", flow.cadenceWindowOpen],
    ["Resonance Hold", flow.resonanceHold],
    ["Tissue Response", flow.tissueResponse],
    ["Response Progress", flow.responseProgress],
    ["Settle Progress", flow.settleProgress],
    ["Safe Seed Readable", flow.safeSeedReadable],
    ["Trigger Confidence", flow.triggerConfidence],
    ["Trigger Reason", flow.triggerReason],
    ["Residue Memory", flow.residueMemory],
    ["Bloom Care", flow.bloomCare],
    ["Braid Warmth", flow.braidWarmth],
    ["Warning Respect", flow.warningRespect],
    ["Fork Stability", flow.forkStability],
    ["Overgrowth Risk", flow.overgrowthRisk],
    ["Listen Trust", flow.listenTrust],
    ["Answer Strength", flow.answerStrength],
    ["Harmony", flow.harmony],
    ["Bridge Warmth", flow.bridgeWarmth],
    ["Memory Read", flow.memoryRead],
    ["Path Aligned", flow.pathAligned],
    ["Pressure Relieved", flow.pressureRelieved],
    ["Clot Respected", flow.clotRespected],
    ["Read Confidence", flow.readConfidence],
    ["Husk Read", flow.huskMemoryRead],
    ["Silt Settled", flow.siltSettled],
    ["Scar Read", flow.scarLockRead],
    ["Seed Warmth", flow.seedRemnantWarmth],
    ["Thread Read", flow.threadRead],
    ["Lattice Read", flow.latticeRead],
    ["Echo Read", flow.echoRead],
    ["Suture Read", flow.sutureRead],
    ["Recoil Risk", flow.recoilRisk],
    ["Stable Seconds", flow.stableSeconds],
    ["Entry Distance", flow.entryDistance],
    ["Path Distance", flow.pathDistance],
    ["Path Progress", flow.pathProgress],
    ["Held Seconds", flow.heldSeconds],
    ["Readability Locked", flow.readabilityLocked],
    ["Haze Opacity", flow.hazeOpacity],
    ["Movement Ref", flow.movementReference],
    ["Active Cell Confirmed", flow.activeCellConfirmed],
    ["Hub Anchor Readable", flow.centralAnchorReadable],
    ["Hub Route Layout", flow.threeRouteLayoutReadable],
    ["Hub Route Count", flow.routeCount],
    ["Hub Dormant Routes", flow.dormantRouteCount],
    ["Memory Fragment", flow.firstMemoryFragmentReadable],
    ["Old Signal Loop Suppressed", flow.oldSignalLoopSuppressed]
  ];

  for (const [label, value] of candidates) {
    if (value === undefined || value === null) continue;
    metrics.push(`${label}: ${formatMetric(value)}`);
    if (metrics.length >= 6) break;
  }

  if (!metrics.length) metrics.push("No flow-specific metrics published.");
  return metrics.map((line) => shorten(line, max));
}

function selectActiveFlow(frameState) {
  const activeRegionId = resolveActiveRegionId(frameState);
  const preferredKeys = REGION_FLOW_PRIORITY[activeRegionId] ?? null;
  if (preferredKeys) {
    let ownedFallback = null;
    for (const key of preferredKeys) {
      const definition = FLOW_DEFINITION_BY_KEY.get(key);
      const state = frameState[key];
      if (!definition || !state) continue;
      if (!ownedFallback) {
        ownedFallback = { ...state, __key: key, __owner: definition.owner };
      }
      if (isFlowRelevant(state, key, frameState)) {
        return { ...state, __key: key, __owner: definition.owner };
      }
    }

    if (ownedFallback) return ownedFallback;

    return {
      __key: "currentMode",
      __owner: frameState.firstSliceRuntimeMount?.presentationOwner ?? "ModeController",
      active: true,
      stage: "awaiting_active_region_publisher",
      status: "active_region_owned",
      progress: 0,
      targetRequired: false,
      inputRequired: false,
      movementRequired: false,
      nextAction: frameState.guidePrompt?.objectiveLine ?? "Wait for the active region to publish its state."
    };
  }

  for (const definition of FLOW_DEFINITIONS) {
    const state = frameState[definition.key];
    if (!state) continue;
    if (isFlowRelevant(state, definition.key, frameState)) {
      return { ...state, __key: definition.key, __owner: definition.owner };
    }
  }

  return {
    __key: "openingFlow",
    __owner: "OpeningPacingSystem",
    ...(frameState.openingFlow ?? {})
  };
}

function resolveActiveRegionId(frameState) {
  const cellRegion = REGION_BY_CELL[frameState.activeCellId];
  if (cellRegion) return cellRegion;
  const mounted = frameState.firstSliceRuntimeMount?.activeRegionId;
  if (REGION_FLOW_PRIORITY[mounted]) return mounted;
  return "outside_authored_route";
}

function isFlowRelevant(state, key, frameState) {
  if (key === "hubInvestigationGameplay") {
    return Boolean(state.active && !state.investigationReady);
  }
  if (key === "hubChamberFoundation") {
    return Boolean(state.active);
  }
  if (state.active) return true;
  if (state.started && !state.completed) return true;
  if ((state.progress ?? 0) > 0 && !state.completed) return true;

  const cell = frameState.activeCellId;
  if (cell === "CELL_SCAR_FLOW_FOLD_001" && key === "guideThresholdLayeredInteraction") return true;
  if (cell === "CELL_SCAR_FLOW_FOLD_001" && key === "scarFlowInteraction") return true;
  return false;
}

function flowReady(flow) {
  return Boolean(
    flow.preparedForNextBranch ||
    flow.triggerReady ||
    flow.ready ||
    flow.focusReady ||
    flow.safeAbsorbReady ||
    flow.safeToExpand ||
    flow.firstReadComplete ||
    flow.responseComplete ||
    flow.routeLocked ||
    flow.investigationReady
  );
}

function flowComplete(flow) {
  return Boolean(
    flow.completed ||
    flow.responseComplete ||
    flow.firstReadComplete ||
    flow.preparedForNextBranch ||
    flow.routeLocked ||
    flow.investigationReady
  );
}

function determineBlocker({ frameState, flow, morph, expectedTarget, actualTarget, targetAligned, pulseProducedThisFrame, pulseConsumed, latestError }) {
  if (latestError) return `nonfatal_error:${latestError.id}`;
  if (!targetAligned) return `target_mismatch:${actualTarget}->${expectedTarget}`;
  if (pulseProducedThisFrame && !pulseConsumed && flow.inputRequired !== false) return "fresh_pulse_not_consumed";
  if (!NONE.has(flow.blocker) && flow.blocker !== "none_detected") return flow.blocker;
  if (frameState.input?.absorbHeld && flow.absorbBlocked) return "absorb_held_while_flow_blocks_absorb";

  // HC-004QF: an immediate route/morph prerequisite is the progression blocker.
  // Passive bond warnings such as target_not_safe_to_absorb must not hide it
  // when the authored action is pulse/listen rather than absorb.
  if (!morph.deferredToSurfaceWake && !NONE.has(morph.triggerReason) && !morph.triggerReady && (morph.progress ?? 0) <= 0) {
    return `morph:${morph.triggerReason}`;
  }

  const actionText = `${flow.nextAction ?? ""} ${frameState.playtestHud?.actionHint ?? ""}`.toLowerCase();
  const absorptionExpected = Boolean(frameState.input?.absorbHeld || actionText.includes("absorb"));
  if (absorptionExpected && !NONE.has(frameState.bondState?.blockReason)) {
    return `bond:${frameState.bondState.blockReason}`;
  }

  if (expectedTarget === "none" && flow.active && !flowComplete(flow) && !flow.movementRequired && !flow.focusVisualOnly) return "active_flow_has_no_expected_target";
  if (!NONE.has(flow.triggerReason) && !flowReady(flow) && !flowComplete(flow)) return `flow:${flow.triggerReason}`;
  return "none_detected";
}

function determineHealth({ flow, morph, complete, ready, blocker, pulseProducedThisFrame, pulseConsumed }) {
  if (blocker.startsWith("nonfatal_error")) return "ERROR";
  if (blocker.startsWith("target_mismatch")) return "TARGET MISALIGNED";
  if (blocker === "fresh_pulse_not_consumed") return "INPUT UNCONSUMED";
  if ((morph.progress ?? 0) > 0 && !morph.completed) return "MORPHING";
  if (blocker.startsWith("morph:")) return complete ? "HANDOFF BLOCKED" : "MORPH PREREQUISITE";
  if (complete) return "COMPLETE / HANDOFF";
  if (ready) return "READY FOR INPUT";
  if (flow.active) return "ACTIVE / WAITING";
  return "IDLE";
}

function buildScreenshotCode(frameState, info) {
  const audit = info.audit ?? {};
  return [
    frameState.buildId ?? "build?",
    `cell=${frameState.activeCellId ?? "none"}`,
    `owner=${info.owner}`,
    `stage=${info.stage}`,
    `focus=${info.expectedTarget}`,
    `target=${info.actualTarget}`,
    `pulse=${audit.eventId ?? 0}:${audit.consumedBy ?? "none"}`,
    `block=${info.blocker}`
  ].join(" | ");
}

function firstMeaningful(...values) {
  return values.find((value) => !NONE.has(value));
}

function finite(value) {
  return Number.isFinite(value) ? value : 0;
}

function formatMetric(value) {
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

export function shorten(value, max = 60) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text;
}
