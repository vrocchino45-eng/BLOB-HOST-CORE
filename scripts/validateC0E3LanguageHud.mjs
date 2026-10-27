import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_VERBS, VERB_CHORDS, REGION_TONGUES, readHostLanguage } from '../src/language/HostLanguageGrammar.js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cells = {
  silt:'CELL_SILT_PRESSURE_ROUTE_001', vascular:'CELL_VASCULAR_RHYTHM_ROUTE_001',
  grave:'CELL_GRAVE_MEMORY_RESIDUE_BED_001', hub:'CELL_SIGNAL_CHORUS_NERVE_001'
};
let assertions=0;
const chk=(ok,message)=>{assert.ok(ok,message);assertions++;};
for(const [region, cell] of Object.entries(cells)) {
  const state={activeCellId:cell,verbComposition:{chord:'cohere_project'},
    territoryExploration:{region,nearestSiteId:`${region}_test_site`,nearestSiteDistance:1.3,
      siteStates:[{id:`${region}_test_site`,strain:0.753,imprint:0.204,void:0.171}],
      c0e3:{pass:'C0E3',activeTravelingPackets:2,completedWaves:9,deliberateCapacityReliefs:3}}};
  const a=readHostLanguage(state);
  chk(a?.region===region,'active region '+region);
  chk(a.values.strain===75 && a.values.imprint===20 && a.values.void===17,'faithful numeric readout '+region);
  chk(a.mode==='BRACED PROJECT','faithful compound chord '+region);
  chk(a.lines.length===3,'three-line local HUD '+region);
  chk(a.lines[2].includes('2 traveling')&&a.lines[2].includes('9 wave finishes')&&a.lines[2].includes('3 relief'),'authored wave counters '+region);
  chk(a.noReceiptInferred&&a.readOnly&&a.noGameplayAuthority,'read-only boundary '+region);
  chk(!JSON.stringify(a).includes('Host receipt accepted'),'no fabricated receipt '+region);
  const far=readHostLanguage({...state,territoryExploration:{...state.territoryExploration,nearestSiteDistance:6}});
  chk(!far.inRange&&!far.values&&far.lines[1].includes('OUT OF RANGE'),'no distant readings '+region);
  const empty=readHostLanguage({activeCellId:cell});
  chk(!empty.inRange&&!empty.values&&empty.lines[1].includes('NOT MOUNTED'),'no fabricated state '+region);
}
chk(!readHostLanguage({activeCellId:'CELL_MEMBRANE_NURSERY_001'}),'not shown outside four regions');
chk(Object.keys(CORE_VERBS).join(',')==='pulse,absorb,stabilize','canonical three verbs');
chk(CORE_VERBS.pulse.symbol==='▽'&&CORE_VERBS.absorb.symbol==='△','locked triangle directions');
chk(Object.keys(VERB_CHORDS).length===8,'canonical eight chord states');
chk(Object.keys(REGION_TONGUES).length===4,'four region dialects');
const hud=fs.readFileSync(path.join(root,'src/ui/PlaytestHudSystem.js'),'utf8');
chk(hud.includes("import { readHostLanguage } from '../language/HostLanguageGrammar.js'"),'HUD actual module import');
chk(hud.includes('languageRead,')&&hud.includes('languageLine'), 'HUD receives language readout');
chk(hud.includes('this.auditEl.textContent = state.auditLine'), 'old audit element remains');
chk(!hud.includes('frameState.hostConnections ='), 'no host mutations');
console.log(JSON.stringify({pass:'C0E3-LANG1',result:'READ_ONLY_ABILITY_AND_HUD_LANGUAGE_PASS',assertions},null,2));
