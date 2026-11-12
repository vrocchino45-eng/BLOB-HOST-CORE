// Observer plumbing tests only. These fixtures are not production LS1 validation.
import assert from 'node:assert/strict';
import {installObserver} from './GSL4E2G_STAGE2C_OBSERVER.mjs';
function fixture({bad=false,mutate=false}={}){
 class Movement {update(dt,f){f.playerAttachment={...f.next};return 'movement-return';}}
 let previous;
 const adapter={sample(f){const a=f.playerAttachment;let event='none',mode='companion';
  if(previous===true&&!a.active){event=a.detachReason==='deliberate_away_input'?'deliberate_release':'unexpected_loss';mode=event==='unexpected_loss'?'concern':'companion';}
  if(previous===false&&a.active){event='attachment_recovered';mode='support';}previous=a.active;
  if(mutate)a.changed=true;
  return {event,mode};}};
 const originalSample=adapter.sample;
 class Guide {constructor(){this.gsl4e2b=adapter;}updateGuide(o,dt,f){const r=this.gsl4e2b.sample(f);f.guideInterpretation={event:r.event,intention:bad?'wrong':r.mode};return 'guide-return';}}
 const m=new Movement(),g=new Guide(),f={runtimeSeconds:0,activeCellId:'LS1_TEST'};
 const originalMove=Movement.prototype.update,originalGuide=Guide.prototype.updateGuide;
 const recorder=installObserver(Movement,Guide);
 function tick(active,reason='none'){f.next={active,detachReason:reason};f.runtimeSeconds+=.1;assert.equal(m.update(.1,f),'movement-return');assert.equal(g.updateGuide({},.1,f),'guide-return');assert.equal(adapter.sample,originalSample);}
 return {tick,f,g,recorder,Movement,Guide,originalMove,originalGuide};
}
const a=fixture();a.tick(true);assert.equal(a.recorder.dump().status,'INCOMPLETE');
a.tick(false,'deliberate_away_input');a.tick(true);a.tick(false,'sustained_contact_loss');
assert.equal(a.recorder.dump().status,'PASS');assert.equal(a.recorder.dump().pairedSamples,4);
assert.deepEqual(a.recorder.dump().coverage,{deliberate:1,unexpected:1,recovery:1});
a.recorder.stop();assert.equal(a.Movement.prototype.update,a.originalMove);assert.equal(a.Guide.prototype.updateGuide,a.originalGuide);
const b=fixture({bad:true});b.tick(true);assert.equal(b.recorder.dump().status,'FAIL');b.recorder.stop();
const c=fixture({mutate:true});c.tick(true);assert.ok(c.recorder.dump().issues.some(i=>i.kind==='attachment_mutated_during_consumer'));c.recorder.stop();
const d=fixture();d.tick(true);d.g.updateGuide({},.1,d.f);assert.ok(d.recorder.dump().issues.some(i=>i.kind==='producer_pair_missing_or_changed'));d.recorder.stop();
class M {update(){throw Error('original movement error');}} class G {updateGuide(){}}
const e=installObserver(M,G);assert.throws(()=>new M().update(),/original movement error/);e.stop();
console.log('Observer plumbing: coverage gate, chain pairing, mismatch detection, mutation detection, return values, restoration and exception propagation PASS. Production/browser run remains pending.');
