# CONNECTION10 harness delta

This adds consequence-loop bot coverage to the accepted CONNECTION5 build. Gameplay is unchanged. CONNECTION6–9 were report/model checkpoints and require no installation.

Extract this archive into the project root. Apply with:

```powershell
node .\APPLY_CONNECTION10.mjs --check
node .\APPLY_CONNECTION10.mjs
```

The installer refuses unrelated harness versions or later edits. It keeps originals in CONNECTION10_BACKUP. Restore with `node .\APPLY_CONNECTION10.mjs --restore`.

Run the expanded suite using your existing browser-test setup:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --all
```

For focused checks, use `--case=C01` for the connected browser loop or `--case=C02` for owner attribution/saturation. The suite's README retains browser setup and environment options. No new dependency is required.

Read CONNECTION10_REPORT.md for ownership, fixtures and limitations. VALIDATION.md records final checks. EVIDENCE contains exact results. No playtest recording is requested for this harness-only change.
