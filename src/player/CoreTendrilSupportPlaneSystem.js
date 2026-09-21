import * as THREE from "three";

/**
 * HC031H2 — Anchor-Carried Surface Support Plane
 *
 * SurfaceTruth authorizes an anchor when it seals. The planted anchor then carries
 * that authored surface identity until peel/release, so support does not depend on
 * rediscovering the same mesh on the same frame as PlayerMovementController.
 *
 * Read-only: no player translation, anchor placement, raycast, controls, verbs, or
 * progression ownership.
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
    const eligible = anchors.filter((anchor) => (
      anchor?.sealed
      && anchor.anchorWorld
      && anchor.surface?.valid
      && anchor.surface.surfaceId
      && anchor.surface.surfaceId !== "none"
    ));

    if (eligible.length === 0) {
      this.publishInactive("no_sealed_anchor_with_carried_surface_identity");
      return;
    }

    // A support plane must not silently span unrelated authored surfaces. Choose
    // the dominant carried surface deterministically; ties resolve by anchor order.
    const counts = new Map();
    for (const anchor of eligible) {
      const id = anchor.surface.surfaceId;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    let surfaceId = "none";
    let bestCount = 0;
    for (const anchor of eligible) {
      const id = anchor.surface.surfaceId;
      const count = counts.get(id) ?? 0;
      if (count > bestCount) {
        surfaceId = id;
        bestCount = count;
      }
    }
    const sealed = eligible.filter((anchor) => anchor.surface.surfaceId === surfaceId);
    const profile = sealed[0]?.surface ?? {};

    this.surfaceNormal.set(0, 0, 0);
    let adhesion = 0;
    let loadTolerance = 0;
    let compliance = 0;
    let pulseTransmission = 0;
    let absorbTransmission = 0;
    let stabilizeTransmission = 0;
    this.centroid.set(0, 0, 0);

    for (const anchor of sealed) {
      const p = anchor.anchorWorld;
      this.centroid.x += p.x ?? 0;
      this.centroid.y += p.y ?? 0;
      this.centroid.z += p.z ?? 0;
      const n = anchor.surface.normal ?? {};
      this.surfaceNormal.x += n.x ?? 0;
      this.surfaceNormal.y += n.y ?? 1;
      this.surfaceNormal.z += n.z ?? 0;
      adhesion += THREE.MathUtils.clamp(anchor.surface.adhesion ?? 0.75, 0, 1);
      loadTolerance += THREE.MathUtils.clamp(anchor.surface.loadTolerance ?? 0.70, 0, 1);
      compliance += THREE.MathUtils.clamp(anchor.surface.compliance ?? 0.50, 0, 1);
      pulseTransmission += THREE.MathUtils.clamp(anchor.surface.verbTransmission?.pulse ?? 0.5, 0, 1);
      absorbTransmission += THREE.MathUtils.clamp(anchor.surface.verbTransmission?.absorb ?? 0.5, 0, 1);
      stabilizeTransmission += THREE.MathUtils.clamp(anchor.surface.verbTransmission?.stabilize ?? 0.5, 0, 1);
    }
    const inv = 1 / sealed.length;
    this.centroid.multiplyScalar(inv);
    this.surfaceNormal.multiplyScalar(inv);
    if (this.surfaceNormal.lengthSq() < 0.0001) this.surfaceNormal.set(0, 1, 0);
    else this.surfaceNormal.normalize();
    adhesion *= inv;
    loadTolerance *= inv;
    compliance *= inv;
    pulseTransmission *= inv;
    absorbTransmission *= inv;
    stabilizeTransmission *= inv;

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

    frameState.coreTendrilSupportPlane = {
      pass: "HC-031H2",
      active: true,
      owner: "CoreTendrilSupportPlaneSystem",
      source: "sealed_anchor_carried_surface_identity",
      carriedSurfaceIdentity: true,
      currentSurfaceTruthRequiredAfterSeal: false,
      surfaceEligibilityAuthorityAtSeal: "CoreSurfaceTruthSystem",
      supportCount: sealed.length,
      rawEligibleAnchorCount: eligible.length,
      supportQuality01: Number(supportQuality01.toFixed(3)),
      supportCentroid: this.roundVector(this.centroid),
      supportNormal: this.roundVector(this.supportNormal),
      anchorPlaneConfidence01: Number(anchorPlaneConfidence01.toFixed(3)),
      triangleArea: Number(triangleArea.toFixed(4)),
      supportSpan: Number(supportSpan.toFixed(4)),
      rideHeight: Number(rideHeight.toFixed(4)),
      targetRideHeight: Number(targetRideHeight.toFixed(4)),
      rideHeightError: Number(rideHeightError.toFixed(4)),
      surfaceId,
      surfaceProfileId: profile.profileId ?? "none",
      materialFamily: profile.materialFamily ?? "none",
      adhesion: Number(adhesion.toFixed(3)),
      loadTolerance: Number(loadTolerance.toFixed(3)),
      compliance: Number(compliance.toFixed(3)),
      verbTransmission: {
        pulse: Number(pulseTransmission.toFixed(3)),
        absorb: Number(absorbTransmission.toFixed(3)),
        stabilize: Number(stabilizeTransmission.toFixed(3))
      },
      handoffActive: Boolean(locomotion.handoffActive),
      plantedContactsRemainWorldFixed: true,
      bodyRideHeightDerivedFromSupports: true,
      supportActivationLaw: "sealed_world_anchor_with_carried_authored_surface_identity",
      independentOfLegacyAttachmentGate: true,
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
      pass: "HC-031H2",
      active: false,
      owner: "CoreTendrilSupportPlaneSystem",
      source: "sealed_anchor_carried_surface_identity",
      reason,
      carriedSurfaceIdentity: false,
      currentSurfaceTruthRequiredAfterSeal: false,
      supportCount: 0,
      supportQuality01: 0,
      plantedContactsRemainWorldFixed: true,
      bodyRideHeightDerivedFromSupports: true,
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
