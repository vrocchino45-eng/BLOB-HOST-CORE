import { resolveSiltPairImpact, siltPairFixture, siltPairIds } from './SiltPairMomentum.js';
import { HC031W2A4_MAX_STEP_SECONDS } from '../core/BoundedSimulationCatchUp.js';

/**
 * LS1D1D2O1 — bounded route-local kinematic history for individual Silt grains.
 *
 * The native LS1B cycle remains the ecology clock and phase authority. A
 * released (unseated) grain keeps its last world-local position and a bounded
 * directional drift; the native point is a spring attractor, NEVER a teleport.
 * This module owns released trajectories, including explicitly authored free contact.
 */
const finite3 = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
const vec = (a,b) => a.map((n,i)=>n+b[i]);
const subtract = (a,b)=>a.map((n,i)=>n-b[i]);
const length = a=>Math.hypot(...a);
const scale = (a,s)=>a.map(n=>n*s);
const limit = (v,max) => {const n=length(v);return n>max ? scale(v,max/n):v;};
const round = n=>Number(n.toFixed(4));
const roundVec = a => a.map(round);
const pulseImpulse = displacement => Math.min(1.35, 0.55 + displacement * 2.1);

const CONTACT_EPSILON = 1e-7;
const MAX_MICROSTEP_SECONDS = 0.025;
const CONTACT_HISTORY_LIMIT = 32;
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);

function sweepIngress(position, move, { center, radii }) {
  const offset = subtract(position, center).map((n, i) => n / radii[i]);
  const travel = move.map((n, i) => n / radii[i]);
  const a = dot(travel, travel);
  const b = dot(offset, travel);
  const c = dot(offset, offset) - 1;
  const discriminant = b * b - a * c;
  if (c < -CONTACT_EPSILON || a === 0 || b >= 0 || discriminant <= 0) return null;
  const fraction = Math.max(0, (-b - Math.sqrt(discriminant)) / a);
  if (fraction > 1) return null;
  const point = vec(position, scale(move, fraction));
  const gradient = subtract(point, center).map((n, i) => n / radii[i] ** 2);
  return { fraction, point, normal: scale(gradient, 1 / length(gradient)) };
}

export class SiltTrajectoryMemory {
  constructor({ maxUnits=8, spring=0.44, drag=0.74, maxSpeed=2.1, maxAcceleration=1.8, pairExperiment=null }={}) {
    this.maxUnits=maxUnits;
    this.spring=spring;
    this.drag=drag;
    this.maxSpeed=maxSpeed;
    this.maxAcceleration=maxAcceleration;
    this.held=new Map();
    this.free=new Map();
    this.history=new Map();
    this.releases=0;
    this.reacquisitions=0;
    this.sequence=0;
    this.lastEvent='none';
    this.freeContacts = [];
    this.pairFixture = siltPairFixture(pairExperiment);
    this.pairLatch = null;
    this.pairContacts = this.pairFixture ? [] : null;
  }
  beginHold(id, position) {
    if(typeof id!=='string'||!finite3(position)) return false;
    if(!this.history.has(id)) {
      if(this.history.size>=this.maxUnits)return false;
      this.history.set(id,{releases:0,travelDistance:0,maxNativeDeviation:0});
    }
    if(this.free.delete(id)) this.reacquisitions++;
    if (this.pairLatch && siltPairIds.includes(id)) this.clearPairContact();
    this.held.set(id,{position:[...position],velocity:[0,0,0],pulse:[0,0,0],pulseAge:Infinity});
    return true;
  }
  sampleHeld(id, position, dt, {pulseDirection=null, pulseDisplacement=0, braced=false}={}) {
    const track=this.held.get(id);
    if(!track||!finite3(position)) return;
    const step=Number.isFinite(dt) ? Math.max(0,Math.min(dt,0.1)) : 0;
    if(step>0.0001){
      const movement=limit(scale(subtract(position,track.position),1/step),this.maxSpeed);
      track.velocity=vec(scale(track.velocity,0.78),scale(movement,0.22));
      track.pulseAge+=step;
    }
    if(!braced&&pulseDisplacement>0.001&&finite3(pulseDirection)&&length(pulseDirection)>.001){
      // A Pulse *already accepted* by the grip supplies directional release
      // memory. It does not impart a force to any other gameplay subsystem.
      track.pulse=scale(limit(pulseDirection,1),pulseImpulse(pulseDisplacement));
      track.pulseAge=0;
    }
    track.position=[...position];
  }
  cancelHold(id){ this.held.delete(id); }
  release(id, position, {reason='deliberate-release', releaseContext=null, directedPulse=null, freeContactSource=null}={}) {
    if(typeof id!=='string'||!finite3(position)||!this.history.has(id)||!this.held.has(id))return null;
    if(!this.free.has(id)&&this.free.size>=this.maxUnits)return null;
    if (directedPulse && (!finite3(directedPulse.direction) || Math.abs(length(directedPulse.direction) - 1) > 1e-6
      || !Number.isFinite(directedPulse.displacement) || directedPulse.displacement < 0)) return null;

    const track=this.held.get(id);
    const recentPulse=track.pulseAge<5
      ? scale(track.pulse,Math.exp(-Math.max(0,track.pulseAge)*0.25)) : [0,0,0];
    // An explicit launch supplies the one Pulse impulse for this release.
    const impulse = directedPulse ? scale(directedPulse.direction, pulseImpulse(directedPulse.displacement)) : recentPulse;
    const velocity=limit(vec(track.velocity,impulse),this.maxSpeed);
    this.held.delete(id);
    // No duplicated records: one unit has exactly one trajectory authority.
    const record = {position:[...position],velocity,seconds:0,nearNative:false,nativeError:null,releaseReason:reason};
    if (releaseContext && reason === 'deliberate-release') record.releaseContext = releaseContext;
    if (directedPulse && freeContactSource) {
      record.freeContact = { source: { ...freeContactSource }, releaseSequence: this.sequence + 1,
        step: freeContactSource, touching: false };
    }
    this.free.set(id, record);
    this.history.get(id).releases++;
    this.releases++;this.sequence++;this.lastEvent='released';
    return {outcome:'released-with-trajectory',unitId:id,
      position:roundVec(position),velocity:roundVec(velocity),reason,
      noMaterialTransfer:true,progressionCredit:false};
  }
  readCurrentReleasePosition(id, generation, mountCount) {
    const record = this.free.get(id);
    const context = record?.releaseContext;
    return context && context.generation === generation && context.mountCount === mountCount
      ? [...record.position] : null;
  }

  resolveFreeContact(record, unitId, surface, step, microstep, dt, move) {
    const { center, radii } = surface;
    const contact = record.freeContact;
    const offset = subtract(record.position, center).map((n, i) => n / radii[i]);
    if (dot(offset, offset) > 1 + 8 * CONTACT_EPSILON) contact.touching = false;
    const impact = sweepIngress(record.position, move, surface);
    if (!impact) return null;
    const incomingVelocity = record.velocity;
    const inwardSpeed = -dot(incomingVelocity, impact.normal);
    if (inwardSpeed <= CONTACT_EPSILON) return null;
    record.velocity = vec(incomingVelocity, scale(impact.normal, inwardSpeed));
    if (!contact.touching) {
      const deduplicationId = [step.hostId, step.cellId, step.mountSequence, step.mountCount, step.frame,
        step.substep, microstep, unitId, step.generation, contact.releaseSequence, surface.id].join(':');
      this.freeContacts.push({ unitId, ...step, releaseSequence: contact.releaseSequence,
        receiverId: surface.id, microstep, contactPosition: impact.point, normal: impact.normal,
        incomingVelocity, inwardSpeedRemoved: inwardSpeed, response: 'accepted-stop-inward',
        deduplicationId });
      if (this.freeContacts.length > CONTACT_HISTORY_LIMIT) this.freeContacts.shift();
    }
    contact.touching = true;
    const along = scale(record.velocity, dt * (1 - impact.fraction));
    return { position: vec(vec(impact.point, scale(impact.normal, CONTACT_EPSILON)), along),
      distance: length(move) * impact.fraction + length(along) };
  }


  nativeVelocity(record, nativePoint, resistance, radiusSquared, step) {
    const delta=subtract(nativePoint,record.position);
    const accel=limit(subtract(scale(delta,this.spring),scale(record.velocity,this.drag)),this.maxAcceleration);
    let velocity=limit(vec(record.velocity,scale(accel,step)),this.maxSpeed);
    if (resistance) {
      const offset = subtract(record.position, resistance.center);
      const separationSquared = offset[0] ** 2 + offset[1] ** 2 + offset[2] ** 2;
      if (separationSquared < radiusSquared) {
        // Extra drag falls to zero at the boundary. A positive scalar
        // preserves heading and leaves the native spring and speed cap intact.
        const rate = resistance.rate * (1 - separationSquared / radiusSquared);
        velocity = scale(velocity, Math.exp(-rate * step));
      }
    }
    return velocity;
  }

  clearPairContact() {
    this.pairLatch = null;
  }

  pairMember(entry, id) {
    const record = this.free.get(id);
    const { contact, phase, custody, seated } = entry ?? {};
    const step = contact?.step;
    const source = record?.freeContact?.source;
    const previous = record?.freeContact?.step;
    if (entry?.id !== id || !record || this.held.has(id) || seated || custody !== 'environment'
      || !this.pairFixture.phases.includes(phase) || !finite3(record.position) || !finite3(record.velocity)
      || !finite3(entry.nativePoint) || !step || !source || !previous
      || step.hostId !== this.pairFixture.hostId || step.cellId !== this.pairFixture.cellId
      || !['frame', 'substep', 'mountCount', 'mountSequence', 'generation'].every(k => Number.isSafeInteger(step[k]) && step[k] >= 0)
      || !['hostId', 'cellId', 'mountCount', 'mountSequence', 'generation'].every(k => step[k] === source[k])) return null;
    const releaseSequence = record.freeContact.releaseSequence;
    if (!Number.isSafeInteger(releaseSequence) || releaseSequence < 1) return null;
    const after = (a, b) => a.frame > b.frame || (a.frame === b.frame && a.substep > b.substep);
    const releaseStep = record.seconds === 0 && step.frame === source.frame && step.substep === source.substep;
    if (!releaseStep && (!after(step, source) || !after(step, previous))) return null;
    const { resistance } = entry;
    return { ...entry, record, step, source, releaseSequence, mass: this.pairFixture.masses[id],
      radius: this.pairFixture.radii[id], radiusSquared: resistance ? resistance.radius ** 2 : 0 };
  }

  advancePair(dt, entries, rigidFrame) {
    const fixture = this.pairFixture;
    if (!fixture || rigidFrame !== true || !Number.isFinite(dt) || dt <= 1e-8 || dt > HC031W2A4_MAX_STEP_SECONDS
      || !Array.isArray(entries) || entries.length !== siltPairIds.length) return null;
    const members = siltPairIds.map(id => this.pairMember(entries.find(entry => entry.id === id), id));
    if (members.some(member => !member)) return null;
    const [a, b] = members;
    if (!['frame', 'substep', 'mountCount', 'mountSequence'].every(k => a.step[k] === b.step[k])
      || a.releaseSequence === b.releaseSequence) return null;
    const key = JSON.stringify([fixture.id, a.step.hostId, a.step.cellId, a.step.mountSequence, a.step.mountCount,
      ...members.map(member => [member.id, member.step.generation, member.releaseSequence])]);
    if (this.pairLatch?.key !== key) this.pairLatch = { key, armed: true };
    for (const member of members) member.record.freeContact.step = member.step;

    let left = dt;
    let microstep = 0;
    while (left > 1e-8) {
      const seconds = Math.min(left, MAX_MICROSTEP_SECONDS);
      left -= seconds;
      const native = members.map(member => this.predictPairMember(member, seconds));
      const separation = length(subtract(native[0].position, native[1].position));
      if (separation > a.radius + b.radius + fixture.separationMargin) this.pairLatch.armed = true;
      const candidate = this.pairLatch.armed && resolveSiltPairImpact(native[0], native[1], seconds);
      const impact = candidate && candidate.velocities.every(v => length(v) <= this.maxSpeed)
        && !native.some((body, index) => this.fixedSurfacePrecedes(body, members[index].contact.surface, seconds, candidate.time));
      if (impact) {
        this.applyPairContact(members, native, candidate, seconds, microstep);
      } else {
        for (const [index, member] of members.entries()) {
          member.record.velocity = native[index].velocity;
          this.advancePairMember(member, seconds, microstep);
        }
      }
      for (const member of members) member.record.seconds += seconds;
      microstep++;
    }
    return new Map(members.map(member => [member.id, this.finishAdvance(member.id, member.record, member.nativePoint)]));
  }

  predictPairMember(member, seconds) {
    const { record, nativePoint, resistance, radiusSquared, mass, radius } = member;
    return { position: record.position, beforeNativeVelocity: record.velocity, mass, radius,
      velocity: this.nativeVelocity(record, nativePoint, resistance, radiusSquared, seconds) };
  }

  fixedSurfacePrecedes(body, surface, seconds, time) {
    if (!surface) return false;
    const hit = sweepIngress(body.position, scale(body.velocity, seconds), surface);
    return Boolean(hit && -dot(body.velocity, hit.normal) > CONTACT_EPSILON
      && hit.fraction * seconds <= time + this.pairFixture.fixedSurfaceWindow);
  }

  advancePairMember(member, seconds, microstep, travelBefore = 0) {
    const { record, contact, step, id } = member;
    const move = scale(record.velocity, seconds);
    const fixed = contact.surface ? this.resolveFreeContact(record, id, contact.surface, step, microstep, seconds, move) : null;
    record.position = fixed?.position ?? vec(record.position, move);
    this.history.get(id).travelDistance += travelBefore + (fixed?.distance ?? length(move));
  }

  applyPairContact(members, native, result, seconds, microstep) {
    // The entire pair was validated before either position or velocity changes.
    for (const [i, { record }] of members.entries()) {
      record.position = result.positions[i];
      record.velocity = result.velocities[i];
    }
    const { step, radius } = members[0];
    this.pairLatch.armed = false;
    const event = {
      ...step, microstep, microstepSeconds: seconds, contactSeconds: result.time,
      fixture: this.pairFixture.id, revision: this.pairFixture.revision,
      id: [this.pairLatch.key, step.frame, step.substep, microstep].join(':'),
      kind: 'accepted-silt-pair', actualRecipientIds: members.map(member => member.id),
      normal: result.normal, point: vec(result.positions[0], scale(result.normal, radius)),
      impulse: result.impulse, momentumBefore: result.momentumBefore, momentumAfter: result.momentumAfter,
      kineticEnergyBefore: result.energyBefore, kineticEnergyAfter: result.energyAfter,
      kineticEnergyLost: Math.max(0, result.energyBefore - result.energyAfter),
      units: members.map(({ id, step, mass, radius, releaseSequence, source }, i) => ({
        id, generation: step.generation, releaseSequence, releaseFrame: source.frame, releaseSubstep: source.substep,
        mass, radius, startingPosition: [...native[i].position], contactPosition: [...result.positions[i]],
        beforeNativeVelocity: [...native[i].beforeNativeVelocity], incomingVelocity: [...native[i].velocity],
        outgoingVelocity: [...result.velocities[i]]
      })),
      inventoryTransferred: false, progressionCredit: false, hostReceipt: false
    };
    this.pairContacts.push(event);
    if (this.pairContacts.length > CONTACT_HISTORY_LIMIT) this.pairContacts.shift();
    // Remaining travel keeps the original PI03 owner and native step length.
    for (const [i, member] of members.entries()) {
      this.advancePairMember(member, seconds - result.time, microstep, length(native[i].velocity) * result.time);
    }
  }

  advance(id,dt,nativePoint,resistance=null,contact=null){
    const record=this.free.get(id);
    if(!record||!finite3(nativePoint))return null;
    // World-space simulation, never an offset drawn from a changing phase.
    // When LS1B changes phase, its native target changes, but the *grain* does
    // not jump. Apply bounded acceleration and a speed limit for any dt.
    let left=Number.isFinite(dt)?Math.max(0,Math.min(dt,0.25)):0;
    let surface = null;
    if (contact && record.freeContact && left > 0) {
      const { step } = contact;
      const { source, step: previous } = record.freeContact;
      if (step.hostId === source.hostId && step.cellId === source.cellId && step.generation === source.generation) {
        const sameMount = step.mountCount === previous.mountCount && step.mountSequence === previous.mountSequence;
        const freshMount = step.mountCount > previous.mountCount && step.mountSequence > previous.mountSequence;
        const newerStep = step.frame > previous.frame || (step.frame === previous.frame && step.substep > previous.substep);
        const releaseStep = sameMount && record.seconds === 0 && step.frame === source.frame && step.substep === source.substep;
        if (!(newerStep && (sameMount || freshMount)) && !releaseStep) {
          return { position: [...record.position], velocity: [...record.velocity], nativeError: record.nativeError,
            seconds: record.seconds, nearNative: record.nearNative };
        }
        record.freeContact.step = step;
        surface = contact.surface;
      }
    }
    let microstep = 0;
    const radiusSquared = resistance ? resistance.radius ** 2 : 0;
    while(left>1e-8){
      const step=Math.min(left,MAX_MICROSTEP_SECONDS);left-=step;
      record.velocity = this.nativeVelocity(record, nativePoint, resistance, radiusSquared, step);
      const stepMove=scale(record.velocity,step);
      const impact = surface ? this.resolveFreeContact(record, id, surface, contact.step, microstep, step, stepMove) : null;
      record.position = impact?.position ?? vec(record.position, stepMove);
      this.history.get(id).travelDistance += impact?.distance ?? length(stepMove);
      microstep++;
      record.seconds+=step;
    }
    return this.finishAdvance(id, record, nativePoint);
  }
  finishAdvance(id, record, nativePoint) {
    const distance=length(subtract(nativePoint,record.position));
    record.nativeError=distance;
    this.history.get(id).maxNativeDeviation=Math.max(distance,this.history.get(id).maxNativeDeviation);
    if(distance<0.22&&!record.nearNative){
      record.nearNative=true;this.sequence++;this.lastEvent='near-native-path';
    }else if(distance>0.32){ record.nearNative=false; }
    return {position:[...record.position],velocity:[...record.velocity],
      nativeError:distance,seconds:record.seconds,nearNative:record.nearNative};
  }
  has(id){return this.free.has(id);}
  get(id){const v=this.free.get(id);return v ? {position:[...v.position],velocity:[...v.velocity]}:null;}
  snapshot(){
    return {pass:'LS1D1D2O1',mode:'native-path-attractor-not-reset',
      maxUnits:this.maxUnits,freeCount:this.free.size,heldSampleCount:this.held.size,
      releases:this.releases,reacquisitions:this.reacquisitions,sequence:this.sequence,
      lastEvent:this.lastEvent,
      ...(this.freeContacts.length ? { freeMaterialContacts: this.freeContacts.slice() } : {}),
      ...(this.pairFixture ? { materialPairExperiment: { fixture: this.pairFixture.id,
        revision: this.pairFixture.revision, contacts: this.pairContacts.slice() } } : {}),
      histories:[...this.history.entries()].map(([unitId,h])=>({unitId,
        releases:h.releases,travelDistance:round(h.travelDistance),
        maxNativeDeviation:round(h.maxNativeDeviation)})),
      units:[...this.free.entries()].map(([unitId,s])=>({
        unitId,position:roundVec(s.position),velocity:roundVec(s.velocity),
        seconds:round(s.seconds),nearNative:s.nearNative,
        nativeError:s.nativeError===null?null:round(s.nativeError),releaseReason:s.releaseReason
      })),materialTransfer:false,chemistryTransfer:false,progressionCredit:false,
      persistsBeyondRegion:false};
  }
}
