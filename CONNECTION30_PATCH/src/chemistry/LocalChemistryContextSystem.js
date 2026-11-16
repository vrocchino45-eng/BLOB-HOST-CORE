// CONNECTION30: authored environmental chemistry, with explicit provenance.
// No legacy chemistry, composition, bond, material or physical state is written.
export const LOCAL_CHEMISTRY_DOMAINS = Object.freeze([
  'form', 'flux', 'scar', 'residue', 'bloom', 'signal', 'seed', 'inorganic', 'confluence'
]);
const OWNER = 'LocalChemistryContextSystem';
const sample = f => ({sampledFrame: f.frame, sampledRuntimeSeconds: f.runtimeSeconds,
  sampledSubstep: f.runtimeSimulationSubstepIndex ?? 0});
const validSample = f => Number.isSafeInteger(f.frame) && f.frame >= 0
  && Number.isFinite(f.runtimeSeconds) && f.runtimeSeconds >= 0
  && Number.isSafeInteger(f.runtimeSimulationSubstepIndex ?? 0) && (f.runtimeSimulationSubstepIndex ?? 0) >= 0;
const validDomains = d => d && typeof d === 'object' && !Array.isArray(d)
  && Object.keys(d).length === LOCAL_CHEMISTRY_DOMAINS.length
  && LOCAL_CHEMISTRY_DOMAINS.every(k => Object.hasOwn(d, k) && Number.isFinite(d[k]) && d[k] >= 0 && d[k] <= 1);

export function localChemistryTransitionReason(f) {
  if (f.localCellBoundaryMorph?.active) return 'boundary_transition_unresolved';
  if (f.firstSliceReturnTraversal?.transitionActive) return 'return_transition_unresolved';
  if (f.hubRouteCommitFlight?.active) return 'commit_flight_unresolved';
  for (const key of ['localCellMorph', 'secondLocalCellMorph']) {
    const m = f[key];
    if (!m || ![m.sourceCell, m.destinationCell].includes(f.activeCellId)) continue;
    if (['morphing_continuous_control', 'morphing_into_signal_chorus'].includes(m.phase)
      || (Number.isFinite(m.progress) && m.progress > 0 && m.progress < 1)) return 'local_morph_unresolved';
  }
  return null;
}

const base = f => ({pass: 'CONNECTION30', owner: OWNER, ...sample(f),
  hostId: f.activeHostId ?? null, cellId: f.activeCellId ?? null,
  source: 'localCellRecipes.chemistryField', recipeId: f.activeCellId ?? null,
  materialTransfer: false, progressionAuthority: false, physicalFeelAuthority: false,
  playerCompositionAuthority: false, bondAuthority: false});
const neutral = (f, reason) => Object.freeze({...base(f), active: false,
  mode: 'neutral_no_effect', reason, anatomySource: null, domains: null});

export function resolveLocalChemistryContext(recipeDataSystem, f) {
  if (!validSample(f)) return neutral(f, 'invalid_sample_identity');
  const transition = localChemistryTransitionReason(f);
  if (transition) return neutral(f, transition);
  let cell, host;
  try { cell = recipeDataSystem.get('localCellRecipes', f.activeCellId); }
  catch { return neutral(f, 'missing_cell_recipe'); }
  if (!cell || cell.id !== f.activeCellId) return neutral(f, 'missing_cell_recipe');
  try { host = recipeDataSystem.get('hosts', f.activeHostId); }
  catch { return neutral(f, 'missing_host_recipe'); }
  if (!host || host.id !== f.activeHostId) return neutral(f, 'missing_host_recipe');
  if (!cell.derivation?.host || cell.derivation.host !== host.id) return neutral(f, 'host_derivation_mismatch');
  if (!validDomains(cell.chemistryField)) return neutral(f, 'invalid_authored_domains');
  const domains = Object.freeze(Object.fromEntries(LOCAL_CHEMISTRY_DOMAINS.map(k => [k, cell.chemistryField[k]])));
  return Object.freeze({...base(f), active: true, mode: 'authored_local_cell_field',
    reason: 'validated_authored_cell', anatomySource: cell.derivation.anatomySource ?? null, domains});
}

function rejectionReason(f, context) {
  if (!validSample(f)) return 'invalid_sample_identity';
  if (!context || context.pass !== 'CONNECTION30' || context.owner !== OWNER) return 'missing_or_foreign_context';
  if (context.hostId !== f.activeHostId || context.cellId !== f.activeCellId || context.recipeId !== f.activeCellId) return 'cell_or_host_changed';
  if (context.sampledFrame !== f.frame || context.sampledRuntimeSeconds !== f.runtimeSeconds
    || context.sampledSubstep !== (f.runtimeSimulationSubstepIndex ?? 0)) return 'stale_sample';
  const transition = localChemistryTransitionReason(f);
  if (transition) return transition;
  if (!context.active) return context.reason ?? 'inactive_context';
  if (context.mode !== 'authored_local_cell_field' || context.source !== 'localCellRecipes.chemistryField'
    || !validDomains(context.domains) || context.materialTransfer !== false || context.progressionAuthority !== false
    || context.physicalFeelAuthority !== false || context.playerCompositionAuthority !== false
    || context.bondAuthority !== false) return 'invalid_context_schema';
  return null;
}

// Consumers must use this guard, not trust a raw snapshot's active bit. A later
// same-frame boundary change can invalidate the pre-Bond publication safely.
export function readLocalChemistryContext(f) {
  const context = f.localChemistryContext;
  return rejectionReason(f, context) ? null : context;
}

export function inspectLocalChemistryContext(f) {
  const reason = rejectionReason(f, f.localChemistryContext);
  return reason ? neutral(f, reason) : f.localChemistryContext;
}

export class LocalChemistryContextSystem {
  constructor({recipeDataSystem, frameState}) {
    if (!recipeDataSystem || !frameState) throw new Error('[LocalChemistryContextSystem] recipe data and frame state are required');
    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
  }
  init() { this.update(0, this.frameState); }
  update(_dt, f = this.frameState) {
    f.localChemistryContext = resolveLocalChemistryContext(this.recipeDataSystem, f);
  }
}
