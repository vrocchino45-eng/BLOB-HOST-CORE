import { CoreRadialPerformanceSystem } from '../player/CoreRadialPerformanceSystem.js';

export const CORE_LABEL_ZONES = Object.freeze(['deep_core', 'inner_body', 'membrane']);
const zoneName = id => ({deep_core:'Deep Core', inner_body:'Inner Body', membrane:'Membrane'})[id] ?? 'Unknown zone';
const familyName = id => ({grave_memory_retention:'Grave', vascular_rhythm_retention:'Vascular', silt_pressure_retention:'Silt'})[id] ?? 'Unidentified piece';
const metrics = p => ({
  charge: p.verbModifiers.pulse.chargeRateMultiplier,
  reach: p.verbModifiers.pulse.structuralReachMultiplier,
  absorb: p.verbModifiers.absorb.progressMultiplier,
  coherence: p.verbModifiers.stabilize.coherenceMultiplier,
  recovery: p.traits.recovery,
  endurance: p.traits.enduranceCapacity
});
const validCounts = c => c && CORE_LABEL_ZONES.every(z => Number.isInteger(c[z]) && c[z] >= 0)
  && CORE_LABEL_ZONES.reduce((sum,z) => sum+c[z],0) === 3;

// Read-only counterfactual. Reuse the physiology owner on a private frame; never
// update the live owner, reserve, placement, input, targeting or progression.
export function previewCoreArrangement(counts, reserve01 = 1) {
  if (!validCounts(counts) || !Number.isFinite(reserve01) || reserve01 < 0 || reserve01 > 1) return null;
  const distribution = CORE_LABEL_ZONES.map(z=>counts[z]).join(':');
  const f = {input:{}, spatialCoreChemistry:{counts:{...counts}, retainedPieceCount:3,
    topology:{id:'label_preview', label:'Arrangement preview', distribution, complete:true}}};
  const owner = new CoreRadialPerformanceSystem({frameState:f, playerRoot:{userData:{}}});
  owner.reserve01 = reserve01;
  const profile = owner.resolveProfile(f);
  owner.updateReserve(0,f,profile);
  owner.publish(f,profile);
  return {distribution, personality:f.corePerformance.personality, ...metrics(f.corePerformance)};
}

export function buildCoreArrangementLabels(f = {}, {repairTrialEnabled = false} = {}) {
  const chemistry = f.spatialCoreChemistry ?? {}, work = f.coreWorkManipulation ?? {};
  const placements = Array.isArray(chemistry.placements) ? chemistry.placements : [];
  const selected = placements.find(p => p.pieceId === work.selectedPieceId) ?? null;
  const counts = chemistry.counts;
  const complete = chemistry.retainedPieceCount === 3 && chemistry.topology?.complete === true
    && placements.length === 3 && new Set(placements.map(p=>p.pieceId)).size === 3
    && placements.every(p=>CORE_LABEL_ZONES.includes(p.zoneId)) && validCounts(counts)
    && CORE_LABEL_ZONES.every(z=>placements.filter(p=>p.zoneId===z).length === counts[z]);
  const performance = f.corePerformance;
  const validPerformance = complete && performance?.active === true
    && performance.owner === 'CoreRadialPerformanceSystem'
    && performance.distribution === CORE_LABEL_ZONES.map(z=>counts[z]).join(':')
    && performance.topologyId === chemistry.topology.id
    && Number.isFinite(performance.endurance?.reserve01)
    && performance.endurance.reserve01 >= 0 && performance.endurance.reserve01 <= 1
    && ['pulse','absorb','stabilize'].every(v=>performance.verbModifiers?.[v])
    && performance.traits;
  const inWork = Boolean(f.inspectionCamera?.coreWorkActive || f.tightInspectionCamera?.coreWorkActive);
  const inInspection = Boolean(f.inspectionCamera?.active || f.tightInspectionCamera?.active);
  let current = null;
  if (validPerformance) {
    const m = metrics(performance);
    if (Object.values(m).every(Number.isFinite)) current = m;
  }
  const previews = current && selected ? CORE_LABEL_ZONES.map(zoneId => {
    const next = {...counts}; next[selected.zoneId]--; next[zoneId]++;
    return {zoneId, zoneLabel:zoneName(zoneId), current:zoneId===selected.zoneId,
      ...previewCoreArrangement(next,performance.endurance.reserve01)};
  }) : [];
  const local = f.activeCellId === 'CELL_VASCULAR_RHYTHM_ROUTE_001'
    ? 'Vascular: Stabilize coherence shapes directional calming while bracing inside the current.'
    : f.activeCellId === 'CELL_SILT_PRESSURE_ROUTE_001'
      ? 'Silt: placing the Silt piece at the Membrane enables boundary adhesion on supported surfaces.'
      : f.activeCellId === 'CELL_MEMBRANE_NURSERY_001'
        ? repairTrialEnabled
          ? 'Surface repair trial ON: coherence can scale Stabilize repair on the scar plate when engaged in world view.'
          : 'Surface repair trial OFF: scar plate repair uses its baseline rate; Core coherence still shapes ring acquisition.'
        : 'Local materials keep their own interaction rules; these Core factors do not guarantee a local action.';
  return {
    pass:'CONNECTION40', presentationOnly:true, inWork, inInspection,
    cellId:f.activeCellId ?? 'none',
    distribution:complete ? CORE_LABEL_ZONES.map(z=>counts[z]).join(':') : null,
    arrangement: current ? performance.personality : 'Arrangement data unavailable / forming',
    reservePercent:current ? Math.round(performance.endurance.reserve01*100) : null,
    pieces:placements.map(p=>({pieceId:p.pieceId, family:familyName(p.family), zone:zoneName(p.zoneId),
      selected:p===selected, meaning:p.interactionIntent ?? 'No authored placement explanation'})),
    selectedId:selected?.pieceId ?? null, current, previews, local,
    guide:inWork ? work.held ? 'Guide holding: movement changes the live arrangement; place to release.'
      : 'Guide selecting: grab a piece to reposition it.' : 'Inspect the Core, then enter Core Work to rearrange it.',
    scope:'Pulse: charge speed / charged visual echo reach (action range unchanged). Absorb: progress on eligible bonds after committing the hold. Stabilize: coherence / ring acquisition. Higher factors mean faster response or more reserve capacity/recovery. Neutral is ×1.00; these are not completion times.',
    previewScope:'Move only the selected piece. Preview uses current reserve with no held verb; it does not predict future fatigue, exact geometry patterns or local repair time.',
    suspension:inWork || inInspection ? 'World repair is suspended during inspection and Core Work.' : ''
  };
}

const factor = value => `×${value.toFixed(2)}`;
export function coreArrangementLabelRows(s) {
  const rows = [{title:'CORE ARRANGEMENT',text:s.distribution
    ? `${s.arrangement} · Deep / Inner / Membrane ${s.distribution} · reserve ${s.reservePercent ?? '?'}%`
    : s.arrangement}];
  rows.push(...s.pieces.map(p=>({title:`${p.selected?'SELECTED · ':''}${p.family} · ${p.zone}`, text:s.inWork && p.selected ? `Authored role: ${p.meaning}` : ''})));
  if (s.current) {
    rows.push({title:'LIVE VERB FACTORS',text:`Pulse charge ${factor(s.current.charge)} / echo reach ${factor(s.current.reach)} · Absorb progress ${factor(s.current.absorb)} · Stabilize coherence ${factor(s.current.coherence)}`});
    rows.push({title:'RESERVE TRADEOFF',text:`Recovery ${factor(s.current.recovery)} · endurance capacity ${factor(s.current.endurance)}`});
  }
  if (s.inWork) {
    for (const p of s.previews) rows.push({title:`${p.current?'CURRENT ZONE':'IF MOVED TO'} · ${p.zoneLabel}`,text:`Pulse charge ${factor(p.charge)} / echo reach ${factor(p.reach)} · Absorb ${factor(p.absorb)} · Stabilize ${factor(p.coherence)} · recovery ${factor(p.recovery)} / endurance ${factor(p.endurance)}`});
    rows.push({title:'GUIDE / PREVIEW',text:`${s.guide} ${s.previewScope}`});
  }
  rows.push({title:'HERE',text:s.local});
  rows.push({title:'EFFECT SCOPE',text:s.scope});
  if (s.suspension) rows.push({title:'WORLD',text:s.suspension});
  return rows;
}

const percentChange = (value, reference = 1) => {
  const n = Math.round((value / reference - 1) * 100);
  return n === 0 ? 'unchanged' : `${Math.abs(n)}% ${n > 0 ? 'higher' : 'lower'}`;
};

// CONNECTION41: short reading layer over the same immutable explanation data.
// Current effects compare with neutral. Move previews compare with NOW at the
// same reserve, never with a fresh-reserve Core or a predicted completion time.
export function compactCoreArrangementLabelRows(s) {
  const counts = s.distribution?.split(':');
  const rows = [{title:'CORE ARRANGEMENT',text:counts
    ? `Deep ${counts[0]} · Inner ${counts[1]} · Membrane ${counts[2]} · reserve ${s.reservePercent ?? '?'}%`
    : s.arrangement}];
  if (s.pieces.length) rows.push({title:'PIECES',text:s.pieces.map(p=>`${p.family}: ${p.zone}`).join(' · ')});
  const selected = s.pieces.find(p=>p.selected);
  if (s.inWork && selected) rows.push({title:`SELECTED · ${selected.family} · CURRENT ZONE · ${selected.zone}`,text:s.guide});
  else if (s.inWork) rows.push({title:'GUIDE',text:s.pieces.length ? 'Select a retained piece to compare moves.' : 'No retained pieces available to rearrange yet.'});
  if (s.current) {
    rows.push({title:'NOW · COMPARED WITH NEUTRAL',text:`Pulse charge ${percentChange(s.current.charge)} · Absorb progress ${percentChange(s.current.absorb)} · Stabilize coherence ${percentChange(s.current.coherence)}`});
    rows.push({title:'RESERVE TRADEOFF',text:`Recovery ${percentChange(s.current.recovery)} · endurance capacity ${percentChange(s.current.endurance)}`});
    if (s.inWork) for (const p of s.previews.filter(p=>!p.current)) {
      rows.push({title:`IF MOVED TO · ${p.zoneLabel} · VS NOW`,text:`Pulse ${percentChange(p.charge,s.current.charge)} · Absorb ${percentChange(p.absorb,s.current.absorb)} · Stabilize ${percentChange(p.coherence,s.current.coherence)}. Recovery ${percentChange(p.recovery,s.current.recovery)}; endurance ${percentChange(p.endurance,s.current.endurance)}.`});
    }
  } else rows.push({title:'EFFECTS',text:'Complete, matching Core data is unavailable; no effect estimate shown.'});
  rows.push({title:'HERE',text:s.local});
  if (s.suspension) rows.push({title:'WORLD',text:s.suspension});
  rows.push({title:'DETAILS · SHIFT+F4 / DESIGN NOTES',text:'Previews use current reserve with no verb held. Pulse action range is unchanged. Full factors, authored roles and limits are in notes.'});
  return rows;
}
