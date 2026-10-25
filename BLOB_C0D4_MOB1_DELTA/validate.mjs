import assert from 'node:assert/strict';
import {readFileSync, createReadStream} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source=readFileSync(resolve(root, 'src/debug/WorldObjectCensusSystem.js'),'utf8');
const {WorldObjectCensusSystem}=await import(new URL('../src/debug/WorldObjectCensusSystem.js', import.meta.url));
let checks=0; const check=(yes,msg)=>{assert.ok(yes,msg);checks++;};
const fs={activeCellId:'CELL_SIGNAL_CHORUS_NERVE_001',
  input:{moveX:1,moveY:0,moveZ:0,pulsePressed:false},
  targeting:{targetId:null}, hubInvestigationGameplay:{active:true,nearestRouteId:'r1',lastAction:'no_target'},
  hubRouteCommitFlight:{active:false,progress:0},
  playerAttachment:{active:false,state:'free',authority:'none'},
  playerKinematics:{position:{x:0,y:0,z:0}, velocity:{x:0,y:0,z:0},speed:0,
    desiredMoveVector:{x:10,y:0,z:0},environmentalForceVector:{x:-10,y:0,z:0},
    flowVector:{x:-1,y:0,z:0},inputMagnitude:1,boundaryPressure:0,locomotionMode:'normal'}
};
const recorder=new WorldObjectCensusSystem({scene:null,frameState:fs});
recorder.captureActive=true;recorder.captureEvents=[];recorder.captureAggregate=recorder.newCaptureAggregate();
const clock=Date.now; let t=10000;Date.now=()=>t;
try {
  recorder.sampleMobility();
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-movement-sample'),'initial movement sample');
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-guidance-state-change'),'initial guidance snapshot');
  for(let i=0;i<8;i++){t+=150;recorder.sampleMobility();}
  const blocked=recorder.captureEvents.filter(e=>e.type==='c0d4-mob1-sustained-low-progress');
  check(blocked.length===1,'sustained no-progress event emits once');
  check(blocked[0].candidateReason==='opposing_environmental_force_candidate','opposition candidate explicitly scoped');
  check(blocked[0].owner.motion.intendedAcceleration.x===10 && blocked[0].owner.motion.environmentalAcceleration.x===-10,'separate force sources retained');
  t+=400; recorder.sampleMobility();
  check(recorder.captureEvents.filter(e=>e.type==='c0d4-mob1-sustained-low-progress').length===1,'no threshold event flooding');
  fs.playerKinematics.position.x=2; t+=150;recorder.sampleMobility();
  check(recorder.mobBlockSinceMs===null,'forward progress clears stall');
  fs.hubRouteCommitFlight={active:true,owner:'LocalCellBoundaryMorphSystem',routeId:'r2',progress:.45};
  fs.playerKinematics.desiredMoveVector={x:0,y:0,z:0};
  t+=150;recorder.sampleMobility();
  for(let i=0;i<7;i++){t+=150;recorder.sampleMobility();}
  const guided=recorder.captureEvents.filter(e=>e.type==='c0d4-mob1-sustained-low-progress' && e.candidateReason==='guided_hub_motion_owns_translation');
  check(guided.length===1,'active guided suppression observed');
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-guidance-state-change' && e.owner.guidedHub.active),'guided ownership edge');
  recorder.mobilityActionEdge({index:0},0);
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-action-context' && e.buttonIndex===0 && e.acceptance==='unknown'),'button dispatch not falsely accepted');
  t+=450; recorder.sampleMobility();
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-action-followup' && e.acceptance==='not_proven'),'followup cannot invent acceptance');
  recorder.mobilityActionEdge({index:0},2);
  check(recorder.captureEvents.some(e=>e.type==='c0d4-mob1-action-context' && e.buttonIndex===2),'X/button-2 context');
  check(!source.includes('playerMovementController.update(') && !source.includes('frameState.hubRouteCommitFlight.active ='), 'recorder never triggers movement or route authority');
  check(source.includes('mobilityObservationRevision: \'C0D4-MOB1\'') && source.includes('recorderSchemaVersion: 2'), 'additive schema');
  check(recorder.captureAggregate.recordedEvents===recorder.captureEvents.length,'REC1 append-only accounting intact');
  console.log(JSON.stringify({pass:'C0D4-MOB1',status:'OFFLINE_OBSERVER_AND_GUARD_PASS',checks,events:recorder.captureEvents.length,noGameplayChanged:true},null,2));
} finally {Date.now=clock;}
