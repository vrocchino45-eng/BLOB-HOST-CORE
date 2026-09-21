import * as THREE from "three";

const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";

/**
 * HC-010G owns the reusable enter/mount/return boundary for the Vascular and
 * Silt routes. HC-012A retains that foundation while dedicated Vascular and
 * Silt systems own their mounted gameplay and presentation.
 */
export class Act1RouteContractSystem {
  constructor({ recipeDataSystem = null, contract = null, playerRoot, frameState }) {
    if (!recipeDataSystem && !contract) {
      throw new Error("[Act1RouteContractSystem] recipeDataSystem or contract is required.");
    }
    if (!playerRoot || !frameState) {
      throw new Error("[Act1RouteContractSystem] playerRoot and frameState are required.");
    }

    this.recipeDataSystem = recipeDataSystem;
    this.contract = contract;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.routesByCell = new Map();
    this.activeRoute = null;
    this.entryAnchor = new THREE.Vector3();
    this.returnFoldPosition = new THREE.Vector3();
    this.priorPhysicalFeel = null;
    this.mountCounts = new Map();
    this.prepared = false;
  }

  init() {
    this.contract = this.contract ?? this.recipeDataSystem?.data?.act1RouteContracts;
    if (!["ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC010G", "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC011A", "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC012A"].includes(this.contract?.id)) {
      throw new Error("[Act1RouteContractSystem] Missing authored three-route contract.");
    }

    for (const route of this.contract.routes ?? []) {
      if (!route.runtimeCellId || this.routesByCell.has(route.runtimeCellId)) {
        throw new Error(`[Act1RouteContractSystem] Invalid or duplicate route cell: ${route.runtimeCellId}`);
      }
      this.routesByCell.set(route.runtimeCellId, route);
    }

    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.prepared = true;
    this.publish(frameState, false);
    return {
      status: "act1_route_contracts_prepared_hidden",
      routeCount: this.routesByCell.size,
      mutatesProgression: false,
      activeCellId: frameState.activeCellId
    };
  }

  onRuntimeMount(frameState) {
    const route = this.routesByCell.get(frameState.activeCellId);
    if (!route) {
      throw new Error(`[Act1RouteContractSystem] No authored contract for ${frameState.activeCellId}.`);
    }

    this.activeRoute = route;
    this.entryAnchor.copy(this.playerRoot.position);
    const returnOffset = route.returnFold?.position ?? [0, 0, 0];
    this.returnFoldPosition.copy(this.entryAnchor).add(new THREE.Vector3().fromArray(returnOffset));
    this.priorPhysicalFeel = this.clonePhysicalFeel(frameState.physicalFeel);
    this.mountCounts.set(route.id, (this.mountCounts.get(route.id) ?? 0) + 1);
    this.applyPhysicalFeel(frameState, route);
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    if (this.priorPhysicalFeel) {
      frameState.physicalFeel = this.clonePhysicalFeel(this.priorPhysicalFeel);
    }
    this.activeRoute = null;
    this.priorPhysicalFeel = null;
    this.publish(frameState, false);
  }

  update(_dt, frameState) {
    const route = this.routesByCell.get(frameState.activeCellId) ?? null;
    if (!route) return;
    if (!this.activeRoute || this.activeRoute.id !== route.id) {
      this.onRuntimeMount(frameState);
    }

    this.applyPhysicalFeel(frameState, route);
    this.publish(frameState, true);
  }

  applyPhysicalFeel(frameState, route) {
    const feel = route.physicalFeel ?? {};
    const flow = feel.flowVector ?? [0, 0, 0];
    const bounds = route.movementBounds ?? {};
    const radii = bounds.radii ?? [4.4, 3.2, 6.4];

    frameState.physicalFeel = {
      ...(frameState.physicalFeel ?? {}),
      viscosity: feel.viscosity ?? 0.5,
      pressure: feel.pressure ?? 0.5,
      flowVector: {
        x: flow[0] ?? 0,
        y: flow[1] ?? 0,
        z: flow[2] ?? 0
      },
      boundaryBehavior: feel.boundaryBehavior ?? "route_contract_soft_recoil",
      movementBounds: {
        active: true,
        mode: "entry_anchored_ellipsoid",
        center: {
          x: this.entryAnchor.x,
          y: this.entryAnchor.y,
          z: this.entryAnchor.z
        },
        radii: {
          x: radii[0],
          y: radii[1],
          z: radii[2]
        },
        owner: "PlayerMovementController",
        tuningOwner: "Act1RouteContractSystem",
        regionId: route.id,
        centerSource: "preserved_gate_entry_position"
      }
    };
  }

  publish(frameState, active) {
    const route = active ? this.activeRoute : null;
    const vascularGameplay = frameState.vascularRhythmRoute ?? {};
    const siltGameplay = frameState.siltPressureRoute ?? {};
    const routeReturnReady = route?.id === "vascular_route" && route.gameplayReady === true
      ? vascularGameplay.returnFoldReady === true
      : route?.id === "silt_burrow_route" && route.gameplayReady === true
        ? siltGameplay.returnFoldReady === true
        : Boolean(route);
    const returnDistance = route
      ? this.playerRoot.position.distanceTo(this.returnFoldPosition)
      : 0;
    const routes = (this.contract?.routes ?? []).map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      runtimeCellId: entry.runtimeCellId,
      entryGateId: entry.entryGateId,
      returnGateId: entry.returnGateId,
      destinationMounted: true,
      gameplayReady: entry.gameplayReady === true,
      mountCount: this.mountCounts.get(entry.id) ?? 0
    }));

    frameState.act1RouteContract = {
      pass: this.contract?.pass ?? "HC-012A",
      foundationPass: "HC-010G",
      id: this.contract?.id ?? "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC012A",
      active: Boolean(active && route),
      regionId: route?.id ?? "none",
      displayName: route?.displayName ?? "Act 1 route contract",
      runtimeCellId: route?.runtimeCellId ?? "none",
      contractStatus: route
        ? route.gameplayReady === true
          ? "mounted_playable_route_contract"
          : "mounted_foundation_gameplay_pending"
        : "prepared_inactive",
      preparedHidden: this.prepared,
      routeCount: routes.length,
      routes,
      destinationMounted: Boolean(route),
      gameplayReady: Boolean(route?.gameplayReady),
      gameplayOwner: route?.gameplayOwner ?? "Act1RouteContractSystem",
      presentationOwner: route?.presentationOwner ?? "Act1RouteContractSystem",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      persistenceOwner: "LocalCellBoundaryMorphSystem",
      entryPosition: route ? {
        x: this.entryAnchor.x,
        y: this.entryAnchor.y,
        z: this.entryAnchor.z
      } : null,
      returnFoldPosition: route ? {
        x: this.returnFoldPosition.x,
        y: this.returnFoldPosition.y,
        z: this.returnFoldPosition.z
      } : null,
      returnFoldDistance: returnDistance,
      returnFoldInteractionRange: route?.returnFold?.interactionRange ?? 1.35,
      returnFoldReady: Boolean(routeReturnReady),
      returnGateId: route?.returnGateId ?? "none",
      movementBoundaryMode: frameState.physicalFeel?.movementBounds?.mode ?? "inactive",
      movementBoundaryOwner: frameState.physicalFeel?.movementBounds?.owner ?? "PlayerMovementController",
      movementBoundaryTuningOwner: frameState.physicalFeel?.movementBounds?.tuningOwner ?? "none",
      playerPositionPreserved: true,
      forcedRelocation: false,
      directCellMutation: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      newAbilityUnlocks: 0,
      objectiveLine: route?.id === "vascular_route" && route.gameplayReady === true
        ? (vascularGameplay.objectiveLine ?? "Move with the circulation charge and learn its living cadence.")
        : route?.id === "silt_burrow_route" && route.gameplayReady === true
          ? (siltGameplay.objectiveLine ?? "Read compression, brace living ribs, and choose porous matter without pulling packed residue.")
        : route
          ? `${route.displayName} has a living destination mount. Its dedicated play circuit is still forming.`
        : "Two route foundations wait behind the Hub.",
      guideLine: route?.id === "vascular_route" && route.gameplayReady === true
        ? (vascularGameplay.guideLine ?? "The Vascular current is taking gameplay ownership of this mounted destination.")
        : route?.id === "silt_burrow_route" && route.gameplayReady === true
          ? (siltGameplay.guideLine ?? "Silt Pressure is taking gameplay ownership of this mounted destination.")
        : route
          ? "The route can hold a Core and remember a return. It does not yet pretend to be complete gameplay."
        : "Vascular Rhythm and Silt Pressure now have bounded destinations without empty player-facing crossings.",
      nextAction: route?.id === "vascular_route" && route.gameplayReady === true
        ? (vascularGameplay.nextAction ?? "Follow the moving charge through the living vessel.")
        : route?.id === "silt_burrow_route" && route.gameplayReady === true
          ? (siltGameplay.nextAction ?? "Move into the low ribs and Pulse to read their compression.")
        : route
          ? "Return through the preserved fold. The dedicated route pass must earn passage from the Hub."
        : "Complete Grave Memory to wake both route identities in the Hub.",
      hubCellId: HUB_CELL_ID
    };
  }

  clonePhysicalFeel(source) {
    if (!source) return null;
    return {
      ...source,
      flowVector: source.flowVector ? { ...source.flowVector } : undefined,
      movementBounds: source.movementBounds ? {
        ...source.movementBounds,
        center: source.movementBounds.center ? { ...source.movementBounds.center } : undefined,
        radii: source.movementBounds.radii ? { ...source.movementBounds.radii } : undefined
      } : undefined
    };
  }
}
