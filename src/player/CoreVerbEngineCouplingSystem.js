const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const smooth = (current, target, dt, rise, fall = rise) => {
  const rate = target >= current ? rise : fall;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * rate));
};

/**
 * HC028D1 — Core ↔ Verb Engine Coupling.
 *
 * Read-only bridge between canonical input/verb intent and CoreEngineSystem.
 * It never changes verb strength, firing sequence, movement, targeting, chemistry,
 * route completion, or controller mapping. It only describes which gyroscopic
 * function planes should visibly carry the player's current verb intent.
 */
export class CoreVerbEngineCouplingSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[CoreVerbEngineCouplingSystem] frameState is required.");
    this.frameState = frameState;
    this.pulseDrive01 = 0;
    this.absorbDrive01 = 0;
    this.stabilizeDrive01 = 0;
    this.pulseReleaseAge = 99;
    this.lastPulseEventId = 0;
    this.lastPulseReleaseKind = "quick";
    this.lastPulseReleaseCharge01 = 0;
    this.lastChord = "idle";
    this.chordChangeCount = 0;
  }

  init() {
    this.frameState.coreVerbEngineCoupling = this.createState();
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    const input = frameState.input ?? {};
    const engine = frameState.coreEngine ?? {};

    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    if (Boolean(input.pulsePressed) && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      this.pulseReleaseAge = 0;
      this.lastPulseReleaseKind = input.pulseReleaseKind === "charged" ? "charged" : "quick";
      this.lastPulseReleaseCharge01 = clamp01(input.pulseReleaseCharge01 ?? 0);
    } else {
      this.pulseReleaseAge += safeDt;
    }

    const pulseHeld = Boolean(input.pulseHeld);
    const absorbHeld = Boolean(input.absorbHeld);
    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const pulseCharge01 = clamp01(input.pulseCharge01 ?? 0);

    const releaseDuration = this.lastPulseReleaseKind === "charged" ? 0.62 : 0.34;
    const releaseEnvelope = this.pulseReleaseAge < releaseDuration
      ? Math.pow(1 - this.pulseReleaseAge / releaseDuration, 1.45)
      : 0;
    const releaseStrength = releaseEnvelope * (
      this.lastPulseReleaseKind === "charged"
        ? 0.78 + this.lastPulseReleaseCharge01 * 0.22
        : 0.82
    );
    const pulseTarget = Math.max(
      pulseHeld ? 0.34 + pulseCharge01 * 0.66 : 0,
      releaseStrength
    );

    this.pulseDrive01 = smooth(this.pulseDrive01, pulseTarget, safeDt, 16, 7.2);
    this.absorbDrive01 = smooth(this.absorbDrive01, absorbHeld ? 1 : 0, safeDt, 5.8, 7.0);
    this.stabilizeDrive01 = smooth(this.stabilizeDrive01, stabilizeHeld ? 1 : 0, safeDt, 5.2, 6.2);

    const pulseIntent = pulseHeld || releaseEnvelope > 0.08;
    const compositionChord = frameState.verbComposition?.chord;
    const chord = compositionChord && compositionChord !== "idle"
      ? compositionChord
      : this.resolveChord({ pulse: pulseIntent, absorb: absorbHeld, stabilize: stabilizeHeld });
    if (chord !== this.lastChord) {
      this.lastChord = chord;
      this.chordChangeCount += 1;
    }

    frameState.coreVerbEngineCoupling = this.createState({
      active: Boolean(engine.active),
      pulseIntent,
      absorbHeld,
      stabilizeHeld,
      chord,
      engine
    });
  }

  resolveChord({ pulse, absorb, stabilize }) {
    if (pulse && absorb && stabilize) return "full_system";
    if (pulse && stabilize) return "cohere_project";
    if (absorb && stabilize) return "cohere_draw";
    if (pulse && absorb) return "exchange";
    if (pulse) return "project";
    if (absorb) return "draw";
    if (stabilize) return "cohere";
    return "idle";
  }

  createState({ active = false, pulseIntent = false, absorbHeld = false, stabilizeHeld = false, chord = "idle", engine = {} } = {}) {
    const p = clamp01(this.pulseDrive01);
    const a = clamp01(this.absorbDrive01);
    const s = clamp01(this.stabilizeDrive01);
    const dominant = p >= a && p >= s && p > 0.08
      ? "pulse"
      : a >= p && a >= s && a > 0.08
        ? "absorb"
        : s > 0.08
          ? "stabilize"
          : "none";
    const activeFunctionCount = Number(p > 0.12) + Number(a > 0.12) + Number(s > 0.12);
    const fullSystemLoad01 = clamp01((p + a + s) / 3);

    return {
      pass: "HC-028D1",
      active,
      owner: "CoreVerbEngineCouplingSystem",
      engineOwner: "CoreEngineSystem",
      inputOwner: "InputSystem",
      chord,
      chordChangeCount: this.chordChangeCount,
      dominantFunction: dominant,
      activeFunctionCount,
      functionDrive: {
        pulse: Number(p.toFixed(3)),
        absorb: Number(a.toFixed(3)),
        stabilize: Number(s.toFixed(3))
      },
      intent: {
        pulse: pulseIntent,
        absorb: absorbHeld,
        stabilize: stabilizeHeld
      },
      engine: {
        architectureId: engine.architectureId ?? "triadic_3",
        phaseCount: engine.phaseCount ?? 3,
        currentPhaseFunction: engine.currentPhaseFunction ?? "pulse"
      },
      presentation: {
        pulseOutwardDrive: Number(p.toFixed(3)),
        absorbInwardDrive: Number(a.toFixed(3)),
        stabilizeCoherenceDrive: Number(s.toFixed(3)),
        precessionDamping01: Number((s * 0.72 + (chord === "full_system" ? 0.12 : 0)).toFixed(3)),
        fullSystemLoad01: Number(fullSystemLoad01.toFixed(3)),
        conduitVisibility01: Number(Math.max(p, a, s).toFixed(3))
      },
      readOnlyBridge: true,
      engineRetiming: false,
      verbPowerAuthority: false,
      movementAuthority: false,
      targetingAuthority: false,
      progressionAuthority: false,
      routeCompletionAuthority: false,
      controllerMappingAuthority: false,
      aButtonAuthority: false,
      rule: "verbs_visibly_route_through_core_engine_planes_and_hc029c_composition_names_the_shared_chord"
    };
  }
}
