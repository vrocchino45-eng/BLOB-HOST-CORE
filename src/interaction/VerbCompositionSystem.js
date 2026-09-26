const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
const clamp01 = (value) => clamp(value, 0, 1);

const NEUTRAL = Object.freeze({
  pulseFocusedMultiplier: 1,
  pulseAmbientMultiplier: 1,
  absorbProgressMultiplier: 1,
  absorbPullMultiplier: 1,
  absorbSpinMultiplier: 1,
  stabilizeRateMultiplier: 1,
  stabilizeWobbleMultiplier: 1,
  stabilizeLineOpacityMultiplier: 1,
  targetMotionDamping01: 0,
  tension01: 0,
  equilibrium01: 0,
  enduranceDemandMultiplier: 1
});

const PROFILES = Object.freeze({
  idle: { ...NEUTRAL, mode: "idle", meaning: "no_composed_intent" },
  project: { ...NEUTRAL, mode: "project", meaning: "pulse_outward" },
  draw: { ...NEUTRAL, mode: "draw", meaning: "absorb_inward" },
  cohere: { ...NEUTRAL, mode: "cohere", meaning: "stabilize_order" },
  cohere_project: {
    ...NEUTRAL,
    mode: "cohere_project",
    meaning: "controlled_directional_push",
    pulseFocusedMultiplier: 0.82,
    pulseAmbientMultiplier: 0.55,
    stabilizeRateMultiplier: 1.12,
    stabilizeWobbleMultiplier: 0.56,
    stabilizeLineOpacityMultiplier: 1.08,
    targetMotionDamping01: 0.42,
    tension01: 0.28,
    enduranceDemandMultiplier: 1.08
  },
  cohere_draw: {
    ...NEUTRAL,
    mode: "cohere_draw",
    meaning: "coherent_controlled_draw",
    absorbProgressMultiplier: 0.92,
    absorbPullMultiplier: 0.84,
    absorbSpinMultiplier: 0.34,
    stabilizeRateMultiplier: 1.14,
    stabilizeWobbleMultiplier: 0.48,
    stabilizeLineOpacityMultiplier: 1.10,
    targetMotionDamping01: 0.56,
    tension01: 0.24,
    enduranceDemandMultiplier: 1.08
  },
  exchange: {
    ...NEUTRAL,
    mode: "exchange",
    meaning: "opposed_push_pull_tension",
    pulseFocusedMultiplier: 0.58,
    pulseAmbientMultiplier: 0.36,
    absorbProgressMultiplier: 0.52,
    absorbPullMultiplier: 0.34,
    absorbSpinMultiplier: 0.58,
    targetMotionDamping01: 0.18,
    tension01: 0.92,
    equilibrium01: 0.38,
    enduranceDemandMultiplier: 1.18
  },
  full_system: {
    ...NEUTRAL,
    mode: "full_system",
    meaning: "high_strain_equilibrium",
    pulseFocusedMultiplier: 0.42,
    pulseAmbientMultiplier: 0.25,
    absorbProgressMultiplier: 0.30,
    absorbPullMultiplier: 0.16,
    absorbSpinMultiplier: 0.24,
    stabilizeRateMultiplier: 0.86,
    stabilizeWobbleMultiplier: 0.18,
    stabilizeLineOpacityMultiplier: 1.18,
    targetMotionDamping01: 0.78,
    tension01: 1,
    equilibrium01: 1,
    enduranceDemandMultiplier: 1.32
  }
});

/**
 * HC031L — Movement + Verb Physical Grammar, extending HC029C composition.
 *
 * Owns the canonical meaning of simultaneous Pulse / Absorb / Stabilize intent on
 * one retained relationship. Primitive verb systems keep their existing authority.
 * HC031L does not retarget or add abilities; it locks the triadic physical law:
 * Stabilize regulates the relationship, Pulse projects outward through it, and
 * Absorb draws inward through it. PlayerMovementController consumes only the
 * body/environment side of that law.
 */
export class VerbCompositionSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[VerbCompositionSystem] frameState is required.");
    this.frameState = frameState;
    this.lastChord = "idle";
    this.chordChangeCount = 0;
    this.lastPulseEventId = 0;
    this.pulseReleaseAge = 99;
    this.lastPulseReleaseKind = "quick";
  }

  init() {
    this.publish(this.frameState, "idle", false, "none");
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    const input = frameState.input ?? {};
    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    if (input.pulsePressed && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      this.pulseReleaseAge = 0;
      this.lastPulseReleaseKind = input.pulseReleaseKind === "charged" ? "charged" : "quick";
    } else {
      this.pulseReleaseAge += safeDt;
    }
    const releaseDuration = this.lastPulseReleaseKind === "charged" ? 0.62 : 0.34;
    const pulseReleaseEnvelope = this.pulseReleaseAge < releaseDuration
      ? Math.max(0, 1 - this.pulseReleaseAge / releaseDuration)
      : 0;
    const pulse = Boolean(input.pulseHeld || input.pulsePressed || pulseReleaseEnvelope > 0.08);
    const absorb = Boolean(input.absorbHeld);
    const stabilize = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const chord = this.resolveChord({ pulse, absorb, stabilize });
    if (chord !== this.lastChord) {
      this.lastChord = chord;
      this.chordChangeCount += 1;
    }

    const targeting = frameState.targeting ?? {};
    const targetId = targeting.relationshipActive
      ? (targeting.relationshipTargetId ?? targeting.targetId ?? "none")
      : "none";
    const relationshipBound = targetId !== "none";

    this.publish(frameState, chord, relationshipBound, targetId, {
      pulse,
      absorb,
      stabilize,
      pulseReleaseEnvelope
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

  publish(frameState, chord, relationshipBound, targetId, intent = {}) {
    const profile = PROFILES[chord] ?? PROFILES.idle;
    const composed = chord === "cohere_project"
      || chord === "cohere_draw"
      || chord === "exchange"
      || chord === "full_system";

    frameState.verbComposition = {
      pass: "HC-031L",
      active: chord !== "idle",
      owner: "VerbCompositionSystem",
      relationshipOwner: "TargetingSystem / HC029A",
      chord,
      mode: profile.mode,
      meaning: profile.meaning,
      chordChangeCount: this.chordChangeCount,
      composed,
      relationshipBound,
      targetId,
      intent: {
        pulse: Boolean(intent.pulse),
        absorb: Boolean(intent.absorb),
        stabilize: Boolean(intent.stabilize),
        pulseReleaseEnvelope: clamp01(intent.pulseReleaseEnvelope ?? 0)
      },
      effects: {
        pulseFocusedMultiplier: clamp(profile.pulseFocusedMultiplier, 0.2, 1.2),
        pulseAmbientMultiplier: clamp(profile.pulseAmbientMultiplier, 0.1, 1.2),
        absorbProgressMultiplier: clamp(profile.absorbProgressMultiplier, 0.2, 1.2),
        absorbPullMultiplier: clamp(profile.absorbPullMultiplier, 0.1, 1.2),
        absorbSpinMultiplier: clamp(profile.absorbSpinMultiplier, 0.1, 1.2),
        stabilizeRateMultiplier: clamp(profile.stabilizeRateMultiplier, 0.6, 1.3),
        stabilizeWobbleMultiplier: clamp(profile.stabilizeWobbleMultiplier, 0.1, 1.2),
        stabilizeLineOpacityMultiplier: clamp(profile.stabilizeLineOpacityMultiplier, 0.8, 1.3),
        targetMotionDamping01: clamp01(profile.targetMotionDamping01),
        tension01: clamp01(profile.tension01),
        equilibrium01: clamp01(profile.equilibrium01),
        enduranceDemandMultiplier: clamp(profile.enduranceDemandMultiplier, 1, 1.4)
      },
      rules: {
        sharedRelationshipRequiredForFocusedComposition: true,
        retargetsIndependently: false,
        addsNewAbility: false,
        addsNewButton: false,
        changesTargetingThresholds: false,
        stabilizeRole: "establish_or_regulate_relationship",
        pulseRole: "project_outward_through_relationship",
        absorbRole: "draw_inward_through_relationship",
        pulseStabilize: "cohere_then_project_as_controlled_push",
        absorbStabilize: "draw_while_preserving_coherence",
        pulseAbsorb: "opposed_forces_form_tension_not_double_strength",
        fullSystem: "high_strain_equilibrium_not_super_move",
        surfaceAttachmentOwnedByMovementOnly: true,
        aimChoosesTargetVerbsModifyRelationship: true
      }
    };
  }
}
