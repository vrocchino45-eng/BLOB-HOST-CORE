# GSL-4E2G — Offline observation contract, stage 1

**Read-only**. No repository source files are modified. Python 3 standard library only.

Run from your BLOB repository root (adjust JSON filename/path):

```powershell
py .\GSL4E2G_AUDIT.py .\BLOB_GSL4E2F_OBS1.json --out .\GSL4E2G_REPORT.json
```

This tests the **recorded** `gsl-guide-interpretation-change` payload for schema, owner consistency, disabled/core-work suppression, and coverage of LS1 events. `NOT_OBSERVED` means the capture did not exercise a case; it is **not** a pass. Event-count coverage does not prove transition timing or correct motion. A second stage must use the production Guide/LS1 runtime with controlled attachment inputs to test deterministic transitions, cooldown, and recovery timeout. No gameplay code changes in this package.
