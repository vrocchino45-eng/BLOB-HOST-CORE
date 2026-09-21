# HC-006HA Acceptance Tests

- [x] Build identity is HC-006HA / 0.0.89.
- [x] HOST CORE source rebaseline remains active.
- [x] X remains pulse and LT remains stabilize/resonance.
- [x] Guide Threshold alignment still requires movement, local direction, and corridor presence.
- [x] Guide Threshold sustain still requires movement plus held LT.
- [x] Releasing LT outside the settling-rib zone cannot complete.
- [x] Holding LT inside the settling-rib zone reports an explicit release blocker.
- [x] Releasing LT in the settling-rib zone latches the final settle.
- [x] Ambient drift after the latch cannot stop completion.
- [x] Re-holding LT pauses rather than resets the settle.
- [x] Expected action reports `release_stabilize` during the final stage.
- [x] Surface Wake regression passes.
- [x] Persistent camera regression passes.
- [x] Signal Chorus regressions pass.
- [x] Grave route and return regressions pass.
- [x] Recipe data and undefined-method audits pass.
- [x] Production build passes.
