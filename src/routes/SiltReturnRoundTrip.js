/** SILT-II1: observe a fresh same-grain journey. No material or physics writes.
 * One bounded attempt, monotonic receipt cursor, and one completion publication.
 */
const validId = id => typeof id === 'string' && /^silt-grain-0[1-8]$/.test(id);
const emptyProof = () => ({ grip: null, imprint: null, seat: null, extract: null, release: null });
export class SiltReturnRoundTrip {
  constructor() {
    this.started = false;
    this.active = false;
    this.cursor = 0;
    this.activationSequence = null;
    this.grainId = null;
    this.attemptSequence = 0;
    this.stage = 'await_grip';
    this.proof = emptyProof();
    this.completed = false;
    this.published = false;
    this.completionSequence = 0;
  }
  context({ eligible = false, suspended = false, sequence = 0 } = {}) {
    const active = Boolean(eligible && !suspended);
    if (active && !this.active) this.cursor = Math.max(this.cursor, sequence);
    if (active && !this.started) {
      this.started = true;
      this.activationSequence = sequence;
    }
    this.active = active;
  }
  suspend() { this.active = false; }
  observe(event) {
    if (!this.active || this.completed || !Number.isSafeInteger(event?.sequence)
        || event.sequence <= this.cursor) return;
    this.cursor = event.sequence;
    const id = event.unitId ?? event.heldGrainId;
    if (!validId(id)) return;
    const acquired = event.kind === 'held-material-motion'
      && event.outcome === 'acquired-with-outward-headroom' && event.verb === 'grip';
    if (acquired) {
      if (['seated', 'extracted', 'released_pending_native'].includes(this.stage)) {
        if (id === this.grainId && this.stage === 'released_pending_native') {
          this.stage = 'extracted';
          this.proof.release = null;
        }
        return;
      }
      this.grainId = id;
      this.attemptSequence++;
      this.proof = { ...emptyProof(), grip: event.sequence };
      this.stage = 'gripped';
      return;
    }
    if (id !== this.grainId) return;
    if (event.kind === 'silt-contact' && event.outcome === 'temporary-imprint-formed'
        && this.stage === 'gripped') {
      this.proof.imprint = event.sequence;
      this.stage = 'imprinted';
    } else if (event.kind === 'silt-contact' && event.outcome === 'temporary-imprint-relaxed'
        && this.stage === 'imprinted') {
      this.proof.imprint = null;
      this.stage = 'gripped';
    } else if (event.kind === 'silt-seat' && event.outcome === 'plate-seated'
        && this.stage === 'imprinted') {
      this.proof.seat = event.sequence;
      this.stage = 'seated';
    } else if (event.kind === 'silt-seat' && event.outcome === 'plate-extracted'
        && this.stage === 'seated') {
      this.proof.extract = event.sequence;
      this.stage = 'extracted';
    } else if (event.kind === 'silt-trajectory'
        && event.outcome === 'released-with-trajectory'
        && event.reason === 'deliberate-release'
        && event.noMaterialTransfer === true && event.progressionCredit === false) {
      if (this.stage === 'extracted' || this.stage === 'released_pending_native') {
        this.proof.release = event.sequence;
        this.stage = 'released_pending_native';
      } else if (this.stage === 'gripped' || this.stage === 'imprinted') {
        this.grainId = null;
        this.proof = emptyProof();
        this.stage = 'await_grip';
      }
    }
  }
  observeNative({ unit, owner, heldId, seatedId, mass } = {}) {
    if (!this.active || this.completed || this.stage !== 'released_pending_native'
        || unit?.unitId !== this.grainId || !unit.nearNative || !(unit.seconds > 0)
        || unit.releaseReason !== 'deliberate-release' || owner !== 'environment'
        || heldId === this.grainId || seatedId === this.grainId || mass !== 8) return;
    this.completed = true;
    this.stage = 'completed';
    this.completionSequence++;
  }
  snapshot() {
    return { pass: 'SILT-II1', active: this.active, started: this.started,
      stage: this.stage, grainId: this.grainId, attemptSequence: this.attemptSequence,
      activationSequence: this.activationSequence, consumedSequence: this.cursor,
      proof: { ...this.proof }, completed: this.completed,
      completionPublished: this.published, completionSequence: this.completionSequence,
      completionKey: 'silt:phase_2', materialTransfer: false,
      physicsAuthority: false, offRouteSimulation: false };
  }
}
