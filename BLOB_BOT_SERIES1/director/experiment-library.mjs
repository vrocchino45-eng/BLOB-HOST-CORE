import a from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {Vector3} from 'three';
import {rig,pad,cleanup,test,options,spec,layout,vector} from './experimental-fixture.mjs';
import {manipulate,pulse} from './experiment-material.mjs';
import {PlayerMovementController} from '../../src/player/PlayerMovementController.js';
import {CoreTopologyResonanceSystem} from '../../src/player/CoreTopologyResonanceSystem.js';
import {CoreTopologyEnvironmentalHandlingSystem} from '../../src/player/CoreTopologyEnvironmentalHandlingSystem.js';

const local = JSON.parse(fs.readFileSync(new URL('../../public/data/world/localCellRecipes.json',import.meta.url)));
const cell = local.find(entry=>entry.id==='CELL_SILT_PRESSURE_ROUTE_001');
const dt = rig.STEP;
const seconds = count=>Number.isFinite(count)?count*dt:null;

function mobility(id,policy){
  const g=rig.makeGame(test,options);
  layout(g,id);
  const f=g.frame, cfg=spec.mobility, start=g.route.root.localToWorld(vector(cfg.offset));
  g.playerRoot.position.copy(start);
  g.camera.position.copy(start).add(new Vector3(0,0,3));g.camera.lookAt(start);g.camera.updateMatrixWorld(true);
  const movement=new PlayerMovementController({frameState:f,playerRoot:g.playerRoot,camera:g.camera,localCellRecipe:cell});
  const resonance=new CoreTopologyResonanceSystem({frameState:f});
  const handling=new CoreTopologyEnvironmentalHandlingSystem({frameState:f});
  const boot={host:f.activeHostId,cell:f.activeCellId,position:start.toArray(),camera:g.camera.quaternion.toArray(),
    velocity:movement.velocity.toArray(),chemistry:f.playerComposition,reserve:g.radial.reserve01,
    mass:g.route.materialIdentity.totalMass(),receipts:rig.receipts(g).acceptedTotal};
  const trace=[];
  let phase='forward', turn, turnX, brake, stop, speedAt, reached, switched, distance=0;
  for(let i=0;i<cfg.limit;i++){
    const p=g.playerRoot.position;
    if(phase==='forward'&&(policy==='input'?i>=cfg.forwardSteps:start.z-p.z>=cfg.forward)){
      turn=i;turnX=p.x;phase='turn';
    }
    if(phase==='turn'&&(policy==='input'?i-turn>=cfg.turnSteps:p.x-turnX>=cfg.side)){
      phase='brake';brake=i;
    }
    const boost=phase!=='brake';
    pad.axes[0]=phase==='turn'?cfg.axis:0;pad.axes[1]=phase==='forward'?-cfg.axis:0;
    pad.buttons[10]={value:Number(boost),pressed:boost};
    const previous=f.corePerformance,reserve=g.radial.reserve01;
    resonance.update(dt,f);handling.update(dt,f);
    g.step();
    const settled=f.corePerformance;
    f.corePerformance=previous;movement.update(dt,f);f.corePerformance=settled;
    const speed=movement.velocity.length();
    if(speed>=cfg.target) speedAt??=i+1;
    if(start.z-p.z>=cfg.forward) reached??=i+1;
    if(phase==='turn'&&movement.velocity.x>Math.abs(movement.velocity.z)) switched??=i+1;
    if(phase==='brake'&&stop===undefined){ distance+=speed*dt;if(speed<=cfg.rest)stop=i+1; }
    trace.push({frame:f.frame,simulationTime:(i+1)*dt,phase,position:p.toArray(),velocity:movement.velocity.toArray(),
      speed,axes:[f.input.moveX,f.input.moveZ,f.input.boostHeld],reserve:g.radial.reserve01,
      debit:Math.max(0,reserve-g.radial.reserve01),attached:f.playerAttachment?.active===true});
    if(brake!==undefined&&i-brake>=cfg.recoverySteps)break;
  }
  const coverage={turn,brake,stop,speedAt,reached,switched};
  a.equal(g.route.materialIdentity.totalMass(),boot.mass);
  a.equal(rig.receipts(g).acceptedTotal,boot.receipts);
  a.ok(trace.every(row=>!row.attached));
  return {id,policy,boot,coverage,status:Object.values(coverage).every(Number.isFinite)?'PASS':'NOT_EXERCISED',
    initialAcceleration:trace[0].speed/dt,timeToSpeed:seconds(speedAt),traversalTime:seconds(reached),
    turnDelay:seconds(switched-turn),brakingTime:seconds(stop-brake),brakingDistance:distance,
    peakSpeed:Math.max(...trace.map(x=>x.speed)),debit:trace.reduce((n,x)=>n+x.debit,0),
    minimumReserve:Math.min(...trace.map(x=>x.reserve)),recoveredReserve:trace.at(-1).reserve,trace};
}
const root=path.resolve(import.meta.dirname,'../..');
const git=(...args)=>execFileSync('git',['--no-optional-locks','-C',root,...args],{encoding:'utf8'}).trim();
a.equal(git('rev-parse','HEAD'),spec.base);
a.equal(git('diff','HEAD','--name-only','--','src','scripts','public'),'');
const output=path.resolve(process.argv[2]??'');
a.ok(process.argv[2]&&path.relative(root,output).startsWith('..'));
fs.mkdirSync(output);
try{
  const manipulation=['tether-pulse','directed-launch','garden-placement'].map(manipulate);
  const movement=['input','objective'].flatMap(policy=>Object.keys(spec.layout).map(id=>mobility(id,policy)));
  const pulses=Object.keys(spec.layout).map(pulse);
  for(const r of manipulation)a.deepEqual(r.start,manipulation[0].start);
  for(const r of movement)a.deepEqual(r.boot,movement[0].boot);
  for(const r of pulses)a.deepEqual(r.start,pulses[0].start);
  const data={scope:'Mounted owner execution. Production input resolution, staged approach where declared, fixed native update calls and unrendered projection.',spec,
    manipulation,movement,pulses};
  fs.writeFileSync(path.join(output,'mounted-experiments.json'),JSON.stringify(data,null,2)+'\n');
  console.log(JSON.stringify({manipulation:manipulation.map(x=>[x.mode,x.status]),
    mobility:movement.map(({trace,...x})=>x),pulse:pulses.map(x=>[x.id,...x.rounds.map(b=>[b.valid,b.full,b.accepted.appliedDisplacement,b.debit])])}));
  if(movement.some(r=>r.status!=='PASS'))process.exitCode=1;
}finally{cleanup();}
