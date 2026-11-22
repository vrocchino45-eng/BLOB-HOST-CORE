/**
 * LS1D1D2O1 — bounded route-local kinematic history for individual Silt grains.
 *
 * The native LS1B cycle remains the ecology clock and phase authority. A
 * released (unseated) grain keeps its last world-local position and a bounded
 * directional drift; the native point is a spring attractor, NEVER a teleport.
 * This module owns no material, chemistry, player movement or collisions.
 */
const finite3 = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
const vec = (a,b) => a.map((n,i)=>n+b[i]);
const subtract = (a,b)=>a.map((n,i)=>n-b[i]);
const length = a=>Math.hypot(...a);
const scale = (a,s)=>a.map(n=>n*s);
const limit = (v,max) => {const n=length(v);return n>max ? scale(v,max/n):v;};
const round = n=>Number(n.toFixed(4));
const roundVec = a => a.map(round);

export class SiltTrajectoryMemory {
  constructor({ maxUnits=8, spring=0.44, drag=0.74, maxSpeed=2.1, maxAcceleration=1.8 }={}) {
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
  }
  beginHold(id, position) {
    if(typeof id!=='string'||!finite3(position)) return false;
    if(!this.history.has(id)) {
      if(this.history.size>=this.maxUnits)return false;
      this.history.set(id,{releases:0,travelDistance:0,maxNativeDeviation:0});
    }
    if(this.free.delete(id)) this.reacquisitions++;
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
      track.pulse=scale(limit(pulseDirection,1),Math.min(1.35,0.55 + pulseDisplacement*2.1));
      track.pulseAge=0;
    }
    track.position=[...position];
  }
  cancelHold(id){ this.held.delete(id); }
  release(id, position, {reason='deliberate-release', releaseContext=null}={}) {
    if(typeof id!=='string'||!finite3(position)||!this.history.has(id)||!this.held.has(id))return null;
    const track=this.held.get(id);
    const heldVelocity=track?.velocity??[0,0,0];
    const recentPulse=track&&track.pulseAge<5 ?
      scale(track.pulse,Math.exp(-Math.max(0,track.pulseAge)*0.25)) : [0,0,0];
    const velocity=limit(vec(heldVelocity,recentPulse),this.maxSpeed);
    this.held.delete(id);
    // No duplicated records: one unit has exactly one trajectory authority.
    if(!this.free.has(id)&&this.free.size>=this.maxUnits)return null;
    const record = {position:[...position],velocity,seconds:0,nearNative:false,nativeError:null,releaseReason:reason};
    if (releaseContext && reason === 'deliberate-release') record.releaseContext = releaseContext;
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

  advance(id,dt,nativePoint,resistance=null){
    const record=this.free.get(id);
    if(!record||!finite3(nativePoint))return null;
    // World-space simulation, never an offset drawn from a changing phase.
    // When LS1B changes phase, its native target changes, but the *grain* does
    // not jump. Apply bounded acceleration and a speed limit for any dt.
    let left=Number.isFinite(dt)?Math.max(0,Math.min(dt,0.25)):0;
    const radiusSquared = resistance ? resistance.radius ** 2 : 0;
    while(left>1e-8){
      const step=Math.min(left,0.025);left-=step;
      const delta=subtract(nativePoint,record.position);
      const accel=limit(subtract(scale(delta,this.spring),scale(record.velocity,this.drag)),this.maxAcceleration);
      record.velocity=limit(vec(record.velocity,scale(accel,step)),this.maxSpeed);
      if (resistance) {
        const offset = subtract(record.position, resistance.center);
        const separationSquared = offset[0] ** 2 + offset[1] ** 2 + offset[2] ** 2;
        if (separationSquared < radiusSquared) {
          // Extra drag falls to zero at the boundary. A positive scalar
          // preserves heading and leaves the native spring and speed cap intact.
          const rate = resistance.rate * (1 - separationSquared / radiusSquared);
          record.velocity = scale(record.velocity, Math.exp(-rate * step));
        }
      }
      const stepMove=scale(record.velocity,step);
      record.position=vec(record.position,stepMove);
      this.history.get(id).travelDistance+=length(stepMove);
      record.seconds+=step;
    }
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
