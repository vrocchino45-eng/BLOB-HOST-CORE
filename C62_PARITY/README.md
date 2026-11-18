# Connection 62 — Read-only local source parity

Clean extracted Connection 61: **9/9 provenance checks PASS** when running its embedded `runtime-test-v7.8/validate_later_checkpoint.py .`.

Original Windows gate result: **5/9 FAIL**, four mismatches in the active Windows working tree. The clean archive cannot prove why the local working tree differs.

## Windows instructions

1. Extract `BLOB-HOST-CORE-CONNECTION-61.zip` to a separate folder; do not overwrite your current project.
2. From PowerShell, run the commands below, replacing the two example paths:

```powershell
python "C:\path\to\compare_connection62.py" "C:\path\to\BLOB-HOST-CORE-CONNECTION-61" "C:\Users\vrocc_000\Documents\GitHub\BLOB-HOST-CORE"
```

3. Save or upload the JSON output. This script compares SHA-256 hashes of the four failed files, the movement controller, and the three provenance contracts. It does not change anything.
4. In the clean extracted root run `python runtime-test-v7.8/validate_later_checkpoint.py .` and in the active root run the same command. Compare the results.

Do not copy files over the active project or change historical contract hashes until the differences are classified. Connection 62 remains audit-only.
