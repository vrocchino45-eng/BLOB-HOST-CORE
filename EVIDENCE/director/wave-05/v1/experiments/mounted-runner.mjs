import a from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const [root,definition,output]=process.argv.slice(2);
const spec=JSON.parse(await fs.readFile(definition,'utf8'));
const read=relative=>pathToFileURL(path.join(root,relative)).href;
const head=execFileSync('git',['--no-optional-locks','-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
a.equal(head,spec.base);
const source=execFileSync('git',['--no-optional-locks','-C',root,'diff','HEAD','--name-only','--','src','public','scripts'],{encoding:'utf8'}).trim();
a.equal(source,'');
const fixture=await import(read('BLOB_BOT_SERIES1/director/experimental-fixture.mjs'));
const {rig,cleanup,test,options,layout,vector}=fixture;
const {pulse,manipulate}=await import(read('BLOB_BOT_SERIES1/director/experiment-material.mjs'));
const {PlayerMovementController}=await import(read('src/player/PlayerMovementController.js'));
const {CoreSurfaceTruthSystem}=await import(read('src/player/CoreSurfaceTruthSystem.js'));
const {CoreTendrilSurfaceContactSystem}=await import(read('src/player/CoreTendrilSurfaceContactSystem.js'));
const {CoreTendrilSupportPlaneSystem}=await import(read('src/player/CoreTendrilSupportPlaneSystem.js'));
const {CoreEmbodimentSystem}=await import(read('src/player/CoreEmbodimentSystem.js'));
const cell=JSON.parse(await fs.readFile(path.join(root,'public/data/world/localCellRecipes.json'),'utf8'))
  .find(x=>x.id==='CELL_SILT_PRESSURE_ROUTE_001');
const note=(game,tag)=>({tag,frame:game.frame.frame,step:game.frame.runtimeSimulationSubstepIndex,
  time:game.frame.runtimeSeconds,reserve:game.radial.reserve01,
  strain:game.frame.coreFlow?.strain01??null,
  reason:game.frame.coreFlow?.reason??null,phase:game.frame.coreFlow?.phase??null,
  current:game.frame.coreFlow?.result?.acceptedCurrent01??0,pressure:game.frame.coreFlow?.result?.pressure01??0,
  resistance:game.frame.coreFlow?.result?.resistance01??null,
  motion:game.playerRoot.position.toArray()});
function check(game,initial) {
  a.equal(game.route.materialIdentity.totalMass(),8);
  a.equal(rig.receipts(game).acceptedTotal,initial);
  a.equal(game.route.completed,false);
}
function shelf(id, experiment) {
  const game=rig.makeGame(test,{...options,flowExperiment:true});
  layout(game,id);
  const patch=game.route.territoryExpansion.readFlowPatch(game.frame);
  const pose=patch.center.clone().add(vector([0,0,1.18]));
  game.playerRoot.position.copy(pose);
  game.aimAt(game.route.root.worldToLocal(patch.center.clone()).toArray());
  const receipts=rig.receipts(game).acceptedTotal;
  const trace=[];
  const tick=(n,tag)=>{for(let i=0;i<n;i++){game.step();trace.push(note(game,tag));}};
  const press=value=>{game.absorb(0);tick(2,'new-press');game.absorb(value);};
  game.stabilize(true);tick(22,'target');
  a.equal(game.frame.targeting.attentionTargetId,'silt_porosity_shelf');
  let outcome;
  if(experiment==='DL-EXP-005') {
    const cfg=spec.experiments[experiment];
    press(0.65);tick(cfg.conductionSteps,'contact');
    const before=trace.at(-1);
    game.playerRoot.position.x+=cfg.offsetX;
    tick(cfg.disturbanceSteps,'disturbed');
    const disturbance=trace.at(-1);
    game.playerRoot.position.copy(pose);
    tick(cfg.conductionSteps,'restored');
    const restored=trace.at(-1);
    game.absorb(0);tick(30,'released');
    outcome={before,disturbance,restored,released:trace.at(-1)};
    a.ok(before.current>0&&disturbance.current===0&&restored.current>0&&outcome.released.current===0,
      JSON.stringify({id,outcome,selected:game.frame.targeting.attentionTargetId}));
  } else {
    const cfg=spec.experiments[experiment];
    const cycles=[];
    for (const demand of cfg.demand) {
      press(demand);
      const start=trace.at(-1);
      const before=trace.length;
      tick(cfg.conductionSteps,'demand-'+demand);
      const held=trace.slice(before);
      const end=trace.at(-1);
      game.absorb(0);game.stabilize(false);
      tick(cfg.releaseSteps,'released-'+demand);
      const settled=trace.at(-1);
      game.stabilize(true);tick(8,'reacquire');
      a.ok(held.some(x=>x.current>0)&&settled.current===0,JSON.stringify({id,demand,end,settled}));
      cycles.push({demand,start,end,settled,acceptedSteps:held.filter(x=>x.current>0).length,
        reserveAtEnd:end.reserve,minReserve:Math.min(...held.map(x=>x.reserve)),recovery:settled.reserve-end.reserve,
        pressureDose:held.reduce((sum,x)=>sum+x.pressure*rig.STEP,0)});
    }
    outcome={cycles};
  }
  check(game,receipts);
  return {id,experiment,status:'PASS',outcome,trace};
}
function attachment(id) {
  const game=rig.makeGame(test,options);
  layout(game,id);
  const {route,frame,playerRoot}=game, mesh=route.hcCrawlableSurfaceMeshes[0];
  const center=mesh.getWorldPosition(vector([0,0,0]));
  const start=center.clone().add(vector([0,mesh.scale.y+0.46,0]));
  playerRoot.position.copy(start);game.aim(vector([0,0,-1]));
  const truth=new CoreSurfaceTruthSystem({scene:playerRoot.parent,playerRoot,frameState:frame});
  truth.init();
  const contact=new CoreTendrilSurfaceContactSystem({scene:playerRoot.parent,playerRoot,frameState:frame});
  const plane=new CoreTendrilSupportPlaneSystem({playerRoot,frameState:frame});
  contact.init();plane.init();
  const embodiment=new CoreEmbodimentSystem({scene:playerRoot.parent,playerRoot,frameState:frame});
  const pad=fixture.pad;
  const movement=new PlayerMovementController({frameState:frame, playerRoot, camera:game.camera, localCellRecipe:cell});
  const trace=[];
  const receipts=rig.receipts(game).acceptedTotal;
  for(let i=0;i<120;i++){
    const phase=i<24?'neutral':i<70?'tangent':i<92?'brake':'away';
    pad.axes[0]=phase==='tangent'?.45:0;
    pad.axes[1]=phase==='away'?.4:0;
    pad.buttons[10]={value:Number(phase==='tangent'),pressed:phase==='tangent'};
    game.step();playerRoot.parent.updateMatrixWorld(true);
    truth.update(rig.STEP,frame);plane.update(rig.STEP,frame);movement.update(rig.STEP,frame);
    embodiment.updateCoreContactLanguage(frame.runtimeSeconds,rig.STEP,frame);contact.update(rig.STEP,frame);
    trace.push({...note(game,phase),speed:movement.velocity.length(),velocity:movement.velocity.toArray(),
      eligible:frame.coreSurfaceTruth?.mechanicalEligible,surface:frame.coreSurfaceTruth?.surfaceId,
      support:frame.playerAttachment?.authoredSuctionSupportActive??false,attached:frame.playerAttachment?.active??false,
      contactState:frame.coreContactLanguage?.state,sealed:frame.coreTendrilContact?.sealedCount??0,
      detach:frame.playerAttachment?.detachReason});
  }
  check(game,receipts);
  const peaks=trace.map(x=>x.speed);
  return {id,experiment:'DL-EXP-007',status:trace.some(x=>x.attached)?'PASS':'LATCH_NOT_EXERCISED',
    eligibleSteps:trace.filter(x=>x.eligible&&x.surface==='SILT_ENTRY_SEDIMENT_SHELF_D11B').length,
    authoredSurface:trace.find(x=>x.eligible)?.surface??null,
    attachedSteps:trace.filter(x=>x.attached).length,peakSpeed:Math.max(...peaks),
    accelerationAtTangent:(peaks[24]-peaks[23])/rig.STEP,
    brakingDelta:peaks[69]-peaks[91],
    reserveStart:trace[0].reserve,reserveEnd:trace.at(-1).reserve,trace};
}
const experimentRows=[];
try {
  for (const id of Object.keys(spec.layouts)) {
    for (const [experiment, run] of [['DL-EXP-005',()=>shelf(id,'DL-EXP-005')],
      ['DL-EXP-006',()=>({...pulse(id),experiment:'DL-EXP-006'})],
      ['DL-EXP-007',()=>attachment(id)],['DL-EXP-008',()=>shelf(id,'DL-EXP-008')]]) {
      try {experimentRows.push(run());} catch(error){experimentRows.push({id,experiment,status:'FAIL',reason:error.message});}
    }
  }
  const mixed=['tether-pulse','directed-launch','garden-placement'].map(manipulate);
  const result={spec,scope:'Mounted production owners, standard gamepad edges, scripted approach and disturbance poses, no family-specific placement authored.',
    experiments:experimentRows,mixed};
  await fs.writeFile(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(experimentRows.map(r=>({id:r.id,experiment:r.experiment,status:r.status,
    outcome:r.outcome,pulse:r.rounds?.map(x=>[x.accepted.appliedDisplacement,x.valid,x.full,x.debit]),authoredSurface:r.authoredSurface,
    attachedSteps:r.attachedSteps,peakSpeed:r.peakSpeed,reason:r.reason}))));
  if(experimentRows.some(x=>x.status==='FAIL'))process.exitCode=1;
}finally{cleanup();}

