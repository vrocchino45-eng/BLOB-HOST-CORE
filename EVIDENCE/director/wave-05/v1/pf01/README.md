# PF01-A1 headed performance audit

Measurement fixture uses Windows Edge headed at 768×432 on the Silt route after 24 warm-up callbacks. ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Ti (0x00001B82) Direct3D11 vs_5_0 ps_5_0, D3D11). Each arm starts at the same scripted Core pose and zero velocity with the same initial camera. Each arm has 31 analyzed callbacks. The development arm enables experimental RT Flow. The recording arms use Playwright video. The Shelf handoff uses its existing native canvas/audio recorder.

| Arm | Interval p50 ms | Interval p90 ms | CPU render p50 ms | Registry p50 ms | GPU draw p50 ms | HUD p50 ms | Telemetry p50 ms | Discarded ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ordinary-none | 86.800 | 107.300 | 56.800 | 23.500 | 46.651 | 1.300 | 0.800 | 0.000 |
| development-none | 65.800 | 82.800 | 41.400 | 16.900 | 37.916 | 1.000 | 0.600 | 0.000 |
| development-video | 76.400 | 98.900 | 48.300 | 21.700 | 42.356 | 1.400 | 0.900 | 0.000 |
| ordinary-video | 107.500 | 123.200 | 63.000 | 35.800 | 56.047 | 2.100 | 1.200 | 2.500 |

CPU render is measured around the native render submission. The GPU result comes from asynchronous WebGL disjoint timer queries. CPU and GPU work overlap. HUD and telemetry timings are part of registry work. The ordinary scene used 374 draws, 109,730 triangles and 19 program objects. The experimental scene used 376 draws, 109,802 triangles and 21 program objects. Program count does not isolate shader execution cost. The full distribution, simulated time, pose and camera are in [measurements.json](measurements.json).

The stable probe measured intervals below the prior 142–145 ms active-capture medians. Recording corresponded to 20.700 ms in the ordinary arm and 10.600 ms in the experimental arm relative to the same mode without recording. These are descriptive differences from one probe per arm. Continuous driver load, individual shader attribution and the prior active-capture browser/automation contribution remain unisolated. The registry and CPU renderer consumed substantial time even with recording disabled. See the natively reported catch-up substeps and discarded time in the matrix. Camera, HUD and telemetry medians were much smaller than render/registry.

The independent headed handoff aligned four native actions to decoded video. WebM acceptance lag measured 551.800 ms. 24 of 30 WebM markers decoded. This supports mechanical verification and visual review. The 100 ms threshold and real-time Experience acceptance remain open. [Frame mappings](../refinement/capture-mapping.json).

The neutral comparison is a measurement of the existing runtime. Global storage, source timing and rendering defaults were preserved.
