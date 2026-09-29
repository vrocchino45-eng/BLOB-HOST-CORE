import * as THREE from "three";

const CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";
const TERRITORY_ID = "gathering_ground_cluster";

const clamp01 = (value) => Math.max(0, Math.min(1, value));

/**
 * HC031T1 — adjacent-territory access + detachment-truth repair.
 *
 * Converts the existing Gathering Ground background landmark into a three-ring
 * world-space relationship without creating a new level or teleport:
 *   Ring C: distant unresolved Host silhouette
 *   Ring B: remotely observable/reactive neighboring territory
 *   Ring A: local high-detail territory after continuous physical approach
 *
 * This system owns only the neighboring territory's presentation + read-only
 * interaction state. ApertureFieldsArrivalSystem remains movement-bound owner;
 * PlayerMovementController remains player movement owner; no active-cell,
 * route-history, targeting, chemistry, or crossing truth is mutated here.
 */
export class ApertureAdjacentTerritorySystem {
  constructor({ scene, camera, playerRoot, frameState }) {
    if (!scene || !camera || !playerRoot || !frameState) {
      throw new Error("[ApertureAdjacentTerritorySystem] scene, camera, playerRoot and frameState are required.");
    }
    this.scene = scene;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.root = null;
    this.entryAnchor = new THREE.Vector3();
    this.territoryLocal = new THREE.Vector3(3.5, 8.5, -62.0);
    this.territoryWorld = new THREE.Vector3();
    this.cameraWorld = new THREE.Vector3();
    this.cameraDirection = new THREE.Vector3();
    this.toTerritory = new THREE.Vector3();
    this.aimPointWorld = new THREE.Vector3();
    this.aimVector = new THREE.Vector3();
    this.acquisitionBodies = [];

    this.ghostBody = null;
    this.detailBodies = [];
    this.connectiveBodies = [];
    this.responseHalos = [];

    this.lastPulseEventId = -1;
    this.observationCount = 0;
    this.observationSequence = 0;
    this.relationshipSeconds = 0;
    this.relationshipEstablished = false;
    this.relationshipSequence = 0;
    this.traversalOpened = false;
    this.traversalSequence = 0;
    this.enteredTerritory = false;
    this.entrySequence = 0;
    this.absorbEcho = 0;
    this.pulseResponse = 0;
  }

  init() {
    if (this.root) return;

    this.root = new THREE.Group();
    this.root.name = "aperture_adjacent_gathering_territory_HC031T1";
    this.root.visible = false;
    this.scene.add(this.root);

    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x314653,
      emissive: 0x0c1820,
      emissiveIntensity: 0.08,
      roughness: 0.95,
      transparent: true,
      opacity: 0.13,
      depthWrite: false
    });
    this.ghostBody = new THREE.Mesh(new THREE.IcosahedronGeometry(5.2, 2), ghostMat);
    this.ghostBody.position.copy(this.territoryLocal);
    this.ghostBody.scale.set(1.45, 0.82, 1.85);
    this.ghostBody.rotation.set(0.28, -0.22, 0.16);
    this.ghostBody.name = "gathering_ground_adjacent_ghost_body";
    this.root.add(this.ghostBody);
    this.acquisitionBodies.push(this.ghostBody);

    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x597a72,
      emissive: 0x17362f,
      emissiveIntensity: 0.14,
      roughness: 0.88,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 5; i += 1) {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(3.2 + i * 0.35, 18, 10, 0, Math.PI * 2, 0.36, 0.74),
        membraneMat.clone()
      );
      const a = -0.9 + i * 0.45;
      body.position.copy(this.territoryLocal).add(new THREE.Vector3(
        Math.sin(a) * (4.8 + i * 0.35),
        -1.8 + i * 0.92,
        Math.cos(a) * (2.2 + i * 0.25) - i * 0.8
      ));
      body.scale.set(1.15 + i * 0.08, 0.16 + (i % 2) * 0.08, 2.0 - i * 0.12);
      body.rotation.set(Math.PI * 0.46, a * 0.36, a * 0.72);
      body.name = `gathering_ground_neighbor_membrane_${i + 1}`;
      body.userData.baseScale = body.scale.clone();
      body.userData.baseOpacity = body.material.opacity;
      this.root.add(body);
      this.detailBodies.push(body);
      this.acquisitionBodies.push(body);
    }

    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x9bc9bc,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    for (let i = 0; i < 3; i += 1) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(6.4 + i * 1.1, 0.045 + i * 0.012, 6, 48),
        haloMat.clone()
      );
      halo.position.copy(this.territoryLocal);
      halo.position.y += -1.1 + i * 1.25;
      halo.rotation.set(Math.PI / 2.1, 0.18 * i, 0.28 * i);
      halo.name = `gathering_ground_remote_response_halo_${i + 1}`;
      this.root.add(halo);
      this.responseHalos.push(halo);
      this.acquisitionBodies.push(halo);
    }

    // Low-cost connective anatomy from the already-playable Membrane Ridge toward
    // the neighboring territory. It is faint while unresolved and becomes legible
    // when the ridge has been read. It is visual guidance, never a rail.
    const connectionMat = new THREE.MeshStandardMaterial({
      color: 0x4f7e78,
      emissive: 0x143b37,
      emissiveIntensity: 0.14,
      roughness: 0.9,
      transparent: true,
      opacity: 0.025,
      depthWrite: false
    });
    for (let i = 0; i < 3; i += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(18.0 - i * 1.6, 1.2 + i * 0.45, -45.0 - i * 0.6),
        new THREE.Vector3(13.0 - i * 1.2, 3.1 + i * 0.65, -50.5 - i * 1.1),
        new THREE.Vector3(8.2 - i * 0.8, 5.4 + i * 0.75, -56.4 - i * 0.9),
        this.territoryLocal.clone().add(new THREE.Vector3(-2.2 + i * 2.1, -1.2 + i * 0.6, 1.8 - i * 0.7))
      ]);
      const conduit = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 44, 0.14 + i * 0.035, 7, false),
        connectionMat.clone()
      );
      conduit.name = `membrane_to_gathering_connective_${i + 1}`;
      conduit.userData.baseOpacity = conduit.material.opacity;
      this.root.add(conduit);
      this.connectiveBodies.push(conduit);
    }
  }

  resetState() {
    this.lastPulseEventId = -1;
    this.observationCount = 0;
    this.observationSequence = 0;
    this.relationshipSeconds = 0;
    this.relationshipEstablished = false;
    this.relationshipSequence = 0;
    this.traversalOpened = false;
    this.traversalSequence = 0;
    this.enteredTerritory = false;
    this.entrySequence = 0;
    this.absorbEcho = 0;
    this.pulseResponse = 0;
  }

  onRuntimeMount(frameState) {
    this.init();
    // HC031T2: ApertureFieldsArrivalSystem owns the region's canonical world anchor.
    // Debug staging may reposition the player during this same mount frame, so later
    // systems must never derive authored world geometry from the player's live position.
    const canonicalAnchor = frameState.apertureFieldsArrival?.entryAnchor;
    if (Number.isFinite(canonicalAnchor?.x) && Number.isFinite(canonicalAnchor?.y) && Number.isFinite(canonicalAnchor?.z)) {
      this.entryAnchor.set(canonicalAnchor.x, canonicalAnchor.y, canonicalAnchor.z);
    } else {
      this.entryAnchor.copy(this.playerRoot.position);
    }
    this.root.position.copy(this.entryAnchor);
    this.root.visible = true;
    this.resetState();
    this.publish(frameState, "distant_unresolved");
  }

  onRuntimeUnmount(frameState) {
    if (this.root) this.root.visible = false;
    frameState.adjacentHostTerritory = {
      ...(frameState.adjacentHostTerritory ?? {}),
      active: false,
      stage: this.enteredTerritory ? "local_territory_retained" : "distant_territory_retained"
    };
  }

  onRuntimePrepare(frameState) {
    this.init();
    frameState.adjacentHostTerritoryPreparation = {
      pass: "HC-031T1",
      status: "prepared_hidden",
      mutatesProgression: false,
      mutatesActiveCell: false
    };
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== CELL_ID) return;
    if (!this.root) this.init();
    this.root.visible = true;

    this.territoryWorld.copy(this.entryAnchor).add(this.territoryLocal);
    this.camera.getWorldPosition(this.cameraWorld);
    this.camera.getWorldDirection(this.cameraDirection).normalize();
    const playerDistance = this.playerRoot.position.distanceTo(this.territoryWorld);

    // HC031T1: Gathering Ground is a macro body, not a point target. Acquire against
    // the visible ghost body, membranes, and response rings, then keep the best
    // camera alignment. This does not replace TargetingSystem or create a new noun owner.
    let aimDot = -1;
    let cameraDistance = Infinity;
    let aimSource = "none";
    for (const body of this.acquisitionBodies) {
      if (!body) continue;
      this.aimPointWorld.copy(this.entryAnchor).add(body.position);
      this.aimVector.copy(this.aimPointWorld).sub(this.cameraWorld);
      const distance = Math.max(0.001, this.aimVector.length());
      const dot = this.aimVector.multiplyScalar(1 / distance).dot(this.cameraDirection);
      if (dot > aimDot) {
        aimDot = dot;
        cameraDistance = distance;
        aimSource = body.name || "gathering_ground_macro_body";
      }
    }
    const aimThreshold = 0.62;
    const aimed = aimDot >= aimThreshold;

    const input = frameState.input ?? {};
    const pulseEventId = Number.isFinite(input.pulseEventId)
      ? input.pulseEventId
      : (input.pulsePressed ? (frameState.frame ?? 0) : -1);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) this.lastPulseEventId = pulseEventId;

    // Pulse can interrogate the large neighboring body before it is reachable.
    // Distance affects response strength, but not by turning this into a hidden gate.
    if (freshPulse && aimed && playerDistance <= 86.0) {
      this.observationCount = Math.min(3, this.observationCount + 1);
      this.observationSequence += 1;
      this.pulseResponse = 1;
    }
    this.pulseResponse = Math.max(0, this.pulseResponse - dt * 0.72);

    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    if (stabilizeHeld && aimed && this.observationCount > 0 && playerDistance <= 82.0) {
      this.relationshipSeconds = Math.min(2.0, this.relationshipSeconds + dt);
      if (!this.relationshipEstablished && this.relationshipSeconds >= 0.72) {
        this.relationshipEstablished = true;
        this.relationshipSequence += 1;
      }
    } else if (!this.relationshipEstablished) {
      this.relationshipSeconds = Math.max(0, this.relationshipSeconds - dt * 1.8);
    }

    // Absorb does not pull a massive territory across the map. It receives a weak
    // inward answer once the remote relationship exists, preserving verb meaning.
    const absorbHeld = Boolean(input.absorbHeld);
    const absorbAnswering = Boolean(absorbHeld && aimed && this.relationshipEstablished && playerDistance <= 78.0);
    this.absorbEcho += ((absorbAnswering ? 1 : 0) - this.absorbEcho) * Math.min(1, dt * 3.4);

    const ridgeComplete = Boolean(frameState.membraneRidgeGameplay?.completed);
    if (ridgeComplete && !this.traversalOpened) {
      this.traversalOpened = true;
      this.traversalSequence += 1;
    }

    const entryRadius = 13.5;
    if (this.traversalOpened && !this.enteredTerritory && playerDistance <= entryRadius) {
      this.enteredTerritory = true;
      this.entrySequence += 1;
    }

    const time = frameState.runtimeSeconds ?? 0;
    const observation01 = this.observationCount / 3;
    const relationship01 = this.relationshipEstablished ? 1 : clamp01(this.relationshipSeconds / 0.72);
    const local01 = this.enteredTerritory
      ? 1
      : this.traversalOpened
        ? clamp01((30.0 - playerDistance) / 20.0)
        : 0;

    if (this.ghostBody?.material) {
      const breath = 1 + Math.sin(time * (0.32 + relationship01 * 0.55)) * (0.018 + relationship01 * 0.035);
      this.ghostBody.scale.set(1.45 * breath, 0.82 * (1 + relationship01 * 0.025), 1.85 * breath);
      this.ghostBody.material.opacity = 0.11 + observation01 * 0.16 + local01 * 0.16;
      this.ghostBody.material.emissiveIntensity = 0.06 + observation01 * 0.16 + relationship01 * 0.24 + this.pulseResponse * 0.22;
    }

    this.detailBodies.forEach((body, index) => {
      const base = body.userData.baseScale;
      const pulse = 1 + Math.sin(time * (0.44 + relationship01 * 0.68) - index * 0.52) * (0.018 + relationship01 * 0.045);
      body.scale.set(base.x * pulse, base.y * (1 + relationship01 * 0.18 + this.absorbEcho * 0.08), base.z * pulse);
      body.material.opacity = (body.userData.baseOpacity ?? 0.08)
        + observation01 * 0.12
        + relationship01 * 0.15
        + local01 * 0.30;
      body.material.emissiveIntensity = 0.10 + observation01 * 0.12 + relationship01 * 0.22 + this.absorbEcho * 0.14;
    });

    this.responseHalos.forEach((halo, index) => {
      halo.rotation.z += dt * (0.05 + relationship01 * (0.12 + index * 0.025));
      halo.material.opacity = observation01 * (0.04 + index * 0.012)
        + this.pulseResponse * (0.12 - index * 0.018)
        + relationship01 * 0.055;
    });

    this.connectiveBodies.forEach((body, index) => {
      const baseOpacity = body.userData.baseOpacity ?? 0.025;
      body.material.opacity = this.traversalOpened
        ? 0.18 + relationship01 * 0.10 + local01 * 0.12 + index * 0.012
        : baseOpacity + observation01 * 0.025 + relationship01 * 0.055;
      body.material.emissiveIntensity = this.traversalOpened
        ? 0.28 + relationship01 * 0.22
        : 0.10 + relationship01 * 0.12;
    });

    const stage = this.enteredTerritory
      ? "local_high_detail_territory"
      : this.traversalOpened
        ? "continuous_approach_open"
        : this.relationshipEstablished
          ? "remote_relationship_established"
          : this.observationCount > 0
            ? "neighbor_remotely_observed"
            : "distant_unresolved";

    this.publish(frameState, stage, {
      aimDot,
      aimed,
      aimSource,
      aimThreshold,
      playerDistance,
      cameraDistance,
      absorbAnswering,
      entryRadius
    });
  }

  publish(frameState, stage, metrics = {}) {
    const observationStage = this.observationCount <= 0
      ? "silhouette"
      : this.observationCount === 1
        ? "contour"
        : this.observationCount === 2
          ? "living_motion"
          : "territory_function";
    const detailTier = this.enteredTerritory
      ? "ring_a_local"
      : (this.observationCount > 0 || this.traversalOpened)
        ? "ring_b_neighbor"
        : "ring_c_distant";

    frameState.adjacentHostTerritory = {
      pass: "HC-031T1",
      active: true,
      territoryId: TERRITORY_ID,
      regionId: "aperture_fields",
      runtimeCellId: CELL_ID,
      stage,
      detailTier,
      observationStage,
      observationCount: this.observationCount,
      observationSequence: this.observationSequence,
      relationshipSeconds: this.relationshipSeconds,
      relationshipEstablished: this.relationshipEstablished,
      relationshipSequence: this.relationshipSequence,
      absorbEcho01: this.absorbEcho,
      traversalOpen: this.traversalOpened,
      traversalSequence: this.traversalSequence,
      connectiveAnatomyVisible: this.traversalOpened,
      enteredTerritory: this.enteredTerritory,
      entrySequence: this.entrySequence,
      distance: Number.isFinite(metrics.playerDistance) ? metrics.playerDistance : null,
      cameraDistance: Number.isFinite(metrics.cameraDistance) ? metrics.cameraDistance : null,
      aimDot: Number.isFinite(metrics.aimDot) ? metrics.aimDot : -1,
      aimed: Boolean(metrics.aimed),
      aimSource: metrics.aimSource ?? "none",
      aimThreshold: Number.isFinite(metrics.aimThreshold) ? metrics.aimThreshold : 0.62,
      observationReady: Boolean(metrics.aimed && Number.isFinite(metrics.playerDistance) && metrics.playerDistance <= 86.0),
      entryRadius: metrics.entryRadius ?? 13.5,
      macroInteraction: {
        pulse: "remote_contour_and_function_read",
        stabilize: "remote_relationship_hold",
        absorb: "weak_inward_answer_only_after_relationship"
      },
      mapRing: detailTier,
      movementBoundsExpansionRequested: this.traversalOpened,
      activeCellChangesRequired: false,
      teleportRequired: false,
      targetingAuthorityChanged: false,
      movementAuthority: "PlayerMovementController",
      movementBoundsOwner: "ApertureFieldsArrivalSystem",
      nextAction: this.enteredTerritory
        ? "explore_the_now_local_gathering_territory_and_look_back_across_aperture"
        : this.traversalOpened
          ? "follow_the_living_connective_anatomy_into_the_neighboring_territory"
          : this.relationshipEstablished
            ? "finish_reading_membrane_ridge_to_make_the_physical_connection_traversable"
            : this.observationCount > 0
              ? "hold_stabilize_toward_the_answering_large_body"
              : "aim_at_the_distant_gathering_body_and_pulse"
    };
  }
}
