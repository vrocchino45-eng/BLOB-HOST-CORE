import assert from 'node:assert/strict';
import { TemporalHistorySystem } from '../src/world/TemporalHistorySystem.js';
const frame = { runtimeSeconds: 0, activeCellId: 'silt', hostRhythm: { cycleCount: 0 }, coreEngine: { phaseCount: 3 } };
const system = new TemporalHistorySystem({ frameState: frame });
system.init();
for (let i=1;i<=10;i++) { frame.runtimeSeconds=i*0.25; system.update(0.25,frame); }
assert.equal(frame.temporalHistory.simulationSeconds,2.5);
assert.equal(frame.temporalHistory.exposureSecondsByCell.silt,2.5);
frame.activeCellId='hub'; frame.runtimeSeconds=3; system.update(0.5,frame);
assert.equal(frame.temporalHistory.exposureSecondsByCell.hub,0.5);
assert.equal(frame.temporalHistory.exposureSecondsByCell.silt,2.5);
assert.equal(frame.temporalHistory.grantsProgression,false);
assert.equal(frame.temporalHistory.offlineCatchupApplied,false);
console.log('LS1D0 temporal history deterministic observation: PASS');
