# PF09 Single decorative leaf isolation

Exact IN03 at matched 768×432. Five alternating brackets per workload, 24 native frames each. Active cells and attached surface identities agree across brackets. Native runtime clocks, admitted simulation and movement remain unchanged by the probe.

| Workload | Bracket | Wall p50/p95 ms | Registry p50 | CPU/GPU p50 | Matrix p50 | Leaf probe p50 | Attempts/bypassed |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Surface Wake | control-1 | 71.00 / 92.80 | 26.50 | 38.00 / 32.83 | 1.50 | — | 0/0 |
| Surface Wake | diagnostic | 68.00 / 132.50 | 24.50 | 36.10 / 29.03 | 2.40 | 0.10 | 78/0 |
| Surface Wake | control-2 | 60.20 / 71.40 | 22.90 | 31.00 / 25.45 | 0.90 | — | 0/0 |
| Surface Wake | isolate | 69.10 / 123.50 | 23.80 | 35.10 / 32.37 | 1.70 | 0.10 | 78/0 |
| Surface Wake | control-3 | 65.70 / 84.50 | 23.70 | 33.20 / 28.33 | 0.80 | — | 0/0 |
| Silt Shelf | control-1 | 69.70 / 81.90 | 19.60 | 43.80 / 38.50 | 1.10 | — | 0/0 |
| Silt Shelf | diagnostic | 75.00 / 84.20 | 21.50 | 46.10 / 40.64 | 2.10 | 0.00 | 24/0 |
| Silt Shelf | control-2 | 70.90 / 89.80 | 21.00 | 43.70 / 39.06 | 1.20 | — | 0/0 |
| Silt Shelf | isolate | 114.90 / 188.70 | 38.30 | 57.20 / 44.50 | 2.60 | 0.00 | 24/24 |
| Silt Shelf | control-3 | 133.00 / 146.70 | 44.40 | 74.20 / 66.32 | 2.10 | — | 0/0 |
| Core Work | control-1 | 83.10 / 101.90 | 22.20 | 53.60 / 48.07 | 1.40 | — | 0/0 |
| Core Work | diagnostic | 66.20 / 71.90 | 18.60 | 40.10 / 34.70 | 2.30 | 0.10 | 24/0 |
| Core Work | control-2 | 60.40 / 66.90 | 18.50 | 35.00 / 32.50 | 1.20 | — | 0/0 |
| Core Work | isolate | 67.90 / 135.30 | 19.20 | 40.70 / 36.82 | 2.30 | 0.00 | 24/24 |
| Core Work | control-3 | 73.10 / 104.50 | 19.50 | 44.30 / 38.32 | 1.60 | — | 0/0 |
| Attached surface | control-1 | 97.00 / 151.50 | 32.30 | 62.80 / 51.48 | 2.00 | — | 0/0 |
| Attached surface | diagnostic | 90.50 / 129.80 | 29.40 | 51.40 / 46.02 | 2.30 | 0.00 | 24/0 |
| Attached surface | control-2 | 108.20 / 136.90 | 37.90 | 55.80 / 49.46 | 1.90 | — | 0/0 |
| Attached surface | isolate | 189.00 / 276.20 | 65.60 | 99.80 / 84.65 | 4.00 | 0.00 | 24/24 |
| Attached surface | control-3 | 152.80 / 522.20 | 59.30 | 82.00 / 75.75 | 2.10 | — | 0/0 |

Reverified the original 648 skipped ineligible calls. The new diagnostic and isolation brackets saw 464 and 534 ineligible owner checks with zero corresponding updates. Native substep counts may vary with admitted wall time. The 120 attached frames used the native shelf owner.

Only contact_shelf_non_crawlable_connective_lip was temporarily bypassed, and only with hidden parent visibility and identical prior local and parent transform inputs. Its source disables physical contact and targeting. The parent still owns authored physical surfaces. The normal call path ran after any input change or visibility return. The diagnostic verified zero world-matrix changes for equivalent leaf inputs.

72 redundant leaf calls were bypassed. Probe costs include transform signature checks. The first and last controls also vary with GPU, CPU and host load. Matrix, registry, GPU and CPU timing are nested or overlapping. Allocations and GC are samples. The comparison supports local redundant work, with no supported total frame-time gain.

Keep all runtime objects and disable or delete none. Keep only this scoped probe as audit tooling. A future correction would require a meaningful repeatable frame-time gain and separately verified visible/reactivation parity.

[Probe](PF09-probe.mjs) · [Raw data](pf09/measurements.json) · [Statistics](PF09-summary.json)
