// C0E3: presentation-side propagation and deliberate, bounded pressure relief.
// Receives existing C0E2-B local outcomes; it never emits Host receipts,
// applies physical force, changes progression, or invents material flow.
export const C0E3_PHYSIOLOGY = Object.freeze({
  silt: Object.freeze({name:'sediment_shedding', reliefComponent:'strain', relief:0.075, cooldown:1.45, transit:0.95, cadence:0.85}),
  vascular: Object.freeze({name:'capillary_relaxation', reliefComponent:'strain', relief:0.068, cooldown:1.20, transit:0.66, cadence:2.35}),
  grave: Object.freeze({name:'memory_venting', reliefComponent:'void', relief:0.052, cooldown:1.65, transit:1.35, cadence:0.48}),
  hub: Object.freeze({name:'junction_counterpulse', reliefComponent:'strain', relief:0.062, cooldown:1.30, transit:0.80, cadence:1.15})
});
const finiteC0E3 = x => Number.isFinite(x) ? x : 0;
const clampC0E3 = x => Math.max(0, Math.min(1, finiteC0E3(x)));

// Only a completely saturated network, and only a deliberate user event,
// may produce a release. It opens a small amount of local capacity; there is
// no automatic decay on departure and no unsanctioned inter-region exchange.
export function c0e3ApplyPressureRelief(kind, sites, sourceIndex, localCircuit) {
  const spec=C0E3_PHYSIOLOGY[kind];
  if(!spec || !Array.isArray(sites) || sites.length!==3 || !Number.isInteger(sourceIndex)
    || sourceIndex<0 || sourceIndex>2) throw Error('C0E3_INVALID_LOCAL_RELIEF');
  const site=sites[sourceIndex];
  const ready=finiteC0E3(site.c0e3Cooldown)<=0;
  const full=localCircuit?.localResponse==='network_saturated';
  if(!full || !ready) return {applied:false, reason:full?'cooldown':'not_network_saturated', amount:0,
    mode:spec.name, component:spec.reliefComponent, noHostReceipt:true};
  const key=spec.reliefComponent;
  const before=clampC0E3(site[key]);
  const amount=Math.min(before,spec.relief);
  site[key]=clampC0E3(before-amount);
  site.c0e3Cooldown=spec.cooldown;
  site.c0e3ReliefFlash=1;
  return {applied:amount>0,reason:amount>0?'local_capacity_opened':'no_releasable_pressure',
    amount:Number(amount.toFixed(6)), component:key, mode:spec.name,
    after:Number(site[key].toFixed(6)), noHostReceipt:true,
    noMaterialTransfer:true,noProgressionCredit:true};
}

// Pure bounded wave model. Transmission reaches the neighbor; dissipation
// is visible as a short local recoil and NEVER claims neighbor receipt.
export function c0e3AdvancePacket(packet, dt) {
  if(!packet) return null;
  const age=Math.max(0,finiteC0E3(packet.age)+Math.max(0,Math.min(0.12,finiteC0E3(dt))));
  const duration=Math.max(0.10,finiteC0E3(packet.duration)||0.80);
  const t=Math.min(1,age/duration);
  const dissipation=packet.kind==='dissipation';
  return {...packet,age,progress:dissipation?t*0.23:t,
    intensity:Math.max(0,(1-t)*(dissipation?0.66:1)),complete:t>=1,
    delivered:!dissipation && t>=1};
}

export function c0e3CreatePackets(kind, sourceIndex, result) {
  const spec=C0E3_PHYSIOLOGY[kind];
  if(!spec || !result || sourceIndex<0 || sourceIndex>2) return [];
  const transfers=Array.isArray(result.transfer)?result.transfer:[];
  const out=[];
  for(const target of [0,1,2].filter(index=>index!==sourceIndex)) {
    const total=transfers.filter(row=>row.to===target && row.from===sourceIndex)
      .reduce((sum,row)=>sum+Math.max(0,finiteC0E3(row.amount)),0);
    if(total>1e-9) out.push({from:sourceIndex,to:target,age:0,duration:spec.transit,
      progress:0,intensity:1,kind:'transmission',amount:Number(total.toFixed(6))});
    else if(result.localResponse==='network_saturated')
      out.push({from:sourceIndex,to:target,age:0,duration:spec.transit*0.62,
        progress:0,intensity:0.66,kind:'dissipation',amount:0});
  }
  return out;
}
