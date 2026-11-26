# PF05-A1 · Same-session transparency attribution

IN01 revision 2, 768×432, balanced Shelf pose, scripted LT/RT, ANGLE D3D11 on the NVIDIA GTX 1070 Ti. One browser context, fresh pages for matched release/owner state, and alternating native controls. Each case contributed 41 measured frames after warmup. The draw-only probe isolated exact objects from `SiltPressureRouteSystem.siltMotes`. Native visibility, choreography, timing and gameplay authority were untouched.

| Case | Draws | CPU render p50 ms | GPU p50 ms | Frame p50 / p95 ms | Discarded ms | Slices p50 | Registry p50 ms | Minor GC | Whole-host logical CPU busy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Control 1 | 395 | 76.4 | 69.37 | 126.3 / 193.5 | 282.4 | 3 | 38.7 | 10 | 70.6% |
| Motes isolated 1 | 349 | 94.3 | 78.41 | 151.5 / 215.0 | 681.2 | 3 | 46.2 | 11 | 88.0% |
| Control 2 | 395 | 60.3 | 52.54 | 90.6 / 183.4 | 150.2 | 2 | 24.4 | 10 | 75.4% |
| Motes isolated 2 | 349 | 70.4 | 60.84 | 119.7 / 157.6 | 105.5 | 3 | 38.8 | 10 | 86.6% |
| Control 3 | 395 | 59.5 | 55.48 | 90.8 / 216.9 | 368.7 | 2 | 22.9 | 9 | 79.3% |

Allocated objects were sampled at 262,144-byte intervals, including reclaimed objects. Samples were dominated by the renderer/native layer. Parent MinorGC spans overlap subordinate V8 operations. Net heap deltas ranged from approximately −10.1 MB to +4.9 MB, with no isolated allocation gain. Whole-host busy fractions capture both browser and background work and cannot attribute it to individual processes. Draw count decreased exactly 46 in both isolates, while submission/GPU medians worsened relative to both neighboring controls. Catch-up load and wall tails varied across cases. The whole render GPU stopwatch overlaps CPU measurement, and registry time contains child updates.

Exact pre/post-render snapshots agreed for the observed scope, including selection, pose, contact, reserve, custody, inventory and receipts. In the separate matched-frame images, the Core, shelf response and contour remained visible, with less scattered texture when the motes were omitted. The images support controlled comparison, without constituting human Experience acceptance.

This pass establishes draw attribution and does not establish a repeatable timing bottleneck. Defer batching and reuse. The smallest next performance investigation is quieter repeat measurement with same-process CPU attribution and the single scoped draw bracket. Preserve individual transform, tint, opacity and transparent ordering if a future batching hypothesis earns a gate.

[Raw matrix](PF05-matrix.json) · [Probe](PF05-measure.mjs) · [Exact-frame control](pf05-visual/control.png) · [Isolated image](pf05-visual/silt-motes.png) · [Visual timing and parity](pf05-visual/visual.json)
