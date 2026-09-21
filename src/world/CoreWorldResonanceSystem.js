const FUNCTION_INDEX = Object.freeze({ pulse: 0, absorb: 1, stabilize: 2 });

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const smooth = (current, target, dt, rate) => current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * rate));
const circularDistance01 = (a, b) => {
  const raw = Math.abs((((a - b) % 1) + 1) % 1);
  return Math.min(raw, 1 - raw);
};

/**
 * HC028E — Core ↔ World Resonance across authored regional composition.
 *
 * This is a read-only bridge between two existing truths:
 *   - CoreEngineSystem owns the Core's 3 -> 6 -> 12 firing architecture.
 *   - HostRhythmSystem/WorldCompositionRegistry own regional key/meter/tempo.
 *
 * HC028D does not retime the engine, alter movement, gate input, change route
 * completion, or award gameplay advantage. It only describes the relationship
 * and publishes restrained presentation cues for systems that already render
 * the Core/world.
 */
export class CoreWorldResonanceSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[CoreWorldResonanceSystem] frameState is required.");
    this.frameState = frameState;
    this.coherence01 = 0.5;
    this.phaseAlignment01 = 0;
    this.lastRelationshipState = "inactive";
    this.stateChangeCount = 0;
  }

  init() {
    this.frameState.coreWorldResonance = this.createInactiveState();
  }

  update(dt, frameState = this.frameState) {
    const composition = frameState.hostRhythm?.composition ?? {};
    const engine = frameState.coreEngine ?? {};
    const active = Boolean(
      composition.active
      && composition.sharedHostClock !== false
      && engine.active
    );

    if (!active) {
      this.coherence01 = smooth(this.coherence01, 0.5, dt, 2.2);
      frameState.coreWorldResonance = this.createInactiveState();
      return;
    }

    const phaseCount = Math.max(3, Math.min(12, engine.phaseCount ?? 3));
    const phasesPerFunction = Math.max(1, Math.round(phaseCount / 3));
    const coreCycle = ((engine.cycleProgress01 ?? 0) % 1 + 1) % 1;
    const worldFunction = composition.currentFunction ?? "pulse";
    const functionIndex = FUNCTION_INDEX[worldFunction] ?? 0;

    // Find the nearest firing position for the world-emphasized function.
    // 3 / 6 / 12 therefore change temporal resolution naturally without ever
    // changing the authored P -> A -> S Core firing order.
    let nearest = 0.5;
    for (let ordinal = 0; ordinal < phasesPerFunction; ordinal += 1) {
      const phaseIndex = functionIndex + ordinal * 3;
      const slot = phaseIndex / phaseCount;
      nearest = Math.min(nearest, circularDistance01(coreCycle, slot));
    }
    const halfSpacing = 0.5 / phasesPerFunction;
    this.phaseAlignment01 = clamp01(1 - nearest / Math.max(0.0001, halfSpacing));

    const coreFunction = engine.currentPhaseFunction ?? "pulse";
    const functionMatch = coreFunction === worldFunction;
    const accentStrength = clamp01(composition.accentStrength ?? 0);
    const beatPulse = clamp01(composition.beatPulse ?? 0);
    const architectureContinuity = phaseCount === 3 ? 0.28 : phaseCount === 6 ? 0.58 : 0.86;
    const keyAffinity = Array.isArray(composition.keyOrder) && composition.keyOrder.includes(worldFunction) ? 1 : 0.5;

    // The relation remains readable between beats. Accent strength makes the
    // alignment more visible but never becomes a timing requirement.
    const instantCoherence = clamp01(
      0.20
      + this.phaseAlignment01 * 0.38
      + (functionMatch ? 0.19 : 0.04)
      + architectureContinuity * 0.13
      + keyAffinity * 0.06
      + accentStrength * this.phaseAlignment01 * 0.04
    );
    const settleRate = instantCoherence >= this.coherence01 ? 3.6 : 2.4;
    this.coherence01 = smooth(this.coherence01, instantCoherence, dt, settleRate);

    const relationshipState = this.resolveRelationshipState({
      coherence01: this.coherence01,
      phaseAlignment01: this.phaseAlignment01,
      accentStrength,
      functionMatch
    });
    if (relationshipState !== this.lastRelationshipState) {
      this.lastRelationshipState = relationshipState;
      this.stateChangeCount += 1;
    }

    const topologyResonance = frameState.coreTopologyResonance ?? {};
    const topologyActive = Boolean(topologyResonance.active);
    const topologyPresentation = topologyResonance.presentation ?? {};
    const topologyProperties = topologyResonance.properties ?? {};
    const topologyExposure = topologyActive ? clamp01(topologyProperties.exposure01 ?? 0.5) : 0.5;
    const topologyResponse = topologyActive ? clamp01(topologyProperties.response01 ?? 0.5) : 0.5;
    const topologyCoherence = topologyActive ? clamp01(topologyProperties.coherence01 ?? 0.5) : 0.5;
    const topologyImprint = topologyActive ? clamp01(topologyPresentation.worldImprint01 ?? 0) : 0;

    const resonancePulse = clamp01(
      this.phaseAlignment01 * (0.42 + beatPulse * 0.58) * (functionMatch ? 1 : 0.58)
    );
    // HC028H keeps the canonical engine/world coherence score intact while
    // letting topology change how strongly that relationship is embodied.
    const embodiedCoherence01 = clamp01(
      this.coherence01 * (0.88 + topologyCoherence * 0.12)
    );
    const topologyPrecessionScale = topologyActive
      ? Math.max(0.88, Math.min(1.12, topologyPresentation.precessionScale ?? 1))
      : 1;
    const precessionScale = Math.max(0.78, Math.min(1.14, (1.10 - this.coherence01 * 0.28) * topologyPrecessionScale));
    const topologyVisibility = topologyActive
      ? clamp01(topologyPresentation.worldCouplingVisibility01 ?? 0)
      : 0;
    const planeEmphasis = clamp01(
      0.08 + accentStrength * 0.22 + resonancePulse * 0.28 + topologyVisibility * 0.12
    );
    const worldReplyStrength = clamp01(
      resonancePulse * 0.18
      + this.coherence01 * accentStrength * 0.08
      + topologyImprint * topologyExposure * (0.025 + topologyResponse * 0.025)
    );

    frameState.coreWorldResonance = {
      pass: "HC-028H",
      active: true,
      owner: "CoreWorldResonanceSystem",
      relation: relationshipState,
      relationshipState,
      coherence01: Number(this.coherence01.toFixed(3)),
      instantaneousCoherence01: Number(instantCoherence.toFixed(3)),
      phaseAlignment01: Number(this.phaseAlignment01.toFixed(3)),
      functionMatch,
      coreFunction,
      worldFunction,
      worldProfileId: composition.profileId ?? "unassigned",
      worldKeyId: composition.keyId ?? "unassigned",
      worldMeter: composition.meterLabel ?? "unassigned",
      worldTempoBpm: composition.tempoBpm ?? 0,
      worldOctave: composition.octaveLabel ?? "unassigned",
      beatNumber: composition.beatNumber ?? 0,
      accentRole: composition.accentRole ?? "none",
      accentStrength: Number(accentStrength.toFixed(3)),
      architectureId: engine.architectureId ?? "triadic_3",
      phaseCount,
      phasesPerFunction,
      architectureContinuity01: architectureContinuity,
      topology: {
        active: topologyActive,
        topologyId: topologyResonance.topologyId ?? "forming_topology",
        mode: topologyResonance.mode ?? "forming",
        response01: Number(topologyResponse.toFixed(3)),
        coherence01: Number(topologyCoherence.toFixed(3)),
        exposure01: Number(topologyExposure.toFixed(3)),
        worldImprint01: Number(topologyImprint.toFixed(3))
      },
      presentation: {
        resonancePulse: Number(resonancePulse.toFixed(3)),
        embodiedCoherence01: Number(embodiedCoherence01.toFixed(3)),
        precessionScale: Number(precessionScale.toFixed(3)),
        emphasizedFunction: worldFunction,
        planeEmphasis: Number(planeEmphasis.toFixed(3)),
        worldReplyStrength: Number(worldReplyStrength.toFixed(3)),
        topologyVisibility01: Number(topologyVisibility.toFixed(3))
      },
      stateChangeCount: this.stateChangeCount,
      sharedClock: true,
      readOnlyBridge: true,
      engineRetiming: false,
      movementAuthority: false,
      verbAuthority: false,
      progressionAuthority: false,
      routeCompletionAuthority: false,
      inputTimingGate: false,
      gameplayAdvantage: false,
      rule: "core_and_world_can_visibly_entrain_and_topology_can_shape_the_embodiment_without_becoming_a_rhythm_gate"
    };
  }

  resolveRelationshipState({ coherence01, phaseAlignment01, accentStrength, functionMatch }) {
    if (coherence01 < 0.36 && accentStrength > 0.66 && !functionMatch && phaseAlignment01 < 0.18) return "opposed";
    if (coherence01 >= 0.70) return "aligned";
    if (coherence01 >= 0.56) return "resolving";
    if (coherence01 >= 0.40) return "oscillating";
    return "strained";
  }

  createInactiveState() {
    return {
      pass: "HC-028H",
      active: false,
      owner: "CoreWorldResonanceSystem",
      relation: "inactive",
      relationshipState: "inactive",
      coherence01: Number(this.coherence01.toFixed(3)),
      instantaneousCoherence01: 0,
      phaseAlignment01: 0,
      functionMatch: false,
      coreFunction: this.frameState.coreEngine?.currentPhaseFunction ?? "none",
      worldFunction: "none",
      topology: { active: false, topologyId: "forming_topology", mode: "forming", response01: 0.5, coherence01: 0.5, exposure01: 0.447, worldImprint01: 0 },
      presentation: {
        resonancePulse: 0,
        embodiedCoherence01: Number(this.coherence01.toFixed(3)),
        precessionScale: 1,
        emphasizedFunction: "none",
        planeEmphasis: 0,
        worldReplyStrength: 0,
        topologyVisibility01: 0
      },
      readOnlyBridge: true,
      engineRetiming: false,
      movementAuthority: false,
      verbAuthority: false,
      progressionAuthority: false,
      routeCompletionAuthority: false,
      inputTimingGate: false,
      gameplayAdvantage: false
    };
  }
}
