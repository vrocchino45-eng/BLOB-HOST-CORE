# HC027L — First 8-Minute Rhythm Lock — Build Report

## Mode
Convergence / feel lock. No new mechanics, abilities, regions, encounters, progression, objectives, gates, or content.

## Purpose
Treat the current HOST CORE stack as an eight-minute piece of gameplay instead of a collection of systems. Existing systems should take turns: the player acts, the Host answers, the answer gets readable time, the world re-emerges, and quiet travel keeps revealing spatial information without becoming a waypoint system.

## Implemented
- Added a 2.8-second **reorientation window** inside the existing `InteractionCompositionSystem` after a protected consequence beat resolves.
- Quiet travel now surfaces the existing Host material field in gentle cadence rather than holding one flat presentation level.
- After 7.5 seconds without a meaningful interaction/change, the same existing spatial field can receive progressively stronger presentation support. This creates no object, target, objective, route, or reward.
- Added debug-only rhythm-gap telemetry: age of last meaningful change, last meaningful event kind, soft spatial-support state, and an 18-second review warning.
- Reduced ordinary HUD authority during world-led beats (`consequence`, `reorient`, `discover`, `follow_answer`, `quiet`) so world behavior becomes primary.
- Removed the remaining nearest-receptor next-action wording from Signal Plain; the state now says `compare_local_rhythms`.
- Raised the runtime camera-breathing ceiling from 0.52 to 0.80 so the already-authored J1 committed-Pulse values can actually reach the camera. No camera control mapping changed.
- F1 Playtest Trace now includes `Rhythm: <beat> · gap <seconds> · steady/spatial support/REVIEW`.

## Rhythm contract
Target playtest length: 480 seconds.

Existing beat vocabulary:
`observe → move → manipulate → consequence → reorient → follow_answer → discover → transition`

Tuning values:
- reorientation window: 2.8 s
- quiet world notice begins: 0.9 s
- quiet world notice max: 0.24
- soft spatial support begins: 7.5 s
- debug review warning begins: 18 s
- desired maximum unchanged gameplay window: 60 s
- hard review window: 90 s

The 18-second warning is diagnostic only. It does not fire an event or create content.

## Visual hierarchy changes
- Core Work breathing room: 0.62
- charged Pulse breathing room: 0.62 → 0.78 by charge
- traveling Pulse breathing room: 0.58
- HC027K linked-condition breathing room: 0.56
- reorientation breathing room: 0.50
- runtime ceiling: 0.80
- world-led HUD instruction opacity: 0.50
- world-led HUD controls opacity: 0.42

## Locked byte-for-byte from HC027K1 HOTFIX2
- `src/input/InputSystem.js`
- `src/chemistry/BondSystem.js`
- `src/player/CoreSensoryResponseSystem.js`
- `src/player/CoreRadialPerformanceSystem.js`
- `src/player/CoreEngineSystem.js`
- `src/player/CoreVerbPhysicalizationSystem.js`
- `src/player/CoreEmbodimentSystem.js`
- `src/player/PlayerMovementController.js`
- `src/audio/EventAnchoredHostAudioSystem.js`
- `src/world/AmbientMaterialInteractionSystem.js`
- `src/ecology/EntitySystem.js`
- `src/ecology/OrbiterSystem.js`

Therefore the following remain locked: quick Pulse 4.25 actionable radius, J2 physiology, J1 verb power language, D1 audio reference, canonical controls, K relationship behavior, movement, chemistry, and 3→6→12.

## Source scope
92 source JS modules remain. No new source module was added. Gameplay-facing edits are limited to the existing presentation/camera/HUD/Signal Plain wording owners; additional changed files are build identity/debug labeling only.

## Validation
PASS:
- `validate:hc027l` dynamic rhythm proof
- `validate:hc027k` parent consequence relationship contract
- `validate:hc027k1-hotfix2` input HUD contract
- K1 HOTFIX2 runtime DOM smoke test
- RecipeData load
- undefined `this.method()` audit
- 92/92 source JS syntax
- 336/336 public JSON parse
- locked-owner SHA-256 parent comparison

Production Vite bundle remains untestable in this handoff because `node_modules/vite` is not included. The failure is `MODULE_NOT_FOUND` for the local Vite executable, not a source error.
