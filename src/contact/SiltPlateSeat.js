/**
 * LS1D1D2N1: one deliberately authored receiving relationship for Silt.
 * Not a material owner, collider, physics joint, chemical bond or route reward.
 * The existing environment remains the material ledger owner while seated.
 * Position is retained in the one patch's *route-local* coordinates.
 */
const finitePoint = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
export class SiltPlateSeat {
  constructor({ siteId = 'silt-garden-catchment-contact' } = {}) {
    this.siteId = siteId;
    this.unitId = null;
    this.position = null;
    this.contactPosition = null;
    this.seats = 0;
    this.extractions = 0;
    this.lastOutcome = 'idle';
    this.sequence = 0;
  }
  isSeated(id) { return Boolean(this.unitId && id === this.unitId); }
  trySeat({ unitId, heldPosition, sitePosition, isBraced, imprinted, actuallyTouching } = {}) {
    if (this.unitId || typeof unitId !== 'string' || !unitId || !finitePoint(heldPosition) ||
        !isBraced || !imprinted || !actuallyTouching) return null;
    this.unitId = unitId;
    // Preserve the authentic contact location separately from the stable
    // presentation/receiving-site position. No grip or ledger owner is changed
    // by this visual settle: the exact same material unit remains seated.
    this.contactPosition = [...heldPosition];
    if (finitePoint(sitePosition)) {
      const dx = heldPosition[0] - sitePosition[0];
      const dz = heldPosition[2] - sitePosition[2];
      const len = Math.hypot(dx, dz);
      // All final positions are inside the actual plate instead of allowing
      // rim hits or a depressed patch to hide the grain in geology.
      const factor = len > 1e-6 ? Math.min(0.32, len * 0.45) / len : 0;
      this.position = [sitePosition[0] + dx * factor,
        sitePosition[1] + 0.22, sitePosition[2] + dz * factor];
    } else {
      // Backward-compatible pure helper for callers without an authored site.
      this.position = [...heldPosition];
    }
    this.seats++;
    this.sequence++;
    this.lastOutcome = 'seated';
    return this.receipt('plate-seated');
  }
  tryExtract({ unitId, gripAccepted } = {}) {
    if (!gripAccepted || !this.isSeated(unitId)) return null;
    const receipt = this.receipt('plate-extracted');
    this.unitId = null;
    this.position = null;
    this.contactPosition = null;
    this.extractions++;
    this.sequence++;
    this.lastOutcome = 'extracted';
    return receipt;
  }
  receipt(outcome) {
    return { outcome, unitId: this.unitId, siteId: this.siteId,
      seatPosition: this.position && [...this.position],
      contactPosition: this.contactPosition && [...this.contactPosition],
      ledgerOwner: 'environment', conservedMass: true, progressionCredit: false };
  }
  snapshot() {
    return { pass: 'LS1D1D2N1', siteId: this.siteId, occupied: Boolean(this.unitId),
      unitId: this.unitId, position: this.position && [...this.position],
      contactPosition: this.contactPosition && [...this.contactPosition],
      seats: this.seats, extractions: this.extractions, lastOutcome: this.lastOutcome,
      sequence: this.sequence, owner: 'environment', representation: 'individual',
      physicsAttachment: false, progressionCredit: false };
  }
}
