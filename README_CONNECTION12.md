# CONNECTION12 — fresh Pulse events for local tissue

Install after CONNECTION11. This changes one production event check and adds regression coverage; existing regional mechanics and controls are retained.

Extract into the project root, then:

```powershell
node .\APPLY_CONNECTION12.mjs
```

Reload the game. The guarded installer refuses unrelated later edits and stores originals in CONNECTION12_BACKUP. It supports `--check` and `--restore`.

Run the expanded bots with the existing browser-test setup:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --all
```

L01 covers four-region owner boundaries; L02 covers actual InputSystem delivery and a controlled Vascular remount/Core Work sequence. Read CONNECTION12_REPORT.md and CONNECTION12_VALIDATION.md for measurements, fixtures and results. No recording is required.
