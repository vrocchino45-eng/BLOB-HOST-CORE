# PF07-A1 · Scheduler and scene traversal

Twelve 24-frame trials ran on exact promoted IN02, at unchanged 768×432 resolution and one hardware renderer. Each scenario alternated ordinary control, a diagnostic that counts matrix calls and brackets transparent submission, then another control. This diagnoses cost locations and also introduces measurement overhead. It does not simulate an optimization. The native registry and simulation clocks remained in use.

| Scenario | Pass | Frame p50/p95 ms | Render CPU p50 | GPU p50 | Registry p50 | Scene matrix p50 | Hidden matrix calls p50 | Draws p50 | Attached frames | Admitted/discarded ms |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Surface Wake | control-1 | 166.2 / 252.3 | 78.2 | 66.2 | 70.6 | 2.0 | — | 288 | 0 | 3575.0 / 730.7 |
| Surface Wake | diagnostic | 159.8 / 220.8 | 79.7 | 64.6 | 65.1 | 3.2 | 718.0 | 288 | 0 | 3583.7 / 452.3 |
| Surface Wake | control-2 | 146.7 / 185.7 | 69.3 | 59.8 | 61.2 | 1.9 | — | 288 | 0 | 3451.6 / 212.1 |
| Silt Shelf | control-1 | 155.7 / 172.9 | 89.7 | 77.2 | 51.4 | 2.2 | — | 411 | 0 | 3567.4 / 202.2 |
| Silt Shelf | diagnostic | 155.8 / 204.4 | 96.5 | 81.1 | 51.6 | 3.6 | 666.0 | 411 | 0 | 3563.8 / 412.2 |
| Silt Shelf | control-2 | 147.3 / 169.1 | 85.5 | 75.7 | 48.9 | 2.1 | — | 412 | 0 | 3460.1 / 120.2 |
| Core Work | control-1 | 124.0 / 136.6 | 70.6 | 61.3 | 42.6 | 1.9 | — | 340 | 0 | 2978.8 / 0.0 |
| Core Work | diagnostic | 132.9 / 172.8 | 78.7 | 66.3 | 44.4 | 3.4 | 699.0 | 340 | 0 | 3268.3 / 88.1 |
| Core Work | control-2 | 118.2 / 136.3 | 67.3 | 58.2 | 39.9 | 2.1 | — | 340 | 0 | 2864.6 / 1.5 |
| Attached surface | control-1 | 169.0 / 200.2 | 91.8 | 83.0 | 62.9 | 2.2 | — | 422 | 24 | 3506.4 / 520.0 |
| Attached surface | diagnostic | 171.5 / 191.7 | 96.2 | 80.7 | 62.1 | 3.6 | 657.0 | 422 | 24 | 3572.4 / 502.0 |
| Attached surface | control-2 | 148.0 / 178.1 | 81.0 | 72.8 | 55.7 | 2.3 | — | 421 | 24 | 3437.0 / 161.1 |

The native owner accepted attachment on the authored Silt entry sediment shelf in all three brackets, with a low tangential stick input. The raw report records actual pose displacement and retained attachment. The initial pose and membrane layout are staged. This is a physical scheduler workload, not a player acceptance claim.

Hidden nodes do receive hundreds of matrix calls in the diagnostic frames. Ordinary whole-scene matrix brackets were around two ms at p50, while registry execution and GPU elapsed time were substantially larger. Control repeats moved with high whole-host utilization. The measurements support a mixed scheduler/render workload, with little evidence that hidden matrix propagation alone dominates. GPU elapsed and CPU render submission overlap. Matrix timings are nested in render, and registry timings contain registered updates. Transparent CPU brackets and draw counts describe workload, and allocation/GC are sampled observations.

The smallest justified follow-up is to bracket one named inactive presentation subtree and one named active registry owner in the same captured attach/locomotion replay. A later isolation could skip a redundant presentation-only matrix update after proving that attachment, targeting, culling and later reactivation have identical inputs before and after. Defer scheduler changes and mote batching pending that test.

[Probe](PF07-probe.mjs) · [Raw matrix and native timing](pf07/measurements.json)
