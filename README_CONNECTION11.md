# CONNECTION11 — comparable source evidence

Harness-only delta for CONNECTION10; gameplay remains CONNECTION5. Extract into the project root, then:

```powershell
node .\APPLY_CONNECTION11.mjs
```

Compare your current gameplay files with the source tested here:

```powershell
node .\BLOB_BOT_SERIES1\compare-source.mjs --current .\CONNECTION11_EVIDENCE\quick\summary.json
```

Exit 0 means equivalent under the declared line-ending policy. Exit 1 lists differing paths; exit 2 means no valid comparable identity. This comparison is read-only. New bot summaries include the portable identity automatically; ordinary test commands remain unchanged.

The guarded installer checks the CONNECTION10 harness baseline, backs up originals and refuses unrelated later edits. Use `--check` to inspect or `--restore` to undo. Older gameplay/checkpoint numbers and reports are preserved.

Read CONNECTION11_REPORT.md for exact scope and validation. No gameplay test recording is requested.
