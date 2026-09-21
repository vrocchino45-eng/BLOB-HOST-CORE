const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028J — Entity Relationship Grammar Foundation.
 *
 * Read-only interpretation bridge between the player's existing P/A/S chord and
 * the existing authored Tender/Watcher ecology. It does not change entity AI,
 * bond/care rules, repair, combat, movement, progression, targeting or verb power.
 * It only answers: "what does this organism appear to make of the Core's current
 * relational gesture?" EntityEcologyResonanceSystem owns the visible body reply.
 */
export class EntityRelationshipGrammarSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityRelationshipGrammarSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityRelationshipGrammarSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.lastPrimaryKey = "inactive";
    this.changeCount = 0;
  }

  init() {
    this.frameState.entityRelationshipGrammar = this.inactiveState();
  }

  update(_dt, frameState = this.frameState) {
    const coupling = frameState.coreVerbEngineCoupling ?? {};
    const chord = coupling.active ? coupling.chord ?? "idle" : "idle";
    const drive = coupling.functionDrive ?? { pulse: 0, absorb: 0, stabilize: 0 };
    const drive01 = clamp01(Math.max(drive.pulse ?? 0, drive.absorb ?? 0, drive.stabilize ?? 0));
    const fullSystemLoad01 = clamp01(coupling.presentation?.fullSystemLoad01 ?? 0);
    const byEntityId = {};
    const summaries = [];

    let primary = null;
    for (const entity of this.entitySystem.entities ?? []) {
      const root = entity?.root;
      const id = entity?.instanceId ?? root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
      if (!root?.visible) continue;

      const distance = this.entitySystem.playerRoot.position.distanceTo(root.position);
      const profile = entity?.recipe?.ecologyGrammar ?? {};
      const range = Number.isFinite(profile.relationshipRange)
        ? profile.relationshipRange
        : recipeId === "membrane_watcher_001" ? 4.6 : 4.9;
      const proximity01 = clamp01(1 - Math.max(0, distance - 1.15) / Math.max(0.1, range - 1.15));
      const engagement01 = chord === "idle"
        ? 0
        : clamp01(proximity01 * (0.28 + drive01 * 0.58 + fullSystemLoad01 * 0.14));
      const bonded = recipeId === "nursery_membrane_tender_001" && Boolean(this.entitySystem.tenderBonded);
      const interpretation = this.interpret(entity, chord, bonded, engagement01);
      const gesture = this.resolveGesture(chord, engagement01);

      const result = {
        id,
        role: profile.role ?? (recipeId === "nursery_membrane_tender_001" ? "care_filter" : recipeId === "membrane_watcher_001" ? "anchored_sensor" : "organism"),
        chord,
        interpretation,
        bonded,
        distance: round(distance),
        proximity01: round(proximity01),
        engagement01: round(engagement01),
        gesture,
        gameplayAuthority: false
      };
      byEntityId[id] = result;
      summaries.push(result);

      if (engagement01 > 0.06 && (!primary || engagement01 > primary.engagement01)) {
        primary = result;
      }
    }

    const primaryKey = primary ? `${primary.id}:${primary.interpretation}:${chord}` : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityRelationshipGrammar = {
      pass: "HC-028J",
      active: Boolean(primary),
      owner: "EntityRelationshipGrammarSystem",
      sourceOwner: "CoreVerbEngineCouplingSystem + EntitySystem",
      chord,
      dominantFunction: coupling.dominantFunction ?? "none",
      changeCount: this.changeCount,
      primary: primary ? {
        entityId: primary.id,
        role: primary.role,
        interpretation: primary.interpretation,
        engagement01: primary.engagement01,
        bonded: primary.bonded
      } : {
        entityId: "none",
        role: "none",
        interpretation: "ambient_listening",
        engagement01: 0,
        bonded: false
      },
      byEntityId,
      entities: summaries,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      verbPowerAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      newEntityTypeAdded: false,
      rule: "existing_organisms_interpret_existing_core_chords_without_creating_new_gameplay_authority"
    };
  }

  interpret(entity, chord, bonded, engagement01) {
    const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? id;
    if (engagement01 <= 0.06 || chord === "idle") return "ambient_listening";

    if (recipeId === "nursery_membrane_tender_001") {
      const tender = {
        project: "signal_offered",
        draw: bonded ? "shared_intake" : "guarded_draw",
        cohere: "settled_presence",
        cohere_project: "steady_signal",
        cohere_draw: bonded ? "safe_receive" : "cautious_receive",
        exchange: bonded ? "reciprocal_exchange" : "testing_exchange",
        full_system: bonded ? "whole_core_attunement" : "whole_core_display"
      };
      return tender[chord] ?? "ambient_listening";
    }

    if (recipeId === "membrane_watcher_001") {
      const watcher = {
        project: "answering_probe",
        draw: "guarded_retraction",
        cohere: "anchored_observation",
        cohere_project: "stable_interrogation",
        cohere_draw: "contained_sampling",
        exchange: "counter_sensing",
        full_system: "full_spectrum_watch"
      };
      return watcher[chord] ?? "ambient_listening";
    }

    const authored = entity?.recipe?.ecologyGrammar?.relationshipInterpretations ?? null;
    if (authored?.[chord]) return authored[chord];

    return chord === "cohere" ? "settled_presence" : chord === "exchange" ? "reciprocal_exchange" : "gesture_noted";
  }

  resolveGesture(chord, engagement01) {
    const e = clamp01(engagement01);
    const base = { outward01: 0, inward01: 0, settle01: 0, reciprocity01: 0 };
    if (chord === "project") base.outward01 = 1;
    else if (chord === "draw") base.inward01 = 1;
    else if (chord === "cohere") base.settle01 = 1;
    else if (chord === "cohere_project") { base.outward01 = 0.82; base.settle01 = 0.82; }
    else if (chord === "cohere_draw") { base.inward01 = 0.82; base.settle01 = 0.82; }
    else if (chord === "exchange") { base.outward01 = 0.62; base.inward01 = 0.62; base.reciprocity01 = 1; }
    else if (chord === "full_system") { base.outward01 = 0.72; base.inward01 = 0.72; base.settle01 = 0.86; base.reciprocity01 = 0.76; }
    return {
      outward01: round(base.outward01 * e),
      inward01: round(base.inward01 * e),
      settle01: round(base.settle01 * e),
      reciprocity01: round(base.reciprocity01 * e)
    };
  }

  inactiveState() {
    return {
      pass: "HC-028J",
      active: false,
      owner: "EntityRelationshipGrammarSystem",
      chord: "idle",
      dominantFunction: "none",
      changeCount: 0,
      primary: { entityId: "none", role: "none", interpretation: "ambient_listening", engagement01: 0, bonded: false },
      byEntityId: {},
      entities: [],
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      verbPowerAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      newEntityTypeAdded: false
    };
  }
}
