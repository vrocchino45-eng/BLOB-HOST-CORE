const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));
const normalize = (value, min, max) => clamp01((value - min) / Math.max(0.0001, max - min));
const smooth = (current, target, dt, rate) => current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * rate));

/**
 * HC028H — Core Topology ↔ Regional Resonance bridge.
 *
 * The existing CoreRadialPerformanceSystem remains the sole gameplay owner of
 * radial topology physiology. This system only interprets that already-authored
 * topology as four embodied properties for the newer composition/resonance stack:
 * response, inertia, coherence and exposure.
 *
 * No duplicate topology table is introduced. Response/inertia/coherence are
 * normalized from the canonical HC027C traits; exposure reuses HC024E's canonical
 * Deep/Inner/Membrane world-exposure law (0.06 / 0.28 / 1.0).
 *
 * The result is presentation/telemetry only in HC028H. It cannot move the player,
 * change verb strength, retime the engine, complete routes or gate input.
 */
export class CoreTopologyResonanceSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[CoreTopologyResonanceSystem] frameState is required.");
    this.frameState = frameState;
    this.worldImprint01 = 0;
    this.lastMode = "forming";
    this.modeChangeCount = 0;
  }

  init() {
    this.frameState.coreTopologyResonance = this.inactiveState();
  }

  update(dt, frameState = this.frameState) {
    const performance = frameState.corePerformance ?? {};
    const chemistry = frameState.spatialCoreChemistry ?? {};
    const output = frameState.coreChemistryOutput ?? chemistry.worldOutput ?? {};
    const regional = frameState.regionalPhysicalEmbodiment ?? {};
    const composition = frameState.hostRhythm?.composition ?? {};
    const weights = performance.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const traits = performance.traits ?? {};
    const active = Boolean(performance.active && chemistry.topology?.complete !== false);

    if (!active) {
      this.worldImprint01 = smooth(this.worldImprint01, 0, dt, 3.0);
      frameState.coreTopologyResonance = this.inactiveState();
      return;
    }

    // Canonical HC027C trait ranges — interpreted, not re-authored.
    const response01 = normalize(traits.response ?? 1, 0.88, 1.20);
    const inertia01 = normalize(traits.enduranceCapacity ?? 1, 0.72, 1.55);
    const coherence01 = normalize(traits.stability ?? 1, 0.70, 1.30);

    // Canonical HC024E zone-exposure law. Pure Deep remains insulated, Inner
    // partially circulating, Membrane fully exposed to Host contact.
    const deep = clamp01(weights.deep ?? 1 / 3);
    const inner = clamp01(weights.inner ?? 1 / 3);
    const membrane = clamp01(weights.membrane ?? 1 / 3);
    const exposure01 = clamp01(deep * 0.06 + inner * 0.28 + membrane * 1.0);
    const balance01 = clamp01(1 - (Math.max(deep, inner, membrane) - Math.min(deep, inner, membrane)));

    const worldActive = Boolean(regional.active && composition.active);
    const phraseStrength = worldActive ? clamp01(regional.phraseStrength ?? 0) : 0;
    const beatPulse = worldActive ? clamp01(regional.beatPulse ?? composition.beatPulse ?? 0) : 0;
    const targetImprint = worldActive
      ? clamp01(exposure01 * (0.34 + phraseStrength * 0.66))
      : 0;

    // Fast-response cores pick up a new world phrase quickly. High-inertia cores
    // retain that visual imprint longer when the phrase relaxes or changes.
    const riseRate = 1.8 + response01 * 4.2;
    const fallRate = 0.75 + (1 - inertia01) * 3.4;
    this.worldImprint01 = smooth(
      this.worldImprint01,
      targetImprint,
      dt,
      targetImprint >= this.worldImprint01 ? riseRate : fallRate
    );

    const mode = this.resolveMode({ deep, inner, membrane, balance01 });
    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.modeChangeCount += 1;
    }

    const topologyPrecessionScale = clamp(
      1.08 - coherence01 * 0.18 + exposure01 * 0.055 - balance01 * 0.035,
      0.88,
      1.12
    );
    const worldCouplingVisibility01 = clamp01(this.worldImprint01 * (0.68 + response01 * 0.32));
    const firingSharpness01 = clamp01(0.34 + response01 * 0.66);
    const memoryTrail01 = clamp01(inertia01 * (0.58 + this.worldImprint01 * 0.42));
    const coherenceHold01 = clamp01(coherence01 * (0.78 + balance01 * 0.22));
    const embodiedWorldPulse01 = clamp01(
      worldCouplingVisibility01 * (0.42 + beatPulse * 0.58)
    );

    frameState.coreTopologyResonance = {
      pass: "HC-028H",
      active: true,
      owner: "CoreTopologyResonanceSystem",
      sourceOwner: "CoreRadialPerformanceSystem + CoreEmbodimentSystem spatialCoreChemistry",
      topologyId: performance.topologyId ?? chemistry.topology?.id ?? "forming_topology",
      topologyLabel: performance.topologyLabel ?? chemistry.topology?.label ?? "Forming Topology",
      distribution: performance.distribution ?? chemistry.topology?.distribution ?? "0:0:0",
      personality: performance.personality ?? "forming / neutral",
      dominantZone: performance.dominantZone ?? chemistry.topology?.dominantZone ?? "balanced",
      mode,
      modeChangeCount: this.modeChangeCount,
      weights: { deep: round(deep), inner: round(inner), membrane: round(membrane) },
      properties: {
        response01: round(response01),
        inertia01: round(inertia01),
        coherence01: round(coherence01),
        exposure01: round(exposure01),
        balance01: round(balance01)
      },
      regionalContext: {
        active: worldActive,
        profileId: composition.profileId ?? "unassigned",
        region: regional.region ?? "unassigned",
        law: regional.law ?? "none",
        force: regional.force ?? "none",
        currentFunction: composition.currentFunction ?? "none",
        phraseStrength: round(phraseStrength),
        beatPulse: round(beatPulse)
      },
      presentation: {
        worldImprint01: round(this.worldImprint01),
        worldCouplingVisibility01: round(worldCouplingVisibility01),
        firingSharpness01: round(firingSharpness01),
        memoryTrail01: round(memoryTrail01),
        coherenceHold01: round(coherenceHold01),
        precessionScale: round(topologyPrecessionScale),
        embodiedWorldPulse01: round(embodiedWorldPulse01)
      },
      gameplayAuthority: false,
      movementAuthority: false,
      verbAuthority: false,
      engineArchitectureAuthority: false,
      engineRetiming: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      duplicateTopologyEngine: false,
      rule: "existing_core_topology_changes_how_world_resonance_is_embodied_without_adding_a_second_topology_or_stat_system"
    };
  }

  resolveMode({ deep, inner, membrane, balance01 }) {
    if (balance01 > 0.94) return "triadic_adaptive";
    if (deep >= 0.66) return "buffered_long_memory";
    if (membrane >= 0.66) return "exposed_quick_response";
    if (inner >= 0.66) return "controlled_transmission";
    if (deep > membrane && deep >= inner) return "buffered_mixed";
    if (membrane > deep && membrane >= inner) return "expressive_mixed";
    return "controlled_mixed";
  }

  inactiveState() {
    return {
      pass: "HC-028H",
      active: false,
      owner: "CoreTopologyResonanceSystem",
      topologyId: this.frameState.corePerformance?.topologyId ?? "forming_topology",
      topologyLabel: this.frameState.corePerformance?.topologyLabel ?? "Forming Topology",
      distribution: this.frameState.corePerformance?.distribution ?? "0:0:0",
      personality: this.frameState.corePerformance?.personality ?? "forming / neutral",
      dominantZone: this.frameState.corePerformance?.dominantZone ?? "balanced",
      mode: "forming",
      weights: { deep: 0.333, inner: 0.333, membrane: 0.333 },
      properties: { response01: 0.5, inertia01: 0.5, coherence01: 0.5, exposure01: 0.447, balance01: 1 },
      regionalContext: { active: false, profileId: "none", region: "unassigned", law: "none", force: "none", currentFunction: "none", phraseStrength: 0, beatPulse: 0 },
      presentation: {
        worldImprint01: round(this.worldImprint01),
        worldCouplingVisibility01: 0,
        firingSharpness01: 0.5,
        memoryTrail01: 0,
        coherenceHold01: 0.5,
        precessionScale: 1,
        embodiedWorldPulse01: 0
      },
      gameplayAuthority: false,
      movementAuthority: false,
      verbAuthority: false,
      engineArchitectureAuthority: false,
      engineRetiming: false,
      progressionAuthority: false,
      routeAuthority: false,
      inputTimingGate: false,
      duplicateTopologyEngine: false
    };
  }
}
