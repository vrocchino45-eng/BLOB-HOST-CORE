# HC028A1 Contact Surface Coverage Audit

Runtime source changes versus HC028A are limited to SessionTelemetrySystem, RecipeDebugOverlay, StatusPageSystem, build identity in main.js, DebugDisplay build identity, and DebugAreaJump hot-button wording. Golden gameplay owners are unchanged and hash-locked.

---

# HC028A Contact Surface / Scope Audit

Parent: `HC027L1_RHYTHM_COMPRESSION_GRAMMAR_REINFORCEMENT`

## Source changes

Exactly one new runtime source module was added:

- `src/core/SessionTelemetrySystem.js`

Existing source files changed only to mount or present telemetry:

- `src/core/GameRuntime.js` — import/create/register the read-only observer last in the runtime stack.
- `src/debug/DebugAreaJumpSystem.js` — list Shift+T / Shift+M in the existing hot-button catalog.
- `src/debug/DebugDisplaySystem.js` — successor pass identity only.
- `src/debug/RecipeDebugOverlay.js` — F1 recorder status/counts.
- `src/ui/StatusPageSystem.js` — add the Telemetry tab/readout.
- `src/main.js` — HC028A build identity.

No Golden Inquiry gameplay owner was edited.

## Frozen gameplay-owner hash proof

`public/data/build/hc028aLockedGoldenInquiryHashes.json` confirms byte-identical HC027L1 content for audio, physiology, input, Bond/Absorb, movement, engine, Core embodiment, sonar, verb physicalization, interaction rhythm, ambient material grammar, Signal Plain, and Vascular grammar owners.

## Authority boundaries

Session telemetry may:

- observe `frameState` after the gameplay stack resolves;
- publish `frameState.sessionTelemetry`;
- keep bounded in-memory history;
- autosave/export JSON locally;
- expose development-only summary/API surfaces.

Session telemetry may not:

- mutate canonical input;
- move the player or world;
- alter chemistry/Bond results;
- create targets/objectives/waypoints/routes;
- alter progression or saves;
- rebalance physiology, verbs, sonar or audio;
- change presentation hierarchy or camera behavior.

## Data firewall

Agent-facing records are isolated under event `percept` payloads. Authored IDs, material/response class truth, structural interpretation IDs, and semantic relationship/condition names remain under `developer` / `developerTruth`.

HC028C must still audit this boundary before any blind agent is given the percept stream.
