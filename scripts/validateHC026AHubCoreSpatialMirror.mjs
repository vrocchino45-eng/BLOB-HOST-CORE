import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
const json=(r)=>JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC026A] ${m}`);};
const main=read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const hub=read("src/hub/HubChamberFoundationSystem.js");
const hud=read("src/ui/PlaytestHudSystem.js");
const recipe=read("src/data/RecipeDataSystem.js");
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity=json("public/data/build/currentBuildIdentity_HC026A.json");
const contract=json("public/data/build/hc026aHubCoreSpatialMirrorContract.json");
const pkg=json("package.json");
const successor = main.includes('buildId: "HC-026A1"') || (main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))) || successorHC027C;
must(successorHC027C || (main.includes('buildId: "HC-026A"') || successor),"runtime identity missing");
must(successorHC027C || (["0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch");
must(identity.id==="HC-026A"&&identity.sourceJsCount===88,"identity/source lock mismatch");
must(successorHC027C || (["HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"inspection profile build mismatch");
must(successorHC027C || (["runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)),"inspection profile status mismatch");
for(const marker of [
  'updateCoreSpatialMirror(frameState, dt, runtimeSeconds)',
  'source: "spatialCoreChemistry"',
  'routeTopologyStable: true',
  'routeGatesMoved: false',
  'routeCorridorsMoved: false',
  'hubCoreSpatialMirrorTopology',
  'debugPreviewMutatesProgression: false'
]) must(hub.includes(marker),`Hub mirror marker missing: ${marker}`);
if (successor) {
  must(hub.includes('const zoneRadius = { deep_core: 1.55, inner_body: 3.75, membrane: 6.25 }'),"successor radial bands missing");
  must(hub.includes('.lerp(this.coreMirrorTelemetryDirection, 0.22)'),"successor telemetry bend missing");
} else {
  must(hub.includes('const zoneRadius = { deep_core: 1.28, inner_body: 2.62, membrane: 4.18 }'),"HC026A radial bands missing");
  must(hub.includes('.lerp(this.coreMirrorTelemetryDirection, 0.34)'),"HC026A telemetry bend missing");
}
const mirrorMethod=hub.slice(hub.indexOf('updateCoreSpatialMirror(frameState, dt, runtimeSeconds)'),hub.indexOf('createState(active, routeIdentityReady = false)'));
must(!mirrorMethod.includes('.gate.position')&&!mirrorMethod.includes('routeVisuals.forEach'),"mirror method may not move route gates/corridors");
must(hud.includes('/ mirror ${hubCoreSpatialMirror.topologyLabel'),"Hub mirror HUD evidence missing");
must(profile.behavior.hubCoreSpatialMirrorEnabled===true,"profile mirror enable missing");
must(profile.behavior.hubCoreSpatialMirrorUsesSpatialCoreChemistry===true,"profile chemistry source flag missing");
must(profile.behavior.hubCoreSpatialMirrorMovesRetainedEchoAnatomy===true,"profile retained echo mirror flag missing");
must(profile.behavior.hubCoreSpatialMirrorMovesRouteGates===false&&profile.behavior.hubCoreSpatialMirrorMovesRouteCorridors===false,"route topology must remain stable");
must(contract.routeTopologyStable===true&&contract.movesRouteGates===false&&contract.movesRouteCorridors===false,"contract route lock mismatch");
must(contract.mapping?.radial?.includes('Deep Core')&&contract.mapping?.radial?.includes('Membrane'),"radial mirror contract missing");
must(recipe.includes('HC-026A+ must mirror spatial Core chemistry into retained Hub anatomy while route gates/corridors remain fixed'),"RecipeDataSystem HC026A successor contract missing");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC026A] Core Deep/Inner/Membrane -> Hub center/middle/perimeter mirror PASS');
console.log('[HC026A] exact XYZ telemetry remains subordinate to stable family territory PASS');
console.log('[HC026A] Hub topology echo + stable gates/corridors preserved in successor PASS');
console.log('[HC026A] debug P + Hub preview remains progression-neutral PASS');
