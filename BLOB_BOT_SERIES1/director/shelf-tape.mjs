import { retained, sample, stageShelf } from './shelf-stage.mjs';

const SIM_EPSILON = 1e-9;
const PAD_NEUTRAL = Object.freeze({ lt: 0, rt: 0 });
const transitions = (last, current) => last?.ready !== current?.ready || last?.phase !== current?.phase
  || last?.reason !== current?.reason || Boolean(last?.effect) !== Boolean(current?.effect);

function marker(color) {
  let cue = document.querySelector('#director-sync');
  if (!cue) {
    cue = document.createElement('div');
    cue.id = 'director-sync';
    cue.style.cssText = 'position:fixed;left:0;bottom:0;width:24px;height:24px;z-index:2147483647;pointer-events:none';
    document.body.append(cue);
  }
  cue.style.background = color;
}

export function installShelfTrial(runtime, scenario, mode, pad, { playable = false } = {}) {
  if (!['input', 'objective'].includes(mode)) throw new Error('Unknown comparison mode');
  const evidence = { start: null, replayAnchor: null, final: null, samples: [], changes: [],
    policy: mode, actions: {}, probes: [], pressureDose: 0, currentDose: 0, acceptedImprintGain: 0 };
  const registry = runtime.registry;
  const original = registry.update;
  let active = false;
  let elapsed = 0;
  let stoppingAt = null;
  let lastControl;
  let lastFlow;
  const anchor = () => ({ wallMs: performance.now(), runtimeSeconds: runtime.frameState.runtimeSeconds });
  const returnControl = () => {
    Object.assign(pad, PAD_NEUTRAL);
    registry.update = original;
  };
  const ready = readyData => {
    evidence.start = readyData;
    evidence.replayAnchor = anchor();
    if (playable) {
      evidence.status = 'NOT_EXERCISED';
      returnControl();
      return;
    }
    active = true;
    marker('#fa00fa');
  };

  registry.update = function observe(dt, frame) {
    if (!evidence.start) {
      ready(stageShelf(runtime, scenario));
    }
    if (!active) return original.call(this, dt, frame);
    const rules = scenario.acceptance;
    const requestAt = 0.45;
    const upper = mode === 'input' ? requestAt + rules.heldSeconds : requestAt + rules.objectiveLimitSeconds;
    if (stoppingAt === null && (elapsed >= upper - SIM_EPSILON
      || (mode === 'objective' && evidence.pressureDose >= rules.dose))) {
      stoppingAt = elapsed;
      evidence.releaseCommand = anchor();
    }
    const control = {
      lt: stoppingAt === null ? scenario.input.stabilize : 0,
      rt: stoppingAt === null && elapsed + SIM_EPSILON >= requestAt ? scenario.input.demand : 0
    };
    Object.assign(pad, control);
    if (control.lt !== lastControl?.lt || control.rt !== lastControl?.rt) {
      evidence.probes.push({ ...anchor(), elapsed, ...control });
      lastControl = control;
    }

    const result = original.call(this, dt, frame);
    const data = sample(runtime);
    const flow = data.flow;
    const effect = flow?.effect;
    const sameStep = effect && data.step && ['hostId', 'cellId', 'mountSequence', 'frame', 'substep']
      .every(key => effect[key] === data.step[key]);
    elapsed += dt;
    evidence.samples.push(data);
    if (data.aim?.targetId === 'silt_porosity_shelf') evidence.actions.canonical_selection ??= data.step;
    if (data.input.flowDemand > 0 && data.input.flowSequence > 0 && !data.input.absorb) evidence.actions.analog_flow_request ??= data.step;
    if (sameStep && effect.acceptedCurrent01 > 0) {
      evidence.actions.accepted_current ??= data.step;
      evidence.pressureDose += effect.pressure01 * dt;
      evidence.currentDose += effect.acceptedCurrent01 * dt;
      evidence.acceptedImprintGain += effect.after.imprint - effect.before.imprint;
      if (effect.materialTransferred || effect.progressionCredit || effect.hostReceipt) {
        evidence.invariantViolation = 'Receiver reported an out-of-scope side effect';
      }
    }
    if (stoppingAt !== null && !data.input.flowDemand && !flow?.effect && !data.input.stabilize) {
      evidence.actions.release ??= data.step;
    }
    if (transitions(lastFlow, flow)) evidence.changes.push({ step: data.step, elapsed, wallMs: data.wallMs,
      phase: flow?.phase ?? null, reason: flow?.reason ?? null, result: Boolean(effect) });
    lastFlow = flow;
    if (stoppingAt !== null && elapsed >= stoppingAt + rules.recoverySeconds) {
      evidence.actions.recovery_window = data.step;
      evidence.final = { state: data, retained: retained(runtime), elapsed, stoppingAt };
      evidence.end = anchor();
      marker('#00fafa');
      active = false;
      returnControl();
    }
    return result;
  };
  return evidence;
}
