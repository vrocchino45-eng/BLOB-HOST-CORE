import {SiltPressureRouteSystem} from './src/routes/SiltPressureRouteSystem.js';
import {PlayerMovementController} from './src/player/PlayerMovementController.js';
import {installSiltObserver} from './SILT_RELEASE_OBS1_CORE.mjs';
const key='__BLOB_SILT_RELEASE_OBS1__';
if(!globalThis[key]){
 const observer=installSiltObserver(SiltPressureRouteSystem,PlayerMovementController);
 globalThis[key]=Object.freeze({...observer,download(){
  const data=observer.dump(),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='SILT_RELEASE_OBS1_REPORT.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);return data;
 }});
}
export const recorder=globalThis[key];
