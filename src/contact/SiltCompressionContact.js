/**
 * LS1D1D2J — one reversible, spatial Silt-to-Silt contact relationship.
 * Pure state machine. Does not acquire targets, collide, transfer matter,
 * award chemistry, write progression, or move the Core or grain.
 * Position and force semantics are intentionally modest: proximity to one
 * authored catchment patch, plus a directed Pulse toward that patch.
 * At maximum grip extension the tether can resist a directed Pulse without
 * any kinematic displacement; that resistance can still load sediment.
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
    this.lastPulseOutcome = 'none';
    this.lastPulseReason = 'none';
    this.lastPulseMode = 'none';
    this.pressFeedbackSeconds = 0;
    this.missedFeedbackSeconds = 0;
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
           pulseApproach = 0, resistedPulseApproach = 0,
           pulseAttempted = false, absorbHeld = false } = {}) {
    const seconds = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0;
    this.echoSeconds = Math.max(0, this.echoSeconds - seconds);
    this.pressFeedbackSeconds = Math.max(0, this.pressFeedbackSeconds - seconds);
    this.missedFeedbackSeconds = Math.max(0, this.missedFeedbackSeconds - seconds);
    const events = [];
    const publish = outcome => {
      this.lastOutcome = outcome;
      events.push({ outcome, unitId: this.heldId, pressure: Number(this.pressure.toFixed(3)),
                    reversible: true, massTransfer: false, progressionCredit: false });
    };
    const nextId = typeof heldId === 'string' && heldId ? heldId : null;
    const validPosition = Array.isArray(heldPosition) && heldPosition.length === 3
      && heldPosition.every(Number.isFinite);
    const horizontalDistance = validPosition ? Math.hypot(
      heldPosition[0] - this.position[0], heldPosition[2] - this.position[2]) : null;
    const heightOffset = validPosition ? heldPosition[1] - this.position[1] : null;
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
      this.lastPulseOutcome = 'none';
      this.lastPulseReason = 'none';
      this.lastPulseMode = 'none';
      this.pressFeedbackSeconds = 0;
      this.missedFeedbackSeconds = 0;
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
    const approach = Number.isFinite(pulseApproach) ? Math.max(0, pulseApproach) : 0;
    const resisted = Number.isFinite(resistedPulseApproach) ? Math.max(0, resistedPulseApproach) : 0;
    // An explicitly supplied accepted approach is itself a Pulse receipt;
    // keep pure-state callers compatible with the D2J contract.
    if ((pulseAttempted || approach > 0.012 || resisted > 0.012) && nextId) {
      // A directed resisted Pulse is meaningful pressure, but only while the
      // *committed grain* really overlaps the patch. No remote loading.
      const validMove = approach > 0.012;
      const validResistance = resisted > 0.012;
      const mode = validMove ? 'approach' : validResistance ? 'tether-resistance' : 'none';
      this.lastPulseMode = mode;
      if (touching && !absorbHeld && mode !== 'none') {
        this.pressure = Math.min(1, this.pressure + this.pressurePerPulse);
        this.presses++;
        this.echoSeconds = Math.max(this.echoSeconds, 0.45);
        this.pressFeedbackSeconds = 0.6;
        this.missedFeedbackSeconds = 0;
        this.lastPulseReason = 'loaded';
        this.lastPulseOutcome = 'contact-pressed';
        publish('contact-pressed');
        events.at(-1).pressMode = mode;
        events.at(-1).horizontalDistance = Number(horizontalDistance.toFixed(3));
        events.at(-1).heightOffset = Number(heightOffset.toFixed(3));
        if (this.pressure >= this.imprintThreshold && !this.imprinted) {
          this.imprinted = true;
          this.imprints++;
          this.echoSeconds = 1.9;
          this.lastPulseOutcome = 'temporary-imprint-formed';
          publish('temporary-imprint-formed');
          events.at(-1).pressMode = mode;
        }
      } else {
        this.lastPulseReason = absorbHeld ? 'absorb-held'
          : !touching ? (horizontalDistance !== null && horizontalDistance > this.horizontalRadius
            ? 'outside-radius' : 'outside-height') : 'away-or-tangent';
        this.lastPulseOutcome = 'contact-pulse-not-loaded';
        // Keep diagnostics local to the patch; don't fill the event ring with
        // ordinary Silt Pulse attempts from elsewhere in the habitat.
        const inApproachArea = this.inApproachArea(heldPosition);
        if (touching || inApproachArea) {
          this.missedFeedbackSeconds = touching ? 0.32 : 0;
          publish('contact-pulse-not-loaded');
          events.at(-1).reason = this.lastPulseReason;
          events.at(-1).pressMode = mode;
          events.at(-1).horizontalDistance = horizontalDistance === null
            ? null : Number(horizontalDistance.toFixed(3));
          events.at(-1).heightOffset = heightOffset === null
            ? null : Number(heightOffset.toFixed(3));
        }
      }
    }
    if (this.pressure > 0 && (!touching || absorbHeld)) {
      this.pressure = Math.max(0, this.pressure - seconds * (absorbHeld ? 1.4 : 0.8));
      if (this.imprinted && this.pressure < 0.15) {
        this.imprinted = false;
        this.echoSeconds = Math.max(this.echoSeconds, 0.8);
        publish('temporary-imprint-relaxed');
      }
    }
    return events;
  }

  inApproachArea(position) {
    if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) return false;
    const horizontal = Math.hypot(position[0] - this.position[0], position[2] - this.position[2]);
    const height = position[1] - this.position[1];
    return horizontal <= this.horizontalRadius + 0.42
      && height >= this.minHeight - 0.3 && height <= this.maxHeight + 0.3;
  }

  snapshot() {
    return {
      pass: 'LS1D1D2K', patchId: 'silt-garden-catchment-contact',
      heldId: this.heldId, inContact: this.inContact,
      pressure: Number(this.pressure.toFixed(4)), imprinted: this.imprinted,
      echoSeconds: Number(this.echoSeconds.toFixed(3)),
      contacts: this.contacts, presses: this.presses,
      imprints: this.imprints, separations: this.separations,
      lastOutcome: this.lastOutcome, lastPulseOutcome: this.lastPulseOutcome,
      lastPulseReason: this.lastPulseReason, lastPulseMode: this.lastPulseMode,
      pressFeedbackSeconds: Number(this.pressFeedbackSeconds.toFixed(3)),
      missedFeedbackSeconds: Number(this.missedFeedbackSeconds.toFixed(3)),
      position: [...this.position],
      massTransfer: false, collisionAuthorityChanged: false,
      progressionCredit: false, response: 'reversible_sediment_imprint'
    };
  }
}
