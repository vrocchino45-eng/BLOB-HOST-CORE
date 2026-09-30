import * as THREE from "three";

const CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";
const TERRITORY_ID = "gathering_ground_cluster";
const WATCHER_ID = "gathering_ground_watcher_001";
const RELAY_A_ID = "gathering_ground_relay_a_001";
const RELAY_B_ID = "gathering_ground_relay_b_001";

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const smooth01 = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

const ENCOUNTER_DEFS = [
  { id: "ambient_watcher_sweep", family: "ambient", label: "Perimeter Watcher Sweep" },
  { id: "ambient_relay_exchange", family: "ambient", label: "Relay Matter Exchange" },
  { id: "reactive_watcher_stable_interrogation", family: "reactive", label: "Stable Watcher Interrogation" },
  { id: "reactive_relay_held_intake", family: "reactive", label: "Held Relay Intake" },
  { id: "cross_ridge_echo_return", family: "cross_territory", label: "Ridge Echo Return" },
  { id: "cross_matter_spill_return", family: "cross_territory", label: "Matter Spill Return" }
];

const U2_TIMING = Object.freeze({
  watcherDiscoverSeconds: 2.0,
  watcherStartSeconds: 3.0,
  watcherReadSeconds: 4.0,
  relayDiscoverSeconds: 4.0,
  relayStartSeconds: 6.0,
  relayReadSeconds: 7.5,
  watcherResponseSeconds: 2.4,
  relayResponseSeconds: 2.8,
  responseBreakGraceSeconds: 0.28,
  responseRetryBackoffSeconds: 1.2,
  watcherRecurrenceCooldownSeconds: 8.0,
  relayRecurrenceCooldownSeconds: 10.0,
  ridgeEchoSeconds: 5.4,
  matterSpillSeconds: 6.2,
  localResponseRadius: 22.5
});

/**
 * HC031U2 — Gathering Ground Persistent Living Ecology + Encounter Pacing.
 *
 * The HC031U 3-family x 2-encounter identity set is retained, but the six
 * first reads are no longer the end-state of the territory. Ambient behavior
 * takes time to read, reactive answers require sustained chords, interruptions
 * matter, and completed relationships can recur after release + cooldown.
 *
 * Ownership remains narrow:
 * - EntitySystem owns Watcher/relay visibility, movement and body state.
 * - Existing EntityRelationshipGrammar interprets player verb chords.
 * - This system owns only encounter staging, low-cost Host-matter presentation,
 *   cross-territory visual replies, and encounter state publication.
 * - No target, movement, chemistry, route, cell, or progression authority.
 */
export class GatheringGroundAliveSystem {
  constructor({ scene, playerRoot, frameState, entitySystem, apertureFieldsArrivalSystem }) {
    if (!scene || !playerRoot || !frameState || !entitySystem || !apertureFieldsArrivalSystem) {
      throw new Error("[GatheringGroundAliveSystem] scene, playerRoot, frameState, entitySystem and apertureFieldsArrivalSystem are required.");
    }
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.entitySystem = entitySystem;
    this.apertureFieldsArrivalSystem = apertureFieldsArrivalSystem;

    this.root = null;
    this.watcherScan = null;
    this.relayThread = null;
    this.transferPacket = null;
    this.spillPacket = null;
    this.spillResidue = null;
    this.echoInstances = null;
    this.echoDummy = new THREE.Object3D();
    this.relayLinePositions = null;

    this.center = new THREE.Vector3();
    this.ridge = new THREE.Vector3();
    this.midA = new THREE.Vector3();
    this.midB = new THREE.Vector3();
    this.tempA = new THREE.Vector3();
    this.tempB = new THREE.Vector3();
    this.tempC = new THREE.Vector3();

    this.encounters = new Map();
    this.eventSequence = 0;
    this.recentEvents = [];
    this.territoryAge = 0;
    this.watcherPresenceSeconds = 0;
    this.exchangeAge = 0;
    this.watcherAnswerAge = 99;
    this.relayAnswerAge = 99;
    this.echoAge = 0;
    this.spillAge = 0;
    this.ongoingResponseCycles = 0;
    this.interactionMemory = {
      mode: "quiet_observer",
      observerSeconds: 0,
      coherentSeconds: 0,
      pressureSeconds: 0,
      interruptionWeight: 0,
      lastChangeAge: 0
    };
    this.active = false;
    this.resetState();
  }

  init() {
    if (this.root) return;

    this.root = new THREE.Group();
    this.root.name = "gathering_ground_alive_HC031U2";
    this.root.visible = false;
    this.scene.add(this.root);

    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xb9efff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.watcherScan = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.025, 6, 56), scanMat);
    this.watcherScan.name = "gathering_ground_watcher_scan_response";
    this.watcherScan.rotation.x = Math.PI / 2;
    this.root.add(this.watcherScan);

    const lineGeometry = new THREE.BufferGeometry();
    this.relayLinePositions = new Float32Array(6);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(this.relayLinePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x80d7c8,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    this.relayThread = new THREE.Line(lineGeometry, lineMat);
    this.relayThread.name = "gathering_ground_relay_exchange_thread";
    this.root.add(this.relayThread);

    const packetMat = new THREE.MeshBasicMaterial({
      color: 0xffda91,
      transparent: true,
      opacity: 0.84,
      depthWrite: false
    });
    this.transferPacket = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), packetMat);
    this.transferPacket.name = "gathering_ground_exchange_packet";
    this.root.add(this.transferPacket);

    const spillMat = new THREE.MeshBasicMaterial({
      color: 0xd7b37b,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.spillPacket = new THREE.Mesh(new THREE.IcosahedronGeometry(0.19, 1), spillMat);
    this.spillPacket.name = "gathering_ground_cross_territory_spill";
    this.root.add(this.spillPacket);

    const residueMat = new THREE.MeshBasicMaterial({
      color: 0xa98a68,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.spillResidue = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), residueMat);
    this.spillResidue.name = "gathering_ground_ridge_residue";
    this.root.add(this.spillResidue);

    const echoGeometry = new THREE.SphereGeometry(0.11, 8, 6);
    const echoMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9ead7,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    this.echoInstances = new THREE.InstancedMesh(echoGeometry, echoMaterial, 7);
    this.echoInstances.name = "gathering_ground_ridge_echo_train";
    this.echoInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.root.add(this.echoInstances);
  }

  resetState() {
    this.encounters.clear();
    for (const def of ENCOUNTER_DEFS) {
      this.encounters.set(def.id, {
        ...def,
        state: "dormant",
        progress01: 0,
        discoveryCount: 0,
        startCount: 0,
        completionCount: 0,
        recurrenceCount: 0,
        ignoredCount: 0,
        interruptionCount: 0,
        ignoredEmitted: false,
        availableSinceAge: null,
        activeSeconds: 0,
        responseBreakSeconds: 0,
        retryBackoff: 0,
        lastCompletionAge: -999,
        releaseSeenSinceCompletion: false,
        sourceCompletionCount: 0
      });
    }
    this.eventSequence = 0;
    this.recentEvents = [];
    this.territoryAge = 0;
    this.watcherPresenceSeconds = 0;
    this.exchangeAge = 0;
    this.watcherAnswerAge = 99;
    this.relayAnswerAge = 99;
    this.echoAge = 0;
    this.spillAge = 0;
    this.ongoingResponseCycles = 0;
    this.interactionMemory = {
      mode: "quiet_observer",
      observerSeconds: 0,
      coherentSeconds: 0,
      pressureSeconds: 0,
      interruptionWeight: 0,
      lastChangeAge: 0
    };
    this.active = false;
  }

  onRuntimeMount(frameState) {
    this.init();
    this.resetState();
    this.root.visible = false;
    this.publish(frameState);
  }

  onRuntimeUnmount(frameState) {
    if (this.root) this.root.visible = false;
    this.active = false;
    frameState.gatheringGroundAlive = {
      ...(frameState.gatheringGroundAlive ?? {}),
      active: false,
      retained: true
    };
  }

  update(dt, frameState = this.frameState) {
    if (frameState.activeCellId !== CELL_ID) return;
    if (!this.root) this.init();

    const adjacent = frameState.adjacentHostTerritory ?? {};
    const entered = Boolean(adjacent.enteredTerritory);
    this.active = entered;
    this.root.visible = entered;

    if (!entered) {
      this.publish(frameState);
      return;
    }

    const safeDt = Math.max(0, Math.min(0.12, Number(dt) || 0));
    this.territoryAge += safeDt;
    this.watcherAnswerAge += safeDt;
    this.relayAnswerAge += safeDt;

    for (const id of ["reactive_watcher_stable_interrogation", "reactive_relay_held_intake"]) {
      const encounter = this.encounters.get(id);
      encounter.retryBackoff = Math.max(0, encounter.retryBackoff - safeDt);
    }

    const watcher = this.entity(WATCHER_ID);
    const relayA = this.entity(RELAY_A_ID);
    const relayB = this.entity(RELAY_B_ID);

    const anchor = this.apertureFieldsArrivalSystem.entryAnchor;
    this.center.copy(anchor).add(this.tempA.set(3.5, 8.5, -56.0));
    this.ridge.copy(anchor).add(this.tempA.set(20.0, 1.7, -46.0));

    this.updateRelayPresentation(relayA, relayB, safeDt);
    this.updateWatcherAmbient(watcher, safeDt);
    this.updateReactiveEncounters(frameState, watcher, relayA, relayB, safeDt);
    this.updateCrossTerritoryEncounters(safeDt, watcher, relayA);
    this.updateInteractionMemory(frameState, safeDt);
    this.updateIgnoredEncounters();
    this.publish(frameState);
  }

  entity(id) {
    return (this.entitySystem.entities ?? []).find((entity) => (entity.instanceId ?? entity.recipeId) === id) ?? null;
  }

  updateWatcherAmbient(watcher, dt) {
    const encounter = this.encounters.get("ambient_watcher_sweep");
    if (!watcher?.root?.visible) return;

    const distance = this.playerRoot.position.distanceTo(watcher.root.position);
    if (
      encounter.state === "dormant"
      && this.territoryAge >= U2_TIMING.watcherDiscoverSeconds
      && distance <= 11.5
    ) {
      this.transition(encounter.id, "available", { trigger: "watcher_entered_peripheral_awareness", distance });
    }

    if (
      encounter.state === "available"
      && this.territoryAge >= U2_TIMING.watcherStartSeconds
      && distance <= 8.5
    ) {
      this.transition(encounter.id, "active", { trigger: "player_lingered_inside_watcher_sweep", distance });
      this.watcherPresenceSeconds = 0;
    }

    if (encounter.state === "active") {
      if (distance <= 9.6) {
        this.watcherPresenceSeconds += dt;
        encounter.activeSeconds = this.watcherPresenceSeconds;
        encounter.progress01 = clamp01(this.watcherPresenceSeconds / U2_TIMING.watcherReadSeconds);
        if (encounter.progress01 >= 1) {
          this.transition(encounter.id, "completed", { trigger: "watcher_completed_nonverbal_sweep", distance });
          this.watcherAnswerAge = 0;
        }
      } else {
        this.interruptEncounter(encounter, "player_left_sweep_before_read", { distance }, 0.75);
        this.watcherPresenceSeconds = 0;
      }
    }

    const ambientPulse = encounter.state === "active"
      ? encounter.progress01
      : encounter.completionCount > 0 ? 0.18 : 0;
    const answerPulse = this.watcherAnswerAge < 2.4 ? 1 - this.watcherAnswerAge / 2.4 : 0;
    const memoryBoost = this.interactionMemory.mode === "guarded"
      ? 0.18
      : this.interactionMemory.mode === "coherent" ? 0.1 : 0;

    this.watcherScan.position.copy(watcher.root.position);
    this.watcherScan.position.y += 0.05;
    this.watcherScan.rotation.z += dt * (0.22 + ambientPulse * 0.55 + answerPulse * 0.8 + memoryBoost);
    this.watcherScan.scale.setScalar(0.85 + ambientPulse * 0.35 + answerPulse * 0.65 + memoryBoost * 0.25);
    this.watcherScan.material.opacity = 0.04 + ambientPulse * 0.20 + answerPulse * 0.58 + memoryBoost * 0.18;
  }

  updateRelayPresentation(relayA, relayB, dt) {
    const encounter = this.encounters.get("ambient_relay_exchange");
    if (!relayA?.root?.visible || !relayB?.root?.visible) {
      this.transferPacket.visible = false;
      this.relayThread.visible = false;
      return;
    }

    this.relayThread.visible = true;
    this.transferPacket.visible = true;
    this.relayLinePositions[0] = relayA.root.position.x;
    this.relayLinePositions[1] = relayA.root.position.y;
    this.relayLinePositions[2] = relayA.root.position.z;
    this.relayLinePositions[3] = relayB.root.position.x;
    this.relayLinePositions[4] = relayB.root.position.y;
    this.relayLinePositions[5] = relayB.root.position.z;
    this.relayThread.geometry.attributes.position.needsUpdate = true;

    if (encounter.state === "dormant" && this.territoryAge >= U2_TIMING.relayDiscoverSeconds) {
      this.transition(encounter.id, "available", { trigger: "two_relays_visible_in_same_local_body" });
    }
    if (encounter.state === "available" && this.territoryAge >= U2_TIMING.relayStartSeconds) {
      this.transition(encounter.id, "active", { trigger: "host_matter_exchange_started" });
    }

    this.exchangeAge += dt;
    const loopSeconds = 4.4;
    let phase = (this.exchangeAge % loopSeconds) / loopSeconds;
    if (this.relayAnswerAge < 1.8) phase = 1 - phase;
    const travel = smooth01(phase);
    this.transferPacket.position.lerpVectors(relayA.root.position, relayB.root.position, travel);
    this.transferPacket.position.y += Math.sin(phase * Math.PI) * 0.55;
    this.transferPacket.scale.setScalar(0.82 + Math.sin(phase * Math.PI) * 0.38 + (this.relayAnswerAge < 1.8 ? 0.22 : 0));
    this.transferPacket.material.opacity = 0.58 + Math.sin(phase * Math.PI) * 0.28;
    this.relayThread.material.opacity = 0.10 + Math.sin(phase * Math.PI) * 0.10 + (this.relayAnswerAge < 1.8 ? 0.16 : 0);

    if (encounter.state === "active") {
      encounter.activeSeconds += dt;
      encounter.progress01 = clamp01(encounter.activeSeconds / U2_TIMING.relayReadSeconds);
      if (encounter.progress01 >= 1) {
        this.transition(encounter.id, "completed", { trigger: "matter_packet_reached_second_relay" });
      }
    }
  }

  updateReactiveEncounters(frameState, watcher, relayA, relayB, dt) {
    const watcherAmbient = this.encounters.get("ambient_watcher_sweep");
    const relayAmbient = this.encounters.get("ambient_relay_exchange");
    const watcherReactive = this.encounters.get("reactive_watcher_stable_interrogation");
    const relayReactive = this.encounters.get("reactive_relay_held_intake");
    const grammar = frameState.entityRelationshipGrammar?.byEntityId ?? {};

    if (watcherAmbient.completionCount > 0 && watcherReactive.state === "dormant") {
      this.transition(watcherReactive.id, "available", { trigger: "watcher_has_completed_ambient_read" });
    }
    if (relayAmbient.completionCount > 0 && relayReactive.state === "dormant") {
      this.transition(relayReactive.id, "available", { trigger: "relay_exchange_is_visible_and_understood" });
    }

    const watcherRead = grammar[WATCHER_ID];
    const watcherChord = Boolean(
      watcher?.root?.visible
      && watcherRead?.interpretation === "stable_interrogation"
      && Number(watcherRead?.engagement01 ?? 0) >= 0.08
    );

    const relayReads = [grammar[RELAY_A_ID], grammar[RELAY_B_ID]].filter(Boolean);
    const heldIntake = relayReads.find((read) => (
      read.interpretation === "held_intake"
      && Number(read.engagement01 ?? 0) >= 0.08
    ));
    const relayChord = Boolean(
      heldIntake
      && (relayA?.root?.visible || relayB?.root?.visible)
    );

    this.updateReactiveEncounter({
      encounter: watcherReactive,
      chordActive: watcherChord,
      dt,
      duration: U2_TIMING.watcherResponseSeconds,
      cooldown: U2_TIMING.watcherRecurrenceCooldownSeconds,
      startTrigger: "stabilize_plus_pulse_watcher_chord",
      completeTrigger: "watcher_answered_stable_interrogation",
      detail: {
        engagement01: Number(watcherRead?.engagement01 ?? 0),
        distance: watcherRead?.distance
      },
      onComplete: () => { this.watcherAnswerAge = 0; }
    });

    this.updateReactiveEncounter({
      encounter: relayReactive,
      chordActive: relayChord,
      dt,
      duration: U2_TIMING.relayResponseSeconds,
      cooldown: U2_TIMING.relayRecurrenceCooldownSeconds,
      startTrigger: "stabilize_plus_absorb_relay_chord",
      completeTrigger: "relay_held_intake_redirected_local_exchange",
      detail: {
        engagement01: Number(heldIntake?.engagement01 ?? 0),
        distance: heldIntake?.distance
      },
      onComplete: () => { this.relayAnswerAge = 0; }
    });
  }

  updateReactiveEncounter({
    encounter,
    chordActive,
    dt,
    duration,
    cooldown,
    startTrigger,
    completeTrigger,
    detail,
    onComplete
  }) {
    if (!encounter) return;
    const localDistance = this.playerRoot.position.distanceTo(this.center);
    const locallyPresent = localDistance <= U2_TIMING.localResponseRadius;

    if (encounter.state === "completed") {
      if (!chordActive) encounter.releaseSeenSinceCompletion = true;
      const cooled = this.territoryAge - encounter.lastCompletionAge >= cooldown;
      if (encounter.releaseSeenSinceCompletion && cooled && locallyPresent) {
        this.rearmEncounter(encounter, "release_plus_cooldown_rearmed_relationship");
      }
      return;
    }

    if (
      encounter.state === "available"
      && encounter.retryBackoff <= 0
      && chordActive
      && locallyPresent
    ) {
      this.transition(encounter.id, "active", {
        trigger: startTrigger,
        ...detail,
        recurrence: encounter.completionCount > 0
      });
    }

    if (encounter.state !== "active") return;

    if (chordActive && locallyPresent) {
      encounter.responseBreakSeconds = 0;
      encounter.activeSeconds += dt;
      encounter.progress01 = clamp01(encounter.activeSeconds / duration);
      if (encounter.progress01 >= 1) {
        const recurrence = encounter.completionCount > 0;
        this.transition(encounter.id, "completed", {
          trigger: completeTrigger,
          ...detail,
          recurrence
        });
        onComplete?.();
      }
      return;
    }

    encounter.responseBreakSeconds += dt;
    if (encounter.responseBreakSeconds >= U2_TIMING.responseBreakGraceSeconds) {
      const trigger = locallyPresent ? "relationship_chord_broke_before_answer" : "player_left_local_body_during_answer";
      this.interruptEncounter(encounter, trigger, {
        localDistance: round(localDistance),
        chordActive
      });
    }
  }

  updateCrossTerritoryEncounters(dt, watcher, relayA) {
    const watcherReactive = this.encounters.get("reactive_watcher_stable_interrogation");
    const relayReactive = this.encounters.get("reactive_relay_held_intake");
    const echo = this.encounters.get("cross_ridge_echo_return");
    const spill = this.encounters.get("cross_matter_spill_return");

    this.startCrossTerritoryCycle({
      source: watcherReactive,
      encounter: echo,
      availableTrigger: "watcher_answer_has_remote_consequence",
      startTrigger: "watcher_answer_propagates_back_to_ridge",
      reset: () => { this.echoAge = 0; }
    });
    this.startCrossTerritoryCycle({
      source: relayReactive,
      encounter: spill,
      availableTrigger: "relay_intake_releases_surplus_matter",
      startTrigger: "surplus_matter_leaves_gathering_ground",
      reset: () => { this.spillAge = 0; }
    });

    if (echo.state === "active") {
      this.echoAge += dt;
      echo.activeSeconds += dt;
      echo.progress01 = clamp01(this.echoAge / U2_TIMING.ridgeEchoSeconds);
      if (echo.progress01 >= 1) {
        this.transition(echo.id, "completed", {
          trigger: "echo_reached_membrane_ridge",
          sourceCompletionCount: echo.sourceCompletionCount
        });
      }
    }
    this.updateEchoVisual(echo, watcher);

    if (spill.state === "active") {
      this.spillAge += dt;
      spill.activeSeconds += dt;
      spill.progress01 = clamp01(this.spillAge / U2_TIMING.matterSpillSeconds);
      if (spill.progress01 >= 1) {
        this.transition(spill.id, "completed", {
          trigger: "matter_spill_settled_at_ridge",
          sourceCompletionCount: spill.sourceCompletionCount
        });
      }
    }
    this.updateSpillVisual(spill, relayA);
  }

  startCrossTerritoryCycle({ source, encounter, availableTrigger, startTrigger, reset }) {
    if (!source || !encounter) return;
    if (source.completionCount <= encounter.sourceCompletionCount) return;
    if (encounter.state === "active") return;

    const firstRead = encounter.discoveryCount === 0;
    if (firstRead) {
      this.transition(encounter.id, "available", {
        trigger: availableTrigger,
        sourceCompletionCount: source.completionCount
      });
    } else {
      this.rearmEncounter(encounter, "source_relationship_answered_again", {
        sourceCompletionCount: source.completionCount
      });
    }

    encounter.sourceCompletionCount = source.completionCount;
    this.transition(encounter.id, "active", {
      trigger: startTrigger,
      sourceCompletionCount: source.completionCount,
      recurrence: encounter.completionCount > 0
    });
    reset?.();
  }

  updateEchoVisual(encounter, watcher) {
    if (!this.echoInstances) return;
    const activeOrComplete = encounter.state === "active" || encounter.state === "completed";
    const start = watcher?.root?.visible ? watcher.root.position : this.center;
    const baseProgress = encounter.state === "completed" ? 1 : encounter.progress01;

    for (let i = 0; i < 7; i += 1) {
      const offset = i * 0.075;
      const p = activeOrComplete ? clamp01(baseProgress * 1.28 - offset) : 0;
      this.quadratic(start, this.center, this.ridge, smooth01(p), this.tempB);
      this.echoDummy.position.copy(this.tempB);
      const visible = activeOrComplete && p > 0.002 && p < 0.998;
      const scale = visible ? 0.7 + Math.sin(p * Math.PI) * 0.75 : 0.001;
      this.echoDummy.scale.setScalar(scale);
      this.echoDummy.updateMatrix();
      this.echoInstances.setMatrixAt(i, this.echoDummy.matrix);
    }
    this.echoInstances.instanceMatrix.needsUpdate = true;
  }

  updateSpillVisual(encounter, relayA) {
    const active = encounter.state === "active";
    const completed = encounter.state === "completed";
    this.spillPacket.visible = active;
    this.spillResidue.visible = completed;

    const start = relayA?.root?.visible ? relayA.root.position : this.center;
    if (active) {
      this.quadratic(start, this.center, this.ridge, smooth01(encounter.progress01), this.tempC);
      this.spillPacket.position.copy(this.tempC);
      this.spillPacket.rotation.x += 0.08;
      this.spillPacket.rotation.y += 0.11;
      this.spillPacket.material.opacity = 0.35 + Math.sin(encounter.progress01 * Math.PI) * 0.55;
    }
    if (completed) {
      this.spillResidue.position.copy(this.ridge).add(this.tempA.set(-0.9, 0.45, -0.3));
      this.spillResidue.material.opacity = 0.28;
      this.spillResidue.scale.setScalar(0.9 + Math.sin(this.territoryAge * 0.6) * 0.05);
    }
  }

  updateInteractionMemory(frameState, dt) {
    const chord = frameState.coreVerbEngineCoupling?.chord ?? "idle";
    const reactive = [
      this.encounters.get("reactive_watcher_stable_interrogation"),
      this.encounters.get("reactive_relay_held_intake")
    ];
    const interruptionCount = reactive.reduce((sum, item) => sum + (item?.interruptionCount ?? 0), 0);

    if (chord === "idle") {
      this.interactionMemory.observerSeconds += dt;
    } else if (chord === "cohere_project" || chord === "cohere_draw") {
      this.interactionMemory.coherentSeconds += dt;
    } else {
      this.interactionMemory.pressureSeconds += dt;
    }
    this.interactionMemory.interruptionWeight = interruptionCount * 0.75;

    const guardedScore = this.interactionMemory.pressureSeconds + this.interactionMemory.interruptionWeight;
    const coherentScore = this.interactionMemory.coherentSeconds
      + reactive.reduce((sum, item) => sum + (item?.completionCount ?? 0) * 0.9, 0);

    let mode = "quiet_observer";
    if (guardedScore >= 2.8 && guardedScore > coherentScore * 0.9) mode = "guarded";
    else if (coherentScore >= 1.4) mode = "coherent";

    if (mode !== this.interactionMemory.mode) {
      const previous = this.interactionMemory.mode;
      this.interactionMemory.mode = mode;
      this.interactionMemory.lastChangeAge = this.territoryAge;
      this.eventSequence += 1;
      this.recentEvents.push({
        sequence: this.eventSequence,
        kind: "memory_changed",
        encounterId: "gathering_ground_memory",
        family: "ecology_memory",
        label: "Gathering Ground Interaction Memory",
        state: mode,
        territoryAge: round(this.territoryAge, 2),
        playerDistanceToCenter: round(this.playerRoot.position.distanceTo(this.center)),
        detail: { trigger: "player_pressure_profile_changed", from: previous, to: mode }
      });
      if (this.recentEvents.length > 48) this.recentEvents.splice(0, this.recentEvents.length - 48);
    }
  }

  interruptEncounter(encounter, trigger, detail = {}, backoff = U2_TIMING.responseRetryBackoffSeconds) {
    if (!encounter || encounter.state !== "active") return;
    encounter.interruptionCount += 1;
    encounter.progress01 = 0;
    encounter.activeSeconds = 0;
    encounter.responseBreakSeconds = 0;
    encounter.retryBackoff = Math.max(encounter.retryBackoff, backoff);
    encounter.state = "available";
    encounter.availableSinceAge = this.territoryAge;
    this.emit("interrupted", encounter, { trigger, retryBackoffSeconds: round(encounter.retryBackoff), ...detail });
  }

  rearmEncounter(encounter, trigger, detail = {}) {
    if (!encounter || encounter.state === "active") return;
    encounter.state = "available";
    encounter.progress01 = 0;
    encounter.activeSeconds = 0;
    encounter.responseBreakSeconds = 0;
    encounter.retryBackoff = 0;
    encounter.releaseSeenSinceCompletion = false;
    encounter.availableSinceAge = this.territoryAge;
    this.emit("rearmed", encounter, {
      trigger,
      completionCount: encounter.completionCount,
      ...detail
    });
  }

  updateIgnoredEncounters() {
    for (const id of ["reactive_watcher_stable_interrogation", "reactive_relay_held_intake"]) {
      const encounter = this.encounters.get(id);
      if (
        encounter.state !== "available"
        || encounter.ignoredEmitted
        || encounter.discoveryCount === 0
        || encounter.completionCount > 0
      ) continue;
      const availableAge = this.territoryAge - Number(encounter.availableSinceAge ?? this.territoryAge);
      if (availableAge < 45) continue;
      encounter.ignoredEmitted = true;
      encounter.ignoredCount += 1;
      this.emit("ignored", encounter, {
        trigger: "available_for_45_seconds_without_player_engagement",
        availableSeconds: round(availableAge)
      });
    }
  }

  quadratic(a, b, c, t, out) {
    const u = 1 - t;
    out.set(
      u * u * a.x + 2 * u * t * b.x + t * t * c.x,
      u * u * a.y + 2 * u * t * b.y + t * t * c.y,
      u * u * a.z + 2 * u * t * b.z + t * t * c.z
    );
    return out;
  }

  transition(id, state, detail = {}) {
    const encounter = this.encounters.get(id);
    if (!encounter || encounter.state === state) return;
    encounter.state = state;

    if (state === "available") {
      if (encounter.discoveryCount === 0) {
        encounter.discoveryCount += 1;
        encounter.availableSinceAge = this.territoryAge;
        this.emit("discovered", encounter, detail);
      } else {
        encounter.availableSinceAge = this.territoryAge;
      }
      return;
    }

    if (state === "active") {
      encounter.startCount += 1;
      encounter.activeSeconds = 0;
      encounter.responseBreakSeconds = 0;
      encounter.progress01 = 0;
      this.emit("started", encounter, detail);
      return;
    }

    if (state === "completed") {
      const recurrence = encounter.completionCount > 0;
      encounter.completionCount += 1;
      encounter.progress01 = 1;
      encounter.lastCompletionAge = this.territoryAge;
      encounter.releaseSeenSinceCompletion = false;
      this.emit("completed", encounter, {
        firstRead: !recurrence,
        recurrenceCycle: recurrence ? encounter.completionCount - 1 : 0,
        ...detail
      });
      if (recurrence) {
        encounter.recurrenceCount += 1;
        this.ongoingResponseCycles += 1;
        this.emit("recurred", encounter, {
          trigger: "understood_relationship_answered_again",
          recurrenceCycle: encounter.recurrenceCount
        });
      }
    }
  }

  emit(kind, encounter, detail = {}) {
    this.eventSequence += 1;
    this.recentEvents.push({
      sequence: this.eventSequence,
      kind,
      encounterId: encounter.id,
      family: encounter.family,
      label: encounter.label,
      state: encounter.state,
      territoryAge: round(this.territoryAge, 2),
      playerDistanceToCenter: round(this.playerRoot.position.distanceTo(this.center)),
      detail
    });
    if (this.recentEvents.length > 48) this.recentEvents.splice(0, this.recentEvents.length - 48);
  }

  publish(frameState) {
    const encounterStates = {};
    const family = {
      ambient: { completed: 0, total: 2 },
      reactive: { completed: 0, total: 2 },
      cross_territory: { completed: 0, total: 2 }
    };
    let completedCount = 0;
    let activeResponseCount = 0;

    for (const [id, encounter] of this.encounters.entries()) {
      const firstCompleted = encounter.completionCount > 0;
      encounterStates[id] = {
        family: encounter.family,
        label: encounter.label,
        state: encounter.state,
        progress01: round(encounter.progress01),
        firstCompleted,
        completionCount: encounter.completionCount,
        recurrenceCount: encounter.recurrenceCount,
        ignoredCount: encounter.ignoredCount,
        interruptionCount: encounter.interruptionCount,
        retryBackoff: round(encounter.retryBackoff)
      };
      if (firstCompleted) {
        completedCount += 1;
        family[encounter.family].completed += 1;
      }
      if (encounter.state === "active") activeResponseCount += 1;
    }

    const watcherReactive = this.encounters.get("reactive_watcher_stable_interrogation");
    const relayReactive = this.encounters.get("reactive_relay_held_intake");

    const nextAction = !this.active
      ? "enter_gathering_ground"
      : this.encounters.get("ambient_watcher_sweep").completionCount === 0
        ? "linger_near_the_perimeter_watcher_and_watch_its_sweep"
        : this.encounters.get("ambient_relay_exchange").completionCount === 0
          ? "watch_the_two_relays_pass_host_matter_between_them"
          : watcherReactive.completionCount === 0
            ? "hold_stabilize_and_pulse_near_the_watcher_until_the_answer_develops"
            : relayReactive.completionCount === 0
              ? "hold_stabilize_and_absorb_near_a_relay_until_the_exchange_redirects"
              : completedCount < 6
                ? "watch_the_answers_travel_back_toward_membrane_ridge"
                : activeResponseCount > 0
                  ? "hold_the_current_relationship_or_release_it_cleanly"
                  : this.ongoingResponseCycles > 0
                    ? "wander_and_revisit_the_watcher_or_relays_to_read_how_the_ecology_remembers_you"
                    : "release_move_away_and_return_later_to_see_the_understood_ecology_answer_again";

    frameState.gatheringGroundAlive = {
      pass: "HC-031U2",
      active: this.active,
      territoryId: TERRITORY_ID,
      encounterCount: ENCOUNTER_DEFS.length,
      completedCount,
      family,
      encounters: encounterStates,
      eventSequence: this.eventSequence,
      recentEvents: this.recentEvents.slice(),
      territoryAge: round(this.territoryAge, 2),
      ongoingResponseCycles: this.ongoingResponseCycles,
      activeResponseCount,
      memory: {
        mode: this.interactionMemory.mode,
        observerSeconds: round(this.interactionMemory.observerSeconds),
        coherentSeconds: round(this.interactionMemory.coherentSeconds),
        pressureSeconds: round(this.interactionMemory.pressureSeconds),
        interruptionWeight: round(this.interactionMemory.interruptionWeight),
        lastChangeAge: round(this.interactionMemory.lastChangeAge)
      },
      nextAction,
      population: {
        watcherId: WATCHER_ID,
        relayIds: [RELAY_A_ID, RELAY_B_ID],
        entityBehaviorOwner: "EntitySystem",
        relationshipInterpretationOwner: "EntityRelationshipGrammarSystem"
      },
      visualBudget: {
        newDrawCallIntent: 5,
        instancedEchoBeads: 7,
        newParticles: 0,
        newLights: 0
      },
      pacing: {
        watcherAmbientReadSeconds: U2_TIMING.watcherReadSeconds,
        relayAmbientReadSeconds: U2_TIMING.relayReadSeconds,
        watcherReactiveResponseSeconds: U2_TIMING.watcherResponseSeconds,
        relayReactiveResponseSeconds: U2_TIMING.relayResponseSeconds,
        watcherRecurrenceCooldownSeconds: U2_TIMING.watcherRecurrenceCooldownSeconds,
        relayRecurrenceCooldownSeconds: U2_TIMING.relayRecurrenceCooldownSeconds
      },
      progressionAuthority: false,
      targetingAuthority: false,
      movementAuthority: false,
      collisionAuthority: false,
      chemistryAuthority: false,
      cellAuthority: false,
      routeAuthority: false,
      saveStateAuthority: false,
      rule: "local_ecology_may_recur_and_remember_existing_relationships_without_becoming_a_new_gate"
    };
  }
}
