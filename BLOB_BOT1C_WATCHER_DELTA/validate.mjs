import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const payload = path.join(path.dirname(fileURLToPath(import.meta.url)),'payload');
const files = [
  'src/opening/BOT1CWatcherWitness.js','src/opening/SurfaceWakeGameplaySystem.js',
  'src/debug/WorldObjectCensusSystem.js',
  'BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1c_browser.py',
  'BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1c.py'
];
let tests=0;
const assert=(condition,msg)=>{if(!condition) throw new Error('BOT1C FAIL: '+msg);tests++;};
const chosen=fs.existsSync(path.join(root,files[0]))?root:payload;
for(const file of files){
  const loc=path.join(chosen,file);
  assert(fs.existsSync(loc),'missing '+file);
  if(file.endsWith('.js')){
    const r=spawnSync('node',['--check',loc],{encoding:'utf8'});
    assert(r.status===0,'syntax '+file+' '+r.stderr);
  }else{
    const py=process.platform==='win32'?'py':'python';
    const r=spawnSync(py,['-c','import ast,sys;ast.parse(open(sys.argv[1],encoding="utf-8").read())',loc],{encoding:'utf8'});
    assert(r.status===0,'Python syntax '+file+' '+r.stderr);
  }
}
const helper=fs.readFileSync(path.join(chosen,'src/opening/BOT1CWatcherWitness.js'),'utf8');
const mod=await import('data:text/javascript;base64,'+Buffer.from(helper).toString('base64'));
for (const [active,dist,last,expected] of [[true,0,0,'packet_pulse_read_accepted'],[true,3.4,0,'packet_pulse_read_accepted'],[true,3.401,0,'packet_out_of_read_range'],[false,null,0,'no_active_packet'],[true,0,10,'pulse_id_already_accepted'],[true,null,0,'packet_distance_unavailable']]) {
 const state=mod.classifyWatcherPulse({pulseEventId:10,packetActive:active,packetDistance:dist,readRange:3.4,lastAcceptedPulseEventId:last,packetSequence:2,packetIdentifiedBefore:false});
 assert(state.reason===expected,'classification '+expected);
 assert(state.packetPulseReadAccepted===(expected==='packet_pulse_read_accepted'),'acceptance truth');
 assert(state.materialTransfer===false&&state.hostReceipt===false&&state.progressionCredit===false,'nonprogressive witness');
 assert(Object.isFrozen(state),'immutable witness');
}
for(let i=0;i<4000;i++){
 const d=(i%401)/100;
 const state=mod.classifyWatcherPulse({pulseEventId:i+1,packetActive:true,packetDistance:d,readRange:3.4,lastAcceptedPulseEventId:i,packetSequence:1,packetIdentifiedBefore:false});
 assert(state.packetPulseReadAccepted===(d<=3.4),'range parity #'+i);
}
const owner=fs.readFileSync(path.join(chosen,'src/opening/SurfaceWakeGameplaySystem.js'),'utf8');
const rec=fs.readFileSync(path.join(chosen,'src/debug/WorldObjectCensusSystem.js'),'utf8');
const bot=fs.readFileSync(path.join(chosen,'BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1c_browser.py'),'utf8');
assert(owner.includes('this.observeBot1cWatcherPulse(frameState, true, this.packetDistance)'), 'fresh distance');
assert(owner.includes('this.lastCircuitPulseEventId = pulseEventId;'),'original acceptance sequence');
assert(owner.includes('this.packetDistance <= (cycle.packetReadRange ?? 3.4)'),'existing acceptance rule unchanged');
assert(rec.includes('bot1c-watcher-pulse-owner-result'),'owner result is REC1 event');
assert(rec.includes('bot1c-watcher-owner-state-change'),'owner state is REC1 event');
assert(bot.includes("CASES=('no_input','stationary_pulse','scan_pulse','absorb_control')"),'four behavioral controls');
assert(!bot.includes('page.evaluate('),'bot cannot inspect owner or move coordinates');
console.log(JSON.stringify({pass:'BOT1-C',result:'PURE_WITNESS_AND_CONTRACT_PASS',assertions:tests,scenarioCount:4,limits:'Not browser/Vite proof; gameplay source must match guarded baseline'},null,2));
