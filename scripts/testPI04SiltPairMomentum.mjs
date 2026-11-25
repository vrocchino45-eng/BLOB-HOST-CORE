import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {Vector3} from 'three';
import admission from '../src/contact/siltPairAdmission.json' with {type:'json'};
import {resolveSiltPairImpact, siltPairIds} from '../src/contact/SiltPairMomentum.js';
import {SiltTrajectoryMemory} from '../src/contact/SiltTrajectoryMemory.js';

const [A,B]=siltPairIds;
const scope={hostId:admission.scope.host,cellId:admission.scope.cell,mountSequence:3,mountCount:1,substep:0};
const stamp=(frame,generation=0)=>({...scope,frame,generation});
const close=(n,expected)=>assert.ok(Math.abs(n-expected)<=1e-12+1e-12*Math.abs(expected),n+' != '+expected);
const total=values=>Math.hypot(...values);
const pairEvents=owner=>owner.snapshot().materialPairExperiment?.contacts??[];
const setup=(mode='equal', options={})=>{
  const owner=new SiltTrajectoryMemory({spring:0,drag:0,pairExperiment:mode,...options});
  const seed=(posA=[0,0,0],posB=[.32,0,0],vA=[1,0,0],vB=[0,0,0])=>{
    for(const [id,pos,v] of [[A,posA,vA],[B,posB,vB]]){
      assert.ok(owner.beginHold(id,pos));
      assert.ok(owner.release(id,pos,{directedPulse:{direction:[1,0,0],displacement:0},freeContactSource:stamp(100)}));
      // An injected incoming fixture, after genuine release lineage. The owner
      // alone calculates all resulting velocities, motion and contact history.
      owner.free.get(id).velocity=[...v];
    }
  };
  const entries=(frame,points=[[0,0,0],[.32,0,0]],surface=null)=>[A,B].map((id,i)=>({
    id,custody:'environment',phase:'veins',seated:false,nativePoint:points[i],contact:{surface,step:stamp(frame)}
  }));
  return {owner,seed,entries};
};
function verifyEvent(event) {
  assert.ok(event);
  assert.deepEqual(event.actualRecipientIds,[A,B]);
  assert.equal(event.kind,'accepted-silt-pair');
  assert.equal(event.inventoryTransferred,false);
  assert.equal(event.hostReceipt,false);
  assert.equal(event.progressionCredit,false);
  assert.notEqual(event.units[0].releaseSequence,event.units[1].releaseSequence);
  assert.ok(event.contactSeconds>=0&&event.contactSeconds<=event.microstepSeconds);
  assert.ok(event.kineticEnergyLost>0&&event.kineticEnergyAfter<=event.kineticEnergyBefore);
  event.momentumAfter.forEach((v,i)=>close(v,event.momentumBefore[i]));
  const normal=new Vector3(...event.normal);
  event.units.forEach((u,i)=>{
    const before=new Vector3(...u.incomingVelocity),after=new Vector3(...u.outgoingVelocity);
    assert.ok(after.clone().sub(before).cross(normal).length()<1e-12);
    close(after.clone().sub(before).dot(normal)*u.mass,(i?1:-1)*event.impulse);
  });
  const [a,b]=event.units.map(u=>new Vector3(...u.contactPosition));
  close(a.distanceTo(b),.12);
}

test('relative sweep rejects approaching near miss, actual overlap, separating motion and exact tangent',()=>{
  const body=(position,velocity)=>({position,velocity,radius:.06,mass:1});
  const moving=body([0,0,0],[1,0,0]);
  for(const b of [body([.25,.14,0],[0,0,0]),body([.1,0,0],[0,0,0]),body([.14,0,0],[2,0,0]),body([.25,.12,0],[0,0,0])]){
    assert.equal(resolveSiltPairImpact(moving,b,.3),null);
  }
  for(const patch of [{radius:0},{mass:NaN},{position:[.25,NaN,0]},{velocity:[Infinity,0,0]},{mass:-1}]){
    assert.equal(resolveSiltPairImpact(moving,{...body([.25,0,0],[0,0,0]),...patch},.3),null);
  }
});

for (const [mode,expected,energy] of [['equal',.5,.25],['one-to-three',.25,.125]]) {
  test('scoped trajectory owner commits both '+mode+' participants and records the immediate invariant',()=>{
    const f=setup(mode); f.seed([0,0,0],[.319,0,0]);
    for(let frame=100;frame<105;frame++) f.owner.advancePair(.05,f.entries(frame),true);
    const records=pairEvents(f.owner);
    assert.equal(records.length,1);
    verifyEvent(records[0]);
    for(const id of [A,B]) close(f.owner.get(id).velocity[0],expected);
    close(records[0].kineticEnergyAfter,energy);
    close(records[0].momentumAfter[0],1);
  });
}

test('pair participant insert order and equal microstep catch-up produce identical motion and one delivery',()=>{
  const batched=setup(),split=setup();batched.seed([0,0,0],[.319,0,0]);split.seed([0,0,0],[.319,0,0]);
  for(let i=0;i<6;i++){
    batched.owner.advancePair(.05,batched.entries(100+i),true);
    split.owner.advancePair(.025,split.entries(100+2*i).reverse(),true);
    split.owner.advancePair(.025,split.entries(101+2*i).reverse(),true);
  }
  const [one]=pairEvents(batched.owner),[two]=pairEvents(split.owner);
  assert.equal(pairEvents(batched.owner).length,1);assert.equal(pairEvents(split.owner).length,1);
  for(const id of [A,B]) assert.deepEqual(batched.owner.get(id),split.owner.get(id));
  for(const key of ['normal','impulse','kineticEnergyAfter','momentumAfter']) assert.deepEqual(one[key],two[key]);
  assert.equal(split.owner.advancePair(.025,split.entries(111),true),null);
});

test('initial overlap, dormant, parked, seated and unrelated identities cannot transfer momentum',()=>{
  const overlap=setup();overlap.seed([0,0,0],[.1,0,0]);
  overlap.owner.advancePair(.05,overlap.entries(100),true);
  assert.equal(pairEvents(overlap.owner).length,0);
  for(const patch of [{phase:'reservoir'},{phase:'parked'},{seated:true},{id:'silt-grain-03'},{custody:'grip'}]){
    const f=setup();f.seed();
    const [a,b]=f.entries(100);
    assert.equal(f.owner.advancePair(.05,[a,{...b,...patch}],true),null);
    assert.equal(pairEvents(f.owner).length,0);
  }
});

test('wrong Host, cell, mount, generation, invalid step and unsupported transform fail closed',()=>{
  const f=setup();f.seed();
  for(const bad of [{hostId:'other'},{cellId:'other'},{generation:2},{mountCount:2},{mountSequence:4},{frame:99},{substep:-1}]){
    const [a,b]=f.entries(100);
    b.contact.step={...b.contact.step,...bad};
    assert.equal(f.owner.advancePair(.05,[a,b],true),null);
  }
  assert.equal(f.owner.advancePair(.05,f.entries(100),false),null);
  assert.equal(f.owner.advancePair(.15,f.entries(100),true),null);
  f.owner.beginHold(B,f.owner.get(B).position);
  assert.equal(f.owner.advancePair(.05,f.entries(100),true),null);
  assert.equal(pairEvents(f.owner).length,0);
});

test('unsupported impulse speed rejects both results before either changes',()=>{
  const f=setup();f.seed([0,0,0],[.12,0,0],[2.1,0,0],[0,2.1,0]);
  const rawHit=resolveSiltPairImpact({position:[0,0,0],velocity:[2.1,0,0],mass:1,radius:.06},
    {position:[.12,0,0],velocity:[0,2.1,0],mass:1,radius:.06},.025);
  assert.ok(rawHit&&total(rawHit.velocities[1])>2.1);
  f.owner.advancePair(.025,f.entries(100),true);
  assert.equal(pairEvents(f.owner).length,0);
  assert.deepEqual([f.owner.get(A).velocity,f.owner.get(B).velocity],[[2.1,0,0],[0,2.1,0]]);
});

test('native PI03 wins before or inside the tie window and remains authoritative on residual travel',()=>{
  for(const [surfaceTime,expectedPair] of [[.019,0],[.020005,0],[.02002,1]]){
    const f=setup();f.seed([0,0,0],[.14,0,0]);
    const surface={id:'fixed-shape-fixture',center:[surfaceTime+.5,0,0],radii:[.5,.2,.2]};
    f.owner.advancePair(.025,f.entries(100,undefined,surface),true);
    assert.equal(pairEvents(f.owner).length,expectedPair);
    assert.equal(f.owner.snapshot().freeMaterialContacts?.length,1);
    assert.equal(f.owner.snapshot().freeMaterialContacts[0].receiverId,surface.id);
    if(expectedPair) {
      verifyEvent(pairEvents(f.owner)[0]);
      assert.equal(f.owner.get(A).velocity[0],0);
      close(pairEvents(f.owner)[0].units[0].outgoingVelocity[0],.5);
    }
  }
});

test('continuous contact stays latched and native separation later permits a genuine new contact',()=>{
  const f=setup('one-to-three',{spring:.44,drag:.74});f.seed([0,0,0],[.13,0,0]);
  f.owner.advancePair(.05,f.entries(100,[[0,0,0],[.13,0,0]]),true);
  assert.equal(pairEvents(f.owner).length,1);
  for(let frame=101;frame<108;frame++)f.owner.advancePair(.025,f.entries(frame,[[1,0,0],[-1,0,0]]),true);
  assert.equal(pairEvents(f.owner).length,1);
  for(let frame=108;frame<142;frame++)f.owner.advancePair(.025,f.entries(frame,[[-4,0,0],[4,0,0]]),true);
  assert.ok(f.owner.get(B).position[0]-f.owner.get(A).position[0]>.121);
  for(let frame=142;frame<260&&pairEvents(f.owner).length===1;frame++)f.owner.advancePair(.025,f.entries(frame,[[4,0,0],[-4,0,0]]),true);
  const records=pairEvents(f.owner);
  assert.equal(records.length,2);
  assert.notEqual(records[0].id,records[1].id);
  assert.deepEqual(records[0].units.map(u=>u.releaseSequence),records[1].units.map(u=>u.releaseSequence));
});

test('disabled and invalid fixture names supply no pair option or gameplay publication',()=>{
  for(const unknown of [null,'__proto__','unsupported']){
    const f=setup(unknown);f.seed();
    assert.equal(f.owner.advancePair(.05,f.entries(100),true),null);
    assert.equal('materialPairExperiment' in f.owner.snapshot(),false);
    for(const entry of f.entries(100))assert.ok(f.owner.advance(entry.id,.05,entry.nativePoint,null,entry.contact));
  }
});

const fixture = new URL('./testPI02DirectedSiltLaunch.mjs', import.meta.url);
const raw=readFileSync(fixture,'utf8');
const idx=raw.indexOf("\ntest('keyboard and standard gamepad launch and retrieve");
assert.ok(idx>0);
const source=raw.slice(0,idx)
  .replace('padMode = false, flowExperiment = false','padMode = false, flowExperiment = false, siltPairExperiment = null')
  .replace('flowExperiment, recipeDataSystem:', 'flowExperiment, siltPairExperiment, recipeDataSystem:');
const hook=registerHooks({load(url,ctx,next){
  return url===fixture.href ? {format:'module',shortCircuit:true,
    source:source+'\nexport {prepare,acquire,charge,commit,releasePulse,receipts};'} : next(url,ctx);
}});
let rig;
try{rig=await import(fixture.href);}finally{hook.deregister();}
const mounted=[];
function stagedMounted(t, mode, miss=false){
  const {game,unit:first}=rig.prepare(t,{padMode:true,siltPairExperiment:mode});
  const route=game.route, owner=route.siltTrajectory;
  assert.equal(first.id,A);
  const release=direction=>{
    rig.charge(game,new Vector3(...direction));
    const proof=rig.commit(game);
    rig.releasePulse(game);
    game.stabilize(false);
    return proof;
  };
  const releases=[release([0,1,0])];
  let second=route.livingCycle.units.find(u=>u.id===B);
  for(let i=0;i<1200&&!['veins','garden_transit','settled'].includes(second.phase);i++)game.step();
  rig.acquire(game,second);
  releases.push(release([1,0,0]));
  assert.equal(releases[1].unitId,B);
  const baseline=rig.receipts(game);
  const progression=[route.completed,route.pressureRead,route.ribsReleased,route.safeMatterAbsorbed];
  const seed=miss?admission.measuredCorridor.miss:admission.measuredCorridor.seed;
  const initial=[];
  for(const [id,position,velocity] of [[A,seed.positionA,seed.velocityA],[B,seed.positionB,seed.velocityB]]){
    const record=owner.free.get(id);
    assert.equal(route.materialIdentity.get(id).owner,'environment');
    assert.ok(record?.freeContact?.source);
    initial.push({id,scope:record.freeContact.source,release:record.freeContact.releaseSequence,position,velocity});
    record.position=[...position]; record.velocity=[...velocity]; // Staged incoming corridor only.
  }
  for(let i=0;i<(miss?34:65)&&(miss||!pairEvents(owner).length);i++)game.step();
  const events=pairEvents(owner);
  assert.deepEqual(rig.receipts(game),baseline);
  assert.deepEqual([route.completed,route.pressureRead,route.ribsReleased,route.safeMatterAbsorbed],progression);
  assert.equal(route.materialIdentity.totalMass(),8);
  assert.deepEqual([owner.get(A).position,owner.get(B).position],route.livingMatterMeshes
    .filter(m=>[A,B].includes(m.unitId)).map(m=>m.body.position.toArray()));
  const evidence={mode,miss,initial,releases,events,custody:route.materialIdentity.snapshot(),beforeAndAfterReceiptHashEqual:true,
    creditsAtImpact:baseline.acceptedTotal,progression,staging:'Native control-based releases; observed owner initial positions and velocities staged. No output seeded.'};
  return {game,route,owner,first,second,release,evidence};
}

for(const mode of ['equal','one-to-three']){
  test('mounted '+mode+' fixture measures actual native-drive boundaries and retrieves both grains',t=>{
    const m=stagedMounted(t,mode);
    assert.equal(m.evidence.events.length,1);
    const event=m.evidence.events[0];verifyEvent(event);
    const reaction=m.owner.get(A);
    assert.ok(Number.isFinite(reaction.velocity[0]));
    const oldIds=event.units.map(unit=>unit.releaseSequence);
    const retrievals=[];
    for(const [i,unit] of [m.first,m.second].entries()){
      rig.acquire(m.game,unit);
      assert.equal(m.owner.get(unit.id),null);
      assert.equal(m.route.materialIdentity.get(unit.id).owner,'grip');
      const released=m.release(i===0?[-1,0,0]:[1,0,0]);
      const fresh=m.owner.free.get(unit.id).freeContact.releaseSequence;
      assert.notEqual(fresh,oldIds[i]);
      retrievals.push({id:unit.id,owner:'grip then environment',fresh,release:released});
    }
    const HUB='CELL_SIGNAL_CHORUS_NERVE_001';
    m.game.mount(HUB);m.game.step();
    const hidden=m.owner.get(A);
    m.game.steps(8);assert.deepEqual(m.owner.get(A),hidden);
    m.game.mount(scope.cellId);m.game.steps(4);
    assert.equal(pairEvents(m.owner).length,1);
    assert.equal(m.route.materialIdentity.totalMass(),8);
    mounted.push({...m.evidence,retrievals,remountRetainedHistoricalEvent:true});
  });
}
test('mounted corridor near miss delivers no paired or fixed surface effect',t=>{
  const m=stagedMounted(t,'equal',true);
  assert.equal(m.evidence.events.length,0);
  assert.equal(m.owner.snapshot().freeMaterialContacts,undefined);
  mounted.push(m.evidence);
});
test('ordinary free and fixed-surface traces match the exact admitted IN01 owner',async()=>{
  const original=execFileSync('git',['--no-optional-locks','show',admission.baseline+':src/contact/SiltTrajectoryMemory.js']);
  const {SiltTrajectoryMemory: Original}=await import('data:text/javascript;base64,'+original.toString('base64'));
  const prior=new Original(),current=new SiltTrajectoryMemory();
  const surface=admission.measuredCorridor.surface;
  const start=[surface.center[0]-surface.radii[0]-.03,surface.center[1],surface.center[2]];
  for(const owner of [prior,current]){
    owner.beginHold(A,start);
    owner.release(A,start,{directedPulse:{direction:[1,0,0],displacement:.28},freeContactSource:stamp(100)});
  }
  for(let i=0;i<80;i++){
    const dt=i%2?.016:.05;
    const contact={surface,step:stamp(100+i)};
    const point=[i>=25&&i<50?-5:1,start[1],start[2]];
    assert.deepEqual(current.advance(A,dt,point,null,contact),prior.advance(A,dt,point,null,contact));
    assert.deepEqual(current.snapshot(),prior.snapshot());
  }
  assert.ok(prior.snapshot().freeMaterialContacts.length>0);
});

test('mounted native attraction separates the same release pair and then drives a second measured ingress',t=>{
  const m=stagedMounted(t,'one-to-three');
  assert.equal(m.evidence.events.length,1);
  const receipt=rig.receipts(m.game);
  const center=m.owner.get(B).position;
  const copyNative=m.route.copyNativeGrainPosition;
  const targets=new Map();
  // A staged attractor path supplies inputs to the existing native forces.
  // The fixture never rewrites grain motion, contact records or ownership.
  m.route.copyNativeGrainPosition=function(unit,index,out){
    return targets.has(unit.id)?out.fromArray(targets.get(unit.id)):copyNative.call(this,unit,index,out);
  };
  const point=x=>[center[0]+x,center[1],center[2]];
  const phases=[];
  try{
    targets.set(A,point(-1));targets.set(B,point(1));
    let gap=0;
    for(let i=0;i<48;i++){
      m.game.step(.025);
      gap=new Vector3(...m.owner.get(A).position).distanceTo(new Vector3(...m.owner.get(B).position));
    }
    assert.ok(gap>.121);
    phases.push({name:'separated',clearance:gap,targets:[...targets]});
    targets.set(A,point(0));targets.set(B,point(0));
    for(let i=0;i<260&&pairEvents(m.owner).length===1;i++)m.game.step(.025);
    const events=pairEvents(m.owner);
    assert.equal(events.length,2);
    events.forEach(verifyEvent);
    assert.notEqual(events[0].id,events[1].id);
    assert.deepEqual(events[0].units.map(x=>x.releaseSequence),events[1].units.map(x=>x.releaseSequence));
    assert.deepEqual(rig.receipts(m.game),receipt);
    assert.equal(m.route.materialIdentity.totalMass(),8);
    phases.push({name:'recontact',targets:[...targets]});
    mounted.push({...m.evidence,repeat:true,events,phases});
  }finally{m.route.copyNativeGrainPosition=copyNative;}
});

test.after(()=>{
  const output=process.env.BLOB_PI04_MOUNTED_REPORT;
  if(output) writeFileSync(output,JSON.stringify({revision:2,admissionRevision:1,numericalRevision:1,mounted},null,2)+'\n');
});
