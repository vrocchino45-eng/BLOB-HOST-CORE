import * as THREE from "three";

const SURFACE_CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const GUIDE_CELL_ID = "CELL_SCAR_FLOW_FOLD_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const COMB_CELL_ID = "CELL_COMB_THRESHOLD_FILTER_001";

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
        this.preparedRoots.add(root);
      }

      job.status = "complete";
      job.resultStatus = result?.status ?? "complete";
      job.completedAtFrame = this.frameState.frame ?? 0;
    } catch (error) {
      for (const root of this.scene.children.filter((item) => !sceneChildrenBefore.has(item))) {
        root.visible = false;
        root.userData.transitionPrepared = true;
        this.preparedRoots.add(root);
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

  async warmPreparedShaders() {
    const roots = [...this.preparedRoots].filter((root) => !this.compiledRoots.has(root));
    if (!this.renderer || !this.camera || roots.length === 0) {
      return { status: "skipped_no_renderer_or_roots" };
    }

    const warmScene = new THREE.Scene();
    warmScene.add(new THREE.AmbientLight(0xffffff, 1));

    for (const root of roots) {
      const clone = root.clone(true);
      clone.traverse((child) => {
        child.visible = true;
      });
      warmScene.add(clone);
    }

    try {
      if (typeof this.renderer.compileAsync === "function") {
        await this.renderer.compileAsync(warmScene, this.camera);
      } else if (typeof this.renderer.compile === "function") {
        this.renderer.compile(warmScene, this.camera);
      }
    } catch (error) {
      warmScene.clear();
      for (const root of roots) this.compiledRoots.add(root);
      return {
        status: "renderer_compile_fallback",
        rootCount: roots.length,
        error: error?.message ?? String(error)
      };
    }

    warmScene.clear();
    for (const root of roots) this.compiledRoots.add(root);
    return { status: "compiled", rootCount: roots.length };
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
