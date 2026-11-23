import * as THREE from 'three';
import { clampFlow, inspectFlowPatchContact, MAX_FLOW_REACH, MAX_FLOW_STEP, readFlowAim, readFlowCoreProfile,
  readFlowStep, siltFlowUnavailableReason } from '../interaction/SiltFlowContract.js';

const CROWN_ROOT = new THREE.Vector3(0, 0, -0.43);
const REAR_ROOT = new THREE.Vector3(0, 0, 0.43);
const RETURN_RADIUS = 0.43;
const BLOCKED_PLANE_CLEARANCE = 0.1; // In body space, beyond the crown head's 0.085 radius.
const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, -1);
const COLORS = { disconnected: 0xa4b6bb, contact: 0xf9d994, conducting: 0x6af8cb,
  overload: 0xff8d57, recovering: 0xbf8dd9, retracting: 0x98b5bd };

export class CoreFlowSystem {
  constructor({ playerRoot, readPatch, acceptFlow, readContactSurfaces, renderReceiver = null }) {
    this.playerRoot = playerRoot;
    this.readPatch = readPatch;
    this.acceptFlow = acceptFlow;
    this.readContactSurfaces = readContactSurfaces;
    this.renderReceiver = renderReceiver;
    this.ray = new THREE.Raycaster();
    this.lastActionSequence = 0;
    this.lastStep = null;
    this.binding = null;
    this.extension = 0;
    this.contactAge = 0;
    this.strain = 0;
    this.overloaded = false;
    this.circulation = 0;
    this.lastResult = null;
    this.obstructionHit = null;
    this.view = null;
  }

  update(dt, frameState) {
    const step = readFlowStep(frameState);
    const last = this.lastStep;
    if (step && last && step.hostId === last.hostId && step.cellId === last.cellId
      && step.mountSequence === last.mountSequence
      && (step.frame < last.frame || (step.frame === last.frame && step.substep <= last.substep))) return;
    this.lastStep = step;
    this.obstructionHit = null;
    const aim = readFlowAim(frameState);
    const unavailable = siltFlowUnavailableReason(frameState);
    const patch = unavailable === null ? this.readPatch(frameState) : null;
    const previous = frameState.coreFlow;
    const input = frameState.input ?? {};
    const demand = clampFlow(input.flowDemand01);
    const actionSequence = input.flowActionSequence;
    const body = this.playerRoot.getObjectByName('player_seed_body_frame');
    const ready = Boolean(step && aim && patch && body);
    if (Number.isSafeInteger(actionSequence) && actionSequence > this.lastActionSequence) {
      this.lastActionSequence = actionSequence;
      this.binding = ready && demand > 0 ? {
        hostId: step.hostId, mountSequence: step.mountSequence, receiverId: patch.id,
        attentionSequence: aim.attentionSequence
      } : null;
    }
    const binding = this.binding;
    if (!ready || demand === 0 || !binding || actionSequence !== this.lastActionSequence
      || binding.hostId !== step.hostId || binding.mountSequence !== step.mountSequence
      || binding.receiverId !== patch.id || binding.attentionSequence !== aim.attentionSequence) this.binding = null;

    const activeDemand = this.binding ? demand : 0;
    const safeDt = Number.isFinite(dt) && dt > 0 && dt <= MAX_FLOW_STEP ? dt : 0;
    const profile = readFlowCoreProfile(frameState);
    this.extension = stepToward(this.extension, activeDemand > 0 ? MAX_FLOW_REACH : 0, safeDt * 3.6);
    if (!patch) this.extension = 0;

    const origin = body?.localToWorld(CROWN_ROOT.clone());
    let direction;
    let contact = null;
    let reason = unavailable ?? (ready ? 'ready' : patch && !aim ? 'aim_at_shelf' : 'receiver_unavailable');
    if (origin) {
      const forward = body.localToWorld(CROWN_ROOT.clone().add(FORWARD)).sub(origin).normalize();
      const towardPatch = patch?.center.clone().sub(origin).normalize();
      const aligned = towardPatch && forward.dot(towardPatch) >= 0.42;
      direction = activeDemand && aligned ? towardPatch : forward;
      if (activeDemand) {
        reason = 'align_core';
        if (aligned) {
          ({ contact, reason } = inspectFlowPatchContact(patch, origin, direction, this.extension));
          if (contact && this.isObstructed(origin, direction, contact.point)) {
            contact = null;
            reason = 'obstructed';
          }
        }
      }
    }

    this.contactAge = contact ? this.contactAge + safeDt : 0;
    const capacity = clampFlow(0.40 + 0.28 * profile.enduranceCapacity + 0.09 * profile.stability + 0.12 * profile.reserve01);
    const requestedCurrent01 = contact ? activeDemand * capacity * (this.overloaded ? 0.24 : 1) : 0;
    const sampleReady = this.contactAge >= 0.06 && safeDt > 0;
    const result = sampleReady ? this.acceptFlow({
      ...step, ...aim, receiverId: patch.id, actionSequence, demand01: activeDemand, profile,
      requestedCurrent01, origin, direction, reach: this.extension, dt: safeDt
    }, frameState) : null;

    if (result) {
      this.lastResult = result;
      this.strain = clampFlow(this.strain + safeDt * (result.acceptedCurrent01 + result.resistance01 * activeDemand * 1.75)
        / profile.stability);
      this.overloaded ||= this.strain >= 0.75;
      this.circulation = (this.circulation + result.acceptedCurrent01 * safeDt * 3.8) % 1;
    } else {
      this.strain = Math.max(0, this.strain - safeDt * profile.recovery * 0.52);
      if (this.strain <= 0.30) this.overloaded = false;
    }
    if (!patch) {
      this.strain = 0;
      this.overloaded = false;
      this.circulation = 0;
    }

    const phase = result ? (this.overloaded ? 'overload' : 'conducting')
      : activeDemand ? (contact ? 'contact' : 'disconnected')
      : this.strain > 0 ? 'recovering' : this.extension > 0 ? 'retracting' : 'retracted';
    if (result?.acceptedCurrent01 > 0) reason = this.overloaded ? 'overload' : 'current_accepted';
    else if (sampleReady) reason = 'receiver_rejected';
    else if (!activeDemand && patch) {
      if (previous?.demand01 > 0) reason = !aim || demand > 0 ? 'target_changed' : 'released';
      else if ((phase === 'recovering' || phase === 'retracting')
        && (previous?.reason === 'released' || previous?.reason === 'target_changed')) reason = previous.reason;
    }
    const tip = contact?.point ?? (origin && direction ? origin.clone().addScaledVector(direction, this.extension) : null);
    const state = {
      owner: 'CoreFlowSystem', step, phase, reason, profile, actionSequence: this.lastActionSequence,
      intendedTargetId: aim?.targetId ?? null, receiverId: patch?.id ?? null,
      ready, demand01: activeDemand, extension: this.extension, contactValid: Boolean(contact),
      contactPoint: contact?.point.toArray() ?? null, tip: tip?.toArray() ?? null,
      strain01: this.strain, overloaded: this.overloaded, circulation: this.circulation, result, lastResult: this.lastResult
    };
    frameState.coreFlow = state;
    const deliveryProgress = (state.circulation * 2) % 1;
    if (body && (this.view || phase !== 'retracted')) this.render(body, state, deliveryProgress);
    this.renderReceiver?.(state, deliveryProgress);
  }

  isObstructed(origin, direction, point) {
    this.ray.set(origin, direction);
    this.ray.near = 0.015;
    this.ray.far = origin.distanceTo(point) - 0.015;
    const surfaces = this.readContactSurfaces().filter(mesh => mesh.visible);
    for (const mesh of surfaces) mesh.updateWorldMatrix(true, false);
    this.obstructionHit = this.ray.intersectObjects(surfaces, false)[0] ?? null;
    return this.obstructionHit !== null;
  }

  createView(body) {
    const root = new THREE.Group();
    root.name = 'core_flow_conductive_anatomy';
    root.userData.targetingSuppressed = true;
    body.add(root);
    const material = new THREE.MeshBasicMaterial({ color: COLORS.disconnected, transparent: true, depthWrite: false });
    const rod = new THREE.CylinderGeometry(0.025, 0.034, 1, 8);
    const crown = new THREE.Mesh(rod, material);
    const axial = new THREE.Mesh(rod, material);
    const rear = new THREE.Mesh(rod, material);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 1), material);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(RETURN_RADIUS, 0.022, 8, 56), material);
    const accentGeometry = new THREE.SphereGeometry(0.048, 8, 6);
    const outboundAccent = new THREE.Mesh(accentGeometry, new THREE.MeshBasicMaterial({
      color: 0xc6fff0, transparent: true, opacity: 0, depthWrite: false
    }));
    const returnAccent = new THREE.Mesh(accentGeometry, new THREE.MeshBasicMaterial({
      color: 0xffb965, transparent: true, opacity: 0, depthWrite: false
    }));
    crown.name = 'flow_forward_crown';
    axial.name = 'flow_axial_tendril';
    rear.name = 'flow_rear_conductor';
    head.name = 'flow_crown_head';
    loop.name = 'flow_toroidal_return';
    loop.rotation.x = Math.PI / 2;
    outboundAccent.name = 'flow_crown_current_tracer';
    outboundAccent.scale.set(1, 2.3, 1);
    returnAccent.name = 'flow_resistance_tracer';
    returnAccent.scale.setScalar(1.25);
    root.add(crown, axial, rear, head, loop, outboundAccent, returnAccent);
    placeRod(axial, CROWN_ROOT, REAR_ROOT);
    placeRod(rear, REAR_ROOT, new THREE.Vector3(0, -0.14, 0.7));
    this.view = { root, material, crown, head, loop, outboundAccent, returnAccent };
  }

  render(body, state, deliveryProgress) {
    if (!this.view) this.createView(body);
    const { root, material, crown, head, loop, outboundAccent, returnAccent } = this.view;
    root.visible = state.phase !== 'retracted';
    const result = state.contactValid && state.result?.acceptedCurrent01 > 0 ? state.result : null;
    const resistance = result?.resistance01 ?? 0;
    outboundAccent.visible = Boolean(result);
    outboundAccent.material.opacity = result ? 0.65 + result.acceptedCurrent01 * 0.6 : 0;
    returnAccent.visible = resistance > 0;
    returnAccent.material.opacity = 0.85 * Math.sqrt(resistance);
    if (!root.visible) return;
    material.color.setHex(COLORS[state.phase]);
    material.opacity = result ? 0.65 + result.acceptedCurrent01 * 0.34
      : state.phase === 'recovering' ? 0.25 + state.strain01 * 0.6 : 0.58;
    const hasCrown = state.extension > 0.005 && state.tip !== null;
    crown.visible = head.visible = hasCrown;
    if (hasCrown) {
      const tip = body.worldToLocal(new THREE.Vector3(...state.tip));
      if (state.reason === 'obstructed') {
        crown.visible = head.visible = placeBlockedTip(body, this.obstructionHit, tip);
      }
      if (crown.visible) {
        placeRod(crown, CROWN_ROOT, tip);
        head.position.copy(tip);
      }
    }
    loop.scale.x = 1.28 + state.strain01 * 0.09;
    if (result) {
      outboundAccent.position.copy(CROWN_ROOT).lerp(head.position, deliveryProgress);
      outboundAccent.quaternion.copy(crown.quaternion);
      const angle = -state.circulation * Math.PI * 2;
      returnAccent.position.set(Math.cos(angle) * RETURN_RADIUS * loop.scale.x, 0, Math.sin(angle) * RETURN_RADIUS);
    }
  }
}

function placeBlockedTip(body, hit, tip) {
  if (!hit?.face?.normal) return false;
  tip.copy(body.worldToLocal(hit.point.clone()));
  const blockerToBody = body.matrixWorld.clone().invert().multiply(hit.object.matrixWorld);
  const normal = hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(blockerToBody));
  const rootClearance = Math.abs(normal.dot(CROWN_ROOT.clone().sub(tip)));
  // A setback along the ray alone can leave the head across an angled face.
  // Hide the blocked crown if the face is already too close to fit its head.
  if (!(rootClearance > BLOCKED_PLANE_CLEARANCE)) return false;
  tip.lerp(CROWN_ROOT, BLOCKED_PLANE_CLEARANCE / rootClearance);
  return true;
}

function stepToward(value, target, amount) {
  return value < target ? Math.min(target, value + amount) : Math.max(target, value - amount);
}

function placeRod(mesh, start, end) {
  const axis = end.clone().sub(start);
  mesh.scale.y = axis.length();
  mesh.position.copy(start).lerp(end, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, axis.normalize());
}
