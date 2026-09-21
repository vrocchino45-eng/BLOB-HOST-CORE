import * as THREE from "three";

/**
 * HC031H — Planted Contact Support Assimilation
 *
 * BLOB-native adaptation of a proven procedural-creature locomotion pattern:
 * world-planted contacts define a support plane; body ride height and contact
 * orientation are derived from those supports rather than from hidden translation.
 *
 * This system is intentionally read-only. It does not move playerRoot, place
 * anchors, raycast, change controls, alter verbs, or own surface eligibility.
 */
export class CoreTendrilSupportPlaneSystem {
  constructor({ playerRoot, frameState }) {
    if (!playerRoot) throw new Error("[CoreTendrilSupportPlaneSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CoreTendrilSupportPlaneSystem] frameState is required.");

    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.playerPosition = new THREE.Vector3();
    this.surfaceNormal = new THREE.Vector3(0, 1, 0);
    this.supportNormal = new THREE.Vector3(0, 1, 0);
    this.centroid = new THREE.Vector3();
    this.a = new THREE.Vector3();
    this.b = new THREE.Vector3();
    this.c = new THREE.Vector3();
    this.ab = new THREE.Vector3();
    this.ac = new THREE.Vector3();
    this.temp = new THREE.Vector3();
  }

  init() {
    this.publishInactive("initializing");
  }

  update(_dt, frameState = this.frameState) {
    const contact = frameState.coreTendrilContact ?? {};
    const locomotion = contact.surfaceLocomotion ?? {};
    const anchors = Array.isArray(locomotion.anchors) ? locomotion.anchors : [];
    const sealed = anchors.filter((anchor) => anchor?.sealed && anchor.anchorWorld);
    const surfaceTruth = frameState.coreSurfaceTruth ?? {};

    if (!locomotion.active || sealed.length === 0 || !surfaceTruth.valid || surfaceTruth.mechanicalEligible === false) {
      this.publishInactive("insufficient_planted_support");
      return;
    }

    const truthNormal = surfaceTruth.normal ?? {};
    this.surfaceNormal.set(truthNormal.x ?? 0, truthNormal.y ?? 1, truthNormal.z ?? 0);
    if (this.surfaceNormal.lengthSq() < 0.0001) this.surfaceNormal.set(0, 1, 0);
    else this.surfaceNormal.normalize();

    this.centroid.set(0, 0, 0);
    for (const anchor of sealed) {
      const p = anchor.anchorWorld;
      this.centroid.x += p.x ?? 0;
      this.centroid.y += p.y ?? 0;
      this.centroid.z += p.z ?? 0;
    }
    this.centroid.multiplyScalar(1 / sealed.length);

    let triangleArea = 0;
    let anchorPlaneConfidence01 = 0;
    this.supportNormal.copy(this.surfaceNormal);

    if (sealed.length >= 3) {
      this.readAnchor(sealed[0], this.a);
      this.readAnchor(sealed[1], this.b);
      this.readAnchor(sealed[2], this.c);
      this.ab.copy(this.b).sub(this.a);
      this.ac.copy(this.c).sub(this.a);
      this.temp.crossVectors(this.ab, this.ac);
      const twiceArea = this.temp.length();
      triangleArea = twiceArea * 0.5;
      if (twiceArea > 0.0015) {
        this.temp.multiplyScalar(1 / twiceArea);
        if (this.temp.dot(this.surfaceNormal) < 0) this.temp.negate();
        anchorPlaneConfidence01 = THREE.MathUtils.clamp(triangleArea / 0.095, 0, 1);
        this.supportNormal.copy(this.surfaceNormal)
          .lerp(this.temp, 0.18 + anchorPlaneConfidence01 * 0.34)
          .normalize();
      }
    }

    this.playerRoot.getWorldPosition(this.playerPosition);
    const rideHeight = this.temp.copy(this.playerPosition).sub(this.centroid).dot(this.supportNormal);
    const compliance = THREE.MathUtils.clamp(surfaceTruth.compliance ?? 0.5, 0, 1);
    const adhesion = THREE.MathUtils.clamp(surfaceTruth.adhesion ?? 0.75, 0, 1);
    const loadTolerance = THREE.MathUtils.clamp(surfaceTruth.loadTolerance ?? 0.70, 0, 1);
    const targetRideHeight = THREE.MathUtils.lerp(0.385, 0.350, compliance);
    const rideHeightError = targetRideHeight - rideHeight;

    let supportSpan = 0;
    for (const anchor of sealed) {
      this.readAnchor(anchor, this.temp);
      this.temp.sub(this.centroid);
      this.temp.addScaledVector(this.supportNormal, -this.temp.dot(this.supportNormal));
      supportSpan += this.temp.length();
    }
    supportSpan /= sealed.length;

    const supportCountQuality = sealed.length >= 3 ? 1 : sealed.length === 2 ? 0.68 : 0.32;
    const geometryQuality = sealed.length >= 3
      ? THREE.MathUtils.clamp(0.55 + anchorPlaneConfidence01 * 0.45, 0, 1)
      : supportCountQuality;
    const materialQuality = adhesion * 0.48 + loadTolerance * 0.52;
    const handoffScale = locomotion.handoffActive ? 0.82 : 1;
    const supportQuality01 = THREE.MathUtils.clamp(
      geometryQuality * (0.76 + materialQuality * 0.24) * handoffScale,
      0,
      1
    );

    this.frameState.coreTendrilSupportPlane = {
      pass: "HC-031H",
      active: true,
      owner: "CoreTendrilSupportPlaneSystem",
      source: "world_planted_suction_anchors",
      supportCount: sealed.length,
      supportQuality01: Number(supportQuality01.toFixed(3)),
      supportCentroid: this.roundVector(this.centroid),
      supportNormal: this.roundVector(this.supportNormal),
      anchorPlaneConfidence01: Number(anchorPlaneConfidence01.toFixed(3)),
      triangleArea: Number(triangleArea.toFixed(4)),
      supportSpan: Number(supportSpan.toFixed(4)),
      rideHeight: Number(rideHeight.toFixed(4)),
      targetRideHeight: Number(targetRideHeight.toFixed(4)),
      rideHeightError: Number(rideHeightError.toFixed(4)),
      surfaceId: surfaceTruth.surfaceId ?? contact.surfaceTruthSurfaceId ?? "none",
      surfaceProfileId: surfaceTruth.profileId ?? contact.surfaceTruthProfileId ?? "none",
      materialFamily: surfaceTruth.materialFamily ?? contact.surfaceTruthMaterialFamily ?? "none",
      adhesion: Number(adhesion.toFixed(3)),
      loadTolerance: Number(loadTolerance.toFixed(3)),
      compliance: Number(compliance.toFixed(3)),
      handoffActive: Boolean(locomotion.handoffActive),
      plantedContactsRemainWorldFixed: true,
      bodyRideHeightDerivedFromSupports: true,
      surfaceTruthStillOwnsEligibility: true,
      movementAuthority: "PlayerMovementController",
      anchorAuthority: "CoreTendrilSurfaceContactSystem",
      addsRaycast: false,
      addsCollider: false,
      changesControls: false,
      changesVerbGrammar: false,
      progressionAuthority: false
    };
  }

  readAnchor(anchor, out) {
    const p = anchor?.anchorWorld ?? {};
    return out.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
  }

  roundVector(v) {
    return {
      x: Number(v.x.toFixed(4)),
      y: Number(v.y.toFixed(4)),
      z: Number(v.z.toFixed(4))
    };
  }

  publishInactive(reason) {
    this.frameState.coreTendrilSupportPlane = {
      pass: "HC-031H",
      active: false,
      owner: "CoreTendrilSupportPlaneSystem",
      source: "world_planted_suction_anchors",
      reason,
      supportCount: 0,
      supportQuality01: 0,
      plantedContactsRemainWorldFixed: true,
      bodyRideHeightDerivedFromSupports: true,
      surfaceTruthStillOwnsEligibility: true,
      movementAuthority: "PlayerMovementController",
      anchorAuthority: "CoreTendrilSurfaceContactSystem",
      addsRaycast: false,
      addsCollider: false,
      changesControls: false,
      changesVerbGrammar: false,
      progressionAuthority: false
    };
  }
}
