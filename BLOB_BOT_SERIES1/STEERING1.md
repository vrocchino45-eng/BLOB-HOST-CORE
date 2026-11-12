# BOT-STEERING1 — stay at the receiver until the handoff completes

Extract into the BLOB-HOST-CORE project root and replace the included bot files. This overlay requires the existing Bot Series 1 suite with BOT-TIMING1 applied. It preserves the existing dependencies and reports. It changes no gameplay source files.

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --browser --case=B03
```

Upload the newly generated timestamped report folder as a ZIP.

## Why the previous patch was insufficient

The uploaded rerun reached within 1.19 units of the Vascular receiver but then stopped steering and held Stabilize. By timeout it had drifted 13.41 units away, with travel complete and settle progress zero. Only three navigation samples were obtained over 26.34 wall seconds. Increasing the receive timeout could not correct that drift. This is evidence of inadequate bot control, not a reason to change the goal's proximity rule.

## Changes and boundaries

The Vascular driver keeps aiming, braking and holding Stabilize until the actual handoff owner completes. The Hub-return driver also corrects course each real game tick. Both observe position and velocity and deliver synthetic DOM keyboard events through the existing InputSystem. They wrap the existing runtime tick during navigation only and call the original tick once per real frame; normal and error cleanup release all bot keys and restore the original method.

This is scripted keyboard-pipeline testing. It does not verify physical gamepad delivery or human feel. No game clock, player pose, velocity, normalized input, goal proof or credit result is written by the new steering driver. Earlier declared history/source/contact placement fixtures remain in B03. Goal assertions are retained. Navigation is bounded to 60 simulation seconds and 15 wall minutes, within the existing worker watchdog. Trace samples are capped at 1024 per leg.

## Validation

- Complete revised B03 passed locally in 74.3 seconds: Vascular fifth credit, Silt sixth credit/six-phase, mass 8, keyboard Hub return, reserve and Core Work checks. No browser errors; production files unchanged.
- A separate Vascular control passed with animation callbacks delayed by 2000 wall milliseconds and evaluation return values delayed by 8000 wall milliseconds during steering. It omitted only the initial Host-peak wait, preserved actual game time/physics and earned the fifth credit. This control does not cover the complete Silt/Hub arc under slow conditions.
- Isolated success/error lifecycle controls verified DOM key delivery, one original tick call per frame, key release and restoration. These controls are not gameplay evidence.

Your machine's corrected B03 remains pending. B01/B02 retain their earlier uploaded passes; they were not rerun here.
