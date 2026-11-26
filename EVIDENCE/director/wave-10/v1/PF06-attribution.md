# PF06-A1 · Renderer and scheduler attribution

Pinned IN01. Same headedness, nominal 768×432 viewport, native update loop, matched stage at each intervention, and control → 0.5 pixel ratio → control. Three scenarios and 24 measured frames per trial. Actual renderer: ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Ti (0x00001B82) Direct3D11 vs_5_0 ps_5_0, D3D11). The resolution intervention changes only drawing-buffer pixels in the disposable browser.

| Scene | Ratio | Buffer | Frame p50/p95 ms | CPU render p50 ms | GPU p50 ms | Registry p50 ms | Scene matrix p50 ms | Admitted/discarded ms | Draws p50 | Transparent draws p50 | Whole-host CPU |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| Surface Wake | 1 | 768×432 | 96.6 / 138.8 | 47.7 | 41.9 | 34.1 | 1.6 | 2401.3 / 8.8 | 279 | 274 | 89.5% |
| Surface Wake | 0.5 | 384×216 | 91.6 / 127.7 | 50.3 | 42.9 | 34.6 | 1.6 | 2467.3 / 12.7 | 279 | 274 | 88.0% |
| Surface Wake | 1 | 768×432 | 117.1 / 170.5 | 55.6 | 45.0 | 51.1 | 1.6 | 2823.5 / 26.9 | 279 | 274 | 91.8% |
| Silt Shelf | 1 | 768×432 | 183.4 / 897.7 | 115.3 | 95.1 | 60.4 | 2.1 | 3570.0 / 4687.5 | 411 | 400 | 94.9% |
| Silt Shelf | 0.5 | 384×216 | 167.9 / 876.9 | 103.7 | 81.2 | 52.9 | 2.5 | 3524.4 / 3950.2 | 411 | 400 | 100.0% |
| Silt Shelf | 1 | 768×432 | 178.4 / 228.1 | 106.4 | 93.4 | 57.9 | 2.3 | 3573.4 / 848.3 | 411 | 400 | 100.0% |
| Core Work | 1 | 768×432 | 127.4 / 155.5 | 72.5 | 63.4 | 41.7 | 2.2 | 3116.0 / 29.8 | 341 | 330 | 100.0% |
| Core Work | 0.5 | 384×216 | 127.8 / 155.7 | 75.1 | 63.6 | 40.3 | 2.2 | 3171.2 / 29.7 | 340 | 329 | 100.0% |
| Core Work | 1 | 768×432 | 143.6 / 205.3 | 76.8 | 64.1 | 45.2 | 2.2 | 3285.0 / 164.7 | 340 | 329 | 100.0% |

- Surface Wake — inconclusive fill sensitivity.
- Silt Shelf — GPU fill sensitivity with mixed frame cost.
- Core Work — inconclusive fill sensitivity.

Render submission contains scene matrix/traversal work. GPU elapsed is asynchronous and can overlap CPU submission. Registry totals contain their stepped child work. These categories cannot be summed. Hidden object counts show retained scene topology; the probe does not assign per-hidden-object cost. Heap samples and GC records are attribution indicators under common instrumentation. Whole-host load includes other processes. Pending and disjoint GPU queries do not produce zero-valued measurements.

The sampled Surface and Shelf starts stayed unattached. A matched attached-locomotion measurement remains open. Native simulation, authored materials and presentation visibility stayed intact. Frame-tail overlap across workloads and CPU load variation limit causal attribution. The smallest next optimization investigation is an isolated render-resolution and scheduler attribution replay on quieter hardware with fixed authored state. No batching change is justified by this pass.

[Raw samples](performance/measurements.json) · [Probe](PF06-probe.mjs)
