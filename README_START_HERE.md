# BLOB: HOST CORE — HC-031W2A Frame Truth Kit (no-source audit)

**Purpose:** Find out whether browser animation-frame stalls correlate with the HC-031W1 slow-playback telemetry, without modifying the playable build. W2B visual changes are not included here.

## What's inside

- `w2a_browser_profiler.js`: single paste-in Chrome/Edge DevTools **Sources → Snippets** script. Adds `window.BLOB_W2A`, a passive browser observer. No game source edits, no game-input interception, no overlay, no telemetry-schema changes, no network calls.
- `w2a_compare.mjs`: optional Node.js console comparison of two JSON results; Node 18+.
- `smoke_test.mjs`: synthetic browser environment smoke test. `smoke_unrecorded.json` is synthetic **only** and must never be treated as real game measurement.

## First experiment: 2-minute A/B, same route

1. Open the actual HC-031W1 game in Chrome or Edge; use the same resolution, browser zoom, settings, and start/checkpoint for both runs. Do not add any extra debug HUD. In DevTools use **Sources → Snippets** to create a snippet containing the entire `w2a_browser_profiler.js`, and run it once. The Console should say `Installed`.
2. At the intended starting point, open Console and enter:
   ```js
   BLOB_W2A.arm({label:'surface_unrecorded',route:'Surface Wake: same 2-minute path',recording:false,delaySeconds:8,durationSeconds:120});
   ```
   Close DevTools promptly within the 8-second arming delay, leave the game tab visible/foreground, and play the chosen ~2-minute path naturally. The monitor stops automatically. Reopen DevTools **after** the auto-stop and enter `BLOB_W2A.download()` to download its read-only report.
3. Restore/reload the same starting state. Start video capture **before arming** the second run. Arm the same profiler with:
   ```js
   BLOB_W2A.arm({label:'surface_recorded',route:'Surface Wake: same 2-minute path',recording:true,delaySeconds:8,durationSeconds:120});
   ```
   Close DevTools promptly. Repeat the path with the same camera and approximate actions. After the monitor auto-stops, reopen DevTools and use `BLOB_W2A.download()` to save the second report. Stop recording once the run is complete. If practical, export the existing BLOB session telemetry for **each** run, not just video; it supplies internal simulation time which this browser observer cannot see.
4. Upload both `BLOB_W2A_*.json` reports (and corresponding BLOB session telemetry if available). They are tiny compared with full gameplay captures.

Optional local comparison:
```sh
node w2a_compare.mjs BLOB_W2A_surface_unrecorded.json BLOB_W2A_surface_recorded.json
```

If the Surface Wake A/B shows a large penalty, repeat later on one dense region (Hub/Comb) using the same method. Don't perform six long test runs at once; first learn whether capture is a factor.

## Interpretation: avoid an FPS false conclusion

- The profiler measures **independent browser `requestAnimationFrame` opportunities**, not BLOB's game update count, actual Canvas draw calls, simulation delta or recorded MP4 encoding FPS. Do not label `callbacksPerVisibleSecond` as game FPS.
- Its p50/p95/max interval and 10-second windows help locate bad browser frame scheduling. `PerformanceObserver` long-task entries (when the API is supported) provide additional main-thread evidence.
- The monitor tracks hidden and blurred time separately. A blurred window isn't necessarily throttled; hidden state usually matters more. An interval crossing hidden state is excluded from eligible visible samples.
- If browser rAF stalls in the same intervals as gameplay, examine render/main-thread work, browser throttling or recorder contention. If browser rAF stays healthy while gameplay telemetry advances simulation too slowly, inspect the game loop, paused state, delta cap, frame/update ownership and telemetry timestamp logic in the **matching HC-031W1 source**.
- Do **not** blindly remove the simulation dt cap: it may exist to protect numerical stability. Determine how dropped wall time is handled, especially during recording and background transitions.

## Locked / out of scope

No modifications to movement rates, camera/input mappings, audio HC027D1 reference, surface acquisition, targeting ownership, region routes, ecology, or procedural anatomy. No new content and no speculative renderer deletions. W2A remains audit-only until matched source and a controlled test identify a cause.

## Limitations

Running DevTools while playing could itself hurt frame scheduling; the 8-second arm period is intended for closing it before data collection. A diagnostic file is created only when `BLOB_W2A.download()` is invoked. If the browser reloads/navigation occurs during a run, this in-page observer resets; report that as a failed test instead of merging sessions. Device/window and Canvas dimensions are recorded only to compare test conditions. The standalone observer cannot determine whether BLOB's own update loop is being skipped.
