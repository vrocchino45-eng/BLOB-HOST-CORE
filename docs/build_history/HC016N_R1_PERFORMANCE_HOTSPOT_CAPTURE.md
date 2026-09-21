# BLOB: HOST CORE — HC016N

## Mode
R1 PERFORMANCE HOTSPOT CAPTURE / NO GAMEPLAY CHANGE.

## Why this pass
The HC016M gameplay recording proves sustained runtime stability, but the updater timing text was not readable enough in the video to justify a targeted optimization.

HC016N does not guess.

## Capture changes
SystemRegistry now samples timing:
- periodically every 60 frames;
- immediately on frames where the observed frame gap is >= 45 ms.

A sampled hitch is classified using updater time as a share of the observed frame gap:
- `update_bound` — updater work is >= 55% of the gap;
- `mixed` — updater work is 30–55%;
- `non_update_bound` — updater work is <= 30%;
- `normal_sample` — no hitch threshold crossed.

The registry retains a rolling worst updater sample and its top systems.

## Debug HUD
Verbose debug now has a dedicated **PERFORMANCE CAPTURE HC016N** block showing:
- frame gap;
- updater sample milliseconds;
- updater share of the frame;
- hitch classification;
- worst sampled updater frame;
- top five updater systems with last/average/max timing;
- direct interpretation: UPDATER HOTSPOT vs LIKELY RENDER / ALLOCATION / GC.

This is intentionally large/readable so a phone photo or gameplay video can capture it.

## Acceptance test
Run the same route/debug-jump sequence that previously hit transition hitches. When a hitch occurs, open/leave the verbose debug HUD visible long enough to capture the performance block.

If classification is:
- **UPDATER HOTSPOT**: HC016O targets only the top measured system(s).
- **LIKELY RENDER / ALLOCATION / GC**: HC016O moves away from update-loop work and audits geometry/material creation, scene mounting, object churn, and disposal.
- **MIXED COST**: inspect both, starting with any >2 ms updater.

No gameplay, chemistry, route progression, camera behavior, or controls are intentionally changed in HC016N.
