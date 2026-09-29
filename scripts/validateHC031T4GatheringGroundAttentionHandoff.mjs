import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => fs.readFileSync(p, 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert = (ok, msg) => { if (!ok) throw new Error(`[HC031T4] ${msg}`); };

const adjacent = read('src/fields/ApertureAdjacentTerritorySystem.js');
const targeting = read('src/targeting/TargetingSystem.js');
const focus = read('src/targeting/TargetFocusRegistry.js');
const guide = read('src/guide/GuidePromptSystem.js');
const overlay = read('src/debug/RecipeDebugOverlay.js');
const hud = read('src/ui/PlaytestHudSystem.js');
const main = read('src/main.js');
const pkg = JSON.parse(read('package.json'));

assert(main.includes('buildId: "HC-031T4"'), 'main build ID must be HC-031T4');
assert(main.includes('buildLabel: "Gathering Ground Attention Handoff"'), 'main build label must identify the attention handoff');
assert(pkg.version === '0.31.45', 'package version must be 0.31.45');

assert(adjacent.includes('frameState.worldAttentionCandidates = {'), 'Gathering Ground must publish a world attention candidate provider');
assert(adjacent.includes('id: TERRITORY_ID'), 'world attention candidate must preserve the Gathering Ground semantic ID');
assert(adjacent.includes('focusRoots: this.acquisitionBodies.filter(Boolean)'), 'Gathering Ground must expose its visible body parts as focus roots');
assert(adjacent.includes('targetKind: "host_territory"'), 'Gathering Ground must identify as a Host territory, not a ChemObject');
assert(adjacent.includes('const attentionOwned = targeting.attentionTargetId === TERRITORY_ID'), 'adjacent interaction must recognize canonical attention ownership');
assert(adjacent.includes('const interactionAimed = Boolean(aimed || attentionOwned || relationshipOwned)'), 'Pulse/Stabilize must accept canonical attention ownership without hidden-center dependency');

assert(targeting.includes('getWorldAttentionCandidates()'), 'TargetingSystem must consume world attention candidates');
assert(targeting.includes('normalizeWorldAttentionCandidate(external)'), 'TargetingSystem must normalize non-ChemObject world nouns');
assert(targeting.includes('world-scale Host bodies can participate in the same aim-owned'), 'world-scale attention path must remain explicit and scoped');
assert(targeting.includes('targetScope: effective.externalAttention ? "macro_world" : "local_object"'), 'target state must distinguish macro world attention');
assert(targeting.includes('if (target.externalAttention) return "host_territory"'), 'external Host territory must have a canonical target kind');

assert(focus.includes('addAdjacentHostTerritoryFocus(focus, frameState)'), 'TargetFocusRegistry must provide the Aperture territory handoff');
assert(focus.includes('aperture_ridge_release_attention_handoff'), 'Ridge completion must author the attention handoff preference');
assert(guide.includes('Your attention has found Gathering Ground.'), 'Guide must acknowledge attention acquisition before asking for Pulse');
assert(guide.includes('no hidden point is required'), 'Guide must make body-scale acquisition explicit');
assert(overlay.includes('Gathering Ground · attention'), 'trace overlay must report the macro Host link instead of misleading none');
assert(hud.includes('" ATTN"'), 'playtest HUD must expose Gathering Ground attention ownership');

const locked = {
  'src/player/PlayerMovementController.js': '9c0542b4606fdfa3e9ef35e4bb8b6eafb4b1c86845a3ed594caed629fc913f4b',
  'src/fields/ApertureFieldsArrivalSystem.js': 'b854f1d79ab57b4df1efc4ea9e1f50b6518300299821e459984685593d7c240b',
  'src/fields/MembraneRidgeGameplaySystem.js': '6a0a7fb5a82f07477b53c2aa1717fa362a90b35c0c4467ec93a1abd0a6e572c1',
  'src/fields/SignalPlainEcologySystem.js': '27d2d083fa76939192030026db8eeb05227696c4f3762074bb36256e702a0783',
  'src/core/GameRuntime.js': '5779fa87ad5a238f18167577adb37589e93a5da8c0c1cad4f0a4f9d34623816a',
  'src/core/SessionTelemetrySystem.js': 'deefc0eca4a2b034a3510e2dd2c6ee5a2e30ad3f9808984c4ae41c4acaf9c8fa',
  'src/input/InputSystem.js': '5117dc831d6dcc5be0fd9f38fc58c6a8eb125dd6f30a34c910d6ea07e669c0f1',
  'src/chemistry/ChemObjectSystem.js': '36b50b3cbd7137fc6d7d6686795cec279e69b7200504f2bf040fe73a00a21e04',
  'src/player/CoreVerbPhysicalizationSystem.js': '83ebe369ab9f49529eb0f7637f3f84b2302ddfab3d988b26dea3412b4f6f8bcd'
};

for (const [path, expected] of Object.entries(locked)) {
  assert(fs.existsSync(path), `locked owner missing: ${path}`);
  assert(sha(path) === expected, `locked owner changed unexpectedly: ${path}`);
}

console.log('[HC031T4] PASS — Gathering Ground is now a world-scale aim-owned attention noun; Ridge/movement/input/chemistry owners remain locked.');
