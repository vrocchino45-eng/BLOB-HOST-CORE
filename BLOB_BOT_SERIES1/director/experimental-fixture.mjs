import a from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {Vector3} from 'three';

export const spec = JSON.parse(fs.readFileSync(new URL('./scenarios/exp-002-004.json', import.meta.url)));
const fixture = new URL('../../scripts/testPI02DirectedSiltLaunch.mjs', import.meta.url);
const source = fs.readFileSync(fixture, 'utf8');
a.equal(createHash('sha256').update(source).digest('hex'), spec.sourceHash);
const parts = source.split("\ntest('keyboard and standard gamepad launch and retrieve");
a.equal(parts.length, 2);
const hook = registerHooks({ load(url, ctx, next) {
  return url !== fixture.href ? next(url, ctx) : { format: 'module', shortCircuit: true,
    source: parts[0] + '\nexport {makeGame,prepare,prepareGarden,grainMesh,charge,commit,tap,releasePulse,launch,receipts,LEFT,STEP};' };
}});
let original;
try { original = await import(fixture.href); } finally { hook.deregister(); }
export const rig = original;
export let pad;
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
export const cleanup = () => Object.defineProperty(globalThis, 'navigator', descriptor);
export const test = {mock:{getter(owner,key,get){
  Object.defineProperty(owner, key, {get,configurable:true}); pad = get().getGamepads()[0];
}}};
export const options = {padMode:true};
export const vector = array => new Vector3().fromArray(array);
export function layout(g,id) {
  const [deep_core,inner_body,membrane] = spec.layout[id], frame=g.frame;
  frame.spatialCoreChemistry = {retainedPieceCount:3,counts:{deep_core,inner_body,membrane},
    topology:{id,distribution:spec.layout[id].join(':'),complete:true}};
  g.radial.reserve01=spec.reserve;
  g.radial.publish(frame,g.radial.resolveProfile(frame));
}
export function material(g,u) {
  const mesh=rig.grainMesh(g,u), route=g.route;
  return {id:u.id, generation:u.generation, phase:u.phase, owner:route.materialIdentity.get(u.id).owner,
    mass:route.materialIdentity.totalMass(), position:mesh.position.toArray(),
    visible:mesh.visible, ndc:mesh.getWorldPosition(new Vector3()).project(g.camera).toArray(),
    held:route.siltGrip.heldId, seat:route.siltPlateSeat.unitId, free:route.siltTrajectory.get(u.id)??null,
    reserve:g.radial.reserve01, receipts:rig.receipts(g).acceptedTotal, completion:route.completed};
}
export function parity(before,after,receipts=0) {
  a.deepEqual([after.id,after.generation,before.mass,after.mass,after.completion],[before.id,before.generation,8,8,before.completion]);
  a.equal(after.receipts-before.receipts,receipts);
}
