# CONNECTION14 — connection-slice closeout

Full closeout: 23 cases, 301 summary checks, zero failures/blocks/skips. This package consolidates CONNECTION10–13; it introduces no new gameplay or harness behavior.

If CONNECTION13 is already installed, no update is needed. Keep this package for the complete results and consolidated recovery path.

Otherwise, extract into the project root and run:

```powershell
node .\APPLY_CONNECTION14.mjs --check
node .\APPLY_CONNECTION14.mjs
```

The installer recognizes complete affected-file states for CONNECTION5, 10, 11, 12 and 13, plus the CONNECTION5 Vascular anchor. It takes a recognized older state straight to CONNECTION13 harness / CONNECTION12 gameplay, without applying the intermediate installers. CONNECTION6–9 were report/model checkpoints and require no installation.

It rejects unrelated later edits before writing, preserves the exact starting checkpoint in CONNECTION14_BACKUP and supports `--restore`. Existing reports, other files and older installer backups are preserved. Interrupted CONNECTION14 applications can resume from their verified original/final mixture.

Recognition covers the affected paths and anchor, not every file in a customized project. Compare complete gameplay source with the tested manifest using:

```powershell
node .\BLOB_BOT_SERIES1\compare-source.mjs --current .\CONNECTION14_EVIDENCE\full-suite\summary.json
```

Normal tests remain:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --all
```

Read CONNECTION14_CLOSEOUT.md for what is verified and what remains open. No new gameplay recording is required by this delivery.
