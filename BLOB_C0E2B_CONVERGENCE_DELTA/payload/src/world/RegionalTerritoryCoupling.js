// C0E2-B: bounded, region-local three-organ coupling. This is NOT the Host
// receipt circuit. It never updates objectives, consumes objects, or mints receipts.
export const C0E2B_CIRCUIT = Object.freeze({
  silt: Object.freeze({name: 'sediment_pressure_spread', share: 0.26, overflowShare: 0.72}),
  vascular: Object.freeze({name: 'membrane_load_exchange', share: 0.34, overflowShare: 0.80}),
  grave: Object.freeze({name: 'imprint_resonance_echo', share: 0.22, overflowShare: 0.56}),
  hub: Object.freeze({name: 'junction_response_echo', share: 0.28, overflowShare: 0.70})
});
const DELTAS = Object.freeze({
  silt: {pulse:[0,.25,0], stabilize:[.22,-.13,0], absorb:[0,-.08,.15]},
  vascular: {pulse:[0,.19,0], stabilize:[.19,-.15,0], absorb:[0,-.10,.17]},
  grave: {pulse:[0,.23,0], stabilize:[.25,-.06,0], absorb:[.05,-.04,.15]},
  hub: {pulse:[0,.14,0], stabilize:[.22,-.11,0], absorb:[0,-.05,.18]}
});
const KEYS = ['imprint','strain','void'];
const clamp = x => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
const finite = x => Number.isFinite(x) ? x : 0;

// Three authored sites: each has two outgoing, directed relationships (six
// independent directions). Positive verb response splits into a local component
// and two neighbors. Overflow at a saturated source redistributes within fixed
// bounds; any blocked transfer dissipates. No autonomous generation or runaway.
export function c0e2bApplyLocalCoupling(kind, sites, sourceIndex, verb) {
  const contract = C0E2B_CIRCUIT[kind];
  const delta = DELTAS[kind]?.[verb];
  if (!contract || !delta || sites.length !== 3 || !Number.isInteger(sourceIndex)
      || sourceIndex < 0 || sourceIndex > 2) throw new Error('C0E2B_INVALID_LOCAL_EXPERIMENT');
  const before = sites.map(site => Object.fromEntries(KEYS.map(key => [key,clamp(site[key])])));
  const after = before.map(state => ({...state}));
  const neighbors = [0,1,2].filter(i=>i!==sourceIndex);
  const transfer = [];
  let dissipated = 0;
  let saturated = false;
  for (let k=0;k<KEYS.length;k++) {
    const key = KEYS[k];
    const amount = finite(delta[k]);
    if (amount <= 0) {
      after[sourceIndex][key] = clamp(after[sourceIndex][key] + amount);
      continue;
    }
    const localWanted = amount * (1 - contract.share);
    const sourceCapacity = 1 - after[sourceIndex][key];
    const acceptedLocal = Math.min(localWanted, sourceCapacity);
    after[sourceIndex][key] += acceptedLocal;
    const overflow = localWanted - acceptedLocal;
    saturated ||= overflow > 1e-8;
    const outbound = amount * contract.share + overflow * contract.overflowShare;
    const each = outbound / 2;
    for (const targetIndex of neighbors) {
      const accepted = Math.min(each, 1-after[targetIndex][key]);
      after[targetIndex][key] += accepted;
      dissipated += each - accepted;
      if (accepted > 1e-10) transfer.push({from:sourceIndex,to:targetIndex,component:key,amount:Number(accepted.toFixed(6))});
    }
    dissipated += overflow * (1-contract.overflowShare);
  }
  for(let i=0;i<3;i++) for(const key of KEYS) sites[i][key]=clamp(after[i][key]);
  const net = after.map((state,i)=>({index:i, before:before[i], after:{...state}}));
  const transmitted = transfer.reduce((s,t)=>s+t.amount,0);
  return {
    circuit:contract.name, sourceIndex, verb, saturated, outgoingDirections:2,
    transfer, transmitted:Number(transmitted.toFixed(6)),
    dissipated:Number(dissipated.toFixed(6)),
    localResponse:saturated ? (transmitted>1e-8 ? 'saturation_redistributed' : 'network_saturated') : 'coupled',
    siteStates:net, noHostReceipt:true, noMaterialTransfer:true, noProgressionCredit:true
  };
}
