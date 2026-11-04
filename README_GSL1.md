# GSL-1 — Synchronized Guide cue sheet (isolated)

Builds on the v0 Guide interpreter. Produces synchronized audio/light timing events and visual-only movement gesture windows from the same mock signal. **Does not generate or play audio, animate the Guide, change physics, or modify the HC027D1 mix.**

Run:
```
py .\BLOB_GUIDE_SIGNAL_LAB\test_gsl1.py
py .\BLOB_GUIDE_SIGNAL_LAB\gsl1_timeline.py .\GSL1_TIMELINE.json
```

`audio`/`light` share identical pulse start and duration; `movement_expression` has a matching semantic window. Fixed 140ms unit, 70ms inter-pulse gap are provisional design values, not calibrated game tempo. Event 5 intentional release is suppressed by the v0 interpreter. Integration remains gated on authentic, perceivable runtime events and HC027D1 level validation.
