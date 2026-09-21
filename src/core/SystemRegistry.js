export class SystemRegistry {
  constructor() {
    this.systems = new Map();
    this.updateOrder = [];
    this.updateOptions = new Map();
    this.errorCounts = new Map();
    this.initialized = new Set();
    this.runtimeActive = new Map();
    this.prepared = new Map();
    this.updateTiming = new Map();
    this.timingSampleEveryFrames = 60;
    this.slowSystemThresholdMs = 2.0;
    this.hitchSampleThresholdMs = 45.0;
    this.worstSampledUpdateMs = 0;
    this.worstSampledFrame = -1;
    this.worstSampleSnapshot = null;
  }

  register(id, system, options = {}) {
    if (!id) {
      throw new Error("[SystemRegistry] Cannot register system without id.");
    }

    if (!system) {
      throw new Error(`[SystemRegistry] Cannot register empty system: ${id}`);
    }

    if (this.systems.has(id)) {
      throw new Error(`[SystemRegistry] Duplicate system id: ${id}`);
    }

    this.systems.set(id, system);
    this.updateOptions.set(id, options);

    if (options.update !== false) {
      this.updateOrder.push(id);
    }

    if (!options.lazyInit && typeof system.init === "function") {
      system.init();
      this.initialized.add(id);
    } else if (typeof system.init !== "function") {
      this.initialized.add(id);
    }

    return system;
  }

  get(id) {
    const system = this.systems.get(id);

    if (!system) {
      throw new Error(`[SystemRegistry] Unknown system requested: ${id}`);
    }

    return system;
  }

  has(id) {
    return this.systems.has(id);
  }

  prepareSystem(id, frameState, { settle = true } = {}) {
    const system = this.systems.get(id);
    if (!system) {
      throw new Error(`[SystemRegistry] Cannot prepare unknown system: ${id}`);
    }

    if (this.initialized.has(id)) {
      return {
        id,
        status: this.prepared.has(id) ? "already_prepared" : "already_initialized",
        durationMs: this.prepared.get(id)?.durationMs ?? 0,
        initialized: true,
        runtimeActive: this.runtimeActive.get(id) === true
      };
    }

    const startedAt = this.now();
    if (typeof system.init === "function") system.init();
    this.initialized.add(id);

    if (settle && typeof system.onRuntimePrepare === "function") {
      system.onRuntimePrepare(frameState);
    }

    this.runtimeActive.set(id, false);
    const record = {
      id,
      status: "prepared",
      durationMs: Math.max(0, this.now() - startedAt),
      preparedAtFrame: frameState?.frame ?? 0,
      initialized: true,
      runtimeActive: false
    };
    this.prepared.set(id, record);
    return { ...record };
  }

  update(dt, frameState) {
    const execution = {
      pass: "HC-012A",
      frame: frameState?.frame ?? 0,
      profileId: frameState?.firstSliceRuntimeMount?.profileId ?? "mount_pending",
      activeRegionId: frameState?.firstSliceRuntimeMount?.activeRegionId ?? "mount_pending",
      activeModeId: frameState?.firstSliceRuntimeMount?.activeModeId ?? "mount_pending",
      executedSystemIds: [],
      skippedRegionSystemIds: [],
      initializedSystemIds: [],
      preparedSystemIds: [...this.prepared.keys()],
      mountedSystemIds: [],
      unmountedSystemIds: [],
      nonFatalErrorSystemIds: []
    };
    if (frameState) frameState.runtimeExecution = execution;
    const rawFrameDeltaMs = frameState?.transitionContinuity?.lastRawDeltaMs ?? 0;
    const periodicTimingSample =
      ((frameState?.frame ?? 0) % this.timingSampleEveryFrames) === 0;
    const hitchTimingSample = rawFrameDeltaMs >= this.hitchSampleThresholdMs;
    const sampleTiming = periodicTimingSample || hitchTimingSample;
    let sampledUpdateMs = 0;

    for (const id of this.updateOrder) {
      const system = this.systems.get(id);

      if (!system || typeof system.update !== "function") continue;

      const options = this.updateOptions.get(id) ?? {};
      const active = this.shouldUpdate(id, options, frameState);
      const wasActive = this.runtimeActive.get(id) === true;

      if (!active) {
        if (wasActive) {
          try {
            if (typeof system.onRuntimeUnmount === "function") {
              system.onRuntimeUnmount(frameState);
            } else if (options.settleOnDeactivate) {
              system.update(0, frameState);
            }
            execution.unmountedSystemIds.push(id);
          } catch (error) {
            if (!options.allowUpdateError) throw error;
            this.recordNonFatalUpdateError(id, error, frameState);
            execution.nonFatalErrorSystemIds.push(id);
          }
        }
        this.runtimeActive.set(id, false);
        if (options.runtimeScope === "active_region") {
          execution.skippedRegionSystemIds.push(id);
        }
        continue;
      }

      try {
        if (!this.initialized.has(id)) {
          if (typeof system.init === "function") system.init();
          this.initialized.add(id);
          execution.initializedSystemIds.push(id);
        }
        if (!wasActive && options.runtimeScope === "active_region") {
          if (typeof system.onRuntimeMount === "function") {
            system.onRuntimeMount(frameState);
          }
          execution.mountedSystemIds.push(id);
        }
        this.runtimeActive.set(id, true);
        if (sampleTiming) {
          const startedAt = this.now();
          system.update(dt, frameState);
          const durationMs = Math.max(0, this.now() - startedAt);
          sampledUpdateMs += durationMs;
          const previous = this.updateTiming.get(id) ?? {
            samples: 0,
            totalMs: 0,
            maxMs: 0,
            lastMs: 0
          };
          this.updateTiming.set(id, {
            samples: previous.samples + 1,
            totalMs: previous.totalMs + durationMs,
            maxMs: Math.max(previous.maxMs, durationMs),
            lastMs: durationMs
          });
        } else {
          system.update(dt, frameState);
        }
        execution.executedSystemIds.push(id);
      } catch (error) {
        if (!options.allowUpdateError) throw error;
        this.recordNonFatalUpdateError(id, error, frameState);
        execution.nonFatalErrorSystemIds.push(id);
      }
    }

    const mount = frameState?.firstSliceRuntimeMount ?? {};
    execution.profileId = mount.profileId ?? execution.profileId;
    execution.activeRegionId = mount.activeRegionId ?? execution.activeRegionId;
    execution.activeModeId = mount.activeModeId ?? execution.activeModeId;
    execution.gameplayOwner = mount.gameplayOwner ?? "none";
    execution.presentationOwner = mount.presentationOwner ?? "none";
    execution.cameraOwner = mount.cameraOwner ?? "none";
    execution.registeredSystemCount = this.systems.size;
    execution.updateSystemCount = this.updateOrder.length;
    execution.executedSystemCount = execution.executedSystemIds.length;
    execution.activeRegionSystemCount = execution.executedSystemIds.filter((id) =>
      this.updateOptions.get(id)?.runtimeScope === "active_region"
    ).length;
    execution.skippedRegionSystemCount = execution.skippedRegionSystemIds.length;
    execution.lazyInitializedCount = execution.initializedSystemIds.length;
    execution.preparedSystemCount = execution.preparedSystemIds.length;
    execution.preparedSystemIds = [...this.prepared.keys()];
    execution.preparedSystemDurationsMs = Object.fromEntries(
      [...this.prepared.entries()].map(([id, record]) => [id, record.durationMs])
    );
    execution.dormantCompatibilityRegisteredCount = this.updateOrder.filter((id) =>
      this.updateOptions.get(id)?.dormantCompatibility === true
    ).length;

    execution.timingSampled = sampleTiming;
    execution.timingSampleReason = hitchTimingSample
      ? "frame_gap"
      : periodicTimingSample
        ? "periodic"
        : "none";
    execution.sampledUpdateMs = sampleTiming ? sampledUpdateMs : null;
    execution.timingSampleEveryFrames = this.timingSampleEveryFrames;
    execution.hitchSampleThresholdMs = this.hitchSampleThresholdMs;
    execution.rawFrameDeltaMs = rawFrameDeltaMs;

    if (sampleTiming) {
      const sampledSystems = execution.executedSystemIds
        .map((id) => {
          const timing = this.updateTiming.get(id);
          return {
            id,
            lastMs: timing?.lastMs ?? 0,
            averageMs: timing?.samples ? timing.totalMs / timing.samples : 0,
            maxMs: timing?.maxMs ?? 0,
            samples: timing?.samples ?? 0
          };
        })
        .sort((a, b) => b.lastMs - a.lastMs);

      execution.slowestSampledSystems = sampledSystems.slice(0, 8);
      execution.slowSystemIds = sampledSystems
        .filter((item) => item.lastMs >= this.slowSystemThresholdMs)
        .map((item) => item.id);
      execution.slowSystemThresholdMs = this.slowSystemThresholdMs;

      const updateShare = rawFrameDeltaMs > 0
        ? sampledUpdateMs / rawFrameDeltaMs
        : 0;
      execution.updateShareOfFrame = updateShare;
      execution.hitchClassification =
        rawFrameDeltaMs < this.hitchSampleThresholdMs
          ? "normal_sample"
          : updateShare >= 0.55
            ? "update_bound"
            : updateShare <= 0.30
              ? "non_update_bound"
              : "mixed";

      if (sampledUpdateMs > this.worstSampledUpdateMs) {
        this.worstSampledUpdateMs = sampledUpdateMs;
        this.worstSampledFrame = frameState?.frame ?? 0;
        this.worstSampleSnapshot = {
          frame: this.worstSampledFrame,
          rawFrameDeltaMs,
          sampledUpdateMs,
          updateShare,
          classification: execution.hitchClassification,
          reason: execution.timingSampleReason,
          slowestSystems: execution.slowestSampledSystems.map((item) => ({
            id: item.id,
            lastMs: item.lastMs,
            averageMs: item.averageMs,
            maxMs: item.maxMs
          }))
        };
      }
    }

    execution.worstSampledUpdateMs = this.worstSampledUpdateMs;
    execution.worstSampledFrame = this.worstSampledFrame;
    execution.worstSampleSnapshot = this.worstSampleSnapshot;
  }

  shouldUpdate(id, options, frameState) {
    if (options.dormantCompatibility) return false;
    if (options.runtimeScope !== "active_region") return true;

    const activeSystemIds = frameState?.firstSliceRuntimeMount?.activeSystemIds;
    if (!Array.isArray(activeSystemIds)) return false;
    return activeSystemIds.includes(id);
  }

  recordNonFatalUpdateError(id, error, frameState) {
    const count = (this.errorCounts.get(id) ?? 0) + 1;
    this.errorCounts.set(id, count);

    const errorReport = {
      id,
      message: error?.message ?? String(error),
      name: error?.name ?? "Error",
      count,
      frame: frameState?.frame ?? 0,
      nonFatal: true
    };

    if (frameState) {
      frameState.nonFatalSystemErrors = frameState.nonFatalSystemErrors ?? [];
      frameState.nonFatalSystemErrors = [
        errorReport,
        ...frameState.nonFatalSystemErrors.filter((item) => item.id !== id)
      ].slice(0, 8);
    }

    if (count <= 3 || count % 120 === 0) {
      console.warn(`[SystemRegistry] Non-fatal update error in ${id}:`, error);
    }
  }

  now() {
    return globalThis.performance?.now?.() ?? Date.now();
  }

  list() {
    return [...this.systems.keys()];
  }

  listDetailed() {
    return [...this.systems.keys()].map((id) => {
      const options = this.updateOptions.get(id) ?? {};
      return {
        id,
        initialized: this.initialized.has(id),
        prepared: this.prepared.has(id),
        preparedDurationMs: this.prepared.get(id)?.durationMs ?? 0,
        runtimeActive: this.runtimeActive.get(id) === true,
        updateEnabled: options.update !== false,
        runtimeScope: options.runtimeScope ?? "global",
        lazyInit: Boolean(options.lazyInit),
        dormantCompatibility: Boolean(options.dormantCompatibility)
      };
    });
  }
}
