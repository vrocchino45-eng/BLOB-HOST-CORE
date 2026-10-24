/**
 * LS1E1 — authoritative provenance for events, NOT material transport.
 * Host connection records survive local-cell unmount/remount for this runtime
 * instance. Only a verified Silt release receipt is accepted. No update loop,
 * off-route simulation, progression, material ownership or save file effects.
 */
const SILT_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR_CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
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
