const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028H2 — Topology-conditioned verb character bridge.
 *
 * CoreRadialPerformanceSystem remains the sole gameplay owner of topology-driven
 * verb physiology. This bridge reads the already-authored topology interpretation
 * and publishes presentation/audio character only. It never changes verb range,
 * power, progress, cost, targeting, input timing, movement, routes or engine RPM.
 */
export class CoreTopologyVerbCharacterSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[CoreTopologyVerbCharacterSystem] frameState is required.");
    this.frameState = frameState;
    this.lastMode = "forming";
    this.modeChangeCount = 0;
  }

  init() {
    this.frameState.coreTopologyVerbCharacter = this.inactiveState();
  }

  update(_dt, frameState = this.frameState) {
    const performance = frameState.corePerformance ?? {};
    const resonance = frameState.coreTopologyResonance ?? {};
    const properties = resonance.properties ?? {};
    const active = Boolean(performance.active && resonance.active);

    if (!active) {
      frameState.coreTopologyVerbCharacter = this.inactiveState();
      return;
    }

    const response01 = clamp01(properties.response01 ?? 0.5);
    const inertia01 = clamp01(properties.inertia01 ?? 0.5);
    const coherence01 = clamp01(properties.coherence01 ?? 0.5);
    const exposure01 = clamp01(properties.exposure01 ?? 0.447);
    const balance01 = clamp01(properties.balance01 ?? 0.5);
    const mode = resonance.mode ?? "forming";

    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.modeChangeCount += 1;
    }

    // Bounded character only. These values are consumed by VFX/audio envelopes,
    // never by gameplay owners.
    const pulse = {
      contourPersistenceScale: clamp(0.82 + inertia01 * 0.42, 0.82, 1.24),
      contourExpansionScale: clamp(0.94 + exposure01 * 0.10, 0.94, 1.04),
      chargeCompressionScale: clamp(1.05 - response01 * 0.13, 0.92, 1.05),
      returnTrailScale: clamp(0.84 + inertia01 * 0.34, 0.84, 1.18),
      onsetSharpness01: clamp01(response01 * 0.68 + exposure01 * 0.32)
    };

    const absorb = {
      helixRateScale: clamp(0.80 + response01 * 0.38, 0.80, 1.18),
      helixRadiusScale: clamp(1.10 - exposure01 * 0.14 + inertia01 * 0.05, 0.94, 1.15),
      fragmentLifeScale: clamp(0.88 + inertia01 * 0.30, 0.88, 1.18),
      convergenceFocusScale: clamp(0.92 + coherence01 * 0.16, 0.92, 1.08),
      intakeSharpness01: clamp01(response01 * 0.58 + coherence01 * 0.42)
    };

    const stabilize = {
      wobbleScale: clamp(1.16 - coherence01 * 0.24 + exposure01 * 0.10, 0.92, 1.20),
      precessionRateScale: clamp(0.84 + response01 * 0.28, 0.84, 1.12),
      bandOpacityScale: clamp(0.95 + coherence01 * 0.10, 0.95, 1.05),
      settlePulseScale: clamp(1.08 - coherence01 * 0.12, 0.96, 1.08),
      holdMemory01: clamp01(inertia01 * 0.70 + coherence01 * 0.30)
    };

    const audio = {
      transientScale: clamp(0.96 + response01 * 0.08, 0.96, 1.04),
      tailScale: clamp(0.90 + inertia01 * 0.22, 0.90, 1.12),
      texture01: clamp01(exposure01 * 0.70 + (1 - coherence01) * 0.30),
      focus01: clamp01(coherence01 * 0.66 + balance01 * 0.34),
      referenceGainPreserved: true
    };

    frameState.coreTopologyVerbCharacter = {
      pass: "HC-028H2",
      active: true,
      owner: "CoreTopologyVerbCharacterSystem",
      sourceOwner: "CoreRadialPerformanceSystem + CoreTopologyResonanceSystem",
      topologyId: performance.topologyId ?? resonance.topologyId ?? "forming_topology",
      topologyLabel: performance.topologyLabel ?? resonance.topologyLabel ?? "Forming Topology",
      personality: performance.personality ?? resonance.personality ?? "forming / neutral",
      mode,
      modeChangeCount: this.modeChangeCount,
      properties: {
        response01: round(response01),
        inertia01: round(inertia01),
        coherence01: round(coherence01),
        exposure01: round(exposure01),
        balance01: round(balance01)
      },
      pulse: mapRounded(pulse),
      absorb: mapRounded(absorb),
      stabilize: mapRounded(stabilize),
      audio: { ...mapRounded(audio), referenceGainPreserved: true },
      gameplayAuthority: false,
      verbPowerAuthority: false,
      verbRangeAuthority: false,
      verbProgressAuthority: false,
      costAuthority: false,
      targetingAuthority: false,
      inputAuthority: false,
      movementAuthority: false,
      routeAuthority: false,
      engineRetiming: false,
      topologyBuffTableAdded: false,
      rule: "existing_topology_physiology_gains_readable_verb_character_without_new_power_or_stat_authority"
    };
  }

  inactiveState() {
    return {
      pass: "HC-028H2",
      active: false,
      owner: "CoreTopologyVerbCharacterSystem",
      topologyId: this.frameState.corePerformance?.topologyId ?? "forming_topology",
      topologyLabel: this.frameState.corePerformance?.topologyLabel ?? "Forming Topology",
      personality: this.frameState.corePerformance?.personality ?? "forming / neutral",
      mode: "forming",
      properties: { response01: 0.5, inertia01: 0.5, coherence01: 0.5, exposure01: 0.447, balance01: 1 },
      pulse: { contourPersistenceScale: 1, contourExpansionScale: 1, chargeCompressionScale: 1, returnTrailScale: 1, onsetSharpness01: 0.5 },
      absorb: { helixRateScale: 1, helixRadiusScale: 1, fragmentLifeScale: 1, convergenceFocusScale: 1, intakeSharpness01: 0.5 },
      stabilize: { wobbleScale: 1, precessionRateScale: 1, bandOpacityScale: 1, settlePulseScale: 1, holdMemory01: 0.5 },
      audio: { transientScale: 1, tailScale: 1, texture01: 0.5, focus01: 0.5, referenceGainPreserved: true },
      gameplayAuthority: false,
      verbPowerAuthority: false,
      verbRangeAuthority: false,
      verbProgressAuthority: false,
      costAuthority: false,
      targetingAuthority: false,
      inputAuthority: false,
      movementAuthority: false,
      routeAuthority: false,
      engineRetiming: false,
      topologyBuffTableAdded: false
    };
  }
}

function mapRounded(values) {
  const out = {};
  for (const [key, value] of Object.entries(values)) out[key] = typeof value === "number" ? round(value) : value;
  return out;
}
