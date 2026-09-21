const PLAN_IDS = {
  first: "MORPH_MEMBRANE_NURSERY_TO_SCAR_FLOW_FOLD_001",
  second: "MORPH_SCAR_FLOW_TO_SIGNAL_CHORUS_001",
  third: "MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001",
  grave: "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001",
  graveReturn: "RETURN_GRAVE_MEMORY_TO_SIGNAL_CHORUS_001"
};

const CELL_IDS = {
  nursery: "CELL_MEMBRANE_NURSERY_001",
  scar: "CELL_SCAR_FLOW_FOLD_001",
  signal: "CELL_SIGNAL_CHORUS_NERVE_001",
  bloom: "CELL_BLOOM_RESIDUE_FORK_001",
  grave: "CELL_GRAVE_MEMORY_RESIDUE_BED_001"
};

export function selectCurrentMorphState(frameState = {}) {
  const activeCellId = frameState.activeCellId ?? "none";
  const first = frameState.localCellMorph ?? {};
  const second = frameState.secondLocalCellMorph ?? {};
  const third = frameState.thirdLocalCellMorph ?? {};
  const grave = frameState.graveRouteMorph ?? {};
  const scarArrival = frameState.scarFlowArrival ?? {};
  const scarLoop = frameState.scarFlowInteraction ?? {};
  const signalArrival = frameState.signalChorusArrival ?? {};
  const signalLoop = frameState.signalChorusInteraction ?? {};
  const bloomArrival = frameState.bloomResidueArrival ?? {};
  const bloomLoop = frameState.bloomResidueInteraction ?? {};
  const signalReturn = frameState.signalChorusReturnState ?? {};

  if (
    signalReturn.active &&
    signalReturn.completed &&
    activeCellId === CELL_IDS.signal
  ) {
    return normalizeMorph(signalReturn, {
      order: 5,
      source: "signalChorusReturnState",
      planId: PLAN_IDS.graveReturn,
      sourceCell: CELL_IDS.grave,
      destinationCell: CELL_IDS.signal,
      phase: "returned_grave_reading_held_at_signal_chorus",
      progress: 1,
      completed: true,
      triggerReady: false,
      triggerReason: "verified_movement_return_handoff",
      nextAction: signalReturn.nextAction ?? "Hold the returned reading; no new route is active."
    });
  }

  if (
    activeCellId === CELL_IDS.grave ||
    grave.completed ||
    grave.phase === "completed_in_grave_memory_residue_bed" ||
    grave.phase === "morphing_into_grave_memory_residue_bed" ||
    (grave.progress ?? 0) > 0
  ) {
    return normalizeMorph(grave, {
      order: 4,
      source: "graveRouteMorph",
      planId: PLAN_IDS.grave,
      sourceCell: CELL_IDS.bloom,
      destinationCell: CELL_IDS.grave,
      phase: grave.phase === "not_initialized" ? "completed_in_grave_memory_residue_bed" : grave.phase ?? "completed_in_grave_memory_residue_bed",
      progress: Math.max(grave.progress ?? 0, activeCellId === CELL_IDS.grave ? 1 : 0),
      completed: activeCellId === CELL_IDS.grave || Boolean(grave.completed),
      triggerReady: Boolean(grave.triggerReady || bloomLoop.preparedForNextBranch),
      triggerReason: grave.triggerReason ?? "grave_route_selected_by_active_cell",
      nextAction: grave.nextAction ?? "Read before you consume. Leave what is not ready."
    });
  }

  if (
    grave.triggerReady ||
    (grave.progress ?? 0) > 0 ||
    grave.completed ||
    bloomLoop.preparedForNextBranch
  ) {
    return normalizeMorph(grave, {
      order: 4,
      source: "graveRouteMorph",
      planId: PLAN_IDS.grave,
      sourceCell: CELL_IDS.bloom,
      destinationCell: CELL_IDS.grave,
      nextAction: grave.nextAction ?? bloomLoop.nextAction
    });
  }

  if (
    activeCellId === CELL_IDS.bloom ||
    bloomArrival.active ||
    bloomLoop.active ||
    third.phase === "completed_in_bloom_residue_fork" ||
    third.completed
  ) {
    return normalizeMorph(third, {
      order: 3,
      source: "thirdLocalCellMorph",
      planId: PLAN_IDS.third,
      sourceCell: CELL_IDS.signal,
      destinationCell: CELL_IDS.bloom,
      phase: third.phase === "not_initialized" ? "completed_in_bloom_residue_fork" : third.phase ?? "completed_in_bloom_residue_fork",
      progress: Math.max(third.progress ?? 0, bloomLoop.progress ?? 0, bloomArrival.arrivalClarity ?? 0, activeCellId === CELL_IDS.bloom ? 1 : 0),
      completed: activeCellId === CELL_IDS.bloom || Boolean(third.completed),
      triggerReady: Boolean(third.triggerReady || signalLoop.preparedForNextBranch),
      triggerReason: third.triggerReason ?? "bloom_residue_selected_by_active_cell",
      nextAction: bloomLoop.active
        ? bloomLoop.nextAction
        : bloomArrival.active
          ? bloomArrival.nextAction
          : third.nextAction
    });
  }

  if (
    third.triggerReady ||
    (third.progress ?? 0) > 0 ||
    third.completed ||
    signalLoop.preparedForNextBranch
  ) {
    return normalizeMorph(third, {
      order: 3,
      source: "thirdLocalCellMorph",
      planId: PLAN_IDS.third,
      sourceCell: CELL_IDS.signal,
      destinationCell: CELL_IDS.bloom,
      nextAction: third.nextAction ?? signalLoop.nextAction
    });
  }

  if (
    activeCellId === CELL_IDS.signal ||
    signalArrival.active ||
    signalLoop.active ||
    second.phase === "completed_in_signal_chorus_nerve" ||
    second.completed
  ) {
    return normalizeMorph(second, {
      order: 2,
      source: "secondLocalCellMorph",
      planId: PLAN_IDS.second,
      sourceCell: CELL_IDS.scar,
      destinationCell: CELL_IDS.signal,
      phase: second.phase === "not_initialized" ? "completed_in_signal_chorus_nerve" : second.phase ?? "completed_in_signal_chorus_nerve",
      progress: Math.max(second.progress ?? 0, signalLoop.progress ?? 0, signalArrival.arrivalClarity ?? 0, activeCellId === CELL_IDS.signal ? 1 : 0),
      completed: activeCellId === CELL_IDS.signal || Boolean(second.completed),
      triggerReady: Boolean(second.triggerReady || scarLoop.preparedForNextBranch),
      triggerReason: second.triggerReason ?? "signal_chorus_selected_by_active_cell",
      nextAction: signalLoop.active
        ? signalLoop.nextAction
        : signalArrival.active
          ? signalArrival.nextAction
          : second.nextAction
    });
  }

  if (
    second.triggerReady ||
    (second.progress ?? 0) > 0 ||
    second.completed ||
    scarLoop.preparedForNextBranch
  ) {
    return normalizeMorph(second, {
      order: 2,
      source: "secondLocalCellMorph",
      planId: PLAN_IDS.second,
      sourceCell: CELL_IDS.scar,
      destinationCell: CELL_IDS.signal,
      nextAction: second.nextAction ?? scarLoop.nextAction
    });
  }

  if (
    activeCellId === CELL_IDS.scar ||
    scarArrival.active ||
    scarLoop.active ||
    first.phase === "completed_in_scar_flow_fold" ||
    first.completed
  ) {
    return normalizeMorph(first, {
      order: 1,
      source: "localCellMorph",
      planId: first.planId === "none" ? PLAN_IDS.first : first.planId ?? PLAN_IDS.first,
      sourceCell: CELL_IDS.nursery,
      destinationCell: CELL_IDS.scar,
      phase: first.phase === "not_initialized" ? "completed_in_scar_flow_fold" : first.phase ?? "completed_in_scar_flow_fold",
      progress: Math.max(first.progress ?? 0, scarLoop.progress ?? 0, scarArrival.arrivalClarity ?? 0, activeCellId === CELL_IDS.scar ? 1 : 0),
      completed: activeCellId === CELL_IDS.scar || Boolean(first.completed),
      nextAction: scarLoop.active
        ? scarLoop.nextAction
        : scarArrival.active
          ? scarArrival.nextAction
          : first.nextAction
    });
  }

  return normalizeMorph(first, {
    order: 1,
    source: "localCellMorph",
    planId: first.planId === "none" ? PLAN_IDS.first : first.planId ?? PLAN_IDS.first,
    sourceCell: CELL_IDS.nursery,
    destinationCell: CELL_IDS.scar
  });
}

function normalizeMorph(morph = {}, overrides = {}) {
  const progress = clamp01(overrides.progress ?? morph.progress ?? 0);
  const triggerConfidence = clamp01(overrides.triggerConfidence ?? morph.triggerConfidence ?? progress);

  return {
    ...morph,
    ...overrides,
    planId: overrides.planId ?? morph.planId ?? "none",
    sourceCell: overrides.sourceCell ?? morph.sourceCell ?? "none",
    destinationCell: overrides.destinationCell ?? morph.destinationCell ?? "none",
    phase: overrides.phase ?? morph.phase ?? "not_initialized",
    progress,
    triggerConfidence,
    triggerReady: Boolean(overrides.triggerReady ?? morph.triggerReady),
    triggerReason: overrides.triggerReason ?? morph.triggerReason ?? "none",
    nextAction: overrides.nextAction ?? morph.nextAction ?? "none",
    completed: Boolean(overrides.completed ?? morph.completed),
    noGate: morph.noGate ?? true,
    continuousControl: morph.continuousControl ?? true
  };
}

function clamp01(value) {
  const number = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1, number));
}
