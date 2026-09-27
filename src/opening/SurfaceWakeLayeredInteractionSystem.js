import * as THREE from "three";
import { LayeredInteractionGrammar } from "../interaction/LayeredInteractionGrammar.js";

const RECIPE_ID = "SURFACE_WAKE_LAYERED_INTERACTION_HC006E";
const CELL_ID = "CELL_MEMBRANE_NURSERY_001";

/**
 * HC-006E teaches the shared interaction language at the first playable cell.
 * The authored Surface Wake fold owns meaning, timing, visuals, and completion.
 * The shared grammar and inspection camera remain reusable runtime foundations.
 */
export class SurfaceWakeLayeredInteractionSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[SurfaceWakeLayeredInteractionSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[SurfaceWakeLayeredInteractionSystem] scene is required.");
    if (!playerRoot) throw new Error("[SurfaceWakeLayeredInteractionSystem] playerRoot is required.");
    if (!frameState) throw new Error("[SurfaceWakeLayeredInteractionSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.root = null;
    this.anchor = new THREE.Vector3();
    this.foldCore = null;
    this.readingRing = null;
    this.responseRings = [];
    this.lobes = [];
    this.tendrils = [];
    this.light = null;

    this.stageIndex = 0;
    this.approachHold = 0;
    this.resonanceHold = 0;
    this.tissueResponse = 0;
    this.responseProgress = 0;
    this.settleProgress = 0;
    this.completed = false;
    this.focusDistance = Infinity;
    this.lastInteraction = "none";
    this.lastConsumedPulseEventId = 0;
    this.foldAvailable = false;
    this.emergenceProgress = 0;
    this.grammar = null;
  }

  init() {
    this.recipe = this.recipeDataSystem.get("surfaceWakeLayeredInteractionRecipes", RECIPE_ID);
    this.anchor.copy(this.vector(this.recipe.geometry?.anchor));
    this.grammar = new LayeredInteractionGrammar({
      interactionId: this.recipe.id,
      authoredStages: this.recipe.stages ?? [],
      stageMap: {
        approach_listening_fold: "approachable",
        observe_first_answer: "observed",
        sustain_first_resonance: "sustaining",
        watch_tissue_response: "responding",
        release_and_settle: "settling",
        surface_wake_complete: "complete"
      }
    });
    this.createVisual();
    this.setVisible(false);
    this.frameState.surfaceWakeLayeredInteraction = this.createState(this.isInCell(this.frameState), false);
  }

  update(dt, frameState) {
    const active = this.isInCell(frameState);
    if (!active) {
      this.setVisible(false);
      frameState.surfaceWakeLayeredInteraction = this.createState(false, this.completed);
      if (frameState.interactionInspectionFocus?.providerId === "SurfaceWakeLayeredInteractionSystem") {
        frameState.interactionInspectionFocus = this.createInspectionFocus(false);
      }
      return;
    }

    // HC031O: this interaction remains an observer of changed world state.
    // It does not create progression. SurfaceWakeGameplaySystem owns the reveal
    // invitation, which may now come from the older safe-material path or from
    // coherent surface → community memory → Host-matter causality.
    const hostContinuation = frameState.surfaceWakeGameplay?.hostContinuationInvitation ?? {};
    this.foldAvailable = Boolean(
      this.completed
      || hostContinuation.open
      || (
        frameState.nurseryCircuit?.materialPassage?.state === "open"
        && frameState.surfaceWakeGameplay?.materialPassageOpen
      )
    );
    this.emergenceProgress = this.foldAvailable
      ? this.clamp01(this.emergenceProgress + dt / 0.82)
      : 0;
    this.setVisible(this.foldAvailable);
    this.focusDistance = this.foldAvailable
      ? this.playerRoot.position.distanceTo(this.anchor)
      : Infinity;

    if (!this.completed && this.foldAvailable) this.updateStage(dt, frameState);
    this.animate(frameState.runtimeSeconds ?? 0);
    this.publishPromptState(frameState);

    frameState.interactionInspectionFocus = this.createInspectionFocus(this.foldAvailable);
    frameState.surfaceWakeLayeredInteraction = this.createState(true, this.foldAvailable);

    if (frameState.lockState) {
      frameState.lockState.nextIfPasses = this.recipe.completion?.nextRecommendedPass ?? "HC-006F — Guide Threshold Interaction Retrofit";
    }
  }

  isInCell(frameState) {
    return frameState.activeCellId === (this.recipe?.activation?.requiresActiveCell ?? CELL_ID);
  }

  updateStage(dt, frameState) {
    const geometry = this.recipe.geometry ?? {};
    const timing = this.recipe.timing ?? {};
    const pulseEventId = frameState.input?.pulseEventId ?? 0;
    const freshPulse = Boolean(
      frameState.input?.pulsePressed &&
      pulseEventId > 0 &&
      pulseEventId !== this.lastConsumedPulseEventId
    );

    switch (this.stageIndex) {
      case 0: {
        const inRange = this.focusDistance <= (geometry.approachRange ?? 2.85);
        const duration = Math.max(0.1, timing.approachHoldSeconds ?? 0.42);
        this.approachHold = this.clamp01(this.approachHold + (inRange ? dt / duration : -dt * 0.65));
        this.lastInteraction = inRange ? "presence_reading_surface_wake" : "approach_listening_fold";
        if (this.approachHold >= 0.999) this.advanceStage(frameState.runtimeSeconds ?? 0, "approach_read_complete");
        break;
      }
      case 1: {
        const inRange = this.focusDistance <= (geometry.interactionRange ?? 2.35);
        if (freshPulse && inRange) {
          this.consumePulse(frameState, "first_answer_revealed_not_consumed");
          this.advanceStage(frameState.runtimeSeconds ?? 0, "surface_wake_observed");
        } else if (freshPulse && !inRange) {
          this.lastInteraction = "pulse_read_world_not_listening_fold_yet";
        }
        break;
      }
      case 2: {
        const inRange = this.focusDistance <= (geometry.sustainRange ?? 2.7);
        const held = this.isContextHeld(frameState);
        const sustainSeconds = Math.max(0.25, timing.sustainSeconds ?? 1.35);
        const decay = timing.outOfRangeDecayPerSecond ?? 0.22;

        if (inRange && held) {
          this.resonanceHold = this.clamp01(this.resonanceHold + dt / sustainSeconds);
          this.tissueResponse = this.clamp01(this.tissueResponse + dt / (sustainSeconds * 0.86));
          this.lastInteraction = "first_resonance_sustained";
        } else {
          this.resonanceHold = this.clamp01(this.resonanceHold - dt * decay);
          this.lastInteraction = !inRange ? "sustain_paused_move_closer" : "hold_A_or_F_to_sustain_not_absorb";
        }

        if (this.resonanceHold >= 0.999) {
          this.tissueResponse = 1;
          this.advanceStage(frameState.runtimeSeconds ?? 0, "sustained_answer_visible");
        }
        break;
      }
      case 3: {
        const responseSeconds = Math.max(0.2, timing.responseSeconds ?? 0.62);
        this.responseProgress = this.clamp01(this.responseProgress + dt / responseSeconds);
        this.lastInteraction = "watching_membrane_answer_travel";
        if (this.responseProgress >= 0.999) {
          this.advanceStage(frameState.runtimeSeconds ?? 0, "visible_response_complete_release_required");
        }
        break;
      }
      case 4: {
        const held = this.isContextHeld(frameState);
        const settleSeconds = Math.max(0.25, timing.releaseSettleSeconds ?? 0.95);
        if (!held) {
          this.settleProgress = this.clamp01(this.settleProgress + dt / settleSeconds);
          this.lastInteraction = "resonance_released_surface_wake_settling";
        } else {
          this.lastInteraction = "release_A_or_F_before_settle";
        }
        if (this.settleProgress >= 0.999) {
          this.completed = true;
          this.stageIndex = 5;
          this.grammar?.setAuthoredIndex(5, frameState.runtimeSeconds ?? 0, "surface_wake_language_learned");
          this.lastInteraction = "surface_wake_language_learned_safe_seed_readable";
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
      pass: "HC-006EA",
      eventId,
      source: frameState.input?.pulseSource ?? audit.source ?? "unknown",
      consumedBy: "SurfaceWakeLayeredInteractionSystem",
      consumedAtFrame: frameState.frame ?? -1,
      consumedTargetId: this.recipe.focusObjectId ?? "surface_wake_listening_fold_001",
      result
    };
  }

  advanceStage(runtimeSeconds, interaction) {
    this.stageIndex = Math.min(5, this.stageIndex + 1);
    this.grammar?.setAuthoredIndex(this.stageIndex, runtimeSeconds, interaction);
    this.lastInteraction = interaction;
  }

  createVisual() {
    const geometry = this.recipe.geometry ?? {};
    const visual = this.recipe.visual ?? {};
    const radius = geometry.foldRadius ?? 0.34;

    this.root = new THREE.Group();
    this.root.name = "surface_wake_layered_interaction_HC006E";
    this.root.userData.system = "SurfaceWakeLayeredInteractionSystem";
    this.root.userData.targetingSuppressed = true;
    this.root.userData.routeActivation = false;
    this.scene.add(this.root);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: visual.membraneColor ?? 0xadd0e6,
      emissive: visual.signalColor ?? 0xaaefff,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.58,
      roughness: 0.35,
      metalness: 0,
      transmission: 0.12,
      depthWrite: false
    });
    this.foldCore = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI * 1.68), coreMaterial);
    this.foldCore.name = this.recipe.focusObjectId ?? "surface_wake_listening_fold_001";
    this.foldCore.position.copy(this.anchor);
    this.foldCore.scale.set(1.62, 0.38, 1.12);
    this.foldCore.rotation.set(-0.08, 0.28, -0.18);
    this.foldCore.renderOrder = visual.renderOrder ?? 8;
    this.foldCore.userData.inspectionNeverFade = true;
    this.foldCore.userData.targetingSuppressed = true;
    this.root.add(this.foldCore);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: visual.memoryColor ?? 0xffdca8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.readingRing = new THREE.Mesh(
      new THREE.TorusGeometry(geometry.readingRingRadius ?? 0.56, 0.016, 8, 72),
      ringMaterial
    );
    this.readingRing.position.copy(this.anchor);
    this.readingRing.rotation.x = Math.PI / 2;
    this.readingRing.renderOrder = (visual.renderOrder ?? 8) + 1;
    this.root.add(this.readingRing);

    const lobeCount = Math.max(3, geometry.lobeCount ?? 5);
    for (let index = 0; index < lobeCount; index += 1) {
      const angle = (index / lobeCount) * Math.PI * 2;
      const lobeMaterial = new THREE.MeshPhysicalMaterial({
        color: index % 2 === 0 ? (visual.membraneColor ?? 0xadd0e6) : (visual.signalColor ?? 0xaaefff),
        emissive: visual.signalColor ?? 0xaaefff,
        emissiveIntensity: 0.06,
        transparent: true,
        opacity: 0.18,
        roughness: 0.48,
        depthWrite: false
      });
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.68, 16, 10), lobeMaterial);
      lobe.name = `surface_wake_membrane_lobe_${String(index + 1).padStart(2, "0")}`;
      lobe.position.copy(this.anchor).add(new THREE.Vector3(Math.cos(angle) * 0.58, Math.sin(angle * 2) * 0.1, Math.sin(angle) * 0.46));
      lobe.scale.set(1.45, 0.28, 0.92);
      lobe.rotation.set(-0.08, angle + 0.32, -0.18);
      lobe.userData.livingTissue = true;
      lobe.userData.inspectionFadeable = true;
      this.root.add(lobe);
      this.lobes.push(lobe);
    }

    const responseRingCount = Math.max(2, geometry.responseRingCount ?? 3);
    for (let index = 0; index < responseRingCount; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? (visual.signalColor ?? 0xaaefff) : (visual.memoryColor ?? 0xffdca8),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry((geometry.readingRingRadius ?? 0.56) * (1.25 + index * 0.28), 0.011, 8, 72),
        material
      );
      ring.position.copy(this.anchor);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = index * 0.48;
      ring.userData.livingTissue = true;
      ring.userData.inspectionFadeable = true;
      this.root.add(ring);
      this.responseRings.push(ring);
    }

    const tendrilCount = Math.max(4, geometry.tendrilCount ?? 7);
    for (let index = 0; index < tendrilCount; index += 1) {
      const angle = (index / tendrilCount) * Math.PI * 2;
      const end = this.anchor.clone().add(new THREE.Vector3(Math.cos(angle) * (1.12 + (index % 2) * 0.2), -0.18 + Math.sin(angle * 1.7) * 0.22, Math.sin(angle) * (0.88 + (index % 3) * 0.12)));
      const curve = new THREE.CatmullRomCurve3([
        this.anchor.clone(),
        this.anchor.clone().lerp(end, 0.36).add(new THREE.Vector3(0, 0.12 * Math.sin(index), 0.05)),
        this.anchor.clone().lerp(end, 0.72).add(new THREE.Vector3(0.06 * Math.cos(index), -0.05, 0)),
        end
      ], false, "catmullrom", 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? (visual.signalColor ?? 0xaaefff) : (visual.memoryColor ?? 0xffdca8),
        transparent: true,
      opacity: 0.045,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const tendril = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.009, 5, false), material);
      tendril.name = `surface_wake_tendril_${String(index + 1).padStart(2, "0")}`;
      tendril.userData.livingTissue = true;
      tendril.userData.inspectionFadeable = true;
      this.root.add(tendril);
      this.tendrils.push(tendril);
    }

    this.light = new THREE.PointLight(visual.signalColor ?? 0xaaefff, 0.3, 4.2, 2);
    this.light.position.copy(this.anchor);
    this.root.add(this.light);
  }

  animate(runtimeSeconds) {
    const visual = this.recipe.visual ?? {};
    const breathe = 1 + Math.sin(runtimeSeconds * 2.2) * 0.06;
    const energy = this.completed
      ? 0.62
      : this.stageIndex >= 3
        ? 0.55 + this.responseProgress * 0.3
        : this.stageIndex >= 2
          ? 0.32 + this.resonanceHold * 0.58
          : 0.18 + this.approachHold * 0.22;

    const emergence = this.completed ? 1 : this.emergenceProgress;
    const invitation = this.frameState.surfaceWakeGameplay?.hostContinuationInvitation ?? {};
    const openedAt = Number(invitation.openedAt ?? -1);
    const routeCueAge = invitation.open && openedAt >= 0 ? Math.max(0, runtimeSeconds - openedAt) : Infinity;
    const routeCueWindowSeconds = 5.5;
    const routeCue01 = !this.completed && this.stageIndex === 0 && routeCueAge <= routeCueWindowSeconds
      ? this.clamp01(1 - routeCueAge / routeCueWindowSeconds)
      : 0;
    const routeCuePulse01 = routeCue01 * (0.62 + (Math.sin(runtimeSeconds * 5.2) * 0.5 + 0.5) * 0.38);
    const emergenceScale = 0.52 + emergence * 0.48;
    this.foldCore.scale.set(
      1.62 * breathe * emergenceScale,
      0.38 * breathe * emergenceScale,
      1.12 * breathe * emergenceScale
    );
    this.foldCore.material.emissiveIntensity = 0.1 + energy * 0.62 + routeCuePulse01 * 0.44;
    this.foldCore.material.opacity = (0.42 + energy * 0.28 + routeCue01 * 0.08) * emergence;

    this.readingRing.rotation.z += 0.006 + energy * 0.008 + routeCue01 * 0.006;
    this.readingRing.scale.setScalar(
      0.94 + Math.sin(runtimeSeconds * 2.9) * 0.04 + energy * 0.12 + routeCuePulse01 * 0.16
    );
    const readingActive = !this.completed && this.stageIndex >= 1 && this.stageIndex <= 2;
    this.readingRing.material.opacity = routeCue01 > 0
      ? (0.1 + routeCuePulse01 * 0.32) * emergence
      : readingActive
        ? 0.035 + energy * 0.22
        : 0;

    this.lobes.forEach((lobe, index) => {
      const wave = 1 + Math.sin(runtimeSeconds * 1.7 + index * 0.72) * 0.07;
      lobe.scale.set(1.45 * wave, 0.28 * wave, 0.92 * wave);
      lobe.material.opacity = (0.2 + energy * 0.18 + routeCue01 * 0.07) * emergence;
      lobe.material.emissiveIntensity = 0.03 + energy * 0.18 + routeCuePulse01 * 0.16;
    });

    this.responseRings.forEach((ring, index) => {
      const responseActive = !this.completed && this.stageIndex >= 3 && this.stageIndex <= 4;
      const response = responseActive
        ? Math.max(this.tissueResponse, this.responseProgress, this.settleProgress * 0.74)
        : 0;
      const wave = 0.74 + Math.sin(runtimeSeconds * 2 - index * 0.64) * 0.18;
      ring.scale.setScalar(0.92 + response * (0.2 + index * 0.08));
      ring.rotation.z += 0.003 * (index % 2 === 0 ? 1 : -1);
      ring.material.opacity = (visual.responseOpacity ?? 0.48) * response * wave;
      if (this.completed) ring.material.color.set(visual.settledColor ?? 0xceffde);
    });

    this.tendrils.forEach((tendril, index) => {
      const response = this.completed
        ? 0
        : Math.max(this.resonanceHold, this.tissueResponse, this.responseProgress);
      tendril.material.opacity = (
        0.025 + response * (0.16 + Math.sin(runtimeSeconds * 2.7 - index * 0.5) * 0.04)
      ) * emergence;
    });

    if (this.light) this.light.intensity = (0.15 + energy * 0.85 + routeCuePulse01 * 0.72) * emergence;

    if (this.root) {
      this.root.userData.routeCueActive = routeCue01 > 0.01;
      this.root.userData.routeCueTargetId = this.recipe?.focusObjectId ?? "surface_wake_listening_fold_001";
      this.root.userData.routeCueMode = routeCue01 > 0.01 ? "existing_fold_reveal_pulse" : "none";
      this.root.userData.routeCueAgeSeconds = Number.isFinite(routeCueAge) ? Number(routeCueAge.toFixed(3)) : -1;
      this.root.userData.addsRouteGeometry = false;
    }
  }

  publishPromptState(frameState) {
    frameState.promptStack = {
      ...(frameState.promptStack ?? {}),
      surfaceWakeLayeredInteraction: this.completed
        ? "surface_wake_language_learned_safe_seed_readable"
        : !this.foldAvailable
          ? "surface_wake_nursery_agency_pending"
          : `surface_wake_${this.currentStage()?.id ?? "waiting"}`,
      note: this.foldAvailable
        ? "The existing HC-006E Fold sequence is available without changed requirements."
        : "HC-009E keeps the Fold latent until a deliberate nursery intervention succeeds."
    };
  }

  currentStage() {
    return this.recipe?.stages?.[this.stageIndex] ?? this.recipe?.stages?.[0] ?? null;
  }

  overallProgress() {
    if (this.completed) return 1;
    if (this.stageIndex === 0) return this.approachHold * 0.14;
    if (this.stageIndex === 1) return 0.18;
    if (this.stageIndex === 2) return 0.2 + this.resonanceHold * 0.34;
    if (this.stageIndex === 3) return 0.56 + this.responseProgress * 0.18;
    if (this.stageIndex === 4) return 0.76 + this.settleProgress * 0.23;
    return 0;
  }

  createState(active, foldAvailable = this.foldAvailable) {
    const stage = this.currentStage();
    const geometry = this.recipe?.geometry ?? {};
    const inApproachRange = this.focusDistance <= (geometry.approachRange ?? 2.85);
    const inInteractionRange = this.focusDistance <= (geometry.interactionRange ?? 2.55);
    const expectsPulse = Boolean(active && this.stageIndex === 1 && !this.completed);
    const expectsHold = Boolean(active && this.stageIndex === 2 && !this.completed);
    const expectsRelease = Boolean(active && this.stageIndex === 4 && !this.completed);

    return {
      pass: "HC-006EA",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      stage: active && !foldAvailable
        ? "nursery_agency_pending"
        : active
        ? (stage?.id ?? "approach_listening_fold")
        : this.completed
          ? "surface_wake_complete_retained"
          : "surface_wake_inactive",
      stageIndex: this.completed ? 5 : active ? this.stageIndex : 0,
      status: this.completed
        ? active
          ? "surface_wake_language_learned"
          : "surface_wake_language_learned_retained"
        : !foldAvailable
          ? "listening_fold_latent_until_host_or_material_answer"
          : "surface_wake_layered_interaction_in_progress",
      progress: active ? this.overallProgress() : this.completed ? 1 : 0,
      ready: Boolean(active && foldAvailable && (inApproachRange || this.stageIndex > 0)),
      completed: Boolean(this.completed),
      foldAvailable: Boolean(foldAvailable),
      foldEmergenceProgress: foldAvailable ? this.emergenceProgress : 0,
      directionalCueActive: Boolean(active && this.root?.userData?.routeCueActive),
      directionalCueTargetId: active ? (this.root?.userData?.routeCueTargetId ?? "none") : "none",
      directionalCueMode: active ? (this.root?.userData?.routeCueMode ?? "none") : "none",
      emergedFromNurseryAgency: Boolean(foldAvailable && this.frameState.nurseryCircuit?.agencyProven),
      emergedFromMaterialPassage: Boolean(
        foldAvailable
        && this.frameState.nurseryCircuit?.materialPassage?.state === "open"
        && this.frameState.surfaceWakeGameplay?.materialPassageOpen
      ),
      emergedFromHostRelationship: Boolean(
        foldAvailable
        && this.frameState.surfaceWakeGameplay?.hostContinuationInvitation?.relationshipProof
      ),
      emergenceCause: foldAvailable
        ? (this.frameState.surfaceWakeGameplay?.hostContinuationInvitation?.cause ?? "retained_completion")
        : "none",
      progressionObservation: {
        mode: "observe_world_state",
        observedState: this.frameState.surfaceWakeGameplay?.hostContinuationInvitation?.open
          ? "host_continuation_invitation_open"
          : this.frameState.surfaceWakeGameplay?.materialPassageOpen
            ? "surface_membrane_passage_open"
            : "host_continuation_not_yet_readable",
        createsWorldState: false,
        createsCrossingPermission: false
      },
      emergenceOwner: "SurfaceWakeGameplaySystem",
      interactionRequirementsChanged: true,
      sourceCellId: CELL_ID,
      activeCellConfirmed: Boolean(active && this.frameState.activeCellId === CELL_ID),
      currentFocus: active && foldAvailable ? (this.recipe?.focusObjectId ?? "surface_wake_listening_fold_001") : "none",
      focusObjectId: active && foldAvailable ? (this.recipe?.focusObjectId ?? "surface_wake_listening_fold_001") : "none",
      focusVisualOnly: true,
      focusDistance: active && foldAvailable ? this.focusDistance : 0,
      focusReady: Boolean(active && foldAvailable && inInteractionRange),
      targetRequired: false,
      inputRequired: Boolean(active && foldAvailable && !this.completed && this.stageIndex > 0 && this.stageIndex !== 3),
      movementRequired: Boolean(active && (foldAvailable ? this.stageIndex === 0 : true)),
      expectsPulse: Boolean(foldAvailable && expectsPulse),
      expectsHold: Boolean(foldAvailable && expectsHold),
      expectsRelease: Boolean(foldAvailable && expectsRelease),
      approachHold: active ? this.approachHold : 0,
      resonanceHold: active ? this.resonanceHold : 0,
      tissueResponse: active ? Math.max(this.tissueResponse, this.responseProgress) : 0,
      responseProgress: active ? this.responseProgress : 0,
      settleProgress: active ? this.settleProgress : 0,
      lastInteraction: active ? this.lastInteraction : this.completed ? "surface_wake_completion_retained" : "none",
      safeSeedReadable: Boolean(this.completed),
      safeSeedAbsorbUnlocked: Boolean(this.completed),
      blocksSafeSeedAbsorb: Boolean(active && !this.completed),
      hudStatus: active && !foldAvailable
        ? "Surface Wake: Host continuation still latent"
        : active
        ? `Surface Wake: ${stage?.id ?? "listening fold"}`
        : this.completed
          ? "Surface Wake: lesson complete / retained"
          : "Surface Wake: inactive",
      guideLine: active && !foldAvailable
        ? "The deeper Fold has not answered yet. Work through the surface, community, or moving matter until the Host carries the response forward."
        : active
        ? (stage?.guideLine ?? "The listening fold is waiting.")
        : this.completed
          ? "The first tissue language remains learned."
          : "The Surface Wake lesson belongs to the opening cell.",
      objectiveLine: active && !foldAvailable
        ? "Establish a coherent relationship here and watch what the Host retains—or change the moving matter until the tissue opens."
        : active
        ? (stage?.objectiveLine ?? "Approach the listening fold.")
        : this.completed
          ? "Continue with the learned interaction language."
          : "Return to Surface Wake.",
      nextAction: active && !foldAvailable
        ? "Brace into the Host and let a relationship persist, or resolve a safe moving-matter cycle."
        : active
        ? (stage?.nextAction ?? "Approach the listening fold.")
        : this.completed
          ? "Continue; Surface Wake completion is retained."
          : "Return to the opening cell.",
      blocker: active && !foldAvailable ? "host_continuation_not_yet_revealed" : "none_detected",
      routeActivated: false,
      thresholdOpened: false,
      activeCellChanges: false,
      noGate: true,
      noDoor: true,
      noTeleport: true,
      noBranchMenu: true,
      noCombat: true,
      inspectionCameraPass: "HC-006D",
      inspectionCameraAvailable: Boolean(this.frameState.inspectionCamera?.available ?? this.frameState.tightInspectionCamera?.available),
      inspectionCameraActive: Boolean(this.frameState.inspectionCamera?.active ?? this.frameState.tightInspectionCamera?.active),
      foundationalGrammar: this.grammar?.snapshot({
        progress: active ? this.overallProgress() : this.completed ? 1 : 0,
        completed: Boolean(this.completed),
        introducedAtSurfaceWake: true
      }) ?? null
    };
  }

  createInspectionFocus(active) {
    const inspection = this.recipe?.inspection ?? {};
    return {
      architecturePass: "HC-006EA",
      providerId: "SurfaceWakeLayeredInteractionSystem",
      id: active ? (this.recipe?.focusObjectId ?? "surface_wake_listening_fold_001") : "none",
      label: "Surface Wake listening fold",
      active: Boolean(active),
      inspectable: Boolean(active),
      requiredCellId: CELL_ID,
      position: { x: this.anchor.x, y: this.anchor.y, z: this.anchor.z },
      distance: active ? this.focusDistance : Infinity,
      toggleRange: inspection.toggleRange ?? 4.4,
      autoExitRange: inspection.autoExitRange ?? 5.9,
      camera: {
        distance: inspection.distance ?? 4.35,
        fieldOfView: inspection.fieldOfView ?? 54,
        targetBlendTowardFocus: inspection.targetBlendTowardFocus ?? 0.69,
        targetLift: inspection.targetLift ?? 0.1,
        baseHeight: inspection.baseHeight ?? 0.88,
        pitch: inspection.pitch ?? 0.22,
        shoulderOffset: inspection.shoulderOffset ?? 0.58,
        forwardOffset: inspection.forwardOffset ?? 0.12
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
