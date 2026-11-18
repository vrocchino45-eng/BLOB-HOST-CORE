# HC027C1 Build Report — Playtest Audio Reliability Hotfix

Parent: HC027C Radial Power / Endurance Performance Law

## Why this pass exists
The 19:18 HC027C playtest recording contained a stereo audio stream but its captured program audio was effectively digital silence (roughly -91 dB average / -90 dB maximum). The run also showed that a controller-only play session can proceed without an obvious Web Audio unlock gesture.

HC027C1 removes that ambiguity before any further gameplay/physiology work.

## Pass mode
Hotfix / playtest observability

## Allowed scope
- make Web Audio lock state prominent and unmistakable
- provide a dedicated click target that requests audio unlock without firing a gameplay pulse
- retain keyboard/pointer/touch browser-unlock paths
- play a short confirmation triad immediately after successful unlock
- lift procedural audio to a practical playtest level
- reduce excessive near-field spatial attenuation
- expose audio state in playtest telemetry
- document an external-browser playtest procedure

## Forbidden scope
- movement changes
- radial performance changes
- Core Work changes
- 3 -> 6 -> 12 engine changes
- route/progression/content changes
- new music or external audio assets
- claiming gamepad input can bypass browser autoplay policy

## Implementation
### Audio lock gate
`PlaytestHudSystem` now owns a high-visibility bottom-screen banner while `frameState.hostAudio.unlocked` is false:

`AUDIO LOCKED — CLICK HERE OR PRESS A KEY ONCE`

Clicking the banner dispatches an explicit audio-unlock request while suppressing the click from becoming a gameplay mouse pulse.

The banner remains visible even if the ordinary playtest HUD/debug presentation is changed.

### Confirmation triad
Once `AudioContext.state === "running"`, `EventAnchoredHostAudioSystem` plays a direct non-spatial 220 / 330 / 440 Hz confirmation triad exactly once and records `audio_unlock_confirmation`.

The purpose is diagnostic: if the banner disappears but the triad cannot be heard, the player immediately knows the remaining problem is browser/OS/capture routing rather than game progression.

### Practical mix revision
- master gain: 0.16 -> 0.52
- panner reference distance: 1.2 -> 2.4
- panner rolloff: 1.05 -> 0.72
- panner max distance: 28 -> 34
- Core engine inspection phase gain: 0.010–0.017 -> 0.030–0.045
- Core engine world-cycle gain: 0.012–0.018 -> 0.028–0.040

This is an audibility pass, not final sound design or mastering.

## Browser-policy truth
Gamepad-only Web Audio unlock is **not guaranteed**. The build does not pretend otherwise. For reliable testing, use an external Chrome/Edge window and click the audio banner once before controller-only play.

## Validation
- HC027C1 focused validator PASS
- HC027A/B/C inheritance PASS
- full HC023 -> HC027C1 inherited regression chain: 31 / 31 PASS
- 91 active JS modules syntax PASS
- 306 public JSON files parse PASS
- RecipeDataSystem load PASS
- undefined-this-method audit PASS
- HC023A platform audit PASS
- HC023D dynamic import/source graph audit PASS

## Environment limitation
A complete Vite production bundle was not executed because this handoff environment does not contain a complete `node_modules`. An `npm ci` attempt did not complete; the partial install was removed before packaging.

## Next decision
Do **not** record another long gameplay session first. Run a 30–60 second external-browser check:
1. confirm the AUDIO LOCKED banner appears
2. click it once
3. confirm the banner disappears
4. confirm the three-note unlock triad is audible
5. trigger a few obvious game sounds
6. make a short recording and verify it contains those sounds

Only after that should the next substantial pass move into HC027D Core Physiology Perception.
