const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 3) => Number(value.toFixed(digits));

/**
 * HC027D / HC027F — Core sensory response + answer-memory law.
 *
 * Pulse remains the same gameplay verb and keeps the existing 4.25 authored
 * chemistry interaction range. This system owns presentation-only travel and
 * return timing so Pulse can behave like embodied sonar: emit -> contact -> return.
 *
 * It does not reveal hidden progression state, change pulse range, move objects,
 * alter chemistry, or grant targeting authority.
 */
export class CoreSensoryResponseSystem {
  constructor({ frameState, playerRoot, chemObjectSystem }) {
    if (!frameState) throw new Error("[CoreSensoryResponseSystem] frameState is required.");
    if (!playerRoot) throw new Error("[CoreSensoryResponseSystem] playerRoot is required.");
    if (!chemObjectSystem) throw new Error("[CoreSensoryResponseSystem] chemObjectSystem is required.");

    this.frameState = frameState;
    this.playerRoot = playerRoot;
    this.chemObjectSystem = chemObjectSystem;
    this.lastPulseEventId = 0;
    this.activePulse = null;
    this.echoes = [];
    this.pulseCount = 0;
    this.returnCount = 0;
    this.lastReturn = "none";
    // HC027F: Pulse answers may persist briefly at the world position that answered.
    // This is sensory memory only: no marker mesh, route authority, target ownership or hidden-state reveal.
    this.answerMemory = [];
    this.answerMemorySerial = 0;
    // HC027L1 — repeated observation increases sensory resolution rather than
    // replaying the same answer forever. This is presentation memory only.
    this.sourceObservationCounts = new Map();
    this.answerMemoryTtlSeconds = 7.2;
    this.answerMemoryDeepTtlSeconds = 5.2;
    this.answerMemoryMax = 4;
    // HC027J1: a committed Pulse can overfill the Core's immediate sensory field.
    // This is a readable recovery state, not a hard cooldown or input lock.
    this.sensorySaturationSeconds = 0;
    this.lastPulseMode = "quick";
    this.lastPulseRange = 4.25;
  }

  init() {
    this.publish(this.frameState, [], []);
  }

  clearDebugTestState() {
    // HC027G1 test-harness hygiene only. This clears transient sonar presentation
    // so a platform starts without answers from the previously tested area.
    // It does not change Pulse range, chemistry, targets, routes or progression.
    this.activePulse = null;
    this.echoes = [];
    this.answerMemory = [];
    this.sourceObservationCounts.clear();
    this.lastReturn = "none";
    this.publish(this.frameState, [], []);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = clamp(dt ?? 0, 0, 0.08);
    this.sensorySaturationSeconds = Math.max(0, this.sensorySaturationSeconds - safeDt);
    const pulseEventId = frameState.input?.pulseEventId ?? 0;
    if (frameState.input?.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      this.beginPulse(frameState, pulseEventId);
    }

    const newContacts = [];
    const newReturns = [];

    for (const memory of this.answerMemory) memory.age += safeDt;
    this.answerMemory = this.answerMemory.filter((memory) => memory.age < memory.ttlSeconds);

    if (this.activePulse) this.activePulse.age += safeDt;

    for (const echo of this.echoes) {
      echo.age += safeDt;
      if (!echo.contacted && echo.age >= echo.contactAt) {
        echo.contacted = true;
        newContacts.push(this.publicEcho(echo));
      }
      if (!echo.returned && echo.age >= echo.returnAt) {
        echo.returned = true;
        this.returnCount += 1;
        this.lastReturn = `${echo.responseClass}:${echo.id}`;
        const publicReturn = this.publicEcho(echo);
        newReturns.push(publicReturn);
        this.rememberAnswer(publicReturn);
      }
    }

    this.echoes = this.echoes.filter((echo) => !echo.returned || echo.age < echo.returnAt + 0.16);
    if (this.activePulse && this.activePulse.age > this.activePulse.outboundLife + 0.08) this.activePulse = null;

    this.publish(frameState, newContacts, newReturns);
  }

  beginPulse(frameState, pulseEventId) {
    const expression = this.resolveRadialExpression(frameState);
    const input = frameState.input ?? {};
    const releaseKind = input.pulseReleaseKind === "charged" ? "charged" : "quick";
    const charge01 = releaseKind === "charged" ? clamp(input.pulseReleaseCharge01 ?? 0, 0, 1) : 0;
    // HC027J1: 4.25 remains the actionable gameplay radius. Charged Pulse adds
    // presentation-only structural reach beyond it; it does not extend chemistry,
    // targeting, collision, or progression authority.
    // Legacy gameplay-range lock for inherited validators: const maxRange = 4.25.
    // HC027J1 renames that fixed gameplay radius because only presentation reach may extend beyond it.
    const localActionableRange = 4.25;
    const pulsePhysiology = frameState.corePerformance?.verbModifiers?.pulse ?? {};
    const structuralReachMultiplier = clamp(pulsePhysiology.structuralReachMultiplier ?? 1, 0.88, 1.16);
    const maxRange = releaseKind === "charged"
      ? localActionableRange + (2.35 + charge01 * 3.15) * structuralReachMultiplier
      : localActionableRange;
    const waveSpeed = expression.waveSpeed * (releaseKind === "charged" ? (0.94 - charge01 * 0.04) : 1);
    const origin = this.positionOf(this.playerRoot.position);
    const echoes = [];

    const candidates = releaseKind === "charged"
      ? (this.chemObjectSystem.objects ?? []).filter((item) => item?.recipe?.id)
      : (frameState.pulse?.affectedObjects ?? []).map((id) =>
          this.chemObjectSystem.objects?.find((candidate) => candidate.recipe.id === id)
        ).filter(Boolean);

    for (const item of candidates) {
      const id = item.recipe.id;
      if (!item || item.absorbed || item.root?.userData?.absorbed || !item.root?.visible) continue;
      const distance = this.playerRoot.position.distanceTo(item.root.position);
      if (!Number.isFinite(distance) || distance > maxRange + 0.01) continue;
      echoes.push(this.makeEcho({
        id,
        kind: "chem_object",
        position: this.positionOf(item.root.position),
        distance,
        responseClass: this.classifyRecipe(item.recipe),
        responseLabel: item.recipe.behavior?.onPulse ?? "material_response",
        waveSpeed,
        pulseEventId,
        pulseMode: releaseKind,
        reachClass: distance <= localActionableRange + 0.01 ? "local_actionable" : "deep_structural"
      }));
    }

    const boundaryEcho = this.makeBoundaryEcho(frameState, waveSpeed, maxRange, pulseEventId, releaseKind);
    if (boundaryEcho) echoes.push(boundaryEcho);

    echoes.sort((a, b) => a.distance - b.distance);
    const localEchoes = echoes.filter((echo) => echo.kind === "chem_object" && echo.reachClass === "local_actionable").slice(0, 5);
    const echoClutterMultiplier = clamp(pulsePhysiology.echoClutterMultiplier ?? 1, 0.76, 1.28);
    const deepEchoLimit = Math.max(2, Math.min(5, Math.round(4 * echoClutterMultiplier)));
    const deepEchoes = releaseKind === "charged"
      ? echoes.filter((echo) => echo.kind === "chem_object" && echo.reachClass === "deep_structural").slice(0, deepEchoLimit)
      : [];
    const localBoundary = echoes.find((echo) => echo.kind === "host_boundary");
    this.echoes = localBoundary ? [...localEchoes, ...deepEchoes, localBoundary] : [...localEchoes, ...deepEchoes];

    this.activePulse = {
      eventId: pulseEventId,
      age: 0,
      origin,
      waveSpeed,
      maxRange,
      localActionableRange,
      pulseMode: releaseKind,
      charge01,
      outboundLife: maxRange / waveSpeed,
      radialCharacter: expression.radialCharacter,
      echoCount: this.echoes.length
    };
    this.lastPulseMode = releaseKind;
    this.lastPulseRange = maxRange;
    if (releaseKind === "charged") {
      const recoveryBurden = clamp(pulsePhysiology.recoveryBurdenMultiplier ?? 1, 0.76, 1.30);
      this.sensorySaturationSeconds = Math.max(this.sensorySaturationSeconds, (0.72 + charge01 * 0.88) * recoveryBurden);
    }
    this.pulseCount += 1;
  }

  resolveRadialExpression(frameState) {
    const weights = frameState.corePerformance?.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const deep = Number.isFinite(weights.deep) ? weights.deep : 1 / 3;
    const inner = Number.isFinite(weights.inner) ? weights.inner : 1 / 3;
    const membrane = Number.isFinite(weights.membrane) ? weights.membrane : 1 / 3;
    // Same sonar function, different physiology: Deep rolls outward more slowly,
    // Membrane snaps outward faster, Inner stays clean and intermediate.
    const waveSpeed = 5.2 * deep + 6.6 * inner + 8.2 * membrane;
    return {
      waveSpeed: clamp(waveSpeed, 5.2, 8.2),
      radialCharacter: frameState.corePerformance?.personality ?? "forming / neutral"
    };
  }

  makeBoundaryEcho(frameState, waveSpeed, maxRange, pulseEventId, pulseMode = "quick") {
    const boundary = frameState.playerKinematics?.movementBoundary ?? {};
    const radii = boundary.radii ?? {};
    const normalized = Number.isFinite(boundary.normalizedDistance) ? boundary.normalizedDistance : null;
    if (normalized === null) return null;
    const radiusValues = [radii.x, radii.y, radii.z].filter((value) => Number.isFinite(value) && value > 0);
    if (!radiusValues.length) return null;

    const normal = boundary.surfaceNormal ?? { x: 0, y: 1, z: 0 };
    const nx = normal.x ?? 0, ny = normal.y ?? 1, nz = normal.z ?? 0;
    const rx = radii.x ?? radiusValues[0], ry = radii.y ?? radiusValues[0], rz = radii.z ?? radiusValues[0];
    const inverseRadiusSq = (nx * nx) / (rx * rx) + (ny * ny) / (ry * ry) + (nz * nz) / (rz * rz);
    const effectiveRadius = inverseRadiusSq > 0.000001 ? 1 / Math.sqrt(inverseRadiusSq) : Math.min(...radiusValues);
    const rawDistance = effectiveRadius * Math.max(0, 1 - normalized);
    if (!Number.isFinite(rawDistance) || rawDistance > maxRange) return null;
    const distance = Math.max(0.35, rawDistance);
    const origin = this.playerRoot.position;
    const position = {
      x: origin.x + (normal.x ?? 0) * distance,
      y: origin.y + (normal.y ?? 1) * distance,
      z: origin.z + (normal.z ?? 0) * distance
    };
    return this.makeEcho({
      id: `host_boundary:${boundary.regionId ?? "local"}`,
      kind: "host_boundary",
      position,
      distance,
      responseClass: "host_membrane",
      responseLabel: boundary.contactSurfaceCoverage?.shortLabel ?? "local_host_boundary",
      waveSpeed,
      pulseEventId,
      pulseMode,
      reachClass: distance <= 4.25 ? "local_actionable" : "deep_structural"
    });
  }

  makeEcho({ id, kind, position, distance, responseClass, responseLabel, waveSpeed, pulseEventId, pulseMode = "quick", reachClass = "local_actionable" }) {
    const contactAt = Math.max(0.035, distance / waveSpeed);
    const observationCount = Math.min(4, (this.sourceObservationCounts.get(id) ?? 0) + 1);
    const resolutionStage = Math.min(3, observationCount);
    const structuralInterpretation = reachClass === "deep_structural"
      ? resolutionStage === 1
        ? "distant_presence"
        : resolutionStage === 2
          ? "layering_and_intervening_volume"
          : "structural_relationship_not_immediate_target"
      : resolutionStage === 1
        ? "local_presence"
        : resolutionStage === 2
          ? "localized_surface_behavior"
          : "material_response_confirmed";
    return {
      id,
      kind,
      position,
      distance,
      responseClass,
      responseLabel,
      pulseEventId,
      pulseMode,
      reachClass,
      observationCount,
      resolutionStage,
      structuralInterpretation,
      waveSpeed,
      age: 0,
      contactAt,
      returnAt: contactAt * 2,
      contacted: false,
      returned: false
    };
  }

  classifyRecipe(recipe) {
    const domains = recipe?.chemistry?.domains ?? [];
    const state = String(recipe?.chemistry?.matterState ?? "");
    const pulse = String(recipe?.behavior?.onPulse ?? "");
    const haystack = `${domains.join(" ")} ${state} ${pulse}`.toLowerCase();
    if (haystack.includes("scar") || haystack.includes("residue") || haystack.includes("memory")) return "scar_memory";
    if (haystack.includes("seed") || haystack.includes("bloom") || haystack.includes("spore")) return "living_seed";
    if (haystack.includes("signal") || haystack.includes("resonan") || haystack.includes("charge")) return "signal_resonant";
    if (haystack.includes("fluid") || haystack.includes("flux") || haystack.includes("current") || haystack.includes("flow")) return "fluid_current";
    if (haystack.includes("shell") || haystack.includes("plate") || haystack.includes("mineral") || haystack.includes("hard")) return "dense_structure";
    return "living_material";
  }

  rememberAnswer(returnEcho) {
    if (!returnEcho?.position) return;
    const completedObservationCount = Math.max(
      this.sourceObservationCounts.get(returnEcho.id) ?? 0,
      returnEcho.observationCount ?? 1
    );
    this.sourceObservationCounts.set(returnEcho.id, completedObservationCount);
    const resolutionStage = Math.min(3, returnEcho.resolutionStage ?? completedObservationCount);
    const duplicateIndex = this.answerMemory.findIndex((memory) => memory.sourceId === returnEcho.id);
    const memory = {
      id: `answer_memory:${++this.answerMemorySerial}`,
      sourceId: returnEcho.id,
      responseClass: returnEcho.responseClass ?? "living_material",
      responseLabel: returnEcho.responseLabel ?? "material_response",
      pulseEventId: returnEcho.pulseEventId ?? 0,
      position: { ...returnEcho.position },
      pulseDistance: returnEcho.distance ?? 0,
      pulseMode: returnEcho.pulseMode ?? "quick",
      reachClass: returnEcho.reachClass ?? "local_actionable",
      observationCount: completedObservationCount,
      resolutionStage,
      structuralInterpretation: returnEcho.structuralInterpretation ?? "presence_only",
      age: 0,
      ttlSeconds: returnEcho.kind === "host_boundary"
        ? 5.8
        : returnEcho.reachClass === "deep_structural"
          ? this.answerMemoryDeepTtlSeconds + Math.max(0, resolutionStage - 1) * 1.2
          : this.answerMemoryTtlSeconds + Math.max(0, resolutionStage - 1) * 0.55
    };
    if (duplicateIndex >= 0) this.answerMemory.splice(duplicateIndex, 1);
    this.answerMemory.push(memory);
    while (this.answerMemory.length > this.answerMemoryMax) this.answerMemory.shift();
  }

  publicAnswerMemory(memory) {
    const dx = (memory.position?.x ?? 0) - (this.playerRoot.position?.x ?? 0);
    const dy = (memory.position?.y ?? 0) - (this.playerRoot.position?.y ?? 0);
    const dz = (memory.position?.z ?? 0) - (this.playerRoot.position?.z ?? 0);
    const currentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const remainingSeconds = Math.max(0, memory.ttlSeconds - memory.age);
    const reachClass = memory.reachClass ?? "local_actionable";
    const approachRadius = reachClass === "deep_structural" ? 8.8 : 3.6;
    // HC027F local lock: approachIntensity = clamp(1 - currentDistance / 3.6, 0, 1).
    const approachIntensity = reachClass === "deep_structural"
      ? clamp(1 - currentDistance / approachRadius, 0, 1)
      : clamp(1 - currentDistance / 3.6, 0, 1);
    const structuralPresence = reachClass === "deep_structural"
      ? clamp(1 - currentDistance / 11.5, 0, 0.55)
      : 0;
    return {
      id: memory.id,
      sourceId: memory.sourceId,
      responseClass: memory.responseClass,
      responseLabel: memory.responseLabel,
      pulseEventId: memory.pulseEventId,
      position: { ...memory.position },
      pulseDistance: round(memory.pulseDistance),
      pulseMode: memory.pulseMode ?? "quick",
      reachClass,
      observationCount: memory.observationCount ?? 1,
      resolutionStage: memory.resolutionStage ?? 1,
      structuralInterpretation: memory.structuralInterpretation ?? "presence_only",
      actionableNow: reachClass === "local_actionable",
      structuralOnly: reachClass === "deep_structural",
      structuralPresence: round(structuralPresence),
      currentDistance: round(currentDistance),
      age: round(memory.age),
      remainingSeconds: round(remainingSeconds),
      approachIntensity: round(approachIntensity),
      readReady: currentDistance <= 1.65,
      createsTarget: false,
      routeAuthority: false,
      progressionAuthority: false
    };
  }

  publicEcho(echo) {
    return {
      id: echo.id,
      kind: echo.kind,
      responseClass: echo.responseClass,
      responseLabel: echo.responseLabel,
      pulseEventId: echo.pulseEventId,
      pulseMode: echo.pulseMode ?? "quick",
      reachClass: echo.reachClass ?? "local_actionable",
      observationCount: echo.observationCount ?? 1,
      resolutionStage: echo.resolutionStage ?? 1,
      structuralInterpretation: echo.structuralInterpretation ?? "presence_only",
      distance: round(echo.distance),
      contactAt: round(echo.contactAt),
      returnAt: round(echo.returnAt),
      returnTravelSeconds: round(echo.returnAt - echo.contactAt),
      position: { ...echo.position }
    };
  }

  positionOf(vector) {
    return { x: vector?.x ?? 0, y: vector?.y ?? 0, z: vector?.z ?? 0 };
  }

  publish(frameState, newContacts, newReturns) {
    const active = this.activePulse;
    const publicMemory = this.answerMemory.map((memory) => this.publicAnswerMemory(memory));
    publicMemory.sort((a, b) => a.currentDistance - b.currentDistance);
    const nearestAnswerMemory = publicMemory[0] ?? null;
    frameState.coreSensoryResponse = {
      pass: "HC-027D",
      expressionPass: "HC-027J1",
      physiologyIntegrationPass: "HC-027J2",
      active: Boolean(active),
      owner: "CoreSensoryResponseSystem",
      law: "pulse_is_embodied_sonar_emit_contact_return",
      pulseEventId: active?.eventId ?? this.lastPulseEventId,
      pulseAge: round(active?.age ?? 0),
      waveSpeed: round(active?.waveSpeed ?? this.resolveRadialExpression(frameState).waveSpeed),
      maxRange: round(active?.maxRange ?? this.lastPulseRange),
      localActionableRange: 4.25,
      pulseMode: active?.pulseMode ?? this.lastPulseMode,
      charge01: round(active?.charge01 ?? 0),
      rangeChangedFromHC027C1: false,
      chargedStructuralReachIsPresentationOnly: true,
      chargedStructuralReachPhysiologyDriven: true,
      outgoingRadius: active ? round(Math.min(active.maxRange, active.age * active.waveSpeed)) : 0,
      radialCharacter: active?.radialCharacter ?? frameState.corePerformance?.personality ?? "forming / neutral",
      pendingEchoCount: this.echoes.filter((echo) => !echo.returned).length,
      newContacts,
      newReturns,
      pulseCount: this.pulseCount,
      returnCount: this.returnCount,
      lastReturn: this.lastReturn,
      answerMemory: publicMemory,
      answerMemoryCount: publicMemory.length,
      nearestAnswerMemory,
      answerMemoryLaw: "returned_world_answer_persists_briefly_where_it_was_heard",
      answerMemoryTtlSeconds: this.answerMemoryTtlSeconds,
      answerMemoryDeepTtlSeconds: this.answerMemoryDeepTtlSeconds,
      answerMemoryMax: this.answerMemoryMax,
      sensorySaturationSeconds: round(this.sensorySaturationSeconds),
      sensorySaturation01: round(clamp(this.sensorySaturationSeconds / 1.6, 0, 1)),
      reachLanguage: {
        quick: "local_actionable_answers_only",
        charged: "local_answers_plus_deep_structural_answers",
        deepAnswersCreateWaypoint: false,
        repeatedObservationLaw: "first_presence_second_layering_third_structural_relationship",
        repeatedObservationCreatesRouteAuthority: false
      },
      resolutionLanguage: {
        pass: "HC-027L1",
        law: "repeated_observation_increases_resolution_instead_of_replaying_identical_answer",
        stages: ["presence", "layering", "structural_relationship"],
        sourceObservationCount: nearestAnswerMemory?.observationCount ?? 0,
        nearestResolutionStage: nearestAnswerMemory?.resolutionStage ?? 0,
        nearestInterpretation: nearestAnswerMemory?.structuralInterpretation ?? "none",
        createsObjective: false,
        createsWaypoint: false,
        changesPulseRange: false
      },
      responseClasses: ["host_membrane", "living_seed", "scar_memory", "signal_resonant", "fluid_current", "dense_structure", "living_material"],
      gameplayAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      chemistryAuthority: false,
      movementAuthority: false,
      hiddenStateRevealEnabled: false,
      answerMemoryCreatesWaypoint: false,
      answerMemoryCreatesTarget: false,
      answerMemoryRouteAuthority: false
    };
  }
}
