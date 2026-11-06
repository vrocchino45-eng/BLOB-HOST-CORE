// BLOB GSL-4E1A: isolated, read-only signal consumer. No LS1 imports or writes.
export const DEFAULTS = Object.freeze({range:165, returnRange:205, near:54, dwellMs:1100, recoverMs:950, curiosityMs:2500});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const point=p=>({x:Number(p?.x)||0,y:Number(p?.y)||0});
export function createBoundedExplorer(config={}) {
 const cfg={...DEFAULTS,...config};
 let state='idle', attention='core', since=0, now=0, position={x:0,y:0}, velocity={x:0,y:0}, target={x:0,y:0};
 let lastLoss=false, lastSupport=false, lastInterest='';
 const enter=(s,a)=>{if(state!==s){state=s;since=now;}attention=a;};
 function step(dtMs,signals={}){
  const dt=clamp(Number(dtMs)||0,0,50);now+=dt;
  const core=point(signals.core);const interest=signals.interest?point(signals.interest):null;
  const interestKey=interest?`${interest.x}:${interest.y}`:'';
  const loss=Boolean(signals.unexpectedLoss) && !Boolean(signals.intentionalRelease);
  const support=Boolean(signals.supportNeeded);
  const lossEdge=loss&&!lastLoss, supportEdge=support&&!lastSupport;
  const interestEdge=interestKey!==lastInterest;
  lastLoss=loss;lastSupport=support;lastInterest=interestKey;
  if(lossEdge)enter('concern','core');
  else if(state==='concern' && now-since<cfg.recoverMs){} // retain reaction window
  else if(support)enter('support','core');
  else if(state==='support' && !support && now-since<cfg.dwellMs){} // minimum hold
  else if(interest && (interestEdge||state==='idle'||state==='curiosity') && !loss && !support)enter('curiosity','environment');
  else if(state==='curiosity' && now-since<cfg.curiosityMs && !loss && !support && interest){}
  else enter('idle','core');
  if(state==='concern')target={x:core.x+88,y:core.y-48};
  else if(state==='support')target={x:core.x+cfg.near,y:core.y-18};
  else if(state==='curiosity' && interest){
   const dx=interest.x-core.x,dy=interest.y-core.y,scale=Math.min(1,cfg.range/Math.max(1,Math.hypot(dx,dy)));
   target={x:core.x+dx*scale,y:core.y+dy*scale};
  } else target={x:core.x+95,y:core.y-65};
  // hard attention boundary: never ask motion engine to exceed return radius
  const d=dist(target,core);if(d>cfg.range){const s=cfg.range/d;target={x:core.x+(target.x-core.x)*s,y:core.y+(target.y-core.y)*s};}
  // GSL-4C motion owner remains external: target only; optional observed position for range telemetry
  if(signals.guidePosition)position=point(signals.guidePosition);
  if(signals.guideVelocity)velocity=point(signals.guideVelocity);
  return Object.freeze({state,attention,target:Object.freeze({...target}),elapsedMs:now-since,rangeExceeded:dist(position,core)>cfg.returnRange,returnRequested:dist(position,core)>cfg.returnRange,observedPosition:{...position},observedVelocity:{...velocity}});
 }
 return {step,snapshot:()=>({state,attention,target:{...target},nowMs:now})};
}
