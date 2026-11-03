// BOT1-D11I: DEV+explicit bot1d11c URL only. Owner-call observer; no gameplay value writes.
// Hooks preserve method arguments, return values and thrown errors. Diagnostic-derived
// brush gates are labeled as inferences, NOT owner-emitted rejection events.
import {
  AUTHORED_SURFACE_BRUSH_DISTANCE as BRUSH_DISTANCE,
  AUTHORED_SURFACE_OUTWARD_INTENT_LIMIT as INTENT_LIMIT,
  AUTHORED_SURFACE_OUTWARD_SPEED_LIMIT as SPEED_LIMIT
} from '../player/CoreAuthoredContactBootstrap.js';

const TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B';
const fixed = n => Number.isFinite(n) ? Number(n.toFixed(4)) : null;
const relation = x => x?.valid ? x.surfaceId ?? 'unknown' : 'none';
const vec = x => x && [x.x,x.y,x.z].every(Number.isFinite)
  ? {x: fixed(x.x),y: fixed(x.y),z: fixed(x.z)} : null;

function brushCandidateReason(frame) {
  const truth = frame.coreSurfaceTruth ?? {};
  const kinetics = frame.playerKinematics ?? {};
  const attach = frame.playerAttachment ?? {};
  const inspection = frame.inspectionCamera ?? frame.tightInspectionCamera ?? {};
  if (inspection.coreWorkActive) return 'work_mode';
  if (attach.active) return 'already_attached';
  if (attach.state === 'releasing' || attach.reacquireBlocked) return 'releasing_or_reacquire_block';
  if (Number(attach.releaseCooldown ?? 0) > 0) return 'release_cooldown';
  if (!truth.valid || truth.mechanicalEligible !== true) return 'surface_not_mechanically_eligible';
  if (truth.surfaceId !== TARGET) return 'different_surface';
  if (!Number.isFinite(truth.distance) || truth.distance < 0 || truth.distance > BRUSH_DISTANCE)
    return 'distance_over_brush_gate';
  const n = truth.normal ?? {};
  if (![n.x,n.y,n.z].every(Number.isFinite)) return 'normal_invalid';
  const normalLength = Math.hypot(n.x,n.y,n.z);
  if (normalLength < 0.1) return 'normal_invalid';
  const m = kinetics.desiredMoveVector ?? {};
  const x = Number.isFinite(m.x)?m.x:0, y = Number.isFinite(m.y)?m.y:0, z = Number.isFinite(m.z)?m.z:0;
  const mag = Math.hypot(x,y,z);
  const outwardIntent = mag > 0.05 ? (x*n.x+y*n.y+z*n.z)/(mag*normalLength) : 0;
  if (outwardIntent > INTENT_LIMIT) return 'outward_intent_guard';
  const v = kinetics.velocity ?? {};
  const vx = Number.isFinite(v.x)?v.x:0, vy = Number.isFinite(v.y)?v.y:0, vz = Number.isFinite(v.z)?v.z:0;
  const outwardSpeed = (vx*n.x+vy*n.y+vz*n.z)/normalLength;
  if (outwardSpeed > SPEED_LIMIT) return 'outward_speed_guard';
  return 'brush_candidate_ready';
}

export function installBOT1D11IEventReasonRecorder(runtime) {
  const events = [], maxEvents = 12000, patches = [];
  let origin = performance.now(), active = true, attached = false, overflow = 0;
  let lastGate = null, lastContact = null;
  const counts = {};
  const ms = () => Math.round(performance.now() - origin);
  const emit = (type, fields = {}) => {
    if (!active) return;
    counts[type] = (counts[type] ?? 0) + 1;
    if (events.length >= maxEvents) { overflow++; return; }
    events.push({ ms:ms(), type, cell: runtime.frameState?.activeCellId ?? 'none', ...fields });
  };
  function patch(obj, name, observer) {
    if (!obj || typeof obj[name] !== 'function') return false;
    const original = obj[name];
    // Keep behavior byte-for-byte equivalent with the method's original `this`.
    function instrumented(...args) { return observer(original, this, args); }
    obj[name] = instrumented;
    patches.push(() => { if (obj[name] === instrumented) obj[name] = original; });
    return true;
  }
  function tendrilFields(t) {
    return {index:t?.index ?? null, phase:t?.phase ?? 'none',
      reachSurface:relation(t?.reachSurface), anchorSurface:relation(t?.anchorSurface),
      pendingSurface:relation(t?.pendingSurface), anchorWorld:vec(t?.anchorWorld),
      reachTo:vec(t?.reachTo), phaseAge:fixed(t?.phaseAge ?? NaN)};
  }
  function installHooks() {
    if (attached) return;
    const tendril = runtime.coreTendrilSurfaceContactSystem;
    const embodiment = runtime.coreEmbodimentSystem;
    const plane = runtime.coreTendrilSupportPlaneSystem;
    const movement = runtime.playerMovementController;
    if (!tendril || !embodiment || !plane || !movement) return;
    const covered = {};
    covered.embodiment = patch(embodiment, 'updateCoreContactLanguage', (fn, self, args) => {
      const f = args[2] ?? runtime.frameState ?? {};
      const inferredGate = brushCandidateReason(f);
      if (inferredGate !== lastGate) {
        emit('brush_gate_observation', {candidateReason:inferredGate, evidenceKind:'derived_from_D11D_pure_gate',
          surfaceId:f.coreSurfaceTruth?.surfaceId ?? 'none', distance:fixed(f.coreSurfaceTruth?.distance),
          velocity:vec(f.playerKinematics?.velocity), desiredMove:vec(f.playerKinematics?.desiredMoveVector),
          normal:vec(f.coreSurfaceTruth?.normal)});
        lastGate = inferredGate;
      }
      const before = self.coreContactState;
      const result = Reflect.apply(fn,self,args);
      if (self.coreContactState !== before) emit('embodiment_contact_transition',
        {from:before ?? 'none',to:self.coreContactState ?? 'none', candidateReason:inferredGate});
      return result;
    });
    covered.beginReach = patch(tendril, 'beginReach', (fn,self,args) => {
      const [t,target] = args;
      const before=tendrilFields(t);
      const result=Reflect.apply(fn,self,args);
      emit('reach_attempt', {before,after:tendrilFields(t),target:vec(target),
        outcome:t?.phase === 'reaching' ? 'began_reaching' : 'no_reaching_phase_observed',
        truthActive:Boolean(self.surfaceTruthActive), surfaceId:self.surfaceTruthSurfaceId ?? 'none'});
      return result;
    });
    covered.beginPeel = patch(tendril, 'beginPeel', (fn,self,args) => {
      const [t,next] = args;
      const before=tendrilFields(t);
      const result=Reflect.apply(fn,self,args);
      emit('peel_attempt', {before,after:tendrilFields(t),
        strideDestinationProvided:Boolean(next),
        reasonPrecision:'intent_unknown_without_owner_reason_code'});
      return result;
    });
    covered.tendrilPhase = patch(tendril, 'updateTendrilState', (fn,self,args) => {
      const t=args[0], from=t?.phase ?? 'none', pre=tendrilFields(t);
      const result=Reflect.apply(fn,self,args);
      if (from !== t?.phase) emit('tendril_phase_transition',
        {from,to:t?.phase ?? 'none',before:pre,after:tendrilFields(t),
          eventReason:'observed_owner_phase_transition'});
      return result;
    });
    covered.contactOwner = patch(tendril,'update',(fn,self,args)=>{
      const before=self.previousContactState ?? 'none';
      const result=Reflect.apply(fn,self,args);
      if (self.previousContactState !== before) emit('tendril_contact_transition',
        {from:before,to:self.previousContactState ?? 'none'});
      return result;
    });
    covered.plane = patch(plane,'update',(fn,self,args)=>{
      const f=args[1] ?? runtime.frameState ?? {};
      const before=f.coreTendrilSupportPlane ?? {};
      const snapshot={active:Boolean(before.active),reason:before.reason ?? 'none',support:before.supportCount ?? 0};
      const result=Reflect.apply(fn,self,args);
      const after=f.coreTendrilSupportPlane ?? {};
      if (snapshot.active !== Boolean(after.active) || snapshot.reason !== (after.reason ?? 'none'))
        emit('support_plane_transition', {before:snapshot,after:{active:Boolean(after.active),
          reason:after.reason ?? 'none',support:after.supportCount ?? 0,
          surfaceId:after.surfaceId ?? 'none'}});
      return result;
    });
    covered.movement = patch(movement,'update',(fn,self,args)=>{
      const f=runtime.frameState ?? {};
      const before=f.playerAttachment ?? {};
      const snapshot={active:Boolean(before.active),state:before.state ?? 'none',reason:before.detachReason ?? 'none'};
      const result=Reflect.apply(fn,self,args);
      const after=f.playerAttachment ?? {};
      if (snapshot.active !== Boolean(after.active) || snapshot.state !== (after.state ?? 'none') ||
          (after.detachReason && after.detachReason !== snapshot.reason && after.detachReason !== 'none'))
        emit('movement_attachment_transition', {before:snapshot,after:{active:Boolean(after.active),
          state:after.state ?? 'none',reason:after.detachReason ?? 'none',
          ownerSurfaceId:after.ownerSurfaceId ?? 'none'}});
      return result;
    });
    attached=true;
    emit('probe_owner_coverage', {covered});
  }
  installHooks();
  const attachTimer=setInterval(installHooks,250);
  return Object.freeze({
    reset() { origin=performance.now(); events.length=0; overflow=0; lastGate=null; lastContact=null;
      for(const k of Object.keys(counts)) delete counts[k]; installHooks();
      emit('probe_reset',{attached}); },
    dump() { installHooks(); return {revision:'BOT1-D11I-1', events:events.slice(),
      eventCounts:{...counts},droppedEvents:overflow, hooked:attached,
      ownerDataUsedForSteering:false,
      note:'Method-call wrappers preserve original return/throw. Gate reasons are derived candidates, not owner-emitted rejection codes.'}; },
    stop() {active=false;clearInterval(attachTimer); for (const restore of patches.reverse()) restore();}
  });
}
