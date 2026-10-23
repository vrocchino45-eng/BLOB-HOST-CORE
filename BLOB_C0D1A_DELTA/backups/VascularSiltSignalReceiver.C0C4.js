import { boundedAdd, boundedRecovery } from '../hostCircuit/BoundedAccumulatorBehavior.js';

/**
 * LS1E2 — Vascular-owned receiver for verified Host/Silt disturbance receipts.
 * The Host ledger remains the sole provenance authority; this is a *local*
 * response, not material transfer, persisted off-route simulation or credit.
 * Its bounded signal load is an environmental membrane condition, NOT Silt mass.
 */
const SILT_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR_CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const finite3 = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
const round = n => Number(n.toFixed(4));

export class VascularSiltSignalReceiver {
  constructor() {
    this.lastSequence = 0;
    this.receivedTotal = 0;
    this.gapTotal = 0;
    this.membraneLoad = 0;
    this.lastReceiptId = null;
    this.lastSubjectId = null;
    this.recentReceipts = [];
  }

  // Only called by the Vascular route while mounted. No off-route updates.
  receive(ledger) {
    if (ledger?.pass !== 'LS1E1' || !Array.isArray(ledger.records)) return 0;
    const fresh = ledger.records.filter(r => Number.isSafeInteger(r?.sequence) && r.sequence > this.lastSequence)
      .sort((a, b) => a.sequence - b.sequence);
    if (fresh.length && fresh[0].sequence > this.lastSequence + 1) {
      this.gapTotal += fresh[0].sequence - (this.lastSequence + 1);
    }
    let accepted = 0;
    for (const receipt of fresh) {
      // Advance across malformed / incompatible receipts, never let them apply.
      if (receipt.sequence <= this.lastSequence) continue;
      this.lastSequence = receipt.sequence;
      if (receipt.schemaVersion !== 1 || receipt.sourceCellId !== SILT_CELL ||
          receipt.sourceSystem !== 'SiltPressureRouteSystem' ||
          receipt.kind !== 'silt_material_disturbance_observed' ||
          receipt.effectType !== 'observed_only' ||
          receipt.materialTransfer !== false || receipt.routeCredit !== false ||
          receipt.worldConsequence !== false || receipt.targetCellId !== null ||
          !/^silt-grain-0[1-8]$/.test(receipt.subjectId ?? '') ||
          !Number.isSafeInteger(receipt.sourceReceiptSequence) || receipt.sourceReceiptSequence < 1 ||
          receipt.id !== `${SILT_CELL}:silt-trajectory:${receipt.sourceReceiptSequence}` ||
          !finite3(receipt.releaseVelocity) || !finite3(receipt.origin)) continue;
      // Signal amplitude is finite and capped, derived from a verified release.
      const speed = Math.hypot(...receipt.releaseVelocity);
      const increment = 0.14 + 0.055 * clamp(speed / 2.5, 0, 1);
      this.membraneLoad = boundedAdd(this.membraneLoad, increment, { lower: 0, upper: 0.85 });
      this.receivedTotal += 1;
      this.lastReceiptId = receipt.id;
      this.lastSubjectId = receipt.subjectId;
      this.recentReceipts.push({sequence: this.receivedTotal, receiptId: receipt.id, subjectId: receipt.subjectId, loadAfter: round(this.membraneLoad)});
      if (this.recentReceipts.length > 32) this.recentReceipts.shift();
      accepted++;
    }
    return accepted;
  }

  update(dt) {
    if (Number.isFinite(dt) && dt > 0) {
      // Relax only while Vascular is mounted. This is not hidden-cell physics.
      this.membraneLoad = boundedRecovery(this.membraneLoad, {
        dt, rate: 0.018, law: 'exponential', maxStepSeconds: 0.25,
        lower: 0, upper: 0.85, cutoff: 0.0001
      });
    }
  }

  get flowScale() {
    // At maximum load, Vascular's *own* directional current is ~7% lower.
    return 1 - this.membraneLoad * 0.085;
  }

  snapshot() {
    return {
      pass: 'LS1E2', owner: 'VascularRhythmRouteSystem',
      sourceCellId: SILT_CELL, receiverCellId: VASCULAR_CELL,
      mode: 'bounded_local_membrane_response',
      receivedTotal: this.receivedTotal, lastSourceSequence: this.lastSequence,
      sourceReceiptGaps: this.gapTotal,
      lastReceiptId: this.lastReceiptId, lastSubjectId: this.lastSubjectId,
      membraneLoad: round(this.membraneLoad),
      directionalFlowScale: round(this.flowScale),
      localResponseApplied: this.receivedTotal > 0,
      recentReceipts: this.recentReceipts.map(r => ({...r})),
      noMaterialArrival: true, noNewMaterial: true,
      altersProgression: false, altersCadenceReads: false,
      persistsAcrossCellMountsInRuntime: true, persistsAcrossReload: false
    };
  }
}
