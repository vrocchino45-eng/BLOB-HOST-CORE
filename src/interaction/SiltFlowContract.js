import { localChemistryTransitionReason } from '../chemistry/LocalChemistryContextSystem.js';

export const SILT_FLOW_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
export const SILT_FLOW_SITE = 'silt_porosity_shelf';
export const MAX_FLOW_REACH = 1.15;
export const MAX_FLOW_STEP = 0.08;
export const clampFlow = value => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

export function inSiltFlowWorld(frame) {
  return siltFlowUnavailableReason(frame) === null;
}

export function siltFlowUnavailableReason(frame) {
  const mount = frame.firstSliceRuntimeMount;
  if (frame.activeCellId !== SILT_FLOW_CELL) return 'outside_silt';
  if (mount?.activeRuntimeCellId !== SILT_FLOW_CELL
    || mount.activeSystemIds?.includes('siltPressureRouteSystem') !== true) return 'silt_unmounted';
  if (frame.statusPage?.open) return 'menu_open';
  const transition = localChemistryTransitionReason(frame);
  if (transition) return transition;
  const cameras = [frame.inspectionCamera, frame.tightInspectionCamera];
  if (cameras.some(camera => camera?.coreWorkActive)) return 'core_work';
  return cameras.some(camera => camera?.active) ? 'inspection' : null;
}

export function hasSiltFlowTarget(frame) {
  const aim = frame.targeting;
  return aim?.active === true && aim.targetId === SILT_FLOW_SITE
    && aim.attentionActive === true && aim.attentionTargetId === SILT_FLOW_SITE;
}

export function readFlowStep(frame) {
  const mountSequence = frame.firstSliceRuntimeMount?.mountSequence;
  const substep = frame.runtimeSimulationSubstepIndex ?? 0;
  if (typeof frame.activeHostId !== 'string' || !frame.activeHostId || frame.activeHostId === 'none'
    || ![mountSequence, frame.frame, substep].every(value => Number.isSafeInteger(value) && value >= 0)) return null;
  return { hostId: frame.activeHostId, cellId: frame.activeCellId, mountSequence, frame: frame.frame, substep };
}

export function readFlowAim(frame) {
  if (!hasSiltFlowTarget(frame)) return null;
  const aim = frame.targeting;
  if (!Number.isSafeInteger(aim.attentionSequence) || aim.attentionSequence <= 0) return null;
  return { targetId: aim.targetId, attentionSequence: aim.attentionSequence,
    relationshipSequence: aim.relationshipActive ? aim.relationshipSequence : null };
}

export function readFlowCoreProfile(frame) {
  const radial = frame.corePerformance;
  const trait = value => Number.isFinite(value) ? Math.max(0.55, Math.min(1.6, value)) : 1;
  return {
    topologyId: radial?.topologyId ?? 'forming_topology',
    phaseCount: frame.coreEngine?.phaseCount ?? 3,
    reserve01: clampFlow(radial?.endurance?.reserve01 ?? 1),
    stability: trait(radial?.traits?.stability),
    recovery: trait(radial?.traits?.recovery),
    enduranceCapacity: trait(radial?.traits?.enduranceCapacity)
  };
}

// The result is a point on the authored disc, only reachable from its outward face.
export function contactFlowPatch(patch, origin, direction, reach) {
  return inspectFlowPatchContact(patch, origin, direction, reach).contact;
}

export function inspectFlowPatchContact(patch, origin, direction, reach) {
  if (!origin?.isVector3 || !direction?.isVector3 || !Number.isFinite(reach)
    || reach <= 0 || reach > MAX_FLOW_REACH || Math.abs(direction.lengthSq() - 1) > 1e-6) {
    return { reason: 'invalid_contact', contact: null };
  }
  const depth = origin.clone().sub(patch.center).dot(patch.normal);
  const facing = -direction.dot(patch.normal);
  if (!(depth > 0.015) || !(facing >= 0.35)) return { reason: 'wrong_face', contact: null };
  const distance = depth / facing;
  if (distance > reach) return { reason: distance > MAX_FLOW_REACH ? 'out_of_reach' : 'extending', contact: null };
  const point = origin.clone().addScaledVector(direction, distance);
  return point.distanceToSquared(patch.center) <= patch.radius ** 2
    ? { reason: 'contact', contact: { point, facing } }
    : { reason: 'missed_patch', contact: null };
}

export class SiltFlowTrigger {
  constructor() {
    this.device = null;
    this.owner = null;
    this.sequence = 0;
  }

  update(value, device, eligible) {
    const demand = clampFlow(value);
    const changedDevice = device !== this.device;
    this.device = device;
    if (!device || demand === 0) this.owner = null;
    else if (changedDevice) this.owner = eligible ? 'release_required' : 'absorb';
    else if (this.owner === null) {
      this.owner = eligible ? 'flow' : 'absorb';
      if (eligible) this.sequence++;
    } else if (this.owner === 'flow' && !eligible) {
      this.owner = 'release_required';
    }

    return {
      flowDemand01: this.owner === 'flow' ? demand : 0,
      flowActionSequence: this.sequence,
      flowOwnsTrigger: this.owner === 'flow' || this.owner === 'release_required'
    };
  }
}
