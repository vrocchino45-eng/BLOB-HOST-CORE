# PF02-A1 · Headed performance isolation

Runtime d6b9b8ad13539d3be507c465ea3bb9782c718c9a with the exact Wave 04 Director tooling overlay. Windows Edge reported ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Ti (0x00001B82) Direct3D11 vs_5_0 ps_5_0, D3D11). All arms start at the same scripted Silt Shelf pose, camera-facing, reserve and runtime flags at 768×432. Native experimental Flow is available in all arms. The ordinary arm uses the normal gameplay path with no bot or capture; the inert arm loads Director modules without invoking control. All arms use the same measurement probes.

Two fresh browser contexts per arm, each after 16 warm-up callbacks and with 31 analyzed intervals. Group order is repeated and foreground rendering is sequential. Active arms use the same LT/RT tape and exercise canonical selection, accepted delivery and release. Their gameplay workload differs from the two neutral arms.

| Condition | Interval p50 ms | Interval p90 ms | CPU frame ms | CPU render ms | Registry ms | GPU draw ms | Dropped simulation ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ordinary | 81.4 / 119.2 | 102.6 / 141.5 | 77.2 / 114.5 | 51.5 / 72.9 | 21.1 / 34.0 | 46.6 / 60.1 | 0.0 / 0.0 |
| director-inactive | 80.6 / 119.8 | 93.8 / 137.8 | 77.3 / 114.4 | 53.7 / 74.8 | 19.7 / 34.3 | 46.9 / 66.5 | 0.0 / 62.3 |
| bot | 119.4 / 132.4 | 160.9 / 176.8 | 113.8 / 127.3 | 69.5 / 80.4 | 40.8 / 43.7 | 64.4 / 69.4 | 113.1 / 246.2 |
| bot-telemetry | 134.5 / 125.8 | 161.7 / 150.6 | 126.7 / 120.0 | 79.4 / 73.5 | 42.7 / 41.6 | 71.4 / 65.2 | 156.3 / 54.9 |
| bot-telemetry-recording | 134.5 / 129.1 | 184.3 / 153.9 | 128.8 / 123.6 | 77.0 / 74.5 | 44.8 / 42.7 | 66.4 / 66.8 | 308.8 / 28.8 |

Inactive infrastructure was within 1 ms of the ordinary arm in each pair. Run-to-run variance was much larger. During active trials median CPU render submission was 69.5–80.4 ms and GPU draw was 64.4–71.4 ms. Registry work was 40.8–44.8 ms, including its child systems. Scene matrix traversal was about 2.1–2.2 ms, HUD 2.4–2.6 ms, and production telemetry 1.5–1.8 ms. Extra Director sampling measured about 0.8–1.0 ms in the instrumented arms. CPU and GPU measurements overlap.

The two matched telemetry-to-recording comparisons increased median intervals by 0.0 and 3.3 ms. Tail latency and lost wall time varied in both directions across repeats. Active-vs-neutral differences include visible Core and Flow work. The experiment supports render and registry cost as investigation targets. System-load variance and missing isolated shader timings prevent a causal assignment to recording, individual shaders, or telemetry.

The encoded witness matches native events to decoded markers. In repeat one canonical selection has a missing marker and several estimated delays are negative because a clock residual is larger than the event-to-draw delay. Repeat two gives 112.2 / 43.2 / 8.6 / 35.0 ms for selection, demand, accepted current and release. Signed residuals, missing markers, and the absence of an uninstrumented control prevent a real-time Experience claim. The media is usable for visual review.

The smallest justified follow-up is profiling active render passes and per-system registry times in a quieter repeated run. Batch or throttle Director-only telemetry only after controls show measurable overhead. Production simulation timing, feature defaults, camera, and renderer quality were left intact.

[Measurements](matrix.json) · [Event alignment](alignment.json) · [Probe](measure.mjs)
