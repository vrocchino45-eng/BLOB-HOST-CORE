// HC-031W2A — diagnostic-only timing observer.
// Does not own time advancement, input, physics, rendering, or gameplay state.
const round = (value, places = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(places));
const percentile = (sorted, q) => sorted.length
  ? round(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * q) - 1)])
  : 0;

export class FrameTruthObserver {
  constructor({ now = () => globalThis.performance?.now?.() ?? Date.now(),
    documentRef = globalThis.document, windowMs = 10000, maxWindows = 180 } = {}) {
    this.nowProvider = now;
    this.documentRef = documentRef;
    this.windowMs = windowMs;
    this.maxWindows = maxWindows;
    this.startedAtMs = this.nowMs();
    this.windows = [];
    this.longGaps = [];
    this.total = this.newWindow();
    this.current = this.newWindow();
    this.pending = null;
    this.visibilityLast = null;
    this.lastCompletedStageMs = null;
  }

  nowMs() { return this.nowProvider.call(null); }

  newWindow() {
    return {
      frameCount: 0, wallMs: 0, simMs: 0, discardedMs: 0,
      frameIntervalsMs: [], registryMs: [], remainingUpdateMs: [], renderMs: [],
      over100ms: 0, over250ms: 0, over1000ms: 0,
      hiddenFrames: 0, unfocusedFrames: 0, visibilityTransitionsObserved: 0,
      maxGapMs: 0, cellId: "none", firstFrame: null, lastFrame: null,
      rendererInfo: null, slowestSampledSystems: []
    };
  }

  beginFrame({ frame, rawDt, dt, cellId = "none" }) {
    const rawMs = Math.max(0, Number.isFinite(rawDt) ? rawDt * 1000 : 0);
    const simMs = Math.max(0, Number.isFinite(dt) ? dt * 1000 : 0);
    const hidden = Boolean(this.documentRef?.hidden);
    const focused = this.documentRef?.hasFocus?.() ?? true;
    const changed = this.visibilityLast !== null && this.visibilityLast !== hidden;
    this.visibilityLast = hidden;

    for (const bucket of [this.current, this.total]) {
      bucket.frameCount++;
      bucket.wallMs += rawMs;
      bucket.simMs += simMs;
      bucket.discardedMs += Math.max(0, rawMs - simMs);
      bucket.over100ms += Number(rawMs > 100);
      bucket.over250ms += Number(rawMs > 250);
      bucket.over1000ms += Number(rawMs > 1000);
      bucket.hiddenFrames += Number(hidden);
      bucket.unfocusedFrames += Number(!focused);
      bucket.visibilityTransitionsObserved += Number(changed);
      bucket.maxGapMs = Math.max(bucket.maxGapMs, rawMs);
      bucket.cellId = cellId;
      bucket.firstFrame ??= frame;
      bucket.lastFrame = frame;
    }
    this.current.frameIntervalsMs.push(rawMs);
    // Retain only exceptional gaps, never an unbounded per-frame event log.
    if (rawMs > 250) {
      this.longGaps.push({
        wallAtSeconds: round((this.nowMs() - this.startedAtMs) / 1000),
        frame, cellId, rawMs: round(rawMs), simMs: round(simMs),
        discardedMs: round(Math.max(0, rawMs - simMs)), hidden, focused,
        previousCallbackWorkMs: this.lastCompletedStageMs
      });
      if (this.longGaps.length > 40) this.longGaps.shift();
    }
    this.pending = { frame };
  }

  endFrame({ registryMs = 0, remainingUpdateMs = 0, renderMs = 0,
    cellId = "none", rendererInfo = null, registrySample = null } = {}) {
    if (!this.pending) return;
    for (const bucket of [this.current, this.total]) {
      bucket.cellId = cellId;
      bucket.rendererInfo = rendererInfo;
    }
    this.current.registryMs.push(Math.max(0, registryMs));
    this.current.remainingUpdateMs.push(Math.max(0, remainingUpdateMs));
    this.current.renderMs.push(Math.max(0, renderMs));
    if (registrySample?.timingSampled) {
      this.current.slowestSampledSystems = registrySample.slowestSampledSystems
        ?.slice(0, 5).map(({ id, lastMs }) => ({ id, lastMs: round(lastMs) })) ?? [];
    }
    this.pending = null;
    this.lastCompletedStageMs = {
      registry: round(registryMs), otherUpdateAndCamera: round(remainingUpdateMs),
      render: round(renderMs)
    };
    if (this.current.wallMs >= this.windowMs) {
      this.windows.push(this.summarize(this.current));
      if (this.windows.length > this.maxWindows) this.windows.shift();
      this.current = this.newWindow();
    }
  }

  summarize(bucket) {
    const frames = [...bucket.frameIntervalsMs].sort((a, b) => a - b);
    const render = [...bucket.renderMs].sort((a, b) => a - b);
    const registry = [...bucket.registryMs].sort((a, b) => a - b);
    const other = [...bucket.remainingUpdateMs].sort((a, b) => a - b);
    return {
      firstFrame: bucket.firstFrame, lastFrame: bucket.lastFrame, cellId: bucket.cellId,
      frames: bucket.frameCount, wallSeconds: round(bucket.wallMs / 1000),
      simSeconds: round(bucket.simMs / 1000), discardedSeconds: round(bucket.discardedMs / 1000),
      simToWallRatio: bucket.wallMs ? round(bucket.simMs / bucket.wallMs) : null,
      callbackRateHz: bucket.wallMs ? round(bucket.frameCount * 1000 / bucket.wallMs) : null,
      frameIntervalMs: { p50: percentile(frames, 0.5), p95: percentile(frames, 0.95), max: round(bucket.maxGapMs) },
      gapCounts: { over100ms: bucket.over100ms, over250ms: bucket.over250ms, over1000ms: bucket.over1000ms },
      visibility: {
        hiddenFrames: bucket.hiddenFrames, unfocusedFrames: bucket.unfocusedFrames,
        transitionsObserved: bucket.visibilityTransitionsObserved
      },
      stageMs: {
        registry: { p50: percentile(registry, 0.5), p95: percentile(registry, 0.95) },
        otherUpdateAndCamera: { p50: percentile(other, 0.5), p95: percentile(other, 0.95) },
        render: { p50: percentile(render, 0.5), p95: percentile(render, 0.95) }
      },
      lastRendererInfo: bucket.rendererInfo,
      lastSlowestSampledSystems: bucket.slowestSampledSystems
    };
  }

  snapshot() {
    // Called only during an ordinary telemetry export; no gameplay feedback.
    const total = this.total;
    return {
      schemaVersion: "blob.frame_truth.v1", pass: "HC-031W2A",
      optimizationPass: "HC-031W2A1",
      authority: "read_only_observer", gameplayAuthority: false,
      timingRule: "actual simulation delta is capped by the unchanged GameRuntime.tick() at 50ms per callback",
      scope: "renderer.setAnimationLoop callback, not encoded video FPS or independent GPU FPS",
      total: {
        frames: total.frameCount, wallSeconds: round(total.wallMs / 1000),
        simSeconds: round(total.simMs / 1000), discardedSeconds: round(total.discardedMs / 1000),
        simToWallRatio: total.wallMs ? round(total.simMs / total.wallMs) : null,
        callbackRateHz: total.wallMs ? round(total.frameCount * 1000 / total.wallMs) : null,
        maxGapMs: round(total.maxGapMs),
        gapCounts: { over100ms: total.over100ms, over250ms: total.over250ms, over1000ms: total.over1000ms },
        visibility: { hiddenFrames: total.hiddenFrames, unfocusedFrames: total.unfocusedFrames,
          transitionsObserved: total.visibilityTransitionsObserved }
      },
      windows: [...this.windows, ...(this.current.frameCount ? [this.summarize(this.current)] : [])],
      last40LongGaps: [...this.longGaps]
    };
  }
}
