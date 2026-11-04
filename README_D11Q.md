# D11Q — Read-only release-owner forensic continuation

This pass examines the existing D11O recordings; it does not change gameplay, physics, recorder hooks, or prior result files. Extract to the BLOB-HOST-CORE root and run:

```powershell
Expand-Archive -LiteralPath ".\BLOB_BOT1_D11Q_OWNER_FORENSIC_DELTA.zip" -DestinationPath "." -Force
py .\D11Q_OWNER_GATE_FORENSIC.py .\BOT1D11O_RESULTS
```

The script writes `BOT1D11Q_FORENSIC.json` to the project root. Upload that file for further source inspection. D11O's four unreleased tangential cases have been independently re-read from uploaded raw traces. The two C+A cases show a modeled hold gate reached, but one (round 2) only briefly reached modeled away gate. The C+D cases never reached either modeled gate. Crucially, `ownerReleaseArmed` is false even in successful controls, so it is not a reliable refusal indicator by itself. No adhesion changes are justified. Feather remains a failed control.
