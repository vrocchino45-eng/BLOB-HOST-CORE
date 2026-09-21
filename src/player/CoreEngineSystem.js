const FUNCTIONS = ["pulse", "absorb", "stabilize"];

const ARCHITECTURES = {
  3: {
    id: "triadic_3",
    label: "3-phase",
    phaseCount: 3,
    phasesPerFunction: 1,
    resolution: "one_phase_per_function"
  },
  6: {
    id: "paired_6",
    label: "6-phase",
    phaseCount: 6,
    phasesPerFunction: 2,
    resolution: "paired_counterpart_phases_per_function"
  },
  12: {
    id: "continuous_12",
    label: "12-phase",
    phaseCount: 12,
    phasesPerFunction: 4,
    resolution: "four_phase_resolution_per_function"
  }
};

const ARCHITECTURE_ORDER = [3, 6, 12];

/**
 * HC027B authoritative Core engine physiology foundation.
 *
 * This system owns only triadic firing architecture, sequencing, operating-load
 * telemetry, and the 3 -> 6 -> 12 resolution law. It is intentionally read-only
 * toward gameplay: movement, verbs, chemistry, attachment, progression, and
 * Core Work placement remain owned by their existing systems.
 */
export class CoreEngineSystem {
  constructor({ frameState, playerRoot }) {
    if (!frameState) throw new Error("[CoreEngineSystem] frameState is required.");
    if (!playerRoot) throw new Error("[CoreEngineSystem] playerRoot is required.");

    this.frameState = frameState;
    this.playerRoot = playerRoot;
    this.architectureIndex = 0;
    this.architecturePhase = 0;
    this.currentPhaseIndex = 0;
    this.previousPhaseIndex = -1;
    this.cycleCount = 0;
    this.phaseEventCount = 0;
    this.rpm = 3000;
    this.targetRpm = 3000;
    this.load01 = 0;
    this.lastPulseEventId = 0;
    this.pulseLoadAge = 99;
    this.lastDebugCycleFrame = -1;
    this.lastEvent = "engine_initialized";
  }

  init() {
    this.publish(this.frameState);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    this.applyProgressionArchitecture(frameState);
    this.handleDebugArchitectureCycle(frameState);
    this.updateOperatingLoad(safeDt, frameState);
    this.updateSequencing(safeDt);
    this.publish(frameState);
  }

  applyProgressionArchitecture(frameState) {
    const unlocked = frameState.returnRegionEngine?.unlockedPhaseCount ?? 3;
    const desiredIndex = unlocked >= 12 ? 2 : unlocked >= 6 ? 1 : 0;
    if (desiredIndex <= this.architectureIndex) return;
    this.architectureIndex = desiredIndex;
    this.architecturePhase = 0;
    this.currentPhaseIndex = 0;
    this.previousPhaseIndex = -1;
    this.lastEvent = `progression_architecture_unlocked:${this.architecture().label}`;
  }

  handleDebugArchitectureCycle(frameState) {
    if (!frameState.input?.debugCoreEngineCyclePressed) return;
    if (this.lastDebugCycleFrame === frameState.frame) return;
    this.lastDebugCycleFrame = frameState.frame ?? -1;
    this.architectureIndex = (this.architectureIndex + 1) % ARCHITECTURE_ORDER.length;
    this.architecturePhase = 0;
    this.currentPhaseIndex = 0;
    this.previousPhaseIndex = -1;
    this.lastEvent = `debug_architecture_changed:${this.architecture().label}`;
  }

  updateOperatingLoad(dt, frameState) {
    const kinematics = frameState.playerKinematics ?? {};
    const input = frameState.input ?? {};
    const speed = Math.max(0, kinematics.speed ?? 0);
    const movementLoad = Math.min(1, speed / 3.6);
    const boostLoad = input.boostHeld ? 0.22 : 0;
    const absorbLoad = input.absorbHeld ? 0.16 : 0;
    const stabilizeLoad = input.stabilizeHeld ? 0.12 : 0;

    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    if (pulseEventId > this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      this.pulseLoadAge = 0;
    } else {
      this.pulseLoadAge += dt;
    }
    const pulseTransient = Math.max(0, 1 - this.pulseLoadAge / 0.55) * 0.34;

    this.load01 = Math.max(0, Math.min(1, movementLoad * 0.48 + boostLoad + absorbLoad + stabilizeLoad + pulseTransient));
    this.targetRpm = 3000 + this.load01 * 7000;
    const settle = 1 - Math.exp(-dt * (this.targetRpm > this.rpm ? 3.2 : 2.2));
    this.rpm += (this.targetRpm - this.rpm) * settle;
  }

  updateSequencing(dt) {
    const architecture = this.architecture();
    // "Core RPM" is an energy-output marker analogous to engine RPM rather
    // than a literal revolutions-per-minute simulation. The visible biological
    // cycle remains readable while preserving the intended 3000-10000 scale.
    const rpm01 = Math.max(0, Math.min(1, (this.rpm - 3000) / 7000));
    const cycleHz = 0.78 + rpm01 * 2.35;
    this.architecturePhase += dt * cycleHz;
    if (this.architecturePhase >= 1) {
      const completedCycles = Math.floor(this.architecturePhase);
      this.architecturePhase -= completedCycles;
      this.cycleCount += completedCycles;
    }

    const phaseFloat = this.architecturePhase * architecture.phaseCount;
    this.currentPhaseIndex = Math.min(architecture.phaseCount - 1, Math.floor(phaseFloat));
    if (this.currentPhaseIndex !== this.previousPhaseIndex) {
      this.previousPhaseIndex = this.currentPhaseIndex;
      this.phaseEventCount += 1;
      this.lastEvent = `phase_fire:${this.phaseLabel(this.currentPhaseIndex)}`;
    }
  }

  architecture() {
    return ARCHITECTURES[ARCHITECTURE_ORDER[this.architectureIndex]];
  }

  phaseFunction(index) {
    return FUNCTIONS[index % FUNCTIONS.length];
  }

  phaseOrdinal(index) {
    return Math.floor(index / FUNCTIONS.length) + 1;
  }

  phaseLabel(index) {
    const fn = this.phaseFunction(index);
    return `${fn}_${this.phaseOrdinal(index)}`;
  }

  firingOrder(architecture = this.architecture()) {
    return Array.from({ length: architecture.phaseCount }, (_, index) => ({
      index,
      function: this.phaseFunction(index),
      ordinal: this.phaseOrdinal(index),
      label: this.phaseLabel(index)
    }));
  }

  publish(frameState) {
    const architecture = this.architecture();
    const rpm01 = Math.max(0, Math.min(1, (this.rpm - 3000) / 7000));
    const cycleHz = 0.78 + rpm01 * 2.35;
    const currentPhase = this.firingOrder(architecture)[this.currentPhaseIndex] ?? this.firingOrder(architecture)[0];

    frameState.coreEngine = {
      pass: "HC-027B",
      active: true,
      owner: "CoreEngineSystem",
      geometryLaw: "triadic_base_resolves_3_to_6_to_12",
      functions: [...FUNCTIONS],
      architectureId: architecture.id,
      architectureLabel: architecture.label,
      phaseCount: architecture.phaseCount,
      phasesPerFunction: architecture.phasesPerFunction,
      resolution: architecture.resolution,
      firingOrder: this.firingOrder(architecture),
      currentPhaseIndex: this.currentPhaseIndex,
      currentPhaseFunction: currentPhase.function,
      currentPhaseOrdinal: currentPhase.ordinal,
      currentPhaseLabel: currentPhase.label,
      cycleProgress01: Number(this.architecturePhase.toFixed(4)),
      cycleCount: this.cycleCount,
      phaseEventCount: this.phaseEventCount,
      rpm: Math.round(this.rpm),
      targetRpm: Math.round(this.targetRpm),
      rpmMin: 3000,
      rpmMax: 10000,
      load01: Number(this.load01.toFixed(3)),
      cycleHz: Number(cycleHz.toFixed(3)),
      phaseEventsPerSecond: Number((cycleHz * architecture.phaseCount).toFixed(2)),
      rpmMeaning: "marker_for_current_core_energy_cycling_and_expenditure",
      literalMechanicalRpm: false,
      architectureDebugCycleCommand: "O",
      architectureDebugOnly: false,
      progressionUnlockSource: "ReturnRegionEngineSystem",
      progressionUnlockedPhaseCount: frameState.returnRegionEngine?.unlockedPhaseCount ?? 3,
      defaultArchitecture: "3-phase",
      gameplayAuthority: false,
      movementAuthority: false,
      verbAuthority: false,
      chemistryAuthority: false,
      coreWorkPlacementAuthority: false,
      progressionAuthority: false,
      progressionConsumer: true,
      growthAuthority: false,
      geometryViolationEnabled: false,
      nonTriadicArchitectureEnabled: false,
      lastEvent: this.lastEvent
    };

    this.playerRoot.userData.coreEngineArchitecture = architecture.id;
    this.playerRoot.userData.coreEnginePhaseCount = architecture.phaseCount;
    this.playerRoot.userData.coreEngineRpm = Math.round(this.rpm);
  }
}
