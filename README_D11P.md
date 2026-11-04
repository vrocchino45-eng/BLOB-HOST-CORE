# D11P — D11O scorer compatibility correction (diagnostic only)

This replaces only `analyze_bot1d11o.py` and adds `test_bot1d11p.py`. It does not change runtime, input, physics, REC1, or existing result files.

The old D11O analyzer delegated to D11N→D11M, but D11M required a `release_observer_on` marker emitted by the D11M experiment, not D11O. D11P supplies that marker to a **deep copy of the trace used only by the legacy physical scorer**, then separately validates the original D11O revision, CAPTURED status and absence of errors. No original trace or receipt is rewritten.

Run:
```
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11p.py
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11o.py .\BOT1D11O_RESULTS
```

Verified against the uploaded 16-run D11O capture: matrix 16/16, captures 16/16, physical control passes 3/4, attached release 8/12, 12/12 preconditions, no geometry warnings. The Feather control did not pass; it is NOT silently waived. No live replay performed in this pass.

The above-threshold tangential C+A failure (run 16) remains `UNRELEASED_OTHER_GATE_OR_OWNER_REVIEW`: 0.63279 max owner-away intent vs 0.55285 minimum modeled threshold. A modeled threshold is not the sole release gate. Next diagnose actual hold state and owner refusal reason; do not change adhesion from this evidence alone.
