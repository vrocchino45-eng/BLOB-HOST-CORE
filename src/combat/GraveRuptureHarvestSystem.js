import * as THREE from "three";
import {
  applyRupturePulse,
  applyRuptureStabilize,
  clamp01,
  fragmentCaptureWindow,
  ruptureStageFor,
  shouldRupture
} from "./RuptureHarvestGrammar.js";
import {
  FRAGMENT_FIELD_RULES,
  selectFragmentFieldCandidates,
  stylePullMultiplier
} from "./FragmentHarvestFieldGrammar.js";

const ROUTE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";

const BREAKABLES = Object.freeze([
  Object.freeze({
    id: "grave_rupture_brittle_node_001",
    role: "brittle_memory_node",
    style: "brittle",
    offset: Object.freeze([1.65, 0.58, -7.15]),
    threshold01: 0.78,
    susceptibility: 1.08,
    color: 0xd8a894,
    fragmentIds: Object.freeze([
      "grave_memory_shard_001",
      "grave_memory_shard_002",
      "grave_memory_shard_003",
      "grave_memory_shard_004"
    ])
  }),
  Object.freeze({
    id: "grave_rupture_silt_sac_001",
    role: "residue_pressure_sac",
    style: "silt",
    offset: Object.freeze([-2.05, -0.02, -11.25]),
    threshold01: 0.84,
    susceptibility: 0.94,
    color: 0xa8b6ac,
    fragmentIds: Object.freeze([
      "grave_silt_mote_001",
      "grave_silt_mote_002",
      "grave_silt_mote_003",
      "grave_silt_mote_004"
    ])
  }),
  Object.freeze({
    id: "grave_rupture_echo_carrier_001",
    role: "drifting_echo_carrier",
    style: "echo",
    offset: Object.freeze([2.15, 0.82, -15.55]),
    threshold01: 0.72,
    susceptibility: 1.16,
    color: 0x9fc9d8,
    fragmentIds: Object.freeze([
      "grave_echo_fleck_001",
      "grave_echo_fleck_002",
      "grave_echo_fleck_003",
      "grave_echo_fleck_004"
    ])
  })
]);

const BREAKABLE_BY_ID = new Map(BREAKABLES.map((def) => [def.id, def]));
const FRAGMENT_TO_BREAKABLE = new Map();
for (const def of BREAKABLES) {
  for (const id of def.fragmentIds) FRAGMENT_TO_BREAKABLE.set(id, def.id);
}

const DIRECTION_SETS = Object.freeze({
  brittle: Object.freeze([
    Object.freeze([1.00, 0.26, -0.22]),
    Object.freeze([-0.82, 0.42, -0.58]),
    Object.freeze([0.36, 0.68, 0.91]),
    Object.freeze([-0.54, -0.08, 1.00])
  ]),
  silt: Object.freeze([
    Object.freeze([0.46, 0.84, -0.18]),
    Object.freeze([-0.38, 0.76, -0.44]),
    Object.freeze([0.22, 0.58, 0.72]),
    Object.freeze([-0.54, 0.46, 0.58])
  ]),
  echo: Object.freeze([
    Object.freeze([0.82, 0.18, 0.54]),
    Object.freeze([-0.72, 0.34, 0.64]),
    Object.freeze([0.34, 0.52, -0.88]),
    Object.freeze([-0.44, -0.02, -1.00])
  ])
});

const round = (value) => Number((Number.isFinite(value) ? value : 0).toFixed(3));

/**
 * HC031C2 — Fragment Field Capture.
 *
 * Intact matter keeps the retained-relationship / soft-bond grammar. Once matter has
 * ruptured into loose debris, holding Absorb creates a bounded forward harvest field:
 * at most two nearby fragments are pulled toward the Core at once and are consumed on
 * contact. Missed fragments still cool into persistent residue. No new input, weapon,
 * health bar, route gate, or global targeting rule is introduced.
 */
export class GraveRuptureHarvestSystem {
  constructor({ scene, camera, playerRoot, frameState, chemObjectSystem, graveMemoryRouteSystem, graveReturnRegionSystem }) {
    if (!scene || !camera || !playerRoot || !frameState || !chemObjectSystem || !graveMemoryRouteSystem || !graveReturnRegionSystem) {
      throw new Error("[GraveRuptureHarvestSystem] scene, camera, playerRoot, frameState, chemObjectSystem, graveMemoryRouteSystem and graveReturnRegionSystem are required.");
    }
    this.scene = scene;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.chemObjectSystem = chemObjectSystem;
    this.graveMemoryRouteSystem = graveMemoryRouteSystem;
    this.graveReturnRegionSystem = graveReturnRegionSystem;

    this.root = new THREE.Group();
    this.root.name = "grave_ii_rupture_harvest_aftermath_HC031C1";
    this.root.visible = false;
    this.root.userData.targetingSuppressed = true;

    this.breakables = new Map();
    this.fragments = new Map();
    this.residues = [];
    this.bursts = [];
    this.active = false;
    this.wasActive = false;
    this.spawned = false;
    this.lastPulseEventId = 0;
    this.eventSequence = 0;
    this.ruptureCount = 0;
    this.collectedCount = 0;
    this.residueCount = 0;
    this.lastEvent = null;
    this.temp = new THREE.Vector3();
    this.temp2 = new THREE.Vector3();
    this.temp3 = new THREE.Vector3();
    this.cameraPosition = new THREE.Vector3();
    this.cameraDirection = new THREE.Vector3();
    this.fieldPulledIds = new Set();
    this.fieldCaptureActive = false;
    this.lastFieldCandidateCount = 0;
  }

  init() {
    this.scene.add(this.root);
    this.publish(this.frameState);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    this.active = Boolean(
      frameState.activeCellId === ROUTE_CELL_ID
      && frameState.graveReturnRegion?.active
      && (frameState.graveReturnRegion?.phase ?? 0) >= 2
    );
    this.root.visible = this.active;

    if (!this.active) {
      if (this.wasActive) this.coolAllLiveFragments("left_grave_ii");
      this.setCombatObjectVisibility(false);
      this.wasActive = false;
      this.publish(frameState);
      return;
    }

    if (!this.spawned) this.spawnBreakables();
    this.setCombatObjectVisibility(true);
    this.positionIntactBreakables(frameState);
    this.consumeIntent(safeDt, frameState);
    this.updateBreakables(safeDt, frameState);
    this.updateFragments(safeDt, frameState);
    this.updateResidues(safeDt, frameState);
    this.updateBursts(safeDt);
    this.wasActive = true;
    this.publish(frameState);
  }

  spawnBreakables() {
    for (const def of BREAKABLES) {
      const item = this.chemObjectSystem.spawnObject(def.id, {
        cellId: ROUTE_CELL_ID,
        visible: true,
        opacity: 1,
        morphRole: "grave_ii_rupture_breakable"
      });
      item.root.userData.ruptureHarvestBreakable = true;
      item.root.userData.ruptureRole = def.role;
      item.root.userData.presentationOwner = "GraveRuptureHarvestSystem";
      this.breakables.set(def.id, {
        def,
        item,
        pressure01: 0,
        stage: "intact",
        ruptured: false,
        spent: false,
        pulseCount: 0,
        fragmentIds: new Set(),
        lastCause: "spawned_in_grave_ii"
      });
    }
    this.spawned = true;
    this.lastEvent = this.makeEvent("combat_field_spawned", { breakableCount: this.breakables.size });
  }

  positionIntactBreakables(frameState) {
    const entry = this.graveMemoryRouteSystem.entryAnchor;
    const octave = frameState.graveReturnRegion?.octave ?? {};
    const resonance = clamp01(octave.resonance01 ?? 0.5);
    const depthScale = Number.isFinite(frameState.graveReturnRegion?.layoutOutputs?.depthScale)
      ? frameState.graveReturnRegion.layoutOutputs.depthScale
      : 1.35;

    for (const state of this.breakables.values()) {
      if (state.ruptured) continue;
      const [x, y, z] = state.def.offset;
      state.item.root.position.set(
        entry.x + x * (1 + resonance * 0.08),
        entry.y + y,
        entry.z + z * (1 + (depthScale - 1) * 0.34)
      );
    }
  }

  consumeIntent(dt, frameState) {
    const targeting = frameState.targeting ?? {};
    if (!targeting.relationshipActive) return;
    const targetId = targeting.relationshipTargetId ?? targeting.targetId ?? "none";
    const state = this.breakables.get(targetId);
    if (!state || state.ruptured) return;

    const input = frameState.input ?? {};
    const reactive = frameState.reactiveStateGrammar?.objects?.[targetId] ?? null;
    const regionalSpread01 = clamp01(frameState.graveResonanceGameplay?.regional?.spread01 ?? 0);
    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    const freshPulse = Boolean(input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId);

    if (freshPulse) {
      this.lastPulseEventId = pulseEventId;
      const before = state.pressure01;
      state.pressure01 = applyRupturePulse({
        pressure01: state.pressure01,
        charge01: input.pulseReleaseCharge01 ?? 0,
        susceptibility: state.def.susceptibility,
        regionalSpread01
      });
      state.pulseCount += 1;
      state.lastCause = "pulse_pressure";
      this.lastEvent = this.makeEvent("rupture_pressure_added", {
        objectId: targetId,
        role: state.def.role,
        fromPressure01: round(before),
        toPressure01: round(state.pressure01),
        pulseCount: state.pulseCount
      });
    }

    if (input.stabilizeHeld || input.resonanceHeld) {
      const before = state.pressure01;
      state.pressure01 = applyRuptureStabilize({
        pressure01: state.pressure01,
        dt,
        settleScale: 1 + (reactive?.containment01 ?? 0) * 0.35
      });
      if (before - state.pressure01 > 0.002) state.lastCause = "stabilize_pressure_settle";
    }

    const reactiveCondition01 = clamp01(reactive?.presentedCondition01 ?? reactive?.condition01 ?? 0);
    if (shouldRupture({
      pressure01: state.pressure01,
      threshold01: state.def.threshold01,
      reactiveCondition01
    })) {
      this.rupture(state, frameState);
    }
  }

  updateBreakables(dt, frameState) {
    const t = frameState.runtimeSeconds ?? 0;
    for (const state of this.breakables.values()) {
      if (state.ruptured) continue;
      const priorStage = state.stage;
      state.stage = ruptureStageFor(state.pressure01, false, false);
      const pivot = state.item.responsePivot;
      if (pivot) {
        const pressure = state.pressure01;
        const jitter = pressure * pressure;
        const pulse = 1 + Math.sin(t * (3.2 + pressure * 7.5) + state.def.offset[2]) * 0.045 * jitter;
        pivot.scale.multiplyScalar(1 + pressure * 0.045);
        pivot.scale.y *= pulse;
        pivot.rotation.y += Math.sin(t * 4.7 + state.def.offset[0]) * jitter * 0.018;
        pivot.position.y += Math.sin(t * 7.1 + state.def.offset[2]) * jitter * 0.018;
      }
      if (state.stage !== priorStage) {
        this.lastEvent = this.makeEvent("rupture_stage_changed", {
          objectId: state.def.id,
          role: state.def.role,
          from: priorStage,
          to: state.stage,
          pressure01: round(state.pressure01)
        });
      }

      // Small passive relaxation keeps combat from becoming a health bar that only rises.
      if (!frameState.input?.pulseHeld && !frameState.input?.pulsePressed) {
        state.pressure01 = Math.max(0, state.pressure01 - dt * 0.018);
      }
      state.item.root.userData.ruptureHarvest = {
        pass: "HC-031C2",
        role: state.def.role,
        style: state.def.style,
        stage: state.stage,
        pressure01: round(state.pressure01),
        threshold01: state.def.threshold01,
        pulseCount: state.pulseCount,
        ruptureReady: state.stage === "critical",
        combatLanguage: "pressure_then_rupture_then_harvest"
      };
    }
  }

  rupture(state, frameState) {
    state.ruptured = true;
    state.stage = "fragmented";
    state.item.root.visible = false;
    state.item.root.userData.ruptured = true;
    this.ruptureCount += 1;

    const origin = state.item.root.position.clone();
    const directions = DIRECTION_SETS[state.def.style] ?? DIRECTION_SETS.brittle;
    state.def.fragmentIds.forEach((fragmentId, index) => {
      const item = this.chemObjectSystem.spawnObject(fragmentId, {
        cellId: ROUTE_CELL_ID,
        visible: true,
        opacity: 1,
        morphRole: "grave_ii_rupture_fragment"
      });
      const direction = new THREE.Vector3(...directions[index % directions.length]).normalize();
      const speed = state.def.style === "brittle" ? 1.55 + index * 0.13
        : state.def.style === "echo" ? 1.15 + index * 0.11
          : 0.78 + index * 0.09;
      item.root.position.copy(origin).addScaledVector(direction, 0.12 + index * 0.025);
      item.root.scale.multiplyScalar(state.def.style === "silt" ? 0.72 : 0.82);
      item.root.userData.ruptureFragment = true;
      item.root.userData.ruptureParentId = state.def.id;
      item.root.userData.captureWindowSeconds = fragmentCaptureWindow(state.def.style, index);
      item.root.userData.presentationOwner = "GraveRuptureHarvestSystem";
      this.fragments.set(fragmentId, {
        id: fragmentId,
        parentId: state.def.id,
        style: state.def.style,
        item,
        velocity: direction.multiplyScalar(speed),
        age: 0,
        captureWindow: fragmentCaptureWindow(state.def.style, index),
        collected: false,
        cooled: false,
        phase: index * 1.37
      });
      state.fragmentIds.add(fragmentId);
    });

    this.createBurst(origin, state.def);
    this.lastEvent = this.makeEvent("object_ruptured", {
      objectId: state.def.id,
      role: state.def.role,
      style: state.def.style,
      fragmentCount: state.def.fragmentIds.length,
      ruptureCount: this.ruptureCount,
      regionalResolution: frameState.graveResonanceGameplay?.resolutionId ?? "none"
    });
  }

  updateFragments(dt, frameState) {
    const fieldSelection = this.selectFieldFragments(frameState);
    this.fieldPulledIds = new Set(fieldSelection.map((candidate) => candidate.fragment.id));
    this.fieldCaptureActive = Boolean(frameState.input?.absorbHeld && this.fieldPulledIds.size > 0);
    this.lastFieldCandidateCount = fieldSelection.length;

    for (const fragment of this.fragments.values()) {
      if (fragment.collected || fragment.cooled) continue;
      const item = fragment.item;
      if (item.absorbed || item.root.userData.absorbed) {
        this.markFragmentCollected(fragment, frameState, "bond_or_external_absorb");
        continue;
      }

      fragment.age += dt;
      const fieldDrawn = this.fieldPulledIds.has(fragment.id);
      const bondDrawn = Boolean(
        frameState.input?.absorbHeld
        && frameState.bondState?.objectId === fragment.id
      );
      const beingDrawn = fieldDrawn || bondDrawn;

      if (fieldDrawn) {
        const captured = this.applyFragmentFieldPull(fragment, dt, frameState);
        if (captured) continue;
      } else {
        const drag = bondDrawn ? 0.28 : fragment.style === "silt" ? 1.05 : fragment.style === "echo" ? 0.62 : 0.82;
        fragment.velocity.multiplyScalar(Math.exp(-dt * drag));

        if (!bondDrawn) {
          if (fragment.style === "silt") {
            fragment.velocity.y += dt * 0.055;
            fragment.velocity.x += Math.sin(fragment.age * 1.7 + fragment.phase) * dt * 0.035;
          } else if (fragment.style === "echo") {
            const vx = fragment.velocity.x;
            fragment.velocity.x += -fragment.velocity.z * dt * 0.32;
            fragment.velocity.z += vx * dt * 0.32;
            fragment.velocity.y += Math.sin(fragment.age * 3.1 + fragment.phase) * dt * 0.028;
          } else {
            fragment.velocity.y -= dt * 0.045;
          }
          item.root.position.addScaledVector(fragment.velocity, dt);
        }
      }

      item.root.rotation.x += dt * (0.6 + fragment.phase * 0.08);
      item.root.rotation.y += dt * (0.8 + fragment.phase * 0.06);
      const life01 = clamp01(fragment.age / fragment.captureWindow);
      item.root.userData.ruptureHarvestFragment = {
        pass: "HC-031C2",
        style: fragment.style,
        age: round(fragment.age),
        captureWindow: round(fragment.captureWindow),
        captureWindowRemaining01: round(1 - life01),
        fieldDrawn,
        bondDrawn,
        consequenceIfMissed: "persistent_ambient_residue"
      };

      if (fragment.age >= fragment.captureWindow) this.coolFragmentToResidue(fragment, "capture_window_elapsed");
    }
  }

  selectFieldFragments(frameState) {
    if (!frameState.input?.absorbHeld) return [];

    this.camera.getWorldPosition(this.cameraPosition);
    this.camera.getWorldDirection(this.cameraDirection).normalize();
    this.playerRoot.getWorldPosition(this.temp3);

    const candidates = [];
    for (const fragment of this.fragments.values()) {
      if (fragment.collected || fragment.cooled || fragment.item.absorbed || fragment.item.root.userData.absorbed) continue;
      fragment.item.root.getWorldPosition(this.temp);
      const distance = this.temp3.distanceTo(this.temp);
      this.temp2.copy(this.temp).sub(this.cameraPosition);
      const cameraDistance = this.temp2.length();
      const aimDot = cameraDistance > 0.0001
        ? this.temp2.multiplyScalar(1 / cameraDistance).dot(this.cameraDirection)
        : 1;
      candidates.push({
        fragment,
        distance,
        aimDot,
        age01: clamp01(fragment.age / Math.max(fragment.captureWindow, 0.001))
      });
    }

    return selectFragmentFieldCandidates(candidates, FRAGMENT_FIELD_RULES.maxConcurrentPulls);
  }

  applyFragmentFieldPull(fragment, dt, frameState) {
    const item = fragment.item;
    this.playerRoot.getWorldPosition(this.temp3);
    item.root.getWorldPosition(this.temp);
    this.temp2.copy(this.temp3).sub(this.temp);
    const distance = this.temp2.length();

    if (distance <= FRAGMENT_FIELD_RULES.captureRadius) {
      this.collectFragment(fragment, frameState, "absorb_field_contact");
      return true;
    }

    if (distance <= 0.0001) return false;
    const proximity01 = clamp01(1 - distance / FRAGMENT_FIELD_RULES.influenceRadius);
    const desiredSpeed = (
      FRAGMENT_FIELD_RULES.basePullSpeed
      + FRAGMENT_FIELD_RULES.nearPullSpeedBonus * proximity01
    ) * stylePullMultiplier(fragment.style);
    this.temp2.multiplyScalar(desiredSpeed / distance);
    const steer = 1 - Math.exp(-Math.max(0, dt) * FRAGMENT_FIELD_RULES.steeringRate);
    fragment.velocity.lerp(this.temp2, steer);
    item.root.position.addScaledVector(fragment.velocity, dt);

    // Evaluate contact again after movement so a fast fragment cannot tunnel through
    // the Core and miss capture for a frame.
    this.playerRoot.getWorldPosition(this.temp3);
    item.root.getWorldPosition(this.temp);
    const postDistance = this.temp3.distanceTo(this.temp);
    if (postDistance <= FRAGMENT_FIELD_RULES.captureRadius) {
      this.collectFragment(fragment, frameState, "absorb_field_contact");
      return true;
    }
    return false;
  }

  collectFragment(fragment, frameState, reason) {
    if (!fragment || fragment.collected || fragment.cooled) return false;
    const recipe = fragment.item.recipe;
    const deltas = recipe.effects?.onPlayerComposition ?? {};
    for (const [key, value] of Object.entries(deltas)) {
      const current = frameState.playerComposition?.[key] ?? 0;
      if (!frameState.playerComposition) frameState.playerComposition = {};
      frameState.playerComposition[key] = clamp01(current + value);
    }

    this.chemObjectSystem.markAbsorbed(fragment.id);
    fragment.collected = true;
    this.collectedCount += 1;
    if (frameState.chemObjectState) {
      frameState.chemObjectState.absorbedObjects = (frameState.chemObjectState.absorbedObjects ?? 0) + 1;
      frameState.chemObjectState.pulseResponse = `${fragment.id}: absorbed_from_rupture_field`;
    }
    this.lastEvent = this.makeEvent("fragment_absorbed", {
      fragmentId: fragment.id,
      parentId: fragment.parentId,
      style: fragment.style,
      reason,
      collectedCount: this.collectedCount
    });
    return true;
  }

  markFragmentCollected(fragment, frameState, reason) {
    if (!fragment || fragment.collected || fragment.cooled) return false;
    fragment.collected = true;
    this.collectedCount += 1;
    this.lastEvent = this.makeEvent("fragment_absorbed", {
      fragmentId: fragment.id,
      parentId: fragment.parentId,
      style: fragment.style,
      reason,
      collectedCount: this.collectedCount
    });
    return true;
  }

  coolAllLiveFragments(reason) {
    for (const fragment of this.fragments.values()) {
      if (!fragment.collected && !fragment.cooled) this.coolFragmentToResidue(fragment, reason);
    }
  }

  coolFragmentToResidue(fragment, reason) {
    if (fragment.collected || fragment.cooled) return;
    fragment.cooled = true;
    const position = fragment.item.root.position.clone();
    this.chemObjectSystem.markAbsorbed(fragment.id);
    this.createResidue(position, fragment.style, fragment.phase, fragment.parentId);
    this.residueCount += 1;
    this.lastEvent = this.makeEvent("fragment_became_residue", {
      fragmentId: fragment.id,
      parentId: fragment.parentId,
      style: fragment.style,
      reason,
      residueCount: this.residueCount
    });
  }

  createResidue(position, style, phase, parentId = "none") {
    let geometry;
    if (style === "brittle") geometry = new THREE.TetrahedronGeometry(0.075, 0);
    else if (style === "echo") geometry = new THREE.OctahedronGeometry(0.062, 0);
    else geometry = new THREE.SphereGeometry(0.065, 7, 5);

    const color = style === "brittle" ? 0xb98c82 : style === "echo" ? 0x8fbec9 : 0x87958d;
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: style === "silt" ? 0.13 : 0.18,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `grave_ii_${style}_missed_residue_${this.residues.length + 1}`;
    mesh.position.copy(position);
    mesh.userData.targetingSuppressed = true;
    mesh.userData.ruptureHarvestResidue = true;
    this.root.add(mesh);
    this.residues.push({
      mesh,
      style,
      phase,
      parentId,
      createdAtRuntime: this.frameState.runtimeSeconds ?? 0,
      velocity: new THREE.Vector3(
        Math.sin(phase + 0.4) * 0.025,
        style === "silt" ? 0.006 : 0.012,
        Math.cos(phase + 0.9) * 0.022
      )
    });
  }

  updateResidues(dt, frameState) {
    const t = frameState.runtimeSeconds ?? 0;
    for (const residue of this.residues) {
      residue.mesh.position.addScaledVector(residue.velocity, dt);
      residue.mesh.position.y += Math.sin(t * 0.55 + residue.phase) * dt * 0.006;
      residue.mesh.rotation.y += dt * (residue.style === "echo" ? 0.22 : 0.08);
      residue.mesh.rotation.z += dt * 0.05;
    }
  }

  createBurst(position, def) {
    const geometry = def.style === "brittle"
      ? new THREE.IcosahedronGeometry(0.26, 0)
      : def.style === "echo"
        ? new THREE.OctahedronGeometry(0.25, 0)
        : new THREE.SphereGeometry(0.28, 10, 7);
    const material = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: def.style === "silt" ? 0.22 : 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `grave_ii_${def.style}_rupture_flash`;
    mesh.position.copy(position);
    mesh.userData.targetingSuppressed = true;
    this.root.add(mesh);
    this.bursts.push({ mesh, age: 0, maxAge: def.style === "silt" ? 0.62 : 0.44 });
  }

  updateBursts(dt) {
    const keep = [];
    for (const burst of this.bursts) {
      burst.age += dt;
      const t = clamp01(burst.age / burst.maxAge);
      burst.mesh.scale.setScalar(1 + t * 2.2);
      burst.mesh.material.opacity = (1 - t) * 0.28;
      if (burst.age < burst.maxAge) keep.push(burst);
      else {
        this.root.remove(burst.mesh);
        burst.mesh.geometry.dispose();
        burst.mesh.material.dispose();
      }
    }
    this.bursts = keep;
  }

  setCombatObjectVisibility(visible) {
    for (const state of this.breakables.values()) {
      state.item.root.visible = Boolean(visible && !state.ruptured && !state.item.absorbed && !state.item.root.userData.absorbed);
    }
    for (const fragment of this.fragments.values()) {
      if (fragment.collected || fragment.cooled) continue;
      fragment.item.root.visible = Boolean(visible && !fragment.item.absorbed && !fragment.item.root.userData.absorbed);
    }
  }

  makeEvent(type, detail = {}) {
    this.eventSequence += 1;
    return {
      eventId: this.eventSequence,
      type,
      frame: this.frameState.frame ?? 0,
      ...detail
    };
  }

  publish(frameState) {
    const breakables = {};
    for (const [id, state] of this.breakables.entries()) {
      breakables[id] = {
        role: state.def.role,
        style: state.def.style,
        stage: state.stage,
        pressure01: round(state.pressure01),
        threshold01: state.def.threshold01,
        ruptured: state.ruptured,
        spent: state.spent,
        pulseCount: state.pulseCount,
        fragmentCount: state.fragmentIds.size,
        lastCause: state.lastCause
      };
    }

    let liveFragments = 0;
    let cooledFragments = 0;
    const liveFragmentIds = [];
    for (const fragment of this.fragments.values()) {
      if (fragment.collected) continue;
      if (fragment.cooled) cooledFragments += 1;
      else {
        liveFragments += 1;
        liveFragmentIds.push(fragment.id);
      }
    }

    for (const state of this.breakables.values()) {
      if (!state.ruptured || state.spent) continue;
      const allFinished = [...state.fragmentIds].every((id) => {
        const fragment = this.fragments.get(id);
        return fragment?.collected || fragment?.cooled;
      });
      if (allFinished) {
        state.spent = true;
        state.stage = "spent";
      }
    }

    frameState.graveRuptureHarvest = {
      pass: "HC-031C2",
      active: this.active,
      owner: "GraveRuptureHarvestSystem",
      combatLanguage: "rupture_fragment_absorb_residue",
      breakables,
      ruptureCount: this.ruptureCount,
      collectedFragmentCount: this.collectedCount,
      liveFragmentCount: liveFragments,
      liveFragmentIds,
      absorbFocusAssistActive: Boolean(frameState.input?.absorbHeld && liveFragments > 0),
      fragmentFieldCaptureActive: this.fieldCaptureActive,
      fragmentFieldPulledIds: [...this.fieldPulledIds],
      fragmentFieldCandidateCount: this.lastFieldCandidateCount,
      fragmentFieldInfluenceRadius: FRAGMENT_FIELD_RULES.influenceRadius,
      fragmentFieldCaptureRadius: FRAGMENT_FIELD_RULES.captureRadius,
      fragmentFieldMaxConcurrentPulls: FRAGMENT_FIELD_RULES.maxConcurrentPulls,
      missedResidueCount: this.residueCount,
      cooledFragmentCount: cooledFragments,
      residuePersistsInRegion: true,
      lastEvent: this.lastEvent,
      rules: {
        newAbilityButtons: 0,
        healthBars: false,
        hackAndSlashAttack: false,
        pulseBuildsRupturePressure: true,
        stabilizeCanSettleRupturePressure: true,
        absorbHarvestsReleasedFragments: true,
        looseFragmentsUseBoundedAbsorbField: true,
        intactMatterStillUsesRetainedRelationship: true,
        fragmentCaptureIsPartial: true,
        missedFragmentsBecomeNonTargetableResidue: true,
        exitBlockedByCombat: false,
        routeProgressionOwnedByCombat: false,
        targetingAuthority: false
      }
    };
  }
}
