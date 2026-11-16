/**
 * C0D1-C — Grave I owned, bounded memory of authenticated Vascular effects.
 * This owner is dormant off-route. It stores observed applied-change magnitude;
 * it does not tick Vascular, invent material, alter Grave objectives, award
 * progression, persist saves or touch the distinct Grave II resonance field.
 */
import { boundedAdd } from '../hostCircuit/BoundedAccumulatorBehavior.js';

const GRAVE_CELL = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const VASCULAR_CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const SILT_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
const validId = id => typeof id === 'string' && /^silt-grain-0[1-8]$/.test(id);

export class GraveVascularEffectMemory {
  constructor({ limit = 64 } = {}) {
    this.limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 256) : 64;
    this.records = [];
    this.lastHostSequence = 0;
    this.receivedTotal = 0;
    this.replayedTotal = 0;
    this.rejectedTotal = 0;
    this.gapRejectedTotal = 0;
    this.prunedTotal = 0;
    this.memoryPressure = 0;
    this.lastParentSiltReceiptId = null;
    this.lastVascularEffectId = null;
    this.lastSubjectId = null;
    // CONNECTION27: observation of a measured positive local retention change.
    // This is not another receipt and is intentionally outside legacy snapshots.
    this.lastPositiveReception = null;
  }

  /** Called only from Grave I's mounted update, never by an off-route tick. */
  receiveFromHost(hostLedger) {
    if (!hostLedger || typeof hostLedger.forGrave !== 'function') return 0;
    const view = hostLedger.forGrave();
    if (!view || view.pass !== 'C0D1-B' || view.schemaVersion !== 1 ||
        view.sourceCellId !== VASCULAR_CELL || view.inspectedAtCellId !== GRAVE_CELL ||
        view.mode !== 'authenticated_vascular_applied_effects_read_only' ||
        !Array.isArray(view.records)) {
      this.rejectedTotal++;
      return 0;
    }
    let accepted = 0;
    for (const record of view.records) {
      if (this.receiveRecord(record)) accepted++;
    }
    return accepted;
  }

  receiveRecord(e) {
    if (!e || !Number.isSafeInteger(e.sequence) || e.sequence < 1 ||
        e.schemaVersion !== 1 || e.kind !== 'vascular_membrane_load_change_applied' ||
        e.sourceCellId !== VASCULAR_CELL || e.sourceSystem !== 'VascularSiltSignalReceiver' ||
        !Number.isSafeInteger(e.sourceEventSequence) || e.sourceEventSequence < 1 ||
        e.id !== `${VASCULAR_CELL}:membrane-load-applied:${e.sourceEventSequence}` ||
        e.parentSiltReceiptId !== `${SILT_CELL}:silt-trajectory:${e.parentSiltDecisionSequence}` ||
        !Number.isSafeInteger(e.parentSiltReceiptSequence) || e.parentSiltReceiptSequence < 1 ||
        !Number.isSafeInteger(e.parentSiltDecisionSequence) || e.parentSiltDecisionSequence < 1 ||
        !validId(e.subjectId) || !Number.isFinite(e.membraneLoadBefore) ||
        !Number.isFinite(e.membraneLoadAfter) || !Number.isFinite(e.appliedDelta) ||
        e.membraneLoadBefore < 0 || e.membraneLoadBefore >= 0.85 ||
        e.membraneLoadAfter > 0.85 || e.membraneLoadAfter <= e.membraneLoadBefore ||
        e.appliedDelta <= 0 || e.appliedDelta > 0.19500001 ||
        Math.abs(e.appliedDelta - (e.membraneLoadAfter - e.membraneLoadBefore)) > 1e-10 ||
        e.materialTransfer !== false || e.routeCredit !== false ||
        e.offRouteSimulation !== false) {
      this.rejectedTotal++;
      return null;
    }
    if (e.sequence <= this.lastHostSequence) {
      this.replayedTotal++;
      return null;
    }
    // Do not silently skip lost Host events if its bounded ring rolled over.
    if (e.sequence !== this.lastHostSequence + 1) {
      this.gapRejectedTotal++;
      return null;
    }
    const record = Object.freeze({
      sequence: e.sequence,
      vascularEffectId: e.id,
      vascularEventSequence: e.sourceEventSequence,
      parentSiltReceiptId: e.parentSiltReceiptId,
      subjectId: e.subjectId,
      appliedDelta: e.appliedDelta,
      observedMembraneLoadAfter: e.membraneLoadAfter,
      materialTransfer: false,
      routeCredit: false
    });
    this.records.push(record);
    this.lastHostSequence = e.sequence;
    this.receivedTotal++;
    const memoryPressureBefore = this.memoryPressure;
    this.memoryPressure = boundedAdd(this.memoryPressure, e.appliedDelta, {upper: 1});
    if (this.memoryPressure > memoryPressureBefore) {
      this.lastPositiveReception = Object.freeze({
        record, memoryPressureBefore, memoryPressureAfter: this.memoryPressure,
        memoryDelta: this.memoryPressure - memoryPressureBefore
      });
    }
    this.lastVascularEffectId = e.id;
    this.lastParentSiltReceiptId = e.parentSiltReceiptId;
    this.lastSubjectId = e.subjectId;
    if (this.records.length > this.limit) {
      this.records.shift();
      this.prunedTotal++;
    }
    return record;
  }

  snapshot({ active = false } = {}) {
    return {
      pass: 'C0D1-C', schemaVersion: 1,
      owner: 'GraveMemoryRouteSystem', cellId: GRAVE_CELL,
      active: Boolean(active),
      mode: 'bounded_retained_vascular_effect_memory',
      receivedTotal: this.receivedTotal,
      lastHostSequence: this.lastHostSequence,
      replayedTotal: this.replayedTotal,
      rejectedTotal: this.rejectedTotal,
      gapRejectedTotal: this.gapRejectedTotal,
      prunedTotal: this.prunedTotal,
      retainedCount: this.records.length,
      memoryPressure: this.memoryPressure,
      lastVascularEffectId: this.lastVascularEffectId,
      lastParentSiltReceiptId: this.lastParentSiltReceiptId,
      lastSubjectId: this.lastSubjectId,
      records: this.records.map(r => ({...r})),
      gameplayConsequenceApplied: false,
      graveObjectivesChanged: false,
      materialTransfer: false, routeCredit: false,
      persistsAcrossCellMountsInRuntime: true, persistsAcrossReload: false
    };
  }
}
