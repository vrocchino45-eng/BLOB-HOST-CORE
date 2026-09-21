const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));
const smooth01 = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/**
 * HC028P — Ecological Cross-Influence.
 *
 * HC028O already lets an organism read another organism's temporary HC028N Host
 * residue. HC028P adds one bounded physical reply: the recognizing organism may
 * briefly bias the existing local Host-mote field around its own body.
 *
 * This is deliberately A -> Host -> B -> Host, not a recursive ecology engine.
 * Self-traces never trigger cross-influence, recognition does not write reciprocal
 * memory, and these response fields are explicitly ineligible for HC028N residue.
 * EntitySystem remains the sole entity movement/behavior owner and
 * AmbientMaterialInteractionSystem remains the sole Host-mote motion owner.
 */
export class EntityEcologicalCrossInfluenceSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityEcologicalCrossInfluenceSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityEcologicalCrossInfluenceSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.responseByEntityId = new Map();
    this.lastPrimaryKey = "inactive";
    this.changeCount = 0;
  }

  init() {
    this.frameState.entityEcologicalCrossInfluence = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const recognitionById = frameState.entityResidueRecognition?.byEntityId ?? {};
    const fields = [];
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
      const root = entity?.root;
      const state = this.ensureState(id);
      const recognition = recognitionById[id] ?? null;
      const eligible = Boolean(
        root?.visible
        && recognition?.active
        && recognition?.relation === "other_trace"
        && clamp01(recognition?.strength01 ?? 0) >= 0.055
      );
      const recognitionKey = eligible ? this.recognitionKey(recognition) : "inactive";

      if (recognitionKey !== state.seenKey) {
        state.seenKey = recognitionKey;
        if (recognitionKey === "inactive") {
          // Re-arm only after the organism genuinely stops reading this trace.
          state.armed = true;
        } else if (state.armed) {
          this.beginResponse(state, id, recipeId, recognition);
          state.armed = false;
        }
      }

      if (!state.active) continue;
      state.elapsedSeconds += safeDt;
      const envelope01 = this.responseEnvelope(state.elapsedSeconds, state.durationSeconds);
      if (state.elapsedSeconds >= state.durationSeconds || envelope01 <= 0.002) {
        state.active = false;
        continue;
      }

      const signature = this.resolveSignature(state.recipeId ?? recipeId, state.interpretation);
      if (!signature || !root?.visible) continue;
      const responseStrength01 = Math.min(
        signature.maxStrength,
        clamp01(state.triggerStrength01 * signature.gain * envelope01)
      );
      if (responseStrength01 <= 0.012) continue;

      const stage = this.responseStage(state.elapsedSeconds, state.durationSeconds);
      const field = {
        entityId: id,
        role: recipeId === "nursery_membrane_tender_001"
          ? "relational_care_filter"
          : recipeId === "membrane_watcher_001"
            ? "anchored_sensor"
            : "organism",
        mode: signature.mode,
        causalStage: stage,
        strength01: round(responseStrength01),
        triggerStrength01: round(state.triggerStrength01),
        elapsedSeconds: round(state.elapsedSeconds, 2),
        durationSeconds: round(state.durationSeconds, 2),
        position: {
          x: round(root.position.x),
          y: round(root.position.y),
          z: round(root.position.z)
        },
        radius: round(signature.radius),
        radialBias: round(signature.radialBias),
        tangentialBias: round(signature.tangentialBias),
        verticalBias: round(signature.verticalBias),
        breathAmplitude: round(signature.breathAmplitude),
        oscillationRate: round(signature.oscillationRate),
        dampingBias: round(signature.dampingBias),
        anchorRadius: round(signature.anchorRadius),
        anchorTightness: round(signature.anchorTightness),
        localCohortBias: round(signature.localCohortBias),
        phaseOffset: round(recipeId === "membrane_watcher_001" ? 2.13 : 0.91),
        sourceEntityId: state.sourceEntityId,
        sourceMode: state.sourceMode,
        sourceInterpretation: state.interpretation,
        sourceResiduePosition: state.sourceResiduePosition,
        relation: "other_trace",
        crossOrganismOnly: true,
        followsRecognizingOrganism: true,
        createsResidue: false,
        refreshesResidue: false,
        consumesResidue: false,
        writesReciprocalMemory: false,
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        hostMatterDirectiveAuthority: true,
        entityBehaviorAuthority: false,
        entityMovementAuthority: false,
        playerMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false,
        saveStateAuthority: false,
        hiddenAffinityScore: false
      };
      fields.push(field);
      if (!primary || field.strength01 > primary.strength01) primary = field;
    }

    const primaryKey = primary
      ? `${primary.entityId}:${primary.mode}:${primary.causalStage}:${primary.sourceEntityId}`
      : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityEcologicalCrossInfluence = {
      pass: "HC-028P",
      active: fields.length > 0,
      owner: "EntityEcologicalCrossInfluenceSystem",
      sourceOwner: "EntityResidueRecognitionSystem",
      presentationConsumer: "AmbientMaterialInteractionSystem",
      changeCount: this.changeCount,
      primary: primary ?? this.inactivePrimary(),
      fields,
      readsOtherOrganismResidueOnly: true,
      selfTraceCrossInfluence: false,
      oneShotPerContinuousRecognition: true,
      requiresRecognitionResetToRetrigger: true,
      createsResidue: false,
      refreshesResidue: false,
      consumesResidue: false,
      writesReciprocalMemory: false,
      crossInfluenceChain: ["organism_a_residue", "organism_b_recognition", "organism_b_local_host_reply"],
      recursivePropagation: false,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      hiddenAffinityScore: false,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      playerMovementAuthority: false,
      collisionAuthority: false,
      chemistryAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      saveStateAuthority: false,
      rule: "another_organisms_host_trace_may_provoke_one_short_local_host_reply_around_the_recognizing_organism_without_creating_new_memory_or_residue"
    };
  }

  recognitionKey(recognition) {
    const p = recognition?.residuePosition ?? {};
    return [
      recognition?.sourceEntityId ?? "unknown_source",
      recognition?.sourceMode ?? "unknown_mode",
      recognition?.interpretation ?? "ambient_trace_unread",
      round(p.x ?? 0, 1),
      round(p.y ?? 0, 1),
      round(p.z ?? 0, 1)
    ].join(":");
  }

  beginResponse(state, id, recipeId, recognition) {
    state.active = true;
    state.elapsedSeconds = 0;
    state.recipeId = recipeId;
    state.durationSeconds = this.resolveDuration(recipeId, recognition?.interpretation ?? "ambient_trace_unread");
    state.triggerStrength01 = clamp01(recognition?.strength01 ?? 0);
    state.sourceEntityId = recognition?.sourceEntityId ?? "unknown_source";
    state.sourceMode = recognition?.sourceMode ?? "unknown_mode";
    state.interpretation = recognition?.interpretation ?? "ambient_trace_unread";
    state.sourceResiduePosition = recognition?.residuePosition
      ? {
          x: round(recognition.residuePosition.x),
          y: round(recognition.residuePosition.y),
          z: round(recognition.residuePosition.z)
        }
      : null;
  }

  responseEnvelope(elapsedSeconds, durationSeconds) {
    if (durationSeconds <= 0) return 0;
    const attackSeconds = Math.min(0.42, durationSeconds * 0.18);
    const releaseSeconds = Math.min(1.6, durationSeconds * 0.38);
    if (elapsedSeconds < attackSeconds) return smooth01(elapsedSeconds / Math.max(0.001, attackSeconds));
    const releaseStart = Math.max(attackSeconds, durationSeconds - releaseSeconds);
    if (elapsedSeconds < releaseStart) return 1;
    return 1 - smooth01((elapsedSeconds - releaseStart) / Math.max(0.001, releaseSeconds));
  }

  responseStage(elapsedSeconds, durationSeconds) {
    if (elapsedSeconds < Math.min(0.42, durationSeconds * 0.18)) return "answering";
    if (elapsedSeconds > durationSeconds - Math.min(1.6, durationSeconds * 0.38)) return "releasing";
    return "expressing";
  }

  resolveDuration(id, interpretation) {
    if (id === "membrane_watcher_001") {
      return /counter|compare/.test(interpretation) ? 4.8 : 4.25;
    }
    if (id === "nursery_membrane_tender_001") {
      return /caution|guarded|sensor|counter|boundary/.test(interpretation) ? 4.1 : 4.5;
    }
    return 3.8;
  }

  resolveSignature(id, interpretation) {
    if (id === "nursery_membrane_tender_001") {
      if (/(caution|guarded|sensor|counter|boundary)/.test(interpretation)) {
        return {
          mode: "protective_listening_hush",
          gain: 0.58,
          maxStrength: 0.30,
          radius: 1.48,
          radialBias: -0.026,
          tangentialBias: /counter/.test(interpretation) ? 0.024 : 0.008,
          verticalBias: -0.002,
          breathAmplitude: 0.010,
          oscillationRate: 0.84,
          dampingBias: 0.30,
          anchorRadius: 0.56,
          anchorTightness: 0.72,
          localCohortBias: 0.88
        };
      }
      return {
        mode: "received_trace_settle",
        gain: 0.54,
        maxStrength: 0.28,
        radius: 1.58,
        radialBias: -0.010,
        tangentialBias: 0.006,
        verticalBias: 0.001,
        breathAmplitude: 0.018,
        oscillationRate: 0.94,
        dampingBias: 0.20,
        anchorRadius: 0.64,
        anchorTightness: 0.62,
        localCohortBias: 0.84
      };
    }

    if (id === "membrane_watcher_001") {
      if (/(counter|compare)/.test(interpretation)) {
        return {
          mode: "cross_signature_compare",
          gain: 0.62,
          maxStrength: 0.32,
          radius: 1.54,
          radialBias: 0.006,
          tangentialBias: 0.044,
          verticalBias: 0.001,
          breathAmplitude: 0.012,
          oscillationRate: 1.86,
          dampingBias: 0.10,
          anchorRadius: 0.72,
          anchorTightness: 0.56,
          localCohortBias: 0.80
        };
      }
      return {
        mode: "foreign_signature_hold",
        gain: 0.60,
        maxStrength: 0.31,
        radius: 1.38,
        radialBias: -0.022,
        tangentialBias: 0.016,
        verticalBias: 0.001,
        breathAmplitude: 0.008,
        oscillationRate: 1.18,
        dampingBias: 0.28,
        anchorRadius: 0.48,
        anchorTightness: 0.82,
        localCohortBias: 0.91
      };
    }

    return {
      mode: "ambient_cross_notice",
      gain: 0.46,
      maxStrength: 0.24,
      radius: 1.32,
      radialBias: -0.008,
      tangentialBias: 0.010,
      verticalBias: 0,
      breathAmplitude: 0.010,
      oscillationRate: 1,
      dampingBias: 0.18,
      anchorRadius: 0.54,
      anchorTightness: 0.58,
      localCohortBias: 0.84
    };
  }

  ensureState(id) {
    if (!this.responseByEntityId.has(id)) {
      this.responseByEntityId.set(id, {
        recipeId: "unknown_entity",
        seenKey: "inactive",
        armed: true,
        active: false,
        elapsedSeconds: 0,
        durationSeconds: 0,
        triggerStrength01: 0,
        sourceEntityId: "none",
        sourceMode: "none",
        interpretation: "ambient_trace_unread",
        sourceResiduePosition: null
      });
    }
    return this.responseByEntityId.get(id);
  }

  inactivePrimary() {
    return {
      entityId: "none",
      role: "none",
      mode: "ambient_cross_notice",
      causalStage: "inactive",
      strength01: 0,
      triggerStrength01: 0,
      elapsedSeconds: 0,
      durationSeconds: 0,
      position: null,
      radius: 0,
      sourceEntityId: "none",
      sourceMode: "none",
      sourceInterpretation: "ambient_trace_unread",
      relation: "none"
    };
  }

  inactiveState() {
    return {
      pass: "HC-028P",
      active: false,
      owner: "EntityEcologicalCrossInfluenceSystem",
      sourceOwner: "EntityResidueRecognitionSystem",
      presentationConsumer: "AmbientMaterialInteractionSystem",
      changeCount: 0,
      primary: this.inactivePrimary(),
      fields: [],
      readsOtherOrganismResidueOnly: true,
      selfTraceCrossInfluence: false,
      oneShotPerContinuousRecognition: true,
      requiresRecognitionResetToRetrigger: true,
      createsResidue: false,
      refreshesResidue: false,
      consumesResidue: false,
      writesReciprocalMemory: false,
      recursivePropagation: false,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      hiddenAffinityScore: false,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      playerMovementAuthority: false,
      collisionAuthority: false,
      chemistryAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      saveStateAuthority: false,
      rule: "another_organisms_host_trace_may_provoke_one_short_local_host_reply_around_the_recognizing_organism_without_creating_new_memory_or_residue"
    };
  }
}
