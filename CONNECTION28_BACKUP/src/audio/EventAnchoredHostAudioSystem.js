import * as THREE from "three";

const HC027D1_AUDIO_MIX = Object.freeze({
  // HC027D at 100% system output was confirmed audible-but-faint by the primary playtest ear.
  // HC027D1 raises the useful mix window so 60-70% system output can become the normal reference.
  masterGain: 0.82,
  busGain: Object.freeze({
    core: 1.85,
    verbs: 2.15,
    world: 1.95,
    ambience: 1.35,
    event: 1.40
  }),
  pannerRefDistance: 4.2,
  pannerMaxDistance: 42,
  pannerRolloff: 0.42,
  unlockConfirmationGain: 0.18,
  compressorThresholdDb: -4,
  compressorKneeDb: 3,
  compressorRatio: 8,
  compressorAttackSeconds: 0.003,
  compressorReleaseSeconds: 0.16,
  referenceSystemOutputPercent: "60-70",
  targetHeadroomDb: 8
});

export class EventAnchoredHostAudioSystem {
  constructor({ frameState, camera, playerRoot }) {
    this.frameState = frameState;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.context = null;
    this.masterGain = null;
    this.outputCompressor = null;
    this.busNodes = {};
    this.unlocked = false;
    this.unlockAttempted = false;
    this.unlockReason = "awaiting_user_gesture";
    this.eventCount = 0;
    this.lastEvent = "none";
    this.lastEventAt = -999;
    this.previousHostCycle = -1;
    this.previousWorldBeatCount = -1;
    this.previousWorldCompositionProfileId = "none";
    this.previousCoreEnginePhaseEventCount = 0;
    this.previousCoreEngineCycleCount = 0;
    this.previousPulseEventId = 0;
    this.previousPulseHeld = false;
    this.lastPulseChargeToneAt = -999;
    this.previousAbsorbHeld = false;
    this.previousAbsorbObjectId = "none";
    this.previousAbsorbProgress = 0;
    this.previousAbsorbedObjects = 0;
    this.lastAbsorbTickAt = -999;
    this.previousStabilizeHeld = false;
    this.lastStabilizeTickAt = -999;
    this.previousStabilizeProgress = 0;
    this.previousContactState = "suspended";
    this.previousCoreWorkGrabCount = 0;
    this.previousCoreWorkPlacementCount = 0;
    this.previousPatternPopCount = 0;
    this.previousReturnSignatureId = "none";
    this.lastVascularArrivalSequence = 0;
    this.lastVascularArrivalAudioAt = -999;
    this.vascularArrivalSignatureCount = 0;
    this.lastGraveMemorySequence = 0;
    this.lastGraveMemoryAudioAt = -999;
    this.graveMemorySignatureCount = 0;
    // HC027J: remember local-consequence event ids so a persistent Host state
    // gets one onset plus a restrained periodic signature, not a tone every frame.
    this.seenSignalPlainConsequenceEventIds = new Set();
    this.lastSignalPlainConsequenceToneAt = -999;
    // HC027K: one restrained target-side reply announces that a persistent
    // consequence has coupled into another existing condition. The global HC027D1
    // mix remains untouched.
    this.seenSignalPlainNextQuestionEventIds = new Set();
    this.lastLandmarkPulseAt = -999;
    this.listenerForward = new THREE.Vector3(0, 0, -1);
    this.unlockConfirmationPlayed = false;
    this.unlockHandler = () => this.ensureAudioContext("user_gesture");
    this.explicitUnlockHandler = () => this.ensureAudioContext("playtest_audio_gate");
  }

  init() {
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", this.unlockHandler, { passive: true });
      window.addEventListener("keydown", this.unlockHandler, { passive: true });
      window.addEventListener("touchstart", this.unlockHandler, { passive: true });
      window.addEventListener("blob:audio-unlock-request", this.explicitUnlockHandler);
    }
    this.publishState(this.frameState);
  }

  update(_dt, frameState) {
    if (!frameState) return;
    if (!this.unlocked && !this.unlockAttempted && (frameState.runtimeSeconds ?? 0) > 0.25) {
      this.ensureAudioContext("runtime_resume_attempt");
    }
    this.updateListener();
    this.handleHostRhythm(frameState);
    this.handleCoreEngine(frameState);
    this.handleCoreVerbs(frameState);
    this.handleVascularSiltArrival(frameState);
    this.handleGraveVascularMemory(frameState);
    this.handleSignalPlainLocalConsequence(frameState);
    this.handleSignalPlainConsequenceNextQuestion(frameState);
    this.handleContact(frameState);
    this.handleCoreWork(frameState);
    this.handleChemistryPattern(frameState);
    this.handleReturnLandmark(frameState);
    this.publishState(frameState);
  }

  ensureAudioContext(reason = "unknown") {
    if (this.context?.state === "running") {
      this.unlocked = true;
      this.unlockReason = reason;
      this.playUnlockConfirmation();
      return;
    }
    const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextCtor) {
      this.unlockReason = "web_audio_unavailable";
      return;
    }
    this.unlockAttempted = true;
    try {
      if (!this.context) {
        this.context = new AudioContextCtor();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = HC027D1_AUDIO_MIX.masterGain;

        this.outputCompressor = this.context.createDynamicsCompressor();
        this.outputCompressor.threshold.value = HC027D1_AUDIO_MIX.compressorThresholdDb;
        this.outputCompressor.knee.value = HC027D1_AUDIO_MIX.compressorKneeDb;
        this.outputCompressor.ratio.value = HC027D1_AUDIO_MIX.compressorRatio;
        this.outputCompressor.attack.value = HC027D1_AUDIO_MIX.compressorAttackSeconds;
        this.outputCompressor.release.value = HC027D1_AUDIO_MIX.compressorReleaseSeconds;

        for (const [busId, busGain] of Object.entries(HC027D1_AUDIO_MIX.busGain)) {
          const node = this.context.createGain();
          node.gain.value = busGain;
          node.connect(this.masterGain);
          this.busNodes[busId] = node;
        }

        this.masterGain.connect(this.outputCompressor);
        this.outputCompressor.connect(this.context.destination);
      }
      const resume = this.context.resume?.();
      if (resume?.then) {
        resume.then(() => {
          this.unlocked = this.context?.state === "running";
          this.unlockReason = this.unlocked ? reason : `context_${this.context?.state ?? "unknown"}`;
          if (this.unlocked) this.playUnlockConfirmation();
        }).catch(() => {
          this.unlocked = false;
          this.unlockReason = "browser_gesture_required";
        });
      } else {
        this.unlocked = this.context.state === "running";
        this.unlockReason = this.unlocked ? reason : `context_${this.context.state}`;
        if (this.unlocked) this.playUnlockConfirmation();
      }
    } catch (_error) {
      this.unlocked = false;
      this.unlockReason = "audio_context_creation_failed";
    }
  }

  playUnlockConfirmation() {
    if (this.unlockConfirmationPlayed || !this.unlocked || !this.context || !this.masterGain) return;
    this.unlockConfirmationPlayed = true;
    const now = this.context.currentTime;
    [220, 330, 440].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      const start = now + index * 0.075;
      const duration = 0.12;
      oscillator.type = index === 2 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(HC027D1_AUDIO_MIX.unlockConfirmationGain, start + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(this.resolveBusNode("event"));
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
    this.recordEvent("audio_unlock_confirmation");
  }

  updateListener() {
    if (!this.context || !this.camera) return;
    const listener = this.context.listener;
    const position = this.camera.position;
    this.camera.getWorldDirection(this.listenerForward);
    if (listener.positionX) {
      listener.positionX.value = position.x;
      listener.positionY.value = position.y;
      listener.positionZ.value = position.z;
      listener.forwardX.value = this.listenerForward.x;
      listener.forwardY.value = this.listenerForward.y;
      listener.forwardZ.value = this.listenerForward.z;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else if (listener.setPosition && listener.setOrientation) {
      listener.setPosition(position.x, position.y, position.z);
      listener.setOrientation(this.listenerForward.x, this.listenerForward.y, this.listenerForward.z, 0, 1, 0);
    }
  }

  handleHostRhythm(frameState) {
    const rhythm = frameState.hostRhythm ?? {};
    const composition = rhythm.composition ?? {};
    const source = this.resolveLandmarkSource(frameState) ?? this.resolveBoundarySource(frameState, 1.8);

    // HC028E: authored regions gain distinct restrained rhythm/bass voices from the
    // same Host clock. These tones remain orientation/presence only: no input
    // timing, reward or route authority reads them. HC027D1 mix calibration stays fixed.
    if (composition.active && Number.isFinite(composition.beatCount)) {
      if (this.previousWorldCompositionProfileId !== composition.profileId) {
        this.previousWorldCompositionProfileId = composition.profileId;
        this.previousWorldBeatCount = composition.beatCount;
      } else if (composition.beatCount !== this.previousWorldBeatCount) {
        this.previousWorldBeatCount = composition.beatCount;
        this.playWorldRhythmBeat(source, composition);
      }
    } else {
      this.previousWorldCompositionProfileId = "none";
      this.previousWorldBeatCount = -1;
    }

    if (!Number.isFinite(rhythm.cycleCount)) return;
    if (this.previousHostCycle < 0) {
      this.previousHostCycle = rhythm.cycleCount;
      return;
    }
    if (rhythm.cycleCount === this.previousHostCycle) return;
    this.previousHostCycle = rhythm.cycleCount;
    this.playHostPulse(source);
  }

  handleCoreEngine(frameState) {
    const engine = frameState.coreEngine ?? {};
    if (!engine.active) return;
    const phaseEvents = Number.isFinite(engine.phaseEventCount) ? engine.phaseEventCount : 0;
    const cycles = Number.isFinite(engine.cycleCount) ? engine.cycleCount : 0;
    const inspection = Boolean(frameState.inspectionCamera?.active || frameState.tightInspectionCamera?.active);
    const source = this.playerPosition();

    if (inspection && phaseEvents > this.previousCoreEnginePhaseEventCount) {
      const base = engine.currentPhaseFunction === "pulse" ? 126
        : engine.currentPhaseFunction === "absorb" ? 102
          : 82;
      const phaseCount = Math.max(3, engine.phaseCount ?? 3);
      const gain = phaseCount >= 12 ? 0.030 : phaseCount >= 6 ? 0.036 : 0.045;
      const duration = phaseCount >= 12 ? 0.032 : phaseCount >= 6 ? 0.045 : 0.065;
      this.playTone({ source, frequency: base, duration, gain, type: "sine", glideTo: base * 0.94, bus: "core" });
      this.recordEvent(`core_engine_phase:${engine.currentPhaseLabel ?? "unknown"}`);
    } else if (!inspection && cycles > this.previousCoreEngineCycleCount) {
      const rpm01 = Math.max(0, Math.min(1, ((engine.rpm ?? 3000) - 3000) / 7000));
      this.playTone({ source, frequency: 54 + rpm01 * 26, duration: 0.075, gain: 0.028 + rpm01 * 0.012, type: "sine", glideTo: 48 + rpm01 * 22, bus: "core" });
      this.recordEvent("core_engine_cycle");
    }

    this.previousCoreEnginePhaseEventCount = phaseEvents;
    this.previousCoreEngineCycleCount = cycles;
  }


  handleCoreVerbs(frameState) {
    const input = frameState.input ?? {};
    const t = frameState.runtimeSeconds ?? 0;
    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    const pulseHeld = Boolean(input.pulseHeld);
    const pulseCharge01 = Math.max(0, Math.min(1, input.pulseCharge01 ?? 0));
    if (pulseHeld && pulseCharge01 > 0.02 && t - this.lastPulseChargeToneAt >= Math.max(0.14, 0.30 - pulseCharge01 * 0.13)) {
      this.playPulseCharge(frameState, pulseCharge01);
      this.lastPulseChargeToneAt = t;
    }
    this.previousPulseHeld = pulseHeld;
    if (input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.previousPulseEventId) {
      this.previousPulseEventId = pulseEventId;
      this.playPulseEmission(frameState);
    }

    for (const echo of frameState.coreSensoryResponse?.newReturns ?? []) {
      this.playPulseReturn(echo, frameState);
    }

    const absorbHeld = Boolean(input.absorbHeld);
    const bond = frameState.bondState ?? {};
    const absorbObjectId = bond.objectId ?? "none";
    const absorbProgress = Math.max(0, Math.min(1, bond.absorbProgress ?? frameState.chemObjectState?.absorbProgress ?? 0));
    const absorbedObjects = Math.max(0, frameState.chemObjectState?.absorbedObjects ?? 0);

    if (absorbHeld && !this.previousAbsorbHeld) {
      this.playAbsorbStart(frameState, absorbObjectId);
      this.lastAbsorbTickAt = t - 1;
    }
    if (absorbHeld && t - this.lastAbsorbTickAt >= 0.24) {
      this.playAbsorbFlow(frameState, absorbObjectId, absorbProgress, bond.strength ?? 0);
      this.lastAbsorbTickAt = t;
    }
    if (absorbedObjects > this.previousAbsorbedObjects) {
      this.playAbsorbCapture(frameState);
    }
    if (!absorbHeld && this.previousAbsorbHeld) {
      this.playTone({ source: this.playerPosition(), frequency: 108, duration: 0.10, gain: 0.044, type: "sine", glideTo: 82, bus: "verbs" });
      this.recordEvent("core_absorb_release");
    }
    this.previousAbsorbHeld = absorbHeld;
    this.previousAbsorbObjectId = absorbObjectId;
    this.previousAbsorbProgress = absorbProgress;
    this.previousAbsorbedObjects = absorbedObjects;

    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const stabilizeProgress = Math.max(0, Math.min(1, frameState.verbPhysicalization?.stabilizeProgress ?? 0));
    if (stabilizeHeld && !this.previousStabilizeHeld) {
      this.playStabilizeStart(frameState);
      this.lastStabilizeTickAt = t - 1;
    }
    if (stabilizeHeld && t - this.lastStabilizeTickAt >= 0.31) {
      this.playStabilizeConvergence(frameState, stabilizeProgress);
      this.lastStabilizeTickAt = t;
    }
    if (!stabilizeHeld && this.previousStabilizeHeld) {
      this.playTone({ source: this.playerPosition(), frequency: 110, duration: 0.13, gain: 0.052, type: "triangle", glideTo: 96, bus: "verbs" });
      this.recordEvent("core_stabilize_release");
    }
    this.previousStabilizeHeld = stabilizeHeld;
    this.previousStabilizeProgress = stabilizeProgress;
  }

  resolveRadialVoice(frameState) {
    const weights = frameState.corePerformance?.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const deep = Number.isFinite(weights.deep) ? weights.deep : 1 / 3;
    const inner = Number.isFinite(weights.inner) ? weights.inner : 1 / 3;
    const membrane = Number.isFinite(weights.membrane) ? weights.membrane : 1 / 3;
    const character = frameState.coreTopologyVerbCharacter?.audio ?? {};
    const transientScale = Number.isFinite(character.transientScale) ? character.transientScale : 1;
    const tailScale = Number.isFinite(character.tailScale) ? character.tailScale : 1;
    const texture01 = Math.max(0, Math.min(1, character.texture01 ?? 0.5));
    const focus01 = Math.max(0, Math.min(1, character.focus01 ?? 0.5));
    return {
      deep, inner, membrane,
      topologyMode: frameState.coreTopologyVerbCharacter?.mode ?? "forming",
      pitchScale: 0.78 * deep + 1.0 * inner + 1.28 * membrane,
      attackGain: (0.92 * deep + 1.0 * inner + 1.12 * membrane) * transientScale,
      sustainScale: (1.34 * deep + 1.0 * inner + 0.72 * membrane) * tailScale,
      texture01,
      focus01,
      textureGainScale: 0.96 + texture01 * 0.08
    };
  }

  playPulseCharge(frameState, charge01) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const frequency = (96 + charge01 * 150) * voice.pitchScale;
    this.playTone({
      source, frequency, duration: 0.06 + charge01 * 0.035,
      gain: 0.020 + charge01 * 0.022, type: "sine",
      glideTo: frequency * (1.04 + charge01 * 0.10), bus: "verbs"
    });
    this.recordEvent("core_pulse_charge");
  }

  playPulseEmission(frameState) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const charged = frameState.input?.pulseReleaseKind === "charged";
    const charge01 = charged ? Math.max(0, Math.min(1, frameState.input?.pulseReleaseCharge01 ?? 0)) : 0;
    const frequency = (charged ? 104 : 128) * voice.pitchScale;
    const duration = (charged ? 0.22 + charge01 * 0.10 : 0.12) * voice.sustainScale;
    const gain = (charged ? 0.112 + charge01 * 0.026 : 0.088) * voice.attackGain;
    this.playTone({ source, frequency, duration, gain, type: charged || voice.membrane > 0.55 ? "triangle" : "sine", glideTo: frequency * (charged ? 0.54 : 0.72), bus: "verbs" });
    this.playNoiseBurst({ source, duration: Math.max(0.035, duration * (charged ? 0.55 : 0.42)), gain: (charged ? 0.046 : 0.030) * voice.attackGain * voice.textureGainScale, centerFrequency: (charged ? 250 : 330) * voice.pitchScale, type: "brush", bus: "verbs" });
    if (charged) {
      this.playTone({ source, frequency: frequency * 1.72, duration: duration * 0.55, gain: 0.046, type: "sine", delay: 0.018, glideTo: frequency * 0.9, bus: "verbs" });
    }
    this.recordEvent(`core_pulse_emit:${charged ? "charged" : "quick"}:${frameState.corePerformance?.dominantZone ?? "balanced"}`);
  }

  playPulseReturn(echo, frameState) {
    const voice = this.resolveRadialVoice(frameState);
    const source = echo?.position ?? this.playerPosition();
    const baseByClass = {
      host_membrane: 92,
      living_seed: 310,
      scar_memory: 136,
      signal_resonant: 390,
      fluid_current: 224,
      dense_structure: 178,
      living_material: 252
    };
    const base = baseByClass[echo?.responseClass] ?? 220;
    const distance = Math.max(0.2, echo?.distance ?? 1);
    const deep = echo?.reachClass === "deep_structural";
    const distanceGain = Math.max(deep ? 0.28 : 0.48, Math.min(1, 1 - distance / (deep ? 12 : 8)));
    const frequency = base * voice.pitchScale * (deep ? 0.72 : 1);
    const duration = (deep ? 0.24 : echo?.responseClass === "scar_memory" ? 0.18 : 0.11) * voice.sustainScale;
    this.playTone({ source, frequency, duration, gain: (deep ? 0.050 : 0.074) * distanceGain, type: echo?.responseClass === "dense_structure" ? "triangle" : "sine", glideTo: frequency * (deep ? 0.88 : echo?.responseClass === "fluid_current" ? 1.12 : 0.94), bus: "world" });
    if (echo?.responseClass === "scar_memory") {
      this.playTone({ source, frequency: frequency * 0.72, duration: duration * 0.9, gain: 0.038 * distanceGain, type: "sine", delay: 0.055, bus: "world" });
    }
    this.recordEvent(`core_pulse_return:${echo?.reachClass ?? "local_actionable"}:${echo?.responseClass ?? "material"}`);
  }

  playAbsorbStart(frameState, objectId) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const base = 92 * voice.pitchScale;
    this.playTone({ source, frequency: base, duration: 0.16 * voice.sustainScale, gain: 0.064, type: "sine", glideTo: base * 0.78, bus: "verbs" });
    this.playNoiseBurst({ source, duration: 0.11, gain: 0.030 * voice.textureGainScale, centerFrequency: 160 * voice.pitchScale, type: "adhesion", bus: "verbs" });
    this.recordEvent(`core_absorb_intake:${objectId === "none" ? "empty" : "targeted"}`);
  }

  playAbsorbFlow(frameState, objectId, progress, strength) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    if (objectId === "none") {
      this.playNoiseBurst({ source, duration: 0.075, gain: 0.022, centerFrequency: 115, type: "adhesion", bus: "verbs" });
      this.recordEvent("core_absorb_empty_draw");
      return;
    }
    const base = (104 + progress * 92 + Math.max(0, strength) * 18) * voice.pitchScale;
    this.playTone({ source, frequency: base, duration: 0.085, gain: 0.040 + progress * 0.020, type: "sine", glideTo: base * (1.0 + progress * 0.08), bus: "verbs" });
    this.recordEvent("core_absorb_flow");
  }

  playAbsorbCapture(frameState) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const base = 176 * voice.pitchScale;
    this.playTone({ source, frequency: base, duration: 0.12, gain: 0.080, type: "triangle", glideTo: base * 0.72, bus: "verbs" });
    this.playTone({ source, frequency: base * 1.5, duration: 0.10, gain: 0.052, type: "sine", delay: 0.055, glideTo: base, bus: "verbs" });
    this.recordEvent("core_absorb_capture");
  }

  playStabilizeStart(frameState) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const low = 88 * voice.pitchScale;
    this.playTone({ source, frequency: low, duration: 0.18, gain: 0.052, type: "sine", glideTo: low * 1.08, bus: "verbs" });
    this.playTone({ source, frequency: low * 1.62, duration: 0.18, gain: 0.038, type: "sine", glideTo: low * 1.42, bus: "verbs" });
    this.recordEvent("core_stabilize_begin");
  }

  playStabilizeConvergence(frameState, progress) {
    const voice = this.resolveRadialVoice(frameState);
    const source = this.playerPosition();
    const center = 112 * voice.pitchScale;
    const spread = 34 * (1 - progress) * (1.05 - voice.focus01 * 0.10);
    const duration = (0.12 + progress * 0.08) * voice.sustainScale;
    this.playTone({ source, frequency: Math.max(30, center - spread), duration, gain: 0.040 + progress * 0.018, type: "sine", glideTo: center, bus: "verbs" });
    this.playTone({ source, frequency: center + spread, duration, gain: 0.034 + progress * 0.016, type: "sine", glideTo: center, delay: 0.015, bus: "verbs" });
    if (progress >= 0.82) {
      this.playTone({ source, frequency: center, duration: duration * 1.25, gain: 0.036, type: "triangle", delay: 0.035, bus: "verbs" });
    }
    this.recordEvent(progress >= 0.82 ? "core_stabilize_locked" : "core_stabilize_converging");
  }

  handleVascularSiltArrival(frameState) {
    const route = frameState.vascularRhythmRoute;
    const arrival = route?.siltArrivalPresentation;
    if (frameState.activeCellId !== "CELL_VASCULAR_RHYTHM_ROUTE_001" || !route?.active
      || arrival?.pass !== "CONNECTION19" || arrival.owner !== "VascularRhythmRouteSystem"
      || arrival.authority !== "HostConnectionReceiptLedger"
      || arrival.kind !== "vascular_membrane_load_change_applied"
      || !Number.isSafeInteger(arrival.sequence) || arrival.sequence < 1
      || arrival.receiptId !== `CELL_VASCULAR_RHYTHM_ROUTE_001:membrane-load-applied:${arrival.sequence}`
      || !/^CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:[1-9]\d*$/.test(arrival.parentSiltReceiptId ?? "")
      || !Number.isFinite(arrival.appliedDelta) || arrival.appliedDelta <= 0 || arrival.appliedDelta > 0.19500001
      || arrival.materialTransfer !== false || arrival.routeCredit !== false
      || ![arrival.position?.x, arrival.position?.y, arrival.position?.z].every(Number.isFinite)
      || !Number.isFinite(arrival.ageSeconds) || arrival.ageSeconds < 0) return;
    if (arrival.sequence <= this.lastVascularArrivalSequence) return;
    // Consume observed identities even when locked, internally inspecting or late.
    // Unlocking / leaving Core Work / revisiting must not replay an old arrival.
    this.lastVascularArrivalSequence = arrival.sequence;
    const t = frameState.runtimeSeconds ?? 0;
    if (arrival.ageSeconds > 0.5 || !Number.isFinite(t)
      || frameState.inspectionCamera?.coreWorkActive || frameState.tightInspectionCamera?.coreWorkActive
      || !this.unlocked || this.context?.state !== "running" || !this.masterGain
      || t - this.lastVascularArrivalAudioAt < 0.4) return;
    this.playTone({ source: arrival.position, frequency: 96, glideTo: 128,
      duration: 0.26, gain: 0.035, type: "sine", bus: "world" });
    this.playTone({ source: arrival.position, frequency: 192, glideTo: 144,
      duration: 0.16, gain: 0.018, type: "triangle", delay: 0.09, bus: "world" });
    this.lastVascularArrivalAudioAt = t;
    this.vascularArrivalSignatureCount += 1;
    this.recordEvent(`vascular_silt_arrival:${arrival.sequence}`);
  }

  handleGraveVascularMemory(frameState) {
    const route = frameState.graveMemoryRoute, memory = route?.vascularMemoryPresentation;
    if (frameState.activeCellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001" || !route?.active
      || memory?.pass !== "CONNECTION27" || memory.owner !== "GraveMemoryRouteSystem"
      || memory.authority !== "GraveVascularEffectMemory" || memory.kind !== "positive_vascular_memory_retained"
      || !Number.isSafeInteger(memory.sequence) || memory.sequence < 1
      || !Number.isSafeInteger(memory.vascularEventSequence) || memory.vascularEventSequence < 1
      || memory.receiptId !== `CELL_VASCULAR_RHYTHM_ROUTE_001:membrane-load-applied:${memory.vascularEventSequence}`
      || !/^CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:[1-9]\d*$/.test(memory.parentSiltReceiptId ?? "")
      || memory.siteId !== "residue_silt_cloud_001"
      || ![memory.appliedDelta, memory.memoryDelta, memory.memoryPressureBefore, memory.memoryPressureAfter].every(Number.isFinite)
      || memory.appliedDelta <= 0 || memory.appliedDelta > 0.19500001
      || memory.memoryDelta <= 0 || memory.memoryDelta > memory.appliedDelta + 1e-10
      || memory.memoryPressureBefore < 0 || memory.memoryPressureAfter > 1
      || Math.abs(memory.memoryPressureAfter - memory.memoryPressureBefore - memory.memoryDelta) > 1e-10
      || memory.materialTransfer !== false || memory.routeCredit !== false
      || ![memory.position?.x, memory.position?.y, memory.position?.z].every(Number.isFinite)
      || !Number.isFinite(memory.ageSeconds) || memory.ageSeconds < 0) return;
    if (memory.sequence <= this.lastGraveMemorySequence) return;
    // Consume muted/late/Core Work observations rather than queueing old echoes.
    this.lastGraveMemorySequence = memory.sequence;
    const t = frameState.runtimeSeconds ?? 0;
    if (memory.ageSeconds > 0.5 || !Number.isFinite(t)
      || frameState.inspectionCamera?.coreWorkActive || frameState.tightInspectionCamera?.coreWorkActive
      || !this.unlocked || this.context?.state !== "running" || !this.masterGain
      || t - this.lastGraveMemoryAudioAt < 0.4) return;
    this.playTone({source: memory.position, frequency: 144, glideTo: 108,
      duration: 0.30, gain: 0.030, type: "sine", bus: "world"});
    this.playTone({source: memory.position, frequency: 108, glideTo: 96,
      duration: 0.28, gain: 0.014, type: "sine", delay: 0.16, bus: "world"});
    this.lastGraveMemoryAudioAt = t;
    this.graveMemorySignatureCount += 1;
    this.recordEvent(`grave_vascular_memory:${memory.sequence}`);
  }

  handleSignalPlainLocalConsequence(frameState) {
    const consequence = frameState.signalPlainEcology?.persistentLocalConsequence ?? {};
    if (!consequence.active) return;
    const t = frameState.runtimeSeconds ?? 0;
    const activeStates = Array.isArray(consequence.states)
      ? consequence.states.filter((state) => state?.active && state?.eventId && state.eventId !== "none")
      : [];

    for (const state of activeStates) {
      if (this.seenSignalPlainConsequenceEventIds.has(state.eventId)) continue;
      this.seenSignalPlainConsequenceEventIds.add(state.eventId);
      this.playSignalPlainConsequenceSignature(state, false);
    }

    const nearest = consequence.nearestActive;
    if (nearest?.active && (nearest.remainingSeconds ?? 0) > 3.5 && t - this.lastSignalPlainConsequenceToneAt >= 4.2) {
      this.playSignalPlainConsequenceSignature(nearest, true);
      this.lastSignalPlainConsequenceToneAt = t;
    }
  }

  playSignalPlainConsequenceSignature(state, sustained = false) {
    const source = state?.position ?? this.playerPosition();
    const id = state?.consequenceId ?? "none";
    const gainScale = sustained ? 0.72 : 1;
    if (id === "redistributed_flow") {
      this.playTone({ source, frequency: 112, duration: sustained ? 0.22 : 0.30, gain: 0.045 * gainScale, type: "sine", glideTo: 92, bus: "world" });
      this.playTone({ source, frequency: 148, duration: 0.18, gain: 0.026 * gainScale, type: "triangle", delay: 0.11, glideTo: 126, bus: "world" });
    } else if (id === "coherent_answer_cadence") {
      this.playTone({ source, frequency: 214, duration: 0.12, gain: 0.040 * gainScale, type: "sine", bus: "world" });
      this.playTone({ source, frequency: 321, duration: 0.15, gain: 0.033 * gainScale, type: "sine", delay: 0.14, glideTo: 294, bus: "world" });
      if (!sustained) this.playTone({ source, frequency: 214, duration: 0.10, gain: 0.026, type: "triangle", delay: 0.31, bus: "world" });
    } else if (id === "held_phase_coherence") {
      this.playTone({ source, frequency: 94, duration: sustained ? 0.26 : 0.34, gain: 0.041 * gainScale, type: "sine", glideTo: 118, bus: "world" });
      this.playTone({ source, frequency: 146, duration: sustained ? 0.24 : 0.32, gain: 0.034 * gainScale, type: "sine", delay: 0.02, glideTo: 118, bus: "world" });
    }
    this.recordEvent(`signal_plain_local_consequence:${id}${sustained ? ":sustain" : ":onset"}`);
  }

  handleSignalPlainConsequenceNextQuestion(frameState) {
    const primary = frameState.signalPlainEcology?.consequenceNextQuestion?.primary ?? null;
    if (!primary?.active || (primary.strength ?? 0) < 0.28 || !primary.eventId || primary.eventId === "none") return;
    if (this.seenSignalPlainNextQuestionEventIds.has(primary.eventId)) return;
    this.seenSignalPlainNextQuestionEventIds.add(primary.eventId);
    this.playSignalPlainNextQuestionSignature(primary);
  }

  playSignalPlainNextQuestionSignature(link) {
    const source = link?.targetPosition ?? this.playerPosition();
    const id = link?.id ?? "none";
    if (id === "afterflow_exposes_phase_slip") {
      this.playNoiseBurst({ source, duration: 0.11, gain: 0.030, centerFrequency: 260, type: "shear", bus: "world" });
      this.playTone({ source, frequency: 132, duration: 0.20, gain: 0.028, type: "triangle", glideTo: 116, delay: 0.04, bus: "world" });
    } else if (id === "cadence_entrains_slow_breath") {
      this.playTone({ source, frequency: 168, duration: 0.18, gain: 0.030, type: "sine", glideTo: 154, bus: "world" });
      this.playTone({ source, frequency: 126, duration: 0.24, gain: 0.026, type: "sine", delay: 0.16, glideTo: 142, bus: "world" });
    } else if (id === "coherence_reveals_resonant_gap") {
      this.playTone({ source, frequency: 178, duration: 0.15, gain: 0.026, type: "sine", glideTo: 202, bus: "world" });
      this.playTone({ source, frequency: 226, duration: 0.12, gain: 0.028, type: "triangle", delay: 0.24, glideTo: 202, bus: "world" });
    }
    this.recordEvent(`signal_plain_next_question:${id}`);
  }

  handleContact(frameState) {
    const contact = frameState.coreContactLanguage ?? {};
    const next = contact.state ?? "suspended";
    if (next === this.previousContactState) return;
    const source = this.playerPosition();
    if (next === "brushing") {
      this.playNoiseBurst({ source, duration: 0.055, gain: 0.035, centerFrequency: 420, type: "brush", bus: "world" });
    } else if (next === "attached") {
      this.playTone({ source, frequency: 96, duration: 0.12, gain: 0.055, type: "triangle", glideTo: 72, bus: "world" });
      this.playNoiseBurst({ source, duration: 0.08, gain: 0.028, centerFrequency: 180, type: "adhesion", bus: "world" });
    } else if (next === "releasing") {
      this.playTone({ source, frequency: 78, duration: 0.15, gain: 0.045, type: "sine", glideTo: 148, bus: "world" });
    }
    this.previousContactState = next;
  }

  handleCoreWork(frameState) {
    const work = frameState.coreWorkManipulation ?? {};
    const grabCount = Number.isFinite(work.grabCount) ? work.grabCount : 0;
    const placementCount = Number.isFinite(work.placementCount) ? work.placementCount : 0;
    const source = work.selectedWorldPosition ?? this.playerPosition();
    if (grabCount > this.previousCoreWorkGrabCount) {
      this.playTone({ source, frequency: 226, duration: 0.08, gain: 0.045, type: "sine", glideTo: 286, bus: "core" });
      this.playTone({ source, frequency: 452, duration: 0.045, gain: 0.018, type: "triangle", delay: 0.035, bus: "core" });
    }
    if (placementCount > this.previousCoreWorkPlacementCount) {
      this.playTone({ source, frequency: 286, duration: 0.10, gain: 0.042, type: "sine", glideTo: 174, bus: "core" });
      this.playTone({ source, frequency: 143, duration: 0.11, gain: 0.026, type: "triangle", delay: 0.035, bus: "core" });
    }
    this.previousCoreWorkGrabCount = grabCount;
    this.previousCoreWorkPlacementCount = placementCount;
  }

  handleChemistryPattern(frameState) {
    const cloud = frameState.coreWorkManipulation?.cloudPattern ?? frameState.spatialCoreChemistry?.cloudPattern ?? null;
    if (!cloud) return;
    const count = Number.isFinite(cloud.popCount) ? cloud.popCount : 0;
    if (count <= this.previousPatternPopCount) return;
    this.previousPatternPopCount = count;
    const source = this.playerPosition();
    const id = cloud.popPatternId && cloud.popPatternId !== "none" ? cloud.popPatternId : cloud.stablePatternId;
    this.playPatternPop(id, source);
  }

  handleReturnLandmark(frameState) {
    const traversal = frameState.firstSliceReturnTraversal ?? {};
    if (!traversal.active) {
      this.previousReturnSignatureId = "none";
      return;
    }
    const signature = traversal.nearestDestinationSignature ?? {};
    const signatureId = signature.id ?? "none";
    const distance = Number.isFinite(traversal.nearestSeamDistance) ? traversal.nearestSeamDistance : 999;
    const t = frameState.runtimeSeconds ?? 0;
    const nearEnough = distance <= 3.9;
    const entered = signatureId !== "none" && signatureId !== this.previousReturnSignatureId;
    const periodic = nearEnough && t - this.lastLandmarkPulseAt >= 5.6;
    if (nearEnough && (entered || periodic)) {
      const source = this.resolveLandmarkSource(frameState);
      if (source) this.playLandmarkSignature(signatureId, source, distance);
      this.lastLandmarkPulseAt = t;
    }
    this.previousReturnSignatureId = signatureId;
  }

  resolveLandmarkSource(frameState) {
    const traversal = frameState.firstSliceReturnTraversal ?? {};
    const seamId = traversal.nearestSeamId;
    if (!seamId || seamId === "none") return null;
    const seam = (traversal.seams ?? []).find((entry) => entry.id === seamId);
    if (!Array.isArray(seam?.anchor)) return null;
    return { x: seam.anchor[0] ?? 0, y: seam.anchor[1] ?? 0, z: seam.anchor[2] ?? 0 };
  }

  resolveBoundarySource(frameState, distance = 1.5) {
    const normal = frameState.playerKinematics?.movementBoundary?.surfaceNormal ?? { x: 0, y: 1, z: 0 };
    const p = this.playerPosition();
    return { x: p.x + (normal.x ?? 0) * distance, y: p.y + (normal.y ?? 1) * distance, z: p.z + (normal.z ?? 0) * distance };
  }

  playerPosition() {
    const p = this.playerRoot?.position ?? { x: 0, y: 0, z: 0 };
    return { x: p.x ?? 0, y: p.y ?? 0, z: p.z ?? 0 };
  }

  playWorldRhythmBeat(source, composition) {
    if (!composition?.active || !composition.audioVoice) return;
    const voice = composition.audioVoice;
    const frequency = Math.max(28, voice.frequencyHz ?? 72);
    const accent = Math.max(0, Math.min(1, composition.accentStrength ?? 0));
    const beatNumber = composition.beatNumber ?? 1;
    const gainScale = Math.max(0, voice.gainScale ?? 1);
    const durationScale = Math.max(0.2, voice.durationScale ?? 1);
    const glideScale = Math.max(0.5, voice.glideScale ?? 1);
    const gain = (0.006 + accent * 0.014) * gainScale;
    const duration = (0.052 + accent * 0.040) * durationScale;
    this.playTone({
      source,
      frequency,
      duration,
      gain,
      type: voice.waveform ?? "sine",
      glideTo: frequency * glideScale,
      bus: "ambience"
    });
    this.recordEvent(`world_rhythm_beat:${composition.profileId}:${composition.keyId}:${beatNumber}:${composition.currentFunction}:${composition.accentRole ?? "none"}`);
  }

  playHostPulse(source) {
    this.playTone({ source, frequency: 48, duration: 0.26, gain: 0.042, type: "sine", glideTo: 42, bus: "ambience" });
    this.playTone({ source, frequency: 96, duration: 0.13, gain: 0.018, type: "triangle", delay: 0.035, glideTo: 82, bus: "ambience" });
    this.recordEvent("host_pulse");
  }

  playLandmarkSignature(signatureId, source, distance) {
    const distanceGain = Math.max(0.35, Math.min(1, 1 - distance / 6.5));
    if (signatureId === "nursery_triad") {
      [174, 196, 220].forEach((frequency, index) => this.playTone({ source, frequency, duration: 0.09, gain: 0.025 * distanceGain, type: "sine", delay: index * 0.105 }));
    } else if (signatureId === "scar_double_rib") {
      [132, 118].forEach((frequency, index) => this.playTone({ source, frequency, duration: 0.115, gain: 0.028 * distanceGain, type: "triangle", delay: index * 0.17 }));
    } else if (signatureId === "chorus_triad") {
      [146, 219, 164].forEach((frequency, index) => this.playTone({ source, frequency, duration: 0.13, gain: 0.024 * distanceGain, type: "sine", delay: index * 0.13 }));
    }
    this.recordEvent(`landmark_${signatureId}`);
  }

  playPatternPop(patternId, source) {
    if (patternId === "balanced_triad") {
      [220, 277, 330].forEach((frequency) => this.playTone({ source, frequency, duration: 0.16, gain: 0.031, type: "sine" }));
    } else if (patternId === "tight_convergence") {
      this.playTone({ source, frequency: 112, duration: 0.11, gain: 0.045, type: "triangle", glideTo: 76 });
      this.playTone({ source, frequency: 228, duration: 0.15, gain: 0.036, type: "sine", delay: 0.11, glideTo: 286 });
    } else if (patternId === "paired_counterpoint") {
      this.playTone({ source, frequency: 184, duration: 0.10, gain: 0.034, type: "sine" });
      this.playTone({ source, frequency: 184, duration: 0.10, gain: 0.034, type: "sine", delay: 0.09 });
      this.playTone({ source, frequency: 292, duration: 0.14, gain: 0.032, type: "triangle", delay: 0.24 });
    } else if (patternId === "radial_ladder") {
      [110, 165, 247].forEach((frequency, index) => this.playTone({ source, frequency, duration: 0.10, gain: 0.031, type: "triangle", delay: index * 0.095 }));
    } else if (patternId === "linear_channel") {
      [138, 207, 310].forEach((frequency, index) => this.playTone({ source, frequency, duration: 0.08, gain: 0.03, type: "sine", delay: index * 0.055, glideTo: frequency * 1.12 }));
    } else {
      this.playTone({ source, frequency: 176, duration: 0.08, gain: 0.022, type: "sine" });
    }
    this.recordEvent(`chemistry_pop_${patternId ?? "none"}`);
  }

  playTone({ source, frequency, duration, gain, type = "sine", delay = 0, glideTo = null, bus = "world" }) {
    if (!this.unlocked || !this.context || !this.masterGain) return;
    const now = this.context.currentTime + Math.max(0, delay);
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const spatial = this.createSpatialNode(source);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), now);
    if (Number.isFinite(glideTo)) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), now + duration);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + Math.min(0.025, duration * 0.28));
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope);
    envelope.connect(spatial);
    spatial.connect(this.resolveBusNode(bus));
    oscillator.start(now);
    oscillator.stop(now + duration + 0.025);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); spatial.disconnect(); };
  }

  playNoiseBurst({ source, duration, gain, centerFrequency, type, bus = "world" }) {
    if (!this.unlocked || !this.context || !this.masterGain) return;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    const sourceNode = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const level = this.context.createGain();
    const spatial = this.createSpatialNode(source);
    sourceNode.buffer = buffer;
    filter.type = type === "adhesion" ? "lowpass" : "bandpass";
    filter.frequency.value = centerFrequency;
    filter.Q.value = type === "brush" ? 0.7 : 0.45;
    level.gain.value = gain;
    sourceNode.connect(filter);
    filter.connect(level);
    level.connect(spatial);
    spatial.connect(this.resolveBusNode(bus));
    sourceNode.start();
    sourceNode.onended = () => { sourceNode.disconnect(); filter.disconnect(); level.disconnect(); spatial.disconnect(); };
  }

  resolveBusNode(bus = "world") {
    return this.busNodes?.[bus] ?? this.masterGain;
  }

  createSpatialNode(source) {
    if (this.context.createPanner) {
      const node = this.context.createPanner();
      node.panningModel = "HRTF";
      node.distanceModel = "inverse";
      node.refDistance = HC027D1_AUDIO_MIX.pannerRefDistance;
      node.maxDistance = HC027D1_AUDIO_MIX.pannerMaxDistance;
      node.rolloffFactor = HC027D1_AUDIO_MIX.pannerRolloff;
      const x = source?.x ?? 0, y = source?.y ?? 0, z = source?.z ?? 0;
      if (node.positionX) { node.positionX.value = x; node.positionY.value = y; node.positionZ.value = z; }
      else if (node.setPosition) node.setPosition(x, y, z);
      return node;
    }
    return this.context.createGain();
  }

  recordEvent(id) {
    this.eventCount += 1;
    this.lastEvent = id;
    this.lastEventAt = this.frameState?.runtimeSeconds ?? 0;
  }

  publishState(frameState) {
    frameState.hostAudio = {
      pass: "HC-027D1",
      active: true,
      owner: "EventAnchoredHostAudioSystem",
      synthesis: "procedural_web_audio",
      audioContextAvailable: Boolean(globalThis.AudioContext || globalThis.webkitAudioContext),
      unlocked: Boolean(this.unlocked),
      contextState: this.context?.state ?? "not_created",
      unlockReason: this.unlockReason,
      masterGain: HC027D1_AUDIO_MIX.masterGain,
      mixRevision: "hc027d1_reference_dynamic_range",
      referenceListeningCalibration: "primary_playtest_hearing",
      referenceSystemOutputPercent: HC027D1_AUDIO_MIX.referenceSystemOutputPercent,
      targetHeadroomDb: HC027D1_AUDIO_MIX.targetHeadroomDb,
      busGains: { ...HC027D1_AUDIO_MIX.busGain },
      outputSafetyCompression: {
        thresholdDb: HC027D1_AUDIO_MIX.compressorThresholdDb,
        ratio: HC027D1_AUDIO_MIX.compressorRatio,
        attackSeconds: HC027D1_AUDIO_MIX.compressorAttackSeconds,
        releaseSeconds: HC027D1_AUDIO_MIX.compressorReleaseSeconds
      },
      pannerRefDistance: HC027D1_AUDIO_MIX.pannerRefDistance,
      pannerRolloff: HC027D1_AUDIO_MIX.pannerRolloff,
      unlockPromptRequired: !this.unlocked,
      unlockConfirmationPlayed: this.unlockConfirmationPlayed,
      gamepadAloneCannotGuaranteeBrowserUnlock: true,
      playtestInstruction: this.unlocked
        ? "Audio unlocked. Confirmation triad should have sounded."
        : "Click the AUDIO LOCKED banner or press a keyboard key once; gamepad input alone may not unlock browser Web Audio.",
      eventCount: this.eventCount,
      lastEvent: this.lastEvent,
      lastEventAt: this.lastEventAt,
      vascularArrivalAudio: {
        observedSequence: this.lastVascularArrivalSequence,
        scheduledSignatures: this.vascularArrivalSignatureCount,
        source: "Host_confirmed_positive_local_effect_at_first_vascular_fold",
        replayOnUnlock: false, replayOnRevisit: false
      },
      graveMemoryAudio: {
        observedSequence: this.lastGraveMemorySequence,
        scheduledSignatures: this.graveMemorySignatureCount,
        source: "positive_retained_vascular_memory_at_existing_grave_silt",
        replayOnUnlock: false, replayOnRevisit: false
      },
      eventFamilies: ["host_pulse", "world_rhythm_beat", "core_pulse_emit_return", "core_absorb_intake_flow_capture", "core_stabilize_convergence", "spatial_memory_landmark", "contact_brush_attach_release", "guide_core_work_grab_place", "chemistry_pattern_pop", "signal_plain_persistent_local_consequence", "signal_plain_consequence_next_question", "vascular_silt_applied_arrival", "grave_vascular_memory_retained"],
      landmarkSignatures: {
        nursery_triad: "three_soft_living_pulses",
        scar_double_rib: "paired_low_response",
        chorus_triad: "three_answering_tones"
      },
      spatialized: true,
      distanceAttenuation: true,
      gameplayAuthority: false,
      progressionAuthority: false,
      coreEngineCadenceEnabled: true,
      coreEngineCadenceSource: "frameState.coreEngine",
      coreEngineCadenceDrivesGameplay: false,
      mutingChangesGameplay: false,
      pulseSonarEnabled: true,
      pulseReturnTimingSource: "frameState.coreSensoryResponse",
      absorbProcessAudioEnabled: true,
      stabilizeConvergenceAudioEnabled: true,
      radialPhysiologyColorsCoreVerbAudio: true,
      calibratedDynamicRangeEnabled: true,
      nearFieldRemainsLouderThanFarField: true,
      futureMajorEventsRetainHeadroom: true,
      signalPlainPersistentLocalConsequenceAudioEnabled: true,
      signalPlainPersistentLocalConsequenceUsesLockedReferenceMix: true,
      signalPlainConsequenceNextQuestionAudioEnabled: true,
      signalPlainConsequenceNextQuestionUsesLockedReferenceMix: true,
      signalPlainConsequenceNextQuestionAddsMusicLayer: false,
      musicLayerEnabled: false,
      externalAudioAssetsRequired: false
    };
  }
}
