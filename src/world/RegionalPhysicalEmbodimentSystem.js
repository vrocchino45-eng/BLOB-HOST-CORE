import { resolveWorldCompositionProfile } from "./WorldCompositionRegistry.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const clamp01 = (value) => clamp(value, 0, 1);

/**
 * HC028F — Regional Composition -> Matter bridge.
 *
 * Reads the authored World Composition profile and publishes bounded physical
 * interpretation for existing Host material. It cannot move the player,
 * mutate collisions, complete routes, change verb strength, or gate inputs.
 * AmbientMaterialInteractionSystem is the first consumer; later region owners
 * can read the same state without inventing another clock or rule set.
 */
export class RegionalPhysicalEmbodimentSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[RegionalPhysicalEmbodimentSystem] frameState is required.");
    this.frameState = frameState;
  }

  init() {
    this.frameState.regionalPhysicalEmbodiment = this.inactiveState();
  }

  update(_dt, frameState = this.frameState) {
    const profile = resolveWorldCompositionProfile(frameState.activeCellId);
    const composition = frameState.hostRhythm?.composition ?? {};
    const physical = profile?.physical;
    if (!profile || !physical || !composition.active || composition.profileId !== profile.id) {
      frameState.regionalPhysicalEmbodiment = this.inactiveState();
      return;
    }

    const functionId = composition.currentFunction ?? profile.key.dominant;
    const bias = physical.functionBias?.[functionId] ?? {};
    const accent = clamp01(composition.accentStrength ?? 0);
    const beatPulse = clamp01(composition.beatPulse ?? 0);
    // The place still has an identity between beats; accent raises readability
    // without turning a beat into movement or timing authority.
    const phraseStrength = clamp(0.28 + accent * 0.72, 0.28, 1);
    const base = physical.base ?? {};

    frameState.regionalPhysicalEmbodiment = {
      pass: "HC-028F",
      active: true,
      profileId: profile.id,
      cellId: profile.cellId,
      region: profile.region,
      keyId: profile.key.id,
      meter: composition.meterLabel,
      octave: profile.octave.label,
      law: physical.law,
      matter: physical.matter,
      force: physical.force,
      geometry: physical.geometry,
      ecology: physical.ecology,
      currentFunction: functionId,
      accentRole: composition.accentRole ?? "none",
      phraseStrength,
      beatPulse,
      radialBias: clamp((bias.radial ?? 0) * phraseStrength, -0.065, 0.065),
      tangentialBias: clamp((bias.tangential ?? 0) * phraseStrength, -0.040, 0.040),
      verticalBias: clamp((bias.vertical ?? 0) * phraseStrength, -0.016, 0.016),
      flowBias: clamp((bias.flow ?? 0) * phraseStrength, -0.040, 0.040),
      driftScale: clamp((base.driftScale ?? 1) * (1 + (bias.drift ?? 0) * phraseStrength), 0.80, 1.22),
      dampingScale: clamp((base.dampingScale ?? 1) * (1 + (bias.damping ?? 0) * phraseStrength), 0.82, 1.24),
      clusteringScale: clamp((base.clusteringScale ?? 1) * (1 + (bias.clustering ?? 0) * phraseStrength), 0.82, 1.24),
      settlingScale: clamp((base.settlingScale ?? 1) * (1 + (bias.settling ?? 0) * phraseStrength), 0.80, 1.24),
      currentBiasScale: clamp((base.currentBiasScale ?? 1) * (1 + (bias.current ?? 0) * phraseStrength), 0.82, 1.24),
      fieldRadiusScale: clamp((base.fieldRadiusScale ?? 1) * (1 + (bias.radius ?? 0) * phraseStrength), 0.90, 1.18),
      movementAuthority: false,
      collisionAuthority: false,
      verbAuthority: false,
      routeAuthority: false,
      progressionAuthority: false,
      inputTimingGate: false,
      addsClock: false,
      rule: "composition_shapes_existing_matter_not_player_authority"
    };
  }

  inactiveState() {
    return {
      pass: "HC-028F",
      active: false,
      profileId: "none",
      cellId: this.frameState.activeCellId ?? "none",
      region: "unassigned",
      law: "none",
      currentFunction: "none",
      phraseStrength: 0,
      radialBias: 0,
      tangentialBias: 0,
      verticalBias: 0,
      flowBias: 0,
      driftScale: 1,
      dampingScale: 1,
      clusteringScale: 1,
      settlingScale: 1,
      currentBiasScale: 1,
      fieldRadiusScale: 1,
      movementAuthority: false,
      collisionAuthority: false,
      verbAuthority: false,
      routeAuthority: false,
      progressionAuthority: false,
      inputTimingGate: false,
      addsClock: false
    };
  }
}
