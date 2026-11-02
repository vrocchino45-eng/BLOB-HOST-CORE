# BOT1-D11B Live Contact Evidence

This is an **owner-snapshot diagnostic**, not a blanket pass/fail for Silt mechanics.

| Profile | Verdict | Samples | Target attached samples | Observed transitions |
|---|---|---:|---:|---|
| host_positive | TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES | 26 | 0 | none |
| silt_short | TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES | 24 | 0 | none |
| silt_slow | TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES | 24 | 0 | none |
| silt_return | TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES | 23 | 0 | none |

**Interpretation:** no target latch observed = release untested, not movement failure.
The HUD `Contact attached` is visual language and never substitutes for `playerAttachment` owner evidence.
Short scripted approaches are exploratory. A negative result cannot prove Silt has no eligible surfaces.
See the JSON audit for cell scope, surface IDs, nearest shelf-center distances, and sampled transitions.
