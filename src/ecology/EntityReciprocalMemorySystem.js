const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028K — Reciprocal Ecological Memory.
 *
 * Gives the existing Tender/Watcher a short-lived memory of a relationship gesture
 * they actually experienced through HC028J. This is not an affinity meter and does
 * not mutate bond, repair, progression, combat, movement, targeting or verb power.
 * It only lets a meaningful interaction continue to live in the organism's body for
 * several seconds after the player releases the chord.
 */
export class EntityReciprocalMemorySystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityReciprocalMemorySystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityReciprocalMemorySystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.memoryById = new Map();
    this.commitCount = 0;
    this.lastPrimaryKey = "inactive";
  }

  init() {
    this.frameState.entityReciprocalMemory = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const relationship = frameState.entityRelationshipGrammar ?? {};
    const relationshipById = relationship.byEntityId ?? {};
    const summaries = [];
    const byEntityId = {};
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
      const visible = Boolean(entity?.root?.visible);
      const live = relationshipById[id] ?? null;
      const memory = this.ensureMemory(id);
      const engagement01 = visible ? clamp01(live?.engagement01 ?? 0) : 0;
      const interpretation = engagement01 > 0.06 ? live?.interpretation ?? "ambient_listening" : "ambient_listening";
      const chord = engagement01 > 0.06 ? live?.chord ?? "idle" : "idle";
      const meaningful = visible && interpretation !== "ambient_listening" && chord !== "idle" && engagement01 >= 0.14;

      if (meaningful) {
        if (memory.pendingInterpretation === interpretation) {
          memory.pendingSeconds += Math.max(0, dt) * (0.78 + engagement01 * 0.42);
        } else {
          memory.pendingInterpretation = interpretation;
          memory.pendingChord = chord;
          memory.pendingSeconds = Math.max(0, dt) * 0.55;
        }

        memory.liveGesture = this.copyGesture(live?.gesture);
        memory.quietSeconds = 0;

        const authoredCommit = Number(entity?.recipe?.ecologyGrammar?.memory?.commitThreshold);
        const commitThreshold = Number.isFinite(authoredCommit)
          ? authoredCommit
          : recipeId === "membrane_watcher_001" ? 0.38 : 0.50;
        if (memory.pendingSeconds >= commitThreshold) {
          const nextMode = this.resolveMemoryMode(entity, interpretation, Boolean(live?.bonded));
          const changed = nextMode !== memory.mode || interpretation !== memory.interpretation;
          memory.mode = nextMode;
          memory.interpretation = interpretation;
          memory.chord = chord;
          memory.gesture = this.copyGesture(live?.gesture);
          memory.durationSeconds = this.resolveDuration(entity, interpretation, Boolean(live?.bonded));
          memory.remainingSeconds = memory.durationSeconds;
          memory.strength01 = Math.max(memory.strength01, clamp01(0.58 + engagement01 * 0.42));
          memory.responsePulse01 = changed ? 1 : Math.max(memory.responsePulse01, 0.28 + engagement01 * 0.30);
          memory.bonded = Boolean(live?.bonded);
          if (changed) {
            memory.commitCount += 1;
            this.commitCount += 1;
          }
        }
      } else {
        memory.pendingSeconds = Math.max(0, memory.pendingSeconds - Math.max(0, dt) * 1.7);
        if (memory.pendingSeconds <= 0.001) {
          memory.pendingInterpretation = "ambient_listening";
          memory.pendingChord = "idle";
        }
        memory.quietSeconds += Math.max(0, dt);
      }

      memory.responsePulse01 = Math.max(0, memory.responsePulse01 - Math.max(0, dt) * 1.75);

      if (memory.remainingSeconds > 0) {
        memory.remainingSeconds = Math.max(0, memory.remainingSeconds - Math.max(0, dt));
        const targetStrength = memory.durationSeconds > 0
          ? clamp01(memory.remainingSeconds / Math.max(0.001, memory.durationSeconds))
          : 0;
        // Keep the committed gesture readable briefly, then let it decay naturally.
        memory.strength01 = Math.max(targetStrength, memory.strength01 - Math.max(0, dt) * 0.11);
      } else {
        memory.strength01 = Math.max(0, memory.strength01 - Math.max(0, dt) * 0.65);
        if (memory.strength01 <= 0.02) {
          memory.mode = "ambient_memory";
          memory.interpretation = "ambient_listening";
          memory.chord = "idle";
          memory.gesture = this.zeroGesture();
          memory.bonded = false;
        }
      }

      const rememberedGesture = this.scaleGesture(memory.gesture, memory.strength01);
      const result = {
        id,
        visible,
        mode: memory.mode,
        interpretation: memory.interpretation,
        chord: memory.chord,
        bonded: memory.bonded,
        strength01: round(memory.strength01),
        responsePulse01: round(memory.responsePulse01),
        remainingSeconds: round(memory.remainingSeconds),
        pendingInterpretation: memory.pendingInterpretation,
        pendingSeconds: round(memory.pendingSeconds),
        gesture: rememberedGesture,
        commitCount: memory.commitCount,
        gameplayAuthority: false
      };

      byEntityId[id] = result;
      summaries.push(result);
      entity.root.userData.reciprocalEcologyMemory = result;

      if (visible && memory.strength01 > 0.06 && (!primary || memory.strength01 > primary.strength01)) {
        primary = result;
      }
    }

    const primaryKey = primary ? `${primary.id}:${primary.mode}:${primary.interpretation}` : "inactive";
    if (primaryKey !== this.lastPrimaryKey) this.lastPrimaryKey = primaryKey;

    frameState.entityReciprocalMemory = {
      pass: "HC-028K",
      active: Boolean(primary),
      owner: "EntityReciprocalMemorySystem",
      sourceOwner: "EntityRelationshipGrammarSystem + EntitySystem",
      commitCount: this.commitCount,
      primary: primary ? {
        entityId: primary.id,
        mode: primary.mode,
        interpretation: primary.interpretation,
        strength01: primary.strength01,
        responsePulse01: primary.responsePulse01
      } : {
        entityId: "none",
        mode: "ambient_memory",
        interpretation: "ambient_listening",
        strength01: 0,
        responsePulse01: 0
      },
      byEntityId,
      entities: summaries,
      hiddenAffinityScore: false,
      inputTimingGate: false,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      verbPowerAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      rule: "meaningful_entity_relationship_gestures_leave_short_lived_embodied_memory_without_affinity_points_or_gameplay_authority"
    };
  }

  ensureMemory(id) {
    if (this.memoryById.has(id)) return this.memoryById.get(id);
    const memory = {
      mode: "ambient_memory",
      interpretation: "ambient_listening",
      chord: "idle",
      bonded: false,
      pendingInterpretation: "ambient_listening",
      pendingChord: "idle",
      pendingSeconds: 0,
      quietSeconds: 0,
      durationSeconds: 0,
      remainingSeconds: 0,
      strength01: 0,
      responsePulse01: 0,
      gesture: this.zeroGesture(),
      liveGesture: this.zeroGesture(),
      commitCount: 0
    };
    this.memoryById.set(id, memory);
    return memory;
  }

  resolveDuration(entity, interpretation, bonded) {
    const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
    if (recipeId === "nursery_membrane_tender_001") {
      if (interpretation === "reciprocal_exchange" || interpretation === "whole_core_attunement") return bonded ? 10.5 : 8.5;
      if (interpretation === "safe_receive" || interpretation === "shared_intake") return bonded ? 9.5 : 7.5;
      return bonded ? 8.5 : 6.8;
    }
    if (recipeId === "membrane_watcher_001") {
      if (interpretation === "full_spectrum_watch" || interpretation === "counter_sensing") return 9.2;
      return 7.8;
    }
    const authored = entity?.recipe?.ecologyGrammar?.memory ?? {};
    const authoredDuration = Number(authored.durationByInterpretation?.[interpretation] ?? authored.defaultDuration);
    if (Number.isFinite(authoredDuration) && authoredDuration > 0) return authoredDuration;
    return 6.5;
  }

  resolveMemoryMode(entity, interpretation, bonded) {
    const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
    if (recipeId === "nursery_membrane_tender_001") {
      const map = {
        signal_offered: "signal_remembered",
        shared_intake: "care_exchange_retained",
        guarded_draw: "protective_distance_retained",
        settled_presence: "settled_presence_retained",
        steady_signal: "steady_signal_retained",
        safe_receive: "care_exchange_retained",
        cautious_receive: "cautious_contact_retained",
        reciprocal_exchange: "reciprocity_retained",
        testing_exchange: "testing_contact_retained",
        whole_core_attunement: "whole_core_signature_retained",
        whole_core_display: "whole_core_signature_observed"
      };
      const mode = map[interpretation] ?? "gesture_remembered";
      return bonded && mode === "cautious_contact_retained" ? "care_exchange_retained" : mode;
    }

    if (recipeId === "membrane_watcher_001") {
      const map = {
        answering_probe: "probe_signature_retained",
        guarded_retraction: "defensive_signature_retained",
        anchored_observation: "observation_retained",
        stable_interrogation: "stable_signal_retained",
        contained_sampling: "sample_retained",
        counter_sensing: "counter_signature_retained",
        full_spectrum_watch: "full_spectrum_signature_retained"
      };
      return map[interpretation] ?? "signature_retained";
    }

    const authoredMode = entity?.recipe?.ecologyGrammar?.memory?.modeByInterpretation?.[interpretation];
    return authoredMode ?? "gesture_remembered";
  }

  copyGesture(gesture = {}) {
    return {
      outward01: clamp01(gesture.outward01 ?? 0),
      inward01: clamp01(gesture.inward01 ?? 0),
      settle01: clamp01(gesture.settle01 ?? 0),
      reciprocity01: clamp01(gesture.reciprocity01 ?? 0)
    };
  }

  scaleGesture(gesture = {}, scale = 0) {
    const s = clamp01(scale);
    return {
      outward01: round(clamp01(gesture.outward01 ?? 0) * s),
      inward01: round(clamp01(gesture.inward01 ?? 0) * s),
      settle01: round(clamp01(gesture.settle01 ?? 0) * s),
      reciprocity01: round(clamp01(gesture.reciprocity01 ?? 0) * s)
    };
  }

  zeroGesture() {
    return { outward01: 0, inward01: 0, settle01: 0, reciprocity01: 0 };
  }

  inactiveState() {
    return {
      pass: "HC-028K",
      active: false,
      owner: "EntityReciprocalMemorySystem",
      commitCount: 0,
      primary: { entityId: "none", mode: "ambient_memory", interpretation: "ambient_listening", strength01: 0, responsePulse01: 0 },
      byEntityId: {},
      entities: [],
      hiddenAffinityScore: false,
      inputTimingGate: false,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      verbPowerAuthority: false,
      progressionAuthority: false,
      routeAuthority: false
    };
  }
}
