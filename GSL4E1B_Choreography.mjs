// GSL-4E1B: isolated choreography layer. Does not own position or LS1 physics.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const P={idle:[['drift',Infinity]],curiosity:[['notice',260],['orient',240],['anticipate',220],['approach',1050],['inspect',900],['recover',600]],support:[['notice',160],['orient',170],['approach',700],['settle',420],['accompany',Infinity]],concern:[['startle',180],['recoil',450],['hesitate',480],['return',850],['observe',650],['recover',Infinity]]};
const pt=p=>({x:Number(p?.x)||0,y:Number(p?.y)||0});
export function createChoreography(){
 let state='idle',phaseIndex=0,phaseMs=0,attentionAngle=0,now=0,entry={x:0,y:0},lastTarget={x:0,y:0},lossHold=false;
 function step(dtMs,input={}){
  const dt=clamp(Number(dtMs)||0,0,50);now+=dt;
  const core=pt(input.core),pos=pt(input.position),requested=pt(input.target);
  const next=['idle','curiosity','support','concern'].includes(input.state)?input.state:'idle';
  if(next!==state){state=next;phaseIndex=0;phaseMs=0;entry={...pos};lossHold=state==='concern';}
  phaseMs+=dt;
  const phases=P[state];
  while(phaseIndex<phases.length-1&&phaseMs>=phases[phaseIndex][1]){phaseMs-=phases[phaseIndex][1];phaseIndex++;entry={...pos};}
  const phase=phases[phaseIndex][0],progress=Number.isFinite(phases[phaseIndex][1])?clamp(phaseMs/phases[phaseIndex][1],0,1):0;
  const direction=state==='curiosity'?requested:core;
  const desiredAngle=Math.atan2(direction.y-pos.y,direction.x-pos.x);
  let delta=Math.atan2(Math.sin(desiredAngle-attentionAngle),Math.cos(desiredAngle-attentionAngle));
  attentionAngle+=clamp(delta,-.07,.07);
  // During attention/anticipation, preserve current location; no teleport, only target changes.
  let target={...requested};
  if(['notice','orient','anticipate','startle','hesitate'].includes(phase))target={...entry};
  if(phase==='recoil'){
   const dx=pos.x-core.x,dy=pos.y-core.y,d=Math.max(1,Math.hypot(dx,dy));
   target={x:core.x+dx/d*125,y:core.y+dy/d*125};
  }
  if(phase==='inspect')target={x:requested.x+Math.sin(now*.004)*12,y:requested.y+Math.cos(now*.003)*8};
  if(phase==='settle'||phase==='accompany')target={x:requested.x+Math.sin(now*.0015)*5,y:requested.y+Math.cos(now*.0015)*5};
  if(phase==='recover')target={...requested};
  // Bounded exploration applies to all choreography targets, including recoil.
  const dx=target.x-core.x,dy=target.y-core.y,d=Math.hypot(dx,dy),radius=Number(input.range)||165;
  if(d>radius){target={x:core.x+dx/d*radius,y:core.y+dy/d*radius};}
  lastTarget=target;
  return {state,phase,phaseProgress:progress,attentionAngle,target:{...target},phaseMs,elapsedMs:now,interrupted:lossHold&&state==='concern'};
 }
 return {step,snapshot:()=>({state,phase:P[state][phaseIndex][0],phaseMs,attentionAngle,target:{...lastTarget}})};
}
