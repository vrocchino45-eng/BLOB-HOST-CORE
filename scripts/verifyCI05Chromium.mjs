import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const require=createRequire(path.join(root,'BLOB_BOT_SERIES1/package.json'));
const lock=JSON.parse(fs.readFileSync('BLOB_BOT_SERIES1/package-lock.json','utf8'));
const installed=require('playwright/package.json').version;
assert.equal(installed,lock.packages['node_modules/playwright'].version);
assert.equal(installed,'1.62.1');
const expected=JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve('playwright-core/package.json')), 'browsers.json'))).browsers.find(item=>item.name==='chromium');
assert.equal(expected.revision,'1234');
const output=path.resolve(process.argv[2]??'CI03_CHROMIUM_RESULTS');
fs.mkdirSync(output,{recursive:true});
const source=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
assert.equal(source.status,0);
const commit=source.stdout.trim();
if(process.env.GITHUB_SHA) assert.equal(commit,process.env.GITHUB_SHA);
const args=JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,args,timeout:30000});
let observed;
try{
  const page=await browser.newPage();
  observed=await page.evaluate(()=>{
    const gl=document.createElement('canvas').getContext('webgl2');
    const ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return gl?gl.getParameter(ext?.UNMASKED_RENDERER_WEBGL??gl.RENDERER):null;
  });
  assert.ok(observed,'Chromium WebGL2 probe is required before replay');
  assert.equal(browser.version(),expected.browserVersion);
}finally{await browser.close();}
const report=path.join(output,'C01.json');
const run=spawnSync(process.execPath,['BLOB_BOT_SERIES1/cases/browser.mjs'],{timeout:240000,encoding:'utf8',
  maxBuffer:8*1024**2,env:{...process.env,BLOB_BOT_CASE:'C01',BLOB_BOT_RUN_DIR:output,BLOB_BOT_REPORT:report}});
const scrub=txt=>txt.split(root).join('<checkout>').split(output).join('<results>');
fs.writeFileSync(path.join(output,'browser.log'),scrub((run.stdout??'')+(run.stderr??'')+(run.error?.message??'')));
const observedReplay=fs.existsSync(report)?JSON.parse(fs.readFileSync(report)):null;
const assertions=observedReplay?.detail?.summary?.passed??0;
const verdict=run.status===0&&assertions===18&&observedReplay?.detail?.summary?.complete?'PASS':'FAIL';
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify({
  verdict,source:commit,platform:process.platform,headless:true,assertions,timeoutSeconds:240,playwright:installed,
  chromium:expected.browserVersion,chromiumRevision:expected.revision,webGLRendererOnSameLaunchFlags:observed,
  scope:'Staged C01 browser owner verification, separate from ordinary gameplay and deterministic hosted CI.'
},null,2)+'\n');
console.log(JSON.stringify({verdict,assertions,version:expected.browserVersion,observed}));
process.exitCode=Number(verdict!=='PASS');
