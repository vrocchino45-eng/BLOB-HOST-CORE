import { materialInScope, materialVisible, materialScopeActive } from './MaterialResponseScope.js';

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

const MATERIAL_PROFILES = Object.freeze({
  elastic_membrane: Object.freeze({
    family: "elastic_membrane",
    geometrySignature: "flex_rebound",
    motionSignature: "soft_bend_return",
    pulsePushMultiplier: 0.94,
    pulseLateralMultiplier: 0.72,
    flexMultiplier: 1.28,
    shearMultiplier: 0.34,
    rippleMultiplier: 0.62,
    compressionMultiplier: 0.88,
    spinMultiplier: 0.72,
    absorbProgressMultiplier: 1.0,
    absorbPullMultiplier: 0.98,
    responseDampingMultiplier: 1.08
  }),
  flowing_current: Object.freeze({
    family: "flowing_current",
    geometrySignature: "stream_stretch",
    motionSignature: "redirected_wave",
    pulsePushMultiplier: 1.02,
    pulseLateralMultiplier: 1.18,
    flexMultiplier: 0.78,
    shearMultiplier: 0.28,
    rippleMultiplier: 1.42,
    compressionMultiplier: 0.56,
    spinMultiplier: 0.62,
    absorbProgressMultiplier: 1.05,
    absorbPullMultiplier: 1.08,
    responseDampingMultiplier: 0.92
  }),
  resonant_signal: Object.freeze({
    family: "resonant_signal",
    geometrySignature: "phase_echo",
    motionSignature: "wave_answer",
    pulsePushMultiplier: 0.82,
    pulseLateralMultiplier: 1.34,
    flexMultiplier: 0.48,
    shearMultiplier: 0.18,
    rippleMultiplier: 1.58,
    compressionMultiplier: 0.38,
    spinMultiplier: 0.46,
    absorbProgressMultiplier: 0.96,
    absorbPullMultiplier: 0.90,
    responseDampingMultiplier: 1.18
  }),
  dense_scar: Object.freeze({
    family: "dense_scar",
    geometrySignature: "shear_lock",
    motionSignature: "resist_then_slip",
    pulsePushMultiplier: 0.74,
    pulseLateralMultiplier: 0.54,
    flexMultiplier: 0.38,
    shearMultiplier: 1.44,
    rippleMultiplier: 0.34,
    compressionMultiplier: 0.48,
    spinMultiplier: 1.34,
    absorbProgressMultiplier: 0.88,
    absorbPullMultiplier: 0.84,
    responseDampingMultiplier: 0.76
  }),
  granular_residue: Object.freeze({
    family: "granular_residue",
    geometrySignature: "slump_scatter",
    motionSignature: "drag_and_settle",
    pulsePushMultiplier: 0.86,
    pulseLateralMultiplier: 0.94,
    flexMultiplier: 0.54,
    shearMultiplier: 0.88,
    rippleMultiplier: 0.72,
    compressionMultiplier: 0.72,
    spinMultiplier: 1.08,
    absorbProgressMultiplier: 0.93,
    absorbPullMultiplier: 0.92,
    responseDampingMultiplier: 0.82
  }),
  contained_seed: Object.freeze({
    family: "contained_seed",
    geometrySignature: "compact_open_close",
    motionSignature: "protected_recoil",
    pulsePushMultiplier: 0.90,
    pulseLateralMultiplier: 0.42,
    flexMultiplier: 0.68,
    shearMultiplier: 0.22,
    rippleMultiplier: 0.56,
    compressionMultiplier: 1.28,
    spinMultiplier: 0.48,
    absorbProgressMultiplier: 1.08,
    absorbPullMultiplier: 1.04,
    responseDampingMultiplier: 1.12
  }),
  volatile_growth: Object.freeze({
    family: "volatile_growth",
    geometrySignature: "bloom_contract",
    motionSignature: "growth_spasm",
    pulsePushMultiplier: 0.96,
    pulseLateralMultiplier: 1.08,
    flexMultiplier: 1.18,
    shearMultiplier: 0.74,
    rippleMultiplier: 1.18,
    compressionMultiplier: 0.84,
    spinMultiplier: 0.92,
    absorbProgressMultiplier: 0.94,
    absorbPullMultiplier: 0.96,
    responseDampingMultiplier: 0.88
  }),
  adaptive_matter: Object.freeze({
    family: "adaptive_matter",
    geometrySignature: "balanced_deformation",
    motionSignature: "neutral_response",
    pulsePushMultiplier: 1,
    pulseLateralMultiplier: 1,
    flexMultiplier: 1,
    shearMultiplier: 1,
    rippleMultiplier: 1,
    compressionMultiplier: 1,
    spinMultiplier: 1,
    absorbProgressMultiplier: 1,
    absorbPullMultiplier: 1,
    responseDampingMultiplier: 1
  })
});

const ENTITY_PROFILES = Object.freeze({
  protective_tender: Object.freeze({
    family: "protective_tender",
    bodySignature: "cup_open_guard",
    pulseAnswer: "open_and_offer",
    absorbAnswer: "cup_and_guard",
    stabilizeAnswer: "settle_and_support",
    outwardMultiplier: 1.14,
    inwardMultiplier: 0.88,
    settleMultiplier: 1.18,
    reciprocityMultiplier: 1.16
  }),
  anchored_sensor: Object.freeze({
    family: "anchored_sensor",
    bodySignature: "track_contract_scan",
    pulseAnswer: "counter_signal",
    absorbAnswer: "retract_and_sample",
    stabilizeAnswer: "anchor_and_observe",
    outwardMultiplier: 0.92,
    inwardMultiplier: 1.12,
    settleMultiplier: 1.12,
    reciprocityMultiplier: 1.08
  }),
  flow_relay: Object.freeze({
    family: "flow_relay",
    bodySignature: "vane_align_handoff",
    pulseAnswer: "open_downstream",
    absorbAnswer: "cup_upstream",
    stabilizeAnswer: "synchronize_flow",
    outwardMultiplier: 1.18,
    inwardMultiplier: 1.08,
    settleMultiplier: 1.22,
    reciprocityMultiplier: 1.02
  }),
  living_responder: Object.freeze({
    family: "living_responder",
    bodySignature: "adaptive_living_reply",
    pulseAnswer: "acknowledge_outward",
    absorbAnswer: "acknowledge_inward",
    stabilizeAnswer: "acknowledge_settle",
    outwardMultiplier: 1,
    inwardMultiplier: 1,
    settleMultiplier: 1,
    reciprocityMultiplier: 1
  })
});

const STAGE_EXPRESSIONS = Object.freeze({
  elastic_membrane: Object.freeze({ coherent: "supple_rest", strained: "uneven_flex", unstable: "buckling_wave", failing: "open_torn_flex" }),
  flowing_current: Object.freeze({ coherent: "clean_stream", strained: "cross_current", unstable: "eddying_wave", failing: "broken_flow" }),
  resonant_signal: Object.freeze({ coherent: "clear_phase", strained: "phase_flutter", unstable: "echo_split", failing: "signal_scatter" }),
  dense_scar: Object.freeze({ coherent: "locked_mass", strained: "loaded_shear", unstable: "slipping_plate", failing: "fracture_memory" }),
  granular_residue: Object.freeze({ coherent: "settled_bed", strained: "creeping_slump", unstable: "shearing_grain", failing: "scatter_release" }),
  contained_seed: Object.freeze({ coherent: "closed_seed", strained: "protective_compression", unstable: "shell_wobble", failing: "forced_opening" }),
  volatile_growth: Object.freeze({ coherent: "balanced_bloom", strained: "asymmetric_growth", unstable: "growth_spasm", failing: "bloom_collapse" }),
  adaptive_matter: Object.freeze({ coherent: "settled_form", strained: "loaded_form", unstable: "uneven_form", failing: "coherence_loss" })
});

/**
 * HC030B — Material / Entity Response Personality.
 *
 * One read-only authored-data interpretation owner. It does not create a second
 * condition model: HC030A condition remains authoritative. This system answers
 * only "what kind of thing is responding?" using existing matterState, domains,
 * hostFunction and authored entity behavior, then publishes bounded response
 * multipliers for the existing presentation/physics owners to consume.
 */
export class ResponsePersonalitySystem {
  constructor({ frameState, chemObjectSystem, entitySystem, scope = null }) {
    if (!frameState) throw new Error("[ResponsePersonalitySystem] frameState is required.");
    if (!chemObjectSystem) throw new Error("[ResponsePersonalitySystem] chemObjectSystem is required.");
    if (!entitySystem) throw new Error("[ResponsePersonalitySystem] entitySystem is required.");
    this.frameState = frameState;
    this.chemObjectSystem = chemObjectSystem;
    this.entitySystem = entitySystem;
    this.scope = scope;
  }

  init() {
    this.publish(this.frameState);
  }

  onRuntimePrepare(frameState) { if (this.scope) this.publish(frameState, false); }
  onRuntimeMount(frameState) { if (this.scope) this.publish(frameState, false); }
  onRuntimeUnmount(frameState) { if (this.scope) this.publish(frameState, false); }

  update(_dt, frameState = this.frameState) {
    this.publish(frameState, !this.scope || Number.isFinite(_dt) && _dt > 0);
  }

  publish(frameState, allowScope = true) {
    const scopeActive = !this.scope || allowScope && materialScopeActive(frameState, this.scope);
    const objects = {};
    const objectCounts = {};
    for (const item of this.chemObjectSystem.objects ?? []) {
      if (!item?.recipe?.id) continue;
      if (this.scope && (!scopeActive || !materialInScope(item, this.scope) || !materialVisible(item))) {
        if (materialInScope(item, this.scope)) delete item.root.userData.responsePersonality;
        continue;
      }
      const matterState = item.recipe.chemistry?.matterState ?? "unknown";
      const profile = this.resolveMaterialProfile(matterState, item.recipe.chemistry?.domains ?? []);
      const reactive = frameState.reactiveStateGrammar?.objects?.[item.recipe.id]
        ?? item.root?.userData?.reactiveState
        ?? null;
      const stage = reactive?.stage ?? "coherent";
      const snapshot = this.materialSnapshot(profile, matterState, stage, reactive);
      objects[item.recipe.id] = snapshot;
      objectCounts[profile.family] = (objectCounts[profile.family] ?? 0) + 1;
      if (item.root?.userData) item.root.userData.responsePersonality = snapshot;
    }

    const entities = {};
    const entityCounts = {};
    // The first restoration is material-only; existing entity behavior stays locked.
    for (const entity of this.scope ? [] : this.entitySystem.entities ?? []) {
      const root = entity?.root;
      const id = entity?.instanceId ?? root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? root?.name ?? "unknown_entity";
      const profile = this.resolveEntityProfile(entity);
      const relationship = frameState.entityRelationshipGrammar?.byEntityId?.[id] ?? null;
      const snapshot = {
        pass: "HC-030B",
        family: profile.family,
        bodySignature: profile.bodySignature,
        pulseAnswer: profile.pulseAnswer,
        absorbAnswer: profile.absorbAnswer,
        stabilizeAnswer: profile.stabilizeAnswer,
        outwardMultiplier: profile.outwardMultiplier,
        inwardMultiplier: profile.inwardMultiplier,
        settleMultiplier: profile.settleMultiplier,
        reciprocityMultiplier: profile.reciprocityMultiplier,
        authoredMatterState: entity?.recipe?.chemistry?.matterState ?? "unknown",
        hostFunction: entity?.recipe?.origin?.hostFunction ?? "unknown",
        relationshipInterpretation: relationship?.interpretation ?? "ambient_listening",
        relationshipEngagement01: round(relationship?.engagement01 ?? 0)
      };
      entities[id] = snapshot;
      entityCounts[profile.family] = (entityCounts[profile.family] ?? 0) + 1;
      if (root?.userData) root.userData.responsePersonality = snapshot;
    }

    let targetId = frameState.targeting?.relationshipActive
      ? (frameState.targeting.relationshipTargetId ?? frameState.targeting.targetId ?? "none")
      : "none";
    if (this.scope && !objects[targetId]) targetId = 'none';
    const primaryEntityId = this.scope ? 'none' : frameState.entityRelationshipGrammar?.primary?.entityId ?? "none";

    frameState.responsePersonality = {
      pass: "HC-030B",
      owner: "ResponsePersonalitySystem",
      source: "existing authored matterState/domains/hostFunction/behavior",
      activeChemTargetId: targetId,
      activeChemPersonality: targetId !== "none" ? (objects[targetId] ?? null) : null,
      primaryEntityId,
      primaryEntityPersonality: primaryEntityId !== "none" ? (entities[primaryEntityId] ?? null) : null,
      objects,
      entities,
      counts: {
        materialFamilies: objectCounts,
        entityFamilies: entityCounts
      },
      rules: {
        conditionOwnerRemainsHC030A: true,
        sameConditionDifferentMatterDifferentAnswer: true,
        authoredDataDerived: true,
        addsNewAbility: false,
        addsNewTargeting: false,
        addsNewEntityAI: false,
        changesRoutesOrProgression: false
      }
    };
  }

  resolveMaterialProfile(matterState, domains = []) {
    const state = String(matterState ?? "").toLowerCase();
    if (state === "membrane" || state === "gel") return MATERIAL_PROFILES.elastic_membrane;
    if (state === "fluid") return MATERIAL_PROFILES.flowing_current;
    if (state === "signal_vapor" || state === "seed_signal_braid" || domains.includes("signal") && !domains.includes("scar")) return MATERIAL_PROFILES.resonant_signal;
    if (state === "scarred" || state === "scarred_membrane_flow") return MATERIAL_PROFILES.dense_scar;
    if (state === "residue" || state === "residue_silt") return MATERIAL_PROFILES.granular_residue;
    if (state === "dormant_seed") return MATERIAL_PROFILES.contained_seed;
    if (state === "blooming") return MATERIAL_PROFILES.volatile_growth;
    return MATERIAL_PROFILES.adaptive_matter;
  }

  resolveEntityProfile(entity) {
    const recipe = entity?.recipe ?? {};
    const functionText = String(recipe.origin?.hostFunction ?? "").toLowerCase();
    const role = String(recipe.ecologyGrammar?.role ?? entity?.root?.userData?.ecologicalRole ?? "").toLowerCase();
    const matterState = String(recipe.chemistry?.matterState ?? "").toLowerCase();
    if (/repair|filter|protect|care/.test(functionText) || /care_filter|tender/.test(role) || recipe.id === "nursery_membrane_tender_001") {
      return ENTITY_PROFILES.protective_tender;
    }
    if (/sense|warn|record/.test(functionText) || /sensor|watch/.test(role) || recipe.id === "membrane_watcher_001") {
      return ENTITY_PROFILES.anchored_sensor;
    }
    if (/carry|align|release|flow/.test(functionText) || /flow_relay|relay/.test(role) || matterState === "fluid" || recipe.id === "vascular_relay_001") {
      return ENTITY_PROFILES.flow_relay;
    }
    return ENTITY_PROFILES.living_responder;
  }

  materialSnapshot(profile, matterState, stage, reactive) {
    const expressions = STAGE_EXPRESSIONS[profile.family] ?? STAGE_EXPRESSIONS.adaptive_matter;
    return {
      pass: "HC-030B",
      family: profile.family,
      authoredMatterState: matterState,
      geometrySignature: profile.geometrySignature,
      motionSignature: profile.motionSignature,
      stage,
      stageExpression: expressions[stage] ?? expressions.coherent,
      condition01: round(reactive?.condition01 ?? 0),
      pulsePushMultiplier: profile.pulsePushMultiplier,
      pulseLateralMultiplier: profile.pulseLateralMultiplier,
      flexMultiplier: profile.flexMultiplier,
      shearMultiplier: profile.shearMultiplier,
      rippleMultiplier: profile.rippleMultiplier,
      compressionMultiplier: profile.compressionMultiplier,
      spinMultiplier: profile.spinMultiplier,
      absorbProgressMultiplier: profile.absorbProgressMultiplier,
      absorbPullMultiplier: profile.absorbPullMultiplier,
      responseDampingMultiplier: profile.responseDampingMultiplier
    };
  }
}
