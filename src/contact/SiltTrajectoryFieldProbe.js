/**
 * LS1D1D2P1 — read-only, route-local habitat travel evidence.
 * Existing Silt LS1A habitat centers/radii define observation zones only;
 * passages and space outside ellipsoids are "between" (NOT new collisions).
 * Does not own/advance grain positions, ecology, identity or progression.
 */
const is3 = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
const distance = (a,b) => Math.hypot(...a.map((v,i)=>v-b[i]));
const rounded = n => Number(n.toFixed(3));
export class SiltTrajectoryFieldProbe {
  constructor({ maxGrains=8, sampleInterval=0.25 }={}) {
    this.maxGrains=maxGrains;
    this.sampleInterval=sampleInterval;
    this.accumulator=0;
    this.sequence=0;
    this.lastEvent='none';
    this.records=new Map();
    this.crossings=0;
    this.farFromOrigin=0;
  }
  classify(position, habitats) {
    if(!is3(position)||!Array.isArray(habitats))return 'between';
    let found=null;
    for(const habitat of habitats){
      if(!habitat||typeof habitat.id!=='string'||!is3(habitat.center)||!is3(habitat.radii)||habitat.radii.some(x=>x<=0))continue;
      const normalized=Math.hypot(...position.map((v,i)=>(v-habitat.center[i])/habitat.radii[i]));
      if(normalized<=1 && (!found||normalized<found.normalized))found={id:habitat.id,normalized};
    }
    return found?.id??'between';
  }
  sample(dt, freeUnits, habitats) {
    if(!Number.isFinite(dt)||dt<0)return;
    this.accumulator+=Math.min(dt,0.25);
    if(this.accumulator<this.sampleInterval)return;
    this.accumulator=0;
    if(!Array.isArray(freeUnits))return;
    // Preserve prior journeys but never label a gripped or seated grain as currently free.
    const activeIds=new Set(freeUnits.map(u=>u?.unitId));
    for(const record of this.records.values())record.currentlyFree=activeIds.has(record.unitId);
    for(const unit of freeUnits){
      if(!unit||typeof unit.unitId!=='string'||!is3(unit.position))continue;
      let record=this.records.get(unit.unitId);
      if(!record){
        if(this.records.size>=this.maxGrains)continue;
        const zone=this.classify(unit.position,habitats);
        record={ unitId:unit.unitId, firstPosition:[...unit.position], lastPosition:[...unit.position],
          firstHabitat:zone, currentHabitat:zone, currentlyFree:true, lastKnownHabitat:zone==='between'?null:zone,
          visitedHabitats:zone==='between'?[]:[zone], enteredOtherHabitat:false,
          crossings:0, maximumReleaseDistance:0, maximumNativeError:0, samples:0 };
        this.records.set(unit.unitId,record);
      }
      const zone=this.classify(unit.position,habitats);
      const originDistance=distance(unit.position,record.firstPosition);
      const before=record.maximumReleaseDistance;
      record.maximumReleaseDistance=Math.max(before,originDistance);
      record.maximumNativeError=Math.max(record.maximumNativeError,Number.isFinite(unit.nativeError)?unit.nativeError:0);
      record.lastPosition=[...unit.position];
      record.samples++;
      record.currentHabitat=zone;
      if(zone!=='between'){
        if(record.lastKnownHabitat && record.lastKnownHabitat!==zone){
          record.crossings++;
          this.crossings++;
          this.sequence++;
          this.lastEvent='entered-different-habitat';
          record.enteredOtherHabitat=true;
        }
        record.lastKnownHabitat=zone;
        if(!record.visitedHabitats.includes(zone))record.visitedHabitats.push(zone);
      }
      if(before<3 && record.maximumReleaseDistance>=3){
        this.farFromOrigin++;
        this.sequence++;
        this.lastEvent='travelled-three-units-from-first-free-sample';
      }
    }
  }
  snapshot(){
    return { pass:'LS1D1D2P1', scope:'read-only-Silt-three-habitat-probe',
      sequence:this.sequence,lastEvent:this.lastEvent,habitatCrossings:this.crossings,
      traveledThreeUnits:this.farFromOrigin,records:[...this.records.values()].map(r=>({
        unitId:r.unitId,firstHabitat:r.firstHabitat,currentHabitat:r.currentHabitat,
        currentlyFree:r.currentlyFree,
        lastKnownHabitat:r.lastKnownHabitat,visitedHabitats:[...r.visitedHabitats],
        enteredOtherHabitat:r.enteredOtherHabitat,crossings:r.crossings,
        maximumReleaseDistance:rounded(r.maximumReleaseDistance),
        maximumNativeError:rounded(r.maximumNativeError),samples:r.samples
      })),
      changesPhysics:false,changesTraversal:false,changesEcology:false,
      offRouteSimulation:false,materialTransfer:false,progressionCredit:false };
  }
}
