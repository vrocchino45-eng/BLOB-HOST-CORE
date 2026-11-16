import * as THREE from "three";
import { LOCAL_CELL_BOUNDARY_RECIPES_HC016G } from "./LocalCellBoundaryRecipeRegistry.js";

const EARLY_SURFACE_CELL = "CELL_MEMBRANE_NURSERY_001";
const EARLY_GUIDE_CELL = "CELL_SCAR_FLOW_FOLD_001";
const EARLY_HUB_CELL = "CELL_SIGNAL_CHORUS_NERVE_001";

const EARLY_RETURN_SEAMS_HC026B = Object.freeze([
  Object.freeze({
    id: "guide_surface_memory_seam",
    label: "Surface ↔ Guide remembered fold",
    cells: Object.freeze([EARLY_SURFACE_CELL, EARLY_GUIDE_CELL]),
    anchor: Object.freeze([-0.15, -0.42, -0.72]),
    axis: Object.freeze([-0.67, 0.60, -0.36]),
    colorA: 0x9bd8c8,
    colorB: 0xffc98c
  }),
  Object.freeze({
    id: "hub_guide_memory_seam",
    label: "Guide ↔ Hub remembered fold",
    cells: Object.freeze([EARLY_GUIDE_CELL, EARLY_HUB_CELL]),
    anchor: Object.freeze([0.72, -0.38, -2.42]),
    axis: Object.freeze([-0.62, 0.02, -0.23]),
    colorA: 0xffc98c,
    colorB: 0x87d8e8
  })
]);

export class LocalCellBoundaryMorphSystem {
  constructor({ frameState, scene = null, playerRoot = null, recipes = LOCAL_CELL_BOUNDARY_RECIPES_HC016G }) {
    if (!frameState) throw new Error("[LocalCellBoundaryMorphSystem] frameState is required.");
    this.frameState = frameState;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.recipes = recipes;
    this.stateById = new Map(recipes.map((recipe) => [recipe.id, {
      active: false,
      completed: false,
      progress: 0,
      startFrame: -1,
      readyAge: 0,
      returnTriggerArmed: false,
      proximityReturnArmed: false,
      guidedStartPosition: null,
      guidedTargetPosition: null
    }]));
    this.activeRecipeId = null;
    this.lastPulseEventId = -1;
    this.lastInteractEventId = -1;
    this.lastCommitEventId = "none";
    this.guidedPoint = new THREE.Vector3();
    this.lastBoundaryCellId = frameState.activeCellId ?? null;
    this.proximityReturnDepartureMargin = 0.30;

    // HC026B: first-slice revisit state lives with the generic anatomical boundary owner.
    // This adds no new runtime owner or source module and never mutates canonical progression.
    this.earlyReturnRoot = null;
    this.earlyReturnVisuals = new Map();
    this.earlyReturnSideState = new Map();
    this.earlyReturnPreviousDistance = new Map();
    this.earlyReturnPreviousPlayerPosition = new THREE.Vector3();
    this.earlyReturnTravelDirection = new THREE.Vector3();
    this.earlyReturnDisplacement = new THREE.Vector3();
    this.earlyReturnHasReachedHub = false;
    this.earlyReturnLastCellId = null;
    this.earlyReturnActiveTransition = null;
    this.earlyReturnTransitionDuration = 0.66;
    this.earlyReturnDepartureRadius = 1.34;
    this.earlyReturnApproachRadius = 1.08;
    this.earlyReturnCrossRadius = 0.50;
    this.earlyReturnCounts = { hubToGuide: 0, guideToHub: 0, guideToSurface: 0, surfaceToGuide: 0 };
  }

  init() {
    this.createEarlyReturnTraversalVisuals();
    if (this.playerRoot) this.earlyReturnPreviousPlayerPosition.copy(this.playerRoot.position);
    this.earlyReturnLastCellId = this.frameState.activeCellId ?? null;
    this.publishEarlyReturnTraversal(this.frameState, null);
    this.publishAggregate(this.frameState);
    this.publishCompatibilityReadModel(this.frameState);
  }

  update(dt, frameState) {
    this.handleBoundaryCellChange(frameState);
    const revisitTransitionOwnsFrame = this.updateEarlyReturnTraversal(dt, frameState);
    if (revisitTransitionOwnsFrame) {
      this.publishAggregate(frameState);
      this.publishCompatibilityReadModel(frameState);
      return;
    }
    const activeRecipe = this.activeRecipeId
      ? this.recipes.find((recipe) => recipe.id === this.activeRecipeId) ?? null
      : null;

    if (activeRecipe) {
      const state = this.stateById.get(activeRecipe.id);
      state.progress = Math.min(1, state.progress + dt / activeRecipe.durationSeconds);
      this.updateGuidedHubCommitFlight(activeRecipe, state, frameState);
      if (state.progress >= 1) {
        this.completeBoundary(activeRecipe, state, frameState);
      } else {
        this.publishBoundary(activeRecipe, state, frameState, activeRecipe.activePhase);
      }
      this.publishAggregate(frameState);
      this.publishCompatibilityReadModel(frameState);
      return;
    }

    // Only evaluate recipes whose source cell is currently active.
    for (const recipe of this.recipes) {
      if (recipe.sourceCellId !== frameState.activeCellId) continue;
      const state = this.stateById.get(recipe.id);
      const repeatableHubCommitEntry = Boolean(
        recipe.direction === "entry"
        && recipe.sourceCellId === EARLY_HUB_CELL
        && recipe.trigger === "commit"
      );
      if (state.completed && !repeatableHubCommitEntry) continue;
      if (state.completed && repeatableHubCommitEntry) {
        state.completed = false;
        state.progress = 0;
        state.startFrame = -1;
      }

      const readiness = this.evaluateReadiness(recipe, frameState);
      const guardedReturn = recipe.direction === "return" && recipe.trigger === "interact";
      const proximityReturn = recipe.direction === "return" && recipe.trigger === "proximity";

      if (proximityReturn && !state.proximityReturnArmed) {
        const interactionRange = readiness.interactionRange ?? recipe.interactionRange ?? 0;
        const departureDistance = interactionRange + this.proximityReturnDepartureMargin;
        if (Number.isFinite(readiness.distance) && readiness.distance > departureDistance) {
          state.proximityReturnArmed = true;
        }
      }

      if (readiness.ready) {
        state.readyAge = (state.readyAge ?? 0) + dt;
        if (proximityReturn) {
          state.returnTriggerArmed = Boolean(state.proximityReturnArmed);
        } else if (!guardedReturn) {
          state.returnTriggerArmed = true;
        } else if (
          state.readyAge >= 0.38
          && !Boolean(frameState.input?.interactPressed)
        ) {
          // HC018E HOTFIX1: a return fold must first become visibly ready,
          // then see an interact-release frame before a new A/E press can leave
          // the route. This prevents an interaction press at the route endpoint
          // from also becoming an accidental hub return.
          state.returnTriggerArmed = true;
        }
      } else {
        state.readyAge = 0;
        if (!proximityReturn) state.returnTriggerArmed = false;
      }

      const freshInput = this.consumeFreshTrigger(recipe.trigger, frameState, recipe);
      const acceptedInput = freshInput && (
        proximityReturn
          ? state.returnTriggerArmed
          : (!guardedReturn || state.returnTriggerArmed)
      );

      if (readiness.ready && acceptedInput) {
        state.active = true;
        state.progress = 0;
        state.startFrame = frameState.frame ?? 0;
        state.readyAge = 0;
        state.returnTriggerArmed = false;
        if (proximityReturn) state.proximityReturnArmed = false;
        if (recipe.guidedApproach && this.playerRoot && readiness.targetPosition) {
          state.guidedStartPosition = this.playerRoot.position.clone();
          state.guidedTargetPosition = new THREE.Vector3(
            readiness.targetPosition.x ?? 0,
            readiness.targetPosition.y ?? 0,
            readiness.targetPosition.z ?? 0
          );
        } else {
          state.guidedStartPosition = null;
          state.guidedTargetPosition = null;
        }
        this.activeRecipeId = recipe.id;
        this.publishBoundary(recipe, state, frameState, recipe.activePhase, readiness);
        this.publishAggregate(frameState);
        this.publishCompatibilityReadModel(frameState);
        return;
      }

      this.publishBoundary(
        recipe,
        state,
        frameState,
        readiness.ready ? recipe.readyPhase : recipe.waitingPhase,
        readiness
      );
    }

    this.publishAggregate(frameState);
    this.publishCompatibilityReadModel(frameState);
  }


  handleBoundaryCellChange(frameState) {
    const activeCellId = frameState.activeCellId ?? null;
    if (activeCellId === this.lastBoundaryCellId) return;

    for (const recipe of this.recipes) {
      if (recipe.sourceCellId !== activeCellId || recipe.direction !== "return") continue;
      const state = this.stateById.get(recipe.id);
      if (!state) continue;

      // HC028I1: a returned route may be revisited. Re-arm its return boundary on
      // each fresh source-cell visit, but proximity returns must first see the
      // player depart the arrival fold before they can fire. This prevents Comb's
      // entry anchor (0.75 from a 1.45 return radius) from immediately ejecting
      // the player and also prevents a prior return from making revisits one-shot.
      state.active = false;
      state.completed = false;
      state.progress = 0;
      state.startFrame = -1;
      state.readyAge = 0;
      state.returnTriggerArmed = false;
      state.proximityReturnArmed = false;
    }

    this.lastBoundaryCellId = activeCellId;
  }

  updateEarlyReturnTraversal(dt, frameState) {
    if (!this.playerRoot) {
      this.publishEarlyReturnTraversal(frameState, null);
      return false;
    }

    const activeCellId = frameState.activeCellId ?? "none";
    if (activeCellId === EARLY_HUB_CELL) this.earlyReturnHasReachedHub = true;

    if (this.earlyReturnLastCellId !== activeCellId) {
      this.handleEarlyReturnCellChange(activeCellId, frameState);
      this.earlyReturnLastCellId = activeCellId;
    }

    this.earlyReturnDisplacement.copy(this.playerRoot.position).sub(this.earlyReturnPreviousPlayerPosition);
    const frameTravel = this.earlyReturnDisplacement.length();
    if (frameTravel > 0.00001) this.earlyReturnTravelDirection.copy(this.earlyReturnDisplacement).normalize();
    else this.earlyReturnTravelDirection.set(0, 0, 0);

    if (this.earlyReturnActiveTransition) {
      this.updateEarlyReturnTransition(dt, frameState);
      this.updateEarlyReturnVisuals(frameState, null);
      this.publishEarlyReturnTraversal(frameState, null);
      this.earlyReturnPreviousPlayerPosition.copy(this.playerRoot.position);
      return true;
    }

    const candidates = this.earlyReturnHasReachedHub
      ? EARLY_RETURN_SEAMS_HC026B.filter((seam) => seam.cells.includes(activeCellId))
      : [];

    let nearest = null;
    for (const seam of candidates) {
      const reading = this.readEarlyReturnSeam(seam, activeCellId, frameTravel);
      if (!nearest || reading.distance < nearest.distance) nearest = reading;
      if (reading.crossReady) {
        this.beginEarlyReturnTransition(reading, frameState);
        this.updateEarlyReturnVisuals(frameState, reading);
        this.publishEarlyReturnTraversal(frameState, reading);
        this.earlyReturnPreviousPlayerPosition.copy(this.playerRoot.position);
        return true;
      }
    }

    this.updateEarlyReturnVisuals(frameState, nearest);
    this.publishEarlyReturnTraversal(frameState, nearest);
    this.earlyReturnPreviousPlayerPosition.copy(this.playerRoot.position);
    return false;
  }

  handleEarlyReturnCellChange(activeCellId, frameState) {
    for (const seam of EARLY_RETURN_SEAMS_HC026B) {
      if (!seam.cells.includes(activeCellId)) continue;
      const sideKey = this.earlyReturnSideKey(seam.id, activeCellId);
      this.earlyReturnSideState.set(sideKey, {
        armed: false,
        departed: false,
        enteredAtFrame: frameState.frame ?? 0
      });
      const anchor = this.earlyReturnVector(seam.anchor);
      this.earlyReturnPreviousDistance.set(sideKey, this.playerRoot.position.distanceTo(anchor));
    }
  }

  readEarlyReturnSeam(seam, activeCellId, frameTravel) {
    const anchor = this.earlyReturnVector(seam.anchor);
    const distance = this.playerRoot.position.distanceTo(anchor);
    const sideKey = this.earlyReturnSideKey(seam.id, activeCellId);
    const state = this.earlyReturnSideState.get(sideKey) ?? { armed: false, departed: false };

    if (distance >= this.earlyReturnDepartureRadius) {
      state.departed = true;
      state.armed = true;
    }
    this.earlyReturnSideState.set(sideKey, state);

    const destinationCellId = seam.cells[0] === activeCellId ? seam.cells[1] : seam.cells[0];
    const axis = this.earlyReturnVector(seam.axis).normalize();
    const towardDestination = seam.cells[0] === activeCellId ? axis : axis.clone().multiplyScalar(-1);
    const alignment = frameTravel > 0.00001 ? this.earlyReturnTravelDirection.dot(towardDestination) : 0;
    const previousDistance = this.earlyReturnPreviousDistance.get(sideKey) ?? distance;
    const approaching = distance < previousDistance - 0.001;
    this.earlyReturnPreviousDistance.set(sideKey, distance);

    return {
      seamId: seam.id,
      seamLabel: seam.label,
      sourceCellId: activeCellId,
      destinationCellId,
      distance,
      proximity: this.earlyReturnClamp01(1 - distance / this.earlyReturnApproachRadius),
      departed: Boolean(state.departed),
      armed: Boolean(state.armed),
      alignment,
      approaching,
      crossReady: Boolean(
        state.armed
        && distance <= this.earlyReturnCrossRadius
        && frameTravel >= 0.008
        && approaching
        && alignment >= 0.16
      )
    };
  }

  beginEarlyReturnTransition(reading, frameState) {
    this.earlyReturnActiveTransition = {
      ...reading,
      elapsed: 0,
      progress: 0,
      switched: false,
      startFrame: frameState.frame ?? 0
    };
    frameState.firstSliceReturnTraversalEvent = {
      pass: "HC-026B",
      type: "remembered_fold_started",
      seamId: reading.seamId,
      sourceCellId: reading.sourceCellId,
      destinationCellId: reading.destinationCellId,
      frame: frameState.frame ?? 0,
      playerPositionRetained: true,
      progressionMutation: false
    };
  }

  updateEarlyReturnTransition(dt, frameState) {
    const transition = this.earlyReturnActiveTransition;
    if (!transition) return;
    transition.elapsed += dt;
    transition.progress = this.earlyReturnClamp01(transition.elapsed / this.earlyReturnTransitionDuration);

    if (!transition.switched && transition.progress >= 0.52) {
      frameState.activeCellId = transition.destinationCellId;
      transition.switched = true;
      this.incrementEarlyReturnCount(transition.sourceCellId, transition.destinationCellId);
      frameState.firstSliceReturnTraversalEvent = {
        pass: "HC-026B",
        type: "remembered_fold_crossed",
        seamId: transition.seamId,
        sourceCellId: transition.sourceCellId,
        destinationCellId: transition.destinationCellId,
        frame: frameState.frame ?? 0,
        playerPositionRetained: true,
        progressionMutation: false,
        routeTopologyMutated: false
      };
    }

    if (transition.progress >= 1) {
      const destinationKey = this.earlyReturnSideKey(transition.seamId, transition.destinationCellId);
      this.earlyReturnSideState.set(destinationKey, {
        armed: false,
        departed: false,
        enteredAtFrame: frameState.frame ?? 0
      });
      this.earlyReturnPreviousDistance.set(destinationKey, 0);
      this.earlyReturnActiveTransition = null;
    }
  }

  incrementEarlyReturnCount(sourceCellId, destinationCellId) {
    if (sourceCellId === EARLY_HUB_CELL && destinationCellId === EARLY_GUIDE_CELL) this.earlyReturnCounts.hubToGuide += 1;
    if (sourceCellId === EARLY_GUIDE_CELL && destinationCellId === EARLY_HUB_CELL) this.earlyReturnCounts.guideToHub += 1;
    if (sourceCellId === EARLY_GUIDE_CELL && destinationCellId === EARLY_SURFACE_CELL) this.earlyReturnCounts.guideToSurface += 1;
    if (sourceCellId === EARLY_SURFACE_CELL && destinationCellId === EARLY_GUIDE_CELL) this.earlyReturnCounts.surfaceToGuide += 1;
  }

  createEarlyReturnTraversalVisuals() {
    if (!this.scene || this.earlyReturnRoot) return;

    this.earlyReturnRoot = new THREE.Group();
    this.earlyReturnRoot.name = "early_region_return_traversal_HC026B";
    Object.assign(this.earlyReturnRoot.userData, {
      pass: "HC-026C1",
      owner: "LocalCellBoundaryMorphSystem",
      spatialRole: "remembered_anatomical_revisit_seams",
      gate: false,
      teleport: false,
      progressionMutation: false
    });
    this.scene.add(this.earlyReturnRoot);

    for (const seam of EARLY_RETURN_SEAMS_HC026B) {
      const group = new THREE.Group();
      group.name = seam.id;
      group.position.copy(this.earlyReturnVector(seam.anchor));
      group.visible = false;

      const axis = this.earlyReturnVector(seam.axis).normalize();
      const up = Math.abs(axis.y) < 0.85 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const side = new THREE.Vector3().crossVectors(axis, up).normalize();
      const bend = new THREE.Vector3().crossVectors(side, axis).normalize();
      const materials = [];
      const motes = [];

      for (let strandIndex = 0; strandIndex < 3; strandIndex += 1) {
        const phase = strandIndex - 1;
        const curve = new THREE.CatmullRomCurve3([
          axis.clone().multiplyScalar(-0.72).addScaledVector(side, phase * 0.09),
          axis.clone().multiplyScalar(-0.25).addScaledVector(side, phase * 0.055).addScaledVector(bend, 0.06 * phase),
          axis.clone().multiplyScalar(0.22).addScaledVector(side, -phase * 0.035).addScaledVector(bend, -0.04 * phase),
          axis.clone().multiplyScalar(0.74).addScaledVector(side, -phase * 0.08)
        ], false, "catmullrom", 0.42);
        const material = new THREE.MeshStandardMaterial({
          color: strandIndex === 1 ? seam.colorB : seam.colorA,
          emissive: strandIndex === 1 ? seam.colorB : seam.colorA,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          roughness: 0.48
        });
        const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.025 + strandIndex * 0.004, 6, false), material);
        mesh.name = `${seam.id}_tissue_strand_${strandIndex + 1}`;
        group.add(mesh);
        materials.push(material);
      }

      for (let index = 0; index < 5; index += 1) {
        const material = new THREE.MeshBasicMaterial({
          color: index % 2 ? seam.colorB : seam.colorA,
          transparent: true,
          opacity: 0.22,
          depthWrite: false
        });
        const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (index % 2) * 0.009, 7, 5), material);
        mote.position.copy(axis).multiplyScalar(-0.52 + index * 0.26);
        mote.position.addScaledVector(side, Math.sin(index * 1.7) * 0.08);
        mote.userData.phase = index * 0.93;
        mote.userData.basePosition = mote.position.clone();
        group.add(mote);
        motes.push(mote);
      }

      const signatures = new Map();
      for (const destinationCellId of seam.cells) {
        const signature = this.createEarlyReturnDestinationSignature(destinationCellId, seam, axis, side, bend);
        signature.group.visible = false;
        group.add(signature.group);

        // HC026C1: do not make the seam signature a single special marker.
        // Repeat the destination anatomy softly back into the source-side approach so
        // the player learns the route as a visual gradient: nursery triads toward
        // Surface, scar ribs toward Guide, chorus triads toward Hub. The repeats are
        // presentation-only and never alter seam position, crossing, or progression.
        const continuity = this.createEarlyReturnLandmarkContinuity(destinationCellId, seam, axis, side, bend);
        continuity.group.visible = false;
        group.add(continuity.group);

        signatures.set(destinationCellId, { ...signature, continuity });
      }

      this.earlyReturnRoot.add(group);
      this.earlyReturnVisuals.set(seam.id, { group, materials, motes, signatures });
    }
  }

  createEarlyReturnDestinationSignature(destinationCellId, seam, axis, side, bend) {
    const group = new THREE.Group();
    const materials = [];
    const pieces = [];
    const destinationForward = destinationCellId === seam.cells[1]
      ? axis.clone()
      : axis.clone().multiplyScalar(-1);
    group.position.copy(destinationForward).multiplyScalar(0.28);
    group.userData.targetingSuppressed = true;
    group.userData.destinationCellId = destinationCellId;

    const makeMaterial = (color, opacity = 0.36) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity,
        depthWrite: false,
        roughness: 0.42
      });
      materials.push(material);
      return material;
    };

    let signatureId = "unknown_memory_signature";
    let signatureLabel = "Remembered anatomy";

    if (destinationCellId === EARLY_SURFACE_CELL) {
      signatureId = "nursery_triad";
      signatureLabel = "Surface nursery triad";
      const surfaceMat = makeMaterial(0x9bd8c8, 0.34);
      const petalOffsets = [
        side.clone().multiplyScalar(-0.15).addScaledVector(bend, -0.02),
        side.clone().multiplyScalar(0.10).addScaledVector(bend, 0.13),
        side.clone().multiplyScalar(0.10).addScaledVector(bend, -0.13)
      ];
      petalOffsets.forEach((offset, index) => {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), surfaceMat.clone());
        materials.push(petal.material);
        petal.position.copy(offset);
        petal.scale.set(1.55, 0.62, 0.48);
        petal.rotation.z = index * 1.05;
        petal.userData.memoryLandmarkPart = true;
        group.add(petal);
        pieces.push(petal);
      });
    } else if (destinationCellId === EARLY_GUIDE_CELL) {
      signatureId = "scar_double_rib";
      signatureLabel = "Guide scar ribs";
      const ribDirection = bend.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      [-1, 1].forEach((sign, index) => {
        const material = makeMaterial(index === 0 ? 0xffc98c : 0xe89268, 0.38);
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.42, 7), material);
        rib.quaternion.setFromUnitVectors(up, ribDirection);
        rib.position.copy(side).multiplyScalar(sign * 0.11);
        rib.position.addScaledVector(destinationForward, index === 0 ? -0.035 : 0.035);
        rib.userData.memoryLandmarkPart = true;
        group.add(rib);
        pieces.push(rib);
      });
      const nodeMaterial = makeMaterial(0xffd8a9, 0.46);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.052, 9, 7), nodeMaterial);
      node.position.addScaledVector(destinationForward, 0.035);
      group.add(node);
      pieces.push(node);
    } else if (destinationCellId === EARLY_HUB_CELL) {
      signatureId = "chorus_triad";
      signatureLabel = "Hub chorus triad";
      const triadPositions = [
        side.clone().multiplyScalar(-0.16),
        side.clone().multiplyScalar(0.08).addScaledVector(bend, 0.14),
        side.clone().multiplyScalar(0.08).addScaledVector(bend, -0.14)
      ];
      const triadColors = [0x87d8e8, 0xffc98c, 0x87d8e8];
      triadPositions.forEach((position, index) => {
        const material = makeMaterial(triadColors[index], 0.42);
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.052, 9, 7), material);
        node.position.copy(position);
        node.userData.memoryLandmarkPart = true;
        group.add(node);
        pieces.push(node);
      });
      for (let index = 0; index < triadPositions.length; index += 1) {
        const next = (index + 1) % triadPositions.length;
        const beamMat = makeMaterial(index === 1 ? 0xffc98c : 0x87d8e8, 0.26);
        const beam = this.createEarlyReturnLandmarkBeam(triadPositions[index], triadPositions[next], beamMat);
        beam.userData.memoryLandmarkPart = true;
        group.add(beam);
        pieces.push(beam);
      }
    }

    group.userData.signatureId = signatureId;
    group.userData.signatureLabel = signatureLabel;
    return { group, materials, pieces, signatureId, signatureLabel };
  }

  createEarlyReturnLandmarkContinuity(destinationCellId, seam, axis, side, bend) {
    const group = new THREE.Group();
    const echoes = [];
    const destinationForward = destinationCellId === seam.cells[1]
      ? axis.clone()
      : axis.clone().multiplyScalar(-1);
    const sourceward = destinationForward.clone().multiplyScalar(-1);
    const up = new THREE.Vector3(0, 1, 0);

    group.userData.targetingSuppressed = true;
    group.userData.destinationCellId = destinationCellId;
    group.userData.spatialMemoryContinuity = true;

    const makeMaterial = (color, opacity) => new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity,
      depthWrite: false,
      roughness: 0.48
    });

    const sourceDistances = [0.46, 0.82, 1.18];
    sourceDistances.forEach((distance, tier) => {
      const echoGroup = new THREE.Group();
      const tierMaterials = [];
      const tierPieces = [];
      echoGroup.position.copy(sourceward).multiplyScalar(distance);
      echoGroup.position.addScaledVector(side, (tier - 1) * 0.055);
      echoGroup.position.addScaledVector(bend, Math.sin((tier + 1) * 1.7) * 0.045);
      echoGroup.scale.setScalar(0.82 - tier * 0.08);
      echoGroup.userData.spatialMemoryContinuityEcho = true;
      echoGroup.userData.continuityTier = tier;

      const addMaterial = (color, opacity) => {
        const material = makeMaterial(color, opacity);
        tierMaterials.push(material);
        return material;
      };

      if (destinationCellId === EARLY_SURFACE_CELL) {
        const material = addMaterial(0x9bd8c8, 0.16);
        const offsets = [
          side.clone().multiplyScalar(-0.075),
          side.clone().multiplyScalar(0.045).addScaledVector(bend, 0.065),
          side.clone().multiplyScalar(0.045).addScaledVector(bend, -0.065)
        ];
        offsets.forEach((offset, index) => {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.043, 7, 5), material.clone());
          tierMaterials.push(petal.material);
          petal.position.copy(offset);
          petal.scale.set(1.5, 0.60, 0.46);
          petal.rotation.z = index * 1.05;
          echoGroup.add(petal);
          tierPieces.push(petal);
        });
      } else if (destinationCellId === EARLY_GUIDE_CELL) {
        const ribDirection = bend.clone().normalize();
        [-1, 1].forEach((sign, index) => {
          const material = addMaterial(index === 0 ? 0xffc98c : 0xe89268, 0.17);
          const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.013, 0.22, 6), material);
          rib.quaternion.setFromUnitVectors(up, ribDirection);
          rib.position.copy(side).multiplyScalar(sign * 0.060);
          rib.position.addScaledVector(destinationForward, index === 0 ? -0.018 : 0.018);
          echoGroup.add(rib);
          tierPieces.push(rib);
        });
      } else if (destinationCellId === EARLY_HUB_CELL) {
        const positions = [
          side.clone().multiplyScalar(-0.078),
          side.clone().multiplyScalar(0.040).addScaledVector(bend, 0.070),
          side.clone().multiplyScalar(0.040).addScaledVector(bend, -0.070)
        ];
        positions.forEach((position, index) => {
          const material = addMaterial(index === 1 ? 0xffc98c : 0x87d8e8, 0.18);
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.028, 7, 5), material);
          node.position.copy(position);
          echoGroup.add(node);
          tierPieces.push(node);
        });
      }

      group.add(echoGroup);
      echoes.push({ group: echoGroup, materials: tierMaterials, pieces: tierPieces, tier, distance });
    });

    return { group, echoes, echoCount: echoes.length };
  }

  createEarlyReturnLandmarkBeam(start, end, material) {
    const delta = end.clone().sub(start);
    const length = Math.max(0.001, delta.length());
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, length, 6), material);
    beam.position.copy(start).add(end).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    return beam;
  }

  updateEarlyReturnVisuals(frameState, nearest) {
    if (!this.earlyReturnRoot) return;
    const activeCellId = frameState.activeCellId ?? "none";
    const t = frameState.runtimeSeconds ?? 0;

    for (const seam of EARLY_RETURN_SEAMS_HC026B) {
      const visual = this.earlyReturnVisuals.get(seam.id);
      if (!visual) continue;
      const visible = this.earlyReturnHasReachedHub && seam.cells.includes(activeCellId);
      visual.group.visible = visible;
      if (!visible) continue;

      const isNearest = nearest?.seamId === seam.id;
      const proximity = isNearest ? nearest.proximity : 0;
      const armed = isNearest && nearest.armed;
      const transition = this.earlyReturnActiveTransition?.seamId === seam.id ? this.earlyReturnActiveTransition : null;
      const transitionPulse = transition ? Math.sin(transition.progress * Math.PI) : 0;
      const breath = 0.5 + 0.5 * Math.sin(t * 2.15);
      const intensity = 0.18 + proximity * 0.34 + (armed ? 0.16 : 0) + transitionPulse * 0.42;

      visual.materials.forEach((material, index) => {
        material.opacity = Math.min(0.78, 0.12 + intensity * (0.56 + index * 0.08));
        material.emissiveIntensity = 0.08 + intensity * 0.72 + breath * 0.06;
      });
      visual.group.scale.setScalar(1 + transitionPulse * 0.12 + proximity * 0.025);

      const destinationCellId = seam.cells[0] === activeCellId ? seam.cells[1] : seam.cells[0];
      for (const [cellId, signature] of visual.signatures ?? []) {
        const signatureActive = cellId === destinationCellId;
        signature.group.visible = signatureActive;
        if (signature.continuity?.group) signature.continuity.group.visible = signatureActive;
        if (!signatureActive) continue;
        const landmarkBreath = 0.5 + 0.5 * Math.sin(t * 1.45 + (seam.id === "hub_guide_memory_seam" ? 1.2 : 0));
        const landmarkStrength = 0.30 + proximity * 0.24 + (armed ? 0.10 : 0) + transitionPulse * 0.22;
        signature.materials.forEach((material, index) => {
          material.opacity = Math.min(0.74, 0.20 + landmarkStrength * (0.58 + (index % 3) * 0.06));
          if ("emissiveIntensity" in material) material.emissiveIntensity = 0.12 + landmarkStrength * 0.52 + landmarkBreath * 0.07;
        });
        signature.group.scale.setScalar(1.08 + landmarkBreath * 0.055 + proximity * 0.055 + transitionPulse * 0.08);

        const continuity = signature.continuity;
        if (continuity?.group) {
          continuity.group.visible = true;
          continuity.echoes.forEach((echo) => {
            const distanceFade = 1 - echo.tier * 0.22;
            const continuityBreath = 0.5 + 0.5 * Math.sin(t * (1.05 + echo.tier * 0.11) + echo.tier * 0.8);
            const continuityStrength = (0.18 + proximity * 0.16 + (armed ? 0.05 : 0) + transitionPulse * 0.10) * distanceFade;
            echo.materials.forEach((material, index) => {
              material.opacity = Math.min(0.42, 0.055 + continuityStrength * (0.48 + (index % 3) * 0.05));
              if ("emissiveIntensity" in material) material.emissiveIntensity = 0.05 + continuityStrength * 0.40 + continuityBreath * 0.035;
            });
            echo.group.scale.setScalar((0.82 - echo.tier * 0.08) * (1 + continuityBreath * 0.035 + proximity * 0.025));
          });
        }
      }

      visual.motes.forEach((mote, index) => {
        mote.material.opacity = Math.min(0.82, 0.12 + intensity * 0.62);
        mote.scale.setScalar(0.82 + intensity * 0.42 + Math.sin(t * 2.8 + mote.userData.phase) * 0.08);
        mote.position.copy(mote.userData.basePosition);
        mote.position.y += Math.sin(t * 1.8 + index * 0.9) * 0.018;
      });
    }
  }

  publishEarlyReturnTraversal(frameState, nearest) {
    const activeCellId = frameState.activeCellId ?? "none";
    const transition = this.earlyReturnActiveTransition;
    const firstSliceCell = [EARLY_SURFACE_CELL, EARLY_GUIDE_CELL, EARLY_HUB_CELL].includes(activeCellId);
    const active = Boolean(this.earlyReturnHasReachedHub && firstSliceCell);

    frameState.firstSliceReturnTraversal = {
      pass: "HC-026B",
      owner: "LocalCellBoundaryMorphSystem",
      active,
      hasReachedHub: this.earlyReturnHasReachedHub,
      currentCellId: activeCellId,
      revisitSurfaceActive: Boolean(active && activeCellId === EARLY_SURFACE_CELL),
      revisitGuideActive: Boolean(active && activeCellId === EARLY_GUIDE_CELL),
      revisitHubActive: Boolean(active && activeCellId === EARLY_HUB_CELL),
      nearestSeamId: nearest?.seamId ?? transition?.seamId ?? "none",
      nearestSeamLabel: nearest?.seamLabel ?? transition?.seamLabel ?? "none",
      nearestSeamDistance: nearest?.distance ?? null,
      nearestSeamProximity: nearest?.proximity ?? 0,
      nearestSeamArmed: Boolean(nearest?.armed),
      nearestSeamApproaching: Boolean(nearest?.approaching),
      nearestSeamAlignment: nearest?.alignment ?? 0,
      nearestDestinationCellId: nearest?.destinationCellId ?? transition?.destinationCellId ?? null,
      nearestDestinationSignature: this.earlyReturnSignatureForCell(nearest?.destinationCellId ?? transition?.destinationCellId ?? null),
      spatialMemoryLandmarksEnabled: true,
      spatialMemoryUsesDestinationIdentity: true,
      spatialMemoryUsesWaypointArrows: false,
      guideSeamsHaveDistinctDestinationSignatures: true,
      spatialMemoryLandmarkContinuityEnabled: true,
      spatialMemoryApproachMotifRepeats: true,
      spatialMemoryApproachEchoCountPerDestination: 3,
      spatialMemoryLandmarkContinuityUsesArrows: false,
      transitionActive: Boolean(transition),
      transitionProgress: transition?.progress ?? 0,
      transitionSourceCellId: transition?.sourceCellId ?? null,
      transitionDestinationCellId: transition?.destinationCellId ?? null,
      samePlayerPositionRetained: true,
      deliberateGuidedApproach: false,
      movementLedCrossing: true,
      explicitInteractRequired: false,
      teleport: false,
      routeTopologyMutated: false,
      progressionMutation: false,
      hubMacroMirrorPreserved: true,
      guideRevisitGameplayEnabled: true,
      seams: EARLY_RETURN_SEAMS_HC026B.map((seam) => ({
        id: seam.id,
        label: seam.label,
        cells: [...seam.cells],
        anchor: [...seam.anchor]
      })),
      revisitCounts: { ...this.earlyReturnCounts }
    };
  }

  earlyReturnSignatureForCell(cellId) {
    if (cellId === EARLY_SURFACE_CELL) return { id: "nursery_triad", label: "Surface nursery triad" };
    if (cellId === EARLY_GUIDE_CELL) return { id: "scar_double_rib", label: "Guide scar ribs" };
    if (cellId === EARLY_HUB_CELL) return { id: "chorus_triad", label: "Hub chorus triad" };
    return { id: "none", label: "none" };
  }

  earlyReturnSideKey(seamId, cellId) {
    return `${seamId}:${cellId}`;
  }

  earlyReturnVector(values) {
    return new THREE.Vector3(values?.[0] ?? 0, values?.[1] ?? 0, values?.[2] ?? 0);
  }

  earlyReturnClamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  evaluateReadiness(recipe, frameState) {
    switch (recipe.readiness) {
      case "hub_grave_entry":
        return this.hubEntryReadiness(recipe, frameState, {
          requireGraveReturn: false,
          preparationFlag: "hubToGraveReady"
        });
      case "hub_post_grave_route_entry":
        return this.hubEntryReadiness(recipe, frameState, {
          requireGraveReturn: true,
          preparationFlag: recipe.preparationFlag
        });
      case "grave_return":
        return this.graveReturnReadiness(recipe, frameState);
      case "vascular_return":
        return this.routeReturnReadiness(recipe, frameState, "vascularRhythmRoute", "vascular_route");
      case "silt_return":
        return this.routeReturnReadiness(recipe, frameState, "siltPressureRoute", "silt_burrow_route");
      case "hub_comb_entry":
        return this.hubCombEntryReadiness(recipe, frameState);
      case "comb_return":
        return this.combReturnReadiness(recipe, frameState);
      case "comb_aperture_entry":
        return this.combApertureEntryReadiness(recipe, frameState);
      case "aperture_return":
        return this.apertureReturnReadiness(recipe, frameState);
      default:
        return { ready: false, reason: `unknown_readiness_${recipe.readiness}` };
    }
  }

  hubEntryReadiness(recipe, frameState, { requireGraveReturn, preparationFlag }) {
    const foundation = frameState.hubChamberFoundation ?? {};
    const firstGraveEntry = Boolean(
      recipe.id === "hub_to_grave"
      && !frameState.act1RouteHistory?.graveEntered
    );
    const firstDestinationInvitation = foundation.firstDestinationInvitation ?? {};
    const foundationReady = firstGraveEntry
      ? firstDestinationInvitation.active === true
      : foundation.active === true;
    const routeBody = [
      ...(foundation.routes ?? []),
      ...(foundation.thresholds ?? [])
    ].find((item) => item.gateId === recipe.gateId) ?? null;

    const distance = Number.isFinite(routeBody?.distanceToPlayer)
      ? routeBody.distanceToPlayer
      : Number.POSITIVE_INFINITY;
    const graveReturned = frameState.act1RouteHistory?.graveReturned === true;
    const graveObjectiveComplete =
      frameState.firstSliceObjectives?.grave_memory_read_and_stabilize?.complete === true;
    const hubReadComplete =
      frameState.firstSliceObjectives?.hub_read_route_gates?.complete === true;
    const destinationPrepared =
      frameState.transitionContinuity?.[preparationFlag] === true;

    const prerequisites = requireGraveReturn
      ? graveReturned && graveObjectiveComplete
      : true;

    return {
      ready: Boolean(
        foundationReady &&
        prerequisites &&
        destinationPrepared &&
        distance <= recipe.interactionRange
      ),
      distance,
      interactionRange: recipe.interactionRange,
      destinationPrepared,
      graveReturned,
      graveObjectiveComplete,
      hubReadComplete,
      firstGraveEntry,
      foundationReady,
      firstDestinationInvitationActive: Boolean(firstDestinationInvitation.active),
      screenTruthOwnsFirstDestinationPermission: false,
      targetPosition: routeBody?.position
        ? { x: routeBody.position[0] ?? 0, y: routeBody.position[1] ?? 0, z: routeBody.position[2] ?? 0 }
        : null
    };
  }

  graveReturnReadiness(recipe, frameState) {
    const grave = frameState.graveMemoryRoute ?? {};
    const distance = Number.isFinite(grave.returnFoldDistance)
      ? grave.returnFoldDistance
      : Number.POSITIVE_INFINITY;
    const interactionRange = grave.returnFoldInteractionRange ?? recipe.interactionRange;
    const returnRegion = frameState.graveReturnRegion ?? {};
    // HC031A1: phase-2 return grammar earns progression credit but never owns
    // permission to leave. The authored Grave fold remains safe whenever Grave I
    // itself says it is ready, including on unresolved return visits.
    return {
      ready: Boolean(
        grave.returnFoldReady &&
        grave.graveMemoryImprintCommitted &&
        distance <= interactionRange
      ),
      distance,
      interactionRange,
      returnReady: Boolean(grave.returnFoldReady),
      returnRegionActive: Boolean(returnRegion.active),
      returnRegionResolved: Boolean(!returnRegion.active || returnRegion.completed),
      returnRegionBlocksExit: false
    };
  }

  routeReturnReadiness(recipe, frameState, stateKey, regionId) {
    const route = frameState[stateKey] ?? {};
    const contract = frameState.act1RouteContract ?? {};
    const matchingContract = contract.regionId === regionId;
    const distance = matchingContract && Number.isFinite(contract.returnFoldDistance)
      ? contract.returnFoldDistance
      : Number.isFinite(route.returnFoldDistance)
        ? route.returnFoldDistance
        : Number.POSITIVE_INFINITY;
    const interactionRange =
      contract.returnFoldInteractionRange ??
      route.returnFoldInteractionRange ??
      recipe.interactionRange;

    return {
      ready: Boolean(route.returnFoldReady && route.completed && distance <= interactionRange),
      distance,
      interactionRange,
      returnReady: Boolean(route.returnFoldReady)
    };
  }

  hubCombEntryReadiness(recipe, frameState) {
    const foundation = frameState.hubChamberFoundation ?? {};
    const routeBody = [
      ...(foundation.routes ?? []),
      ...(foundation.thresholds ?? [])
    ].find((item) => item.gateId === recipe.gateId) ?? null;

    const distance = Number.isFinite(routeBody?.distanceToPlayer)
      ? routeBody.distanceToPlayer
      : Number.POSITIVE_INFINITY;
    const history = frameState.act1RouteHistory ?? {};
    const convergenceComplete = Boolean(
      history.hubThreeRouteConvergenceCompleted ||
      frameState.hubInvestigationGameplay?.threeRouteConvergence?.completed ||
      (history.graveReturned && history.vascularReturned && history.siltReturned)
    );
    const destinationPrepared =
      frameState.transitionContinuity?.[recipe.preparationFlag] === true;

    return {
      ready: Boolean(
        foundation.completed &&
        convergenceComplete &&
        destinationPrepared &&
        distance <= recipe.interactionRange
      ),
      distance,
      interactionRange: recipe.interactionRange,
      convergenceComplete,
      destinationPrepared,
      targetPosition: routeBody?.position
        ? { x: routeBody.position[0] ?? 0, y: routeBody.position[1] ?? 0, z: routeBody.position[2] ?? 0 }
        : null
    };
  }

  combReturnReadiness(recipe, frameState) {
    const foundation = frameState.combThresholdFoundation ?? {};
    const distance = Number.isFinite(foundation.returnFoldDistance)
      ? foundation.returnFoldDistance
      : Number.POSITIVE_INFINITY;
    const interactionRange =
      foundation.returnFoldInteractionRange ?? recipe.interactionRange;

    return {
      ready: Boolean(
        foundation.active &&
        foundation.returnFoldReady &&
        distance <= interactionRange
      ),
      distance,
      interactionRange,
      returnReady: Boolean(foundation.returnFoldReady)
    };
  }

  combApertureEntryReadiness(recipe, frameState) {
    const foundation = frameState.combThresholdFoundation ?? {};
    const playable = frameState.combThresholdPlayable ?? {};
    const distance = Number.isFinite(foundation.apertureSealDistance)
      ? foundation.apertureSealDistance
      : Number.POSITIVE_INFINITY;
    const interactionRange =
      foundation.apertureSealReadRange ?? recipe.interactionRange;
    const destinationPrepared =
      frameState.transitionContinuity?.[recipe.preparationFlag] === true;

    return {
      ready: Boolean(
        playable.challengeComplete &&
        foundation.apertureViewOpened &&
        destinationPrepared &&
        distance <= interactionRange
      ),
      distance,
      interactionRange,
      challengeComplete: Boolean(playable.challengeComplete),
      apertureViewOpened: Boolean(foundation.apertureViewOpened),
      destinationPrepared
    };
  }

  apertureReturnReadiness(recipe, frameState) {
    const arrival = frameState.apertureFieldsArrival ?? {};
    const distance = Number.isFinite(arrival.returnFoldDistance)
      ? arrival.returnFoldDistance
      : Number.POSITIVE_INFINITY;
    const interactionRange =
      arrival.returnFoldInteractionRange ?? recipe.interactionRange;

    return {
      ready: Boolean(
        arrival.active &&
        arrival.returnFoldReady &&
        distance <= interactionRange
      ),
      distance,
      interactionRange,
      returnReady: Boolean(arrival.returnFoldReady)
    };
  }

  updateGuidedHubCommitFlight(recipe, state, frameState) {
    const guided = Boolean(
      recipe.guidedApproach
      && recipe.sourceCellId === EARLY_HUB_CELL
      && this.playerRoot
      && state.guidedStartPosition
      && state.guidedTargetPosition
    );

    if (!guided) {
      if (frameState.hubRouteCommitFlight?.owner === "LocalCellBoundaryMorphSystem") {
        frameState.hubRouteCommitFlight = {
          ...frameState.hubRouteCommitFlight,
          active: false,
          progress: state.progress ?? 0
        };
      }
      return;
    }

    const t = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(state.progress / 0.82, 0, 1), 0, 1);
    this.guidedPoint.lerpVectors(state.guidedStartPosition, state.guidedTargetPosition, t);
    this.guidedPoint.y += Math.sin(Math.PI * t) * 0.18;
    this.playerRoot.position.copy(this.guidedPoint);

    frameState.hubRouteCommitFlight = {
      pass: "HC-028F1",
      active: t < 0.999 && state.progress < 1,
      owner: "LocalCellBoundaryMorphSystem",
      routeId: recipe.routeId,
      gateId: recipe.gateId,
      progress: t,
      controlSuppressedDuringFlight: true,
      teleport: false,
      deliberate: true
    };
  }

  consumeFreshTrigger(trigger, frameState, recipe = null) {
    const input = frameState.input ?? {};
    if (trigger === "pulse") {
      const eventId = input.pulseEventId ?? (input.pulsePressed ? frameState.frame ?? 0 : -1);
      const fresh = Boolean(input.pulsePressed && eventId !== this.lastPulseEventId);
      if (fresh) this.lastPulseEventId = eventId;
      return fresh;
    }
    if (trigger === "stabilize_pulse") {
      const eventId = input.pulseEventId ?? (input.pulsePressed ? frameState.frame ?? 0 : -1);
      const fresh = Boolean(
        input.stabilizeHeld &&
        input.pulsePressed &&
        eventId !== this.lastPulseEventId
      );
      if (fresh) this.lastPulseEventId = eventId;
      return fresh;
    }
    if (trigger === "interact") {
      const eventId = input.interactEventId ?? (input.interactPressed ? frameState.frame ?? 0 : -1);
      const fresh = Boolean(input.interactPressed && eventId !== this.lastInteractEventId);
      if (fresh) this.lastInteractEventId = eventId;
      return fresh;
    }
    if (trigger === "commit") {
      const request = frameState.hubRouteCommitRequest ?? null;
      const eventId = request?.eventId ?? "none";
      const matches = Boolean(
        request
        && request.routeId === recipe?.routeId
        && request.gateId === recipe?.gateId
        && eventId !== "none"
        && eventId !== this.lastCommitEventId
      );
      if (matches) this.lastCommitEventId = eventId;
      return matches;
    }
    if (trigger === "proximity") {
      // HC028B1: completed Vascular/Silt return folds own their transition once the
      // player physically enters the authored fold range. No second hidden button
      // confirmation is required after the route has already resolved.
      return true;
    }
    return false;
  }

  completeBoundary(recipe, state, frameState) {
    state.active = false;
    state.completed = true;
    state.progress = 1;
    this.commitHistory(recipe, frameState);

    // The generic morph system is the sole owner of these six active-cell mutations.
    frameState.activeCellId = recipe.destinationCellId;
    if (frameState.hubRouteCommitFlight?.owner === "LocalCellBoundaryMorphSystem") {
      frameState.hubRouteCommitFlight = {
        ...frameState.hubRouteCommitFlight,
        active: false,
        progress: 1
      };
    }
    this.activeRecipeId = null;
    this.publishBoundary(recipe, state, frameState, recipe.completePhase);
  }

  commitHistory(recipe, frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const previous = history.routeStates?.[recipe.routeId] ?? {};
    const entering = recipe.direction === "entry";
    const returning = recipe.direction === "return";

    let completed = Boolean(previous.completed);
    if (recipe.routeId === "grave_memory_route") {
      completed = Boolean(completed || frameState.graveMemoryRoute?.graveMemoryImprintCommitted);
    } else if (recipe.routeId === "vascular_route") {
      completed = Boolean(completed || frameState.vascularRhythmRoute?.completed);
    } else if (recipe.routeId === "silt_burrow_route") {
      completed = Boolean(completed || frameState.siltPressureRoute?.completed);
    } else if (recipe.routeId === "comb_threshold") {
      completed = Boolean(
        completed ||
        frameState.firstSliceObjectives?.comb_threshold_playable_synthesis?.complete ||
        frameState.combThresholdPlayable?.completed
      );
    }

    const routeStates = {
      ...(history.routeStates ?? {}),
      [recipe.routeId]: {
        ...previous,
        entered: Boolean(previous.entered || entering || returning),
        returned: Boolean(previous.returned || returning),
        entryCount: entering ? (previous.entryCount ?? 0) + 1 : previous.entryCount ?? 1,
        returnCount: returning ? (previous.returnCount ?? 0) + 1 : previous.returnCount ?? 0,
        completed,
        lastGateId: recipe.gateId,
        lastCrossingFrame: frameState.frame ?? 0,
        transitionOwner: "LocalCellBoundaryMorphSystem"
      }
    };

    let next = {
      ...history,
      pass: frameState.buildManifest?.id ?? frameState.buildId ?? "HC-016G",
      routeStates,
      lastTransition: {
        from: recipe.sourceCellId,
        to: recipe.destinationCellId,
        routeId: recipe.routeId,
        boundaryId: recipe.id,
        transitionOwner: "LocalCellBoundaryMorphSystem",
        transitionType: "recipe_driven_continuous_anatomical_morph",
        frame: frameState.frame ?? 0
      }
    };

    if (recipe.completion === "grave_entry") {
      next.graveEntered = true;
      next.graveEntryCount = (history.graveEntryCount ?? 0) + 1;
    } else if (recipe.completion === "grave_return") {
      const grave = frameState.graveMemoryRoute ?? {};
      next = {
        ...next,
        graveReturned: true,
        graveReturnCount: (history.graveReturnCount ?? 0) + 1,
        routeContractsAwake: true,
        memoryThreadRetained: Boolean(history.memoryThreadRetained || grave.memoryThreadRetained),
        safeMemoryTransferComplete: Boolean(history.safeMemoryTransferComplete || grave.safeMemoryTransferComplete),
        graveMemoryImprintCommitted: Boolean(history.graveMemoryImprintCommitted || grave.graveMemoryImprintCommitted),
        graveTraceIntegrity: Math.max(
          history.graveTraceIntegrity ?? 0,
          grave.graveMemoryImprintCommitted ? grave.traceIntegrity ?? 0 : 0
        ),
        graveRiskEventCount: Math.max(history.graveRiskEventCount ?? 0, grave.riskEventCount ?? 0),
        graveResidueRecoilRecovered: Boolean(
          history.graveResidueRecoilRecovered || grave.residueRecoilRecovered
        )
      };
    } else if (recipe.completion === "vascular_return") {
      const vascular = frameState.vascularRhythmRoute ?? {};
      next = {
        ...next,
        vascularReturned: true,
        vascularReturnCount: (history.vascularReturnCount ?? 0) + 1,
        vascularCompleted: Boolean(history.vascularCompleted || vascular.completed),
        vascularCadenceReads: Math.max(history.vascularCadenceReads ?? 0, vascular.lockedCadenceReads ?? 0),
        vascularSynchronization: Math.max(
          history.vascularSynchronization ?? 0,
          vascular.completed ? vascular.synchronization ?? 0 : 0
        ),
        vascularCirculationIntegrity: Math.max(
          history.vascularCirculationIntegrity ?? 0,
          vascular.completed ? vascular.circulationIntegrity ?? 0 : 0
        ),
        vascularDesynchronizationRecovered: Boolean(
          history.vascularDesynchronizationRecovered || vascular.desynchronizationRecovered
        )
      };
    } else if (recipe.completion === "silt_return") {
      const silt = frameState.siltPressureRoute ?? {};
      next = {
        ...next,
        siltReturned: true,
        siltReturnCount: (history.siltReturnCount ?? 0) + 1,
        siltCompleted: Boolean(history.siltCompleted || silt.completed),
        siltPressureRead: Boolean(history.siltPressureRead || silt.pressureRead),
        siltRibsReleased: Boolean(history.siltRibsReleased || silt.ribsReleased),
        siltSafeMatterAbsorbed: Boolean(history.siltSafeMatterAbsorbed || silt.safeMatterAbsorbed),
        siltDenseMatterLeftIntact: Boolean(history.siltDenseMatterLeftIntact || silt.denseMatterLeftIntact),
        siltFailureCount: Math.max(history.siltFailureCount ?? 0, silt.failureCount ?? 0),
        siltFailureRecovered: Boolean(history.siltFailureRecovered || silt.failureRecovered),
        siltSettledCompression: silt.completed
          ? Math.min(history.siltSettledCompression ?? 1, silt.compression ?? 1)
          : history.siltSettledCompression ?? 1,
        siltMaxDepthProgress: Math.max(history.siltMaxDepthProgress ?? 0, silt.maxDepthProgress ?? 0)
      };
    } else if (recipe.completion === "comb_entry") {
      next = {
        ...next,
        combEntered: true,
        combEntryCount: (history.combEntryCount ?? 0) + 1
      };
    } else if (recipe.completion === "comb_return") {
      const playable = frameState.combThresholdPlayable ?? {};
      const combObjectiveComplete =
        frameState.firstSliceObjectives?.comb_threshold_playable_synthesis?.complete === true;
      next = {
        ...next,
        combReturned: true,
        combReturnCount: (history.combReturnCount ?? 0) + 1,
        combCompleted: Boolean(
          history.combCompleted ||
          combObjectiveComplete ||
          playable.completed
        )
      };
    } else if (recipe.completion === "aperture_entry") {
      next = {
        ...next,
        apertureFieldsEntered: true,
        apertureFieldsEntryCount: (history.apertureFieldsEntryCount ?? 0) + 1
      };
    } else if (recipe.completion === "aperture_return") {
      next = {
        ...next,
        apertureFieldsReturned: true,
        apertureFieldsReturnCount: (history.apertureFieldsReturnCount ?? 0) + 1
      };
    }

    frameState.act1RouteHistory = next;
  }

  publishBoundary(recipe, state, frameState, phase, details = {}) {
    const snapshot = {
      pass: "HC-016I",
      recipeId: recipe.id,
      active: state.active,
      completed: state.completed,
      boundary: recipe.id,
      owner: "LocalCellBoundaryMorphSystem",
      sourceCellId: recipe.sourceCellId,
      destinationCellId: recipe.destinationCellId,
      routeId: recipe.routeId,
      gateId: recipe.gateId,
      direction: recipe.direction,
      trigger: recipe.trigger,
      phase,
      progress: state.progress,
      durationSeconds: recipe.durationSeconds,
      startFrame: state.startFrame,
      returnTriggerGuard: recipe.direction === "return" && recipe.trigger === "interact"
        ? {
            readyAge: state.readyAge ?? 0,
            armed: Boolean(state.returnTriggerArmed),
            rule: "return requires ready dwell + released interact + fresh interact"
          }
        : null,
      mutatesActiveCell: true,
      legacyGateMutationRequired: false,
      samePlayerPositionRetained: true,
      ...details
    };

    frameState.localCellBoundaryMorphById = {
      ...(frameState.localCellBoundaryMorphById ?? {}),
      [recipe.id]: snapshot
    };

    // Compatibility aliases for existing diagnostics during R1 consolidation.
    const alias = {
      hub_to_grave: "hubGraveMorph",
      grave_to_hub: "graveHubMorphReturn",
      hub_to_vascular: "hubVascularMorph",
      vascular_to_hub: "vascularHubMorphReturn",
      hub_to_silt: "hubSiltMorph",
      silt_to_hub: "siltHubMorphReturn"
    }[recipe.id];
    if (alias) frameState[alias] = snapshot;
  }

  publishCompatibilityReadModel(frameState) {
    // HC-016K compatibility aliases for existing presentation/debug readers.
    // This is derived state only: no input consumption and no gameplay mutation.
    const gates = {};

    const surfaceMorph = frameState.localCellMorph ?? {};
    gates.surface_to_guide_threshold = {
      id: "surface_to_guide_threshold",
      from: "surface_wake",
      to: "guide_threshold",
      awake: true,
      readable: true,
      crossable: Boolean(
        surfaceMorph.phase === "ready_for_continuous_morph" ||
        surfaceMorph.phase === "morphing_continuous_control"
      ),
      crossed: Boolean(surfaceMorph.completed),
      destinationMounted: Boolean(surfaceMorph.completed || surfaceMorph.phase?.includes("morph")),
      playableReady: true,
      gameplayPending: false,
      interactionDistance: surfaceMorph.interactionDistance ?? null,
      interactionRange: surfaceMorph.interactionRange ?? null,
      interactionReady: Boolean(surfaceMorph.phase === "ready_for_continuous_morph"),
      expectedInput: "morph_owned",
      transitionOwner: "LocalCellMorphSystem",
      compatibilityObserver: "LocalCellBoundaryMorphSystem",
      mutationAuthority: false
    };

    const secondMorph = frameState.secondLocalCellMorph ?? {};
    gates.guide_to_hub_chamber = {
      id: "guide_to_hub_chamber",
      from: "guide_threshold",
      to: "hub_chamber",
      awake: true,
      readable: true,
      crossable: Boolean(
        secondMorph.phase === "ready_for_signal_chorus_morph" ||
        secondMorph.phase === "morphing_into_signal_chorus"
      ),
      crossed: Boolean(secondMorph.completed),
      destinationMounted: Boolean(secondMorph.completed || secondMorph.phase?.includes("morph")),
      playableReady: true,
      gameplayPending: false,
      interactionDistance: secondMorph.interactionDistance ?? null,
      interactionRange: secondMorph.interactionRange ?? null,
      interactionReady: Boolean(secondMorph.phase === "ready_for_signal_chorus_morph"),
      expectedInput: "morph_owned",
      transitionOwner: "SecondLocalCellMorphSystem",
      compatibilityObserver: "LocalCellBoundaryMorphSystem",
      mutationAuthority: false
    };

    for (const recipe of this.recipes) {
      const state = this.stateById.get(recipe.id);
      const readiness = this.evaluateReadiness(recipe, frameState);
      const sourceActive = frameState.activeCellId === recipe.sourceCellId;
      const destinationActive = frameState.activeCellId === recipe.destinationCellId;
      const destinationPrepared = readiness.destinationPrepared !== false;
      const routeState = frameState.act1RouteHistory?.routeStates?.[recipe.routeId] ?? {};

      const enteredPreviously = Boolean(
        routeState.entered ||
        (recipe.routeId === "aperture_fields" && frameState.act1RouteHistory?.apertureFieldsEntered) ||
        (recipe.routeId === "comb_threshold" && frameState.act1RouteHistory?.combEntered)
      );
      const returnedPreviously = Boolean(
        routeState.returned ||
        (recipe.routeId === "aperture_fields" && frameState.act1RouteHistory?.apertureFieldsReturned) ||
        (recipe.routeId === "comb_threshold" && frameState.act1RouteHistory?.combReturned)
      );
      const awake = this.compatibilityAwake(recipe, frameState, readiness);

      gates[recipe.gateId] = {
        id: recipe.gateId,
        from: this.compatibilityRegionId(recipe.sourceCellId),
        to: this.compatibilityRegionId(recipe.destinationCellId),
        awake,
        readable: Boolean(awake),
        crossable: Boolean(readiness.ready),
        crossed: Boolean(
          state?.completed ||
          destinationActive ||
          (recipe.direction === "entry" ? enteredPreviously : returnedPreviously)
        ),
        destinationMounted: Boolean(destinationPrepared),
        playableReady: Boolean(destinationPrepared),
        gameplayPending: Boolean(awake && !destinationPrepared),
        interactionDistance: Number.isFinite(readiness.distance) ? readiness.distance : null,
        interactionRange: readiness.interactionRange ?? recipe.interactionRange ?? null,
        interactionReady: Boolean(readiness.ready),
        expectedInput: recipe.trigger === "stabilize_pulse" ? "stabilize_plus_pulse" : recipe.trigger === "commit" ? "A_deliberate_commit" : recipe.trigger,
        transitionOwner: "LocalCellBoundaryMorphSystem",
        compatibilityObserver: "LocalCellBoundaryMorphSystem",
        mutationAuthority: false,
        recipeId: recipe.id,
        routeId: recipe.routeId,
        sourceActive,
        destinationActive
      };
    }

    const currentRegionId = this.compatibilityRegionId(frameState.activeCellId);
    const candidates = Object.values(gates).filter((item) => item.from === currentRegionId);
    const activeGate = candidates.find((item) => item.interactionReady)
      ?? candidates.find((item) => item.crossable)
      ?? candidates.find((item) => item.readable)
      ?? candidates[0]
      ?? null;

    frameState.firstSliceGates = gates;
    frameState.gateState = activeGate
      ? {
          ...activeGate,
          status: activeGate.crossable
            ? "derived_crossable"
            : activeGate.readable
              ? "derived_readable"
              : "derived_dormant",
          mutationAuthority: false
        }
      : {
          id: "none",
          from: currentRegionId,
          to: "none",
          status: "no_authored_boundary_in_current_scope",
          readable: false,
          crossable: false,
          crossed: false,
          mutationAuthority: false,
          transitionOwner: "none",
          compatibilityObserver: "LocalCellBoundaryMorphSystem"
        };

    const vascular = gates.hub_to_vascular_route ?? {};
    const silt = gates.hub_to_silt_burrow_route ?? {};
    frameState.act1RouteRuntimeContract = {
      pass: "HC-016K",
      owner: "LocalCellBoundaryMorphSystem",
      destinationOwner: "Act1RouteContractSystem",
      persistenceOwner: "LocalCellBoundaryMorphSystem",
      wakeCondition: "graveReturned",
      wakeConditionMet: Boolean(frameState.act1RouteHistory?.graveReturned),
      mountedDestinationCount: [vascular, silt].filter((item) => item.destinationMounted).length,
      playableDestinationCount: [vascular, silt].filter((item) => item.playableReady).length,
      gameplayPendingCount: [vascular, silt].filter((item) => item.gameplayPending).length,
      compatibilityOnly: true,
      mutationAuthority: false
    };
  }

  compatibilityAwake(recipe, frameState, readiness) {
    if (recipe.id === "hub_to_grave") {
      const firstGraveEntry = !frameState.act1RouteHistory?.graveEntered;
      if (firstGraveEntry) {
        return Boolean(
          frameState.activeCellId === recipe.sourceCellId
          && readiness.destinationPrepared
        );
      }
      // CONNECTION15: later Grave visits use mounted Hub readiness, not the
      // whole-junction screen-composition diagnostic. Preparation stays owned here.
      return Boolean(frameState.hubChamberFoundation?.active && readiness.destinationPrepared);
    }
    if (recipe.id === "hub_to_vascular" || recipe.id === "hub_to_silt") {
      return Boolean(
        frameState.act1RouteHistory?.graveReturned &&
        frameState.firstSliceObjectives?.grave_memory_read_and_stabilize?.complete
      );
    }
    if (recipe.id === "hub_to_comb") {
      const history = frameState.act1RouteHistory ?? {};
      return Boolean(
        history.hubThreeRouteConvergenceCompleted ||
        frameState.hubInvestigationGameplay?.threeRouteConvergence?.completed ||
        (history.graveReturned && history.vascularReturned && history.siltReturned)
      );
    }
    if (recipe.id === "comb_to_aperture") {
      return Boolean(frameState.combThresholdPlayable?.challengeComplete);
    }
    if (recipe.direction === "return") {
      return Boolean(frameState.activeCellId === recipe.sourceCellId || readiness.returnReady);
    }
    return Boolean(frameState.activeCellId === recipe.sourceCellId);
  }

  compatibilityRegionId(cellId) {
    const map = {
      CELL_MEMBRANE_NURSERY_001: "surface_wake",
      CELL_SCAR_FLOW_FOLD_001: "guide_threshold",
      CELL_SIGNAL_CHORUS_NERVE_001: "hub_chamber",
      CELL_GRAVE_MEMORY_RESIDUE_BED_001: "grave_memory_route",
      CELL_VASCULAR_RHYTHM_ROUTE_001: "vascular_route",
      CELL_SILT_PRESSURE_ROUTE_001: "silt_burrow_route",
      CELL_COMB_THRESHOLD_FILTER_001: "comb_threshold",
      CELL_APERTURE_FIELDS_ARRIVAL_001: "aperture_fields"
    };
    return map[cellId] ?? "outside_first_slice";
  }

  publishAggregate(frameState) {
    const active = this.activeRecipeId
      ? frameState.localCellBoundaryMorphById?.[this.activeRecipeId] ?? null
      : null;
    frameState.localCellBoundaryMorph = {
      pass: "HC-016I",
      owner: "LocalCellBoundaryMorphSystem",
      recipeCount: this.recipes.length,
      active: Boolean(active),
      activeRecipeId: this.activeRecipeId,
      activeBoundary: active?.boundary ?? null,
      activePhase: active?.phase ?? null,
      progress: active?.progress ?? 0,
      migratedGateCount: this.recipes.length,
      routeSpecificAdapterCount: 0,
      genericRecipeDriven: true
    };
  }
}
