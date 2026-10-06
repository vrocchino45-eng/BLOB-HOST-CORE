# HC-031W2A1 — Cost Reduction Patch Apply

## Base required
Apply this overlay to the same HC-031W1 project that already has the HC-031W2A Frame Truth patch installed and verified in telemetry.

The player-facing build label intentionally remains `HC-031W1`. Frame Truth remains diagnostic-only and now reports `optimizationPass: "HC-031W2A1"`.

## Apply
1. Make a backup of the working project.
2. Extract this ZIP directly over the project root and allow these files to overwrite their existing versions.
3. From the project root run:

```powershell
node scripts/validateHC031W2A1CostReduction.mjs
node scripts/smokeHC031W1StabilizedAimLocalContact.mjs
node scripts/validateHC031W2AFrameTruth.mjs
```

Expected final lines:

```text
HC031W2A1 cost reduction: contour budget, surface broad phase, telemetry cadence, profiler cooldown PASS
HC031W1 stabilized aim + local contact smoke PASS
HC031W2A Frame Truth: 25 observer/export/ownership assertions PASS
```

4. Stop Vite, restart it, open a new game tab, and hard-refresh once.

## Focused proof run
Do one 2–3 minute Surface Wake run. Use Pulse repeatedly around several nearby objects and spend some time attaching/travelling on authored surfaces. No screen recording is required for the first proof.

Export with `Shift+T`.

The JSON Frame Truth windows now expose these extra fields under `lastRendererInfo`:
- `pulseContours`
- `pulseContourSegments`
- `surfaceCandidates`
- `surfaceBroadPhaseCandidates`

## Acceptance direction
- Pulse contour segments stay at or below 2,160 by construction (3 contours × 4 meshes × 180 segments).
- Repeated Pulse on the same noun refreshes one contour instead of stacking duplicates.
- Surface contact/attachment behavior remains unchanged while distant authored surfaces are rejected before raycasting.
- Focused 10-second windows should trend toward >= 30 callbacks/s and >= 0.95 sim/wall where the scene is not otherwise overloaded.
- Total renderer line count should no longer jump into the prior 10k–20k range because of pulse contour stacking. If it still does, Frame Truth will now show whether pulse contours were responsible.

## Locked / unchanged
- 50 ms simulation delta cap
- controller mappings
- movement authority
- attachment rules and mechanical eligibility thresholds
- targeting/attention rules
- ecology and progression
- HC027D1 audio reference
- region content and camera behavior
