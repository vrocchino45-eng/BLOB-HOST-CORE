# BLOB BOT1-D11E — Natural Silt Attachment Audit

Limited gate: **PASS**

| Profile | Round | Eligible | Sealed | Plane | Attached | Max supported (ms) | Tangent (units) | Deliberate release | Classification |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| host_positive | 1 | 0 | 0 | 0 | 0 | 0 | 0.0 | False | HC_CONTROL_ATTACHMENT_OBSERVED |
| natural_reference | 1 | 7 | 37 | 38 | 39 | 4454 | 0.1749 | True | NATURAL_SILT_FULL_SEQUENCE_OBSERVED |
| natural_feather | 1 | 7 | 30 | 30 | 32 | 3322 | 0.1197 | True | NATURAL_SILT_FULL_SEQUENCE_OBSERVED |
| natural_brake | 1 | 27 | 13 | 12 | 14 | 1410 | 0.1002 | True | NATURAL_SILT_FULL_SEQUENCE_OBSERVED |
| away_control | 1 | 0 | 0 | 0 | 0 | 0 | 0.0 | False | AWAY_CONTROL_CLEAR |

**Interpretation:** Ordinary key actions start from the Silt debug entry. A momentary latch without same-surface tendril support does not pass. Surface visibility, HUD text and raycast eligibility alone never satisfy the test.

D11D changes remain experimental until natural approach, sustained support, tangential travel, and input-aligned release are reproducible.
