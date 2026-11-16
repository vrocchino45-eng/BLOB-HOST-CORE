// CONNECTION44: read earned growth truth, never visual/debug anatomy or engine previews.
export function deriveCoreEarnedEvolution(g = {}) {
  const mature=g.owner==='CoreGrowthSystem' && g.firstGrowthCommitted===true;
  const vascular=mature && g.vascularRhythmRetained===true && g.vascularRouteReturned===true
    && Number.isFinite(g.vascularCadenceReads) && g.vascularCadenceReads>=3;
  const grave=mature && g.graveMemoryImprintCommitted===true && g.safeMemoryTransferComplete===true && g.graveRouteReturned===true;
  const silt=mature && g.siltPressureRetained===true && g.siltRouteReturned===true
    && g.siltPressureRead===true && g.siltRibsReleased===true && g.siltSafeMatterAbsorbed===true && g.siltDenseMatterLeftIntact===true;
  return {pass:'CONNECTION44',owner:'CoreGrowthSystem',growthKnown:g.owner==='CoreGrowthSystem',matureBinding:mature,surfaceFoundation:g.surfaceFoundationRetained===true,surfaceCause:g.surfaceFoundationCause??'none',earnedFamilies:{grave,vascular,silt},
    integrated:grave&&vascular&&silt,idleRecoveryMultiplier:vascular?1.08:1,
    cause:vascular?'returned_vascular_cadence_in_mature_core':'requires_mature_core_and_earned_vascular_return',
    enginePhaseAuthority:false,materialAuthority:false};
}
