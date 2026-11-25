import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerHooks,createRequire} from 'node:module';
import {test} from 'node:test';
import {firstSphereIngress,solveNormalImpulse} from './PI04-reference.mjs';

const root=process.env.BLOB_NF_CHECKOUT, out=process.env.BLOB_NF_GEOMETRY_REPORT;
const req=createRequire(path.join(root,'package.json'));
const {Vector3,Quaternion}=req('three');
const fixture=pathToFileURL(path.join(root,'scripts/testPI02DirectedSiltLaunch.mjs'));
const fixtureSource=fs.readFileSync(fixture,'utf8');
const end=fixtureSource.indexOf("\ntest('keyboard and standard gamepad launch and retrieve");
assert.ok(end>0);
const hook=registerHooks({load(url,context,next){
  if(url!==fixture.href)return next(url,context);
  return {format:'module',shortCircuit:true,
    source:fixtureSource.slice(0,end)+'\nexport {prepare,acquire,charge,commit,releasePulse};'};
}});
let rig;
try{rig=await import(fixture.href);}finally{hook.deregister();}
const readable=unit=>['veins','garden_transit','settled'].includes(unit.phase);
const vector=value=>new Vector3().fromArray(value);
const minClear=(shape,points)=>{
  // Conservative distance lower bound using the minimum ellipsoid radius.
  const scaled=p=>p.map((value,i)=>(value-shape.center[i])/shape.radii[i]);
  const dot=(a,b)=>a.reduce((total,n,i)=>total+n*b[i],0);
  return Math.min(...points.slice(1).map((point,i)=>{
    const from=scaled(points[i]),to=scaled(point),travel=to.map((v,j)=>v-from[j]);
    const weight=dot(travel,travel);
    const t=weight>0?Math.max(0,Math.min(1,-dot(from,travel)/weight)):0;
    const nearest=from.map((n,j)=>n+t*travel[j]);
    return (Math.hypot(...nearest)-1)*Math.min(...shape.radii);
  }));
};

test('mounted owner measures candidate grains and baseline custody, with no pair injection',t=>{
  const {game,unit:first}=rig.prepare(t,{padMode:true});
  const {route,frame}=game;
  assert.equal(first.id,'silt-grain-01');
  const project=unit=>{
    const record=route.siltTrajectory.get(unit.id);
    const index=route.livingCycle.units.indexOf(unit);
    const mesh=route.livingMatterMeshes[index];
    return {id:unit.id,generation:unit.generation,phase:unit.phase,owner:route.materialIdentity.get(unit.id).owner,
      free:record??null,presentationCenter:mesh.body.position.toArray(),visible:mesh.body.visible,
      geometryId:mesh.fragment.geometry.type,displayScale:mesh.fragment.scale.toArray()};
  };
  function launchExisting(direction) {
    rig.charge(game,new Vector3(...direction));
    const release=rig.commit(game);
    rig.releasePulse(game);
    game.stabilize(false);
    return release;
  }
  const firstGrip=project(first);
  const firstRelease=launchExisting([0,1,0]);
  assert.equal(firstRelease.unitId,first.id);
  let second;
  for(let i=0;i<1200&&!second;i++){
    game.step();
    second=route.livingCycle.units.find((unit,i)=>unit.id!==first.id&&readable(unit)
      &&route.livingMatterMeshes[i].body.visible);
  }
  assert.ok(second,'another existing eligible identity');
  const secondNatural=project(second);
  const firstObservations=[];
  for(let i=0;i<120;i++){
    if(i%6===0)firstObservations.push({seconds:frame.runtimeSeconds,...project(first)});
    game.step();
  }
  rig.acquire(game,second);
  const secondGrip=project(second);
  const secondRelease=launchExisting([1,0,0]);
  assert.equal(secondRelease.unitId,second.id);
  const releasedPair={first:project(first),second:project(second)};
  for(const grain of [first,second]){
    assert.equal(route.materialIdentity.get(grain.id).mass,1);
    assert.equal(route.materialIdentity.get(grain.id).owner,'environment');
  }
  assert.equal(route.materialIdentity.totalMass(),8);
  rig.acquire(game,second);
  const secondRetrieval=project(second);
  assert.equal(secondRetrieval.owner,'grip');

  // Geometry-only corridor near the observed second release. No mounted poses are changed.
  const center=secondRelease.releasePosition;
  const seed={positionA:[center[0]-.32,center[1],center[2]],positionB:center,
    velocityA:[1,0,0],velocityB:[0,0,0],radiusA:.06,radiusB:.06,seconds:.33};
  const nearMiss={...seed,positionB:[center[0],center[1]+.14,center[2]]};
  const pathEnd=seed.positionA.map((value,i)=>value+seed.velocityA[i]*seed.seconds);
  const collider=route.freeMaterialSurface;
  const surfaceClearanceLowerBound=minClear(collider,[seed.positionA,pathEnd]);
  const nearMissRecipientSurfaceClearance=minClear(collider,[nearMiss.positionB,nearMiss.positionB]);
  assert.ok(surfaceClearanceLowerBound>.06,'surface exclusion also covers probe radius');
  assert.ok(nearMissRecipientSurfaceClearance>.06,'near miss comparison remains away from the existing fixed shelf');
  const ingress=firstSphereIngress(seed);
  assert.equal(ingress.reason,'ingress');
  assert.equal(firstSphereIngress(nearMiss).reason,'near_miss');
  const expected=[1,3].map(massB=>({massA:1,massB,...solveNormalImpulse({massA:1,massB,
    velocityA:seed.velocityA,velocityB:seed.velocityB,normal:ingress.normal})}));
  const frameOrigin=route.root.localToWorld(new Vector3());
  const transform={position:frameOrigin.toArray(),scale:route.root.getWorldScale(new Vector3()).toArray(),
    rotation:route.root.getWorldQuaternion(new Quaternion()).toArray()};
  assert.deepEqual(transform.scale,[1,1,1]);
  const ledger=route.materialIdentity.snapshot();
  const output={schema:'blob.mp03-calibration.v1',revision:1,status:'proposed-runtime-pair-measured-baseline',
    build:process.env.BLOB_NF_BUILD,numericalRevision:1,cell:frame.activeCellId,host:frame.activeHostId,
    sampledMount:frame.firstSliceRuntimeMount.mountSequence,transform,
    admittedPairs:[],proposedPair:[first.id,second.id].sort(),
    proposedRadiusLw:{[first.id]:.06,[second.id]:.06},
    proposedMassMr:[{[first.id]:1,[second.id]:1},{[first.id]:1,[second.id]:3}],
    geometryProvenance:'Route-local centers and D11B shape are runtime measurements. Spheres are hypothetical centered proxies, using 0.12 Lw combined reach in a measured clear test corridor. Visual mesh dimensions are contextual only.',
    firstGrip,firstRelease,firstObservations,secondNatural,secondGrip,secondRelease,releasedPair,secondRetrieval,
    observedPairSeparationLw:releasedPair.first.free&&releasedPair.second.free
      ?vector(releasedPair.first.free.position).distanceTo(vector(releasedPair.second.free.position)):null,
    nativeLimits:{speedLwPerSecond:route.siltTrajectory.maxSpeed,accelerationLwPerSecond2:route.siltTrajectory.maxAcceleration,
      microstepSeconds:.025}, collider, corridor:{seed,nearMiss,pathEnd,surfaceClearanceLowerBound,nearMissRecipientSurfaceClearance,
        support:'Computational clearance against the existing fixed ellipsoid. No runtime pair fixture applied.',ingress},
    testedForceScope:'Force-free analytical stage only. External native drive and drag remain owner state.',
    analyticalTraces:expected,ledgerUnits:ledger.totalMass,ledgerRecordCount:ledger.count,existingHostReceipts:game.ledger.snapshot({withRecords:true}).acceptedTotal,
    runtimeCases:{twoBodyContacts:'BLOCKED_PENDING_EXPLICIT_ADMISSION',nearMiss:'ANALYTICAL_ONLY',
      retrieval:'BASELINE_GRIP_OF_SECOND_IDENTITY_ONLY',pairedForces:'UNIMPLEMENTED'},
    proposedSeparationMarginLw:.001, proposedTieWindowSeconds:.00001,
    tiePolicy:'Reject candidate pair if native fixed-surface hit overlaps or is within an approved time-of-impact ambiguity window; preserve existing PI03 behavior.',
    lifecycle:'Candidate keyed by unordered pair plus both release IDs/generations and Host/cell/mount. Dedup until measured separation past authored clearance. Reacquisition invalidates old contact entirely. Remount needs fresh eligibility.'};
  fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({pair:output.proposedPair,clearance:surfaceClearanceLowerBound,
    latePairSeparation:output.observedPairSeparationLw,ingress:ingress.seconds,nativeMass:ledger.totalMass}));
});
