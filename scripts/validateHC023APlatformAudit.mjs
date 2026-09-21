import fs from "node:fs";
const r=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const main=r("../src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const audit=JSON.parse(r("../public/data/build/hc023aCodePlatformAudit.json"));
const density=JSON.parse(r("../public/data/build/hc023aGameplayDensityMap.json"));
const must=(x,m)=>{if(!x)throw new Error(m)};
must(
  successorHC027C || main.includes('buildId: "HC-023A"')
    || main.includes('buildId: "HC-023B"')
    || main.includes('buildId: "HC-023C"')
    || main.includes('buildId: "HC-023D"')
    || main.includes('buildId: "HC-024A"') || main.includes('buildId: "HC-024B"') || main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"'),
  "HC023A platform or later compatible successor identity"
);
must(audit.unreachableSourceArchived.files===17,"expected unreachable archive count");
must(audit.activeSourceAfter.jsFiles===85,"active source count");
must(density.noNewRegions===true&&density.noNewPrimaryVerbs===true,"density scope");
must(density.totalExpectedEngagedMinutes+density.totalOptionalDiscoveryMinutes>=10,"density target");
must(density.expertReplayRule.includes("faster"),"replay compression rule");
console.log("[HC023A] platform audit PASS");
console.log("[HC023A] unreachable source archived PASS");
console.log("[HC023A] 10+ minute density map PASS");
console.log("[HC023A] no-new-region/no-new-verb scope PASS");
