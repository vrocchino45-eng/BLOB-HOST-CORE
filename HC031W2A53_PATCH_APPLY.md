# HC-031W2A5.3 — Early Priming + Live Draw Attribution

## Apply target
Apply this patch **over HC-031W2A5.2**.

Do not apply it directly to HC-031W1 or to A5.1. A5.3 assumes the W2A1→A5.2 convergence chain is already present.

## What changes
- Keeps A4/A4.1 bounded simulation catch-up and work partition unchanged.
- Keeps A5.1 whole-root live-scene staging retired.
- Keeps A5.2 1×1 offscreen real-draw GPU priming.
- Moves Surface→Guide and Guide→Hub offscreen GPU priming **before** the older shader-only warmup jobs so the real upload path gets several additional seconds to finish before authored visibility.
- Adds passive pre-render attribution for prepared child renderables that cross from non-drawable to drawable. This never hides, delays, activates, or otherwise changes authored visibility.
- Frame Truth advances to `optimizationPass: "HC-031W2A5.3"`.

## Apply
Copy the contents of this patch folder into the project root and allow these listed files to overwrite the A5.2 versions. No files should be deleted.

Then restart Vite and hard-refresh/open a fresh tab.

## Focused test
Run about 90–120 seconds through:

Surface Wake → Scar Flow → Signal Chorus / Hub

Use Pulse and Stabilize, and attach/detach from a surface at least once. If convenient, exercise Stabilize + right-stick redirect once.

Export telemetry with **Shift+T**. No video is needed for this pass.

## A5.3 acceptance
Preferred close condition for W2A:
- Surface→Guide priming queue reaches 0 before the first prepared Guide children become live.
- Guide→Hub priming queue reaches 0 before the first prepared Hub children become live.
- First Scar / Hub transition windows >= 0.90 sim:wall; >= 0.95 preferred.
- Settled windows remain ~0.98–1.00 sim:wall.
- No unexplained >500 ms transition render; <250 ms preferred.
- No movement, input, targeting, contact, verb, route, chemistry, audio, or continuity regression.

If a >250 ms render remains, inspect `developerTruth.frameTruth.last40LongGaps[].previousLiveDrawAttribution`. It records the child renderables that became drawable on the preceding frame and whether each had already been GPU-primed.
