const ROUTE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";

const NODE_DEFS = Object.freeze({
  retainedDraw: Object.freeze({
    objectId: "residue_silt_cloud_001",
    role: "memory_silt",
    baseLevel: 0.74,
    pulse: Object.freeze({ retainedDraw: 1.00, coherentPush: 0.42, heldEquilibrium: 0.22 }),
    absorb: Object.freeze({ retainedDraw: -1.00, coherentPush: -0.20, heldEquilibrium: 0.24 })
  }),
  coherentPush: Object.freeze({
    objectId: "scar_lock_plate_001",
    role: "protective_scar",
    baseLevel: 0.32,
    pulse: Object.freeze({ retainedDraw: -0.16, coherentPush: 0.82, heldEquilibrium: 0.64 }),
    absorb: Object.freeze({ retainedDraw: 0.22, coherentPush: -0.78, heldEquilibrium: -0.34 })
  }),
  heldEquilibrium: Object.freeze({
    objectId: "inheritance_seed_remnant_001",
    role: "inheritance_remnant",
    baseLevel: 0.58,
    pulse: Object.freeze({ retainedDraw: 0.44, coherentPush: 0.40, heldEquilibrium: 0.66 }),
    absorb: Object.freeze({ retainedDraw: -0.38, coherentPush: -0.34, heldEquilibrium: -0.82 })
  })
});

const NODE_KEYS = Object.freeze(Object.keys(NODE_DEFS));
const TARGET_TO_NODE = Object.freeze(Object.fromEntries(
  NODE_KEYS.map((key) => [NODE_DEFS[key].objectId, key])
));

const RESOLUTION_BANDS = Object.freeze([
  Object.freeze({ id: "quiet_retention", min: 0.30, max: 0.43, maxSpread: 0.085 }),
  Object.freeze({ id: "shared_memory", min: 0.47, max: 0.63, maxSpread: 0.095 }),
  Object.freeze({ id: "held_contradiction", min: 0.68, max: 0.80, maxSpread: 0.080 })
]);

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value) => Number((Number.isFinite(value) ? value : 0).toFixed(3));

/**
 * HC031B — Grave II Resonance Gameplay.
 *
 * Grave II already owns a higher-octave spatial expression. This owner makes the
 * familiar Grave landmarks behave as one coupled regional system. Existing verbs
 * inject or settle resonance at the retained target; bounded propagation makes the
 * other Grave landmarks answer. Resolution is a sustained regional condition, not
 * an exact hidden combo sequence. It owns no target selection or route crossing.
 */
export class GraveResonanceGameplaySystem {
  constructor({ frameState, chemObjectSystem, graveReturnRegionSystem }) {
    if (!frameState || !chemObjectSystem || !graveReturnRegionSystem) {
      throw new Error("[GraveResonanceGameplaySystem] frameState, chemObjectSystem and graveReturnRegionSystem are required.");
    }
    this.frameState = frameState;
    this.chemObjectSystem = chemObjectSystem;
    this.graveReturnRegionSystem = graveReturnRegionSystem;
    this.nodes = new Map();
    this.active = false;
    this.wasActive = false;
    this.initialized = false;
    this.completed = false;
    this.resolutionId = "none";
    this.resolutionHold = 0;
    this.interactionCount = 0;
    this.touchedNodes = new Set();
    this.absorbedNodes = new Set();
    this.stabilizedNodes = new Set();
    this.lastPulseEventId = 0;
    this.eventSequence = 0;
    this.completionSequence = 0;
    this.lastEvent = "grave_ii_resonance_dormant";
    this.lastPropagationEvent = null;
  }

  init() {
    for (const key of NODE_KEYS) {
      const def = NODE_DEFS[key];
      this.nodes.set(key, {
        key,
        objectId: def.objectId,
        role: def.role,
        level01: def.baseLevel,
        impulse01: 0,
        lastDelta: 0,
        interactionCount: 0
      });
    }
    this.publish(this.frameState);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    const grave = frameState.graveReturnRegion ?? {};
    this.active = Boolean(grave.active && frameState.activeCellId === ROUTE_CELL_ID);

    if (!this.active) {
      this.wasActive = false;
      this.publish(frameState);
      return;
    }

    if (!this.initialized) this.initializeFromOctave(frameState);
    if (!this.wasActive) this.lastEvent = this.completed ? "grave_ii_resonance_reentered_resolved" : "grave_ii_resonance_field_awake";
    this.wasActive = true;

    this.applyPassiveCoupling(safeDt, frameState);
    this.consumePlayerIntent(safeDt, frameState);
    const metrics = this.metrics();
    this.evaluateResolution(safeDt, metrics, frameState);
    this.applyPresentation(safeDt, metrics, frameState);
    this.publish(frameState, metrics);
  }

  initializeFromOctave(frameState) {
    const resonance = clamp01(frameState.graveReturnRegion?.octave?.resonance01 ?? 0.5);
    const offsets = { retainedDraw: 0.10, coherentPush: -0.08, heldEquilibrium: 0.02 };
    for (const key of NODE_KEYS) {
      const node = this.nodes.get(key);
      node.level01 = clamp01(NODE_DEFS[key].baseLevel + (resonance - 0.5) * offsets[key]);
      node.impulse01 = 0;
      node.lastDelta = 0;
    }
    this.initialized = true;
    this.lastEvent = "grave_ii_resonance_initial_condition_set";
  }

  applyPassiveCoupling(dt, frameState) {
    const metrics = this.metrics();
    const octaveResonance = clamp01(frameState.graveReturnRegion?.octave?.resonance01 ?? 0.5);
    const couplingRate = 0.012 + octaveResonance * 0.018;
    const aftermath = frameState.graveRuptureConsequence ?? {};
    const consequenceStrength = clamp01(aftermath.activeConsequence01 ?? 0);
    const nodeBias = aftermath.nodeBias ?? {};
    const consequenceRate = 0.115 * consequenceStrength;
    for (const node of this.nodes.values()) {
      node.level01 += (metrics.mean - node.level01) * couplingRate * dt;
      if (consequenceStrength > 0.001) {
        const bias = Math.max(-0.14, Math.min(0.14, Number(nodeBias[node.key]) || 0));
        const localCharacter = node.level01 - metrics.mean;
        const consequenceTarget = clamp01(metrics.mean + localCharacter * 0.92 + bias);
        node.level01 += (consequenceTarget - node.level01) * consequenceRate * dt;
        node.impulse01 = Math.max(node.impulse01, Math.abs(consequenceTarget - node.level01) * consequenceStrength * 0.22);
      }
      node.impulse01 = Math.max(0, node.impulse01 - dt * 1.45);
      node.lastDelta *= Math.exp(-dt * 4.0);
    }
  }

  consumePlayerIntent(dt, frameState) {
    if (this.completed) return;
    const targeting = frameState.targeting ?? {};
    if (!targeting.relationshipActive) return;

    const targetId = targeting.relationshipTargetId ?? targeting.targetId ?? "none";
    const sourceKey = TARGET_TO_NODE[targetId];
    if (!sourceKey) return;

    const input = frameState.input ?? {};
    const composition = frameState.verbComposition ?? {};
    const chord = composition.relationshipBound && composition.targetId === targetId
      ? (composition.chord ?? "idle")
      : "idle";

    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    const pulseReleased = Boolean(input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId);
    if (pulseReleased) {
      this.lastPulseEventId = pulseEventId;
      const charge01 = clamp01(input.pulseReleaseCharge01 ?? 0);
      const amplitude = 0.105 + charge01 * 0.065;
      this.propagate(sourceKey, "pulse", amplitude, frameState, chord);
    }

    if (input.absorbHeld) {
      if (!this.absorbedNodes.has(sourceKey)) {
        this.absorbedNodes.add(sourceKey);
        this.interactionCount += 1;
        this.touchedNodes.add(sourceKey);
        this.nodes.get(sourceKey).interactionCount += 1;
      }
      this.propagate(sourceKey, "absorb", (0.078 + (chord === "cohere_draw" ? 0.012 : 0)) * dt, frameState, chord, false);
    }

    if (input.stabilizeHeld || input.resonanceHeld) {
      if (!this.stabilizedNodes.has(sourceKey)) {
        this.stabilizedNodes.add(sourceKey);
        this.interactionCount += 1;
        this.touchedNodes.add(sourceKey);
        this.nodes.get(sourceKey).interactionCount += 1;
      }
      this.applyStabilize(sourceKey, dt, frameState, chord);
    }

    if (chord === "full_system") this.applyFullSystemHold(dt, frameState);
  }

  propagate(sourceKey, kind, amplitude, frameState, chord, countInteraction = true) {
    const source = NODE_DEFS[sourceKey];
    const matrix = source?.[kind];
    if (!matrix) return;

    const reactive = frameState.reactiveStateGrammar?.objects?.[source.objectId] ?? null;
    const condition01 = clamp01(reactive?.condition01 ?? 0.3);
    const conditionGain = 0.88 + condition01 * 0.24;
    const deltas = {};

    for (const key of NODE_KEYS) {
      const node = this.nodes.get(key);
      const delta = (matrix[key] ?? 0) * amplitude * conditionGain;
      node.level01 = clamp01(node.level01 + delta);
      node.lastDelta += delta;
      node.impulse01 = Math.max(node.impulse01, clamp01(Math.abs(delta) * 6.4));
      deltas[key] = round(delta);
    }

    if (countInteraction) {
      this.interactionCount += 1;
      this.touchedNodes.add(sourceKey);
      this.nodes.get(sourceKey).interactionCount += 1;
    }
    this.eventSequence += 1;
    this.lastEvent = `grave_ii_${source.role}_${kind}_propagated`;
    this.lastPropagationEvent = {
      eventId: this.eventSequence,
      sourceKey,
      sourceObjectId: source.objectId,
      role: source.role,
      kind,
      chord,
      deltas,
      frame: frameState.frame ?? 0
    };
  }

  applyStabilize(sourceKey, dt, frameState, chord) {
    const before = this.metrics();
    const sourceNode = this.nodes.get(sourceKey);
    const sourceWeight = chord === "cohere_project" || chord === "cohere_draw" ? 0.82 : 0.66;
    const regionalWeight = chord === "full_system" ? 0.54 : 0.28;
    const desired = clamp01(before.mean * 0.76 + 0.54 * 0.24);

    sourceNode.level01 += (desired - sourceNode.level01) * sourceWeight * dt;
    for (const key of NODE_KEYS) {
      if (key === sourceKey) continue;
      const node = this.nodes.get(key);
      node.level01 += (before.mean - node.level01) * regionalWeight * dt;
      node.impulse01 = Math.max(node.impulse01, 0.08 + Math.abs(before.mean - node.level01) * 0.35);
    }
    sourceNode.impulse01 = Math.max(sourceNode.impulse01, 0.12);
    this.touchedNodes.add(sourceKey);
    this.lastEvent = `grave_ii_${sourceNode.role}_stabilize_coupling`;
  }

  applyFullSystemHold(dt, frameState) {
    const metrics = this.metrics();
    const targetMean = metrics.mean < 0.66 ? 0.56 : 0.72;
    for (const node of this.nodes.values()) {
      node.level01 += (targetMean - node.level01) * 0.34 * dt;
      node.impulse01 = Math.max(node.impulse01, 0.14);
    }
    this.lastEvent = "grave_ii_full_system_regional_hold";
    if ((frameState.frame ?? 0) % 24 === 0) this.interactionCount += 1;
  }

  metrics() {
    const levels = NODE_KEYS.map((key) => this.nodes.get(key)?.level01 ?? 0.5);
    const mean = levels.reduce((sum, value) => sum + value, 0) / levels.length;
    const max = Math.max(...levels);
    const min = Math.min(...levels);
    const spread = max - min;
    const variance = levels.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / levels.length;
    return { mean, spread, variance, levels };
  }

  evaluateResolution(dt, metrics, frameState) {
    if (this.completed) return;
    const candidate = RESOLUTION_BANDS.find((band) => (
      metrics.mean >= band.min
      && metrics.mean <= band.max
      && metrics.spread <= band.maxSpread
    ));
    const hasLivedInteraction = this.interactionCount >= 3 && this.touchedNodes.size >= 2;

    if (candidate && hasLivedInteraction) {
      this.resolutionHold += dt;
      this.resolutionId = candidate.id;
      this.lastEvent = `grave_ii_${candidate.id}_forming`;
    } else {
      this.resolutionHold = Math.max(0, this.resolutionHold - dt * 1.8);
      if (!candidate) this.resolutionId = "none";
    }

    if (this.resolutionHold < 1.65) return;
    this.completed = true;
    this.completionSequence += 1;
    for (const node of this.nodes.values()) node.impulse01 = Math.max(node.impulse01, 0.58);
    this.lastEvent = `grave_ii_${this.resolutionId}_resolved`;
    frameState.returnRegionCompletionEvent = {
      pass: "HC-031B",
      sequence: this.completionSequence,
      key: "grave:phase_2",
      routeKey: "grave",
      phase: 2,
      resolutionId: this.resolutionId,
      source: "GraveResonanceGameplaySystem",
      frame: frameState.frame ?? 0
    };
  }

  applyPresentation(dt, metrics, frameState) {
    const time = frameState.runtimeSeconds ?? 0;
    for (const key of NODE_KEYS) {
      const node = this.nodes.get(key);
      const item = this.chemObjectSystem.objects.find((candidate) => candidate?.recipe?.id === node.objectId);
      const pivot = item?.responsePivot;
      const localOffset = node.level01 - metrics.mean;
      if (pivot) {
        const impulse = node.impulse01;
        const swell = 1 + Math.abs(localOffset) * 0.08 + impulse * 0.035;
        pivot.scale.multiplyScalar(swell);
        pivot.position.y += Math.sin(time * 5.2 + NODE_KEYS.indexOf(key) * 1.7) * impulse * 0.028;
        pivot.rotation.y += localOffset * 0.08 + Math.sin(time * 3.4) * impulse * 0.025;
        pivot.userData.graveRegionalResonance = {
          level01: round(node.level01),
          regionalMean01: round(metrics.mean),
          regionalSpread01: round(metrics.spread),
          propagationImpulse01: round(impulse),
          role: node.role
        };
      }

      const knot = this.graveReturnRegionSystem.knots?.get(key);
      if (knot?.material) {
        const targetOpacity = 0.10 + node.level01 * 0.18 + node.impulse01 * 0.18;
        const targetEmissive = 0.08 + node.level01 * 0.22 + node.impulse01 * 0.34;
        knot.material.opacity += (targetOpacity - knot.material.opacity) * (1 - Math.exp(-dt * 8));
        knot.material.emissiveIntensity += (targetEmissive - knot.material.emissiveIntensity) * (1 - Math.exp(-dt * 9));
        knot.scale.multiplyScalar(0.96 + node.level01 * 0.10 + node.impulse01 * 0.08);
      }
    }

    // The existing octave strata are the regional body. Spread makes them disagree;
    // convergence makes their breathing align. No new rings/lines are introduced.
    for (const [index, shell] of (this.graveReturnRegionSystem.strata ?? []).entries()) {
      const disagreement = clamp01(metrics.spread / 0.45);
      shell.rotation.y += Math.sin(time * (0.45 + disagreement * 0.9) + index * 0.61) * disagreement * 0.018;
      shell.scale.y *= 1 + Math.sin(time * 1.2 + index * 0.8) * disagreement * 0.018;
    }
  }

  publish(frameState, metrics = this.metrics()) {
    const candidate = RESOLUTION_BANDS.find((band) => (
      metrics.mean >= band.min
      && metrics.mean <= band.max
      && metrics.spread <= band.maxSpread
    )) ?? null;
    const nodes = {};
    for (const key of NODE_KEYS) {
      const node = this.nodes.get(key);
      nodes[key] = {
        objectId: node.objectId,
        role: node.role,
        level01: round(node.level01),
        propagationImpulse01: round(node.impulse01),
        interactionCount: node.interactionCount
      };
    }

    frameState.graveResonanceGameplay = {
      pass: "HC-031B",
      active: this.active,
      owner: "GraveResonanceGameplaySystem",
      law: "touch_one_part_of_the_octave_and_other_parts_answer",
      nodes,
      regional: {
        mean01: round(metrics.mean),
        spread01: round(metrics.spread),
        variance01: round(metrics.variance),
        candidateResolution: candidate?.id ?? "none",
        resolutionHold01: round(clamp01(this.resolutionHold / 1.65))
      },
      interactionCount: this.interactionCount,
      touchedNodeCount: this.touchedNodes.size,
      completed: this.completed,
      resolutionId: this.resolutionId,
      lastPropagationEvent: this.lastPropagationEvent,
      lastEvent: this.lastEvent,
      rules: {
        exactComboGate: false,
        regionalConditionResolution: true,
        multipleValidResolutionBands: RESOLUTION_BANDS.map((band) => band.id),
        exitBlocked: false,
        newAbilityButtons: 0,
        targetingAuthority: false,
        routeCrossingAuthority: false,
        perObjectReactiveStateAuthority: false
      }
    };
  }
}
