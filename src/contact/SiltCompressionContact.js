/**
 * LS1D1D2J — one reversible, spatial Silt-to-Silt contact relationship.
 * Pure state machine. Does not acquire targets, collide, transfer matter,
 * award chemistry, write progression, or move the Core or grain.
 * Position and force semantics are intentionally modest: proximity to one
 * authored catchment patch, plus an accepted Pulse that approaches the patch.
 */
export class SiltCompressionContact {
  constructor({ position, horizontalRadius = 0.82, minHeight = -0.18,
                maxHeight = 0.64, pressurePerPulse = 0.42,
                imprintThreshold = 0.80 } = {}) {
    if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) {
      throw new Error('[SiltCompressionContact] finite contact position required');
    }
    this.position = [...position];
    this.horizontalRadius = horizontalRadius;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.pressurePerPulse = pressurePerPulse;
    this.imprintThreshold = imprintThreshold;
    this.heldId = null;
    this.inContact = false;
    this.pressure = 0;
    this.imprinted = false;
    this.echoSeconds = 0;
    this.contacts = 0;
    this.presses = 0;
    this.imprints = 0;
    this.separations = 0;
    this.lastOutcome = 'idle';
  }

  near(position) {
    if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) return false;
    const dx = position[0] - this.position[0];
    const dz = position[2] - this.position[2];
    const height = position[1] - this.position[1];
    return Math.hypot(dx, dz) <= this.horizontalRadius
      && height >= this.minHeight && height <= this.maxHeight;
  }

  update({ dt = 0, heldId = null, heldPosition = null,
           pulseApproach = 0, absorbHeld = false } = {}) {
    const seconds = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0;
    this.echoSeconds = Math.max(0, this.echoSeconds - seconds);
    const events = [];
    const publish = outcome => {
      this.lastOutcome = outcome;
      events.push({ outcome, unitId: this.heldId, pressure: Number(this.pressure.toFixed(3)),
                    reversible: true, massTransfer: false, progressionCredit: false });
    };
    const nextId = typeof heldId === 'string' && heldId ? heldId : null;
    if (this.heldId !== nextId) {
      if (this.inContact || this.pressure > 0) {
        publish('contact-released');
        this.separations++;
        this.echoSeconds = Math.max(this.echoSeconds, 1.6);
      }
      this.heldId = nextId;
      this.inContact = false;
      this.pressure = 0;
      this.imprinted = false;
    }
    const touching = Boolean(nextId && this.near(heldPosition));
    if (touching && !this.inContact) {
      this.inContact = true;
      this.contacts++;
      publish('contact-entered');
    } else if (!touching && this.inContact) {
      this.inContact = false;
      this.separations++;
      this.echoSeconds = Math.max(this.echoSeconds, 1.6);
      publish('contact-separated');
    }
    const approach = Number.isFinite(pulseApproach) ? pulseApproach : 0;
    if (touching && approach > 0.012 && !absorbHeld) {
      this.pressure = Math.min(1, this.pressure + this.pressurePerPulse);
      this.presses++;
      this.echoSeconds = Math.max(this.echoSeconds, 0.45);
      publish('contact-pressed');
      if (this.pressure >= this.imprintThreshold && !this.imprinted) {
        this.imprinted = true;
        this.imprints++;
        this.echoSeconds = 1.9;
        publish('temporary-imprint-formed');
      }
    } else if (this.pressure > 0 && (!touching || absorbHeld)) {
      this.pressure = Math.max(0, this.pressure - seconds * (absorbHeld ? 1.4 : 0.8));
      if (this.imprinted && this.pressure < 0.15) {
        this.imprinted = false;
        this.echoSeconds = Math.max(this.echoSeconds, 0.8);
        publish('temporary-imprint-relaxed');
      }
    }
    return events;
  }

  snapshot() {
    return {
      pass: 'LS1D1D2J', patchId: 'silt-garden-catchment-contact',
      heldId: this.heldId, inContact: this.inContact,
      pressure: Number(this.pressure.toFixed(4)), imprinted: this.imprinted,
      echoSeconds: Number(this.echoSeconds.toFixed(3)),
      contacts: this.contacts, presses: this.presses,
      imprints: this.imprints, separations: this.separations,
      lastOutcome: this.lastOutcome, position: [...this.position],
      massTransfer: false, collisionAuthorityChanged: false,
      progressionCredit: false, response: 'reversible_sediment_imprint'
    };
  }
}
