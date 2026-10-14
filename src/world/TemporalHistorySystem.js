/** LS1D0: observation only. No progression, wall-clock, or material authority. */
export class TemporalHistorySystem {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.elapsed = 0;
    this.exposure = Object.create(null);
    this.lastRuntime = null;
  }

  init() {
    this.lastRuntime = Math.max(0, Number(this.frameState.runtimeSeconds) || 0);
    this.frameState.temporalHistory = this.snapshot();
  }

  update(_dt, frameState = this.frameState) {
    const now = Math.max(0, Number(frameState.runtimeSeconds) || 0);
    // Derive elapsed time from the authoritative simulation clock, never wall time.
    // A backwards clock starts a new interval, not negative exposure.
    const delta = this.lastRuntime === null ? 0 : Math.max(0, now - this.lastRuntime);
    this.lastRuntime = now;
    this.elapsed += delta;
    const cell = String(frameState.activeCellId || 'none');
    if (cell !== 'none' && delta > 0) {
      this.exposure[cell] = (this.exposure[cell] || 0) + delta;
    }
    frameState.temporalHistory = this.snapshot(frameState);
  }

  snapshot(frameState = this.frameState) {
    const rhythm = frameState.hostRhythm || {};
    const resonance = frameState.coreWorldResonance || {};
    return {
      pass: 'LS1D0', authority: 'observation_only', schemaVersion: 1,
      simulationSeconds: this.elapsed,
      hostCycleIndex: Math.max(0, Math.floor(Number(rhythm.cycleCount) || 0)),
      activeCellId: String(frameState.activeCellId || 'none'),
      exposureSecondsByCell: { ...this.exposure },
      corePhaseCount: Number(frameState.coreEngine?.phaseCount) || 3,
      resonanceRelationship: String(resonance.relationshipState || 'unknown'),
      offlineCatchupApplied: false,
      changesMaterial: false,
      grantsProgression: false
    };
  }
}
