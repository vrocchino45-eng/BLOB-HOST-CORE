import a from 'node:assert/strict';
import {rig,spec,test,options,layout,material,parity,vector} from './experimental-fixture.mjs';

export function manipulate(mode) {
  const { game,unit }=rig.prepare(test,options);
  layout(game,'balanced'); game.aim(rig.LEFT);
  const start=material(game,unit), sequence=game.route.transactionSequence;
  let result;
  if(mode==='garden-placement'){
    // Existing deterministic approach setup. Actual brace, imprint and A/seat are native.
    rig.prepareGarden(game);
    a.ok(game.route.siltContact.imprinted&&game.route.siltContact.braced);
    const before=material(game,unit);
    rig.tap(game,'interact');
    a.equal(game.route.siltPlateSeat.unitId,unit.id);
    result={before,contact:game.route.siltContact.snapshot(),actions:['held_brace','pulse_imprint','seat']};
  }else{
    rig.charge(game,rig.LEFT,spec.holdSteps);
    const before=material(game,unit), charge=game.frame.input.pulseCharge01;
    if(mode==='directed-launch'){
      const release=rig.commit(game), just=material(game,unit); rig.releasePulse(game);
      a.equal(game.frame.input.pulsePressed,false); a.equal(release.actualRecipientId,null);
      a.equal(just.held,null);a.ok(just.free);
      result={charge,release,firstFree:just.free,debit:before.reserve-just.reserve,actions:['charge','directed_launch','native_X_up_suppressed']};
    }else{
      rig.releasePulse(game);
      const motion=structuredClone(game.route.heldMotionLast), just=material(game,unit);
      a.equal(just.held,unit.id);a.ok(motion.appliedDisplacement>0); a.equal(rig.launch(game),null);
      result={charge,motion,debit:before.reserve-just.reserve,actions:['charge','tether_pulse']};
    }
  }
  const end=material(game,unit);parity(start,end,mode==='directed-launch'?1:0);
  return {mode,status:'PASS',start,end,result,receipts:rig.receipts(game).records,
    decisions:game.route.transactionTrace.filter(x=>x.sequence>sequence)};
}

export function pulse(id) {
  const {game,unit}=rig.prepare(test,options);
  layout(game,id);game.aim(rig.LEFT);
  const start=material(game,unit), rounds=[];
  for(let burst=0;burst<spec.pulse.bursts;burst++){
    game.pulse(true);
    const trace=[];
    let valid,full;
    for(let step=1;step<=spec.pulse.cap;step++){
      game.step();
      const charge=game.frame.input.pulseCharge01;
      trace.push({step,frame:game.frame.frame,charge,reserve:game.radial.reserve01});
      if(charge>0) valid??=step*rig.STEP;
      if(charge>=1){full=step*rig.STEP;break;}
    }
    a.ok(valid&&full);
    const before=material(game,unit);rig.releasePulse(game);
    const accepted=structuredClone(game.route.heldMotionLast), after=material(game,unit);
    a.equal(accepted.heldGrainId,unit.id);a.equal(accepted.pulseEventId,game.frame.input.pulseEventId);a.equal(after.held,unit.id);
    const recovery=[];
    for(let j=0;j<spec.pulse.recoverySteps;j++){game.step();recovery.push(game.radial.reserve01);}
    rounds.push({valid,full,accepted,trace,recovery,debit:before.reserve-after.reserve,
      physicalMovement:vector(after.position).distanceTo(vector(before.position)),
      publishedCoreResponse:game.frame.corePerformance.verbModifiers.pulse.responseStrengthMultiplier});
  }
  a.equal(new Set(rounds.map(r=>r.accepted.pulseEventId)).size,rounds.length);
  const end=material(game,unit);parity(start,end);
  return {id,status:'PASS',start,end,rounds};
}
