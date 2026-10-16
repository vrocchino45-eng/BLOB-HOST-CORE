# BLOB: HOST CORE — LS1D1D2F Authority Observation + REC Indicator

**Apply only over the installed LS1D1D2E INPUT-EDGES observation recorder.**

## Replace
- `src/debug/WorldObjectCensusSystem.js` — complete replacement.

No other files are modified. Do not apply the old `LS1D1D2E_AUTHORITY_GUARD` experimental patch as part of this pass.

## Controls
- **Alt+Shift+R** once: start recording. Small upper-left **REC mm:ss** marker visible.
- Play normally. The shortcut is a toggle, not a held modifier.
- **Alt+Shift+R** again: stop. Brief **REC STOPPED** confirmation.
- **Alt+Shift+E**: request JSON download; brief confirmation. Save/upload `BLOB_LS1D1D2F_OBSERVATION.json`.
- F4 census display and F5 census export are unchanged.

## New read-only observations
- `game-pulse-event` from the game's canonical `frameState.input.pulseEventId`, with held Silt target identity at sample time.
- `game-absorb-started/ended` and `game-stabilize-started/ended` from game's published input state.
- `silt-pressure-read-committed`, `silt-unbound-pulse-count-increased`, `silt-porous-absorb-committed` from Silt route progression counters.
- `chemistry-absorption-committed` from global chemistry absorbed-object count, separately labeled with the chemistry target (not assumed to be a Silt grain).
- `silt-cycle-event-observed`, `silt-material-owner-changed`, `silt-safe-matter-flag-earned`, `silt-completion-committed` from material and progression snapshots.
- Timeline `summary` showing Pulse events / Absorb starts observed while a Silt grain was held.

## Truth boundaries
Read-only 150ms sample intervals can miss fast transitions. A published Pulse input event is **not** verified force delivered to a held grain. A chemistry or porous-packet absorption is **not** verified consumption of a held grain. The summary explicitly reports these unproven target-specific transactions as unconfirmed. No target routing, force, material transfer, ecology, Guide, traversal, or progression behavior changes.

## Validation
- `node --check src/debug/WorldObjectCensusSystem.js`: PASS.
- Simulated Node event/DOM harness: PASS (record indicator, canonical input/route events, material ownership, export and proof caveats).
- Full Vite + browser/gamepad runtime: NOT RUN (offline dependencies unavailable in the test environment).

## Next focused playtest
Capture a short session (about 1–3 minutes). Alt+Shift+R start -> stabilize a Silt grain -> A lock -> Pulse then Absorb while locked -> release -> Alt+Shift+R stop -> Alt+Shift+E export. Send JSON. Watch for `game-pulse-event`, `game-absorb-started`, and their target context; review separate route/chemistry outcome events without conflating them.
