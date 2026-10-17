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
    this.seats = 0;
    this.extractions = 0;
    this.lastOutcome = 'idle';
    this.sequence = 0;
  }
  isSeated(id) { return Boolean(this.unitId && id === this.unitId); }
  trySeat({ unitId, heldPosition, isBraced, imprinted, actuallyTouching } = {}) {
    if (this.unitId || typeof unitId !== 'string' || !unitId || !finitePoint(heldPosition) ||
        !isBraced || !imprinted || !actuallyTouching) return null;
    this.unitId = unitId;
    this.position = [...heldPosition];
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
    this.extractions++;
    this.sequence++;
    this.lastOutcome = 'extracted';
    return receipt;
  }
  receipt(outcome) {
    return { outcome, unitId: this.unitId, siteId: this.siteId,
      seatPosition: this.position && [...this.position],
      ledgerOwner: 'environment', conservedMass: true, progressionCredit: false };
  }
  snapshot() {
    return { pass: 'LS1D1D2N1', siteId: this.siteId, occupied: Boolean(this.unitId),
      unitId: this.unitId, position: this.position && [...this.position],
      seats: this.seats, extractions: this.extractions, lastOutcome: this.lastOutcome,
      sequence: this.sequence, owner: 'environment', representation: 'individual',
      physicsAttachment: false, progressionCredit: false };
  }
}
