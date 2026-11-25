import {installShelfTrial} from './shelf-tape.mjs';
import {retained} from './shelf-stage.mjs';
import {captureRuntime} from './frame-capture.mjs';

export function startHandoff(runtime, scenario, automate, capture){
  const real = navigator.getGamepads.bind(navigator), pad={lt:0,rt:0};
  let owner='director', transfer=null, waiting=false;
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value(){
    if(owner==='human')return real();
    return [{id:'Director standard fixture',mapping:'standard',index:0,connected:true,axes:[0,0,0,0],
      buttons:Array.from({length:17},(_,i)=>{
        const value=i===6?pad.lt:i===7?pad.rt:0;
        return {value,pressed:value>.5,touched:value>0};
      })}];
  }});
  const toolbar=document.createElement('aside');
  toolbar.style.cssText='position:fixed;top:12px;right:12px;z-index:10000;display:flex;gap:8px;padding:8px;background:#182929;color:white';
  const title=document.createElement('span');
  title.textContent=(automate?'Automation · ':'Prepared · ')+scenario.id;
  const hand=document.createElement('button');
  hand.textContent='Take over';hand.onclick=takeover;
  const exit=document.createElement('button');
  exit.textContent='Scenario selection';exit.onclick=()=>window.returnToDirector();
  toolbar.append(title,hand,exit);document.body.append(toolbar);
  const block=event=>{
    if(event.target instanceof Node && toolbar.contains(event.target)){
      event.stopImmediatePropagation();
      return;
    }
    if(owner!=='human'){event.preventDefault();event.stopImmediatePropagation();}
  };
  const types=['keydown','mousedown','mouseup'];
  for(const type of types)addEventListener(type,block,true);
  const registry=runtime.registry,nativeUpdate=registry.update;
  const recorder=capture?captureRuntime(runtime,capture):null;
  const evidence=installShelfTrial(runtime,scenario,'input',pad,{playable:!automate});
  const neutral=()=>[...real()].every(n=>!n||[...n.axes].every(v=>Math.abs(v)<=.12)
    &&[...n.buttons].every(b=>!b.pressed&&b.value<=.08));
  function takeover(){
    if(waiting||owner==='human'||!evidence.start)return;
    waiting=true;owner='neutralizing';pad.lt=pad.rt=0;
    hand.textContent='Release controls';
    const before=retained(runtime);
    registry.update=function clearBot(dt,frame){
      const result=nativeUpdate.call(this,dt,frame),x=frame.input??{};
      const active=[x.stabilizeHeld,x.absorbHeld,x.pulseHeld,x.pulsePressed,x.interactPressed,Boolean(x.flowDemand01)];
      if(!active.some(Boolean)&&!frame.coreFlow?.result&&neutral()){
        transfer={before,after:retained(runtime),active,wallMs:performance.now(),simulationTime:frame.runtimeSeconds,frame:frame.frame,substep:frame.runtimeSimulationSubstepIndex,
          flowPhase:frame.coreFlow?.phase};
        registry.update=nativeUpdate;
        owner='human';hand.disabled=true;hand.textContent='Human input active';
      }
      return result;
    };
  }
  return {evidence,recorder,takeover,owner:()=>owner,transfer:()=>transfer};
}
