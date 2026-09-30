# HC031U2 Bot Convergence Report

Baseline: **HC-031U2 — Persistent Living Ecology + Encounter Pacing**

| Profile | 30s | 60s | 120s | Cycles | Memory | Ignored | Interrupted | Same-frame reactive |
|---|---:|---:|---:|---:|---|---:|---:|---:|
| normal_explorer | 6/6 | 6/6 | 6/6 | 2 | coherent | 0 | 0 | 0 |
| slow_observer | 2/6 | 2/6 | 2/6 | 0 | quiet_observer | 2 | 0 | 0 |
| aggressive_verb_user | 2/6 | 2/6 | 2/6 | 0 | guarded | 0 | 111 | 0 |
| boundary_traversal_stress | 1/6 | 1/6 | 1/6 | 0 | coherent | 0 | 64 | 0 |
| backtracker | 4/6 | 6/6 | 6/6 | 0 | coherent | 0 | 0 | 0 |
| chaotic_fixed_seed | 1/6 | 2/6 | 2/6 | 0 | guarded | 0 | 99 | 0 |

## Convergence read

- `normal_explorer` completes the first six reads and proves recurrence with two later response cycles.
- `slow_observer` can remain at the two ambient reads without being forced through reactive content.
- Aggressive / boundary / chaotic profiles produce interruptions rather than free completion.
- `backtracker` preserves first-read ecology state across leaving/returning and finishes later.
- No profile produces same-frame reactive completion.

The large interruption counts in stress profiles are deliberate harness pressure, not expected human pacing; the important result is that broken/unstable relationships do not award completion.
