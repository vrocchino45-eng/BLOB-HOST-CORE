BLOB GSL-4E2A SOURCE VERIFICATION (READ ONLY)

Place GSL4E2A_COLLECT.ps1 in the root of your local BLOB-HOST-CORE checkout.
Run from that directory in PowerShell:
  powershell -ExecutionPolicy Bypass -File .\GSL4E2A_COLLECT.ps1

Upload the generated BLOB_GSL4E2A_SOURCE_HANDOFF.zip.
The script copies only three required JS source files and optionally the telemetry source if present, plus a hash manifest. It does not modify any source files, git state, LS1 physics, or game runtime.
Review the ZIP before sharing if you have local proprietary edits.
