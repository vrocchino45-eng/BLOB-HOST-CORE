# HC027K1 Build Report — Playtest Input Instrumentation + Hot Button Reference

## Mode
Debug instrumentation / convergence support.

## Purpose
Make the accumulated debug hot buttons discoverable inside the running build and make physical button/keystroke use visible in recorded F1 debug footage without changing canonical controls or gameplay behavior.

## Implemented
- Added a live `frameState.inputTelemetry` stream in `InputSystem` containing active physical inputs, interpreted canonical actions, Pulse hold/charge/release state, trigger/stick activity, and a short press/release history.
- Added an upper-right **INPUT LIVE // HC027K1** panel that appears only in **F1 Full** debug mode. It remains separate from the long legacy diagnostic column so input evidence cannot be lost below the viewport.
- Expanded **Status Page → Controls** with permanent hot-button sections for debug display, Shift+1..8 focused test platforms, Ctrl+1..8 legacy direct jumps, Ctrl+Shift+8 Signal Plain reset, `P` Core Work anatomy seed/reset, and `O` 3→6→12 engine cycling.
- Added hot-button catalog metadata to `DebugAreaJumpSystem`; this metadata is display-only and has no route/progression authority.

## Gameplay locks
HC027K consequence chaining, HC027J2 physiology, HC027J1 verb hierarchy, quick Pulse 4.25 local/actionable range, movement, chemistry, HC027D1 audio reference, and the 3→6→12 Core engine are unchanged.

## Source scope
Only five source files differ from HC027K:
1. `src/main.js` — build identity only.
2. `src/input/InputSystem.js` — read-only input telemetry.
3. `src/debug/DebugAreaJumpSystem.js` — hot-button catalog metadata.
4. `src/debug/RecipeDebugOverlay.js` — F1 live input presentation.
5. `src/ui/StatusPageSystem.js` — Controls-page reference presentation.

No gameplay/world/route/chemistry/physiology/audio source owner changed.

## Validation
- HC027K1 focused contract: PASS.
- HC027K parent consequence contract: PASS.
- Representative canonical keyboard input equivalence against HC027K: PASS for move+boost, quick Pulse, charged Pulse, Stabilize, interact, and Shift+8.
- Canonical gamepad input equivalence against HC027K: PASS across 53 simulated frames including sticks, held/released X, RT, LT, A, and Y.
- Runtime telemetry simulation: PASS; Shift+8, charged X hold/release, physical history and interpreted actions publish correctly.
- Status Controls shortcut render proof: PASS for F1/F2/F3, Shift+1/8, Ctrl+1/8, Ctrl+Shift+8, P and O.
- RecipeDataSystem load: PASS.
- Undefined `this.method()` audit: PASS.
- Source syntax: 92/92 JS modules PASS.
- Public JSON parse: 332/332 PASS.
- Locked gameplay-owner hash proof: 9/9 unchanged (physiology, sensory/Pulse, engine, movement, Signal Plain, Host material, composition hierarchy, audio, Bond).
- Production Vite bundle: not run because `node_modules/vite/bin/vite.js` is absent from the handoff environment.

## Next
Use F1 during the next HC027K/J2 playtest so recordings show exact button use. Once the input trace is confirmed readable, proceed to HC027L First 8-Minute Rhythm Lock rather than adding another gameplay system.
