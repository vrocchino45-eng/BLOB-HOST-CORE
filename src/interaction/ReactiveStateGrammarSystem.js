import { materialInScope, materialVisible, materialScopeActive } from './MaterialResponseScope.js';
import { readPriorCoreStabilizeSample } from '../player/CoreStabilizeSample.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
const clamp01 = (value) => clamp(value, 0, 1);

const STATE_THRESHOLDS = Object.freeze({
  coherentMax: 0.30,
  strainedMax: 0.52,
  unstableMax: 0.72
});

const STATE_CUES = Object.freeze({
  coherent: Object.freeze({ geometryCue: "closed_coherent_form", motionCue: "settled_breath" }),
  strained: Object.freeze({ geometryCue: "vibrating_closed_form", motionCue: "asymmetric_wobble" }),
  unstable: Object.freeze({ geometryCue: "uneven_phase_form", motionCue: "propagating_oscillation" }),
  failing: Object.freeze({ geometryCue: "open_broken_form", motionCue: "coherence_loss" })
});

const CHORD_RESPONSE = Object.freeze({
  idle: { pulseStrain: 1, absorbStrain: 1, stabilizeRepair: 1, containment: 0 },
  project: { pulseStrain: 1, absorbStrain: 1, stabilizeRepair: 1, containment: 0 },
  draw: { pulseStrain: 1, absorbStrain: 1, stabilizeRepair: 1, containment: 0 },
  cohere: { pulseStrain: 1, absorbStrain: 1, stabilizeRepair: 1, containment: 0.16 },
  cohere_project: { pulseStrain: 0.42, absorbStrain: 1, stabilizeRepair: 1.08, containment: 0.34 },
  cohere_draw: { pulseStrain: 1, absorbStrain: 0.44, stabilizeRepair: 1.10, containment: 0.38 },
  exchange: { pulseStrain: 0.82, absorbStrain: 0.92, stabilizeRepair: 1, containment: 0.08 },
  full_system: { pulseStrain: 0.20, absorbStrain: 0.28, stabilizeRepair: 0.24, containment: 0.72 }
});

/**
 * HC030A — Reactive State Grammar.
 *
 * Converts authored `instabilityRisk` into a live, readable material condition.
 * It owns no targeting, route, progression or primitive verb authority. Existing
 * Pulse / Absorb / Stabilize intent perturbs one HC029A retained relationship;
 * the target then answers from its current condition rather than behaving as an
 * invariant prop.
 */
export class ReactiveStateGrammarSystem {
  constructor({ frameState, chemObjectSystem, scope = null, repairTrialEnabled = false }) {
    if (!frameState) throw new Error("[ReactiveStateGrammarSystem] frameState is required.");
    if (!chemObjectSystem) throw new Error("[ReactiveStateGrammarSystem] chemObjectSystem is required.");
    this.frameState = frameState;
    this.chemObjectSystem = chemObjectSystem;
    this.scope = scope;
    Object.defineProperty(this, 'repairTrialEnabled', { value: repairTrialEnabled === true, writable: false });
    this.lastRepairFactor = 1;
    this.states = new Map();
    this.lastPulseEventId = 0;
    this.stageEventSequence = 0;
    this.stateChangeCount = 0;
  }

  init() {
    this.ensureObjectStates();
    this.publish(this.frameState, "none", "idle", !this.scope);
  }

  // Retain condition history, but never leave a live focus in another region.
  // Unmounted time is paused; no catch-up or zero-dt Pulse is applied on return.
  onRuntimePrepare(frameState) { if (this.scope) this.neutralize(frameState); }
  onRuntimeMount(frameState) { if (this.scope) this.neutralize(frameState); }
  onRuntimeUnmount(frameState) { if (this.scope) this.neutralize(frameState); }

  neutralize(frameState) {
    const pulseId = frameState.input?.pulseEventId;
    if (Number.isFinite(pulseId)) this.lastPulseEventId = Math.max(this.lastPulseEventId, pulseId);
    for (const item of this.chemObjectSystem.objects) {
      if (!materialInScope(item, this.scope)) continue;
      const state = this.states.get(item.recipe.id);
      if (state) { state.activeChord = 'idle'; state.containment01 = 0; }
      delete item.root.userData.reactiveState;
      delete item.root.userData.reactivePulseAnswer;
      delete item.root.userData.reactiveAbsorbAnswer;
    }
    frameState.reactiveStateGrammarLastEvent = null;
    this.publish(frameState, 'none', 'idle', false);
  }

  update(dt, frameState = this.frameState) {
    this.lastRepairFactor = 1;
    if (this.scope && (!Number.isFinite(dt) || dt <= 0 || !materialScopeActive(frameState, this.scope))) {
      this.neutralize(frameState);
      return;
    }
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    this.ensureObjectStates();

    const composition = frameState.verbComposition ?? {};
    const targeting = frameState.targeting ?? {};
    let targetId = composition.relationshipBound
      ? (composition.targetId ?? "none")
      : targeting.relationshipActive
        ? (targeting.relationshipTargetId ?? targeting.targetId ?? "none")
        : "none";
    if (this.scope) {
      const target = this.chemObjectSystem.objects.find(item => item.recipe.id === targetId);
      const retainedId = targeting.relationshipTargetId ?? targeting.targetId;
      if (!materialInScope(target, this.scope) || !materialVisible(target)
        || !targeting.relationshipActive || retainedId !== targetId) targetId = 'none';
    }
    const chord = composition.relationshipBound && composition.targetId === targetId
      ? (composition.chord ?? "idle")
      : this.resolvePrimitiveChord(frameState.input ?? {});
    const profile = CHORD_RESPONSE[chord] ?? CHORD_RESPONSE.idle;
    const input = frameState.input ?? {};

    const pulseEventId = Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0;
    const pulseReleased = Boolean(input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId);
    if (pulseReleased) this.lastPulseEventId = pulseEventId;

    for (const item of this.chemObjectSystem.objects) {
      const state = this.ensureState(item);
      if (!state || item.absorbed || item.root.userData.absorbed) continue;
      if (this.scope && !materialVisible(item)) {
        delete item.root.userData.reactiveState;
        continue;
      }

      const ownsRelationship = targetId !== "none" && item.recipe.id === targetId;
      this.relaxTowardDisposition(state, safeDt);
      state.impulse01 = Math.max(0, state.impulse01 - safeDt * 1.65);
      state.liveStress01 = Math.max(0, state.liveStress01 - safeDt * 0.72);
      state.containment01 += ((ownsRelationship ? profile.containment : 0) - state.containment01)
        * (1 - Math.exp(-safeDt * 6.5));

      if (ownsRelationship) {
        if (pulseReleased) this.applyPulse(state, item, input, profile, chord);
        if (input.absorbHeld) this.applyAbsorb(state, item, safeDt, profile, chord);
        if (input.stabilizeHeld || input.resonanceHeld) this.applyStabilize(state, safeDt, profile, chord, frameState);
        state.activeChord = chord;
        state.lastRelationshipAge = 0;
      } else {
        state.activeChord = "idle";
        state.lastRelationshipAge += safeDt;
      }

      state.condition01 = clamp01(state.condition01);
      const priorStage = state.stage;
      state.stage = this.stageFor(state.condition01);
      state.presentedCondition01 = clamp01(
        state.condition01 * (1 - state.containment01 * 0.60)
        + state.liveStress01 * 0.08
      );
      state.deformation01 = this.deformationFor(state.presentedCondition01, state.stage);
      state.cue = STATE_CUES[state.stage];

      if (state.stage !== priorStage) {
        this.stateChangeCount += 1;
        this.stageEventSequence += 1;
        state.changeCount += 1;
        frameState.reactiveStateGrammarLastEvent = {
          eventId: this.stageEventSequence,
          objectId: item.recipe.id,
          from: priorStage,
          to: state.stage,
          condition01: state.condition01,
          presentedCondition01: state.presentedCondition01,
          authoredInstabilityRisk: state.baseline01,
          cause: state.lastCause,
          chord: state.activeChord
        };
      }

      this.publishToObject(item, state, ownsRelationship);
    }

    this.publish(frameState, targetId, chord);
  }

  ensureObjectStates() {
    for (const item of this.chemObjectSystem.objects) this.ensureState(item);
  }

  ensureState(item) {
    if (!item?.recipe?.id) return null;
    if (!materialInScope(item, this.scope)) return null;
    const id = item.recipe.id;
    if (this.states.has(id)) return this.states.get(id);

    const baseline01 = clamp01(item.recipe.chemistry?.instabilityRisk ?? 0.12);
    const state = {
      objectId: id,
      baseline01,
      condition01: baseline01,
      presentedCondition01: baseline01,
      stage: this.stageFor(baseline01),
      deformation01: this.deformationFor(baseline01, this.stageFor(baseline01)),
      impulse01: 0,
      liveStress01: 0,
      containment01: 0,
      activeChord: "idle",
      lastCause: "authored_disposition",
      lastRelationshipAge: 999,
      changeCount: 0,
      phase: this.phaseFor(id),
      cue: STATE_CUES[this.stageFor(baseline01)]
    };
    this.states.set(id, state);
    this.publishToObject(item, state, false);
    return state;
  }

  relaxTowardDisposition(state, dt) {
    // State changes should persist long enough to be read. The authored risk is a
    // disposition, not an instant reset point, so recovery/drift is intentionally slow.
    const rate = state.condition01 > state.baseline01 ? 0.030 : 0.018;
    state.condition01 += (state.baseline01 - state.condition01) * (1 - Math.exp(-dt * rate));
  }

  applyPulse(state, item, input, profile, chord) {
    const charged = input.pulseReleaseKind === "charged";
    const charge01 = clamp01(input.pulseReleaseCharge01 ?? (charged ? 0.72 : 0));
    const baseImpact = charged ? 0.105 + charge01 * 0.055 : 0.058;
    const susceptibility = 0.68 + state.baseline01 * 0.70;
    const impact = baseImpact * susceptibility * profile.pulseStrain;
    state.condition01 += impact;
    state.impulse01 = Math.max(state.impulse01, charged ? 1 : 0.66);
    state.liveStress01 = Math.max(state.liveStress01, clamp01(impact * 5.2));
    state.lastCause = chord === "cohere_project"
      ? "pulse_while_cohered"
      : chord === "exchange" || chord === "full_system"
        ? "opposed_force_pulse"
        : "pulse_impulse";
    item.root.userData.reactivePulseAnswer = this.pulseAnswerFor(state.condition01);
  }

  applyAbsorb(state, item, dt, profile, chord) {
    const difficulty = clamp01(item.recipe.chemistry?.absorbDifficulty ?? 1);
    const compatible = Boolean(item.recipe.behavior?.onAbsorb && difficulty < 0.7);
    const resistance = compatible ? 0.56 + difficulty * 0.45 : 1.0 + difficulty * 0.44;
    const strainRate = (0.036 + state.baseline01 * 0.055) * resistance * profile.absorbStrain;
    state.condition01 += strainRate * dt;
    state.liveStress01 = Math.max(state.liveStress01, clamp01(strainRate * 4.8));
    state.lastCause = chord === "cohere_draw"
      ? "contained_draw"
      : chord === "exchange" || chord === "full_system"
        ? "opposed_force_draw"
        : compatible
          ? "absorb_draw"
          : "resisted_absorb_draw";
    item.root.userData.reactiveAbsorbAnswer = compatible
      ? (state.stage === "coherent" ? "clean_yield" : "strained_yield")
      : "resistant_tension";
  }

  applyStabilize(state, dt, profile, chord, frameState = this.frameState) {
    // Use the prior accepted Core sample for the scoped scar repair. The
    // baseline comparison and rejected samples keep the original rate.
    const sample = this.repairTrialEnabled && this.scope?.cellId === 'CELL_MEMBRANE_NURSERY_001'
      && state.objectId === 'scar_contamination_plate_001' && frameState.activeCellId === this.scope.cellId
      ? readPriorCoreStabilizeSample(frameState, dt) : null;
    this.lastRepairFactor = sample?.coherenceMultiplier ?? 1;
    const repairRate = 0.205 * profile.stabilizeRepair * this.lastRepairFactor;
    const floor = Math.max(0.035, state.baseline01 * 0.22);
    state.condition01 = Math.max(floor, state.condition01 - repairRate * dt);
    state.liveStress01 = Math.max(0, state.liveStress01 - dt * 0.48);
    state.lastCause = chord === "full_system"
      ? "equilibrium_hold"
      : chord === "cohere_project"
        ? "stabilized_projection"
        : chord === "cohere_draw"
          ? "stabilized_draw"
          : "stabilize_settle";
  }

  resolvePrimitiveChord(input) {
    const pulse = Boolean(input.pulseHeld || input.pulsePressed);
    const absorb = Boolean(input.absorbHeld);
    const stabilize = Boolean(input.stabilizeHeld || input.resonanceHeld);
    if (pulse && absorb && stabilize) return "full_system";
    if (pulse && stabilize) return "cohere_project";
    if (absorb && stabilize) return "cohere_draw";
    if (pulse && absorb) return "exchange";
    if (pulse) return "project";
    if (absorb) return "draw";
    if (stabilize) return "cohere";
    return "idle";
  }

  stageFor(condition01) {
    const value = clamp01(condition01);
    if (value <= STATE_THRESHOLDS.coherentMax) return "coherent";
    if (value < STATE_THRESHOLDS.strainedMax) return "strained";
    if (value < STATE_THRESHOLDS.unstableMax) return "unstable";
    return "failing";
  }

  deformationFor(condition01, stage) {
    const value = clamp01(condition01);
    if (stage === "coherent") return value * 0.20;
    if (stage === "strained") return 0.12 + (value - STATE_THRESHOLDS.coherentMax) * 0.58;
    if (stage === "unstable") return 0.26 + (value - STATE_THRESHOLDS.strainedMax) * 0.95;
    return clamp01(0.52 + (value - STATE_THRESHOLDS.unstableMax) * 1.45);
  }

  pulseAnswerFor(condition01) {
    const stage = this.stageFor(condition01);
    if (stage === "coherent") return "clean_displacement";
    if (stage === "strained") return "wobbling_displacement";
    if (stage === "unstable") return "oscillation_propagates";
    return "coherence_breaks_under_impulse";
  }

  phaseFor(id) {
    let hash = 0;
    for (let index = 0; index < id.length; index += 1) hash = ((hash << 5) - hash + id.charCodeAt(index)) | 0;
    return ((Math.abs(hash) % 10000) / 10000) * Math.PI * 2;
  }

  publishToObject(item, state, ownsRelationship) {
    item.root.userData.reactiveState = {
      pass: "HC-030A",
      stage: state.stage,
      condition01: Number(state.condition01.toFixed(4)),
      presentedCondition01: Number(state.presentedCondition01.toFixed(4)),
      authoredInstabilityRisk: state.baseline01,
      deformation01: Number(state.deformation01.toFixed(4)),
      impulse01: Number(state.impulse01.toFixed(4)),
      liveStress01: Number(state.liveStress01.toFixed(4)),
      containment01: Number(state.containment01.toFixed(4)),
      activeRelationship: ownsRelationship,
      chord: state.activeChord,
      geometryCue: state.cue.geometryCue,
      motionCue: state.cue.motionCue,
      lastCause: state.lastCause,
      changeCount: state.changeCount,
      phase: state.phase
    };
  }

  publish(frameState, targetId, chord, includeStates = true) {
    const objects = {};
    const stageCounts = { coherent: 0, strained: 0, unstable: 0, failing: 0 };
    for (const [id, state] of this.states.entries()) {
      if (!includeStates) continue;
      if (this.scope && !materialVisible(this.chemObjectSystem.objects.find(item => item.recipe.id === id))) continue;
      const snapshot = {
        stage: state.stage,
        condition01: Number(state.condition01.toFixed(4)),
        presentedCondition01: Number(state.presentedCondition01.toFixed(4)),
        authoredInstabilityRisk: state.baseline01,
        deformation01: Number(state.deformation01.toFixed(4)),
        impulse01: Number(state.impulse01.toFixed(4)),
        liveStress01: Number(state.liveStress01.toFixed(4)),
        containment01: Number(state.containment01.toFixed(4)),
        chord: state.activeChord,
        lastCause: state.lastCause,
        phase: state.phase,
        geometryCue: state.cue.geometryCue,
        motionCue: state.cue.motionCue
      };
      objects[id] = snapshot;
      stageCounts[state.stage] += 1;
    }

    const focus = targetId !== "none" ? (objects[targetId] ?? null) : null;
    if (frameState.chemObjectState) {
      frameState.chemObjectState.reactiveTarget = targetId;
      frameState.chemObjectState.reactiveStage = focus?.stage ?? "none";
      frameState.chemObjectState.reactiveCondition01 = focus?.condition01 ?? 0;
      frameState.chemObjectState.reactiveCause = focus?.lastCause ?? "none";
    }
    frameState.reactiveStateGrammar = {
      pass: "HC-030A",
      owner: "ReactiveStateGrammarSystem",
      targetOwner: "TargetingSystem / HC029A",
      recipeDispositionSource: "chemistry.instabilityRisk",
      targetId,
      chord,
      active: Boolean(focus),
      focus,
      objects,
      stageCounts,
      stateChangeCount: this.stateChangeCount,
      thresholds: { ...STATE_THRESHOLDS },
      rules: {
        sameInputCanProduceDifferentAnswerByCondition: true,
        stateLivesOnTargetNotHud: true,
        stabilizeCanReduceInstability: true,
        pulseCanPropagateInstability: true,
        absorbCanIncreaseStrain: true,
        fullSystemContainsMoreThanItRepairs: true,
        addsNewAbility: false,
        addsNewButton: false,
        retargetsIndependently: false,
        changesRouteOrProgression: false
      }
    };
  }
}
