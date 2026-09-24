# HC031I3 — Build Report

## HC031I2 evidence

The membrane-first landing passed. Residue was recognized for eight telemetry samples, but it never acquired authored suction, yield imprint, cohesion imprint, or a confirmed coherence trigger. The old generic residue grammar nevertheless labeled those proximity samples `amber_yield_hex`, conflating recognition with a real material event.

Spatial reconstruction showed the continuation residue wash remained left of the accepted positive-X/negative-Z membrane-to-scar travel line. The Core naturally continued away from it after scar.

## HC031I3 correction

- Residue A now occupies local `(1.58, 0.18, -2.92)` with scale `(1.48, 0.30, 0.88)`.
- Residue B now occupies local `(2.12, 0.14, -3.56)` with scale `(1.34, 0.28, 0.80)`.
- Both retain `profileId: "residue_weak"` and their existing profile values.
- Unsupported `cohere` produces an open, wavering attempt hex.
- Only attached `cohere` produces the closed confirmed hex and 1.2-second visual afterglow.
- Passive recognition publishes `amber_residue_proximity`, not yield.

This establishes honest visual causality: recognition is not attempt, attempt is not confirmation, and confirmation is not mechanical grace.
