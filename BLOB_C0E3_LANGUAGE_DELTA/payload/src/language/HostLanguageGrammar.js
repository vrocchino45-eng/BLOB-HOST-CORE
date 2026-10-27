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
const norm = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const percentage = value => Math.round(100 * norm(value));
const nameSite = id => String(id).replace(/^[a-z]+_/, '').replace(/_/g, ' ').toUpperCase().slice(0, 28);

/**
 * Numerically faithful names for EXISTING local state (all values 0..1):
 * strain=Flux deformation; imprint=Form retained trace; void=extraction trace.
 * `Between` refers to observed local connections, never inferred Host transfer.
 * This readout is not target ownership or proof of action acceptance.
 */
export function readHostLanguage(frameState = {}) {
  const region = CELLS[frameState.activeCellId];
  if (!region) return null;
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
  return {
    pass:'C0E3-LANG1', region, mode, chord, siteId:inRange?focus.id:null,
    values:local, inRange,
    lines:[verbLine, `MODE ${mode} · ${stateLine}`, betweenLine],
    noGameplayAuthority:true, noReceiptInferred:true, noProgressionCredit:true,
    readOnly:true
  };
}
