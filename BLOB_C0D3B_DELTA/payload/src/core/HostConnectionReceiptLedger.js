/**
 * LS1E1 — authoritative provenance for events, NOT material transport.
 * Host connection records survive local-cell unmount/remount for this runtime
 * instance. Only a verified Silt release receipt is accepted. No update loop,
 * off-route simulation, progression, material ownership or save file effects.
 */
const SILT_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR_CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE_CELL = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const VASCULAR_EFFECT = 'vascular_membrane_load_change_applied';
const round = value => Number(Number(value).toFixed(3));
const validId = id => typeof id === 'string' && /^silt-grain-0[1-8]$/.test(id);
const finiteVector = point => Array.isArray(point) && point.length === 3 && point.every(Number.isFinite);

export class HostConnectionReceiptLedger {
  constructor({ limit = 64 } = {}) {
    this.limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 256) : 64;
    this.records = [];
    // Source Silt transaction sequence is strictly monotonic. One integer
    // prevents replay without an unbounded Set of historical IDs.
    this.lastSourceDecisionSequence = 0;
    this.sequence = 0;
    this.acceptedTotal = 0;
    this.rejectedTotal = 0;
    this.duplicateTotal = 0;
    this.prunedTotal = 0;
    // C0D1-B: independent Host provenance for an effect Vascular actually applied.
    // This cannot change or append to the existing LS1E1 Silt snapshot.
    this.vascularEffectRecords = [];
    this.vascularEffectSequence = 0;
    this.lastVascularSourceSequence = 0;
    this.lastVascularParentSiltSequence = 0;
    this.vascularEffectAcceptedTotal = 0;
    this.vascularEffectRejectedTotal = 0;
    this.vascularEffectDuplicateTotal = 0;
    this.vascularEffectGapRejectedTotal = 0;
    this.vascularEffectPrunedTotal = 0;
    // C0D3-B: a separate, bounded history of genuine Grave II resolution.
    // No Grave progress is awarded here and no downstream Silt state is mutated.
    this.graveIIResolutionRecords = [];
    this.graveIIResolutionSequence = 0;
    this.lastGraveIICompletionSourceSequence = 0;
    this.graveIIResolutionAcceptedTotal = 0;
    this.graveIIResolutionRejectedTotal = 0;
    this.graveIIResolutionDuplicateTotal = 0;
    this.graveIIResolutionPrunedTotal = 0;
  }

  observeSiltRelease(sourceDecision) {
    const receipt = sourceDecision ?? {};
    // Only the Silt route's completed release transaction may cross this
    // provenance boundary. Ordinary Pulse, held motion and hidden-cell release
    // do not qualify. This method is called by that route, not by input polling.
    if (receipt.kind !== 'silt-trajectory' ||
        receipt.outcome !== 'released-with-trajectory' ||
        receipt.reason !== 'deliberate-release' ||
        receipt.noMaterialTransfer !== true ||
        receipt.progressionCredit !== false ||
        !validId(receipt.unitId) ||
        !Number.isSafeInteger(receipt.sequence) || receipt.sequence < 1 ||
        !finiteVector(receipt.position) || !finiteVector(receipt.velocity) ||
        !Number.isFinite(receipt.siltElapsedSeconds) || receipt.siltElapsedSeconds < 0) {
      this.rejectedTotal++;
      return null;
    }
    const eventId = `${SILT_CELL}:silt-trajectory:${receipt.sequence}`;
    if (receipt.sequence <= this.lastSourceDecisionSequence) {
      this.duplicateTotal++;
      return null;
    }
    const record = Object.freeze({
      schemaVersion: 1,
      id: eventId,
      sequence: ++this.sequence,
      kind: 'silt_material_disturbance_observed',
      sourceCellId: SILT_CELL,
      sourceSystem: 'SiltPressureRouteSystem',
      sourceReceiptSequence: receipt.sequence,
      subjectId: receipt.unitId,
      simulationSeconds: round(receipt.siltElapsedSeconds),
      origin: Object.freeze([...receipt.position]),
      releaseVelocity: Object.freeze([...receipt.velocity]),
      effectType: 'observed_only',
      targetCellId: null,
      materialTransfer: false,
      routeCredit: false,
      worldConsequence: false
    });
    this.lastSourceDecisionSequence = receipt.sequence;
    this.records.push(record);
    this.acceptedTotal++;
    if (this.records.length > this.limit) {
      this.records.shift();
      this.prunedTotal++;
    }
    // Monotonic receipt dedupe survives bounded record-buffer rollover.
    return record;
  }

  /** C0D1-B: authenticate a Vascular-owned *applied* effect against the
   *  accepted, still-retained Silt parent. Not a second Silt disturbance.
   *  Fail closed if the parent rolled out of the bounded Silt history.
   */
  observeVascularAppliedEffect(event) {
    const e = event ?? {};
    if (!Number.isSafeInteger(e.sequence) || e.sequence < 1 ||
        e.schemaVersion !== 1 || e.kind !== VASCULAR_EFFECT ||
        e.sourceCellId !== VASCULAR_CELL ||
        e.sourceSystem !== 'VascularSiltSignalReceiver' ||
        e.id !== `${VASCULAR_CELL}:membrane-load-applied:${e.sequence}` ||
        e.materialTransfer !== false || e.routeCredit !== false ||
        e.offRouteSimulation !== false ||
        !Number.isSafeInteger(e.parentSiltReceiptSequence) || e.parentSiltReceiptSequence < 1 ||
        !Number.isSafeInteger(e.parentSiltDecisionSequence) || e.parentSiltDecisionSequence < 1 ||
        !validId(e.subjectId) ||
        !Number.isFinite(e.membraneLoadBefore) ||
        !Number.isFinite(e.membraneLoadAfter) || !Number.isFinite(e.appliedDelta) ||
        e.membraneLoadBefore < 0 || e.membraneLoadBefore >= 0.85 ||
        e.membraneLoadAfter > 0.85 || e.membraneLoadAfter <= e.membraneLoadBefore ||
        e.appliedDelta <= 0 || e.appliedDelta > 0.19500001 ||
        Math.abs((e.membraneLoadAfter - e.membraneLoadBefore) - e.appliedDelta) > 1e-10) {
      this.vascularEffectRejectedTotal++;
      return null;
    }
    if (e.sequence <= this.lastVascularSourceSequence) {
      this.vascularEffectDuplicateTotal++;
      return null;
    }
    if (e.sequence !== this.lastVascularSourceSequence + 1) {
      // A silent lost source event would destroy lineage; do not skip ahead.
      this.vascularEffectGapRejectedTotal++;
      return null;
    }
    const parent = this.records.find(record =>
      record.sequence === e.parentSiltReceiptSequence && record.id === e.parentSiltReceiptId);
    if (!parent || parent.sourceReceiptSequence !== e.parentSiltDecisionSequence ||
        parent.subjectId !== e.subjectId || parent.sourceCellId !== SILT_CELL ||
        parent.kind !== 'silt_material_disturbance_observed') {
      this.vascularEffectRejectedTotal++;
      return null;
    }
    // Enforce one effect per parent for the entire runtime, even after the
    // bounded Vascular history rolls over (no unbounded dedupe Set).
    if (parent.sequence <= this.lastVascularParentSiltSequence) {
      this.vascularEffectRejectedTotal++;
      return null;
    }
    // Parent speed fixes the maximum permitted positive local increment.
    // The Host verifies the stated load delta is compatible with that cause,
    // without computing or advancing any remote state itself.
    const speed = Math.hypot(...parent.releaseVelocity);
    const expectedIncrement = 0.14 + 0.055 * Math.max(0, Math.min(1, speed / 2.5));
    const expectedAfter = Math.min(0.85, e.membraneLoadBefore + expectedIncrement);
    if (Math.abs(e.membraneLoadAfter - expectedAfter) > 1e-10) {
      this.vascularEffectRejectedTotal++;
      return null;
    }
    const record = Object.freeze({
      schemaVersion: 1,
      id: e.id,
      sequence: ++this.vascularEffectSequence,
      kind: VASCULAR_EFFECT,
      sourceCellId: VASCULAR_CELL,
      sourceSystem: 'VascularSiltSignalReceiver',
      sourceEventSequence: e.sequence,
      parentSiltReceiptId: parent.id,
      parentSiltReceiptSequence: parent.sequence,
      parentSiltDecisionSequence: parent.sourceReceiptSequence,
      subjectId: parent.subjectId,
      membraneLoadBefore: e.membraneLoadBefore,
      membraneLoadAfter: e.membraneLoadAfter,
      appliedDelta: e.appliedDelta,
      materialTransfer: false,
      routeCredit: false,
      offRouteSimulation: false
    });
    this.lastVascularSourceSequence = e.sequence;
    this.lastVascularParentSiltSequence = parent.sequence;
    this.vascularEffectRecords.push(record);
    this.vascularEffectAcceptedTotal++;
    if (this.vascularEffectRecords.length > this.limit) {
      this.vascularEffectRecords.shift();
      this.vascularEffectPrunedTotal++;
    }
    return record;
  }

  /**
   * C0D3-B: consume one completed, mounted Grave II resonance outcome.
   * Called by the Grave II gameplay owner in the same update that it resolves.
   * Owner instance / current-frame event / actual completion predicates are
   * witnessed together; no event is inferred from return-layout transformation.
   */
  observeGraveIIResolution(event, { source, frameState } = {}) {
    const e = event ?? {};
    const history = frameState?.act1RouteHistory ?? {};
    const graveHistory = history.routeStates?.grave_memory_route ?? {};
    const onReturn = (graveHistory.entryCount ?? history.graveEntryCount ?? 0) >= 2
      && Boolean(graveHistory.returned || history.graveReturned);
    const correctSource = source?.constructor?.name === 'GraveResonanceGameplaySystem'
      && source.frameState === frameState
      && source.graveReturnRegionSystem?.frameState === frameState
      && source.graveReturnRegionSystem?.active === true
      && source.active === true && source.completed === true
      && source.wasActive === true && source.resolutionHold >= 1.65
      && source.interactionCount >= 3 && source.touchedNodes?.size >= 2
      && source.resolutionId === e.resolutionId
      && source.completionSequence === e.sequence;
    const validEvent = frameState?.returnRegionCompletionEvent === event
      && frameState.activeCellId === GRAVE_CELL && onReturn
      && frameState.graveReturnRegion?.active === true
      && e.pass === 'HC-031B' && e.source === 'GraveResonanceGameplaySystem'
      && e.key === 'grave:phase_2' && e.routeKey === 'grave' && e.phase === 2
      && ['quiet_retention', 'shared_memory', 'held_contradiction'].includes(e.resolutionId)
      && Number.isSafeInteger(e.frame) && e.frame >= 0
      && e.frame === (frameState.frame ?? 0)
      && Number.isSafeInteger(e.sequence) && e.sequence >= 1;
    if (!correctSource || !validEvent) {
      this.graveIIResolutionRejectedTotal++;
      return null;
    }
    if (e.sequence <= this.lastGraveIICompletionSourceSequence) {
      this.graveIIResolutionDuplicateTotal++;
      return null;
    }
    // Grave II currently completes at most once in a runtime. Reject gaps,
    // and do not reset the cursor if its bounded record is eventually pruned.
    if (e.sequence !== this.lastGraveIICompletionSourceSequence + 1) {
      this.graveIIResolutionRejectedTotal++;
      return null;
    }
    const graveMemory = frameState.graveVascularEffectMemory ?? {};
    const inherited = frameState.returnRegionEngine?.graveLayout?.inputs?.c0d3GraveIIHostMemory;
    const linkedMemory = inherited?.applied === true
      && graveMemory.active === true
      && graveMemory.owner === 'GraveMemoryRouteSystem'
      && graveMemory.cellId === GRAVE_CELL
      && Number.isSafeInteger(graveMemory.receivedTotal)
      && graveMemory.receivedTotal > 0
      && Number.isFinite(graveMemory.memoryPressure)
      && graveMemory.memoryPressure > 0
      && graveMemory.memoryPressure <= 1
      && this.vascularEffectAcceptedTotal >= graveMemory.receivedTotal;
    // A parent is claimed only when its exact authenticated Host record is still
    // retained. Never invent a parent when the bounded ring has rolled over.
    const parentId = linkedMemory && this.vascularEffectRecords.some(
      r => r.id === graveMemory.lastVascularEffectId)
      ? graveMemory.lastVascularEffectId : null;
    const record = Object.freeze({
      schemaVersion: 1,
      id: `${GRAVE_CELL}:grave-ii-resolved:${e.sequence}`,
      sequence: ++this.graveIIResolutionSequence,
      kind: 'grave_ii_regional_resonance_resolved',
      sourceCellId: GRAVE_CELL,
      sourceSystem: 'GraveResonanceGameplaySystem',
      sourceCompletionSequence: e.sequence,
      resolutionId: e.resolutionId,
      completedAtFrame: e.frame,
      parentVascularEffectId: parentId,
      inheritedVascularMemory: Boolean(linkedMemory),
      materialTransfer: false,
      routeCredit: false,
      progressionAuthority: false,
      offRouteSimulation: false
    });
    this.graveIIResolutionRecords.push(record);
    this.graveIIResolutionAcceptedTotal++;
    this.lastGraveIICompletionSourceSequence = e.sequence;
    if (this.graveIIResolutionRecords.length > this.limit) {
      this.graveIIResolutionRecords.shift();
      this.graveIIResolutionPrunedTotal++;
    }
    return record;
  }

  graveIIResolutionSnapshot({ withRecords = true, afterSequence = 0 } = {}) {
    const cursor = Number.isSafeInteger(afterSequence) && afterSequence >= 0 ? afterSequence : 0;
    const last = this.graveIIResolutionRecords.at(-1) ?? null;
    return {
      pass: 'C0D3-B', schemaVersion: 1,
      sourceCellId: GRAVE_CELL, sequence: this.graveIIResolutionSequence,
      lastSourceCompletionSequence: this.lastGraveIICompletionSourceSequence,
      acceptedTotal: this.graveIIResolutionAcceptedTotal,
      rejectedTotal: this.graveIIResolutionRejectedTotal,
      duplicateTotal: this.graveIIResolutionDuplicateTotal,
      prunedTotal: this.graveIIResolutionPrunedTotal,
      retainedCount: this.graveIIResolutionRecords.length,
      lastReceiptId: last?.id ?? null,
      records: withRecords ? this.graveIIResolutionRecords.filter(r => r.sequence > cursor) : [],
      materialTransfer: false, routeCredit: false, progressionAuthority: false,
      offRouteSimulation: false, persistentAcrossCellsInRuntime: true,
      persistsAcrossReload: false
    };
  }

  vascularEffectSnapshot({ withRecords = true, afterSequence = 0 } = {}) {
    const cursor = Number.isSafeInteger(afterSequence) && afterSequence >= 0 ? afterSequence : 0;
    const last = this.vascularEffectRecords.at(-1) ?? null;
    return {
      pass: 'C0D1-B', schemaVersion: 1,
      sourceCellId: VASCULAR_CELL,
      sequence: this.vascularEffectSequence,
      lastSourceEventSequence: this.lastVascularSourceSequence,
      lastParentSiltReceiptSequence: this.lastVascularParentSiltSequence,
      acceptedTotal: this.vascularEffectAcceptedTotal,
      rejectedTotal: this.vascularEffectRejectedTotal,
      duplicateTotal: this.vascularEffectDuplicateTotal,
      gapRejectedTotal: this.vascularEffectGapRejectedTotal,
      prunedTotal: this.vascularEffectPrunedTotal,
      retainedCount: this.vascularEffectRecords.length,
      lastReceiptId: last?.id ?? null,
      records: withRecords ? this.vascularEffectRecords.filter(e => e.sequence > cursor) : [],
      materialTransfer: false, routeCredit: false, offRouteSimulation: false,
      persistentAcrossCellsInRuntime: true, persistsAcrossReload: false
    };
  }

  /** A read-only downstream view; no Grave state is changed in C0D1-B. */
  forGrave() {
    const channel = this.vascularEffectSnapshot();
    return {
      ...channel,
      inspectedAtCellId: GRAVE_CELL,
      mode: 'authenticated_vascular_applied_effects_read_only',
      graveReceived: false,
      graveStateChanged: false
    };
  }

  snapshot({ withRecords = true } = {}) {
    const last = this.records.at(-1) ?? null;
    return {
      pass: 'LS1E1', schemaVersion: 1,
      sequence: this.sequence,
      lastSourceDecisionSequence: this.lastSourceDecisionSequence,
      acceptedTotal: this.acceptedTotal,
      rejectedTotal: this.rejectedTotal,
      duplicateTotal: this.duplicateTotal,
      prunedTotal: this.prunedTotal,
      retainedCount: this.records.length,
      lastReceiptId: last?.id ?? null,
      lastSubjectId: last?.subjectId ?? null,
      records: withRecords ? [...this.records] : [],
      materialTransfer: false, routeCredit: false,
      persistentAcrossCellsInRuntime: true,
      persistsAcrossReload: false
    };
  }

  forVascular() {
    const last = this.records.at(-1) ?? null;
    return {
      pass: 'LS1E1',
      signalOnly: true,
      mode: 'read_only_provenance_not_physical_arrival',
      sourceCellId: SILT_CELL,
      inspectedAtCellId: VASCULAR_CELL,
      observedCount: this.acceptedTotal,
      mostRecentCauseId: last?.id ?? null,
      mostRecentGrainId: last?.subjectId ?? null,
      mostRecentCause: last ? {...last} : null,
      materialArrived: false,
      circulationChanged: false,
      progressionCredit: false
    };
  }
}
