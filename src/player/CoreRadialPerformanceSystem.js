import { deriveCoreEarnedEvolution } from "./CoreEarnedEvolution.js";
import { publishCoreStabilizeSample } from './CoreStabilizeSample.js';
import { GRAVE_MAX_RECOVERY_ASSIST } from '../routes/GraveRecoveryCoupling.js';
import { inSiltFlowWorld, MAX_FLOW_STEP, readFlowAim, readFlowStep, SILT_FLOW_SITE } from '../interaction/SiltFlowContract.js';

const GRAVE_CELL = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const RADIAL_DRAIN_RATE = 0.09;

const ZONE_TRAITS = {
  deep_core: {
    output: 0.88,
    response: 0.88,
    enduranceCapacity: 1.55,
    recovery: 1.50,
    efficiency: 1.35,
    stability: 1.30
  },
  inner_body: {
    output: 1.00,
    response: 1.08,
    enduranceCapacity: 1.05,
    recovery: 1.05,
    efficiency: 1.12,
    stability: 1.05
  },
  membrane: {
    output: 1.18,
    response: 1.20,
    enduranceCapacity: 0.72,
    recovery: 0.65,
    efficiency: 0.72,
    stability: 0.70
  }
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 3) => Number(value.toFixed(digits));

/**
 * HC027C radial performance law.
 *
 * Reads the already-authored Deep / Inner / Membrane topology from
 * CoreEmbodimentSystem and translates that topology into one continuous
 * performance profile. It does not own Core Work placement, chemistry,
 * movement translation, progression, growth, or 3/6/12 engine architecture.
 *
 * PAIRED-DEMAND2 consumes the earned phase ceiling only to coordinate
 * concurrent verb reserve drain. It never writes progression or architecture.
 *
 * Pure Deep = reserve/recovery/stability (diesel character)
 * Pure Inner = transmission/control/efficiency
 * Pure Membrane = response/output/consumption/risk (race-car character)
 */
export class CoreRadialPerformanceSystem {
  constructor({ frameState, playerRoot }) {
    if (!frameState) throw new Error("[CoreRadialPerformanceSystem] frameState is required.");
    if (!playerRoot) throw new Error("[CoreRadialPerformanceSystem] playerRoot is required.");

    this.frameState = frameState;
    this.playerRoot = playerRoot;
    this.reserve01 = 1;
    this.lastPulseEventId = 0;
    this.pulseDemandAge = 99;
    this.pulseDemandPeak = 0;
    this.absorbHoldSeconds = 0;
    this.stabilizeHoldSeconds = 0;
    this.lastTopologyId = "forming_topology";
    this.topologyChangeCount = 0;
    this.lastEvent = "radial_performance_initialized";
    this.lastGraveRecoveryStep = null;
    this.lastFlowSettlementStep = null;
  }

  init() {
    this.publish(this.frameState, this.neutralProfile());
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    const profile = this.resolveProfile(frameState);
    this.trackTopology(profile);
    this.updateReserve(safeDt, frameState, profile);
    this.publish(frameState, profile);
  }

  resolveProfile(frameState) {
    const profile = this.resolveAnatomyProfile(frameState);
    profile.recovery *= deriveCoreEarnedEvolution(frameState.coreGrowth).idleRecoveryMultiplier;
    return profile;
  }

  resolveAnatomyProfile(frameState) {
    const chemistry = frameState.spatialCoreChemistry ?? {};
    const topology = chemistry.topology ?? {};
    const counts = chemistry.counts ?? {};
    const pieceCount = Number.isFinite(chemistry.retainedPieceCount)
      ? chemistry.retainedPieceCount
      : (counts.deep_core ?? 0) + (counts.inner_body ?? 0) + (counts.membrane ?? 0);

    if (pieceCount < 3 || topology.complete === false) {
      return this.neutralProfile({
        topologyId: topology.id ?? "forming_topology",
        topologyLabel: topology.label ?? "Forming Topology",
        distribution: topology.distribution ?? `${counts.deep_core ?? 0}:${counts.inner_body ?? 0}:${counts.membrane ?? 0}`,
        pieceCount
      });
    }

    const deepWeight = clamp01((counts.deep_core ?? 0) / 3);
    const innerWeight = clamp01((counts.inner_body ?? 0) / 3);
    const membraneWeight = clamp01((counts.membrane ?? 0) / 3);
    const weighted = (trait) => (
      ZONE_TRAITS.deep_core[trait] * deepWeight
      + ZONE_TRAITS.inner_body[trait] * innerWeight
      + ZONE_TRAITS.membrane[trait] * membraneWeight
    );

    const output = weighted("output");
    const response = weighted("response");
    const enduranceCapacity = weighted("enduranceCapacity");
    const recovery = weighted("recovery");
    const efficiency = weighted("efficiency");
    const stability = weighted("stability");

    return {
      active: true,
      topologyId: topology.id ?? "three_way_balance",
      topologyLabel: topology.label ?? "Three-Way Balance",
      distribution: topology.distribution ?? `${counts.deep_core ?? 0}:${counts.inner_body ?? 0}:${counts.membrane ?? 0}`,
      pieceCount,
      weights: { deep: deepWeight, inner: innerWeight, membrane: membraneWeight },
      output,
      response,
      enduranceCapacity,
      recovery,
      efficiency,
      stability,
      personality: this.personalityForWeights(deepWeight, innerWeight, membraneWeight),
      dominantZone: topology.dominantZone ?? this.dominantZone(deepWeight, innerWeight, membraneWeight)
    };
  }

  neutralProfile(overrides = {}) {
    return {
      active: false,
      topologyId: "forming_topology",
      topologyLabel: "Forming Topology",
      distribution: "0:0:0",
      pieceCount: 0,
      weights: { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 },
      output: 1,
      response: 1,
      enduranceCapacity: 1,
      recovery: 1,
      efficiency: 1,
      stability: 1,
      personality: "forming / neutral",
      dominantZone: "balanced",
      ...overrides
    };
  }

  personalityForWeights(deep, inner, membrane) {
    if (deep >= 0.999) return "diesel / reserve drive";
    if (membrane >= 0.999) return "race / output drive";
    if (inner >= 0.999) return "transmission / control drive";
    if (Math.abs(deep - inner) < 0.01 && Math.abs(inner - membrane) < 0.01) return "triadic balance";
    if (deep > inner && deep > membrane) return "endurance-biased";
    if (membrane > inner && membrane > deep) return "output-biased";
    if (inner > deep && inner > membrane) return "control-biased";
    return "mixed radial drive";
  }

  dominantZone(deep, inner, membrane) {
    if (deep > inner && deep > membrane) return "deep_core";
    if (inner > deep && inner > membrane) return "inner_body";
    if (membrane > deep && membrane > inner) return "membrane";
    return "balanced";
  }

  trackTopology(profile) {
    if (profile.topologyId === this.lastTopologyId) return;
    this.lastTopologyId = profile.topologyId;
    this.topologyChangeCount += 1;
    this.lastEvent = `radial_topology_changed:${profile.topologyId}`;
  }

  updateReserve(dt, frameState, profile) {
    const input = frameState.input ?? {};
    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    const freshPulseEvent = pulseEventId > this.lastPulseEventId;
    if (freshPulseEvent) {
      this.lastPulseEventId = pulseEventId;
      this.pulseDemandAge = 0;
    } else {
      this.pulseDemandAge += dt;
    }

    const weights = profile.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const pulseCostMultiplier = profile.active
      ? clamp((1.08 / Math.max(0.55, profile.efficiency)) * (0.94 + profile.output * 0.06), 0.72, 1.45)
      : 1;
    const absorbCostMultiplier = profile.active ? clamp(1.04 / Math.max(0.58, profile.efficiency), 0.72, 1.42) : 1;
    const stabilizeCostMultiplier = profile.active
      ? clamp(1.03 / Math.max(0.58, profile.efficiency * Math.pow(profile.stability, 0.28)), 0.68, 1.55)
      : 1;

    if (input.absorbHeld) this.absorbHoldSeconds += dt; else this.absorbHoldSeconds = Math.max(0, this.absorbHoldSeconds - dt * 3.2);
    if (input.stabilizeHeld) this.stabilizeHoldSeconds += dt; else this.stabilizeHoldSeconds = Math.max(0, this.stabilizeHoldSeconds - dt * 3.4);
    const absorbCommitment01 = clamp01((this.absorbHoldSeconds - 0.20) / 1.45);
    const stabilizeCommitment01 = clamp01((this.stabilizeHoldSeconds - 0.18) / 1.30);

    if (freshPulseEvent) {
      const releaseCharge01 = clamp01(input.pulseReleaseCharge01 ?? 0);
      this.pulseDemandPeak = clamp(0.22 + releaseCharge01 * 0.86, 0.22, 1.08) * pulseCostMultiplier;
    }
    const pulseDemand = Math.max(0, 1 - this.pulseDemandAge / 0.62) * this.pulseDemandPeak;
    const boostDemand = input.boostHeld ? 1 : 0;
    const absorbDemand = input.absorbHeld ? (0.24 + absorbCommitment01 * 0.50) * absorbCostMultiplier : 0;
    const stabilizeDemand = input.stabilizeHeld ? (0.20 + stabilizeCommitment01 * 0.48) * stabilizeCostMultiplier : 0;
    const compositionDemandMultiplier = clamp(
      frameState.verbComposition?.effects?.enduranceDemandMultiplier ?? 1,
      1,
      1.4
    );
    const memoryContribution = this.consumeGraveRecoveryContribution(dt, frameState);
    const effectiveStabilizeDemand = stabilizeDemand / (1 + memoryContribution);
    const verbSum = absorbDemand + stabilizeDemand + pulseDemand;
    const nominalDemand01 = clamp01(boostDemand + verbSum * compositionDemandMultiplier);
    const demand01 = clamp01(boostDemand
      + (absorbDemand + effectiveStabilizeDemand + pulseDemand) * compositionDemandMultiplier);

    const drainPerSecond = profile.active
      ? RADIAL_DRAIN_RATE / Math.max(0.2, profile.enduranceCapacity * profile.efficiency)
      : 0.075;
    const recoveryPerSecond = 0.10 * profile.recovery;

    // PAIRED-DEMAND2: counterpart coordination saves only shared verb drain.
    // Read the earned ceiling, never the O-key architecture preview.
    // Regional relief changes the Stabilize term only. Keep the existing
    // coordination factor based on the unmodified verb mix.
    const sharedFraction = verbSum > 0
      ? clamp01((verbSum - Math.max(absorbDemand, stabilizeDemand, pulseDemand)) / verbSum)
      : 0;
    const earnedPhaseCeiling = frameState.returnRegionEngine?.unlockedPhaseCount ?? 3;
    const coordinationEligible = profile.active && earnedPhaseCeiling >= 6 && !input.boostHeld;
    const coordinationFactor = coordinationEligible ? 1 - 0.20 * sharedFraction : 1;
    const draining = nominalDemand01 > 0.02;
    const baseDrainRate = draining ? drainPerSecond * demand01 : 0;
    const effectiveDrainRate = baseDrainRate * coordinationFactor;
    const reserveBefore = this.reserve01;
    const reserveSaved = Math.max(0,
      Math.min(reserveBefore, baseDrainRate * dt) - Math.min(reserveBefore, effectiveDrainRate * dt));
    profile.coordination = {
      pass: "PAIRED-DEMAND2", earnedPhaseCeiling,
      eligible: Boolean(coordinationEligible), active: reserveSaved > 1e-9,
      factor: round(coordinationFactor, 6), sharedFraction: round(sharedFraction, 6),
      baseDrainPerSecond: round(baseDrainRate, 6),
      effectiveDrainPerSecond: round(effectiveDrainRate, 6),
      reserveSavedThisUpdate: round(reserveSaved, 9),
      reason: !profile.active ? "incomplete_topology" : earnedPhaseCeiling < 6 ? "not_earned"
        : input.boostHeld ? "boost_priority" : sharedFraction <= 0 ? "no_overlap"
        : !draining ? "below_drain_threshold" : dt <= 0 ? "no_elapsed_time"
            : reserveBefore <= 0 ? "reserve_empty" : reserveSaved > 1e-9 ? "coordinating" : "no_realized_saving",
      progressionAuthority: false, architectureAuthority: false
    };

    if (draining) {
      this.reserve01 = clamp01(this.reserve01 - effectiveDrainRate * dt);
      if (this.reserve01 <= 0.001) this.lastEvent = "endurance_reserve_depleted";
    } else {
      const previous = this.reserve01;
      this.reserve01 = clamp01(this.reserve01 + recoveryPerSecond * dt);
      if (previous < 0.999 && this.reserve01 >= 0.999) this.lastEvent = "endurance_reserve_recovered";
    }

    profile.demand01 = demand01;
    profile.drainPerSecond = drainPerSecond;
    profile.recoveryPerSecond = recoveryPerSecond;
    profile.verbDemand = {
      pulse: round(pulseDemand),
      absorb: round(absorbDemand),
      stabilize: round(effectiveStabilizeDemand),
      absorbCommitment01: round(absorbCommitment01),
      stabilizeCommitment01: round(stabilizeCommitment01),
      pulseCostMultiplier: round(pulseCostMultiplier),
      absorbCostMultiplier: round(absorbCostMultiplier),
      stabilizeCostMultiplier: round(stabilizeCostMultiplier),
      compositionDemandMultiplier: round(compositionDemandMultiplier),
      compositionChord: frameState.verbComposition?.chord ?? "idle"
    };
  }

  settleFlowReserve(dt, frameState = this.frameState) {
    frameState.siltFlowReserveSettlement = null;
    const flow = frameState.coreFlow;
    if (flow?.owner !== 'CoreFlowSystem') return;
    const delivery = flow.result;
    if (!delivery && !(frameState.input?.flowDemand01 > 0)) return;

    const step = readFlowStep(frameState);
    const rejection = this.flowSettlementRejection(dt, frameState, flow, delivery, step);
    const reserveBefore = this.reserve01;
    // Current and resistance are normalized. The radial rate is reserve fraction per second.
    const requestedDebit = rejection ? 0 : RADIAL_DRAIN_RATE * delivery.acceptedCurrent01 * delivery.resistance01 * dt;
    if (!rejection) {
      this.reserve01 = Math.max(0, reserveBefore - requestedDebit);
      this.lastFlowSettlementStep = step;
    }
    const reserveAfter = this.reserve01;
    // Keep the published profile used by this step intact. The normal radial update reads
    // the settled reserve on the next substep.
    frameState.siltFlowReserveSettlement = Object.freeze({
      ...step, owner: 'CoreRadialPerformanceSystem', status: rejection ? 'rejected' : 'settled',
      reason: rejection ?? (requestedDebit > reserveBefore ? 'reserve_limited'
        : requestedDebit > 0 ? 'applied' : 'no_resistive_work'),
      receiverId: delivery?.receiverId ?? flow.receiverId ?? null,
      actionSequence: delivery?.actionSequence ?? flow.actionSequence ?? null,
      deliveryFrame: delivery?.frame ?? null, deliverySubstep: delivery?.substep ?? null,
      stepSeconds: Number.isFinite(dt) ? dt : null,
      acceptedCurrent01: Number.isFinite(delivery?.acceptedCurrent01) ? delivery.acceptedCurrent01 : null,
      resistance01: Number.isFinite(delivery?.resistance01) ? delivery.resistance01 : null,
      requestedDebit, actualDebit: reserveBefore - reserveAfter, reserveBefore, reserveAfter
    });
  }

  flowSettlementRejection(dt, frameState, flow, delivery, step) {
    if (!inSiltFlowWorld(frameState)) return 'ineligible_context';
    if (!step || !Number.isFinite(dt) || dt <= 0 || dt > MAX_FLOW_STEP || dt !== frameState.runtimeSimulationSubstepSeconds
      || !Number.isSafeInteger(frameState.runtimeSimulationSubstepCount)
      || step.substep >= frameState.runtimeSimulationSubstepCount) return 'invalid_step';
    if (!delivery) return flow.reason === 'contact' ? 'contact_dwell' : flow.reason ?? 'no_delivery';

    if (Object.entries(step).some(([key, value]) => flow.step?.[key] !== value || delivery[key] !== value)) {
      return 'stale_delivery';
    }
    const aim = readFlowAim(frameState);
    if (delivery.owner !== 'silt:RegionalTerritoryExpansion' || delivery.siteId !== SILT_FLOW_SITE
      || !delivery.receiverId || delivery.receiverId !== flow.receiverId
      || !aim || Object.entries(aim).some(([key, value]) => delivery[key] !== value)
      || !Number.isSafeInteger(delivery.actionSequence) || delivery.actionSequence <= 0
      || delivery.actionSequence !== flow.actionSequence
      || delivery.actionSequence !== frameState.input?.flowActionSequence) return 'delivery_identity_mismatch';
    if (delivery.acceptedCurrent01 === 0) return 'zero_current';
    if (!Number.isFinite(delivery.acceptedCurrent01) || delivery.acceptedCurrent01 < 0 || delivery.acceptedCurrent01 > 0.55
      || !Number.isFinite(delivery.resistance01) || delivery.resistance01 < 0 || delivery.resistance01 > 1) return 'invalid_delivery';

    const last = this.lastFlowSettlementStep;
    if (last && step.frame === last.frame && step.substep === last.substep) return 'duplicate_step';
    if (last && (step.frame < last.frame || (step.frame === last.frame && step.substep < last.substep))) return 'stale_delivery';
    return null;
  }

  consumeGraveRecoveryContribution(dt, frameState) {
    const memory = frameState.graveVascularEffectMemory;
    const witness = memory?.recoveryCoupling?.witness;
    if (!witness || memory.active !== true || memory.recoveryCoupling.eligibleNow !== true
      || memory.owner !== 'GraveMemoryRouteSystem' || memory.cellId !== GRAVE_CELL
      || memory.mode !== 'bounded_retained_vascular_effect_memory'
      || witness.owner !== memory.owner || frameState.input?.stabilizeHeld !== true
      || frameState.coreWorkManipulation?.held || frameState.inspectionCamera?.active
      || frameState.inspectionCamera?.coreWorkActive || frameState.tightInspectionCamera?.active
      || frameState.tightInspectionCamera?.coreWorkActive) return 0;

    const mount = frameState.firstSliceRuntimeMount;
    const { activeHostId, activeCellId, frame, runtimeSimulationSubstepIndex: substep } = frameState;
    if (typeof activeHostId !== 'string' || !activeHostId || witness.hostId !== activeHostId
      || activeCellId !== GRAVE_CELL || witness.cellId !== activeCellId
      || mount?.activeRuntimeCellId !== activeCellId || !Array.isArray(mount.activeSystemIds)
      || !mount.activeSystemIds.includes('graveMemoryRouteSystem')
      || !Number.isSafeInteger(mount.mountSequence) || mount.mountSequence < 1
      || witness.mountSequence !== mount.mountSequence
      || !Number.isSafeInteger(frame) || frame < 0 || witness.frame !== frame
      || !Number.isSafeInteger(substep) || substep < 0 || witness.substep !== substep
      || !Number.isSafeInteger(frameState.runtimeSimulationSubstepCount)
      || substep >= frameState.runtimeSimulationSubstepCount
      || !(dt > 0) || dt !== witness.stepSeconds || dt !== frameState.runtimeSimulationSubstepSeconds) return 0;

    const lastStep = this.lastGraveRecoveryStep;
    if (lastStep && (frame < lastStep.frame || (frame === lastStep.frame && substep <= lastStep.substep))) return 0;

    const record = Array.isArray(memory.records) ? memory.records.at(-1) : null;
    if (!record || !Number.isFinite(record.appliedDelta) || record.appliedDelta <= 0
      || record.materialTransfer !== false || record.routeCredit !== false
      || !Number.isSafeInteger(record.sequence) || record.sequence < 1 || record.sequence !== memory.lastHostSequence
      || witness.hostSequence !== record.sequence || witness.vascularEffectId !== record.vascularEffectId
      || witness.parentSiltReceiptId !== record.parentSiltReceiptId || witness.subjectId !== record.subjectId
      || witness.memoryPressure !== memory.memoryPressure || !Number.isFinite(memory.memoryPressure)
      || memory.memoryPressure <= 0 || memory.memoryPressure > 1) return 0;

    const { recoilReduction, traceRecovery, baseRecoveryBudget } = witness;
    if (!Number.isFinite(recoilReduction) || recoilReduction < 0 || !Number.isFinite(traceRecovery) || traceRecovery < 0
      || !Number.isFinite(baseRecoveryBudget) || baseRecoveryBudget <= 0) return 0;
    const contribution = (recoilReduction + traceRecovery) / baseRecoveryBudget;
    const maximum = GRAVE_MAX_RECOVERY_ASSIST * memory.memoryPressure;
    if (!(contribution > 0 && contribution <= maximum + 1e-9)) return 0;

    this.lastGraveRecoveryStep = { frame, substep };
    return Math.min(contribution, maximum);
  }

  publish(frameState, profile) {
    const reserve = this.reserve01;
    const stability = profile.stability ?? 1;
    const fatiguePenalty = (1 - reserve) * (0.30 * (1.05 / Math.max(0.55, stability)));
    const fatigueFactor = clamp(1 - fatiguePenalty, 0.58, 1);

    const weights = profile.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const deep = weights.deep ?? 1 / 3;
    const inner = weights.inner ?? 1 / 3;
    const membrane = weights.membrane ?? 1 / 3;
    const demand = profile.verbDemand ?? {};
    const pulseChargeRateMultiplier = profile.active ? clamp(0.86 * deep + 1.02 * inner + 1.18 * membrane, 0.84, 1.20) : 1;
    const pulseStructuralReachMultiplier = profile.active ? clamp(0.90 * deep + 1.00 * inner + 1.15 * membrane, 0.88, 1.16) : 1;
    const pulseResponseStrengthMultiplier = profile.active ? clamp((profile.output ?? 1) * (0.88 + (profile.response ?? 1) * 0.12) * fatigueFactor, 0.76, 1.30) : 1;
    const pulseRecoveryBurdenMultiplier = profile.active ? clamp(0.78 * deep + 0.90 * inner + 1.28 * membrane, 0.76, 1.30) : 1;
    const pulseEchoClutterMultiplier = profile.active ? clamp(0.92 * deep + 0.78 * inner + 1.25 * membrane, 0.76, 1.28) : 1;
    const absorbCommitment01 = demand.absorbCommitment01 ?? 0;
    const absorbPowerMultiplier = profile.active ? clamp((profile.output ?? 1) * (profile.response ?? 1) * fatigueFactor, 0.72, 1.42) : 1;
    const absorbProgressMultiplier = profile.active ? clamp(absorbPowerMultiplier * (0.92 + (profile.efficiency ?? 1) * 0.08), 0.74, 1.38) : 1;
    const absorbMobilityMultiplier = clamp(1 - absorbCommitment01 * (0.19 * deep + 0.22 * inner + 0.27 * membrane), 0.70, 1);
    const stabilizeCommitment01 = demand.stabilizeCommitment01 ?? 0;
    const stabilizeCoherenceMultiplier = profile.active ? clamp((profile.stability ?? 1) * (0.82 + (profile.efficiency ?? 1) * 0.18) * fatigueFactor, 0.66, 1.48) : 1;
    const stabilizeMobilityMultiplier = clamp(1 - stabilizeCommitment01 * (0.15 * deep + 0.21 * inner + 0.30 * membrane), 0.66, 1);
    const currentInput = frameState.input ?? {};
    const activeVerbMobilityMultiplier = currentInput.absorbHeld && currentInput.stabilizeHeld
      ? Math.min(absorbMobilityMultiplier, stabilizeMobilityMultiplier)
      : currentInput.absorbHeld
        ? absorbMobilityMultiplier
        : currentInput.stabilizeHeld
          ? stabilizeMobilityMultiplier
          : 1;

    const rawBoostAcceleration = (profile.output ?? 1) * (profile.response ?? 1) * fatigueFactor;
    const rawBoostSpeed = (profile.output ?? 1) * (0.90 + (profile.response ?? 1) * 0.10) * fatigueFactor;
    const boostAccelerationMultiplier = profile.active ? clamp(rawBoostAcceleration, 0.80, 1.34) : 1;
    const boostSpeedMultiplier = profile.active ? clamp(rawBoostSpeed, 0.82, 1.24) : 1;

    const risk01 = profile.active
      ? clamp01((1.12 - (profile.stability ?? 1)) / 0.5) * (0.35 + (1 - reserve) * 0.65)
      : 0;

    frameState.corePerformance = {
      pass: "HC-027C",
      active: Boolean(profile.active),
      owner: "CoreRadialPerformanceSystem",
      sourceOwner: "CoreEmbodimentSystem / spatialCoreChemistry",
      law: "radial_anatomy_blends_reserve_control_output_without_changing_3_6_12_engine_geometry",
      topologyId: profile.topologyId,
      topologyLabel: profile.topologyLabel,
      distribution: profile.distribution,
      personality: profile.personality,
      dominantZone: profile.dominantZone,
      weights: {
        deep: round(profile.weights.deep),
        inner: round(profile.weights.inner),
        membrane: round(profile.weights.membrane)
      },
      traits: {
        output: round(profile.output),
        response: round(profile.response),
        enduranceCapacity: round(profile.enduranceCapacity),
        recovery: round(profile.recovery),
        efficiency: round(profile.efficiency),
        stability: round(profile.stability)
      },
      endurance: {
        reserve01: round(reserve),
        reservePercent: Math.round(reserve * 100),
        demand01: round(profile.demand01 ?? 0),
        drainPerSecond: round(profile.drainPerSecond ?? 0, 4),
        recoveryPerSecond: round(profile.recoveryPerSecond ?? 0, 4),
        fatigueFactor: round(fatigueFactor),
        instabilityRisk01: round(risk01),
        coordination: profile.coordination ?? null
      },
      movementModifiers: {
        boostAccelerationMultiplier: round(boostAccelerationMultiplier),
        boostSpeedMultiplier: round(boostSpeedMultiplier),
        normalMovementMultiplier: 1,
        verbCommitmentMovementMultiplier: round(activeVerbMobilityMultiplier),
        appliesToBoostOnly: false,
        normalMovementUnaffectedWhenNoVerbCommitted: true
      },
      verbModifiers: {
        pass: "HC-027J2",
        law: "radial_physiology_continuously_shapes_verb_output_cost_control_and_recovery",
        pulse: {
          chargeRateMultiplier: round(pulseChargeRateMultiplier),
          structuralReachMultiplier: round(pulseStructuralReachMultiplier),
          responseStrengthMultiplier: round(pulseResponseStrengthMultiplier),
          recoveryBurdenMultiplier: round(pulseRecoveryBurdenMultiplier),
          echoClutterMultiplier: round(pulseEchoClutterMultiplier),
          demand01: round(demand.pulse ?? 0),
          costMultiplier: round(demand.pulseCostMultiplier ?? 1)
        },
        absorb: {
          commitment01: round(absorbCommitment01),
          powerMultiplier: round(absorbPowerMultiplier),
          progressMultiplier: round(absorbProgressMultiplier),
          mobilityMultiplier: round(absorbMobilityMultiplier),
          demand01: round(demand.absorb ?? 0),
          costMultiplier: round(demand.absorbCostMultiplier ?? 1)
        },
        stabilize: {
          commitment01: round(stabilizeCommitment01),
          coherenceMultiplier: round(stabilizeCoherenceMultiplier),
          mobilityMultiplier: round(stabilizeMobilityMultiplier),
          demand01: round(demand.stabilize ?? 0),
          costMultiplier: round(demand.stabilizeCostMultiplier ?? 1)
        },
        physiologyProfilesAreContinuousBlends: true,
        arbitraryZoneBuffTableAdded: false
      },
      topologyChangeCount: this.topologyChangeCount,
      gameplayAuthority: true,
      movementAuthority: false,
      movementConsumer: "PlayerMovementController",
      coreWorkPlacementAuthority: false,
      chemistryAuthority: false,
      engineArchitectureAuthority: false,
      progressionAuthority: false,
      growthAuthority: false,
      randomFailureEnabled: false,
      misfireEnabled: false,
      redlineEnabled: false,
      lastEvent: this.lastEvent
    };

    frameState.corePerformance.stabilizeSample = publishCoreStabilizeSample(frameState);

    this.playerRoot.userData.coreRadialPerformance = {
      topologyId: profile.topologyId,
      personality: profile.personality,
      reservePercent: Math.round(reserve * 100),
      boostAccelerationMultiplier: round(boostAccelerationMultiplier),
      boostSpeedMultiplier: round(boostSpeedMultiplier)
    };
  }
}
