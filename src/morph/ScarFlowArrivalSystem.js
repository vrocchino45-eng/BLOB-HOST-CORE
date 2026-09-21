import * as THREE from "three";

export class ScarFlowArrivalSystem {
  constructor({ visualComposer, chemObjectSystem, playerRoot, scene, frameState }) {
    if (!visualComposer) throw new Error("[ScarFlowArrivalSystem] visualComposer is required.");
    if (!chemObjectSystem) throw new Error("[ScarFlowArrivalSystem] chemObjectSystem is required.");
    if (!playerRoot) throw new Error("[ScarFlowArrivalSystem] playerRoot is required.");
    if (!scene) throw new Error("[ScarFlowArrivalSystem] scene is required.");

    this.visualComposer = visualComposer;
    this.chemObjectSystem = chemObjectSystem;
    this.playerRoot = playerRoot;
    this.scene = scene;
    this.frameState = frameState;

    this.cellId = "CELL_SCAR_FLOW_FOLD_001";
    this.active = false;
    this.arrivalAge = 0;
    this.stagingApplied = false;
    this.focusObjectId = "none";
    this.focusDistance = 0;
    this.arrivalClarity = 0;
    this.nurseryFade = 0;
    this.lastAction = "none";
    this.nextAction = "complete the local cell morph first";
    this.arrivalRing = null;
    this.focusLine = null;
    this.linePositions = new Float32Array(6);
  }

  init() {
    this.createArrivalVFX();
    this.frameState.scarFlowArrival = this.createState(false);
  }

  update(dt, frameState) {
    const active = Boolean(frameState.localCellMorph?.completed && frameState.activeCellId === this.cellId);

    if (!active) {
      this.active = false;
      this.updateVFX(null, false, frameState);
      frameState.scarFlowArrival = this.createState(false);
      return;
    }

    if (!this.active) {
      this.active = true;
      this.arrivalAge = 0;
      this.lastAction = "arrived_in_scar_flow_fold";
    }

    this.arrivalAge += dt;
    this.arrivalClarity = this.clamp01(this.arrivalClarity + dt * 0.28);
    this.nurseryFade = this.clamp01(this.nurseryFade + dt * 0.42);

    this.applyArrivalStaging(frameState);
    const focus = this.findArrivalFocus();
    this.focusObjectId = focus?.recipe.id ?? "none";
    this.focusDistance = focus?.distance ?? 0;
    this.nextAction = this.buildNextAction(frameState, focus);

    if (focus && focus.distance < 2.2) {
      frameState.selectedObject = focus.root.userData;
    }

    this.updateVFX(focus, true, frameState);
    frameState.scarFlowArrival = this.createState(true);
  }

  applyArrivalStaging(frameState) {
    // Source chem objects should remain non-interactive once the new local cell is active.
    for (const item of this.chemObjectSystem.objects) {
      const isDestination = item.cellId === this.cellId;
      const isSource = item.cellId === "CELL_MEMBRANE_NURSERY_001";

      if (isDestination) {
        item.root.visible = true;
        this.setGroupOpacity(item.root, 1);
        item.root.userData.activeCellFocus = "scar_flow_destination";
      }

      if (isSource && !item.root.userData.absorbed) {
        item.root.visible = false;
        this.setGroupOpacity(item.root, 0);
        item.root.userData.activeCellFocus = "source_hidden_after_morph";
      }
    }

    // Dim old nursery support cast; they remain emotionally present but should not steal focus.
    for (const entry of this.visualComposer.composedObjects) {
      const data = entry.root.userData ?? {};
      const isNurseryEntity = data.entityRecipe === "nursery_membrane_tender_001" || data.entityRecipe === "membrane_watcher_001";
      const isGuide = data.orbiterRecipe === "guide_orbiter_folded_lantern_001";
      const isSourceEnvironment = entry.root.name === "membrane_pocket_surface_001" || entry.root.name === "nursery_soft_pressure_fog_001";
      const isDestinationEnvironment = entry.root.name === "scar_flow_fold_surface_001" || entry.root.name === "scar_pressure_haze_001";

      if (isNurseryEntity) {
        entry.root.userData.arrivalRole = "background_nursery_support";
        entry.root.userData.entityState = "background_support_after_fold";
        this.setGroupOpacity(entry.root, 0.30);
      }

      if (isGuide) {
        entry.root.userData.arrivalRole = "scar_flow_interpreter";
        entry.root.userData.guideTarget = this.focusObjectId === "none" ? "scar_flow_fold" : this.focusObjectId;
        this.setGroupOpacity(entry.root, 0.82);
      }

      if (isSourceEnvironment) {
        this.setGroupOpacity(entry.root, 0.12);
      }

      if (isDestinationEnvironment) {
        entry.root.visible = true;
        this.setGroupOpacity(entry.root, 1);
      }
    }

    // HC-016L: presentation staging only. LocalCellMorphSystem owns active-cell transition.
  }

  findArrivalFocus() {
    const destinationObjects = this.chemObjectSystem.objects.filter((item) => {
      return item.cellId === this.cellId && !item.absorbed && !item.root.userData.absorbed && item.root.visible;
    });

    let best = null;

    for (const item of destinationObjects) {
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      let priority = 0;
      if (item.recipe.id === "resonant_path_thread_001") priority += 4.2;
      if (item.recipe.id === "pressure_fold_current_001") priority += 3.6;
      if (item.recipe.id === "scar_memory_fleck_001") priority += 3.0;
      if (item.recipe.id === "scar_flow_clot_001") priority += 1.4;
      priority += Math.max(0, 5 - distance);

      if (!best || priority > best.priority) {
        best = { ...item, distance, priority };
      }
    }

    return best;
  }

  buildNextAction(frameState, focus) {
    const completion = frameState.morphCompletion ?? {};

    if (!focus) {
      return "look for the scar-flow thread or pressure current";
    }

    if (completion.safeToExpand) {
      return "scar-flow fold is stable enough for the next branch";
    }

    if (focus.recipe.id === "resonant_path_thread_001") {
      return "pulse the resonant path thread to read the new route";
    }

    if (focus.recipe.id === "pressure_fold_current_001") {
      return "ride the pressure current until the fold settles";
    }

    if (focus.recipe.id === "scar_memory_fleck_001") {
      return "pulse the memory fleck to hear what the scar is holding";
    }

    if (focus.recipe.id === "scar_flow_clot_001") {
      return "do not absorb the clot; pulse or move around it";
    }

    return "pulse scar-flow objects to stabilize the new cell";
  }

  createArrivalVFX() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff8a8a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.arrivalRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.012, 8, 108), ringMat);
    this.arrivalRing.name = "scar_flow_arrival_active_cell_ring";
    this.arrivalRing.rotation.x = Math.PI / 2;
    this.arrivalRing.visible = false;
    this.scene.add(this.arrivalRing);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffc08d,
      transparent: true,
      opacity: 0
    });

    this.focusLine = new THREE.Line(geometry, lineMat);
    this.focusLine.name = "scar_flow_arrival_focus_line";
    this.focusLine.visible = false;
    this.scene.add(this.focusLine);
  }

  updateVFX(focus, active, frameState) {
    if (!this.arrivalRing || !this.focusLine) return;

    if (!active) {
      this.arrivalRing.visible = false;
      this.focusLine.visible = false;
      return;
    }

    const t = frameState.runtimeSeconds ?? 0;
    this.arrivalRing.visible = true;
    this.arrivalRing.position.copy(this.playerRoot.position);
    this.arrivalRing.position.y -= 0.22;
    this.arrivalRing.scale.setScalar(1 + Math.sin(t * 2.6) * 0.04 + this.arrivalClarity * 0.18);
    this.arrivalRing.rotation.z += 0.014;
    this.arrivalRing.material.opacity = 0.12 + this.arrivalClarity * 0.28;

    if (!focus) {
      this.focusLine.visible = false;
      return;
    }

    this.focusLine.visible = focus.distance < 5.5;
    this.linePositions[0] = this.playerRoot.position.x;
    this.linePositions[1] = this.playerRoot.position.y;
    this.linePositions[2] = this.playerRoot.position.z;
    this.linePositions[3] = focus.root.position.x;
    this.linePositions[4] = focus.root.position.y;
    this.linePositions[5] = focus.root.position.z;
    this.focusLine.geometry.attributes.position.needsUpdate = true;
    this.focusLine.material.opacity = Math.max(0, 0.10 + this.arrivalClarity * 0.26 - focus.distance * 0.025);
  }

  createState(active) {
    return {
      active,
      cellId: active ? this.cellId : "none",
      arrivalAge: active ? this.arrivalAge : 0,
      arrivalClarity: this.arrivalClarity,
      nurseryFade: this.nurseryFade,
      focusObjectId: active ? this.focusObjectId : "none",
      focusDistance: active ? this.focusDistance : 0,
      lastAction: active ? this.lastAction : "none",
      nextAction: active ? this.nextAction : "complete the local cell morph first",
      activeCellFocus: active ? "scar_flow_fold" : "nursery_pocket",
      sourceSuppressed: active && this.nurseryFade > 0.55
    };
  }

  setGroupOpacity(root, opacity) {
    root.visible = opacity > 0.01;
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

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
