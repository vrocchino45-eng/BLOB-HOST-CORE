import * as THREE from "three";

const CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";

export class MembraneRidgeGameplaySystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene || !playerRoot || !frameState) throw new Error("[MembraneRidgeGameplaySystem] scene, playerRoot and frameState are required.");
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.root = null;
    this.entryAnchor = new THREE.Vector3();
    this.previousPlayerPosition = new THREE.Vector3();
    this.hasPreviousPosition = false;
    this.traceIndex = 0;
    this.traceDistance = 0;
    this.completed = false;
    this.response = 0;
    this.bands = [];
    this.requiredTraceDistance = 3.4;
  }

  init() {
    if (this.root) return;
    this.root = new THREE.Group();
    this.root.name = "membrane_ridge_movement_gameplay_HC015N";
    this.root.visible = false;
    this.scene.add(this.root);

    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x6f9a82, emissive: 0x173b2d, emissiveIntensity: 0.16,
      roughness: 0.86, transparent: true, opacity: 0.42, depthWrite: false
    });
    const receptiveMat = new THREE.MeshStandardMaterial({
      color: 0xc4d69b, emissive: 0x536a31, emissiveIntensity: 0.28,
      roughness: 0.62, transparent: true, opacity: 0.62, depthWrite: false
    });

    // Three broad living contours wrap the existing Membrane Ridge landmark.
    // They are not waypoint rings: the player must MOVE while inside a contour.
    const specs = [
      { p: [13.7, 0.3, -40.4], r: [1.18, 0.18, 0.42], s: [1.25, 1.0, 1.0] },
      { p: [18.0, 1.3, -44.0], r: [1.46, -0.08, -0.18], s: [1.45, 1.0, 1.0] },
      { p: [21.7, 2.1, -47.4], r: [1.22, 0.24, -0.68], s: [1.28, 1.0, 1.0] }
    ];

    specs.forEach((spec, index) => {
      const group = new THREE.Group();
      group.position.fromArray(spec.p);
      group.rotation.set(...spec.r);
      group.scale.fromArray(spec.s);

      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(2.15 + index * 0.18, 0.16, 9, 46, Math.PI * 1.42),
        membraneMat.clone()
      );
      arc.name = `membrane_ridge_contour_${index + 1}`;
      group.add(arc);

      const receptive = new THREE.Mesh(
        new THREE.TorusGeometry(2.18 + index * 0.18, 0.055, 7, 42, Math.PI * 0.72),
        receptiveMat.clone()
      );
      receptive.rotation.z = -0.28 + index * 0.24;
      receptive.name = `membrane_ridge_receptive_edge_${index + 1}`;
      group.add(receptive);

      this.root.add(group);
      this.bands.push({ group, arc, receptive, localPosition: new THREE.Vector3(...spec.p), progress: 0, read: false });
    });
  }

  resetEncounter() {
    this.traceIndex = 0;
    this.traceDistance = 0;
    this.completed = false;
    this.response = 0;
    this.hasPreviousPosition = false;
    for (const band of this.bands) {
      band.progress = 0;
      band.read = false;
    }
  }

  onRuntimeMount(frameState) {
    this.init();
    this.entryAnchor.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);
    this.root.visible = false;
    this.resetEncounter();
    frameState.membraneRidgeGameplay = {
      pass: "HC-016P", active: false, stage: "awaiting_signal_plain", contourIndex: 0,
      contourCount: this.bands.length, completed: false
    };
  }

  onRuntimeUnmount(frameState) {
    if (this.root) this.root.visible = false;
    frameState.membraneRidgeGameplay = {
      ...(frameState.membraneRidgeGameplay ?? {}),
      active: false,
      stage: this.completed ? "ridge_read_retained" : "dormant"
    };
  }

  onRuntimePrepare(frameState) {
    this.init();
    frameState.membraneRidgeGameplayPreparation = { pass: "HC-016P", status: "prepared_hidden", mutatesProgression: false };
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== CELL_ID) return;
    if (!this.root) this.init();

    const unlocked = Boolean(frameState.signalPlainEcology?.completed);
    this.root.visible = unlocked;
    if (!unlocked) {
      frameState.membraneRidgeGameplay = {
        pass: "HC-016P", active: false, stage: "awaiting_signal_plain",
        contourIndex: 0, contourCount: this.bands.length, completed: false
      };
      return;
    }

    const player = this.playerRoot.position;
    let moved = 0;
    if (this.hasPreviousPosition) moved = player.distanceTo(this.previousPlayerPosition);
    this.previousPlayerPosition.copy(player);
    this.hasPreviousPosition = true;

    const activeBand = this.bands[this.traceIndex] ?? null;
    let activeDistance = Infinity;
    let tracing = false;

    if (activeBand && !this.completed) {
      const worldCenter = this.entryAnchor.clone().add(activeBand.localPosition);
      activeDistance = player.distanceTo(worldCenter);
      const insideContour = activeDistance <= 4.15;
      const meaningfulMovement = moved >= 0.012 && moved <= 1.4;

      // Progress is earned by physically tracing through the living contour.
      // Standing still, camera motion, or firing a verb cannot complete it.
      if (insideContour && meaningfulMovement) {
        this.traceDistance += moved;
        tracing = true;
      }

      activeBand.progress = THREE.MathUtils.clamp(this.traceDistance / this.requiredTraceDistance, 0, 1);
      if (this.traceDistance >= this.requiredTraceDistance) {
        activeBand.read = true;
        activeBand.progress = 1;
        this.traceIndex += 1;
        this.traceDistance = 0;
        if (this.traceIndex >= this.bands.length) {
          this.completed = true;
          this.response = 0.001;
        }
      }
    }

    if (this.completed) this.response = Math.min(1, this.response + dt * 0.48);

    const time = frameState.runtimeSeconds ?? 0;
    this.bands.forEach((band, index) => {
      const isActive = !this.completed && index === this.traceIndex;
      const isRead = band.read || this.completed;
      const pulse = 1 + Math.sin(time * (isActive ? 2.1 : 0.72) - index * 0.7) * (isActive ? 0.08 : 0.025);
      band.group.scale.setScalar(pulse);
      band.arc.material.opacity = isRead ? 0.20 : isActive ? 0.58 : 0.28;
      band.receptive.material.opacity = isRead ? 0.24 : isActive ? 0.82 : 0.30;
      band.receptive.material.emissiveIntensity = isActive ? 0.62 : isRead ? 0.18 : 0.24;
    });

    frameState.membraneRidgeGameplay = {
      pass: "HC-016P",
      active: true,
      stage: this.completed ? "ridge_pressure_read" : tracing ? "tracing_contour" : "approach_active_contour",
      mechanic: "movement_traces_living_pressure_contour",
      contourIndex: Math.min(this.traceIndex + 1, this.bands.length),
      contourCount: this.bands.length,
      activeContourDistance: Number.isFinite(activeDistance) ? activeDistance : null,
      activeContourProgress: this.completed ? 1 : (activeBand?.progress ?? 0),
      traceDistance: this.traceDistance,
      requiredTraceDistance: this.requiredTraceDistance,
      tracing,
      completed: this.completed,
      localResponse: this.response,
      mutatesGlobalProgression: false,
      currentPlayableEndpoint: this.completed,
      nextGameplayImplemented: false,
      gatheringGroundRole: this.completed ? "distant_ecology_landmark_only" : "not_yet_revealed",
      nextAction: this.completed
        ? "current_slice_complete_observe_gathering_ground_landmark"
        : tracing
          ? "keep_moving_through_the_living_contour"
          : "enter_the_bright_edge_and_move_along_it"
    };
  }
}
