import * as THREE from "three";

// HC027G: returned sonar classes express themselves through distinct motion laws
// in the existing Host mote field. These are presentation signatures only.
const MATERIAL_REPLY_SIGNATURES = Object.freeze({
  host_membrane: "broad_tangential_enclosure",
  living_seed: "cluster_and_breathe",
  scar_memory: "lagged_settle_and_hold",
  signal_resonant: "coherent_resonant_oscillation",
  fluid_current: "directional_stream_through",
  dense_structure: "compact_damped_stillness",
  living_material: "soft_irregular_orbit"
});

/**
 * HC022F — Visible Host rhythm foundation
 *
 * A deliberately low-cost, non-progression field of host-material motes.
 * The field exists to make traversal and the Core verbs continuously legible:
 *   Pulse     -> scatter
 *   Absorb    -> draw compatible motes inward and briefly bank them
 *   Stabilize -> organize nearby motes into a calmer local band
 *
 * This system never changes chemistry inventory, gates, routes, objectives,
 * Core growth, authored object coordinates, or verb ranges.
 */
export class AmbientMaterialInteractionSystem {
  constructor({ scene, playerRoot, frameState }) {
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.count = 66;
    this.radius = 4.8;
    this.positions = new Float32Array(this.count * 3);
    this.velocities = Array.from({ length: this.count }, () => new THREE.Vector3());
    this.homePhase = new Float32Array(this.count);
    this.compatible = new Uint8Array(this.count);
    this.bankAge = new Float32Array(this.count);
    this.responseMemory = new Float32Array(this.count);
    this.responseKind = new Uint8Array(this.count); // 0 drift, 1 pulse, 2 absorb, 3 stabilize
    this.ecologyKind = new Uint8Array(this.count); // 0 suspension, 1 current-rider, 2 residue, 3 spores, 4 echo motes, 5 sorting grains
    this.ecologyMemory = new Float32Array(this.count);
    this.ecologyCounts = {
      suspension: 0,
      currentRiders: 0,
      settlingResidue: 0,
      reactiveSpores: 0,
      echoMotes: 0,
      sortingGrains: 0
    };
    this.compatibleCount = 0;
    this.lastMicroDiscovery = "none";
    this.microDiscoveryCount = 0;
    this.lastDiscoveryPulseEventId = -1;
    this.scanReadSeconds = 0;
    this.scanFamily = "none";
    this.scanFinding = "none";
    this.scanNearbyCount = 0;
    this.scanRepresentativeKind = -1;
    this.lastExperimentFamily = "none";
    this.lastExperimentVerb = "none";
    this.lastExperimentResult = "none";
    this.experimentResponseSeconds = 0;
    this.familyVerbSeenMask = new Uint8Array(6); // bits: scan 1, pulse 2, stabilize 4, absorb 8
    this.learnedRelationshipCount = 0;
    this.chainFamily = -1;
    this.chainFirstVerb = "none";
    this.chainWindowSeconds = 0;
    this.lastChainResult = "none";
    this.chainResponseSeconds = 0;
    this.chainDiscoveryCount = 0;
    this.wasStabilizeHeld = false;
    this.wasAbsorbHeld = false;
    this.worldResponseMode = "ambient";
    this.worldResponseIntensity = 0;
    this.worldResponseSeconds = 0;
    this.worldResponseFamily = "none";
    this.worldResponseCause = "none";
    // HC027E: remember presentation-only consequence edges so existing material
    // can answer after Pulse returns / Absorb capture / Stabilize lock without
    // creating gameplay state or a second ambient field.
    this.lastCompositionConsequenceEventId = "none";
    // HC027F: traversal inquiry reads HC027D sonar answer memory and makes the existing
    // Host field locally gather around the remembered answer. No marker geometry is added.
    this.answerMemoryPosition = new THREE.Vector3();
    // HC027J: Signal Plain temporary consequences recruit this same Host mote field.
    this.signalPlainConsequencePosition = new THREE.Vector3();
    this.signalPlainConsequenceDirection = new THREE.Vector3(0.78, 0.04, -0.62).normalize();
    // HC027K: the existing mote field can reveal a relationship between the changed
    // receptor and another existing condition. These vectors support one primary
    // relationship volume without spawning route lines or another particle system.
    this.signalPlainLinkSource = new THREE.Vector3();
    this.signalPlainLinkTarget = new THREE.Vector3();
    this.signalPlainLinkAxis = new THREE.Vector3(0, 0, -1);
    this.signalPlainLinkClosest = new THREE.Vector3();
    this.answerMemoryReadCount = 0;
    this.lastAnswerMemoryReadId = "none";
    this.lastAnswerMemoryReadClass = "none";
    this.basePointSize = 0.045;
    // HC024E: existing Host material is the first generic chemistry-output reader.
    this.hostChemistryDirection = new THREE.Vector3(0, 0, -1);
    this.hostChemistryRadial = new THREE.Vector3();
    this.hostChemistryMemoryColor = new THREE.Color(0xb9a0bd);
    this.hostChemistryRhythmColor = new THREE.Color(0x78e3ff);
    this.hostChemistryPressureColor = new THREE.Color(0xd29b6b);
    this.hostChemistryMixedColor = new THREE.Color(0xd7dbc5);
    this.temp = new THREE.Vector3();
    this.temp2 = new THREE.Vector3();
    this.temp3 = new THREE.Vector3();
    this.lastPulseEventId = -1;
    this.lastPulsePressed = false;
    this.previousPlayerPosition = this.playerRoot.position.clone();
    this.playerTravel = new THREE.Vector3();
    this.interactionAnchorPosition = new THREE.Vector3();
    this.interactionAnchor = { id: "none", position: this.interactionAnchorPosition };

    // Static profile objects avoid allocating a new profile every frame.
    this.profiles = {
      surface: { id:"surface_living_suspension", drift:0.92, damping:1.18, pulseGain:1.04, absorbGain:0.94, stabilizeGain:1.12, verticalBias:0.006, flow:-0.018, ecology:"nursery_suspension", clustering:0.18, settling:0.05, currentBias:0.15 },
      guide: { id:"guide_pressurized_current", drift:0.80, damping:1.52, pulseGain:0.96, absorbGain:0.90, stabilizeGain:1.28, verticalBias:0.002, flow:0.052, ecology:"threshold_current", clustering:0.16, settling:0.04, currentBias:0.34 },
      hub: { id:"hub_junction_chorus", drift:0.72, damping:1.42, pulseGain:1.0, absorbGain:1.0, stabilizeGain:1.08, verticalBias:0.002, flow:0.012, ecology:"junction_chorus", clustering:0.30, settling:0.06, currentBias:0.22 },
      grave: { id:"grave_residue", drift:0.48, damping:2.35, pulseGain:0.72, absorbGain:0.62, stabilizeGain:1.28, verticalBias:-0.055, flow:0, ecology:"grave_settling_residue", clustering:0.34, settling:0.42, currentBias:0.02 },
      vascular: { id:"vascular_suspension", drift:1.22, damping:0.92, pulseGain:1.08, absorbGain:0.90, stabilizeGain:0.82, verticalBias:0, flow:0.16, ecology:"vascular_current_riders", clustering:0.12, settling:0.01, currentBias:0.58 },
      silt: { id:"silt_particulate", drift:0.76, damping:1.65, pulseGain:1.34, absorbGain:1.12, stabilizeGain:1.05, verticalBias:-0.025, flow:0.035, ecology:"silt_particulate_beds", clustering:0.48, settling:0.31, currentBias:0.08 },
      comb: { id:"comb_sorting_filter", drift:0.64, damping:1.78, pulseGain:0.94, absorbGain:1.0, stabilizeGain:1.22, verticalBias:-0.006, flow:0.030, ecology:"sorting_filter_grains", clustering:0.46, settling:0.18, currentBias:0.18 },
      aperture: { id:"aperture_open_field", drift:1.06, damping:1.04, pulseGain:1.10, absorbGain:0.94, stabilizeGain:0.96, verticalBias:0.012, flow:0.048, ecology:"field_suspension", clustering:0.14, settling:0.03, currentBias:0.36 },
      host: { id:"host_suspension", drift:0.86, damping:1.35, pulseGain:1, absorbGain:1, stabilizeGain:1, verticalBias:0, flow:0.02, ecology:"host_suspension", clustering:0.20, settling:0.08, currentBias:0.12 }
    };

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xbcefdc,
      size: this.basePointSize,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, material);
    this.points.name = "ambient_host_material_motes";
    this.points.frustumCulled = false;
    this.points.userData.targetingSuppressed = true;
    this.scene.add(this.points);

    for (let i = 0; i < this.count; i++) {
      const a = i * 2.3999632297;
      const y = -0.85 + ((i * 0.61803398875) % 1) * 2.25;
      const r = 1.15 + ((i * 0.754877666) % 1) * 3.2;
      this.positions[i * 3] = Math.cos(a) * r;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = Math.sin(a) * r;
      this.homePhase[i] = (i * 0.38196601125) % 1;
      this.compatible[i] = i % 4 === 0 ? 1 : 0;
      if (this.compatible[i]) this.compatibleCount += 1;

      const family = i % 17 === 0 ? 4
        : i % 13 === 0 ? 5
        : i % 11 === 0 ? 3
        : i % 5 === 0 ? 2
        : i % 3 === 0 ? 1
        : 0;
      this.ecologyKind[i] = family;
      if (family === 0) this.ecologyCounts.suspension++;
      else if (family === 1) this.ecologyCounts.currentRiders++;
      else if (family === 2) this.ecologyCounts.settlingResidue++;
      else if (family === 3) this.ecologyCounts.reactiveSpores++;
      else if (family === 4) this.ecologyCounts.echoMotes++;
      else if (family === 5) this.ecologyCounts.sortingGrains++;
    }

    frameState.ambientMaterial = {
      active: true,
      count: this.count,
      compatibleCount: this.compatibleCount,
      banked: 0,
      lastResponse: "drift",
      progressionAuthority: false,
      pass: "HC-022F"
    };
  }


  resolveMaterialProfile(frameState) {
    const cellId = String(frameState.activeCellId ?? "");
    if (cellId === "CELL_MEMBRANE_NURSERY_001" || Boolean(frameState.surfaceWakeGameplay?.active)) return this.profiles.surface;
    if (cellId === "CELL_SCAR_FLOW_FOLD_001") return this.profiles.guide;
    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001") return this.profiles.hub;
    if (Boolean(frameState.graveMemoryRoute) || cellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") return this.profiles.grave;
    if (Boolean(frameState.vascularRhythmRoute) || cellId === "CELL_VASCULAR_RHYTHM_ROUTE_001") return this.profiles.vascular;
    if (Boolean(frameState.siltPressureRoute) || cellId === "CELL_SILT_PRESSURE_ROUTE_001") return this.profiles.silt;
    if (cellId === "CELL_COMB_THRESHOLD_FILTER_001") return this.profiles.comb;
    if (cellId === "CELL_APERTURE_FIELDS_ARRIVAL_001") return this.profiles.aperture;
    return this.profiles.host;
  }

  resolveInteractionAnchor(frameState) {
    const assist = frameState.interactionAssist;
    if (!assist?.active || !assist.position) return null;
    const { x, y, z } = assist.position;
    if (![x, y, z].every(Number.isFinite)) return null;
    this.interactionAnchor.id = assist.objectId ?? "interaction_target";
    this.interactionAnchorPosition.set(x, y, z);
    return this.interactionAnchor;
  }

  update(dt, frameState) {
    const safeDt = Math.min(Math.max(dt, 0), 0.05);
    const t = frameState.runtimeSeconds ?? 0;
    const input = frameState.input ?? {};
    const profile = this.resolveMaterialProfile(frameState);
    const coreChemistry = frameState.coreChemistryOutput ?? {};
    const chemistryActive = Boolean(coreChemistry.active && coreChemistry.visualHostResponseEnabled);
    const chemistryMemory = THREE.MathUtils.clamp(coreChemistry.memory ?? 0, 0, 1);
    const chemistryRhythm = THREE.MathUtils.clamp(coreChemistry.rhythm ?? 0, 0, 1);
    const chemistryPressure = THREE.MathUtils.clamp(coreChemistry.pressure ?? 0, 0, 1);
    const chemistrySurface = THREE.MathUtils.clamp(coreChemistry.surfaceExpression ?? 0, 0, 1);
    const chemistryStrength = THREE.MathUtils.clamp((coreChemistry.patternStrength ?? 1) * chemistrySurface, 0, 1.4);
    const chemistryRadius = Math.max(1.4, coreChemistry.responseRadius ?? 3.45);
    const chemistryDirectionality = THREE.MathUtils.clamp(coreChemistry.directionality ?? 0, 0, 1);
    const chemistryWorldDirection = coreChemistry.worldDirection ?? {};
    this.hostChemistryDirection.set(chemistryWorldDirection.x ?? 0, chemistryWorldDirection.y ?? 0, chemistryWorldDirection.z ?? -1);
    if (this.hostChemistryDirection.lengthSq() < 0.0001) this.hostChemistryDirection.set(0, 0, -1);
    else this.hostChemistryDirection.normalize();
    const surfaceLivingState = frameState.nurseryCircuit?.livingState ?? "cautious";
    const livingDriftScale = surfaceLivingState === "panic" ? 1.72
      : surfaceLivingState === "blooming" ? 1.18
      : surfaceLivingState === "growth" ? 1.1
      : surfaceLivingState === "withered" ? 0.46
      : surfaceLivingState === "embrace" ? 0.66
      : 1;
    const livingHostWaveScale = surfaceLivingState === "panic" ? -1.35
      : surfaceLivingState === "blooming" ? 1.2
      : surfaceLivingState === "withered" ? 0.38
      : surfaceLivingState === "embrace" ? 0.62
      : 1;
    const livingDampingScale = surfaceLivingState === "panic" ? 0.76
      : surfaceLivingState === "withered" ? 1.42
      : surfaceLivingState === "embrace" ? 1.24
      : 1;
    const livingOpacityScale = surfaceLivingState === "withered" ? 0.54
      : surfaceLivingState === "panic" ? 1.14
      : surfaceLivingState === "blooming" ? 1.18
      : surfaceLivingState === "growth" ? 1.1
      : surfaceLivingState === "embrace" ? 0.9
      : 1;
    const livingSizeScale = surfaceLivingState === "withered" ? 0.82
      : surfaceLivingState === "panic" ? 1.1
      : surfaceLivingState === "blooming" ? 1.14
      : surfaceLivingState === "growth" ? 1.08
      : 1;
    const hostRhythm = frameState.hostRhythm ?? {};
    const hostBreath = THREE.MathUtils.clamp(hostRhythm.breath ?? 0, -1, 1);
    const hostPressure = THREE.MathUtils.clamp(hostRhythm.pressure ?? 0.5, 0, 1);
    const hostStage = hostRhythm.stage ?? "recover";
    // HC028F: regional composition now shapes the existing Host material field in
    // every built region. This is presentation-only matter behavior; it never
    // changes player movement, collisions, verb authority or route completion.
    const regionalPhysical = frameState.regionalPhysicalEmbodiment ?? {};
    const regionalPhysicalActive = Boolean(regionalPhysical.active);
    const regionalDriftScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.driftScale ?? 1, 0.80, 1.22) : 1;
    const regionalDampingScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.dampingScale ?? 1, 0.82, 1.24) : 1;
    const regionalClusteringScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.clusteringScale ?? 1, 0.82, 1.24) : 1;
    const regionalSettlingScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.settlingScale ?? 1, 0.80, 1.24) : 1;
    const regionalCurrentScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.currentBiasScale ?? 1, 0.82, 1.24) : 1;
    const regionalFieldRadiusScale = regionalPhysicalActive ? THREE.MathUtils.clamp(regionalPhysical.fieldRadiusScale ?? 1, 0.90, 1.18) : 1;
    // HC028M: organism relationship memory may locally recruit this same Host-mote
    // field on the following frame. The ecology bridge only publishes bounded
    // presentation fields; this owner remains the sole mote-motion authority.
    const entityMatterCoupling = frameState.entityLocalMatterCoupling ?? {};
    const entityMatterFields = entityMatterCoupling.active && Array.isArray(entityMatterCoupling.fields)
      ? entityMatterCoupling.fields
      : [];
    // HC028N: completed ecological interactions may leave one faint temporary
    // world-space trace. The residue system publishes directives only; this class
    // remains the sole owner of the same existing 66 Host motes.
    const entityEcologicalResidue = frameState.entityEcologicalResidue ?? {};
    const entityEcologicalResidueFields = entityEcologicalResidue.active && Array.isArray(entityEcologicalResidue.fields)
      ? entityEcologicalResidue.fields
      : [];
    // HC028P: an organism that recognizes another organism's residue may publish one
    // short non-recursive Host-matter reply around its own body. This is consumed
    // here on the following frame; no new particles or environment owner is added.
    const entityEcologicalCrossInfluence = frameState.entityEcologicalCrossInfluence ?? {};
    const entityEcologicalCrossInfluenceFields = entityEcologicalCrossInfluence.active && Array.isArray(entityEcologicalCrossInfluence.fields)
      ? entityEcologicalCrossInfluence.fields
      : [];
    const interactionAnchor = this.resolveInteractionAnchor(frameState);
    const composition = frameState.interactionComposition ?? {};
    const sensory = frameState.coreSensoryResponse ?? {};
    const nearestAnswerMemory = sensory.nearestAnswerMemory ?? null;
    const answerMemoryActive = Boolean(
      nearestAnswerMemory?.position
      && [nearestAnswerMemory.position.x, nearestAnswerMemory.position.y, nearestAnswerMemory.position.z].every(Number.isFinite)
      && (nearestAnswerMemory.remainingSeconds ?? 0) > 0
    );
    if (answerMemoryActive) {
      this.answerMemoryPosition.set(
        nearestAnswerMemory.position.x,
        nearestAnswerMemory.position.y,
        nearestAnswerMemory.position.z
      );
    }
    const answerApproachIntensity = answerMemoryActive
      ? THREE.MathUtils.clamp(nearestAnswerMemory.approachIntensity ?? 0, 0, 1)
      : 0;
    const answerReachClass = answerMemoryActive
      ? (nearestAnswerMemory.reachClass ?? "local_actionable")
      : "none";
    const answerStructuralPresence = answerMemoryActive
      ? THREE.MathUtils.clamp(nearestAnswerMemory.structuralPresence ?? 0, 0, 1)
      : 0;
    const answerResolutionStage = answerMemoryActive
      ? Math.max(1, Math.min(3, nearestAnswerMemory.resolutionStage ?? 1))
      : 0;
    const answerObservationCount = answerMemoryActive
      ? Math.max(1, nearestAnswerMemory.observationCount ?? 1)
      : 0;
    const answerStructuralInterpretation = answerMemoryActive
      ? (nearestAnswerMemory.structuralInterpretation ?? "presence_only")
      : "none";
    const answerResponseClass = answerMemoryActive
      ? (nearestAnswerMemory.responseClass ?? "living_material")
      : "none";
    const answerReplySignature = MATERIAL_REPLY_SIGNATURES[answerResponseClass] ?? MATERIAL_REPLY_SIGNATURES.living_material;
    const answerReadReady = Boolean(answerMemoryActive && nearestAnswerMemory.readReady);
    const signalPlainConsequence = frameState.signalPlainEcology?.persistentLocalConsequence?.nearestActive ?? null;
    const signalPlainConsequenceActive = Boolean(
      frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001"
      && signalPlainConsequence?.active
      && signalPlainConsequence.position
      && [signalPlainConsequence.position.x, signalPlainConsequence.position.y, signalPlainConsequence.position.z].every(Number.isFinite)
    );
    if (signalPlainConsequenceActive) {
      this.signalPlainConsequencePosition.set(
        signalPlainConsequence.position.x,
        signalPlainConsequence.position.y,
        signalPlainConsequence.position.z
      );
    }
    const signalPlainConsequenceIntensity = signalPlainConsequenceActive
      ? THREE.MathUtils.clamp(signalPlainConsequence.intensity ?? 0, 0, 1)
      : 0;
    const signalPlainConsequenceBehavior = signalPlainConsequenceActive
      ? (signalPlainConsequence.materialBehavior ?? "none")
      : "none";
    const signalPlainNextQuestion = frameState.signalPlainEcology?.consequenceNextQuestion?.primary ?? null;
    const signalPlainNextQuestionActive = Boolean(
      frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001"
      && signalPlainNextQuestion?.active
      && signalPlainNextQuestion.sourcePosition
      && signalPlainNextQuestion.targetPosition
      && [signalPlainNextQuestion.sourcePosition.x, signalPlainNextQuestion.sourcePosition.y, signalPlainNextQuestion.sourcePosition.z,
        signalPlainNextQuestion.targetPosition.x, signalPlainNextQuestion.targetPosition.y, signalPlainNextQuestion.targetPosition.z].every(Number.isFinite)
    );
    let signalPlainLinkLength = 0;
    if (signalPlainNextQuestionActive) {
      this.signalPlainLinkSource.set(
        signalPlainNextQuestion.sourcePosition.x, signalPlainNextQuestion.sourcePosition.y, signalPlainNextQuestion.sourcePosition.z
      );
      this.signalPlainLinkTarget.set(
        signalPlainNextQuestion.targetPosition.x, signalPlainNextQuestion.targetPosition.y, signalPlainNextQuestion.targetPosition.z
      );
      this.signalPlainLinkAxis.copy(this.signalPlainLinkTarget).sub(this.signalPlainLinkSource);
      signalPlainLinkLength = this.signalPlainLinkAxis.length();
      if (signalPlainLinkLength > 0.001) this.signalPlainLinkAxis.multiplyScalar(1 / signalPlainLinkLength);
      else this.signalPlainLinkAxis.set(0, 0, -1);
    }
    const signalPlainNextQuestionStrength = signalPlainNextQuestionActive
      ? THREE.MathUtils.clamp(signalPlainNextQuestion.strength ?? 0, 0, 1)
      : 0;
    const signalPlainNextQuestionBehavior = signalPlainNextQuestionActive
      ? (signalPlainNextQuestion.materialBehavior ?? "none")
      : "none";
    const ambientSuppression = Math.min(0.88, Math.max(0, composition.ambientSuppression ?? 0));
    const rhythmScale = Math.min(1.18, Math.max(0.62, composition.ambientRhythmScale ?? 1));
    const worldNoticeLift = Math.min(0.24, Math.max(0, composition.worldNoticeLift ?? 0));
    const presentationOpacityScale = Math.min(
      1.16,
      Math.max(0.10, (1 - ambientSuppression) * rhythmScale + worldNoticeLift * 0.28)
    );
    const presentationSizeScale = Math.min(
      1.14,
      Math.max(0.72, 1 - ambientSuppression * 0.28 + worldNoticeLift * 0.30)
    );

    this.playerTravel.copy(this.playerRoot.position).sub(this.previousPlayerPosition);
    const travelDistance = this.playerTravel.length();
    if (travelDistance > 0.0001) this.playerTravel.normalize();
    this.previousPlayerPosition.copy(this.playerRoot.position);
    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : -1;
    const pulseTriggered = Boolean(input.pulsePressed) && (!this.lastPulsePressed || pulseEventId !== this.lastPulseEventId);
    this.lastPulsePressed = Boolean(input.pulsePressed);
    if (pulseEventId !== -1) this.lastPulseEventId = pulseEventId;

    const absorbHeld = Boolean(input.absorbHeld);
    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    // HC029B: a retained Stabilize relationship gets the focused coherence read.
    // The surrounding Host still answers, but at lower amplitude so ambient matter
    // does not visually compete with the intentional target relationship.
    const relationshipStabilizeActive = Boolean(
      stabilizeHeld
      && frameState.targeting?.relationshipActive
      && (frameState.targeting?.relationshipVerbs ?? []).includes("stabilize")
      && frameState.targeting?.relationshipTargetId !== "none"
    );
    const ambientStabilizeScale = relationshipStabilizeActive ? 0.38 : 1;
    // HC028D2: Pulse is the outward inquiry/read verb. A is reserved for deliberate commitment.
    const inquiryTriggered = pulseTriggered;
    let banked = 0;
    let nearestDistance = Infinity;
    let responsiveNearby = 0;
    let rememberedResponses = 0;
    let ecologyRemembering = 0;
    let echoNearby = 0;
    let sortingNearby = 0;
    let scanNearbyCount = 0;
    let scanRepresentativeKind = -1;
    let scanRepresentativeDistance = Infinity;

    for (let i = 0; i < this.count; i++) {
      const k = i * 3;
      this.temp.set(this.positions[k], this.positions[k + 1], this.positions[k + 2]);
      const velocity = this.velocities[i];

      this.temp2.copy(this.temp).sub(this.playerRoot.position);
      let distance = this.temp2.length();
      nearestDistance = Math.min(nearestDistance, distance);

      // HC017E: the Core itself has a small physical wake. Nearby suspension
      // gives way as the player travels, making traversal feel embodied.
      if (distance < 0.78 && distance > 0.001) {
        this.temp2.normalize();
        const proximity = 1 - distance / 0.78;
        velocity.addScaledVector(this.temp2, safeDt * proximity * 1.25);
        if (travelDistance > 0.001) {
          velocity.addScaledVector(this.playerTravel, safeDt * proximity * 0.42);
        }
      }

      if (pulseTriggered && distance < 4.25) {
        if (distance < 0.001) this.temp2.set(0.1, 0.05, -1);
        this.temp2.normalize();
        velocity.addScaledVector(
          this.temp2,
          (1.15 + (4.25 - distance) * 0.18) * profile.pulseGain
        );
        this.responseMemory[i] = Math.max(this.responseMemory[i], 1);
        this.responseKind[i] = 1;

        // Echo motes answer Pulse after the initial scatter rather than simply
        // behaving like another particle. No extra mesh/event system is created.
        if (this.ecologyKind[i] === 4) {
          echoNearby++;
          this.ecologyMemory[i] = 1;
        }
      }

      if (absorbHeld && this.compatible[i] && distance < 2.4) {
        if (distance > 0.001) {
          this.temp2.multiplyScalar(-1 / distance);
          velocity.addScaledVector(
            this.temp2,
            safeDt * (2.0 + (2.4 - distance) * 1.1) * profile.absorbGain
          );
          this.responseMemory[i] = Math.max(this.responseMemory[i], 0.82);
          this.responseKind[i] = 2;
        }
        if (distance < 0.34) {
          this.bankAge[i] = Math.min(1, this.bankAge[i] + safeDt * 2.8);
          banked++;
          const orbit = t * 2.2 + i * 1.7;
          this.temp.set(
            this.playerRoot.position.x + Math.cos(orbit) * 0.28,
            this.playerRoot.position.y + 0.08 + Math.sin(orbit * 1.3) * 0.12,
            this.playerRoot.position.z + Math.sin(orbit) * 0.28
          );
          velocity.multiplyScalar(0.7);
        }
      } else {
        this.bankAge[i] = Math.max(0, this.bankAge[i] - safeDt * 1.8);
      }

      // Existing interaction-assist truth lightly biases a handful of motes
      // around the nearby object. This is world-space signposting, not a marker
      // and not a new targeting or range rule.
      if (interactionAnchor && i % 6 === 0) {
        this.temp2.copy(interactionAnchor.position).sub(this.temp);
        const anchorDistance = this.temp2.length();
        if (anchorDistance < 3.2 && anchorDistance > 0.08) {
          const phase = t * 0.33 + i * 1.17;
          this.temp3.set(
            -this.temp2.z,
            Math.sin(phase) * 0.12,
            this.temp2.x
          );
          if (this.temp3.lengthSq() > 0.0001) this.temp3.normalize();

          velocity.addScaledVector(
            this.temp2.normalize(),
            safeDt * 0.18 * (1 - anchorDistance / 3.2)
          );
          velocity.addScaledVector(this.temp3, safeDt * 0.10);
        }
      }

      // HC027G: the remembered answer now carries a material-specific reply grammar.
      // The same existing motes express every class; no marker mesh, target object,
      // new particle field, route authority, or gameplay modifier is created.
      if (answerMemoryActive && (answerApproachIntensity > 0.02 || answerStructuralPresence > 0.02) && i % 3 === 0) {
        this.temp3.copy(this.answerMemoryPosition).sub(this.temp);
        const answerDistance = this.temp3.length();
        const replyRadius = answerReachClass === "deep_structural" ? 4.20 : 2.85;
        if (answerDistance < replyRadius && answerDistance > 0.06) {
          const localStrength = (1 - answerDistance / replyRadius)
            * (answerReachClass === "deep_structural" ? answerStructuralPresence * 0.72 : Math.min(1, answerApproachIntensity * 1.28));
          this.temp3.normalize();

          if (answerReachClass === "deep_structural") {
            // HC027J1: deep returns are deliberately broad/ghosted. HC027L1 makes
            // repeat reads increase structural resolution: first presence, then
            // layering, then the relationship through intervening Host volume.
            const stageLift = Math.max(0, answerResolutionStage - 1);
            const deepWave = Math.sin(t * (1.05 - stageLift * 0.08) - answerDistance * (1.35 - stageLift * 0.16) + this.homePhase[i] * 2.4);
            velocity.addScaledVector(this.temp3, safeDt * (0.09 + stageLift * 0.025) * localStrength * deepWave);
            velocity.y += deepWave * safeDt * (0.045 + stageLift * 0.012) * localStrength;
            if (answerResolutionStage >= 2) {
              // Stage 2 introduces a tangential layer read rather than a brighter point.
              this.temp2.set(-this.temp3.z, 0, this.temp3.x);
              if (this.temp2.lengthSq() > 0.0001) {
                this.temp2.normalize();
                const layerShear = Math.sin(t * 0.82 + answerDistance * 0.72 + this.homePhase[i] * 1.4);
                velocity.addScaledVector(this.temp2, safeDt * 0.075 * localStrength * layerShear);
              }
            }
            if (answerResolutionStage >= 3) {
              // Stage 3 settles into a slower coherent band across the volume: the
              // information now reads as structural relation, not an unreachable target.
              const structuralBand = Math.sin(t * 0.58 - answerDistance * 0.48 + this.homePhase[i]);
              velocity.y += structuralBand * safeDt * 0.055 * localStrength;
              velocity.multiplyScalar(Math.exp(-safeDt * 0.22 * localStrength));
            } else {
              velocity.multiplyScalar(Math.exp(-safeDt * 0.12 * localStrength));
            }
          } else if (answerResponseClass === "host_membrane") {
            // A membrane reads as an enclosing surface: broad tangential flow
            // wraps around the answer instead of collapsing into a point.
            velocity.addScaledVector(this.temp3, safeDt * 0.12 * localStrength);
            this.temp2.set(-this.temp3.z, Math.sin(t * 1.55 + i * 0.19) * 0.08, this.temp3.x);
            if (this.temp2.lengthSq() > 0.0001) {
              this.temp2.normalize();
              velocity.addScaledVector(this.temp2, safeDt * 0.27 * localStrength);
            }
          } else if (answerResponseClass === "living_seed") {
            // Living seed matter clusters, then breathes back out around the returned point.
            const seedBreath = 0.68 + 0.32 * Math.sin(t * 3.15 + this.homePhase[i] * Math.PI * 2);
            velocity.addScaledVector(this.temp3, safeDt * 0.39 * localStrength * seedBreath);
            velocity.y += Math.sin(t * 2.45 + i * 0.31) * safeDt * 0.075 * localStrength;
          } else if (answerResponseClass === "scar_memory") {
            // Scar/residue holds the disturbance: motion damps, settles and answers late.
            const scarLag = 0.58 + 0.42 * Math.sin(t * 1.18 - this.homePhase[i] * 1.7);
            velocity.multiplyScalar(Math.exp(-safeDt * 0.78 * localStrength));
            velocity.addScaledVector(this.temp3, safeDt * 0.13 * localStrength * scarLag);
            velocity.y -= safeDt * 0.055 * localStrength;
          } else if (answerResponseClass === "signal_resonant") {
            // Signal-bearing material answers coherently: nearby motes share a clean phase.
            const signalWave = Math.sin(t * 6.1 + (hostRhythm.normalizedPhase ?? 0) * Math.PI * 2);
            velocity.addScaledVector(this.temp3, safeDt * 0.23 * localStrength * signalWave);
            velocity.y += signalWave * safeDt * 0.085 * localStrength;
          } else if (answerResponseClass === "fluid_current") {
            // Fluid/current material streams through the answer instead of orbiting it.
            this.temp2.set(0.68, 0.10 * Math.sin(t * 1.8), -0.73);
            this.temp2.normalize();
            velocity.addScaledVector(this.temp2, safeDt * 0.31 * localStrength);
            velocity.addScaledVector(this.temp3, safeDt * 0.10 * localStrength);
          } else if (answerResponseClass === "dense_structure") {
            // Dense matter becomes compact and still: local motion damps into a hard read.
            velocity.multiplyScalar(Math.exp(-safeDt * 2.15 * localStrength));
            velocity.addScaledVector(this.temp3, safeDt * 0.20 * localStrength);
            velocity.y += ((this.answerMemoryPosition.y - this.temp.y) * safeDt * 0.18 * localStrength);
          } else {
            // Generic living material remains soft and irregular rather than machine-precise.
            velocity.addScaledVector(this.temp3, safeDt * 0.20 * localStrength);
            this.temp2.set(
              -this.temp3.z,
              0.18 * Math.sin(t * 2.35 + i * 0.73),
              this.temp3.x
            );
            if (this.temp2.lengthSq() > 0.0001) {
              this.temp2.normalize();
              velocity.addScaledVector(this.temp2, safeDt * 0.14 * localStrength);
            }
          }
        }
      }

      // HC027J: a successful Signal Plain experiment temporarily changes how the
      // already-existing Host suspension behaves around that receptor. This is a
      // bounded physical aftermath, not a new particle field or progression state.
      if (signalPlainConsequenceActive && signalPlainConsequenceIntensity > 0.02 && i % 2 === 0) {
        this.temp3.copy(this.signalPlainConsequencePosition).sub(this.temp);
        const consequenceDistance = this.temp3.length();
        if (consequenceDistance < 2.85 && consequenceDistance > 0.06) {
          const local = (1 - consequenceDistance / 2.85) * signalPlainConsequenceIntensity;
          this.temp3.normalize();
          if (signalPlainConsequenceBehavior === "directional_afterflow") {
            velocity.addScaledVector(this.signalPlainConsequenceDirection, safeDt * 0.52 * local);
            velocity.addScaledVector(this.temp3, safeDt * 0.08 * local);
            velocity.y += Math.sin(t * 1.45 + i * 0.21) * safeDt * 0.045 * local;
          } else if (signalPlainConsequenceBehavior === "sustained_resonant_cadence") {
            const cadence = Math.sin(t * 2.42 + (hostRhythm.normalizedPhase ?? 0) * Math.PI * 2);
            velocity.addScaledVector(this.temp3, safeDt * 0.30 * local * cadence);
            velocity.y += cadence * safeDt * 0.07 * local;
            velocity.multiplyScalar(Math.exp(-safeDt * 0.34 * local));
          } else if (signalPlainConsequenceBehavior === "locally_synchronized_stillness") {
            velocity.multiplyScalar(Math.exp(-safeDt * 2.85 * local));
            const phase = this.homePhase[i] * Math.PI * 2;
            this.temp2.set(
              this.signalPlainConsequencePosition.x + Math.cos(phase) * (0.74 + this.homePhase[i] * 0.64),
              this.signalPlainConsequencePosition.y + (this.homePhase[i] - 0.5) * 0.72,
              this.signalPlainConsequencePosition.z + Math.sin(phase) * (0.74 + this.homePhase[i] * 0.64)
            ).sub(this.temp);
            velocity.addScaledVector(this.temp2, safeDt * 0.58 * local);
          }
          this.responseMemory[i] = Math.max(this.responseMemory[i], 0.46 + local * 0.34);
        }
      }

      // HC027K: reveal a relationship through a broad volume of the existing Host
      // suspension. This is intentionally not a straight glowing line: only motes
      // already near the source→target volume participate, and each relationship
      // uses a different physical behavior.
      if (signalPlainNextQuestionActive && signalPlainNextQuestionStrength > 0.02 && signalPlainLinkLength > 0.15 && i % 3 === 1) {
        this.temp2.copy(this.temp).sub(this.signalPlainLinkSource);
        const projection = THREE.MathUtils.clamp(this.temp2.dot(this.signalPlainLinkAxis), 0, signalPlainLinkLength);
        const progress = projection / signalPlainLinkLength;
        this.signalPlainLinkClosest.copy(this.signalPlainLinkSource).addScaledVector(this.signalPlainLinkAxis, projection);
        this.temp3.copy(this.signalPlainLinkClosest).sub(this.temp);
        const lateralDistance = this.temp3.length();
        const linkRadius = 1.48;
        if (lateralDistance < linkRadius) {
          const local = (1 - lateralDistance / linkRadius) * signalPlainNextQuestionStrength;
          if (signalPlainNextQuestionBehavior === "braided_afterflow_breaks_at_slip") {
            velocity.addScaledVector(this.signalPlainLinkAxis, safeDt * 0.34 * local);
            if (lateralDistance > 0.04) {
              this.temp3.normalize();
              const breakaway = Math.max(0, (progress - 0.56) / 0.44) * Math.sin(t * 2.1 + i * 0.47);
              velocity.addScaledVector(this.temp3, safeDt * 0.22 * local * breakaway);
            }
          } else if (signalPlainNextQuestionBehavior === "resonance_entrains_breathing_volume") {
            const wave = Math.sin(t * 2.42 - progress * Math.PI * 2.2);
            velocity.addScaledVector(this.signalPlainLinkAxis, safeDt * 0.20 * local * wave);
            if (lateralDistance > 0.04) velocity.addScaledVector(this.temp3.normalize(), safeDt * 0.13 * local * (0.5 + 0.5 * wave));
          } else if (signalPlainNextQuestionBehavior === "coherence_band_exposes_resonant_gap") {
            const call = Math.max(0, Math.sin(t * 3.15 - progress * 1.2));
            velocity.multiplyScalar(Math.exp(-safeDt * 0.72 * local * (1 - call * 0.55)));
            velocity.addScaledVector(this.signalPlainLinkAxis, safeDt * 0.16 * local * call);
            if (lateralDistance > 0.04) velocity.addScaledVector(this.temp3.normalize(), safeDt * 0.10 * local * (1 - call));
          }
          this.responseMemory[i] = Math.max(this.responseMemory[i], 0.40 + local * 0.30);
        }
      }

      if (stabilizeHeld && distance < 2.25) {
        const phase = this.homePhase[i] * Math.PI * 2 + t * 0.16;
        const targetRadius = 0.72 + this.homePhase[i] * 0.8;
        this.temp2.set(
          this.playerRoot.position.x + Math.cos(phase) * targetRadius,
          this.playerRoot.position.y - 0.15 + (this.homePhase[i] - 0.5) * 0.85,
          this.playerRoot.position.z + Math.sin(phase) * targetRadius
        ).sub(this.temp);
        velocity.addScaledVector(this.temp2, safeDt * 1.55 * profile.stabilizeGain * ambientStabilizeScale);
        velocity.multiplyScalar(Math.exp(-safeDt * 4.5 * profile.stabilizeGain * ambientStabilizeScale));
        this.responseMemory[i] = Math.max(this.responseMemory[i], relationshipStabilizeActive ? 0.52 : 0.92);
        this.responseKind[i] = 3;
        if (this.ecologyKind[i] === 5) {
          sortingNearby++;
          // Sorting grains settle into one of three density bands while held.
          const band = (i % 3) - 1;
          const targetY = this.playerRoot.position.y + band * 0.28;
          velocity.y += (targetY - this.temp.y) * safeDt * 1.45;
          this.ecologyMemory[i] = Math.max(this.ecologyMemory[i], 0.92);
        }
      }

      // HC019D: small verb consequences persist long enough to be seen while
      // traversing away from the exact interaction point. This is visual/physical
      // memory only and never enters inventory, objectives, chemistry, or gates.
      if (this.responseMemory[i] > 0.001) {
        this.responseMemory[i] = Math.max(0, this.responseMemory[i] - safeDt * 0.34);
        rememberedResponses++;
        if (this.responseKind[i] === 1) {
          // Pulse leaves a readable expanding/ringing wake instead of an
          // instantaneous shove that disappears before the eye can parse it.
          velocity.multiplyScalar(Math.exp(-safeDt * 0.24));
          const ringPhase = t * 4.1 + this.homePhase[i] * Math.PI * 2;
          velocity.y += Math.sin(ringPhase) * safeDt * 0.055 * this.responseMemory[i];
        } else if (this.responseKind[i] === 2) {
          // Absorb memory curls inward around the Core: incorporation has a
          // visibly different trajectory from Pulse's outward disturbance.
          const orbit = t * 1.05 + i * 0.91;
          velocity.x += Math.cos(orbit) * safeDt * 0.070 * this.responseMemory[i];
          velocity.z += Math.sin(orbit) * safeDt * 0.070 * this.responseMemory[i];
          velocity.y += Math.sin(orbit * 0.63) * safeDt * 0.028 * this.responseMemory[i];
        } else if (this.responseKind[i] === 3) {
          // Stabilize produces calm/ordering rather than simply "less motion".
          velocity.multiplyScalar(Math.exp(-safeDt * 1.65 * this.responseMemory[i]));
          const settleBand = ((i % 3) - 1) * 0.018;
          velocity.y += settleBand * safeDt * this.responseMemory[i];
        }
      } else {
        this.responseKind[i] = 0;
      }

      if (distance < 2.8) responsiveNearby++;

      // Scan/Interact READS nearby ecology without changing it. Detection is
      // folded into this existing loop: no second particle scan or raycast.
      if (distance < 2.65) {
        scanNearbyCount++;
        if (distance < scanRepresentativeDistance) {
          scanRepresentativeDistance = distance;
          scanRepresentativeKind = this.ecologyKind[i];
        }
      }

      // HC021B: motes are a tiny ecology, not collectible confetti.
      // They reuse the verbs already learned in HC021A and never grant inventory/progression.
      const ecologyKind = this.ecologyKind[i];
      const ecologyPhase = t * 0.28 + i * 0.73;
      if (ecologyKind === 1) {
        // Current-riders align into short-lived flow streaks, strongest in Vascular.
        velocity.z += safeDt * profile.currentBias * regionalCurrentScale * (0.08 + 0.07 * Math.sin(ecologyPhase));
        velocity.x += safeDt * profile.currentBias * regionalCurrentScale * Math.sin(ecologyPhase * 0.61) * 0.025;
      } else if (ecologyKind === 2) {
        // Residue slowly settles; Grave/Silt therefore accumulate visual "weight".
        velocity.y -= safeDt * profile.settling * regionalSettlingScale * 0.085;
        velocity.x *= Math.exp(-safeDt * profile.settling * regionalSettlingScale * 0.7);
        velocity.z *= Math.exp(-safeDt * profile.settling * regionalSettlingScale * 0.7);
      } else if (ecologyKind === 3) {
        // Reactive spores form loose local clusters until a verb disturbs them.
        const clusterR = 0.32 + (i % 4) * 0.07;
        this.temp2.set(
          this.playerRoot.position.x + Math.cos(ecologyPhase) * (1.25 + clusterR),
          this.playerRoot.position.y + Math.sin(ecologyPhase * 1.31) * 0.42,
          this.playerRoot.position.z + Math.sin(ecologyPhase) * (1.25 + clusterR)
        ).sub(this.temp);
        velocity.addScaledVector(this.temp2, safeDt * profile.clustering * regionalClusteringScale * 0.18);
      } else if (ecologyKind === 4 && this.ecologyMemory[i] > 0.08) {
        // Echo motes briefly answer a Pulse by returning toward their pre-scatter
        // local neighborhood. The delayed answer teaches Pulse as communication.
        this.temp2.copy(this.playerRoot.position).sub(this.temp);
        const echoPhase = THREE.MathUtils.clamp((1 - this.responseMemory[i]) * 1.6, 0, 1);
        if (echoPhase > 0.28) {
          velocity.addScaledVector(this.temp2, safeDt * 0.055 * echoPhase);
          velocity.y += Math.sin(t * 5.2 + i) * safeDt * 0.025 * echoPhase;
        }
      } else if (ecologyKind === 5) {
        // Sorting grains naturally prefer shallow density bands, becoming much
        // more obvious when Stabilize reinforces that ordering.
        const band = (i % 3) - 1;
        const bandY = this.playerRoot.position.y + band * 0.28;
        velocity.y += (bandY - this.temp.y) * safeDt * 0.035 * profile.clustering * regionalClusteringScale;
      }

      // A recent verb response leaves a short ecological after-effect:
      // scattered motes remain loose, absorbed motes orbit briefly, stabilized motes settle/order.
      if (this.responseMemory[i] > 0.05) {
        this.ecologyMemory[i] = Math.max(this.ecologyMemory[i], this.responseMemory[i]);
      } else {
        this.ecologyMemory[i] = Math.max(0, this.ecologyMemory[i] - safeDt * 0.22);
      }
      if (this.ecologyMemory[i] > 0.05) ecologyRemembering++;

      // HC022F: one visible Host pressure wave passes through existing matter.
      // It is presentation-only for now: enough to see while standing still,
      // but far below player movement/verb authority.
      this.temp2.copy(this.playerRoot.position).sub(this.temp);
      const hostDistance = Math.max(0.45, this.temp2.length());
      this.temp2.multiplyScalar(1 / hostDistance);
      const hostWave = hostStage === "release" ? -0.090 * (0.55 + hostPressure * 0.45)
        : hostStage === "gather" ? 0.060 * (0.45 + hostPressure * 0.55)
        : hostStage === "swell" ? 0.026 : -0.018;
      velocity.addScaledVector(this.temp2, safeDt * hostWave * livingHostWaveScale * (0.72 + (i % 5) * 0.07));
      velocity.y += Math.sin(t * 0.62 + this.homePhase[i] * Math.PI * 2) * safeDt * 0.014 * livingDriftScale * (0.35 + Math.abs(hostBreath));

      // HC024E: the Core's membrane-exposed chemistry makes the existing Host
      // material answer without a new button press, geometry, gate, or movement rule.
      if (chemistryActive && chemistryStrength > 0.01) {
        this.hostChemistryRadial.copy(this.temp).sub(this.playerRoot.position);
        const chemistryDistance = Math.max(0.001, this.hostChemistryRadial.length());
        if (chemistryDistance <= chemistryRadius) {
          this.hostChemistryRadial.multiplyScalar(1 / chemistryDistance);
          const directionalDot = THREE.MathUtils.clamp(this.hostChemistryRadial.dot(this.hostChemistryDirection), -1, 1);
          const directionalWeight = THREE.MathUtils.lerp(1, Math.max(0, directionalDot), chemistryDirectionality);
          const proximity = 1 - THREE.MathUtils.clamp(chemistryDistance / chemistryRadius, 0, 1);
          const chemistryWeight = chemistryStrength * proximity * directionalWeight;

          // Grave / Residue Sense: delayed echo matter gathers into a readable
          // answering drift, with weaker sympathetic motion in other material.
          if (chemistryMemory > 0.01) {
            const echoAffinity = ecologyKind === 4 ? 1 : ecologyKind === 2 ? 0.42 : 0.14;
            const echoBeat = 0.35 + 0.65 * Math.sin(t * 3.15 + i * 0.19);
            velocity.addScaledVector(this.hostChemistryRadial, safeDt * chemistryWeight * chemistryMemory * echoAffinity * echoBeat * 0.17);
          }

          // Vascular / Signal Skin: nearby material takes on one shared cadence
          // instead of receiving another player-triggered pulse.
          if (chemistryRhythm > 0.01) {
            const cadence = Math.sin(t * 5.25);
            velocity.addScaledVector(this.hostChemistryRadial, safeDt * chemistryWeight * chemistryRhythm * cadence * 0.23);
            if (ecologyKind === 1) velocity.y += cadence * safeDt * chemistryWeight * chemistryRhythm * 0.055;
          }

          // Silt / Adhesion Skin: existing residue and grains settle toward a
          // soft shell around the Core. This is visual contact language only;
          // it does not alter player collision or locomotion.
          if (chemistryPressure > 0.01) {
            const shellRadius = 1.28 + (1 - chemistryPressure) * 0.24;
            const shellError = chemistryDistance - shellRadius;
            const settleAffinity = ecologyKind === 2 || ecologyKind === 5 ? 1 : 0.34;
            velocity.addScaledVector(this.hostChemistryRadial, -shellError * safeDt * chemistryWeight * chemistryPressure * settleAffinity * 0.42);
          }
        }
      }

      // HC028F: the regional sentence is embodied by this already-existing
      // material. Biases are intentionally small and have no player authority.
      if (regionalPhysicalActive) {
        this.temp2.copy(this.temp).sub(this.playerRoot.position);
        const regionDistance = this.temp2.length();
        if (regionDistance > 0.001) {
          this.temp2.multiplyScalar(1 / regionDistance);
          velocity.addScaledVector(this.temp2, safeDt * (regionalPhysical.radialBias ?? 0) * (0.72 + (i % 5) * 0.07));
          this.temp3.set(-this.temp2.z, 0, this.temp2.x);
          if (this.temp3.lengthSq() > 0.0001) {
            this.temp3.normalize();
            velocity.addScaledVector(this.temp3, safeDt * (regionalPhysical.tangentialBias ?? 0) * (0.68 + (i % 4) * 0.08));
          }
        }
        velocity.y += safeDt * (regionalPhysical.verticalBias ?? 0);
        velocity.z += safeDt * (regionalPhysical.flowBias ?? 0);
      }

      // HC028M1: the ecological consequence is now staged and spatially gathered so
      // the player can read the causal order: organism first, then local Host matter.
      // This still uses only the existing 66 motes and never writes to player/entity
      // movement, collision, chemistry, routes, or progression.
      for (let fieldIndex = 0; fieldIndex < entityMatterFields.length; fieldIndex += 1) {
        const field = entityMatterFields[fieldIndex];
        const fieldPosition = field?.position;
        const fieldRadius = Math.max(0, Number(field?.radius ?? 0));
        const fieldStrength = THREE.MathUtils.clamp(Number(field?.strength01 ?? 0), 0, 1);
        if (
          fieldStrength <= 0.01
          || fieldRadius <= 0.05
          || !fieldPosition
          || ![fieldPosition.x, fieldPosition.y, fieldPosition.z].every(Number.isFinite)
        ) continue;

        this.temp3.set(
          this.temp.x - fieldPosition.x,
          this.temp.y - fieldPosition.y,
          this.temp.z - fieldPosition.z
        );
        const fieldDistance = this.temp3.length();
        if (fieldDistance >= fieldRadius || fieldDistance <= 0.001) continue;

        const local01 = 1 - fieldDistance / fieldRadius;
        this.temp3.multiplyScalar(1 / fieldDistance); // entity -> mote

        // A deterministic local cohort keeps the organism consequence readable as a
        // pocket within the broader regional field instead of moving every mote alike.
        const cohortBias = THREE.MathUtils.clamp(Number(field.localCohortBias ?? 0.74), 0.35, 1);
        const cohortPrimary = ((i + fieldIndex * 2) % 3) === 0;
        const cohortWeight = cohortPrimary ? 1 : (1 - cohortBias) * 0.42 + 0.10;
        const localWeight = local01 * cohortWeight;

        // HC028M1 birth/expression/decay: recruit a subset of existing motes toward a
        // soft shell around the organism. The shell is strongest during the answer,
        // stable during expression, and loosens naturally as reciprocal memory decays.
        const anchorRadius = Math.max(0.12, Number(field.anchorRadius ?? fieldRadius * 0.38));
        const anchorTightness = Math.max(0, Number(field.anchorTightness ?? 0.52));
        const shellError = fieldDistance - anchorRadius;
        const stage = field.causalStage ?? "expressing";
        const stageTightness = stage === "answering" ? 1.24 : stage === "forming" ? 0.58 : stage === "releasing" ? 0.72 : 1;
        const shellGain = anchorTightness * stageTightness * fieldStrength * localWeight;
        velocity.addScaledVector(this.temp3, -shellError * safeDt * shellGain * 0.72);

        const phase = t * Math.max(0.05, Number(field.oscillationRate ?? 1))
          + Number(field.phaseOffset ?? 0)
          + this.homePhase[i] * Math.PI * 2;
        const breath = Math.sin(phase) * Number(field.breathAmplitude ?? 0);
        const radial = Number(field.radialBias ?? 0) + breath;
        velocity.addScaledVector(this.temp3, safeDt * radial * fieldStrength * localWeight);

        this.temp2.set(-this.temp3.z, 0, this.temp3.x);
        if (this.temp2.lengthSq() > 0.0001) {
          this.temp2.normalize();
          velocity.addScaledVector(
            this.temp2,
            safeDt * Number(field.tangentialBias ?? 0) * fieldStrength * localWeight
          );
        }

        velocity.y += safeDt * Number(field.verticalBias ?? 0) * fieldStrength * localWeight;
        const dampingBias = Math.max(0, Number(field.dampingBias ?? 0));
        if (dampingBias > 0) {
          velocity.multiplyScalar(Math.exp(-safeDt * dampingBias * fieldStrength * localWeight));
        }
      }


      // HC028P: another organism's residue may provoke one brief Host-matter answer
      // around the recognizing organism. The field follows that organism for only the
      // short response window and is explicitly ineligible for HC028N residue, so this
      // cannot recursively echo forever. It still uses only the existing 66 motes.
      for (let crossIndex = 0; crossIndex < entityEcologicalCrossInfluenceFields.length; crossIndex += 1) {
        const cross = entityEcologicalCrossInfluenceFields[crossIndex];
        const crossPosition = cross?.position;
        const crossRadius = Math.max(0, Number(cross?.radius ?? 0));
        const crossStrength = THREE.MathUtils.clamp(Number(cross?.strength01 ?? 0), 0, 0.34);
        if (
          crossStrength <= 0.006
          || crossRadius <= 0.05
          || !crossPosition
          || ![crossPosition.x, crossPosition.y, crossPosition.z].every(Number.isFinite)
        ) continue;

        this.temp3.set(
          this.temp.x - crossPosition.x,
          this.temp.y - crossPosition.y,
          this.temp.z - crossPosition.z
        );
        const crossDistance = this.temp3.length();
        if (crossDistance >= crossRadius || crossDistance <= 0.001) continue;
        const local01 = 1 - crossDistance / crossRadius;
        this.temp3.multiplyScalar(1 / crossDistance);

        // A sparse deterministic cohort keeps the reply readable as organism-scale
        // communication rather than turning the whole regional field into an aura.
        const cohortPrimary = ((i + crossIndex * 5) % 3) === 0;
        const cohortBias = THREE.MathUtils.clamp(Number(cross.localCohortBias ?? 0.86), 0.68, 1);
        const cohortWeight = cohortPrimary ? 1 : (1 - cohortBias) * 0.28 + 0.04;
        const localWeight = local01 * cohortWeight;

        const anchorRadius = Math.max(0.12, Number(cross.anchorRadius ?? crossRadius * 0.40));
        const anchorTightness = Math.max(0, Number(cross.anchorTightness ?? 0.60));
        const shellError = crossDistance - anchorRadius;
        const stage = cross.causalStage ?? "expressing";
        const stageGain = stage === "answering" ? 0.78 : stage === "releasing" ? 0.58 : 1;
        velocity.addScaledVector(
          this.temp3,
          -shellError * safeDt * anchorTightness * crossStrength * localWeight * stageGain * 0.58
        );

        const phase = t * Math.max(0.05, Number(cross.oscillationRate ?? 1))
          + Number(cross.phaseOffset ?? 0)
          + this.homePhase[i] * Math.PI * 2;
        const breath = Math.sin(phase) * Number(cross.breathAmplitude ?? 0);
        velocity.addScaledVector(
          this.temp3,
          safeDt * (Number(cross.radialBias ?? 0) + breath) * crossStrength * localWeight * 0.72
        );

        this.temp2.set(-this.temp3.z, 0, this.temp3.x);
        if (this.temp2.lengthSq() > 0.0001) {
          this.temp2.normalize();
          velocity.addScaledVector(
            this.temp2,
            safeDt * Number(cross.tangentialBias ?? 0) * crossStrength * localWeight * 0.78
          );
        }
        velocity.y += safeDt * Number(cross.verticalBias ?? 0) * crossStrength * localWeight * 0.62;
        const crossDamping = Math.max(0, Number(cross.dampingBias ?? 0));
        if (crossDamping > 0) {
          velocity.multiplyScalar(Math.exp(-safeDt * crossDamping * crossStrength * localWeight));
        }
      }

      // HC028N: once the organism's immediate memory has finished, a much weaker
      // world-space residue can keep a small local cohort biased for tens of seconds.
      // It is intentionally quieter than HC028M1 and decays even while the player is away.
      for (let residueIndex = 0; residueIndex < entityEcologicalResidueFields.length; residueIndex += 1) {
        const residue = entityEcologicalResidueFields[residueIndex];
        const residuePosition = residue?.position;
        const residueRadius = Math.max(0, Number(residue?.radius ?? 0));
        const residueStrength = THREE.MathUtils.clamp(Number(residue?.strength01 ?? 0), 0, 0.28);
        if (
          residueStrength <= 0.005
          || residueRadius <= 0.05
          || !residuePosition
          || ![residuePosition.x, residuePosition.y, residuePosition.z].every(Number.isFinite)
        ) continue;

        this.temp3.set(
          this.temp.x - residuePosition.x,
          this.temp.y - residuePosition.y,
          this.temp.z - residuePosition.z
        );
        const residueDistance = this.temp3.length();
        if (residueDistance >= residueRadius || residueDistance <= 0.001) continue;
        const local01 = 1 - residueDistance / residueRadius;
        this.temp3.multiplyScalar(1 / residueDistance);

        // Only a sparse deterministic cohort carries the long tail so the trace reads
        // as Host memory rather than a persistent aura or a second particle system.
        const cohortPrimary = ((i + residueIndex * 3) % 4) === 0;
        const cohortBias = THREE.MathUtils.clamp(Number(residue.localCohortBias ?? 0.9), 0.70, 1);
        const cohortWeight = cohortPrimary ? 1 : (1 - cohortBias) * 0.24 + 0.025;
        const localWeight = local01 * cohortWeight;

        const anchorRadius = Math.max(0.12, Number(residue.anchorRadius ?? residueRadius * 0.40));
        const anchorTightness = Math.max(0, Number(residue.anchorTightness ?? 0.18));
        const shellError = residueDistance - anchorRadius;
        const stage = residue.residueStage ?? "retained_trace";
        const stageGain = stage === "settling_imprint" ? 0.72 : stage === "fading_trace" ? 0.52 : 1;
        velocity.addScaledVector(
          this.temp3,
          -shellError * safeDt * anchorTightness * residueStrength * localWeight * stageGain * 0.44
        );

        const phase = t * Math.max(0.05, Number(residue.oscillationRate ?? 0.6))
          + Number(residue.phaseOffset ?? 0)
          + this.homePhase[i] * Math.PI * 2;
        const breath = Math.sin(phase) * Number(residue.breathAmplitude ?? 0);
        velocity.addScaledVector(
          this.temp3,
          safeDt * (Number(residue.radialBias ?? 0) + breath) * residueStrength * localWeight * 0.62
        );

        this.temp2.set(-this.temp3.z, 0, this.temp3.x);
        if (this.temp2.lengthSq() > 0.0001) {
          this.temp2.normalize();
          velocity.addScaledVector(
            this.temp2,
            safeDt * Number(residue.tangentialBias ?? 0) * residueStrength * localWeight * 0.64
          );
        }
        velocity.y += safeDt * Number(residue.verticalBias ?? 0) * residueStrength * localWeight * 0.54;
        const residueDamping = Math.max(0, Number(residue.dampingBias ?? 0));
        if (residueDamping > 0) {
          velocity.multiplyScalar(Math.exp(-safeDt * residueDamping * residueStrength * localWeight));
        }
      }

      // Gentle host drift, always subordinate to the player's motion and verbs.
      velocity.x += Math.sin(t * 0.42 + i * 1.31) * safeDt * 0.035 * profile.drift * regionalDriftScale * livingDriftScale;
      velocity.y += (
        Math.sin(t * 0.55 + i * 0.77) * 0.022 * profile.drift * regionalDriftScale * livingDriftScale
        + profile.verticalBias
      ) * safeDt;
      velocity.z += (
        Math.cos(t * 0.37 + i * 1.13) * 0.035 * profile.drift * regionalDriftScale * livingDriftScale
        + profile.flow
      ) * safeDt;
      if (surfaceLivingState === "panic") {
        velocity.x += Math.sin(t * 2.8 + i * 2.17) * safeDt * 0.055;
        velocity.z += Math.cos(t * 2.35 + i * 1.61) * safeDt * 0.055;
      }
      velocity.multiplyScalar(Math.exp(-safeDt * profile.damping * regionalDampingScale * livingDampingScale));
      this.temp.addScaledVector(velocity, safeDt);

      // Recycle distant motes around the Core rather than expanding world cost.
      this.temp2.copy(this.temp).sub(this.playerRoot.position);
      if (this.temp2.lengthSq() > (this.radius * regionalFieldRadiusScale) * (this.radius * regionalFieldRadiusScale)) {
        const a = i * 2.3999632297 + t * 0.08;
        const r = 2.5 + this.homePhase[i] * 1.5;
        this.temp.set(
          this.playerRoot.position.x + Math.cos(a) * r,
          this.playerRoot.position.y - 0.6 + this.homePhase[i] * 1.8,
          this.playerRoot.position.z + Math.sin(a) * r
        );
        if (travelDistance > 0.001 && i % 3 === 0) {
          this.temp.addScaledVector(this.playerTravel, 1.15 + this.homePhase[i] * 1.25);
        }
        this.responseMemory[i] = 0;
        this.responseKind[i] = 0;
        velocity.multiplyScalar(0.15);
      }

      this.positions[k] = this.temp.x;
      this.positions[k + 1] = this.temp.y;
      this.positions[k + 2] = this.temp.z;
    }

    this.points.geometry.attributes.position.needsUpdate = true;

    const scanFamilyNames = ["suspension","current_rider","settling_residue","reactive_spore","echo_mote","sorting_grain"];
    const scanFindings = [
      "free suspension; disturbance should displace it",
      "matter is already coupled to a local current",
      "dense residue is settling out of suspension",
      "living spores are clustering and may answer disturbance",
      "motes hold a delayed response pattern; Pulse may produce an answer",
      "mixed-density grains are loosely ordered; Stabilize may reveal their bands"
    ];
    const experimentResults = {
      pulse: [
        "suspension displaced outward",
        "current-riders disturbed but flow reclaims them",
        "residue briefly lifted before settling resumes",
        "spore cluster scattered and begins reforming",
        "echo motes scattered and prepare a delayed answer",
        "sorting grains lose some local ordering"
      ],
      stabilize: [
        "suspension motion damped into a quieter cloud",
        "current-riders align more closely with local flow",
        "settling residue becomes more orderly",
        "spore cluster tightens without being consumed",
        "echo response quieted into local coherence",
        "mixed grains resolve into density bands"
      ],
      absorb: [
        "free suspension drawn toward the Core",
        "matter resists removal while coupled to flow",
        "loose residue drawn away from its settling bed",
        "spores follow the pull and ecology is displaced",
        "echo motes are incorporated before their answer completes",
        "sorted matter is selectively removed from its local pattern"
      ]
    };
    const chainResults = {
      "pulse>stabilize": [
        "scattered suspension coheres into a calmer shell",
        "disturbed riders resynchronize with the current",
        "lifted residue settles into a clearer layer",
        "scattered spores reform into a tighter living cluster",
        "the delayed echo resolves into a synchronized answer",
        "disordered grains settle back into visible density bands"
      ],
      "stabilize>pulse": [
        "ordered suspension breaks outward in a readable wave",
        "aligned riders transmit the disturbance farther down-flow",
        "settled residue releases a thin boundary plume",
        "tight spores answer as a coordinated burst",
        "coherent echo motes return a sharper response",
        "density bands separate visibly when disturbed"
      ],
      "stabilize>absorb": [
        "calmed suspension draws inward with less turbulence",
        "aligned riders resist removal along the flow direction",
        "ordered residue releases its loosest fraction first",
        "tight spores pull as a group rather than isolated motes",
        "coherent echo matter incorporates with little scatter",
        "sorted grains yield a more selective draw"
      ],
      "pulse>absorb": [
        "displaced suspension is caught during its outward drift",
        "loosened riders can be pulled briefly across the current",
        "lifted residue becomes easier to draw before resettling",
        "scattered spores are selectively pulled from the cluster",
        "echo motes are caught before their delayed answer returns",
        "disturbed grains draw as mixed matter rather than sorted layers"
      ]
    };
    const answerReadTriggered = Boolean(inquiryTriggered && answerReadReady && !interactionAnchor);
    const answerFindings = {
      host_membrane: "the Host boundary answers as a broad enclosing surface",
      living_seed: "a living seed-like response persists at the returned position",
      scar_memory: "residue or scar memory holds the Pulse and answers late",
      signal_resonant: "a signal-bearing structure returns a clean resonant answer",
      fluid_current: "the return is carried by moving or fluid material",
      dense_structure: "dense structure gives a hard compact return",
      living_material: "living material returns a soft irregular answer"
    };
    if (inquiryTriggered) {
      this.scanNearbyCount = scanNearbyCount;
      this.scanRepresentativeKind = scanRepresentativeKind;
      if (answerReadTriggered) {
        this.scanFamily = `sonar_${nearestAnswerMemory.responseClass ?? "living_material"}`;
        this.scanFinding = answerFindings[nearestAnswerMemory.responseClass] ?? "the remembered Pulse answer resolves into local material";
        this.scanReadSeconds = 2.8;
        this.lastMicroDiscovery = `answer_memory_read_${nearestAnswerMemory.responseClass ?? "living_material"}`;
        this.microDiscoveryCount += 1;
        if (this.lastAnswerMemoryReadId !== nearestAnswerMemory.id) {
          this.answerMemoryReadCount += 1;
          this.lastAnswerMemoryReadId = nearestAnswerMemory.id;
          this.lastAnswerMemoryReadClass = nearestAnswerMemory.responseClass ?? "living_material";
        }
        this.lastExperimentFamily = this.scanFamily;
        this.lastExperimentVerb = "pulse_inquiry";
        this.lastExperimentResult = this.scanFinding;
        this.experimentResponseSeconds = 2.8;
      } else if (scanRepresentativeKind >= 0) {
        this.scanFamily = scanFamilyNames[scanRepresentativeKind] ?? "unknown";
        this.scanFinding = scanFindings[scanRepresentativeKind] ?? "unresolved local material behavior";
        this.scanReadSeconds = 2.6;
        this.lastMicroDiscovery = `scan_read_${this.scanFamily}`;
        this.microDiscoveryCount += 1;
        this.lastExperimentFamily = this.scanFamily;
        this.lastExperimentVerb = "pulse_inquiry";
        this.lastExperimentResult = this.scanFinding;
        this.experimentResponseSeconds = 2.6;
      } else {
        this.scanFamily = "none_nearby";
        this.scanFinding = "no readable micro-ecology inside local scan range";
        this.scanReadSeconds = 1.35;
      }
    } else {
      this.scanReadSeconds = Math.max(0, this.scanReadSeconds - safeDt);
    }

    const actedKind = scanRepresentativeKind;
    const actedFamily = actedKind >= 0 ? (scanFamilyNames[actedKind] ?? "unknown") : "none_nearby";
    let actedVerb = "none";
    let actedBit = 0;
    if (pulseTriggered) { actedVerb = "pulse"; actedBit = 2; }
    else if (stabilizeHeld) { actedVerb = "stabilize"; actedBit = 4; }
    else if (absorbHeld) { actedVerb = "absorb"; actedBit = 8; }

    const actionTriggered = Boolean(
      pulseTriggered
      || (stabilizeHeld && !this.wasStabilizeHeld)
      || (absorbHeld && !this.wasAbsorbHeld)
    );

    if (actedVerb !== "none" && actedKind >= 0) {
      const results = experimentResults[actedVerb];
      this.lastExperimentFamily = actedFamily;
      this.lastExperimentVerb = actedVerb;
      this.lastExperimentResult = results?.[actedKind] ?? "local ecology responded";
      this.experimentResponseSeconds = 1.8;
      if ((this.familyVerbSeenMask[actedKind] & actedBit) === 0) {
        this.familyVerbSeenMask[actedKind] |= actedBit;
        this.learnedRelationshipCount += 1;
      }

      // A chain is only recognized on a new verb edge, on the same local family,
      // inside a short window. Holding a button cannot repeatedly farm chains.
      if (actionTriggered) {
        const chainKey = `${this.chainFirstVerb}>${actedVerb}`;
        const chainTable = chainResults[chainKey];
        if (
          this.chainWindowSeconds > 0
          && this.chainFamily === actedKind
          && this.chainFirstVerb !== actedVerb
          && chainTable
        ) {
          this.lastChainResult = chainTable[actedKind] ?? "the second verb transformed the first response";
          this.chainResponseSeconds = 2.15;
          this.chainDiscoveryCount += 1;
          this.lastMicroDiscovery = `chain_${chainKey}_${actedFamily}`;
          this.chainWindowSeconds = 0;
          this.chainFamily = -1;
          this.chainFirstVerb = "none";
        } else {
          this.chainFamily = actedKind;
          this.chainFirstVerb = actedVerb;
          this.chainWindowSeconds = 2.35;
        }
      }
    } else {
      this.experimentResponseSeconds = Math.max(0, this.experimentResponseSeconds - safeDt);
    }

    this.chainWindowSeconds = Math.max(0, this.chainWindowSeconds - safeDt);
    this.chainResponseSeconds = Math.max(0, this.chainResponseSeconds - safeDt);

    // World response envelope. It changes the existing field's visual weight
    // briefly so cause/effect is visible even without debug text.
    if (answerReadTriggered) {
      this.worldResponseMode = "echo_memory_read";
      this.worldResponseFamily = nearestAnswerMemory.responseClass ?? "living_material";
      this.worldResponseCause = "approached_return_then_pulse_inquiry";
      this.worldResponseIntensity = 0.52;
      this.worldResponseSeconds = 1.12;
    } else if (actionTriggered && actedKind >= 0) {
      this.worldResponseMode = actedVerb === "pulse" ? "outward_disturbance"
        : actedVerb === "stabilize" ? "coherence_settle"
        : "inward_commit";
      this.worldResponseFamily = actedFamily;
      this.worldResponseCause = actedVerb;
      this.worldResponseIntensity = 0.56;
      this.worldResponseSeconds = 0.92;
    }
    if (this.chainResponseSeconds > 0 && this.lastChainResult !== "none") {
      this.worldResponseMode = "transformed_chain_response";
      this.worldResponseCause = "verb_sequence";
      this.worldResponseIntensity = Math.max(this.worldResponseIntensity, 0.82);
      this.worldResponseSeconds = Math.max(this.worldResponseSeconds, 1.05);
    }

    // HC027E: the action edge is not the end of the beat. Existing material gets
    // a bounded after-answer when the already-owned verb process actually resolves.
    const compositionConsequence = composition.consequence ?? {};
    if (
      compositionConsequence.active
      && compositionConsequence.eventId
      && compositionConsequence.eventId !== "none"
      && compositionConsequence.eventId !== this.lastCompositionConsequenceEventId
    ) {
      this.lastCompositionConsequenceEventId = compositionConsequence.eventId;
      if (compositionConsequence.kind === "pulse_return") {
        this.worldResponseMode = "sonar_answer_afterglow";
        this.worldResponseCause = "pulse_return";
        this.worldResponseIntensity = Math.max(this.worldResponseIntensity, 0.74);
        this.worldResponseSeconds = Math.max(this.worldResponseSeconds, 1.08);
      } else if (compositionConsequence.kind === "absorb_capture") {
        this.worldResponseMode = "metabolic_afterflow";
        this.worldResponseCause = "absorb_capture";
        this.worldResponseIntensity = Math.max(this.worldResponseIntensity, 0.72);
        this.worldResponseSeconds = Math.max(this.worldResponseSeconds, 1.22);
      } else if (compositionConsequence.kind === "stabilize_lock") {
        this.worldResponseMode = "coherence_lock_afterglow";
        this.worldResponseCause = "stabilize_lock";
        this.worldResponseIntensity = Math.max(this.worldResponseIntensity, 0.66);
        this.worldResponseSeconds = Math.max(this.worldResponseSeconds, 1.28);
      } else if (compositionConsequence.kind === "core_work_commit") {
        this.worldResponseMode = "core_work_yield";
        this.worldResponseCause = "retained_anatomy_commit";
        this.worldResponseIntensity = Math.max(this.worldResponseIntensity, 0.34);
        this.worldResponseSeconds = Math.max(this.worldResponseSeconds, 0.72);
      }
    }

    this.worldResponseSeconds = Math.max(0, this.worldResponseSeconds - safeDt);
    if (this.worldResponseSeconds <= 0) {
      this.worldResponseIntensity = Math.max(0, this.worldResponseIntensity - safeDt * 1.8);
      if (this.worldResponseIntensity <= 0.01) {
        this.worldResponseMode = "ambient";
        this.worldResponseCause = "none";
      }
    } else {
      this.worldResponseIntensity = Math.max(0, this.worldResponseIntensity - safeDt * 0.30);
    }

    // One existing PointsMaterial, one scalar update. Scan "breathes", Pulse
    // expands, Stabilize tightens, Absorb concentrates, and chains get a clear beat.
    const visualBeat = 0.5 + 0.5 * Math.sin(t * 8.0);
    const hostVisualScale = 1 + hostBreath * 0.115;
    const hostOpacityLift = 0.045 * hostPressure;
    const modeScale = this.worldResponseMode === "echo_memory_read" ? 0.24
      : this.worldResponseMode === "scan_read" ? 0.10
      : this.worldResponseMode === "outward_disturbance" ? 0.34
      : this.worldResponseMode === "coherence_settle" ? -0.12
      : this.worldResponseMode === "inward_commit" ? 0.18
      : this.worldResponseMode === "transformed_chain_response" ? 0.44
      : this.worldResponseMode === "sonar_answer_afterglow" ? 0.28
      : this.worldResponseMode === "metabolic_afterflow" ? 0.20
      : this.worldResponseMode === "coherence_lock_afterglow" ? -0.08
      : this.worldResponseMode === "core_work_yield" ? -0.16
      : 0;
    const answerMemoryVisualLift = answerApproachIntensity * (0.08 + 0.04 * (0.5 + 0.5 * Math.sin(t * 3.2)));
    this.points.material.size = this.basePointSize * hostVisualScale * livingSizeScale * presentationSizeScale * (
      1 + answerMemoryVisualLift + modeScale * this.worldResponseIntensity * (0.62 + visualBeat * 0.38)
    );
    const responseOpacityLift = this.worldResponseMode === "coherence_settle" || this.worldResponseMode === "coherence_lock_afterglow"
      ? 0.06
      : this.worldResponseMode === "core_work_yield"
        ? 0.02
        : 0.18;
    this.points.material.opacity = THREE.MathUtils.clamp(
      (0.48 + hostOpacityLift + this.worldResponseIntensity * responseOpacityLift * (0.65 + visualBeat * 0.35))
        * livingOpacityScale
        * presentationOpacityScale,
      0.045,
      0.78
    );
    this.points.material.color.setHex(
      surfaceLivingState === "panic" ? 0xf09078
        : surfaceLivingState === "withered" ? 0x77798d
          : surfaceLivingState === "blooming" ? 0xb4efaf
            : surfaceLivingState === "growth" ? 0xc1e99a
              : surfaceLivingState === "embrace" ? 0xa8e3d1
                : 0xbcefdc
    );
    if (chemistryActive && chemistryStrength > 0.01) {
      const tint = coreChemistry.dominantFamily === "grave_memory" ? this.hostChemistryMemoryColor
        : coreChemistry.dominantFamily === "vascular_rhythm" ? this.hostChemistryRhythmColor
        : coreChemistry.dominantFamily === "silt_pressure" ? this.hostChemistryPressureColor
        : coreChemistry.dominantFamily === "mixed_membrane" ? this.hostChemistryMixedColor
        : null;
      if (tint) this.points.material.color.lerp(tint, THREE.MathUtils.clamp(chemistryStrength * 0.34, 0, 0.42));
      const chemistryBeat = coreChemistry.dominantFamily === "vascular_rhythm" ? (0.5 + 0.5 * Math.sin(t * 5.25)) : 0.5;
      this.points.material.size *= 1 + chemistryStrength * (0.08 + chemistryBeat * 0.08);
      this.points.material.opacity = THREE.MathUtils.clamp(this.points.material.opacity + chemistryStrength * 0.07, 0.18, 0.82);
    }

    this.wasStabilizeHeld = stabilizeHeld;
    this.wasAbsorbHeld = absorbHeld;

    const response = answerReadTriggered ? "sonar_answer_read"
      : pulseTriggered ? "pulse_scatter"
      : absorbHeld ? "absorb_draw"
      : stabilizeHeld ? "stabilize_order"
      : "drift";

    if (
      pulseTriggered
      && echoNearby > 0
      && pulseEventId !== this.lastDiscoveryPulseEventId
    ) {
      this.lastDiscoveryPulseEventId = pulseEventId;
      this.lastMicroDiscovery = "pulse_echo_motes_answered";
      this.microDiscoveryCount += 1;
    } else if (stabilizeHeld && sortingNearby > 0) {
      this.lastMicroDiscovery = "stabilize_revealed_density_bands";
    }

    frameState.ambientMaterial = {
      active: true,
      count: this.count,
      compatibleCount: this.compatibleCount,
      banked,
      nearestDistance: Number.isFinite(nearestDistance) ? nearestDistance : 0,
      lastResponse: response,
      verbGrammar: {
        pulseInquiry: "disturb_and_read_response",
        pulse: "disturb_reveal_communicate",
        stabilize: "organize_synchronize",
        absorb: "incorporate_remove_commit"
      },
      relationshipEffectOwnership: {
        stabilizeFocused: relationshipStabilizeActive,
        ambientStabilizeScale: Number(ambientStabilizeScale.toFixed(2)),
        rule: relationshipStabilizeActive
          ? "retained_target_gets_focused_coherence_host_receives_weaker_ambient_order"
          : "host_receives_normal_ambient_order_without_retained_target"
      },
      scanRead: {
        active: this.scanReadSeconds > 0,
        family: this.scanFamily,
        finding: this.scanFinding,
        nearbyCount: this.scanNearbyCount,
        representativeKind: this.scanRepresentativeKind,
        remainingSeconds: Number(this.scanReadSeconds.toFixed(2)),
        mutatesWorld: false,
        objectiveAuthority: false,
        readAuthority: "pulse_inquiry",
        aButtonRequired: false
      },
      experimentMemory: {
        active: this.experimentResponseSeconds > 0,
        family: this.lastExperimentFamily,
        verb: this.lastExperimentVerb,
        result: this.lastExperimentResult,
        learnedRelationships: this.learnedRelationshipCount,
        possibleRelationships: 24,
        completionIsRequired: false,
        rewardCurrency: false,
        purpose: "recognition_and_prediction_not_collection"
      },
      rhythmChain: {
        active: this.chainResponseSeconds > 0,
        pendingFamily: this.chainFamily >= 0 ? (scanFamilyNames[this.chainFamily] ?? "unknown") : "none",
        pendingFirstVerb: this.chainFirstVerb,
        windowSeconds: Number(this.chainWindowSeconds.toFixed(2)),
        result: this.lastChainResult,
        discoveredCount: this.chainDiscoveryCount,
        supportedPatterns: ["pulse>stabilize","stabilize>pulse","stabilize>absorb","pulse>absorb"],
        requiredForProgression: false,
        comboMeter: false,
        rewardCurrency: false,
        purpose: "learned_rhythm_and_cause_effect"
      },
      hostRhythmResponse: {
        active: Boolean(hostRhythm.active),
        stage: hostStage,
        breath: Number(hostBreath.toFixed(3)),
        pressure: Number(hostPressure.toFixed(3)),
        visibleFieldScale: Number(hostVisualScale.toFixed(3)),
        visibleWithoutPlayerInput: true,
        mechanicalForceAuthority: false,
        rule: "host_macro_cycle_produces_micro_environment_motion"
      },
      surfaceLivingResponse: {
        pass: "HC-023B",
        state: surfaceLivingState,
        driftScale: livingDriftScale,
        hostWaveScale: livingHostWaveScale,
        opacityScale: livingOpacityScale,
        usesExistingPointField: true,
        addsParticles: false,
        progressionAuthority: false
      },
      worldResponse: {
        active: this.worldResponseIntensity > 0.01,
        mode: this.worldResponseMode,
        family: this.worldResponseFamily,
        cause: this.worldResponseCause,
        intensity: Number(this.worldResponseIntensity.toFixed(2)),
        remainingSeconds: Number(this.worldResponseSeconds.toFixed(2)),
        signatures: {
          pulseInquiry: "pulse_response_carries_local_read",
          pulse: "outward_scatter_then_ring",
          stabilize: "motion_damps_and_orders",
          absorb: "inward_draw_then_curl",
          rhythmChain: "stronger_transformed_response_beat",
          pulseReturn: "answer_lingers_after_the_return_reaches_core",
          absorbCapture: "material_afterflow_marks_successful_incorporation",
          stabilizeLock: "local_field_holds_coherence_before_releasing",
          coreWork: "surrounding_material_yields_to_selected_anatomy",
          answerMemoryApproach: "existing_host_material_locally_expresses_the_returned_material_class",
          answerMemoryRead: "approach_then_pulse_inquiry_confirms_material_reply",
          answerMaterialGrammar: "membrane_wrap_seed_breathe_scar_settle_signal_oscillate_fluid_stream_dense_still_living_irregular",
          signalPlainPersistentLocalConsequence: "existing_host_motes_hold_afterflow_resonance_or_coherence_for_tens_of_seconds",
          signalPlainConsequenceNextQuestion: "changed_condition_couples_through_existing_host_volume_into_another_existing_condition"
        },
        presentationOpacityScale: Number(presentationOpacityScale.toFixed(2)),
        worldNoticeLift: Number(worldNoticeLift.toFixed(2)),
        debugTextRequiredToRead: false
      },
      sonarInquiry: {
        pass: "HC-027G",
        active: answerMemoryActive,
        memoryId: nearestAnswerMemory?.id ?? "none",
        responseClass: nearestAnswerMemory?.responseClass ?? "none",
        responseLabel: nearestAnswerMemory?.responseLabel ?? "none",
        reachClass: answerReachClass,
        actionableNow: Boolean(nearestAnswerMemory?.actionableNow),
        structuralOnly: Boolean(nearestAnswerMemory?.structuralOnly),
        structuralPresence: Number(answerStructuralPresence.toFixed(2)),
        observationCount: answerObservationCount,
        resolutionStage: answerResolutionStage,
        structuralInterpretation: answerStructuralInterpretation,
        repeatedObservationLaw: "presence_then_layering_then_structural_relationship",
        materialReplySignature: answerMemoryActive ? answerReplySignature : "none",
        materialReplyGrammarEnabled: true,
        materialReplyClasses: Object.keys(MATERIAL_REPLY_SIGNATURES),
        distance: nearestAnswerMemory?.currentDistance ?? 0,
        approachIntensity: Number(answerApproachIntensity.toFixed(2)),
        readReady: answerReadReady,
        readTriggered: answerReadTriggered,
        readCount: this.answerMemoryReadCount,
        lastReadClass: this.lastAnswerMemoryReadClass,
        memoryRemainingSeconds: nearestAnswerMemory?.remainingSeconds ?? 0,
        createsWaypoint: false,
        createsObjective: false,
        createsTarget: false,
        routeAuthority: false,
        progressionAuthority: false,
        rule: "pulse_probe_answer_observe_material_behavior_without_generic_A_confirmation"
      },
      signalPlainPersistentLocalConsequence: {
        pass: "HC-027J",
        active: signalPlainConsequenceActive,
        consequenceId: signalPlainConsequence?.consequenceId ?? "none",
        behavior: signalPlainConsequenceBehavior,
        intensity: Number(signalPlainConsequenceIntensity.toFixed(3)),
        remainingSeconds: signalPlainConsequence?.remainingSeconds ?? 0,
        usesExistingHostMotes: true,
        addsGeometry: false,
        addsDrawCalls: false,
        changesMovement: false,
        changesCollision: false,
        routeAuthority: false,
        progressionAuthority: false
      },
      signalPlainConsequenceNextQuestion: {
        pass: "HC-027K",
        active: signalPlainNextQuestionActive,
        relationId: signalPlainNextQuestion?.id ?? "none",
        sourceNodeNumber: signalPlainNextQuestion?.sourceNodeNumber ?? 0,
        targetNodeNumber: signalPlainNextQuestion?.targetNodeNumber ?? 0,
        behavior: signalPlainNextQuestionBehavior,
        strength: Number(signalPlainNextQuestionStrength.toFixed(3)),
        sourcePosition: signalPlainNextQuestion?.sourcePosition ?? null,
        targetPosition: signalPlainNextQuestion?.targetPosition ?? null,
        usesExistingHostMotes: true,
        broadRelationshipVolumeNotRouteLine: true,
        addsGeometry: false,
        addsDrawCalls: false,
        changesMovement: false,
        changesCollision: false,
        createsWaypoint: false,
        routeAuthority: false,
        progressionAuthority: false
      },
      hostChemistryResponse: {
        pass: "HC-024E",
        active: chemistryActive && chemistryStrength > 0.01,
        mode: coreChemistry.dominantMode ?? "quiet_core",
        dominantFamily: coreChemistry.dominantFamily ?? "none",
        memory: Number(chemistryMemory.toFixed(2)),
        rhythm: Number(chemistryRhythm.toFixed(2)),
        pressure: Number(chemistryPressure.toFixed(2)),
        surfaceExpression: Number(chemistrySurface.toFixed(2)),
        responseRadius: Number(chemistryRadius.toFixed(2)),
        directionality: Number(chemistryDirectionality.toFixed(2)),
        cloudPatternId: coreChemistry.cloudPatternId ?? "none",
        usesExistingHostMaterial: true,
        requiresAdditionalInput: false,
        addsGeometry: false,
        changesMovement: false,
        changesCollision: false,
        progressionAuthority: false
      },
      regionalPhysicalEmbodiment: {
        pass: "HC-028F",
        active: regionalPhysicalActive,
        profileId: regionalPhysical.profileId ?? "none",
        law: regionalPhysical.law ?? "none",
        currentFunction: regionalPhysical.currentFunction ?? "none",
        phraseStrength: Number((regionalPhysical.phraseStrength ?? 0).toFixed(3)),
        radialBias: Number((regionalPhysical.radialBias ?? 0).toFixed(4)),
        tangentialBias: Number((regionalPhysical.tangentialBias ?? 0).toFixed(4)),
        fieldRadiusScale: Number(regionalFieldRadiusScale.toFixed(3)),
        movementAuthority: false,
        collisionAuthority: false,
        progressionAuthority: false
      },
      entityLocalMatterCoupling: {
        pass: "HC-028M1",
        active: entityMatterFields.length > 0,
        fieldCount: entityMatterFields.length,
        primaryEntityId: entityMatterCoupling.primary?.entityId ?? "none",
        primaryMode: entityMatterCoupling.primary?.mode ?? "ambient",
        primaryStrength01: Number((entityMatterCoupling.primary?.strength01 ?? 0).toFixed(3)),
        primaryCausalStage: entityMatterCoupling.primary?.causalStage ?? "inactive",
        primaryCausalEnvelope01: Number((entityMatterCoupling.primary?.causalEnvelope01 ?? 0).toFixed(3)),
        localMatterAnswersAfterOrganism: Boolean(entityMatterCoupling.localMatterAnswersAfterOrganism),
        matterPersistsAfterVerbRelease: Boolean(entityMatterCoupling.matterPersistsAfterVerbRelease),
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        playerMovementAuthority: false,
        entityMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      },
      entityEcologicalCrossInfluence: {
        pass: "HC-028P",
        active: entityEcologicalCrossInfluenceFields.length > 0,
        fieldCount: entityEcologicalCrossInfluenceFields.length,
        primaryEntityId: entityEcologicalCrossInfluence.primary?.entityId ?? "none",
        primaryMode: entityEcologicalCrossInfluence.primary?.mode ?? "ambient_cross_notice",
        primaryStage: entityEcologicalCrossInfluence.primary?.causalStage ?? "inactive",
        primaryStrength01: Number((entityEcologicalCrossInfluence.primary?.strength01 ?? 0).toFixed(3)),
        sourceEntityId: entityEcologicalCrossInfluence.primary?.sourceEntityId ?? "none",
        readsOtherOrganismResidueOnly: Boolean(entityEcologicalCrossInfluence.readsOtherOrganismResidueOnly),
        recursivePropagation: false,
        createsResidue: false,
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        playerMovementAuthority: false,
        entityMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      },
      entityEcologicalResidue: {
        pass: "HC-028N",
        active: entityEcologicalResidueFields.length > 0,
        stored: Boolean(entityEcologicalResidue.stored),
        fieldCount: entityEcologicalResidueFields.length,
        residueCount: Array.isArray(entityEcologicalResidue.residues) ? entityEcologicalResidue.residues.length : 0,
        primaryEntityId: entityEcologicalResidue.primary?.entityId ?? "none",
        primaryMode: entityEcologicalResidue.primary?.mode ?? "ambient_trace",
        primaryStage: entityEcologicalResidue.primary?.residueStage ?? "inactive",
        primaryStrength01: Number((entityEcologicalResidue.primary?.strength01 ?? 0).toFixed(3)),
        primaryRemainingSeconds: Number((entityEcologicalResidue.primary?.remainingSeconds ?? 0).toFixed(2)),
        worldSpaceFrozen: Boolean(entityEcologicalResidue.worldSpaceFrozen),
        cellScoped: Boolean(entityEcologicalResidue.cellScoped),
        decaysWhileAway: Boolean(entityEcologicalResidue.decaysWhileAway),
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        playerMovementAuthority: false,
        entityMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      },
      materialProfile: profile.id,
      interactionAnchor: interactionAnchor?.id ?? "none",
      movementWake: travelDistance > 0.001,
      responsiveNearby,
      rememberedResponses,
      fieldContinuity: responsiveNearby > 0 ? "verb_reactive_space" : "ambient_space",
      ecologyProfile: profile.ecology,
      ecologyCounts: this.ecologyCounts,
      ecologyRemembering,
      lastMicroDiscovery: this.lastMicroDiscovery,
      microDiscoveryCount: this.microDiscoveryCount,
      microFamilies: ["suspension","current_riders","settling_residue","reactive_spores","echo_motes","sorting_grains"],
      readableVerbs: ["pulse","stabilize","absorb"],
      ecologyRule: "micro-play is optional: Pulse probes/reads; Stabilize and Absorb test relationships; none advance objectives",
      performanceBudget: {
        moteCount: this.count,
        moteCountIncreasedThisPass: false,
        extraGeometryAdded: false,
        perFrameArrayFromFiltersRemoved: true,
        interactionAnchorAllocationRemoved: true,
        scanUsesExistingMoteLoop: true,
        aButtonScanRetiredHC028D2: true,
        scanAddsSecondMotePass: false,
        scanAddsGeometry: false,
        responseMemoryUsesFixedTypedArray: true,
        responseMemoryAddsWorldObjects: false,
        chainStateUsesScalarFieldsOnly: true,
        chainAddsWorldObjects: false,
        chainAddsParticlePass: false,
        worldResponseReusesPointsMaterial: true,
        worldResponseAddsDrawCalls: false,
        worldResponseAddsGeometry: false,
        worldResponseAddsArrayPass: false,
        hostRhythmReusesExistingMotes: true,
        hostRhythmAddsDrawCalls: false,
        hostRhythmAddsGeometry: false,
        hostRhythmUsesSingleAuthoritativeSignal: true,
        answerMemoryUsesExistingMotes: true,
        answerMemoryAddsGeometry: false,
        answerMemoryAddsDrawCalls: false,
        answerMemoryMaxWorldRecords: 4,
        materialReplyGrammarUsesExistingMotes: true,
        materialReplyGrammarAddsGeometry: false,
        materialReplyGrammarAddsDrawCalls: false,
        materialReplyGrammarGameplayAuthority: false,
        signalPlainLocalConsequenceUsesExistingMotes: true,
        signalPlainLocalConsequenceAddsGeometry: false,
        signalPlainLocalConsequenceAddsDrawCalls: false,
        signalPlainNextQuestionUsesExistingMotes: true,
        signalPlainNextQuestionAddsGeometry: false,
        signalPlainNextQuestionAddsDrawCalls: false,
        entityLocalMatterCouplingUsesExistingMotes: true,
        entityLocalMatterCouplingAddsParticles: false,
        entityLocalMatterCouplingAddsGeometry: false,
        entityLocalMatterCouplingAddsDrawCalls: false,
        entityLocalMatterCouplingMaxAuthoredFields: 2,
        entityLocalMatterCouplingCausalEnvelope: "forming_answering_expressing_releasing",
        entityLocalMatterCouplingUsesLocalMoteCohort: true,
        entityEcologicalResidueUsesExistingMotes: true,
        entityEcologicalResidueAddsParticles: false,
        entityEcologicalResidueAddsGeometry: false,
        entityEcologicalResidueAddsDrawCalls: false,
        entityEcologicalResidueMaxStoredTraces: 2,
        entityEcologicalResidueDurationRangeSeconds: [20, 45],
        entityEcologicalCrossInfluenceUsesExistingMotes: true,
        entityEcologicalCrossInfluenceAddsParticles: false,
        entityEcologicalCrossInfluenceAddsGeometry: false,
        entityEcologicalCrossInfluenceAddsDrawCalls: false,
        entityEcologicalCrossInfluenceRecursivePropagation: false
      },
      responseMemorySecondsApprox: 2.94,
      inventoryAuthority: false,
      chemistryAuthority: false,
      objectiveAuthority: false,
      progressionAuthority: false,
      pass: "HC-022F"
    };
  }
}
