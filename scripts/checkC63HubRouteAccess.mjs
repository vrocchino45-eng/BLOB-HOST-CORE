import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../src/morph/LocalCellBoundaryMorphSystem.js', import.meta.url), 'utf8');
assert.match(source, /case "hub_post_grave_route_entry":\s*return this\.hubEntryReadiness\(recipe, frameState, \{\s*requireGraveReturn: false/);
assert.match(source, /foundationReady\s*&&\s*prerequisites\s*&&\s*destinationPrepared\s*&&\s*distance <= recipe\.interactionRange/);
assert.match(source, /if \(recipe\.id === "hub_to_vascular" \|\| recipe\.id === "hub_to_silt"\) \{\s*\/\/ C63:[\s\S]*?return Boolean\(frameState\.hubChamberFoundation\?\.active && readiness\.destinationPrepared\);/);
assert.match(source, /history\.graveReturned && history\.vascularReturned && history\.siltReturned/);
assert.match(source, /wakeCondition: "hubActiveAndDestinationPrepared"/);
console.log('C63 static route contract: PASS (5 assertions)');
