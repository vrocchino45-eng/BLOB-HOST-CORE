# BLOB GSL-4C Session Export Patch

This is a standalone lab, not a gameplay patch. No LS1 drivetrain changes.

Open `GSL4C_SESSION_EXPORT_LAB.html` in a browser. Choose a mode, Play to 4.7 seconds, and click **Save current run**. Repeat with other modes; saved runs persist while this page stays open, even when Reset or switching modes. Click **Export entire session JSON** once to download `GSL4C_FULL_SESSION.json`.

Alternatively click **Run all modes + save** to deterministically simulate all four modes immediately and append them to the session. You may mix automatic and manual tests. **Clear saved runs** discards the in-page session. Closing/reloading the page also discards it; export before closing.

The single JSON contains `schema`, `events`, `pulses`, `runCount`, and a `runs` array with mode, label, runId, and full sample telemetry for each saved run. The lab does not generate sound or control gameplay.
