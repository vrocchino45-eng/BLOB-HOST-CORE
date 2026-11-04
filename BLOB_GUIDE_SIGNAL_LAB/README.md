# BLOB Guide Signal Language v0 — isolated event lab

**No gameplay hook. No new Guide actor. No emitted audio. No movement authority.** This is a standalone mock interpreter for future Core–Host–Guide integration and cannot affect the D11O test.

It translates three `hc.perception.v0` **mock-perception** event types into a shared rhythmic semantic message with sound, light, and gesture expressions:

| Message | Event needed | Semantic rhythm | Expression |
|---|---|---|---|
| Stable support | real geometry-verified support, in a future integration | long | reassuring held tone/light + relaxed orbit |
| Unexpected support loss | prior confirmed support + NOT deliberate release | short-short-short | concerned falling chirps/flickers + recoil/return |
| Unfamiliar material | actually perceivable material not in remembered set | short-long | curious interval/light + investigation |

The rhythm is a proposed original codebook, not final canonical language. Personality changes delivery rather than meaning. Signals are duplicated through sound/light/movement to avoid relying on audio or color alone. De-duplication and intentional-vs-unexpected separation are tested. The mock cannot identify truly perceived material or honest geometry without future **verified game-event provenance**.

PowerShell usage after expanding ZIP into repo root:

```powershell
py .\BLOB_GUIDE_SIGNAL_LAB\test_guide_signal_lab.py
py .\BLOB_GUIDE_SIGNAL_LAB\guide_signal_lab.py .\GUIDE_SIGNAL_DEMO.json
```

Review JSON output. The mock deliberately emits no concerned signal for a deliberate release. Future integration should consume a shared read-only event snapshot, then animate/audio express it in OrbiterSystem or a narrowly owned Guide presentation system; it must never decide movement or contact truth.

**Forward-compatible design:** the Core's 3→6→12 phase engine can eventually influence expression depth; the first three Guide message meanings must stay stable and should not require unlocking twelve-phase Core controls. Environmental acclimation should affect which events become perceptible, not redefine the signal alphabet without explanation.
