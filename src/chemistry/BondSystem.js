import * as THREE from "three";

export class BondSystem {
  constructor({ recipeDataSystem, chemObjectSystem, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[BondSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[BondSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[BondSystem] playerRoot is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.activeTargetId = null;
    this.activeBondId = "none";
    this.strength = 0;
    this.absorbProgress = 0;
    this.bondLine = null;
    this.linePositions = new Float32Array(6);
  }

  init() {
    this.resetFrameBondState(this.frameState);
  }

  update(dt, frameState) {
    this.recoverFirstSliceScar(dt, frameState);
    const safeSeedLocked = Boolean(frameState.surfaceWakeLayeredInteraction?.blocksSafeSeedAbsorb);
    const nearest = this.getTargetCandidate(frameState, { safeSeedLocked });
    this.updateNearestReadout(nearest, frameState);

    if (!nearest) {
      this.clearInteractionAssist(frameState);
      this.decayBond(dt, frameState, "no_target");
      this.updateBondVFX(null, frameState);
      return;
    }

    const bondId = this.pickValidBondId(nearest.recipe);
    if (!bondId) {
      this.clearInteractionAssist(frameState);
      this.decayBond(dt, frameState, "no_valid_bond_recipe");
      this.updateBondVFX(null, frameState);
      return;
    }

    const bondRecipe = this.recipeDataSystem.get("bondRecipes", bondId);
    const behavior = bondRecipe.behavior ?? {};
    const absorbTuning = frameState.controllerOnboarding?.tuning?.absorbAssist ?? {};
    const formationRange = (behavior.formationRange ?? 1.35) + (absorbTuning.formationRangeBonus ?? 0);
    const absorbRange = (behavior.absorbRange ?? 1.05) + (absorbTuning.absorbRangeBonus ?? 0);
    const absorbThreshold = behavior.absorbThreshold ?? 0.5;
    const formationDifficulty = behavior.formationDifficulty ?? 0.5;
    const stability = behavior.stability ?? 0.5;
    const assistRange = (behavior.assistRange ?? Math.max(formationRange + 0.75, absorbRange + 0.55)) + (absorbTuning.assistRangeBonus ?? 0);
    const targetingLock = frameState.targeting?.targetId === nearest.recipe.id
      ? frameState.targeting.lockStrength ?? 0
      : 0;

    const canAbsorb = this.canAbsorb(nearest.recipe, bondId);
    const inputAbsorbHeld = Boolean(frameState.input?.absorbHeld);
    const absorbPhysiology = frameState.corePerformance?.verbModifiers?.absorb ?? {};
    const absorbCommitment01 = this.clamp01(absorbPhysiology.commitment01 ?? 0);
    const absorbRangePhysiology = 1 + absorbCommitment01 * (Math.max(0.74, absorbPhysiology.powerMultiplier ?? 1) - 1) * 0.18;
    const effectiveFormationRange = inputAbsorbHeld && canAbsorb
      ? Math.max(formationRange, assistRange)
      : formationRange + targetingLock * (0.85 + (absorbTuning.targetLockRangeBonus ?? 0));
    const effectiveAbsorbRange = (absorbRange + targetingLock * (0.65 + (absorbTuning.targetLockRangeBonus ?? 0)) + (inputAbsorbHeld && canAbsorb ? 0.52 : 0)) * absorbRangePhysiology;

    this.setInteractionAssist(frameState, nearest, canAbsorb, assistRange);

    const inFormationRange = nearest.distance <= effectiveFormationRange;

    if (!inFormationRange) {
      this.decayBond(dt, frameState, `target_out_of_bond_range:${nearest.distance.toFixed(2)}>${effectiveFormationRange.toFixed(2)}`);
      this.updateBondVFX(null, frameState);
      return;
    }

    if (this.activeTargetId !== nearest.recipe.id || this.activeBondId !== bondId) {
      this.activeTargetId = nearest.recipe.id;
      this.activeBondId = bondId;
      this.strength = Math.min(this.strength, 0.22);
      this.absorbProgress = 0;
    }

    const closeness = 1 - Math.min(nearest.distance / effectiveFormationRange, 1);
    const confirmMultiplier = behavior.confirmationRateMultiplier ?? 1.0;
    const formRate = (0.92 + closeness * 2.15) * (1.08 - formationDifficulty * 0.52) * confirmMultiplier;
    const pressureLoss = (frameState.physicalFeel?.pressure ?? 0) * (1 - stability) * 0.12;

    this.strength = this.clamp01(this.strength + formRate * dt - pressureLoss * dt);

    const readiness = this.clamp01((this.strength - absorbThreshold * 0.55) / Math.max(absorbThreshold, 0.01));

    if (inputAbsorbHeld) {
      this.applyAbsorbHold(dt, nearest, bondRecipe, {
        canAbsorb,
        inAbsorbRange: nearest.distance <= effectiveAbsorbRange || Boolean(frameState.interactionAssist?.active && canAbsorb),
        absorbThreshold,
        readiness,
        frameState
      });
    } else {
      const absorbTuning = frameState.controllerOnboarding?.tuning?.absorbAssist ?? {};
      this.absorbProgress = Math.max(0, this.absorbProgress - dt * (absorbTuning.progressDecayWhenNotHeld ?? 0.55));
    }

    frameState.currentBond = bondId;
    frameState.currentChemTarget = nearest.recipe.id;
    frameState.bondState = {
      active: true,
      objectId: nearest.recipe.id,
      bondId,
      strength: this.strength,
      stability,
      absorbReadiness: readiness,
      absorbProgress: this.absorbProgress,
      compatibility: canAbsorb ? "compatible" : "resists_absorb",
      compositionChord: frameState.verbComposition?.relationshipBound
        && frameState.verbComposition?.targetId === nearest.recipe.id
          ? (frameState.verbComposition?.chord ?? "idle")
          : "unbound",
      compositionTension01: frameState.verbComposition?.relationshipBound
        && frameState.verbComposition?.targetId === nearest.recipe.id
          ? (frameState.verbComposition?.effects?.tension01 ?? 0)
          : 0,
      reactiveStage: frameState.reactiveStateGrammar?.objects?.[nearest.recipe.id]?.stage ?? "coherent",
      reactiveCondition01: frameState.reactiveStateGrammar?.objects?.[nearest.recipe.id]?.condition01 ?? 0,
      responsePersonality: frameState.responsePersonality?.objects?.[nearest.recipe.id]?.family ?? "adaptive_matter",
      responseExpression: frameState.responsePersonality?.objects?.[nearest.recipe.id]?.stageExpression ?? "settled_form",
      message: this.getBondMessage(nearest, bondRecipe, canAbsorb),
      assistRange,
      formationRange: effectiveFormationRange,
      absorbRange: effectiveAbsorbRange,
      blockReason: this.getBlockReason({
        canAbsorb,
        inputAbsorbHeld,
        distance: nearest.distance,
        effectiveFormationRange,
        effectiveAbsorbRange,
        strength: this.strength,
        absorbThreshold
      })
    };

    frameState.chemObjectState.absorbProgress = this.absorbProgress;
    this.updateBondVFX(nearest, frameState);
  }

  getTargetCandidate(frameState, options = {}) {
    const safeSeedLocked = Boolean(options.safeSeedLocked);
    const targetId = frameState.targeting?.active ? frameState.targeting.targetId : null;

    if (targetId && targetId !== "none") {
      const item = this.chemObjectSystem.objects.find((candidate) => {
        return candidate.recipe.id === targetId
          && !candidate.absorbed
          && !candidate.root.userData.absorbed
          && candidate.root.visible;
      });

      if (item && !(safeSeedLocked && item.recipe.id === "dormant_seed_nutrient_001")) {
        return {
          ...item,
          distance: this.playerRoot.position.distanceTo(item.root.position)
        };
      }
    }

    if (!safeSeedLocked) return this.chemObjectSystem.findNearestObject();

    let nearest = null;
    for (const item of this.chemObjectSystem.objects) {
      if (item.recipe.id === "dormant_seed_nutrient_001") continue;
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (!nearest || distance < nearest.distance) nearest = { ...item, distance };
    }
    return nearest;
  }

  updateNearestReadout(nearest, frameState) {
    if (!nearest) {
      frameState.chemObjectState.nearestObject = "none";
      frameState.chemObjectState.nearestDistance = 0;
      frameState.currentChemTarget = "none";
      return;
    }

    frameState.chemObjectState.nearestObject = nearest.recipe.id;
    frameState.chemObjectState.nearestDistance = nearest.distance;

    if (nearest.distance < 2.8) {
      frameState.selectedObject = nearest.root.userData;
    }
  }

  setInteractionAssist(frameState, nearest, canAbsorb, assistRange) {
    const active = nearest.distance <= assistRange;
    frameState.interactionAssist = {
      active,
      objectId: nearest.recipe.id,
      compatible: canAbsorb,
      assistRange,
      distance: nearest.distance,
      position: {
        x: nearest.root.position.x,
        y: nearest.root.position.y,
        z: nearest.root.position.z
      }
    };
  }

  clearInteractionAssist(frameState) {
    frameState.interactionAssist = {
      active: false,
      objectId: "none",
      compatible: false,
      assistRange: 0,
      distance: 0,
      position: null
    };
  }

  pickValidBondId(recipe) {
    for (const id of recipe.chemistry?.bondTypes ?? []) {
      if (this.recipeDataSystem.data.bondRecipes.has(id)) {
        return id;
      }
    }

    return null;
  }

  canAbsorb(recipe, bondId) {
    if (!recipe.behavior?.onAbsorb) return false;
    if (bondId !== "soft_bond") return false;

    const difficulty = recipe.chemistry?.absorbDifficulty ?? 1;
    return difficulty < 0.7;
  }

  applyAbsorbHold(dt, nearest, bondRecipe, context) {
    const { canAbsorb, inAbsorbRange, absorbThreshold, readiness, frameState } = context;
    // HC027K1 HOTFIX1 — physiology must be resolved inside this method scope.
    // J2 originally declared this in update(), which made the committed-Absorb
    // path throw as soon as applyAbsorbHold() reached the physiology terms.
    const absorbPhysiology = frameState.corePerformance?.verbModifiers?.absorb ?? {};
    const composition = frameState.verbComposition ?? {};
    const compositionOwnsTarget = Boolean(
      composition.relationshipBound
      && composition.targetId === nearest.recipe.id
    );
    const compositionEffects = compositionOwnsTarget ? (composition.effects ?? {}) : {};
    const compositionProgress = Math.max(0.2, Math.min(1.2, compositionEffects.absorbProgressMultiplier ?? 1));
    const compositionPull = Math.max(0.1, Math.min(1.2, compositionEffects.absorbPullMultiplier ?? 1));
    const compositionSpin = Math.max(0.1, Math.min(1.2, compositionEffects.absorbSpinMultiplier ?? 1));
    const reactive = frameState.reactiveStateGrammar?.objects?.[nearest.recipe.id] ?? null;
    const reactiveCondition01 = this.clamp01(reactive?.condition01 ?? 0);
    const reactiveProgressMultiplier = Math.max(0.72, 1 - reactiveCondition01 * 0.28);
    const reactivePullMultiplier = Math.max(0.76, 1 - reactiveCondition01 * 0.18);
    const reactiveSpinMultiplier = 1 + reactiveCondition01 * 0.72;
    const personality = frameState.responsePersonality?.objects?.[nearest.recipe.id] ?? nearest.root.userData.responsePersonality ?? {};
    const personalityProgressMultiplier = Math.max(0.82, Math.min(1.12, personality.absorbProgressMultiplier ?? 1));
    const personalityPullMultiplier = Math.max(0.80, Math.min(1.15, personality.absorbPullMultiplier ?? 1));
    const personalitySpinMultiplier = Math.max(0.42, Math.min(1.45, personality.spinMultiplier ?? 1));

    if (!inAbsorbRange) {
      frameState.chemObjectState.pulseResponse = `${nearest.recipe.id}: hold_absorb_to_pull_closer`;
      this.absorbProgress = Math.max(0, this.absorbProgress - dt * 0.08);
      return;
    }

    if (this.strength < absorbThreshold) {
      frameState.chemObjectState.pulseResponse = `${nearest.recipe.id}: forming_soft_bond`;
      this.absorbProgress = Math.max(0, this.absorbProgress - dt * 0.06);
      return;
    }

    if (!canAbsorb) {
      const difficulty = nearest.recipe.chemistry?.absorbDifficulty ?? 1;
      // A resisted hold should warn and scar, but one mistaken long hold must
      // not permanently saturate the first-slice composition readout.
      const scarRisk = Math.min(difficulty * 0.008 * dt, 0.0004);
      frameState.playerComposition.scar = this.clamp01((frameState.playerComposition.scar ?? 0) + scarRisk);
      frameState.chemObjectState.pulseResponse = `${nearest.recipe.id}: resists_absorb`;
      this.absorbProgress = Math.max(0, this.absorbProgress - dt * 0.12);
      return;
    }

    const difficulty = nearest.recipe.chemistry?.absorbDifficulty ?? 0.5;
    const elasticity = bondRecipe.behavior?.elasticity ?? 0.5;
    const multiplier = (bondRecipe.behavior?.confirmationRateMultiplier ?? 1.0) * (frameState.controllerOnboarding?.tuning?.absorbAssist?.progressRateMultiplier ?? 1.0);
    const physiologyRate = this.clamp01(absorbPhysiology.commitment01 ?? 0) > 0.01
      ? Math.max(0.74, Math.min(1.38, absorbPhysiology.progressMultiplier ?? 1))
      : 1;
    const rate = (0.62 + readiness * 1.05 + elasticity * 0.26)
      * (1.14 - difficulty)
      * multiplier
      * physiologyRate
      * compositionProgress
      * reactiveProgressMultiplier
      * personalityProgressMultiplier;
    this.absorbProgress = this.clamp01(this.absorbProgress + rate * dt);
    // HC017A presentation cue: the existing target yields toward the Core as
    // metabolism advances. Gameplay completion remains owned below.
    const physiologyPull = Math.max(0.72, Math.min(1.42, absorbPhysiology.powerMultiplier ?? 1));
    const pullWeight = Math.min(
      0.038,
      dt * (0.22 + this.absorbProgress * 0.52) * physiologyPull * compositionPull * reactivePullMultiplier * personalityPullMultiplier
    );
    nearest.root.position.lerp(this.playerRoot.position, pullWeight);
    nearest.root.rotation.y += dt
      * (0.35 + this.absorbProgress * 1.15)
      * compositionSpin
      * reactiveSpinMultiplier
      * personalitySpinMultiplier;
    frameState.chemObjectState.pulseResponse = compositionOwnsTarget && composition.composed
      ? `${nearest.recipe.id}: ${composition.mode}`
      : `${nearest.recipe.id}: metabolizing_through_${bondRecipe.id}`;

    if (this.absorbProgress >= 1) {
      this.finishAbsorb(nearest, frameState);
    }
  }

  recoverFirstSliceScar(dt, frameState) {
    const firstSliceCells = new Set([
      "CELL_MEMBRANE_NURSERY_001",
      "CELL_SCAR_FLOW_FOLD_001",
      "CELL_SIGNAL_CHORUS_NERVE_001"
    ]);
    if (!firstSliceCells.has(frameState.activeCellId)) return;
    if (frameState.input?.absorbHeld) return;
    const scar = frameState.playerComposition?.scar ?? 0;
    if (scar <= 0.02) return;
    frameState.playerComposition.scar = Math.max(0.02, scar - Math.max(0, dt) * 0.004);
  }

  finishAbsorb(nearest, frameState) {
    const recipe = nearest.recipe;
    const deltas = recipe.effects?.onPlayerComposition ?? {};

    for (const [key, value] of Object.entries(deltas)) {
      const current = frameState.playerComposition[key] ?? 0;
      frameState.playerComposition[key] = this.clamp01(current + value);
    }

    this.chemObjectSystem.markAbsorbed(recipe.id);
    frameState.chemObjectState.absorbedObjects += 1;
    frameState.chemObjectState.pulseResponse = `${recipe.id}: absorbed_via_${this.activeBondId}`;

    this.strength = 0;
    this.absorbProgress = 0;
    this.activeTargetId = null;
    this.activeBondId = "none";
    frameState.currentBond = "none";
    frameState.currentChemTarget = "none";
    this.clearInteractionAssist(frameState);
    this.updateBondVFX(null, frameState);
  }

  decayBond(dt, frameState, reason = "none") {
    this.strength = Math.max(0, this.strength - dt * 1.0);
    this.absorbProgress = Math.max(0, this.absorbProgress - dt * 0.65);

    if (this.strength <= 0.01) {
      this.activeTargetId = null;
      this.activeBondId = "none";
    }

    frameState.currentBond = this.strength > 0.01 ? this.activeBondId : "none";
    frameState.bondState = {
      active: this.strength > 0.01,
      objectId: this.activeTargetId ?? "none",
      bondId: this.activeBondId,
      strength: this.strength,
      stability: 0,
      absorbReadiness: 0,
      absorbProgress: this.absorbProgress,
      compatibility: "none",
      message: reason,
      assistRange: 0,
      formationRange: 0,
      absorbRange: 0,
      blockReason: reason
    };

    frameState.chemObjectState.absorbProgress = this.absorbProgress;
  }

  resetFrameBondState(frameState) {
    frameState.bondState = {
      active: false,
      objectId: "none",
      bondId: "none",
      strength: 0,
      stability: 0,
      absorbReadiness: 0,
      absorbProgress: 0,
      compatibility: "none",
      message: "none",
      assistRange: 0,
      formationRange: 0,
      absorbRange: 0,
      blockReason: "none"
    };
  }

  updateBondVFX(nearest, frameState) {
    if (!nearest || this.strength <= 0.02) {
      if (this.bondLine) this.bondLine.visible = false;
      return;
    }

    if (!this.bondLine) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0xffd4a8,
        transparent: true,
        opacity: 0.72
      });

      this.bondLine = new THREE.Line(geometry, material);
      this.bondLine.name = "active_bond_vfx_line";
      this.chemObjectSystem.visualComposer.scene.add(this.bondLine);
    }

    this.bondLine.visible = true;
    this.linePositions[0] = this.playerRoot.position.x;
    this.linePositions[1] = this.playerRoot.position.y;
    this.linePositions[2] = this.playerRoot.position.z;
    this.linePositions[3] = nearest.root.position.x;
    this.linePositions[4] = nearest.root.position.y;
    this.linePositions[5] = nearest.root.position.z;
    this.bondLine.geometry.attributes.position.needsUpdate = true;

    const color = this.getBondColor(frameState.currentBond);
    this.bondLine.material.color.set(color);
    this.bondLine.material.opacity = 0.24 + this.strength * 0.7;
  }

  getBlockReason({ canAbsorb, inputAbsorbHeld, distance, effectiveFormationRange, effectiveAbsorbRange, strength, absorbThreshold }) {
    if (!canAbsorb) return "target_not_safe_to_absorb";
    if (distance > effectiveFormationRange) return `too_far_for_bond:${distance.toFixed(2)}>${effectiveFormationRange.toFixed(2)}`;
    if (!inputAbsorbHeld) return "hold_A_or_F_to_absorb";
    if (distance > effectiveAbsorbRange) return `pulling_closer:${distance.toFixed(2)}>${effectiveAbsorbRange.toFixed(2)}`;
    if (strength < absorbThreshold) return `bond_forming:${strength.toFixed(2)}<${absorbThreshold.toFixed(2)}`;
    return "absorbing";
  }

  getBondColor(bondId) {
    if (bondId === "scar_bond") return 0xb45b78;
    if (bondId === "resonant_bond") return 0x92ddff;
    return 0xffd2a1;
  }

  getBondMessage(nearest, bondRecipe, canAbsorb) {
    if (!canAbsorb && nearest.recipe.behavior?.onAbsorbAttempt) {
      return `${bondRecipe.id}: strong_but_not_safe_to_absorb`;
    }

    if (canAbsorb) {
      return `${bondRecipe.id}: compatible_metabolic_bond`;
    }

    return `${bondRecipe.id}: contact_only`;
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
