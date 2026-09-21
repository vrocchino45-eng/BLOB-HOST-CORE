import * as THREE from "three";

export class ScarFlowInteractionSystem {
  constructor({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState }) {
    if (!recipeDataSystem) throw new Error("[ScarFlowInteractionSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[ScarFlowInteractionSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[ScarFlowInteractionSystem] playerRoot is required.");
    if (!scene) throw new Error("[ScarFlowInteractionSystem] scene is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.scene = scene;
    this.frameState = frameState;

    this.cellId = "CELL_SCAR_FLOW_FOLD_001";
    this.recipe = null;
    this.stageIndex = 0;
    this.stageId = "not_started";
    this.progress = 0;
    this.preparedForNextBranch = false;
    this.memoryRead = false;
    this.pathAligned = false;
    this.pressureRelieved = false;
    this.clotRespected = false;
    this.lastInteraction = "none";
    this.nextAction = "complete the local cell morph first";
    this.currentFocus = "none";
    this.focusDistance = 0;
    this.focusRing = null;
    this.focusLine = null;
    this.linePositions = new Float32Array(6);
  }

  init() {
    this.recipe = this.recipeDataSystem.get("scarFlowInteractionRecipes", "SCAR_FLOW_LOOP_001");
    this.createVFX();
    this.frameState.scarFlowInteraction = this.createState(false);
  }

  update(dt, frameState) {
    const active = Boolean(frameState.localCellMorph?.completed && frameState.activeCellId === this.cellId);

    if (!active) {
      this.updateVFX(null, false, frameState);
      frameState.scarFlowInteraction = this.createState(false);
      return;
    }

    const gameplay = frameState.guideThresholdGameplay ?? {};
    if (gameplay.active && !gameplay.triggerReady) {
      this.stageIndex = 0;
      this.stageId = "guide_threshold_gameplay_compatibility";
      this.progress = Number(gameplay.familiarity ?? 0);
      this.preparedForNextBranch = false;
      this.currentFocus = "none";
      this.focusDistance = 0;
      this.lastInteraction = gameplay.lastInteraction ?? "guide_threshold_gameplay_owns_scar_flow";
      this.nextAction = gameplay.nextAction ?? "Explore the living current before the authored threshold reading begins.";
      this.updateVFX(null, false, frameState);
      frameState.scarFlowInteraction = this.createState(true, {
        compatibilityOnly: true,
        ownershipDeferredTo: "GuideThresholdGameplaySystem"
      });
      return;
    }

    const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
    if (guideThreshold.active || guideThreshold.completed) {
      this.syncFromGuideThreshold(guideThreshold);
      this.updateVFX(null, false, frameState);
      frameState.scarFlowInteraction = this.createState(true, {
        compatibilityOnly: true,
        ownershipDeferredTo: "GuideThresholdLayeredInteractionSystem"
      });
      return;
    }

    this.syncStageFromCompletion(frameState);
    const focus = this.findStageFocus();
    this.currentFocus = focus?.recipe.id ?? "none";
    this.focusDistance = focus?.distance ?? 0;

    if (frameState.input?.pulsePressed) {
      this.applyPulseInteraction(frameState, focus);
    }

    this.applyProximityInteraction(dt, frameState, focus);
    this.updateProgress(frameState);
    this.nextAction = this.buildNextAction(frameState, focus);
    this.updateVFX(focus, true, frameState);
    this.applyWorldFeedback(frameState);

    frameState.scarFlowInteraction = this.createState(true);
  }


  syncFromGuideThreshold(guideThreshold) {
    const stageIndex = Number(guideThreshold.stageIndex ?? 0);
    this.memoryRead = stageIndex >= 2 || Boolean(guideThreshold.completed);
    this.pathAligned = stageIndex >= 3 || Boolean(guideThreshold.completed);
    this.pressureRelieved = stageIndex >= 4 || Boolean(guideThreshold.completed);
    this.clotRespected = stageIndex >= 5 || Boolean(guideThreshold.completed);
    this.preparedForNextBranch = Boolean(guideThreshold.completed || guideThreshold.transitionReady);
    this.stageIndex = this.preparedForNextBranch ? 4 : Math.min(3, Math.max(0, stageIndex - 1));
    this.stageId = this.preparedForNextBranch ? "scar_flow_stable" : "guide_threshold_layered_compatibility";
    this.progress = Number.isFinite(guideThreshold.progress) ? guideThreshold.progress : 0;
    this.currentFocus = "none";
    this.focusDistance = Number(guideThreshold.focusDistance ?? 0);
    this.lastInteraction = guideThreshold.lastInteraction ?? "guide_threshold_owns_scar_flow";
    this.nextAction = guideThreshold.nextAction ?? "Follow the Guide Threshold layered traversal.";
  }

  syncStageFromCompletion(frameState) {
    const completion = frameState.morphCompletion ?? {};
    const thresholds = this.recipe?.completionThresholds ?? {};

    this.memoryRead = Boolean(this.memoryRead || completion.memoryEcho >= (thresholds.memoryEcho ?? 0.22));
    this.pathAligned = Boolean(this.pathAligned || completion.pathConfidence >= (thresholds.pathConfidence ?? 0.28));
    this.pressureRelieved = Boolean(this.pressureRelieved || completion.pressureRelief >= (thresholds.pressureRelief ?? 0.26));
    this.clotRespected = Boolean(this.clotRespected || (this.pathAligned && completion.clotWarning <= (thresholds.clotWarningMax ?? 0.4) && completion.stability >= 0.45));

    if (!this.memoryRead) {
      this.stageIndex = 0;
      this.stageId = "memory_read";
    } else if (!this.pathAligned) {
      this.stageIndex = 1;
      this.stageId = "path_aligned";
    } else if (!this.pressureRelieved) {
      this.stageIndex = 2;
      this.stageId = "pressure_relieved";
    } else if (!this.clotRespected) {
      this.stageIndex = 3;
      this.stageId = "clot_respected";
    } else {
      this.stageIndex = 4;
      this.stageId = "scar_flow_stable";
    }

    this.preparedForNextBranch = this.stageId === "scar_flow_stable" && Boolean(completion.safeToExpand || completion.stability >= (thresholds.stability ?? 0.55));
  }

  findStageFocus() {
    const stage = this.currentStageRecipe();
    const preferredId = stage?.sourceObject;
    let best = null;

    for (const item of this.chemObjectSystem.objects) {
      if (item.cellId !== this.cellId) continue;
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;

      const distance = this.playerRoot.position.distanceTo(item.root.position);
      let priority = Math.max(0, 5.5 - distance);
      if (item.recipe.id === preferredId) priority += 8;
      if (this.stageId === "scar_flow_stable" && item.recipe.id === "pressure_fold_current_001") priority += 4;
      if (item.recipe.id === "scar_flow_clot_001" && !this.pathAligned) priority -= 3;

      if (!best || priority > best.priority) best = { ...item, distance, priority };
    }

    return best;
  }

  applyPulseInteraction(frameState, focus) {
    if (!focus || focus.distance > 4.0) return;

    const id = focus.recipe.id;
    const completion = frameState.morphCompletion ?? {};

    if (id === "scar_memory_fleck_001") {
      this.memoryRead = true;
      this.lastInteraction = "memory_read_by_pulse";
    } else if (id === "resonant_path_thread_001") {
      this.pathAligned = true;
      this.lastInteraction = "path_aligned_by_signal_pulse";
    } else if (id === "pressure_fold_current_001") {
      this.pressureRelieved = true;
      this.lastInteraction = "pressure_current_answered_pulse";
    } else if (id === "scar_flow_clot_001") {
      if (this.pathAligned && completion.pressureRelief >= 0.12) {
        this.clotRespected = true;
        this.lastInteraction = "clot_respected_after_path_read";
      } else {
        this.lastInteraction = "clot_warned_before_path_ready";
      }
    }

    focus.root.userData.lastPulseResponse = `scar_flow_loop:${this.lastInteraction}`;
    focus.root.userData.interactionStage = this.stageId;
  }

  applyProximityInteraction(dt, frameState, focus) {
    if (!focus) return;

    if (focus.recipe.id === "pressure_fold_current_001" && focus.distance < 1.9) {
      if (this.pathAligned) {
        this.pressureRelieved = true;
        this.lastInteraction = "pressure_relieved_by_riding_current";
      }
    }

    if (focus.recipe.id === "scar_flow_clot_001" && frameState.input?.absorbHeld) {
      this.lastInteraction = "unsafe_absorb_on_clot_resisted";
      this.clotRespected = false;
      if (frameState.morphCompletion) {
        frameState.morphCompletion.clotWarning = Math.min(1, (frameState.morphCompletion.clotWarning ?? 0) + dt * 0.30);
      }
    }
  }

  updateProgress(frameState) {
    const completion = frameState.morphCompletion ?? {};
    const stageScore = [this.memoryRead, this.pathAligned, this.pressureRelieved, this.clotRespected].filter(Boolean).length / 4;
    const stabilityScore = Math.min(1, (completion.stability ?? 0) / 0.62) * 0.22;
    const warningPenalty = Math.min(0.18, (completion.clotWarning ?? 0) * 0.14);
    this.progress = Math.max(0, Math.min(1, stageScore * 0.78 + stabilityScore - warningPenalty));

    if (this.progress >= 0.82 && (completion.stability ?? 0) >= 0.50 && this.clotRespected) {
      this.preparedForNextBranch = true;
    }
  }

  applyWorldFeedback(frameState) {
    if (!frameState.morphCompletion) return;

    if (this.preparedForNextBranch) {
      frameState.morphCompletion.safeToExpand = true;
      frameState.morphCompletion.nextAction = "scar-flow fold is stable — plan the next morph branch";
      if (frameState.lockState) frameState.lockState.nextIfPasses = "HC-003N Opening Slice Gold Candidate — continue required chain";
    }
  }

  buildNextAction(frameState, focus) {
    const completion = frameState.morphCompletion ?? {};

    if (this.preparedForNextBranch) return "The scar-flow fold is stable. The next branch can be planned.";
    if (!focus) return "Find the scar-flow memory, path, current, or clot.";

    if (!this.memoryRead) return "Pulse the memory fleck; do not absorb the scar — read it first.";
    if (!this.pathAligned) return "Pulse the resonant path thread; let signal draw a safe route.";
    if (!this.pressureRelieved) return "Ride or pulse the pressure current until the fold breathes.";
    if (!this.clotRespected) {
      if ((completion.clotWarning ?? 0) > 0.55) return "Back away from the clot. Let warning cool before pulsing again.";
      return "Do not absorb the clot. Pulse it only after the path is readable.";
    }

    return "Scar-flow fold is stabilizing. Stay with the pressure until it settles.";
  }

  currentStageRecipe() {
    const stages = this.recipe?.stages ?? [];
    return stages[Math.min(this.stageIndex, stages.length - 1)] ?? null;
  }

  createVFX() {
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd49a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    this.focusRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.012, 8, 96), ringMat);
    this.focusRing.name = "scar_flow_interaction_stage_ring";
    this.focusRing.rotation.x = Math.PI / 2;
    this.focusRing.visible = false;
    this.scene.add(this.focusRing);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffd49a, transparent: true, opacity: 0 });
    this.focusLine = new THREE.Line(geometry, lineMat);
    this.focusLine.name = "scar_flow_interaction_stage_line";
    this.focusLine.visible = false;
    this.scene.add(this.focusLine);
  }

  updateVFX(focus, active, frameState) {
    if (!this.focusRing || !this.focusLine) return;

    if (!active || !focus) {
      this.focusRing.visible = false;
      this.focusLine.visible = false;
      return;
    }

    const t = frameState.runtimeSeconds ?? 0;
    this.focusRing.visible = true;
    this.focusRing.position.copy(focus.root.position);
    this.focusRing.position.y += 0.04;
    this.focusRing.scale.setScalar(1 + Math.sin(t * 3.8) * 0.07 + this.progress * 0.25);
    this.focusRing.rotation.z += 0.02;
    this.focusRing.material.opacity = 0.22 + this.progress * 0.32;

    this.focusLine.visible = focus.distance < 5.5;
    this.linePositions[0] = this.playerRoot.position.x;
    this.linePositions[1] = this.playerRoot.position.y;
    this.linePositions[2] = this.playerRoot.position.z;
    this.linePositions[3] = focus.root.position.x;
    this.linePositions[4] = focus.root.position.y;
    this.linePositions[5] = focus.root.position.z;
    this.focusLine.geometry.attributes.position.needsUpdate = true;
    this.focusLine.material.opacity = Math.max(0, 0.10 + this.progress * 0.24 - focus.distance * 0.02);
  }

  createState(active, compatibility = {}) {
    return {
      active,
      loopId: active ? this.recipe?.id ?? "SCAR_FLOW_LOOP_001" : "none",
      stage: active ? this.stageId : "inactive",
      stageIndex: active ? this.stageIndex : 0,
      progress: active ? this.progress : 0,
      memoryRead: active && this.memoryRead,
      pathAligned: active && this.pathAligned,
      pressureRelieved: active && this.pressureRelieved,
      clotRespected: active && this.clotRespected,
      preparedForNextBranch: active && this.preparedForNextBranch,
      currentFocus: active ? this.currentFocus : "none",
      focusDistance: active ? this.focusDistance : 0,
      lastInteraction: active ? this.lastInteraction : "none",
      nextAction: active ? this.nextAction : "complete the local cell morph first",
      compatibilityOnly: Boolean(compatibility.compatibilityOnly),
      ownershipDeferredTo: compatibility.ownershipDeferredTo ?? "none"
    };
  }
}
