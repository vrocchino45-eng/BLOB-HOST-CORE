import { localChemistryTransitionReason } from '../chemistry/LocalChemistryContextSystem.js';
import { readVascularHostPressure } from '../world/HostConditionSystem.js';

// C0E3-LANG1: read-only player-facing language derived from existing owners.
// This does not decide target eligibility, consume verbs, create Host receipts,
// or modify the numerical C0E2-B and C0E3 laws.
export const CORE_VERBS = Object.freeze({
  pulse: Object.freeze({ symbol: '▽', name: 'PULSE', intent: 'PROJECT / LISTEN', input: 'X' }),
  absorb: Object.freeze({ symbol: '△', name: 'ABSORB', intent: 'DRAW / INTAKE', input: 'RT' }),
  stabilize: Object.freeze({ symbol: '◇', name: 'STABILIZE', intent: 'HOLD / BRACE', input: 'LT' })
});
export const VERB_CHORDS = Object.freeze({
  idle: 'OBSERVE', project: 'PROJECT', draw: 'DRAW', cohere: 'HOLD',
  cohere_project: 'BRACED PROJECT', cohere_draw: 'BRACED DRAW',
  exchange: 'OPPOSED EXCHANGE', full_system: 'HIGH-STRAIN BALANCE'
});
const CELLS = Object.freeze({
  CELL_SILT_PRESSURE_ROUTE_001: 'silt',
  CELL_VASCULAR_RHYTHM_ROUTE_001: 'vascular',
  CELL_GRAVE_MEMORY_RESIDUE_BED_001: 'grave',
  CELL_SIGNAL_CHORUS_NERVE_001: 'hub'
});
export const REGION_TONGUES = Object.freeze({
  silt: Object.freeze({name:'SILT', metaphor:'COMPACTION / SHEDDING', signal:'PRESSURE'}),
  vascular: Object.freeze({name:'VASCULAR', metaphor:'CIRCULATION / RELAXATION', signal:'LOAD'}),
  grave: Object.freeze({name:'GRAVE', metaphor:'IMPRINT / RELEASE', signal:'MEMORY'}),
  hub: Object.freeze({name:'HUB', metaphor:'JUNCTION / COUNTERPULSE', signal:'CONNECTION'})
});
const REGION_MATERIAL_LABELS = {
  grave: { imprint:'memory imprint', strain:'residue strain', void:'extraction trace' },
  vascular: { strain:'current load', imprint:'vessel imprint', void:'draw trace' },
  silt: { strain:'sediment strain', void:'extraction trace', imprint:'packed structure' }
};
const norm = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const percentage = value => Math.round(100 * norm(value));
const nameSite = id => String(id).replace(/^[a-z]+_/, '').replace(/_/g, ' ').toUpperCase().slice(0, 28);
const readOnly = { noGameplayAuthority:true, noReceiptInferred:true, noProgressionCredit:true, readOnly:true };

function readInteraction(frameState) {
  const composition = frameState.verbComposition;
  if (composition?.owner !== 'VerbCompositionSystem') return null;
  const input = frameState.input ?? {};
  const target = frameState.targeting ?? {};
  const retainedId = target.relationshipTargetId ?? target.targetId;
  const targetId = target.relationshipActive === true && composition.relationshipBound === true
    && typeof retainedId === 'string' && retainedId !== 'none' && retainedId === composition.targetId
    ? retainedId : null;
  const targetLabel = targetId && target.targetId === targetId && target.targetLabel && target.targetLabel !== targetId
    ? target.targetLabel : null;
  const read = { targetId, control:null, pulse:null, absorb:null };
  const lines = [];
  if (composition.intent?.stabilize && (input.stabilizeHeld || input.resonanceHeld)) {
    const control = composition.control;
    const current = targetId && control?.targetId === targetId && Number.isSafeInteger(target.relationshipSequence)
      && control.relationshipSequence === target.relationshipSequence
      && Number.isFinite(control.strength01) && control.strength01 >= 0 && control.strength01 <= 1;
    const state = current ? (control.strength01 > 0 ? 'established' : 'acquiring') : targetId ? 'held' : 'unbound';
    const strengthPercent = current ? percentage(control.strength01) : null;
    read.control = { state, strengthPercent };
    lines.push(state === 'established' ? `Stabilize control ${strengthPercent}%`
      : state === 'acquiring' ? 'Stabilize acquiring control'
        : state === 'held' ? 'Stabilize held on target' : 'Stabilize awaiting a target');
  }
  if (composition.intent?.pulse) {
    const released = input.pulsePressed === true || composition.intent.pulseReleaseEnvelope > 0.08;
    const pulse = frameState.pulse;
    const sameRelationship = input.pulsePressed === true || (Number.isFinite(target.relationshipAge)
      && Number.isFinite(pulse?.age) && pulse.age >= 0 && target.relationshipAge >= pulse.age);
    const focused = targetId && pulse?.active === true && pulse.focusedObject === targetId
      && pulse.relationshipTargetId === targetId && sameRelationship;
    read.pulse = input.pulseHeld ? 'charging' : released ? (focused ? 'focused' : 'released') : null;
    if (read.pulse) lines.push(`Pulse ${read.pulse}`);
  }
  if (composition.intent?.absorb && input.absorbHeld) {
    const bond = frameState.bondState;
    const matches = targetId && bond?.active === true && bond.objectId === targetId;
    const state = matches && bond.blockReason === 'absorbing' ? 'drawing'
      : matches && bond.compatibility === 'resists_absorb' ? 'resisted' : 'held';
    const progressPercent = state === 'drawing' && Number.isFinite(bond.absorbProgress) ? percentage(bond.absorbProgress) : null;
    read.absorb = { state, progressPercent };
    lines.push(`Absorb ${state}${progressPercent === null ? '' : ` ${progressPercent}%`}`);
  }
  return lines.length ? { ...read, text:[targetLabel, ...lines].filter(Boolean).join(' · ') } : null;
}

function readRegionalResponse(frameState, region, territory, site, activeWaves) {
  const labels = REGION_MATERIAL_LABELS[region];
  if (!labels || territory?.active !== true || territory.owner !== `${region}:RegionalTerritoryExpansion`) return null;
  const event = territory.lastRead;
  const lastVerb = site && event?.region === region && event.siteId === site.id
    && event.kind === 'c0e1_local_exploratory_read' && Object.hasOwn(CORE_VERBS, event.verb) ? event.verb : null;
  const fields = Object.keys(labels);
  const changes = lastVerb ? fields.flatMap((field) => {
    const before = event.before?.[field];
    const after = event.after?.[field];
    if (!Number.isFinite(before) || !Number.isFinite(after)) return [];
    const points = Math.round((norm(after) - norm(before)) * 100);
    return points ? [{ field, points }] : [];
  }) : [];
  const retained = site && territory.localStateRetainedDuringSession === true
    ? Object.fromEntries(fields.filter((field) => Number.isFinite(site[field]) && percentage(site[field]) > 0)
      .map((field) => [field, percentage(site[field])])) : {};
  const route = frameState.vascularRhythmRoute;
  const pressure = region === 'vascular' && route?.active === true && route.hostPressureResponse?.active === true
    ? readVascularHostPressure(frameState) : null;
  const pressurePercent = pressure?.active && pressure.episodeId === route.hostPressureResponse.episodeId
    ? percentage(pressure.amplitude) : null;
  const travelingWaves = territory.c0e3?.pass === 'C0E3' ? activeWaves : 0;
  const response = changes.map(({ field, points }) => `${labels[field]} ${points > 0 ? '+' : '−'}${Math.abs(points)} pts`);
  const retainedRead = Object.entries(retained).map(([field, value]) => `${labels[field]} ${value}%`);
  const temporary = [travelingWaves ? `${travelingWaves} traveling ${travelingWaves === 1 ? 'wave' : 'waves'}` : '',
    pressurePercent === null ? '' : `Host pressure ${pressurePercent}%`].filter(Boolean);
  const lines = [
    lastVerb && response.length ? `${REGION_TONGUES[region].name} · Last local ${lastVerb} · ${response.join(' · ')}` : '',
    retainedRead.length ? `Retained this session · ${retainedRead.join(' · ')}` : '',
    temporary.length ? `Temporary · ${temporary.join(' · ')}` : ''
  ].filter(Boolean);
  return { region, siteId:site?.id ?? null, lastVerb, changes, retained, travelingWaves, pressurePercent, lines };
}

/**
 * Numerically faithful names for EXISTING local state (all values 0..1):
 * strain=Flux deformation; imprint=Form retained trace; void=extraction trace.
 * `Between` refers to observed local connections, never inferred Host transfer.
 * This readout is not target ownership or proof of action acceptance.
 */
export function readHostLanguage(frameState = {}) {
  const region = CELLS[frameState.activeCellId];
  const showFeedback = frameState.quickLookInspector?.coreLabelsEnabled === true && !frameState.statusPage?.open
    && ![frameState.inspectionCamera, frameState.tightInspectionCamera].some(camera => camera?.active || camera?.coreWorkActive)
    && !localChemistryTransitionReason(frameState);
  const interaction = showFeedback ? readInteraction(frameState) : null;
  const interactionLine = interaction ? `Temporary · ${interaction.text}` : '';
  if (!region) return interaction ? { pass:'C0E3-LANG1', ...readOnly,
    lines:[interactionLine], feedback:{ interaction, host:null } } : null;
  const territory = frameState.territoryExploration?.region === region
    ? frameState.territoryExploration : null;
  const profile = REGION_TONGUES[region];
  const input = frameState.input ?? {};
  const composed = frameState.verbComposition?.chord;
  const chord = typeof composed === 'string' && Object.hasOwn(VERB_CHORDS, composed)
    ? composed : (input.stabilizeHeld ? 'cohere' : input.absorbHeld ? 'draw'
      : input.pulseHeld || input.pulsePressed ? 'project' : 'idle');
  const mode = VERB_CHORDS[chord];
  const focus = territory?.siteStates?.find(state => state.id === territory.nearestSiteId) ?? null;
  const nearer = territory?.nearestSiteDistance;
  const inRange = Boolean(focus && Number.isFinite(nearer) && nearer <= 2.4);
  const local = inRange ? {
    strain: percentage(focus.strain),
    imprint: percentage(focus.imprint),
    void: percentage(focus.void)
  } : null;
  const waves = territory?.c0e3;
  const activeWaves = Math.max(0, Math.trunc(Number.isFinite(waves?.activeTravelingPackets) ? waves.activeTravelingPackets : 0));
  const arrived = Math.max(0, Math.trunc(Number.isFinite(waves?.completedWaves) ? waves.completedWaves : 0));
  const relief = Math.max(0, Math.trunc(Number.isFinite(waves?.deliberateCapacityReliefs) ? waves.deliberateCapacityReliefs : 0));
  const verbLine = `${CORE_VERBS.pulse.symbol} PULSE·PROJECT  ${CORE_VERBS.absorb.symbol} ABSORB·DRAW  ${CORE_VERBS.stabilize.symbol} STABILIZE·HOLD`;
  const stateLine = local
    ? `${nameSite(focus.id)} · FLUX strain ${local.strain} · FORM imprint ${local.imprint} · VOID trace ${local.void}`
    : `${profile.name} · ${profile.metaphor} · LOCAL READ ${territory ? 'OUT OF RANGE' : 'NOT MOUNTED'}`;
  const betweenLine = waves?.pass === 'C0E3'
    ? `BETWEEN LOCAL · ${activeWaves} traveling · ${arrived} wave finishes · ${relief} relief`
    : 'BETWEEN · waiting for local circuit read';
  const host = showFeedback ? readRegionalResponse(frameState, region, territory, inRange ? focus : null, activeWaves) : null;
  const lines = host?.lines.length
    ? [interactionLine || verbLine, ...host.lines] : [interactionLine || verbLine, `MODE ${mode} · ${stateLine}`, betweenLine];
  return {
    pass:'C0E3-LANG1', region, mode, chord, siteId:inRange?focus.id:null,
    values:local, inRange,
    lines, ...(interaction || host ? { feedback:{ interaction, host } } : {}), ...readOnly
  };
}
