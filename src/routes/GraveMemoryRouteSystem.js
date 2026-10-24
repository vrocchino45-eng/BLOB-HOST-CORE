import * as THREE from "three";
import { GraveVascularEffectMemory } from "./GraveVascularEffectMemory.js";
import { graveRecoveryCoupling } from "./GraveRecoveryCoupling.js";

const ROUTE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const PREVIEW_RECIPE_ID = "GRAVE_MEMORY_ROUTE_PREVIEW_HC010A";
const CIRCUIT_RECIPE_ID = "GRAVE_MEMORY_SAFE_TRANSFER_CIRCUIT_HC010B";
const PROTECTED_IDS = new Set([
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
]);

/**
 * HC-010B keeps the HC-010A first-route ownership boundary while turning its
 * four reads into one recoverable Substance -> State -> Verb -> Reaction ->
 * Risk -> Recovery -> Meaning circuit.
 *
 * Historical Grave systems remain archived. This system reuses their authored
 * chemistry objects but owns one compact read-before-absorb preview, one
 * physical return fold, and all route presentation inside the new region mount.
 * ObjectiveSystem and LocalCellBoundaryMorphSystem remain the only objective/crossing owners.
 */
export class GraveMemoryRouteSystem {
  constructor({
    recipeDataSystem,
    chemObjectSystem,
    scene,
    playerRoot,
    frameState,
    hostConnectionReceiptLedger = null
  }) {
    if (!recipeDataSystem) throw new Error("[GraveMemoryRouteSystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[GraveMemoryRouteSystem] chemObjectSystem is required.");
    if (!scene) throw new Error("[GraveMemoryRouteSystem] scene is required.");
    if (!playerRoot) throw new Error("[GraveMemoryRouteSystem] playerRoot is required.");
    if (!frameState) throw new Error("[GraveMemoryRouteSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    // C0D1-C: Grave I owns retained Vascular-effect memory; not Grave II.
    this.hostConnectionReceiptLedger = hostConnectionReceiptLedger;
    this.vascularEffectMemory = new GraveVascularEffectMemory();
    this.c0d2AssistedRecoveryTicks = 0;
    this.c0d2AssistedRecoverySeconds = 0;

    this.recipe = null;
    this.cellRecipe = null;
    this.root = null;
    this.memoryBedBody = null;
    this.returnFold = null;
    this.routeMotes = null;
    this.memoryThreadRoot = null;
    this.memoryThreadMotes = [];
    this.consequenceRoot = null;
    this.recoilShards = [];
    this.recoveryStrands = [];
    this.consequenceLight = null;
    this.scarRibs = [];
    this.anatomyCohesionRoot = null;
    this.objectItems = new Map();
    this.objectOffsets = new Map();
    this.baseObjectScales = new Map();
    this.landmarkVisuals = new Map();
    this.landmarkPulseAges = new Map();
    this.materials = [];
    this.entryAnchor = new THREE.Vector3();
    this.returnPosition = new THREE.Vector3();
    this.tempVector = new THREE.Vector3();
    this.threadStart = new THREE.Vector3();
    this.threadEnd = new THREE.Vector3();
    this.threadControl = new THREE.Vector3();
    this.threadPointA = new THREE.Vector3();
    this.threadPointB = new THREE.Vector3();
    this.priorPhysicalFeel = null;

    this.circuitEnabled = false;
    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.readObjects = new Set();
    this.siltRead = false;
    this.siltStabilized = false;
    this.stabilizeProgress = 0;
    this.traceIntegrity = 1;
    this.residueRecoilRisk = 0;
    this.safeTransferProgress = 0;
    this.postTransferSettleProgress = 0;
    this.safeMemoryTransferComplete = false;
    this.graveMemoryImprintCommitted = false;
    this.returnFoldReady = false;
    this.prematureAbsorbCount = 0;
    this.protectedAbsorbAttemptCount = 0;
    this.riskEventCount = 0;
    this.recoverySeconds = 0;
    this.residueRecoilRecovered = false;
    this.lastRiskSource = "none";
    this.completed = false;
    this.memoryThreadRetained = false;
    this.absorbResistedCount = 0;
    this.lastPulseEventId = 0;
    this.lastInteractEventId = 0;
    this.absorbWasHeld = false;
    this.lastInteraction = "none";
    this.warning = "none";
    this.stage = "route_inactive";
    this.consequencePhase = "quiet_read";
    this.recoilVisualStrength = 0;
    this.recoveryVisualStrength = 0;
    this.transferVisualStrength = 0;
    this.retentionVisualStrength = 0;
    this.elapsed = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.graveMemoryRouteCircuit
      ?? this.recipeDataSystem.data.graveMemoryRoutePreview;
    if (
      !this.recipe
      || ![PREVIEW_RECIPE_ID, CIRCUIT_RECIPE_ID].includes(this.recipe.id)
    ) {
      throw new Error(`[GraveMemoryRouteSystem] Missing ${CIRCUIT_RECIPE_ID} or retained ${PREVIEW_RECIPE_ID}.`);
    }
    this.circuitEnabled = this.recipe.id === CIRCUIT_RECIPE_ID;
    this.traceIntegrity = this.recipe?.interaction?.initialTraceIntegrity ?? 1;
    this.cellRecipe = this.recipeDataSystem.get("localCellRecipes", ROUTE_CELL_ID);
    this.createAnatomy();
    this.spawnAuthoredObjects();
    this.setVisible(false);
    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.setVisible(false);
    this.publish(frameState, false);
    return {
      status: "grave_memory_route_prepared_hidden",
      rootCount: 1 + this.objectItems.size,
      activeCellId: frameState.activeCellId
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.entryAnchor.copy(this.playerRoot.position);
    this.priorPhysicalFeel = this.clonePhysicalFeel(frameState.physicalFeel);
    this.rebaseAtEntry();
    this.setVisible(true);
    this.applyPhysicalFeel(frameState);
    this.lastInteraction = this.completed
      ? "returned_to_remembered_route"
      : "entered_grave_memory_without_forced_relocation";
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.setVisible(false);
    if (this.priorPhysicalFeel) {
      frameState.physicalFeel = this.clonePhysicalFeel(this.priorPhysicalFeel);
    }
    this.lastInteraction = frameState.activeCellId === HUB_CELL_ID
      ? "returned_to_hub_through_authored_fold"
      : "grave_memory_route_unmounted";
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    const active = frameState.activeCellId === ROUTE_CELL_ID;
    if (!active) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    // Only mounted Grave I can read the Host relay. No remote-cell ticking.
    this.vascularEffectMemory.receiveFromHost(this.hostConnectionReceiptLedger);
    this.elapsed += dt;
    this.applyPhysicalFeel(frameState);
    this.updateInteractions(dt, frameState);
    this.updateVisualResponse(dt, frameState);
    this.applyHostRhythmVisual(frameState);
    this.publish(frameState, true);
  }



  applyHostRhythmVisual(frameState) {
    const host = frameState.hostRhythm ?? {};
    if (!host.active || !this.memoryBedBody) return;

    const composition = host.composition ?? {};
    const composed = Boolean(
      composition.active
      && composition.profileId === "grave_sap_128_micro"
    );

    if (!composed) {
      // Retained HC022G fallback for non-authored/legacy Host rhythm states.
      const phase = ((host.normalizedPhase ?? 0) - 0.14 + 1) % 1;
      const wave = Math.sin(phase * Math.PI * 2 - Math.PI * 0.5);
      const compression = 1 + wave * 0.045;
      const spread = 1 - wave * 0.018;

      this.memoryBedBody.scale.set(
        0.78 * spread,
        0.18 * compression,
        1.48 * spread
      );
      if (this.memoryBedBody.material) {
        this.memoryBedBody.material.emissiveIntensity = 0.11 + (wave + 1) * 0.035;
        this.memoryBedBody.material.opacity = 0.21 + (wave + 1) * 0.018;
      }

      this.root.userData.hostRhythmInterpretation = {
        pass: "HC-022G",
        region: "grave",
        mode: "delayed_weighted_compression",
        phaseLag: 0.14,
        visible: true,
        gameplayAuthority: false
      };
      return;
    }

    // HC028E: Grave interprets one Host breath as a 12/8 memory phrase. Four
    // triplet groups carry hold -> draw -> return -> settle, while the inner
    // eighths remain faint echoes. Nothing here affects read/transfer success.
    const beatInBar = composition.beatInBar ?? 0;
    const groupIndex = Math.floor(beatInBar / 3);
    const innerBeat = beatInBar % 3;
    const groupStart = innerBeat === 0;
    const accent = THREE.MathUtils.clamp(composition.accentStrength ?? 0, 0, 1);
    const beatPulse = THREE.MathUtils.clamp(composition.beatPulse ?? 0, 0, 1);
    const currentFunction = composition.currentFunction ?? "stabilize";
    const stabilizeAccent = currentFunction === "stabilize" ? accent : 0;
    const absorbAccent = currentFunction === "absorb" ? accent : 0;
    const pulseAccent = currentFunction === "pulse" ? accent : 0;
    const echoStrength = groupStart ? beatPulse : beatPulse * 0.22;
    const resonance = frameState.coreWorldResonance ?? {};
    const worldReply = resonance.active
      ? THREE.MathUtils.clamp(resonance.presentation?.worldReplyStrength ?? 0, 0, 1)
      : 0;

    const spread = 1
      - stabilizeAccent * 0.018
      - absorbAccent * 0.030
      + pulseAccent * 0.038;
    const compression = 1
      + stabilizeAccent * 0.060
      + absorbAccent * 0.025
      - pulseAccent * 0.022;
    this.memoryBedBody.scale.set(
      0.78 * spread,
      0.18 * compression,
      1.48 * spread
    );
    if (this.memoryBedBody.material) {
      this.memoryBedBody.material.emissiveIntensity = 0.14
        + stabilizeAccent * 0.10
        + absorbAccent * 0.07
        + pulseAccent * 0.18
        + echoStrength * 0.025
        + worldReply * 0.14;
      this.memoryBedBody.material.opacity = Math.min(
        0.30,
        0.22 + stabilizeAccent * 0.024 + absorbAccent * 0.018 + pulseAccent * 0.012
      );
    }

    if (this.routeMotes) {
      const driftDirection = currentFunction === "absorb" ? -1 : currentFunction === "pulse" ? 1 : 0.25;
      this.routeMotes.rotation.y += driftDirection * accent * 0.018;
      const moteScale = 1
        - absorbAccent * 0.035
        + pulseAccent * 0.045
        + worldReply * 0.018;
      this.routeMotes.scale.setScalar(moteScale);
      if (this.routeMotes.material) {
        this.routeMotes.material.opacity = Math.min(
          0.48,
          0.30 + stabilizeAccent * 0.025 + absorbAccent * 0.05 + pulseAccent * 0.075 + worldReply * 0.04
        );
      }
    }

    this.scarRibs.forEach((rib, index) => {
      const local = 0.82 + 0.18 * Math.sin(index * 0.87 + groupIndex * 1.2);
      const scale = 1
        + stabilizeAccent * 0.020 * local
        - absorbAccent * 0.014 * local
        + pulseAccent * 0.030 * local;
      rib.scale.multiplyScalar(scale);
      if (rib.material) rib.material.emissiveIntensity += worldReply * 0.11 + echoStrength * 0.025;
    });

    this.root.userData.hostRhythmInterpretation = {
      pass: "HC-028E",
      region: "grave",
      profileId: composition.profileId,
      keyId: composition.keyId,
      meter: composition.meterLabel,
      grouping: composition.groupingLabel,
      tempoBpm: composition.tempoBpm,
      beatNumber: composition.beatNumber,
      compoundGroup: groupIndex + 1,
      innerBeat: innerBeat + 1,
      currentFunction,
      accentRole: composition.accentRole,
      mode: "sap_key_128_compound_memory_phrase",
      accentLaw: "hold_triplet_draw_triplet_return_triplet_settle_triplet",
      resonanceReply: worldReply,
      visible: true,
      gameplayAuthority: false,
      movementAuthority: false,
      inputTimingGate: false
    };
  }

  createAnatomy() {
    this.root = new THREE.Group();
    this.root.name = this.circuitEnabled
      ? "grave_memory_route_authority_HC010B"
      : "grave_memory_route_authority_HC010A";
    this.root.userData.regionId = "grave_memory_route";
    this.root.userData.presentationOwner = "GraveMemoryRouteSystem";
    this.root.userData.transitionPrepared = true;

    const bedMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x17171c,
      emissive: 0x2d1b27,
      emissiveIntensity: 0.11,
      roughness: 0.88,
      metalness: 0.02
    }));
    const bed = new THREE.Mesh(new THREE.SphereGeometry(7.2, 40, 28), bedMaterial);
    bed.name = "grave_memory_residue_bed_body";
    bed.scale.set(0.78, 0.18, 1.48);
    bed.position.set(0, -1.08, -9.0);
    this.memoryBedBody = bed;
    this.root.add(bed);

    const scarMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x412e39,
      emissive: 0x6a3147,
      emissiveIntensity: 0.16,
      roughness: 0.7,
      metalness: 0.08
    }));
    const ribPositions = this.recipe?.anatomy?.ribPositions ?? [];
    ribPositions.forEach((position, index) => {
      const rib = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.12 + index * 0.008, 2.1 + index * 0.18, 8, 14),
        scarMaterial.clone()
      );
      this.trackMaterial(rib.material);
      rib.name = `grave_memory_scar_rib_${index + 1}`;
      rib.position.fromArray(position);
      rib.rotation.set(0.18 + index * 0.09, 0.16 - index * 0.11, 0.72 + index * 0.08);
      rib.scale.set(0.82, 1, 0.7);
      this.root.add(rib);
      this.scarRibs.push(rib);
    });

    const wallMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x20212b,
      emissive: 0x34314d,
      emissiveIntensity: 0.08,
      roughness: 0.92,
      transparent: true,
      opacity: 0.72,
      depthWrite: true
    }));
    const wall = new THREE.Mesh(new THREE.DodecahedronGeometry(2.65, 2), wallMaterial);
    wall.name = "grave_memory_distant_marow_wall";
    wall.position.set(0.35, 0.75, -19.0);
    wall.scale.set(2.2, 1.25, 0.38);
    this.root.add(wall);

    const foldMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x8d6e79,
      emissive: 0xd9a48f,
      emissiveIntensity: 0.18,
      roughness: 0.5,
      transparent: true,
      opacity: 0.14,
      depthWrite: false
    }));
    this.returnFold = new THREE.Group();
    this.returnFold.name = "grave_memory_return_fold_body";
    const returnOffset = this.recipe?.returnFold?.position ?? [0, 0.05, 0.7];
    this.returnFold.position.fromArray(returnOffset);
    for (const side of [-1, 1]) {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 18), foldMaterial.clone());
      this.trackMaterial(lobe.material);
      lobe.name = side < 0 ? "return_fold_left_lobe" : "return_fold_right_lobe";
      lobe.position.x = side * 0.54;
      lobe.scale.set(0.52, 1.5, 0.3);
      this.returnFold.add(lobe);
    }
    this.returnFold.visible = false;
    this.root.add(this.returnFold);

    const points = [];
    for (let i = 0; i < 72; i += 1) {
      const angle = (i / 72) * Math.PI * 2;
      const radius = 1.5 + (i % 7) * 0.14;
      points.push(
        Math.cos(angle) * radius,
        -0.5 + ((i * 17) % 29) / 29 * 2.1,
        -9.0 + Math.sin(angle) * radius * 5.2
      );
    }
    const moteGeometry = new THREE.BufferGeometry();
    moteGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const moteMaterial = this.trackMaterial(new THREE.PointsMaterial({
      color: 0xc6a0a9,
      size: 0.035,
      transparent: true,
      opacity: 0.32,
      depthWrite: false
    }));
    this.routeMotes = new THREE.Points(moteGeometry, moteMaterial);
    this.routeMotes.name = "grave_memory_residue_motes";
    this.root.add(this.routeMotes);

    // HC-016Z: carry the residue bed through the navigable volume so Grave
    // reads as anatomy around the player rather than a prop cluster on a floor.
    this.anatomyCohesionRoot = new THREE.Group();
    this.anatomyCohesionRoot.name = "grave_continuous_memory_strata_HC016Z";
    for (let index = 0; index < 7; index += 1) {
      const layerMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x2a222a : 0x33252d,
        emissive: 0x4a2937,
        emissiveIntensity: 0.07,
        roughness: 0.94,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      const layer = new THREE.Mesh(new THREE.SphereGeometry(1.35 + index * 0.09, 18, 12), layerMaterial);
      layer.name = `grave_memory_stratum_${index + 1}`;
      layer.position.set((index % 2 ? 1 : -1) * (1.5 + (index % 3) * 0.45), -0.18 + (index % 2) * 0.5, -3.2 - index * 2.25);
      layer.scale.set(1.55 + (index % 2) * 0.35, 0.42 + (index % 3) * 0.08, 1.75);
      layer.rotation.set(0.08 * (index % 3), 0.18 * index, 0.1 * (index % 2 ? 1 : -1));
      layer.userData.targetingSuppressed = true;
      this.anatomyCohesionRoot.add(layer);
    }
    this.root.add(this.anatomyCohesionRoot);

    this.createMemoryThread();
    this.createConsequenceVisuals();

    this.scene.add(this.root);
  }

  createMemoryThread() {
    this.memoryThreadRoot = new THREE.Group();
    this.memoryThreadRoot.name = "grave_memory_living_thread_HC010B";
    this.memoryThreadRoot.visible = false;
    this.memoryThreadRoot.userData.regionId = "grave_memory_route";
    this.memoryThreadRoot.userData.presentationOwner = "GraveMemoryRouteSystem";
    this.memoryThreadRoot.userData.targetingSuppressed = true;

    for (let index = 0; index < 13; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 3 === 0 ? 0xd8c2d8 : 0x9f879f,
        emissive: index % 3 === 0 ? 0xe7c8df : 0x6e4c68,
        emissiveIntensity: 0.28,
        roughness: 0.42,
        transparent: true,
        opacity: 0,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.035 + (index % 3) * 0.008, 0),
        material
      );
      mote.name = `grave_memory_thread_pearl_${index + 1}`;
      mote.userData.phase = index / 13;
      mote.userData.targetingSuppressed = true;
      this.memoryThreadRoot.add(mote);
      this.memoryThreadMotes.push(mote);
    }

    this.root.add(this.memoryThreadRoot);
  }

  createConsequenceVisuals() {
    const siltEntry = (this.recipe?.objects ?? []).find(
      (entry) => entry.id === "residue_silt_cloud_001"
    );
    this.consequenceRoot = new THREE.Group();
    this.consequenceRoot.name = "grave_memory_consequence_readability_HC010E";
    this.consequenceRoot.position.fromArray(siltEntry?.position ?? [1.2, 0.35, -3.25]);
    Object.assign(this.consequenceRoot.userData, {
      regionId: "grave_memory_route",
      presentationOwner: "GraveMemoryRouteSystem",
      visualOnly: true,
      targetingSuppressed: true,
      consequenceOrder: [
        "recoil_scatter",
        "stabilization_reweave",
        "safe_trace_transfer",
        "retained_memory_imprint"
      ]
    });

    const recoilColor = this.recipe?.visualConsequence?.recoilColor ?? 0xf07867;
    for (let index = 0; index < 9; index += 1) {
      const angle = (index / 9) * Math.PI * 2 + (index % 2) * 0.24;
      const radius = 0.48 + (index % 3) * 0.13;
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: recoilColor,
        emissive: 0x9a281f,
        emissiveIntensity: 0.28,
        roughness: 0.58,
        transparent: true,
        opacity: 0,
        depthWrite: false
      }));
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.075 + (index % 3) * 0.018, 0),
        material
      );
      shard.name = `grave_residue_recoil_shard_${index + 1}`;
      shard.position.set(
        Math.cos(angle) * radius,
        -0.18 + (index % 4) * 0.14,
        Math.sin(angle) * radius * 0.72
      );
      shard.userData.basePosition = shard.position.clone();
      shard.userData.outward = shard.position.clone().normalize();
      shard.userData.phase = index * 0.83;
      shard.userData.targetingSuppressed = true;
      shard.visible = false;
      this.consequenceRoot.add(shard);
      this.recoilShards.push(shard);
    }

    const recoveryColor = this.recipe?.visualConsequence?.recoveryColor ?? 0x9fe1d1;
    for (let index = 0; index < 6; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: recoveryColor,
        emissive: 0x357d78,
        emissiveIntensity: 0.24,
        roughness: 0.34,
        transparent: true,
        opacity: 0,
        depthWrite: false
      }));
      const strand = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.025 + (index % 2) * 0.007, 0.46 + index * 0.035, 5, 8),
        material
      );
      const side = index % 2 === 0 ? -1 : 1;
      strand.name = `grave_memory_recovery_strand_${index + 1}`;
      strand.position.set(
        side * (0.24 + Math.floor(index / 2) * 0.15),
        -0.2 + Math.floor(index / 2) * 0.24,
        -0.16 + (index % 3) * 0.16
      );
      strand.rotation.set(0.42 + index * 0.08, side * 0.28, side * (0.48 + index * 0.055));
      strand.userData.basePosition = strand.position.clone();
      strand.userData.baseScale = strand.scale.clone();
      strand.userData.phase = index * 0.76;
      strand.userData.targetingSuppressed = true;
      strand.visible = false;
      this.consequenceRoot.add(strand);
      this.recoveryStrands.push(strand);
    }

    this.consequenceLight = new THREE.PointLight(recoveryColor, 0, 3.8);
    this.consequenceLight.name = "grave_memory_consequence_witness_light";
    this.consequenceLight.userData.targetingSuppressed = true;
    this.consequenceRoot.add(this.consequenceLight);
    this.root.add(this.consequenceRoot);
  }

  spawnAuthoredObjects() {
    const spawned = this.chemObjectSystem.spawnCellObjects(this.cellRecipe, {
      cellId: ROUTE_CELL_ID,
      visible: false,
      opacity: 0,
      avoidExisting: true,
      morphRole: "grave_memory_route_preview_object"
    });
    const authored = new Map(
      (this.recipe?.objects ?? []).map((entry) => [entry.id, entry])
    );

    for (const item of spawned) {
      const entry = authored.get(item.recipe.id);
      if (!entry) continue;
      const offset = new THREE.Vector3().fromArray(entry.position ?? [0, 0, 0]);
      this.objectItems.set(item.recipe.id, item);
      this.objectOffsets.set(item.recipe.id, offset);
      this.baseObjectScales.set(item.recipe.id, item.root.scale.clone());
      item.root.userData.regionId = "grave_memory_route";
      item.root.userData.presentationOwner = "GraveMemoryRouteSystem";
      item.root.userData.protectedRemains = PROTECTED_IDS.has(item.recipe.id);
      item.root.userData.transitionPrepared = true;
      this.captureLandmarkVisual(item.recipe.id, item.root);
    }
  }

  captureLandmarkVisual(id, root) {
    const parts = new Map();
    root.traverse((child) => {
      const role = child.userData?.graveLandmarkPart;
      if (!role) return;
      if (!parts.has(role)) parts.set(role, []);
      parts.get(role).push(child);
      const materials = child.material
        ? Array.isArray(child.material) ? child.material : [child.material]
        : [];
      for (const material of materials) {
        if (!material) continue;
        if (material.userData.graveLandmarkBaseOpacity === undefined) {
          material.userData.graveLandmarkBaseOpacity = material.opacity ?? 1;
        }
        if (
          "emissiveIntensity" in material
          && material.userData.graveLandmarkBaseEmissiveIntensity === undefined
        ) {
          material.userData.graveLandmarkBaseEmissiveIntensity = material.emissiveIntensity ?? 0;
        }
      }
    });
    this.landmarkVisuals.set(id, { root, parts });
    this.landmarkPulseAges.set(id, 999);
    root.userData.graveLandmarkPresentationOwner = "GraveMemoryRouteSystem";
    root.userData.graveLandmarkMotionPass = "HC-010F";
    root.userData.graveLandmarkPartCount = [...parts.values()]
      .reduce((total, collection) => total + collection.length, 0);
  }

  rebaseAtEntry() {
    this.root.position.copy(this.entryAnchor);
    for (const [id, item] of this.objectItems.entries()) {
      const offset = this.objectOffsets.get(id) ?? new THREE.Vector3();
      item.root.position.copy(this.entryAnchor).add(offset);
      item.root.scale.copy(this.baseObjectScales.get(id) ?? new THREE.Vector3(1, 1, 1));
    }
    const returnOffset = this.recipe?.returnFold?.position ?? [0, 0.05, 0.7];
    this.returnPosition.copy(this.entryAnchor).add(this.tempVector.fromArray(returnOffset));
  }

  updateInteractions(dt, frameState) {
    const input = frameState.input ?? {};
    const pulseEventId = input.pulseEventId ?? (frameState.frame ?? 0);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) this.lastPulseEventId = pulseEventId;

    const nearest = this.nearestAuthoredObject();
    const pulseRange = this.recipe?.interaction?.pulseRange ?? 2.2;
    const stabilizeRange = this.recipe?.interaction?.stabilizeRange ?? 1.8;
    const safeTransferRange = this.recipe?.interaction?.safeTransferRange ?? stabilizeRange;

    if (freshPulse && nearest && nearest.distance <= pulseRange) {
      this.readObject(nearest.id);
    }

    const siltDistance = this.distanceToObject("residue_silt_cloud_001");
    if (
      this.siltRead
      && input.stabilizeHeld
      && siltDistance <= stabilizeRange
    ) {
      const duration = Math.max(0.2, this.recipe?.interaction?.stabilizeSeconds ?? 1.15);
      if (!this.siltStabilized) {
        this.stabilizeProgress = Math.min(1, this.stabilizeProgress + dt / duration);
        this.lastInteraction = "stabilizing_memory_silt_without_consuming_it";
        this.warning = "none";
        if (this.stabilizeProgress >= 1) {
          this.siltStabilized = true;
          this.lastInteraction = "memory_silt_stabilized_trace_readable";
        }
      } else if (
        this.circuitEnabled
        && (this.residueRecoilRisk > 0 || this.traceIntegrity < 1)
      ) {
        // C0D2: only authenticated, Grave-owned memory affects existing
        // Stabilize recovery. No change to damage, objectives or safe thresholds.
        const coupling = graveRecoveryCoupling(this.vascularEffectMemory);
        const recoveryRate = (this.recipe?.interaction?.recoveryPerSecond ?? 0.42) * coupling.multiplier;
        const integrityRate = (this.recipe?.interaction?.traceRecoveryPerSecond ?? 0.3) * coupling.multiplier;
        this.residueRecoilRisk = Math.max(0, this.residueRecoilRisk - dt * recoveryRate);
        this.traceIntegrity = Math.min(1, this.traceIntegrity + dt * integrityRate);
        if (coupling.assisted && dt > 0) {
          this.c0d2AssistedRecoveryTicks = Math.min(1000000, this.c0d2AssistedRecoveryTicks + 1);
          this.c0d2AssistedRecoverySeconds = Math.min(3600, this.c0d2AssistedRecoverySeconds + dt);
        }
        this.recoverySeconds += dt;
        this.lastInteraction = "stabilize_rebinding_scattered_memory_trace";
        this.warning = "residue_recoil_recovering";
        if (this.safeTransferRiskCleared()) {
          this.residueRecoilRecovered = this.riskEventCount > 0;
          this.warning = "none";
          this.lastInteraction = "residue_recoil_recovered_safe_trace_readable";
        }
      }
    }

    const absorbStarted = Boolean(input.absorbHeld && !this.absorbWasHeld);
    if (absorbStarted && nearest && nearest.distance <= pulseRange) {
      if (PROTECTED_IDS.has(nearest.id)) {
        this.absorbResistedCount += 1;
        if (this.circuitEnabled) {
          this.protectedAbsorbAttemptCount += 1;
          this.applyResidueRisk(nearest.id, true);
        } else {
          this.warning = "protected_remains_resist_absorb_read_instead";
          this.lastInteraction = `${nearest.id}: protected_remains_resisted_absorb`;
        }
      } else if (
        this.circuitEnabled
        && nearest.id === "residue_silt_cloud_001"
        && !this.safeTransferReady()
      ) {
        this.prematureAbsorbCount += 1;
        this.applyResidueRisk(nearest.id, false);
      } else if (!this.circuitEnabled) {
        this.warning = this.siltStabilized
          ? "memory_silt_is_a_trace_not_a_pickup"
          : "memory_silt_scattered_before_reading";
        this.lastInteraction = `${nearest.id}: trace_preserved`;
      }
    }

    const drawingSafeTrace = Boolean(
      this.circuitEnabled
      && !this.safeMemoryTransferComplete
      && input.absorbHeld
      && nearest?.id === "residue_silt_cloud_001"
      && nearest.distance <= safeTransferRange
      && this.safeTransferReady()
    );
    if (drawingSafeTrace) {
      const duration = Math.max(0.25, this.recipe?.interaction?.safeTransferSeconds ?? 1.25);
      this.safeTransferProgress = Math.min(1, this.safeTransferProgress + dt / duration);
      this.warning = "none";
      this.lastInteraction = "drawing_settled_memory_trace_without_taking_remains";
      if (this.safeTransferProgress >= 1) {
        this.safeMemoryTransferComplete = true;
        this.graveMemoryImprintCommitted = true;
        this.memoryThreadRetained = true;
        this.completed = true;
        this.lastInteraction = "safe_memory_trace_transferred_grave_imprint_committed";
      }
    } else if (
      this.circuitEnabled
      && !this.safeMemoryTransferComplete
      && !input.absorbHeld
    ) {
      const decay = this.recipe?.interaction?.transferDecayPerSecond ?? 0.18;
      this.safeTransferProgress = Math.max(0, this.safeTransferProgress - dt * decay);
    }

    if (this.circuitEnabled && this.safeMemoryTransferComplete && !this.returnFoldReady) {
      const settleSeconds = Math.max(0.2, this.recipe?.interaction?.postTransferSettleSeconds ?? 0.72);
      this.postTransferSettleProgress = Math.min(
        1,
        this.postTransferSettleProgress + dt / settleSeconds
      );
      this.lastInteraction = this.postTransferSettleProgress >= 1
        ? "memory_pearl_settled_return_fold_remembered"
        : "memory_trace_settling_into_binding_core";
      this.returnFoldReady = this.postTransferSettleProgress >= 1;
    }
    this.absorbWasHeld = Boolean(input.absorbHeld);

    const allProtectedRead = [...PROTECTED_IDS].every((id) => this.readObjects.has(id));
    if (
      !this.circuitEnabled
      && !this.completed
      && allProtectedRead
      && this.siltStabilized
    ) {
      this.completed = true;
      this.memoryThreadRetained = true;
      this.returnFoldReady = true;
      this.warning = "none";
      this.lastInteraction = "grave_memory_preview_completed_without_consuming_remains";
    }
  }

  applyResidueRisk(sourceId, protectedAttempt) {
    const interaction = this.recipe?.interaction ?? {};
    const risk = protectedAttempt
      ? (interaction.protectedAbsorbRisk ?? 0.36)
      : (interaction.prematureAbsorbRisk ?? 0.28);
    const integrityDamage = interaction.traceDamagePerPrematureAbsorb ?? 0.24;
    this.riskEventCount += 1;
    this.lastRiskSource = sourceId;
    this.residueRecoilRisk = Math.min(1, this.residueRecoilRisk + risk);
    this.traceIntegrity = Math.max(0.18, this.traceIntegrity - integrityDamage);
    this.safeTransferProgress = Math.max(0, this.safeTransferProgress - 0.22);
    this.residueRecoilRecovered = false;
    this.warning = protectedAttempt
      ? "protected_remains_recoil_read_instead"
      : "premature_absorb_scattered_memory_trace";
    this.lastInteraction = protectedAttempt
      ? `${sourceId}: protected_remains_recoiled_without_consumption`
      : `${sourceId}: unread_or_unsettled_trace_scattered`;
  }

  safeTransferRiskCleared() {
    const interaction = this.recipe?.interaction ?? {};
    return this.residueRecoilRisk <= (interaction.maximumSafeRecoilRisk ?? 0.18)
      && this.traceIntegrity >= (interaction.minimumSafeTraceIntegrity ?? 0.72);
  }

  safeTransferReady() {
    if (!this.circuitEnabled) return false;
    const allProtectedRead = [...PROTECTED_IDS].every((id) => this.readObjects.has(id));
    return Boolean(
      allProtectedRead
      && this.siltRead
      && this.siltStabilized
      && this.safeTransferRiskCleared()
      && !this.safeMemoryTransferComplete
    );
  }

  readObject(id) {
    if (!this.objectItems.has(id)) return;
    this.readObjects.add(id);
    this.landmarkPulseAges.set(id, 0);
    if (id === "residue_silt_cloud_001") this.siltRead = true;
    this.warning = "none";
    this.lastInteraction = `${id}: pulse_read_retained`;
  }

  updateVisualResponse(dt, frameState) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    if (this.routeMotes) {
      this.routeMotes.rotation.y = Math.sin(t * 0.18) * 0.12;
      this.routeMotes.rotation.z = Math.cos(t * 0.14) * 0.035;
    }

    for (const [id, item] of this.objectItems.entries()) {
      const read = this.readObjects.has(id);
      const baseScale = this.baseObjectScales.get(id);
      if (baseScale) {
        const pulse = 1 + Math.sin(t * (read ? 2.2 : 1.1) + id.length) * (read ? 0.045 : 0.018);
        item.root.scale.copy(baseScale).multiplyScalar(pulse);
      }
      item.root.traverse((child) => {
        const landmarkPart = Boolean(child.userData?.graveLandmarkPart);
        const materials = child.material
          ? Array.isArray(child.material) ? child.material : [child.material]
          : [];
        for (const material of materials) {
          if (!material) continue;
          if (!landmarkPart && "emissiveIntensity" in material) {
            const siltTransfer = id === "residue_silt_cloud_001"
              ? this.safeTransferProgress * 0.5
              : 0;
            const riskResponse = id === "scar_lock_plate_001"
              ? this.residueRecoilRisk * 0.62
              : 0;
            material.emissiveIntensity = (read ? 0.42 : 0.12) + siltTransfer + riskResponse;
          }
          if (
            !landmarkPart
            &&
            this.circuitEnabled
            && id === "residue_silt_cloud_001"
            && "opacity" in material
            && material.transparent
          ) {
            material.opacity = Math.max(
              0.28,
              Math.min(1, 0.48 + this.traceIntegrity * 0.42 - this.residueRecoilRisk * 0.22)
            );
          }
        }
      });
    }

    this.animateLandmarkVisuals(dt, t);

    this.scarRibs.forEach((rib, index) => {
      if (!rib.material) return;
      const recoilBeat = (Math.sin(t * 7.2 + index * 0.9) + 1) * 0.5;
      rib.material.emissiveIntensity = 0.16
        + this.residueRecoilRisk * (0.38 + recoilBeat * 0.46);
      const recoilScale = 1 + this.residueRecoilRisk * recoilBeat * 0.045;
      rib.scale.set(0.82 * recoilScale, recoilScale, 0.7 * recoilScale);
    });

    this.animateMemoryThread(t);
    this.animateConsequenceVisuals(dt, t, frameState);

    if (this.returnFold) {
      this.returnFold.visible = this.returnFoldReady && this.active;
      const breathe = 1 + Math.sin(t * 1.7) * 0.055;
      this.returnFold.scale.setScalar(breathe);
      this.returnFold.traverse((child) => {
        if (!child.material) return;
        child.material.opacity = this.returnFoldReady
          ? 0.46 + Math.sin(t * 1.5) * 0.08
          : 0.08;
        child.material.emissiveIntensity = this.returnFoldReady ? 0.42 : 0.12;
      });
    }
  }

  animateLandmarkVisuals(dt, t) {
    const safeDt = Math.max(0, dt ?? 0);
    for (const id of this.landmarkPulseAges.keys()) {
      this.landmarkPulseAges.set(id, Math.min(999, (this.landmarkPulseAges.get(id) ?? 999) + safeDt));
    }

    const partsFor = (id, role) => this.landmarkVisuals.get(id)?.parts.get(role) ?? [];
    const pulseStrength = (id, duration = 1.6) => THREE.MathUtils.clamp(
      1 - (this.landmarkPulseAges.get(id) ?? 999) / duration,
      0,
      1
    );
    const restoreTransform = (part) => {
      const basePosition = part.userData.graveLandmarkBasePosition;
      const baseScale = part.userData.graveLandmarkBaseScale;
      const baseRotation = part.userData.graveLandmarkBaseRotation;
      if (basePosition) part.position.copy(basePosition);
      if (baseScale) part.scale.copy(baseScale);
      if (baseRotation) part.rotation.copy(baseRotation);
    };
    const setOpacity = (part, opacity) => {
      const materials = part.material
        ? Array.isArray(part.material) ? part.material : [part.material]
        : [];
      for (const material of materials) {
        if (material && "opacity" in material) material.opacity = opacity;
      }
    };
    const setEmissive = (part, intensity) => {
      const materials = part.material
        ? Array.isArray(part.material) ? part.material : [part.material]
        : [];
      for (const material of materials) {
        if (material && "emissiveIntensity" in material) material.emissiveIntensity = intensity;
      }
    };

    const huskId = "old_core_husk_memory_001";
    const huskPulse = pulseStrength(huskId, 1.85);
    const huskRead = this.readObjects.has(huskId) ? 1 : 0;
    const huskRisk = this.lastRiskSource === huskId ? this.residueRecoilRisk : 0;
    const huskBreath = 1 + Math.sin(t * 0.78) * 0.016;
    partsFor(huskId, "husk_shell_lobe").forEach((part, index) => {
      restoreTransform(part);
      const baseScale = part.userData.graveLandmarkBaseScale;
      const side = Math.sign(part.userData.graveLandmarkBasePosition?.x ?? (index % 2 ? 1 : -1)) || 1;
      if (baseScale) part.scale.copy(baseScale).multiplyScalar(huskBreath * (1 + huskRisk * 0.035));
      part.position.x += side * (huskPulse * 0.055 + huskRisk * 0.04);
      part.position.y += Math.sin(t * 0.72 + index * 1.8) * 0.012;
    });
    partsFor(huskId, "husk_torn_plate").forEach((part, index) => {
      restoreTransform(part);
      part.rotation.z += Math.sin(t * 0.58 + index) * 0.025 + huskRisk * (index % 2 ? -0.08 : 0.08);
    });
    partsFor(huskId, "husk_scar_crack").forEach((part, index) => {
      restoreTransform(part);
      const beat = (Math.sin(t * 4.6 + index * 0.7) + 1) * 0.5;
      setOpacity(part, 0.12 + huskRead * 0.1 + huskPulse * (0.38 + beat * 0.24) + huskRisk * 0.36);
    });
    partsFor(huskId, "husk_dim_center").forEach((part) => {
      restoreTransform(part);
      setEmissive(part, 0.22 + huskPulse * 0.7 + huskRisk * 0.42);
    });
    partsFor(huskId, "husk_memory_echo").forEach((part) => {
      restoreTransform(part);
      part.visible = this.active && huskPulse > 0.02;
      part.position.y += huskPulse * 0.38;
      part.scale.multiplyScalar(0.78 + huskPulse * 0.32);
      setOpacity(part, huskPulse * 0.34);
    });
    partsFor(huskId, "husk_transient_warning_halo").forEach((part) => {
      const warning = Math.max(huskPulse * 0.32, huskRisk);
      restoreTransform(part);
      part.visible = this.active && warning > 0.04;
      part.scale.multiplyScalar(0.92 + warning * 0.16);
      setOpacity(part, warning * 0.42);
    });

    const siltId = "residue_silt_cloud_001";
    const siltPulse = pulseStrength(siltId, 1.75);
    const siltRead = this.siltRead ? 1 : 0;
    const align = THREE.MathUtils.clamp(
      this.stabilizeProgress * 0.72
      + Number(this.siltStabilized) * 0.28
      + this.recoveryVisualStrength * 0.32,
      0,
      1
    );
    partsFor(siltId, "silt_cloud_lobe").forEach((part, index) => {
      restoreTransform(part);
      part.position.y += Math.sin(t * 0.46 + index * 1.7) * (0.035 - align * 0.018);
      part.rotation.y += Math.sin(t * 0.22 + index) * 0.08;
      setOpacity(part, 0.12 + siltRead * 0.035 + align * 0.08 - this.residueRecoilRisk * 0.035);
    });
    partsFor(siltId, "silt_ash_mote").forEach((part, index) => {
      restoreTransform(part);
      const base = part.userData.graveLandmarkBasePosition;
      const phase = part.userData.graveLandmarkPhase ?? index / 22;
      const cycle = (t * (0.075 + (index % 4) * 0.012) + phase) % 1;
      if (base) {
        part.position.y = base.y + 0.38 - cycle * 0.76 + align * 0.1;
        part.position.x = base.x + Math.sin(t * 0.62 + index) * (0.035 + (1 - align) * 0.03);
        part.position.z = base.z + Math.cos(t * 0.48 + index * 0.7) * 0.025;
      }
      const sparkle = 0.72 + Math.sin(t * 2.2 + index) * 0.28;
      setOpacity(part, 0.24 + siltRead * 0.18 + align * 0.18 + siltPulse * sparkle * 0.26);
    });
    partsFor(siltId, "silt_threaded_void").forEach((part, index) => {
      restoreTransform(part);
      part.rotation.z += t * (index % 2 === 0 ? 0.08 : -0.07);
      part.scale.multiplyScalar(1 + siltPulse * 0.08 + align * 0.045);
      setOpacity(part, 0.24 + siltRead * 0.08 + siltPulse * 0.12);
    });
    partsFor(siltId, "silt_signal_thread").forEach((part, index) => {
      restoreTransform(part);
      const baseRotation = part.userData.graveLandmarkBaseRotation;
      if (baseRotation) {
        part.rotation.z = THREE.MathUtils.lerp(baseRotation.z, (index - 4) * 0.045, align);
        part.rotation.x = THREE.MathUtils.lerp(baseRotation.x, Math.PI / 2, align * 0.82);
      }
      part.scale.y *= 1 + align * 0.32 + this.safeTransferProgress * 0.18;
      setOpacity(part, 0.18 + siltRead * 0.12 + align * 0.32 + siltPulse * 0.18);
    });
    partsFor(siltId, "silt_memory_echo").forEach((part) => {
      const echoStrength = Math.max(siltPulse, this.recoveryVisualStrength * 0.38);
      restoreTransform(part);
      part.visible = this.active && echoStrength > 0.025;
      part.position.y += echoStrength * 0.32;
      part.scale.multiplyScalar(0.82 + echoStrength * 0.3);
      setOpacity(part, echoStrength * 0.3);
    });

    const scarId = "scar_lock_plate_001";
    const scarPulseAge = this.landmarkPulseAges.get(scarId) ?? 999;
    const scarPulse = pulseStrength(scarId, 2.05);
    const scarRisk = this.residueRecoilRisk;
    partsFor(scarId, "scar_guard_plate").forEach((part, index) => {
      restoreTransform(part);
      const centerBias = index - 2;
      part.position.x -= Math.sign(centerBias) * scarRisk * 0.055;
      part.position.y += scarRisk * (0.025 + Math.abs(centerBias) * 0.01);
      part.scale.y *= 1 + scarRisk * 0.34;
      part.rotation.z += scarRisk * centerBias * -0.035;
      setEmissive(part, 0.04 + scarPulse * 0.08 + scarRisk * 0.24);
    });
    partsFor(scarId, "scar_guard_rib").forEach((part, index) => {
      restoreTransform(part);
      part.scale.x *= 1 + scarRisk * 0.12;
      part.position.y += Math.sin(t * 0.42 + index) * 0.008;
      setEmissive(part, 0.06 + scarRisk * 0.32);
    });
    partsFor(scarId, "scar_delayed_crack").forEach((part, index) => {
      restoreTransform(part);
      const delayedCenter = 0.28 + index * 0.065;
      const delayedPulse = THREE.MathUtils.clamp(1 - Math.abs(scarPulseAge - delayedCenter) / 0.82, 0, 1);
      const riskBeat = (Math.sin(t * 7.4 + index * 0.8) + 1) * 0.5;
      setOpacity(part, 0.035 + delayedPulse * 0.48 + scarRisk * (0.3 + riskBeat * 0.32));
    });
    partsFor(scarId, "scar_recoil_tooth").forEach((part, index) => {
      restoreTransform(part);
      const strength = THREE.MathUtils.clamp(scarRisk * 2.2, 0, 1);
      part.visible = this.active && strength > 0.03;
      part.scale.multiplyScalar(Math.max(0.001, strength * (0.8 + (index % 2) * 0.16)));
      part.position.y += strength * 0.1;
      setOpacity(part, strength * 0.72);
      setEmissive(part, 0.14 + strength * 0.52);
    });

    const seedId = "inheritance_seed_remnant_001";
    const seedPulse = pulseStrength(seedId, 1.7);
    const seedRead = this.readObjects.has(seedId) ? 1 : 0;
    const sleepingPulse = Math.pow((Math.sin(t * 1.08 - 1.1) + 1) * 0.5, 7);
    partsFor(seedId, "seed_residue_nest_petal").forEach((part, index) => {
      restoreTransform(part);
      part.rotation.z += Math.sin(t * 0.52 + index * 1.3) * 0.018;
      part.position.y += sleepingPulse * 0.012 + seedPulse * 0.018;
    });
    partsFor(seedId, "seed_gray_memory_skin").forEach((part, index) => {
      restoreTransform(part);
      part.rotation.y += Math.sin(t * 0.36 + index) * 0.035;
      setOpacity(part, 0.32 - seedPulse * 0.1 + sleepingPulse * 0.04);
    });
    partsFor(seedId, "seed_dim_core").forEach((part) => {
      restoreTransform(part);
      const pulse = 1 + sleepingPulse * 0.08 + seedPulse * 0.18;
      part.scale.multiplyScalar(pulse);
      setEmissive(part, 0.38 + sleepingPulse * 0.46 + seedPulse * 0.82 + seedRead * 0.12);
    });
    partsFor(seedId, "seed_root_filament").forEach((part, index) => {
      restoreTransform(part);
      part.rotation.z += Math.sin(t * 0.58 + index) * 0.055;
      setOpacity(part, 0.2 + seedRead * 0.08 + seedPulse * 0.16);
    });
    partsFor(seedId, "seed_future_glow").forEach((part) => {
      restoreTransform(part);
      const glow = 0.12 + sleepingPulse * 0.46 + seedPulse * 0.72 + seedRead * 0.12;
      part.visible = this.active;
      part.scale.multiplyScalar(0.92 + glow * 0.12);
      setOpacity(part, glow * 0.22);
    });
  }

  animateConsequenceVisuals(dt, t, frameState) {
    if (!this.consequenceRoot) return;
    this.consequencePhase = this.resolveConsequencePhase(frameState);
    const safeDt = Math.max(0, dt ?? 0);
    const recoilTarget = this.consequencePhase === "recoil_scatter"
      ? Math.max(0.48, Math.min(1, this.residueRecoilRisk * 2.4))
      : this.consequencePhase === "stabilization_reweave"
        ? Math.min(0.42, this.residueRecoilRisk * 1.2)
        : 0;
    const recoveryTarget = this.consequencePhase === "stabilization_reweave"
      ? 1
      : this.siltStabilized && !this.safeMemoryTransferComplete
        ? 0.26
        : 0;
    const transferTarget = this.consequencePhase === "safe_trace_transfer"
      ? Math.max(0.18, this.safeTransferProgress)
      : this.consequencePhase === "trace_settling"
        ? Math.max(0.2, 1 - this.postTransferSettleProgress * 0.72)
        : 0;
    const retentionTarget = this.graveMemoryImprintCommitted ? 1 : 0;
    const blend = (rate) => 1 - Math.exp(-safeDt * rate);
    this.recoilVisualStrength += (recoilTarget - this.recoilVisualStrength) * blend(11);
    this.recoveryVisualStrength += (recoveryTarget - this.recoveryVisualStrength) * blend(7.5);
    this.transferVisualStrength += (transferTarget - this.transferVisualStrength) * blend(9);
    this.retentionVisualStrength += (retentionTarget - this.retentionVisualStrength) * blend(4.2);

    this.recoilShards.forEach((shard, index) => {
      const strength = this.recoilVisualStrength;
      const beat = (Math.sin(t * 9.4 + (shard.userData.phase ?? index)) + 1) * 0.5;
      const base = shard.userData.basePosition ?? shard.position;
      const outward = shard.userData.outward ?? new THREE.Vector3(1, 0, 0);
      shard.visible = this.active && strength > 0.025;
      shard.position.copy(base).addScaledVector(outward, strength * (0.16 + beat * 0.2));
      shard.position.y += Math.sin(t * 12.2 + index) * strength * 0.055;
      shard.scale.setScalar(Math.max(0.001, strength * (0.72 + beat * 0.58)));
      shard.rotation.x += safeDt * (1.8 + index * 0.12) * strength;
      shard.rotation.y -= safeDt * (1.4 + index * 0.1) * strength;
      shard.material.opacity = strength * (0.48 + beat * 0.36);
      shard.material.emissiveIntensity = 0.22 + strength * (0.46 + beat * 0.52);
    });

    this.recoveryStrands.forEach((strand, index) => {
      const strength = this.recoveryVisualStrength;
      const beat = 0.88 + Math.sin(t * 3.8 + (strand.userData.phase ?? index)) * 0.12;
      const baseScale = strand.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
      strand.visible = this.active && strength > 0.025;
      strand.scale.set(
        baseScale.x * Math.max(0.001, strength),
        baseScale.y * Math.max(0.001, strength * (0.72 + beat * 0.38)),
        baseScale.z * Math.max(0.001, strength)
      );
      strand.rotation.y += safeDt * (0.22 + index * 0.035) * strength;
      strand.material.opacity = strength * (0.34 + beat * 0.28);
      strand.material.emissiveIntensity = 0.16 + strength * (0.46 + beat * 0.22);
    });

    if (this.consequenceLight) {
      const recoveryGlow = this.recoveryVisualStrength * 1.25;
      const transferGlow = this.transferVisualStrength * 1.7;
      const retainedGlow = this.retentionVisualStrength * 0.48;
      this.consequenceLight.intensity = Math.max(recoveryGlow, transferGlow, retainedGlow);
      this.consequenceLight.color.setHex(
        this.consequencePhase === "recoil_scatter"
          ? (this.recipe?.visualConsequence?.recoilColor ?? 0xf07867)
          : this.consequencePhase === "safe_trace_transfer" || this.consequencePhase === "trace_settling"
            ? (this.recipe?.visualConsequence?.transferColor ?? 0xd8c2d8)
            : (this.recipe?.visualConsequence?.recoveryColor ?? 0x9fe1d1)
      );
    }

    this.consequenceRoot.userData.phase = this.consequencePhase;
    this.consequenceRoot.userData.recoilStrength = this.recoilVisualStrength;
    this.consequenceRoot.userData.recoveryStrength = this.recoveryVisualStrength;
    this.consequenceRoot.userData.transferStrength = this.transferVisualStrength;
    this.consequenceRoot.userData.retentionStrength = this.retentionVisualStrength;
  }

  resolveConsequencePhase(frameState = this.frameState) {
    if (this.graveMemoryImprintCommitted) {
      return this.returnFoldReady ? "retained_memory_imprint" : "trace_settling";
    }
    if (this.safeTransferProgress > 0) return "safe_trace_transfer";
    if (
      frameState.input?.stabilizeHeld
      && this.siltStabilized
      && (this.residueRecoilRisk > 0 || this.traceIntegrity < 1)
    ) {
      return "stabilization_reweave";
    }
    if (!this.safeTransferRiskCleared()) return "recoil_scatter";
    if (this.safeTransferReady()) return "settled_trace_ready";
    if (this.siltStabilized) return "stabilized_silt";
    return "quiet_read";
  }

  animateMemoryThread(t) {
    if (!this.memoryThreadRoot) return;
    const silt = this.objectItems.get("residue_silt_cloud_001");
    const transferVisible = Boolean(
      this.active
      && this.circuitEnabled
      && (
        this.safeTransferProgress > 0.001
        || (this.safeMemoryTransferComplete && !this.returnFoldReady)
      )
    );
    this.memoryThreadRoot.visible = transferVisible;
    if (!transferVisible || !silt) return;

    this.threadStart.copy(silt.root.position).sub(this.root.position);
    this.threadEnd.copy(this.playerRoot.position).sub(this.root.position);
    this.threadControl.copy(this.threadStart).lerp(this.threadEnd, 0.5);
    this.threadControl.y += 0.42 + this.traceIntegrity * 0.18;
    this.threadControl.z -= 0.16;

    const draw = this.safeMemoryTransferComplete ? 1 : Math.max(0.04, this.safeTransferProgress);
    const settleFade = this.safeMemoryTransferComplete
      ? Math.max(0, 1 - this.postTransferSettleProgress * 0.82)
      : 1;
    const riskScatter = this.residueRecoilRisk * 0.2;

    this.memoryThreadMotes.forEach((mote, index) => {
      const normalizedIndex = (index + 1) / this.memoryThreadMotes.length;
      const progress = Math.min(1, normalizedIndex * draw);
      const inverse = 1 - progress;
      mote.position.set(0, 0, 0)
        .addScaledVector(this.threadStart, inverse * inverse)
        .addScaledVector(this.threadControl, 2 * inverse * progress)
        .addScaledVector(this.threadEnd, progress * progress);
      mote.position.x += Math.sin(t * 5.4 + index * 1.7) * riskScatter;
      mote.position.y += Math.cos(t * 4.7 + index * 1.2) * riskScatter * 0.65;
      const breath = 0.82 + Math.sin(t * 3.2 + index * 0.8) * 0.16;
      mote.scale.setScalar(breath * (0.78 + this.traceIntegrity * 0.32));
      mote.material.opacity = normalizedIndex <= draw + 0.02
        ? (0.24 + this.traceIntegrity * 0.56) * settleFade
        : 0;
      mote.material.emissiveIntensity = 0.18
        + this.safeTransferProgress * 0.58
        + this.traceIntegrity * 0.18;
    });
  }

  applyPhysicalFeel(frameState) {
    const physical = this.cellRecipe?.physicalFeel ?? {};
    const flow = physical.flowVector ?? [0, 0, 0];
    const recoil = this.circuitEnabled ? this.residueRecoilRisk : 0;
    const authoredBounds = this.recipe?.movementBounds ?? {};

    // HC-016Y: Grave should feel like a broad residue bed, not an empty room.
    // Depth adds a little settling weight while recoil makes the field resist
    // impatient movement. Completion gives a faint return drift toward entry.
    this.tempVector.copy(this.playerRoot.position).sub(this.entryAnchor);
    const graveDepth = THREE.MathUtils.clamp(
      Math.max(0, -this.tempVector.z) / 18,
      0,
      1
    );
    const returnDirection = this.completed ? 1 : -1;
    const settlingFlow = {
      x: (flow[0] ?? 0) + Math.sin(this.elapsed * 0.32) * 0.012,
      y: (flow[1] ?? 0) - 0.025 - graveDepth * 0.018,
      z: (flow[2] ?? 0) + returnDirection * (this.completed ? 0.055 : 0.014)
    };
    const boundaryRadii = authoredBounds.radii ?? [4.25, 3.1, 6.8];
    frameState.physicalFeel = {
      viscosity: Math.min(0.92, (physical.viscosity ?? 0.64) + recoil * 0.16),
      pressure: Math.min(0.9, (physical.pressure ?? 0.5) + recoil * 0.24),
      flowVector: settlingFlow,
      routeFeelProfile: "grave_quiet_residue_memory_bed",
      accelerationScale: 0.90 - recoil * 0.10,
      speedScale: 0.93 - recoil * 0.08,
      boostScale: 0.90 - recoil * 0.12,
      flowCouplingScale: 0.72,
      withFlowSpeedBonus: this.completed ? 0.08 : 0,
      againstFlowSpeedPenalty: 0.04,
      spatialFeel: {
        depth: graveDepth,
        recoil,
        condition: recoil > 0.18
          ? "memory_residue_resists_impatient_motion"
          : this.completed
            ? "settled_memory_field_exhales_toward_return"
            : "quiet_weighted_memory_bed"
      },
      gravityMode: physical.gravityMode ?? "settling_memory_bed_anchor",
      boundaryBehavior: physical.boundaryBehavior ?? "scar_plate_recoil_without_gate_prompt",
      movementFeel: recoil > 0.18
        ? "residue_recoil_drag_recover_with_stabilize"
        : "quiet_residue_drag_with_memory_anchor",
      movementBounds: {
        active: Boolean(this.active),
        mode: authoredBounds.mode ?? "entry_anchored_ellipsoid",
        center: {
          x: this.entryAnchor.x,
          y: this.entryAnchor.y,
          z: this.entryAnchor.z
        },
        radii: {
          x: boundaryRadii[0] ?? boundaryRadii.x ?? 4.25,
          y: boundaryRadii[1] ?? boundaryRadii.y ?? 3.1,
          z: boundaryRadii[2] ?? boundaryRadii.z ?? 6.8
        },
        owner: authoredBounds.collisionOwner ?? "PlayerMovementController",
        tuningOwner: authoredBounds.tuningOwner ?? "GraveMemoryRouteSystem",
        regionId: "grave_memory_route",
        centerSource: authoredBounds.centerSource ?? "preserved_gate_entry_position",
        restoresPriorBoundaryOnExit: authoredBounds.restoresPriorBoundaryOnExit !== false
      }
    };
  }

  nearestAuthoredObject() {
    let nearest = null;
    for (const [id, item] of this.objectItems.entries()) {
      if (!item.root.visible || item.absorbed || item.root.userData.absorbed) continue;
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (!nearest || distance < nearest.distance) nearest = { id, item, distance };
    }
    return nearest;
  }

  distanceToObject(id) {
    const item = this.objectItems.get(id);
    return item ? this.playerRoot.position.distanceTo(item.root.position) : Number.POSITIVE_INFINITY;
  }

  currentStage() {
    if (!this.active) return "route_inactive";
    if (this.completed) {
      return this.returnFoldReady ? "return_fold_ready" : "memory_reading_settling";
    }
    if (!this.readObjects.has("old_core_husk_memory_001")) return "read_old_core_husk";
    if (!this.siltRead) return "pulse_memory_silt";
    if (!this.siltStabilized) return "stabilize_memory_silt";
    if (!this.readObjects.has("scar_lock_plate_001")) return "read_protective_scar";
    if (!this.readObjects.has("inheritance_seed_remnant_001")) return "read_inheritance_seed";
    if (this.circuitEnabled) {
      if (!this.safeTransferRiskCleared()) return "recover_memory_trace";
      if (this.safeTransferProgress > 0) return "memory_trace_entering";
      return "accept_memory_trace";
    }
    return "memory_reading_settling";
  }

  language(stage) {
    const language = this.recipe?.playerFacingLanguage ?? {};
    const fallback = {
      read_old_core_husk: "Approach the old Core husk and Pulse to read it.",
      pulse_memory_silt: "Pulse the drifting memory silt before trying to hold it.",
      stabilize_memory_silt: "Hold Stabilize near the read silt until its trace settles.",
      read_protective_scar: "Pulse the scar plate. It protects the remains; it is not a door.",
      read_inheritance_seed: "Pulse the inheritance seed without taking it.",
      recover_memory_trace: "The trace scattered. Hold Stabilize near the silt until the recoil settles.",
      accept_memory_trace: "Only the settled trace may enter. Hold Absorb gently near the memory silt.",
      memory_trace_entering: "Keep the gentle draw steady. Carry the reading, not the remains.",
      memory_reading_settling: "The trace is becoming part of the Core. Let it settle.",
      return_fold_ready: "The memory pearl is retained. Return through the resolved entry fold."
    };
    return language[stage] ?? fallback[stage] ?? "Move, Pulse, and listen.";
  }

  publish(frameState, active) {
    this.stage = this.currentStage();
    const returnFoldDistance = this.returnPosition.lengthSq() > 0
      ? this.playerRoot.position.distanceTo(this.returnPosition)
      : Number.POSITIVE_INFINITY;
    const readCount = this.readObjects.size;
    const totalReadCount = 4;
    const progress = this.circuitEnabled
      ? Math.min(
          1,
          (
            readCount
            + this.stabilizeProgress
            + this.safeTransferProgress
            + this.postTransferSettleProgress * 0.35
          ) / 6.35
        )
      : this.completed
        ? 1
        : Math.min(0.98, (readCount + this.stabilizeProgress) / (totalReadCount + 1));
    const nearest = active ? this.nearestAuthoredObject() : null;
    const protectedObjectsUntouched = [...PROTECTED_IDS].every((id) => {
      const item = this.objectItems.get(id);
      return item && !item.absorbed && !item.root.userData.absorbed;
    });
    const nextAction = this.language(this.stage);
    const transferStage = [
      "recover_memory_trace",
      "accept_memory_trace",
      "memory_trace_entering",
      "memory_reading_settling"
    ].includes(this.stage);
    const currentFocus = this.returnFoldReady
      ? "grave_memory_return_fold"
      : transferStage
        ? "residue_silt_cloud_001"
        : nearest?.id ?? "none";
    const objectiveLine = this.completed
      ? "A settled memory trace now lives in the Core; the remains stay embodied here."
      : this.stage === "recover_memory_trace"
        ? "Stabilize the scattered trace until residue recoil and integrity return to safe bounds."
        : ["accept_memory_trace", "memory_trace_entering"].includes(this.stage)
          ? "Accept only the settled silt trace. Leave the husk, scar, and inheritance seed intact."
          : "Read the husk, settle the silt, and understand what the scar protects.";
    const landmarkRoles = [...this.objectItems.entries()].map(([id, item]) => ({
      id,
      role: item.root.userData.graveLandmarkRole ?? "unlocked_proxy",
      silhouette: item.root.userData.graveLandmarkSilhouette ?? "unlocked_proxy",
      motion: item.root.userData.graveLandmarkMotion ?? "unlocked_proxy",
      partCount: item.root.userData.graveLandmarkPartCount ?? 0,
      placeholderActive: Boolean(item.root.userData.placeholder),
      visualLockStatus: item.root.userData.visualLockStatus ?? "none"
    }));
    const landmarkVisualLockComplete = landmarkRoles.length === 4
      && new Set(landmarkRoles.map((entry) => entry.role)).size === 4
      && landmarkRoles.every((entry) => (
        entry.partCount >= 7
        && entry.placeholderActive === false
        && entry.visualLockStatus === "replaced_by_recipe_composition"
      ));

    // C0D2 consequence stays in the Grave-owned sidecar. Legacy Grave
    // objectives/stages and Host/Vascular snapshots remain unchanged.
    const coupling = graveRecoveryCoupling(this.vascularEffectMemory);
    frameState.graveVascularEffectMemory = {
      ...this.vascularEffectMemory.snapshot({active}),
      gameplayConsequenceApplied: this.c0d2AssistedRecoveryTicks > 0,
      recoveryCoupling: {
        pass: "C0D2", owner: "GraveMemoryRouteSystem",
        mode: "stabilize_recoil_and_trace_recovery_only",
        multiplier: coupling.multiplier,
        assistedRecoveryTicks: this.c0d2AssistedRecoveryTicks,
        assistedRecoverySeconds: this.c0d2AssistedRecoverySeconds,
        eligibleNow: Boolean(active && this.circuitEnabled && this.siltRead
          && this.siltStabilized && (this.residueRecoilRisk > 0 || this.traceIntegrity < 1)
          && coupling.assisted)
      }
    };
    frameState.graveMemoryRoute = {
      pass: this.circuitEnabled ? "HC-010F" : "HC-010A",
      id: this.recipe?.id ?? (this.circuitEnabled ? CIRCUIT_RECIPE_ID : PREVIEW_RECIPE_ID),
      active: Boolean(active),
      regionId: "grave_memory_route",
      runtimeCellId: ROUTE_CELL_ID,
      stage: this.stage,
      status: !active
        ? this.completed ? "route_history_retained" : "route_inactive"
        : this.returnFoldReady
          ? "safe_transfer_complete_return_ready"
          : this.completed
            ? "memory_imprint_settling"
            : this.circuitEnabled
              ? "risk_recovery_safe_transfer_active"
              : "read_before_absorb_active",
      progress,
      ready: this.returnFoldReady,
      completed: this.completed,
      readObjects: [...this.readObjects],
      readCount,
      requiredReadCount: totalReadCount,
      oldCoreRead: this.readObjects.has("old_core_husk_memory_001"),
      memorySiltRead: this.siltRead,
      memorySiltStabilized: this.siltStabilized,
      stabilizeProgress: this.stabilizeProgress,
      protectiveScarRead: this.readObjects.has("scar_lock_plate_001"),
      inheritanceSeedRead: this.readObjects.has("inheritance_seed_remnant_001"),
      protectedObjectsUntouched,
      protectedObjectCount: PROTECTED_IDS.size,
      absorbResistedCount: this.absorbResistedCount,
      memoryThreadRetained: this.memoryThreadRetained,
      safeTransferRequired: this.circuitEnabled,
      safeTransferReady: this.safeTransferReady(),
      safeTransferProgress: this.safeTransferProgress,
      safeMemoryTransferComplete: this.safeMemoryTransferComplete,
      traceIntegrity: this.traceIntegrity,
      minimumSafeTraceIntegrity: this.recipe?.interaction?.minimumSafeTraceIntegrity ?? 0.72,
      residueRecoilRisk: this.residueRecoilRisk,
      maximumSafeRecoilRisk: this.recipe?.interaction?.maximumSafeRecoilRisk ?? 0.18,
      riskEventCount: this.riskEventCount,
      prematureAbsorbCount: this.prematureAbsorbCount,
      protectedAbsorbAttemptCount: this.protectedAbsorbAttemptCount,
      recoverySeconds: this.recoverySeconds,
      residueRecoilRecovered: this.residueRecoilRecovered,
      lastRiskSource: this.lastRiskSource,
      failureRecoverable: this.circuitEnabled,
      graveMemoryImprintCommitted: this.graveMemoryImprintCommitted,
      graveMemoryImprint: this.graveMemoryImprintCommitted
        ? "asymmetric_pearl_dark_memory_node"
        : "none",
      visualConsequencePass: "HC-010E",
      visualConsequenceOwner: "GraveMemoryRouteSystem",
      visualConsequencePhase: this.consequencePhase,
      visualConsequenceOrdered: true,
      recoilVisualStrength: this.recoilVisualStrength,
      stabilizationVisualStrength: this.recoveryVisualStrength,
      transferVisualStrength: this.transferVisualStrength,
      retentionVisualStrength: this.retentionVisualStrength,
      recoilVisualReadable: this.consequencePhase === "recoil_scatter" && this.recoilVisualStrength > 0.16,
      stabilizationVisualReadable: this.consequencePhase === "stabilization_reweave" && this.recoveryVisualStrength > 0.16,
      safeTransferVisualReadable: ["safe_trace_transfer", "trace_settling"].includes(this.consequencePhase)
        && (this.transferVisualStrength > 0.12 || this.memoryThreadRoot?.visible),
      retainedImprintVisualRequested: this.graveMemoryImprintCommitted,
      recoilShardCount: this.recoilShards.length,
      recoveryStrandCount: this.recoveryStrands.length,
      transferThreadMoteCount: this.memoryThreadMotes.length,
      consequenceUsesObjectDefiningRings: false,
      landmarkVisualPass: "HC-010F",
      landmarkGeometryOwner: "ChemObjectVisualComposer",
      landmarkMotionOwner: "GraveMemoryRouteSystem",
      landmarkVisualLockComplete,
      landmarkVisualCount: landmarkRoles.length,
      landmarkVisualRoles: landmarkRoles,
      landmarkIdleObjectDefiningRings: false,
      expiredGraveLandmarkPlaceholdersActive: landmarkRoles.filter((entry) => entry.placeholderActive).length,
      postTransferSettleProgress: this.postTransferSettleProgress,
      currentFocus,
      focusDistance: nearest?.distance ?? 0,
      returnFoldVisible: Boolean(active && this.returnFoldReady),
      returnFoldReady: this.returnFoldReady,
      returnFoldDistance,
      returnFoldInteractionRange: this.recipe?.returnFold?.interactionRange ?? 1.25,
      returnGateId: "grave_memory_to_hub_chamber",
      objectiveId: "grave_memory_read_and_stabilize",
      objectiveLine,
      guideLine: this.completed
        ? "You carried an interpretation. The old life remains where it can still mean."
        : this.residueRecoilRisk > 0
          ? "Taking before understanding scattered the trace. Stabilize; memory can recover."
          : "Memory answers Pulse before it accepts any other action.",
      nextAction,
      warning: this.warning,
      lastInteraction: this.lastInteraction,
      mountCount: this.mountCount,
      preparedHidden: this.prepared,
      movementBoundaryMode: frameState.physicalFeel?.movementBounds?.mode ?? "inactive",
      movementBoundaryCenter: frameState.physicalFeel?.movementBounds?.center ?? null,
      movementBoundaryRadii: frameState.physicalFeel?.movementBounds?.radii ?? null,
      movementBoundaryOwner: frameState.physicalFeel?.movementBounds?.owner ?? "PlayerMovementController",
      movementBoundaryTuningOwner: frameState.physicalFeel?.movementBounds?.tuningOwner ?? "GraveMemoryRouteSystem",
      movementBoundaryRegionLocal: Boolean(active && frameState.physicalFeel?.movementBounds?.mode === "entry_anchored_ellipsoid"),
      presentationOwner: "GraveMemoryRouteSystem",
      gameplayOwner: "GraveMemoryRouteSystem",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      directObjectiveMutation: false,
      directGateMutation: false,
      directCellMutation: false,
      forcedRelocation: false,
      newAbilityUnlocks: 0,
      permanentClass: false,
      newRouteBranch: false,
      oldCompatibilitySystemsActivated: false
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
    for (const item of this.objectItems.values()) {
      const show = Boolean(visible && !item.absorbed && !item.root.userData.absorbed);
      item.root.visible = show;
      this.chemObjectSystem.setObjectOpacity(item.root, show ? 1 : 0);
    }
    if (this.returnFold) this.returnFold.visible = Boolean(visible && this.returnFoldReady);
    if (!visible && this.memoryThreadRoot) this.memoryThreadRoot.visible = false;
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }

  clonePhysicalFeel(source) {
    if (!source) return null;
    return {
      ...source,
      flowVector: source.flowVector ? { ...source.flowVector } : undefined,
      movementBounds: source.movementBounds
        ? {
            ...source.movementBounds,
            center: source.movementBounds.center ? { ...source.movementBounds.center } : undefined,
            radii: source.movementBounds.radii ? { ...source.movementBounds.radii } : undefined
          }
        : undefined
    };
  }
}
