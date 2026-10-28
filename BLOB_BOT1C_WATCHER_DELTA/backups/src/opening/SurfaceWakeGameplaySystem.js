import * as THREE from "three";

const RECIPE_ID = "SURFACE_WAKE_GAMEPLAY_FILL_HC007A";
const CIRCUIT_RECIPE_ID = "SURFACE_WAKE_LIVING_NURSERY_CIRCUIT_HC009C";
const CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const HOST_CONTINUATION_SURFACE_MODES = new Set(["surface_brace", "braced_project", "braced_draw", "surface_equilibrium"]);

/**
 * HC-007A fills the space between the existing Surface Wake triggers with
 * continuous systemic play. It never completes the authored Surface Wake
 * convergence trigger itself; it only makes movement, pulse, absorb and
 * stabilize meaningful while the player travels through the nursery.
 */
export class SurfaceWakeGameplaySystem {
  constructor({ recipeDataSystem, chemObjectSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[SurfaceWakeGameplaySystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[SurfaceWakeGameplaySystem] chemObjectSystem is required.");
    if (!scene) throw new Error("[SurfaceWakeGameplaySystem] scene is required.");
    if (!playerRoot) throw new Error("[SurfaceWakeGameplaySystem] playerRoot is required.");
    if (!frameState) throw new Error("[SurfaceWakeGameplaySystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.circuitRecipe = null;
    this.readObjects = new Set();
    this.absorbedMotes = new Set();
    this.stabilizeSeconds = 0;
    this.currentAgitation = 0;
    this.lastPulseEventId = 0;
    this.scarExposure = 0;
    this.scarHardness = 0;
    this.moteRoles = new Map();
    this.lastAbsorbedMoteRole = "none";
    this.lastAbsorbedMoteResponse = "none";
    this.pressureFronts = [];
    this.baseFlow = new THREE.Vector3();
    this.swellDirection = new THREE.Vector3();
    this.temp = new THREE.Vector3();
    this.initializedVisuals = false;

    this.circuitRoot = null;
    this.packetRoot = null;
    this.packetCore = null;
    this.packetShells = [];
    this.packetTrail = [];
    this.packetPath = null;
    this.packetActive = false;
    this.packetProgress = 0;
    this.packetPurity = 0;
    this.packetIdentified = false;
    this.packetFiltered = false;
    this.packetPulseRead = false;
    this.packetPlayerIntervened = false;
    this.packetStabilizeSeconds = 0;
    this.packetMatterType = "none";
    this.packetOutcome = "none";
    this.circuitRestSeconds = 0;
    this.circuitSequence = 0;
    this.lastCircuitPulseEventId = 0;
    this.resolvedCycleCount = 0;
    this.successfulCycleCount = 0;
    this.failedCycleCount = 0;
    this.playerAuthoredCycleCount = 0;
    this.playerAuthoredSuccessfulCycleCount = 0;
    this.playerAuthoredFailedCycleCount = 0;
    this.passiveCycleCount = 0;
    this.passiveFailureCount = 0;
    this.agencyProven = false;
    this.tenderFedCount = 0;
    this.coreNourishedCount = 0;
    this.tenderTrust = 0;
    this.tenderIntegrity = 0;
    this.scarLoad = 0;
    this.lastOutcomeSequence = 0;
    this.foldInvitation = false;

    // HC019B: the first playable obstacle now has an explicit material-state
    // consequence. The Listening Fold does not emerge because a generic
    // objective flag changed; it emerges after the living packet has been
    // deliberately read and brought into a safe state by the existing verbs.
    this.materialPassageOpen = false;
    this.materialPassageStrength = 0;
    this.materialPassageCause = "none";

    // HC031O: route revelation can now emerge from the physical Host language
    // proven in K→N without converting ecology/telemetry into progression owners.
    // SurfaceWakeGameplaySystem owns only the invitation; LocalCellMorphSystem
    // still owns the actual continuous cell morph. The older material/seed path
    // remains valid and can reveal the same fold.
    this.hostContinuationSurfaceHoldSeconds = 0;
    this.hostContinuationSurfaceRelationshipProven = false;
    this.hostContinuationCommunityMemoryProven = false;
    this.hostContinuationMatterAnswerProven = false;
    this.hostContinuationRelationshipProven = false;
    this.hostContinuationInvitationOpen = false;
    this.hostContinuationCause = "none";
    this.hostContinuationOpenedAt = -1;

    this.circuitHistory = [];
    this.packetPosition = new THREE.Vector3();
    this.packetTangent = new THREE.Vector3();
    this.packetDistance = Infinity;
    // HC021A: compose depth from the existing verbs.
    this.familySeenTypes = new Set();
    this.familyResolvedTypes = new Set();
    this.familyStage = "teach";
    this.familyRecognitionCount = 0;
    this.familyLastLesson = "unread_matter";
    this.combinationStage = "observe_relationship";
    this.combinationChain = [];
    this.combinationResolvedCount = 0;
    this.lastCombinationOutcome = "none";
    // HC023B: living states are derived from the nursery's existing chemistry
    // and history. They do not own progression or add a new system.
    this.livingState = "cautious";
    this.previousLivingState = "none";
    this.livingStateChangedAt = 0;
    this.livingStateSequence = 0;
    this.lastOutcomeAt = -999;
  }

  init() {
    this.recipe = this.recipeDataSystem.get("surfaceWakeGameplayRecipes", RECIPE_ID);
    this.circuitRecipe = this.recipeDataSystem.data.surfaceWakeLivingCircuit;
    if (!this.circuitRecipe || this.circuitRecipe.id !== CIRCUIT_RECIPE_ID) {
      throw new Error(`[SurfaceWakeGameplaySystem] Missing ${CIRCUIT_RECIPE_ID}.`);
    }
    const base = this.recipe.flow?.baseVector ?? [0.12, 0.02, -0.18];
    const swell = this.recipe.flow?.swellDirection ?? [0.72, 0.03, -0.56];
    this.baseFlow.set(base[0] ?? 0, base[1] ?? 0, base[2] ?? 0);
    this.swellDirection.set(swell[0] ?? 0, swell[1] ?? 0, swell[2] ?? 0).normalize();
    for (const [id, identity] of Object.entries(this.recipe.moteIdentities ?? {})) {
      this.moteRoles.set(id, identity);
    }
    this.createPressureFronts();
    this.createLivingCircuit();
    const startingState = this.circuitRecipe.startingState ?? {};
    this.tenderTrust = startingState.tenderTrust ?? 0.32;
    this.tenderIntegrity = startingState.tenderIntegrity ?? 0.72;
    this.scarLoad = startingState.scarLoad ?? 0.22;
    this.circuitRestSeconds = this.circuitRecipe.cycle?.initialDelaySeconds ?? 2.4;
    this.frameState.nurseryCircuit = this.createCircuitState(false);
    this.frameState.surfaceWakeGameplay = this.createState(false, 0, false, false);
  }

  update(dt, frameState) {
    const active = frameState.activeCellId === CELL_ID;
    if (!active) {
      this.setPressureFrontsVisible(false);
      if (this.circuitRoot) this.circuitRoot.visible = false;
      frameState.nurseryCircuit = this.createCircuitState(false);
      frameState.surfaceWakeGameplay = this.createState(false, 0, false, false);
      return;
    }

    if (!this.initializedVisuals) {
      this.initializedVisuals = true;
      this.tagGameplayMotes();
    }

    this.setPressureFrontsVisible(true);
    if (this.circuitRoot) this.circuitRoot.visible = true;
    const t = frameState.runtimeSeconds ?? 0;
    const currentObject = this.findObject(this.recipe.worldRead?.currentRibbonId);
    const scarObject = this.findObject(this.recipe.risk?.scarPlateId);
    const nearCurrentDistance = currentObject
      ? this.playerRoot.position.distanceTo(currentObject.root.position)
      : Infinity;
    const nearScarDistance = scarObject
      ? this.playerRoot.position.distanceTo(scarObject.root.position)
      : Infinity;

    this.handlePulseReads(frameState, currentObject, scarObject);
    this.currentAgitation = Math.max(0, this.currentAgitation - dt);

    const flow = this.recipe.flow ?? {};
    const cycleSeconds = Math.max(2, flow.cycleSeconds ?? 6.2);
    const swellPhase = (t % cycleSeconds) / cycleSeconds;
    const swellShape = Math.max(0, Math.sin(swellPhase * Math.PI * 2));
    const cyclePhase = this.resolveCyclePhase(swellPhase);
    const nearCurrentWeight = Math.max(0, 1 - nearCurrentDistance / Math.max(0.1, flow.nearCurrentRange ?? 2.25));
    const agitation = this.currentAgitation > 0 ? (flow.pulseAgitationBonus ?? 0.32) : 0;
    const rawIntensity = Math.min(1, 0.18 + swellShape * 0.58 + nearCurrentWeight * 0.34 + agitation);
    const stabilizing = Boolean(frameState.input?.stabilizeHeld);
    const damping = stabilizing ? (flow.stabilizeDamping ?? 0.28) : 1;
    const effectiveIntensity = rawIntensity * damping;

    if (stabilizing && rawIntensity >= 0.48) {
      this.stabilizeSeconds += dt;
    }

    const basePressure = flow.basePressure ?? 0.24;
    const swellPressure = flow.swellPressure ?? 0.62;
    const rawPressure = Math.min(1, basePressure + effectiveIntensity * (swellPressure - basePressure));
    const passageRelief = this.materialPassageOpen
      ? 0.18 * Math.max(0.25, this.materialPassageStrength)
      : 0;
    const pressure = Math.max(0.08, rawPressure * (1 - passageRelief));

    this.temp.copy(this.baseFlow).addScaledVector(this.swellDirection, effectiveIntensity * 0.72);
    if (this.materialPassageOpen) {
      // The changed tissue now carries flow toward the already-authored Listening Fold.
      // This is a traversal consequence, not a second transition owner.
      this.temp.x *= 0.88;
      this.temp.y += 0.018 * this.materialPassageStrength;
      this.temp.z -= 0.12 * this.materialPassageStrength;
    }
    frameState.physicalFeel = {
      ...(frameState.physicalFeel ?? {}),
      pressure,
      flowVector: { x: this.temp.x, y: this.temp.y, z: this.temp.z },
      boundaryBehavior: this.materialPassageOpen
        ? "surface_membrane_opened_by_safe_matter_state"
        : "elastic_membrane_recoil_with_living_pressure",
      materialPassageOpen: this.materialPassageOpen,
      materialPassageStrength: this.materialPassageStrength
    };

    const risk = this.recipe.risk ?? {};
    const unsafeNearScar = nearScarDistance <= (risk.scarRange ?? 1.65) && rawIntensity >= (risk.unsafePressureThreshold ?? 0.56);
    if (unsafeNearScar && !stabilizing) {
      const gain = (risk.scarGainPerSecond ?? 0.0015) * dt;
      frameState.playerComposition.scar = Math.min(1, (frameState.playerComposition.scar ?? 0) + gain);
      this.scarExposure += dt;
    }

    const forcingScar = nearScarDistance <= (risk.scarRange ?? 1.65) && Boolean(frameState.input?.absorbHeld);
    this.scarHardness = Math.max(0, Math.min(1, this.scarHardness + (forcingScar ? dt * 0.38 : -dt * 0.22)));
    this.applyScarHardness(scarObject, t);

    this.updateAbsorbedMotes();
    const passageTarget = this.materialPassageOpen ? 1 : 0;
    this.materialPassageStrength += (passageTarget - this.materialPassageStrength)
      * (1 - Math.exp(-dt * (passageTarget > this.materialPassageStrength ? 3.8 : 5.2)));
    this.animatePressureFronts(t, rawIntensity, stabilizing);
    this.updateLivingCircuit(dt, frameState, t);
    this.updateHostContinuation(dt, frameState);

    const choiceState = this.absorbedMotes.has("surface_wake_membrane_mote_003")
      ? "risk_reward_edge_mote_taken"
      : nearScarDistance < 2.2
        ? "risk_reward_edge_mote_seen"
        : "risk_reward_open";

    frameState.surfaceWakeGameplay = this.createState(
      true,
      rawIntensity,
      stabilizing,
      unsafeNearScar,
      {
        pressure,
        nearCurrentDistance,
        nearScarDistance,
        choiceState,
        cyclePhase,
        calmWindow: cyclePhase === "calm_window",
        nurseryCircuit: frameState.nurseryCircuit
      }
    );
  }


  updateHostContinuation(dt, frameState) {
    const attachment = frameState.playerAttachment ?? {};
    const grammar = frameState.verbPhysicalGrammar ?? {};
    const relationship = frameState.entityRelationshipGrammar ?? {};
    const memory = frameState.entityReciprocalMemory ?? {};
    const matter = frameState.entityLocalMatterCoupling ?? {};

    const surfaceRelationshipLive = Boolean(
      attachment.active
      && grammar.surfaceBound
      && HOST_CONTINUATION_SURFACE_MODES.has(grammar.mode ?? "idle")
      && relationship.active
      && (relationship.primary?.engagement01 ?? 0) >= 0.14
    );

    if (surfaceRelationshipLive) {
      this.hostContinuationSurfaceHoldSeconds = Math.min(2, this.hostContinuationSurfaceHoldSeconds + Math.max(0, dt));
    } else {
      this.hostContinuationSurfaceHoldSeconds = Math.max(0, this.hostContinuationSurfaceHoldSeconds - Math.max(0, dt) * 0.55);
    }

    if (this.hostContinuationSurfaceHoldSeconds >= 0.42) {
      this.hostContinuationSurfaceRelationshipProven = true;
    }

    const memoryPrimary = memory.primary ?? {};
    if (
      (memory.commitCount ?? 0) > 0
      && (memoryPrimary.entityId ?? "none") !== "none"
      && (memoryPrimary.strength01 ?? 0) >= 0.45
    ) {
      this.hostContinuationCommunityMemoryProven = true;
    }

    const matterPrimary = matter.primary ?? {};
    if (
      matter.active
      && ["answering", "expressing"].includes(matterPrimary.causalStage ?? "inactive")
      && (matterPrimary.strength01 ?? 0) >= 0.08
    ) {
      this.hostContinuationMatterAnswerProven = true;
    }

    if (
      this.hostContinuationSurfaceRelationshipProven
      && this.hostContinuationCommunityMemoryProven
      && this.hostContinuationMatterAnswerProven
    ) {
      this.hostContinuationRelationshipProven = true;
    }

    const invitationOpen = Boolean(this.materialPassageOpen || this.hostContinuationRelationshipProven);
    if (invitationOpen && !this.hostContinuationInvitationOpen) {
      this.hostContinuationOpenedAt = frameState.runtimeSeconds ?? 0;
      this.hostContinuationCause = this.materialPassageOpen
        ? `material_passage:${this.materialPassageCause}`
        : "surface_relationship_to_community_memory_to_host_matter_answer";
    }
    this.hostContinuationInvitationOpen = invitationOpen;

    // The Watcher/Tender presentation may turn toward the same authored fold for
    // either causal path. This does not open a gate or change activeCellId.
    this.foldInvitation = invitationOpen;
  }

  createLivingCircuit() {
    const points = (this.circuitRecipe.cycle?.pathPoints ?? []).map(
      ([x = 0, y = 0, z = 0]) => new THREE.Vector3(x, y, z)
    );
    if (points.length < 4) {
      throw new Error("[SurfaceWakeGameplaySystem] Living nursery circuit requires at least four path points.");
    }

    this.packetPath = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.42);
    this.circuitRoot = new THREE.Group();
    this.circuitRoot.name = "surface_wake_living_nursery_circuit_HC009C";
    this.circuitRoot.userData.gameplayOwner = "SurfaceWakeGameplaySystem";
    this.circuitRoot.userData.objectDefiningRings = false;
    this.scene.add(this.circuitRoot);

    this.packetRoot = new THREE.Group();
    this.packetRoot.name = "surface_wake_current_carried_matter_packet";
    this.packetRoot.visible = false;
    this.packetRoot.userData.targetingSuppressed = true;
    this.circuitRoot.add(this.packetRoot);

    this.packetCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.23, 1),
      new THREE.MeshStandardMaterial({
        color: 0x9ff2bd,
        emissive: 0x4fbf83,
        emissiveIntensity: 0.42,
        roughness: 0.62,
        metalness: 0.02,
        transparent: true,
        opacity: 0.94
      })
    );
    this.packetCore.name = "living_circuit_matter_body";
    this.packetRoot.add(this.packetCore);

    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 2;
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 12, 9),
        this.packetCore.material.clone()
      );
      lobe.name = `living_circuit_clean_lobe_${index + 1}`;
      lobe.position.set(Math.cos(angle) * 0.19, Math.sin(angle) * 0.13, (index % 2 ? -1 : 1) * 0.08);
      lobe.scale.set(1.15, 0.72, 0.88);
      this.packetRoot.add(lobe);
      this.packetShells.push({ mesh: lobe, type: "clean" });
    }

    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
      const spine = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, 0.34, 5),
        new THREE.MeshStandardMaterial({
          color: 0xff806f,
          emissive: 0xd43e48,
          emissiveIntensity: 0.48,
          roughness: 0.74
        })
      );
      spine.name = `living_circuit_scar_spine_${index + 1}`;
      spine.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.2, 0);
      spine.rotation.z = -angle + Math.PI / 2;
      this.packetRoot.add(spine);
      this.packetShells.push({ mesh: spine, type: "scar" });
    }

    for (let index = 0; index < 2; index += 1) {
      const plate = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({
          color: 0xe8b46d,
          emissive: 0xb6783e,
          emissiveIntensity: 0.36,
          roughness: 0.68
        })
      );
      plate.name = `living_circuit_mixed_plate_${index + 1}`;
      plate.position.set(index === 0 ? -0.17 : 0.17, index === 0 ? 0.08 : -0.08, 0.05);
      plate.rotation.set(index * 0.8, index * 1.2, index * 0.5);
      this.packetRoot.add(plate);
      this.packetShells.push({ mesh: plate, type: "mixed" });
    }

    for (let index = 0; index < 6; index += 1) {
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 - index * 0.004, 8, 6),
        new THREE.MeshBasicMaterial({
          color: 0x9ff2bd,
          transparent: true,
          opacity: 0.34 - index * 0.04,
          depthWrite: false
        })
      );
      mote.name = `living_circuit_packet_wake_${index + 1}`;
      mote.position.set(0, Math.sin(index * 1.6) * 0.05, 0.25 + index * 0.14);
      this.packetRoot.add(mote);
      this.packetTrail.push(mote);
    }
  }

  updateLivingCircuit(dt, frameState, t) {
    if (!this.packetActive) {
      this.circuitRestSeconds = Math.max(0, this.circuitRestSeconds - dt);
      if (this.circuitRestSeconds <= 0) this.beginCircuitCycle();
      frameState.nurseryCircuit = this.createCircuitState(true);
      this.applyCircuitMeaning(frameState);
      return;
    }

    const cycle = this.circuitRecipe.cycle ?? {};
    this.packetProgress = Math.min(1, this.packetProgress + dt / Math.max(1, cycle.travelSeconds ?? 8.6));
    this.packetPath.getPointAt(this.packetProgress, this.packetPosition);
    this.packetPath.getTangentAt(Math.min(0.999, this.packetProgress), this.packetTangent);
    this.packetRoot.position.copy(this.packetPosition);
    this.packetRoot.lookAt(this.packetPosition.clone().add(this.packetTangent));
    this.packetRoot.rotation.z += dt * 0.34;
    this.packetDistance = this.playerRoot.position.distanceTo(this.packetPosition);

    const pulseEventId = frameState.input?.pulseEventId ?? 0;
    if (
      frameState.input?.pulsePressed
      && pulseEventId > 0
      && pulseEventId !== this.lastCircuitPulseEventId
      && this.packetDistance <= (cycle.packetReadRange ?? 3.4)
    ) {
      this.lastCircuitPulseEventId = pulseEventId;
      const previouslySeen = this.familySeenTypes.has(this.packetMatterType);
      this.packetIdentified = true;
      this.packetPulseRead = true;
      this.packetPlayerIntervened = true;
      this.familySeenTypes.add(this.packetMatterType);
      if (previouslySeen) this.familyRecognitionCount += 1;
      this.familyLastLesson = this.packetMatterType === "clean_nutrient_cluster"
        ? "compatible_matter_can_pass_or_be_absorbed"
        : this.packetMatterType === "scar_touched_cluster"
          ? "contaminated_matter_requires_filtering_before_commitment"
          : "mixed_matter_reuses_known_read_and_stabilize_grammar";
      this.packetRoot.userData.lastReadBy = "Pulse";
      this.packetRoot.userData.interactionFamilyStage = this.familyStage;
      this.packetRoot.userData.familyPreviouslySeen = previouslySeen;
      this.combinationStage = this.packetPurity < (this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68)
        ? "read_contamination_in_flow" : "read_compatible_matter_in_flow";
      this.combinationChain = ["Pulse:read_matter_in_current"];
      this.packetRoot.userData.causalRead = this.packetPurity < 0.68
        ? "current_is_carrying_contamination" : "current_is_carrying_compatible_matter";
    }

    const [filterStart = 0.28, filterEnd = 0.76] = cycle.filterWindow ?? [];
    const inFilterWindow = this.packetProgress >= filterStart && this.packetProgress <= filterEnd;
    const stabilizingPacket = Boolean(
      frameState.input?.stabilizeHeld
      && this.packetIdentified
      && inFilterWindow
      && this.packetDistance <= (cycle.stabilizeRange ?? 1.75)
    );
    if (stabilizingPacket) {
      this.packetPlayerIntervened = true;
      this.packetStabilizeSeconds += dt;
      this.packetPurity = Math.min(
        1,
        this.packetPurity + dt * (cycle.stabilizePurificationPerSecond ?? 0.56)
      );
      this.packetFiltered = this.packetPurity >= (this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68);
      this.combinationStage = this.packetFiltered
        ? "flow_and_matter_brought_into_safe_relationship" : "changing_matter_while_carried";
      if (!this.combinationChain.includes("Stabilize:change_carried_matter_state")) {
        this.combinationChain.push("Stabilize:change_carried_matter_state");
      }
      this.packetRoot.userData.causalTransformation = this.packetFiltered
        ? "contamination_reduced_while_matter_remained_in_flow" : "purification_in_progress";
    }

    const absorbReady = this.packetIdentified
      && this.packetDistance <= (cycle.packetInteractRange ?? 1.2);
    if (absorbReady && frameState.input?.absorbHeld) {
      this.packetPlayerIntervened = true;
      this.combinationStage = this.packetFiltered || this.packetPurity >= (this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68)
        ? "commit_compatible_matter" : "commit_unresolved_contamination";
      this.combinationChain.push("Absorb:commit_current_matter_state");
      this.resolveCircuitPacket(frameState, "absorbed_by_core");
    } else if (this.packetProgress >= 1) {
      this.resolveCircuitPacket(frameState, "delivered_to_tender");
    }

    this.animateCircuitPacket(t, stabilizingPacket);
    frameState.nurseryCircuit = this.createCircuitState(true, {
      inFilterWindow,
      stabilizingPacket,
      absorbReady
    });
    this.applyCircuitMeaning(frameState);
  }

  beginCircuitCycle() {
    const sequence = this.circuitRecipe.cycle?.matterSequence ?? ["clean_nutrient_cluster"];
    this.packetMatterType = sequence[this.circuitSequence % sequence.length] ?? sequence[0];
    this.circuitSequence += 1;
    this.familyStage = this.packetMatterType === "clean_nutrient_cluster"
      ? (this.resolvedCycleCount === 0 ? "teach" : "repeat")
      : this.packetMatterType === "scar_touched_cluster" ? "recognize" : "vary";
    this.packetProgress = 0;
    this.packetIdentified = false;
    this.packetFiltered = false;
    this.packetPulseRead = false;
    this.packetPlayerIntervened = false;
    this.packetStabilizeSeconds = 0;
    this.packetOutcome = "matter_entering_current";
    this.combinationStage = "observe_relationship";
    this.combinationChain = [];
    this.packetPurity = this.circuitRecipe.matter?.[this.packetMatterType]?.basePurity ?? 0.5;
    this.packetActive = true;
    this.packetDistance = Infinity;
    this.packetRoot.visible = true;
    this.packetPath.getPointAt(0, this.packetPosition);
    this.packetPath.getTangentAt(0, this.packetTangent);
    this.packetRoot.position.copy(this.packetPosition);
    this.packetRoot.lookAt(this.packetPosition.clone().add(this.packetTangent));
    this.setPacketSilhouette(this.packetMatterType);
  }

  resolveCircuitPacket(frameState, resolution) {
    if (!this.packetActive) return;
    const outcomes = this.circuitRecipe.outcomes ?? {};
    const cleanThreshold = outcomes.cleanDeliveryThreshold ?? 0.68;
    const clean = this.packetPurity >= cleanThreshold;
    const filtered = this.packetFiltered && clean;
    const playerAuthored = Boolean(this.packetPlayerIntervened && this.packetPulseRead);

    if (resolution === "absorbed_by_core") {
      if (clean) {
        this.packetOutcome = filtered ? "core_absorbed_filtered_nourishment" : "core_absorbed_clean_nourishment";
        this.coreNourishedCount += 1;
        this.successfulCycleCount += 1;
        this.playerAuthoredSuccessfulCycleCount += 1;
        // Nourishing the Core is valid, but the nursery registers what was
        // removed from circulation. Repetition can create a recoverable wilt.
        this.tenderTrust = Math.max(0, this.tenderTrust - (outcomes.coreAbsorbTrustCost ?? 0.02));
        this.tenderIntegrity = Math.max(0, this.tenderIntegrity - (outcomes.coreAbsorbIntegrityCost ?? 0.06));
      } else {
        this.packetOutcome = "core_absorbed_scar_contamination";
        this.failedCycleCount += 1;
        this.playerAuthoredFailedCycleCount += 1;
        this.tenderTrust = Math.max(0, this.tenderTrust - 0.06);
        this.scarLoad = Math.min(1, this.scarLoad + (outcomes.unsafeCoreAbsorbScarLoadGain ?? 0.08));
        frameState.playerComposition.scar = Math.min(
          1,
          (frameState.playerComposition.scar ?? 0) + (outcomes.coreScarGainOnUnsafeAbsorb ?? 0.025)
        );
      }
    } else if (clean && playerAuthored) {
      this.packetOutcome = filtered ? "tender_fed_filtered_matter" : "tender_fed_clean_matter";
      this.tenderFedCount += 1;
      this.successfulCycleCount += 1;
      this.playerAuthoredSuccessfulCycleCount += 1;
      this.tenderTrust = Math.min(1, this.tenderTrust + (outcomes.tenderTrustGain ?? 0.12));
      this.tenderIntegrity = Math.min(1, this.tenderIntegrity + (outcomes.tenderIntegrityGain ?? 0.08));
      this.scarLoad = Math.max(0, this.scarLoad - (outcomes.scarLoadRecovery ?? 0.07));
    } else if (clean) {
      this.packetOutcome = "tender_passively_received_clean_matter";
      this.passiveCycleCount += 1;
      this.tenderIntegrity = Math.min(1, this.tenderIntegrity + (outcomes.passiveIntegrityMaintenance ?? 0.015));
      this.scarLoad = Math.max(0, this.scarLoad - (outcomes.passiveScarRecovery ?? 0.01));
    } else if (playerAuthored) {
      this.packetOutcome = "tender_strained_scar_spread";
      this.failedCycleCount += 1;
      this.playerAuthoredFailedCycleCount += 1;
      this.tenderIntegrity = Math.max(0, this.tenderIntegrity - (outcomes.tenderIntegrityLoss ?? 0.14));
      this.tenderTrust = Math.max(0, this.tenderTrust - 0.04);
      this.scarLoad = Math.min(1, this.scarLoad + (outcomes.scarLoadGain ?? 0.13));
    } else {
      this.packetOutcome = "tender_strained_by_unread_contamination";
      this.passiveCycleCount += 1;
      this.passiveFailureCount += 1;
      this.tenderIntegrity = Math.max(0, this.tenderIntegrity - (outcomes.tenderIntegrityLoss ?? 0.14));
      this.scarLoad = Math.min(1, this.scarLoad + (outcomes.scarLoadGain ?? 0.13));
    }

    this.resolvedCycleCount += 1;
    this.familyResolvedTypes.add(this.packetMatterType);
    if (playerAuthored) this.playerAuthoredCycleCount += 1;
    this.lastOutcomeSequence += 1;
    this.lastOutcomeAt = frameState.runtimeSeconds ?? 0;
    this.agencyProven = this.agencyProven || this.playerAuthoredSuccessfulCycleCount >= (
      this.circuitRecipe.foldEmergence?.successfulCycleCount ?? 1
    );

    const safeMaterialResult = Boolean(
      playerAuthored
      && clean
      && (
        resolution === "absorbed_by_core"
        || this.packetOutcome === "tender_fed_filtered_matter"
        || this.packetOutcome === "tender_fed_clean_matter"
      )
    );
    if (safeMaterialResult) {
      this.materialPassageOpen = true;
      this.materialPassageCause = this.packetOutcome;
    }

    // HC019B causal inversion:
    // the layered Listening Fold still owns its own interaction and completion,
    // but its availability now observes a physical material-state result.
    this.foldInvitation = this.materialPassageOpen;
    this.lastCombinationOutcome = this.packetOutcome;
    if (playerAuthored && this.combinationChain.length >= 2) this.combinationResolvedCount += 1;
    this.combinationStage = playerAuthored ? "relationship_resolved" : "relationship_passed_without_authored_chain";
    this.circuitHistory.push({
      sequence: this.lastOutcomeSequence,
      matterType: this.packetMatterType,
      resolution,
      purity: this.packetPurity,
      outcome: this.packetOutcome,
      playerAuthored,
      pulseRead: this.packetPulseRead,
      stabilizeSeconds: this.packetStabilizeSeconds
    });
    this.circuitHistory = this.circuitHistory.slice(-6);
    this.packetActive = false;
    this.packetRoot.visible = false;
    this.circuitRestSeconds = this.circuitRecipe.cycle?.restSeconds ?? 2.2;
  }

  setPacketSilhouette(matterType) {
    const style = this.circuitRecipe.matter?.[matterType] ?? {};
    const color = new THREE.Color(style.color ?? "#9ff2bd");
    const emissive = new THREE.Color(style.emissive ?? style.color ?? "#4fbf83");
    this.packetCore.material.color.copy(color);
    this.packetCore.material.emissive.copy(emissive);

    const activeType = matterType === "clean_nutrient_cluster"
      ? "clean"
      : matterType === "scar_touched_cluster"
        ? "scar"
        : "mixed";
    for (const shell of this.packetShells) shell.mesh.visible = shell.type === activeType;
    for (const mote of this.packetTrail) mote.material.color.copy(color);
    this.packetRoot.userData.matterType = matterType;
    this.packetRoot.userData.silhouette = style.silhouette ?? activeType;
  }

  animateCircuitPacket(t, stabilizingPacket) {
    if (!this.packetActive) return;

    const cleanThreshold = this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68;
    const purity = THREE.MathUtils.clamp(this.packetPurity, 0, 1);
    const unsafe = purity < cleanThreshold;
    const read = this.packetIdentified;
    const ready = read && purity >= cleanThreshold;

    const purityColor = new THREE.Color(0x73edb1);
    const contaminatedColor = new THREE.Color(0xff685f);
    const unreadColor = new THREE.Color(0xb7a8c8);

    if (!read) {
      this.packetCore.material.color.copy(unreadColor).lerp(contaminatedColor, 0.18);
      this.packetCore.material.emissive.copy(unreadColor);
      this.packetCore.material.emissiveIntensity = 0.18 + Math.max(0, Math.sin(t * 7.3)) * 0.16;
    } else {
      this.packetCore.material.color.copy(contaminatedColor).lerp(purityColor, purity);
      this.packetCore.material.emissive.copy(contaminatedColor).lerp(purityColor, purity);
      this.packetCore.material.emissiveIntensity = ready
        ? 0.82 + Math.sin(t * 4.4) * 0.08
        : 0.54 + (1 - purity) * 0.24;
    }

    const unreadJitter = !read ? Math.sin(t * 11.7) * 0.055 : 0;
    const breathe = 1 + Math.sin(t * (ready ? 3.2 : 4.2)) * (ready ? 0.028 : 0.045);
    const filterCompression = stabilizingPacket ? 0.82 : 1;
    const coherentScale = ready ? 0.96 : 1;
    this.packetCore.scale.set(
      (breathe + unreadJitter) * filterCompression * coherentScale,
      (breathe - unreadJitter * 0.45) / filterCompression,
      breathe * coherentScale
    );

    const activeType = this.packetMatterType === "clean_nutrient_cluster"
      ? "clean"
      : this.packetMatterType === "scar_touched_cluster"
        ? "scar"
        : "mixed";

    for (const shell of this.packetShells) {
      const baseVisible = shell.type === activeType;
      shell.mesh.visible = baseVisible;
      if (!baseVisible) continue;

      const isScar = shell.type === "scar";
      const isClean = shell.type === "clean";
      const isMixed = shell.type === "mixed";
      const readGain = read ? 1 : 0.42;
      const purification = THREE.MathUtils.smoothstep(purity, 0.35, cleanThreshold);
      const stabilizeGain = stabilizingPacket ? 1 : 0;

      if (isScar) {
        shell.mesh.scale.setScalar(
          Math.max(0.34, readGain * (1 - purification * 0.56 - stabilizeGain * 0.12))
        );
        shell.mesh.material.emissiveIntensity = read
          ? 0.48 + (1 - purity) * 0.42
          : 0.18;
      } else if (isClean) {
        shell.mesh.scale.setScalar(
          0.62 + readGain * 0.20 + purification * 0.34
        );
        shell.mesh.material.emissiveIntensity = read
          ? 0.34 + purity * 0.42
          : 0.14;
      } else if (isMixed) {
        shell.mesh.scale.setScalar(
          0.54 + readGain * 0.22 - purification * 0.10
        );
        shell.mesh.material.emissiveIntensity = read
          ? 0.30 + Math.abs(cleanThreshold - purity) * 0.26
          : 0.13;
      }

      if (shell.mesh.material.transparent) {
        shell.mesh.material.opacity = 0.34 + readGain * 0.46;
      }
    }

    for (let index = 0; index < this.packetTrail.length; index += 1) {
      const mote = this.packetTrail[index];
      mote.visible = true;
      const coherence = ready ? 0.72 : read ? 0.46 : 0.24;
      mote.material.opacity = coherence * (1 - index / 7);
      mote.material.color.copy(read
        ? contaminatedColor.clone().lerp(purityColor, purity)
        : unreadColor);
      mote.position.y = Math.sin(t * (ready ? 2.4 : 3.1) - index * 0.7)
        * (ready ? 0.025 : 0.055);
      mote.position.x = ready
        ? Math.cos(t * 2.1 - index * 0.5) * 0.018
        : 0;
    }

    this.packetRoot.userData.purity = purity;
    this.packetRoot.userData.identified = read;
    this.packetRoot.userData.filtered = ready;
    this.packetRoot.userData.visualReadState = !read
      ? "ambiguous_unread"
      : unsafe
        ? stabilizingPacket
          ? "hazard_retracting_under_stabilize"
          : "identified_unsafe"
        : "coherent_safe";
  }

  applyCircuitMeaning(frameState) {
    this.updateLivingState(frameState);
    const tender = this.scene.getObjectByName("nursery_membrane_tender_001");
    const watcher = this.scene.getObjectByName("membrane_watcher_001");
    const scar = this.findObject(this.recipe.risk?.scarPlateId)?.root;
    if (tender) {
      tender.userData.nurseryCircuitTrust = this.tenderTrust;
      tender.userData.nurseryCircuitIntegrity = this.tenderIntegrity;
      tender.userData.nurseryCircuitOutcome = this.packetOutcome;
      tender.userData.livingState = this.livingState;
    }
    if (watcher) {
      watcher.userData.nurseryCircuitRead = this.packetIdentified
        ? (this.circuitRecipe.matter?.[this.packetMatterType]?.watcherRead ?? "matter_read")
        : "matter_unread";
      watcher.userData.nurseryCircuitAlert = this.packetActive && this.packetPurity < 0.4
        ? "contamination_tracking"
        : this.foldInvitation
          ? "turning_toward_listening_fold"
          : "current_tracking";
    }
    if (scar) {
      scar.userData.nurseryCircuitLoad = this.scarLoad;
      scar.userData.nurseryCircuitOutcome = this.packetOutcome;
    }
    frameState.nurseryCircuit = {
      ...frameState.nurseryCircuit,
      foodState: this.tenderFedCount > 0 ? "tender_has_received_food" : "food_in_circulation",
      fearState: this.tenderTrust >= 0.56 ? "trusting" : this.tenderIntegrity < 0.5 ? "guarded_after_strain" : "cautious",
      functionState: this.tenderIntegrity >= 0.62 ? "filtering_and_protecting" : "filter_strained",
      failureState: this.failedCycleCount + this.passiveFailureCount > 0
        ? "contamination_consequence_visible_and_recoverable"
        : "none",
      entityChangedByPlayer: this.playerAuthoredCycleCount > 0,
      regionChangedByPlayer: this.playerAuthoredCycleCount > 0,
      foldInvitation: this.foldInvitation,
      livingState: this.livingState,
      livingStateSequence: this.livingStateSequence,
      livingStateAge: Math.max(0, (frameState.runtimeSeconds ?? 0) - this.livingStateChangedAt),
      livingQualities: this.createLivingQualities()
    };
  }

  updateLivingState(frameState) {
    const nextState = this.resolveLivingState(frameState);
    if (nextState === this.livingState) return;
    this.previousLivingState = this.livingState;
    this.livingState = nextState;
    this.livingStateChangedAt = frameState.runtimeSeconds ?? 0;
    this.livingStateSequence += 1;
  }

  resolveLivingState(frameState) {
    const rules = this.circuitRecipe?.livingStates ?? {};
    const now = frameState.runtimeSeconds ?? 0;
    const outcomeAge = Math.max(0, now - this.lastOutcomeAt);
    const failedOutcome = this.lastCombinationOutcome === "core_absorbed_scar_contamination"
      || this.lastCombinationOutcome === "tender_strained_scar_spread"
      || this.lastCombinationOutcome === "tender_strained_by_unread_contamination";
    const panicForcedByContact = this.currentAgitation > 0 && this.scarHardness >= 0.24;

    if ((failedOutcome && outcomeAge <= (rules.panicSeconds ?? 4.8)) || panicForcedByContact) {
      return "panic";
    }
    if (
      this.tenderIntegrity <= (rules.witherIntegrityMax ?? 0.52)
      || this.scarLoad >= (rules.witherScarLoadMin ?? 0.58)
    ) {
      return "withered";
    }
    if (
      this.tenderFedCount >= (rules.growthFedCycles ?? 2)
      && this.tenderTrust >= (rules.growthTrustMin ?? 0.5)
      && this.tenderIntegrity >= (rules.growthIntegrityMin ?? 0.76)
    ) {
      return "growth";
    }
    if (
      this.lastCombinationOutcome.startsWith("tender_fed")
      && outcomeAge <= (rules.bloomSeconds ?? 3.4)
    ) {
      return "blooming";
    }
    if (
      this.tenderFedCount >= 1
      && this.materialPassageOpen
      && this.tenderTrust >= (rules.embraceTrustMin ?? 0.42)
      && this.tenderIntegrity >= (rules.embraceIntegrityMin ?? 0.65)
      && this.scarLoad <= (rules.embraceScarLoadMax ?? 0.38)
    ) {
      return "embrace";
    }
    return "cautious";
  }

  createLivingQualities() {
    return {
      vitality: this.tenderIntegrity,
      trust: this.tenderTrust,
      stress: THREE.MathUtils.clamp(
        this.scarLoad * 0.72 + (this.currentAgitation > 0 ? 0.2 : 0) + this.scarHardness * 0.18,
        0,
        1
      ),
      growthMemory: THREE.MathUtils.clamp(this.tenderFedCount / 2, 0, 1)
    };
  }

  createCircuitState(active, extra = {}) {
    const matter = this.circuitRecipe?.matter?.[this.packetMatterType] ?? {};
    const waitState = this.resolvedCycleCount === 0 ? "waiting_for_first_matter" : "between_cycles";
    const status = this.packetActive
      ? this.packetIdentified
        ? "matter_identified_choose_intervention"
        : "matter_traveling_unread"
      : waitState;
    return {
      pass: "HC-023B",
      id: CIRCUIT_RECIPE_ID,
      active: Boolean(active),
      owner: "SurfaceWakeGameplaySystem",
      status: active ? status : "inactive",
      sequence: this.circuitSequence,
      packetActive: Boolean(active && this.packetActive),
      packetProgress: active && this.packetActive ? this.packetProgress : 0,
      packetDistance: active && this.packetActive && Number.isFinite(this.packetDistance) ? this.packetDistance : 0,
      matterType: active && this.packetActive ? this.packetMatterType : "none",
      matterSilhouette: active && this.packetActive ? (matter.silhouette ?? "unknown") : "none",
      watcherRead: active && this.packetIdentified ? (matter.watcherRead ?? "matter_read") : "unread",
      packetIdentified: Boolean(active && this.packetIdentified),
      packetPurity: active && this.packetActive ? this.packetPurity : 0,
      packetFiltered: Boolean(active && this.packetFiltered),
      visualReadState: active && this.packetActive
        ? !this.packetIdentified
          ? "ambiguous_unread"
          : this.packetPurity < (this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68)
            ? extra.stabilizingPacket
              ? "hazard_retracting_under_stabilize"
              : "identified_unsafe"
            : "coherent_safe"
        : "none",
      visualLanguage: {
        unread: "irregular muted silhouette",
        identifiedUnsafe: "high-contrast hazard protrusions",
        stabilizing: "hazard retracts and packet coheres",
        safe: "steady green coherent body and calm wake"
      },
      packetPulseRead: Boolean(active && this.packetPulseRead),
      packetPlayerIntervened: Boolean(active && this.packetPlayerIntervened),
      packetStabilizeSeconds: active ? this.packetStabilizeSeconds : 0,
      inFilterWindow: Boolean(active && extra.inFilterWindow),
      stabilizingPacket: Boolean(active && extra.stabilizingPacket),
      absorbReady: Boolean(active && extra.absorbReady),
      resolvedCycleCount: this.resolvedCycleCount,
      successfulCycleCount: this.successfulCycleCount,
      failedCycleCount: this.failedCycleCount,
      playerAuthoredCycleCount: this.playerAuthoredCycleCount,
      playerAuthoredSuccessfulCycleCount: this.playerAuthoredSuccessfulCycleCount,
      playerAuthoredFailedCycleCount: this.playerAuthoredFailedCycleCount,
      passiveCycleCount: this.passiveCycleCount,
      passiveFailureCount: this.passiveFailureCount,
      agencyProven: this.agencyProven,
      agencyRequiredForFold: true,
      agencyProgress: this.agencyProven
        ? 1
        : active && this.packetActive
          ? this.packetFiltered
            ? 0.9
            : this.packetIdentified
              ? 0.58
              : 0.24
          : this.playerAuthoredCycleCount > 0
            ? 0.42
            : 0.08,
      tenderFedCount: this.tenderFedCount,
      coreNourishedCount: this.coreNourishedCount,
      tenderTrust: this.tenderTrust,
      tenderIntegrity: this.tenderIntegrity,
      scarLoad: this.scarLoad,
      livingState: this.livingState,
      previousLivingState: this.previousLivingState,
      livingStateSequence: this.livingStateSequence,
      livingStateAge: Math.max(0, (this.frameState.runtimeSeconds ?? 0) - this.livingStateChangedAt),
      livingQualities: this.createLivingQualities(),
      livingStateVisualLanguage: {
        cautious: "held asymmetry and quiet watchfulness",
        blooming: "brief petal opening and coherent green-gold lift",
        withered: "contracted silhouette, lowered translucency, sparse drift",
        panic: "clamped vertical silhouette, ember warning, scattered current",
        embrace: "wide sheltering canopy and calm inward circulation",
        growth: "persistent larger canopy and longer filter fronds"
      },
      lastOutcome: this.packetOutcome,
      lastOutcomeSequence: this.lastOutcomeSequence,
      foldInvitation: this.foldInvitation,
      materialPassage: {
        pass: "HC-019C",
        state: this.materialPassageOpen ? "open" : "closed",
        strength: this.materialPassageStrength,
        cause: this.materialPassageCause,
        causalChain: [
          "read_matter_with_pulse",
          "change_matter_with_stabilize_or_safe_absorb",
          "produce_safe_material_result",
          "surface_membrane_passage_opens",
          "listening_fold_observes_open_passage"
        ],
        objectiveAuthority: false,
        crossingAuthority: false
      },
      foldRequirementsChanged: true,
      foldRequirementOwner: "SurfaceWakeGameplaySystem materialPassageOpen",
      directTriggerCompletion: false,
      directSeedAbsorption: false,
      directMorphActivation: false,
      objectDefiningRings: false,
      persistentConsequence: this.resolvedCycleCount > 0,
      recoverable: true,
      history: [...this.circuitHistory],
      nextAction: this.circuitNextAction(active, status)
    };
  }

  circuitNextAction(active, status) {
    if (!active) return "Return to Surface Wake.";
    if (status === "waiting_for_first_matter" || status === "between_cycles") {
      return this.foldInvitation
        ? "The Watcher has turned toward the Listening Fold."
        : this.passiveCycleCount > 0
          ? "The nursery continues without you. Pulse the next packet to make a deliberate reading."
          : "Watch the current mouth; matter is entering the nursery.";
    }
    if (status === "matter_traveling_unread") return "Pulse the moving matter so the Watcher can identify it.";
    if (!this.packetPulseRead) return "Pulse first. Stabilize can filter only matter the Watcher has identified.";
    if (this.packetPurity < (this.circuitRecipe.outcomes?.cleanDeliveryThreshold ?? 0.68)) {
      return "Stabilize beside the packet while it crosses the Tender's filter.";
    }
    return "Let clean matter feed the Tender, or Absorb it into the Core.";
  }

  handlePulseReads(frameState, currentObject, scarObject) {
    const eventId = frameState.input?.pulseEventId ?? 0;
    if (!frameState.input?.pulsePressed || eventId <= 0 || eventId === this.lastPulseEventId) return;
    this.lastPulseEventId = eventId;

    const range = this.recipe.worldRead?.pulseReadRange ?? 3.3;
    const candidates = [
      this.findObject(this.recipe.worldRead?.signalThreadId),
      currentObject,
      scarObject
    ].filter(Boolean);

    for (const item of candidates) {
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (distance > range) continue;
      this.readObjects.add(item.recipe.id);
      item.root.userData.surfaceWakeGameplayRead = true;

      if (item.recipe.id === this.recipe.worldRead?.currentRibbonId) {
        this.currentAgitation = Math.max(this.currentAgitation, this.recipe.flow?.pulseAgitationSeconds ?? 2.2);
      }
    }
  }

  updateAbsorbedMotes() {
    for (const id of this.recipe.nutrientMotes ?? []) {
      const item = this.findObject(id);
      if ((item?.absorbed || item?.root?.userData?.absorbed) && !this.absorbedMotes.has(id)) {
        this.absorbedMotes.add(id);
        const identity = this.moteRoles.get(id) ?? {};
        this.lastAbsorbedMoteRole = identity.role ?? "compatible_matter";
        this.lastAbsorbedMoteResponse = identity.worldResponse ?? "nursery_noted_nourishment";
      }
    }
  }

  tagGameplayMotes() {
    for (const id of this.recipe.nutrientMotes ?? []) {
      const item = this.findObject(id);
      if (!item) continue;
      item.root.userData.surfaceWakeGameplayMote = true;
      const identity = this.moteRoles.get(id) ?? {};
      item.root.userData.ecologicalRole = identity.role ?? "compatible_matter";
      item.root.userData.teaches = identity.teaches ?? "compatible matter can be absorbed";
      item.root.userData.targetingSuppressed = false;
    }
  }

  findObject(id) {
    if (!id) return null;
    return this.chemObjectSystem.objects.find((item) => item.recipe.id === id) ?? null;
  }

  createPressureFronts() {
    const material = new THREE.MeshBasicMaterial({
      color: 0x8fd7e8,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let index = 0; index < 3; index += 1) {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(1.15 + index * 0.28, 0.018, 8, 72), material.clone());
      mesh.name = `surface_wake_pressure_front_${index + 1}`;
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(0.0, -0.82 + index * 0.08, 1.36);
      mesh.userData.targetingSuppressed = true;
      mesh.renderOrder = 4;
      this.scene.add(mesh);
      this.pressureFronts.push(mesh);
    }
  }

  animatePressureFronts(t, intensity, stabilizing) {
    for (let index = 0; index < this.pressureFronts.length; index += 1) {
      const front = this.pressureFronts[index];
      const currentReadable = index === 0 && intensity >= 0.42;
      front.visible = currentReadable;
      if (!currentReadable) {
        front.material.opacity = 0;
        continue;
      }
      const phase = (t * 0.28 + index / this.pressureFronts.length) % 1;
      const scale = 0.65 + phase * 2.5;
      const opened = this.materialPassageStrength;
      front.scale.setScalar(scale);
      front.position.x = 2.25 - phase * 5.2
        + (index - 1) * opened * 0.34;
      front.position.y = -0.82 + index * 0.08
        + (index - 1) * opened * 0.20;
      front.position.z = 1.36 - phase * 1.9
        - opened * 0.24;
      front.scale.set(
        scale * (1.5 + opened * 0.18),
        scale * (0.42 - opened * 0.10),
        scale * (0.78 + opened * 0.10)
      );
      front.material.opacity = (0.012 + intensity * 0.075)
        * (stabilizing ? 0.48 : 1)
        * (1 - phase * 0.82)
        * (1 - opened * 0.34);
      front.userData.materialPassageState = opened > 0.75
        ? "parted_for_listening_fold"
        : opened > 0.08
          ? "opening_from_safe_matter_state"
          : "pressurized_closed";
    }
  }

  setPressureFrontsVisible(visible) {
    for (const front of this.pressureFronts) front.visible = Boolean(visible);
  }

  resolveCyclePhase(unit) {
    if (unit < 0.18) return "membrane_inhale";
    if (unit < 0.48) return "pressure_build";
    if (unit < 0.68) return "matter_carry";
    return "calm_window";
  }

  applyScarHardness(scarObject, t) {
    if (!scarObject || scarObject.absorbed || scarObject.root.userData.absorbed) return;
    const base = scarObject.recipe.spawn?.scale ?? 1;
    const pulse = Math.sin(t * 2.2) * 0.018;
    scarObject.root.scale.setScalar(base * (1 + this.scarHardness * 0.16 + pulse));
    scarObject.root.userData.scarHardness = this.scarHardness;
    scarObject.root.userData.recoveryAvailable = this.scarHardness > 0;
    scarObject.root.userData.woundResponse = this.scarHardness > 0.55
      ? "thickened_from_forced_absorb"
      : this.scarHardness > 0.08
        ? "softening_after_contact"
        : "scar_boundary_at_rest";
  }

  createState(active, rawIntensity, stabilizing, unsafeNearScar, extra = {}) {
    const absorbedCount = this.absorbedMotes.size;
    const readCount = this.readObjects.size;
    return {
      pass: "HC-021D",
      id: RECIPE_ID,
      active: Boolean(active),
      status: active ? "systemic_surface_wake_play" : "inactive",
      systemicPlay: Boolean(active),
      triggerPreserved: true,
      directTriggerCompletion: false,
      pressureIntensity: active ? rawIntensity : 0,
      effectivePressure: active ? (extra.pressure ?? 0) : 0,
      stabilizing: Boolean(active && stabilizing),
      stabilizeSeconds: active ? this.stabilizeSeconds : 0,
      unsafeNearScar: Boolean(active && unsafeNearScar),
      scarExposureSeconds: active ? this.scarExposure : 0,
      worldReads: active ? [...this.readObjects] : [],
      worldReadCount: active ? readCount : 0,
      absorbedMotes: active ? [...this.absorbedMotes] : [],
      absorbedMoteCount: active ? absorbedCount : 0,
      absorbedMoteRoles: active ? [...this.absorbedMotes].map((id) => this.moteRoles.get(id)?.role ?? "compatible_matter") : [],
      lastAbsorbedMoteRole: active ? this.lastAbsorbedMoteRole : "none",
      lastAbsorbedMoteResponse: active ? this.lastAbsorbedMoteResponse : "none",
      availableMoteCount: this.recipe?.nutrientMotes?.length ?? 0,
      currentAgitated: Boolean(active && this.currentAgitation > 0),
      cyclePhase: active ? (extra.cyclePhase ?? "breathing_cycle") : "inactive",
      calmWindow: Boolean(active && extra.calmWindow),
      scarHardness: active ? this.scarHardness : 0,
      nearCurrentDistance: active ? (extra.nearCurrentDistance ?? 0) : 0,
      nearScarDistance: active ? (extra.nearScarDistance ?? 0) : 0,
      choiceState: active ? (extra.choiceState ?? "risk_reward_open") : "inactive",
      livingCircuitId: this.circuitRecipe?.id ?? "unloaded",
      livingCircuitStatus: active ? (extra.nurseryCircuit?.status ?? "waiting_for_cycle") : "inactive",
      livingCircuitResolvedCycles: active ? (extra.nurseryCircuit?.resolvedCycleCount ?? this.resolvedCycleCount) : 0,
      livingCircuitPersistentConsequence: Boolean(active && extra.nurseryCircuit?.persistentConsequence),
      materialPassageOpen: Boolean(active && this.materialPassageOpen),
      materialPassageStrength: active ? this.materialPassageStrength : 0,
      materialPassageCause: active ? this.materialPassageCause : "none",
      hostContinuationInvitation: {
        pass: "HC-031O",
        open: Boolean(active && this.hostContinuationInvitationOpen),
        cause: active ? this.hostContinuationCause : "none",
        openedAt: active ? this.hostContinuationOpenedAt : -1,
        surfaceRelationshipProven: Boolean(active && this.hostContinuationSurfaceRelationshipProven),
        surfaceRelationshipHoldSeconds: active ? Number(this.hostContinuationSurfaceHoldSeconds.toFixed(3)) : 0,
        communityMemoryProven: Boolean(active && this.hostContinuationCommunityMemoryProven),
        hostMatterAnswerProven: Boolean(active && this.hostContinuationMatterAnswerProven),
        relationshipProof: Boolean(active && this.hostContinuationRelationshipProven),
        chemistryPassageOpen: Boolean(active && this.materialPassageOpen),
        revealOwner: "SurfaceWakeGameplaySystem",
        crossingOwner: "LocalCellMorphSystem",
        revealAuthority: true,
        crossingAuthority: false,
        noGate: true,
        oldMatterPathPreserved: true,
        safeSeedRemainsOptionalNourishment: true,
        nextAction: this.hostContinuationInvitationOpen
          ? "Follow the Listening Fold; its scar/signal pressure continues deeper into the Host."
          : "Establish a coherent surface relationship and watch what the community and Host matter retain."
      },
      causalProgressionMode: active ? "world_state_before_objective" : "inactive",
      mechanicalCombination: {
        pass: "HC-021D",
        id: "surface_carried_matter_combination",
        stage: active ? this.combinationStage : "inactive",
        chain: active ? [...this.combinationChain] : [],
        resolvedChains: this.combinationResolvedCount,
        lastOutcome: this.lastCombinationOutcome,
        relationship: "current carries matter; Pulse reads; Stabilize changes carried state; Absorb commits resulting state",
        requiredNewVerb: false,
        objectiveAuthority: false,
        gateAuthority: false
      },
      interactionFamily: {
        pass: "HC-021A",
        familyId: "surface_nursery_matter_family",
        stage: active ? this.familyStage : "inactive",
        seenMatterTypes: [...this.familySeenTypes],
        resolvedMatterTypes: [...this.familyResolvedTypes],
        recognitionCount: this.familyRecognitionCount,
        lastLesson: this.familyLastLesson,
        grammar: ["read", "change_state", "commit_or_release"],
        primaryVerbs: ["Pulse", "Stabilize", "Absorb"],
        addsNewVerb: false,
        objectiveAuthority: false
      },
      playerFacingLoop: "teach with clean matter → repeat the read/change/commit rhythm → recognize contamination → vary with mixed matter",
      guideLine: this.recipe?.playerFacing?.guideLine ?? "The nursery is alive around you.",
      objectiveLine: active
        ? "Read the matter moving through the current and choose how the nursery receives it."
        : this.recipe?.playerFacing?.objectiveLine ?? "Explore the living pocket.",
      nextAction: active
        ? (extra.nurseryCircuit?.nextAction ?? "Watch the current mouth.")
        : this.recipe?.playerFacing?.nextAction ?? "Follow what reacts.",
      safeSeedStillOwnedByExistingTrigger: true
    };
  }
}
