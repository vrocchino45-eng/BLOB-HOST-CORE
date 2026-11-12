import assert from 'node:assert/strict';
import {installSiltObserver} from './SILT_RELEASE_OBS1_CORE.mjs';
class Route{constructor(){this.active=true;this.frameState={runtimeSeconds:1};this.root={visible:true,name:'silt',position:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},traverse(fn){fn(this);}};}update(){return 42;}}
class Movement{update(dt,f){f.playerAttachment={active:f.next,detachReason:'test'};return 17;}}
const original=Route.prototype.update,move=Movement.prototype.update;
const o=installSiltObserver(Route,Movement),r=new Route(),m=new Movement(),f={next:true};
assert.equal(r.update(),42);assert.equal(m.update(0,f),17);
r.root.visible=false;f.next=false;m.update(0,f);
const d=o.dump();assert.equal(d.current[0].silt.rootVisible,false);
assert.ok(d.events.some(e=>e.type==='root_visibility_write'&&e.after===false&&e.caller.includes('SELFTEST')));
assert.ok(d.events.some(e=>e.type==='attachment_transition'&&e.after===false));
o.stop();assert.equal(Route.prototype.update,original);assert.equal(Movement.prototype.update,move);
assert.equal(Object.getOwnPropertyDescriptor(r.root,'visible').value,false);
r.root.visible=true;assert.equal(r.root.visible,true);
class ThrowRoute extends Route{update(){throw Error('original route failure');}}
const p=installSiltObserver(ThrowRoute,Movement),t=new ThrowRoute();
assert.throws(()=>t.update(),/original route failure/);assert.ok(p.dump().events.some(e=>e.type==='route_update_threw'));p.stop();
console.log('PASS: visibility caller, detach capture, return values, exception propagation and stop restoration. Production reproduction pending.');
