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
    this.lastCompletedTransitionActivation = null;
  }

  nowMs() { return this.nowProvider.call(null); }

  newWindow() {
    return {
      frameCount: 0, wallMs: 0, simMs: 0, discardedMs: 0,
      frameIntervalsMs: [], registryMs: [], remainingUpdateMs: [],
      presentationUpdateMs: [], cameraUpdateMs: [], transitionUpdateMs: [], renderMs: [],
      over100ms: 0, over250ms: 0, over1000ms: 0,
      hiddenFrames: 0, unfocusedFrames: 0, visibilityTransitionsObserved: 0,
      maxGapMs: 0, cellId: "none", firstFrame: null, lastFrame: null,
      rendererInfo: null, renderOwnerCensus: null, slowestSampledSystems: [],
      substepCounts: [], multiSubstepFrames: 0, recoveredBeyondLegacyCapMs: 0
    };
  }

  beginFrame({ frame, rawDt, dt, cellId = "none", substepCount = 1, recoveredBeyondLegacyCapSeconds = 0 }) {
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
      bucket.multiSubstepFrames += Number(substepCount > 1);
      bucket.recoveredBeyondLegacyCapMs += Math.max(0, Number.isFinite(recoveredBeyondLegacyCapSeconds)
        ? recoveredBeyondLegacyCapSeconds * 1000 : 0);
    }
    this.current.frameIntervalsMs.push(rawMs);
    this.current.substepCounts.push(Math.max(1, Math.floor(Number.isFinite(substepCount) ? substepCount : 1)));
    // Retain only exceptional gaps, never an unbounded per-frame event log.
    if (rawMs > 250) {
      this.longGaps.push({
        wallAtSeconds: round((this.nowMs() - this.startedAtMs) / 1000),
        frame, cellId, rawMs: round(rawMs), simMs: round(simMs),
        discardedMs: round(Math.max(0, rawMs - simMs)), hidden, focused,
        substepCount: Math.max(1, Math.floor(Number.isFinite(substepCount) ? substepCount : 1)),
        recoveredBeyondLegacyCapMs: round(Math.max(0, Number.isFinite(recoveredBeyondLegacyCapSeconds)
          ? recoveredBeyondLegacyCapSeconds * 1000 : 0)),
        previousCallbackWorkMs: this.lastCompletedStageMs,
        previousTransitionActivation: this.lastCompletedTransitionActivation
      });
      if (this.longGaps.length > 40) this.longGaps.shift();
    }
    this.pending = { frame };
  }

  endFrame({ registryMs = 0, remainingUpdateMs = null, presentationUpdateMs = 0,
    cameraUpdateMs = 0, transitionUpdateMs = 0, renderMs = 0, cellId = "none",
    rendererInfo = null, renderOwnerCensus = null, registrySample = null } = {}) {
    if (!this.pending) return;
    for (const bucket of [this.current, this.total]) {
      bucket.cellId = cellId;
      bucket.rendererInfo = rendererInfo;
      if (renderOwnerCensus) bucket.renderOwnerCensus = renderOwnerCensus;
    }
    const partitionedRemainingMs = Math.max(0, presentationUpdateMs)
      + Math.max(0, cameraUpdateMs) + Math.max(0, transitionUpdateMs);
    const effectiveRemainingUpdateMs = Number.isFinite(remainingUpdateMs)
      ? Math.max(0, remainingUpdateMs)
      : partitionedRemainingMs;
    this.current.registryMs.push(Math.max(0, registryMs));
    this.current.remainingUpdateMs.push(effectiveRemainingUpdateMs);
    this.current.presentationUpdateMs.push(Math.max(0, presentationUpdateMs));
    this.current.cameraUpdateMs.push(Math.max(0, cameraUpdateMs));
    this.current.transitionUpdateMs.push(Math.max(0, transitionUpdateMs));
    this.current.renderMs.push(Math.max(0, renderMs));
    if (registrySample?.timingSampled) {
      this.current.slowestSampledSystems = registrySample.slowestSampledSystems
        ?.slice(0, 5).map(({ id, lastMs }) => ({ id, lastMs: round(lastMs) })) ?? [];
    }
    this.pending = null;
    this.lastCompletedStageMs = {
      registry: round(registryMs),
      simulationRegistry: round(registryMs),
      otherUpdateAndCamera: round(effectiveRemainingUpdateMs),
      presentationUpdate: round(presentationUpdateMs),
      cameraUpdate: round(cameraUpdateMs),
      transitionUpdate: round(transitionUpdateMs),
      render: round(renderMs)
    };
    this.lastCompletedTransitionActivation = rendererInfo ? {
      pass: rendererInfo.transitionActivationPass ?? "none",
      boundary: rendererInfo.transitionActivationBoundary ?? "none",
      activatedThisCallback: Boolean(rendererInfo.transitionActivationActivatedThisCallback),
      rootName: rendererInfo.transitionActivationRootName ?? "none",
      lastRootName: rendererInfo.transitionActivationLastRootName ?? "none",
      sequence: rendererInfo.transitionActivationSequence ?? 0,
      pendingRequestedRoots: rendererInfo.transitionActivationPendingRequestedRoots ?? 0,
      deferredByBudgetCount: rendererInfo.transitionActivationDeferredByBudgetCount ?? 0,
      renderMs: round(rendererInfo.transitionActivationLastRenderMs ?? renderMs),
      peakRenderMs: round(rendererInfo.transitionActivationPeakRenderMs ?? 0),
      peakRootName: rendererInfo.transitionActivationPeakRootName ?? "none"
    } : null;
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
    const presentation = [...bucket.presentationUpdateMs].sort((a, b) => a - b);
    const camera = [...bucket.cameraUpdateMs].sort((a, b) => a - b);
    const transition = [...bucket.transitionUpdateMs].sort((a, b) => a - b);
    const substeps = [...bucket.substepCounts].sort((a, b) => a - b);
    return {
      firstFrame: bucket.firstFrame, lastFrame: bucket.lastFrame, cellId: bucket.cellId,
      frames: bucket.frameCount, wallSeconds: round(bucket.wallMs / 1000),
      simSeconds: round(bucket.simMs / 1000), discardedSeconds: round(bucket.discardedMs / 1000),
      simToWallRatio: bucket.wallMs ? round(bucket.simMs / bucket.wallMs) : null,
      callbackRateHz: bucket.wallMs ? round(bucket.frameCount * 1000 / bucket.wallMs) : null,
      frameIntervalMs: { p50: percentile(frames, 0.5), p95: percentile(frames, 0.95), max: round(bucket.maxGapMs) },
      gapCounts: { over100ms: bucket.over100ms, over250ms: bucket.over250ms, over1000ms: bucket.over1000ms },
      simulationCatchUp: {
        p50Substeps: percentile(substeps, 0.5), p95Substeps: percentile(substeps, 0.95),
        maxSubsteps: substeps.length ? Math.max(...substeps) : 1,
        multiSubstepFrames: bucket.multiSubstepFrames,
        recoveredBeyondLegacyCapSeconds: round(bucket.recoveredBeyondLegacyCapMs / 1000)
      },
      visibility: {
        hiddenFrames: bucket.hiddenFrames, unfocusedFrames: bucket.unfocusedFrames,
        transitionsObserved: bucket.visibilityTransitionsObserved
      },
      stageMs: {
        // Legacy names stay additive for comparison with W2A-W2A4 exports.
        registry: { p50: percentile(registry, 0.5), p95: percentile(registry, 0.95) },
        otherUpdateAndCamera: { p50: percentile(other, 0.5), p95: percentile(other, 0.95) },
        simulationRegistry: { p50: percentile(registry, 0.5), p95: percentile(registry, 0.95) },
        presentationUpdate: { p50: percentile(presentation, 0.5), p95: percentile(presentation, 0.95) },
        cameraUpdate: { p50: percentile(camera, 0.5), p95: percentile(camera, 0.95) },
        transitionUpdate: { p50: percentile(transition, 0.5), p95: percentile(transition, 0.95) },
        render: { p50: percentile(render, 0.5), p95: percentile(render, 0.95) }
      },
      lastRendererInfo: bucket.rendererInfo,
      lastRenderOwnerCensus: bucket.renderOwnerCensus,
      lastSlowestSampledSystems: bucket.slowestSampledSystems
    };
  }

  snapshot() {
    // Called only during an ordinary telemetry export; no gameplay feedback.
    const total = this.total;
    return {
      schemaVersion: "blob.frame_truth.v1", pass: "HC-031W2A",
      optimizationPass: "HC-031W2A5.1",
      authority: "read_only_observer", gameplayAuthority: false,
      timingRule: "elapsed callback time is split into <=50ms simulation-registry substeps with a 150ms/callback catch-up ceiling; presentation, camera, transition, and render each run once per callback; excess is dropped",
      transitionRenderWarmupRule: "prepared transition roots compile incrementally against the actual Host target scene; one root per idle slot; geometry bounds are prepared before first visibility",
      transitionFirstDrawStagingRule: "prepared transition roots retain full gameplay/morph state, but renderer visibility admits at most one newly requested root per callback when the previous render is <=65ms; suppressed visibility is restored immediately after render",
      scope: "renderer.setAnimationLoop callback, not encoded video FPS or independent GPU FPS",
      total: {
        frames: total.frameCount, wallSeconds: round(total.wallMs / 1000),
        simSeconds: round(total.simMs / 1000), discardedSeconds: round(total.discardedMs / 1000),
        simToWallRatio: total.wallMs ? round(total.simMs / total.wallMs) : null,
        callbackRateHz: total.wallMs ? round(total.frameCount * 1000 / total.wallMs) : null,
        maxGapMs: round(total.maxGapMs),
        gapCounts: { over100ms: total.over100ms, over250ms: total.over250ms, over1000ms: total.over1000ms },
        simulationCatchUp: {
          multiSubstepFrames: total.multiSubstepFrames,
          recoveredBeyondLegacyCapSeconds: round(total.recoveredBeyondLegacyCapMs / 1000),
          maxStepSeconds: 0.05,
          maxCatchUpSeconds: 0.15,
          maxSubsteps: 3
        },
        visibility: { hiddenFrames: total.hiddenFrames, unfocusedFrames: total.unfocusedFrames,
          transitionsObserved: total.visibilityTransitionsObserved }
      },
      windows: [...this.windows, ...(this.current.frameCount ? [this.summarize(this.current)] : [])],
      last40LongGaps: [...this.longGaps]
    };
  }
}
