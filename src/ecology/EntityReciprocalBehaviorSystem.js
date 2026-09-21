const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028L — Reciprocal Ecological Behavior.
 *
 * Converts HC028K's short-lived ecological memory into a bounded behavior directive
 * for the existing authored organisms. This system does not move entities itself;
 * EntitySystem remains the sole movement/AI owner and may consume the directive on
 * the following frame. No bond, repair, combat, targeting, progression, route or
 * player-movement authority is introduced here.
 */
export class EntityReciprocalBehaviorSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityReciprocalBehaviorSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityReciprocalBehaviorSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.lastPrimaryKey = "inactive";
    this.changeCount = 0;
  }

  init() {
    this.frameState.entityReciprocalBehavior = this.inactiveState();
  }

  update(_dt, frameState = this.frameState) {
    const memory = frameState.entityReciprocalMemory ?? {};
    const memoryById = memory.byEntityId ?? {};
    const byEntityId = {};
    const summaries = [];
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
      const visible = Boolean(entity?.root?.visible);
      const retained = memoryById[id] ?? null;
      const strength01 = visible ? clamp01(retained?.strength01 ?? 0) : 0;
      const directive = this.resolveDirective(entity, retained?.mode ?? "ambient_memory", retained?.interpretation ?? "ambient_listening", strength01);
      const active = visible && directive.mode !== "baseline" && strength01 > 0.06;
      const result = {
        id,
        visible,
        active,
        role: entity?.recipe?.ecologyGrammar?.role ?? (recipeId === "nursery_membrane_tender_001" ? "care_filter" : recipeId === "membrane_watcher_001" ? "anchored_sensor" : "organism"),
        mode: directive.mode,
        sourceMemoryMode: retained?.mode ?? "ambient_memory",
        sourceInterpretation: retained?.interpretation ?? "ambient_listening",
        strength01: round(strength01),
        approach01: round(directive.approach01 * strength01),
        distance01: round(directive.distance01 * strength01),
        settle01: round(directive.settle01 * strength01),
        track01: round(directive.track01 * strength01),
        scan01: round(directive.scan01 * strength01),
        hold01: round(directive.hold01 * strength01),
        entityMovementAuthority: false,
        entityBehaviorDirectiveAuthority: true,
        playerMovementAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      };
      byEntityId[id] = result;
      summaries.push(result);
      if (entity?.root?.userData) entity.root.userData.reciprocalEcologyBehavior = result;

      if (active && (!primary || strength01 > primary.strength01)) primary = result;
    }

    const primaryKey = primary ? `${primary.id}:${primary.mode}` : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityReciprocalBehavior = {
      pass: "HC-028L",
      active: Boolean(primary),
      owner: "EntityReciprocalBehaviorSystem",
      sourceOwner: "EntityReciprocalMemorySystem",
      changeCount: this.changeCount,
      primary: primary ? {
        entityId: primary.id,
        role: primary.role,
        mode: primary.mode,
        strength01: primary.strength01
      } : {
        entityId: "none",
        role: "none",
        mode: "baseline",
        strength01: 0
      },
      byEntityId,
      entities: summaries,
      hiddenAffinityScore: false,
      inputTimingGate: false,
      entityMovementAuthority: false,
      entityBehaviorDirectiveAuthority: true,
      playerMovementAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      verbPowerAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      rule: "retained_relationship_memory_may_bias_existing_entity_spacing_and_attention_without_affinity_scores_or_gameplay_progression_authority"
    };
  }

  resolveDirective(entity, memoryMode, _interpretation, strength01) {
    const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
    if (strength01 <= 0.06 || memoryMode === "ambient_memory") return this.baselineDirective();

    if (recipeId === "nursery_membrane_tender_001") {
      if (["care_exchange_retained", "reciprocity_retained", "whole_core_signature_retained"].includes(memoryMode)) {
        return { mode: "approach_care", approach01: 1, distance01: 0, settle01: 0.35, track01: 0, scan01: 0, hold01: 0.35 };
      }
      if (["protective_distance_retained", "cautious_contact_retained", "testing_contact_retained"].includes(memoryMode)) {
        return { mode: "guarded_space", approach01: 0, distance01: 1, settle01: 0.3, track01: 0, scan01: 0, hold01: 0.55 };
      }
      if (["settled_presence_retained", "steady_signal_retained"].includes(memoryMode)) {
        return { mode: "settle_nearby", approach01: 0.25, distance01: 0, settle01: 1, track01: 0, scan01: 0, hold01: 0.8 };
      }
      if (["signal_remembered", "whole_core_signature_observed"].includes(memoryMode)) {
        return { mode: "attentive_follow", approach01: 0.45, distance01: 0, settle01: 0.35, track01: 0.45, scan01: 0, hold01: 0.4 };
      }
    }

    if (recipeId === "membrane_watcher_001") {
      if (["sample_retained", "probe_signature_retained", "stable_signal_retained"].includes(memoryMode)) {
        return { mode: "hold_sample", approach01: 0, distance01: 0, settle01: 0.5, track01: 1, scan01: 0.2, hold01: 1 };
      }
      if (["counter_signature_retained", "full_spectrum_signature_retained"].includes(memoryMode)) {
        return { mode: "counter_scan", approach01: 0, distance01: 0, settle01: 0.15, track01: 0.75, scan01: 1, hold01: 0.5 };
      }
      if (memoryMode === "defensive_signature_retained") {
        return { mode: "guarded_anchor", approach01: 0, distance01: 0, settle01: 0.85, track01: 0.35, scan01: 0.15, hold01: 0.9 };
      }
      if (memoryMode === "observation_retained") {
        return { mode: "settled_watch", approach01: 0, distance01: 0, settle01: 1, track01: 0.55, scan01: 0, hold01: 0.75 };
      }
    }

    const authored = entity?.recipe?.ecologyGrammar?.behaviorDirectives?.[memoryMode];
    if (authored?.mode) {
      return {
        mode: authored.mode,
        approach01: Number(authored.approach01 ?? 0),
        distance01: Number(authored.distance01 ?? 0),
        settle01: Number(authored.settle01 ?? 0),
        track01: Number(authored.track01 ?? 0),
        scan01: Number(authored.scan01 ?? 0),
        hold01: Number(authored.hold01 ?? 0)
      };
    }

    return this.baselineDirective();
  }

  baselineDirective() {
    return { mode: "baseline", approach01: 0, distance01: 0, settle01: 0, track01: 0, scan01: 0, hold01: 0 };
  }

  inactiveState() {
    return {
      pass: "HC-028L",
      active: false,
      owner: "EntityReciprocalBehaviorSystem",
      primary: { entityId: "none", role: "none", mode: "baseline", strength01: 0 },
      byEntityId: {},
      entities: [],
      hiddenAffinityScore: false,
      inputTimingGate: false,
      entityMovementAuthority: false,
      entityBehaviorDirectiveAuthority: true,
      playerMovementAuthority: false,
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
