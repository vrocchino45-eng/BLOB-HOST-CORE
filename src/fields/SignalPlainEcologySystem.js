import * as THREE from "three";

const CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";
const SIGNAL_CENTER_LOCAL = new THREE.Vector3(-10.5, 3.8, -32.0);
const NODE_OFFSETS = [
  // HC-015C: asymmetric receptor arc around a clear maneuvering pocket.
  new THREE.Vector3(-4.8, 0.65, 2.6),
  new THREE.Vector3(4.35, 1.35, 1.15),
  new THREE.Vector3(0.85, -1.35, -4.15)
];
const DIRECT_APPROACH_OFFSET = new THREE.Vector3(5.8, 1.8, 7.2);

// HC027H — the three existing receptors remain simultaneous questions rather than
// a nearest-first route sequence. HC027I deepens those questions into embodied
// conditions that suggest possible verbs without naming a required input.
const NODE_INTENTION_SIGNATURES = Object.freeze([
  { id: "slow_breath", label: "slow breathing rhythm", condition: "draw_release", impliedVerb: "absorb" },
  { id: "paired_chirp", label: "paired resonant chirp", condition: "call_wait", impliedVerb: "pulse" },
  { id: "shear_drift", label: "shearing drift", condition: "phase_slip", impliedVerb: "stabilize" }
]);

// HC027J — a successful local experiment can leave a bounded physical aftermath.
// These states are intentionally local, temporary and non-progressive; HC027K owns
// any future consequence-to-next-question chaining.
const LOCAL_CONSEQUENCE_SPECS = Object.freeze([
  { id: "redistributed_flow", condition: "draw_release", sourceVerb: "absorb", durationSeconds: 30, materialBehavior: "directional_afterflow" },
  { id: "coherent_answer_cadence", condition: "call_wait", sourceVerb: "pulse", durationSeconds: 36, materialBehavior: "sustained_resonant_cadence" },
  { id: "held_phase_coherence", condition: "phase_slip", sourceVerb: "stabilize", durationSeconds: 34, materialBehavior: "locally_synchronized_stillness" }
]);

// HC027K — persistent consequences can physically couple into another existing
// condition. The relationship is the new information; these links are not
// waypoint routes and multiple links may coexist if the player changes more than
// one receptor.
const CONSEQUENCE_NEXT_QUESTION_SPECS = Object.freeze([
  { sourceIndex: 0, targetIndex: 2, id: "afterflow_exposes_phase_slip", relation: "redistributed_flow_meets_unstable_layers", materialBehavior: "braided_afterflow_breaks_at_slip", delaySeconds: 1.25 },
  { sourceIndex: 1, targetIndex: 0, id: "cadence_entrains_slow_breath", relation: "coherent_answer_wakes_sympathetic_breath", materialBehavior: "resonance_entrains_breathing_volume", delaySeconds: 1.05 },
  { sourceIndex: 2, targetIndex: 1, id: "coherence_reveals_resonant_gap", relation: "stable_pocket_makes_call_wait_gap_legible", materialBehavior: "coherence_band_exposes_resonant_gap", delaySeconds: 1.15 }
]);

export class SignalPlainEcologySystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene || !playerRoot || !frameState) throw new Error("[SignalPlainEcologySystem] scene, playerRoot and frameState are required.");
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.root = null;
    this.entryAnchor = new THREE.Vector3();
    this.signalCenter = new THREE.Vector3();
    this.nodes = [];
    this.observed = [false, false, false];
    this.stabilizeCharge = 0;
    this.completed = false;
    this.response = 0;
    this.lastPulseEventId = -1;
    this.lastAction = "approach_signal_plain";
    this.firstChosenNode = 0;
    this.choiceCount = 0;
    this.affordanceResponse = [0, 0, 0];
    this.previousAbsorbHeld = false;
    this.previousStabilizeHeld = false;
    this.localConsequences = LOCAL_CONSEQUENCE_SPECS.map((spec) => ({
      id: spec.id, active: false, elapsedSeconds: 0, remainingSeconds: 0,
      durationSeconds: spec.durationSeconds, activationCount: 0, sequence: 0, eventId: "none"
    }));
    this.localConsequenceEventCount = 0;
    this.localConsequenceRearmRequired = [false, false, false];
    this.routeGuide = null;
    this.centerBeacon = null;
  }

  init() {
    if (this.root) return;
    this.root = new THREE.Group();
    this.root.name = "signal_plain_first_ecology_loop_HC015K";
    this.root.visible = false;
    this.scene.add(this.root);

    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x9fd7c7, emissive: 0x1a4a42, emissiveIntensity: 0.42, roughness: 0.46, transparent: true, opacity: 0.78 });
    for (let i = 0; i < NODE_OFFSETS.length; i += 1) {
      const group = new THREE.Group();
      group.name = `signal_plain_observation_node_${i + 1}`;
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 1), nodeMat.clone());
      body.scale.set(1.0 + i * 0.12, 0.72 + (i % 2) * 0.18, 1.18 - i * 0.08);
      group.add(body);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xb8efe1, transparent: true, opacity: 0.16, depthWrite: false });
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78 + i * 0.06, 0.035, 7, 28), haloMat);
      halo.rotation.set(Math.PI / 2 + i * 0.23, i * 0.41, i * 0.67);
      halo.name = `signal_plain_node_halo_${i + 1}`;
      group.add(halo);
      const lockMat = new THREE.MeshBasicMaterial({ color: 0xffd66f, transparent: true, opacity: 0.0, depthWrite: false });
      const lockRing = new THREE.Mesh(new THREE.TorusGeometry(1.02 + i * 0.05, 0.06, 7, 30), lockMat);
      lockRing.rotation.set(Math.PI / 2 - i * 0.18, i * 0.22, i * 0.48);
      lockRing.name = `signal_plain_read_lock_${i + 1}`;
      group.add(lockRing);
      const tetherMat = new THREE.MeshBasicMaterial({ color: 0x8ed8c7, transparent: true, opacity: 0.12, depthWrite: false });
      const tether = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 1.2 + i * 0.18, 4, 7), tetherMat);
      tether.rotation.z = Math.PI / 2;
      tether.name = `signal_plain_node_tether_${i + 1}`;
      group.add(tether);
      const filamentMat = nodeMat.clone(); filamentMat.opacity = 0.42;
      const filaments = [];
      for (let f = 0; f < 3; f += 1) {
        const filament = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.72 + f * 0.18, 4, 7), filamentMat);
        filament.rotation.set(Math.PI / 2 + f * 0.35, i * 0.45, f * 1.7);
        group.add(filament);
        filaments.push(filament);
      }
      this.root.add(group);
      this.nodes.push({ group, body, halo, lockRing, tether, filaments, baseScale: body.scale.clone() });
    }

    // HC-015F: world-space interaction grammar owned by the ecology system.
    this.routeGuide = new THREE.Group();
    this.routeGuide.name = "signal_plain_world_route_guide_HC015K";
    this.root.add(this.routeGuide);
    const guideMat = new THREE.MeshBasicMaterial({ color: 0xb8efe1, transparent: true, opacity: 0.0, depthWrite: false });
    for (let i = 0; i < NODE_OFFSETS.length; i += 1) {
      const marker = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.055, 7, 32), guideMat.clone());
      marker.name = `signal_plain_route_marker_${i + 1}`;
      marker.position.copy(NODE_OFFSETS[i]);
      marker.rotation.set(Math.PI / 2, 0, i * 0.65);
      this.routeGuide.add(marker);
    }
    this.centerBeacon = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.075, 8, 42), new THREE.MeshBasicMaterial({ color: 0xffd66f, transparent: true, opacity: 0.0, depthWrite: false }));
    this.centerBeacon.name = "signal_plain_receptive_center_beacon_HC015K";
    this.centerBeacon.rotation.x = Math.PI / 2;
    this.root.add(this.centerBeacon);

    // HC-015J: completion is a world event, not just a boolean.
    const bloomMat = new THREE.MeshBasicMaterial({ color: 0x9ff3dc, transparent: true, opacity: 0.0, depthWrite: false });
    this.responseBloom = new THREE.Mesh(new THREE.SphereGeometry(1.35, 18, 12), bloomMat);
    this.responseBloom.name = "signal_plain_response_bloom_HC015K";
    this.responseBloom.scale.set(0.35, 0.18, 0.35);
    this.root.add(this.responseBloom);

    this.responseSpokes = new THREE.Group();
    this.responseSpokes.name = "signal_plain_response_spokes_HC015K";
    const spokeMat = new THREE.MeshBasicMaterial({ color: 0xb8efe1, transparent: true, opacity: 0.0, depthWrite: false });
    for (let i = 0; i < 6; i += 1) {
      const spoke = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 2.0 + i * 0.16, 4, 7), spokeMat.clone());
      spoke.rotation.set(Math.PI / 2, i * 0.23, i * (Math.PI / 3));
      spoke.position.set(Math.cos(i * Math.PI / 3) * 1.45, (i % 2 ? 0.28 : -0.18), Math.sin(i * Math.PI / 3) * 1.45);
      spoke.name = `signal_plain_response_spoke_${i + 1}`;
      this.responseSpokes.add(spoke);
    }
    this.root.add(this.responseSpokes);

    const responseMat = new THREE.MeshBasicMaterial({ color: 0x8dd8c5, transparent: true, opacity: 0.0, depthWrite: false });
    for (let i = 0; i < 4; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.85, 0.045, 7, 42), responseMat.clone());
      ring.rotation.set(Math.PI / 2, i * 0.16, i * 0.32);
      ring.name = `signal_plain_ecology_response_ring_${i + 1}`;
      this.root.add(ring);
    }

    const organMat = new THREE.MeshStandardMaterial({ color: 0x79b9aa, emissive: 0x173f38, emissiveIntensity: 0.18, roughness: 0.55, transparent: true, opacity: 0.24, depthWrite: false });
    for (let i = 0; i < 3; i += 1) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(1.55, 16, 10), organMat.clone());
      petal.scale.set(1.45, 0.28, 0.78);
      petal.rotation.y = i * (Math.PI * 2 / 3);
      petal.position.set(Math.cos(i * Math.PI * 2 / 3) * 1.35, (i - 1) * 0.18, Math.sin(i * Math.PI * 2 / 3) * 1.35);
      petal.name = `signal_plain_read_response_lobe_${i + 1}`;
      // HC-015K: tight camera may soften a lobe if it physically blocks player/focus readability.
      petal.userData.inspectionFadeable = true;
      petal.userData.livingTissue = true;
      this.root.add(petal);
    }
  }

  markNodeReadThroughVerb(index, verb) {
    if (this.observed[index]) return false;
    this.observed[index] = true;
    if (!this.firstChosenNode) this.firstChosenNode = index + 1;
    this.choiceCount += 1;
    this.lastAction = `read_signal_node_${index + 1}_through_${verb}`;
    return true;
  }

  activateLocalConsequence(index, frameState) {
    const state = this.localConsequences[index];
    const spec = LOCAL_CONSEQUENCE_SPECS[index];
    if (!state || !spec || state.active || this.localConsequenceRearmRequired[index]) return false;
    this.localConsequenceEventCount += 1;
    state.active = true;
    state.elapsedSeconds = 0;
    state.remainingSeconds = spec.durationSeconds;
    state.durationSeconds = spec.durationSeconds;
    state.activationCount += 1;
    state.sequence = this.localConsequenceEventCount;
    state.eventId = `hc027j_${spec.id}_${this.localConsequenceEventCount}`;
    this.localConsequenceRearmRequired[index] = index !== 1;
    this.affordanceResponse[index] = 1;
    this.lastAction = `local_consequence_${spec.id}`;
    frameState.signalPlainLocalConsequenceEvent = {
      pass: "HC-027J", eventId: state.eventId, nodeNumber: index + 1,
      consequenceId: spec.id, conditionId: spec.condition, sourceVerbDebugOnly: spec.sourceVerb,
      durationSeconds: spec.durationSeconds, progressionAuthority: false
    };
    this.markNodeReadThroughVerb(index, spec.sourceVerb);
    return true;
  }

  localConsequenceStrength(state) {
    if (!state?.active || state.durationSeconds <= 0) return 0;
    const attack = THREE.MathUtils.clamp(state.elapsedSeconds / 0.45, 0, 1);
    const release = THREE.MathUtils.clamp(state.remainingSeconds / 4.5, 0, 1);
    return Math.min(attack, release);
  }

  buildConsequenceNextQuestionLinks(player) {
    const links = CONSEQUENCE_NEXT_QUESTION_SPECS.map((spec) => {
      const sourceState = this.localConsequences[spec.sourceIndex];
      const sourceStrength = this.localConsequenceStrength(sourceState);
      const reveal = sourceState?.active
        ? THREE.MathUtils.clamp((sourceState.elapsedSeconds - spec.delaySeconds) / 1.15, 0, 1)
        : 0;
      const strength = sourceStrength * reveal;
      const source = this.signalCenter.clone().add(this.nodes[spec.sourceIndex]?.group.position ?? NODE_OFFSETS[spec.sourceIndex]);
      const target = this.signalCenter.clone().add(this.nodes[spec.targetIndex]?.group.position ?? NODE_OFFSETS[spec.targetIndex]);
      return {
        id: spec.id, eventId: sourceState?.eventId && sourceState.eventId !== "none" ? `hc027k_${sourceState.eventId}_${spec.id}` : "none",
        sourceNodeNumber: spec.sourceIndex + 1, targetNodeNumber: spec.targetIndex + 1,
        sourceConsequenceId: LOCAL_CONSEQUENCE_SPECS[spec.sourceIndex].id,
        relation: spec.relation, materialBehavior: spec.materialBehavior,
        active: Boolean(sourceState?.active && strength > 0.015),
        strength, sequence: sourceState?.sequence ?? 0,
        sourcePosition: { x: source.x, y: source.y, z: source.z },
        targetPosition: { x: target.x, y: target.y, z: target.z },
        targetDistance: player.distanceTo(target),
        targetAlreadyObserved: Boolean(this.observed[spec.targetIndex]),
        createsObjective: false, createsWaypoint: false, prescribesCorrectOrder: false, progressionAuthority: false
      };
    });
    const activeLinks = links.filter((link) => link.active);
    let primary = null;
    for (const link of activeLinks) {
      if (!primary || link.sequence > primary.sequence || (link.sequence === primary.sequence && link.strength > primary.strength)) primary = link;
    }
    return { links, activeLinks, primary };
  }

  resetEncounter() {
    this.observed = [false, false, false];
    this.stabilizeCharge = 0;
    this.completed = false;
    this.response = 0;
    this.lastPulseEventId = -1;
    this.lastAction = "approach_signal_plain";
    this.firstChosenNode = 0;
    this.choiceCount = 0;
    this.affordanceResponse = [0, 0, 0];
    this.previousAbsorbHeld = false;
    this.previousStabilizeHeld = false;
    for (const state of this.localConsequences) {
      state.active = false;
      state.elapsedSeconds = 0;
      state.remainingSeconds = 0;
      state.sequence = 0;
      state.eventId = "none";
    }
    // Keep the event counter monotonic across debug resets so the audio owner never
    // mistakes a later test activation for a previously heard event id.
    this.localConsequenceRearmRequired = [false, false, false];
  }

  onRuntimeMount(frameState) {
    this.init();
    // HC031T2: ApertureFieldsArrivalSystem owns the region's canonical world anchor.
    // Debug staging may reposition the player during this same mount frame, so later
    // systems must never derive authored world geometry from the player's live position.
    const canonicalAnchor = frameState.apertureFieldsArrival?.entryAnchor;
    if (Number.isFinite(canonicalAnchor?.x) && Number.isFinite(canonicalAnchor?.y) && Number.isFinite(canonicalAnchor?.z)) {
      this.entryAnchor.set(canonicalAnchor.x, canonicalAnchor.y, canonicalAnchor.z);
    } else {
      this.entryAnchor.copy(this.playerRoot.position);
    }
    this.signalCenter.copy(this.entryAnchor).add(SIGNAL_CENTER_LOCAL);
    this.root.position.copy(this.signalCenter);
    for (let i = 0; i < this.nodes.length; i += 1) this.nodes[i].group.position.copy(NODE_OFFSETS[i]);
    this.root.visible = true;
    this.resetEncounter();
    frameState.signalPlainEcology = { pass: "HC-015N HOTFIX1", active: true, stage: "approach", observedCount: 0, completed: false };
  }

  onRuntimeUnmount(frameState) {
    if (this.root) this.root.visible = false;
    frameState.signalPlainEcology = { ...(frameState.signalPlainEcology ?? {}), active: false, stage: this.completed ? "local_response_retained" : "encounter_dormant" };
  }

  onRuntimePrepare(frameState) {
    this.init();
    frameState.signalPlainEcologyPreparation = { pass: "HC-015N HOTFIX1", status: "prepared_hidden", mutatesProgression: false };
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== CELL_ID) return;
    if (!this.root) this.init();
    this.root.visible = true;

    const directJump = frameState.debugSignalPlainJumpRequest;
    if (directJump?.pending) {
      if (directJump.resetEncounter !== false) this.resetEncounter();
      this.playerRoot.position.copy(this.signalCenter).add(DIRECT_APPROACH_OFFSET);
      const firstUnreadWorld = this.signalCenter.clone().add(NODE_OFFSETS[1]);
      frameState.debugSignalPlainFraming = {
        active: true,
        startedAt: frameState.runtimeSeconds ?? 0,
        endsAt: (frameState.runtimeSeconds ?? 0) + 3.4,
        focusPosition: { x: this.signalCenter.x, y: this.signalCenter.y, z: this.signalCenter.z },
        firstReceptorPosition: { x: firstUnreadWorld.x, y: firstUnreadWorld.y, z: firstUnreadWorld.z },
        cameraDistance: 17.2,
        fieldOfView: 70,
        focusBlend: 0.52,
        source: directJump.source ?? "Ctrl+Shift+8",
        pass: "HC-015N HOTFIX1"
      };
      frameState.debugSignalPlainJumpRequest = { ...directJump, pending: false, completedAtFrame: frameState.frame ?? 0 };
      frameState.debugAreaJump = { ...(frameState.debugAreaJump ?? {}), signalPlainDirectPositionReached: true, signalPlainEncounterReset: true, signalPlainApproachStaged: true };
    }

    const player = this.playerRoot.position;
    const input = frameState.input ?? {};
    const signalDistance = player.distanceTo(this.signalCenter);
    const encounterAwake = signalDistance <= 15.5;
    const nodeRange = 3.15; // HC028D2 legacy readout name; actual read now comes from embodied verb response.
    const centerRange = 4.8;
    const nodeDistances = this.nodes.map((node) => player.distanceTo(this.signalCenter.clone().add(node.group.position)));
    let nearestIndex = 0;
    for (let i = 1; i < nodeDistances.length; i += 1) if (nodeDistances[i] < nodeDistances[nearestIndex]) nearestIndex = i;
    const nearestDistance = nodeDistances[nearestIndex] ?? Infinity;

    // HC-015F hotfix: derive perception emphasis only after nearestDistance exists.
    // Ctrl+Shift+8 can mount/update Signal Plain immediately, so temporal-dead-zone
    // reads here are fatal even though the source is syntactically valid.
    const actionProximity = THREE.MathUtils.clamp(1 - Math.min(nearestDistance, 9.0) / 9.0, 0, 1);

    const pulseEventId = input.pulseEventId ?? (input.pulsePressed ? (frameState.frame ?? 0) : -1);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) this.lastPulseEventId = pulseEventId;

    // HC027I remains the affordance layer. HC027J adds only a bounded aftermath after
    // the condition has clearly answered a plausible verb. Wrong verbs remain harmless.
    const absorbHeld = Boolean(input.absorbHeld);
    const freshAbsorb = absorbHeld && !this.previousAbsorbHeld;
    this.previousAbsorbHeld = absorbHeld;
    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const freshStabilize = stabilizeHeld && !this.previousStabilizeHeld;
    this.previousStabilizeHeld = stabilizeHeld;
    const affordanceRange = 3.15;
    const responseDecay = dt * 0.92;
    const verbPhysiology = frameState.corePerformance?.verbModifiers ?? {};
    const absorbAffordancePower = Math.max(0.74, Math.min(1.38, verbPhysiology.absorb?.progressMultiplier ?? 1));
    const stabilizeCoherence = Math.max(0.66, Math.min(1.48, verbPhysiology.stabilize?.coherenceMultiplier ?? 1));

    if (!absorbHeld) this.localConsequenceRearmRequired[0] = false;
    if (!stabilizeHeld) this.localConsequenceRearmRequired[2] = false;
    for (let i = 0; i < this.localConsequences.length; i += 1) {
      const state = this.localConsequences[i];
      if (state.active) {
        state.elapsedSeconds += dt;
        state.remainingSeconds = Math.max(0, state.remainingSeconds - dt);
        if (state.remainingSeconds <= 0) {
          state.active = false;
          state.elapsedSeconds = state.durationSeconds;
          state.eventId = "none";
        }
      }
    }

    for (let i = 0; i < this.affordanceResponse.length; i += 1) {
      this.affordanceResponse[i] = Math.max(0, this.affordanceResponse[i] - responseDecay);
    }
    if (encounterAwake && nearestDistance <= affordanceRange && !this.completed) {
      if (nearestIndex === 0 && absorbHeld && !this.localConsequences[0].active) {
        this.affordanceResponse[0] = Math.min(1, this.affordanceResponse[0] + dt * 2.8 * absorbAffordancePower + (freshAbsorb ? 0.22 : 0));
        if (this.affordanceResponse[0] >= 0.78) this.activateLocalConsequence(0, frameState);
      }
      if (nearestIndex === 1 && freshPulse) {
        this.affordanceResponse[1] = 1;
        this.activateLocalConsequence(1, frameState);
      }
      if (nearestIndex === 2 && stabilizeHeld && !this.localConsequences[2].active) {
        this.affordanceResponse[2] = Math.min(1, this.affordanceResponse[2] + dt * 2.5 * stabilizeCoherence + (freshStabilize ? 0.08 : 0));
        if (this.affordanceResponse[2] >= 0.78) this.activateLocalConsequence(2, frameState);
      }
    }

    const observedCount = this.observed.filter(Boolean).length;
    const allObserved = observedCount === this.observed.length;
    const centerDistance = signalDistance;
    const insideCenter = centerDistance <= centerRange;
    const stabilizing = Boolean(input.stabilizeHeld);

    if (!this.completed && allObserved && insideCenter && stabilizing) {
      this.stabilizeCharge = Math.min(1, this.stabilizeCharge + dt * 0.72 * stabilizeCoherence);
      this.lastAction = this.stabilizeCharge >= 1 ? "signal_plain_ready_for_pulse" : "stabilizing_signal_plain";
    } else if (!this.completed && this.stabilizeCharge > 0 && (!insideCenter || !stabilizing)) {
      this.stabilizeCharge = Math.max(0, this.stabilizeCharge - dt * 0.18);
    }

    const ready = allObserved && insideCenter && this.stabilizeCharge >= 1;
    if (!this.completed && freshPulse) {
      if (ready) {
        this.completed = true;
        this.response = 0.01;
        this.lastAction = "signal_plain_local_response_released";
      } else if (allObserved) {
        this.lastAction = "pulse_before_signal_plain_ready";
      }
    }

    if (this.completed) this.response = Math.min(1, this.response + dt * 0.34);

    const time = frameState.runtimeSeconds ?? 0;
    if (this.responseBloom) {
      const bloomPulse = 1 + Math.sin(time * 1.6) * 0.06;
      // HC-015K: release bloom is transient. It must not become permanent translucent clutter.
      const releaseBloom = this.completed ? Math.max(0, 1 - this.response * 1.65) : 0;
      this.responseBloom.material.opacity = releaseBloom * 0.30;
      this.responseBloom.scale.set(
        (0.35 + this.response * 2.6) * bloomPulse,
        (0.18 + this.response * 0.72) * bloomPulse,
        (0.35 + this.response * 2.6) * bloomPulse
      );
      this.responseBloom.rotation.y += dt * (0.14 + this.response * 0.34);
    }
    const consequenceNextQuestion = this.buildConsequenceNextQuestionLinks(player);
    const nextQuestionStrengthByNode = [0, 0, 0];
    const nextQuestionRelationByNode = ["none", "none", "none"];
    for (const link of consequenceNextQuestion.activeLinks) {
      const targetIndex = link.targetNodeNumber - 1;
      if (link.strength >= nextQuestionStrengthByNode[targetIndex]) {
        nextQuestionStrengthByNode[targetIndex] = link.strength;
        nextQuestionRelationByNode[targetIndex] = link.id;
      }
    }

    if (this.responseSpokes) {
      for (let i = 0; i < this.responseSpokes.children.length; i += 1) {
        const spoke = this.responseSpokes.children[i];
        const phase = Math.sin(time * 1.5 + i * 0.9) * 0.5 + 0.5;
        const spokeRelease = this.completed ? Math.max(0, 1 - this.response * 1.9) : 0;
        spoke.material.opacity = spokeRelease * (0.10 + phase * 0.08);
        spoke.scale.setScalar(0.62 + Math.min(this.response, 0.55) * (0.68 + phase * 0.08));
      }
      this.responseSpokes.rotation.y += dt * (0.08 + this.response * 0.18);
    }
    for (let i = 0; i < this.nodes.length; i += 1) {
      const { body, halo, lockRing, tether, filaments, baseScale } = this.nodes[i];
      const observed = this.observed[i];
      const available = encounterAwake && !observed && !this.completed;
      const proximity = THREE.MathUtils.clamp(1 - Math.min(nodeDistances[i] ?? 9, 9) / 9, 0, 1);
      const affordance = this.affordanceResponse[i] ?? 0;
      const consequenceState = this.localConsequences[i];
      const persistentConsequence = this.localConsequenceStrength(consequenceState);
      const locallyAltered = persistentConsequence > 0.01 && !this.completed;
      const linkedQuestion = nextQuestionStrengthByNode[i] ?? 0;
      const linkedRelation = nextQuestionRelationByNode[i] ?? "none";

      // HC027H: all three unread receptors stay legible at once, but each asks a
      // different visual question. Proximity adds a mild local lift; it no longer
      // turns the nearest unread node into the authored answer.
      let signatureScale = 1;
      let signatureLight = 0;
      let signatureHalo = 0.94;
      let signatureOpacity = 0.46;
      let haloSpin = 0.18;
      if (i === 0) {
        // Draw / release: the receptor appears porous and repeatedly pulls its own
        // filaments inward before letting them relax. Absorb briefly completes that draw.
        const breath = Math.sin(time * 0.78) * 0.5 + 0.5;
        const draw = 1 - breath;
        const afterflow = Math.sin(time * 1.45) * 0.5 + 0.5;
        const entrainedBreath = linkedRelation === "cadence_entrains_slow_breath"
          ? Math.max(0, Math.sin(time * 2.42)) * linkedQuestion
          : 0;
        signatureScale = locallyAltered ? 0.995 + afterflow * 0.035 : 0.96 + breath * 0.13 - affordance * 0.035 + entrainedBreath * 0.055;
        signatureLight = locallyAltered ? 0.34 + afterflow * 0.18 : breath * 0.22 + affordance * 0.42 + entrainedBreath * 0.36;
        signatureHalo = locallyAltered ? 1.02 + afterflow * 0.06 : 0.94 + breath * 0.18 - affordance * 0.12;
        haloSpin = locallyAltered ? 0.28 : 0.12 + affordance * 0.18;
        body.rotation.z = locallyAltered ? -0.11 * persistentConsequence : Math.sin(time * 0.62) * 0.035 * (1 - affordance * 0.55);
        tether.rotation.y = locallyAltered ? -0.09 * persistentConsequence : Math.sin(time * 0.72) * 0.08 * (1 - affordance * 0.55);
        for (let f = 0; f < filaments.length; f += 1) {
          const filament = filaments[f];
          filament.scale.y = locallyAltered ? 1.04 + afterflow * (0.16 + f * 0.03) : 0.82 + breath * 0.28 - affordance * 0.14;
          filament.rotation.z = locallyAltered ? -0.22 * persistentConsequence + (f - 1) * 0.025 : (f - 1) * 0.12 * draw * (1 - affordance * 0.75);
          filament.material.emissiveIntensity = locallyAltered ? 0.34 + persistentConsequence * 0.42 : 0.18 + affordance * 0.38;
        }
      } else if (i === 1) {
        // Call / wait: a paired emission is followed by a visible quiet gap. A Pulse
        // during approach creates a short answer flare without marking the node read.
        const chirpBaseA = Math.sin(time * 3.15 + 0.6) * 0.5 + 0.5;
        const chirpBaseB = Math.sin(time * 3.15 - 0.22) * 0.5 + 0.5;
        const chirp = Math.max(Math.pow(chirpBaseA, 5.2), Math.pow(chirpBaseB, 6.0) * 0.82);
        const coherentBeat = Math.sin(time * 2.42) * 0.5 + 0.5;
        const exposedGap = linkedRelation === "coherence_reveals_resonant_gap"
          ? linkedQuestion * (1 - chirp)
          : 0;
        signatureScale = locallyAltered ? 1.0 + coherentBeat * 0.075 : 0.98 + chirp * 0.12 + affordance * 0.10 + exposedGap * 0.035;
        signatureLight = locallyAltered ? 0.42 + coherentBeat * 0.32 : chirp * 0.48 + affordance * 0.52 + exposedGap * 0.30;
        signatureHalo = locallyAltered ? 1.04 + coherentBeat * 0.12 : 0.96 + chirp * 0.24 + affordance * 0.20;
        signatureOpacity = locallyAltered ? 0.58 : 0.50;
        haloSpin = locallyAltered ? 0.52 : 0.82 + affordance * 0.72;
        body.rotation.z = locallyAltered ? Math.sin(time * 2.42) * 0.018 : Math.sin(time * 1.9) * 0.055;
        tether.rotation.y = locallyAltered ? Math.sin(time * 2.42) * 0.025 : Math.sin(time * 2.7) * 0.05;
        for (let f = 0; f < filaments.length; f += 1) {
          const filament = filaments[f];
          filament.scale.y = locallyAltered ? 1.02 + coherentBeat * (0.16 + f * 0.025) : 0.92 + chirp * (0.18 + f * 0.03) + affordance * 0.22;
          filament.rotation.z = locallyAltered ? Math.sin(time * 2.42) * 0.025 : Math.sin(time * 3.15 - f * 0.24) * 0.07;
          filament.material.emissiveIntensity = locallyAltered ? 0.40 + coherentBeat * 0.32 : 0.18 + chirp * 0.20 + affordance * 0.48;
        }
      } else {
        // Phase slip: layers visibly shear against one another. Stabilize suppresses
        // that slip while held, making coherence itself the feedback.
        const shear = Math.sin(time * 1.36 + 1.7);
        const afterflowStress = linkedRelation === "afterflow_exposes_phase_slip" ? linkedQuestion * 0.62 : 0;
        const slip = shear * (1 + afterflowStress) * (1 - affordance * 0.88) * (1 - persistentConsequence * 0.97);
        const heldCoherence = Math.sin(time * 1.72) * 0.5 + 0.5;
        signatureScale = locallyAltered ? 1.01 + heldCoherence * 0.025 : 1.0 + Math.abs(slip) * 0.07 + affordance * 0.025;
        signatureLight = locallyAltered ? 0.36 + heldCoherence * 0.18 : (0.5 + 0.5 * slip) * 0.22 + affordance * 0.38;
        signatureHalo = locallyAltered ? 1.02 + heldCoherence * 0.035 : 1.0 + slip * 0.08;
        signatureOpacity = locallyAltered ? 0.56 : 0.44 + affordance * 0.08;
        haloSpin = locallyAltered ? 0.14 : -0.34 * (1 - affordance * 0.78);
        body.rotation.z = locallyAltered ? 0 : slip * 0.15;
        tether.rotation.y = locallyAltered ? 0 : slip * 0.24;
        for (let f = 0; f < filaments.length; f += 1) {
          const filament = filaments[f];
          filament.rotation.z = locallyAltered ? (f - 1) * 0.025 : slip * (0.22 + f * 0.09) * (f % 2 ? -1 : 1);
          filament.scale.y = locallyAltered ? 1.02 + heldCoherence * 0.045 : 0.96 + Math.abs(slip) * 0.16;
          filament.material.emissiveIntensity = locallyAltered ? 0.42 + heldCoherence * 0.26 : 0.16 + affordance * 0.44;
        }
      }

      // HC027K: the coupled receptor becomes readable by changing its own physical
      // rhythm, not by receiving a marker. This lift remains subordinate to the
      // condition-specific behavior above.
      signatureLight += linkedQuestion * 0.24;
      signatureHalo += linkedQuestion * 0.10;
      signatureOpacity += linkedQuestion * 0.055;

      const completionSettle = this.completed ? (1 - this.response * 0.16) : 1;
      const proximityScale = available ? 1 + proximity * 0.045 : 1;
      body.scale.copy(baseScale).multiplyScalar((locallyAltered ? signatureScale : observed ? 1.24 : signatureScale * proximityScale) * completionSettle);
      body.material.emissiveIntensity = this.completed
        ? 0.34 + (1 - this.response) * 0.24
        : locallyAltered
          ? 0.66 + signatureLight * 0.34
          : observed
            ? 0.88
            : available
              ? 0.54 + signatureLight + proximity * 0.18
              : 0.16;
      body.material.opacity = this.completed
        ? 0.18 + (1 - this.response) * 0.18
        : locallyAltered
          ? Math.min(0.86, 0.62 + persistentConsequence * 0.18)
          : observed
            ? 0.88
            : available
              ? Math.min(0.78, signatureOpacity + proximity * 0.12)
              : 0.30;
      halo.rotation.z += dt * (locallyAltered ? haloSpin : observed ? 0.92 : haloSpin) * (i % 2 ? -1 : 1);
      halo.scale.setScalar(locallyAltered ? signatureHalo : observed ? 1.42 : available ? signatureHalo + proximity * 0.07 : 0.86);
      halo.material.opacity = this.completed
        ? 0.025 * (1 - this.response)
        : locallyAltered
          ? 0.28 + persistentConsequence * 0.18
          : observed
            ? 0.38
            : available
              ? 0.13 + signatureLight * 0.24 + proximity * 0.10
              : 0.035;
      lockRing.material.opacity = this.completed ? 0.08 * (1 - this.response) : observed ? 0.58 + Math.sin(time * 1.8 + i) * 0.10 : 0;
      lockRing.scale.setScalar(observed ? 1.04 + Math.sin(time * 1.4 + i) * 0.035 : 0.92);
      lockRing.rotation.z += dt * (observed ? 0.48 : 0);
      tether.material.opacity = this.completed ? 0.018 * (1 - this.response) : locallyAltered ? 0.30 + persistentConsequence * 0.12 : observed ? 0.34 : available ? 0.12 + proximity * 0.08 : 0.02;
    }

    if (this.routeGuide) {
      // HC027H retires the old nearest-first route-marker presentation. The meshes
      // remain for compatibility but are intentionally invisible; the receptors
      // themselves now carry the invitation through distinct embodied rhythms.
      for (const marker of this.routeGuide.children) {
        marker.material.opacity = 0;
        marker.scale.setScalar(0.88);
      }
    }
    if (this.centerBeacon) {
      const centerInvited = encounterAwake && allObserved && !this.completed;
      this.centerBeacon.material.opacity = centerInvited ? 0.78 + this.stabilizeCharge * 0.18 : 0;
      const centerPulse = 1 + Math.sin(time * 2.35) * (centerInvited ? 0.11 : 0.01);
      this.centerBeacon.scale.setScalar(centerPulse * (1.08 + this.stabilizeCharge * 0.16));
      this.centerBeacon.rotation.z += dt * (0.46 + this.stabilizeCharge * 0.72);
    }

    for (const child of this.root.children) {
      if (!child.name?.startsWith("signal_plain_read_response_lobe_")) continue;
      const lobeIndex = Number(child.name.split("_").pop()) - 1;
      const awakened = Boolean(this.observed[lobeIndex]);
      const cumulative = observedCount / this.observed.length;
      child.material.opacity = this.completed
        ? 0.34 + this.response * 0.12
        : awakened ? 0.34 + cumulative * 0.24 : 0.035;
      child.material.emissiveIntensity = this.completed
        ? 0.62 + this.response * 0.28
        : awakened ? 0.52 + cumulative * 0.42 : 0.05;
      const pulse = 1 + Math.sin(time * 1.35 + lobeIndex * 1.8) * (awakened ? 0.06 : 0.015);
      const bloom = this.completed ? 1 + Math.min(this.response, 0.55) * 0.20 : 1;
      child.scale.set(1.45 * pulse * bloom, 0.28 * pulse * (1 + Math.min(this.response, 0.55) * 0.08), 0.78 * pulse * bloom);
      if (this.completed) child.rotation.y += dt * (lobeIndex % 2 ? -0.08 : 0.08) * this.response;
    }

    for (const child of this.root.children) {
      if (!child.name?.startsWith("signal_plain_ecology_response_ring_")) continue;
      const ringIndex = Number(child.name.split("_").pop()) - 1;
      // HC-015K: one readable outward event. Each authored ring receives a short
      // staggered window; old rings disappear instead of stacking permanently.
      const waveHead = this.response * 1.55;
      const ringStart = ringIndex * 0.22;
      const localWave = THREE.MathUtils.clamp((waveHead - ringStart) / 0.28, 0, 1);
      const localTail = THREE.MathUtils.clamp((waveHead - ringStart - 0.30) / 0.30, 0, 1);
      const waveVisibility = localWave * (1 - localTail);
      child.material.opacity = this.completed
        ? waveVisibility * (0.42 - ringIndex * 0.045)
        : (allObserved ? 0.025 + this.stabilizeCharge * 0.08 : 0);
      child.scale.setScalar(this.completed
        ? 0.82 + localWave * (0.72 + ringIndex * 0.14)
        : 0.86);
    }

    const stage = this.completed
      ? "local_field_response"
      : !encounterAwake
        ? "approach"
        : !allObserved
          ? "observe_local_signals"
          : ready
            ? "ready_for_response_pulse"
            : "stabilize_receptive_center";

    const localConsequenceStates = this.localConsequences.map((state, index) => {
      const spec = LOCAL_CONSEQUENCE_SPECS[index];
      const world = this.signalCenter.clone().add(this.nodes[index]?.group.position ?? new THREE.Vector3());
      return {
        nodeNumber: index + 1, consequenceId: spec.id, conditionId: spec.condition,
        sourceVerbDebugOnly: spec.sourceVerb, materialBehavior: spec.materialBehavior,
        active: state.active, eventId: state.eventId, activationCount: state.activationCount, sequence: state.sequence ?? 0,
        elapsedSeconds: Number(state.elapsedSeconds.toFixed(2)),
        remainingSeconds: Number(state.remainingSeconds.toFixed(2)), durationSeconds: state.durationSeconds,
        intensity: Number(this.localConsequenceStrength(state).toFixed(3)),
        position: { x: world.x, y: world.y, z: world.z },
        playerDistance: Number(player.distanceTo(world).toFixed(2))
      };
    });
    const activeLocalConsequences = localConsequenceStates.filter((state) => state.active);
    let nearestActiveLocalConsequence = null;
    for (const state of activeLocalConsequences) {
      if (!nearestActiveLocalConsequence || state.playerDistance < nearestActiveLocalConsequence.playerDistance) nearestActiveLocalConsequence = state;
    }

    // HC-015C: expose the active receptor/organ as an optional authored camera focus.
    // Existing InspectionOcclusionSystem can now soften marked presentation tissue when the
    // player chooses tight focus, without Signal Plain taking camera-transform ownership.
    const focusWorld = !allObserved
      ? this.signalCenter.clone().add(this.nodes[nearestIndex]?.group.position ?? new THREE.Vector3())
      : this.signalCenter.clone();
    frameState.interactionInspectionFocus = {
      architecturePass: "HC-015L",
      providerId: "SignalPlainEcologySystem",
      id: !allObserved ? `signal_plain_observation_node_${nearestIndex + 1}` : "signal_plain_receptive_center",
      label: !allObserved ? `Signal Plain receptor ${nearestIndex + 1}` : "Signal Plain receptive center",
      active: encounterAwake && !this.completed, inspectable: encounterAwake && !this.completed,
      requiredCellId: CELL_ID, position: { x: focusWorld.x, y: focusWorld.y, z: focusWorld.z },
      distance: player.distanceTo(focusWorld), toggleRange: 7.2, autoExitRange: 10.5,
      camera: { distance: 5.0, fieldOfView: 53, targetBlendTowardFocus: 0.70, targetLift: 0.18,
        baseHeight: 0.9, pitch: 0.2, shoulderOffset: 0.5, forwardOffset: 0.08,
        blockerOpacity: 0.022, ambientDensityScale: 0.30, corridorRadius: 0.68, nearCameraFadeRadius: 2.25 },
      optional: true, targetRequired: false, activeCellChanges: false, interactionStateChanged: false
    };

    frameState.signalPlainEcology = {
      pass: "HC-028D2",
      active: true,
      stage,
      encounterAwake,
      signalPlainDistance: signalDistance,
      observedCount,
      requiredObservations: this.observed.length,
      observedNodes: this.observed.map((value, index) => ({ index: index + 1, observed: value, distance: nodeDistances[index], insideObserveRange: nodeDistances[index] <= nodeRange, visualState: value ? "read_and_retained" : encounterAwake ? `candidate_${NODE_INTENTION_SIGNATURES[index].id}` : "dormant_rhythm" })),
      cumulativeOrganResponse: observedCount / this.observed.length,
      nearestNodeNumber: nearestIndex + 1,
      nearestNodeDistance: nearestDistance,
      observationRange: nodeRange,
      readAuthority: "verb_response_not_A",
      aButtonRequiredForObservation: false,
      centerDistance,
      centerRange,
      insideCenter,
      stabilizeHeld: stabilizing,
      stabilizeCharge: this.stabilizeCharge,
      ready,
      completed: this.completed,
      localResponse: this.response,
      responsePresentation: this.completed ? {
        phase: this.response < 0.28 ? "release" : this.response < 0.72 ? "outward_response_wave" : "retained_changed_state",
        receptorsSettling: true,
        organBloom: this.response,
        outwardWave: this.response
      } : null,
      mutatesGlobalProgression: false,
      perceptionHierarchy: {
        primary: "player_core",
        secondary: !allObserved ? "signal_plain_three_candidate_field" : "signal_plain_receptive_center",
        tertiary: "signal_plain_organ",
        passiveEnvironmentSuppressed: encounterAwake && !this.completed,
        guideDependencyTarget: "world_first_text_secondary",
        nearestFirstPresentationRetired: true
      },
      traversalIntention: {
        pass: "HC-027H",
        active: encounterAwake && !this.completed,
        law: "multiple_embodied_questions_no_authored_correct_order",
        candidateCount: this.observed.filter((value) => !value).length,
        firstChoiceNode: this.firstChosenNode || 0,
        choiceCount: this.choiceCount,
        candidates: this.nodes.map((node, index) => ({
          nodeNumber: index + 1,
          signatureId: NODE_INTENTION_SIGNATURES[index].id,
          signatureLabel: NODE_INTENTION_SIGNATURES[index].label,
          conditionId: NODE_INTENTION_SIGNATURES[index].condition,
          impliedVerbDebugOnly: NODE_INTENTION_SIGNATURES[index].impliedVerb,
          affordanceResponse: Number((this.affordanceResponse[index] ?? 0).toFixed(3)),
          distance: Number((nodeDistances[index] ?? 0).toFixed(2)),
          available: !this.observed[index] && !this.completed,
          observed: this.observed[index],
          proximityLiftOnly: true,
          playerFacingMarker: false,
          objectiveAuthority: false,
          progressionAuthority: false
        })),
        authoredCorrectOrder: false,
        nearestCandidateIsAnswer: false,
        routeMarkersVisible: false,
        createsTarget: false,
        createsObjective: false,
        createsReward: false,
        playerChoiceRequiredForFirstRead: true
      },
      embodiedVerbAffordance: {
        pass: "HC-027I",
        active: encounterAwake && !this.completed,
        law: "condition_suggests_experiment_without_button_prompt_or_lock",
        affordanceRange,
        responses: this.affordanceResponse.map((value, index) => ({
          nodeNumber: index + 1,
          conditionId: NODE_INTENTION_SIGNATURES[index].condition,
          impliedVerbDebugOnly: NODE_INTENTION_SIGNATURES[index].impliedVerb,
          response: Number(value.toFixed(3)),
          persistent: false,
          progressionAuthority: false
        })),
        matchingVerbMarksObserved: false,
        matchingVerbCompletesEncounter: false,
        wrongVerbPenalty: false,
        createsObjective: false,
        createsWaypoint: false,
        createsReward: false,
        persistentWorldChange: false,
        persistenceOwnedByLaterPass: "HC-027J"
      },
      persistentLocalConsequence: {
        pass: "HC-027J",
        active: activeLocalConsequences.length > 0,
        law: "successful_local_experiment_leaves_bounded_physical_aftermath_without_progression_authority",
        activeCount: activeLocalConsequences.length,
        eventCount: this.localConsequenceEventCount,
        states: localConsequenceStates,
        nearestActive: nearestActiveLocalConsequence,
        minimumDurationSeconds: 30,
        maximumDurationSeconds: 36,
        matchingExperimentMarksObserved: false,
        matchingExperimentCompletesEncounter: false,
        wrongVerbPenalty: false,
        createsObjective: false,
        createsWaypoint: false,
        createsReward: false,
        changesRoute: false,
        changesProgression: false,
        savedGlobally: false,
        nextQuestionAuthority: false
      },
      consequenceNextQuestion: {
        pass: "HC-027K",
        active: consequenceNextQuestion.activeLinks.length > 0,
        law: "persistent_local_consequence_physically_couples_into_another_existing_condition_and_creates_information_without_route_authority",
        activeCount: consequenceNextQuestion.activeLinks.length,
        primary: consequenceNextQuestion.primary,
        links: consequenceNextQuestion.links,
        multipleLinksMayCoexist: true,
        targetBehaviorChangesInsteadOfMarker: true,
        createsObjective: false,
        createsWaypoint: false,
        createsRouteLine: false,
        prescribesCorrectOrder: false,
        grantsReward: false,
        changesProgression: false,
        changesRoute: false
      },
      opensGate: false,
      grantsAbility: false,
      spawnsCombat: false,
      lastAction: this.lastAction,
      nextAction: this.completed
        ? "explore_the_changed_signal_plain"
        : !encounterAwake
          ? "approach_signal_plain"
          : !allObserved
            ? "compare_local_rhythms"
            : !insideCenter
              ? "move_into_signal_plain_receptive_center"
              : !stabilizing
                ? "hold_stabilize_to_settle_signal_plain"
                : ready
                  ? "pulse_to_release_local_field_response"
                  : "continue_stabilizing_signal_plain"
    };
  }
}
