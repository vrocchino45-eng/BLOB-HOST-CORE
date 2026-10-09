import * as THREE from "three";
import { LayeredInteractionGrammar } from "../interaction/LayeredInteractionGrammar.js";

const RECIPE_ID = "GUIDE_THRESHOLD_LAYERED_INTERACTION_HC006F";
const CELL_ID = "CELL_SCAR_FLOW_FOLD_001";
const SURFACE_LIVING_STATES = new Set(["cautious", "blooming", "withered", "panic", "embrace", "growth"]);
const W2B1_LAYERED_STRAND_OPACITY_MULTIPLIER = 0.56;
const W2B1_LAYERED_MOTE_OPACITY_MULTIPLIER = 0.72;
const W2B1_LAYERED_LIGHT_INTENSITY_MULTIPLIER = 0.62;

/**
 * HC-006G locks the Guide Threshold movement-led layered reading for live play.
 * It owns the authored traversal grammar while the legacy ScarFlowInteraction
 * state remains only as a compatibility handoff for already-stable downstream
 * morph code.
 */
export class GuideThresholdLayeredInteractionSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[GuideThresholdLayeredInteractionSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[GuideThresholdLayeredInteractionSystem] scene is required.");
    if (!playerRoot) throw new Error("[GuideThresholdLayeredInteractionSystem] playerRoot is required.");
    if (!frameState) throw new Error("[GuideThresholdLayeredInteractionSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.root = null;
    this.path = null;
    this.pathPoints = [];
    this.strands = [];
    this.ribs = [];
    this.responseRings = [];
    this.currentMotes = [];
    this.focusMarker = null;
    this.light = null;

    this.stageIndex = 0;
    this.approachHold = 0;
    this.alignmentProgress = 0;
    this.traversalProgress = 0;
    this.resonanceHold = 0;
    this.tissueResponse = 0;
    this.responseProgress = 0;
    this.settleProgress = 0;
    this.settleLatched = false;
    this.settleReleaseArmed = false;
    this.settleArmSource = "none";
    this.settleLatchSource = "none";
    this.settleZoneReady = false;
    this.settleZoneSource = "none";
    this.completed = false;
    this.transitionReady = false;
    this.focusDistance = Infinity;
    this.pathDirectionDot = 0;
    this.localPathDirectionDot = 0;
    this.movementMagnitude = 0;
    this.pathProgress = 0;
    this.previousPathProgress = 0;
    this.forwardPathDelta = 0;
    this.corridorDistance = Infinity;
    this.withinPathCorridor = false;
    this.sustainStartPathProgress = 0;
    this.settleDistance = Infinity;
    this.settleAnchorDistance = Infinity;
    this.settleAnchorPosition = new THREE.Vector3();
    this.stageElapsed = 0;
    this.guidanceLevel = 0;
    this.pathProjectionPoint = new THREE.Vector3();
    this.pathProjectionTangent = new THREE.Vector3(0, 0, -1);
    this.lastInteraction = "none";
    this.lastConsumedPulseEventId = 0;
    this.stageStartPosition = new THREE.Vector3();
    this.previousPlayerPosition = new THREE.Vector3();
    this.currentFocusPosition = new THREE.Vector3();
    this.pathDirection = new THREE.Vector3(0, 0, -1);
    this.frameDisplacement = new THREE.Vector3();
    this.pathSampleCount = 64;
    this.grammar = null;

    // HC023C presentation continuity only; Surface remains the state owner.
    this.inheritedLivingState = "cautious";
    this.inheritedLivingStateSequence = 0;
    this.stateBloomColor = new THREE.Color(0xa9efb8);
    this.stateWitherColor = new THREE.Color(0x7f8790);
    this.statePanicColor = new THREE.Color(0xf1a070);
    this.stateEmbraceColor = new THREE.Color(0xaee8cc);
    this.stateGrowthColor = new THREE.Color(0x8ee6aa);
  }

  init() {
    this.recipe = this.recipeDataSystem.get("guideThresholdLayeredInteractionRecipes", RECIPE_ID);
    this.pathPoints = (this.recipe.geometry?.pathPoints ?? []).map((point) => this.vector(point));
    if (this.pathPoints.length < 2) throw new Error("[GuideThresholdLayeredInteractionSystem] at least two path points are required.");
    this.path = new THREE.CatmullRomCurve3(this.pathPoints, false, "catmullrom", 0.3);
    this.pathDirection.copy(this.pathPoints.at(-1)).sub(this.pathPoints[0]).normalize();
    this.currentFocusPosition.copy(this.pathPoints[0]);
    this.previousPlayerPosition.copy(this.playerRoot.position);
    this.stageStartPosition.copy(this.playerRoot.position);

    this.grammar = new LayeredInteractionGrammar({
      interactionId: this.recipe.id,
      authoredStages: this.recipe.stages ?? [],
      stageMap: {
        approach_guiding_current: "approachable",
        observe_current_direction: "observed",
        align_movement_with_fold: "aligned",
        sustain_resonance_while_traversing: "sustaining",
        watch_threshold_tissue_answer: "responding",
        release_at_settling_point: "settling",
        guide_threshold_complete: "complete"
      }
    });

    this.createVisual();
    this.frameState.guideThresholdLayeredInteraction = this.createState(false);
  }

  update(dt, frameState) {
    const active = this.isActive(frameState);
    if (!active) {
      this.setVisible(false);
      frameState.guideThresholdLayeredInteraction = this.createState(false);
      if (frameState.interactionInspectionFocus?.providerId === "GuideThresholdLayeredInteractionSystem") {
        frameState.interactionInspectionFocus = this.createInspectionFocus(false);
      }
      this.previousPlayerPosition.copy(this.playerRoot.position);
      return;
    }

    this.setVisible(true);
    this.updateInheritedLivingState(frameState);
    this.updateMotionRead(dt, frameState);
    this.updateFocusPosition();
    this.focusDistance = this.playerRoot.position.distanceTo(this.currentFocusPosition);

    if (!this.completed) this.updateStage(dt, frameState);
    this.applyCompatibilityMetrics(frameState);
    this.animate(frameState.runtimeSeconds ?? 0);
    this.publishPromptState(frameState);

    frameState.interactionInspectionFocus = this.createInspectionFocus(true);
    frameState.guideThresholdLayeredInteraction = this.createState(true);

    if (frameState.lockState) {
      frameState.lockState.nextIfPasses = this.recipe.completion?.nextRecommendedPass ?? "HC-006H — Hub and Signal Chorus Unification";
    }

    this.previousPlayerPosition.copy(this.playerRoot.position);
  }

  updateInheritedLivingState(frameState) {
    const nursery = frameState.nurseryCircuit ?? {};
    const candidate = nursery.livingState ?? "cautious";
    this.inheritedLivingState = SURFACE_LIVING_STATES.has(candidate) ? candidate : "cautious";
    this.inheritedLivingStateSequence = nursery.livingStateSequence ?? 0;

    if (this.root) {
      this.root.userData.inheritedLivingState = this.inheritedLivingState;
      this.root.userData.livingStateContinuityPass = "HC-023C";
      this.root.userData.livingStateOwner = "SurfaceWakeGameplaySystem";
    }
  }

  livingStateStyle() {
    switch (this.inheritedLivingState) {
      case "blooming": return { tint: this.stateBloomColor, motion: 1.24, opacity: 1.18, scale: 1.06, jitter: 0.022 };
      case "withered": return { tint: this.stateWitherColor, motion: 0.48, opacity: 0.56, scale: 0.86, jitter: 0.004 };
      case "panic": return { tint: this.statePanicColor, motion: 1.7, opacity: 1.16, scale: 0.94, jitter: 0.075 };
      case "embrace": return { tint: this.stateEmbraceColor, motion: 0.76, opacity: 0.94, scale: 1.09, jitter: 0.006 };
      case "growth": return { tint: this.stateGrowthColor, motion: 1.1, opacity: 1.12, scale: 1.13, jitter: 0.012 };
      default: return { tint: this.stateEmbraceColor, motion: 1, opacity: 1, scale: 1, jitter: 0.01 };
    }
  }

  livingStatePresentationWeight() {
    if (this.inheritedLivingState === "cautious") return 0;
    const tissueMediation = Math.min(
      1,
      Math.max(this.tissueResponse, this.responseProgress, this.settleProgress, this.completed ? 1 : 0)
    );
    const needsRecovery = this.inheritedLivingState === "panic" || this.inheritedLivingState === "withered";
    return needsRecovery ? Math.max(0.34, 1 - tissueMediation * 0.58) : 0.84 + tissueMediation * 0.16;
  }

  isActive(frameState) {
    if (frameState.activeCellId !== (this.recipe?.activation?.requiresActiveCell ?? CELL_ID)) return false;
    if (!frameState.localCellMorph?.completed) return false;
    if (frameState.secondLocalCellMorph?.started || frameState.secondLocalCellMorph?.completed) return false;

    // HC-007B: the layered trigger remains intact, but the systemic Scar Flow
    // gameplay layer owns the space before it. Existing validators and older
    // saves without the gameplay state retain the prior activation behavior.
    const gameplay = frameState.guideThresholdGameplay;
    if (gameplay?.active && !gameplay.triggerReady) return false;
    return true;
  }

  updateMotionRead(dt, frameState) {
    this.frameDisplacement.copy(this.playerRoot.position).sub(this.previousPlayerPosition);
    const frameDistance = this.frameDisplacement.length();
    const velocity = frameState.playerKinematics?.velocity ?? {};
    const velocityVector = new THREE.Vector3(velocity.x ?? 0, velocity.y ?? 0, velocity.z ?? 0);
    const input = frameState.input ?? {};
    this.movementMagnitude = Math.max(
      Math.hypot(input.moveX ?? 0, input.moveY ?? 0, input.moveZ ?? 0),
      Math.min(1, velocityVector.length() / 1.8),
      Math.min(1, frameDistance * 60)
    );

    const direction = frameDistance > 0.0001 ? this.frameDisplacement.clone().normalize() : velocityVector;
    if (direction.lengthSq() > 0.0001) {
      direction.normalize();
      this.pathDirectionDot = direction.dot(this.pathDirection);
    } else {
      this.pathDirectionDot = 0;
    }

    const projection = this.projectToPath(this.playerRoot.position);
    this.previousPathProgress = this.pathProgress;
    this.pathProgress = projection.u;
    this.forwardPathDelta = this.pathProgress - this.previousPathProgress;
    this.corridorDistance = projection.distance;
    this.pathProjectionPoint.copy(projection.point);
    this.pathProjectionTangent.copy(projection.tangent).normalize();
    this.localPathDirectionDot = direction.lengthSq() > 0.0001
      ? direction.dot(this.pathProjectionTangent)
      : 0;
    const corridorRange = this.currentCorridorRange();
    this.withinPathCorridor = this.corridorDistance <= corridorRange;
    this.settleDistance = this.playerRoot.position.distanceTo(this.pathPoints.at(-1));
    this.updateSettlingZoneRead();
    this.stageElapsed += Math.max(0, dt);
  }

  updateSettlingZoneRead() {
    const geometry = this.recipe?.geometry ?? {};
    const directRange = geometry.settleRange ?? 1.35;
    const pathMinimum = geometry.settlePathProgressMin ?? 0.82;
    const corridorRange = geometry.settleCorridorRange ?? Math.max(this.currentCorridorRange(), 1.62);
    const directReady = this.settleDistance <= directRange;
    const ribCorridorReady = this.pathProgress >= pathMinimum && this.corridorDistance <= corridorRange;

    this.settleZoneReady = Boolean(directReady || ribCorridorReady);
    this.settleZoneSource = directReady
      ? "endpoint_range"
      : ribCorridorReady
        ? "late_path_rib_corridor"
        : "none";
    this.settleAnchorDistance = this.settleLatched
      ? this.playerRoot.position.distanceTo(this.settleAnchorPosition)
      : Infinity;
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
    return {
      u: bestU,
      point: bestPoint,
      tangent,
      distance: Math.sqrt(bestDistanceSq)
    };
  }

  currentCorridorRange() {
    const geometry = this.recipe?.geometry ?? {};
    const base = geometry.corridorRange ?? 1.15;
    const assist = geometry.assistedCorridorRange ?? 1.45;
    return this.guidanceLevel > 0 ? assist : base;
  }

  updateGuidanceLevel() {
    const timing = this.recipe?.timing ?? {};
    const assistAfter = timing.guidanceAssistAfterSeconds ?? 2.8;
    this.guidanceLevel = this.stageElapsed >= assistAfter ? 1 : 0;
  }

  updateFocusPosition() {
    if (this.stageIndex <= 1) {
      const gameplay = this.frameState.guideThresholdGameplay ?? {};
      if (gameplay.triggerReady) {
        const convergenceU = Math.max(0.58, Math.min(0.74, gameplay.maxPathProgress ?? 0.58));
        this.currentFocusPosition.copy(this.path.getPoint(convergenceU));
      } else {
        this.currentFocusPosition.copy(this.pathPoints[0]);
      }
      return;
    }
    if (this.stageIndex <= 3) {
      const lookAhead = this.recipe?.geometry?.focusLookAhead ?? 0.18;
      const focusU = Math.min(0.92, Math.max(0.18, this.pathProgress + lookAhead));
      this.currentFocusPosition.copy(this.path.getPoint(focusU));
      return;
    }
    this.currentFocusPosition.copy(this.pathPoints.at(-1));
  }

  updateStage(dt, frameState) {
    const geometry = this.recipe.geometry ?? {};
    const timing = this.recipe.timing ?? {};
    const pulseEventId = frameState.input?.pulseEventId ?? 0;
    this.updateGuidanceLevel();
    const freshPulse = Boolean(
      frameState.input?.pulsePressed &&
      pulseEventId > 0 &&
      pulseEventId !== this.lastConsumedPulseEventId
    );
    if (freshPulse && this.stageIndex !== 1) {
      this.consumePulse(frameState, `guide_threshold_optional_pulse_stage_${this.stageIndex}`);
      if (this.stageIndex === 3) this.tissueResponse = this.clamp01(this.tissueResponse + 0.035);
    }

    switch (this.stageIndex) {
      case 0: {
        const inRange = this.focusDistance <= (geometry.approachRange ?? 3);
        const duration = Math.max(0.1, timing.approachHoldSeconds ?? 0.38);
        this.approachHold = this.clamp01(this.approachHold + (inRange ? dt / duration : -dt * 0.5));
        this.lastInteraction = inRange ? "guide_current_reading_presence" : "approach_guiding_current";
        if (this.approachHold >= 0.999) this.advanceStage(frameState, "guiding_current_presence_read");
        break;
      }
      case 1: {
        if (freshPulse && this.focusDistance <= (geometry.observeRange ?? 2.8)) {
          this.consumePulse(frameState, "guide_current_direction_revealed");
          this.advanceStage(frameState, "guide_current_observed");
        }
        break;
      }
      case 2: {
        const dotThreshold = this.guidanceLevel > 0
          ? (geometry.assistedAlignmentDot ?? 0.08)
          : (geometry.alignmentDot ?? 0.2);
        const aligned = this.localPathDirectionDot >= dotThreshold;
        const moving = this.movementMagnitude >= (geometry.minimumMovement ?? 0.12);
        const duration = Math.max(0.25, timing.alignmentSeconds ?? 0.9);
        const decay = timing.outOfAlignmentDecayPerSecond ?? 0.16;
        const valid = aligned && moving && this.withinPathCorridor;
        this.alignmentProgress = this.clamp01(
          this.alignmentProgress + (valid ? dt / duration : -dt * decay)
        );
        this.lastInteraction = valid
          ? "movement_agreeing_with_local_guide_current"
          : !this.withinPathCorridor
            ? "return_to_lit_current_corridor"
            : moving
              ? "movement_crossing_current_turn_toward_flow"
              : "move_with_current_to_align";
        if (this.alignmentProgress >= 0.999) this.advanceStage(frameState, "movement_aligned_with_fold");
        break;
      }
      case 3: {
        const held = this.isContextHeld(frameState);
        const moving = this.movementMagnitude >= (geometry.minimumSustainMovement ?? 0.1);
        const dotThreshold = this.guidanceLevel > 0
          ? (geometry.assistedSustainDot ?? -0.02)
          : (geometry.sustainAlignmentDot ?? 0.08);
        const aligned = this.localPathDirectionDot >= dotThreshold;
        const sustainSeconds = Math.max(0.35, timing.sustainSeconds ?? 1.45);
        const targetPathU = geometry.sustainTargetPathProgress ?? 0.84;
        const denominator = Math.max(0.1, targetPathU - this.sustainStartPathProgress);
        const actualTravel = this.clamp01((this.pathProgress - this.sustainStartPathProgress) / denominator);
        const valid = held && moving && aligned && this.withinPathCorridor;

        if (valid) {
          this.resonanceHold = this.clamp01(this.resonanceHold + dt / sustainSeconds);
          this.traversalProgress = Math.max(this.traversalProgress, actualTravel);
          this.tissueResponse = this.clamp01(this.tissueResponse + dt / (sustainSeconds * 0.9));
          this.lastInteraction = "resonance_carried_forward_through_living_corridor";
        } else {
          this.resonanceHold = this.clamp01(this.resonanceHold - dt * (timing.invalidSustainDecayPerSecond ?? 0.06));
          this.lastInteraction = !held
            ? "hold_A_or_F_while_moving"
            : !moving
              ? "movement_required_while_resonance_held"
              : !this.withinPathCorridor
                ? "resonance_outside_current_return_to_lit_tissue"
                : "resonance_held_turn_toward_current";
        }

        const requiredHold = geometry.requiredResonanceHold ?? 0.92;
        const requiredTravel = geometry.requiredTraversalProgress ?? 0.78;
        if (this.resonanceHold >= requiredHold && this.traversalProgress >= requiredTravel) {
          this.tissueResponse = 1;
          this.advanceStage(frameState, "moving_resonance_completed_threshold_response");
        }
        break;
      }
      case 4: {
        const responseSeconds = Math.max(0.2, timing.responseSeconds ?? 0.7);
        this.responseProgress = this.clamp01(this.responseProgress + dt / responseSeconds);
        this.lastInteraction = "watching_guide_threshold_tissue_answer";
        if (this.responseProgress >= 0.999) this.advanceStage(frameState, "threshold_response_visible_release_required");
        break;
      }
      case 5: {
        const held = this.isContextHeld(frameState);
        const settleSeconds = Math.max(0.25, timing.releaseSettleSeconds ?? 0.9);

        // HC-006HA: accept the deliberate LT release once inside the visible
        // settling-rib zone, then latch the settle. The old implementation
        // required raw endpoint proximity every frame, so ambient Scar-Flow
        // drift could push the player out at ~80% and leave the route at 96%.
        const releaseEligible = this.settleZoneReady || this.settleReleaseArmed;
        if (!this.settleLatched && !held && releaseEligible) {
          this.settleLatched = true;
          this.settleLatchSource = this.settleZoneReady
            ? this.settleZoneSource
            : this.settleArmSource;
          this.settleAnchorPosition.copy(this.playerRoot.position);
          this.settleAnchorDistance = 0;
          this.lastInteraction = `guide_threshold_release_latched_${this.settleLatchSource}`;
        }

        if (this.settleLatched && !held) {
          this.settleProgress = this.clamp01(this.settleProgress + dt / settleSeconds);
          this.lastInteraction = "guide_threshold_release_latched_tissue_settling";
        } else if (held) {
          this.lastInteraction = this.settleLatched
            ? "release_LT_to_resume_settling"
            : "release_LT_inside_settling_ribs";
        } else {
          this.lastInteraction = "move_within_visible_settling_ribs";
        }

        if (this.settleProgress >= 0.999) {
          this.completed = true;
          this.transitionReady = true;
          this.stageIndex = 6;
          this.grammar?.setAuthoredIndex(6, frameState.runtimeSeconds ?? 0, "guide_threshold_layered_traversal_complete");
          this.lastInteraction = "guide_threshold_complete_second_morph_ready";
        }
        break;
      }
      default:
        break;
    }
  }

  isContextHeld(frameState) {
    return Boolean(
      frameState.input?.stabilizeHeld ||
      frameState.input?.resonanceHeld
    );
  }

  consumePulse(frameState, result) {
    const eventId = frameState.input?.pulseEventId ?? 0;
    this.lastConsumedPulseEventId = eventId;
    const audit = frameState.inputActionAudit ?? {};
    frameState.inputActionAudit = {
      ...audit,
      pass: "HC-006IA",
      eventId,
      source: frameState.input?.pulseSource ?? audit.source ?? "unknown",
      consumedBy: "GuideThresholdLayeredInteractionSystem",
      consumedAtFrame: frameState.frame ?? -1,
      consumedTargetId: this.recipe.focusObjectId ?? "guide_threshold_current_001",
      result
    };
  }

  advanceStage(frameState, interaction) {
    const previousStageIndex = this.stageIndex;
    this.stageIndex = Math.min(6, this.stageIndex + 1);
    this.stageStartPosition.copy(this.playerRoot.position);
    this.stageElapsed = 0;
    this.guidanceLevel = 0;
    if (this.stageIndex === 3) {
      this.sustainStartPathProgress = Math.min(this.pathProgress, 0.62);
      this.traversalProgress = 0;
    }
    if (this.stageIndex === 5) {
      const geometry = this.recipe?.geometry ?? {};
      const requiredHold = geometry.requiredResonanceHold ?? 0.92;
      const requiredTravel = geometry.requiredTraversalProgress ?? 0.78;

      // HC-006IA: reaching the response-to-settle handoff proves that the
      // movement, resonance, and tissue-response prerequisites were already
      // satisfied. Preserve that eligibility across the short response beat so
      // ambient Scar-Flow drift cannot place the player outside the authored
      // ribs before the release stage becomes readable.
      this.settleReleaseArmed = Boolean(
        previousStageIndex === 4 &&
        this.responseProgress >= 0.999 &&
        this.resonanceHold >= requiredHold &&
        this.traversalProgress >= requiredTravel
      );
      this.settleArmSource = this.settleReleaseArmed
        ? "completed_threshold_response_handoff"
        : "none";
      this.settleLatched = false;
      this.settleLatchSource = "none";
      this.settleZoneReady = false;
      this.settleZoneSource = "none";
      this.settleAnchorDistance = Infinity;
    }
    this.grammar?.setAuthoredIndex(this.stageIndex, frameState.runtimeSeconds ?? 0, interaction);
    this.lastInteraction = interaction;
  }

  applyCompatibilityMetrics(frameState) {
    const completion = frameState.morphCompletion ?? (frameState.morphCompletion = {});
    completion.memoryEcho = Math.max(completion.memoryEcho ?? 0, this.stageIndex >= 2 ? 0.28 : 0);
    completion.pathConfidence = Math.max(completion.pathConfidence ?? 0, this.alignmentProgress * 0.52, this.stageIndex >= 3 ? 0.38 : 0);
    completion.pressureRelief = Math.max(completion.pressureRelief ?? 0, this.resonanceHold * 0.48, this.stageIndex >= 4 ? 0.34 : 0);
    if (this.stageIndex >= 3) completion.clotWarning = Math.min(completion.clotWarning ?? 0.3, 0.32);
    completion.stability = Math.max(completion.stability ?? 0, this.completed ? 0.64 : this.tissueResponse * 0.58);
    if (this.completed) {
      completion.safeToExpand = true;
      completion.nextAction = "Guide Threshold complete — let the living fold become Signal Chorus tissue.";
    }
  }

  publishPromptState(frameState) {
    frameState.promptStack = {
      ...(frameState.promptStack ?? {}),
      guideThresholdLayeredInteraction: this.completed
        ? "guide_threshold_complete_second_morph_ready"
        : `guide_threshold_${this.currentStage()?.id ?? "waiting"}`,
      note: "HC-006HA preserves the curved traversal and latches the valid LT release so ambient flow cannot strand the final settle."
    };
  }

  createVisual() {
    const geometry = this.recipe.geometry ?? {};
    const visual = this.recipe.visual ?? {};
    const baseOpacity = visual.baseOpacity ?? 0.16;

    this.root = new THREE.Group();
    this.root.name = "guide_threshold_layered_interaction_HC006F";
    this.root.userData.system = "GuideThresholdLayeredInteractionSystem";
    this.root.userData.targetingSuppressed = true;
    this.scene.add(this.root);

    const strandCount = Math.max(3, geometry.strandCount ?? 5);
    for (let index = 0; index < strandCount; index += 1) {
      const offset = (index - (strandCount - 1) / 2) * 0.055;
      const points = this.pathPoints.map((point, pointIndex) => point.clone().add(new THREE.Vector3(
        Math.sin(index * 1.3 + pointIndex) * 0.04,
        offset + Math.cos(index + pointIndex * 0.8) * 0.025,
        Math.cos(index * 0.9 + pointIndex) * 0.035
      )));
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? (visual.signalColor ?? 0xaaefff) : (visual.memoryColor ?? 0xffdca8),
        transparent: true,
        opacity: baseOpacity * W2B1_LAYERED_STRAND_OPACITY_MULTIPLIER,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012 + index * 0.002, 6, false), material);
      strand.name = `guide_threshold_current_strand_${String(index + 1).padStart(2, "0")}`;
      strand.userData.inspectionFadeable = true;
      strand.userData.livingTissue = true;
      strand.userData.hc023cBaseColor = strand.material.color.clone();
      strand.userData.visualHierarchyRole = "supporting_current_path";
      this.root.add(strand);
      this.strands.push(strand);
    }

    const ribCount = Math.max(4, geometry.ribCount ?? 6);
    for (let index = 0; index < ribCount; index += 1) {
      const u = 0.52 + (index / Math.max(1, ribCount - 1)) * 0.46;
      const point = this.path.getPoint(u);
      const tangent = this.path.getTangent(u).normalize();
      const material = new THREE.MeshBasicMaterial({
        color: visual.pressureColor ?? 0x9df6ff,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const rib = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.24 + index * 0.016, 1),
        material
      );
      rib.name = `guide_threshold_settling_rib_${String(index + 1).padStart(2, "0")}`;
      rib.position.copy(point);
      rib.lookAt(point.clone().add(tangent));
      rib.scale.set(0.42 + index * 0.025, 1.26 + index * 0.08, 0.68);
      rib.userData.baseScale = rib.scale.clone();
      rib.userData.hc023cBaseColor = rib.material.color.clone();
      rib.userData.inspectionFadeable = true;
      rib.userData.anatomicalPressureBody = true;
      rib.userData.objectDefiningRing = false;
      rib.userData.visualHierarchyRole = "local_actionable_settling_body";
      this.root.add(rib);
      this.ribs.push(rib);
    }

    for (let index = 0; index < 3; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: index === 2 ? (visual.settledColor ?? 0xceffde) : (visual.memoryColor ?? 0xffdca8),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45 + index * 0.17, 0.012, 8, 72), material);
      ring.position.copy(this.pathPoints.at(-1));
      ring.rotation.x = Math.PI / 2;
      ring.userData.inspectionFadeable = true;
      this.root.add(ring);
      this.responseRings.push(ring);
    }

    for (let index = 0; index < 16; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? (visual.memoryColor ?? 0xffdca8) : (visual.signalColor ?? 0xaaefff),
        transparent: true,
        opacity: 0.18 * W2B1_LAYERED_MOTE_OPACITY_MULTIPLIER,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (index % 3) * 0.006, 8, 6), material);
      mote.name = `guide_threshold_current_mote_${String(index + 1).padStart(2, "0")}`;
      mote.userData.pathOffset = index / 16;
      mote.userData.hc023cBaseColor = mote.material.color.clone();
      mote.userData.inspectionFadeable = true;
      mote.userData.visualHierarchyRole = "supporting_current_motion";
      this.root.add(mote);
      this.currentMotes.push(mote);
    }

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: visual.memoryColor ?? 0xffdca8,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.focusMarker = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 2), markerMaterial);
    this.focusMarker.name = this.recipe.focusObjectId ?? "guide_threshold_current_001";
    this.focusMarker.scale.set(0.7, 1.24, 0.82);
    this.focusMarker.userData.inspectionNeverFade = true;
    this.focusMarker.userData.targetingSuppressed = true;
    this.focusMarker.userData.objectDefiningRing = false;
    this.focusMarker.userData.visualHierarchyRole = "local_actionable_focus";
    this.root.add(this.focusMarker);

    this.light = new THREE.PointLight(visual.signalColor ?? 0xaaefff, 0.35 * W2B1_LAYERED_LIGHT_INTENSITY_MULTIPLIER, 4.8, 2);
    this.root.add(this.light);
  }

  animate(runtimeSeconds) {
    const visual = this.recipe.visual ?? {};
    const livingStyle = this.livingStateStyle();
    const livingWeight = this.livingStatePresentationWeight();
    const baseOpacity = visual.baseOpacity ?? 0.16;
    const activeOpacity = visual.activeOpacity ?? 0.56;
    const energy = this.completed
      ? 0.9
      : Math.max(this.approachHold * 0.24, this.alignmentProgress * 0.5, this.resonanceHold, this.responseProgress, this.settleProgress);
    const guidancePulse = this.guidanceLevel > 0 && [2, 3].includes(this.stageIndex)
      ? 0.5 + Math.sin(runtimeSeconds * 4.2) * 0.5
      : 0;
    const offCorridor = [2, 3].includes(this.stageIndex) && !this.withinPathCorridor;

    this.strands.forEach((strand, index) => {
      const baseColor = strand.userData.hc023cBaseColor ?? strand.material.color;
      strand.material.color.copy(baseColor).lerp(livingStyle.tint, livingWeight * 0.34);
      strand.material.opacity = (baseOpacity + energy * (0.18 + (index % 2) * 0.07) + guidancePulse * 0.08)
        * (1 + (livingStyle.opacity - 1) * livingWeight);
      strand.material.opacity += Math.sin(runtimeSeconds * 2.5 * livingStyle.motion - index * 0.7)
        * (0.035 + livingStyle.jitter * livingWeight * 0.2);
      strand.material.opacity *= W2B1_LAYERED_STRAND_OPACITY_MULTIPLIER;
    });

    this.ribs.forEach((rib, index) => {
      const response = Math.max(this.tissueResponse, this.responseProgress, this.settleProgress, this.completed ? 0.86 : 0);
      const baseColor = rib.userData.hc023cBaseColor ?? rib.material.color;
      rib.material.color.copy(baseColor).lerp(livingStyle.tint, livingWeight * 0.42);
      rib.material.opacity = (0.05 + response * (0.22 + index * 0.018))
        * (1 + (livingStyle.opacity - 1) * livingWeight);
      rib.rotation.z += 0.0025 * (1 + (livingStyle.motion - 1) * livingWeight * 0.55) * (index % 2 === 0 ? 1 : -1);
      const breathe = 0.94 + response * 0.18
        + Math.sin(runtimeSeconds * 2 * livingStyle.motion - index * 0.4)
          * (0.025 + livingStyle.jitter * livingWeight * 0.18);
      const stateScale = 1 + (livingStyle.scale - 1) * livingWeight;
      rib.scale.copy(rib.userData.baseScale).multiplyScalar(breathe * stateScale);
      if (this.inheritedLivingState === "panic") {
        const mediation = Math.min(1, Math.max(this.tissueResponse, this.responseProgress, this.settleProgress));
        rib.scale.y *= 0.92 + mediation * 0.08;
      }
    });

    this.responseRings.forEach((ring, index) => {
      const response = Math.max(this.responseProgress, this.settleProgress, this.completed ? 1 : 0);
      ring.material.opacity = response * (0.18 + index * 0.08);
      ring.scale.setScalar(0.9 + response * (0.18 + index * 0.08));
      ring.rotation.z += 0.004 * (index % 2 === 0 ? 1 : -1);
    });

    this.currentMotes.forEach((mote, index) => {
      const baseColor = mote.userData.hc023cBaseColor ?? mote.material.color;
      mote.material.color.copy(baseColor).lerp(livingStyle.tint, livingWeight * 0.4);
      const speed = (0.05 + energy * 0.12 + guidancePulse * 0.035)
        * (1 + (livingStyle.motion - 1) * livingWeight);
      const u = (mote.userData.pathOffset + runtimeSeconds * speed) % 1;
      mote.position.copy(this.path.getPoint(u));
      mote.position.y += Math.sin(runtimeSeconds * 3 * livingStyle.motion + index)
        * (0.025 + livingStyle.jitter * livingWeight * 0.28);
      mote.position.x += Math.cos(runtimeSeconds * 2.8 + index * 0.6) * livingStyle.jitter * livingWeight * 0.16;
      mote.material.opacity = (0.08 + energy * 0.42 + guidancePulse * 0.12)
        * (1 + (livingStyle.opacity - 1) * livingWeight)
        * W2B1_LAYERED_MOTE_OPACITY_MULTIPLIER;
      const stateScale = 1 + (livingStyle.scale - 1) * livingWeight;
      mote.scale.setScalar((0.8 + energy * 0.6) * stateScale);
    });

    this.focusMarker.position.copy(this.currentFocusPosition);
    const focusPulse = 0.96 + Math.sin(runtimeSeconds * 3.4) * 0.04 + energy * 0.12 + guidancePulse * 0.08;
    this.focusMarker.scale.set(0.7 * focusPulse, 1.24 * focusPulse, 0.82 * focusPulse);
    this.focusMarker.material.opacity = Math.min(activeOpacity, 0.16 + energy * 0.42 + guidancePulse * 0.12);
    this.focusMarker.material.color.set(
      this.completed
        ? (visual.settledColor ?? 0xceffde)
        : offCorridor
          ? (visual.pressureColor ?? 0x9df6ff)
          : (visual.memoryColor ?? 0xffdca8)
    ).lerp(livingStyle.tint, livingWeight * 0.3);
    this.focusMarker.rotation.y += 0.004;
    this.focusMarker.rotation.z += 0.002;

    this.light.position.copy(this.currentFocusPosition);
    this.light.color.set(visual.signalColor ?? 0xaaefff).lerp(livingStyle.tint, livingWeight * 0.36);
    this.light.intensity = (0.18 + energy * 0.9 + guidancePulse * 0.35)
      * (1 + (livingStyle.opacity - 1) * livingWeight * 0.6)
      * W2B1_LAYERED_LIGHT_INTENSITY_MULTIPLIER;
  }

  currentStage() {
    return this.recipe?.stages?.[this.stageIndex] ?? this.recipe?.stages?.[0] ?? null;
  }

  overallProgress() {
    if (this.completed) return 1;
    if (this.stageIndex === 0) return this.approachHold * 0.12;
    if (this.stageIndex === 1) return 0.14;
    if (this.stageIndex === 2) return 0.16 + this.alignmentProgress * 0.22;
    if (this.stageIndex === 3) return 0.38 + Math.min(this.resonanceHold, this.traversalProgress) * 0.34;
    if (this.stageIndex === 4) return 0.72 + this.responseProgress * 0.12;
    if (this.stageIndex === 5) return 0.84 + this.settleProgress * 0.15;
    return 0;
  }

  createState(active) {
    const stage = this.currentStage();
    const geometry = this.recipe?.geometry ?? {};
    const expectsPulse = Boolean(active && this.stageIndex === 1 && !this.completed);
    const expectsHold = Boolean(active && this.stageIndex === 3 && !this.completed);
    const expectsRelease = Boolean(active && this.stageIndex === 5 && !this.completed);
    const focusReady = this.stageIndex === 5
      ? (this.settleLatched || this.settleZoneReady)
      : this.focusDistance <= (this.stageIndex <= 1 ? (geometry.observeRange ?? 2.8) : (geometry.settleRange ?? 2.25));

    return {
      pass: "HC-006HA",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      stage: active
        ? (stage?.id ?? "approach_guiding_current")
        : this.completed
          ? "guide_threshold_complete_retained"
          : "guide_threshold_inactive",
      stageIndex: this.completed ? 6 : active ? this.stageIndex : 0,
      status: this.completed ? "guide_threshold_layered_traversal_complete" : "guide_threshold_layered_traversal_in_progress",
      progress: active ? this.overallProgress() : this.completed ? 1 : 0,
      ready: Boolean(active && (this.approachHold > 0 || this.stageIndex > 0)),
      completed: Boolean(this.completed),
      transitionReady: Boolean(this.transitionReady),
      preparedForNextBranch: Boolean(this.completed),
      sourceCellId: CELL_ID,
      destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
      activeCellConfirmed: Boolean(active && this.frameState.activeCellId === CELL_ID),
      currentFocus: active ? (this.recipe?.focusObjectId ?? "guide_threshold_current_001") : "none",
      focusObjectId: active ? (this.recipe?.focusObjectId ?? "guide_threshold_current_001") : "none",
      focusVisualOnly: true,
      visualHierarchyPass: "HC-031W2B1",
      visualHierarchyPolicy: "focus_settling_bodies_and_core_guide_over_full_path_additive_support",
      fullPathSupportOpacityMultiplier: W2B1_LAYERED_STRAND_OPACITY_MULTIPLIER,
      currentMoteSupportOpacityMultiplier: W2B1_LAYERED_MOTE_OPACITY_MULTIPLIER,
      localPointLightIntensityMultiplier: W2B1_LAYERED_LIGHT_INTENSITY_MULTIPLIER,
      focusDistance: active ? this.focusDistance : 0,
      focusReady: Boolean(active && (focusReady || this.settleReleaseArmed)),
      targetRequired: false,
      inputRequired: Boolean(active && !this.completed && [1, 3, 5].includes(this.stageIndex)),
      movementRequired: Boolean(active && [0, 2, 3].includes(this.stageIndex)),
      expectsPulse,
      expectsHold,
      expectsRelease,
      optionalPulseOwned: Boolean(active && !this.completed),
      approachHold: active ? this.approachHold : 0,
      alignmentProgress: active ? this.alignmentProgress : 0,
      traversalProgress: active ? this.traversalProgress : 0,
      resonanceHold: active ? this.resonanceHold : 0,
      tissueResponse: active ? Math.max(this.tissueResponse, this.responseProgress) : 0,
      responseProgress: active ? this.responseProgress : 0,
      settleProgress: active ? this.settleProgress : 0,
      settleLatched: Boolean(active && this.settleLatched),
      settleReleaseArmed: Boolean(active && this.settleReleaseArmed),
      settleArmSource: active ? this.settleArmSource : "none",
      settleLatchSource: active ? this.settleLatchSource : "none",
      settleZoneReady: Boolean(active && this.settleZoneReady),
      settleZoneSource: active ? this.settleZoneSource : "none",
      settleAnchorDistance: active && Number.isFinite(this.settleAnchorDistance) ? this.settleAnchorDistance : 0,
      movementMagnitude: active ? this.movementMagnitude : 0,
      pathDirectionDot: active ? this.pathDirectionDot : 0,
      localPathDirectionDot: active ? this.localPathDirectionDot : 0,
      pathProgress: active ? this.pathProgress : this.completed ? 1 : 0,
      forwardPathDelta: active ? this.forwardPathDelta : 0,
      corridorDistance: active ? this.corridorDistance : 0,
      corridorRange: active ? this.currentCorridorRange() : 0,
      withinPathCorridor: Boolean(active && this.withinPathCorridor),
      settleDistance: active ? this.settleDistance : 0,
      guidanceLevel: active ? this.guidanceLevel : 0,
      stageElapsed: active ? this.stageElapsed : 0,
      lastInteraction: active ? this.lastInteraction : this.completed ? "guide_threshold_completion_retained" : "none",
      hudStatus: active
        ? `Guide Threshold: ${stage?.id ?? "living current"}`
        : this.completed
          ? "Guide Threshold: complete / retained"
          : "Guide Threshold: inactive",
      guideLine: active
        ? (stage?.guideLine ?? "The current bends through the scar.")
        : this.completed
          ? "The movement-led threshold reading remains learned."
          : "The Guide Threshold belongs to Scar Flow.",
      objectiveLine: active
        ? (stage?.objectiveLine ?? "Approach the guiding current.")
        : this.completed
          ? "Continue into the answering Signal Chorus tissue."
          : "Reach Scar Flow.",
      nextAction: active
        ? (stage?.nextAction ?? "Approach the guiding current.")
        : this.completed
          ? "Let the settled fold become Signal Chorus tissue."
          : "Reach Scar Flow.",
      blocker: active && this.stageIndex === 2 && !this.withinPathCorridor
        ? "outside_guide_current_corridor"
        : active && this.stageIndex === 3 && this.isContextHeld(this.frameState) && !this.withinPathCorridor
          ? "held_resonance_outside_current"
          : active && this.stageIndex === 5 && !this.settleLatched && this.isContextHeld(this.frameState)
            ? (this.settleReleaseArmed || this.settleZoneReady
              ? "release_stabilize_to_complete_settle"
              : "move_within_visible_settling_ribs_then_release")
            : active && this.stageIndex === 5 && !this.settleLatched && !this.settleZoneReady && !this.settleReleaseArmed
              ? "move_within_visible_settling_ribs"
              : "none_detected",
      routeActivated: false,
      thresholdOpened: false,
      activeCellChanges: false,
      noGate: true,
      inheritedLivingState: this.inheritedLivingState,
      inheritedLivingStateSequence: this.inheritedLivingStateSequence,
      livingStateOwner: "SurfaceWakeGameplaySystem",
      livingStateContinuityPass: "HC-023C",
      livingStateAffectsTraversalTiming: false,
      livingStatePresentationWeight: active ? this.livingStatePresentationWeight() : 0,
      noDoor: true,
      noTeleport: true,
      noBranchMenu: true,
      noCombat: true,
      embodimentPass: "HC-009B",
      movementReference: "full_3d_curve_tangent",
      verticalExcursion: geometry.verticalExcursion ?? 0,
      objectDefiningRings: false,
      anatomicalPressureBodies: this.ribs.length,
      inspectionCameraPass: "HC-006D",
      inspectionCameraAvailable: Boolean(this.frameState.inspectionCamera?.available ?? this.frameState.tightInspectionCamera?.available),
      inspectionCameraActive: Boolean(this.frameState.inspectionCamera?.active ?? this.frameState.tightInspectionCamera?.active),
      foundationalGrammar: this.grammar?.snapshot({
        progress: active ? this.overallProgress() : this.completed ? 1 : 0,
        completed: Boolean(this.completed),
        deepenedAtGuideThreshold: true,
        traversalLockedAtHC006G: true,
        movementLed: true
      }) ?? null
    };
  }

  createInspectionFocus(active) {
    const inspection = this.recipe?.inspection ?? {};
    return {
      architecturePass: "HC-006G",
      providerId: "GuideThresholdLayeredInteractionSystem",
      id: active ? (this.recipe?.focusObjectId ?? "guide_threshold_current_001") : "none",
      label: "Guide Threshold current",
      active: Boolean(active),
      inspectable: Boolean(active),
      requiredCellId: CELL_ID,
      position: {
        x: this.currentFocusPosition.x,
        y: this.currentFocusPosition.y,
        z: this.currentFocusPosition.z
      },
      distance: active ? this.focusDistance : Infinity,
      toggleRange: inspection.toggleRange ?? 4.8,
      autoExitRange: inspection.autoExitRange ?? 6.6,
      camera: {
        distance: inspection.distance ?? 4.5,
        fieldOfView: inspection.fieldOfView ?? 52,
        targetBlendTowardFocus: inspection.targetBlendTowardFocus ?? 0.64,
        targetLift: inspection.targetLift ?? 0.12,
        baseHeight: inspection.baseHeight ?? 0.86,
        pitch: inspection.pitch ?? 0.2,
        shoulderOffset: inspection.shoulderOffset ?? 0.56,
        forwardOffset: inspection.forwardOffset ?? 0.1
      },
      optional: true,
      targetRequired: false,
      routeActivated: false,
      activeCellChanges: false,
      interactionStateChanged: false
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }

  vector(value) {
    const source = Array.isArray(value) ? value : [0, 0, 0];
    return new THREE.Vector3(source[0] ?? 0, source[1] ?? 0, source[2] ?? 0);
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
