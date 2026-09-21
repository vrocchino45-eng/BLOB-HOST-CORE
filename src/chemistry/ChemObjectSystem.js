import * as THREE from "three";

export class ChemObjectSystem {
  constructor({ recipeDataSystem, visualComposer, playerRoot, localCellRecipe, frameState }) {
    if (!recipeDataSystem) throw new Error("[ChemObjectSystem] recipeDataSystem is required.");
    if (!visualComposer) throw new Error("[ChemObjectSystem] visualComposer is required.");
    if (!playerRoot) throw new Error("[ChemObjectSystem] playerRoot is required.");
    if (!localCellRecipe) throw new Error("[ChemObjectSystem] localCellRecipe is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.visualComposer = visualComposer;
    this.playerRoot = playerRoot;
    this.localCellRecipe = localCellRecipe;
    this.frameState = frameState;

    this.objects = [];
    this.pulseWaves = [];
    this.tempVector = new THREE.Vector3();
    this.absorbProgress = new Map();

    // HC017B: bounded response state affects only presentation children.
    // Gameplay roots remain authoritative for targeting, distance, gates and routes.
    this.responseState = new Map();
    this.responseTemp = new THREE.Vector3();
    this.responseLateral = new THREE.Vector3();
  }

  init() {
    this.spawnCellObjects(this.localCellRecipe, {
      cellId: this.localCellRecipe.id,
      visible: true,
      opacity: 1,
      avoidExisting: true
    });
  }

  spawnCellObjects(cellRecipe, options = {}) {
    const chemObjectIds = cellRecipe.contents?.chemObjects ?? [];
    const spawned = [];

    for (const id of chemObjectIds) {
      const existing = this.objects.find((item) => item.recipe.id === id);
      if (existing && options.avoidExisting !== false) {
        spawned.push(existing);
        continue;
      }

      spawned.push(this.spawnObject(id, {
        cellId: options.cellId ?? cellRecipe.id,
        visible: options.visible ?? true,
        opacity: options.opacity ?? 1,
        morphRole: options.morphRole ?? "cell_object"
      }));
    }

    return spawned;
  }

  spawnObject(id, options = {}) {
    const recipe = this.recipeDataSystem.get("chemObjectRecipes", id);
    const spawn = recipe.spawn ?? {};

    const root = this.visualComposer.compose({
      objectId: recipe.id,
      visualRecipeId: recipe.visual.visualRecipe,
      placeholderRecipeId: recipe.visual.placeholderRecipe,
      position: spawn.position ?? [0, 0, 0],
      scale: spawn.scale ?? 1
    });

    root.userData.chemObjectRecipe = recipe.id;
    root.userData.cellId = options.cellId ?? this.localCellRecipe.id;
    root.userData.morphRole = options.morphRole ?? "cell_object";
    root.userData.domains = recipe.chemistry?.domains ?? [];
    root.userData.bondTypes = recipe.chemistry?.bondTypes ?? [];
    root.userData.absorbDifficulty = recipe.chemistry?.absorbDifficulty ?? 1;
    root.userData.pulseResponse = recipe.behavior?.onPulse ?? "none";
    root.userData.absorbed = false;
    root.visible = options.visible ?? true;

    this.setObjectOpacity(root, options.opacity ?? 1);

    const responsePivot = this.installResponsePivot(root);
    const item = {
      root,
      responsePivot,
      recipe,
      pulseAge: 999,
      absorbed: false,
      cellId: options.cellId ?? this.localCellRecipe.id,
      morphRole: options.morphRole ?? "cell_object"
    };

    this.responseState.set(recipe.id, {
      kick: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      pulseEnergy: 0,
      absorbYield: 0,
      stabilizeOrder: 0
    });

    this.objects.push(item);
    return item;
  }

  installResponsePivot(root) {
    const pivot = new THREE.Group();
    pivot.name = `chem_response_pivot_${root.userData.chemObjectRecipe ?? "unknown"}`;
    pivot.userData.targetingSuppressed = true;

    // Keep the authored root untouched. Move composed visual children under a
    // local response pivot so verb reactions cannot alter gameplay coordinates.
    const children = [...root.children];
    for (const child of children) pivot.add(child);
    root.add(pivot);
    return pivot;
  }

  getResponseState(item) {
    return this.responseState.get(item.recipe.id) ?? null;
  }

  registerPulseResponse(item, strength = 1, reactive = null) {
    const state = this.getResponseState(item);
    if (!state) return;

    this.responseTemp.copy(item.root.position).sub(this.playerRoot.position);
    if (this.responseTemp.lengthSq() < 0.0001) this.responseTemp.set(0, 0.12, -1);
    this.responseTemp.normalize();

    // HC029B: Pulse still asks the whole nearby field a question, but the retained
    // relationship owns the strong directional push. HC030A then lets the target's
    // current condition determine whether that displacement is clean or irregular.
    const responseStrength = Math.max(0, Math.min(1, strength));
    const condition01 = Math.max(0, Math.min(1, reactive?.presentedCondition01 ?? reactive?.condition01 ?? 0));
    const personality = item.root.userData.responsePersonality ?? {};
    const pulsePushMultiplier = Math.max(0.65, Math.min(1.35, personality.pulsePushMultiplier ?? 1));
    const pulseLateralMultiplier = Math.max(0.35, Math.min(1.65, personality.pulseLateralMultiplier ?? 1));
    const rippleMultiplier = Math.max(0.35, Math.min(1.75, personality.rippleMultiplier ?? 1));
    const cleanResponse = 1 - condition01 * 0.32;
    state.velocity.addScaledVector(this.responseTemp, 1.05 * responseStrength * cleanResponse * pulsePushMultiplier);

    if (condition01 > 0.18) {
      this.responseLateral.set(-this.responseTemp.z, 0, this.responseTemp.x);
      if (this.responseLateral.lengthSq() > 0.0001) this.responseLateral.normalize();
      const phase = reactive?.phase ?? 0;
      state.velocity.addScaledVector(this.responseLateral, Math.sin(phase + condition01 * 5.7) * responseStrength * condition01 * 0.42 * pulseLateralMultiplier);
      state.velocity.y += Math.cos(phase * 0.73) * responseStrength * condition01 * 0.11 * rippleMultiplier;
    }

    state.velocity.y += 0.14 * responseStrength * cleanResponse * Math.min(1.25, 0.84 + rippleMultiplier * 0.16);
    state.pulseEnergy = Math.max(state.pulseEnergy, responseStrength * (0.92 + condition01 * 0.22));
  }

  updateVerbResponse(dt, item, frameState) {
    const pivot = item.responsePivot;
    const state = this.getResponseState(item);
    if (!pivot || !state) return;

    const safeDt = Math.max(0, Math.min(dt, 0.05));

    // PULSE — outward recoil that cannot move the gameplay root.
    state.kick.addScaledVector(state.velocity, safeDt);
    state.velocity.addScaledVector(state.kick, -17.0 * safeDt);
    state.velocity.multiplyScalar(Math.exp(-safeDt * 8.5));
    state.kick.multiplyScalar(Math.exp(-safeDt * 2.8));
    state.pulseEnergy = Math.max(0, state.pulseEnergy - safeDt * 2.6);

    // ABSORB — target visually yields/compresses as the existing bond progresses.
    const absorbTarget = frameState.bondState?.objectId === item.recipe.id
      ? Math.max(0, Math.min(1, frameState.bondState?.absorbProgress ?? 0))
      : 0;
    state.absorbYield += (absorbTarget - state.absorbYield)
      * (1 - Math.exp(-safeDt * (absorbTarget > state.absorbYield ? 8.5 : 5.5)));

    // STABILIZE — target motion visually settles while existing stabilize truth is held.
    const stabilizeTarget = frameState.verbPhysicalization?.stabilizeTargetId === item.recipe.id
      && (frameState.input?.stabilizeHeld || frameState.input?.resonanceHeld)
      ? Math.max(0.18, frameState.verbPhysicalization?.stabilizeProgress ?? 0)
      : 0;
    state.stabilizeOrder += (stabilizeTarget - state.stabilizeOrder)
      * (1 - Math.exp(-safeDt * (stabilizeTarget > state.stabilizeOrder ? 7.5 : 4.0)));

    const personality = frameState.responsePersonality?.objects?.[item.recipe.id]
      ?? item.root.userData.responsePersonality
      ?? {};
    const flexMultiplier = Math.max(0.30, Math.min(1.70, personality.flexMultiplier ?? 1));
    const shearMultiplier = Math.max(0.15, Math.min(1.65, personality.shearMultiplier ?? 1));
    const rippleMultiplier = Math.max(0.30, Math.min(1.75, personality.rippleMultiplier ?? 1));
    const compressionMultiplier = Math.max(0.35, Math.min(1.40, personality.compressionMultiplier ?? 1));
    const responseDampingMultiplier = Math.max(0.65, Math.min(1.35, personality.responseDampingMultiplier ?? 1));

    const yieldScale = 1 - state.absorbYield * 0.16 * compressionMultiplier;
    const pulseScale = 1 + state.pulseEnergy * 0.055 * (0.82 + flexMultiplier * 0.18);
    const orderedScale = 1 - state.stabilizeOrder * 0.025;
    const baseScale = Math.max(0.72, yieldScale * pulseScale * orderedScale);
    const reactive = frameState.reactiveStateGrammar?.objects?.[item.recipe.id]
      ?? item.root.userData.reactiveState
      ?? null;
    const reactiveCondition01 = Math.max(0, Math.min(1, reactive?.presentedCondition01 ?? reactive?.condition01 ?? 0));
    const reactiveDeformation01 = Math.max(0, Math.min(1, reactive?.deformation01 ?? 0));
    const reactiveContainment01 = Math.max(0, Math.min(1, reactive?.containment01 ?? 0));
    const reactivePhase = reactive?.phase ?? 0;
    const now = frameState.runtimeSeconds ?? 0;
    const reactiveRate = 1.1 + reactiveCondition01 * 6.4;
    const heldDeformation = reactiveDeformation01 * (1 - reactiveContainment01 * 0.52);
    const xWarp = 1 + Math.sin(now * reactiveRate + reactivePhase) * heldDeformation * 0.18 * flexMultiplier + heldDeformation * 0.055 * shearMultiplier;
    const yWarp = 1 + Math.cos(now * (reactiveRate * 0.83) + reactivePhase * 1.31) * heldDeformation * 0.15 * compressionMultiplier - heldDeformation * 0.035 * shearMultiplier;
    const zWarp = 1 + Math.sin(now * (reactiveRate * 1.19) + reactivePhase * 0.67) * heldDeformation * 0.20 * flexMultiplier;
    pivot.scale.set(
      Math.max(0.58, baseScale * xWarp),
      Math.max(0.58, baseScale * yWarp),
      Math.max(0.58, baseScale * zWarp)
    );

    const composition = frameState.verbComposition ?? {};
    const compositionOwnsItem = Boolean(
      composition.relationshipBound
      && composition.targetId === item.recipe.id
    );
    const compositionDamping01 = compositionOwnsItem
      ? Math.max(0, Math.min(1, composition.effects?.targetMotionDamping01 ?? 0))
      : 0;
    const composedMotionScale = 1 - compositionDamping01 * 0.48;
    pivot.position.copy(state.kick).multiplyScalar((1 - state.stabilizeOrder * 0.72) * composedMotionScale / responseDampingMultiplier);
    const reactiveJitter = reactiveDeformation01 * (1 - reactiveContainment01 * 0.68);
    pivot.position.x += Math.sin(now * (8.2 + reactiveCondition01 * 7.1) + reactivePhase) * reactiveJitter * 0.034 * rippleMultiplier;
    pivot.position.y += Math.cos(now * (6.7 + reactiveCondition01 * 5.4) + reactivePhase * 0.81) * reactiveJitter * 0.026 * rippleMultiplier;
    pivot.rotation.z = state.pulseEnergy * 0.055
      * Math.sin(now * 13)
      * composedMotionScale
      + Math.sin(now * (4.8 + reactiveCondition01 * 8.0) + reactivePhase) * reactiveJitter * 0.085 * shearMultiplier;
    pivot.rotation.x = state.pulseEnergy * 0.035 * composedMotionScale
      + Math.cos(now * (4.1 + reactiveCondition01 * 6.2) + reactivePhase * 1.17) * reactiveJitter * 0.065 * shearMultiplier;

    pivot.userData.verbResponse = {
      pulse: state.pulseEnergy,
      absorb: state.absorbYield,
      stabilize: state.stabilizeOrder,
      reactiveStage: reactive?.stage ?? "coherent",
      reactiveCondition01,
      reactiveDeformation01,
      responsePersonality: personality.family ?? "adaptive_matter",
      responseExpression: personality.stageExpression ?? "settled_form"
    };
  }

  setCellObjectVisibility(cellId, visible, opacity = visible ? 1 : 0) {
    for (const item of this.objects) {
      if (item.cellId !== cellId) continue;
      if (!item.absorbed && !item.root.userData.absorbed) {
        item.root.visible = visible || opacity > 0.01;
        this.setObjectOpacity(item.root, opacity);
      }
    }
  }

  setObjectOpacity(root, opacity) {
    root.traverse((child) => {
      const materials = child.material
        ? Array.isArray(child.material)
          ? child.material
          : [child.material]
        : [];

      for (const material of materials) {
        if (!material) continue;
        if (material.userData.originalOpacity === undefined) {
          material.userData.originalOpacity = material.opacity ?? 1;
        }

        material.transparent = true;
        material.opacity = Math.max(0, Math.min(1, opacity * material.userData.originalOpacity));
        material.needsUpdate = true;
      }
    });
  }

  update(dt, frameState) {
    if (frameState.input?.pulsePressed) {
      this.emitPulse(frameState);
      this.applyPulseToObjects(frameState);
    }

    this.updateObjects(dt, frameState);
    this.updatePulseWaves(dt, frameState);
  }

  findNearestObject() {
    let nearest = null;

    for (const item of this.objects) {
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;

      const distance = this.playerRoot.position.distanceTo(item.root.position);

      if (!nearest || distance < nearest.distance) {
        nearest = { ...item, distance };
      }
    }

    return nearest;
  }

  updateNearestState(nearest, frameState) {
    if (!nearest) {
      frameState.currentBond = "none";
      frameState.currentChemTarget = "none";
      frameState.chemObjectState.nearestObject = "none";
      frameState.chemObjectState.nearestDistance = 0;
      return;
    }

    const bondTypes = nearest.recipe.chemistry?.bondTypes ?? [];
    const activeBond = nearest.distance < 1.25 ? bondTypes[0] ?? "none" : "none";

    frameState.currentBond = activeBond;
    frameState.currentChemTarget = nearest.recipe.id;
    if (nearest.distance < 1.75) {
      frameState.selectedObject = nearest.root.userData;
    }
    frameState.chemObjectState.nearestObject = nearest.recipe.id;
    frameState.chemObjectState.nearestDistance = nearest.distance;
  }

  emitPulse(frameState) {
    frameState.pulse = {
      active: true,
      age: 0,
      radius: 0,
      affectedObjects: []
    };

    // HC017B: retire the legacy second pulse ring. CoreVerbPhysicalizationSystem
    // is now the single player-facing pulse-wave authority.
    this.pulseWaves.push({ root: null, age: 0, maxAge: 0.68 });
  }

  applyPulseToObjects(frameState) {
    const affected = [];
    const ambient = [];
    const targeting = frameState.targeting ?? {};
    const relationshipTargetId = targeting.relationshipActive
      ? (targeting.relationshipTargetId ?? targeting.targetId ?? "none")
      : "none";
    const fallbackTargetId = targeting.candidateId ?? targeting.targetId ?? "none";
    const composition = frameState.verbComposition ?? {};
    const projection = frameState.stabilizedProjection ?? {};
    const projectionActive = Boolean(projection.active && projection.chord === "cohere_project");

    // HC031G: Stabilize + Pulse does not require an acquired relationship. If no
    // retained target exists, the same chord focuses along camera-forward and picks
    // the strongest material inside that directional cone without taking ownership
    // from TargetingSystem.
    let directionalFocusId = "none";
    if (projectionActive && relationshipTargetId === "none") {
      const dir = projection.direction ?? frameState.playerKinematics?.cameraRelativeForward ?? { x: 0, y: 0, z: -1 };
      const forward = new THREE.Vector3(dir.x ?? 0, dir.y ?? 0, dir.z ?? -1);
      if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
      forward.normalize();
      let bestScore = -Infinity;
      for (const item of this.objects) {
        if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;
        const offset = new THREE.Vector3().copy(item.root.position).sub(this.playerRoot.position);
        const distance = offset.length();
        if (!Number.isFinite(distance) || distance < 0.001 || distance > 4.25) continue;
        const alignment = offset.multiplyScalar(1 / distance).dot(forward);
        if (alignment < 0.58) continue;
        const score = alignment * 1.22 + (1 - distance / 4.25) * 0.34;
        if (score > bestScore) {
          bestScore = score;
          directionalFocusId = item.recipe.id;
        }
      }
    }

    const focusedTargetId = relationshipTargetId !== "none"
      ? relationshipTargetId
      : projectionActive && directionalFocusId !== "none"
        ? directionalFocusId
        : fallbackTargetId;
    const compositionBoundToFocus = Boolean(
      composition.relationshipBound
      && composition.targetId === focusedTargetId
    );
    const compositionApplies = compositionBoundToFocus || projectionActive;
    const compositionEffects = compositionApplies ? (composition.effects ?? {}) : {};
    const baseFocusedCompositionMultiplier = Math.max(0.2, Math.min(1.2, compositionEffects.pulseFocusedMultiplier ?? 1));
    const baseAmbientCompositionMultiplier = Math.max(0.1, Math.min(1.2, compositionEffects.pulseAmbientMultiplier ?? 1));
    const projectionFocusedMultiplier = projectionActive
      ? Math.max(0.85, Math.min(1.28, projection.effects?.focusedResponseMultiplier ?? 1.04))
      : 1;
    const projectionAmbientMultiplier = projectionActive
      ? Math.max(0.25, Math.min(0.7, projection.effects?.ambientResponseMultiplier ?? 0.52))
      : 1;
    const focusedCompositionMultiplier = Math.max(0.2, Math.min(1.3, baseFocusedCompositionMultiplier * projectionFocusedMultiplier));
    const ambientCompositionMultiplier = Math.max(0.08, Math.min(1.2, baseAmbientCompositionMultiplier * projectionAmbientMultiplier));
    let focusedObject = "none";

    for (const item of this.objects) {
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;

      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (distance > 4.25) continue;

      item.pulseAge = 0;
      item.root.userData.lastPulseResponse = item.recipe.behavior?.onPulse ?? "none";
      const focused = focusedTargetId !== "none" && item.recipe.id === focusedTargetId;
      const baseResponseStrength = focused ? 1 : projectionActive ? 0.16 : 0.22;
      const compositionMultiplier = focused
        ? focusedCompositionMultiplier
        : ambientCompositionMultiplier;
      const reactive = frameState.reactiveStateGrammar?.objects?.[item.recipe.id]
        ?? item.root.userData.reactiveState
        ?? null;
      this.registerPulseResponse(item, baseResponseStrength * compositionMultiplier, reactive);
      affected.push(item.recipe.id);
      if (focused) focusedObject = item.recipe.id;
      else ambient.push(item.recipe.id);
    }

    // Pulse remains a broad inquiry for inherited discovery readers. HC031G changes
    // force concentration, not the fact that the local field can still answer.
    frameState.pulse.affectedObjects = affected;
    frameState.pulse.focusedObject = focusedObject;
    frameState.pulse.ambientObjects = ambient;
    frameState.pulse.relationshipTargetId = relationshipTargetId;
    frameState.pulse.directionalFocusId = directionalFocusId;
    frameState.pulse.focusSource = focusedObject === "none"
      ? "none"
      : relationshipTargetId !== "none"
        ? "retained_relationship"
        : projectionActive
          ? "stabilized_projection_direction"
          : "candidate";
    frameState.pulse.effectOwnership = projectionActive
      ? focusedObject !== "none"
        ? "stabilized_directional_focus_plus_ambient_inquiry"
        : "stabilized_forward_projection_without_target"
      : focusedObject !== "none"
        ? "relationship_focus_plus_ambient_inquiry"
        : "ambient_inquiry_only";
    frameState.pulse.compositionChord = compositionApplies ? (composition.chord ?? "idle") : "unbound";
    frameState.pulse.compositionFocusedMultiplier = focusedCompositionMultiplier;
    frameState.pulse.compositionAmbientMultiplier = ambientCompositionMultiplier;
    frameState.pulse.stabilizedProjectionMode = projectionActive ? (projection.mode ?? "self_braced") : "inactive";
    frameState.pulse.stabilizedProjectionFocus01 = projectionActive ? (projection.focus01 ?? 0) : 0;
    frameState.pulse.stabilizedProjectionRequiresAnchor = false;
    frameState.chemObjectState.pulseResponse = affected.length
      ? affected.join(", ")
      : "pulse_dissipated";
  }

  applyAbsorb(dt, nearest, frameState) {
    const recipe = nearest.recipe;
    const difficulty = recipe.chemistry?.absorbDifficulty ?? 1;
    const canAbsorb = recipe.behavior?.onAbsorb && difficulty < 0.7;
    const prior = this.absorbProgress.get(recipe.id) ?? 0;
    const rate = canAbsorb ? 0.65 * (1.1 - difficulty) : 0.05;
    const next = Math.min(prior + rate * dt, 1);

    this.absorbProgress.set(recipe.id, next);
    frameState.chemObjectState.absorbProgress = next;

    if (!canAbsorb) {
      frameState.chemObjectState.pulseResponse = `${recipe.id}: resists_absorb`;
      return;
    }

    if (next >= 1) {
      this.finishAbsorb(nearest, frameState);
    }
  }

  finishAbsorb(nearest, frameState) {
    const recipe = nearest.recipe;
    const deltas = recipe.effects?.onPlayerComposition ?? {};

    for (const [key, value] of Object.entries(deltas)) {
      const current = frameState.playerComposition[key] ?? 0;
      frameState.playerComposition[key] = Math.min(current + value, 1);
    }

    nearest.root.userData.absorbed = true;
    nearest.root.visible = false;
    nearest.absorbed = true;

    const stored = this.objects.find((item) => item.recipe.id === recipe.id);
    if (stored) stored.absorbed = true;

    frameState.chemObjectState.absorbedObjects += 1;
    frameState.chemObjectState.pulseResponse = `${recipe.id}: absorbed`;
    frameState.currentBond = "none";
    frameState.currentChemTarget = "none";
  }

  markAbsorbed(recipeId) {
    const item = this.objects.find((candidate) => candidate.recipe.id === recipeId);

    if (!item) return false;

    item.absorbed = true;
    item.root.userData.absorbed = true;
    item.root.visible = false;
    this.absorbProgress.delete(recipeId);

    const response = this.responseState.get(recipeId);
    if (response) {
      response.kick.set(0, 0, 0);
      response.velocity.set(0, 0, 0);
      response.pulseEnergy = 0;
      response.absorbYield = 0;
      response.stabilizeOrder = 0;
    }
    return true;
  }

  updateObjects(dt, frameState) {
    for (const item of this.objects) {
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;

      item.pulseAge += dt;
      const pulseT = Math.max(0, 1 - item.pulseAge / 0.9);
      const t = frameState.runtimeSeconds;

      if (item.recipe.id === "dormant_seed_nutrient_001") {
        item.root.rotation.y += dt * (0.35 + pulseT * 1.1);
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.18));
      }

      if (item.recipe.id === "scar_contamination_plate_001") {
        item.root.rotation.z = Math.sin(t * 0.9) * 0.015 + pulseT * 0.05;
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.08));
      }

      if (item.recipe.id === "flux_current_ribbon_001") {
        item.root.rotation.y += dt * (0.12 + pulseT * 0.5);
      }

      if (item.recipe.id === "signal_vapor_thread_001") {
        item.root.rotation.z = Math.sin(t * 1.8) * 0.12;
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.22));
      }


      if (item.recipe.id === "scar_memory_fleck_001") {
        item.root.rotation.y += dt * (0.18 + pulseT * 0.35);
        item.root.position.y += Math.sin(t * 1.2 + item.root.position.x) * 0.0018;
      }

      if (item.recipe.id === "scar_flow_clot_001") {
        item.root.rotation.z = Math.sin(t * 0.7) * 0.035 + pulseT * 0.06;
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.07));
      }

      if (item.recipe.id === "resonant_path_thread_001") {
        item.root.rotation.y += dt * (0.15 + pulseT * 0.7);
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.16));
      }

      if (item.recipe.id === "pressure_fold_current_001") {
        item.root.rotation.y += dt * (0.24 + pulseT * 0.75);
      }


      if (item.recipe.id === "old_core_husk_memory_001") {
        item.root.rotation.y += dt * (0.035 + pulseT * 0.18);
        item.root.position.y += Math.sin(t * 0.75 + item.root.position.x) * 0.0009;
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.055));
      }

      if (item.recipe.id === "residue_silt_cloud_001") {
        item.root.rotation.y -= dt * (0.028 + pulseT * 0.16);
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + Math.sin(t * 0.9) * 0.025 + pulseT * 0.12));
      }

      if (item.recipe.id === "scar_lock_plate_001") {
        item.root.rotation.z = Math.sin(t * 0.55) * 0.018 + pulseT * 0.035;
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + pulseT * 0.045));
      }

      if (item.recipe.id === "inheritance_seed_remnant_001") {
        item.root.rotation.y += dt * (0.065 + pulseT * 0.24);
        item.root.scale.setScalar((item.recipe.spawn?.scale ?? 1) * (1 + Math.sin(t * 1.6) * 0.035 + pulseT * 0.08));
      }

      this.updateVerbResponse(dt, item, frameState);
    }
  }

  updatePulseWaves(dt, frameState) {
    for (const wave of this.pulseWaves) {
      wave.age += dt;
    }

    this.pulseWaves = this.pulseWaves.filter((wave) => wave.age < wave.maxAge);

    if (frameState.pulse?.active) {
      const oldest = this.pulseWaves[0];
      if (oldest) {
        frameState.pulse.age = oldest.age;
        // Preserve the historical gameplay/debug radius readout even though
        // the duplicate ChemObject pulse mesh has been retired.
        frameState.pulse.radius = 0.5 + (oldest.age / oldest.maxAge) * 5.2;
      } else {
        frameState.pulse.active = false;
        frameState.pulse.radius = 0;
      }
    }
  }
}
