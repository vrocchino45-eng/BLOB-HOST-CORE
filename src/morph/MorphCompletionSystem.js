import * as THREE from "three";

export class MorphCompletionSystem {
  constructor({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState }) {
    if (!recipeDataSystem) throw new Error("[MorphCompletionSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[MorphCompletionSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[MorphCompletionSystem] playerRoot is required.");
    if (!scene) throw new Error("[MorphCompletionSystem] scene is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.scene = scene;
    this.frameState = frameState;

    this.cellId = "CELL_SCAR_FLOW_FOLD_001";
    this.hooks = [];
    this.hookByObject = new Map();
    this.wasActive = false;
    this.stability = 0.18;
    this.pressureRelief = 0;
    this.memoryEcho = 0;
    this.pathConfidence = 0;
    this.flowConfidence = 0;
    this.clotWarning = 0;
    this.lastHook = "none";
    this.nextAction = "complete the local cell morph first";
    this.nearestHook = null;
    this.cueRing = null;
    this.cueLine = null;
    this.linePositions = new Float32Array(6);
  }

  init() {
    this.hooks = Array.from(this.recipeDataSystem.data.morphCompletionHookRecipes.values());
    for (const hook of this.hooks) this.hookByObject.set(hook.sourceObject, hook);
    this.createCueVFX();
    this.frameState.morphCompletion = this.createState(false);
  }

  update(dt, frameState) {
    const active = Boolean(frameState.localCellMorph?.completed && frameState.activeCellId === this.cellId);

    if (!active) {
      this.frameState.morphCompletion = this.createState(false);
      this.updateCue(null, false, frameState);
      return;
    }

    if (!this.wasActive) {
      this.lastHook = "entered_scar_flow_fold_hooks_active";
      this.nextAction = "pulse scar-flow objects to read/stabilize the fold";
    }

    this.wasActive = true;
    this.nearestHook = this.findNearestHookObject();

    if (frameState.input?.pulsePressed) {
      this.applyPulseHooks(frameState);
    }

    this.applyProximityHooks(dt, frameState);
    this.applyStabilityDrift(dt);
    this.applyMovementFeel(frameState);
    this.updateCue(this.nearestHook, true, frameState);

    this.frameState.morphCompletion = this.createState(true);
  }

  applyPulseHooks(frameState) {
    const affected = frameState.pulse?.affectedObjects ?? [];
    let applied = false;

    for (const objectId of affected) {
      const hook = this.hookByObject.get(objectId);
      if (!hook) continue;
      this.applyHook(hook, frameState, "pulse");
      applied = true;
    }

    if (!applied && this.nearestHook?.distance < 2.6) {
      const hook = this.hookByObject.get(this.nearestHook.recipe.id);
      if (hook) this.applyHook(hook, frameState, "near_pulse");
    }
  }

  applyProximityHooks(dt, frameState) {
    if (!this.nearestHook) return;

    if (this.nearestHook.recipe.id === "pressure_fold_current_001" && this.nearestHook.distance < 1.85) {
      this.flowConfidence = this.clamp01(this.flowConfidence + dt * 0.12);
      this.pressureRelief = this.clamp01(this.pressureRelief + dt * 0.05);
      this.lastHook = "pressure_current_carrying_player";
    }

    if (this.nearestHook.recipe.id === "scar_flow_clot_001" && this.nearestHook.distance < 1.65 && frameState.input?.absorbHeld) {
      this.clotWarning = this.clamp01(this.clotWarning + dt * 0.22);
      this.stability = this.clamp01(this.stability - dt * 0.08);
      this.lastHook = "clot_hardened_against_absorb";
    }
  }

  applyHook(hook, frameState, source) {
    const effect = hook.effect ?? {};
    this.memoryEcho = this.clamp01(this.memoryEcho + (effect.memoryEcho ?? 0));
    this.pathConfidence = this.clamp01(this.pathConfidence + (effect.pathConfidence ?? 0));
    this.flowConfidence = this.clamp01(this.flowConfidence + (effect.flowConfidence ?? 0));
    this.pressureRelief = this.clamp01(this.pressureRelief + (effect.pressureRelief ?? 0));
    this.clotWarning = this.clamp01(this.clotWarning + (effect.clotWarning ?? 0));
    this.stability = this.clamp01(this.stability + (effect.stability ?? 0));

    if (effect.compositionSignal) frameState.playerComposition.signal = this.clamp01((frameState.playerComposition.signal ?? 0) + effect.compositionSignal);
    if (effect.compositionFlux) frameState.playerComposition.flux = this.clamp01((frameState.playerComposition.flux ?? 0) + effect.compositionFlux);
    if (effect.compositionResidue) frameState.playerComposition.residue = this.clamp01((frameState.playerComposition.residue ?? 0) + effect.compositionResidue);
    if (effect.compositionScar) frameState.playerComposition.scar = this.clamp01((frameState.playerComposition.scar ?? 0) + effect.compositionScar);

    const object = this.chemObjectSystem.objects.find((item) => item.recipe.id === hook.sourceObject);
    if (object) {
      object.pulseAge = 0;
      object.root.userData.hookState = hook.id;
      object.root.userData.lastPulseResponse = `${hook.id}:${source}`;
    }

    if (hook.sourceObject === "scar_flow_clot_001" && this.pathConfidence < 0.35) {
      this.nextAction = "follow/charge the resonant path thread before forcing the clot";
    } else if (hook.sourceObject === "scar_memory_fleck_001") {
      this.nextAction = "memory echo read — look for the resonant path thread";
    } else if (hook.sourceObject === "resonant_path_thread_001") {
      this.nextAction = "path aligned — pulse/enter pressure current to relieve fold";
    } else if (hook.sourceObject === "pressure_fold_current_001") {
      this.nextAction = "pressure is routing — keep moving through the fold";
    }

    this.lastHook = hook.id;
  }

  applyStabilityDrift(dt) {
    const support = this.memoryEcho * 0.22 + this.pathConfidence * 0.33 + this.pressureRelief * 0.30 + this.flowConfidence * 0.15;
    const warningDrag = this.clotWarning * 0.09;
    const target = this.clamp01(0.18 + support - warningDrag);
    this.stability += (target - this.stability) * Math.min(1, dt * 1.6);
    this.clotWarning = Math.max(0, this.clotWarning - dt * 0.018);
  }

  applyMovementFeel(frameState) {
    const relief = this.pressureRelief;
    const stability = this.stability;
    const flow = this.flowConfidence;

    if (!frameState.physicalFeel) return;

    frameState.physicalFeel.pressure = Math.max(0.28, (frameState.physicalFeel.pressure ?? 0.58) - relief * 0.16);
    frameState.physicalFeel.viscosity = Math.max(0.42, (frameState.physicalFeel.viscosity ?? 0.52) - stability * 0.08);

    if (frameState.physicalFeel.flowVector) {
      frameState.physicalFeel.flowVector.x += flow * 0.018;
      frameState.physicalFeel.flowVector.z -= flow * 0.028;
    }

    frameState.chemistry.signal = this.clamp01((frameState.chemistry.signal ?? 0.26) + this.pathConfidence * 0.025);
    frameState.chemistry.flux = this.clamp01((frameState.chemistry.flux ?? 0.58) + this.flowConfidence * 0.025);
  }

  findNearestHookObject() {
    let nearest = null;

    for (const item of this.chemObjectSystem.objects) {
      if (item.cellId !== this.cellId) continue;
      if (!this.hookByObject.has(item.recipe.id)) continue;
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;

      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (!nearest || distance < nearest.distance) nearest = { ...item, distance };
    }

    return nearest;
  }

  createCueVFX() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff8292,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.cueRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.009, 8, 84), ringMat);
    this.cueRing.name = "scar_flow_hook_nearest_ring";
    this.cueRing.rotation.x = Math.PI / 2;
    this.cueRing.visible = false;
    this.scene.add(this.cueRing);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffb07d,
      transparent: true,
      opacity: 0
    });
    this.cueLine = new THREE.Line(geometry, lineMat);
    this.cueLine.name = "scar_flow_hook_relation_line";
    this.cueLine.visible = false;
    this.scene.add(this.cueLine);
  }

  updateCue(nearest, active, frameState) {
    if (!this.cueRing || !this.cueLine) return;
    if (!active || !nearest) {
      this.cueRing.visible = false;
      this.cueLine.visible = false;
      return;
    }

    const t = frameState.runtimeSeconds ?? 0;
    this.cueRing.visible = true;
    this.cueRing.position.copy(nearest.root.position);
    this.cueRing.scale.setScalar(1 + Math.sin(t * 3.4) * 0.06 + this.stability * 0.25);
    this.cueRing.rotation.z += 0.018;
    this.cueRing.material.opacity = 0.18 + this.stability * 0.34;

    this.cueLine.visible = nearest.distance < 3.2;
    this.linePositions[0] = this.playerRoot.position.x;
    this.linePositions[1] = this.playerRoot.position.y;
    this.linePositions[2] = this.playerRoot.position.z;
    this.linePositions[3] = nearest.root.position.x;
    this.linePositions[4] = nearest.root.position.y;
    this.linePositions[5] = nearest.root.position.z;
    this.cueLine.geometry.attributes.position.needsUpdate = true;
    this.cueLine.material.opacity = Math.max(0, 0.12 + this.stability * 0.22 - nearest.distance * 0.03);
  }

  createState(active) {
    return {
      active,
      cellId: active ? this.cellId : "none",
      stability: this.stability,
      pressureRelief: this.pressureRelief,
      memoryEcho: this.memoryEcho,
      pathConfidence: this.pathConfidence,
      flowConfidence: this.flowConfidence,
      clotWarning: this.clotWarning,
      lastHook: this.lastHook,
      nearestHook: this.nearestHook?.recipe.id ?? "none",
      nearestDistance: this.nearestHook?.distance ?? 0,
      nextAction: active ? this.nextAction : "complete the local cell morph first",
      safeToExpand: active && this.stability >= 0.62 && this.pathConfidence >= 0.35 && this.pressureRelief >= 0.25,
      hookCount: this.hooks.length
    };
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
