const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));
const smooth01 = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/**
 * HC028N — Ecological Residue / Local Host Memory.
 *
 * A meaningful organism relationship may leave one faint, temporary world-space
 * residue after the immediate HC028K/M/M1 response has finished. The residue is
 * presentation memory only: it owns no particles, geometry, player/entity motion,
 * collision, chemistry, bond, repair, targeting, progression, routes or save state.
 * AmbientMaterialInteractionSystem remains the sole owner of the existing Host motes.
 */
export class EntityEcologicalResidueSystem {
  constructor({ entitySystem, frameState }) {
    if (!entitySystem) throw new Error("[EntityEcologicalResidueSystem] entitySystem is required.");
    if (!frameState) throw new Error("[EntityEcologicalResidueSystem] frameState is required.");
    this.entitySystem = entitySystem;
    this.frameState = frameState;
    this.residueById = new Map();
    this.changeCount = 0;
    this.lastPrimaryKey = "inactive";
  }

  init() {
    this.frameState.entityEcologicalResidue = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const memoryById = frameState.entityReciprocalMemory?.byEntityId ?? {};
    const couplingFields = frameState.entityLocalMatterCoupling?.fields ?? [];
    const couplingById = new Map(couplingFields.map((field) => [field.entityId, field]));
    const activeCellId = frameState.activeCellId ?? "unassigned_cell";
    const regional = frameState.regionalPhysicalEmbodiment ?? {};
    const fields = [];
    const residues = [];
    let primary = null;

    for (const entity of this.entitySystem.entities ?? []) {
      const id = entity?.instanceId ?? entity?.root?.userData?.entityInstanceId ?? entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
      const root = entity?.root;
      const memory = memoryById[id] ?? null;
      const coupling = couplingById.get(id) ?? null;
      const state = this.ensureResidue(id);
      const commitCount = Math.max(0, Number(memory?.commitCount ?? 0));

      if (commitCount > state.lastCommitCount) {
        state.lastCommitCount = commitCount;
        const snapshot = this.captureSnapshot({ entity, id, root, memory, coupling, frameState, regional, activeCellId, commitCount });
        if (snapshot) state.pending = snapshot;
      }

      const memoryStrength01 = clamp01(memory?.strength01 ?? 0);
      const memoryRemainingSeconds = Math.max(0, Number(memory?.remainingSeconds ?? 0));
      const immediateResponseActive = memoryStrength01 > 0.06 || memoryRemainingSeconds > 0.05 || Boolean(coupling);

      // The residue begins only after the organism's immediate retained response has ended.
      if (state.pending && !immediateResponseActive) {
        this.activateResidue(state, state.pending);
        state.pending = null;
      }

      if (state.active) {
        state.ageSeconds += safeDt;
        state.remainingSeconds = Math.max(0, state.remainingSeconds - safeDt);
        if (state.remainingSeconds <= 0) this.deactivateResidue(state);
      }

      if (!state.active) continue;
      const envelope = this.resolveEnvelope(state);
      const visibleHere = state.cellId === activeCellId;
      const summary = this.serializeState(state, envelope, visibleHere);
      residues.push(summary);
      if (!visibleHere || envelope <= 0.01) continue;

      const field = this.toMatterField(state, envelope);
      fields.push(field);
      if (!primary || field.strength01 > primary.strength01) primary = field;
    }

    const primaryKey = primary
      ? `${primary.entityId}:${primary.mode}:${primary.residueStage}`
      : residues.length > 0
        ? `stored:${residues[0].entityId}:${residues[0].mode}`
        : "inactive";
    if (primaryKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = primaryKey;
      this.changeCount += 1;
    }

    frameState.entityEcologicalResidue = {
      pass: "HC-028N",
      active: fields.length > 0,
      stored: residues.length > 0,
      owner: "EntityEcologicalResidueSystem",
      sourceOwner: "EntityReciprocalMemorySystem + EntityLocalMatterCouplingSystem",
      changeCount: this.changeCount,
      primary: primary ?? {
        entityId: "none",
        mode: "ambient_trace",
        strength01: 0,
        residueStage: "inactive",
        remainingSeconds: 0,
        position: null,
        radius: 0
      },
      fields,
      residues,
      maxResidues: 8,
      durationRangeSeconds: [20, 45],
      worldSpaceFrozen: true,
      cellScoped: true,
      decaysWhileAway: true,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      saveStateAuthority: false,
      hiddenAffinityScore: false,
      playerMovementAuthority: false,
      entityMovementAuthority: false,
      collisionAuthority: false,
      chemistryAuthority: false,
      bondAuthority: false,
      repairAuthority: false,
      combatAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      routeAuthority: false,
      rule: "completed_organism_relationships_may_leave_a_faint_cell_scoped_world_space_host_matter_trace_that_decays_without_gameplay_or_save_state_authority"
    };
  }

  captureSnapshot({ entity, id, root, memory, coupling, frameState, regional, activeCellId, commitCount }) {
    const position = coupling?.position ?? root?.position;
    if (!position || ![position.x, position.y, position.z].every(Number.isFinite)) return null;
    const sourceMode = coupling?.mode ?? this.resolveFallbackSourceMode(entity, memory?.mode ?? "ambient_memory");
    const durationSeconds = this.resolveDuration(entity, memory?.mode ?? "ambient_memory", sourceMode);
    const residueMode = this.resolveResidueMode(entity, memory?.mode ?? "ambient_memory", sourceMode);
    const signature = this.resolveSignature(entity, residueMode, coupling);
    return {
      entityId: id,
      recipeId: entity?.recipe?.id ?? id,
      commitCount,
      sourceMemoryMode: memory?.mode ?? "ambient_memory",
      sourceInterpretation: memory?.interpretation ?? "ambient_listening",
      sourceMode,
      mode: residueMode,
      cellId: activeCellId,
      region: regional.region ?? frameState.activeRegionId ?? "unassigned",
      matter: regional.matter ?? "unassigned",
      position: { x: Number(position.x), y: Number(position.y), z: Number(position.z) },
      durationSeconds,
      signature
    };
  }

  activateResidue(state, snapshot) {
    state.active = true;
    state.entityId = snapshot.entityId;
    state.recipeId = snapshot.recipeId;
    state.commitCount = snapshot.commitCount;
    state.sourceMemoryMode = snapshot.sourceMemoryMode;
    state.sourceInterpretation = snapshot.sourceInterpretation;
    state.sourceMode = snapshot.sourceMode;
    state.mode = snapshot.mode;
    state.cellId = snapshot.cellId;
    state.region = snapshot.region;
    state.matter = snapshot.matter;
    state.position = { ...snapshot.position };
    state.signature = { ...snapshot.signature };
    state.durationSeconds = snapshot.durationSeconds;
    state.remainingSeconds = snapshot.durationSeconds;
    state.ageSeconds = 0;
  }

  deactivateResidue(state) {
    state.active = false;
    state.remainingSeconds = 0;
    state.ageSeconds = 0;
    state.position = null;
    state.signature = null;
  }

  resolveEnvelope(state) {
    if (!state.active || state.durationSeconds <= 0) return 0;
    const birth01 = smooth01(state.ageSeconds / 1.35);
    const fadeWindow = Math.min(10, Math.max(7, state.durationSeconds * 0.24));
    const tail01 = state.remainingSeconds < fadeWindow
      ? smooth01(state.remainingSeconds / fadeWindow)
      : 1;
    return clamp01(birth01 * tail01);
  }

  resolveStage(state) {
    if (!state.active) return "inactive";
    if (state.ageSeconds < 1.35) return "settling_imprint";
    const fadeWindow = Math.min(10, Math.max(7, state.durationSeconds * 0.24));
    if (state.remainingSeconds <= fadeWindow) return "fading_trace";
    return "retained_trace";
  }

  toMatterField(state, envelope) {
    const s = state.signature ?? this.defaultSignature();
    return {
      entityId: state.entityId,
      recipeId: state.recipeId,
      mode: state.mode,
      sourceMemoryMode: state.sourceMemoryMode,
      sourceMode: state.sourceMode,
      strength01: round(s.baseStrength * envelope),
      envelope01: round(envelope),
      residueStage: this.resolveStage(state),
      ageSeconds: round(state.ageSeconds),
      remainingSeconds: round(state.remainingSeconds),
      durationSeconds: round(state.durationSeconds),
      position: { x: round(state.position.x), y: round(state.position.y), z: round(state.position.z) },
      radius: round(s.radius),
      radialBias: round(s.radialBias),
      tangentialBias: round(s.tangentialBias),
      verticalBias: round(s.verticalBias),
      breathAmplitude: round(s.breathAmplitude),
      oscillationRate: round(s.oscillationRate),
      dampingBias: round(s.dampingBias),
      anchorRadius: round(s.anchorRadius),
      anchorTightness: round(s.anchorTightness),
      localCohortBias: round(s.localCohortBias),
      phaseOffset: round(state.recipeId === "membrane_watcher_001" ? 1.91 : 0.73),
      worldSpaceFrozen: true,
      cellId: state.cellId,
      region: state.region,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      playerMovementAuthority: false,
      entityMovementAuthority: false,
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

  serializeState(state, envelope, visibleHere) {
    return {
      entityId: state.entityId,
      recipeId: state.recipeId,
      mode: state.mode,
      sourceMemoryMode: state.sourceMemoryMode,
      sourceMode: state.sourceMode,
      residueStage: this.resolveStage(state),
      strength01: round((state.signature?.baseStrength ?? 0) * envelope),
      envelope01: round(envelope),
      remainingSeconds: round(state.remainingSeconds),
      durationSeconds: round(state.durationSeconds),
      ageSeconds: round(state.ageSeconds),
      cellId: state.cellId,
      region: state.region,
      visibleHere,
      position: state.position ? { x: round(state.position.x), y: round(state.position.y), z: round(state.position.z) } : null,
      worldSpaceFrozen: true
    };
  }

  resolveDuration(entity, memoryMode, sourceMode) {
    const id = entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    if (id === "nursery_membrane_tender_001") {
      if (["care_exchange_retained", "reciprocity_retained", "whole_core_signature_retained"].includes(memoryMode)) return 38;
      if (["protective_distance_retained", "cautious_contact_retained", "testing_contact_retained"].includes(memoryMode)) return 28;
      if (sourceMode === "coherent_settle") return 34;
      return 31;
    }
    if (id === "membrane_watcher_001") {
      if (["counter_signature_retained", "full_spectrum_signature_retained"].includes(memoryMode)) return 27;
      if (["sample_retained", "probe_signature_retained", "stable_signal_retained"].includes(memoryMode)) return 32;
      return 25;
    }
    const authored = entity?.recipe?.ecologyGrammar?.residue ?? {};
    const duration = Number(authored.durationByMemoryMode?.[memoryMode] ?? authored.defaultDuration);
    if (Number.isFinite(duration) && duration > 0) return duration;
    return 24;
  }

  resolveResidueMode(entity, memoryMode, sourceMode) {
    const id = entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    if (id === "nursery_membrane_tender_001") {
      if (["care_exchange_retained", "reciprocity_retained", "whole_core_signature_retained"].includes(memoryMode)) return "care_afterimage";
      if (["protective_distance_retained", "cautious_contact_retained", "testing_contact_retained"].includes(memoryMode)) return "protective_hush";
      if (["settled_presence_retained", "steady_signal_retained"].includes(memoryMode) || sourceMode === "coherent_settle") return "settled_trace";
      return "tender_presence_trace";
    }
    if (id === "membrane_watcher_001") {
      if (["counter_signature_retained", "full_spectrum_signature_retained"].includes(memoryMode)) return "counter_scan_echo";
      if (["sample_retained", "probe_signature_retained", "stable_signal_retained"].includes(memoryMode)) return "sample_imprint";
      if (memoryMode === "defensive_signature_retained") return "guarded_sensor_hush";
      return "watcher_observation_trace";
    }
    const authoredMode = entity?.recipe?.ecologyGrammar?.residue?.modeByMemoryMode?.[memoryMode];
    return authoredMode ?? "ecological_trace";
  }

  resolveFallbackSourceMode(entity, memoryMode) {
    const id = entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    if (id === "nursery_membrane_tender_001") {
      if (["protective_distance_retained", "cautious_contact_retained", "testing_contact_retained"].includes(memoryMode)) return "protective_retraction";
      if (["settled_presence_retained", "steady_signal_retained"].includes(memoryMode)) return "coherent_settle";
      return "care_breath";
    }
    if (id === "membrane_watcher_001") {
      if (["counter_signature_retained", "full_spectrum_signature_retained"].includes(memoryMode)) return "counter_sense_ripple";
      return "sample_hold";
    }
    return "ambient";
  }

  resolveSignature(entity, residueMode, coupling) {
    const id = entity?.recipe?.id ?? entity?.root?.name ?? "unknown_entity";
    const sourceRadius = Math.max(0.8, Number(coupling?.radius ?? (id === "membrane_watcher_001" ? 1.42 : 1.64)));
    const sourceAnchor = Math.max(0.3, Number(coupling?.anchorRadius ?? sourceRadius * 0.40));
    const sourceRadial = Number(coupling?.radialBias ?? 0);
    const sourceTangential = Number(coupling?.tangentialBias ?? 0);
    const sourceVertical = Number(coupling?.verticalBias ?? 0);
    const sourceBreath = Number(coupling?.breathAmplitude ?? 0.01);
    const sourceRate = Math.max(0.35, Number(coupling?.oscillationRate ?? 0.9));
    const sourceDamping = Math.max(0, Number(coupling?.dampingBias ?? 0.2));
    const sourceTightness = Math.max(0.2, Number(coupling?.anchorTightness ?? 0.6));

    const watcher = id === "membrane_watcher_001";
    const baseStrength = residueMode === "care_afterimage" ? 0.22
      : residueMode === "protective_hush" ? 0.17
      : residueMode === "settled_trace" ? 0.15
      : residueMode === "sample_imprint" ? 0.18
      : residueMode === "counter_scan_echo" ? 0.17
      : 0.14;
    return {
      baseStrength,
      radius: sourceRadius * (watcher ? 0.86 : 0.92),
      radialBias: sourceRadial * 0.26,
      tangentialBias: sourceTangential * (residueMode === "counter_scan_echo" ? 0.42 : 0.24),
      verticalBias: sourceVertical * 0.22,
      breathAmplitude: sourceBreath * (residueMode === "care_afterimage" ? 0.34 : 0.20),
      oscillationRate: sourceRate * (residueMode === "counter_scan_echo" ? 0.72 : 0.56),
      dampingBias: Math.min(0.28, sourceDamping * 0.34 + (residueMode === "protective_hush" ? 0.06 : 0)),
      anchorRadius: sourceAnchor * 1.04,
      anchorTightness: Math.min(0.42, sourceTightness * 0.34),
      localCohortBias: watcher ? 0.92 : 0.88
    };
  }

  defaultSignature() {
    return { baseStrength: 0.14, radius: 1.2, radialBias: 0, tangentialBias: 0, verticalBias: 0, breathAmplitude: 0.004, oscillationRate: 0.6, dampingBias: 0.08, anchorRadius: 0.5, anchorTightness: 0.2, localCohortBias: 0.9 };
  }

  ensureResidue(id) {
    if (this.residueById.has(id)) return this.residueById.get(id);
    const state = {
      entityId: id,
      recipeId: "unknown_entity",
      active: false,
      pending: null,
      lastCommitCount: 0,
      commitCount: 0,
      sourceMemoryMode: "ambient_memory",
      sourceInterpretation: "ambient_listening",
      sourceMode: "ambient",
      mode: "ambient_trace",
      cellId: "unassigned_cell",
      region: "unassigned",
      matter: "unassigned",
      position: null,
      signature: null,
      durationSeconds: 0,
      remainingSeconds: 0,
      ageSeconds: 0
    };
    this.residueById.set(id, state);
    return state;
  }

  inactiveState() {
    return {
      pass: "HC-028N",
      active: false,
      stored: false,
      owner: "EntityEcologicalResidueSystem",
      primary: { entityId: "none", mode: "ambient_trace", strength01: 0, residueStage: "inactive", remainingSeconds: 0, position: null, radius: 0 },
      fields: [],
      residues: [],
      maxResidues: 8,
      durationRangeSeconds: [20, 45],
      worldSpaceFrozen: true,
      cellScoped: true,
      decaysWhileAway: true,
      usesExistingHostMotes: true,
      addsParticles: false,
      addsGeometry: false,
      addsDrawCalls: false,
      saveStateAuthority: false,
      hiddenAffinityScore: false,
      playerMovementAuthority: false,
      entityMovementAuthority: false,
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
