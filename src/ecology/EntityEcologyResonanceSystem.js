import * as THREE from "three";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));
const lerp = (a, b, t) => a + (b - a) * clamp01(t);

/**
 * HC028I→HC028O — Ecology Resonance + Relationship/Residue Presentation.
 *
 * Existing EntitySystem remains the sole owner of authored entity behavior,
 * bonding, care/repair, visibility and gameplay reactions. This bridge only
 * lets those organisms visibly inhabit the same regional P/A/S composition
 * already used by Host matter and the Core. HC028K also lets a recently
 * committed relationship gesture linger as embodied memory after release. HC028O
 * lets existing bodies visibly acknowledge nearby temporary Host residue without
 * granting the residue or this presentation bridge gameplay authority.
 *
 * No generic enemies, AI goals, damage, bond rules, progression, movement
 * authority or new verb affordances are introduced here.
 */
export class EntityEcologyResonanceSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityEcologyResonanceSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityEcologyResonanceSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.cache = new Map();
    this.lastMode = "inactive";
    this.modeChangeCount = 0;
  }

  init() {
    this.frameState.entityEcologyResonance = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const composition = frameState.hostRhythm?.composition ?? {};
    const regional = frameState.regionalPhysicalEmbodiment ?? {};
    const coreResonance = frameState.coreWorldResonance ?? {};
    const active = Boolean(composition.active && regional.active);

    if (!active) {
      this.restoreAll();
      frameState.entityEcologyResonance = this.inactiveState();
      return;
    }

    const functionId = composition.currentFunction ?? regional.currentFunction ?? "none";
    const phraseStrength = clamp01(regional.phraseStrength ?? 0);
    const beatPulse = clamp01(composition.beatPulse ?? regional.beatPulse ?? 0);
    const accentStrength = clamp01(composition.accentStrength ?? 0);
    const coreCoherence01 = coreResonance.active ? clamp01(coreResonance.coherence01 ?? 0.5) : 0.5;
    const coreReply01 = coreResonance.active ? clamp01(coreResonance.presentation?.worldReplyStrength ?? 0) : 0;
    const coreRelationship = coreResonance.active ? coreResonance.relationshipState ?? "oscillating" : "inactive";
    const hostBreath = clamp(frameState.hostRhythm?.breath ?? 0, -1, 1);

    const functionDrive = {
      pulse: functionId === "pulse" ? phraseStrength : 0,
      absorb: functionId === "absorb" ? phraseStrength : 0,
      stabilize: functionId === "stabilize" ? phraseStrength : 0
    };

    // Entity entrainment is intentionally visible between beats. The beat raises
    // articulation; it is never an input window or gameplay requirement.
    const entrainment01 = clamp01(
      0.22
      + phraseStrength * 0.30
      + beatPulse * 0.18
      + coreCoherence01 * 0.20
      + coreReply01 * 0.10
    );
    const mode = this.resolveMode(coreRelationship, entrainment01);
    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.modeChangeCount += 1;
    }

    const summaries = [];
    let visibleCount = 0;
    let bondedTenderPresent = false;

    for (const entity of this.entitySystem.entities ?? []) {
      const root = entity?.root;
      if (!root) continue;
      const cache = this.ensureCache(entity);
      this.restore(cache);

      if (!root.visible) continue;
      visibleCount += 1;

      const authoredPulseReply01 = clamp01(1 - (entity.pulseAge ?? 999) / 1.1);
      const localArticulation01 = clamp01(
        entrainment01 * (0.72 + accentStrength * 0.18)
        + authoredPulseReply01 * 0.24
      );
      const entityId = entity?.instanceId ?? root?.userData?.entityInstanceId ?? entity.recipe?.id ?? root.name ?? "unknown_entity";
      const relationship = frameState.entityRelationshipGrammar?.byEntityId?.[entityId] ?? null;
      const memory = frameState.entityReciprocalMemory?.byEntityId?.[entityId] ?? null;
      const residueRecognition = frameState.entityResidueRecognition?.byEntityId?.[entityId] ?? null;
      const personality = frameState.responsePersonality?.entities?.[entityId]
        ?? root.userData.responsePersonality
        ?? null;

      if (entity.recipe?.id === "nursery_membrane_tender_001") {
        bondedTenderPresent = bondedTenderPresent || Boolean(this.entitySystem.tenderBonded);
        this.applyTender(cache, {
          dt,
          functionDrive,
          beatPulse,
          hostBreath,
          articulation01: localArticulation01,
          authoredPulseReply01,
          regional,
          relationship,
          memory,
          residueRecognition,
          personality
        });
      } else if (entity.recipe?.id === "membrane_watcher_001") {
        this.applyWatcher(cache, {
          dt,
          functionDrive,
          beatPulse,
          hostBreath,
          articulation01: localArticulation01,
          authoredPulseReply01,
          regional,
          relationship,
          memory,
          residueRecognition,
          personality
        });
      } else if (personality?.family === "flow_relay" || entity.recipe?.id === "vascular_relay_001") {
        this.applyVascularRelay(cache, {
          functionDrive,
          beatPulse,
          hostBreath,
          articulation01: localArticulation01,
          relationship,
          memory,
          personality
        });
      } else {
        this.applyGeneric(cache, { functionDrive, beatPulse, hostBreath, articulation01: localArticulation01, relationship, memory, residueRecognition, personality });
      }

      root.userData.ecologyResonance = {
        pass: "HC-028O",
        function: functionId,
        mode,
        entrainment01: round(localArticulation01),
        worldProfileId: composition.profileId ?? "unassigned",
        region: regional.region ?? "unassigned",
        relationshipChord: relationship?.chord ?? "idle",
        relationshipInterpretation: relationship?.interpretation ?? "ambient_listening",
        relationshipEngagement01: round(relationship?.engagement01 ?? 0),
        reciprocalMemoryMode: memory?.mode ?? "ambient_memory",
        reciprocalMemoryStrength01: round(memory?.strength01 ?? 0),
        reciprocalResponsePulse01: round(memory?.responsePulse01 ?? 0),
        residueRecognitionInterpretation: residueRecognition?.interpretation ?? "ambient_trace_unread",
        residueRecognitionStrength01: round(residueRecognition?.strength01 ?? 0),
        residueRecognitionSourceMode: residueRecognition?.sourceMode ?? "none",
        responsePersonality: personality?.family ?? "living_responder",
        responseBodySignature: personality?.bodySignature ?? "adaptive_living_reply",
        progressionAuthority: false,
        behaviorAuthority: false
      };

      summaries.push({
        id: entityId,
        recipeId: entity.recipe?.id ?? "unknown_entity",
        state: entity.state ?? root.userData.entityState ?? "unknown",
        bonded: entity.recipe?.id === "nursery_membrane_tender_001" ? Boolean(this.entitySystem.tenderBonded) : false,
        entrainment01: round(localArticulation01),
        authoredPulseReply01: round(authoredPulseReply01),
        relationshipChord: relationship?.chord ?? "idle",
        relationshipInterpretation: relationship?.interpretation ?? "ambient_listening",
        relationshipEngagement01: round(relationship?.engagement01 ?? 0),
        reciprocalMemoryMode: memory?.mode ?? "ambient_memory",
        reciprocalMemoryStrength01: round(memory?.strength01 ?? 0),
        reciprocalResponsePulse01: round(memory?.responsePulse01 ?? 0),
        residueRecognitionInterpretation: residueRecognition?.interpretation ?? "ambient_trace_unread",
        residueRecognitionStrength01: round(residueRecognition?.strength01 ?? 0),
        residueRecognitionSourceMode: residueRecognition?.sourceMode ?? "none",
        responsePersonality: personality?.family ?? "living_responder",
        responseBodySignature: personality?.bodySignature ?? "adaptive_living_reply"
      });
    }

    frameState.entityEcologyResonance = {
      pass: "HC-028O",
      active: visibleCount > 0,
      owner: "EntityEcologyResonanceSystem",
      sourceOwner: "EntitySystem + HostRhythmSystem + RegionalPhysicalEmbodimentSystem + CoreWorldResonanceSystem + EntityRelationshipGrammarSystem + EntityResidueRecognitionSystem",
      mode,
      modeChangeCount: this.modeChangeCount,
      world: {
        profileId: composition.profileId ?? "unassigned",
        region: regional.region ?? "unassigned",
        keyId: composition.keyId ?? "unassigned",
        meter: composition.meterLabel ?? "unassigned",
        currentFunction: functionId,
        accentRole: composition.accentRole ?? "none",
        phraseStrength: round(phraseStrength),
        beatPulse: round(beatPulse)
      },
      coreRelationship: {
        state: coreRelationship,
        coherence01: round(coreCoherence01),
        worldReply01: round(coreReply01)
      },
      expression: {
        pulse01: round(functionDrive.pulse),
        absorb01: round(functionDrive.absorb),
        stabilize01: round(functionDrive.stabilize),
        entrainment01: round(entrainment01)
      },
      relationship: {
        active: Boolean(frameState.entityRelationshipGrammar?.active),
        chord: frameState.entityRelationshipGrammar?.chord ?? "idle",
        primaryInterpretation: frameState.entityRelationshipGrammar?.primary?.interpretation ?? "ambient_listening"
      },
      reciprocalMemory: {
        active: Boolean(frameState.entityReciprocalMemory?.active),
        primaryMode: frameState.entityReciprocalMemory?.primary?.mode ?? "ambient_memory",
        primaryStrength01: round(frameState.entityReciprocalMemory?.primary?.strength01 ?? 0),
        commitCount: frameState.entityReciprocalMemory?.commitCount ?? 0
      },
      residueRecognition: {
        active: Boolean(frameState.entityResidueRecognition?.active),
        primaryEntityId: frameState.entityResidueRecognition?.primary?.entityId ?? "none",
        primaryInterpretation: frameState.entityResidueRecognition?.primary?.interpretation ?? "ambient_trace_unread",
        primaryStrength01: round(frameState.entityResidueRecognition?.primary?.strength01 ?? 0),
        consumesResidue: false,
        writesReciprocalMemory: false
      },
      visibleEntityCount: visibleCount,
      bondedTenderPresent,
      entities: summaries,
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      combatAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      newEntityTypeAdded: false,
      rule: "existing_organisms_share_world_composition_read_core_chords_retain_short_lived_relationship_memory_and_visibly_recognize_nearby_host_residue_without_new_gameplay_authority"
    };
  }

  resolveMode(coreRelationship, entrainment01) {
    if (coreRelationship === "aligned" && entrainment01 >= 0.62) return "shared_phrase";
    if (coreRelationship === "resolving") return "settling_together";
    if (coreRelationship === "opposed") return "counter_sensing";
    if (coreRelationship === "strained") return "guarded_listening";
    if (entrainment01 >= 0.58) return "world_entrained";
    return "ambient_listening";
  }

  ensureCache(entity) {
    const root = entity.root;
    if (this.cache.has(root.uuid)) return this.cache.get(root.uuid);

    const parts = [];
    root.traverse((object) => {
      if (object === root) return;
      const material = object.material && !Array.isArray(object.material) ? object.material : null;
      parts.push({
        object,
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
        opacity: material && Number.isFinite(material.opacity) ? material.opacity : null,
        emissiveIntensity: material && Number.isFinite(material.emissiveIntensity) ? material.emissiveIntensity : null,
        lightIntensity: object.isLight && Number.isFinite(object.intensity) ? object.intensity : null
      });
    });

    const cache = {
      entity,
      root,
      parts,
      byName: new Map()
    };
    for (const part of parts) {
      const list = cache.byName.get(part.object.name) ?? [];
      list.push(part);
      cache.byName.set(part.object.name, list);
    }
    this.cache.set(root.uuid, cache);
    return cache;
  }

  restoreAll() {
    for (const cache of this.cache.values()) this.restore(cache);
  }

  restore(cache) {
    for (const part of cache.parts) {
      const { object } = part;
      object.position.copy(part.position);
      object.rotation.copy(part.rotation);
      object.scale.copy(part.scale);
      if (object.material && !Array.isArray(object.material)) {
        if (part.opacity != null) object.material.opacity = part.opacity;
        if (part.emissiveIntensity != null) object.material.emissiveIntensity = part.emissiveIntensity;
      }
      if (part.lightIntensity != null && object.isLight) object.intensity = part.lightIntensity;
    }
  }

  applyTender(cache, { functionDrive, beatPulse, hostBreath, articulation01, authoredPulseReply01, regional, relationship, memory, residueRecognition, personality }) {
    const pulse = functionDrive.pulse;
    const absorb = functionDrive.absorb;
    const stabilize = functionDrive.stabilize;
    const drift = clamp(regional.driftScale ?? 1, 0.8, 1.22);
    const damping = clamp(regional.dampingScale ?? 1, 0.82, 1.24);
    const flutter = (0.018 + beatPulse * 0.025) * drift / Math.max(0.82, damping);
    const rel = relationship?.gesture ?? {};
    const mem = memory?.gesture ?? {};
    const memoryStrength = clamp01(memory?.strength01 ?? 0);
    const memoryReply = clamp01(memory?.responsePulse01 ?? 0);
    const pOut = clamp(personality?.outwardMultiplier ?? 1, 0.8, 1.25);
    const pIn = clamp(personality?.inwardMultiplier ?? 1, 0.8, 1.25);
    const pSettle = clamp(personality?.settleMultiplier ?? 1, 0.8, 1.3);
    const pRecip = clamp(personality?.reciprocityMultiplier ?? 1, 0.8, 1.3);
    const relOut = clamp01(((rel.outward01 ?? 0) + (mem.outward01 ?? 0) * 0.58) * pOut);
    const relIn = clamp01(((rel.inward01 ?? 0) + (mem.inward01 ?? 0) * 0.58) * pIn);
    const relSettle = clamp01(((rel.settle01 ?? 0) + (mem.settle01 ?? 0) * 0.62) * pSettle);
    const relReciprocity = clamp01(((rel.reciprocity01 ?? 0) + (mem.reciprocity01 ?? 0) * 0.68) * pRecip);
    const residueRead01 = clamp01(residueRecognition?.strength01 ?? 0);
    const residueInterpretation = residueRecognition?.interpretation ?? "ambient_trace_unread";
    const residueSafe01 = /(care|coherent|rest)/.test(residueInterpretation) ? residueRead01 : 0;
    const residueGuard01 = /(caution|boundary|guarded|counter|sensor)/.test(residueInterpretation) ? residueRead01 : 0;
    const residueBearingX = clamp(residueRecognition?.bearing?.x ?? 0, -1, 1);

    for (const part of cache.byName.get("crescent_manta_soft_body") ?? []) {
      const outward = 1 + pulse * 0.055 - absorb * 0.026 + relOut * 0.038 - relIn * 0.016 + residueSafe01 * 0.028 - residueGuard01 * 0.016;
      part.object.scale.set(
        part.scale.x * outward,
        part.scale.y * (1 + absorb * 0.050 - stabilize * 0.025 + hostBreath * 0.012 + relIn * 0.036 - relSettle * 0.014),
        part.scale.z * (1 + pulse * 0.035 - absorb * 0.018)
      );
    }

    const canopies = [
      ...(cache.byName.get("left_guarding_canopy") ?? []),
      ...(cache.byName.get("right_guarding_canopy") ?? [])
    ];
    for (let i = 0; i < canopies.length; i += 1) {
      const part = canopies[i];
      const side = part.object.name.startsWith("left") ? -1 : 1;
      part.object.scale.x = part.scale.x * (1 + pulse * 0.085 - absorb * 0.045 + relOut * 0.060 - relIn * 0.030 + residueSafe01 * 0.035 - residueGuard01 * 0.028);
      part.object.scale.y = part.scale.y * (1 - stabilize * 0.055 + absorb * 0.035);
      part.object.rotation.z = part.rotation.z + side * (pulse * -0.055 + absorb * 0.040 + relOut * -0.040 + relIn * 0.050 + residueSafe01 * -0.035 + residueGuard01 * 0.030) - residueBearingX * residueRead01 * 0.018 + Math.sin((this.frameState.runtimeSeconds ?? 0) * 2.1 + i) * flutter * (1 - relSettle * 0.55);
    }

    const guardFronds = [
      ...(cache.byName.get("left_seed_guard_frond") ?? []),
      ...(cache.byName.get("right_seed_guard_frond") ?? [])
    ];
    for (const part of guardFronds) {
      const side = part.object.name.startsWith("left") ? -1 : 1;
      part.object.rotation.y = part.rotation.y + side * (pulse * 0.11 - absorb * 0.09);
      part.object.rotation.z = part.rotation.z + side * (pulse * -0.07 + absorb * 0.10 + relIn * 0.085 - relOut * 0.045 + residueGuard01 * 0.055 - residueSafe01 * 0.030);
      part.object.scale.y = part.scale.y * (1 + absorb * 0.08 - stabilize * 0.04);
    }

    const filterFronds = cache.byName.get("filter_frond") ?? [];
    for (let i = 0; i < filterFronds.length; i += 1) {
      const part = filterFronds[i];
      const centered = i - (filterFronds.length - 1) / 2;
      part.object.rotation.z = part.rotation.z + centered * (pulse * 0.038 - absorb * 0.024) + Math.sin((this.frameState.runtimeSeconds ?? 0) * (1.5 + drift * 0.4) + i * 0.7) * flutter;
      part.object.scale.y = part.scale.y * (1 + pulse * 0.035 + absorb * 0.065 - stabilize * 0.025 + relReciprocity * 0.055 + residueSafe01 * 0.040 - residueGuard01 * 0.018);
    }

    for (const part of cache.byName.get("tiny_seed_sac") ?? []) {
      if (part.object.material && !Array.isArray(part.object.material) && part.emissiveIntensity != null) {
        part.object.material.emissiveIntensity = part.emissiveIntensity * (0.88 + articulation01 * 0.34 + authoredPulseReply01 * 0.20 + relReciprocity * 0.22 + relSettle * 0.08 + memoryStrength * 0.12 + memoryReply * 0.26 + residueSafe01 * 0.16 + residueGuard01 * 0.05);
      }
      part.object.scale.setScalar(part.scale.x * (1 + articulation01 * 0.05 + memoryReply * 0.035));
    }

    for (const part of cache.byName.get("tender_seed_sac_glow") ?? []) {
      part.object.intensity = part.lightIntensity * (0.82 + articulation01 * 0.40 + pulse * 0.12 + relReciprocity * 0.18 + relSettle * 0.08 + memoryStrength * 0.10 + memoryReply * 0.22 + residueSafe01 * 0.18 + residueGuard01 * 0.06);
    }
  }

  applyWatcher(cache, { functionDrive, beatPulse, hostBreath, articulation01, authoredPulseReply01, regional, relationship, memory, residueRecognition, personality }) {
    const pulse = functionDrive.pulse;
    const absorb = functionDrive.absorb;
    const stabilize = functionDrive.stabilize;
    const settling = clamp(regional.settlingScale ?? 1, 0.8, 1.24);
    const t = this.frameState.runtimeSeconds ?? 0;
    const rel = relationship?.gesture ?? {};
    const mem = memory?.gesture ?? {};
    const memoryStrength = clamp01(memory?.strength01 ?? 0);
    const memoryReply = clamp01(memory?.responsePulse01 ?? 0);
    const pOut = clamp(personality?.outwardMultiplier ?? 1, 0.8, 1.25);
    const pIn = clamp(personality?.inwardMultiplier ?? 1, 0.8, 1.25);
    const pSettle = clamp(personality?.settleMultiplier ?? 1, 0.8, 1.3);
    const pRecip = clamp(personality?.reciprocityMultiplier ?? 1, 0.8, 1.3);
    const relOut = clamp01(((rel.outward01 ?? 0) + (mem.outward01 ?? 0) * 0.52) * pOut);
    const relIn = clamp01(((rel.inward01 ?? 0) + (mem.inward01 ?? 0) * 0.52) * pIn);
    const relSettle = clamp01(((rel.settle01 ?? 0) + (mem.settle01 ?? 0) * 0.64) * pSettle);
    const relReciprocity = clamp01(((rel.reciprocity01 ?? 0) + (mem.reciprocity01 ?? 0) * 0.72) * pRecip);
    const residueRead01 = clamp01(residueRecognition?.strength01 ?? 0);
    const residueInterpretation = residueRecognition?.interpretation ?? "ambient_trace_unread";
    const residueSample01 = /(sample|signature|verify|compare|coherent|care)/.test(residueInterpretation) ? residueRead01 : 0;
    const residueCounter01 = /counter/.test(residueInterpretation) ? residueRead01 : 0;
    const residueGuard01 = /guarded/.test(residueInterpretation) ? residueRead01 : 0;

    for (const part of cache.byName.get("anchored_watcher_lens_body") ?? []) {
      part.object.scale.x = part.scale.x * (1 + pulse * 0.035 - absorb * 0.025 + relOut * 0.035 - relIn * 0.022 + residueSample01 * 0.024);
      part.object.scale.y = part.scale.y * (1 + absorb * 0.045 - stabilize * 0.030 + hostBreath * 0.008);
      part.object.rotation.z = part.rotation.z + Math.sin(t * 1.8) * 0.015 * (1 - stabilize * 0.55) * (1 - relSettle * 0.62) + Math.sin(t * 1.25) * residueCounter01 * 0.020;
    }

    for (const part of cache.byName.get("dominant_watcher_pupil") ?? []) {
      part.object.scale.x = part.scale.x * (1 + pulse * 0.30 - absorb * 0.18 + relOut * 0.16 - relIn * 0.12 + residueSample01 * 0.14 + residueCounter01 * 0.07);
      part.object.scale.y = part.scale.y * (1 + absorb * 0.10 + articulation01 * 0.08 + residueSample01 * 0.045);
      if (part.object.material && !Array.isArray(part.object.material) && part.opacity != null) {
        part.object.material.opacity = clamp(part.opacity * (0.88 + articulation01 * 0.28), 0, 1);
      }
    }

    const bulbs = cache.byName.get("rotating_sensing_bulb") ?? [];
    for (let i = 0; i < bulbs.length; i += 1) {
      const part = bulbs[i];
      const radialScale = 1 + pulse * 0.12 - absorb * 0.10 + relOut * 0.08 - relIn * 0.07 + Math.sin(t * 3.0 + i * Math.PI) * relReciprocity * 0.025 + residueSample01 * 0.025 + Math.sin(t * 2.4 + i * Math.PI) * residueCounter01 * 0.060;
      part.object.position.x = part.position.x * radialScale;
      part.object.position.z = part.position.z * radialScale;
      part.object.position.y = part.position.y + Math.sin(t * 2.2 + i * 1.2) * 0.018 * (1 - stabilize * 0.7);
      part.object.scale.setScalar(part.scale.x * (1 + articulation01 * 0.055));
    }

    const threads = cache.byName.get("anchoring_signal_thread") ?? [];
    for (let i = 0; i < threads.length; i += 1) {
      const part = threads[i];
      part.object.scale.y = part.scale.y * (1 + stabilize * 0.12 * settling - pulse * 0.025 + relSettle * 0.10 + residueSample01 * 0.055 + residueGuard01 * 0.030);
      part.object.rotation.z = part.rotation.z + Math.sin(t * 1.4 + i) * 0.018 * (1 - stabilize * 0.75);
    }

    for (const part of cache.byName.get("small_warning_pulse_ring") ?? []) {
      const response = clamp01(pulse * 0.52 + authoredPulseReply01 * 0.72 + beatPulse * pulse * 0.22 + relOut * 0.24 + relReciprocity * 0.18 + memoryStrength * 0.12 + memoryReply * 0.62 + residueCounter01 * 0.18 + residueGuard01 * 0.10 + residueSample01 * 0.06);
      const scale = 1 + response * 0.26;
      part.object.scale.set(part.scale.x * scale, part.scale.y * scale, part.scale.z * scale);
      if (part.object.material && !Array.isArray(part.object.material)) {
        part.object.material.opacity = clamp(0.03 + response * 0.34, 0, 0.42);
      }
    }

    for (const part of cache.byName.get("watcher_signal_light") ?? []) {
      part.object.intensity = part.lightIntensity * (0.80 + articulation01 * 0.42 + authoredPulseReply01 * 0.18 + relSettle * 0.10 + relReciprocity * 0.16 + memoryStrength * 0.12 + memoryReply * 0.24 + residueSample01 * 0.18 + residueCounter01 * 0.14);
    }
  }

  applyVascularRelay(cache, { functionDrive, beatPulse, hostBreath, articulation01, relationship, memory, personality }) {
    const pulse = functionDrive.pulse;
    const absorb = functionDrive.absorb;
    const stabilize = functionDrive.stabilize;
    const t = this.frameState.runtimeSeconds ?? 0;
    const rel = relationship?.gesture ?? {};
    const mem = memory?.gesture ?? {};
    const outward = clamp01(((rel.outward01 ?? 0) + (mem.outward01 ?? 0) * 0.44) * clamp(personality?.outwardMultiplier ?? 1.18, 0.8, 1.3));
    const inward = clamp01(((rel.inward01 ?? 0) + (mem.inward01 ?? 0) * 0.44) * clamp(personality?.inwardMultiplier ?? 1.08, 0.8, 1.3));
    const settle = clamp01(((rel.settle01 ?? 0) + (mem.settle01 ?? 0) * 0.50) * clamp(personality?.settleMultiplier ?? 1.22, 0.8, 1.35));
    const flowPulse = clamp01(pulse * 0.82 + outward * 0.48 + beatPulse * 0.18);
    const cup = clamp01(absorb * 0.78 + inward * 0.52);
    const sync = clamp01(stabilize * 0.84 + settle * 0.54);

    for (const part of cache.byName.get("vascular_relay_lumen_body") ?? []) {
      part.object.scale.z = part.scale.z * (1 + flowPulse * 0.10 - cup * 0.045);
      part.object.scale.x = part.scale.x * (1 - flowPulse * 0.025 + cup * 0.055 - sync * 0.025);
      part.object.rotation.z = part.rotation.z + Math.sin(t * 3.2) * 0.025 * (1 - sync * 0.86);
    }

    const vanes = cache.parts.filter((part) => part.object.name.startsWith("relay_flow_vane_"));
    for (let i = 0; i < vanes.length; i += 1) {
      const part = vanes[i];
      const side = part.object.name.endsWith("_left") ? -1 : 1;
      const open = flowPulse * side * -0.12;
      const cupAngle = cup * side * 0.15;
      const baselineZ = part.rotation.z;
      part.object.rotation.z = lerp(baselineZ + open + cupAngle, side * 0.035, sync * 0.78);
      part.object.scale.x = part.scale.x * (1 + flowPulse * 0.085 - cup * 0.035);
      part.object.scale.y = part.scale.y * (1 + cup * 0.075 - sync * 0.025);
      part.object.position.y = part.position.y + Math.sin(t * 4.1 + i * 0.72) * 0.014 * (1 - sync * 0.82);
    }

    const beads = cache.byName.get("relay_lumen_bead") ?? [];
    for (let i = 0; i < beads.length; i += 1) {
      const part = beads[i];
      const wave = Math.sin(t * (3.0 + flowPulse * 2.4) - i * 1.1);
      const scale = 1 + flowPulse * 0.10 * (0.55 + wave * 0.45) + articulation01 * 0.035;
      part.object.scale.setScalar(part.scale.x * scale);
    }

    for (const part of cache.byName.get("relay_downstream_wake") ?? []) {
      const response = clamp01(flowPulse * 0.68 + outward * 0.30 + articulation01 * 0.18);
      const scale = 1 + response * 0.28;
      part.object.scale.set(part.scale.x * scale, part.scale.y * scale, part.scale.z * scale);
      if (part.object.material && !Array.isArray(part.object.material) && part.opacity != null) {
        part.object.material.opacity = clamp(part.opacity * (0.72 + response * 1.05), 0.05, 0.72);
      }
    }

    for (const part of cache.byName.get("vascular_relay_flow_light") ?? []) {
      part.object.intensity = part.lightIntensity * (0.82 + flowPulse * 0.28 + cup * 0.12 + sync * 0.16 + Math.max(0, hostBreath) * 0.06);
    }
  }

  applyGeneric(cache, { functionDrive, beatPulse, hostBreath, articulation01, relationship, memory, residueRecognition, personality }) {
    const pulse = functionDrive.pulse;
    const absorb = functionDrive.absorb;
    const stabilize = functionDrive.stabilize;
    const rel = relationship?.gesture ?? {};
    const mem = memory?.gesture ?? {};
    const relOut = clamp01(((rel.outward01 ?? 0) + (mem.outward01 ?? 0) * 0.45) * clamp(personality?.outwardMultiplier ?? 1, 0.8, 1.25));
    const relIn = clamp01(((rel.inward01 ?? 0) + (mem.inward01 ?? 0) * 0.45) * clamp(personality?.inwardMultiplier ?? 1, 0.8, 1.25));
    const relSettle = clamp01(((rel.settle01 ?? 0) + (mem.settle01 ?? 0) * 0.45) * clamp(personality?.settleMultiplier ?? 1, 0.8, 1.3));
    const residueRead01 = clamp01(residueRecognition?.strength01 ?? 0);
    for (const part of cache.parts) {
      if (!part.object.isMesh) continue;
      const response = 1 + pulse * 0.025 - absorb * 0.018 + hostBreath * 0.006 + relOut * 0.018 - relIn * 0.012 + residueRead01 * 0.010;
      part.object.scale.set(
        part.scale.x * response,
        part.scale.y * (1 + absorb * 0.022 - stabilize * 0.014 + relIn * 0.016 - relSettle * 0.010),
        part.scale.z * response
      );
      if (part.object.material && !Array.isArray(part.object.material) && part.opacity != null && part.object.material.transparent) {
        part.object.material.opacity = clamp(lerp(part.opacity, Math.min(1, part.opacity + 0.08), articulation01 * beatPulse), 0, 1);
      }
    }
  }

  inactiveState() {
    return {
      pass: "HC-028O",
      active: false,
      owner: "EntityEcologyResonanceSystem",
      mode: "inactive",
      world: { profileId: "none", region: "unassigned", keyId: "unassigned", meter: "unassigned", currentFunction: "none", accentRole: "none", phraseStrength: 0, beatPulse: 0 },
      coreRelationship: { state: "inactive", coherence01: 0, worldReply01: 0 },
      expression: { pulse01: 0, absorb01: 0, stabilize01: 0, entrainment01: 0 },
      relationship: { active: false, chord: "idle", primaryInterpretation: "ambient_listening" },
      reciprocalMemory: { active: false, primaryMode: "ambient_memory", primaryStrength01: 0, commitCount: 0 },
      residueRecognition: { active: false, primaryEntityId: "none", primaryInterpretation: "ambient_trace_unread", primaryStrength01: 0, consumesResidue: false, writesReciprocalMemory: false },
      visibleEntityCount: 0,
      bondedTenderPresent: Boolean(this.entitySystem?.tenderBonded),
      entities: [],
      entityBehaviorAuthority: false,
      entityMovementAuthority: false,
      combatAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      newEntityTypeAdded: false
    };
  }
}
