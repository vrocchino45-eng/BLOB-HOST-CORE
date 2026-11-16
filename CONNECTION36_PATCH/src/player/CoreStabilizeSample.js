import { readLocalChemistryContext } from '../chemistry/LocalChemistryContextSystem.js';

const world = f => !f.inspectionCamera?.active && !f.inspectionCamera?.coreWorkActive
  && !f.tightInspectionCamera?.active && !f.tightInspectionCamera?.coreWorkActive
  && !f.coreWorkManipulation?.held;
const identity = f => Number.isSafeInteger(f.frame) && f.frame >= 0
  && Number.isFinite(f.runtimeSeconds) && f.runtimeSeconds >= 0
  && Number.isSafeInteger(f.runtimeSimulationSubstepIndex ?? 0)
  && (f.runtimeSimulationSubstepIndex ?? 0) >= 0
  && Number.isSafeInteger(f.runtimeSimulationSubstepCount ?? 1)
  && (f.runtimeSimulationSubstepIndex ?? 0) < (f.runtimeSimulationSubstepCount ?? 1);
const validCounts = c => c && ['deep_core','inner_body','membrane'].every(k=>Number.isInteger(c[k])&&c[k]>=0)
  && c.deep_core+c.inner_body+c.membrane===3;
const distribution = c => `${c.deep_core}:${c.inner_body}:${c.membrane}`;

// CONNECTION36: metadata only. This neither changes nor applies capability.
export function publishCoreStabilizeSample(f) {
  const p=f.corePerformance??{},chem=f.spatialCoreChemistry??{},counts=Object.freeze({...chem.counts});
  const active=identity(f)&&world(f)&&validCounts(counts)&&chem.retainedPieceCount===3
    && chem.topology?.complete===true&&p.active===true
    && p.distribution===distribution(counts)&&p.topologyId===chem.topology.id;
  return Object.freeze({pass:'CONNECTION36',owner:'CoreRadialPerformanceSystem',
    sourceOwner:'CoreEmbodimentSystem',active:Boolean(active),
    sampledFrame:f.frame??null,sampledRuntimeSeconds:f.runtimeSeconds??null,
    sampledSubstep:f.runtimeSimulationSubstepIndex??0,sampledSubstepCount:f.runtimeSimulationSubstepCount??1,
    hostId:f.activeHostId??null,cellId:f.activeCellId??null,worldMode:world(f),
    debugAnatomy:Boolean(f.coreGrowth?.debugCoreWorkRetainedAnatomySeeded),
    topologyId:p.topologyId??null,distribution:p.distribution??null,counts,
    coherenceMultiplier:p.verbModifiers?.stabilize?.coherenceMultiplier??null,
    materialAuthority:false,progressionAuthority:false});
}

// A consumer before the radial producer may read exactly the prior accepted step.
// Same-step/later samples, skipped callbacks and stale mode/cell data are neutral.
export function readPriorCoreStabilizeSample(f,dt) {
  const s=f.corePerformance?.stabilizeSample,chem=f.spatialCoreChemistry;
  if(!identity(f)||!world(f)||!Number.isFinite(dt)||dt<=0||dt>.05||!readLocalChemistryContext(f))return null;
  if(!s||s.pass!=='CONNECTION36'||s.owner!=='CoreRadialPerformanceSystem'||s.sourceOwner!=='CoreEmbodimentSystem'
    ||s.active!==true||s.worldMode!==true||s.hostId!==f.activeHostId||s.cellId!==f.activeCellId
    ||s.materialAuthority!==false||s.progressionAuthority!==false)return null;
  if(!validCounts(s.counts)||!validCounts(chem?.counts)||chem.retainedPieceCount!==3||chem.topology?.complete!==true
    ||s.topologyId!==chem.topology.id||s.distribution!==distribution(s.counts)
    ||s.distribution!==distribution(chem.counts))return null;
  if(!Number.isFinite(s.coherenceMultiplier)||s.coherenceMultiplier<.66||s.coherenceMultiplier>1.48)return null;
  if(!Number.isSafeInteger(s.sampledFrame)||s.sampledFrame<0||!Number.isFinite(s.sampledRuntimeSeconds)
    ||!Number.isSafeInteger(s.sampledSubstep)||s.sampledSubstep<0
    ||!Number.isSafeInteger(s.sampledSubstepCount)||s.sampledSubstepCount<1||s.sampledSubstep>=s.sampledSubstepCount)return null;
  const sub=f.runtimeSimulationSubstepIndex??0;
  const prior=sub>0
    ? s.sampledFrame===f.frame&&s.sampledSubstep===sub-1&&s.sampledSubstepCount===(f.runtimeSimulationSubstepCount??1)
    : s.sampledFrame===f.frame-1&&s.sampledSubstep===s.sampledSubstepCount-1;
  if(!prior||Math.abs(f.runtimeSeconds-s.sampledRuntimeSeconds-dt)>1e-8)return null;
  return s;
}
