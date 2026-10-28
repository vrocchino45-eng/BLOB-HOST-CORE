import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const file=process.argv[2];
assert(file,'pass source file path');
const src=readFileSync(file,'utf8');
assert(src.includes('sampleGuide0Witness()'));
assert(src.includes('this.sampleGuide0Witness();'));
assert(src.includes("'guide0-pulse-owner-pair'"));
assert(src.includes("'guide0-nursery-outcome-pair'"));
const {WorldObjectCensusSystem}=await import(pathToFileURL(file).href);
const fs={activeCellId:'CELL_MEMBRANE_NURSERY_001',
 orbiterState:{guideState:'observing_with_player',guideTarget:'nursery_reaction',guideDistance:2.7,lastReaction:'guide_waited_for_world_response',shimmerActive:false},
 guidePrompt:{id:'nursery',guideLine:'The carried matter is ambiguous.',objectiveLine:'Read what the moving matter is.',contentOwner:'SurfaceWake',selectionOwner:'GuidePromptSystem',regionPromptEpoch:2},
 nurseryCircuit:{active:true,packetActive:true,visualReadState:'ambiguous_unread',lastOutcomeSequence:0,lastOutcome:'none',agencyProven:false,foldInvitation:false},
 currentChemTarget:'none'};
const core=new WorldObjectCensusSystem({frameState:fs,scene:null});
core.captureActive=true;
const old=JSON.stringify(fs);
core.sampleGuide0Witness();
assert.equal(core.captureEvents.length,1);
assert.equal(core.captureEvents[0].type,'guide0-core-guide-state');
assert.equal(core.captureEvents[0].sampleKind,'baseline');
core.sampleGuide0Witness();assert.equal(core.captureEvents.length,1,'identical state must not spam');
fs.bot1cWatcherPulseWitness={revision:'BOT1-C',pulseEventId:9,packetSequence:2,packetActive:true,packetDistance:5,readRange:3.4,packetPulseReadAccepted:false,reason:'packet_out_of_read_range'};
fs.orbiterState.guideState='answering_player_pulse';
core.sampleGuide0Witness();
const pair=core.captureEvents.find(e=>e.type==='guide0-pulse-owner-pair');
assert(pair);assert.equal(pair.pulseEventId,9);assert.equal(pair.owner.accepted,false);
assert.equal(pair.guide.state,'answering_player_pulse');
assert(!('assistSuccess' in pair),'Guide answer is not an assist proof');
core.sampleGuide0Witness();assert.equal(core.captureEvents.filter(x=>x.type==='guide0-pulse-owner-pair').length,1);
fs.bot1cWatcherPulseWitness={revision:'BOT1-C',pulseEventId:10,packetActive:true,packetSequence:3,packetDistance:3.1,readRange:3.4,packetPulseReadAccepted:true,reason:'packet_read_accepted'};
core.sampleGuide0Witness();
assert.equal(core.captureEvents.filter(x=>x.type==='guide0-pulse-owner-pair').length,2);
fs.nurseryCircuit.lastOutcomeSequence=1;fs.nurseryCircuit.lastOutcome='tender_strained_scar_spread';
fs.nurseryCircuit.visualReadState='identified_unsafe';
fs.guidePrompt.objectiveLine='Change the unsafe material state.';
core.sampleGuide0Witness();
let outcome=core.captureEvents.find(x=>x.type==='guide0-nursery-outcome-pair');
assert(outcome);assert.equal(outcome.outcome,'tender_strained_scar_spread');
assert.equal(outcome.guide.state,'answering_player_pulse');
assert.equal(outcome.prompt.objectiveLine,'Change the unsafe material state.');
fs.currentChemTarget='scar_contamination_plate_001';
core.sampleGuide0Witness();
assert.equal(core.captureEvents.filter(x=>x.type==='guide0-core-guide-state').at(-1).state.owner.scarSelectionActive,true);
fs.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';fs.guidePrompt.activeRegionId='hub';fs.guidePrompt.regionPromptEpoch=3;
fs.guidePrompt.objectiveLine='Read the living routes.';
core.sampleGuide0Witness();
const last=core.captureEvents.filter(x=>x.type==='guide0-core-guide-state').at(-1).state;
assert.equal(last.activeCellId,'CELL_SIGNAL_CHORUS_NERVE_001');
assert.equal(last.prompt.regionPromptEpoch,3);
assert.equal(last.prompt.objectiveLine,'Read the living routes.');
// Independent source snapshot must remain untouched by sampling.
assert.notEqual(JSON.stringify(fs),old);
const before=JSON.stringify(fs);core.sampleGuide0Witness();assert.equal(JSON.stringify(fs),before);
assert(!src.slice(src.indexOf('  sampleGuide0Witness()'),src.indexOf('  sampleAuthority()')).includes('fs.nurseryCircuit ='));
assert(!src.slice(src.indexOf('  sampleGuide0Witness()'),src.indexOf('  sampleAuthority()')).includes('fs.orbiterState ='));
console.log(JSON.stringify({pass:'GUIDE0-W',status:'READ_ONLY_CROSS_OWNER_WITNESS_PASS',assertions:28,events:core.captureEvents.length},null,2));
