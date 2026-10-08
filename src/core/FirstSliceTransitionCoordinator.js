import * as THREE from "three";

const SURFACE_CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const GUIDE_CELL_ID = "CELL_SCAR_FLOW_FOLD_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const COMB_CELL_ID = "CELL_COMB_THRESHOLD_FILTER_001";

const ACTIVATION_STAGING_BOUNDARIES = new Set(["surface_to_guide", "guide_to_hub"]);
const GPU_PRIME_BOUNDARIES = new Set(["surface_to_guide", "guide_to_hub"]);
const GPU_PRIME_TARGET_SIZE = 1;
const LIVE_DRAW_ATTRIBUTION_MAX_ITEMS = 16;
const GPU_PRIME_PRIORITY_ROOTS = new Map([
  ["guide_threshold_layered_interaction_HC006F", -20],
  ["hub_chamber_spatial_authority_HC008G", -20],
  ["scar_memory_fleck_001", -10]
]);

const GUIDE_PREP_SYSTEM_IDS = [
  "morphCompletionSystem",
  "scarFlowArrivalSystem",
  "guideThresholdGameplaySystem",
  "guideThresholdLayeredInteractionSystem",
  "scarFlowInteractionSystem",
  "secondLocalCellMorphSystem"
];

const HUB_PREP_SYSTEM_IDS = [
  "hubChamberFoundationSystem",
  "hubInvestigationGameplaySystem"
];

const GRAVE_PREP_SYSTEM_IDS = [
  "graveMemoryRouteSystem"
];

const VASCULAR_PREP_SYSTEM_IDS = [
  "act1RouteContractSystem",
  "vascularRhythmRouteSystem"
];

const SILT_PREP_SYSTEM_IDS = [
  "act1RouteContractSystem",
  "siltPressureRouteSystem"
];

const COMB_PREP_SYSTEM_IDS = [
  "combThresholdFoundationSystem",
  "combThresholdPlayableSystem"
];

const APERTURE_PREP_SYSTEM_IDS = ["apertureFieldsArrivalSystem", "signalPlainEcologySystem"];

export class FirstSliceTransitionCoordinator {
  constructor({
    registry,
    scene,
    camera,
    renderer,
    localCellMorphSystem,
    secondLocalCellMorphSystem,
    frameState,
    autoSchedule = true,
    idleTimeoutMs = 1200
  }) {
    if (!registry || !scene || !frameState) {
      throw new Error("[FirstSliceTransitionCoordinator] registry, scene, and frameState are required.");
    }

    this.registry = registry;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.localCellMorphSystem = localCellMorphSystem;
    this.secondLocalCellMorphSystem = secondLocalCellMorphSystem;
    this.frameState = frameState;
    this.autoSchedule = autoSchedule;
    this.idleTimeoutMs = idleTimeoutMs;
    this.preparedRoots = new Set();
    this.compiledRoots = new Set();
    this.running = false;
    this.scheduled = false;
    this.scheduleHandle = null;
    this.maxObservedFrameGapMs = 0;
    this.frameGapCount = 0;
    this.lastMountSequence = 0;
    this.lastMountChangeFrame = 0;
    this.lastProgress = 0;
    this.lastProgressAt = 0;
    this.lastError = "none";
    // HC-031W2A5: transition render warmup must compile the actual prepared
    // materials against the live Host scene, one prepared root per idle slot.
    this.shaderWarmup = {
      pass: "HC-031W2A5",
      policy: "actual_scene_target_incremental_per_root",
      targetSceneCompiles: 0,
      geometryBoundsPrepared: 0,
      yieldedIdleSlots: 0,
      failedRootCount: 0,
      lastRootName: "none",
      lastStatus: "not_started",
      lastDurationMs: 0
    };
    // HC-031W2A5.1 root-level staging state is retained only so older telemetry
    // remains readable. HC-031W2A5.2 does not use it to alter live visibility.
    this.activationRecords = new Map();
    this.activationRestore = [];
    this.activationPrepareSequence = 0;
    this.activationStaging = {
      pass: "HC-031W2A5.2",
      policy: "root_level_first_draw_staging_retired_gpu_priming_prepares_renderables_offscreen",
      renderBudgetMs: 0,
      activeBoundary: "none",
      lastRenderMs: null,
      activatedRootCount: 0,
      deferredByBudgetCount: 0,
      lastActivatedRootName: "none",
      lastActivatedBoundary: "none",
      lastActivatedFrame: -1,
      lastActivationSequence: 0,
      activatedThisCallback: false,
      pendingRequestedRootCount: 0,
      hiddenThisRenderCount: 0,
      lastActivationRenderMs: 0,
      peakActivationRenderMs: 0,
      peakActivationRootName: "none"
    };
    // HC-031W2A5.2: compile() does not guarantee that every geometry/material
    // pair has traversed the real draw/upload path. Prime prepared renderables
    // one child at a time into a 1x1 offscreen target during idle slots. The
    // shared geometry/material objects are the authored instances, so the live
    // transition can reuse GPU-resident buffers/textures without root-level
    // first-draw batching.
    this.gpuPrimedRenderables = new WeakSet();
    this.gpuPrimeScene = null;
    this.gpuPrimeCamera = null;
    this.gpuPrimeTarget = null;
    this.gpuPriming = {
      pass: "HC-031W2A5.3",
      policy: "early_offscreen_draw_before_shader_warmup_one_shared_renderable_per_idle_slot",
      targetSize: GPU_PRIME_TARGET_SIZE,
      rootLevelStagingRetired: true,
      activeBoundary: "none",
      queuedRenderableCount: 0,
      primedRenderableCount: 0,
      failedRenderableCount: 0,
      yieldedIdleSlots: 0,
      sequence: 0,
      lastRenderableName: "none",
      lastRootName: "none",
      lastBoundary: "none",
      lastDurationMs: 0,
      lastStatus: "not_started",
      peakDurationMs: 0,
      peakRenderableName: "none",
      peakRootName: "none"
    };
    // HC-031W2A5.3: passive attribution only. It never mutates live visibility.
    // Record children that cross from not-renderable to renderable immediately
    // before the real scene draw so the next long-gap sample can name them.
    this.liveDrawableState = new WeakMap();
    this.liveDrawAttribution = {
      pass: "HC-031W2A5.3",
      policy: "passive_pre_render_newly_drawable_child_attribution_no_visibility_mutation",
      sequence: 0,
      frame: -1,
      cellId: "none",
      boundary: "none",
      newlyDrawableCount: 0,
      unprimedNewlyDrawableCount: 0,
      overflowCount: 0,
      items: []
    };
    this.jobs = this.createJobs();
    this.publish(frameState, 0);
  }

  createJobs() {
    return [
      {
        id: "surface_to_guide_destination",
        boundary: "surface_to_guide",
        execute: () => this.localCellMorphSystem.prepareTransitionResources()
      },
      ...GUIDE_PREP_SYSTEM_IDS.map((id) => ({
        id: `guide_system:${id}`,
        boundary: "surface_to_guide",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      // HC-031W2A5.3: real offscreen draws run before the older shader-only
      // warmup. A5.2 proved the draw path is cheap but was starting too late.
      {
        id: "surface_to_guide_gpu_renderables",
        boundary: "surface_to_guide",
        maySpanFrames: true,
        execute: () => this.primePreparedRenderables("surface_to_guide")
      },
      {
        id: "surface_to_guide_shader_programs",
        boundary: "surface_to_guide",
        maySpanFrames: true,
        execute: () => this.warmPreparedShaders()
      },
      {
        id: "guide_to_hub_destination",
        boundary: "guide_to_hub",
        execute: () => this.secondLocalCellMorphSystem.prepareTransitionResources()
      },
      ...HUB_PREP_SYSTEM_IDS.map((id) => ({
        id: `hub_system:${id}`,
        boundary: "guide_to_hub",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      {
        id: "guide_to_hub_gpu_renderables",
        boundary: "guide_to_hub",
        maySpanFrames: true,
        execute: () => this.primePreparedRenderables("guide_to_hub")
      },
      {
        id: "guide_to_hub_shader_programs",
        boundary: "guide_to_hub",
        maySpanFrames: true,
        execute: () => this.warmPreparedShaders()
      },
      ...GRAVE_PREP_SYSTEM_IDS.map((id) => ({
        id: `grave_system:${id}`,
        boundary: "hub_to_grave",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      {
        id: "hub_to_grave_shader_programs",
        boundary: "hub_to_grave",
        maySpanFrames: true,
        execute: () => this.warmPreparedShaders()
      },
      ...VASCULAR_PREP_SYSTEM_IDS.map((id) => ({
        id: `vascular_playable_system:${id}`,
        boundary: "hub_to_vascular",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      ...SILT_PREP_SYSTEM_IDS.map((id) => ({
        id: `silt_playable_system:${id}`,
        boundary: "hub_to_silt",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      ...COMB_PREP_SYSTEM_IDS.map((id) => ({
        id: `comb_threshold_system:${id}`,
        boundary: "hub_to_comb",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      {
        id: "hub_to_comb_shader_programs",
        boundary: "hub_to_comb",
        maySpanFrames: true,
        execute: () => this.warmPreparedShaders()
      },
      ...APERTURE_PREP_SYSTEM_IDS.map((id) => ({
        id: `aperture_arrival_system:${id}`,
        boundary: "comb_to_aperture",
        execute: () => this.registry.prepareSystem(id, this.frameState)
      })),
      {
        id: "comb_to_aperture_shader_programs",
        boundary: "comb_to_aperture",
        maySpanFrames: true,
        execute: () => this.warmPreparedShaders()
      }
    ].map((job) => ({
      ...job,
      status: "pending",
      durationMs: 0,
      completedAtFrame: -1,
      resultStatus: "pending",
      error: "none"
    }));
  }

  update(_dt, frameState, rawDeltaSeconds = 0) {
    const rawDeltaMs = Math.max(0, rawDeltaSeconds * 1000);
    this.maxObservedFrameGapMs = Math.max(this.maxObservedFrameGapMs, rawDeltaMs);
    if (rawDeltaMs > 80) this.frameGapCount += 1;

    const mountSequence = frameState.firstSliceRuntimeMount?.mountSequence ?? 0;
    if (mountSequence !== this.lastMountSequence) {
      this.lastMountSequence = mountSequence;
      this.lastMountChangeFrame = frameState.frame ?? 0;
    }

    const transition = this.currentTransition(frameState);
    const now = frameState.runtimeSeconds ?? 0;
    if (transition.progress > this.lastProgress + 0.0001 || transition.id === "none") {
      this.lastProgress = transition.progress;
      this.lastProgressAt = now;
    }

    this.publish(frameState, rawDeltaMs);
    if (this.autoSchedule && (frameState.frame ?? 0) >= 2) this.scheduleNext();
  }

  scheduleNext() {
    const eligibleJob = this.nextEligibleJob();
    if (this.scheduled || this.running || !eligibleJob) return;
    this.scheduled = true;

    const run = (deadline) => {
      this.scheduled = false;
      this.scheduleHandle = null;
      void this.runNext(deadline, eligibleJob.id);
    };

    if (typeof globalThis.requestIdleCallback === "function") {
      this.scheduleHandle = globalThis.requestIdleCallback(run, { timeout: this.idleTimeoutMs });
      return;
    }

    this.scheduleHandle = globalThis.setTimeout(
      () => run({ didTimeout: true, timeRemaining: () => 0 }),
      48
    );
  }

  async runNext(deadline = null, preferredJobId = null) {
    if (this.running) return null;
    const job = preferredJobId
      ? this.jobs.find((candidate) => candidate.id === preferredJobId && candidate.status === "pending")
      : this.jobs.find((candidate) => candidate.status === "pending");
    if (!job) {
      this.publish(this.frameState, this.frameState.transitionContinuity?.lastRawDeltaMs ?? 0);
      return null;
    }

    if (deadline && !deadline.didTimeout && deadline.timeRemaining() < 5) {
      this.scheduleNext();
      return null;
    }

    this.running = true;
    job.status = "running";
    const activeCellBefore = this.frameState.activeCellId;
    const sceneChildrenBefore = new Set(this.scene.children);
    const startedAt = this.now();

    try {
      const result = await job.execute();
      if (!job.maySpanFrames && this.frameState.activeCellId !== activeCellBefore) {
        this.frameState.activeCellId = activeCellBefore;
        throw new Error(`${job.id} attempted to mutate activeCellId during dormant preparation.`);
      }

      const resultRoots = Array.isArray(result)
        ? result.filter((item) => item?.isObject3D)
        : [];
      const newRoots = this.scene.children.filter((root) => !sceneChildrenBefore.has(root));
      const dormantRoots = resultRoots.filter((root) => root.userData.transitionPrepared === true);

      for (const root of new Set([...dormantRoots, ...newRoots])) {
        if (!root?.isObject3D) continue;
        root.visible = false;
        root.userData.transitionPrepared = true;
        this.registerPreparedRoot(root, job.boundary);
      }

      job.status = "complete";
      job.resultStatus = result?.status ?? "complete";
      job.completedAtFrame = this.frameState.frame ?? 0;
    } catch (error) {
      for (const root of this.scene.children.filter((item) => !sceneChildrenBefore.has(item))) {
        root.visible = false;
        root.userData.transitionPrepared = true;
        this.registerPreparedRoot(root, job.boundary);
      }
      job.status = "failed";
      job.error = error?.message ?? String(error);
      this.lastError = `${job.id}: ${job.error}`;
    } finally {
      job.durationMs = Math.max(0, this.now() - startedAt);
      this.running = false;
      this.publish(this.frameState, this.frameState.transitionContinuity?.lastRawDeltaMs ?? 0);
      if (this.autoSchedule) this.scheduleNext();
    }

    return { ...job };
  }

  async runAllNow() {
    const results = [];
    while (this.jobs.some((job) => job.status === "pending")) {
      const result = await this.runNext({ didTimeout: true, timeRemaining: () => 100 });
      if (result) results.push(result);
    }
    return results;
  }

  registerPreparedRoot(root, boundary = "none") {
    if (!root?.isObject3D) return null;
    this.preparedRoots.add(root);
    root.userData ??= {};
    root.userData.transitionPreparedBoundary ??= boundary;

    let record = this.activationRecords.get(root);
    if (!record) {
      this.activationPrepareSequence += 1;
      record = {
        root,
        boundary,
        prepareSequence: this.activationPrepareSequence,
        priority: this.activationPriority(root),
        activated: false,
        requestedVisible: false,
        lastRequestedFrame: -1,
        activatedAtFrame: -1,
        activationSequence: 0
      };
      this.activationRecords.set(root, record);
    } else if (record.boundary === "none" && boundary !== "none") {
      record.boundary = boundary;
    }
    return record;
  }

  activationPriority(root) {
    const name = root?.name ?? "";
    const morphRole = root?.userData?.morphRole ?? "";
    if (name === "scar_flow_fold_surface_001" || name === "signal_chorus_nerve_surface_001") return 0;
    if (name === "scar_pressure_haze_001" || name === "signal_chorus_soft_haze_001") return 1;
    if (morphRole === "destination_environment" || morphRole === "second_destination_environment") return 1;
    if (morphRole === "destination_chem_object" || morphRole === "second_destination_chem_object") return 2;
    if (name.includes("arrival") || name.includes("gameplay_fill") || name.includes("layered_interaction")) return 3;
    return 4;
  }

  resolveActivationBoundary(frameState) {
    const transition = this.currentTransition(frameState);
    if (ACTIVATION_STAGING_BOUNDARIES.has(transition.id)) return transition.id;

    const activeCellId = frameState?.activeCellId ?? SURFACE_CELL_ID;
    if (activeCellId === GUIDE_CELL_ID && this.hasUnactivatedBoundaryRoots("surface_to_guide")) {
      return "surface_to_guide";
    }
    if (activeCellId === HUB_CELL_ID && this.hasUnactivatedBoundaryRoots("guide_to_hub")) {
      return "guide_to_hub";
    }
    return "none";
  }

  hasUnactivatedBoundaryRoots(boundary) {
    return [...this.activationRecords.values()].some((record) => record.boundary === boundary && !record.activated);
  }

  // HC-031W2A5.2: A5.1 whole-root visibility staging is intentionally retired.
  // Keep this API as a no-op compatibility surface for old diagnostics/tests;
  // it must never hide or serialize authored roots in the live renderer.
  prepareRenderActivationStaging(frameState = this.frameState) {
    this.activationRestore.length = 0;
    this.activationStaging.activeBoundary = this.resolveActivationBoundary(frameState);
    this.activationStaging.activatedThisCallback = false;
    this.activationStaging.pendingRequestedRootCount = 0;
    this.activationStaging.hiddenThisRenderCount = 0;
    return this.activationSnapshot();
  }

  restoreRenderActivationStaging() {
    this.activationRestore.length = 0;
  }

  notifyRenderComplete({ renderMs = 0 } = {}) {
    this.activationStaging.lastRenderMs = Math.max(0, Number.isFinite(renderMs) ? renderMs : 0);
    return this.activationSnapshot();
  }

  activationSnapshot() {
    return { ...this.activationStaging };
  }

  isGpuPrimeRenderable(object) {
    if (!object?.isObject3D || !object.material) return false;
    if (!(object.isMesh || object.isLine || object.isLineSegments || object.isLineLoop || object.isPoints || object.isSprite)) return false;
    return object.isSprite || Boolean(object.geometry);
  }

  collectGpuPrimeRenderables(boundary) {
    const records = [...this.activationRecords.values()]
      .filter((record) => record.boundary === boundary && record.root?.isObject3D)
      .sort((a, b) => {
        const aPriority = GPU_PRIME_PRIORITY_ROOTS.get(a.root?.name ?? "") ?? a.priority;
        const bPriority = GPU_PRIME_PRIORITY_ROOTS.get(b.root?.name ?? "") ?? b.priority;
        return aPriority - bPriority || a.prepareSequence - b.prepareSequence;
      });

    const queue = [];
    for (const record of records) {
      record.root.traverse?.((object) => {
        if (!this.isGpuPrimeRenderable(object) || this.gpuPrimedRenderables.has(object)) return;
        queue.push({
          object,
          root: record.root,
          boundary,
          rootPriority: GPU_PRIME_PRIORITY_ROOTS.get(record.root?.name ?? "") ?? record.priority
        });
      });
    }
    return queue;
  }

  ensureGpuPrimeResources() {
    if (this.gpuPrimeScene && this.gpuPrimeCamera && this.gpuPrimeTarget) return;
    this.gpuPrimeScene = new THREE.Scene();
    this.gpuPrimeScene.name = "transition_gpu_prime_scene_HC031W2A52";
    this.gpuPrimeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    this.gpuPrimeCamera.position.set(0, 0, 0);
    this.gpuPrimeCamera.lookAt(0, 0, -1);
    this.gpuPrimeCamera.updateProjectionMatrix();
    this.gpuPrimeTarget = new THREE.WebGLRenderTarget(GPU_PRIME_TARGET_SIZE, GPU_PRIME_TARGET_SIZE, {
      depthBuffer: true,
      stencilBuffer: false
    });
    this.gpuPrimeTarget.texture.name = "transition_gpu_prime_target_HC031W2A52";
  }

  primeRenderableOffscreen(object) {
    if (!this.renderer?.render || !this.renderer?.setRenderTarget) {
      throw new Error("renderer_render_target_unavailable");
    }
    this.ensureGpuPrimeResources();

    const clone = object.clone(false);
    clone.name = `${object.name || object.type || "renderable"}__gpu_prime_clone`;
    clone.visible = true;
    clone.frustumCulled = false;
    clone.castShadow = false;
    clone.receiveShadow = false;
    clone.position.set(0, 0, -1);
    clone.quaternion.identity();
    clone.scale.set(1, 1, 1);
    clone.updateMatrix?.();
    clone.updateMatrixWorld?.(true);

    const previousTarget = this.renderer.getRenderTarget?.() ?? null;
    this.gpuPrimeScene.add(clone);
    try {
      this.renderer.setRenderTarget(this.gpuPrimeTarget);
      this.renderer.clear?.(true, true, true);
      this.renderer.render(this.gpuPrimeScene, this.gpuPrimeCamera);
    } finally {
      this.gpuPrimeScene.remove(clone);
      this.renderer.setRenderTarget(previousTarget);
    }
  }

  async primePreparedRenderables(boundary) {
    if (!GPU_PRIME_BOUNDARIES.has(boundary)) {
      return { status: "skipped_boundary_not_gpu_primed", boundary, primedCount: 0 };
    }
    if (!this.renderer?.render || !this.renderer?.setRenderTarget) {
      this.gpuPriming.lastStatus = "skipped_renderer_render_target_unavailable";
      return { status: this.gpuPriming.lastStatus, boundary, primedCount: 0 };
    }

    const queue = this.collectGpuPrimeRenderables(boundary);
    this.gpuPriming.activeBoundary = boundary;
    this.gpuPriming.queuedRenderableCount = queue.length;
    if (queue.length === 0) {
      this.gpuPriming.lastStatus = "complete_no_pending_renderables";
      return { status: this.gpuPriming.lastStatus, boundary, primedCount: 0 };
    }

    let primedCount = 0;
    let failedCount = 0;
    for (let index = 0; index < queue.length; index += 1) {
      const entry = queue[index];
      const renderableName = entry.object?.name || entry.object?.type || `renderable_${index + 1}`;
      const rootName = entry.root?.name || entry.root?.type || "unnamed_prepared_root";
      const startedAt = this.now();
      this.gpuPriming.lastRenderableName = renderableName;
      this.gpuPriming.lastRootName = rootName;
      this.gpuPriming.lastBoundary = boundary;

      try {
        this.primeRenderableOffscreen(entry.object);
        this.gpuPrimedRenderables.add(entry.object);
        primedCount += 1;
        this.gpuPriming.primedRenderableCount += 1;
        this.gpuPriming.sequence += 1;
        this.gpuPriming.lastStatus = "primed_offscreen_draw";
      } catch (error) {
        failedCount += 1;
        this.gpuPriming.failedRenderableCount += 1;
        this.gpuPriming.sequence += 1;
        this.gpuPriming.lastStatus = "prime_failed";
        this.lastError = `gpu_prime:${rootName}:${renderableName}: ${error?.message ?? String(error)}`;
      }

      const durationMs = Math.max(0, this.now() - startedAt);
      this.gpuPriming.lastDurationMs = durationMs;
      if (durationMs > this.gpuPriming.peakDurationMs) {
        this.gpuPriming.peakDurationMs = durationMs;
        this.gpuPriming.peakRenderableName = renderableName;
        this.gpuPriming.peakRootName = rootName;
      }
      this.gpuPriming.queuedRenderableCount = Math.max(0, queue.length - index - 1);
      this.publish(this.frameState, this.frameState.transitionContinuity?.lastRawDeltaMs ?? 0);

      if (index < queue.length - 1) {
        this.gpuPriming.yieldedIdleSlots += 1;
        await this.yieldGpuPrimeIdleSlot();
      }
    }

    this.gpuPriming.activeBoundary = "none";
    this.gpuPriming.lastStatus = failedCount > 0 ? "complete_with_failures" : "complete_offscreen_gpu_prime";
    this.publish(this.frameState, this.frameState.transitionContinuity?.lastRawDeltaMs ?? 0);
    return {
      status: this.gpuPriming.lastStatus,
      boundary,
      primedCount,
      failedCount,
      queuedCount: queue.length
    };
  }

  gpuPrimingSnapshot() {
    return { ...this.gpuPriming };
  }

  isRenderableVisibleWithinRoot(object, root) {
    if (!this.isGpuPrimeRenderable(object) || !root?.isObject3D) return false;
    let cursor = object;
    while (cursor) {
      if (cursor.visible === false) return false;
      if (cursor === root) break;
      cursor = cursor.parent;
    }
    if (cursor !== root) return false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    return materials.some((material) => material && material.visible !== false);
  }

  captureLiveDrawAttribution(frameState = this.frameState) {
    const items = [];
    let newlyDrawableCount = 0;
    let unprimedNewlyDrawableCount = 0;

    for (const record of this.activationRecords.values()) {
      const root = record.root;
      if (!root?.isObject3D || !GPU_PRIME_BOUNDARIES.has(record.boundary)) continue;
      root.traverse?.((object) => {
        if (!this.isGpuPrimeRenderable(object)) return;
        const drawable = this.isRenderableVisibleWithinRoot(object, root);
        const wasDrawable = this.liveDrawableState.get(object) === true;
        this.liveDrawableState.set(object, drawable);
        if (!drawable || wasDrawable) return;

        newlyDrawableCount += 1;
        const primed = this.gpuPrimedRenderables.has(object);
        if (!primed) unprimedNewlyDrawableCount += 1;
        if (items.length < LIVE_DRAW_ATTRIBUTION_MAX_ITEMS) {
          items.push({
            boundary: record.boundary,
            rootName: root.name || root.type || "unnamed_prepared_root",
            renderableName: object.name || object.type || "unnamed_renderable",
            primed
          });
        }
      });
    }

    if (newlyDrawableCount > 0) this.liveDrawAttribution.sequence += 1;
    this.liveDrawAttribution.frame = frameState?.frame ?? -1;
    this.liveDrawAttribution.cellId = frameState?.activeCellId ?? "none";
    this.liveDrawAttribution.boundary = this.currentTransition(frameState).id;
    this.liveDrawAttribution.newlyDrawableCount = newlyDrawableCount;
    this.liveDrawAttribution.unprimedNewlyDrawableCount = unprimedNewlyDrawableCount;
    this.liveDrawAttribution.overflowCount = Math.max(0, newlyDrawableCount - items.length);
    this.liveDrawAttribution.items = items;
    return this.liveDrawAttributionSnapshot();
  }

  liveDrawAttributionSnapshot() {
    return {
      ...this.liveDrawAttribution,
      items: this.liveDrawAttribution.items.map((item) => ({ ...item }))
    };
  }

  async warmPreparedShaders() {
    const roots = [...this.preparedRoots].filter((root) => !this.compiledRoots.has(root));
    if (!this.renderer || !this.camera || roots.length === 0) {
      this.shaderWarmup.lastStatus = "skipped_no_renderer_or_roots";
      return { status: "skipped_no_renderer_or_roots", rootCount: roots.length };
    }

    const startedAt = this.now();
    let compiledCount = 0;
    let preparedBounds = 0;
    let failedCount = 0;

    // HC-031W2A5: the previous warmup cloned roots into a temporary scene with
    // a synthetic AmbientLight. That can compile a different shader program
    // signature from the actual Host scene. Compile each real prepared root
    // against this.scene instead, as recommended by WebGLRenderer.compile().
    // One root per idle slot prevents the warmup itself becoming a transition hitch.
    for (let index = 0; index < roots.length; index += 1) {
      const root = roots[index];
      this.shaderWarmup.lastRootName = root?.name || root?.type || `prepared_root_${index + 1}`;
      preparedBounds += this.prepareGeometryBounds(root);

      try {
        if (typeof this.renderer.compileAsync === "function") {
          await this.renderer.compileAsync(root, this.camera, this.scene);
        } else if (typeof this.renderer.compile === "function") {
          this.renderer.compile(root, this.camera, this.scene);
        } else {
          this.shaderWarmup.lastStatus = "skipped_renderer_compile_unavailable";
          return {
            status: "skipped_renderer_compile_unavailable",
            rootCount: roots.length,
            compiledCount,
            geometryBoundsPrepared: preparedBounds
          };
        }
        this.compiledRoots.add(root);
        this.shaderWarmup.targetSceneCompiles += 1;
        compiledCount += 1;
      } catch (error) {
        // Do not stall transition ownership on a diagnostic/performance warmup.
        // Leave the root uncompiled so a later warmup job may retry it.
        failedCount += 1;
        this.shaderWarmup.failedRootCount += 1;
        this.shaderWarmup.lastStatus = "compile_failed";
        this.lastError = `shader_warmup:${this.shaderWarmup.lastRootName}: ${error?.message ?? String(error)}`;
      }

      if (index < roots.length - 1) await this.yieldWarmupIdleSlot();
    }

    this.shaderWarmup.geometryBoundsPrepared += preparedBounds;
    this.shaderWarmup.lastDurationMs = Math.max(0, this.now() - startedAt);
    this.shaderWarmup.lastStatus = failedCount > 0 ? "compiled_with_failures" : "compiled_target_scene_staged";
    return {
      status: this.shaderWarmup.lastStatus,
      rootCount: roots.length,
      compiledCount,
      failedCount,
      geometryBoundsPrepared: preparedBounds,
      targetScene: true,
      incrementalPerRoot: true
    };
  }

  prepareGeometryBounds(root) {
    let prepared = 0;
    root?.traverse?.((object) => {
      const geometry = object?.geometry;
      if (!geometry?.attributes?.position || geometry.boundingSphere) return;
      try {
        geometry.computeBoundingSphere?.();
        if (geometry.boundingSphere) prepared += 1;
      } catch (_error) {
        // Bounds are only warmup metadata; renderer ownership remains unchanged.
      }
    });
    return prepared;
  }

  yieldWarmupIdleSlot() {
    this.shaderWarmup.yieldedIdleSlots += 1;
    return new Promise((resolve) => {
      if (typeof globalThis.requestIdleCallback === "function") {
        globalThis.requestIdleCallback(() => resolve(), { timeout: Math.min(this.idleTimeoutMs, 240) });
        return;
      }
      globalThis.setTimeout(resolve, 16);
    });
  }

  yieldGpuPrimeIdleSlot() {
    return new Promise((resolve) => {
      if (typeof globalThis.requestIdleCallback === "function") {
        globalThis.requestIdleCallback(() => resolve(), { timeout: Math.min(this.idleTimeoutMs, 240) });
        return;
      }
      globalThis.setTimeout(resolve, 16);
    });
  }

  nextEligibleJob() {
    const boundaries = this.eligibleBoundaries(this.frameState);
    return this.jobs.find((job) => job.status === "pending" && boundaries.has(job.boundary)) ?? null;
  }

  eligibleBoundaries(frameState) {
    const activeCellId = frameState?.activeCellId ?? SURFACE_CELL_ID;
    const boundaries = new Set();

    if (activeCellId === SURFACE_CELL_ID) {
      boundaries.add("surface_to_guide");
      return boundaries;
    }

    if (activeCellId === GUIDE_CELL_ID) {
      boundaries.add("guide_to_hub");
      return boundaries;
    }

    if (activeCellId === COMB_CELL_ID) {
      const combComplete = Boolean(frameState?.combThresholdPlayable?.challengeComplete || frameState?.act1RouteHistory?.combThresholdPlayableCompleted);
      if (combComplete) boundaries.add("comb_to_aperture");
      return boundaries;
    }

    if (activeCellId === HUB_CELL_ID) {
      boundaries.add("hub_to_grave");
      boundaries.add("hub_to_vascular");
      boundaries.add("hub_to_silt");

      const convergenceComplete = Boolean(
        frameState?.hubInvestigationGameplay?.threeRouteConvergence?.completed
        || frameState?.act1RouteHistory?.hubThreeRouteConvergenceCompleted
      );
      if (convergenceComplete) boundaries.add("hub_to_comb");
      return boundaries;
    }

    return boundaries;
  }

  currentTransition(frameState) {
    const local = frameState.localCellMorph ?? {};
    const second = frameState.secondLocalCellMorph ?? {};

    if (local.phase === "morphing_continuous_control" && !local.completed) {
      return {
        id: "surface_to_guide",
        owner: "LocalCellMorphSystem",
        progress: local.progress ?? 0,
        phase: local.phase
      };
    }

    if (second.phase === "morphing_into_signal_chorus" && !second.completed) {
      return {
        id: "guide_to_hub",
        owner: "SecondLocalCellMorphSystem",
        progress: second.progress ?? 0,
        phase: second.phase
      };
    }

    const boundaryMorph = frameState.localCellBoundaryMorph ?? {};
    if (boundaryMorph.active) {
      return {
        id: boundaryMorph.activeBoundary ?? boundaryMorph.activeRecipeId ?? "recipe_driven_boundary",
        owner: "LocalCellBoundaryMorphSystem",
        progress: boundaryMorph.progress ?? 0,
        phase: boundaryMorph.activePhase ?? "recipe_driven_boundary_morph"
      };
    }

    return {
      id: "none",
      owner: frameState.firstSliceRuntimeMount?.transitionOwner ?? "none",
      progress: 0,
      phase: "between_handoffs"
    };
  }

  boundaryReady(boundary) {
    return this.jobs
      .filter((job) => job.boundary === boundary || job.boundary === "both")
      .every((job) => job.status === "complete");
  }

  publish(frameState, lastRawDeltaMs) {
    const transition = this.currentTransition(frameState);
    const now = frameState.runtimeSeconds ?? 0;
    const progressIdleSeconds = transition.id === "none" ? 0 : Math.max(0, now - this.lastProgressAt);
    const completedJobs = this.jobs.filter((job) => job.status === "complete");
    const failedJobs = this.jobs.filter((job) => job.status === "failed");

    frameState.transitionContinuity = {
      pass: "HC-016B",
      active: true,
      policy: "prepare_adjacent_local_cell_resources_without_transition_ownership",
      activeCellId: frameState.activeCellId ?? SURFACE_CELL_ID,
      activeBoundary: transition.id,
      transitionOwner: transition.owner,
      phase: transition.phase,
      progress: transition.progress,
      progressIdleSeconds,
      stalled: transition.id !== "none" && progressIdleSeconds > 0.75,
      lastRawDeltaMs,
      maxObservedFrameGapMs: this.maxObservedFrameGapMs,
      frameGapCount: this.frameGapCount,
      frameGapThresholdMs: 80,
      lastMountSequence: this.lastMountSequence,
      lastMountChangeFrame: this.lastMountChangeFrame,
      preparedJobCount: completedJobs.length,
      totalJobCount: this.jobs.length,
      pendingJobCount: this.jobs.filter((job) => job.status === "pending").length,
      eligibleBoundaryIds: [...this.eligibleBoundaries(frameState)],
      nextEligibleJobId: this.nextEligibleJob()?.id ?? "none",
      failedJobCount: failedJobs.length,
      surfaceToGuideReady: this.boundaryReady("surface_to_guide"),
      guideToHubReady: this.boundaryReady("guide_to_hub"),
      hubToGraveReady: this.boundaryReady("hub_to_grave"),
      hubToVascularPlayableReady: this.boundaryReady("hub_to_vascular"),
      hubToVascularContractReady: this.boundaryReady("hub_to_vascular"),
      hubToSiltContractReady: this.boundaryReady("hub_to_silt"),
      hubToSiltPlayableReady: this.boundaryReady("hub_to_silt"),
      hubToCombFoundationReady: this.boundaryReady("hub_to_comb"),
      combToApertureArrivalReady: this.boundaryReady("comb_to_aperture"),
      localDestinationPrepared: Boolean(this.localCellMorphSystem?.destinationPrepared),
      guideDestinationPrepared: Boolean(this.secondLocalCellMorphSystem?.destinationPrepared),
      shaderWarmupPass: this.shaderWarmup.pass,
      shaderWarmupPolicy: this.shaderWarmup.policy,
      shaderWarmupPreparedRootCount: this.preparedRoots.size,
      shaderWarmupCompiledRootCount: this.compiledRoots.size,
      shaderWarmupPendingRootCount: Math.max(0, this.preparedRoots.size - this.compiledRoots.size),
      shaderWarmupTargetSceneCompiles: this.shaderWarmup.targetSceneCompiles,
      shaderWarmupGeometryBoundsPrepared: this.shaderWarmup.geometryBoundsPrepared,
      shaderWarmupYieldedIdleSlots: this.shaderWarmup.yieldedIdleSlots,
      shaderWarmupFailedRootCount: this.shaderWarmup.failedRootCount,
      shaderWarmupLastRootName: this.shaderWarmup.lastRootName,
      shaderWarmupLastStatus: this.shaderWarmup.lastStatus,
      shaderWarmupLastDurationMs: this.shaderWarmup.lastDurationMs,
      gpuPrimingPass: this.gpuPriming.pass,
      gpuPrimingPolicy: this.gpuPriming.policy,
      gpuPrimingTargetSize: this.gpuPriming.targetSize,
      gpuPrimingRootLevelStagingRetired: this.gpuPriming.rootLevelStagingRetired,
      gpuPrimingActiveBoundary: this.gpuPriming.activeBoundary,
      gpuPrimingQueuedRenderableCount: this.gpuPriming.queuedRenderableCount,
      gpuPrimingPrimedRenderableCount: this.gpuPriming.primedRenderableCount,
      gpuPrimingFailedRenderableCount: this.gpuPriming.failedRenderableCount,
      gpuPrimingYieldedIdleSlots: this.gpuPriming.yieldedIdleSlots,
      gpuPrimingSequence: this.gpuPriming.sequence,
      gpuPrimingLastRenderableName: this.gpuPriming.lastRenderableName,
      gpuPrimingLastRootName: this.gpuPriming.lastRootName,
      gpuPrimingLastBoundary: this.gpuPriming.lastBoundary,
      gpuPrimingLastDurationMs: this.gpuPriming.lastDurationMs,
      gpuPrimingLastStatus: this.gpuPriming.lastStatus,
      gpuPrimingPeakDurationMs: this.gpuPriming.peakDurationMs,
      gpuPrimingPeakRenderableName: this.gpuPriming.peakRenderableName,
      gpuPrimingPeakRootName: this.gpuPriming.peakRootName,
      liveDrawAttributionPass: this.liveDrawAttribution.pass,
      liveDrawAttributionPolicy: this.liveDrawAttribution.policy,
      liveDrawAttributionSequence: this.liveDrawAttribution.sequence,
      liveDrawAttributionNewlyDrawableCount: this.liveDrawAttribution.newlyDrawableCount,
      liveDrawAttributionUnprimedCount: this.liveDrawAttribution.unprimedNewlyDrawableCount,
      liveDrawAttributionOverflowCount: this.liveDrawAttribution.overflowCount,
      activationStagingPass: this.activationStaging.pass,
      activationStagingPolicy: this.activationStaging.policy,
      activationStagingRenderBudgetMs: this.activationStaging.renderBudgetMs,
      activationStagingActiveBoundary: this.activationStaging.activeBoundary,
      activationStagingPreparedRootCount: this.activationRecords.size,
      activationStagingActivatedRootCount: this.activationStaging.activatedRootCount,
      activationStagingPendingRequestedRootCount: this.activationStaging.pendingRequestedRootCount,
      activationStagingDeferredByBudgetCount: this.activationStaging.deferredByBudgetCount,
      activationStagingLastActivatedRootName: this.activationStaging.lastActivatedRootName,
      activationStagingLastActivatedBoundary: this.activationStaging.lastActivatedBoundary,
      activationStagingLastActivatedFrame: this.activationStaging.lastActivatedFrame,
      activationStagingLastActivationSequence: this.activationStaging.lastActivationSequence,
      activationStagingActivatedThisCallback: this.activationStaging.activatedThisCallback,
      activationStagingHiddenThisRenderCount: this.activationStaging.hiddenThisRenderCount,
      activationStagingLastRenderMs: this.activationStaging.lastRenderMs ?? 0,
      activationStagingLastActivationRenderMs: this.activationStaging.lastActivationRenderMs,
      activationStagingPeakActivationRenderMs: this.activationStaging.peakActivationRenderMs,
      activationStagingPeakActivationRootName: this.activationStaging.peakActivationRootName,
      preparedSystemIds: [...this.registry.prepared.keys()],
      jobs: this.jobs.map(({ id, boundary, status, resultStatus, durationMs, completedAtFrame, error }) => ({
        id,
        boundary,
        status,
        resultStatus,
        durationMs,
        completedAtFrame,
        error
      })),
      lastError: this.lastError,
      fallback: "synchronous_prepare_if_player_reaches_boundary_first",
      activeUpdateBudgetsPreserved: "15/13/8 + Grave 7 + Vascular 8 + Silt 8 + Comb 7",
      dormantCompatibilitySystemCount: 20,
      progressionMutation: false,
      lockedOwners: [
        "SurfaceWakeLayeredInteractionSystem",
        "LocalCellMorphSystem",
        "GuideThresholdLayeredInteractionSystem",
        "SecondLocalCellMorphSystem",
        "HubInvestigationGameplaySystem",
        "GraveMemoryRouteSystem",
        "Act1RouteContractSystem",
        "VascularRhythmRouteSystem",
        "SiltPressureRouteSystem",
        "CombThresholdFoundationSystem",
        "StatusPageSystem",
        "ObjectiveSystem",
        "LocalCellBoundaryMorphSystem"
      ],
      cellRoles: {
        [SURFACE_CELL_ID]: "surface_wake",
        [GUIDE_CELL_ID]: "guide_threshold",
        [HUB_CELL_ID]: "hub_chamber"
        ,"CELL_GRAVE_MEMORY_RESIDUE_BED_001": "grave_memory_route"
        ,"CELL_VASCULAR_RHYTHM_ROUTE_001": "vascular_route"
        ,"CELL_SILT_PRESSURE_ROUTE_001": "silt_burrow_route"
        ,"CELL_COMB_THRESHOLD_FILTER_001": "comb_threshold"
      }
    };
  }

  now() {
    return globalThis.performance?.now?.() ?? Date.now();
  }
}
