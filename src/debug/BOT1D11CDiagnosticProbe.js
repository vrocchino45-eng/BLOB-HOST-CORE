import * as THREE from "three";
import { inspectBOT1D11FAnchorContinuity } from "./BOT1D11FAnchorGeometryInspector.js";
import { installBOT1D11HFirstFootholdTimeline } from "./BOT1D11HFirstFootholdTimeline.js";

// BOT1-D11C: DEV + explicit URL flag only. Instrumentation owns no gameplay updates.
// The ONLY mutating operation is an explicit controlled mechanical test placement.
const TARGET = "SILT_ENTRY_SEDIMENT_SHELF_D11B";
const CELL = "CELL_SILT_PRESSURE_ROUTE_001";
const MESH_NAME = `silt_crawlable_${TARGET.toLowerCase()}`;
const copy3 = (v) => v ? ({ x: Number((v.x ?? 0).toFixed(4)), y: Number((v.y ?? 0).toFixed(4)), z: Number((v.z ?? 0).toFixed(4)) }) : null;
const val = (v, fallback = null) => v ?? fallback;

export function installBOT1D11CProbe(runtime) {
  if (window.__BLOB_D11C_PROBE__) return;
  const d11h = installBOT1D11HFirstFootholdTimeline(runtime);
  const samples = [];
  const interventions = [];
  let running = true;
  let lastCell = "none";
  let t0 = performance.now();
  const surfaceMesh = () => runtime.scene?.getObjectByName(MESH_NAME) ?? null;
  function snapshot() {
    const f = runtime.frameState ?? {};
    const truth = f.coreSurfaceTruth ?? {};
    const contact = f.coreTendrilContact ?? {};
    const locomotion = contact.surfaceLocomotion ?? {};
    const plane = f.coreTendrilSupportPlane ?? {};
    const attachment = f.playerAttachment ?? {};
    const audit = f.surfaceCapabilityAudit ?? {};
    const mesh = surfaceMesh();
    const world = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const player = new THREE.Vector3();
    mesh?.getWorldPosition(world);
    mesh?.getWorldScale(scale);
    runtime.playerCore?.getWorldPosition(player);
    const meshPresent = Boolean(mesh);
    const meshVisible = Boolean(mesh && mesh.visible && mesh.parent?.visible !== false);
    return {
      ms: Math.round(performance.now() - t0), frame: val(f.frame, -1), cell: val(f.activeCellId, 'none'),
      player: copy3(player),
      shelf: { present: meshPresent, visible: meshVisible, center: meshPresent ? copy3(world) : null,
        scale: meshPresent ? copy3(scale) : null },
      surface: { valid: Boolean(truth.valid), eligible: Boolean(truth.mechanicalEligible),
        surfaceId: val(truth.surfaceId, 'none'), profile: val(truth.profileId, 'none'),
        distance: val(truth.distance), reason: val(truth.reason, 'none'),
        point: copy3(truth.point), normal: copy3(truth.normal),
        candidateCount: val(truth.candidateCount, 0), probeCandidates: val(truth.broadPhaseCandidateCount, 0) },
      capability: { authoredCount: val(audit.authoredSurfaceCount, 0), surfaceIds: (audit.surfaceIds ?? []).slice(0, 24),
        finding: val(audit.findingCode, 'none'), nearestValid: Boolean(audit.nearestValid) },
      contact: { state: val(contact.contactState, 'none'), requested: val(contact.requestedContactState, 'none'),
        suppressed: Boolean(contact.boundaryOnlyContactSuppressed),
        sealed: val(contact.sealedCount, 0), reaching: val(contact.reachingCount, 0),
        peeling: val(contact.peelingCount, 0), truthActive: Boolean(contact.surfaceTruthActive),
        truthSurfaceId: val(contact.surfaceTruthSurfaceId, 'none'),
        locomotionActive: Boolean(locomotion.active), supportCount: val(locomotion.supportCount, 0),
        carriedSurfaceId: val(locomotion.carriedSurfaceId, 'none'),
        anchors: (locomotion.anchors ?? []).map(a => ({ phase: val(a.phase, 'none'),
          sealed: Boolean(a.sealed), surfaceId: val(a.surface?.surfaceId, 'none') })) },
      plane: { active: Boolean(plane.active), supportCount: val(plane.supportCount, 0),
        surfaceId: val(plane.surfaceId, 'none'), reason: val(plane.reason, 'none'),
        quality: val(plane.supportQuality01, 0), normal: copy3(plane.supportNormal) },
      attachment: { active: Boolean(attachment.active), state: val(attachment.state, 'none'),
        surfaceId: val(attachment.ownerSurfaceId ?? attachment.surfaceTruthSurfaceId, 'none'),
        detachReason: val(attachment.detachReason, 'none'), releaseArmed: Boolean(attachment.releaseArmed),
        peelIntent: val(attachment.peelIntent01, 0), contactGap: Boolean(attachment.contactGapActive),
        supportCount: val(attachment.tendrilSupportCount, 0) },
      continuity: inspectBOT1D11FAnchorContinuity(runtime),
      coreContactLanguage: { state: val(f.coreContactLanguage?.state, 'none') }
    };
  }
  function collect() {
    if (!running) return;
    const s = snapshot();
    lastCell = s.cell;
    if (samples.length < 2400) samples.push(s); // 120s @ 20 Hz maximum
  }
  const interval = setInterval(collect, 50);
  function placeAboveSiltShelf() {
    const s = snapshot();
    if (s.cell !== CELL) throw new Error(`D11C start requires ${CELL}; got ${s.cell}`);
    const mesh = surfaceMesh();
    if (!mesh || !s.shelf.visible) throw new Error('D11B shelf not mounted/visible. Confirm D11B patch and Shift+6.');
    mesh.updateWorldMatrix(true, false);
    const center = new THREE.Vector3();
    const scale = new THREE.Vector3();
    mesh.getWorldPosition(center); mesh.getWorldScale(scale);
    // Sphere mesh: local radius 1. 0.34 above the ellipsoid's upper face.
    const world = new THREE.Vector3(center.x, center.y + Math.abs(scale.y) + 0.34, center.z);
    const player = runtime.playerCore;
    if (!player) throw new Error('Player root unavailable');
    const local = player.parent ? player.parent.worldToLocal(world.clone()) : world;
    player.position.copy(local);
    runtime.debugAreaJumpSystem?.zeroMomentum?.();
    const at = { kind: 'controlled_start', ms: Math.round(performance.now() - t0), cell: s.cell,
      position: copy3(world), reason: 'debug_mechanical_pose_not_a_navigation_success' };
    interventions.push(at);
    return at;
  }
  window.__BLOB_D11C_PROBE__ = Object.freeze({
    version: 'BOT1-D11C-1', snapshot,
    reset() { samples.length = 0; interventions.length = 0; t0 = performance.now(); running = true; d11h.reset(); collect(); },
    mark(label) { interventions.push({ kind: 'marker', label: String(label).slice(0, 80), ms: Math.round(performance.now() - t0) }); },
    controlledStart: placeAboveSiltShelf,
    dump() { collect(); return { revision: 'BOT1-D11C-1', target: TARGET, cell: CELL,
      intervalMs: 50, maxSamples: 2400, samples: samples.slice(), interventions: interventions.slice(),
      lastCell, firstFoothold: d11h.dump(), exportedAt: new Date().toISOString() }; },
    stop() { running = false; clearInterval(interval); d11h.stop(); }
  });
  collect();
}
