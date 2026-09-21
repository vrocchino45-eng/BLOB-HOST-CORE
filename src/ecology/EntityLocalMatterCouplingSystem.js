const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));
const smooth01 = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/**
 * HC028M1 — Ecological Consequence Readability.
 *
 * Keeps HC028M's existing local Host-matter coupling, but makes the causal order
 * legible without adding a new world or ecology mechanic:
 *   Core relationship -> organism interpretation -> retained memory/behavior ->
 *   local Host matter answer -> decay back into the regional field.
 *
 * The organism still has no environment/gameplay authority. This bridge only
 * publishes a bounded presentation envelope for AmbientMaterialInteractionSystem,
 * which remains the sole owner of the existing 66 Host motes.
 */
export class EntityLocalMatterCouplingSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityLocalMatterCouplingSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityLocalMatterCouplingSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.lastPrimaryKey = "inactive";
    this.changeCount = 0;
    this.lifecycleById = new Map();
  }

  init() {
    this.frameState.entityLocalMatterCoupling = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const memoryById = frameState.entityReciprocalMemory?.byEntityId ?? {};
    const behaviorById = frameState.entityReciprocalBehavior?.byEntityId ?? {};
    const relationshipById = frameState.entityRelationshipGrammar?.byEntityId ?? {};
    const regional = frameState.regionalPhysicalEmbodiment ?? {};
    const fields = [];
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
      const root = entity?.root;
      if (!root?.visible) continue;

      const memory = memoryById[id] ?? null;
      const behavior = behaviorById[id] ?? null;
      const relationship = relationshipById[id] ?? null;
      const memoryStrength = clamp01(memory?.strength01 ?? 0);
      const behaviorStrength = clamp01(behavior?.strength01 ?? 0);
      const sourceStrength01 = Math.max(memoryStrength, behaviorStrength);
      const signature = this.resolveSignature(entity, behavior?.mode ?? "baseline", memory?.mode ?? "ambient_memory");
      if (!signature || sourceStrength01 <= 0.06) {
        this.resetLifecycle(id);
        continue;
      }

      const liveRelationshipActive = Boolean(
        (relationship?.engagement01 ?? 0) >= 0.14
        && (relationship?.chord ?? "idle") !== "idle"
        && (relationship?.interpretation ?? "ambient_listening") !== "ambient_listening"
      );
      const lifecycle = this.resolveLifecycle({
        id,
        dt,
        memory,
        behavior,
        liveRelationshipActive,
        sourceStrength01
      });

      const phraseStrength = regional.active ? clamp01(regional.phraseStrength ?? 0.5) : 0.5;
      const regionCoupling = 0.92 + phraseStrength * 0.08;
      const role = entity?.recipe?.ecologyGrammar?.role ?? (recipeId === "nursery_membrane_tender_001"
        ? "care_filter"
        : recipeId === "membrane_watcher_001"
          ? "anchored_sensor"
          : "organism");
      const fieldStrength = clamp01(sourceStrength01 * regionCoupling * lifecycle.envelope01);
      if (fieldStrength <= 0.025) continue;

      const radiusScale = lifecycle.stage === "forming"
        ? 0.76
        : lifecycle.stage === "answering"
          ? 0.82 + lifecycle.answerProgress01 * 0.18
          : lifecycle.stage === "releasing"
            ? 1 + (1 - lifecycle.envelope01) * 0.10
            : 1;
      const baseRadius = signature.radius + sourceStrength01 * signature.radiusLift;
      const anchorRadius = signature.anchorRadius ?? Math.max(0.42, baseRadius * 0.38);
      const anchorTightness = (signature.anchorTightness ?? 0.52)
        * (lifecycle.stage === "answering" ? 1.18 : lifecycle.stage === "forming" ? 0.72 : 1)
        * (0.72 + lifecycle.envelope01 * 0.28);

      const result = {
        entityId: id,
        role,
        mode: signature.mode,
        sourceBehaviorMode: behavior?.mode ?? "baseline",
        sourceMemoryMode: memory?.mode ?? "ambient_memory",
        strength01: round(fieldStrength),
        sourceStrength01: round(sourceStrength01),
        position: {
          x: round(root.position.x),
          y: round(root.position.y),
          z: round(root.position.z)
        },
        radius: round(baseRadius * radiusScale),
        radialBias: round(signature.radialBias),
        tangentialBias: round(signature.tangentialBias),
        verticalBias: round(signature.verticalBias),
        breathAmplitude: round(signature.breathAmplitude),
        oscillationRate: round(signature.oscillationRate),
        dampingBias: round(signature.dampingBias),
        anchorRadius: round(anchorRadius),
        anchorTightness: round(anchorTightness),
        localCohortBias: round(signature.localCohortBias ?? 0.74),
        causalStage: lifecycle.stage,
        causalEnvelope01: round(lifecycle.envelope01),
        answerProgress01: round(lifecycle.answerProgress01),
        releaseSeconds: round(lifecycle.releaseSeconds),
        liveRelationshipActive,
        memoryResponsePulse01: round(memory?.responsePulse01 ?? 0),
        memoryRemainingSeconds: round(memory?.remainingSeconds ?? 0),
        phaseOffset: round(Number(entity?.recipe?.ecologyGrammar?.phaseOffset ?? (recipeId === "membrane_watcher_001" ? 1.37 : 0.42))),
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        hostMatterPresentationAuthority: true,
        entityMovementAuthority: false,
        playerMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      };
      fields.push(result);
      if (!primary || fieldStrength > primary.strength01) primary = result;
    }

    const primaryKey = primary ? `${primary.entityId}:${primary.mode}:${primary.causalStage}` : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityLocalMatterCoupling = {
      pass: "HC-028M1",
      active: fields.length > 0,
      owner: "EntityLocalMatterCouplingSystem",
      sourceOwner: "EntityRelationshipGrammarSystem + EntityReciprocalMemorySystem + EntityReciprocalBehaviorSystem + EntitySystem",
      changeCount: this.changeCount,
      primary: primary ?? {
        entityId: "none",
        role: "none",
        mode: "ambient",
        strength01: 0,
        causalStage: "inactive",
        causalEnvelope01: 0,
        position: null,
        radius: 0
      },
      fields,
      region: regional.region ?? "unassigned",
      regionalMatter: regional.matter ?? "unassigned",
      regionalLaw: regional.law ?? "none",
      causalSequence: ["core_relationship", "organism_interpretation", "retained_memory_behavior", "local_host_matter_answer", "regional_decay"],
      relationshipOwnsImmediateRead: true,
      localMatterAnswersAfterOrganism: true,
      matterPersistsAfterVerbRelease: true,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      hiddenAffinityScore: false,
      inputTimingGate: false,
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
      rule: "organism_reads_first_then_existing_host_motes_form_a_bounded_local_answer_that_sustains_and_decays_back_into_the_region"
    };
  }

  resolveLifecycle({ id, dt, memory, behavior, liveRelationshipActive, sourceStrength01 }) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const memoryMode = memory?.mode ?? "ambient_memory";
    const behaviorMode = behavior?.mode ?? "baseline";
    const key = `${memoryMode}:${behaviorMode}`;
    const lifecycle = this.ensureLifecycle(id);

    if (lifecycle.key !== key) {
      lifecycle.key = key;
      lifecycle.stage = liveRelationshipActive ? "forming" : "answering";
      lifecycle.releaseSeconds = 0;
      lifecycle.liveSeconds = 0;
      lifecycle.wasLive = liveRelationshipActive;
    }

    if (liveRelationshipActive) {
      lifecycle.stage = "forming";
      lifecycle.liveSeconds += safeDt;
      lifecycle.releaseSeconds = 0;
      lifecycle.wasLive = true;
      lifecycle.answerProgress01 = 0;
      // Keep Host matter subordinate while the verb + organism body own the immediate read.
      lifecycle.envelope01 = 0.10 + smooth01(lifecycle.liveSeconds / 0.42) * 0.20;
      return lifecycle;
    }

    if (lifecycle.wasLive) {
      lifecycle.wasLive = false;
      lifecycle.releaseSeconds = 0;
      lifecycle.stage = "answering";
    }

    lifecycle.releaseSeconds += safeDt;
    if (lifecycle.releaseSeconds < 0.58) {
      lifecycle.stage = "answering";
      lifecycle.answerProgress01 = smooth01(lifecycle.releaseSeconds / 0.58);
      lifecycle.envelope01 = 0.26 + lifecycle.answerProgress01 * 0.74;
    } else if (sourceStrength01 > 0.34) {
      lifecycle.stage = "expressing";
      lifecycle.answerProgress01 = 1;
      lifecycle.envelope01 = 1;
    } else {
      lifecycle.stage = "releasing";
      lifecycle.answerProgress01 = 1;
      lifecycle.envelope01 = clamp01(sourceStrength01 / 0.34) * 0.92;
    }

    return lifecycle;
  }

  ensureLifecycle(id) {
    if (this.lifecycleById.has(id)) return this.lifecycleById.get(id);
    const lifecycle = {
      key: "ambient_memory:baseline",
      stage: "inactive",
      liveSeconds: 0,
      releaseSeconds: 0,
      wasLive: false,
      answerProgress01: 0,
      envelope01: 0
    };
    this.lifecycleById.set(id, lifecycle);
    return lifecycle;
  }

  resetLifecycle(id) {
    const lifecycle = this.lifecycleById.get(id);
    if (!lifecycle) return;
    lifecycle.key = "ambient_memory:baseline";
    lifecycle.stage = "inactive";
    lifecycle.liveSeconds = 0;
    lifecycle.releaseSeconds = 0;
    lifecycle.wasLive = false;
    lifecycle.answerProgress01 = 0;
    lifecycle.envelope01 = 0;
  }

  resolveSignature(entity, behaviorMode, memoryMode) {
    const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
    if (recipeId === "nursery_membrane_tender_001") {
      if (behaviorMode === "approach_care") {
        return { mode: "care_breath", radius: 1.72, radiusLift: 0.34, radialBias: -0.020, tangentialBias: 0.008, verticalBias: 0.004, breathAmplitude: 0.046, oscillationRate: 1.25, dampingBias: 0.16, anchorRadius: 0.72, anchorTightness: 0.68, localCohortBias: 0.82 };
      }
      if (behaviorMode === "guarded_space") {
        return { mode: "protective_retraction", radius: 1.62, radiusLift: 0.28, radialBias: -0.044, tangentialBias: 0.004, verticalBias: -0.002, breathAmplitude: 0.012, oscillationRate: 0.72, dampingBias: 0.34, anchorRadius: 0.58, anchorTightness: 0.84, localCohortBias: 0.88 };
      }
      if (behaviorMode === "settle_nearby") {
        return { mode: "coherent_settle", radius: 1.66, radiusLift: 0.30, radialBias: -0.012, tangentialBias: 0.002, verticalBias: -0.004, breathAmplitude: 0.018, oscillationRate: 0.82, dampingBias: 0.46, anchorRadius: 0.64, anchorTightness: 0.76, localCohortBias: 0.80 };
      }
      if (behaviorMode === "attentive_follow") {
        return { mode: "signal_follow", radius: 1.72, radiusLift: 0.32, radialBias: -0.010, tangentialBias: 0.030, verticalBias: 0.004, breathAmplitude: 0.024, oscillationRate: 1.55, dampingBias: 0.12, anchorRadius: 0.70, anchorTightness: 0.60, localCohortBias: 0.76 };
      }
      if (["care_exchange_retained", "reciprocity_retained", "whole_core_signature_retained"].includes(memoryMode)) {
        return { mode: "care_breath", radius: 1.70, radiusLift: 0.30, radialBias: -0.018, tangentialBias: 0.007, verticalBias: 0.003, breathAmplitude: 0.040, oscillationRate: 1.18, dampingBias: 0.14, anchorRadius: 0.70, anchorTightness: 0.64, localCohortBias: 0.80 };
      }
    }

    if (recipeId === "membrane_watcher_001") {
      if (behaviorMode === "hold_sample") {
        return { mode: "sample_hold", radius: 1.46, radiusLift: 0.24, radialBias: -0.028, tangentialBias: 0.014, verticalBias: 0.001, breathAmplitude: 0.012, oscillationRate: 1.05, dampingBias: 0.42, anchorRadius: 0.48, anchorTightness: 0.92, localCohortBias: 0.92 };
      }
      if (behaviorMode === "counter_scan") {
        return { mode: "counter_sense_ripple", radius: 1.62, radiusLift: 0.28, radialBias: 0.010, tangentialBias: 0.056, verticalBias: 0.002, breathAmplitude: 0.032, oscillationRate: 2.10, dampingBias: 0.06, anchorRadius: 0.82, anchorTightness: 0.54, localCohortBias: 0.74 };
      }
      if (behaviorMode === "guarded_anchor") {
        return { mode: "anchored_quiet", radius: 1.40, radiusLift: 0.22, radialBias: -0.020, tangentialBias: 0.003, verticalBias: -0.003, breathAmplitude: 0.008, oscillationRate: 0.58, dampingBias: 0.50, anchorRadius: 0.46, anchorTightness: 0.90, localCohortBias: 0.90 };
      }
      if (behaviorMode === "settled_watch") {
        return { mode: "quiet_observation", radius: 1.48, radiusLift: 0.24, radialBias: -0.006, tangentialBias: 0.006, verticalBias: -0.002, breathAmplitude: 0.010, oscillationRate: 0.74, dampingBias: 0.38, anchorRadius: 0.54, anchorTightness: 0.78, localCohortBias: 0.86 };
      }
      if (["sample_retained", "counter_signature_retained", "full_spectrum_signature_retained"].includes(memoryMode)) {
        return { mode: "sample_hold", radius: 1.44, radiusLift: 0.22, radialBias: -0.024, tangentialBias: 0.012, verticalBias: 0.001, breathAmplitude: 0.012, oscillationRate: 1.0, dampingBias: 0.38, anchorRadius: 0.50, anchorTightness: 0.86, localCohortBias: 0.90 };
      }
    }

    const authored = entity?.recipe?.ecologyGrammar?.localMatterSignatures ?? {};
    const profile = authored[behaviorMode] ?? authored[memoryMode] ?? null;
    if (profile?.mode) {
      return {
        mode: profile.mode,
        radius: Number(profile.radius ?? 1.5),
        radiusLift: Number(profile.radiusLift ?? 0.24),
        radialBias: Number(profile.radialBias ?? 0),
        tangentialBias: Number(profile.tangentialBias ?? 0),
        verticalBias: Number(profile.verticalBias ?? 0),
        breathAmplitude: Number(profile.breathAmplitude ?? 0.01),
        oscillationRate: Number(profile.oscillationRate ?? 1),
        dampingBias: Number(profile.dampingBias ?? 0.18),
        anchorRadius: Number(profile.anchorRadius ?? 0.58),
        anchorTightness: Number(profile.anchorTightness ?? 0.62),
        localCohortBias: Number(profile.localCohortBias ?? 0.82)
      };
    }

    return null;
  }

  inactiveState() {
    return {
      pass: "HC-028M1",
      active: false,
      owner: "EntityLocalMatterCouplingSystem",
      primary: { entityId: "none", role: "none", mode: "ambient", strength01: 0, causalStage: "inactive", causalEnvelope01: 0, position: null, radius: 0 },
      fields: [],
      causalSequence: ["core_relationship", "organism_interpretation", "retained_memory_behavior", "local_host_matter_answer", "regional_decay"],
      relationshipOwnsImmediateRead: true,
      localMatterAnswersAfterOrganism: true,
      matterPersistsAfterVerbRelease: true,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      hiddenAffinityScore: false,
      inputTimingGate: false,
      entityMovementAuthority: false,
      playerMovementAuthority: false,
      collisionAuthority: false,
      chemistryAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      routeAuthority: false
    };
  }
}
