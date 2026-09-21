import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
const json=(r)=>JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC026A1] ${m}`);};
const main=read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const hub=read("src/hub/HubChamberFoundationSystem.js");
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity=json("public/data/build/currentBuildIdentity_HC026A1.json");
const contract=json("public/data/build/hc026a1HubMacroSpatialExaggerationContract.json");
const pkg=json("package.json");
const successor=(main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))) || successorHC027C;
must(successorHC027C || (main.includes('buildId: "HC-026A1"')||successor),"runtime identity missing");
must(successorHC027C || (["0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch");
must(identity.id==="HC-026A1"&&identity.sourceJsCount===88,"identity/source lock mismatch");
must(successorHC027C || (["HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"inspection profile build mismatch");
must(successorHC027C || (profile.status==="runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"),"profile status mismatch");
for (const marker of [
  'const zoneRadius = { deep_core: 1.55, inner_body: 3.75, membrane: 6.25 }',
  'const zoneVisualScale = { deep_core: 0.78, inner_body: 1.08, membrane: 1.38 }',
  '.lerp(this.coreMirrorTelemetryDirection, 0.22)',
  'macroRadialContrast: 1.5',
  'hubCoreMirrorZoneVisualScale',
  'root.scale.multiplyScalar(zoneScale)',
  'const centralSpread = 0.94 + this.coreMirrorInnerWeight * 0.18 + this.coreMirrorMembraneWeight * 0.42 - this.coreMirrorDeepWeight * 0.26',
  'const membraneSpread = 1 + this.coreMirrorMembraneWeight * 0.38 - this.coreMirrorDeepWeight * 0.16'
]) must(hub.includes(marker),`macro-readability marker missing: ${marker}`);
const method=hub.slice(hub.indexOf('updateCoreSpatialMirror(frameState, dt, runtimeSeconds)'),hub.indexOf('createState(active, routeIdentityReady = false)'));
must(!method.includes('.gate.position')&&!method.includes('routeVisuals.forEach'),"A1 may not move route gates/corridors");
must(profile.behavior.hubCoreSpatialMirrorMacroReadabilityRefined===true,"macro readability flag missing");
must(profile.behavior.hubCoreSpatialMirrorRadialZoneDominance===true,"radial dominance flag missing");
must(Math.abs(profile.behavior.hubCoreSpatialMirrorExactTelemetryInfluence-0.22)<0.0001,"telemetry influence mismatch");
must(contract.routeTopologyStable===true&&contract.movesRouteGates===false&&contract.movesRouteCorridors===false,"stable route contract missing");
must(contract.mapping.radial.includes('6.25')&&contract.mapping.directional.includes('0.22'),"A1 mapping contract mismatch");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC026A1] Deep / Inner / Membrane macro radial separation PASS');
console.log('[HC026A1] zone-dependent retained echo silhouette scaling PASS');
console.log('[HC026A1] exact XYZ reduced to secondary directional bend PASS');
console.log('[HC026A1] route gates/corridors/progression remain fixed PASS');
