import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DebugAreaJumpSystem } from '../src/debug/DebugAreaJumpSystem.js';

const profile=JSON.parse(fs.readFileSync('public/data/runtime/act1RuntimeProfile_HC015A.json','utf8'));
assert.equal(profile.pass,'HC-015A');
assert.deepEqual(profile.regions.aperture_fields.systemIds,['apertureFieldsArrivalSystem','signalPlainEcologySystem']);
assert.equal(profile.regions.aperture_fields.gameplayOwner,'SignalPlainEcologySystem');
assert.equal(profile.hc015AFirstEcology.debugJumpAwardsProgress,false);

const controller={velocity:{set(){this.cleared=true;}},fluidSlip:{set(){this.cleared=true;}}};
const frameState={frame:12,activeCellId:'CELL_MEMBRANE_NURSERY_001',input:{debugJumpSlot:8}};
const jump=new DebugAreaJumpSystem({playerMovementController:controller});
jump.update(0,frameState);
assert.equal(frameState.activeCellId,'CELL_APERTURE_FIELDS_ARRIVAL_001');
assert.equal(frameState.debugAreaJump.mutatesProgression,false);
assert.equal(frameState.signalPlainEcology,undefined);
console.log('HC-015A Signal Plain debug-jump/profile validation passed.');
