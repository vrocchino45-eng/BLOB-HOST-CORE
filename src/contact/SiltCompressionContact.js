import { boundedAdd, boundedRecovery } from "../hostCircuit/BoundedAccumulatorBehavior.js";

/**
 * LS1D1D2J — one reversible, spatial Silt-to-Silt contact relationship.
 * Pure state machine. Does not acquire targets, collide, transfer matter,
 * award chemistry, write progression, or move the Core or grain.
 * Position and force semantics are intentionally modest: proximity to one
 * authored catchment patch, plus a directed Pulse toward that patch.
 * At maximum grip extension the tether can resist a directed Pulse without
 * any kinematic displacement; that resistance can still load sediment.
 * D2L adds a local contact brace: once the committed grain truly touches the
 * patch while LT is held, the surface can temporarily retain that *exact*
 * contact position. D2M lets the established relationship resist free-grain
 * displacement on the very first Pulse, and uses Core drift as feedback rather
 * than a second invisible release limit. The original tether limit remains hard.
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
    this.braced = false;
    this.braceAnchor = null;
    this.braceCore = null;
    this.braces = 0;
    this.braceReleases = 0;
    this.lastBraceReason = 'none';
    this.braceCooldownSeconds = 0;
    // This is a visual strain cue, NOT an extra tether or Core movement cap.
    // The original tether envelope remains the hard release authority.
    this.braceMaxCoreDrift = 0.85;
    this.braceTension = 0;
    this.braceDriftWarning = false;
    this.braceMaxTether = 1.58;
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
           pulseAttempted = false, absorbHeld = false,
           braceHeld = false, corePosition = null, bracedPulse = false } = {}) {
    const seconds = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0;
    this.echoSeconds = Math.max(0, this.echoSeconds - seconds);
    this.pressFeedbackSeconds = Math.max(0, this.pressFeedbackSeconds - seconds);
    this.missedFeedbackSeconds = Math.max(0, this.missedFeedbackSeconds - seconds);
    this.braceCooldownSeconds = Math.max(0, this.braceCooldownSeconds - seconds);
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
    const validCore = Array.isArray(corePosition) && corePosition.length === 3
      && corePosition.every(Number.isFinite);
    const separation = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    const clearBrace = reason => {
      if (!this.braced) return;
      this.braced = false;
      this.braceTension = 0;
      this.braceDriftWarning = false;
      this.braceAnchor = null;
      this.braceCore = null;
      this.braceReleases++;
      this.lastBraceReason = reason;
      this.braceCooldownSeconds = Math.max(this.braceCooldownSeconds, 0.38);
      this.echoSeconds = Math.max(this.echoSeconds, 0.55);
      publish('contact-brace-released');
      events.at(-1).reason = reason;
    };
    if (this.heldId !== nextId) {
      clearBrace(nextId ? 'different-material' : 'grip-released');
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
      if (!nextId) this.braceCooldownSeconds = 0;
    }
    // Never maintain a fictional remote contact. Bracing is valid only while
    // the same material is held, LT stays active, and the Core remains near
    // both the engagement point and the existing 1.6-unit tether envelope.
    if (this.braced) {
      const reason = !braceHeld ? 'stabilize-ended'
        : absorbHeld ? 'absorb-withdrawal'
        : !validPosition || !validCore ? 'position-unavailable'
        : separation(corePosition,this.braceAnchor) > this.braceMaxTether ? 'tether-range'
        : !this.near(heldPosition) ? 'contact-lost'
        : separation(heldPosition,this.braceAnchor) > 0.14 ? 'contact-slipped'
        : null;
      if (reason) clearBrace(reason);
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
    if (touching && !this.braced && this.braceCooldownSeconds === 0 &&
        braceHeld && !absorbHeld && validCore &&
        separation(heldPosition,corePosition) <= this.braceMaxTether) {
      // Snap nothing: the only anchor allowed is where the held grain actually
      // touched the authored patch. Contact is achieved before the brace.
      this.braced = true;
      this.braceAnchor = [...heldPosition];
      this.braceCore = [...corePosition];
      this.braces++;
      this.braceTension = 0;
      this.braceDriftWarning = false;
      this.lastBraceReason = 'engaged';
      this.echoSeconds = Math.max(this.echoSeconds, 0.75);
      publish('contact-brace-engaged');
    }
    // D2M: moving the Core should not spontaneously flick the held material
    // off a *real* contact. The old 0.85 drift threshold is now a visible
    // strain warning. Actual release remains at the existing tether boundary.
    if (this.braced && validCore) {
      const tetherDistance = separation(corePosition, this.braceAnchor);
      this.braceTension = Math.max(0, Math.min(1, (tetherDistance - 1.13) / 0.45));
      this.braceDriftWarning = separation(corePosition, this.braceCore) > this.braceMaxCoreDrift
        || tetherDistance >= this.braceMaxTether - 0.16;
    }
    const approach = Number.isFinite(pulseApproach) ? Math.max(0, pulseApproach) : 0;
    const resisted = Number.isFinite(resistedPulseApproach) ? Math.max(0, resistedPulseApproach) : 0;
    // An explicitly supplied accepted approach is itself a Pulse receipt;
    // keep pure-state callers compatible with the D2J contract.
    if ((pulseAttempted || approach > 0.012 || resisted > 0.012 || bracedPulse) && nextId) {
      // A directed resisted Pulse is meaningful pressure, but only while the
      // *committed grain* really overlaps the patch. No remote loading.
      const validMove = approach > 0.012;
      const validResistance = resisted > 0.012;
      const mode = this.braced && bracedPulse ? 'stabilized-brace'
        : validMove ? 'approach' : validResistance ? 'tether-resistance' : 'none';
      this.lastPulseMode = mode;
      if (touching && !absorbHeld && mode !== 'none') {
        // C0C3: same accepted Pulse, bounded C01 math; Silt still owns eligibility.
        this.pressure = boundedAdd(this.pressure, this.pressurePerPulse, { lower: 0, upper: 1 });
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
    if (this.pressure > 0 && (!this.braced || absorbHeld)) {
      // C0C3: use the same already-capped seconds and owner-selected rate.
      this.pressure = boundedRecovery(this.pressure, {
        dt: seconds, rate: absorbHeld ? 1.4 : 0.8,
        law: 'linear', maxStepSeconds: 0.1, lower: 0, upper: 1
      });
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
      pass: 'LS1D1D2M', patchId: 'silt-garden-catchment-contact',
      heldId: this.heldId, inContact: this.inContact,
      braced: this.braced, braceAnchor: this.braceAnchor && [...this.braceAnchor],
      braces: this.braces, braceReleases: this.braceReleases,
      lastBraceReason: this.lastBraceReason,
      braceTension: Number(this.braceTension.toFixed(3)),
      braceDriftWarning: this.braceDriftWarning,
      braceCooldownSeconds: Number(this.braceCooldownSeconds.toFixed(3)),
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
