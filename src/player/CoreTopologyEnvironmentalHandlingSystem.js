const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028H1 — Topology-conditioned environmental handling bridge.
 *
 * This system does not replace HC027C CoreRadialPerformanceSystem and does not
 * move the player. It reads the already-published HC028H topology properties and
 * converts them into two small, bounded environmental-reception modifiers that
 * PlayerMovementController may consume:
 *
 *  - environmentalCouplingMultiplier: how strongly Host flow accelerates the Core
 *  - fluidSlipDampingMultiplier: how quickly the Core yields back toward local flow
 *
 * Deep/inertial topology therefore buffers external motion; membrane/exposed
 * topology couples quickly; Inner and balanced configurations remain close to the
 * established HC028G/HC028F1 baseline. No region table or arbitrary topology buff
 * table is introduced.
 */
export class CoreTopologyEnvironmentalHandlingSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[CoreTopologyEnvironmentalHandlingSystem] frameState is required.");
    this.frameState = frameState;
    this.lastMode = "neutral";
    this.modeChangeCount = 0;
  }

  init() {
    this.frameState.coreTopologyEnvironmentalHandling = this.neutralState();
  }

  update(_dt, frameState = this.frameState) {
    const topology = frameState.coreTopologyResonance ?? {};
    const performance = frameState.corePerformance ?? {};
    const regional = frameState.regionalPhysicalEmbodiment ?? {};
    const properties = topology.properties ?? {};
    const active = Boolean(topology.active && performance.active);

    if (!active) {
      frameState.coreTopologyEnvironmentalHandling = this.neutralState();
      return;
    }

    const response01 = clamp(properties.response01 ?? 0.5, 0, 1);
    const inertia01 = clamp(properties.inertia01 ?? 0.5, 0, 1);
    const coherence01 = clamp(properties.coherence01 ?? 0.5, 0, 1);
    const exposure01 = clamp(properties.exposure01 ?? 0.447, 0, 1);
    const balance01 = clamp(properties.balance01 ?? 1, 0, 1);

    // Universal topology law — intentionally no per-region or topology lookup table.
    // The balanced 1:1:1 profile lands approximately at 1.0; pure Deep is buffered
    // and pure Membrane is more exposed, while the bounds remain deliberately small.
    const environmentalCouplingMultiplier = clamp(
      0.949
        + exposure01 * 0.10
        + (response01 - 0.5) * 0.02
        - (inertia01 - 0.5) * 0.025,
      0.92,
      1.09
    );

    const fluidSlipDampingMultiplier = clamp(
      0.98
        + exposure01 * 0.055
        + (response01 - 0.5) * 0.025
        - (inertia01 - 0.5) * 0.04
        + (coherence01 - 0.5) * 0.015,
      0.94,
      1.07
    );

    const mode = this.resolveMode(topology.mode, environmentalCouplingMultiplier, fluidSlipDampingMultiplier);
    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.modeChangeCount += 1;
    }

    frameState.coreTopologyEnvironmentalHandling = {
      pass: "HC-028H1",
      active: true,
      owner: "CoreTopologyEnvironmentalHandlingSystem",
      sourceOwner: "CoreTopologyResonanceSystem / CoreRadialPerformanceSystem",
      topologyId: topology.topologyId ?? performance.topologyId ?? "forming_topology",
      topologyMode: topology.mode ?? "forming",
      personality: topology.personality ?? performance.personality ?? "forming / neutral",
      regionalContext: {
        active: Boolean(regional.active),
        region: regional.region ?? "unassigned",
        law: regional.law ?? "none",
        force: regional.force ?? "none"
      },
      properties: {
        response01: round(response01),
        inertia01: round(inertia01),
        coherence01: round(coherence01),
        exposure01: round(exposure01),
        balance01: round(balance01)
      },
      handling: {
        mode,
        environmentalCouplingMultiplier: round(environmentalCouplingMultiplier),
        fluidSlipDampingMultiplier: round(fluidSlipDampingMultiplier),
        couplingRange: [0.92, 1.09],
        slipDampingRange: [0.94, 1.07],
        normalInputAccelerationMultiplier: 1,
        speedLimitMultiplier: 1,
        boostMultiplier: 1,
        verbMultiplier: 1
      },
      modeChangeCount: this.modeChangeCount,
      handlingAuthority: true,
      movementAuthority: false,
      movementConsumer: "PlayerMovementController",
      verbAuthority: false,
      routeAuthority: false,
      progressionAuthority: false,
      inputAuthority: false,
      regionTableAdded: false,
      topologyBuffTableAdded: false,
      rule: "topology_changes_how_existing_environmental_force_is_received_without_changing_player_input_or_world_force_generation"
    };
  }

  resolveMode(topologyMode, coupling, slip) {
    if (topologyMode === "buffered_long_memory" || coupling < 0.955) return "buffered_inertial";
    if (topologyMode === "exposed_quick_response" || coupling > 1.045) return "exposed_coupled";
    if (topologyMode === "controlled_transmission") return "controlled_transmission";
    if (topologyMode === "triadic_adaptive") return "adaptive_neutral";
    if (slip < 0.985) return "buffered_mixed";
    if (slip > 1.025) return "coupled_mixed";
    return "controlled_mixed";
  }

  neutralState() {
    return {
      pass: "HC-028H1",
      active: false,
      owner: "CoreTopologyEnvironmentalHandlingSystem",
      sourceOwner: "CoreTopologyResonanceSystem / CoreRadialPerformanceSystem",
      topologyId: this.frameState.coreTopologyResonance?.topologyId ?? "forming_topology",
      topologyMode: this.frameState.coreTopologyResonance?.mode ?? "forming",
      personality: this.frameState.corePerformance?.personality ?? "forming / neutral",
      regionalContext: { active: false, region: "unassigned", law: "none", force: "none" },
      properties: { response01: 0.5, inertia01: 0.5, coherence01: 0.5, exposure01: 0.447, balance01: 1 },
      handling: {
        mode: "neutral",
        environmentalCouplingMultiplier: 1,
        fluidSlipDampingMultiplier: 1,
        couplingRange: [0.92, 1.09],
        slipDampingRange: [0.94, 1.07],
        normalInputAccelerationMultiplier: 1,
        speedLimitMultiplier: 1,
        boostMultiplier: 1,
        verbMultiplier: 1
      },
      modeChangeCount: this.modeChangeCount,
      handlingAuthority: true,
      movementAuthority: false,
      movementConsumer: "PlayerMovementController",
      verbAuthority: false,
      routeAuthority: false,
      progressionAuthority: false,
      inputAuthority: false,
      regionTableAdded: false,
      topologyBuffTableAdded: false
    };
  }
}
