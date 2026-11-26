import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerHooks, createRequire } from 'node:module';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

const [root, output] = process.argv.slice(2);
const require = createRequire(path.join(root,'package.json'));
const { Vector3 } = require('three');
const moduleAt = name => pathToFileURL(path.join(root,name)).href;
const original = moduleAt('scripts/testPI02DirectedSiltLaunch.mjs');
const code = fs.readFileSync(new URL(original),'utf8');
const ending = code.indexOf("\ntest('keyboard and standard gamepad launch and retrieve");
assert.ok(ending > 0);
const hook = registerHooks({load(url, context, next) {
  if (url !== original) return next(url,context);
  const fixture = code.slice(0,ending).replace('coreFlowSystem: flow, flowExperiment',
    'coreFlowSystem: flow, flowExperiment, playtestHudSystem: {update: PlaytestHudSystem.prototype.update}');
  return {format:'module',shortCircuit:true,source:"import {PlaytestHudSystem} from '../src/ui/PlaytestHudSystem.js';\n"+fixture+
    '\nexport {makeGame,prepare,charge,commit,releasePulse,acquire};'};
}});
let rig;
try { rig = await import(original); } finally { hook.deregister(); }
const source = execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const observations = {};
test('measured native directed release and PI03 fixed contact in ordinary mode', t => {
  const {game,unit} = rig.prepare(t,{padMode:true});
  const route=game.route, site=route.freeMaterialSurface, frame=game.frame;
  assert.equal(route.siltTrajectory.pairFixture ?? null,null);
  const fixedStart=new Vector3().fromArray(site.center);
  fixedStart.x -= site.radii[0] + 0.08;
  game.playerRoot.position.copy(route.root.localToWorld(fixedStart.sub(route.siltGripLocalOffset)));
  game.steps(10);
  rig.charge(game,new Vector3(1,0,0));
  const committed=rig.commit(game);
  const accepted=frame.playerInformation?.accepted.launch;
  if(frame.playerInformation) {
    assert.equal(accepted.grain,unit.id);
    assert.equal(accepted.actualRecipient,null);
    assert.equal(accepted.sequence,committed.chargeSequence);
  }
  rig.releasePulse(game);
  game.stabilize(false);
  let contact;
  for(let i=0;i<60&&!contact;i++){game.step();contact=route.siltTrajectory.freeContacts.at(-1);}
  assert.equal(contact.receiverId,site.id);
  if(frame.playerInformation) {
    assert.equal(frame.playerInformation.accepted.freeMaterial[0].actualRecipient,contact.receiverId);
    assert.equal(frame.playerInformation.accepted.freeMaterial[0].generation,contact.generation);
  }
  const ordinary={committed,contact,reserve:game.radial.reserve01,attachment:frame.playerAttachment??null,
    trajectory:route.siltTrajectory.snapshot(),ledger:game.ledger.snapshot({withRecords:true}),
    progression:[route.pressureRead,route.ribsReleased,route.safeMatterAbsorbed,route.completed,route.returnFoldReady],
    inventory:route.materialIdentity.snapshot()};
  assert.equal(route.materialIdentity.totalMass(),8);
  observations.ordinary=ordinary; observations.information=Boolean(frame.playerInformation);
});
test('receiver-confirmed Flow and latest sample compared independently of UI', t => {
  const game=rig.makeGame(t,{padMode:true,flowExperiment:true}), frame=game.frame, route=game.route;
  const patch=route.territoryExpansion.readFlowPatch(frame);
  game.playerRoot.position.copy(patch.center).add(new Vector3(0,0,1.18));
  game.aimAt(route.root.worldToLocal(patch.center.clone()).toArray());
  game.stabilize(true);game.steps(22);
  game.absorb(.65);game.steps(40);
  const flow=frame.coreFlow.result;
  assert.ok(flow?.acceptedCurrent01>0);
  if(frame.playerInformation) {
    const live=frame.playerInformation.accepted.flow;
    assert.deepEqual([live.current01,live.pressure01,live.resistance01,live.actualRecipient],
      [flow.acceptedCurrent01,flow.pressure01,flow.resistance01,flow.receiverId]);
  }
  const reserve=game.radial.reserve01;
  game.absorb(0);game.step();
  assert.equal(frame.coreFlow.result,null);
  if(frame.playerInformation){
    assert.equal(frame.playerInformation.accepted.flow,null);
    assert.ok(frame.playerInformation.history.lastFlowDelivery.current01>0);
  }
  observations.flow={flow,reserve,afterReserve:game.radial.reserve01,inventoryQ:route.materialIdentity.totalMass(),
    receipts:game.ledger.snapshot({withRecords:true})};
  fs.writeFileSync(output,JSON.stringify({source,observations},null,2)+'\n',{flag:'wx'});
});
