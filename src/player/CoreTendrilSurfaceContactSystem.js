import * as THREE from "three";
import { CORE_TENDRIL_VISUAL } from "../visual/CoreTendrilVisualLanguage.js";

const UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

/**
 * HC031H2 — Anchor-Carried Surface Identity
 *
 * The same three tendrils now consume only explicitly authored ecological surface
 * truth when a registered Host surface is present. The movement boundary remains a
 * safety fallback; PlayerMovementController remains sole translation owner.
 */
export class CoreTendrilSurfaceContactSystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene) throw new Error("[CoreTendrilSurfaceContactSystem] scene is required.");
    if (!playerRoot) throw new Error("[CoreTendrilSurfaceContactSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CoreTendrilSurfaceContactSystem] frameState is required.");

    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.root = null;
    this.tendrils = [];
    this.previousContactState = "suspended";
    this.contactAge = 0;
    this.stepCursor = 0;
    this.stepCandidateIndex = -1;
    this.lastBoundaryOwner = "none";
    this.surfaceTruthActive = false;
    this.surfaceTruthOwner = "none";
    this.surfaceTruthMeshName = "none";
    this.surfaceTruthSurfaceId = "none";
    this.surfaceTruthProfileId = "none";
    this.surfaceTruthMaterialFamily = "none";
    this.surfaceTruthAdhesion = 0.75;
    this.surfaceTruthLoadTolerance = 0.70;
    this.surfaceTruthCompliance = 0.50;
    this.surfaceTruthVerbTransmission = { pulse: 0.5, absorb: 0.5, stabilize: 0.5 };
    this.surfacePoint = new THREE.Vector3();

    this.playerPosition = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.desiredMove = new THREE.Vector3();
    this.normal = new THREE.Vector3(0, 1, 0);
    this.tangentForward = new THREE.Vector3(0, 0, -1);
    this.tangentSide = new THREE.Vector3(1, 0, 0);
    this.tempA = new THREE.Vector3();
    this.tempB = new THREE.Vector3();
    this.tempC = new THREE.Vector3();
    this.tempD = new THREE.Vector3();
    this.center = new THREE.Vector3();
    this.radii = new THREE.Vector3(6.4, 3.45, 4.8);
    this.quat = new THREE.Quaternion();

    // HC031E1: keep ordinary contacts compact. Long extension should read as a
    // deliberate step, not as permanent whiskers streaming behind the Core.
    this.coreSurfaceOffset = 0.22;
    this.coreRootSpread = 0.16;
    this.anchorSpread = 0.30;
    this.frontReachBonus = 0.17;
    this.maxStretch = 0.54;
    this.stepDistance = 0.18;
    this.reachDuration = 0.19;
    this.peelDuration = 0.17;
    // HC031F1 keeps the sucker subordinate to the tendon so locomotion reads as
    // soft load transfer rather than a rigid stalk ending in a paddle.
    this.padThickness = 0.026;
    this.padRadius = 0.115;
  }

  init() {
    this.root = new THREE.Group();
    this.root.name = "hc031e1_core_tendril_contact_root";
    this.root.frustumCulled = false;
    this.scene.add(this.root);

    for (let index = 0; index < 3; index += 1) {
      this.tendrils.push(this.createTendril(index));
    }

    this.publishState("suspended", false);
  }

  createTendril(index) {
    const group = new THREE.Group();
    group.name = `hc031e1_tendril_${index}`;
    group.visible = false;
    this.root.add(group);

    const material = new THREE.MeshStandardMaterial({
      color: CORE_TENDRIL_VISUAL.shaftColor,
      emissive: CORE_TENDRIL_VISUAL.shaftEmissive,
      emissiveIntensity: CORE_TENDRIL_VISUAL.shaftEmissiveIntensity,
      roughness: CORE_TENDRIL_VISUAL.shaftRoughness,
      metalness: 0.0,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // Thicker at the Core and progressively tapered toward the sucker.
    const segmentGeometry = new THREE.CylinderGeometry(0.034, 0.058, 1, 10, 1, false);
    const segments = [0, 1, 2].map((segmentIndex) => {
      const segment = new THREE.Mesh(segmentGeometry, material.clone());
      segment.name = `hc031e1_tendril_${index}_segment_${segmentIndex}`;
      segment.visible = false;
      segment.renderOrder = 3;
      group.add(segment);
      return segment;
    });

    const padMaterial = new THREE.MeshStandardMaterial({
      color: CORE_TENDRIL_VISUAL.suckerColor,
      emissive: CORE_TENDRIL_VISUAL.suckerEmissive,
      emissiveIntensity: CORE_TENDRIL_VISUAL.suckerEmissiveIntensity,
      roughness: CORE_TENDRIL_VISUAL.suckerRoughness,
      metalness: 0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    // A very shallow truncated cylinder reads as a sucker pressed against a
    // surface. The broad face is the contact face; the narrow face meets tendon.
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(this.padRadius * 0.72, this.padRadius, this.padThickness, 18, 1, false),
      padMaterial
    );
    pad.name = `hc031e1_tendril_${index}_suction_pad`;
    pad.visible = false;
    pad.renderOrder = 4;
    group.add(pad);

    const patchMaterial = new THREE.MeshBasicMaterial({
      color: 0x315f51,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const contactPatch = new THREE.Mesh(new THREE.CircleGeometry(this.padRadius * 1.08, 20), patchMaterial);
    contactPatch.name = `hc031e1_tendril_${index}_surface_compression_patch`;
    contactPatch.visible = false;
    contactPatch.renderOrder = 2;
    group.add(contactPatch);

    const rootBulbMaterial = material.clone();
    rootBulbMaterial.opacity = 0;
    const rootBulb = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), rootBulbMaterial);
    rootBulb.name = `hc031e1_tendril_${index}_core_root`;
    rootBulb.visible = false;
    rootBulb.renderOrder = 3;
    group.add(rootBulb);

    return {
      index,
      group,
      segments,
      pad,
      contactPatch,
      rootBulb,
      phase: "retracted",
      phaseAge: 99,
      reveal: 0,
      seal: 0,
      anchorWorld: new THREE.Vector3(),
      reachFrom: new THREE.Vector3(),
      reachTo: new THREE.Vector3(),
      lastIdealAnchor: new THREE.Vector3(),
      pendingAnchorWorld: new THREE.Vector3(),
      pendingAnchorValid: false,
      startWorld: new THREE.Vector3(),
      controlA: new THREE.Vector3(),
      controlB: new THREE.Vector3(),
      displayEnd: new THREE.Vector3(),
      stretch: 0,
      anchorDrift: 0,
      stepCount: 0,
      stridePressure: 0,
      anchorSurface: this.createSurfaceRelation(),
      reachSurface: this.createSurfaceRelation(),
      pendingSurface: this.createSurfaceRelation()
    };
  }

  createSurfaceRelation() {
    return {
      valid: false,
      owner: "none",
      meshName: "none",
      surfaceId: "none",
      profileId: "none",
      materialFamily: "none",
      adhesion: 0.75,
      loadTolerance: 0.70,
      compliance: 0.50,
      verbTransmission: { pulse: 0.5, absorb: 0.5, stabilize: 0.5 },
      normal: new THREE.Vector3(0, 1, 0)
    };
  }

  clearSurfaceRelation(relation) {
    relation.valid = false;
    relation.owner = "none";
    relation.meshName = "none";
    relation.surfaceId = "none";
    relation.profileId = "none";
    relation.materialFamily = "none";
    relation.adhesion = 0.75;
    relation.loadTolerance = 0.70;
    relation.compliance = 0.50;
    relation.verbTransmission = { pulse: 0.5, absorb: 0.5, stabilize: 0.5 };
    relation.normal.set(0, 1, 0);
  }

  copySurfaceRelation(target, source) {
    if (!source?.valid || !source.surfaceId || source.surfaceId === "none") {
      this.clearSurfaceRelation(target);
      return false;
    }
    target.valid = true;
    target.owner = source.owner ?? "CoreSurfaceTruthSystem";
    target.meshName = source.meshName ?? "authored_surface";
    target.surfaceId = source.surfaceId;
    target.profileId = source.profileId ?? "unknown_profile";
    target.materialFamily = source.materialFamily ?? "unknown";
    target.adhesion = THREE.MathUtils.clamp(source.adhesion ?? 0.75, 0, 1);
    target.loadTolerance = THREE.MathUtils.clamp(source.loadTolerance ?? 0.70, 0, 1);
    target.compliance = THREE.MathUtils.clamp(source.compliance ?? 0.50, 0, 1);
    target.verbTransmission = {
      pulse: THREE.MathUtils.clamp(source.verbTransmission?.pulse ?? 0.5, 0, 1),
      absorb: THREE.MathUtils.clamp(source.verbTransmission?.absorb ?? 0.5, 0, 1),
      stabilize: THREE.MathUtils.clamp(source.verbTransmission?.stabilize ?? 0.5, 0, 1)
    };
    const normal = source.normal ?? {};
    target.normal.set(normal.x ?? 0, normal.y ?? 1, normal.z ?? 0);
    if (target.normal.lengthSq() < 0.0001) target.normal.set(0, 1, 0);
    else target.normal.normalize();
    return true;
  }

  captureCurrentSurfaceRelation(target) {
    if (!this.surfaceTruthActive || this.surfaceTruthSurfaceId === "none") {
      this.clearSurfaceRelation(target);
      return false;
    }
    return this.copySurfaceRelation(target, {
      valid: true,
      owner: this.surfaceTruthOwner,
      meshName: this.surfaceTruthMeshName,
      surfaceId: this.surfaceTruthSurfaceId,
      profileId: this.surfaceTruthProfileId,
      materialFamily: this.surfaceTruthMaterialFamily,
      adhesion: this.surfaceTruthAdhesion,
      loadTolerance: this.surfaceTruthLoadTolerance,
      compliance: this.surfaceTruthCompliance,
      verbTransmission: this.surfaceTruthVerbTransmission,
      normal: this.normal
    });
  }

  serializeSurfaceRelation(relation) {
    return {
      valid: Boolean(relation?.valid),
      owner: relation?.owner ?? "none",
      meshName: relation?.meshName ?? "none",
      surfaceId: relation?.surfaceId ?? "none",
      profileId: relation?.profileId ?? "none",
      materialFamily: relation?.materialFamily ?? "none",
      adhesion: Number((relation?.adhesion ?? 0).toFixed(3)),
      loadTolerance: Number((relation?.loadTolerance ?? 0).toFixed(3)),
      compliance: Number((relation?.compliance ?? 0).toFixed(3)),
      verbTransmission: {
        pulse: Number((relation?.verbTransmission?.pulse ?? 0).toFixed(3)),
        absorb: Number((relation?.verbTransmission?.absorb ?? 0).toFixed(3)),
        stabilize: Number((relation?.verbTransmission?.stabilize ?? 0).toFixed(3))
      },
      normal: {
        x: Number((relation?.normal?.x ?? 0).toFixed(4)),
        y: Number((relation?.normal?.y ?? 1).toFixed(4)),
        z: Number((relation?.normal?.z ?? 0).toFixed(4))
      }
    };
  }

  update(dt, frameState = this.frameState) {
    if (!this.root) return;

    const safeDt = Math.max(0, Math.min(dt, 0.05));
    const kinematics = frameState.playerKinematics ?? {};
    const boundary = kinematics.movementBoundary ?? {};
    const contact = frameState.coreContactLanguage ?? {};
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const physicalAttachment = frameState.playerAttachment ?? {};
    const surfaceTruth = frameState.coreSurfaceTruth ?? {};
    const visibleAuthoredSurface = Boolean(surfaceTruth.valid && surfaceTruth.mechanicalEligible !== false);
    const requestedContactState = inspection.coreWorkActive ? "suspended" : (contact.state ?? "suspended");
    // HC031T1: the movement ellipsoid is a safety volume, not a sucker target.
    // Boundary-only visual contact may deform the Core, but tendrils may seal only
    // when an authored surface is actually visible/eligible or movement still owns
    // a physical attachment/release relationship. This preserves bootstrap on real
    // surfaces while preventing an invisible boundary from leaving a "stuck leg."
    const contactState = inspection.coreWorkActive
      ? "suspended"
      : physicalAttachment.state === "releasing"
        ? "releasing"
        : requestedContactState === "attached" && (physicalAttachment.active === true || visibleAuthoredSurface)
          ? "attached"
          : requestedContactState === "brushing" && visibleAuthoredSurface
            ? "brushing"
            : "suspended";

    this.playerRoot.getWorldPosition(this.playerPosition);
    this.readBoundary(boundary);
    this.readSurfaceTruth(surfaceTruth);
    this.readTangentBasis(kinematics);

    if (contactState !== this.previousContactState) {
      this.previousContactState = contactState;
      this.contactAge = 0;
      if (contactState === "releasing" || contactState === "suspended") {
        this.beginGlobalRelease();
      }
    } else {
      this.contactAge += safeDt;
    }

    const desiredCount = contactState === "attached"
      ? 3
      : contactState === "brushing"
        ? 1
        : 0;

    const idealAnchors = [0, 1, 2].map((index) => this.computeIdealAnchor(index));
    let stepClaimed = this.tendrils.some((tendril) => tendril.phase === "peeling" || tendril.phase === "reaching");

    // HC031H: choose the support that the body has actually outrun instead of
    // waiting for a fixed round-robin cursor to happen to reach the strained leg.
    // Ties remain deterministic by beginning the scan at stepCursor.
    this.stepCandidateIndex = -1;
    let bestStridePressure = 1.0;
    // D11G: no fresh foothold may be committed from the movement ellipsoid.
    // Keep already-sealed world anchors through a short authored-raycast gap;
    // only current authored truth may authorize a new step.
    if (contactState === "attached" && this.surfaceTruthActive && !stepClaimed) {
      for (let offset = 0; offset < 3; offset += 1) {
        const index = (this.stepCursor + offset) % 3;
        const tendril = this.tendrils[index];
        if (!tendril || tendril.phase !== "sealed") continue;
        // D11J: ordinary stride must never remove the sole grounded foothold.
        // A second valid sealed anchor, not a reaching or peeling tendril,
        // is required before a pressure-driven handoff may start.
        if (tendril.anchorSurface?.valid && !this.hasIndependentSealedSupport(tendril)) continue;
        const ideal = idealAnchors[index];
        const anchorDrift = tendril.anchorWorld.distanceTo(ideal);
        const stretch = this.computeStartWorld(index, this.tempA).distanceTo(tendril.anchorWorld);
        const pressure = Math.max(
          anchorDrift / Math.max(0.001, this.stepDistance),
          stretch / Math.max(0.001, this.maxStretch)
        );
        tendril.anchorDrift = anchorDrift;
        tendril.stretch = stretch;
        tendril.stridePressure = pressure;
        if (pressure > bestStridePressure + 0.015) {
          bestStridePressure = pressure;
          this.stepCandidateIndex = index;
        }
      }
    }

    this.tendrils.forEach((tendril) => {
      const desired = tendril.index < desiredCount;
      const staggerReady = this.contactAge >= tendril.index * 0.075;
      const ideal = idealAnchors[tendril.index];
      tendril.lastIdealAnchor.copy(ideal);

      if (desired && staggerReady && tendril.phase === "retracted" && this.surfaceTruthActive) {
        this.beginReach(tendril, ideal);
      }

      if (!desired && tendril.phase !== "retracted" && tendril.phase !== "peeling") {
        this.beginPeel(tendril);
      }

      // D11G: short visibility gaps retain a planted anchor, not infinite reach.
      // When no new authored truth exists and body-to-anchor exceeds the
      // conservative reach envelope, peel without fabricating a replacement.
      if (desired && tendril.phase === "sealed" && !this.surfaceTruthActive
          && tendril.anchorSurface?.valid && tendril.phaseAge >= 0.22
          && this.computeStartWorld(tendril.index, this.tempA)
            .distanceTo(tendril.anchorWorld) > Math.max(1.2, this.maxStretch * 2.2)) {
        this.beginPeel(tendril);
        stepClaimed = true;
      }

      if (desired && tendril.phase === "sealed" && this.surfaceTruthActive
          && !stepClaimed && tendril.index === this.stepCandidateIndex
          && (!tendril.anchorSurface?.valid || this.hasIndependentSealedSupport(tendril))) {
        // Predict the next planted point slightly ahead in the tangent frame.
        // The destination is frozen when the peel begins, so the body moves over
        // a world-planted support rather than chasing a target attached to itself.
        const predicted = this.computePredictedStepAnchor(tendril.index, ideal, this.tempD);
        this.beginPeel(tendril, predicted);
        stepClaimed = true;
        this.stepCursor = (tendril.index + 1) % 3;
      }

      this.updateTendrilState(tendril, safeDt, ideal, desired);
      this.renderTendril(tendril, safeDt);
    });

    this.publishState(contactState, desiredCount > 0);
  }

  readBoundary(boundary) {
    const center = boundary.center ?? {};
    const radii = boundary.radii ?? {};
    this.center.set(center.x ?? 0, center.y ?? 0, center.z ?? 0);
    this.radii.set(
      Math.max(0.2, radii.x ?? 6.4),
      Math.max(0.2, radii.y ?? 3.45),
      Math.max(0.2, radii.z ?? 4.8)
    );

    const surfaceNormal = boundary.surfaceNormal ?? {};
    this.normal.set(surfaceNormal.x ?? 0, surfaceNormal.y ?? 1, surfaceNormal.z ?? 0);
    if (this.normal.lengthSq() < 0.0001) this.normal.set(0, 1, 0);
    else this.normal.normalize();
    this.lastBoundaryOwner = boundary.owner ?? "unknown";
  }

  readSurfaceTruth(truth = {}) {
    const point = truth.point ?? {};
    const normal = truth.normal ?? {};
    const distance = Number(truth.distance);
    const valid = Boolean(
      truth.valid
      && truth.mechanicalEligible !== false
      && Number.isFinite(distance)
      && distance <= 0.88
      && [point.x, point.y, point.z, normal.x, normal.y, normal.z].every(Number.isFinite)
    );

    this.surfaceTruthActive = valid;
    this.surfaceTruthOwner = valid ? (truth.owner ?? "CoreSurfaceTruthSystem") : "none";
    this.surfaceTruthMeshName = valid ? (truth.meshName ?? "authored_surface") : "none";
    this.surfaceTruthSurfaceId = valid ? (truth.surfaceId ?? "authored_surface") : "none";
    this.surfaceTruthProfileId = valid ? (truth.profileId ?? "unknown_profile") : "none";
    this.surfaceTruthMaterialFamily = valid ? (truth.materialFamily ?? "unknown") : "none";
    this.surfaceTruthAdhesion = valid ? THREE.MathUtils.clamp(truth.adhesion ?? 0.75, 0, 1) : 0.75;
    this.surfaceTruthLoadTolerance = valid ? THREE.MathUtils.clamp(truth.loadTolerance ?? 0.70, 0, 1) : 0.70;
    this.surfaceTruthCompliance = valid ? THREE.MathUtils.clamp(truth.compliance ?? 0.50, 0, 1) : 0.50;
    this.surfaceTruthVerbTransmission = valid ? {
      pulse: THREE.MathUtils.clamp(truth.verbTransmission?.pulse ?? 0.5, 0, 1),
      absorb: THREE.MathUtils.clamp(truth.verbTransmission?.absorb ?? 0.5, 0, 1),
      stabilize: THREE.MathUtils.clamp(truth.verbTransmission?.stabilize ?? 0.5, 0, 1)
    } : { pulse: 0.5, absorb: 0.5, stabilize: 0.5 };
    if (!valid) return;

    this.surfacePoint.set(point.x, point.y, point.z);
    this.normal.set(normal.x, normal.y, normal.z);
    if (this.normal.lengthSq() < 0.0001) this.normal.set(0, 1, 0);
    else this.normal.normalize();
  }

  readTangentBasis(kinematics) {
    const velocity = kinematics.velocity ?? {};
    const desiredMove = kinematics.desiredMoveVector ?? {};
    this.velocity.set(velocity.x ?? 0, velocity.y ?? 0, velocity.z ?? 0);
    this.desiredMove.set(desiredMove.x ?? 0, desiredMove.y ?? 0, desiredMove.z ?? 0);

    // HC031F1: plant the next anchor toward current player intent when possible,
    // not merely along yesterday's momentum. This keeps reversals responsive while
    // preserving the authored surface tangent.
    this.tangentForward.copy(this.desiredMove)
      .addScaledVector(this.normal, -this.desiredMove.dot(this.normal));
    if (this.tangentForward.lengthSq() < 0.004) {
      this.tangentForward.copy(this.velocity)
        .addScaledVector(this.normal, -this.velocity.dot(this.normal));
    }

    if (this.tangentForward.lengthSq() < 0.004) {
      this.tangentForward.crossVectors(this.normal, UP);
      if (this.tangentForward.lengthSq() < 0.004) this.tangentForward.crossVectors(this.normal, X_AXIS);
      if (this.tangentForward.lengthSq() < 0.004) this.tangentForward.copy(Z_AXIS);
    }
    this.tangentForward.normalize();
    this.tangentSide.crossVectors(this.normal, this.tangentForward).normalize();
  }

  computeIdealAnchor(index) {
    const angles = [0, 2.22, -2.22];
    const angle = angles[index];
    const speed01 = THREE.MathUtils.clamp(this.velocity.length() / 3.0, 0, 1);
    const forwardReach = index === 0 ? this.frontReachBonus * speed01 : 0;
    const radial = this.anchorSpread + forwardReach;

    if (this.surfaceTruthActive) {
      // HC031F1A uses the same visible local plane that movement uses. For this
      // proof flat/sloped surfaces are authoritative; edge wrapping remains F2.
      return new THREE.Vector3().copy(this.surfacePoint)
        .addScaledVector(this.tangentForward, Math.cos(angle) * radial)
        .addScaledVector(this.tangentSide, Math.sin(angle) * radial);
    }

    this.tempA.copy(this.playerPosition)
      .addScaledVector(this.tangentForward, Math.cos(angle) * radial)
      .addScaledVector(this.tangentSide, Math.sin(angle) * radial)
      .addScaledVector(this.normal, 0.16);

    return this.projectToBoundary(this.tempA, new THREE.Vector3());
  }

  // D11J: only a different sealed, authored, locally reachable foothold
  // can take load when an ordinary stride peels the current anchor.
  // D11G remains responsible for surface provenance. This is a handoff guard,
  // not a substitute for mesh-distance validation or deliberate release.
  hasIndependentSealedSupport(candidate) {
    const reachEnvelope = Math.max(1.2, this.maxStretch * 2.2);
    return this.tendrils.some((other) => {
      if (other === candidate || other?.index === candidate?.index
          || other?.phase !== "sealed" || !other.anchorSurface?.valid
          || !other.anchorSurface.surfaceId || other.anchorSurface.surfaceId === "none"
          || !other.anchorWorld || !Number.isFinite(other.anchorWorld.x)
          || !Number.isFinite(other.anchorWorld.y) || !Number.isFinite(other.anchorWorld.z)) {
        return false;
      }
      return this.computeStartWorld(other.index, this.tempB)
        .distanceTo(other.anchorWorld) <= reachEnvelope;
    });
  }

  computePredictedStepAnchor(index, ideal, out) {
    const speed01 = THREE.MathUtils.clamp(this.velocity.length() / 3.4, 0, 1);
    const intent01 = THREE.MathUtils.clamp(this.desiredMove.length(), 0, 1);
    const forwardLead = THREE.MathUtils.clamp(0.055 + speed01 * 0.085 + intent01 * 0.045, 0.055, 0.18);
    const lateralBias = index === 1 ? -0.012 : index === 2 ? 0.012 : 0;

    out.copy(ideal)
      .addScaledVector(this.tangentForward, forwardLead)
      .addScaledVector(this.tangentSide, lateralBias);

    if (this.surfaceTruthActive) {
      // Keep the predicted foothold on the same authored local contact plane.
      this.tempC.copy(out).sub(this.surfacePoint);
      out.addScaledVector(this.normal, -this.tempC.dot(this.normal));
      return out;
    }

    return this.projectToBoundary(out, out);
  }

  projectToBoundary(point, out) {
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const dz = point.z - this.center.z;
    const nx = dx / this.radii.x;
    const ny = dy / this.radii.y;
    const nz = dz / this.radii.z;
    const normalized = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (normalized < 0.0001) return out.copy(point);
    out.set(
      this.center.x + dx / normalized,
      this.center.y + dy / normalized,
      this.center.z + dz / normalized
    );
    return out;
  }

  computeStartWorld(index, out) {
    const angles = [0, 2.22, -2.22];
    const angle = angles[index];
    return out.copy(this.playerPosition)
      .addScaledVector(this.normal, this.coreSurfaceOffset)
      .addScaledVector(this.tangentForward, Math.cos(angle) * this.coreRootSpread)
      .addScaledVector(this.tangentSide, Math.sin(angle) * this.coreRootSpread);
  }

  beginReach(tendril, targetAnchor, fromAuthorizedPending = false) {
    // D11G: relation and position must have the SAME authored origin.
    // An old surface ID is never proof that a new ellipsoid foothold is on it.
    const pendingAuthorized = Boolean(
      fromAuthorizedPending && tendril.pendingAnchorValid && tendril.pendingSurface?.valid
    );
    if (!pendingAuthorized && !this.surfaceTruthActive) return false;
    if (pendingAuthorized) {
      this.copySurfaceRelation(tendril.reachSurface, tendril.pendingSurface);
    } else if (!this.captureCurrentSurfaceRelation(tendril.reachSurface)) {
      return false;
    }
    tendril.phase = "reaching";
    tendril.phaseAge = 0;
    tendril.reachFrom.copy(this.computeStartWorld(tendril.index, this.tempB));
    tendril.reachTo.copy(targetAnchor);
    tendril.anchorWorld.copy(targetAnchor);
    tendril.reachOrigin = pendingAuthorized ? "authored_truth_predicted_step" : "live_authored_surface_truth";
    this.clearSurfaceRelation(tendril.pendingSurface);
    tendril.pendingAnchorValid = false;
    tendril.seal = 0;
    return true;
  }

  beginPeel(tendril, nextAnchor = null) {
    tendril.phase = "peeling";
    tendril.phaseAge = 0;
    tendril.reachFrom.copy(tendril.anchorWorld);
    // D11G: predicted replacement is legal only when LIVE authored truth
    // authorizes that exact foothold. Never inherit an old ID for a fallback.
    const authoredStep = Boolean(nextAnchor && this.surfaceTruthActive
      && nextAnchor.distanceTo(this.surfacePoint) <= 0.85);
    if (authoredStep && this.captureCurrentSurfaceRelation(tendril.pendingSurface)) {
      tendril.reachTo.copy(nextAnchor);
      tendril.pendingAnchorWorld.copy(nextAnchor);
      tendril.pendingAnchorValid = true;
    } else {
      tendril.reachTo.copy(this.computeStartWorld(tendril.index, this.tempB));
      tendril.pendingAnchorValid = false;
      this.clearSurfaceRelation(tendril.pendingSurface);
    }
    tendril.seal = 1;
  }

  beginGlobalRelease() {
    this.tendrils.forEach((tendril, index) => {
      if (tendril.phase === "retracted") return;
      if (index === 0 || tendril.phase !== "peeling") this.beginPeel(tendril);
    });
  }

  updateTendrilState(tendril, dt, ideal, desired) {
    tendril.phaseAge += dt;

    if (tendril.phase === "reaching") {
      const u = THREE.MathUtils.clamp(tendril.phaseAge / this.reachDuration, 0, 1);
      const eased = 1 - Math.pow(1 - u, 3);
      tendril.displayEnd.lerpVectors(tendril.reachFrom, tendril.reachTo, eased);
      tendril.reveal = Math.max(tendril.reveal, eased);
      tendril.seal = THREE.MathUtils.clamp((u - 0.64) / 0.36, 0, 1);
      if (u >= 1) {
        tendril.phase = "sealed";
        tendril.phaseAge = 0;
        tendril.anchorWorld.copy(tendril.reachTo);
        tendril.displayEnd.copy(tendril.anchorWorld);
        this.copySurfaceRelation(tendril.anchorSurface, tendril.reachSurface);
        this.clearSurfaceRelation(tendril.reachSurface);
        tendril.reveal = 1;
        tendril.seal = 1;
        tendril.stepCount += 1;
      }
      return;
    }

    if (tendril.phase === "sealed") {
      tendril.displayEnd.copy(tendril.anchorWorld);
      tendril.reveal += (1 - tendril.reveal) * (1 - Math.exp(-dt * 14));
      tendril.seal += (1 - tendril.seal) * (1 - Math.exp(-dt * 18));
      return;
    }

    if (tendril.phase === "peeling") {
      const u = THREE.MathUtils.clamp(tendril.phaseAge / this.peelDuration, 0, 1);
      const peel = u * u;
      const peelSide = tendril.index === 1 ? -1 : tendril.index === 2 ? 1 : 0.35;
      this.tempC.lerpVectors(tendril.reachFrom, tendril.reachTo, peel)
        .addScaledVector(this.tangentSide, Math.sin(u * Math.PI) * peelSide * 0.055)
        .addScaledVector(this.normal, Math.sin(u * Math.PI) * 0.055);
      tendril.displayEnd.copy(this.tempC);
      tendril.seal = 1 - u;
      tendril.reveal = 1 - u * 0.58;

      if (u >= 1) {
        const authorizedPending = Boolean(tendril.pendingAnchorValid && tendril.pendingSurface?.valid);
        const planted = desired && (authorizedPending || this.surfaceTruthActive)
          && this.beginReach(
            tendril,
            authorizedPending ? tendril.pendingAnchorWorld : ideal,
            authorizedPending
          );
        if (!planted) {
          tendril.phase = "retracted";
          tendril.phaseAge = 0;
          tendril.reveal = 0;
          tendril.seal = 0;
          tendril.pendingAnchorValid = false;
          this.clearSurfaceRelation(tendril.anchorSurface);
          this.clearSurfaceRelation(tendril.reachSurface);
          this.clearSurfaceRelation(tendril.pendingSurface);
        }
      }
      return;
    }

    tendril.displayEnd.copy(this.computeStartWorld(tendril.index, this.tempD));
    tendril.reveal = Math.max(0, tendril.reveal - dt * 9);
    tendril.seal = 0;
  }

  renderTendril(tendril, dt) {
    this.computeStartWorld(tendril.index, tendril.startWorld);
    const active = tendril.phase !== "retracted" || tendril.reveal > 0.01;
    tendril.group.visible = active;
    if (!active) return;

    const end = tendril.displayEnd;
    const direction = this.tempA.copy(end).sub(tendril.startWorld);
    const length = direction.length();
    if (length < 0.001) return;

    const tangentLean = THREE.MathUtils.clamp(this.velocity.length() / 4.0, 0, 1);
    const load01 = THREE.MathUtils.clamp((length - 0.24) / Math.max(0.12, this.maxStretch - 0.24), 0, 1);
    const drivingIndex = this.frameState.playerAttachment?.tendrilLeadingAnchorIndex ?? -1;
    const drivingPulse = tendril.index === drivingIndex
      ? THREE.MathUtils.clamp(this.frameState.playerAttachment?.tendrilLoadPulse01 ?? 0, 0, 1)
      : 0;
    const projection = this.frameState.stabilizedProjection ?? {};
    const projectionBrace = projection.active && projection.surfaceBraced && tendril.phase === "sealed"
      ? THREE.MathUtils.clamp(projection.braceQuality01 ?? 0, 0, 1)
      : 0;
    const slackArc = 0.082 - load01 * 0.040 - drivingPulse * 0.018 - projectionBrace * 0.022;
    const organicSide = (tendril.index - 1) * (0.022 - load01 * 0.008);
    tendril.controlA.copy(tendril.startWorld)
      .lerp(end, 0.31)
      .addScaledVector(this.normal, -slackArc - tangentLean * 0.018)
      .addScaledVector(this.tangentSide, organicSide);
    tendril.controlB.copy(tendril.startWorld)
      .lerp(end, 0.70)
      .addScaledVector(this.normal, -(slackArc * 0.58))
      .addScaledVector(this.tangentSide, organicSide * 0.42)
      .addScaledVector(this.tangentForward, tendril.phase === "peeling" ? -0.036 : 0.016 * tangentLean);

    const points = [tendril.startWorld, tendril.controlA, tendril.controlB, end];
    for (let i = 0; i < 3; i += 1) {
      this.placeSegment(tendril.segments[i], points[i], points[i + 1], tendril.reveal, i);
      if (drivingPulse > 0.01 || projectionBrace > 0.01) {
        tendril.segments[i].scale.x *= 1 + drivingPulse * 0.08 + projectionBrace * 0.09;
        tendril.segments[i].scale.z *= 1 + drivingPulse * 0.08 + projectionBrace * 0.09;
        tendril.segments[i].material.emissiveIntensity += drivingPulse * 0.20 + projectionBrace * 0.24;
      }
    }

    const seal = THREE.MathUtils.clamp(tendril.seal, 0, 1);
    const contactVisible = seal > 0.015 && tendril.phase !== "retracted";

    // HC031E1: the sucker is never attached to the travelling reach tip. It is
    // planted on the authored surface anchor and only becomes visible as the tip
    // arrives. During peel it stays planted while the tendon lifts away.
    tendril.pad.visible = contactVisible;
    tendril.contactPatch.visible = contactVisible;
    if (contactVisible) {
      const peelU = tendril.phase === "peeling"
        ? THREE.MathUtils.clamp(tendril.phaseAge / this.peelDuration, 0, 1)
        : 0;
      const peelSide = tendril.index === 1 ? -1 : tendril.index === 2 ? 1 : 0.35;
      const radialSpread = 0.64 + seal * 0.52;
      const peelStretch = tendril.phase === "peeling" ? 1 + Math.sin(peelU * Math.PI) * 0.48 : 1;
      const peelSquash = tendril.phase === "peeling" ? 1 - Math.sin(peelU * Math.PI) * 0.30 : 1;

      // Broad (-Y) face sits on the authored surface; the thinner neck faces the Core.
      tendril.pad.position.copy(tendril.anchorWorld).addScaledVector(this.normal, this.padThickness * 0.50);
      tendril.pad.quaternion.setFromUnitVectors(Y_AXIS, this.normal);
      if (tendril.phase === "peeling") {
        tendril.pad.rotateOnWorldAxis(this.tangentForward, peelSide * Math.sin(peelU * Math.PI) * 0.34);
      }
      tendril.pad.scale.set(
        radialSpread * peelStretch * (1 + projectionBrace * 0.08),
        Math.max(0.14, (0.48 - seal * 0.30) * (1 - projectionBrace * 0.28)) * peelSquash,
        radialSpread / Math.max(1, peelStretch * 0.72) * (1 + projectionBrace * 0.08)
      );
      tendril.pad.material.opacity = 0.18 + seal * 0.62;
      tendril.pad.material.emissiveIntensity = 0.12 + seal * 0.22 + drivingPulse * 0.18 + projectionBrace * 0.28;

      tendril.contactPatch.position.copy(tendril.anchorWorld).addScaledVector(this.normal, 0.003);
      tendril.contactPatch.quaternion.setFromUnitVectors(Z_AXIS, this.normal);
      tendril.contactPatch.scale.setScalar(0.74 + seal * 0.56);
      tendril.contactPatch.material.opacity = seal * (0.18 + projectionBrace * 0.10);
    }

    tendril.rootBulb.visible = tendril.reveal > 0.04;
    if (tendril.rootBulb.visible) {
      const rootPull = THREE.MathUtils.clamp((length - 0.30) / 0.32, 0, 1);
      this.tempD.copy(direction).normalize();
      tendril.rootBulb.position.copy(tendril.startWorld).addScaledVector(this.tempD, 0.018 + rootPull * 0.012);
      tendril.rootBulb.quaternion.setFromUnitVectors(Y_AXIS, this.tempD);
      tendril.rootBulb.scale.set(
        0.78 - rootPull * 0.12,
        0.78 + tendril.reveal * 0.34 + rootPull * 0.72 + drivingPulse * 0.18 + projectionBrace * 0.34,
        0.78 - rootPull * 0.12
      );
      tendril.rootBulb.material.opacity = tendril.reveal * (0.46 + rootPull * 0.16);
      tendril.rootBulb.material.emissiveIntensity = 0.12 + rootPull * 0.24 + drivingPulse * 0.24 + projectionBrace * 0.30;
    }

    tendril.stretch = length;
    tendril.anchorDrift = tendril.anchorWorld.distanceTo(tendril.lastIdealAnchor);
  }

  placeSegment(mesh, a, b, reveal, segmentIndex) {
    const delta = this.tempB.copy(b).sub(a);
    const length = delta.length();
    mesh.visible = reveal > 0.02 && length > 0.002;
    if (!mesh.visible) return;

    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y_AXIS, delta.normalize());
    const taper = [1.0, 0.80, 0.60][segmentIndex] ?? 0.60;
    const tension = THREE.MathUtils.clamp(length / 0.26, 0.72, 1.55);
    const tensionThin = THREE.MathUtils.clamp(1.08 - Math.max(0, tension - 1) * 0.24, 0.78, 1.08);
    mesh.scale.set(
      taper * (0.86 + reveal * 0.14) * tensionThin,
      length,
      taper * (0.86 + reveal * 0.14) * tensionThin
    );
    mesh.material.opacity = reveal * (0.42 + Math.min(1.3, tension) * 0.22);
    mesh.material.emissiveIntensity = 0.14 + reveal * 0.14 + Math.max(0, tension - 1) * 0.22;
  }

  publishState(contactState, contactRequested) {
    const sealed = this.tendrils.filter((tendril) => tendril.phase === "sealed");
    const sealedCount = sealed.length;
    const reachingCount = this.tendrils.filter((tendril) => tendril.phase === "reaching").length;
    const peelingCount = this.tendrils.filter((tendril) => tendril.phase === "peeling").length;
    const maxStretch = this.tendrils.reduce((value, tendril) => Math.max(value, tendril.stretch), 0);
    const handoffActive = reachingCount > 0 || peelingCount > 0;
    const carriedSealed = sealed.filter((tendril) => tendril.anchorSurface?.valid && tendril.anchorSurface.surfaceId !== "none");
    const carriedCounts = new Map();
    for (const tendril of carriedSealed) {
      const id = tendril.anchorSurface.surfaceId;
      carriedCounts.set(id, (carriedCounts.get(id) ?? 0) + 1);
    }
    let carriedSurfaceId = "none";
    let carriedSurfaceCount = 0;
    for (const tendril of carriedSealed) {
      const id = tendril.anchorSurface.surfaceId;
      const count = carriedCounts.get(id) ?? 0;
      if (count > carriedSurfaceCount) {
        carriedSurfaceId = id;
        carriedSurfaceCount = count;
      }
    }
    const carriedSurfaceAnchor = carriedSealed.find((tendril) => tendril.anchorSurface.surfaceId === carriedSurfaceId);
    const carriedSurface = carriedSurfaceAnchor?.anchorSurface ?? this.createSurfaceRelation();
    const support01 = THREE.MathUtils.clamp(carriedSurfaceCount / 2, 0, 1);
    const mechanicalContactEligible = Boolean(carriedSurface.valid && carriedSurfaceCount > 0);
    const traction01 = mechanicalContactEligible
      ? THREE.MathUtils.clamp(support01 * (handoffActive ? 0.72 : 1), 0, 1)
      : 0;

    const anchorStates = this.tendrils.map((tendril) => ({
      index: tendril.index,
      phase: tendril.phase,
      phaseAge: Number(tendril.phaseAge.toFixed(3)),
      sealed: tendril.phase === "sealed",
      seal: Number(THREE.MathUtils.clamp(tendril.seal, 0, 1).toFixed(3)),
      stretch: Number(tendril.stretch.toFixed(3)),
      stridePressure: Number((tendril.stridePressure ?? 0).toFixed(3)),
      reachOrigin: tendril.reachOrigin ?? "none",
      anchorWorld: {
        x: Number(tendril.anchorWorld.x.toFixed(4)),
        y: Number(tendril.anchorWorld.y.toFixed(4)),
        z: Number(tendril.anchorWorld.z.toFixed(4))
      },
      surface: this.serializeSurfaceRelation(tendril.anchorSurface)
    }));

    this.frameState.coreTendrilContact = {
      pass: "HC-031T1",
      active: contactRequested || sealedCount > 0 || reachingCount > 0 || peelingCount > 0,
      contactState,
      requestedContactState: this.frameState.coreContactLanguage?.state ?? "suspended",
      boundaryOnlyContactSuppressed: Boolean(
        (this.frameState.coreContactLanguage?.state === "attached" || this.frameState.coreContactLanguage?.state === "brushing")
        && !(this.frameState.playerAttachment?.active === true)
        && !(this.frameState.coreSurfaceTruth?.valid && this.frameState.coreSurfaceTruth?.mechanicalEligible !== false)
      ),
      tendrilCount: 3,
      sealedCount,
      reachingCount,
      peelingCount,
      occupiedIndices: this.tendrils
        .filter((tendril) => tendril.phase !== "retracted" || tendril.reveal > 0.01)
        .map((tendril) => tendril.index),
      maxStretch: Number(maxStretch.toFixed(3)),
      stepCount: this.tendrils.reduce((sum, tendril) => sum + tendril.stepCount, 0),
      boundaryOwner: this.lastBoundaryOwner,
      surfaceTruthOwner: this.surfaceTruthOwner,
      surfaceTruthActive: this.surfaceTruthActive,
      surfaceTruthMeshName: this.surfaceTruthMeshName,
      surfaceTruthSurfaceId: this.surfaceTruthSurfaceId,
      surfaceTruthProfileId: this.surfaceTruthProfileId,
      surfaceTruthMaterialFamily: this.surfaceTruthMaterialFamily,
      surfaceTruthAdhesion: Number(this.surfaceTruthAdhesion.toFixed(3)),
      surfaceTruthLoadTolerance: Number(this.surfaceTruthLoadTolerance.toFixed(3)),
      surfaceTruthCompliance: Number(this.surfaceTruthCompliance.toFixed(3)),
      surfaceTruthVerbTransmission: { ...this.surfaceTruthVerbTransmission },
      surfaceSource: this.surfaceTruthActive ? "authored_crawlable_surface_raycast" : "existing_world_fixed_anchor_only_no_new_boundary_footholds",
      movementAuthority: "PlayerMovementController",
      anchorAuthority: "CoreTendrilSurfaceContactSystem",
      visualAuthority: "CoreTendrilSurfaceContactSystem",
      visualFamily: CORE_TENDRIL_VISUAL.family,
      sameAnatomyAsFreeTravelTendrils: true,
      publishesMovementRequest: true,
      addsCollider: false,
      addsRaycast: false,
      consumesBoundedVisibleSurfaceTruth: false,
      consumesAuthoredEcologicalSurfaceTruth: true,
      genericVisibleMeshEligible: false,
      changesControls: false,
      locomotionDrivenByTendrils: true,
      suctionPadSurfaceLocked: true,
      padVisibleOnlyDuringSeal: true,
      ordinaryContactMaxStretch: this.maxStretch,
      mechanicalContactEligible,
      carriedSurfaceIdentityActive: mechanicalContactEligible,
      carriedSurfaceId: mechanicalContactEligible ? carriedSurface.surfaceId : "none",
      carriedSurfaceProfileId: mechanicalContactEligible ? carriedSurface.profileId : "none",
      carriedSurfaceMaterialFamily: mechanicalContactEligible ? carriedSurface.materialFamily : "none",
      carriedSurfaceAdhesion: mechanicalContactEligible ? Number(carriedSurface.adhesion.toFixed(3)) : 0,
      carriedSurfaceLoadTolerance: mechanicalContactEligible ? Number(carriedSurface.loadTolerance.toFixed(3)) : 0,
      carriedSurfaceCompliance: mechanicalContactEligible ? Number(carriedSurface.compliance.toFixed(3)) : 0,
      carriedSurfaceVerbTransmission: mechanicalContactEligible ? { ...carriedSurface.verbTransmission } : { pulse: 0, absorb: 0, stabilize: 0 },
      physicalContactLaw: "authored_truth_authorizes_every_new_foothold_retained_world_anchor_survives_brief_gap",
      surfaceLocomotion: {
        active: mechanicalContactEligible,
        mode: handoffActive ? "anchor_handoff" : sealedCount >= 2 ? "supported_pull" : "single_anchor_pull",
        supportCount: carriedSurfaceCount,
        rawSealedCount: sealedCount,
        carriedSurfaceId: mechanicalContactEligible ? carriedSurface.surfaceId : "none",
        support01: Number(support01.toFixed(3)),
        traction01: Number(traction01.toFixed(3)),
        handoffActive,
        intendedForward: {
          x: Number(this.tangentForward.x.toFixed(4)),
          y: Number(this.tangentForward.y.toFixed(4)),
          z: Number(this.tangentForward.z.toFixed(4))
        },
        anchors: anchorStates,
        requestOwner: "CoreTendrilSurfaceContactSystem",
        consumer: "PlayerMovementController",
        oneFrameCausalHandoff: true,
        physicalContactEligible: mechanicalContactEligible,
        anchorCarriesAuthoredSurfaceIdentity: true,
        currentSurfaceTruthRequiredAfterSeal: false,
        surfaceEligibilityAuthorityAtSeal: "CoreSurfaceTruthSystem",
        plantedContactPolicy: "authored_origin_required_for_new_reach_retained_anchor_until_peel_or_replant",
        stepSelectionPolicy: "highest_stride_pressure_deterministic_tie_break",
        stepCandidateIndex: this.stepCandidateIndex,
        predictedFootholdInSurfaceTangentFrame: true
      },
      focusedProjectionBraceEligible: true,
      focusedProjectionRequiresAnchor: false,
      proofGoal: "sealed_anchor_retains_authored_surface_identity_so_support_movement_and_stabilized_projection_share_one_persistent_relationship"
    };

    this.playerRoot.userData.coreTendrilContactState = contactState;
    this.playerRoot.userData.coreTendrilSealedCount = sealedCount;
  }
}
