import { localChemistryTransitionReason } from '../chemistry/LocalChemistryContextSystem.js';
import { readFlowStep } from '../interaction/SiltFlowContract.js';

const id = value => typeof value === 'string' && value && value !== 'none' ? value : null;
const number = value => Number.isFinite(value) ? value : null;
const stampKeys = ['hostId', 'cellId', 'mountSequence', 'frame', 'substep'];
const sameStep = (a, b) => Boolean(a && b && stampKeys.every(key => a[key] === b[key]));

function observationStep(sample) {
  return Object.freeze(Object.fromEntries(stampKeys.map(key => [key, sample[key]])));
}

function contextOf(frame) {
  const step = readFlowStep(frame);
  const cameras = [frame.inspectionCamera, frame.tightInspectionCamera];
  const transition = localChemistryTransitionReason(frame);
  let mode = 'world';
  if (frame.statusPage?.open) mode = 'menu';
  else if (transition) mode = 'transition';
  else if (cameras.some(camera => camera?.coreWorkActive)) mode = 'core_work';
  else if (cameras.some(camera => camera?.active)) mode = 'inspection';
  else if (!step || frame.firstSliceRuntimeMount?.activeRuntimeCellId !== step.cellId) mode = 'unmounted';
  return Object.freeze({ mode, transition: transition ?? null, step: step && Object.freeze(step),
    frame: number(frame.frame), substep: frame.runtimeSimulationSubstepIndex ?? 0 });
}

function ownerRan(frame, name) {
  const execution = frame.runtimeExecution;
  return execution?.frame === frame.frame && execution.executedSystemIds?.includes(name);
}

function targetOf(frame, context) {
  if (context.mode !== 'world' || !ownerRan(frame, 'targetingSystem')) return null;
  const aim = frame.targeting;
  const selected = aim?.relationshipActive ? aim.relationshipTargetId
    : aim?.attentionActive ? aim.attentionTargetId : null;
  if (!aim?.active || !id(selected) || aim.targetId !== selected) return null;
  return Object.freeze({ owner: 'TargetingSystem', id: selected, label: aim.targetLabel ?? selected,
    phase: aim.relationshipActive ? aim.relationshipPhase : aim.attentionPhase,
    relationship: Boolean(aim.relationshipActive), attentionSequence: number(aim.attentionSequence),
    relationshipSequence: aim.relationshipActive ? number(aim.relationshipSequence) : null });
}

function coreOf(frame, context) {
  const core = frame.corePerformance;
  const layout = frame.spatialCoreChemistry;
  const placements = (layout?.placements ?? []).map(piece => Object.freeze({
    id: piece.pieceId, family: piece.family, zone: piece.zoneId
  }));
  return Object.freeze({ owner: 'CoreRadialPerformanceSystem', reserve01: number(core?.endurance?.reserve01),
    reservePercent: number(core?.endurance?.reservePercent), stability: number(core?.traits?.stability),
    phaseCount: number(frame.coreEngine?.phaseCount), topologyId: id(layout?.topology?.id ?? core?.topologyId),
    distribution: layout?.topology?.distribution ?? core?.distribution ?? null,
    placements: Object.freeze(placements),
    selectedPiece: context.mode === 'core_work' ? id(frame.coreWorkManipulation?.selectedPieceId) : null });
}

function flowDelivery(result) {
  if (!result || !(result.acceptedCurrent01 > 0)) return null;
  return Object.freeze({ owner: result.owner, step: observationStep(result),
    actionSequence: result.actionSequence, intendedTarget: result.targetId, actualRecipient: result.receiverId,
    current01: result.acceptedCurrent01, pressure01: result.pressure01, resistance01: result.resistance01,
    retainedImprintAfter: result.after?.imprint ?? null });
}

function materialLaunch(event) {
  if (!event) return null;
  return Object.freeze({ owner: 'SiltPressureRouteSystem', step: observationStep(event), grain: event.unitId,
    generation: event.generation, sequence: event.chargeSequence, intendedTarget: event.intendedTargetId,
    actualRecipient: event.actualRecipientId });
}

function grainContacts(events) {
  return Object.freeze(events.map(event => Object.freeze({ owner: 'SiltTrajectoryMemory',
    step: observationStep(event), grain: event.unitId, generation: event.generation, releaseSequence: event.releaseSequence,
    actualRecipient: event.receiverId, removedInwardSpeed: event.inwardSpeedRemoved, response: event.response,
    id: event.deduplicationId })));
}

/** Read-only UI02 view. Scheduling and all action, physics, and history writes stay with their owners. */
export function projectPlayerInformation(frame) {
  const context = contextOf(frame);
  const world = context.mode === 'world';
  const { step } = context;
  const input = world ? frame.input ?? {} : {};
  const verb = world && ownerRan(frame, 'verbCompositionSystem') ? frame.verbComposition : null;
  const target = targetOf(frame, context);
  const mount = frame.firstSliceRuntimeMount;
  const route = frame.siltPressureRoute;
  const siltMounted = world && mount?.activeSystemIds?.includes('siltPressureRouteSystem')
    && ownerRan(frame, 'siltPressureRouteSystem') && route?.active;
  const launch = siltMounted ? route.materialLaunch : null;
  const heldId = siltMounted ? id(route.siltGrip?.heldId) : null;
  const custody = heldId && route.materialIdentity?.records?.find(record => record.id === heldId && record.owner === 'grip');
  const heldMotion = route?.heldMaterialMotion?.acceptedMotion?.current;
  const generation = heldMotion?.unitId === heldId && sameStep(heldMotion, step) ? number(heldMotion.generation) : null;
  const flow = world && sameStep(frame.coreFlow?.step, step) ? frame.coreFlow : null;
  const acceptedFlow = flow?.contactValid && sameStep(flow.result, step)
    && flow.result.actionSequence === flow.actionSequence && flow.result.targetId === target?.id
    ? flowDelivery(flow.result) : null;
  const acceptedLaunch = sameStep(launch?.lastCommitment, step) ? materialLaunch(launch.lastCommitment) : null;
  // History can remain available on remount, but only inside its original Host.
  const sameHost = sample => Boolean(step && sample?.hostId === step.hostId);
  const contactHistory = (route?.siltTrajectory?.freeMaterialContacts ?? []).filter(sameHost);
  const liveContacts = siltMounted ? contactHistory.filter(event => sameStep(event, step)) : [];
  const oldFlow = sameHost(frame.coreFlow?.lastResult) ? flowDelivery(frame.coreFlow.lastResult) : null;
  const oldLaunch = sameHost(route?.materialLaunch?.lastCommitment) ? materialLaunch(route.materialLaunch.lastCommitment) : null;
  const surface = world && ownerRan(frame, 'coreSurfaceTruthSystem') ? frame.coreSurfaceTruth : null;
  const host = step && frame.hostCondition?.hostId === step.hostId
    && frame.hostCondition.sampledAtSeconds === frame.runtimeSeconds ? frame.hostCondition : null;
  const routeViscosity = world && ownerRan(frame, 'playerMovement') ? number(frame.playerKinematics?.viscosity) : null;
  return Object.freeze({
    schemaVersion: 1, context,
    core: coreOf(frame, context),
    target,
    intent: Object.freeze({ owner: 'InputSystem', chord: verb?.chord ?? 'idle',
      pulse: Boolean(input.pulseHeld || input.pulsePressed), absorb: Boolean(input.absorbHeld),
      stabilize: Boolean(input.stabilizeHeld), flowDemand01: number(input.flowDemand01) ?? 0 }),
    attempted: Object.freeze({ pulseEvent: input.pulsePressed ? number(input.pulseEventId) : null,
      flowAction: flow?.demand01 > 0 ? number(flow.actionSequence) : null,
      launch: Boolean(launch?.attempted) }),
    heldMaterial: custody ? Object.freeze({ owner: 'SiltPressureRouteSystem', id: heldId,
      generation, custody: custody.owner }) : null,
    eligibility: Object.freeze({
      flow: flow ? Object.freeze({ ready: flow.ready, reason: flow.reason, geometricContact: flow.contactValid }) : null,
      launch: launch ? Object.freeze({ ready: launch.ready, reason: launch.rejectionReason }) : null
    }),
    accepted: Object.freeze({ flow: acceptedFlow, launch: acceptedLaunch, freeMaterial: grainContacts(liveContacts) }),
    contact: surface?.valid ? Object.freeze({ owner: 'CoreSurfaceTruthSystem', surface: surface.surfaceId,
      eligible: surface.mechanicalEligible, attached: Boolean(frame.playerAttachment?.active) }) : null,
    localEnvironment: Object.freeze({ cell: step?.cellId ?? null, hostCondition: host?.phase ?? null,
      hostPressure01: number(host?.amplitude), viscosityIndex: routeViscosity }),
    history: Object.freeze({ lastFlowDelivery: oldFlow, lastDirectedRelease: oldLaunch,
      lastFreeMaterialContact: grainContacts(contactHistory.slice(-1))[0] ?? null })
  });
}

export function currentPlayerInformation(frame) {
  const model = frame.playerInformation;
  return model && model.context.frame === frame.frame && model.context.substep === (frame.runtimeSimulationSubstepIndex ?? 0)
    && model.context.step?.hostId === frame.activeHostId && model.context.step?.cellId === frame.activeCellId
    && model.context.step?.mountSequence === frame.firstSliceRuntimeMount?.mountSequence ? model : null;
}
