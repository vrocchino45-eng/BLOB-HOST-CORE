import * as THREE from "three";

const RECIPE_ID = "GUIDE_THRESHOLD_GAMEPLAY_FILL_HC007B";
const CELL_ID = "CELL_SCAR_FLOW_FOLD_001";
const SURFACE_LIVING_STATES = new Set(["cautious", "blooming", "withered", "panic", "embrace", "growth"]);
const W2B11_SUPPORT_STRAND_OPACITY_MULTIPLIER = 0.68;
const W2B11_SUPPORT_MOTE_OPACITY_MULTIPLIER = 0.8;

/**
 * HC-007B fills the Scar Flow / Guide Threshold lead-up with systemic play.
 * HC-009B preserves that ownership while making its current truly volumetric
 * and replacing object-defining rings with authored pressure bodies.
 * It never completes the authored Guide Threshold trigger. It only makes the
 * living current readable and playable, then exposes the existing layered
 * convergence trigger once the player has actually moved through the space.
 */
export class GuideThresholdGameplaySystem {
  constructor({ recipeDataSystem, chemObjectSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[GuideThresholdGameplaySystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[GuideThresholdGameplaySystem] chemObjectSystem is required.");
    if (!scene) throw new Error("[GuideThresholdGameplaySystem] scene is required.");
    if (!playerRoot) throw new Error("[GuideThresholdGameplaySystem] playerRoot is required.");
    if (!frameState) throw new Error("[GuideThresholdGameplaySystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.path = null;
    this.pathPoints = [];
    this.pathSampleCount = 72;
    this.root = null;
    this.strands = [];
    this.motes = [];
    this.eddies = [];
    this.convergenceMarker = null;

    this.elapsed = 0;
    this.pathProgress = 0;
    this.maxPathProgress = 0;
    this.corridorDistance = Infinity;
    this.inMainCurrent = false;
    this.inSoftCurrent = false;
    this.localTangent = new THREE.Vector3(0, 0, -1);
    this.projectedPoint = new THREE.Vector3();
    this.flowVector = new THREE.Vector3();
    this.eddyVector = new THREE.Vector3();
    this.lastPulseEventId = 0;
    this.flowRevealSeconds = 0;
    this.pulseReads = 0;
    this.stabilizeSeconds = 0;
    this.turbulence = 0;
    this.effectiveTurbulence = 0;
    this.rewardIds = new Set();
    this.worldReads = new Set();
    this.familiarity = 0;
    this.triggerReady = false;
    this.triggerReadyAt = -1;
    this.lastAction = "enter_scar_current";
    this.coreGrowthPressureTested = false;
    this.growthPressureMultiplier = 1;
    this.growthStabilizeEfficiency = 1;
    this.growthRecognitionBlend = 0;

    // HC020B readable verb grammar / anti-mash state.
    this.materialReadState = "unread_current";
    this.materialResponseAge = 99;
    this.lastWrongVerb = "none";
    this.wrongVerbResponseAge = 99;
    this.stabilizeCommitSeconds = 0;
    this.localCoherence = 0;
    this.readBeforeCommit = false;

    this.basePressureColor = new THREE.Color(0x9df6ff);
    this.carePressureColor = new THREE.Color(0x8ff0c5);
    this.scarPressureColor = new THREE.Color(0xe89268);
    this.growthPressureColor = new THREE.Color(0x9df6ff);

    // HC023C: Guide does not derive another state machine. It reads the
    // persistent Surface nursery state and lets the already-authored current
    // interpret that history through motion, color, density, and coherence.
    this.inheritedLivingState = "cautious";
    this.inheritedLivingStateSequence = 0;
    this.inheritedLivingStateAge = 0;
    this.stateBloomColor = new THREE.Color(0xa9efb8);
    this.stateWitherColor = new THREE.Color(0x7f8790);
    this.statePanicColor = new THREE.Color(0xf1a070);
    this.stateEmbraceColor = new THREE.Color(0xaee8cc);
    this.stateGrowthColor = new THREE.Color(0x8ee6aa);
  }

  init() {
    this.recipe = this.recipeDataSystem.get("guideThresholdGameplayRecipes", RECIPE_ID);
    this.basePressureColor.set(this.recipe.visual?.pressureColor ?? 0x9df6ff);
    this.growthPressureColor.copy(this.basePressureColor);
    this.pathPoints = (this.recipe.path?.points ?? []).map((point) => this.vector(point));
    if (this.pathPoints.length < 2) throw new Error("[GuideThresholdGameplaySystem] path requires at least two points.");
    this.path = new THREE.CatmullRomCurve3(this.pathPoints, false, "catmullrom", 0.32);
    this.createVisuals();
    this.frameState.guideThresholdGameplay = this.createState(false);
  }

  update(dt, frameState) {
    const active = this.isActive(frameState);
    if (!active) {
      this.setVisible(false);
      frameState.guideThresholdGameplay = this.createState(false);
      return;
    }

    this.setVisible(true);
    this.updateInheritedLivingState(frameState);
    this.elapsed += Math.max(0, dt);
    this.flowRevealSeconds = Math.max(0, this.flowRevealSeconds - dt);
    this.materialResponseAge += dt;
    this.wrongVerbResponseAge += dt;

    const projection = this.projectToPath(this.playerRoot.position);
    this.pathProgress = projection.u;
    this.maxPathProgress = Math.max(this.maxPathProgress, this.pathProgress);
    this.corridorDistance = projection.distance;
    this.projectedPoint.copy(projection.point);
    this.localTangent.copy(projection.tangent);
    if (this.localTangent.lengthSq() <= 0.0001) this.localTangent.set(0, 0, -1);
    this.localTangent.normalize();

    const pathConfig = this.recipe.path ?? {};
    const currentRange = pathConfig.currentRange ?? 0.82;
    const softRange = pathConfig.softRange ?? 1.34;
    this.inMainCurrent = this.corridorDistance <= currentRange;
    this.inSoftCurrent = this.corridorDistance <= softRange;

    this.handlePulse(frameState);
    this.readNearbyWorld(frameState);
    this.updateRewardReads();
    this.updatePhysicalFeel(dt, frameState);
    this.updateReadiness(frameState);
    this.animate(dt, frameState.runtimeSeconds ?? 0, frameState);

    frameState.guideThresholdGameplay = this.createState(true);
  }

  updateInheritedLivingState(frameState) {
    const nursery = frameState.nurseryCircuit ?? {};
    const candidate = nursery.livingState ?? "cautious";
    this.inheritedLivingState = SURFACE_LIVING_STATES.has(candidate) ? candidate : "cautious";
    this.inheritedLivingStateSequence = nursery.livingStateSequence ?? 0;
    this.inheritedLivingStateAge = nursery.livingStateAge ?? 0;

    if (this.root) {
      this.root.userData.inheritedLivingState = this.inheritedLivingState;
      this.root.userData.inheritedLivingStateSequence = this.inheritedLivingStateSequence;
      this.root.userData.livingStateContinuityPass = "HC-023C";
      this.root.userData.livingStateOwner = "SurfaceWakeGameplaySystem";
    }
  }

  livingStateStyle() {
    switch (this.inheritedLivingState) {
      case "blooming":
        return { tint: this.stateBloomColor, motion: 1.28, opacity: 1.2, scale: 1.07, jitter: 0.025 };
      case "withered":
        return { tint: this.stateWitherColor, motion: 0.46, opacity: 0.52, scale: 0.84, jitter: 0.006 };
      case "panic":
        return { tint: this.statePanicColor, motion: 1.78, opacity: 1.18, scale: 0.93, jitter: 0.09 };
      case "embrace":
        return { tint: this.stateEmbraceColor, motion: 0.74, opacity: 0.92, scale: 1.1, jitter: 0.008 };
      case "growth":
        return { tint: this.stateGrowthColor, motion: 1.12, opacity: 1.12, scale: 1.15, jitter: 0.014 };
      default:
        return { tint: this.basePressureColor, motion: 1, opacity: 1, scale: 1, jitter: 0.014 };
    }
  }

  livingStatePresentationWeight() {
    if (this.inheritedLivingState === "cautious") return 0;
    const mediation = Math.min(
      1,
      this.localCoherence * 0.58 + this.familiarity * 0.28 + (this.triggerReady ? 0.14 : 0)
    );
    const needsRecovery = this.inheritedLivingState === "panic" || this.inheritedLivingState === "withered";
    return needsRecovery ? Math.max(0.46, 1 - mediation * 0.48) : 0.82 + mediation * 0.18;
  }

  isActive(frameState) {
    if (frameState.activeCellId !== CELL_ID) return false;
    const revisitGuideActive = Boolean(frameState.firstSliceReturnTraversal?.revisitGuideActive);
    if (!frameState.localCellMorph?.completed && !revisitGuideActive) return false;
    if ((frameState.secondLocalCellMorph?.started || frameState.secondLocalCellMorph?.completed) && !revisitGuideActive) return false;
    return true;
  }

  handlePulse(frameState) {
    const input = frameState.input ?? {};
    const pulseEventId = input.pulseEventId ?? 0;
    const freshPulse = Boolean(input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId);
    if (!freshPulse) return;

    this.lastPulseEventId = pulseEventId;
    const revealRange = this.recipe.path?.pulseRevealRange ?? 2.2;
    if (this.corridorDistance <= revealRange) {
      this.flowRevealSeconds = Math.max(this.flowRevealSeconds, 2.6);
      this.pulseReads += 1;
      this.worldReads.add("living_current_direction");
      this.materialReadState = this.turbulence >= 0.42
        ? "read_turbulent_current"
        : "read_coherent_current";
      this.materialResponseAge = 0;
      this.readBeforeCommit = true;
      this.lastAction = this.materialReadState === "read_turbulent_current"
        ? "pulse_read_turbulence_stabilize_hypothesis"
        : "pulse_read_current_already_coherent";
    } else {
      this.materialReadState = "read_off_current_tissue";
      this.materialResponseAge = 0;
      this.lastAction = "pulse_read_off_current_tissue_no_coupling";
    }
  }

  readNearbyWorld(frameState) {
    const reads = this.recipe.worldReads ?? {};
    const readRange = 1.5;
    for (const id of [reads.memoryFleckId, reads.pressureCurrentId, reads.clotId]) {
      if (!id) continue;
      const item = this.findObject(id);
      if (!item || item.absorbed || !item.root.visible) continue;
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (distance > readRange) continue;

      if (id === reads.memoryFleckId) {
        this.worldReads.add("memory_side_pocket_found");
        this.lastAction = "memory_side_pocket_discovered";
      } else if (id === reads.pressureCurrentId) {
        this.worldReads.add("pressure_current_crossed");
      } else if (id === reads.clotId) {
        this.worldReads.add("clot_hazard_observed");
      }
    }
  }

  updateRewardReads() {
    for (const id of this.recipe.optionalRewards ?? []) {
      const item = this.findObject(id);
      if (item?.absorbed || item?.root?.userData?.absorbed) this.rewardIds.add(id);
    }
  }

  updatePhysicalFeel(dt, frameState) {
    const pathConfig = this.recipe.path ?? {};
    const t = frameState.runtimeSeconds ?? 0;
    const stabilizing = Boolean(frameState.input?.stabilizeHeld);
    const growth = frameState.coreGrowth ?? {};
    const growthMovement = growth.movementModifiers ?? {};
    this.growthPressureMultiplier = growthMovement.pressureResponseMultiplier ?? 1;
    this.growthStabilizeEfficiency = growthMovement.stabilizeEfficiencyMultiplier ?? 1;

    const currentWeight = this.inMainCurrent
      ? 1
      : this.inSoftCurrent
        ? Math.max(0, 1 - (this.corridorDistance - (pathConfig.currentRange ?? 0.82)) / Math.max(0.01, (pathConfig.softRange ?? 1.34) - (pathConfig.currentRange ?? 0.82)))
        : 0;

    const offCurrent = 1 - currentWeight;
    this.turbulence = Math.min(1, 0.12 + offCurrent * (pathConfig.offCurrentTurbulence ?? 0.72) + Math.max(0, Math.sin(t * 1.8)) * 0.16);
    const stabilizeMultiplier = stabilizing
      ? (pathConfig.stabilizedTurbulenceMultiplier ?? 0.28) / Math.max(1, this.growthStabilizeEfficiency)
      : 1;
    this.effectiveTurbulence = this.turbulence
      * stabilizeMultiplier
      * this.growthPressureMultiplier;

    if (
      !this.coreGrowthPressureTested
      && (growth.growthProgress ?? 0) >= 0.18
      && this.maxPathProgress >= 0.12
    ) {
      this.coreGrowthPressureTested = true;
      this.lastAction = "guide_pressure_read_retained_core_form";
    }

    if (stabilizing && this.turbulence >= 0.42) {
      this.stabilizeSeconds += dt;
      this.stabilizeCommitSeconds += dt;
      this.localCoherence = Math.min(1, this.localCoherence + dt * 0.9 * this.growthStabilizeEfficiency);
      this.materialReadState = this.localCoherence >= 0.72
        ? "stabilized_coherent_current"
        : "stabilizing_turbulence";
      this.materialResponseAge = 0;
      this.lastAction = this.inMainCurrent
        ? "stabilize_is_organizing_living_current"
        : "stabilize_is_organizing_turbulent_detour";
    } else {
      this.stabilizeCommitSeconds = Math.max(0, this.stabilizeCommitSeconds - dt * 1.4);
      this.localCoherence = Math.max(0, this.localCoherence - dt * 0.12);
    }

    // Absorb is intentionally not a solution for raw Guide current. Give a
    // fast physical rejection response instead of silence so cycling buttons
    // is less rational than reading the material.
    if (frameState.input?.absorbHeld && this.inSoftCurrent) {
      this.lastWrongVerb = "absorb";
      this.wrongVerbResponseAge = 0;
      this.materialReadState = "absorb_rejected_by_living_current";
      this.lastAction = "absorb_rejected_current_is_flow_not_free_matter";
    }

    const tangentStrength = (pathConfig.mainCurrentStrength ?? 0.74) * (0.28 + currentWeight * 0.72);
    this.eddyVector.set(
      Math.sin(t * 1.35 + this.playerRoot.position.z * 0.8),
      Math.sin(t * 0.94 + this.playerRoot.position.x * 0.45) * 0.72,
      Math.cos(t * 1.1 + this.playerRoot.position.x * 0.7)
    );
    if (this.eddyVector.lengthSq() > 0.0001) this.eddyVector.normalize();

    this.flowVector.copy(this.localTangent).multiplyScalar(tangentStrength);
    this.flowVector.addScaledVector(this.eddyVector, this.effectiveTurbulence * 0.42);

    const prior = frameState.physicalFeel ?? {};
    frameState.physicalFeel = {
      ...prior,
      viscosity: Math.max(0.34, Math.min(0.72, 0.46 + this.effectiveTurbulence * 0.14)),
      pressure: Math.max(0.34, Math.min(0.88, 0.48 + this.effectiveTurbulence * 0.34)),
      flowVector: {
        x: this.flowVector.x,
        y: this.flowVector.y,
        z: this.flowVector.z
      },
      boundaryBehavior: "guide_threshold_living_current_with_optional_turbulence"
    };
  }

  updateReadiness(frameState) {
    const policy = this.recipe.triggerPolicy ?? {};
    const readiness = this.recipe.readiness ?? {};
    const pathScore = this.maxPathProgress * (readiness.pathWeight ?? 0.62);
    const pulseScore = Math.min(1, this.pulseReads) * (readiness.pulseWeight ?? 0.15);
    const stabilizeScore = Math.min(
      1,
      this.stabilizeSeconds / Math.max(0.1, readiness.stabilizeSecondsForFullCredit ?? 1.3)
    ) * (readiness.stabilizeWeight ?? 0.12);
    const rewardScore = Math.min(1, this.rewardIds.size / Math.max(1, (this.recipe.optionalRewards ?? []).length)) * (readiness.rewardWeight ?? 0.11);

    this.familiarity = Math.min(1, pathScore + pulseScore + stabilizeScore + rewardScore);

    if (!this.triggerReady) {
      const enoughPath = this.maxPathProgress >= (policy.convergencePathProgress ?? 0.58);
      const enoughFamiliarity = this.familiarity >= (policy.minimumFamiliarity ?? 0.54);
      const enoughTime = this.elapsed >= (readiness.minimumSecondsBeforeReady ?? 2.4);
      if (enoughPath && enoughFamiliarity && enoughTime) {
        this.triggerReady = true;
        this.triggerReadyAt = frameState.runtimeSeconds ?? 0;
        this.lastAction = "living_current_converged_existing_threshold_trigger_readable";
      }
    }
  }

  createVisuals() {
    const visual = this.recipe.visual ?? {};
    this.root = new THREE.Group();
    this.root.name = "guide_threshold_gameplay_fill_HC007B";
    this.root.userData.system = "GuideThresholdGameplaySystem";
    this.root.userData.targetingSuppressed = true;
    this.scene.add(this.root);

    const strandCount = Math.max(3, visual.strandCount ?? 4);
    for (let index = 0; index < strandCount; index += 1) {
      const offset = (index - (strandCount - 1) / 2) * 0.075;
      const points = this.pathPoints.map((point, pointIndex) => point.clone().add(new THREE.Vector3(
        Math.sin(index * 1.4 + pointIndex * 0.8) * 0.05,
        offset + Math.cos(index + pointIndex) * 0.035,
        Math.cos(index * 0.9 + pointIndex * 0.7) * 0.045
      )));
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.32);
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? (visual.signalColor ?? 0xaaefff) : (visual.memoryColor ?? 0xffdca8),
        transparent: true,
        opacity: (visual.baseOpacity ?? 0.08) * W2B11_SUPPORT_STRAND_OPACITY_MULTIPLIER,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.01 + index * 0.0015, 6, false), material);
      strand.name = `guide_gameplay_current_strand_${index + 1}`;
      strand.userData.inspectionFadeable = true;
      strand.userData.livingTissue = true;
      strand.userData.hc023cBaseColor = strand.material.color.clone();
      strand.userData.visualHierarchyRole = "supporting_current_path";
      this.root.add(strand);
      this.strands.push(strand);
    }

    const moteCount = Math.max(8, visual.moteCount ?? 20);
    for (let index = 0; index < moteCount; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: index % 4 === 0 ? (visual.memoryColor ?? 0xffdca8) : (visual.signalColor ?? 0xaaefff),
        transparent: true,
        opacity: 0.12 * W2B11_SUPPORT_MOTE_OPACITY_MULTIPLIER,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.015 + (index % 3) * 0.004, 7, 6), material);
      mote.userData.pathOffset = index / moteCount;
      mote.userData.inspectionFadeable = true;
      mote.userData.hc023cBaseColor = mote.material.color.clone();
      mote.userData.visualHierarchyRole = "supporting_current_motion";
      this.root.add(mote);
      this.motes.push(mote);
    }

    const eddyCount = Math.max(3, visual.eddyCount ?? 5);
    for (let index = 0; index < eddyCount; index += 1) {
      const u = 0.18 + index * (0.62 / Math.max(1, eddyCount - 1));
      const material = new THREE.MeshBasicMaterial({
        color: visual.pressureColor ?? 0x9df6ff,
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const pressureBody = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22 + index * 0.022, 1),
        material
      );
      pressureBody.name = `guide_gameplay_pressure_body_${String(index + 1).padStart(2, "0")}`;
      pressureBody.position.copy(this.path.getPoint(u));
      const tangent = this.path.getTangent(u).normalize();
      pressureBody.lookAt(pressureBody.position.clone().add(tangent));
      pressureBody.scale.set(0.58 + (index % 2) * 0.12, 1.18 + index * 0.05, 0.72);
      pressureBody.userData.pathU = u;
      pressureBody.userData.baseScale = pressureBody.scale.clone();
      pressureBody.userData.hc023cBaseColor = pressureBody.material.color.clone();
      pressureBody.userData.inspectionFadeable = true;
      pressureBody.userData.objectDefiningRing = false;
      pressureBody.userData.visualHierarchyRole = "local_actionable_pressure_body";
      this.root.add(pressureBody);
      this.eddies.push(pressureBody);
    }

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: visual.memoryColor ?? 0xffdca8,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.convergenceMarker = new THREE.Mesh(new THREE.IcosahedronGeometry(0.29, 2), markerMaterial);
    this.convergenceMarker.name = "guide_threshold_gameplay_convergence_marker";
    this.convergenceMarker.position.copy(this.path.getPoint(this.recipe.triggerPolicy?.convergencePathProgress ?? 0.58));
    this.convergenceMarker.scale.set(0.72, 1.34, 0.86);
    this.convergenceMarker.userData.targetingSuppressed = true;
    this.convergenceMarker.userData.objectDefiningRing = false;
    this.convergenceMarker.userData.visualHierarchyRole = "local_actionable_focus";
    this.root.add(this.convergenceMarker);
  }

  animate(dt, t, frameState) {
    const visual = this.recipe.visual ?? {};
    const reveal = this.flowRevealSeconds > 0 ? 1 : 0;
    const familiarityGlow = Math.min(1, this.familiarity * 0.8 + (this.triggerReady ? 0.4 : 0));
    const growth = frameState.coreGrowth ?? {};
    const growthProgress = growth.growthProgress ?? 0;
    const growthBias = growth.chemistryBias ?? 0;
    const recognitionTarget = growthProgress >= 0.18 ? Math.min(1, growthProgress) : 0;
    const livingStyle = this.livingStateStyle();
    const livingWeight = this.livingStatePresentationWeight();
    this.growthRecognitionBlend = THREE.MathUtils.damp(
      this.growthRecognitionBlend,
      recognitionTarget,
      3.2,
      Math.max(0, dt)
    );
    const biasColor = growthBias >= 0
      ? this.carePressureColor
      : this.scarPressureColor;
    this.growthPressureColor.copy(this.basePressureColor).lerp(
      biasColor,
      this.growthRecognitionBlend * (0.34 + Math.abs(growthBias) * 0.42)
    );

    this.strands.forEach((strand, index) => {
      const baseColor = strand.userData.hc023cBaseColor ?? strand.material.color;
      strand.material.color.copy(baseColor).lerp(livingStyle.tint, livingWeight * 0.34);
      strand.material.opacity = ((visual.baseOpacity ?? 0.08) + reveal * (visual.revealedOpacity ?? 0.34) * 0.65 + familiarityGlow * 0.08)
        * (1 + (livingStyle.opacity - 1) * livingWeight);
      strand.material.opacity += Math.sin(t * 2.1 * livingStyle.motion - index * 0.8)
        * (0.025 + livingStyle.jitter * livingWeight * 0.24);
      strand.material.opacity *= W2B11_SUPPORT_STRAND_OPACITY_MULTIPLIER;
    });

    this.motes.forEach((mote, index) => {
      const baseColor = mote.userData.hc023cBaseColor ?? mote.material.color;
      mote.material.color.copy(baseColor).lerp(livingStyle.tint, livingWeight * 0.42);
      const speed = (0.045 + (this.inMainCurrent ? 0.08 : 0.03) + reveal * 0.07)
        * (1 + (livingStyle.motion - 1) * livingWeight);
      const u = (mote.userData.pathOffset + t * speed) % 1;
      mote.position.copy(this.path.getPoint(u));
      mote.position.y += Math.sin(t * 2.7 * livingStyle.motion + index)
        * (0.02 + livingStyle.jitter * livingWeight * 0.32);
      mote.position.x += Math.cos(t * 3.1 + index * 0.7) * livingStyle.jitter * livingWeight * 0.18;
      mote.material.opacity = (0.08 + reveal * 0.34 + (this.triggerReady ? 0.08 : 0))
        * (1 + (livingStyle.opacity - 1) * livingWeight)
        * W2B11_SUPPORT_MOTE_OPACITY_MULTIPLIER;
      const stateScale = 1 + (livingStyle.scale - 1) * livingWeight;
      mote.scale.setScalar((0.8 + reveal * 0.5) * stateScale);
    });

    this.eddies.forEach((eddy, index) => {
      const pressure = this.effectiveTurbulence;
      const stabilizeHeld = Boolean(frameState.input?.stabilizeHeld);
      const rejectedAbsorb = this.wrongVerbResponseAge < 0.55 && this.lastWrongVerb === "absorb";
      const readTurbulent = this.materialReadState === "read_turbulent_current";
      const coherent = this.materialReadState === "stabilized_coherent_current";

      const disorder = coherent
        ? Math.max(0.08, pressure * 0.22)
        : stabilizeHeld
          ? Math.max(0.12, pressure * (1 - this.localCoherence * 0.78))
          : pressure;

      eddy.rotation.z += (0.0015 + disorder * 0.005) * (index % 2 === 0 ? 1 : -1);
      eddy.rotation.x += 0.001 + disorder * 0.002;

      const asymmetry = readTurbulent ? 0.16 : coherent ? 0.015 : disorder * 0.08;
      const breathe = 0.96 + disorder * 0.16 + Math.sin(t * 2 + index) * (coherent ? 0.008 : 0.025);
      const rejection = rejectedAbsorb ? Math.max(0, 1 - this.wrongVerbResponseAge / 0.55) : 0;

      eddy.scale.copy(eddy.userData.baseScale);
      eddy.scale.x *= breathe * (1 + asymmetry + rejection * 0.10);
      eddy.scale.y *= breathe * (1 - asymmetry * 0.45 - rejection * 0.16);
      eddy.scale.z *= breathe * (1 + coherent * 0.04);

      eddy.material.opacity = 0.018
        + disorder * 0.12
        + reveal * 0.035
        + (readTurbulent ? 0.07 : 0)
        + (coherent ? 0.045 : 0)
        + rejection * 0.08;

      if (rejectedAbsorb) {
        eddy.material.color.copy(this.scarPressureColor);
      } else if (coherent || stabilizeHeld) {
        eddy.material.color.copy(this.carePressureColor);
      } else {
        eddy.material.color.copy(this.growthPressureColor);
      }
      eddy.material.color.lerp(livingStyle.tint, livingWeight * (rejectedAbsorb ? 0.18 : 0.38));
      const stateScale = 1 + (livingStyle.scale - 1) * livingWeight;
      eddy.scale.x *= stateScale;
      eddy.scale.y *= stateScale * (this.inheritedLivingState === "panic" ? 0.94 : 1);
      eddy.scale.z *= stateScale;
      eddy.material.opacity *= 1 + (livingStyle.opacity - 1) * livingWeight;

      eddy.userData.verbReadState = this.materialReadState;
      eddy.userData.readableHypothesis = readTurbulent
        ? "stabilize"
        : coherent
          ? "move_with_current"
          : "pulse_to_read";
    });

    if (this.convergenceMarker) {
      const ready = this.triggerReady ? 1 : Math.max(0, (this.maxPathProgress - 0.35) / 0.25);
      this.convergenceMarker.material.opacity = 0.04 + ready * 0.28;
      const pulse = 0.94 + ready * 0.16 + Math.sin(t * 3.2) * 0.025;
      this.convergenceMarker.scale.set(0.72 * pulse, 1.34 * pulse, 0.86 * pulse);
      this.convergenceMarker.material.color
        .set(visual.memoryColor ?? 0xffdca8)
        .lerp(livingStyle.tint, livingWeight * 0.28);
      this.convergenceMarker.rotation.y += 0.003 * (1 + (livingStyle.motion - 1) * livingWeight * 0.5);
      this.convergenceMarker.rotation.z += 0.002 * (1 + (livingStyle.motion - 1) * livingWeight * 0.5);
    }
  }

  createState(active) {
    const rewardCount = this.rewardIds.size;
    return {
      pass: "HC-021A",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      status: active ? (this.triggerReady ? "living_current_converged" : "systemic_guide_threshold_play") : "inactive",
      systemicPlay: Boolean(active),
      triggerPreserved: true,
      directTriggerCompletion: false,
      triggerReady: Boolean(active && this.triggerReady),
      pathProgress: active ? this.pathProgress : 0,
      maxPathProgress: active ? this.maxPathProgress : 0,
      corridorDistance: active && Number.isFinite(this.corridorDistance) ? this.corridorDistance : 0,
      inMainCurrent: Boolean(active && this.inMainCurrent),
      inSoftCurrent: Boolean(active && this.inSoftCurrent),
      turbulence: active ? this.turbulence : 0,
      effectiveTurbulence: active ? this.effectiveTurbulence : 0,
      materialReadState: active ? this.materialReadState : "inactive",
      materialHypothesis: active
        ? this.materialReadState === "read_turbulent_current"
          ? "stabilize"
          : this.materialReadState === "stabilized_coherent_current"
            ? "move_with_current"
            : this.materialReadState === "absorb_rejected_by_living_current"
              ? "do_not_absorb_flow"
              : "pulse_to_read"
        : "none",
      wrongVerbResponse: active && this.wrongVerbResponseAge < 0.55
        ? {
            verb: this.lastWrongVerb,
            response: "material_recoil_no_coupling",
            age: this.wrongVerbResponseAge
          }
        : null,
      stabilizeCommitSeconds: active ? this.stabilizeCommitSeconds : 0,
      localCoherence: active ? this.localCoherence : 0,
      antiMashRule: "read response before commit; absorb rejection is visible; stabilize requires sustained coupling",
      sharedStabilizeFieldSuppression: active ? 0.58 : 0,
      inheritedPressureResponseMultiplier: active ? this.growthPressureMultiplier : 1,
      inheritedStabilizeEfficiencyMultiplier: active ? this.growthStabilizeEfficiency : 1,
      coreGrowthPressureTested: Boolean(active && this.coreGrowthPressureTested),
      coreGrowthStage: this.frameState.coreGrowth?.stageId ?? "seed_core",
      coreGrowthBias: this.frameState.coreGrowth?.biasLabel ?? "balanced_first_binding",
      growthRecognitionPass: "HC-009D",
      crossRoomConsequence: Boolean(active && (this.frameState.coreGrowth?.growthProgress ?? 0) >= 0.18),
      inheritedLivingState: this.inheritedLivingState,
      inheritedLivingStateSequence: this.inheritedLivingStateSequence,
      inheritedLivingStateAge: this.inheritedLivingStateAge,
      livingStateOwner: "SurfaceWakeGameplaySystem",
      livingStateContinuityPass: "HC-023C",
      livingStateAffectsProgression: false,
      livingStatePresentationWeight: active ? this.livingStatePresentationWeight() : 0,
      directTriggerMutationByGrowth: false,
      stabilizing: Boolean(active && this.frameState.input?.stabilizeHeld),
      stabilizeSeconds: active ? this.stabilizeSeconds : 0,
      flowRevealActive: Boolean(active && this.flowRevealSeconds > 0),
      flowRevealSeconds: active ? this.flowRevealSeconds : 0,
      pulseReads: active ? this.pulseReads : 0,
      worldReads: active ? [...this.worldReads] : [],
      optionalRewardCount: active ? rewardCount : 0,
      optionalRewardsCollected: active ? [...this.rewardIds] : [],
      familiarity: active ? this.familiarity : 0,
      convergencePointReadable: Boolean(active && (this.triggerReady || this.maxPathProgress >= 0.42)),
      currentFocus: "none",
      focusObjectId: "none",
      targetRequired: false,
      inputRequired: false,
      movementRequired: true,
      blocker: "none_detected",
      lastInteraction: active ? this.lastAction : "none",
      guideLine: this.recipe?.playerFacing?.guideLine ?? "The current is already moving.",
      objectiveLine: this.triggerReady
        ? "The current is converging ahead. Move into the bright fold when you are ready to read it more closely."
        : (this.recipe?.playerFacing?.objectiveLine ?? "Explore the living current."),
      nextAction: this.triggerReady
        ? "Follow the bright convergence; the existing Guide Threshold reading is now available."
        : (this.recipe?.playerFacing?.nextAction ?? "Ride the current and learn what changes when you leave it."),
      routeActivated: false,
      thresholdOpened: false,
      noGate: true,
      gameplayLoop: "observe current → pulse/read when uncertain → sustain stabilize on turbulent flow → read rejection/response → move with coherent current → convergence trigger",
      grammarSequence: ["repeat", "recognize", "vary", "commit"],
      interactionFamily: {
        pass: "HC-021A",
        familyId: "guide_living_current_family",
        inheritedLesson: "read state before committing a verb",
        materialDifference: "flow is not free matter",
        repeatedGrammar: ["Pulse reads", "Stabilize changes coherence", "Absorb commits only compatible free matter"],
        recognitionEvidence: this.readBeforeCommit,
        variationEvidence: this.materialReadState === "absorb_rejected_by_living_current"
          || this.materialReadState === "read_off_current_tissue",
        objectiveAuthority: false,
        addsNewVerb: false
      },
      buttonMashSuccessExpected: false,
      embodimentPass: "HC-009D",
      movementReference: "full_3d_curve_tangent",
      verticalExcursion: this.recipe?.path?.verticalExcursion ?? 0,
      objectDefiningRings: false,
      visualHierarchyPass: "HC-031W2B1.1",
      visualHierarchyPolicy: "local_actionable_pressure_and_convergence_over_restored_low_energy_path_support",
      fullPathSupportOpacityMultiplier: W2B11_SUPPORT_STRAND_OPACITY_MULTIPLIER,
      currentMoteSupportOpacityMultiplier: W2B11_SUPPORT_MOTE_OPACITY_MULTIPLIER,
      authoredPressureBodies: this.eddies.length
    };
  }

  projectToPath(position) {
    let bestU = 0;
    let bestDistanceSq = Infinity;
    const point = new THREE.Vector3();
    const bestPoint = new THREE.Vector3();
    for (let index = 0; index <= this.pathSampleCount; index += 1) {
      const u = index / this.pathSampleCount;
      this.path.getPoint(u, point);
      const distanceSq = point.distanceToSquared(position);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestU = u;
        bestPoint.copy(point);
      }
    }
    const tangent = this.path.getTangent(Math.min(0.999, Math.max(0.001, bestU))).normalize();
    return { u: bestU, point: bestPoint, tangent, distance: Math.sqrt(bestDistanceSq) };
  }

  findObject(id) {
    if (!id) return null;
    return this.chemObjectSystem.objects.find((item) => item.recipe.id === id && item.cellId === CELL_ID) ?? null;
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }

  vector(value) {
    const source = Array.isArray(value) ? value : [0, 0, 0];
    return new THREE.Vector3(source[0] ?? 0, source[1] ?? 0, source[2] ?? 0);
  }
}
