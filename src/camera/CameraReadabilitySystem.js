import * as THREE from "three";

export class CameraReadabilitySystem {
  constructor({ camera, playerRoot, visualComposer, frameState }) {
    if (!camera) throw new Error("[CameraReadabilitySystem] camera is required.");
    if (!playerRoot) throw new Error("[CameraReadabilitySystem] playerRoot is required.");
    if (!visualComposer) throw new Error("[CameraReadabilitySystem] visualComposer is required.");

    this.camera = camera;
    this.playerRoot = playerRoot;
    this.visualComposer = visualComposer;
    this.frameState = frameState;

    this.playerPosition = new THREE.Vector3();
    this.cameraPosition = new THREE.Vector3();
    this.objectPosition = new THREE.Vector3();
    this.ecologyFocusPosition = new THREE.Vector3();
    this.closestPoint = new THREE.Vector3();
    this.segment = new THREE.Vector3();
    this.pointToCamera = new THREE.Vector3();
    this.tmpBox = new THREE.Box3();
    this.tmpSphere = new THREE.Sphere();

    this.occluderSilhouettes = new Set([
      "curved_soft_pocket",
      "scar_flow_fold_surface",
      "signal_chorus_nerve_surface",
      "bloom_residue_fork_surface",
      "soft_fog_volume",
      "scar_pressure_haze",
      "signal_chorus_haze",
      "bloom_residue_choice_haze"
    ]);
  }

  update(_dt, frameState = this.frameState) {
    if (!this.camera || !this.playerRoot || !this.visualComposer) return;

    this.frameState = frameState;
    this.playerRoot.getWorldPosition(this.playerPosition);
    this.camera.getWorldPosition(this.cameraPosition);

    let maxIntensity = 0;
    let sourceSurfaceIntensity = 0;
    let occludedObjectId = "none";
    let skippedBounds = 0;
    let fadedSourceSurfaces = 0;
    let activeSurfaceFade = 0;
    let ecologyOcclusionIntensity = 0;
    let ecologyOccludedObjectId = "none";
    const ecologyPrimary = frameState.entityLocalMatterCoupling?.primary ?? null;
    const ecologyPosition = ecologyPrimary?.position ?? null;
    const ecologyFocusValid = Boolean(
      frameState.entityLocalMatterCoupling?.active
      && (ecologyPrimary?.strength01 ?? 0) > 0.08
      && ecologyPosition
      && [ecologyPosition.x, ecologyPosition.y, ecologyPosition.z].every(Number.isFinite)
    );
    if (ecologyFocusValid) {
      this.ecologyFocusPosition.set(ecologyPosition.x, ecologyPosition.y, ecologyPosition.z);
    }
    const ecologyFocusDistance = ecologyFocusValid ? this.playerPosition.distanceTo(this.ecologyFocusPosition) : 0;
    const ecologyPocketEligible = ecologyFocusValid && ecologyFocusDistance <= 4.2;

    for (const item of this.visualComposer.composedObjects ?? []) {
      const root = item.root;
      if (!root?.visible) continue;

      const silhouette = root.userData?.silhouette ?? "unknown";
      if (!this.occluderSilhouettes.has(silhouette)) {
        this.fadeObject(root, 0);
        continue;
      }

      const intensity = this.safeOcclusionIntensity(root, silhouette);
      if (intensity === null) {
        skippedBounds += 1;
        this.fadeObject(root, 0);
        continue;
      }

      const ecologyIntensity = ecologyPocketEligible
        ? this.safeEcologyOcclusionIntensity(root, silhouette)
        : 0;
      const combinedIntensity = Math.max(intensity, (ecologyIntensity ?? 0) * 0.88);
      this.fadeObject(root, combinedIntensity);

      if ((ecologyIntensity ?? 0) > ecologyOcclusionIntensity) {
        ecologyOcclusionIntensity = ecologyIntensity ?? 0;
        ecologyOccludedObjectId = root.userData?.objectId ?? root.name ?? "unknown";
      }

      if (this.isSourceCellSurface(root, silhouette)) {
        sourceSurfaceIntensity = Math.max(sourceSurfaceIntensity, combinedIntensity);
        if (combinedIntensity > 0.15) fadedSourceSurfaces += 1;
      }

      if (this.isActiveCellSurface(silhouette)) {
        activeSurfaceFade = Math.max(activeSurfaceFade, combinedIntensity);
      }

      if (combinedIntensity > maxIntensity) {
        maxIntensity = combinedIntensity;
        occludedObjectId = root.userData?.objectId ?? root.name ?? "unknown";
      }
    }

    const ecologyPocketProtected = ecologyPocketEligible && ecologyOcclusionIntensity > 0.10;
    const playPocketActive = maxIntensity > 0.16 || sourceSurfaceIntensity > 0.10 || ecologyPocketProtected;
    const autoPullback = playPocketActive
      ? Math.max(maxIntensity * 2.25, sourceSurfaceIntensity * 2.65, ecologyOcclusionIntensity * 1.55)
      : 0;
    const pocketLift = playPocketActive
      ? Math.max(0.10, maxIntensity * 0.42, ecologyOcclusionIntensity * 0.18)
      : 0;

    frameState.cameraReadability = {
      pass: "HC-003C",
      foregroundFade: maxIntensity > 0.08 ? "active" : "inactive",
      occlusionIntensity: maxIntensity,
      sourceSurfaceIntensity,
      activeSurfaceFade,
      fadedSourceSurfaces,
      occludedObjectId,
      ecologyPocketProtected,
      ecologyFocusEntityId: ecologyPocketEligible ? (ecologyPrimary?.entityId ?? "none") : "none",
      ecologyFocusDistance,
      ecologyOcclusionIntensity,
      ecologyOccludedObjectId,
      skippedBounds,
      playerHalo: "active",
      playPocketWindow: playPocketActive ? "active" : "clear",
      autoPullback,
      pocketLift,
      status: "ok",
      note: ecologyPocketProtected
        ? "existing foreground tissue softly yields to preserve the Core-organism consequence corridor"
        : playPocketActive
          ? "foreground/source tissue faded and camera pulled back to preserve the local play pocket"
          : "camera-player sightline clear"
    };
  }

  safeOcclusionIntensity(root, silhouette) {
    try {
      return this.occlusionIntensity(root, silhouette);
    } catch (error) {
      const id = root?.userData?.objectId ?? root?.name ?? "unknown";
      console.warn(`[CameraReadabilitySystem] Skipping invalid occlusion bounds for ${id}:`, error);
      return null;
    }
  }


  safeEcologyOcclusionIntensity(root, silhouette) {
    try {
      return this.ecologyOcclusionIntensityFor(root, silhouette);
    } catch (error) {
      const id = root?.userData?.objectId ?? root?.name ?? "unknown";
      console.warn(`[CameraReadabilitySystem] Skipping invalid ecology occlusion bounds for ${id}:`, error);
      return null;
    }
  }

  ecologyOcclusionIntensityFor(root, silhouette) {
    this.tmpBox.makeEmpty();
    this.tmpBox.setFromObject(root);
    if (this.tmpBox.isEmpty()) return null;
    this.tmpBox.getBoundingSphere(this.tmpSphere);

    const estimated = this.estimatedRadius(silhouette);
    const radius = Math.max(1.1, Number.isFinite(this.tmpSphere.radius) ? this.tmpSphere.radius : estimated, estimated * 0.45);
    this.objectPosition.copy(this.tmpSphere.center);
    if (!this.isFiniteVector(this.objectPosition)) return null;

    const lineDistance = this.distanceToCameraTargetSegment(this.objectPosition, this.ecologyFocusPosition);
    const cameraTargetDistance = Math.max(0.001, this.cameraPosition.distanceTo(this.ecologyFocusPosition));
    const targetDistance = this.objectPosition.distanceTo(this.ecologyFocusPosition);
    const nearSightline = this.clamp01(1 - lineDistance / Math.max(0.62, radius * 0.42));
    const targetBias = this.clamp01(1 - targetDistance / Math.max(1.8, radius * 1.10));
    let intensity = nearSightline * (0.48 + targetBias * 0.34);
    if (silhouette.includes("haze") || silhouette === "soft_fog_volume") intensity *= 0.52;
    if (cameraTargetDistance < 2.2) intensity *= 1.08;
    return this.clamp01(Math.min(0.76, intensity));
  }

  occlusionIntensity(root, silhouette) {
    this.tmpBox.makeEmpty();
    this.tmpBox.setFromObject(root);

    if (this.tmpBox.isEmpty()) {
      return null;
    }

    this.tmpBox.getBoundingSphere(this.tmpSphere);

    const estimated = this.estimatedRadius(silhouette);
    const radius = Math.max(1.1, Number.isFinite(this.tmpSphere.radius) ? this.tmpSphere.radius : estimated, estimated * 0.45);

    this.objectPosition.copy(this.tmpSphere.center);
    if (!this.isFiniteVector(this.objectPosition)) return null;

    const lineDistance = this.distanceToCameraPlayerSegment(this.objectPosition);
    const cameraDistance = Math.max(0.001, this.cameraPosition.distanceTo(this.playerPosition));
    const playerDistance = this.objectPosition.distanceTo(this.playerPosition);

    const nearSightline = this.clamp01(1 - lineDistance / Math.max(0.70, radius * 0.48));
    const sourceSurface = this.isSourceCellSurface(root, silhouette);
    const activeSurface = this.isActiveCellSurface(silhouette);
    const insideLargeShell = this.isLargeSurface(silhouette) && playerDistance < radius * 0.86;
    const distanceBias = this.clamp01(1 - Math.abs(playerDistance - cameraDistance * 0.45) / Math.max(1.2, cameraDistance));

    let intensity = nearSightline * (0.68 + distanceBias * 0.26);

    if (insideLargeShell) intensity = Math.max(intensity, activeSurface ? 0.48 : 0.78);
    if (sourceSurface) intensity = Math.max(intensity, 0.86);
    if (activeSurface) intensity = Math.max(intensity, 0.24);

    if (silhouette.includes("haze") || silhouette === "soft_fog_volume") {
      intensity *= 0.58;
    }

    return this.clamp01(intensity);
  }

  distanceToCameraPlayerSegment(point) {
    return this.distanceToCameraTargetSegment(point, this.playerPosition);
  }

  distanceToCameraTargetSegment(point, target) {
    this.segment.subVectors(target, this.cameraPosition);
    const lengthSq = Math.max(0.0001, this.segment.lengthSq());
    this.pointToCamera.subVectors(point, this.cameraPosition);
    const t = this.clamp01(this.pointToCamera.dot(this.segment) / lengthSq);
    this.closestPoint.copy(this.cameraPosition).addScaledVector(this.segment, t);
    return point.distanceTo(this.closestPoint);
  }

  fadeObject(root, intensity) {
    const clamped = this.clamp01(intensity);
    root.userData.cameraFadeIntensity = clamped;

    const silhouette = root.userData?.silhouette ?? "unknown";
    const sourceSurface = this.isSourceCellSurface(root, silhouette);
    const activeSurface = this.isActiveCellSurface(silhouette);
    const haze = silhouette.includes("haze") || silhouette === "soft_fog_volume";
    const largeSurface = this.isLargeSurface(silhouette);

    root.traverse((child) => {
      const material = child.material;
      if (!material) return;

      const materials = Array.isArray(material) ? material : [material];
      for (const mat of materials) {
        if (!Number.isFinite(mat.userData.blobBaseOpacity)) {
          mat.userData.blobBaseOpacity = Number.isFinite(mat.opacity) ? mat.opacity : 1;
        }

        if (mat.transparent || clamped > 0) {
          mat.transparent = true;
          mat.depthWrite = false;

          const base = mat.userData.blobBaseOpacity;
          const fadeStrength = sourceSurface ? 0.975 : haze ? 0.93 : activeSurface ? 0.84 : 0.88;
          const minOpacity = sourceSurface ? 0.004 : haze ? 0.006 : largeSurface ? 0.026 : 0.020;
          const target = Math.max(minOpacity, base * (1 - clamped * fadeStrength));

          mat.opacity += (target - mat.opacity) * 0.30;
          mat.needsUpdate = true;
        }
      }
    });
  }

  activeCellMatchesSurface(silhouette) {
    return this.isActiveCellSurface(silhouette);
  }

  isActiveCellSurface(silhouette) {
    const cell = this.frameState?.activeCellId;
    return (
      (cell === "CELL_BLOOM_RESIDUE_FORK_001" && silhouette === "bloom_residue_fork_surface") ||
      (cell === "CELL_SIGNAL_CHORUS_NERVE_001" && silhouette === "signal_chorus_nerve_surface") ||
      (cell === "CELL_SCAR_FLOW_FOLD_001" && silhouette === "scar_flow_fold_surface") ||
      (cell === "CELL_MEMBRANE_NURSERY_001" && silhouette === "curved_soft_pocket")
    );
  }

  isSourceCellSurface(root, silhouette) {
    if (!this.isLargeSurface(silhouette)) return false;
    if (this.isActiveCellSurface(silhouette)) return false;

    const focus = root.userData?.activeCellFocus ?? "";
    const arrivalRole = root.userData?.arrivalRole ?? "";
    return focus.includes("source") || arrivalRole.includes("source") || this.isKnownInactiveSurface(silhouette);
  }

  isKnownInactiveSurface(silhouette) {
    const cell = this.frameState?.activeCellId;
    if (cell === "CELL_BLOOM_RESIDUE_FORK_001") {
      return ["curved_soft_pocket", "scar_flow_fold_surface", "signal_chorus_nerve_surface"].includes(silhouette);
    }
    if (cell === "CELL_SIGNAL_CHORUS_NERVE_001") {
      return ["curved_soft_pocket", "scar_flow_fold_surface"].includes(silhouette);
    }
    if (cell === "CELL_SCAR_FLOW_FOLD_001") {
      return ["curved_soft_pocket"].includes(silhouette);
    }
    return false;
  }

  isLargeSurface(silhouette) {
    return [
      "curved_soft_pocket",
      "scar_flow_fold_surface",
      "signal_chorus_nerve_surface",
      "bloom_residue_fork_surface"
    ].includes(silhouette);
  }

  estimatedRadius(silhouette) {
    if (silhouette === "bloom_residue_fork_surface") return 4.8;
    if (silhouette === "curved_soft_pocket") return 8.0;
    if (silhouette.includes("haze")) return 5.0;
    return 5.5;
  }

  isFiniteVector(value) {
    return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  }
}
