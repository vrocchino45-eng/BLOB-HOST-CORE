/** VASCULAR-II1: bounded, route-owned send/receive goal state.
 * No material, player movement, input polling, credit counting or off-route clock.
 * The route supplies eligibility, real valve proximity and normalized input.
 */
export class VascularReturnHandoff {
  constructor() {
    this.started = false;
    this.completed = false;
    this.published = false;
    this.sourceHold = 0;
    this.sourceHoldAtProjection = 0;
    this.sourcePulseId = null;
    this.pulseCursor = 0;
    this.needsPulseBaseline = true;
    this.handoffId = null;
    this.travelSeconds = 0;
    this.settleSeconds = 0;
    this.completionSequence = 0;
  }

  suspend() {
    this.sourceHold = 0;
    this.needsPulseBaseline = true;
  }

  update(dt, { eligible = false, suspended = false, sourceNear = false,
    receiverNear = false, stabilizeHeld = false, pulsePressed = false,
    pulseEventId = 0 } = {}) {
    if (!eligible || suspended) { this.suspend(); return; }
    this.started = true;
    const seconds = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.08)) : 0;
    const id = Number.isSafeInteger(pulseEventId) && pulseEventId >= 0 ? pulseEventId : 0;
    const baseline = this.needsPulseBaseline;
    if (baseline) { this.pulseCursor = id; this.needsPulseBaseline = false; }
    const freshPulse = !baseline && pulsePressed && id > this.pulseCursor;
    this.pulseCursor = Math.max(this.pulseCursor, id);
    if (this.completed) return;

    if (!this.handoffId) {
      this.sourceHold = stabilizeHeld && sourceNear
        ? Math.min(0.18, this.sourceHold + seconds) : 0;
      if (freshPulse && this.sourceHold >= 0.18 && sourceNear && stabilizeHeld) {
        this.handoffId = 'vascular:handoff:1';
        this.sourcePulseId = id;
        this.sourceHoldAtProjection = this.sourceHold;
      }
      return;
    }

    // An accepted send persists; arriving alone never completes the handoff.
    this.travelSeconds = Math.min(2, this.travelSeconds + seconds);
    if (this.travelSeconds < 2) return;
    this.settleSeconds = stabilizeHeld && receiverNear
      ? Math.min(0.75, this.settleSeconds + seconds)
      : Math.max(0, this.settleSeconds - seconds * 1.5);
    if (this.settleSeconds >= 0.75) {
      this.completed = true;
      this.completionSequence += 1;
    }
  }

  snapshot({ eligible = false, active = false } = {}) {
    const stage = this.completed ? 'completed' : !this.started ? 'dormant'
      : !this.handoffId ? 'source_relationship'
        : this.travelSeconds < 2 ? 'handoff_travel'
          : this.settleSeconds > 0 ? 'receiver_settling' : 'receiver_pending';
    return { pass: 'VASCULAR-II1', eligible, active, stage,
      completed: this.completed, completionPublished: this.published,
      handoffId: this.handoffId, sourcePulseId: this.sourcePulseId,
      sourceHoldSeconds: this.sourceHold,
      sourceHoldAtProjection: this.sourceHoldAtProjection,
      travelProgress: this.travelSeconds / 2,
      settleProgress: this.settleSeconds / 0.75,
      completionSequence: this.completionSequence,
      sourceRole: 'branch', receiverRole: 'intake',
      completionKey: 'vascular:phase_2', materialTransfer: false,
      offRouteSimulation: false, crossingAuthority: false };
  }
}
