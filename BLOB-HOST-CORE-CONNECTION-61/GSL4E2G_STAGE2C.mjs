import {PlayerMovementController} from './src/player/PlayerMovementController.js';
import {OrbiterSystem} from './src/ecology/OrbiterSystem.js';
import {installObserver} from './GSL4E2G_STAGE2C_OBSERVER.mjs';
const key='__BLOB_GSL_STAGE2C__';
if(!globalThis[key]){
  const observer=installObserver(PlayerMovementController,OrbiterSystem);
  globalThis[key]=Object.freeze({...observer,download(){
    const report=observer.dump();
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='GSL4E2G_STAGE2C_REPORT.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);return report;
  }});
}
export const recorder=globalThis[key];
