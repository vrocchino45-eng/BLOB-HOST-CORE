# HC027K1 Focused Playtest — Input Trace + Hot Buttons

## Setup
1. Start the build normally and enable audio as usual.
2. Press `Tab` and open **Controls**. Scroll down to confirm the Hot Buttons sections are visible.
3. Close Status.
4. Press `F1` to enter Full debug mode. An **INPUT LIVE // HC027K1** panel should appear at the upper-right.

## 60–90 second proof
- Move with WASD or controller Left Stick. `PHYSICAL` should show the actual input and `ACTION` should show MOVE.
- Hold X for roughly one second. The panel should show Pulse hold time, commitment state and charge percentage changing live.
- Release X. `ACTION` should briefly read a QUICK or CHARGED Pulse release and `RECENT PHYSICAL EVENTS` should retain the X press/release long enough to be readable in a recording.
- Hold RT and LT separately. Exact trigger values and ABSORB/STABILIZE interpretation should be visible.
- Press `Shift+8`. The input history should show the chord and the runtime should move to the Signal Plain test platform as before.
- Press `P` and `O` once each if desired; the trace should identify the debug action without granting progression.

## Acceptance
PASS if a video allows another reviewer to answer all of these without guessing:
- Which physical control was pressed or held?
- Did the runtime receive it?
- What canonical action did it become?
- For Pulse, how long was it held and was the release quick or charged?
- For RT/LT, how strongly was the trigger held?
- Which debug jump/tool shortcut was used?

## Failure scope
If the trace is unreadable, adjust only the debug presentation/history duration. Do not remap controls, change Pulse thresholds, alter trigger dead zones, rebalance verbs, or alter gameplay to make the telemetry look better.
