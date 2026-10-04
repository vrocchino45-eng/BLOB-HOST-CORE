#!/usr/bin/env node
/* Compare two read-only browser monitor reports. Usage: node w2a_compare.mjs unrecorded.json recorded.json */
import fs from 'node:fs';
const [aPath,bPath]=process.argv.slice(2);
if(!aPath||!bPath){ console.error('Usage: node w2a_compare.mjs unrecorded.json recorded.json');process.exit(2);}
function load(p){const data=JSON.parse(fs.readFileSync(p,'utf8'));
  if(data.schema!=='blob.w2a.browser_frame_truth.v1')throw Error(`Invalid browser profiler report: ${p}`);
  return data;
}
const A=load(aPath),B=load(bPath);
const row=(name,a,b,unit='')=>`| ${name} | ${a??'n/a'}${unit} | ${b??'n/a'}${unit} |`;
console.log(`# BLOB W2A — Browser rAF A/B comparison\n\n`+
  `Reminder: these are independent *browser rAF* observations, not game-update FPS or proof of cause.\n\n`+
  `| Measure | ${A.label} | ${B.label} |\n|:--|--:|--:|\n`+
  row('Recorded condition (manually entered)',A.manualConditions.recording,B.manualConditions.recording)+'\n'+
  row('Route (manually entered)',A.manualConditions.route,B.manualConditions.route)+'\n'+
  row('Wall duration',A.durationWallSeconds,B.durationWallSeconds,' s')+'\n'+
  row('Visible time',A.visibleSeconds,B.visibleSeconds,' s')+'\n'+
  row('Hidden time',A.hiddenSeconds,B.hiddenSeconds,' s')+'\n'+
  row('Blurred time',A.blurredSeconds,B.blurredSeconds,' s')+'\n'+
  row('Browser rAF callbacks per visible s',A.browserRafOnly.callbacksPerVisibleSecond,B.browserRafOnly.callbacksPerVisibleSecond)+'\n'+
  row('Visible rAF interval p50',A.browserRafOnly.p50Ms,B.browserRafOnly.p50Ms,' ms')+'\n'+
  row('Visible rAF interval p95',A.browserRafOnly.p95Ms,B.browserRafOnly.p95Ms,' ms')+'\n'+
  row('Visible rAF interval p99',A.browserRafOnly.p99Ms,B.browserRafOnly.p99Ms,' ms')+'\n'+
  row('Max visible rAF gap',A.browserRafOnly.maxMs,B.browserRafOnly.maxMs,' ms')+'\n'+
  row('rAF intervals over 100 ms',A.browserRafOnly.over100Ms,B.browserRafOnly.over100Ms)+'\n'+
  row('rAF intervals over 1000 ms',A.browserRafOnly.over1000Ms,B.browserRafOnly.over1000Ms)+'\n'+
  row('Long Tasks API available',A.longTaskObserverAvailable,B.longTaskObserverAvailable)+'\n'+
  row('Long Tasks counted',A.longTaskCount,B.longTaskCount)+'\n\n'+
  `Interpretation order: confirm both runs use the same route/foreground state and canvas size; then compare browser rAF opportunity. If browser rAF is stable but telemetry simulation loses time, inspect the app's update loop, dt cap, pause logic and event export. If rAF also stalls, inspect browser/main-thread work, backgrounding, capture overhead and renderer. Neither measurement alone proves a specific cause.\n`);
