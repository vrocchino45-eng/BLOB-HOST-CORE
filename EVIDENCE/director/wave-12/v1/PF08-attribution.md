# PF08-A1 Registry and rendering isolation

Exact IN02. Four native workloads with control → diagnostic → control at 768×432. Each bracket scored 24 frames after warm-up. All 72 attached frames used the native owner on the Silt entry sediment shelf.

| Workload | Bracket | Frame p50/p95 | Registry p50 | Render CPU/GPU p50 | Matrix p50 | Hidden matrix calls | Admitted/discarded ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Surface Wake | control-1 | 128.20 / 153.90 | 55.60 | 62.10 / 47.90 | 1.80 | — | 3139.90 / 7.90 |
| Surface Wake | diagnostic | 168.00 / 337.50 | 67.60 | 80.70 / 66.55 | 3.70 | 718.00 | 3532.60 / 1124.60 |
| Surface Wake | control-2 | 131.20 / 201.10 | 55.60 | 63.50 / 50.45 | 1.80 | — | 3172.40 / 119.70 |
| Silt Shelf | control-1 | 176.60 / 215.10 | 58.10 | 102.60 / 89.81 | 2.50 | — | 3598.10 / 735.20 |
| Silt Shelf | diagnostic | 161.80 / 204.40 | 53.20 | 98.80 / 85.32 | 4.10 | 666.00 | 3575.90 / 524.10 |
| Silt Shelf | control-2 | 182.30 / 263.20 | 57.80 | 109.80 / 97.36 | 2.50 | — | 3600.00 / 1140.50 |
| Core Work | control-1 | 155.70 / 196.70 | 50.20 | 90.10 / 77.92 | 2.60 | — | 3510.80 / 364.80 |
| Core Work | diagnostic | 193.70 / 254.00 | 59.00 | 116.70 / 90.16 | 5.70 | 699.00 | 3600.00 / 1288.30 |
| Core Work | control-2 | 142.90 / 178.70 | 46.40 | 84.30 / 72.25 | 2.50 | — | 3424.80 / 165.90 |
| Attached surface | control-1 | 213.50 / 294.50 | 70.20 | 128.40 / 107.83 | 2.50 | — | 3600.00 / 1776.80 |
| Attached surface | diagnostic | 214.70 / 307.30 | 76.40 | 124.10 / 108.73 | 4.20 | 657.00 | 3600.00 / 1900.70 |
| Attached surface | control-2 | 180.20 / 204.20 | 61.80 | 104.00 / 92.32 | 2.30 | — | 3600.00 / 738.60 |

| Workload | Ineligible owner | Eligibility checks | Update calls | Total gate ms |
| --- | --- | ---: | ---: | ---: |
| Surface Wake | graveMemoryRouteSystem | 72 | 0 | 0.60 |
| Surface Wake | vascularRhythmRouteSystem | 72 | 0 | 0.40 |
| Surface Wake | siltPressureRouteSystem | 72 | 0 | 0.10 |
| Silt Shelf | graveMemoryRouteSystem | 72 | 0 | 2.50 |
| Silt Shelf | vascularRhythmRouteSystem | 72 | 0 | 0.60 |
| Core Work | graveMemoryRouteSystem | 72 | 0 | 1.50 |
| Core Work | vascularRhythmRouteSystem | 72 | 0 | 0.30 |
| Attached surface | graveMemoryRouteSystem | 72 | 0 | 0.60 |
| Attached surface | vascularRhythmRouteSystem | 72 | 0 | 0.60 |

The measured inactive owners skipped their updates. The largest measured hidden-root bracket per diagnostic run is below. Durations include descendants and instrumentation.
- Surface Wake — surface_wake_pressure_front_2 24 calls, 3.80 ms total, gathering_ground_watcher_001 24 calls, 3.40 ms total, grave_memory_watcher_001 24 calls, 2.80 ms total.
- Silt Shelf — host_contact_shelf_HC031I4 24 calls, 7.60 ms total, surface_wake_visual_embodiment_HC008C 24 calls, 3.30 ms total, surface_wake_layered_interaction_HC006E 24 calls, 2.30 ms total.
- Core Work — host_contact_shelf_HC031I4 24 calls, 11.30 ms total, grave_return_region_phase_2_HC031A 24 calls, 4.90 ms total, lift_field_readability_hc028g 24 calls, 4.00 ms total.
- Attached surface — host_contact_shelf_HC031I4 24 calls, 9.60 ms total, surface_wake_visual_embodiment_HC008C 24 calls, 4.60 ms total, vascular_relay_downstream_001 24 calls, 2.20 ms total.

The mixed registry/render finding in PF03–PF07 still holds. Hidden transforms are observable, but the aggregate matrix bracket is small next to registry and GPU time. CPU submission, GPU work, and simulation clocks overlap. Matrix and draw brackets are nested. Allocation and GC are sampled and host load varies. Timing wrappers add overhead. These short matched workloads provide no defensible single bottleneck.

Keep the scheduler, render pipeline and quality. Delete or disable no subsystem. Quarantine profiling hooks in the development harness. The smallest follow-up is one measured hidden subtree with verified absence of physics, targeting, culling and reactivation consumers. Compare redundant propagation in that subtree only, restore it, and verify reactivation and owner-state parity before deciding whether to change production.

[Probe](PF08-probe.mjs) · [Summary](PF08-summary.json) · [Raw](pf08/measurements.json)
