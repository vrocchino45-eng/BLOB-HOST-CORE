import { inSiltFlowWorld, SILT_FLOW_CELL } from '../interaction/SiltFlowContract.js';

const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const CASCADE_CUE_SECONDS = 2.5;

export const HUB_RETURN_BOUNDARY_BY_CELL = {
  [GRAVE]: 'grave_to_hub',
  [VASCULAR]: 'vascular_to_hub',
  [SILT_FLOW_CELL]: 'silt_to_hub'
};

const FLOW_BLOCKS = {
  receiver_unavailable: 'Shelf receiver unavailable',
  out_of_reach: 'Move closer to the Shelf',
  align_core: 'Align the Core with the Shelf',
  wrong_face: 'Approach the exposed Shelf face',
  missed_patch: 'Aim the crown at the Shelf patch',
  obstructed: 'Clear the crown’s path to the Shelf',
  receiver_rejected: 'Shelf contact · current declined',
  invalid_contact: 'Shelf contact lost · release RT'
};

const shortNumber = (value, digits = 3) =>
  Number.isFinite(value) ? value.toFixed(digits) : 'unavailable';

function isVascularEffect(sample) {
  return Boolean(sample?.authority === 'HostConnectionReceiptLedger'
    && sample.kind === 'vascular_membrane_load_change_applied'
    && sample.receiptId && sample.parentSiltReceiptId
    && Number.isFinite(sample.appliedDelta) && sample.appliedDelta > 0 && sample.materialTransfer === false);
}

export function readCascadeLabel(frame) {
  const cellId = frame.activeCellId;
  if (cellId === SILT_FLOW_CELL && frame.siltPressureRoute?.active) {
    const receipt = frame.hostConnections?.records?.at(-1);
    if (receipt?.kind !== 'silt_material_disturbance_observed' || receipt.sourceCellId !== cellId || !receipt.id
      || receipt.id !== frame.hostConnections.lastReceiptId || receipt.materialTransfer !== false) return null;
    const decision = frame.siltPressureRoute.transactionTrace?.events
      ?.findLast(entry => entry.sequence === receipt.sourceReceiptSequence);
    const fresh = Number.isSafeInteger(decision?.frame) && frame.frame - decision.frame >= 0
      && frame.frame - decision.frame <= 1;
    return {
      receiptId: receipt.id, cueSeconds: fresh ? CASCADE_CUE_SECONDS : 0,
      consequence: 'Silt signal · disturbance released',
      history: 'Silt signal · release recorded',
      details: [`Source grain: ${receipt.subjectId}`, `Silt receipt: ${receipt.id}`]
    };
  }

  if (cellId === VASCULAR && frame.vascularRhythmRoute?.active) {
    const route = frame.vascularRhythmRoute;
    const effect = route.siltArrivalPresentation;
    if (!isVascularEffect(effect)) return null;
    const receiver = route.siltSignalResponse;
    return {
      receiptId: effect.receiptId,
      cueSeconds: effect.receiptId === route.presentationTrace?.vis1?.arrivalReceiptId
        && Number.isFinite(effect.ageSeconds) ? CASCADE_CUE_SECONDS - effect.ageSeconds : 0,
      consequence: 'Silt signal · membrane responded',
      history: 'Silt signal · Vascular response recorded',
      details: [
        `Silt receipt: ${effect.parentSiltReceiptId}`, `Vascular effect: ${effect.receiptId}`,
        `Applied membrane load: +${shortNumber(effect.appliedDelta)}`,
        `Current multiplier: ×${shortNumber(receiver?.directionalFlowScale)}`,
        'The signal passed through Host tissue. The grain stayed in Silt.'
      ]
    };
  }

  if (cellId === GRAVE && frame.graveMemoryRoute?.active) {
    const memory = frame.graveVascularEffectMemory;
    const effect = frame.graveMemoryRoute.vascularMemoryPresentation;
    if (memory?.active !== true || !(memory.memoryPressure > 0)
      || effect?.authority !== 'GraveVascularEffectMemory'
      || effect.kind !== 'positive_vascular_memory_retained' || !(effect.memoryDelta > 0)
      || !effect.parentSiltReceiptId || !effect.receiptId || effect.materialTransfer !== false) return null;
    return {
      receiptId: effect.receiptId,
      cueSeconds: effect.echo?.arrivalStrength > 0 && Number.isFinite(effect.ageSeconds)
        ? CASCADE_CUE_SECONDS - effect.ageSeconds : 0,
      consequence: 'Silt signal · memory settled',
      history: memory.gameplayConsequenceApplied
        ? 'Silt signal · memory assisted recovery' : 'Silt signal · memory retained',
      details: [
        `Silt receipt: ${effect.parentSiltReceiptId}`, `Vascular effect: ${effect.receiptId}`,
        `Retained memory: ${shortNumber(memory.memoryPressure)}`,
        `Recovery multiplier: ×${shortNumber(memory.recoveryCoupling?.multiplier)}`,
        memory.gameplayConsequenceApplied ? 'Grave applied the recovery effect.' : 'Recovery effect is available through the local relationship.'
      ]
    };
  }
  return null;
}

export function hasContextualWorldLabels(frame) {
  const cellId = frame.activeCellId;
  return Boolean(frame.quickLookInspector?.coreLabelsEnabled
    && (cellId === HUB || HUB_RETURN_BOUNDARY_BY_CELL[cellId])
    && !frame.statusPage?.open
    && !frame.inspectionCamera?.active && !frame.inspectionCamera?.coreWorkActive
    && !frame.tightInspectionCamera?.active && !frame.tightInspectionCamera?.coreWorkActive
    && frame.input?.primaryActionContext !== 'core_work');
}

function readSiltEnvironmentLabel(silt, mountSequence) {
  const habitat = silt?.habitatFoundation?.currentHabitatId;
  if (habitat === 'reservoir' || habitat === 'veins') {
    const cycle = silt.livingMaterialCycle;
    return cycle?.active && cycle.flowBoostRemaining > 0 ? 'Seep transport boosted' : undefined;
  }
  const garden = silt?.gardenSeepExchange;
  if (habitat !== 'garden' || !(garden?.imprint > 0)) return;

  const liveArrival = garden.arrivalSecondsRemaining > 0 && Number.isSafeInteger(mountSequence)
    && garden.lastDelivery?.mountSequence === mountSequence;
  return liveArrival ? 'Sediment arrived' : 'Garden imprint retained';
}

export function readContextualWorldLabel(frame, { action, targetLabel, cascade, freshConsequence }) {
  if (!hasContextualWorldLabels(frame)) return null;
  const { activeCellId: cellId, targeting: target } = frame;
  const boundary = frame.localCellBoundaryMorphById?.[HUB_RETURN_BOUNDARY_BY_CELL[cellId]];
  const nearReturn = boundary?.returnPrerequisitesMet
    && boundary.distance <= boundary.proximityReturnGuard?.departureDistance;
  const silt = cellId === SILT_FLOW_CELL && frame.siltPressureRoute?.active ? frame.siltPressureRoute : null;
  const vascular = cellId === VASCULAR && frame.vascularRhythmRoute?.active ? frame.vascularRhythmRoute : null;
  const grave = cellId === GRAVE && frame.graveMemoryRoute?.active ? frame.graveMemoryRoute : null;
  const graveRecovering = grave?.warning === 'residue_recoil_recovering';
  const flow = inSiltFlowWorld(frame) ? frame.coreFlow : null;
  const blockedFlow = flow && (flow.demand01 > 0 || flow.reason === 'target_changed')
    ? FLOW_BLOCKS[flow.reason] : null;

  if (cellId === HUB || frame.localCellBoundaryMorph?.active || frame.firstSliceReturnTraversal?.transitionActive
    || nearReturn || silt?.compressionFailure || vascular?.desynchronized
    || (grave?.warning && grave.warning !== 'none' && !graveRecovering)) return { tier: 'instruction', text: action };
  if (graveRecovering) {
    const memory = frame.graveVascularEffectMemory;
    const holding = frame.input?.stabilizeHeld;
    const assisted = memory?.active && memory.gameplayConsequenceApplied;
    if (holding) return {
      tier: 'interaction', text: assisted && memory.recoveryCoupling?.eligibleNow
        ? 'Silt signal · aiding Grave recovery' : 'Grave residue · recovering'
    };
    return {
      tier: 'instruction', text: 'Hold Stabilize on the residue',
      history: assisted ? cascade?.history : undefined
    };
  }
  if (blockedFlow) return { tier: 'instruction', text: blockedFlow };
  if (flow?.overloaded && flow.result?.acceptedCurrent01 > 0) {
    return { tier: 'instruction', text: 'Shelf overload · current limited' };
  }

  if (silt?.siltGrip?.heldId) return {
    tier: 'interaction', text: silt.siltContact?.braced ? 'Silt grain · braced contact' : 'Silt grain · gripped'
  };
  if (flow?.result?.acceptedCurrent01 > 0) return {
    tier: 'interaction', text: flow.result.resistance01 > 0
      ? 'Shelf · current accepted, resistance felt' : 'Shelf · current accepted'
  };
  if (flow?.contactValid) return { tier: 'interaction', text: 'Shelf contact · waiting for current' };
  if (flow?.phase === 'recovering' || flow?.phase === 'retracting') {
    return { tier: 'interaction', text: flow.reason === 'target_changed' ? 'Shelf contact lost' : 'Flow released · crown returning' };
  }
  if (flow?.demand01 > 0 && flow.reason === 'extending') {
    return { tier: 'interaction', text: 'Crown extending · keep facing the Shelf' };
  }
  if (silt?.pressureRelationshipHeld) return { tier: 'interaction', text: 'Silt ribs · bracing pressure' };
  if (vascular?.stage === 'project_through_stabilized_current' && vascular.currentRelationshipReady) {
    return { tier: 'interaction', text: 'Vascular current · ready to Pulse' };
  }
  if (vascular?.currentRelationshipHeld) return { tier: 'interaction', text: 'Vascular current · Stabilize holding' };
  const control = frame.verbComposition?.control;
  if (target?.relationshipActive && control?.strength01 > 0 && control.targetId === target.relationshipTargetId
    && control.relationshipSequence === target.relationshipSequence) {
    return { tier: 'interaction', text: `${targetLabel} · Stabilize holding` };
  }
  if (freshConsequence) return { tier: 'consequence', text: cascade.consequence };
  if (flow?.ready) return {
    tier: 'primary', text: flow.reason === 'ready' ? 'Porosity Shelf · release, then hold RT' : 'Porosity Shelf · hold RT',
    history: cascade?.history
  };
  if (silt && frame.siltMaterialAim?.candidateId) {
    return { tier: 'primary', text: 'Silt grain · LT + A to grip', history: cascade?.history };
  }
  const history = cascade?.history ?? readSiltEnvironmentLabel(silt, frame.firstSliceRuntimeMount?.mountSequence);
  if (target?.active && (target.attentionActive || target.relationshipActive) && targetLabel) {
    return { tier: 'primary', text: targetLabel, history };
  }
  return { tier: 'primary', text: action, history };
}
