# HC027G1 Build Report — Eight-Minute Test Platform Harness

## Mode
Debug / playtest infrastructure only.

## Purpose
Reduce setup/travel overhead during short playtests by exposing eight deterministic, manually selected test contexts through keyboard shortcuts.

## Shortcut family
**Shift+1..8**

The existing Ctrl/Cmd+1..8 debug area jumps are preserved. Shift is preferred in a normal browser because Ctrl/Cmd+number is commonly claimed by browser tab navigation.

## Eight platforms
1. Orientation / Surface Wake
2. Pressure / Guide Threshold
3. Inquiry / Hub Core Work
4. Memory / Grave Reply
5. Flow / Vascular Physiology
6. Pressure / Silt Intake
7. Coherence / Comb Threshold
8. Open Inquiry / Signal Plain

Suggested use is roughly one minute per platform, but advancement is fully manual.

## Deterministic hygiene
Every platform jump:
- resolves before region mounting in the frame
- uses a canonical player start
- clears velocity, fluid slip and flow velocity
- returns camera from inspection/Core Work to world view
- clears transient Core sensory Pulse/echo/answer-memory state

Platform 3 and 5 seed the existing retained-anatomy debug Core Work setup. Platform 8 resets only the existing local Signal Plain encounter.

## Forbidden authority
The harness does not change:
- progression
- objectives
- route history
- gate state
- chemistry
- Core physiology
- engine resolution
- sonar range/timing
- material reply grammar
- audio mix

There is no automatic advance and no timer-driven teleport.

## Active source scope vs HC027G
Only these seven active source files changed:
- `src/core/GameRuntime.js`
- `src/debug/DebugAreaJumpSystem.js`
- `src/fields/SignalPlainEcologySystem.js`
- `src/input/InputSystem.js`
- `src/main.js`
- `src/player/CoreSensoryResponseSystem.js`
- `src/ui/PlaytestHudSystem.js`

No new active source module was added. Active JS module count remains **92**.

## Locked-source proof
- `src/audio/EventAnchoredHostAudioSystem.js` SHA-256 is identical to HC027G.
- `src/world/AmbientMaterialInteractionSystem.js` SHA-256 is identical to HC027G.

Therefore the approved HC027D1 listening level and HC027G material-reply behavior are not retuned in this checkpoint.

## Validation
- HC027G1 validator PASS
- HC027G, HC027F, HC027E, HC027D1, HC027D, HC027C1, HC027C, HC027B, HC027A PASS
- HC023A–HC026C1 inherited validators PASS
- RecipeDataSystem load PASS
- undefined `this.method()` audit PASS
- 92 JS modules syntax PASS
- 318 public JSON files parse PASS

## Next production step
After the harness is accepted, resume the planned **HC027H — Traversal Intention Architecture**. HC027G1 is not a substitute for that gameplay pass.
