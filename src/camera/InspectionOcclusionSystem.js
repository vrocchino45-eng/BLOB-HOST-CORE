import * as THREE from "three";

/**
 * HC-006D inspection-only composition support.
 * Fades only presentation geometry that intersects the camera-to-focus corridor,
 * reduces nearby ambient clutter, and supplies a non-targeting focus marker.
 */
export class InspectionOcclusionSystem {
  constructor({ scene }) {
    if (!scene) throw new Error("[InspectionOcclusionSystem] scene is required.");
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.rayDirection = new THREE.Vector3();
    this.focusPosition = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();
    this.playerPosition = new THREE.Vector3();
    this.focusProbe = new THREE.Vector3();
    this.probeRight = new THREE.Vector3();
    this.probeUp = new THREE.Vector3();
    this.probeTarget = new THREE.Vector3();
    this.blocked = new Map();

    // HC-016P: Tight Camera previously performed recursive whole-scene raycasts
    // plus full scene traversals every frame. Dense early Host spaces made that
    // disproportionately expensive. Cache eligible meshes and sample the
    // occlusion solve while keeping marker/fade interpolation responsive.
    this.fadeCandidates = [];
    this.ambientCandidates = [];
    this.candidateRefreshSeconds = 0;
    this.occlusionSampleSeconds = 0;
    this.candidateRefreshInterval = 0.65;
    this.occlusionSampleInterval = 0.075;
    this.lastBlockers = [];
    this.lastCorridorDistance = 0;

    this.marker = this.createMarker();
    this.scene.add(this.marker);
  }

  update(dt, frameState, camera, playerRoot) {
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const active = Boolean(inspection.active && camera && playerRoot);

    if (!active) {
      this.restoreAll(dt);
      this.marker.visible = false;
      frameState.inspectionComposition = this.createState(false, [], 0);
      return;
    }

    this.focusPosition.set(
      inspection.focusPosition?.x ?? 0,
      inspection.focusPosition?.y ?? 0,
      inspection.focusPosition?.z ?? 0
    );

    const showFocusMarker = inspection.showFocusMarker !== false;
    this.marker.visible = showFocusMarker;
    this.marker.position.copy(this.focusPosition);
    if (showFocusMarker) {
      const pulse = 0.9 + Math.sin((frameState.runtimeSeconds ?? 0) * 3.2) * 0.08;
      this.marker.scale.setScalar((inspection.focusMarkerScale ?? 0.72) * pulse);
      this.marker.quaternion.copy(camera.quaternion);
    }

    const origin = camera.position.clone();
    // HC015L: protect a real camera→player/focus sight corridor, not just two center rays.
    // Tight camera is intentionally close; selective fading prevents nearby anatomy
    // from becoming a wall without globally thinning the organism.
    playerRoot.getWorldPosition(this.playerPosition);
    const distance = origin.distanceTo(this.focusPosition);
    if (distance <= 0.001) {
      this.restoreAll(dt);
      frameState.inspectionComposition = this.createState(true, [], 0, inspection);
      return;
    }

    camera.updateMatrixWorld(true);

    this.candidateRefreshSeconds -= dt;
    this.occlusionSampleSeconds -= dt;

    if (this.candidateRefreshSeconds <= 0 || this.fadeCandidates.length === 0) {
      this.refreshCandidates(playerRoot, inspection.focusObjectId);
      this.candidateRefreshSeconds = this.candidateRefreshInterval;
    }

    // Occlusion solving is presentation support, not simulation truth. Sample it
    // at ~13 Hz instead of recursively scanning the full scene every render frame.
    if (this.occlusionSampleSeconds <= 0) {
      this.occlusionSampleSeconds = this.occlusionSampleInterval;

      this.probeRight.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      this.probeUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      const corridorRadius = inspection.corridorRadius ?? 0.62;
      // Five probes per target (10 total) are enough to protect the screen-space
      // corridor without the previous 18 recursive scene raycasts per frame.
      const offsets = [
        [0, 0],
        [ corridorRadius, 0], [-corridorRadius, 0],
        [0, corridorRadius], [0, -corridorRadius]
      ];
      const bases = [this.focusPosition, this.playerPosition];
      const current = new Set();
      const blockers = [];
      let corridorRayCount = 0;

      for (const base of bases) {
        for (const [rightOffset, upOffset] of offsets) {
          this.probeTarget.copy(base)
            .addScaledVector(this.probeRight, rightOffset)
            .addScaledVector(this.probeUp, upOffset);
          this.rayDirection.copy(this.probeTarget).sub(origin);
          const probeDistance = this.rayDirection.length();
          if (probeDistance <= 0.001) continue;

          this.rayDirection.normalize();
          this.raycaster.set(origin, this.rayDirection);
          this.raycaster.far = Math.max(0.1, probeDistance - 0.08);
          corridorRayCount += 1;

          // Candidates are exact meshes, so recursive traversal is unnecessary.
          const intersections = this.raycaster.intersectObjects(this.fadeCandidates, false);
          for (const hit of intersections) {
            const object = hit.object;
            current.add(object);
            const label = object.name || "unnamed_presentation_object";
            if (!blockers.includes(label)) blockers.push(label);

            const nearFactor = THREE.MathUtils.clamp(
              1 - hit.distance / Math.max(1.2, probeDistance),
              0,
              1
            );
            const baseOpacity = inspection.blockerOpacity ?? 0.035;
            const blockerOpacity = Math.max(
              0.008,
              baseOpacity * (1 - nearFactor * 0.72)
            );
            this.fadeObject(object, blockerOpacity);
            if (blockers.length >= 24) break;
          }
        }
      }

      const nearCameraRadius = inspection.nearCameraFadeRadius ?? 2.15;
      for (const object of this.fadeCandidates) {
        object.getWorldPosition(this.worldPosition);
        const cameraDistance = this.worldPosition.distanceTo(origin);
        if (cameraDistance > nearCameraRadius) continue;
        current.add(object);
        const label = object.name || "unnamed_presentation_object";
        if (!blockers.includes(label)) blockers.push(label);
        const t = THREE.MathUtils.clamp(cameraDistance / nearCameraRadius, 0, 1);
        this.fadeObject(object, 0.008 + t * 0.025);
      }

      this.reduceCachedAmbientDensity(camera, inspection.ambientDensityScale ?? 0.30, current);
      this.restoreMissing(current, dt);

      this.lastBlockers = blockers;
      this.lastCorridorDistance = distance;
      this.lastCorridorRayCount = corridorRayCount;
    }

    frameState.inspectionComposition = {
      ...this.createState(true, this.lastBlockers, this.lastCorridorDistance, inspection),
      pass: "HC-016P",
      candidateCount: this.fadeCandidates.length,
      ambientCandidateCount: this.ambientCandidates.length,
      corridorRayCount: this.lastCorridorRayCount ?? 0,
      occlusionSampleInterval: this.occlusionSampleInterval,
      candidateRefreshInterval: this.candidateRefreshInterval,
      performanceMode: "cached_mesh_candidates_sampled_occlusion"
    };
  }

  refreshCandidates(playerRoot, focusObjectId) {
    const fade = [];
    const ambient = [];

    this.scene.traverse((object) => {
      if (!object?.isMesh || !object.material) return;

      const isAmbient =
        object.userData?.ambientOnly ||
        object.name?.includes("conduction_mote");

      if (isAmbient) ambient.push(object);
      if (this.isFadeable(object, playerRoot, focusObjectId)) fade.push(object);
    });

    this.fadeCandidates = fade;
    this.ambientCandidates = ambient;
  }

  reduceCachedAmbientDensity(camera, densityScale, current) {
    const cameraPosition = camera.position;
    for (const object of this.ambientCandidates) {
      object.getWorldPosition(this.worldPosition);
      if (this.worldPosition.distanceTo(cameraPosition) > 4.6) continue;
      current.add(object);
      this.fadeObject(object, Math.max(0.02, this.getOpacity(object) * densityScale));
    }
  }

  isFadeable(object, playerRoot, focusObjectId) {
    if (!object || !object.material) return false;
    if (object === playerRoot || this.isDescendantOf(object, playerRoot)) return false;
    if (object.name === focusObjectId) return false;
    if (object.userData?.inspectionNeverFade) return false;
    return Boolean(
      object.userData?.inspectionFadeable ||
      object.userData?.livingTissue ||
      object.userData?.ambientOnly ||
      object.name?.includes("signal_chorus_tissue_lobe") ||
      object.name?.includes("signal_chorus_living_filament") ||
      object.name?.includes("signal_chorus_conduction_mote")
    );
  }

  isDescendantOf(object, ancestor) {
    let current = object?.parent ?? null;
    while (current) {
      if (current === ancestor) return true;
      current = current.parent;
    }
    return false;
  }

  fadeObject(object, opacity) {
    if (!this.blocked.has(object)) {
      this.blocked.set(object, this.captureMaterials(object));
    }
    this.setOpacity(object, opacity);
  }

  restoreMissing(current, dt) {
    for (const [object, materials] of [...this.blocked.entries()]) {
      if (current.has(object)) continue;
      const done = this.restoreObject(object, materials, dt);
      if (done) this.blocked.delete(object);
    }
  }

  restoreAll(dt) {
    for (const [object, materials] of [...this.blocked.entries()]) {
      const done = this.restoreObject(object, materials, dt);
      if (done) this.blocked.delete(object);
    }
  }

  restoreObject(object, materials, dt) {
    const blend = 1 - Math.exp(-dt * 12);
    let done = true;
    materials.forEach((entry) => {
      const material = entry.material;
      if (!material) return;
      material.opacity += (entry.opacity - material.opacity) * blend;
      if (Math.abs(material.opacity - entry.opacity) > 0.01) done = false;
    });
    return done;
  }

  captureMaterials(object) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    return materials.filter(Boolean).map((material) => ({ material, opacity: material.opacity ?? 1 }));
  }

  getOpacity(object) {
    const material = Array.isArray(object.material) ? object.material[0] : object.material;
    return material?.opacity ?? 1;
  }

  setOpacity(object, opacity) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.filter(Boolean).forEach((material) => {
      material.transparent = true;
      material.opacity = Math.min(material.opacity ?? 1, opacity);
      material.depthWrite = false;
    });
  }

  createMarker() {
    const group = new THREE.Group();
    group.name = "inspection_focus_marker_HC006D";
    group.visible = false;
    group.userData.inspectionNeverFade = true;
    group.userData.targetingSuppressed = true;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.014, 8, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffefb0,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      })
    );
    ring.renderOrder = 1000;
    group.add(ring);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        depthTest: false
      })
    );
    dot.renderOrder = 1001;
    group.add(dot);
    return group;
  }

  createState(active, blockers, corridorDistance, inspection = {}) {
    return {
      pass: "HC-016P",
      active,
      focusMode: inspection.focusMode ?? "none",
      focusMarker: active && inspection.showFocusMarker !== false ? "visible_non_targeting" : "hidden",
      corridorClear: blockers.length === 0,
      fadedBlockerCount: blockers.length,
      fadedBlockers: blockers,
      corridorDistance,
      corridorMode: "dual_target_multi_ray_protected_corridor",
      corridorRadius: inspection.corridorRadius ?? 0.62,
      nearCameraFadeRadius: inspection.nearCameraFadeRadius ?? 2.15,
      ambientDensityReduced: active,
      routeActivated: false,
      targetCreated: false
    };
  }
}
