# BLOB — D11S / GSL-4 convergence checkpoint

## D11S: read-only D11R receipt audit

- Reconstructed runs: **15**.
- Recorded deliberate releases: **9**.
- Runs with zero simultaneous *modeled* away/hold gate frames: **15**.
- These modeled gates cannot be treated as the authoritative owner decision: successful detachments also lack modeled overlap.
- D11R includes controls and natural candidates; do not equate all reconstructed runs with valid release candidates.
- Preserve the Feather failure and verify the missing D11O trial in the next source-backed forensic comparison.
- **No gameplay repair is authorized by this evidence alone.** Inspect authoritative movement-owner conditions in the current repository before D11S implementation.

## GSL-4: isolated continuous expression lab

- Continuous position and velocity between cue windows, including idle drift.
- Side-by-side mode selector for a GSL-3-style instant-target reference (approximation, not pixel-identical original).
- Scrubbable, deterministic 4.7-second playback and telemetry JSON export.
- Preserves GSL-1 seven light pulse intervals; no audio output and no gameplay hook.
- Evaluate visible continuity, movement silhouettes and readability via a short MP4 plus exported telemetry.

## Exact Windows commands

```powershell
cd "$HOME\Documents\GitHub\BLOB-HOST-CORE"
Expand-Archive -LiteralPath ".\BLOB_D11S_GSL4_PARALLEL_LAB.zip" -DestinationPath "." -Force
Start-Process ".\GSL4_CONTINUOUS_GUIDE_LAB.html"
```

Play, scrub, select either mode, then press **Export telemetry JSON**. Upload the JSON and a short MP4 if the motion needs evaluation. No D11S browser rerun is required.
