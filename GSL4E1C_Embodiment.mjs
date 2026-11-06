// GSL-4E1C visual-only expression layer. Does not alter controller, target, velocity or physics.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const styles={
 idle:{stretch:1,wide:1,lean:0,tension:0,halo:.15},
 curiosity:{stretch:1.32,wide:.82,lean:.30,tension:.12,halo:.12},
 support:{stretch:.91,wide:1.22,lean:.06,tension:0,halo:.80},
 concern:{stretch:.77,wide:.76,lean:-.24,tension:1,halo:.08}
};
export function createEmbodiment(){
 let s={...styles.idle},angle=0,time=0;
 function step(dtMs,info={}){
  const dt=clamp(Number(dtMs)||0,0,50);time+=dt;
  const state=styles[info.state]?info.state:'idle',phase=info.phase||'';
  const target={...styles[state]};
  if(state==='curiosity'&&['notice','orient'].includes(phase)){target.stretch=1.08;target.lean=.12;}
  if(state==='curiosity'&&phase==='inspect'){target.stretch=1.18;target.lean=.22;}
  if(state==='support'&&phase==='accompany')target.halo=.65;
  if(state==='concern'&&phase==='startle'){target.stretch=.64;target.wide=.65;target.tension=1.3;}
  if(state==='concern'&&phase==='recover'){target.tension=.28;target.stretch=.95;target.wide=.95;}
  const alpha=1-Math.exp(-dt/(state==='concern'?95:220));
  for(const k of Object.keys(s))s[k]=smooth(s[k],target[k],alpha);
  const desired=Number.isFinite(info.attentionAngle)?info.attentionAngle:angle;
  const diff=Math.atan2(Math.sin(desired-angle),Math.cos(desired-angle));
  angle+=diff*(1-Math.exp(-dt/140));
  const breath=1+.035*Math.sin(time*.0038);
  return {state,phase,angle,scaleX:s.stretch*breath,scaleY:s.wide/breath,lean:s.lean,tension:s.tension,halo:s.halo,breath};
 }
 return {step,snapshot:()=>({...s,angle,time})};
}
