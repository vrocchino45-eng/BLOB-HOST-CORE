import { Vector3 } from 'three';
import { readFlowAim, readFlowStep } from '../../src/interaction/SiltFlowContract.js';

const PIECES = ['memoryImprintRoot', 'vascularFilamentRoot', 'siltAdaptationRoot'];
const DEPTH = { deep_core: 0.12, inner_body: 0.43, membrane: 0.78 };
const copy = value => value == null ? null : structuredClone(value);
const poseOffset = new Vector3();
const facing = new Vector3();
const projection = new Vector3();

function setPlacement(embodiment, pieceName, zone) {
  const piece = embodiment[pieceName];
  const { coreWorkAnchorLocal: anchor, coreWorkBasePosition: base, coreWorkOffset: offset } = piece.userData;
  const radius = embodiment.coreWorkMinimumRadius
    + (embodiment.coreWorkMaximumRadius - embodiment.coreWorkMinimumRadius) * DEPTH[zone];
  const center = anchor.clone().add(base).normalize().multiplyScalar(radius);
  offset.copy(center).sub(anchor).sub(base);
  piece.position.copy(base).add(offset);
}

export function sample(runtime) {
  const frame = runtime.frameState;
  const route = runtime.siltPressureRouteSystem;
  const patch = route.territoryExpansion?.readFlowPatch(frame);
  const actualCamera = runtime.renderCamera ?? runtime.camera;
  const patchOnScreen = patch ? projection.copy(patch.center).project(actualCamera).toArray() : null;
  const cameraVisible = patchOnScreen?.every(v => Number.isFinite(v) && v >= -1 && v <= 1) ?? false;
  const pose = runtime.playerCore.getWorldPosition(new Vector3());
  const phase = frame.coreEngine?.phaseCount;
  return {
    step: readFlowStep(frame), runtimeSeconds: frame.runtimeSeconds, wallMs: performance.now(),
    dt: frame.runtimeSimulationSubstepSeconds ?? 0, rawFrameMs: frame.runtimeFrameRawDeltaMs ?? 0,
    droppedFrameMs: frame.runtimeFrameDroppedDeltaMs ?? 0, pose: pose.toArray(),
    facing: runtime.coreEmbodimentSystem.direction.toArray(),
    attachment: frame.playerAttachment?.active === true,
    speed: frame.playerKinematics?.speed ?? 0,
    camera: { position: actualCamera.position.toArray(), rotation: actualCamera.quaternion.toArray(),
      yaw: runtime.cameraYaw, pitch: runtime.cameraPitch, near: frame.cameraReadability?.nearWorldActive === true,
      patchOnScreen, withinFrustum: cameraVisible },
    aim: readFlowAim(frame), selected: frame.targeting?.targetId ?? null, corePhaseCount: phase,
    profile: copy(frame.corePerformance?.traits), reserve: runtime.coreRadialPerformanceSystem.reserve01,
    settlement: copy(frame.siltFlowReserveSettlement),
    input: {
      stabilize: frame.input?.stabilizeHeld ?? false, absorb: frame.input?.absorbHeld ?? false,
      pulseEventId: frame.input?.pulseEventId ?? 0, flowDemand: frame.input?.flowDemand01 ?? 0,
      flowSequence: frame.input?.flowActionSequence ?? 0
    },
    flow: frame.coreFlow && {
      phase: frame.coreFlow.phase, ready: frame.coreFlow.ready, reason: frame.coreFlow.reason, contact: frame.coreFlow.contactValid,
      strain: frame.coreFlow.strain01, extension: frame.coreFlow.extension, effect: copy(frame.coreFlow.result)
    },
    imprint: route.territoryExpansion?.flowPatch?.site?.imprint ?? null
  };
}

export function retained(runtime) {
  const route = runtime.siltPressureRouteSystem;
  const frame = runtime.frameState;
  const material = route.materialIdentity.snapshot();
  return {
    pieces: frame.spatialCoreChemistry?.placements.map(({ pieceId, family, zoneId }) => ({ pieceId, family, zoneId })) ?? [],
    topology: copy(frame.spatialCoreChemistry?.topology),
    chemistry: { composition: copy(frame.playerComposition), absorbed: frame.chemObjectState?.absorbedObjects ?? 0,
      earned: copy(frame.coreGrowth?.earnedEvolution), seedCount: frame.coreGrowth?.debugCoreWorkSeedCount ?? 0,
      growthStage: frame.coreGrowth?.stageId ?? null },
    derived: { physiology: copy(frame.corePerformance?.traits), chemistry: copy(frame.coreChemistryOutput) },
    material: { mass: material.totalMass, records: [...material.records].sort((a, b) => a.id.localeCompare(b.id)),
      units: route.livingCycle.units.map(({ id, generation, phase }) => ({ id, generation, phase })), nativeAwake: route.livingCycle.active },
    progression: { completed: route.completed, returned: Boolean(frame.act1RouteHistory?.siltReturned),
      safeMatterAbsorbed: route.safeMatterAbsorbed, pressureRead: route.pressureRead,
      returnFoldReady: route.returnFoldReady, credits: frame.returnRegionEngine?.creditCount ?? 0 },
    receipts: { silt: runtime.hostConnectionReceiptLedger.acceptedTotal,
      vascular: runtime.hostConnectionReceiptLedger.vascularEffectSnapshot().acceptedTotal,
      grave: runtime.hostConnectionReceiptLedger.graveIIResolutionSnapshot().acceptedTotal,
      local: route.transactionSequence },
    grip: route.siltGrip.heldId ?? null, seat: route.siltPlateSeat.unitId ?? null
  };
}

// Run once before scoring. Owner inputs may be staged here. The trial uses
// only resolved controller input and observation after this call has returned.
export function stageShelf(runtime, scenario) {
  const route = runtime.siltPressureRouteSystem;
  const frame = runtime.frameState;
  const core = runtime.coreEmbodimentSystem;
  const patch = route.territoryExpansion?.readFlowPatch(frame);
  const pose = scenario.environment;
  if (!route.active || !patch || pose.receiver !== patch.id || !frame.coreGrowth?.debugCoreWorkRetainedAnatomySeeded) {
    throw new Error('Fresh Silt mount and existing debug anatomy are required');
  }
  PIECES.forEach((name, index) => setPlacement(core, name, scenario.authoritative.core.placements[index]));
  const requested = poseOffset.fromArray(pose.offset).add(patch.center);
  runtime.playerCore.position.copy(runtime.playerCore.parent.worldToLocal(requested.clone()));
  runtime.playerMovementController.velocity.set(0, 0, 0);
  core.direction.copy(facing.fromArray(pose.facing));
  core.targetDirection.copy(facing);
  core.bank = 0;
  core.orientBody(0, 0);
  core.bodyFrame.quaternion.copy(core.targetQuaternion);
  runtime.playerCore.updateWorldMatrix(true, true);
  runtime.cameraYaw = scenario.presentation.yaw;
  runtime.cameraPitch = scenario.presentation.pitch;
  runtime.cameraDistance = 6.45;
  runtime.cameraMotionLead.set(0, 0, 0);
  runtime.verticalCameraAnchorY = runtime.playerCore.position.y;
  runtime.camera.position.copy(requested).add(new Vector3(0, 1.18, 6.45));
  runtime.camera.lookAt(patch.center);
  runtime.camera.updateMatrixWorld(true);
  core.updateSpatialCoreChemistry(frame.runtimeSeconds, 0, frame);
  const reserve = runtime.coreRadialPerformanceSystem;
  reserve.reserve01 = scenario.authoritative.core.reserve;
  reserve.publish(frame, reserve.resolveProfile(frame));
  return { state: sample(runtime), retained: retained(runtime), patch: { id: patch.id,
    center: patch.center.toArray(), normal: patch.normal.toArray(), radius: patch.radius,
    conductivity: patch.conductivity, resistance: patch.resistance } };
}
