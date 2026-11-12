// Observation only: original arguments, return values and exceptions are preserved.
export function installObserver(Movement, Guide, {limit=4000}={}) {
  const mp=Movement.prototype, gp=Guide.prototype;
  if(typeof mp.update!=='function'||typeof gp.updateGuide!=='function') throw Error('Required production methods missing');
  const move=mp.update, guide=gp.updateGuide, produced=new WeakMap(), consumedSequence=new WeakMap();
  let running=true, sequence=0, paired=0, dropped=0, errors=0;
  const rows=[], issues=[], counts={deliberate:0,unexpected:0,recovery:0};
  const snapshot=f=>JSON.stringify(f?.playerAttachment ?? null);
  const issue=(kind,detail)=>{errors++;if(issues.length<100)issues.push({kind,...detail});};
  const safe=fn=>{try{fn();}catch(e){issue('observer_error',{error:String(e)});}};
  function movement(...args){
    const result=Reflect.apply(move,this,args);
    if(running)safe(()=>{
      const f=args[1]??this.frameState;
      if(f&&typeof f==='object'){
        const previous=produced.get(f);
        produced.set(f,{sequence:++sequence,json:snapshot(f),active:f.playerAttachment?.active,
          previousActive:previous?.active,consumed:false});
      }
    });
    return result;
  }
  function consumer(...args){
    if(!running)return Reflect.apply(guide,this,args);
    const f=args[2]??this.frameState, adapter=this.gsl4e2b;
    // Do not advance/sample the adapter ourselves. Observe its real call only.
    if(!adapter||typeof adapter.sample!=='function')return Reflect.apply(guide,this,args);
    const original=adapter.sample; let capture=null;
    function sample(...input){
      let before;safe(()=>{before=snapshot(input[0]);});
      const result=Reflect.apply(original,this,input);
      safe(()=>{capture={input:input[0],before,after:snapshot(input[0]),result:{...result}};});
      return result;
    }
    adapter.sample=sample;
    let result;
    try{result=Reflect.apply(guide,this,args);}finally{if(adapter.sample===sample)adapter.sample=original;}
    safe(()=>{
      if(!capture)return;
      const p=produced.get(f), a=f.playerAttachment??{}, g=f.guideInterpretation;
      const row={sequence:p?.sequence??null,t:f.runtimeSeconds,cell:f.activeCellId,
        attachment:{active:a.active,reason:a.detachReason},adapter:capture.result,
        guide:g?{event:g.event,intention:g.intention,movementOwner:g.movementOwner,
          expressionAllowed:g.expressionAllowed}:null};
      if(!p||p.consumed||p.json!==capture.before||capture.input!==f)issue('producer_pair_missing_or_changed',row);
      else {p.consumed=true;paired++;}
      if(capture.before!==capture.after||capture.after!==snapshot(f))issue('attachment_mutated_during_consumer',row);
      if(!g||g.event!==capture.result.event||g.intention!==capture.result.mode)issue('guide_adapter_mismatch',row);
      const consecutive=p && consumedSequence.get(f)===p.sequence-1;
      if(p)consumedSequence.set(f,p.sequence);
      let transition=false;
      if(consecutive&&p.previousActive===true&&a.active===false){
        transition=true;
        if(a.detachReason==='deliberate_away_input'){
          counts.deliberate++;
          if(capture.result.event!=='deliberate_release'||capture.result.mode!=='companion')issue('deliberate_classification',row);
        }else if(a.detachReason&&a.detachReason!=='none'){
          counts.unexpected++;
          if(capture.result.event!=='unexpected_loss'||capture.result.mode!=='concern')issue('unexpected_classification',row);
        }
      }
      if(consecutive&&p.previousActive===false&&a.active===true){
        transition=true;counts.recovery++;
        if(capture.result.event!=='attachment_recovered'||capture.result.mode!=='support')issue('recovery_classification',row);
      }
      if(transition||rows.length===0){if(rows.length<limit)rows.push(row);else dropped++;}
    });
    return result;
  }
  mp.update=movement;gp.updateGuide=consumer;
  const dump=()=>({pass:'GSL-4E2G-STAGE2C',scope:'live production movement publication -> actual adapter call -> Guide interpretation',
    status:errors?'FAIL':paired&&Object.values(counts).every(n=>n>0)&&!dropped?'PASS':'INCOMPLETE',
    pairedSamples:paired,producerPublications:sequence,coverage:counts,errors,issues,transitions:rows,droppedTransitions:dropped,
    notVerified:['browser visual quality and human feel','separate Guide cooldown','unobserved attachment loss branches'],
    note:'PASS requires observed deliberate release, reason-bearing unexpected loss, recovery, and no recorded chain errors. Authored movement ownership may legitimately suppress Guide movement.'});
  return Object.freeze({dump,stop(){running=false;if(mp.update===movement)mp.update=move;if(gp.updateGuide===consumer)gp.updateGuide=guide;return dump();}});
}
