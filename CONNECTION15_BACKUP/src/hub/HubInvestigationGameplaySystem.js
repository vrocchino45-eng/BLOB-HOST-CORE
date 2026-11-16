import * as THREE from "three";

const RECIPE_ID = "HUB_INVESTIGATION_GAMEPLAY_HC007C";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const TWO_PI = Math.PI * 2;

/**
 * HubInvestigationGameplaySystem owns Hub-local investigation and the HC-012C
 * three-route convergence weave. It publishes gameplay state only.
 * ObjectiveSystem and LocalCellBoundaryMorphSystem retain progression/persistence ownership;
 * HubChamberFoundationSystem retains all Hub presentation authority.
 */
export class HubInvestigationGameplaySystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem || !scene || !playerRoot || !frameState) {
      throw new Error("[HubInvestigationGameplaySystem] recipeDataSystem, scene, playerRoot, and frameState are required.");
    }
    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.recipe = null;
    this.root = null;
    this.routeMarkers = new Map();
    this.memoryMarker = null;
    this.centerMarker = null;
    this.routeReads = new Set();
    this.memoryRead = false;
    this.returnedToCenter = false;
    this.investigationReady = false;
    this.firstRouteRead = "none";
    this.nearestRouteId = "none";
    this.nearestRouteDistance = Infinity;
    this.lastPulseEventId = 0;
    this.lastAction = "arrive_at_hub_junction";
    this.responseSeconds = new Map();
    this.lastCommitEventId = "none";
    this.commitSelectionRadius = 2.1;
    this.commitCandidate = null;
    this.lastCommittedRouteId = "none";
    this.lastCommittedGateId = "none";
    this.commitLatch = null;

    this.convergenceStarted = false;
    this.convergenceCompleted = false;
    this.convergenceOrbitTravel = 0;
    this.convergenceCompression = 0;
    this.convergenceContinuity = 0;
    this.convergenceProgress = 0;
    this.convergenceDirection = 0;
    this.convergenceReversals = 0;
    this.convergenceLastAngle = null;
    this.convergenceLastPosition = new THREE.Vector3();
    this.convergenceHasLastPosition = false;
    this.convergenceCompletionFrame = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.get("hubInvestigationGameplayRecipes", RECIPE_ID);
    this.createVisuals();
    this.setVisible(false);
    this.frameState.hubInvestigationGameplay = this.createState(false);
  }

  update(dt, frameState) {
    const active = frameState.activeCellId === (this.recipe.sourceCellId ?? HUB_CELL_ID)
      && Boolean(frameState.hubChamberFoundation?.active);
    if (!active) {
      this.setVisible(false);
      this.convergenceLastAngle = null;
      this.convergenceHasLastPosition = false;
      this.commitCandidate = null;
      this.commitLatch = null;
      if (frameState.commitmentOpportunity?.sourceId === "hub_chamber") {
        frameState.commitmentOpportunity = null;
      }
      frameState.hubRouteCommit = this.createCommitState(false);
      frameState.hubInvestigationGameplay = this.createState(false);
      return;
    }

    this.setVisible(true);
    this.updateCommitLatch(frameState);
    this.updateNearestRoute();
    this.updateConvergence(dt, frameState);
    this.updateCommitCandidate(frameState);
    this.handleCommitEvent(frameState);
    this.publishCommitmentOpportunity(frameState);
    this.handlePulse(frameState);
    this.updateReturnToCenter();
    this.updateLocalResponse(dt, frameState);
    this.animate(dt, frameState.runtimeSeconds ?? 0);
    frameState.hubInvestigationGameplay = this.createState(true);
  }

  updateNearestRoute() {
    this.nearestRouteId = "none";
    this.nearestRouteDistance = Infinity;
    for (const route of this.recipe.routes ?? []) {
      const distance = this.playerRoot.position.distanceTo(this.vector(route.position));
      if (distance < this.nearestRouteDistance) {
        this.nearestRouteDistance = distance;
        this.nearestRouteId = route.id;
      }
    }
  }

  handlePulse(frameState) {
    const input = frameState.input ?? {};
    const eventId = input.pulseEventId ?? 0;
    if (!input.pulsePressed || eventId <= 0 || eventId === this.lastPulseEventId) return;
    this.lastPulseEventId = eventId;

    const convergence = this.getConvergenceState(frameState);
    if (convergence.available && !this.convergenceCompleted) {
      const config = this.recipe.threeRouteConvergence ?? {};
      if (convergence.readyForPulse && convergence.centerDistance <= (config.finalPulseRadius ?? 1.05)) {
        this.convergenceCompleted = true;
        this.convergenceProgress = 1;
        this.convergenceCompletionFrame = frameState.frame ?? 0;
        this.lastAction = "three_route_convergence_held_without_opening_comb";
      } else if (this.convergenceStarted) {
        this.convergenceContinuity = Math.max(0, this.convergenceContinuity - 0.035);
        this.lastAction = convergence.readyForPulse
          ? "convergence_pulse_outside_center"
          : "convergence_pulse_before_weave_coherent";
      }
      return;
    }

    const memory = this.recipe.memoryFragment ?? {};
    const memoryDistance = this.playerRoot.position.distanceTo(this.vector(memory.position));
    if (memoryDistance <= (memory.readRange ?? 1.5)) {
      this.memoryRead = true;
      this.lastAction = "first_memory_fragment_registered";
      return;
    }

    const route = (this.recipe.routes ?? []).find((item) => item.id === this.nearestRouteId);
    if (!route || this.nearestRouteDistance > (route.readRange ?? 1.8)) {
      this.lastAction = "pulse_found_no_route_response";
      return;
    }

    this.routeReads.add(route.id);
    if (this.firstRouteRead === "none") this.firstRouteRead = route.id;
    this.responseSeconds.set(route.id, 2.4);
    this.lastAction = `${route.id}_${route.response ?? "route_answered"}`;
  }

  updateCommitCandidate(frameState) {
    if (this.commitLatch) {
      this.commitCandidate = null;
      return;
    }

    const foundation = frameState.hubChamberFoundation ?? {};
    const firstDestinationInvitation = foundation.firstDestinationInvitation ?? {};
    const firstDestinationWindow = Boolean(
      firstDestinationInvitation.active
      && !frameState.act1RouteHistory?.graveEntered
    );

    // HC031P1: the first Grave commitment no longer waits on the stricter whole-Hub
    // screen-composition validator. That validator remains presentation truth only.
    // Later Hub destinations keep the established foundation.completed requirement.
    if (!foundation.completed && !firstDestinationWindow) {
      this.commitCandidate = null;
      return;
    }

    const bodies = [
      ...(foundation.routes ?? []),
      ...(foundation.thresholds ?? [])
    ];

    const candidates = bodies
      .filter((body) => body?.activeRoute)
      .filter((body) => body?.destinationMounted !== false)
      .filter((body) => body?.playableReady !== false)
      .filter((body) => !body?.gameplayPending)
      .filter((body) => Number.isFinite(body?.distanceToPlayer))
      .filter((body) => body.distanceToPlayer <= this.commitSelectionRadius)
      .sort((a, b) => a.distanceToPlayer - b.distanceToPlayer);

    this.commitCandidate = candidates[0] ?? null;
  }

  updateCommitLatch(frameState) {
    const latch = this.commitLatch;
    if (!latch) return;

    const flight = frameState.hubRouteCommitFlight ?? null;
    const boundary = frameState.localCellBoundaryMorph ?? null;
    const matchingFlight = Boolean(
      flight
      && flight.owner === "LocalCellBoundaryMorphSystem"
      && flight.routeId === latch.routeId
      && flight.gateId === latch.gateId
    );

    if (matchingFlight && flight.active) latch.ownerStarted = true;

    // Once the boundary owner has claimed the route, only an explicit cancel while
    // still in the Hub may release the latch. Normal completion changes activeCellId,
    // and the inactive-Hub branch clears the latch on the next ownership update.
    if (
      latch.ownerStarted
      && frameState.activeCellId === HUB_CELL_ID
      && !boundary?.active
      && matchingFlight
      && flight.active === false
      && (flight.progress ?? 0) < 0.999
    ) {
      this.commitLatch = null;
      if (frameState.hubRouteCommitRequest?.eventId === latch.eventId) {
        frameState.hubRouteCommitRequest = null;
      }
      this.lastAction = `${latch.routeId}_destination_commit_cancelled`;
    }
  }

  handleCommitEvent(frameState) {
    const event = frameState.deliberateCommitmentEvent ?? null;
    if (!event || event.eventId === this.lastCommitEventId) return;
    if (event.kind !== "hub_route_destination" || event.sourceId !== "hub_chamber") return;

    this.lastCommitEventId = event.eventId;
    if (this.commitLatch) {
      this.lastAction = `${this.commitLatch.routeId}_destination_commit_in_flight`;
      return;
    }

    const candidate = this.commitCandidate;
    if (!candidate || candidate.id !== event.targetId) {
      this.lastAction = "hub_commit_target_no_longer_available";
      return;
    }

    this.lastCommittedRouteId = candidate.id;
    this.lastCommittedGateId = candidate.gateId ?? "none";
    this.commitLatch = {
      routeId: candidate.id,
      gateId: candidate.gateId ?? "none",
      eventId: event.eventId,
      startedFrame: frameState.frame ?? 0,
      ownerStarted: false
    };
    frameState.hubRouteCommitRequest = {
      pass: "HC-031P1-HF1",
      eventId: event.eventId,
      routeId: candidate.id,
      gateId: candidate.gateId ?? "none",
      sourceCellId: HUB_CELL_ID,
      frame: frameState.frame ?? 0,
      status: "deliberate_route_commit_requested",
      latched: true,
      consequenceAuthority: "LocalCellBoundaryMorphSystem"
    };
    this.lastAction = `${candidate.id}_deliberate_route_commit`;
  }

  publishCommitmentOpportunity(frameState) {
    if (this.commitLatch) {
      if (frameState.commitmentOpportunity?.sourceId === "hub_chamber") {
        frameState.commitmentOpportunity = null;
      }
      frameState.hubRouteCommit = this.createCommitState(true);
      return;
    }

    const candidate = this.commitCandidate;
    if (!candidate) {
      if (frameState.commitmentOpportunity?.sourceId === "hub_chamber") {
        frameState.commitmentOpportunity = null;
      }
      frameState.hubRouteCommit = this.createCommitState(true);
      return;
    }

    frameState.commitmentOpportunity = {
      pass: "HC-028F1",
      available: true,
      kind: "hub_route_destination",
      targetId: candidate.id,
      sourceId: "hub_chamber",
      gateId: candidate.gateId ?? "none",
      label: candidate.displayName ?? candidate.id,
      distance: candidate.distanceToPlayer,
      persistentIntent: true,
      consequenceAuthority: "LocalCellBoundaryMorphSystem"
    };
    frameState.hubRouteCommit = this.createCommitState(true);
  }

  createCommitState(active) {
    const candidate = active && !this.commitLatch ? this.commitCandidate : null;
    const pending = Boolean(active && this.commitLatch);
    return {
      pass: "HC-031P1-HF1",
      active: Boolean(active),
      available: Boolean(candidate),
      pending,
      routeId: candidate?.id ?? this.commitLatch?.routeId ?? "none",
      gateId: candidate?.gateId ?? this.commitLatch?.gateId ?? "none",
      displayName: candidate?.displayName ?? (pending ? "Committed destination" : "none"),
      distance: Number.isFinite(candidate?.distanceToPlayer) ? candidate.distanceToPlayer : 0,
      selectionRadius: this.commitSelectionRadius,
      lastCommittedRouteId: this.lastCommittedRouteId,
      lastCommittedGateId: this.lastCommittedGateId,
      pendingEventId: this.commitLatch?.eventId ?? "none",
      control: "A / E",
      role: "deliberate_destination_commit",
      status: pending ? "commit_in_flight" : candidate ? "ready_for_deliberate_commit" : "no_commit_candidate",
      guidedApproach: true,
      genericInteract: false
    };
  }

  updateReturnToCenter() {
    const requiredReads = this.recipe.requirements?.routePulseReads ?? (this.recipe.routes ?? []).length;
    const investigationRead = this.routeReads.size >= requiredReads && this.memoryRead;
    const centerDistance = this.playerRoot.position.distanceTo(this.vector(this.recipe.center?.position));
    if (investigationRead && centerDistance <= (this.recipe.center?.returnRange ?? 0.72)) {
      this.returnedToCenter = true;
      this.investigationReady = true;
      if (!this.convergenceStarted) this.lastAction = "route_comparison_held_at_center";
    }
  }

  updateConvergence(_dt, frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const resolved = Boolean(
      history.hubThreeRouteConvergenceCompleted
      || this.threeRouteReadingsRetained(frameState)
    );

    if (!resolved) {
      this.convergenceStarted = false;
      this.convergenceCompleted = false;
      this.convergenceOrbitTravel = 0;
      this.convergenceCompression = 0;
      this.convergenceContinuity = 0;
      this.convergenceProgress = 0;
      this.convergenceDirection = 0;
      this.convergenceReversals = 0;
      return;
    }

    // HC028F1 retires the old movement-led spiral as mandatory Hub gameplay.
    // Genuine returned route consequences are sufficient to form the Comb selector.
    this.convergenceStarted = true;
    this.convergenceCompleted = true;
    this.convergenceOrbitTravel = TWO_PI;
    this.convergenceCompression = 1;
    this.convergenceContinuity = 1;
    this.convergenceProgress = 1;
    this.convergenceDirection = 0;
    this.convergenceReversals = 0;
    this.convergenceCompletionFrame = history.hubThreeRouteConvergenceFrame ?? (frameState.frame ?? 0);
    this.lastAction = "three_returned_routes_resolved_into_comb_selector";
  }

  threeRouteReadingsRetained(frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const grave = Boolean(history.graveReturned && history.graveMemoryImprintCommitted);
    const vascular = Boolean(
      history.vascularReturned
      && history.vascularCompleted
      && (history.vascularCadenceReads ?? 0) >= 3
    );
    const silt = Boolean(
      history.siltReturned
      && history.siltCompleted
      && history.siltPressureRead
      && history.siltRibsReleased
      && history.siltSafeMatterAbsorbed
      && history.siltDenseMatterLeftIntact
    );
    return grave && vascular && silt;
  }

  getConvergenceState(frameState) {
    const config = this.recipe.threeRouteConvergence ?? {};
    const center = this.vector(config.centerPosition ?? this.recipe.center?.position);
    const centerDistance = this.playerRoot.position.distanceTo(center);
    const orbitProgress = THREE.MathUtils.clamp(
      this.convergenceOrbitTravel / (config.requiredOrbitRadians ?? TWO_PI * 0.92),
      0,
      1
    );
    const readyForPulse = Boolean(
      this.convergenceStarted
      && orbitProgress >= 1
      && this.convergenceCompression >= (config.requiredCompression ?? 0.82)
      && this.convergenceContinuity >= (config.requiredContinuity ?? 0.38)
    );
    return {
      available: this.threeRouteReadingsRetained(frameState) && this.investigationReady,
      centerDistance,
      orbitProgress,
      readyForPulse
    };
  }

  updateLocalResponse(dt, frameState) {
    for (const [id, seconds] of this.responseSeconds) {
      this.responseSeconds.set(id, Math.max(0, seconds - dt));
    }
    const activeResponse = this.responseSeconds.get(this.nearestRouteId) ?? 0;
    if (activeResponse <= 0) return;

    const prior = frameState.physicalFeel ?? {};
    if (this.nearestRouteId === "vascular_route") {
      frameState.physicalFeel = {
        ...prior,
        pressure: Math.min(1, (prior.pressure ?? 0.45) + 0.08),
        boundaryBehavior: "hub_vascular_sleeping_rhythm_response"
      };
    } else if (this.nearestRouteId === "silt_burrow_route") {
      frameState.physicalFeel = {
        ...prior,
        viscosity: Math.min(0.9, (prior.viscosity ?? 0.5) + 0.16),
        boundaryBehavior: "hub_silt_dense_recoil_response"
      };
    } else if (this.nearestRouteId === "grave_memory_route") {
      frameState.physicalFeel = {
        ...prior,
        pressure: Math.max(0.28, (prior.pressure ?? 0.45) - 0.06),
        boundaryBehavior: "hub_grave_memory_inward_echo_response"
      };
    }
  }

  createVisuals() {
    this.root = new THREE.Group();
    this.root.name = "hub_investigation_gameplay_HC012C";
    Object.assign(this.root.userData, {
      targetingSuppressed: true,
      logicOnly: true,
      visualAuthorityDelegatedTo: "HubChamberFoundationSystem",
      spatialAuthorityPass: "HC-012C"
    });
    this.scene.add(this.root);
  }

  animate(_dt, _t) {
    // Presentation remains exclusively owned by HubChamberFoundationSystem.
  }

  createState(active) {
    const routeCount = (this.recipe?.routes ?? []).length;
    const routeReadCount = this.routeReads.size;
    const allRoutesRead = routeCount > 0 && routeReadCount >= routeCount;
    const progress = active
      ? Math.min(1, (routeReadCount + Number(this.memoryRead) + Number(this.returnedToCenter)) / (routeCount + 2))
      : 0;
    const commit = this.frameState.hubRouteCommit ?? {};
    let objectiveLine = commit.available
      ? `Press A to commit to ${commit.displayName}.`
      : "Move to an awake route body; it will brighten when it can carry you.";
    let guideLine = "The Hub is a junction, not a puzzle. Approach the living condition you want to enter.";
    if (allRoutesRead && !this.memoryRead) {
      objectiveLine = "The suspended memory can still be Pulled/read with Pulse if you want more context.";
      guideLine = "The routes are distinct. A fragment at the center remembers why the distinction matters.";
    } else if (allRoutesRead && this.memoryRead && !this.returnedToCenter) {
      objectiveLine = "The three readings can still be compared at center, but route choice does not depend on it.";
      guideLine = "You have read each edge. Meaning forms only when the readings meet at one center.";
    } else if (this.investigationReady) {
      objectiveLine = "The three readings are held together. Choose what living condition to investigate next.";
      guideLine = this.frameState.act1RouteHistory?.graveReturned
        ? "The junction remembers the Grave return: one route remains open while two new rhythms answer but hold."
        : "The junction is now a self-reading: one route answers, two remain dormant.";
    } else if (this.nearestRouteId !== "none" && this.nearestRouteDistance <= 2.6) {
      const route = (this.recipe?.routes ?? []).find((item) => item.id === this.nearestRouteId);
      objectiveLine = this.routeReads.has(this.nearestRouteId)
        ? `${route?.displayName ?? "This route"} is read. Investigate another route.`
        : `${route?.displayName ?? "This route"} can be Pulled/read with Pulse, or entered with A when awake.`;
    }

    const activeResponse = [...this.responseSeconds.entries()]
      .filter(([, seconds]) => seconds > 0)
      .sort((a, b) => b[1] - a[1])[0] ?? null;
    const convergence = this.getConvergenceState(this.frameState);
    const config = this.recipe?.threeRouteConvergence ?? {};
    if (active && this.convergenceCompleted) {
      guideLine = "The three returned conditions have resolved into the Combward selector without another Hub puzzle.";
      objectiveLine = commit.available
        ? `Press A to commit to ${commit.displayName}.`
        : "Move to the Combward body; it will brighten when passage is ready.";
    } else if (active && commit.available) {
      guideLine = `${commit.displayName} is awake and close enough to accept a deliberate destination choice.`;
      objectiveLine = `Press A to commit to ${commit.displayName}.`;
    } else if (active) {
      guideLine = "Awake route bodies are destinations. Reading them with Pulse is optional; entering them is a deliberate choice.";
      objectiveLine = "Move to the route body you want to enter.";
    }

    return {
      pass: "HC-028F1",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      status: !active
        ? "inactive"
        : this.convergenceCompleted
          ? "three_route_hub_convergence_complete"
          : convergence.available
            ? "three_route_hub_convergence_active"
            : this.investigationReady
              ? "hub_investigation_converged"
              : "hub_systemic_investigation",
      progress,
      systemicPlay: Boolean(active),
      routeReadCount,
      routeCount,
      routeReads: [...this.routeReads],
      allRoutesRead,
      memoryRead: Boolean(this.memoryRead),
      returnedToCenter: Boolean(this.returnedToCenter),
      investigationReady: Boolean(active && this.investigationReady),
      nearestRouteId: active ? this.nearestRouteId : "none",
      nearestRouteDistance: active && Number.isFinite(this.nearestRouteDistance) ? this.nearestRouteDistance : 0,
      firstRouteRead: this.firstRouteRead,
      lastAction: this.lastAction,
      responseRouteId: activeResponse?.[0] ?? "none",
      responseSecondsRemaining: activeResponse?.[1] ?? 0,
      threeRouteConvergence: {
        pass: "HC-012C",
        mode: "automatic_return_resolution",
        available: Boolean(active && convergence.available),
        active: Boolean(active && convergence.available && this.convergenceStarted && !this.convergenceCompleted),
        started: Boolean(this.convergenceStarted),
        completed: Boolean(this.convergenceCompleted),
        progress: this.convergenceCompleted ? 1 : this.convergenceProgress,
        orbitProgress: convergence.orbitProgress,
        compressionProgress: this.convergenceCompression,
        continuity: this.convergenceContinuity,
        direction: this.convergenceDirection,
        reversalCount: this.convergenceReversals,
        centerDistance: convergence.centerDistance,
        centerPosition: {
          x: (config.centerPosition ?? this.recipe?.center?.position ?? [0, 0, 0])[0] ?? 0,
          y: (config.centerPosition ?? this.recipe?.center?.position ?? [0, 0, 0])[1] ?? 0,
          z: (config.centerPosition ?? this.recipe?.center?.position ?? [0, 0, 0])[2] ?? 0
        },
        entryRadius: config.entryRadius ?? 3.25,
        innerRadius: config.innerRadius ?? 0.82,
        finalPulseRadius: config.finalPulseRadius ?? 1.05,
        readyForPulse: convergence.readyForPulse,
        completionFrame: this.convergenceCompletionFrame,
        routeOrderIndependent: true,
        routeTriggerChecklist: false,
        oneFinalPulse: false,
        recoverableWithoutRestart: true,
        combwardBodyReadable: Boolean(this.convergenceCompleted),
        combThresholdCrossable: false,
        directGateMutation: false,
        directObjectiveMutation: false,
        guideLine,
        objectiveLine,
        nextAction: objectiveLine
      },
      statusPageTriggerPreserved: true,
      spatialAuthorityPass: "HC-012C",
      visualAuthorityDelegatedTo: "HubChamberFoundationSystem",
      logicOnly: true,
      duplicateInvestigationMarkersDisabled: true,
      volumetricPresentationPass: "HC-012C",
      routeAltitudeTerritories: {
        vascular_route: "upper",
        grave_memory_route: "middle",
        silt_burrow_route: "lower"
      },
      idleRouteRingsSuppressed: true,
      graveGateTriggerPreserved: true,
      directObjectiveCompletion: false,
      dormantRoutesOpened: false,
      targetRequired: false,
      inputRequired: Boolean(commit.available),
      movementRequired: true,
      routeCommit: this.createCommitState(active),
      guideLine,
      objectiveLine,
      nextAction: objectiveLine
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }

  vector(values) {
    const [x = 0, y = 0, z = 0] = values ?? [];
    return new THREE.Vector3(x, y, z);
  }
}
