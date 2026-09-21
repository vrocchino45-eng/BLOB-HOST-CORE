import * as THREE from "three";

export class PlayerMovementController {
  constructor({ playerRoot, camera, frameState, localCellRecipe }) {
    if (!playerRoot) {
      throw new Error("[PlayerMovementController] playerRoot is required.");
    }
    if (!camera) {
      throw new Error("[PlayerMovementController] camera is required for camera-relative movement.");
    }

    this.playerRoot = playerRoot;
    this.camera = camera;
    this.frameState = frameState;
    this.localCellRecipe = localCellRecipe;

    this.velocity = new THREE.Vector3();
    this.intent = new THREE.Vector3();
    this.flow = new THREE.Vector3();
    this.flowVelocity = new THREE.Vector3();
    this.fluidSlip = new THREE.Vector3();
    this.boundaryNormal = new THREE.Vector3();
    this.boundarySurfaceNormal = new THREE.Vector3(0, 1, 0);
    this.boundaryProximity = 0;
    this.boundaryRadialSpeed = 0;
    this.boundaryTangentialSpeed = 0;
    this.assistVector = new THREE.Vector3();
    this.desiredMoveAcceleration = new THREE.Vector3();
    this.environmentFlowAcceleration = new THREE.Vector3();
    this.cameraForward = new THREE.Vector3(0, 0, -1);
    this.cameraPlanarForward = new THREE.Vector3(0, 0, -1);
    this.cameraRight = new THREE.Vector3(1, 0, 0);
    this.worldUp = new THREE.Vector3(0, 1, 0);

    // HC031F1 — tendril traction workspace. PlayerMovementController remains the
    // sole translation owner, but attached motion is now driven by the planted
    // anchors published by CoreTendrilSurfaceContactSystem.
    this.tendrilIntentTangent = new THREE.Vector3();
    this.tendrilAnchorDelta = new THREE.Vector3();
    this.tendrilAnchorDirection = new THREE.Vector3();
    this.tendrilDriveDirection = new THREE.Vector3();
    this.tendrilLeadingAnchorWorld = new THREE.Vector3();
    this.tendrilLocomotionTelemetry = {
      active: false,
      supportCount: 0,
      traction01: 0,
      leadingAnchorIndex: -1,
      leadingAnchorDistance: 0,
      leadingAnchorAlignment: 0,
      directInputScale: 1,
      pullAcceleration: 0,
      mode: "inactive"
    };

    // HC025B contained chemistry-driven attachment proof. HC025C keeps that
    // behavior but explicitly classifies which authored movement envelope is the
    // current contactable surface. Decorative/interior meshes remain visual-only.
    this.attachmentActive = false;
    this.attachmentState = "free";
    this.attachmentAcquireAge = 0;
    this.attachmentReleaseAge = 99;
    this.attachmentCooldown = 0;
    this.attachmentStrength = 0;
    this.attachmentSiltAlignment = 0;
    this.attachmentReleaseTension = 0;
    this.attachmentTargetNormalizedDistance = 0.955;
    this.attachmentShellNormalizedDistance = 0.955;
    this.attachmentStandOffDistance = 0.30;
    this.attachmentSurfaceTangentSpeed = 0;
    this.attachmentSiltWorldDirection = new THREE.Vector3(0, 0, -1);
    this.attachmentTangentVelocity = new THREE.Vector3();
    // HC031F1A — visible surface truth becomes the effective attachment plane
    // while valid. The authored ellipsoid remains only a safety/fallback envelope.
    this.attachmentSurfaceNormal = new THREE.Vector3(0, 1, 0);
    this.attachmentSurfacePoint = new THREE.Vector3();
    this.surfaceTruthActive = false;
    this.surfaceTruthDistance = Infinity;
    this.surfaceTruthMeshName = "none";
    // HC031F1B — ecological surface identity travels with the contact point so
    // movement can respond to authored adhesion/load without owning world semantics.
    this.surfaceTruthSurfaceId = "none";
    this.surfaceTruthProfileId = "none";
    this.surfaceTruthMaterialFamily = "none";
    this.surfaceTruthAdhesion = 0.75;
    this.surfaceTruthLoadTolerance = 0.70;
    this.surfaceTruthCompliance = 0.50;
    this.surfaceTruthVerbTransmission = { pulse: 0.5, absorb: 0.5, stabilize: 0.5 };
    this.attachmentVisibleStandOffDistance = 0.38;

    // HC031H — prior-frame planted anchors define a stable support plane that
    // refines tangent motion and ride height without taking translation authority.
    this.tendrilSupportPlaneActive = false;
    this.tendrilSupportNormal = new THREE.Vector3(0, 1, 0);
    this.tendrilSupportCentroid = new THREE.Vector3();
    this.tendrilSupportQuality01 = 0;
    this.tendrilSupportCount = 0;
    this.tendrilSupportTargetRideHeight = 0.38;
    this.tendrilSupportRideHeightError = 0;
    this.tendrilSupportSurfaceId = "none";

    const physicalFeel = localCellRecipe.physicalFeel ?? {};
    const flowVector = physicalFeel.flowVector ?? [0, 0, 0];
    this.flow.set(flowVector[0] ?? 0, flowVector[1] ?? 0, flowVector[2] ?? 0);

    this.viscosity = Number.isFinite(physicalFeel.viscosity)
      ? physicalFeel.viscosity
      : 0.5;

    this.pressure = Number.isFinite(physicalFeel.pressure)
      ? physicalFeel.pressure
      : 0.0;

    this.defaultBoundary = {
      x: 6.4,
      y: 3.45,
      z: 4.8
    };
    this.boundary = { ...this.defaultBoundary };
    this.boundaryCenter = new THREE.Vector3();
    this.boundaryNormalizedDistance = 0;
    this.boundaryOwner = "PlayerMovementController";
    this.boundaryTuningOwner = "default_first_slice_membrane";
    this.boundaryRegionId = "shared_first_slice";
    this.boundaryMode = "world_origin_ellipsoid";
  }

  update(dt, frameState) {
    this.syncPhysicalFeel(frameState);
    this.syncMovementBoundary(frameState);
    const input = frameState.input ?? {};
    const hubGuidedFlightActive = Boolean(frameState.hubRouteCommitFlight?.active);

    const movementTuning = frameState.controllerOnboarding?.tuning?.movement ?? {};
    const growthMovement = frameState.coreGrowth?.movementModifiers ?? {};
    const radialPerformance = frameState.corePerformance?.movementModifiers ?? {};
    const topologyEnvironmentalHandling = frameState.coreTopologyEnvironmentalHandling?.handling ?? {};
    const verticalScale = movementTuning.verticalScale ?? 0.8;

    this.buildCameraRelativeIntent(input, verticalScale);
    if (hubGuidedFlightActive) this.intent.set(0, 0, 0);

    if (this.intent.lengthSq() > 1) {
      this.intent.normalize();
    }

    // Sample the trusted authored boundary before acceleration so attachment can
    // interpret the current Core-to-surface relationship without adding raycasts.
    this.sampleMembraneBoundaryTelemetry();
    this.syncAttachmentSurfaceTruth(frameState);
    this.syncTendrilSupportPlane(frameState);
    this.updateChemistryAttachmentState(dt, frameState);

    const physicalFeel = frameState.physicalFeel ?? {};
    const routeAccelerationScale = THREE.MathUtils.clamp(
      physicalFeel.accelerationScale ?? 1,
      0.45,
      1.5
    );
    const routeSpeedScale = THREE.MathUtils.clamp(
      physicalFeel.speedScale ?? 1,
      0.45,
      1.5
    );
    const routeBoostScale = THREE.MathUtils.clamp(
      physicalFeel.boostScale ?? 1,
      0.4,
      1.35
    );
    const routeFlowCouplingScale = THREE.MathUtils.clamp(
      physicalFeel.flowCouplingScale ?? 1,
      0.35,
      1.8
    );

    const flowMagnitude = this.flow.length();
    const intentMagnitudeForAlignment = this.intent.length();
    const directionalAlignment = (
      flowMagnitude > 0.001 && intentMagnitudeForAlignment > 0.001
    )
      ? THREE.MathUtils.clamp(
          this.intent.dot(this.flow) / (intentMagnitudeForAlignment * flowMagnitude),
          -1,
          1
        )
      : 0;
    const withFlowSpeedBonus = Math.max(0, physicalFeel.withFlowSpeedBonus ?? 0);
    const againstFlowSpeedPenalty = Math.max(0, physicalFeel.againstFlowSpeedPenalty ?? 0);
    const directionalSpeedScale = directionalAlignment >= 0
      ? 1 + directionalAlignment * withFlowSpeedBonus
      : 1 - Math.abs(directionalAlignment) * againstFlowSpeedPenalty;

    const performanceBoostAccelerationScale = input.boostHeld
      ? THREE.MathUtils.clamp(radialPerformance.boostAccelerationMultiplier ?? 1, 0.8, 1.34)
      : 1;
    const performanceBoostSpeedScale = input.boostHeld
      ? THREE.MathUtils.clamp(radialPerformance.boostSpeedMultiplier ?? 1, 0.82, 1.24)
      : 1;
    const verbCommitmentMovementScale = (input.absorbHeld || input.stabilizeHeld)
      ? THREE.MathUtils.clamp(radialPerformance.verbCommitmentMovementMultiplier ?? 1, 0.66, 1)
      : 1;
    const boost = input.boostHeld
      ? (movementTuning.boostMultiplier ?? 1.8) * routeBoostScale * performanceBoostAccelerationScale
      : 1.0;
    const baseAcceleration = movementTuning.baseAcceleration ?? 13.1;
    const accelerationMultiplier = growthMovement.accelerationMultiplier ?? 1;
    const dragMultiplier = growthMovement.dragMultiplier ?? 1;
    const flowCouplingMultiplier = (growthMovement.flowCouplingMultiplier ?? 1)
      * routeFlowCouplingScale;
    const acceleration = baseAcceleration
      * boost
      * routeAccelerationScale
      * (1.0 - this.viscosity * 0.18)
      * accelerationMultiplier
      * verbCommitmentMovementScale;
    const drag = (
      (movementTuning.dragBase ?? 2.15)
      + this.viscosity * (movementTuning.dragViscosityMultiplier ?? 4.1)
    ) * dragMultiplier;
    const convergenceReachability = this.resolveConvergenceReachability(frameState);
    // HC028H1 only changes how existing Host flow is received. During the
    // deliberate Hub flight or convergence-reachability envelope, reception
    // returns to the established baseline so topology cannot reintroduce a
    // progression/reachability obstruction.
    const topologyHandlingSuppressed = hubGuidedFlightActive || convergenceReachability.active;
    const topologyEnvironmentalCouplingScale = topologyHandlingSuppressed
      ? 1
      : THREE.MathUtils.clamp(
          topologyEnvironmentalHandling.environmentalCouplingMultiplier ?? 1,
          0.92,
          1.09
        );
    const topologyFluidSlipDampingScale = topologyHandlingSuppressed
      ? 1
      : THREE.MathUtils.clamp(
          topologyEnvironmentalHandling.fluidSlipDampingMultiplier ?? 1,
          0.94,
          1.07
        );
    const flowStrength = (
      0.38
      + this.pressure * (movementTuning.flowPressureMultiplier ?? 0.75)
    ) * flowCouplingMultiplier
      * convergenceReachability.environmentScale
      * topologyEnvironmentalCouplingScale;
    const inputMagnitude = Math.min(1, this.intent.length());

    const tendrilSurfaceRequest = frameState.coreTendrilContact?.surfaceLocomotion ?? {};
    const tendrilSurfaceDriveActive = Boolean(
      this.attachmentActive
      && tendrilSurfaceRequest.active
      && (tendrilSurfaceRequest.supportCount ?? 0) > 0
    );
    // Once attached, raw controller thrust becomes only a small intention cue.
    // The planted-anchor traction below supplies the actual surface acceleration.
    const directInputAccelerationScale = tendrilSurfaceDriveActive ? 0.04 : 1.0;

    this.desiredMoveAcceleration.copy(this.intent).multiplyScalar(acceleration);
    this.environmentFlowAcceleration.copy(this.flow).multiplyScalar(flowStrength);
    this.velocity.addScaledVector(this.intent, acceleration * dt * directInputAccelerationScale);
    this.velocity.addScaledVector(this.flow, flowStrength * dt);
    this.flowVelocity.copy(this.flow).multiplyScalar(
      (0.72 + this.pressure * 1.28) * convergenceReachability.environmentScale
    );
    this.fluidSlip.copy(this.velocity).sub(this.flowVelocity);

    const assistStrength = this.computeInteractionAssist(input, frameState, dt);
    const coastingDragScale = inputMagnitude > 0.04 ? 0.72 : 1;
    this.velocity.addScaledVector(
      this.fluidSlip,
      -Math.min(drag * coastingDragScale * topologyFluidSlipDampingScale * dt, 0.92)
    );

    // Attached motion remains camera-relative but becomes tangent to the current
    // Host membrane. Into-surface velocity is absorbed as compression; pulling
    // inward/away is interpreted by the state machine as release intent.
    this.applyChemistryAttachmentVelocity();
    this.tendrilLocomotionTelemetry = this.applyTendrilSurfaceLocomotion(
      dt,
      acceleration,
      frameState,
      directInputAccelerationScale
    );

    const speedLimit = (movementTuning.speedLimit ?? 4.65)
      * routeSpeedScale
      * directionalSpeedScale
      * verbCommitmentMovementScale
      * (
        input.boostHeld
          ? (movementTuning.boostSpeedMultiplier ?? 1.85) * routeBoostScale * performanceBoostSpeedScale
          : 1
      );
    if (this.velocity.lengthSq() > speedLimit * speedLimit) {
      this.velocity.setLength(speedLimit);
    }

    if (hubGuidedFlightActive) {
      this.velocity.set(0, 0, 0);
    } else {
      this.playerRoot.position.addScaledVector(this.velocity, dt);
    }

    const boundaryPressure = hubGuidedFlightActive ? 0 : this.applyMembraneBoundary(dt);
    const surfaceCoverage = this.resolveContactSurfaceCoverage();
    frameState.contactSurfaceCoverage = surfaceCoverage;

    const speed = this.velocity.length();
    const kineticGlow = Math.min(speed / 2.6, 1.0);

    frameState.playerAttachment = {
      pass: "HC-025B",
      active: this.attachmentActive,
      state: this.attachmentState,
      adhesionStrength: Number(this.attachmentStrength.toFixed(3)),
      siltSurfaceAlignment: Number(this.attachmentSiltAlignment.toFixed(3)),
      releaseTension: Number(this.attachmentReleaseTension.toFixed(3)),
      surfaceTangentSpeed: Number(this.attachmentSurfaceTangentSpeed.toFixed(3)),
      tendrilLocomotionActive: Boolean(this.tendrilLocomotionTelemetry.active),
      tendrilSupportCount: this.tendrilLocomotionTelemetry.supportCount ?? 0,
      tendrilTraction01: Number((this.tendrilLocomotionTelemetry.traction01 ?? 0).toFixed(3)),
      tendrilLeadingAnchorIndex: this.tendrilLocomotionTelemetry.leadingAnchorIndex ?? -1,
      tendrilLoadPulse01: Number((this.tendrilLocomotionTelemetry.loadPulse01 ?? 0).toFixed(3)),
      tendrilPullAcceleration: Number((this.tendrilLocomotionTelemetry.pullAcceleration ?? 0).toFixed(3)),
      tendrilLeadingAnchorWorld: this.tendrilLocomotionTelemetry.leadingAnchorWorld ?? null,
      standOffDistance: this.tendrilSupportPlaneActive
        ? this.tendrilSupportTargetRideHeight
        : this.surfaceTruthActive
          ? this.attachmentVisibleStandOffDistance
          : this.attachmentStandOffDistance,
      tendrilSupportPlaneActive: this.tendrilSupportPlaneActive,
      tendrilSupportPlaneQuality01: Number(this.tendrilSupportQuality01.toFixed(3)),
      tendrilSupportPlaneCount: this.tendrilSupportCount,
      tendrilSupportPlaneSurfaceId: this.tendrilSupportSurfaceId,
      tendrilSupportRideHeightError: Number(this.tendrilSupportRideHeightError.toFixed(3)),
      surfaceTruthActive: this.surfaceTruthActive,
      surfaceTruthDistance: Number.isFinite(this.surfaceTruthDistance) ? Number(this.surfaceTruthDistance.toFixed(3)) : null,
      surfaceTruthMeshName: this.surfaceTruthMeshName,
      surfaceTruthSurfaceId: this.surfaceTruthSurfaceId,
      surfaceTruthProfileId: this.surfaceTruthProfileId,
      surfaceTruthMaterialFamily: this.surfaceTruthMaterialFamily,
      surfaceTruthAdhesion: Number(this.surfaceTruthAdhesion.toFixed(3)),
      surfaceTruthLoadTolerance: Number(this.surfaceTruthLoadTolerance.toFixed(3)),
      surfaceTruthCompliance: Number(this.surfaceTruthCompliance.toFixed(3)),
      surfaceTruthVerbTransmission: { ...this.surfaceTruthVerbTransmission },
      boundaryProximity: Number(this.boundaryProximity.toFixed(3)),
      boundaryNormalizedDistance: Number(this.boundaryNormalizedDistance.toFixed(3)),
      shellNormalizedDistance: Number(this.attachmentShellNormalizedDistance.toFixed(3)),
      releaseCooldown: Number(this.attachmentCooldown.toFixed(3)),
      siltZoneId: frameState.coreChemistryOutput?.siltZoneId ?? "none",
      surfaceCoverageClass: surfaceCoverage.classId,
      surfaceCoverageLabel: surfaceCoverage.shortLabel,
      surfaceCoverageRegionId: surfaceCoverage.regionId,
      surfaceCoverageTuningOwner: surfaceCoverage.tuningOwner,
      interiorDecorativeGeometryContactable: false,
      usesTrustedMovementBoundaryOnly: false,
      visibleSurfaceTruthPreferred: false,
      authoredEcologicalSurfaceTruthPreferred: true,
      genericVisibleMeshSurfaceTruthAllowed: false,
      authoredBoundaryFallback: true,
      requiresSiltMembrane: true,
      usesSiltWorldAlignment: true,
      addsCollider: false,
      addsRaycast: false,
      progressionAuthority: false
    };

    frameState.playerKinematics = {
      position: {
        x: this.playerRoot.position.x,
        y: this.playerRoot.position.y,
        z: this.playerRoot.position.z
      },
      velocity: {
        x: this.velocity.x,
        y: this.velocity.y,
        z: this.velocity.z
      },
      speed,
      locomotionMode: hubGuidedFlightActive
        ? "hub_guided_commit"
        : this.tendrilLocomotionTelemetry.active
          ? "surface_tendril_pull"
          : input.boostHeld
            ? "boost"
            : "normal",
      normalSpeedLimit: movementTuning.speedLimit ?? 4.65,
      activeSpeedLimit: speedLimit,
      boostSpeedMultiplier: movementTuning.boostSpeedMultiplier ?? 1.85,
      routeAccelerationScale,
      routeSpeedScale,
      routeBoostScale,
      routeFlowCouplingScale,
      radialPerformanceBoostAccelerationScale: performanceBoostAccelerationScale,
      radialPerformanceBoostSpeedScale: performanceBoostSpeedScale,
      radialVerbCommitmentMovementScale: verbCommitmentMovementScale,
      radialPerformanceOwner: "CoreRadialPerformanceSystem",
      topologyEnvironmentalHandling: {
        pass: "HC-028H1",
        active: Boolean(frameState.coreTopologyEnvironmentalHandling?.active),
        mode: frameState.coreTopologyEnvironmentalHandling?.handling?.mode ?? "neutral",
        environmentalCouplingMultiplier: topologyEnvironmentalCouplingScale,
        fluidSlipDampingMultiplier: topologyFluidSlipDampingScale,
        suppressed: topologyHandlingSuppressed,
        suppressionReason: hubGuidedFlightActive
          ? "hub_guided_commit"
          : convergenceReachability.active
            ? "convergence_reachability"
            : "none",
        normalInputAccelerationMultiplier: 1,
        speedLimitMultiplier: 1,
        worldForceGenerationUnchanged: true
      },
      directionalFlowAlignment: directionalAlignment,
      directionalSpeedScale,
      routeFeelProfile: physicalFeel.routeFeelProfile ?? "shared",
      viscosity: this.viscosity,
      pressure: this.pressure,
      flowVector: {
        x: this.flow.x,
        y: this.flow.y,
        z: this.flow.z
      },
      desiredMoveVector: {
        x: this.desiredMoveAcceleration.x,
        y: this.desiredMoveAcceleration.y,
        z: this.desiredMoveAcceleration.z
      },
      environmentalForceVector: {
        x: this.environmentFlowAcceleration.x,
        y: this.environmentFlowAcceleration.y,
        z: this.environmentFlowAcceleration.z
      },
      finalMoveVector: {
        x: this.velocity.x,
        y: this.velocity.y,
        z: this.velocity.z
      },
      convergenceEnvelope01: convergenceReachability.envelope01,
      convergenceEnvironmentScale: convergenceReachability.environmentScale,
      convergenceReachabilityActive: convergenceReachability.active,
      flowVelocity: {
        x: this.flowVelocity.x,
        y: this.flowVelocity.y,
        z: this.flowVelocity.z
      },
      fluidSlip: this.fluidSlip.length(),
      boundaryPressure,
      kineticGlow,
      assistStrength,
      inputMagnitude,
      thrust: acceleration * inputMagnitude,
      tendrilSurfaceLocomotion: { ...this.tendrilLocomotionTelemetry },
      tendrilSupportPlane: {
        active: this.tendrilSupportPlaneActive,
        supportCount: this.tendrilSupportCount,
        supportQuality01: Number(this.tendrilSupportQuality01.toFixed(3)),
        targetRideHeight: Number(this.tendrilSupportTargetRideHeight.toFixed(3)),
        rideHeightError: Number(this.tendrilSupportRideHeightError.toFixed(3)),
        surfaceId: this.tendrilSupportSurfaceId,
        normal: {
          x: Number(this.tendrilSupportNormal.x.toFixed(4)),
          y: Number(this.tendrilSupportNormal.y.toFixed(4)),
          z: Number(this.tendrilSupportNormal.z.toFixed(4))
        }
      },
      movementFeel: this.tendrilLocomotionTelemetry.active
        ? "anchored_elastic_pull_handoff"
        : movementTuning.movementFeel ?? "embodied_viscous_current_swim",
      movementReference: hubGuidedFlightActive
        ? "hub_deliberate_guided_route_commit"
        : this.tendrilLocomotionTelemetry.active
          ? "camera_intent_surface_tangent_tendril_traction"
          : "camera_relative_embodied_free_3d",
      stickForwardMeaning: "true_camera_forward_including_pitch",
      verticalReference: "world_y_bumpers_dpad_or_keyboard",
      verticalInput: input.moveY ?? 0,
      altitude: this.playerRoot.position.y,
      altitudeRange: {
        min: this.boundaryCenter.y - this.boundary.y,
        max: this.boundaryCenter.y + this.boundary.y
      },
      movementBoundary: {
        mode: this.boundaryMode,
        owner: this.boundaryOwner,
        tuningOwner: this.boundaryTuningOwner,
        regionId: this.boundaryRegionId,
        center: {
          x: this.boundaryCenter.x,
          y: this.boundaryCenter.y,
          z: this.boundaryCenter.z
        },
        radii: {
          x: this.boundary.x,
          y: this.boundary.y,
          z: this.boundary.z
        },
        normalizedDistance: this.boundaryNormalizedDistance,
        pressure: boundaryPressure,
        proximity: this.boundaryProximity,
        radialSpeed: this.boundaryRadialSpeed,
        tangentialSpeed: this.boundaryTangentialSpeed,
        surfaceNormal: {
          x: this.boundarySurfaceNormal.x,
          y: this.boundarySurfaceNormal.y,
          z: this.boundarySurfaceNormal.z
        },
        telemetryOnly: true,
        contactSurfaceCoverage: { ...surfaceCoverage },
        attachmentPhysics: {
          pass: "HC-025B",
          active: this.attachmentActive,
          state: this.attachmentState,
          adhesionStrength: Number(this.attachmentStrength.toFixed(3)),
          siltSurfaceAlignment: Number(this.attachmentSiltAlignment.toFixed(3)),
          releaseTension: Number(this.attachmentReleaseTension.toFixed(3)),
          surfaceTangentSpeed: Number(this.attachmentSurfaceTangentSpeed.toFixed(3)),
          trustedBoundaryOnly: true
        },
        regionLocal: this.boundaryMode === "entry_anchored_ellipsoid"
      },
      cameraPitchAffectsForwardMovement: true,
      cameraForwardVerticalContribution: this.cameraForward.y,
      cameraRelativeForward: {
        x: this.cameraForward.x,
        y: this.cameraForward.y,
        z: this.cameraForward.z
      },
      cameraRelativeRight: {
        x: this.cameraRight.x,
        y: this.cameraRight.y,
        z: this.cameraRight.z
      },
      inputComfortPass: "HC-009D",
      verticalReadabilityContract: "true_camera_pitch_motion_plus_explicit_lift_and_authored_body_response",
      coreGrowthStage: frameState.coreGrowth?.stageId ?? "seed_core",
      coreGrowthBias: frameState.coreGrowth?.biasLabel ?? "balanced_first_binding",
      growthMovementApplied: Boolean(frameState.coreGrowth),
      growthMovementModifiers: {
        accelerationMultiplier,
        dragMultiplier,
        flowCouplingMultiplier,
        pressureResponseMultiplier: growthMovement.pressureResponseMultiplier ?? 1,
        stabilizeEfficiencyMultiplier: growthMovement.stabilizeEfficiencyMultiplier ?? 1
      },
      abilityUnlockedByGrowth: false
    };

    frameState.inputSource = {
      ...(frameState.inputSource ?? {}),
      movementReference: "camera_relative_embodied_free_3d",
      leftStickUpMeaning: "true_camera_forward_including_pitch",
      verticalMovementReference: "world_y_explicit_lift",
      verticalControls: "RB/LB or D-Pad Up/Down · C/Z · PageUp/PageDown"
    };

    this.playerRoot.userData.dynamicPosition = frameState.playerKinematics.position;
    this.playerRoot.userData.speed = speed;
    this.playerRoot.userData.boundaryPressure = boundaryPressure;
  }

  buildCameraRelativeIntent(input, verticalScale) {
    this.camera.getWorldDirection(this.cameraForward);

    if (this.cameraForward.lengthSq() <= 0.0001) {
      this.cameraForward.set(0, 0, -1);
    } else {
      this.cameraForward.normalize();
    }

    this.cameraPlanarForward.copy(this.cameraForward).setY(0);
    if (this.cameraPlanarForward.lengthSq() <= 0.0001) {
      this.cameraPlanarForward.set(0, 0, -1);
    } else {
      this.cameraPlanarForward.normalize();
    }

    this.cameraRight.crossVectors(this.cameraForward, this.worldUp);
    if (this.cameraRight.lengthSq() <= 0.0001) {
      this.cameraRight.crossVectors(this.cameraPlanarForward, this.worldUp);
    } else {
      this.cameraRight.normalize();
    }

    const rightAmount = input.moveX ?? 0;
    const forwardAmount = -(input.moveZ ?? 0);
    const verticalAmount = (input.moveY ?? 0) * verticalScale;

    this.intent.copy(this.cameraRight).multiplyScalar(rightAmount);
    this.intent.addScaledVector(this.cameraForward, forwardAmount);
    this.intent.addScaledVector(this.worldUp, verticalAmount);
  }

  sampleMembraneBoundaryTelemetry() {
    const p = this.playerRoot.position;
    const dx = p.x - this.boundaryCenter.x;
    const dy = p.y - this.boundaryCenter.y;
    const dz = p.z - this.boundaryCenter.z;
    const nx = dx / this.boundary.x;
    const ny = dy / this.boundary.y;
    const nz = dz / this.boundary.z;
    const normalizedDistance = Math.sqrt(nx * nx + ny * ny + nz * nz);
    this.boundaryNormalizedDistance = normalizedDistance;

    this.boundarySurfaceNormal.set(
      nx / this.boundary.x,
      ny / this.boundary.y,
      nz / this.boundary.z
    );
    if (this.boundarySurfaceNormal.lengthSq() > 0.000001) {
      this.boundarySurfaceNormal.normalize();
    } else {
      this.boundarySurfaceNormal.set(0, 1, 0);
    }

    this.boundaryProximity = THREE.MathUtils.clamp((normalizedDistance - 0.72) / 0.28, 0, 1);
    this.boundaryRadialSpeed = this.velocity.dot(this.boundarySurfaceNormal);
    const velocitySq = this.velocity.lengthSq();
    this.boundaryTangentialSpeed = Math.sqrt(Math.max(0, velocitySq - this.boundaryRadialSpeed * this.boundaryRadialSpeed));
  }

  syncAttachmentSurfaceTruth(frameState) {
    const truth = frameState.coreSurfaceTruth ?? {};
    const point = truth.point ?? {};
    const normal = truth.normal ?? {};
    const distance = Number(truth.distance);
    const valid = Boolean(
      truth.valid
      && truth.mechanicalEligible !== false
      && Number.isFinite(distance)
      && distance <= 0.82
      && [point.x, point.y, point.z, normal.x, normal.y, normal.z].every(Number.isFinite)
    );

    this.surfaceTruthActive = valid;
    this.surfaceTruthDistance = valid ? distance : Infinity;
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

    if (valid) {
      this.attachmentSurfacePoint.set(point.x, point.y, point.z);
      this.attachmentSurfaceNormal.set(normal.x, normal.y, normal.z);
      if (this.attachmentSurfaceNormal.lengthSq() < 0.0001) this.attachmentSurfaceNormal.copy(this.boundarySurfaceNormal);
      else this.attachmentSurfaceNormal.normalize();
    } else {
      this.attachmentSurfaceNormal.copy(this.boundarySurfaceNormal);
      this.attachmentSurfacePoint.copy(this.playerRoot.position)
        .addScaledVector(this.boundarySurfaceNormal, -this.attachmentStandOffDistance);
    }
  }


  syncTendrilSupportPlane(frameState) {
    const plane = frameState.coreTendrilSupportPlane ?? {};
    const centroid = plane.supportCentroid ?? {};
    const normal = plane.supportNormal ?? {};
    const surfaceMatches = (plane.surfaceId ?? "none") === this.surfaceTruthSurfaceId;
    const valid = Boolean(
      plane.active
      && surfaceMatches
      && (plane.supportCount ?? 0) > 0
      && [centroid.x, centroid.y, centroid.z, normal.x, normal.y, normal.z].every(Number.isFinite)
    );

    this.tendrilSupportPlaneActive = valid;
    this.tendrilSupportCount = valid ? Math.max(0, Math.floor(plane.supportCount ?? 0)) : 0;
    this.tendrilSupportQuality01 = valid ? THREE.MathUtils.clamp(plane.supportQuality01 ?? 0, 0, 1) : 0;
    this.tendrilSupportTargetRideHeight = valid
      ? THREE.MathUtils.clamp(plane.targetRideHeight ?? this.attachmentVisibleStandOffDistance, 0.30, 0.44)
      : this.attachmentVisibleStandOffDistance;
    this.tendrilSupportRideHeightError = valid ? Number(plane.rideHeightError ?? 0) : 0;
    this.tendrilSupportSurfaceId = valid ? (plane.surfaceId ?? "none") : "none";

    if (!valid) {
      this.tendrilSupportNormal.copy(this.attachmentSurfaceNormal);
      this.tendrilSupportCentroid.copy(this.attachmentSurfacePoint);
      return;
    }

    this.tendrilSupportCentroid.set(centroid.x, centroid.y, centroid.z);
    this.tendrilSupportNormal.set(normal.x, normal.y, normal.z);
    if (this.tendrilSupportNormal.lengthSq() < 0.0001) this.tendrilSupportNormal.copy(this.attachmentSurfaceNormal);
    else this.tendrilSupportNormal.normalize();
  }

  updateChemistryAttachmentState(dt, frameState) {
    const chemistry = frameState.coreChemistryOutput ?? {};
    const inspection = frameState.tightInspectionCamera ?? frameState.inspectionCamera ?? {};
    const coreWorkActive = Boolean(inspection.coreWorkActive);
    const siltZoneId = chemistry.siltZoneId ?? "none";
    const siltMembraneExposure = THREE.MathUtils.clamp(chemistry.siltMembraneExposure ?? 0, 0, 1);
    const siltDirection = chemistry.siltWorldDirection ?? {};
    this.attachmentSiltWorldDirection.set(
      siltDirection.x ?? 0,
      siltDirection.y ?? 0,
      siltDirection.z ?? -1
    );
    if (this.attachmentSiltWorldDirection.lengthSq() > 0.0001) this.attachmentSiltWorldDirection.normalize();

    const rawAlignment = this.attachmentSiltWorldDirection.dot(this.boundarySurfaceNormal);
    const positiveAlignment = THREE.MathUtils.clamp(rawAlignment, 0, 1);
    this.attachmentSiltAlignment = positiveAlignment;
    const membraneTopology = THREE.MathUtils.clamp(chemistry.surfaceExpression ?? 0, 0, 1);
    const patternScale = THREE.MathUtils.clamp((chemistry.patternStrength ?? 1) / 1.15, 0.82, 1.08);
    this.attachmentStrength = siltZoneId === "membrane"
      ? THREE.MathUtils.clamp(
          siltMembraneExposure
            * (0.20 + positiveAlignment * 0.80)
            * (0.84 + membraneTopology * 0.16)
            * patternScale,
          0,
          1
        )
      : 0;

    const activeContactNormal = this.tendrilSupportPlaneActive
      ? this.tendrilSupportNormal
      : this.attachmentSurfaceNormal;
    const outwardIntent = this.intent.dot(activeContactNormal);
    const awayIntent = Math.max(0, -outwardIntent);
    this.attachmentReleaseTension = awayIntent;
    this.attachmentCooldown = Math.max(0, this.attachmentCooldown - Math.max(0, dt));
    this.attachmentReleaseAge += Math.max(0, dt);

    const convergenceReachability = this.resolveConvergenceReachability(frameState);
    const canAdhere = !coreWorkActive
      && !convergenceReachability.active
      && siltZoneId === "membrane"
      && this.attachmentStrength >= 0.45;

    if (this.attachmentActive) {
      const releaseThreshold = 0.54 + this.attachmentStrength * 0.20;
      const pulledAway = awayIntent >= releaseThreshold;
      const chemistryLost = !canAdhere;
      const surfaceLost = this.surfaceTruthActive
        ? this.surfaceTruthDistance > 0.92
        : this.boundaryNormalizedDistance < 0.82;
      if (pulledAway || chemistryLost || surfaceLost) {
        this.attachmentActive = false;
        this.attachmentState = "releasing";
        this.attachmentReleaseAge = 0;
        this.attachmentCooldown = 0.30;
        this.attachmentAcquireAge = 0;
        // A small inward release impulse makes detachment read as peeling away
        // from the inside of the membrane rather than simply losing a flag.
        const releaseImpulse = 0.48 + this.attachmentStrength * 0.72;
        this.velocity.addScaledVector(activeContactNormal, -releaseImpulse);
      } else {
        this.attachmentState = "attached";
      }
    } else {
      const nearSurface = this.surfaceTruthActive
        ? this.surfaceTruthDistance <= 0.72
        : this.boundaryProximity >= 0.74;
      const notRetreatingFast = this.boundaryRadialSpeed > -0.7;
      const canAcquire = canAdhere && nearSurface && notRetreatingFast && this.attachmentCooldown <= 0;
      if (canAcquire) {
        this.attachmentAcquireAge += Math.max(0, dt);
        if (this.attachmentAcquireAge >= 0.085) {
          this.attachmentActive = true;
          this.attachmentState = "attached";
          this.attachmentShellNormalizedDistance = THREE.MathUtils.clamp(
            this.boundaryNormalizedDistance,
            0.90,
            Math.max(0.90, this.attachmentTargetNormalizedDistance)
          );
        } else {
          this.attachmentState = "brushing";
        }
      } else {
        this.attachmentAcquireAge = Math.max(0, this.attachmentAcquireAge - Math.max(0, dt) * 2.8);
        if (this.attachmentState === "releasing" && this.attachmentReleaseAge < 0.42) {
          // retain release state briefly for body-language continuity
        } else {
          this.attachmentState = nearSurface && canAdhere ? "brushing" : "free";
        }
      }
    }
  }

  applyChemistryAttachmentVelocity() {
    if (!this.attachmentActive) {
      this.attachmentSurfaceTangentSpeed = this.boundaryTangentialSpeed;
      return;
    }
    const activeContactNormal = this.tendrilSupportPlaneActive
      ? this.tendrilSupportNormal
      : this.attachmentSurfaceNormal;
    const radialVelocity = this.velocity.dot(activeContactNormal);
    this.velocity.addScaledVector(activeContactNormal, -radialVelocity);
    this.attachmentTangentVelocity.copy(this.velocity);
    this.attachmentSurfaceTangentSpeed = this.attachmentTangentVelocity.length();
  }

  applyTendrilSurfaceLocomotion(dt, acceleration, frameState, directInputScale = 1) {
    const request = frameState.coreTendrilContact?.surfaceLocomotion ?? {};
    const supportCount = Math.max(0, Math.floor(request.supportCount ?? 0));
    const traction01 = THREE.MathUtils.clamp(request.traction01 ?? 0, 0, 1);
    const anchors = Array.isArray(request.anchors) ? request.anchors : [];

    const inactive = {
      active: false,
      supportCount,
      traction01,
      leadingAnchorIndex: -1,
      leadingAnchorDistance: 0,
      leadingAnchorAlignment: 0,
      directInputScale,
      pullAcceleration: 0,
      loadPulse01: 0,
      leadingAnchorWorld: null,
      surfaceTruthActive: this.surfaceTruthActive,
      mode: request.mode ?? "inactive"
    };

    if (!this.attachmentActive || !request.active || supportCount <= 0) return inactive;

    const locomotionNormal = this.tendrilSupportPlaneActive
      ? this.tendrilSupportNormal
      : this.attachmentSurfaceNormal;
    this.tendrilIntentTangent.copy(this.intent)
      .addScaledVector(locomotionNormal, -this.intent.dot(locomotionNormal));
    const intentMagnitude = this.tendrilIntentTangent.length();
    if (intentMagnitude < 0.035) {
      // No player intent: retain attachment, but let residual tangential velocity
      // settle so the Core looks suctioned rather than endlessly skating.
      this.velocity.multiplyScalar(Math.max(0, 1 - Math.min(1, dt * (2.8 + traction01 * 2.2))));
      return { ...inactive, active: true, mode: "anchored_rest" };
    }
    this.tendrilIntentTangent.multiplyScalar(1 / intentMagnitude);

    let leadingAnchorIndex = -1;
    let leadingAnchorDistance = 0;
    let leadingAnchorAlignment = -1;
    let leadingAnchorPhaseAge = 99;
    let bestScore = -Infinity;
    this.tendrilAnchorDirection.set(0, 0, 0);
    this.tendrilLeadingAnchorWorld.copy(this.playerRoot.position);

    for (const anchor of anchors) {
      if (!anchor?.sealed || !anchor.anchorWorld) continue;
      this.tendrilAnchorDelta.set(
        (anchor.anchorWorld.x ?? this.playerRoot.position.x) - this.playerRoot.position.x,
        (anchor.anchorWorld.y ?? this.playerRoot.position.y) - this.playerRoot.position.y,
        (anchor.anchorWorld.z ?? this.playerRoot.position.z) - this.playerRoot.position.z
      );
      this.tendrilAnchorDelta.addScaledVector(
        locomotionNormal,
        -this.tendrilAnchorDelta.dot(locomotionNormal)
      );
      const distance = this.tendrilAnchorDelta.length();
      if (distance < 0.015) continue;
      this.tendrilAnchorDelta.multiplyScalar(1 / distance);
      const alignment = this.tendrilAnchorDelta.dot(this.tendrilIntentTangent);
      const score = alignment * 1.5 + Math.min(distance, 0.8) * 0.22 + (anchor.seal ?? 1) * 0.12;
      if (score > bestScore) {
        bestScore = score;
        leadingAnchorIndex = anchor.index ?? -1;
        leadingAnchorDistance = distance;
        leadingAnchorAlignment = alignment;
        leadingAnchorPhaseAge = Number.isFinite(anchor.phaseAge) ? anchor.phaseAge : 99;
        this.tendrilLeadingAnchorWorld.set(
          anchor.anchorWorld.x ?? this.playerRoot.position.x,
          anchor.anchorWorld.y ?? this.playerRoot.position.y,
          anchor.anchorWorld.z ?? this.playerRoot.position.z
        );
        this.tendrilAnchorDirection.copy(this.tendrilAnchorDelta);
      }
    }

    // If the existing anchors are all behind the desired direction, the Core gets
    // only a weak preparatory tug until the contact system replants ahead.
    const forwardAnchorAvailable = leadingAnchorIndex >= 0 && leadingAnchorAlignment > 0.08;
    const handoffScale = request.handoffActive ? 0.46 : 1.0;
    const supportScale = supportCount >= 2 ? 1.0 : 0.46;
    const anchorAlignmentScale = forwardAnchorAvailable
      ? THREE.MathUtils.clamp(0.50 + leadingAnchorAlignment * 0.50, 0.38, 1.0)
      : 0.08;
    // Newly sealed anchors get a short strong load window. Mature anchors keep
    // enough traction to continue crawling, but the repeated seal/pull pulse is
    // perceptually stronger than continuous translation.
    const freshLoad = THREE.MathUtils.clamp(1 - Math.max(0, leadingAnchorPhaseAge - 0.10) / 0.52, 0, 1);
    const loadPulse01 = forwardAnchorAvailable ? (0.42 + freshLoad * 0.58) : 0.10;
    // HC031F1B: authored surface ecology now modestly changes locomotion traction.
    // This is not verb coupling yet: adhesion and load tolerance only affect how
    // reliably the same tendril gait can carry body load across that substrate.
    const surfaceAdhesionScale = this.surfaceTruthActive
      ? THREE.MathUtils.lerp(0.68, 1.08, this.surfaceTruthAdhesion)
      : 1.0;
    const surfaceLoadScale = this.surfaceTruthActive
      ? THREE.MathUtils.lerp(0.76, 1.04, this.surfaceTruthLoadTolerance)
      : 1.0;
    const surfaceTractionScale = surfaceAdhesionScale * surfaceLoadScale;
    const supportPlaneScale = this.tendrilSupportPlaneActive
      ? THREE.MathUtils.lerp(0.88, 1.05, this.tendrilSupportQuality01)
      : 1.0;
    const pullAcceleration = acceleration
      * (0.66 + traction01 * 0.50)
      * handoffScale
      * supportScale
      * anchorAlignmentScale
      * loadPulse01
      * surfaceTractionScale
      * supportPlaneScale;

    this.tendrilDriveDirection.copy(this.tendrilIntentTangent);
    if (forwardAnchorAvailable) {
      // The visible planted anchor now owns most of the direction. Input remains
      // intention, not a hidden parallel thruster.
      this.tendrilDriveDirection.lerp(this.tendrilAnchorDirection, 0.82).normalize();
      this.velocity.addScaledVector(this.tendrilDriveDirection, pullAcceleration * dt);
    } else {
      // No forward support means a real hesitation while the third tendril seeks
      // the next plant. This is the missing causal read from the F1 playtest.
      this.velocity.multiplyScalar(Math.max(0, 1 - Math.min(0.42, dt * 4.8)));
      this.velocity.addScaledVector(this.tendrilDriveDirection, pullAcceleration * dt);
    }

    return {
      active: true,
      supportCount,
      traction01,
      leadingAnchorIndex,
      leadingAnchorDistance: Number(leadingAnchorDistance.toFixed(3)),
      leadingAnchorAlignment: Number(leadingAnchorAlignment.toFixed(3)),
      leadingAnchorPhaseAge: Number(leadingAnchorPhaseAge.toFixed(3)),
      directInputScale,
      pullAcceleration: Number(pullAcceleration.toFixed(3)),
      loadPulse01: Number(loadPulse01.toFixed(3)),
      leadingAnchorWorld: leadingAnchorIndex >= 0 ? {
        x: Number(this.tendrilLeadingAnchorWorld.x.toFixed(4)),
        y: Number(this.tendrilLeadingAnchorWorld.y.toFixed(4)),
        z: Number(this.tendrilLeadingAnchorWorld.z.toFixed(4))
      } : null,
      surfaceTruthActive: this.surfaceTruthActive,
      surfaceId: this.surfaceTruthSurfaceId,
      surfaceProfileId: this.surfaceTruthProfileId,
      surfaceAdhesion: Number(this.surfaceTruthAdhesion.toFixed(3)),
      surfaceLoadTolerance: Number(this.surfaceTruthLoadTolerance.toFixed(3)),
      surfaceTractionScale: Number(surfaceTractionScale.toFixed(3)),
      supportPlaneActive: this.tendrilSupportPlaneActive,
      supportPlaneQuality01: Number(this.tendrilSupportQuality01.toFixed(3)),
      supportPlaneScale: Number(supportPlaneScale.toFixed(3)),
      supportSurfaceId: this.tendrilSupportSurfaceId,
      mode: request.mode ?? "supported_pull"
    };
  }

  resolveConvergenceReachability(frameState) {
    const convergence = frameState.hubInvestigationGameplay?.threeRouteConvergence ?? {};
    const active = Boolean(
      frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
      && convergence.available
      && !convergence.completed
    );
    if (!active) return { active: false, envelope01: 0, environmentScale: 1 };

    const entryRadius = Math.max(1.1, convergence.entryRadius ?? 3.25);
    const finalRadius = Math.max(0.4, convergence.finalPulseRadius ?? 1.05);
    const distance = Number.isFinite(convergence.centerDistance) ? convergence.centerDistance : entryRadius;
    const envelope01 = THREE.MathUtils.clamp(
      (entryRadius - distance) / Math.max(0.1, entryRadius - finalRadius),
      0,
      1
    );

    // HC028B1: preserve living current motion outside the weave, but as the Core
    // commits inward the authored environment yields authority to deliberate input.
    // This does not pull/teleport the player and does not make Stabilize mandatory.
    const environmentScale = 1 - envelope01 * 0.82;
    return { active: true, envelope01, environmentScale };
  }

  syncPhysicalFeel(frameState) {
    const physicalFeel = frameState.physicalFeel ?? {};
    const flowVector = physicalFeel.flowVector ?? { x: this.flow.x, y: this.flow.y, z: this.flow.z };

    this.viscosity = Number.isFinite(physicalFeel.viscosity)
      ? physicalFeel.viscosity
      : this.viscosity;

    this.pressure = Number.isFinite(physicalFeel.pressure)
      ? physicalFeel.pressure
      : this.pressure;

    this.flow.set(
      flowVector.x ?? flowVector[0] ?? this.flow.x,
      flowVector.y ?? flowVector[1] ?? this.flow.y,
      flowVector.z ?? flowVector[2] ?? this.flow.z
    );
  }

  syncMovementBoundary(frameState) {
    const authored = frameState.physicalFeel?.movementBounds;
    const radii = authored?.radii;
    const center = authored?.center;
    const radiusX = radii?.x ?? radii?.[0];
    const radiusY = radii?.y ?? radii?.[1];
    const radiusZ = radii?.z ?? radii?.[2];
    const centerX = center?.x ?? center?.[0];
    const centerY = center?.y ?? center?.[1];
    const centerZ = center?.z ?? center?.[2];
    const validAuthoredBoundary = authored?.active !== false
      && [radiusX, radiusY, radiusZ].every((value) => Number.isFinite(value) && value > 0.25)
      && [centerX, centerY, centerZ].every((value) => Number.isFinite(value));

    if (validAuthoredBoundary) {
      this.boundary.x = radiusX;
      this.boundary.y = radiusY;
      this.boundary.z = radiusZ;
      this.boundaryCenter.set(centerX, centerY, centerZ);
      this.boundaryOwner = authored.owner ?? "PlayerMovementController";
      this.boundaryTuningOwner = authored.tuningOwner ?? "active_region";
      this.boundaryRegionId = authored.regionId
        ?? frameState.currentMode?.regionId
        ?? "active_region";
      this.boundaryMode = authored.mode ?? "entry_anchored_ellipsoid";
      return;
    }

    this.boundary.x = this.defaultBoundary.x;
    this.boundary.y = this.defaultBoundary.y;
    this.boundary.z = this.defaultBoundary.z;
    this.boundaryCenter.set(0, 0, 0);
    this.boundaryOwner = "PlayerMovementController";
    this.boundaryTuningOwner = "default_first_slice_membrane";
    this.boundaryRegionId = "shared_first_slice";
    this.boundaryMode = "world_origin_ellipsoid";
  }

  resolveContactSurfaceCoverage() {
    if (this.surfaceTruthActive) {
      return {
        pass: "HC-031F1B",
        classId: "authored_ecological_surface_truth",
        shortLabel: "authored ecological surface",
        locality: "authored_local",
        boundaryMode: this.boundaryMode,
        owner: "CoreSurfaceTruthSystem",
        tuningOwner: this.surfaceTruthProfileId,
        surfaceId: this.surfaceTruthSurfaceId,
        materialFamily: this.surfaceTruthMaterialFamily,
        adhesion: this.surfaceTruthAdhesion,
        loadTolerance: this.surfaceTruthLoadTolerance,
        compliance: this.surfaceTruthCompliance,
        regionId: this.boundaryRegionId,
        contactable: true,
        mechanicalAttachmentEligible: true,
        source: "authored_crawlable_surface_raycast",
        interiorDecorativeGeometryContactable: false,
        addsCollider: false,
        addsRaycast: true,
        geometryExpansionThisPass: true,
        authoredBoundaryFallback: true,
        genericVisibleMeshEligible: false
      };
    }

    let classId = "authored_movement_envelope";
    let shortLabel = "authored envelope";
    let locality = "authored";

    if (this.boundaryMode === "world_origin_ellipsoid") {
      classId = "shared_first_slice_envelope";
      shortLabel = "shared first-slice";
      locality = "shared";
    } else if (this.boundaryMode === "entry_anchored_ellipsoid") {
      classId = "region_local_envelope";
      shortLabel = "route-local";
      locality = "region_local";
    } else if (String(this.boundaryMode).includes("field")) {
      classId = "field_volume_envelope";
      shortLabel = "field-volume";
      locality = "field_local";
    }

    return {
      pass: "HC-025C",
      classId,
      shortLabel,
      locality,
      boundaryMode: this.boundaryMode,
      owner: this.boundaryOwner,
      tuningOwner: this.boundaryTuningOwner,
      regionId: this.boundaryRegionId,
      contactable: true,
      mechanicalAttachmentEligible: true,
      source: "existing_authored_movement_boundary",
      interiorDecorativeGeometryContactable: false,
      addsCollider: false,
      addsRaycast: false,
      geometryExpansionThisPass: false
    };
  }

  computeInteractionAssist(input, frameState, dt) {
    const assist = frameState.interactionAssist ?? {};

    if (!assist.active || !assist.position) {
      return 0;
    }

    if (!input.absorbHeld) {
      return 0;
    }

    this.assistVector.set(
      assist.position.x - this.playerRoot.position.x,
      assist.position.y - this.playerRoot.position.y,
      assist.position.z - this.playerRoot.position.z
    );

    const distance = this.assistVector.length();
    if (distance <= 0.001) {
      return 0;
    }

    this.assistVector.normalize();
    const absorbTuning = frameState.controllerOnboarding?.tuning?.absorbAssist ?? {};
    const rangeWeight = Math.max(0, 1 - distance / Math.max(assist.assistRange ?? 2.4, 0.01));
    const assistStrength = ((absorbTuning.pullStrengthBase ?? 1.4) + rangeWeight * (absorbTuning.pullStrengthRangeBonus ?? 3.8)) * dt;
    this.velocity.addScaledVector(this.assistVector, assistStrength);
    return assistStrength;
  }

  applyMembraneBoundary(dt) {
    const p = this.playerRoot.position;
    this.sampleMembraneBoundaryTelemetry();

    // HC025B: while chemically attached, settle against the inside of the same
    // trusted ellipsoid and keep velocity tangent to it. No new surface source,
    // collider, or raycast is introduced.
    if (this.attachmentActive && this.surfaceTruthActive) {
      // HC031H: once planted supports exist, their support plane owns ride-height
      // refinement. SurfaceTruth still decides what is crawlable; movement remains
      // the only system allowed to translate playerRoot.
      this.tempSurfaceDelta ??= new THREE.Vector3();
      const useSupportPlane = this.tendrilSupportPlaneActive && this.tendrilSupportCount >= 2;
      const contactPoint = useSupportPlane ? this.tendrilSupportCentroid : this.attachmentSurfacePoint;
      const contactNormal = useSupportPlane ? this.tendrilSupportNormal : this.attachmentSurfaceNormal;
      const targetStandOff = useSupportPlane ? this.tendrilSupportTargetRideHeight : this.attachmentVisibleStandOffDistance;
      this.tempSurfaceDelta.copy(p).sub(contactPoint);
      const signedDistance = this.tempSurfaceDelta.dot(contactNormal);
      const error = targetStandOff - signedDistance;
      const correction = THREE.MathUtils.clamp(error, -0.20, 0.20);
      const supportSettleScale = useSupportPlane ? THREE.MathUtils.lerp(0.78, 1.12, this.tendrilSupportQuality01) : 1;
      const settle = 1 - Math.exp(-Math.max(0, dt) * 16.0 * supportSettleScale);
      p.addScaledVector(contactNormal, correction * settle);

      const normalVelocity = this.velocity.dot(contactNormal);
      this.velocity.addScaledVector(contactNormal, -normalVelocity);
      this.boundaryRadialSpeed = 0;
      this.boundaryTangentialSpeed = this.velocity.length();
      this.attachmentSurfaceTangentSpeed = this.boundaryTangentialSpeed;
      return 0;
    }

    if (this.attachmentActive) {
      const dx = p.x - this.boundaryCenter.x;
      const dy = p.y - this.boundaryCenter.y;
      const dz = p.z - this.boundaryCenter.z;
      const current = Math.max(0.0001, this.boundaryNormalizedDistance);
      const radialDistance = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy + dz * dz));
      const localSurfaceRadius = radialDistance / current;
      this.attachmentTargetNormalizedDistance = THREE.MathUtils.clamp(
        1 - this.attachmentStandOffDistance / Math.max(0.35, localSurfaceRadius),
        0.90,
        0.972
      );
      this.attachmentShellNormalizedDistance += (
        this.attachmentTargetNormalizedDistance - this.attachmentShellNormalizedDistance
      ) * (1 - Math.exp(-Math.max(0, dt) * 4.6));

      const scale = this.attachmentShellNormalizedDistance / current;
      p.x = this.boundaryCenter.x + dx * scale;
      p.y = this.boundaryCenter.y + dy * scale;
      p.z = this.boundaryCenter.z + dz * scale;

      this.sampleMembraneBoundaryTelemetry();
      const radialVelocity = this.velocity.dot(this.boundarySurfaceNormal);
      this.velocity.addScaledVector(this.boundarySurfaceNormal, -radialVelocity);
      this.boundaryRadialSpeed = 0;
      this.boundaryTangentialSpeed = this.velocity.length();
      this.attachmentSurfaceTangentSpeed = this.boundaryTangentialSpeed;
      return 0;
    }

    const normalizedDistance = this.boundaryNormalizedDistance;
    if (normalizedDistance <= 1.0) {
      return 0;
    }

    const dx = p.x - this.boundaryCenter.x;
    const dy = p.y - this.boundaryCenter.y;
    const dz = p.z - this.boundaryCenter.z;
    const excess = normalizedDistance - 1.0;

    this.boundaryNormal.copy(this.boundarySurfaceNormal);

    const recoilStrength = 24.0 + this.viscosity * 16.0;
    this.velocity.addScaledVector(this.boundaryNormal, -recoilStrength * excess * dt);

    p.x = this.boundaryCenter.x + dx / normalizedDistance;
    p.y = this.boundaryCenter.y + dy / normalizedDistance;
    p.z = this.boundaryCenter.z + dz / normalizedDistance;
    this.sampleMembraneBoundaryTelemetry();

    return Math.min(excess * 4.0, 1.0);
  }
}
