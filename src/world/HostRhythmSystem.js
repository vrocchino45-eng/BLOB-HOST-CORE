import { resolveWorldCompositionProfile } from "./WorldCompositionRegistry.js";

export class HostRhythmSystem {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.cycleSeconds = 5.8;
    this.previousPhase = 0;
    this.cycleCount = 0;
  }

  init() {
    this.frameState.hostRhythm = this.createState(0, this.frameState.activeCellId);
  }

  update(_dt, frameState) {
    const t = Math.max(0, frameState.runtimeSeconds ?? 0);
    const normalizedPhase = (t % this.cycleSeconds) / this.cycleSeconds;
    const phaseRadians = normalizedPhase * Math.PI * 2;
    const raw = Math.sin(phaseRadians - Math.PI * 0.5)
      + Math.sin(phaseRadians * 2 - 0.55) * 0.24
      + Math.sin(phaseRadians * 3 + 0.8) * 0.08;
    const breath = Math.max(-1, Math.min(1, raw / 1.18));
    const pressure = 0.5 + 0.5 * breath;
    let stage = "recover";
    if (normalizedPhase < 0.34) stage = "gather";
    else if (normalizedPhase < 0.52) stage = "swell";
    else if (normalizedPhase < 0.67) stage = "release";

    if (normalizedPhase < this.previousPhase) this.cycleCount += 1;
    this.previousPhase = normalizedPhase;

    frameState.hostRhythm = {
      pass: "HC-028C",
      active: true,
      authority: "single_host_rhythm_signal",
      normalizedPhase,
      breath,
      pressure,
      stage,
      cycleSeconds: this.cycleSeconds,
      cycleCount: this.cycleCount,
      visibleBaselineRequired: true,
      mechanicalAdvantageEnabled: false,
      objectiveAuthority: false,
      progressionAuthority: false,
      hudMeterRequired: false,
      rule: "world_is_the_metronome",
      composition: this.createCompositionState(frameState.activeCellId, normalizedPhase)
    };
  }

  createState(normalizedPhase, activeCellId = null) {
    return {
      pass: "HC-028C",
      active: true,
      authority: "single_host_rhythm_signal",
      normalizedPhase,
      breath: 0,
      pressure: 0.5,
      stage: "gather",
      cycleSeconds: this.cycleSeconds,
      cycleCount: 0,
      visibleBaselineRequired: true,
      mechanicalAdvantageEnabled: false,
      objectiveAuthority: false,
      progressionAuthority: false,
      hudMeterRequired: false,
      rule: "world_is_the_metronome",
      composition: this.createCompositionState(activeCellId, normalizedPhase)
    };
  }

  createCompositionState(activeCellId, normalizedPhase) {
    const profile = resolveWorldCompositionProfile(activeCellId);
    if (!profile) {
      return {
        pass: "HC-028C",
        active: false,
        profileId: "legacy_host_breath",
        keyId: "unassigned",
        meterLabel: "unassigned",
        tempoBpm: 0,
        octaveLabel: "unassigned",
        beatCount: 0,
        beatIndex: 0,
        beatInBar: 0,
        beatPhase: 0,
        barIndex: 0,
        barPhase: normalizedPhase,
        currentFunction: "none",
        accentRole: "none",
        groupingLabel: "unassigned",
        accentStrength: 0,
        movementAccentStrength: 0,
        beatPulse: 0,
        flowScale: 1,
        moteSpeedScale: 1,
        audioVoice: null,
        sharedHostClock: true,
        inputTimingGate: false
      };
    }

    const meter = profile.meter;
    const beatsPerBar = meter.beatsPerBar;
    const beatsPerHostCycle = beatsPerBar * meter.barsPerHostCycle;
    const beatFloat = normalizedPhase * beatsPerHostCycle;
    const beatIndex = Math.min(beatsPerHostCycle - 1, Math.floor(beatFloat));
    const beatPhase = beatFloat - beatIndex;
    const beatInBar = beatIndex % beatsPerBar;
    const barIndex = Math.floor(beatIndex / beatsPerBar);
    const barPhase = (beatInBar + beatPhase) / beatsPerBar;
    const beatPulse = Math.exp(-beatPhase * 5.25);
    const accent = meter.accentPattern[beatInBar] ?? 0.5;
    const movementAccent = meter.movementAccentPattern?.[beatInBar] ?? accent;
    const accentStrength = accent * beatPulse;
    const movementAccentStrength = movementAccent * beatPulse;
    const beatCount = this.cycleCount * beatsPerHostCycle + beatIndex;
    const tempoBpm = 60 * beatsPerHostCycle / this.cycleSeconds;
    const movement = profile.movement;
    const audio = profile.audio ?? {};
    const functionId = meter.functionPattern[beatInBar] ?? profile.key.dominant;
    const audioRatio = audio.ratios?.[functionId] ?? 1;
    // HC028C2: stronger perceptual accents must not secretly increase traversal
    // authority. Movement keeps the exact HC028C accent curve/range.
    const flowScale = movement.minimumFlowScale
      + (movement.maximumFlowScale - movement.minimumFlowScale) * movementAccentStrength;
    const moteSpeedScale = movement.minimumMoteSpeedScale
      + (movement.maximumMoteSpeedScale - movement.minimumMoteSpeedScale) * movementAccentStrength;

    return {
      pass: "HC-028C",
      active: true,
      profileId: profile.id,
      keyId: profile.key.id,
      tonalCenter: profile.key.dominant,
      keyOrder: [...profile.key.order],
      meterLabel: `${beatsPerBar}/${meter.beatUnit}`,
      beatsPerBar,
      beatUnit: meter.beatUnit,
      barsPerHostCycle: meter.barsPerHostCycle,
      beatsPerHostCycle,
      tempoBpm,
      octaveIndex: profile.octave.index,
      octaveLabel: profile.octave.label,
      beatCount,
      beatIndex,
      beatInBar,
      beatNumber: beatInBar + 1,
      beatPhase,
      barIndex,
      barPhase,
      currentFunction: functionId,
      accentRole: meter.accentRolePattern?.[beatInBar] ?? "unassigned",
      groupingLabel: meter.groupingLabel ?? `${beatsPerBar}`,
      accentStrength,
      movementAccentStrength,
      beatPulse,
      flowScale,
      moteSpeedScale,
      flowModulationDepth: movement.flowModulationDepth,
      audioVoice: audio.enabled === false ? null : {
        voice: audio.voice ?? "regional_pulse",
        baseFrequencyHz: audio.baseFrequencyHz ?? 72,
        ratio: audioRatio,
        frequencyHz: (audio.baseFrequencyHz ?? 72) * audioRatio,
        waveform: audio.waveformByFunction?.[functionId] ?? "sine",
        gainScale: audio.gainPattern?.[beatInBar] ?? 1,
        durationScale: audio.durationPattern?.[beatInBar] ?? 1,
        glideScale: audio.glidePattern?.[beatInBar] ?? 1
      },
      sharedHostClock: profile.authority.sharedHostClock,
      inputTimingGate: profile.authority.inputTimingGate,
      progressionAuthority: profile.authority.progression,
      objectiveAuthority: profile.authority.objective,
      routeCompletionAuthority: profile.authority.routeCompletion
    };
  }
}
