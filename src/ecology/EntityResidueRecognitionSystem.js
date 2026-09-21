const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028O — Residue Recognition.
 *
 * Existing organisms may notice a nearby HC028N ecological residue and publish a
 * presentation-only interpretation of that trace. The residue remains passive world
 * memory; this bridge does not consume, refresh, move, rewrite, or promote it into
 * affinity, progression, targeting, bond, repair, combat, route, or save-state logic.
 * EntityEcologyResonanceSystem may use the interpretation to articulate the existing
 * Tender/Watcher bodies. EntitySystem remains the sole gameplay behavior/movement owner.
 */
export class EntityResidueRecognitionSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityResidueRecognitionSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityResidueRecognitionSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.lastPrimaryKey = "inactive";
    this.changeCount = 0;
  }

  init() {
    this.frameState.entityResidueRecognition = this.inactiveState();
  }

  update(_dt, frameState = this.frameState) {
    const residueState = frameState.entityEcologicalResidue ?? {};
    const fields = residueState.active && Array.isArray(residueState.fields)
      ? residueState.fields
      : [];
    const byEntityId = {};
    const recognitions = [];
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const root = entity?.root;
      const entityId = entity?.instanceId ?? root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? root?.name ?? "unknown_entity";
      const recipeId = entity?.recipe?.id ?? entityId;
      if (!root?.visible) {
        byEntityId[entityId] = this.inactiveEntityState(entityId, "not_visible");
        continue;
      }

      const entityPosition = this.resolveEntityPosition(root);
      if (!entityPosition) {
        byEntityId[entityId] = this.inactiveEntityState(entityId, "position_unavailable");
        continue;
      }

      const candidate = this.resolveNearestResidue(entity, entityPosition, fields);
      if (!candidate) {
        byEntityId[entityId] = this.inactiveEntityState(entityId, "no_trace_in_sense_range");
        continue;
      }

      const interpretation = this.resolveInterpretation(entity, candidate.field);
      const recognition = {
        entityId,
        active: true,
        role: entity?.recipe?.ecologyGrammar?.role ?? (recipeId === "nursery_membrane_tender_001"
          ? "relational_care_filter"
          : recipeId === "membrane_watcher_001"
            ? "anchored_sensor"
            : "organism"),
        interpretation,
        sourceEntityId: candidate.field.entityId ?? "unknown_source",
        sourceMode: candidate.field.mode ?? "ecological_trace",
        sourceStage: candidate.field.residueStage ?? "retained_trace",
        relation: candidate.field.entityId === entityId ? "self_trace" : "other_trace",
        strength01: round(candidate.strength01),
        sourceStrength01: round(candidate.sourceStrength01),
        distance: round(candidate.distance),
        senseRadius: round(candidate.senseRadius),
        distance01: round(candidate.distance01),
        bearing: {
          x: round(candidate.direction.x),
          y: round(candidate.direction.y),
          z: round(candidate.direction.z)
        },
        residuePosition: {
          x: round(candidate.field.position.x),
          y: round(candidate.field.position.y),
          z: round(candidate.field.position.z)
        },
        readsWorldMemory: true,
        consumesResidue: false,
        refreshesResidue: false,
        writesReciprocalMemory: false,
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

      byEntityId[entityId] = recognition;
      recognitions.push(recognition);
      if (!primary || recognition.strength01 > primary.strength01) primary = recognition;
    }

    const primaryKey = primary
      ? `${primary.entityId}:${primary.interpretation}:${primary.sourceMode}:${primary.relation}`
      : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityResidueRecognition = {
      pass: "HC-028O",
      active: recognitions.length > 0,
      owner: "EntityResidueRecognitionSystem",
      sourceOwner: "EntityEcologicalResidueSystem",
      presentationConsumer: "EntityEcologyResonanceSystem",
      changeCount: this.changeCount,
      primary: primary ?? this.inactiveEntityState("none", "inactive"),
      byEntityId,
      recognitions,
      recognitionRadius: {
        tender: 3.25,
        watcher: 3.75,
        generic: 2.8
      },
      readsOnlyActiveCellResidue: true,
      readsWorldMemory: true,
      consumesResidue: false,
      refreshesResidue: false,
      writesReciprocalMemory: false,
      newEntityBehaviorAdded: false,
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
      hiddenAffinityScore: false,
      rule: "existing_organisms_may_read_nearby_temporary_host_residue_as_information_without_consuming_it_or_turning_it_into_gameplay_state"
    };
  }

  resolveEntityPosition(root) {
    // EntitySystem and HC028N both author/capture these entity roots in the same
    // runtime coordinate frame, so reading root.position preserves source truth
    // without adding scene-graph or movement authority here.
    const p = root.position;
    if (p && [p.x, p.y, p.z].every(Number.isFinite)) return p;
    return null;
  }

  resolveNearestResidue(entity, entityPosition, fields) {
    const entityId = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    const recipeId = entity?.recipe?.id ?? entityId;
    const authoredSense = Number(entity?.recipe?.ecologyGrammar?.recognition?.senseRadius);
    const baseSenseRadius = Number.isFinite(authoredSense)
      ? authoredSense
      : recipeId === "membrane_watcher_001"
        ? 3.75
        : recipeId === "nursery_membrane_tender_001"
          ? 3.25
          : 2.8;
    let best = null;

    for (const field of fields) {
      const p = field?.position;
      if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) continue;
      const dx = p.x - entityPosition.x;
      const dy = p.y - entityPosition.y;
      const dz = p.z - entityPosition.z;
      const distance = Math.hypot(dx, dy, dz);
      const sourceRadius = Math.max(0, Number(field.radius ?? 0));
      const senseRadius = baseSenseRadius + sourceRadius * 0.30;
      if (distance > senseRadius) continue;

      const sourceStrength01 = clamp01(Number(field.strength01 ?? 0));
      if (sourceStrength01 <= 0.01) continue;
      const distance01 = clamp01(distance / Math.max(0.001, senseRadius));
      const falloff = (1 - distance01) * (1 - distance01);
      const stageGain = field.residueStage === "fading_trace"
        ? 0.62
        : field.residueStage === "settling_imprint"
          ? 0.84
          : 1;
      const relationGain = field.entityId === entityId ? 0.92 : 1;
      const authoredRoleGain = Number(entity?.recipe?.ecologyGrammar?.recognition?.roleGain);
      const roleGain = Number.isFinite(authoredRoleGain)
        ? authoredRoleGain
        : recipeId === "membrane_watcher_001" ? 1.12 : 1;
      const strength01 = clamp01(sourceStrength01 * falloff * stageGain * relationGain * roleGain * 4.2);
      if (strength01 < 0.035) continue;

      const inv = distance > 0.0001 ? 1 / distance : 0;
      const candidate = {
        field,
        distance,
        senseRadius,
        distance01,
        sourceStrength01,
        strength01,
        direction: {
          x: dx * inv,
          y: dy * inv,
          z: dz * inv
        }
      };
      if (!best || candidate.strength01 > best.strength01) best = candidate;
    }
    return best;
  }

  resolveInterpretation(entity, field) {
    const entityId = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    const recipeId = entity?.recipe?.id ?? entityId;
    const mode = field?.mode ?? "ecological_trace";
    const self = field?.entityId === entityId;

    if (recipeId === "nursery_membrane_tender_001") {
      if (mode === "care_afterimage") return self ? "familiar_care_trace" : "safe_care_trace";
      if (mode === "settled_trace") return "coherent_rest_trace";
      if (mode === "protective_hush") return "cautious_boundary_trace";
      if (mode === "sample_imprint") return "sensor_trace_caution";
      if (mode === "counter_scan_echo") return "counter_scan_caution";
      if (mode === "guarded_sensor_hush") return "guarded_sensor_notice";
      return "ambient_trace_notice";
    }

    if (recipeId === "membrane_watcher_001") {
      if (mode === "care_afterimage") return "care_signature_sample";
      if (mode === "settled_trace") return "coherent_signature_sample";
      if (mode === "protective_hush") return "guarded_signature_sample";
      if (mode === "sample_imprint") return self ? "known_sample_verify" : "foreign_sample_compare";
      if (mode === "counter_scan_echo") return self ? "counter_echo_verify" : "counter_echo_compare";
      if (mode === "guarded_sensor_hush") return "guarded_sensor_verify";
      return "ambient_trace_sample";
    }

    const authored = entity?.recipe?.ecologyGrammar?.recognition?.interpretationByMode?.[mode];
    return authored ?? "ambient_trace_notice";
  }

  inactiveEntityState(entityId, reason) {
    return {
      entityId,
      active: false,
      role: "none",
      interpretation: "ambient_trace_unread",
      sourceEntityId: "none",
      sourceMode: "none",
      sourceStage: "inactive",
      relation: "none",
      strength01: 0,
      sourceStrength01: 0,
      distance: 0,
      senseRadius: 0,
      distance01: 1,
      bearing: { x: 0, y: 0, z: 0 },
      residuePosition: null,
      reason,
      readsWorldMemory: true,
      consumesResidue: false,
      refreshesResidue: false,
      writesReciprocalMemory: false,
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
  }

  inactiveState() {
    return {
      pass: "HC-028O",
      active: false,
      owner: "EntityResidueRecognitionSystem",
      sourceOwner: "EntityEcologicalResidueSystem",
      presentationConsumer: "EntityEcologyResonanceSystem",
      changeCount: this.changeCount,
      primary: this.inactiveEntityState("none", "inactive"),
      byEntityId: {},
      recognitions: [],
      recognitionRadius: { tender: 3.25, watcher: 3.75, generic: 2.8 },
      readsOnlyActiveCellResidue: true,
      readsWorldMemory: true,
      consumesResidue: false,
      refreshesResidue: false,
      writesReciprocalMemory: false,
      newEntityBehaviorAdded: false,
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
  }
}
