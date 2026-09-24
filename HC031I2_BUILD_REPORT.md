# HC031I2 — Build Report

## Evidence

The HC031I1 run reached all ten authored surfaces with no blocked movement or errors. It sustained attachment for about 65 seconds, tendril locomotion for about 60 seconds, and surface-braced projection for about 35 seconds. Membrane and scar responses reached full imprint strength.

Two convergence findings remained:

- The measured camera-forward path was positive X / negative Z, so the X `4.0` landing entered scar truth before establishing the intended membrane-first teaching order.
- Residue attachment briefly handed off while Stabilize was held. Residue yielded, and coherence accumulated to `0.166`, but the telemetry sampler never captured `amber_hex_coherence`.

## Correction

- Shift+1 now lands at `(3.20, -0.40, -0.55)`. This remains above the central membrane while giving the diagonal forward path room before the scar priority volume.
- A valid residue `cohere` event records its surface and holds only the amber hex presentation for 1.2 seconds.
- The hold strength decays continuously and publishes its trigger count, remaining hold, and cue surface.

The hold is not input buffering or attachment grace. It does not feed any mechanic owner and cannot make an invalid interaction valid.
